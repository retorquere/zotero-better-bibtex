var doc = Zotero.BetterBibTeX.cayw.createDocument();
yield Zotero.Integration.execCommand("BetterBibTeX", "addEditCitation", doc.id);

var citation = doc.fields.length ? JSON.parse(doc.fields[0].code.replace(/ITEM CSL_CITATION /, '')) : { citationItems: []}

citation = citation.citationItems.map(item => {
	return {
    id: item.id,
    locator: item.locator,
    suppressAuthor: item['suppress-author'],
    prefix: item.prefix,
    suffix: item.suffix,
    label: item.label
	}
})

Zotero.BetterBibTeX.cayw.closeDocument(doc)

Zotero.debug('picked:' + citation)
return citation
