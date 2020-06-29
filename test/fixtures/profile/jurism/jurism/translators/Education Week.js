{
	"translatorID": "7e51d3fb-082e-4063-8601-cda08f6004a3",
	"label": "Education Week",
	"creator": "Ben Parr",
	"target": "^https?://(www2?\\.|blogs\\.)?edweek\\.org/",
	"minVersion": "1.0.0b4.r1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-06-02 11:18:49"
}

function detectWeb(doc,url)
{
	   var namespace = doc.documentElement.namespaceURI;
	   var nsResolver = namespace ? function(prefix) {
	   if (prefix == 'x') return namespace; else return null;
	   } : null;

	   var xpath='//meta[@name="Story_type"]/@content';
	   var temp=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE,null).iterateNext();
	   if (temp)
	   {
			   if (temp.value=="Blog")
					   {return "blogPost";}
			   if (temp.value.indexOf("Story")>-1)
					   {return "magazineArticle";}
	   }
}

function associateMeta(newItem, metaTags, field, zoteroField) {
	  if (metaTags[field]) {
			  newItem[zoteroField] = metaTags[field];
	  }
}

function scrape(doc, url) {

	  var newItem = new Zotero.Item("magazineArticle");
	   if (url&&url.indexOf("blogs.edweek.org")>-1)
			   {newItem.itemType="blogPost";}

	  newItem.url = doc.location.href;

	  var metaTags = new Object();

	  var metaTagHTML = doc.getElementsByTagName("meta");
	  var i;
	  for (i = 0 ; i < metaTagHTML.length ; i++) {
			  metaTags[metaTagHTML[i].getAttribute("name")]=Zotero.Utilities.cleanTags(metaTagHTML[i].getAttribute("content"));
	  }
	  associateMeta(newItem, metaTags, "Title", "title");
	  associateMeta(newItem, metaTags, "Cover_date", "date");
	  associateMeta(newItem, metaTags, "Description", "abstractNote");
	  associateMeta(newItem, metaTags, "ArticleID", "accessionNumber");
	  associateMeta(newItem,metaTags,"Source","publicationTitle");


		if (metaTags["Authors"]) {
			  var author = Zotero.Utilities.trimInternal(metaTags["Authors"]);
			  if (author.substr(0,3).toLowerCase() == "by ") {
					  author = author.substr(3);
			  }

			  var authors = author.split(" and ");
			  for (var j=0; j<authors.length; j++) {
					var author = authors[j];
					  var words = author.split(" ");
					  for (var i in words) {
							  words[i] = words[i][0].toUpperCase() +words[i].substr(1).toLowerCase();
					  }
					  author = words.join(" ");

		newItem.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));
			  }
	  }

	   newItem.complete();
}

function doWeb(doc,url)
{
	   var namespace = doc.documentElement.namespaceURI;
	   var nsResolver = namespace ? function(prefix) {
	   if (prefix == 'x') return namespace; else return null;
	   } : null;

	  var xpath='//meta[@name="Story_type"]/@content';
	  var temp=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE,null).iterateNext();
	  if (temp)
	  {
			 if (temp.value.indexOf("Story")>-1 || temp.value=="Blog")
					   {scrape(doc,url);}
	  }
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.edweek.org/ew/articles/2011/10/28/10jobs.h31.html?tkn=PUOFjigAbQPNufjjHPxYeafVz7T5Tf16qNb4&cmp=clp-edweek",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Obama Using Education Issue as Political Sword - Education Week",
				"creators": [
					{
						"firstName": "Michele",
						"lastName": "Mcneil",
						"creatorType": "author"
					}
				],
				"date": "2011-11-02",
				"abstractNote": "The Obama administration highlights its education record, while drawing a sharp contrast with the GOP in Congress.",
				"libraryCatalog": "Education Week",
				"publicationTitle": "Education Week",
				"url": "http://www.edweek.org/ew/articles/2011/10/28/10jobs.h31.html?tkn=PUOFjigAbQPNufjjHPxYeafVz7T5Tf16qNb4&cmp=clp-edweek",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/