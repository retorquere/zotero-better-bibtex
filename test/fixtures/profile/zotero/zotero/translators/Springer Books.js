{
	"translatorID": "b38a44f4-b8af-4553-9edf-fba4d2598d6a",
	"label": "Springer Books",
	"creator": "Jonathan Schulz",
	"target": "^https?://www\\.springer\\.com/\\w\\w/(book|search)\\W",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-02-04 17:10:25"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Jonathan Schulz
	
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
	var action = url.match(/^https?:\/\/[^\/]+\/[^\/]+\/([^\/?#]+)/);
	if (!action) return;
	switch (action[1]) {
		case "book":
			// test if any relevant <meta> information is available
			if (ZU.xpathText(doc, '//meta[@property="og:title"]/@content')) return "book";
			break;
		case "search":
			//test for relevant search entries
			return getSearchResults(doc, true) ? "multiple" : false;
	}
}


function doWeb(doc, url) {
	var detection_type = detectWeb(doc, url);
	switch (detection_type) {
		case "book":
			scrapeBook(doc, url);
			break;
		case "multiple":
			Zotero.selectItems(getSearchResults(doc, false), function (items) {
				if (!items) return true;
				var articles = [];
				for (var i in items) {
					articles.push(i);
				}
				ZU.processDocuments(articles, scrapeBook);
			});
			break;
	}
	
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var search_entries = ZU.xpath(doc, '//div[@id="result-list"]/div');
	for (var i=0; i<search_entries.length; i++) {
		var item_type = search_entries[i].getAttribute("class");
		//test if we actually have a usable result
		if (!item_type || item_type.search(/result-item-\d+/)==-1
			|| !item_type.includes('result-type-book')) continue;
		var title_link = ZU.xpath(search_entries[i], "h4/a");
		if (title_link.length === 0) continue;
		//extract book title and URL
		var title = title_link[0].textContent;
		var href = title_link[0].getAttribute("href");
		if (!title || !href) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function scrapeBook(doc, url) {
	//Call the embedded metadata translator
	var translator = Zotero.loadTranslator("web");
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler("itemDone", function(obj, item) {
		
		// From EM the item.title field looks like this:
		// item.title = <book title> | <first creator> | Springer
		item.title = ZU.xpathText(doc, '//h1');
		var subtitle = ZU.xpathText(doc, '//div[contains(@class, "bibliographic-information")]/h2');
		if (subtitle) item.title += ': ' + subtitle;
		
		// There are no creators in the Embedded Metadata and thus we need
		// to add them manually here.
		editors = ZU.xpathText(doc, '//li[@itemprop="editor"]/span');
		authors = ZU.xpathText(doc, '//li[@itemprop="author"]/span');
		if (editors) {
			editors = editors.split(", ");
			for (let i=0; i<editors.length; i++)
				item.creators.push(ZU.cleanAuthor(editors[i], "editor", editors[i].includes(',')));
		}
		if (authors) {
			authors = authors.split(", ");
			for (let i=0; i<authors.length; i++)
				item.creators.push(ZU.cleanAuthor(authors[i], "author", authors[i].includes(',')));
		}
		
		if (!item.publisher) {
			item.publisher = ZU.xpathText(doc, '//dd[@itemprop="publisher"]/span');
		}
		// see if we can seperate "Springer-Verlag <place>" into publisher and place
		if (item.publisher && item.publisher.search(/^Springer-Verlag\s.+/)!=-1) {
			var publisherInfo = item.publisher.match(/^(Springer-Verlag)\s(.+)/);
			item.publisher = publisherInfo[1];
			item.place = publisherInfo[2];
		}
		
		if (!item.ISBN) {
			item.ISBN = ZU.xpathText(doc, '//dd[@itemprop="isbn"]');
		}
		
		if (!item.year) {
			var yearField = ZU.xpathText(doc, '//div[@class="copyright"]');
			if (yearField) {
				item.date = yearField.replace('©', '');
			}
		}
		item.series = ZU.xpathText(doc, '//a[contains(@class, "series")]');
		
		var edition = ZU.xpathText(doc, '//dt[text()="Edition Number" or text()="Auflage"]/following-sibling::dd[1]');
		if (edition && edition !== "1") item.edition = edition;
		
		//The abstract note might be shortened in the <meta> field; try to load
		//the full abstract note
		var long_abstractNote = ZU.xpathText(doc, '(//div[@class="product-about"]//div[@class="springer-html"])[1]');
		if (long_abstractNote) {
			item.abstractNote = ZU.trimInternal(long_abstractNote);
		}

		item.complete();
	});
	translator.translate();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.springer.com/us/book/9783319633237",
		"items": [
			{
				"itemType": "book",
				"title": "Theoretical Physics 7: Quantum Mechanics - Methods and Applications",
				"creators": [
					{
						"firstName": "Wolfgang",
						"lastName": "Nolting",
						"creatorType": "author"
					}
				],
				"date": "2017",
				"ISBN": "9783319633237",
				"abstractNote": "This textbook offers a clear and comprehensive introduction to methods and applications in quantum mechanics, one of the core components of undergraduate physics courses. It follows on naturally from the previous volumes in this series, thus developing the understanding of quantized states further on. The first part of the book introduces the quantum theory of angular momentum and approximation methods. More complex themes are covered in the second part of the book, which describes multiple particle systems and scattering theory. Ideally suited to undergraduate students with some grounding in the basics of quantum mechanics, the book is enhanced throughout with learning features such as boxed inserts and chapter summaries, with key mathematical derivations highlighted to aid understanding. The text is supported by numerous worked examples and end of chapter problem sets. About the Theoretical Physics series Translated from the renowned and highly successful German editions, the eight volumes of this series cover the complete core curriculum of theoretical physics at undergraduate level. Each volume is self-contained and provides all the material necessary for the individual course topic. Numerous problems with detailed solutions support a deeper understanding. Wolfgang Nolting is famous for his refined didactical style and has been referred to as the \"German Feynman\" in reviews.",
				"language": "en",
				"libraryCatalog": "www.springer.com",
				"publisher": "Springer International Publishing",
				"shortTitle": "Theoretical Physics 7",
				"url": "//www.springer.com/us/book/9783319633237",
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
	},
	{
		"type": "web",
		"url": "http://www.springer.com/us/book/9789462094826",
		"items": [
			{
				"itemType": "book",
				"title": "Testing Times: A History of Vocational, Civil Service and Secondary Examinations in England since 1850",
				"creators": [
					{
						"firstName": "Willis",
						"lastName": "Richard",
						"creatorType": "author"
					}
				],
				"date": "2013",
				"ISBN": "9789462094826",
				"abstractNote": "This book focuses on the delivery of public examinations offered by the main examining boards in England since Victorian England. The investigation reveals that the provision of examinations was as controversial in the nineteenth century as it is today, particularly since the government is now determined to bring in reform. The issues of grade inflation, the place of coursework in marking, and the introduction of technological change all feature in this book. Educational policy is primarily examined as well as some reference to the global scene. The study analyses archival material from a wide range of sources, including those records stored at the National Archives and the London Metropolitan Archives. An emphasis is placed upon the various institutions that contributed to the process, including the Royal Society of Arts, the London Chamber of Commerce, the City of Guilds of London Institute and the University of London. Attention is given to the findings of the Taunton Commission and the Bryce Commission and shorter reports such as the Northcote-Trevelyn Report which served to radicalise entry and recruitment to the Civil Service. The modern GCSE and the plans for I-levels are considered and key observations are made about the efficacy of those examinations offered by Oxford and Cambridge universities and O-levels, A-levels and NVQs, The reader is given every opportunity to benefit enthusiastically in this account of examinations, and those engaged in education, whether teachers, examiners, students or administrators, will be able to gain useful insights into the workings of the examination system.",
				"language": "en",
				"libraryCatalog": "www.springer.com",
				"publisher": "Sense Publishers",
				"shortTitle": "Testing Times",
				"url": "//www.springer.com/us/book/9789462094826",
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
	},
	{
		"type": "web",
		"url": "http://www.springer.com/de/book/9783540212904",
		"items": [
			{
				"itemType": "book",
				"title": "Complex Geometry: An Introduction",
				"creators": [
					{
						"firstName": "Daniel",
						"lastName": "Huybrechts",
						"creatorType": "author"
					}
				],
				"date": "2005",
				"ISBN": "9783540212904",
				"abstractNote": "Complex geometry studies (compact) complex manifolds. It discusses algebraic as well as metric aspects. The subject is on the crossroad of algebraic and differential geometry. Recent developments in string theory have made it an highly attractive area, both for mathematicians and theoretical physicists. The author’s goal is to provide an easily accessible introduction to the subject. The book contains detailed accounts of the basic concepts and the many exercises illustrate the theory. Appendices to various chapters allow an outlook to recent research directions. Daniel Huybrechts is currently Professor of Mathematics at the University Denis Diderot in Paris.",
				"language": "en",
				"libraryCatalog": "www.springer.com",
				"place": "Berlin Heidelberg",
				"publisher": "Springer-Verlag",
				"series": "Universitext",
				"shortTitle": "Complex Geometry",
				"url": "//www.springer.com/de/book/9783540212904",
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
	},
	{
		"type": "web",
		"url": "http://www.springer.com/gb/book/9783658115449",
		"items": [
			{
				"itemType": "book",
				"title": "Analysis 1: Differential- und Integralrechnung einer Veränderlichen",
				"creators": [
					{
						"firstName": "Otto",
						"lastName": "Forster",
						"creatorType": "author"
					}
				],
				"date": "2016",
				"ISBN": "9783658115449",
				"abstractNote": "Dieses seit vier Jahrzehnten bewährte Standardwerk ist gedacht als Begleittext zur Analysis-Vorlesung des ersten Semesters für Mathematiker, Physiker und Informatiker. Bei der Darstellung wurde besonderer Wert darauf gelegt, in systematischer Weise, aber ohne zu große Abstraktionen zu den wesentlichen Inhalten vorzudringen und sie mit vielen konkreten Beispielen zu illustrieren. An verschiedenen Stellen wurden Bezüge zur Informatik hergestellt. Einige numerische Beispiele wurden durch Programm-Codes ergänzt, so dass die Rechnungen direkt am Computer nachvollzogen werden können. Die vorliegende 12. Auflage wurde in mehreren Details verbessert und enthält einige zusätzliche Aufgaben und Beispiele.",
				"edition": "12",
				"language": "en",
				"libraryCatalog": "www.springer.com",
				"publisher": "Springer Spektrum",
				"series": "Grundkurs Mathematik",
				"shortTitle": "Analysis 1",
				"url": "//www.springer.com/gb/book/9783658115449",
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
	},
	{
		"type": "web",
		"url": "http://www.springer.com/jp/book/9783642331909",
		"items": [
			{
				"itemType": "book",
				"title": "Advances in Visual Computing: 8th International Symposium, ISVC 2012, Rethymnon, Crete, Greece, July 16-18, 2012, Revised Selected Papers, Part II",
				"creators": [
					{
						"firstName": "George",
						"lastName": "Bebis",
						"creatorType": "editor"
					},
					{
						"firstName": "Richard",
						"lastName": "Boyle",
						"creatorType": "editor"
					},
					{
						"firstName": "Bahram",
						"lastName": "Parvin",
						"creatorType": "editor"
					},
					{
						"firstName": "Darko",
						"lastName": "Koracin",
						"creatorType": "editor"
					},
					{
						"firstName": "Fowlkes",
						"lastName": "Charless",
						"creatorType": "editor"
					},
					{
						"firstName": "Wang",
						"lastName": "Sen",
						"creatorType": "editor"
					},
					{
						"firstName": "Choi",
						"lastName": "Min-Hyung",
						"creatorType": "editor"
					},
					{
						"firstName": "Stephan",
						"lastName": "Mantler",
						"creatorType": "editor"
					},
					{
						"firstName": "Jurgen",
						"lastName": "Schulze",
						"creatorType": "editor"
					},
					{
						"firstName": "Daniel",
						"lastName": "Acevedo",
						"creatorType": "editor"
					},
					{
						"firstName": "Klaus",
						"lastName": "Mueller",
						"creatorType": "editor"
					},
					{
						"firstName": "Michael",
						"lastName": "Papka",
						"creatorType": "editor"
					}
				],
				"date": "2012",
				"ISBN": "9783642331909",
				"abstractNote": "The two volume set LNCS 7431 and 7432 constitutes the refereed proceedings of the 8th International Symposium on Visual Computing, ISVC 2012, held in Rethymnon, Crete, Greece, in July 2012. The 68 revised full papers and 35 poster papers presented together with 45 special track papers were carefully reviewed and selected from more than 200 submissions. The papers are organized in topical sections: Part I (LNCS 7431) comprises computational bioimaging; computer graphics; calibration and 3D vision; object recognition; illumination, modeling, and segmentation; visualization; 3D mapping, modeling and surface reconstruction; motion and tracking; optimization for vision, graphics, and medical imaging, HCI and recognition. Part II (LNCS 7432) comprises topics such as unconstrained biometrics: advances and trends; intelligent environments: algorithms and applications; applications; virtual reality; face processing and recognition.",
				"language": "en",
				"libraryCatalog": "www.springer.com",
				"place": "Berlin Heidelberg",
				"publisher": "Springer-Verlag",
				"series": "Image Processing, Computer Vision, Pattern Recognition, and Graphics",
				"shortTitle": "Advances in Visual Computing",
				"url": "//www.springer.com/jp/book/9783642331909",
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
	},
	{
		"type": "web",
		"url": "http://www.springer.com/jp/search?query=references&submit=Submit+Query",
		"items": "multiple"
	}
]
/** END TEST CASES **/
