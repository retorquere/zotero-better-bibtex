{
	"translatorID": "39eb011c-5af3-404b-9ef9-93717d6d671d",
	"label": "Japan Legislation",
	"creator": "Frank Bennett",
	"target": "https?://law.e-gov.go.jp/cgi-bin/idxselect.cgi",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "g",
	"lastUpdated": "2013-08-04 06:48:18"
}


function getDateAndNumber(txt) {
    var ret;
    var m = txt.match(/(?:最終改正：)*((明治|大正|昭和|平成)([千百十一二三四五六七八九]+)年([十一二三四五六七八九]+)月([十一二三四五六七八九]+)日)(法律|.*省令|政令)第([千百十一二三四五六七八九]+)号/);

    var date = "";
    var number = "";
    if (m) {
        ret = {};
        var addifier = {
            "明治": 1867,
            "大正": 1911,
            "昭和": 1925,
            "平成": 1988
        }
        if (m[6] === "法律") {
            ret.type = "statute";
        } else if (m[6] === "政令") {
            ret.authority = "内閣";
            ret.type = "regulation";
        } else {
            ret.authority = m[6].slice(0,-1);
            ret.type = "regulation";
        }
        ret.rawdate = m[1];
        ret.date = (addifier[m[2]] + convertNumber(m[3])) + "-" + convertNumber(m[4]) + "-" + convertNumber(m[5]);
        ret.number = convertNumber(m[7]);
    }
    return ret;
}


function scrapeStatute (doc, url, articles, mode, originalDoc, originalUrl) {
    // Get the basic statutory info:
    // * title
    // * year of latest revision
    // * year of passage
    // * law number
    // Note: some of these will be regulations, huh.
    var type = "statute";
    var topnode = ZU.xpath(doc, '//b[1]')[0];
    var html = topnode.innerHTML.replace(/\s*(.*?)\s*/, "$1");
    var lst = html.split(/<br\s*\/*>/);
    var title = lst[0];
    var version = lst.slice(-1)[0];
    var dateAndNumber = getDateAndNumber(version);
    var revnode = ZU.xpath(doc, '//div[@align="right"][1]');
    var revisionDateAndNumber;
    if (revnode && revnode[0]) {
        var txt = revnode[0].textContent;
        revisionDateAndNumber = getDateAndNumber(txt);
    }
    var ministry = "";

    var itemmaps = [];
    var itemnodes = ZU.xpath(doc, '//div[contains(@class,"item")]/b[1]');
    for (var i=0,ilen=articles.length;i<ilen;i+=1) {
        var node = itemnodes[articles[i]];
        if (dateAndNumber) {
            var type = dateAndNumber.type;
        }
        var item = new Zotero.Item(type);
        item.url = originalUrl;
        item.jurisdiction = "jp";
        item.title = title;
        if (dateAndNumber) {
            item.publicLawNumber = dateAndNumber.number;
            item.date = dateAndNumber.date;
            item.regulatoryBody = dateAndNumber.authority;
        }
        if (revisionDateAndNumber) {
            item.extra = "Last revised " + revisionDateAndNumber.date + " by Law no. " + revisionDateAndNumber.number;
        }
        var section = node.textContent;
        if (mode === "第") {
            var m = section.match(/\s*第([千百十一二三四五六七八九]+)条[のﾉ]*([千百十一二三四五六七八九]+)*/);
            if (m) {
                var section = "sec. " + convertNumber(m[1]);
                if (m[2]) {
                    section += ("-" + convertNumber(m[2]));
                }
            }
        } else {
            var m = section.match(/\s*([１２３４５６７８９]+)/);
            if (m) {
                var section = "sec. " + convertNumber(m[1]);
            }
        }
        item.section = section;
        var docnodes = [];
        var nextnode = node.parentNode;
        while (nextnode) {
            docnodes.push(nextnode);
            nextnode = nextnode.nextSibling;
            if (nextnode) {
                var labelnode = nextnode.firstChild;
                if (labelnode) {
                    while (labelnode.nodeType!=1) {
                        labelnode = labelnode.nextSibling;
                        if (!labelnode) {
                            nextnode = false;
                            break;
                        }
                    }
                    if (mode === "第") {
                        if (labelnode && (labelnode.textContent.match(/^\s*第/) || labelnode.textContent.match(/^\s*附　*則.*/))) {
                            nextnode = false;
                        }
                    } else {
                        if (labelnode && labelnode.textContent.match(/^\s*[１２３４５６７８９]+/)) {
                            nextnode = false;
                        }
                    }
                }
            }
        }
        var pagetitle = node.textContent + "、" + title; 
        if (revisionDateAndNumber) {
            pagetitle += "（最終改正：" + revisionDateAndNumber.rawdate + "）"
        }
        var header = makeHeader(originalDoc, pagetitle);
        var artdoc = ZU.composeDoc(originalDoc, header, docnodes);
        item.attachments.push({document:artdoc, title:node.textContent, snapshot:true});
        item.complete();
    }
}

function makeHeader(doc, title) {
    var myns = "http://www.w3.org/1999/xhtml"
    
    // head (title and css)
    var head = doc.createElementNS(myns, "head");
    var titlenode = doc.createElementNS(myns, "title");
    head.appendChild(titlenode)

    titlenode.appendChild(doc.createTextNode(title));
    
    var style = doc.createElementNS(myns, "style");
    head.appendChild(style)
    style.setAttribute("type", "text/css")
    var css = "*{margin:0;padding:0;}div.mlz-outer{width: 60em;max-width:95%;margin:0 auto;text-align:left;}body{text-align:center;}p{margin-top:0.75em;margin-bottom:0.75em;}div.mlz-link-button a{text-decoration:none;background:#cccccc;color:white;border-radius:1em;font-family:sans;padding:0.2em 0.8em 0.2em 0.8em;}div.mlz-link-button a:hover{background:#bbbbbb;}div.mlz-link-button{margin: 0.7em 0 0.8em 0;}div{margin:1em 0 1em 0;}div.number{text-indent:-1em;margin:2em;}";
    style.appendChild(doc.createTextNode(css));
    return head;
}

function convertNumber (str) {
    var num = 0;
    var multipliers = {
        "千": 1000,
        "百": 100,
        "十": 10
    }
    var numbers = ["meh","一","二","三","四","五","六","七","八","九"];
    var arabic = ["０","１","２","３","４","５","６","７","８","９"];
    var working = "";
    var lst = str.split("");
    for (var i=0,ilen=lst.length;i<ilen;i+=1) {
        if (arabic.indexOf(lst[i]) > -1) {
            working += arabic.indexOf(lst[i]);
            continue;
        }
        if (multipliers[lst[i]]) {
            if (!working) {
                working = "1";
            }
            num += (parseInt(working, 10)*multipliers[lst[i]]);
            working = "";
        } else if (numbers.indexOf(lst[i]) > -1) {
            working += numbers.indexOf(lst[i]);
        }
    }
    if (working) {
        num += parseInt(working, 10);
    }
    return num;
}

function buildItemList (doc, items) {
    var mode, rex;
    var itemnodes = ZU.xpath(doc, '//div[contains(@class,"item")]/b[1]');
    if (itemnodes && itemnodes[0]) {
        var mode;
        if (itemnodes[0].textContent.match(/^\s*第/)) {
            rex = new RegExp("^\s*第([千百十一二三四五六七八九]+)条[のﾉ]*([千百十一二三四五六七八九]+)*");
            mode = "第";
        } else {
            rex = new RegExp("^\s*([１２３４５６７８９]+)");
            mode = "１";
        }
    }
    var lastnum = 0;
    for (var j=0,jlen=itemnodes.length;j<jlen;j+=1) {
        var title = itemnodes[j].textContent;
        var m = title.match(rex);
        if (m) {
            var num = convertNumber(m[1]);
            if (num < lastnum) {
                break;
            }
            lastnum = num;
        } else {
            continue;
        }
        items[j] = title;
    }
    return mode;
}

function detectWeb (doc, url) {
	return "multiple";
}

function doWeb (doc, url) {
    var originalUrl = url;
    var originalDoc = doc;
    var frames = doc.getElementsByTagName("frame");
    for (var i=0,ilen=frames.length;i<ilen;i+=1) {
        if (frames[i].getAttribute("name") === "data") {
            var realurl = frames[i].getAttribute("src");
            ZU.processDocuments(
                [realurl],
                function (doc, url) {
                    var items = {};
                    var mode = buildItemList(doc, items);
                    Zotero.selectItems(items, function (chosen) {
                        var articles = [];
	                    for (var j in chosen) {
		                    articles.push(j);
	                    };
                        scrapeStatute(doc, url, articles, mode, originalDoc, originalUrl);
                    });
                },
                function(){Zotero.done();}
            );
            break;
        }
    }
}
