{
	"translatorID": "ce7a3727-d184-407f-ac12-52837f3361ff",
	"label": "NYTimes.com",
	"creator": "Philipp Zumstein",
	"target": "^https?://(query\\.nytimes\\.com/(search|gst)/|(select\\.|www\\.|mobile\\.|[^\\/.]*\\.blogs\\.)?nytimes\\.com/)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-04-22 06:48:50"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Philipp Zumstein
	
	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	//we use another function name to avoid confusions with the
	//same function from the called EM translator (sigh)
	return detectWebHere(doc, url);
}


function detectWebHere(doc, url) {
	if (url.includes('/search/') && getSearchResults(doc, true)) {
		return "multiple";
	}
	if (ZU.xpathText(doc, '//meta[@property="og:type" and @content="article"]/@content')) {
		if (url.indexOf('blog')>-1) {
			return "blogPost";
		} else {
			return "newspaperArticle";
		}
	}
}


function scrape(doc, url) {
	var type = detectWebHere(doc, url);
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	//translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		item.itemType = type;
		item.language = ZU.xpathText(doc, '//meta[@itemprop="inLanguage"]/@content') || "en-US";
		if (item.date) {
			item.date = ZU.strToISO(item.date);
		} else {
			item.date = attr(doc, 'time', 'datetime')
				|| attr(doc, 'meta[itemprop="dateModified"]', 'content');
		}
		if (item.itemType == "blogPost") {
			item.blogTitle = ZU.xpathText(doc, '//meta[@property="og:site_name"]/@content');
		} else {
			item.publicationTitle = "The New York Times";
			item.ISSN = "0362-4331";
		}
		//Multiple authors are (sometimes) just put into the same Metadata field
		var authors = attr(doc,'meta[name="author"]', 'content') || attr(doc, 'meta[name="byl"]', 'content') || text(doc, '*[class^="Byline-bylineAuthor--"]');
		if (authors && item.creators.length<=1) {
			authors = authors.replace(/^By /, '');
			if (authors == authors.toUpperCase()) // convert to title case if all caps
				authors = ZU.capitalizeTitle(authors, true);
			item.creators = [];
			var authorsList = authors.split(/,|\band\b/);
			for (let i=0; i<authorsList.length; i++) {
				item.creators.push(ZU.cleanAuthor(authorsList[i], "author"));
			}
		}
		item.url = ZU.xpathText(doc, '//link[@rel="canonical"]/@href') || url;
		if (item.url && item.url.substr(0,2)=="//") {
			item.url = "https:" + item.url;
		}
		item.libraryCatalog = "NYTimes.com";
		// Convert all caps title of NYT archive pages to title case
		if (item.title == item.title.toUpperCase())
				item.title = ZU.capitalizeTitle(item.title, true);
		// Only force all caps to title case when all tags are all caps
		var allcaps = true;
		for (let i=0; i < item.tags.length; i++) {
			if (item.tags[i] != item.tags[i].toUpperCase()) {
				allcaps = false;
				break;
			}
		}
		if (allcaps) {
			for (let i=0; i < item.tags.length; i++) {
				item.tags[i] = ZU.capitalizeTitle(item.tags[i], true);
			}
		}
		/* TODO: Fix saving the PDF attachment which is currently broken
		
		// PDF attachments are in subURL with key & signature
		var pdfurl = ZU.xpathText(doc, '//div[@id="articleAccess"]//span[@class="downloadPDF"]/a[contains(@href, "/pdf")]/@href | //a[@class="button download-pdf-button"]/@href');
		if (pdfurl) {
			ZU.processDocuments(pdfurl, 
				function(pdfDoc) {
					authenticatedPDFURL = pdfDoc.getElementById('archivePDF').src;
					if (authenticatedPDFURL) {
						item.attachments.push({
							title: "NYTimes Archive PDF",
							mimeType: 'application/pdf',
							url: authenticatedPDFURL
						});
					} else {
						Z.debug("Could not find authenticated PDF URL");
						item.complete();
					}
				},
				function() {
					Z.debug("PDF retrieved: "+authenticatedPDFURL);
					item.complete();
				}
			);
		} else {
		*/
			Z.debug("Not attempting PDF retrieval");
			item.complete();
		//}
	});
	
	translator.getTranslatorObject(function(trans) {
		trans.splitTags = false;
		trans.addCustomFields({
			'dat': 'date',
		});
		trans.doWeb(doc, url);
	});
	
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('li');// filter inside the loop
	for (var i=0; i<rows.length; i++) {
		if (!rows[i].className.includes('SearchResults-item')) continue;
		var href = ZU.xpathText(rows[i], '(.//a)[1]/@href');
		var title = ZU.xpathText(rows[i], './/h4');
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.nytimes.com/1912/03/05/archives/two-money-inquiries-hearings-of-trust-charges-and-aldrich-plan-at.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "TWO MONEY INQUIRIES.; Hearings of Trust Charges and Aldrich Plan at the Same Time.",
				"creators": [
					{
						"firstName": "Special to The New York",
						"lastName": "Times",
						"creatorType": "author"
					}
				],
				"date": "1912-03-05",
				"ISSN": "0362-4331",
				"language": "en-US",
				"libraryCatalog": "NYTimes.com",
				"publicationTitle": "The New York Times",
				"section": "Archives",
				"url": "https://www.nytimes.com/1912/03/05/archives/two-money-inquiries-hearings-of-trust-charges-and-aldrich-plan-at.html",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "NYTimes Archive PDF",
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
		"url": "http://www.nytimes.com/2010/08/21/education/21harvard.html?_r=1&scp=1&sq=marc%20hauser&st=cse",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Harvard Finds Marc Hauser Guilty of Scientific Misconduct",
				"creators": [
					{
						"firstName": "Nicholas",
						"lastName": "Wade",
						"creatorType": "author"
					}
				],
				"date": "2010-08-20",
				"ISSN": "0362-4331",
				"abstractNote": "The university has found Marc Hauser “solely responsible” for eight instances of scientific misconduct.",
				"language": "en-US",
				"libraryCatalog": "NYTimes.com",
				"publicationTitle": "The New York Times",
				"section": "Education",
				"url": "https://www.nytimes.com/2010/08/21/education/21harvard.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Ethics",
					"Harvard University",
					"Hauser, Marc D",
					"Research",
					"Science and Technology"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.nytimes.com/search/#/marc+hauser",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://opinionator.blogs.nytimes.com/2013/06/19/our-broken-social-contract/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Our Broken Social Contract",
				"creators": [
					{
						"firstName": "Thomas B.",
						"lastName": "Edsall",
						"creatorType": "author"
					}
				],
				"date": "2013-06-19",
				"abstractNote": "At their core, are America’s problems primarily economic or moral?",
				"blogTitle": "Opinionator",
				"language": "en-US",
				"url": "https://opinionator.blogs.nytimes.com/2013/06/19/our-broken-social-contract/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Economic Conditions and Trends",
					"Income Inequality",
					"Social Conditions and Trends",
					"Thomas B. Edsall",
					"United States",
					"United States Economy"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.nytimes.com/2015/05/10/nyregion/manicurists-in-new-york-area-are-underpaid-and-unprotected.html?_r=0",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "반짝이는 매니큐어에 숨겨진 네일 미용사들의 어두운 삶",
				"creators": [
					{
						"firstName": "Sarah Maslin",
						"lastName": "Nir",
						"creatorType": "author"
					}
				],
				"date": "2015-05-07",
				"ISSN": "0362-4331",
				"abstractNote": "뉴욕타임스는 취재 중 많은 네일숍 직원들이 부당한 대우와 인종차별 및 학대에 흔하게 시달리며 정부 노동자법률기구의 보호도 제대로 받지 못한다는 사실을 발견했다.",
				"language": "ko-KR",
				"libraryCatalog": "NYTimes.com",
				"publicationTitle": "The New York Times",
				"section": "N.Y. / Region",
				"url": "https://www.nytimes.com/2015/05/10/nyregion/manicurists-in-new-york-area-are-underpaid-and-unprotected.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Beauty Salons",
					"Discrimination",
					"Korean-Americans",
					"Labor and Jobs",
					"New York City",
					"Wages and Salaries"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.nytimes.com/2017/05/24/us/politics/russia-trump-manafort-flynn.html?hp&action=click&pgtype=Homepage&clickSource=story-heading&module=span-ab-top-region&region=top-news&WT.nav=top-news&_r=0",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Top Russian Officials Discussed How to Influence Trump Aides Last Summer",
				"creators": [
					{
						"firstName": "Matthew",
						"lastName": "Rosenberg",
						"creatorType": "author"
					},
					{
						"firstName": "Adam",
						"lastName": "Goldman",
						"creatorType": "author"
					},
					{
						"firstName": "Matt",
						"lastName": "Apuzzo",
						"creatorType": "author"
					}
				],
				"date": "2017-05-24",
				"ISSN": "0362-4331",
				"abstractNote": "American spies collected intelligence last summer revealing that Russians were debating how to work with Trump advisers, current and former officials say.",
				"language": "en-US",
				"libraryCatalog": "NYTimes.com",
				"publicationTitle": "The New York Times",
				"section": "Politics",
				"url": "https://www.nytimes.com/2017/05/24/us/politics/russia-trump-manafort-flynn.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Cyberwarfare and Defense",
					"Espionage and Intelligence Services",
					"Flynn, Michael T",
					"Manafort, Paul J",
					"Presidential Election of 2016",
					"Russia",
					"Trump, Donald J",
					"United States Politics and Government"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://query.nytimes.com/gst/abstract.html?res=9406EFDF153DE532A25751C1A96F9C946791D6CF&login=email&auth=login-email&legacy=true",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Draft Deferment Scored at Rutgers",
				"creators": [],
				"date": "1966-09-12",
				"ISSN": "0362-4331",
				"abstractNote": "NEW BRUNSWICK, Sept. 11 (AP)--About 1,000 Rutgers University freshmen were urged today by Paul Goodman, author, to go out and campaign for the abolition of the student draft deferment.",
				"language": "en-US",
				"libraryCatalog": "NYTimes.com",
				"publicationTitle": "The New York Times",
				"url": "http://query.nytimes.com/gst/abstract.html?res=9406EFDF153DE532A25751C1A96F9C946791D6CF",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "NYTimes Archive PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					""
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.nytimes.com/1970/11/12/archives/ideological-labels-changing-along-with-the-labelmakers-ideological.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Ideological Labels Changing Along With the Label–Makers",
				"creators": [
					{
						"firstName": "Israel",
						"lastName": "Shenker",
						"creatorType": "author"
					}
				],
				"date": "1970-11-12",
				"ISSN": "0362-4331",
				"abstractNote": "Comment on labeling pol ideology of intellectuals, apropos of Prof N Glazer coming pub of book of essays on subject; Glazer classification of P Goodman, D Macdonald, M Harrington, I Howe and late C W Mills noted; Goodman, Macdonald, Howe, Harrington, Prof Trilling, I Kristol, N Podhoretz, D Bell, B Rustin, Prof H Rosenberg comment; some pors",
				"language": "en-US",
				"libraryCatalog": "NYTimes.com",
				"publicationTitle": "The New York Times",
				"section": "Archives",
				"url": "https://www.nytimes.com/1970/11/12/archives/ideological-labels-changing-along-with-the-labelmakers-ideological.html",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "NYTimes Archive PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Bell, Daniel",
					"Glazer, Nathan",
					"Goodman, Paul",
					"Howe, Irving",
					"Intellectuals",
					"Kristol, Irving",
					"Macdonald, Dwight",
					"Podhoretz, Norman",
					"Politics and Government",
					"Trilling, Lionel",
					"United States"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.nytimes.com/2017/07/03/business/oreo-new-flavors.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "When Just Vanilla Won’t Do, How About a Blueberry Pie Oreo?",
				"creators": [
					{
						"firstName": "Maya",
						"lastName": "Salam",
						"creatorType": "author"
					}
				],
				"date": "2017-07-03",
				"ISSN": "0362-4331",
				"abstractNote": "The company has increasingly been experimenting with limited-edition flavors that seemed designed as much for an Instagram feed as they are to be eaten.",
				"language": "en-US",
				"libraryCatalog": "NYTimes.com",
				"publicationTitle": "The New York Times",
				"section": "Business Day",
				"url": "https://www.nytimes.com/2017/07/03/business/oreo-new-flavors.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Contests and Prizes",
					"Cookies",
					"Mondelez International Inc",
					"Oreo",
					"Social Media"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://mobile.nytimes.com/2018/01/11/opinion/social-media-dumber-steven-pinker.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Opinion | Social Media Is Making Us Dumber. Here’s Exhibit A.",
				"creators": [
					{
						"firstName": "Jesse",
						"lastName": "Singal",
						"creatorType": "author"
					}
				],
				"date": "2018-01-11",
				"ISSN": "0362-4331",
				"abstractNote": "Steven Pinker is a liberal, Jewish professor. But social media convinced people that he’s a darling of the alt-right.",
				"language": "en-US",
				"libraryCatalog": "NYTimes.com",
				"publicationTitle": "The New York Times",
				"section": "Opinion",
				"url": "https://www.nytimes.com/2018/01/11/opinion/social-media-dumber-steven-pinker.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Anti-Semitism"
					},
					{
						"tag": "Fringe Groups and Movements"
					},
					{
						"tag": "Harvard University"
					},
					{
						"tag": "Jews and Judaism"
					},
					{
						"tag": "Pinker, Steven"
					},
					{
						"tag": "Social Media"
					},
					{
						"tag": "Twitter"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.nytimes.com/interactive/2017/11/10/us/men-accused-sexual-misconduct-weinstein.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "After Weinstein: 71 Men Accused of Sexual Misconduct and Their Fall From Power",
				"creators": [
					{
						"firstName": "Sarah",
						"lastName": "Almukhtar",
						"creatorType": "author"
					},
					{
						"firstName": "Michael",
						"lastName": "Gold",
						"creatorType": "author"
					},
					{
						"firstName": "Larry",
						"lastName": "Buchanan",
						"creatorType": "author"
					}
				],
				"date": "2017-11-10",
				"ISSN": "0362-4331",
				"abstractNote": "A list of men who have resigned, been fired or otherwise lost power since the Harvey Weinstein scandal broke.",
				"language": "en-US",
				"libraryCatalog": "NYTimes.com",
				"publicationTitle": "The New York Times",
				"section": "U.S.",
				"shortTitle": "After Weinstein",
				"url": "https://www.nytimes.com/interactive/2017/11/10/us/men-accused-sexual-misconduct-weinstein.html, https://www.nytimes.com/interactive/2017/11/10/us/men-accused-sexual-misconduct-weinstein.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "#MeToo Movement"
					},
					{
						"tag": "Besh, John (1968- )"
					},
					{
						"tag": "C K, Louis"
					},
					{
						"tag": "Conyers, John Jr"
					},
					{
						"tag": "Cornish, Tony"
					},
					{
						"tag": "Franken, Al"
					},
					{
						"tag": "Franks, Trent"
					},
					{
						"tag": "Huff, Justin"
					},
					{
						"tag": "Keillor, Garrison"
					},
					{
						"tag": "Lauer, Matt"
					},
					{
						"tag": "Levine, James"
					},
					{
						"tag": "Lizza, Ryan"
					},
					{
						"tag": "Masterson, Danny (1976- )"
					},
					{
						"tag": "Price, Roy (1967- )"
					},
					{
						"tag": "Rose, Charlie"
					},
					{
						"tag": "Sex Crimes"
					},
					{
						"tag": "Sexual Harassment"
					},
					{
						"tag": "Simmons, Russell"
					},
					{
						"tag": "Spacey, Kevin"
					},
					{
						"tag": "Stein, Lorin"
					},
					{
						"tag": "Weinstein, Harvey"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
