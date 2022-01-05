{
	"translatorID": "4a3820a3-a7bd-44a1-8711-acf7b57d2c37",
	"translatorType": 4,
	"label": "Web of Science Nextgen",
	"creator": "Abe Jellinek",
	"target": "^https://www\\.webofscience\\.com/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-21 16:30:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Abe Jellinek
	
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
	if (url.includes('/full-record/') && getItemID(url)) {
		return "journalArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('app-article-metadata a[href*="/WOS:"], app-summary-title a[href*="/WOS:"]');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(row.textContent);
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
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	function processTaggedData(text) {
		let importer = Zotero.loadTranslator("import");
		// Web of Science Tagged
		importer.setTranslator("594ebe3c-90a0-4830-83bc-9502825a6810");
		importer.setString(text);
		importer.setHandler('itemDone', function (obj, item) {
			if (item.title.toUpperCase() == item.title) {
				item.title = ZU.capitalizeTitle(item.title, true);
			}
			
			for (let creator of item.creators) {
				if (creator.firstName.toUpperCase() == creator.firstName) {
					creator.firstName = ZU.capitalizeTitle(creator.firstName, true);
				}
				if (creator.lastName.toUpperCase() == creator.lastName) {
					creator.lastName = ZU.capitalizeTitle(creator.lastName, true);
				}
			}
			
			if (item.url) {
				item.complete();
				return;
			}
			
			let gatewayURL = attr(doc, 'a#FRLinkTa-link-1', 'href');
			resolveGateway(gatewayURL, (url) => {
				item.url = url;
				item.complete();
			});
		});
		importer.translate();
	}
	
	let id = getItemID(url);
	getSessionID(doc, (sessionID) => {
		let postData = {
			action: 'saveToFieldTagged',
			colName: 'WOS',
			displayCitedRefs: 'true',
			displayTimesCited: 'true',
			displayUsageInfo: 'true',
			fileOpt: 'othersoftware',
			filters: 'fullRecord',
			product: 'UA',
			view: 'fullrec',
			ids: [id]
		};
		
		ZU.doPost(
			'/api/wosnx/indic/export/saveToFile',
			JSON.stringify(postData),
			processTaggedData,
			{ 'X-1P-WOS-SID': sessionID }
		);
	});
}

function getItemID(url) {
	let idInURL = url.match(/(WOS:[^/?&]+)/);
	return idInURL && idInURL[1];
}

function getSessionID(doc, callback) {
	const sidRegex = /sid=([a-zA-Z0-9]+)/i;
	
	// session ID is embedded in the static page inside an inline <script>
	// if you have the right HttpOnly cookie set. if we can't find it, we
	// initialize our session as the web app does
	for (let scriptTag of doc.querySelectorAll('script')) {
		let sid = scriptTag.textContent.match(sidRegex);
		if (sid) {
			callback(sid[1]);
			return;
		}
	}
	
	resolveGateway('https://www.webofknowledge.com/?mode=Nextgen&action=transfer&path=%2F',
		function (url) {
			let sid = url.match(sidRegex);
			if (sid) {
				callback(sid[1]);
			}
			else {
				callback(null);
			}
		});
}

function resolveGateway(gatewayURL, callback) {
	ZU.doGet(gatewayURL, function (_, xhr) {
		callback(xhr.responseURL || gatewayURL);
	}, null, null, null, false);
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.webofscience.com/wos/woscc/full-record/WOS:000454372400003",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Histopathology of Alcohol-Related Liver Diseases",
				"creators": [
					{
						"firstName": "Nitzan C.",
						"lastName": "Roth",
						"creatorType": "author"
					},
					{
						"firstName": "Jia",
						"lastName": "Qin",
						"creatorType": "author"
					}
				],
				"date": "FEB 2019",
				"DOI": "10.1016/j.cld.2018.09.001",
				"ISSN": "1089-3261",
				"abstractNote": "Excessive alcohol consumption can lead to a spectrum of liver histopathology, including steatosis, steatohepatitis, foamy degeneration, fatty liver with cholestasis, and cirrhosis. Although variability in sampling and pathologist interpretation are of some concern, liver biopsy remains the gold standard for distinguishing between steatohepatitis and noninflammatory histologic patterns of injury that can also cause the clinical syndrome of alcohol-related hepatitis. Liver biopsy is not routinely recommended to ascertain a diagnosis of alcohol-related liver disease in patients with an uncertain alcohol history, because the histologic features of alcohol-related liver diseases can be found in other diseases, including nonalcoholic steatohepatitis and drug-induced liver injury.",
				"extra": "WOS:000454372400003",
				"issue": "1",
				"journalAbbreviation": "Clin. Liver Dis.",
				"language": "English",
				"libraryCatalog": "New Web of Science",
				"pages": "11-+",
				"publicationTitle": "Clinics in Liver Disease",
				"url": "https://linkinghub.elsevier.com/retrieve/pii/S1089326118300771",
				"volume": "23",
				"attachments": [],
				"tags": [
					{
						"tag": "Alcohol-related liver disease"
					},
					{
						"tag": "Alcoholic   steatohepatitis"
					},
					{
						"tag": "Alcoholic fatty liver   with cholestasis"
					},
					{
						"tag": "Alcoholic foamy degeneration"
					},
					{
						"tag": "Alcoholic hepatitis"
					},
					{
						"tag": "Histology"
					},
					{
						"tag": "Liver biopsy"
					},
					{
						"tag": "biopsy"
					},
					{
						"tag": "clinical-trials"
					},
					{
						"tag": "diagnosis"
					},
					{
						"tag": "failure"
					},
					{
						"tag": "fatty liver"
					},
					{
						"tag": "foamy degeneration"
					},
					{
						"tag": "prognosis"
					},
					{
						"tag": "sampling variability"
					},
					{
						"tag": "scoring system"
					},
					{
						"tag": "steatohepatitis"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.webofscience.com/wos/woscc/full-record/WOS:A1957WH65000008",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Superfluidity and Superconductivity",
				"creators": [
					{
						"firstName": "Rp",
						"lastName": "Feynman",
						"creatorType": "author"
					}
				],
				"date": "1957",
				"DOI": "10.1103/RevModPhys.29.205",
				"ISSN": "0034-6861",
				"extra": "WOS:A1957WH65000008",
				"issue": "2",
				"journalAbbreviation": "Rev. Mod. Phys.",
				"language": "English",
				"libraryCatalog": "New Web of Science",
				"pages": "205-212",
				"publicationTitle": "Reviews of Modern Physics",
				"url": "https://journals.aps.org/rmp/abstract/10.1103/RevModPhys.29.205",
				"volume": "29",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.webofscience.com/wos/author/record/483204",
		"items": "multiple"
	}
]
/** END TEST CASES **/
