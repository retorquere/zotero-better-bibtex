L = XRegExp('^\\p{L}')
Lu = XRegExp('^\\p{Lu}')
N = XRegExp('^\\p{N}')

str = _str = 'A \uD87E\uDC04 Z'
# We could also use a non-BMP character directly
for i in [0..1000]
  str += _str
str = "a <span class=\"nocase\">'Social' History</span> of <span class=\"nocase\">Knowledge's Revisited</span>"


preserveCase =
  hasCapital: new XRegExp('\\p{Lu}')
  words: new XRegExp("""((?<boundary>^|[^\\p{N}\\p{L}])    (?<word>[\\p{L}\\p{N}]*\\p{Lu}[\\p{L}\\p{N}]*))""", 'gx')
  initialCapOnly: new XRegExp("^\\p{Lu}[^\\p{Lu}]*$")

  preserve: (value) ->
    return XRegExp.replace(value, @words, (match, matches...) =>
      pos = matches[matches.length - 2]
      if !XRegExp.test(match.word, @hasCapital) || (pos == 0 && XRegExp.test(match.word, @initialCapOnly))
        return match.boundary + match.word
      else
        return "#{match.boundary}<span class=\"nocase\">#{match.word}</span><!-- nocase:end -->"
    )

getWholeCharAndI = (str, i) ->
  code = str.charCodeAt(i)
  return [ str.charAt(i), i ] if code < 0xD800 or code > 0xDFFF
  return [ str.charAt(i) + str.charAt(i + 1), i + 1 ]

breaker = (str) ->
  words = []
  i = 0
  while i < str.length
    code = str.charCodeAt(i)

    if code < 0xD800 or code > 0xDFFF
      chr = str.charAt(i)

    else
      chr = str.charAt(i) + str.charAt(i + 1)
      i++
    i++

    switch chr
      when '<'
        inNode = true
      when '>'
        inNode = false

    lu = Lu.test(chr)
    l = lu || L.test(chr)
    word = !inNode && !!(l || N.test(chr))

    switch
      when words.length == 0
        words = [{
          str: chr
          initialCap: lu
          otherCap: false
          word
        }]
      when word == words[0].word
        words[0].str += chr
        words[0].otherCap = lu
      else
        words.unshift({
          str: chr
          initialCap: lu
          otherCap: false
          word
        })

  words.reverse()
  _str = ''
  for word, i in words
    if word.word && (word.initialCap || word.otherCap) && !(i == 0 && word.initialCap && !word.otherCap)
      _str += "<span class=\"nocase\">#{word.str}</span>"
    else
      _str += word.str

  return _str

attempts = 1

console.time('xregexp')
for attempt in [0..attempts]
  preserveCase.preserve(str)
console.timeEnd('xregexp')

console.time('breaker')
for attempt in [0..attempts]
  breaker(str)
console.timeEnd('breaker')
