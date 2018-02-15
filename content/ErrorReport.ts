declare const window: any
declare const document: any
declare const Components: any
declare const Zotero: any
declare const FormData: any
declare const Blob: any
declare const Services: any

import { Preferences as Prefs } from './prefs.ts'
import { Translators } from './translators.ts'
import { debug } from './debug.ts'
const PACKAGE = require('../package.json')

Components.utils.import('resource://gre/modules/Services.jsm')

export = new class ErrorReport {
  public static max_log_lines = 5000
  public static max_line_length = 80

  private key: string
  private timestamp: string
  private params: any

  private errorlog: {
    truncated?: string,
    references?: string,
    info?: string,
    errors?: string,
    full?: string,
  } = {}

  private form: {
    action?: string,
    filefield?: string,
    fields?: {
      key: string,
      acl: string,
      'X-Amz-Credential': string,
      'X-Amz-Algorithm': string,
      'X-Amz-Date': string,
      Policy: string,
      'X-Amz-Signature': string,
      success_action_status: string,
    }
  } = { }

  constructor() {
    window.addEventListener('load', () => this.init(), false)
  }

  public async send() {
    const wizard = document.getElementById('better-bibtex-error-report')
    const continueButton = wizard.getButton('next')
    continueButton.disabled = true

    const errorlog = [this.errorlog.info, this.errorlog.errors, this.errorlog.full].join('\n\n')

    try {
      await this.submit('errorlog.txt', errorlog)
      if (this.errorlog.references) await this.submit('references.json', this.errorlog.references)
      wizard.advance()
      wizard.getButton('cancel').disabled = true
      wizard.canRewind = false

      document.getElementById('better-bibtex-report-id').setAttribute('value', this.key)
      document.getElementById('better-bibtex-report-result').hidden = false
    } catch (err) {
      const ps = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService)
      ps.alert(null, Zotero.getString('general.error'), err)
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
    continueButton.disabled = false

    this.form = JSON.parse(Zotero.File.getContentsFromURL(PACKAGE.xpi.releaseURL + 'error-report.json'))
    this.key = Zotero.Utilities.generateObjectKey()
    this.timestamp = (new Date()).toISOString().replace(/\..*/, '').replace(/:/g, '.')

    this.errorlog = {
      info: await this.info(),
      errors: Zotero.getErrors(true).join('\n'),
      full: await Zotero.Debug.get(),
    }
    let truncated = this.errorlog.full.split('\n')
    truncated = truncated.slice(0, ErrorReport.max_log_lines)
    truncated = truncated.map(line => Zotero.Utilities.ellipsize(line, ErrorReport.max_line_length, true))
    this.errorlog.truncated = truncated.join('\n')

    if (Zotero.BetterBibTeX.ready && this.params.items) {
      await Zotero.BetterBibTeX.ready

      debug('ErrorReport::init items', this.params.items)
      this.errorlog.references = await Translators.translate(Translators.byLabel.BetterBibTeXJSON.translatorID, {exportNotes: true}, this.params.items)
      debug('ErrorReport::init references', this.errorlog.references)
    }

    debug('ErrorReport.init:', Object.keys(this.errorlog))
    document.getElementById('better-bibtex-error-context').value = this.errorlog.info
    document.getElementById('better-bibtex-error-errors').value = this.errorlog.errors
    document.getElementById('better-bibtex-error-log').value = this.errorlog.truncated
    if (this.errorlog.references) document.getElementById('better-bibtex-error-references').value = this.errorlog.references.substring(0, ErrorReport.max_log_lines) + '...'
    document.getElementById('better-bibtex-error-tab-references').hidden = !this.errorlog.references

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

  private submit(filename, data) {
    const request_ok_range = 1000

    return new Zotero.Promise((resolve, reject) => {
      const fd = new FormData()
      for (const [name, value] of Object.entries(this.form.fields)) {
        fd.append(name, value)
      }

      const file = new Blob([data], { type: 'text/plain'})
      fd.append('file', file, `${this.timestamp}-${this.key}-${filename}`)

      const request = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance()
      request.open('POST', this.form.action, true)

      request.onload = () => {
        if (!request.status || request.status > request_ok_range) {
          return reject(`${Zotero.getString('errorReport.noNetworkConnection')}: ${request.status}`)
        }

        if (request.status !== parseInt(this.form.fields.success_action_status)) {
          return reject(`${Zotero.getString('errorReport.invalidResponseRepository')}: ${request.status}, expected ${this.form.fields.success_action_status}\n${request.responseText}`)
        }

        return resolve()
      }

      request.onerror = () => reject(`${Zotero.getString('errorReport.noNetworkConnection')}: ${request.statusText}`)

      request.send(fd)
    })
  }
}

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
