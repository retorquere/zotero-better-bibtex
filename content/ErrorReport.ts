declare const window: any
declare const document: any
declare const Components: any
declare const Zotero: any
declare const Services: any

import { Preferences as Prefs } from './prefs.ts'
import { Translators } from './translators.ts'
import { debug } from './debug.ts'
import { createFile } from './create-file.ts'

const PACKAGE = require('../package.json')

Components.utils.import('resource://gre/modules/Services.jsm')

export = new class ErrorReport {
  public static max_log_lines = 5000
  public static max_line_length = 80

  private key: string
  private timestamp: string
  private bucket: string
  private params: any

  private errorlog: {
    truncated?: string,
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
    const continueButton = wizard.getButton('next')
    continueButton.disabled = true

    const errorlog = [this.errorlog.info, this.errorlog.errors, this.errorlog.full].join('\n\n')

    try {
      const logs = [this.submit('errorlog.txt', errorlog), this.submit('db.json', this.errorlog.db)]
      if (this.errorlog.references) logs.push(this.submit('references.json', this.errorlog.references))
      await Zotero.Promise.all(logs)
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

    this.bucket = `https://s3.${PACKAGE.bugs.logs.region}.amazonaws.com/${PACKAGE.bugs.logs.bucket}`
    this.key = Zotero.Utilities.generateObjectKey()
    this.timestamp = (new Date()).toISOString().replace(/\..*/, '').replace(/:/g, '.')

    this.errorlog = {
      info: await this.info(),
      errors: Zotero.getErrors(true).join('\n'),
      full: await Zotero.Debug.get(),
      db: Zotero.File.getContents(createFile('_better-bibtex.json')),
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

  private async submit(filename, data) {
    const headers = {
      'x-amz-storage-class': 'STANDARD',
      'x-amz-acl': 'bucket-owner-full-control',
    }

    switch (filename.split('.').pop()) {
      case 'txt':
        headers['Content-Type'] = 'text/plain'
        break

      case 'txt':
        headers['Content-Type'] = 'application/json'
        break

    }

    await Zotero.HTTP.request('PUT', `${this.bucket}/${this.key}-${this.timestamp}/${this.key}-${filename}`, {
      body: data,
      headers,
      dontCache: true,
      debug: true,
    })
  }
}

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
