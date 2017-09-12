{
	"translatorID": "88268d51-dc41-4f98-bb93-d13af50ba1ab",
	"label": "In These Times",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www\\.)?inthesetimes\\.com",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2016-11-01 17:45:07"
}

/*********************** BEGIN FRAMEWORK ***********************/
/**
    Copyright (c) 2010-2013, Erik Hetzner

    This program is free software: you can redistribute it and/or
    modify it under the terms of the GNU Affero General Public License
    as published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
    Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public
    License along with this program.  If not, see
    <http://www.gnu.org/licenses/>.
*/

/**
 * Flatten a nested array; e.g., [[1], [2,3]] -> [1,2,3]
 */
function flatten(a) {
    var retval = new Array();
    for (var i in a) {
        var entry = a[i];
        if (entry instanceof Array) {
            retval = retval.concat(flatten(entry));
        } else {
            retval.push(entry);
        }
    }
    return retval;
}

var FW = {
    _scrapers : new Array()
};

FW._Base = function () {
    this.callHook = function (hookName, item, doc, url) {
        if (typeof this['hooks'] === 'object') {
            var hook = this['hooks'][hookName];
            if (typeof hook === 'function') {
                hook(item, doc, url);
            }
        }
    };

    this.evaluateThing = function(val, doc, url) {
        var valtype = typeof val;
        if (valtype === 'object') {
            if (val instanceof Array) {
                /* map over each array val */
                /* this.evaluate gets out of scope */
                var parentEval = this.evaluateThing;
                var retval = val.map ( function(i) { return parentEval (i, doc, url); } );
                return flatten(retval);
            } else {
                return val.evaluate(doc, url);
            }
        } else if (valtype === 'function') {
            return val(doc, url);
        } else {
            return val;
        }
    };

    /*
     * makeItems is the function that does the work of making an item.
     * doc: the doc tree for the item
     * url: the url for the item
     * attachments ...
     * eachItem: a function to be called for each item made, with the arguments (doc, url, ...)
     * ret: the function to call when you are done, with no args
     */
    this.makeItems = function (doc, url, attachments, eachItem, ret) {
        ret();
    }

};

FW.Scraper = function (init) { 
    FW._scrapers.push(new FW._Scraper(init));
};

FW._Scraper = function (init) {
    for (x in init) {
        this[x] = init[x];
    }

    this._singleFieldNames = [
        "abstractNote",
        "applicationNumber",
        "archive",
        "archiveLocation",
        "artworkMedium",
        "artworkSize",
        "assignee",
        "audioFileType",
        "audioRecordingType",
        "billNumber",
        "blogTitle",
        "bookTitle",
        "callNumber",
        "caseName",
        "code",
        "codeNumber",
        "codePages",
        "codeVolume",
        "committee",
        "company",
        "conferenceName",
        "country",
        "court",
        "date",
        "dateDecided",
        "dateEnacted",
        "dictionaryTitle",
        "distributor",
        "docketNumber",
        "documentNumber",
        "DOI",
        "edition",
        "encyclopediaTitle",
        "episodeNumber",
        "extra",
        "filingDate",
        "firstPage",
        "forumTitle",
        "genre",
        "history",
        "institution",
        "interviewMedium",
        "ISBN",
        "ISSN",
        "issue",
        "issueDate",
        "issuingAuthority",
        "journalAbbreviation",
        "label",
        "language",
        "legalStatus",
        "legislativeBody",
        "letterType",
        "libraryCatalog",
        "manuscriptType",
        "mapType",
        "medium",
        "meetingName",
        "nameOfAct",
        "network",
        "number",
        "numberOfVolumes",
        "numPages",
        "pages",
        "patentNumber",
        "place",
        "postType",
        "presentationType",
        "priorityNumbers",
        "proceedingsTitle",
        "programTitle",
        "programmingLanguage",
        "publicLawNumber",
        "publicationTitle",
        "publisher",
        "references",
        "reportNumber",
        "reportType",
        "reporter",
        "reporterVolume",
        "rights",
        "runningTime",
        "scale",
        "section",
        "series",
        "seriesNumber",
        "seriesText",
        "seriesTitle",
        "session",
        "shortTitle",
        "studio",
        "subject",
        "system",
        "thesisType",
        "title",
        "type",
        "university",
        "url",
        "version",
        "videoRecordingType",
        "volume",
        "websiteTitle",
        "websiteType" ];
    
    this._makeAttachments = function(doc, url, config, item) {
        if (config instanceof Array) {
            config.forEach(function (child) { this._makeAttachments(doc, url, child, item); }, this);
        } else if (typeof config === 'object') {
            /* plural or singual */
            var urlsFilter = config["urls"] || config["url"];
            var typesFilter = config["types"] || config["type"];
            var titlesFilter = config["titles"] || config["title"];
            var snapshotsFilter = config["snapshots"] || config["snapshot"];

            var attachUrls = this.evaluateThing(urlsFilter, doc, url);
            var attachTitles = this.evaluateThing(titlesFilter, doc, url);
            var attachTypes = this.evaluateThing(typesFilter, doc, url);
            var attachSnapshots = this.evaluateThing(snapshotsFilter, doc, url);

            if (!(attachUrls instanceof Array)) {
                attachUrls = [attachUrls];
            }
            for (var k in attachUrls) {
                var attachUrl = attachUrls[k];
                var attachType;
                var attachTitle;
                var attachSnapshot;
                if (attachTypes instanceof Array) { attachType = attachTypes[k]; }
                else { attachType = attachTypes; }

                if (attachTitles instanceof Array) { attachTitle = attachTitles[k]; }
                else { attachTitle = attachTitles; }

                if (attachSnapshots instanceof Array) { attachSnapshot = attachSnapshots[k]; }
                else { attachSnapshot = attachSnapshots; }

                item["attachments"].push({ url      : attachUrl,
                                           title    : attachTitle,
                                           mimeType : attachType,
                                           snapshot : attachSnapshot });
            }
        }
    };

    this.makeItems = function (doc, url, ignore, eachItem, ret) {
        var item = new Zotero.Item(this.itemType);
        item.url = url;
        for (var i in this._singleFieldNames) {
            var field = this._singleFieldNames[i];
            if (this[field]) {
                var fieldVal = this.evaluateThing(this[field], doc, url);
                if (fieldVal instanceof Array) {
                    item[field] = fieldVal[0];
                } else {
                    item[field] = fieldVal;
                }
            }
        }
        var multiFields = ["creators", "tags"];
        for (var j in multiFields) {
            var key = multiFields[j];
            var val = this.evaluateThing(this[key], doc, url);
            if (val) {
                for (var k in val) {
                    item[key].push(val[k]);
                }
            }
        }
        this._makeAttachments(doc, url, this["attachments"], item);
        eachItem(item, this, doc, url);
        ret();
    };
};

FW._Scraper.prototype = new FW._Base;

FW.MultiScraper = function (init) { 
    FW._scrapers.push(new FW._MultiScraper(init));
};

FW._MultiScraper = function (init) {
    for (x in init) {
        this[x] = init[x];
    }

    this._mkSelectItems = function(titles, urls) {
        var items = new Object;
        for (var i in titles) {
            items[urls[i]] = titles[i];
        }
        return items;
    };

    this._selectItems = function(titles, urls, callback) {
        var items = new Array();
	Zotero.selectItems(this._mkSelectItems(titles, urls), function (chosen) {
	    for (var j in chosen) {
		items.push(j);
	    }
	    callback(items);
	});
    };

    this._mkAttachments = function(doc, url, urls) {
        var attachmentsArray = this.evaluateThing(this['attachments'], doc, url);
        var attachmentsDict = new Object();
        if (attachmentsArray) {
            for (var i in urls) {
                attachmentsDict[urls[i]] = attachmentsArray[i];
            }
        }
        return attachmentsDict;
    };

    /* This logic is very similar to that used by _makeAttachments in
     * a normal scraper, but abstracting it out would not achieve much
     * and would complicate it. */
    this._makeChoices = function(config, doc, url, choiceTitles, choiceUrls) {
        if (config instanceof Array) {
            config.forEach(function (child) { this._makeTitlesUrls(child, doc, url, choiceTitles, choiceUrls); }, this);
        } else if (typeof config === 'object') {
            /* plural or singual */
            var urlsFilter = config["urls"] || config["url"];
            var titlesFilter = config["titles"] || config["title"];

            var urls = this.evaluateThing(urlsFilter, doc, url);
            var titles = this.evaluateThing(titlesFilter, doc, url);

            var titlesIsArray = (titles instanceof Array);
            if (!(urls instanceof Array)) {
                urls = [urls];
            }
            for (var k in urls) {
                var myUrl = urls[k];
                var myTitle;
                if (titlesIsArray) { myTitle = titles[k]; }
                else { myTitle = titles; }
                choiceUrls.push(myUrl);
                choiceTitles.push(myTitle);
            }
        }
    };

    this.makeItems = function(doc, url, ignore, eachItem, ret) {
        if (this.beforeFilter) {
            var newurl = this.beforeFilter(doc, url);
            if (newurl != url) {
                this.makeItems(doc, newurl, ignore, eachItem, ret);
                return;
            }
        }
        var titles = [];
        var urls = [];
        this._makeChoices(this["choices"], doc, url, titles, urls);
        var attachments = this._mkAttachments(doc, url, urls);
        
	var parentItemTrans = this.itemTrans;
	this._selectItems(titles, urls, function (itemsToUse) {
	    if(!itemsToUse) {
		ret();
	    } else {
	        var cb = function (doc1) {
		    var url1 = doc1.documentURI;
		    var itemTrans = parentItemTrans;
		    if (itemTrans === undefined) {
			itemTrans = FW.getScraper(doc1, url1);
		    }
		    if (itemTrans === undefined) {
			/* nothing to do */
		    } else {
			itemTrans.makeItems(doc1, url1, attachments[url1],
                                            eachItem, function() {});
		    }
		};
	        Zotero.Utilities.processDocuments(itemsToUse, cb, ret);
	    }
	});
    };
};

FW._MultiScraper.prototype = new FW._Base;

FW.WebDelegateTranslator = function (init) { 
    return new FW._WebDelegateTranslator(init);
};

FW._WebDelegateTranslator = function (init) {
    for (x in init) {
        this[x] = init[x];
    }
    this.makeItems = function(doc, url, attachments, eachItem, ret) {
        // need for scoping
        var parentThis = this;

        var translator = Zotero.loadTranslator("web");
        translator.setHandler("itemDone", function(obj, item) { 
            eachItem(item, parentThis, doc, url);
        });
        translator.setDocument(doc);

        if (this.translatorId) {
            translator.setTranslator(this.translatorId);
            translator.translate();
        } else {
            translator.setHandler("translators", function(obj, translators) {
                if (translators.length) {
                    translator.setTranslator(translators[0]);
                    translator.translate();
                }
            });
            translator.getTranslators();
        }
        ret();
    };
};

FW._WebDelegateTranslator.prototype = new FW._Base;

FW._StringMagic = function () {
    this._filters = new Array();

    this.addFilter = function(filter) {
        this._filters.push(filter);
        return this;
    };

    this.split = function(re) {
        return this.addFilter(function(s) {
            return s.split(re).filter(function(e) { return (e != ""); });
        });
    };

    this.replace = function(s1, s2, flags) {
        return this.addFilter(function(s) {
            if (s.match(s1)) {
                return s.replace(s1, s2, flags);
            } else {
                return s;
            }
        });
    };

    this.prepend = function(prefix) {
        return this.replace(/^/, prefix);
    };

    this.append = function(postfix) {
        return this.replace(/$/, postfix);
    };

    this.remove = function(toStrip, flags) {
        return this.replace(toStrip, '', flags);
    };

    this.trim = function() {
        return this.addFilter(function(s) { return Zotero.Utilities.trim(s); });
    };

    this.trimInternal = function() {
        return this.addFilter(function(s) { return Zotero.Utilities.trimInternal(s); });
    };

    this.match = function(re, group) {
        if (!group) group = 0;
        return this.addFilter(function(s) { 
                                  var m = s.match(re);
                                  if (m === undefined || m === null) { return undefined; }
                                  else { return m[group]; } 
                              });
    };

    this.cleanAuthor = function(type, useComma) {
        return this.addFilter(function(s) { return Zotero.Utilities.cleanAuthor(s, type, useComma); });
    };

    this.key = function(field) {
        return this.addFilter(function(n) { return n[field]; });
    };

    this.capitalizeTitle = function() {
        return this.addFilter(function(s) { return Zotero.Utilities.capitalizeTitle(s); });
    };

    this.unescapeHTML = function() {
        return this.addFilter(function(s) { return Zotero.Utilities.unescapeHTML(s); });
    };

    this.unescape = function() {
        return this.addFilter(function(s) { return unescape(s); });
    };

    this._applyFilters = function(a, doc1) {
        for (i in this._filters) {
            a = flatten(a);
            /* remove undefined or null array entries */
            a = a.filter(function(x) { return ((x !== undefined) && (x !== null)); });
            for (var j = 0 ; j < a.length ; j++) {
                try {
                    if ((a[j] === undefined) || (a[j] === null)) { continue; }
                    else { a[j] = this._filters[i](a[j], doc1); }
                } catch (x) {
                    a[j] = undefined;
                    Zotero.debug("Caught exception " + x + "on filter: " + this._filters[i]);
                }
            }
            /* remove undefined or null array entries */
            /* need this twice because they could have become undefined or null along the way */
            a = a.filter(function(x) { return ((x !== undefined) && (x !== null)); });
        }
        return flatten(a);
    };
};

FW.PageText = function () {
    return new FW._PageText();
};

FW._PageText = function() {
    this._filters = new Array();

    this.evaluate = function (doc) {        
        var a = [doc.documentElement.innerHTML];
        a = this._applyFilters(a, doc);
        if (a.length == 0) { return false; }
        else { return a; }
    };
};

FW._PageText.prototype = new FW._StringMagic();

FW.Url = function () { return new FW._Url(); };

FW._Url = function () {
    this._filters = new Array();

    this.evaluate = function (doc, url) {        
        var a = [url];
        a = this._applyFilters(a, doc);
        if (a.length == 0) { return false; }
        else { return a; }
    };
};

FW._Url.prototype = new FW._StringMagic();

FW.Xpath = function (xpathExpr) { return new FW._Xpath(xpathExpr); };

FW._Xpath = function (_xpath) {
    this._xpath = _xpath;
    this._filters = new Array();

    this.text = function() {
        var filter = function(n) {
            if (typeof n === 'object' && n.textContent) { return n.textContent; }
            else { return n; }
        };
        this.addFilter(filter);
        return this;
    };

    this.sub = function(xpath) {
        var filter = function(n, doc) {
            var result = doc.evaluate(xpath, n, null, XPathResult.ANY_TYPE, null);
            if (result) {
                return result.iterateNext();
            } else {
                return undefined;               
            }
        };
        this.addFilter(filter);
        return this;
    };

    this.evaluate = function (doc) {
        var res = doc.evaluate(this._xpath, doc, null, XPathResult.ANY_TYPE, null);
        var resultType = res.resultType;
        var a = new Array();
        if (resultType == XPathResult.STRING_TYPE) {
            a.push(res.stringValue);
        } else if (resultType == XPathResult.BOOLEAN_TYPE) {
            a.push(res.booleanValue);
        } else if (resultType == XPathResult.NUMBER_TYPE) {
            a.push(res.numberValue);
        } else if (resultType == XPathResult.ORDERED_NODE_ITERATOR_TYPE ||
                   resultType == XPathResult.UNORDERED_NODE_ITERATOR_TYPE) {
            var x;
            while ((x = res.iterateNext())) { a.push(x); }
        } 
        a = this._applyFilters(a, doc);
        if (a.length == 0) { return false; }
        else { return a; }
    };
};

FW._Xpath.prototype = new FW._StringMagic();

FW.detectWeb = function (doc, url) {
    for (var i in FW._scrapers) {
	var scraper = FW._scrapers[i];
	var itemType = scraper.evaluateThing(scraper['itemType'], doc, url);
	var v = scraper.evaluateThing(scraper['detect'], doc, url);
        if (v.length > 0 && v[0]) {
	    return itemType;
	}
    }
    return undefined;
};

FW.getScraper = function (doc, url) {
    var itemType = FW.detectWeb(doc, url);
    return FW._scrapers.filter(function(s) {
        return (s.evaluateThing(s['itemType'], doc, url) == itemType)
		&& (s.evaluateThing(s['detect'], doc, url));
    })[0];
};

FW.doWeb = function (doc, url) {
    var scraper = FW.getScraper(doc, url);
    scraper.makeItems(doc, url, [], 
                      function(item, scraper, doc, url) {
                          scraper.callHook('scraperDone', item, doc, url);
                          if (!item['title']) {
                              item['title'] = "";
                          }
                          item.complete();
                      },
                      function() {
                          Zotero.done();
                      });
    Zotero.wait();
};

/*********************** END FRAMEWORK ***********************/

function detectWeb(doc, url) { return FW.detectWeb(doc, url); }
function doWeb(doc, url) { return FW.doWeb(doc, url); }

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2012 Sebastian Karcher
	(Created as part of the 2012 Zotero Trainer Workshop in Syracus
	and with contributions from participants.)

	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/


function detectWeb(doc, url) { return FW.detectWeb(doc, url); }
function doWeb(doc, url) { return FW.doWeb(doc, url); }

/** Categories*/
FW.MultiScraper({
itemType : "multiple",
detect : FW.Xpath('//ul[@class="list"]'),
choices : {
  titles : FW.Xpath('//ul[@class="list"]//a//h3|//div[@class="feature"]/a/h1').text(),
  urls : FW.Xpath('//ul[@class="list"]//a[.//h3]|//div[@class="feature"]/a[h1]').key('href').text()
}
});

/** Blogpost */
FW.Scraper({
itemType : 'blogPost',
detect : FW.Xpath('//section[@class="content blog"]//div[@class="content-body"]/span[@class="author"]'),
title : FW.Xpath('//h1').text().trim(),
attachments : {
  url : FW.Url(),
  title : "In These Times Blog Snapshot",
  type : "text/html"
},
creators : FW.Xpath('//span[@class="author"]/a').text().split(/\sand\s/).cleanAuthor("author"),
date : FW.Xpath('//h5[@class="datetime"]').text(),
publicationTitle : FW.Xpath('//div[@class="feature"]/h1').text().prepend("In These Times Blog - ")
});

/** Articles */
FW.Scraper({
itemType : 'magazineArticle',
detect : FW.Xpath('//div/h1[@class="article-headline"]'),
title : FW.Xpath('//h1[@class="article-headline"]').text().trim(),
attachments : {
  url : FW.Url(),
  title : "In These Times Snapshot",
  type : "text/html"
},
creators : FW.Xpath('//span[@class="author"]/a').text().split(/\sand\s/).cleanAuthor("author"),
date : FW.Xpath('//h5[@class="article-dateline"]').text().trimInternal().remove(/.+»/),
abstractNote: FW.Xpath('//p[@class="article-deck"]').text().trim(),
language: "en-US",
ISSN: "0160-5992",
publicationTitle : "In These Times"
});


/** All Blogs */
FW.MultiScraper({
itemType : "multiple",
detect : FW.Xpath('//ul[@id="category-list"]'),
choices : {
  titles : FW.Xpath('//ul[@id="category-list"]//h5/a|//div[@class="main-block"]/h1/a').text(),
  urls : FW.Xpath('//ul[@id="category-list"]//h5/a|//div[@class="main-block"]/h1/a').key('href').text()
}
});



/** Individual Blogs */
FW.MultiScraper({
itemType : "multiple",
detect : FW.Xpath('//div[@class="content-body"]/h1'),
choices : {
  titles : FW.Xpath('//div[@class="content-body"]/h1/a').text(),
  urls : FW.Xpath('//div[@class="content-body"]/h1/a').key('href').text()
}
});/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://inthesetimes.com/working/entry/14610/fort_hood_hero_sues_army_for_benefits_trumka_calls_out_white_house_nyc_stad",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Ft. Hood Hero Sues Army for Benefits; Trumka Calls Out White House; NYC Stadium Creates Bad Jobs",
				"creators": [
					{
						"firstName": "Mike",
						"lastName": "Elk",
						"creatorType": "author"
					}
				],
				"date": "Saturday, Feb 16, 2013, 3:40 pm",
				"url": "http://inthesetimes.com/working/entry/14610/fort_hood_hero_sues_army_for_benefits_trumka_calls_out_white_house_nyc_stad",
				"attachments": [
					{
						"title": "In These Times Blog Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://inthesetimes.com/article/14491/time_to_move_beyond_the_board",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Time to Move Beyond the Board",
				"creators": [
					{
						"firstName": "Richard D.",
						"lastName": "Kahlenberg",
						"creatorType": "author"
					},
					{
						"firstName": "Moshe Z.",
						"lastName": "Marvit",
						"creatorType": "author"
					}
				],
				"date": "January 25, 2013",
				"ISSN": "0160-5992",
				"abstractNote": "If a year’s work can be undone in a day, is the NLRB simply too weak?",
				"language": "en-US",
				"libraryCatalog": "In These Times",
				"publicationTitle": "In These Times",
				"url": "http://inthesetimes.com/article/14491/time_to_move_beyond_the_board",
				"attachments": [
					{
						"title": "In These Times Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://inthesetimes.com/blogs",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.inthesetimes.com/politics/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://inthesetimes.com/working",
		"items": "multiple"
	}
]
/** END TEST CASES **/