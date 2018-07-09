declare Components: any
declare Node: any

function convert(node) {
  switch (node.nodeType) {
    case Node.DOCUMENT_NODE:
      return { type: 'document', children: [ convert(node.documentElement) ] }

    case Node.ELEMENT_NODE:
      const content = node.hasChildren() ? [...node.childNodes].map(child => convert(child)) : []
      const attributes = {}
      for (const attr in [...node.attributes]) {
        attributes[attr.name] = attr.value
      }
      return { type: 'node', name: node.nodeName, attributes, content }

    case Node.TEXT_NODE:
      return { type: 'text', content: node.textContent }

    default:
      throw new Error(`Unsupported node type `${node.nodeType}`)
  }
}

export function parse(html) {
  html = html.replace(/<pre>/g, '<script>').replace(/<\/pre>/g, '</script>')

  const domParser = Components.classes['@mozilla.org/xmlextras/domparser;1'].createInstance(Components.interfaces.nsIDOMParser)
  return convert(domParser.parseFromString(`<span>${html}</span>`, 'text/html'))
}
