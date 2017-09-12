{
	"translatorID": "fe39e97d-7397-4f3f-a5f3-396a1a79213c",
	"label": "OpenJudis - Indian Supreme Court cases",
	"creator": "Prashant Iyengar and Michael Berkowitz",
	"target": "^https?://(www\\.)?openarchive\\.in/(judis|newcases)",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2015-06-02 21:03:02"
}

function detectWeb(doc, url) {
	if (doc.evaluate('//div[@id="footer"]/dl/dt/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	} else if (url.match(/\d+\.htm/)) {
		return "case";
	}
}

function regexMeta(stuff, item) {	
		if (stuff) {
				if (stuff[0] == "Origlink") {
			item.source = stuff[1].split(/\s+/)[0];
			}
		if (stuff[0] == "Acts") {
			if (stuff[1].indexOf("|")!=-0) {
				echts=stuff[1].split(" | ");
				for (i=0;i<echts.length;i++) {
					item.tags.push(echts[i]);
				}
				} else {
					item.tags.push(stuff[1]);
				}
			}
		if (stuff[0] == "Citations" && stuff[1].length > 1) {
			item.reporter=stuff[1];
		}
		if (stuff[0] == "Judges") {
			if (stuff[1].indexOf(";")!=-0) {
				jedges=stuff[1].split(" ; ");
				for (i=0;i<jedges.length;i++) {
					jedges[i] = ZU.capitalizeTitle(jedges[i])
		   				item.creators.push(Zotero.Utilities.cleanAuthor(jedges[i], "author"));
					}
				} else {
					stuff[1] = ZU.capitalizeTitle(stuff[1])
					item.creators.push(Zotero.Utilities.cleanAuthor(stuff[1], "author"));
				}
		}
			if (stuff[0] == "Jday") {
		   		item.dateDecided= stuff[1];
		}
	}
}



function doWeb(doc, url) {
	var arts = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = Zotero.Utilities.getItemArray(doc, doc, "^https?:\/\/openarchive\.in\/[^/]+\/[0-9]+.htm$");
		items = Zotero.selectItems(items);
		for (var i in items) {
			arts.push(i);
		}
	} else { arts = [url]; }
	Zotero.debug(arts);
	for (var i=0; i<arts.length; i++) {
		var art = arts[i];
		var newurl = art;
		Zotero.Utilities.HTTP.doGet(art, function(text) {
			var newItem = new Zotero.Item("case");
			newItem.publicationTitle = "OpenJudis - http://judis.openarchive.in";
			newItem.url = url;
			
			//title
			var t = /\<title\>([\w\W]*?)<\/title/;
			var title = (Zotero.Utilities.trimInternal(t.exec(text)[1])).toLowerCase();
			title = ZU.capitalizeTitle(title, ignorePreference="true");
			newItem.title = title
			newItem.caseName = newItem.title;
			newItem.url = newurl;
			newItem.court="The Supreme Court of India";
	
			newItem.websiteTitle="OpenJudis - http://judis.openarchive.in";
			newItem.edition="Online";
			
			var metareg = /<META NAME[^>]+\>/g;
			var tags = text.match(metareg);
			if (tags) {
				for (var k=0; k<tags.length; k++) {
					var tag = tags[k];
					var stuff = tag.match(/NAME=\"([^"]+)\"\s+CONTENT=\"([^"]+)\"/);
					regexMeta([stuff[1], stuff[2]], newItem);
				}
			}
			pdfurl = 'http://judis.openarchive.in/makepdf.php?filename=' + newItem.url;
			newItem.attachments = [
				{url:newItem.url, title:"OpenJudis Snapshot", mimeType:"text/html"},
				{url:pdfurl, title:"OpenJudis PDF", mimeType:"application/pdf"}
			];
			newItem.complete();
		}, function() {Zotero.done();});
		Zotero.wait();
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://openarchive.in/judis/4216.htm",
		"items": [
			{
				"itemType": "case",
				"creators": [
					{
						"firstName": "K.",
						"lastName": "SUBBARAO",
						"creatorType": "author"
					},
					{
						"firstName": "RAGHUBAR",
						"lastName": "DAYAL",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Art. 136 of the Constitution",
					"Art. 166 of the Constitution",
					"Art. 166(1) of the Constitution",
					"Art. 311 of the Constitution",
					"Art. 77 of the Constitution",
					"Art. 77(2) of the Constitution",
					"Code of Criminal Procedure, 1898",
					"Criminal Law (Amendment) Act, 1952",
					"Criminal Procedure, 1898",
					"Delhi Special Police Establishment Act, 1946",
					"Prevention of Corruption (Second Amendment) Act, 1952",
					"Prevention of Corruption Act, 1947",
					"Prevention of Corruption Act, 1950",
					"Preventive Detention Act, 1950",
					"Section 5(1)(d) of the Prevention of Corruption Act",
					"Section 5A of the Prevention of Corruption Act",
					"The Army Act, 1950",
					"section 5(2), of the Prevention of Corruption Act",
					"section 6 of the Delhi Special Police Establishment Act",
					"section 6(1)(a) of the Prevention of Corruption Act"
				],
				"seeAlso": [],
				"attachments": [
					{
						"url": "http://openarchive.in/judis/4216.htm",
						"title": "OpenJudis Snapshot",
						"mimeType": "text/html"
					},
					{
						"url": "http://judis.openarchive.in/makepdf.php?filename=http://openarchive.in/judis/4216.htm",
						"title": "OpenJudis PDF",
						"mimeType": "application/pdf"
					}
				],
				"publicationTitle": "OpenJudis - http://judis.openarchive.in",
				"url": "http://openarchive.in/judis/4216.htm",
				"title": "Major E. G. Barsay V. the State of Bombay",
				"caseName": "Major E. G. Barsay V. the State of Bombay",
				"court": "The Supreme Court of India",
				"websiteTitle": "OpenJudis - http://judis.openarchive.in",
				"edition": "Online",
				"source": "http://judis.nic.in/supremecourt/qrydisp.asp?tfnm=4216",
				"reporter": "AIR 1961 SC 1762 , 1962 SCR (2) 195",
				"dateDecided": "Monday, 24th April 1961",
				"libraryCatalog": "OpenJudis - Indian Supreme Court cases",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/