{
	"translatorID": "3bae3a55-f021-4b59-8a14-43701f336adf",
	"label": "Silverchair",
	"creator": "Sebastian Karcher",
	"target": "/(article|volume|proceeding|searchresults|issue)\\.aspx",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-11-12 10:02:49"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2012 Sebastian Karcher 
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	//concerned about false positives - make sure this is actualy Silverchair.
	var scm6 = ZU.xpathText(doc, '//body/@class|//script/@src');
	var multxpath = '//div[contains(@class, "resultBlock")]/a|//div[contains(@class, "articleTitle") or contains(@class, "articleSection")]/a[contains(@href, "articleid")  or contains(@href, "articleID")]';
	if (scm6){
		if (scm6.indexOf("SCM6")!=-1){
			if (url.search(/\/(article|proceeding)\.aspx\?articleid=\d+/i)!=-1) return "journalArticle";
			else if (url.indexOf("/searchresults.aspx?q=")!=-1 || url.indexOf("/issue.aspx")!=1  && ZU.xpathText(doc, multxpath)!=null) return "multiple";
	}
	}
	return false;
	}


function doWeb(doc, url){

	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") { 
		var items = {};
		var titles = doc.evaluate('//div[contains(@class, "resultBlock")]/a|//div[contains(@class, "articleTitle") or contains(@class, "articleSection")]/a[contains(@href, "articleid") or contains(@href, "articleID")]|//ul[contains(@class, "article")]//h4[contains(@class, "title")]/a', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent.trim();
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape, function () {
			});
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url){
	//get tags, Journal Abbreviation, and pdflink from google highwire metadata
	var pdflink = ZU.xpathText(doc, '//a[@id="hypPDFlink"]/@href')
		|| ZU.xpathText(doc, '//meta[@name="citation_pdf_url"]/@content');
	var tags = ZU.xpathText(doc, '//meta[@name="dc.Keywords"]/@content');
	var jabbr = ZU.xpathText(doc, '//meta[@name="citation_journal_abbrev"]/@content');
	var host = url.match(/http?\:\/\/[^\/]+/)[0];
	Z.debug(host);
	var articleid = url.match(/articleid=\d+/i)[0];
	Z.debug(articleid);
	
	var risurl=host +"/downloadCitation.aspx?format=ris&" +articleid;
	//we prefer the RIS because it consistently has abstracts.
	Z.debug(risurl)
	Zotero.Utilities.HTTP.doGet(risurl, function (text) {
		//remove extra DOI
		text = text.replace(/N1  - 10\..+/, "");
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			if (jabbr) item.journalAbbreviation = jabbr;
			if (tags){
				var tag = tags.split(/\s*;\s*/);
				for (var i in tag){
					item.tags[i] = tag[i];
				}
			}
			if (pdflink) item.attachments = [{url:pdflink, title: "Full Text PDF", mimeType: "application/pdf"}];
			item.complete();
		});	
		translator.translate();
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://opticalengineering.spiedigitallibrary.org/Issue.aspx?issueID=24229&direction=P",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://annals.org/article.aspx?articleid=1358680",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Flexible sigmoidoscopy screening reduced colorectal cancer incidence and mortality in older adults",
				"creators": [
					{
						"lastName": "Kahi",
						"firstName": "Charles J.",
						"creatorType": "author"
					},
					{
						"lastName": "Imperiale",
						"firstName": "Thomas F.",
						"creatorType": "author"
					}
				],
				"date": "September 18, 2012",
				"DOI": "10.7326/0003-4819-157-6-201209180-02003",
				"ISSN": "0003-4819",
				"abstractNote": "Question: In older adults, does screening with flexible sigmoidoscopy reduce colorectal cancer (CRC) incidence and mortality more than usual care?MethodsDesign: Randomized controlled trial (RCT) (Prostate, Lung, Colorectal, and Ovarian [PLCO] Cancer Screening Trial). ClinicalTrials.gov NCT00002540.Allocation: Concealed.*Blinding: Blinded* (cause of death adjudicators).Follow-up period: 13 years (mean 11 y).Setting: 10 screening centers in the USA.Participants: 154 900 participants 55 to 74 years of age (64% < 65 y, 50% women). Exclusion criteria included history of prostate, lung, colorectal, or ovarian cancer; ongoing treatment for cancer other than basal or squamous cell skin cancer; and after 1994, assessment using a lower endoscopic procedure in the past 3 years.Intervention: Screening with flexible sigmoidoscopy at baseline and at 3 or 5 years (n = 77 445) or usual care (n = 77 455).Outcomes: CRC mortality. Other outcomes included CRC incidence, all-cause mortality, and screening-related harms.Participant follow-up: 99.9% for vital status; compliance with annual study questionnaire was 94% (intention-to-screen analysis).Main results: In the screening group, 83% of participants had flexible sigmoidoscopy at baseline and 54% at 3 or 5 years, 29% had ≥ 1 positive result (mass or polyp detected), and 77% of those with positive results had colonoscopy within 1 year. Flexible sigmoidoscopy screening reduced risk for overall and distal CRC mortality more than usual care; groups did not differ for proximal CRC mortality or mortality from other causes, excluding prostate, lung, colorectal, or ovarian cancer (Table). Screening reduced risk for incident CRC, including distal and proximal cancer (Table). Among participants who had flexible sigmoidoscopy, 20% of men and 13% of women had false-positive results and the rate of perforation among these participants was 107.5 per 100 000 colonoscopies.Conclusion: In older adults, screening with flexible sigmoidoscopy reduced colorectal cancer incidence and mortality more than usual care.Colorectal cancer screening with flexible sigmoidoscopy vs usual care in older participants†Outcomes‡Events per 10 000 person-yAt a mean 11 y of follow-upSigmoidoscopyUsual careRRR (95% CI)NNS (CI)Colorectal cancer mortality2.93.926% (13 to 37)871 (567 to 1874)Distal colorectal cancer mortality1.02.050% (36 to 62)Not reportedProximal colorectal cancer mortality1.61.73% (−22 to 23)Not significantColorectal cancer121521% (15 to 28)282 (210 to 427)Distal colorectal cancer5.67.929% (20 to 36)Not reportedProximal colorectal cancer6.07.014% (3 to 24)Not reportedEvent rateMortality from other causes§11.8%12.0%2% (−1 to 4)Not significant†NNS = number needed to invite to screening; other abbreviations defined in Glossary. RRR and CI calculated from risk ratios in article.‡Distal cancer = cancer in the rectum through the splenic flexure; proximal cancer = cancer in the transverse colon through the cecum.§Excluding death from prostate, lung, colorectal, and ovarian cancers.",
				"accessDate": "CURRENT_TIMESTAMP",
				"issue": "6",
				"journalAbbreviation": "Ann Intern Med",
				"libraryCatalog": "Silverchair",
				"pages": "JC3-3",
				"publicationTitle": "Annals of Internal Medicine",
				"url": "http://dx.doi.org/10.7326/0003-4819-157-6-201209180-02003",
				"volume": "157",
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
		"url": "http://journal.publications.chestnet.org/issue.aspx",
		"items": "multiple"
	}
]
/** END TEST CASES **/