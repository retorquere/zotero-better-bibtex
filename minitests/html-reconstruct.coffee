class Reconstruct
  constructor: (ast) ->
    @html = ''

    @walk(ast)

  walk: (node) ->
    if node.name == '#text'
      @html += node.text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return
    if node.name == 'pre'
      @html += '<pre>' + node.text + '</pre>'
      return

    for k of node
      node.attr[k] ||= '' unless k in ['children', 'name', 'attr', 'class']

    if node.name == 'span' && Object.keys(node.attr).length == 0
      for child in node.children
        @walk(child)
      return

    @html += "<#{node.name}"
    for k, v of node.attr
      @html += " #{k}='#{v}'"
    @html += '>'
    for child in node.children
      @walk(child)
    @html += "</#{node.name}>"
