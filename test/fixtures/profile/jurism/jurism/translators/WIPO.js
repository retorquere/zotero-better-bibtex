{
	"translatorID": "039338fc-d84f-44bf-99e4-693cc91b569f",
	"label": "WIPO",
	"creator": "Sebastian Karcher",
	"target": "^https?://patentscope\\.wipo\\.int",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2017-07-27 10:44:58"
}

/*
	WIPO Translator
   Copyright (C) 2012 Sebastian Karcher an Avram Lyon

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc,url) {
	var xpath='//meta[@content="Patent Application"]';
		
	if (ZU.xpath(doc, xpath).length > 0) {
		return "patent";
	}
			
	if (url.match(/\/search\/.+&filter=PCT&/)) {
		return "multiple";
	}

	return false;
}

function fixCase(content){
	if (content.toUpperCase() == content ||
		content.toLowerCase() == content) {
		return ZU.capitalizeTitle(content, true);
	}
	else return content;
}

function doWeb(doc,url)
{
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		var results = ZU.xpath(doc,'//td[contains(@id, "resultListTableColumnTitle")]');

		for (var i in results) {
			hits[ZU.xpathText(results[i], './a/@href')] = results[i].textContent;
		}
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, function (myDoc) { 
				doWeb(myDoc, myDoc.location.href); }, function () {});
		});
	} else {
		var language = ZU.xpathText(doc, '//tr/td[b[contains(text(), "Publication Language:")]]/following-sibling::td');
		var patentno = ZU.xpathText(doc, '//td[@id="detailPCTtableWO"]');
		var appno = ZU.xpathText(doc, '//td[@id="detailPCTtableAN"]');
		var assignee = ZU.xpathText(doc, '//meta[@scheme="assignee"]/@content');
		var abstract = ZU.xpathText(doc, '//tr/td[b[contains(text(), "Abstract:")]]/following-sibling::td/div/span');
		// We call the Embedded Metadata translator to do the actual work
		var translator = Zotero.loadTranslator("web");
		translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
		translator.setHandler("itemDone", function(obj, item) {
			item.itemType = "patent";
			if (language) item.language = language;
			if (abstract) item.abstractNote = abstract;
			if (assignee) item.assignee = assignee;
			if (appno) item.applicationNumber = appno;
			if (patentno) item.patentNumber = patentno;
			if (item.abstractNote) item.abstractNote = fixCase(item.abstractNote);
			for (var i in item.creators){
				item.creators[i].lastName = fixCase(item.creators[i].lastName);
				item.creators[i].firstName = fixCase(item.creators[i].firstName);
				item.creators[i].creatorType = "inventor";
			}
			for (i in item.tags){
				item.tags[i] = fixCase(item.tags[i]);
			}
			item.title = fixCase(item.title);
			item.extra = '';
			item.complete();
		});
		translator.getTranslatorObject(function (obj) {
			obj.doWeb(doc, url);
		});
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://patentscope.wipo.int/search/en/detail.jsf?docId=WO2010111344",
		"items": [
			{
				"itemType": "patent",
				"title": "Methods and Microorganisms for Production of C4-Dicarboxylic Acids",
				"creators": [
					{
						"firstName": "Adam",
						"lastName": "Lawrence",
						"creatorType": "inventor"
					},
					{
						"firstName": "Jacobus",
						"lastName": "Pronk",
						"creatorType": "inventor"
					},
					{
						"firstName": "Antonius",
						"lastName": "Van Maris",
						"creatorType": "inventor"
					},
					{
						"firstName": "Rintze",
						"lastName": "Zelle",
						"creatorType": "inventor"
					},
					{
						"firstName": "Kevin",
						"lastName": "Madden",
						"creatorType": "inventor"
					},
					{
						"firstName": "Jacob",
						"lastName": "Harrison",
						"creatorType": "inventor"
					},
					{
						"firstName": "Joshua",
						"lastName": "Trueheart",
						"creatorType": "inventor"
					},
					{
						"firstName": "Carlos",
						"lastName": "Gancedo Rodriguez",
						"creatorType": "inventor"
					},
					{
						"firstName": "Carmen-lisset",
						"lastName": "Flores Mauriz",
						"creatorType": "inventor"
					},
					{
						"firstName": "Stanley",
						"lastName": "Bower",
						"creatorType": "inventor"
					}
				],
				"issueDate": "2010/10/01",
				"abstractNote": "(EN)Methods and recombinant microorganisms for the biological production of C4-dicarboxylic acids are described. The recombinant microorganisms have increased production of OAA as compared to unmodified microorganisms. In some cases, the recombinant microorganisms have been modified to reduce production of pyruvate and/or reduce conversion of pyruvate to acetaldehyde. Thus, the microorganisms are modified to reduce the activity of pyruvate kinase and/or pyruvate decarboxylase.(FR)La présente invention concerne des procédés et des microorganismes recombinants pour la production biologique d'acides dicarboxyliques en C4. Comparés aux microorganismes non modifiés, les microorganismes recombinants produisent beaucoup plus d'OAA. Dans certains cas, les microorganismes recombinants ont été modifiés pour réduire la production de pyruvate et/ou réduire la conversion du pyruvate en acétaldéhyde. Les microorganismes sont ainsi modifiés pour réduire l'activité de la pyruvate kinase et/ou de la pyruvate décarboxylase.",
				"applicationNumber": "PCT/US2010/028429",
				"assignee": "DSM IP Assets B.V., LAWRENCE, Adam, PRONK, Jacobus, Thomas, VAN MARIS, Antonius, Jeroen Adriaan, ZELLE, Rintze, Meindert, MADDEN, Kevin, T., HARRISON, Jacob, C., TRUEHEART, Joshua, GANCEDO RODRIGUEZ, Carlos, FLORES MAURIZ, Carmen-lisset, BOWER, Stanley",
				"language": "English (EN)",
				"patentNumber": "WO/2010/111344",
				"url": "https://patentscope.wipo.int/search/en/detail.jsf?docId=WO2010111344",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Methods and Microorganisms for Production of C4-Dicarboxylic Acids"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
];
/** END TEST CASES **/
