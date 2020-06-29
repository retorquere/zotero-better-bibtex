{
	"translatorID": "1c0c63d9-4a95-44d4-b441-173cdc1b8688",
	"label": "io-port",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.zentralblatt-math\\.org/ioport/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "g",
	"lastUpdated": "2014-03-08 16:26:00"
}

/*
	***** BEGIN LICENSE BLOCK *****
	io-portal translator
	Copyright © 2014 Sebastian Karcher
	
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


function detectWeb(doc, url){
	if (ZU.xpath(doc, '//div[@class="content_search_result_item"]').length>0) return "multiple";
}

function doWeb(doc, url){
	var rows = ZU.xpath(doc, '//div[@class="content_search_result_item"]')
	var title;
	var link;
	var items= {};
	var urls = []
	for (var i=0; i<rows.length; i++){
		title = ZU.xpathText(rows[i], './div[@class="content_search_result_item_meta"]/div[@class="bold"]');
		link = ZU.xpathText(rows[i], './div[@class="content_search_result_function"]/a[contains(@href, "type=bib")]/@href');
		items[link]=title.trim();
	}
	Zotero.selectItems(items, function(items) {
		if (!items) {
			return true;
		}	
		for (var i in items) {
			urls.push(i)
		};
		ZU.doGet(urls, function(text){
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
			translator.setString(text);
			translator.translate();			
		})
	});	
}
