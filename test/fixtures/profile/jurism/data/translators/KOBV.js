{
	"translatorID": "fef07360-ee97-4f67-b022-6f64d5ec0c25",
	"label": "KOBV",
	"creator": "Gunar Maiwald",
	"target": "^https?://vs13\\.kobv\\.de/V/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2013-02-26 12:53:22"
}

function detectWeb(doc, url) {
	if (doc.evaluate('//tr /td[@class="no_wrap_center"]/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	} else if (doc.evaluate('//tr/th[@class="no_wrap"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "book";
	}
}

function scrape(doc) {
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
	var marc = translator.getTranslatorObject(function (marc) {

		var xpath;
		if (doc.title.match("Freie Universität Berlin")) {
			xpath = '//li/a[@title="Ansicht des Originalformats"]';
		} else if (doc.title.match("KOBV")) {
			xpath = '//li/a[@title="Ansicht des bibliothekarischen Formats"]';
		} else if (doc.title.match("UB der HU Berlin")) {
			xpath = '//li/a[@title="Ansicht des Originalformats"]';
		} else if (doc.title.match("^MetaLib")) {
			xpath = '//li/a[@title="Ansicht des Originalformats"]';
		}
		var hrefs = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
		var href;

		while (href = hrefs.iterateNext()) {
			var url = href.getAttribute("href");
			url += "&format=005";

			Zotero.Utilities.processDocuments([url], function (newDoc) {
				var record = new marc.record();
				var xpath = '//table//tr';
				var elmts = newDoc.evaluate(xpath, newDoc, null, XPathResult.ANY_TYPE, null);
				var elmt;

				while (elmt = elmts.iterateNext()) {
					var field = Zotero.Utilities.trimInternal(newDoc.evaluate('./td[1]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
					var value = Zotero.Utilities.trimInternal(newDoc.evaluate('./td[2]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
					value = value.replace(/\|([a-z]) /g, marc.subfieldDelimiter + "$1").replace(/[\<\>]/g, "");
					var code = field.substring(0, 3);
					var ind = field.substr(3);

					// QnD for Authors:
					if (code == "100" && ind == "11" && value.match(marc.subfieldDelimiter + "b")) {
						var values = value.split(marc.subfieldDelimiter);
						var forename = values[1].substr(1);
						var surname = values[2].substr(1);
						value = marc.subfieldDelimiter + "a" + surname + ", " + forename;
						ind = 1;
					}
					record.addField(code, ind, value);
				}

				var newItem = new Zotero.Item();
				record.translate(newItem);
				newItem.complete();

			}, function () {
				Zotero.done();
			});
			Zotero.wait();
		}
	});

}


function doWeb(doc, url) {
	var xpath1 = '//table/tbody/tr[td[@class="no_wrap_center"]/a]';
	var xpath2 = '//table/tbody/tr/th[@class="no_wrap"]';
	var newUrls = new Array();
	var title;
	var url;
	var items = {};
	if (doc.evaluate(xpath1, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var resultrows = ZU.xpath(doc, xpath1)
			for (var i in resultrows){
			 	title = ZU.xpathText(resultrows[i], './td[4]');
			 	url  = ZU.xpathText(resultrows[i], './td/a[contains(@href, "http://vs13.kobv.de")  and contains(@href, "format=999")]/@href');
			 	items[url] = title;
			}
		
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				newUrls.push(i);
			}
			Zotero.Utilities.processDocuments(newUrls, scrape);
		});
	} else if (doc.evaluate(xpath2, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		scrape(doc, url)
	}
}

/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/