{
	"translatorID": "0c661209-5ec8-402b-8f18-7dec6ae37d95",
	"label": "The Free Dictionary",
	"creator": "Michael Berkowitz",
	"target": "^https?://(.*\\.)?thefreedictionary\\.com/\\w+$",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2017-07-10 15:21:32"
}

function detectWeb(doc, url) {
	return "dictionaryEntry";
}

function doWeb(doc, url) {
	var item = new Zotero.Item('dictionaryEntry');
	item.title = Zotero.Utilities.capitalizeTitle(url.replace("+", " ").match(/[^/]+$/)[0]);
	item.dictionaryTitle = "The Free Dictionary";
	var defs = doc.querySelectorAll('div.pseg');
	var noteString = '';
	for (var i=0; i<defs.length; i++) {
		noteString += '<p>' + ZU.trimInternal(defs[i].textContent) + '</p>\n';
	}
	item.notes.push({note: noteString});
	item.url = url;
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.thefreedictionary.com/labor",
		"items": [
			{
				"itemType": "dictionaryEntry",
				"title": "labor",
				"creators": [],
				"dictionaryTitle": "The Free Dictionary",
				"libraryCatalog": "The Free Dictionary",
				"url": "http://www.thefreedictionary.com/labor",
				"attachments": [],
				"tags": [],
				"notes": [
					{
						"note": "<p>n.1. Physical or mental exertion, especially when difficult or exhausting; work. See Synonyms at work.2. A specific task or effort, especially a painful or arduous one: \"Eating the bread was a labor I put myself through to quiet my stomach\" (Gail Anderson-Dargatz).3. A particular form of work or method of working: manual labor.4. Work for wages: businesses paying more for labor.5. a. Workers considered as a group.b. The trade union movement, especially its officials.6. Labor A political party representing workers' interests, especially in Great Britain.7. The process by which childbirth occurs, beginning with contractions of the uterus and ending with the expulsion of the fetus or infant and the placenta.</p>\n<p>v. la·bored, la·bor·ing, la·bors</p>\n<p>v.intr.1. To work; toil: labored in the fields.2. To strive painstakingly: labored over the needlepoint.3. a. To proceed with great effort; plod: labored up the hill.b. Nautical To pitch and roll.4. To suffer from distress or a disadvantage: labored under the misconception that others were cooperating.5. To undergo the labor of childbirth.</p>\n<p>v.tr.1. To deal with in exhaustive or excessive detail; belabor: labor a point in the argument.2. To distress; burden: I will not labor you with trivial matters.</p>\n<p>adj.1. Of or relating to labor.2. Labor Of or relating to a Labor Party.</p>\n<p>The process by which the birth of a mammal occurs, beginning with contractions of the uterus and ending with the delivery of the fetus or infant and the placenta.</p>\n<p>1. Physical exertion that is usually difficult and exhausting:drudgery, moil, toil, travail, work.Informal: sweat.Chiefly British: fag.Idiom: sweat of one's brow.2. The act or process of bringing forth young:accouchement, birth, birthing, childbearing, childbirth, delivery, lying-in, parturition, travail.</p>\n<p>1. To exert one's mental or physical powers, usually under difficulty and to the point of exhaustion:drive, fag, moil, strain, strive, sweat, toil, travail, tug, work.Idiom: break one's back.2. To express at greater length or in greater detail:amplify, develop, dilate, elaborate, enlarge, expand, expatiate.</p>\n"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/