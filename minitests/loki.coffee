loki = require('../chrome/content/zotero-better-bibtex/lokijs.js')
db = new loki('sandbox')
# Add a collection to the database
items = db.addCollection('items')
# Add some documents to the collection
items.insert({ name: 'mjolnir', owner: 'thor', maker: 'dwarves' })
items.insert({ name: 'gungnir', owner: 'odin', maker: 'elves' })
items.insert({ name: 'tyrfing', owner: 'Svafrlami', maker: 'dwarves' })
items.insert({ name: 'draupnir', owner: 'odin', maker: 'elves' })
# Find and update an existing document
tyrfing = items.findOne('name': 'tyrfing')
tyrfing.owner = 'arngrim'
items.update(tyrfing)
# These statements send to Text Output
console.log('tyrfing value :', tyrfing)
console.log('odins items',items.findObjects({owner: 'odin', maker: 'elves'}))
