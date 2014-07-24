{
    "translatorID": "06142d59-fa9c-48c3-982b-6e7c67d3d6b8",
    "label": "The Hindu",
    "creator": "Piyush Srivastava",
    "target": "https?://www\\.thehindu\\.com/.*ece",
    "minVersion": "1.0",
    "maxVersion": "",
    "priority": 100,
    "inRepository": true,
    "translatorType": 4,
    "browserSupport": "gcv",
    "lastUpdated": "2013-11-19 08:23:18"
}

/*****
   Copyright 2013, Piyush Srivastava.

   This program is free software: you can redistribute it and/or
   modify it under the terms of the GNU Affero General Public License
   as published by the Free Software Foundation, either version 3 of
   the License, or (at your option) any later version.

   This program is distributed in the hope that it will be useful, but
   WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
   Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public
   License along with this program.  If not, see
   <http://www.gnu.org/licenses/>.

*****/

/**
The current Zotero translator for "The Hindu" interfaces only with the
newspaper's old website www.hindu.com (which is now used only for
archival purposes).  

This translator interfaces with www.thehindu.com, the current website
of the newspaper.

**/

function detectWeb(doc, url) {
    return "newspaperArticle";
}


function insertCreator(authorName, newItem){
    /*Check for some author name conventions unique to the Hindu*/
    /*Right now we are using the following: 
      
      1) PTI, a news agency, is often credited as an author on The
      Hindu articles.  We just change the author status to
      "contributor", and retain the capitalization.
      
      2) Some articles are bylined "Special Coresspondent".  Again, we
      change the author status to "contributor".
      
    */
    authorName = Zotero.Utilities.capitalizeTitle(authorName.toLowerCase(), true);
    authorStatus = "author";
    if (authorName == "Pti"){
	authorName = "PTI";
	authorStatus = "contributor";
	newItem.creators.push({lastName: authorName, 
			       creatorType: 'contributor', 
			       fieldMode: 1});
    } else if (authorName == "Special Correspondent"){
	authorStatus = "contributor";
	newItem.creators.push({lastName: "Correspondent", 
			       firstName: "Special", 
			       creatorType: 'contributor', 
			       fieldMode: 1});
    } else {
	newItem.creators.push(Zotero.Utilities.cleanAuthor(authorName, authorStatus));
    }
}

function scrape(doc, url){
    
    var newItem = new Zotero.Item('newspaperArticle');
    newItem.url = doc.location.href;
    newItem.language = "en-IN";
    
    
    newItem.publicationTitle = "The Hindu";
    newItem.ISSN = "0971-751X";
    
    //Get title of the news article via xpath
    var titleXPath = '//h1[@class="detail-title"]';
    var titleString = doc.evaluate(titleXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
    newItem.title = titleString;
    
    
    //Get author(s) of the article
    var authorXPath = '//span[@class="author"]';
    var authorListObject = doc.evaluate(authorXPath, doc, null, 
					XPathResult.ANY_TYPE, null);
    var authorObject = authorListObject.iterateNext();
    while (authorObject){
	insertCreator(authorObject.textContent, newItem);
	authorObject = authorListObject.iterateNext();
    }
    
    //date and Place
    var datePlaceXPath = '//span[@class="dateline"]';
    var placeXPath='//span[@class="dateline"]/span[@class="upper"]';
    var datePlaceString = doc.evaluate(datePlaceXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
    var placeString = doc.evaluate(placeXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
    var dateString = datePlaceString.replace(placeString, ""); //Remove place info from date
    dateString = dateString.replace(/^\s+|\s+$/g, '');
    placeString = placeString.replace(/^(\s|,)+|(\s|,)+$/g, '');
    newItem.place=Zotero.Utilities.capitalizeTitle(placeString, true);//remove trailing commans and whitespace;
    newItem.date=dateString;
    
    //keywords
    var keywordXPath='//div[@id="articleKeywords"]//a[@href="#"]';
    var keywordListObject  = doc.evaluate(keywordXPath, doc, null,
					  XPathResult.ANY_TYPE, null);
    var keywordObject = keywordListObject.iterateNext();
    while(keywordObject){
	newItem.tags.push(keywordObject.textContent);
	keywordObject = keywordListObject.iterateNext();
    }
    
    //Store a snapshot of the page
    newItem.attachments.push({
	title:"The Hindu Snapshot",
	document:doc});
    
    newItem.complete();
}


function doWeb(doc, url) {
    scrape(doc, url);
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.thehindu.com/news/national/sincere-regrets-stop/article4914819.ece",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "Shiv Sahay",
						"lastName": "Singh",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Telegram",
					"Telegraph service",
					"BSNL",
					"Telegram service discontinuation"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "The Hindu Snapshot"
					}
				],
				"url": "http://www.thehindu.com/news/national/sincere-regrets-stop/article4914819.ece",
				"language": "en-IN",
				"publicationTitle": "The Hindu",
				"ISSN": "0971-751X",
				"title": "Telegram no more STOP 100 STOP",
				"place": "Kolkata",
				"date": "July 14, 2013",
				"libraryCatalog": "The Hindu",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.thehindu.com/features/once-favoured-now-forgotten/article4912011.ece?homepage=true",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "Anusha",
						"lastName": "Parthasarathy",
						"creatorType": "author"
					},
					{
						"firstName": "Lakshmi",
						"lastName": "Krupa",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Transistor radio",
					"Cassette tapes",
					"Floppy discs",
					"VCR",
					"Pager",
					"Gramophone",
					"Typewriter",
					"Roll films",
					"Dial-up"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "The Hindu Snapshot"
					}
				],
				"url": "http://www.thehindu.com/features/once-favoured-now-forgotten/article4912011.ece?homepage=true",
				"language": "en-IN",
				"publicationTitle": "The Hindu",
				"ISSN": "0971-751X",
				"title": "Once favoured, now forgotten",
				"place": "Chennai",
				"date": "July 14, 2013",
				"libraryCatalog": "The Hindu",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.thehindu.com/business/Economy/petrol-prices-to-go-up-by-rs-155-per-litre/article4914855.ece",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"lastName": "PTI",
						"creatorType": "contributor",
					        "fieldMode" : 1
					}
				],
				"notes": [],
				"tags": [
					"Petrol price hike",
					"oil marketing companies",
					"oil imports",
					"Rupee fall"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "The Hindu Snapshot"
					}
				],
				"url": "http://www.thehindu.com/business/Economy/petrol-prices-to-go-up-by-rs-155-per-litre/article4914855.ece",
				"language": "en-IN",
				"publicationTitle": "The Hindu",
				"ISSN": "0971-751X",
				"title": "Petrol prices to go up by Rs. 1.55 per litre",
				"place": "New Delhi",
				"date": "July 14, 2013",
				"libraryCatalog": "The Hindu",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.thehindu.com/opinion/columns/Chandrasekhar/the-forgotten-software-boom/article4914571.ece",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "C. P.",
						"lastName": "Chandrasekhar",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"IT industry",
					"ITeS",
					"NASSCOM",
					"economic slowdown"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "The Hindu Snapshot"
					}
				],
				"url": "http://www.thehindu.com/opinion/columns/Chandrasekhar/the-forgotten-software-boom/article4914571.ece",
				"language": "en-IN",
				"publicationTitle": "The Hindu",
				"ISSN": "0971-751X",
				"title": "The forgotten software boom",
				"date": "July 14, 2013",
				"libraryCatalog": "The Hindu",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/
