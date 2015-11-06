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

re = new XRegExp("(?<!^|[^\\p{N}\\p{L}])([\\p{L}\\p{N}]*\\p{Lu}[\\p{L}\\p{N}]*)", 'gx')

str = "Wisdom: A Metaheuristic (pragmatic) to <i>Orchestrate</i> Mind and Virtue toward Excellence."
str = XRegExp.replace(str, re, (match) ->
  console.log('-----')
  for arg in arguments
    console.log(JSON.stringify(arg))
  return match
)
