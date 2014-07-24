{
	"translatorID": "9575e804-219e-4cd6-813d-9b690cbfc0fc",
	"label": "PLoS Journals",
	"creator": "Michael Berkowitz And Rintze Zelle",
	"target": "^https?://www\\.plos(one|ntds|compbiol|pathogens|genetics|medicine|biology)\\.org/(search|article)/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-03 18:52:52"
}

function detectWeb(doc, url) {
	if (url.indexOf("Search.action") != -1
		|| url.indexOf("browse.action") != -1
		|| url.indexOf("browseIssue.action") != -1
		|| url.indexOf("/search/") != -1) {
		return "multiple";
	} else if (url.indexOf("article/info") != -1) {
		return "journalArticle";
	}
}


function getSelectedItems(doc, articleXPath) {
	var items = {};
	var articles = doc.evaluate(articleXPath, doc, null, XPathResult.ANY_TYPE, null);
	var next_art;
	while (next_art = articles.iterateNext()) {
		items[next_art.href] = next_art.textContent.trim();
	}
	Zotero.selectItems(items, function (items) {
		if(!items) return true;
		
		var texts = [];
		for (var i in items) {
			texts.push(i);
		}
		processTexts(texts);
	});
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		var articlex;
		if(url.indexOf('browseIssue.action') == -1) {
			articlex = '//span[@class="article"]/a';
		} else {
			articlex = '//div[@class="header"]/h3/a';
		}
		getSelectedItems(doc, articlex);
	} else {
		processTexts([url]);
	}
}

function processTexts(texts) {
	var risLinks = [];
	for (var i in texts) {
		texts[i] = texts[i].replace(/;jsessionid[^;]+/, ""); //Strip sessionID string
		texts[i] = texts[i].replace(/\?.*/, ""); //Strip referrer messes
		var risLink = texts[i].replace("info", "getRisCitation.action?articleURI=info");
		var pdfURL = texts[i].replace("info", "fetchObject.action?uri=info")
					+ '&representation=PDF';
		(function(risLink, pdfURL) {
			ZU.doGet(risLink, function (text) {
				var translator = Zotero.loadTranslator("import");
				translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
				translator.setString(text);
				translator.setHandler("itemDone", function (obj, item) {
					item.attachments = [{
						url: pdfURL,
						title: "PLoS Full Text PDF",
						mimeType: "application/pdf"
					}];
					
					if (item.url) {
						item.url = item.url.replace('%2F', '/'); //not sure that it's safe to unescape everything
						item.attachments.push({
							url: item.url,
							title: "PLoS Snapshot",
							mimeType: "text/html",
							snapshot: true
						});
					}
					
					item.complete();
				});
				translator.translate();
			});
		})(risLink, pdfURL);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.plosbiology.org/article/info%3Adoi%2F10.1371%2Fjournal.pbio.1001090",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Tauzin",
						"firstName": "Sébastien",
						"creatorType": "author"
					},
					{
						"lastName": "Chaigne-Delalande",
						"firstName": "Benjamin",
						"creatorType": "author"
					},
					{
						"lastName": "Selva",
						"firstName": "Eric",
						"creatorType": "author"
					},
					{
						"lastName": "Khadra",
						"firstName": "Nadine",
						"creatorType": "author"
					},
					{
						"lastName": "Daburon",
						"firstName": "Sophie",
						"creatorType": "author"
					},
					{
						"lastName": "Contin-Bordes",
						"firstName": "Cécile",
						"creatorType": "author"
					},
					{
						"lastName": "Blanco",
						"firstName": "Patrick",
						"creatorType": "author"
					},
					{
						"lastName": "Le Seyec",
						"firstName": "Jacques",
						"creatorType": "author"
					},
					{
						"lastName": "Ducret",
						"firstName": "Thomas",
						"creatorType": "author"
					},
					{
						"lastName": "Counillon",
						"firstName": "Laurent",
						"creatorType": "author"
					},
					{
						"lastName": "Moreau",
						"firstName": "Jean-François",
						"creatorType": "author"
					},
					{
						"lastName": "Hofman",
						"firstName": "Paul",
						"creatorType": "author"
					},
					{
						"lastName": "Vacher",
						"firstName": "Pierre",
						"creatorType": "author"
					},
					{
						"lastName": "Legembre",
						"firstName": "Patrick",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "PLoS Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "PLoS Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"title": "The Naturally Processed CD95L Elicits a c-Yes/Calcium/PI3K-Driven Cell Migration Pathway",
				"date": "June 21, 2011",
				"abstractNote": "Author Summary \n The “death receptor” CD95 (also known as Fas) plays an essential role in ensuring immune tolerance of self antigens as well as in the elimination of the body's cells that have been infected or transformed. This receptor is engaged by the membrane-bound ligand CD95L, which can be released into blood circulation after cleavage by metalloproteases. Hitherto, most of the studies on the CD95 signal have been performed with chimeric CD95Ls that mimic the membrane-bound ligand and exhibit a level of aggregation beyond that described for the metalloprotease-cleaved ligand. Multi-aggregated CD95L elicits a caspase-driven apoptotic signal. In this study, we observe that levels of soluble and naturally processed CD95L in sera of patients suffering from lupus correlate with disease severity. Strikingly, although this soluble CD95L fails to trigger cell death unlike its chimeric version, it induces a “non-canonical” Ca2+/c-yes/PI3K-dependent signaling pathway that promotes the transmigration of T-lymphocytes across the endothelial barrier. These findings shed light on an entirely new role for the soluble CD95L that may contribute to local or systemic tissue damage by enhancing the infiltration of activated T-lymphocytes. Overall, these findings underline the importance of revisiting the role of this “apoptotic cytokine” in the context of chronic inflammatory disorders.",
				"publicationTitle": "PLoS Biol",
				"journalAbbreviation": "PLoS Biol",
				"volume": "9",
				"issue": "6",
				"url": "http://dx.doi.org/10.1371/journal.pbio.1001090",
				"pages": "e1001090",
				"publisher": "Public Library of Science",
				"DOI": "10.1371/journal.pbio.1001090",
				"libraryCatalog": "PLoS Journals",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.plosmedicine.org/article/info%3Adoi%2F10.1371%2Fjournal.pmed.1000098",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Chiasson",
						"firstName": "T. Carter",
						"creatorType": "author"
					},
					{
						"lastName": "Manns",
						"firstName": "Braden J.",
						"creatorType": "author"
					},
					{
						"lastName": "Stelfox",
						"firstName": "Henry Thomas",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "PLoS Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "PLoS Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"title": "An Economic Evaluation of Venous Thromboembolism Prophylaxis Strategies in Critically Ill Trauma Patients at Risk of Bleeding",
				"date": "June 23, 2009",
				"abstractNote": "Using decision analysis, Henry Stelfox and colleagues estimate the cost-effectiveness of three venous thromboembolism prophylaxis strategies in patients with severe traumatic injuries who were also at risk for bleeding complications.",
				"publicationTitle": "PLoS Med",
				"journalAbbreviation": "PLoS Med",
				"volume": "6",
				"issue": "6",
				"url": "http://dx.doi.org/10.1371/journal.pmed.1000098",
				"pages": "e1000098",
				"publisher": "Public Library of Science",
				"DOI": "10.1371/journal.pmed.1000098",
				"libraryCatalog": "PLoS Journals",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.plosmedicine.org/article/browseIssue.action",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.plosbiology.org/search/simple?from=globalSimpleSearch&filterJournals=PLoSBiology&query=amygdala&x=0&y=0",
		"items": "multiple"
	}
]
/** END TEST CASES **/