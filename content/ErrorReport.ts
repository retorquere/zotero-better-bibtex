Components.utils.import('resource://gre/modules/Services.jsm')

import * as client from './client'

import { Shim } from './os'
const $OS = client.is7 ? Shim : OS

import { Cache } from './db/cache'
import { PromptService } from './prompt'
// import { regex as escapeRE } from './escape'

import { Preference } from './prefs'

import { defaults } from '../gen/preferences/meta'
const supported: string[] = Object.keys(defaults).filter(name => ![ 'client', 'testing', 'platform', 'newTranslatorsAskRestart' ].includes(name))

import { byId } from '../gen/translators'
import { log } from './logger'
import { AutoExport } from './auto-export'
import { KeyManager } from './key-manager'

import { pick } from './file-picker'
import * as l10n from './l10n'

import * as UZip from 'uzip'

import { alert } from './prompt'

import * as s3 from './s3.json'

import * as PACKAGE from '../package.json'

const kB = 1024

type WizardButton = HTMLElement & { disabled: boolean }

type Wizard = HTMLElement & {
  getButton: (name: string) => WizardButton
  getPageById: (id: string) => HTMLElement
  canRewind: boolean
  onLastPage: boolean
  pageIndex: number
  advance: () => void
  rewind: () => void
}

type Report = {
  context: string
  errors: string
  log: string
  items?: string
  acronyms?: string
  cache?: string
}

// const homeDir = $OS.Constants.Path.homeDir
// const $home = new RegExp(`${escapeRE(homeDir)}|${escapeRE(homeDir.replace(Zotero.isWin ? /\\/g : /\//g, '$1$1'))}|${escapeRE($OS.Path.toFileURI(homeDir))}`, 'g')

export class ErrorReport {
  private previewSize = 3
  private document: Document

  private key: string
  private region: {
    region: string
    short: string
    tld: string
  }

  private timestamp: string

  private bucket: string
  private cacheState: string

  private input: Report
  private report: Report
  private config: Record<keyof Report | 'attachments' | 'cache' | 'notes', boolean>

  public async send(): Promise<void> {
    const wizard: Wizard = this.document.getElementById('better-bibtex-error-report') as Wizard

    wizard.getButton('next').disabled = true
    wizard.getButton('cancel').disabled = true
    wizard.canRewind = false

    const version = require('../gen/version.js')

    try {
      await Zotero.HTTP.request('PUT', `${ this.bucket }/${ this.zipfile() }`, {
        noCache: true,
        // followRedirects: true,
        // noCache: true,
        // foreground: true,
        headers: {
          'x-amz-storage-class': 'STANDARD',
          'x-amz-acl': 'bucket-owner-full-control',
          'Content-Type': 'application/x-gzip',
        },
        body: this.zip(),
      })

      wizard.advance();

      // eslint-disable-next-line no-magic-numbers
      (<HTMLInputElement> this.document.getElementById('better-bibtex-report-id')).value = `${ this.name() }/${ version }-${ client.is7 ? 7 : 6 }${ Zotero.BetterBibTeX.outOfMemory ? '/oom' : '' }`
      this.document.getElementById('better-bibtex-report-result').hidden = false
    }
    catch (err) {
      log.error('failed to submit', this.name(), err)
      alert({ text: `${ err } (${ this.name() }, items: ${ !!this.report.items })`, title: Zotero.getString('general.error') })
      if (wizard.rewind) wizard.rewind()
    }
  }

  public show(): void {
    const wizard: Wizard = this.document.getElementById('better-bibtex-error-report') as Wizard

    if (wizard.onLastPage) wizard.canRewind = false
    else if (wizard.pageIndex === 0) wizard.canRewind = false
    else if (wizard.pageIndex === 1 && Zotero.Debug.storing) wizard.canRewind = false
    else wizard.canRewind = true
  }

  public restartWithDebugEnabled(): void {
    const buttonFlags = PromptService.BUTTON_POS_0 * PromptService.BUTTON_TITLE_IS_STRING
      + PromptService.BUTTON_POS_1 * PromptService.BUTTON_TITLE_CANCEL
      + PromptService.BUTTON_POS_2 * PromptService.BUTTON_TITLE_IS_STRING
    const index = PromptService.confirmEx(
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

  public zip(): Uint8Array {
    const files: Record<string, Uint8Array> = {}
    const enc = (new TextEncoder)

    files[`${ this.name() }/debug.txt`] = enc.encode(this.report.log)

    if (this.report.items) files[`${ this.name() }/items.json`] = enc.encode(this.report.items)
    if (this.config.cache) {
      files[`${ this.name() }/database.json`] = enc.encode(JSON.stringify(KeyManager.all()))
      files[`${ this.name() }/cache.json`] = enc.encode(this.report.cache)
    }
    if (this.report.acronyms) files[`${ this.name() }/acronyms.csv`] = enc.encode(this.report.acronyms)

    return new Uint8Array(UZip.encode(files) as ArrayBuffer)
  }

  public async save(): Promise<void> {
    const filename = await pick('Logs', 'save', [[ 'Zip Archive (*.zip)', '*.zip' ]], `${ this.name() }.zip`)
    if (filename) await $OS.File.writeAtomic(filename, this.zip(), { tmpPath: filename + '.tmp' })
  }

  private async ping(region: string) {
    await Zotero.HTTP.request('GET', `https://s3.${ region }.amazonaws.com${ s3.region[region].tld || '' }/ping`, { noCache: true })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { region, ...s3.region[region] }
  }

  private setValue(id: string, value: string) {
    const text = <HTMLInputElement> this.document.getElementById(id)
    text.value = value
    text.hidden = !value

    const tab = <HTMLInputElement> this.document.getElementById(`${ id }-tab`)
    if (tab) tab.hidden = !value
  }

  private scrub(logging: string[]): string {
    const ignore = new RegExp([
      /Addon must include an id, version, and type/,
      /Could not get children of.*CrashManager.jsm/,
      /Error: Translate: No RDF found/,
      /NS_ERROR_FAILURE:.*getHistogramById/,
      /NS_ERROR_NOT_AVAILABLE.*PartitioningExceptionListService[.]jsm/,
      /NS_NOINTERFACE.*ComponentUtils[.]jsm/,
      /PAC file installed from/,
      /See your zotero[.]org account settings for additional storage options/,
      /Syntax Error: Couldn't find trailer dictionary/,
      /Syntax Error: Couldn't read xref table/,
      /Upload request .* failed/,
      /You have reached your Zotero File Storage quota/,
      /pdftotext returned exit status/,
      /protocol is not allowed for attachments/,
    ].map(re => re.source).join('|'))
    return logging.filter(line => !line.match(ignore))
      // .map(line => line.replace($home, '$HOME'))
      .join('\n')
  }

  private errors(): string {
    return this.scrub(Zotero.getErrors(true) as string[])
  }

  private log(): string {
    return this.scrub(Zotero.Debug.getConsoleViewerOutput().slice(-500000))
  }

  private cleanItem(item: any) {
    if (!this.config.attachments && item.itemType === 'attachment') return false
    if (!this.config.notes && item.itemType === 'note') return false

    delete item.libraryID
    delete item.uri
    delete item.relations
    delete item.select
    delete item.itemKey
    delete item.contentType
    delete item.filename
    delete item.defaultPath

    delete item.multi

    if (item.path) item.path = item.path.replace(/.*\/zotero\/storage\/[^/]+/, 'ATTACHMENT_KEY')

    for (const creator of (item.creators || [])) {
      delete creator.multi
    }

    for (const details of [ 'attachments', 'notes' ]) {
      if (item[details]) {
        item[details] = item[details].filter(detail => this.cleanItem(detail))
      }
    }

    return true
  }

  private async reload() {
    const init = typeof this.config === 'undefined'
    this.config = {
      context: true,
      acronyms: true,
      errors: true,
      log: true,
      items: true,
      notes: false,
      attachments: false,
      cache: false,
    }
    for (const cb of Array.from(this.document.getElementsByClassName('better-bibtex-error-report-facet')) as HTMLInputElement[]) {
      const facet = cb.id.replace(/.*-/, '')

      if (init) {
        if (facet.match(/notes|attachments/)) {
          cb.hidden = !this.input.items
          this.config[facet] = this.config[facet] && !!this.input.items
        }
        if (facet === 'errors') {
          cb.disabled = !this.input.errors
          this.config[facet] = !!this.input.errors
        }
        cb.checked = this.config[facet]
      }

      this.config[facet] = cb.checked
      if (facet === 'notes' || facet === 'attachments') cb.disabled = !this.config.items
    }

    this.report = { ...this.input }

    if (!this.config.items) delete this.report.items
    if (this.report.items) {
      const lib = JSON.parse(this.report.items)

      if (lib.items) lib.items = lib.items.filter(item => this.cleanItem(item))

      delete lib.config.options

      if (lib.config.preferences) {
        for (const [ pref, value ] of Object.entries(lib.config.preferences)) {
          if (!supported.includes(pref) || value === defaults[pref]) delete lib.config.preferences[pref]
        }
      }

      this.report.items = JSON.stringify(lib, null, 2)
    }

    if (!this.config.errors) delete this.report.errors
    if (!this.config.log) delete this.report.log

    this.setValue('better-bibtex-error-context', this.report.context)
    this.setValue('better-bibtex-error-errors', this.report.errors || '')
    this.setValue('better-bibtex-error-log', this.preview(this.report.log || ''))
    this.setValue('better-bibtex-error-items', this.report.items ? this.preview(JSON.parse(this.report.items)) : '')
    this.setValue('better-bibtex-report-cache', this.cacheState = l10n.localize('better-bibtex_error-report_better-bibtex_cache', { entries: await Cache.count() }))

    this.report.log = [
      this.report.context,
      this.cacheState,
      this.report.errors,
      this.report.log,
    ].filter(chunk => chunk).join('\n\n')
  }

  public async load(win: Window & { ErrorReport: ErrorReport; arguments: any[] }): Promise<void> {
    this.document = win.document
    win.ErrorReport = this

    this.timestamp = ((new Date)).toISOString().replace(/\..*/, '').replace(/:/g, '.')

    const wizard: Wizard = this.document.getElementById('better-bibtex-error-report') as Wizard
    wizard.getPageById('page-enable-debug').addEventListener('pageshow', this.show.bind(this))
    wizard.getPageById('page-review').addEventListener('pageshow', this.show.bind(this))
    wizard.getPageById('page-send').addEventListener('pageshow', () => { this.send().catch(err => log.error('could not send debug log:', err)) })
    wizard.getPageById('page-done').addEventListener('pageshow', this.show.bind(this))

    for (const cb of Array.from(this.document.getElementsByClassName('better-bibtex-error-report-facet')) as HTMLInputElement[]) {
      cb.addEventListener('command', this.reload.bind(this))
    }

    wizard.pageIndex = Zotero.Debug.storing ? 1 : 0

    const continueButton = wizard.getButton('next')
    continueButton.disabled = true

    this.input = {
      context: await this.context(),
      errors: `${ Zotero.BetterBibTeX.outOfMemory }\n${ this.errors() }`.trim(),
      // # 1896
      log: this.log(),
      items: win.arguments[0].wrappedJSObject.items,
      cache: JSON.stringify(await Cache.dump(), null, 2),
    }
    const acronyms = $OS.Path.join(Zotero.BetterBibTeX.dir, 'acronyms.csv')
    if (await $OS.File.exists(acronyms)) this.input.acronyms = await $OS.File.read(acronyms, { encoding: 'utf-8' }) as unknown as string

    await this.reload()

    const current = require('../gen/version.js')
    this.setValue('better-bibtex-report-current', l10n.localize('better-bibtex_error-report_better-bibtex_current', { version: current }))

    try {
      const latest = await this.latest()

      const show_latest = <HTMLInputElement> this.document.getElementById('better-bibtex-report-latest')
      if (current === latest) {
        show_latest.hidden = true
      }
      else {
        show_latest.value = l10n.localize('better-bibtex_error-report_better-bibtex_latest', { version: latest || '<could not be established>' })
        show_latest.hidden = false
      }

      (<HTMLInputElement> this.document.getElementById('better-bibtex-report-oom')).hidden = !Zotero.BetterBibTeX.outOfMemory

      this.region = await Zotero.Promise.any(Object.keys(s3.region).map(this.ping.bind(this)))
      this.bucket = `https://${ s3.bucket }-${ this.region.short }.s3-${ this.region.region }.amazonaws.com${ this.region.tld || '' }`
      this.key = Zotero.Utilities.generateObjectKey()

      continueButton.disabled = false
      continueButton.focus()
    }
    catch (err) {
      log.error('errorreport:', err)
      alert({ text: `No AWS region can be reached: ${ err.message }` })
      wizard.getButton('cancel').disabled = false
    }
  }

  private name() {
    return `${ this.key }${ this.report.items ? '-refs' : '' }-${ this.region.short }`
  }

  private zipfile() {
    return `${ this.name() }-${ this.timestamp }.zip`
  }

  private preview(input: any): string {
    const previewSize = this.previewSize * kB
    if (typeof input === 'string') return input.length > previewSize ? `${ input.substr(0, previewSize) } ...` : input

    let trail = ''
    if (input.items.length > this.previewSize) {
      trail = `\n... + ${ input.items.length - this.previewSize } more items`
      input = { ...input, items: input.items.slice(0, this.previewSize) }
    }
    return JSON.stringify(input, null, 2) + trail
  }

  // general state of Zotero
  private async context() {
    let context = ''

    const appInfo = Components.classes['@mozilla.org/xre/app-info;1'].getService(Components.interfaces.nsIXULAppInfo)
    context += `Application: ${ appInfo.name } (${ Zotero.clientName }) ${ appInfo.version } ${ Zotero.locale }\n`
    context += `Platform: ${ client.platform }\n`

    const addons = await Zotero.getInstalledExtensions()
    if (addons.length) {
      context += 'Addons:\n'
      for (const addon of addons) {
        context += `  ${ addon }\n`
      }
    }

    context += 'Settings:\n'
    const settings = { default: '', set: '' }
    for (const [ key, value ] of Object.entries(Preference.all)) {
      settings[value === defaults[key] ? 'default' : 'set'] += `  ${ key } = ${ JSON.stringify(value) }\n`
    }
    if (settings.default) settings.default = `Settings at default:\n${ settings.default }`
    context += settings.set + settings.default

    for (const key of ['export.quickCopy.setting']) {
      context += `  Zotero: ${ key } = ${ JSON.stringify(Zotero.Prefs.get(key)) }\n`
    }

    const autoExports = await AutoExport.all()
    if (autoExports.length) {
      context += 'Auto-exports:\n'
      for (const ae of autoExports) {
        context += `  path: ...${ JSON.stringify($OS.Path.split(ae.path).components.pop()) }`
        switch (ae.type) {
          case 'collection':
            context += ` (${ Zotero.Collections.get(ae.id)?.name || '<collection>' })`
            break
          case 'library':
            context += ` (${ Zotero.Libraries.get(ae.id)?.name || '<library>' })`
            break
        }
        context += '\n'
        for (const [ k, v ] of Object.entries(ae)) {
          if (k === 'path') continue
          context += `    ${ k }: ${ JSON.stringify(v) }`
          if (k === 'translatorID' && byId[v as string]) context += ` (${ byId[v as string].label })`
          context += '\n'
        }
      }
    }

    context += `Zotero.Debug.storing: ${ Zotero.Debug.storing }\n`
    context += `Zotero.Debug.storing at start: ${ Zotero.BetterBibTeX.debugEnabledAtStart }\n`

    return context
  }
}
