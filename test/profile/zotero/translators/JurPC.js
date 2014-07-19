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
	"lastUpdated": "2013-01-09 15:36:32"
}

function detectWeb(doc, url) {
	//prevent Zotero from throwing an error here
		if (ZU.xpathText(doc, '//h2[1]').indexOf("Urteil vom")!=-1){
				return "case";
		}
		else{
				return "journalArticle";
		}
	}

function doWeb(doc, url) {

		var articles = new Array();

		if (detectWeb(doc, url) == "journalArticle") {

				// Aufsatz gefunden

				//Zotero.debug("Ok, we have an JurPC Article");
				var authors = '//h2[1]';
				var title = '//h2[2]';
				var webdoktext = '//h3';
				var authors = ZU.xpathText(doc, authors);
				var title = ZU.xpathText(doc, title);

				var cite = ZU.xpathText(doc, webdoktext);
				//Zotero.debug(doctype);
				 //Zotero.debug(webdoktext);
				var year = cite.match(/\/(\d{4}),/)[1];

				//Get Year & WebDok Number from Url
				var webdok = cite.match(/Dok. (\d+)\//)[1];
				var webabs = cite.match(/Abs.\s*[\d\-\s]+/)[0].trim();
				
				var newArticle = new Zotero.Item('journalArticle');

				newArticle.title = title;
				newArticle.journal = "JurPC";
				newArticle.journalAbbreviation = "JurPC";
				newArticle.year = year;
				newArticle.volume =  "WebDok " + webdok + "/" + year;
				newArticle.pages = webabs ;
				newArticle.url = url;
				newArticle.language = "de-DE";
				newArticle.attachments = [{document: doc, title: "JurPC SNapshot", mimeType: "text/html"}];
				var aus = authors.split("/");
				for (var i=0; i< aus.length ; i++) {
						aus[i] = aus[i].replace(/\*/, "").trim();
						newArticle.creators.push(Zotero.Utilities.cleanAuthor(aus[i], "author"));
				}
				newArticle.complete();
		} else {
				//Case

				//Zotero.debug("Ok, we have an JurPC Case");
				var authors = '//h2[1]';
				var docNumber = '//h2[2]';
				var title = '//h2[3]';
				var webdoktext = '//h3';
				var authors = ZU.xpathText(doc, authors);
				var title = ZU.xpathText(doc, title);

				var cite = ZU.xpathText(doc, webdoktext);
				//Zotero.debug(doctype);
				 //Zotero.debug(webdoktext);
				var year = cite.match(/\/(\d{4}),/)[1];
				var docNumber = ZU.xpathText(doc, docNumber)
				var webdok = cite.match(/Dok. (\d+)\//)[1];
				var webabs = cite.match(/Abs.\s*[\d\-\s]+/)[0].trim();
				
				var newArticle = new Zotero.Item('case');

				newArticle.title = title;
				newArticle.caseName = title;
				newArticle.docketNumber = docNumber;
				newArticle.volume =  "JurPC WebDok " + webdok + "/" + year;
				newArticle.pages = webabs ;
				newArticle.url = url;
				var aus = authors.split("Urteil vom");
				newArticle.court = aus[0];
				if (aus[1]) newArticle.date = aus[1];
				else newArticle.date = year;
				newArticle.language = "de-DE";
				newArticle.attachments = [{document: doc, title: "JurPC SNapshot", mimeType: "text/html"}];
				newArticle.complete();
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
				"creators": [
					{
						"firstName": "Johannes",
						"lastName": "Habermalz",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "JurPC SNapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Die datenschutzrechtliche Einwilligung des Beschäftigten",
				"journal": "JurPC",
				"journalAbbreviation": "JurPC",
				"year": "2011",
				"volume": "WebDok 132/2011",
				"pages": "Abs. 1 - 92",
				"url": "http://www.jurpc.de/jurpc/show?id=20110132",
				"language": "de-DE",
				"libraryCatalog": "JurPC",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.jurpc.de/jurpc/show?id=20000220",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "JurPC SNapshot",
						"mimeType": "text/html"
					}
				],
				"title": "OEM-Version",
				"caseName": "OEM-Version",
				"docketNumber": "I ZR 244/97",
				"volume": "JurPC WebDok 220/2000",
				"pages": "Abs. 1 - 36",
				"url": "http://www.jurpc.de/jurpc/show?id=20000220",
				"court": "BGH",
				"date": "06.07.2000",
				"language": "de-DE",
				"libraryCatalog": "JurPC",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/