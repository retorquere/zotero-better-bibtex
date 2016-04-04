serialize = (csl) ->
  for k, v of csl
    csl[k] = (new @HTML(v)).markdown if typeof v == 'string' && v.indexOf('<') >= 0
  YAML.safeDump([csl], {skipInvalid: true})

flush = (items) -> "---\nreferences:\n" + items.join("\n") + "...\n"

class HTML
  constructor: (html) ->
    @markdown = ''
    @walk(Zotero.BetterBibTeX.HTMLParser(html))

  walk: (tag) ->
    return unless tag

    if tag.name in ['#text', 'script']
      @markdown += tag.text.replace(/([\[*~^])/g, "\\$1")
      return

    switch tag.name
      when 'i', 'em', 'italic'
        @markdown += '*'

      when 'b', 'strong'
        @markdown += '**'

      when 'a'
        ### zotero://open-pdf/0_5P2KA4XM/7 is actually a reference. ###
        @markdown += '[' if tag.attrs.href?.length > 0

      when 'sup'
        @markdown += '^'

      when 'sub'
        @markdown += '~'

      when 'sc'
        @markdown += '<span style="font-variant:small-caps;">'
        tag.attrs.style = "font-variant:small-caps;"

      when 'span'
        @markdown += "<span#{(" #{k}=\"#{v}\"" for k, v of tag.attrs).join('')}>" if Object.keys(tag.attrs).length > 0

      when 'tbody', '#document', 'html', 'head', 'body' then # ignore

      else
        Translator.debug("unexpected tag '#{tag.name}'")

    for child in tag.children
      @walk(child)

    switch tag.name
      when 'i', 'italic', 'em'
        @markdown += '*'

      when 'b', 'strong'
        @markdown += '**'

      when 'sup'
        @markdown += '^'

      when 'sub'
        @markdown += '~'

      when 'a'
        @markdown += "](#{tag.attrs.href})" if tag.attrs.href?.length > 0

      when 'sc'
        @markdown += '</span>'

      when 'span'
        @markdown += '</span>' if Object.keys(tag.attrs).length > 0
