{
	"translatorID": "2e1c09a0-3006-11de-8c30-0800200c9a66",
	"label": "Euclid",
	"creator": "Guy Freeman and Avram Lyon",
	"target": "^https?://[^/]*projecteuclid\\.org[^/]*/",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-06-05 07:32:38"
}

/*
	Translator
   Copyright (C) 2014 Sebastian Karcher

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
			
	multxpath = '//div[@class="article-item"]/span[@class="title"]|//div[@class="result"]/h3'
	
	if (ZU.xpath(doc, multxpath).length>0){
		return "multiple";
	}
	return false;
}


function doWeb(doc,url)
{
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		resultxpath = '//div[@class="article-item"]/span[@class="title"]/a|//div[@class="result"]/h3/a'
		var results = ZU.xpath(doc, resultxpath);
		for (var i in results) {
			hits[results[i].href] = results[i].textContent;
		}
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, doWeb);
		});
	} else {
		var abstract = ZU.xpathText(doc, '//div[@class="abstract-text"]');
		var DOI = ZU.xpathText(doc, '//div[@id="info"]/p[strong[contains(text(), "Digital Object")]]/text()');
		var journalAbbr = ZU.xpathText(doc, '//ul[@class="citation"]/li[1]/a')
		var translator = Zotero.loadTranslator('web');
		//use Embedded Metadata
		translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
		translator.setDocument(doc);
		translator.setHandler('itemDone', function(obj, item) {
			if (abstract) item.abstractNote = abstract.replace(/\s\s+/g, " ").replace(/\n/g, " ");
			if (DOI) item.DOI = DOI.replace(/doi:\s*/, "");
			item.journalAbbreviation = journalAbbr;
			item.extra = '';
			var mrnumber = ZU.xpathText(doc, '//div[@id="info"]/p[strong[contains(text(), "Mathematical Reviews number")]]/a');
			if (mrnumber) {
				item.extra = 'MR: ' + ZU.trimInternal(mrnumber)
			}
			var zbl = ZU.xpathText(doc, '//div[@id="info"]/p[strong[contains(text(), "Zentralblatt MATH")]]/a');
			if (zbl) {
				if (item.extra) item.extra += '\n';
				item.extra += 'Zbl: ' + ZU.trimInternal(zbl);
			}
			item.libraryCatalog = "Project Euclid"
			item.complete();
		});
		translator.translate();
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://projecteuclid.org/DPubS?service=UI&version=1.0&verb=Display&handle=euclid.jsl/1309952534",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Low5 Boolean subalgebras and computable copies",
				"creators": [
					{
						"firstName": "Russell",
						"lastName": "Miller",
						"creatorType": "author"
					}
				],
				"date": "2011-09",
				"DOI": "10.2178/jsl/1309952534",
				"ISSN": "0022-4812, 1943-5886",
				"abstractNote": "It is known that the spectrum of a Boolean algebra cannot contain a low4 degree unless it also contains the degree 0; it remains open whether the same holds for low5 degrees. We address the question differently, by considering Boolean subalgebras of the computable atomless Boolean algebra ℬ. For such subalgebras 𝒜, we show that it is possible for the spectrum of the unary relation 𝒜 on ℬ to contain a low5 degree without containing 0.",
				"extra": "MR: MR2849259\nZbl: 1305.03035",
				"issue": "3",
				"journalAbbreviation": "J. Symbolic Logic",
				"language": "EN",
				"libraryCatalog": "Project Euclid",
				"pages": "1061-1074",
				"publicationTitle": "Journal of Symbolic Logic",
				"url": "http://projecteuclid.org/euclid.jsl/1309952534",
				"volume": "76",
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
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://projecteuclid.org/DPubS?service=UI&version=1.0&verb=Display&handle=euclid.aoas/1310562719",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "State-space solutions to the dynamic magnetoencephalography inverse problem using high performance computing",
				"creators": [
					{
						"firstName": "Christopher J.",
						"lastName": "Long",
						"creatorType": "author"
					},
					{
						"firstName": "Patrick L.",
						"lastName": "Purdon",
						"creatorType": "author"
					},
					{
						"firstName": "Simona",
						"lastName": "Temereanca",
						"creatorType": "author"
					},
					{
						"firstName": "Neil U.",
						"lastName": "Desai",
						"creatorType": "author"
					},
					{
						"firstName": "Matti S.",
						"lastName": "Hämäläinen",
						"creatorType": "author"
					},
					{
						"firstName": "Emery N.",
						"lastName": "Brown",
						"creatorType": "author"
					}
				],
				"date": "2011-06",
				"DOI": "10.1214/11-AOAS483",
				"ISSN": "1932-6157, 1941-7330",
				"abstractNote": "Determining the magnitude and location of neural sources within the brain that are responsible for generating magnetoencephalography (MEG) signals measured on the surface of the head is a challenging problem in functional neuroimaging. The number of potential sources within the brain exceeds by an order of magnitude the number of recording sites. As a consequence, the estimates for the magnitude and location of the neural sources will be ill-conditioned because of the underdetermined nature of the problem. One well-known technique designed to address this imbalance is the minimum norm estimator (MNE). This approach imposes an L2 regularization constraint that serves to stabilize and condition the source parameter estimates. However, these classes of regularizer are static in time and do not consider the temporal constraints inherent to the biophysics of the MEG experiment. In this paper we propose a dynamic state-space model that accounts for both spatial and temporal correlations within and across candidate intracortical sources. In our model, the observation model is derived from the steady-state solution to Maxwell’s equations while the latent model representing neural dynamics is given by a random walk process. We show that the Kalman filter (KF) and the Kalman smoother [also known as the fixed-interval smoother (FIS)] may be used to solve the ensuing high-dimensional state-estimation problem. Using a well-known relationship between Bayesian estimation and Kalman filtering, we show that the MNE estimates carry a significant zero bias. Calculating these high-dimensional state estimates is a computationally challenging task that requires High Performance Computing (HPC) resources. To this end, we employ the NSF Teragrid Supercomputing Network to compute the source estimates. We demonstrate improvement in performance of the state-space algorithm relative to MNE in analyses of simulated and actual somatosensory MEG experiments. Our findings establish the benefits of high-dimensional state-space modeling as an effective means to solve the MEG source localization problem.",
				"extra": "MR: MR2849772\nZbl: 1223.62160",
				"issue": "2B",
				"journalAbbreviation": "Ann. Appl. Stat.",
				"language": "EN",
				"libraryCatalog": "Project Euclid",
				"pages": "1207-1228",
				"publicationTitle": "The Annals of Applied Statistics",
				"url": "http://projecteuclid.org/euclid.aoas/1310562719",
				"volume": "5",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Kalman filter",
					"Magnetoencephalography",
					"fixed interval smoother",
					"source localization"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://projecteuclid.org/euclid.aoas/1380804792",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://projecteuclid.org/search_result?type=index&q.s=Karcher&resultPage=1",
		"items": "multiple"
	}
]
/** END TEST CASES **/