{
	"translatorID": "9a0ecbda-c0e9-4a19-84a9-fc8e7c845afa",
	"label": "Lulu",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://www\\.lulu\\.com/shop/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 101,
	"inRepository": true,
	"translatorType": 12,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-11-04 21:18:44"
}

function getSearchResults(doc) {
	return ZU.xpath(doc, '//div[@class="middle-column"]/div[@class="products"]/div//a[@class="title" and @href]');
}

function detectWeb(doc, url) {
	if (url.search(/\/product-\d+\.html/) != -1) {
		return 'book';
	}
	
	if (url.indexOf('/search.ep?') != -1
		&& getSearchResults(doc).length) {
		return 'multiple';
	}
}

function doWeb(doc, url) {
	var results = getSearchResults(doc);
	if (results.length) {
		var items = {};
		for (var i=0, n=results.length; i<n; i++) {
			items[results[i].href] = ZU.trimInternal(results[i].textContent);
		}
		
		Z.selectItems(items, function(selectedItems) {
			if (!selectedItems) return true;
			
			var urls = [];
			for (var i in selectedItems) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		})
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var item = makeItem(doc, url);
	item.complete();
}

function makeItem(doc, url) {
	var item = new Zotero.Item('book');
	item.title = ZU.capitalizeTitle(
		ZU.trimInternal(ZU.xpathText(doc, '//div[@class="product-information"]/h2[1]')),
		true
	);
	
	var authors = ZU.xpath(doc, '//div[@class="product-information"]//span[@class="authors"]/a/span');
	for (var i=0, n=authors.length; i<n; i++) {
		var name = ZU.trimInternal(authors[i].textContent).replace(/^(?:Dr|Prof)\.?\s|\s(?:M.?A|Ph\.?D|B\.?S|B\.?A|M\.?D(?:\.?\sPh\.?D)?)\.?$/gi, '');
		item.creators.push(ZU.cleanAuthor(ZU.capitalizeTitle(name, true), 'author'));
	}
	
	var description = doc.getElementsByClassName('description')[0];
	if (description.getElementsByClassName('expandable-text').length) {
		description = ZU.xpathText(description, './span/text()[1]')
			+ ' ' + ZU.xpathText(description, './span/span[@class="more-text"]/text()[1]');
	} else {
		description = description.textContent;
		if (ZU.trimInternal(description) == 'No description supplied') {
			description = false;
		}
	}
	
	if (description) {
		item.abstractNote = description.trim().replace(/ +/, ' ');
	}
	
	var productDetails = doc.getElementsByClassName('product-details')[0];
	item.ISBN = ZU.cleanISBN(ZU.xpathText(productDetails, './dd[@class="isbn"]') || '', true);
	item.publisher = ZU.trimInternal(ZU.xpathText(productDetails, './dd[@class="publisher"]') || '');
	item.rights = ZU.trimInternal(ZU.xpathText(productDetails, './dd[@class="copyright-info"]') || '');	
	item.language = ZU.trimInternal(ZU.xpathText(productDetails, './dd[@class="language"]') || '');
	item.date = ZU.strToISO(ZU.xpathText(productDetails, './dd[@class="publication-date"]') || '');
	item.numPages = ZU.trimInternal(ZU.xpathText(productDetails, './dd[@class="pages"]') || '');
	
	item.attachments.push({
		title: "Lulu Link",
		url: url,
		mimeType: 'text/html',
		snapshot: false
	})
	
	return item;
}

function detectSearch(items) {
	if (items.ISBN) return true;
	
	if (!items.length) return;
	
	for (var i=0, n=items.length; i<n; i++) {
		if (items[i].ISBN && ZU.cleanISBN('' + items[i].ISBN)) {
			return true;
		}
	}
}

function doSearch(items) {
	if (!items.length) items = [items];
	
	var query = [];
	for (var i=0, n=items.length; i<n; i++) {
		var isbn;
		if (items[i].ISBN && (isbn = ZU.cleanISBN('' + items[i].ISBN))) {
			(function(item, isbn) {
				ZU.processDocuments('http://www.lulu.com/shop/search.ep?keyWords=' + isbn, function(doc, url) {
					var results = getSearchResults(doc);
					if (!results.length) {
						if (item.complete) item.complete();
						return;
					}
					
					ZU.processDocuments(results[0].href, function(doc, url) {
						var newItem = makeItem(doc, url);
						if (newItem.ISBN == isbn) {
							newItem.complete();
						} else {
							if (item.complete) item.complete();
						}
					});
				})
			})(items[i], isbn);
		} else if (items[i].complete) {
			items[i].complete();
		}
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.lulu.com/shop/dr-r-selvakumar/diseases-of-plantation-crops/ebook/product-17472985.html",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "R.",
						"lastName": "Selvakumar",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Lulu Link",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"title": "Diseases of Plantation Crops",
				"publisher": "Dr.SELVAKUMAR RAJAN",
				"rights": "selvakumar (Standard Copyright License)",
				"language": "English",
				"date": "2011-09-30",
				"numPages": "15",
				"libraryCatalog": "Lulu"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.lulu.com/shop/search.ep?keyWords=zotero",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.lulu.com/shop/daniel-segars-and-kelli-segars/4-week-fat-loss-program-for-busy-people/ebook/product-21169392.html",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Daniel",
						"lastName": "Segars",
						"creatorType": "author"
					},
					{
						"firstName": "Kelli",
						"lastName": "Segars",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Lulu Link",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"title": "4 Week Fat Loss Program for Busy People",
				"abstractNote": "Fitness Blender's 4 Week Fat Loss Program for Busy People features workouts that are 30 minutes or less, combining fat blasting HIIT with metabolism boosting strength training to bring about incredible results quickly. This challenging home workout program only requires dumbbells. The detailed, day-by-day plan uses Fitness Blender's free online workout videos to challenge & change your body fast. HIIT, cardio, strength training, circuit training, supersets, plyometrics, Pilates, yoga, & kettlebell training (dumbbells are an ample substitute) come together to create the ideal workout program.  Many people who complete these programs see weight loss - often 8-12 lbs in just 1 month - reduced body fat, drastic improvements in body tone, endurance, strength, & flexibility gains. Each day you get a Calorie Burn estimate & we include a brief but effective Nutrition section to give you the essentials on how to properly nourish yourself during the program. 30 Minutes is 1/48th  of your day; no more excuses.",
				"publisher": "Fitness Blender",
				"rights": "Standard Copyright License",
				"language": "English",
				"date": "2013-08-21",
				"numPages": "63",
				"libraryCatalog": "Lulu"
			}
		]
	},
	{
		"type": "search",
		"input": {
			"ISBN": "9780951470329"
		},
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Stephen Skelton",
						"lastName": "MW",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Lulu Link",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"abstractNote": "ALL YOU NEED TO KNOW ABOUT GROWING VINES IN 123 PAGES. \n\nThis book is a basic introduction to growing grapes and aimed at the serious student in the wine trade, WSET Diploma student or Master of Wine candidate. It is also very useful for those thinking of setting up vineyards as it answers a lot of the basic questions. \n\nHas sold over 3,500 copies now and received LOTS of emails saying how helpful it has been. \n\n\"Couldn't have become an MW without your book\" was the latest endorsement!",
				"ISBN": "9780951470329",
				"rights": "Stephen Skelton (Standard Copyright License)",
				"language": "English",
				"numPages": "146",
				"libraryCatalog": "Lulu",
				"title": "Viticulture - An Introduction to Commercial Grape Growing for Wine Production",
				"publisher": "Stephen Skelton",
				"date": "2017-03-06"
			}
		]
	}
]
/** END TEST CASES **/