{
	"translatorID": "951c027d-74ac-47d4-a107-9c3069ab7b48",
	"label": "Embedded Metadata",
	"creator": "Simon Kornblith and Avram Lyon",
	"target": "",
	"minVersion": "3.0.4",
	"maxVersion": "",
	"priority": 320,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-11-01 19:46:46"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2011 Avram Lyon and the Center for History and New Media
					 George Mason University, Fairfax, Virginia, USA
					 http://zotero.org

	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


var HIGHWIRE_MAPPINGS = {
	"citation_title":"title",
	"citation_publication_date":"date",	//perhaps this is still used in some old implementations
	"citation_cover_date": "date", //used e.g. by Springer http://link.springer.com/article/10.1023/A:1021669308832
	"citation_date":"date",
	"citation_journal_title":"publicationTitle",
	"citation_journal_abbrev":"journalAbbreviation",
	"citation_inbook_title": "publicationTitle", //used as bookTitle or proceedingTitle, e.g. http://pubs.rsc.org/en/content/chapter/bk9781849730518-00330/978-1-84973-051-8
	"citation_book_title":"bookTitle",
	"citation_volume":"volume",
	"citation_issue":"issue",
	"citation_series_title":"series",
	"citation_conference_title":"conferenceName",
	"citation_conference":"conferenceName",
	"citation_dissertation_institution":"university",
	"citation_technical_report_institution":"institution",
	"citation_technical_report_number":"number",
	"citation_publisher":"publisher",
	"citation_isbn":"ISBN",
	"citation_abstract":"abstractNote",
	"citation_doi":"DOI",
	"citation_public_url":"url",
	"citation_language":"language"

/* the following are handled separately in addHighwireMetadata()
	"citation_author"
	"citation_authors"
	"citation_firstpage"
	"citation_lastpage"
	"citation_issn"
	"citation_eIssn"
	"citation_pdf_url"
	"citation_abstract_html_url"
	"citation_fulltext_html_url"
	"citation_pmid"
	"citation_online_date"
	"citation_year"
	"citation_keywords"
*/
};

// Maps actual prefix in use to URI
// The defaults are set to help out in case a namespace is not declared
// Copied from RDF translator
var _prefixes = {
	bib:"http://purl.org/net/biblio#",
	bibo:"http://purl.org/ontology/bibo/",
	dc:"http://purl.org/dc/elements/1.1/",
	dcterms:"http://purl.org/dc/terms/",
	prism:"http://prismstandard.org/namespaces/1.2/basic/",
	foaf:"http://xmlns.com/foaf/0.1/",
	vcard:"http://nwalsh.com/rdf/vCard#",
	link:"http://purl.org/rss/1.0/modules/link/",
	z:"http://www.zotero.org/namespaces/export#",
	eprint:"http://purl.org/eprint/terms/",
	eprints:"http://purl.org/eprint/terms/",
	og:"http://ogp.me/ns#",				// Used for Facebook's OpenGraph Protocol
	article:"http://ogp.me/ns/article#",
	book:"http://ogp.me/ns/book#",
	music:"http://ogp.me/ns/music#",
	video:"http://ogp.me/ns/video#",
	rdf:"http://www.w3.org/1999/02/22-rdf-syntax-ns#"
};

var _prefixRemap = {
	//DC should be in lower case
	"http://purl.org/DC/elements/1.0/": "http://purl.org/dc/elements/1.0/",
	"http://purl.org/DC/elements/1.1/": "http://purl.org/dc/elements/1.1/"
};

var namespaces = {};

var _rdfPresent = false,
	_haveItem = false,
	_itemType;

var RDF;

var CUSTOM_FIELD_MAPPINGS;

function addCustomFields(customFields) {
	CUSTOM_FIELD_MAPPINGS = customFields;
}

function setPrefixRemap(map) {
	_prefixRemap = map;
}

function remapPrefix(uri) {
	if(_prefixRemap[uri]) return _prefixRemap[uri];
	return uri;
}

function getPrefixes(doc) {
	var links = doc.getElementsByTagName("link");
	for(var i=0, link; link = links[i]; i++) {
		// Look for the schema's URI in our known schemata
		var rel = link.getAttribute("rel");
		if(rel) {
			var matches = rel.match(/^schema\.([a-zA-Z]+)/);
			if(matches) {
				var uri = remapPrefix(link.getAttribute("href"));
				//Zotero.debug("Prefix '" + matches[1].toLowerCase() +"' => '" + uri + "'");
				_prefixes[matches[1].toLowerCase()] = uri;
			}
		}
	}

	//also look in html and head elements
	var prefixes = (doc.documentElement.getAttribute('prefix') || '')
		+ (doc.head.getAttribute('prefix') || '');
	var prefixRE = /(\w+):\s+(\S+)/g;
	var m;
	while(m = prefixRE.exec(prefixes)) {
		var uri = remapPrefix(m[2]);
		Z.debug("Prefix '" + m[1].toLowerCase() +"' => '" + uri + "'");
		_prefixes[m[1].toLowerCase()] = uri;
	}
}

// Boolean Parameters (default values false)
//   * strict = false: compare only ending substring, e.g. bepress
//   * strict = true: compare exactly
//   * all = false: return only first match
//   * all = true: concatenate all values
function getContentText(doc, name, strict, all) {
	let csspath = 'html>head>meta[name' + (strict ? '="' : '$="') + name + '"]';
	if (all) {
		return Array.from(doc.querySelectorAll(csspath)).map(obj => obj.content || obj.contents).join(', ');
	} else {
		return attr(doc, csspath, 'content') || attr(doc, csspath, 'contents');
	}
}

function getContent(doc, name, strict) {
	var xpath = '/x:html/x:head/x:meta[' +
		(strict?'@name':
			'substring(@name, string-length(@name)-' + (name.length - 1) + ')') +
		'="'+ name +'"]/';
	return ZU.xpath(doc, xpath + '@content | ' + xpath + '@contents', namespaces);
}

function fixCase(authorName) {
	//fix case if all upper or all lower case
	if(authorName.toUpperCase() === authorName ||
		authorName.toLowerCase() === authorName) {
		return ZU.capitalizeTitle(authorName, true);
	}

	return authorName;
}

function processFields(doc, item, fieldMap, strict) {
	for(var metaName in fieldMap) {
		var zoteroName = fieldMap[metaName];
		// only concatenate values for ISSN and ISBN; otherwise take the first
		var allValues = (zoteroName == "ISSN" || zoteroName == "ISBN");
		var value = getContentText(doc, metaName, strict, allValues);
		if(value && value.trim()) {
			item[zoteroName] = ZU.trimInternal(value);
		}
	}
}

function completeItem(doc, newItem) {
	// Strip off potential junk from RDF
	newItem.seeAlso = [];

	addHighwireMetadata(doc, newItem);
	addOtherMetadata(doc, newItem);
	addLowQualityMetadata(doc, newItem);
	finalDataCleanup(doc, newItem);

	if(CUSTOM_FIELD_MAPPINGS) {
		processFields(doc, newItem, CUSTOM_FIELD_MAPPINGS, true);
	}

	newItem.complete();
}

function detectWeb(doc, url) {
	//blacklist wordpress jetpack comment plugin so it doesn't override other metadata
	if (url.indexOf("jetpack.wordpress.com/jetpack-comment/")!=-1) return false;
	if(exports.itemType) return exports.itemType;

	init(doc, url, Zotero.done);
}

function init(doc, url, callback, forceLoadRDF) {
	getPrefixes(doc);

	var metaTags = doc.head.getElementsByTagName("meta");
	Z.debug("Embedded Metadata: found " + metaTags.length + " meta tags.");
	if(forceLoadRDF /* check if this is called from doWeb */ && !metaTags.length) {
		if(doc.head) {
			Z.debug(doc.head.innerHTML
				.replace(/<style[^<]+(?:<\/style>|\/>)/ig, '')
				.replace(/<link[^>]+>/ig, '')
				.replace(/(?:\s*[\r\n]\s*)+/g, '\n')
			);
		} else {
			Z.debug("Embedded Metadata: No head tag");
		}
	}

	var hwType, hwTypeGuess, generatorType, statements = [];

	for(var i=0, metaTag; metaTag = metaTags[i]; i++) {
		// Two formats allowed:
		// 	<meta name="..." content="..." />
		//	<meta property="..." content="..." />
		// The first is more common; the second is recommended by Facebook
		// for their OpenGraph vocabulary
		var tags = metaTag.getAttribute("name");
		if (!tags) tags = metaTag.getAttribute("property");
		var value = metaTag.getAttribute("content");
		if(!tags || !value) continue;
		//Z.debug(tags + " -> " + value);

		tags = tags.split(/\s+/);
		for(var j=0, m=tags.length; j<m; j++) {
			var tag = tags[j];
			// We allow three delimiters between the namespace and the property
			var delimIndex = tag.search(/[.:_]/);
			//if(delimIndex === -1) continue;

			var prefix = tag.substr(0, delimIndex).toLowerCase();
			if(_prefixes[prefix]) {
				var prop = tag.substr(delimIndex+1, 1).toLowerCase()+tag.substr(delimIndex+2);
				//bib and bibo types are special, they use rdf:type to define type
				var specialNS = [_prefixes['bib'], _prefixes['bibo']];
				if(prop == 'type' && specialNS.indexOf(_prefixes[prefix]) != -1) {
					value = _prefixes[prefix] + value;
					prefix = 'rdf';
				}

				// This debug is for seeing what is being sent to RDF
				//Zotero.debug(_prefixes[prefix]+prop +"=>"+value);
				statements.push([url, _prefixes[prefix]+prop, value]);
			} else if(tag.toLowerCase() == 'generator') {
				var lcValue = value.toLowerCase();
				if(lcValue.indexOf('blogger') != -1
					|| lcValue.indexOf('wordpress') != -1
					|| lcValue.indexOf('wooframework') != -1
				) {
					generatorType = 'blogPost';
				}
			} else {
				var shortTag = tag.slice(tag.lastIndexOf('citation_'));
				switch(shortTag) {
					case "citation_journal_title":
						hwType = "journalArticle";
						break;
					case "citation_technical_report_institution":
						hwType = "report";
						break;
					case "citation_conference_title":
					case "citation_conference":
						hwType = "conferencePaper";
						break;
					case "citation_book_title":
						hwType = "bookSection";
						break;
					case "citation_dissertation_institution":
						hwType = "thesis";
						break;
					case "citation_title":		//fall back to journalArticle, since this is quite common
					case "citation_series_title":	//possibly journal article, though it could be book
						hwTypeGuess = hwTypeGuess || "journalArticle";
						break;
					case 'citation_isbn':
						hwTypeGuess = "book"; // Unlikely, but other item types may have ISBNs as well (e.g. Reports?)
						break;
				}
			}
		}
	}

	if(statements.length || forceLoadRDF) {
		// load RDF translator, so that we don't need to replicate import code
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("5e3ad958-ac79-463d-812b-a86a9235c28f");
		translator.setHandler("itemDone", function(obj, newItem) {
			_haveItem = true;
			// Z.debug(newItem)
			completeItem(doc, newItem);
		});

		translator.getTranslatorObject(function(rdf) {
			for(var i=0; i<statements.length; i++) {
				var statement = statements[i];
				rdf.Zotero.RDF.addStatement(statement[0], statement[1], statement[2], true);
			}
			var nodes = rdf.getNodes(true);
			rdf.defaultUnknownType = hwType || hwTypeGuess || generatorType ||
				//if we have RDF data, then default to webpage
				(nodes.length ? "webpage":false);

			//if itemType is overridden, no reason to run RDF.detectWeb
			if(exports.itemType) {
				rdf.itemType = exports.itemType;
				_itemType = exports.itemType;
			} else {
				_itemType = nodes.length ? rdf.detectType({},nodes[0],{}) : rdf.defaultUnknownType;
			}

			RDF = rdf;
			callback(_itemType);
		});
	} else {
		callback(exports.itemType || hwType || hwTypeGuess || generatorType);
	}
}

function doWeb(doc, url) {
	//set default namespace
	namespaces.x = doc.documentElement.namespaceURI;
	// populate _rdfPresent, _itemType, and _prefixes
	// As of https://github.com/zotero/zotero/commit/0cd183613f5dacc85676109c3a5c6930e3632fae
	// globals do not seem to be isolated to individual translators, so
	// RDF object, importantly the "itemDone" handlers, can get overridden
	// by other translators, so we cannot reuse the RDF object from detectWeb
	RDF = false;
	if(!RDF) init(doc, url, function() { importRDF(doc, url) }, true);
	else importRDF(doc, url);
}

//perform RDF import
function importRDF(doc, url) {
	RDF.doImport();
	if(!_haveItem) {
		completeItem(doc, new Zotero.Item(_itemType));
	}
}

/**
 * Adds HighWire metadata and completes the item
 */
function addHighwireMetadata(doc, newItem) {
	// HighWire metadata
	processFields(doc, newItem, HIGHWIRE_MAPPINGS);
	var authorNodes = getContent(doc, 'citation_author');
	if (authorNodes.length == 0) {
		authorNodes = getContent(doc, 'citation_authors');
	}
	//save rdfCreators for later
	var rdfCreators = newItem.creators;
	newItem.creators = [];
	for(var i=0, n=authorNodes.length; i<n; i++) {
		var authors = authorNodes[i].nodeValue.split(/\s*;\s*/);
		if (authors.length == 1 && authorNodes.length == 1) {
			/* If there is only one author node and 
			 we get nothing when splitting by semicolon, and at least two words on
			 either side of the comma when splitting by comma, we split by comma. */
			var authorsByComma = authors[0].split(/\s*,\s*/);
			if (authorsByComma.length > 1
				&& authorsByComma[0].indexOf(" ") !== -1
				&& authorsByComma[1].indexOf(" ") !== -1)
				authors = authorsByComma;
		}
		for(var j=0, m=authors.length; j<m; j++) {
			var author = authors[j].trim();

			//skip empty authors. Try to match something other than punctuation
			if(!author || !author.match(/[^\s,-.;]/)) continue;

			author = ZU.cleanAuthor(author, "author", author.indexOf(",") !== -1);
			if(author.firstName) {
				//fix case for personal names
				author.firstName = fixCase(author.firstName);
				author.lastName = fixCase(author.lastName);
			}
			newItem.creators.push(author);
		}
	}

	if( !newItem.creators.length ) {
		newItem.creators = rdfCreators;
	} else if(rdfCreators.length) {
		//try to use RDF creator roles to update the creators we have
		for(var i=0, n=newItem.creators.length; i<n; i++) {
			var name = newItem.creators[i].firstName +
				newItem.creators[i].lastName;
			for(var j=0, m=rdfCreators.length; j<m; j++) {
				var creator = rdfCreators[j];
				if( name.toLowerCase() == (creator.firstName + creator.lastName).toLowerCase() ) {
					//highwire should set all to author, so we only care about editor
					//contributor is not always a contributor
					if(creator.creatorType == 'editor') {
						newItem.creators[i].creatorType == creator.creatorType;
					}
					rdfCreators.splice(j,1);
					break;
				}
			}
		}

		/* This may introduce duplicates
		//if there are leftover creators from RDF, we should use them
		if(rdfCreators.length) {
			for(var i=0, n=rdfCreators.length; i<n; i++) {
				newItem.creators.push(rdfCreators[i]);
			}
		}*/
	}

	//Deal with tags in a string
	//we might want to look at the citation_keyword metatag later
	if(!newItem.tags || !newItem.tags.length) {
		var tags = getContent(doc, 'citation_keywords');
		newItem.tags = [];
		for(var i=0; i<tags.length; i++) {
			var tag = tags[i].textContent.trim();
			if(tag) {
				var splitTags = tag.split(';');
				for(var j=0; j<splitTags.length; j++) {
					if(!splitTags[j].trim()) continue;
					newItem.tags.push(splitTags[j].trim());
				}
			}
		}
	}

	//sometimes RDF has more info, let's not drop it
	var rdfPages = (newItem.pages)? newItem.pages.split(/\s*-\s*/) : new Array();
	var firstpage = getContentText(doc, 'citation_firstpage');
	var lastpage = getContentText(doc, 'citation_lastpage');
	if (firstpage && firstpage.includes("-")) {
		firstpage = firstpage.split(/\s*-\s*/)[0];
		lastpage = lastpage || firstpage.split(/\s*-\s*/)[1];
	}
	firstpage = firstpage || rdfPages[0];
	var lastpage = lastpage || rdfPages[1];
	if(firstpage && ( firstpage = firstpage.trim() )) {
		newItem.pages = firstpage +
			( ( lastpage && ( lastpage = lastpage.trim() ) )?'-' + lastpage : '' );
	}

	//fall back to some other date options
	if(!newItem.date) {
		var onlineDate = getContentText(doc, 'citation_online_date');
		var citationYear = getContentText(doc, 'citation_year');
		
		if (onlineDate && citationYear) {
			onlineDate = ZU.strToISO(onlineDate);
			if (citationYear < onlineDate.substr(0,4)) {
				// online date can be years after the citation year
				newItem.date = citationYear;
			} else {
				newItem.date = onlineDate;
			}
		} else {
			newItem.date = onlineDate || citationYear;
		}
	}

	//prefer ISSN over eISSN
	var issn = getContentText(doc, 'citation_issn', null, true) ||
			getContentText(doc, 'citation_ISSN', null, true) ||
			getContentText(doc, 'citation_eIssn', null, true);

	if(issn) newItem.ISSN = issn;

	//This may not always yield desired results
	//i.e. if there is more than one pdf attachment (not common)
	var pdfURL = getContent(doc, 'citation_pdf_url');
	if(pdfURL.length) {
		pdfURL = pdfURL[0].textContent;
		//delete any pdf attachments if present
		//would it be ok to just delete all attachments??
		for(var i=newItem.attachments.length-1; i>=0; i--) {
			if(newItem.attachments[i].mimeType == 'application/pdf') {
				newItem.attachments.splice(i, 1);
			}
		}

		newItem.attachments.push({title:"Full Text PDF", url:pdfURL, mimeType:"application/pdf"});
	}

	//add snapshot
	newItem.attachments.push({document:doc, title:"Snapshot"});

	//store PMID in Extra and as a link attachment
	//e.g. http://www.sciencemag.org/content/332/6032/977.full
	var PMID = getContentText(doc, 'citation_pmid');
	if(PMID) {
		if(newItem.extra) newItem.extra += '\n';
		else newItem.extra = '';

		newItem.extra += 'PMID: ' + PMID;

		newItem.attachments.push({
			title: "PubMed entry",
			url: "http://www.ncbi.nlm.nih.gov/pubmed/" + PMID,
			mimeType: "text/html",
			snapshot: false
		});
	}

	// Other last chances
	if(!newItem.url) {
		newItem.url = getContentText(doc, "citation_abstract_html_url") ||
			getContentText(doc, "citation_fulltext_html_url");
	}
}

function addOtherMetadata(doc, newItem) {
	// Scrape parsely metadata http://parsely.com/api/crawler.html
	var parselyJSON = ZU.xpathText(doc, '(//x:meta[@name="parsely-page"]/@content)[1]', namespaces);
	if(parselyJSON) {
		try {
			var parsely = JSON.parse(parselyJSON);
		} catch(e) {}

		if(parsely) {
			if(!newItem.title && parsely.title) {
				newItem.title = parsely.title;
			}

			if(!newItem.url && parsely.url) {
				newItem.url = parsely.url;
			}

			if(!newItem.date && parsely.pub_date) {
				var date = new Date(parsely.pub_date);
				if(!isNaN(date.getUTCFullYear())) {
					newItem.date = ZU.formatDate({
						year: date.getUTCFullYear(),
						month: date.getUTCMonth(),
						day: date.getUTCDate()
					}, true);
				}
			}

			if(!newItem.creators.length && parsely.author) {
				newItem.creators.push(ZU.cleanAuthor(''+parsely.author, 'author'));
			}

			if(!newItem.tags.length && parsely.tags && parsely.tags.length) {
				newItem.tags = parsely.tags;
			}
		}
	}
}

function addLowQualityMetadata(doc, newItem) {
	//if we don't have a creator, look for byline on the page
	//but first, we're desperate for a title
	if(!newItem.title) {
		Z.debug("Title was not found in meta tags. Using document title as title");
		newItem.title = doc.title;
	}

	if(newItem.title) {
		newItem.title = newItem.title.replace(/\s+/g, ' '); //make sure all spaces are \u0020

		if(newItem.publicationTitle) {
			//remove publication title from the end of title (see #604)
			//this can occur if we have to doc.title, og:title etc.
			//Make sure we escape all regex special chars in publication title
			var removePubTitleRegex = new RegExp('\\s*[-–—=_:|~#]\\s*'
				+ newItem.publicationTitle.replace(/([()\[\]\$\^\*\+\.?\|])/g, '\\$1') + '\\s*$','i');
			newItem.title = newItem.title.replace(removePubTitleRegex, '');
		}
	}

	if(!newItem.creators.length) {
		//the authors in the standard W3 author tag are safer than byline guessing
		var w3authors = ZU.xpath(doc, '//meta[@name="author" or @property="author"]' );
		if (w3authors.length>0){
			for (var i = 0; i<w3authors.length; i++){
				//skip empty authors. Try to match something other than punctuation
				if(!w3authors[i].content || !w3authors[i].content.match(/[^\s,-.;]/)) continue;
				newItem.creators.push(ZU.cleanAuthor(w3authors[i].content, "author"));
			}
		}
		else if (tryOgAuthors(doc)) {
			newItem.creators = tryOgAuthors(doc);
		}
		else {
			getAuthorFromByline(doc, newItem);
		}
	}
	//fall back to "keywords"
	if(!newItem.tags.length) {
		 newItem.tags = ZU.xpathText(doc, '//x:meta[@name="keywords"]/@content', namespaces);
	}

	//We can try getting abstract from 'description'
	if(!newItem.abstractNote) {
		newItem.abstractNote = ZU.trimInternal(
			ZU.xpathText(doc, '//x:meta[@name="description"]/@content', namespaces) || '');
	}

	if(!newItem.url) {
		newItem.url = ZU.xpathText(doc, '//head/link[@rel="canonical"]/@href') || doc.location.href;
	}
	
	if (!newItem.language) {
		newItem.language = ZU.xpathText(doc, '//x:meta[@name="language"]/@content', namespaces) ||
			ZU.xpathText(doc, '//x:meta[@name="lang"]/@content', namespaces) ||
			ZU.xpathText(doc, '//x:meta[@http-equiv="content-language"]/@content', namespaces) ||
			ZU.xpathText(doc, '//html/@lang') ||
			doc.documentElement.getAttribute('xml:lang');
	}


	newItem.libraryCatalog = doc.location.host;

	// add access date
	newItem.accessDate = 'CURRENT_TIMESTAMP';
}

function tryOgAuthors(doc) {
	/*returns an array of objects of Og authors, but only where they do not contain a URL to prevent getting facebook profiles
	In a worst case scenario, where real authors and social media profiles are mixed, we might miss some, but that's still
	preferable to garbage */
	var authors = [];
	var ogAuthors = ZU.xpath(doc, '//meta[@property="article:author" or @property="video:director" or @property="music:musician"]');
	for (var i = 0; i<ogAuthors.length; i++) {
		
		if (ogAuthors[i].content && ogAuthors[i].content.search(/(https?:\/\/)?[\da-z\.-]+\.[a-z\.]{2,6}/) < 0 && ogAuthors[i].content !== "false") {
			authors.push(ZU.cleanAuthor(ogAuthors[i].content, "author"))
		}
	}
	return authors.length ? authors : null;
}

function getAuthorFromByline(doc, newItem) {
	var bylineClasses = ['byline', 'vcard'];
	Z.debug("Looking for authors in " + bylineClasses.join(', '));
	var bylines = [], byline;
	for(var i=0; i<bylineClasses.length; i++) {
		byline = doc.getElementsByClassName(bylineClasses[i]);
		Z.debug("Found " + byline.length + " elements with '" + bylineClasses[i] + "' class");
		for(var j=0; j<byline.length; j++) {
			if (!byline[j].textContent.trim()) continue;

			bylines.push(byline[j]);
		}
	}

	var actualByline;
	if(!bylines.length) {
		Z.debug("No byline found.");
		return;
	} else if(bylines.length == 1) {
		actualByline = bylines[0];
	} else if(newItem.title) {
		Z.debug(bylines.length + " bylines found:");
		Z.debug(bylines.map(function(n) { return ZU.trimInternal(n.textContent)}).join('\n'));
		Z.debug("Locating the one closest to title.");

		//find the closest one to the title (in DOM)
		actualByline = false;
		var parentLevel = 1;
		var skipList = [];

		// Wrap title in quotes so we can use it in the xpath
		var xpathTitle = newItem.title.toLowerCase();
		if(xpathTitle.indexOf('"') != -1) {
			if(xpathTitle.indexOf("'") == -1) {
				// We can just use single quotes then
				xpathTitle = "'" + xpathTitle + "'";
			} else {
				// Escaping double quotes in xpaths is really hard
				// Solution taken from http://kushalm.com/the-perils-of-xpath-expressions-specifically-escaping-quotes
				xpathTitle = 'concat("' + xpathTitle.replace(/"+/g, '",\'$&\', "') + '")';
			}
		} else {
			xpathTitle = '"' + xpathTitle + '"';
		}

		var titleXPath = './/*[normalize-space(translate(text(),"ABCDEFGHJIKLMNOPQRSTUVWXYZ\u00a0","abcdefghjiklmnopqrstuvwxyz "))='
			+ xpathTitle + ']';
		Z.debug("Looking for title using: " + titleXPath);
		while(!actualByline && bylines.length != skipList.length && parentLevel < 5) {
			Z.debug("Parent level " + parentLevel);
			for(var i=0; i<bylines.length; i++) {
				if(skipList.indexOf(i) !== -1) continue;

				if(parentLevel == 1) {
					//skip bylines that contain bylines
					var containsBylines = false;
					for(var j=0;!containsBylines && j<bylineClasses.length; j++) {
						containsBylines = bylines[i].getElementsByClassName(bylineClasses[j]).length;
					}
					if(containsBylines) {
						Z.debug("Skipping potential byline " + i + ". Contains other bylines");
						skipList.push(i);
						continue;
					}
				}

				var bylineParent = bylines[i];
				for(var j=0; j<parentLevel; j++) {
					bylineParent = bylineParent.parentElement;
				}
				if(!bylineParent) {
					Z.debug("Skipping potential byline " + i + ". Nowhere near title");
					skipList.push(i);
					continue;
				}

				if(ZU.xpath(bylineParent, titleXPath).length) {
					if(actualByline) {
						//found more than one, bail
						Z.debug('More than one possible byline found. Will not proceed');
						return;
					}
					actualByline = bylines[i];
				}
			}

			parentLevel++;
		}
	}

	if(actualByline) {
		var byline = ZU.trimInternal(actualByline.textContent);
		Z.debug("Extracting author(s) from byline: " + byline);
		var li = actualByline.getElementsByTagName('li');
		if (li.length) {
			for (var i=0; i<li.length; i++) {
				var author = ZU.trimInternal(li[i].textContent);
				newItem.creators.push(ZU.cleanAuthor(fixCase(author), 'author', author.indexOf(',') != -1));
			}
		} else {
			byline = byline.split(/\bby[:\s]+/i);
			byline = byline[byline.length-1].replace(/\s*[[(].+?[)\]]\s*/g, '');
			var authors = byline.split(/\s*(?:(?:,\s*)?and|,|&)\s*/i);
			if(authors.length == 2 && authors[0].split(' ').length == 1) {
				//this was probably last, first
				newItem.creators.push(ZU.cleanAuthor(fixCase(byline), 'author', true));
			} else {
				for(var i=0, n=authors.length; i<n; i++) {
					if(!authors[i].length || authors[i].indexOf('@') !== -1) {
						//skip some odd splits and twitter handles
						continue;
					}

					if(authors[i].split(/\s/).length == 1) {
						//probably corporate author
						newItem.creators.push({
							lastName: authors[i],
							creatorType: 'author',
							fieldMode: 1
						});
					} else {
						newItem.creators.push(
							ZU.cleanAuthor(fixCase(authors[i]), 'author'));
					}
				}
			}
		}
	} else {
		Z.debug("No reliable byline found.");
	}
}

function finalDataCleanup(doc, newItem) {
	/**If we already have tags - run through them one by one,
	 * split where necessary and concat them.
	 * This will deal with multiple tags, some of them comma delimited,
	 * some semicolon, some individual
	 */
	if (typeof newItem.tags == 'string') {
		newItem.tags = [ newItem.tags ];
	}
	if (newItem.tags && newItem.tags.length && Zotero.parentTranslator) {
		if (exports.splitTags) {
			var tags = [];
			for (var i in newItem.tags) {
				newItem.tags[i] = newItem.tags[i].trim();
				if (newItem.tags[i].indexOf(';') == -1) {
					//split by comma, since there are no semicolons
					tags = tags.concat( newItem.tags[i].split(/\s*,\s*/) );
				} else {
					tags = tags.concat( newItem.tags[i].split(/\s*;\s*/) );
				}
			}
			for (var i=0; i<tags.length; i++) {
				if (tags[i] === "") tags.splice(i, 1);
			}
			newItem.tags = tags;
		}
	} else {
		// Unless called from another translator, don't include automatic tags,
		// because most of the time they are not right
		newItem.tags = [];
	}

	//Cleanup DOI
	if (newItem.DOI){
		newItem.DOI =newItem.DOI.replace(/^doi:\s*/, "");
	}

	// Add DOI to non-supported item types
	if (newItem.DOI && !ZU.fieldIsValidForType("DOI", newItem.itemType)) {
		if (newItem.extra){
			newItem.extra += "\nDOI: " + newItem.DOI;
		}
		else {
			newItem.extra = "DOI: " + newItem.DOI;
		}
	}




	//remove itemID - comes from RDF translator, doesn't make any sense for online data
	newItem.itemID = "";

	//worst case, if this is not called from another translator, use URL for title
	if(!newItem.title && !Zotero.parentTranslator) newItem.title = newItem.url;
}

var exports = {
	"doWeb": doWeb,
	"detectWeb": detectWeb,
	"addCustomFields": addCustomFields,
	"itemType": false,
	//activate/deactivate splitting tags in final data cleanup when they contain commas or semicolons
	"splitTags": true,
	"fixSchemaURI": setPrefixRemap
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.ajol.info/index.php/thrb/article/view/63347",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Knowledge, treatment seeking and preventive practices in respect of malaria among patients with HIV at the Lagos University Teaching Hospital",
				"creators": [
					{
						"firstName": "Akinwumi A.",
						"lastName": "Akinyede",
						"creatorType": "author"
					},
					{
						"firstName": "Alade",
						"lastName": "Akintonwa",
						"creatorType": "author"
					},
					{
						"firstName": "Charles",
						"lastName": "Okany",
						"creatorType": "author"
					},
					{
						"firstName": "Olufunsho",
						"lastName": "Awodele",
						"creatorType": "author"
					},
					{
						"firstName": "Duro C.",
						"lastName": "Dolapo",
						"creatorType": "author"
					},
					{
						"firstName": "Adebimpe",
						"lastName": "Adeyinka",
						"creatorType": "author"
					},
					{
						"firstName": "Ademola",
						"lastName": "Yusuf",
						"creatorType": "author"
					}
				],
				"date": "2011-01-01",
				"DOI": "10.4314/thrb.v13i4.63347",
				"ISSN": "1821-9241",
				"abstractNote": "The synergistic interaction between Human Immunodeficiency virus (HIV) disease and Malaria makes it mandatory for patients with HIV to respond appropriately in preventing and treating malaria. Such response will help to control the two diseases. This study assessed the knowledge of 495 patients attending the HIV clinic, in Lagos University Teaching Hospital, Nigeria.&nbsp; Their treatment seeking, preventive practices with regards to malaria, as well as the impact of socio &ndash; demographic / socio - economic status were assessed. Out of these patients, 245 (49.5 %) used insecticide treated bed nets; this practice was not influenced by socio &ndash; demographic or socio &ndash; economic factors.&nbsp; However, knowledge of the cause, knowledge of prevention of malaria, appropriate use of antimalarial drugs and seeking treatment from the right source increased with increasing level of education (p &lt; 0.05). A greater proportion of the patients, 321 (64.9 %) utilized hospitals, pharmacy outlets or health centres when they perceived an attack of malaria. Educational intervention may result in these patients seeking treatment from the right place when an attack of malaria fever is perceived.",
				"issue": "4",
				"language": "en",
				"libraryCatalog": "www.ajol.info",
				"publicationTitle": "Tanzania Journal of Health Research",
				"rights": "Copyright for articles published in this journal is retained by the journal.",
				"url": "https://www.ajol.info/index.php/thrb/article/view/63347",
				"volume": "13",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
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
		"url": "https://scholarworks.umass.edu/climate_nuclearpower/2011/nov19/34/",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Session F: Contributed Oral Papers – F2: Energy, Climate, Nuclear Medicine: Reducing Energy Consumption and CO2 One Street Lamp at a Time",
				"creators": [
					{
						"firstName": "Peter",
						"lastName": "Somssich",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"abstractNote": "Why wait for federal action on incentives to reduce energy use and address Greenhouse Gas (GHG) reductions (e.g. CO2), when we can take personal actions right now in our private lives and in our communities? One such initiative by private citizens working with Portsmouth NH officials resulted in the installation of energy reducing lighting products on Court St. and the benefits to taxpayers are still coming after over 4 years of operation. This citizen initiative to save money and reduce CO2 emissions, while only one small effort, could easily be duplicated in many towns and cities. Replacing old lamps in just one street fixture with a more energy efficient (Non-LED) lamp has resulted after 4 years of operation ($\\sim $15,000 hr. life of product) in real electrical energy savings of $>$ {\\$}43. and CO2 emission reduction of $>$ 465 lbs. The return on investment (ROI) was less than 2 years. This is much better than any financial investment available today and far safer. Our street only had 30 such lamps installed; however, the rest of Portsmouth (population 22,000) has at least another 150 street lamp fixtures that are candidates for such an upgrade. The talk will also address other energy reduction measures that green the planet and also put more green in the pockets of citizens and municipalities.",
				"conferenceName": "Climate Change and the Future of Nuclear Power",
				"language": "en",
				"libraryCatalog": "scholarworks.umass.edu",
				"shortTitle": "Session F",
				"url": "https://scholarworks.umass.edu/climate_nuclearpower/2011/nov19/34",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "https://scholarworks.umass.edu/lov/vol2/iss1/2/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Wabanaki Resistance and Healing: An Exploration of the Contemporary Role of an Eighteenth Century Bounty Proclamation in an Indigenous Decolonization Process",
				"creators": [
					{
						"firstName": "Bonnie D.",
						"lastName": "Newsom",
						"creatorType": "author"
					},
					{
						"firstName": "Jamie",
						"lastName": "Bissonette-Lewey",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"DOI": "10.7275/R5KW5CXB",
				"ISSN": "1947-508X",
				"abstractNote": "The purpose of this paper is to examine the contemporary role of an eighteenth century bounty proclamation issued on the Penobscot Indians of Maine. We focus specifically on how the changing cultural context of the 1755 Spencer Phips Bounty Proclamation has transformed the document from serving as a tool for sanctioned violence to a tool of decolonization for the Indigenous peoples of Maine. We explore examples of the ways indigenous and non-indigenous people use the Phips Proclamation to illustrate past violence directed against Indigenous peoples. This exploration is enhanced with an analysis of the re-introduction of the Phips Proclamation using concepts of decolonization theory.",
				"issue": "1",
				"language": "en",
				"libraryCatalog": "scholarworks.umass.edu",
				"pages": "2",
				"publicationTitle": "Landscapes of Violence",
				"shortTitle": "Wabanaki Resistance and Healing",
				"url": "https://scholarworks.umass.edu/lov/vol2/iss1/2",
				"volume": "2",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
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
		"url": "https://scholarworks.umass.edu/open_access_dissertations/508/",
		"items": [
			{
				"itemType": "thesis",
				"title": "Decision-Theoretic Meta-reasoning in Partially Observable and Decentralized Settings",
				"creators": [
					{
						"firstName": "Alan Scott",
						"lastName": "Carlin",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"abstractNote": "This thesis examines decentralized meta-reasoning. For a single agent or multiple agents, it may not be enough for agents to compute correct decisions if they do not do so in a timely or resource efficient fashion. The utility of agent decisions typically increases with decision quality, but decreases with computation time. The reasoning about one's computation process is referred to as meta-reasoning. Aspects of meta-reasoning considered in this thesis include the reasoning about how to allocate computational resources, including when to stop one type of computation and begin another, and when to stop all computation and report an answer. Given a computational model, this translates into computing how to schedule the basic computations that solve a problem. This thesis constructs meta-reasoning strategies for the purposes of monitoring and control in multi-agent settings, specifically settings that can be modeled by the Decentralized Partially Observable Markov Decision Process (Dec-POMDP). It uses decision theory to optimize computation for efficiency in time and space in communicative and non-communicative decentralized settings. Whereas base-level reasoning describes the optimization of actual agent behaviors, the meta-reasoning strategies produced by this thesis dynamically optimize the computational resources which lead to the selection of base-level behaviors.",
				"extra": "DOI: https://doi.org/10.7275/n8e9-xy93",
				"language": "en",
				"libraryCatalog": "scholarworks.umass.edu",
				"university": "University of Massachusetts Amherst",
				"url": "https://scholarworks.umass.edu/open_access_dissertations/508",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
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
		"url": "https://scielosp.org/scielo.php?script=sci_abstract&pid=S0034-89102007000900015&lng=en&nrm=iso&tlng=en",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Impressões sobre o teste rápido para o HIV entre usuários de drogas injetáveis no Brasil",
				"creators": [
					{
						"firstName": "P. R.",
						"lastName": "Telles-Dias",
						"creatorType": "author"
					},
					{
						"firstName": "S.",
						"lastName": "Westman",
						"creatorType": "author"
					},
					{
						"firstName": "A. E.",
						"lastName": "Fernandez",
						"creatorType": "author"
					},
					{
						"firstName": "M.",
						"lastName": "Sanchez",
						"creatorType": "author"
					}
				],
				"date": "2007-12",
				"DOI": "10.1590/S0034-89102007000900015",
				"ISSN": "0034-8910, 0034-8910, 1518-8787",
				"abstractNote": "OBJETIVO: Descrever as impressões, experiências, conhecimentos, crenças e a receptividade de usuários de drogas injetáveis para participar das estratégias de testagem rápida para HIV. MÉTODOS: Estudo qualitativo exploratório foi conduzido entre usuários de drogas injetáveis, de dezembro de 2003 a fevereiro de 2004, em cinco cidades brasileiras, localizadas em quatro regiões do País. Um roteiro de entrevista semi-estruturado contendo questões fechadas e abertas foi usado para avaliar percepções desses usuários sobre procedimentos e formas alternativas de acesso e testagem. Foram realizadas 106 entrevistas, aproximadamente 26 por região. RESULTADOS: Características da população estudada, opiniões sobre o teste rápido e preferências por usar amostras de sangue ou saliva foram apresentadas junto com as vantagens e desvantagens associadas a cada opção. Os resultados mostraram a viabilidade do uso de testes rápidos entre usuários de drogas injetáveis e o interesse deles quanto à utilização destes métodos, especialmente se puderem ser equacionadas questões relacionadas à confidencialidade e confiabilidade dos testes. CONCLUSÕES: Os resultados indicam que os testes rápidos para HIV seriam bem recebidos por essa população. Esses testes podem ser considerados uma ferramenta valiosa, ao permitir que mais usuários de drogas injetáveis conheçam sua sorologia para o HIV e possam ser referidos para tratamento, como subsidiar a melhoria das estratégias de testagem entre usuários de drogas injetáveis.",
				"journalAbbreviation": "Rev. Saúde Pública",
				"language": "pt",
				"libraryCatalog": "scielosp.org",
				"pages": "94-100",
				"publicationTitle": "Revista de Saúde Pública",
				"url": "https://scielosp.org/scielo.php?script=sci_abstract&pid=S0034-89102007000900015&lng=en&nrm=iso&tlng=en",
				"volume": "41",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
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
		"url": "https://www.hindawi.com/journals/mpe/2013/868174/abs/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Robust Filtering for Networked Stochastic Systems Subject to Sensor Nonlinearity",
				"creators": [
					{
						"firstName": "Guoqiang",
						"lastName": "Wu",
						"creatorType": "author"
					},
					{
						"firstName": "Jianwei",
						"lastName": "Zhang",
						"creatorType": "author"
					},
					{
						"firstName": "Yuguang",
						"lastName": "Bai",
						"creatorType": "author"
					}
				],
				"date": "2013/02/20",
				"DOI": "10.1155/2013/868174",
				"ISSN": "1024-123X",
				"abstractNote": "The problem of network-based robust filtering for stochastic systems with sensor nonlinearity is investigated in this paper. In the network environment, the effects of the sensor saturation, output quantization, and network-induced delay are taken into simultaneous consideration, and the output measurements received in the filter side are incomplete. The random delays are modeled as a linear function of the stochastic variable described by a Bernoulli random binary distribution. The derived criteria for performance analysis of the filtering-error system and filter design are proposed which can be solved by using convex optimization method. Numerical examples show the effectiveness of the design method.",
				"language": "en",
				"libraryCatalog": "www.hindawi.com",
				"publicationTitle": "Mathematical Problems in Engineering",
				"url": "https://www.hindawi.com/journals/mpe/2013/868174/abs/",
				"volume": "2013",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
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
		"url": "http://volokh.com/2013/12/22/northwestern-cant-quit-asa-boycott-member/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Northwestern Can't Quit ASA Over Boycott Because it is Not a Member",
				"creators": [
					{
						"firstName": "Eugene",
						"lastName": "Kontorovich",
						"creatorType": "author"
					}
				],
				"date": "2013-12-22T11:58:34+00:00",
				"abstractNote": "Northwestern University recently condemned the American Studies Association boycott of Israel. Unlike some other schools that quit their institutional membership in the ASA over the boycott, Northwestern has not. Many of my Northwestern colleagues were about to start urging a similar withdrawal.\nThen we learned from our administration that despite being listed as in institutional member by the ASA,  the university has, after checking, concluded it has no such membership, does not plan to get one, and is unclear why the ASA would list us as institutional member.\nApparently, at least several other schools listed by the ASA as institutional members say they have no such relationship.\nThe ASA has been spending a great deal of energy on political activism far from its mission, but apparently cannot keep its books in order. The association has yet to explain how it has come to list as institutional members so many schools that know nothing about such a membership. The ASA’s membership rolls may get much shorter in the coming weeks even without any quitting.\nHow this confusion came to arise is unclear. ASA membership, like that of many academic organizations, comes with a subscription to their journal. Some have suggested that perhaps  the ASA also counts as members any institution whose library happened to subscribe to the journal, ie tacking on membership to a subscription, rather than vice versa. This would not be fair on their part. A library may subscribe to all sorts of journals for academic research purposes (ie Pravda), without endorsing the organization that publishes it. That is the difference between subscription and membership.\nI eagerly await the ASA’s explanation of the situation. [...]",
				"blogTitle": "The Volokh Conspiracy",
				"language": "en-US",
				"url": "http://volokh.com/2013/12/22/northwestern-cant-quit-asa-boycott-member/",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "https://hbr.org/2015/08/how-to-do-walking-meetings-right",
		"items": [
			{
				"itemType": "webpage",
				"title": "How to Do Walking Meetings Right",
				"creators": [
					{
						"firstName": "Russell",
						"lastName": "Clayton",
						"creatorType": "author"
					},
					{
						"firstName": "Christopher",
						"lastName": "Thomas",
						"creatorType": "author"
					},
					{
						"firstName": "Jack",
						"lastName": "Smothers",
						"creatorType": "author"
					}
				],
				"date": "2015-08-05T12:05:17Z",
				"abstractNote": "New research finds creativity benefits.",
				"url": "https://hbr.org/2015/08/how-to-do-walking-meetings-right",
				"websiteTitle": "Harvard Business Review",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "https://olh.openlibhums.org/article/10.16995/olh.46/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Opening the Open Library of Humanities",
				"creators": [
					{
						"firstName": "Martin",
						"lastName": "Eve",
						"creatorType": "author"
					},
					{
						"firstName": "Caroline",
						"lastName": "Edwards",
						"creatorType": "author"
					}
				],
				"date": "2015-09-28",
				"DOI": "10.16995/olh.46",
				"ISSN": "2056-6700",
				"abstractNote": "Article: Opening the Open Library of Humanities",
				"issue": "1",
				"language": "en",
				"libraryCatalog": "olh.openlibhums.org",
				"pages": "e1",
				"publicationTitle": "Open Library of Humanities",
				"rights": "Authors who publish with this journal agree to the following terms:    Authors retain copyright and grant the journal right of first publication with the work simultaneously licensed under a  Creative Commons Attribution License  that allows others to share the work with an acknowledgement of the work's authorship and initial publication in this journal.  Authors are able to enter into separate, additional contractual arrangements for the non-exclusive distribution of the journal's published version of the work (e.g., post it to an institutional repository or publish it in a book), with an acknowledgement of its initial publication in this journal.  Authors are permitted and encouraged to post their work online (e.g., in institutional repositories or on their website) prior to and during the submission process, as it can lead to productive exchanges, as well as earlier and greater citation of published work (See  The Effect of Open Access ).  All third-party images reproduced on this journal are shared under Educational Fair Use. For more information on  Educational Fair Use , please see  this useful checklist prepared by Columbia University Libraries .   All copyright  of third-party content posted here for research purposes belongs to its original owners.  Unless otherwise stated all references to characters and comic art presented on this journal are ©, ® or ™ of their respective owners. No challenge to any owner’s rights is intended or should be inferred.",
				"url": "http://olh.openlibhums.org/article/10.16995/olh.46/",
				"volume": "1",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
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
		"url": "https://www.vox.com/2016/1/7/10726296/wheres-rey-star-wars-monopoly",
		"items": [
			{
				"itemType": "webpage",
				"title": "#WheresRey and the big Star Wars toy controversy, explained",
				"creators": [
					{
						"firstName": "Caroline",
						"lastName": "Framke",
						"creatorType": "author"
					}
				],
				"date": "2016-01-07T08:20:02-05:00",
				"abstractNote": "Excluding female characters in merchandise is an ongoing pattern.",
				"url": "https://www.vox.com/2016/1/7/10726296/wheres-rey-star-wars-monopoly",
				"websiteTitle": "Vox",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://www.diva-portal.org/smash/record.jsf?pid=diva2%3A766397&dswid=510",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Mobility modeling for transport efficiency : Analysis of travel characteristics based on mobile phone data",
				"creators": [
					{
						"firstName": "Vangelis",
						"lastName": "Angelakis",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Gundlegård",
						"creatorType": "author"
					},
					{
						"firstName": "Clas",
						"lastName": "Rydergren",
						"creatorType": "author"
					},
					{
						"firstName": "Botond",
						"lastName": "Rajna",
						"creatorType": "author"
					},
					{
						"firstName": "Katerina",
						"lastName": "Vrotsou",
						"creatorType": "author"
					},
					{
						"firstName": "Richard",
						"lastName": "Carlsson",
						"creatorType": "author"
					},
					{
						"firstName": "Julien",
						"lastName": "Forgeat",
						"creatorType": "author"
					},
					{
						"firstName": "Tracy H.",
						"lastName": "Hu",
						"creatorType": "author"
					},
					{
						"firstName": "Evan L.",
						"lastName": "Liu",
						"creatorType": "author"
					},
					{
						"firstName": "Simon",
						"lastName": "Moritz",
						"creatorType": "author"
					},
					{
						"firstName": "Sky",
						"lastName": "Zhao",
						"creatorType": "author"
					},
					{
						"firstName": "Yaotian",
						"lastName": "Zheng",
						"creatorType": "author"
					}
				],
				"date": "2013",
				"abstractNote": "DiVA portal is a finding tool for research publications and student theses written at the following 47 universities and research institutions.",
				"conferenceName": "Netmob 2013 - Third International Conference on the Analysis of Mobile Phone Datasets, May 1-3, 2013, MIT, Cambridge, MA, USA",
				"language": "eng",
				"libraryCatalog": "www.diva-portal.org",
				"shortTitle": "Mobility modeling for transport efficiency",
				"url": "http://urn.kb.se/resolve?urn=urn:nbn:se:liu:diva-112443",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
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
		"url": "https://link.springer.com/article/10.1023/A:1021669308832",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Why Bohm's Quantum Theory?",
				"creators": [
					{
						"firstName": "H. D.",
						"lastName": "Zeh",
						"creatorType": "author"
					}
				],
				"date": "1999/04/01",
				"DOI": "10.1023/A:1021669308832",
				"ISSN": "0894-9875, 1572-9524",
				"abstractNote": "This is a brief reply to S. Goldstein's article “Quantum theory without observers” in Physics Today.It is pointed out that Bohm's pilot wave theory is successful only because it keeps Schrödinger's...",
				"issue": "2",
				"journalAbbreviation": "Found Phys Lett",
				"language": "en",
				"libraryCatalog": "link.springer.com",
				"pages": "197-200",
				"publicationTitle": "Foundations of Physics Letters",
				"url": "https://link.springer.com/article/10.1023/A:1021669308832",
				"volume": "12",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
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
		"url": "https://muse.jhu.edu/article/234097",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Serfs on the Move: Peasant Seasonal Migration in Pre-Reform Russia, 1800–61",
				"creators": [
					{
						"firstName": "Boris B.",
						"lastName": "Gorshkov",
						"creatorType": "author"
					}
				],
				"date": "2000",
				"DOI": "10.1353/kri.2008.0061",
				"ISSN": "1538-5000",
				"issue": "4",
				"language": "en",
				"libraryCatalog": "muse.jhu.edu",
				"pages": "627-656",
				"publicationTitle": "Kritika: Explorations in Russian and Eurasian History",
				"shortTitle": "Serfs on the Move",
				"url": "https://muse.jhu.edu/article/234097",
				"volume": "1",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
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
