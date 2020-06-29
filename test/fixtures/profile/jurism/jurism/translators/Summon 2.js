{
	"translatorID": "6c61897b-ca44-4ce6-87c1-2da68b44e6f7",
	"label": "Summon 2",
	"creator": "Caistarrin Mystical and Aurimas Vinckevicius",
	"target": "^https?://([^/]+\\.)?summon\\.serialssolutions\\.com/",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 150,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2017-06-24 21:11:06"
}

/*
   Summon 2.0 Translator
   Copyright (C) 2014 ProQuest LLC
   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc, url) {
	var results = doc.getElementById('results');
	var displayMultiple = false;
	if (results) {
		var ul = results.firstElementChild.firstElementChild;
		if (ul) {
			// This is currently broken in Zotero.
			// Scrolling down one page ends up triggering Page Modified event
			// 111 times and makes the page unusable after a while.
			//Zotero.monitorDOMChanges(ul, {childList: true});
			
			// temporary hack to display multiples
			displayMultiple = true;
		}
	}
	
	var detailPage = doc.getElementsByClassName('detailPage')[0];
	if (detailPage) {
		// Changes from visible to not by adding class ng-hide
		Zotero.monitorDOMChanges(detailPage, {attributes: true, attributeFiler: ['class']});
		if (detailPage.offsetHeight) {
			// Visible details page
			var id = getIDFromUrl(url);
			if (id) return 'book';
		}
	}
	
	if (getSearchResults(doc, true) || displayMultiple) {
		return "multiple";
	}
}

function getIDFromUrl(url) {
	var m = url.match(/[&?]id=([^&#]+)/);
	return m && m[1];
}

function getSearchResults(doc, checkOnly) {
	var results = doc.getElementById('results');
	if (!results) return false;
	
	var titles = results.getElementsByClassName('customPrimaryLinkContainer');
	var items = {}, found = false;
	var numRollups = 0;
	for (var i=0; i<titles.length; i++) {
		var isRollup = !!ZU.xpath(titles[i], './ancestor::div[contains(@class, "rollup")]').length;
		
		// That class gets reused a bit
		if (!isRollup && titles[i].nodeName.toUpperCase() != 'H1') continue;
		
		var index;
		if (isRollup) {
			index = 'r' + numRollups;
			numRollups++;
		} else {
			index = i - numRollups;
		}
		
		var title = titles[i].getElementsByTagName('a')[0];
		if (title) title = ZU.trimInternal(title.textContent);
		
		if (!title) continue;
		
		if (checkOnly) return true;
		found = true;
		items['_' + index] = title;
	}
	
	return found ? items : false;
}

function doWeb(doc, url) {
	var dbName = ZU.xpath(doc, '//div[contains(@class, "header")]//img[contains(@class, "logo")]/@alt')[0];
	if (dbName) dbName = dbName.value;
	
	if (detectWeb(doc, url) == 'multiple') {
		Zotero.selectItems(getSearchResults(doc), function(items) {
			if (!items) {
				return true;
			}
			
			var indexes = []
			for (var item in items) {
				indexes.push(item.substr(1));
			}
			
			fetchData(getApiData(doc, url, indexes), dbName)
		});
	} else {
		var id = getIDFromUrl(url);
		var url = '/api/search?fids=' + encodeURIComponent(id);
		fetchData({urlSet: [url], indexBlocks: { 1: ['0'] }}, dbName);
	}
}

function fetchData(apiData, dbName) {
	var documents = [];
	ZU.doGet(apiData.urlSet, function (text, _, chunkUrl) {
			var obj = JSON.parse(text);
			var page = chunkUrl.match(/[?&]pn=(\d+)/);
			if (page) {
				page = page[1];
			} else if (/[?&]fids=/.test(chunkUrl)) {
				// For single pages
				page = 1;
			}
			
			var indexes = apiData.indexBlocks[page];
			
			for (var j = 0; j < indexes.length; j++) {
				var i = indexes[j];
				if (i.charAt(0) == 'r') {
					// Rollup. Drop 'r' for actual index
					documents.push(obj.rollups.newspaper.documents[i.substr(1)]);
				}
				else {
					documents.push(obj.documents[i]);
				}
			}
		},
		function () { // All done
			// Grab database name for Library Catalog field
			getRefData(documents, dbName);
		}
	);
}

var pageSize = 10; // Number of results to fetch per page
function getApiData(doc, url, indexes) {
	url = doc.location.href;
	//Z.debug(url)
	var urlArray = url.split('?');
	var apiURL = '/api/search?'
		+ urlArray.pop().replace(/(^|&)fvf=([^&#]*)/, function(m, sep, fvf) {
			return sep + 'fvf[]=' + fvf.replace(/\||%7c/gi, '&fvf[]=');
		})
		+ '&ps=' + pageSize;
	
	// Split up selected indeces into blocks set by pageSize then fetch each block
	// independently and concatenate them later
	var urlSet = [];
	var indexBlocks = {};
	for (var i = 0; i < indexes.length; i++) {
		var page, // Page number for given index (these don't have to end up continuous). 1 based
			pageIndex = indexes[i]; // Item index in a given page. 0 based

		if (pageIndex.charAt(0) == 'r') {
			// All rollups are on first page
			page = 1;
		} else {
			pageIndex *= 1; // convert to integer from string
			page = Math.ceil((pageIndex + 1) / pageSize); // +1 because 0 based
			pageIndex %= pageSize;
		}
		
		if (!indexBlocks[page]) {
			// New set
			indexBlocks[page] = [];
			urlSet.push(apiURL + "&pn=" + page);
		}
		
		indexBlocks[page].push('' + pageIndex); // make sure it's string so it's easier to check for 'r' later
	}
	
	return {"urlSet": urlSet, "indexBlocks": indexBlocks};
}

function getRefData(documents, uniName) {
	for (var i = 0; i < documents.length; i++) {
		var ref = documents[i];
		var item = new Zotero.Item(getRefType(ref));
		
		item.creators = getAuthors(ref);
		
		if (item.creators.length && ref.subtitle
			&& ref.subtitle.indexOf(item.creators[0].lastName) != -1
		) {
			item.title = ZU.cleanTags(ref.title);
			// Frequently the book's subtitle (and full title) will include the author.
			// Clean it up in those cases
			var subtitle = ZU.cleanTags(ref.subtitle)
				.replace(
					new RegExp(
						'(?:\\s*[-–—/:])?\\s*' // Possibly separated by / but account for other characters too
						+ '(?:ed(?:itor|\\.)?,?\\s+)?' // Could be an editor. Perhaps others?
						+ '(?:' + ZU.quotemeta(item.creators[0].lastName) // Not sure which one could come first
						+ (item.creators[0].firstName
							? '|' + ZU.quotemeta(item.creators[0].firstName)
							: '')
						+ ')'
						+ '.*', // Toss everything afterwards
						'i' // ignore case (mostly for editor part)
					),
					''
				);
			if (subtitle) item.title += ': ' + subtitle;
		} else {
			item.title = ZU.cleanTags(ref.full_title);
		}
		
		item.libraryCatalog = uniName + ", Summon 2.0";
		item.ISBN = ref.isbn;
		item.publisher = ref.publisher;
		item.publicationTitle = ref.publication_title;
		item.numPages = ref.page_count;
		item.tags = ref.subject_terms;
		item.series = ref.publication_series_title;
		
		if (ref.lc_call_numbers) {
			item.callNumber = ref.lc_call_numbers[0];
		}
		
		if (ref.volumes) {
			item.volume = ref.volumes[0];
		}
		
		if (ref.issues) {
			item.issue = ref.issues[0];
		}
		
		if (ref.uris) {
			item.url = ref.uris[0];
		}
		
		if (ref.languages) {
			item.language = ref.languages[0];
		}
		
		if (ref.copyrights) {
			item.rights = ref.copyrights[0];
		}
		
		if (ref.dois) {
			item.DOI = ref.dois[0];
		}
		
		if (ref.abstracts && ref.abstracts.length > 0) {
			item.abstractNote = ref.abstracts[0].abstract;
		}

		if (ref.issns) {
			item.ISSN = ref.issns[0];
		}
		else if (ref.eissns) {
			item.ISSN = ref.eissns[0];
		}

		if (ref.publication_places) {
			item.place = ref.publication_places[0];
		}
		else if (ref.dissertation_schools) {
			item.place = ref.dissertation_schools[0];
		}

		item.pages = ref.pages;
		if (!item.pages && ref.start_pages) {
			item.pages = ref.start_pages[0]
				+ (ref.end_pages && ref.end_pages.length > 0
					? "-" + ref.end_pages[0]
					: ""
				);
		}

		item.date = ref.publication_date;
		if (!item.date && ref.publication_years) {
			item.date = ref.publication_years[ref.publication_years.length - 1];
		}

		if (ref.editions && ref.editions.length > 0 
			&& ref.editions[0] != "1" 
			&& ref.editions[0].indexOf("1st") != 0 
			&& ref.editions[0].toLowerCase().indexOf("first") != 0
		) {
			// we don't care about the first edition
			item.edition = ref.editions[0];
		}
		
		item.complete();
	}
}

function getAuthors(ref) {
	var itemAuthors = [];
	var types = ['authors','corporate_authors'];
	
	for (var j=0; j<types.length; j++) {
		var isCorporate = types[j] != 'authors';
		var refAuthors = ref[types[j]];
		
		for (var i = 0; i < refAuthors.length; i++) {
			var a = refAuthors[i];
			if (a.givenname && a.surname) {
				itemAuthors.push({
					firstName: a.givenname,
					lastName: a.surname,
					creatorType: "author"
				});
			}
			else {
				var name = a.fullname || a.name || "";
				
				if (name == ref.publisher) continue;
				
				if (name.length > 0) {
					
					if (isCorporate) {
						itemAuthors.push({
							lastName: name,
							creatorType: "author",
							fieldMode: 1
						});
					}
					else {
						itemAuthors.push(ZU.cleanAuthor(name, "author", name.indexOf(',') > -1));
					}
				}
			}
		}
	}

	return itemAuthors;
}

function getRefType(ref) {
	switch (ref.content_type) {
		case "Audio Recording":
		case "Music Recording":
			return "audioRecording";
		case "Book":
		case "eBook":
			return "book";
		case "Book Chapter":
			return "bookSection";
		case "Case":
			return "case";
		case "Conference Proceeding":
			return "conferencePaper";
		case "Dissertation":
			return "thesis";
		case "Image":
		case "Photograph":
			return "artwork";
		case "Magazine":
		case "Magazine Article":
			return "magazineArticle";
		case "Manuscript":
			return "manuscript";
		case "Map":
			return "map";
		case "Newspaper Article":
		case "Newspaper":
			return "newspaperArticle";
			break;
		case "Presentation":
			return "presentation";
		case "Reference":
		case "Publication Article":
			return "encyclopediaArticle";
		case "Report":
		case "Technical Report":
		case "Data Set":
		case "Market Research":
		case "Trade Publication Article":
		case "Paper":
			return "report";
		case "Video Recording":
			return "videoRecording";
		case "Web Resource":
			return "webpage";
		case "Poem":
		case "Electronic Resource":
			if (ref.isbn) {
				return "book";
			}
			return "journalArticle";
		case "Journal Article":
		case "Journal":
		case "eJournal":
		case "Book Review":
		case "Newsletter":
		case "Archival Material":
		case "Computer File":
		case "Course Reading":
		case "Government Document":
		case "Kit":
		case "Microform":
		case "Music Score":
		case "Publication":
		case "Realia":
		case "Research Guide":
		case "Special Collection":
		case "Standard":
		case "Transcript":
		default:
			return "journalArticle";
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://dartmouth.summon.serialssolutions.com/?#!/search/document?ho=t&l=en&q=buddha&id=FETCHMERGED-dartmouth_catalog_b412227382",
		"defer": true,
		"items": [
			{
				"itemType": "book",
				"title": "Buddha",
				"creators": [
					{
						"firstName": "Osamu",
						"lastName": "Tezuka",
						"creatorType": "author"
					}
				],
				"date": "2003",
				"ISBN": "9781932234442",
				"language": "English",
				"libraryCatalog": "Dartmouth College Library, Summon 2.0",
				"numPages": "8 v.",
				"place": "New York, N.Y",
				"publisher": "Vertical",
				"attachments": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://dartmouth.summon.serialssolutions.com/?#!/search?ho=t&q=buddha&l=en",
		"defer": true,
		"items": "multiple"
	}
]
/** END TEST CASES **/