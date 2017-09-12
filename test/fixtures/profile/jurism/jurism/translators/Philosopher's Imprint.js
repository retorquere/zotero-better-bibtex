{
	"translatorID": "b0abb562-218c-4bf6-af66-c320fdb8ddd3",
	"label": "Philosopher's Imprint",
	"creator": "Michael Berkowitz",
	"target": "^https?://quod\\.lib\\.umich\\.edu/p/phimp",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-06-02 21:09:41"
}

function detectWeb(doc, url) {
	if (doc.evaluate('//div/span[text() = "Search Results"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	} else if (url.match(/\d+\.\d+\.\d+/)) {
		return "journalArticle";
	}
}

function getID(str) {
	return str.match(/\d+\.\d+\.\d+/)[0];
}
function doWeb(doc, url) {
	var ids = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var titles = doc.evaluate('//div[@class="itemcitation"]//a', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent;
		}
		items = Zotero.selectItems(items);
		for (var i in items) {
			ids.push('http://quod.lib.umich.edu/cgi/t/text/text-idx?c=phimp;view=text;rgn=main;idno=' + getID(i));
		}
	} else {
		ids = ['http://quod.lib.umich.edu/cgi/t/text/text-idx?c=phimp;view=text;rgn=main;idno=' + getID(url)];
	}
	Zotero.Utilities.processDocuments(ids, function(newDoc) {
		var rows = newDoc.evaluate('//tr[td[@id="labelcell"]]', newDoc, null, XPathResult.ANY_TYPE, null);
		var row;
		var data = new Object();
		while (row = rows.iterateNext()) {
			var heading = newDoc.evaluate('./td[1]', row, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			var value = newDoc.evaluate('./td[2]', row, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			data[heading.replace(/[\s:]/g, "")] = value;
		}
		var item = new Zotero.Item("journalArticle");
		item.title = Zotero.Utilities.trimInternal(data['Title']);
		if (data['Author']) {
			item.creators.push(Zotero.Utilities.cleanAuthor(data['Author'], "author"));
		} else if (data['Authors']) {
			var authors = data['Authors'].split(",");
			for (var i=0; i<authors.length; i++) {
				var a = authors[i];
				item.creators.push(Zotero.Utilities.cleanAuthor(a, "author"));
			}
		}
		if (data['Keywords']) {
			var kws = data['Keywords'].split(/\n/);
			for (var i=0; i<kws.length; i++) {
				var kw = kws[i];
				if (kw != "") item.tags.push(kw);
			}
		}
		var voliss = data['Source'].replace(item.title, "");
		if (item.creators.length > 1) {
			voliss = voliss.replace(data['Authors'], "");
		} else if (item.creators.length == 1) {
			voliss = voliss.replace(data['Author'], "");
		}
		Zotero.debug(voliss);
		item.volume = voliss.match(/vol\.\s+(\d+)/)[1];
		item.issue = voliss.match(/no\.\s+(\d+)/)[1];
		if (voliss.match(/pp\.\s+([\d\-]+)/)){
		item.pages = voliss.match(/pp\.\s+([\d\-]+)/)[1];
		}
		item.date = Zotero.Utilities.trimInternal(voliss.match(/[^,]+$/)[0]);
		item.place = "Ann Arbor, MI";
		item.publisher = "University of Michigan";
		item.abstractNote = data['Abstract'];
		item.url = data['URL'];
		item.attachments = [
			{url:item.url, title:item.title + " Snapshot", mimeType:"text/html"},
			{url:'http://quod.lib.umich.edu/p/phimp/images/' + getID(item.url) + '.pdf', title:"Philosopher's Imprint Full Text PDF", mimeType:"application/pdf"}
		];
		item.complete();
	}, function() {Zotero.done();});
	Zotero.wait();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://quod.lib.umich.edu/p/phimp?type=simple&rgn=full+text&q1=epistemology&cite1=&cite1restrict=author&cite2=&cite2restrict=author&Submit=Search",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://quod.lib.umich.edu/p/phimp/3521354.0004.003/1?rgn=full+text;view=image;q1=epistemology",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Brian",
						"lastName": "Weatherson",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Kendall Walton",
					"Tamar Szabó Gendler",
					"concepts",
					"fiction",
					"imagination",
					"morality",
					"possibility"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Morality, Fiction, and Possibility Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Philosopher's Imprint Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Morality, Fiction, and Possibility",
				"volume": "4",
				"issue": "3",
				"pages": "1-27",
				"date": "November 2004",
				"place": "Ann Arbor, MI",
				"publisher": "University of Michigan",
				"abstractNote": "Authors have a lot of leeway with regard to what they can make true in their story. In general, if the author says that p is true in the fiction we're reading, we believe that p is true in that fiction. And if we're playing along with the fictional game, we imagine that, along with everything else in the story, p is true. But there are exceptions to these general principles. Many authors, most notably Kendall Walton and Tamar Szabó Gendler, have discussed apparent counterexamples when p is \"morally deviant\". Many other statements that are conceptually impossible also seem to be counterexamples. In this paper I do four things. I survey the range of counterexamples, or at least putative counterexamples, to the principles. Then I look to explanations of the counterexamples. I argue, following Gendler, that the explanation cannot simply be that morally deviant claims are impossible. I argue that the distinctive attitudes we have towards moral propositions cannot explain the counterexamples, since some of the examples don't involve moral concepts. And I put forward a proposed explanation that turns on the role of 'higher-level concepts', concepts that if they are satisfied are satisfied in virtue of more fundamental facts about the world, in fiction, and in imagination.",
				"url": "http://hdl.handle.net/2027/spo.3521354.0004.003",
				"libraryCatalog": "Philosopher's Imprint",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/