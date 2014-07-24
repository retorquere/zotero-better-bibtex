{
	"translatorID": "84799379-7bc5-4e55-9817-baf297d129fe",
	"label": "CanLII",
	"creator": "Sebastian Karcher",
	"target": "^https?://(?:www\\.)?canlii\\.org/(?:en|fr)/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-06-11 01:31:00"
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
	
	var dateDocket = doc.getElementsByClassName('canlii-label')[0];
	if (dateDocket && dateDocket.nextElementSibling) {
		dateDocket = ZU.trimInternal(dateDocket.nextElementSibling.textContent);
		var date = dateDocket.match(/\d{4}-\d{2}-\d{2}/);
		if (date) newItem.dateDecided = date[0];
		var docket = ZU.trimInternal(dateDocket).match(/\(\s*(?:Docket|Dossier)\s*:\s*(.+?)\s*\)/);
		if (docket) newItem.docketNumber = docket[1];
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
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "CanLII Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "CanLII Snapshot"
					}
				],
				"caseName": "MiningWatch Canada v. Canada (Fisheries and Oceans)",
				"court": "SCC",
				"reporterVolume": "1",
				"reporter": "SCR",
				"firstPage": "6",
				"dateDecided": "2010-01-21",
				"docketNumber": "32797",
				"url": "http://canlii.ca/t/27jmr"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.canlii.org/en/ca/fct/doc/2011/2011fc119/2011fc119.html?searchUrlHash=AAAAAQAjU3V0dGllIHYuIENhbmFkYSAoQXR0b3JuZXkgR2VuZXJhbCkAAAAAAQ",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "CanLII Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "CanLII Snapshot"
					}
				],
				"caseName": "Suttie v. Canada (Attorney General)",
				"court": "FC",
				"firstPage": "119",
				"dateDecided": "2011-02-02",
				"docketNumber": "T-1089-10",
				"url": "http://canlii.ca/t/2flrk"
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
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "CanLII Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "CanLII Snapshot"
					}
				],
				"caseName": "Mines Alerte Canada c. Canada (Pêches et Océans)",
				"court": "CSC",
				"reporterVolume": "1",
				"reporter": "RCS",
				"firstPage": "6",
				"dateDecided": "2010-01-21",
				"docketNumber": "32797",
				"url": "http://canlii.ca/t/27jms"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.canlii.org/fr/ca/cfpi/doc/2011/2011cf119/2011cf119.html?searchUrlHash=AAAAAQAjU3V0dGllIHYuIENhbmFkYSAoQXR0b3JuZXkgR2VuZXJhbCkAAAAAAQ",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "CanLII Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "CanLII Snapshot"
					}
				],
				"caseName": "Suttie c. Canada (Procureur Général)",
				"court": "CF",
				"firstPage": "119",
				"dateDecided": "2011-02-02",
				"docketNumber": "T-1089-10",
				"url": "http://canlii.ca/t/fks9z"
			}
		]
	}
]
/** END TEST CASES **/