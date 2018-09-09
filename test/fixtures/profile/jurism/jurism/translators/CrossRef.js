{
	"translatorID": "11645bd1-0420-45c1-badb-53fb41eeb753",
	"translatorType": 8,
	"label": "Crossref",
	"creator": "Simon Kornblith",
	"target": "^https?://partneraccess\\.oclc\\.org/",
	"minVersion": "2.1.9",
	"maxVersion": null,
	"priority": 90,
	"inRepository": true,
	"browserSupport": "gcsv",
	"lastUpdated": "2018-04-19 05:16:03"
}

/* CrossRef uses unixref; documentation at http://www.crossref.org/schema/documentation/unixref1.0/unixref.html */
var ns;

/**********************
 * Utilitiy Functions *
 **********************/

function innerXML(n) {
	var escapedXMLcharacters = {
		'&amp;': '&',
		'&quot;': '"',
		'&lt;': '<',
		'&gt;': '>'
	};
	var xmlSerializer = new XMLSerializer();
	return xmlSerializer.serializeToString(n) //outer XML
		.replace(/^[^>]*>|<[^<]*$/g, '')
		.replace(/(&quot;|&lt;|&gt;|&amp;)/g,
			function(str, item) {
				return escapedXMLcharacters[item];
			}
		);
}

var markupRE = /<(\/?)(\w+)[^<>]*>/gi;
var supportedMarkup = ['i', 'b', 'sub', 'sup', 'span', 'sc'];
var transformMarkup = {
	'scp': {
		open: '<span style="font-variant:small-caps;">',
		close: '</span>'
	}
};
function removeUnsupportedMarkup(text) {
	return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // Remove CDATA markup
		.replace(markupRE, function(m, close, name) {
			if(supportedMarkup.indexOf(name.toLowerCase()) != -1) {
				return m;
			}

			var newMarkup = transformMarkup[name.toLowerCase()];
			if(newMarkup) {
				return close ? newMarkup.close : newMarkup.open;
			}

			return '';
		});
}

function detectSearch(item) {
	// query: should we make this more forgiving?
	if(item.itemType === "journalArticle" || item.DOI) {
		return true;
	}
	return false;
}

function fixAuthorCapitalization(string) {
	if(typeof string === "string" && string.toUpperCase() === string) {
		string = string.toLowerCase().replace(/\b[a-z]/g, function(m) { return m[0].toUpperCase() });
	}
	return string;
}

function parseCreators(node, item, typeOverrideMap) {
	var contributors = ZU.xpath(node, 'c:contributors/c:organization | c:contributors/c:person_name', ns);
	for(var i in contributors) {
		var creatorXML = contributors[i];
		var creator = {};

		var role = creatorXML.getAttribute("contributor_role");
		if(typeOverrideMap && typeOverrideMap[role] !== undefined) {
			creator.creatorType = typeOverrideMap[role];
		} else if(role === "author" || role === "editor" || role === "translator") {
			creator.creatorType = role;
		} else {
			creator.creatorType = "contributor";
		}

		if(!creator.creatorType) continue;

		if(creatorXML.nodeName === "organization") {
			creator.fieldMode = 1;
			creator.lastName = creatorXML.textContent;
		} else if(creatorXML.nodeName === "person_name") {
			creator.firstName = fixAuthorCapitalization(ZU.xpathText(creatorXML, 'c:given_name', ns));
			creator.lastName = fixAuthorCapitalization(ZU.xpathText(creatorXML, 'c:surname', ns));
			if (!creator.firstName) creator.fieldMode = 1;
		}
		item.creators.push(creator);
	}
}

function processCrossRef(xmlOutput) {
	// XPath does not give us the ability to use the same XPaths regardless of whether or not
	// there is a namespace, so we add an element to make sure that there will always be a
	// namespace.
	xmlOutput = '<xml xmlns="http://www.example.com/">'+xmlOutput.replace(/<\?xml[^>]*\?>/, "")+"</xml>";

	// parse XML with E4X
	try {
		var parser = new DOMParser();
		var doc = parser.parseFromString(xmlOutput, "text/xml");
	} catch(e) {
		Zotero.debug(e);
		return false;
	}

	// determine appropriate namespace
	ns = {"c":"http://www.crossref.org/xschema/1.1", "x":"http://www.example.com/"};
	var doiRecords = ZU.xpath(doc, '/x:xml/c:doi_records/c:doi_record', ns);
	if(!doiRecords.length) {
		ns.c = "http://www.crossref.org/xschema/1.0";
		doiRecords = ZU.xpath(doc, '/x:xml/c:doi_records/c:doi_record', ns);
		if(!doiRecords.length) {
			// this means that the original document was un-namespaced
			ns.c = "http://www.example.com/";
			doiRecords = ZU.xpath(doc, '/c:xml/c:doi_records/c:doi_record', ns);
			if(!doiRecords.length) {
				throw new Error("No records found");
				return;
			}
		}
	}

	var doiRecord = doiRecords[0];

	// ensure this isn't an error
	var errorString = ZU.xpathText(doiRecord, 'c:crossref/c:error', ns);
	if(errorString !== null) {
		throw errorString;
		return false;
	}

	var itemXML, item, refXML, metadataXML, seriesXML;
	if((itemXML = ZU.xpath(doiRecord, 'c:crossref/c:journal', ns)).length) {
		item = new Zotero.Item("journalArticle");
		refXML = ZU.xpath(itemXML, 'c:journal_article', ns);
		metadataXML = ZU.xpath(itemXML, 'c:journal_metadata', ns);

		item.publicationTitle = ZU.xpathText(metadataXML, 'c:full_title[1]', ns);
		item.journalAbbreviation = ZU.xpathText(refXML, 'c:abbrev_title[1]', ns);
		item.volume = ZU.xpathText(itemXML, 'c:journal_issue/c:journal_volume/c:volume', ns);
		item.issue = ZU.xpathText(itemXML, 'c:journal_issue/c:journal_volume/c:issue', ns);
		// Sometimes the <issue> tag is not nested inside the volume tag; see 10.1007/BF00938486
		if (!item.issue)
			item.issue = ZU.xpathText(itemXML, 'c:journal_issue/c:issue', ns);
   	} else if((itemXML = ZU.xpath(doiRecord, 'c:crossref/c:report-paper', ns)).length) {
		// Report Paper
		// Example: doi: 10.4271/2010-01-0907
		// http://www.crossref.org/openurl/?pid=zter:zter321&url_ver=Z39.88-2004&rft_id=info:doi/10.4271/2010-01-0907&format=unixref&redirect=false
		item = new Zotero.Item("report");
		refXML = ZU.xpath(itemXML, 'c:report-paper_metadata', ns);
		if (refXML.length===0) {
			//Example doi: 10.1787/5jzb6vwk338x-en
			//http://www.crossref.org/openurl/?pid=zter:zter321&url_ver=Z39.88-2004&&rft_id=info:doi/10.1787/5jzb6vwk338x-en&noredirect=true&format=unixref
			refXML = ZU.xpath(itemXML, 'c:report-paper_series_metadata', ns);
			seriesXML = ZU.xpath(refXML, 'c:series_metadata', ns);
		}
		metadataXML = refXML;

		item.reportNumber = ZU.xpathText(refXML, 'c:publisher_item/c:item_number', ns);
		if (!item.reportNumber) item.reportNumber = ZU.xpathText(refXML, 'c:volume', ns);
		item.institution = ZU.xpathText(refXML, 'c:publisher/c:publisher_name', ns);
		item.place = ZU.xpathText(refXML, 'c:publisher/c:publisher_place', ns);
	} else if((itemXML = ZU.xpath(doiRecord, 'c:crossref/c:book', ns)).length) {
		// Book chapter
		// Example: doi: 10.1017/CCOL0521858429.016
		// http://www.crossref.org/openurl/?pid=zter:zter321&url_ver=Z39.88-2004&rft_id=info:doi/10.1017/CCOL0521858429.016&format=unixref&redirect=false
		// Reference book entry
		// Example: doi: 10.1002/14651858.CD002966.pub3
		// http://www.crossref.org/openurl/?pid=zter:zter321&url_ver=Z39.88-2004&rft_id=info:doi/10.1002/14651858.CD002966.pub3&format=unixref&redirect=false
		// Entire edite book. This should _not_ be imported as bookSection
		// Example: doi: 10.4135/9781446200957
		// http://www.crossref.org/openurl/?pid=zter:zter321&url_ver=Z39.88-2004&&rft_id=info:doi/10.4135/9781446200957&noredirect=true&format=unixref

		var bookType = itemXML[0].hasAttribute("book_type") ? itemXML[0].getAttribute("book_type") : null;
		var componentType = ZU.xpathText(itemXML[0], 'c:content_item/@component_type', ns);
		//is this an entry in a reference book?
		var isReference = ["reference", "other"].indexOf(bookType) !== -1
				&& ["chapter", "reference_entry"].indexOf(componentType) !==-1;

		//for items that are entry in reference books OR edited book types that have some type of a chapter entry.
		if((bookType === "edited_book"  && componentType) || isReference) {
			item = new Zotero.Item("bookSection");
			refXML = ZU.xpath(itemXML, 'c:content_item', ns);

			if(isReference) {
				metadataXML = ZU.xpath(itemXML, 'c:book_metadata', ns);
				if(!metadataXML.length) metadataXML = ZU.xpath(itemXML, 'c:book_series_metadata', ns);

				item.bookTitle = ZU.xpathText(metadataXML, 'c:titles[1]/c:title[1]', ns);
				item.seriesTitle = ZU.xpathText(metadataXML, 'c:series_metadata/c:titles[1]/c:title[1]', ns);

				var metadataSeriesXML = ZU.xpath(metadataXML, 'c:series_metadata', ns);
				if (metadataSeriesXML.length) parseCreators(metadataSeriesXML, item, {"editor":"seriesEditor"});
			} else {
				metadataXML = ZU.xpath(itemXML, 'c:book_series_metadata', ns);
				if(!metadataXML.length) metadataXML = ZU.xpath(itemXML, 'c:book_metadata', ns);
				item.bookTitle = ZU.xpathText(metadataXML, 'c:series_metadata/c:titles[1]/c:title[1]', ns);
				if(!item.bookTitle) item.bookTitle = ZU.xpathText(metadataXML, 'c:titles[1]/c:title[1]', ns);
			}

			// Handle book authors
			parseCreators(metadataXML, item, {"author":"bookAuthor"});
		// Book
		} else {
			item = new Zotero.Item("book");
			refXML = ZU.xpath(itemXML, 'c:book_metadata', ns);
			//Sometimes book data is in book_series_metadata
			// doi: 10.1007/978-1-4419-9164-5
			//http://www.crossref.org/openurl/?pid=zter:zter321&url_ver=Z39.88-2004&rft_id=info:doi/10.1007/978-1-4419-9164-5&format=unixref&redirect=false
			if (!refXML.length) refXML = ZU.xpath(itemXML, 'c:book_series_metadata', ns);
			metadataXML = refXML;
			seriesXML = ZU.xpath(refXML, 'c:series_metadata', ns);
		}

		item.place = ZU.xpathText(metadataXML, 'c:publisher/c:publisher_place', ns);
	} else if((itemXML = ZU.xpath(doiRecord, 'c:crossref/c:standard', ns)).length) {
		item = new Zotero.Item("report");
		refXML = ZU.xpath(itemXML, 'c:standard_metadata', ns);
		metadataXML = ZU.xpath(itemXML, 'c:standard_metadata', ns);

	} else if((itemXML = ZU.xpath(doiRecord, 'c:crossref/c:conference', ns)).length) {
		item = new Zotero.Item("conferencePaper");
		refXML = ZU.xpath(itemXML, 'c:conference_paper', ns);
		metadataXML = ZU.xpath(itemXML, 'c:proceedings_metadata', ns);
		seriesXML = ZU.xpath(metadataXML, 'c:proceedings_metadata', ns);

		item.publicationTitle = ZU.xpathText(metadataXML, 'c:publisher/c:proceedings_title', ns);
		item.place = ZU.xpathText(metadataXML, 'c:event_metadata/c:conference_location', ns);
		item.conferenceName = ZU.xpathText(metadataXML, 'c:event_metadata/c:conference_name', ns);
	}

	else if((itemXML = ZU.xpath(doiRecord, 'c:crossref/c:database', ns)).length) {
		item = new Zotero.Item("report"); //should be dataset
		refXML = ZU.xpath(itemXML, 'c:dataset', ns);
		item.extra = "type: dataset";
		metadataXML = ZU.xpath(itemXML, 'c:database_metadata', ns);
		if (!ZU.xpathText(refXML, 'c:contributors', ns)) {
			parseCreators(metadataXML, item);
		}
		if (!ZU.xpathText(metadataXML, 'c:publisher', ns)) {
			item.institution = ZU.xpathText(metadataXML, 'c:institution/c:institution_name', ns);
		}
	}


	item.abstractNote = ZU.xpathText(refXML, 'c:description', ns);
	item.language = ZU.xpathText(metadataXML, './@language', ns);
	item.ISBN = ZU.xpathText(metadataXML, 'c:isbn', ns);
	item.ISSN = ZU.xpathText(metadataXML, 'c:issn', ns);
	item.publisher = ZU.xpathText(metadataXML, 'c:publisher/c:publisher_name', ns);

	item.edition = ZU.xpathText(metadataXML, 'c:edition_number', ns);
	if(!item.volume) item.volume = ZU.xpathText(metadataXML, 'c:volume', ns);

	parseCreators(refXML, item, (item.itemType == 'bookSection' ? {"editor": null} : "author") );

	if(seriesXML && seriesXML.length) {
		parseCreators(seriesXML, item, {"editor":"seriesEditor"});
		item.series = ZU.xpathText(seriesXML, 'c:titles[1]/c:title[1]', ns);
		item.seriesNumber = ZU.xpathText(seriesXML, 'c:series_number', ns);
		item.reportType = ZU.xpathText(seriesXML, 'c:titles[1]/c:title[1]', ns);
	}
	//prefer article to journal metadata and print to other dates
	var pubDateNode = ZU.xpath(refXML, 'c:publication_date[@media_type="print"]', ns);
	if(!pubDateNode.length) pubDateNode = ZU.xpath(refXML, 'c:publication_date', ns);
	if(!pubDateNode.length) pubDateNode = ZU.xpath(metadataXML, 'c:publication_date[@media_type="print"]', ns);
	if(!pubDateNode.length) pubDateNode = ZU.xpath(metadataXML, 'c:publication_date', ns);
	//dataset
	if(!pubDateNode.length) pubDateNode = ZU.xpath(refXML, 'c:database_date/c:publication_date', ns);
	if(!pubDateNode.length) pubDateNode = ZU.xpath(metaXML, 'c:database_date/c:publication_date', ns);

	if(pubDateNode.length) {
		var year = ZU.xpathText(pubDateNode[0], 'c:year', ns);
		var month = ZU.xpathText(pubDateNode[0], 'c:month', ns);
		var day = ZU.xpathText(pubDateNode[0], 'c:day', ns);

		if(year) {
			if(month) {
				if(day) {
					item.date = year+"-"+month+"-"+day;
				} else {
					item.date = month+"/"+year;
				}
			} else {
				item.date = year;
			}
		}
	}

	var pages = ZU.xpath(refXML, 'c:pages[1]', ns);
	if(pages.length) {
		item.pages = ZU.xpathText(pages, 'c:first_page[1]', ns);
		var lastPage = ZU.xpathText(pages, 'c:last_page[1]', ns);
		if(lastPage) item.pages += "-"+lastPage;
	}

	item.DOI = ZU.xpathText(refXML, 'c:doi_data/c:doi', ns);
	//add DOI to extra for unsupprted items
	if (item.DOI && !ZU.fieldIsValidForType("DOI", item.itemType)) {
		if (item.extra){
			item.extra += "\nDOI: " + item.DOI;
		}
		else {
			item.extra = "DOI: " + item.DOI;
		}
	}
	item.url = ZU.xpathText(refXML, 'c:doi_data/c:resource', ns);
	var title = ZU.xpath(refXML, 'c:titles[1]/c:title[1]', ns)[0];
	if (!title) {
		title = ZU.xpath(metadataXML, 'c:titles[1]/c:title[1]', ns)[0];
	}
	if(title) {
		item.title = ZU.trimInternal(
			removeUnsupportedMarkup(innerXML(title))
		);
		var subtitle = ZU.xpath(refXML, 'c:titles[1]/c:subtitle[1]', ns)[0];
		if(subtitle) {
			item.title += ': ' + ZU.trimInternal(
				removeUnsupportedMarkup(innerXML(subtitle))
			);
		}
	}
	//Zotero.debug(JSON.stringify(item, null, 4));

	//check if there are potential issues with character encoding and try to fix it
	//e.g. 10.1057/9780230391116.0016 (en dash in title is presented as <control><control>â)
	for(var field in item) {
		if(typeof item[field] != 'string') continue;
		//check for control characters that should never be in strings from CrossRef
		if(/[\u007F-\u009F]/.test(item[field])) {
			item[field] = decodeURIComponent(escape(item[field]));
		}
	}

	item.complete();
	return true;
}

function doSearch(item) {
	if(item.contextObject) {
		var co = item.contextObject;
		if(co.indexOf("url_ver=") == -1) {
			co = "url_ver=Z39.88-2004&"+co;
		}
	} else if(item.DOI) {
		var co = "url_ver=Z39.88-2004&&rft_id=info:doi/"+ZU.cleanDOI(item.DOI.toString());
	} else {
		var co = Zotero.Utilities.createContextObject(item);
	}

	ZU.doGet("http://www.crossref.org/openurl/?pid=zter:zter321&"+co+"&noredirect=true&format=unixref", function(responseText) {
		processCrossRef(responseText);
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "search",
		"input": {
			"DOI":"10.1017/CCOL0521858429.016"
		},
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"creatorType": "editor",
						"firstName": "John",
						"lastName": "Rodden"
					},
					{
						"creatorType": "author",
						"firstName": "Christopher",
						"lastName": "Hitchens"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"bookTitle": "The Cambridge Companion to George Orwell",
				"place": "Cambridge",
				"ISBN": "9781139001472",
				"publisher": "Cambridge University Press",
				"pages": "201-207",
				"date": "2007",
				"extra": "DOI: 10.1017/CCOL0521858429.016",
				"DOI": "10.1017/CCOL0521858429.016",
				"url": "http://universitypublishingonline.org/ref/id/companions/CBO9781139001472A019",
				"title": "Why Orwell still matters",
				"libraryCatalog": "CrossRef"
			}
		]
	},
	{
		"type": "search",
		"input": {
			"DOI":"10.1057/9780230391116.0016"
		},
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"creatorType": "editor",
						"firstName": "Claus-Christian W.",
						"lastName": "Szejnmann"
					},
					{
						"creatorType": "editor",
						"firstName": "Maiken",
						"lastName": "Umbach"
					},
					{
						"creatorType": "author",
						"firstName": "Oliver",
						"lastName": "Werner"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"bookTitle": "Heimat, Region, and Empire",
				"ISBN": "9780230391116",
				"publisher": "Palgrave Macmillan",
				"language": "en",
				"date": "2012-10-17",
				"extra": "DOI: 10.1057/9780230391116.0016",
				"DOI": "10.1057/9780230391116.0016",
				"url": "http://www.palgraveconnect.com/doifinder/10.1057/9780230391116.0016",
				"title": "Conceptions, Competences and Limits of German Regional Planning during the Four Year Plan, 1936–1940",
				"libraryCatalog": "CrossRef"
			}
		]
	},
	{
		"type": "search",
		"input": {
			"DOI":"10.2747/1539-7216.50.2.197"
		},
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"creatorType": "author",
						"firstName": "Kam Wing",
						"lastName": "Chan"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"date": "2009-3-1",
				"DOI": "10.2747/1539-7216.50.2.197",
				"url": "http://www.tandfonline.com/doi/abs/10.2747/1539-7216.50.2.197",
				"title": "The Chinese <i>Hukou</i> System at 50",
				"issue": "2",
				"ISSN": "1538-7216",
				"publicationTitle": "Eurasian Geography and Economics",
				"volume": "50",
				"pages": "197-221",
				"libraryCatalog": "CrossRef"
			}
		]
	}
]
/** END TEST CASES **/
