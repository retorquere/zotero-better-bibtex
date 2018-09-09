{
	"translatorID": "271ee1a5-da86-465b-b3a5-eafe7bd3c156",
	"label": "Idref",
	"creator": "Sylvain Machefert",
	"target": "^https?://www\\.idref\\.fr/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-02-12 13:03:06"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Sylvain Machefert
	
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
	if (ZU.xpathText(doc, '//div[@class="detail_bloc_biblio"]') && getSearchResults(doc, true)) {
		return "multiple";	
	}
}

function getSearchResults(doc, checkOnly) {
	var resultsTitle = ZU.xpath(doc, '//div[@id="perenne-references-docs"]/span[contains(@class, "detail_value")]');
	var resultsHref = ZU.xpath(doc, '//div[@id="perenne-references-docs"]/span[contains(@class, "detail_label")]/a/@href');
	var found = false;
	items = {};
	for (let i=0; i<resultsTitle.length; i++) {
		href = resultsHref[i].textContent;
		// We need to replace the http://www.sudoc.fr/XXXXXX links are they are redirects and aren't handled correctly from subtranslator
		href = href.replace(/http:\/\/www\.sudoc\.fr\/(.*)$/, "http://www.sudoc.abes.fr/xslt/DB=2.1//SRCH?IKT=12&TRM=$1");

		if ( (href.includes("www.sudoc.abes.fr")) || (href.includes("archives-ouvertes")) ) {
			if (checkOnly) return true;
			found = true;
			items[href] = resultsTitle[i].textContent;
		}
	}
	return found ? items : false;
}

function doWeb(doc, url)
{
	Zotero.selectItems(getSearchResults(doc, false), function (selectedItems) {
		if (!selectedItems) {
			return true;
		}
		var articles = [];
		for (var i in selectedItems) {
			articles.push(i);
		}
		ZU.processDocuments(articles, scrape);
	});
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');	
	
	if (url.includes("archives-ouvertes")){
		// HAL Archives ouvertes
		translator.setTranslator('58ab2618-4a25-4b9b-83a7-80cd0259f896');
	} else if (url.includes("sudoc.abes.fr")) {
		// Sudoc
		translator.setTranslator('1b9ed730-69c7-40b0-8a06-517a89a3a278');
	} else {
		Z.debug("Undefined website");
		return false;
	}

	translator.setHandler('itemDone', function (obj, item) {
		item.complete();
	});
	
	translator.getTranslatorObject(function(trans) {
		trans.doWeb(doc, url);
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.idref.fr/199676100",
		"items": "multiple"
	}
]
/** END TEST CASES **/
