/* eslint-disable @typescript-eslint/explicit-module-boundary-types, no-eval, @typescript-eslint/no-unsafe-return */


import fs from 'fs'
import path from 'path'

export function pugs(directory: string) {
  let fileList: string[] = []

  const files = fs.readdirSync(directory)
  for (const file of files) {
    const p = path.join(directory, file)
    if (fs.statSync(p).isDirectory()) {
      fileList = [...fileList, ...pugs(p)]
    }
    else if (path.extname(p) === '.pug' && fs.statSync(p).isFile()) {
      fileList.push(p)
    }
  }

  return fileList
}

export class ASTWalker {
  walk(node, history?) {
    if (history) history = [node, ...history]

    if (this[node.type]) return this[node.type](node, history)

    throw new Error(`No handler for ${node.type} ${Object.keys(node)}`)
  }

  attr(node, name: string, required=false): string {
    const attr = node.attrs.find(a => a.name === name)
    if (!attr && required) throw new Error(`could not find ${node.name}.${name} in ${node.attrs.map(a => a.name)}`)
    return attr ? eval(attr.val) : null
  }

  Mixin(node, history) {
    if (node.block) node.block = this.walk(node.block, history)
    return node
  }

  NamedBlock(node, history) {
    node.nodes = node.nodes.map(child => this.walk(child, history)).filter(child => child)
    return node
  }

  Conditional(node, history) {
    let keep = true
    if (!(node.consequent = this.walk(node.consequent, history))) keep = false
    if (node.alternate && !(node.alternate = this.walk(node.alternate, history))) keep = false
    if (keep) return node
  }

  Tag(node, history) {
    node.block = this.walk(node.block, history)
    return node
  }

  Block(node, history) {
    node.nodes = node.nodes.map(n => this.walk(n, history)).filter(n => n)
    return node
  }

  Text(node, _history) {
    return node
  }

  Comment(node) {
    return node
  }

  BlockComment(node) {
    return node
  }
}

export class SelfClosing extends ASTWalker {
  Tag(tag) {
    this.walk(tag.block)
    if (!tag.block.nodes.length) tag.selfClosing = true
    return tag
  }
}

export function walk(cls, ast) {
  const walker = new cls
  walker.walk(ast, [])
  return walker
}
