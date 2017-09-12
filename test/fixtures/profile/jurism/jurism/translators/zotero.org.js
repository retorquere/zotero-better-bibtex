{
	"translatorID": "c82c574d-7fe8-49ca-a360-a05d6e34fec0",
	"label": "zotero.org",
	"creator": "Dan Stillman and Aurimas Vinckevicius",
	"target": "^https?://[^/]*zotero\\.org(:\\d+)?/.+/items(/|$)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2013-12-18 22:57:58"
}

function textToXML(text) {
	try {
		var parser = new DOMParser();
		return parser.parseFromString(text, 'text/xml');
	} catch(e) {
		Zotero.debug(e);
		return null;
	}
}

function scrape(text) {
	var xml;
	if( ( xml = textToXML(text) ) &&
		xml.documentElement.nodeName != 'parsererror' ) {

		var itemJSON = xml.documentElement.getElementsByTagName('content')[0].textContent;

		var item = JSON.parse(itemJSON);

		var newItem = new Zotero.Item();
		for(var property in item) {
			newItem[property] = item[property];
		}
		if(!newItem.title) newItem.title = "[Untitled]";

		newItem.complete();
	}
}

function getListTitles(doc) {
	return ZU.xpath(doc, '//table[@id="field-table"]//td[@class="title"]'
		+ '[./a[not(contains(text(), "Unpublished Note"))]'
			+ '/span[not(contains(@class,"sprite-treeitem-attachment"))]]');
}

var apiKey;

function getLibraryURI(doc) {
	var feed = ZU.xpath(doc, '//a[@type="application/atom+xml" and @rel="alternate"]')[0]
	if(!feed) return;
	var url = feed.href.match(/^.+?\/(?:users|groups)\/\w+/);
	
	if(!url) {
		//personal library. see if we can find an API key
		var key = ZU.xpathText(doc, '//script[contains(text(),"apiKey")]');
		if(!key) return;
		
		key = key.match(/apiKey\s*:\s*(['"])(.+?)\1/);
		if(!key) return;
		apiKey = key[2];
		
		url = decodeURIComponent(feed.href)
			.match(/https?:\/\/[^\/]+\/(?:users|groups)\/\w+/);
		if(!url) return;
	}
	
	return url[0] + '/items/';
}

function detectWeb(doc, url) {
	//disable for libraries where we can't get a library URI or an apiKey
	if(!getLibraryURI(doc)) return;
	
	//single item
	if( url.match(/\/itemKey\/\w+/) ) {
		return ZU.xpathText(doc, '//div[@id="item-details-div"]//td[preceding-sibling::th[text()="Item Type"]]/@class')
				|| false;
	}

	// Library and collections
	if ( ( url.match(/\/items\/?([?#].*)?$/)
		|| url.indexOf('/collectionKey/') != -1
		|| url.match(/\/collection\/\w+/)
		|| url.indexOf('/tag/') != -1 )	
		&& getListTitles(doc).length ) {
		return "multiple";
	}
}

function doWeb(doc, url) {
	var libraryURI = getLibraryURI(doc);
	if(Zotero.isBookmarklet) {
		libraryURI = libraryURI.replace("https://api.zotero.org", "https://www.zotero.org/api");
	}
	var apiOpts = '?format=atom&content=json' + (apiKey ? '&key=' + apiKey : '' );
	var itemRe = /\/itemKey\/(\w+)/;

	if (detectWeb(doc, url) == "multiple") {
		var elems = getListTitles(doc);
		var items = ZU.getItemArray(doc, elems);
		
		Zotero.selectItems(items, function(selectedItems) {
			if( !selectedItems ) return true;

			var apiURIs = [], itemID;
			for (var url in selectedItems) {
				itemID = url.match(itemRe)[1];
				apiURIs.push(libraryURI + itemID + apiOpts);
			}

			Zotero.Utilities.HTTP.doGet(apiURIs, scrape);
		});
	} else {
		var itemID = url.match(itemRe)[1];
		var itemURI = libraryURI + itemID + apiOpts;
		Zotero.Utilities.doGet(itemURI, scrape);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.zotero.org/groups/all_things_zotero/items/itemKey/HXTTNJGD",
		"defer": true,
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"creatorType": "author",
						"firstName": "Mark",
						"lastName": "Desirto"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Expert Searching, Zotero: A New Bread of Search Tool",
				"publicationTitle": "Medical Library Association Newsletter",
				"date": "April 2007",
				"callNumber": "0000",
				"extra": "Cited by 0000"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.zotero.org/marksample/items/collectionKey/5RN69IBP/itemKey/58VT7DAA",
		"defer": true,
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"creatorType": "author",
						"firstName": "Mark",
						"lastName": "Osteen"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "American Magic and Dread: Don DeLillo’s Dialogue with Culture",
				"place": "Philadelphia",
				"publisher": "University of Pennsylvania Press",
				"date": "2000",
				"ISBN": "0812235517",
				"shortTitle": "American Magic"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.zotero.org/groups/all_things_zotero/items",
		"items": "multiple",
		"defer": true
	},
	{
		"type": "web",
		"url": "https://www.zotero.org/groups/all_things_zotero/items/collectionKey/XX99JMW8",
		"items": "multiple",
		"defer": true
	},
	{
		"type": "web",
		"url": "https://www.zotero.org/marksample/items",
		"items": "multiple",
		"defer": true
	},
	{
		"type": "web",
		"url": "https://www.zotero.org/marksample/items/collectionKey/5RN69IBP",
		"items": "multiple",
		"defer": true
	},
	{
		"type": "web",
		"url": "https://www.zotero.org/marksample/items/collection/5RN69IBP",
		"items": "multiple",
		"defer": true
	},
	{
		"type": "web",
		"url": "https://www.zotero.org/groups/devtesting/items/tag/tag2",
		"items": "multiple",
		"defer": true
	}
]
/** END TEST CASES **/