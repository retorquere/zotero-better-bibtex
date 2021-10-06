Components.utils.import('resource://gre/modules/Services.jsm')

import { Preference } from '../gen/preferences'
import { Translators } from './translators'
import { log } from './logger'
import Zip from 'jszip'

import { DB } from './db/main'
import { DB as Cache } from './db/cache'
import { pick } from './file-picker'
import * as l10n from './l10n'

import * as s3 from './s3.json'

import * as PACKAGE from '../package.json'

const kB = 1024

export class ErrorReport {
  private previewSize = 3 * kB // eslint-disable-line no-magic-numbers, yoda

  private key: string
  private timestamp: string
  private bucket: string
  private params: any
  private globals: Record<string, any>
  private zipped: Uint8Array
  private cacheState: string

  private errorlog: {
    info: string
    errors: string
    debug: string
    references?: string
  }

  public async send(): Promise<void> {
    const wizard = this.globals.document.getElementById('better-bibtex-error-report')
    wizard.getButton('next').disabled = true
    wizard.getButton('cancel').disabled = true
    wizard.canRewind = false

    try {
      await fetch(`${this.bucket}/${this.key}-${this.timestamp}.zip`, {
        method: 'PUT',
        cache: 'no-cache',
        // followRedirects: true,
        // noCache: true,
        // foreground: true,
        headers: {
          'x-amz-storage-class': 'STANDARD',
          'x-amz-acl': 'bucket-owner-full-control',
          'Content-Type': 'application/zip',
        },
        redirect: 'follow',
        body: await this.zip(),
      })

      wizard.advance()

      this.globals.document.getElementById('better-bibtex-report-id').value = this.key
      this.globals.document.getElementById('better-bibtex-report-result').hidden = false
    }
    catch (err) {
      log.error('failed to submit', this.key, err)
      const ps = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService)
      ps.alert(null, Zotero.getString('general.error'), `${err} (${this.key}, references: ${!!this.errorlog.references})`)
      if (wizard.rewind) wizard.rewind()
    }
  }

  public show(): void {
    const wizard = this.globals.document.getElementById('better-bibtex-error-report')

    if (wizard.onLastPage) wizard.canRewind = false
    else if (wizard.pageIndex === 0) wizard.canRewind = false
    else if (wizard.pageIndex === 1 && Zotero.Debug.enabled) wizard.canRewind = false
    else wizard.canRewind = true
  }

  public restartWithDebugEnabled(): void {
    const ps = Services.prompt
    const buttonFlags = ps.BUTTON_POS_0 * ps.BUTTON_TITLE_IS_STRING
        + ps.BUTTON_POS_1 * ps.BUTTON_TITLE_CANCEL
        + ps.BUTTON_POS_2 * ps.BUTTON_TITLE_IS_STRING
    const index = ps.confirmEx(
      null,
      Zotero.getString('zotero.debugOutputLogging'),
      Zotero.getString('zotero.debugOutputLogging.enabledAfterRestart', [Zotero.clientName]),
      buttonFlags,
      Zotero.getString('general.restartNow'),
      null, Zotero.getString('general.restartLater'), null, {}
    )

    if (index !== 1) Zotero.Prefs.set('debug.store', true)

    if (index === 0) Zotero.Utilities.Internal.quit(true)
  }

  private async latest() {
    try {
      const latest = PACKAGE.xpi.releaseURL.replace('https://github.com/', 'https://api.github.com/repos/').replace(/\/releases\/.*/, '/releases/latest')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(await (await fetch(latest, { method: 'GET', cache: 'no-cache', redirect: 'follow' })).text()).tag_name.replace('v', '')
    }
    catch (err) {
      return null
    }
  }

  public async zip(): Promise<Uint8Array> {
    if (!this.zipped) {
      const zip = new Zip

      zip.file(`${this.key}/debug.txt`, [ this.errorlog.info, this.cacheState, this.errorlog.errors, this.errorlog.debug ].filter(chunk => chunk).join('\n\n'))

      if (this.errorlog.references) zip.file(`${this.key}/references.json`, this.errorlog.references)

      if (this.globals.document.getElementById('better-bibtex-error-report-include-db').checked) {
        zip.file(`${this.key}/database.json`, DB.serialize({ serializationMethod: 'pretty' }))
        zip.file(`${this.key}/cache.json`, Cache.serialize({ serializationMethod: 'pretty' }))
      }

      this.zipped = await zip.generateAsync({
        type: 'uint8array',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      })
    }
    return this.zipped
  }

  public async save(): Promise<void> {
    const filename = await pick('Logs', 'save', [['ZIP Archive (*.zip)', '*.zip']], `${this.key}.zip`)
    if (filename) await OS.File.writeAtomic(filename, await this.zip())
  }

  private async ping(region: string) {
    await fetch(`http://s3.${region}.amazonaws.com${s3.region[region].tld || ''}/ping`, {
      method: 'GET',
      cache: 'no-cache',
      redirect: 'follow',
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { region, ...s3.region[region] }
  }

  public async load(): Promise<void> {
    const wizard = this.globals.document.getElementById('better-bibtex-error-report')

    if (Zotero.Debug.enabled) wizard.pageIndex = 1

    const continueButton = wizard.getButton('next')
    continueButton.disabled = true

    this.params = this.globals.window.arguments[0].wrappedJSObject

    this.timestamp = (new Date()).toISOString().replace(/\..*/, '').replace(/:/g, '.')

    this.errorlog = {
      info: await this.info(),
      errors: Zotero.getErrors(true).join('\n'),
      // # 1896
      debug: Zotero.Debug.getConsoleViewerOutput().slice(-500000).join('\n'), // eslint-disable-line no-magic-numbers
    }

    if (Zotero.BetterBibTeX.ready && this.params.scope) {
      await Zotero.BetterBibTeX.ready
      this.errorlog.references = await Translators.exportItems(Translators.byLabel.BetterBibTeXJSON.translatorID, {exportNotes: true, dropAttachments: true, Normalize: true}, this.params.scope)
    }

    this.globals.document.getElementById('better-bibtex-error-context').value = this.errorlog.info
    this.globals.document.getElementById('better-bibtex-error-errors').value = this.errorlog.errors
    this.globals.document.getElementById('better-bibtex-error-debug').value = this.preview(this.errorlog.debug)
    if (this.errorlog.references) this.globals.document.getElementById('better-bibtex-error-references').value = this.preview(this.errorlog.references)
    this.globals.document.getElementById('better-bibtex-error-tab-references').hidden = !this.errorlog.references

    const current = require('../gen/version.js')
    this.globals.document.getElementById('better-bibtex-report-current').value = l10n.localize('ErrorReport.better-bibtex.current', { version: current })

    try {
      const latest = await this.latest()

      const show_latest = this.globals.document.getElementById('better-bibtex-report-latest')
      if (current === latest) {
        show_latest.hidden = true
      }
      else {
        show_latest.value = l10n.localize('ErrorReport.better-bibtex.latest', { version: latest || '<could not be established>' })
        show_latest.hidden = false
      }

      this.globals.document.getElementById('better-bibtex-report-cache').value = this.cacheState = l10n.localize('ErrorReport.better-bibtex.cache', Cache.state())

      const region = await Zotero.Promise.any(Object.keys(s3.region).map(this.ping.bind(this)))
      this.bucket = `http://${s3.bucket}-${region.short}.s3-${region.region}.amazonaws.com${region.tld || ''}`
      this.key = `${Zotero.Utilities.generateObjectKey()}${this.params.scope ? '-refs' : ''}-${region.short}`

      continueButton.disabled = false
      continueButton.focus()
    }
    catch (err) {
      alert(`No AWS region can be reached: ${err.message}`)
      wizard.getButton('cancel').disabled = false
    }
  }

  private preview(text: string): string {
    return text.length > this.previewSize ? `${text.substr(0, this.previewSize)} ...` : text
  }

  // general state of Zotero
  private async info() {
    let info = ''

    const appInfo = Components.classes['@mozilla.org/xre/app-info;1'].getService(Components.interfaces.nsIXULAppInfo)
    info += `Application: ${appInfo.name} ${appInfo.version} ${Zotero.locale}\n`
    info += `Platform: ${Zotero.platform} ${Zotero.oscpu}\n`

    const addons = await Zotero.getInstalledExtensions()
    if (addons.length) {
      info += 'Addons:\n'
      for (const addon of addons) {
        info += `  ${addon}\n`
      }
    }

    info += 'Settings:\n'
    for (const [key, value] of Object.entries(Preference.all)) {
      info += `  ${key} = ${JSON.stringify(value)}\n`
    }
    for (const key of ['export.quickCopy.setting']) {
      info += `  Zotero: ${key} = ${JSON.stringify(Zotero.Prefs.get(key))}\n`
    }
    info += `Zotero.Debug.enabled: ${Zotero.Debug.enabled}\n`
    info += `Zotero.Debug.enabled at start: ${Zotero.BetterBibTeX.debugEnabledAtStart}\n`

    info += `LocaleDateOrder: ${Zotero.Date.getLocaleDateOrder()}\n`

    info += `Total export workers started: ${Translators.workers.total}, currently running: ${Translators.workers.running.size}\n`

    return info
  }
}
