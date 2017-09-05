{
	"translatorID": "3f8df484-c1b5-4653-b9d3-29f21c2d1572",
	"label": "OpenCongress",
	"creator": "Frank Bennett",
	"target": "http://www\\.opencongress\\.org/bill/[0-9]+-[hs][0-9]+/text",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "g",
	"lastUpdated": "2012-04-28 22:36:19"
}

// Trivial chan

function detectWeb (doc, url) {
	return "multiple"
};

function extractHeader (doc,regexp) {
	var ret = [false,[]];
	var regexp = new RegExp(regexp)
	var nodes = doc.evaluate('//center/p',
		doc, null, XPathResult.ANY_TYPE, null);
	var node = nodes.iterateNext();
	while (node) {
		var m = node.textContent.match(regexp);
		if (m) {
			ret[0] = node;
			ret[1] = m;
			break;
		}
		node = nodes.iterateNext();
	}
	return ret;
}

function doWeb (doc, url) {
	var allinfo = {};
	var alltitles = [];
	// Walk the siblings of the first-encountered
	// SECTION or SEC. heading, saving
	// a pointer to that node and all of its
	// trailing nodes until the next heading or
	// the end of the document.
	var headings = doc.getElementsByTagName('h3');
	if (headings && headings.length) {
		Zotero.debug("ok");
		var billTitle = false;
		titleNode = doc.evaluate('//h1/a[contains(@href,"/bill/")]',
			doc, null, XPathResult.ANY_TYPE, null).iterateNext();
		titleNode = titleNode.nextSibling;
		if (titleNode) {
			billTitle = titleNode.textContent.replace(/^[- ]*/, "");
		}
		var congressSession = extractHeader(doc,"^ *([0-9]+).*[Ss]ession.*")[1][1];
		var congressNumber = extractHeader(doc, "^ *([0-9]+).*[Cc][Oo][Nn][Gg][Rr][Ee][Ss][Ss]")[1][1];
		var billNumberInfo = extractHeader(doc, "^ *(S|H)[^0-9]*([0-9]+) *");
		var billNumber = billNumberInfo[1][2];
		var congressChamber = billNumberInfo[1][1] === 'S' ? 'Senate' : 'House of Representatives';
		congressChamber = "U.S. Congress|"+congressChamber;
		var billDateInfo = extractHeader(doc, "^ *([a-zA-Z]+ +[0-9]{1,2}, +[0-9]{4}).*");
		var billDate = billDateInfo[1][1];
		var billAuthors = [];
		var billAuthorStr = billDateInfo[0].parentNode.parentNode.nextElementSibling.textContent;
		billAuthorLst = billAuthorStr.split(/(?:Mr|Ms|Mrs)\.* */);
		for (var i = 1, ilen = billAuthorLst.length; i < ilen; i += 1) {
			if (billAuthorLst[i]) {
				billAuthorTry = billAuthorLst[i];
				var m = billAuthorTry.match(/([ A-Z]+).*/);
				if (m) {
					billAuthors.push(m[1]);
				}
			}
		}
		// billTitle
		// billAuthors
		// billDate
		// billNumber
		// congressChamber
		// congressSession
		// congressNumber
		var node = false;
		for (var i in headings) {
			if (headings[i].textContent.match(/^(SECTION|SEC\.) /)) {
				node = headings[i]
				break;
			}
		}
		var info = {section:false, nodes: []};
		var title = false;
		while (node) {
			var m = node.textContent.match(/^ *(?:SECTION|SEC\.)  *([0-9]+)/);
			if (m) {
				if (info.nodes.length) {
					allinfo[title] = info;
				}
				title = node.textContent;
				alltitles.push(title);
				info = {section:m[1], nodes: []};
			}
			info.nodes.push(node);
			node = node.nextSibling;
		}
		if (title) {
			allinfo[title] = info;
		}
		Zotero.selectItems(alltitles, function(selectedtitles) {
			for (var i in selectedtitles) {
				var title = selectedtitles[i];
				var info = allinfo[title];
				Zotero.Utilities.processDocuments(url, function(doc) {
					var items = [];
					var item = new Zotero.Item('bill');
					item.title = billTitle;
					item.number = billNumber;
					item.extra = '{:jurisdiction:us}';
					item.extra += '{:authority:' + congressChamber + '}';
					item.extra += '{:collection-number:' + congressNumber + '}';
					for (var i = 0, ilen = billAuthors.length; i < ilen; i += 1) {
						item.extra += '{:original-author:' + billAuthors[i] + '||}';
					}
					Zotero.debug(">> billDate: (" + billDate + ")");
					item.date = billDate;
					item.volume = congressSession;
					item.section = info.section;
					item.url = url;
					var mydoc = Zotero.Utilities.composeDoc(doc, title + " [Source: OpenCongress]", info.nodes, true);
					var attachment = {
						title:"Text of provision",
						document: mydoc,
						snapshot:true
					};
					item.attachments.push(attachment);
					item.itemID = url;
					items.push(item);
					for (var i = 0, ilen = info.nodes.length; i < ilen; i += 1) {
						var txt = info.nodes[i].textContent;
						if (txt) {
							var lst = txt.split(/ *(?:USC|U\.S\.C\.|US Code|U\.S\. Code) */);
							var donesies = {};
							for (var j = 1, jlen = lst.length; j < jlen; j += 1) {
								if (lst[j - 1] && lst[j]) {
									var volumeM = lst[j - 1].match(/.*?([0-9]+)$/);
									var sectionM = lst[j].match(/^([0-9]+).*/);
								}
								if (volumeM && sectionM) {
									var thisurl = 'http://www.law.cornell.edu/uscode/text/' + volumeM[1] + '/' + sectionM[1];
									if (donesies[thisurl]) {
										continue;
									}
									var item = new Zotero.Item('statute');
									item.code = 'US Code';
									item.section = 'sec. ' + sectionM[1];
									item.extra = '{:jurisdiction:us}';
									item.extra += '{:volume:' + volumeM[1] + '}';
									item.extra += '{:issued:2012}';
									item.url = thisurl;
									item.itemID = thisurl;
									var attachment = {
										title:"Link to provision",
										type:'text/html',
										url: thisurl,
										snapshot:false
									};
									item.attachments.push(attachment);
									items.push(item);
									donesies[thisurl] = true;
								}
							}
						}
					}
					for (i = 1, ilen = items.length; i < ilen; i += 1) {
						items[0].seeAlso.push(items[i].itemID);
						items[i].seeAlso.push(items[0].itemID);
					}
					for (i = 0, ilen = items.length; i < ilen; i += 1) {
						items[i].complete();
					}
				}, function(){Zotero.done();} );
			}
		});
	} else {
		Zotero.debug("nothing");
	}
	return true
}