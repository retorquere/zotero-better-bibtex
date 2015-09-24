locales = Object.keys(Zotero.BetterBibTeX.Locales.months)
console.log('' + locales.length + ' locales')
locales.sort()
for locale, i in locales
  continue if locale == 'tr-TR'
  continue unless locale == 'fr-FR'
  Zotero.DateParser.addDateParserMonths(Zotero.BetterBibTeX.Locales.months[locale])

#console.log(Zotero.DateParser.parseDateToArray('2014-12-31/2015-01-01'))
#console.log(Zotero.DateParser.parseDateToObject('2014-12-31/2015-01-01'))
#console.log(Zotero.DateParser.parseDateToString('2014-12-31/2015-01-01'))
#console.log(Zotero.DateParser.parseDateToObject('1897_1913'))
#console.log(Zotero.DateParser.parseDateToObject('01/01/1989'))
#console.log(Zotero.DateParser.parseDateToObject('2004 [1929]'))
console.log(Zotero.DateParser.parseDateToObject("September 20, 2006"))
console.log(Zotero.DateParser.parseDateToObject("Autumn 2001"))
console.log(Zotero.DateParser.parseDateToObject("15 juin 2009"))
