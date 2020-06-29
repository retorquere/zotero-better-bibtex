{
	"translatorID": "1d84c107-9dbb-4b87-8208-e3632b87889f",
	"label": "zbMATH",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?zbmath\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2014-06-05 08:12:07"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	zbMATH Translator, Copyright © 2014 Philipp Zumstein
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
	if ( ZU.xpath(doc, '//div[@class="list"]/article').length>0 ) {
		return "multiple";
	} else if (ZU.xpath(doc, '//a[contains(@class, "bib")]').length>0 ) {//contains
		//it is a single entry --> generic fallback = journalArticle
		return "journalArticle";
	}
}

function scrape(doc, url) {
	var bibArray = doc.getElementsByClassName("bib");
	var bibUrl = bibArray[0].getAttribute('href');//e.g. "bibtex/06115874.bib"

	ZU.doGet(bibUrl, function(text) {
		//Z.debug(text);
		
		var trans = Zotero.loadTranslator('import');
		trans.setTranslator('9cb70025-a888-4a29-a210-93ec52da40d4');//https://github.com/zotero/translators/blob/master/BibTeX.js
		trans.setString(text);

		trans.setHandler('itemDone', function (obj, item) {
			
			item.title = item.title.replace(/\.$/, '');
			
			if (item.publisher) {
				var publisherSeperation = item.publisher.indexOf(":");
				if (publisherSeperation != -1) {
					item.place = item.publisher.substr(0,publisherSeperation);
					item.publisher = item.publisher.substr(publisherSeperation+1);
				}
			}
			
			//keywords are normally not in the bib file, so we take them from the page
			//moreover, the meaning of the MSC classification is also only given on the page
			if (item.tags.length==0 ) {
				var keywords = ZU.xpath(doc, '//div[@class="keywords"]/a');
				for (var i=0; i<keywords.length; i++) {
					item.tags.push( keywords[i].textContent );
				}
				var classifications = ZU.xpath(doc, '//div[@class="classification"]//tr');
				for (var i=0; i<classifications.length; i++) {
					item.extra = (item.extra ? item.extra + "\n" : '') + 'MSC2010: ' + ZU.xpathText(classifications[i], './td' , null , " = ");
				}
			}
			
			//add abstract but not review
			var abstractOrReview = ZU.xpathText(doc, '//div[@class="abstract"]');
			if (abstractOrReview.indexOf('Summary') == 0) {
				item.abstractNote = abstractOrReview.replace(/^Summary:?\s*/, '');
			}
			
			item.attachments = [{
				title: "Snapshot",
				document:doc
			}];

			var id = ZU.xpath(doc, '//div[@class="title"]/a[@class="label"]')[0];
			if (id) {
				if (!item.extra) item.extra = '';
				else item.extra += "\n";
				
				item.extra += 'Zbl: ' + ZU.trimInternal(id.textContent)
					.replace(/^\s*Zbl\s+/i, ''); //e.g. Zbl 1255.05045
				item.url = id.href;
			}
			
			item.complete();
			//Z.debug(item);
		});
		
		trans.translate();
	});

}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var articles = new Array();
		var rows = ZU.xpath(doc, '//div[@class="list"]/article');
		for (var i=0; i<rows.length; i++) {
			var title = ZU.xpathText(rows[i], './div[@class="title"]/a[1]');
			var link = ZU.xpathText(rows[i], './div[@class="title"]/a[1]/@href');
			items[link] = title;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.zbmath.org/?q=an:06115874",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Dan",
						"lastName": "Hefetz",
						"creatorType": "author"
					},
					{
						"firstName": "Michael",
						"lastName": "Krivelevich",
						"creatorType": "author"
					},
					{
						"firstName": "Tibor",
						"lastName": "Szabó",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"random graphs",
					"sharp thresholds",
					"spanning trees",
					"tree-universality"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"itemID": "zbMATH06115874",
				"journalAbbreviation": "Random Struct. Algorithms",
				"ISSN": "1042-9832; 1098-2418/e",
				"issue": "4",
				"language": "English",
				"DOI": "10.1002/rsa.20472",
				"extra": "MSC2010: 05C05 = Trees\nMSC2010: 05C80 = Random graphs\nZbl: 1255.05045",
				"abstractNote": "We prove that a given tree T on n vertices with bounded maximum degree is contained asymptotically almost surely in the binomial random graph Gn,(1+ε)logn n provided that T belongs to one of the following two classes: (1) T has linearly many leaves; (2) T has a path of linear length all of whose vertices have degree two in T.",
				"url": "https://www.zbmath.org/?q=an:1255.05045",
				"libraryCatalog": "zbMATH",
				"title": "Sharp threshold for the appearance of certain spanning trees in random graphs",
				"publicationTitle": "Random Structures & Algorithms",
				"volume": "41",
				"pages": "391–412",
				"date": "2012"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.zbmath.org/?q=se:00001331+ai:bollobas.bela",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://zbmath.org/?q=an:06212000",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Noga",
						"lastName": "Alon",
						"creatorType": "author"
					},
					{
						"firstName": "Erik D.",
						"lastName": "Demaine",
						"creatorType": "author"
					},
					{
						"firstName": "Mohammad T.",
						"lastName": "Hajiaghayi",
						"creatorType": "author"
					},
					{
						"firstName": "Tom",
						"lastName": "Leighton",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"equilibrium",
					"low diameter",
					"network creation",
					"network design",
					"price of anarchy"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"itemID": "zbMATH06212000",
				"journalAbbreviation": "SIAM J. Discrete Math.",
				"ISSN": "0895-4801; 1095-7146/e",
				"issue": "2",
				"language": "English",
				"DOI": "10.1137/090771478",
				"extra": "MSC2010: 90C27 = Combinatorial optimization\nMSC2010: 05C85 = Graph algorithms (graph theory)\nMSC2010: 91A06 = n-person games, n>2\nZbl: 1273.90167",
				"abstractNote": "We study a natural network creation game, in which each node locally tries to minimize its local diameter or its local average distance to other nodes by swapping one incident edge at a time. The central question is what structure the resulting equilibrium graphs have, in particular, how well they globally minimize diameter. For the local-average-distance version, we prove an upper bound of 2 O(lgn) , a lower bound of 3, and a tight bound of exactly 2 for trees, and give evidence of a general polylogarithmic upper bound. For the local-diameter version, we prove a lower bound of Ω(n) and a tight upper bound of 3 for trees. The same bounds apply, up to constant factors, to the price of anarchy. Our network creation games are closely related to the previously studied unilateral network creation game. The main difference is that our model has no parameter α for the link creation cost, so our results effectively apply for all values of α without additional effort; furthermore, equilibrium can be checked in polynomial time in our model, unlike in previous models. Our perspective enables simpler proofs that get at the heart of network creation games.",
				"url": "https://zbmath.org/?q=an:1273.90167",
				"libraryCatalog": "zbMATH",
				"title": "Basic network creation games",
				"publicationTitle": "SIAM Journal on Discrete Mathematics",
				"volume": "27",
				"pages": "656–668",
				"date": "2013"
			}
		]
	},
	{
		"type": "web",
		"url": "http://zbmath.org/?q=cc:35",
		"items": "multiple"
	}
];
/** END TEST CASES **/
