{
	"translatorID": "93514073-b541-4e02-9180-c36d2f3bb401",
	"translatorType": 1,
	"label": "Crossref Unixref XML",
	"creator": "Sebastian Karcher",
	"target": "xml",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"configOptions": {
		"dataMode": "xml/dom"
	},
	"lastUpdated": "2019-04-27 02:15:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2019 Sebastian Karcher

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


/* CrossRef uses unixref; documentation at https://data.crossref.org/reports/help/schema_doc/unixref1.1/unixref1.1.html */


/** ********************
 * Utilitiy Functions *
 **********************/

function innerXML(n) {
	var escapedXMLcharacters = {
		'&amp;': '&',
		'&quot;': '"',
		'&lt;': '<',
		'&gt;': '>'
	};
	return n.innerHTML // outer XML
		.replace(/\n/g, "")
		.replace(/(&quot;|&lt;|&gt;|&amp;)/g,
			function (str, item) {
				return escapedXMLcharacters[item];
			}
		);
}

var markupRE = /<(\/?)(\w+)[^<>]*>/gi;
var supportedMarkup = ['i', 'b', 'sub', 'sup', 'span', 'sc'];
var transformMarkup = {
	scp: {
		open: '<span style="font-variant:small-caps;">',
		close: '</span>'
	}
};
function removeUnsupportedMarkup(text) {
	return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // Remove CDATA markup
		.replace(markupRE, function (m, close, name) {
			if (supportedMarkup.includes(name.toLowerCase())) {
				return m;
			}

			var newMarkup = transformMarkup[name.toLowerCase()];
			if (newMarkup) {
				return close ? newMarkup.close : newMarkup.open;
			}

			return '';
		});
}


function fixAuthorCapitalization(string) {
	// Try to use capitalization function from Zotero Utilities,
	// because the current one doesn't support unicode names.
	// Can't fix this either because ZU.XRegExp.replace is
	// malfunctioning when calling from translators.
	if (ZU.capitalizeName) return ZU.capitalizeName(string);
	if (typeof string === "string" && string.toUpperCase() === string) {
		string = string.toLowerCase().replace(/\b[a-z]/g, function (m) {
			return m[0].toUpperCase();
		});
	}
	return string;
}

function parseCreators(node, item, typeOverrideMap) {
	var contributors = ZU.xpath(node, 'contributors/organization | contributors/person_name');
	if (!contributors.length) {
		contributors = ZU.xpath(node, 'organization | person_name');
	}
	for (var contributor of contributors) {
		var creatorXML = contributor;
		var creator = {};

		var role = creatorXML.getAttribute("contributor_role");
		if (typeOverrideMap && typeOverrideMap[role] !== undefined) {
			creator.creatorType = typeOverrideMap[role];
		}
		else if (role === "author" || role === "editor" || role === "translator") {
			creator.creatorType = role;
		}
		else {
			creator.creatorType = "contributor";
		}

		if (!creator.creatorType) continue;

		if (creatorXML.nodeName === "organization") {
			creator.fieldMode = 1;
			creator.lastName = creatorXML.textContent;
		}
		else if (creatorXML.nodeName === "person_name") {
			creator.firstName = fixAuthorCapitalization(ZU.xpathText(creatorXML, 'given_name'));
			creator.lastName = fixAuthorCapitalization(ZU.xpathText(creatorXML, 'surname'));
			if (!creator.firstName) creator.fieldMode = 1;
		}
		item.creators.push(creator);
	}
}

function parseDate(pubDateNode) {
	if (pubDateNode.length) {
		var year = ZU.xpathText(pubDateNode[0], 'year');
		var month = ZU.xpathText(pubDateNode[0], 'month');
		var day = ZU.xpathText(pubDateNode[0], 'day');
		
		if (year) {
			if (month) {
				if (day) {
					return year + "-" + month + "-" + day;
				}
				else {
					return month + "/" + year;
				}
			}
			else {
				return year;
			}
		}
		else return null;
	}
	else return null;
}


function detectImport() {
	var line;
	var i = 0;
	while ((line = Zotero.read()) !== false) {
		if (line !== "") {
			if (line.includes("<crossref>")) {
				return true;
			}
			else if (i++ > 7) {
				return false;
			}
		}
	}
	return false;
}


function doImport() {
	// XPath does not give us the ability to use the same XPaths regardless of whether or not
	// there is a namespace, so we add an element to make sure that there will always be a
	// namespace.

	var doc = Zotero.getXML();
	
	var doiRecord = ZU.xpath(doc, "//doi_records/doi_record");
	//	Z.debug(doiRecord.length)
	// ensure this isn't an error
	var errorString = ZU.xpathText(doiRecord, 'crossref/error');
	if (errorString !== null) {
		throw errorString;
	}

	var itemXML, item, refXML, metadataXML, seriesXML;
	if ((itemXML = ZU.xpath(doiRecord, 'crossref/journal')).length) {
		item = new Zotero.Item("journalArticle");
		refXML = ZU.xpath(itemXML, 'journal_article');
		metadataXML = ZU.xpath(itemXML, 'journal_metadata');

		item.publicationTitle = ZU.xpathText(metadataXML, 'full_title[1]');
		item.journalAbbreviation = ZU.xpathText(metadataXML, 'abbrev_title[1]');
		item.volume = ZU.xpathText(itemXML, 'journal_issue/journal_volume/volume');
		item.issue = ZU.xpathText(itemXML, 'journal_issue/journal_volume/issue');
		// Sometimes the <issue> tag is not nested inside the volume tag; see 10.1007/BF00938486
		if (!item.issue) item.issue = ZU.xpathText(itemXML, 'journal_issue/issue');
	}
	else if ((itemXML = ZU.xpath(doiRecord, 'crossref/report-paper')).length) {
		// Report Paper
		// Example: doi: 10.4271/2010-01-0907
		
		item = new Zotero.Item("report");
		refXML = ZU.xpath(itemXML, 'report-paper_metadata');
		if (refXML.length === 0) {
			// Example doi: 10.1787/5jzb6vwk338x-en
		
			refXML = ZU.xpath(itemXML, 'report-paper_series_metadata');
			seriesXML = ZU.xpath(refXML, 'series_metadata');
		}
		metadataXML = refXML;

		item.reportNumber = ZU.xpathText(refXML, 'publisher_item/item_number');
		if (!item.reportNumber) item.reportNumber = ZU.xpathText(refXML, 'volume');
		item.institution = ZU.xpathText(refXML, 'publisher/publisher_name');
		item.place = ZU.xpathText(refXML, 'publisher/publisher_place');
	}
	else if ((itemXML = ZU.xpath(doiRecord, 'crossref/book')).length) {
		// Book chapter
		// Example: doi: 10.1017/CCOL0521858429.016
		
		// Reference book entry
		// Example: doi: 10.1002/14651858.CD002966.pub3
		
		// Entire edite book. This should _not_ be imported as bookSection
		// Example: doi: 10.4135/9781446200957
		
		var bookType = itemXML[0].hasAttribute("book_type") ? itemXML[0].getAttribute("book_type") : null;
		var componentType = ZU.xpathText(itemXML[0], 'content_item/@component_type');
		// is this an entry in a reference book?
		var isReference = ["reference", "other"].includes(bookType)
				&& ["chapter", "reference_entry"].includes(componentType);

		// for items that are entry in reference books OR edited book types that have some type of a chapter entry.
		if ((bookType === "edited_book" && componentType) || isReference) {
			item = new Zotero.Item("bookSection");
			refXML = ZU.xpath(itemXML, 'content_item');

			if (isReference) {
				metadataXML = ZU.xpath(itemXML, 'book_metadata');
				if (!metadataXML.length) metadataXML = ZU.xpath(itemXML, 'book_series_metadata');
				// TODO: Check book_set_metadata here too, as we do below?

				item.bookTitle = ZU.xpathText(metadataXML, 'titles[1]/title[1]');
				item.seriesTitle = ZU.xpathText(metadataXML, 'series_metadata/titles[1]/title[1]');

				var metadataSeriesXML = ZU.xpath(metadataXML, 'series_metadata');
				if (metadataSeriesXML.length) parseCreators(metadataSeriesXML, item, { editor: "seriesEditor" });
			}
			else {
				metadataXML = ZU.xpath(itemXML, 'book_series_metadata');
				if (!metadataXML.length) metadataXML = ZU.xpath(itemXML, 'book_metadata');
				item.bookTitle = ZU.xpathText(metadataXML, 'series_metadata/titles[1]/title[1]');
				if (!item.bookTitle) item.bookTitle = ZU.xpathText(metadataXML, 'titles[1]/title[1]');
			}

			// Handle book authors
			parseCreators(metadataXML, item, { author: "bookAuthor" });
		// Book
		}
		else {
			item = new Zotero.Item("book");
			refXML = ZU.xpath(itemXML, 'book_metadata');
			// Sometimes book data is in book_series_metadata
			// doi: 10.1007/978-1-4419-9164-5
			
			// And sometimes in book_set_metadata
			// doi: 10.7551/mitpress/9780262533287.003.0006
			
			if (!refXML.length) refXML = ZU.xpath(itemXML, 'book_series_metadata');
			if (!refXML.length) refXML = ZU.xpath(itemXML, 'book_set_metadata');
			metadataXML = refXML;
			seriesXML = ZU.xpath(refXML, 'series_metadata');
		}

		item.place = ZU.xpathText(metadataXML, 'publisher/publisher_place');
	}
	else if ((itemXML = ZU.xpath(doiRecord, 'crossref/standard')).length) {
		item = new Zotero.Item("report");
		refXML = ZU.xpath(itemXML, 'standard_metadata');
		metadataXML = ZU.xpath(itemXML, 'standard_metadata');
	}
	else if ((itemXML = ZU.xpath(doiRecord, 'crossref/conference')).length) {
		item = new Zotero.Item("conferencePaper");
		refXML = ZU.xpath(itemXML, 'conference_paper');
		metadataXML = ZU.xpath(itemXML, 'proceedings_metadata');
		seriesXML = ZU.xpath(metadataXML, 'proceedings_metadata');

		item.publicationTitle = ZU.xpathText(metadataXML, 'proceedings_title');
		item.place = ZU.xpathText(itemXML, 'event_metadata/conference_location');
		item.conferenceName = ZU.xpathText(itemXML, 'event_metadata/conference_name');
	}

	else if ((itemXML = ZU.xpath(doiRecord, 'crossref/database')).length) {
		item = new Zotero.Item("report"); // should be dataset
		refXML = ZU.xpath(itemXML, 'dataset');
		item.extra = "type: dataset";
		metadataXML = ZU.xpath(itemXML, 'database_metadata');
		
		var pubDate = ZU.xpath(refXML, 'database_date/publication_date');
		if (!pubDate.length) pubDate = ZU.xpath(metadataXML, 'database_date/publication_date');
		item.date = parseDate(pubDate);
		
		if (!ZU.xpathText(refXML, 'contributors')) {
			parseCreators(metadataXML, item);
		}
		if (!ZU.xpathText(metadataXML, 'publisher')) {
			item.institution = ZU.xpathText(metadataXML, 'institution/institution_name');
		}
	}
	
	else if ((itemXML = ZU.xpath(doiRecord, 'crossref/dissertation')).length) {
		item = new Zotero.Item("thesis");
		item.date = parseDate(ZU.xpath(itemXML, "approval_date[1]"));
		item.university = ZU.xpathText(itemXML, "institution/institution_name");
		item.place = ZU.xpathText(itemXML, "institution/institution_place");
		var type = ZU.xpathText(itemXML, "degree");
		if (type) item.thesisType = type.replace(/\(.+\)/, "");
	}
	
	else if ((itemXML = ZU.xpath(doiRecord, 'crossref/posted_content')).length) {
		item = new Zotero.Item("report"); // should be preprint
		item.type = ZU.xpathText(itemXML, "./@type");
		item.institution = ZU.xpathText(itemXML, "group_title");
		item.date = parseDate(ZU.xpath(itemXML, "posted_date"));
	}
	
	else if ((itemXML = ZU.xpath(doiRecord, 'crossref/peer_review')).length) {
		item = new Zotero.Item("manuscript"); // is this the best category
		item.date = parseDate(ZU.xpath(itemXML, "reviewed_date"));
		if (ZU.xpath(itemXML, "/contributors/anonymous")) {
			item.creators.push({ lastName: "Anonymous Reviewer", fieldMode: "1", creatorType: "author" });
		}
		item.type = "peer review";
		var reviewOf = ZU.xpathText(itemXML, "//related_item/inter_work_relation");
		if (reviewOf) {
			var identifierType = ZU.xpathText(itemXML, "//related_item/inter_work_relation/@identifier-type");
			var identifier;
			if (identifierType == "doi") {
				identifier = "<a href=\"https://doi.org/" + reviewOf + "\">https://doi.org/" + reviewOf + "</a>";
			}
			else if (identifierType == "url") {
				identifier = "<a href=\"" + reviewOf + "\">" + reviewOf + "</a>";
			}
			else {
				identifier = reviewOf;
			}
			var noteText = "Review of " + identifier;
			// Z.debug(noteText);
			item.notes.push(noteText);
		}
	}
	
	else {
		item = new Zotero.Item("document");
	}


	if (!refXML || !refXML.length) {
		refXML = itemXML;
	}

	if (!metadataXML || !metadataXML.length) {
		metadataXML = refXML;
	}

	item.abstractNote = ZU.xpathText(refXML, 'description|abstract');
	item.language = ZU.xpathText(metadataXML, './@language');
	item.ISBN = ZU.xpathText(metadataXML, 'isbn');
	item.ISSN = ZU.xpathText(metadataXML, 'issn');
	item.publisher = ZU.xpathText(metadataXML, 'publisher/publisher_name');

	item.edition = ZU.xpathText(metadataXML, 'edition_number');
	if (!item.volume) item.volume = ZU.xpathText(metadataXML, 'volume');
	

	parseCreators(refXML, item, (item.itemType == 'bookSection' ? { editor: null } : "author"));

	if (seriesXML && seriesXML.length) {
		parseCreators(seriesXML, item, { editor: "seriesEditor" });
		item.series = ZU.xpathText(seriesXML, 'titles[1]/title[1]');
		item.seriesNumber = ZU.xpathText(seriesXML, 'series_number');
		item.reportType = ZU.xpathText(seriesXML, 'titles[1]/title[1]');
	}
	// prefer article to journal metadata and print to other dates
	var pubDateNode = ZU.xpath(refXML, 'publication_date[@media_type="print"]');
	if (!pubDateNode.length) pubDateNode = ZU.xpath(refXML, 'publication_date');
	if (!pubDateNode.length) pubDateNode = ZU.xpath(metadataXML, 'publication_date[@media_type="print"]');
	if (!pubDateNode.length) pubDateNode = ZU.xpath(metadataXML, 'publication_date');

	
	if (pubDateNode.length) {
		item.date = parseDate(pubDateNode);
	}

	var pages = ZU.xpath(refXML, 'pages[1]');
	if (pages.length) {
		item.pages = ZU.xpathText(pages, 'first_page[1]');
		var lastPage = ZU.xpathText(pages, 'last_page[1]');
		if (lastPage) item.pages += "-" + lastPage;
	}
	else {
		// use article Number instead
		item.pages = ZU.xpathText(refXML, 'publisher_item/item_number');
	}

	item.DOI = ZU.xpathText(refXML, 'doi_data/doi');
	// add DOI to extra for unsupprted items
	if (item.DOI && !ZU.fieldIsValidForType("DOI", item.itemType)) {
		if (item.extra) {
			item.extra += "\nDOI: " + item.DOI;
		}
		else {
			item.extra = "DOI: " + item.DOI;
		}
	}
	item.url = ZU.xpathText(refXML, 'doi_data/resource');
	var title = ZU.xpath(refXML, 'titles[1]/title[1]')[0];
	if (!title && metadataXML) {
		title = ZU.xpath(metadataXML, 'titles[1]/title[1]')[0];
	}
	if (title) {
		item.title = ZU.trimInternal(
			removeUnsupportedMarkup(innerXML(title))
		);
		var subtitle = ZU.xpath(refXML, 'titles[1]/subtitle[1]')[0];
		if (subtitle) {
			item.title += ': ' + ZU.trimInternal(
				removeUnsupportedMarkup(innerXML(subtitle))
			);
		}
	}
	if (!item.title || item.title == "") {
		item.title = "[No title found]";
	}
	// Zotero.debug(JSON.stringify(item, null, 4));

	// check if there are potential issues with character encoding and try to fix it
	// e.g. 10.1057/9780230391116.0016 (en dash in title is presented as <control><control>â)
	for (var field in item) {
		if (typeof item[field] != 'string') continue;
		// check for control characters that should never be in strings from CrossRef
		if (/[\u007F-\u009F]/.test(item[field])) {
			item[field] = decodeURIComponent(escape(item[field]));
		}
	}
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<doi_records>\n  <doi_record owner=\"10.1109\" timestamp=\"2017-03-18 06:36:17\">\n    <crossref>\n      <conference>\n        <event_metadata>\n          <conference_name>2017 IEEE International Solid- State Circuits Conference - (ISSCC)</conference_name>\n          <conference_location>San Francisco, CA, USA</conference_location>\n          <conference_date start_month=\"2\" start_year=\"2017\" start_day=\"5\" end_month=\"2\" end_year=\"2017\" end_day=\"9\" />\n        </event_metadata>\n        <proceedings_metadata>\n          <proceedings_title>2017 IEEE International Solid-State Circuits Conference (ISSCC)</proceedings_title>\n          <publisher>\n            <publisher_name>IEEE</publisher_name>\n          </publisher>\n          <publication_date>\n            <month>2</month>\n            <year>2017</year>\n          </publication_date>\n          <isbn media_type=\"electronic\">978-1-5090-3758-2</isbn>\n        </proceedings_metadata>\n        <conference_paper>\n          <contributors>\n            <person_name sequence=\"first\" contributor_role=\"author\">\n              <given_name>Pen-Jui</given_name>\n              <surname>Peng</surname>\n            </person_name>\n            <person_name sequence=\"additional\" contributor_role=\"author\">\n              <given_name>Jeng-Feng</given_name>\n              <surname>Li</surname>\n            </person_name>\n            <person_name sequence=\"additional\" contributor_role=\"author\">\n              <given_name>Li-Yang</given_name>\n              <surname>Chen</surname>\n            </person_name>\n            <person_name sequence=\"additional\" contributor_role=\"author\">\n              <given_name>Jri</given_name>\n              <surname>Lee</surname>\n            </person_name>\n          </contributors>\n          <titles>\n            <title>6.1 A 56Gb/s PAM-4/NRZ transceiver in 40nm CMOS</title>\n          </titles>\n          <publication_date>\n            <month>2</month>\n            <year>2017</year>\n          </publication_date>\n          <pages>\n            <first_page>110</first_page>\n            <last_page>111</last_page>\n          </pages>\n          <publisher_item>\n            <item_number item_number_type=\"arNumber\">7870285</item_number>\n          </publisher_item>\n          <doi_data>\n            <doi>10.1109/ISSCC.2017.7870285</doi>\n            <resource>http://ieeexplore.ieee.org/document/7870285/</resource>\n            <collection property=\"crawler-based\">\n              <item crawler=\"iParadigms\">\n                <resource>http://xplorestaging.ieee.org/ielx7/7866667/7870233/07870285.pdf?arnumber=7870285</resource>\n              </item>\n            </collection>\n          </doi_data>\n        </conference_paper>\n      </conference>\n    </crossref>\n  </doi_record>\n</doi_records>\n",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "6.1 A 56Gb/s PAM-4/NRZ transceiver in 40nm CMOS",
				"creators": [
					{
						"creatorType": "author",
						"firstName": "Pen-Jui",
						"lastName": "Peng"
					},
					{
						"creatorType": "author",
						"firstName": "Jeng-Feng",
						"lastName": "Li"
					},
					{
						"creatorType": "author",
						"firstName": "Li-Yang",
						"lastName": "Chen"
					},
					{
						"creatorType": "author",
						"firstName": "Jri",
						"lastName": "Lee"
					}
				],
				"date": "2/2017",
				"DOI": "10.1109/ISSCC.2017.7870285",
				"ISBN": "978-1-5090-3758-2",
				"conferenceName": "2017 IEEE International Solid- State Circuits Conference - (ISSCC)",
				"pages": "110-111",
				"place": "San Francisco, CA, USA",
				"proceedingsTitle": "2017 IEEE International Solid-State Circuits Conference (ISSCC)",
				"publisher": "IEEE",
				"url": "http://ieeexplore.ieee.org/document/7870285/",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<doi_records>\n  <doi_record owner=\"10.1093\" timestamp=\"2017-08-23 03:08:26\">\n    <crossref>\n      <journal>\n        <journal_metadata language=\"en\">\n          <full_title>FEMS Microbiology Ecology</full_title>\n          <abbrev_title>FEMS Microbiol Ecol</abbrev_title>\n          <issn>01686496</issn>\n        </journal_metadata>\n        <journal_issue>\n          <publication_date media_type=\"print\">\n            <month>04</month>\n            <year>2013</year>\n          </publication_date>\n          <journal_volume>\n            <volume>84</volume>\n          </journal_volume>\n          <issue>1</issue>\n        </journal_issue>\n        <journal_article publication_type=\"full_text\">\n          <titles>\n            <title> Microbial community\n              changes at a terrestrial volcanic CO\n              <sub>2</sub>\n              vent induced by soil acidification and anaerobic microhabitats within the soil column\n            </title>\n          </titles>\n          <contributors>\n            <person_name contributor_role=\"author\" sequence=\"first\">\n              <given_name>Janin</given_name>\n              <surname>Frerichs</surname>\n              <affiliation>Federal Institute for Geosciences and Natural Resources (BGR); Hannover; Germany</affiliation>\n            </person_name>\n            <person_name contributor_role=\"author\" sequence=\"additional\">\n              <given_name>Birte I.</given_name>\n              <surname>Oppermann</surname>\n              <affiliation>Institute of Biogeochemistry and Marine Chemistry; University of Hamburg; Hamburg; Germany</affiliation>\n            </person_name>\n            <person_name contributor_role=\"author\" sequence=\"additional\">\n              <given_name>Simone</given_name>\n              <surname>Gwosdz</surname>\n              <affiliation>Federal Institute for Geosciences and Natural Resources (BGR); Hannover; Germany</affiliation>\n            </person_name>\n            <person_name contributor_role=\"author\" sequence=\"additional\">\n              <given_name>Ingo</given_name>\n              <surname>Möller</surname>\n              <affiliation>Federal Institute for Geosciences and Natural Resources (BGR); Hannover; Germany</affiliation>\n            </person_name>\n            <person_name contributor_role=\"author\" sequence=\"additional\">\n              <given_name>Martina</given_name>\n              <surname>Herrmann</surname>\n              <affiliation>Institute of Ecology, Limnology/Aquatic Geomicrobiology Working Group; Friedrich Schiller University of Jena; Jena; Germany</affiliation>\n            </person_name>\n            <person_name contributor_role=\"author\" sequence=\"additional\">\n              <given_name>Martin</given_name>\n              <surname>Krüger</surname>\n              <affiliation>Federal Institute for Geosciences and Natural Resources (BGR); Hannover; Germany</affiliation>\n            </person_name>\n          </contributors>\n          <publication_date media_type=\"print\">\n            <month>04</month>\n            <year>2013</year>\n          </publication_date>\n          <publication_date media_type=\"online\">\n            <month>12</month>\n            <day>10</day>\n            <year>2012</year>\n          </publication_date>\n          <pages>\n            <first_page>60</first_page>\n            <last_page>74</last_page>\n          </pages>\n          <doi_data>\n            <doi>10.1111/1574-6941.12040</doi>\n            <resource>https://academic.oup.com/femsec/article-lookup/doi/10.1111/1574-6941.12040</resource>\n            <collection property=\"crawler-based\">\n              <item crawler=\"iParadigms\">\n                <resource>http://academic.oup.com/femsec/article-pdf/84/1/60/19537307/84-1-60.pdf</resource>\n              </item>\n            </collection>\n          </doi_data>\n        </journal_article>\n      </journal>\n    </crossref>\n  </doi_record>\n</doi_records>\n",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Microbial community changes at a terrestrial volcanic CO <sub>2</sub> vent induced by soil acidification and anaerobic microhabitats within the soil column",
				"creators": [
					{
						"creatorType": "author",
						"firstName": "Janin",
						"lastName": "Frerichs"
					},
					{
						"creatorType": "author",
						"firstName": "Birte I.",
						"lastName": "Oppermann"
					},
					{
						"creatorType": "author",
						"firstName": "Simone",
						"lastName": "Gwosdz"
					},
					{
						"creatorType": "author",
						"firstName": "Ingo",
						"lastName": "Möller"
					},
					{
						"creatorType": "author",
						"firstName": "Martina",
						"lastName": "Herrmann"
					},
					{
						"creatorType": "author",
						"firstName": "Martin",
						"lastName": "Krüger"
					}
				],
				"date": "04/2013",
				"DOI": "10.1111/1574-6941.12040",
				"ISSN": "01686496",
				"issue": "1",
				"language": "en",
				"pages": "60-74",
				"publicationTitle": "FEMS Microbiology Ecology",
				"url": "https://academic.oup.com/femsec/article-lookup/doi/10.1111/1574-6941.12040",
				"volume": "84",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<doi_records>\n  <doi_record owner=\"10.1080\" timestamp=\"2018-09-06 15:38:40\">\n    <crossref>\n      <journal>\n        <journal_metadata language=\"en\">\n          <full_title>Eurasian Geography and Economics</full_title>\n          <abbrev_title>Eurasian Geography and Economics</abbrev_title>\n          <issn media_type=\"print\">1538-7216</issn>\n          <issn media_type=\"electronic\">1938-2863</issn>\n        </journal_metadata>\n        <journal_issue>\n          <publication_date media_type=\"online\">\n            <month>05</month>\n            <day>15</day>\n            <year>2013</year>\n          </publication_date>\n          <publication_date media_type=\"print\">\n            <month>03</month>\n            <year>2009</year>\n          </publication_date>\n          <journal_volume>\n            <volume>50</volume>\n          </journal_volume>\n          <issue>2</issue>\n        </journal_issue>\n        <journal_article publication_type=\"full_text\">\n          <titles>\n            <title>\n              The Chinese\n              <i>Hukou</i>\n              System at 50\n            </title>\n          </titles>\n          <contributors>\n            <person_name sequence=\"first\" contributor_role=\"author\">\n              <given_name>Kam Wing</given_name>\n              <surname>Chan</surname>\n              <affiliation>a  University of Washington</affiliation>\n            </person_name>\n          </contributors>\n          <publication_date media_type=\"online\">\n            <month>05</month>\n            <day>15</day>\n            <year>2013</year>\n          </publication_date>\n          <publication_date media_type=\"print\">\n            <month>03</month>\n            <year>2009</year>\n          </publication_date>\n          <pages>\n            <first_page>197</first_page>\n            <last_page>221</last_page>\n          </pages>\n          <publisher_item>\n            <item_number item_number_type=\"sequence-number\">5</item_number>\n            <identifier id_type=\"doi\">10.2747/1539-7216.50.2.197</identifier>\n          </publisher_item>\n          <doi_data>\n            <doi>10.2747/1539-7216.50.2.197</doi>\n            <resource>https://www.tandfonline.com/doi/full/10.2747/1539-7216.50.2.197</resource>\n            <collection property=\"crawler-based\">\n              <item crawler=\"iParadigms\">\n                <resource>https://www.tandfonline.com/doi/pdf/10.2747/1539-7216.50.2.197</resource>\n              </item>\n              <item crawler=\"google\">\n                <resource>http://bellwether.metapress.com/index/10.2747/1539-7216.50.2.197</resource>\n              </item>\n            </collection>\n          </doi_data>\n        </journal_article>\n      </journal>\n    </crossref>\n  </doi_record>\n</doi_records>\n",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Chinese <i>Hukou</i> System at 50",
				"creators": [
					{
						"creatorType": "author",
						"firstName": "Kam Wing",
						"lastName": "Chan"
					}
				],
				"date": "03/2009",
				"DOI": "10.2747/1539-7216.50.2.197",
				"ISSN": "1538-7216, 1938-2863",
				"issue": "2",
				"language": "en",
				"pages": "197-221",
				"publicationTitle": "Eurasian Geography and Economics",
				"url": "https://www.tandfonline.com/doi/full/10.2747/1539-7216.50.2.197",
				"volume": "50",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<doi_records>\n  <doi_record owner=\"10.17077\" timestamp=\"2018-11-29 17:31:41\">\n    <crossref>\n      <dissertation publication_type=\"full_text\" language=\"en\">\n        <person_name sequence=\"first\" contributor_role=\"author\">\n          <given_name>Joseph Emil</given_name>\n          <surname>Kasper</surname>\n          <affiliation>State University of Iowa</affiliation>\n        </person_name>\n        <titles>\n          <title>Contributions to geomagnetic theory</title>\n        </titles>\n        <approval_date media_type=\"print\">\n          <month>01</month>\n          <year>1958</year>\n        </approval_date>\n        <institution>\n          <institution_name>State University of Iowa</institution_name>\n          <institution_acronym>UIowa</institution_acronym>\n          <institution_acronym>SUI</institution_acronym>\n          <institution_place>Iowa City, Iowa, USA</institution_place>\n          <institution_department>Physics</institution_department>\n        </institution>\n        <degree>PhD (Doctor of Philosophy)</degree>\n        <doi_data>\n          <doi>10.17077/etd.xnw0xnau</doi>\n          <resource>https://ir.uiowa.edu/etd/4529</resource>\n        </doi_data>\n      </dissertation>\n    </crossref>\n  </doi_record>\n</doi_records>\n",
		"items": [
			{
				"itemType": "thesis",
				"title": "Contributions to geomagnetic theory",
				"creators": [
					{
						"creatorType": "author",
						"firstName": "Joseph Emil",
						"lastName": "Kasper"
					}
				],
				"date": "01/1958",
				"extra": "DOI: 10.17077/etd.xnw0xnau",
				"language": "en",
				"place": "Iowa City, Iowa, USA",
				"thesisType": "PhD",
				"university": "State University of Iowa",
				"url": "https://ir.uiowa.edu/etd/4529",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<doi_records>\n  <doi_record owner=\"10.31219\" timestamp=\"2018-11-13 07:19:46\">\n    <crossref>\n      <posted_content type=\"preprint\">\n        <group_title>Open Science Framework</group_title>\n        <contributors>\n          <person_name contributor_role=\"author\" sequence=\"first\">\n            <given_name>Steve</given_name>\n            <surname>Haroz</surname>\n          </person_name>\n        </contributors>\n        <titles>\n          <title>Open Practices in Visualization Research</title>\n        </titles>\n        <posted_date>\n          <month>07</month>\n          <day>03</day>\n          <year>2018</year>\n        </posted_date>\n        <item_number>osf.io/8ag3w</item_number>\n        <abstract>\n          <p>Two fundamental tenants of scientific research are that it can be scrutinized and built-upon. Both require that the collected data and supporting materials be shared, so others can examine, reuse, and extend them. Assessing the accessibility of these components and the paper itself can serve as a proxy for the reliability, replicability, and applicability of a field’s research. In this paper, I describe the current state of openness in visualization research and provide suggestions for authors, reviewers, and editors to improve open practices in the field. A free copy of this paper, the collected data, and the source code are available at https://osf.io/qf9na/</p>\n        </abstract>\n        <program>\n          <license_ref start_date=\"2018-07-03\">https://creativecommons.org/licenses/by/4.0/legalcode</license_ref>\n        </program>\n        <doi_data>\n          <doi>10.31219/osf.io/8ag3w</doi>\n          <resource>https://osf.io/8ag3w</resource>\n        </doi_data>\n      </posted_content>\n    </crossref>\n  </doi_record>\n</doi_records>\n",
		"items": [
			{
				"itemType": "report",
				"title": "Open Practices in Visualization Research",
				"creators": [
					{
						"creatorType": "author",
						"firstName": "Steve",
						"lastName": "Haroz"
					}
				],
				"date": "2018-07-03",
				"abstractNote": "Two fundamental tenants of scientific research are that it can be scrutinized and built-upon. Both require that the collected data and supporting materials be shared, so others can examine, reuse, and extend them. Assessing the accessibility of these components and the paper itself can serve as a proxy for the reliability, replicability, and applicability of a field’s research. In this paper, I describe the current state of openness in visualization research and provide suggestions for authors, reviewers, and editors to improve open practices in the field. A free copy of this paper, the collected data, and the source code are available at https://osf.io/qf9na/",
				"extra": "DOI: 10.31219/osf.io/8ag3w",
				"institution": "Open Science Framework",
				"reportType": "preprint",
				"url": "https://osf.io/8ag3w",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<doi_records>\n  <doi_record owner=\"10.21468\" timestamp=\"2018-01-22 15:00:32\">\n    <crossref>\n      <peer_review stage=\"pre-publication\">\n        <contributors>\n          <anonymous sequence=\"first\" contributor_role=\"reviewer\" />\n        </contributors>\n        <titles>\n          <title>Report on 1607.01285v1</title>\n        </titles>\n        <review_date>\n          <month>09</month>\n          <day>08</day>\n          <year>2016</year>\n        </review_date>\n        <program>\n          <related_item>\n            <description>Report on 1607.01285v1</description>\n            <inter_work_relation relationship-type=\"isReviewOf\" identifier-type=\"doi\">10.21468/SciPostPhys.1.1.010</inter_work_relation>\n          </related_item>\n        </program>\n        <doi_data>\n          <doi>10.21468/SciPost.Report.10</doi>\n          <resource>https://scipost.org/SciPost.Report.10</resource>\n        </doi_data>\n      </peer_review>\n    </crossref>\n  </doi_record>\n</doi_records>\n",
		"items": [
			{
				"itemType": "manuscript",
				"title": "Report on 1607.01285v1",
				"creators": [
					{
						"lastName": "Anonymous Reviewer",
						"fieldMode": "1",
						"creatorType": "author"
					}
				],
				"extra": "DOI: 10.21468/SciPost.Report.10",
				"manuscriptType": "peer review",
				"url": "https://scipost.org/SciPost.Report.10",
				"attachments": [],
				"tags": [],
				"notes": [
					"Review of <a href=\"https://doi.org/10.21468/SciPostPhys.1.1.010\">https://doi.org/10.21468/SciPostPhys.1.1.010</a>"
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?> <doi_records> <doi_record owner=\"10.4086\" timestamp=\"2018-12-31 08:08:13\"> <crossref> <journal> <journal_metadata language=\"en\"> <full_title>Chicago Journal of Theoretical Computer Science</full_title> <abbrev_title>Chicago J. of Theoretical Comp. Sci.</abbrev_title> <abbrev_title>CJTCS</abbrev_title> <issn media_type=\"electronic\">1073-0486</issn> <coden>CJTCS</coden> <doi_data> <doi>10.4086/cjtcs</doi> <resource>http://cjtcs.cs.uchicago.edu/</resource> </doi_data> </journal_metadata> <journal_issue> <publication_date media_type=\"online\"> <year>2012</year> </publication_date> <journal_volume> <volume>18</volume> </journal_volume> <issue>1</issue> <doi_data> <doi>10.4086/cjtcs.2012.v018</doi> <resource>http://cjtcs.cs.uchicago.edu/articles/2012/contents.html</resource> </doi_data> </journal_issue> <journal_article publication_type=\"full_text\"> <titles> <title /> </titles> <contributors> <person_name sequence=\"first\" contributor_role=\"author\"> <given_name>Michael</given_name> <surname>Hoffman</surname> </person_name> <person_name sequence=\"additional\" contributor_role=\"author\"> <given_name>Jiri</given_name> <surname>Matousek</surname> </person_name> <person_name sequence=\"additional\" contributor_role=\"author\"> <given_name>Yoshio</given_name> <surname>Okamoto</surname> </person_name> <person_name sequence=\"additional\" contributor_role=\"author\"> <given_name>Phillipp</given_name> <surname>Zumstein</surname> </person_name> </contributors> <publication_date media_type=\"online\"> <year>2012</year> </publication_date> <pages> <first_page>1</first_page> <last_page>10</last_page> </pages> <doi_data> <doi>10.4086/cjtcs.2012.002</doi> <resource>http://cjtcs.cs.uchicago.edu/articles/2012/2/contents.html</resource> </doi_data> </journal_article> </journal> </crossref> </doi_record> </doi_records>",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "[No title found]",
				"creators": [
					{
						"creatorType": "author",
						"firstName": "Michael",
						"lastName": "Hoffman"
					},
					{
						"creatorType": "author",
						"firstName": "Jiri",
						"lastName": "Matousek"
					},
					{
						"creatorType": "author",
						"firstName": "Yoshio",
						"lastName": "Okamoto"
					},
					{
						"creatorType": "author",
						"firstName": "Phillipp",
						"lastName": "Zumstein"
					}
				],
				"date": "2012",
				"DOI": "10.4086/cjtcs.2012.002",
				"ISSN": "1073-0486",
				"issue": "1",
				"language": "en",
				"pages": "1-10",
				"publicationTitle": "Chicago Journal of Theoretical Computer Science",
				"url": "http://cjtcs.cs.uchicago.edu/articles/2012/2/contents.html",
				"volume": "18",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
