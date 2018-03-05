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
	"lastUpdated": "2017-10-21 10:10:42"
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
	var id = url.match(/details\/r\/([A-Z\-0-9]+)/i)[1];
	var reference = ZU.xpathText(doc, '//tr/th[contains(text(), "Reference")]/following-sibling::td')
	var tags  = ZU.xpath(doc, '//span/a[@class="tagName"]');
	
	var apiUrl = "http://discovery.nationalarchives.gov.uk/API/records/v1/details/" + id;
	Zotero.Utilities.doGet(apiUrl, function (text) {
		var data = JSON.parse(text);
		//Z.debug(data);
		var item = new Zotero.Item("manuscript");
		var title = data.title || ZU.xpathText(doc, '//h1');
		item.title =  title.replace(/&lt.+?&gt;/g, "").replace(/<.+?>/g, "");
		item.archiveLocation = reference;
		item.language = data.language;
		item.date = data.coveringDates;
		if (data.scopeContent && data.scopeContent.description) {
			item.abstractNote = data.scopeContent.description.replace(/<p>/g, "\n").replace(/&lt;p&gt;/g, "\n").replace(/<.+?>/g, "");
		}
		var holdings = data.heldBy;
		if (holdings && holdings.length>0) {
			item.archive = holdings.map(entry => entry.xReferenceName).join()
		}
		item.type = data.physicalDescriptionForm;
		item.attachments.push({
			url: url,
			title: "British National Archive - Link",
			snapshot: false
		});
		var creators = data.creatorName;
		for (var i=0; i<creators.length; i++) {
			if (creators[i].surname) {
				if (creators[i].firstName) {
					item.creators.push({
						lastName: creators[i].surname,
						firstName: creators[i].firstName,
						creatorType: "author"
					});
				} else {
					item.creators.push({
						lastName: creators[i].surname,
						fieldMode: "1",
						creatorType: "author"
					});
				}
			} else {
				item.creators.push({
					lastName: creators[i].xReferenceName,
					fieldMode: "1",
					creatorType: "contributor"
				});
			}
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
		"url": "http://discovery.nationalarchives.gov.uk/details/r/C3454320",
		"items": [
			{
				"itemType": "manuscript",
				"title": "POSTERS: Food Production: Land girls - Horse-drawn plough, and girl. Artist: Dame Laura...",
				"creators": [],
				"date": "1939-1946",
				"abstractNote": "POSTERS: Food Production: Land girls - Horse-drawn plough, and girl. \nArtist: Dame Laura Knight. \nMedia/Technique: Watercolour and gouache painting with a charcoal underdrawing.Executed on a heavy weight artist board. Light washes of the aqueous media have been applied on top of the loose charcoal sketch giving the painting a powdery, friable quality.",
				"archive": "The National Archives, Kew",
				"archiveLocation": "INF 3/108",
				"libraryCatalog": "National Archive of the UK",
				"shortTitle": "POSTERS",
				"attachments": [
					{
						"title": "British National Archive - Link",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "land girls"
					},
					{
						"tag": "women"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://discovery.nationalarchives.gov.uk/details/r/C31",
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
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "bk23"
					}
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
	},
	{
		"type": "web",
		"url": "http://discovery.nationalarchives.gov.uk/details/r/6faa8c37-6e1a-4cf5-abf6-09eb73d68d68",
		"items": [
			{
				"itemType": "manuscript",
				"title": "Deeds relating to KIRKLEES",
				"creators": [],
				"date": "18 Sep 1236",
				"abstractNote": "Confirmation by Henry III. to Kirklees Nunnery of grants from Reyner son of William Flandrensis, of the site of the house, Adam fil Peter for repairs and firing, Robert son of Gilbert de Barkeston, Henry Teutonicus, John fil Aumund, Agnes de Flammeuill, Reimund de Medelay. Witnesses, W(illiam) elect 'Valent' (Bp. of Valence?), Peter de Malo lacu (Manley), Hugh de Vinon, Godfrey de Craucumb, John fil. Philip, Geoffrey dispenser, Henry de Capella. Dated at York by the hand of Ralph (de Nevill), Bishop of Chichester Chancellor.",
				"archive": "West Yorkshire Archive Service, Calderdale",
				"archiveLocation": "KM/29",
				"language": "English",
				"libraryCatalog": "National Archive of the UK",
				"attachments": [
					{
						"title": "British National Archive - Link",
						"snapshot": false
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
