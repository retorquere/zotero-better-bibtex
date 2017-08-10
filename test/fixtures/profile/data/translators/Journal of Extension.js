{
	"translatorID": "7e56f792-e96b-42a1-913c-40c69cc9ce40",
	"label": "Journal of Extension",
	"creator": "John Weis",
	"target": "^https?://www\\.joe\\.org/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-11-01 18:47:05"
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

/*
Journal of Extension Translator
Copyright (C) 2015 John Weis

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

function detectWeb(doc, url) { return FW.detectWeb(doc, url); }
function doWeb(doc, url) { return FW.doWeb(doc, url); }

FW.Scraper({
	itemType		:'journalArticle',
	detect			:FW.Url().match(/\w+\d+\.(?:php|shtml)$/),
	title			:FW.Xpath('//div[@class="DIV-title"]').text().trim(),
	creators		:FW.Xpath('//div[@class="DIV-author"]/p/b|//div[@class="DIV-author"]/p/strong').text().cleanAuthor("author"),
	publicationTitle:"Journal of Extension",
	abstractNote	:FW.Xpath('//div[@class="DIV-abstract"]/p').text().remove(/^Abstract/).trim(),
	date			:FW.Xpath('//p[@class="DIV-number"]|//p[@class="DIV-number screen_only"]').text().match(/(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|(Nov|Dec)(?:ember)?)?\D?((19[7-9]\d|20\d{2})|\d{2})/),
	volume			:FW.Xpath('//p[@class="DIV-number"]|//p[@class="DIV-number screen_only"]').text().match(/Volume\s(\d+)/, 1),
	issue 			:FW.Xpath('//p[@class="DIV-number"]|//p[@class="DIV-number screen_only"]').text().match(/Number\s(\d+)/, 1),
	tags			:FW.Xpath('//div[@class="DIV-keywords"]/a').text().split(/,/).trim(),
	attachments		:[
		{
			title	:"Full Text PDF",
			type	:"application/pdf",
			url		:FW.Xpath('//div[@id="article-nav"]//a[img/@alt="Printable PDF"]')
						.key('href').text()
		},
		{
			url		:FW.Url(),
			title	:"Snapshot",
			type	:"text/html",
			snapshot:true
		}
	],
	ISSN			:'1077-5315'
});

FW.MultiScraper({
	itemType	:'multiple',
	detect	:FW.Url().match(/(index\.php)|(\d{4}\w+\/)|(journal-current-issue\.php)$/),
	choices	:{
		titles	:FW.Xpath('//h4/a|//div[@class="row-fluid"]/div/p/a').text().trim(),
		url		:FW.Xpath('//h4/a|//div[@class="row-fluid"]/div/p/a').key("href")
	}
});
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.joe.org/joe/2012december/index.php",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.joe.org/joe/1983january/a3.php",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A Way To Fight Inflation: Food Cooperatives",
				"creators": [
					{
						"firstName": "Elizabeth Chase",
						"lastName": "Scott",
						"creatorType": "author"
					}
				],
				"date": "January 1983",
				"ISSN": "1077-5315",
				"abstractNote": "Extension's role In educating consumers on food cooperatives is based on Michigan's experiences. These guidelines may provide you with an educational program to help fight inflation.",
				"issue": "1",
				"libraryCatalog": "Journal of Extension",
				"publicationTitle": "Journal of Extension",
				"shortTitle": "A Way To Fight Inflation",
				"url": "https://www.joe.org/joe/1983january/a3.php",
				"volume": "21",
				"attachments": [
					{
						"url": false,
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
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
		"url": "https://www.joe.org/joe/1993winter/tp1.php",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Public Policy Education: A Path to Political Support",
				"creators": [
					{
						"firstName": "Patrick G.",
						"lastName": "Boyle",
						"creatorType": "author"
					},
					{
						"firstName": "Sheila H.",
						"lastName": "Mulcahy",
						"creatorType": "author"
					}
				],
				"date": "1993",
				"ISSN": "1077-5315",
				"abstractNote": "We know we've changed. We know our programs are making an impact on modern problems. We know we've planted the seeds to enhance the status of Cooperative Extension as the most relevant educational institution in contemporary society. But how can we convince others?... We in Extension and all parts of higher education, especially in publicly funded universities, have an awesome responsibility to help preserve our democratic way of life.... Public policy education teaches people how to seek and use specific, relevant facts and information to influence and create public policy in ways that benefit the public good with enlightened self-interest.... Public policy education avoids handing out answers.... Extension is the only part of the university that can provide the leadership to meet the challenge of public policy education.",
				"issue": "4",
				"libraryCatalog": "Journal of Extension",
				"publicationTitle": "Journal of Extension",
				"shortTitle": "Public Policy Education",
				"url": "https://www.joe.org/joe/1993winter/tp1.php",
				"volume": "31",
				"attachments": [
					{
						"url": false,
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
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
		"url": "https://www.joe.org/joe/2014december/a2.php",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Putting a Face on Hunger: A Community-Academic Research Project",
				"creators": [
					{
						"firstName": "Nancy",
						"lastName": "Coffey",
						"creatorType": "author"
					},
					{
						"firstName": "Mary K.",
						"lastName": "Canales",
						"creatorType": "author"
					},
					{
						"firstName": "Emily",
						"lastName": "Moore",
						"creatorType": "author"
					},
					{
						"firstName": "Melissa",
						"lastName": "Gullickson",
						"creatorType": "author"
					},
					{
						"firstName": "Brenda",
						"lastName": "Kaczmarski",
						"creatorType": "author"
					}
				],
				"date": "December 2014",
				"ISSN": "1077-5315",
				"abstractNote": "Food insecurity is a growing concern for Eau Claire County residents in Western Wisconsin. A community-academic partnership studied food insecurity through the voices of families struggling to access food and institutions that assist with hunger related problems. Data were collected through focus groups held in urban and rural parts of the county. Participants reported that food insecurity affected all aspects of daily life, increasing stress and reducing coping abilities. Results indicate that when Extension and campus-based staff partner with community groups, they can increase community awareness of and find innovative solutions to pressing community needs, such as food insecurity.",
				"issue": "6",
				"libraryCatalog": "Journal of Extension",
				"publicationTitle": "Journal of Extension",
				"shortTitle": "Putting a Face on Hunger",
				"url": "https://www.joe.org/joe/2014december/a2.php",
				"volume": "52",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"community-academic partnerships",
					"focus groups",
					"food insecurity",
					"qualitative research"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.joe.org/joe/2012december/iw2.php",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "\"Apps\"—An Innovative Way to Share Extension Knowledge",
				"creators": [
					{
						"firstName": "Joseph S.",
						"lastName": "Dvorak",
						"creatorType": "author"
					},
					{
						"firstName": "Tanya C.",
						"lastName": "Franke-Dvorak",
						"creatorType": "author"
					},
					{
						"firstName": "Randy R.",
						"lastName": "Price",
						"creatorType": "author"
					}
				],
				"date": "December 2012",
				"ISSN": "1077-5315",
				"abstractNote": "Extension professionals across the country are continuously seeking innovative ways to reach clientele and to disseminate timely, educational information. A new avenue to reach clientele includes the use of smartphone \"apps.\" The \"Machinery Sizing\" app, which was developed to ease the estimation of tractor horsepower to implement sizing for Extension clientele anytime, anywhere, is explained as a key example for Extension professionals to utilize apps in disseminating information to clientele. There are many benefits to using apps, including information availability wherever Internet service is available on the smartphone, ease of computations of equations, and automatic updates being sent to users.",
				"issue": "6",
				"libraryCatalog": "Journal of Extension",
				"publicationTitle": "Journal of Extension",
				"url": "https://www.joe.org/joe/2012december/iw2.php",
				"volume": "50",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"apps",
					"horsepower",
					"machinery",
					"smartphones",
					"technology"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/