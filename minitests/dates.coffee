#maxlocales = 46
#locales = Object.keys(Zotero.BetterBibTeX.CSLMonths)
#console.log('' + locales.length + ' locales')
#locales.sort()
#for locale, i in locales
#  continue if locale == 'tr-TR'
#  console.log(locale)
#  Zotero.DateParser.addDateParserMonths(Zotero.BetterBibTeX.CSLMonths[locale])
#  #break if i > maxlocales

Zotero.DateParser.addDateParserMonths(["ocak", "Şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık", "bahar", "yaz", "sonbahar", "kış"])

#console.log(Zotero.DateParser.parseDateToArray('2014-12-31/2015-01-01'))
#console.log(Zotero.DateParser.parseDateToObject('2014-12-31/2015-01-01'))
#console.log(Zotero.DateParser.parseDateToString('2014-12-31/2015-01-01'))
#console.log(Zotero.DateParser.parseDateToObject('1897_1913'))
#console.log(Zotero.DateParser.parseDateToObject('01/01/1989'))
#console.log(Zotero.DateParser.parseDateToObject('2004 [1929]'))
console.log(Zotero.DateParser.parseDateToObject("September 20, 2006"))
