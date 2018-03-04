{
	"translatorID": "f2d965fa-5acb-4ba7-90a4-8ecb6cf0c795",
	"label": "ProQuest Ebook Central",
	"creator": "Sebastian Karcher",
	"target": "^https?://ebookcentral\\.proquest\\.com/lib/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-11-19 21:23:37"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Sebastian Karcher
	
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


function detectWeb(doc, url) {
	//reader.action is for chapter, but metadata only for books
	if (url.includes('/detail.action?') || url.includes('/reader.action?')) {
		return "book";
	} else if (url.includes('search.action?') && getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.pub-list-item-description>a');
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
	var risURL = url.replace(/(detail|reader)\.action\?/, "biblioExport.action?").replace(/&.+./, "");
	var abstract =  text(doc, '#desc-container');
	//Z.debug(risURL)
	ZU.doGet(risURL, function(text) {
		//Z.debug(text)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			item.attachments.push({
				title: "ProQuest Ebook Snapshot",
				document: doc
			});
			//remove space before colon
			item.title = item.title.replace(/\s+:/, ":");
			item.abstractNote = abstract; 
			item.complete();
		});
		translator.translate();
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://ebookcentral.proquest.com/lib/syracuse-ebooks/search.action?facetCategoryFilter=Political+Science&facetCategoryPageSize=1000&usrSelectedFilterName=facetCategoryFilter&query=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://ebookcentral.proquest.com/lib/syracuse-ebooks/detail.action?docID=1357299",
		"items": [
			{
				"itemType": "book",
				"title": "Pregnant on Arrival: Making the Illegal Immigrant",
				"creators": [
					{
						"lastName": "Luibhéid",
						"firstName": "Eithne",
						"creatorType": "author"
					}
				],
				"date": "2013",
				"ISBN": "9780816685400",
				"abstractNote": "“State alert as pregnant asylum seekers aim for Ireland.” “Country Being Held Hostage by Con Men, Spongers, and Those Taking Advantage of the Maternity Residency Policy.” From 1997 to 2004, headlines such as these dominated Ireland’s mainstream media as pregnant immigrants were recast as “illegals” entering the country to gain legal residency through childbirth. As immigration soared, Irish media and politicians began to equate this phenomenon with illegal immigration that threatened to destroy the country’s social, cultural, and economic fabric. Pregnant on Arrival explores how pregnant immigrants were made into paradigmatic figures of illegal immigration, as well as the measures this characterization set into motion and the consequences for immigrants and citizens. While focusing on Ireland, Eithne Luibhéid’s analysis illuminates global struggles over the citizenship status of children born to immigrant parents in countries as diverse as the United States, Hong Kong, and elsewhere. Scholarship on the social construction of the illegal immigrant calls on histories of colonialism, global capitalism, racism, and exclusionary nation building but has been largely silent on the role of nationalist sexual regimes in determining legal status. Eithne Luibhéid turns to queer theory to understand how pregnancy, sexuality, and immigrants’ relationships to prevailing sexual norms affect their chances of being designated as legal or illegal. Pregnant on Arrival offers unvarnished insight into how categories of immigrant legal status emerge and change, how sexual regimes figure prominently in these processes, and how efforts to prevent illegal immigration ultimately redefine nationalist sexual norms and associated racial, gender, economic, and geopolitical hierarchies.",
				"libraryCatalog": "ProQuest Ebook Central",
				"place": "Minneapolis, UNITED STATES",
				"publisher": "University of Minnesota Press",
				"shortTitle": "Pregnant on Arrival",
				"url": "http://ebookcentral.proquest.com/lib/syracuse-ebooks/detail.action?docID=1357299",
				"attachments": [
					{
						"title": "ProQuest Ebook Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Ireland -- Emigration and immigration -- Government policy."
					},
					{
						"tag": "Political refugees -- Legal status, laws, etc. -- Ireland."
					},
					{
						"tag": "Pregnant women -- Legal status, laws, etc. -- Ireland."
					},
					{
						"tag": "Women -- Sexual behavior -- Ireland."
					},
					{
						"tag": "Women immigrants -- Ireland -- Social conditions."
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ebookcentral.proquest.com/lib/syracuse-ebooks/reader.action?docID=1169923&ppg=134",
		"items": [
			{
				"itemType": "book",
				"title": "The Affective Turn: Theorizing the Social",
				"creators": [
					{
						"lastName": "Clough",
						"firstName": "Patricia Ticineto",
						"creatorType": "author"
					},
					{
						"lastName": "Halley",
						"firstName": "Jean",
						"creatorType": "author"
					},
					{
						"lastName": "Kim",
						"firstName": "Hosu",
						"creatorType": "author"
					},
					{
						"lastName": "Bianco",
						"firstName": "Jamie",
						"creatorType": "author"
					}
				],
				"date": "2007",
				"ISBN": "9780822389606",
				"libraryCatalog": "ProQuest Ebook Central",
				"place": "North Carolina, UNITED STATES",
				"publisher": "Duke University Press",
				"shortTitle": "The Affective Turn",
				"url": "http://ebookcentral.proquest.com/lib/syracuse-ebooks/detail.action?docID=1169923",
				"attachments": [
					{
						"title": "ProQuest Ebook Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Traumatism"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
