declare const Zotero: any

const jurism = Zotero.BetterBibTeX.client() === 'jurism'
const zotero = !jurism

type Valid = {
  type: Record<string, boolean>
  field: Record<string, Record<string, boolean>>
}
export const valid: Valid = {
  type: {
    %for itemType, client in valid.type.items():
    ${itemType}: ${client},
    %endfor
  },
  field: {
    %for itemType, fields in valid.field.items():
    ${itemType}: {
      %for field, client in fields.items():
      ${field}: ${client},
      %endfor
    },
    %endfor
  },
}

type Supported = {
  field: Record<string, string>
}
export const supported: Supported = {
  field: {},
}
for (const typeFields of Object.values(valid.field)) {
  for (const [field, is_supported] of Object.entries(typeFields)) {
    // tslint:disable-next-line:prefer-template
    if (is_supported) supported.field[field] = field[0].toUpperCase() + field.substring(1).replace(/[_-]/g, ' ').replace(/([a-z])([A-Z])/g, (m, l, u) => l + ' ' + u.toLowerCase())
  }
}
supported.field.numPages = 'Number of pages'

function unalias(item) {
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
export function simplifyForExport(item, dropAttachments = false) {
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
  } else {
    item.attachments = (!dropAttachments && item.attachments) || []
    item.notes = item.notes ? item.notes.map(note =>  note.note || note ) : []
  }

  return item
}

export function simplifyForImport(item) {
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

  return item
}
