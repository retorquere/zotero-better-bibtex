declare var Components: any

const serializer = Components.classes['@mozilla.org/xmlextras/xmlserializer;1'].createInstance(Components.interfaces.nsIDOMSerializer)
const nsiDocument = Components.classes['@mozilla.org/xul/xul-document;1'].getService(Components.interfaces.nsIDOMDocument)

class XmlNode {
  private NODE: any

  constructor(private namespace: string, private root: any, private doc: any) {
    this.namespace = namespace
    this.root = root
    this.doc = doc
    if (!this.doc) {
      this.doc = nsiDocument.implementation.createDocument(this.namespace, this.root, null)
      this.root = this.doc.documentElement
    }
  }

  public serialize() { return serializer.serializeToString(this.doc) }

  public alias(names) {
    for (const name of names) {
      this.NODE.prototype[name] = (n => function(...v) { return XmlNode.prototype.add.apply(this, [{[n]: v[0]}].concat(v.slice(1))) })(name)
    }
  }

  private set(node, ...attrs) {
    for (const attr of attrs) {
      for (const [name, value] of attr) {
        switch (false) {
          case typeof value !== 'function':
            value.call(new this.NODE(this.namespace, node, this.doc))
            break

          case name !== '':
            node.appendChild(this.doc.createTextNode(`${value}`))
            break

          default:
            node.setAttribute(name, `${value}`)
            break
        }
      }
    }
  }

  private add(...content) {
    let node

    if (typeof content[0] === 'object') {
      for (const [name, attrs] of content[0]) {
        if (name === '') continue

        // @doc['createElementNS'] rather than @doc.createElementNS because someone thinks there's a relevant difference
        node = this.doc.createElementNS(this.namespace, name)
        this.root.appendChild(node)
        content = [attrs].concat(content.slice(1))
        break
      } // there really should only be one pair here!
    }
    if (!node) node = this.root

    content = content.filter(c => (typeof c === 'number') || c)

    for (const attrs of content) {
      switch (false) {
        case typeof attrs !== 'string':
          node.appendChild(this.doc.createTextNode(attrs))
          break

        case typeof attrs !== 'function':
          attrs.call(new this.NODE(this.namespace, node, this.doc))
          break

        case !attrs.appendChild:
          node.appendChild(attrs)
          break

        default:
          this.set(node, attrs)
          break
      }
    }
  }
}

export default XmlNode
