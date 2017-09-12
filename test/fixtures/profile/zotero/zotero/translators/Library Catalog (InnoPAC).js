{
	"translatorID": "4fd6b89b-2316-2dc4-fd87-61a97dd941e8",
	"label": "Library Catalog (InnoPAC)",
	"creator": "Simon Kornblith and Michael Berkowitz",
	"target": "(search~|/search\\?|(a|X|t|Y|w)\\?|\\?(searchtype|searchscope)|frameset&FF|record=b[0-9]+(~S[0-9])?|/search/q\\?)",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 250,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-01 16:17:52"
}

function detectWeb(doc, url) {

//***********
// URL MATCHING - translator should detect the following urls...
// First page results
// http://bearcat.baylor.edu/search~S7/?searchtype=t&searcharg=test&searchscope=7&sortdropdown=-&SORT=D&extended=0&SUBMIT=Search&searchlimits=&searchorigarg=tone+hundred+years+of+solitude
// http://bearcat.baylor.edu/search~S7?/ttest/ttest/1837%2C1838%2C2040%2CB/browse/indexsort=-
// http://innopac.cooley.edu/search~S0?/Xtest&SORT=DZ/Xtest&SORT=DZ&SUBKEY=test/1%2C960%2C960%2CB/browse
// Individual item from search
// http://bearcat.baylor.edu/search~S7?/ttest/ttest/1837%2C1838%2C2040%2CB/frameset&FF=ttestteori+english&1%2C1%2C/indexsort=-
// http://innopac.cooley.edu/search~S0?/Xtest&SORT=DZ/Xtest&SORT=DZ&SUBKEY=test/1%2C960%2C960%2CB/frameset&FF=Xtest&SORT=DZ&1%2C1%2C
// Persistent URL for item
// http://bearcat.baylor.edu/record=b1540169~S7
// http://innopac.cooley.edu/record=b507916~S0
// http://libcat.dartmouth.edu/record=b4054652~S1
// Persistent URL for item, without suffix
// http://luna.wellesley.edu/record=b2398784
// Specific search parameters
// http://library.cooley.edu/search/q?author=shakespeare&title=hamlet
//***********

// Central Michigan University fix
	var xpath = '//div[@class="bibRecordLink"]';
	var elmt = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if(elmt) {
		return "book";
	}
	
	// Regular expression to reduce false positives
	if (!url.match(/SEARCH=/) && !url.match(/searchargs?=/) && !url.match(/&FF/) && !url.match(/search~S[0-9]/) && !url.match(/\/search\/q\?/) && !url.match(/record=/)) return false;
	// First, check to see if the URL alone reveals InnoPAC, since some sites don't reveal the MARC button
	var matchRegexp = new RegExp('^https?://[^/]+/search[^/]*\\??/[^/]+/[^/]+/[^/]+\%2C[^/]+/frameset(.+)$');
	if(matchRegexp.test(doc.location.href)) {
		if (!url.match("SEARCH") && !url.match("searchtype")) {
			return "book";
		}
	}
	// Next, look for the MARC button	
	xpath = '//a[img[@src="/screens/marc_display.gif" or @src="/screens/ico_marc.gif" or\
				@src="/screens/marcdisp.gif" or starts-with(@alt, "MARC ") or\
				@src="/screens/regdisp.gif" or\
				@alt="REGULAR RECORD DISPLAY"]] |\
				//a[span/img[@src="/screens/marc_display.gif" or\
				@src="/screens/ico_marc.gif" or @src="/screens/marcdisp.gif" or\
				starts-with(@alt, "MARC ") or @src="/screens/regdisp.gif" or\
				@alt="REGULAR RECORD DISPLAY"]] |\
				//a[contains(@href, "/marc~")]';
	elmt = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if(elmt) {
		return "book";
	}
	// Also, check for links to an item display page
	var tags = ZU.xpath(doc, '//a[@href]');
	for(var i=0; i<tags.length; i++) {
		if(matchRegexp.test(tags[i].href) || tags[i].href.match(/^https?:\/\/([^/]+\/(?:search\??\/|record=?|search%7e\/)|frameset&FF=)/)) {
			return "multiple";
		}
	}
	
	return false;
}

function scrape(marc, newDoc) {
		
	var xpath = '//pre/text()';
	if (newDoc.evaluate(xpath, newDoc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var elmts = newDoc.evaluate(xpath, newDoc, null, XPathResult.ANY_TYPE, null);
		var useNodeValue = true;
	} else {
		var elmts = newDoc.evaluate('//pre', newDoc, null, XPathResult.ANY_TYPE, null);
		var useNodeValue = false;
	}
	var elmt;
	while(elmt = elmts.iterateNext()) {
		if (useNodeValue) {
			var text = elmt.nodeValue;
		} else {
			var text = elmt.textContent;
		}
		var newItem = new Zotero.Item();
		var record = new marc.record();
		
		var linee = text.split("\n");
		for (var i=0; i<linee.length; i++) {
			if(!linee[i]) {
				continue;
			}
			
			linee[i] = linee[i].replace(/[\xA0_\t]/g, " ");
			var value = linee[i].substr(7);
			
			if(linee[i].substr(0, 6) == "      ") {
				// add this onto previous value
				tagValue += value;
			} else {
				if(linee[i].substr(0, 6) == "LEADER") {
					// trap leader
					record.leader = value;
				} else {
					if(tagValue) {	// finish last tag
						tagValue = tagValue.replace(/\|(.)/g, marc.subfieldDelimiter+"$1");
						if(tagValue[0] != marc.subfieldDelimiter) {
							tagValue = marc.subfieldDelimiter+"a"+tagValue;
						}
						
						// add previous tag
						record.addField(tag, ind, tagValue);
					}
					
					var tag = linee[i].substr(0, 3);
					var ind  = linee[i].substr(4, 2);
					var tagValue = value;
				}
			}
		}
		if(tagValue) {
			tagValue = tagValue.replace(/\|(.)/g, marc.subfieldDelimiter+"$1");
			if(tagValue[0] != marc.subfieldDelimiter) {
				tagValue = marc.subfieldDelimiter+"a"+tagValue;
			}
			
			// add previous tag
			record.addField(tag, ind, tagValue);
		}
		
		record.translate(newItem);
		
		var domain = newDoc.location.href.match(/https?:\/\/([^/]+)/);
		newItem.repository = domain[1]+" Library Catalog";
		
		newItem.complete();
	}
}

function pageByPage(marc, urls) {
	Zotero.Utilities.processDocuments(urls, function(newDoc) {
		scrape(marc, newDoc);
	}, function() { Zotero.done() });
}

function doWeb(doc, url) {
	var uri = doc.location.href;
	var newUri;
	// load translator for MARC
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
	translator.getTranslatorObject(function(marc) {
		
		if (detectWeb(doc, url) == "book") {
			var matchRegexp = new RegExp('^(.*)frameset(.+)$');
			var m = matchRegexp.exec(uri);
			if (m) {
				newUri = uri.replace(/frameset/, "marc");
			} else {
				var xpath = '//a[\
						.//img[\
							@src="/screens/marc_display.gif" or\
							@src="/screens/ico_marc.gif" or\
							@src="/screens/marcdisp.gif" or\
							starts-with(@alt, "MARC ") or\
							@src="/screens/regdisp.gif" or\
							@alt="REGULAR RECORD DISPLAY"\
						]\
					]';
				newUri = ZU.xpath(doc, xpath);
				if(!newUri.length) newUri = ZU.xpath(doc, '//a[contains(@href, "/marc~")]');
				if(!newUri.length) throw new Error("MARC link not found");
				
				newUri = newUri[0].href.replace(/frameset/, "marc");
			}
			pageByPage(marc, [newUri]);
		} else {	// Search results page
			// Require link to match this
			var tagRegexp = new RegExp();
			tagRegexp.compile('^https?://[^/]+/search\\??/[^/]+/[^/]+/[0-9]+\%2C[^/]+/frameset');
			var urls = new Array();
			var availableItems = {};
			var firstURL = false;
			
			var tableRows = doc.evaluate('//table//tr[@class="browseEntry" or @class="briefCitRow" or td/input[@type="checkbox"] or td[contains(@class,"briefCitRow") or contains(@class,"briefcitCell") or contains(@class,"briefcitDetail")]]',
										 doc, null, XPathResult.ANY_TYPE, null);
			if (!tableRows.iterateNext()){
				//http://lib.ntu.edu.tw/en
				tableRows = doc.evaluate('//table[@class="briefCitRow"]', doc, null, XPathResult.ANY_TYPE, null);
			}
			// Go through table rows
			var i = 0;
			while(tableRow = tableRows.iterateNext()) {
				// get link
				var links = doc.evaluate('.//*[@class="briefcitTitle"]//a', tableRow, null, XPathResult.ANY_TYPE, null);
				var link = links.iterateNext();
				if(!link) {
			
					var links = doc.evaluate(".//a[@href]", tableRow, null, XPathResult.ANY_TYPE, null);
					link = links.iterateNext();
				}
				
				if(link) {
					if(availableItems[link.href]) {
						continue;
					}
					
					// Go through links
					while(link) {
						if (link.textContent.trim()) availableItems[link.href] = link.textContent;
						link = links.iterateNext();
					}
					i++;
				}
			};

			
			Zotero.selectItems(availableItems, function (items) {
				if (!items) {
					return true;
				}
				var newUrls = new Array();
				for (var i in items) {
					newUrls.push(i.replace("frameset", "marc"));
				}
				pageByPage(marc, newUrls);
			});
		}
	});
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://utmost.cl.utoledo.edu/search/?searchtype=X&SORT=D&searcharg=history+of+communication&searchscope=3",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://umiss.lib.olemiss.edu/search/?searchtype=X&SORT=D&searcharg=history+of+communication",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://luna.wellesley.edu/search/?searchtype=X&SORT=D&searcharg=history+of+ideas&searchscope=1",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://clues.concordia.ca/search/?searchtype=X&SORT=D&searcharg=history+of+communication",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://libcat.dartmouth.edu/record=b4054652~S1",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "John",
						"lastName": "Gray",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "The death of utopia -- Enlightenment and terror in the twentieth century -- Utopia enters the mainstream -- The Americanization of the apocalypse -- Armed missionaries --Post-apocalypse"
					}
				],
				"tags": [
					"Religion and politics",
					"Utopias",
					"Revolutions",
					"Religious aspects",
					"Conservatism",
					"Religious aspects",
					"World politics",
					"20th century",
					"World politics",
					"21st century"
				],
				"seeAlso": [],
				"attachments": [],
				"ISBN": "9780374105983",
				"title": "Black mass: apocalyptic religion and the death of utopia",
				"edition": "1st American ed",
				"place": "New York",
				"publisher": "Farrar Straus and Giroux",
				"date": "2007",
				"numPages": "242",
				"callNumber": "BL65.P7 G69 2007",
				"libraryCatalog": "libcat.dartmouth.edu Library Catalog",
				"shortTitle": "Black mass"
			}
		]
	},
	{
		"type": "web",
		"url": "http://tulips.ntu.edu.tw/search/c?searchtype=Y&searcharg=test&searchscope=5",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://las.sinica.edu.tw:1085/search~S0*eng/?searchtype=a&searcharg=%E9%BB%83%E5%8B%97%E5%90%BE&sortdropdown=-&SORT=D&extended=0&SUBMIT=Search&searchlimits=&searchorigarg=aborges",
		"items": "multiple"
	}
]
/** END TEST CASES **/