{
	"translatorID": "ab961e61-2a8a-4be1-b8a3-044f20d52d78",
	"label": "BIBSYS",
	"creator": "Ramesh Srigiriraju",
	"target": "^https?://ask\\.bibsys\\.no/ask/action",
	"minVersion": "1.0.0b4.r1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2014-04-04 10:08:22"
}

function detectWeb(doc, url)	{
	var multireg=new RegExp("^https?://ask\.bibsys\.no/ask/action/result");
	if (multireg.test(url))
		return "multiple";
	var singlereg=new RegExp("^https?://ask\.bibsys\.no/ask/action/show");
	if (singlereg.test(url))
		return "book";
}

function doWeb(doc, url)	{
	var multireg=new RegExp("https?://ask\.bibsys\.no/ask/action/result");
	if (multireg.test(url))	{
		var titlpath='//tr/td[@width="49%"][@align="left"][@valign="top"]/a/text()';
		var titles=doc.evaluate(titlpath, doc, null, XPathResult.ANY_TYPE, null);
		var codepath='//tr/td/input[@type="checkbox"][@name="valg"]/@value';
		var codes=doc.evaluate(codepath, doc, null, XPathResult.ANY_TYPE, null);
		var items=new Array();
		var title;
		titles.iterateNext();
		while (title=titles.iterateNext())
			items[codes.iterateNext().nodeValue]=title.nodeValue;
		items=Zotero.selectItems(items);
		var string="http://ask.bibsys.no/ask/action/result?control=ctr_top";
		for (var codes in items)
			string+="&valg="+codes;
		string+="&control=ctr_bottom&eksportFormat=refmanager&eksportEpostAdresse=&eksportEpostFormat=fortekst&cmd=sendtil";
		Zotero.Utilities.HTTP.doGet(string, function(text)	{
			var trans=Zotero.loadTranslator("import");
			trans.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
			trans.setString(text);
			trans.setHandler("itemDone", function(obj, item) {
				item.title = item.title.replace(/\s\s+/, " ").replace(/\s:/, ":");
				item.complete();
			});	
			trans.translate();
		});
	}
	var singlereg=new RegExp("http://ask\.bibsys\.no/ask/action/show");
	if (singlereg.test(url))	{
		var urlstring="http://ask.bibsys.no/ask/action/show";
		var data="visningsformat=ris&eksportFormat=refmanager&eksportEpostAdresse=&eksportEpostFormat=fortekst&cmd=sendtil";
		Zotero.Utilities.HTTP.doPost(urlstring, data, function(text)	{
			//Z.debug(text)
			var trans=Zotero.loadTranslator("import");
			trans.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
			trans.setString(text);
			trans.setHandler("itemDone", function(obj, item) {
				item.title = item.title.replace(/\s\s+/, " ").replace(/\s:/, ":");
				item.complete();
			});	
			trans.translate();
		});

	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://ask.bibsys.no/ask/action/result?cmd=&kilde=biblio&q=thelen",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://ask.bibsys.no/ask/action/show?pid=042152526&kid=biblio",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "Thelen",
						"firstName": "Kathleen A.",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "<p>Bibliografi: s. 297-322</p>"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "How institutions evolve: the political economy of skills in Germany, Britain, the United States, and Japan",
				"date": "2004",
				"numPages": "XV, 333 s.",
				"publisher": "Cambridge University Press",
				"place": "Cambridge",
				"ISBN": "0-521-83768-5",
				"libraryCatalog": "BIBSYS",
				"shortTitle": "How institutions evolve"
			}
		]
	}
]
/** END TEST CASES **/