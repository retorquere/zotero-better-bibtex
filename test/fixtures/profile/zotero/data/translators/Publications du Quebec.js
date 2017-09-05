{
	"translatorID": "22d0bede-8db5-4656-9b9a-7d682ec1335d",
	"label": "Publications du Québec",
	"creator": "Marc Lajoie",
	"target": "^https?://(www\\.)?legisquebec\\.gouv\\.qc\\.ca/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-03 15:38:52"
}

/*
Publications du Québec Translator
Copyright (C) 2014 Marc Lajoie

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


function detectWeb(doc, url) {
	if (url.indexOf('/ShowDoc/') != -1) {
		return "statute";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//tr[contains(@class, "legisDocRow")]/td/a') ||
		ZU.xpath(doc, '//tr/td/a[contains(@href, "ShowDoc/")]');
	for (var i=0; i<rows.length; i++) {
		var href;
		if (rows[i].href) {
			href = rows[i].href;
		}
		var onclick =  ZU.xpathText(rows[i], './@onclick');
		if (onclick) {
			var m = onclick.match(/showLeg\('(.*)', '', '(.*)', '(.*)'\);/);
			if (m) {
				href = m[2] + '/' + m[3] + '/' + m[1];
			}
		}
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
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
}

function scrape(doc, url) {
	var newItem = new Zotero.Item("statute");

	var titleloi = ZU.xpathText(doc, '//div[contains(@class, "titre-reglement")]');
	titleloi = ZU.trimInternal(titleloi);
	
	var codeloi = ZU.xpathText(doc, '//div[contains(@class, "Identification-Id")]');
	if (codeloi) codeloi = ZU.trimInternal(codeloi);

	newItem.title = titleloi;

	if (codeloi.indexOf("chapitre") != -1) {
		newItem.language = "fr-CA";
		codeloi = codeloi.replace("chapitre", "c");
		newItem.code = "RLRQ " + codeloi;
	} else {
		newItem.language = "en-CA";
		codeloi = codeloi.replace("chapter", "c");
		newItem.code = "CQLR " + codeloi;
	}

	newItem.rights = "© Éditeur officiel du Québec";

	newItem.jurisdiction = "Québec, Canada";
	newItem.url = url;

	newItem.attachments.push({
		document: doc,
		title: "Snapshot"
	});

	newItem.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www2.publicationsduquebec.gouv.qc.ca/lois_et_reglements/liste_alpha.php",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://legisquebec.gouv.qc.ca/fr/ShowDoc/cs/B-1",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Loi sur le Barreau",
				"creators": [],
				"code": "RLRQ c B-1",
				"language": "fr-CA",
				"rights": "© Éditeur officiel du Québec",
				"url": "http://legisquebec.gouv.qc.ca/fr/ShowDoc/cs/B-1",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://legisquebec.gouv.qc.ca/en/ShowDoc/cs/B-1",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Act respecting the Barreau du Québec",
				"creators": [],
				"code": "CQLR c B-1",
				"language": "en-CA",
				"rights": "© Éditeur officiel du Québec",
				"url": "http://legisquebec.gouv.qc.ca/en/ShowDoc/cs/B-1",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://legisquebec.gouv.qc.ca/fr/ShowDoc/cr/B-1,%20r.%203",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Code de déontologie des avocats",
				"creators": [],
				"code": "RLRQ c B-1, r. 3",
				"language": "fr-CA",
				"rights": "© Éditeur officiel du Québec",
				"url": "http://legisquebec.gouv.qc.ca/fr/ShowDoc/cr/B-1,%20r.%203",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://legisquebec.gouv.qc.ca/en/ShowDoc/cr/B-1,%20r.%203",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Code of ethics of advocates",
				"creators": [],
				"code": "CQLR c B-1, r. 3",
				"language": "en-CA",
				"rights": "© Éditeur officiel du Québec",
				"url": "http://legisquebec.gouv.qc.ca/en/ShowDoc/cr/B-1,%20r.%203",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://legisquebec.gouv.qc.ca/en/BrowseChapter",
		"items": "multiple"
	}
]
/** END TEST CASES **/
