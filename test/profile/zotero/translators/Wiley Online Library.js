{
	"translatorID": "fe728bc9-595a-4f03-98fc-766f1d8d0936",
	"label": "Wiley Online Library",
	"creator": "Sean Takats, Michael Berkowitz, Avram Lyon and Aurimas Vinckevicius",
	"target": "^https?://onlinelibrary\\.wiley\\.com[^\\/]*/(?:book|doi|advanced/search|search-web/cochrane|cochranelibrary/search|o/cochrane/(clcentral|cldare|clcmr|clhta|cleed|clabout)/articles/.+/sect0.html)",
	"minVersion": "3.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2014-04-24 04:17:46"
}

/*
   Wiley Online Translator
   Copyright (C) 2011 CHNM, Avram Lyon and Aurimas Vinckevicius

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function fixCase(authorName) {
	if(typeof authorName != 'string') return authorName;
	
	if(authorName.toUpperCase() == authorName ||
		authorName.toLowerCase() == authorName) {
		return ZU.capitalizeTitle(authorName, true);
	}

	return authorName;
}

function addCreators(item, creatorType, creators) {
	if( typeof(creators) == 'string' ) {
		creators = [creators];
	} else if( !(creators instanceof Array) ) {
		return;
	}

	for(var i=0, n=creators.length; i<n; i++) {
		item.creators.push(ZU.cleanAuthor(fixCase(creators[i]),
							creatorType, false));
	}
}

function getAuthorName(text) {
	//lower case words at the end of a name are probably not part of a name
	text = text.replace(/(\s+[a-z]+)+\s*$/,'');

	text = text.replace(/(^|[\s,])(PhD|MA|Prof|Dr)(\.?|(?=\s|$))/gi,'');	//remove salutations

	return fixCase(text.trim());
}

function scrapeBook(doc, url, pdfUrl) {
	var title = doc.getElementById('productTitle');
	if( !title ) return false;

	var newItem = new Zotero.Item('book');
	newItem.title = ZU.capitalizeTitle(title.textContent, true);
	
	var data = ZU.xpath(doc, '//div[@id="metaData"]/p');
	var dataRe = /^(.+?):\s*(.+?)\s*$/;
	var match;
	var isbn = new Array();
	for( var i=0, n=data.length; i<n; i++) {
		match = dataRe.exec(data[i].textContent);
		if(!match) continue;

		switch(match[1].trim().toLowerCase()) {
			case 'author(s)':
				addCreators(newItem, 'author', match[2].split(', '));
				break;
			case 'series editor(s)':
				addCreators(newItem, 'seriesEditor', match[2].split(', '));
				break;
			case 'editor(s)':
				addCreators(newItem, 'editor', match[2].split(', '));
				break;
			case 'published online':
				var date = ZU.strToDate(match[2]);
				date.part = null;
				newItem.date = ZU.formatDate(date);
				break;
			case 'print isbn':
			case 'online isbn':
				isbn.push(match[2]);
				break;
			case 'doi':
				newItem.DOI = match[2];
				break;
			case 'book series':
				newItem.series = match[2];
		}
	}

	newItem.ISBN = isbn.join(', ');
	newItem.rights = ZU.xpathText(doc, '//div[@id="titleMeta"]/p[@class="copyright"]');
	newItem.url = url;
	newItem.abstractNote = ZU.trimInternal(
			ZU.xpathText(doc, '//div[@id="homepageContent"]\
				/h6[normalize-space(text())="About The Product"]\
				/following-sibling::p', null, "\n") || "");
	newItem.accessDate = 'CURRENT_TIMESTAMP';

	newItem.complete();
}

function scrapeEM(doc, url, pdfUrl) {
	var itemType = detectWeb(doc, url);
	
	//fetch print publication date
	var date = ZU.xpathText(doc, '//meta[@name="citation_date"]/@content');

	//remove duplicate meta tags
	var metas = ZU.xpath(doc,
		'//head/link[@media="screen,print"]/following-sibling::meta');
	for(var i=0, n=metas.length; i<n; i++) {
		metas[i].parentNode.removeChild(metas[i]);
	}
	var translator = Zotero.loadTranslator('web');
	//use Embedded Metadata
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler('itemDone', function(obj, item) {
		if( itemType == 'bookSection' ) {
			//add authors if we didn't get them from embedded metadata
			if(!item.creators.length) {
				var authors = ZU.xpath(doc, '//ol[@id="authors"]/li/node()[1]');
				for(var i=0, n=authors.length; i<n; i++) {
					item.creators.push(
						ZU.cleanAuthor( getAuthorName(authors[i].textContent),
											'author',false) );
				}
			}

			//editors
			var editors = ZU.xpath(doc, '//ol[@id="editors"]/li/node()[1]');
			for(var i=0, n=editors.length; i<n; i++) {
				item.creators.push(
					ZU.cleanAuthor( getAuthorName(editors[i].textContent),
										'editor',false) );
			}

			item.rights = ZU.xpathText(doc, '//p[@id="copyright"]');

			//this is not great for summary, but will do for now
			item.abstractNote = ZU.xpathText(doc, '//div[@id="abstract"]/div[@class="para"]//p', null, "\n");
		} else {
			var keywords = ZU.xpathText(doc, '//meta[@name="citation_keywords"]/@content');
			if(keywords) {
				item.tags = keywords.split(', ');
			}
			item.rights = ZU.xpathText(doc, '//div[@id="titleMeta"]//p[@class="copyright"]');
			item.abstractNote = ZU.xpathText(doc, '//div[@id="abstract"]/div[@class="para"]', null, "\n");
		}

		//set correct print publication date
		if(date) item.date = date;

		//remove pdf attachments
		for(var i=0, n=item.attachments.length; i<n; i++) {
			if(item.attachments[i].mimeType == 'application/pdf') {
				item.attachments.splice(i,1);
				i--;
				n--;
			}
		}

		//fetch pdf url. There seems to be some magic value that must be sent
		// with the request
		if(!pdfUrl) {
			var u = ZU.xpathText(doc, '//meta[@name="citation_pdf_url"]/@content');
			if(u) {
				ZU.doGet(u, function(text) {
					var m = text.match(/<iframe id="pdfDocument"[^>]+?src="([^"]+)"/i);
					if(m) {
						m[1] = ZU.unescapeHTML(m[1]);
						Z.debug(m[1]);
						item.attachments.push({url: m[1], title: 'Full Text PDF', mimeType: 'application/pdf'});
					} else {
						Z.debug('Could not determine PDF URL.');
						m = text.match(/<iframe[^>]*>/i);
						if(m) Z.debug(m[0]);
					}
					item.complete();
				});
			} else {
				item.complete();
			}
		} else {
			item.attachments.push({url: pdfUrl, title: 'Full Text PDF', mimeType: 'application/pdf'});
			item.complete();
		}
	});
	
	translator.getTranslatorObject(function(em) {
		em.itemType = itemType;
		em.doWeb(doc, url);
	});
}

function scrapeBibTeX(doc, url, pdfUrl) {
	var doi = ZU.xpathText(doc, '(//meta[@name="citation_doi"])[1]/@content')
		|| ZU.xpathText(doc, '(//input[@name="publicationDoi"])[1]/@value');
	if(!doi) {
		doi = ZU.xpathText(doc, '(//p[@id="doi"])[1]');
		if(doi) doi = doi.replace(/^\s*doi:\s*/i, '');
	}
	
	if(!doi) {
		scrapeEM(doc, url, pdfUrl);
		return;
	}
	//leaving this here in case it's still needed
	//var baseUrl = url.match(/https?:\/\/[^\/]+/);
	var postUrl = '/documentcitationdownloadformsubmit';
	var body = 'doi=' + encodeURIComponent(doi) + 
				'&fileFormat=REFERENCE_MANAGER' +
				'&hasAbstract=CITATION_AND_ABSTRACT';
	ZU.doPost(postUrl, body, function(text) {
		//Z.debug(text)
		var translator = Zotero.loadTranslator('import');
		//use RIS
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);

		translator.setHandler('itemDone', function(obj, item) {
			//fix author case
			for(var i=0, n=item.creators.length; i<n; i++) {
				item.creators[i].firstName = fixCase(item.creators[i].firstName);
				item.creators[i].lastName = fixCase(item.creators[i].lastName);
			}

			//editors
			var editors = ZU.xpath(doc, '//ol[@id="editors"]/li/node()[1]');
			for(var i=0, n=editors.length; i<n; i++) {
				item.creators.push(
					ZU.cleanAuthor( getAuthorName(editors[i].textContent),
										'editor',false) );
			}
			
			//title
			if(item.title && item.title.toUpperCase() == item.title) {
				item.title = ZU.capitalizeTitle(item.title, true);
			}
			
			//tags
			if(!item.tags.length) {
				var keywords = ZU.xpathText(doc,
					'//meta[@name="citation_keywords"][1]/@content');
				if(keywords) {
					item.tags = keywords.split(', ');
				}
			}

			//url in bibtex is invalid
			item.url =
				ZU.xpathText(doc,
					'//meta[@name="citation_summary_html_url"][1]/@content') ||
				ZU.xpathText(doc,
					'//meta[@name="citation_abstract_html_url"][1]/@content') ||
				ZU.xpathText(doc,
					'//meta[@name="citation_fulltext_html_url"][1]/@content') ||
				url;

			//bookTitle
			if(!item.bookTitle) {
				item.bookTitle = item.publicationTitle ||
					ZU.xpathText(doc,
						'//meta[@name="citation_book_title"][1]/@content');
			}

			//language
			if(!item.language) {
				item.language = ZU.xpathText(doc,
					'//meta[@name="citation_language"][1]/@content');
			}

			//rights
			item.rights = ZU.xpathText(doc,
				'//p[@class="copyright" or @id="copyright"]');

			//attachments
			item.attachments = [{
				title: 'Snapshot',
				document: doc,
				mimeType: 'text/html'
			}];

			//fetch pdf url. There seems to be some magic value that must be sent
			// with the request
			if(!pdfUrl &&
				(pdfUrl =
					ZU.xpathText(doc,'(//meta[@name="citation_pdf_url"]/@content)[1]')
					|| ZU.xpathText(doc, '(//a[@class="pdfLink"]/@href)[1]')
				)
			) {
				ZU.doGet(pdfUrl, function(text) {
					var m = text.match(
						/<iframe id="pdfDocument"[^>]+?src="([^"]+)"/i);
					if(m) {
						m[1] = ZU.unescapeHTML(m[1]);
						Z.debug('PDF url: ' + m[1]);
						item.attachments.push({url: m[1],
							title: 'Full Text PDF',
							mimeType: 'application/pdf'});
					} else {
						Z.debug('Could not determine PDF URL.');
						m = text.match(/<iframe[^>]*>/i);
						if(m) Z.debug(m[0]);
						else Z.debug('No iframe found');
					}
					item.complete();
				});
			} else {
				if(pdfUrl)
					item.attachments.push({url: pdfUrl,
						title: 'Full Text PDF',
						mimeType: 'application/pdf'});
				item.complete();
			}
		});

		translator.translate();
	});
}

function scrapeCochraneTrial(doc, url){
	Z.debug("Scraping Cochrane External Sources");
	var item = new Zotero.Item('journalArticle');
	//Z.debug(ZU.xpathText(doc, '//meta/@content'))
	item.title = ZU.xpathText(doc, '//meta[@name="Article-title"]/@content');
	item.publicationTitle = ZU.xpathText(doc, '//meta[@name="source"]/@content');
	item.abstractNote = ZU.xpathText(doc, '//meta[@name="abstract"]/@content');
	item.date = ZU.xpathText(doc, '//meta[@name="simpleYear"]/@content');
	item.volume = ZU.xpathText(doc, '//meta[@name="volume"]/@content');
	item.pages = ZU.xpathText(doc, '//meta[@name="pages"]/@content');
	item.issue = ZU.xpathText(doc, '//meta[@name="issue"]/@content');
	item.rights = ZU.xpathText(doc, '//meta[@name="Copyright"]/@content');
	var tags = ZU.xpathText(doc, '//meta[@name="cochraneGroupCode"]/@content');
	if (tags) tags = tags.split(/\s*;\s*/);
	for (var i in tags){
		item.tags.push(tags[i]);
	}
	item.attachments.push({document: doc, title: "Cochrane Snapshot", mimType: "text/html"});
	var authors = ZU.xpathText(doc, '//meta[@name="orderedAuthors"]/@content');
	if (!authors) authors = ZU.xpathText(doc, '//meta[@name="Author"]/@content');

	authors = authors.split(/\s*,\s*/);
	for (var i in authors){
		//authors are in the forms Smith AS
		var authormatch = authors[i].match(/(.+?)\s+([A-Z]+(\s[A-Z])?)/);
		item.creators.push({lastName: authormatch[1], firstName: authormatch[2], creatorType: "author"}) ;
		}
	item.complete();
}

function scrape(doc, url, pdfUrl) {
	var itemType = detectWeb(doc,url);

	if( itemType == 'book' ) {
		scrapeBook(doc, url, pdfUrl);
	} else {
		if (url.search(/\/o\/cochrane\/(clcentral|cldare|clcmr|clhta|cleed|clabout)/)!=-1) scrapeCochraneTrial(doc, url);
		//scrapeEM(doc, url, pdfUrl);
		else scrapeBibTeX(doc, url, pdfUrl);
	}
}

function getSearchResults(doc, url) {
	var links = ZU.xpath(doc, '//li//div[@class="citation article" or starts-with(@class,"citation")]/a');
	if(links.length) return links;
	
	Z.debug("Cochrane Library");
	return ZU.xpath(doc, '//div[@class="listingContent"]//td/strong/a[contains(@href, "/doi/")]');
}



function detectWeb(doc, url) {
	//monitor for site changes on Cochrane
	if(doc.getElementsByClassName('cochraneSearchForm').length && doc.getElementById('searchResultOuter')) {
		Zotero.monitorDOMChanges(doc.getElementById('searchResultOuter'));
	}
	
	if( url.indexOf('/issuetoc') != -1 ||
		url.indexOf('/results') != -1 ||
		url.indexOf('/search') != -1 ||
		url.indexOf('/mainSearch?') != -1) {
		if(getSearchResults(doc, url).length) return 'multiple';
	} else {
		if(url.indexOf('/book/') != -1 ) {
			//if the book has more than one chapter, scrape chapters
			if(getSearchResults(doc, url).length > 1) return 'multiple';
			//otherwise, import book
			return 'book'; //does this exist?
		} else if ( ZU.xpath(doc, '//meta[@name="citation_book_title"]').length ) {
			return 'bookSection';
		} else {
			return 'journalArticle';
		}
	}
}

function doWeb(doc, url) {

	var type = detectWeb(doc, url);
	if(type == "multiple") {
		var articles = getSearchResults(doc, url);
		var availableItems = new Object();
		for(var i=0, n=articles.length; i<n; i++) {
			availableItems[articles[i].href] = ZU.trimInternal(articles[i].textContent.trim());
		}

		Zotero.selectItems(availableItems, function(selectedItems) {
			if(!selectedItems) return true;

			var urls = new Array();
			for (var i in selectedItems) {
				//for Cochrane trials - get the frame with the actual data
				if(i.indexOf("frame.html")!=-1) i = i.replace(/frame\.html$/, "sect0.html");
				urls.push(i);
			}

			ZU.processDocuments(urls, scrape);
		});
	} else { //single article
		if (url.indexOf("/pdf") != -1) {
			//redirect needs to work where URL end in /pdf and where it end in /pdf/something
			url = url.replace(/\/pdf(.+)?$/,'/abstract');
			//Zotero.debug("Redirecting to abstract page: "+url);
			//grab pdf url before leaving
			var pdfUrl = ZU.xpathText(doc, '//iframe[@id="pdfDocument"]/@src');
			ZU.processDocuments(url, function(doc) { scrape(doc, doc.location.href, pdfUrl) });
		} else if(type != 'book' &&
				url.indexOf('abstract') == -1 && url.indexOf("/o/cochrane/") == -1 &&
				!ZU.xpathText(doc, '//div[@id="abstract"]/div[@class="para"]')) {
			//redirect to abstract or summary so we can scrape that
			
			if(type == 'bookSection') {
				url = url.replace(/\/[^?#\/]+(?:[?#].*)?$/, '/summary');
			} else {
				url = url.replace(/\/[^?#\/]+(?:[?#].*)?$/, '/abstract');
			}
			ZU.processDocuments(url, function(doc) { scrape(doc, doc.location.href) });
		} else {
			scrape(doc, url);
		}
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/advanced/search/results/reentry?scope=allContent&query=zotero&inTheLastList=6&queryStringEntered=false&searchRowCriteria[0].fieldName=all-fields&searchRowCriteria[0].booleanConnector=and&searchRowCriteria[1].fieldName=all-fields&searchRowCriteria[1].booleanConnector=and&searchRowCriteria[2].fieldName=all-fields&searchRowCriteria[2].booleanConnector=and&start=1&resultsPerPage=20&ordering=relevancy",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/9781118269381.notes/summary",
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"lastName": "Bonk",
						"firstName": "Curtis J.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Endnotes",
				"publisher": "Jossey-Bass",
				"ISBN": "9781118269381",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/9781118269381.notes/summary",
				"DOI": "10.1002/9781118269381.notes",
				"pages": "427-467",
				"bookTitle": "The World is Open",
				"date": "2011",
				"language": "en",
				"rights": "Copyright © 2009 Curtis J. Bonk. All rights reserved.",
				"libraryCatalog": "Wiley Online Library",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1111/jgi.2004.19.issue-s1/issuetoc",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/book/10.1002/9783527610853",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/9781444304794.ch1/summary",
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"lastName": "Pavlović",
						"firstName": "Tatjana",
						"creatorType": "author"
					},
					{
						"lastName": "Alvarez",
						"firstName": "Inmaculada",
						"creatorType": "author"
					},
					{
						"lastName": "Blanco-Cano",
						"firstName": "Rosana",
						"creatorType": "author"
					},
					{
						"lastName": "Grisales",
						"firstName": "Anitra",
						"creatorType": "author"
					},
					{
						"lastName": "Osorio",
						"firstName": "Alejandra",
						"creatorType": "author"
					},
					{
						"lastName": "Sánchez",
						"firstName": "Alejandra",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"silent cinema and its pioneers (1906–1930)",
					"Ángel García Cardona's El ciego de aldea (1906)",
					"Ángel García Cardona and Antonio Cuesta",
					"Ricardo Baños and Albert Marro's Don Pedro el Cruel (1911)",
					"Fructuós Gelabert's Amor que mata (1909)",
					"three films - part of “the preliminary industrial and expressive framework for Spain's budding cinema”",
					"Directors (Life and Works) - Ángel García Cardona and Antonio Cuesta13",
					"Ricardo Baños",
					"Florián Rey's La aldea maldita (1930)",
					"Florián Rey (Antonio Martínez de Castillo)",
					"Fructuós Gelabert - made the first Spanish fiction film, Riña en un café, 1897"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Silent Cinema and its Pioneers (1906–1930)",
				"publisher": "Wiley-Blackwell",
				"ISBN": "9781444304794",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/9781444304794.ch1/summary",
				"DOI": "10.1002/9781444304794.ch1",
				"pages": "1-20",
				"bookTitle": "100 Years of Spanish Cinema",
				"date": "2008",
				"abstractNote": "This chapter contains sections titled:\n\n* Historical and Political Overview of the Period\n* Context11\n* Film Scenes: Close Readings\n* Directors (Life and Works)\n* Critical Commentary",
				"language": "en",
				"rights": "Copyright © 2009 Tatjana Pavlović, Inmaculada Alvarez, Rosana Blanco-Cano, Anitra Grisales, Alejandra Osorio, and Alejandra Sánchez",
				"libraryCatalog": "Wiley Online Library",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/book/10.1002/9781444390124",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/book/10.1002/9780470320419",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "An",
						"firstName": "Zhenming",
						"creatorType": "author"
					},
					{
						"lastName": "Chen",
						"firstName": "Yudan",
						"creatorType": "author"
					},
					{
						"lastName": "Koomen",
						"firstName": "John M.",
						"creatorType": "author"
					},
					{
						"lastName": "Merkler",
						"firstName": "David J.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"α-Amidated peptide",
					"Post-translational modification",
					"Spectral pairing",
					"Technology"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "A mass spectrometry-based method to screen for α-amidated peptides",
				"publicationTitle": "PROTEOMICS",
				"journalAbbreviation": "Proteomics",
				"volume": "12",
				"issue": "2",
				"publisher": "WILEY-VCH Verlag",
				"ISSN": "1615-9861",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/abstract",
				"DOI": "10.1002/pmic.201100327",
				"pages": "173-182",
				"date": "January 1, 2012",
				"abstractNote": "Amidation is a post-translational modification found at the C-terminus of ∼50% of all neuropeptide hormones. Cleavage of the Cα–N bond of a C-terminal glycine yields the α-amidated peptide in a reaction catalyzed by peptidylglycine α-amidating monooxygenase (PAM). The mass of an α-amidated peptide decreases by 58 Da relative to its precursor. The amino acid sequences of an α-amidated peptide and its precursor differ only by the C-terminal glycine meaning that the peptides exhibit similar RP-HPLC properties and tandem mass spectral (MS/MS) fragmentation patterns. Growth of cultured cells in the presence of a PAM inhibitor ensured the coexistence of α-amidated peptides and their precursors. A strategy was developed for precursor and α-amidated peptide pairing (PAPP): LC-MS/MS data of peptide extracts were scanned for peptide pairs that differed by 58 Da in mass, but had similar RP-HPLC retention times. The resulting peptide pairs were validated by checking for similar fragmentation patterns in their MS/MS data prior to identification by database searching or manual interpretation. This approach significantly reduced the number of spectra requiring interpretation, decreasing the computing time required for database searching and enabling manual interpretation of unidentified spectra. Reported here are the α-amidated peptides identified from AtT-20 cells using the PAPP method.",
				"bookTitle": "PROTEOMICS",
				"language": "en",
				"rights": "Copyright © 2012 WILEY-VCH Verlag GmbH & Co. KGaA, Weinheim",
				"libraryCatalog": "Wiley Online Library",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/full",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "An",
						"firstName": "Zhenming",
						"creatorType": "author"
					},
					{
						"lastName": "Chen",
						"firstName": "Yudan",
						"creatorType": "author"
					},
					{
						"lastName": "Koomen",
						"firstName": "John M.",
						"creatorType": "author"
					},
					{
						"lastName": "Merkler",
						"firstName": "David J.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"α-Amidated peptide",
					"Post-translational modification",
					"Spectral pairing",
					"Technology"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "A mass spectrometry-based method to screen for α-amidated peptides",
				"publicationTitle": "PROTEOMICS",
				"journalAbbreviation": "Proteomics",
				"volume": "12",
				"issue": "2",
				"publisher": "WILEY-VCH Verlag",
				"ISSN": "1615-9861",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/abstract",
				"DOI": "10.1002/pmic.201100327",
				"pages": "173-182",
				"date": "January 1, 2012",
				"abstractNote": "Amidation is a post-translational modification found at the C-terminus of ∼50% of all neuropeptide hormones. Cleavage of the Cα–N bond of a C-terminal glycine yields the α-amidated peptide in a reaction catalyzed by peptidylglycine α-amidating monooxygenase (PAM). The mass of an α-amidated peptide decreases by 58 Da relative to its precursor. The amino acid sequences of an α-amidated peptide and its precursor differ only by the C-terminal glycine meaning that the peptides exhibit similar RP-HPLC properties and tandem mass spectral (MS/MS) fragmentation patterns. Growth of cultured cells in the presence of a PAM inhibitor ensured the coexistence of α-amidated peptides and their precursors. A strategy was developed for precursor and α-amidated peptide pairing (PAPP): LC-MS/MS data of peptide extracts were scanned for peptide pairs that differed by 58 Da in mass, but had similar RP-HPLC retention times. The resulting peptide pairs were validated by checking for similar fragmentation patterns in their MS/MS data prior to identification by database searching or manual interpretation. This approach significantly reduced the number of spectra requiring interpretation, decreasing the computing time required for database searching and enabling manual interpretation of unidentified spectra. Reported here are the α-amidated peptides identified from AtT-20 cells using the PAPP method.",
				"bookTitle": "PROTEOMICS",
				"language": "en",
				"rights": "Copyright © 2012 WILEY-VCH Verlag GmbH & Co. KGaA, Weinheim",
				"libraryCatalog": "Wiley Online Library",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/references",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "An",
						"firstName": "Zhenming",
						"creatorType": "author"
					},
					{
						"lastName": "Chen",
						"firstName": "Yudan",
						"creatorType": "author"
					},
					{
						"lastName": "Koomen",
						"firstName": "John M.",
						"creatorType": "author"
					},
					{
						"lastName": "Merkler",
						"firstName": "David J.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"α-Amidated peptide",
					"Post-translational modification",
					"Spectral pairing",
					"Technology"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "A mass spectrometry-based method to screen for α-amidated peptides",
				"publicationTitle": "PROTEOMICS",
				"journalAbbreviation": "Proteomics",
				"volume": "12",
				"issue": "2",
				"publisher": "WILEY-VCH Verlag",
				"ISSN": "1615-9861",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/abstract",
				"DOI": "10.1002/pmic.201100327",
				"pages": "173-182",
				"date": "January 1, 2012",
				"abstractNote": "Amidation is a post-translational modification found at the C-terminus of ∼50% of all neuropeptide hormones. Cleavage of the Cα–N bond of a C-terminal glycine yields the α-amidated peptide in a reaction catalyzed by peptidylglycine α-amidating monooxygenase (PAM). The mass of an α-amidated peptide decreases by 58 Da relative to its precursor. The amino acid sequences of an α-amidated peptide and its precursor differ only by the C-terminal glycine meaning that the peptides exhibit similar RP-HPLC properties and tandem mass spectral (MS/MS) fragmentation patterns. Growth of cultured cells in the presence of a PAM inhibitor ensured the coexistence of α-amidated peptides and their precursors. A strategy was developed for precursor and α-amidated peptide pairing (PAPP): LC-MS/MS data of peptide extracts were scanned for peptide pairs that differed by 58 Da in mass, but had similar RP-HPLC retention times. The resulting peptide pairs were validated by checking for similar fragmentation patterns in their MS/MS data prior to identification by database searching or manual interpretation. This approach significantly reduced the number of spectra requiring interpretation, decreasing the computing time required for database searching and enabling manual interpretation of unidentified spectra. Reported here are the α-amidated peptides identified from AtT-20 cells using the PAPP method.",
				"bookTitle": "PROTEOMICS",
				"language": "en",
				"rights": "Copyright © 2012 WILEY-VCH Verlag GmbH & Co. KGaA, Weinheim",
				"libraryCatalog": "Wiley Online Library",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/citedby",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "An",
						"firstName": "Zhenming",
						"creatorType": "author"
					},
					{
						"lastName": "Chen",
						"firstName": "Yudan",
						"creatorType": "author"
					},
					{
						"lastName": "Koomen",
						"firstName": "John M.",
						"creatorType": "author"
					},
					{
						"lastName": "Merkler",
						"firstName": "David J.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"α-Amidated peptide",
					"Post-translational modification",
					"Spectral pairing",
					"Technology"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "A mass spectrometry-based method to screen for α-amidated peptides",
				"publicationTitle": "PROTEOMICS",
				"journalAbbreviation": "Proteomics",
				"volume": "12",
				"issue": "2",
				"publisher": "WILEY-VCH Verlag",
				"ISSN": "1615-9861",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/abstract",
				"DOI": "10.1002/pmic.201100327",
				"pages": "173-182",
				"date": "January 1, 2012",
				"abstractNote": "Amidation is a post-translational modification found at the C-terminus of ∼50% of all neuropeptide hormones. Cleavage of the Cα–N bond of a C-terminal glycine yields the α-amidated peptide in a reaction catalyzed by peptidylglycine α-amidating monooxygenase (PAM). The mass of an α-amidated peptide decreases by 58 Da relative to its precursor. The amino acid sequences of an α-amidated peptide and its precursor differ only by the C-terminal glycine meaning that the peptides exhibit similar RP-HPLC properties and tandem mass spectral (MS/MS) fragmentation patterns. Growth of cultured cells in the presence of a PAM inhibitor ensured the coexistence of α-amidated peptides and their precursors. A strategy was developed for precursor and α-amidated peptide pairing (PAPP): LC-MS/MS data of peptide extracts were scanned for peptide pairs that differed by 58 Da in mass, but had similar RP-HPLC retention times. The resulting peptide pairs were validated by checking for similar fragmentation patterns in their MS/MS data prior to identification by database searching or manual interpretation. This approach significantly reduced the number of spectra requiring interpretation, decreasing the computing time required for database searching and enabling manual interpretation of unidentified spectra. Reported here are the α-amidated peptides identified from AtT-20 cells using the PAPP method.",
				"bookTitle": "PROTEOMICS",
				"language": "en",
				"rights": "Copyright © 2012 WILEY-VCH Verlag GmbH & Co. KGaA, Weinheim",
				"libraryCatalog": "Wiley Online Library",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/3527603018.ch17/summary",
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"lastName": "von Meyer",
						"firstName": "L.",
						"creatorType": "author"
					},
					{
						"lastName": "Külpmann",
						"firstName": "W. R.",
						"creatorType": "author"
					},
					{
						"firstName": "Wolf Rüdiger",
						"lastName": "Külpmann",
						"creatorType": "editor"
					}
				],
				"notes": [],
				"tags": [
					"β-Rezeptorenblocker"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "β-Rezeptorenblocker",
				"publisher": "Wiley-VCH Verlag GmbH & Co. KGaA",
				"ISBN": "9783527603015",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/3527603018.ch17/summary",
				"DOI": "10.1002/3527603018.ch17",
				"pages": "365-370",
				"bookTitle": "Klinisch-toxikologische Analytik",
				"date": "2002",
				"abstractNote": "* Immunoassay\n* Hochleistungsflüssigkeitschromatographie (HPLC)\n* Gaschromatographie\n* Medizinische Beurteilung und klinische Interpretation\n* Literatur",
				"language": "de",
				"rights": "Copyright © 2002 Wiley-VCH Verlag GmbH",
				"libraryCatalog": "Wiley Online Library",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1111/j.1468-5930.2011.00548.x/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Baker",
						"firstName": "Deane-Peter",
						"creatorType": "author"
					},
					{
						"lastName": "Pattison",
						"firstName": "James",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "The Principled Case for Employing Private Military and Security Companies in Interventions for Human Rights Purposes",
				"publicationTitle": "Journal of Applied Philosophy",
				"volume": "29",
				"issue": "1",
				"publisher": "Blackwell Publishing Ltd",
				"ISSN": "1468-5930",
				"url": "http://onlinelibrary.wiley.com/doi/10.1111/j.1468-5930.2011.00548.x/abstract",
				"DOI": "10.1111/j.1468-5930.2011.00548.x",
				"pages": "1-18",
				"date": "February 1, 2012",
				"abstractNote": "The possibility of using private military and security companies to bolster the capacity to undertake intervention for human rights purposes (humanitarian intervention and peacekeeping) has been increasingly debated. The focus of such discussions has, however, largely been on practical issues and the contingent problems posed by private force. By contrast, this article considers the principled case for privatising humanitarian intervention. It focuses on two central issues. First, does outsourcing humanitarian intervention to private military and security companies pose some fundamental, deeper problems in this context, such as an abdication of a state's duties? Second, on the other hand, is there a case for preferring these firms to other, state-based agents of humanitarian intervention? For instance, given a state's duties to their own military personnel, should the use of private military and security contractors be preferred to regular soldiers for humanitarian intervention?",
				"bookTitle": "Journal of Applied Philosophy",
				"language": "en",
				"rights": "Published 2011. This article is a U.S. Government work and is in the public domain in the USA.",
				"libraryCatalog": "Wiley Online Library",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1111/j.1540-6261.1986.tb04559.x/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Lakonishok",
						"firstName": "Josef",
						"creatorType": "author"
					},
					{
						"lastName": "Smidt",
						"firstName": "Seymour",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Volume for Winners and Losers: Taxation and Other Motives for Stock Trading",
				"publicationTitle": "The Journal of Finance",
				"volume": "41",
				"issue": "4",
				"publisher": "Blackwell Publishing Ltd",
				"ISSN": "1540-6261",
				"url": "http://onlinelibrary.wiley.com/doi/10.1111/j.1540-6261.1986.tb04559.x/abstract",
				"DOI": "10.1111/j.1540-6261.1986.tb04559.x",
				"pages": "951-974",
				"date": "September 1, 1986",
				"abstractNote": "Capital gains taxes create incentives to trade. Our major finding is that turnover is higher for winners (stocks, the prices of which have increased) than for losers, which is not consistent with the tax prediction. However, the turnover in December and January is evidence of tax-motivated trading; there is a relatively high turnover for losers in December and for winners in January. We conclude that taxes influence turnover, but other motives for trading are more important. We were unable to find evidence that changing the length of the holding period required to qualify for long-term capital gains treatment affected turnover.",
				"bookTitle": "The Journal of Finance",
				"language": "en",
				"rights": "1986 The American Finance Association",
				"libraryCatalog": "Wiley Online Library",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Volume for Winners and Losers"
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/(SICI)1521-3773(20000103)39:1%3C165::AID-ANIE165%3E3.0.CO;2-B/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Reetz",
						"firstName": "Manfred T.",
						"creatorType": "author"
					},
					{
						"lastName": "Westermann",
						"firstName": "Elke",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"C−C coupling",
					"colloids",
					"palladium",
					"transmission electron microscopy"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Phosphane-Free Palladium-Catalyzed Coupling Reactions: The Decisive Role of Pd Nanoparticles",
				"publicationTitle": "Angewandte Chemie International Edition",
				"journalAbbreviation": "Angewandte Chemie International Edition",
				"volume": "39",
				"issue": "1",
				"publisher": "WILEY-VCH Verlag GmbH",
				"ISSN": "1521-3773",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/(SICI)1521-3773(20000103)39:1<165::AID-ANIE165>3.0.CO;2-B/abstract",
				"DOI": "10.1002/(SICI)1521-3773(20000103)39:1<165::AID-ANIE165>3.0.CO;2-B",
				"pages": "165-168",
				"date": "January 3, 2000",
				"abstractNote": "Nanosized palladium colloids, generated in situ by reduction of PdII to Pd0 [Eq. (a)], are involved in the catalysis of phosphane-free Heck and Suzuki reactions with simple palladium salts such as PdCl2 or Pd(OAc)2, as demonstrated by transmission electron microscopic investigations.",
				"bookTitle": "Angewandte Chemie International Edition",
				"language": "en",
				"rights": "© 2000 WILEY-VCH Verlag GmbH, Weinheim, Fed. Rep. of Germany",
				"libraryCatalog": "Wiley Online Library",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Phosphane-Free Palladium-Catalyzed Coupling Reactions"
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/jhet.5570200408/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Tarumi",
						"firstName": "Y.",
						"creatorType": "author"
					},
					{
						"lastName": "Atsumi",
						"firstName": "T.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Studies on imidazole derivatives and related compounds. 2. Characterization of substituted derivatives of 4-carbamoylimidazolium-5-olate by ultraviolet absorption spectra",
				"publicationTitle": "Journal of Heterocyclic Chemistry",
				"volume": "20",
				"issue": "4",
				"publisher": "Wiley-Blackwell",
				"ISSN": "1943-5193",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/jhet.5570200408/abstract",
				"DOI": "10.1002/jhet.5570200408",
				"pages": "875-885",
				"date": "July 1, 1983",
				"abstractNote": "The representative mono- and dialkyl-substituted derivatives of 4-carbamoylimidazolium-5-olate (1) were synthesized unequivocally. On the basis of their spectral data for ultraviolet absorption spectra in acidic, basic and neutral solutions, we have found some spectral characteristics which make it facile to clarify the position of substituents.",
				"bookTitle": "Journal of Heterocyclic Chemistry",
				"rights": "Copyright © 1983 Journal of Heterocyclic Chemistry",
				"libraryCatalog": "Wiley Online Library",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/o/cochrane/clcentral/articles/336/CN-00774336/sect0.html",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Wassenaar",
						"firstName": "TR",
						"creatorType": "author"
					},
					{
						"lastName": "Eickhoff",
						"firstName": "JC",
						"creatorType": "author"
					},
					{
						"lastName": "Jarzemsky",
						"firstName": "DR",
						"creatorType": "author"
					},
					{
						"lastName": "Smith",
						"firstName": "SS",
						"creatorType": "author"
					},
					{
						"lastName": "Larson",
						"firstName": "ML",
						"creatorType": "author"
					},
					{
						"lastName": "Schiller",
						"firstName": "JH",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"HS-HAEMATOL",
					"HS-HAEMATOLNOSCO",
					"SR-BREASTCA",
					"HS-HANDSRCH"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Cochrane Snapshot",
						"mimType": "text/html"
					}
				],
				"title": "Differences in primary care clinicians' approach to non-small cell lung cancer (NSCLC) patients compared to breast cancer (BrCa)",
				"publicationTitle": "Journal of Clinical Oncology: ASCO annual meeting proceedings",
				"abstractNote": "42nd Annual Meeting of the American Society of Clinical Oncology, Atlanta,GA, 2-6 June, 2006. Background: Lung cancer is a disease associated with a stigma of being primarily self-induced via smoking and therefore avoidable. It is unclear if this stigma results in feelings of guilt and shame on the part of the patient, and a difference in care on the part of primary care physicians (MDs), both of which could lead to differences in treatment and patient self-advocacy, and ultimately poorer outcomes. Methods: We conducted a prospective survey study of 1,132 MDs who were randomized into 4 groups. Each group received a questionnaire representing a clinical scenario (smoker/NSCLC; nonsmoker/NSCLC; smoker/BrCa; nonsmoker/BrCa). The scenarios were identical in terms of stage, gender and outcome; but varied in the disease and smoking history (smoker (S) vs. nonsmoker (NS)). The primary objective was to collect preliminary data to determine if these MDs approached the care and referral of patients (pts) with NSCLC or BrCa differently. A secondary objective was to determine whether or not tobacco use influenced the MD's approach to the cancer pts. Comparisons of response patterns between the groups were evaluated by Chi-square analysis. Results: 672 questionnaires were completed: 175 in the NS/BrCa, 177 in the S/BrCa, 166 in the NS/NSCLC and 154 in the S/NSCLC scenarios. We observed that MDs were less likely to refer pts with advanced NSCLC to an oncologist than BrCa pts (p=<0.001). More MDs knew that chemotherapy improved survival in pts with advanced BrCa than did MDs regarding chemotherapy use in advanced NSCLC (p=0.0145). In addition, more MDs stated they did not know the benefit of adjuvant therapy for NSCLC than for BrCa (p= <0.001). As a result, more pts with advanced BrCa were referred for further therapy vs. NSCLC pts, who were more likely to be referred only for symptom control (p=0.0092). BrCa pts also had more aggressive follow up than did pts with NSCLC (p=0.0256). There was no statistical significant difference when comparing smoking vs. non-smoking pts. Conclusions: We conclude that there is a significant lack of knowledge in the primary care physician regarding the treatment of pts with advanced stage NSCLC, and the role and benefit of adjuvant therapy. This might lead to a less aggressive referral pattern in these pts to clinical oncologists.",
				"date": "2006",
				"volume": "24",
				"pages": "7041",
				"rights": "Copyright © 2011 The Cochrane Collaboration. Published by John Wiley & Sons, Ltd.",
				"libraryCatalog": "Wiley Online Library"
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/o/cochrane/cldare/articles/DARE-12004008706/sect0.html",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Murff",
						"firstName": "H J",
						"creatorType": "author"
					},
					{
						"lastName": "Spigel",
						"firstName": "D R",
						"creatorType": "author"
					},
					{
						"lastName": "Syngal",
						"firstName": "S",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Cochrane Snapshot",
						"mimType": "text/html"
					}
				],
				"title": "Does this patient have a family history of cancer: an evidence‐based analysis of the accuracy of family cancer history (Structured abstract)",
				"publicationTitle": "JAMA",
				"date": "2004",
				"volume": "292",
				"pages": "1480-1489",
				"issue": "12",
				"rights": "Copyright © 2014 University of York. Published by John Wiley & Sons, Ltd.",
				"libraryCatalog": "Wiley Online Library",
				"shortTitle": "Does this patient have a family history of cancer"
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/o/cochrane/clcmr/articles/CMR-7395/sect0.html",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Gerlach",
						"firstName": "KK",
						"creatorType": "author"
					},
					{
						"lastName": "Marino",
						"firstName": "C",
						"creatorType": "author"
					},
					{
						"lastName": "Hoffman-Goetz",
						"firstName": "L",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Cochrane Snapshot",
						"mimType": "text/html"
					}
				],
				"title": "Cancer coverage in women's magazines: what information are women receiving?",
				"publicationTitle": "Journal of Cancer Education",
				"abstractNote": "BACKGROUND: Women use magazines as sources of health-related information, including information about cancer. Given this reliance on magazines for cancer-related information, it may interest cancer educators to know which cancers are reported on in women's magazines and what types of information are being presented. METHODS: Four widely circulated monthly women's magazines were analyzed for their coverage of cancers during the years 1987-1995. The types of cancers discussed and the frequencies of coverage were noted for each issue of every magazine. Additionally, the content of every cancer-related article was assessed for issues in cancer prevention (primary and secondary), risks, treatment, and genetics. RESULTS: All four magazines in this study reported on breast cancer more often than any other cancer. Lung and colon cancers received very little coverage. The percentages of articles devoted to the six most-discussed cancers (breast, cervical, colon, lung, ovarian, and skin) did not reflect either the mortality rates or the incidence rates of these cancers. CONCLUSIONS: The discussions of cancers in these four women's magazines focused mostly on breast and skin cancers and neglected two very important cancers--lung and colon. If women are indeed receiving much of their cancer information from such media coverage, these findings should alert cancer educators to the possible need to work with these media to help in the dissemination of additional information about cancers to women.",
				"date": "1997",
				"volume": "12",
				"pages": "240-244",
				"issue": "4",
				"rights": "Copyright © 2012 The Cochrane Collaboration. Published by John Wiley & Sons, Ltd.",
				"libraryCatalog": "Wiley Online Library",
				"shortTitle": "Cancer coverage in women's magazines"
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/ev.20077/full",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Cousins",
						"firstName": "J. Bradley",
						"creatorType": "author"
					},
					{
						"lastName": "Bourgeois",
						"firstName": "Isabelle",
						"creatorType": "author"
					},
					{
						"lastName": "Associates",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Multiple Case Study Methods and Findings",
				"publicationTitle": "New Directions for Evaluation",
				"journalAbbreviation": "New Directions for Evaluation",
				"volume": "2014",
				"issue": "141",
				"ISSN": "1534-875X",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/ev.20077/abstract",
				"DOI": "10.1002/ev.20077",
				"pages": "25-99",
				"date": "March 1, 2014",
				"abstractNote": "Research on organizational evaluation capacity building (ECB) has focused very much on the capacity to do evaluation, neglecting organizational demand for evaluation and the capacity to use it. This qualitative multiple case study comprises a systematic examination of organizational capacity within eight distinct organizations guided by a common conceptual framework. Described in this chapter are the rationale and methods for the study and then the sequential presentation of findings for each of the eight case organizations. Data collection and analyses for these studies occurred six years ago; findings are cross-sectional and do not reflect changes in organizations or their capacity for evaluation since that time. The format for presenting the findings was standardized so as to foster cross-case analyses, the focus for the next and final chapter of this volume.",
				"language": "en",
				"rights": "© Wiley Periodicals, Inc., and the American Evaluation Association",
				"libraryCatalog": "Wiley Online Library"
			}
		]
	}
]
/** END TEST CASES **/