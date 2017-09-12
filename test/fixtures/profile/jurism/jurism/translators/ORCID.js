{
	"translatorID": "e83248bb-caa4-4dd2-a470-11f4cd164083",
	"label": "ORCID",
	"creator": "Philipp Zumstein",
	"target": "^https?://orcid\\.org/",
	"minVersion": "4.0.29.11",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-01 15:29:29"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2016 Philipp Zumstein
	
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


function getIds(doc,  url) {
	var rows = ZU.xpath(doc, '//ul[@id="body-work-list"]//li[@orcid-put-code]');
	var items = {};
	for (var i=0; i<rows.length; i++) {
		var id = rows[i].getAttribute("orcid-put-code");
		var title = ZU.xpathText(rows[i], './/h3/span[@ng-bind="work.title.value"]');
		items[id] = title;
	}
	//Z.debug(items);
	return items;
}


function detectWeb(doc, url) {
	//check that orcid can be found
	var orcid = doc.getElementById("orcid-id");
	if (!orcid) {
		Z.debug("Error: No ORCID found in this page");
		return false;
	}
	//check that work ids can be found
	if (getIds(doc, url) != null) {
		return "multiple";
	}
}


function lookupWork(workid, orcid) {
	var callApi = 'https://pub.orcid.org/v2.0_rc2/' + orcid + '/work/' + workid;
	ZU.doGet(callApi, function(text){
		//Z.debug(callApi);
		//Z.debug(text);
		
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("bc03b4fe-436d-4a1f-ba59-de4d2d7a63f7");//CSL JSON
		translator.setString(text);
		translator.translate();
	}, undefined, undefined, {"Accept" : "application/vnd.citationstyles.csl+json"});
	
}


function doWeb(doc, url) {
	var orcid = doc.getElementById("orcid-id");
	orcid = orcid.textContent.replace('orcid.org/', '');
	Zotero.selectItems(getIds(doc, url), function (items) {
		if (!items) {
			return true;
		}
		for (var i in items) {
			lookupWork(i, orcid);
		}
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://orcid.org/0000-0003-0902-4386",
		"items": "multiple"
	}
]
/** END TEST CASES **/