{
	"translatorID": "c54d1932-73ce-dfd4-a943-109380e06574",
	"label": "Project MUSE",
	"creator": "Simon Kornblith, Avram Lyon, Sean Takats",
	"target": "^https?://[^/]*muse\\.jhu\\.edu[^/]*/(login\\?.+ur[il]=/)?(?:journals/[^/]+/(summary/)?[^/]+/[^/]+\\.html|search/results|results)",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-02-27 23:52:00"
}

function detectWeb(doc, url) {
	var searchRe = new RegExp("(^https?://[^/]+/search/results|/search/save|/toc/|/results(#.+)?$)");
	if(searchRe.test(url)) {
	//some old TOCs just display links to pdfs - don't detect those
	if(ZU.xpath(doc, '//div[@class="article"]/h4/a|//div[@class="result_info"]/h1/a|//ul/li/a[text() = "[Access article in HTML]"]').length != 0){
		return "multiple";}
	} else if (url.match(/\/books\//)){
		return "book";
	}
	else {
		return "journalArticle";
	}
}

function doWeb(doc, url) {

	var searchRe = new RegExp("^https?://[^/]+/search/results|/search/save|/results(#.+)?$");
	if(detectWeb(doc, url) == "multiple") {
		var items = {};
		var attachments = new Array();
		var results = ZU.xpath(doc,
			'//div[@class="article"]/h4/a|//div[@class="result_info"]/h1/a');
		if (results.length){
			for(var i=0, n=results.length; i<n; i++) {
				items[results[i].href] = results[i].textContent;
			}
		} else {
			// Some journals have old-style TOCs for back issues
			// Ex. http://muse.jhu.edu/journals/eighteenth-century_studies/toc/ecs33.4.html
			var articles = doc.evaluate('//ul', doc, null, XPathResult.ANY_TYPE, null);
			var article;
			while (article = articles.iterateNext()) {
				var link = doc.evaluate('./li/a[contains(@href,".html")]', article, null, XPathResult.ANY_TYPE, null).iterateNext();
				var title = doc.evaluate('./li/i', article, null, XPathResult.ANY_TYPE, null).iterateNext();
				if(link && link.href && title && title.textContent) {
					items[link.href] = title.textContent;
				}
			}
		}

		Zotero.selectItems(items, function(items) {
			if(!items) {
				return true;
			}	
			var i;
			var urls = [];
			for (i in items) {urls.push(i);};
			Zotero.Utilities.processDocuments(urls, scrapeOne, function() {Zotero.done();}, null);		
		});
	} else scrapeOne(doc);
	Zotero.wait();
}

// Given an article page, get the RIS and open it
function scrapeOne(doc) {
	var url = doc.location.href;
	var hostRe = new RegExp("^(https?://[^/]+)/");
		var m = hostRe.exec(url);
		var host = m[1];

	if (url.match(/\/books\//)){
		var abstract = ZU.xpathText(doc, '//div[@class="book_info"]/div[@class="description"]')
		var citurl = ZU.xpathText(doc, '//li[@class="view_citation"]/a/@href');
		var newUrl = host + citurl;
			Zotero.Utilities.HTTP.doGet(newUrl, function(text) {
			text=text.match(/TY  -(.+\n)+ER  -/)[0]
				var translator = Zotero.loadTranslator("import");
			//set RIS translator
			translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
			translator.setString(text);
			translator.setHandler("itemDone", function(obj, item) {
			item.attachments.push({document:doc, title:"Project MUSE Snapshot"});
			if (abstract){
				item.abstractNote=abstract.replace(/\n/g, " ").replace(/\s\s+/g, " ");
			}
			item.complete();
			});
			translator.translate();
			})
	}
	
	else{
	
		var getPDF = doc.evaluate('//a[text() = "PDF Version" or text() = "[Access article in PDF]" or text() = "Download PDF"]', doc,
								  null, XPathResult.ANY_TYPE, null).iterateNext();		
		var DOI = doc.evaluate('//meta[@name="citation_doi"]/@content', doc,
								  null, XPathResult.ANY_TYPE, null).iterateNext();		
		var abstract = doc.evaluate('//div[@class="abstract"]', doc,
								  null, XPathResult.ANY_TYPE, null).iterateNext();
		var authorNodes = ZU.xpath(doc, '//meta[@name="citation_author"]/@content');

		if(url.indexOf('?') != -1) {
			var m = url.match(/[?&]ur[li]=([^&]+)/i);
			if(m) url = host + decodeURIComponent(m[1]);
		}

		var newUrl = url.replace(host, host+"/metadata/zotero").replace("/summary/","/");
		Zotero.Utilities.HTTP.doGet(newUrl, function(text) {
			var translator = Zotero.loadTranslator("import");
			//set RIS translator
			translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
			translator.setString(text);
			translator.setHandler("itemDone", function(obj, item) {
				if(item.notes && item.notes[0]) {
					item.extra = item.notes[0].note;						
					delete item.notes;
					item.notes = undefined;
				}
				//Muse has authors wrong in the RIS - we get the names from google/highwire metadata and use them
				// they're also inconsistent about comma use, so we're using the code from the Embedded Metadata translator to distinguish
				if(authorNodes.length){
					item.creators = [];
						for(var i=0, n=authorNodes.length; i<n; i++) {
							//make sure there are no empty authors
							var authors = authorNodes[i].nodeValue.replace(/(;[^A-Za-z0-9]*)$/, "").split(/\s*;\s/);
							if (authors.length == 1) {
								/* If we get nothing when splitting by semicolon, and at least two words on
								* either side of the comma when splitting by comma, we split by comma. */
								var authorsByComma = authors[0].split(/\s*,\s*/);
								if (authorsByComma.length > 1
									&& authorsByComma[0].indexOf(" ") !== -1
									&& authorsByComma[1].indexOf(" ") !== -1)
									authors = authorsByComma;
							}
							for(var j=0, m=authors.length; j<m; j++) {
								var author = authors[j];
								item.creators.push(ZU.cleanAuthor(author, "author", author.indexOf(",") !== -1));
							}
						}
				
				}
				else{
					//apparently Muse is inconsistent with google data
					//assume single field names are personal authors with wrong RIS. Not perfect
					//but by far the most likely scenario.
					for(var i in item.creators){
						if(!item.creators[i].firstName){
							item.creators[i] = ZU.cleanAuthor(item.creators[i].lastName, item.creators[i].creatorType, false);
						}
					}
				}
				item.attachments.splice(0);
				item.attachments.push({document:doc, title:"Project MUSE Snapshot"});
				if(getPDF) {
					item.attachments.push({title:"Project MUSE Full Text PDF", mimeType:"application/pdf",
					url:getPDF.href});
				}
				if(DOI) {
					item.DOI = DOI.textContent.replace(/^DOI: /,"");
				}
				if(abstract) {
					item.abstractNote = abstract.textContent.replace(/\n/g, " ").replace(/\s\s+/g, " ");
				}
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
		"url": "http://muse.jhu.edu/journals/past_and_present/summary/v191/191.1higonnet.html",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Patrice L. R.",
						"lastName": "Higonnet",
						"creatorType": "author"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Project MUSE Snapshot"
					},
					{
						"title": "Project MUSE Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Terror, Trauma and the 'Young Marx' Explanation of Jacobin Politics",
				"publicationTitle": "Past & Present",
				"volume": "191",
				"issue": "1",
				"pages": "121-164",
				"ISSN": "1477-464X",
				"url": "http://muse.jhu.edu/journals/past_and_present/v191/191.1higonnet.html",
				"date": "2006",
				"extra": "<p>Number 191, May 2006</p>",
				"abstractNote": "In lieu of an abstract, here is a brief excerpt of the content: Past & Present 191.1 (2006) 121-164 Patrice Higonnet Harvard University Tocqueville in the 1850s wrote of France in the 1780s that never had tolerance been more accepted, authority been more mild, or benevolence been so widely practised. Nonetheless, he went on, 'from the bosom of such mild mores would spring the most inhuman of revolutions'. And even for those of us who deeply admire the French Revolution's message of civic equality, the Terror of the Year II (1793–4) seems not just ominous and horrendous, but also out of place. Auschwitz, Dresden and Hiroshima — after the Great War of 1914–18 and the Great Depression of the 1930s: we can see why these wartime tragedies happened, given the awful events that preceded them. But what of the Terror after the Enlightenment — after Voltaire, Boucher, and Madame de Pompadour? Isser Woloch has rightly described the 'sequence' from 1789 to 1793, from liberalism to terror, as an eternally fascinating 'enigma'. Why the French Revolution occurred is something of a mystery. And why it failed so dramatically is also deeply perplexing. Historians have pored over the cause and nature of the Terror of the Year II ever since it occurred. And yet the many valuable (though often conflicting) explanations which have been offered to account for it have somehow fallen short. Many of them are too narrow or too vague. They are seldom wrong in any simple sense, but they need to be reconceived. I propose that there is an extant and even ancient frame, the 'young Marx explanation', which, if rejuvenated by reference to the theory of collective trauma, can enable us to renew these accounts, first by identifying new ground for research, but principally by making it possible to integrate the seemingly irreconcilable points of view about why the unanimity of 1789 gave way by 1792–4 to a divisive and self-destructive intolerance. I A first step is to review explanations, past and present, that range from culture and ideology (Rousseauian Jacobinism was bound to end as it did) to circumstance (where the circumstances might be social, political or institutional). For many reasons, it is important to have these various answers in mind — however biased or incomplete they may have been: first, because explanations of Revolutionary terrorism are suggestive in their own right since they indirectly chronicle two centuries of historiographic effort; second, because their very number speaks to the importance of the Terror as a historical event, and of course any understanding of the French Revolution must subsume an understanding of the Terror; and third, because the variety and incompatibility of extant accounts underscore the interest of any explanation that aims to reconcile opposing points of view. As regards larger ideological explanations, a good place to begin is with François Furet, since his is the dominant mode of explanation today. This brilliant historian was unambiguous: for him, the 'revolutionary government' 'was written in the logic of Montagnard policy'. The Terror, taken as government policy by the Convention, does not originate in September 1793 at all, but in the past (both recent and distant): The circumstances surrounding this celebrated vote indicate that before becoming a set of repressive institutions used by the Republic to liquidate its adversaries and establish its domination on a basis of fear, the Terror was a demand based on political conviction or beliefs, a characteristic feature of the mentality of revolutionary activism. From this perspective, the Terror is the illegitimate child of the Enlightenment — begotten, perhaps, on the Enlightenment by Jean-Jacques Rousseau. The year 1793 is embedded in 1789. Furet's first and most talented disciple, Keith Baker, gives us a new (and, it must be said, extreme) version of this same ideological causal perspective. What, he asks, was the implication of the path chosen by the National Assembly in September 1789 over the issue of the king's suspensive veto? At stake here, he argues in a historical version of 'path determinacy', was the setting aside of a discourse of the social, grounded on the notion of the differential distribution of reason, functions, and interests in modern civil society, in favor of a discourse of the political...",
				"libraryCatalog": "Project MUSE"
			}
		]
	},
	{
		"type": "web",
		"url": "http://muse.jhu.edu/journals/journal_of_social_history/toc/jsh.44.4.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://muse.jhu.edu/journals/eighteenth-century_studies/toc/ecs33.4.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://muse.jhu.edu/books/9780820705057",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "Theis",
						"firstName": "Jeffrey S.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Project MUSE Snapshot"
					}
				],
				"title": "Writing the Forest in Early Modern England: A Sylvan Pastoral Nation",
				"publisher": "Duquesne University Press",
				"place": "Pittsburgh, PA",
				"ISBN": "9780820705057",
				"date": "2009",
				"abstractNote": "In Writing the Forest in Early Modern England: A Sylvan Pastoral Nation, Jeffrey S. Theis focuses on pastoral literature in early modern England as an emerging form of nature writing. In particular, Theis analyzes what happens when pastoral writing is set in forests — what he terms “sylvan pastoral.”\nDuring the sixteenth and seventeenth centuries, forests and woodlands played an instrumental role in the formation of individual and national identities in England. Although environmentalism as we know it did not yet exist, persistent fears of timber shortages led to a larger anxiety about the status of forests. Perhaps more important, forests were dynamic and contested sites of largely undeveloped spaces where the poor would migrate in a time of rising population when land became scarce. And in addition to being a place where the poor would go, the forest also was a playground for monarchs and aristocrats where they indulged in the symbolically rich sport of hunting.\nConventional pastoral literature, then, transforms when writers use it to represent and define forests and the multiple ways in which English society saw these places. In exploring these themes, authors expose national concerns regarding deforestation and forest law and present views relating to land ownership, nationhood, and the individual’s relationship to nature. Of particular interest are the ways in which cultures turn confusing spaces into known places and how this process is shaped by nature, history, gender, and class.\nTheis examines the playing out of these issues in familiar works by Shakespeare, such as A Midsummer Night’s Dream, The Merry Wives of Windsor, and As You Like It, Andrew Marvell’s “Upon Appleton House,” John Milton’s Mask and Paradise Lost, as well as in lesser known prose works of the English Revolution, such as James Howell’s Dendrologia>/i> and John Evelyn’s Sylva.\nAs a unique ecocritical study of forests in early modern English literature, Writing the Forest makes an important contribution to the growing field of the history of environmentalism, and will be of interest to those working in literary and cultural history as well as philosophers concerned with nature and space theory.\n       show less, In Writing the Forest in Early Modern England: A Sylvan Pastoral Nation, Jeffrey S. Theis focuses on pastoral literature in early modern England as an emerging form of nature writing. In particular, Theis analyzes what happens when pastoral writing is set in forests — what he terms “sylvan pastoral.” During the sixteenth and seventeenth centuries, forests and woodlands played an instrumental role in the formation of individual and national identities in England. Although environmentalism as we know it did not yet exist, persistent fears of timber shortages led to a larger anxiety about the status of forests. Perhaps more important . . .  show more",
				"libraryCatalog": "Project MUSE",
				"shortTitle": "Writing the Forest in Early Modern England"
			}
		]
	},
	{
		"type": "web",
		"url": "http://muse.jhu.edu/login?auth=0&type=summary&url=/journals/technology_and_culture/v054/54.4.prescott.html",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Heather",
						"lastName": "Prescott",
						"creatorType": "author"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Project MUSE Snapshot"
					}
				],
				"title": "The Pill at Fifty: Scientific Commemoration and the Politics of American Memory",
				"publicationTitle": "Technology and Culture",
				"volume": "54",
				"issue": "4",
				"pages": "735-745",
				"ISSN": "1097-3729",
				"url": "http://muse.jhu.edu/journals/technology_and_culture/v054/54.4.prescott.html",
				"date": "2013",
				"extra": "<p>Volume 54, Number 4, October 2013</p>",
				"DOI": "10.1353/tech.2013.0137",
				"abstractNote": "Abstract Abstract:This article uses coverage of the fiftieth anniversary of the Pill as an example of what Richard Hirsh describes as the “real world” role of historians of technology. It explores how the presentation of historical topics on the world wide web has complicated how the history of technology is conveyed to the public. The article shows that that the Pill is especially suited to demonstrating the public role of historians of technology because, as the most popular form of reversible birth control, it has touched the lives of millions of Americans. Thus, an exploration of how the Pill’s fiftieth anniversary was covered illustrates how historians can use their expertise to provide a nuanced interpretation of a controversial topic in the history of technology.",
				"libraryCatalog": "Project MUSE",
				"shortTitle": "The Pill at Fifty"
			}
		]
	}
]
/** END TEST CASES **/