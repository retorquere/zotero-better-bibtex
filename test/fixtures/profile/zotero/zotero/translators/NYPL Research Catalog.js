{
	"translatorID": "dcf75e09-7f8a-4d4d-ad6f-363b46f79b13",
	"translatorType": 4,
	"label": "NYPL Research Catalog",
	"creator": "Abe Jellinek",
	"target": "^https://www\\.nypl\\.org/research/research-catalog/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-24 21:35:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Abe Jellinek
	
	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/


function detectWeb(doc, url) {
	if (url.includes('/bib/')) {
		return "book";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.nypl-results-item a.title');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(row.textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, _url) {
	let jsonText = Array.from(doc.querySelectorAll('script:not([src])'))
		.map(el => el.textContent.trim().replace(/^[^{]*(\{.+\});$/, '$1'))
		.find(text => text.startsWith('{'));
	let bib = JSON.parse(jsonText).bib;
	
	// it's easiest we get MARC, but some items don't have it
	if (bib.annotatedMarc.bib.fields.length) {
		scrapeMARC(bib.annotatedMarc.bib.fields);
	}
	else {
		scrapeNYPLMetadata(bib);
	}
}

function scrapeMARC(fields) {
	Z.debug('Using annotated MARC');
	
	// call MARC translator
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
	translator.getTranslatorObject(function (marc) {
		var record = new marc.record();
		var item = new Zotero.Item();
		// no leader
		var fieldTag, indicators, fieldContent;
		for (let field of fields) {
			for (let value of field.values) {
				let source = value.source;
				fieldTag = source.marcTag;
				indicators = source.ind1 + source.ind2;
				fieldContent = '';
				
				for (let subfield of source.subfields || []) {
					fieldContent += marc.subfieldDelimiter + subfield.tag
						+ subfield.content;
				}
				
				if (!fieldContent) {
					fieldContent = source.content || '';
				}
	
				record.addField(fieldTag, indicators, fieldContent);
			}
		}
		
		record.translate(item);

		if (item.seriesNumber) {
			item.seriesNumber = item.seriesNumber.replace(/^[^0-9]+/, '');
		}
		
		item.complete();
	});
}

// get the ith element of the array. if the array is null or there is no ith
// element, return the empty string.
function maybe(propertyArray, i = 0) {
	return (propertyArray || [])[i] || '';
}

function scrapeNYPLMetadata(bib) {
	Z.debug('Using NYPL metadata');
	
	let item = new Zotero.Item('book');
	item.title = bib.title[0].split('/')[0]
		.replace(' : ', ': ')
		.replace(/\.$/, '');
	item.abstractNote = maybe(bib.extent);
	[item.series, item.seriesNumber] = maybe(bib.seriesStatement).split(';');
	item.numberOfVolumes = maybe(item.abstractNote.match(/(\d+) v\./), 1);
	item.place = maybe(bib.placeOfPublication).replace(/:\s*$/, '');
	item.publisher = maybe(bib.publisherLiteral).replace(/,\s*$/, '');
	item.date = ZU.strToISO(maybe(bib.dateString));
	item.numPages = maybe(item.abstractNote.match(/(\d+) p/), 1);
	item.language = (bib.language[0] || {})['@id'].replace('lang:', '');
	item.ISBN = maybe(bib.idIsbn);
	item.callNumber = (bib.items || []).map(result => result.shelfMark).join('; ');
	
	for (let creatorLit of bib.creatorLiteral || []) {
		creatorLit = creatorLit.replace(/\([^)]+\)/, '');
		item.creators.push(ZU.cleanAuthor(creatorLit, 'author', true));
	}
	
	for (let creatorLit of bib.contributorLiteral || []) {
		creatorLit = creatorLit.replace(/\([^)]+\)/, '');
		let contributor = ZU.cleanAuthor(creatorLit, 'contributor', true);
		
		// search for any mention of the contributor's last name right after
		// a word that looks like "translation"
		let translated = bib.title[0].match(/trans(?:\.|lat(?:ion|ed by))[,:]?\s*([^.,/:]+)/i);
		if (translated
			&& translated[1].toLowerCase().includes(
				contributor.lastName.toLowerCase())) {
			contributor.creatorType = 'translator';
		}
		
		item.creators.push(contributor);
	}
	
	for (let creator of item.creators) {
		if (!creator.firstName) {
			delete creator.firstName;
			creator.fieldMode = 1;
		}
	}

	let uniformTitle = maybe(bib.uniformTitle).trim().replace(/[.,/:]$/, '');
	if (uniformTitle && uniformTitle.endsWith('. English')) {
		item.extra = 'original-title: '
			+ uniformTitle.substring(0, uniformTitle.length - '. English'.length);
	}
	
	item.tags = (bib.subjectLiteral || []).map(tag => ({ tag }));
	
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.nypl.org/research/research-catalog/bib/b10100226",
		"items": [
			{
				"itemType": "book",
				"title": "The prison and the prisoner",
				"creators": [
					{
						"firstName": "Dorothy Louise Campbell Culver",
						"lastName": "Tompkins",
						"creatorType": "author"
					}
				],
				"date": "1972",
				"ISBN": "9780877721406",
				"callNumber": "JLE 73-1562",
				"libraryCatalog": "NYPL Research Catalog",
				"numPages": "156",
				"place": "Berkeley",
				"publisher": "Institute of Governmental Studies, University of California",
				"series": "Public policy bibliographies",
				"seriesNumber": "1",
				"attachments": [],
				"tags": [
					{
						"tag": "Bibliography"
					},
					{
						"tag": "Bibliography"
					},
					{
						"tag": "Prisoners"
					},
					{
						"tag": "Prisons"
					},
					{
						"tag": "United States"
					},
					{
						"tag": "United States"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.nypl.org/research/research-catalog/bib/cb13214660",
		"items": [
			{
				"itemType": "book",
				"title": "The fifth line: thoughts of a painter",
				"creators": [
					{
						"firstName": "Steven",
						"lastName": "Aalders",
						"creatorType": "author"
					},
					{
						"firstName": "Robert van",
						"lastName": "Altena",
						"creatorType": "contributor"
					},
					{
						"firstName": "Michael",
						"lastName": "Ritchie",
						"creatorType": "translator"
					}
				],
				"date": "2017",
				"ISBN": "9783960981916",
				"abstractNote": "271 pages : illustrations (some color) ;",
				"callNumber": "ND653.A218 A35 2017g",
				"extra": "original-title: Vijfde lijn",
				"language": "eng",
				"libraryCatalog": "NYPL Research Catalog",
				"numPages": "271",
				"place": "London",
				"publisher": "Koenig Books",
				"shortTitle": "The fifth line",
				"attachments": [],
				"tags": [
					{
						"tag": "Aalders, Steven, 1959- -- Interviews."
					},
					{
						"tag": "Painters -- Netherlands -- Interviews."
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.nypl.org/research/research-catalog/bib/b12500994",
		"items": [
			{
				"itemType": "book",
				"title": "The annals of Tacitus. Book 3",
				"creators": [
					{
						"firstName": "Cornelius",
						"lastName": "Tacitus",
						"creatorType": "author"
					},
					{
						"firstName": "A. J.",
						"lastName": "Woodman",
						"creatorType": "author"
					},
					{
						"firstName": "Ronald H.",
						"lastName": "Martin",
						"creatorType": "author"
					}
				],
				"date": "1996",
				"ISBN": "9780521552172",
				"callNumber": "JFD 99-2938",
				"libraryCatalog": "NYPL Research Catalog",
				"numPages": "514",
				"place": "New York",
				"publisher": "Cambridge University Press",
				"series": "Cambridge classical texts and commentaries",
				"seriesNumber": "32",
				"attachments": [],
				"tags": [
					{
						"tag": "Germanicus"
					},
					{
						"tag": "Germanicus Caesar"
					},
					{
						"tag": "History"
					},
					{
						"tag": "Roman Empire"
					},
					{
						"tag": "Rome"
					},
					{
						"tag": "Tiberius, 14-37"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.nypl.org/research/research-catalog/bib/pb7046437",
		"items": [
			{
				"itemType": "book",
				"title": "Rumi and Christ: and sublimity of Rumi's love",
				"creators": [
					{
						"firstName": "Erkan",
						"lastName": "Turkmen",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"ISBN": "9786054336692",
				"abstractNote": "83 p. ;",
				"callNumber": "PK6482 .T874 2011",
				"language": "eng",
				"libraryCatalog": "NYPL Research Catalog",
				"numPages": "83",
				"place": "Konya",
				"publisher": "NKM",
				"shortTitle": "Rumi and Christ",
				"attachments": [],
				"tags": [
					{
						"tag": "Jalāl al-Dīn Rūmī, Maulana, 1207-1273 -- Political and social views."
					},
					{
						"tag": "Jesus Christ."
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.nypl.org/research/research-catalog/bib/pb7648250",
		"items": [
			{
				"itemType": "book",
				"title": "ICSL godišnjak međunarodnog susreta bibliotekara slavista u Sarajevu = ICSL yearbook of International Convention of Slavicist Librarians' in Sarajevo",
				"creators": [
					{
						"lastName": "International Convention of Slavicist Librarians",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2005",
				"abstractNote": "v. ;",
				"callNumber": "Z672.5 .I5628 2011 (vol-. 6/7)",
				"language": "bos",
				"libraryCatalog": "NYPL Research Catalog",
				"place": "Sarajevo",
				"publisher": "IK \"MAGISTRAT\"",
				"attachments": [],
				"tags": [
					{
						"tag": "Library science -- Congresses."
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.nypl.org/research/research-catalog/bib/pb4847643",
		"items": [
			{
				"itemType": "book",
				"title": "Thomas' calculus: early transcendentals",
				"creators": [],
				"date": "2006",
				"ISBN": "9780536273901",
				"abstractNote": "2 v. : ill. ;",
				"callNumber": "QA303.2 .T48 2006 vol.2; QA303.2 .T48 2006 vol.1",
				"language": "eng",
				"libraryCatalog": "NYPL Research Catalog",
				"numberOfVolumes": "2",
				"place": "Boston, MA",
				"publisher": "Pearson Custom Publishing",
				"shortTitle": "Thomas' calculus",
				"attachments": [],
				"tags": [
					{
						"tag": "Calculus."
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.nypl.org/research/research-catalog/search?q=sierra%20nevada",
		"items": "multiple"
	}
]
/** END TEST CASES **/
