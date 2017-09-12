{
	"translatorID": "966a7612-900c-42d9-8780-2a3247548588",
	"label": "eMJA",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.mja\\.com\\.au/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-11-01 18:30:00"
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
	***** BEGIN LICENSE BLOCK *****
	
	eMJA Translator - Copyright © 2012 Sebastian Karcher 
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) { return FW.detectWeb(doc, url); }
function doWeb(doc, url) { return FW.doWeb(doc, url); }

/** Articles */
FW.Scraper({
itemType         : 'journalArticle',
detect           : FW.Xpath('//div[@id="authors_list"]'),
title            : FW.Xpath('//h1[@id="page-title"]').text().trim(),
attachments      : [{ 
  url: FW.Url(),
  title:  "eMJA - Snapshot",
  type: "text/html" },
  {
  url: FW.Xpath('//span[@class="file"]/a/@href').text(),
  title: "eMJA - Full Text PDF",
  type: "application/pdf"
  }],
// here, we use the replace(..) to break names on &nbsp;
creators         : FW.Xpath('//div[@id="authors_list"]')
					.text().split(/\s*,\s*|\sand\s/," ").cleanAuthor("author"),
volume           : FW.Xpath('//div[@id="meta-container"]/div/div[@class="field-items"]/div').text().match(/;\s*\d+\s*\(/).replace(/\(|;\s*/g, ""),
date			 : FW.Xpath('//div[@id="meta-container"]/div/div[@class="field-items"]/div').text().match(/\d{4};/).replace(/;/, ""),
issue            : FW.Xpath('//div[@id="meta-container"]/div/div[@class="field-items"]/div').text().match(/\(\d+\)/).replace(/\(|\)/g, ""),
abstractNote     : FW.Xpath('//div[contains(@class, "abstract")]').text(),
journalAbbreviation : "Med. J. Aust.", 
ISSN			 : "0025-729X",
publicationTitle : "Medical Journal of Australia"
});
 
FW.MultiScraper({
itemType         : 'multiple',
detect           : FW.Xpath('//div[@class="view-content"]'),
choices          : {
  titles :  FW.Xpath('//span[contains(@class, "views-field-title")]/span/a|//li[@class="search-result"]/h3/a').text().trim(),
  urls    :  FW.Xpath('//span[contains(@class, "views-field-title")]/span/a|//li[@class="search-result"]/h3/a').key("href")
}
});
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.mja.com.au/journal/2011/195/1/socioeconomic-disparities-stroke-rates-and-outcome-pooled-analysis-stroke",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Socioeconomic disparities in stroke rates and outcome: pooled analysis of stroke incidence studies in Australia and New Zealand",
				"creators": [
					{
						"firstName": "Emma L.",
						"lastName": "Heeley",
						"creatorType": "author"
					},
					{
						"firstName": "Jade W.",
						"lastName": "Wei",
						"creatorType": "author"
					},
					{
						"firstName": "Kristie",
						"lastName": "Carter",
						"creatorType": "author"
					},
					{
						"firstName": "Md Shaheenul",
						"lastName": "Islam",
						"creatorType": "author"
					},
					{
						"firstName": "Amanda G.",
						"lastName": "Thrift",
						"creatorType": "author"
					},
					{
						"firstName": "Graeme J.",
						"lastName": "Hankey",
						"creatorType": "author"
					},
					{
						"firstName": "Alan",
						"lastName": "Cass",
						"creatorType": "author"
					},
					{
						"firstName": "Craig S.",
						"lastName": "Anderson",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"ISSN": "0025-729X",
				"abstractNote": "Abstract Objective:   To assess the influence of area-level socioeconomic status (SES) on incidence and case-fatality rates for stroke.Design, setting and participants:   Analysis of pooled data for 3077 patients with incident stroke from three population-based studies in Perth, Melbourne, and Auckland between 1995 and 2003.Main outcome measures:   Incidence and 12-month case-fatality rates for stroke.Results:   Annual age-standardised stroke incidence rates ranged from 77 per 100 000 person-years (95% CI, 72–83) in the least deprived areas to 131 per 100 000 person-years (95% CI, 120–141) in the most deprived areas (rate ratio, 1.70; 95% CI, 1.47–1.95; P < 0.001). The population attributable risk of stroke was 19% (95% CI, 12%–27%) for those living in the most deprived areas compared with the least deprived areas. Compared with people in the least deprived areas, those in the most deprived areas tended to be younger (mean age, 68 v 77 years; P < 0.001), had more comorbidities such as hypertension (58% v 51%; P < 0.001) and diabetes (22% v 12%; P < 0.001), and were more likely to smoke (23% v 8%; P < 0.001). After adjustment for age, area-level SES was not associated with 12-month case-fatality rate.Conclusions:   Our analysis provides evidence that people living in areas that are relatively more deprived in socioeconomic terms experience higher rates of stroke. This may be explained by a higher prevalence of risk factors among these populations, such as hypertension, diabetes and cigarette smoking. Effective preventive measures in the more deprived areas of the community could substantially reduce rates of stroke.",
				"issue": "1",
				"journalAbbreviation": "Med. J. Aust.",
				"libraryCatalog": "eMJA",
				"publicationTitle": "Medical Journal of Australia",
				"shortTitle": "Socioeconomic disparities in stroke rates and outcome",
				"url": "https://www.mja.com.au/journal/2011/195/1/socioeconomic-disparities-stroke-rates-and-outcome-pooled-analysis-stroke",
				"volume": "195",
				"attachments": [
					{
						"title": "eMJA - Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "eMJA - Full Text PDF",
						"mimeType": "application/pdf"
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
		"url": "http://www.mja.com.au/public/issues/195_01_040711/contents_040711.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.mja.com.au/search/site/vaccination",
		"items": "multiple"
	}
]
/** END TEST CASES **/