{
	"translatorID": "feef66bf-4b52-498f-a586-8e9a99dc07a0",
	"label": "Retsinformation",
	"creator": "Roald Frøsig",
	"target": "^https?://(www\\.)?retsinformation\\.dk/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-02-24 02:31:08"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2016 Roald Frøsig

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

function detectWeb(doc, url){
	if (getSearchResults(doc, url, true)) {
		return "multiple";
	} else if (url.indexOf("R0710") != -1) {
		return getType(doc);
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Z.selectItems(getSearchResults(doc, url), function(selectedItems) {
			if (!selectedItems) return true;
			var urls = [];
			for (var i in selectedItems) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function getSearchResults(doc, url, checkOnly) {
	var titles,
		table = doc.getElementById("ctl00_MainContent_ResultGrid1");
	if (!table) return false;

	if (/(R0210|R0310)/.test(url)) {
		titles = ZU.xpath(table, './/tr[@class!="th"]/td[2]/a[1]');
	} else if (/R0700.aspx\\?res/.test(url)) {
		titles = ZU.xpath(table, './/tr[@class!="th"]/td[3]/a[1]');
	} else if (/(R0220|R0415|R0700)/.test(url)) {
		titles = ZU.xpath(table, './/tr[@class!="th"]/td[4]/a[1]');
	} else {
		titles = ZU.xpath(table, './/tr[@class!="th"]/td[1]/a[1]');
	}
	
	if (checkOnly || !titles.length) return !!titles.length;

	var items = {};
	for (var i = 0; i < titles.length; i++) {
		items[titles[i].href] = ZU.trimInternal(titles[i].textContent);
	}
	
	return items;
}

function scrape(doc, url) {
	var type = getType(doc);
	var newItem = new Zotero.Item(type);
	newItem.title = getTitle(doc);
	newItem.url = url;
	
	var kortNavn = getKortNavn(doc);
	var ressort = getRessort(doc);
	
	if (!/LBK|LOV/.test(kortNavn.threeLetters)) {
		newItem.creators[0] = {
			creatorType: "author",
			fieldMode: 1
		};
		
		if (/EDP|ISP|FOU/.test(kortNavn.threeLetters)) {
			newItem.creators[0].lastName = "Folketingets Ombudsmand";
		} else {
			newItem.creators[0].lastName = ressort.ressort;		
		}
	}
	
	newItem.number = kortNavn.id;
	
	if (type == "statute" || type == "case") {
		newItem.date = kortNavn.date;
		newItem.shortTitle = ressort.shortTitle;
	} else {
		newItem.date = ressort.pubDate;
	}
	
	newItem.complete();
}

function getType (doc) {
	var threeLetters = getKortNavn(doc).threeLetters;
	if (/ADI|AND|BEK|BKI|BST|CIR|CIS|DSK|FIN|KON|LBK|LOV|LTB|PJE|SKR|VEJ|ÅBR/
		.test(threeLetters)
	) {
		return "statute";
	}

	if (/DOM|AFG|KEN|UDT/.test(threeLetters)) {
		return "case";
	}

	if (/\d{3}/.test(threeLetters)) {
		return "bill";
	}

	return "webpage";
}

function getTitle (doc) {
	var title;
	// the html for 'bill' type is very idiosynchratic, so we wont attempt to
	// scrape the title of bills from the <body> element.
	if (getType(doc) != "bill") {
		title = ZU.xpathText(doc, '//div[@class="wrapper2"]//p[@class="Titel2"]');
		if (!title) {
			var indhold = doc.getElementById("INDHOLD");
			if (indhold) {
				title = ZU.xpathText(indhold, './/p[@class="Titel"]')
					 || ZU.xpathText(indhold, './/font/p[@align="CENTER"]') 
					 || ZU.xpathText(indhold, './/h1[@class="TITLE"]') 
					 || ZU.xpathText(indhold, './/span[1]');
			}
		}
		
		if (title) {
			title = title.trim();
		}
	}

	// If it's a 'bill' or the xpaths above fail to find the title, we will
	// scrape the title from the <head> element.
	// The <title>-element consist of three parts: a short title (if one
	// exists); the title of the document; and "- retsinformation.dk".
	if (!title) {
		title = doc.title.substring(0, doc.title.lastIndexOf("-"));
		if (getRessort(doc).shortTitle) {
			title = title.substr(getRessort(doc).shortTitle.length+2);
		}
	}

	return ZU.trimInternal(title);
}

function getKortNavn (doc) {
	var fodder = doc.getElementsByClassName("kortNavn")[0].textContent;
	var m = fodder.match(/^\s*(.+)\s+af\s+(\d{2})\/(\d{2})\/(\d{4})\b/);
	if (m) {
		return {
			id: m[1],
			date: m[4] + '-' + m[3] + '-' + m[2],
			threeLetters: m[1].substr(0,3)
		};
	} else {
		return {
			id: fodder,
			threeLetters: fodder.substr(0,3)
		};
	}
}

function getRessort (doc) {
	var fodder = ZU.trimInternal(
		doc.getElementsByClassName('ressort')[0].textContent);

	// the 'fodder' string here consists of three parts:
	//  - a short title in parentheses (if one exists)
	//  - the publication date in the form dd-mm-yyyy
	//  - the 'ressort', i.e. the ministry responsible for the document
	var m = fodder.match(/(?:\((.+)\))?.*\b(\d{2})-(\d{2})-(\d{4})(.+)/);

	return {
		shortTitle: m[1],
		pubDate: m[4] + '-' + m[3] + '-' + m[2],
		ressort: m[5].trim()
	};
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/forms/R0710.aspx?id=168340",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Bekendtgørelse af lov om dag-, fritids- og klubtilbud m.v. til børn og unge (dagtilbudsloven)",
				"creators": [],
				"dateEnacted": "2015-02-20",
				"publicLawNumber": "LBK nr 167",
				"shortTitle": "Dagtilbudsloven",
				"url": "https://www.retsinformation.dk/forms/R0710.aspx?id=168340",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/forms/R0710.aspx?id=160621",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Bekendtgørelse om regnskab for folkehøjskoler, efterskoler, husholdningsskoler og håndarbejdsskoler (frie kostskoler), frie grundskoler, private skoler for gymnasiale uddannelser m.v. og produktionsskoler",
				"creators": [
					{
						"creatorType": "author",
						"fieldMode": 1,
						"lastName": "Ministeriet for Børn, Undervisning og Ligestilling"
					}
				],
				"dateEnacted": "2013-12-16",
				"publicLawNumber": "BEK nr 1490",
				"shortTitle": "Regnskabsbekendtgørelse",
				"url": "https://www.retsinformation.dk/forms/R0710.aspx?id=160621",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/forms/R0710.aspx?id=170044",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Bekendtgørelse om dagtilbud",
				"creators": [
					{
						"creatorType": "author",
						"fieldMode": 1,
						"lastName": "Ministeriet for Børn, Undervisning og Ligestilling"
					}
				],
				"dateEnacted": "2015-04-30",
				"publicLawNumber": "BEK nr 599",
				"url": "https://www.retsinformation.dk/forms/R0710.aspx?id=170044",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/forms/R0710.aspx?id=95024",
		"items": [
			{
				"itemType": "bill",
				"title": "Forslag til folketingsbeslutning om bedre økonomiske forhold for skolefritidsordninger på friskoler og private grundskoler",
				"creators": [
					{
						"creatorType": "author",
						"fieldMode": 1,
						"lastName": "Folketinget"
					}
				],
				"date": "2002-01-17",
				"billNumber": "2001/2 BSF 55",
				"url": "https://www.retsinformation.dk/forms/R0710.aspx?id=95024",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/forms/R0710.aspx?id=131109",
		"items": [
			{
				"itemType": "bill",
				"title": "Forslag til folketingsbeslutning om harmonisering af regler om skolefritidsordninger og fritidshjem efter dagtilbudsloven",
				"creators": [
					{
						"creatorType": "author",
						"fieldMode": 1,
						"lastName": "Folketinget"
					}
				],
				"date": "2010-03-27",
				"billNumber": "2009/1 BSF 193",
				"url": "https://www.retsinformation.dk/forms/R0710.aspx?id=131109",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/forms/R0710.aspx?id=141932",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Bekendtgørelse om mindre fartøjer der medtager op til 12 passagerer",
				"creators": [
					{
						"creatorType": "author",
						"fieldMode": 1,
						"lastName": "Erhvervs- og Vækstministeriet"
					}
				],
				"dateEnacted": "2012-09-26",
				"publicLawNumber": "BEK nr 956",
				"url": "https://www.retsinformation.dk/forms/R0710.aspx?id=141932",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/Forms/R0930.aspx?q=huse&col=a&smode=simpel",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/Forms/R0310.aspx?res=5&nres=1",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.retsinformation.dk/Forms/R0220.aspx?char=R",
		"items": "multiple"
	}
]
/** END TEST CASES **/