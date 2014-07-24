{
	"translatorID": "5278b20c-7c2c-4599-a785-12198ea648bf",
	"label": "ARTstor",
	"creator": "Sebastian Karcher",
	"target": "^https?://library\\.artstor.org[^/]*",
	"minVersion": "3.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2013-10-30 01:41:51"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	ARTstor Translator, Copyright © 2012 Sebastian Karcher
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

function getDataRows(doc) {
	return ZU.xpath(doc, 'html/body/div[@class="MetaDataWidgetRoot"][last()]\
		//table[@class="headerTable" and .//th[@class="th1"\
			and contains(text(), "Field")]]\
		//table[@class="scrollTable" and ./tbody/tr][1]/tbody/tr');
}

function detectWeb(doc, url) {
	//monitor changes to body's direct children. That's where the metadata popup is added
	Zotero.monitorDOMChanges(doc.body, {childList: true});

	if (getDataRows(doc).length) {
		return "artwork";
	}
}

function associateData(newItem, dataTags, field, zoteroField) {
	if (dataTags[field]) {
		newItem[zoteroField] = dataTags[field];
	}
}

function scrape(doc, url) {
	var dataTags = new Object();
	var newItem = new Zotero.Item("artwork");
	var rows = getDataRows(doc);
	for(var i=0, n=rows.length; i<n; i++){
		var td = rows[i].getElementsByTagName('td');
		var field = td[0].textContent;
		var content = ZU.cleanTags(td[1].innerHTML).replace(/[\r\n]+/g, ' ');
		if(!field || !content) continue;
		
		dataTags[field] = content;
		if (field == "Creator"){
		  var artist = content.replace(/\s*\(.*/, '');
		  if(artist) newItem.creators = ZU.cleanAuthor(artist, "artist", artist.indexOf(',') != -1);
		}
		//Z.debug("field: " + field + " content: " + dataTags[field])
	}
   //these might not be complete - it's pretty straightforward to add more
	associateData(newItem, dataTags, "Title", "title");
	associateData(newItem, dataTags, "Measurements", "artworkSize");
	associateData(newItem, dataTags, "Rights", "rights");
	associateData(newItem, dataTags, "Material", "artworkMedium");
	associateData(newItem, dataTags, "Date", "date");
	associateData(newItem, dataTags, "Repository", "archive");
	associateData(newItem, dataTags, "ID Number", "archiveLocation");
	associateData(newItem, dataTags, "Description", "abstractNote");
	newItem.complete();
}

function doWeb(doc, url) {
	scrape(doc, url);
} 