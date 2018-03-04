{
	"translatorID": "bd2e6136-d8e5-4f76-906b-0fbcd888dd63",
	"label": "RePEc - IDEAS",
	"creator": "Philipp Zumstein",
	"target": "^https?://ideas\\.repec\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-05 07:38:26"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Philipp Zumstein
	
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
	if (typeByUrl(url))  {
		return typeByUrl(url)
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function typeByUrl (url) {
	if (url.indexOf('/p/')>-1) {
		return "report";
	}
	else if (url.indexOf('/a/')>-1) {
		return "journalArticle";
	}
	else if (url.indexOf('/c/')>-1) {
		return "computerProgram";
	}
	else if (url.indexOf('/b/')>-1) {
		return "book";
	}
	else if (url.indexOf('/h/')>-1) {
		return "bookSection";
	}
	else return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//table[contains(@class, "res")]//span[contains(@class, "title")]/a|//ul[contains(@class, "paperlist")]//a');
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
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var type = typeByUrl(url);
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	//translator.setDocument(doc);
	translator.setHandler('itemDone', function (obj, item) {
		if (type=="report" && item.publicationTitle) {
			item.seriesTitle = item.publicationTitle;
		}
		var pdfurl = ZU.xpathText(doc, '//form/input[@type="radio" and contains(@value, ".pdf")]/@value');
		if (pdfurl) {
			item.attachments.push({
				url: pdfurl,
				title: "Fullext PDF",
				type: "application/pdf"
			})
		}
		item.complete();
	});
	translator.getTranslatorObject(function(trans) {
		trans.itemType = type;
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://ideas.repec.org/cgi-bin/htsearch?q=informal+economy",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://ideas.repec.org/c/boc/bocode/s457392.html",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "MCMCLINEAR: Stata module for MCMC sampling of linear models",
				"creators": [
					{
						"firstName": "Sam",
						"lastName": "Schulhofer-Wohl",
						"creatorType": "author"
					}
				],
				"date": "2012/01/05",
				"abstractNote": "This package provides commands for Markov chain Monte Carlo (MCMC) sampling from the posterior distribution of linear models. Two models are provided in this version: a normal linear regression model (the Bayesian equivalent of regress), and a normal linear mixed model (the Bayesian equivalent of xtmixed).",
				"company": "Boston College Department of Economics",
				"libraryCatalog": "ideas.repec.org",
				"shortTitle": "MCMCLINEAR",
				"url": "https://ideas.repec.org/c/boc/bocode/s457392.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"MCMC",
					"Markov Chain Monte Carlo",
					"linear models",
					"mixed models",
					"posterior distribution",
					"regression"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ideas.repec.org/a/rjr/romjef/vy2003i1p86-97.html#statistics",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Causes And Size Of Informal Economy In Romania",
				"creators": [
					{
						"firstName": "Elena",
						"lastName": "Pelinescu",
						"creatorType": "author"
					}
				],
				"date": "2003",
				"abstractNote": "The paper aims to analyze the causes or the motivations of the households’ informal economy activities and to estimate the size of the Romanian informal economy. Using data for Romania, it was found that people perceived high taxes as the main cause of the informal activities. The data suggested that the subsistence motive represented the main reason for the households’ decision to operate in the informal economy. It was found that 36.1% of the interviewed households had incomes from a secondary job in 1996. The size of informal economy appears as different because of the method used for computation.",
				"issue": "1",
				"libraryCatalog": "ideas.repec.org",
				"pages": "86-97",
				"publicationTitle": "Journal for Economic Forecasting",
				"url": "https://ideas.repec.org/a/rjr/romjef/vy2003i1p86-97.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"decent income",
					"informal economy",
					"taxation"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ideas.repec.org/p/iza/izadps/dp6212.html",
		"items": [
			{
				"itemType": "report",
				"title": "How Immigrant Children Affect the Academic Achievement of Native Dutch Children",
				"creators": [
					{
						"firstName": "Asako",
						"lastName": "Ohinata",
						"creatorType": "author"
					},
					{
						"firstName": "Jan C.",
						"lastName": "van Ours",
						"creatorType": "author"
					}
				],
				"date": "2011/12",
				"abstractNote": "In this paper, we analyze how the share of immigrant children in the classroom affects the educational attainment of native Dutch children. Our analysis uses data from various sources, which allow us to characterize educational attainment in terms of reading literacy, mathematical skills and science skills. We do not find strong evidence of negative spill-over effects from immigrant children to native Dutch children. Immigrant children themselves experience negative language spill-over effects from a high share of immigrant children in the classroom but no spill-over effects on maths and science skills.",
				"institution": "Institute for the Study of Labor (IZA)",
				"libraryCatalog": "ideas.repec.org",
				"reportNumber": "6212",
				"seriesTitle": "IZA Discussion Papers",
				"url": "https://ideas.repec.org/p/iza/izadps/dp6212.html",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Fullext PDF",
						"type": "application/pdf"
					}
				],
				"tags": [
					"educational attainment",
					"immigrant children",
					"peer effects"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://ideas.repec.org/s/wbk/wbrwps.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://ideas.repec.org/h/cdp/diam02/200203.html",
		"items": [
			{
				"itemType": "bookSection",
				"title": "O banco de dados relativo ao acervo da freguesia de N. Sra. do Pilar de Ouro Preto: registros paroquiais e as possibilidades da pesquisa",
				"creators": [
					{
						"firstName": "Adalgisa Arantes",
						"lastName": "Campos",
						"creatorType": "author"
					},
					{
						"firstName": "Betânia G.",
						"lastName": "Figueiredo",
						"creatorType": "author"
					},
					{
						"firstName": "Francisco L. Teixeira",
						"lastName": "Vinhosa",
						"creatorType": "author"
					},
					{
						"firstName": "Jeaneth Xavier de",
						"lastName": "Araújo",
						"creatorType": "author"
					},
					{
						"firstName": "Marcos Aurélio de",
						"lastName": "Paula",
						"creatorType": "author"
					},
					{
						"firstName": "Miriam Moura",
						"lastName": "Lott",
						"creatorType": "author"
					},
					{
						"firstName": "Patrícia Porto de",
						"lastName": "Oliveira",
						"creatorType": "author"
					},
					{
						"firstName": "Flávia Cristiny de",
						"lastName": "Moura",
						"creatorType": "author"
					},
					{
						"firstName": "Tânia Mara Silva",
						"lastName": "Alves",
						"creatorType": "author"
					},
					{
						"firstName": "Gilson Brandão",
						"lastName": "Cheble",
						"creatorType": "author"
					}
				],
				"date": "2002",
				"abstractNote": "No abstract is available for this item.",
				"bookTitle": "Anais do X Seminário sobre a Economia Mineira [Proceedings of the 10th Seminar on the Economy of Minas Gerais]",
				"libraryCatalog": "ideas.repec.org",
				"publisher": "Cedeplar, Universidade Federal de Minas Gerais",
				"shortTitle": "O banco de dados relativo ao acervo da freguesia de N. Sra. do Pilar de Ouro Preto",
				"url": "https://ideas.repec.org/h/cdp/diam02/200203.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/