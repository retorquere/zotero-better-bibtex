import * as xpath from 'xpath'
import * as fs from 'fs'
import * as ejs from 'ejs'
import * as path from 'path'

import { DOMParser } from 'xmldom'

import jsesc = require('jsesc')
import _ = require('lodash')

const _select = xpath.useNamespaces({ bcf: 'https://sourceforge.net/projects/biblatex' })
function select(selector, node) {
  return _select(selector, node) as Element[]
}

export = source => {
  const doc = (new DOMParser).parseFromString(source)

  const BCF = {
    // combinations fo allowed fields
    fieldSet: '',

    // per type, array of fieldset names that make up the allowed fields for this type
    allowed: {},

    // combinations of required fields and the types they apply to
    required: {},

    // content checks
    data: [],
  }

  const fieldSet = {}

  // get all the possible entrytypes and apply the generic fields
  for (const type of select('//bcf:entrytypes/bcf:entrytype', doc)) {
    BCF.allowed[type.textContent] = ['optional']
  }

  // tslint:disable-next-line:prefer-template
  const dateprefix = '^('
    + select('//bcf:fields/bcf:field[@fieldtype="field" and @datatype="date"]', doc)
        .map(field => field.textContent.replace(/date$/, ''))
        .filter(field => field)
        .join('|')
    + ')?'
  const dateprefixRE = new RegExp(dateprefix)

  // tslint:disable-next-line:prefer-template
  const datefieldRE = new RegExp(dateprefix + '(' + Array.from(new Set(
    select('//bcf:fields/bcf:field[@fieldtype="field" and @datatype="datepart"]', doc)
      .map(field => field.textContent.replace(dateprefixRE, ''))
      .filter(field => field)
  )).join('|') + ')$')

  // gather the fieldsets
  for (const node of select('//bcf:entryfields', doc)) {
    const types = select('./bcf:entrytype', node).map(type => type.textContent).sort()

    const setname = types.length === 0 ? 'optional' : 'optional_' + types.join('_')
    if (fieldSet[setname]) throw new Error(`field set ${setname} exists`)

    // find all the field names allowed by this set
    fieldSet[setname] = []
    for (const { textContent: field } of select('./bcf:field', node)) {
      const m = datefieldRE.exec(field)
      if (m) {
        fieldSet[setname].push(`${m[1] || ''}date`)
        if (field === 'month' || field === 'year') fieldSet[setname].push(field)
      } else {
        fieldSet[setname].push(field)
      }
    }
    fieldSet[setname] = new Set(fieldSet[setname])

    // assign the fieldset to the types it applies to
    for (const type of types) {
      if (!BCF.allowed[type]) {
        throw new Error(`Unknown reference type ${type}`)
      } else {
        BCF.allowed[type] = _.uniq(BCF.allowed[type].concat(setname))
      }
    }
  }

  for (const node of select('.//bcf:constraints', doc)) {
    const types = select('./bcf:entrytype', node).map(type => type.textContent).sort()
    const setname = types.length === 0 ? 'required' : 'required_' + types.join('_')

    if (fieldSet[setname] || BCF.required[setname]) throw new Error(`constraint set ${setname} exists`)

    /*
    // find all the field names allowed by this set
    fieldSet[setname] = new Set(select('.//bcf:field', node).map(field => field.textContent))

    for (const type of types) {
      if (!BCF.allowed[type]) {
        throw new Error(`Unknown reference type ${type}`)
      } else {
        BCF.allowed[type] = _.uniq(BCF.allowed[type].concat(setname))
      }
    }
    */

    const mandatory = select(".//bcf:constraint[@type='mandatory']", node)
    switch (mandatory.length) {
      case 0:
        break

      case 1:
        BCF.required[setname] = { types, fields: []}

        for (const constraint of (Array.from(mandatory[0].childNodes) as Element[])) {
          switch (constraint.localName || '#text') {
            case '#text':
              break

            case 'field':
              BCF.required[setname].fields.push(constraint.textContent)
              break

            case 'fieldor':
            case 'fieldxor':
              BCF.required[setname].fields.push({
                [constraint.localName.replace('field', '')]: select('./bcf:field', constraint).map(field => field.textContent),
              })
              break

            default:
              throw new Error(`Unexpected constraint type ${constraint.localName}`)
          }
        }
        break

      default:
        throw new Error(`found ${mandatory.length} constraints, expected 1`)
    }

    for (const constraint of select(".//bcf:constraint[@type='data']", node)) {
      if (types.length) throw new Error('Did not expect types for data constraints')
      if (!constraint.localName) continue

      const test = {
        test: (constraint as Element).getAttribute('datatype'),
        fields: Array.from(select('./bcf:field', constraint)).map(field => field.textContent),
        params: null,
      }
      if (test.test === 'pattern') test.params = (constraint as Element).getAttribute('pattern')
      BCF.data.push(test)
    }
  }

  BCF.fieldSet = jsesc(fieldSet, { compact: false, indent: '  ' })

  return ejs.render(fs.readFileSync(path.join(__dirname, 'bcf.ejs'), 'utf8'), BCF)
}
