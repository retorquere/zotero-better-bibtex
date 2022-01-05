{
	"translatorID": "6773a9af-5375-3224-d148-d32793884dec",
	"label": "InfoTrac",
	"creator": "Simon Kornblith",
	"target": "^https?://[^/]+/itw/infomark/",
	"minVersion": "1.0.0b3.r1",
	"maxVersion": "",
	"priority": 250,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "g",
	"lastUpdated": "2015-06-10 10:51:29"
}

function detectWeb(doc, url) {
	
	// ensure that there is an InfoTrac logo
	if (!doc.evaluate('//img[substring(@alt, 1, 8) = "InfoTrac"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) return false;
	
	if (doc.title.substring(0, 8) == "Article ") {
		if (ZU.xpathText(doc, '//td//img[contains(@src, "ncnp_logo.gif")]/@title')) return "newspaperArticle";
		var genre = doc.evaluate('//comment()[substring(., 1, 6) = " Genre"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
		
		if (genre) {
			var value = Zotero.Utilities.trimInternal(genre.nodeValue.substr(7));
			if (value == "article") {
				return "journalArticle";
			} else if (value == "book") {
				return "book";
			} else if (value == "dissertation") {
				return "thesis";
			} else if (value == "bookitem") {
				return "bookSection";
			}
		}
		
		return "magazineArticle";
	} else if (doc.title.substring(0, 10) == "Citations ") {
		return "multiple";
	}
}

function scrape(doc, url){
	var newItem = new Zotero.Item();
	var xpath = '/html/body//comment()';
	var elmts = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
	var citation = ZU.xpath(doc, '//p/table/tbody//td/table/tbody[not(./script)]');
	newItem.title = ZU.xpathText(citation, './/font/b');
	newItem.itemType = "newspaperArticle";
	var author = ZU.xpathText(citation, './/td/i');
	if (author) newItem.creators.push(ZU.cleanAuthor(author, "author`"));
	var date = ZU.xpathText(citation, './/td/text()');
	if (date) date = date.match(/[A-Z][a-z]+\s\d+,\s\d{4}/);
	if (date) newItem.date = date[0];
	var pdfurl = ZU.xpathText(doc, '//blockquote/a[contains(@href, "!pdf")][1]/@href');
	if  (pdfurl){
		newItem.attachments.push({url: pdfurl, title: "Infotrac Full Text PDF", mimeType: "application/pdf"})
	}
	newItem.attachments.push({document: doc, title: "Infotrac Snapshot", mimeType: "text/html"});
	while (elmt = elmts.iterateNext()) {
		var colon = elmt.nodeValue.indexOf(":");
		var field = elmt.nodeValue.substring(1, colon).toLowerCase();
		var value = elmt.nodeValue.substring(colon+1, elmt.nodeValue.length-1);
		if (field == "journal") {
			newItem.publicationTitle = value;
		}
	}
	if (newItem.publicationTitle.search(/\(.+\)/)){
		newItem.place = newItem.publicationTitle.match(/\((.+)\)/)[1];
		newItem.publicationTitle = newItem.publicationTitle.replace(/\(.+\).*/, "");
	}
	newItem.complete();
}

function extractCitation(url, elmts, title, doc) {
	var newItem = new Zotero.Item();
	newItem.url = url;
	if (title) {
		newItem.title = Zotero.Utilities.superCleanString(title);
	}
	newItem.title = ZU.xpathText(citation, './/font/b');
	newItem.itemType = "newspaperArticle";
	var date = ZU.xpathText(citation, './/td/text()');
	if (date) date = date.match(/[A-Z][a-z]+\s\d+,\s\d{4}/);
	if (date) newItem.date = date[0];

	while (elmt = elmts.iterateNext()) {
		var colon = elmt.nodeValue.indexOf(":");
		var field = elmt.nodeValue.substring(1, colon).toLowerCase();
		var value = elmt.nodeValue.substring(colon+1, elmt.nodeValue.length-1);
		if (field == "title") {
			newItem.title = Zotero.Utilities.superCleanString(value);
		} else if (field == "journal") {
			newItem.publicationTitle = value;
		} else if (field == "pi") {
			parts = value.split(" ");
			var date = "";
			var field = null;
			for (j in parts) {
				firstChar = parts[j].substring(0, 1);
				
				if (firstChar == "v") {
					newItem.itemType = "journalArticle";
					field = "volume";
				} else if (firstChar == "i") {
					field = "issue";
				} else if (firstChar == "p") {
					field = "pages";
					
					var pagesRegexp = /p(\w+)\((\w+)\)/;	// weird looking page range
					var match = pagesRegexp.exec(parts[j]);
					if (match) {			// yup, it's weird
						var finalPage = parseInt(match[1])+parseInt(match[2])
						parts[j] = "p"+match[1]+"-"+finalPage.toString();
					} else if (!newItem.itemType) {	// no, it's normal
						// check to see if it's numeric, bc newspaper pages aren't
						var justPageNumber = parts[j].substr(1);
						if (parseInt(justPageNumber).toString() != justPageNumber) {
							newItem.itemType = "newspaperArticle";
						}
					}
				} else if (!field) {	// date parts at the beginning, before
									// anything else
					date += " "+parts[j];
				}
				
				if (field) {
					isDate = false;
					
					if (parts[j] != "pNA") {		// make sure it's not an invalid
												// page number
						// chop of letter
						newItem[field] = parts[j].substring(1);
					} else if (!newItem.itemType) {		// only newspapers are missing
														// page numbers on infotrac
						newItem.itemType = "newspaperArticle";
					}
				}
			}
			
			// Set type
			if (!newItem.itemType) {
				newItem.itemType = "magazineArticle";
			}
			
			if (date != "") {
				newItem.date = date.substring(1);
			}
		} else if (field == "author") {
			var author = Zotero.Utilities.cleanAuthor(value, "author", true);
			
			// ensure author is not already there
			var add = true;
			for (var i=0; i<newItem.creators.length; i++) {
				var existingAuthor = newItem.creators[i];
				if (existingAuthor.firstName == author.firstName && existingAuthor.lastName == author.lastName) {
					add = false;
					break;
				}
			}
			if (add) newItem.creators.push(author);
		} else if (field == "issue") {
			newItem.issue = value;
		} else if (field == "volume") {
			newItem.volume = value;
		} else if (field == "issn") {
			newItem.ISSN = value;
		} else if (field == "gjd") {
			var m = value.match(/\(([0-9]{4}[^\)]*)\)(?:, pp\. ([0-9\-]+))?/);
			if (m) {
				newItem.date = m[1];
				newItem.pages = m[2];
			}
		} else if (field == "BookTitle") {
			newItem.publicationTitle = value;
		} else if (field == "genre") {
			value = value.toLowerCase();
			if (value == "article") {
				newItem.itemType = "journalArticle";
			} else if (value == "book") {
				newItem.itemType = "book";
			} else if (value == "dissertation") {
				newItem.itemType = "thesis";
			} else if (value == "bookitem") {
				newItem.itemType = "bookSection";
			}
		}
	}
	
	if (doc) {
		newItem.attachments.push({document:doc, title:"InfoTrac Snapshot"});
	} else {
		newItem.attachments.push({url:url, title:"InfoTrac Snapshot",
								 mimeType:"text/html"});
	}
	
	newItem.complete();
}

function doWeb(doc, url) {	
	var ncnp;
	if (ZU.xpathText(doc, '//td//img[contains(@src, "ncnp_logo.gif")]/@title')) ncnp = true;
	/*the only Infotrac Site that's still up & I'm aware of is 19th Century Newspapers. 
	But there may well be others, so I'm leaving a lot of legacy code in just in case */

	var uri = doc.location.href;
	if (doc.title.substring(0, 8) == "Article ") {	// article
		if (ncnp) scrape(doc, url);
		else {
			var xpath = '/html/body//comment()';
			var elmts = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
			extractCitation(uri, elmts);
		}
	} else {										// search results
		var items = new Object();
		var uris = new Array();
		var elmts = new Array();
		
		var host = doc.location.href.match(/^https?:\/\/[^\/]+/)[0];
		var baseurl = doc.location.href.match(/(.+)\/purl=/);
		var institution = url.match(/\?sw_aep=.+/)[0];
		var tableRows = doc.evaluate('/html/body//table/tbody/tr/td[b or strong]', doc, null,
									 XPathResult.ANY_TYPE, null);
		var tableRow;
		var javaScriptRe = /'([^']*)' *, *'([^']*)'/
		var i = 0;
		// Go through table rows
		if (ncnp){
			while (tableRow = tableRows.iterateNext()) {
				var title = ZU.trimInternal(ZU.xpathText(tableRow, './strong'));
				var link = ZU.xpathText(tableRow, './a[1]/@href');
				link = link.match(/\(\'(\/.+)\',\'/)[1];
				link = baseurl[1] + link + institution;
				//Z.debug(link)
				items[link] = title;
			}
			Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {

				uris.push(i);
			}
			Zotero.Utilities.processDocuments(uris, scrape)
		});
		}
		else {
			while (tableRow = tableRows.iterateNext()) {
				var link = doc.evaluate('./a', tableRow, null, XPathResult.ANY_TYPE, null).iterateNext();
				var m = javaScriptRe.exec(link.href);
				if (m) {
					uris[i] = host+"/itw/infomark/192/215/90714844w6"+m[1]+"?sw_aep=olr_wad"+m[2];
				}
				var article = doc.evaluate('./b/text()|./strong/text', link, null, XPathResult.ANY_TYPE, null).iterateNext();
				items[i] = article.nodeValue;
				// Chop off final period
				if (items[i].substr(items[i].length-1) == ".") {
					items[i] = items[i].substr(0, items[i].length-1);
				}
				elmts[i] = doc.evaluate(".//comment()", tableRow, null, XPathResult.ANY_TYPE, null);
				citation[i] = ZU.xpath(tableRow, '//')
				i++;
			}
			
			items = Zotero.selectItems(items);
			
			if (!items) {
				return true;
			}
			
			for (var i in items) {
				extractCitation(uris[i], elmts[i], items[i]);
			}
		}	
	}
}