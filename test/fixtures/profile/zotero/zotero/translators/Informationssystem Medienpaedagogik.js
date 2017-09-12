{
	"translatorID": "f4469574-1d96-4a4a-a0ac-1b9f7c49654b",
	"label": "Informationssystem Medienpaedagogik",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.ism-info\\.de/ism-info\\.html\\?",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-01 16:54:04"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2012 Sebastian Karcher 
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/
function detectWeb(doc, url) {
	if (url.indexOf("?feldname") != -1) return "multiple";
	else return itemType(doc);
}

function associateData(newItem, dataTags, field, zoteroField) {
	if (dataTags[field]) {
		newItem[zoteroField] = dataTags[field];
	}
}

function itemType(doc) {
	var type;
	if (type = ZU.xpathText(doc, '//form/dl/dt[contains(text(), "Dokumenttyp:")]/following-sibling::dd[1]')) {
		type = type.replace(/[;,].+/, "").trim();
	}
	if (typeMap[type]) return typeMap[type];
	else return "book";
}

var typeMap = {
	"Bücher": "book",
	"Zeitschriftenaufsatz": "journalArticle",
	"Sammelwerksbeitrag": "bookSection",
	"Filme": "film",
	"andere": "report"
}

function scrape(doc, url) {
		var dataTags = new Object();
		var newItem = new Zotero.Item(itemType(doc));
		var datalabel = ZU.xpath(doc, '//form/dl/dt');
		var data = ZU.xpath(doc, '//form/dl/dd');
		for (var i in datalabel) {
			var fieldTitle = datalabel[i].textContent.trim();
			var fieldContent = data[i].textContent;
			//Z.debug(fieldTitle + " " + fieldContent)
			if (fieldTitle.indexOf("Quelle") != -1) {
				var date = fieldContent.match(/\((\d{4})\)/);
				if (date) newItem.date = date[1];
				if (newItem.itemType === "journalArticle") {
					var publication = fieldContent.match(/^(.+?),/);
					if (publication) newItem.publicationTitle = publication[1];
					var pages = fieldContent.match(/S\.\s*([\d-]+)/);
					if (pages) newItem.pages = pages[1];
					var volume = fieldContent.match(/,\s*(\d+)/);
					if (volume) newItem.volume = volume[1];
					//the issue is sometimes before, sometimes after the year
					var issue = fieldContent.match(/\)\s*(\d+)\s*,|,[\d\s]*,\s*(\d+)/);
					if (issue) {
						if (issue[1]) newItem.issue = issue[1];
						else newItem.issue = issue[2];
					}
				}
				if (newItem.itemType === "book") {
					var publisher = fieldContent.match(/^.+?:\s*(\w+)/);
					if (publisher) newItem.publisher = publisher[1];
					var place = fieldContent.match(/^\s*(.+?):/);
					if (place) newItem.place = place[1];
					var numpages = fieldContent.match(/(\d+)\s*S/);
					if (numpages) newItem.numPages = numpages[1];

				}
				if (newItem.itemType === "bookSection") {
					var pages = fieldContent.match(/S\.\s*([\d-]+)/);
					if (pages) newItem.pages = pages[1];
				}
			}
			if (fieldTitle.indexOf("Autoren") != -1) {
				var authors = fieldContent.split(/\s*;\s*/);
				for (var i in authors) {
					//get editors
					var authortype = "author";
					if (authors[i].match(/Hrsg/)) {
						authortype = "editor";
						authors[i] = authors[i].replace(/[\(\[]Hrsg\.[\)\]]/, "").trim();
					}
					newItem.creators.push(ZU.cleanAuthor(authors[i], authortype, true));

				}
			}
			if (fieldTitle.indexOf("ISBN:")!=-1){
				newItem.ISBN = fieldContent.match(/[\d\-]+/)[0];
			}
			if (fieldTitle.indexOf("Schlagworte") != -1) {
				var tags = fieldContent.split(/\s*;\s*/);
				for (var i in tags) {
					newItem.tags.push(tags[i].trim())
				}
			} else {
				dataTags[fieldTitle] = fieldContent;
			}

		}
		associateData(newItem, dataTags, "Titel:", "title");
		associateData(newItem, dataTags, "Abstract:", "abstractNote");
		associateData(newItem, dataTags, "Sprache:", "language");
		associateData(newItem, dataTags, "Link zum Volltext:", "url");
		associateData(newItem, dataTags, "Reihe:", "series");
		newItem.complete();
	}

	function doWeb(doc, url) {
		var articles = new Array();

		if (detectWeb(doc, url) == "multiple") {
			var items = new Object();

			var titles = doc.evaluate('//form/dl[contains(@class, "trefferliste")]/dd/a', doc, null, XPathResult.ANY_TYPE, null);

			var next_title;
			while (next_title = titles.iterateNext()) {
				items[next_title.href] = next_title.textContent;
			}
			Zotero.selectItems(items, function (items) {
				if (!items) {
					return true;
				}
				for (var i in items) {
					articles.push(i);
				}
				Zotero.Utilities.processDocuments(articles, scrape, function () {});
			});
		} else {
			scrape(doc, url);
		}
	} /** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.ism-info.de/ism-info.html?qdb=ism&a=eb2799e28b9ab145",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Publizistische Chancengleichheit in der Wahlkampfberichterstattung?: eine Untersuchung zur medialen Repräsentation der im Bundestag vertretenen Parteien",
				"creators": [
					{
						"firstName": "Olaf",
						"lastName": "Jandura",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"abstractNote": "Demokratie basiert auf politischem Wettbewerb. Parteien entwickeln Programme und Lösungsvorschläge für drängende Probleme und stellen diese dann zur Wahl. Ein fairer Wettbewerb um die Herrschaftspositionen von morgen setzt dabei die Chancengleichheit der Parteien heute voraus. Der Gesetzgeber hat eine Reihe von Regelungen erlassen, die die Chancengleichheit der Parteien in diesem Wettbewerb gewährleisten sollen. Da Medienberichterstattung für die politische Kommunikation immer bedeutender wird, geht dieser Beitrag der Frage nach, ob es neben der politischen auch eine publizistische Chancengleichheit gibt und an welchen Indikatoren diese festgemacht werden kann. Nach einer umfassenden theoretischen Auseinandersetzung wird diese Frage empirisch anhand der Analyse der Berichterstattung in der heißen Wahlkampfphase dreier Bundestagswahlkämpfe (1998, 2002, 2009) untersucht. Dabei zeigt sich, dass eine publizistische Chancengleichheit für die im Bundestag vertretenen Parteien quantitativ durchaus gegeben ist. Die Zugangschancen zu den Medien sind gerade für die kleinen Parteien besser als die Abstufung der Chancengleichheit bei der staatlichen Leistungsgewährung. (DIPF/Orig.)",
				"issue": "2",
				"language": "Deutsch",
				"libraryCatalog": "Informationssystem Medienpaedagogik",
				"pages": "181-197",
				"publicationTitle": "Publizistik",
				"shortTitle": "Publizistische Chancengleichheit in der Wahlkampfberichterstattung?",
				"volume": "56",
				"attachments": [],
				"tags": [
					"Analyse",
					"Berichterstattung",
					"Bundestag",
					"Chancengleichheit",
					"Empirische Untersuchung",
					"Medien",
					"Partei",
					"Politik",
					"Publizistik",
					"Vergleich",
					"Wahl"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ism-info.de/ism-info.html?qdb=ism&a=0f97836d7dbbb1fb",
		"items": [
			{
				"itemType": "book",
				"title": "Die Bedeutung der Unterhaltungsmedien für die Konstruktion des Politikbildes: erweiterte Dokumentation zu den 13. Buckower Mediengesprächen 2009",
				"creators": [
					{
						"firstName": "Klaus-Dieter",
						"lastName": "Felsmann",
						"creatorType": "editor"
					}
				],
				"date": "2010",
				"ISBN": "9783867360135",
				"abstractNote": "Gemeinhin trennen wir bei der Frage, wodurch Menschen ihre politische Meinung herausbilden, zwischen dem Informationsangebot der Medien, das wir hier für relevant halten, auf der einen und dem Unterhaltungsangebot, dem wir keine Bedeutung für das Politikverständnis unterstellen, auf der anderen Seite. Eine solche strikte Trennung erscheint angesichts der weitgehenden Medialisierung unseres Alltags für ein konstruktives Handeln inzwischen nicht mehr ausreichend bzw. angemessen. Der vorliegende Band stellt zunächst die Frage nach Politikbildern, die sich aus Unterhaltungsmedien ableiten lassen, und stellt diese in einen komplexen historischen, philosophischen sowie wirkungsrelevanten Zusammenhang. Einzelne genrespezifische Fallstudien belegen darüber hinaus sehr anschaulich die These, dass Unterhaltungsmedien zunehmend eine bestimmende Bedeutung bei der Konstruktion von Politikbildern zukommt. Für den Bildungsprozess stellen diese Angebote einen reichhaltigen informell erworbenen Wissens- und Kompetenzfundus dar, den es zu nutzen gilt. (DIPF/Orig.)",
				"language": "Deutsch",
				"libraryCatalog": "Informationssystem Medienpaedagogik",
				"numPages": "208",
				"place": "München",
				"publisher": "kopaed",
				"series": "Buckower Mediengespräche; 13",
				"shortTitle": "Die Bedeutung der Unterhaltungsmedien für die Konstruktion des Politikbildes",
				"attachments": [],
				"tags": [
					"Beeinflussung",
					"Begriff",
					"Bildung",
					"Bildungsangebot",
					"Bildungsprozess",
					"Bundestag",
					"Demokratie",
					"Deutschland-DDR",
					"Digitale Medien",
					"Dokumentarfilm",
					"Fernsehen",
					"Fernsehsendung",
					"Fernsehserie",
					"Fotografie",
					"Freiheit",
					"Gesellschaft",
					"Gestaltung",
					"Hörfunk",
					"Kino",
					"Lebenswelt",
					"Massenmedien",
					"Medienangebot",
					"Medienkompetenz",
					"Politik",
					"Politisches Bewusstsein",
					"Postman, Neil",
					"Propaganda",
					"Rezeption",
					"Rundfunk",
					"Terrorismus",
					"Unterhaltung",
					"Unterhaltungssendung",
					"Urheberrecht",
					"Wahl",
					"Wahrnehmung",
					"Öffentlichkeit"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ism-info.de/ism-info.html?qdb=ism&a=e9931f71c58b60fa",
		"items": [
			{
				"itemType": "film",
				"title": "Vom Untertan zum Attentäter",
				"creators": [],
				"date": "2001",
				"abstractNote": "Die Zwanzigerjahre in Deutschland: Zeit der Weimarer Republik. Der Kaiser weilte im holländischen Exil, neue Autoritäten fehlten, das Volk probte die Demokratie, soziale Spannungen wuchsen. Der Dichter Stefan George träumte währenddessen von einem neuen, edlen Deutschland. Er nahm die Brüder Stauffenberg in seinen Bund auf. Carl Schenk von Stauffenberg, der nach dem Abitur eine militärische Laufbahn eingeschlagen hatte, stimmte für Hitler als Reichskanzler, da er die Parteien der Weimarer Republik verabscheute. Trotzdem war Hitler in seinen Augen ein Kleinbürger, dessen Untertan er schon aus Familientradition nicht sein konnte. Als die deutschen Soldaten völlig unzureichend ausgerüstet in den Russlandfeldzug geschickt wurden, erkannte Stauffenberg den Größenwahn Hitlers und drängte bei Gesprächen mit Offizieren auf Hitlers Ermordung. Am 20. Juli 1944 übernahm Stauffenberg die Rolle des Attentäters. Hitler überlebte den Anschlag und konnte schon wenige Stunden danach den italienischen Diktator Mussolini empfangen. Um Mitternacht bildete Generaloberst Fromm ein Standgericht und verurteilte Stauffenberg und drei weitere Offiziere zum Tode.",
				"libraryCatalog": "Informationssystem Medienpaedagogik",
				"attachments": [],
				"tags": [
					"20. Jahrhundert (bis 1945)",
					"Attentat",
					"Graf Schenk von Stauffenberg",
					"Nationalsozialismus",
					"Persönlichkeitsbilder",
					"Widerstand"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ism-info.de/ism-info.html?feldname1=Freitext&feldinhalt1=Demokratie&bool1=and&BoolSelect_2=AND&feldname2=Schlagworte&feldinhalt2=&bool2=and&BoolSelect_3=AND&feldname3=Personen&feldinhalt3=&bool3=and&BoolSelect_4=AND&feldname4=Titel&feldinhalt4=&bool4=and&BoolSelect_5=AND&feldname5=Jahr&feldinhalt5=&bool5=and&dokumenttyp%5B%5D=1&dokumenttyp%5B%5D=2&dokumenttyp%5B%5D=4&dokumenttyp%5B%5D=8&dokumenttyp%5B%5D=32&dokumenttyp%5B%5D=16&sprache%5B%5D=1&sprache%5B%5D=2&sprache%5B%5D=4&Suchen=Suchen&t=Suchen&ckd=yes&qdb=ism&kontrast=",
		"items": "multiple"
	}
]
/** END TEST CASES **/