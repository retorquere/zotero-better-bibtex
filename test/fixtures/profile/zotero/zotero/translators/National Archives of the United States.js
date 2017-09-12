{
	"translatorID": "edfa5803-e331-47db-84d1-db3cf8d6f460",
	"label": "National Archives of the United States",
	"creator": "Adam Powers",
	"target": "^https?://research\\.archives\\.gov",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-01-05 11:42:13"
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

/**
 * development wishlist:
 * multi-scraper for search, series and record groups
 * tests
 * check online availability
 * Assign the Zotero itemType based on the media type of the record (record, letter, manuscript, book, photo (see 296573), video, etc)
 * Presidential Libraries (see 923489)
 * Author instead of Institution (see 923489)
 * Recognize and cite more archives correctly (complete list at: http://www.archives.gov/locations/states.html)
 * 		Currently only DC and College Park are recognized
 * Acronyms for subsequent citings of the same material (per "Citing Records in the National Archives of the United States")
 * 		Maybe that's a job for the citation side of things?
 **/

function build_extra (doc, extra_str, new_str, xpath) {
	var tmp = ZU.xpathText (doc, xpath);
	if (tmp != null) {
		return extra_str + new_str + tmp.trim().replace(/\s+/gm," ") +"\n";
	} else {
		return extra_str;
	}
}

FW.Scraper({
	itemType: "report",
	detect: FW.Url().match("/description/"),
	title: FW.Xpath("//div[@id=\"detailsBar\"]/h1[@class=\"itemTitle\"]/text()").text().trim(),
	// Archive (from NARA contact info)
	archive: FW.Xpath("//div[@class=\"information\"]//dt[contains(text(),\"Copy 1:\")]/following-sibling::dt[contains(text(),\"Contact(s):\")]/following-sibling::dd[1]/ul[@class=\"contacts\"]/li/text()[1]").text().trim(),
	// Archive Location (NARA record group)
	archiveLocation: FW.Xpath("//div[@class=\"information\"]//dt[contains(text(),\"From:\")]/following-sibling::dd[1]//a[contains(text(),\"Record Group\")]/text()|//div[@class=\"information\"]//dt[contains(text(),\"From:\")]/following-sibling::dd[1]//a[contains(text(),\"Collection\")]/text()").text().trim(),
	// Institution (NARA creator; eg - War Department. War Plans Division.)
	institution: FW.Xpath("substring-before(//div[@class=\"information\"]//dt[contains(text(),\"Creator(s):\")]/following-sibling::dd[1]/ul/li[last()]/a/text(),\".\")").text().trimInternal(),
	// Rights (NARA use rights)
	rights: FW.Xpath("//div[@class=\"information\"]//dt[contains(text(),\"Use Restriction(s):\")]/following-sibling::dd[1]/ul/li/text()[1]").text().trim(),
	// Series (NARA series)
	seriesTitle: FW.Xpath("substring-after(//div[@class=\"information\"]//dt[contains(text(),\"From:\")]/following-sibling::dd[1]/ul/li/a/text(),\":\")").text().trim(),
	// Call Number (National Archives ID; eg - "2965734")
	callNumber: FW.Xpath("//div[@class=\"information\"]//dt[contains(text(),\"National Archives Identifier:\")]/../dd[1]/text()").text().trim().prepend("National Archives Identifier "),
	// Date the item was created
	date: FW.Xpath("//div[@class=\"information\"]//dt[contains(text(),\"This item was produced or created:\")]/following-sibling::dd[1]/ul/li/text()").text().trim(),
	// abstract = Scope and Content
	abstractNote: FW.Xpath("//h3[contains(text(),\"Scope & Content\")]/../div/p/text()").text().trim(),
	/**
	 * hook:
	 * 		clean up archive information so that it can be cited correctly
	 * 		create extra field, which contains archive location information and other finding information
	 * 		misc field cleanup
	 **/
	hooks: {scraperDone: function  (item, doc, url) {
		/* cite archive location correctly */
		if (item.archive.match("National Archives at College Park") != null) {
			item.archive = "National Archives at College Park, MD";
		} else if (item.archive.match("National Archives Building") != null) {
			item.archive = "National Archives Building, Washington DC";
		} else if (item.archive.match("(Fort Worth)") != null) {
			item.archive = "National Archives and Records Administration - Southwest Region (Fort Worth)";
		}
		/* TODO: there are plenty more archives that could go into this if-else list */
		/* correct citation style can be found at: 
		 *		http://www.archives.gov/publications/general-info-leaflets/17-citing-records.html */
		
		
		/** add "extra" information for helping find the record at the archive **/
		var extra_str = "";
		/** identifiers **/
		// Former ARC Identifier
		extra_str = build_extra (doc, extra_str, "Former ARC Identifier: ", "//div[@class=\"information\"]//dt[contains(text(),\"Former ARC Identifier:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Local Identifier
		extra_str = build_extra (doc, extra_str, "Local ID: ", "//div[@class=\"information\"]//dt[starts-with(text(),\"Local Identifier:\")]/following-sibling::dd[1]/text()");
		// Former Local Identifier
		extra_str = build_extra (doc, extra_str, "Former Local ID: ", "//div[@class=\"information\"]//dt[contains(text(),\"Former Local Identifier:\")]/following-sibling::dd[1]/text()");
		// MLR / HMS number
		extra_str = build_extra (doc, extra_str, "", "//div[@class=\"information\"]//dt[contains(text(),\"From:\")]/following-sibling::dd[1]/ul/li[contains(text(),\"HMS\")]/text()");
		// HMS/MLR Entry Number
		extra_str = build_extra (doc, extra_str, "HMS/MLR Entry Number: ", "//div[@class=\"information\"]//dt[starts-with(text(),\"HMS/MLR Entry Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Former HMS/MLR Entry Number
		extra_str = build_extra (doc, extra_str, "Former HMS/MLR Entry Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"Former HMS/MLR Entry Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// NAIL Control Number
		extra_str = build_extra (doc, extra_str, "NAIL Control Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"NAIL Control Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Select List Identifier
		extra_str = build_extra (doc, extra_str, "Select List Identifier: ", "//div[@class=\"information\"]//dt[contains(text(),\"Select List Identifier:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// XMIS Number
		extra_str = build_extra (doc, extra_str, "XMIS Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"XMIS Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Other ID
		extra_str = build_extra (doc, extra_str, "Other ID: ", "//div[@class=\"information\"]//dt[contains(text(),\"Other Identifier:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Search ID
		extra_str = build_extra (doc, extra_str, "Search ID: ", "//div[@class=\"information\"]//dt[contains(text(),\"Search Identifier:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Agency-Assigned Identifier
		extra_str = build_extra (doc, extra_str, "Agency-Assigned Identifier(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Agency-Assigned Identifier:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Declassification Project Number
		extra_str = build_extra (doc, extra_str, "Declassification Project Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"Declassification Project Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Government Publication Number
		extra_str = build_extra (doc, extra_str, "Government Publication Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"Government Publication Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Inventory Entry Number
		extra_str = build_extra (doc, extra_str, "Inventory Entry Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"Inventory Entry Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// NUCMC Number
		extra_str = build_extra (doc, extra_str, "NUCMC Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"NUCMC Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Other Finding Aid Identifier
		extra_str = build_extra (doc, extra_str, "Other Finding Aid Identifier: ", "//div[@class=\"information\"]//dt[contains(text(),\"Other Finding Aid Identifier:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Preliminary Checklist Identifier
		extra_str = build_extra (doc, extra_str, "Preliminary Checklist Identifier: ", "//div[@class=\"information\"]//dt[contains(text(),\"Preliminary Checklist Identifier:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// PRESNET Number
		extra_str = build_extra (doc, extra_str, "PRESNET Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"PRESNET Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Ref ID
		extra_str = build_extra (doc, extra_str, "Ref ID: ", "//div[@class=\"information\"]//dt[contains(text(),\"Ref ID:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Agency Disposition Number
		extra_str = build_extra (doc, extra_str, "Agency Disposition Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"Agency Disposition Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Kennedy Assassination Document ID
		extra_str = build_extra (doc, extra_str, "Kennedy Assassination Document ID: ", "//div[@class=\"information\"]//dt[contains(text(),\"Kennedy Assassination Document ID:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// FOIA Tracking Number
		extra_str = build_extra (doc, extra_str, "FOIA Tracking Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"FOIA Tracking Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");

		/** Other information **/
		// Microform Publication #'s
		extra_str = build_extra (doc, extra_str, "Microform Publications: ", "//div[@class=\"information\"]//dt[contains(text(),\"Microform Publication(s):\")]/following-sibling::dd[1]/ul/li/text()[normalize-space()]");
		// container #
		extra_str = build_extra (doc, extra_str, "Container ID: ", "//div[@class=\"information\"]//dt[contains(text(),\"Copy 1:\")]/following-sibling::dt[contains(text(),\"Copy 1 Media Information:\")]/following-sibling::dd[1]/ul[@class=\"mediaocc\"]//li/span[contains(text(),\"Container Id:\")]/following-sibling::text()");
		// Size
		extra_str = build_extra (doc, extra_str, "Size: ", "//div[@class=\"information\"]//dt[contains(text(),\"Copy 1:\")]/following-sibling::dt[contains(text(),\"Extent (Size):\")]/following-sibling::dd[1]/text()");
		// level of description (records, series, item, etc)
		extra_str = build_extra (doc, extra_str, "Record Level: ", "//div[@class=\"information\"]//dt[contains(text(),\"Level of Description:\")]/following-sibling::dd[1]/ul/li/text()");
		// types of materials (textual records)
		extra_str = build_extra (doc, extra_str, "Material Type: ", "//div[@class=\"information\"]//dt[contains(text(),\"Type(s) of Archival Materials:\")]/following-sibling::dd[1]/ul/li/text()");
		// Media Type (eg - "paper")
		extra_str = build_extra (doc, extra_str, "Media Type: ", "//div[@class=\"information\"]//dt[contains(text(),\"Copy 1:\")]/following-sibling::dt[contains(text(),\"Copy 1 Media Information:\")]/following-sibling::dd[1]/ul[@class=\"mediaocc\"]/li/span[contains(text(),\"Specific Media Type:\")]/following-sibling::text()");
		// Alternate title(s)
		extra_str = build_extra (doc, extra_str, "Alternate Title(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Other Title(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// General Note
		extra_str = build_extra (doc, extra_str, "General Note: ", "//div[@class=\"information\"]//dt[contains(text(),\"General Note(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// Full institution name (eg - "War Department. War Plans Divsion. (2/9/1918 - 3/23/1942)")
		extra_str = build_extra (doc, extra_str, "Institution: ", "//div[@class=\"information\"]//dt[contains(text(),\"Creator(s):\")]/following-sibling::dd[1]/ul/li/a/text()");
		// Online Resources
		extra_str = build_extra (doc, extra_str, "Online Resources: ", "//div[@class=\"information\"]//dt[contains(text(),\"Online Resource(s):\")]/following-sibling::dd[1]/ul/li/text()[normalize-space()]");
		// Subjects Represented
		extra_str = build_extra (doc, extra_str, "Subjects: ", "//div[@class=\"information\"]//dt[contains(text(),\"Subjects Represented in the Archival Material(s):\")]/following-sibling::dd[1]/ul/li/a/text()");
		// Date the materials were compiled
		extra_str = build_extra (doc, extra_str, "Date Compiled: ", "//div[@class=\"information\"]//dt[contains(text(),\"The creator compiled or maintained the series between:\")]/following-sibling::dd[1]/text()");
		// Date Note
		extra_str = build_extra (doc, extra_str, "Date Note: ", "//div[@class=\"information\"]//dt[contains(text(),\"Date Note:\")]/following-sibling::dd[1]/text()");
		// Files document the period XXXX - YYYY
		extra_str = build_extra (doc, extra_str, "Documented Period: ", "//div[@class=\"information\"]//dt[contains(text(),\"The file documents the time period:\")]/following-sibling::dd[1]/text()");
		// Documented Period
		extra_str = build_extra (doc, extra_str, "Documented Period: ", "//div[@class=\"information\"]//dt[contains(text(),\"This item documents the time period:\")]/following-sibling::dd[1]/text()");
		// Accession Number(s)
		extra_str = build_extra (doc, extra_str, "Accession Number(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Accession Number(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// Disposition Authority Number(s)
		extra_str = build_extra (doc, extra_str, "Disposition Authority Number(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Disposition Authority Number(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// Records Center Transfer Number(s)
		extra_str = build_extra (doc, extra_str, "Records Center Transfer Number(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Records Center Transfer Number(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// Internal Transfer Number(s)
		extra_str = build_extra (doc, extra_str, "Internal Transfer Number(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Internal Transfer Number(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// Language(s)
		extra_str = build_extra (doc, extra_str, "Language(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Language(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// Transfer Information
		extra_str = build_extra (doc, extra_str, "Transfer Information: ", "//div[@class=\"information\"]//dt[contains(text(),\"Transfer Information:\")]/following-sibling::dd[1]//text()");
		// Custodial History
		extra_str = build_extra (doc, extra_str, "Custodial History: ", "//div[@class=\"information\"]//dt[contains(text(),\"Custodial History:\")]/following-sibling::dd[1]//text()");
		// Scale Note
		extra_str = build_extra (doc, extra_str, "Scale Note: ", "//div[@class=\"information\"]//dt[contains(text(),\"Scale Note:\")]/following-sibling::dd[1]//text()");
		// Copyright Date
		extra_str = build_extra (doc, extra_str, "Copyright Date: ", "//div[@class=\"information\"]//dt[contains(text(),\"This item's copyright was established:\")]/following-sibling::dd[1]/ul/li/text()");
		// Contributor(s)
		extra_str = build_extra (doc, extra_str, "Contributor(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Contributors to Authorship and/or Production of the Archival Material(s):\")]/following-sibling::dd[1]/ul/li/a/text()");
		// Former Record Groups
		extra_str = build_extra (doc, extra_str, "Former Record Group(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Former Record Group(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// Former Collections
		extra_str = build_extra (doc, extra_str, "Former Collection(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Former Collections(s):\")]/following-sibling::dd[1]/ul/li/text()");

		item.notes.push(extra_str);
		
		
		/** other clean-up **/
		// Reverse "Record Group" listing
		var rg = item.archiveLocation.split(":", 2);
		item.archiveLocation = rg[1].trim() + ", " + rg[0].trim();
	}}
});


/** Test URLs **/
//http://research.archives.gov/description/268296
//http://research.archives.gov/description/531201
//http://research.archives.gov/description/651639
//http://research.archives.gov/description/299807
//http://research.archives.gov/description/299874
//http://research.archives.gov/description/595102
//http://research.archives.gov/description/305167
//http://research.archives.gov/description/628966
//http://research.archives.gov/description/305167
//http://research.archives.gov/description/595449
//http://research.archives.gov/description/1923129
//http://research.archives.gov/description/305059
//http://research.archives.gov/description/2050937
//http://research.archives.gov/description/201293
//http://research.archives.gov/description/306687
//http://research.archives.gov/description/4688052
//http://research.archives.gov/description/160264
//http://research.archives.gov/description/5171392
//http://research.archives.gov/description/305171
//http://research.archives.gov/description/594759
//http://research.archives.gov/description/5822974
//http://research.archives.gov/description/638460
//http://research.archives.gov/description/2630932/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://research.archives.gov/description/651639",
		"items": [
			{
				"itemType": "report",
				"creators": [],
				"notes": [
					"XMIS Number: 007381, This is the State Questionnaire (E1) data file., 007382, This is the District Main Questionnaire (E2), Parts 1-6 data file., 007383, This is the District Instructional Area Supplement Questionnaire (E2S) data file., 007384, This is the Principal Main Questionnaire (E3) data file., 007385, This is the Principal Supplement Questionnaire (E3S) data file., 007386, This is the Provider Main Questionnaire (E4) data file., 007387, This is the Provider Supplement Questionnaire (E4S) data file., 007388, This is the Teacher Main Questionnaire Homeroom Sample (E5) data file., 007389, This is the Teacher Supplement Questionnaire Homeroom Sample (E5S) data file., 007390, This is the Classroom Roster Sheet (E5ROSTER) data file., 007391, This is the District Information Booklets 1 and 2 (E6) data file., 007392, This is the School Information Booklet Number 8 (E9) data file., 007393, This is the Parent Advisory Council Interview (E11) data file., 007442, This is the State Questionnaire (E1) codebook file., 007443, This is the District Main Questionnaire (E2), Part 1 codebook file., 007444, This is the District Main Questionnaire (E2), Part 2 codebook file., 007445, This is the District Main Questionnaire (E2), Part 3 codebook file., 007446, This is the District Main Questionnaire (E2), Part 4 codebook file., 007447, This is the District Main Questionnaire (E2), Part 5 codebook file., 007448, This is the District Main Questionnaire (E2), Part 6 codebook file., 007449, This is the District Instructional Area Supplement Questionnaire (E2S) codebook file., 007450, This is the Principal Main Questionnaire (E3) codebook file., 007451, This is the Principal Supplement Questionnaire (E3S) codebook file., 007452, This is the Provider Main Questionnaire (E4) codebook file., 007453, This is the Provider Supplement Questionnaire (E4S) codebook file., 007454, This is the Teacher Main Questionnaire Homeroom Sample (E5) codebook file., 007455, This is the Teacher Supplement Questionnaire Homeroom Sample (E5S) codebook file., 007456, This is the Classroom Roster Sheet (E5ROSTER) codebook file., 007457, This is the District Information Booklets 1 and 2 (E6) codebook file., 007458, This is a codebook file., 007459, This is the School Information Booklet Number 8 (E9) codebook file., 007460, This is the Parent Advisory Council Interview (E11) codebook file., 007461, This is a codebook file.\nSize: 13 data files and 20 electronic documentation files\nRecord Level: File Unit\nMaterial Type: Data Files\nMedia Type: Magnetic Tape Cartridge\nInstitution: Department of Health, Education, and Welfare. Office of Education. National Institute of Education. (06/23/1972 - 05/04/1980)\nDate Compiled: 1975 - 1980\nDate Note: These files have data compiled by the National Opinion Research Center, Policy Research Corporation, and the Stanford Research Institute between 1975 and 1976.\nDocumented Period: 1975 - 1976\nContributor(s): National Opinion Research Center, Compiler, Policy Research Corporation., Compiler, Stanford Research Institute., Compiler\n"
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"url": "http://research.archives.gov/description/651639",
				"abstractNote": "These files contain data identifying Compensatory Education Programs in operation, with data for states, school districts, schools, principals, teachers, and parents.  The data contains information on expenditures, funding sources, extent of services, student selection processes, teacher background, and progress evaluation.",
				"archive": "National Archives at College Park, MD",
				"archiveLocation": "Records of the National Institute of Education, 1960 - 1980, Record Group 419",
				"callNumber": "National Archives Identifier 651639",
				"institution": "Department of Health, Education, and Welfare",
				"rights": "Unrestricted",
				"seriesTitle": "Compensatory Education Study Files, compiled 1975 - 1980, documenting the period 1970 - 1977",
				"title": "National Survey Files,   1975 - 1976",
				"libraryCatalog": "National Archives of the United States",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://research.archives.gov/description/7062935",
		"items": [
			{
				"itemType": "report",
				"creators": [],
				"notes": [
					"HMS/MLR Entry Number: A1 313\nDeclassification Project Number: NND 775051, NND 775119\nContainer ID: Boxes 1-2183\nSize: 954 linear feet, 7 linear inches\nRecord Level: Series\nMaterial Type: Textual Records\nMedia Type: Paper\nInstitution: Department of Defense. European Command. Office of Military Government for Germany (U.S.). Civil Administration Division. Public Safety Branch. (03/15/1947 - 09/21/1949)\nDate Compiled: 1945 - 1948\n"
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"url": "http://research.archives.gov/description/7062935",
				"abstractNote": "This series consists of fragebogen case files.  These files might contain the original fragebogen (usually in German), a fragebogen worksheet, a Special Branch investigation report, a report on the subject and respondent's tribunal decision, and affidavits on behalf of the subject.  The records were maintained by the Public Safety Branch.",
				"archive": "National Archives at College Park, MD",
				"archiveLocation": "Records of U.S. Occupation Headquarters, World War II, 1923 - 1972, Record Group 260",
				"callNumber": "National Archives Identifier 7062935",
				"institution": "Department of Defense",
				"rights": "Unrestricted",
				"title": "Fragebogen Files Relating to Denazification,   1945 - 1948",
				"libraryCatalog": "National Archives of the United States"
			}
		]
	}
]
/** END TEST CASES **/