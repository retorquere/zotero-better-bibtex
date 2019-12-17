{
	"translatorID": "99b62ba4-065c-4e83-a5c0-d8cc0c75d388",
	"label": "Open Journal Systems",
	"creator": "Aurimas Vinckevicius",
	"target": "/article/view/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-09-08 11:33:52"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2012 Aurimas Vinckevicius

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

function detectWeb(doc, _url) {
	var pkpLibraries = ZU.xpath(doc, '//script[contains(@src, "/lib/pkp/js/")]');
	if (ZU.xpathText(doc, '//a[@id="developedBy"]/@href') == 'http://pkp.sfu.ca/ojs/'	// some sites remove this
		|| pkpLibraries.length >= 1) {
		return 'journalArticle';
	}
	return false;
}

function doWeb(doc, url) {
	// In OJS 3, up to at least version 3.1.1-2, the PDF view does not
	// include metadata, so we must get it from the article landing page.
	var urlParts = url.match(/(.+\/article\/view\/)([^/]+)\/[^/]+/);
	if (urlParts) { // PDF view
		ZU.processDocuments(urlParts[1] + urlParts[2], scrape);
	}
	else { // Article view
		scrape(doc, url);
	}
}

function scrape(doc, _url) {
	// use Embeded Metadata
	var trans = Zotero.loadTranslator('web');
	trans.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	trans.setDocument(doc);

	trans.setHandler('itemDone', function (obj, item) {
		if (!item.itemType) {
			item.itemType = "journalArticle";
		}
		
		if (!item.title) {
			item.title = doc.getElementById('articleTitle');
		}
		
		if (item.creators.length == 0) {
			var authorString = doc.getElementById("authorString");
			if (authorString) {
				var authorsList = authorString.textContent.split(',');
				for (let i = 0; i < authorsList.length; i++) {
					item.creators.push(ZU.cleanAuthor(authorsList[i], "author"));
				}
			}
		}
		
		if (item.journalAbbreviation && item.journalAbbreviation == "1") {
			delete item.journalAbbreviation;
		}
		
		var doiNode = doc.getElementById('pub-id::doi');
		if (!item.DOI && doiNode) {
			item.DOI = doiNode.textContent;
		}
		
		// abstract is supplied in DC:description, so it ends up in extra
		// abstractNote is pulled from description, which is same as title
		item.abstractNote = item.extra;
		item.extra = undefined;

		// if we still don't have abstract, we can try scraping from page
		if (!item.abstractNote) {
			item.abstractNote = ZU.xpathText(doc, '//div[@id="articleAbstract"]/div[1]')
				|| ZU.xpathText(doc, '//div[contains(@class, "main_entry")]/div[contains(@class, "abstract")]');
		}
		if (item.abstractNote) {
			item.abstractNote = item.abstractNote.trim().replace(/^Abstract:?\s*/, '');
		}
		
		var pdfAttachment = false;
		
		// some journals link to a PDF view page in the header, not the PDF itself
		for (let i = 0; i < item.attachments.length; i++) {
			if (item.attachments[i].mimeType == 'application/pdf') {
				pdfAttachment = true;
				item.attachments[i].url = item.attachments[i].url.replace(/\/article\/view\//, '/article/download/');
			}
		}
		
		var pdfUrl = doc.querySelector("a.obj_galley_link.pdf");
		// add linked PDF if there isn't one listed in the header
		if (!pdfAttachment && pdfUrl) {
			item.attachments.push({
				title: "Full Text PDF",
				mimeType: "application/pdf",
				url: pdfUrl.href.replace(/\/article\/view\//, '/article/download/')
			});
		}

		item.complete();
	});

	trans.translate();
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://journals.linguisticsociety.org/elanguage/dad/article/view/362.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "On Incrementality in Dialogue: Evidence from Compound Contributions",
				"creators": [
					{
						"firstName": "Christine",
						"lastName": "Howes",
						"creatorType": "author"
					},
					{
						"firstName": "Matthew",
						"lastName": "Purver",
						"creatorType": "author"
					},
					{
						"firstName": "Patrick G. T.",
						"lastName": "Healey",
						"creatorType": "author"
					},
					{
						"firstName": "Gregory",
						"lastName": "Mills",
						"creatorType": "author"
					},
					{
						"firstName": "Eleni",
						"lastName": "Gregoromichelaki",
						"creatorType": "author"
					}
				],
				"date": "2011/05/11",
				"DOI": "10.5087/d&d.v2i1.362",
				"ISSN": "2152-9620",
				"abstractNote": "Spoken contributions in dialogue often continue or complete earlier contributions by either the same or a different speaker. These compound contributions (CCs) thus provide a natural context for investigations of incremental processing in dialogue.\n\nWe present a corpus study which confirms that CCs are a key dialogue phenomenon: almost 20% of contributions fit our general definition of CCs, with nearly 3% being the cross-person case most often studied. The results suggest that processing is word-by-word incremental, as splits can occur within syntactic constituents; however, some systematic differences between same- and cross-person cases indicate important dialogue-specific pragmatic effects. An experimental study then investigates these effects by artificially introducing CCs into multi-party text dialogue. Results suggest that CCs affect peoples expectations about who will speak next and whether other participants have formed a coalition or party.\n\nTogether, these studies suggest that CCs require an incremental processing mechanism that can provide a resource for constructing linguistic constituents that span multiple contributions and multiple participants. They also suggest the need to model higher-level dialogue units that have consequences for the organisation of turn-taking and for the development of a shared context.",
				"issue": "1",
				"language": "en",
				"libraryCatalog": "journals.linguisticsociety.org",
				"pages": "279-311",
				"publicationTitle": "Dialogue & Discourse",
				"shortTitle": "On Incrementality in Dialogue",
				"url": "362.html",
				"volume": "2",
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
		"url": "http://www.ijdc.net/index.php/ijdc/article/view/8.2.5/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Disciplinary differences in faculty research data management practices and perspectives",
				"creators": [
					{
						"firstName": "Katherine G.",
						"lastName": "Akers",
						"creatorType": "author"
					},
					{
						"firstName": "Jennifer",
						"lastName": "Doty",
						"creatorType": "author"
					}
				],
				"date": "2013-11-21",
				"DOI": "10.2218/ijdc.v8i2.263",
				"ISSN": "1746-8256",
				"abstractNote": "Academic librarians are increasingly engaging in data curation by providing infrastructure (e.g., institutional repositories) and offering services (e.g., data management plan consultations) to support the management of research data on their campuses. Efforts to develop these resources may benefit from a greater understanding of disciplinary differences in research data management needs. After conducting a survey of data management practices and perspectives at our research university, we categorized faculty members into four research domains—arts and humanities, social sciences, medical sciences, and basic sciences—and analyzed variations in their patterns of survey responses. We found statistically significant differences among the four research domains for nearly every survey item, revealing important disciplinary distinctions in data management actions, attitudes, and interest in support services. Serious consideration of both the similarities and dissimilarities among disciplines will help guide academic librarians and other data curation professionals in developing a range of data-management services that can be tailored to the unique needs of different scholarly researchers.",
				"language": "en",
				"libraryCatalog": "www.ijdc.net",
				"pages": "5-26",
				"publicationTitle": "International Journal of Digital Curation",
				"rights": "Copyright (c)",
				"url": "http://www.ijdc.net/index.php/ijdc/article/view/8.2.5/",
				"volume": "8",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "DCC"
					},
					{
						"tag": "IJDC"
					},
					{
						"tag": "International Journal of Digital Curation"
					},
					{
						"tag": "curation"
					},
					{
						"tag": "digital curation"
					},
					{
						"tag": "digital preservation"
					},
					{
						"tag": "preservation"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://journals.ub.uni-heidelberg.de/index.php/ip/article/view/31976/26301",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Anleitung zur Organisation von Webkonferenzen am Beispiel der “Bibcast”-Aktion zum Bibliothekskongress 2016",
				"creators": [
					{
						"firstName": "Daniel",
						"lastName": "Beucke",
						"creatorType": "author"
					},
					{
						"firstName": "Arvid",
						"lastName": "Deppe",
						"creatorType": "author"
					},
					{
						"firstName": "Tracy",
						"lastName": "Hoffmann",
						"creatorType": "author"
					},
					{
						"firstName": "Felix",
						"lastName": "Lohmeier",
						"creatorType": "author"
					},
					{
						"firstName": "Christof",
						"lastName": "Rodejohann",
						"creatorType": "author"
					},
					{
						"firstName": "Pascal Ngoc Phu",
						"lastName": "Tu",
						"creatorType": "author"
					}
				],
				"date": "2016/08/16",
				"DOI": "10.11588/ip.2016.2.31976",
				"ISSN": "2297-3249",
				"abstractNote": "Zwischen dem 7. und 11. März 2016 fand der erste Bibcast, eine Webcast-Serie zu bibliothekarisch relevanten Themen statt. Aus der Idee heraus entstanden, abgelehnten Einreichungen für den Bibliothekskongress ein alternatives Forum zu bieten, hat sich der Bibcast als interessantes, flexibles und innovatives Format herausgestellt, das die Landschaft der Präsenzkonferenzen zukünftig sinnvoll ergänzen kann. In diesem Praxisbeitrag soll über Entstehung und Ablauf berichtet, Mehrwerte und Stolpersteine veranschaulicht und damit zugleich eine Anleitung zur Organisation von Webkonferenzen gegeben werden.",
				"issue": "2",
				"language": "de",
				"libraryCatalog": "journals.ub.uni-heidelberg.de",
				"publicationTitle": "Informationspraxis",
				"rights": "Copyright (c) 2016 Daniel Beucke, Arvid Deppe, Tracy Hoffmann, Felix Lohmeier, Christof Rodejohann, Pascal Ngoc Phu Tu",
				"url": "https://journals.ub.uni-heidelberg.de/index.php/ip/article/view/31976",
				"volume": "2",
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
		"url": "http://www.mediaesthetics.org/index.php/mae/article/view/50",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "World War II in American Movie Theatres from 1942-45: On Images of Civilian and Military Casualties and the Negotiation of a Shared Experience",
				"creators": [
					{
						"firstName": "David",
						"lastName": "Gaertner",
						"creatorType": "author"
					}
				],
				"date": "2016/06/23",
				"DOI": "10.17169/mae.2016.50",
				"ISSN": "2567-9309",
				"abstractNote": "This study deals with the question of genre cinema in terms of an aesthetic experience that also accounts for a shared experience. The focus will be on the historical framework that constituted the emotional mobilization of the American public during World War II when newsreels and fictional war films were screened together as part of the staple program in movie theaters. Drawing on existing concepts of cinema and public sphere as well as on a phenomenological theory of spectator engagement this study sets out to propose a definition of the term moviegoing experience. On these grounds a historiographical account of the institutional practice of staple programming shall be explored together with a theoretical conceptualization of the spectator within in the realm of genre cinema.Diese Studie befragt das Genrekino als Modus ästhetischer Erfahrung in Hinblick auf die konkrete geteilten Erfahrung des Kinosaals. Der Fokus liegt auf den historischen Rahmenbedingen der emotionalen Mobilisierung der US-amerikanischen Öffentlichkeit während des Zweiten Weltkriegs und der gemeinsamen Vorführung von Kriegsnachrichten und fiktionalen Kriegsfilmen in Kinoprogrammen. Dabei wird auf Konzepte des Kinos als öffentlichem Raum und auf phänomenologische Theorien der Zuschaueradressierung Bezug genommen und ein integrative Definition der moviegoing experience entworfen. Dadurch ist es möglich, historiographische Schilderungen der institutionalisierten Praktiken der Kinoprogrammierung mit theoretischen Konzeptualisierungen der Zuschauererfahrung und des Genrekinos ins Verhältnis zu setzen.David Gaertner, M.A. is currently writing his dissertation on the cinematic experience of World War II and is a lecturer at the division of Film Studies at Freie Universität Berlin. From 2011 to 2014 he was research associate in the project “Staging images of war as a mediated experience of community“. He is co-editor of the book “Mobilisierung der Sinne. Der Hollywood-Kriegsfilm zwischen Genrekino und Historie” (Berlin 2013). // David Gaertner, M.A. arbeitet an einer Dissertation zur Kinoerfahrung im Zweiten Weltkrieg und lehrt am Seminar für Filmwissenschaft an der Freien Universität Berlin. 2011 bis 2014 war er wissenschaftlicher Mitarbeiter im DFG-Projekt „Inszenierungen des Bildes vom Krieg als Medialität des Gemeinschaftserlebens“. Er ist Mitherausgeber des Sammelbands “Mobilisierung der Sinne. Der Hollywood-Kriegsfilm zwischen Genrekino und Historie” (Berlin 2013).",
				"issue": "1",
				"language": "en",
				"libraryCatalog": "www.mediaesthetics.org",
				"publicationTitle": "mediaesthetics – Journal of Poetics of Audiovisual Images",
				"rights": "Copyright (c) 2016 David Gaertner",
				"shortTitle": "World War II in American Movie Theatres from 1942-45",
				"url": "http://www.mediaesthetics.org/index.php/mae/article/view/50",
				"volume": "0",
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
		"url": "https://0277.ch/ojs/index.php/cdrs_0277/article/view/101",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Pricing bei wissenschaftlichen Zeitschriften",
				"creators": [
					{
						"firstName": "Raymond",
						"lastName": "Dettwiler",
						"creatorType": "author"
					}
				],
				"date": "2016/03/14",
				"DOI": "10.12685/027.7-4-1-101",
				"ISSN": "2296-0597",
				"abstractNote": "Der Artikel beschreibt die drei Preisverfahren, die im Preismanagement angewendet werden und zeigt, dass trotz neuer Preisverfahren die Preismodelle bei wissenschaftlichen Zeitschriften immer noch kostenorientiert oder wettbewerbsorientiert sind. Das nutzenorientierte Preisverfahren wartet noch auf seine Umsetzung.This article describes the three modes of pricing which have been applied by price management. Although new pricing models are existing pricing models at scientific journals remain cost oriented or competitor oriented. The value oriented pricing is still waiting for realisation.",
				"issue": "1",
				"language": "de",
				"libraryCatalog": "0277.ch",
				"pages": "11-17",
				"publicationTitle": "027.7 Zeitschrift für Bibliothekskultur / Journal for Library Culture",
				"rights": "Copyright (c) 2016 027.7 Zeitschrift für Bibliothekskultur / Journal for Library Culture",
				"url": "https://0277.ch/ojs/index.php/cdrs_0277/article/view/101",
				"volume": "4",
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
		"url": "http://www.qualitative-research.net/index.php/fqs/article/view/2477",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Computer Analysis of Qualitative Data in Literature and Research Performed by Polish Sociologists",
				"creators": [
					{
						"firstName": "Jakub",
						"lastName": "Niedbalski",
						"creatorType": "author"
					},
					{
						"firstName": "Izabela",
						"lastName": "Ślęzak",
						"creatorType": "author"
					}
				],
				"date": "2016/07/28",
				"DOI": "10.17169/fqs-17.3.2477",
				"ISSN": "1438-5627",
				"abstractNote": "The application of computer-assisted qualitative data analysis software (CAQDAS) in the field of qualitative sociology is becoming more popular. However, in Polish scientific research, the use of computer software to aid qualitative data analysis is uncommon. Nevertheless, the Polish qualitative research community is turning to CAQDAS software increasingly often. One noticeable result of working with CAQDAS is an increase in methodological awareness, which is reflected in higher accuracy and precision in qualitative data analysis. Our purpose in this article is to describe the qualitative researchers' environment in Poland and to consider the use of computer-assisted qualitative data analysis. In our deliberations, we focus mainly on the social sciences, especially sociology.URN: http://nbn-resolving.de/urn:nbn:de:0114-fqs160344",
				"issue": "3",
				"language": "en",
				"libraryCatalog": "www.qualitative-research.net",
				"publicationTitle": "Forum Qualitative Sozialforschung / Forum: Qualitative Social Research",
				"rights": "Copyright (c) 2016 Jakub Niedbalski, Izabela Ślęzak",
				"url": "http://www.qualitative-research.net/index.php/fqs/article/view/2477",
				"volume": "17",
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
						"tag": "CAQDAS"
					},
					{
						"tag": "Polen"
					},
					{
						"tag": "Polish sociology"
					},
					{
						"tag": "Software"
					},
					{
						"tag": "Soziologie"
					},
					{
						"tag": "computer-assisted qualitative data analysis"
					},
					{
						"tag": "computergestützte Datenanalyse"
					},
					{
						"tag": "qualitative Forschung"
					},
					{
						"tag": "qualitative research"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://heiup.uni-heidelberg.de/journals/index.php/transcultural/article/view/23541",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "On the Threshold of the \"Land of Marvels:\" Alexandra David-Neel in Sikkim and the Making of Global Buddhism",
				"creators": [
					{
						"firstName": "Samuel",
						"lastName": "Thévoz",
						"creatorType": "author"
					}
				],
				"date": "2016/07/21",
				"DOI": "10.17885/heiup.ts.23541",
				"ISSN": "2191-6411",
				"abstractNote": "Alexandra David-Neel had already been acquainted with the Himalayas for a long time before the visits to Tibet in 1924 that would make her a mainstream figure of modern Buddhism. In fact, her encounter with Tibet and Tibetan Buddhism can be linked with Sikkim, where she arrived in 1912 after visiting India. An exploration of her Sikkim stay invites us to reconsider the self-fashioning of David-Neel’s image as an explorer of what she called the “land of marvels.” This paper highlights her construction of Sikkim as the locality that helped her create her singular vision of Tibet. Her encounters with local Buddhists in Sikkim provided her with the lofty images of a spiritual Tibet that she contributed to publicizing in the wake of the globalization of Buddhism.",
				"issue": "1",
				"language": "en",
				"libraryCatalog": "heiup.uni-heidelberg.de",
				"pages": "149-186",
				"publicationTitle": "The Journal of Transcultural Studies",
				"rights": "Copyright (c) 2016 Samuel Thevoz",
				"shortTitle": "On the Threshold of the \"Land of Marvels",
				"url": "https://heiup.uni-heidelberg.de/journals/index.php/transcultural/article/view/23541",
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
						"tag": "Alexandra David-Neel"
					},
					{
						"tag": "Cultural Globalization"
					},
					{
						"tag": "Himalayan Borderlands"
					},
					{
						"tag": "Modern Buddhism"
					},
					{
						"tag": "Tibetan Buddhism"
					},
					{
						"tag": "Travel Writing"
					},
					{
						"tag": "World Literature"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.zeitschrift-fuer-balkanologie.de/index.php/zfb/article/view/423",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Nachträge zur Bio-Bibliographie von Ármin(ius) Vámbéry [V]",
				"creators": [
					{
						"firstName": "Michael",
						"lastName": "Knüppel",
						"creatorType": "author"
					}
				],
				"date": "2016/03/18",
				"ISSN": "0044-2356",
				"abstractNote": "Der Verfasser setzt mit diesem Beitrag seine Serie, in der Ergänzungen und Korrekturen zur Bio-Bibliographie des großen ungarischen Reisenden und Entdeckers sowie Pioniers der Zentralasienforschung Á. Vámbéry (1832–1913) gegeben wurden, fort. Zudem findet sich im Anhang zum bio-bibliographischen Teil des Beitrags ein Brief Vámbérys an den Ethnologen und Geographen Richard Andree (1835–1912).",
				"issue": "2",
				"language": "de",
				"libraryCatalog": "www.zeitschrift-fuer-balkanologie.de",
				"publicationTitle": "Zeitschrift für Balkanologie",
				"rights": "Copyright (c) 2016 Harrassowitz Verlag",
				"url": "http://www.zeitschrift-fuer-balkanologie.de/index.php/zfb/article/view/423",
				"volume": "51",
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
		"url": "https://journals.ub.uni-heidelberg.de/index.php/miradas/article/view/22445",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Un desafío a la construcción de la identidad en la fotografía de Carlos Ruiz-Valarino",
				"creators": [
					{
						"firstName": "Laura Bravo",
						"lastName": "López",
						"creatorType": "author"
					}
				],
				"date": "2015/07/21",
				"DOI": "10.11588/mira.2015.0.22445",
				"ISSN": "2363-8087",
				"abstractNote": "La obra fotográfica del artista puertorriqueño Carlos Ruiz-Valarino plantea un marcado contraste con una de las tradiciones más arraigadas en la historia del arte de esta isla del Caribe, que es la representación de una identidad cultural construida a través de símbolos. Recurriendo a la parodia a través de tres géneros pictóricos, como son el paisaje, el retrato y el objeto (en el marco de la naturaleza muerta), Ruiz-Valarino cuestiona los símbolos que reiteradamente se emplean en la construcción de un concepto tan controvertido como es el de identidad, conversando para ello con la tradición iconográfica de la fotografía antropológica y etnográfica, así como la de la ilustración científica o la caricatura.",
				"language": "es",
				"libraryCatalog": "journals.ub.uni-heidelberg.de",
				"pages": "36-49",
				"publicationTitle": "Miradas - Elektronische Zeitschrift für Iberische und Ibero-amerikanische Kunstgeschichte",
				"rights": "Copyright (c) 2015",
				"url": "https://journals.ub.uni-heidelberg.de/index.php/miradas/article/view/22445",
				"volume": "2",
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
		"url": "https://ojs.ub.uni-konstanz.de/ba/article/view/6175",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Was kann Plagiatserkennungs-Software?",
				"creators": [
					{
						"firstName": "Ansgar",
						"lastName": "Schäfer",
						"creatorType": "author"
					}
				],
				"date": "2015/05/17",
				"abstractNote": "-",
				"issue": "99",
				"language": "de",
				"libraryCatalog": "ojs.ub.uni-konstanz.de",
				"publicationTitle": "Bibliothek aktuell",
				"rights": "Copyright (c) 2015 Willkommen bei Bibliothek aktuell",
				"url": "https://ojs.ub.uni-konstanz.de/ba/article/view/6175",
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
		"url": "http://www.querelles.de/index.php/qjb/article/view/29",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Anonymität nach dem Tod: Subjektive Deutungen anonymer Bestattung und genderbezogene Differenzen",
				"creators": [
					{
						"firstName": "Nicole",
						"lastName": "Sachmerda-Schulz",
						"creatorType": "author"
					},
					{
						"firstName": "Paul Sebastian",
						"lastName": "Ruppel",
						"creatorType": "author"
					}
				],
				"date": "2014/04/10",
				"DOI": "10.15461/29",
				"ISSN": "2191-9127",
				"abstractNote": "Anonyme Bestattungen haben in den letzten Jahrzehnten in Deutschland stark zugenommen. Damit hat sich neben traditionellen Formen der Bestattung und Grabgestaltung eine Beisetzungsform etablieren können, bei der das Grab nicht namentlich gekennzeichnet und daher für die Öffentlichkeit sowie häufig auch für Angehörige nicht auffindbar ist. Der Frage, was es bedeutet, bei der Grabwahl auf die Namensnennung und damit auf die Lokalisierung der persönlichen Grabstätte zu verzichten, wird im Beitrag anhand offener Leitfadeninterviews mit Personen, die sich für eine anonyme Bestattung entschieden haben, nachgegangen. In der Analyse der im Rahmen einer Grounded-Theory-Studie erhobenen und ausgewerteten Daten werden Aspekte deutlich, die sich zum Beispiel um Kontrollierbarkeit eigener Belange bis über den Tod hinaus, ein auf Inklusion und Exklusion abzielendes Handeln sowie scheinbar paradoxe Momente von Individualitätsstreben drehen. Zudem zeigen sich hier auffällige Differenzen zwischen Frauen und Männern: Die Präsentation bzw. Repräsentation von Weltanschauungen und Werthaltungen stellt für die Interviewpartner eine Triebfeder für die Entscheidung für eine Anonymbestattung dar. Aussagen der Interviewpartnerinnen indes verweisen darauf, dass diese Entscheidung primär einer pragmatischen und am sozialen Umfeld ausgerichteten Orientierung folgt.",
				"issue": "0",
				"language": "de",
				"libraryCatalog": "www.querelles.de",
				"publicationTitle": "QJB – Querelles. Jahrbuch für Frauen- und Geschlechterforschung",
				"rights": "Copyright (c) 2014 Nicole Sachmerda-Schulz, Paul Sebastian Ruppel",
				"shortTitle": "Anonymität nach dem Tod",
				"url": "http://www.querelles.de/index.php/qjb/article/view/29",
				"volume": "17",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Anonymität",
					"Bestattung",
					"Genderdifferenzen",
					"Säkularisierung",
					"Tod",
					"anonymity",
					"burial",
					"death",
					"gender difference",
					"secularisation"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.ajol.info/index.php/thrb/article/view/63347",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Knowledge, treatment seeking and preventive practices in respect of malaria among patients with HIV at the Lagos University Teaching Hospital",
				"creators": [
					{
						"firstName": "Akinwumi A.",
						"lastName": "Akinyede",
						"creatorType": "author"
					},
					{
						"firstName": "Alade",
						"lastName": "Akintonwa",
						"creatorType": "author"
					},
					{
						"firstName": "Charles",
						"lastName": "Okany",
						"creatorType": "author"
					},
					{
						"firstName": "Olufunsho",
						"lastName": "Awodele",
						"creatorType": "author"
					},
					{
						"firstName": "Duro C.",
						"lastName": "Dolapo",
						"creatorType": "author"
					},
					{
						"firstName": "Adebimpe",
						"lastName": "Adeyinka",
						"creatorType": "author"
					},
					{
						"firstName": "Ademola",
						"lastName": "Yusuf",
						"creatorType": "author"
					}
				],
				"date": "2011-01-01",
				"DOI": "10.4314/thrb.v13i4.63347",
				"ISSN": "1821-9241",
				"abstractNote": "The synergistic interaction between Human Immunodeficiency virus (HIV) disease and Malaria makes it mandatory for patients with HIV to respond appropriately in preventing and treating malaria. Such response will help to control the two diseases. This study assessed the knowledge of 495 patients attending the HIV clinic, in Lagos University Teaching Hospital, Nigeria.  Their treatment seeking, preventive practices with regards to malaria, as well as the impact of socio – demographic / socio - economic status were assessed. Out of these patients, 245 (49.5 %) used insecticide treated bed nets; this practice was not influenced by socio – demographic or socio – economic factors.  However, knowledge of the cause, knowledge of prevention of malaria, appropriate use of antimalarial drugs and seeking treatment from the right source increased with increasing level of education (p < 0.05). A greater proportion of the patients, 321 (64.9 %) utilized hospitals, pharmacy outlets or health centres when they perceived an attack of malaria. Educational intervention may result in these patients seeking treatment from the right place when an attack of malaria fever is perceived.",
				"issue": "4",
				"language": "en",
				"libraryCatalog": "www.ajol.info",
				"publicationTitle": "Tanzania Journal of Health Research",
				"rights": "Copyright for articles published in this journal is retained by the journal.",
				"url": "https://www.ajol.info/index.php/thrb/article/view/63347",
				"volume": "13",
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
					"HIV patients",
					"Nigeria",
					"knowledge",
					"malaria",
					"prevention",
					"treatment"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://ejournals.library.vanderbilt.edu/ojs/index.php/ameriquests/article/view/220",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Open Journal Systems",
				"creators": [
					{
						"firstName": "Earl E.",
						"lastName": "Fitz",
						"creatorType": "author"
					}
				],
				"DOI": "10.15695/amqst.v8i1.220",
				"abstractNote": "Historically, Canadian literature has been chary of entering too far into the new discipline of inter-American literary study.  Rightly concerned about the danger of blurring its identity as a distinctive national literature (one made up, as is well known, of two great strands, the French and the English), Canadian writing has, however, come of age, both nationally and internationally.  One dramatic aspect of this transformation is that we now have mounting evidence that both English and French Canadian writers are actively engaging with the literatures and cultures of their hemispheric neighbors.  By extending the methodologies of Comparative Literature to the inter-American paradigm, Canadian writers, critics, and literary historians are finding ways to maintain their status as members of a unique and under-appreciated national literature while also entering into the kinds of comparative studies that demonstrate their New World ties as well.",
				"libraryCatalog": "ejournals.library.vanderbilt.edu",
				"url": "http://ejournals.library.vanderbilt.edu/ojs/index.php/ameriquests/article/view/220",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"American studies",
					"Canadian studies",
					"american dream",
					"brazilian studies",
					"center for the americas",
					"free trade",
					"inter-american literature",
					"latin american studies",
					"literature and law",
					"migration",
					"native american studies",
					"quebec studies",
					"storytelling",
					"vanderbilt"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://jms.uwinnipeg.ca/index.php/jms/article/view/1369",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Mennonites in Unexpected Places: Sociologist and Settler in Latin America",
				"creators": [
					{
						"firstName": "Ben",
						"lastName": "Nobbs-Thiessen",
						"creatorType": "author"
					}
				],
				"date": "2012-12-18",
				"ISSN": "08245053",
				"language": "en",
				"libraryCatalog": "jms.uwinnipeg.ca",
				"pages": "203-224",
				"publicationTitle": "Journal of Mennonite Studies",
				"rights": "Copyright (c)",
				"shortTitle": "Mennonites in Unexpected Places",
				"url": "http://jms.uwinnipeg.ca/index.php/jms/article/view/1369",
				"volume": "28",
				"attachments": [
					{
						"title": "Snapshot"
					},
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
		"url": "http://journals.sfu.ca/jmde/index.php/jmde_1/article/view/100/115",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Value of Evaluation Standards: A Comparative Assessment",
				"creators": [
					{
						"firstName": "Robert",
						"lastName": "Picciotto",
						"creatorType": "author"
					}
				],
				"date": "2005",
				"ISSN": "1556-8180",
				"issue": "3",
				"language": "en",
				"libraryCatalog": "journals.sfu.ca",
				"pages": "30-59",
				"publicationTitle": "Journal of MultiDisciplinary Evaluation",
				"rights": "Copyright (c)",
				"shortTitle": "The Value of Evaluation Standards",
				"url": "http://journals.sfu.ca/jmde/index.php/jmde_1/article/view/100",
				"volume": "2",
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
		"url": "https://jecs.pl/index.php/jecs/article/view/551",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "PREPARING FUTURE LEADERS OF THEIR RACES -THE POLITICAL FUNCTION OF CHILDREN’S CHARACTERS IN CONTEMPORARY AFRICAN AMERICAN PICTURE-BOOKS",
				"creators": [
					{
						"firstName": "Ewa",
						"lastName": "Klęczaj-Siara",
						"creatorType": "author"
					}
				],
				"date": "2019/06/30",
				"DOI": "10.15503/jecs20191.173.184",
				"ISSN": "2081-1640",
				"abstractNote": "Aim. The aim of the article is to analyse the ways African American children’s characters are constructed in selected picture-books and to determine whether they have any impact on the conduct of contemporary black youth facing discrimination in their own lives. It also argues that picture-books are one of the most influential media in the representation of racial problems.Methods. The subjects of the study are picture-books. The analysis pertains to the visual and the verbal narrative of the books, with a special emphasis being placed on the interplay between text and image as well as on the ways the meaning of the books is created. The texts are analysed using a number of existing research methods used for examining the picture-book format. Results. The article shows that the actions of selected children’s characters, whether real or imaginary, may serve as an incentive for contemporary youth to struggle for equal rights and contribute to the process of racial integration on a daily basis.Conclusions. The results can be considered in the process of establishing educational curricula for students from minority groups who need special literature that would empower them to take action and join in the efforts of adult members of their communities.",
				"issue": "1",
				"language": "en",
				"libraryCatalog": "jecs.pl",
				"pages": "173-184",
				"publicationTitle": "Journal of Education Culture and Society",
				"rights": "Copyright (c) 2019 Ewa Klęczaj-Siara",
				"url": "https://jecs.pl/index.php/jecs/article/view/551",
				"volume": "10",
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
						"tag": "African American children's literature"
					},
					{
						"tag": "picture-books"
					},
					{
						"tag": "political agents"
					},
					{
						"tag": "racism"
					},
					{
						"tag": "text-image relationships"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
