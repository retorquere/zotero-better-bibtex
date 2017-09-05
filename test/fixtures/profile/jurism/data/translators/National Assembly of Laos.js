{
	"translatorID": "1865fe4b-df40-4672-b4c6-33d8827a95bc",
	"label": "National Assembly of Laos",
	"creator": "Frank Bennett",
	"target": "https?://(?:www.)?na.gov.la/index\\.php",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "g",
	"lastUpdated": "2013-07-05 07:40:28"
}

ParseDoc = function (doc) {
    this.doc = doc;
	this.availableItems = {};
    this.itemURLs = {};
    this.itemTitles = {};
    this.fields = {};
    this.getAvailableItems();
};

ParseDoc.prototype.getAvailableItems = function () {
    // The markup of the legislation lists is less than ideal, to put it mildly.
    // List elements are set entirely in SPAN and A tags, with newlines forced with BR.
    // Some documents are even linked to anchors with no descriptive content.
    // The nesting of SPAN, A and BR tags is highly irregular, making it impossible
    // to extract structured content with xpath.
    //
    this.getLineData();
    this.fixLineData();
}

ParseDoc.prototype.getLineData = function () {
    // Set the availableItems list for the UI, and 
    // set up the data list for onward processing
    var bignodes = ZU.xpath(this.doc, '//h2/following-sibling::div[@class="article-content"]/p');
    // Dump the HTML of the list(s) to a string.
    var bigtxt = "";
    var biglst;
    for (var i=0,ilen=bignodes.length;i<ilen;i+=1) {
        bigtxt = bignodes[i].innerHTML.replace("&nbsp;"," ");
        // Split the list on the hard-coded numbers.
        biglst = bigtxt.split(/<[^>]+>\s*[0-9]+\.\s*/);
        var count = 1;
	    for (var j=0,jlen=biglst.length;j<jlen;j+=1) {
            var txt = count + ". " + biglst[j].replace(/<[^>]*>/g,"");
            var m = biglst[j].match(/[^\"]*\/docs\/lao\/laws[^\"]*/g);
            if (m) {
                var url = m[0]
                this.availableItems[url] = txt;
                this.itemURLs[url] = m.slice();
                this.itemTitles[url] = [txt];
                count += 1;
            }
	    }
    }
}

ParseDoc.prototype.fixLineData = function () {

    for (var key in this.availableItems) {
        this.fields[key] = {};

        // We now have a sensible list of items. Now for the attachment
        // URLs.

        // There can be multiple attachment URLs for a numbered
        // statute item. Attachments either represent the statute, or
        // a revision to the statute, or a supplementary order or law
        // of some sort. We assume that the first URL goes with the
        // title without parentheticals, and that the parentheticals
        // should be added one at a time for the succeeding URLs. If
        // we run out of parentheticals, we should attach the doc to
        // the current item.
        
        var itemTitleLst = [this.itemTitles[key][0].replace(/\s*\(.*/,"")];

        // Extend item title list for this item
        var itemTitleMatch = this.itemTitles[key][0].match(/(\([^)]+\))/g);
        if (itemTitleMatch) {
            for (var i=itemTitleMatch.length-1;i>-1;i+=-1) {
                itemTitleLst.push(itemTitleLst[0] + " " + itemTitleMatch[i]);
            }
        }

        // Use full title with parenthetical string if there is no separate URL for the latter
        if (itemTitleLst.length > this.itemURLs[key].length) {
            var supplementaryTitleLst = itemTitleLst.slice(this.itemURLs[key].length);
            for (var i=0,ilen=supplementaryTitleLst.length;i<ilen;i+=1) {
                for (var j=0,jlen=this.itemURLs[key].length;j<jlen;j+=1) {
                    itemTitleLst[j] = supplementaryTitleLst[i];
                }
            }
            itemTitleLst = itemTitleLst.slice(0,this.itemURLs[key].length);
        }
        
        this.itemTitles[key] = itemTitleLst;

        // Convert documentURLs to a list of lists, one for each item.
        for (var j=0,jlen=this.itemURLs[key].length;j<jlen;j+=1) {
            this.itemURLs[key][j] = [this.itemURLs[key][j]];
        }
        
        // Normally there will be one url per item, but orphans are populated 
        // back across all items if they turn up
        if (this.itemURLs[key].length > this.itemTitles[key].length) {
            var supplementaryUrlLst = this.itemURLs[key].slice(this.itemTitles[key].length);
            for (var j=0,jlen=this.itemTitles[key].length;j<jlen;j+=1) {
                for (var k=0,klen=supplementaryUrlLst.length;k<klen;k+=1) {
                    this.itemURLs[key][j] = this.itemURLs[key][j].concat(supplementaryUrlLst[k]);
                }
            }
            this.itemURLs[key] = this.itemURLs[key].slice(0,this.itemTitles[key].length);
        }

        // So should now have symmetrical lists, no?

        //Zotero.debug("XXX ITEM SET: "+key);
        //for (var i=0,ilen=this.itemTitles[key].length;i<ilen;i+=1) {
        //    Zotero.debug("XXX            ("+i+") "+this.itemURLs[key][i].length);
        //}

    }
}


function detectWeb(doc, url) {
	anchors = doc.getElementsByTagName('a');
	for (var i=0,ilen=anchors.length;i<ilen;i+=1) {
		var href = anchors[i].getAttribute('href');
		if (href && href.match(/.*\/docs\/lao\/laws\/.*/)) {
			return "multiple";
		}
	}
 	return false;
}

function doWeb(doc, url) {
    var data = new ParseDoc(doc);
	Zotero.selectItems(
        data.availableItems, 
        function(chosen) {
	        var urls = [];
	        for (var myurl in chosen) {
		        urls.push(myurl);
	        }

            for (var i=0,ilen=urls.length;i<ilen;i+=1) {
                var url = urls[i];

                for (var i=0,ilen=data.itemURLs[url].length;i<ilen;i+=1) {
                    var item = new Zotero.Item("statute");
                    item.jurisdiction = "la";
                    var mytitle;
                    item.title = data.itemTitles[url][i].replace(/^\s*[0-9]+\.\s*/, "");
                    // Extract year from URL and set on item
                    var m = data.itemURLs[url][i][0].match(/.*([0-9]{4}).*/);
                    if (m) {
                        item.date = m[1];
                    }

                    // Attach document(s) to item
                    for (var j=0,jlen=data.itemURLs[url][i].length;j<jlen;j+=1) {
                        var label = "Official Text (" + (j+1) + ")";
                        var attachurl = data.itemURLs[url][i][j].replace(" ","%20", "g")
                        item.attachments.push({url: attachurl, title: label, mimeType: 'application/pdf'});
                    }
                    item.complete();
                }
            }
        },
        function(){Zotero.done();}
    );
}
