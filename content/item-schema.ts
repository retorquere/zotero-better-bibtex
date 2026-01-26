import $zotero from '../submodules/zotero/resource/schema/global/schema.json' with { type: 'json' }
import $csl from '../submodules/citation-style-language-schema/schemas/input/csl-data.json' with { type: 'json' }
import { Serialized } from '../gen/typings/serialized'

/*
function tostring(o): string {
  if (Array.isArray(o)) return JSON.stringify(o)

  if (o === null) return 'null'
  if (o === undefined) return 'undefined'

  switch (typeof o) {
    case 'object': return JSON.stringify(o)
  }

  return `${o}`
}

function print(strings, ...args) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Array.from({ length: Math.max(strings.length, args.length) }, (_, i) => `${strings[i] ?? ''}${tostring(args[i] ?? '')}`).join('') + '\n'
}
*/

function LookUp<T = string>(textOnly = false): Record<string, T> {
  function simplify(prop: string): string {
    prop = prop.toLowerCase()
    if (textOnly) prop = prop.replace(/[^a-z]/g, '')
    return prop
  }
  return new Proxy({} as Record<string, T>, { // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
    get(target, prop) {
      if (typeof prop !== 'string') return undefined
      return target[simplify(prop)]
    },

    set(target, prop, value) {
      if (typeof prop !== 'string') return false
      prop = simplify(prop)
      if (!prop) return false
      target[prop] = value
      return true
    },

    has(target, prop) {
      if (typeof prop !== 'string') return false
      return simplify(prop) in target
    },

    deleteProperty(target, prop) {
      if (typeof prop === 'string') return delete target[simplify(prop)]
    },
  }) as Record<string, T>
}

export type FieldType = 'date' | 'name' | 'text'

export const Schema = new class $Schema {
  public zotero = $zotero
  public csl = $csl.items.properties

  public lookup = {
    baseField: LookUp(),
    itemType: LookUp(),
    creatorType: LookUp(),
  }

  public labeled = {
    zotero: LookUp<{ field: string; type: FieldType }>(true),
    csl: LookUp<{ field: string; type: FieldType }>(true),
  }

  public extra = LookUp()
  #extra = {
    numPages: ['Number of pages'],
  }

  public type = {
    zotero: {} as Record<string, FieldType>,
    csl: {} as Record<string, FieldType>,
  }
  public primaryCreator: Record<string, string> = {}

  public valid = {
    fields: {} as Record<string, Record<string, boolean>>,
    creators: {} as Record<string, Record<string, boolean>>,
  }

  constructor() {
    // schema fixes
    // @ts-expect-error no idea why this is not in the zotero schema
    this.zotero.meta.fields.accessDate = { type: 'date' }

    if (!this.zotero.itemTypes.find(itemType => itemType.fields.find(field => field.field === 'volumeTitle'))) {
      this.zotero.itemTypes.find(itemType => itemType.itemType === 'book').fields.push({ field: 'volumeTitle' })
      this.zotero.csl.fields.text['volume-title'] = [ 'volumeTitle' ]
    }

    if (!this.zotero.itemTypes.find(itemType => itemType.fields.find(field => field.field === 'eventDate'))) {
      // not sure how this ended up in the test suite
      this.zotero.itemTypes.find(itemType => itemType.itemType === 'conferencePaper').fields.push({ field: 'eventDate' })
      // @ts-expect-error
      this.zotero.meta.fields.eventDate = { type: 'date' }
      this.zotero.csl.fields.date['event-date'] = 'eventDate'
    }
    // end of schema fixes

    for (const { itemType, fields, creatorTypes } of this.zotero.itemTypes) {
      this.valid.fields[itemType] = {}
      this.valid.creators[itemType] = {}
      this.lookup.itemType[itemType] = itemType
      this.primaryCreator[itemType] = ''

      for (const { field, baseField } of fields) {
        this.valid.fields[itemType][field] = this.valid.fields[itemType][baseField || field] = true
        const type = this.type.zotero[field] = this.type.zotero[baseField || field] = (this.zotero.meta.fields[baseField] || this.zotero.meta.fields[field])?.type || 'text'
        this.lookup.baseField[field] = this.lookup.baseField[baseField || field] = baseField || field
        this.extra[field] = this.#extra[field] || this.toLabel(field)
        if (baseField) this.extra[baseField] = this.#extra[baseField] || this.toLabel(baseField)

        const labels = [
          field,
          baseField,
          this.zotero.locales['en-US'].fields[field],
          this.zotero.locales['en-US'].fields[baseField],
          ...this.cslAliases(field),
          ...this.cslAliases(baseField),
          ...(this.#extra[field] || []),
        ]
        for (const label of labels) {
          if (label) this.labeled.zotero[label] ??= { field: baseField || field, type }
        }
      }

      for (const { creatorType, primary } of creatorTypes) {
        this.valid.creators[itemType][creatorType] = true
        this.lookup.creatorType[creatorType] = creatorType
        this.type.zotero[creatorType] = 'name'
        if (primary) this.primaryCreator[itemType] = creatorType
        this.extra[creatorType] = this.toLabel(creatorType)

        const labels = [
          creatorType,
          this.zotero.locales['en-US'].creatorTypes[creatorType],
          ...this.cslAliases(creatorType),
        ]
        for (const label of labels) {
          if (label) this.labeled.zotero[label] ??= { field: creatorType, type: 'name' }
        }
      }
    }

    const csltype = (type): FieldType => {
      if (Array.isArray(type.type)) {
        if (type.type.includes('number')) return 'text'
        if (type.type.includes('string')) return 'text'
        return (type.type as string[]).join('/') as 'text'
      }

      switch (type.$ref) {
        case '#/definitions/name-variable': return 'name'
        case '#/definitions/date-variable': return 'date'
      }

      switch (type.type) {
        case 'string': return 'text'
        case 'number': return 'text'
        case 'array': return csltype(type.items)
        case 'object': return null
      }
    }
    for (const [ field, type ] of Object.entries(this.csl)) {
      this.type.csl[field] = csltype(type)
      const labels = [
        field,
        ...this.zoteroAliases(field),
      ]
      for (const label of labels) {
        if (label) this.labeled.csl[label] ??= { field, type: this.type.csl[field] }
      }
    }
  }

  public toLabel(name: string): string {
    if (!name) return ''
    return name
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/ [A-Z]+/g, m => m.toLowerCase())
      .replace(/^./, c => c.toUpperCase())
  }

  private cslAliases(fieldName: string): string[] {
    return [
      ...(Object.entries(this.zotero.csl.fields.text).map(([cslField, zoteroFields]) => zoteroFields[0] === fieldName ? cslField : null)),
      ...(Object.entries(this.zotero.csl.fields.date).map(([cslField, zoteroField]) => zoteroField === fieldName ? cslField : null)),
      ...(Object.entries(this.zotero.csl.names).map(([zoteroField, cslField]) => zoteroField === fieldName ? cslField : null)),
    ].filter(alias => typeof alias === 'string')
  }

  private zoteroAliases(fieldName: string): string[] {
    return [
      ...(this.zotero.csl.fields.text[fieldName] || []),
      this.zotero.csl.fields.date[fieldName],
      ...(Object.entries(this.zotero.csl.names).map(([zoteroField, cslField]) => cslField === fieldName ? zoteroField : null)),
    ].filter(alias => typeof alias === 'string')
  }
}

function unalias(item: Serialized.RegularItem, scrub = true) {
  // @ts-expect-error TS2339
  delete item.inPublications

  const itemType = Schema.zotero.itemTypes.find(it => it.itemType === item.itemType)
  if (!itemType) return
  for (const { field, baseField } of itemType.fields) {
    if (baseField && item[field] && !item[baseField]) {
      item[baseField] = item[field]
      if (scrub) delete item[field]
    }
  }
}

export function simplifyForExport(item: Serialized.RegularItem, { creators = true, scrub = true }: { creators?: boolean; scrub?: boolean } = {}): Serialized.RegularItem {
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

  // @ts-expect-error fallback for attachments and notes
  if (item.itemType === 'attachment' || item.itemType === 'note' || item.itemType === 'annotation') {
    delete item.attachments
    delete item.notes
  }
  else {
    item.attachments ??= []
    item.notes ??= []
  }

  return item
}

export function simplifyForImport(item: Serialized.RegularItem, multi = false): Serialized.RegularItem {
  // this.unalias(item, { scrub: true })

  if (item.creators) {
    for (const creator of item.creators) {
      if (creator.name) {
        creator.lastName = creator.lastName || creator.name
        creator.fieldMode = 1
        delete creator.firstName
        delete creator.name
      }

      // @ts-expect-error jurism
      if (!multi) delete creator.multi
    }
  }

  if (!multi) delete item.multi

  return item
}
