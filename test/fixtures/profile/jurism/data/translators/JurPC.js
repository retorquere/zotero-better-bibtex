{
	"translatorID": "b662c6eb-e478-46bd- bad4-23cdfd0c9d67",
	"label": "JurPC",
	"creator": "Oliver Vivell and Michael Berkowitz",
	"target": "^https?://www\\.jurpc\\.de/jurpc/show\\?id=",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-01-02 18:03:03"
}

function detectWeb(doc, url) {
	//prevent Zotero from throwing an error here
	var firstLine =  ZU.xpathText(doc, '//h2[1]');
	if (firstLine.indexOf("Urteil vom") != -1 || firstLine.indexOf("Beschluss vom")!=-1) {
		return "case";
	}
	else {
		return "journalArticle";
	}
}

function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "journalArticle") {
		// Aufsatz gefunden
		var item = new Zotero.Item('journalArticle');
		
		// Authors and title are in h2-elements	
		var information = ZU.xpath(doc, '//h2');
		
		var aus = information[0].textContent.split("/");
		for (var i=0; i< aus.length ; i++) {
			aus[i] = aus[i].replace(/\*/, "").trim();
			item.creators.push(ZU.cleanAuthor(aus[i], "author"));
		}
		
		item.title = ZU.trimInternal(information[1].textContent);
		
		var webdoktext = ZU.xpathText(doc, '//h3');
		
		var year = webdoktext.match(/\/(\d{4}),/);
		var webdok = webdoktext.match(/Dok. (\d+)\//);
		
		if (year) item.year = year[1];
		
		if (webdok && year) {
			item.volume =  "WebDok " + webdok[1] + "/" + year[1];
		}
		
		var doi = ZU.xpathText(doc, '//span[@class="resultinfo left"]')
		if (doi != null) {
			item.DOI = ZU.cleanDOI(doi);
		}
		
		item.journal = "JurPC";
		item.url = url;
		item.language = "de-DE";
		
		item.attachments = [{
			title: "JurPC Snapshot",
			document: doc
		}];
		
		item.complete();
	} else {
		//Case
		var item = new Zotero.Item('case');
		
		// all information about the case are stored in h2-elements.
		var information = doc.getElementsByTagName('h2');
		var caseInformation = [];
		for (var i=0; i<information.length; i++) {
			caseInformation[i] = information[i].textContent;
		}
		
		// does the first row contain court, type of decision and date? Then clean up data!
		var i = caseInformation[0].indexOf("Urteil vom");
		if (i == -1) i = caseInformation[0].indexOf("Beschluss vom")
		if (i != -1) {
			caseInformation.splice(1, 0, caseInformation[0].substr(i));
			caseInformation[0] = caseInformation[0].substring(0, i);
		}
		
		item.title = caseInformation[3];
		item.court = caseInformation[0];
		item.docketNumber = caseInformation[2];
		
		item.reporter = "JurPC WebDok";
		var cite = ZU.xpathText(doc, '//h3');
		var year = cite.match(/\/(\d{4})/);
		var webdok = cite.match(/Dok. (\d+)\//);
		if (webdok && year) {
			item.reporterVolume =  " " + webdok[1] + "/" + year[1];
		}
		
		item.url = url;
		
		var date = caseInformation[1].match(/\b(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\b/);
		if (date) {
			item.dateDecided = date[3] + "-" + date[2] + "-" + date[1];
		}
		
		// store type of decision
		if (/Beschluss./i.test(caseInformation[1])) {
			item.extra = "{:genre: Beschl.}";
		}
		else if (/Urteil/i.test(caseInformation[1])) {
				item.extra = "{:genre: Urt.}";
		}
		
		var doi = ZU.xpathText(doc, '//span[@class="resultinfo left"]')
		if (doi) {
			item.DOI = ZU.cleanDOI(doi);
		}
		
		item.language = "de-DE";
		
		item.attachments = [{
			title: "JurPC Snapshot",
			document: doc
		}];
		
		item.complete();
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.jurpc.de/jurpc/show?id=20110132",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Die datenschutzrechtliche Einwilligung des Beschäftigten",
				"creators": [
					{
						"firstName": "Johannes",
						"lastName": "Habermalz",
						"creatorType": "author"
					}
				],
				"DOI": "10.7328/jurpcb/2011268130",
				"language": "de-DE",
				"libraryCatalog": "JurPC",
				"url": "http://www.jurpc.de/jurpc/show?id=20110132",
				"volume": "WebDok 132/2011",
				"attachments": [
					{
						"title": "JurPC Snapshot"
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
		"url": "http://www.jurpc.de/jurpc/show?id=20000220",
		"items": [
			{
				"itemType": "case",
				"caseName": "OEM-Version",
				"creators": [],
				"dateDecided": "2000-07-06",
				"court": "BGH",
				"docketNumber": "I ZR 244/97",
				"extra": "{:genre: Urt.}",
				"language": "de-DE",
				"reporter": "JurPC WebDok",
				"reporterVolume": "220/2000",
				"url": "http://www.jurpc.de/jurpc/show?id=20000220",
				"attachments": [
					{
						"title": "JurPC Snapshot"
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
		"url": "http://www.jurpc.de/jurpc/show?id=20140193",
		"items": [
			{
				"itemType": "case",
				"caseName": "Zur Haftung des Domainregistrars für Domaininhalte",
				"creators": [],
				"dateDecided": "2014-10-22",
				"court": "Saarländisches Oberlandesgericht",
				"docketNumber": "1 U 25/14",
				"extra": "{:genre: Urt.}",
				"language": "de-DE",
				"reporter": "JurPC WebDok",
				"reporterVolume": "193/2014",
				"url": "http://www.jurpc.de/jurpc/show?id=20140193",
				"attachments": [
					{
						"title": "JurPC Snapshot"
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
		"url": "http://www.jurpc.de/jurpc/show?id=20140165",
		"items": [
			{
				"itemType": "case",
				"caseName": "Deus Ex",
				"creators": [],
				"dateDecided": "2014-05-15",
				"court": "BGH",
				"docketNumber": "I ZB 71/13",
				"extra": "{:genre: Beschl.}",
				"language": "de-DE",
				"reporter": "JurPC WebDok",
				"reporterVolume": "165/2014",
				"url": "http://www.jurpc.de/jurpc/show?id=20140165",
				"attachments": [
					{
						"title": "JurPC Snapshot"
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
		"url": "http://www.jurpc.de/jurpc/show?id=20140194",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Tagungsbericht über den 3. IT-Rechtstag in Frankfurt am Main",
				"creators": [
					{
						"firstName": "Wolfgang",
						"lastName": "Kuntz",
						"creatorType": "author"
					}
				],
				"DOI": "10.7328/jurpcb20142912190",
				"language": "de-DE",
				"libraryCatalog": "JurPC",
				"url": "http://www.jurpc.de/jurpc/show?id=20140194",
				"volume": "WebDok 194/2014",
				"attachments": [
					{
						"title": "JurPC Snapshot"
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