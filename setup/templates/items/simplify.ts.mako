/* eslint-disable prefer-template, id-blacklist, @typescript-eslint/no-unsafe-return, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/quotes */

import { Item } from '../typings/serialized-item'
import * as client from '../../content/client'
const zotero = client.slug === 'zotero'
const jurism = !zotero

function unalias(item: any, { scrub = true }: { scrub?: boolean } = {}): void {
  delete item.inPublications
  let v
  %for client, indent in [('both', ''), ('zotero', '  '), ('jurism', '  ')]:
    %if client != 'both':
  if (${client}) {
    %endif
    %for field, field_aliases in sorted(aliases[client].items()):
      %if len(field_aliases) == 1:
  ${indent}if (item.${field_aliases[0]}) item.${field} = item.${field_aliases[0]}
      %else:
  ${indent}if (v = (${' || '.join(f'item.{a}' for a in field_aliases)})) item.${field} = v
      %endif
  ${indent}if (scrub) {
      %for field in field_aliases:
  ${indent}  delete item.${field}
      %endfor
  ${indent}}
    %endfor

    %if client != 'both':
  }

    %endif
  %endfor
}

// import & export translators expect different creator formats... nice
export function simplifyForExport(item: any, { creators=true, dropAttachments=false, scrub=true }: { creators?: boolean, dropAttachments?: boolean, scrub?: boolean } = {}): Item {
  unalias(item, { scrub })

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
    item.attachments = (!dropAttachments && item.attachments) || []
  }

  return (item as Item)
}

export function simplifyForImport(item: any): Item {
  // unalias(item, { scrub: true })

  if (item.creators) {
    for (const creator of item.creators) {
      if (creator.name) {
        creator.lastName = creator.lastName || creator.name
        creator.fieldMode = 1
        delete creator.firstName
        delete creator.name
      }
      if (!jurism) delete creator.multi
    }
  }

  if (!jurism) delete item.multi

  return (item as Item)
}
