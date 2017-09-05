{
	"translatorID": "649c2836-a94d-4bbe-8e28-6771f283702f",
	"label": "TVNZ",
	"creator": "Sopheak Hean",
	"target": "^https?://tvnz\\.co\\.nz",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-04 10:01:57"
}

function detectWeb(doc, url) {
	if (url.indexOf("/search/") !=-1){
		return "multiple";
	} 
	else if ((url.indexOf("politics-news/") !=-1) && (url.indexOf("-video") !=-1) 
	|| (url.indexOf("politics-news/") !=-1) && (url.indexOf("/video") !=-1)
	|| (url.indexOf("business-news/") !=-1) && (url.indexOf("-video") !=-1)
	|| (url.indexOf("national-news/") !=-1) && (url.indexOf("-video") !=-1)
	|| (url.indexOf("breakfast-news/") !=-1) && (url.indexOf("-video") !=-1)
	|| (url.indexOf("breakfast-news/") !=-1) && (url.indexOf("/video") !=-1)
	|| (url.indexOf("world-news/") !=-1) && (url.indexOf("-video") !=-1)
	|| (url.indexOf("all-blacks/") !=-1) && (url.indexOf("-video") !=-1)
	|| (url.indexOf("weather/") !=-1) && (url.indexOf("-video") !=-1)
	|| (url.indexOf("-news/") !=-1) && (url.indexOf("-video") !=-1)
	|| (url.indexOf("-news/") !=-1) && (url.indexOf("/video") !=-1)
	|| (url.indexOf("on/") !=-1) && (url.indexOf("-video") !=-1)
	|| (url.indexOf("up/") !=-1) &&  (url.indexOf("/video") !=-1)){
		return "tvBroadcast";
	} 
	else if ((url.indexOf("news/") !=-1) || (url.indexOf("all-blacks/") !=-1) || (url.indexOf("up/")!=-1)){
		return "newspaperArticle";
	} 
}

function scrape(doc, url){
	if (detectWeb(doc, url) == "newspaperArticle") {
		var newItem = new Zotero.Item('newspaperArticle');
		newItem.url = url;
		newItem.publicationTitle = "TVNZ";
		newItem.language = "en";

		newItem.title = ZU.xpathText(doc, '//h1');

		var date = ZU.xpathText(doc, '//p[@class="time"]');
		if(date){
			newItem.date = ZU.trimInternal(date.replace(/\W\bPublished:\W\d{1,2}:\d{1,2}(AM|PM) (\w)+ /g, ''));
		}

		//get Author from the article
		var author = ZU.xpathText(doc, '//p[@class="source"]');
		if (author){
			newItem.creators.push(ZU.cleanAuthor(author.replace(/\W\bSource:\W+/g, '').replace(/\W+/g, '-'), "author"));
		}
		
		//get Section of the article
		var section = ZU.xpathText(doc, '//li[@class="selectedLi"]/a/span');
		if (section){
			section = section.replace(/^s/g, '');
			var sectionArray = new Array("Rugby", "All Blacks", "Cricket", "League",  "Football", "Netball", "Basketball", "Tennis", "Motor", "Golf", "Other", "Tipping");
			
			//loop through the Array and check for condition for section category
			//var count =0;
			for (var i=0; i <sectionArray.length; i++){
				//count = 1;
				//if there is a match in the loop then replacing the section found with SPORT
				if(section == sectionArray[i]){
					newItem.section = "Sport";
					break;
				}
			}
			//if not found then take the value from XPath
			if(i == sectionArray.length) {
				newItem.section = section;
			}
		}
		
		//get Abstract
		newItem.abstractNote = ZU.xpathText(doc, "//meta[@name='description']");
		
		//closed up NewItem
		newItem.complete();
	} else if (detectWeb(doc, url) == "tvBroadcast"){
		var newItem = new Zotero.Item("tvBroadcast");
		newItem.url = url;
		
		newItem.network = "TVNZ";
		newItem.language = "en";

		/* get Title and Running time for video clip */
		//if meta title exist
			
		//if the array is true then do this
		var date = ZU.xpathText(doc, '//p[@class="added"]');
		
		if (date){
			newItem.date = ZU.trim(date.replace(/\W\bAdded:\W\d{1,2}:\d{1,2}(AM|PM) (\w)+ /g, ''));
		} else {
			newItem.date = ZU.trim(ZU.xpathText(doc, '//p[@class="time"]')
					.replace(/\W\bPublished:\W\d{1,2}:\d{1,2}(AM|PM) (\w)+ /g, ''));			
		}

		var myTitle= ZU.xpathText(doc, '//meta[@name="title" or @name="og:title"]/@content');
		if (myTitle){
			myTitle = myTitle.replace(/\b[)]+/g, '');
			var TitleResult= myTitle.split(" (");
			newItem.title = TitleResult[0];
			if(TitleResult[1] == undefined) {
				newItem.runningTime ="";	
			} else {
				newItem.runningTime = TitleResult[1];
			}
		}else{
			newItem.title= ZU.xpathText(doc, '//head/title').split(" | ")[0];	
		}
		
		//get Author from the article
		var author = ZU.xpathText(doc, '//p[@class="source"]');
		if (author){
			author = author.replace(/\W\bSource:\W+/g, '');
			newItem.creators.push(ZU.cleanAuthor(author.replace(/\W+/g, '-'), "author"));
		
		} else {
			var keywordsObject = ZU.xpathText(doc, '//meta[@name="keywords"]').replace(/\s+/g, '-').split(",");
			newItem.creators.push(ZU.cleanAuthor(keywordsObject[0], "author"));
		}
	
		//get Abstract
		newItem.abstractNote = ZU.xpathText(doc, "//meta[@name='description']");
		
		//get Section of the video, not sure if this meant for Archive location, if incorrect then leave it commented.
		//var sectionPath = "//meta[@name='keywords']";
		//var sectionPathObject = doc.evaluate(sectionPath,  doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().content;
		//var sectionResult = sectionMetaObject.split(",");
		//newItem.archiveLocation = sectionPathObject;

		newItem.complete();
	}
}

function doWeb(doc, url){
	if ( detectWeb(doc, url) == "multiple"){
		var titles = ZU.xpath(doc, '//div[@class="readItem"]/h4');
		Zotero.selectItems(ZU.getItemArray(doc, titles), function(selectedItems) {
			if(!selectedItems) return true;

			var articles = new Array();
			for (var i in selectedItems){
				articles.push(i);
			}
			ZU.processDocuments(articles, function(doc) { scrape(doc, doc.location.href); });
		});
	} else {
		scrape(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://tvnz.co.nz/politics-news/jon-johansson-s-all-2014-4523189",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"url": "http://tvnz.co.nz/politics-news/jon-johansson-s-all-2014-4523189",
				"publicationTitle": "TVNZ",
				"language": "en",
				"title": "Jon Johansson: It's all about 2014",
				"libraryCatalog": "TVNZ",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Jon Johansson"
			}
		]
	},
	{
		"type": "web",
		"url": "http://tvnz.co.nz/search/ta_ent_search_news_skin.xhtml?q=storm&sort=date%3AD%3AS%3Ad1",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://tvnz.co.nz/national-news/patea-devastated-storm-video-4752377",
		"items": [
			{
				"itemType": "tvBroadcast",
				"creators": [
					{
						"firstName": "",
						"lastName": "Breakfast-",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"url": "http://tvnz.co.nz/national-news/patea-devastated-storm-video-4752377",
				"network": "TVNZ",
				"language": "en",
				"date": "March 03, 2012",
				"title": "Patea devastated by storm",
				"libraryCatalog": "TVNZ"
			}
		]
	}
]
/** END TEST CASES **/