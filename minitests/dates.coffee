#locales = Object.keys(Zotero.BetterBibTeX.Locales.months)
#console.log('' + locales.length + ' locales')
#locales.sort()
#for locale, i in locales
#  continue if locale == 'tr-TR'
#  #continue unless locale == 'fr-FR'
#  Zotero.DateParser.addDateParserMonths(Zotero.BetterBibTeX.Locales.months[locale])

#console.log(Zotero.DateParser.parseDateToArray('2014-12-31/2015-01-01'))
#console.log(Zotero.DateParser.parseDateToObject('2014-12-31/2015-01-01'))
#console.log(Zotero.DateParser.parseDateToString('2014-12-31/2015-01-01'))
#console.log(Zotero.DateParser.parseDateToObject('1897_1913'))
#console.log(Zotero.DateParser.parseDateToObject('01/01/1989'))
#console.log(Zotero.DateParser.parseDateToObject('2004 [1929]'))
#console.log(Zotero.DateParser.parseDateToObject("September 20, 2006"))
#console.log(Zotero.DateParser.parseDateToObject("Autumn 2001"))
#console.log(Zotero.DateParser.parseDateToObject("15 juin 2009"))
#console.log(Zotero.DateParser.parseDateToObject("März 1, 2008"))

re = new XRegExp("""(
          # word with embedded punctuation
          ((?<boundary2>^|[^'\\p{N}\\p{L}])   (?<word2>[\\p{L}\\p{N}]+'[\\p{L}\\p{N}]+))
          |
          ((?<boundary2>^|[^-\\p{N}\\p{L}])   (?<word2>[\\p{L}\\p{N}]+[-\\p{L}\\p{N}]+[\\p{L}\\p{N}]))

          |
          # simple word
          ((?<boundary1>^|[^\\p{N}\\p{L}])    (?<word1>[\\p{L}\\p{N}]*\\p{Lu}[\\p{L}\\p{N}]*))
        )""", 'gx')

str = "Computational Models of Non-Cooperative Dialogue"
str = XRegExp.replace(str, re, (match) ->
  console.log(typeof match.word1 + ': ' + JSON.stringify({word: match.word1}))
  console.log(typeof match.word2 + ': ' + JSON.stringify({word: match.word2}))
  console.log(typeof match.word3 + ': ' + JSON.stringify({word: match.word3}))
  return 'xx'
)
