{
	"translatorID": "5e1f3e08-ca5f-4196-a662-6cf46b3cdaa7",
	"translatorType": 4,
	"label": "YPFS",
	"creator": "Corey Runkel",
	"target": "^https?://ypfs\\.som\\.yale\\.edu",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-03 19:20:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Corey Runkel
	
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
	if (url.includes('/library/')) {
		return 'document';
	}
	else if (url.endsWith('.edu') || url.endsWith('.edu/') || url.includes('admin/content')) {
		return 'multiple';
	}
	return false;
}


 function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a[href*="/library/"]');
	for (let row of rows) {
		href = row.href;
		title = ZU.trimInternal(row.text);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
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
	var type = itemType(doc.querySelector('a[href*="ypfsresourcelibrary"]').href);
	var item = new Zotero.Item(type[0]);
	var pub = ZU.xpathText(doc, '//dl[@class="ypfs-case__details"]/dt[contains(., "Publisher")]/following-sibling::dd[1]/a');
	var lang = ZU.xpathText(doc, '//dl[@class="ypfs-case__details"]/dt[contains(., "Language")]/following-sibling::dd[1]/a');
	
	item.title = doc.querySelector('#block-ypfs-theme-page-title').innerText;
	item.date = ZU.xpathText(doc, '//dl[@class="ypfs-case__details"]/dt[contains(., "Date")]/following-sibling::dd[1]');
	item.abstractNote = ZU.xpathText(doc, '//dl[@class="ypfs-case__details"]/dt[contains(., "Information")]/following-sibling::dd[1]');
	item.publisher = pub.replace(/.*: | \(.*\)/g, "");
	item.language = getLocale(lang);
	item.url = doc.querySelector('link[rel="shortlink"]').href;
	item.archive = 'Yale Program on Financial Stability Resource Library';
	item.extra = type[3];
	
	item.creators = [];
	for (i=1; i<=ZU.xpath(doc, '//dl[@class="ypfs-case__details"]/dt[contains(., "Author")]/following-sibling::dd[1]/a').length; i++) {
		auth = ZU.xpathText(doc, '//dl[@class="ypfs-case__details"]/dt[contains(., "Author")]/following-sibling::dd[1]/a'.concat("[", i, "]"));
		item.creators.push(ZU.cleanAuthor(auth.replace(/.*: | \(.*\)/g, ""), "author", true));
	}
	
	item.attachments = [{
		url: doc.querySelector('a[href*="ypfsresourcelibrary"]').href,
		mimeType: type[1],
		title: type[2]
	}];
	
	item.tags = [
		{tag: ZU.xpathText(doc, '//dl[@class="ypfs-case__details"]/dt[contains(., "Crisis")]/following-sibling::dd[1]/a')},
		{tag: ZU.xpathText(doc, '//dl[@class="ypfs-case__details"]/dt[contains(., "Case Series")]/following-sibling::dd[1]/a')},
		{tag: ZU.xpathText(doc, '//dl[@class="ypfs-case__details"]/dt[contains(., "Country")]/following-sibling::dd[1]/a')}
		];

	item.complete();
}

function itemType(href) {
	switch (href.split(/\./).pop()) {
		case "pdf":
			return ['document', 'application/pdf', 'Full Text PDF'];
		case "xlsx":
			return ['document', 'application/vnd.ms-excel', 'Excel Workbook', 'type: dataset'];
		case "xls":
			return ['document', 'application/vnd.ms-excel', 'Excel Workbook', 'type: dataset'];
		case "xlsm":
			return ['document', 'application/vnd.ms-excel.sheet.macroEnabled.12', 'Macro-enabled Excel Workbook', 'type: dataset'];
		case "doc":
			return ['document', 'application/vnd.ms-word', 'Word Document'];
		case "docx":
			return ['document', 'application/vnd.ms-word', 'Word Document'];
		case "pptx":
			return ['presentation', 'application/vnd.ms-powerpoint', 'Powerpoint'];
		case "mp3":
			return ['audioRecording', 'audio/mpeg', 'Audio Recording'];
		case "mp4":
			return ['document', 'application/mp4', 'mp4 Recording'];
		case "wma":
			return ['audioRecording', 'audio/x-ms-wwma', 'Audio Recording'];
		case "mov":
			return ['videoRecording', 'video/quicktime', 'Video Recording'];
	}
}

function getLocale(lang) {
	return {
		Arabic: 'ar',
		Bulgarian: 'bg',
		Danish: 'da',
		Dutch: 'nl',
		English: 'en',
		Finnish: 'fi',
		French: 'fr',
		German: 'de',
		Hungarian: 'hu',
		Icelandic: 'is',
		Japanese: 'jp',
		Korean: 'kr',
		Mongolian: 'mn',
		Polish: 'pl',
		Portugese: 'pt',
		Slovene: 'sl',
		Spanish: 'es',
		Swedish: 'sv',
		Thai: 'th',
		Turkish: 'tr',
	}[lang] || lang;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://ypfs.som.yale.edu/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://ypfs.som.yale.edu/library/public-debt-outstanding",
		"items": [
			{
				"itemType": "document",
				"title": "Public Debt Outstanding",
				"creators": [
					{
						"lastName": "Thai Public Debt Management Office",
						"creatorType": "author"
					}
				],
				"date": "February 05, 2021",
				"abstractNote": "data showing, among other public debts, those attributed to the FIDF (in billions of baht)",
				"archive": "Yale Program on Financial Stability Resource Library",
				"archiveLocation": "16563",
				"extra": "type: dataset",
				"language": "en",
				"libraryCatalog": "YPFS",
				"publisher": "Thai Public Debt Management Office",
				"url": "https://ypfs.som.yale.edu/library/public-debt-outstanding",
				"attachments": [
					{
						"mimeType": "application/vnd.ms-excel",
						"title": "Excel Workbook"
					}
				],
				"tags": [
					{
						"tag": "Asia Crisis (1997-1998)"
					},
					{
						"tag": "Broad-Based Emergency Liquidity"
					},
					{
						"tag": "Thailand"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
