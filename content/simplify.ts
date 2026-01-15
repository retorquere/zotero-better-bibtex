import schema from '../submodules/zotero/resource/schema/global/schema.json' with { type: 'json' }

import { Serialized } from '../gen/typings/serialized.js'

function unalias(item: Serialized.Item, scrub = true) {
  delete item.inPublications

  const itemType = schema.itemTypes.find(itemType === item.itemType)
  if (!itemType) return
  for (const field of itemType.fields) {
    if (field.baseField && item[field.field] && !item[field.baseField]) {
      item[field.baseField] = item[field.field]
      delete item[field.field]
    }
  }
}

// import & export translators expect different creator formats... nice
export function simplifyForExport(item: Serialized.Item, { creators=true, scrub=true }: { creators?: boolean; scrub?: boolean } = {}): Serialized.Item {
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
    delete item.annotation
  }
  else {
    item.attachments = item.attachments || []
    item.notes = item.notes || []
  }

  return item
}

export function simplifyForImport(item: Serialized.Item): Serialized.Item {
  // unalias(item, { scrub: true })

  if (item.creators) {
    for (const creator of item.creators) {
      if (creator.name) {
        creator.lastName = creator.lastName || creator.name
        creator.fieldMode = 1
        delete creator.firstName
        delete creator.name
      }
      // if (!jurism) delete creator.multi
    }
  }

  // if (!jurism) delete item.multi

  return item
}

// maps variable to its extra-field label
export const label: Record<string, string> = {}
// valid types and fields per type
export const valid: { type: Record<string, boolean>; field: Record<string, Record<string, boolean>> } = { type: {}, field: {} }
for (const itemType of schema.itemTypes) {
  valid.type[itemType.itemType] = true
  valid.field[itemType.itemType] = {}
  for (const field of itemType.fields) {
    label[field.field.toLowerCase()] = label[(field.baseField || field.field).toLowerCase()] = (field.baseField || field.field).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase())
    valid[itemType.itemType][field.field] = valid[itemType.itemType][field.baseField || field.field] = true
  }
}

