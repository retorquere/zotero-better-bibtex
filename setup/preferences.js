#!/usr/bin/env node

const pug = require('pug')
const fs = require('fs')
const path = require('path')

const src = process.argv[2] || 'content/Preferences.pug'
const tgt = process.argv[3] || 'build/content/Preferences.xul'

class XUL {
  start(ast) {
    this.ns = {
      xul: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
      html: 'http://www.w3.org/1999/xhtml',
      bbt: 'http://retorque.re/zotero-better-bibtex/',
    }
    this.js = 'module.exports = function(doc, root, tr) {\n'
    this.node = {}
    this.generate(ast, 'root', 1)
    this.js += '}'
  }
  
  generate(node, root, indent) {
    this[node.type](node, root, indent)
  }

  unpack(nodename) {
    let [namespace, name] = nodename.split(':')
    if (name) {
      namespace = this.ns[namespace]
    }
    else {
      name = nodename
      namespace = this.ns.xul
    }
    return { namespace, name }
  }

  Tag(node, root, indent) {
    if (node.name === 'script') return

    this.node[node.name] = (this.node[node.name] || 0) + 1

    for (const attr of node.attrs) {
      if (attr.name === 'xmlns') {
        this.ns.xul = attr.val
      }
      else if (attr.name.startsWith('xmlns:')) {
        this.ns[attr.name.replace(/.*:/, '')] = attr.val
      }
    }

    var { namespace, name } = this.unpack(node.name)
    if (namespace === this.ns.bbt && name === 'doc') return

    node.var = `${name}${this.node[node.name]}`

    this.js += this.indent(indent) + `const ${node.var} = doc.createElementNS('${namespace}', ${JSON.stringify(name)});\n`
    for (const attr of node.attrs) {
      if (attr.name.match(/^(xmlns|on(pane)?load)/)) continue

      var { namespace, name } = this.unpack(attr.name)
      if (namespace === this.ns.xul && name === 'onpaneload') continue
      if (namespace === this.ns.bbt && name === 'affects') continue

      let val
      if (attr.val.match(/^"&.+;"$/) || attr.val.match(/^'&.+;'$/)) {
        val = `tr[${JSON.stringify(attr.val.slice(2, -2))}]`
      }
      else {
        val = attr.val
      }
      if (namespace === this.ns.xul) {
        this.js += this.indent(indent + 1) + `${node.var}.setAttribute(${JSON.stringify(name)}, ${val});\n`
      }
      else {
        this.js += this.indent(indent + 1) + `${node.var}.setAttributeNS('${namespace}', ${JSON.stringify(name)}, ${val});\n`
      }
    }
    this.js += this.indent(indent) + `${root}.appendChild(${node.var});\n`
    this.Block(node.block, node.var, indent + 1)
  }

  Block(node, root, indent) {
    for (const sub of node.nodes) {
      this.generate(sub, root, indent)
    }
  }

  Comment(node, root, indent) {
    return
    this.js += `/* ${node.val.replace(/[/][*]/g, '/ *').replace(/[*][/]/g, '* /')} */\n`
  }

  indent(n) { return '  '.repeat(n) }

  Text(node, root, indent) {
    if (node.val.startsWith('<?xml')) return
    if (node.val.startsWith('<!DOCTYPE')) return

    let js
    if (node.val.match(/^&.+;$/)) {
      if (root.startsWith('script')) throw new Error(root)
      js = `doc.createTextNode(tr[${JSON.stringify(node.val.slice(1, -1))}])`
    } else if (root.startsWith('script')) {
      this.js += node.val
      return
    }
    else {
      js = `doc.createTextNode(${JSON.stringify(node.val)})`
    }
    if (!node.val.trim()) return
    this.js += this.indent(indent) + `${root}.appendChild(${js});\n`
  }
}
const generator = new XUL

const options = {}
options.pretty = true
options.plugins = [{
  preCodeGen(ast, options) {
    generator.start(ast)
    return ast
  }
}]

pug.renderFile('content/Preferences/prefpane.pug', options)
fs.writeFileSync('gen/preferences/xul.js', generator.js)

const xul = pug.renderFile(src, options)
const build = path.dirname(tgt)
if (!fs.existsSync(build)) fs.mkdirSync(build, { recursive: true })
fs.writeFileSync(tgt, xul.replace(/&amp;/g, '&').trim())
