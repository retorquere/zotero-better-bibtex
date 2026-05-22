export type DisplayOptions = {
  % for option, default in sorted(displayOptions.items()):
  ${makeOption(option, default)}
  % endfor

  // pseudo options
  % for option, default in sorted(pseudoOptions.items()):
  ${makeOption(option, default)}
  % endfor
}

export const displayOptions = [
  % for option in sorted(displayOptions.keys()):
  '${option}',
  % endfor

  // pseudo options
  % for option in sorted(pseudoOptions.keys()):
  '${option}',
  % endfor
]

export const psuedoOptions = new Set([
  % for option in sorted(pseudoOptions.keys()):
  '${option}',
  % endfor
])

export type Header = {
  translatorID: string
  label: string
  description: string
  creator: string
  minVersion: string
  maxVersion: string
  translatorType: number
  inRepository: false
  priority: number
  target: string
  browserSupport: 'gcsv'
  configOptions?: {
    getCollections?: boolean
    async?: boolean
    hash?: string
    cached?: boolean
   }
  displayOptions?: DisplayOptions
}

export const headers: Header[] = ${json.dumps(headers, indent='  ')}
export const byId: Record<string, Header> = {}
export const byLabel: Record<string, Header> = {}
export const bySlug: Record<string, Header> = {}
for (const header of headers) {
  byId[header.translatorID] = byLabel[header.label] = bySlug[header.label.replace(/ /g, '')] = header
}
