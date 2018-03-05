{
	"translatorID": "4883f662-29df-44ad-959e-27c9d036d165",
	"label": "FAO Publications",
	"creator": "Bin Liu <lieubean@gmail.com>",
	"target": "^https?://www\\.fao\\.org/documents|publications/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-09-18 19:48:10"
}

/*
	***** BEGIN LICENSE BLOCK *****
	Copyright © 2017 Bin Liu
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
	//Just differentiate single and multiple. Correct itemType (either book or conferencePaper) will be determined in scrape().
	if (url.indexOf('card') !== -1) {
		return 'book';
	} 
	/* Multiples currently don't load properly
	else if (getSearchResults(doc, true)) {
		return 'multiple';
	}
	*/
}

function cleanMeta(str) {
	//clean meta fields obtained from page
	if (str.includes(';') === false) {
		return str.slice(str.indexOf(':')+2);
	} else {
		var strArray = str.slice(str.indexOf(':')+2).split(';');
		strArray.pop(); //removes empty element after the last ';'
		return strArray;
	}
}

function scrape(doc, url) {
	var newItem = new Z.Item();

	if (url.indexOf('card') !== -1) {
		
		//attach document card URL and snapshot
		newItem.attachments.push({
			url: url,
			title: 'FAO Document Record Snapshot',
			mimeType: 'text/html',
			snapshot: true
		});


		//********** Begin fixed-location variables **********

		//Some variables always appear and appear at the same location in all document pages.
		//title
		newItem.title = ZU.xpathText(doc, '//*[@id="headerN1"]/h1');
		//abstract
		newItem.abstractNote = ZU.xpathText(doc, '//*[@id="mainContentN1"]/p');
		//attach PDF
		var pdfUrl = ZU.xpath(doc, '//*[@id="mainRightN1"]/div[2]/a')[0].href;
		newItem.attachments.push({
			url: pdfUrl,
			title: 'Full Text PDF',
			mimeType: 'application/pdf'
		});
		//url: remove 'http://' from pdfUrl
		newItem.url = pdfUrl.slice(pdfUrl.indexOf('www'));
		//language: according to the last letter of PDF file name
		var lang = pdfUrl.charAt(pdfUrl.indexOf('pdf')-2);
		switch(lang) {
			case 'a': 
				newItem.language = 'ar';
				break;
			case 'c':
				newItem.language = 'zh';
				break;
			case 'e':
				newItem.language = 'en';
				break;
			case 'f': 
				newItem.language = 'fr';
				break;
			case 'r': 
				newItem.language = 'ru';
				break;
			case 's': 
				newItem.language = 'es';
				break;
			default: 
				newItem.language = 'other';
		}

		//********** End fixed-location variables **********


		//********** Begin dynamic-location variables **********

		//Variables that appear neither in all document pages nor at same positions in the pages.
		var metaText = ZU.xpath(doc, '//*[@id="mainN1"]')[0].innerText.split('\n'); //scrape text of meta area and split into an array based on line breaks.
		//get what variables are listed in the page, save to object existingMeta
		var textVariable = { //declarations for metadata names as appeared in document pages in different languages
			date: ['سنة النشر', '出版年代', 'Year of publication', 'Année de publication', 'Год издания', 'Fecha de publicación'],
			publisher: ['Publisher', 'Издательство'],
			pages: ['الصفحات', '页次', 'Pages', 'Страницы', 'Páginas'],
			ISBN: ['الرقم الدولي الموحد للكتاب', 'ISBN'],
			author: ['الكاتب', '作者', 'Author', 'Auteur', 'Автор', 'Autor'],
			corpAuthor: ['الشعبة', '司', 'Corporate author', 'Division', 'Отдел', 'División'],
			office: ['مكتب', '办公室', 'Office', 'Bureau', 'Oфис', 'Oficina'],
			seriesTitle: ['Serial Title'],
			seriesNumber: ['رقم المسلسل', '系列号码', 'Series number', 'Numéro de série', 'Серийный номер', 'Número de serie'],
			conference: ['اسم الاجتماع', '会议名称', 'Meeting Name', 'Nom de la réunion', 'Название мероприятия', 'Nombre de la reunión'],
			confCode: ['رمز/شفرة الاجتماع', '会议代码', 'Meeting symbol/code', 'Symbole/code de la réunion', 'Cимвол/код мероприятия', 'Código/Símbolo de la reunión'],
			session: ['Session', 'undefined', 'session'], //web page bug: in Russian page, session name is 'undefined'
			tags: ['المعجم الكلمات الموضوع', 'AGROVOC', 'Agrovoc', 'АГРОВОК']
		}
		var existingMeta = {};
		for (var i = 0; i < metaText.length; i++) {
			for (var key in textVariable) {
				for (var j = 0; j < textVariable[key].length; j++) {
					if (metaText[i].includes(textVariable[key][j])) {
						existingMeta[key] = metaText[i];
					}
				}
			}
		}

		for (var key in existingMeta) {
			var metaResult = cleanMeta(existingMeta[key]);
			
			//date
			if (key.includes('date')) {
				newItem.date = metaResult;
			}
			//publisher
			if (key.includes('publisher')) {
				newItem.publisher = metaResult;
			}
			//number of pages
			if (key.includes('pages')) {
				newItem.numPages = metaResult.match(/\d+/)[0];
			}
			//ISBN
			if (key.includes('ISBN')) {
				newItem.ISBN = ZU.cleanISBN(metaResult, false); 
			}
			//individual author(s)
			if (key.includes('author')) {
				for (var i = 0; i < metaResult.length; i++) {
					var author = metaResult[i];
					newItem.creators.push(ZU.cleanAuthor(author, 'author', true));
				}
			}
			//corporate author: save for later conditions
			if (key.includes('corpAuthor')) {
				var corpAuthorWeb = metaResult;
			}
			if (key.includes('office')) {
				var officeWeb = metaResult;
			}
			//tag (Agrovoc)
			if (key.includes('tags')) {
				for (var i = 0; i < metaResult.length; i++) {
					newItem.tags[i] = metaResult[i].trim();
				}
			}	
			//seriesTitle
			if (key.includes('seriesTitle')) {
				newItem.series = metaResult[0];
			}
			//seriesNumber: convert first letter to upper case
			if (key.includes('seriesNumber')) {
				newItem.seriesNumber = metaResult[0].toUpperCase() + metaResult.slice(1);
			}
			//use confCode as 'Proceedings Title' in Zotero.
			if (key.includes('confCode')) {
				newItem.publicationTitle = metaResult;
			}
			//conferenceName: save for later conditions.
			if (key.includes('conference')) {
				var conferenceWeb = metaResult[0];
			}
			if (key.includes('session')) {
				var sessionWeb = metaResult;
			}
		}

		//If there's no publisher, use 'FAO' as publisher.
		if (newItem.publisher == null) {
			newItem.publisher = 'FAO';
		}
		//Write corporate author; if no individual or corporate author, use 'FAO' as author.
		if (newItem.creators.length == 0) {
			if (corpAuthorWeb && officeWeb) {
				newItem.creators.push({lastName: corpAuthorWeb + ', ' + officeWeb, creatorType: author, fieldMode: true});
			} else if (corpAuthorWeb && !officeWeb) {
				newItem.creators.push({lastName: corpAuthorWeb, creatorType: author, fieldMode: true});
			} else if (!corpAuthorWeb && officeWeb) {
				newItem.creators.push({lastName: officeWeb, creatorType: author, fieldMode: true});
			} else {
				newItem.creators.push({lastName: 'FAO', creatorType: author, fieldMode: true});
			}
		}
		//Write conferenceName
		if (conferenceWeb && sessionWeb) {
			newItem.conferenceName = conferenceWeb + ' ' + sessionWeb;
		} else if (!sessionWeb) {
			newItem.conferenceName = conferenceWeb;
		} else {
			newItem.conferenceName = sessionWeb;
		}
		//If conference and/or session exists in document page, the itemType is 'conferencePaper'; otherwise it's 'book'. 
		if (conferenceWeb || sessionWeb) {
			newItem.itemType = 'conferencePaper';
		} else {
			newItem.itemType = 'book';
		}
		//********** End dynamic-location variables **********


		//********** Others **********
		//Place: not shown in page. Just differentiate Bangkok / Rome.
		if (newItem.publisher.includes('Regional Office for Asia and the Pacific')) {
			newItem.place = 'Bangkok';
		} else {
			newItem.place = 'Rome';
		}
	}
	newItem.complete();
}


//get items from a multiple-item page
function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//*[@class="item-image"]');
	for (var i = 0; i < rows.length; i++) {
		var href = rows[i].href
		var title = ZU.trimInternal(rows[i].text);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Z.selectItems(getSearchResults(doc, false), function (items) {
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
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.fao.org/documents/card/en/c/204a6894-b554-472e-9a9b-d84404dfcb9e/",
		"items": [
			{
				"itemType": "book",
				"title": "GLOBEFISH Highlights - Issue 2/2017",
				"creators": [
					{
						"lastName": "Fisheries and Aquaculture Economics and Policy Division, Fisheries and Aquaculture Department",
						"fieldMode": true
					}
				],
				"date": "2017",
				"ISBN": "9789251097786",
				"abstractNote": "The publication contains a detailed quarterly update on market trends for a variety of major commodities. Combining the price information collected for the European Price Report with other market survey data collected by FAO GLOBEFISH, the report provides a detailed update on market trends for a variety of major commodities. Key market data is presented in a time series tabular or graphical form with written analysis of trends and key events and news affecting commodities such as tuna, groundfish, small pelagics, shrimp, salmon, fishmeal and fish oil, cephalopods, bivalves and crustacea.",
				"language": "en",
				"libraryCatalog": "FAO Publications",
				"numPages": "80",
				"place": "Rome",
				"publisher": "FAO",
				"series": "GLOBEFISH Highlights",
				"seriesNumber": "2/2017",
				"url": "www.fao.org/3/a-i7332e.pdf",
				"attachments": [
					{
						"title": "FAO Document Record Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"aquaculture statistics",
					"fisheries",
					"fishery resources",
					"information dissemination",
					"marine fisheries",
					"markets",
					"prices",
					"salmon",
					"seafoods",
					"statistics",
					"tuna"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.fao.org/documents/card/en/c/02682a52-0227-485b-8d2b-863e5b282e2d/",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Rapport Intérimaire sur la Mise En Oeuvre Des Recommandations Formulées lors des Sessions Antérieures du Comité et du Programme de Travail Pluriannuel",
				"creators": [
					{
						"lastName": "FAO",
						"fieldMode": true
					}
				],
				"date": "2014",
				"conferenceName": "Committee on Forestry",
				"language": "fr",
				"libraryCatalog": "FAO Publications",
				"place": "Rome",
				"proceedingsTitle": "COFO/2014/6.1",
				"publisher": "FAO",
				"url": "www.fao.org/3/a-mk192f.pdf",
				"attachments": [
					{
						"title": "FAO Document Record Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"forest management"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.fao.org/documents/card/en/c/78c1b49f-b5c2-43b5-abdf-e63bb6955f4f/",
		"items": [
			{
				"itemType": "book",
				"title": "A Regional Strategy for Sustainable Agricultural Mechanization. Sustainable Mechanization across Agri-Food Chains in Asia and the Pacific region",
				"creators": [
					{
						"firstName": "R. S.",
						"lastName": "Rolle",
						"creatorType": "author"
					},
					{
						"firstName": "G.",
						"lastName": "Mrema",
						"creatorType": "author"
					},
					{
						"firstName": "P.",
						"lastName": "Soni",
						"creatorType": "author"
					}
				],
				"date": "2015",
				"ISBN": "9789251086766",
				"abstractNote": "Draught animals have played a key role over many centuries in providing farm power for agricultural operations. Since the 1990s, the use of draught animals has declined appreciably in Asia and the Pacific region. In India, the number of draught animals in use is projected to decline from over 85 million in 1975 to 18 million by 2030. Similarly, it is projected that in China draught animals will be completely replaced by a combination of 2-wheel and 4-wheel tractors by 2025. This is indeed a great achievement. However, beginning in the late 1990s, the environmental impact of mechanization – especially that of tillage implements and practices – has become an issue of major concern.  This book outlines an agricultural mechanization strategy that contributes to agricultural sustainability and is environmentally sound, while generating economic development and inclusive growth.",
				"language": "en",
				"libraryCatalog": "FAO Publications",
				"numPages": "92",
				"place": "Rome",
				"publisher": "FAO",
				"series": "RAP Publication",
				"seriesNumber": "No. 2014/24",
				"url": "www.fao.org/3/a-i4270e.pdf",
				"attachments": [
					{
						"title": "FAO Document Record Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"agricultural development",
					"agricultural statistics",
					"appropriate technology",
					"draught animals",
					"mechanization",
					"sustainable agriculture",
					"tractors",
					"working animals"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.fao.org/documents/card/zh/c/5317526a-77f2-4e9d-901a-20967f5b2753/",
		"items": [
			{
				"itemType": "book",
				"title": "森林和能源",
				"creators": [
					{
						"lastName": "FAO",
						"fieldMode": true
					}
				],
				"date": "2017",
				"abstractNote": "森林是自然的动力源泉，是用于满足全球可再生能源需求的关键能源。",
				"language": "zh",
				"libraryCatalog": "FAO Publications",
				"numPages": "1",
				"place": "Rome",
				"publisher": "粮农组织",
				"url": "www.fao.org/3/a-i6928c.pdf",
				"attachments": [
					{
						"title": "FAO Document Record Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"energy demand",
					"可持续发展",
					"木材能量",
					"能源管理",
					"薪炭材"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
