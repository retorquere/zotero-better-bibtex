{
	"translatorID": "89ae6297-c0c4-45f7-943d-5174cf06339c",
	"label": "ResearchGate",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.researchgate\\.net/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-03-30 15:18:21"
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}

function detectWeb(doc, url) {
	if (url.includes('/publication/')) {
		var type = text(doc, 'div.publication-meta strong');
		if (!type) {
			// for logged in users (yes, really...)
			type = text(doc, 'b[data-reactid]');
		}
		type = type.replace('(PDF Available)', '').trim();
		switch (type) {
		case "Data":// until we have a data itemType
		case "Article":
			return "journalArticle";
		case "Conference Paper":
			return "conferencePaper";
		case "Chapter":
			return "bookSection";
		case "Thesis":
			return "thesis";
		case "Research":
			return "report";
		case "Presentation":
			return "presentation";
		default:
			return "book";
		}
	} else if ((url.match('/search(\\?|/)?') || url.includes('/profile/') || url.includes('/scientific-contributions/')) && getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a.publication-title, a.js-publication-title-link, a[itemprop="mainEntityOfPage"]');
	if (!rows.length) {
		rows = ZU.xpath(doc, '//div[contains(@class, "nova-v-publication-item__stack-item")]//a[contains(@class,"nova-e-link")]');
	}
	for (var i = 0; i < rows.length; i++) {
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
			return true;
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var type = detectWeb(doc, url);

	var uid = attr(doc, 'meta[property="rg:id"]', 'content');
	if (!uid) {
		// trying to get the uid from URL; for logged in users
		var uidURL = url.match(/publication\/(\d+)_/);
		if (uidURL) uid = uidURL[1];
	}
	uid = uid.replace('PB:', '');
	var risURL = "https://www.researchgate.net/lite.publication.PublicationDownloadCitationModal.downloadCitation.html?fileType=RIS&citation=citationAndAbstract&publicationUid=" + uid;
	var pdfURL = attr(doc, 'meta[property="citation_pdf_url"]', 'content');

	ZU.doGet(risURL, function (text) {
		// Z.debug(text);
		// fix wrong itemType information in RIS
		if (type == "bookSection") text = text.replace('TY  - BOOK', 'TY  - CHAP');
		if (type == "conferencePaper") text = text.replace('TY  - BOOK', 'TY  - CONF');
		if (type == "report") text = text.replace('TY  - BOOK', 'TY  - RPRT');
		if (type == "presentation") text = text.replace('TY  - BOOK', 'TY  - SLIDE');
		if (type == "journalArticle") text = text.replace('TY  - BOOK', 'TY  - JOUR');
		if (type == "thesis") text = text.replace('TY  - BOOK', 'TY  - THES');
		
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			if (pdfURL) {
				item.attachments.push({
					url: pdfURL,
					title: "Full Text PDF",
					mimeType: "application/pdf"
				});
			}
			item.attachments.push({
				title: "ResearchGate Link",
				url: url,
				snapshot: false
			});
			item.complete();
		});
		translator.translate();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.researchgate.net/publication/318069783_Academic_social_networking_sites_Comparative_analysis_of_ResearchGate_Academiaedu_Mendeley_and_Zotero",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Academic social networking sites: Comparative analysis of ResearchGate, Academia.edu, Mendeley and Zotero",
				"creators": [
					{
						"lastName": "Bhardwaj",
						"firstName": "Raj",
						"creatorType": "author"
					}
				],
				"date": "June 30, 2017",
				"DOI": "10.1108/ILS-03-2017-0012",
				"abstractNote": "Purpose\n\nThe purpose of the study is to compare four popular academic social networking sites (ASNSs) viz. ResearchGate, Academia.edu, Mendeley and Zotero.\n\nDesign/methodology/approach\n\nEvaluation method has been used with the help of checklist covering various features of ASNSs. A structured checklist has been prepared to compare four popular ASNSs, comprising 198 dichotomous questions divided into 12 broad categories.\n\nFindings\n\nThe study found that performance of ASNSs using the latest features and services is not up to the mark and none of the site rated as ‘Excellent’. The sites lack in incorporation of session filters, output features, privacy settings & text display, search and browsing fields. Availability of bibilographic features and general features are poor in these sites. Further, altmetrics and analytics features are not incorporated properly. User interface of the sites need to improve to draw researchers to use them. The study report reveals that ResearchGate scored the highest, 61.1 percent points, and was ranked ‘above average’, followed by Academia.edu with 48.0 percent and Mendeley with 43.9 percent are ranked ‘average’. However, the Zotero (38.9 percent) was ranked ‘below average’.\n\nPractical implications\n\nAccreditation agencies can identify suitable sites in the evaluation of institutions’ research output. Further, students and faculty members can choose the site suiting their needs. Library and information science professionals can utilize the checklist to impart training to the academic community which can help fostering research and development activities.\n\nOriginality/value\n\nThe study identifies features that ought to be available in a model ASNS. These features are categorized into 12 broad categories. The findings can also be used by developers of the sites to enhance functionalities. Institutions can choose suitable sites while collaborating with other institutions.",
				"journalAbbreviation": "Information and Learning Science",
				"libraryCatalog": "ResearchGate",
				"pages": "298-316",
				"publicationTitle": "Information and Learning Science",
				"shortTitle": "Academic social networking sites",
				"volume": "118",
				"attachments": [
					{
						"title": "ResearchGate Link",
						"snapshot": false
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
		"url": "https://www.researchgate.net/publication/272943457_Zotero_Los_gestores_de_referencias_software_para_la_gestion_y_mantenimiento_de_las_referencias_bibliograficas_en_trabajos_de_investigacion",
		"items": [
			{
				"itemType": "book",
				"title": "Zotero: Los gestores de referencias: software para la gestión y mantenimiento de las referencias bibliográficas en trabajos de investigación",
				"creators": [
					{
						"lastName": "Alonso-Arévalo",
						"firstName": "Julio",
						"creatorType": "author"
					}
				],
				"date": "February 1, 2015",
				"abstractNote": "El apartado metodológico es uno de los aspectos más importantes a tener en cuenta en la planificación de cualquier trabajo de investigación. El establecimiento del estado de la cuestión y la revisión bibliográfica, es una de las tareas metodológicas que requiere más inversión en tiempo y esfuerzo del trabajo de un investigador. La bibliografía citada en un documento contribuye a mejorar la credibilidad del mismo, a dar a conocer cuales han sido las fuentes que se han utilizado en su realización, conocer el nivel de actualización de la investigación y reconocer la tarea de otros profesionales que han contribuido a generar ese nuevo conocimiento. Para realizar esta tarea, en cierta manera tediosa, existen programas que facilitan las tareas de recopilación automática de datos desde las diversas fuentes de información (Bases de datos bibliográficas, revistas, páginas web, catálogos.. etc.) Además estos programas se integran con el procesador de texto para ayudar a insertar las citas bibliográficas en los estilos normalizados a medida que se van escribiendo los trabajos de investigación (ISO, ANSI, Vancouver, Chicago, APA..). \n\nZotero es un programa de código abierto que permite a los usuarios recolectar, administrar y citar referencias bibliográficas de investigaciones de todo tipo de orígenes desde el navegador. Zotero es, en su más básico nivel, es un administrador de referencias bibliográficas diseñado para almacenar, administrar y citar referencias, además de poder integrar en la herramienta libros, artículos y cualquier otro documento. Es difícil creer que desde su modesto lanzamiento en el otoño de 2006, Zotero haya sido descargado más de seis millones de veces y que se utilice en todo el mundo en más de treinta idiomas, y que miles de foros, entradas de blogs, artículos de prensa demuestran que los investigadores utilizan esta plataforma de investigación abierta que supera a cualquiera de las alternativas comerciales. Uno de sus puntos fuertes es que es una herramienta de software libre multiplataforma, es decir que puede funcionar en Windows, Linux o Mac (iOs). Disponible inicialmente como complemento para el navegador Firefox, desde la versión 3.0 también funciona como programa de escritorio independiente del navegador “Zotero StandAlone” . En muchas páginas web de investigación como Google Scholar, Web of Knowledge, Scopus, de la web social como Slideshare, Flickr o incluso comerciales como Amazon, Zotero detecta cuando un libro, artículo u otros recursos están siendo consultados, de manera que en la barra de dirección del navegador nos aparecerá el icono correspondiente (un libro, una hoja, una fotografía… ) y con un simple click del ratón encuentra y guarda la información completa de la referencia en un fichero local. Para ello previamente deberemos instalar una extensión para Chrome, Safari o FireFox en función del navegador que utilicemos.\n\nAquí encontrarás una guía sencilla sobre que son los gestores de referencias bibliográficas, que posibilidades ofrecen unos y otros, y también una guía para sacar el máximo partido de Zotero. Un programa de software libre muy apropiado para las tareas de Alfabetización informacional por su sencillez y capacidad intuitiva a la hora de trabajar, estudiar o investigar.",
				"extra": "DOI: 10.13140/2.1.3514.1922",
				"libraryCatalog": "ResearchGate",
				"shortTitle": "Zotero",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "ResearchGate Link",
						"snapshot": false
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
		"url": "https://www.researchgate.net/publication/283057299_Understanding_Meaningful_Learning_in_a_Technology_Training_Program_A_Qualitative_Instrumental_Multiple-Case_Study",
		"items": [
			{
				"itemType": "thesis",
				"title": "Understanding Meaningful Learning in a Technology Training Program: A Qualitative Instrumental Multiple-Case Study",
				"creators": [
					{
						"lastName": "Luo",
						"firstName": "Shuhong",
						"creatorType": "author"
					}
				],
				"date": "June 1, 2015",
				"abstractNote": "Meaningful learning is often missing in technology training and learning. This dissertation presents a qualitative, instrumental, multiple-case study of six students with diverse backgrounds who learned Zotero, a literature review and citation management software, in a 1-hour, one-on-one, face-to-face training session at a Midwestern university. The proposed model, simplified teaching–meaningful learning (STML), framed this study, which explored students’ learning processes and learning outcomes when they experience a simplified experiential learning model used in a Zotero training program. Through student and trainer interviews, trainers’ and my observations and reflections, and students’ documentations, I generated six narratives about each student’s meaningful learning during the Zotero training. Most students were engaged and explored actively and confidently during training. All perceived their learning process as meaningful, helping them to connect with their workflow. After training, all could use the basic functions of Zotero, understood them, and remembered them. Their procedures solved problems efficiently and flexibly and were workflow-centered. They considered Zotero easy to use and useful, and intended to use it. Two weeks later, they had adopted Zotero into current research projects or planned to use it in future work. However, they did not fully incorporate the meaningful learning approaches into personal learning strategies. Most retained strong tendencies to value rote and dependent learning, and did not conscientiously recognize and transfer similar patterns of general computer knowledge into the new software. These findings provided valuable insights into meaningful learning for technology educators in designing similar programs. Implications for future technology training design were discussed.",
				"libraryCatalog": "ResearchGate",
				"shortTitle": "Understanding Meaningful Learning in a Technology Training Program",
				"attachments": [
					{
						"title": "ResearchGate Link",
						"snapshot": false
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
		"url": "https://www.researchgate.net/publication/315673297_Linguistic_Landscape_Bibliography_on_Zotero",
		"items": [
			{
				"itemType": "report",
				"title": "Linguistic Landscape Bibliography on Zotero",
				"creators": [
					{
						"lastName": "Troyer",
						"firstName": "Robert",
						"creatorType": "author"
					}
				],
				"date": "March 28, 2017",
				"abstractNote": "This bibliography contains references to academic work in the field of Linguistic Landscapes (LL). It is intended to capture the range of the field from seminal works that are central to LL theory and methodologies to tangential works that utilize LL approaches.",
				"libraryCatalog": "ResearchGate",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "ResearchGate Link",
						"snapshot": false
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
		"url": "https://www.researchgate.net/publication/316991339_Non-scientific_requirements_of_scientific_journals_suggestions_and_need_of_a_one_click_software",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Non-scientific requirements of scientific journals, suggestions and need of a one click software",
				"creators": [
					{
						"lastName": "Nadeem",
						"firstName": "Said",
						"creatorType": "author"
					},
					{
						"lastName": "Guruler",
						"firstName": "Huseyin",
						"creatorType": "author"
					},
					{
						"lastName": "Ali Özler",
						"firstName": "Mehmet",
						"creatorType": "author"
					}
				],
				"date": "May 5, 2017",
				"abstractNote": "Scientists are always producing new results that has to be publish in some form; mostly in peer-reviewed journals in the form of communications, letters, research articles etc. Due to distinct format of each journal, authors has to write according to the author’s instructions of the target journal. Most of the manuscript are being rejected, and to submit to another journal, we have to change the format of journal including title page, headings and subheadings, numbering and bullets, formatting the page (indentions and margins, Line spacing font size, font) etc. Often we waste two/three days just to change the format. We can deal with the references styles using Endnote, that is also expensive software. Mendeley and Zotero are available for free but the reference style of most of our desired journals are not available and it is not easy to edit a present style. Time is money, precious and should not be loose in formatting. We suggest a single format for all scientific journals. If for commercial reasons, a single style is not possible, then we suggest for a software where the format of the manuscript (title page, author names and addresses, headings, bullets and numberings, figures and tables, references etc.) with a single click; by just selecting the name of desired journal. In this regard, we are working on “Palvasha Manuscript manager”. Herein we are presenting a beta version of the desired software. We are planning to upgrade our software so that in a single place, one can write the manuscript, draw figures and drawings, create tables, find most suitable journal as well as submit the manuscript automatically to the desired journal with a single click.",
				"libraryCatalog": "ResearchGate",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "ResearchGate Link",
						"snapshot": false
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
		"url": "https://www.researchgate.net/publication/305727853_Reference_Management_Tools",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Reference Management Tools:",
				"creators": [
					{
						"lastName": "Ortega",
						"firstName": "Jose",
						"creatorType": "author"
					}
				],
				"date": "December 31, 2016",
				"ISBN": "9780081005927",
				"abstractNote": "This chapter analyses the bibliographic coverage, networking functions and population distribution of reference management tools. These networking spaces generally emerged from desktop applications for organizing bibliographic references to social networking environments setup to share and tag citations for scholars. Two of the most important reference management tools, Mendeley and Zotero, are described in detail. Mendeley has the largest bibliographic database where users can read and tag the publications that other members share in the public catalogue. However, its networking functionalities are hardly exploited at all, which casts serious doubts on its future as a social networking platform. Zotero, on the other hand, is a local, reduced platform occupied above all by American users from the Humanities and Social Sciences. Nevertheless, the great limitation of this platform is that it does not have a public catalogue of the references added to the service, which impedes the sharing of references between members. As a result of this users employ groups as the means to achieve collaboration.",
				"extra": "DOI: 10.1016/B978-0-08-100592-7.00004-6",
				"libraryCatalog": "ResearchGate",
				"pages": "65-99",
				"shortTitle": "Reference Management Tools",
				"attachments": [
					{
						"title": "ResearchGate Link",
						"snapshot": false
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
		"url": "https://www.researchgate.net/search/publications?q=zotero",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.researchgate.net/profile/Noga_Alon",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.researchgate.net/scientific-contributions/2109740616_Daniela_Hombach",
		"items": "multiple"
	}
]
/** END TEST CASES **/
