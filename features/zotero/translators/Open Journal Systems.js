{
	"translatorID": "99b62ba4-065c-4e83-a5c0-d8cc0c75d388",
	"label": "Open Journal Systems",
	"creator": "Aurimas Vinckevicius",
	"target": "/article/view/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-02-23 00:53:05"
}

function detectWeb(doc, url) {
	if(ZU.xpathText(doc, '//a[@id="developedBy"]/@href') == 'http://pkp.sfu.ca/ojs/') {	//some sites remove this
		return 'journalArticle';
	}
}

function doWeb(doc, url) {
	//use Embeded Metadata
	var trans = Zotero.loadTranslator('web');
	trans.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	trans.setDocument(doc);

	trans.setHandler('itemDone', function(obj, item) {
		//abstract is supplied in DC:description, so it ends up in extra
		//abstractNote is pulled from description, which is same as title
		item.abstractNote = item.extra;
		item.extra = undefined;

		//if we still don't have abstract, we can try scraping from page
		if(!item.abstractNote) {
			item.abstractNote = ZU.xpathText(doc, '//div[@id="articleAbstract"]/div[1]');
		}
		
		//some journals link to a PDF view page in the header, not the PDF itself
		for(var i=0; i<item.attachments.length; i++) {
			if(item.attachments[i].mimeType == 'application/pdf') {
				item.attachments[i].url = item.attachments[i].url.replace(/\/article\/view\//, '/article/download/');
			}
		}

		item.complete();
	});

	trans.translate();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://cab.unime.it/journals/index.php/AAPP/article/view/AAPP.901A1",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "David",
						"lastName": "Carfì",
						"creatorType": "author"
					},
					{
						"firstName": "Daniele",
						"lastName": "Schilirò",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Games and economics",
					"competition",
					"cooperation",
					"coopetition"
				],
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
				"title": "A framework of coopetitive games: Applications to the Greek crisis",
				"publicationTitle": "AAPP | Physical, Mathematical, and Natural Sciences",
				"rights": "Copyright (c) 2014 AAPP | Physical, Mathematical, and Natural Sciences",
				"date": "2012/06/08",
				"language": "en",
				"volume": "90",
				"issue": "1",
				"DOI": "10.1478/AAPP.901A1",
				"ISSN": "1825-1242",
				"url": "http://cab.unime.it/journals/index.php/AAPP/article/view/AAPP.901A1",
				"abstractNote": "In the present work we propose an original analytical model of coopetitive game. We shall apply this analytical model of coopetition (based on normal form game theory) to the Greek crisis, while conceiving this game theory model at a macro level. We construct two realizations of such model, trying to represent possible realistic macro-economic scenarios of the Germany-Greek strategic interaction. We shall suggest - after a deep and complete study of the two samples - feasible transferable utility solutions in a properly coopetitive perspective for the divergent interests which drive the economic policies in the euro area.",
				"libraryCatalog": "cab.unime.it",
				"shortTitle": "A framework of coopetitive games"
			}
		]
	},
	{
		"type": "web",
		"url": "http://elanguage.net/journals/index.php/dad/article/view/362",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Christine",
						"lastName": "Howes",
						"creatorType": "author"
					},
					{
						"firstName": "Matthew",
						"lastName": "Purver",
						"creatorType": "author"
					},
					{
						"firstName": "Patrick G. T.",
						"lastName": "Healey",
						"creatorType": "author"
					},
					{
						"firstName": "Gregory",
						"lastName": "Mills",
						"creatorType": "author"
					},
					{
						"firstName": "Eleni",
						"lastName": "Gregoromichelaki",
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
				"issue": "1",
				"DOI": "10.5087/d&d.v2i1.362",
				"abstractNote": "Spoken contributions in dialogue often continue or complete earlier contributions by either the same or a different speaker. These compound contributions (CCs) thus provide a natural context for investigations of incremental processing in dialogue.\n\nWe present a corpus study which confirms that CCs are a key dialogue phenomenon: almost 20% of contributions fit our general definition of CCs, with nearly 3% being the cross-person case most often studied. The results suggest that processing is word-by-word incremental, as splits can occur within syntactic constituents; however, some systematic differences between same- and cross-person cases indicate important dialogue-specific pragmatic effects. An experimental study then investigates these effects by artificially introducing CCs into multi-party text dialogue. Results suggest that CCs affect peoples expectations about who will speak next and whether other participants have formed a coalition or party.\n\nTogether, these studies suggest that CCs require an incremental processing mechanism that can provide a resource for constructing linguistic constituents that span multiple contributions and multiple participants. They also suggest the need to model higher-level dialogue units that have consequences for the organisation of turn-taking and for the development of a shared context.",
				"ISSN": "2152-9620",
				"url": "http://elanguage.net/journals/dad/article/view/362",
				"libraryCatalog": "elanguage.net",
				"shortTitle": "On Incrementality in Dialogue",
				"title": "On Incrementality in Dialogue: Evidence from Compound Contributions",
				"publicationTitle": "Dialogue & Discourse",
				"date": "2011/05/11",
				"volume": "2",
				"pages": "279-311"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ijdc.net/index.php/ijdc/article/view/8.2.5/",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Katherine G.",
						"lastName": "Akers",
						"creatorType": "author"
					},
					{
						"firstName": "Jennifer",
						"lastName": "Doty",
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
				"rights": "Copyright for papers and articles published in this journal is retained by the authors, with first publication rights granted to the University of Edinburgh. It is a condition of publication that authors license their paper or article under a  Creative Commons Attribution Licence .",
				"language": "en",
				"issue": "2",
				"DOI": "10.2218/ijdc.v8i2.263",
				"ISSN": "1746-8256",
				"url": "http://www.ijdc.net/index.php/ijdc/article/view/8.2.5",
				"abstractNote": "Academic librarians are increasingly engaging in data curation by providing infrastructure (e.g., institutional repositories) and offering services (e.g., data management plan consultations) to support the management of research data on their campuses. Efforts to develop these resources may benefit from a greater understanding of disciplinary differences in research data management needs. After conducting a survey of data management practices and perspectives at our research university, we categorized faculty members into four research domains—arts and humanities, social sciences, medical sciences, and basic sciences—and analyzed variations in their patterns of survey responses. We found statistically significant differences among the four research domains for nearly every survey item, revealing important disciplinary distinctions in data management actions, attitudes, and interest in support services. Serious consideration of both the similarities and dissimilarities among disciplines will help guide academic librarians and other data curation professionals in developing a range of data-management services that can be tailored to the unique needs of different scholarly researchers.",
				"libraryCatalog": "www.ijdc.net",
				"title": "Disciplinary differences in faculty research data management practices and perspectives",
				"publicationTitle": "International Journal of Digital Curation",
				"date": "19/11/2013",
				"volume": "8",
				"pages": "5-26"
			}
		]
	}
]
/** END TEST CASES **/