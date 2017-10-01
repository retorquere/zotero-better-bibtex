declare var Components: any;

const serializer = Components.classes['@mozilla.org/xmlextras/xmlserializer;1'].createInstance(Components.interfaces.nsIDOMSerializer);
const nsiDocument = Components.classes['@mozilla.org/xul/xul-document;1'].getService(Components.interfaces.nsIDOMDocument);

class XmlNode {
  private Node: any;

  constructor(private namespace: string, private root: any, private doc: any) {
    this.namespace = namespace;
    this.root = root;
    this.doc = doc;
    if (!this.doc) {
      this.doc = nsiDocument.implementation.createDocument(this.namespace, this.root, null);
      this.root = this.doc.documentElement;
    }
  }

  serialize() { return serializer.serializeToString(this.doc); }

  alias(names) {
    for (let name of names) {
      this.Node.prototype[name] = ((name) => function(...v) { return XmlNode.prototype.add.apply(this, [{[name]: v[0]}].concat(v.slice(1))); })(name);
    }
  }

  set(node, ...attrs) {
    for (let attr of attrs) {
      for (let name in attr) {
        const value = attr[name];
        switch (false) {
          case typeof value !== 'function':
            value.call(new this.Node(this.namespace, node, this.doc));
            break;

          case name !== '':
            node.appendChild(this.doc.createTextNode(`${value}`));
            break;

          default:
            node.setAttribute(name, `${value}`);
        }
      }
    }
  }

  add(...content) {
    let attrs, node;
    if (typeof content[0] === 'object') {
      for (let name of Object.keys(content[0])) {
        attrs = content[0][name];
        if (name === '') { continue; }
        // @doc['createElementNS'] rather than @doc.createElementNS because someone thinks there's a relevant difference
        node = this.doc.createElementNS(this.namespace, name);
        this.root.appendChild(node);
        content = [attrs].concat(content.slice(1));
        break;
      } // there really should only be one pair here!
    }
    if (!node) { node = this.root; }

    content = content.filter((c) => (typeof c === 'number') || c);

    for (attrs of content) {
      switch (false) {
        case typeof attrs !== 'string':
          node.appendChild(this.doc.createTextNode(attrs));
          break;

        case typeof attrs !== 'function':
          attrs.call(new this.Node(this.namespace, node, this.doc));
          break;

        case !attrs.appendChild:
          node.appendChild(attrs);
          break;

        default:
          this.set(node, attrs);
      }
    }
  }
}

export default XmlNode;
