#!/usr/bin/env node

const pug = require('pug')
const fs = require('fs')
const path = require('path')

const src = process.argv[2] || 'content/Preferences.pug'
const tgt = process.argv[3] || 'build/content/Preferences.xul'

const options = {}
options.pretty = true

// class XUL {
//   start(ast) {
//     this.preference = null
//     this.preferences = {}
//     this.ns = {
//       xul: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
//       html: 'http://www.w3.org/1999/xhtml',
//       bbt: 'http://retorque.re/zotero-better-bibtex/',
//     }
//     this.js = 'module.exports = function(doc, root, tr) {\n'
//     this.node = {}
//     this.generate(ast, 'root', 1)
//     this.js += '}'
//   }
//
//   generate(node, root, indent) {
//     this[node.type](node, root, indent)
//   }
//
//   text(node) {
//     switch (node.type) {
//       case 'Block':
//         return node.nodes.map(n => this.text(n)).join('')
//       case 'Text':
//         return node.val
//       default:
//         console.log(node)
//         throw new Error(node.type)
//     }
//   }
//
//   unpack(nodename) {
//     let [namespace, name] = nodename.split(':')
//     if (name) {
//       namespace = this.ns[namespace]
//     }
//     else {
//       name = nodename
//       namespace = this.ns.xul
//     }
//     return { namespace, name }
//   }
//
//   Tag(node, root, indent) {
//     if (node.name === 'script') return
//
//     this.node[node.name] = (this.node[node.name] || 0) + 1
//
//     for (const attr of node.attrs) {
//       if (attr.name === 'xmlns') {
//         this.ns.xul = attr.val
//       }
//       else if (attr.name.startsWith('xmlns:')) {
//         this.ns[attr.name.replace(/.*:/, '')] = attr.val
//       }
//     }
//
//     var { namespace, name } = this.unpack(node.name)
//     if (namespace === this.ns.bbt && name === 'doc') {
//       this.preferences[this.preference] = this.text(node.block).trim()
//       return
//     }
//     if (namespace === this.ns.xul && name === 'preference') {
//       this.preference = JSON.parse(node.attrs.find(attr => attr.name === 'name').val).replace('extensions.zotero.translators.better-bibtex.', '')
//       this.preferences[this.preference] = {}
//     }
//
//     node.var = `${name}${this.node[node.name]}`
//
//     this.js += this.indent(indent) + `${root}.appendChild(doc.createTextNode("\\n${this.indent(indent)}"));\n`
//     this.js += this.indent(indent) + `const ${node.var} = ${root}.appendChild(doc.createElementNS('${namespace}', ${JSON.stringify(name)}));\n`
//
//     for (const attr of node.attrs) {
//       if (attr.name.match(/^(xmlns|on(pane)?load|insertafter|insertbefore)/)) continue
//
//       if (attr.name === 'class') {
//         if (!attr.val.match(/^'[^']+'$/)) throw new Error(attr.val)
//         this.js += this.indent(indent + 1) + `${node.var}.classList.add(${JSON.stringify(attr.val.slice(1, -1))});\n`
//         continue
//       }
//
//       var { namespace, name } = this.unpack(attr.name)
//       if (namespace === this.ns.xul && name === 'onpaneload') continue
//       if (namespace === this.ns.bbt && name === 'affects') continue
//
//       let val
//       if (attr.val.match(/^"&.+;"$/) || attr.val.match(/^'&.+;'$/)) {
//         const key = JSON.stringify(attr.val.slice(2, -2))
//         val = `tr[${key}] || ${key}`
//       }
//       else {
//         val = attr.val
//       }
//       if (namespace === this.ns.xul) {
//         this.js += this.indent(indent + 1) + `${node.var}.setAttribute(${JSON.stringify(name)}, ${val});\n`
//       }
//       else {
//         this.js += this.indent(indent + 1) + `${node.var}.setAttributeNS('${namespace}', ${JSON.stringify(name)}, ${val});\n`
//       }
//     }
//     this.Block(node.block, node.var, indent + 1)
//   }
//
//   Block(node, root, indent) {
//     for (const sub of node.nodes) {
//       this.generate(sub, root, indent)
//     }
//   }
//
//   Comment(node, root, indent) {
//     return
//     this.js += `/* ${node.val.replace(/[/][*]/g, '/ *').replace(/[*][/]/g, '* /')} */\n`
//   }
//
//   indent(n) { return '  '.repeat(n) }
//
//   Text(node, root, indent) {
//     if (node.val.startsWith('<?xml')) return
//     if (node.val.startsWith('<!DOCTYPE')) return
//
//     let js
//     if (node.val.match(/^&.+;$/)) {
//       if (root.startsWith('script')) throw new Error(root)
//       const key = JSON.stringify(node.val.slice(1, -1))
//       js = `doc.createTextNode(tr[${key}] || ${key})`
//     } else if (root.startsWith('script')) {
//       this.js += node.val
//       return
//     }
//     else {
//       js = `doc.createTextNode(${JSON.stringify(node.val)})`
//     }
//     if (!node.val.trim()) return
//     this.js += this.indent(indent) + `${root}.appendChild(${js});\n`
//   }
// }
// const generator = new XUL
// options.plugins = [{
//   preCodeGen(ast, options) {
//     generator.start(ast)
//     return ast
//   }
// }]
//
// pug.renderFile('content/Preferences/prefpane.pug', options)
// fs.writeFileSync('gen/preferences/xul.js', generator.js)
// fs.writeFileSync('gen/preferences/doc.json', JSON.stringify(generator.preferences, null, 2))

class Namespace {
  constructor(ast) {
    this.convert(ast, 'root', 1)
  }

  convert(node, root, indent) {
    this[node.type](node)
  }

   Block(node) {
     for (const sub of node.nodes) {
       this.convert(sub)
    }
  }

  Text(node) {
  }
  Comment(node) {
  }

  Tag(node, root, indent) {
    if (node.name === 'script') return

    /*
    // make html the default namespace
    if (node.name.startsWith('html:')) {
      node.name = node.name.replace('html:', '')
    }
    else {
      node.name = `xul:${node.name}`
    }
    */

    this.Block(node.block)
  }
}
options.plugins = [{
  preCodeGen(ast, options) {
    // new Namespace(ast)
    return ast
  }
}]

const xul = pug.renderFile(src, options)
const build = path.dirname(tgt)
if (!fs.existsSync(build)) fs.mkdirSync(build, { recursive: true })
fs.writeFileSync(tgt, xul.replace(/&amp;/g, '&').trim())
