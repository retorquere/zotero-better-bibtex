{
	"translatorID": "882f70a8-b8ad-403e-bd76-cb160224999d",
	"label": "Vanderbilt eJournals",
	"creator": "Michael Berkowitz and Aurimas Vinckevicius",
	"target": "http://ejournals.library.vanderbilt.edu/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-02-08 12:00:11"
}

function scrape(doc) {
	var translator = Zotero.loadTranslator("web");
	//use embedded metadata
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler("itemDone", function(obj, item) {
		//extra contains the abstract
		item.abstractNote = item.extra;
		delete item.extra;

		//pdf link points to embedded pdf
		for(var i=0, n=item.attachments.length; i<n; i++) {
			var attachment = item.attachments[i]
			if(attachment.mimeType == 'application/pdf') {
				attachment.url = attachment.url.replace(/\/view\//,'/download/');
			}
		}

		item.complete();
	});
	translator.translate();
}

function detectWeb(doc, url) {
	if (url.indexOf('/article/view/') != -1) {
		return "journalArticle";
	} else if ( url.indexOf('/issue/view') != -1 ||
				( ( url.indexOf('/search/advancedResults') != -1 ||
					url.indexOf('/search/results') != -1 ) &&
					!ZU.xpath(doc, '//td[text()="No Results"]').length ) ) {
		return "multiple";
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var results = ZU.xpath(doc, '//div[@id="results"]//tr[@valign="top"]');
		var titlex = './td[2]';
		var linkx = './td[3]/a[contains(text(), "Abstract") or contains(text(), "HTML")]';
		for (var i=0, n=results.length; i<n; i++) {
			var title = ZU.xpathText(results[i], titlex);
			var link = ZU.xpath(results[i], linkx)[0].href;
			items[link] = Zotero.Utilities.trimInternal(title);
		}
		Zotero.selectItems(items, function(selectedItems) {
			if(!selectedItems) return true;

			var arts = new Array();
			for (var i in selectedItems) {
				arts.push(i);
			}
			ZU.processDocuments(arts, scrape);
		});
	} else {
		scrape(doc);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://ejournals.library.vanderbilt.edu/ojs/index.php/vurj/article/view/2931",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Emily Cannon",
						"lastName": "Green",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"rights": "Copyright for articles published in this journal is retained by the authors, with first publication rights granted to Vanderbilt Undergraduate Research Journal. By virtue of their appearance in this open access journal, articles are available for wide dissemination at no cost to readers, with proper attribution, in educational and other non-commercial settings. For undergraduates jointly authoring a manuscript with a faculty member, we strongly encourage the student to discuss with the faculty mentor and the Editor if the copyright policy will constrain future publication efforts in professional journals.",
				"language": "en",
				"issue": "0",
				"abstractNote": "“Music City, U.S.A.” celebrates many cultures and music, but often Nashville is identified with singing cowboys with southern drawls. Some are quick to call this country-western image “inauthentic,” pointing out that middle Tennessee’s forested hills were never home to cattle ranches or Gene Autry. Indeed, the labels of “authentic” or “inauthentic” have become widely used in contemporary society to denote whether a thing is essentially true or untrue. In his evaluation of the 1960s music “myth” in which folk music was deemed authentic and pop music inauthentic, sociologist Simon Frith argues that the central issue was less about the music itself and more about the communication of a person’s identity through that music. An examination of the concept of authenticity as it has evolved through history and presented itself in recent scholarship and a survey of Nashville residents and college students reveal that the quest for authenticity in tourism and consumerism is closely linked to the construction of identity. While the concept of authenticity is demonstrably problematic, it retains its power because it provides a framework against which individuals can define themselves in an increasingly global world. The quest for authenticity in music, then, becomes a quest for truth about oneself for which there is no objective answer. Authenticity is fundamentally a question of perspective. Who can say whether Nashville is authentic or not? All that can be said is simply that Nashville is.",
				"url": "http://ejournals.library.vanderbilt.edu/ojs/index.php/vurj/article/view/2931",
				"libraryCatalog": "ejournals.library.vanderbilt.edu",
				"shortTitle": "Authenticating Identity",
				"title": "Authenticating Identity: The Quest for Personal Validation through Authenticity in Music",
				"publicationTitle": "Vanderbilt Undergraduate Research Journal",
				"date": "2011/08/05",
				"volume": "7"
			}
		]
	},
	{
		"type": "web",
		"url": "http://ejournals.library.vanderbilt.edu/ojs/index.php/lusohispanic/article/view/3283/1518",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Raúl",
						"lastName": "Dorra",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"language": "en",
				"issue": "0",
				"ISSN": "1547-5743",
				"url": "http://ejournals.library.vanderbilt.edu/ojs/index.php/lusohispanic/article/view/3283",
				"libraryCatalog": "ejournals.library.vanderbilt.edu",
				"title": "¿Qué hay antes y después de la escritura?",
				"publicationTitle": "Vanderbilt e-Journal of Luso-Hispanic Studies",
				"date": "2011/10/20",
				"volume": "7"
			}
		]
	},
	{
		"type": "web",
		"url": "http://ejournals.library.vanderbilt.edu/ojs/index.php/homiletic/article/view/3460",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Clint",
						"lastName": "Heacock",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"language": "en",
				"issue": "2",
				"abstractNote": "Much has been written concerning the New England Puritan Jonathan Edwards, addressing his multifaceted activities as a theologian, preacher, revivalist, pastor, polemicist and missionary. In particular this study focuses upon the rhetorical influences that shaped his preaching ministry: his personal faith experiences, the preaching of his father and grandfather, the Puritan preaching tradition, and the rhetoric of Peter Ramus. While he preached within the sometimes narrow constraints of his New England Puritan tradition, Edwards nonetheless found some freedom to experiment with the classic inherited Puritan tripartite sermon form. Although he never truly departed from this sermon format, his attempts at innovation within his tradition serves as a model for preachers today. Such a legacy may well inspire preachers operating within the confines of hermeneutical or denominational tradition, but who seek to reconfigure elements of their inherited preaching influences.",
				"ISSN": "2152-6923",
				"url": "http://ejournals.library.vanderbilt.edu/ojs/index.php/homiletic/article/view/3460",
				"libraryCatalog": "ejournals.library.vanderbilt.edu",
				"title": "Rhetorical Influences upon the Preaching of Jonathan Edwards",
				"publicationTitle": "Homiletic",
				"date": "2011/12/01",
				"volume": "36"
			}
		]
	},
	{
		"type": "web",
		"url": "http://ejournals.library.vanderbilt.edu/ojs/index.php/ameriquests/article/view/220",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Earl E.",
						"lastName": "Fitz",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"rights": "We ask that all submissions be original to AmeriQuests, although exceptions can be made by the editor. All authors retain copyright, and are permitted to publish their work after it appears in AmeriQuests, although we ask that AmeriQuests be referenced in subsequent editions. \n \nIn addition, for audio and visual recordings:\n \n1. \nThe right to record, in any medium, all aspects of the live delivery of my lecture, or my \nidentifiable participation in the lecture event, identified above, including in visual and audio \nmedia of any kind and associated presentation materials. \n2. \nThe right to use my name, photograph, picture, portrait, likeness, and voice (hereinafter \ncollectively known as “image”) in connection with the copying, distribution, performance, \ndisplay or modification of the recorded lecture in educational materials or for any other \nlegitimate purpose, including commercial distribution; \n3. \nThe right to use, reproduce, publish, exhibit, distribute and transmit my image individually \nor in conjunction with other images or printed matter in the production of motion pictures, \ntelevision tape, sound recordings, still photography, CD-ROM or any other media; \n4. \nThe right to record, reproduce, amplify and simulate my image and all sound effects \nproduced; \n5. \nThe right to copyright in its own name works that contain my image; and \n6. \nThe right to assign, transfer, or license the above rights to third parties. \nFor any material or content I provide for the lecture, such as associated text or graphic materials, I \nwarrant and represent that any such content is my original creation and that I will defend, indemnify \nand hold Vanderbilt harmless against any loss, claim or liability related to allegations about the \ninfringement of a third party’s intellectual property rights in the content, the associated materials, \nor any part thereof. \n \nI hereby waive the right to inspect or approve my image or any finished materials that incorporate \nmy image. I understand and agree that I will not receive compensation, now or in the future, in \nconnection with the use of my image. \n \nI hereby release and forever discharge Vanderbilt University, the Board of Trust of Vanderbilt \nUniversity, its members individually, and the officers, agents and employees of Vanderbilt \n \n \n \nUniversity from any and all claims, demands, rights and causes of action of whatever kind that I may \nhave, caused by or arising from the use of my image, including all claims for libel and invasion of \nprivacy. \n \nI understand that Vanderbilt may identify me as an author or presenter of the above-named lecture \nand its associated materials, if I am such author or presenter, or else as a participant in the lecture \nevent. \n \nI understand that, if I am the lecture’s author, I may at any time present elsewhere or publish the \nlecture and the associated materials or any portion thereof. \n \nI understand that my participation in this filming is voluntary, and should I decide not to \nparticipate, it will not affect my grade. \n \nI certify that I am at least 18 years of age and that I have read and understood the above",
				"language": "en",
				"issue": "1",
				"abstractNote": "Historically, Canadian literature has been chary of entering too far into the new discipline of inter-American literary study.  Rightly concerned about the danger of blurring its identity as a distinctive national literature (one made up, as is well known, of two great strands, the French and the English), Canadian writing has, however, come of age, both nationally and internationally.  One dramatic aspect of this transformation is that we now have mounting evidence that both English and French Canadian writers are actively engaging with the literatures and cultures of their hemispheric neighbors.  By extending the methodologies of Comparative Literature to the inter-American paradigm, Canadian writers, critics, and literary historians are finding ways to maintain their status as members of a unique and under-appreciated national literature while also entering into the kinds of comparative studies that demonstrate their New World ties as well.",
				"ISSN": "1553-4316",
				"url": "http://ejournals.library.vanderbilt.edu/ojs/index.php/ameriquests/article/view/220",
				"libraryCatalog": "ejournals.library.vanderbilt.edu",
				"shortTitle": "Canadian Literature in the Early Twenty-First Century",
				"title": "Canadian Literature in the Early Twenty-First Century: The Emergence of an Inter-American Perspective",
				"publicationTitle": "AmeriQuests",
				"date": "2011/07/28",
				"volume": "8"
			}
		]
	},
	{
		"type": "web",
		"url": "http://ejournals.library.vanderbilt.edu/ojs/index.php/vurj/search/results?query=house",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://ejournals.library.vanderbilt.edu/ojs/index.php/homiletic/search/results?query=dialogue",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://ejournals.library.vanderbilt.edu/ojs/index.php/ameriquests/search/advancedResults?query=americas",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://ejournals.library.vanderbilt.edu/ojs/index.php/lusohispanic/search/results?query=Lope+de+Vega&searchField=",
		"items": "multiple"
	}
]
/** END TEST CASES **/