{
	"translatorID": "b06d2609-ebca-4125-ac67-6d7a0dba274e",
	"label": "MetaLib",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://[^/]*/V/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 250,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2017-01-01 15:26:24"
}

/**
	Copyright (c) 2012 Aurimas Vinckevicius
	
	This program is free software: you can redistribute it and/or
	modify it under the terms of the GNU Affero General Public License
	as published by the Free Software Foundation, either version 3 of
	the License, or (at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
	Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public
	License along with this program. If not, see
	<http://www.gnu.org/licenses/>.
*/

function getBasketLinks(doc) {
	if (!getBasketLinks.links)
		getBasketLinks.links =
			ZU.xpath(doc, '//img[starts-with(@id,"basket")]/../@onclick');
	return getBasketLinks.links;
}

function getRecords(doc) {
	if (!getRecords.records)
		getRecords.records =
			ZU.xpath(doc, '//div[@id="record_list"]//tr[.//a]');
	return getRecords.records;
}

function basketToExport(basketOnClick) {
	var m = basketOnClick.match(/addToBasket\(\s*"([^)]+)"/)[1];
	m = m.split(/"\s*,\s*"/);
	return m[2] + '?func=quick-3-full-save&format=776&encoding=NONE' +
			'&doc_number=' + m[1];
}

function scrapeExport(basketLinks) {
	var urls = new Array();
	for (var i=0, n=basketLinks.length; i<n; i++) {
		urls.push(basketToExport(basketLinks[i]));
	}

	ZU.doGet(urls, function(text) {
		var m = text.match(/<body onload='[^']+?window\.location\s*=\s*"([^"]+)/);
		ZU.doGet(m[1], function(text) {
			//RIS file contains \r\n, make it \n
			text = text.replace(/\r/g, '');

			var translator = Zotero.loadTranslator('import');
			translator.setTranslator('32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7');
			translator.setString(text);

			translator.translate();
		});
	});
}

function detectWeb(doc, url) {
	if (!ZU.xpath(doc, 
		'//head/link[substring(@href,string-length(@href)-11)="/metalib.css"]')
		.length) {
		return;
	}

	var baskets = getBasketLinks(doc).length;
	if (baskets == 1) {
		return 'journalArticle';
	} else if (baskets == 0) {
		return;
	}

	if (getRecords(doc).length) {
		return 'multiple';
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		var records = getRecords(doc);
		var items = new Object();
		var r, title, basketLink;
		for (var i=0, n=records.length; i<n; i++) {
			// title is the second <a> in both Table and Brief views
			r = records[i].getElementsByTagName('a');
			if (!r[1]) continue;
			title = r[1].textContent.trim();

			//we'll use the basket onclick event code to generate links
			//this seems to be the second image
			basketLink = ZU.xpathText(records[i], 
				'.//img[starts-with(@id,"basket")]/../@onclick');
			if (!basketLink) continue;

			items[basketLink] = title;
		}

		Z.selectItems(items, function(selectedItems) {
			if (!selectedItems) return true;

			var links = new Array();
			for (var i in selectedItems) {
				links.push(i);
			}
			scrapeExport(links);
		});
	} else {
		scrapeExport([getBasketLinks(doc)[0].textContent]);
	}
}