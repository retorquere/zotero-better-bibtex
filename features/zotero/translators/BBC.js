{
	"translatorID": "f4130157-93f7-4493-8f24-a7c85549013d",
	"label": "BBC",
	"creator": "Ben Parr",
	"target": "^https?://(?:www|news?)\\.bbc\\.co\\.uk",
	"minVersion": "1.0.0b4.r1",
	"maxVersion": "",
	"priority": 100,
	"browserSupport": "gcsibv",
	"inRepository": true,
	"translatorType": 4,
	"lastUpdated": "2012-08-06 19:23:07"
}

function detectWeb(doc, url)
{

	   var namespace = doc.documentElement.namespaceURI;
	  var nsResolver = namespace ? function(prefix) {
	  if (prefix == 'x') return namespace; else return null;
	  } : null;

	var xpath;
	  
	 xpath='//meta[@name="Headline"]';
	 if(content=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE, null).iterateNext())
	 { return "newspaperArticle";  }
	 
	 xpath='//font[@class="poshead"]/b';
	 if(doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE, null).iterateNext())
	{ return "newspaperArticle";  }
	
	  return null;
}

function scrape(doc,url,title)
{
		  var namespace = doc.documentElement.namespaceURI;
	 		  var nsResolver = namespace ? function(prefix) {
	  		  if (prefix == 'x') return namespace; else return null;
	  		  } : null;
		 
		 var newItem = new Zotero.Item("newspaperArticle");
	
 		 newItem.url=url;
		 newItem.repository="bbc.co.uk";
		 newItem.publicationTitle="BBC";
		 newItem.title=title;
		 
		 xpath='//meta[@name="OriginalPublicationDate"]/@content';
		 var temp=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE, null).iterateNext();
		 if(temp)
		 {
		temp=temp.value;
		 	temp=temp.split(" ")[0];
		 	newItem.date=temp;
		 }
		 else
		 {
			 xpath='//font[@class="postxt"][@size="1"]';
			 var rows=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE, null);
			 var row;
			 while(row=rows.iterateNext())
			 {
				 temp=row.textContent;
				 if(temp.substr(0,9)=="Created: ")
				 {
					 newItem.date=temp.substr(9);
					 break;
				 }
			 }
		 }
		 
		 xpath='//meta[@name="Section"]/@content';
		temp=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE, null).iterateNext();
		 if(temp)
		 { 	newItem.section=temp.value;     }
		 
		 xpath='//meta[@name="Description"]/@content';
		 temp=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE, null).iterateNext();
		 if(temp)
		 { 	newItem.abstractNote=temp.value;     }
		 else
		 {
			 xpath='//meta[@name="description"]/@content';
		 		 temp=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE, null).iterateNext();
				 if(temp)
				 { 	newItem.abstractNote=temp.value;     }
		 }
		 
		 newItem.attachments.push({url:url, title:"BBC News Snapshot",mimeType:"text/html"});
		 
		 newItem.complete();
}



function doWeb(doc,url)
{
	   var namespace = doc.documentElement.namespaceURI;
	  var nsResolver = namespace ? function(prefix) {
	  if (prefix == 'x') return namespace; else return null;
	  } : null;
	  
	  var xpath='//meta[@name="Headline"]/@content';
	  var title;
	 if(title=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE, null).iterateNext())
	 	{  scrape(doc,url,title.value) }
	 else
	 {
		 xpath='//font[@class="poshead"]/b';
		 if(title=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE, null).iterateNext())
			 	{   scrape(doc,url,title.textContent)  }
	 }

	 
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.bbc.co.uk/news/magazine-15335899",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"url": "http://www.bbc.co.uk/news/magazine-15335899",
						"title": "BBC News Snapshot",
						"mimeType": "text/html"
					}
				],
				"url": "http://www.bbc.co.uk/news/magazine-15335899",
				"publicationTitle": "BBC",
				"title": "Spain's stolen babies",
				"date": "2011/10/18",
				"section": "Magazine",
				"abstractNote": "Spanish society has been shaken by revelations of the mass trafficking of babies, dating back to the Franco era but continuing until the 1990s involving respected doctors, nuns and priests.",
				"libraryCatalog": "bbc.co.uk",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/