{
	"translatorID": "22d17fb9-ae32-412e-bcc4-7650ed3359bc",
	"label": "Musee du Louvre",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.louvre\\.fr/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-03-05 07:35:01"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Philipp Zumstein
	
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.includes('/oeuvre')) {
		return "artwork";
	} else if (url.includes('recherche') && getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a[href*="/oeuvre"]');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
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
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var item = new Zotero.Item("artwork");
	
	var box = doc.querySelector('.box-cartel ul');
	var artist = text(box, 'li p', 0);
	if (artist) {
		artist = artist.replace(/\(.*\)/, '');
		item.creators.push({
			lastName: ZU.trimInternal(artist),
			creatorType: "artist"
		});
	}
	item.title = text(doc, 'h1>span');
	if (!item.title) {
		item.title = text(box, 'li p', 1);
	}
	item.date = text(box, 'li p', 2);
	item.artworkMedium = text(box, 'li:nth-child(2) p', 0);
	item.artworkSize = text(box, 'li:nth-child(2) p', 1);
	item.callNumber = text(box, 'li:nth-child(3) p', 2);
	
	item.archive = "Louvre";
	
	item.abstractNote = text(doc, '.col-desc strong');
	item.url = url;
	
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.louvre.fr/oeuvre-notices/stele-figurant-la-deesse-ishtar",
		"items": [
			{
				"itemType": "artwork",
				"title": "Stèle figurant la déesse Ishtar",
				"creators": [],
				"date": "VIIIe siècle avant J.-C.",
				"abstractNote": "Cette stèle figurant la déesse Ishtar témoigne de l'art provincial de l'empire assyrien au sommet de sa puissance et de son expansion. Souvent représentée dans l'art du Proche-Orient, la déesse revêt ici un caractère guerrier, peu attesté sur des oeuvres monumentales telles que celle-ci.",
				"archive": "Louvre",
				"artworkMedium": "Brèche",
				"callNumber": "AO 11503",
				"libraryCatalog": "Musee du Louvre",
				"url": "https://www.louvre.fr/oeuvre-notices/stele-figurant-la-deesse-ishtar",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.louvre.fr/en/oeuvre-notices/stele-warrior-god",
		"items": [
			{
				"itemType": "artwork",
				"title": "Stele with warrior god",
				"creators": [],
				"date": "Late Bronze Age or Iron Age? (c. 1200 or 800 BC)",
				"abstractNote": "This basalt stele, sometimes called the Shihan stele, was the oldest monument from the Holy Land to be found in the Louvre's collection until the inter-war excavations bore their fruit. The figure represented on the stele, for a long time identified as a king or prince, might also be a warrior god. The dating of the work, however, still poses many questions, with the current estimate ranging from the Late Bronze (c. 1200 BC), to the Iron Age (c. 800 BC).",
				"archive": "Louvre",
				"artworkMedium": "Stone",
				"artworkSize": "H. 13 cm; W. 58 cm",
				"callNumber": "AO 5055",
				"libraryCatalog": "Musee du Louvre",
				"url": "https://www.louvre.fr/en/oeuvre-notices/stele-warrior-god",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.louvre.fr/en/oeuvre-notices/mona-lisa-portrait-lisa-gherardini-wife-francesco-del-giocondo?sous_dept=1",
		"items": [
			{
				"itemType": "artwork",
				"title": "Mona Lisa – Portrait of Lisa Gherardini, wife of Francesco del Giocondo",
				"creators": [
					{
						"lastName": "Leonardo di ser Piero da Vinci, known as LEONARDO DA VINCI",
						"creatorType": "artist"
					}
				],
				"date": "c. 1503–19",
				"abstractNote": "This portrait was doubtless started in Florence around 1503. It is thought to be of Lisa Gherardini, wife of a Florentine cloth merchant named Francesco del Giocondo - hence the alternative title, La Gioconda. However, Leonardo seems to have taken the completed portrait to France rather than giving it to the person who commissioned it. After his death, the painting entered François I's collection.",
				"archive": "Louvre",
				"artworkMedium": "Wood (poplar)",
				"artworkSize": "H. 0.77 m; W. 0.53 m",
				"callNumber": "INV. 779",
				"libraryCatalog": "Musee du Louvre",
				"url": "https://www.louvre.fr/en/oeuvre-notices/mona-lisa-portrait-lisa-gherardini-wife-francesco-del-giocondo?sous_dept=1",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.louvre.fr/en/recherche-globale?f_search_cles=lisa&f_search_univers=",
		"items": "multiple"
	}
]
/** END TEST CASES **/
