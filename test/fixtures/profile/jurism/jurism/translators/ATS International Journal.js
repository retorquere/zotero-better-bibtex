{
	"translatorID": "ec0628ad-e508-444e-9e4c-e1819766a1ae",
	"label": "ATS International Journal",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?atsinternationaljournal\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-09-10 19:50:28"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2019 Philipp Zumstein
	
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
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


// convert a roman number, e.g. XLVIII into an arabic number, e.g. 48
function roman2arabic(roman) {
	let mapping = {
		M: 1000,
		D: 500,
		C: 100,
		L: 50,
		X: 10,
		V: 5,
		I: 1
	};
	let result = 0;
	for (let i = 0; i < roman.length; i++) {
		let value = mapping[roman[i]];
		if (i + 1 < roman.length) {
			if (value >= mapping[roman[i + 1]]) {
				result += mapping[roman[i]];
			}
			else {
				result -= mapping[roman[i]];
			}
		}
		else {
			result += mapping[roman[i]];
		}
	}
	return result;
}

function detectWeb(doc, url) {
	// TODO: can wo do this better?
	if (url.split('/').length == 7) {
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
	var rows = doc.querySelectorAll('.article-title a, .search-results a, .category li a');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(row.textContent);
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
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var item = new Zotero.Item('journalArticle');
	item.title = text(doc, 'h1.article-title');
	// we use volume here because the issues are numbered
	// consecutively over years
	item.volume = text(doc, 'h1.page-title');
	if (item.volume) {
		item.date = ZU.strToISO(item.volume);
		// convert the volume numbers into arabic numbers
		if (item.volume.includes(' - ')) {
			let conversion = roman2arabic(item.volume.split(' - ')[0]);
			if (conversion !== 0) {
				item.volume = conversion;
			}
		}
		else {
			// Special Issue 2018 Vol2 --> Special Issue 2
			item.volume = item.volume.replace(/\d\d\d\d(\s+Vol\.?\s*)?/, '');
		}
	}
	var authors = text(doc, 'section.article-content em');
	if (authors) {
		item.creators = authors.split(',').map(name => ZU.cleanAuthor(name, "author"));
	}
	var tags = doc.querySelectorAll('.tags *[itemprop=keywords]');
	item.tags = [];
	for (let tag of tags) {
		item.tags.push(tag.textContent.trim());
	}
	item.pages = ZU.xpathText(doc, '//section[contains(@class, "article-content")]//strong[contains(., "Pages")]/following-sibling::text()[1]');
	item.abstractNote = ZU.xpathText(doc, '//section[contains(@class, "article-content")]//strong[contains(., "Abstract")]/following-sibling::text()[1]');
	var keywords = ZU.xpathText(doc, '//section[contains(@class, "article-content")]//strong[contains(., "Keywords")]/following-sibling::text()[1]');
	if (keywords && item.tags.length === 0) {
		item.tags = keywords.split(';');
	}
	
	item.url = url;
	item.ISSN = '1824-5463';
	item.language = 'en';
	item.publicationTitle = 'Advances in Transportation Studies';
	item.journalAbbreviation = 'ATS';
	item.extra = 'pusblisher:Aracne Editrice\nplace:Roma';
	item.complete();
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.atsinternationaljournal.com/index.php/2019-issues/xlviii-july-2019/1056-do-drivers-have-a-good-understanding-of-distraction-by-wrap-advertisements-investigating-the-impact-of-wrap-advertisement-on-distraction-related-driver-s-accidents",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Do drivers have a good understanding of distraction by wrap advertisements? Investigating the impact of wrap advertisement on distraction-related driver’s accidents",
				"creators": [
					{
						"firstName": "A. R.",
						"lastName": "Mahpour",
						"creatorType": "author"
					},
					{
						"firstName": "A. Mohammadian",
						"lastName": "Amiri",
						"creatorType": "author"
					},
					{
						"firstName": "E. Shah",
						"lastName": "Ebrahimi",
						"creatorType": "author"
					}
				],
				"date": "2019-07",
				"ISSN": "1824-5463",
				"abstractNote": "Drivers encounter a variety of outdoor advertising including fixed and wrap advertisement and large amounts of information and data in different locations, which can sometimes confuse the audience due to congestion, accumulation, and non-compliance with the standards and diversity of concepts. Fully understanding how small distractions can influence the ability to drive could prevent a serious accident. Despite the enormous amount of effort has been devoted to evaluating the impact of fix advertising on traffic safety, the importance of investing wrap advertisements seems to be disregarded. Therefore, the present study seeks firstly to compare the importance of distraction caused by wrap advertisement with other parameters affecting drivers’ awareness, then to find out which aspects of wrap advertisement may distract drivers while driving. To address this objective, at first, a questionnaire-based accidents database was prepared regarding those occurred because of distraction, and then the weight of distraction caused by wrap advertisement was identified using AHP. Subsequently, accidents that occurred because of this specific issue were modeled using the discrete choice technique. The results showed that in contrast with the prevailing opinion of drivers, the probability of distraction while driving caused by wrap advertisement is relatively high which can be considered as an alarming issue. Moreover, according to the results of discrete choice modeling, drivers with different characteristics, such as age or gender can be affected by wrap advertisement in different ways.",
				"extra": "pusblisher:Aracne Editrice\nplace:Roma",
				"journalAbbreviation": "ATS",
				"language": "en",
				"libraryCatalog": "ATS International Journal",
				"pages": "19-30",
				"publicationTitle": "Advances in Transportation Studies",
				"shortTitle": "Do drivers have a good understanding of distraction by wrap advertisements?",
				"url": "http://www.atsinternationaljournal.com/index.php/2019-issues/xlviii-july-2019/1056-do-drivers-have-a-good-understanding-of-distraction-by-wrap-advertisements-investigating-the-impact-of-wrap-advertisement-on-distraction-related-driver-s-accidents",
				"volume": 48,
				"attachments": [],
				"tags": [
					{
						"tag": "Analysis"
					},
					{
						"tag": "Crashes"
					},
					{
						"tag": "Driver"
					},
					{
						"tag": "Driver Behaviour"
					},
					{
						"tag": "Models"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.atsinternationaljournal.com/index.php/2004-issues/special-issue-2004",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.atsinternationaljournal.com/index.php/paper-search?q=reference+management",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.atsinternationaljournal.com/index.php/2018-issues/special-issue-2018-vol2/989-dynamic-traffic-safety-grade-evaluation-model-for-road-sections-based-on-gray-fixed-weight-clustering",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Dynamic traffic safety grade evaluation model for road sections based on gray fixed weight clustering",
				"creators": [
					{
						"firstName": "H. L.",
						"lastName": "Jing",
						"creatorType": "author"
					},
					{
						"firstName": "L. T.",
						"lastName": "Ye",
						"creatorType": "author"
					},
					{
						"firstName": "J. Z.",
						"lastName": "Wang",
						"creatorType": "author"
					},
					{
						"firstName": "Z.",
						"lastName": "Xie",
						"creatorType": "author"
					},
					{
						"firstName": "M.",
						"lastName": "Brown",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"ISSN": "1824-5463",
				"abstractNote": "The conventional gray predication model GM (1, 1) cannot accurately analyze the dynamic traffic index information of complex and scattered road sections because it may cause relatively large error and performs not well in stability. In order to solve this problem, a dynamic traffic safety grade evaluation model for road sections based on gray fixed weight clustering is designed. In this method, In this method, the gray clustering evaluation method is adopted for gray clustering to complex and scattered traffic safety grade evaluation indexes, and the gray fixed weight clustering method is adopted to weight each clustering index in advance; the clustering weight of each index is set by a fuzzy consistent matrix, on which the fixed weight coefficient of the index is calculated and the clustering vector is constructed; the cluster coefficients and cluster vectors are combined to obtain the clustering indexes of traffic safety evaluation; then a BP neural network dynamic traffic safety grade evaluation model for road sections is constructed according to the indexes, so as to accurately evaluate the dynamic traffic safety grade of road sections. The experiment results show that the designed model method can effectively evaluate the dynamic traffic safety grade of 31 road sections in areas with a high probability of traffic congestion with small evaluation error and high stability, so it meets the design requirements.",
				"extra": "pusblisher:Aracne Editrice\nplace:Roma",
				"journalAbbreviation": "ATS",
				"language": "en",
				"libraryCatalog": "ATS International Journal",
				"pages": "15-24",
				"publicationTitle": "Advances in Transportation Studies",
				"url": "http://www.atsinternationaljournal.com/index.php/2018-issues/special-issue-2018-vol2/989-dynamic-traffic-safety-grade-evaluation-model-for-road-sections-based-on-gray-fixed-weight-clustering",
				"volume": "Special Issue 2",
				"attachments": [],
				"tags": [
					{
						"tag": "Models"
					},
					{
						"tag": "Road Safety"
					},
					{
						"tag": "Traffic"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
