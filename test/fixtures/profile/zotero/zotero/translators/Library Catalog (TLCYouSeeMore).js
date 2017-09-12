{
	"translatorID": "0f9fc2fc-306e-5204-1117-25bca009dffc",
	"label": "Library Catalog (TLC/YouSeeMore)",
	"creator": "Simon Kornblith",
	"target": "TLCScripts/interpac\\.dll\\?(.*LabelDisplay.*RecordNumber=[0-9]|Search|ItemTitles)",
	"minVersion": "1.0.0b3.r1",
	"maxVersion": "",
	"priority": 260,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-08-26 04:11:42"
}

/* other example here: http://ocl.tlcdelivers.com/TLCScripts/interpac.dll?LabelDisplay&LastResult=Search%26Config=ysm%26FormId=6588839%26Branch=,0,%26LimitsId=0%26StartIndex=0%26SearchField=7%26SearchType=1%26SearchData=food%26NotAddToHistory=1%26ItemsPerPage=30%26SortField=0%26PeriodLimit=-1%26SearchAvailableOnly=0&DataNumber=52182&RecordNumber=52182&SearchAvailableOnly=0&FormId=6588839&ItemField=1&Config=ysm&Branch=,0, 
but test won't work on that page */

function detectWeb(doc, url) {
	var detailRe = new RegExp("TLCScripts/interpac\.dll\?.*LabelDisplay.*RecordNumber=[0-9]");
	if (detailRe.test(doc.location.href)) {
		return "book";
	} else {
		return "multiple";
	}
}

function doWeb(doc, url) {
	var detailRe = new RegExp("TLCScripts/interpac\.dll\?.*LabelDisplay.*RecordNumber=[0-9]");
	var uri = doc.location.href;
	var newUris = new Array();

	if (detailRe.test(uri)) {
		newUris.push(uri.replace("LabelDisplay", "MARCDisplay"));
	} else {
		var items = Zotero.Utilities.getItemArray(doc, doc, 'TLCScripts/interpac\.dll\?.*LabelDisplay.*RecordNumber=[0-9]');
		items = Zotero.selectItems(items);

		if (!items) {
			return true;
		}

		for (var i in items) {
			newUris.push(i.replace("LabelDisplay", "MARCDisplay"));
		}
	}

	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
	translator.getTranslatorObject(function(marc) {
		Zotero.Utilities.processDocuments(newUris, function (newDoc) {
			var uri = newDoc.location.href;
			var record = new marc.record();
			var elmts = newDoc.evaluate('/html/body/table/tbody/tr[td[4]]', newDoc, null, XPathResult.ANY_TYPE, null);
			var tag, ind, content, elmt;
	
			while (elmt = elmts.iterateNext()) {
				tag = newDoc.evaluate('./td[2]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
				var inds = newDoc.evaluate('./td[3]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	
				tag = tag.replace(/[\r\n]/g, "");
				inds = inds.replace(/[\r\n\xA0]/g, "");
	
				var children = newDoc.evaluate('./td[4]//text()', elmt, null, XPathResult.ANY_TYPE, null);
				var subfield = children.iterateNext();
				var fieldContent = children.iterateNext();
	
				if (tag == "LDR") {
					record.leader = "00000" + subfield.nodeValue;
				} else {
					content = "";
					if (!fieldContent) {
						content = subfield.nodeValue;
					} else {
						while (subfield && fieldContent) {
							content += marc.subfieldDelimiter + subfield.nodeValue.substr(1, 1) + fieldContent.nodeValue;
							var subfield = children.iterateNext();
							var fieldContent = children.iterateNext();
						}
					}
	
					record.addField(tag, inds, content);
				}
			}
	
			var newItem = new Zotero.Item();
			record.translate(newItem);
	
			var domain = url.match(/https?:\/\/([^/]+)/);
			newItem.repository = domain[1] + " Library Catalog";
	
			newItem.complete();
		});
	});
} 
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://martinsburg.lib.wv.us/TLCScripts/interpac.dll?LabelDisplay&LastResult=Search%26Config=1ysm%26FormId=167489996%26Branch=,1,104,102,103,105,%26LimitsId=167358921%26StartIndex=0%26SearchField=16777216%26SearchType=1%26SearchData=argentina%26NotAddToHistory=1%26ItemsPerPage=20%26SortField=0%26PeriodLimit=-1%26SearchAvailableOnly=0&DataNumber=468041&RecordNumber=468041&SearchAvailableOnly=0&FormId=167489996&ItemField=1&Config=1ysm&Branch=,1,104,102,103,105,",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Jean F.",
						"lastName": "Blashfield",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Argentina"
				],
				"seeAlso": [],
				"attachments": [],
				"ISBN": "0516248723",
				"title": "Argentina",
				"place": "New York",
				"publisher": "Children's Press",
				"date": "2007",
				"numPages": "144",
				"series": "Cornerstones of freedom",
				"callNumber": "F2808.2 .B56 2007",
				"libraryCatalog": "martinsburg.lib.wv.us Library Catalog"
			}
		]
	}
]
/** END TEST CASES **/