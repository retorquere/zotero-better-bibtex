{
	"translatorID": "dede653d-d1f8-411e-911c-44a0219bbdad",
	"label": "GPO Access e-CFR",
	"creator": "Bill McKinney, Sebastian Karcher",
	"target": "^https?://(www\\.)?ecfr\\.gov/cgi-bin/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-03 17:38:54"
}

function detectWeb(doc, url) {
	var re = new RegExp("^https?://(www\.)?ecfr\.gov/cgi-bin/(text-idx|retrieveECFR\?)");
	if (re.test(doc.location.href)) {
		return "statute";
	} else {
		return "multiple";
	}
}

function get_nextsibling(n)
  {
  var x=n.nextSibling;
  while (x.nodeType!=1)
   {
   x=x.nextSibling;
   }
  return x;
}
function scrape(doc) {

	var newItem = new Zotero.Item("statute");
	newItem.url = doc.location.href;
	newItem.code = "Electronic Code of Federal Regulations";
	newItem.language = "en-US";

	var spanTags = doc.getElementsByTagName("span");
	var title;
	if (title = ZU.xpathText(doc, '//p[@class="title"]')){
		var type1 = true;
	}
	else {
		var type2 = true;
	 	title = ZU.xpathText(doc, '//td/div/p[@class="fp"]')
	}
	 	newItem.title = "e-CFR: " + title.trim();
	 	newItem.codeNumber = title.trim();
	 
	 if (type1){
	  	newItem.section = ZU.xpathText(doc, '//p[@class="part"]/a')
	 }
	 else if (type2){
	 	newItem.section = ZU.xpathText(doc, '//h2[contains(text(), "PART ")]')
	 	newItem.history = ZU.xpathText(doc, '//p[@class="source"]');
	 	newItem.extra = ZU.xpathText(doc, '//p[@class="auth"]')
		 
	 }
	 if (newItem.section) newItem.section = ZU.capitalizeTitle(newItem.section.toLowerCase(), true);
	newItem.complete();
}

function doWeb(doc, url) {
	var items = {};
	if (detectWeb(doc, url)=="statute") {
		scrape(doc);
	} else {
		var links = doc.evaluate('//td/a[./span[contains(@style, "font-weight:bold")]]', doc, null, XPathResult.ANY_TYPE, null);
		var link;
		while (link = links.iterateNext()) {
			//Z.debug(link.textContent + ": " + link.href)
			items[link.href] = link.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);
		});
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.ecfr.gov/cgi-bin/retrieveECFR?gp=&SID=26a49dfbb6ed6cce629ec44a19c7fe94&r=PART&n=13y1.0.1.1.2",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "e-CFR: Title 13: Business Credit and Assistance",
				"creators": [],
				"code": "Electronic Code of Federal Regulations",
				"codeNumber": "Title 13: Business Credit and Assistance",
				"extra": "Authority: 5 U.S.C. 552 and App. 3, secs. 2, 4(a), 6(a), and 9(a)(1)(T); 15 U.S.C. 633, 634, 687; 31 U.S.C. 6506; 44 U.S.C. 3512; 42 U.S.C. 6307(d); 15 U.S.C. 657h; E.O. 12372 (July 14, 1982), 47 FR 30959, 3 CFR, 1982 Comp., p. 197, as amended by E.O. 12416 (April 8, 1983), 48 FR 15887, 3 CFR, 1983 Comp., p. 186.",
				"history": "Source: 61 FR 2394, Jan. 26, 1996, unless otherwise noted.",
				"language": "en-US",
				"section": "Part 101—Administration",
				"shortTitle": "e-CFR",
				"url": "https://www.ecfr.gov/cgi-bin/retrieveECFR?gp=&SID=26a49dfbb6ed6cce629ec44a19c7fe94&r=PART&n=13y1.0.1.1.2",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.ecfr.gov/cgi-bin/text-idx?c=ecfr&SID=26a49dfbb6ed6cce629ec44a19c7fe94&tpl=/ecfrbrowse/Title02/2cfr376_main_02.tpl",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "e-CFR: TITLE 2—Grants and Agreements",
				"creators": [],
				"code": "Electronic Code of Federal Regulations",
				"codeNumber": "TITLE 2—Grants and Agreements",
				"language": "en-US",
				"section": "Part 376—Nonprocurement Debarment and Suspension",
				"shortTitle": "e-CFR",
				"url": "https://www.ecfr.gov/cgi-bin/text-idx?c=ecfr&SID=26a49dfbb6ed6cce629ec44a19c7fe94&tpl=/ecfrbrowse/Title02/2cfr376_main_02.tpl",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/