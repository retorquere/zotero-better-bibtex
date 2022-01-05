{
	"translatorID": "5dd22e9a-5124-4942-9b9e-6ee779f1023e",
	"label": "Flickr",
	"creator": "Sean Takats, Rintze Zelle, and Aurimas Vinckevicius",
	"target": "^https?://(www\\.)?flickr\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2016-09-20 06:21:01"
}

function detectWeb(doc, url) {
	/*
	if (ZU.xpath(doc,'//h1[@property="dc:title" and starts-with(@id, "title_div")]').length) {
		return getPhotoId(doc) ? "artwork" : null;
	}
	
	var type = ZU.xpathText(doc,'//meta[@name="og:type"]/@content');
	if ( type && type.substr(type.length - 5) == 'photo') {
		return getPhotoId(doc) ? "artwork" : null;
	}*/

	
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
	if (getPhotoId(doc)) {
		return "artwork";
	}
}

function getSearchResults(doc, checkOnly) {
	//some search results are hidden ("display: none")
	//videos have a second <a/> element ("a[1]")
	var elmts = ZU.xpath(doc, '//div[not(contains(@style, "display: none"))]\
		/*/span[contains(@class, "photo_container")]/a[1]');
	if (!elmts.length){
		elmts = ZU.xpath(doc, '//div[not(contains(@style, "display: none"))]\
			/*/a[@class="title"]');
	}
	
	var items = {}, found = false;
	for (var i=0, n=elmts.length; i<n; i++) {
		var title = elmts[i].title;
		//in photostreams, the <a> element doesn't have a title attribute
		if (title == "") {
			title = elmts[i].textContent;
			//title = elmts[i].getElementsByTagName("img")[0].alt;
		}
		title = ZU.trimInternal(title);
		if (!title) continue;
		
		var photoId = elmts[i].href.match(/\/photos\/[^\/]*\/([0-9]+)/);
		if (!photoId) continue;
		
		if (checkOnly) return true;
		
		found = true;
		items[photoId[1]] = title;
	}
	
	return found ? items : false;
}

function getPhotoId(doc) {
	var photoId = false;
	var elmt = ZU.xpathText(doc, '//meta[@property="og:image" or @name="og:image"]/@content');
	if (elmt) {
		photoId = elmt.substr(elmt.lastIndexOf('/')+1).match(/^[0-9]+/);
	}
	return photoId ? photoId[0] : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc), function (items) {
			if (!items) return true;
			
			var ids = [];
			for (var id in items) {
				ids.push(id);
			}
			
			fetchForIds(ids);
		});
	} else {
		fetchForIds([getPhotoId(doc)]);
	}
}

function fetchForIds(ids) {
	var key = "3cde2fca0879089abf827c1ec70268b5";
	var apiUrl = "https://api.flickr.com/services/rest/?api_key=" + key
		+ "&method=flickr.photos.getInfo&photo_id=";
	
	ZU.doGet(
		ids.map(function(id) { return apiUrl + encodeURIComponent(id) }),
		parseResponse
	);
}

var licenses = [ // See https://api.flickr.com/services/rest/?api_key=3cde2fca0879089abf827c1ec70268b5&photo_id=3122503680&method=flickr.photos.licenses.getInfo
	'All Rights Reserved',
	'Attribution-NonCommercial-ShareAlike License',
	'Attribution-NonCommercial License',
	'Attribution-NonCommercial-NoDerivs License',
	'Attribution License',
	'Attribution-ShareAlike License',
	'Attribution-NoDerivs License',
	'No known copyright restrictions',
	'United States Government Work'
];

function parseResponse(text) {
	var doc = (new DOMParser()).parseFromString(text, 'application/xml');
	
	var status = doc.firstElementChild.getAttribute('stat');
	if (status && status == 'fail') {
		var error = doc.firstElementChild.firstElementChild;
		throw new Error('Error retrieving metadata: ' + error.getAttribute('msg')
			+ ' (' + error.getAttribute('code') + ')');
	}
	
	var photo = doc.firstElementChild.firstElementChild;
	var newItem = new Zotero.Item("artwork");

	var title = ZU.xpathText(photo, './title');
	if (title && (title = ZU.trimInternal(title))) {
		newItem.title = title;
	} else {
		newItem.title = " ";
	}
	
	var tags = ZU.xpath(photo, './tags/tag');
	if (tags.length) {
		for (var i=0; i<tags.length; i++) {
			newItem.tags.push(ZU.trimInternal(tags[i].textContent));
		}
	}
	
	var date = ZU.xpathText(photo, './dates/@taken');
	if (date) {
		newItem.date = date.substr(0, 10);
	}
	
	var owner = ZU.xpathText(photo, './owner/@realname')
	if (owner) {
		newItem.creators.push(ZU.cleanAuthor(owner, "artist"));
	} else if (owner = ZU.xpathText(photo, './owner/@username')) {
		newItem.creators.push({
			lastName: owner,
			creatorType: 'artist',
			fieldMode: 1
		});
	}
	
	var url = ZU.xpath(photo, './urls/url[@type="photopage"]')[0];
	if (url) {
		newItem.url = url.textContent;
	}
	
	var description;
	if ((description = ZU.xpathText(photo, './description'))) {
		newItem.abstractNote = description;
	}
	
	var license = photo.getAttribute('license');
	if (license && licenses[license * 1]) {
		newItem.rights = licenses[license * 1];
	}
	
	var media = photo.getAttribute('media'); // photo, screenshot, other... I think
	if (media) {
		newItem.artworkMedium = media;
	}
	
	// TODO:
	// * add location where the photo was taken into Extra?
	
	// We can build the original photo URL manually. See https://www.flickr.com/services/api/misc.urls.html
	var secret = photo.getAttribute('originalsecret');
	var originalFormat = photo.getAttribute('originalformat');
	if (secret && originalFormat) { // Both of these appear to be false if the owner disables downloading
		var fileUrl = 'https://farm' + photo.getAttribute('farm') + '.staticflickr.com/'
		 + photo.getAttribute('server') + '/'
		 + photo.getAttribute('id') + '_' + secret
		 + '_o.' + originalFormat;
		 
		newItem.attachments.push({
			title: newItem.title,
			url: fileUrl,
			mimeType: 'image/' + photo.getAttribute('originalformat') // jpg|gif|png
		});
	}
	
	newItem.complete();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.flickr.com/photos/doug88888/3122503680/in/set-72157624194059533",
		"items": [
			{
				"itemType": "artwork",
				"title": "The blues and the greens EXPLORED",
				"creators": [
					{
						"lastName": "@Doug88888",
						"creatorType": "artist",
						"fieldMode": 1
					}
				],
				"date": "2008-12-07",
				"abstractNote": "More xmas shopping today - gulp.\n\nCheck out my  <a href=\"http://doug88888.blogspot.com/\" rel=\"nofollow\">blog</a> if you like.",
				"artworkMedium": "photo",
				"libraryCatalog": "Flickr",
				"rights": "Attribution-NonCommercial-ShareAlike License",
				"url": "https://www.flickr.com/photos/doug88888/3122503680/",
				"attachments": [
					{
						"title": "The blues and the greens EXPLORED",
						"mimeType": "image/jpg"
					}
				],
				"tags": [
					"18mm",
					"400d",
					"55mm",
					"beautiful",
					"bloom",
					"blossom",
					"blue",
					"bokeh",
					"bright",
					"buy",
					"canon",
					"commons",
					"creative",
					"dec07",
					"december",
					"doug88888",
					"england",
					"eos",
					"fall",
					"flower",
					"fresh",
					"frosty",
					"gimp",
					"grass",
					"green",
					"ham",
					"house",
					"image",
					"images",
					"isolated",
					"isolation",
					"leaf",
					"living",
					"lone",
					"nature",
					"picture",
					"pictures",
					"plant",
					"pretty",
					"purchase",
					"richmond",
					"south",
					"southwest",
					"strand",
					"tones",
					"uk",
					"west"
				],
				"notes": [],
				"seeAlso": []
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
	},
	{
		"type": "web",
		"url": "https://www.flickr.com/photos/lomokev/galleries/72157623433999749/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.flickr.com/photos/lomokev/favorites/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.flickr.com/photos/lomokev/sets/502509/",
		"items": "multiple"
	}
]
/** END TEST CASES **/