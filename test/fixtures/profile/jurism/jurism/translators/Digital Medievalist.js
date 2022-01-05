{
	"translatorID": "5e684d82-73a3-9a34-095f-19b112d77bbe",
	"label": "Digital Medievalist",
	"creator": "Fred Gibbs, Sebastian Karcher",
	"target": "^https?://(www\\.)?digitalmedievalist\\.org/(index\\.html)?($|journal/?$|(journal/\\d+))",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-12-17 02:55:59"
}

function detectWeb(doc, url) {

	if (doc.title == "Digital Medievalist: Journal" || doc.title == "Digital Medievalist" || doc.title == "Digital Medievalist Journal") {
		return "multiple";
	} else {
		return "journalArticle";
	}
}


function doWeb(doc, url) {
	var links ={};
	var articles = [];
	// if on single article
	if (detectWeb(doc, url) == "journalArticle") {
		scrape(doc, url)
	}

	// if multiple, collect article titles 
	else if (doc.evaluate('//div[@class="issue"]/div/ul/li/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {

		var titles = doc.evaluate('//div[@class="issue"]/div/ul/li/a', doc, null, XPathResult.ANY_TYPE, null);
		 
		while (title = titles.iterateNext()) { 
			links[title.href] = Zotero.Utilities.trimInternal(title.textContent);
		}

	Zotero.selectItems(links, function (items) {
				if (!items) {
					return true;
				}
				for (var i in items) {
					articles.push(i);
				}
				Zotero.Utilities.processDocuments(articles, scrape);
			});
	}
}

	
function scrape(doc, url){
	var newItem = new Zotero.Item("journalArticle")
	newItem.publicationTitle = "Digital Medievalist";
	newItem.ISSN = " 1715-0736";
	newItem.url = url;
	newItem.title = ZU.xpathText(doc, '//h1')
	newItem.attachments.push({document:doc, title: "Digital Medievalist Snapshot", mimeType:"text/html"});
	var keywords = ZU.xpathText(doc, '//div[@class="keywords"]/p');
	if (keywords) keywords=keywords.replace(/Keywords:\s*/, "").replace(/.\s*$/, "").split(/\s*;\s*/);
	for (var i in keywords){
		newItem.tags.push(keywords[i].trim())
	}
	var authors = ZU.xpath(doc, '//div[@class="frontmatter"]//p[@class="byline"]');
	for (var i=0; i<authors.length;i++){
		var author = authors[i].textContent.match(/^.+?,/);
		if (author) newItem.creators.push(ZU.cleanAuthor(author[0], "author"))
	}
	var abstract = ZU.xpathText(doc, '//div[@class="abstract"]/p[last()]');
	if (abstract) newItem.abstractNote = ZU.trimInternal(abstract);	
	var pubinfo = ZU.xpathText(doc, '//div[@class="frontmatter"]/p[1]');
	var volyear = pubinfo.match(/Digital Medievalist (\d+)\s*\((\d{4})\)/)
	if (volyear){
		newItem.year = volyear[2];
		newItem.volume = volyear[1];
	}
	newItem.complete(); 
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://digitalmedievalist.org/journal/6/gau/",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Melanie",
						"lastName": "Gau",
						"creatorType": "author"
					},
					{
						"firstName": "Heinz",
						"lastName": "Miklas",
						"creatorType": "author"
					},
					{
						"firstName": "Martin",
						"lastName": "Lettner",
						"creatorType": "author"
					},
					{
						"firstName": "Robert",
						"lastName": "Sablatnig",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Codicology",
					"Damaged Manuscripts",
					"Digital Palaeography",
					"Foreground-Background Separation",
					"Graphemic Character Segmentation",
					"Image Acquisition",
					"Manuscripts",
					"Multi-Spectral Imaging",
					"Palaeography",
					"Palimpsests",
					"Processing"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Digital Medievalist Snapshot",
						"mimeType": "text/html"
					}
				],
				"publicationTitle": "Digital Medievalist",
				"ISSN": "1715-0736",
				"url": "http://digitalmedievalist.org/journal/6/gau/",
				"title": "Image Acquisition & Processing Routines for Damaged Manuscripts",
				"abstractNote": "This paper presents an overview of data acquisition and processing procedures of an interdisciplinary project of philologists and image processing experts aiming at the decipherment and reconstruction of damaged manuscripts. The digital raw image data was acquired via multi-spectral imaging. As a preparatory step we developed a method of foreground-background separation (binarisation) especially designed for multi-spectral images of degraded documents. On the basis of the binarised images further applications were developed: an automatic character decomposition and primitive extraction dissects the scriptural elements into analysable pieces that are necessary for palaeographic and graphemic analyses, writing tool recognition, text restoration, and optical character recognition. The results of the relevant procedures can be stored and interrogated in a database application. Furthermore, a semi-automatic page layout analysis provides codicological information on latent page contents (script, ruling, decorations).",
				"volume": "6",
				"libraryCatalog": "Digital Medievalist"
			}
		]
	},
	{
		"type": "web",
		"url": "http://digitalmedievalist.org/journal/6/",
		"items": "multiple"
	}
]
/** END TEST CASES **/