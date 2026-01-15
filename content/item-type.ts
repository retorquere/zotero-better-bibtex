import loki, { Collection } from 'lokijs'
loki.LokiOps.$eqi = (a, b) => {
  if (typeof a !== 'string' || typeof b != 'string') return false
  return a.toLowerCase() === b.toLowerCase()
}

import schema from '../submodules/zotero/resource/schema/global/schema.json' with { type: 'json' }
export const Schema = schema
import { Serialized } from '../gen/typings/serialized'

export namespace ItemType {
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
    // label: string
    // extra: string
  }
}

export namespace CSL {
  export type Mapping = {
    csl: string
    zotero: string
    // extra: string
  }
}

function unalias(item: Serialized.Item, scrub = true) {
  // @ts-expect-error TS2339
  delete item.inPublications

  const itemType = schema.itemTypes.find(it => it.itemType === item.itemType)
  if (!itemType) return
  for (const field of itemType.fields) {
    if (field.baseField && item[field.field] && !item[field.baseField]) {
      item[field.baseField] = item[field.field]
      delete item[field.field]
    }
  }
}

export const ItemType = new class $ItemType {
  public db = new loki('schema')
  public fields: Collection<ItemType.Field>
  public creators: Collection<ItemType.Creator>
  public types: string[] = Object.keys(schema.itemTypes)

  public csl: { types: Collection<CSL.Mapping>; fields: Collection<CSL.Mapping>; creators: Collection<CSL.Mapping> }

  #validFields: Record<string, Record<string, boolean>> = {}

  constructor() {
    this.fields = this.db.addCollection<ItemType.Field>('fields', { indices: ['itemType', 'field', 'baseField'] })
    this.creators = this.db.addCollection<ItemType.Creator>('creators', { indices: ['itemType', 'creator', 'primary'] })
    this.csl = {
      types: this.db.addCollection<CSL.Mapping>('csl.types', { indices: ['csl', 'zotero'] }),
      fields: this.db.addCollection<CSL.Mapping>('csl.types', { indices: ['csl', 'zotero'] }),
      creators: this.db.addCollection<CSL.Mapping>('csl.types', { indices: ['csl', 'zotero'] }),
    }

    const date: Record<string, boolean> = Object.entries(schema.meta.fields)
      .reduce((acc, [ field, meta ]) => ({ ...acc, [field]: meta.type === 'date' }), { accessDate: true } as Record<string, boolean>)

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
          // label: schema.locales['en-US'].creatorTypes[creatorType],
        })
      }
    }

    for (const [ csl, zoteroTypes ] of Object.entries(schema.csl.types)) {
      for (const zotero of zoteroTypes) {
        this.csl.types.insert({ csl, zotero })
      }
    }

    for (const kind of ['text', 'date']) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      for (const [ csl, zoteroFields ] of Object.entries(schema.csl.fields[kind]) as [ string, string[] ][]) {
        for (const zotero of zoteroFields) {
          this.csl.fields.insert({ csl, zotero })
        }
      }
    }
    for (const [ zotero, csl ] of Object.entries(schema.csl.names)) {
      this.csl.creators.insert({ csl, zotero })
    }

    this.fields.ensureAllIndexes(true)
    this.creators.ensureAllIndexes(true)
    this.csl.types.ensureAllIndexes(true)
    this.csl.fields.ensureAllIndexes(true)
    this.csl.creators.ensureAllIndexes(true)
  }

  public field(field: string, itemType?: string): ItemType.Field {
    const q = { $or: [ { field: { $eqi: field } }, { baseField: { $eqi: field } } ] }
    // @ts-expect-error TS2339
    if (itemType) q.itemType = itemType
    return this.fields.findOne({ $or: [ { field: { $eqi: field } }, { baseField: { $eqi: field } } ] })
  }

  private extra(name: string): string {
    return name.replace(/[A-Z]/, c => ` ${c.toLowerCase()}`).replace(/^./, c => c.toUpperCase())
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

  // import & export translators expect different creator formats... nice
  public simplifyForExport(item: any, { creators = true, scrub = true }: { creators?: boolean; scrub?: boolean } = {}): Serialized.Item {
    unalias(item, scrub)

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

    if (item.itemType === 'attachment' || item.itemType === 'note' || item.itemType === 'annotation') {
      delete item.attachments
      delete item.notes
    }
    else {
      item.attachments ??= []
      item.notes ??= []
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

// maps variable to its extra-field label
export const label: Record<string, string> = {}

// valid types and fields per type
export const valid: {
  type: Record<string, boolean>
  field: Record<string, Record<string, boolean>>
  creators: Record<string, string[]>
} = {
  type: {},
  field: {},
  creators: {},
}

for (const itemType of schema.itemTypes) {
  valid.type[itemType.itemType] = true
  valid.field[itemType.itemType] = {}
  valid.creators[itemType.itemType] = []
  itemType.creatorTypes = [
    ...itemType.creatorTypes.filter(c => c.primary),
    ...itemType.creatorTypes.filter(c => !c.primary),
  ]

  for (const field of itemType.fields) {
    label[field.field.toLowerCase()] = label[(field.baseField || field.field).toLowerCase()] = (field.baseField || field.field).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase())
    valid[itemType.itemType][field.field] = valid[itemType.itemType][field.baseField || field.field] = true
  }
  for (const creatorType of itemType.creatorTypes) {
    valid.creators[itemType.itemType].push(creatorType.creatorType)
  }
}
