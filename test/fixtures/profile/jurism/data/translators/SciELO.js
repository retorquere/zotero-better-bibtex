{
	"translatorID": "3eabecf9-663a-4774-a3e6-0790d2732eed",
	"label": "SciELO",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www\\.)?(socialscience\\.|proceedings\\.|biodiversidade\\.|caribbean\\.|comciencia\\.|inovacao\\.|search\\.)?(scielo|scielosp)\\.",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-12-15 23:58:19"
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

	var xpath='//meta[@name="citation_journal_title"]';

	if (ZU.xpath(doc, xpath).length > 0) {
		return "journalArticle";
	}
			
	if (url.indexOf("search.")!=-1) {
		multxpath = '//div[@class="data"]/h3/a'
	
	if (ZU.xpath(doc, multxpath).length>0){
			return "multiple";
		}
	}
	return false;
}


function doWeb(doc,url)
{
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		rowsxpath = '//div[@class="record"]/div[@class="data"]'
		var rows = ZU.xpath(doc, rowsxpath);
		var title;
		var link;
		for (var i in rows) {
			title = ZU.xpathText(rows[i], './h3/a');
			link = ZU.xpathText(rows[i], './div[@class="user-actions"]/div/a/@href');
			hits[link] = title;
		}
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, doWeb);
		});
	} else {
		var abstract = ZU.xpathText(doc, '//div[@class="abstract"]')
		var translator = Zotero.loadTranslator('web');
		//use Embedded Metadata
		translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
		translator.setDocument(doc);
		translator.setHandler('itemDone', function(obj, item) {
			if(abstract) item.abstractNote = abstract.replace(/^\s*(ABSTRACT|RESUMO|RESUMEN)/, "").replace(/[\n\t]/g, "");
			item.libraryCatalog = "SciELO"
			item.complete();
		});
		translator.translate();
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.scielosp.org/scielo.php?script=sci_arttext&pid=S0034-89102007000900015&lang=pt",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "P. R.",
						"lastName": "Telles-Dias",
						"creatorType": "author"
					},
					{
						"firstName": "S.",
						"lastName": "Westman",
						"creatorType": "author"
					},
					{
						"firstName": "A. E.",
						"lastName": "Fernandez",
						"creatorType": "author"
					},
					{
						"firstName": "M.",
						"lastName": "Sanchez",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
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
				"title": "Perceptions of HIV rapid testing among injecting drug users in Brazil",
				"date": "12/2007",
				"publicationTitle": "Revista de Saúde Pública",
				"volume": "41",
				"publisher": "Faculdade de Saúde Pública da Universidade de São Paulo",
				"DOI": "10.1590/S0034-89102007000900015",
				"pages": "94-100",
				"ISSN": "0034-8910",
				"url": "http://www.scielosp.org/scielo.php?script=sci_abstract&pid=S0034-89102007000900015&lng=en&nrm=iso&tlng=pt",
				"libraryCatalog": "SciELO",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.scielo.br/scielo.php?script=sci_arttext&pid=S0104-62762002000200002&lang=pt",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Flavia",
						"lastName": "Freidenberg",
						"creatorType": "author"
					},
					{
						"firstName": "Francisco",
						"lastName": "Sánchez López",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
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
				"title": "How candidates for the Presidency are nominated?: Rules and procedures in the Latin American political parties",
				"date": "10/2002",
				"publicationTitle": "Opinião Pública",
				"volume": "8",
				"issue": "2",
				"publisher": "Universidade Estadual de Campinas",
				"DOI": "10.1590/S0104-62762002000200002",
				"pages": "158-188",
				"ISSN": "0104-6276",
				"url": "http://www.scielo.br/scielo.php?script=sci_abstract&pid=S0104-62762002000200002&lng=en&nrm=iso&tlng=pt",
				"libraryCatalog": "SciELO",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "How candidates for the Presidency are nominated?"
			}
		]
	},
	{
		"type": "web",
		"url": "http://search.scielo.org/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.scielo.br/scielo.php?script=sci_arttext&pid=S1413-35552013005000148&lang=pt",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Renato S.",
						"lastName": "Almeida",
						"creatorType": "author"
					},
					{
						"firstName": "Leandro A. C.",
						"lastName": "Nogueira",
						"creatorType": "author"
					},
					{
						"firstName": "Stephane",
						"lastName": "Bourliataux-Lajoine",
						"creatorType": "author"
					},
					{
						"firstName": "Renato S.",
						"lastName": "Almeida",
						"creatorType": "author"
					},
					{
						"firstName": "Leandro A. C.",
						"lastName": "Nogueira",
						"creatorType": "author"
					},
					{
						"firstName": "Stephane",
						"lastName": "Bourliataux-Lajoine",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
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
				"title": "Analysis of the user satisfaction level in a public physical therapy service",
				"date": "08/2013",
				"publicationTitle": "Brazilian Journal of Physical Therapy",
				"volume": "17",
				"issue": "4",
				"DOI": "10.1590/S1413-35552013005000097",
				"pages": "328-335",
				"ISSN": "1413-3555",
				"url": "http://www.scielo.br/scielo.php?script=sci_abstract&pid=S1413-35552013000400328&lng=en&nrm=iso&tlng=en",
				"libraryCatalog": "SciELO",
				"abstractNote": "BACKGROUND: The concepts of quality management have increasingly been introduced into the health sector. Methods to measure satisfaction and quality are examples of this trend.  OBJECTIVE: This study aimed to identify the level of customer satisfaction in a physical therapy department involved in the public area and to analyze the key variables that impact the usersâ€(tm) perceived quality. METHOD: A cross-sectional observational study was conducted, and 95 patients from the physical therapy department of the Hospital Universitário Gaffrée e Guinle - Universidade Federal do Estado do Rio de Janeiro (HUGG/UNIRIO) - Rio de Janeiro, Brazil, were evaluated by the SERVQUAL questionnaire. A brief questionnaire to identify the sociocultural profile of the patients was also performed.  RESULTS: Patients from this health service presented a satisfied status with the treatment, and the population final average value in the questionnaire was 0.057 (a positive value indicates satisfaction). There was an influence of the educational level on the satisfaction status (χ‡Â²=17,149; p=0.002). A correlation was found between satisfaction and the dimensions of tangibility (rho=0.56, p=0.05) and empathy (rho=0.46, p=0.01) for the Unsatisfied group. Among the Satisfied group, the dimension that was correlated with the final value of the SERVQUAL was responsiveness (rho=0.44, p=0.01).  CONCLUSIONS: The final values of the GGUH physical therapy department showed that patients can be satisfied even in a public health service. Satisfaction measures must have a multidimensional approach, and we found that people with more years of study showed lower values of satisfaction.Key words: health management; physical therapy; user satisfaction"
			}
		]
	}
]
/** END TEST CASES **/