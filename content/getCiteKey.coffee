re = /(?:^|\n)bibtex(\*?):([^\n]+)(?:\n|$)/

module.exports = (item) ->
  item.extra ||= ''
  [_, dynamic, citekey] = re.exec(item.extra) || [null, '*', '']
  citekey = citekey.trim()
  item.extra = item.extra.replace(re, "\n").trim()
  return {citekey, dynamic}
