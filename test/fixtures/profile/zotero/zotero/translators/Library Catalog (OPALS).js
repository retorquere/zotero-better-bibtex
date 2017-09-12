{
	"translatorID": "83501b8c-1033-4722-ae50-a77d67271ef7",
	"label": "Library Catalog (OPALS)",
	"creator": "Opals",
	"target": "^https?://[^?#&]+/bin/(search|pf|rs)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 250,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2014-08-26 04:06:03"
}


/*
Opals Translator
Copyright (C) 2014  Thai Pham

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

function detectWeb(doc, url) {
    var titles = getTitleList(doc);
    var count = titles.length;
    if (count == 1) return "book";
    else if (count > 1) return "multiple";
}

//==============================================================================

function doWeb(doc, url) {
    var titles = getTitleList(doc);
    var items = {};

    if (titles.length == 1) {
        scrape(titles[0].rid, url);
    } else if (titles.length > 1) {
        for (var i = 0; i < titles.length; i++) {
            items[titles[i].rid] = titles[i].title;
        }
        Zotero.selectItems(items, function (items) {
            if (!items) {
                return true;
            }
            for (var rid in items) {
                scrape(rid, url);
            }
        });
    }
}

//==============================================================================
function scrape(rid, url) {

    var marcurl = "/bin/ajax/getMarc?format=usmarc&rid=" + rid;
    var baseUrl = getUrlBase(url);
    Zotero.Utilities.HTTP.doGet(marcurl, function (text) {
        var translator = Zotero.loadTranslator("import");
        translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
        translator.setString(text);
        translator.setHandler("itemDone", function (obj, item) {
            // adding record URL
            item.attachments = [{
                url: baseUrl + "/bin/search/recDetailPage?rid=" + rid,
                title: "Library Catalog Entry Permalink",
                mimeType: "text/html",
                snapshot: false
            }];
            item.complete();
        });
        translator.translate();
    });

}
//==============================================================================
function getUrlBase(url) {
    var rs;
    if (rs = url.match(/(https?:\/\/.*?)\//)) {
        return rs[1];
    }
    return null;

}
//==============================================================================
function getTitleList(doc) {
    var items = [];
    var els = doc.getElementsByName("bib_rid");
    for (var i = 0; i < els.length; i++) {
        if (els[i].tagName == 'INPUT' && els[i].getAttribute('type') == 'checkbox') {
            var title = els[i].getAttribute("bib_title").trim();
            var rid = els[i].value.trim();
            if (rid && rid.search(/^[1-9][0-9]*$/) != -1 && title) {
                items.push({
                    rid: rid,
                    title: title
                });
            }
        }
    }

    return items;
}

/** BEGIN TEST CASES **/
var testCases = [{
    "type": "web",
    "url": "http://cogent.opalsinfo.net/bin/search/recDetailPage?rid=32857",
    "items": [{
        "itemType": "book",
        "creators": [{
            "firstName": "Edgar Allan",
            "lastName": "Poe",
            "creatorType": "author"
        }, {
            "firstName": "Philip",
            "lastName": "Pullman",
            "creatorType": "contributor"
        }],
        "notes": [{
            "note": "Includes bibliographical references and indexes"
        }, {
            "note": "Dreams -- The lake -- Sonnet-- to science -- [Alone] -- Introduction -- To Helen -- Israfel -- The Valley of unrest -- The city in the sea -- To one in paradise -- The coliseum -- The Haunted palace -- The conqueror worm -- Dream-land -- Eulalie -- The Raven -- [\"Deep in earth\"] -- To M.L.S. -- Ulalume, a ballad -- The bells -- To Helen [Whitman] -- A dream within a dream -- For Annie -- Eldorado -- To my mother -- Annabel Lee"
        }, {
            "note": "A collection of twenty-six poems by nineteenth-century American poet Edgar Allen Poe"
        }],
        "tags": [
            "Poetry",
            "American poetry",
            "Ravens",
            "Fantasy poetry, American"
        ],
        "seeAlso": [],
        "attachments": [{
            "url": "http://cogent.opalsinfo.net/bin/search/recDetailPage?rid=32857",
            "title": "Library Catalog Entry Permalink",
            "mimeType": "text/html",
            "snapshot": false
        }],
        "ISBN": "0439227135",
        "title": "The raven and other poems",
        "place": "New York",
        "publisher": "Scholastic",
        "date": "2000",
        "numPages": "73",
        "series": "Scholastic classics",
        "callNumber": "811 POE",
        "libraryCatalog": "Library Catalog (OPALS)"
    }]
}, {
    "type": "web",
    "url": "http://cogent.opalsinfo.net/bin/search/recDetailPage?rid=58224",
    "items": [{
        "itemType": "book",
        "creators": [{
            "firstName": "Chris",
            "lastName": "Oxlade",
            "creatorType": "author"
        }],
        "notes": [{
            "note": "Discusses the phenomenon of unidentified flying objects (UFOs), including notable sightings throughout history and possible explanations for them"
        }],
        "tags": [
            "Unidentified flying objects (UFOs)",
            "Sightings and encounters",
            "Science",
            "Miscellanea",
            "Curiosities and wonders"
        ],
        "seeAlso": [],
        "attachments": [{
            "url": "http://cogent.opalsinfo.net/bin/search/recDetailPage?rid=58224",
            "title": "Library Catalog Entry Permalink",
            "mimeType": "text/html",
            "snapshot": false
        }],
        "ISBN": "1575728060",
        "title": "The Mystery of UFOs",
        "edition": "ed",
        "place": "Chicago, IL",
        "publisher": "Heinemann Library",
        "date": "1999",
        "numPages": "32",
        "series": "Can science solve?",
        "callNumber": "001.942 OXL",
        "libraryCatalog": "Library Catalog (OPALS)"
    }]
}]
/** END TEST CASES **/
