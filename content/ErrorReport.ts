Components.utils.import('resource://gre/modules/Services.jsm')

import { Preference } from './prefs'
import { defaults } from '../gen/preferences/meta'
import { Translators } from './translators'
import { log } from './logger'

import { DB } from './db/main'
import { DB as Cache } from './db/cache'
import { pick } from './file-picker'
import * as l10n from './l10n'

import * as s3 from './s3.json'

import * as PACKAGE from '../package.json'

const kB = 1024
const COMPRESSION_BEST = 9

// PR_RDONLY       0x01
const PR_WRONLY = 0x02
// const PR_RDWR = 0x04
const PR_CREATE_FILE =0x08
// define PR_APPEND       0x10
// define PR_TRUNCATE     0x20
// define PR_SYNC         0x40
// define PR_EXCL         0x80

export class ErrorReport {
  private previewSize = 3 * kB // eslint-disable-line no-magic-numbers, yoda

  private key: string
  private timestamp: string
  private zipfile: string

  private bucket: string
  private params: any
  private globals: Record<string, any>
  private cacheState: string

  private errorlog: {
    info: string
    errors: string
    debug: string
    items?: string
  }

  public async send(): Promise<void> {
    const wizard = this.globals.document.getElementById('better-bibtex-error-report')
    wizard.getButton('next').disabled = true
    wizard.getButton('cancel').disabled = true
    wizard.canRewind = false

    try {
      await Zotero.HTTP.request('PUT', `${this.bucket}/${OS.Path.basename(this.zipfile)}`, {
        noCache: true,
        // followRedirects: true,
        // noCache: true,
        // foreground: true,
        headers: {
          'x-amz-storage-class': 'STANDARD',
          'x-amz-acl': 'bucket-owner-full-control',
          'Content-Type': 'application/zip',
        },
        body: new Uint8Array(await OS.File.read(await this.zip(), {})),
      })

      wizard.advance()

      this.globals.document.getElementById('better-bibtex-report-id').value = this.key
      this.globals.document.getElementById('better-bibtex-report-result').hidden = false
    }
    catch (err) {
      log.error('failed to submit', this.key, err)
      const ps = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService)
      ps.alert(null, Zotero.getString('general.error'), `${err} (${this.key}, items: ${!!this.errorlog.items})`)
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
      return JSON.parse((await Zotero.HTTP.request('GET', latest, { noCache: true })).response).tag_name.replace('v', '')
    }
    catch (err) {
      log.error('errorreport.latest:', err)
      return null
    }
  }

  public async zip(): Promise<string> {
    if (!await OS.File.exists(this.zipfile)) {
      const zipWriter = Components.classes['@mozilla.org/zipwriter;1'].createInstance(Components.interfaces.nsIZipWriter)
      // 0x02 = Read and Write

      zipWriter.open(Zotero.File.pathToFile(this.zipfile), PR_WRONLY + PR_CREATE_FILE)
      const converter = Components.classes['@mozilla.org/intl/scriptableunicodeconverter'].createInstance(Components.interfaces.nsIScriptableUnicodeConverter)
      converter.charset = 'UTF-8'

      function add(filename, body) { // eslint-disable-line no-inner-declarations, prefer-arrow/prefer-arrow-functions
        const istream = converter.convertToInputStream(body)
        zipWriter.addEntryStream(filename, Date.now(), COMPRESSION_BEST, istream, false)
        istream.close()
      }

      add(
        `${this.key}/debug.txt`,
        [ this.errorlog.info, this.cacheState, this.errorlog.errors, this.errorlog.debug ].filter(chunk => chunk).join('\n\n')
      )

      if (this.errorlog.items) add(`${this.key}/items.json`, this.errorlog.items)

      if (this.globals.document.getElementById('better-bibtex-error-report-include-db').checked) {
        add(`${this.key}/database.json`, DB.serialize({ serializationMethod: 'pretty' }))
        add(`${this.key}/cache.json`, Cache.serialize({ serializationMethod: 'pretty' }))
      }

      zipWriter.close()
    }
    return this.zipfile
  }

  public async save(): Promise<void> {
    const filename = await pick('Logs', 'save', [['Zip Archive (*.zip)', '*.zip']], `${this.key}.zip`)
    if (filename) await OS.File.copy(await this.zip(), filename)
  }

  private async ping(region: string) {
    await Zotero.HTTP.request('GET', `https://s3.${region}.amazonaws.com${s3.region[region].tld || ''}/ping`, { noCache: true })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { region, ...s3.region[region] }
  }

  public async load(): Promise<void> {
    this.timestamp = (new Date()).toISOString().replace(/\..*/, '').replace(/:/g, '.')

    const wizard = this.globals.document.getElementById('better-bibtex-error-report')

    if (Zotero.Debug.enabled) wizard.pageIndex = 1

    const continueButton = wizard.getButton('next')
    continueButton.disabled = true

    this.params = this.globals.window.arguments[0].wrappedJSObject

    this.errorlog = {
      info: await this.info(),
      errors: Zotero.getErrors(true).join('\n'),
      // # 1896
      debug: Zotero.Debug.getConsoleViewerOutput().slice(-500000).join('\n'), // eslint-disable-line no-magic-numbers
    }

    if (this.params.scope) {
      await Zotero.BetterBibTeX.ready
      this.errorlog.items = await Translators.exportItems({
        translatorID: Translators.byLabel.BetterBibTeXJSON.translatorID,
        displayOptions: {exportNotes: true, dropAttachments: true, Normalize: true},
        scope: this.params.scope,
      })
    }

    this.globals.document.getElementById('better-bibtex-error-context').value = this.errorlog.info
    this.globals.document.getElementById('better-bibtex-error-errors').value = this.errorlog.errors
    this.globals.document.getElementById('better-bibtex-error-debug').value = this.preview(this.errorlog.debug)
    if (this.errorlog.items) this.globals.document.getElementById('better-bibtex-error-items').value = this.preview(this.errorlog.items)
    this.globals.document.getElementById('better-bibtex-error-tab-items').hidden = !this.errorlog.items

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
      this.bucket = `https://${s3.bucket}-${region.short}.s3-${region.region}.amazonaws.com${region.tld || ''}`
      this.key = `${Zotero.Utilities.generateObjectKey()}${this.params.scope ? '-refs' : ''}-${region.short}`

      this.zipfile = OS.Path.join(Zotero.getTempDirectory().path, `${this.key}-${this.timestamp}.zip`)

      continueButton.disabled = false
      continueButton.focus()
    }
    catch (err) {
      alert(`No AWS region can be reached: ${err.message}`)
      wizard.getButton('cancel').disabled = false
    }
  }
  public async unload(): Promise<void> {
    if (await OS.File.exists(this.zipfile)) await OS.File.remove(this.zipfile, { ignoreAbsent: true })
  }

  private preview(text: string): string {
    return text.length > this.previewSize ? `${text.substr(0, this.previewSize)} ...` : text
  }

  // general state of Zotero
  private async info() {
    let info = ''

    const appInfo = Components.classes['@mozilla.org/xre/app-info;1'].getService(Components.interfaces.nsIXULAppInfo)
    info += `Application: ${appInfo.name} (${Zotero.clientName}) ${appInfo.version} ${Zotero.locale}\n`
    info += `Platform: ${Zotero.platform} ${Zotero.oscpu}\n`

    const addons = await Zotero.getInstalledExtensions()
    if (addons.length) {
      info += 'Addons:\n'
      for (const addon of addons) {
        info += `  ${addon}\n`
      }
    }

    info += 'Settings:\n'
    const settings = { default: '', set: '' }
    for (const [key, value] of Object.entries(Preference.all)) {
      settings[value === defaults[key] ? 'default' : 'set'] += `  ${key} = ${JSON.stringify(value)}\n`
    }
    if (settings.default) settings.default = `Settings at default:\n${settings.default}`
    info += settings.set + settings.default

    for (const key of ['export.quickCopy.setting']) {
      info += `  Zotero: ${key} = ${JSON.stringify(Zotero.Prefs.get(key))}\n`
    }

    const autoExports = DB.getCollection('autoexport').find()
    if (autoExports.length) {
      info += 'Auto-exports:\n'
      for (const ae of autoExports) {
        info += `  ${path}: ${JSON.stringify(ae.path)}`
        for (const [k, v] of Object.entries(ae)) {
          if (k === 'path') continue
          info += `    ${k}: ${JSON.stringify(v)}`
          if (k === 'translatorID' && Translators.byId[v as string]) info += ` (${Translators.byId[v as string].label})`
          info += '\n'
        }
      }
    }

    info += `Zotero.Debug.enabled: ${Zotero.Debug.enabled}\n`
    info += `Zotero.Debug.enabled at start: ${Zotero.BetterBibTeX.debugEnabledAtStart}\n`

    info += `Total export workers started: ${Translators.workers.total}, currently running: ${Translators.workers.running.size}\n`

    return info
  }
}
