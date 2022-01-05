{
	"translatorID": "e034d9be-c420-42cf-8311-23bca5735a32",
	"translatorType": 4,
	"label": "Baidu Scholar",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?xueshu\\.baidu\\.com/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-17 15:20:00"
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
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}


function detectWeb(doc, url) {
	if (url.includes('paperid=')) {
		return "journalArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('h3>a[href*="show?paperid="]');
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
				return;
			}
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
	var dataUrl = attr(doc, 'i.reqdata', 'url');
	let paperId = undefined;
	const paperIdMatches = _url.match(/paperid=([a-z0-9]*)/i);
	if (paperIdMatches[1]) {
		paperId = paperIdMatches[1];
	}
	const risUrl = `https://xueshu.baidu.com/u/citation?type=ris&paperid=${paperId}`;
	var title = doc.title.replace('_百度学术', '');

	var tags = [];
	doc.querySelectorAll('p.kw_main span a').forEach(e => tags.push(ZU.trimInternal(e.textContent)));
	ZU.doGet(risUrl, function (ris) {
		// Z.debug({ ris });
		// delete parenthesis in pages information, e.g. SP  - 5-7(3)
		ris = ris.replace(/(SP\s+-\s\d+-\d+)\(\d+\)$/m, "$1");
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(ris);
		translator.setHandler("itemDone", function (obj, item) {
			item.url = dataUrl;
			var doiLink = attr(doc, 'a.dl_item[data-url*="doi.org/"]', 'data-url');
			if (!item.DOI && doiLink) {
				item.DOI = doiLink.substr(doiLink.indexOf('doi.org/') + 8);
			}
			if (!item.abstractNote) {
				item.abstractNote = text(doc, 'div.sc_abstract') || text(doc, 'p.abstract');
			}
			item.attachments.push({
				title: "Snapshot",
				document: doc
			});
			item.tags = tags;
			if (!item.title) {
				item.title = title;
			}
			if (!item.creators || item.creators.length == 0) {
				item.creators = [];
				doc.querySelectorAll('p.author_text a').forEach((e) => {
					item.creators.push(ZU.cleanAuthor(e.textContent, 'author', true));
				});
			}
			for (let i = 0, n = item.creators.length; i < n; i++) {
				let creator = item.creators[i];
				if (!creator.firstName && creator.lastName.search(/[A-Za-z]/) == -1 && !creator.lastName.includes(' ')) {
					// Chinese name: first character is last name, the rest are first name (ignoring compound last names which are rare)
					creator.firstName = creator.lastName.substr(1);
					creator.lastName = creator.lastName.charAt(0);
				}
				item.creators[i] = creator;
			}
			if (!item.publicationTitle) {
				item.publicationTitle = attr(doc, 'a.journal_title', 'title');
			}
			if (!item.date && text(doc, 'div.year_wr p.kw_main')) {
				item.date = ZU.trimInternal(text(doc, 'div.year_wr p.kw_main'));
			}
			if (!item.DOI && text(doc, 'div.doi_wr p.kw_main')) {
				item.DOI = ZU.trimInternal(text(doc, 'div.doi_wr p.kw_main'));
			}

			item.complete();
		});
		translator.translate();
	});
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://xueshu.baidu.com/usercenter/paper/show?paperid=b3ab239032d44d951d8eee26d7bc44bf&site=xueshu_se",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Zotero: information management software 2.0",
				"creators": [
					{
						"lastName": "Fernandez",
						"firstName": "P.",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"DOI": "10.1108/07419051111154758",
				"abstractNote": "Purpose – The purpose of this paper is to highlight how the open-source bibliographic management program Zotero harnesses Web 2.0 features to make library resources more accessible to casual users without sacrificing advanced features. This reduces the barriers understanding library resources and provides additional functionality when organizing information resources. Design/methodology/approach – The paper reviews select aspects of the program to illustrate how it can be used by patrons and information professionals, and why information professionals should be aware of it. Findings – Zotero has some limitations, but succeeds in meeting the information management needs of a wide variety of users, particularly users who use online resources. Originality/value – This paper is of interest to information professionals seeking free software that can make managing bibliographic information easier for themselves and their patrons.",
				"issue": "4",
				"libraryCatalog": "Baidu Scholar",
				"pages": "5-7",
				"publicationTitle": "Library Hi Tech News",
				"shortTitle": "Zotero",
				"url": "http://www.emeraldinsight.com/doi/pdfplus/10.1108/07419051111154758",
				"volume": "28",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Citation management"
					},
					{
						"tag": "Internet"
					},
					{
						"tag": "Library services"
					},
					{
						"tag": "Open source"
					},
					{
						"tag": "Reference management"
					},
					{
						"tag": "Technology"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://xueshu.baidu.com/usercenter/paper/show?paperid=29fcf50a863692823c3f336a9ee1efea&site=xueshu_se",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Comparativo dos softwares de gerenciamento de referências bibliográficas: Mendeley, EndNote e Zotero",
				"creators": [
					{
						"lastName": "Yamakawa",
						"firstName": "E. K.",
						"creatorType": "author"
					},
					{
						"lastName": "Kubota",
						"firstName": "F. I.",
						"creatorType": "author"
					},
					{
						"lastName": "Beuren",
						"firstName": "F. H.",
						"creatorType": "author"
					},
					{
						"lastName": "Scalvenzi",
						"firstName": "L.",
						"creatorType": "author"
					},
					{
						"lastName": "Miguel",
						"firstName": "Pac",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"DOI": "10.1590/0103-37862014000200006",
				"abstractNote": "A elaboração de uma revisão bibliográfica confiável, a partir de trabalhos relevantes publicados anteriormente, é fundamental para evidenciar a originalidade e a contribuição científica dos trabalhos de pesquisa. Devido à grande quantidade de bases de dados e de publicações disponíveis, torna-se necessário utilizar ferramentas que auxiliem na gestão das referências bibliográficas de uma maneira fácil e padronizada. O objetivo deste artigo é examinar três de gerenciamento bibliográfico utilizados com frequência por pesquisadores acadêmicos, são eles: , e . Nesse sentido, buscou-se, em primeiro lugar, evidenciar seus principais benefícios e as possíveis dificuldades de utilização. Em segundo lugar, procurou-se comparar suas principais características por meio de uma pesquisa teórico-conceitual baseada em literatura especializada, o que permitiu utilizá-los e analisá-los de maneira crítica. Assim sendo, evidenciou-se as principais particularidades de cada e foi elaborado um quadro comparativo entre os mesmos. Considerando as características analisadas nos três , concluiu-se que todos, ao mesmo tempo em que facilitam o trabalho dos pesquisadores, possuem ferramentas que facilitam as buscas, a organização e a análise dos artigos.",
				"issue": "2",
				"libraryCatalog": "Baidu Scholar",
				"pages": "167-176",
				"publicationTitle": "Transinformao",
				"shortTitle": "Comparativo dos softwares de gerenciamento de referências bibliográficas",
				"url": "http://www.scielo.br/scielo.php?script=sci_arttext&amp;pid=S0103-37862014000200167&amp;lng=pt&amp;nrm=is",
				"volume": "26",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "https://xueshu.baidu.com/s?wd=zotero&rsv_bp=0&tn=SE_baiduxueshu_c1gjeupa&rsv_spt=3&ie=utf-8&f=8&rsv_sug2=0&sc_f_para=sc_tasktype%3D%7BfirstSimpleSearch%7D",
		"items": "multiple"
	}
]
/** END TEST CASES **/
