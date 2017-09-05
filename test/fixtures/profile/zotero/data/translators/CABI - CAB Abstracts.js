{
	"translatorID": "a29d22b3-c2e4-4cc0-ace4-6c2326144332",
	"label": "CABI - CAB Abstracts",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www\\.)?cabidirect\\.org/cabdirect",
	"minVersion": "3.0.4",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-14 03:41:30"
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

function detectWeb(doc, url) {
	if (url.indexOf('cabdirect/abstract/')>-1 || url.indexOf('cabdirect/FullTextPDF/')>-1) {
		//this isn't always right, but getting the item type from the page involves so much guessing as to be meaningless
		return "journalArticle";
	} else if (url.indexOf("cabdirect/search") != -1 && getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[@class="list-content"]/h2/a[contains(@href, "/abstract/")]');
	for (var i=0; i<rows.length; i++) {
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
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		//Code to get from PDF view to abstract view
		if (url.search(/\.pdf$/) != -1) {
			//get from the PDF to the item display;
			var itemid = url.match(/\/([^\/]+)\.pdf/);
			var itemurl = "/cabdirect/abstract/" + itemid[1];
			//Z.debug(itemurl)
			ZU.processDocuments(itemurl, scrape);
		}

		else scrape(doc, url);
	}
}

function scrape(doc, url) {
	var pdfurl = ZU.xpathText(doc, '//p[@class="btnabstract"]/a[contains(@href, ".pdf")]/@href');
	var abstract = ZU.xpathText(doc, '//div[@class="abstract"]');
	var editors = ZU.xpath(doc, '//p[contains(@id, "ulEditors")]/a');
	var itemid =  url.match(/\/([^\/]+)$/);
	//Z.debug (itemid)

	var post = "methodData=  %7B%22method%22%3A%22downloadRecords%22%2C%22items%22%3A%5B%7B%22type%22%3A%22AbstractMarkLogic%22%2C%22itemUrls%22%3A%5B%22%2Fcabdirect%2Fabstract%2F" +
					itemid[1] + "%22%5D%7D%5D%2C%22recordSource%22%3A%22SelectedRecords%22%2C%22pageSource%22%3A%22unknown%22%2C%22numberRange%22%3A%22%22%2C%22pageUrl%22%3A%22https%3A%2F%2Fwww.cabdirect.org%2Fcabdirect%2Fabstract%2F" +
					itemid[1] + "%22%7D&userPrefs=%7B%22format%22%3A%22RIS%22%2C%22downloadTarget%22%3A%22DownloadFile%22%2C%22portions%22%3A%22CitationAndAbstract%22%2C%22destination%22%3A%22EmailBodyText%22%2C%22exportEmail%22%3A%22%22%2C%22SavedRecordsPageSize%22%3A50%7D";
	var posturl = "/cabdirect/utility/cd4mycabiajaxhandler/";
		ZU.doPost(posturl, post, function (text) {
		//Z.debug(text)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			if (pdfurl) {
				item.attachments.push({
					url: pdfurl.href,
					title: "Full Text PDF",
					mimeType: "application/pdf"
				});
			}
			if (editors.length) {
				for (var i = 0; i<editors.length; i++ ) {
					item.creators.push(ZU.cleanAuthor(editors[i].textContent, "editor", true));
				}
			}
			if (item.notes.length) {
				//combine all notes into one
				var allNotes = [];
				for (var i = 0; i<item.notes.length; i++) {
					allNotes.push(item.notes[i]["note"]);
				}
				item.notes = [{"note": allNotes.join("")}];
			}
			if (item.itemType == "book" || item.itemType == "bookSection") {
				if (item.issue) {
					item.edition = item.issue;
					item.issue = "";
				}
			}
			item.url = url;
			//we want CAB in the library catalog field, not in archive
			item.archive = "";
			item.attachments.push({
				title: "Snapshot",
				document: doc
			});
			item.complete();
		});
		translator.translate();
		});

}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.cabdirect.org/cabdirect/search/?q=testing",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.cabdirect.org/cabdirect/abstract/20173015649",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Promoting partner testing and couples testing through secondary distribution of HIV self-tests: a randomized clinical trial.",
				"creators": [
					{
						"lastName": "Masters",
						"firstName": "S. H.",
						"creatorType": "author"
					},
					{
						"lastName": "Agot",
						"firstName": "K.",
						"creatorType": "author"
					},
					{
						"lastName": "Obonyo",
						"firstName": "B.",
						"creatorType": "author"
					},
					{
						"lastName": "Mavedzenge",
						"firstName": "S. N.",
						"creatorType": "author"
					},
					{
						"lastName": "Maman",
						"firstName": "S.",
						"creatorType": "author"
					},
					{
						"lastName": "Thirumurthy",
						"firstName": "H.",
						"creatorType": "author"
					}
				],
				"date": "2016",
				"ISSN": "1549-1277",
				"abstractNote": "Background: Achieving higher rates of partner HIV testing and couples testing among pregnant and postpartum women in sub-Saharan Africa is essential for the success of combination HIV prevention, including the prevention of mother-to-child transmission. We aimed to determine whether providing multiple HIV self-tests to pregnant and postpartum women for secondary distribution is more effective at promoting partner testing and couples testing than conventional strategies based on invitations to clinic-based testing. Methods and Findings: We conducted a randomized trial in Kisumu, Kenya, between June 11, 2015, and January 15, 2016. Six hundred antenatal and postpartum women aged 18-39 y were randomized to an HIV self-testing (HIVST) group or a comparison group. Participants in the HIVST group were given two oral-fluid-based HIV test kits, instructed on how to use them, and encouraged to distribute a test kit to their male partner or use both kits for testing as a couple. Participants in the comparison group were given an invitation card for clinic-based HIV testing and encouraged to distribute the card to their male partner, a routine practice in many health clinics. The primary outcome was partner testing within 3 mo of enrollment. Among 570 participants analyzed, partner HIV testing was more likely in the HIVST group (90.8%, 258/284) than the comparison group (51.7%, 148/286; difference=39.1%, 95% CI 32.4% to 45.8%, p&lt;0.001). Couples testing was also more likely in the HIVST group than the comparison group (75.4% versus 33.2%, difference=42.1%, 95% CI 34.7% to 49.6%, p&lt;0.001). No participants reported intimate partner violence due to HIV testing. This study was limited by self-reported outcomes, a common limitation in many studies involving HIVST due to the private manner in which self-tests are meant to be used. Conclusions: Provision of multiple HIV self-tests to women seeking antenatal and postpartum care was successful in promoting partner testing and couples testing. This approach warrants further consideration as countries develop HIVST policies and seek new ways to increase awareness of HIV status among men and promote couples testing.",
				"issue": "11",
				"journalAbbreviation": "PLoS Medicine",
				"language": "English",
				"libraryCatalog": "CABI - CAB Abstracts",
				"pages": "e1002166",
				"publicationTitle": "PLoS Medicine",
				"shortTitle": "Promoting partner testing and couples testing through secondary distribution of HIV self-tests",
				"url": "https://www.cabdirect.org/cabdirect/abstract/20173015649",
				"volume": "13",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<p>Author Affiliation: Department of Health Policy and Management, Gillings School of Global Public Health, University of North Carolina at Chapel Hill, Chapel Hill, North Carolina, USA.</p><p>Author Email: harsha@unc.edu</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.cabdirect.org/cabdirect/FullTextPDF/2016/20163134586.pdf",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Exploring factors associated with recent HIV testing among heterosexuals at high risk for HIV infection recruited with venue-based sampling.",
				"creators": [
					{
						"lastName": "Gwadz",
						"firstName": "M.",
						"creatorType": "author"
					},
					{
						"lastName": "Cleland",
						"firstName": "C. M.",
						"creatorType": "author"
					},
					{
						"lastName": "Jenness",
						"firstName": "S. M.",
						"creatorType": "author"
					},
					{
						"lastName": "Silverman",
						"firstName": "E.",
						"creatorType": "author"
					},
					{
						"lastName": "Hagan",
						"firstName": "H.",
						"creatorType": "author"
					},
					{
						"lastName": "Ritchie",
						"firstName": "A. S.",
						"creatorType": "author"
					},
					{
						"lastName": "Leonard",
						"firstName": "N. R.",
						"creatorType": "author"
					},
					{
						"lastName": "McCright-Gill",
						"firstName": "T.",
						"creatorType": "author"
					},
					{
						"lastName": "Martinez",
						"firstName": "B.",
						"creatorType": "author"
					},
					{
						"lastName": "Swain",
						"firstName": "Q.",
						"creatorType": "author"
					},
					{
						"lastName": "Kutnick",
						"firstName": "A.",
						"creatorType": "author"
					},
					{
						"lastName": "Sherpa",
						"firstName": "D.",
						"creatorType": "author"
					}
				],
				"date": "2016",
				"ISSN": "2155-6113",
				"abstractNote": "Annual HIV testing is recommended for high-risk populations in the United States, to identify HIV infections early and provide timely linkage to treatment. However, heterosexuals at high risk for HIV, due to their residence in urban areas of high poverty and elevated HIV prevalence, test for HIV less frequently than other risk groups, and late diagnosis of HIV is common. Yet the factors impeding HIV testing in this group, which is predominantly African American/Black and Latino/Hispanic, are poorly understood. The present study addresses this gap. Using a systematic community-based sampling method, venue-based sampling (VBS), we estimate rates of lifetime and recent (past year) HIV testing among high-risk heterosexuals (HRH), and explore a set of putative multi-level barriers to and facilitators of recent testing, by gender. Participants were 338 HRH African American/Black and Latino/Hispanic adults recruited using VBS, who completed a computerized structured assessment battery guided by the Theory of Triadic Influence, comprised of reliable/valid measures on socio-demographic characteristics, HIV testing history, and multi-level barriers to HIV testing. Logistic regression analysis was used to identify factors associated with HIV testing within the past year. Most HRH had tested at least once (94%), and more than half had tested within the past year (58%), but only 37% tested annually. In both men and women, the odds of recent testing were similar and associated with structural factors (better access to testing) and sexually transmitted infection (STI) testing and diagnosis. Thus VBS identified serious gaps in rates of annual HIV testing among HRH. Improvements in access to high-quality HIV testing and leveraging of STI testing are needed to increase the proportion of HRH testing annually for HIV. Such improvements could increase early detection of HIV, improve the long-term health of individuals, and reduce HIV transmission by increasing rates of viral suppression.",
				"issue": "2",
				"journalAbbreviation": "Journal of AIDS and Clinical Research",
				"language": "English",
				"libraryCatalog": "CABI - CAB Abstracts",
				"pages": "544",
				"publicationTitle": "Journal of AIDS and Clinical Research",
				"url": "https://www.cabdirect.org/cabdirect/abstract/20163134586",
				"volume": "7",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<p>Author Affiliation: Center for Drug Use and HIV Research (CDUHR), New York University College of Nursing, 433 First Avenue, Room 748, New York, NY 10010, USA.</p><p>Author Email: mg2890@nyu.edu</p>"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
