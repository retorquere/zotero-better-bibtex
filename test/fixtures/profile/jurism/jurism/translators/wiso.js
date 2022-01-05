{
	"translatorID": "136d5c30-d8b1-476f-9564-702a41b6126e",
	"label": "wiso",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.wiso-net\\.de/(document/|dosearch\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2016-06-26 18:54:53"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	wiso Translator, Copyright © 2014 Philipp Zumstein
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
	if (url.search(/document/) !== -1) {
		if ( ZU.xpath(doc, '//a[contains(@class, "boxExport")]').length>0 ) {
			//single item --> generic fallback = journalArticle
			return "journalArticle";
		}
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function scrape(doc, url) {
	var address = ZU.xpathText(doc, '//pre[strong]/a[contains(text(), "https://www.wiso-net.de/document/")]');
	var docUid = address.substr(address.lastIndexOf('/')+1);
	var risUrl = "/stream/exportDocuments?docUids="
		+ docUid + "&dbShortcut=&query=&source=Document&format=Citavi";

	ZU.doGet(risUrl, function(text) {
		
		//author names are messy and not consistently saved
		//sometimes a list of authors is saved in one field seperated by commas
		//to prevent this breaking sync:
		text = text.replace(/^(A[U123]|ED)\s+-\s+(.+[,;].+)$/mg, cleanAuthorFields );
		
		//sometimes more than one T1 fields are present
		//or the title is distributed over T1, T2, T3...
		if ( /^TY\s+-\s+JOUR/m.test(text) && /^JF\s+-\s+/m.test(text) && !/^TI\s+-\s+/m.test(text)) {
			var titlesArray = [];
			text = text.replace(/\r?\n^T[1-5]\s+-\s+(.+)$/mg, function(m, title) {
				title = ZU.trimInternal(title);
				if (title) titlesArray.push(title);
				return '';
			});
			
			if (titlesArray.length) {
				//insert an aggregated TI tag
				text = text.replace(/^TY\s+-\s+(.+)$/m , "$&\nTI  - " + titlesArray.join(": "));
			}
		}

		//the field custom field TS seems to be used for some database info
		text = text.replace(/^TS\s+-/m,"DB -");
		//language LA not LG
		text = text.replace(/^LG\s+-/m,"LA -");
		//sometimes an abstract is saved in the N1 field instead of the AB filed:
		if ( text.search(/^AB\s+-/m) == -1) {
			text = text.replace(/^N1\s+-/m,"AB -");
		}
		var trans = Zotero.loadTranslator('import');
		trans.setTranslator('32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7');//https://github.com/zotero/translators/blob/master/RIS.js
		trans.setString(text);
		//Z.debug(text);

		trans.setHandler('itemDone', function (obj, item) {
			item.date = item.date.replace(/(\d\d)\.(\d\d)\.(\d\d\d\d)/,"$3-$2-$1");//e.g. 02.03.2014 ==> 2014-03-02
			item.attachments = [{
				title: "Snapshot",
				document:doc
			}];
			//the url for ebooks is sometimes wrong/incomplete
			if (item.url.includes("DOKV_DB=&")) {
				item.url = ZU.xpathText(doc, '//a[@class="linkifyplus"]');
			}
			//Zotero.debug(item);
			item.complete();
		});
	
		trans.translate();
	} , null , "ISO-8859-1");//the text file is LATIN1 encoded
	
}


function cleanAuthorFields(m, tag, authorStr) {
	//m = matched string (everything)
	//tag = first parenthesized submatch, i.e., AU, A1, A2, A3 or ED
	//authorStr = second parenthesized submatch, i.e., what is following the tag
	var authors = authorStr.split(';');
	var fixName = false;
	if (authors.length == 1)  {
		//no semicolon
		fixName = true;
		authors = authorStr.split(',');
		if (authors.length < 3) {
			//at most single comma, don't mess with it
			return m;
		} else if (authors.length == 3) {
			//we have to distinguish the correct cases where the third part is
			//just a suffix as "Jr." and wrong cases where this is a list of
			//three authors ==> easiest is maybe to check for a space
			if (!ZU.superCleanString(authors[2]).includes(' ')) {
				return m;
			}
		}
	}
	
	//here: One of the following two cases holds:
	//(i) authorStr contains semicolon(s), authors is the array of its different parts, fixName = false
	//(ii) authorStr contains no semicolon but more than one comma, authors is the array of its different parts, fixName = true	
	var str = '';
	for (var i=0; i<authors.length; i++) {
		var author = ZU.superCleanString(authors[i]).replace(/(?:Dr|Prof)\.\s*/,"");
		if (fixName && !author.includes(',') && author.includes(' ')) {
			//best guess: split at the last space
			var splitAt = author.lastIndexOf(' ');
			author = author.substring(splitAt+1) + ', ' + author.substring(0, splitAt);
		}
		if (author) str += '\n' + tag + '  - ' + author;
	}
	return str.substr(1);
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//a[./span[contains(@class,"boxHeader")]]');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.xpathText(rows[i], './span[contains(@class,"boxHeader")]');
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
			var articles = new Array();
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.wiso-net.de/document/ZECO__AUIN425053660",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Die Technologie fällt nicht vom Himmel",
				"creators": [
					{
						"lastName": "von Michael Ziegler",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2014-03-03",
				"ISSN": "0005-1306",
				"abstractNote": "Automatisiertes Fahren: Wie verändert dieser Megatrend unsere Fahrzeuge, die Wertschöpfungskette und die Mobilität allgemein? Fünf ausgewiesene Experten beantworten beim »Automobil Industrie« Round-Table-Gespräch die wichtigsten Fragen.",
				"archive": "powered by GENIOS",
				"issue": "003",
				"libraryCatalog": "wiso",
				"publicationTitle": "AI",
				"url": "https://www.wiso-net.de/document/AUIN__425053660",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "https://www.wiso-net.de/document/ZWIW__BEFO20071105986-E-FIZT-BEFO-DOMA-ZDEE-ETEC",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Eigentor für die Stromwirtschaft",
				"creators": [
					{
						"lastName": "Köpke",
						"firstName": "Ralf",
						"creatorType": "author"
					},
					{
						"lastName": "Nikionok-Ehrlich",
						"firstName": "Angelika",
						"creatorType": "author"
					}
				],
				"date": "2007",
				"ISSN": "0945-8794",
				"abstractNote": "Der Stromkonzern E.ON kündigt zum Jahresbeginn 2008 Strompreiserhöhungen von knapp 10 % aufgrund höherer Beschaffungskosten und gestiegener Aufwendungen für erneuerbare Energien an. Diese vermeintliche Rechtfertigung wird widerlegt. Rein rechnerisch ergäben sich lediglich 0,8 % wegen der Brennstoffkosten und 0,2 % wegen der EEG-Umlage (Erneuerbare-Energien-Gesetz). Der angekündigte hohe Sprung lässt sich nicht nachvollziehen. Die Strompreisentwicklung an der Leipziger Strombörse EEX seit 2002 wird grafisch dargestellt. Daraus kann abgeleitet werden, in welchem Maße sich die vier Erzeugungsoligopolisten bereits an der CO2-Einpreisung der kostenlos zugeteilten CO2-Zertifikate bereichert haben. Die Bundesregierung arbeitet an einer Kartellrechtsänderung, aber es bleiben Bedenken, ob die vorgesehenen Regulierungen Wirkung zeigen werden. Denn Regionalversorger und Stadtwerke hängen an der Preispolitik von E.ON und RWE, und wenn der Durchschnitt insgesamt steigt, wird es keine deutlichen Einzelabweichungen nach oben geben.",
				"archive": "(c) WTI Frankfurt",
				"language": "Deutsch",
				"libraryCatalog": "wiso",
				"pages": "6",
				"publicationTitle": "Energie und Management",
				"url": "https://www.wiso-net.de/document/BEFO__20071105986-E-FIZT-BEFO-DOMA-ZDEE-ETEC",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Energiemarkt",
					"Energiepolitik",
					"Preisentwicklung"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.wiso-net.de/document/ZWIW__BLISED1E880E5071CB2CCEDB0885805C993A",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "How Interorganizational Networks Can Become Path-Dependent: Bargaining Practic es in the Photonic s Industry",
				"creators": [
					{
						"lastName": "Burger",
						"firstName": "Markus",
						"creatorType": "author"
					},
					{
						"lastName": "Sydow",
						"firstName": "Jörg",
						"creatorType": "author"
					}
				],
				"date": "2014-01-17",
				"ISSN": "1439-2917",
				"abstractNote": "The authors investigate whether and how path dependence can develop in interorganizational networks. They focus our analysis on one particular type of network management practices - bargaining practices, which we define as recurrent activities through which network partners agree to identify and distribute their cooperative surplus. They conduct three empirical case studies of regional networks in the photonics industry, using qualitative interviews and content analysis. A major finding is that network bargaining practices can indeed exhibit interorganizational path dependencies. This paper contributes by operationalizing the theory of organizational path dependence and by extending this theory to parsimoniously explain the dynamics of networks.",
				"archive": "Alle Rechte vorbehalten. (c) GBI-Genios, München",
				"issue": "1",
				"language": "Englisch",
				"libraryCatalog": "wiso",
				"pages": "73-97",
				"publicationTitle": "sbr Schmalenbach Business Review",
				"shortTitle": "How Interorganizational Networks Can Become Path-Dependent",
				"url": "https://www.wiso-net.de/document/BLIS__ED1E880E5071CB2CCEDB0885805C993A",
				"volume": "66",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Empirische Methode",
					"Organisationstheorie",
					"Unternehmenskooperation",
					"Unternehmensnetzwerk"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.wiso-net.de/dosearch?explicitSearch=true&q=mannheim&x=0&y=0&dbShortcut=%3A3%3AALLEQUELLEN&searchMask=5461&TI%2CUT%2CDZ%2CBT%2COT%2CSE=&NN%2CAU%2CMM%2CZ2=&CO%2CC2%2CTA%2CKA%2CVA%2CZ1=&CT%2CDE%2CZ4=&BR%2CGW%2CN1%2CN2%2CNC%2CND%2CSC%2CWZ%2CZ5%2CAI=&Z3=&DT_from=&DT_to=&timeFilterType=selected&timeFilter=NONE",
		"items": "multiple"
	}
];
/** END TEST CASES **/
