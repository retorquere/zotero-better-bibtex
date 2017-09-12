{
        "translatorID": "8080decd-1242-4e6c-85be-f69de693e5c7",
        "label": "Chuo Nippo",
        "creator": "Frank Bennett",
        "target": "^http://japanese.joins.com/",
        "minVersion": "2.0b7",
        "maxVersion": "",
        "priority": 100,
        "inRepository": "1",
        "translatorType": 4,
        "lastUpdated": "2011-04-05 13:34:05"
}

/*
 * Sample search URL
 *   http://japanese.joins.com/search/japanese.php?pageNum=&order=&query=music&x=0&y=0
 *
 * Sample fixed URL
 *   http://japanese.joins.com/article/article.php?aid=138810&servcode=A00&sectcode=A00
 */

var itemRe = new RegExp('.*/article/article.php');
var searchRe = new RegExp('.*\/search\/japanese.php');
var splitRe = new RegExp('searchRtit');
var articleRe = new RegExp('article.php');

var scrapeAndParseCallback = function (doc) {
	var item = new Zotero.Item("newspaperArticle");
	var titleNode = doc.getElementById("title");
	var title = Zotero.Utilities.getTextContent(titleNode);
	item.title = title;
	item.publicationTitle = "中央日報";
	item.edition = "日本語版";
	item.url = doc.location.href;
	var dateEngine = new Date;
	var date = dateEngine.toDateString();
	item.date = date;
	item.accessed = date;

	var label = "Chuo Nippo content";
	var bodyBlock = doc.getElementById("articleBody");
	var newDoc = false;
	if (bodyBlock) {
		newDoc = Zotero.Utilities.composeDoc(doc, label + ", " + date, [titleNode, bodyBlock]);
	}
	if (newDoc) {
		item.attachments.push({
				title: label,
				document:newDoc,
				snapshot:true
        	});
	}
	item.complete();
};

var selectCallback = function (text) {
	var availableItems = {};

	// Possible candidate for a string-based framework?
	// Approach would be to instantiate the page, and
	// parse with methods, two of which would basically
	// consist of code below. Something like:
	//
	// var page = new SFW(text);
	// var result = page.split("article-id").scan("href=").extract().extract("<a ", ">", "<");
	// for (var i = 0, ilen = result.length; i < ilen; i += 1) {
	//   print("url[" + i + "] = " + result[i][0];
	//   print("title[" + i + "] = " + result[i][1];
	// }
	
	var strings = text.split(splitRe);
	for (var i = 1, ilen = strings.length; i < ilen; i += 1) {
		var url = false;
		var title = false;
		var s = strings[i];
		var hrefL = s.indexOf("href=");
		if (hrefL > -1 && s[hrefL + 6]) {
			s = s.slice(hrefL + 5);
			hrefR = s.slice(1).indexOf(s[0]);
			var url = s.slice(1, hrefR);
		}
		if (url) {
			var aL = s.slice(6).indexOf("<a ");
			if (aL > -1 && s.indexOf(">") > -1) {
			    s = s.slice(s.indexOf(">") + 1);
				if (s && s.indexOf("<") > 0) {
					title = s.slice(0, s.indexOf("<"));
				}
			}
		}

		if (url && title && articleRe.test(url)) {
			availableItems["http://japanese.joins.com" + url] = title;
		}
	}
	var runOk = false;
	for (var item in availableItems) {
		runOk = true;
		break;
	}
	if (runOk) {
		var items = Zotero.selectItems(availableItems);
		var urls = [];
		for (var myurl in items) {
			urls.push(myurl);
		}
		Zotero.Utilities.processDocuments(urls, scrapeAndParseCallback, Zotero.done );
		Zotero.wait();
	}
};

var detectWeb = function (doc, url) {
	if (itemRe.test(url)) {
		return "newspaperArticle";
	} else if (searchRe.test(url)) {
		return "multiple";
	}
}

var doWeb = function (doc, url) {
	var type, availableItems, xpath, found, nodes, headline, pos, myurl, m, items, title;
	type = detectWeb(doc, url);
	if (type === "multiple") {
		Zotero.Utilities.doGet(url, selectCallback, function(){} );
	} else if (type === "newspaperArticle") {
		Zotero.Utilities.processDocuments([url], scrapeAndParseCallback, Zotero.done);
		Zotero.wait();
	}
};
