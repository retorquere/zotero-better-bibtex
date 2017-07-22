var parser = require('../content/keymanager/formatter.pegjs')

console.log(parser.parse('pre:[>0][zotero:fold]:post[Title]', {methods: {zotero: true}, filters: {fold: true}}));
