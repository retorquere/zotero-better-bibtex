{
	"translatorID": "e23afbe8-b5cb-42cc-af90-e915b2c00de2",
	"label": "Bundesgesetzblatt",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.bgbl\\.de/",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-22 20:35:31"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2014 Philipp Zumstein

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


//Disclaimer: Single Documents and Browsing is supported
//(not the search, becauses there it was not clear how to
//receive the correct, stable url for the processDocuments)

function detectWeb(doc, url) {
	//we have to listen to dom changes for the correct icon:
	var contentDiv = doc.getElementById('xaver_component_Text_0');//txtcontent topUB
	if (contentDiv) {
		Z.monitorDOMChanges(contentDiv, {childList: true});
	}
	
	if (onTextView(doc) && doc.getElementById('PDFcontainer') && extractTitle(doc)) {//single item
		return "journalArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function onTextView(doc) {
	if (doc.getElementById('showTextClickable')) {
		return doc.getElementById('showTextClickable').classList.contains('on');
	} else {
		return false;
	}
}

//extract the title for articles
//but returns false for complete issue and table of contents
//(used in detectWeb and scrape)
function extractTitle(doc) {
	if (doc.getElementsByClassName('ubLast').length>0) {
		var title = doc.getElementsByClassName('ubLast')[0].getAttribute('title');
		if (!title || title == 'Komplette Ausgabe' || title == 'Inhaltsverzeichnis') {
			return false
		} else {
			return title;
		}
	} else {
		return false;
	}
}

//for testing in detectWeb use true for checkOnly
//for the items in doWeb use false for checkOnly
//then the items will be an object containing the href/title pairs
function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//span[contains(@class,"xaver-link")]/a');//for search |//div[contains(@class,"HitContext")]/a
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (title != "Komplette Ausgabe" && title != "Inhaltsverzeichnis") {
			if (checkOnly) return true;
			found = true;
			items[href] = title;
		}
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = new Array();
			for (var i in items) {
				//the extracted url seems not be stable or even working properly in general
				//thus we try to use - whenever possible - a permalink
				var permalink = i;//e.g. http://www.bgbl.de/banzxaver/bgbl/text.xav?SID=&start=%2F%2F*[%40node_id%3D%27335934%27]&tf=xaver.component.Text_0&hlf=xaver.component.Hitlist_0#bgbl114s1602.pdf
				var splitPosition = i.indexOf('#');
				if (splitPosition) {
					var id = i.substr(splitPosition+1);
					if (id.substr(0,4) == 'bgbl') {
						permalink = '/xaver/bgbl/start.xav?startbk=Bundesanzeiger_BGBl&jumpTo='+id;
					}
				}
				articles.push(permalink);			
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var item = new Zotero.Item('journalArticle');
	item.title = extractTitle(doc);
	var pdfinfo = doc.getElementById('PDFcontainer').getAttribute('pdffile');
	//e.g. pdfinfo = "bgbl/Bundesgesetzblatt Teil I/2014/Nr. 47 vom 17.10.2014/bgbl114s1603.pdf"
	if (pdfinfo && pdfinfo.split('/').length>4) {
		var infoArray = pdfinfo.split('/');
		item.publicationTitle = infoArray[1];
		item.date = infoArray[2];//can be overwritten in cleanup part
		item.issue = infoArray[3];
		var pdfName = infoArray[4];
		var parts = pdfName.split('s');
		//e.g. parts[0] = bgbl149 (i.e. BGBl Teil 1, 1949) --> no new information
		//     parts[1] = 0001.pdf (i.e. article starts on page 1)
		item.pages = parts[1].replace(/\D/g,'').replace(/^0+/,'');
		
		item.url = 'http://www.bgbl.de/xaver/bgbl/start.xav?startbk=Bundesanzeiger_BGBl&jumpTo='+pdfName;
		var embeddedPdf = ZU.xpathText(doc, '//div[@id="PDFcontainer"]/iframe/@src');
		//e.g. media.xav/bgbl117s2262_75530.pdf?SID=&name=A730335D9081EC7D0035E5213AFA9AF8%2Fbgbl117s2262_75530.pdf&iid=75530
		var m = embeddedPdf.match(/&name=([^&]+)/);
		if (m) {
			var pdfLink = '/xaver/bgbl/media/' + decodeURIComponent(m[1]);
			//Z.debug(pdfLink);
			item.attachments.push({
				title: 'Full Text PDF',
				url: pdfLink,
				mimeType: 'application/pdf'
			});
		}
	} else {
		item.publicationTitle = doc.getElementsByClassName('ub2')[0].getAttribute('title');
		item.date = doc.getElementsByClassName('ub3')[0].getAttribute('title');
		item.issue = doc.getElementsByClassName('ub4')[0].getAttribute('title');
	}
	
	//cleanup
	if (item.issue.indexOf('vom')>-1) {//e.g. Nr. 47 vom 17.10.2014
		var parts = item.issue.split('vom');
		item.issue = parts[0].replace('Nr.','');
		var dateparts = ZU.trim(parts[1]).split('.');
		item.date = dateparts[2]+'-'+dateparts[1]+'-'+dateparts[0];
	}
	
	item.complete();

}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.bgbl.de/xaver/bgbl/start.xav?startbk=Bundesanzeiger_BGBl&jumpTo=bgbl114s1602.pdf#__bgbl__%2F%2F*%5B%40attr_id%3D%27bgbl114s1602.pdf%27%5D__1500114233404",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Sechsundfünfzigste Verordnung zur Durchführung des § 172 des Bundesentschädigungsgesetzes",
				"creators": [],
				"date": "2014-10-17",
				"issue": "47",
				"libraryCatalog": "Bundesgesetzblatt",
				"pages": "1602",
				"publicationTitle": "Bundesgesetzblatt Teil I",
				"url": "http://www.bgbl.de/xaver/bgbl/start.xav?startbk=Bundesanzeiger_BGBl&jumpTo=bgbl114s1602.pdf",
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
		"url": "https://www.bgbl.de/xaver/bgbl/start.xav?startbk=Bundesanzeiger_BGBl&jumpTo=bgbl149s0001.pdf#__bgbl__%2F%2F*%5B%40attr_id%3D%27bgbl149s0001.pdf%27%5D__1500114236442",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Grundgesetz für die Bundesrepublik Deutschland vom 23. Mai 1949",
				"creators": [],
				"date": "1949-05-23",
				"issue": "1",
				"libraryCatalog": "Bundesgesetzblatt",
				"pages": "1",
				"publicationTitle": "Bundesgesetzblatt Teil I",
				"url": "http://www.bgbl.de/xaver/bgbl/start.xav?startbk=Bundesanzeiger_BGBl&jumpTo=bgbl149s0001.pdf",
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