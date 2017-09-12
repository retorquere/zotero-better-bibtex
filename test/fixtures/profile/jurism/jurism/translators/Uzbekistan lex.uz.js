{
	"translatorID": "e58c1b6e-effb-4a4a-8ba4-d6f0aa6ab7e0",
	"label": "Uzbekistan lex.uz",
	"creator": "Frank Bennett",
	"target": "https?://(?:www\\.)?lex.uz/pages/getpage.aspx",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "g",
	"lastUpdated": "2013-07-06 08:18:09"
}

function getActForm (doc) {
    var ret = doc.getElementsByClassName("ACT_FORM");
    return ret[0] ? ret[0].textContent : "";
}

function getActTitle (doc) {
    var ret = doc.getElementsByClassName("ACT_TITLE");
    return ret[0] ? ret[0].textContent : "";
}

function getPublicationOrigin (doc) {
    var ret = doc.getElementsByClassName("PUBLICATION_ORIGIN");
    return ret[0] ? ret[0].textContent : "";
}

function getAcceptingBody (doc) {
    var ret = doc.getElementsByClassName("ACCEPTING_BODY");
    return ret[0] ? ret[0].textContent : "";
}

function getType (doc) {
    if (!getAcceptingBody(doc)) {
        return "statute";
    } else {
        return "regulation";
    }
}

function detectWeb(doc, url){ 
    if (!getPublicationOrigin(doc)) {
        return false;
   }
    return getType(doc);
}

function doWeb(doc, url) {
    var itemType = getType(doc);
    var title = getActTitle(doc);
    var actForm = getActForm(doc);
    if (actForm) {
        title = actForm + " " + title.toLowerCase();
    }
    var acceptingBody = getAcceptingBody(doc);
    var publicationOrigin = getPublicationOrigin(doc).replace(/^\s*\(\s*/,"").replace(/\s*\)\s*$/,"");
    var language;
    if (publicationOrigin.match(/Узбекистан/)) {
        language = "ru";
    } else {
        language = "uz";
    }

    // Create separate items for all revisions. We don't have the content of the revising
    // statutes, but it's good that the service lists them, and we shouldn't let them go to waste.

    // First, split on semicolon
    var poLst = publicationOrigin.split(/\s*;\s*/);
    var journal;
    var m;
    var mm;
    for (var i=0,ilen=poLst.length;i<ilen;i+=1) {
        if (!poLst[i].match(/^[0-9]{4}/)) {
            m = poLst[i].match(/(.*?),\s*([0-9].*)/);
            if (m) {
                journal = m[1];
                poLst[i] = m[2];
            } else {
                // This should never happen
                continue;
            }
        }
        if (!journal) {
            continue;
        }
        m = poLst[i].match(/(.*)[гй].\s*,\s*(.*)/);
        if (m) {
            poLst[i] = m[2];
            while (poLst[i]) {
                var item = new Zotero.Item(itemType);
                item.jurisdiction = "uz";
                item.title = title;
                item.language = language;
                // Try Russian
                mm = poLst[i].match(/№\s*([^,]*),\s*ст.\s*([^,]*)(?:\s*,\s*(.*))*/);
                if (mm) {
                    poLst[i] = mm[3];
                } else {
                    // If no luck there, try Uzbek
                    mm = poLst[i].match(/\s*([^-]*)-сон\s*,\s*([^-]*)-модда(?:\s*,\s*(.*))*/);
                    if (mm) {
                        poLst[i] = mm[3];
                    }
                }
                if (!mm) {
                    break;
                }
                item.code = journal;
                item.date = m[1];
                item.codeNumber = mm[1];
                item.pages = mm[2];
                item.url = url;
                if (acceptingBody) {
                    item.regulatoryBody = acceptingBody;
                }
                if (i === 0) {
                    item.attachments.push({url:url,title:title,mimeType:"text/html"});
                }
                item.complete();
            }
        } else {
            // This should also never happen
            continue;
        }
    }
	return false;
}
