{
	"translatorID": "e034d9be-c420-42cf-8311-23bca5735a32",
	"label": "Baidu Scholar",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?xueshu\\.baidu\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-09-03 16:52:55"
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
	if (url.indexOf('wd=paperuri')>-1) {
		return "journalArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('h3>a[href*="wd=paperuri"]');
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
	var dataUrl = attr(doc, 'i.reqdata', 'url');
	var diversion = attr(doc, 'i.reqdata', 'diversion');
	var sign = attr(doc, 'a.sc_q' , 'data-sign');
	var risUrl = "http://xueshu.baidu.com/u/citation?&url=" + encodeURIComponent(dataUrl) + "&sign=" + sign + "&diversion=" + diversion + "&t=ris";

	ZU.doGet(risUrl, function(ris) {
		//Z.debug(ris);
		//delete parenthesis in pages information, e.g. SP  - 5-7(3)
		ris = ris.replace(/(SP\s+-\s\d+-\d+)\(\d+\)$/m, "$1");
		
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(ris);
		translator.setHandler("itemDone", function(obj, item) {
			item.url = dataUrl;
			var doiLink = attr(doc, 'a.dl_item[data-url*="doi.org/"]', 'data-url');
			if (!item.DOI && doiLink) {
				item.DOI = doiLink.substr(doiLink.indexOf('doi.org/')+8);
			}
			if (!item.abstractNote) {
				item.abstractNote = text(doc, 'div.sc_abstract') || text(doc, 'p.abstract');
			}
			item.attachments.push({
				title: "Snapshot",
				document: doc
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
		"url": "http://xueshu.baidu.com/s?wd=paperuri%3A%28b3ab239032d44d951d8eee26d7bc44bf%29&filter=sc_long_sign&sc_ks_para=q%3DZotero%3A%20information%20management%20software%202.0&sc_us=11047153676455408520&tn=SE_baiduxueshu_c1gjeupa&ie=utf-8",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Zotero: information management software 2.0",
				"creators": [
					{
						"lastName": "Fernandez",
						"firstName": "Peter",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"abstractNote": "Purpose – The purpose of this paper is to highlight how the open-source bibliographic management program Zotero harnesses Web 2.0 features to make library...",
				"issue": "4",
				"libraryCatalog": "Baidu Scholar",
				"pages": "5-7",
				"publicationTitle": "Library Hi Tech News",
				"shortTitle": "Zotero",
				"url": "http://www.emeraldinsight.com/doi/full/10.1108/07419051111154758",
				"volume": "28",
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
		"url": "http://xueshu.baidu.com/s?wd=paperuri%3A%2829fcf50a863692823c3f336a9ee1efea%29&filter=sc_long_sign&sc_ks_para=q%3DComparativo%20dos%20softwares%20de%20gerenciamento%20de%20refer%C3%AAncias%20bibliogr%C3%A1ficas%3A%20Mendeley%2C%20EndNote%20e%20Zotero&sc_us=1497086148200551335&tn=SE_baiduxueshu_c1gjeupa&ie=utf-8",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Comparativo dos softwares de gerenciamento de referências bibliográficas: Mendeley, EndNote e Zotero",
				"creators": [
					{
						"lastName": "Yamakawa",
						"firstName": "Eduardo Kazumi",
						"creatorType": "author"
					},
					{
						"lastName": "Kubota",
						"firstName": "Flávio Issao",
						"creatorType": "author"
					},
					{
						"lastName": "Beuren",
						"firstName": "Fernanda Hansch",
						"creatorType": "author"
					},
					{
						"lastName": "Scalvenzi",
						"firstName": "Lisiane",
						"creatorType": "author"
					},
					{
						"lastName": "Miguel",
						"firstName": "Paulo Augusto Cauchik",
						"creatorType": "author"
					},
					{
						"lastName": "Yamakawa",
						"firstName": "Eduardo Kazumi",
						"creatorType": "author"
					},
					{
						"lastName": "Kubota",
						"firstName": "Flávio Issao",
						"creatorType": "author"
					},
					{
						"lastName": "Beuren",
						"firstName": "Fernanda Hansch",
						"creatorType": "author"
					},
					{
						"lastName": "Scalvenzi",
						"firstName": "Lisiane",
						"creatorType": "author"
					},
					{
						"lastName": "Miguel",
						"firstName": "Paulo Augusto Cauchik",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"DOI": "10.1590/0103-37862014000200006",
				"abstractNote": "A elaboração de uma revisão bibliográfica confiável, a partir de trabalhos relevantes publicados anteriormente, é fundamental para evidenciar a originalidade e a contribuição científica dos trabalhos de pesquisa. Devid...",
				"issue": "2",
				"libraryCatalog": "Baidu Scholar",
				"pages": "167-176",
				"publicationTitle": "Transinformação",
				"shortTitle": "Comparativo dos softwares de gerenciamento de referências bibliográficas",
				"url": "http://www.scielo.br/scielo.php?script=sci_arttext&pid=S0103-37862014000200167&lng=pt&nrm=is",
				"volume": "26",
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
		"url": "http://xueshu.baidu.com/s?wd=zotero&rsv_bp=0&tn=SE_baiduxueshu_c1gjeupa&rsv_spt=3&ie=utf-8&f=8&rsv_sug2=0&sc_f_para=sc_tasktype%3D%7BfirstSimpleSearch%7D",
		"items": "multiple"
	}
]
/** END TEST CASES **/