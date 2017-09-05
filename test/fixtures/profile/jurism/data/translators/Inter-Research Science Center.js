{
	"translatorID": "0eeb2ac0-fbaf-4994-b98f-203d273eb9fa",
	"label": "Inter-Research Science Center",
	"creator": "Michael Berkowitz",
	"target": "^https?://www\\.int-res\\.com/",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-06-02 19:17:47"
}

function detectWeb(doc, url) {
	if (doc.evaluate('//div[@class="journal-index"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext() ||
		doc.evaluate('//div[@class="tx-indexedsearch-res"]//tr[1]/td[2]//a', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	} else if (doc.evaluate('//a[@class="citeexport"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "journalArticle";
	}
}

var journals = {
	meps:["Marine Ecology Progress Series", "Mar Ecol Prog Ser"],
	ab:["Aquatic Biology", "Aquat Biol"],
	ame:["Aquatic Microbial Ecology", "Aquat Microb Ecol"],
	dao:["Diseases of Aquatic Organisms", "Dis Aquat Org"],
	cr:["Climate Research", "Clim Res"],
	esr:["Endangered Species Research", "Endang Species Res"]
};

function doWeb(doc, url) {
	var arts = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		if (doc.evaluate('//div[@class="tx-indexedsearch-res"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			var titlesx = doc.evaluate('//div[@class="tx-indexedsearch-res"]//tr[2]/td[2]', doc, null, XPathResult.ANY_TYPE, null);
			var linksx = doc.evaluate('//div[@class="tx-indexedsearch-res"]//tr[1]/td[2]//a', doc, null, XPathResult.ANY_TYPE, null);
			var title;
			var link;
			while ((title = titlesx.iterateNext()) && (link = linksx.iterateNext())) {
				items[link.href] = Zotero.Utilities.trimInternal(title.textContent).match(/doi:\s+[^\s]+\s+(.*)$/)[1];
			}
		} else {
			var stuff = doc.evaluate('//div[@class="journal-index"]/*[a[contains(text(), "pdf format")]]', doc, null, XPathResult.ANY_TYPE, null);
			var thing;
			var titles = "";
			while (thing = stuff.iterateNext()) {
				titles += thing.textContent;
			}
			titles = titles.split(/\n/);
			//Zotero.debug(titles);
			var names = new Array();
			for (var i = 0; i < titles.length; i++) {
				if (((i-1)%2 == 0) && (titles[i].match(/\w+/))) {
					names.push(titles[i]);
				}
			}
			//Zotero.debug(names);
			var links = doc.evaluate('//div[@class="journal-index"]/*[a[contains(text(), "pdf format")]]/a[1]', doc, null, XPathResult.ANY_TYPE, null);
			var link;
			while (link = links.iterateNext()) {
				items[link.href] = names.shift();
			}
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				arts.push(i);
			}
			Zotero.Utilities.processDocuments(arts, scrape);	
		});
	} else {
		scrape(doc, url)
	}
}	
	
function scrape(doc, url){
		var item = new Zotero.Item("journalArticle");
		item.title = Zotero.Utilities.trimInternal(doc.evaluate('//div[@class="bb"]/h2', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
		item.url = doc.location.href;
		var voliss = item.url.match(/v(\d+)\/(n(\d+)\/)?p([^/]+)\//);
		item.volume = voliss[1];
		item.pages = voliss[4];
		if (voliss[2]) item.issue = voliss[3];
		var jour = item.url.match(/abstracts\/([^/]+)\//)[1];
		item.publicationTitle = journals[jour][0];
		item.journalAbbreviation = journals[jour][1];
		item.abstractNote = Zotero.Utilities.trimInternal(doc.evaluate('//p[@class="abstract_block"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
		var authors = Zotero.Utilities.trimInternal(doc.evaluate('//div[@class="bb"]/h3', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent).split(/,\s+/);
		for (var i=0; i<authors.length; i++) {
			var aut = authors[i].replace(/[^A-Z\s.]+/gi, '');
			item.creators.push(Zotero.Utilities.cleanAuthor(aut, "author"));
		}
		item.date = doc.evaluate('//div[@class="abs-footer"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent.match(/date:\s+(.*)/)[1];
		item.DOI = Zotero.Utilities.trimInternal(doc.evaluate('//h1[@class="csc-secondHeader"]/span', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent).match(/doi:\s*(.*)/)[1];
		var tags = doc.evaluate('//div[@class="box"]/p/a', doc, null, XPathResult.ANY_TYPE, null);
		var tag;
		while (tag = tags.iterateNext()) {
			item.tags.push(tag.textContent);
		}		
		var pdfurl = doc.evaluate('//a[contains(@href, ".pdf")]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().href;
		item.attachments = [
			{url:item.url, title:item.publicationTitle + " Snapshot", mimeType:"text/html"},
			{url:pdfurl, title:item.publicationTitle + " Full Text PDF", mimeType:"application/pdf"}
		];
		item.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.int-res.com/abstracts/meps/v403/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.int-res.com/abstracts/meps/v403/p13-27/",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Kyle C.",
						"lastName": "Cavanaugh",
						"creatorType": "author"
					},
					{
						"firstName": "David A.",
						"lastName": "Siegel",
						"creatorType": "author"
					},
					{
						"firstName": "Brian P.",
						"lastName": "Kinlan",
						"creatorType": "author"
					},
					{
						"firstName": "Daniel C.",
						"lastName": "Reed",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"url": "http://www.int-res.com/abstracts/meps/v403/p13-27/",
						"title": "Marine Ecology Progress Series Snapshot",
						"mimeType": "text/html"
					},
					{
						"url": "http://www.int-res.com/articles/meps_oa/m403p013.pdf",
						"title": "Marine Ecology Progress Series Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Scaling giant kelp field measurements to regional scales using satellite observations",
				"url": "http://www.int-res.com/abstracts/meps/v403/p13-27/",
				"volume": "403",
				"pages": "13-27",
				"publicationTitle": "Marine Ecology Progress Series",
				"journalAbbreviation": "Mar Ecol Prog Ser",
				"abstractNote": "ABSTRACT: Little is known about the local to regional scale variability in biomass and productivity of many subtidal ecosystems, as appropriate field surveys are both time and labor intensive. Here, we combined high-resolution satellite imagery with aerial photos and diver sampling to assess changes in giant kelp Macrocystis pyrifera canopy cover and biomass along a ~60 km stretch of coastline in the Santa Barbara Channel, California, USA. Our objectives were to (1) develop new methods for estimating giant kelp canopy cover and biomass using satellite imagery, and (2) assess temporal changes in kelp forest biomass across multiple spatial scales. Results of the satellite kelp cover classification compared very favorably with near-coincident high-resolution aerial camera surveys (r2 = 0.90). Monthly diver observations of biomass for fixed plots at 3 kelp forest sites were strongly correlated with satellite determinations of normalized difference vegetation index (NDVI) signals (r2 = 0.77). This allowed us to examine variation in giant kelp biomass across multiple spatial scales (pixel, plot, site, and region). The relationship between plot scale (40 m) changes in biomass and remote assessments of site scale (~1 km) changes varied among sites and depended on the relative location of the plot and the size of the kelp forest at each site. Changes in biomass among sites were well correlated with each other and with the aggregated regional (~60 km) total. Linking field measurements of giant kelp biomass made on a plot scale with regional estimates made by satellite facilitates an understanding of the regional patterns and drivers of biomass and primary production of giant kelp forest ecosystems.",
				"date": "March 22, 2010",
				"DOI": "10.3354/meps08467",
				"libraryCatalog": "Inter-Research Science Center",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/