{
	"translatorID": "229d4678-4fa0-44f8-95c4-f4cfdb9b254c",
	"label": "National Archive of the UK",
	"creator": "Sebastian Karcher",
	"target": "^https?://discovery\\.nationalarchives\\.gov\\.uk/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcb",
	"lastUpdated": "2014-09-11 06:28:15"
}

/**
	Copyright (c) 2013 Sebastian Karcher
	
	This program is free software: you can redistribute it and/or
	modify it under the terms of the GNU Affero General Public License
	as published by the Free Software Foundation, either version 3 of
	the License, or (at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
	Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public
	License along with this program. If not, see
	<http://www.gnu.org/licenses/>.
*/

function detectWeb(doc, url) {
	if (url.search(/details\/r\//i) != -1) return "manuscript";
	else if (url.search(/results\/r\/?\?.+hb=tna/i) != -1) return "multiple";
}

function scrape(doc, url) {
	var id = url.match(/details\/r\/([A-Z0-9]+)/i)[1];
	var reference = ZU.xpathText(doc, '//tr/th[contains(text(), "Reference")]/following-sibling::td')
	var tags  = ZU.xpath(doc, '//span/a[@class="tagName"]');
	
//	In Case we should need it again, we're keeping the screen scraper
/*	var item = new Zotero.Item("manuscript");
	var title =  "The National Archive of the UK " + reference;
	item.archiveLocation = reference;
	item.title = title.replace(/&lt.+?&gt;/g, "").replace(/<.+?>/g, "");
	item.language = ZU.xpathText(doc, '//tr/th[contains(text(), "Language")]/following-sibling::td');
	item.date = ZU.xpathText(doc, '//tr/th[contains(text(), "Date")]/following-sibling::td');
	item.abstractNote = ZU.xpathText(doc, '//tr/th[contains(text(), "Description")]/following-sibling::td').replace(/<p>/g, "\n").replace(/&lt;p&gt;/g, "\n").replace(/<.+?>/g, "");
	item.archive = ZU.xpathText(doc, '//tr/th[contains(text(), "Held by")]/following-sibling::td');
	item.attachments.push({url: url, title: "British National Archive - Link", mimeType: "text/html", snapshot: false});

	for (var i in tags){
		item.tags.push(tags[i].textContent);
	}
	item.complete(); 

	XML Code - hopefully to be reused once API is sorted */
	var xmlUrl = "http://discovery.nationalarchives.gov.uk/DiscoveryAPI/xml/informationasset/" + id;
	Zotero.Utilities.doGet(xmlUrl, function (text) {
		//Z.debug(text)
		var docxml = (new DOMParser()).parseFromString(text, "text/xml");

  	 	ns = {	
  	 			"xsi" : "http://www.w3.org/2001/XMLSchema-instance",
  	 			"xsd" : "http://www.w3.org/2001/XMLSchema"};
		
		var item = new Zotero.Item("manuscript");
		var title = ZU.xpathText(docxml, '//Title', ns);
		if (!title) title =  "The National Archive of the UK " + reference;
		else item.archiveLocation = reference;
		item.title = title.replace(/&lt.+?&gt;/g, "").replace(/<.+?>/g, "");
		item.language = ZU.xpathText(docxml, '//Language');
		item.date = ZU.xpathText(docxml, '//CoveringDates');
		item.abstractNote = ZU.xpathText(docxml, '//ScopeContent/Description').replace(/<p>/g, "\n").replace(/&lt;p&gt;/g, "\n").replace(/<.+?>/g, "");
		item.archive = ZU.xpathText(docxml, '//HeldBy/HeldBy');
		item.type = ZU.xpathText(docxml, '//PhysicalDescriptionForm');
		item.attachments.push({url: url, title: "British National Archive - Link", mimeType: "text/html", snapshot: false});
		var corpauthors = ZU.xpath(docxml, '//CreatorName/Corporate_Body_Name_Text');
		for (var i in corpauthors){
			item.creators.push({ lastName:corpauthors[i].textContent, fieldMode: "1", creatorType: "contributor" });
		}
		for (var i in tags){
			item.tags.push(tags[i].textContent);
		}
		item.complete();
	});


}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var articles = new Array();
		var items = new Object();
		
		//search results
		var titles = ZU.xpath(doc, '//ul[@id="search-results"]//a');

		if (titles.length<1){
			//TODO - other multiples
			return false;
			//titles = ZU.xpath(doc, '//td[@id="leaf-linkarea2"]//a[contains(@href, "/receive/jportal_jparticle")]');
		}
		for (var i in titles) {
			items[titles[i].href] = ZU.trimInternal(titles[i].textContent);
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://discovery.nationalarchives.gov.uk/SearchUI/Details?uri=C3454320",
		"items": [
			{
				"itemType": "manuscript",
				"title": "The National Archive of the UK INF 3/108",
				"creators": [],
				"date": "1939-1946",
				"abstractNote": "POSTERS: Food Production: Land girls - Horse-drawn plough, and girl. \nArtist: Dame Laura Knight. \nMedia/Technique: Watercolour and gouache painting with a charcoal underdrawing.Executed on a heavy weight artist board. Light washes of the aqueous media have been applied on top of the loose charcoal sketch giving the painting a powdery, friable quality.",
				"archive": "The National Archives, Kew",
				"libraryCatalog": "National Archive of the UK",
				"attachments": [
					{
						"title": "British National Archive - Link",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"land girls",
					"women"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://discovery.nationalarchives.gov.uk/SearchUI/Details?uri=C31",
		"items": [
			{
				"itemType": "manuscript",
				"title": "Records of the National Dock Labour Corporation and National Dock Labour Board",
				"creators": [
					{
						"lastName": "National Dock Labour Board",
						"fieldMode": "1",
						"creatorType": "contributor"
					},
					{
						"lastName": "National Dock Labour Corporation",
						"fieldMode": "1",
						"creatorType": "contributor"
					}
				],
				"date": "1748-1989",
				"abstractNote": "Scope and Content\nThe records of the National Dock Labour Corporation, established to regularise dock labour during the Second World War, and the records of the National Dock Labour Board, which took over these functions in 1947.\nAlso included are the records of four local boards responsible for day to day running of the National Dock Labour Scheme from 1947:\nLondon Dock Labour BoardCumbria Dock Labour BoardGrimsby and Immingham Dock Labour BoardSouth Coast Dock Labour Board.",
				"archive": "The National Archives, Kew",
				"archiveLocation": "BK",
				"language": "English",
				"libraryCatalog": "National Archive of the UK",
				"manuscriptType": "series",
				"attachments": [
					{
						"title": "British National Archive - Link",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"bk23"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://discovery.nationalarchives.gov.uk/results/r?_q=labour&_hb=tna",
		"items": "multiple"
	}
]
/** END TEST CASES **/