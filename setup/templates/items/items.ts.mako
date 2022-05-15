/* eslint-disable prefer-template, id-blacklist, @typescript-eslint/no-unsafe-return, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/quotes */

declare const Zotero: any

import { client } from '../../content/client'
import { Item } from '../typings/serialized-item'
import { ErrorObject } from 'ajv'

const jurism = client === 'jurism'
const zotero = !jurism

const zoterovalidator = require('./zotero.schema')
const jurismvalidator = require('./jurism.schema')
const validator = {
  me: zotero ? zoterovalidator : jurismvalidator,
  other: jurism ? zoterovalidator : jurismvalidator,
}

type Valid = {
  type: Record<string, boolean>
  field: Record<string, Record<string, boolean>>
  test: (obj: any, strict?: boolean) => string
}

function err2string(err: ErrorObject, obj: { itemType: string }): string {
  if (!err.instancePath && err.keyword === 'additionalProperties') return 'Unexpected property ' + (err.params.additionalProperty as string) + ' on ' + obj.itemType
  return (err.instancePath || '??') + ' ' + err.message
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
  test: (obj: any, strict?: boolean) => {
    if (validator.me(obj)) return ''
    const err = (validator.me.errors as ErrorObject[]).map(e => err2string(e, obj).trim()).join(';\n')
    if (!strict && validator.other(obj)) {
      if (typeof Zotero !== 'undefined') Zotero.debug('Better BibTeX soft error: ' + err)
      return ''
    }
    // https://ajv.js.org/api.html#validation-errors
    return err
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
export function simplifyForExport(item: any, { dropAttachments=false, scrub=true }: { dropAttachments?: boolean, scrub?: boolean } = {}): Item {
  unalias(item, { scrub })

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

  return (item as Item)
}

export function simplifyForImport(item: any): Item {
  unalias(item, { scrub: true })

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
<%!
  def jsesc(v, identifier=False):
    if type(v) == list:
      assert not identifier
      return '[ ' + ', '.join([jsesc(m) for m in v]) + ' ]'
    else:
      q = "'" if '-' in v or not identifier else ''
      return q + v +q
  def uniq(kv):
    u = []
    ks = []
    for k, v in reversed(kv):
      if not k in ks:
        u.append((k, v))
        ks.append(k)
    return sorted(u)

%>
const schema_csl_mappings = {
%for client, schema in [(cl, schemas[cl]) for cl in ['zotero', 'jurism']]:
  ${client}: {
    CSL_TYPE_MAPPINGS: {
      %for zoteroType, cslType in uniq([(zotero, csl) for csl, types in schema.csl.types.items() for zotero in types]):
      ${zoteroType}: '${cslType}',
      %endfor
    },
    CSL_TYPE_MAPPINGS_REVERSE: {
      %for cslType, zoteroTypes in uniq(schema.csl.types.items()):
      ${jsesc(cslType, True)}: ${jsesc(zoteroTypes)},
      %endfor
    },
    %for kind in ['text', 'date', 'name']:
    CSL_${kind.upper()}_MAPPINGS: {
      %for cslType, zoteroTypes in uniq((schema.csl.names if kind == 'name' else schema.csl.fields[kind]).items()):
      ${jsesc(cslType, True)}: ${jsesc(zoteroTypes)},
      %endfor
    },
    %endfor
    CSL_FIELD_MAPPINGS_REVERSE: {
      %for zoteroField, cslField in uniq( [(zotero, csl) for csl, types in schema.csl.fields.text.items() for zotero in types] + [(zotero, csl) for csl, types in schema.csl.fields.date.items() for zotero in (types if type(types) == list else [types])]):
      ${zoteroField}: '${cslField}',
      %endfor
    },
  },
%endfor
}
export const CSL_MAPPINGS = schema_csl_mappings[client]
