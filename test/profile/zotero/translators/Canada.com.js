{
	"translatorID": "4da40f07-904b-4472-93b6-9bea1fe7d4df",
	"label": "Canada.com",
	"creator": "Adam Crymble",
	"target": "^https?://www\\.canada\\.com",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-01-30 22:52:08"
}

function detectWeb(doc, url) {
	if (doc.location.href.match("story")) {
		return "newspaperArticle";
	} else if (doc.location.href.match("search")) {
		return "multiple";
	}
}


function scrape(doc, url) {

	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;		
	
	var dataTags = new Object();
	var tagsContent = new Array();
	var fieldTitle;
	
	var newItem = new Zotero.Item("newspaperArticle");

	newItem.title = doc.title;

	if (doc.evaluate('//div[@class="storyheader"]/h4', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		newItem.abstractNote = doc.evaluate('//div[@class="storyheader"]/h4', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	} else if (doc.evaluate('//div[@class="storyheader"]/h2', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		newItem.abstracteNote = doc.evaluate('//div[@class="storyheader"]/h2', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	}

	if (doc.evaluate('//meta[@name="Author"]/@content', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		var author = doc.evaluate('//meta[@name="Author"]/@content', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	
		if (author.match(/\n/)) {
			author1 = author.split(/\n/);
			if (author1[0].match(/ and /)) {
				author2 = author1[0].split(/ and /);
				for (var i in author2) {
					newItem.creators.push(Zotero.Utilities.cleanAuthor(author2[i], "author"));	
				}
			} else {
				newItem.creators.push(Zotero.Utilities.cleanAuthor(author1[0], "author"));	
			}
		} else {
			newItem.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));	
		}
	}
		
	if (doc.evaluate('//meta[@name="PubDate"]/@content', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		var date1 = doc.evaluate('//meta[@name="PubDate"]/@content', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent.replace(/^\s*|\s*$/g, '');
		if (date1) {
			newItem.date = date1;
		}
	}	
	
	if (doc.evaluate('//ul[@class="home"]/li/a/span', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		var pubTitle = doc.evaluate('//ul[@class="home"]/li/a/span', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		if (pubTitle.match("Home")) {
			newItem.publicationTitle = pubTitle.substr(0, pubTitle.length-5);
		} else {
			newItem.publicationTitle = pubTitle;
		}
	} else {
		newItem.publicationTitle = "Canada.com";
	}
	
	newItem.url = doc.location.href;

	newItem.complete();
}

function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	
	var articles = new Array();
	
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var next_title;
		
		if (doc.evaluate('//div[@class="even"]/p/a', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		Zotero.debug("AAAAAA");
			var titles0 = doc.evaluate('//div[@class="even"]/p/a', doc, nsResolver, XPathResult.ANY_TYPE, null);
			
			while (next_title = titles0.iterateNext()) {
				if (next_title.href.match("story") && next_title.href.match("canada.com")) {
					items[next_title.href] = next_title.textContent;
				}
			}
		}
		
		if (doc.evaluate('//h1/a', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		Zotero.debug("new site?");
			var titles0 = doc.evaluate('//h1/a', doc, nsResolver, XPathResult.ANY_TYPE, null);
			
			while (next_title = titles0.iterateNext()) {
				if (next_title.href.match("story") && next_title.href.match("canada.com")) {
					items[next_title.href] = next_title.textContent;
				}
			}
		}
		
		if (doc.evaluate('//div[@class="odd"]/p/a', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		Zotero.debug("BBBBB");
			var titles1 = doc.evaluate('//div[@class="odd"]/p/a', doc, nsResolver, XPathResult.ANY_TYPE, null);
			
			while (next_title = titles1.iterateNext()) {
				if (next_title.href.match("story") && next_title.href.match("canada.com")) {
					items[next_title.href] = next_title.textContent;
				}
			}
		}
		
		if (doc.evaluate('//p/b/a', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
			Zotero.debug("CCCCC");
			var titles2 = doc.evaluate('//p/b/a', doc, nsResolver, XPathResult.ANY_TYPE, null);
			while (next_title = titles2.iterateNext()) {
				if (next_title.href.match("story") && next_title.href.match("canada.com")) {
					items[next_title.href] = next_title.textContent;
				}
			}
		}
		
		if (doc.evaluate('//div[@class="name"]/a', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
			
			Zotero.debug("DDDD");
			var titles3 = doc.evaluate('//div[@class="name"]/a', doc, nsResolver, XPathResult.ANY_TYPE, null);
			while (next_title = titles3.iterateNext()) {
				if (next_title.href.match("story")  && next_title.href.match("canada.com")) {
					items[next_title.href] = next_title.textContent;
				}
			}
		}

		
		
		
		items = Zotero.selectItems(items);
		for (var i in items) {
			articles.push(i);
		}
	} else {
		articles = [url];
	}
	Zotero.Utilities.processDocuments(articles, scrape, function() {Zotero.done();});
	Zotero.wait();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.canada.com/search/search.html?stype=si&q=argentina&x=0&y=0&radio_btns=canada.com",
		"items": "multiple"
	}
]
/** END TEST CASES **/