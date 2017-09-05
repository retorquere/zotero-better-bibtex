{
	"translatorID": "982e0329-01e6-4486-a1ba-ed18582192fa",
	"translatorType": 4,
	"label": "WestLaw Japan",
	"creator": "Frank Bennett",
	"target": "https://(?:go\\.westlawjapan\\.com|go-westlawjapan-com\\..*)/wljp/app/doc",
	"minVersion": "1.0.1b1.r1",
	"maxVersion": "",
	"priority": 1,
	"inRepository": true,
	"browserSupport": "g",
	"lastUpdated": "2013-01-07 03:53:17"
}

/*global Zotero: true */

var volReporterPageRe = new RegExp("^([0-9]+)(.*)([0-9]+)$");
var reporterPlusRe = new RegExp("^(?:([^・]+)・)*(.*?) (?:([0-9]+)巻)*(?:([0-9]+)号)*(?:([0-9]+)頁)$");
var bogusItemID = 1;

// XXXX Page variable should be set from current page.
var menuUrlTemplate = "%%SITE_URL%%/wljp/app/search/result?rs=WLJP.1.0&vr=1.0&srguid=%%SRGUID%%&page=0&currdocguid=%%CURRDOCGUID%%&articleguid=&display=Doc Display&xmlout=false&countByColl=true";

var documentUrlTemplate = "%%SITE_URL%%/wljp/app/doc?rs=WLJP.1.0&vr=1.0&src=rl&srguid=%%SRGUID%%&docguid=%%DOCGUID%%&spos=1&epos=0&page=0";

zenkakuNumMap = {
    "０","0",
    "１","1",
    "２","2",
    "３","3",
    "４","4",
    "５","5",
    "６","6",
    "７","7",
    "８","8",
    "９","9"
}

imperialEraMap = {
    "明":"明治",
    "大":"大正",
    "昭":"昭和",
    "平":"平成"
}

var getCookies = function(doc) {
	var ret = {};
	if (doc.cookie) {
		var lst = doc.cookie.split(/; */);
		for (var i = 0, ilen = lst.length; i < ilen; i += 1) {
			var pair = lst[i].split('=');
			if ("object" === typeof pair && pair.length) {
				if (pair[0] === "docguids") {
					if (pair[1] === 'none') {
						continue;
					} else {
						if (pair[1].slice(-1) === '|') {
							pair[1] = pair[1].slice(0, -1);
						}
					}
					pair[1] = pair[1].split('|');
				}
			} else {
				continue;
			}
			ret[pair[0]] = pair[1];
		}
	}
	return ret;
};


var getPreSelected = function (doc, cookies) {
	var ret = [];
	var site_url = doc.location.href.replace(/\/wljp\/.*/, "");
	var mytemplate = documentUrlTemplate.replace("%%SRGUID%%", cookies.srguid);
	mytemplate = mytemplate.replace("%%SITE_URL%%", site_url);
	if (cookies.docguids) {
		for (var i = 0, ilen = cookies.docguids.length; i < ilen; i += 1) {
			var myurl = mytemplate.replace("%%DOCGUID%%", cookies.docguids[i]);
			ret.push(myurl);
		}
	}
	return ret;
};


var makeMenuURL = function (doc, cookies) {
    var myurl = menuUrlTemplate.replace("%%SRGUID%%", cookies.srguid);
	myurl = myurl.replace("%%CURRDOCGUID%%", cookies.currentdocguid);
    mysite = doc.location.href.replace(/\/wljp\/.*/, "");
	myurl = myurl.replace("%%SITE_URL%%", mysite);
	return myurl;
};


var parseCite = function (item, txt) {
   	var m;
	if (volReporterPageRe.test(txt)) {
		m = volReporterPageRe.exec(txt);
		if (m[1]) {
			item.volume = m[1];
		}
		if (m[2]) {
			item.reporter = m[2];
		}
		if (m[3]) {
			item.firstPage = m[3];
		}
	} else if (reporterPlusRe.test(txt)) {
		m = reporterPlusRe.exec(txt);
		var strayJournalFrag = "";
		if (m[1]) {
			if (m[1].slice(-2) === "ロー") {
				strayJournalFrag = m[1] + " ";
			} else {
				// Might try to split here. Would need to convert to Unicode and back.
				item.creators.push({lastName:m[1], creatorType:"author"});
			}
		}
		if (m[2]) {
			item.reporter = strayJournalFrag + m[2];
		}
		if (m[3]) {
			item.volume = m[3];
		}
		if (m[4]) {
			item.extra = "{:issue:" + m[4] + "}";
		}
		if (m[5]) {
			item.firstPage = m[5];
		}
	}
};

var getItemsFromNode = function (doc, items, id) {
	var divs, anchors, anchor, item, txt, m, node, i, ilen;
	node = doc.getElementById(id);
	if (node) {
		divs = node.getElementsByTagName("div");
		for (i = 0, ilen = divs.length; i < ilen; i += 1) {
			item = new Zotero.Item();
			anchors = divs[i].getElementsByTagName("a");
			if (anchors.length) {
				anchor = anchors.item(0);
				txt = Zotero.Utilities.getTextContent(anchor);
				// TODO: fetch the page, extract the text and build attachment
				parseCite(item, txt);
			} else {
				txt = Zotero.Utilities.getTextContent(divs[i]);
				parseCite(item, txt);
			}
			if (item.reporter) {
				item.itemType = "case";
				items.push(item);
			}
		}
	}
};


var buildAttachment = function (item, doc, id, casename, title) {
	var node = doc.getElementById(id);
	if (node) {
		node.removeAttribute('style');
		// Suppress URL, since WestLaw Japan uses one-time URLs that
		// are useless after session close.
		var mydoc = Zotero.Utilities.composeDoc(doc, casename + "（" + title + "） [Source: WestLaw Japan]", node, true);
		var attachment = {
			title:title,
			document: mydoc,
			snapshot:true
		};
		item.attachments.push(attachment);
	}
};

var pageCallback = function (doc) {
	var key, i, ilen, j, jlen, k, klen;
    var casehead;
    casehead = doc.getElementById('anchor-case-head');
    if (!casehead) {
        // Be ill-mannered about broken DOM returns
        var mycount = 0;
        while (!casehead && mycount < 20) {
            doc = Zotero.Utilities.retrieveDocument(doc.location.href);
            casehead = doc.getElementById('anchor-case-head');
            mycount += 1;
        }
        // Zotero.debug("  casehead="+casehead);
    }
	var divs = casehead.getElementsByTagName('div');

	// Identify related items for saving first, so we know what
	// relations need to be set.
	var items = [];
	getItemsFromNode(doc, items, "related-info-case-flash-commentary");
	getItemsFromNode(doc, items, "related-info-case-byline-commentary");

	// Gather values from node
	key = false;
	var keyvals = {};
	for (i = 0, ilen = divs.length; i < ilen; i += 1) {
		var casenodes = divs[i].childNodes;
		for (j = 0, jlen = casenodes.length; j < jlen; j += 1) {
			
			if (!casenodes[j].textContent.replace(/\s*/, "")) {
				continue;
			}
			if (casenodes[j].nodeName === "SPAN" && casenodes[j].getAttribute('class') === 'textnowrap') {
				var subspans = casenodes[j].childNodes;
				for (k = 0, klen = subspans.length; k < klen; k += 1) {
					if (subspans[k].nodeName === "SPAN") {
						key = subspans[k].textContent;
					} else if (key) {
						keyvals[key] = subspans[k].textContent.replace("　", "");
						key = false;
					}
				}
				continue;
			}
			if (casenodes[j].nodeName === "SPAN") {
				key = casenodes[j].textContent;
			} else if (key) {
				keyvals[key] = casenodes[j].textContent.replace("　", "");
				key = false;
			}
		}
		
	}

	// Write values to carrier item.
	var item = new Zotero.Item();
	item.itemType = "case";
	var extras = [];
	var rawdate = "";
	for (key in keyvals) {
		if (keyvals.hasOwnProperty(key)) {
			switch (key) {
			case "裁判年月日":
				item.dateDecided = Zotero.Utilities.parseDateToString(keyvals[key]);
				var rawdate = keyvals[key];
				break;
			case "裁判所名":
				item.court = keyvals[key];
				break;
			case "事件番号":
				item.docketNumber = keyvals[key];
				break;
			case "事件名":
				item.shortTitle = keyvals[key];
				break;
			default:
				extras.push("[" + key +"：" + keyvals[key] + "]");
				break;
			}
		}
	}
	if (extras.length) {
		item.extra = extras.join(" ");
	}


	// Build attachments from page content
	var casename = item.docketNumber;
	if (!casename && item.court) {
		casename = item.court + "、" + rawdate;
	}
	buildAttachment(item, doc, 'related-info-case-abstract', casename, "要旨");
	buildAttachment(item, doc, 'related-info-case-case-history', casename, "裁判経過");
	buildAttachment(item, doc, 'related-info-case-full-text', casename, "本文");

    // Split docket number into its elements
    var dn = item.docketNumber;
    if (dn) {
        var m = dn.match(/(明治*|大正*|昭和*|平成*)([０１２３４５６７８９]+)（([^）]+)）([０１２３４５６７８９]+)/);
        if (m) {
            item.callNumber = m[3];
            item.filingDate = "";
            for (var i=0,ilen=m[2].length;i<ilen;i+=1) {
                item.filingDate = item.filingDate + zenkakuNumMap[m[2][i]];
            }
            if (imperialEraMap[m[1]]) {
                item.reign = imperialEraMap[m[1]];
            } else {
                item.reign = m[1];
            }
            item.docketNumber = "";
            for (var i=0,ilen=m[4].length;i<ilen;i+=1) {
                item.docketNumber = item.docketNumber + zenkakuNumMap[m[4][i]];
            }
        }
    }

	// Copy basic citation details across to reporter items
	for (i = 0, ilen = 4; i < ilen; i += 1) {
		var v = ["dateDecided", "court", "docketNumber", "shortTitle", "filingDate", "reign", "callNumber"][i];
		for (j = 0, jlen = items.length; j < jlen; j += 1) {
			items[j][v] = item[v];
		}
	}

	// Add item to list, and set one-to-all seeAlso throughout
	for (i = 0, ilen = items.length; i < ilen; i += 1) {
		if (item.extra && items[i].extra) {
			items[i].extra = items[i].extra + " " + item.extra;
		}
	}
	items.push(item);
	for (i = 0, ilen = items.length; i < ilen; i += 1) {
		items[i].itemID = "" + bogusItemID;
		bogusItemID += 1;
	}
	for (i = 0, ilen = items.length; i < ilen; i += 1) {
		for (j = 0, jlen = items.length; j < jlen; j += 1) {
			if (j === i) {
				continue;
			}
			items[i].seeAlso.push(items[j].itemID);
		}
	}

	// Save the world
	for (i = 0, ilen = items.length; i < ilen; i += 1) {
		items[i].complete();
	}
};


function selectCallback (doc) {
	var availableItems = {};
	var anchors = doc.getElementsByClassName('hit');
	for (var i = 0, ilen = anchors.length; i < ilen; i += 1) {
		var anchor = anchors.item(i);
		var href = anchor.getAttribute("href");
		var txt = Zotero.Utilities.getTextContent(anchor);
		availableItems["https://go.westlawjapan.com" + href] = txt;
	}
	var items = Zotero.selectItems(availableItems);
	var urls = [];
	for (var key in items) {
		if (items.hasOwnProperty(key)) {
			urls.push(key);
		}
	}
	Zotero.Utilities.processDocuments(urls, pageCallback, Zotero.done );
}


function detectWeb(doc, url) {
	// Always multiple on this site.
	return "multiple";
}


function doWeb(doc, url) {
	// Present selection box only if no pre-selected items in page.
	var cookies = getCookies(doc);
	var urls = getPreSelected(doc, cookies);
	if (urls.length) {
		Zotero.Utilities.processDocuments(urls, pageCallback, Zotero.done);
	} else {
		var menuURL = makeMenuURL(doc, cookies);
		Zotero.Utilities.processDocuments([menuURL], selectCallback, function () {} );
	}
	Zotero.wait();
}