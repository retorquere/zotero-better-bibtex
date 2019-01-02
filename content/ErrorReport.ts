declare const window: any
declare const document: any
declare const Components: any
declare const Zotero: any
declare const Services: any

import { Preferences as Prefs } from './prefs'
import { Translators } from './translators'
import * as log from './debug'
import fastChunkString = require('fast-chunk-string')

import { DB } from './db/main'
import { DB as Cache } from './db/cache'

const s3 = require('./s3.json')

const PACKAGE = require('../package.json')

Components.utils.import('resource://gre/modules/Services.jsm')

const kB = 1024
const MB = kB * kB

const httpRequestOptions = {
  followRedirects: true,
  dontCache: true,
  foreground: true,
}

export = new class ErrorReport {
  private chunkSize
  private previewSize = 3 * kB // tslint:disable-line:no-magic-numbers binary-expression-operand-order

  private key: string
  private timestamp: string
  private bucket: string
  private params: any

  private errorlog: {
    info: string,
    errors: string,
    debug: string | string[],
    references?: string,
    db?: string
  }

  constructor() {
    window.addEventListener('load', () => this.init(), false)
  }

  public async send() {
    const wizard = document.getElementById('better-bibtex-error-report')
    wizard.getButton('next').disabled = true
    wizard.getButton('cancel').disabled = true
    wizard.canRewind = false

    try {
      const logs = [
        this.submit('debug', 'text/plain', this.errorlog.debug, `${this.errorlog.info}\n\n${this.errorlog.errors}\n\n`),
      ]

      if (document.getElementById('better-bibtex-error-report-include-db').checked) {
        logs.push(this.submit('DB', 'application/json', DB.serialize({ serializationMethod: 'pretty' })))
        logs.push(this.submit('Cache', 'application/json', Cache.serialize({ serializationMethod: 'pretty' })))
      }

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

  private async ping(region) {
    await Zotero.HTTP.request('GET', `http://s3.${region}.amazonaws.com/ping`, httpRequestOptions)
    return { region, ...s3[region] }
  }

  private async init() {
    const wizard = document.getElementById('better-bibtex-error-report')

    if (Zotero.Debug.enabled) wizard.pageIndex = 1

    const continueButton = wizard.getButton('next')
    continueButton.disabled = true

    // configure debug logging
    const debugLog = {
      chunkSize: null,
      region: null,
    }
    const m = Prefs.get('debugLog').match(/^([-a-z]+[0-9]?)|([-a-z]+[0-9]?)\.([0-9]+)|([0-9]+)$/)
    if (m) {
      debugLog.region = m[1] || m[2] // tslint:disable-line:no-magic-numbers
      debugLog.chunkSize = parseInt(m[3] || m[4] || 0)  // tslint:disable-line:no-magic-numbers
    }

    this.chunkSize = (debugLog.chunkSize || 10) * MB // tslint:disable-line:no-magic-numbers
    log.debug('ErrorReport.debuglog:', m, debugLog, this.chunkSize)

    this.params = window.arguments[0].wrappedJSObject

    this.timestamp = (new Date()).toISOString().replace(/\..*/, '').replace(/:/g, '.')

    log.debug('ErrorReport.log:', Zotero.Debug.count())
    this.errorlog = {
      info: await this.info(),
      errors: Zotero.getErrors(true).join('\n'),
      debug: Zotero.Debug.getConsoleViewerOutput(),
    }

    if (Zotero.BetterBibTeX.ready && this.params.items) {
      await Zotero.BetterBibTeX.ready

      log.debug('ErrorReport::init items', this.params.items.length)
      this.errorlog.references = await Translators.translate(Translators.byLabel.BetterBibTeXJSON.translatorID, {exportNotes: true, dropAttachments: true}, this.params.items)
      log.debug('ErrorReport::init references', this.errorlog.references.length)
    }

    log.debug('ErrorReport.init:', Object.keys(this.errorlog))
    document.getElementById('better-bibtex-error-context').value = this.errorlog.info
    document.getElementById('better-bibtex-error-errors').value = this.errorlog.errors
    document.getElementById('better-bibtex-error-debug').value = this.preview(this.errorlog.debug)
    if (this.errorlog.references) document.getElementById('better-bibtex-error-references').value = this.preview(this.errorlog.references)
    document.getElementById('better-bibtex-error-tab-references').hidden = !this.errorlog.references

    const current = require('../gen/version.js')
    document.getElementById('better-bibtex-report-current').value = Zotero.BetterBibTeX.getString('ErrorReport.better-bibtex.current', { version: current })

    let latest = PACKAGE.xpi.releaseURL.replace('https://github.com/', 'https://api.github.com/repos/').replace(/\/releases\/.*/, '/releases/latest')
    log.debug('ErrorReport.current:', latest)
    latest = JSON.parse((await Zotero.HTTP.request('GET', latest, httpRequestOptions)).responseText).tag_name.replace('v', '')
    log.debug('ErrorReport.current:', latest)
    const show_latest = document.getElementById('better-bibtex-report-latest')
    if (current === latest) {
      show_latest.hidden = true
    } else {
      show_latest.value = Zotero.BetterBibTeX.getString('ErrorReport.better-bibtex.latest', { version: latest })
      show_latest.hidden = false
    }

    const region = await Zotero.Promise.any(PACKAGE.bugs.logs.regions.filter(r => !debugLog.region || r === debugLog.region).map(this.ping))
    this.bucket = `http://${PACKAGE.bugs.logs.bucket}-${region.short}.s3-${region.region}.amazonaws.com${region.tld}`
    this.key = `${Zotero.Utilities.generateObjectKey()}-${region.short}`
    log.debug('ErrorReport.ping:', this.bucket, this.key)

    continueButton.disabled = false
    continueButton.focus()
  }

  private preview(lines) {
    if (Array.isArray(lines)) {
      let preview = ''
      for (const line of lines) {
        if (line.startsWith('(4)(+')) continue // DB statements

        preview += line + '\n'
        if (preview.length > this.previewSize) return preview + ' ...'
      }

      return preview

    } else if (lines.length > this.previewSize) {
      return lines.substr(0, this.previewSize) + ' ...'

    }

    return lines
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

  private async put(url, options) {
    let error = null

    for (let attempt = 0; attempt < 5; attempt++) { // tslint:disable-line:no-magic-numbers
      try {
        await Zotero.HTTP.request('PUT', url, options)
        return

      } catch (err) {
        log.error('ErrorReport: failed to PUT to', url, attempt)
        error = err

      }
    }

    throw error
  }

  private async submit(filename, contentType, data, prefix = '') {
    const started = Date.now()
    log.debug('Errorlog.submit:', filename)

    if (data.then) data = await data

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

    let chunks = []
    if (Array.isArray(data)) {
      let chunk = prefix
      for (const line of data) {
        if (filename === 'zotero' && line.startsWith('(4)(+')) continue // DB statements

        if ((chunk.length + line.length) > this.chunkSize) {
          if (chunk.length !== 0) chunks.push(chunk)
          chunk = line + '\n'

        } else {
          chunk += line + '\n'

        }
      }
      if (chunk.length) chunks.push(chunk)

    } else {
      chunks = fastChunkString(prefix + data, { size: this.chunkSize })

    }

    chunks = chunks.map((chunk, n) => ({ n: '.' + (n + 1).toString().padStart(4, '0'), body: chunk })) // tslint:disable-line:no-magic-numbers
    if (chunks.length === 1) chunks[0].n = ''

    await Promise.all(chunks.map(chunk => this.put(`${url}${chunk.n}.${ext}`, {
      ...httpRequestOptions,
      body: chunk.body,
      headers,
    })))

    log.debug('Errorlog.submit:', filename, Date.now() - started)
  }
}

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
