{
	"translatorID": "88915634-1af6-c134-0171-56fd198235ed",
	"label": "Library Catalog (Voyager)",
	"creator": "Simon Kornblith",
	"target": "Pwebrecon\\.cgi",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 250,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-08-26 04:12:55"
}

function detectWeb(doc, url) {
	var export_options = ZU.xpath(doc, '//form[@name="frm"]//*[@name="RD"]|//td/select[@name="RD"]');
	if (!export_options.length) return false;
	export_options = export_options[0];
	var i = 0
	while (i< export_options.length) {
		if (export_options[i].text == 'Latin1 MARC' || export_options[i].text == 'Raw MARC' || export_options[i].text == 'MARC 21' || export_options[i].text == 'MARC 8' || export_options[i].text == 'MARC-8' || export_options[i].text == 'UTF-8' || export_options[i].text == 'MARC (Unicode/UTF-8)' || export_options[i].text == 'MARC UTF-8' || export_options[i].text == 'UTF-8 MARC (Unicode)' || export_options[i].text == 'UTF8-Unicode' || export_options[i].text == 'MARC (non-Unicode/MARC-8)' || export_options[i].text == 'MARC communication format' || export_options[i].text == 'MARC Record') {
			// We have an exportable single record
			if (ZU.xpath(doc, '//form[@name="frm"]//*[@name="RC"]').length) {
				return "multiple";
			} else {
				return "book";
			}
		}
		i++;
	}
}

function doWeb(doc, url) {
	var postString = '';
	var form = ZU.xpath(doc, '//form[@name="frm"]');
	var newUri = form[0].action;
	var multiple = false;

	if (ZU.xpath(form, '//*[@name="RC"]').length) {
		multiple = true;

		var availableItems = new Object(); // Technically, associative arrays are objects
		var namespace = doc.documentElement.namespaceURI;
		var nsResolver = namespace ?
		function (prefix) {
			if (prefix == 'x') return namespace;
			else return null;
		} : null;

		// Require link to match this
		var tagRegexp = new RegExp();
		tagRegexp.compile('Pwebrecon\\.cgi\\?.*v1=[0-9]+\\&.*ti=');
		// Do not allow text to match this
		var rejectRegexp = new RegExp();
		rejectRegexp.compile('\[ [0-9]+ \]');

		var checkboxes = new Array();
		var urls = new Array();

		var tableRows = doc.evaluate('//form[@name="frm"]//table/tbody/tr[td/input[@type="checkbox" or @type="CHECKBOX"]]', doc, nsResolver, XPathResult.ANY_TYPE, null);

		// Go through table rows
		var tableRow;
		var i = 0;
		while (tableRow = tableRows.iterateNext()) {
			i++;
			// CHK is what we need to get it all as one file
			var input = doc.evaluate('./td/input[@name="CHK"]', tableRow, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			checkboxes[i] = input.value;
			var links = tableRow.getElementsByTagName("a");
			// Go through links
			for (var j = 0; j < links.length; j++) {
				if (tagRegexp.test(links[j].href)) {
					var text = links[j].textContent;
					if (text) {
						text = Zotero.Utilities.trimInternal(text);
						if (!rejectRegexp.test(text)) {
							if (availableItems[i]) {
								availableItems[i] += " " + text;
							} else {
								availableItems[i] = text;
							}
						}
					}
				}
			}
			// if no title, pull from second td
			if (!availableItems[i]) {
				availableItems[i] = Zotero.Utilities.trimInternal(doc.evaluate('./td[2]', tableRow, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent);
			}
		}

		var items = Zotero.selectItems(availableItems);
		if (!items) {
			return true;
		}

		// add arguments for items we need to grab
		for (var i in items) {
			postString += "CHK=" + checkboxes[i] + "&";
		}
	}

	var raw, unicode, latin1;

	for (var i = 0; i < form[0].elements.length; i++) {
		if (form[0].elements[i].type && form[0].elements[i].type.toLowerCase() == 'hidden') {
				postString += escape(form[0].elements[i].name) + '=' + escape(form[0].elements[i].value) + '&';
		}
	} 

	var export_options = ZU.xpath(form, '//select[@name="RD"]/option');
	for (var i = 0; i < export_options.length; i++) {
		if (export_options[i].text == 'Raw MARC' || export_options[i].text == 'MARC 8' || export_options[i].text == 'MARC-8' || export_options[i].text == 'MARC (non-Unicode/MARC-8)') {
			raw = i;
		}
		if (export_options[i].text == 'Latin1 MARC') {
			latin1 = i;
		} else if (export_options[i].text == 'UTF-8' || export_options[i].text == 'UTF-8 MARC (Unicode)' || export_options[i].text == 'UTF8-Unicode' || export_options[i].text == 'MARC UTF-8' || export_options[i].text == 'MARC (Unicode/UTF-8)' || export_options[i].text == 'MARC 21' || export_options[i].text == 'MARC communication format' || export_options[i].text == 'MARC Record') {
			unicode = i;
		}
	}

	var responseCharset = null;

	if (unicode) {
		var rd = unicode;
		responseCharset = 'UTF-8';
	} else if (latin1) {
		var rd = latin1;
		responseCharset = 'ISO-8859-1';
	} else if (raw) {
		var rd = raw;
	} else {
		return false;
	}
	//get permalink for LoC - getting this from MARC is going to be much harder
	if (url.length > 23 && url.substr(0, 23) == "http://catalog.loc.gov/") {
	  var LoCpermalink = ZU.xpathText(doc, '//tr/td/a[contains(@href, "http://lccn.loc.gov/")]');		
	}
	
	postString += 'RD=' + rd + '&MAILADDY=&SAVE=Press+to+SAVE+or+PRINT';
	
	// No idea why this doesn't work as post
	Zotero.Utilities.HTTP.doGet(newUri + '?' + postString, function (text) {
		// load translator for MARC
		var marc = Zotero.loadTranslator("import");
		marc.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
		marc.setString(text);
		//Z.debug(text)

		// if this is the LOC catalog, specify that in repository field
		if (url.length > 23 && url.substr(0, 23) == "http://catalog.loc.gov/") {
			marc.setHandler("itemDone", function (obj, item) {
				if (LoCpermalink){
					item.attachments.push({url: LoCpermalink, title: "Library of Congress Permalink", mimeType: "text/html", snapshot: false})
				}
				item.repository = "Library of Congress Catalog";
				item.complete();
			});
		} else {
			var domain = url.match(/https?:\/\/([^/]+)/);
			marc.setHandler("itemDone", function (obj, item) {
				item.repository = domain[1] + " Library Catalog";
				item.complete();
			});
		}
		marc.translate();
	}, null, responseCharset);
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://i-share.carli.illinois.edu/nby/cgi-bin/Pwebrecon.cgi?DB=local&v1=1&BBRecID=790862",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Francisco",
						"lastName": "Xarque",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "Brunet and Graesse both mention a map of Paraguay; this copy has a map of Chile with title: Tabula geocraphica [sic] regni Chile / studio et labore P. Procuratoris Chilensis Societatis Jesu In 3 books; the first two are biographies of Jesuits, Simon Mazeta and Francisco Diaz Taño, the 3rd deals with Jesuit missions in Paraguay Head and tail pieces"
					}
				],
				"tags": [
					"Masseta, Simon",
					"Cuellar y Mosquera, Gabriel de",
					"Missions",
					"Paraguay"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "Insignes missioneros de la Compañia de Jesus en la prouincia del Paraguay: estado presente de sus missiones en Tucuman, Paraguay, y Rio de la Plata, que comprehende su distrito",
				"place": "En Pamplona",
				"publisher": "Por Juan Micòn, Impressor",
				"date": "1687",
				"numPages": "24",
				"callNumber": "VAULT Ayer 1343 .J515 P211 X2 1687",
				"libraryCatalog": "i-share.carli.illinois.edu Library Catalog",
				"shortTitle": "Insignes missioneros de la Compañia de Jesus en la prouincia del Paraguay"
			}
		]
	}
]
/** END TEST CASES **/