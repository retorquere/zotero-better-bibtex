{
	"translatorID": "0c661209-5ec8-402b-8f18-7dec6ae37d95",
	"label": "The Free Dictionary",
	"creator": "Michael Berkowitz",
	"target": "http://(.*\\.)?thefreedictionary.com/\\w+$",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2012-03-05 03:44:25"
}

function detectWeb(doc, url) {
	return "dictionaryEntry";
}

function doWeb(doc, url) {
	var item = new Zotero.Item('dictionaryEntry');
	item.title = Zotero.Utilities.capitalizeTitle(url.replace("+", " ").match(/[^/]+$/)[0]);
	item.dictionaryTitle = "The Free Dictionary";
	var defs = doc.evaluate('//div[@class="pseg"]', doc, null, XPathResult.ANY_TYPE, null);
	var def;
	while (def = defs.iterateNext()) {
		item.notes.push({note:Zotero.Utilities.trimInternal(def.textContent)});
	}
	item.url = 
	item.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.thefreedictionary.com/labor",
		"items": [
			{
				"itemType": "dictionaryEntry",
				"creators": [],
				"notes": [
					{
						"note": "n.1. a. Physical or mental exertion, especially when difficult or exhausting; work. See Synonyms at work.b. Something produced by work.2. A specific task.3. A particular form of work or method of working: manual labor.4. Work for wages.5. a. Workers considered as a group.b. The trade union movement, especially its officials.6. Labor A political party representing workers' interests, especially in Great Britain.7. The process by which childbirth occurs, beginning with contractions of the uterus and ending with the expulsion of the fetus or infant and the placenta."
					},
					{
						"note": "v. la·bored, la·bor·ing, la·bors"
					},
					{
						"note": "v.intr.1. To work; toil: labored in the fields.2. To strive painstakingly: labored over the needlepoint.3. a. To proceed with great effort; plod: labored up the hill.b. Nautical To pitch and roll.4. To suffer from distress or a disadvantage: labored under the misconception that others were cooperating.5. To undergo the efforts of childbirth."
					},
					{
						"note": "v.tr.1. To deal with in exhaustive or excessive detail; belabor: labor a point in the argument.2. To distress; burden: I will not labor you with trivial matters."
					},
					{
						"note": "adj.1. Of or relating to labor.2. Labor Of or relating to a Labor Party."
					},
					{
						"note": "The process by which the birth of a mammal occurs, beginning with contractions of the uterus and ending with the expulsion of the fetus and the placenta."
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "labor",
				"dictionaryTitle": "The Free Dictionary",
				"libraryCatalog": "The Free Dictionary"
			}
		]
	}
]
/** END TEST CASES **/