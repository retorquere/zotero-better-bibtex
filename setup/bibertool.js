#!/usr/bin/env node

import xpath from 'xpath'
import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import { DOMParser } from '@xmldom/xmldom'
import jsesc from 'jsesc'
import _ from 'lodash'

// TODO: make sure to occasionally check https://sourceforge.net/projects/biblatex-biber/files/biblatex-biber/testfiles/ for updates.

// const _select = xpath.useNamespaces({ bcf: 'https://sourceforge.net/projects/biblatex' })
function select(selector, node) {
  // return _select(selector, node) as Element[]
  return xpath.select(selector, node)
}

function bibertool(source) {
  const doc = (new DOMParser).parseFromString(source, 'text/xml')

  const BiberTool = { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
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
  for (const type of select('//entrytypes/entrytype', doc)) {
    BiberTool.allowed[type.textContent] = ['optional']
  }
  // some entry types are not listed under entrytypes?! I'm looking at you dataset...
  for (const type of select('//entryfields/entrytype', doc)) {
    BiberTool.allowed[type.textContent] = ['optional']
  }

  // eslint-disable-next-line prefer-template
  const dateprefix = '^('
    + select('//fields/field[@fieldtype="field" and @datatype="date"]', doc)
      .map(field => field.textContent.replace(/date$/, ''))
      .filter(field => field)
      .join('|')
    + ')?'
  const dateprefixRE = new RegExp(dateprefix)

  // eslint-disable-next-line prefer-template
  const datefieldRE = new RegExp(dateprefix + '(' + Array.from(new Set(
    select('//fields/field[@fieldtype="field" and @datatype="datepart"]', doc)
      .map(field => field.textContent.replace(dateprefixRE, ''))
      .filter(field => field)
  )).join('|') + ')$')

  // gather the fieldsets
  for (const node of select('//entryfields', doc)) {
    const types = select('./entrytype', node).map(type => type.textContent).sort()

    const setname = types.length === 0 ? 'optional' : `optional_${types.join('_')}`
    if (fieldSet[setname]) throw new Error(`field set ${setname} exists`)

    // find all the field names allowed by this set
    fieldSet[setname] = []
    for (const { textContent: field } of select('./field', node)) {
      const m = datefieldRE.exec(field)
      if (m) {
        fieldSet[setname].push(`${m[1] || ''}date`)
        if (field === 'month' || field === 'year') fieldSet[setname].push(field)
      }
      else {
        fieldSet[setname].push(field)
      }
    }
    fieldSet[setname] = new Set(fieldSet[setname])

    // assign the fieldset to the types it applies to
    for (const type of types) {
      if (!BiberTool.allowed[type]) {
        throw new Error(`Unknown reference type ${type}`)
      }
      else {
        BiberTool.allowed[type] = _.uniq(BiberTool.allowed[type].concat(setname))
      }
    }
  }

  for (const node of select('.//constraints', doc)) {
    const types = select('./entrytype', node).map(type => type.textContent).sort()
    const setname = types.length === 0 ? 'required' : `required_${types.join('_')}`

    if (fieldSet[setname] || BiberTool.required[setname]) throw new Error(`constraint set ${setname} exists`)

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

    const mandatory = select(".//constraint[@type='mandatory']", node)
    switch (mandatory.length) {
      case 0:
        break

      case 1:
        BiberTool.required[setname] = { types, fields: []}

        for (const constraint of Array.from(mandatory[0].childNodes)) {
          switch (constraint.localName || '#text') {
            case '#text':
              break

            case 'field':
              BiberTool.required[setname].fields.push(constraint.textContent)
              break

            case 'fieldor':
            case 'fieldxor':
              BiberTool.required[setname].fields.push({
                [constraint.localName.replace('field', '')]: select('./field', constraint).map(field => field.textContent),
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

    for (const constraint of select(".//constraint[@type='data']", node)) {
      if (types.length) throw new Error('Did not expect types for data constraints')
      if (!constraint.localName) continue

      const test = {
        test: constraint.getAttribute('datatype'),
        fields: Array.from(select('./field', constraint)).map(field => field.textContent),
        params: null,
      }
      if (test.test === 'pattern') test.params = constraint.getAttribute('pattern')
      BiberTool.data.push(test)
    }
  }

  BiberTool.fieldSet = jsesc(fieldSet, { compact: false, indent: '  ' })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ejs.render(fs.readFileSync('setup/bibertool.ejs', 'utf8'), BiberTool)
}

fs.writeFileSync('gen/biber-tool.ts', bibertool(fs.readFileSync('submodules/biber/data/biber-tool.conf', 'utf-8')))
