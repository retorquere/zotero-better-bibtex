{
        "translatorID": "845b4d53-b97f-406a-8a06-1f8331e00a5a",
        "label": "Biz Makoto",
        "creator": "Frank Bennett",
        "target": "^http://((.*\\.|)bizmakoto\\.jp|kensaku\\.itmedia\\.co\\.jp)/",
        "minVersion": "2.0b7",
        "maxVersion": "",
        "priority": 100,
        "inRepository": "1",
        "translatorType": 4,
        "lastUpdated": "2011-04-06 12:47:15"
}

/*
  *
 */

var itemRe = new RegExp('^http://(.*\.|)bizmakoto.jp/.*/.*\.html');
var searchRe = new RegExp('http://((.*\.|)bizmakoto\.jp/|kensaku\.itmedia\.co\.jp/bizmakoto\.html)');
var splitRe = new RegExp('<[Hh]3>');
var articleRe = new RegExp('/articles/');

var scrapeCallback = function (doc, justLooking) {
	var head = doc.getElementsByTagName('head');
	var nodes = head[0].childNodes;
	var rdf = false;
	for (var i = 0, ilen = nodes.length; i < ilen; i += 1) {
		if (nodes[i].nodeName === '#comment') {
			var rdf = nodes[i].nodeValue;
			break;
		}
	}
	if (rdf) {
		if (justLooking) {
			return true;
		}
		//var item = new Zotero.Item;
		// set attachment here as attachments
		// tmplBody for content page
		var body = doc.getElementById('tmplBody');
		var comments = doc.getElementById('comments');
		comments.parentNode.removeChild(comments);

		var elems = doc.getElementsByTagName("script");
		for (var i = elems.length - 1; i > -1; i += -1) {
			elems[i].parentNode.removeChild(elems[i]);
		}
		var trackbacks = doc.getElementById("trackbacks");
		if (trackbacks) {
			trackbacks.parentNode.removeChild(trackbacks);
		}
		var extract = Zotero.Utilities.composeDoc(doc, "Biz Makoto content", body);
		var attachments = [{
			title:"Biz Makoto content",
			document: extract,
			snapshot:true
		}];
		url = doc.location.href;

		// RDF
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("5e3ad958-ac79-463d-812b-a86a9235c28f");
		translator.setString(rdf);
		translator.setHandler("itemDone", function(obj, item) {
				item.itemType = 'newspaperArticle';
				item.url = url;			
				item.attachments = attachments;
				item.libraryCatalog = "";
				item.complete();
			});
		translator.translate();
	}
	return false;
};

var selectCallback = function (doc) {
	var availableItems = {};
	var breakme = true;
	var divs = doc.getElementsByClassName('maincol');
	if (divs.length === 0) {
		divs = doc.getElementsByClassName("kwoutBox");
	} else {
		breakme = false;
	}
	for (var i = 0, ilen = divs.length; i < ilen; i += 1) {
		var anchors = divs[i].getElementsByTagName('a');
		for (var j = 0, jlen = anchors.length; j < jlen; j += 1) {
			var a = anchors[j];
			var url = a.getAttribute('href');
			if (url && url.indexOf('/articles/') > -1 && a.textContent) {
				availableItems[url] = a.textContent;
				if (breakme) {
					break;
				}
			}
		}
	}
	var runOk = false;
	for (var item in availableItems) {
		runOk = true;
		break;
	}
	Zotero.debug("ok: "+runOk);
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
	} else if (searchRe.test(url) && scrapeCallback(doc, true)) {
		return "multiple";
	}
}

var doWeb = function (doc, url) {
	var type, availableItems, xpath, found, nodes, headline, pos, myurl, m, items, title;
	type = detectWeb(doc, url);
	if (type === "multiple") {
		selectCallback(doc);
	} else if (type === "newspaperArticle") {
		Zotero.Utilities.processDocuments([url], scrapeCallback, Zotero.done);
		Zotero.wait();
	}
};
