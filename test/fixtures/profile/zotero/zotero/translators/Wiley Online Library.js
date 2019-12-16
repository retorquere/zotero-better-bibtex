{
	"translatorID": "fe728bc9-595a-4f03-98fc-766f1d8d0936",
	"label": "Wiley Online Library",
	"creator": "Sean Takats, Michael Berkowitz, Avram Lyon and Aurimas Vinckevicius",
	"target": "^https?://(\\w+\\.)?onlinelibrary\\.wiley\\.com[^/]*/(book|doi|toc|advanced/search|search-web/cochrane|cochranelibrary/search|o/cochrane/(clcentral|cldare|clcmr|clhta|cleed|clabout)/articles/.+/sect0\\.html)",
	"minVersion": "3.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-10-02 00:36:24"
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

// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}

function fixCase(authorName) {
	if (typeof authorName != 'string') return authorName;
	
	if (authorName.toUpperCase() == authorName ||
		authorName.toLowerCase() == authorName) {
		return ZU.capitalizeTitle(authorName, true);
	}

	return authorName;
}

function addCreators(item, creatorType, creators) {
	if ( typeof(creators) == 'string' ) {
		creators = [creators];
	} else if ( !(creators instanceof Array) ) {
		return;
	}

	for (var i=0, n=creators.length; i<n; i++) {
		item.creators.push(ZU.cleanAuthor(fixCase(creators[i]), creatorType, false));
	}
}

function getAuthorName(text) {
	//lower case words at the end of a name are probably not part of a name
	text = text.replace(/(\s+[a-z]+)+\s*$/,'');

	text = text.replace(/(^|[\s,])(PhD|MA|Prof|Dr)(\.?|(?=\s|$))/gi,'');	//remove salutations

	return fixCase(text.trim());
}

function scrapeBook(doc, url) {
	var title = doc.getElementById('productTitle');
	if ( !title ) return false;

	var newItem = new Zotero.Item('book');
	newItem.title = ZU.capitalizeTitle(title.textContent, true);
	
	var data = ZU.xpath(doc, '//div[@id="metaData"]/p');
	var dataRe = /^(.+?):\s*(.+?)\s*$/;
	var match;
	var isbn = [];
	for ( var i=0, n=data.length; i<n; i++) {
		match = dataRe.exec(data[i].textContent);
		if (!match) continue;

		switch (match[1].trim().toLowerCase()) {
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
		ZU.xpathText(doc, [
			'//div[@id="homepageContent"]',
			'/h6[normalize-space(text())="About The Product"]',
			'/following-sibling::p'].join(''), null, "\n") || "");
	newItem.accessDate = 'CURRENT_TIMESTAMP';

	newItem.complete();
}

function scrapeEM(doc, url) {
	var itemType = detectWeb(doc, url);
	
	//fetch print publication date
	var date = ZU.xpathText(doc, '//meta[@name="citation_date"]/@content');

	//remove duplicate meta tags
	var metas = ZU.xpath(doc,
		'//head/link[@media="screen,print"]/following-sibling::meta');
	for (var i=0, n=metas.length; i<n; i++) {
		metas[i].parentNode.removeChild(metas[i]);
	}
	var translator = Zotero.loadTranslator('web');
	//use Embedded Metadata
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler('itemDone', function(obj, item) {
		if ( itemType == 'bookSection' ) {
			//add authors if we didn't get them from embedded metadata
			if (!item.creators.length) {
				var authors = ZU.xpath(doc, '//ol[@id="authors"]/li/node()[1]');
				for (var i=0, n=authors.length; i<n; i++) {
					item.creators.push(
						ZU.cleanAuthor( getAuthorName(authors[i].textContent), 'author',false) );
				}
			}

			//editors
			var editors = ZU.xpath(doc, '//ol[@id="editors"]/li/node()[1]');
			for (var i=0, n=editors.length; i<n; i++) {
				item.creators.push(
					ZU.cleanAuthor( getAuthorName(editors[i].textContent), 'editor',false) );
			}

			item.rights = ZU.xpathText(doc, '//p[@id="copyright"]');

			//this is not great for summary, but will do for now
			item.abstractNote = ZU.xpathText(doc, '//div[@id="abstract"]/div[@class="para"]//p', null, "\n");
		} else {
			var keywords = ZU.xpathText(doc, '//meta[@name="citation_keywords"]/@content');
			if (keywords) {
				item.tags = keywords.split(', ');
			}
			item.rights = ZU.xpathText(doc, '//div[@id="titleMeta"]//p[@class="copyright"]');
			item.abstractNote = ZU.xpathText(doc, '//div[@id="abstract"]/div[@class="para"]', null, "\n");
		}

		//set correct print publication date
		if (date) item.date = date;

		//remove pdf attachments
		for (var i=0, n=item.attachments.length; i<n; i++) {
			if (item.attachments[i].mimeType == 'application/pdf') {
				item.attachments.splice(i,1);
				i--;
				n--;
			}
		}
		
		var pdfURL = attr(doc, 'meta[name="citation_pdf_url"]', "content");
		if (pdfURL) {
			pdfURL = pdfURL.replace('/pdf/', '/pdfdirect/');
			Z.debug("PDF URL: " + pdfURL);
			item.attachments.push({
				url: pdfURL,
				title: 'Full Text PDF',
				mimeType: 'application/pdf'
			});
		}
		item.complete();
	});
	
	translator.getTranslatorObject(function(em) {
		em.itemType = itemType;
		em.doWeb(doc, url);
	});
}

function scrapeBibTeX(doc, url) {
	var doi = ZU.xpathText(doc, '(//meta[@name="citation_doi"])[1]/@content')
		|| ZU.xpathText(doc, '(//input[@name="publicationDoi"])[1]/@value');
	if (!doi) {
		doi = ZU.xpathText(doc, '(//p[@id="doi"])[1]');
		if (doi) doi = doi.replace(/^\s*doi:\s*/i, '');
	}
	if (!doi) {
		scrapeEM(doc, url);
		return;
	}
	
	// Use the current domain on Wiley subdomains (e.g., ascpt.) so that the
	// download works even if third-party cookies are blocked. Otherwise, use
	// the main domain.
	var host = doc.location.host;
	if (!host.endsWith('.onlinelibrary.wiley.com')) {
		host = 'onlinelibrary.wiley.com';
	}
	var postUrl = `https://${host}/action/downloadCitation`;
	var body = 'direct=direct' +
				'&doi=' + encodeURIComponent(doi) + 
				'&downloadFileName=pericles_14619563AxA' +
				'&format=bibtex' + //'&format=ris' +
				'&include=abs' +
				'&submit=Download';
	
	ZU.doPost(postUrl, body, function(text) {
		// Replace uncommon dash (hex e2 80 90)
		text = text.replace(/‐/g, '-').trim();
		//Z.debug(text);
		
		var re = /^\s*@[a-zA-Z]+[\(\{]/;
		if (text.startsWith('<') || !re.test(text)) {
			throw new Error("Error retrieving BibTeX");
		}
		
		var translator = Zotero.loadTranslator('import');
		//use BibTeX translator
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(text);

		translator.setHandler('itemDone', function(obj, item) {
			// BibTeX throws the last names and first names together
			// Therefore, we prefer creators names from EM (if available)
			var authors = doc.querySelectorAll('meta[name="citation_author"]');
			if (authors && authors.length>0) {
				item.creators = [];
				for (let i=0; i<authors.length; i++) {
					item.creators.push(ZU.cleanAuthor(authors[i].content, 'author'));
				}
			}
			//fix author case
			for (var i=0, n=item.creators.length; i<n; i++) {
				item.creators[i].firstName = fixCase(item.creators[i].firstName);
				item.creators[i].lastName = fixCase(item.creators[i].lastName);
			}
			
			//delete nonsense author Null, Null
			if (item.creators.length && item.creators[item.creators.length-1].lastName == "Null"
				&& item.creators[item.creators.length-1].firstName == "Null"
			) {
				item.creators = item.creators.slice(0, -1);
			}

			//editors
			var editors = ZU.xpath(doc, '//ol[@id="editors"]/li/node()[1]');
			for (var i=0, n=editors.length; i<n; i++) {
				item.creators.push(
					ZU.cleanAuthor( getAuthorName(editors[i].textContent), 'editor',false) );
			}
			
			//title
			if (item.title && item.title.toUpperCase() == item.title) {
				item.title = ZU.capitalizeTitle(item.title, true);
			}
			
			if (!item.date) {
				item.date = ZU.xpathText(doc, '//meta[@name="citation_publication_date"]/@content');
			}
			//date in the cochraine library RIS is wrong
			if (ZU.xpathText(doc, '//meta[@name="citation_book_title"]/@content') == "The Cochrane Library") {
				item.date = ZU.xpathText(doc, '//meta[@name="citation_online_date"]/@content');
			}
			if (item.date) {
				item.date = ZU.strToISO(item.date);
			}
			
			if (!item.ISSN) {
				item.ISSN = ZU.xpathText(doc, '//meta[@name="citation_issn"]/@content');
			}
			
			//tags
			if (!item.tags.length) {
				var keywords = ZU.xpathText(doc,
					'//meta[@name="citation_keywords"][1]/@content');
				if (keywords) {
					item.tags = keywords.split(', ');
				}
			}
			
			//abstract should not start with "Abstract"
			if (item.abstractNote) {
				item.abstractNote = item.abstractNote.replace(/^(Abstract|Summary) /i, '');
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
			if (!item.bookTitle) {
				item.bookTitle = item.publicationTitle ||
					ZU.xpathText(doc,
						'//meta[@name="citation_book_title"][1]/@content');
			}

			//language
			if (!item.language) {
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

			var pdfURL = attr(doc, 'meta[name="citation_pdf_url"]', "content");
			if (pdfURL) {
				pdfURL = pdfURL.replace('/pdf/', '/pdfdirect/');
				Z.debug("PDF URL: " + pdfURL);
				item.attachments.push({
					url: pdfURL,
					title: 'Full Text PDF',
					mimeType: 'application/pdf'
				});
			}
			item.complete();
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

function scrape(doc, url) {
	var itemType = detectWeb(doc,url);

	if (itemType == 'book') {
		scrapeBook(doc, url);
	} else if (/\/o\/cochrane\/(clcentral|cldare|clcmr|clhta|cleed|clabout)/.test(url)) {
		scrapeCochraneTrial(doc, url);
	} else {
		scrapeBibTeX(doc, url);
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.table-of-content a.issue-item__title, .item__body h2 a');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function detectWeb(doc, url) {
	//monitor for site changes on Cochrane
	if (doc.getElementsByClassName('cochraneSearchForm').length && doc.getElementById('searchResultOuter')) {
		Zotero.monitorDOMChanges(doc.getElementById('searchResultOuter'));
	}
	
	if (url.includes('/toc') ||
		url.includes('/results') ||
		url.includes('/doSearch') ||
		url.includes('/mainSearch?')
	) {
		if (getSearchResults(doc, true)) return 'multiple';
	} else if (url.includes('/book/')) {
		//if the book has more than one chapter, scrape chapters
		if (getSearchResults(doc, true)) return 'multiple';
		//otherwise, import book
		return 'book'; //does this exist?
	} else if (ZU.xpath(doc, '//meta[@name="citation_book_title"]').length ) {
		return 'bookSection';
	} else {
		return 'journalArticle';
	}
}


function doWeb(doc, url) {
	var type = detectWeb(doc, url);
	if (type == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				//for Cochrane trials - get the frame with the actual data
				if (i.includes("frame.html")) i = i.replace(/frame\.html$/, "sect0.html");
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	// Single article
	else {
		// /pdf/, /epdf/, or /pdfdirect/
		if (/\/e?pdf(direct)?\//.test(url)) {
			url = url.replace(/\/e?pdf(direct)?\//,'/');
			Zotero.debug("Redirecting to abstract page: "+url);
			ZU.processDocuments(url, function(doc, url) {
				scrape(doc, url);
			});
		}
		else {
			scrape(doc, url);
		}
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://onlinelibrary.wiley.com/action/doSearch?field1=AllField&text1=zotero&field2=AllField&text2=&field3=AllField&text3=&Ppub=&AfterMonth=&AfterYear=&BeforeMonth=&BeforeYear=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://onlinelibrary.wiley.com/doi/10.1002/9781118269381.notes",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Endnotes",
				"creators": [],
				"date": "2012",
				"ISBN": "9781118269381",
				"bookTitle": "The World is Open",
				"extra": "DOI: 10.1002/9781118269381.notes",
				"itemID": "doi:10.1002/9781118269381.notes",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "427-467",
				"publisher": "Wiley-Blackwell",
				"url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/9781118269381.notes",
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
		"url": "https://onlinelibrary.wiley.com/toc/15251497/19/s1",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://onlinelibrary.wiley.com/book/10.1002/9783527610853",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://onlinelibrary.wiley.com/doi/10.1002/9781444304794.ch1",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Silent Cinema and its Pioneers (1906–1930)",
				"creators": [],
				"date": "2009",
				"ISBN": "9781444304794",
				"abstractNote": "This chapter contains sections titled: Historical and Political Overview of the Period Context11 Film Scenes: Close Readings Directors (Life and Works) Critical Commentary",
				"bookTitle": "100 Years of Spanish Cinema",
				"extra": "DOI: 10.1002/9781444304794.ch1",
				"itemID": "doi:10.1002/9781444304794.ch1",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "1-20",
				"publisher": "Wiley-Blackwell",
				"url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/9781444304794.ch1",
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
					{
						"tag": "1897"
					},
					{
						"tag": "Directors (Life and Works) - Ángel García Cardona and Antonio Cuesta13"
					},
					{
						"tag": "Florián Rey (Antonio Martínez de Castillo)"
					},
					{
						"tag": "Florián Rey's La aldea maldita (1930)"
					},
					{
						"tag": "Fructuós Gelabert - made the first Spanish fiction film"
					},
					{
						"tag": "Fructuós Gelabert's Amor que mata (1909)"
					},
					{
						"tag": "Ricardo Baños"
					},
					{
						"tag": "Ricardo Baños and Albert Marro's Don Pedro el Cruel (1911)"
					},
					{
						"tag": "Riña en un café"
					},
					{
						"tag": "silent cinema and its pioneers (1906–1930)"
					},
					{
						"tag": "three films - part of “the preliminary industrial and expressive framework for Spain's budding cinema”"
					},
					{
						"tag": "Ángel García Cardona and Antonio Cuesta"
					},
					{
						"tag": "Ángel García Cardona's El ciego de aldea (1906)"
					}
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
		"url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/pmic.201100327",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A mass spectrometry-based method to screen for α-amidated peptides",
				"creators": [
					{
						"firstName": "Zhenming",
						"lastName": "An",
						"creatorType": "author"
					},
					{
						"firstName": "Yudan",
						"lastName": "Chen",
						"creatorType": "author"
					},
					{
						"firstName": "John M.",
						"lastName": "Koomen",
						"creatorType": "author"
					},
					{
						"firstName": "David J.",
						"lastName": "Merkler",
						"creatorType": "author"
					}
				],
				"date": "2012-01-01",
				"DOI": "10.1002/pmic.201100327",
				"ISSN": "1615-9861",
				"abstractNote": "Amidation is a post-translational modification found at the C-terminus of ∼50% of all neuropeptide hormones. Cleavage of the Cα–N bond of a C-terminal glycine yields the α-amidated peptide in a reaction catalyzed by peptidylglycine α-amidating monooxygenase (PAM). The mass of an α-amidated peptide decreases by 58 Da relative to its precursor. The amino acid sequences of an α-amidated peptide and its precursor differ only by the C-terminal glycine meaning that the peptides exhibit similar RP-HPLC properties and tandem mass spectral (MS/MS) fragmentation patterns. Growth of cultured cells in the presence of a PAM inhibitor ensured the coexistence of α-amidated peptides and their precursors. A strategy was developed for precursor and α-amidated peptide pairing (PAPP): LC-MS/MS data of peptide extracts were scanned for peptide pairs that differed by 58 Da in mass, but had similar RP-HPLC retention times. The resulting peptide pairs were validated by checking for similar fragmentation patterns in their MS/MS data prior to identification by database searching or manual interpretation. This approach significantly reduced the number of spectra requiring interpretation, decreasing the computing time required for database searching and enabling manual interpretation of unidentified spectra. Reported here are the α-amidated peptides identified from AtT-20 cells using the PAPP method.",
				"issue": "2",
				"itemID": "doi:10.1002/pmic.201100327",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "173-182",
				"publicationTitle": "PROTEOMICS",
				"url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/pmic.201100327",
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
					{
						"tag": "Post-translational modification"
					},
					{
						"tag": "Spectral pairing"
					},
					{
						"tag": "Technology"
					},
					{
						"tag": "α-Amidated peptide"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://onlinelibrary.wiley.com/doi/full/10.1002/pmic.201100327",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A mass spectrometry-based method to screen for α-amidated peptides",
				"creators": [
					{
						"firstName": "Zhenming",
						"lastName": "An",
						"creatorType": "author"
					},
					{
						"firstName": "Yudan",
						"lastName": "Chen",
						"creatorType": "author"
					},
					{
						"firstName": "John M.",
						"lastName": "Koomen",
						"creatorType": "author"
					},
					{
						"firstName": "David J.",
						"lastName": "Merkler",
						"creatorType": "author"
					}
				],
				"date": "2012-01-01",
				"DOI": "10.1002/pmic.201100327",
				"ISSN": "1615-9861",
				"abstractNote": "Amidation is a post-translational modification found at the C-terminus of ∼50% of all neuropeptide hormones. Cleavage of the Cα–N bond of a C-terminal glycine yields the α-amidated peptide in a reaction catalyzed by peptidylglycine α-amidating monooxygenase (PAM). The mass of an α-amidated peptide decreases by 58 Da relative to its precursor. The amino acid sequences of an α-amidated peptide and its precursor differ only by the C-terminal glycine meaning that the peptides exhibit similar RP-HPLC properties and tandem mass spectral (MS/MS) fragmentation patterns. Growth of cultured cells in the presence of a PAM inhibitor ensured the coexistence of α-amidated peptides and their precursors. A strategy was developed for precursor and α-amidated peptide pairing (PAPP): LC-MS/MS data of peptide extracts were scanned for peptide pairs that differed by 58 Da in mass, but had similar RP-HPLC retention times. The resulting peptide pairs were validated by checking for similar fragmentation patterns in their MS/MS data prior to identification by database searching or manual interpretation. This approach significantly reduced the number of spectra requiring interpretation, decreasing the computing time required for database searching and enabling manual interpretation of unidentified spectra. Reported here are the α-amidated peptides identified from AtT-20 cells using the PAPP method.",
				"issue": "2",
				"itemID": "doi:10.1002/pmic.201100327",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "173-182",
				"publicationTitle": "PROTEOMICS",
				"url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/pmic.201100327",
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
					{
						"tag": "Post-translational modification"
					},
					{
						"tag": "Spectral pairing"
					},
					{
						"tag": "Technology"
					},
					{
						"tag": "α-Amidated peptide"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://onlinelibrary.wiley.com/doi/full/10.1002/pmic.201100327#references-section",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A mass spectrometry-based method to screen for α-amidated peptides",
				"creators": [
					{
						"firstName": "Zhenming",
						"lastName": "An",
						"creatorType": "author"
					},
					{
						"firstName": "Yudan",
						"lastName": "Chen",
						"creatorType": "author"
					},
					{
						"firstName": "John M.",
						"lastName": "Koomen",
						"creatorType": "author"
					},
					{
						"firstName": "David J.",
						"lastName": "Merkler",
						"creatorType": "author"
					}
				],
				"date": "2012-01-01",
				"DOI": "10.1002/pmic.201100327",
				"ISSN": "1615-9861",
				"abstractNote": "Amidation is a post-translational modification found at the C-terminus of ∼50% of all neuropeptide hormones. Cleavage of the Cα–N bond of a C-terminal glycine yields the α-amidated peptide in a reaction catalyzed by peptidylglycine α-amidating monooxygenase (PAM). The mass of an α-amidated peptide decreases by 58 Da relative to its precursor. The amino acid sequences of an α-amidated peptide and its precursor differ only by the C-terminal glycine meaning that the peptides exhibit similar RP-HPLC properties and tandem mass spectral (MS/MS) fragmentation patterns. Growth of cultured cells in the presence of a PAM inhibitor ensured the coexistence of α-amidated peptides and their precursors. A strategy was developed for precursor and α-amidated peptide pairing (PAPP): LC-MS/MS data of peptide extracts were scanned for peptide pairs that differed by 58 Da in mass, but had similar RP-HPLC retention times. The resulting peptide pairs were validated by checking for similar fragmentation patterns in their MS/MS data prior to identification by database searching or manual interpretation. This approach significantly reduced the number of spectra requiring interpretation, decreasing the computing time required for database searching and enabling manual interpretation of unidentified spectra. Reported here are the α-amidated peptides identified from AtT-20 cells using the PAPP method.",
				"issue": "2",
				"itemID": "doi:10.1002/pmic.201100327",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "173-182",
				"publicationTitle": "PROTEOMICS",
				"url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/pmic.201100327",
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
					{
						"tag": "Post-translational modification"
					},
					{
						"tag": "Spectral pairing"
					},
					{
						"tag": "Technology"
					},
					{
						"tag": "α-Amidated peptide"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://onlinelibrary.wiley.com/doi/full/10.1002/pmic.201100327#citedBy",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A mass spectrometry-based method to screen for α-amidated peptides",
				"creators": [
					{
						"firstName": "Zhenming",
						"lastName": "An",
						"creatorType": "author"
					},
					{
						"firstName": "Yudan",
						"lastName": "Chen",
						"creatorType": "author"
					},
					{
						"firstName": "John M.",
						"lastName": "Koomen",
						"creatorType": "author"
					},
					{
						"firstName": "David J.",
						"lastName": "Merkler",
						"creatorType": "author"
					}
				],
				"date": "2012-01-01",
				"DOI": "10.1002/pmic.201100327",
				"ISSN": "1615-9861",
				"abstractNote": "Amidation is a post-translational modification found at the C-terminus of ∼50% of all neuropeptide hormones. Cleavage of the Cα–N bond of a C-terminal glycine yields the α-amidated peptide in a reaction catalyzed by peptidylglycine α-amidating monooxygenase (PAM). The mass of an α-amidated peptide decreases by 58 Da relative to its precursor. The amino acid sequences of an α-amidated peptide and its precursor differ only by the C-terminal glycine meaning that the peptides exhibit similar RP-HPLC properties and tandem mass spectral (MS/MS) fragmentation patterns. Growth of cultured cells in the presence of a PAM inhibitor ensured the coexistence of α-amidated peptides and their precursors. A strategy was developed for precursor and α-amidated peptide pairing (PAPP): LC-MS/MS data of peptide extracts were scanned for peptide pairs that differed by 58 Da in mass, but had similar RP-HPLC retention times. The resulting peptide pairs were validated by checking for similar fragmentation patterns in their MS/MS data prior to identification by database searching or manual interpretation. This approach significantly reduced the number of spectra requiring interpretation, decreasing the computing time required for database searching and enabling manual interpretation of unidentified spectra. Reported here are the α-amidated peptides identified from AtT-20 cells using the PAPP method.",
				"issue": "2",
				"itemID": "doi:10.1002/pmic.201100327",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "173-182",
				"publicationTitle": "PROTEOMICS",
				"url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/pmic.201100327",
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
					{
						"tag": "Post-translational modification"
					},
					{
						"tag": "Spectral pairing"
					},
					{
						"tag": "Technology"
					},
					{
						"tag": "α-Amidated peptide"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://onlinelibrary.wiley.com/doi/10.1002/3527603018.ch17",
		"items": [
			{
				"itemType": "bookSection",
				"title": "β-Rezeptorenblocker",
				"creators": [
					{
						"firstName": "L. von",
						"lastName": "Meyer",
						"creatorType": "author"
					},
					{
						"firstName": "W. R.",
						"lastName": "Külpmann",
						"creatorType": "author"
					}
				],
				"date": "2005",
				"ISBN": "9783527603015",
				"abstractNote": "Immunoassay Hochleistungsflüssigkeitschromatographie (HPLC) Gaschromatographie Medizinische Beurteilung und klinische Interpretation Literatur",
				"bookTitle": "Klinisch-toxikologische Analytik",
				"extra": "DOI: 10.1002/3527603018.ch17",
				"itemID": "doi:10.1002/3527603018.ch17",
				"language": "de",
				"libraryCatalog": "Wiley Online Library",
				"pages": "365-370",
				"publisher": "Wiley-Blackwell",
				"url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/3527603018.ch17",
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
					{
						"tag": "β-Rezeptorenblocker"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1468-5930.2011.00548.x",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Principled Case for Employing Private Military and Security Companies in Interventions for Human Rights Purposes",
				"creators": [
					{
						"firstName": "Deane-Peter",
						"lastName": "Baker",
						"creatorType": "author"
					},
					{
						"firstName": "James",
						"lastName": "Pattison",
						"creatorType": "author"
					}
				],
				"date": "2012-02-01",
				"DOI": "10.1111/j.1468-5930.2011.00548.x",
				"ISSN": "1468-5930",
				"abstractNote": "The possibility of using private military and security companies to bolster the capacity to undertake intervention for human rights purposes (humanitarian intervention and peacekeeping) has been increasingly debated. The focus of such discussions has, however, largely been on practical issues and the contingent problems posed by private force. By contrast, this article considers the principled case for privatising humanitarian intervention. It focuses on two central issues. First, does outsourcing humanitarian intervention to private military and security companies pose some fundamental, deeper problems in this context, such as an abdication of a state's duties? Second, on the other hand, is there a case for preferring these firms to other, state-based agents of humanitarian intervention? For instance, given a state's duties to their own military personnel, should the use of private military and security contractors be preferred to regular soldiers for humanitarian intervention?",
				"issue": "1",
				"itemID": "doi:10.1111/j.1468-5930.2011.00548.x",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "1-18",
				"publicationTitle": "Journal of Applied Philosophy",
				"url": "https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1468-5930.2011.00548.x",
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
		"url": "https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1540-6261.1986.tb04559.x",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Volume for Winners and Losers: Taxation and Other Motives for Stock Trading",
				"creators": [
					{
						"firstName": "Josef",
						"lastName": "Lakonishok",
						"creatorType": "author"
					},
					{
						"firstName": "Seymour",
						"lastName": "Smidt",
						"creatorType": "author"
					}
				],
				"date": "1986-09-01",
				"DOI": "10.1111/j.1540-6261.1986.tb04559.x",
				"ISSN": "1540-6261",
				"abstractNote": "Capital gains taxes create incentives to trade. Our major finding is that turnover is higher for winners (stocks, the prices of which have increased) than for losers, which is not consistent with the tax prediction. However, the turnover in December and January is evidence of tax-motivated trading; there is a relatively high turnover for losers in December and for winners in January. We conclude that taxes influence turnover, but other motives for trading are more important. We were unable to find evidence that changing the length of the holding period required to qualify for long-term capital gains treatment affected turnover.",
				"issue": "4",
				"itemID": "doi:10.1111/j.1540-6261.1986.tb04559.x",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "951-974",
				"publicationTitle": "The Journal of Finance",
				"shortTitle": "Volume for Winners and Losers",
				"url": "https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1540-6261.1986.tb04559.x",
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
		"url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/%28SICI%291521-3773%2820000103%2939%3A1%3C165%3A%3AAID-ANIE165%3E3.0.CO%3B2-B",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Phosphane-Free Palladium-Catalyzed Coupling Reactions: The Decisive Role of Pd Nanoparticles",
				"creators": [
					{
						"firstName": "Manfred T.",
						"lastName": "Reetz",
						"creatorType": "author"
					},
					{
						"firstName": "Elke",
						"lastName": "Westermann",
						"creatorType": "author"
					}
				],
				"date": "2000-01-03",
				"DOI": "10.1002/(SICI)1521-3773(20000103)39:1<165::AID-ANIE165>3.0.CO;2-B",
				"ISSN": "1521-3773",
				"abstractNote": "Nanosized palladium colloids, generated in situ by reduction of PdII to Pd0 [Eq. (a)], are involved in the catalysis of phosphane-free Heck and Suzuki reactions with simple palladium salts such as PdCl2 or Pd(OAc)2, as demonstrated by transmission electron microscopic investigations.",
				"issue": "1",
				"itemID": "doi:10.1002/(SICI)1521-3773(20000103)39:1<165::AID-ANIE165>3.0.CO;2-B",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "165-168",
				"publicationTitle": "Angewandte Chemie International Edition",
				"shortTitle": "Phosphane-Free Palladium-Catalyzed Coupling Reactions",
				"url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/%28SICI%291521-3773%2820000103%2939%3A1%3C165%3A%3AAID-ANIE165%3E3.0.CO%3B2-B",
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
					{
						"tag": "C−C coupling"
					},
					{
						"tag": "colloids"
					},
					{
						"tag": "palladium"
					},
					{
						"tag": "transmission electron microscopy"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/jhet.5570200408",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Studies on imidazole derivatives and related compounds. 2. Characterization of substituted derivatives of 4-carbamoylimidazolium-5-olate by ultraviolet absorption spectra",
				"creators": [
					{
						"firstName": "Y.",
						"lastName": "Tarumi",
						"creatorType": "author"
					},
					{
						"firstName": "T.",
						"lastName": "Atsumi",
						"creatorType": "author"
					}
				],
				"date": "1983-07-01",
				"DOI": "10.1002/jhet.5570200408",
				"ISSN": "1943-5193",
				"abstractNote": "The representative mono- and dialkyl-substituted derivatives of 4-carbamoylimidazolium-5-olate (1) were synthesized unequivocally. On the basis of their spectral data for ultraviolet absorption spectra in acidic, basic and neutral solutions, we have found some spectral characteristics which make it facile to clarify the position of substituents.",
				"issue": "4",
				"itemID": "doi:10.1002/jhet.5570200408",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "875-885",
				"publicationTitle": "Journal of Heterocyclic Chemistry",
				"url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/jhet.5570200408",
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
		"url": "https://onlinelibrary.wiley.com/doi/full/10.1002/ev.20077",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Multiple Case Study Methods and Findings",
				"creators": [
					{
						"firstName": "J. Bradley",
						"lastName": "Cousins",
						"creatorType": "author"
					},
					{
						"firstName": "Isabelle",
						"lastName": "Bourgeois",
						"creatorType": "author"
					}
				],
				"date": "2014-03-01",
				"DOI": "10.1002/ev.20077",
				"ISSN": "1534-875X",
				"abstractNote": "Research on organizational evaluation capacity building (ECB) has focused very much on the capacity to do evaluation, neglecting organizational demand for evaluation and the capacity to use it. This qualitative multiple case study comprises a systematic examination of organizational capacity within eight distinct organizations guided by a common conceptual framework. Described in this chapter are the rationale and methods for the study and then the sequential presentation of findings for each of the eight case organizations. Data collection and analyses for these studies occurred six years ago; findings are cross-sectional and do not reflect changes in organizations or their capacity for evaluation since that time. The format for presenting the findings was standardized so as to foster cross-case analyses, the focus for the next and final chapter of this volume.",
				"issue": "141",
				"itemID": "doi:10.1002/ev.20077",
				"language": "en",
				"libraryCatalog": "Wiley Online Library",
				"pages": "25-99",
				"publicationTitle": "New Directions for Evaluation",
				"url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/ev.20077",
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
	}
]
/** END TEST CASES **/
