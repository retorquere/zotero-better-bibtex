{
	"translatorID": "04250fb1-0e44-4514-82b0-8663bacfe62b",
	"translatorType": 4,
	"label": "Free Law Reporter",
	"creator": "Frank Bennett",
	"target": "^https?://(?:www\\.)*freelawreporter\\.(?:org|com)/(?:index.php\\?.*q=|flrdoc.php\\?.*uuid=)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsib",
	"lastUpdated": "2012-10-12 01:38:22"
}

var urlCheck = function (url) {
    if (url.indexOf('?uuid=') > -1) {
        return "case";
    } else if (url.indexOf('/index.php?') > -1) {
        return "multiple";
    }
}

var detectWeb = function (doc, url) {
    // Icon should show only for search results and law cases
    return urlCheck(url);
}

var scrapeCase = function (doc, url) {
    // Preliminaries
    if (!url) {
        url = doc.location.href;
    }
    var elems = doc.getElementsByTagName("meta")
    // Scrape
    var Item = new Zotero.Item("case");
    for (var i = 0, ilen = elems.length; i < ilen; i += 1) {
        var name = elems[i].getAttribute("name");
        var content = elems[i].getAttribute("content");
        switch (name) {
        case "parties":
            Item.title = content;
            break;
        case "reporterseries":
            Item.reporter = content;
            break;
        case "decisiondate":
            Item.dateDecided = content;
            break;
        case "docketnumber":
            Item.docketNumber = content.replace(/^No.*\s+/, "").replace(/\.$/, "");
            break;
        case "jurisdiction":
            var jurisdiction = jurisdiction_names[content];
            if (!jurisdiction) {
                jurisdiction = content;
            }
            Item.extra = "{:jurisdiction:" + jurisdiction + "}";
            break;
        case "courtname":
            Item.court = content.replace(/\.$/,"");
            break;
        case "citation":
            var m = content.match(/([0-9]+).*?([0-9]+)/);
            if (m) {
                Item.reporterVolume = m[1];
                Item.firstPage = m[2];
            }
            break;
        default:
            break;
        }
    }
    if (!Item.extra) {
        Item.extra = "{:jurisdiction:us}"
    }
    Item.url = url;
    var bodies = doc.getElementsByClassName('grid_12');
    var heads = doc.getElementsByTagName("head");
    if (heads && bodies) {
        var head = heads[0];
        var body = bodies[0];
        var headAndBody = [head,body];
        var stylesheet = "";
        for (var i = 0, ilen = 2; i < ilen; i += 1) {
            var sheets = headAndBody[i].getElementsByTagName("link");
            for (var j = 0, jlen = sheets.length; j < jlen; j += 1) {
                var sheet = sheets[j];
                if (sheet.getAttribute("type") === "text/css") {
                    var src = ZU.retrieveSource(sheet.getAttribute("href"));
                    // Styling for spoofed inner structure
                    if (i === 1) {
                        src = src.replace("html", "div.html-spoof", "g").replace("body", "div.body-spoof", "g");
                    }
                    stylesheet += src;
                }
            }
        }
        var stylesheetnode = doc.createElement("style");
        stylesheetnode.setAttribute("type", "text/css");
        var stylesheettext = doc.createTextNode(stylesheet);
        stylesheetnode.appendChild(stylesheettext);
        head.appendChild(stylesheetnode);

        // Spoof inner structure
        // - get children of inner body tag
        var html_div = doc.createElement("div");
        html_div.setAttribute("class", "html-spoof");
        var body_div = doc.createElement("div");
        body_div.setAttribute("class", "body-spoof");
        html_div.appendChild(body_div)
        body_div.appendChild(body.cloneNode(true));
        var extract = Zotero.Utilities.composeDoc(doc, head, html_div);
        var attachment = {
            title:"CALI Free Law Reporter transcript",
            document: extract,
            snapshot:true
        };
        Item.attachments.push(attachment);
    }
    // Finalise
    Item.complete();
}

function doWeb(doc, url) {
    if (urlCheck(url) === "case") {    
        scrapeCase(doc, url);
    } else {
        var results = ZU.xpath(doc,'//h5/a');
        var items = new Object();
        var docUrl;
        for(var i=0, n=results.length; i<n; i++) {
            docUrl = "http://www.freelawreporter/" + results[i].getAttribute('href');
            items[docUrl] = results[i].textContent;
        }
        Zotero.selectItems(items, function(selectedItems) {
            if(!selectedItems) {
                return true;
            }
            for (var url in selectedItems) {
                ZU.processDocuments(url, function(doc, url) {
                    scrapeCase(doc, url);
                });
            }
        });
    }
}

/*
 * Jurisdiction values
 */
var jurisdiction_names = {
  "Mississippi": "us;ms", 
  "Iowa": "us;ia", 
  "Oklahoma": "us;ok", 
  "Wyoming": "us;wy", 
  "Illinois": "us;il", 
  "North Carolina": "us;nc", 
  "Georgia": "us;ga", 
  "Arkansas": "us;ar", 
  "New Mexico": "us;nm", 
  "Indiana": "us;in", 
  "Maryland": "us;md", 
  "Louisiana": "us;la", 
  "Texas": "us;tx", 
  "Arizona": "us;az", 
  "Wisconsin": "us;wi", 
  "Michigan": "us;mi", 
  "Kansas": "us;ks", 
  "Utah": "us;ut", 
  "Virginia": "us;va", 
  "Oregon": "us;or", 
  "Connecticut": "us;ct", 
  "District of Columbia": "us;dc", 
  "New Hampshire": "us;nh", 
  "Massachusetts": "us;ma", 
  "Puerto Rico": "us;pr", 
  "South Carolina": "us;sc", 
  "California": "us;ca", 
  "Vermont": "us;vt", 
  "Delaware": "us;de", 
  "North Dakota": "us;nd", 
  "Pennsylvania": "us;pa", 
  "West Virginia": "us;wv", 
  "Florida": "us;fl", 
  "Alaska": "us;ak", 
  "Kentucky": "us;ky", 
  "Hawaii": "us;hi", 
  "Nebraska": "us;ne", 
  "Ohio": "us;oh", 
  "Alabama": "us;al", 
  "Rhode Island": "us;ri", 
  "South Dakota": "us;sd", 
  "Colorado": "us;co", 
  "Idaho": "us;id", 
  "New Jersey": "us;nj", 
  "Minnisota": "us;mn", 
  "Washington": "us;wa", 
  "New York": "us;ny", 
  "Tennessee": "us;tn", 
  "Montana": "us;mo", 
  "Nevada": "us;nv", 
  "Maine": "us;me"
}
