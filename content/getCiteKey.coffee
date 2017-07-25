re = /(?:^|\n)bibtex(\*?):\s*([^\n]+)(?:\n|$)/

module.exports = (item) ->
  item.extra ||= ''
  [_, dynamic, citekey] = re.exec(item.extra) || [null, '*', '']
  item.extra = item.extra.replace(re, "\n").trim()
  return {citekey, dynamic}
