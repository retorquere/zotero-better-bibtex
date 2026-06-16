import type { Data as CSLItem } from 'csl-json'
import { log } from '../logger'

const ITEM_PREFIX = 'ITEM CSL_CITATION '
const NOTE_ID_COMMENT = /<!--\s*zotero-note-id:(?<id>\d+)\s*-->/
const DEFAULT_DOC_ID = 'BetterBibTeX'
const DEFAULT_PROCESSOR_NAME = 'Better BibTeX'

export class IntegrationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IntegrationError'
  }
}

type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

export type StateField = {
  id: string
  code?: string
  text?: string
  note_index?: number
  adjacent?: boolean
}

export type SavedDocument = {
  output_format?: string
  supported_notes?: string[]
  data?: string
  fields?: StateField[]
}

export type State = {
  documents?: Record<string, SavedDocument>
}

type FieldPayload = {
  id: string
  code: string
  text: string
  noteIndex: number
  adjacent: boolean
}

type CommandRequest = {
  command: string
  arguments?: unknown[]
}

export type PickItem = {
  id?: number | string
  uris?: string[]
  itemData?: CSLItem
  locator?: string
  label?: string
  'suppress-author'?: boolean
  prefix?: string
  suffix?: string
  [key: string]: unknown
}

export type PickResult = {
  citationID?: string
  properties?: {
    formattedCitation?: string
    plainCitation?: string
    noteIndex?: number
  }
  citationItems?: PickItem[]
  schema?: string
}

type AnnotationCitationItem = {
  id?: number | string
  uris?: string[]
  itemData?: CSLItem
  locator?: string
  label?: string
  'suppress-author'?: boolean
  prefix?: string
  suffix?: string
}

type AnnotationData = {
  attachmentURI?: string
  pageLabel?: string
  citationItem?: AnnotationCitationItem
}

type EmbeddedCitationData = {
  citationItems?: PickItem[]
  properties?: PickResult['properties']
}

type EmbeddedCitationItems = PickItem[]

type PickerOptions = {
  documentId?: string
  processorName?: string
  state?: State
}

type SyntheticNoteItem = {
  id?: number
  type: 'note'
  note: string
  title: string
  nonCSL: true
  source: 'cayw-inserted-note'
}

type Picked
  = { kind: 'field'; field: Field }
  | { kind: 'note'; text: string }

class Field {
  public id: string
  public code: string
  public text: string
  public noteIndex: number
  public adjacent: boolean

  constructor({ id, code = '', text = '{Placeholder}', noteIndex = 0, adjacent = false }: {
    id: string
    code?: string
    text?: string
    noteIndex?: number
    adjacent?: boolean
  }) {
    this.id = id
    this.code = code
    this.text = text
    this.noteIndex = noteIndex
    this.adjacent = adjacent
  }

  public static fromState(field: StateField): Field {
    return new Field({
      id: field.id,
      code: field.code ?? '',
      text: field.text ?? '{Placeholder}',
      noteIndex: field.note_index ?? 0,
      adjacent: field.adjacent ?? false,
    })
  }

  public toState(): StateField {
    return {
      id: this.id,
      code: this.code,
      text: this.text,
      note_index: this.noteIndex,
      adjacent: this.adjacent,
    }
  }

  public asPayload(): FieldPayload {
    return {
      id: this.id,
      code: this.code,
      text: this.text,
      noteIndex: this.noteIndex,
      adjacent: this.adjacent,
    }
  }
}

class Document {
  public id: string
  public outputFormat: string
  public supportedNotes: string[]
  public data: string
  public fields: Field[]

  constructor({ id, outputFormat = 'html', supportedNotes = ['footnotes'], data = '', fields = [] }: {
    id: string
    outputFormat?: string
    supportedNotes?: string[]
    data?: string
    fields?: Field[]
  }) {
    this.id = id
    this.outputFormat = outputFormat
    this.supportedNotes = supportedNotes
    this.data = data
    this.fields = fields
  }

  public static load(documentId: string, state: State): Document {
    const saved = state.documents?.[documentId] ?? {}
    return new Document({
      id: documentId,
      outputFormat: saved.output_format ?? 'html',
      supportedNotes: saved.supported_notes ?? ['footnotes'],
      data: saved.data ?? '',
      fields: (saved.fields ?? []).map(field => Field.fromState(field)),
    })
  }

  public save(state: State): void {
    state.documents ??= {}
    state.documents[this.id] = {
      output_format: this.outputFormat,
      supported_notes: [...this.supportedNotes],
      data: this.data,
      fields: this.fields.map(field => field.toState()),
    }
  }

  public cursorInField(_fieldType: string): null {
    return null
  }

  public canInsertField(_fieldType: string): boolean {
    return true
  }

  public insertField(_fieldType: string, noteType: number): FieldPayload {
    if (!Number.isInteger(noteType)) {
      throw new IntegrationError('noteType must be an integer')
    }

    const field = new Field({ id: String(this.fields.length) })
    this.fields.push(field)
    return field.asPayload()
  }

  public getFields(_fieldType: string): FieldPayload[] {
    return this.fields.map(field => field.asPayload())
  }

  public setDocumentData(data: string): void {
    this.data = data
  }

  public getDocumentData(): string {
    return this.data
  }
}

function createDefaultDocumentData(documentId: string): string {
  return `<data data-version="3" zotero-version="9.0.4">
              <session id="${ documentId }"/>
                <style id="http://www.zotero.org/styles/chicago-shortened-notes-bibliography" locale="en-GB" hasBibliography="1" bibliographyStyleHasBeenSet="0"/>
                <prefs>
                  <pref name="fieldType" value="Http"/>
                  <pref name="automaticJournalAbbreviations" value="true"/>
                  <pref name="noteType" value="1"/>
                </prefs>
              </data>`
}

export function createDefaultState(documentId = DEFAULT_DOC_ID): State {
  return {
    documents: {
      [documentId]: {
        output_format: 'html',
        supported_notes: [ 'footnotes' ],
        data: createDefaultDocumentData(documentId),
        fields: [],
      },
    },
  }
}

async function postJson(url: string, payload: unknown): Promise<unknown> {
  let response: Response

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'zotero-allowed-request': 'true',
      },
      body: JSON.stringify(payload),
    })
  }
  catch (err) {
    if (err instanceof TypeError) {
      throw new IntegrationError(`Could not connect to Zotero at ${url}: ${err.message}`)
    }
    throw err
  }

  const body = (await response.text()).trim()

  if (!response.ok) {
    throw new IntegrationError(`HTTP ${response.status} from ${url}: ${body || response.statusText}`)
  }

  if (!body) return null

  try {
    return JSON.parse(body) as Json
  }
  catch (err) {
    if (err instanceof SyntaxError) {
      throw new IntegrationError(`Invalid JSON from ${url}: ${body}`)
    }
    throw err
  }
}

function getField(document: Document, index: unknown): Field {
  const idx = Number(index)
  if (!Number.isInteger(idx) || idx < 0 || idx >= document.fields.length) {
    throw new IntegrationError(`Invalid field index: ${describe(index)}`)
  }
  return document.fields[idx]
}

function describe(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return `${ value }`
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (value == null) return 'null'
  if (Array.isArray(value)) return JSON.stringify(value)

  try {
    const serialized = JSON.stringify(value)
    if (typeof serialized === 'string') return serialized
    return '[Unserializable value]'
  }
  catch {
    return '[Unserializable value]'
  }
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function extractNoteID(text: string): { text: string; id?: number } {
  const match = text.match(NOTE_ID_COMMENT)
  if (!match) return { text }

  return {
    text: text.replace(NOTE_ID_COMMENT, ''),
    id: Number(match.groups?.id),
  }
}

function parseEmbeddedJSON<T>(encoded: string | null): T | null {
  if (!encoded) return null

  try {
    return JSON.parse(decodeURIComponent(encoded)) as T
  }
  catch {
    return null
  }
}

async function annotationCitationItem(annotation: AnnotationData): Promise<PickItem | null> {
  if (!annotation.citationItem) return null

  const item = { ...annotation.citationItem }
  await resolveItemID(item, annotation.attachmentURI)

  if ((!item.locator || typeof item.locator !== 'string') && typeof annotation.pageLabel === 'string' && annotation.pageLabel) {
    item.locator = annotation.pageLabel
  }
  if (item.locator && typeof item.label !== 'string') {
    item.label = 'page'
  }

  return item
}

async function resolveItemID(item: PickItem, fallbackURI?: string): Promise<void> {
  if (typeof item.id === 'number' && Number.isInteger(item.id)) return

  const itemDataID = item.itemData && 'id' in item.itemData ? item.itemData.id : undefined
  const uri = [
    typeof item.id === 'string' ? item.id : undefined,
    typeof itemDataID === 'string' ? itemDataID : undefined,
    Array.isArray(item.uris) ? item.uris[0] : undefined,
    fallbackURI,
  ].find(candidate => typeof candidate === 'string' && candidate.startsWith('http'))

  if (!uri) return

  const resolved = await Zotero.URI.getURIItem(uri)
  if (!resolved) return

  item.id = typeof resolved.parentID === 'number' ? resolved.parentID : resolved.id
}

function pickItemSignature(item: PickItem): string {
  return JSON.stringify({
    id: item.id ?? '',
    uri: Array.isArray(item.uris) ? item.uris[0] || '' : '',
    locator: typeof item.locator === 'string' ? item.locator : '',
    prefix: typeof item.prefix === 'string' ? item.prefix : '',
    suffix: typeof item.suffix === 'string' ? item.suffix : '',
  })
}

export class Picker {
  public readonly documentId: string
  public readonly processorName: string
  public state: State
  private readonly baseURL: string
  private readonly execCommandURL: string
  private readonly respondURL: string
  private document: Document
  private readonly domParser: DOMParser
  private picked: Picked[]

  constructor({ documentId = DEFAULT_DOC_ID, processorName = DEFAULT_PROCESSOR_NAME, state }: PickerOptions = {}) {
    this.documentId = documentId
    this.processorName = processorName
    this.baseURL = `http://127.0.0.1:${Zotero.Prefs.get('httpServer.port')}/connector/document`
    this.execCommandURL = `${this.baseURL}/execCommand`
    this.respondURL = `${this.baseURL}/respond`
    this.state = state ?? createDefaultState(this.documentId)
    this.document = Document.load(this.documentId, this.state)
    this.domParser = new DOMParser
    this.picked = []
  }

  public async pick(): Promise<PickResult[]> {
    try {
      let response = await postJson(this.execCommandURL, { command: 'addEditCitation', docId: this.document.id })

      while (true) {
        if (!response || typeof response !== 'object' || !('command' in response)) {
          throw new IntegrationError(`Unexpected Zotero response: ${describe(response)}`)
        }

        const commandRequest = response as CommandRequest
        const command = commandRequest.command
        const args = Array.isArray(commandRequest.arguments) ? commandRequest.arguments : []

        try {
          const payload = this.commandResponse(command, args)

          if (command === 'Document.complete') {
            break
          }

          response = await postJson(this.respondURL, payload)
        }
        catch (err) {
          const error = err instanceof Error ? err : new Error(String(err))
          await postJson(this.respondURL, {
            error: error.name,
            message: error.message,
            stack: error.stack ?? null,
          })
          throw err
        }
      }
    }
    finally {
      this.document.save(this.state)
      // await saveState(this.state)
    }

    return this.extractPickResults()
  }

  public getDocument(): Document {
    return this.document
  }

  private noteTitle(text: string): string {
    const html = text.startsWith('<html>') ? text : `<html><body>${ text }</body></html>`
    const doc = this.domParser.parseFromString(html, 'text/html')
    return (doc.body?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120)
  }

  private async noteCitationItems(text: string): Promise<PickItem[]> {
    const html = text.startsWith('<html>') ? text : `<html><body>${ text }</body></html>`
    const doc = this.domParser.parseFromString(html, 'text/html')
    const items: PickItem[] = []

    for (const node of doc.querySelectorAll('[data-citation-items]')) {
      const element = node as Element
      const citationItems = parseEmbeddedJSON<EmbeddedCitationItems>(element.getAttribute('data-citation-items'))
      if (!Array.isArray(citationItems)) continue
      for (const item of citationItems) {
        await resolveItemID(item)
        items.push(item)
      }
    }

    if (items.length) return items

    for (const node of doc.querySelectorAll('[data-annotation]')) {
      const element = node as Element
      const annotation = parseEmbeddedJSON<AnnotationData>(element.getAttribute('data-annotation'))
      const item = annotation ? await annotationCitationItem(annotation) : null
      if (item) items.push(item)
    }

    if (items.length) return items

    for (const node of doc.querySelectorAll('[data-citation]')) {
      const element = node as Element
      const citation = parseEmbeddedJSON<EmbeddedCitationData>(element.getAttribute('data-citation'))
      if (!citation?.citationItems?.length) continue
      items.push(...citation.citationItems)
    }

    return items
  }

  private commandResponse(command: string, args: unknown[]): unknown {
    if (command === 'Application.getActiveDocument') {
      return {
        documentID: this.document.id,
        outputFormat: this.document.outputFormat,
        supportedNotes: this.document.supportedNotes,
        processorName: this.processorName,
      }
    }

    if (!command.startsWith('Document.') && !command.startsWith('Field.')) {
      throw new IntegrationError(`Unsupported command: ${command}`)
    }

    const [docId, ...commandArgs] = args
    if (docId !== this.document.id) {
      throw new IntegrationError(`Unexpected document ID: ${describe(docId)}`)
    }

    switch (command) {
      case 'Document.displayAlert':
        return 0
      case 'Document.activate':
        return null
      case 'Document.canInsertField':
        return this.document.canInsertField(asString(commandArgs[0]))
      case 'Document.cursorInField':
        return this.document.cursorInField(asString(commandArgs[0]))
      case 'Document.getDocumentData':
        return this.document.getDocumentData()
      case 'Document.setDocumentData':
        this.document.setDocumentData(asString(commandArgs[0]))
        return null
      case 'Document.insertField': {
        const inserted = this.document.insertField(asString(commandArgs[0]), Number(commandArgs[1]))
        this.picked.push({ kind: 'field', field: this.document.fields[this.document.fields.length - 1] })
        return inserted
      }
      case 'Document.getFields':
        return this.document.getFields(asString(commandArgs[0]))
      case 'Document.convert':
        return null
      case 'Document.convertPlaceholdersToFields': {
        const placeholderIds = Array.isArray(commandArgs[0]) ? commandArgs[0] : []
        const noteType = Number(commandArgs[1])

        const converted: FieldPayload[] = []
        for (const placeholderId of placeholderIds) {
          const field = new Field({
            id: String(this.document.fields.length),
            code: String(placeholderId),
            noteIndex: noteType,
          })
          this.document.fields.push(field)
          this.picked.push({ kind: 'field', field })
          converted.push(field.asPayload())
        }

        return converted
      }
      case 'Document.insertText':
        this.picked.push({ kind: 'note', text: asString(commandArgs[0]) })
        return null
      case 'Document.setBibliographyStyle':
        return null
      case 'Document.complete':
        return null
      case 'Field.delete': {
        const field = getField(this.document, commandArgs[0])
        this.document.fields = this.document.fields.filter(existing => existing !== field)
        return null
      }
      case 'Field.select':
        return null
      case 'Field.removeCode':
        getField(this.document, commandArgs[0]).code = ''
        return null
      case 'Field.setText':
        getField(this.document, commandArgs[0]).text = asString(commandArgs[1])
        return null
      case 'Field.getText':
        return getField(this.document, commandArgs[0]).text
      case 'Field.setCode':
        getField(this.document, commandArgs[0]).code = asString(commandArgs[1])
        return null
      default:
        throw new IntegrationError(`Unsupported command: ${command}`)
    }
  }

  private async extractPickResults(): Promise<PickResult[]> {
    const picks: PickResult[] = []
    log.info('CAYW picked:', this.picked)
    const fieldPickSignatures: Set<string> = new Set

    for (const picked of this.picked) {
      if (picked.kind !== 'field') continue
      if (!picked.field.code.startsWith(ITEM_PREFIX)) continue

      const result = JSON.parse(picked.field.code.slice(ITEM_PREFIX.length)) as PickResult
      picks.push(result)
      for (const item of result.citationItems || []) {
        fieldPickSignatures.add(pickItemSignature(item))
      }
    }

    for (const picked of this.picked) {
      if (picked.kind === 'field') {
        continue
      }

      const { text, id } = extractNoteID(picked.text)
      const citationItems = await this.noteCitationItems(text)
      if (citationItems.length) {
        if (citationItems.some(item => fieldPickSignatures.has(pickItemSignature(item)))) continue
        picks.push({
          citationItems,
          properties: {},
        })
        continue
      }

      picks.push({
        citationItems: [{
          itemData: {
            ...(typeof id === 'number' ? { id } : {}),
            type: 'note',
            title: this.noteTitle(text),
            note: text,
            nonCSL: true,
            source: 'cayw-inserted-note',
          } as unknown as CSLItem & SyntheticNoteItem,
        }],
        properties: {},
      })
    }

    log.info('CAYW pick result:', picks)
    return picks
  }
}
