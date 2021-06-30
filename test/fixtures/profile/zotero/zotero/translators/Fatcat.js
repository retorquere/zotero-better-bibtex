{
	"translatorID": "afef9c9d-53a1-49da-9155-1fdf683798c3",
	"translatorType": 4,
	"label": "Fatcat",
	"creator": "Abe Jellinek",
	"target": "^https://fatcat\\.wiki/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-28 19:45:00"
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
	if (url.includes('/release/') && !url.includes('/search')) {
		return guessType(doc);
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function guessType(doc) {
	// Fatcat types are based on CSL types, with some extensions
	// https://guide.fatcat.wiki/entity_release.html#release_type-vocabulary
	
	let dcType = attr(doc, 'meta[name="DC.type"]', 'content');
	switch (dcType) {
		case 'article-magazine':
			return 'magazineArticle';
		case 'book':
			return 'book';
		case 'chapter':
			return 'bookSection';
		case 'entry':
			return 'webpage';
		case 'entry-encyclopedia':
			return 'encyclopediaArticle';
		case 'manuscript':
			return 'manuscript';
		case 'paper-conference':
			return 'conferencePaper';
		case 'patent':
			return 'patent';
		case 'report':
			return 'report';
		case 'dataset':
			return 'document';
		case 'letter':
			return 'letter';
		case 'post':
		case 'post-weblog':
			return 'blogPost';
		case 'software':
			return 'computerProgram';
		case 'speech':
			return 'presentation';
		case 'thesis':
			return 'thesis';
		default:
			return 'journalArticle';
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('h4 a[href*="/release/"], td > b > a[href*="/release/"]');
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

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');

	translator.setHandler('itemDone', function (obj, item) {
		item.itemType = guessType(doc); // needs to be told twice sometimes
		
		// attachment URLs go to the archive.org frame page, not directly to
		// the PDF
		for (let attachment of item.attachments) {
			if (attachment.url
				&& attachment.url.startsWith('https://web.archive.org/web/')) {
				// lots of specificity needed here because the original page URL
				// could be anything
				attachment.url = attachment.url
					.replace(/^(https:\/\/web\.archive\.org\/web\/\d+)/, '$1if_');
			}
		}
		
		item.url = attr(doc, 'a.huge.black.button', 'href');

		for (let field in item) {
			if (item.hasOwnProperty(field) && item[field] === 'None') {
				delete item[field];
			}
		}
		
		let id = text(doc, 'h1.header code');
		item.extra = (item.extra ? item.extra + '\n' : '') + 'Fatcat ID: ' + id + '\n';
		
		if (item.itemType == 'blogPost') {
			delete item.websiteType; // "post"
			item.blogTitle = item.publisher;
		}
		
		// we could handle special cases for every possible item type,
		// but in practice it's about 90% papers, 5% blog posts, 5% everything else
		
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = guessType(doc);
		trans.addCustomFields({
			'citation_journal_title': 'seriesTitle',
			'citation_first_page': 'pages',
			'citation_volume': 'reportNumber'
		});
		trans.doWeb(doc, url);
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://fatcat.wiki/release/ogpp3g4uvfhyvhatlefj5wn2ce",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Implementation of Interlisp on the VAX",
				"creators": [
					{
						"firstName": "Raymond L.",
						"lastName": "Bates",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Dyer",
						"creatorType": "author"
					},
					{
						"firstName": "Johannes A. G. M.",
						"lastName": "Koomen",
						"creatorType": "author"
					}
				],
				"date": "1982",
				"DOI": "10.1145/800068.802138",
				"extra": "Fatcat ID: release_ogpp3g4uvfhyvhatlefj5wn2ce",
				"language": "en",
				"libraryCatalog": "fatcat.wiki",
				"publisher": "ACM Press",
				"url": "https://web.archive.org/web/20170927043847/http://www.dtic.mil/get-tr-doc/pdf?AD=ADA141707",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "https://fatcat.wiki/release/dzi6bordrnafpnppds7lbv4po4",
		"items": [
			{
				"itemType": "report",
				"title": "Moving the Undeployed TCP Extensions RFC 1072, RFC 1106, RFC 1110, RFC 1145, RFC 1146, RFC 1379, RFC 1644, and RFC 1693 to Historic Status",
				"creators": [
					{
						"firstName": "L.",
						"lastName": "Eggert",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"extra": "Fatcat ID: release_dzi6bordrnafpnppds7lbv4po4",
				"language": "en",
				"libraryCatalog": "fatcat.wiki",
				"pages": "1-4",
				"reportNumber": "6247",
				"reportType": "report",
				"seriesTitle": "Request for Comments",
				"url": "https://web.archive.org/web/201807201018/https://www.rfc-editor.org/rfc/pdfrfc/rfc6247.txt.pdf",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "https://fatcat.wiki/release/3mssw2qnlnblbk7oqyv2dafgey",
		"items": [
			{
				"itemType": "document",
				"title": "Jakobshavn Glacier Bed Elevation",
				"creators": [
					{
						"firstName": "Lu",
						"lastName": "An",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"abstractNote": "<p>Jakobshavn Isbræ, West Greenland, which holds a 0.6-m sea level volume equivalent, has been speeding up and retreating since the late 1990s. Interpretation of its retreat has been hindered by difficulties in measuring its ice thickness with airborne radar depth sounders. Here, we employ high-resolution, helicopter-borne gravity data from 2012 to reconstruct its bed elevation within 50 km of the ocean margin using a three-dimensional inversion constrained by fjord bathymetry data offshore and a mass conservation algorithm inland. We find the glacier trough to be asymmetric and several 100 m deeper than estimated previously in the lower part. From 1996-2016, the grounding line migrated at 0.6 km/yr from 700 m to 1,100 m depth. Upstream, the bed drops to 1,600 m over 10 km then slowly climbs to 1,200 m depth in 40 km. Jakobshavn Isbræ will continue to retreat along a retrograde slope for decades to come.\n\nAn L., E. Rignot, S.H.P. Elieff, M. Morlighem, R. Millan, J. Mouginot, D.M. Holland, D. Holland, and J. Paden (2017), Bed elevation of Jakobshavn Isbræ, West Greenland, from high-resolution airborne gravity and other data, Geophys. Res. Lett., 44, doi:10.1002/2017GL073245.\n\n</p>",
				"extra": "Type: dataset\nDOI: 10.7280/d1j37z\nFatcat ID: release_3mssw2qnlnblbk7oqyv2dafgey",
				"language": "en",
				"libraryCatalog": "fatcat.wiki",
				"publisher": "UC Irvine",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "https://fatcat.wiki/release/227sccesr5g7vfhq6hebiquxii",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Of Roots and Scrolls",
				"creators": [
					{
						"firstName": "Clare",
						"lastName": "Griffin",
						"creatorType": "author"
					}
				],
				"date": "2017-12-11",
				"blogTitle": "Open Book Publishers",
				"extra": "DOI: 10.11647/obp.0173.0072\nFatcat ID: release_227sccesr5g7vfhq6hebiquxii",
				"language": "en",
				"url": "https://web.archive.org/web/20190822203945/http://blogs.openbookpublishers.com/of-roots-and-scrolls/",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "https://fatcat.wiki/creator/iimvc523xbhqlav6j3sbthuehu",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://fatcat.wiki/release/rtwpnokyrnc25gvs3rfjc4s2ua",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Operational Characterisation of Neighbourhood Heat Energy After Large-Scale Building Retrofit",
				"creators": [
					{
						"firstName": "Paul",
						"lastName": "Beagon",
						"creatorType": "author"
					},
					{
						"firstName": "Fiona",
						"lastName": "Boland",
						"creatorType": "author"
					},
					{
						"firstName": "James",
						"lastName": "O'Donnell",
						"creatorType": "author"
					}
				],
				"date": "2018-12-12",
				"bookTitle": "Springer Proceedings in Energy",
				"extra": "Fatcat ID: release_rtwpnokyrnc25gvs3rfjc4s2ua",
				"language": "en",
				"libraryCatalog": "fatcat.wiki",
				"pages": "217-229",
				"url": "https://web.archive.org/web/20190427203216/https://researchrepository.ucd.ie/bitstream/10197/9300/1/Cold_Climate_HVAC_2018_087_final_v13.pdf",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "https://fatcat.wiki/release/search?q=Zotero&generic=1",
		"items": "multiple"
	}
]
/** END TEST CASES **/
