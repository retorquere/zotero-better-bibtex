#console.log(Zotero.DateParser.parseDateToArray('2014-12-31/2015-01-01'))
#console.log(Zotero.DateParser.parseDateToObject('2014-12-31/2015-01-01'))
#console.log(Zotero.DateParser.parseDateToString('2014-12-31/2015-01-01'))
#console.log(Zotero.DateParser.parseDateToObject('1897_1913'))
#console.log(Zotero.DateParser.parseDateToObject('01/01/1989'))
#console.log(Zotero.DateParser.parseDateToObject('2004 [1929]'))

shape = "2014-10"
cruft = XRegExp("[^\\p{Letter}\\p{Number}]+", 'g')
shape = XRegExp.replace(shape, cruft, ' ', 'all')
console.log(shape)
