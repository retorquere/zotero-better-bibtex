{
	"translatorID": "16199bf0-a365-4aad-baeb-225019ae32dc",
	"label": "DAI-Zenon",
	"creator": "Philipp Zumstein",
	"target": "^https?://zenon\\.dainst\\.org/(Record/|Search/)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-02 16:57:10"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2014 Philipp Zumstein

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
	//return "bookSection"; // activate for testing
	//return "journalArticle"; // activate for testing
	if (url.indexOf("/Record") != -1 ) {//book, journalArticle or bookSection --> will be improved during scraping
		return "book";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "row")]//a[contains(@class, "title")]');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
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
	
	//e.g. url = "http://zenon.dainst.org/Record/000300287"
	var urlParts = url.split("/");
	var id = urlParts[urlParts.length-1];
	
	//call MARC translator
	ZU.doGet('/Record/' + id + '/Details', function(text) {
		var parser = new DOMParser();
		var xml = parser.parseFromString(text, "text/html");
		
		var translator = Zotero.loadTranslator("import");
		
		translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
		translator.getTranslatorObject(function (marc) {
			var details = ZU.xpath(xml, '//tr');
			var record = new marc.record();
			var newItem = new Zotero.Item();
			
			for (var i=0; i<details.length; i++) {
				var fieldTag = ZU.xpathText(details[i], './th');
				//skip empty lines
				if (!fieldTag) continue;
	
				var values = ZU.xpath(details[i], './td');
				if (values.length == 1) {
					if (fieldTag == "LEADER") {
						record.leader = ZU.xpathText(details[i], './td');
					}
					//the control fields are not anyhow used in MARC translator, thus we do not import them
				}
				if (values.length == 3) {
					var ind1 = ZU.xpathText(details[i], './td[1]');
					var ind2 = ZU.xpathText(details[i], './td[2]');
					var fieldContent = ZU.xpathText(details[i], './td[3]', null, '').replace(/[\r\n\s]*\|/g, marc.subfieldDelimiter);
					record.addField( fieldTag, ind1 + ind2, fieldContent);
				}
				
			}
			
			record.translate(newItem);
			
			//import tags from the 999 fields and filter out dublicate tags
			record._associateTags(newItem, 999, "a");
			newItem.tags = newItem.tags.filter( function( item, index, inputArray ) {
				return inputArray.indexOf(item) == index;
			});
			
			//there is a special field 995 if the entry is a bookSection or journalArticle
			record._associateDBField(newItem, 995, "n", "bookTitle");
			if (newItem.bookTitle) {
				//Z.debug(newItem.bookTitle);
				if ( record.leader.substr(6,2) == "as") {//This seems to work good, but I don't know if is always working.
					newItem.itemType = "journalArticle";
					var regularExpression1 = /^(.*),\s?(\d+),\s?(\d+)\s?\(\d\d\d\d\)/; // e.g. Bulletin du Cercle d'Études Numismatiques, 44,2 (2007)
					var regularExpression2 = /^(.*),\s?(\d+)\s?\(\d\d\d\d\)/; // e.g Mannheimer Geschichtsblätter, Neue Folge, 16 (2008)
					var m;
					if (m = newItem.bookTitle.match(regularExpression1)) {
						newItem.publicationTitle = m[1];
						newItem.volume = m[2];
						newItem.issue = m[3];
					} else if (m = newItem.bookTitle.match(regularExpression2)) {
						newItem.publicationTitle = m[1];
						newItem.volume = m[2];
					}
				} else {
					newItem.itemType = "bookSection";
				}
				record._associateDBField(newItem, 300, "a", "pages");
				delete newItem.numPages;
			}
	
			newItem.attachments.push({
				url: url,
				title: "DAI Zenon Entry",
				mimeType: 'text/html',
				snapshot: false
			});
			
			newItem.complete();
			
		});
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://zenon.dainst.org/Record/000269027",
		"items": [
			{
				"itemType": "book",
				"title": "Die Aufnahme fremder Kultureinflüsse in Etrurien und das Problem des Retardierens in der etruskischen Kunst: Referate vom Symposion des Deutschen Archäologen-Verbandes: Mannheim 8.-10.2. 1980",
				"creators": [
					{
						"lastName": "Deutscher Archäologen-Verband",
						"creatorType": "editor",
						"fieldMode": true
					},
					{
						"lastName": "Universität Mannheim",
						"creatorType": "editor",
						"fieldMode": true
					}
				],
				"date": "1981",
				"callNumber": "DG223  .A8 1981",
				"libraryCatalog": "DAI-Zenon",
				"numPages": "197",
				"place": "Mannheim",
				"publisher": "Deutscher Archäologen-Verband",
				"series": "Schriften des Deutschen Archäologen-Verbandes",
				"seriesNumber": "5",
				"shortTitle": "Die Aufnahme fremder Kultureinflüsse in Etrurien und das Problem des Retardierens in der etruskischen Kunst",
				"attachments": [
					{
						"title": "DAI Zenon Entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"Etrusker",
					"Kongresse und Tagungen M",
					"Kongreßschrift",
					"Mannheim 1980"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://zenon.dainst.org/Record/000300287",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Kulturbeziehungen zwischen dem eisenzeitlichen Etrurien und dem Ostalpenraum",
				"creators": [
					{
						"firstName": "Luciana",
						"lastName": "Aigner-Foresti",
						"creatorType": "author"
					}
				],
				"bookTitle": "Die Aufnahme fremder Kultureinflüsse in Etrurien und das Problem des Retardierens in der etruskischen Kunst, Mannheim 8.-10.2.1980",
				"libraryCatalog": "DAI-Zenon",
				"pages": "46-52, Abb",
				"attachments": [
					{
						"title": "DAI Zenon Entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"Alpenländer (bis 1997)",
					"Beziehungen",
					"Culture in contatto. Etruschi, liguri, romani nella Valle del Serchio fra IV e II secolo a.C"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://zenon.dainst.org/Record/001286369",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Zwischen Diesseits und Jenseits, fünf etruskische Urnen aus den Sammlungen der rem als Zeugen einer untergeganenen Kultur",
				"creators": [
					{
						"firstName": "Alexandra",
						"lastName": "Berend",
						"creatorType": "author"
					}
				],
				"date": "2008",
				"libraryCatalog": "DAI-Zenon",
				"pages": "100-107",
				"publicationTitle": "Mannheimer Geschichtsblätter, Neue Folge",
				"volume": "16",
				"attachments": [
					{
						"title": "DAI Zenon Entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"Etrusker",
					"Ikonographie",
					"Impasto-Keramik",
					"Mannheim, Reiss-Engelhorn-Museum",
					"Urnenbestattungen",
					"Villanova"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://zenon.dainst.org/Record/001279328",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Un bronze d'Elaia (Eolide) aux noms de Caius et Lucius César",
				"creators": [
					{
						"firstName": "Jean-Marc",
						"lastName": "Doyen",
						"creatorType": "author"
					}
				],
				"date": "2007",
				"issue": "2",
				"libraryCatalog": "DAI-Zenon",
				"pages": "329-330",
				"publicationTitle": "Bulletin du Cercle d'Études Numismatiques",
				"volume": "44",
				"attachments": [
					{
						"title": "DAI Zenon Entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"Caesar, Gaius Iulius <20 v. Chr.-4>",
					"Caesar, Lucius Iulius",
					"Elaia",
					"Römische Münzen"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://zenon.dainst.org/Record/000251127",
		"items": [
			{
				"itemType": "book",
				"title": "Das Bild des Augustus auf den frühen Reichsprägungen: Studien zur Vergöttlichung des ersten Prinzeps",
				"creators": [
					{
						"firstName": "Rainer",
						"lastName": "Albert",
						"creatorType": "author"
					}
				],
				"date": "1981",
				"language": "ger",
				"libraryCatalog": "DAI-Zenon",
				"numPages": "248",
				"place": "Speyer",
				"publisher": "Numismatische Gesellschaft",
				"series": "Schriftenreihe der Numismatischen Gesellschaft Speyer",
				"seriesNumber": "21",
				"shortTitle": "Das Bild des Augustus auf den frühen Reichsprägungen",
				"attachments": [
					{
						"title": "DAI Zenon Entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"Die kultische Verehrung des römischen Herrschers",
					"Diva Faustina : coinage and cult in Rome and the provinces",
					"Divine kings and sacred spaces : power and religion in Hellenistic Syria (301-64 BC)",
					"Du prêtre du roi au prêtre de Rome et au grand prêtre d’Auguste : lamise en place du culte impérial civique",
					"Ein Miniaturaltar der Arsinoë II",
					"Emperor Worship",
					"Herrscher",
					"Herrscher- und Dynastiekulte im Ptolemäerreich",
					"Herrscherkult",
					"Imperial Cult",
					"Imperial cult and imperial representation in Roman Cyprus",
					"Kaiserverehrung und Kaiserkult in Alexandria und Ägypten von Augustus bis Caracalla",
					"Les cultes des souverains hellénistiques",
					"Les cultes des souverains hellénistiques après la disparition des dynasties : formes de survie et d’extinction d’une institution dans un contexte civique",
					"Münzen als Zeugnis",
					"Prêtres des empereurs",
					"The Emperor Cult",
					"The Near Eastern origins of Hellenistic ruler cult",
					"The imperial Cult",
					"Theoi sebastoi",
					"Un culto imperiale \"provinciale\" in Achaia",
					"benannte Porträts",
					"culte impérial civique",
					"domus divina",
					"il culto degli imperatori romani",
					"il culto degli imperatori romani in Grecia (Provincia Achaia) nel secondo secolo D.C",
					"sul culto imperiale",
					"the Cult of Ptolemaic Queens",
					"the Roman imperial cult"
				],
				"notes": [
					{
						"note": "Thesis (doctoral)--Universität Mannheim, 1980"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/