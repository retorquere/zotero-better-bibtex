{
	"translatorID": "b043e7ed-b921-4444-88af-2fcc39881ee2",
	"label": "Elsevier Health Journals",
	"creator": "Sebastian Karcher",
	"target": "/search/(quick|results)$|/article/[^/]+/(abstract|fulltext|references|images)$",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 250,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2014-04-03 15:57:35"
}

/*
	Translator
   Copyright (C) 2013 Sebastian Karcher

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
	
	var footer = doc.getElementById('footer');
	if(!footer) return;
	var elsevierLink = footer.getElementsByTagName('a')[0];
	if(!elsevierLink || elsevierLink.textContent.trim() != 'Elsevier') return;
	var xpath='//meta[@name="citation_journal_title"]';
		
	if (ZU.xpath(doc, xpath).length > 0) {
		return "journalArticle";
	}
			
	if (url.match(/\/search\/(results|quick)/)) {
		if (getMultiples(doc).length>0) return "multiple";
	}
	return false;
}

function getMultiples(doc) {
	var table = doc.getElementById('searchResult');
	return ZU.xpath(table, './tbody/tr/td[.//a[@class="viewoption" and @onclick and (normalize-space(text()) = "Full Text"\
					or normalize-space(text()) = "Abstract") and (contains(@onclick,"/fulltext") or contains(@onclick, "/abstract"))]]');
}

 
function doWeb(doc,url)
{
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		var results = getMultiples(doc)
		var link;
		for (var i in results) {
			link = ZU.xpathText(results[i], './/a[@class="viewoption" and contains(text(), "Full Text")]/@onclick');
			if (!link) link = ZU.xpathText(results[i], './/a[@class="viewoption" and contains(text(), "Abstract")]/@onclick');
			link = link.match(/http:\/\/.+(fulltext|abstract)/)[0];
			hits[link] = results[i].textContent.trim();
		}
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
		ZU.processDocuments(urls, doWeb);
		});
	} else {
		var abstract = ZU.xpathText(doc, '//div[@class="abstract"]/*[self::h3 or (self::p and not(self::p[@class="note"]))]', null, '\n');
		if (!abstract) abstract = ZU.xpathText(doc, '//div[@class="tContent"]/*[self::h3 or (self::p and not(self::p[@class="note"]))]', null, '\n');
		//Z.debug(abstract)
		var keywords = ZU.xpath(doc, '//div[@class="keywords"]/a');
		if (keywords.length==0) keywords = ZU.xpath(doc, '//div[@class="tContent"]/p/span[contains(@class, "keyword")]');
		// We call the Embedded Metadata translator to do the actual work
		var translator = Zotero.loadTranslator('web');
		//use Embedded Metadata
		translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
		translator.setDocument(doc);
		translator.setHandler('itemDone', function(obj, item) {
			var m;
			if(item.publicationTitle && (m = item.publicationTitle.match(/^(.+), (the)$/i) )){
				item.publicationTitle = m[2] + ' ' + m[1];
			}
			//correct UK dates
			if (item.date && item.date.search(/\d{2}\/\d{2}\/\d{4}/)!=-1){
				var dateregex = item.date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
				item.date = dateregex[3] + "-" + dateregex[2] + "-" + dateregex[1];
			}
			
			if (item.tags.length==0){
				for (var i in keywords){
					var kw = keywords[i].textContent.trim();
					if(kw) item.tags.push(kw);		
				}
			}
			item.abstractNote = abstract;
			item.complete();
		});
		translator.translate();
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.amjmed.com/article/S0002-9343(12)00352-X/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Jacques",
						"lastName": "Donzé",
						"creatorType": "author"
					},
					{
						"firstName": "Carole",
						"lastName": "Clair",
						"creatorType": "author"
					},
					{
						"firstName": "Balthasar",
						"lastName": "Hug",
						"creatorType": "author"
					},
					{
						"firstName": "Nicolas",
						"lastName": "Rodondi",
						"creatorType": "author"
					},
					{
						"firstName": "Gérard",
						"lastName": "Waeber",
						"creatorType": "author"
					},
					{
						"firstName": "Jacques",
						"lastName": "Cornuz",
						"creatorType": "author"
					},
					{
						"firstName": "Drahomir",
						"lastName": "Aujesky",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Accidental falls",
					"Adverse drug events",
					"Anticoagulants",
					"Hemorrhage",
					"Risk factor"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"title": "Risk of Falls and Major Bleeds in Patients on Oral Anticoagulation Therapy",
				"date": "2012-08-01",
				"publicationTitle": "The American Journal of Medicine",
				"volume": "125",
				"issue": "8",
				"publisher": "Elsevier",
				"DOI": "10.1016/j.amjmed.2012.01.033",
				"language": "English",
				"pages": "773-778",
				"ISSN": "0002-9343",
				"url": "http://www.amjmed.com/article/S000293431200352X/abstract",
				"libraryCatalog": "www.amjmed.com",
				"accessDate": "CURRENT_TIMESTAMP",
				"abstractNote": "Background\nThe risk of falls is the most commonly cited reason for not providing oral anticoagulation, although the risk of bleeding associated with falls on oral anticoagulants is still debated. We aimed to evaluate whether patients on oral anticoagulation with high falls risk have an increased risk of major bleeding.\nMethods\nWe prospectively studied consecutive adult medical patients who were discharged on oral anticoagulants. The outcome was the time to a first major bleed within a 12-month follow-up period adjusted for age, sex, alcohol abuse, number of drugs, concomitant treatment with antiplatelet agents, and history of stroke or transient ischemic attack.\nResults\nAmong the 515 enrolled patients, 35 patients had a first major bleed during follow-up (incidence rate: 7.5 per 100 patient-years). Overall, 308 patients (59.8%) were at high risk of falls, and these patients had a nonsignificantly higher crude incidence rate of major bleeding than patients at low risk of falls (8.0 vs 6.8 per 100 patient-years, P=.64). In multivariate analysis, a high falls risk was not statistically significantly associated with the risk of a major bleed (hazard ratio 1.09; 95% confidence interval, 0.54-2.21). Overall, only 3 major bleeds occurred directly after a fall (incidence rate: 0.6 per 100 patient-years).\nConclusions\nIn this prospective cohort, patients on oral anticoagulants at high risk of falls did not have a significantly increased risk of major bleeds. These findings suggest that being at risk of falls is not a valid reason to avoid oral anticoagulants in medical patients."
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.celltherapyjournal.org/article/S1465-3249(12)70632-1/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Sandrine",
						"lastName": "Meyer-Monard",
						"creatorType": "author"
					},
					{
						"firstName": "André",
						"lastName": "Tichelli",
						"creatorType": "author"
					},
					{
						"firstName": "Carolyn",
						"lastName": "Troeger",
						"creatorType": "author"
					},
					{
						"firstName": "Caroline",
						"lastName": "Arber",
						"creatorType": "author"
					},
					{
						"firstName": "De",
						"lastName": "Faveri",
						"creatorType": "author"
					},
					{
						"firstName": "Grazia",
						"lastName": "Nicoloso",
						"creatorType": "author"
					},
					{
						"firstName": "Alois",
						"lastName": "Gratwohl",
						"creatorType": "author"
					},
					{
						"firstName": "Eddy",
						"lastName": "Roosnek",
						"creatorType": "author"
					},
					{
						"firstName": "Daniel",
						"lastName": "Surbek",
						"creatorType": "author"
					},
					{
						"firstName": "Yves",
						"lastName": "Chalandon",
						"creatorType": "author"
					},
					{
						"firstName": "Olivier",
						"lastName": "Irion",
						"creatorType": "author"
					},
					{
						"firstName": "Damiano",
						"lastName": "Castelli",
						"creatorType": "author"
					},
					{
						"firstName": "Jakob",
						"lastName": "Passweg",
						"creatorType": "author"
					},
					{
						"firstName": "Vincent",
						"lastName": "Kindler",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"cell banking",
					"hematopoietic stem cell",
					"hydroxyethyl starch",
					"processing efficiency",
					"umbilical cord blood"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"title": "Initial cord blood unit volume affects mononuclear cell and CD34+ cell-processing efficiency in a non-linear fashion",
				"date": "February 2012",
				"publicationTitle": "Cytotherapy",
				"volume": "14",
				"issue": "2",
				"publisher": "Elsevier",
				"DOI": "10.3109/14653249.2011.634404",
				"pages": "215-222",
				"ISSN": "1465-3249",
				"url": "http://www.celltherapyjournal.org/article/S1465-3249(12)70632-1/abstract",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "www.celltherapyjournal.org",
				"abstractNote": "Background aims\nUmbilical cord blood (UCB) is a source of hematopoietic stem cells that initially was used exclusively for the hematopoietic reconstitution of pediatric patients. It is now suggested for use for adults as well, a fact that increases the pressure to obtain units with high cellularity. Therefore, the optimization of UCB processing is a priority.\nMethods\nThe present study focused on parameters influencing total nucleated cell (TNC), mononucleated cell (MNC) and CD34 + cell (CD34C) recovery after routine volume reduction of 1553 UCB units using hydroxyethyl starch-induced sedimentation with an automated device, under routine laboratory conditions.\nResults\nWe show that the unit volume rather than the TNC count significantly affects TNC, MNC and CD34C processing efficiency (PEf), and this in a non-linear fashion: when units were sampled according to the collection volume, including pre-loaded anticoagulant (gross volume), PEf increased up to a unit volume of 110–150mL and decreased thereafter. Thus units with initial gross volumes < 90mL and > 170mL similarly exhibited a poor PEf.\nConclusions\nThese data identify unit gross volume as a major parameter influencing PEf and suggest that fractionation of large units should be contemplated only when the resulting volume of split units is > 90mL."
			}
		]
	}
]
/** END TEST CASES **/