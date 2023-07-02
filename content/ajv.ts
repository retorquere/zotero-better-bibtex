// 2020 for prefixItems
import AJV from 'ajv/dist/2020'
import { sprintf } from 'sprintf-js'

type AjvFormatValidator = {
  (schema: any, format: string): boolean
  errors: {
    keyword: string
    message: string
    params: {
      keyword: 'creatorname' | 'postfix'
    }
  }[]
}
const creatorname = <AjvFormatValidator>((_schema, format) => {
  creatorname.errors = []
  let error = ''
  try {
    const expected = `${Date.now()}`
    const vars = { f: expected, g: expected, i: expected, I: expected }
    const found = sprintf(format, vars)
    if (found.includes(expected)) return true
    error = `${format} does not contain ${Object.keys(vars).map(v => `%(${v})s`).join('/')}`
  }
  catch (err) {
    error = err.message
  }

  creatorname.errors.push({
    keyword: 'creatorname',
    message: error,
    params: { keyword: 'creatorname' },
  })
  return false
})

const postfix = <AjvFormatValidator>((_schema, format) => {
  postfix.errors = []
  let error = ''
  try {
    const expected = `${Date.now()}`
    const vars = { a: expected, A: expected, n: expected }
    const found = sprintf(format, vars)
    if (!found.includes(expected)) {
      error = `${format} does not contain ${Object.keys(vars).map(v => `%(${v})s`).join('/')}`
    }
    else if (found.split(expected).length > 2) {
      error = `${format} contains multiple instances of ${Object.keys(vars).map(v => `%(${v})s`).join('/')}`
    }
    else {
      return true
    }
  }
  catch (err) {
    error = err.message
  }

  postfix.errors.push({
    keyword: 'postfix',
    message: error,
    params: { keyword: 'postfix' },
  })
  return false
})

const options  = {
  strict: false,
  discriminator: true,
  useDefaults: true,
}

export const noncoercing = new AJV({...options, logger: false })
export const coercing = new AJV({...options, logger: false, coerceTypes: true})

import keywords from 'ajv-keywords'
for (const ajv of [coercing, noncoercing]) {
  keywords(ajv)
  ajv.addKeyword({ keyword: 'postfix', validate: postfix })
  ajv.addKeyword({ keyword: 'creatorname', validate: creatorname })
}

import betterAjvErrors from 'better-ajv-errors'

type AjvError = { error: string, suggestion: string }
export function validator(schema, ajv): (data: any) => string { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  const ok = ajv.compile(schema)
  return function(data: any): string { // eslint-disable-line prefer-arrow/prefer-arrow-functions
    if (ok(data)) return ''
    return (betterAjvErrors(schema, data, ok.errors, { format: 'js' }) as AjvError[])
      .map((err: AjvError) => err.error + (err.suggestion ? `, ${err.suggestion}` : '')).join('\n')
  }
}

import { client } from './client'

const jurism = client === 'jurism'
const zotero = !jurism

const zoterovalidator = validator(require('../gen/items/zotero.json'), noncoercing)
const jurismvalidator = validator(require('../gen/items/jurism.json'), noncoercing)
const broken = {
  me: zotero ? zoterovalidator : jurismvalidator,
  other: jurism ? zoterovalidator : jurismvalidator,
}
export function validItem(obj: any, strict?: boolean): string { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  const errors = broken.me(obj)
  if (!errors) return ''
  if (!strict && !broken.other(obj)) {
    if (typeof Zotero !== 'undefined') Zotero.debug('Better BibTeX soft error: ' + errors)
    return ''
  }
  // https://ajv.js.org/api.html#validation-errors
  return errors
}
