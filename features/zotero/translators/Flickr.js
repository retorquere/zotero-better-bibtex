{
	"translatorID": "5dd22e9a-5124-4942-9b9e-6ee779f1023e",
	"label": "Flickr",
	"creator": "Sean Takats, Rintze Zelle, and Aurimas Vinckevicius",
	"target": "^https?://(?:www\\.)?flickr\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2014-04-03 16:34:41"
}

function detectWeb(doc, url) {
	if (ZU.xpath(doc,'//h1[@property="dc:title" and starts-with(@id, "title_div")]').length) {
		return "artwork";
	} else if (ZU.xpathText(doc,'//meta[@name="og:type"]/@content') && ZU.xpathText(doc,'//meta[@name="og:type"]/@content').match(/photo$/)) {
		return "artwork";
	}
	else if (ZU.xpath(doc,'//span[contains(@class, "photo_container")]|//div/span[@class="title"]').length) {
		return "multiple";
	}
}

function doWeb(doc, url) {
	var items = new Object();

	// single result
	if (detectWeb(doc, url) != "multiple") {
		var elmt = ZU.xpathText(doc, '//meta[@property="og:image"]/@content');
		if (!elmt)  elmt = ZU.xpathText(doc, '//meta[@name="og:image"]/@content');
		var photo_id = elmt.substr(elmt.lastIndexOf('/')+1).match(/^[0-9]+/);
		if(!photo_id) return;
		items[photo_id[0]] = "title";
		fetchForIds(items);
	} else { //multiple results
		var photoRe = /\/photos\/[^\/]*\/([0-9]+)/;
		//tested for:
		//search: http://www.flickr.com/search/?q=test
		//galleries: http://www.flickr.com/photos/lomokev/galleries/72157623433999749/
		//archives: http://www.flickr.com/photos/lomokev/archives/date-taken/2003/12/04/
		//favorites: http://www.flickr.com/photos/lomokev/favorites/
		//photostream: http://www.flickr.com/photos/lomokev/with/4952001059/
		//set: http://www.flickr.com/photos/lomokev/sets/502509/
		//tag: http://www.flickr.com/photos/tags/bmw/
		
		//some search results are hidden ("display: none")
		//videos have a second <a/> element ("a[1]")
		var elmts = ZU.xpath(doc, '//div[not(contains(@style, "display: none"))]\
							/*/span[contains(@class, "photo_container")]/a[1]');
		if (elmts.length==0){
			elmts = ZU.xpath(doc, '//div[not(contains(@style, "display: none"))]\
							/*/span[@class="title"]/a[1]');
		}
		for(var i=0, n=elmts.length; i<n; i++) {
			var title = elmts[i].title;
			//in photostreams, the <a/> element doesn't have a title attribute
			if (title == "") {
				title = elmts[i].getElementsByTagName("img")[0].alt;
			}
			title = ZU.trimInternal(title);
			var photo_id = elmts[i].href.match(photoRe)[1];
			items[photo_id] = title;
		}

		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			fetchForIds(items);
		});
	}
}

function fetchForIds(ids) {
	var key = "3cde2fca0879089abf827c1ec70268b5";
	var apiURL = "http://api.flickr.com/services/rest/?&api_key=" + key;

	for (var i in ids) {
		(function(uri, att) {
			var newItem;
			// We first fetch the items, then their attachments
			ZU.doGet(uri, function (text) {
				newItem = parseResponse(text);
			}, function () {
				ZU.doGet(att, function (text) {
					var doc = (new DOMParser()).parseFromString(text, 'application/xml');
					var attachmentUri = ZU.xpathText(doc, '//size[last()]/@source');
					newItem.attachments = [{
						title: newItem.title,
						url: attachmentUri
					}];
					newItem.complete();
				})
			});
		})(	apiURL + "&method=flickr.photos.getInfo&photo_id=" + i,
			apiURL + "&method=flickr.photos.getSizes&photo_id=" + i);
	}
}

function parseResponse(text) {
	var doc = (new DOMParser()).parseFromString(text, 'application/xml');
	var newItem = new Zotero.Item("artwork");

	var title;
	if ((title = ZU.xpathText(doc, '//photo/title'))) {
		title = ZU.trimInternal(title);
		newItem.title = title;
	} else {
		newItem.title = " ";
	}
	var tags;
	if ((tags = ZU.xpath(doc, '//photo//tag'))) {
		for (var i in tags) {
			newItem.tags.push(tags[i].textContent);
		}
	}
	var date;
	if ((date = ZU.xpathText(doc, '//photo/dates/@taken'))) {
		newItem.date = date.substr(0, 10);
	}
	var owner;
	if ((owner = ZU.xpathText(doc, '//photo/owner/@realname') || (owner = ZU.xpathText(doc, '//photo/owner/@username')))) {
		newItem.creators.push(ZU.cleanAuthor(owner, "artist"));
	}
	var url;
	if ((url = ZU.xpathText(doc, '//photo//url'))) {
		newItem.url = url;
	}
	var description;
	if ((description = ZU.xpathText(doc, '//photo/description'))) {
		newItem.abstractNote = description;
	}
	return newItem;
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.flickr.com/photos/doug88888/3122503680/in/set-72157624194059533",
		"items": [
			{
				"itemType": "artwork",
				"creators": [
					{
						"firstName": "",
						"lastName": "@Doug88888",
						"creatorType": "artist"
					}
				],
				"notes": [],
				"tags": [
					"nature",
					"plant",
					"living",
					"green",
					"frosty",
					"blue",
					"bokeh",
					"canon",
					"eos",
					"400d",
					"18mm",
					"55mm",
					"gimp",
					"pretty",
					"beautiful",
					"tones",
					"ham",
					"house",
					"richmond",
					"south",
					"west",
					"bloom",
					"flower",
					"grass",
					"strand",
					"lone",
					"isolated",
					"isolation",
					"uk",
					"england",
					"doug88888",
					"southwest",
					"leaf",
					"fall",
					"bright",
					"blossom",
					"fresh",
					"december",
					"dec07",
					"buy",
					"purchase",
					"picture",
					"pictures",
					"image",
					"images",
					"creative",
					"commons"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "The blues and the greens EXPLORED",
						"url": "http://farm4.staticflickr.com/3123/3122503680_739103322d_o.jpg"
					}
				],
				"title": "The blues and the greens EXPLORED",
				"date": "2008-12-07",
				"url": "http://www.flickr.com/photos/doug88888/3122503680/",
				"abstractNote": "More xmas shopping today - gulp.\n\nCheck out my  <a href=\"http://doug88888.blogspot.com/\">blog</a> if you like.",
				"libraryCatalog": "Flickr",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.flickr.com/search/?q=test",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.flickr.com/photos/lomokev/with/4952001059/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.flickr.com/photos/tags/bmw/",
		"items": "multiple"
	}
]
/** END TEST CASES **/