{
	"translatorID": "5c95b67b-41c5-4f55-b71a-48d5d7183063",
	"label": "CNKI",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://([^/]+\\.)?cnki\\.net",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2017-09-02 11:17:43"
}

/*
	***** BEGIN LICENSE BLOCK *****

	CNKI(China National Knowledge Infrastructure) Translator
	Copyright © 2013 Aurimas Vinckevicius

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

// fetches Refworks record for provided IDs and calls next with resulting text
// ids should be in the form [{dbname: "CDFDLAST2013", filename: "1013102302.nh"}]
function getRefworksByID(ids, next) {
	var postData = "";
	for(var i=0, n=ids.length; i<n; i++) {
		postData += ids[i].dbname + "!" + ids[i].filename + "!0!0,";
	}
	postData = "formfilenames=" + encodeURIComponent(postData);
	
	ZU.doPost('http://epub.cnki.net/kns/ViewPage/viewsave.aspx?TablePre=SCDB', postData, function() {
		ZU.doPost(
			'http://epub.cnki.net/KNS/ViewPage/SaveSelectedNoteFormat.aspx?type=txt',
			'CurSaveModeType=REFWORKS',
			function(text) {
				//fix item types
				text = text.replace(/^RT\s+Dissertation\/Thesis/gmi, 'RT Dissertation')
					//Zotero doesn't do well with mixed line endings. Make everything \n
					.replace(/\r\n?/g, '\n')
					//split authors
					.replace(/^(A[1-4]|U2)\s*([^\r\n]+)/gm, function(m, tag, authors) {
						var authors = authors.split(/\s*[;，,]\s*/); //that's a special comma
						if(!authors[authors.length-1].trim()) authors.pop();
						
						return tag + ' ' + authors.join('\n' + tag + ' ');
					});

				next(text);
			}
		);
	});
}

function getIDFromURL(url) {
	if(!url) return;
	
	var dbname = url.match(/[?&]dbname=([^&#]*)/i);
	var filename = url.match(/[?&]filename=([^&#]*)/i);
	if(!dbname || !dbname[1] || !filename || !filename[1]) return;
	
	return {dbname: dbname[1], filename: filename[1], url: url};
}

function getIDFromPage(doc, url) {
	return getIDFromURL(url)
		|| getIDFromURL(ZU.xpathText(doc, '//div[@class="zwjdown"]/a/@href'));
}

function getTypeFromDBName(dbname) {
	switch(dbname.substr(0,4).toUpperCase()) {
		case "CJFQ":
		case "CJFD":
		case "CAPJ":
			return "journalArticle";
		case "CDFD":
		case "CMFD":
		case "CLKM":
			return "thesis";
		case "CPFD":
			return "conferencePaper";
		case "CCND":
			return "newspaperArticle";
		default:
			return;
	}
}

function getItemsFromSearchResults(doc, url, itemInfo) {
	var iframe = doc.getElementById('iframeResult');
	if (iframe) {
		var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
		if (innerDoc) {
			doc = innerDoc;
		}
	}
	
	var links = ZU.xpath(doc, '//tr[not(.//tr) and .//a[@class="fz14"]]');
	var aXpath = './/a[@class="fz14"]';
	if(!links.length) {
		links = ZU.xpath(doc, '//table[@class="GridTableContent"]/tbody/tr[./td[2]/a]');
		aXpath = './td[2]/a';
	}
	if(!links.length) return;
	
	var items = {};
	var count = 0;
	for(var i=0, n=links.length; i<n; i++) {
		var a = ZU.xpath(links[i], aXpath)[0];
		var title = ZU.xpathText(a, './node()[not(name()="SCRIPT")]', null, '');
		if(title) title = ZU.trimInternal(title);
		var id = getIDFromURL(a.href);
		if(!title || !id) continue;
		
		count++;
		if(itemInfo) {
			itemInfo[a.href] = {id: id};
			
			/*var pdfLink = ZU.xpath(links[i], './/a[@class="brief_downloadIcon"]')[0];
			if(pdfLink) itemInfo[a.href].pdfURL = pdfLink.href;*/
		}
		items[a.href] = title;
	}
	
	if(count) return items;
}

function detectWeb(doc, url) {
	var id = getIDFromPage(doc, url);
	Z.debug(id);
	if(id) {
		return getTypeFromDBName(id.dbname);
	}
	
	var items = getItemsFromSearchResults(doc, url);
	if(items) return "multiple";
}

function doWeb(doc, url) {
	if(detectWeb(doc, url) == "multiple") {
		var itemInfo = {};
		var items = getItemsFromSearchResults(doc, url, itemInfo);
		Z.selectItems(items, function(selectedItems) {
			if(!selectedItems) return true;
			
			var itemInfoByTitle = {};
			var ids = [];
			for(var url in selectedItems) {
				ids.push(itemInfo[url].id);
				itemInfoByTitle[selectedItems[url]] = itemInfo[url];
				itemInfoByTitle[selectedItems[url]].url = url;
			}
			scrape(ids, doc, url, itemInfoByTitle);
		});
	} else {
		scrape([getIDFromPage(doc, url)], doc, url);
	}
}

function scrape(ids, doc, url, itemInfo) {
	getRefworksByID(ids, function(text) {
		Z.debug(text);
		var translator = Z.loadTranslator('import');
		translator.setTranslator('1a3506da-a303-4b0a-a1cd-f216e6138d86'); //Refworks
		translator.setString(text);
		
		var i = 0;		
		translator.setHandler('itemDone', function(obj, newItem) {
			//split names
			for(var i=0, n=newItem.creators.length; i<n; i++) {
				var creator = newItem.creators[i];
				if(creator.firstName) continue;
				
				var lastSpace = creator.lastName.lastIndexOf(' ');
				if(creator.lastName.search(/[A-Za-z]/) !== -1 && lastSpace !== -1) {
					//western name. split on last space
					creator.firstName = creator.lastName.substr(0,lastSpace);
					creator.lastName = creator.lastName.substr(lastSpace+1);
				} else {
					//Chinese name. first character is last name, the rest are first name
					creator.firstName = creator.lastName.substr(1);
					creator.lastName = creator.lastName.charAt(0);
				}
			}
			
			if(newItem.abstractNote) {
				newItem.abstractNote = newItem.abstractNote.replace(/\s*[\r\n]\s*/g, '\n');
			}
			
			//clean up tags. Remove numbers from end
			for(var i=0, n=newItem.tags.length; i<n; i++) {
				newItem.tags[i] = newItem.tags[i].replace(/:\d+$/, '');
			}
			
			newItem.title = ZU.trimInternal(newItem.title);
			if(itemInfo) {
				var info = itemInfo[newItem.title];
				if(!info) {
					Z.debug('No item info for "' + newItem.title + '"');
				} else {
					/*if(!info.pdfURL) {
						Z.debug('No PDF URL passed from multiples page');
					} else {
						newItem.attachments.push({
							title: 'Full Text PDF',
							mimeType: 'application/pdf',
							url: info.pdfURL
						})
					}*/
					
					newItem.url = info.url;
				}
			} else {
				newItem.url = url;
			}
			
			i++;
			newItem.complete();
		});
		
		translator.translate();
	})
}