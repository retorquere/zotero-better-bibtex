import schema from '../submodules/zotero/resource/schema/global/schema.json' with { type: 'json' }
export const Schema = schema
import { Serialized } from '../gen/typings/serialized'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ItemType {
  export type Field = {
    type: 'date' | 'text'

    itemType: string
    field: string
    baseField: string

    csl: string[]

    extra: string
    labels: string[]
  }

  export type Creator = {
    type: 'name'

    itemType: string
    creator: string
    primary: boolean

    csl: string[]

    extra: string
    labels: string[]
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
      if (scrub) delete item[field.field]
    }
  }
}

function uniq(list: string[]): string[] {
  return [...(new Set(list.filter(_ => _)))]
}
export const ItemType = new class $ItemType { // eslint-disable-line no-redeclare
  public schema = {
    fields: [] as ItemType.Field[],
    creators: [] as ItemType.Creator[],
  }
  public lookup = {
    type: {} as Record<string, string>,
    field: {} as Record<string, string>,
    creator: {} as Record<string, string>,
  }
  public labeled: (name: string) => ItemType.Field | ItemType.Creator

  public valid = {
    fields: {} as Record<string, Record<string, boolean>>,
    creators: {} as Record<string, Record<string, boolean>>,
  }

  constructor() {
    this.labeled = (name: string): ItemType.Field | ItemType.Creator => {
      name = name.toLowerCase()
      return this.schema.fields.find(_ => _.labels.includes(name)) || this.schema.creators.find(_ => _.labels.includes(name))
    }

    const date: Record<string, boolean> = Object.entries(schema.meta.fields)
      .reduce((acc, [ field, meta ]) => ({ ...acc, [field]: meta.type === 'date' }), { accessDate: true } as Record<string, boolean>)

    const cslmap: Record<string, string[]> = {}
    for (const [csl, zoteros] of Object.entries(schema.csl.fields.text)) {
      for (const zotero of zoteros) {
        this.lookup.field[csl.toLowerCase()] = zotero
        cslmap[zotero] ??= []
        cslmap[zotero].push(csl)
        if (csl === 'event-place') {
          cslmap.eventPlace ??= []
          cslmap.eventPlace.push(csl)
        }
      }
    }
    for (const [csl, zotero] of Object.entries(schema.csl.fields.date)) {
      cslmap[zotero] ??= []
      cslmap[zotero].push(csl)
      this.lookup.field[csl.toLowerCase()] = zotero
    }

    for (const [zotero, csl] of Object.entries(schema.csl.names)) {
      cslmap[zotero] ??= []
      cslmap[zotero].push(csl)
      this.lookup.field[csl.toLowerCase()] = zotero
    }

    for (const itemType of schema.itemTypes) {
      this.valid.fields[itemType.itemType] = {}
      this.lookup.type[itemType.itemType.toLowerCase()] = itemType.itemType

      for (const { field, baseField } of itemType.fields) {
        this.valid.fields[itemType.itemType][field] = true
        this.valid.fields[itemType.itemType][baseField || field] = true

        this.lookup.field[field.toLowerCase()] = field
        this.lookup.field[(baseField || field).toLowerCase()] = baseField || field

        const csl = uniq([...(cslmap[field] || []), ...(cslmap[baseField] || [])])
        this.schema.fields.push({
          type: date[field] || date[baseField] ? 'date' : 'text',

          itemType: itemType.itemType,
          field,
          baseField: baseField || '',
          csl,
          extra: this.toLabel(baseField || field),
          labels: uniq([
            this.toLabel(field),
            field,
            this.toLabel(baseField),
            baseField,
            schema.locales['en-US'].fields[field],
            schema.locales['en-US'].fields[baseField],
            ...csl,
            ...(csl.map(l => this.toLabel(l))),
          ]).map(_ => _.toLowerCase()),
        })
      }

      for (const { creatorType, primary } of itemType.creatorTypes) {
        this.valid.creators[creatorType] = {}
        this.lookup.creator[creatorType.toLowerCase()] = creatorType

        this.schema.creators.push({
          type: 'name',

          itemType: itemType.itemType,
          creator: creatorType,
          primary: !!primary,
          csl: cslmap[creatorType] || [],
          extra: this.toLabel(creatorType),
          labels: uniq([
            this.toLabel(creatorType),
            creatorType,
            schema.locales['en-US'].creatorTypes[creatorType],
            ...((cslmap[creatorType] || []).map(l => this.toLabel(l))),
          ]).map(_ => _.toLowerCase()),
        })
      }
    }

    /*
    for (const [ csl, zoteroTypes ] of Object.entries(schema.csl.types)) {
      for (const zotero of zoteroTypes) {
        this.csl.types.insert({ csl, zotero })
      }
    }
    */
  }

  public field(field: string, itemType = ''): ItemType.Field {
    field = this.lookup.field[field.toLowerCase()] || field
    itemType = this.lookup.type[itemType.toLowerCase()] || itemType
    return this.schema.fields.find(f => (f.field === field || f.baseField === field) && (!itemType || (itemType === f.itemType)))
  }

  public typeOf(fieldName: string): 'date' | 'name' | 'text' {
    return (this.schema.fields.find(_ => _.field === fieldName || _.baseField === fieldName) || this.schema.creators.find(_ => _.creator === fieldName))?.type
  }

  public toLabel(name: string): string {
    if (!name) return ''
    return name
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/^./, c => c.toUpperCase())
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
