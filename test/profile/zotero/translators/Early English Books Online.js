{
	"translatorID": "b86bb082-6310-4772-a93c-913eaa3dfa1b",
	"label": "Early English Books Online",
	"creator": "Michael Berkowitz",
	"target": "^https?://[^/]*eebo\\.chadwyck\\.com[^/]*(/works)?/search",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2014-04-03 16:50:31"
}

function detectWeb(doc, url) {
	if (doc.title == "Search Results - EEBO" || doc.title=="Author's Works - EEBO") {
		return "multiple";
	} else if (doc.title != "Basic Search - EEBO") {
		return "book";
	}
}

function doWeb(doc, url) {
	var eeboIDs = new Array();
	var hostRegexp = new RegExp("^(https?://[^/]+)/");
	var hMatch = hostRegexp.exec(url);
	var host = hMatch[1];
	var IDRegex = /&ID=([^&]+)/

	if (detectWeb(doc, url)=="multiple") {
		var items = new Object();
		var IDxpath = '//td/input[@name="EeboId" or @name="ADDALL"]/@value';
		//Z.debug(ZU.xpathText(doc, IDxpath))
		var Titlexpath = '//table[tbody/tr/td/input[@name="EeboId"]]/following-sibling::table[tbody]//i[1]';
		if (!ZU.xpathText(doc, Titlexpath)){
			//the logic for author lists is different
			var Titlexpath = '//table/tbody/tr/td/i'
		}
		var new_ids = doc.evaluate(IDxpath, doc, null, XPathResult.ANY_TYPE, null);
		var new_titles = doc.evaluate(Titlexpath, doc, null, XPathResult.ANY_TYPE, null);
		var next_id = new_ids.iterateNext();
		var next_title = new_titles.iterateNext();
		while (next_id) {
			Z.debug(next_id.textContent +": " + next_title.textContent)
			//the EEBOIDs from author lists have a suffix that we don't want
			items[next_id.textContent.replace(/\+.+/, "").trim()] = next_title.textContent.trim();
			next_id = new_ids.iterateNext();
			next_title = new_titles.iterateNext();
		}
		
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				eeboIDs.push(i);
			}
			scrape(eeboIDs, host);
		});	
	} else {
		var eeboid = url.match(IDRegex)[1];
		if (eeboid[0] == "D") {
			eeboid = eeboid.slice(7, 14);
		}
		eeboIDs.push(eeboid);
		scrape(eeboIDs, host)
	}
}
	
function scrape(eeboIDs, host){
	Zotero.debug(eeboIDs);
	for (var i = 0 ; i < eeboIDs.length ; i++) {
		var postString = 'cit_format=RIS&Print=Print&cit_eeboid=' + eeboIDs[i] + '&EeboId=' + eeboIDs[i];
		var new_eeboid = eeboIDs[i]
		Zotero.Utilities.HTTP.doPost(host+'/search/print', postString, function(text) {
			//Z.debug(text)
			// load translator for RIS
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
			translator.setString(text.substring(17));
			translator.setHandler("itemDone", function(obj, item) {
				//remove date for authors
				for (var i in item.creators){
					if (item.creators[i].firstName) item.creators[i].firstName = item.creators[i].firstName.replace(/[,\-\d\.\s]+$/g, "")
				}
				item.attachments.push(
						{url : host+'/search/full_rec?SOURCE=pgimages.cfg&ACTION=ByID&ID=' + new_eeboid + '&FILE=../session/1190302085_15129&SEARCHSCREEN=CITATIONS&SEARCHCONFIG=config.cfg&DISPLAY=ALPHA',
						 title : "EEBO Record",
						 snapshot : false });
				item.complete();
			});
			translator.translate();
		});
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://eebo.chadwyck.com/works/search?SEARCH=submit+search&ACTION=SearchOrBrowse&AUTHOR=EXACT+%22Manley%2C%20Thomas%2C%201628-1690.%22&FTONLY=&ECCO=N&INITIAL=M&PAGENO=3&TITLE=Manley%2C%20Thomas%2C%201628-1690.&RETRIEVETYPE=subset&HISTLOGGING=N",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://eebo.chadwyck.com/search/full_rec?SOURCE=config.cfg&ACTION=ByID&ID=13111309&ECCO=undefined&SUBSET=undefined&ENTRIES=undefined",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "Manley",
						"firstName": "Thomas",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "<p>\"The table\" [i.e. index]: p. [1]-[14] at end.; Reproduction of original in Huntington Library.</p>"
					}
				],
				"tags": [
					"Law -- England.",
					"Law -- Interpretation and construction.",
					"Law clerks -- England."
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "EEBO Record",
						"snapshot": false
					}
				],
				"title": "The clerks guide leading into three parts, viz. I. Of indentures, leases, &c., II. Letters of attorney, warrants of attorney, mortgages, licences, charter-parties, &c., III. Bills, answers, replications, rejoynders in chancery, &c., under which are comprehended the most unusual forms of clerkship : to which is added, a fourth part of fines, recoveries, statutes, recognisances, judgements, &c. distresses and replevins : illustrated with cases, and the statutes relating to the same / by Tho. Manley of the Middle Temple, London, Esq.",
				"publisher": "London : Printed by John Streater, Henry Twyford, and E. Flesher, assigns of Richard Atkins and Edward Atkins, Esquires, 1672.",
				"date": "1672",
				"series": "Early English Books, 1641-1700 / 744:51",
				"libraryCatalog": "Early English Books Online",
				"shortTitle": "The clerks guide leading into three parts, viz. I. Of indentures, leases, &c., II. Letters of attorney, warrants of attorney, mortgages, licences, charter-parties, &c., III. Bills, answers, replications, rejoynders in chancery, &c., under which are comprehended the most unusual forms of clerkship"
			}
		]
	}
]
/** END TEST CASES **/