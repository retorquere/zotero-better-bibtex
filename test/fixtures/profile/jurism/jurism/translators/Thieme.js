{
	"translatorID": "abb72b5b-f807-4ff5-a324-ae1afea8a95a",
	"label": "Thieme",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?thieme-connect\\.com/products/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-10 22:59:37"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Philipp Zumstein
	
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


/*
  Other example:
    https://www.thieme-connect.de/DOI/DOI?10.1055/s-2008-1081006
  which does not save as a test
*/


function detectWeb(doc, url) {
	if (url.includes('/abstract/') || url.includes('/html/') || url.includes('/DOI/DOI?')) {
		return "journalArticle";
	}
	else if (url.includes('lookinside')) {
		return "bookSection";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a.articleTitle');
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
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) return;

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


function scrape(doc, _url) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		// delete leading zeros in pages and issue
		if (item.pages) {
			item.pages = item.pages.replace(/\b0+/g, '');
		}
		if (item.issue) {
			item.issue = item.issue.replace(/\b0+/g, '');
		}
		
		if (item.abstractNote) {
			item.abstractNote = ZU.cleanTags(item.abstractNote);
		}
		// add tags manually here
		var keywords = text(doc, '.articleKeywords');
		if (keywords) {
			item.tags = keywords.split('-').map(
				value => value.replace(/^\s*(Keywords|Schlüsselwörter)\n/, '').trim()
			);
		}
		
		item.complete();
	});

	translator.translate();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.thieme-connect.com/products/ejournals/abstract/10.1055/s-0038-1636965",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Epidemiologische Aspekte zum säkularen Trend bei Übergewicht und Adipositas bei Kindern und Jugendlichen",
				"creators": [
					{
						"firstName": "R.",
						"lastName": "Gausche",
						"creatorType": "author"
					},
					{
						"firstName": "C.",
						"lastName": "Beger",
						"creatorType": "author"
					},
					{
						"firstName": "U.",
						"lastName": "Spielau",
						"creatorType": "author"
					},
					{
						"firstName": "R.",
						"lastName": "Pfäffle",
						"creatorType": "author"
					},
					{
						"firstName": "A.",
						"lastName": "Körner",
						"creatorType": "author"
					},
					{
						"firstName": "W.",
						"lastName": "Kieß",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"DOI": "10.1055/s-0038-1636965",
				"ISSN": "1865-1739, 2567-6334",
				"abstractNote": "Die Datensammlung des Kinderärztenetzwerks CrescNet ermöglicht es, langfristige Veränderungen in der Entwicklung des Body Mass Index (BMI) bei Kindern und Jugendlichen nachzuweisen. Der BMI von Kindern und Jugendlichen liegt 2006 und 2016 deutlich erhöht gegenüber den Vergleichsdaten aus 1995. Für jüngere Kinder kann zwischen 2006 und 2016 eine leichte Abnahme nachgewiesen werden. Für ältere Kinder und Jugendliche besteht nach wie vor ein großer Handlungsbedarf in der Prävention von Übergewicht und in der Therapie von Adipositas. Verhältnisbezogene Präventionsansätze sollten favorisiert werden und mit Hilfe eines Monitorings von BMI in ihrer Wirksamkeit überprüft werden. The data collection CrescNet makes it possible to detect long-term changes of the Body Mass Index (BMI) development in children and adolescents. In 2006 and 2016 the BMI is significant higher than references from 1995 proposed. Only in early childhood a slight decrease of BMI between 2006 and 2016 was visible, whereas the BMI of juveniles and adolescents increased further. For juveniles and adolescents there is still a great need for action in the prevention of overweight and in the therapy of obesity. Settingbased prevention approaches should be favored and their effectiveness should be evaluated by means of monitoring by BMI.",
				"issue": "1",
				"language": "de",
				"libraryCatalog": "www.thieme-connect.com",
				"pages": "4-9",
				"publicationTitle": "Adipositas - Ursachen, Folgeerkrankungen, Therapie",
				"rights": "Schattauer GmbH",
				"url": "http://www.thieme-connect.de/DOI/DOI?10.1055/s-0038-1636965",
				"volume": "12",
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
					{
						"tag": "Adipositas bei Kindern und Jugendlichen"
					},
					{
						"tag": "Body Mass Index"
					},
					{
						"tag": "Datensammlung"
					},
					{
						"tag": "Retrospektive Studie"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.thieme-connect.com/products/ejournals/journal/10.1055/s-00034923",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.thieme-connect.com/products/all/search?query=zotero&radius=fulltext&option=AND&clearSavedProfileSearch=true",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.thieme-connect.com/products/ejournals/abstract/10.3415/VCOT-17-01-0018",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Comparison of Radiographic Measurements of the Femur in Yorkshire Terriers with and without Medial Patellar Luxation",
				"creators": [
					{
						"firstName": "Michal",
						"lastName": "Žilinčík",
						"creatorType": "author"
					},
					{
						"firstName": "Marián",
						"lastName": "Hluchý",
						"creatorType": "author"
					},
					{
						"firstName": "Ladislav",
						"lastName": "Takáč",
						"creatorType": "author"
					},
					{
						"firstName": "Valent",
						"lastName": "Ledecký",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"DOI": "10.3415/VCOT-17-01-0018",
				"ISSN": "0932-0814, 2567-6911",
				"abstractNote": "Objective This article aimed to compare measurements of anatomical angles of the femurs, based on radiography, in Yorkshire Terriers without or with various grades of medial patellar luxation (MPL) based on radiography.  Methods The skeletally mature Yorkshire Terrier dogs without MPL and with various grades of MPL were included in this prospective study. Cases with other orthopaedic disorders were excluded. For inclusion of the dog, it was required that standardized digital radiographs of both femurs in craniocaudal and axial directions were available. Measurements of the anatomical lateral proximal femoral angle, anatomical lateral distal femoral angle, femoral varus angle, anteversion angle and femoral inclination angle were performed.  Results Forty-two Yorkshire Terriers (84 hindlimbs) were included in the study. They were divided into five groups according to grade of MPL as healthy (n = 12), grade I (n = 9), grade II (n = 44), grade III (n = 10) and grade IV (n = 9) dogs. The anatomical lateral proximal femoral angle and anteversion angle were significantly lower in dogs with grade IV MPL, while anatomical lateral distal femoral angle and femoral varus angle were significantly higher. The femoral inclination angle values did not differ significantly.  Clinical Significance Yorkshire Terriers affected with grade IV MPL had severe femoral deformities or femoral varus and external rotation of the distal femur. Reference range can be used as an aid in diagnosis, determining indications and surgical planning for corrective osteotomy.",
				"issue": "1",
				"journalAbbreviation": "Vet Comp Orthop Traumatol",
				"language": "en",
				"libraryCatalog": "www.thieme-connect.com",
				"pages": "17-22",
				"publicationTitle": "Veterinary and Comparative Orthopaedics and Traumatology",
				"rights": "Schattauer GmbH Stuttgart",
				"url": "http://www.thieme-connect.de/DOI/DOI?10.3415/VCOT-17-01-0018",
				"volume": "31",
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
					{
						"tag": "bone deformity"
					},
					{
						"tag": "dogs"
					},
					{
						"tag": "patellar luxation"
					},
					{
						"tag": "radiography"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.thieme-connect.com/products/ebooks/lookinside/10.1055/b-0034-5719",
		"items": [
			{
				"itemType": "bookSection",
				"title": "4 Thorax (Pleura, Lunge)",
				"creators": [],
				"date": "2012",
				"ISBN": "9783131263476 9783131831170",
				"abstractNote": "Thieme E-Books & E-Journals",
				"bookTitle": "Allgemein- und Viszeralchirurgie essentials",
				"edition": "7., vollständig überarbeitete Auflage",
				"extra": "DOI: 10.1055/b-0034-5719",
				"language": "de",
				"libraryCatalog": "www.thieme-connect.com",
				"publisher": "Thieme Verlag",
				"rights": "© 2012 Georg Thieme Verlag KG",
				"url": "https://www.thieme-connect.com/products/ebooks/lookinside/10.1055/b-0034-5719",
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
					{
						"tag": "Orthopädie- und Unfallchirurgie"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
