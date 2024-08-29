/* eslint-disable prefer-template, id-blacklist, @typescript-eslint/no-unsafe-return, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/quotes */

import * as client from '../../content/client'
const jurism = client.slug === 'jurism'
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
## const schema_csl_mappings = {
## %for client, schema in [(cl, schemas[cl]) for cl in ['zotero', 'jurism']]:
##   ${client}: {
##     CSL_TYPE_MAPPINGS: {
##       %for zoteroType, cslType in uniq([(zotero, csl) for csl, types in schema.csl.types.items() for zotero in types]):
##       ${zoteroType}: '${cslType}',
##       %endfor
##     },
##     CSL_TYPE_MAPPINGS_REVERSE: {
##       %for cslType, zoteroTypes in uniq(schema.csl.types.items()):
##       ${jsesc(cslType, True)}: ${jsesc(zoteroTypes)},
##       %endfor
##     },
##     %for kind in ['text', 'date', 'name']:
##     CSL_${kind.upper()}_MAPPINGS: {
##       %for cslType, zoteroTypes in uniq((schema.csl.names if kind == 'name' else schema.csl.fields[kind]).items()):
##       ${jsesc(cslType, True)}: ${jsesc(zoteroTypes)},
##       %endfor
##     },
##     %endfor
##     CSL_FIELD_MAPPINGS_REVERSE: {
##       %for zoteroField, cslField in uniq( [(zotero, csl) for csl, types in schema.csl.fields.text.items() for zotero in types] + [(zotero, csl) for csl, types in schema.csl.fields.date.items() for zotero in (types if type(types) == list else [types])]):
##       ${zoteroField}: '${cslField}',
##       %endfor
##     },
##   },
## %endfor
## }
## export const CSL_MAPPINGS = schema_csl_mappings[client]
