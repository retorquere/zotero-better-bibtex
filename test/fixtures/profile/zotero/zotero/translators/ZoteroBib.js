{
	"translatorID": "b7c665ba-173c-4dea-b28e-e866580002a2",
	"label": "ZoteroBib",
	"creator": "Dan Stillman",
	"target": "^https://zbib\\.org/",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-05-14 08:38:18"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Dan Stillman
	
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

var dataSelector = 'script[type="application/vnd.zotero.data+json"]';

function detectWeb(doc, url) {
	Zotero.monitorDOMChanges(doc.querySelector('.container'));
	return doc.querySelectorAll(dataSelector).length ? 'multiple' : false;
}

function getJSON(doc) {
	var json = [];
	for (let row of doc.querySelectorAll(dataSelector)) {
		json.push(JSON.parse(row.textContent));
	}
	return json;
}

function getTitles(doc) {
	var titles = {};
	for (let entryJSON of getJSON(doc)) {
		titles[entryJSON.key] = entryJSON.title;
	}
	return titles;
}

// TODO: Move to API JSON import translator?
function importJSON(json) {
	json.forEach(entry => {
		var item = new Zotero.Item(entry.itemType);
		for (let field in entry) {
			switch (field) {
			case 'key':
			case 'version':
				continue;
			
			case 'creators':
			case 'tags':
				item[field].push(...entry[field]);
				break;
			
			default:
				// Ignore other properties that are already set
				if (item[field] !== undefined) {
					continue;
				}
				item[field] = entry[field];
			}
		}
		item.complete();
	});
}

function doWeb(doc, url) {
	Zotero.selectItems(getTitles(doc), function (items) {
		var keys = new Set(Object.keys(items));
		var json = getJSON(doc).filter(entry => keys.has(entry.key));
		importJSON(json);
	});
}
