{
	"translatorID": "c54d1932-73ce-dfd4-a943-109380e06574",
	"translatorType": 4,
	"label": "Project MUSE",
	"creator": "Sebastian Karcher and Abe Jellinek",
	"target": "^https?://[^/]*muse\\.jhu\\.edu/(book/|article/|issue/|search\\?)",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-05-19 18:10:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2016 Sebastian Karcher
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
	if (url.includes('/article/')) {
		return "journalArticle";
	}
	else if (url.includes('/book/')) {
		return "book";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	else {
		return false;
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//li[@class="title"]//a[contains(@href, "/article/") or contains(@href, "/book/")]');
	for (var i = 0; i < rows.length; i++) {
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
			let articles = [];
			for (let i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
			return true;
		});
	}
	else {
		scrape(doc);
	}
}


function scrape(doc) {
	let citationURL = ZU.xpathText(doc, '//li[@class="view_citation"]//a/@href');
	ZU.processDocuments(citationURL, function (respText) {
		let risEntry = ZU.xpathText(respText, '//*[(@id = "tabs-4")]//p');
		let doiEntry = ZU.xpathText(respText, '//*[(@id = "tabs-1")]//p');
		if (doiEntry.includes('doi:')) {
			var doi = doiEntry.split('doi:')[1].replace(/.$/, '');
		}
		// RIS translator
		let translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(risEntry);
		translator.setHandler("itemDone", function (obj, item) {
			if (doi) item.DOI = doi;
			let abstract = ZU.xpathText(doc, '//div[@class="abstract"][1]/p');
			if (!abstract) abstract = ZU.xpathText(doc, '//div[@class="description"][1]');
			if (!abstract) abstract = ZU.xpathText(doc, '//div[contains(@class, "card_summary") and contains(@class, "no_border")]');
			let tags = ZU.xpathText(doc, '//*[contains(concat( " ", @class, " " ), concat( " ", "kwd-group", " " ))]//p');
			if (abstract) {
				item.abstractNote = abstract.replace(/^,*\s*Abstract[:,]*/, "").replace(/show (less|more)$/, "").replace(/,\s*$/, "");
			}
			if (tags) {
				item.tags = tags.split(",");
			}
			item.notes = [];
			
			let cards = doc.querySelectorAll('.card');
			for (let card of cards) {
				let url = attr(card, 'a[href*="/pdf"]', 'href');
				if (!url) continue;
				item.attachments.push({
					url,
					title: text(card, '.title') || "Full Text PDF",
					mimeType: 'application/pdf'
				});
			}
			item.complete();
		});
		translator.translate();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://muse.jhu.edu/article/200965",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Terror, Trauma and the 'Young Marx' Explanation of Jacobin Politics",
				"creators": [
					{
						"lastName": "Higonnet",
						"firstName": "Patrice L. R",
						"creatorType": "author"
					}
				],
				"date": "2006",
				"ISSN": "1477-464X",
				"issue": "1",
				"libraryCatalog": "Project MUSE",
				"pages": "121-164",
				"publicationTitle": "Past & Present",
				"url": "https://muse.jhu.edu/article/200965",
				"volume": "191",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
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
		"url": "https://muse.jhu.edu/issue/597",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://muse.jhu.edu/book/785",
		"items": [
			{
				"itemType": "book",
				"title": "Writing the Forest in Early Modern England: A Sylvan Pastoral Nation",
				"creators": [
					{
						"lastName": "Theis",
						"firstName": "Jeffrey S.",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"ISBN": "9780820705057",
				"abstractNote": "In Writing the Forest in Early Modern England: A Sylvan Pastoral Nation, Jeffrey S. Theis focuses on pastoral literature in early modern England as an emerging form of nature writing. In particular, Theis analyzes what happens when pastoral writing is set in forests — what he terms “sylvan pastoral.”\nDuring the sixteenth and seventeenth centuries, forests and woodlands played an instrumental role in the formation of individual and national identities in England. Although environmentalism as we know it did not yet exist, persistent fears of timber shortages led to a larger anxiety about the status of forests. Perhaps more important, forests were dynamic and contested sites of largely undeveloped spaces where the poor would migrate in a time of rising population when land became scarce. And in addition to being a place where the poor would go, the forest also was a playground for monarchs and aristocrats where they indulged in the symbolically rich sport of hunting.\nConventional pastoral literature, then, transforms when writers use it to represent and define forests and the multiple ways in which English society saw these places. In exploring these themes, authors expose national concerns regarding deforestation and forest law and present views relating to land ownership, nationhood, and the individual’s relationship to nature. Of particular interest are the ways in which cultures turn confusing spaces into known places and how this process is shaped by nature, history, gender, and class.\nTheis examines the playing out of these issues in familiar works by Shakespeare, such as A Midsummer Night’s Dream, The Merry Wives of Windsor, and As You Like It, Andrew Marvell’s “Upon Appleton House,” John Milton’s Mask and Paradise Lost, as well as in lesser known prose works of the English Revolution, such as James Howell’s Dendrologia>/i> and John Evelyn’s Sylva.\nAs a unique ecocritical study of forests in early modern English literature, Writing the Forest makes an important contribution to the growing field of the history of environmentalism, and will be of interest to those working in literary and cultural history as well as philosophers concerned with nature and space theory.",
				"libraryCatalog": "Project MUSE",
				"place": "Pittsburgh",
				"publisher": "Duquesne University Press",
				"shortTitle": "Writing the Forest in Early Modern England",
				"url": "https://muse.jhu.edu/book/785",
				"attachments": [
					{
						"title": "Cover",
						"mimeType": "application/pdf"
					},
					{
						"title": "Title Page, Copyright",
						"mimeType": "application/pdf"
					},
					{
						"title": "CONTENTS",
						"mimeType": "application/pdf"
					},
					{
						"title": "FIGURES",
						"mimeType": "application/pdf"
					},
					{
						"title": "ACKNOWLEDGMENTS",
						"mimeType": "application/pdf"
					},
					{
						"title": "INTRODUCTION: Sylvan Pastoral in Early Modern England",
						"mimeType": "application/pdf"
					},
					{
						"title": "ONE. The Rise of Sylvan Pastoral: LITERARY FORM MEETS FOREST HISTORY",
						"mimeType": "application/pdf"
					},
					{
						"title": "Part I. Sylvan Pastoral, Shakespeare, and 1590s England",
						"mimeType": "application/pdf"
					},
					{
						"title": "TWO. Shakespeare’s Green Plot: THE STAGE AS FOREST AND THE FOREST AS STAGE IN AS YOU LIKE IT",
						"mimeType": "application/pdf"
					},
					{
						"title": "THREE. Green Plots and Green Plotters: A MIDSUMMER NIGHT’S DREAM AND SYLVAN STRUGGLE",
						"mimeType": "application/pdf"
					},
					{
						"title": "FOUR. A Border Skirmish: COMMUNITY, DEER POACHING, AND SPATIAL TRANSGRESSION IN THE MERRY WIVES OF WINDSOR",
						"mimeType": "application/pdf"
					},
					{
						"title": "Part II. Forest Knowledge/Forest Power: Sylvan Pastoral in Mid-Seventeenth Century England",
						"mimeType": "application/pdf"
					},
					{
						"title": "FIVE. Sylvan Pastoral and the Civil War: REPRESENTING NATIONAL TRAUMA IN SYLVAN TERMS",
						"mimeType": "application/pdf"
					},
					{
						"title": "SIX. Royalist Woods",
						"mimeType": "application/pdf"
					},
					{
						"title": "SEVEN. John Milton’s Sylvan Pastorals and the Theatrical and Godly Individual",
						"mimeType": "application/pdf"
					},
					{
						"title": "NOTES",
						"mimeType": "application/pdf"
					},
					{
						"title": "BIBLIOGRAPHY",
						"mimeType": "application/pdf"
					},
					{
						"title": "INDEX",
						"mimeType": "application/pdf"
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
		"url": "https://muse.jhu.edu/article/530509",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Pill at Fifty: Scientific Commemoration and the Politics of American Memory",
				"creators": [
					{
						"lastName": "Prescott",
						"firstName": "Heather",
						"creatorType": "author"
					}
				],
				"date": "2013",
				"DOI": "10.1353/tech.2013.0137",
				"ISSN": "1097-3729",
				"abstractNote": "This article uses coverage of the fiftieth anniversary of the Pill as an example of what Richard Hirsh describes as the “real world” role of historians of technology. It explores how the presentation of historical topics on the world wide web has complicated how the history of technology is conveyed to the public. The article shows that that the Pill is especially suited to demonstrating the public role of historians of technology because, as the most popular form of reversible birth control, it has touched the lives of millions of Americans. Thus, an exploration of how the Pill’s fiftieth anniversary was covered illustrates how historians can use their expertise to provide a nuanced interpretation of a controversial topic in the history of technology.",
				"issue": "4",
				"libraryCatalog": "Project MUSE",
				"pages": "735-745",
				"publicationTitle": "Technology and Culture",
				"shortTitle": "The Pill at Fifty",
				"url": "https://muse.jhu.edu/article/530509",
				"volume": "54",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
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
		"url": "https://muse.jhu.edu/article/551992",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Accountability and Corruption in Argentina During the Kirchners’ Era",
				"creators": [
					{
						"lastName": "Manzetti",
						"firstName": "Luigi",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"DOI": "10.1353/lar.2014.0030",
				"ISSN": "1542-4278",
				"abstractNote": "This article highlights an important paradox: in Argentina between 2003 and 2013 the center-left Peronist government’s approach to governance mirrors that of the center-right Peronist administration of the 1990s. While the latter centralized authority to pursue neoliberal reforms, the former have centralized authority in the name of expanding government intervention in the economy. In both cases, corruption has tended to go unchecked due to insufficient government accountability. Therefore, although economic policies and political rhetoric have changed dramatically, government corruption remains a constant of the Argentine political system due to the executive branch’s ability to emasculate constitutional checks and balances.",
				"issue": "2",
				"libraryCatalog": "Project MUSE",
				"pages": "173-195",
				"publicationTitle": "Latin American Research Review",
				"url": "https://muse.jhu.edu/article/551992",
				"volume": "49",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
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
		"url": "https://muse.jhu.edu/article/762340",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "American Judaism and the Second Vatican Council: The Response of the American Jewish Committee to Nostra Aetate",
				"creators": [
					{
						"lastName": "Dziaczkowska",
						"firstName": "Magdalena",
						"creatorType": "author"
					}
				],
				"date": "2020",
				"DOI": "10.1353/cht.2020.0018",
				"ISSN": "1947-8224",
				"abstractNote": "During the Second Vatican Council, American Jewish community members impacted the drafting of the declaration on the Catholic Church's attitude toward Jews and Judaism. This article explores the American Jewish Committee's reactions to the drafting and promulgation of the Declaration on the Relation of the Church with Non-Christian Religions (Nostra Aetate) and its contribution to establishing interfaith relations. The varied Jewish reactions to the declaration provide insight into the internal Jewish discussions regarding Nostra Aetate, revealing that even though the declaration is assessed positively today, initial Jewish reactions were not enthusiastic.",
				"issue": "3",
				"libraryCatalog": "Project MUSE",
				"pages": "25-47",
				"publicationTitle": "U.S. Catholic Historian",
				"shortTitle": "American Judaism and the Second Vatican Council",
				"url": "https://muse.jhu.edu/article/762340",
				"volume": "38",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": " Abram"
					},
					{
						"tag": " American Jewish Committee"
					},
					{
						"tag": " Bea"
					},
					{
						"tag": " Cardinal Augustin"
					},
					{
						"tag": " Declaration on the Relation of the Church with Non-Christian Religions"
					},
					{
						"tag": " Jewish-Catholic relations"
					},
					{
						"tag": " Marc"
					},
					{
						"tag": " Morris B."
					},
					{
						"tag": " Second Vatican Council"
					},
					{
						"tag": " Tanenbaum"
					},
					{
						"tag": " interreligious dialogue"
					},
					{
						"tag": "Nostra Aetate"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
