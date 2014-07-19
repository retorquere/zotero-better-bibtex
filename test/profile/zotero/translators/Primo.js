{
	"translatorID": "1300cd65-d23a-4bbf-93e5-a3c9e00d1066",
	"label": "Primo",
	"creator": "Matt Burton, Avram Lyon, Etienne Cavalié, Rintze Zelle, Philipp Zumstein, Sebastian Karcher, Aurimas Vinckevicius",
	"target": "/primo_library/|/nebis/|^https?://www\\.recherche-portal\\.ch/zbz/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2014-03-12 21:53:46"
}

/*
Supports Primo 2:
Université de Nice, France (http://catalogue.unice.fr/)  (looks like this is Primo3 now, too)
Supports Primo 3
Boston College (http://www.bc.edu/libraries/),
Oxford Libraries (http://solo.ouls.ox.ac.uk/)

Primos with showPNX.jsp installed:
(1) http://purdue-primo-prod.hosted.exlibrisgroup.com/primo_library/libweb/action/search.do?vid=PURDUE
(2) http://primo.bib.uni-mannheim.de/primo_library/libweb/action/search.do?vid=MAN_UB
(3) http://limo.libis.be/primo_library/libweb/action/search.do?vid=LIBISnet&fromLogin=true
(4.a) http://virtuose.uqam.ca/primo_library/libweb/action/search.do?vid=UQAM
(5) http://searchit.princeton.edu/primo_library/libweb/action/dlDisplay.do?docId=PRN_VOYAGER2778598&vid=PRINCETON&institution=PRN
*/

function getSearchResults(doc) {
	var linkXPaths = [ //order dictates preference
		'.//li[starts-with(@id,"exlidResult") and substring(@id,string-length(@id)-10)="-DetailsTab"]/a[@href]', //details link
		'.//h2[@class="EXLResultTitle"]/a[@href]' //title link
	];
	var resultsXPath = '//*[self::tr or self::div][starts-with(@id, "exlidResult") and '
		+ 'number(substring(@id,12))=substring(@id,12)][' + linkXPaths.join(' or ') + ']';
	//Z.debug(resultsXPath);
	var results = ZU.xpath(doc, resultsXPath);
	results.titleXPath = './/h2[@class="EXLResultTitle"]';
	results.linkXPaths = linkXPaths;
	return results;
}

function detectWeb(doc, url) {
	if(getSearchResults(doc).length) {
		return 'multiple';
	}
	
	var contentDiv = doc.getElementsByClassName('EXLFullResultsHeader');
	if(!contentDiv.length) contentDiv = doc.getElementsByClassName('EXLFullDisplay');
	if(!contentDiv.length) contentDiv = doc.getElementsByClassName('EXLFullView');
	if(contentDiv.length) return 'book';
}

function doWeb(doc, url) {
	var searchResults = getSearchResults(doc);
	if(searchResults.length) {
		var items = {}, itemIDs = {}, title, link,
			linkXPaths = searchResults.linkXPaths;
		for(var i=0, n=searchResults.length; i<n; i++) {
			title = ZU.xpathText(searchResults[i], searchResults.titleXPath);
			for(var j=0, m=linkXPaths.length; j<m; j++) {
				link = ZU.xpath(searchResults[i], linkXPaths[j])[0];
				if(link) {
					break;
				}
			}
			
			if(!link || !title || !(title = ZU.trimInternal(title))) continue;
			
			items[link.href] = title;
			itemIDs[link.href] = {id: i, docID: getDocID(link.href)};
		}
		
		Z.selectItems(items, function(selectedItems) {
			if(!selectedItems) return true;
			
			var urls = [];
			for(var i in selectedItems) {
				urls.push({url: i, id: itemIDs[i].id, docID: itemIDs[i].docID});
			}
			fetchPNX(urls);
		})
	} else {
		fetchPNX([{url: url, id: 0, docID: getDocID(url)}]);
	}
}

function getDocID(url) {
	var id = url.match(/\bdoc(?:Id)?=([^&]+)/i);
	if(id) return id[1];
}

//keeps track of which URL format works for retrieving PNX record
//and applies the correct transformation function
var PNXUrlGenerator = new function() {
	var functions = [
		//showPNX.js
		//using docIDs instead of IDs tied to a session
		//e.g. http://searchit.princeton.edu/primo_library/libweb/showPNX.jsp?id=PRN_VOYAGER7343340
		function(urlObj) {
			return getUrlWithId(urlObj.url, urlObj.docID);
		},
		//fall back to IDs
		//from: http://primo.bib.uni-mannheim.de/primo_library/libweb/action/search.do?...
		//to:   http://primo.bib.uni-mannheim.de/primo_library/libweb/showPNX.jsp?id=
		function(urlObj) {
			return getUrlWithId(urlObj.url, urlObj.id);
		},
		//simply add &showPnx=true
		function(urlObj) {
			var url = urlObj.url.split('#');
			if(url[0].indexOf('?') == -1) {
				url[0] += '?';
			} else {
				url[0] += '&';
			}
			return url[0] + 'showPnx=true';
		}
	];
	
	function getUrlWithId(url, id) {
		var url = url.match(/(https?:\/\/[^?#]+\/)[^?#]+\/[^\/]*(?:[?#]|$)/);
		if(!url) return;
		return url[1] + 'showPNX.jsp?id=' + id;
	}
	
	this.currentFunction = 0;
	this.confirmed = false;
	
	this.getUrl = function(data) {
		var fun = functions[this.currentFunction];
		if(!fun) return;
		
		return fun(data);
	};
	
	this.nextFunction = function() {
		if(!this.confirmed && this.currentFunction < functions.length) {
			Z.debug("Function " + this.currentFunction + " did not work.");
			this.currentFunction++;
			return true;
		}
	};
};

//retrieve PNX records for given items sequentially
function fetchPNX(itemData) {
	if(!itemData.length) return; //do this until we run out of URLs
	
	var data = itemData.shift();
	var url = PNXUrlGenerator.getUrl(data); //format URL if still possible
	if(!url) {
		if(PNXUrlGenerator.nextFunction()) {
			itemData.unshift(data);
		} else if(!PNXUrlGenerator.confirmed){
			//in case we can't find PNX for a particular item,
			//go to the next and start looking from begining
			Z.debug("Could not determine PNX url from " + data.url);
			PNXUrlGenerator.currentFunction = 0;
		}
		
		fetchPNX(itemData);
		return;
	}
	
	var gotPNX = false;
	Z.debug("Trying " + url);
	ZU.doGet(url,
		function(text) {
			text = text.trim();
			if(text.substr(0,5) != '<?xml' || text.search(/<error\b/i) !== -1) {
				//try a different PNX url
				gotPNX = false;
				return;
			} else {
				gotPNX = true;
				PNXUrlGenerator.confirmed = true;
			}
			
			importPNX(text);
		},
		function() {
			if(!gotPNX && PNXUrlGenerator.nextFunction()) {
				//if url function not confirmed, try another one on the same URL
				//otherwise, we move on
				itemData.unshift(data);
			}
			
			fetchPNX(itemData);
		}
	);
}

//import PNX record
function importPNX(text) {
	//Note that if the session times out, PNX record will just contain a "null" entry
	//Z.debug(text);
	//a lot of these apply only to prim records, mainly (but no exclusively) served by the jsp file
	text = text.replace(/\<\/?xml-fragment[^\>]*\>/g, "")
			.replace(/(<\/?)\w+:([^\>]*)/g, "$1$2") //remove namespaces
			//remove ns declarations - we don't need them and they break this
			.replace(/<[^>]+/g, function(m) {
				return m.replace(/\s+xmlns(?::\w+)?\s*=\s*(['"]).*?\1/ig, '');
			});
	//Z.debug(text);
	
	var parser = new DOMParser();
	var doc = parser.parseFromString(text, "text/xml");
	
	var item = new Zotero.Item();
	
	var itemType = ZU.xpathText(doc, '//display/type');
	if(!itemType) {
		throw new Error('Could not locate item type');
	}
	
	switch(itemType.toLowerCase()) {
		case 'book':
		case 'books':
			item.itemType = "book";
		break;
		case 'audio':
			item.itemType = "audioRecording";
		break;
		case 'video':
			item.itemType = "videoRecording";
		break;
		case 'report':
			item.itemType = "report";
		break;
		case 'webpage':
			item.itemType = "webpage";
		break;
		case 'article':
			item.itemType = "journalArticle";
		break;
		case 'thesis':
			item.itemType = "thesis";
		break;
		case 'map':
			item.itemType = "map";
		break;
		default:
			item.itemType = "document";
	}
	
	item.title = ZU.xpathText(doc, '//display/title');
	if(item.title) item.title = ZU.unescapeHTML(item.title);
	
	var creators;
	var contributors;
	if(ZU.xpathText(doc, '//display/creator')) {
		creators = ZU.xpath(doc, '//display/creator'); 
	}
	
	if(ZU.xpathText(doc, '//display/contributor')) {
		contributors = ZU.xpath(doc, '//display/contributor'); 
	}
	
	if(!creators && contributors) { // <creator> not available using <contributor> as author instead
		creators = contributors;
		contributors = null;
	}
	
	if(!creators && ! contributors){
		creators = ZU.xpath(doc, '//addata/addau')
	}
	
	for(i in creators) {
		if(creators[i]) {
			var creator  = ZU.unescapeHTML(creators[i].textContent).split(/\s*;\s*/);
			for(j in creator){
				creator[j] = creator[j].replace(/\d{4}-(\d{4})?/g, '');
				item.creators.push(Zotero.Utilities.cleanAuthor(creator[j], "author", true));
			}			
		}
	}
	
	for(i in contributors) {
		if(contributors[i]) {
			var contributor = ZU.unescapeHTML(contributors[i].textContent).split(/\s*;\s*/);
			for(j in contributor){
			contributor[j] = contributor[j].replace(/\d{4}-(\d{4})?/g, '');
			item.creators.push(Zotero.Utilities.cleanAuthor(contributor[j], "contributor", true));
			}			
		}
	}
	//PNX doesn't do well with institutional authors; This isn't perfect, but it helps:
	for(i in item.creators){
		if(!item.creators[i].firstName){
			item.creators[i].fieldMode=1;
		}
	}
	
	var publisher = ZU.xpathText(doc, '//display/publisher');
	if(publisher) var pubplace = ZU.unescapeHTML(publisher).split(" : ");
	if(pubplace && pubplace[1]) {
		item.place = pubplace[0].replace(/,\s*c?\d+|[\(\)\[\]]|(\.\s*)?/g, "");
		item.publisher = pubplace[1].replace(/,\s*c?\d+|[\(\)\[\]]|(\.\s*)?/g, "")
			.replace(/^\s*"|,?"\s*$/g, '');
	} else if(pubplace) {
		item.publisher = pubplace[0].replace(/,\s*c?\d+|[\(\)\[\]]|(\.\s*)?/g, "")
			.replace(/^\s*"|,?"\s*$/g, '');
	}
	
	var date = ZU.xpathText(doc, '//display/creationdate|//search/creationdate');
	var m;
	if(date && (m = date.match(/\d+/))) {
		item.date = m[0];
	}
	
	// the three letter ISO codes that should be in the language field work well:
	item.language = ZU.xpathText(doc, '//display/language');
	
	var pages = ZU.xpathText(doc, '//display/format');
	if(pages && pages.search(/[0-9]+/) != -1) {
		pages = pages.replace(/[\(\)\[\]]/g, "").match(/[0-9]+/);
		item.pages = item.numPages = pages[0];
	}

	// The identifier field is supposed to have standardized format, but
	// the super-tolerant idCheck should be better than a regex.
	// (although note that it will reject invalid ISBNs)
	var locators = ZU.xpathText(doc, '//display/identifier');
	if(locators) {
		item.ISBN = ZU.cleanISBN(locators);
		item.ISSN = ZU.cleanISSN(locators);
	}
	
	item.edition = ZU.xpathText(doc, '//display/edition');
	
	var subjects = ZU.xpath(doc, '//search/subject');
	for(var i=0, n=subjects.length; i<n; i++) {
		item.tags.push(ZU.trimInternal(subjects[i].textContent));
	}
	
	item.abstractNote = ZU.xpathText(doc, '//addata/abstract')
		|| ZU.xpathText(doc, '//display/description');
	
	item.DOI = ZU.xpathText(doc, '//addata/doi');
	item.issue = ZU.xpathText(doc, '//addata/issue');
	item.volume = ZU.xpathText(doc, '//addata/volume');
	item.publicationTitle = ZU.xpathText(doc, '//addata/jtitle');
	item.pages = ZU.xpathText(doc, '//addata/pages');
	
	// does callNumber get stored anywhere else in the xml?
	item.callNumber = ZU.xpathText(doc, '//enrichment/classificationlcc');
	
	item.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"defer": true,
		"url": "http://solo.bodleian.ox.ac.uk/primo_library/libweb/action/dlDisplay.do?docId=oxfaleph010311597&vid=OXVU1",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Jürgen",
						"lastName": "Pütz",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Thelen, Albert Vigoleis, 1903-1989 Y"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "In Zweifelsfällen entscheidet die Wahrheit : Beiträge zu Albert Vigoleis Thelen",
				"place": "Viersen",
				"publisher": "JUNI",
				"date": "1988",
				"language": "ger",
				"numPages": "149",
				"ISBN": "3926738014",
				"libraryCatalog": "Primo",
				"shortTitle": "In Zweifelsfällen entscheidet die Wahrheit"
			}
		]
	}
]
/** END TEST CASES **/