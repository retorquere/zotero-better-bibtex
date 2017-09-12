{
	"translatorID": "661fc39a-2500-4710-8285-2d67ddc00a69",
	"label": "Artefacts Canada",
	"creator": "Adam Crymble",
	"target": "^https?://(www\\.)?pro\\.rcip-chin\\.gc\\.ca",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-09-16 00:25:18"
}

function detectWeb(doc, url) {
	var multi1 = '';
	var single1 = '';
	
	if (doc.evaluate('//div[@id="mainContent"]/table/tbody/tr/td[1]/h1', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		
		multi1 = doc.evaluate('//div[@id="mainContent"]/table/tbody/tr/td[1]/h1', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	}
	
	var xpath = '//tbody/tr[1]/td[2]/span';
	if (doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		single1 = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	}
	
	if (multi1.match("Search Results") || multi1.match("Résultats de recherche")) {
		return "multiple";
	} else if (single1.match("Document") || single1.match("Enregistrement")) {
		return "artwork";
	}
	
}

function associateData (newItem, dataTags, field, zoteroField) {
	if (dataTags[field]) {
		newItem[zoteroField] = dataTags[field];
	}
}

function scrape(doc, url) {

	var dataTags = new Object();
	var tagsContent = new Array();
	var fieldTitle;
	
	var newItem = new Zotero.Item("artwork");

	var headers = doc.evaluate('//td[1][@class="leftResTitle"]', doc, null, XPathResult.ANY_TYPE, null);
	var contents = doc.evaluate('//td[2][@class="pageText"]', doc, null, XPathResult.ANY_TYPE, null);
	
	while (fieldTitle = headers.iterateNext()) {
		fieldTitle = fieldTitle.textContent.replace(/\s+/g, '');
		if (fieldTitle == "Titre:") {
			fieldTitle = "Title:";
		} else if (fieldTitle == "Nomdel'objet:") {
			fieldTitle = "NameofObject:";
		} else if (fieldTitle == "Sujetouimage:") {
			fieldTitle = "Subject/Image:";
		} else if (fieldTitle == "Numérod'accession:") {
			fieldTitle = "AccessionNumber:";
		} else if (fieldTitle == "Artisteouartisan:") {
			fieldTitle = "Artist/Maker:";
		} else if (fieldTitle == "Fabricant:") {
			fieldTitle = "Manufacturer:";
		}
		
		dataTags[fieldTitle] = contents.iterateNext().textContent.replace(/^\s*|\s*$/g, '')
	}

	Zotero.debug(dataTags);

	if (dataTags["Artist/Maker:"]) {
		if (dataTags["Artist/Maker:"].match(", ")) {
			var authors = dataTags["Artist/Maker:"].split(", ");
			authors = authors[0] + ' ' + authors[1];
			newItem.creators.push(authors, "creator");	
		} else {
			newItem.creators.push(dataTags["Artist/Make:"], "creator");	
		}
	}
	
	if (dataTags["Manufacturer:"]) {
		newItem.creators.push(Zotero.Utilities.cleanAuthor(dataTags["Manufacturer:"], "creator"));	
	}
	
	if (dataTags["AccessionNumber:"]) {
		newItem.locInArchive = "Accession Number: " + dataTags["AccessionNumber:"];
	}
	
	if (dataTags["Subject/Image:"]) {
		if (dataTags["Subject/Image:"].match(/\n/)) {
			var subjects = dataTags["Subject/Image:"].split(/\n/);
			for (var i = 0; i < subjects.length; i++) {
				newItem.tags[i] = subjects[i];
			}
		} else {
			newItem.tags[0] = dataTags["Subject/Image:"].match(/\n/);
		}
	}
	
	if (dataTags["Title:"]) {
		associateData (newItem, dataTags, "Title:", "title");
		associateData (newItem, dataTags, "NameofObject:", "medium");
	} else if (dataTags["NameofObject:"]) {
		associateData (newItem, dataTags, "NameofObject:", "title");
	} else {
		newItem.title = "No Title Found";
	}
	
	associateData (newItem, dataTags, "LatestProductionDate:", "date");
	associateData (newItem, dataTags, "Datedefindeproduction:", "date");
	
	associateData (newItem, dataTags, "Institution:", "repository");
	associateData (newItem, dataTags, "Établissement:", "repository");
	
	associateData (newItem, dataTags, "Description:", "description");
	
	associateData (newItem, dataTags, "Medium:", "medium");
	associateData (newItem, dataTags, "Médium:", "medium");
	
	newItem.url = doc.location.href;
	newItem.complete();
}

function doWeb(doc, url) {
	
	var articles = new Array();
	
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		
		var titles = doc.evaluate('//tr[1]/td[2][@class="pageText"]', doc, null, XPathResult.ANY_TYPE, null);
		var links = doc.evaluate('//td/a[contains(@class, "moreInfoink")]', doc, null, XPathResult.ANY_TYPE, null);
		
		var next_title;
		while (next_title = titles.iterateNext()) {
		
			items[links.iterateNext().href] = next_title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape, function (){});
		});
	} else {
		scrape(doc, url)
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.pro.rcip-chin.gc.ca/bd-dl/artefacts-eng.jsp?emu=en.artefacts:/Proxac/ws/human/user/www/ResultSet&w=NATIVE(%27(WAT%20ph%20is%20%27%27montreal%27%27%20or%20WHAIR%20ph%20is%20%27%27montreal%27%27%20or%20WHOO%20ph%20is%20%27%27montreal%27%27%20or%20WEN%20ph%20is%20%27%27montreal%27%27%20or%20HOUU%20ph%20is%20%27%27montreal%27%27)%27)&upp=0&currLang=English",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.pro.rcip-chin.gc.ca/bd-dl/artefacts-eng.jsp?emu=en.artefacts:/Proxac/ws/human/user/www/Record;jsessionid=hb7jhiecd1&upp=0&m=13&w=NATIVE%28%27%28WAT%20ph%20is%20%27%27montreal%27%27%20or%20WHAIR%20ph%20is%20%27%27montreal%27%27%20or%20WHOO%20ph%20is%20%27%27montreal%27%27%20or%20WEN%20ph%20is%20%27%27montreal%27%27%20or%20HOUU%20ph%20is%20%27%27montreal%27%27%29%27%29",
		"items": [
			{
				"itemType": "artwork",
				"creators": [
					{
						"firstName": "",
						"lastName": "Bourbon",
						"creatorType": "creator"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"locInArchive": "Accession Number: 2005.385",
				"title": "Canada 1976",
				"medium": "porte-clefs",
				"date": "1976",
				"description": "Porte-clefs en métal doré décoré d'un médaillon en acrylique clair présentant le logo des Jeux olympiques de Montréal.",
				"url": "http://www.pro.rcip-chin.gc.ca/bd-dl/artefacts-eng.jsp?emu=en.artefacts:/Proxac/ws/human/user/www/Record;jsessionid=hb7jhiecd1&upp=0&m=13&w=NATIVE%28%27%28WAT%20ph%20is%20%27%27montreal%27%27%20or%20WHAIR%20ph%20is%20%27%27montreal%27%27%20or%20WHOO%20ph%20is%20%27%27montreal%27%27%20or%20WEN%20ph%20is%20%27%27montreal%27%27%20or%20HOUU%20ph%20is%20%27%27montreal%27%27%29%27%29",
				"libraryCatalog": "Centre d'histoire de Montréal",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/