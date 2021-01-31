/* eslint-disable no-console */
import j = require('jscodeshift')
import * as fs from 'fs'

const input = fs.readFileSync('node_modules/citeproc/citeproc_commonjs.js', 'utf-8')
const ast = j(input)

console.log('stripping citeproc')

ast
  .find(j.VariableDeclarator, {
    id: { type: 'Identifier', name: 'CSL' },
  })
  .find(j.Property)
  .filter(prop => !['toLocaleLowerCase', 'toLocaleUpperCase', 'SKIP_WORDS', 'PARTICLE_GIVEN_REGEXP', 'PARTICLE_FAMILY_REGEXP'].includes(prop.value.key.name))
  .remove()

const blacklist = [
  'CSL.Attributes',
  'CSL.Conditions',
  'CSL.Disambiguation',
  'CSL.Engine',
  'CSL.NameOutput',
  'CSL.Node',
  'CSL.Output',
  'CSL.Parallel',
  'CSL.PublisherOutput',
  'CSL.Registry',
  'CSL.Stack',
  'CSL.Util',
  'CSL.XmlDOM',
  'CSL.XmlJSON',
  'CSL.parseXml',
  'CSL.stripXmlProcessingInstruction',
  'CSL.AmbigConfig',
  'CSL.Blob',
  'CSL.Blob.prototype.push',
  'CSL.DateParser',
  'CSL.ITERATION',
  'CSL.Mode',
  'CSL.NumericBlob',
  'CSL.NumericBlob.prototype.checkLast',
  'CSL.NumericBlob.prototype.checkNext',
  'CSL.NumericBlob.prototype.setFormatter',
  'CSL.ParticleList',
  'CSL.Token',
  'CSL.Transform',
  'CSL.XmlToToken',
  'CSL.ambigConfigDiff',
  'CSL.buildMacro',
  'CSL.castLabel',
  'CSL.citeEnd',
  'CSL.citeStart',
  'CSL.cloneAmbigConfig',
  'CSL.configureMacro',
  'CSL.dateAsSortKey',
  'CSL.dateMacroAsSortKey',
  'CSL.evaluateLabel',
  'CSL.expandMacro',
  'CSL.getAmbigConfig',
  'CSL.getAmbiguousCite',
  'CSL.getBibliographyEntries',
  'CSL.getCitationCluster',
  'CSL.getCite',
  'CSL.getLocaleNames',
  'CSL.getMacroTarget',
  'CSL.getMaxVals',
  'CSL.getMinVal',
  'CSL.getSortCompare',
  'CSL.getSortKeys',
  'CSL.getSpliceDelimiter',
  'CSL.localeResolve',
  'CSL.makeBuilder',
  'CSL.setDecorations',
  'CSL.setupXml',
  'CSL.substituteOne',
  'CSL.substituteTwo',
  'CSL.tokenExec',
]
const whitelist = [
  'CSL.Output.Formatters',
  'CSL.Doppeler',
]

function varname(node) {
  switch (node.object.type) {
    case 'Identifier':
      return `${node.object.name}.${node.property.name}`

    case 'ThisExpression':
      return `this.${node.property.name}`

    case 'MemberExpression':
      return `${varname(node.object)}.${node.property.name}`

    case 'CallExpression':
      return `<call>.${node.property.name}`
  }

  throw new Error(node.object.type)
}

ast.find(j.AssignmentExpression)
  .filter(np => {
    const node = np.value

    if (node.left.type !== 'MemberExpression') return false

    const left = varname(node.left)
    if (whitelist.find(ns => left === ns || ns.startsWith(`${left}.`))) return false
    if (blacklist.find(ns => left === ns || left.startsWith(`${ns}.`))) return true
    return false
  })
  .remove()

fs.writeFileSync('gen/citeproc.js', ast.toSource())
