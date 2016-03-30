util = require('util')

console.log(JSON.stringify(BetterBibTeXPatternParser.parse('[year:lower][>0]-updated>[auth][year]'), null, 2))
