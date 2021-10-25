{
	"translatorID": "0701696c-3523-47ba-9617-b04eee03b6ba",
	"translatorType": 4,
	"label": "Adam Matthew Digital",
	"creator": "Abe Jellinek",
	"target": "^https?://www\\.([^.]+)\\.amdigital\\.co\\.uk/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-11 04:25:00"
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
	if (url.includes('/DocumentDetails.aspx') // older collections
		|| url.includes('/DocumentDetailsSearch.aspx')) {
		return 'manuscript';
	}
	if (url.includes('/Documents/Details/') // newer collections
		|| url.includes('/Documents/SearchDetails')) {
		return getTypeNew(doc);
	}
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getTypeNew(doc) {
	let type = text(doc, 'tr[data-field-name="Document Type"] td[data-field-role="value"]');
	if (!type) {
		return 'document';
	}
	
	type = ZU.trimInternal(type).toLowerCase();
	
	if (type.includes('book')) {
		return 'book';
	}
	if (type.includes('manuscript')) {
		return 'manuscript';
	}
	if (type.includes('drawing') || type.includes('illustration')
		|| type.includes('photograph')) {
		return 'artwork';
	}
	if (type.includes('map')) {
		return 'map';
	}
	if (type.includes('correspondence')) {
		return 'letter';
	}
	return 'document';
}

function getSearchResults(doc, checkOnly) {
	const items = {};
	let found = false;
	const rows = doc.querySelectorAll(
		'.contentsList .tableRow .descriptionCell a, .SearchList tbody .title a');
	for (const row of rows) {
		const href = row.href;
		const title = ZU.trimInternal(row.textContent);
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

function scrape(doc, url) {
	if (url.includes('/Documents/')) {
		// newer collections (served with HTTPS, no .aspx pages) have a
		// completely different, and much easier to parse, structure
		scrapeNew(doc, url);
	}
	else {
		scrapeOld(doc, url);
	}
}

function scrapeNew(doc, url) {
	function fromTable(fieldName) {
		return text(doc, `tr[data-field-name="${fieldName}"] td[data-field-role="value"]`);
	}
	
	let item = new Zotero.Item(getTypeNew(doc));
	
	item.title = fromTable('Title');
	item.abstractNote = fromTable('Abstract');
	item.date = ZU.strToISO(fromTable('Date'));
	item.place = fromTable('Places');
	item.copyrightNote = fromTable('Copyright');
	item.publisher = fromTable('Publisher');
	item.creators = fromTable('Names')
		.split('; ')
		.map(name => ZU.cleanAuthor(name, 'author', true));
	
	let pageSelect = doc.querySelector('#DownloadPageFrom');
	if (pageSelect) {
		item.numPages = pageSelect.childElementCount;
	}
	item.archive = fromTable('Library/Archive') || fromTable('Collection');
	item.archiveLocation = fromTable('Reference');
	item.libraryCatalog = extractCatalogName(doc.title);
	item.url = url.replace('/SearchDetails/', '/Details/')
		.replace('?SessionExpired=True', '');
	item.attachments.push({
		title: "Full Text PDF",
		mimeType: 'application/pdf',
		url: attr(doc, 'a[href*="/FullDownload"]', 'href')
	});
	item.complete();
}

function scrapeOld(doc, url) {
	function fromTable(selector) {
		return text(doc, selector + ' > .detCol2') || text(doc, selector);
	}
	
	let item = new Zotero.Item('manuscript');
	
	item.title = fromTable('#Body_DocumentDetailsMeta_descSpan')
		|| fromTable('#Body_descriptionElement');
	let abstract = doc.querySelector('#Body_DocumentDetailsMeta_notesElement>.detCol2, #Body_notesElement>.detCol2');
	item.abstractNote = abstract ? abstract.innerText : "";
	item.date = ZU.strToISO(fromTable('#Body_DocumentDetailsMeta_dateElement'));
	
	let pageSelect = doc.querySelector('.pageRangeSelect'); // either will do
	if (pageSelect) {
		item.numPages = pageSelect.childElementCount;
	}
	item.archive = fromTable('#Body_DocumentDetailsMeta_sourceElement');
	
	let box = fromTable('#Body_DocumentDetailsMeta_boxElement')
		|| fromTable('#Body_boxElement');
	let folder = fromTable('#Body_DocumentDetailsMeta_folderElement')
		|| fromTable('#Body_folderElement');
	item.archiveLocation = `Box ${box}, folder ${folder}`;
	item.libraryCatalog = extractCatalogName(doc.title);
	item.attachments.push({
		title: "Full Text PDF",
		mimeType: 'application/pdf',
		url: attr(doc, '.downloadPDFLink > a', 'href')
	});
	// we want a URL without any search strings, navigation data, etc
	item.url = url.replace(/\?.*(documentid=[^&]+).*/, '?$1');
	
	item.complete();
}

/**
 * get the site's name by taking everything after the first segment of the title:
 * "Search Results - Jewish Life in America - Adam Matthew Digital"
 * becomes "Jewish Life in America - Adam Matthew Digital"
 */
function extractCatalogName(title) {
	return title.substring(title.indexOf('-') + 2);
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.jewishlife.amdigital.co.uk/Contents/DocumentDetailsSearch.aspx?documentid=289906&prevPos=289906&vpath=SearchResults&searchmode=true&pi=1",
		"items": [
			{
				"itemType": "manuscript",
				"title": "Manuscript notebook of poems",
				"creators": [],
				"abstractNote": "Page\n\n1 'The New Colossus'\n\n2 'Progress and Poverty'\n\n3 'Venus of the Louvre'\n\n4 'Destiny I'\n\n5 'Destiny II'\n\n6 'Influence'\n\n7 'Success'\n\n8-11 'Chopin I, II, III, IV'\n\n12 'With a Copy of Don Quixote'\n\n13 'To F.P.'\n\n14 'One Augur to Another'\n\n15 'Cranes of Ibicus'\n\n16 'Reconciliation'\n\n17 'Incident at Sea' 18 'Will O' the Wisp'\n\n19 'Assurance'\n\n20 'Echoes'\n\n21 'St. Michael's Chapel'\n\n22-23 'Under the Sea. I, II'\n\n24 'Taming of the Falcon'\n\n25 'Supreme Sacrifice'\n\n26 'Life and Art'\n\n27 'Sympathy'\n\n28 'Dreaming Castle'\n\n29 'To R.W.E.'\n\n30-37 'Symphonic Studies (after Robert Schumann). Prelude, I, II, III, IV, V, VI Epilogue'\n\n38 'City Visions'\n\n40 'Long Island Sound'\n\n41-49 Translated Sonnets:\n\nPage 41 'Art the Redeemer'\n\nPage 42 'From the French of Fran�ois Copp�'\n\nPages 44-49 'Six Sonnets from the Studies of Petrarch, a. 'In Vita LXVII', b. 'In Vita LXXVI', c. 'In Morte XLIII', d. 'In Morte II. On the Death of Cardinal Colonna and Laura', e. 'In Vita CIX', f. 'In Vita, CV'\n\n50 '1492'\n\n51 'Restlessness'\n\n52 'Child at the Bath. R. de K. G.'\n\n54 'Autumn Sadness'\n\n56 'Song. Venus'\n\n57 'From the Arabian Nights'\n\n58 'Reed Song'\n\n59 'Moonlight, from German of Eichendorff'\n\n60 'Songs from Eichendroff'\n\n61 'Lida and the Swan. Faust. Part II. Act II. Scene 2'\n\n62-72 'Phaon'\n\n73 'To the Moon after Sunrise'\n\n75-79 'Fragments from Petrarch'\n\nPage 75 'Canzone XII. 5'\n\nPage 76 'Trionfo Della Morte'\n\nPage 77 'Trionfo D'Amore'\n\nPage 78 'Triumph of Death'\n\n80 'Sunrise'\n\n85 'To Nelly [?] Sleeping'\n\n89-97 'The Creation of Man. Miwk [Mohawk] Fable'\n\n98-105 'The New Cupid. From the German of Goethe'\n\n106-111 'August Moon'\n\n112-115 'My Goddess. From the German of Goethe'\n\n116-119 'The Old Year-1883. Affectionately dedicated to W.S.P. & W.A.P.'\n\n120 'Ariel and Euphorion' [clippings pasted into notebook, unknown journal]\n\n122 'Don Rafael' [clippings pasted into notebook, unknown journal]\n\n122 'Two Sonnets' [clippings pasted into notebook, unknown journal]: 'Sonnet I. Petrarch: To a Friend', 'Sonnet II. Art, the Redeemer'\n\n123 'The New Ezekiel' [clippings pasted into notebook, unknown journal]\n\n123 'The Choice' [clippings pasted into notebook, for The American Hebrew]\n\n123 'The Supreme Sacrifice' [clippings pasted into notebook, for The American Hebrew]\n\n123 'Zulieka. Translated from Goethe's 'West Gestliche Divan' [clippings pasted into notebook, unknown journal, most possibly in Jewish Messenger]\n\n124 'The World's Justice' [clippings pasted into notebook, unknown journal]\n\n124 'The Feast of Lights' [clippings pasted into notebook, for The American Hebrew]\n\n126-130 'Grotesque'\n\n131-136 'Translations from Copp�'\n\n137-149 ['By the Waters of Babylon'] 'Little Poems in Prose:\n\nPage 137 'I. The Exodus'\n\nPage 140 'II. Treasures'\n\nPage 141 'III. The Sower'\n\nPage 143 'IV. The Test'\n\nPage 144 'V. The Prophet'\n\nPage 146-147 Pages are blank in the original\n\nPage 148 'VI. Currents'\n\nPage 149 'VII. Chrysalis'\n\n150 'Gifts'\n\n152 'A Masque of Venice'\n\n156 'To Carmen Sylva'\n\n[Page 156 is followed by 159, with no gaps in poetry]\n\n161-163 'In a Gothic Church' (never completed).",
				"archive": "American Jewish Historical Society",
				"archiveLocation": "Box 1, folder 2",
				"libraryCatalog": "Jewish Life in America - Adam Matthew Digital",
				"numPages": 165,
				"url": "http://www.jewishlife.amdigital.co.uk/Contents/DocumentDetailsSearch.aspx?documentid=289906",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.jewishlife.amdigital.co.uk/Contents/DocumentDetails.aspx?documentid=288444&prevPos=288444&filter=0%7c1%7c2&vpath=contents&pi=1",
		"items": [
			{
				"itemType": "manuscript",
				"title": "Baron de Hirsch Fund colonies and schools",
				"creators": [],
				"abstractNote": "See also P19/OS1/2",
				"archiveLocation": "Box 3, folder 2",
				"libraryCatalog": "Jewish Life in America - Adam Matthew Digital",
				"numPages": 38,
				"url": "http://www.jewishlife.amdigital.co.uk/Contents/DocumentDetails.aspx?documentid=288444",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.jewishlife.amdigital.co.uk/Contents/Default.aspx?filter=1%7c0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.gender.amdigital.co.uk/Documents/Details/Etiquette%20for%20Ladies%20and%20Gentlemen%20London%201876?SessionExpired=True",
		"items": [
			{
				"itemType": "book",
				"title": "Etiquette for Ladies and Gentlemen",
				"creators": [],
				"date": "1876",
				"archive": "Bodleian Library, University of Oxford",
				"archiveLocation": "268 c.457",
				"libraryCatalog": "Defining Gender - Adam Matthew Digital",
				"numPages": 65,
				"publisher": "Frederick Warne and Co.",
				"url": "https://www.gender.amdigital.co.uk/Documents/Details/Etiquette%20for%20Ladies%20and%20Gentlemen%20London%201876",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.americanwest.amdigital.co.uk/Documents/Details/Graff_2445",
		"items": [
			{
				"itemType": "document",
				"title": "$150 reward. Whereas a robbery was committed in the vicinity of the town of Fort Madison, on the 22d Inst….",
				"creators": [
					{
						"firstName": "Jacob",
						"lastName": "Guy",
						"creatorType": "author"
					},
					{
						"firstName": "Jacob",
						"lastName": "Bowers",
						"creatorType": "author"
					},
					{
						"firstName": "W. Braxton",
						"lastName": "Gillock",
						"creatorType": "author"
					}
				],
				"date": "1840",
				"archive": "Everett D. Graff Collection of Western Americana",
				"archiveLocation": "Graff 2445",
				"libraryCatalog": "American West - Adam Matthew Digital",
				"url": "https://www.americanwest.amdigital.co.uk/Documents/Details/Graff_2445",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
