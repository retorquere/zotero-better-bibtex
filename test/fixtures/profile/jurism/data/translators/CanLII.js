{
	"translatorID": "84799379-7bc5-4e55-9817-baf297d129fe",
	"label": "CanLII",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www\\.)?canlii\\.org/(en|fr)/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-09 20:00:57"
}

var canLiiRegexp = /https?:\/\/(?:www\.)?canlii\.org[^\/]*\/(?:en|fr)\/[^\/]+\/[^\/]+\/doc\/.+/;

function detectWeb(doc, url) {
	if (canLiiRegexp.test(url)) {
		return "case";
	} else {
		var aTags = doc.getElementsByTagName("a");
		for (var i = 0; i < aTags.length; i++) {
			if (canLiiRegexp.test(aTags[i].href)) {
				return "multiple";
			}
		}
	}
}


function scrape(doc, url) {

	var newItem = new Zotero.Item("case");
	var voliss = doc.getElementsByClassName('documentMeta-citation')[0].nextElementSibling;
	voliss = ZU.trimInternal(
		ZU.xpathText(voliss, './node()[not(self::script)]', null, '') // We technically only use ./text() parts, but this is less confusing
	);
	//Z.debug("voliss: ("+voliss+")")
	
	var casename = voliss.match(/.+?(?=\s*,)/)[0];
	newItem.caseName = newItem.title = casename;
	//Z.debug("casename: ("+casename+")");
	
	var court = voliss.match(/,\s*\d{4}\s*([A-Z]+)/);
	if (court) newItem.court = court[1];
	//Z.debug("court: ("+court+")");
	
	var reportvl = voliss.match(/\]\s*(\d+)/);
	if (reportvl) newItem.reporterVolume = reportvl[1];
	//Z.debug("reportvl: ("+reportvl+")");
	
	var reporter = voliss.match(/\]\s*\d+\s*([A-Z]+)/);
	if (reporter) newItem.reporter = reporter[1];
	//Z.debug("reporter: ("+reporter+")");
	
	var reporterpg = voliss.match(/(?:\]\s*\d+|,\s*\d{4})\s*[A-Z]+\s*(\d+)/);
	if (reporterpg) newItem.firstPage = reporterpg[1];
	//Z.debug("reporterpg: ("+reporterpg+")");
	
	newItem.dateDecided = ZU.xpathText(doc, '//table[contains(@class, "documentMeta")]//tr/td[contains(@class, "canlii-label") and contains(text(), "Date")]/following-sibling::td');
	newItem.docketNumber = ZU.xpathText(doc, '//table[contains(@class, "documentMeta")]//tr/td[contains(@class, "canlii-label") and (contains(text(), "Docket") or contains(text(), "Dossier"))]/following-sibling::td');
	var otherCitations = ZU.xpathText(doc, '//table[contains(@class, "documentMeta")]//tr/td[contains(@class, "canlii-label") and contains(text(), "Other citations")]/following-sibling::td');
	if (otherCitations) {
		newItem.notes.push({"note" : "Other Citations: " + ZU.trimInternal(otherCitations)});
	}
	
	var shortUrl = doc.getElementsByClassName('documentStaticUrl')[0];
	if(shortUrl) {
		newItem.url = shortUrl.textContent.trim();
	}

	// attach link to pdf version
	//Z.debug(url)
	var pdfurl = url.replace(/\.html(?:[?#].*)?/, ".pdf");
	newItem.attachments.push({
		url: pdfurl,
		title: "CanLII Full Text PDF",
		mimeType: "application/pdf"
	});
	newItem.attachments.push({
		document: doc,
		title: "CanLII Snapshot"
	});
	newItem.complete();
}

function doWeb(doc, url) {
	if (canLiiRegexp.test(url)) {
		scrape(doc, url);
	} else {
		var items = ZU.getItemArray(doc, doc, canLiiRegexp);
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://canlii.org/en/ca/scc/nav/date/2010.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.canlii.org/en/ca/scc/doc/2010/2010scc2/2010scc2.html",
		"items": [
			{
				"itemType": "case",
				"caseName": "MiningWatch Canada v. Canada (Fisheries and Oceans)",
				"creators": [],
				"dateDecided": "2010-01-21",
				"court": "SCC",
				"docketNumber": "32797",
				"firstPage": "6",
				"reporter": "SCR",
				"reporterVolume": "1",
				"url": "http://canlii.ca/t/27jmr",
				"attachments": [
					{
						"title": "CanLII Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "CanLII Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Other Citations: 397 NR 232; [2010] SCJ No 2 (QL); [2010] ACS no 2"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.canlii.org/en/ca/fct/doc/2011/2011fc119/2011fc119.html?searchUrlHash=AAAAAQAjU3V0dGllIHYuIENhbmFkYSAoQXR0b3JuZXkgR2VuZXJhbCkAAAAAAQ",
		"items": [
			{
				"itemType": "case",
				"caseName": "Suttie v. Canada (Attorney General)",
				"creators": [],
				"dateDecided": "2011-02-02",
				"court": "FC",
				"docketNumber": "T-1089-10",
				"firstPage": "119",
				"url": "http://canlii.ca/t/2flrk",
				"attachments": [
					{
						"title": "CanLII Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "CanLII Snapshot"
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
		"url": "http://canlii.org/fr/ca/csc/nav/date/2010.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.canlii.org/fr/ca/csc/doc/2010/2010csc2/2010csc2.html",
		"items": [
			{
				"itemType": "case",
				"caseName": "Mines Alerte Canada c. Canada (Pêches et Océans)",
				"creators": [],
				"dateDecided": "2010-01-21",
				"court": "CSC",
				"docketNumber": "32797",
				"firstPage": "6",
				"reporter": "RCS",
				"reporterVolume": "1",
				"url": "http://canlii.ca/t/27jms",
				"attachments": [
					{
						"title": "CanLII Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "CanLII Snapshot"
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
		"url": "http://www.canlii.org/fr/ca/cfpi/doc/2011/2011cf119/2011cf119.html?searchUrlHash=AAAAAQAjU3V0dGllIHYuIENhbmFkYSAoQXR0b3JuZXkgR2VuZXJhbCkAAAAAAQ",
		"items": [
			{
				"itemType": "case",
				"caseName": "Suttie c. Canada (Procureur Général)",
				"creators": [],
				"dateDecided": "2011-02-02",
				"court": "CF",
				"docketNumber": "T-1089-10",
				"firstPage": "119",
				"url": "http://canlii.ca/t/fks9z",
				"attachments": [
					{
						"title": "CanLII Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "CanLII Snapshot"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/