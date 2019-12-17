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
	"lastUpdated": "2018-10-12 18:52:49"
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


function detectWeb(doc, url) {
	//check that orcid can be found
	var orcid = doc.getElementById("orcid-id");
	if (!orcid) {
		Z.debug("Error: No ORCID found in this page");
		return false;
	}
	//check that some works are listed on that page
	if (ZU.xpath(doc, '//ul[@id="body-work-list"]/li').length) {
		return "multiple";
	}
}


function lookupWork(workid, orcid) {
	var callApi = 'https://pub.orcid.org/v2.0/' + orcid + '/work/' + workid;
	ZU.doGet(callApi, function(text){
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("bc03b4fe-436d-4a1f-ba59-de4d2d7a63f7");//CSL JSON
		translator.setString(text);
		translator.translate();
	}, undefined, undefined, {"Accept" : "application/vnd.citationstyles.csl+json"});
	
}


function doWeb(doc, url) {
	var orcid = doc.getElementById("orcid-id");
	orcid = orcid.textContent.replace('https://orcid.org/', '');
	var callApi = 'https://pub.orcid.org/v2.0/' + orcid + '/works';
	ZU.doGet(callApi, function(text) {
		// Z.debug(text);
		var parser = new DOMParser();
		var doc = parser.parseFromString(text, "application/xml");
		var namespaces = {
			"work": "http://www.orcid.org/ns/work",
			"activities": "http://www.orcid.org/ns/activities"
		};
		var items = ZU.xpath(doc, '//activities:group', namespaces);
		var putCodes = {};
		for (let item of items) {
			let work = ZU.xpath(item, './work:work-summary', namespaces)[0];
			let code = work.getAttribute('put-code');
			let title = ZU.xpathText(work, './/work:title', namespaces);
			putCodes[code] = title.trim();
		}
		Zotero.selectItems(putCodes, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				lookupWork(i, orcid);
			}
		});
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://orcid.org/0000-0003-0902-4386",
		"items": "multiple"
	}
]
/** END TEST CASES **/
