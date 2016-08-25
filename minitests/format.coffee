util = require('util')

console.log(JSON.stringify(BetterBibTeXPatternParser.parse('[authors3+initials]'), null, 2))
console.log(JSON.stringify(BetterBibTeXPatternParser.parse('[authEtAl]'), null, 2))
