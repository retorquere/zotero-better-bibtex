{
	"translatorID": "12541207-ed80-4b59-9d46-fafa3aa61f7f",
	"label": "Library Catalog (Polaris)",
	"creator": "Aurimas Vinckevicius",
	"target": "/polaris/search/(searchresults|title)\\.aspx\\?",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 250,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-02-19 04:55:29"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Polaris Library Catalog Translator
	Copyright © 2015 Aurimas Vinckevicius

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

/** Sample catalogs
 * http://pac.kings.edu/polaris/
 * http://librarycatalog.eugene-or.gov/Polaris/
 * http://www.clan.lib.nv.us/polaris/
 */

function detectWeb(doc, url) {
	if (url.indexOf('title.aspx') != -1 && getPos(url) !== null) {
		return getItemType(doc);
	}
	
	if (url.indexOf('searchresults.aspx') != -1 && getSearchResults(doc, true)) {
		return 'multiple'
	}
}

/**
 * Extract pos value from URL
 */
function getPos(url) {
	var m = url.match(/[?&]pos=(\d+)/);
	if (!m) return null;
	return m[1];
}

function getItemType(doc) {
	var type = ZU.xpath(doc, '//td[@class="nsm-full-label" and starts-with(text(),"Format")]/following-sibling::td');
	
	if (!type.length) return false;
	
	if (type.length != 1) {
		Zotero.debug("Item type detection matched multiple nodes!!");
	}
	
	type = type[0].textContent.toLowerCase();
	
	
	if (/\b(?:book|printed music)\b/.test(type)) {
		return 'book';
	}
	
	if (/\b(?:sound recording|music)\b/.test(type)) {
		return 'audioRecording';
	}
	
	if (/\b(?:dvd|videorecording)\b/.test(type)) {
		return 'film';
	}
	
	if (/\b(?:map)\b/.test(type)) {
		return 'map';
	}
	
	return 'document';
}

function getSearchResults(doc, checkOnly) {
	var titles = doc.getElementsByClassName('nsm-brief-primary-title-group');
	
	var items = {},
		found = false;
	for (var i=0; i<titles.length; i++) {
		var link = titles[i].getElementsByTagName('a')[0];
		if (!link) continue;
		
		var title = ZU.trimInternal(link.textContent);
		var pos = getPos(link.href);
		
		if (!title || pos == null) continue;
		if (checkOnly) return true;
		found = true;
		
		items[pos] = title;
	}
	
	return checkOnly ? false : items;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		Z.selectItems(getSearchResults(doc), function(items) {
			if (!items) return true;
			
			var pos = [];
			for (var i in items) {
				pos.push(i);
			}
			
			scrape(pos);
		})
	} else {
		scrape([getPos(url)])
	}
}

function scrape(pos) {
	pos = pos.map(function(p) {
		return '/polaris/search/components/ajaxMARC.aspx?fp=0&pos=' + p;
	});
	
	var translator = Zotero.loadTranslator("import");
	// MARC
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
	translator.getTranslatorObject(function(marc) {
		ZU.processDocuments(pos, function(doc) {
			var record = new marc.record();
			var lines = doc.getElementsByTagName('tr');
			for (var i=0; i<lines.length; i++) {
				var tag = lines[i].children[0];
				var ind = lines[i].children[1];
				var data = lines[i].children[2];
				if (!data) continue; // must have all three or else... something went wrong
				
				tag = tag.textContent.trim();
				ind = ind.textContent;
				
				switch (tag) {
					case 'LDR':
						record.leader = data.textContent;
						continue;
					case 'FMT': // Not sure if this is relevant to Polaris
					case '':
						continue;
					default:
						var textData = '';
						for (var j=0; j<data.childNodes.length; j++) {
							var child = data.childNodes[j];
							if (child.classList && child.classList.contains('marc_sub')) {
								textData += marc.subfieldDelimiter
									+ child.textContent.trim().substr(1); // Drop $
							} else {
								textData += child.textContent;
							}
						}
						
						record.addField(tag, ind, textData);
				}
			}
			
			var newItem = new Zotero.Item();
			record.translate(newItem);
			newItem.complete();
		})
	});
}