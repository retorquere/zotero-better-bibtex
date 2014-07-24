{
	"translatorID": "850f4c5f-71fb-4669-b7da-7fb7a95500ef",
	"label": "Cambridge Journals Online",
	"creator": "Sean Takats, Michael Berkowitz and Avram Lyon",
	"target": "^https?://[^/]*journals.cambridge.org[^/]*//?action/(quickSearch|search|displayAbstract|displayFulltext|displayIssue)",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-09-19 00:39:54"
}

function detectWeb(doc, url)	{
	var namespace=doc.documentElement.namespaceURI;
	var nsResolver=namespace?function(prefix)	{
		return (prefix=="x")?namespace:null;
	}:null;
	var xpath = '//div[@class="tableofcontents-row"][div/input[@type="checkbox"][@name="toView"]]';
	if ((url.indexOf("/action/displayAbstract") != -1) || (url.indexOf("action/displayFulltext") != -1)){
		return "journalArticle";
	} else if (doc.evaluate(xpath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()){
		return "multiple";			
	}
}

function doWeb(doc, url){
	var namespace=doc.documentElement.namespaceURI;
	var nsResolver=namespace?function(prefix)	{
		return (prefix=="x")?namespace:null;
	}:null;
	var host = doc.location.host;
	var urlstring="http://" + host + "/action/exportCitation";
	var datastring="format=RIS&emailId=&Download=Download&componentIds=";
	var links = new Array();
	if(detectWeb(doc, url) == "multiple"){
		var xpath = '//div[@class="tableofcontents-row"][div/input[@type="checkbox"][@name="toView"]]';
		var tableRows = doc.evaluate(xpath, doc, nsResolver, XPathResult.ANY_TYPE, null);
		var tableRow;
		var items={};
		while (tableRow = tableRows.iterateNext()){
			var id = doc.evaluate('./div/input[@type="checkbox"][@name="toView"]/@value', tableRow, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			var title = doc.evaluate('.//h3', tableRow, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			items['http://' + host + '/action/displayAbstract?aid=' + id.nodeValue] = Zotero.Utilities.capitalizeTitle(title.textContent);
		}
		Zotero.selectItems(items, function(items) {
			for (var i in items) {
				links.push(i);
			}
			Zotero.Utilities.processDocuments(links, scrape,
						function() {Zotero.done();});
		});
	} else {
		scrape(doc);
	}
	Zotero.wait();
}

function scrape (doc) {
	var namespace=doc.documentElement.namespaceURI;
	var nsResolver=namespace?function(prefix)	{
		return (prefix=="x")?namespace:null;
	}:null;

	var host = doc.location.host;
	var urlstring="http://" + host + "/action/exportCitation";
	var datastring="format=RIS&emailId=&Download=Download&componentIds=";

		var locURL = doc.location.href;
		var abs;
		if (abs = doc.evaluate('//p[@class="section-title" and contains(text(),"Abstract")]/following-sibling::p[not(@class) and text() != ""]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
			abs = abs.textContent;
		}
		if (doc.evaluate('//p[@class="KeyWords"]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
			var kws = doc.evaluate('//p[@class="KeyWords"]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent.substr(11).split('; ');
		}
		//Z.debug(locURL)
		//on pages with a PDF Frame, we can now just take the download link and this will work
		if(locURL.indexOf("displayFulltext?type=1")!= -1) var pdfpath = '//ul[@class="articles"]//a[img[@title="Download PDF"]]'
		else var pdfpath='//div/ul/li/a[contains(text(), "PDF")]';
		if (doc.evaluate(pdfpath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
			var pdflink = doc.evaluate(pdfpath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().href;
		}
		idRe = /aid=([0-9]+)/
		var m = idRe.exec(locURL);
		var id = m[1];
		Zotero.Utilities.doGet(urlstring + "?" + datastring+id, function(text) {
			text = text.replace(/(^|\n)?([A-Z\d]{2})\s+\-\s+(\n)?/g, "\n$2  - $3");
			var translator = Zotero.loadTranslator("import");
			// Use RIS importer
			translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
			translator.setString(text);
			translator.setHandler("itemDone", function(obj, item) {
				item.attachments = 	[{url:locURL,
							title:"Cambridge Journals Snapshot",
							mimeType:"text/html"}];
				item.title = Zotero.Utilities.capitalizeTitle(item.title);
				var authors = item.creators;
				item.creators = new Array();
				for each (var aut in authors) {
					// correct all-caps, if present
					if (aut.firstName && aut.firstName.toUpperCase() == aut.firstName)
						aut.firstName=Zotero.Utilities.capitalizeTitle(aut.firstName.toLowerCase(),true);	
					if (aut.lastName && aut.lastName.toUpperCase() == aut.lastName)
						aut.lastName=Zotero.Utilities.capitalizeTitle(aut.lastName.toLowerCase(),true);	
					item.creators.push({firstName:aut.firstName,
								lastName:aut.lastName,
								creatorType:"author"});
				}
				if (item.tags.length === 1) item.tags = item.tags[0].split(",");
				if (abs) item.abstractNote = Zotero.Utilities.trimInternal(abs);
				if (pdflink) {
					// Some PDFs aren't paywalled, so they don't need the 2nd request
					item.attachments.push({
						url: pdflink,
						title: "Cambridge Journals PDF", 
						mimeType:"application/pdf"
					});
					//Z.debug(pdflink)
					Zotero.Utilities.doGet(pdflink, function(text) {
					//	Z.debug(text)
						var domain = pdflink.match(/^https?:\/\/[^\/]+\//);
						var realpdf = text.match(/<iframe src="\/(action\/displayFulltext[^"]+)"/);
						if (realpdf && domain) {
							// If we matched the IFRAME, the first attachment must be bad
							for (var i in item.attachments) {
								if (item.attachments[i].mimeType.indexOf("pdf") !== -1)
									item.attachments[i].url = (domain[0]+realpdf[1]).replace(/&amp;/g,"&");
							};
						}
					}, function () {
						item.complete();
					});
				} else {
					item.complete();
				}
			});
			translator.translate();
		});
	}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://journals.cambridge.org/action/displayAbstract?fromPage=online&aid=8267699&fulltextType=RA&fileId=S0021875810001738",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Laurie A.",
						"lastName": "Rodrigues",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"url": false,
						"title": "Cambridge Journals Snapshot",
						"mimeType": "text/html"
					},
					{
						"url": false,
						"title": "Cambridge Journals PDF",
						"mimeType": "application/pdf"
					}
				],
				"date": "2011",
				"title": "“SAMO© as an Escape Clause”: Jean-Michel Basquiat's Engagement with a Commodified American Africanism",
				"publicationTitle": "Journal of American Studies",
				"pages": "227-243",
				"volume": "45",
				"issue": "02",
				"DOI": "10.1017/S0021875810001738",
				"abstractNote": "Heir to the racist configuration of the American art exchange and the delimiting appraisals of blackness in the American mainstream media, Jean-Michel Basquiat appeared on the late 1970s New York City street art scene – then he called himself “SAMO.” Not long thereafter, Basquiat grew into one of the most influential artists of an international movement that began around 1980, marked by a return to figurative painting. Given its rough, seemingly untrained and extreme, conceptual nature, Basquiat's high-art oeuvre might not look so sophisticated to the uninformed viewer. However, Basquiat's work reveals a powerful poetic and visual gift, “heady enough to confound academics and hip enough to capture the attention span of the hip hop nation,” as Greg Tate has remarked. As noted by Richard Marshall, Basquiat's aesthetic strength actually comes from his striving “to achieve a balance between the visual and intellectual attributes” of his artwork. Like Marshall, Tate, and others, I will connect with Basquiat's unique, self-reflexively experimental visual practices of signifying and examine anew Basquiat's active contribution to his self-alienation, as Hebdige has called it. Basquiat's aesthetic makes of his paintings economies of accumulation, building a productive play of contingency from the mainstream's constructions of race. This aesthetic move speaks to a need for escape from the perceived epistemic necessities of blackness. Through these economies of accumulation we see, as Tate has pointed out, Basquiat's “intellectual obsession” with issues such as ancestry/modernity, personhood/property and originality/origins of knowledge, driven by his tireless need to problematize mainstream media's discourses surrounding race – in other words, a commodified American Africanism.",
				"libraryCatalog": "Cambridge Journals Online",
				"shortTitle": "“SAMO© as an Escape Clause”"
			}
		]
	},
	{
		"type": "web",
		"url": "http://journals.cambridge.org/action/displayIssue?decade=2010&jid=PSR&volumeId=107&issueId=02&iid=8919472",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://journals.cambridge.org/action/displayFulltext?type=1&fid=8267701&jid=AMS&volumeId=45&issueId=02&aid=8267699&bodyId=&membershipNumber=&societyETOCSession=",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Laurie A.",
						"lastName": "Rodrigues",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Cambridge Journals Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Cambridge Journals PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "“SAMO© as an Escape Clause”: Jean-Michel Basquiat's Engagement with a Commodified American Africanism",
				"publicationTitle": "Journal of American Studies",
				"pages": "227-243",
				"volume": "45",
				"issue": "02",
				"DOI": "10.1017/S0021875810001738",
				"date": "2011",
				"libraryCatalog": "Cambridge Journals Online",
				"shortTitle": "“SAMO© as an Escape Clause”"
			}
		]
	}
]
/** END TEST CASES **/