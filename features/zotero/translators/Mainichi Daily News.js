{
	"translatorID": "b56f856e-934e-4b46-bc58-d61dccc9f32f",
	"label": "Mainichi Daily News",
	"creator": "Frank Bennett",
	"target": "^https?://((?:search\\.)*mdn\\.)?mainichi\\.jp/(?:$|result\\?|mdnnews/|perspectives/|features?/|arts/|travel/|search/|english/)",
	"minVersion": "2.0b7",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2014-04-03 17:46:23"
}

// #################################
// #### Local utility functions ####
// #################################

var itemRe = new RegExp('.*\/([0-9]{8})[a-z]{1}[a-z0-9]{2}[0-9]{2}[a-z]{1}[0-9a-z]{3}[0-9]{6}c(\/[0-9]*)?\.html');


var cleanUp = function (str) {
	var ret;
	ret = str.replace(/[\u00a0\n]/g, " ");
	ret = ret.replace(/^\s+/, "").replace(/\s+$/, "").replace(/\s+/g, " ");
	ret = ret.replace(/\|.*/, "").replace(/<[^>]+>/g, "");;
	ret = Zotero.Utilities.unescapeHTML(ret);
	return ret;
}


// #########################
// ##### API functions #####
// #########################

var detectWeb = function (doc, url) {
	if (itemRe.test(doc.location.href)) {
		return "newspaperArticle";
	} else {
		return "multiple";
	}
}

var doWeb = function (doc, url) {
	var type, availableItems, xpath, found, nodes, headline, pos, myurl, m, title;
	var articles = [];
	type = detectWeb(doc, url);
	if (type === "multiple") {
		availableItems = {};
		if (url.match(/^https?:\/\/search\.mdn\.mainichi\.jp\/result\?|mainichi.jp\/search/)){
			xpath = '//div[@class="ResultTitle"]/a[contains(@href, "mdn.mainichi.jp")] | //div[@class="popIn_ArticleTitle"]/a[@class="popInLink"]';
		} else {
			xpath = '//h1[@class="NewsTitle"]/a[@href]|//ul[@class="Mark"]/li/a[@href]';
		}
		nodes = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
		found = nodes.iterateNext();
		while (found) {
			if (!itemRe.test(found.href)) {
				found = nodes.iterateNext();
				continue;
			}
			headline = found.textContent;
			//Z.debug(headline)
			headline = cleanUp(headline);
			availableItems[found.href] = headline;
			found = nodes.iterateNext();
		}
		Zotero.selectItems(availableItems, function (availableItems) {
			if (!availableItems) {
				return true;
			}
			for (var i in availableItems) {
			scrapeAndParse(i, availableItems[i]);
			}
		});

	} else if (type === "newspaperArticle") {
		xpath = '//h1[@class="NewsTitle"]';
		nodes = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
		title = nodes.iterateNext();
		if (title) {
			title = cleanUp(title.textContent);
			scrapeAndParse(url, title);
		}
	}
};

// ############################
// ##### Scraper function #####
// ############################

var scrapeAndParse = function (url, title) {
	var item, mytxt, m, val;
	item = new Zotero.Item("newspaperArticle");
	item.title = title;
	item.publicationTitle = "Mainichi Daily News";
	item.edition = "online edition";
	item.url = url;
	m = itemRe.exec(url);
	if (m) {
		var year = m[1].slice(0,4);
		var month = m[1].slice(4,6);
		var day = m[1].slice(6,8);
		item.date = [year, month, day].join("-");
	}
	item.attachments.push({title:"Mainichi Daily News snapshot", mimeType:"text/html", url:url});
	item.complete();
};
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://mainichi.jp/feature/news/20120410org00m040006000c.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Mainichi Daily News snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "サンデーらいぶらりぃ:小林 照幸・評『日本の「人魚」像』九頭見和夫・著",
				"publicationTitle": "Mainichi Daily News",
				"edition": "online edition",
				"url": "http://mainichi.jp/feature/news/20120410org00m040006000c.html",
				"date": "2012-04-10",
				"libraryCatalog": "Mainichi Daily News",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "サンデーらいぶらりぃ"
			}
		]
	},
	{
		"type": "web",
		"defer": true,
		"url": "http://mainichi.jp/search/index.html?q=bank&imgsearch=off",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://mainichi.jp/english/english/perspectives/news/20131230p2a00m0na010000c.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Mainichi Daily News snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Editorial: Gov't compensation for nuclear disaster must respect range of choices",
				"publicationTitle": "Mainichi Daily News",
				"edition": "online edition",
				"url": "http://mainichi.jp/english/english/perspectives/news/20131230p2a00m0na010000c.html",
				"date": "2013-12-30",
				"libraryCatalog": "Mainichi Daily News",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Editorial"
			}
		]
	}
]
/** END TEST CASES **/