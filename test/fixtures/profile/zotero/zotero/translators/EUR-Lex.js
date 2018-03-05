{
	"translatorID": "bf053edc-a8c3-458c-93db-6d04ead2e636",
	"label": "EUR-Lex",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?eur-lex\\.europa\\.eu/(legal-content/[A-Z][A-Z]/TXT/|search.html\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-12-21 20:27:07"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Philipp Zumstein
	
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


// the eli resource types are described at:
// http://publications.europa.eu/mdr/resource/authority/resource-type/html/resourcetypes-eng.html
var typeMapping = {
	'DIR': 'bill', // directive
	'REG': 'statute', // regulation
	'DEC': 'statute', // decision
	'RECO': 'report', // recommodation
	'OPI': 'report' // opinion
};


function detectWeb(doc, url) {
	var eliTypeURI = attr(doc, 'meta[property="eli:type_document"]', 'resource');
	if (eliTypeURI) {
		var eliType = eliTypeURI.split('/').pop();
		var eliCategory = eliType.split('_')[0];
		var type = typeMapping[eliCategory];
		if (type) {
			return type;
		} else {
			Z.debug("Unknown eliType: " + eliType);
		}
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a.title');
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


// we need to remember the language in search page to use the same for
// individual entry page
var autoLanguage;


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var m = url.match(/\blocale=([a-z][a-z])/);
		if (m) {
			autoLanguage = m[1];
		}
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


// this maps language codes from ISO 639-1 to 639-3
var languageMapping = {
	'BG': 'bul',
	'CS': 'ces',
	'DA': 'dan',
	'DE': 'deu',
	'EL': 'ell',
	'EN': 'eng',
	'ES': 'spa',
	'ET': 'est',
	'FI': 'fin',
	'FR': 'fra',
	'GA': 'gle',
	'HR': 'hrv',
	'HU': 'hun',
	'IT': 'ita',
	'LV': 'lav',
	'LT': 'lit',
	'MT': 'mlt',
	'NL': 'nld',
	'PL': 'pol',
	'PT': 'por',
	'RO': 'ron',
	'SK': 'slk',
	'SL': 'slv',
	'SV': 'swe'
};


function scrape(doc, url) {
	var type = detectWeb(doc, url);
	var item = new Zotero.Item(type);
	
	// determine the language we are currently looking the document at
	var languageUrl = url.split('/')[4];
	if (languageUrl=="AUTO") {
		languageUrl = autoLanguage || "EN";
	}
	var language = languageMapping[languageUrl] || "eng";
	
	item.title = attr(doc, 'meta[property="eli:title"][lang=' + languageUrl.toLowerCase() + ']', 'content');
	item.language = languageUrl.toLowerCase();
	
	var uri = attr(doc, '#format_language_table_digital_sign_act_' + languageUrl.toUpperCase(), 'href');
	if (uri) {
		var uriParts = uri.split('/').pop().replace('?uri=', '').split(':');
		// e.g. uriParts =  ["OJ", "L", "1995", "281", "TOC"]
		// e.g. uriParts = ["DD", "03", "061", "TOC", "FI"]
		if (uriParts.length>=4) {
			if (/\d+/.test(uriParts[1])) {
				item.code = uriParts[0];
				item.codeNumber = uriParts[1] + ', ' + uriParts[2];
			} else {
				item.code = uriParts[0] + ' ' + uriParts[1];
				item.codeNumber = uriParts[3];
			}
			if (type=="bill") {
				item.codeVolume = item.code;
				item.code = item.codeNumber;
			}
		}
	}
	
	item.number = attr(doc, 'meta[property="eli:id_local"]', 'content');
	
	item.date = attr(doc, 'meta[property="eli:date_publication"]', 'content');
	// attr(doc, 'meta[property="eli:date_document"]', 'content');

	var passedBy = doc.querySelectorAll('meta[property="eli:passed_by"]');
	var passedByArray = [];
	for (let i=0; i<passedBy.length; i++) {
		passedByArray.push(passedBy[i].getAttribute('resource').split('/').pop());
	}
	item.legislativeBody = passedByArray.join(', ');
	
	item.url = attr(doc, 'meta[typeOf="eli:LegalResource"]', 'about') + '/' + language;
	
	// eli:is_about -> eurovoc -> tags
	
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:31995L0046",
		"items": [
			{
				"itemType": "bill",
				"title": "Directive 95/46/EC of the European Parliament and of the Council of 24 October 1995 on the protection of individuals with regard to the processing of personal data and on the free movement of such data",
				"creators": [],
				"date": "1995-11-23",
				"billNumber": "31995L0046",
				"code": "281",
				"codeVolume": "OJ L",
				"language": "en",
				"legislativeBody": "EP, CONSIL",
				"url": "http://data.europa.eu/eli/dir/1995/46/oj/eng",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://eur-lex.europa.eu/legal-content/CS/TXT/?uri=CELEX:31995L0046&from=DE",
		"items": [
			{
				"itemType": "bill",
				"title": "Směrnice Evropského parlamentu a Rady 95/46/ES ze dne 24. října 1995 o ochraně fyzických osob v souvislosti se zpracováním osobních údajů a o volném pohybu těchto údajů",
				"creators": [],
				"date": "1995-11-23",
				"billNumber": "31995L0046",
				"code": "13, 015",
				"codeVolume": "DD",
				"language": "cs",
				"legislativeBody": "EP, CONSIL",
				"url": "http://data.europa.eu/eli/dir/1995/46/oj/ces",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:31995L0046",
		"items": [
			{
				"itemType": "bill",
				"title": "Richtlinie 95/46/EG des Europäischen Parlaments und des Rates vom 24. Oktober 1995 zum Schutz natürlicher Personen bei der Verarbeitung personenbezogener Daten und zum freien Datenverkehr",
				"creators": [],
				"date": "1995-11-23",
				"billNumber": "31995L0046",
				"code": "281",
				"codeVolume": "OJ L",
				"language": "de",
				"legislativeBody": "EP, CONSIL",
				"url": "http://data.europa.eu/eli/dir/1995/46/oj/deu",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:31994R2257",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Règlement (CE) n° 2257/94 de la Commission, du 16 septembre 1994, fixant des normes de qualité pour les bananes (Texte présentant de l'intérêt pour l'EEE)",
				"creators": [],
				"dateEnacted": "1994-09-20",
				"code": "OJ L",
				"codeNumber": "245",
				"language": "fr",
				"publicLawNumber": "31994R2257",
				"url": "http://data.europa.eu/eli/reg/1994/2257/oj/fra",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://eur-lex.europa.eu/search.html?lang=en&text=%22open+access%22&qid=1513887127793&type=quick&scope=EURLEX&locale=nl",
		"items": "multiple"
	}
]
/** END TEST CASES **/
