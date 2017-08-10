{
	"translatorID": "d4cccbd1-a92f-4dd8-b636-74eb9e344441",
	"label": "SIRS Knowledge Source",
	"creator": "ProQuest PME Team",
	"target": "^https?://([^/]+\\.)?sks\\.sirs\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2015-02-02 23:47:53"
}

/*
SIRS Knowledge Source Translator
Copyright (C) 2014 ProQuest LLC
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var yearRE = /\b\d{4}\b/;
var volRE = /Vol\. +#?(\d+|[MCLXIV]+)/;
var issueRE = /\(?(?:No\.|Issue)\)? #?(\d+\/?\d*)/;
var placeRE = /\((.+?)\)/;

function detectWeb(doc, url) {
	var results = ZU.xpath(doc, './/div[@class="result-icon"]//img/@src');

	if (results.length > 1) {
		return "multiple";
	}
	else if (results.length == 1) {
		var typeImage = results[0].value;
		
		if (typeImage.indexOf("magazines") > -1) {
			return "magazineArticle";
		}
		else if (typeImage.indexOf("newspapers") > -1) {
			return "newspaperArticle";
		}
		else if (typeImage.indexOf("books") > -1) {
			return "encyclopediaArticle";
		}
		else {
			// "websites", "govt_docs", "primary_srcs"
			return "document";
		}
	}

	return false;
}

function doWeb(doc, url) {
	var type = detectWeb(doc, url);

	if (type == "multiple") {
		importSearchPage(doc);
	}
	else if (type) {
		importSingle(doc, type, url);
	}
}

function andSplit(author) {
	return author.split(" and ")
		.map(function(a) { 
			a = ZU.trim(a);
			return (a.charAt(a.length - 1) == "," ? a.slice(0, a.length - 1) : a);
		})
		.filter(function(v) { return !!v; });
}

function commaSplit(author) {
	var authorSet = [];
	
	for (var i = 0; i < author.length; i++) {
		authorSet = authorSet.concat(author[i].split(",").map(function (a) {
			return ZU.trim(a);
		}));
	}
	
	return authorSet;
}

function parseAuthors(author, isSearch) {
	var authorSet = [];
	
	if (author) {
		var type = "author";
		author = ZU.trim(author);
	
		if (author.charAt(0) == ',') {
			author = ZU.trim(author.substring(1));
		}
		
		if (author.toLowerCase().indexOf("by") == 0) {
			author = ZU.trim(author.substring(2));
		}
		
		author = andSplit(author);
		
		if (!isSearch) {
			author = commaSplit(author);
		}
		
		if (author[author.length - 1] == "eds.") {
			type = "editor";
			author.pop();
		}
	
		for (var i = 0; i < author.length; i++) {		
			if (author[i] == "others") {
				continue;
			}
			
			authorSet.push(ZU.cleanAuthor(author[i], type, author[i].indexOf(",") > -1));
		}
	}
	
	return authorSet;
}

function importSingle(doc, type, url) {
	var item = new Zotero.Item(type);
	
	item.url = url;
	
	var summary = ZU.xpathText(doc, '//div[@id="document-view"][a[@name="summary"]]/p');
	if (summary != "No summary available") {
		item.abstractNote = summary;
	}
	
	item.tags = ZU.xpath(doc, '//div[@id="rel-subjects"]//td/a').map(function(a) {
		return a.textContent;
	});
	
	var pdfUrl = ZU.xpath(doc, '//div[@id="rel-contents"]//a[@class="pdf-icon"]')[0];
	if (pdfUrl && pdfUrl.href) {
		item.attachments.push({
			mimeType: "application/pdf",
			title: "Full Text PDF",
			url: pdfUrl.href
		});
	}
	
	item.attachments.push({
		title: "SIRS Knowledge Source Snapshot",
		document: doc
	});
	
	var root = ZU.xpath(doc, '//div[@id="artcont"]');
	
	var title = ZU.xpath(root, './/h1')[0];
	if (!title) {
		title = ZU.xpath(root, './/strong[not(ancestor::table)]')[0];
	}
	if (title) {
		item.title = title.textContent;
	}
	
	var author = [];
	var authorXpath = ['.//cmsheader//i', './/em/text()', './p/text()', './text()'];
	
	for (var i = 0; i < authorXpath.length; i++) {
		author = ZU.xpath(root, authorXpath[i]).filter(function (node) {
			return ZU.trim(node.textContent).toLowerCase().indexOf("by ") == 0;
		});
	
		if (author.length > 0) break;
	}
	
	var citation = ZU.xpath(doc, '//div[@id="document-view"]/div[@class="mlacitation"]/p');
	
	if (author.length == 0) {
		author = citation[0].textContent;
		if (author.indexOf('"') > 0) {
			// if we make it in here, we probably have an organizational author
			author = author.slice(0, author.indexOf('"') - 2);
			item.creators = [{lastName: author, creatorType: "author", fieldMode: 1}];
		}
	}
	else {
		item.creators = parseAuthors(ZU.trim(author[0].textContent));
	}
	
	item.libraryCatalog = cleanLastChar(ZU.xpath(citation, './i/text()')[1].textContent);

	var dateText = ZU.trim(ZU.xpath(citation, './text()')[1].textContent);
	dateText = dateText.slice(2, dateText.length);
	
	var datePageObj = getDatePages(ZU.trim(dateText));
	item.date = datePageObj.date;
	item.pages = datePageObj.pages;
	
	var pubTitle = ZU.xpath(citation, './i')[0];
	if (pubTitle) {
		item = getPlaceIssueVol(pubTitle.textContent, item);
	}
	
	if (!(item.issue && item.volume && item.place && item.date)) {
		var headerLines = ZU.xpath(root, './cmsheader/h5/text()');
	
		if (headerLines.length == 0) {
			headerLines = ZU.xpath(root, './h5/text()');
		}
	
		if (headerLines.length > 0) {
			headerLines = headerLines.map(function(node) {
				return ZU.trim(node.textContent);
			});
	
			if (!item.publicationTitle) {
				item.publicationTitle = headerLines[0];
			}
		
			for (var i = 1; i < headerLines.length; i++) {
				if (headerLines[i].indexOf("Copyright") > -1) {
					continue;
				}
			
				var issueCheck = issueRE.test(headerLines[i]);
				var volumeCheck = volRE.test(headerLines[i]);
			
				if ((!item.issue && issueCheck) || (!item.volume && volumeCheck)) {
					if (issueCheck) {
						item.issue = issueRE.exec(headerLines[i])[1];
					}
				
					if (volumeCheck) {
						item.volume = volRE.exec(headerLines[i])[1];
					}
				}
				else if (!item.date && yearRE.test(headerLines[i]))	{
					datePageObj = getDatePages(headerLines[i]);
					item.pages = datePageObj.pages;
					item.date = datePageObj.date			
				}
				else if (!item.place && placeRE.test(headerLines[i]) && item.itemType != "document" && !issueCheck && !volumeCheck) {
					// The check for "document" itemType is to catch a weird quirk that happens on "Government Document"
					// and "Primary Source" SIRS page types. (It does not affect "WebSite" pages.) These pages have one 
					// or more extra lines in the headerLines array for issuing organizations, such as the 
					// Department of Justice or FBI. There is no way to reliably differentiate these lines from the 
					// place, and these page types never seem to have a place anyway, so they're getting screened out.
					item.place = headerLines[i].substring(1, headerLines[i].length - 1);
				}
			}
		}
	}
	
	item.complete();
}

function getDatePages(line) {
	var split = line.indexOf('n.p.');
	var pages, date;

	if (split > -1) {		//no pages
		date = line.substring(0, split);
	}
	else {
		var regex = /pp?\.|:/;
	
		if (regex.test(line)) {
			var match = line.match(regex)[0];
			split = line.indexOf(match);
			pages = cleanLastChar(line.substring(split + 1 + match.length));
			date = line.substring(0, split);
		}
	}

	date = cleanLastChar(ZU.trim(date || line));

	return {"pages" : pages, "date" : date};
}

function cleanLastChar(s) {
	return s.replace(/\W$/, "");
}

function importSearchPage(doc) {
	var results = ZU.xpath(doc, '//div[@class="result normal-document"]');
	var items = {};
	
	for (var i = 0; i < results.length; i++) {
		items[i] = ZU.trim(ZU.xpathText(results[i], './/div[@class="line1"]/a'));
	}
	
	Zotero.selectItems(items, function (items) {
		if (!items) {
			return true;
		}
		
		for (var item in items) {
			processSearchItems(results[item]);
		}
	});
}

function processSearchItems(data) {
	var ref = new Zotero.Item(detectWeb(data));
	var pubTitle = ZU.trim(ZU.xpathText(data, './/div[@class="line1"]/span[@class="pub"]'));
	var libString = ZU.xpathText(data, './/div[@class="line2"]');

	ref.libraryCatalog = libString.slice(libString.indexOf("SIRS"));
	ref.title = ZU.trim(ZU.xpathText(data, './/div[@class="line1"]/a'));			
	ref.url = ZU.xpathText(data, './/div[@class="line1"]/a/@href');
	ref.creators = parseAuthors(ZU.xpathText(data, './/div[@class="line1"]/span[@class="author"]'), true);
	ref.abstractNote = ZU.trim(ZU.xpath(data, './/div[@name="article-summary"]/text()')[0].textContent);
	ref.tags = ZU.xpath(data, './/div[@name="article-summary"]/a/text()').map(function(a) {
		return ZU.trim(a.textContent);
	});
		
	var pdfUrl = ZU.xpath(data, './/a[@class="pdf"]')[0];
	if (pdfUrl && pdfUrl.href) {
		ref.attachments.push({
			url: pdfUrl.href,
			mimeType: "application/pdf",
			title: "Full Text PDF"
		});
	}
		
	ref = getPlaceIssueVol(pubTitle, ref);
		
	var line2Fields = ZU.xpathText(data, './/div[@class="line2"]').split("|").map(function(line) {
		return ZU.trim(line);
	});
		
	if (yearRE.test(line2Fields[0])) {
		ref.date = line2Fields[0];
	}
		
	if (line2Fields[1].indexOf('pg.') == 0) {
		var pages = ZU.trim(line2Fields[1]).substring(3);
		if (pages != "n.p.") {
			ref.pages = pages;
		}
	}
	
	ref.complete();
}

function getPlaceIssueVol(pubTitle, refItem) {
	if (pubTitle.length != 0) {
		var pubSplit = pubTitle.length
		var volCheck = volRE.test(pubTitle);
		var issueCheck = issueRE.test(pubTitle);
		var parenIndex = pubTitle.indexOf("(");
	
		if (volCheck) {
			var volMatch = volRE.exec(pubTitle);
			refItem.volume = volMatch[1]
			pubSplit = pubTitle.indexOf(volMatch[0]);
		}
	
		if (issueCheck) {
			var issueMatch = issueRE.exec(pubTitle);
			var issueSplit = pubTitle.indexOf(issueMatch[0]);
			refItem.issue = issueMatch[1];
			if (issueSplit < pubSplit) {
				pubSplit = issueSplit;
			}
		}
	
		if (placeRE.test(pubTitle) && !volCheck && !issueCheck) {
			var placeMatch = placeRE.exec(pubTitle);
			var placeSplit = pubTitle.indexOf(placeMatch[0]);
			refItem.place = placeMatch[1];
			if (placeSplit < pubSplit) {
				pubSplit = placeSplit;
			}
		}
	
		if (parenIndex > -1 && parenIndex < pubSplit) {
			pubSplit = parenIndex;
		}
	
		refItem.publicationTitle = (pubSplit == pubTitle.length ? pubTitle : pubTitle.slice(0, pubSplit));
	}
	
	return refItem;
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://sks.sirs.com/cgi-bin/hst-quick-search?id=SSKSAB-0-8276&type=text&detail=N&res=Y&ren=Y&gov=Y&lnk=Y&ic=&method=date&keyword=mathematics&sid=SSKSAB-0-8276&keyword=mathematics&SUBMIT.x=68&SUBMIT.y=13&auth_checked=Y",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://sks.sirs.com/cgi-bin/hst-article-display?id=SSKSAB-0-8276&artno=0000364283",
		"defer": true,
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Is Bitcoin Good for Business?",
				"creators": [
					{
						"firstName": "Gilly",
						"lastName": "Wright",
						"creatorType": "author"
					}
				],
				"date": "Jun. 2014",
				"abstractNote": "\"Dismissed as either a fad or Ponzi scheme, cryptocurrencies remain an enigma to most businesses, but by ignoring them, they may be missing a huge opportunity. Global uptake is increasing, and new avenues for exploiting this type of technology are being charted. Both banks and corporates are exploring the potential of this utterly new phenomenon. It has the possibility to completely reshape the payments industry-and has application far beyond just payments.\" (Global Finance) In this article, the author explains why Bitcoin could have a major impact as a currency.",
				"libraryCatalog": "SIRS Issues Researcher",
				"pages": "16",
				"publicationTitle": "Global Finance",
				"url": "http://sks.sirs.com/cgi-bin/hst-article-display?id=SSKSAB-0-8276&artno=0000364283",
				"attachments": [
					{
						"mimeType": "application/pdf",
						"title": "Full Text PDF"
					},
					{
						"title": "SIRS Knowledge Source Snapshot"
					}
				],
				"tags": [
					"Banks and banking",
					"Bitcoin",
					"Electronic money",
					"Financial executives",
					"Financial institutions",
					"Financial services industry",
					"International economic relations",
					"Payment",
					"Payment of accounts"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://sks.sirs.com/cgi-bin/hst-article-display?id=SSKSAB-0-8276&artno=0000353069",
		"defer": true,
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "'Fool's Errand': Why China Censors Rubber Duckies on Tiananmen Anniversary",
				"creators": [
					{
						"firstName": "Max",
						"lastName": "Fisher",
						"creatorType": "author"
					}
				],
				"date": "05 Jun. 2013",
				"abstractNote": "\"This year [2013], the censorship around Tiananmen's anniversary is reaching new heights. The Wall Street Journal's Josh Chin reports that Chinese social media sites are not just blocking Tiananmen-related search terms but even oblique, tertiary references.\" (Washington Post) This article discusses the lengths to which Chinese censors are going to block all Internet searches relating to the Tiananmen Square massacre.",
				"libraryCatalog": "SIRS Issues Researcher",
				"place": "Washington, DC",
				"publicationTitle": "Washington Post",
				"shortTitle": "'Fool's Errand'",
				"url": "http://sks.sirs.com/cgi-bin/hst-article-display?id=SSKSAB-0-8276&artno=0000353069",
				"attachments": [
					{
						"title": "SIRS Knowledge Source Snapshot"
					}
				],
				"tags": [
					"Censorship",
					"Censorship, China",
					"Censorship, Global impact",
					"China, History, Tiananmen Square Incident (1989)",
					"China, Officials and employees",
					"China, Politics and government",
					"Civil rights movements, China",
					"Communist Party (China)",
					"Democracy, China",
					"Internet filtering software",
					"Internet searching",
					"Internet, Censorship",
					"Internet, China",
					"Internet, Monitoring",
					"Massacres, China",
					"Protests, demonstrations, etc., China"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://sks.sirs.com/cgi-bin/hst-article-display?id=SSKSAB-0-8276&artno=0000367784",
		"defer": true,
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "How Buying Drugs Online Became Safe, Easy, and Boring",
				"creators": [
					{
						"firstName": "Brian",
						"lastName": "Doherty",
						"creatorType": "author"
					}
				],
				"date": "Dec. 2014",
				"abstractNote": "\"From January 2011 to the beginning of October 2013, the FBI estimates, Silk Road facilitated 1.2 million drug deals, moving thousands of kilos of illegal substances and collecting nearly $80 million in commissions. Clients were 'typically professionals in the 30- to 40-year-old range' who 'want to be treated with respect,' one Silk Road dealer named 'Nod' told The Daily Dot in January [2014]. The site provided a safe haven not just from the state-sponsored violence of being arrested but from the street hassle of transacting with physical-world drug dealers.\" (Reason) In this editorial, the author argues that while Silk Road has lost popularity, selling illegal substances online is still a problem.",
				"issue": "7",
				"libraryCatalog": "SIRS Issues Researcher",
				"pages": "50",
				"publicationTitle": "Reason",
				"url": "http://sks.sirs.com/cgi-bin/hst-article-display?id=SSKSAB-0-8276&artno=0000367784",
				"volume": "46",
				"attachments": [
					{
						"mimeType": "application/pdf",
						"title": "Full Text PDF"
					},
					{
						"title": "SIRS Knowledge Source Snapshot"
					}
				],
				"tags": [
					"Black market",
					"Drug dealers",
					"Drug traffic",
					"Drug traffic, Law and legislation",
					"Electronic commerce",
					"Electronic money",
					"Indictments",
					"Informal sector (Economics)",
					"Money laundering",
					"Money laundering investigation",
					"Money laundering, Law and legislation",
					"U.S. Federal Bureau of Investigation"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
