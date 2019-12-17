{
	"translatorID": "f4a5876a-3e53-40e2-9032-d99a30d7a6fc",
	"label": "ACLWeb",
	"creator": "Guy Aglionby",
	"target": "^https?://(www\\.)?aclweb\\.org/anthology/[^#]+",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-11-07 17:17:11"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Guy Aglionby
	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

var ext2mime = {
	gz: 'application/gzip',
	tgz: 'application/gzip',
	pdf: 'application/pdf',
	zip: 'application/zip',
	tar: 'application/x-tar',
	txt: 'text/plain',
	rar: 'application/x-rar-compressed',
	rtf: 'application/rtf',
	bz2: 'application/x-bzip2',
	bz: 'application/x-bzip',
	doc: 'application/msword',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	ppt: 'application/vnd.ms-powerpoint',
	pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	html: 'text/html',
	png: 'image/png',
	gif: 'image/gif',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	mp4: 'video/mp4'
};

function detectWeb(doc, url) {
	let paperIdUrl = /[/][A-Z][0-9]{2}-[0-9]{4}[/]?$/;
	if (doc.contentType === 'application/pdf' || url.endsWith('.pdf') || url.endsWith('.bib')
		|| url.match(paperIdUrl)) {
		if (url.endsWith('/')) {
			url = url.slice(0, -1);
		}
		let id = url.split('/').pop().toLowerCase();
		return id[0] == 'j' || id[0] == 'q' ? 'journalArticle' : 'conferencePaper';
	}
	else if ((url.includes('/events/') || url.includes('/people/')
		|| url.includes('/volumes/') || url.includes('/search/'))
		&& getSearchResults(doc, url)) {
		return 'multiple';
	}
	return false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) === 'multiple') {
		Zotero.selectItems(getSearchResults(doc, url), function (selected) {
			if (selected) {
				ZU.processDocuments(Object.keys(selected), scrape);
			}
		});
	}
	else if (url.endsWith('.bib')) {
		// e.g. http://aclweb.org/anthology/papers/P/P18/P18-1001.bib
		let paperURL = url.replace('.bib', '');
		ZU.processDocuments(paperURL, scrape);
	}
	else if (doc.contentType === 'application/pdf' || url.endsWith('.pdf')) {
		// e.g. http://aclweb.org/anthology/P18-1001.pdf
		let paperID = url.split('/').pop().match(/[A-Z]\d{2}-\d{4}/)[0];
		let paperURL = constructPaperURL(paperID);
		ZU.processDocuments(paperURL, scrape);
	}
	else {
		scrape(doc);
	}
}

function scrape(doc) {
	let bibtex = ZU.xpath(doc, '//button[contains(text(), "Copy BibTeX to Clipboard")]/@data-clipboard-text')[0].value;
	let pdfURL = ZU.xpath(doc, '//a[span[contains(text(), "PDF")]]/@href')[0].value;
	let translator = Zotero.loadTranslator("import");
	translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
	translator.setString(bibtex);
	translator.setHandler("itemDone", function (obj, item) {
		item.attachments.push({
			url: pdfURL,
			title: 'Full Text PDF',
			mimeType: 'application/pdf'
		});
		delete item.itemID;
		
		if (item.date) {
			item.date = ZU.strToISO(item.date);
		}
		
		if (item.itemType == 'conferencePaper') {
			item.conferenceName = getVenue(doc, item.publicationTitle);
		}
		
		if (Z.getHiddenPref('attachSupplementary')) {
			let supplementaries = ZU.xpath(doc, '//div[contains(@class, "acl-paper-link-block")]//a[contains(@class, "btn-attachment")]');
			
			supplementaries.forEach(function (supplementary) {
				let ext = supplementary.href.split('.').pop();
				let supplementaryMime = Z.getHiddenPref('supplementaryAsLink') ? 'text/html' : ext2mime[ext];
				item.attachments.push({
					url: supplementary.href,
					title: supplementary.text,
					mimeType: supplementaryMime || 'text/html',
					snapshot: !Z.getHiddenPref('supplementaryAsLink')
				});
			});
		}
		
		item.complete();
	});
	translator.translate();
}

function getVenue(doc, pubTitle) {
	let venueElements = ZU.xpath(doc, '//dt[contains(text(), "Venue")]//following::dd[1]/a');
	let venues = venueElements.map(function (v) {
		return v.innerText.trim();
	});
	
	if (!venues.length) {
		return '';
	}
	
	let year = ZU.xpath(doc, '//dt[contains(text(), "Year")]/following::dd[1]')[0].textContent;
	let venueString = venues.join('-') + ' ' + year;
	
	if (pubTitle.includes('Student') || pubTitle.includes('Demonstration') || pubTitle.includes('Tutorial')) {
		// better to use full proceedingsTitle to cite these publications
		return '';
	}
	if (venueString.includes('*SEMEVAL')) {
		if (pubTitle.includes('SENSEVAL')) {
			return 'SENSEVAL ' + year;
		}
		else if (pubTitle.includes('Evaluation') && !pubTitle.includes('Joint')) {
			return 'SemEval ' + year;
		}
		else if (!pubTitle.includes('Evaluation') && pubTitle.includes('Joint')) {
			return '*SEM ' + year;
		}
		else if (pubTitle.includes('Volume 1') && pubTitle.includes('Volume 2')) {
			return '*SEM/SemEval ' + year;
		}
		else if (pubTitle.includes('SemEval')) {
			return 'SemEval ' + year;
		}
		else {
			return '*SEM ' + year;
		}
	}
	else if (venueString.includes('WS')) {
		// better to use full proceedingsTitle to cite these publications
		return '';
	}
	else if (!venueString.includes("HLT") && pubTitle.match('HLT|Human Language Technolog(y|ies)')) {
		return venues.join('-') + '-HLT ' + year;
	}
	return venueString;
}

function getSearchResults(doc, url) {
	let papers;
	let items = {};
	if (url.includes('/search/')) {
		// e.g. https://www.aclweb.org/anthology/search/?q=foo+bar
		papers = ZU.xpath(doc, '//div[contains(@class, "gsc-webResult")]//div[contains(@class, "gs-title")]/a');
		for (let i = 0; i < papers.length; i++) {
			let paperId = papers[i].href.split('/').pop();
			items[constructPaperURL(paperId)] = papers[i].text;
		}
	}
	else {
		papers = ZU.xpath(doc, '//strong/a[contains(@href, "/anthology/")]');
		for (let i = 0; i < papers.length; i++) {
			items[papers[i].href] = papers[i].text;
		}
	}
	return Object.keys(items).length ? items : false;
}

function constructPaperURL(id) {
	const STUB_URL = 'https://aclweb.org/anthology/papers/';
	let idComponents = id.split('-');
	return STUB_URL + idComponents[0][0] + '/' + idComponents[0] + '/' + id;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://aclweb.org/anthology/events/acl-2018/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://aclweb.org/anthology/volumes/P18-1/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://aclweb.org/anthology/people/i/iryna-gurevych/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://aclweb.org/anthology/Q18-1001/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Whodunnit? Crime Drama as a Case for Natural Language Understanding",
				"creators": [
					{
						"firstName": "Lea",
						"lastName": "Frermann",
						"creatorType": "author"
					},
					{
						"firstName": "Shay B.",
						"lastName": "Cohen",
						"creatorType": "author"
					},
					{
						"firstName": "Mirella",
						"lastName": "Lapata",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"DOI": "10.1162/tacl_a_00001",
				"abstractNote": "In this paper we argue that crime drama exemplified in television programs such as CSI: Crime Scene Investigation is an ideal testbed for approximating real-world natural language understanding and the complex inferences associated with it. We propose to treat crime drama as a new inference task, capitalizing on the fact that each episode poses the same basic question (i.e., who committed the crime) and naturally provides the answer when the perpetrator is revealed. We develop a new dataset based on CSI episodes, formalize perpetrator identification as a sequence labeling problem, and develop an LSTM-based model which learns from multi-modal data. Experimental results show that an incremental inference strategy is key to making accurate guesses as well as learning from representations fusing textual, visual, and acoustic input.",
				"libraryCatalog": "ACLWeb",
				"pages": "1–15",
				"publicationTitle": "Transactions of the Association for Computational Linguistics",
				"shortTitle": "Whodunnit?",
				"url": "https://www.aclweb.org/anthology/Q18-1001",
				"volume": "6",
				"attachments": [
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
		"url": "https://www.aclweb.org/anthology/W04-0801/",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "The Basque lexical-sample task",
				"creators": [
					{
						"firstName": "Eneko",
						"lastName": "Agirre",
						"creatorType": "author"
					},
					{
						"firstName": "Itziar",
						"lastName": "Aldabe",
						"creatorType": "author"
					},
					{
						"firstName": "Mikel",
						"lastName": "Lersundi",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Martínez",
						"creatorType": "author"
					},
					{
						"firstName": "Eli",
						"lastName": "Pociello",
						"creatorType": "author"
					},
					{
						"firstName": "Larraitz",
						"lastName": "Uria",
						"creatorType": "author"
					}
				],
				"date": "2004-07",
				"conferenceName": "SENSEVAL 2004",
				"libraryCatalog": "ACLWeb",
				"pages": "1–4",
				"place": "Barcelona, Spain",
				"proceedingsTitle": "Proceedings of SENSEVAL-3, the Third International Workshop on the Evaluation of Systems for the Semantic Analysis of Text",
				"publisher": "Association for Computational Linguistics",
				"url": "https://www.aclweb.org/anthology/W04-0801",
				"attachments": [
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
		"url": "https://www.aclweb.org/anthology/W19-0101/",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Can Entropy Explain Successor Surprisal Effects in Reading?",
				"creators": [
					{
						"firstName": "Marten",
						"lastName": "van Schijndel",
						"creatorType": "author"
					},
					{
						"firstName": "Tal",
						"lastName": "Linzen",
						"creatorType": "author"
					}
				],
				"date": "2019",
				"DOI": "10.7275/qtbb-9d05",
				"libraryCatalog": "ACLWeb",
				"pages": "1–7",
				"proceedingsTitle": "Proceedings of the Society for Computation in Linguistics (SCiL) 2019",
				"url": "https://www.aclweb.org/anthology/W19-0101",
				"attachments": [
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
		"url": "https://www.aclweb.org/anthology/N12-2001/",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Finding the Right Supervisor: Expert-Finding in a University Domain",
				"creators": [
					{
						"firstName": "Fawaz",
						"lastName": "Alarfaj",
						"creatorType": "author"
					},
					{
						"firstName": "Udo",
						"lastName": "Kruschwitz",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Hunter",
						"creatorType": "author"
					},
					{
						"firstName": "Chris",
						"lastName": "Fox",
						"creatorType": "author"
					}
				],
				"date": "2012-06",
				"libraryCatalog": "ACLWeb",
				"pages": "1–6",
				"place": "Montréal, Canada",
				"proceedingsTitle": "Proceedings of the NAACL HLT 2012 Student Research Workshop",
				"publisher": "Association for Computational Linguistics",
				"shortTitle": "Finding the Right Supervisor",
				"url": "https://www.aclweb.org/anthology/N12-2001",
				"attachments": [
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
		"url": "https://www.aclweb.org/anthology/N18-1001/",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Label-Aware Double Transfer Learning for Cross-Specialty Medical Named Entity Recognition",
				"creators": [
					{
						"firstName": "Zhenghui",
						"lastName": "Wang",
						"creatorType": "author"
					},
					{
						"firstName": "Yanru",
						"lastName": "Qu",
						"creatorType": "author"
					},
					{
						"firstName": "Liheng",
						"lastName": "Chen",
						"creatorType": "author"
					},
					{
						"firstName": "Jian",
						"lastName": "Shen",
						"creatorType": "author"
					},
					{
						"firstName": "Weinan",
						"lastName": "Zhang",
						"creatorType": "author"
					},
					{
						"firstName": "Shaodian",
						"lastName": "Zhang",
						"creatorType": "author"
					},
					{
						"firstName": "Yimei",
						"lastName": "Gao",
						"creatorType": "author"
					},
					{
						"firstName": "Gen",
						"lastName": "Gu",
						"creatorType": "author"
					},
					{
						"firstName": "Ken",
						"lastName": "Chen",
						"creatorType": "author"
					},
					{
						"firstName": "Yong",
						"lastName": "Yu",
						"creatorType": "author"
					}
				],
				"date": "2018-06",
				"DOI": "10.18653/v1/N18-1001",
				"abstractNote": "We study the problem of named entity recognition (NER) from electronic medical records, which is one of the most fundamental and critical problems for medical text mining. Medical records which are written by clinicians from different specialties usually contain quite different terminologies and writing styles. The difference of specialties and the cost of human annotation makes it particularly difficult to train a universal medical NER system. In this paper, we propose a label-aware double transfer learning framework (La-DTL) for cross-specialty NER, so that a medical NER system designed for one specialty could be conveniently applied to another one with minimal annotation efforts. The transferability is guaranteed by two components: (i) we propose label-aware MMD for feature representation transfer, and (ii) we perform parameter transfer with a theoretical upper bound which is also label aware. We conduct extensive experiments on 12 cross-specialty NER tasks. The experimental results demonstrate that La-DTL provides consistent accuracy improvement over strong baselines. Besides, the promising experimental results on non-medical NER scenarios indicate that La-DTL is potential to be seamlessly adapted to a wide range of NER tasks.",
				"conferenceName": "NAACL-HLT 2018",
				"libraryCatalog": "ACLWeb",
				"pages": "1–15",
				"place": "New Orleans, Louisiana",
				"proceedingsTitle": "Proceedings of the 2018 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long Papers)",
				"publisher": "Association for Computational Linguistics",
				"url": "https://www.aclweb.org/anthology/N18-1001",
				"attachments": [
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
	}
]
/** END TEST CASES **/
