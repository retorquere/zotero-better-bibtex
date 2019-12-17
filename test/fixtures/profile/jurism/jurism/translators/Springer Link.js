{
	"translatorID": "d6c6210a-297c-4b2c-8c43-48cb503cc49e",
	"label": "Springer Link",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://link\\.springer\\.com/(search(/page/\\d+)?\\?|(article|chapter|book|referenceworkentry|protocol|journal|referencework)/.+)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2019-10-19 17:03:34"
}

function detectWeb(doc, url) {
	var action = url.match(/^https?:\/\/[^/]+\/([^/?#]+)/);
	if (!action) return false;
	if (!doc.head || !doc.head.getElementsByTagName('meta').length) {
		Z.debug("Springer Link: No head or meta tags");
		return false;
	}
	switch (action[1]) {
		case "search":
		case "journal":
		case "book":
		case "referencework":
			if (getResultList(doc).length > 0) {
				return "multiple";
			}
			return false;
		case "article":
			return "journalArticle";
		case "chapter":
		case "referenceworkentry":
		case "protocol":
			if (ZU.xpathText(doc, '//meta[@name="citation_conference_title"]/@content')) {
				return "conferencePaper";
			}
			else {
				return "bookSection";
			}
	}
	return false;
}

function getResultList(doc) {
	var results = ZU.xpath(doc,
		'//ol[@class="content-item-list"]/li/*[self::h3 or self::h2]/a');
	if (!results.length) {
		results = ZU.xpath(doc,
			'//div[@class="toc"]/ol//div[contains(@class,"toc-item")]/h3/a');
	}
	if (!results.length) {
		results = ZU.xpath(doc,
			'//div[@class="book-toc-container"]/ol//div[contains(@class,"content-type-list__meta")]/div/a');
	}
	if (!results.length) {
		results = ZU.xpath(doc, '//div[@class="toc"]/ol//li[contains(@class,"toc-item")]/p[@class="title"]/a');
	}
	return results;
}

function doWeb(doc, url) {
	var type = detectWeb(doc, url);
	if (type == "multiple") {
		var list = getResultList(doc);
		var items = {};
		for (var i = 0, n = list.length; i < n; i++) {
			items[list[i].href] = list[i].textContent;
		}
		Zotero.selectItems(items, function (selectedItems) {
			if (!selectedItems) return true;
			for (let i in selectedItems) {
				ZU.processDocuments(i, scrape);
			}
		});
	}
	else {
		scrape(doc, url);
	}
}

function complementItem(doc, item) {
	var itemType = detectWeb(doc, doc.location.href);
	// in case we're missing something, we can try supplementing it from page
	if (!item.DOI) {
		item.DOI = ZU.xpathText(doc, '//meta[@name="citation_doi"]/@content');
	}
	if (!item.language) {
		item.language = ZU.xpathText(doc, '//meta[@name="citation_language"]/@content');
	}
	if (!item.publisher) {
		item.publisher = ZU.xpathText(doc, '//dd[@id="abstract-about-publisher"]');
	}
	if (item.publisher && item.place) {
		// delete places in publisher's name
		// e.g. Springer Berlin Heidelberg
		var places = item.place.split(/[\s,;]/);
		for (let place of places) {
			item.publisher = item.publisher.replace(place, '');
		}
	}
	if (!item.date) {
		item.date = ZU.xpathText(doc, '//dd[@id="abstract-about-cover-date"]') || ZU.xpathText(
			doc, '//dd[@id="abstract-about-book-chapter-copyright-year"]');
	}
	if (item.date) {
		item.date = ZU.strToISO(item.date);
	}
	// copyright
	if (!item.rights) {
		item.rights = ZU.xpathText(doc,
			'//dd[@id="abstract-about-book-copyright-holder"]');
		var year = ZU.xpathText(doc,
			'//dd[@id="abstract-about-book-chapter-copyright-year"]');
		if (item.rights && year) {
			item.rights = '©' + year + ' ' + item.rights;
		}
	}
	
	if (itemType == "journalArticle") {
		if (!item.ISSN) {
			item.ISSN = ZU.xpathText(doc, '//dd[@id="abstract-about-issn" or @id="abstract-about-electronic-issn"]');
		}
		if (!item.journalAbbreviation || item.publicationTitle == item.journalAbbreviation) {
			item.journalAbbreviation = ZU.xpathText(doc, '//meta[@name="citation_journal_abbrev"]/@content');
		}
	}
	if (itemType == 'bookSection' || itemType == "conferencePaper") {
		// look for editors
		var editors = ZU.xpath(doc, '//ul[@class="editors"]/li[@itemprop="editor"]/a[@class="person"]');
		var m = item.creators.length;
		for (var i = 0, n = editors.length; i < n; i++) {
			var editor = ZU.cleanAuthor(editors[i].textContent.replace(/\s+Ph\.?D\.?/,
				''), 'editor');
			// make sure we don't already have this person in the list
			var haveEditor = false;
			for (var j = 0; j < m; j++) {
				var creator = item.creators[j];
				if (creator.creatorType == "editor" && creator.lastName == editor.lastName) {
					// we should also check first name, but this could get
					// messy if we only have initials in one case but not
					// the other.
					haveEditor = true;
					break;
				}
			}
			if (!haveEditor) {
				item.creators.push(editor);
			}
		}
		if (!item.ISBN) {
			item.ISBN = ZU.xpathText(doc, '//dd[@id="abstract-about-book-print-isbn" or @id="abstract-about-book-online-isbn"]')
				|| ZU.xpathText(doc, '//span[@id="print-isbn" or @id="electronic-isbn"]');
		}
		// series/seriesNumber
		if (!item.series) {
			item.series = ZU.xpathText(doc, '//dd[@id="abstract-about-book-series-title"]')
				|| ZU.xpathText(doc, '//div[contains(@class, "ArticleHeader")]//a[contains(@href, "/bookseries/")]');
		}
		if (!item.seriesNumber) {
			item.seriesNumber = ZU.xpathText(doc, '//dd[@id="abstract-about-book-series-volume"]');
		}
	}
	// add the DOI to extra for non journal articles
	if (item.itemType != "journalArticle" && item.itemType != "conferencePaper" && item.DOI) {
		item.extra = "DOI: " + item.DOI;
		item.DOI = "";
	}
	// series numbers get mapped to volume; fix this
	if (item.volume == item.seriesNumber) {
		item.volume = "";
	}
	// add abstract
	var abs = ZU.xpathText(doc, '//div[contains(@class,"abstract-content")][1]');
	if (!abs) {
		abs = ZU.xpathText(doc, '//section[@class="Abstract" and @lang="en"]');
	}
	if (abs) item.abstractNote = ZU.trimInternal(abs).replace(/^Abstract[:\s]*/, "");
	// add tags
	var tags = ZU.xpathText(doc, '//span[@class="Keyword"]');
	if (tags && (!item.tags || item.tags.length === 0)) {
		item.tags = tags.split(',');
	}
	return item;
}

function scrape(doc, url) {
	var DOI = url.match(/\/(10\.[^#?]+)/)[1];
	var risURL = "https://citation-needed.springer.com/v2/references/" + DOI + "?format=refman&flavour=citation";
	// Z.debug("risURL" + risURL);
	var pdfURL = "/content/pdf/" + encodeURIComponent(DOI) + ".pdf";
	// Z.debug("pdfURL: " + pdfURL);
	ZU.doGet(risURL, function (text) {
		// Z.debug(text)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			item = complementItem(doc, item);
			
			item.attachments.push({
				url: pdfURL,
				title: "Springer Full Text PDF",
				mimeType: "application/pdf"
			});
			item.complete();
		});
		translator.translate();
	});
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://link.springer.com/chapter/10.1007/978-3-540-88682-2_1",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Something Old, Something New, Something Borrowed, Something Blue",
				"creators": [
					{
						"lastName": "Koenderink",
						"firstName": "Jan J.",
						"creatorType": "author"
					},
					{
						"lastName": "Forsyth",
						"firstName": "David",
						"creatorType": "editor"
					},
					{
						"lastName": "Torr",
						"firstName": "Philip",
						"creatorType": "editor"
					},
					{
						"lastName": "Zisserman",
						"firstName": "Andrew",
						"creatorType": "editor"
					}
				],
				"date": "2008",
				"DOI": "10.1007/978-3-540-88682-2_1",
				"ISBN": "9783540886822",
				"abstractNote": "My first paper of a “Computer Vision” signature (on invariants related to optic flow) dates from 1975. I have published in Computer Vision (next to work in cybernetics, psychology, physics, mathematics and philosophy) till my retirement earlier this year (hence the slightly blue feeling), thus my career roughly covers the history of the field. “Vision” has diverse connotations. The fundamental dichotomy is between “optically guided action” and “visual experience”. The former applies to much of biology and computer vision and involves only concepts from science and engineering (e.g., “inverse optics”), the latter involves intention and meaning and thus additionally involves concepts from psychology and philosophy. David Marr’s notion of “vision” is an uneasy blend of the two: On the one hand the goal is to create a “representation of the scene in front of the eye” (involving intention and meaning), on the other hand the means by which this is attempted are essentially “inverse optics”. Although this has nominally become something of the “Standard Model” of CV, it is actually incoherent. It is the latter notion of “vision” that has always interested me most, mainly because one is still grappling with basic concepts. It has been my aspiration to turn it into science, although in this I failed. Yet much has happened (something old) and is happening now (something new). I will discuss some of the issues that seem crucial to me, mostly illustrated through my own work, though I shamelessly borrow from friends in the CV community where I see fit.",
				"language": "en",
				"libraryCatalog": "Springer Link",
				"pages": "1-1",
				"place": "Berlin, Heidelberg",
				"proceedingsTitle": "Computer Vision – ECCV 2008",
				"publisher": "Springer",
				"series": "Lecture Notes in Computer Science",
				"attachments": [
					{
						"title": "Springer Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://link.springer.com/referenceworkentry/10.1007/978-0-387-79061-9_5173",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Characterized by Commitment to Something Without Personal Exploration",
				"creators": [
					{
						"lastName": "Goldstein",
						"firstName": "Sam",
						"creatorType": "editor"
					},
					{
						"lastName": "Naglieri",
						"firstName": "Jack A.",
						"creatorType": "editor"
					}
				],
				"date": "2011",
				"ISBN": "9780387790619",
				"bookTitle": "Encyclopedia of Child Behavior and Development",
				"extra": "DOI: 10.1007/978-0-387-79061-9_5173",
				"language": "en",
				"libraryCatalog": "Springer Link",
				"pages": "329-329",
				"place": "Boston, MA",
				"publisher": "Springer US",
				"url": "https://doi.org/10.1007/978-0-387-79061-9_5173",
				"attachments": [
					{
						"title": "Springer Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://link.springer.com/protocol/10.1007/978-1-60761-839-3_22",
		"items": [
			{
				"itemType": "bookSection",
				"title": "What Do We Know?: Simple Statistical Techniques that Help",
				"creators": [
					{
						"lastName": "Nicholls",
						"firstName": "Anthony",
						"creatorType": "author"
					},
					{
						"lastName": "Bajorath",
						"firstName": "Jürgen",
						"creatorType": "editor"
					}
				],
				"date": "2011",
				"ISBN": "9781607618393",
				"abstractNote": "An understanding of simple statistical techniques is invaluable in science and in life. Despite this, and despite the sophistication of many concerning the methods and algorithms of molecular modeling, statistical analysis is usually rare and often uncompelling. I present here some basic approaches that have proved useful in my own work, along with examples drawn from the field. In particular, the statistics of evaluations of virtual screening are carefully considered.",
				"bookTitle": "Chemoinformatics and Computational Chemical Biology",
				"extra": "DOI: 10.1007/978-1-60761-839-3_22",
				"language": "en",
				"libraryCatalog": "Springer Link",
				"pages": "531-581",
				"place": "Totowa, NJ",
				"publisher": "Humana Press",
				"series": "Methods in Molecular Biology",
				"shortTitle": "What Do We Know?",
				"url": "https://doi.org/10.1007/978-1-60761-839-3_22",
				"attachments": [
					{
						"title": "Springer Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": " ANOVA "
					},
					{
						"tag": " AUC "
					},
					{
						"tag": " Central Limit Theorem "
					},
					{
						"tag": " Confidence limits "
					},
					{
						"tag": " Correlation "
					},
					{
						"tag": " Enrichment "
					},
					{
						"tag": " Error bars "
					},
					{
						"tag": " Propagation of error "
					},
					{
						"tag": " ROC curves "
					},
					{
						"tag": " Standard deviation "
					},
					{
						"tag": " Student’s t-test "
					},
					{
						"tag": " Variance "
					},
					{
						"tag": " Virtual screening "
					},
					{
						"tag": " logit transform "
					},
					{
						"tag": " p-Values "
					},
					{
						"tag": "Statistics "
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://link.springer.com/search?query=zotero",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://link.springer.com/journal/10922/2/1/page/1",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://link.springer.com/referencework/10.1007/978-1-84996-169-1?page=1#toc",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://link.springer.com/book/10.1007/978-3-540-88682-2",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://link.springer.com/article/10.1007/s10040-009-0439-x",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Tide-induced head fluctuations in a coastal aquifer: effects of the elastic storage and leakage of the submarine outlet-capping",
				"creators": [
					{
						"lastName": "Geng",
						"firstName": "Xiaolong",
						"creatorType": "author"
					},
					{
						"lastName": "Li",
						"firstName": "Hailong",
						"creatorType": "author"
					},
					{
						"lastName": "Boufadel",
						"firstName": "Michel C.",
						"creatorType": "author"
					},
					{
						"lastName": "Liu",
						"firstName": "Shuang",
						"creatorType": "author"
					}
				],
				"date": "2009-07-01",
				"DOI": "10.1007/s10040-009-0439-x",
				"ISSN": "1435-0157",
				"abstractNote": "This paper considers the tidal head fluctuations in a single coastal confined aquifer which extends under the sea for a certain distance. Its submarine outlet is covered by a silt-layer with properties dissimilar to the aquifer. Recently, Li et al. (2007) gave an analytical solution for such a system which neglected the effect of the elastic storage (specific storage) of the outlet-capping. This article presents an analytical solution which generalizes their work by incorporating the elastic storage of the outlet-capping. It is found that if the outlet-capping is thick enough in the horizontal direction, its elastic storage has a significant enhancing effect on the tidal head fluctuation. Ignoring this elastic storage will lead to significant errors in predicting the relationship of the head fluctuation and the aquifer hydrogeological properties. Quantitative analysis shows the effect of the elastic storage of the outlet-capping on the groundwater head fluctuation. Quantitative conditions are given under which the effect of this elastic storage on the aquifer’s tide-induced head fluctuation is negligible. Li, H.L., Li, G.Y., Chen, J.M., Boufadel, M.C. (2007) Tide-induced head fluctuations in a confined aquifer with sediment covering its outlet at the sea floor. [Fluctuations du niveau piézométrique induites par la marée dans un aquifère captif à décharge sous-marine.] Water Resour. Res 43, doi:10.1029/2005WR004724",
				"issue": "5",
				"journalAbbreviation": "Hydrogeol J",
				"language": "en",
				"libraryCatalog": "Springer Link",
				"pages": "1289-1296",
				"publicationTitle": "Hydrogeology Journal",
				"shortTitle": "Tide-induced head fluctuations in a coastal aquifer",
				"url": "https://doi.org/10.1007/s10040-009-0439-x",
				"volume": "17",
				"attachments": [
					{
						"title": "Springer Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": " Analytical solutions "
					},
					{
						"tag": " Elastic storage "
					},
					{
						"tag": " Submarine outlet-capping "
					},
					{
						"tag": " Tidal loading efficiency "
					},
					{
						"tag": "Coastal aquifers "
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://link.springer.com/chapter/10.1007/0-387-24250-3_4",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Whole-Class and Peer Interaction in an Activity of Writing and Revision",
				"creators": [
					{
						"lastName": "Allal",
						"firstName": "Linda",
						"creatorType": "author"
					},
					{
						"lastName": "Lopez",
						"firstName": "Lucie Mottier",
						"creatorType": "author"
					},
					{
						"lastName": "Lehraus",
						"firstName": "Katia",
						"creatorType": "author"
					},
					{
						"lastName": "Forget",
						"firstName": "Alexia",
						"creatorType": "author"
					},
					{
						"lastName": "Kostouli",
						"firstName": "Triantafillia",
						"creatorType": "editor"
					}
				],
				"date": "2005",
				"ISBN": "9780387242507",
				"abstractNote": "The perspective of situated cognition provides a conceptual framework for studying social mediation in activities of text production. The investigation presented here concerns two forms of social mediation: (1) whole-class interactions that prepare the students for drafting and revising their texts; (2) peer interactions occurring when dyads engage in joint revision of their drafts. The data collected in three fifth-grade classrooms include observations of whole-class interactions, recordings of dyadic interactions and classifications of text transformations that students carried out during individual and joint phases of revision. The analyses examine the relationships between qualitative indicators of interaction dynamics and quantitative data on text transformations. The findings show that differences in the whole-class interactions are reflected in the students’ revisions particularly with respect to the degree of rewriting that they undertake, as compared to simple error correction. Although analysis of the dyadic interactions reveals important variations in the dynamics of the exchanges, two general findings emerge. In the large majority of cases, the activity of joint revision leads to a substantial increase in the number of text transformations, beyond those made by each author individually. Even in cases where no new transformations occur, the authors engage actively in interaction about revision (e.g., they propose revisions of the other student’s text, explain revisions made individually to their own text, argue against proposals of the other student, etc.). Implications of the results for future research on writing instruction are discussed.",
				"bookTitle": "Writing in Context(s): Textual Practices and Learning Processes in Sociocultural Settings",
				"extra": "DOI: 10.1007/0-387-24250-3_4",
				"language": "en",
				"libraryCatalog": "Springer Link",
				"pages": "69-91",
				"place": "Boston, MA",
				"publisher": "Springer US",
				"series": "Studies in Writing",
				"url": "https://doi.org/10.1007/0-387-24250-3_4",
				"attachments": [
					{
						"title": "Springer Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": " peer interaction "
					},
					{
						"tag": " revision "
					},
					{
						"tag": " whole-class interaction "
					},
					{
						"tag": " writing "
					},
					{
						"tag": "Social mediation "
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
