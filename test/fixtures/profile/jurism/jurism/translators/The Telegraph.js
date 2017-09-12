{
	"translatorID": "40b9ca22-8df4-4f3b-9cb6-8f9b55486d30",
	"label": "The Telegraph",
	"creator": "Reino Ruusu",
	"target": "^https?://[^/]*telegraph\\.co\\.uk/",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2013-12-12 13:59:44"
}

function createExcludes(url, excludeArr) {
	var exclude = new Array();
	for(var i=0, n=excludeArr.length; i<n; i++) {
		if(url.indexOf(excludeArr[i]) == -1) exclude.push(excludeArr[i]);
	}
	return exclude;
}

function getLinks(doc, url) {
	//need to do some SOP checking here
	var origin = doc.location.protocol + '//' + doc.location.host +
				( (doc.location.port) ? ':' + doc.location.port : '' ) + '/';

	//some urls redirect to different subdomains
	var exclude = createExcludes(url, ['/fashion/']);

	var sopCheck = '[starts-with(normalize-space(@href),"' + origin +
		'") or starts-with(normalize-space(@href),"/")]' + 
		( (exclude.length) ? '[not(contains(@href,"' +
		exclude.join('") or contains(@href,"') + '"))]' : '' );

	var links = ZU.xpath(doc, '//div[starts-with(@class,"summaryMedium")]\
				/div[normalize-space(@class)="summary"][./p/a[contains(text(),"|")]]\
				/a' + sopCheck);
	if(!links.length) {
		links = ZU.xpath(doc, '//div[starts-with(@class,"summaryMedium") or starts-with(@class,"summaryBig")]\
				/div[normalize-space(@class)="summary" or @class="summary headlineOnly"]\
				//h3[not(@class)]/a' + sopCheck);
	}

	return links;
}

function detectWeb(doc, url) {
	if (ZU.xpath(doc, '//meta[@name = "tmgads.articleid"]').length) {
		if(ZU.xpathText(doc, '//meta[@name="tmgads.channel"]/@content') == 'blogs'){
			return 'blogPost';
		} else {
			return 'newspaperArticle';
		}
	} else if (url.indexOf('queryText') != -1) {
		if(getLinks(doc, url).length) {
			return 'multiple';
		}
	} else if(getLinks(doc, url).length) {
		return "multiple";
	}
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);

	translator.setHandler('itemDone', function(obj, item) {
		//set proper item type
		item.itemType = detectWeb(doc, url);

		//fix title
		item.title = item.title.replace(/\s*[-–][^-–]*Telegraph[^-]*$/, '');
	
		//fix newlines in abstract
		item.abstractNote = ZU.trimInternal(item.abstractNote);

		//keywords
		var keywords = ZU.xpathText(doc, '//meta[@name="keywords"]/@content');
		if(keywords && keywords.trim()) {
			item.tags = keywords.split(/,\s*/);
		}
		item.creators = [];
		//authors
		var authors	 = ZU.xpathText(doc, '//meta[@name="GSAAuthor"]/@content') ||
					ZU.xpathText(doc, '//meta[@name="DCSext.author"]/@content');
		if(authors) {
			item.creators.push(ZU.cleanAuthor(authors, 'author'));
		}

		item.publisher = 'Telegraph Media Group Limited';

		item.complete();
	});

	//some of the links redirect to a different subdomain, so we need
	//to skip those due to mozilla's Same Origin Policy
	//most of them should already be filtered out,
	//we'll throw an error so users can report this
	//e.g. telegraph.co.uk/fashion will redirect to fashion.telegraph.co.uk
	try{
		translator.getTranslatorObject(function(em) {
			em.addCustomFields({
				'title': 'title',
				'description': 'abstractNote',
				'WT.cg_s': 'section',
				'GSAGenre': 'section',
				'DCSext.Category': 'section',
				'DCSext.articleId': 'callNumber',
				'article-id': 'callNumber',
				'tmgads.articleid': 'callNumber',
				'last-modified': 'date',
				'DCSext.articleFirstPublished' : 'date'
			});
	
			em.doWeb(doc, url);
		});
	} catch(e) {
		Zotero.debug('Zotero cannot access page at ' + url + 
					', because it resides on a different domain.');
	}
}

function doWeb(doc, url) {
	if(detectWeb(doc, url) == 'multiple') {
		var links = getLinks(doc, url);

		var items = new Object();
		for(var i=0, n=links.length; i<n; i++) {
			items[links[i].href] = ZU.trimInternal(links[i].textContent);
		}

		Zotero.selectItems(items, function(selectedItems) {
			if(!selectedItems) return true;

			var urls = new Array();
			for(var i in selectedItems) {
				urls.push(i);
			}

			ZU.processDocuments(urls, scrape, function() {
			});
		});
	} else {
		scrape(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.telegraph.co.uk/news/worldnews/asia/china/8888909/China-Google-Earth-spots-huge-unidentified-structures-in-Gobi-desert.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "Malcolm",
						"lastName": "Moore",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"China",
					"Asia",
					"World News",
					"News"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "China: Google Earth spots huge, unidentified structures in Gobi desert",
				"publicationTitle": "Telegraph.co.uk",
				"date": "2011-11-14 13:50",
				"url": "http://www.telegraph.co.uk/news/worldnews/asia/china/8888909/China-Google-Earth-spots-huge-unidentified-structures-in-Gobi-desert.html",
				"abstractNote": "Vast, unidentified, structures have been spotted by satellites in the barren Gobi desert, raising questions about what China might be building in a region it uses for its military, space and nuclear programmes.",
				"libraryCatalog": "www.telegraph.co.uk",
				"accessDate": "CURRENT_TIMESTAMP",
				"section": "worldnews",
				"callNumber": "8888909",
				"publisher": "Telegraph Media Group Limited",
				"shortTitle": "China"
			}
		]
	},
	{
		"type": "web",
		"url": "http://blogs.telegraph.co.uk/news/cristinaodone/100141152/putin-wins-the-russian-election-but-it-wont-be-long-before-hes-in-trouble/",
		"items": [
			{
				"itemType": "blogPost",
				"creators": [
					{
						"firstName": "Cristina",
						"lastName": "Odone",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Russia",
					"Vladimir Putin",
					"Politics",
					"World"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "Putin 'wins' the Russian election. But it won't be long before he's in trouble",
				"publicationTitle": "News - Telegraph Blogs",
				"url": "http://blogs.telegraph.co.uk/news/cristinaodone/100141152/putin-wins-the-russian-election-but-it-wont-be-long-before-hes-in-trouble/",
				"abstractNote": "Vladimir Putin looks set to win the Russian elections – no surprise there, then. Few, even in Russia, believe that today's election is anything bu",
				"libraryCatalog": "blogs.telegraph.co.uk",
				"accessDate": "CURRENT_TIMESTAMP",
				"section": "Blogs",
				"callNumber": "100141152",
				"date": "2012-03-04 18:32:08",
				"publisher": "Telegraph Media Group Limited"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.telegraph.co.uk/search/?queryText=obama&Search=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.telegraph.co.uk/",
		"items": "multiple"
	}
]
/** END TEST CASES **/