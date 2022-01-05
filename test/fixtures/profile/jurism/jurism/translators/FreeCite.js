{
	"translatorID": "7bbef39f-8bb9-44d7-826f-47ce75eb15ae",
	"label": "FreeCite",
	"creator": "Philipp Zumstein",
	"target": "^https?://freecite\\.library\\.brown\\.edu/citations/create",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-03-16 23:13:55"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2015 Philipp Zumstein

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
	if (doc.getElementsByTagName("code").length &&
		doc.getElementsByTagName("code")[0].textContent.indexOf("<")>-1) {
		return "multiple";
	}
}

function doWeb(doc, url) {
	
	var text = "";
	var index = 0;
	var itemList = [];
	var titleList = {};

	var codes = doc.getElementsByTagName("code");
	for (var i = 0; i < codes.length; i++) {
		textContent = codes[i].textContent;
		// there is always a dummy object <code>ContextObject</code> which we want to exclude here
		if (textContent.indexOf("<")>-1) { 
			text += textContent;
		}
	}
	// replace only internal <ctx:context-objects...> tags
	text = text.replace(/<\/ctx:context-objects>\s*<ctx:context-objects(?: [^>]*)?>/g, '');

	var translator = Zotero.loadTranslator('import');
	translator.setTranslator('24d9f058-3eb3-4d70-b78f-1ba1aef2128d');//CTX
	translator.setString(text);
	
	// we  save the item only temporarily in the itemList
	// and its title in titleList for the selection dialog
	translator.setHandler("itemDone", function(trans, item) {
		if (item && item.title) {
			titleList[index] = item.title;
			itemList[index] = item;
			index++;
		}
	});
	
	translator.setHandler("done", function(translate) {
		if (itemList.length) {
			Zotero.selectItems(titleList, function(selectedIndices) {
				if (!selectedIndices) {
					return true;
				}
				for (var i in selectedIndices) {
					itemList[i].complete();
				}
			});
		}
	});
	
	translator.translate();
	
}
/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/