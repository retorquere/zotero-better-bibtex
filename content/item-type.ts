import loki, { Collection } from 'lokijs'
loki.LokiOps.$eqi = (a, b) => {
  if (typeof a !== 'string' || typeof b != 'string') return false
  return a.toLowerCase() === b.toLowerCase()
}

import schema from '../submodules/zotero/resource/schema/global/schema.json' with { type: 'json' }
import SchemaSample from '../submodules/zotero/resource/schema/global/schema.json'
type ItemSchema = typeof SchemaSample

import { Serialized } from '../gen/typings/serialized'

export type Field = {
  itemType: string
  field: string
  baseField: string | null
  date: boolean
  label: string
  extra: string
}
export type Creator = {
  itemType: string
  creator: string
  primary: boolean
  label: string
  extra: string
}
export type CSLMapping = {
  kind: 'type' | 'field' | 'creator'
  csl: string
  zotero: string
  extra: string
}

export const ItemType = new class $ItemType {
  public db = new loki('schema')
  public fields: Collection<Field>
  public creators: Collection<Creator>
  public csl: Collection<CSLMapping>

  #validFields: Record<string, Record<string, boolean>> = {}

  constructor() {
    this.fields = this.db.addCollection<Field>('fields')
    this.creators = this.db.addCollection<Creator>('creators')
    this.csl = this.db.addCollection<CSLMapping>('csl')
  }

  private extra(name: string): string {
    return name.replace(/[A-Z]/, c => ` ${c.toLowerCase()}`).replace(/^./, c => c.toUpperCase())
  }

  public async load(): Promise<any> {
    const schema: ItemSchema = (await (await fetch('resource://zotero/schema/global/schema.json')).json()) as unknown as ItemSchema
    const date: Record<string, boolean> = {
      accessDate: true,
    }
    for (const [ field, meta ] of Object.entries(schema.meta.fields)) {
      date[field] = meta.type === 'date'
    }
    for (const itemType of schema.itemTypes) {
      for (const { field, baseField } of itemType.fields) {
        this.fields.insert({
          itemType: itemType.itemType,
          field,
          baseField: baseField || null,
          date: date[field] || date[baseField] || false,
          label: schema.locales['en-US'].fields[field || baseField],
          extra: this.extra(field),
        })
      }
      for (const { creatorType, primary } of itemType.creatorTypes) {
        this.creators.insert({
          itemType: itemType.itemType,
          creator: creatorType,
          primary: !!primary,
          label: schema.locales['en-US'].creatorTypes[creatorType],
          extra: this.extra(creatorType),
        })
      }
    }

    for (const [ csl, zoteroTypes ] of Object.entries(schema.csl.types)) {
      for (const zotero of zoteroTypes) {
        this.csl.insert({ kind: 'type', csl, zotero, extra: this.extra(csl) })
      }
    }
    for (const kind of ['text', 'date']) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      for (const [ csl, zoteroFields ] of Object.entries(schema.csl.fields[kind]) as [ string, string[] ][]) {
        for (const zotero of zoteroFields) {
          this.csl.insert({ kind: 'field', csl, zotero, extra: this.extra(csl) })
        }
      }
    }
    for (const [ zotero, csl ] of Object.entries(schema.csl.names)) {
      this.csl.insert({ kind: 'creator', csl, zotero, extra: this.extra(csl) })
    }

    this.fields.ensureAllIndexes(true)
    this.creators.ensureAllIndexes(true)
    this.csl.ensureAllIndexes(true)

    return this.db.collections.reduce((acc, collection) => {
      acc[collection.name] = collection.data
      return acc
    }, {})
  }

  validFields(itemType: string) {
    if (!this.#validFields[itemType]) {
      const fields = this.fields.find({ itemType })
      if (!fields.length) throw new Error(`unexpected item type ${JSON.stringify(itemType)}`)

      this.#validFields[itemType] = {}
      for (const field of fields) {
        this.#validFields[itemType][field.field] = true
        if (field.baseField) this.#validFields[itemType][field.baseField] = true
      }
    }

    return this.#validFields[itemType]
  }

  public serialize(): string {
    return this.db.serialize()
  }

  public unserialize(serialized: string) {
    this.db.loadJSON(serialized)
    this.fields = this.db.getCollection<Field>('fields')
    this.creators = this.db.getCollection<Creator>('creators')
    this.csl = this.db.getCollection<CSLMapping>('csl')
  }

  private unalias(item: any, scrub = true): void {
    delete item.inPublications

    for (const { field, baseField } of this.fields.find({ itemType: item.itemType, baseField: { $ne: null } })) {
      if (baseField) {
        item[baseField] ||= item[field]
        if (scrub) delete item[field]
      }
    }
  }

  // import & export translators expect different creator formats... nice
  public simplifyForExport(item: any, { creators = true, scrub = true }: { creators?: boolean; scrub?: boolean } = {}): Serialized.Item {
    this.unalias(item, scrub)

    if (item.filingDate) item.filingDate = item.filingDate.replace(/^0000-00-00 /, '')

    if (creators && item.creators) {
      for (const creator of item.creators) {
        if (creator.fieldMode) {
          creator.name = creator.name || creator.lastName
          delete creator.lastName
          delete creator.firstName
          delete creator.fieldMode
        }
      }
    }

    if (item.itemType === 'attachment' || item.itemType === 'note') {
      delete item.attachments
      delete item.notes
    }
    else {
      item.attachments ??= []
    }

    return item as Serialized.Item
  }

  public simplifyForImport(item: any, multi = false): Serialized.Item {
    // this.unalias(item, { scrub: true })

    if (item.creators) {
      for (const creator of item.creators) {
        if (creator.name) {
          creator.lastName = creator.lastName || creator.name
          creator.fieldMode = 1
          delete creator.firstName
          delete creator.name
        }
        if (!multi) delete creator.multi
      }
    }

    if (!multi) delete item.multi

    return item as Serialized.Item
  }
}
