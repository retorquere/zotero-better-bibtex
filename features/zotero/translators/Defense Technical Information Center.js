{
	"translatorID": "99be9976-2ff9-40df-96e8-82edfa79d9f3",
	"label": "Defense Technical Information Center",
	"creator": "Matt Burton",
	"target": "^https?://oai\\.dtic\\.mil/oai/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-01-09 15:36:32"
}

function detectWeb(doc, url) {
	if (doc.title.indexOf("DTIC OAI Index for") != -1) {
		return "multiple";
	} else if (url.indexOf("verb=getRecord") != -1) {
		return "report";
	}
}

function doWeb(doc, url) {
	var newURIs = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var links = doc.evaluate("//a/@href", doc, null, XPathResult.Abstract, null);
		var titles = doc.evaluate("//a/preceding::text()[1]", doc, null, XPathResult.Abstract, null);
		var items = new Object();
		var link, title;
		while (link = links.iterateNext(), title = titles.iterateNext()) {
			items[link.textContent.replace(/&metadataPrefix=html/, "&metadataPrefix=oai_dc")] = title.textContent;
		}

		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var url in items) {
				newURIs.push(url);
			}
			Zotero.Utilities.processDocuments(newURIs, scrape, function () {});
		});


	} else {
		newURIs = url.replace(/&metadataPrefix=html/, "&metadataPrefix=oai_dc");
		scrape(doc, newURIs);
	}
}

function scrape(doc, newURIs) {
	var pdfurl = ZU.xpathText(doc, '//p/a[contains(@href, "doc=GetTRDoc.pdf")]/@href')
	Zotero.Utilities.HTTP.doGet(newURIs, function (text) {
		//cut down the XML to something RDF readable and add required xmlns to the header
		text = text.replace(/\n/, "").replace(/.+<metadata>/, "").replace(/<\/metadata>.+/, "")
		text = text.replace(/<oai_dc[^>]+>/, '<?xml version="1.0" encoding="UTF-8"?><oai_dc:dc xmlns="http://purl.org/dc/elements/1.1/" xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dc="http://purl.org/dc/elements/1.1/"  xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">')
		//Z.debug(text)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("5e3ad958-ac79-463d-812b-a86a9235c28f");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			item.attachments = [{
				title: "DTIC Snapshot",
				document: doc,
				mimeType: "text/html"
			}];
			if (pdfurl) {
				item.attachments.push({
					url: pdfurl,
					title: "DTIC Full Text PDF",
					mimeType: "application/pdf"
				});
			}

			item.reportType = "";
			item.abstractNote = item.extra;
			item.extra = "";
			item.itemID = "";
			item.complete();
		});
		translator.getTranslatorObject(function (trans) {
			trans.defaultUnknownType = 'report';
			trans.doImport();
		});
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://oai.dtic.mil/oai/oai?&verb=getRecord&metadataPrefix=html&identifier=ADA466425",
		"items": [
			{
				"itemType": "report",
				"creators": [
					{
						"firstName": "Dennis M.",
						"lastName": "DeCoste",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Cybernetics",
					"*ARTIFICIAL INTELLIGENCE",
					"*SYSTEMS ANALYSIS",
					"*QUALITATIVE ANALYSIS",
					"MONITORING",
					"THESES",
					"*QUALITATIVE REASONING",
					"MEASUREMENT INTERPRETATION",
					"EXPLANATION",
					"*QUALITATIVE PHYSICS",
					"SYSTEMS BEHAVIOR",
					"PINTERP SPACE",
					"PINTERPS",
					"QUALITATIVE STATES",
					"ENVISIONMENTS",
					"FAULTY DATA",
					"INTERPRETATION CREDIBILITIES",
					"DURATION CONSTRAINTS",
					"DEPENDENCY PATHS",
					"COMPLEXITY ANALYSIS",
					"DATMI(DYNAMIC ACROSS-TIME MEASUREMENT INTERPRETATION)"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "DTIC Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "DTIC Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Dynamic Across-Time Measurement Interpretation: Maintaining Qualitative Understandings of Physical System Behavior",
				"publicationTitle": "DTIC",
				"rights": "Approved for public release; distribution is unlimited.",
				"date": "1990-02",
				"letterType": "Text",
				"manuscriptType": "Text",
				"mapType": "Text",
				"thesisType": "Text",
				"websiteType": "Text",
				"presentationType": "Text",
				"postType": "Text",
				"audioFileType": "Text",
				"language": "en",
				"abstractNote": "Incrementally maintaining a qualitative understanding of physical system behavior based on observations is crucial to real-time process monitoring, control, and diagnosis . This paper describes the DATMI theory for dynamically maintaining a pinterp-space, a concise representation of local and global interpretations consistent with the observations over time. Each interpretation signifies alternative paths of states in a qualitative envisionment . Representing a space of interpretations, instead of just a \"current best\" one, avoids the need for extensive backtracking to handle incomplete or faulty data. Domain-specific knowledge about state and transition probabilities can be used to maintain the best working interpretation as well. Domain-specific knowledge about durations of states and paths of states can also be used to further constrain the interpretation space. When all these constraints lead to inconsistencies, faulty-data hypotheses are generated and then tested by adjusting the pinterp-space. The time and space complexity of maintaining the pinterp-space is polynomial in the number of measurements and envisionment states.",
				"libraryCatalog": "Defense Technical Information Center",
				"shortTitle": "Dynamic Across-Time Measurement Interpretation"
			}
		]
	}
]
/** END TEST CASES **/