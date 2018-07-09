declare const window: any
declare const document: any
declare const Components: any
declare const Zotero: any
declare const Services: any

import { Preferences as Prefs } from './prefs.ts'
import { Translators } from './translators.ts'
import { debug } from './debug.ts'
import { createFile } from './create-file.ts'
const s3 = require('./s3.json')
import fastChunkString = require('fast-chunk-string')

const PACKAGE = require('../package.json')

Components.utils.import('resource://gre/modules/Services.jsm')

export = new class ErrorReport {
  private preview = 3000
  private chunk = 10485760 // 10MB

  private key: string
  private timestamp: string
  private bucket: string
  private params: any

  private errorlog: {
    references?: string,
    info?: string,
    errors?: string,
    full?: string,
    db?: string
  } = {}

  constructor() {
    window.addEventListener('load', () => this.init(), false)
  }

  public async send() {
    const wizard = document.getElementById('better-bibtex-error-report')
    wizard.getButton('next').disabled = true
    wizard.getButton('cancel').disabled = true
    wizard.canRewind = false

    const errorlog = [this.errorlog.info, this.errorlog.errors, this.errorlog.full].join('\n\n')

    try {
      const logs = [this.submit('errorlog', 'text/plain', errorlog), this.submit('db', 'application/json', this.errorlog.db)]
      if (this.errorlog.references) logs.push(this.submit('references', 'application/json', this.errorlog.references))
      await Zotero.Promise.all(logs)
      wizard.advance()

      document.getElementById('better-bibtex-report-id').value = this.key
      document.getElementById('better-bibtex-report-result').hidden = false
    } catch (err) {
      const ps = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService)
      ps.alert(null, Zotero.getString('general.error'), `${err} (${this.key}, references: ${!!this.errorlog.references})`)
      if (wizard.rewind) wizard.rewind()
    }
  }

  public show() {
    const wizard = document.getElementById('better-bibtex-error-report')

    if (wizard.onLastPage) wizard.canRewind = false
    else if (wizard.pageIndex === 0) wizard.canRewind = false
    else if (wizard.pageIndex === 1 && Zotero.Debug.enabled) wizard.canRewind = false
    else wizard.canRewind = true
  }

  public restartWithDebugEnabled() {
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

  private async init() {
    this.params = window.arguments[0].wrappedJSObject

    const wizard = document.getElementById('better-bibtex-error-report')

    if (Zotero.Debug.enabled) wizard.pageIndex = 1

    const continueButton = wizard.getButton('next')
    continueButton.disabled = true

    this.timestamp = (new Date()).toISOString().replace(/\..*/, '').replace(/:/g, '.')

    debug('ErrorReport.log:', Zotero.Debug.count())
    this.errorlog = {
      info: await this.info(),
      errors: Zotero.getErrors(true).join('\n'),
      full: await Zotero.Debug.get(),
      db: Zotero.File.getContents(createFile('_better-bibtex.json')),
    }

    if (Zotero.BetterBibTeX.ready && this.params.items) {
      await Zotero.BetterBibTeX.ready

      debug('ErrorReport::init items', this.params.items.length)
      this.errorlog.references = await Translators.translate(Translators.byLabel.BetterBibTeXJSON.translatorID, {exportNotes: true}, this.params.items)
      debug('ErrorReport::init references', this.errorlog.references.length)
    }

    debug('ErrorReport.init:', Object.keys(this.errorlog))
    document.getElementById('better-bibtex-error-context').value = this.errorlog.info
    document.getElementById('better-bibtex-error-errors').value = this.errorlog.errors
    document.getElementById('better-bibtex-error-log').value = this.errorlog.full.substring(0, this.preview) + '...'
    if (this.errorlog.references) document.getElementById('better-bibtex-error-references').value = this.errorlog.references.substring(0, this.preview) + '...'
    document.getElementById('better-bibtex-error-tab-references').hidden = !this.errorlog.references

    const current = require('../gen/version.js')
    document.getElementById('better-bibtex-report-current').value = Zotero.BetterBibTeX.getString('ErrorReport.better-bibtex.current', { version: current })

    let latest = PACKAGE.xpi.releaseURL.replace('https://github.com/', 'https://api.github.com/repos/').replace(/\/releases\/.*/, '/releases/latest')
    debug('ErrorReport.current:', latest)
    latest = JSON.parse((await Zotero.HTTP.request('GET', latest)).responseText).tag_name.replace('v', '')
    debug('ErrorReport.current:', latest)
    const show_latest = document.getElementById('better-bibtex-report-latest')
    if (current === latest) {
      show_latest.hidden = true
    } else {
      show_latest.value = Zotero.BetterBibTeX.getString('ErrorReport.better-bibtex.latest', { version: latest })
      show_latest.hidden = false
    }

    const regions = []
    for (const candidate of PACKAGE.bugs.logs.regions) {
      const started = Date.now()
      try {
        await Zotero.HTTP.request('GET', `http://s3.${candidate}.amazonaws.com/ping`)
        regions.push({region: candidate, ping: Date.now() - started, ...s3[candidate]})
      } catch (err) {
        debug('ErrorReport.ping: could not reach', candidate, err)
      }
    }
    regions.sort((a, b) => a.ping - b.ping)
    const region = regions[0]
    const postfix = region.short
    this.bucket = `http://${PACKAGE.bugs.logs.bucket}-${postfix}.s3-${region.region}.amazonaws.com${region.tld}`
    this.key = `${Zotero.Utilities.generateObjectKey()}-${postfix}`
    debug('ErrorReport.ping:', regions, this.bucket, this.key)

    continueButton.focus()
    continueButton.disabled = false
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
    const prefs = []
    for (const key of Prefs.branch.getChildList('')) {
      prefs.push(key)
    }
    for (const key of prefs.sort()) {
      info += `  ${key} = ${JSON.stringify(Prefs.get(key))}\n`
    }
    for (const key of ['export.quickCopy.setting']) {
      info += `  Zotero: ${key} = ${JSON.stringify(Zotero.Prefs.get(key))}\n`
    }

    return info
  }

  private async submit(filename, contentType, data) {
    const started = Date.now()
    debug('Errorlog.submit:', filename)

    const headers = {
      'x-amz-storage-class': 'STANDARD',
      'x-amz-acl': 'bucket-owner-full-control',
      'Content-Type': contentType,
    }

    let ext = ''
    switch (contentType) {
      case 'text/plain':
        ext = 'txt'
        break

      case 'application/json':
        ext = 'json'
        break
    }

    const url = `${this.bucket}/${this.key}-${this.timestamp}/${this.key}-${filename}`
    if (data.length < this.chunk) {
      await Zotero.HTTP.request('PUT', `${url}.${ext}`, { body: data, headers, dontCache: true })
    } else {
      const chunks = fastChunkString(data, { size: this.chunk })
      const padding = (chunks.length + 1).toString().length

      await Zotero.Promise.all(chunks.map((chunk, i) => Zotero.HTTP.request('PUT', `${url}.${(i + 1).toString().padStart(padding, '0')}.${ext}`, { body: chunk, headers, dontCache: true })))
    }

    debug('Errorlog.submit:', filename, Date.now() - started)
  }
}

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
