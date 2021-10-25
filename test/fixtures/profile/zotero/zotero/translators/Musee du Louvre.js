{
	"translatorID": "22d17fb9-ae32-412e-bcc4-7650ed3359bc",
	"translatorType": 4,
	"label": "Musée du Louvre",
	"creator": "Philipp Zumstein and Abe Jellinek",
	"target": "^https?://collections\\.louvre\\.fr/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-17 15:25:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Philipp Zumstein and Abe Jellinek
	
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
	if (url.includes('/ark:/')) {
		return "artwork";
	}
	else if (url.includes('/recherche') && getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a[href*="/ark:/"]');
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
			if (!items) {
				return;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}


function scrape(doc, _url) {
	let item = new Zotero.Item('artwork');
	let json = JSON.parse(text(doc, 'script[type="application/ld+json"]'));
	
	item.title = json.name || 'Untitled';
	item.artworkMedium = json.material;
	item.callNumber = json.identifier;
	item.archive = "Louvre";
	item.abstractNote = json.description;
	item.url = json.url;
	
	if (json.creator) {
		for (let artist of json.creator) {
			// sometimes these aren't really artists ("School / Artistic centre"),
			// but it's a royal pain to strip those out and there's nothing to
			// clearly identify them
			
			let surnameMatch = artist.name.match(/^([^a-z\s.]{2,})\s*(.*)/);
			if (surnameMatch) {
				// if the artist's name starts with an uppercase surname
				// (like "GOGH Vincent van") then pull that out.
				
				item.creators.push({
					lastName: ZU.capitalizeTitle(surnameMatch[1], true),
					firstName: surnameMatch[2],
					creatorType: 'artist'
				});
			}
			else {
				item.creators.push(ZU.cleanAuthor(
					artist.name,
					'artist',
					artist.name.includes(', ')
				));
			}
		}
	}
	
	if (json.dateCreated) {
		let bceDateMatch = json.dateCreated.match(/([0-9]+) av\./);
		if (bceDateMatch) {
			// this generates a date in EDTF format, which works like ISO 8601:
			// https://en.wikipedia.org/wiki/ISO_8601#Years
			// so we need to add one; 200 BCE is represented as -0199
			let year = parseInt(bceDateMatch[1]);
			if (!isNaN(year)) {
				item.date = '-' + (year - 1).toString().padStart(4, '0');
			}
		}
		else {
			item.date = ZU.strToISO(json.dateCreated);
		}
	}
	
	if (json.width && json.height && json.width.length && json.height.length) {
		item.artworkSize = `${json.width[0].name} x ${json.height[0].name}`;
	}
	
	if (json.image) {
		item.attachments.push({
			title: 'Image',
			url: json.image,
			mimeType: 'image/jpeg'
		});
	}
	
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://collections.louvre.fr/en/ark:/53355/cl010208581",
		"items": [
			{
				"itemType": "artwork",
				"title": "Hyacinthe Collin de Vermont (1693-1761), peintre",
				"creators": [
					{
						"firstName": "Alexandre",
						"lastName": "Roslin",
						"creatorType": "artist"
					},
					{
						"firstName": "",
						"lastName": "Suède",
						"creatorType": "artist"
					}
				],
				"date": "1753",
				"archive": "Louvre",
				"artworkMedium": "huile sur toile",
				"artworkSize": "0,98 m x 1,28 m",
				"callNumber": "/ark:/53355/cl010208581",
				"libraryCatalog": "Musée du Louvre",
				"url": "https://collections.louvre.fr/ark:/53355/cl010208581",
				"attachments": [
					{
						"title": "Image",
						"mimeType": "image/jpeg"
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
		"url": "https://collections.louvre.fr/ark:/53355/cl020032677",
		"items": [
			{
				"itemType": "artwork",
				"title": "Tête de jeune homme coiffé d'un grand chapeau",
				"creators": [
					{
						"lastName": "Gogh",
						"firstName": "Vincent van",
						"creatorType": "artist"
					}
				],
				"archive": "Louvre",
				"artworkMedium": "Fusain sur feuillet de carnet initialement quadrillé très jauni à tranche rouge et coins arrondis",
				"artworkSize": "0.087 m x 0.132 m",
				"callNumber": "/ark:/53355/cl020032677",
				"libraryCatalog": "Musée du Louvre",
				"url": "https://collections.louvre.fr/ark:/53355/cl020032677",
				"attachments": [
					{
						"title": "Image",
						"mimeType": "image/jpeg"
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
		"url": "https://collections.louvre.fr/ark:/53355/cl010123452",
		"items": [
			{
				"itemType": "artwork",
				"title": "stèle",
				"creators": [],
				"date": "-2299",
				"abstractNote": "stèle ;  ; Décor : scène de victoire ; Sargon d'Akkad (?, kaunakès, masse d'armes, capturant, ennemi : plusieurs, filet) ; Ishtar (?) ; inscription ;  ; Etat de l'oeuvre : incomplet ; Précisions de l'objet : Sommet d'une scène de victoire. Le roi, peut-être Sargon d'Akkad, capture dans un filet des ennemis et assomme le roi vaincu avec sa masse d'armes. La scène se passe devant une divinité, peut-être la déesse Ishtar",
				"archive": "Louvre",
				"artworkMedium": "Matériau : diorite ; Technique : bas-relief",
				"artworkSize": "0,26 cm x 0,54 cm",
				"callNumber": "/ark:/53355/cl010123452",
				"libraryCatalog": "Musée du Louvre",
				"url": "https://collections.louvre.fr/ark:/53355/cl010123452",
				"attachments": [
					{
						"title": "Image",
						"mimeType": "image/jpeg"
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
		"url": "https://collections.louvre.fr/en/recherche?q=marseille",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://collections.louvre.fr/recherche?collection%5B0%5D=3",
		"items": "multiple"
	}
]
/** END TEST CASES **/
