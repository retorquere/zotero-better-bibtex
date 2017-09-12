{
	"translatorID": "0624386b-d70c-4a59-a95e-259656e82c27",
	"translatorType": 4,
	"label": "Japan Legislative Council Minutes",
	"creator": "Frank Bennett",
	"target": "https?://(?:www.)*moj.go.jp/shingi1/",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"browserSupport": "g",
	"lastUpdated": "2013-09-01 15:39:28"
}

function sniffType (doc, url) {
    var ret;
    var m = url.match(/https?:\/\/(?:www\.)*moj\.go\.jp\/shingi1\/shingi.*\.html/);
    if (m) {
        var nodes = ZU.xpath(doc, '//div[@id="content"]/h2[contains(@class,"cnt_ttl01")]');
        if (nodes && nodes[0]) {
            var str = normalizeString(nodes[0].textContent);
            var mm = str.match(/.*第([0-9]+)回会議\s*\(平成([0-9]+)年([0-9]+)月([0-9]+)日.*\).*/);
            if (mm) {
                ret = "hearing";
            }
        }
    }
    if (!ret) {
        var nodes = ZU.xpath(doc, '//div[@id="content"]/h2[contains(@class,"cnt_ttl01")]');
        if (nodes && nodes[0]) {
            var mm = nodes[0].textContent.match(/^\s*法制審議会\s*[－-]*\s*.*部会\s*/);
            if (mm) {
                ret = "multiple";
            }
        }
    }
    return ret;
}

function DataObj (str, triedIndex) {
    this.triedIndex = triedIndex;
    this.data = {attachmentInfo:{}};
    this.refetch(str);
}

function normalizeString (str) {
    // Normalize some things
    var str = str.replace("　"," ","g");
    var str = str.replace("（","(","g");
    var str = str.replace("）",")","g");
    var numbers = ["０","１","２","３","４","５","６","７","８","９"];
    var lst = str.split("");
    for (var i=0,ilen=lst.length;i<ilen;i+=1) {
        if (numbers.indexOf(lst[i]) > -1) {
            lst[i] = numbers.indexOf(lst[i]);
        }
    }
    return lst.join("");
}

DataObj.prototype.refetch = function(str) {
    str = normalizeString(str);
    var m = str.match(/(?:法制審議会\s*[－-]*\s*)*(?:(.*部会))*\s*(?:第([0-9]+)回会議)*(?:\((平成)([0-9]+)年([0-9]+)月([0-9]+)日.*\))*/);
    if (m) {
        if (m[1]) {
            this.data.committee = "法制審議会" + m[1];
        }
        if (m[2]) {
            this.data.meetingNumber = m[2];
        }
        if (m[4] && m[5] && m[6]) { 
            this.data.date = (parseInt(m[4], 10) + 1988) + "-" + m[5] + "-" + m[6];
        }
    }
}

DataObj.prototype.makeItem = function() {
    var item = new Zotero.Item("hearing");
    item.url = this.data.url;
    item.jurisdiction = "jp";
    item.legislativeBody = "法務省";
    ZU.setMultiField(item, "legislativeBody", "Ministry of Justice", "en");
    item.committee = this.data.committee;
    if (this.data.committee) {
        var subcommittee = this.data.committee.replace(/^法制審議会/,"");
        ZU.setMultiField(item, "committee", "Legislative Council | " + subcommittee, "en");
    }
    item.meetingNumber = this.data.meetingNumber;
    item.date = this.data.date;
    for (var url in this.data.attachmentInfo) {
        var label = this.data.attachmentInfo[url];
        var mimeType;
        if (url.match(/\.lzh$/)) {
            mimeType = "application/lzh";
        } else {
            mimeType = "application/pdf";
        }
        item.attachments.push({url:url,mimeType:mimeType,title:label});
    }
    item.complete();
}

function fixUrl (url) {
    if (url.match(/^\//)) {
        url = "http://www.moj.go.jp" + url;
    }
    return url;
}

function scrapeOneHearing (doc, url, data) {
    var dataObj;
    var str = ZU.xpath(doc, '//div[@id="content"]/h2[contains(@class,"cnt_ttl01")]')[0].textContent;
    if (data) {
        dataObj = data[url];
    } else {
        dataObj = new DataObj(str);
    }

    dataObj.data.url = url;

    var linknodes = ZU.xpath(doc, '//a[contains(@href,".pdf")] | //a[contains(@href,".lzh")]');
    for (var i=0,ilen=linknodes.length;i<ilen;i+=1) {
        var node = linknodes[i];
        var url = node.getAttribute("href");
        if (!dataObj.data.attachmentInfo[url]) {
            var label = node.textContent;
            dataObj.data.attachmentInfo[url] = label;
        }
    }
    if (!dataObj.subcommittee && !dataObj.triedIndex) {
        // Get parent page and scrabble around for the committee name
        var parenturl = ZU.xpath(doc, '//div[@id="topicpath"]/a[last()]')[0].getAttribute("href");
        ZU.processDocuments(
            [parenturl], 
            function (doc, url) {
                var topnode = ZU.xpath(doc, '//div[@id="content"]/h2[contains(@class,"cnt_ttl01")]')[0];
                if (topnode) {
                    dataObj.refetch(topnode.textContent);
                }
                dataObj.makeItem();
            },
            function () {
                Zotero.done();
            }
        );
    } else {
        dataObj.makeItem();
    }
}

function detectWeb (doc, url) {
    return sniffType(doc, url);
}

function doWeb (doc, url) {
    var type = sniffType(doc, url);
    if (type === "multiple") {
        // scrape list titles and URLs
        // select
        // push urls and dataObj set to scrapeOneHearing()
        var items = {};
        var data = {attachmentInfo:{}};
        var nodes = ZU.xpath(doc, '//a[contains(@href,"/shingi1/")]');
        for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
            var title = nodes[i].textContent;
            var dataObj = new DataObj(title, true);
            if (dataObj.data.date && dataObj.data.meetingNumber) {
                var url = fixUrl(nodes[i].getAttribute("href"));
                items[url] = title;
                // say that we've already seen the index page, thank you
                data[url] = dataObj;
            }
        }
        Zotero.selectItems(items, function (chosen) {
            var urls = [];
	        for (var j in chosen) {
		        urls.push(j);
	        };
            ZU.processDocuments(urls, function (doc, url) {
                scrapeOneHearing(doc, url, data);
            });
        });
    } else {
        scrapeOneHearing(doc, url);
    }
}
