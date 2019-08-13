const map = {
  tags: {
    strong: { open: '<b>', close: '</b>' },
    em: { open: '<i>', close: '</i>' },
    sub: { open: '<sub>', close: '</sub>' },
    sup: { open: '<sup>', close: '</sup>' },
    smallcaps: { open: '<span style="font-variant:small-caps;">', close: '</span>' },
    nocase: { open: '<span class="nocase">', close: '</span>' },
    enquote: { open: '“', close: '”' },
    url: { open: '', close: '' },
    undefined: { open: '[', close: ']' },
  },

  sup: {
    '(': '\u207D',
    ')': '\u207E',
    '+': '\u207A',
    '=': '\u207C',
    '-': '\u207B',
    '\u00C6': '\u1D2D', // tslint:disable-line:object-literal-key-quotes
    '\u014B': '\u1D51', // tslint:disable-line:object-literal-key-quotes
    '\u018E': '\u1D32', // tslint:disable-line:object-literal-key-quotes
    '\u0222': '\u1D3D', // tslint:disable-line:object-literal-key-quotes
    '\u0250': '\u1D44', // tslint:disable-line:object-literal-key-quotes
    '\u0251': '\u1D45', // tslint:disable-line:object-literal-key-quotes
    '\u0254': '\u1D53', // tslint:disable-line:object-literal-key-quotes
    '\u0259': '\u1D4A', // tslint:disable-line:object-literal-key-quotes
    '\u025B': '\u1D4B', // tslint:disable-line:object-literal-key-quotes
    '\u025C': '\u1D4C', // tslint:disable-line:object-literal-key-quotes
    '\u0263': '\u02E0', // tslint:disable-line:object-literal-key-quotes
    '\u0266': '\u02B1', // tslint:disable-line:object-literal-key-quotes
    '\u026F': '\u1D5A', // tslint:disable-line:object-literal-key-quotes
    '\u0279': '\u02B4', // tslint:disable-line:object-literal-key-quotes
    '\u027B': '\u02B5', // tslint:disable-line:object-literal-key-quotes
    '\u0281': '\u02B6', // tslint:disable-line:object-literal-key-quotes
    '\u0294': '\u02C0', // tslint:disable-line:object-literal-key-quotes
    '\u0295': '\u02C1', // tslint:disable-line:object-literal-key-quotes
    '\u03B2': '\u1D5D', // tslint:disable-line:object-literal-key-quotes
    '\u03B3': '\u1D5E', // tslint:disable-line:object-literal-key-quotes
    '\u03B4': '\u1D5F', // tslint:disable-line:object-literal-key-quotes
    '\u03C6': '\u1D60', // tslint:disable-line:object-literal-key-quotes
    '\u03C7': '\u1D61', // tslint:disable-line:object-literal-key-quotes
    '\u1D02': '\u1D46', // tslint:disable-line:object-literal-key-quotes
    '\u1D16': '\u1D54', // tslint:disable-line:object-literal-key-quotes
    '\u1D17': '\u1D55', // tslint:disable-line:object-literal-key-quotes
    '\u1D1D': '\u1D59', // tslint:disable-line:object-literal-key-quotes
    '\u1D25': '\u1D5C', // tslint:disable-line:object-literal-key-quotes
    '\u2212': '\u207B', // tslint:disable-line:object-literal-key-quotes
    '\u2218': '\u00B0', // tslint:disable-line:object-literal-key-quotes
    '\u4E00': '\u3192', // tslint:disable-line:object-literal-key-quotes
    0: '\u2070',
    1: '\u00B9',
    2: '\u00B2',
    3: '\u00B3',
    4: '\u2074',
    5: '\u2075',
    6: '\u2076',
    7: '\u2077',
    8: '\u2078',
    9: '\u2079',
    A: '\u1D2C',
    B: '\u1D2E',
    D: '\u1D30',
    E: '\u1D31',
    G: '\u1D33',
    H: '\u1D34',
    I: '\u1D35',
    J: '\u1D36',
    K: '\u1D37',
    L: '\u1D38',
    M: '\u1D39',
    N: '\u1D3A',
    O: '\u1D3C',
    P: '\u1D3E',
    R: '\u1D3F',
    T: '\u1D40',
    U: '\u1D41',
    W: '\u1D42',
    a: '\u1D43',
    b: '\u1D47',
    d: '\u1D48',
    e: '\u1D49',
    g: '\u1D4D',
    h: '\u02B0',
    i: '\u2071',
    j: '\u02B2',
    k: '\u1D4F',
    l: '\u02E1',
    m: '\u1D50',
    n: '\u207F',
    o: '\u1D52',
    p: '\u1D56',
    r: '\u02B3',
    s: '\u02E2',
    t: '\u1D57',
    u: '\u1D58',
    v: '\u1D5B',
    w: '\u02B7',
    x: '\u02E3',
    y: '\u02B8',
  },

  sub: {
    0: '\u2080',
    1: '\u2081',
    2: '\u2082',
    3: '\u2083',
    4: '\u2084',
    5: '\u2085',
    6: '\u2086',
    7: '\u2087',
    8: '\u2088',
    9: '\u2089',
    '+': '\u208A',
    '-': '\u208B',
    '=': '\u208C',
    '(': '\u208D',
    ')': '\u208E',
    a: '\u2090',
    e: '\u2091',
    o: '\u2092',
    x: '\u2093',
    h: '\u2095',
    k: '\u2096',
    l: '\u2097',
    m: '\u2098',
    n: '\u2099',
    p: '\u209A',
    s: '\u209B',
    t: '\u209C',
  },
}

export function unparse(text, options: { condense?: boolean, sentenceCase?: boolean, enquote?: string} = {}): string {
  if (typeof options.condense === 'undefined') options.condense = true

  if (options.enquote) {
    map.tags.enquote = { open: options.enquote[0], close: options.enquote[1] }
  } else {
    map.tags.enquote = { open: '“', close: '”' }
  }

  const nocase = []
  if (Array.isArray(text) && Array.isArray(text[0])) return text.map(t => unparse(t, options)).join(' and ')

  if (['string', 'number'].includes(typeof text)) return text

  if (!Array.isArray(text)) text = [ text ]

  // split out sup/sub text that can be unicodified
  const chunks = []
  for (const node of text) {
    if (node.type === 'variable') {
      chunks.push({text: node.attrs.variable, marks: []})
      continue
    }

    if (!node.marks) {
      chunks.push(node)
      continue
    }

    node.marks = node.marks.filter(mark => mark.type !== 'nocase').concat(node.marks.filter(mark => options.sentenceCase && mark.type === 'nocase'))

    let sup = false
    let sub = false
    const nosupb = node.marks.filter(mark => {
      sup = sup || mark.type === 'sup'
      sub = sub || mark.type === 'sub'
      return !['sup', 'sub'].includes(mark.type)
    })

    if (sup === sub) { // !xor
      chunks.push(node)
      continue
    }

    const tr = sup ? map.sup : map.sub
    let unicoded = ''
    for (const c of node.text) {
      if (sup && c === '\u00B0') { // spurious mark
        unicoded += c
      } else if (tr[c]) {
        unicoded += tr[c]
      } else {
        unicoded = null
        break
      }
    }
    if (unicoded) {
      node.text = unicoded
      node.marks = nosupb
    }
    chunks.push(node)
  }

  // convert to string
  let html = ''

  let lastMarks = []
  for (const node of chunks) {
    if (node.type === 'variable') {
      // This is an undefined variable
      // This should usually not happen, as CSL doesn't know what to
      // do with these. We'll put them into an unsupported tag.
      html += `${map.tags.undefined.open}${node.attrs.variable}${map.tags.undefined.close}`
      continue
    }

    const newMarks = []
    if (node.marks) {
      for (const mark of node.marks) {
        newMarks.push(mark.type)
      }
    }

    // close all tags that are not present in current text node.
    let closing = false
    const closeTags = []
    let endNoCase = false
    for (let index = 0; index < lastMarks.length; index++) {
      const mark = lastMarks[index]
      if (mark !== newMarks[index]) closing = true
      if (closing) {
        endNoCase = endNoCase || mark === 'nocase'
        closeTags.push(map.tags[mark].close)
      }
    }
    // Add close tags in reverse order to close innermost tags
    // first.
    closeTags.reverse()
    html += closeTags.join('')
    if (endNoCase) nocase[0][1] = html.length

    // open all new tags that were not present in the last text node.
    let opening = false
    let startedNoCase = false
    for (let index = 0; index < newMarks.length; index++) {
      const mark = newMarks[index]
      if (mark !== lastMarks[index]) opening = true
      if (opening) {
        if (mark === 'nocase' && !startedNoCase) {
          nocase.unshift([html.length, null])
          startedNoCase = true
        }
        html += map.tags[mark].open
      }
    }

    html += node.text
    lastMarks = newMarks
  }

  // Close all still open tags
  for (const mark of lastMarks.slice().reverse()) {
    html += map.tags[mark].close
  }

  html = html.replace(/ \u00A0/g, ' ~') // if allowtilde
  html = html.replace(/\u00A0 /g, '~ ') // if allowtilde
  // html = html.replace(/\uFFFD/g, '') # we have no use for the unicode replacement character

  if (options.sentenceCase) {
    let sentenceCased = html.toLowerCase().replace(/(([\?!]\s*|^)([\'\"¡¿“‘„«\s]+)?[^\s])/g, x => x.toUpperCase())
    for (const [start, stop] of nocase) {
      sentenceCased = sentenceCased.substring(0, start) + html.substring(start, stop) + sentenceCased.substring(stop)
    }
    html = sentenceCased
  }
  return options.condense ? html.replace(/[\t\r\n ]+/g, ' ') : html
}
