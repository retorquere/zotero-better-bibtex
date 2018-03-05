{
	"translatorID": "fe728bc9-595a-4f03-98fc-766f1d8d0936",
	"label": "Wiley Online Library",
	"creator": "Sean Takats, Michael Berkowitz, Avram Lyon and Aurimas Vinckevicius",
	"target": "^https?://onlinelibrary\\.wiley\\.com[^/]*/(book|doi|advanced/search|search-web/cochrane|cochranelibrary/search|o/cochrane/(clcentral|cldare|clcmr|clhta|cleed|clabout)/articles/.+/sect0\\.html)",
	"minVersion": "3.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-01 16:58:26"
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
			
			//date in the cochraine library RIS is wrong
			if (ZU.xpathText(doc, '//meta[@name="citation_book_title"]/@content') == "The Cochrane Library") {
				item.date = ZU.xpathText(doc, '//meta[@name="citation_online_date"]/@content');
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
						pdfUrl = m[1];
					} else {
						Z.debug('Could not determine PDF URL.');
						m = text.match(/<iframe[^>]*>/i);
						if(m) {
							Z.debug(m[0]);
							pdfUrl = null; // Clearly not the PDF
						} else {
							Z.debug('No iframe found. This may be the PDF');
							// It seems that on Mac, Wiley serves the PDF
							// directly, not in an iframe, so try using this URL.
							// TODO: detect whether this is a case before trying
							// to fetch the PDF page above. See https://github.com/zotero/translators/pull/442
						}
					}
					
					if (pdfUrl) {
						item.attachments.push({
							url: pdfUrl,
							title: 'Full Text PDF',
							mimeType: 'application/pdf'
						});
					}
					
					item.complete();
				});
			} else {
				if(pdfUrl) {
					item.attachments.push({
						url: pdfUrl,
						title: 'Full Text PDF',
						mimeType: 'application/pdf'
					});
				}
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
	
	for (var i=0; i<authors.length; i++){
		//authors are in the forms Smith AS
		var authormatch = authors[i].match(/(.+?)\s+([A-Z]+(\s[A-Z])?)\s*$/);
		if (authormatch) {
			item.creators.push({
				lastName: authormatch[1],
				firstName: authormatch[2],
				creatorType: "author"
			});
		} else {
			item.creators.push({
				lastName: authors[i],
				fieldMode: 1,
				creatorType: "author"
			});
		}
	}
	item.complete();
}

function scrape(doc, url, pdfUrl) {
	var itemType = detectWeb(doc,url);

	if (itemType == 'book') {
		scrapeBook(doc, url, pdfUrl);
	} else if (/\/o\/cochrane\/(clcentral|cldare|clcmr|clhta|cleed|clabout)/.test(url)) {
		scrapeCochraneTrial(doc, url);
	} else {
		scrapeBibTeX(doc, url, pdfUrl);
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
	
	if (url.indexOf('/issuetoc') != -1 ||
		url.indexOf('/results') != -1 ||
		url.indexOf('/search') != -1 ||
		url.indexOf('/mainSearch?') != -1
	) {
		if(getSearchResults(doc, url).length) return 'multiple';
	} else if (url.indexOf('/book/') != -1 ) {
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
			ZU.processDocuments(url, function(doc, url) { scrape(doc, url, pdfUrl) });
		} else if(type != 'book' &&
			url.indexOf('abstract') == -1 && url.indexOf("/o/cochrane/") == -1 &&
			!ZU.xpathText(doc, '//div[@id="abstract"]/div[@class="para"]')
		) {
			//redirect to abstract or summary so we can scrape that
			if(type == 'bookSection') {
				url = url.replace(/\/[^?#\/]+(?:[?#].*)?$/, '/summary');
			} else {
				url = url.replace(/\/[^?#\/]+(?:[?#].*)?$/, '/abstract');
			}
			ZU.processDocuments(url, scrape);
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
				"title": "Endnotes",
				"creators": [
					{
						"lastName": "Bonk",
						"firstName": "Curtis J.",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"ISBN": "9781118269381",
				"bookTitle": "The World is Open",
				"extra": "DOI: 10.1002/9781118269381.notes",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "427-467",
				"publisher": "Jossey-Bass",
				"rights": "Copyright © 2009 Curtis J. Bonk. All rights reserved.",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/9781118269381.notes/summary",
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
				"tags": [],
				"notes": [],
				"seeAlso": []
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
				"title": "Silent Cinema and its Pioneers (1906–1930)",
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
				"date": "2008",
				"ISBN": "9781444304794",
				"abstractNote": "This chapter contains sections titled:\n\n\n*\nHistorical and Political Overview of the Period\n\n\n*\nContext11\n\n\n*\nFilm Scenes: Close Readings\n\n\n*\nDirectors (Life and Works)\n\n\n*\nCritical Commentary",
				"bookTitle": "100 Years of Spanish Cinema",
				"extra": "DOI: 10.1002/9781444304794.ch1",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "1-20",
				"publisher": "Wiley-Blackwell",
				"rights": "Copyright © 2009 Tatjana Pavlović, Inmaculada Alvarez, Rosana Blanco-Cano, Anitra Grisales, Alejandra Osorio, and Alejandra Sánchez",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/9781444304794.ch1/summary",
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
				"tags": [
					"Directors (Life and Works) - Ángel García Cardona and Antonio Cuesta13",
					"Florián Rey (Antonio Martínez de Castillo)",
					"Florián Rey's La aldea maldita (1930)",
					"Fructuós Gelabert - made the first Spanish fiction film, Riña en un café, 1897",
					"Fructuós Gelabert's Amor que mata (1909)",
					"Ricardo Baños",
					"Ricardo Baños and Albert Marro's Don Pedro el Cruel (1911)",
					"silent cinema and its pioneers (1906–1930)",
					"three films - part of “the preliminary industrial and expressive framework for Spain's budding cinema”",
					"Ángel García Cardona and Antonio Cuesta",
					"Ángel García Cardona's El ciego de aldea (1906)"
				],
				"notes": [],
				"seeAlso": []
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
				"title": "A mass spectrometry-based method to screen for α-amidated peptides",
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
				"date": "January 1, 2012",
				"DOI": "10.1002/pmic.201100327",
				"ISSN": "1615-9861",
				"abstractNote": "Amidation is a post-translational modification found at the C-terminus of ∼50% of all neuropeptide hormones. Cleavage of the Cα–N bond of a C-terminal glycine yields the α-amidated peptide in a reaction catalyzed by peptidylglycine α-amidating monooxygenase (PAM). The mass of an α-amidated peptide decreases by 58 Da relative to its precursor. The amino acid sequences of an α-amidated peptide and its precursor differ only by the C-terminal glycine meaning that the peptides exhibit similar RP-HPLC properties and tandem mass spectral (MS/MS) fragmentation patterns. Growth of cultured cells in the presence of a PAM inhibitor ensured the coexistence of α-amidated peptides and their precursors. A strategy was developed for precursor and α-amidated peptide pairing (PAPP): LC-MS/MS data of peptide extracts were scanned for peptide pairs that differed by 58 Da in mass, but had similar RP-HPLC retention times. The resulting peptide pairs were validated by checking for similar fragmentation patterns in their MS/MS data prior to identification by database searching or manual interpretation. This approach significantly reduced the number of spectra requiring interpretation, decreasing the computing time required for database searching and enabling manual interpretation of unidentified spectra. Reported here are the α-amidated peptides identified from AtT-20 cells using the PAPP method.",
				"issue": "2",
				"journalAbbreviation": "Proteomics",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "173-182",
				"publicationTitle": "PROTEOMICS",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/abstract",
				"volume": "12",
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
				"tags": [
					"Post-translational modification",
					"Spectral pairing",
					"Technology",
					"α-Amidated peptide"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/full",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A mass spectrometry-based method to screen for α-amidated peptides",
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
				"date": "January 1, 2012",
				"DOI": "10.1002/pmic.201100327",
				"ISSN": "1615-9861",
				"abstractNote": "Amidation is a post-translational modification found at the C-terminus of ∼50% of all neuropeptide hormones. Cleavage of the Cα–N bond of a C-terminal glycine yields the α-amidated peptide in a reaction catalyzed by peptidylglycine α-amidating monooxygenase (PAM). The mass of an α-amidated peptide decreases by 58 Da relative to its precursor. The amino acid sequences of an α-amidated peptide and its precursor differ only by the C-terminal glycine meaning that the peptides exhibit similar RP-HPLC properties and tandem mass spectral (MS/MS) fragmentation patterns. Growth of cultured cells in the presence of a PAM inhibitor ensured the coexistence of α-amidated peptides and their precursors. A strategy was developed for precursor and α-amidated peptide pairing (PAPP): LC-MS/MS data of peptide extracts were scanned for peptide pairs that differed by 58 Da in mass, but had similar RP-HPLC retention times. The resulting peptide pairs were validated by checking for similar fragmentation patterns in their MS/MS data prior to identification by database searching or manual interpretation. This approach significantly reduced the number of spectra requiring interpretation, decreasing the computing time required for database searching and enabling manual interpretation of unidentified spectra. Reported here are the α-amidated peptides identified from AtT-20 cells using the PAPP method.",
				"issue": "2",
				"journalAbbreviation": "Proteomics",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "173-182",
				"publicationTitle": "PROTEOMICS",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/abstract",
				"volume": "12",
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
				"tags": [
					"Post-translational modification",
					"Spectral pairing",
					"Technology",
					"α-Amidated peptide"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/references",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A mass spectrometry-based method to screen for α-amidated peptides",
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
				"date": "January 1, 2012",
				"DOI": "10.1002/pmic.201100327",
				"ISSN": "1615-9861",
				"abstractNote": "Amidation is a post-translational modification found at the C-terminus of ∼50% of all neuropeptide hormones. Cleavage of the Cα–N bond of a C-terminal glycine yields the α-amidated peptide in a reaction catalyzed by peptidylglycine α-amidating monooxygenase (PAM). The mass of an α-amidated peptide decreases by 58 Da relative to its precursor. The amino acid sequences of an α-amidated peptide and its precursor differ only by the C-terminal glycine meaning that the peptides exhibit similar RP-HPLC properties and tandem mass spectral (MS/MS) fragmentation patterns. Growth of cultured cells in the presence of a PAM inhibitor ensured the coexistence of α-amidated peptides and their precursors. A strategy was developed for precursor and α-amidated peptide pairing (PAPP): LC-MS/MS data of peptide extracts were scanned for peptide pairs that differed by 58 Da in mass, but had similar RP-HPLC retention times. The resulting peptide pairs were validated by checking for similar fragmentation patterns in their MS/MS data prior to identification by database searching or manual interpretation. This approach significantly reduced the number of spectra requiring interpretation, decreasing the computing time required for database searching and enabling manual interpretation of unidentified spectra. Reported here are the α-amidated peptides identified from AtT-20 cells using the PAPP method.",
				"issue": "2",
				"journalAbbreviation": "Proteomics",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "173-182",
				"publicationTitle": "PROTEOMICS",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/abstract",
				"volume": "12",
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
				"tags": [
					"Post-translational modification",
					"Spectral pairing",
					"Technology",
					"α-Amidated peptide"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/citedby",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A mass spectrometry-based method to screen for α-amidated peptides",
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
				"date": "January 1, 2012",
				"DOI": "10.1002/pmic.201100327",
				"ISSN": "1615-9861",
				"abstractNote": "Amidation is a post-translational modification found at the C-terminus of ∼50% of all neuropeptide hormones. Cleavage of the Cα–N bond of a C-terminal glycine yields the α-amidated peptide in a reaction catalyzed by peptidylglycine α-amidating monooxygenase (PAM). The mass of an α-amidated peptide decreases by 58 Da relative to its precursor. The amino acid sequences of an α-amidated peptide and its precursor differ only by the C-terminal glycine meaning that the peptides exhibit similar RP-HPLC properties and tandem mass spectral (MS/MS) fragmentation patterns. Growth of cultured cells in the presence of a PAM inhibitor ensured the coexistence of α-amidated peptides and their precursors. A strategy was developed for precursor and α-amidated peptide pairing (PAPP): LC-MS/MS data of peptide extracts were scanned for peptide pairs that differed by 58 Da in mass, but had similar RP-HPLC retention times. The resulting peptide pairs were validated by checking for similar fragmentation patterns in their MS/MS data prior to identification by database searching or manual interpretation. This approach significantly reduced the number of spectra requiring interpretation, decreasing the computing time required for database searching and enabling manual interpretation of unidentified spectra. Reported here are the α-amidated peptides identified from AtT-20 cells using the PAPP method.",
				"issue": "2",
				"journalAbbreviation": "Proteomics",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "173-182",
				"publicationTitle": "PROTEOMICS",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/pmic.201100327/abstract",
				"volume": "12",
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
				"tags": [
					"Post-translational modification",
					"Spectral pairing",
					"Technology",
					"α-Amidated peptide"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/3527603018.ch17/summary",
		"items": [
			{
				"itemType": "bookSection",
				"title": "β-Rezeptorenblocker",
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
				"date": "2002",
				"ISBN": "9783527603015",
				"abstractNote": "* Immunoassay\n* Hochleistungsflüssigkeitschromatographie (HPLC)\n* Gaschromatographie\n* Medizinische Beurteilung und klinische Interpretation\n* Literatur",
				"bookTitle": "Klinisch-toxikologische Analytik",
				"extra": "DOI: 10.1002/3527603018.ch17",
				"language": "de",
				"libraryCatalog": "Wiley Online Library",
				"pages": "365-370",
				"publisher": "Wiley-VCH Verlag GmbH & Co. KGaA",
				"rights": "Copyright © 2002 Wiley-VCH Verlag GmbH",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/3527603018.ch17/summary",
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
				"tags": [
					"β-Rezeptorenblocker"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1111/j.1468-5930.2011.00548.x/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Principled Case for Employing Private Military and Security Companies in Interventions for Human Rights Purposes",
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
				"date": "February 1, 2012",
				"DOI": "10.1111/j.1468-5930.2011.00548.x",
				"ISSN": "1468-5930",
				"abstractNote": "The possibility of using private military and security companies to bolster the capacity to undertake intervention for human rights purposes (humanitarian intervention and peacekeeping) has been increasingly debated. The focus of such discussions has, however, largely been on practical issues and the contingent problems posed by private force. By contrast, this article considers the principled case for privatising humanitarian intervention. It focuses on two central issues. First, does outsourcing humanitarian intervention to private military and security companies pose some fundamental, deeper problems in this context, such as an abdication of a state's duties? Second, on the other hand, is there a case for preferring these firms to other, state-based agents of humanitarian intervention? For instance, given a state's duties to their own military personnel, should the use of private military and security contractors be preferred to regular soldiers for humanitarian intervention?",
				"issue": "1",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "1-18",
				"publicationTitle": "Journal of Applied Philosophy",
				"url": "http://onlinelibrary.wiley.com/doi/10.1111/j.1468-5930.2011.00548.x/abstract",
				"volume": "29",
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
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1111/j.1540-6261.1986.tb04559.x/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Volume for Winners and Losers: Taxation and Other Motives for Stock Trading",
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
				"date": "September 1, 1986",
				"DOI": "10.1111/j.1540-6261.1986.tb04559.x",
				"ISSN": "1540-6261",
				"abstractNote": "Capital gains taxes create incentives to trade. Our major finding is that turnover is higher for winners (stocks, the prices of which have increased) than for losers, which is not consistent with the tax prediction. However, the turnover in December and January is evidence of tax-motivated trading; there is a relatively high turnover for losers in December and for winners in January. We conclude that taxes influence turnover, but other motives for trading are more important. We were unable to find evidence that changing the length of the holding period required to qualify for long-term capital gains treatment affected turnover.",
				"issue": "4",
				"journalAbbreviation": "The Journal of Finance",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "951-974",
				"publicationTitle": "The Journal of Finance",
				"shortTitle": "Volume for Winners and Losers",
				"url": "http://onlinelibrary.wiley.com/doi/10.1111/j.1540-6261.1986.tb04559.x/abstract",
				"volume": "41",
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
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/(SICI)1521-3773(20000103)39:1%3C165::AID-ANIE165%3E3.0.CO;2-B/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Phosphane-Free Palladium-Catalyzed Coupling Reactions: The Decisive Role of Pd Nanoparticles",
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
				"date": "January 3, 2000",
				"DOI": "10.1002/(SICI)1521-3773(20000103)39:1<165::AID-ANIE165>3.0.CO;2-B",
				"ISSN": "1521-3773",
				"abstractNote": "Nanosized palladium colloids, generated in situ by reduction of PdII to Pd0 [Eq. (a)], are involved in the catalysis of phosphane-free Heck and Suzuki reactions with simple palladium salts such as PdCl2 or Pd(OAc)2, as demonstrated by transmission electron microscopic investigations.",
				"issue": "1",
				"journalAbbreviation": "Angewandte Chemie International Edition",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "165-168",
				"publicationTitle": "Angewandte Chemie International Edition",
				"shortTitle": "Phosphane-Free Palladium-Catalyzed Coupling Reactions",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/(SICI)1521-3773(20000103)39:1<165::AID-ANIE165>3.0.CO;2-B/abstract",
				"volume": "39",
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
				"tags": [
					"C−C coupling",
					"colloids",
					"palladium",
					"transmission electron microscopy"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/jhet.5570200408/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Studies on imidazole derivatives and related compounds. 2. Characterization of substituted derivatives of 4-carbamoylimidazolium-5-olate by ultraviolet absorption spectra",
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
				"date": "July 1, 1983",
				"DOI": "10.1002/jhet.5570200408",
				"ISSN": "1943-5193",
				"abstractNote": "The representative mono- and dialkyl-substituted derivatives of 4-carbamoylimidazolium-5-olate (1) were synthesized unequivocally. On the basis of their spectral data for ultraviolet absorption spectra in acidic, basic and neutral solutions, we have found some spectral characteristics which make it facile to clarify the position of substituents.",
				"issue": "4",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "875-885",
				"publicationTitle": "Journal of Heterocyclic Chemistry",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/jhet.5570200408/abstract",
				"volume": "20",
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
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/ev.20077/full",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Multiple Case Study Methods and Findings",
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
				"date": "March 1, 2014",
				"DOI": "10.1002/ev.20077",
				"ISSN": "1534-875X",
				"abstractNote": "Research on organizational evaluation capacity building (ECB) has focused very much on the capacity to do evaluation, neglecting organizational demand for evaluation and the capacity to use it. This qualitative multiple case study comprises a systematic examination of organizational capacity within eight distinct organizations guided by a common conceptual framework. Described in this chapter are the rationale and methods for the study and then the sequential presentation of findings for each of the eight case organizations. Data collection and analyses for these studies occurred six years ago; findings are cross-sectional and do not reflect changes in organizations or their capacity for evaluation since that time. The format for presenting the findings was standardized so as to foster cross-case analyses, the focus for the next and final chapter of this volume.",
				"issue": "141",
				"journalAbbreviation": "New Directions for Evaluation",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "25-99",
				"publicationTitle": "New Directions for Evaluation",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/ev.20077/abstract",
				"volume": "2014",
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
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/doi/10.1002/14651858.CD009192.pub2/abstract",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Telephone communication of HIV testing results for improving knowledge of HIV infection status",
				"creators": [
					{
						"lastName": "Tudor Car",
						"firstName": "Lorainne",
						"creatorType": "author"
					},
					{
						"lastName": "Gentry",
						"firstName": "Sarah",
						"creatorType": "author"
					},
					{
						"lastName": "van-Velthoven",
						"firstName": "Michelle HMMT",
						"creatorType": "author"
					},
					{
						"lastName": "Car",
						"firstName": "Josip",
						"creatorType": "author"
					}
				],
				"date": "2013/01/31",
				"abstractNote": "Background\nBackground\n\nThis is one of three Cochrane reviews that examine the role of the telephone in HIV/AIDS services. Both in developed and developing countries there is a large proportion of people who do not know they are infected with HIV. Knowledge of one's own HIV serostatus is necessary to access HIV support, care and treatment and to prevent acquisition or further transmission of HIV. Using telephones instead of face-to-face or other means of HIV test results delivery could lead to more people receiving their HIV test results.\n\nObjectives\nObjectives\n\nTo assess the effectiveness of telephone use for delivery of HIV test results and post-test counselling.\nTo evaluate the effectiveness of delivering HIV test results by telephone, we were interested in whether they can increase the proportion of people who receive their HIV test results and the number of people knowing their HIV status.\n\nSearch methods\nSearch methods\n\nWe searched The Cochrane Central Register of Controlled Trials (CENTRAL), MEDLINE, PubMed Central, PsycINFO, ISI Web of Science, Cumulative Index to Nursing & Allied Health (CINAHL), WHOs The Global Health Library and Current Controlled Trials from 1980 to June 2011. We also searched grey literature sources such as Dissertation Abstracts International,CAB Direct Global Health, OpenSIGLE, The Healthcare Management Information Consortium, Google Scholar, Conference on Retroviruses and Opportunistic Infections, International AIDS Society and AEGIS Education Global Information System, and reference lists of relevant studies for this review.\n\nSelection criteria\nSelection criteria\n\nRandomised controlled trials (RCTs), quasi-randomised controlled trials (qRCTs), controlled before and after studies (CBAs), and interrupted time series (ITS) studies comparing the effectiveness of telephone HIV test results notification and post-test counselling to face-to-face or other ways of HIV test result delivery in people regardless of their demographic characteristics and in all settings.\n\nData collection and analysis\nData collection and analysis\n\nTwo reviewers independently searched, screened, assessed study quality and extracted data. A third reviewer resolved any disagreement.\n\nMain results\nMain results\n\nOut of 14 717 citations, only one study met the inclusion criteria; an RCT conducted on homeless and high-risk youth between September 1998 and October 1999 in Portland, United States. Participants (n=351) were offered counselling and oral HIV testing and were randomised into face-to-face (n=187 participants) and telephone (n=167) notification groups. The telephone notification group had the option of receiving HIV test results either by telephone or face-to-face. Overall, only 48% (n=168) of participants received their HIV test results and post-test counselling. Significantly more participants received their HIV test results in the telephone notification group compared to the face-to-face notification group; 58% (n=106) vs. 37% (n=62) (p < 0.001). In the telephone notification group, the majority of participants who received their HIV test results did so by telephone (88%, n=93). The study could not offer information about the effectiveness of telephone HIV test notification with HIV-positive participants because only two youth tested positive and both were assigned to the face-to-face notification group. The study had a high risk of bias.\n\nAuthors' conclusions\nAuthors' conclusions\n\nWe found only one eligible study. Although this study showed the use of the telephone for HIV test results notification was more effective than face-to-face delivery, it had a high-risk of bias. The study was conducted about 13 years ago in a high-income country, on a high-risk population, with low HIV prevalence, and the applicability of its results to other settings and contexts is unclear. The study did not provide information about telephone HIV test results notification of HIV positive people since none of the intervention group participants were HIV positive. We found no information about the acceptability of the intervention to patients’ and providers’, its economic outcomes or potential adverse effects. There is a need for robust evidence from various settings on the effectiveness of telephone use for HIV test results notification.",
				"bookTitle": "Cochrane Database of Systematic Reviews",
				"extra": "DOI: 10.1002/14651858.CD009192.pub2",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"publisher": "John Wiley & Sons, Ltd",
				"url": "http://onlinelibrary.wiley.com/doi/10.1002/14651858.CD009192.pub2/abstract",
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
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/