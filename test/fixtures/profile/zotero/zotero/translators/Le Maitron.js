{
	"translatorID": "ee016722-5f02-4362-8ffe-c96e06872b3e",
	"translatorType": 4,
	"label": "Le Maitron",
	"creator": "czar",
	"target": "^https?://maitron\\.fr/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-14 19:55:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 czar
	http://en.wikipedia.org/wiki/User_talk:Czar
	
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
	if (url.includes('/spip.php?article')) {
		return "encyclopediaArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}


function scrape(doc, _url) {
	var newItem = new Zotero.Item("encyclopediaArticle");
	newItem.encyclopediaTitle = "Le Maitron";
	newItem.language = "fr";
	
	newItem.url = attr(doc, 'link[rel=canonical]', 'href'); // url.replace(/#$/,'');
	newItem.title = text(doc, '.notice-titre');
	
	// if title contains square brackets, take its contents and use as encyclopedia name
	var subEncyc = newItem.title.match(/\[[^\]]+\]/g);
	if (subEncyc) {
		newItem.encyclopediaTitle = subEncyc[subEncyc.length - 1].slice(1, -1);
		newItem.title = newItem.title.slice(0, -1 * (newItem.encyclopediaTitle.length + 3));
	}
	newItem.publisher = "Maitron/Editions de l'Atelier";
	newItem.place = "Paris";
	
	// ZU.strToISO chokes on diacritics
	var prepdate = text(doc, '#copy-text').match(/\d{1,2}\s[^\s]+\s\d{4}/g);
	prepdate = prepdate[prepdate.length - 1].normalize('NFD').replace(/[\u0300-\u036f]/g, "");
	prepdate = prepdate
		.replace('fev', 'feb')
		.replace('avr', 'apr')
		.replace('mai', 'may')
		.replace('juin', 'jun')
		.replace('juil', 'jul')
		.replace('aout', 'aug');
	newItem.date = ZU.strToISO(prepdate);
	newItem.abstractNote = text(doc, '.intro');
	// var articleID = newItem.url.match(/\d{2,}/);
	newItem.attachments.push({
		document: doc,
		// this is the archive url, which is nice, but it triggers the print dialog popup whenever it saves
		// url: "/spip.php?page=imprimir_articulo&id_article="+articleID,
		title: "Le Maitron snapshot",
		mimeType: "text/html"
	});
	if (newItem.title.split('.').length > 1) {
		newItem.shortTitle = newItem.title.split('.')[0];
	}
	
	// Authors – haven't seen more than one attributed at once
	var authorMetadata = text(doc, '.notice-auteur').match(/\s*Par\s+(.*)/);
	if (authorMetadata) {
		newItem.creators.push(ZU.cleanAuthor(authorMetadata[1], "author"));
	}

	newItem.complete();
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.resultats-liste a, .liste-notices li a');
	var titles = doc.querySelectorAll('.resultats-liste strong, .liste-notices li a');
	for (let i = 0; i < rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(titles[i].textContent);
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

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://maitron.fr/spip.php?article155263",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "CREAGH Ronald, Roberts",
				"creators": [
					{
						"firstName": "Hugues",
						"lastName": "Lenoir",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"abstractNote": "Né le 16 juin 1929 à Alexandrie (Égypte). Sociologue, professeur de civilisation américaine à Montpellier. Anarchiste.",
				"encyclopediaTitle": "Dictionnaire des anarchistes",
				"language": "fr",
				"libraryCatalog": "Le Maitron",
				"place": "Paris",
				"publisher": "Maitron/Editions de l'Atelier",
				"url": "https://maitron.fr/spip.php?article155263",
				"attachments": [
					{
						"title": "Le Maitron snapshot",
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
		"url": "http://maitron.fr/spip.php?page=recherche_avanc&typerech=simple&lang=fr&swishe_exp=voline&OK=OK&swishe_type=and&swishe_from%5B%5D=full",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://maitron.fr/spip.php?article154716",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "VOLINE [Vsévolod Mikhaïlovitch Eichenbaum, dit]",
				"creators": [
					{
						"firstName": "Sylvain",
						"lastName": "Boulouque",
						"creatorType": "author"
					}
				],
				"date": "2019-01-26",
				"abstractNote": "Né le 11 août 1882 à Tikhvine (Russie), mort le 18 septembre 1945 à Paris ; militant et théoricien du mouvement anarchiste ; historien du mouvement makhnoviste.",
				"encyclopediaTitle": "Dictionnaire des anarchistes",
				"language": "fr",
				"libraryCatalog": "Le Maitron",
				"place": "Paris",
				"publisher": "Maitron/Editions de l'Atelier",
				"url": "https://maitron.fr/spip.php?article154716",
				"attachments": [
					{
						"title": "Le Maitron snapshot",
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
		"url": "http://maitron.fr/spip.php?mot9745&lettre=^(r|R)",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://maitron.fr/spip.php?article149723&id_mot=216",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "ABDALLAH (écrit aussi MHAMED Abdallah)",
				"creators": [
					{
						"firstName": "Amar Benamrouche, Louis-Pierre",
						"lastName": "Montoy",
						"creatorType": "author"
					}
				],
				"date": "2014-01-09",
				"abstractNote": "Syndicaliste CGTU puis CGT du port de Bône [Annaba] (Algérie) ; communiste puis candidat indépendant aux élections locales.",
				"encyclopediaTitle": "Dictionnaire Algérie",
				"language": "fr",
				"libraryCatalog": "Le Maitron",
				"place": "Paris",
				"publisher": "Maitron/Editions de l'Atelier",
				"url": "https://maitron.fr/spip.php?article149723",
				"attachments": [
					{
						"title": "Le Maitron snapshot",
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
		"url": "https://maitron.fr/spip.php?article174841",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "SALANNE René, Jean",
				"creators": [
					{
						"firstName": "Claude",
						"lastName": "Roccati",
						"creatorType": "author"
					}
				],
				"date": "2021-04-26",
				"abstractNote": "Né le 31 janvier 1927 à Bayonne (Pyrénées-Atlantiques), mort le 16 avril 2021 à Paris ; modeleur sur bois ; permanent JOC pour la région Sud-Ouest, secrétaire général adjoint (1951-1953) puis vice-président (1953-1955) et enfin président de la JOC (1955-1956), secrétaire général de la JOC internationale (1956-1961) ; secrétaire confédéral CFTC-CFDT (1962-1970), membre de la commission exécutive de la CFDT en charge du secteur international (1970-1979).",
				"encyclopediaTitle": "Le Maitron",
				"language": "fr",
				"libraryCatalog": "Le Maitron",
				"place": "Paris",
				"publisher": "Maitron/Editions de l'Atelier",
				"url": "https://maitron.fr/spip.php?article174841",
				"attachments": [
					{
						"title": "Le Maitron snapshot",
						"mimeType": "text/html"
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
