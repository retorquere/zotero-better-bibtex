Components.utils.import('resource://gre/modules/Services.jsm')

import { Preference } from '../gen/preferences'
import { Translators } from './translators'
import { log } from './logger'
import fastChunkString = require('fast-chunk-string')

import { DB } from './db/main'
import { DB as Cache } from './db/cache'

import * as s3 from './s3.json'

import * as PACKAGE from '../package.json'

const kB = 1024
const MB = kB * kB

const httpRequestOptions = {
  followRedirects: true,
  noCache: true,
  foreground: true,
}

export class ErrorReport {
  private chunkSize = 10 * MB // eslint-disable-line no-magic-numbers, yoda
  private previewSize = 3 * kB // eslint-disable-line no-magic-numbers, yoda

  private key: string
  private timestamp: string
  private bucket: string
  private params: any
  private globals: Record<string, any>

  private errorlog: {
    info: string
    errors: string
    debug: string | string[]
    references?: string
    db?: string
  }

  constructor(globals: Record<string, any>) {
    this.globals = globals
    globals.window.addEventListener('load', () => this.init(), false)
  }

  public async send(): Promise<void> {
    const wizard = this.globals.document.getElementById('better-bibtex-error-report')
    wizard.getButton('next').disabled = true
    wizard.getButton('cancel').disabled = true
    wizard.canRewind = false

    try {
      const logs = [
        this.submit('debug', 'text/plain', this.errorlog.debug, `${this.errorlog.info}\n\n${this.errorlog.errors}\n\n`),
      ]

      if (this.globals.document.getElementById('better-bibtex-error-report-include-db').checked) {
        logs.push(this.submit('DB', 'application/json', DB.serialize({ serializationMethod: 'pretty' })))
        logs.push(this.submit('Cache', 'application/json', Cache.serialize({ serializationMethod: 'pretty' })))
      }

      if (this.errorlog.references) logs.push(this.submit('references', 'application/json', this.errorlog.references))
      await Zotero.Promise.all(logs)
      wizard.advance()

      this.globals.document.getElementById('better-bibtex-report-id').value = this.key
      this.globals.document.getElementById('better-bibtex-report-result').hidden = false
    }
    catch (err) {
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

  private async ping(region: string) {
    await fetch(`http://s3.${region}.amazonaws.com${s3.region[region].tld || ''}/ping`, {
      method: 'GET',
      cache: 'no-cache',
      redirect: 'follow',
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { region, ...s3.region[region] }
  }

  private async init() {
    const wizard = this.globals.document.getElementById('better-bibtex-error-report')

    if (Zotero.Debug.enabled) wizard.pageIndex = 1

    const continueButton = wizard.getButton('next')
    continueButton.disabled = true

    this.params = this.globals.window.arguments[0].wrappedJSObject

    this.timestamp = (new Date()).toISOString().replace(/\..*/, '').replace(/:/g, '.')

    this.errorlog = {
      info: await this.info(),
      errors: Zotero.getErrors(true).join('\n'),
      debug: Zotero.Debug.getConsoleViewerOutput(),
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
    this.globals.document.getElementById('better-bibtex-report-current').value = Zotero.BetterBibTeX.getString('ErrorReport.better-bibtex.current', { version: current })

    try {
      const latest = await this.latest()

      const show_latest = this.globals.document.getElementById('better-bibtex-report-latest')
      if (current === latest) {
        show_latest.hidden = true
      }
      else {
        show_latest.value = Zotero.BetterBibTeX.getString('ErrorReport.better-bibtex.latest', { version: latest || '<could not be established>' })
        show_latest.hidden = false
      }

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

  private preview(lines: string | string[]): string {
    if (Array.isArray(lines)) {
      let preview = ''
      for (const line of lines) {
        if (line.startsWith('(4)(+')) continue // DB statements

        preview += `${line}\n`
        if (preview.length > this.previewSize) return `${preview} ...`
      }

      return preview
    }
    else if (lines.length > this.previewSize) {
      return `${lines.substr(0, this.previewSize)} ...`
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

  private async put(url, options) {
    let error = null

    for (let attempt = 0; attempt < 5; attempt++) { // eslint-disable-line no-magic-numbers
      try {
        // await Zotero.HTTP.request('PUT', url, options)

        await fetch(url, {
          method: 'PUT',
          cache: 'no-cache',
          headers: options.headers || {},
          redirect: 'follow',
          body: options.body,
        })
        return

      }
      catch (err) {
        log.error('ErrorReport: failed to PUT to', url, attempt)
        error = err

      }
    }

    throw error
  }

  /*
  private put(url, options) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', url)
      for (const [header, value] of (options.headers || {})) {
        xhr.setRequestHeader(header, value)
      }
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response)
        }
        else {
          reject({ status: this.status, statusText: xhr.statusText })
        }
      }
      xhr.onerror = function() {
        reject({ status: this.status, statusText: xhr.statusText })
      }
      xhr.send(options.body)
    })
  }
  */

  private async submit(filename, contentType, data: Promise<string | string[]> | string | string[], prefix = '') {
    data = await Promise.resolve(data)

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

    if (Preference.debugLogDir) {
      if (Array.isArray(data)) data = data.join('\n')
      await Zotero.File.putContentsAsync(`${Preference.debugLogDir}/${filename}.${ext}`, prefix + data)
      return
    }

    const url = `${this.bucket}/${this.key}-${this.timestamp}/${this.key}-${filename}`

    let chunks = []
    if (Array.isArray(data)) {
      let chunk = prefix
      for (const line of data) {
        if (filename === 'zotero' && line.startsWith('(4)(+')) continue // DB statements

        if ((chunk.length + line.length) > this.chunkSize) {
          if (chunk.length !== 0) chunks.push(chunk)
          chunk = `${line}\n`

        }
        else {
          chunk += `${line}\n`

        }
      }
      if (chunk.length) chunks.push(chunk)

    }
    else {
      chunks = fastChunkString(`${prefix}${data}`, { size: this.chunkSize })

    }

    chunks = chunks.map((chunk, n) => ({ n: `.${(n + 1).toString().padStart(4, '0')}`, body: chunk })) // eslint-disable-line no-magic-numbers
    if (chunks.length === 1) chunks[0].n = ''

    await Promise.all(chunks.map(chunk => this.put(`${url}${chunk.n}.${ext}`, {
      ...httpRequestOptions,
      body: chunk.body,
      headers,
    })))

  }
}
