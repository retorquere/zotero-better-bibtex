{
	"translatorID": "b6d0a7a-d076-48ae-b2f0-b6de28b194e",
	"label": "ScienceDirect",
	"creator": "Michael Berkowitz and Aurimas Vinckevicius",
	"target": "^https?://[^/]*science-?direct\\.com[^/]*/((science/)?(article/|(journal|bookseries|book|handbook)/\\d)|search[?/]|journal/[^/]+/vol)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-11-09 03:35:55"
}

// attr()/text() v2
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;} 


function detectWeb(doc, url) {
	if (!doc.body.textContent.trim()) return false;

	if ((url.includes("_ob=DownloadURL"))
		|| doc.title == "ScienceDirect Login"
		|| doc.title == "ScienceDirect - Dummy"
		|| (url.includes("/science/advertisement/"))) {
		return false;
	}

	if ((url.includes("pdf")
			&& !url.includes("_ob=ArticleURL")
			&& !url.includes("/article/"))
		|| url.search(/\/(?:journal|bookseries|book|handbook)\//) !== -1) {
		if (getArticleList(doc).length > 0) {
			return "multiple";
		}
		else {
			return false;
		}
	}

	if (url.search(/\/search[?/]/) != -1 && getArticleList(doc).length > 0) {
		return "multiple";
	}
	if (!url.includes("pdf")) {
		// Book sections have the ISBN in the URL
		if (url.includes("/B978")) {
			return "bookSection";
		}
		else if (getISBN(doc)) {
			if (getArticleList(doc).length) {
				return "multiple";
			}
			else {
				return "book";
			}
		}
		else {
			return "journalArticle";
		}
	}
	return false;
}

function getPDFLink(doc, onDone) {
	// No PDF access ("Get Full Text Elsewhere" or "Check for this article elsewhere")
	if (doc.querySelector('.accessContent') || doc.querySelector('.access-options-link-text') || doc.querySelector('#check-access-popover')) {
		Zotero.debug("PDF is not available");
		onDone();
		return;
	}
	
	// Some pages still have the PDF link available
	var pdfURL = attr(doc, '#pdfLink', 'href');
	if (!pdfURL) pdfURL = attr(doc, '[name="citation_pdf_url"]', 'content');
	if (pdfURL && pdfURL != '#') {
		parseIntermediatePDFPage(pdfURL, onDone);
		return;
	}
	
	// If intermediate page URL is available, use that directly
	var intermediateURL = attr(doc, '.PdfEmbed > object', 'data');
	if (intermediateURL) {
		// Zotero.debug("Embedded intermediate PDF URL: " + intermediateURL);
		parseIntermediatePDFPage(intermediateURL, onDone);
		return;
	}
	
	// Simulate a click on the "Download PDF" button to open the menu containing the link with the URL
	// for the intermediate page, which doesn't seem to be available in the DOM after the page load.
	// This is an awful hack, and we should look out for a better way to get the URL, but it beats
	// refetching the original source as we do below.
	var pdfLink = doc.querySelector('#pdfLink');
	if (pdfLink) {
		// Just in case
		try {
			pdfLink.click();
			intermediateURL = attr(doc, '.PdfDropDownMenu a', 'href');
			var clickEvent = doc.createEvent('MouseEvents');
			clickEvent.initEvent('mousedown', true, true);
			doc.dispatchEvent(clickEvent);
		}
		catch (e) {
			Zotero.debug(e, 2);
		}
		if (intermediateURL) {
			// Zotero.debug("Intermediate PDF URL from drop-down: " + intermediateURL);
			parseIntermediatePDFPage(intermediateURL, onDone);
			return;
		}
	}
	
	// If none of that worked for some reason, get the URL from the initial HTML, where it is present,
	// by fetching the page source again. Hopefully this is never actually used.
	var url = doc.location.href;
	Zotero.debug("Refetching HTML for PDF link");
	ZU.doGet(url, function (html) {
		// TODO: Switch to HTTP.request() and get a Document from the XHR
		var dp = new DOMParser();
		var doc = dp.parseFromString(html, 'text/html');
		var intermediateURL = attr(doc, '.pdf-download-btn-link', 'href');
		// Zotero.debug("Intermediate PDF URL: " + intermediateURL);
		if (intermediateURL) {
			parseIntermediatePDFPage(intermediateURL, onDone);
			return;
		}
		onDone();
	});
}


function parseIntermediatePDFPage(url, onDone) {
	// Get the PDF URL from the meta refresh on the intermediate page
	ZU.doGet(url, function (html) {
		var dp = new DOMParser();
		var doc = dp.parseFromString(html, 'text/html');
		var pdfURL = attr(doc, 'meta[HTTP-EQUIV="Refresh"]', 'CONTENT');
		var otherRedirect = attr(doc, '#redirect-message a', 'href');
		// Zotero.debug("Meta refresh URL: " + pdfURL);
		if (pdfURL) {
			// Strip '0;URL='
			var matches = pdfURL.match(/\d+;URL=(.+)/);
			pdfURL = matches ? matches[1] : null;
		}
		else if (otherRedirect) {
			pdfURL = otherRedirect;
		}
		else if (url.includes('.pdf')) {
			// Sometimes we are already on the PDF page here and therefore
			// can simply use the original url as pdfURL.
			pdfURL = url;
		}
		onDone(pdfURL);
	});
}


function getISBN(doc) {
	var isbn = ZU.xpathText(doc, '//td[@class="tablePubHead-Info"]//span[@class="txtSmall"]');
	if (!isbn) return false;

	isbn = isbn.match(/ISBN:\s*([-\d]+)/);
	if (!isbn) return false;

	return isbn[1].replace(/[-\s]/g, '');
}


function getAbstract(doc) {
	var p = ZU.xpath(doc, '//div[contains(@class, "abstract") and not(contains(@class, "abstractHighlights"))]/p');
	var paragraphs = [];
	for (var i = 0; i < p.length; i++) {
		paragraphs.push(ZU.trimInternal(p[i].textContent));
	}
	return paragraphs.join('\n');
}

// mimetype map for supplementary attachments
// intentionally excluding potentially large files like videos and zip files
var suppTypeMap = {
	pdf: 'application/pdf',
	//	'zip': 'application/zip',
	doc: 'application/msword',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	xls: 'application/vnd.ms-excel',
	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

// attach supplementary information
function attachSupplementary(doc, item) {
	var links = ZU.xpath(doc, './/span[starts-with(@class, "MMCvLABEL_SRC")]');
	var link, title, url, type, snapshot;
	var attachAsLink = Z.getHiddenPref("supplementaryAsLink");
	for (var i = 0, n = links.length; i < n; i++) {
		link = links[i].firstElementChild;
		if (!link || link.nodeName.toUpperCase() !== 'A') continue;

		url = link.href;
		if (!url) continue;

		title = ZU.trimInternal(link.textContent);
		if (!title) title = 'Supplementary Data';

		type = suppTypeMap[url.substr(url.lastIndexOf('.') + 1).toLowerCase()];
		snapshot = !attachAsLink && type;

		var attachment = {
			title: title,
			url: url,
			mimeType: type,
			snapshot: !!snapshot
		};

		var replaced = false;
		if (snapshot && title.search(/Article plus Supplemental Information/i) != -1) {
			// replace full text PDF
			for (var j = 0, m = item.attachments.length; j < m; j++) {
				if (item.attachments[j].title == "ScienceDirect Full Text PDF") {
					attachment.title = "Article plus Supplemental Information";
					item.attachments[j] = attachment;
					replaced = true;
					break;
				}
			}
		}

		if (!replaced) {
			item.attachments.push(attachment);
		}
	}
}


function processRIS(doc, text) {
	// T2 doesn't appear to hold the short title anymore.
	// Sometimes has series title, so I'm mapping this to T3,
	// although we currently don't recognize that in RIS
	text = text.replace(/^T2\s/mg, 'T3 ');

	// Sometimes PY has some nonsensical value. Y2 contains the correct
	// date in that case.
	if (text.search(/^Y2\s+-\s+\d{4}\b/m) !== -1) {
		text = text.replace(/TY\s+-[\S\s]+?ER/g, function (m) {
			if (m.search(/^PY\s+-\s+\d{4}\b/m) === -1
				&& m.search(/^Y2\s+-\s+\d{4}\b/m) !== -1
			) {
				return m.replace(/^PY\s+-.*\r?\n/mg, '')
					.replace(/^Y2\s+-/mg, 'PY  -');
			}
			return m;
		});
	}

	// Certain authors sometimes have "role" prefixes or are in the wrong order
	// e.g. http://www.sciencedirect.com/science/article/pii/S0065260108602506
	text = text.replace(/^((?:A[U\d]|ED)\s+-\s+)(?:Editor-in-Chief:\s+)?(.+)/mg,
		function (m, pre, name) {
			if (!name.includes(',')) {
				name = name.trim().replace(/^(.+?)\s+(\S+)$/, '$2, $1');
			}

			return pre + name;
		}
	);
	// The RIS sometimes has spaces at the beginning of lines, which break things
	// as of 20170121 e.g. on http://www.sciencedirect.com/science/article/pii/B9780123706263000508 for A2
	// remove them
	text = text.replace(/\n\s+/g, "\n");
	// Z.debug(text)
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
	translator.setString(text);
	translator.setHandler("itemDone", function (obj, item) {
		// issue sometimes is set to 0 for single issue volumes (?)
		if (item.issue === 0) delete item.issue;

		if (item.volume) item.volume = item.volume.replace(/^\s*volume\s*/i, '');

		for (var i = 0, n = item.creators.length; i < n; i++) {
			// add spaces after initials
			if (item.creators[i].firstName) {
				item.creators[i].firstName = item.creators[i].firstName.replace(/\.\s*(?=\S)/g, '. ');
			}
			// fix all uppercase lastnames
			if (item.creators && item.creators[i].lastName.toUpperCase() == item.creators[i].lastName) {
				item.creators[i].lastName = item.creators[i].lastName.charAt(0) + item.creators[i].lastName.slice(1).toLowerCase();
			}
		}

		// abstract is not included with the new export form. Scrape from page
		if (!item.abstractNote) {
			item.abstractNote = getAbstract(doc);
		}
		if (item.abstractNote) {
			item.abstractNote = item.abstractNote.replace(/^(Abstract|Summary)[\s:\n]*/, "");
		}
		item.attachments.push({
			title: "ScienceDirect Snapshot",
			document: doc
		});

		// attach supplementary data
		if (Z.getHiddenPref && Z.getHiddenPref("attachSupplementary")) {
			try { // don't fail if we can't attach supplementary data
				attachSupplementary(doc, item);
			}
			catch (e) {
				Z.debug("Error attaching supplementary information.");
				Z.debug(e);
			}
		}

		if (item.notes[0]) {
			item.abstractNote = item.notes[0].note;
			item.notes = [];
		}
		if (item.abstractNote) {
			item.abstractNote = item.abstractNote.replace(/^\s*(?:abstract|(publisher\s+)?summary)\s+/i, '');
		}

		if (item.DOI) {
			item.DOI = item.DOI.replace(/^doi:\s+/i, '');
		}
		if (item.ISBN && !ZU.cleanISBN(item.ISBN)) delete item.ISBN;
		if (item.ISSN && !ZU.cleanISSN(item.ISSN)) delete item.ISSN;
		
		item.language = item.language || attr(doc, 'article[role="main"]', 'lang');

		if (item.url && item.url.substr(0, 2) == "//") {
			item.url = "https:" + item.url;
		}

		getPDFLink(doc, function (pdfURL) {
			if (pdfURL) {
				item.attachments.push({
					title: 'ScienceDirect Full Text PDF',
					url: pdfURL,
					mimeType: 'application/pdf',
					proxy: false
				});
			}
			item.complete();
		});
	});
	translator.translate();
}


function getArticleList(doc) {
	let articlePaths = [
		'//table[@class="resultRow"]/tbody/tr/td[2]/a',
		'//table[@class="resultRow"]/tbody/tr/td[2]/h3/a',
		'//td[@class="nonSerialResultsList"]/h3/a',
		'//div[@id="bodyMainResults"]//li[contains(@class,"title")]//a',
		'//h2//a[contains(@class, "result-list-title-link")]',
		'//ol[contains(@class, "article-list") or contains(@class, "article-list-items")]//a[contains(@class, "article-content-title")]',
		'//li[contains(@class, "list-chapter")]//h2//a',
		'//h4[contains(@class, "chapter-title")]/a'
	];
	return ZU.xpath(doc, '('
		+ articlePaths.join('|')
		+ ')[not(contains(text(),"PDF (") or contains(text(), "Related Articles"))]'
	);
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		// search page
		var itemList = getArticleList(doc);
		var items = {};
		for (var i = 0, n = itemList.length; i < n; i++) {
			items[itemList[i].href] = itemList[i].textContent;
		}

		Zotero.selectItems(items, function (selectedItems) {
			if (!selectedItems) return;

			// var articles = [];
			for (var i in selectedItems) {
				// articles.push(i);
				ZU.processDocuments(i, scrape); // move this out of the loop when ZU.processDocuments is fixed
			}
		});
	}
	else {
		scrape(doc, url);
	}
}

function getFormInput(form) {
	var inputs = form.elements;
	var values = {};
	for (var i = 0; i < inputs.length; i++) {
		if (!inputs[i].name) continue;
		values[inputs[i].name] = inputs[i].value;
	}

	return values;
}

function formValuesToPostData(values) {
	var s = '';
	for (var v in values) {
		s += '&' + encodeURIComponent(v) + '=' + encodeURIComponent(values[v]);
	}

	if (!s) {
		Zotero.debug("No values provided for POST string");
		return false;
	}

	return s.substr(1);
}

function scrape(doc, url) {
	// On most page the export form uses the POST method
	var form = ZU.xpath(doc, '//form[@name="exportCite"]')[0];
	if (form) {
		Z.debug("Fetching RIS via POST form");
		var values = getFormInput(form);
		values['citation-type'] = 'RIS';
		values.format = 'cite-abs';
		ZU.doPost(form.action, formValuesToPostData(values), function (text) {
			processRIS(doc, text);
		});
		return;
	}


	// On newer pages, there is an GET formular which is only there if
	// the user click on the export button, but we know how the url
	// in the end will be built.
	form = ZU.xpath(doc, '//div[@id="export-citation"]//button')[0];
	if (form) {
		Z.debug("Fetching RIS via GET form (new)");
		var pii = ZU.xpathText(doc, '//meta[@name="citation_pii"]/@content');
		if (!pii) {
			Z.debug("not finding pii in metatag; attempting to parse URL");
			pii = url.match(/\/pii\/([^#?]+)/);
			if (pii) {
				pii = pii[1];
			}
			else {
				Z.debug("cannot find pii");
			}
		}
		if (pii) {
			let risUrl = '/sdfe/arp/cite?pii=' + pii + '&format=application%2Fx-research-info-systems&withabstract=true';
			// Z.debug(risUrl)
			ZU.doGet(risUrl, function (text) {
				processRIS(doc, text);
			});
			return;
		}
	}


	// On some older article pages, there seems to be a different form
	// that uses GET
	form = doc.getElementById('export-form');
	if (form) {
		Z.debug("Fetching RIS via GET form (old)");
		let risUrl = form.action
			+ '?export-format=RIS&export-content=cite-abs';
		ZU.doGet(risUrl, function (text) {
			processRIS(doc, text);
		});
		return;
	}

	throw new Error("Could not scrape metadata via known methods");
}



/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.sciencedirect.com/science/article/pii/S0896627311004430#bib5",
		"defer": true,
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Solving the Autism Puzzle a Few Pieces at a Time",
				"creators": [
					{
						"lastName": "Schaaf",
						"firstName": "Christian P.",
						"creatorType": "author"
					},
					{
						"lastName": "Zoghbi",
						"firstName": "Huda Y.",
						"creatorType": "author"
					}
				],
				"date": "June 9, 2011",
				"DOI": "10.1016/j.neuron.2011.05.025",
				"ISSN": "0896-6273",
				"abstractNote": "In this issue, a pair of studies (Levy et al. and Sanders et al.) identify several de novo copy-number variants that together account for 5%–8% of cases of simplex autism spectrum disorders. These studies suggest that several hundreds of loci are likely to contribute to the complex genetic heterogeneity of this group of disorders. An accompanying study in this issue (Gilman et al.), presents network analysis implicating these CNVs in neural processes related to synapse development, axon targeting, and neuron motility.",
				"issue": "5",
				"journalAbbreviation": "Neuron",
				"language": "en",
				"libraryCatalog": "ScienceDirect",
				"pages": "806-808",
				"publicationTitle": "Neuron",
				"url": "http://www.sciencedirect.com/science/article/pii/S0896627311004430",
				"volume": "70",
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					},
					{
						"title": "ScienceDirect Full Text PDF",
						"mimeType": "application/pdf",
						"proxy": false
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
		"url": "https://www.sciencedirect.com/science/article/pii/S016748890800116X",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Mitochondria-dependent apoptosis in yeast",
				"creators": [
					{
						"lastName": "Pereira",
						"firstName": "C.",
						"creatorType": "author"
					},
					{
						"lastName": "Silva",
						"firstName": "R. D.",
						"creatorType": "author"
					},
					{
						"lastName": "Saraiva",
						"firstName": "L.",
						"creatorType": "author"
					},
					{
						"lastName": "Johansson",
						"firstName": "B.",
						"creatorType": "author"
					},
					{
						"lastName": "Sousa",
						"firstName": "M. J.",
						"creatorType": "author"
					},
					{
						"lastName": "Côrte-Real",
						"firstName": "M.",
						"creatorType": "author"
					}
				],
				"date": "July 1, 2008",
				"DOI": "10.1016/j.bbamcr.2008.03.010",
				"ISSN": "0167-4889",
				"abstractNote": "Mitochondrial involvement in yeast apoptosis is probably the most unifying feature in the field. Reports proposing a role for mitochondria in yeast apoptosis present evidence ranging from the simple observation of ROS accumulation in the cell to the identification of mitochondrial proteins mediating cell death. Although yeast is unarguably a simple model it reveals an elaborate regulation of the death process involving distinct proteins and most likely different pathways, depending on the insult, growth conditions and cell metabolism. This complexity may be due to the interplay between the death pathways and the major signalling routes in the cell, contributing to a whole integrated response. The elucidation of these pathways in yeast has been a valuable help in understanding the intricate mechanisms of cell death in higher eukaryotes, and of severe human diseases associated with mitochondria-dependent apoptosis. In addition, the absence of obvious orthologues of mammalian apoptotic regulators, namely of the Bcl-2 family, favours the use of yeast to assess the function of such proteins. In conclusion, yeast with its distinctive ability to survive without respiration-competent mitochondria is a powerful model to study the involvement of mitochondria and mitochondria interacting proteins in cell death.",
				"issue": "7",
				"journalAbbreviation": "Biochimica et Biophysica Acta (BBA) - Molecular Cell Research",
				"language": "en",
				"libraryCatalog": "ScienceDirect",
				"pages": "1286-1302",
				"publicationTitle": "Biochimica et Biophysica Acta (BBA) - Molecular Cell Research",
				"series": "Apoptosis in yeast",
				"url": "http://www.sciencedirect.com/science/article/pii/S016748890800116X",
				"volume": "1783",
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					},
					{
						"title": "ScienceDirect Full Text PDF",
						"mimeType": "application/pdf",
						"proxy": false
					}
				],
				"tags": [
					{
						"tag": "Apoptotic regulators"
					},
					{
						"tag": "Bcl-2 family"
					},
					{
						"tag": "Mitochondrial fragmentation"
					},
					{
						"tag": "Mitochondrial outer membrane permeabilization"
					},
					{
						"tag": "Permeability transition pore"
					},
					{
						"tag": "Yeast apoptosis"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sciencedirect.com/science/book/9780123694683",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.sciencedirect.com/science/article/pii/B9780123694683500083",
		"items": [
			{
				"itemType": "bookSection",
				"title": "8 - Introduction to Discrete Dislocation Statics and Dynamics",
				"creators": [
					{
						"lastName": "Dierk",
						"firstName": "Raabe",
						"creatorType": "author"
					},
					{
						"lastName": "Janssens",
						"firstName": "KOENRAAD G. F.",
						"creatorType": "editor"
					},
					{
						"lastName": "Raabe",
						"firstName": "DIERK",
						"creatorType": "editor"
					},
					{
						"lastName": "Kozeschnik",
						"firstName": "ERNST",
						"creatorType": "editor"
					},
					{
						"lastName": "Miodownik",
						"firstName": "MARK A.",
						"creatorType": "editor"
					},
					{
						"lastName": "Nestler",
						"firstName": "BRITTA",
						"creatorType": "editor"
					}
				],
				"date": "January 1, 2007",
				"ISBN": "9780123694683",
				"bookTitle": "Computational Materials Engineering",
				"extra": "DOI: 10.1016/B978-012369468-3/50008-3",
				"language": "en",
				"libraryCatalog": "ScienceDirect",
				"pages": "267-316",
				"place": "Burlington",
				"publisher": "Academic Press",
				"url": "http://www.sciencedirect.com/science/article/pii/B9780123694683500083",
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
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
		"url": "https://www.sciencedirect.com/science/article/pii/B9780123706263000508",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Africa",
				"creators": [
					{
						"lastName": "Meybeck",
						"firstName": "M.",
						"creatorType": "author"
					},
					{
						"lastName": "Likens",
						"firstName": "Gene E.",
						"creatorType": "editor"
					}
				],
				"date": "January 1, 2009",
				"ISBN": "9780123706263",
				"abstractNote": "The African continent (30.1million km2) extends from 37°17′N to 34°52S and covers a great variety of climates except the polar climate. Although Africa is often associated to extended arid areas as the Sahara (7million km2) and Kalahari (0.9million km2), it is also characterized by a humid belt in its equatorial part and by few very wet regions as in Cameroon and in Sierra Leone. Some of the largest river basins are found in this continent such as the Congo, also termed Zaire, Nile, Zambezi, Orange, and Niger basins. Common features of Africa river basins are (i) warm temperatures, (ii) general smooth relief due to the absence of recent mountain ranges, except in North Africa and in the Rift Valley, (iii) predominance of old shields and metamorphic rocks with very developed soil cover, and (iv) moderate human impacts on river systems except for the recent spread of river damming. African rivers are characterized by very similar hydrochemical and physical features (ionic contents, suspended particulate matter, or SPM) but differ greatly by their hydrological regimes, which are more developed in this article.",
				"bookTitle": "Encyclopedia of Inland Waters",
				"extra": "DOI: 10.1016/B978-012370626-3.00050-8",
				"language": "en",
				"libraryCatalog": "ScienceDirect",
				"pages": "295-305",
				"place": "Oxford",
				"publisher": "Academic Press",
				"url": "http://www.sciencedirect.com/science/article/pii/B9780123706263000508",
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Africa"
					},
					{
						"tag": "Damming"
					},
					{
						"tag": "Endorheism"
					},
					{
						"tag": "Human impacts"
					},
					{
						"tag": "River quality"
					},
					{
						"tag": "River regimes"
					},
					{
						"tag": "Sediment fluxes"
					},
					{
						"tag": "Tropical rivers"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.sciencedirect.com/science/article/pii/S0006349512000835",
		"defer": true,
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Unwrapping of Nucleosomal DNA Ends: A Multiscale Molecular Dynamics Study",
				"creators": [
					{
						"lastName": "Voltz",
						"firstName": "Karine",
						"creatorType": "author"
					},
					{
						"lastName": "Trylska",
						"firstName": "Joanna",
						"creatorType": "author"
					},
					{
						"lastName": "Calimet",
						"firstName": "Nicolas",
						"creatorType": "author"
					},
					{
						"lastName": "Smith",
						"firstName": "Jeremy C.",
						"creatorType": "author"
					},
					{
						"lastName": "Langowski",
						"firstName": "Jörg",
						"creatorType": "author"
					}
				],
				"date": "February 22, 2012",
				"DOI": "10.1016/j.bpj.2011.11.4028",
				"ISSN": "0006-3495",
				"abstractNote": "To permit access to DNA-binding proteins involved in the control and expression of the genome, the nucleosome undergoes structural remodeling including unwrapping of nucleosomal DNA segments from the nucleosome core. Here we examine the mechanism of DNA dissociation from the nucleosome using microsecond timescale coarse-grained molecular dynamics simulations. The simulations exhibit short-lived, reversible DNA detachments from the nucleosome and long-lived DNA detachments not reversible on the timescale of the simulation. During the short-lived DNA detachments, 9 bp dissociate at one extremity of the nucleosome core and the H3 tail occupies the space freed by the detached DNA. The long-lived DNA detachments are characterized by structural rearrangements of the H3 tail including the formation of a turn-like structure at the base of the tail that sterically impedes the rewrapping of DNA on the nucleosome surface. Removal of the H3 tails causes the long-lived detachments to disappear. The physical consistency of the CG long-lived open state was verified by mapping a CG structure representative of this state back to atomic resolution and performing molecular dynamics as well as by comparing conformation-dependent free energies. Our results suggest that the H3 tail may stabilize the nucleosome in the open state during the initial stages of the nucleosome remodeling process.",
				"issue": "4",
				"journalAbbreviation": "Biophysical Journal",
				"language": "en",
				"libraryCatalog": "ScienceDirect",
				"pages": "849-858",
				"publicationTitle": "Biophysical Journal",
				"shortTitle": "Unwrapping of Nucleosomal DNA Ends",
				"url": "http://www.sciencedirect.com/science/article/pii/S0006349512000835",
				"volume": "102",
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					},
					{
						"title": "ScienceDirect Full Text PDF",
						"mimeType": "application/pdf",
						"proxy": false
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
		"url": "https://www.sciencedirect.com/science/article/pii/S014067361362228X",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Reducing waste from incomplete or unusable reports of biomedical research",
				"creators": [
					{
						"lastName": "Glasziou",
						"firstName": "Paul",
						"creatorType": "author"
					},
					{
						"lastName": "Altman",
						"firstName": "Douglas G",
						"creatorType": "author"
					},
					{
						"lastName": "Bossuyt",
						"firstName": "Patrick",
						"creatorType": "author"
					},
					{
						"lastName": "Boutron",
						"firstName": "Isabelle",
						"creatorType": "author"
					},
					{
						"lastName": "Clarke",
						"firstName": "Mike",
						"creatorType": "author"
					},
					{
						"lastName": "Julious",
						"firstName": "Steven",
						"creatorType": "author"
					},
					{
						"lastName": "Michie",
						"firstName": "Susan",
						"creatorType": "author"
					},
					{
						"lastName": "Moher",
						"firstName": "David",
						"creatorType": "author"
					},
					{
						"lastName": "Wager",
						"firstName": "Elizabeth",
						"creatorType": "author"
					}
				],
				"date": "January 18, 2014",
				"DOI": "10.1016/S0140-6736(13)62228-X",
				"ISSN": "0140-6736",
				"abstractNote": "Research publication can both communicate and miscommunicate. Unless research is adequately reported, the time and resources invested in the conduct of research is wasted. Reporting guidelines such as CONSORT, STARD, PRISMA, and ARRIVE aim to improve the quality of research reports, but all are much less adopted and adhered to than they should be. Adequate reports of research should clearly describe which questions were addressed and why, what was done, what was shown, and what the findings mean. However, substantial failures occur in each of these elements. For example, studies of published trial reports showed that the poor description of interventions meant that 40–89% were non-replicable; comparisons of protocols with publications showed that most studies had at least one primary outcome changed, introduced, or omitted; and investigators of new trials rarely set their findings in the context of a systematic review, and cited a very small and biased selection of previous relevant trials. Although best documented in reports of controlled trials, inadequate reporting occurs in all types of studies—animal and other preclinical studies, diagnostic studies, epidemiological studies, clinical prediction research, surveys, and qualitative studies. In this report, and in the Series more generally, we point to a waste at all stages in medical research. Although a more nuanced understanding of the complex systems involved in the conduct, writing, and publication of research is desirable, some immediate action can be taken to improve the reporting of research. Evidence for some recommendations is clear: change the current system of research rewards and regulations to encourage better and more complete reporting, and fund the development and maintenance of infrastructure to support better reporting, linkage, and archiving of all elements of research. However, the high amount of waste also warrants future investment in the monitoring of and research into reporting of research, and active implementation of the findings to ensure that research reports better address the needs of the range of research users.",
				"issue": "9913",
				"journalAbbreviation": "The Lancet",
				"language": "en",
				"libraryCatalog": "ScienceDirect",
				"pages": "267-276",
				"publicationTitle": "The Lancet",
				"url": "http://www.sciencedirect.com/science/article/pii/S014067361362228X",
				"volume": "383",
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					},
					{
						"title": "ScienceDirect Full Text PDF",
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
		"url": "https://www.sciencedirect.com/science/article/abs/pii/0584853976801316",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The low frequency absorption spectra and assignments of fluoro benzenes",
				"creators": [
					{
						"lastName": "Eaton",
						"firstName": "Valerie J.",
						"creatorType": "author"
					},
					{
						"lastName": "Pearce",
						"firstName": "R. A. R.",
						"creatorType": "author"
					},
					{
						"lastName": "Steele",
						"firstName": "D.",
						"creatorType": "author"
					},
					{
						"lastName": "Tindle",
						"firstName": "J. W.",
						"creatorType": "author"
					}
				],
				"date": "January 1, 1976",
				"DOI": "10.1016/0584-8539(76)80131-6",
				"ISSN": "0584-8539",
				"abstractNote": "The absorption spectra between 400 and 50 cm−1 have been measured for the following compounds; 1,2-C6H4F2; 1,4-C6H4F2; 1,2,4-C6H3F3; 1,3,5-C6H3F3; 1,2,4,5-C6H2F4; 1,2,3,4-C6H2F4 (to 200 cm−1 only), 1,2,3,5,-C6H2F4; C6F5H and C6F6. Some new Raman data is also presented. Vibrational assignments have been criticallly examine by seeking consistency between assignments for different molecules and by comparison with predicted frequencies. There is clear evidence for a steady reduction in the force constant for the out-of-plane CH deformation with increasing fluorine substitution.",
				"issue": "4",
				"journalAbbreviation": "Spectrochimica Acta Part A: Molecular Spectroscopy",
				"language": "en",
				"libraryCatalog": "ScienceDirect",
				"pages": "663-672",
				"publicationTitle": "Spectrochimica Acta Part A: Molecular Spectroscopy",
				"url": "http://www.sciencedirect.com/science/article/pii/0584853976801316",
				"volume": "32",
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					},
					{
						"title": "ScienceDirect Full Text PDF",
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
		"url": "https://www.sciencedirect.com/science/article/pii/0022460X72904348",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The modal density for flexural vibration of thick plates and bars",
				"creators": [
					{
						"lastName": "Nelson",
						"firstName": "H. M.",
						"creatorType": "author"
					}
				],
				"date": "November 22, 1972",
				"DOI": "10.1016/0022-460X(72)90434-8",
				"ISSN": "0022-460X",
				"abstractNote": "The problem of estimating the modal density for flexurally vibrating plates and bars is approached by way of a travelling wave, rather than normal mode, decomposition. This viewpoint leads to simple expressions for modal densities in terms of the system geometry, surface wave velocity and a factor which is a function of the frequency-thickness product. Values of the multiplying factor are presented together with correction factors for existing thin-plate and thin-bar estimates. These factors are shown to involve only Poisson's ratio as a parameter, and to vary only slightly for a Poisson's ratio range of 0·25 to 0·35. The correction curve for plates is shown to be in general agreement with one proposed by Bolotin.",
				"issue": "2",
				"journalAbbreviation": "Journal of Sound and Vibration",
				"language": "en",
				"libraryCatalog": "ScienceDirect",
				"pages": "255-261",
				"publicationTitle": "Journal of Sound and Vibration",
				"url": "http://www.sciencedirect.com/science/article/pii/0022460X72904348",
				"volume": "25",
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					},
					{
						"title": "ScienceDirect Full Text PDF",
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
		"url": "https://www.sciencedirect.com/science/article/pii/S2095311916614284",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Increased sink capacity enhances C and N assimilation under drought and elevated CO2 conditions in maize",
				"creators": [
					{
						"lastName": "Zong",
						"firstName": "Yu-zheng",
						"creatorType": "author"
					},
					{
						"lastName": "Shangguan",
						"firstName": "Zhou-ping",
						"creatorType": "author"
					}
				],
				"date": "December 1, 2016",
				"DOI": "10.1016/S2095-3119(16)61428-4",
				"ISSN": "2095-3119",
				"abstractNote": "The maintenance of rapid growth under conditions of CO2 enrichment is directly related to the capacity of new leaves to use or store the additional assimilated carbon (C) and nitrogen (N). Under drought conditions, however, less is known about C and N transport in C4 plants and the contributions of these processes to new foliar growth. We measured the patterns of C and N accumulation in maize (Zea mays L.) seedlings using 13C and 15N as tracers in CO2 climate chambers (380 or 750 μmol mol−1) under a mild drought stress induced with 10% PEG-6000. The drought stress under ambient conditions decreased the biomass production of the maize plants; however, this effect was reduced under elevated CO2. Compared with the water-stressed maize plants under atmospheric CO2, the treatment that combined elevated CO2 with water stress increased the accumulation of biomass, partitioned more C and N to new leaves as well as enhanced the carbon resource in ageing leaves and the carbon pool in new leaves. However, the C counterflow capability of the roots decreased. The elevated CO2 increased the time needed for newly acquired N to be present in the roots and increased the proportion of new N in the leaves. The maize plants supported the development of new leaves at elevated CO2 by altering the transport and remobilization of C and N. Under drought conditions, the increased activity of new leaves in relation to the storage of C and N sustained the enhanced growth of these plants under elevated CO2.",
				"issue": "12",
				"journalAbbreviation": "Journal of Integrative Agriculture",
				"language": "en",
				"libraryCatalog": "ScienceDirect",
				"pages": "2775-2785",
				"publicationTitle": "Journal of Integrative Agriculture",
				"url": "http://www.sciencedirect.com/science/article/pii/S2095311916614284",
				"volume": "15",
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					},
					{
						"title": "ScienceDirect Full Text PDF",
						"mimeType": "application/pdf",
						"proxy": false
					}
				],
				"tags": [
					{
						"tag": "allocation"
					},
					{
						"tag": "carbon"
					},
					{
						"tag": "drought"
					},
					{
						"tag": "elevated CO"
					},
					{
						"tag": "nitrogen"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sciencedirect.com/search?qs=zotero&show=25&sortBy=relevance",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.sciencedirect.com/journal/le-pharmacien-hospitalier-et-clinicien/vol/52/issue/4",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.sciencedirect.com/handbook/handbook-of-complex-analysis/vol/1/suppl/C",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.sciencedirect.com/bookseries/advances-in-computers/vol/111/suppl/C",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.sciencedirect.com/science/article/pii/S2007471917300571",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Cálculo mental en niños y su relación con habilidades cognitivas",
				"creators": [
					{
						"lastName": "Formoso",
						"firstName": "Jesica",
						"creatorType": "author"
					},
					{
						"lastName": "Injoque-Ricle",
						"firstName": "Irene",
						"creatorType": "author"
					},
					{
						"lastName": "Jacubovich",
						"firstName": "Silvia",
						"creatorType": "author"
					},
					{
						"lastName": "Barreyro",
						"firstName": "Juan Pablo",
						"creatorType": "author"
					}
				],
				"date": "December 1, 2017",
				"DOI": "10.1016/j.aipprr.2017.11.004",
				"ISSN": "2007-4719",
				"abstractNote": "Resumen\nEste trabajo buscó analizar si las variables memoria de trabajo (MT) verbal, MT visoespacial, velocidad de procesamiento y habilidad verbal pueden predecir la habilidad de los niños para el cálculo mental durante la realización de problemas aritméticos simples. Se administraron los subtests Vocabulario y Span de Dígitos del WISC-III; el subtest Casita de Animales del WPPSI-R y una prueba de problemas aritméticos (ad hoc) a 70 niños de 6 años. Un análisis de regresión lineal con el método stepwise mostró que solo la MT visoespacial predijo la variabilidad en las puntuaciones de cálculo mental (t=4.72; p<0.001; β=0.50). Los resultados son contrarios a estudios realizados en adultos y niños mayores en los cuales el mayor peso recae sobre la MT verbal. Es posible que a medida que los niños crecen la automatización de ciertos procesos de conteo y el almacenamiento de hechos aritméticos en la memoria de largo plazo produzca que dependan en mayor medida de la MT verbal para la resolución de este tipo de cálculos.\nThis study aimed to analyze whether verbal working memory (WM), visual-spatial WM, processing speed, and verbal ability predicted children's ability to perform mental arithmetic. Five tests were administered to 70 6-years-old children: the Vocabulary and Digits Span subtests from the WISC-III Intelligence Scale, the Animal Pegs subtest from WPPSI-R, and an arithmetic test (ad hoc). A linear regression analysis showed that only visual-spatial WM predicted the variability in children's scores in the arithmetic test (t=4.72; P<.001; β=.50). These findings contradict studies carried out in adults and older children where verbal WM seemed to play a greater role in the subject's ability to conduct calculations without external aids. It is possible that as they grow older, the automation of certain counting processes, as well as the storage and recovery of arithmetic knowledge from long-term memory will cause them to rely primarily on verbal WM resources.",
				"issue": "3",
				"journalAbbreviation": "Acta de Investigación Psicológica",
				"language": "es",
				"libraryCatalog": "ScienceDirect",
				"pages": "2766-2774",
				"publicationTitle": "Acta de Investigación Psicológica",
				"url": "http://www.sciencedirect.com/science/article/pii/S2007471917300571",
				"volume": "7",
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					},
					{
						"title": "ScienceDirect Full Text PDF",
						"mimeType": "application/pdf",
						"proxy": false
					}
				],
				"tags": [
					{
						"tag": "Children"
					},
					{
						"tag": "Cálculo mental"
					},
					{
						"tag": "Habilidad verbal"
					},
					{
						"tag": "Memoria de trabajo"
					},
					{
						"tag": "Mental arithmetic"
					},
					{
						"tag": "Niños"
					},
					{
						"tag": "Processing speed"
					},
					{
						"tag": "Velocidad de procesamiento"
					},
					{
						"tag": "Verbal ability"
					},
					{
						"tag": "Working memory"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.sciencedirect.com/search/advanced?qs=testing",
		"items": "multiple"
	}
]
/** END TEST CASES **/
