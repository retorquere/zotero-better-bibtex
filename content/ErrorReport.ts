import * as client from './client'
import { Path, File } from './file'

import { Cache } from './translators/worker'
import { regex as escapeRE } from './escape'

import { Preference } from './prefs'

import { defaults } from '../gen/preferences/meta'
const supported: string[] = Object.keys(defaults).filter(name => ![ 'client', 'testing', 'platform', 'newTranslatorsAskRestart' ].includes(name))

import { byId } from '../gen/translators'
import { log } from './logger'
import { AutoExport } from './auto-export'
import { KeyManager } from './key-manager'

import { FilePickerHelper } from 'zotero-plugin-toolkit'
import * as l10n from './l10n'

import * as UZip from 'uzip'

const ENV = Components.classes['@mozilla.org/process/environment;1'].getService(Components.interfaces.nsIEnvironment)

import { alert } from './prompt'

import * as s3 from './s3.json'

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
  currentPage: {
    hidden: boolean
  }
}

import { version as running } from '../gen/version.json'

type Report = {
  context: string
  errors: string
  log: string
  items?: string
  acronyms?: string
  cache?: string
}

const $home = new RegExp(`${escapeRE(Path.home)}|${escapeRE(Path.home.replace(Zotero.isWin ? /\\/g : /\//g, '$1$1'))}|${escapeRE(PathUtils.toFileURI(Path.home))}`, 'g')

class Upgrades {
  public zotero = {
    running: Zotero.version,
    available: '',
    message: {
      running: '',
      available: '',
    },
    upgrade: false,
  }

  public bbt = {
    running,
    available: '',
    message: {
      running: '',
      available: '',
    },
    upgrade: false,
  }

  public async init() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const manifest = async updates => JSON.parse((await Zotero.HTTP.request('GET', updates, { noCache: true })).response)

    const bbt = async () => {
      try {
        this.bbt.available = (await manifest('https://github.com/retorquere/zotero-better-bibtex/releases/download/release/updates.json'))
          .addons['better-bibtex@iris-advies.com']
          .updates[0]
          .version as string
      }
      catch (err) {
        log.error('errorreport.latest.bbt:', err)
      }
    }

    const zotero = async () => {
      try {
        const release = client.isBeta ? 'beta' : 'release'
        const platform = `${client.platform.replace(/lin/, 'linux')}${ { mac: '', win: '-x64', linux: '-x86_64' }[client.platform] || '' }`
        this.zotero.available = (await manifest(`https://www.zotero.org/download/client/manifests/${release}/updates-${platform}.json`))
          .map(v => v.version as string)
          .sort((a, b) => Services.vc.compare(b, a))[0] as string
      }
      catch (err) {
        log.error('errorreport.latest.zotero:', err)
      }
    }

    await Promise.allSettled([bbt(), zotero()])

    if (this.bbt.running.split('.').length >= 3 && this.bbt.running !== this.bbt.available) {
      this.bbt.upgrade = true
      this.bbt.message.running = l10n.localize('better-bibtex_error-report_better-bibtex_current', { version: this.bbt.running })
      this.bbt.message.available = l10n.localize('better-bibtex_error-report_better-bibtex_latest', { version: this.bbt.available || '<could not be established>' })
    }

    if (this.zotero.running !== this.zotero.available) {
      this.zotero.upgrade = true
      this.zotero.message.running = l10n.localize('better-bibtex_error-report_better-bibtex_current_zotero', { version: this.zotero.running })
      this.zotero.message.available = l10n.localize('better-bibtex_error-report_better-bibtex_latest_zotero', { version: this.zotero.available || '<could not be established>' })
    }
  }
}
const upgrades = new Upgrades

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

      (<HTMLInputElement> this.document.getElementById('better-bibtex-report-id')).value = `${this.name()}/${Zotero.version}/${running}`
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

    wizard.getPageById('page-enable-debug').hidden = !!Zotero.Debug.storing
    wizard.getPageById('page-upgrade').hidden = !(upgrades.bbt.upgrade || upgrades.zotero.upgrade)

    while (wizard.currentPage.hidden) {
      wizard.pageIndex += 1
    }

    wizard.canRewind = wizard.currentPage !== wizard.getPageById('page-done')
  }

  public restartWithDebugEnabled(): void {
    const buttonFlags = Services.prompt.BUTTON_POS_0 * Services.prompt.BUTTON_TITLE_IS_STRING
      + Services.prompt.BUTTON_POS_1 * Services.prompt.BUTTON_TITLE_CANCEL
      + Services.prompt.BUTTON_POS_2 * Services.prompt.BUTTON_TITLE_IS_STRING
    const index = Services.prompt.confirmEx(
      null,
      Zotero.getString('zotero.debugOutputLogging'),
      Zotero.getString('zotero.debugOutputLogging.enabledAfterRestart', [Zotero.clientName]),
      buttonFlags,
      Zotero.getString('general.restartNow'),
      null, Zotero.getString('general.restartLater'), null, { value: false }
    )

    if (index !== 1) Zotero.Prefs.set('debug.store', true)

    if (index === 0) Zotero.Utilities.Internal.quit(true)
  }

  public zip(): Uint8Array {
    const files: Record<string, Uint8Array> = {}
    const enc = new TextEncoder
    const name = this.name()

    files[`${ name }/debug.txt`] = enc.encode(this.report.log)

    if (this.report.items) files[`${ name }/items.json`] = enc.encode(this.report.items)
    if (this.config.cache) {
      files[`${ name }/database.json`] = enc.encode(JSON.stringify(KeyManager.all()))
      files[`${ name }/cache.json`] = enc.encode(this.report.cache)
    }
    if (this.report.acronyms) files[`${ name }/acronyms.csv`] = enc.encode(this.report.acronyms)

    return new Uint8Array(UZip.encode(files) as ArrayBuffer)
  }

  public async save(): Promise<void> {
    const filename = await new FilePickerHelper('Logs', 'save', [[ 'Zip Archive (*.zip)', '*.zip' ]], `${this.name()}.zip`).open()
    if (filename) await IOUtils.write(filename, this.zip(), { tmpPath: filename + '.tmp' })
  }

  private async ping(region: string) {
    await Zotero.HTTP.request('GET', `https://s3.${ region }.amazonaws.com${ s3.region[region].tld || '' }/ping`, { noCache: true })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { region, ...s3.region[region] }
  }

  private setValue(id: string, value: string) {
    const text = <HTMLInputElement> this.document.getElementById(id)
    text.hidden = !value

    if (text.nodeName.toLowerCase() === 'description') {
      text.textContent = value
    }
    else {
      text.value = value
    }

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
      .map(line => line.replace($home, '$HOME'))
      .join('\n')
  }

  private errors(): string {
    return this.scrub(Zotero.getErrors(true))
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
          this.config[facet] = this.config[facet] || !!this.input.items
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
    try {
      this.setValue('better-bibtex-report-cache', this.cacheState = l10n.localize('better-bibtex_error-report_better-bibtex_cache', { entries: await Cache.count() }))
    }
    catch (err) {
      log.error('cache: failed getting cache count', err)
      this.setValue('better-bibtex-report-cache', this.cacheState = l10n.localize('better-bibtex_error-report_better-bibtex_cache', { entries: -1 }))
    }

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

    const continueButton = wizard.getButton('next')
    continueButton.disabled = true
    await upgrades.init()
    this.show()

    this.setValue('better-bibtex-error-send-reminder', l10n.localize('better-bibtex-error-send-reminder', { send: continueButton.getAttribute('label') }))

    wizard.getPageById('page-enable-debug').addEventListener('pageshow', this.show.bind(this))
    wizard.getPageById('page-upgrade').addEventListener('pageshow', this.show.bind(this))
    wizard.getPageById('page-review').addEventListener('pageshow', this.show.bind(this))
    wizard.getPageById('page-send').addEventListener('pageshow', () => { this.send().catch(err => log.error('could not send debug log:', err)) })
    wizard.getPageById('page-done').addEventListener('pageshow', this.show.bind(this))

    for (const cb of Array.from(this.document.getElementsByClassName('better-bibtex-error-report-facet')) as HTMLInputElement[]) {
      cb.addEventListener('command', this.reload.bind(this))
    }

    let cache = ''
    try {
      cache = JSON.stringify(await Cache.dump(), null, 2)
    }
    catch (err) {
      log.error('cache: could not get cache dump', err)
      cache = ''
    }

    const items = win.arguments[0].wrappedJSObject.items
    if (items && Zotero.BetterBibTeX.lastExportOptions) {
      items.config = items.config || {}
      items.config.options = JSON.parse(Zotero.BetterBibTeX.lastExportOptions)
    }

    this.input = {
      context: await this.context(),
      errors: this.errors(),
      // # 1896
      log: this.log(),
      items,
      cache,
    }
    const acronyms = PathUtils.join(Zotero.BetterBibTeX.dir, 'acronyms.csv')
    if (await File.exists(acronyms)) this.input.acronyms = await IOUtils.readUTF8(acronyms)

    await this.reload()

    this.setValue('better-bibtex-report-current-bbt', upgrades.bbt.message.running)
    this.setValue('better-bibtex-report-latest-bbt', upgrades.bbt.message.available)
    this.setValue('better-bibtex-report-current-zotero', upgrades.zotero.message.running)
    this.setValue('better-bibtex-report-latest-zotero', upgrades.zotero.message.available)

    try {
      // @ts-expect-error zotero-types does not export .any
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
    context += `Platform: ${ client.platform }${(ENV.get('SNAP') && ' snap') || (ENV.get('FLATPAK_SANDBOX_DIR') && ' flatpak') || ''}\n`

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
      if (value === defaults[key]) {
        settings.default += `  ${key} = ${ JSON.stringify(value) }\n`
      }
      else {
        settings.set += `  ${key} = ${JSON.stringify(value)} (default: ${JSON.stringify(defaults[key])})\n`
      }
    }
    if (settings.default) settings.default = `Settings at default:\n${ settings.default }`
    context += settings.set + settings.default

    for (const key of ['export.quickCopy.setting']) {
      context += `  Zotero: ${ key } = ${ JSON.stringify(Zotero.Prefs.get(key)) }\n`
    }

    const autoExports = AutoExport.all()
    if (autoExports.length) {
      context += 'Auto-exports:\n'
      for (const ae of autoExports) {
        context += `  path: ...${JSON.stringify(Path.basename(ae.path))}`
        switch (ae.type) {
          case 'collection':
            context += ` (${ Zotero.Collections.get(ae.id)?.name || '<collection>' })`
            break
          case 'library': {
            const lib = Zotero.Libraries.get(ae.id)
            context += ` (${(lib ? lib.name : '') || '<library>'})`
            break
          }
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

  public async open(items?: string): Promise<void> {
    const selection = async () => {
      let scope = null
      const zp = Zotero.getActiveZoteroPane()
      switch (items) {
        case 'collection':
        case 'library':
          scope = { type: 'collection', collection: zp.getSelectedCollection() }
          if (!scope.collection) scope = { type: 'library', id: zp.getSelectedLibraryID() }
          break

        case 'items':
          try {
            scope = { type: 'items', items: zp.getSelectedItems() }
          }
          catch (err) { // ZoteroPane.getSelectedItems() doesn't test whether there's a selection and errors out if not
            log.error('Could not get selected items:', err)
          }
      }

      if (!scope) return ''

      try {
        return await Zotero.BetterBibTeX.Translators.queueJob({
          translatorID: Zotero.BetterBibTeX.Translators.bySlug.BetterBibTeXJSON.translatorID,
          displayOptions: { worker: true, exportNotes: true, dropAttachments: true, Normalize: true },
          scope,
          timeout: 40,
        })
      }
      catch (err) {
        if (err.timeout) {
          log.error('errorreport: items timed out after', err.timeout, 'seconds')
          return 'Timeout retrieving items'
        }
        else {
          log.error('errorreport: could not get items', err)
          return `Error retrieving items: ${ err }`
        }
      }
    }

    items = items ? await selection() : ''

    Zotero.getMainWindow().openDialog(
      'chrome://zotero-better-bibtex/content/ErrorReport.xhtml',
      'better-bibtex-error-report',
      'chrome,centerscreen,modal',
      { wrappedJSObject: { items }})
  }
}
