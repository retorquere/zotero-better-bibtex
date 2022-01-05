{
	"translatorID": "a14301dc-be1c-4f34-bcaa-1b53b08ce80d",
	"label": "Emerald Insight",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.emerald\\.com/insight/(publication/|content/|search\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-12-25 15:35:07"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2019 Sebastian Karcher
	
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
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}

function detectWeb(doc, url) {
	// ensure that we only detect where scrape will (most likely) work
	if (url.includes('/content/doi/') && (url.search(/\/(10\.[^#?/]+\/[^#?/]+)\//) != -1 || url.includes("/full"))) {
		if (attr(doc, 'meta[name="dc.Type"]', 'content') == "book-part") {
			return "bookSection";
		}
		else return "journalArticle";
	}
	else if (getSearchResults(doc, url, true)) {
		return "multiple";
	}
	return false;
}


function getSearchResults(doc, url, checkOnly) {
	var items = {};
	var found = false;
	var rows;
	if (url.includes("insight/search?")) {
		// search results
		rows = doc.querySelectorAll('h2>a.intent_link');
	}
	else {
		// journal issue or books,
		rows = doc.querySelectorAll('.intent_issue_item h4>a, li.intent_book_chapter>a');
	}
	for (let i = 0; i < rows.length; i++) {
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
		Zotero.selectItems(getSearchResults(doc, url, false), function (items) {
			if (!items) {
				return;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var DOI = url.match(/\/(10\.[^#?/]+\/[^#?/]+)\//);
	var risURL;
	if (DOI) {
		risURL = "/insight/content/doi/" + DOI[1] + "/full/ris";
	}
	else {
		Z.debug("can't find DOI, trying alternative approach for risURL");
		risURL = url.replace(/\/full.*/, "/full/ris");
	}
	// Z.debug(risURL);
	
	var pdfURL;
	// make this works on PDF pages
	if (url.includes("full/pdf?")) {
		pdfURL = url;
	}
	else {
		pdfURL = attr(doc, 'a.intent_pdf_link', 'href');
	}

	// Z.debug("pdfURL: " + pdfURL);
	ZU.doGet(risURL, function (response) {
		// they number authors in their RIS...
		response = response.replace(/A\d+\s+-/g, "AU  -");

		var abstract = doc.getElementById('abstract');
		var translator = Zotero.loadTranslator("import");
		var tags = doc.querySelectorAll('li .intent_text');
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(response);
		translator.setHandler("itemDone", function (obj, item) {
			if (pdfURL) {
				item.attachments.push({
					url: pdfURL,
					title: "Full Text PDF",
					mimeType: "application/pdf"
				});
			}
			else {
				item.attachments.push({
					title: "Snapshot",
					document: doc
				});
			}
			
			for (let tag of tags) {
				item.tags.push(tag.textContent);
			}
			
			var authorsNodes = doc.querySelectorAll("div > a.contrib-search");
			if (authorsNodes.length > 0) {
				// prefer the authors information from the website as it contains the last and first name separately
				// where the RIS data does not separate them correctly (it uses a space instead of comma)
				// but the editors are only part of the RIS data
				var authors = [];
				for (let author of authorsNodes) {
					authors.push({
						firstName: text(author, "span.given-names"),
						lastName: text(author, "span.surname"),
						creatorType: "author"
					});
				}
				var otherContributors = item.creators.filter(creator => creator.creatorType !== "author");
				item.creators = otherContributors.length !== 0 ? authors.concat(separateNames(otherContributors)) : authors;
			}
			else {
				Z.debug("No tags available for authors");
				item.creators = separateNames(item.creators);
			}

			if (item.date) {
				item.date = ZU.strToISO(item.date);
			}
			if (abstract) {
				item.abstractNote = ZU.trimInternal(abstract.textContent).replace(/^Abstract\s*/, "");
			}
			item.complete();
		});
		translator.translate();
	});
}

function separateNames(creators) {
	for (let i = 0; i < creators.length; i++) {
		var lastName = creators[i].lastName.split(" ");
		// Only authors are in the format lastname firstname in RIS
		// Other creators are firstname lastname
		if (!creators[i].firstName && lastName.length > 1) {
			if (creators[i].creatorType === "author") {
				creators[i].firstName = lastName.slice(1).join(" ");
				creators[i].lastName = lastName[0];
			}
			else {
				creators[i].firstName = lastName[0];
				creators[i].lastName = lastName.slice(1).join(" ");
			}
			delete creators[i].fieldMode;
		}
		delete creators[i].fieldMode;
	}
	return creators;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.emerald.com/insight/content/doi/10.1108/IJPH-07-2016-0028/full/html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Universal opt-out screening for hepatitis C virus (HCV) within correctional facilities is an effective intervention to improve public health",
				"creators": [
					{
						"lastName": "Morris",
						"creatorType": "author",
						"firstName": "Meghan D."
					},
					{
						"lastName": "Brown",
						"creatorType": "author",
						"firstName": "Brandon"
					},
					{
						"lastName": "Allen",
						"creatorType": "author",
						"firstName": "Scott A."
					}
				],
				"date": "2017-01-01",
				"DOI": "10.1108/IJPH-07-2016-0028",
				"ISSN": "1744-9200",
				"abstractNote": "Purpose Worldwide efforts to identify individuals infected with the hepatitis C virus (HCV) focus almost exclusively on community healthcare systems, thereby failing to reach high-risk populations and those with poor access to primary care. In the USA, community-based HCV testing policies and guidelines overlook correctional facilities, where HCV rates are believed to be as high as 40 percent. This is a missed opportunity: more than ten million Americans move through correctional facilities each year. Herein, the purpose of this paper is to examine HCV testing practices in the US correctional system, California and describe how universal opt-out HCV testing could expand early HCV detection, improve public health in correctional facilities and communities, and prove cost-effective over time. Design/methodology/approach A commentary on the value of standardizing screening programs across facilities by mandating all facilities (universal) to implement opt-out testing policies for all prisoners upon entry to the correctional facilities. Findings Current variability in facility-level testing programs results in inconsistent testing levels across correctional facilities, and therefore makes estimating the actual number of HCV-infected adults in the USA difficult. The authors argue that universal opt-out testing policies ensure earlier diagnosis of HCV among a population most affected by the disease and is more cost-effective than selective testing policies. Originality/value The commentary explores the current limitations of selective testing policies in correctional systems and provides recommendations and implications for public health and correctional organizations.",
				"issue": "3/4",
				"libraryCatalog": "Emerald Insight",
				"pages": "192-199",
				"publicationTitle": "International Journal of Prisoner Health",
				"url": "https://doi.org/10.1108/IJPH-07-2016-0028",
				"volume": "13",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "California"
					},
					{
						"tag": "Criminal justice system"
					},
					{
						"tag": "Epidemiology"
					},
					{
						"tag": "HCV testing"
					},
					{
						"tag": "Hepatitis C virus (HCV)"
					},
					{
						"tag": "Public health"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.emerald.com/insight/search?q=testing&advanced=true&openAccess=true",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.emerald.com/insight/content/doi/10.1108/S1085-462220150000016007/full/html",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Creating a Cheat-Proof Testing and Learning Environment: A Unique Testing Opportunity for Each Student",
				"creators": [
					{
						"lastName": "Menk",
						"creatorType": "author",
						"firstName": "K. Bryan"
					},
					{
						"lastName": "Malone",
						"creatorType": "author",
						"firstName": "Stephanie"
					}
				],
				"date": "2015-01-01",
				"ISBN": "9781784415877 9781784415884",
				"abstractNote": "Originality/value This technique creates opportunities for students to have unique assignments encouraging student to student teaching and can be applied to assignments in any accounting course (undergraduate and graduate). This testing method has been used in Intermediate I and II, Individual Taxation, and Corporate Taxation.",
				"bookTitle": "Advances in Accounting Education: Teaching and Curriculum Innovations",
				"extra": "DOI: 10.1108/S1085-462220150000016007",
				"libraryCatalog": "Emerald Insight",
				"pages": "133-161",
				"publisher": "Emerald Group Publishing Limited",
				"series": "Advances in Accounting Education",
				"shortTitle": "Creating a Cheat-Proof Testing and Learning Environment",
				"url": "https://doi.org/10.1108/S1085-462220150000016007",
				"volume": "16",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Accounting education"
					},
					{
						"tag": "Tax"
					},
					{
						"tag": "Testing procedures"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.emerald.com/insight/publication/issn/0140-9174/vol/32/iss/12",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.emerald.com/insight/content/doi/10.1108/00070700410528754/full/html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The influence of context upon consumer sensory evaluation of chicken‐meat quality",
				"creators": [
					{
						"lastName": "Kennedy",
						"creatorType": "author",
						"firstName": "Orla"
					},
					{
						"lastName": "Stewart‐Knox",
						"creatorType": "author",
						"firstName": "Barbara"
					},
					{
						"lastName": "Mitchell",
						"creatorType": "author",
						"firstName": "Peter"
					},
					{
						"lastName": "Thurnham",
						"creatorType": "author",
						"firstName": "David"
					}
				],
				"date": "2004-01-01",
				"DOI": "10.1108/00070700410528754",
				"ISSN": "0007-070X",
				"abstractNote": "There is an apparent lack of research investigating how different test conditions influence or bias consumer sensory evaluation of food. The aim of the present pilot study was to determine if testing conditions had any effect on responses of an untrained panel to a novel chicken product. Assessments of flavour, texture and overall liking of corn‐fed chicken were made across three different testing conditions (laboratory‐based under normal lighting; laboratory‐based under controlled lighting; and, home testing). Least favourable evaluations occurred under laboratory‐based conditions irrespective of what lighting was used. Consumers perceived the product more favourably in terms of flavour (p < 0.001), texture (p < 0.001) and overall preference (p < 0.001) when evaluated in the familiar setting of the home. Home testing produced more consistent assessments than under either of the two laboratory‐based test conditions. The results imply that home evaluation should be undertaken routinely in new food product development.",
				"issue": "3",
				"libraryCatalog": "Emerald Insight",
				"pages": "158-165",
				"publicationTitle": "British Food Journal",
				"url": "https://doi.org/10.1108/00070700410528754",
				"volume": "106",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Food products"
					},
					{
						"tag": "Poultry"
					},
					{
						"tag": "Sensory perception"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.emerald.com/insight/content/doi/10.1108/S0163-786X(2012)0000033008/full/html",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Media Framing of the Pittsburgh G-20 Protests",
				"creators": [
					{
						"lastName": "Kutz-Flamenbaum",
						"creatorType": "author",
						"firstName": "Rachel V."
					},
					{
						"lastName": "Staggenborg",
						"creatorType": "author",
						"firstName": "Suzanne"
					},
					{
						"lastName": "Duncan",
						"creatorType": "author",
						"firstName": "Brittany J."
					},
					{
						"lastName": "Earl",
						"creatorType": "editor",
						"firstName": "Jennifer"
					},
					{
						"lastName": "A. Rohlinger",
						"creatorType": "editor",
						"firstName": "Deana"
					}
				],
				"date": "2012-01-01",
				"ISBN": "9781780528816 9781780528809",
				"abstractNote": "Research implications – We argue that events such as the G-20 meetings provide protesters with opportunities to gain temporary “standing” with the media. During such times, activists can use tactics and frames to alter the balance of power in relations with the media and the state and to attract positive media coverage, particularly when activists develop strategies that are not exclusively focused on the media. We argue that a combination of political opportunities and activist media strategies enabled protest organizers to position themselves as central figures in the G-20 news story and leverage that position to build media interest, develop relationships with reporters, and influence newspaper coverage.",
				"bookTitle": "Media, Movements, and Political Change",
				"extra": "DOI: 10.1108/S0163-786X(2012)0000033008",
				"libraryCatalog": "Emerald Insight",
				"pages": "109-135",
				"publisher": "Emerald Group Publishing Limited",
				"series": "Research in Social Movements, Conflicts and Change",
				"url": "https://doi.org/10.1108/S0163-786X(2012)0000033008",
				"volume": "33",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Anarchist(s)"
					},
					{
						"tag": "Framing"
					},
					{
						"tag": "G-20"
					},
					{
						"tag": "Media strategy"
					},
					{
						"tag": "Strategy"
					},
					{
						"tag": "Summit protests"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.emerald.com/insight/content/doi/10.1108/eb058217/full/html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Tourism research in Spain: The contribution of geography (1960–1995)",
				"creators": [
					{
						"lastName": "Antón i Clavé",
						"creatorType": "author",
						"firstName": "Salvador"
					},
					{
						"lastName": "López Palomeque",
						"creatorType": "author",
						"firstName": "Francisco"
					},
					{
						"lastName": "Marchena Gómez",
						"creatorType": "author",
						"firstName": "Manuel J."
					},
					{
						"lastName": "Vera Rebollo",
						"creatorType": "author",
						"firstName": "Sevilla"
					},
					{
						"lastName": "Fernando Vera Rebollo",
						"creatorType": "author",
						"firstName": "J."
					}
				],
				"date": "1996-01-01",
				"DOI": "10.1108/eb058217",
				"ISSN": "0251-3102",
				"abstractNote": "The Geography of Tourism in Spain is now at a par in terms of its scientific production with other European countries. Since the middle of the '80s the quality and volume of contributions is analogous to the rest of the European Union, although as a part of University Geography in Spain it has not achieved the level of dedication reached by other subjects considering the importance of tourist activities to the economy, the society and the territory of Spain. It could be said that the Geography of Tourism in Spain is in the international vanguard in dealing with Mediterranean coastal tourism, with the relationships between the residential real estate and tourism sectors and with aspects related to tourism and leisure in rural and protected areas.",
				"issue": "1",
				"libraryCatalog": "Emerald Insight",
				"pages": "46-64",
				"publicationTitle": "The Tourist Review",
				"shortTitle": "Tourism research in Spain",
				"url": "https://doi.org/10.1108/eb058217",
				"volume": "51",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Environment"
					},
					{
						"tag": "Geography of Leisure"
					},
					{
						"tag": "Regional Paradigms"
					},
					{
						"tag": "Rural"
					},
					{
						"tag": "Territory"
					},
					{
						"tag": "Tourism"
					},
					{
						"tag": "Tourism Real‐Estate"
					},
					{
						"tag": "Urban and Coastal Geography"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
