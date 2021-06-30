{
	"translatorID": "feef66bf-4b52-498f-a586-8e9a99dc07a0",
	"translatorType": 4,
	"label": "Retsinformation",
	"creator": "Roald Frøsig and Abe Jellinek",
	"target": "^https?://(www\\.)?retsinformation\\.dk/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-07 20:00:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Roald Frøsig and Abe Jellinek

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

// Retsinformation exposes two types of data: ELI metadata in the HTML and
// custom XML/JSON schema via a separate GET request. ELI is standard, so it
// would be great to use it... but unfortunately, it's inserted client-side
// by React. in order to make this translator work without a hidden browser,
// we'll use the JSON.

function detectWeb(doc, url) {
	if (getSearchResults(doc, url, true)) {
		return "multiple";
	}
	else if (url.includes("/eli/")) {
		return getType(text(doc, '.m-0'));
	}
	return false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Z.selectItems(getSearchResults(doc, url), function (selectedItems) {
			if (!selectedItems) return;
			var urls = [];
			for (var i in selectedItems) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function getSearchResults(doc, url, checkOnly) {
	var titles = doc.querySelectorAll("a.document-title");

	if (checkOnly || !titles.length) return !!titles.length;

	var items = {};
	for (var i = 0; i < titles.length; i++) {
		items[titles[i].href] = ZU.trimInternal(titles[i].textContent);
	}
	
	return items;
}

function scrape(doc, url) {
	ZU.doGet(url.replace(/\/dan.*/, '').replace('/eli', '/api/document/eli'), function (respText) {
		let json = JSON.parse(respText)[0];
		let item = new Zotero.Item(getType(json.shortName));
		
		let signingDate;
		let admissionDate;
		let firstAdmissionDate;

		for (let { displayName: name, displayValue: value } of json.metadata) {
			if (name == 'Dato for underskrift') {
				signingDate = value;
			}
			else if (name == 'Dato for indlæggelse') {
				admissionDate = value;
			}
			else if (name == 'Dato for førstegangsindlæggelse') {
				firstAdmissionDate = value;
			}
		}

		item.title = json.title;
		item.shortTitle = json.popularTitle;
		
		let number = json.shortName;
		let date = ZU.strToISO(signingDate || admissionDate || firstAdmissionDate);

		if (item.itemType == 'statute') {
			item.codeNumber = number;
			item.dateEnacted = date;
		}
		else if (item.itemType == 'case') {
			item.docketNumber = number;
			item.dateDecided = date;
		}
		else if (item.itemType == 'bill') {
			item.billNumber = number;
			item.date = date;
		}
		
		if (json.ressort) {
			item.creators.push({
				creatorType: 'author',
				lastName: json.ressort,
				fieldMode: 1
			});
		}
		item.url = url;
		item.complete();
	});
}

function getType(documentType) {
	if (/ADI|AND|BEK|BKI|BST|CIR|CIS|DSK|FIN|KON|LBK|LOV|LTB|PJE|SKR|VEJ|ÅBR/
		.test(documentType)) {
		return "statute";
	}

	if (/DOM|AFG|KEN|UDT/.test(documentType)) {
		return "case";
	}

	if (/\d{3}|BSF|Beslutningsforslag/.test(documentType)) {
		return "bill";
	}

	return "webpage";
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/eli/lta/2015/167",
		"defer": true,
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Bekendtgørelse af lov om dag-, fritids- og klubtilbud m.v. til børn og unge (dagtilbudsloven)",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Børne- og Undervisningsministeriet",
						"fieldMode": 1
					}
				],
				"dateEnacted": "2015-02-20",
				"codeNumber": "LBK nr 167 af 20/02/2015",
				"shortTitle": "Dagtilbudsloven",
				"url": "https://www.retsinformation.dk/eli/lta/2015/167",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/eli/lta/2013/1490",
		"defer": true,
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Bekendtgørelse om regnskab for folkehøjskoler, efterskoler, husholdningsskoler og håndarbejdsskoler (frie kostskoler), frie grundskoler, private skoler for gymnasiale uddannelser m.v. og produktionsskoler",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Børne- og Undervisningsministeriet",
						"fieldMode": 1
					}
				],
				"dateEnacted": "2013-12-16",
				"codeNumber": "BEK nr 1490 af 16/12/2013",
				"shortTitle": "Regnskabsbekendtgørelse",
				"url": "https://www.retsinformation.dk/eli/lta/2013/1490",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/eli/lta/2015/599",
		"defer": true,
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Bekendtgørelse om dagtilbud",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Børne- og Undervisningsministeriet",
						"fieldMode": 1
					}
				],
				"dateEnacted": "2015-04-30",
				"codeNumber": "BEK nr 599 af 30/04/2015",
				"url": "https://www.retsinformation.dk/eli/lta/2015/599",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/eli/ft/20012BB00055",
		"defer": true,
		"items": [
			{
				"itemType": "bill",
				"title": "Forslag til folketingsbeslutning om bedre økonomiske forhold for skolefritidsordninger på friskoler og private grundskoler",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Folketinget",
						"fieldMode": 1
					}
				],
				"date": "2002-01-17",
				"billNumber": "2001/2 BSF 55",
				"url": "https://www.retsinformation.dk/eli/ft/20012BB00055",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/eli/ft/20091BB00193",
		"defer": true,
		"items": [
			{
				"itemType": "bill",
				"title": "Forslag til folketingsbeslutning om harmonisering af regler om skolefritidsordninger og fritidshjem efter dagtilbudsloven",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Folketinget",
						"fieldMode": 1
					}
				],
				"date": "2010-03-27",
				"billNumber": "2009/1 BSF 193",
				"url": "https://www.retsinformation.dk/eli/ft/20091BB00193",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/eli/lta/2012/956",
		"defer": true,
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Bekendtgørelse om mindre fartøjer der medtager op til 12 passagerer",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Erhvervsministeriet",
						"fieldMode": 1
					}
				],
				"dateEnacted": "2012-09-26",
				"codeNumber": "BEK nr 956 af 26/09/2012",
				"url": "https://www.retsinformation.dk/eli/lta/2012/956",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/eli/retsinfo/2016/9874",
		"defer": true,
		"items": [
			{
				"itemType": "case",
				"caseName": "Afslag på aktindsigt i form af dataudtræk efter offentlighedslovens § 11. Dataudtræk kunne ikke foretages ved få og enkle kommandoer",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Folketinget",
						"fieldMode": 1
					}
				],
				"dateDecided": "2016-05-08",
				"docketNumber": "UDT nr 9874 af 05/08/2016",
				"url": "https://www.retsinformation.dk/eli/retsinfo/2016/9874",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/documents?t=huse",
		"defer": true,
		"items": "multiple"
	}
]
/** END TEST CASES **/
