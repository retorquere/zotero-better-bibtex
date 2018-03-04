{
	"translatorID": "4ed446ca-b480-43ee-a8fb-5f9730915edc",
	"label": "Denik CZ",
	"creator": "Jiří Sedláček, Philipp Zumstein",
	"target": "^https?://[^/]*denik\\.cz",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-01-07 09:27:42"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Jiří Sedláček, Philipp Zumstein
	
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
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	var type = ZU.xpathText(doc, '//meta[@property="og:type"]/@content');
	if (type == "article") {
		return "newspaperArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.right h2 a');
	for (let i=0; i<rows.length; i++) {
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
	var authorsMeta = ZU.xpathText(doc, '//meta[@property="author"]/@content');
	
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	// translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		if (authorsMeta) {
			// multiple authors are not handled correctly by EM and
			// we want to exclude generic names like "Redakce"
			item.creators = [];
			let authorsList = authorsMeta.split(/\s*,\s*/);
			for (let i=0; i<authorsList.length; i++) {
				let author = authorsList[i];
				if (author!= "Redakce") {
					item.creators.push(ZU.cleanAuthor(authorsList[i], "author"));
				}
			}
		}
		
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "newspaperArticle";
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://trebicsky.denik.cz/zpravy_region/podivejte-se-dalsi-na-miminka-narozena-na-trebicsku-20170123.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Podívejte se další na miminka narozená na Třebíčsku",
				"creators": [],
				"date": "2017-01-23T08:20:00+01:00",
				"abstractNote": "Třebíčsko - Díky vstřícnosti třebíčské porodnice Vám přinášíme fotografie nejmladších obyvatel. Každý týden naši spolupracovníci objíždí porodnice a fotí nově narozená miminka.",
				"language": "cs",
				"libraryCatalog": "trebicsky.denik.cz",
				"publicationTitle": "Třebíčský deník",
				"url": "https://trebicsky.denik.cz/zpravy_region/podivejte-se-dalsi-na-miminka-narozena-na-trebicsku-20170123.html",
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
		"url": "https://trebicsky.denik.cz/zpravy_region/pyrotechniku-pouzivejte-ohleduplne-a-bezpecne-doporucuji-hasici-20171231.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Pyrotechniku používejte ohleduplně a bezpečně, doporučují hasiči",
				"creators": [
					{
						"firstName": "Luděk",
						"lastName": "Mahel",
						"creatorType": "author"
					}
				],
				"date": "2017-12-31T10:08:00+01:00",
				"abstractNote": "Třebíčsko - Přivítání nového roku se neobejde bez petard a rachejtlí. Jak pyrotechniku správně používat? Zde jsou některá doporučení.",
				"language": "cs",
				"libraryCatalog": "trebicsky.denik.cz",
				"publicationTitle": "Třebíčský deník",
				"url": "https://trebicsky.denik.cz/zpravy_region/pyrotechniku-pouzivejte-ohleduplne-a-bezpecne-doporucuji-hasici-20171231.html",
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
		"url": "https://www.denik.cz/z_domova/silvestr-se-zachrankou-ustrelena-ruka-agrese-i-slzy-zoufalstvi-20180101.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Silvestr se záchrankou: Ustřelená ruka, agrese i slzy zoufalství",
				"creators": [
					{
						"firstName": "Jiří",
						"lastName": "Sejkora",
						"creatorType": "author"
					}
				],
				"date": "2018-01-01T14:22:00+01:00",
				"abstractNote": "/FOTOGALERIE, VIDEO/ Silvestrovská noční služba se záchranáři v Pardubicích očima redaktora Deníku. Podívejte se, čím vším si musí projít první den nového roku.",
				"language": "cs",
				"libraryCatalog": "www.denik.cz",
				"publicationTitle": "Deník.cz",
				"shortTitle": "Silvestr se záchrankou",
				"url": "https://www.denik.cz/z_domova/silvestr-se-zachrankou-ustrelena-ruka-agrese-i-slzy-zoufalstvi-20180101.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Pardubice"
					},
					{
						"tag": "silvestr"
					},
					{
						"tag": "záchranná služba"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.denik.cz/ze_sveta/co-nas-ceka-v-breznu-prezidentske-volby-v-rusku-sanci-uspet-ma-jen-putin-20180101.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Co nás čeká v březnu? Prezidentské volby v Rusku. Šanci uspět má jen Putin",
				"creators": [
					{
						"firstName": "Michal",
						"lastName": "Bystrov",
						"creatorType": "author"
					},
					{
						"firstName": "Vojtěch",
						"lastName": "Žižka",
						"creatorType": "author"
					}
				],
				"date": "2018-01-02T00:30:00+01:00",
				"abstractNote": "Na nedávné bilanční konferenci v Moskvě potvrdil vůdce Ruské federace Vladimir Putin, že v březnu 2018 hodlá znovu kandidovat na prezidenta. Poprvé tuto informaci sdělil veřejnosti v první polovině prosince při setkání s pracovníky automobilky GAZ v Nižním Novgorodu.",
				"language": "cs",
				"libraryCatalog": "www.denik.cz",
				"publicationTitle": "Deník.cz",
				"shortTitle": "Co nás čeká v březnu?",
				"url": "https://www.denik.cz/ze_sveta/co-nas-ceka-v-breznu-prezidentske-volby-v-rusku-sanci-uspet-ma-jen-putin-20180101.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Putin"
					},
					{
						"tag": "Rusko"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.denik.cz/hledani/?q=praha&s=all",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.denik.cz/ze_sveta/",
		"items": "multiple"
	}
]
/** END TEST CASES **/
