/* eslint-disable @typescript-eslint/explicit-module-boundary-types, no-eval, @typescript-eslint/no-unsafe-return */
export class ASTWalker {
  walk(node, history?) {
    if (history) history = [node, ...history]

    if (this[node.type]) return this[node.type](node, history)

    throw new Error(`No handler for ${node.type}`)
  }

  attr(node, name: string, required=false): string {
    const attr = node.attrs.find(a => a.name === name)
    if (!attr && required) throw new Error(`could not find ${node.name}.${name} in ${node.attrs.map(a => a.name)}`)
    return attr ? eval(attr.val) : null
  }

  Tag(node, _history) {
    node.block = this.walk(node.block)
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

