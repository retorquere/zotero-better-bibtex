{
	"translatorID": "24a10ebf-ada1-4b8d-8f76-5a29e24d3e78",
	"label": "R-Packages",
	"creator": "Sebastian Karcher",
	"target": "(cran\\..+|cloud\\.r-project.org|/CRAN)/web/packages/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 150,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-02-27 07:48:03"
}

/*
	***** BEGIN LICENSE BLOCK *****

	R Packages Translator
	Copyright © 2013 Sebastian Karcher

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

/*Some other sample sites:
https://stat.ethz.ch/CRAN/web/packages/MCMCpack/
https://cloud.r-project.org/web/packages/asciiruler/index.html
*/


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (text(doc, 'body>h2')) {
		return "computerProgram";
	} else if ((url.includes('/available_packages_by_date.html') || url.includes('/available_packages_by_name.html')) && getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('tr>td>a[href*="/web/packages/"]');
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
	var item = new Zotero.Item('computerProgram');
	item.title = text(doc, 'body>h2');
	
	var authorString = ZU.xpathText(doc, '//table/tbody/tr/td[contains(text(), "Author")]/following-sibling::td');
	if (authorString) {
		var creators = authorString.replace(/\[.+?\]/g, '').split(/\s*,\s*/);
		for (let i=0; i<creators.length; i++) {
			if (creators[i].trim()=="R Core Team") {
				item.creators.push({
					lastName: creators[i].trim(),
					fieldMode: true,
					creatorType: "author"
				});
			} else {
				item.creators.push(ZU.cleanAuthor(creators[i], 'author'));
			}
		}
		
	}
	
	item.versionNumber = ZU.xpathText(doc, '//table/tbody/tr/td[contains(text(), "Version")]/following-sibling::td');
	item.abstractNote = ZU.trimInternal(text(doc, 'body>p') || '');
	item.date = ZU.xpathText(doc, '//table/tbody/tr/td[contains(text(), "Published")]/following-sibling::td');
	item.rights = ZU.xpathText(doc, '//table/tbody/tr/td[contains(text(), "License")]/following-sibling::td');
	
	item.url = text(doc, 'a>samp') || url;
	var tags = ZU.xpath(doc, '//td[contains(text(), "views")]/following-sibling::td/a');
	for (let i=0; i<tags.length; i++) {
		item.tags.push(tags[i].textContent);
	}
	
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://cran.us.r-project.org/web/packages/available_packages_by_name.html#available-packages-B",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://cran.us.r-project.org/web/packages/available_packages_by_date.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://cran.us.r-project.org/web/packages/effects/index.html",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "effects: Effect Displays for Linear, Generalized Linear, and Other Models",
				"creators": [
					{
						"firstName": "John",
						"lastName": "Fox",
						"creatorType": "author"
					},
					{
						"firstName": "Sanford",
						"lastName": "Weisberg",
						"creatorType": "author"
					},
					{
						"firstName": "Michael",
						"lastName": "Friendly",
						"creatorType": "author"
					},
					{
						"firstName": "Jangman",
						"lastName": "Hong",
						"creatorType": "author"
					},
					{
						"firstName": "Robert",
						"lastName": "Andersen",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Firth",
						"creatorType": "author"
					},
					{
						"firstName": "Steve",
						"lastName": "Taylor",
						"creatorType": "author"
					},
					{
						"lastName": "R Core Team",
						"fieldMode": true,
						"creatorType": "author"
					}
				],
				"date": "2017-09-15",
				"abstractNote": "Graphical and tabular effect displays, e.g., of interactions, for various statistical models with linear predictors.",
				"libraryCatalog": "R-Packages",
				"rights": "GPL-2 | GPL-3 [expanded from: GPL (≥ 2)]",
				"shortTitle": "effects",
				"url": "https://CRAN.R-project.org/package=effects",
				"versionNumber": "4.0-0",
				"attachments": [],
				"tags": [
					{
						"tag": "Econometrics"
					},
					{
						"tag": "MachineLearning"
					},
					{
						"tag": "SocialSciences"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://cran.rstudio.com/web/packages/effects/",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "effects: Effect Displays for Linear, Generalized Linear, and Other Models",
				"creators": [
					{
						"firstName": "John",
						"lastName": "Fox",
						"creatorType": "author"
					},
					{
						"firstName": "Sanford",
						"lastName": "Weisberg",
						"creatorType": "author"
					},
					{
						"firstName": "Michael",
						"lastName": "Friendly",
						"creatorType": "author"
					},
					{
						"firstName": "Jangman",
						"lastName": "Hong",
						"creatorType": "author"
					},
					{
						"firstName": "Robert",
						"lastName": "Andersen",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Firth",
						"creatorType": "author"
					},
					{
						"firstName": "Steve",
						"lastName": "Taylor",
						"creatorType": "author"
					},
					{
						"lastName": "R Core Team",
						"fieldMode": true,
						"creatorType": "author"
					}
				],
				"date": "2017-09-15",
				"abstractNote": "Graphical and tabular effect displays, e.g., of interactions, for various statistical models with linear predictors.",
				"libraryCatalog": "R-Packages",
				"rights": "GPL-2 | GPL-3 [expanded from: GPL (≥ 2)]",
				"shortTitle": "effects",
				"url": "https://CRAN.R-project.org/package=effects",
				"versionNumber": "4.0-0",
				"attachments": [],
				"tags": [
					{
						"tag": "Econometrics"
					},
					{
						"tag": "MachineLearning"
					},
					{
						"tag": "SocialSciences"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://cloud.r-project.org/web/packages/effects/index.html",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "effects: Effect Displays for Linear, Generalized Linear, and Other Models",
				"creators": [
					{
						"firstName": "John",
						"lastName": "Fox",
						"creatorType": "author"
					},
					{
						"firstName": "Sanford",
						"lastName": "Weisberg",
						"creatorType": "author"
					},
					{
						"firstName": "Michael",
						"lastName": "Friendly",
						"creatorType": "author"
					},
					{
						"firstName": "Jangman",
						"lastName": "Hong",
						"creatorType": "author"
					},
					{
						"firstName": "Robert",
						"lastName": "Andersen",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Firth",
						"creatorType": "author"
					},
					{
						"firstName": "Steve",
						"lastName": "Taylor",
						"creatorType": "author"
					},
					{
						"lastName": "R Core Team",
						"fieldMode": true,
						"creatorType": "author"
					}
				],
				"date": "2017-09-15",
				"abstractNote": "Graphical and tabular effect displays, e.g., of interactions, for various statistical models with linear predictors.",
				"libraryCatalog": "R-Packages",
				"rights": "GPL-2 | GPL-3 [expanded from: GPL (≥ 2)]",
				"shortTitle": "effects",
				"url": "https://CRAN.R-project.org/package=effects",
				"versionNumber": "4.0-0",
				"attachments": [],
				"tags": [
					{
						"tag": "Econometrics"
					},
					{
						"tag": "MachineLearning"
					},
					{
						"tag": "SocialSciences"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://cran.stat.ucla.edu/web/packages/effects/",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "effects: Effect Displays for Linear, Generalized Linear, and Other Models",
				"creators": [
					{
						"firstName": "John",
						"lastName": "Fox",
						"creatorType": "author"
					},
					{
						"firstName": "Sanford",
						"lastName": "Weisberg",
						"creatorType": "author"
					},
					{
						"firstName": "Michael",
						"lastName": "Friendly",
						"creatorType": "author"
					},
					{
						"firstName": "Jangman",
						"lastName": "Hong",
						"creatorType": "author"
					},
					{
						"firstName": "Robert",
						"lastName": "Andersen",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Firth",
						"creatorType": "author"
					},
					{
						"firstName": "Steve",
						"lastName": "Taylor",
						"creatorType": "author"
					},
					{
						"lastName": "R Core Team",
						"fieldMode": true,
						"creatorType": "author"
					}
				],
				"date": "2017-09-15",
				"abstractNote": "Graphical and tabular effect displays, e.g., of interactions, for various statistical models with linear predictors.",
				"libraryCatalog": "R-Packages",
				"rights": "GPL-2 | GPL-3 [expanded from: GPL (≥ 2)]",
				"shortTitle": "effects",
				"url": "https://CRAN.R-project.org/package=effects",
				"versionNumber": "4.0-0",
				"attachments": [],
				"tags": [
					{
						"tag": "Econometrics"
					},
					{
						"tag": "MachineLearning"
					},
					{
						"tag": "SocialSciences"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
