{
	"translatorID": "032ae9b7-ab90-9205-a479-baf81f49184a",
	"translatorType": 2,
	"label": "TEI",
	"creator": "Stefan Majewski",
	"target": "xml",
	"minVersion": "4.0.27",
	"maxVersion": null,
	"priority": 25,
	"inRepository": true,
	"configOptions": {
		"dataMode": "xml/dom",
		"getCollections": "true"
	},
	"displayOptions": {
		"exportNotes": false,
		"Export Tags": false,
		"Generate XML IDs": true,
		"Full TEI Document": false,
		"Export Collections": false
	},
	"lastUpdated": "2019-01-31 00:12:00"
}

// ********************************************************************
//
// tei-zotero-translator. Zotero 2 to TEI P5 exporter.
//
// Copyright (C) 2010 Stefan Majewski <xml@stefanmajewski.eu>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.


// *********************************************************************
//
// This script does fairly well with papers, theses, websites and
// books. Some item properties, important for the more exotic
// publication types, are still missing. That means, the first 30 are
// implemented, the rest may be added when I need them. If you like to
// see some particular item property and you also have a basic idea
// how to represent them in TEI (without breaking the, to me, more
// important ones), please contact me or send a patch.
//
// <analytic> vs <monogr> Both elements are used. The script tries to
// figure out where which information might be appropriately placed. I
// hope this works.
//
// Zotero.addOption("exportNotes", false);
// Zotero.addOption("generateXMLIds", true);

var ns = {
	"tei": "http://www.tei-c.org/ns/1.0",
	"xml": "http://www.w3.org/XML/1998/namespace"
};



var exportedXMLIds = {};
var generatedItems = {};
var allItems = {};

// replace formatting with TEI tags
function replaceFormatting(title) {
	var titleText = title;
	// italics
	titleText = titleText.replace(/<i>/g, '<hi rend="italics">');
	titleText = titleText.replace(/<\/i>/g, '</hi>');
	// bold
	titleText = titleText.replace(/<b>/g, '<hi rend="bold">');
	titleText = titleText.replace(/<\/b>/g, '</hi>');
	// subscript
	titleText = titleText.replace(/<sub>/g, '<hi rend="sub">');
	titleText = titleText.replace(/<\/sub>/g, '</hi>');
	// superscript
	titleText = titleText.replace(/<sup>/g, '<hi rend="sup">');
	titleText = titleText.replace(/<\/sup>/g, '</hi>');
	// small caps
	titleText = titleText.replace(/<span style="font-variant:\s*small-caps;">(.*?)<\/span>/g, '<hi rend="smallcaps">$1</hi>');
	titleText = titleText.replace(/<sc>/g, '<hi rend="smallcaps">');
	titleText = titleText.replace(/<\/sc>/g, '</hi>');
	// no capitalization
	titleText = titleText.replace(/<span class="nocase">(.*?)<\/span>/g, '<hi rend="nocase">$1</hi>');

	return titleText;
}

function genXMLId(item) {
	// use Better BibTeX for Zotero citation key if available
	if (item.extra) {
		item.extra = item.extra.replace(/(?:^|\n)citation key\s*:\s*([^\s]+)(?:\n|$)/i, (m, citationKey) => {
			item.citationKey = citationKey
			return '\n'
		}).trim()
	}
	if (item.citationKey) return item.citationKey

	var xmlid = '';
	if (item.creators && item.creators[0] && (item.creators[0].lastName || item.creators[0].name)) {
		if (item.creators[0].lastName){
			xmlid = item.creators[0].lastName;
		}
		if (item.creators[0].name){
			xmlid = item.creators[0].name;
		}
		if (item.date) {
			var date = Zotero.Utilities.strToDate(item.date);
			if (date.year) {
				xmlid += date.year;
			}
		}
		// Replace space, tabulations, colon, punctuation, parenthesis and apostrophes by "_"
		xmlid = xmlid.replace(/([ \t\[\]:\u00AD\u0021-\u002C\u2010-\u2021])+/g, "_");
		

		// Remove any non xml NCName characters

		// Namestart = ":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] |
		// [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF]
		// | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] |
		// [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] |
		// [#x10000-#xEFFFF]

		// Name = NameStartChar | "-" | "." | [0-9] | #xB7 |
		// [#x0300-#x036F] | [#x203F-#x2040]

		xmlid = xmlid.replace(/^[^A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u10000-\uEFFFF]/, "");
		xmlid = xmlid.replace(/[^-A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u10000-\uEFFFF.0-9\u00B7\u0300-\u036F\u203F-\u2040]/g, "");
	} else {
		// "zoteroItem_item.key" as value for entries without creator
		var str = item.uri;
		var n = str.lastIndexOf('/');
		var result = str.substring(n + 1);
		xmlid += 'zoteroItem_' + result;
	}
	// this is really inefficient
	var curXmlId = xmlid;
	if (exportedXMLIds[curXmlId]) {
		// append characters to make xml:id unique
		// a-z aa-az ba-bz
		var charA = 97;
		var charZ = 122;
		var firstId = xmlid + "a";
		// reset id of previous date-only item to <date> + "a";
		if (exportedXMLIds[curXmlId] &&
			!exportedXMLIds[firstId]) {
			exportedXMLIds[curXmlId].setAttributeNS(ns.xml, "xml:id", firstId);
			exportedXMLIds[firstId] = exportedXMLIds[curXmlId];
		}
		// then start from b
		for (var i = charA + 1; exportedXMLIds[curXmlId]; i++) {
			curXmlId = xmlid + String.fromCharCode(i);
			if (i == charZ) {
				i = charA;
				xmlid += String.fromCharCode(charA);
			}
		}
		xmlid = curXmlId;
	}
	// set in main loop
	// exportedXMLIds[xmlid] = true;
	return xmlid;
}

function generateItem(item, teiDoc) {
	// fixme not all conferencepapers are analytic!
	var analyticItemTypes = {
		"journalArticle": true,
		"bookSection": true,
		"magazineArticle": true,
		"newspaperArticle": true,
		"conferencePaper": true,
		"encyclopediaArticle": true,
		"dictionaryEntry": true,
		"webpage": true
	};

	var isAnalytic = analyticItemTypes[item.itemType] ? true : false;
	var bibl = teiDoc.createElementNS(ns.tei, "biblStruct");
	bibl.setAttribute("type", item.itemType);

	if (Zotero.getOption("Generate XML IDs")) {
		if (!generatedItems[item.uri]) {
			var xmlid = genXMLId(item);
			bibl.setAttributeNS(ns.xml, "xml:id", xmlid);
			exportedXMLIds[xmlid] = bibl;
		} else {
			var xmlid = "#" + generatedItems[item.uri].getAttributeNS(ns.xml, "id");
			var myXmlid = "zoteroItem_" + item.uri;

			bibl.setAttribute("sameAs", xmlid);

			bibl.setAttributeNS(ns.xml, "xml:id", myXmlid);
			exportedXMLIds[myXmlid] = bibl;
		}
		//create attribute for Zotero item URI
		bibl.setAttribute("corresp", item.uri);
	}

	generatedItems[item.uri] = bibl;

	/** CORE FIELDS **/

	var monogr = teiDoc.createElementNS(ns.tei, "monogr");
	var analytic = null;
	var series = null;
	// create title or monogr
	if (isAnalytic) {
		analytic = teiDoc.createElementNS(ns.tei, "analytic")
		bibl.appendChild(analytic);
		bibl.appendChild(monogr);
		var analyticTitle = teiDoc.createElementNS(ns.tei, "title");
		analyticTitle.setAttribute("level", "a");
		analytic.appendChild(analyticTitle);
		if (item.title) {
			analyticTitle.appendChild(teiDoc.createTextNode(replaceFormatting(item.title)));
		}
		//A DOI is presumably for the article, not the journal.
		if (item.DOI) {
			var idno = teiDoc.createElementNS(ns.tei, "idno");
			idno.setAttribute("type", "DOI");
			idno.appendChild(teiDoc.createTextNode(item.DOI));
			analytic.appendChild(idno);
		}

		// publication title
		var publicationTitle = item.bookTitle || item.proceedingsTitle || item.encyclopediaTitle || item.dictionaryTitle || item.publicationTitle || item.websiteTitle;
		if (publicationTitle) {
			var pubTitle = teiDoc.createElementNS(ns.tei, "title");
			if (item.itemType == "journalArticle") {
				pubTitle.setAttribute("level", "j");
			} else {
				pubTitle.setAttribute("level", "m");
			}
			pubTitle.appendChild(teiDoc.createTextNode(replaceFormatting(publicationTitle)));
			monogr.appendChild(pubTitle);
		}

		// short title
		if (item.shortTitle) {
			var shortTitle = teiDoc.createElementNS(ns.tei, "title");
			shortTitle.setAttribute("type", "short");
			shortTitle.appendChild(teiDoc.createTextNode(item.shortTitle));
			analytic.appendChild(shortTitle);
		}
	} else {
		bibl.appendChild(monogr);
		if (item.title) {
			var title = teiDoc.createElementNS(ns.tei, "title");
			title.setAttribute("level", "m");
			title.appendChild(teiDoc.createTextNode(replaceFormatting(item.title)));
			monogr.appendChild(title);
		} else if (!item.conferenceName) {
			var title = teiDoc.createElementNS(ns.tei, "title");
			monogr.appendChild(title);
		}
		// short title
		if (item.shortTitle) {
			var shortTitle = teiDoc.createElementNS(ns.tei, "title");
			shortTitle.setAttribute("type", "short");
			shortTitle.appendChild(teiDoc.createTextNode(item.shortTitle));
			monogr.appendChild(shortTitle);
		}
		//A DOI where there's no analytic must be for the monogr.
		if (item.DOI) {
			var idno = teiDoc.createElementNS(ns.tei, "idno");
			idno.setAttribute("type", "DOI");
			idno.appendChild(teiDoc.createTextNode(item.DOI));
			analytic.appendChild(idno);
		}
	}


	// add name of conference
	if (item.conferenceName) {
		var conferenceName = teiDoc.createElementNS(ns.tei, "title");
		conferenceName.setAttribute("type", "conferenceName");
		conferenceName.appendChild(teiDoc.createTextNode(replaceFormatting(item.conferenceName)));
		monogr.appendChild(conferenceName);
	}

	// itemTypes in Database do unfortunately not match fields
	// of item
	if (item.series || item.seriesTitle) {
		series = teiDoc.createElementNS(ns.tei, "series");
		bibl.appendChild(series);

		if (item.series) {
			var title = teiDoc.createElementNS(ns.tei, "title");
			title.setAttribute("level", "s");
			title.appendChild(teiDoc.createTextNode(replaceFormatting(item.series)));
			series.appendChild(title);
		}
		if (item.seriesTitle) {
			var seriesTitle = teiDoc.createElementNS(ns.tei, "title");
			seriesTitle.setAttribute("level", "s");
			seriesTitle.setAttribute("type", "alternative");
			seriesTitle.appendChild(teiDoc.createTextNode(replaceFormatting(item.seriesTitle)));
			series.appendChild(seriesTitle);
		}
		if (item.seriesText) {
			var seriesText = teiDoc.createElementNS(ns.tei, "note");
			seriesText.setAttribute("type", "description");
			seriesText.appendChild(teiDoc.createTextNode(item.seriesText));
			series.appendChild(seriesText);
		}
		if (item.seriesNumber) {
			var seriesNumber = teiDoc.createElementNS(ns.tei, "biblScope");
			seriesNumber.setAttribute("unit", "volume");
			seriesNumber.appendChild(teiDoc.createTextNode(item.seriesNumber));
			series.appendChild(seriesNumber);
		}
	}


	//Other canonical ref nos come right after the title(s) in monogr.
	if (item.ISBN) {
		var idno = teiDoc.createElementNS(ns.tei, "idno");
		idno.setAttribute("type", "ISBN");
		idno.appendChild(teiDoc.createTextNode(item.ISBN));
		monogr.appendChild(idno);
	}
	if (item.ISSN) {
		var idno = teiDoc.createElementNS(ns.tei, "idno");
		idno.setAttribute("type", "ISSN");
		idno.appendChild(teiDoc.createTextNode(item.ISSN));
		monogr.appendChild(idno);
	}

	if (item.callNumber) {
		var idno = teiDoc.createElementNS(ns.tei, "idno");
		idno.setAttribute("type", "callNumber");
		idno.appendChild(teiDoc.createTextNode(item.callNumber));
		monogr.appendChild(idno);
	}

	// creators are all people only remotely involved into the creation of
	// a resource
	for (let creator of item.creators) {
		var role = '';
		var curCreator = '';
		var curRespStmt = null;
		var type = creator.creatorType;
		if (type == "author") {
			curCreator = teiDoc.createElementNS(ns.tei, "author");
		} else if (type == "editor") {
			curCreator = teiDoc.createElementNS(ns.tei, "editor");
		} else if (type == "seriesEditor") {
			curCreator = teiDoc.createElementNS(ns.tei, "editor");
		} else if (type == "bookAuthor") {
			curCreator = teiDoc.createElementNS(ns.tei, "author");
		} else {
			curRespStmt = teiDoc.createElementNS(ns.tei, "respStmt");
			var resp = teiDoc.createElementNS(ns.tei, "resp");
			resp.appendChild(teiDoc.createTextNode(type));
			curRespStmt.appendChild(resp);
			curCreator = teiDoc.createElementNS(ns.tei, "persName");
			curRespStmt.appendChild(curCreator);
		}
		// add the names of a particular creator
		if (creator.firstName) {
			var forename = teiDoc.createElementNS(ns.tei, "forename");
			forename.appendChild(teiDoc.createTextNode(creator.firstName));
			curCreator.appendChild(forename);
		}
		if (creator.lastName) {
			var surname = null;
			if (creator.firstName) {
				surname = teiDoc.createElementNS(ns.tei, "surname");
			} else {
				surname = teiDoc.createElementNS(ns.tei, "name");
			}
			surname.appendChild(teiDoc.createTextNode(creator.lastName));
			curCreator.appendChild(surname);
		}
		if (creator.name) {
			let name = teiDoc.createElementNS(ns.tei, "name");
			name.appendChild(teiDoc.createTextNode(creator.name));
			curCreator.appendChild(name);
		}
		// make sure the right thing gets added
		if (curRespStmt) {
			curCreator = curRespStmt;
		}

		//decide where the creator shall appear
		if (type == "seriesEditor" && series) {
			series.appendChild(curCreator);
		} else if (isAnalytic && (type != 'editor' && type != 'bookAuthor')) {
			// assuming that only authors go here
			analytic.appendChild(curCreator);
		} else {
			monogr.appendChild(curCreator);
		}
	}

	if (item.edition) {
		var edition = teiDoc.createElementNS(ns.tei, "edition");
		edition.appendChild(teiDoc.createTextNode(item.edition));
		monogr.appendChild(edition);
	}
	// software
	else if (item.versionNumber) {
		var edition = teiDoc.createElementNS(ns.tei, "edition");
		edition.appendChild(teiDoc.createTextNode(item.versionNumber));
		monogr.appendChild(edition);
	}


	//create the imprint
	var imprint = teiDoc.createElementNS(ns.tei, "imprint");
	monogr.appendChild(imprint);

	if (item.place) {
		var pubPlace = teiDoc.createElementNS(ns.tei, "pubPlace");
		pubPlace.appendChild(teiDoc.createTextNode(item.place));
		imprint.appendChild(pubPlace);
	}
	if (item.volume) {
		var volume = teiDoc.createElementNS(ns.tei, "biblScope");
		volume.setAttribute("unit", "volume");
		volume.appendChild(teiDoc.createTextNode(item.volume));
		imprint.appendChild(volume);
	}
	if (item.issue) {
		var issue = teiDoc.createElementNS(ns.tei, "biblScope");
		issue.setAttribute("unit", "issue");
		issue.appendChild(teiDoc.createTextNode(item.issue));
		imprint.appendChild(issue);
	}
	if (item.section) {
		var section = teiDoc.createElementNS(ns.tei, "biblScope");
		section.setAttribute("unit", "chapter");
		section.appendChild(teiDoc.createTextNode(item.section));
		imprint.appendChild(section);
	}
	if (item.pages) {
		var pages = teiDoc.createElementNS(ns.tei, "biblScope");
		pages.setAttribute("unit", "page");
		pages.appendChild(teiDoc.createTextNode(item.pages));
		imprint.appendChild(pages);
	}
	if (item.publisher) {
		var publisher = teiDoc.createElementNS(ns.tei, "publisher");
		publisher.appendChild(teiDoc.createTextNode(item.publisher));
		imprint.appendChild(publisher);
	}
	if (item.date) {
		var date = Zotero.Utilities.strToDate(item.date);
		var imprintDate = teiDoc.createElementNS(ns.tei, "date");
		if (date.year) {
			imprintDate.appendChild(teiDoc.createTextNode(date.year));
		} else {
			imprintDate.appendChild(teiDoc.createTextNode(item.date));
		}
		imprint.appendChild(imprintDate);
	}

	// If no date exists, add an empty date node so that spec minimum requirement for one imprint element is met
	else {
		var date = teiDoc.createElementNS(ns.tei, "date");
		imprint.appendChild(date);
		}
		
	if (item.accessDate) {
		var note = teiDoc.createElementNS(ns.tei, "note");
		note.setAttribute("type", "accessed");
		note.appendChild(teiDoc.createTextNode(item.accessDate));
		imprint.appendChild(note);
	}
	if (item.url) {
		var note = teiDoc.createElementNS(ns.tei, "note");
		note.setAttribute("type", "url");
		note.appendChild(teiDoc.createTextNode(item.url));
		imprint.appendChild(note);
	}
	if (item.thesisType) {
		var note = teiDoc.createElementNS(ns.tei, "note");
		note.setAttribute("type", "thesisType");
		note.appendChild(teiDoc.createTextNode(item.thesisType));
		imprint.appendChild(note);
	}

	//export notes
	if (item.notes && Zotero.getOption("exportNotes")) {
		for (let singleNote of item.notes) {
			// do only some basic cleaning of the html
			// strip HTML tags
			var noteText = Zotero.Utilities.cleanTags(singleNote.note);
			// unescape remaining entities -> no double escapes
			noteText = Zotero.Utilities.unescapeHTML(noteText);
			var note = teiDoc.createElementNS(ns.tei, "note");
			note.appendChild(teiDoc.createTextNode(noteText));
			bibl.appendChild(note);
		}
	}

	//export tags, if available
	if (Zotero.getOption("Export Tags") && item.tags && item.tags.length > 0) {
		var tags = teiDoc.createElementNS(ns.tei, "note");
		tags.setAttribute("type", "tags");
		for (let singleTag of item.tags) {
			var tag = teiDoc.createElementNS(ns.tei, "note");
			tag.setAttribute("type", "tag");
			tag.appendChild(teiDoc.createTextNode(singleTag.tag));
			tags.appendChild(tag);
		}
		bibl.appendChild(tags);
	}
	return bibl;
}

function generateCollection(collection, teiDoc) {
	var listBibl;
	var children = collection.children ? collection.children : collection.descendents;


	if (children.length > 0) {
		listBibl = teiDoc.createElementNS(ns.tei, "listBibl");
		var colHead = teiDoc.createElementNS(ns.tei, "head");
		colHead.appendChild(teiDoc.createTextNode(collection.name));
		listBibl.appendChild(colHead);
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.type == "collection") {
				listBibl.appendChild(generateCollection(child, teiDoc));
			} else if (allItems[child.id]) {
				listBibl.appendChild(generateItem(allItems[child.id], teiDoc));
			}
		}
	}
	return listBibl;
}

function generateTEIDocument(listBibls, teiDoc) {
	var text = teiDoc.createElementNS(ns.tei, "text");
	var body = teiDoc.createElementNS(ns.tei, "body");
	teiDoc.documentElement.appendChild(text);
	text.appendChild(body);
	for (var i = 0; i < listBibls.length; i++) {
		body.appendChild(listBibls[i]);
	}
	return teiDoc;
}

function doExport() {
	Zotero.debug("starting TEI-XML export");
	Zotero.setCharacterSet("utf-8");
	Zotero.debug("TEI-XML Exporting items");


	// Initialize XML Doc
	var parser = new DOMParser();
	var teiDoc = // <TEI/>
		parser.parseFromString('<TEI xmlns="http://www.tei-c.org/ns/1.0"><teiHeader><fileDesc><titleStmt><title>Exported from Zotero</title></titleStmt><publicationStmt><p>unpublished</p></publicationStmt><sourceDesc><p>Generated from Zotero database</p></sourceDesc></fileDesc></teiHeader></TEI>', 'application/xml');

	var item = null;
	while (item = Zotero.nextItem()) {
		allItems[item.uri] = item;
	}


	var collection = Zotero.nextCollection();
	var listBibls = new Array();
	if (Zotero.getOption("Export Collections") && collection) {
		var curListBibl = generateCollection(collection, teiDoc);
		if (curListBibl) {
			listBibls.push(curListBibl);
		}
		while (collection = Zotero.nextCollection()) {
			curListBibl = generateCollection(collection, teiDoc);
			if (curListBibl) {
				listBibls.push(curListBibl);
			}
		}
	} else {
		var listBibl = teiDoc.createElementNS(ns.tei, "listBibl");
		for (var i in allItems) {
			var item = allItems[i];
			//skip attachments
			if (item.itemType == "attachment") {
				continue;
			}
			listBibl.appendChild(generateItem(item, teiDoc));
		}
		listBibls.push(listBibl);
	}



	var outputElement;

	if (Zotero.getOption("Full TEI Document")) {
		outputElement = generateTEIDocument(listBibls, teiDoc);
	} else {
		if (listBibls.length > 1) {
			outputElement = teiDoc.createElementNS(ns.tei, "listBibl");
			for (var i = 0; i < listBibls.length; i++) {
				outputElement.appendChild(listBibls[i]);
			}
		} else if (listBibls.length == 1) {
			outputElement = listBibls[0];
		} else {
			outputElement = teiDoc.createElement("empty");
		}
	}

	// write to file.
	Zotero.write('<?xml version="1.0" encoding="UTF-8"?>' + "\n");
	var serializer = new XMLSerializer();
	Zotero.write(serializer.serializeToString(outputElement));
}
