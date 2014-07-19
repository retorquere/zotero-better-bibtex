{
	"translatorID": "a75e0594-a9e8-466e-9ce8-c10560ea59fd",
	"label": "Columbia University Press",
	"creator": "Michael Berkowitz",
	"target": "^https?://(www\\.)?cup\\.columbia\\.edu/",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-09-19 00:42:16"
}

function detectWeb(doc, url) {
	if (url.match(/book\//)) {
		return "book";
	} else if (doc.evaluate('//p[@class="header"]/a/span[@class="_booktitle"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	}
}

function addTag(item, tag, xpath) {
	item[tag] = Zotero.Utilities.trimInternal(doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
}

function doWeb(doc, url) {


	var books = new Array();

	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var titles = doc.evaluate('//p[@class="header"]/a', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent;
		}
			Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				books.push(i);
			}
			Zotero.Utilities.processDocuments(books, scrape, function () {
				Zotero.done();
			});
			Zotero.wait();	
		});
	} else {
		scrape(doc, url)
	}
}

function scrape(doc, url) {
	var item = new Zotero.Item("book");
	item.title = Zotero.Utilities.trimInternal(ZU.xpathText(doc, '//h1[@id="_booktitle"]'));
	var authors = Zotero.Utilities.trimInternal(ZU.xpathText(doc, '//p[@id="_authors"]'));
	//we parse the author string - first assign roles and then split multiple authors in those groups.
	var auts = authors.split(/;/);
	for each(var aut in auts) {
		if (aut.match(/Edited/)) {
			var autType = "editor";
			aut = aut.replace(/Edited (by)?/, "");
		} else if (aut.match(/Translated/)) {
			var autType = "translator";
			aut = aut.replace(/Translated (by)?/, "");
		} else {
			var autType = "author";
		}
		aut = aut.split(/\band\b|,/);
		for each(var aut2 in aut) {
			item.creators.push(Zotero.Utilities.cleanAuthor(aut2, autType));
		}
	}
	item.abstractNote = Zotero.Utilities.trimInternal(ZU.xpathText(doc, '//p[@id="_desc"]'));
	item.date = Zotero.Utilities.trimInternal(ZU.xpathText(doc, '//span[@id="_publishDate"]'));
	item.ISBN = Zotero.Utilities.trimInternal(ZU.xpathText(doc, '//span[@id="_isbn"]'));
	//if there is no publisher field, assume it's published by CUP
	var publisher = ZU.xpathText(doc, '//span[@id="_publisher"]');	
	if (publisher) item.publisher = Zotero.Utilities.trimInternal(publisher);
	else item.publisher = "Columbia University Press"
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.cup.columbia.edu/search?q=islam&go.x=0&go.y=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.cup.columbia.edu/book/978-3-933127-81-5/politics-and-cultures-of-islamization-in-southeast-asia",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Georg",
						"lastName": "Stauth",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Politics and Cultures of Islamization in Southeast Asia: Indonesia and Malaysia in the Nineteen-nineties",
				"abstractNote": "This book is about cultural and political figures, institutions and ideas in a period of transition in two Muslim countries in Southeast Asia, Malaysia and Indonesia. It also addresses some of the permutations of civilizing processes in Singapore and the city-state's image, moving across its borders into the region and representing a miracle of modernity beyond ideas. The central theme is the way in which Islam was re-constructed as an intellectual and socio-political tradition in Southeast Asia in the nineteen-nineties. Scholars who approach Islam both as a textual and local tradition, students who take the heartlands of Islam as imaginative landscapes for cultural transformation and politicians and institutions which have been concerned with transmitting the idea of Islamization are the subjects of this inquiry into different patterns of modernity in a tropical region still bearing the signature of a colonial past.",
				"date": "July, 2002",
				"ISBN": "978-3-933127-81-5",
				"publisher": "Transcript-Verlag",
				"libraryCatalog": "Columbia University Press",
				"shortTitle": "Politics and Cultures of Islamization in Southeast Asia"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.cup.columbia.edu/book/978-0-231-12038-8/religion-and-state",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "L. Carl",
						"lastName": "Brown",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Religion and State: The Muslim Approach to Politics",
				"abstractNote": "If Westerners know a single Islamic term, it is likely to be jihad, the Arabic word for \"holy war.\" The image of Islam as an inherently aggressive and xenophobic religion has long prevailed in the West and can at times appear to be substantiated by current events. L. Carl Brown challenges this conventional wisdom with a fascinating historical overview of the relationship between religious and political life in the Muslim world ranging from Islam's early centuries to the present day. Religion and State examines the commonplace notion—held by both radical Muslim ideologues and various Western observers alike—that in Islam there is no separation between religion and politics. By placing this assertion in a broad historical context, the book reveals both the continuities between premodern and modern Islamic political thought as well as the distinctive dimensions of modern Muslim experiences. Brown shows that both the modern-day fundamentalists and their critics have it wrong when they posit an eternally militant, unchanging Islam outside of history. \"They are conflating theology and history. They are confusing the oughtand the is,\" he writes. As the historical record shows, mainstream Muslim political thought in premodern times tended toward political quietism.Brown maintains that we can better understand present-day politics among Muslims by accepting the reality of their historical diversity while at the same time seeking to identify what may be distinctive in Muslim thought and action. In order to illuminate the distinguishing characteristics of Islam in relation to politics, Brown compares this religion with its two Semitic sisters, Judaism and Christianity, drawing striking comparisons between Islam today and Christianity during the Reformation. With a wealth of evidence, he recreates a tradition of Islamic diversity every bit as rich as that of Judaism and Christianity.",
				"date": "October, 2000",
				"ISBN": "978-0-231-12038-8",
				"publisher": "Columbia University Press",
				"libraryCatalog": "Columbia University Press",
				"shortTitle": "Religion and State"
			}
		]
	}
]
/** END TEST CASES **/