#!/usr/bin/env node

const pug = require('pug')
const fs = require('fs')
const path = require('path')
const glob = require('glob-promise')
const peggy = require("peggy");
const dtd = peggy.generate(fs.readFileSync('setup/dtd-file.peggy', 'utf-8')).parse(fs.readFileSync('locale/en-US/zotero-better-bibtex.dtd', 'utf-8'))

const translators = glob.sync('translators/*.json')
  .map(tr => require(`../${tr}`).label)
  .filter(tr => tr.match(/Better /) && !tr.match(/Quick/))

const src = process.argv[2] || 'content/Preferences.pug'
const tgt = process.argv[3] || 'build/content/Preferences.xul'

const options = {}
options.pretty = true

class Namespace {
  constructor(ast) {
    this.preferences = {}
    this.preference = null
    this.convert(ast, 'root', 1)
    console.log(this.preferences)
  }

  error(...args) {
    console.log(...args)
    process.exit(1)
  }

  register(node) {
    const name = this.attr(node, 'name', true)
    const id = this.attr(node, 'id')
    if (id) this.error('obsolete preference id', id)

    const pref = {
      name,
      type: this.attr(node, 'type', true),
      default: this.attr(node, 'default', true),
      affects: this.attr(node, 'bbt:affects', true),
    }

    switch (pref.type) {
      case 'bool':
      case 'int':
        pref.default = eval(pref.default)
        if (typeof pref.default !== (pref.type === 'bool' ? 'boolean' : 'number')) this.error(this.attr(node, 'default'), 'is not', pref.type)
        break
      case 'string':
        break
      default:
        this.error('Unexpected type', pref.type)
    }

    pref.affects = pref.affects
      .split(/\s+/)
      .reduce((acc, affects) => {
        switch(affects) {
          case '':
            break

          case '*':
            acc.push(...translators)
            break

          case 'tex':
          case 'bibtex':
          case 'biblatex':
          case 'csl':
            acc.push(...translators.filter(tr => tr.toLowerCase().includes(affects)))
            break

          default:
            this.error('Unexpected affects', affects, 'in', pref.affects, name)
        }
        return acc
      }, [])
      .sort()

    this.preferences[this.preference = name] = pref
    // console.log('registered', this.preference)
  }

  attr(node, name, required) {
    const attr = node.attrs.find(attr => attr.name === name)
    if (!attr && required) this.error(`could not find ${node.name}.${name} in`, this.attr(node, 'name'))
    return attr ? eval(attr.val) : null
  }

  doc(doc, pref) {
    doc = doc.replace(/&([^;]+);/g, (entity, id) => {
      if (!dtd[id]) this.error(id, 'not in dtd')
      return dtd[id]
    })
    pref = pref || this.preference
    if (!pref) this.error('doc for no pref')
    if (!this.preferences[pref]) this.error('doc for unregistered', pref)
    if (this.preferences[pref].doc) this.error('re-doc for', pref, '\nold:', this.preferences[pref].doc, '\nnew:', doc)
    this.preferences[pref].doc = doc
  }

  convert(node, root, indent) {
    if (!this[node.type]) this.error(node.type)
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
  BlockComment(node) {
  }

  text(node) {
    if (!node) this.error('text: no node')

    switch (node.type) {
      case 'Block':
        return node.nodes.map(n => this.text(n)).join('')
      case 'Text':
        return node.val
      default:
        this.error('text: unexpected', node.type)
    }
  }

  Tag(node, root, indent) {
    let pref, id
    switch (node.name) {
      case 'script':
        return

      case 'preference':
        this.register(node)
        // clone name to id
        pref = node.attrs.find(attr => attr.name === 'name')
        node.attrs.push({...pref, name: 'id'})
        break

      case 'tooltip':
        if (id = this.attr(node, 'id', true)) {
          pref = id.replace('tooltip-', 'extensions.zotero.translators.better-bibtex.')
          if (!this.preferences[pref]) this.error(pref)
          this.doc(this.text(node.block.nodes.find(n => n.type === 'Tag' && n.name === 'description').block), pref)
        }
        break

      case 'bbt:doc':
        this.doc(this.text(node.block))
        break

      default:
        pref = this.attr(node, 'preference') || this.attr(node, 'bbt:preference')
        if (pref && !this.preferences[pref]) this.error(pref)
        break
    }

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
    new Namespace(ast)
    return ast
  }
}]

const xul = pug.renderFile(src, options)
const build = path.dirname(tgt)
if (!fs.existsSync(build)) fs.mkdirSync(build, { recursive: true })
fs.writeFileSync(tgt, xul.replace(/&amp;/g, '&').trim())
