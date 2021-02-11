/* eslint-disable id-blacklist, @typescript-eslint/no-unsafe-return, @typescript-eslint/explicit-module-boundary-types */

import { client } from '../../content/client'
import { ZoteroTranslator } from '../typings/serialized-item'
const jurism = client === 'jurism'
const zotero = !jurism

type Valid = {
  type: Record<string, boolean>
  field: Record<string, Record<string, boolean>>
}
export const valid: Valid = {
  type: {
    %for itemType, client in sorted(valid.type.items()):
    ${itemType}: ${client},
    %endfor
  },
  field: {
    %for itemType, fields in sorted(valid.field.items()):
    ${itemType}: {
      %for field, client in sorted(fields.items()):
      ${field}: ${client},
      %endfor
    },
    %endfor
  },
}

export const name: Record<'type' | 'field', Record<string, string>> = {
%for section in ['type', 'field']:
  ${section}: {
  %for field, name in sorted(names[section].items()):
    %if name.get('zotero', None) == name.get('jurism', None):
    ${field}: '${name.zotero}',
    %elif 'zotero' in name and 'jurism' in name:
    ${field}: zotero ? '${name.zotero}' : '${name.jurism}',
    %elif 'zotero' in name:
    ${field}: zotero && '${name.zotero}',
    %else:
    ${field}: jurism && '${name.jurism}',
    %endif
  %endfor
  },
%endfor
}
// maps variable to its extra-field label
export const label: Record<string, string> = {
%for field, name in sorted(labels.items()):
  %if name.get('zotero', None) == name.get('jurism', None):
  ${field}: '${name.zotero}',
  %elif 'zotero' in name and 'jurism' in name:
  ${field}: zotero ? '${name.zotero}' : '${name.jurism}',
  %elif 'zotero' in name:
  ${field}: zotero && '${name.zotero}',
  %else:
  ${field}: jurism && '${name.jurism}',
  %endif
%endfor
}

function unalias(item: any) {
  delete item.inPublications
  let v
  %for client, indent in [('both', ''), ('zotero', '  '), ('jurism', '  ')]:
    %if client != 'both':
  if (${client}) {
    %endif
    %for field, field_aliases in aliases[client].items():

      %if len(field_aliases) == 1:
  ${indent}if (item.${field_aliases[0]}) item.${field} = item.${field_aliases[0]}
      %else:
  ${indent}if (v = (${' || '.join(f'item.{a}' for a in field_aliases)})) item.${field} = v
      %endif
      %for a in field_aliases:
  ${indent}delete item.${a}
      %endfor
    %endfor

    %if client != 'both':
  }

    %endif
  %endfor
}

// import & export translators expect different creator formats... nice
export function simplifyForExport(item: any, dropAttachments = false): ZoteroTranslator.Item {
  unalias(item)

  if (item.filingDate) item.filingDate = item.filingDate.replace(/^0000-00-00 /, '')

  if (item.creators) {
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

  return (item as ZoteroTranslator.Item)
}

export function simplifyForImport(item: any): ZoteroTranslator.Item {
  unalias(item)

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

  return (item as ZoteroTranslator.Item)
}
