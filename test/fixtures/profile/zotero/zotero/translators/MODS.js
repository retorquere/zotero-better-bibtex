{
	"translatorID": "0e2235e7-babf-413c-9acf-f27cce5f059c",
	"label": "MODS",
	"creator": "Simon Kornblith and Richard Karnesky",
	"target": "xml",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 50,
	"configOptions": {
		"dataMode": "xml/dom"
	},
	"displayOptions": {
		"exportNotes": true
	},
	"inRepository": true,
	"translatorType": 3,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-05-20 09:05:38"
}


/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2019 Simon Kornblith and Richard Karnesky

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

var fromMarcGenre = {
//		"abstract or summary":XXX,
//		"abstract":XXX,
//		"summary":XXX,
	"art reproduction": "artwork",
	article: "journalArticle",
	autobiography: "book",
	bibliography: "book",
	biography: "book",
	book: "book",
	//		"calendar":XXX,
	//		"catalog":XXX,
	chart: "artwork",
	"comic or graphic novel": "book",
	comic: "book",
	"graphic novel": "book",
	"comic strip": "artwork",
	"conference publication": "conferencePaper",
	//		"database":XXX,
	dictionary: "dictionaryEntry",
	diorama: "artwork",
	//		"directory":XXX,
	drama: "book",
	encyclopedia: "encyclopediaArticle",
	//		"essay":XXX,
	festschrift: "book",
	fiction: "book",
	//		"filmography":XXX,
	filmstrip: "videoRecording",
	//		"findingaid":XXX,
	//		"flash card":XXX,
	folktale: "book",
	//		"font":XXX,
	//		"game":XXX,
	"government publication": "book",
	graphic: "artwork",
	globe: "map",
	handbook: "book",
	history: "book",
	hymnal: "book",
	"humor,satire": "book",
	humor: "book",
	satire: "book",
	//		"index":XXX,
	//		"instruction":XXX,
	//		"interview":XXX,
	//		"issue":XXX,
	journal: "journalArticle",
	kit: "artwork",
	//		"language instruction":XXX,
	"law report or digest": "journalArticle",
	"law report": "journalArticle",
	digest: "journalArticle",
	"law digest": "journalArticle",
	"legal article": "journalArticle",
	"legal case and case notes": "case",
	"legal case": "case",
	"case notes": "case",
	legislation: "statute",
	"loose-leaf": "manuscript",
	map: "map",
	memoir: "book",
	"microscope slide": "artwork",
	model: "artwork",
	//		"multivolume monograph":XXX,
	novel: "book",
	//		"numeric data":XXX,
	//		"offprint":XXX,
	"online system or service": "webpage",
	"online system": "webpage",
	service: "webpage",
	"online service": "webpage",
	patent: "patent",
	periodical: "journalArticle",
	picture: "artwork",
	//		"poetry":XXX,
	//		"programmed text":XXX,
	realia: "artwork",
	//		"rehearsal":XXX,
	//		"remote sensing image":XXX,
	//		"reporting":XXX,
	//		"review":XXX,
	script: "book",
	//		"series":XXX,
	//		"short story":XXX,
	slide: "artwork",
	sound: "audioRecording",
	speech: "audioRecording",
	"standard or specification": "report",
	standard: "report",
	//		"specification":XXX,
	//		"statistics":XXX,
	//		"survey of literature":XXX,
	"technical report": "report",
	newspaper: "newspaperArticle",
	theses: "thesis",
	thesis: "thesis",
	//		"toy":XXX,
	transparency: "artwork",
	//		"treaty":XXX,
	videorecording: "videoRecording",
	letter: "letter",
	"motion picture": "film",
	"art original": "artwork",
	"web site": "webpage",
	yearbook: "book"
};

var toMarcGenre = {
	artwork: "art original",
	audioRecording: "sound",
	bill: "legislation",
	blogPost: "web site",
	book: "book",
	bookSection: "book",
	case: "legal case and case notes",
	// "computerProgram":XXX,
	conferencePaper: "conference publication",
	dictionaryEntry: "dictionary",
	// "document":XXX,
	email: "letter",
	encyclopediaArticle: "encyclopedia",
	film: "motion picture",
	forumPost: "web site",
	// "hearing":XXX,
	instantMessage: "letter",
	interview: "interview",
	journalArticle: "journal",
	letter: "letter",
	magazineArticle: "periodical",
	// "manuscript":XXX,
	map: "map",
	newspaperArticle: "newspaper",
	patent: "patent",
	podcast: "speech",
	// "presentation":XXX,
	radioBroadcast: "sound",
	report: "technical report",
	statute: "legislation",
	thesis: "thesis",
	// "tvBroadcast":XXX,
	videoRecording: "videorecording",
	webpage: "web site"
};

var dctGenres = {
	// "collection":XXX,
	// "dataset":XXX,
	// "event":XXX,
	image: "artwork",
	interactiveresource: "webpage",
	// "model":XXX,
	movingimage: "videoRecording",
	// "physical object":XXX,
	// "place":XXX,
	// "resource":XXX,
	// "service":XXX,
	software: "computerProgram",
	sound: "audioRecording",
	stillimage: "artwork"
	// "text":XXX
};

var fromTypeOfResource = {
	// "text":XXX,
	cartographic: "map",
	// "notated music":XXX,
	"sound recording-musical": "audioRecording",
	"sound recording-nonmusical": "audioRecording",
	"sound recording": "audioRecording",
	"still image": "artwork",
	"moving image": "videoRecording",
	// "three dimensional object":XXX,
	"software, multimedia": "computerProgram"
};

var toTypeOfResource = {
	artwork: "still image",
	audioRecording: "sound recording",
	bill: "text",
	blogPost: "software, multimedia",
	book: "text",
	bookSection: "text",
	case: "text",
	computerProgram: "software, multimedia",
	conferencePaper: "text",
	dictionaryEntry: "text",
	document: "text",
	email: "text",
	encyclopediaArticle: "text",
	film: "moving image",
	forumPost: "text",
	hearing: "text",
	instantMessage: "text",
	interview: "text",
	journalArticle: "text",
	letter: "text",
	magazineArticle: "text",
	manuscript: "text",
	map: "cartographic",
	newspaperArticle: "text",
	patent: "text",
	podcast: "sound recording-nonmusical",
	presentation: "mixed material",
	radioBroadcast: "sound recording-nonmusical",
	report: "text",
	statute: "text",
	thesis: "text",
	tvBroadcast: "moving image",
	videoRecording: "moving image",
	webpage: "software, multimedia"
};

var modsTypeRegex = {
//	'artwork':
//	'audioRecording': /\bmusic/i,
//	'bill':
	blogPost: /\bblog/i,
	//	'book':
	//	'bookSection':
	//	'case':
	//	'computerProgram':
	//	'conferencePaper':
	//	'dictionaryEntry':
	//	'email':
	//	'encyclopediaArticle':
	//	'film':
	//	'forumPost':
	//	'hearing':
	//	'instantMessage':
	//	'interview':
	journalArticle: /journal\s*article/i,
	//	'letter':
	magazineArticle: /magazine\s*article/i,
	//	'manuscript':
	//	'map':
	newspaperArticle: /newspaper\*article/i
//	'patent':
//	'podcast':
//	'presentation':
//	'radioBroadcast':
//	'report':
//	'statute':
//	'thesis':
//	'tvBroadcast':
//	'videoRecording':
//	'webpage':
};

var modsInternetMediaTypes = {
	// a ton of types listed at http://www.iana.org/assignments/media-types/index.html
	'text/html': 'webpage'
};

var marcRelators = {
	aut: "author",
	edt: "editor",
	ctb: "contributor",
	pbd: "seriesEditor",
	trl: "translator"
};

// Item types that are part of a larger work
var partialItemTypes = ["blogPost",
	"bookSection",
	"conferencePaper",
	"dictionaryEntry",
	"encyclopediaArticle",
	"forumPost",
	"journalArticle",
	"magazineArticle",
	"newspaperArticle",
	"webpage"];

// Namespace array for using ZU.xpath
var ns = "http://www.loc.gov/mods/v3",
	xns = { m: ns };

function detectImport() {
	let doc;
	try {
		doc = Zotero.getXML().documentElement;
	}
	catch (err) {
		// most likely just not XML
		return false;
	}

	if (!doc) {
		return false;
	}
	return doc.namespaceURI === "http://www.loc.gov/mods/v3" && (doc.tagName === "modsCollection" || doc.tagName === "mods");
}

/**
 * If property is defined, this function adds an appropriate XML element as a child of
 * parentElement.
 * @param {Element} parentElement The parent of the new element to be created.
 * @param {String} elementName The name of the new element to be created.
 * @param {Any} property The property to inspect. If this property is defined and not
 *     null, false, or empty, a new element is created whose textContent is its value.
 * @param {Object} [attributes] If defined, this object defines attributes to be added
 *     to the new element.
 */
function mapProperty(parentElement, elementName, property, attributes) {
	if (!property && property !== 0) return null;
	var doc = parentElement.ownerDocument,
		newElement = doc.createElementNS(ns, elementName);
	if (attributes) {
		for (let i in attributes) {
			newElement.setAttribute(i, attributes[i]);
		}
	}
	newElement.appendChild(doc.createTextNode(property));
	parentElement.appendChild(newElement);
	return newElement;
}

function doExport() {
	Zotero.setCharacterSet("utf-8");
	var parser = new DOMParser();
	var doc = parser.parseFromString('<modsCollection xmlns="http://www.loc.gov/mods/v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-2.xsd" />', 'application/xml');
	
	var item;
	let titleInfo;
	while (item = Zotero.nextItem()) { // eslint-disable-line no-cond-assign
		// Don't export notes or standalone attachments
		if (item.itemType === "note" || item.itemType === "attachment") continue;
		
		var mods = doc.createElementNS(ns, "mods"),
			isPartialItem = partialItemTypes.includes(item.itemType),
			recordInfo = doc.createElementNS(ns, "recordInfo"),
			host = doc.createElementNS(ns, "relatedItem"),
			series = doc.createElementNS(ns, "relatedItem"),
			topOrHost = (isPartialItem ? host : mods);
		
		/** CORE FIELDS **/
		
		// XML tag titleInfo; object field title
		if (item.title) {
			titleInfo = doc.createElementNS(ns, "titleInfo");
			mapProperty(titleInfo, "title", item.title);
			mods.appendChild(titleInfo);
		}
		
		if (item.shortTitle) {
			titleInfo = doc.createElementNS(ns, "titleInfo");
			titleInfo.setAttribute("type", "abbreviated");
			mapProperty(titleInfo, "title", item.shortTitle);
			mods.appendChild(titleInfo);
		}
		
		// XML tag typeOfResource/genre; object field type
		mapProperty(mods, "typeOfResource", toTypeOfResource[item.itemType]);
		mapProperty(mods, "genre", item.itemType, { authority: "local" });
		mapProperty(topOrHost, "genre", toMarcGenre[item.itemType], { authority: "marcgt" });
		
		// XML tag genre; object field thesisType, type
		if (item.thesisType) {
			mapProperty(mods, "genre", item.thesisType);
		}
		else if (item.type) {
			mapProperty(mods, "genre", item.type);
		}
		
		// XML tag name; object field creators
		for (let j = 0; j < item.creators.length; j++) {
			var creator = item.creators[j],
				roleTerm = "";
			if (creator.creatorType == "author") {
				roleTerm = "aut";
			}
			else if (creator.creatorType == "editor") {
				roleTerm = "edt";
			}
			else if (creator.creatorType == "translator") {
				roleTerm = "trl";
			}
			else if (creator.creatorType == "seriesEditor") {
				roleTerm = "pbd";
			}
			else {
				roleTerm = "ctb";
			}

			const name = doc.createElementNS(ns, "name");
			
			if (creator.fieldMode == 1) {
				name.setAttribute("type", "corporate");
				
				mapProperty(name, "namePart", creator.lastName);
			}
			else {
				name.setAttribute("type", "personal");
				
				mapProperty(name, "namePart", creator.lastName, { type: "family" });
				mapProperty(name, "namePart", creator.firstName, { type: "given" });
			}
			
			var role = doc.createElementNS(ns, "role");
			mapProperty(role, "roleTerm", roleTerm,
				{ type: "code", authority: "marcrelator" });
			name.appendChild(role);
			
			var creatorParent = (creator.creatorType === "seriesEditor")
				? series
				: ((creator.creatorType === "editor") ? topOrHost : mods);
			creatorParent.appendChild(name);
		}
		
		// XML tag recordInfo.recordOrigin; used to store our generator note
		// mods.recordInfo.recordOrigin = "Zotero for Firefox "+Zotero.Utilities.getVersion();
		
		/** FIELDS ON NEARLY EVERYTHING BUT NOT A PART OF THE CORE **/
		
		// XML tag recordInfo.recordContentSource; object field source
		mapProperty(recordInfo, "recordContentSource", item.libraryCatalog);
		
		// XML tag accessCondition; object field rights
		mapProperty(mods, "accessCondition", item.rights);
		
		/** SUPPLEMENTAL FIELDS **/
		
		var part = doc.createElementNS(ns, "part");
		
		// XML tag detail; object field volume
		const details = ["volume", "issue", "section"];
		for (let i = 0; i < details.length; i++) {
			if (item[details[i]] || item[details[i]] === 0) {
				const detail = doc.createElementNS(ns, "detail"),
					number = doc.createElementNS(ns, "number");
				detail.setAttribute("type", details[i]);
				number.appendChild(doc.createTextNode(item[details[i]]));
				detail.appendChild(number);
				part.appendChild(detail);
			}
		}
		
		// XML tag detail; object field pages
		if (item.pages) {
			var extent = doc.createElementNS(ns, "extent");
			extent.setAttribute("unit", "pages");
			if (item.pages.search(/^\d+[-–]\d+$/) != -1) {
				var range = ZU.getPageRange(item.pages);
				mapProperty(extent, "start", range[0]);
				mapProperty(extent, "end", range[1]);
			}
			else {
				extent.setAttribute("unit", "pages");
				mapProperty(extent, "list", item.pages);
			}
			part.appendChild(extent);
		}
		
		// Assign part if something was assigned
		if (part.hasChildNodes()) {
			// For a journal article, bookSection, etc., the part is the host
			topOrHost.appendChild(part);
		}
		
		var originInfo = doc.createElementNS(ns, "originInfo");
		
		// XML tag originInfo; object fields edition, place, publisher, year, date
		mapProperty(originInfo, "edition", item.edition);
		if (item.place) {
			var place = doc.createElementNS(ns, "place"),
				placeTerm = doc.createElementNS(ns, "placeTerm");
			placeTerm.setAttribute("type", "text");
			placeTerm.appendChild(doc.createTextNode(item.place));
			place.appendChild(placeTerm);
			originInfo.appendChild(place);
		}
		if (item.publisher) {
			mapProperty(originInfo, "publisher", item.publisher);
		}
		else if (item.distributor) {
			mapProperty(originInfo, "distributor", item.publisher);
		}
		if (item.date) {
			let dateType;
			if (["book", "bookSection"].includes(item.itemType)) {
				// Assume year is copyright date
				dateType = "copyrightDate";
			}
			else if (["journalArticle", "magazineArticle", "newspaperArticle"].includes(item.itemType)) {
				// Assume date is date issued
				dateType = "dateIssued";
			}
			else {
				// Assume date is date created
				dateType = "dateCreated";
			}
			mapProperty(originInfo, dateType, item.date);
		}

		if (item.numPages) {
			var physicalDescription = doc.createElementNS(ns, "physicalDescription");
			mapProperty(physicalDescription, "extent", item.numPages + " p.");
			mods.appendChild(physicalDescription);
		}

		if (isPartialItem) {
			// eXist Solutions points out that these types are more often
			// continuing than not & will use this internally.
			// Perhaps comment this out in the main distribution, though.
			if (["journalArticle", "magazineArticle", "newspaperArticle"].includes(item.itemType)) {
				mapProperty(originInfo, "issuance", "continuing");
			}
			else if (["bookSection",
				"conferencePaper",
				"dictionaryEntry",
				"encyclopediaArticle"].includes(item.itemType)) {
				mapProperty(originInfo, "issuance", "monographic");
			}
		}
		else {
			// eXist Solutions points out that most types are more often
			// monographic than not & will use this internally.
			// Perhaps comment this out in the main distribution, though.
			mapProperty(originInfo, "issuance", "monographic");
		}

		if (originInfo.hasChildNodes()) {
			// For a journal article, bookSection, etc., the part is the host
			topOrHost.appendChild(originInfo);
		}
		
		// XML tag identifier; object fields ISBN, ISSN
		mapProperty(topOrHost, "identifier", item.ISBN, { type: "isbn" });
		mapProperty(topOrHost, "identifier", item.ISSN, { type: "issn" });
		mapProperty(mods, "identifier", item.DOI, { type: "doi" });
		
		// XML tag relatedItem.name; object field conferenceName
		if (item.conferenceName) {
			const name = doc.createElementNS(ns, "name");
			name.setAttribute("type", "conference");
			mapProperty(name, "namePart", item.conferenceName);
		}
		
		// XML tag relatedItem.titleInfo; object field publication
		if (item.publicationTitle) {
			titleInfo = doc.createElementNS(ns, "titleInfo");
			mapProperty(titleInfo, "title", item.publicationTitle);
			host.appendChild(titleInfo);
		}
		
		// XML tag relatedItem.titleInfo; object field journalAbbreviation
		if (item.journalAbbreviation) {
			titleInfo = doc.createElementNS(ns, "titleInfo");
			titleInfo.setAttribute("type", "abbreviated");
			mapProperty(titleInfo, "title", item.journalAbbreviation);
			host.appendChild(titleInfo);
		}
		
		// XML tag classification; object field callNumber
		mapProperty(topOrHost, "classification", item.callNumber);

		// XML tag location.url; object field url
		if (item.url) {
			const location = doc.createElementNS(ns, "location");
			var url = mapProperty(location, "url", item.url, { usage: "primary display" });
			if (url && item.accessDate) url.setAttribute("dateLastAccessed", item.accessDate);
			mods.appendChild(location);
		}
				
		// XML tag location.physicalLocation; object field archiveLocation
		if (item.archiveLocation) {
			const location = doc.createElementNS(ns, "location");
			mapProperty(location, "physicalLocation", item.archiveLocation);
			topOrHost.appendChild(location);
		}
		
		// XML tag abstract; object field abstractNote
		mapProperty(mods, "abstract", item.abstractNote);
		
		// XML tag series/titleInfo; object field series, seriesTitle, seriesText, seriesNumber
		titleInfo = doc.createElementNS(ns, "titleInfo");
		mapProperty(titleInfo, "title", item.series);
		mapProperty(titleInfo, "title", item.seriesTitle);
		mapProperty(titleInfo, "subTitle", item.seriesText);
		if (titleInfo.hasChildNodes()) series.appendChild(titleInfo);
		
		if (item.seriesNumber) {
			const seriesPart = doc.createElementNS(ns, "part"),
				detail = doc.createElementNS(ns, "detail"),
				number = doc.createElementNS(ns, "number");
			detail.setAttribute("type", "volume");
			number.appendChild(doc.createTextNode(item.seriesNumber));
			detail.appendChild(number);
			seriesPart.appendChild(detail);
			series.appendChild(seriesPart);
		}
		
		/** NOTES **/
		
		if (Zotero.getOption("exportNotes")) {
			for (let j = 0; j < item.notes.length; j++) {
				mapProperty(mods, "note", item.notes[j].note);
			}
		}
		
		/** TAGS **/
		
		for (let j = 0; j < item.tags.length; j++) {
			var subject = doc.createElementNS(ns, "subject"),
				topic = doc.createElementNS(ns, "topic");
			topic.appendChild(doc.createTextNode(item.tags[j].tag));
			subject.appendChild(topic);
			mods.appendChild(subject);
		}

		/** LANGUAGE **/
		
		if (item.language) {
			var language = doc.createElementNS(ns, "language");
			mapProperty(language, "languageTerm", item.language, { type: "text" });
			mods.appendChild(language);
		}

		/** EXTRA->NOTE **/
		mapProperty(mods, "note", item.extra);
		
		if (recordInfo.hasChildNodes()) mods.appendChild(recordInfo);
		if (host.hasChildNodes()) {
			host.setAttribute("type", "host");
			mods.appendChild(host);
		}
		if (series.hasChildNodes()) {
			series.setAttribute("type", "series");
			topOrHost.appendChild(series);
		}
		doc.documentElement.appendChild(mods);
	}
	
	Zotero.write('<?xml version="1.0"?>\n');
	var serializer = new XMLSerializer();
	Zotero.write(serializer.serializeToString(doc));
}

function processTitleInfo(titleInfo) {
	var title = ZU.xpathText(titleInfo, "m:title[1]", xns).trim();
	var subtitle = ZU.xpathText(titleInfo, "m:subTitle[1]", xns);
	if (subtitle) title = title.replace(/:$/, '') + ": " + subtitle.trim();
	var nonSort = ZU.xpathText(titleInfo, "m:nonSort[1]", xns);
	if (nonSort) title = nonSort.trim() + " " + title;
	var partNumber = ZU.xpathText(titleInfo, "m:partNumber[1]", xns);
	var partName = ZU.xpathText(titleInfo, "m:partName[1]", xns);
	if (partNumber && partName) title = title.replace(/\.$/, '') + ". " + partNumber.trim() + ": " + partName.trim();
	else if (partNumber) title = title.replace(/\.$/, '') + ". " + partNumber.trim();
	else if (partName) title = title.replace(/\.$/, '') + ". " + partName.trim();
	return title;
}

function processTitle(contextElement) {
	// Try to find a titleInfo element with no type specified and a title element as a
	// child
	var titleElements = ZU.xpath(contextElement, "m:titleInfo[not(@type)][m:title][1]", xns);
	if (titleElements.length) return processTitleInfo(titleElements[0]);
	
	// That failed, so look for any titleInfo element without no type secified
	var title = ZU.xpathText(contextElement, "m:titleInfo[not(@type)][1]", xns);
	if (title) return title;
	
	// That failed, so just go for the first title
	return ZU.xpathText(contextElement, "m:titleInfo[1]", xns);
}

function processGenre(contextElement) {
	// Try to get itemType by treating local genre as Zotero item type
	var genre = ZU.xpath(contextElement, 'm:genre[@authority="local"]', xns);
	for (let i = 0; i < genre.length; i++) {
		const genreStr = genre[i].textContent;
		if (Zotero.Utilities.itemTypeExists(genreStr)) return genreStr;
	}
	
	// Try to get MARC genre and convert to an item type
	genre = ZU.xpath(contextElement, 'm:genre[@authority="marcgt"] | m:genre[@authority="marc"]', xns);
	for (let i = 0; i < genre.length; i++) {
		const genreStr = genre[i].textContent;
		if (fromMarcGenre[genreStr]) return fromMarcGenre[genreStr];
	}
	
	// Try to get DCT genre and convert to an item type
	genre = ZU.xpath(contextElement, 'm:genre[@authority="dct"]', xns);
	for (let i = 0; i < genre.length; i++) {
		const genreStr = genre[i].textContent.replace(/\s+/g, "");
		if (dctGenres[genreStr]) return dctGenres[genreStr];
	}
	
	// Try unlabeled genres
	genre = ZU.xpath(contextElement, 'm:genre', xns);
	for (let i = 0; i < genre.length; i++) {
		const genreStr = genre[i].textContent;
		
		// Zotero
		if (Zotero.Utilities.itemTypeExists(genreStr)) return genreStr;
		
		// MARC
		if (fromMarcGenre[genreStr]) return fromMarcGenre[genreStr];
		
		// DCT
		var dctGenreStr = genreStr.replace(/\s+/g, "");
		if (dctGenres[dctGenreStr]) return dctGenres[dctGenreStr];
		
		// Try regexps
		for (let type in modsTypeRegex) {
			if (modsTypeRegex[type].exec(genreStr)) return type;
		}
	}
	
	return undefined;
}

function processItemType(contextElement) {
	var type = processGenre(contextElement);
	if (type) return type;
	
	// Try to get type information from typeOfResource
	var typeOfResource = ZU.xpath(contextElement, 'm:typeOfResource', xns);
	for (let i = 0; i < typeOfResource.length; i++) {
		var typeOfResourceStr = typeOfResource[i].textContent.trim();
		
		// Try list
		if (fromTypeOfResource[typeOfResourceStr]) {
			return fromTypeOfResource[typeOfResourceStr];
		}
		
		// Try regexps
		for (let type in modsTypeRegex) {
			if (modsTypeRegex[type].exec(typeOfResourceStr)) return type;
		}
	}
	
	// Try to get genre data from host
	var hosts = ZU.xpath(contextElement, 'm:relatedItem[@type="host"]', xns);
	for (let i = 0; i < hosts.length; i++) {
		type = processGenre(hosts[i]);
		if (type) return type;
	}
		
	// Figure out if it's a periodical
	var periodical = ZU.xpath(contextElement,
		'm:relatedItem[@type="host"]/m:originInfo/m:issuance[text()="continuing" or text()="serial"]',
		xns).length;

	// Try physicalDescription/internetMediaType
	var internetMediaTypes = ZU.xpath(contextElement, 'm:physicalDescription/m:internetMediaType', xns);
	for (let i = 0; i < internetMediaTypes.length; i++) {
		var internetMediaTypeStr = internetMediaTypes[i].textContent.trim();
		if (modsInternetMediaTypes[internetMediaTypeStr]) {
			return modsInternetMediaTypes[internetMediaTypeStr];
		}
	}

	// As a last resort, if it has a host, let's set it to book chapter, so we can import
	// more info. Otherwise default to document
	if (hosts.length) {
		if (periodical) return 'journalArticle';
		return 'bookSection';
	}
	
	return "document";
}

function processCreator(name, itemType, defaultCreatorType) {
	var creator = {};
	creator.firstName = ZU.xpathText(name, 'm:namePart[@type="given"]', xns, " ") || undefined;
	creator.lastName = ZU.xpathText(name, 'm:namePart[@type="family"]', xns, " ");
	
	if (!creator.lastName) {
		var isPersonalName = name.getAttribute("type") === "personal",
			backupName = ZU.xpathText(name, 'm:namePart[not(@type="date")][not(@type="termsOfAddress")]', xns, (isPersonalName ? " " : ": "));
		
		if (!backupName) return null;
		
		if (isPersonalName) {
			creator = ZU.cleanAuthor(backupName.replace(/[[(][^A-Za-z]*[\])]/g, ''),
				"author", true);
			delete creator.creatorType;
		}
		else {
			creator.lastName = ZU.trimInternal(backupName);
			creator.fieldMode = 1;
		}
	}
	
	if (!creator.lastName) return null;

	// Look for roles
	let roles = ZU.xpath(name, 'm:role/m:roleTerm[@type="text" or not(@type)]', xns);
	var validCreatorsForItemType = ZU.getCreatorsForType(itemType);
	for (let i = 0; i < roles.length; i++) {
		const roleStr = roles[i].textContent.toLowerCase();
		if (validCreatorsForItemType.includes(roleStr)) {
			creator.creatorType = roleStr;
		}
	}
	
	if (!creator.creatorType) {
		// Look for MARC roles
		roles = ZU.xpath(name, 'm:role/m:roleTerm[@type="code"][@authority="marcrelator"]', xns);
		for (let i = 0; i < roles.length; i++) {
			const roleStr = roles[i].textContent.toLowerCase();
			if (marcRelators[roleStr]) creator.creatorType = marcRelators[roleStr];
		}
		
		// Default to author
		if (!creator.creatorType) creator.creatorType = defaultCreatorType;
	}

	return creator;
}

function processCreators(contextElement, newItem, defaultCreatorType) {
	var names = ZU.xpath(contextElement, 'm:name', xns);
	for (let i = 0; i < names.length; i++) {
		var creator = processCreator(names[i], newItem.itemType, defaultCreatorType);
		if (creator) newItem.creators.push(creator);
	}
}

function processExtent(extent, newItem) {
	// try to parse extent according to
	// http://www.loc.gov/standards/mods/v3/mods-userguide-elements.html#extent
	// i.e. http://www.loc.gov/marc/bibliographic/bd300.html
	// and http://www.loc.gov/marc/bibliographic/bd306.html
	var extentRe = new RegExp(
		'^(.*?)(?=(?:[:;]|$))'	// extent [1]
		+ '(?::.*?(?=(?:;|$)))?'	// other physical details
		+ '(?:;(.*))?'				// dimensions [2]
		+ '$'							// make sure to capture the rest of the line
	);

	var ma = extentRe.exec(extent);
	if (ma && ma[1]) {
		// drop supplemental info (i.e. everything after +)
		if (ma[1].includes('+')) {
			ma[1] = ma[1].slice(0, ma[1].indexOf('+'));
		}

		// pages
		if (!newItem.pages && ZU.fieldIsValidForType('pages', newItem.itemType)) {
			const pages = ma[1].match(/\bp(?:ages?)?\.?\s+([a-z]?\d+(?:\s*-\s*[a-z]?\d+))/i);
			if (pages) {
				newItem.pages = pages[1].replace(/\s+/, '');
			}
		}

		// volume
		if (!newItem.volume && ZU.fieldIsValidForType('volume', newItem.itemType)) {
			var volume = ma[1].match(/\bv(?:ol(?:ume)?)?\.?\s+(\d+)/i);
			if (volume) {
				newItem.volume = volume[1];
			}
		}

		// issue
		if (!newItem.issue && ZU.fieldIsValidForType('issue', newItem.itemType)) {
			var issue = ma[1].match(/\b(?:no?|iss(?:ue)?)\.?\s+(\d+)/i);
			if (issue) {
				newItem.issue = issue[1];
			}
		}

		// numPages
		if (!newItem.numPages && ZU.fieldIsValidForType('numPages', newItem.itemType)) {
			const pages = ma[1].match(/(\d+)\s*p(?:ages?)?\b/i);
			if (pages) {
				newItem.numPages = pages[1];
			}
		}

		// numberOfVolumes
		if (!newItem.numberOfVolumes && ZU.fieldIsValidForType('numberOfVolumes', newItem.itemType)) {
			// includes volumes, scores, sound (discs, but I think there could be others)
			// video (cassette, but could have others)
			var nVol = ma[1].match(/(\d+)\s+(?:v(?:olumes?)?|scores?|sound|video)\b/i);
			if (nVol) {
				newItem.numberOfVolumes = nVol[1];
			}
		}

		// runningTime
		if (!newItem.runningTime && ZU.fieldIsValidForType('runningTime', newItem.itemType)) {
			// several possible formats:
			var rt;
			// 002016 = 20 min., 16 sec.
			if (rt = ma[1].match(/\b(\d{2,3})(\d{2})(\d{2})\b/)) { // eslint-disable-line no-cond-assign
				newItem.runningTime = rt[1] + ':' + rt[2] + ':' + rt[3];
			// (ca. 124 min.)
			}
			// eslint-disable-next-line no-cond-assign
			else if (rt = ma[1].match(/((\d+)\s*((?:hours?|hrs?)|(?:minutes?|mins?)|(?:seconds?|secs?))\.?\s+)?((\d+)\s*((?:hours?|hrs?)|(?:minutes?|mins?)|(?:seconds?|secs?))\.?\s+)?((\d+)\s*((?:hours?|hrs?)|(?:minutes?|mins?)|(?:seconds?|secs?))\.?)/i)) {
				var hrs = 0, mins = 0, secs = 0;
				for (let i = 2; i < 7; i += 2) {
					if (!rt[i]) continue;

					switch (rt[i].charAt(0).toLowerCase()) {
					case 'h':
						hrs = rt[i - 1];
						break;
					case 'm':
						mins = rt[i - 1];
						break;
					case 's':
						secs = rt[i - 1];
						break;
					}
				}

				if (secs > 59) {
					mins += secs / 60;
					secs %= 60;
				}
				if (secs < 10) {
					secs = '0' + secs;
				}

				if (mins > 59) {
					hrs += hrs / 60;
					mins %= 60;
				}
				if (mins < 10) {
					mins = '0' + mins;
				}

				newItem.runningTime = ((hrs * 1) ? hrs + ':' : '') + mins + ':' + secs;
			// (46:00)
			}
			else if (rt = ma[1].match(/\b(\d{0,3}:\d{1,2}:\d{2})\b/)) { // eslint-disable-line no-cond-assign
				newItem.runningTime = rt[1];
			}
		}
	}

	// dimensions: artworkSize
	// only part of artwork right now, but maybe will be in other types in the future
	if (!newItem.artworkSize && ma && ma[2] && ZU.fieldIsValidForType('artworkSize', newItem.itemType)) {
		// drop supplemental info (i.e. everything after +)
		if (ma[2].includes('+')) {
			ma[2] = ma[2].slice(0, ma[2].indexOf('+'));
		}
		// 26 cm. or 33 x 15 cm. or 1/2 in. or 1 1/2 x 15/16 in.
		var dim = ma[2].match(/(?:(?:(?:\d+\s+)?\d+\/)?\d+\s*x\s*)?(?:(?:\d+\s+)?\d+\/)?\d+\s*(?:cm|mm|m|in|ft)\./i);
		if (dim) newItem.artworkSize = dim[0];
	}
}

function processIdentifiers(contextElement, newItem) {
	var isbnNodes = ZU.xpath(contextElement, './/m:identifier[@type="isbn"]', xns),
		isbns = [];
	for (let i = 0; i < isbnNodes.length; i++) {
		const m = isbnNodes[i].textContent.replace(/\s*-\s*/g, '').match(/(?:[\dX]{10}|\d{13})/i);
		if (m) isbns.push(m[0]);
	}
	if (isbns.length) newItem.ISBN = isbns.join(", ");
	
	var issnNodes = ZU.xpath(contextElement, './/m:identifier[@type="issn"]', xns),
		issns = [];
	for (let i = 0; i < issnNodes.length; i++) {
		const m = issnNodes[i].textContent.match(/\b\d{4}\s*-?\s*\d{4}\b/i);
		if (m) issns.push(m[0]);
	}
	if (issns.length) newItem.ISSN = issns.join(", ");
	
	newItem.DOI = ZU.xpathText(contextElement, 'm:identifier[@type="doi"]', xns);
}

function getFirstResult(contextNode, xpaths) {
	for (let i = 0; i < xpaths.length; i++) {
		var results = ZU.xpath(contextNode, xpaths[i], xns);
		if (results.length) return results[0].textContent;
	}
	return null;
}

function doImport() {
	var xml = Zotero.getXML();
	
	var modsElements = ZU.xpath(xml, "/m:mods | /m:modsCollection/m:mods", xns);
	
	for (let iModsElements = 0, nModsElements = modsElements.length;
		iModsElements < nModsElements; iModsElements++) {
		var modsElement = modsElements[iModsElements],
			newItem = new Zotero.Item();
		
		// title
		newItem.title = processTitle(modsElement);
		
		// shortTitle
		var abbreviatedTitle = ZU.xpath(modsElement, 'm:titleInfo[@type="abbreviated"]', xns);
		if (abbreviatedTitle.length) {
			newItem.shortTitle = processTitleInfo(abbreviatedTitle[0]);
		}
		
		// itemType
		newItem.itemType = processItemType(modsElement);
		
		// TODO: thesisType, type
		
		// creators
		processCreators(modsElement, newItem, "author");
		// source
		newItem.source = ZU.xpathText(modsElement, 'm:recordInfo/m:recordContentSource', xns);
		// accessionNumber
		newItem.accessionNumber = ZU.xpathText(modsElement, 'm:recordInfo/m:recordIdentifier', xns);
		// rights
		newItem.rights = ZU.xpathText(modsElement, 'm:accessCondition', xns);
		
		/** SUPPLEMENTAL FIELDS **/
		
		var part = [], originInfo = [];
		
		// host
		var hostNodes = ZU.xpath(modsElement, 'm:relatedItem[@type="host"]', xns);
		for (let i = 0; i < hostNodes.length; i++) {
			var host = hostNodes[i];
			
			// publicationTitle
			if (!newItem.publicationTitle) newItem.publicationTitle = processTitle(host);
			
			// journalAbbreviation
			if (!newItem.journalAbbreviation) {
				const titleInfo = ZU.xpath(host, 'm:titleInfo[@type="abbreviated"]', xns);
				if (titleInfo.length) {
					newItem.journalAbbreviation = processTitleInfo(titleInfo[0]);
				}
			}
			
			// creators of host item will be evaluated by their role info
			// and only if this is missing then they are connected by a generic
			// contributor role
			processCreators(host, newItem, "contributor");
			
			// identifiers
			processIdentifiers(host, newItem);
			
			part = part.concat(ZU.xpath(host, 'm:part', xns));
			originInfo = originInfo.concat(ZU.xpath(host, 'm:originInfo', xns));
		}
		
		if (!newItem.publicationTitle) newItem.publicationTitle = newItem.journalAbbreviation;
		
		// series
		var seriesNodes = ZU.xpath(modsElement, './/m:relatedItem[@type="series"]', xns);
		for (let i = 0; i < seriesNodes.length; i++) {
			var seriesNode = seriesNodes[i];
			var series = ZU.xpathText(seriesNode, 'm:titleInfo/m:title', xns);
			
			if (ZU.fieldIsValidForType('series', newItem.itemType)) {
				newItem.series = series;
			}
			else if (ZU.fieldIsValidForType('seriesTitle', newItem.itemType)) {
				newItem.seriesTitle = series;
			}
			
			if (!newItem.seriesText) {
				newItem.seriesText = ZU.xpathText(seriesNode, 'm:titleInfo/m:subTitle', xns);
			}
			
			if (!newItem.seriesNumber) {
				newItem.seriesNumber = getFirstResult(seriesNode,
					['m:part/m:detail[@type="volume"]/m:number', 'm:titleInfo/m:partNumber']);
			}
			
			processCreators(seriesNode, newItem, "seriesEditor");
		}
		
		// Add part and originInfo from main entry
		part = part.concat(ZU.xpath(modsElement, 'm:part', xns));
		originInfo = originInfo.concat(ZU.xpath(modsElement, 'm:originInfo', xns));
		
		if (part.length) {
			// volume, issue, section
			var details = ["volume", "issue", "section"];
			for (let i = 0; i < details.length; i++) {
				var detail = details[i];
				
				newItem[detail] = getFirstResult(part, ['m:detail[@type="' + detail + '"]/m:number',
					'm:detail[@type="' + detail + '"]']);
			}

			// pages and other extent information
			const extents = ZU.xpath(part, "m:extent", xns);
			for (let i = 0; i < extents.length; i++) {
				var extent = extents[i],
					unit = extent.getAttribute("unit");
				
				if (unit === "pages" || unit === "page") {
					if (newItem.pages) continue;
					var pagesStart = ZU.xpathText(extent, "m:start[1]", xns);
					var pagesEnd = ZU.xpathText(extent, "m:end[1]", xns);
					if (pagesStart || pagesEnd) {
						if (pagesStart == pagesEnd) {
							newItem.pages = pagesStart;
						}
						else if (pagesStart && pagesEnd) {
							newItem.pages = pagesStart + "-" + pagesEnd;
						}
						else {
							newItem.pages = pagesStart + pagesEnd;
						}
					}
				}
				else {
					processExtent(extent.textContent, newItem);
				}
			}
			
			newItem.date = getFirstResult(part, ['m:date[not(@point="end")][@encoding]',
				'm:date[not(@point="end")]',
				'm:date']);
		}

		// physical description
		const extents = ZU.xpath(modsElement, "m:physicalDescription/m:extent", xns);
		for (let i = 0; i < extents.length; i++) {
			processExtent(extents[i].textContent, newItem);
		}

		// identifier
		processIdentifiers(modsElement, newItem);
		
		if (originInfo.length) {
			// edition
			var editionNodes = ZU.xpath(originInfo, 'm:edition', xns);
			if (editionNodes.length) newItem.edition = editionNodes[0].textContent;
			
			// place
			var placeNodes = ZU.xpath(originInfo, 'm:place/m:placeTerm[@type="text"]', xns);
			if (placeNodes.length) newItem.place = placeNodes[0].textContent;
			
			// publisher/distributor
			var publisherNodes = ZU.xpath(originInfo, 'm:publisher', xns);
			if (publisherNodes.length) {
				newItem.publisher = publisherNodes[0].textContent;
				if (newItem.itemType == "webpage" && !newItem.publicationTitle) {
					newItem.publicationTitle = newItem.publisher;
				}
			}
			
			// date
			newItem.date = getFirstResult(originInfo, ['m:copyrightDate[@encoding]',
				'm:copyrightDate',
				'm:dateIssued[not(@point="end")][@encoding]',
				'm:dateIssued[not(@point="end")]',
				'm:dateIssued',
				'm:dateCreated[@encoding]',
				'm:dateCreated']) || newItem.date;
			
			// lastModified
			newItem.lastModified = getFirstResult(originInfo, ['m:dateModified[@encoding]',
				'm:dateModified']);
			
			// accessDate
			newItem.accessDate = getFirstResult(originInfo, ['m:dateCaptured[@encoding]',
				'm:dateCaptured[not(@encoding)]']);
		}
		
		// call number
		newItem.callNumber = ZU.xpathText(modsElement, 'm:classification', xns);
		
		// archiveLocation
		newItem.archiveLocation = ZU.xpathText(modsElement, './/m:location/m:physicalLocation', xns, "; ");

		// attachments and url
		var urlNodes = ZU.xpath(modsElement, 'm:location/m:url', xns);
		for (let i = 0; i < urlNodes.length; i++) {
			var urlNode = urlNodes[0],
				access = urlNode.getAttribute("access"),
				usage = urlNode.getAttribute("usage");
			if (access === "raw object") {
				var attachment = {
					title: (urlNode.getAttribute("displayLabel") || "Attachment"),
					path: urlNode.textContent
				};
				if (attachment.path.substr(-4) === ".pdf") attachment.mimeType = "application/pdf";
				newItem.attachments.push(attachment);
			}
			
			if ((!newItem.url || usage === "primary" || usage === "primary display")
					&& access !== "preview") {
				newItem.url = urlNode.textContent;
			}
			
			if (!newItem.accessDate) {
				newItem.accessDate = urlNode.getAttribute("dateLastAccessed");
			}
		}

		// abstract
		newItem.abstractNote = ZU.xpathText(modsElement, 'm:abstract', xns, "\n\n");
		
		/** NOTES **/
		var noteNodes = ZU.xpath(modsElement, 'm:note', xns);
		for (let i = 0; i < noteNodes.length; i++) {
			var note = noteNodes[i];
			newItem.notes.push({ note:
				(note.hasAttribute("type") ? note.getAttribute("type") + ': ' : '')
				+ note.textContent });
		}

		// ToC - goes into notes
		var tocNodes = ZU.xpath(modsElement, 'm:tableOfContents', xns);
		for (let i = 0; i < tocNodes.length; i++) {
			newItem.notes.push({ note: 'Table of Contents: ' + tocNodes[i].textContent });
		}

		/** TAGS **/
		var tagNodes = ZU.xpath(modsElement, 'm:subject/m:topic', xns);
		for (let i = 0; i < tagNodes.length; i++) {
			newItem.tags.push(ZU.trimInternal(tagNodes[i].textContent));
		}

		// scale
		if (ZU.fieldIsValidForType('scale', newItem.itemType)) {
			var scale = ZU.xpathText(modsElement, 'm:subject/m:cartographics/m:scale', xns);
			if (scale) {
				var m = scale.match(/1\s*:\s*\d+(?:,\d+)/);
				if (m) newItem.scale = m[0];
			}
		}
		
		// Language
		// create an array of languages
		var languages = [];
		var languageNodes = ZU.xpath(modsElement, 'm:language', xns);
		for (let i = 0; i < languageNodes.length; i++) {
			var code = false,
				languageNode = languageNodes[i],
				languageTerms = ZU.xpath(languageNode, 'm:languageTerm', xns);
				
			for (let j = 0; j < languageTerms.length; j++) {
				var term = languageTerms[j],
					termType = term.getAttribute("type");
				
				if (termType === "text") {
					languages.push(term.textContent);
					code = false;
					break;
				// code authorities should be used, not ignored
				// but we ignore them for now
				}
				else if (termType === "code" || term.hasAttribute("authority")) {
					code = term.textContent;
				}
			}
			// If we have a code or text content of the node
			// (prefer the former), then we add that
			if (code || (languageNode.childNodes.length === 1
					&& languageNode.firstChild.nodeType === 3 /* Node.TEXT_NODE*/
					&& (code = languageNode.firstChild.nodeValue))) {
				languages.push(code);
			}
		}
		// join the list separated by semicolons & add it to zotero item
		newItem.language = languages.join('; ');
		
		Zotero.setProgress(iModsElements / nModsElements * 100);
		newItem.complete();
	}
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<modsCollection xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www.loc.gov/mods/v3\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-3.xsd\">\n<mods version=\"3.3\">\n     <titleInfo>\n \t \t<title>FranUlmer.com -- Home Page</title>\n \t</titleInfo>\n \t<titleInfo type=\"alternative\"><title>Fran Ulmer, Democratic candidate for Governor, Alaska, 2002</title>\n \t</titleInfo>\n \t<name type=\"personal\">\n \t \t<namePart>Ulmer, Fran</namePart>\n \t</name>\n \t<genre>Web site</genre>\n \t<originInfo>\n \t \t<dateCaptured point=\"start\" encoding=\"iso8601\">20020702 </dateCaptured>\n \t \t<dateCaptured point=\"end\" encoding=\"iso8601\"> 20021203</dateCaptured>\n \t</originInfo>\n \t<language>\n \t \t<languageTerm authority=\"iso639-2b\">eng</languageTerm>\n \t</language>\n \t<physicalDescription>\n \t \t<internetMediaType>text/html</internetMediaType>\n \t \t<internetMediaType>image/jpg</internetMediaType>\n \t</physicalDescription>\n \t<abstract>Web site promoting the candidacy of Fran Ulmer, Democratic candidate for Governor, Alaska, 2002. Includes candidate biography, issue position statements, campaign contact information, privacy policy and campaign news press releases. Site features enable visitors to sign up for campaign email list, volunteer, make campaign contributions and follow links to other internet locations. </abstract>\n \t<subject>\n \t \t<topic>Elections</topic>\n \t \t<geographic>Alaska</geographic>\n \t</subject>\n \t<subject>\n \t \t<topic>Governors</topic>\n \t \t<geographic>Alaska</geographic>\n \t \t<topic>Election</topic>\n \t</subject>\n \t<subject>\n \t \t<topic>Democratic Party (AK)</topic>\n \t</subject>\n \t<relatedItem type=\"host\">\n \t \t<titleInfo>\n \t \t \t<title>Election 2002 Web Archive</title>\n \t \t</titleInfo>\n \t \t<location>\n \t \t \t<url>http://www.loc.gov/minerva/collect/elec2002/</url>\n \t \t</location>\n \t</relatedItem>\n \t<location>\n \t \t<url displayLabel=\"Active site (if available)\">http://www.franulmer.com/</url>\n \t</location>\n \t<location>\n \t \t<url displayLabel=\"Archived site\">http://wayback-cgi1.alexa.com/e2002/*/http://www.franulmer.com/</url>\n \t</location>\n</mods>\n</modsCollection>",
		"items": [
			{
				"itemType": "webpage",
				"title": "FranUlmer.com -- Home Page",
				"creators": [
					{
						"firstName": "Fran",
						"lastName": "Ulmer",
						"creatorType": "author"
					}
				],
				"abstractNote": "Web site promoting the candidacy of Fran Ulmer, Democratic candidate for Governor, Alaska, 2002. Includes candidate biography, issue position statements, campaign contact information, privacy policy and campaign news press releases. Site features enable visitors to sign up for campaign email list, volunteer, make campaign contributions and follow links to other internet locations.",
				"language": "eng",
				"url": "http://www.franulmer.com/",
				"websiteTitle": "Election 2002 Web Archive",
				"attachments": [],
				"tags": [
					"Democratic Party (AK)",
					"Election",
					"Elections",
					"Governors"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<modsCollection xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www.loc.gov/mods/v3\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-3.xsd\">\n<mods version=\"3.3\">\n     <titleInfo>\n \t \t<title>At Gettysburg, or, What a Girl Saw and Heard of the Battle: A True Narrative</title>\n \t</titleInfo>\n \t<name type=\"personal\">\n \t \t<namePart>Alleman, Tillie Pierce [1848-1914]</namePart>\n \t \t<role>\n \t \t \t<roleTerm type=\"code\" authority=\"marcrelator\">aut</roleTerm>\n \t \t \t<roleTerm type=\"text\" authority=\"marcrelator\">Author</roleTerm>\n \t \t</role>\n \t</name>\n \t<typeOfResource>text</typeOfResource>\n \t<originInfo>\n \t \t<place>\n \t \t \t<placeTerm type=\"text\">New York</placeTerm>\n \t \t</place>\n \t \t<publisher>W. Lake Borland</publisher>\n \t \t<dateIssued keyDate=\"yes\" encoding=\"w3cdtf\">1889</dateIssued>\n \t</originInfo>\n \t<language>\n \t \t<languageTerm authority=\"iso639-2b\">eng</languageTerm>\n \t \t<languageTerm type=\"text\">English</languageTerm>\n \t</language>\n \t<physicalDescription>\n \t \t<internetMediaType>text/html</internetMediaType>\n \t \t<digitalOrigin>reformatted digital</digitalOrigin>\n \t</physicalDescription>\n \t<subject authority=\"lcsh\">\n \t \t<topic >Gettysburg, Battle of, Gettysburg, Pa., 1863</topic>\n \t</subject>\n \t<subject authority=\"lcsh\">\n \t \t<topic>Gettysburg (Pa.) -- History -- Civil War, 1861-1865</topic>\n \t</subject>\n \t<subject authority=\"lcsh\">\n \t \t<topic>United States -- History -- Civil War, 1861-1865 -- Campaigns</topic>\n \t</subject>\n \t<classification authority=\"lcc\">E475.53 .A42</classification>\n \t<relatedItem type=\"host\">\n \t \t<titleInfo type=\"uniform\" authority=\"dlfaqcoll\">\n \t \t \t<title>A Celebration of Women Writers: Americana</title>\n \t \t</titleInfo>\n \t</relatedItem>\n \t<location>\n \t \t<url usage=\"primary display\" access=\"object in context\"> http://digital.library.upenn.edu/women/alleman/gettysburg/gettysburg.html\n</url>\n \t</location>\n \t<accessCondition> Personal, noncommercial use of this item is permitted in the United States of America. Please see http://digital.library.upenn.edu/women/ for other rights and restrictions that may apply to this resource.\n</accessCondition>\n<recordInfo>\n \t<recordSource>University of Pennsylvania Digital Library</recordSource>\n \t<recordOrigin> MODS auto-converted from a simple Online Books Page metadata record. For details, see http://onlinebooks.library.upenn.edu/mods.html </recordOrigin>\n \t<languageOfCataloging>\n \t \t<languageTerm type=\"code\" authority=\"iso639-2b\">eng</languageTerm>\n \t</languageOfCataloging>\n</recordInfo>\n</mods>\n</modsCollection>",
		"items": [
			{
				"itemType": "webpage",
				"title": "At Gettysburg, or, What a Girl Saw and Heard of the Battle: A True Narrative",
				"creators": [
					{
						"firstName": "Tillie Pierce",
						"lastName": "Alleman",
						"creatorType": "author"
					}
				],
				"date": "1889",
				"language": "English",
				"rights": "Personal, noncommercial use of this item is permitted in the United States of America. Please see http://digital.library.upenn.edu/women/ for other rights and restrictions that may apply to this resource.",
				"url": "http://digital.library.upenn.edu/women/alleman/gettysburg/gettysburg.html",
				"websiteTitle": "A Celebration of Women Writers: Americana",
				"attachments": [],
				"tags": [
					"Gettysburg (Pa.) -- History -- Civil War, 1861-1865",
					"Gettysburg, Battle of, Gettysburg, Pa., 1863",
					"United States -- History -- Civil War, 1861-1865 -- Campaigns"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<modsCollection xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www.loc.gov/mods/v3\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-3.xsd\">\n<mods version=\"3.3\">\n     <titleInfo>\n \t \t<title>Telescope Peak from Zabriskie Point</title>\n \t</titleInfo>\n \t<titleInfo type=\"alternative\" >\n \t \t<title>Telescope PK from Zabriskie Pt.</title>\n \t</titleInfo>\n \t<name type=\"personal\">\n \t \t<namePart type=\"family\">Cushman</namePart>\n \t \t<namePart type=\"given\">Charles Weever</namePart>\n \t \t<namePart type=\"date\">1896-1972</namePart>\n \t \t<role>\n \t \t \t<roleTerm type=\"code\" authority=\"marcrelator\">pht</roleTerm>\n \t \t \t<roleTerm type=\"text\" authority=\"marcrelator\">Photographer</roleTerm>\n \t \t</role>\n \t</name>\n \t<typeOfResource>still image</typeOfResource>\n \t<genre authority=\"gmgpc\">Landscape photographs</genre>\n \t<originInfo>\n \t \t<dateCreated encoding=\"w3cdtf\" keyDate=\"yes\">1955-03-22</dateCreated>\n \t \t<copyrightDate encoding=\"w3cdtf\">2003</copyrightDate>\n \t</originInfo>\n \t<physicalDescription>\n \t \t<internetMediaType>image/jpeg</internetMediaType>\n \t \t<digitalOrigin>reformatted digital</digitalOrigin>\n \t \t<note> Original 35mm slide was digitized in 2003 as a TIFF image. Display versions in JPEG format in three sizes are available.</note>\n \t \t<note>100 f 6.3 tl</note>\n \t</physicalDescription>\n \t<subject authority=\"lctgm\">\n \t \t<topic>Mountains</topic>\n \t</subject>\n \t<subject authority=\"lctgm\">\n \t \t<topic>Snow</topic>\n \t</subject>\n \t<subject>\n \t \t<topic>Telescope Peak (Inyo County, Calif.)</topic>\n \t</subject>\n \t<subject>\n \t \t<topic>Zabriskie Point (Calif.)</topic>\n \t</subject>\n \t<subject>\n \t \t<hierarchicalGeographic>\n \t \t \t<country>United States</country>\n \t \t \t<state>California</state>\n \t \t \t<county>Inyo</county>\n \t \t</hierarchicalGeographic>\n \t</subject>\n \t<relatedItem type=\"original\">\n \t \t<originInfo>\n \t \t \t<dateCreated encoding=\"w3cdtf\" keyDate=\"yes\">1955-03-22</dateCreated>\n \t \t</originInfo>\n \t \t<physicalDescription>\n \t \t \t<form authority=\"gmd\">graphic</form>\n \t \t \t<extent>1 slide : col. ; 35mm</extent>\n \t \t \t<note>Original 35mm slide was digitized in 2003 as a TIFF image. Display versions in JPEG format in three sizes are available.</note>\n \t \t</physicalDescription>\n \t \t<location>\n \t \t \t<physicalLocation displayLabel=\"Original slide\"> Indiana University, Bloomington. University Archives P07803 </physicalLocation>\n \t \t</location>\n \t</relatedItem>\n \t<relatedItem type=\"host\">\n \t \t<titleInfo type=\"uniform\" authority=\"dlfaqcoll\">\n \t \t \t<title> Indiana University Digital Library Program: Charles W. Cushman Photograph Collection</title>\n \t \t</titleInfo>\n \t</relatedItem>\n \t<identifier displayLabel=\"Cushman number\" type=\"local\">955.11</identifier>\n \t<identifier displayLabel=\"IU Archives number\" type=\"local\">P07803</identifier>\n \t<location>\n \t \t<url>http://purl.dlib.indiana.edu/iudl/archives/cushman/P07803</url>\n \t \t<url access=\"preview\">http://quod.lib.umich.edu/m/mods/thumbs/Indiana/oai.dlib.indiana.edu/ archives/cushman/oai_3Aoai.dlib.indiana.edu_3Aarchives_5Ccushman_5CP07803.png</url>\n \t</location>\n \t<accessCondition> Copyright and reproduction rights for all Charles W. Cushman photographs are held by Indiana University and administered by the University Archives, Indiana University, Bloomington, IN 47405</accessCondition>\n \t<recordInfo>\n \t<recordContentSource>Indiana University Digital Library Program</recordContentSource>\n \t<recordCreationDate encoding=\"w3cdtf\">2004-09-09</recordCreationDate>\n \t<recordIdentifier>archives/cushman/P07803</recordIdentifier>\n \t</recordInfo>\n</mods>\n\n</modsCollection>",
		"items": [
			{
				"itemType": "artwork",
				"title": "Telescope Peak from Zabriskie Point",
				"creators": [
					{
						"firstName": "Charles Weever",
						"lastName": "Cushman",
						"creatorType": "author"
					}
				],
				"date": "2003",
				"archiveLocation": "Indiana University, Bloomington. University Archives P07803",
				"rights": "Copyright and reproduction rights for all Charles W. Cushman photographs are held by Indiana University and administered by the University Archives, Indiana University, Bloomington, IN 47405",
				"url": "http://purl.dlib.indiana.edu/iudl/archives/cushman/P07803",
				"attachments": [],
				"tags": [
					"Mountains",
					"Snow",
					"Telescope Peak (Inyo County, Calif.)",
					"Zabriskie Point (Calif.)"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<modsCollection xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www.loc.gov/mods/v3\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-3.xsd\">\n<mods version=\"3.3\">\n     <titleInfo>\n \t \t<title>Hiring and recruitment practices in academic libraries</title>\n \t</titleInfo>\n \t<name type=\"personal\">\n \t \t<namePart>Raschke, Gregory K.</namePart>\n \t \t<displayForm>Gregory K. Raschke</displayForm>\n \t</name>\n \t<typeOfResource>text</typeOfResource>\n \t<genre>journal article</genre>\n \t<originInfo>\n \t \t<place>\n \t \t \t<text>Baltimore, Md.</text>\n \t \t</place>\n \t \t<publisher>Johns Hopkins University Press</publisher>\n \t \t<dateIssued>2003</dateIssued>\n \t \t<issuance>monographic</issuance>\n \t</originInfo>\n \t<language authority=\"iso639-2b\">eng</language>\n \t<physicalDescription>\n \t \t<form authority=\"marcform\">print</form>\n \t \t<extent>15 p.</extent>\n \t</physicalDescription>\n \t<abstract>\nAcademic libraries need to change their recruiting and hiring procedures to stay competitive in today's changing marketplace. By taking too long to find and to hire talented professionals in a tight labor market, academic libraries are losing out on top candidates and limiting their ability to become innovative and dynamic organizations. Traditional, deliberate, and risk-averse hiring models lead to positions remaining open for long periods, opportunities lost as top prospects find other positions, and a reduction in the overall talent level of the organization. To be more competitive and effective in their recruitment and hiring processes, academic libraries must foster manageable internal solutions, look to other professions for effective hiring techniques and models, and employ innovative concepts from modern personnel management literature. </abstract>\n \t<subject>\n \t \t<topic>College librarians</topic>\n \t \t<topic>Recruiting</topic>\n \t \t<geographic>United States</geographic>\n \t</subject>\n \t<subject>\n \t \t<topic>College librarians</topic>\n \t \t<topic>Selection and appointment</topic>\n \t \t<geographic>United States</geographic>\n \t</subject>\n \t<relatedItem type=\"host\">\n \t \t<titleInfo>\n \t \t \t<title>portal: libraries and the academy</title>\n \t \t</titleInfo>\n \t \t<part>\n \t \t \t<detail type=\"volume\">\n \t \t \t \t<number>3</number>\n \t \t \t \t<caption>vol.</caption>\n \t \t \t</detail>\n \t \t \t<detail type=\"number\">\n \t \t \t \t<number>1</number>\n \t \t \t \t<caption>no.</caption>\n \t \t \t</detail>\n \t \t \t<extent unit=\"page\">\n \t \t \t \t<start>53</start>\n \t \t \t \t<end>57</end>\n \t \t \t</extent>\n \t \t \t<date>Jan. 2003</date>\n \t \t</part>\n \t \t<identifier type=\"issn\">1531-2542</identifier>\n \t</relatedItem>\n</mods>\n\n</modsCollection>",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Hiring and recruitment practices in academic libraries",
				"creators": [
					{
						"firstName": "Gregory K.",
						"lastName": "Raschke",
						"creatorType": "author"
					}
				],
				"date": "2003",
				"ISSN": "1531-2542",
				"abstractNote": "Academic libraries need to change their recruiting and hiring procedures to stay competitive in today's changing marketplace. By taking too long to find and to hire talented professionals in a tight labor market, academic libraries are losing out on top candidates and limiting their ability to become innovative and dynamic organizations. Traditional, deliberate, and risk-averse hiring models lead to positions remaining open for long periods, opportunities lost as top prospects find other positions, and a reduction in the overall talent level of the organization. To be more competitive and effective in their recruitment and hiring processes, academic libraries must foster manageable internal solutions, look to other professions for effective hiring techniques and models, and employ innovative concepts from modern personnel management literature.",
				"language": "eng",
				"pages": "53-57",
				"publicationTitle": "portal: libraries and the academy",
				"volume": "3",
				"attachments": [],
				"tags": [
					"College librarians",
					"College librarians",
					"Recruiting",
					"Selection and appointment"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version='1.0' encoding='UTF-8' ?>\n<mods xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"3.4\"\n  xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www.loc.gov/mods/v3\"\n  xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-4.xsd\">\n\n  <titleInfo>\n    <title>Sound and fury</title>\n    <subTitle>the making of the punditocracy</subTitle>\n  </titleInfo>\n\n  <name type=\"personal\" authorityURI=\"http://id.loc.gov/authorities/names\"\n    valueURI=\"http://id.loc.gov/authorities/names/n92101908\">\n    <namePart>Alterman, Eric</namePart>\n\n    <role>\n      <roleTerm type=\"text\">creator</roleTerm>\n    </role>\n  </name>\n\n  <typeOfResource>text</typeOfResource>\n\n  <genre authority=\"marcgt\">bibliography</genre>\n\n  <originInfo>\n    <place>\n      <placeTerm authority=\"marccountry\" type=\"code\"\n        authorityURI=\"http://id.loc.gov/vocabulary/countries\"\n        valueURI=\"http://id.loc.gov/vocabulary/countries/nyu\">nyu</placeTerm>\n    </place>\n    <place>\n      <placeTerm type=\"text\">Ithaca, N.Y</placeTerm>\n    </place>\n\n    <publisher>Cornell University Press</publisher>\n    <dateIssued>c1999</dateIssued>\n    <dateIssued encoding=\"marc\">1999</dateIssued>\n    <issuance>monographic</issuance>\n  </originInfo>\n\n  <language>\n\n    <languageTerm authority=\"iso639-2b\" type=\"code\"\n      authorityURI=\"http://id.loc.gov/vocabulary/iso639-2\"\n      valueURI=\"http://id.loc.gov/vocabulary/iso639-2/eng\">eng</languageTerm>\n  </language>\n\n  <physicalDescription>\n    <form authority=\"marcform\">print</form>\n    <extent>vii, 322 p. ; 23 cm.</extent>\n  </physicalDescription>\n\n  <note type=\"statement of responsibility\">Eric Alterman.</note>\n  <note>Includes bibliographical references (p. 291-312) and index.</note>\n\n  <subject authority=\"lcsh\" authorityURI=\"http://id.loc.gov/authorities/subjects\">\n    <topic valueURI=\"http://id.loc.gov/authorities/subjects/sh85070736\">Journalism</topic>\n    <topic valueURI=\"http://id.loc.gov/authorities/subjects/sh00005651\">Political aspects</topic>\n    <geographic valueURI=\"http://id.loc.gov/authorities/names/n78095330\">United States</geographic>\n\n  </subject>\n\n  <subject authority=\"lcsh\" authorityURI=\"http://id.loc.gov/authorities/subjects\">\n    <geographic valueURI=\"http://id.loc.gov/authorities/names/n78095330\">United States</geographic>\n    <topic valueURI=\"http://id.loc.gov/authorities/subjects/sh2002011436\">Politics and\n      government</topic>\n    <temporal valueURI=\"http://id.loc.gov/authorities/subjects/sh2002012476\">20th century</temporal>\n  </subject>\n\n  <subject authority=\"lcsh\" authorityURI=\"http://id.loc.gov/authorities/subjects\"\n    valueURI=\"http://id.loc.gov/authorities/subjects/sh2008107507\">\n    <topic valueURI=\"http://id.loc.gov/authorities/subjects/sh85081863\">Mass media</topic>\n    <topic valueURI=\"http://id.loc.gov/authorities/subjects/sh00005651\">Political aspects</topic>\n    <geographic valueURI=\"http://id.loc.gov/authorities/names/n78095330\">United States</geographic>\n  </subject>\n\n  <subject authority=\"lcsh\" authorityURI=\"http://id.loc.gov/authorities/subjects\"\n    valueURI=\"http://id.loc.gov/authorities/subjects/sh2010115992\">\n    <topic valueURI=\"http://id.loc.gov/authorities/subjects/sh85133490\">Television and\n      politics</topic>\n\n    <geographic valueURI=\"http://id.loc.gov/authorities/names/n78095330\">United States</geographic>\n  </subject>\n\n  <subject authority=\"lcsh\" authorityURI=\"http://id.loc.gov/authorities/subjects\"\n    valueURI=\"http://id.loc.gov/authorities/subjects/sh2008109555\">\n    <topic valueURI=\"http://id.loc.gov/authorities/subjects/sh85106514\">Press and politics</topic>\n    <geographic valueURI=\"http://id.loc.gov/authorities/names/n78095330\">United States</geographic>\n  </subject>\n\n  <subject authority=\"lcsh\" authorityURI=\"http://id.loc.gov/authorities/subjects\">\n    <topic>Talk shows</topic>\n    <geographic valueURI=\"http://id.loc.gov/authorities/names/n78095330\">United States</geographic>\n  </subject>\n\n  <classification authority=\"lcc\">PN4888.P6 A48 1999</classification>\n  <classification edition=\"21\" authority=\"ddc\">071/.3</classification>\n\n  <identifier type=\"isbn\">0801486394 (pbk. : acid-free, recycled paper)</identifier>\n  <identifier type=\"lccn\">99042030</identifier>\n\n  <recordInfo>\n    <descriptionStandard>aacr</descriptionStandard>\n    <recordContentSource>DLC</recordContentSource>\n    <recordCreationDate encoding=\"marc\">990730</recordCreationDate>\n\n    <recordChangeDate encoding=\"iso8601\">20000406144503.0</recordChangeDate>\n    <recordIdentifier>11761548</recordIdentifier>\n    <recordOrigin>Converted from MARCXML to MODS version 3.4 using MARC21slim2MODS3-4.xsl (Revision\n      1.74), valueURIs and authorityURIs added by hand 20120123</recordOrigin>\n  </recordInfo>\n</mods>\n",
		"items": [
			{
				"itemType": "book",
				"title": "Sound and fury: the making of the punditocracy",
				"creators": [
					{
						"firstName": "Eric",
						"lastName": "Alterman",
						"creatorType": "author"
					}
				],
				"date": "1999",
				"ISBN": "0801486394",
				"callNumber": "PN4888.P6 A48 1999, 071/.3",
				"language": "eng",
				"numPages": "322",
				"place": "Ithaca, N.Y",
				"publisher": "Cornell University Press",
				"attachments": [],
				"tags": [
					"Journalism",
					"Mass media",
					"Political aspects",
					"Political aspects",
					"Politics and government",
					"Press and politics",
					"Talk shows",
					"Television and politics"
				],
				"notes": [
					{
						"note": "statement of responsibility: Eric Alterman."
					},
					{
						"note": "Includes bibliographical references (p. 291-312) and index."
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<mods xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"3.4\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www.loc.gov/mods/v3\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-4.xsd\">\n    <titleInfo>\n\t\t<title>Models, Fantasies and Phantoms of Transition</title>\n\t</titleInfo>\n\t<name type=\"personal\">\n\t\t<namePart type=\"given\">Ash</namePart>\n\t\t<namePart type=\"family\">Amin</namePart>\n\n\t\t<role>\n\t\t\t<roleTerm type=\"text\">author</roleTerm>\n\t\t</role>\n\t</name>\n\t<typeOfResource>text</typeOfResource>\n\t<relatedItem type=\"host\">\n\t\t<titleInfo>\n\t\t\t<title>Post-Fordism</title>\n\n\t\t\t<subTitle>A Reader</subTitle>\n\t\t</titleInfo>\n\t\t<name type=\"personal\">\n\t\t\t<namePart type=\"given\">Ash</namePart>\n\t\t\t<namePart type=\"family\">Amin</namePart>\n\t\t\t<role>\n\t\t\t\t<roleTerm type=\"text\">editor</roleTerm>\n\n\t\t\t</role>\n\t\t</name>\n\t\t<originInfo>\n\t\t\t<dateIssued>1994</dateIssued>\n\t\t\t<publisher>Blackwell Publishers</publisher>\n\t\t\t<place>\n\t\t\t\t<placeTerm type=\"text\">Oxford</placeTerm>\n\n\t\t\t</place>\n\t\t</originInfo>\n\t\t<part>\n\t\t\t<extent unit=\"page\">\n\t\t\t\t<start>23</start>\n\t\t\t\t<end>45</end>\n\t\t\t</extent>\n\t\t</part>\n\n\t</relatedItem>\n\t<identifier>Amin1994a</identifier>\n</mods>",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Models, Fantasies and Phantoms of Transition",
				"creators": [
					{
						"firstName": "Ash",
						"lastName": "Amin",
						"creatorType": "author"
					},
					{
						"firstName": "Ash",
						"lastName": "Amin",
						"creatorType": "editor"
					}
				],
				"date": "1994",
				"bookTitle": "Post-Fordism: A Reader",
				"pages": "23-45",
				"place": "Oxford",
				"publisher": "Blackwell Publishers",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<mods xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"3.4\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www.loc.gov/mods/v3\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-4.xsd\">\n    \t<titleInfo>\n\t\t\t<nonSort>The</nonSort>\n\t\t\t<title>Urban Question as a Scale Question</title>\n\t\t\t<subTitle>Reflections on Henri Lefebre, Urban Theory and the Politics of Scale</subTitle>\n\t\t</titleInfo>\n\t\t<name type=\"personal\">\n\t\t\t<namePart type=\"given\">Neil</namePart>\n\n\t\t\t<namePart type=\"family\">Brenner</namePart>\n\t\t\t<role>\n\t\t\t\t<roleTerm type=\"text\">author</roleTerm>\n\t\t\t</role>\n\t\t</name>\n\t\t<typeOfResource>text</typeOfResource>\n\t\t<genre>article</genre>\n\n\t\t<originInfo>\n\t\t\t<issuance>monographic</issuance>\n\t\t</originInfo>\n\t\t<relatedItem type=\"host\">\n\t\t\t<titleInfo>\n\t\t\t\t<title>International Journal of Urban and Regional Research</title>\n\t\t\t</titleInfo>\n\t\t\t<originInfo>\n\n\t\t\t<issuance>continuing</issuance>\n\t\t</originInfo>\n\t\t\t<part>\n\t\t\t\t<detail type=\"volume\">\n\t\t\t\t\t<number>24</number>\n\t\t\t\t</detail>\n\t\t\t\t<detail type=\"issue\">\n\t\t\t\t\t<number>2</number>\n\n\t\t\t\t\t<caption>no.</caption>\n\t\t\t\t</detail>\n\t\t\t\t<extent unit=\"pages\">\n\t\t\t\t\t<start>361</start>\n\t\t\t\t\t<end>378</end>\n\t\t\t\t</extent>\n\t\t\t\t<date>2000</date>\n\n\t\t\t</part>\n\t\t</relatedItem>\n\t\t<identifier>BrennerN2000a</identifier>\n\t</mods>",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Urban Question as a Scale Question: Reflections on Henri Lefebre, Urban Theory and the Politics of Scale",
				"creators": [
					{
						"firstName": "Neil",
						"lastName": "Brenner",
						"creatorType": "author"
					}
				],
				"date": "2000",
				"issue": "2",
				"pages": "361-378",
				"publicationTitle": "International Journal of Urban and Regional Research",
				"volume": "24",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<mods xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"3.4\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www.loc.gov/mods/v3\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-4.xsd\">\n    \t<titleInfo>\n\t\t\t<title>Fifth-Grade Boys' Decisions about Participation in Sports Activities</title>\n\t\t</titleInfo>\n\t\t<name type=\"personal\">\n\t\t\t<namePart type=\"family\">Conley</namePart>\n\t\t\t<namePart type=\"given\">Alice</namePart>\n\t\t\t<role>\n\n\t\t\t\t<roleTerm type=\"text\">author</roleTerm>\n\t\t\t</role>\n\t\t</name>\n\t\t<typeOfResource>text</typeOfResource>\n\t\t<relatedItem type=\"host\">\n\t\t\t<titleInfo>\n\t\t\t\t<title>Non-subject-matter Outcomes of Schooling</title>\n\n\t\t\t</titleInfo>\n\t\t\t<name>\n\t\t\t\t<namePart>Good, Thomas L.</namePart>\n\t\t\t\t<role>\n\t\t\t\t\t<roleTerm>editor</roleTerm>\n\t\t\t\t</role>\n\t\t\t</name>\n\t\t\t<note type=\"statement of responsibility\">ed.  Thomas L. Good</note>\n\n\t\t\t<originInfo>\n\t\t\t\t<issuance>continuing</issuance>\n\t\t\t</originInfo>\n\t\t\t<part>\n\t\t\t\t<detail type=\"title\">\n\t\t\t\t\t<title>Special issue, Elementary School Journal</title>\n\t\t\t\t</detail>\n\t\t\t\t<detail type=\"volume\">\n\n\t\t\t\t\t<number>99</number>\n\t\t\t\t</detail>\n\t\t\t\t<detail type=\"issue\">\n\t\t\t\t\t<number>5</number>\n\t\t\t\t\t<caption>no.</caption>\n\t\t\t\t</detail>\n\t\t\t\t<extent unit=\"pages\">\n\n\t\t\t\t\t<start>131</start>\n\t\t\t\t\t<end>146</end>\n\t\t\t\t</extent>\n\t\t\t\t<date>1999</date>\n\t\t\t</part>\n\t\t</relatedItem>\n\t</mods>",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Fifth-Grade Boys' Decisions about Participation in Sports Activities",
				"creators": [
					{
						"firstName": "Alice",
						"lastName": "Conley",
						"creatorType": "author"
					},
					{
						"lastName": "Good, Thomas L.",
						"fieldMode": 1,
						"creatorType": "editor"
					}
				],
				"date": "1999",
				"issue": "5",
				"pages": "131-146",
				"publicationTitle": "Non-subject-matter Outcomes of Schooling",
				"volume": "99",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<mods xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"3.4\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www.loc.gov/mods/v3\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-4.xsd\">\n    <titleInfo>\n\t\t<title>2700 MHz observations of 4c radio sources in the declination zone +4 to -4</title>\n\t</titleInfo>\n\t<name type=\"personal\">\n\t\t<namePart type=\"family\">Wall</namePart>\n\t\t<namePart type=\"given\">J. V.</namePart>\n\t\t<role>\n\n\t\t\t<roleTerm type=\"text\">author</roleTerm>\n\t\t</role>\n\t</name>\n\t<typeOfResource>text</typeOfResource>\n\t<relatedItem type=\"host\">\n\t<titleInfo>\n\t\t<title>Australian Journal of Physics and Astronphysics</title>\n\n\t</titleInfo>\n\t\t<titleInfo type=\"abbreviated\">\n\t\t\t<title>Australian J. Phys. Astronphys.</title>\n\t\t</titleInfo>\n\t\t<originInfo>\n\t\t\t<issuance>continuing</issuance>\n\t\t</originInfo>\n\t\t<genre>academic journal</genre>\n\n\t\t<part>\n\t\t\t<detail type=\"supplement\">\n\t\t\t\t<caption>Suppl. no.</caption>\n\t\t\t\t<number>20</number>\n\t\t\t</detail>\n\t\t\t<date>1971</date>\n\t\t</part>\n\n\t</relatedItem>\n</mods>",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "2700 MHz observations of 4c radio sources in the declination zone +4 to -4",
				"creators": [
					{
						"firstName": "J. V.",
						"lastName": "Wall",
						"creatorType": "author"
					}
				],
				"date": "1971",
				"journalAbbreviation": "Australian J. Phys. Astronphys.",
				"publicationTitle": "Australian Journal of Physics and Astronphysics",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<mods xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"3.0\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www.loc.gov/mods/v3\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-0.xsd\">\n    \t<titleInfo>\n\t\t\t<title>Emergence and Dissolvence in the Self-Organization of Complex Systems</title>\n\t\t</titleInfo>\n\t\t<name type=\"personal\">\n\t\t\t<namePart type=\"family\">Testa</namePart>\n\t\t\t<namePart type=\"given\">Bernard</namePart>\n\t\t\t<role>\n\n\t\t\t\t<roleTerm>author</roleTerm>\n\t\t\t</role>\n\t\t</name>\n\t\t<name type=\"personal\">\n\t\t\t<namePart type=\"family\">Kier</namePart>\n\t\t\t<namePart type=\"given\">Lamont B.</namePart>\n\t\t\t<role>\n\n\t\t\t\t<roleTerm>author</roleTerm>\n\t\t\t</role>\n\t\t</name>\n\t\t<typeOfResource>text</typeOfResource>\n\t\t<identifier type=\"uri\">http://www.mdpi.org/entropy/papers/e2010001.pdf</identifier>\n\t\t<relatedItem type=\"host\">\n\t\t\t<titleInfo>\n\n\t\t\t\t<title>Entropy</title>\n\t\t\t</titleInfo>\n\t\t\t<originInfo>\n\t\t\t\t<issuance>continuing</issuance>\n\t\t\t</originInfo>\n\t\t\t<part>\n\t\t\t\t<detail type=\"volume\">\n\t\t\t\t\t<number>2</number>\n\n\t\t\t\t</detail>\n\t\t\t\t<detail type=\"issue\">\n\t\t\t\t\t<caption>no.</caption>\n\t\t\t\t\t<number>1</number>\n\t\t\t\t</detail>\n\t\t\t\t<extent unit=\"pages\">\n\t\t\t\t\t<start>17</start>\n\n\t\t\t\t\t<end>17</end>\n\t\t\t\t</extent>\n\t\t\t\t<date>2000</date>\n\t\t\t</part>\n\t\t</relatedItem>\n\t</mods>",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Emergence and Dissolvence in the Self-Organization of Complex Systems",
				"creators": [
					{
						"firstName": "Bernard",
						"lastName": "Testa",
						"creatorType": "author"
					},
					{
						"firstName": "Lamont B.",
						"lastName": "Kier",
						"creatorType": "author"
					}
				],
				"date": "2000",
				"issue": "1",
				"pages": "17",
				"publicationTitle": "Entropy",
				"volume": "2",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<mods xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"3.4\"\n    xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www.loc.gov/mods/v3\"\n\txsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-4.xsd\">\n\n\t<titleInfo>\n\t\t<title>3 Viennese arias :</title>\n\t\t<subTitle>for soprano, obbligato clarinet in B flat, and piano</subTitle>\n\t</titleInfo>\n\n\t<name type=\"personal\" authorityURI=\"http://id.loc.gov/authorities/names\"\n\t\tvalueURI=\"http://id.loc.gov/authorities/names/n81100426\">\n\t\t<namePart>Lawson, Colin (Colin James)</namePart>\n\n\t</name>\n\n\t<typeOfResource>notated music</typeOfResource>\n\n\t<originInfo>\n\t\t<place>\n\t\t\t<placeTerm authority=\"marccountry\" type=\"code\"\n\t\t\t\tauthorityURI=\"http://id.loc.gov/vocabulary/countries\"\n\t\t\t\tvalueURI=\"http://id.loc.gov/vocabulary/countries/enk\">enk</placeTerm>\n\t\t</place>\n\t\t<place>\n\n\t\t\t<placeTerm type=\"text\">London</placeTerm>\n\t\t</place>\n\t\t<publisher>Nova Music</publisher>\n\t\t<dateIssued>c1984</dateIssued>\n\t\t<dateIssued encoding=\"marc\">1984</dateIssued>\n\t\t<issuance>monographic</issuance>\n\n\t</originInfo>\n\n\t<language>\n\t\t<languageTerm authority=\"iso639-2b\" type=\"code\"\n\t\t\tauthorityURI=\"http://id.loc.gov/vocabulary/iso639-2\"\n\t\t\tvalueURI=\"http://id.loc.gov/vocabulary/iso639-2/ita\">ita</languageTerm>\n\t</language>\n\t<language objectPart=\"libretto\">\n\t\t<languageTerm type=\"code\" authority=\"iso639-2b\">eng</languageTerm>\n\t</language>\n\n\t<physicalDescription>\n\t\t<form authority=\"marcform\">print</form>\n\t\t<extent>1 score (12 p.) + 2 parts ; 31 cm.</extent>\n\t</physicalDescription>\n\n\t<tableOfContents>Tutto in pianto il cor struggete / Emperor Joseph I -- E sempre inquieto quel\n\t\tcore infelice : from Endimione / G. Bononcini -- L'adorata genitrice : from Muzio [i.e.\n\t\tMutio] Scevola / G. Bononcini.</tableOfContents>\n\n\t<note type=\"statement of responsibility\">G.B. Bononcini and Emperor Joseph I ; edited by Colin\n\t\tLawson.</note>\n\n\t<note>Opera excerpts.</note>\n\t<note>Acc. arr. for piano; obbligato for the 2nd-3rd excerpts originally for chalumeau.</note>\n\t<note>Italian words.</note>\n\t<note>Cover title.</note>\n\t<note>The 1st excerpt composed for inclusion in M.A. Ziani's Chilonida.</note>\n\t<note>Texts with English translations on cover p. [2].</note>\n\n\t<subject authority=\"lcsh\" authorityURI=\"http://id.loc.gov/authorities/subjects\"\n\t\tvalueURI=\"http://id.loc.gov/authorities/subjects/sh2008108658\">\n\t\t<topic valueURI=\"http://id.loc.gov/authorities/subjects/sh85094914\">Operas</topic>\n\t\t<genre valueURI=\"http://id.loc.gov/authorities/subjects/sh99001548\">Excerpts,\n\t\t\tArranged</genre>\n\t\t<genre valueURI=\"http://id.loc.gov/authorities/subjects/sh99001780\">Scores and parts</genre>\n\t</subject>\n\n\t<subject authority=\"lcsh\" authorityURI=\"http://id.loc.gov/authorities/subjects\">\n\n\t\t<topic valueURI=\"http://id.loc.gov/authorities/subjects/sh85125142\">Songs (High voice) with\n\t\t\tinstrumental ensemble</topic>\n\t\t<genre valueURI=\"http://id.loc.gov/authorities/subjects/sh99001780\">Scores and parts</genre>\n\t</subject>\n\n\t<classification authority=\"lcc\">M1506 .A14 1984</classification>\n\n\t<relatedItem type=\"series\">\n\t\t<titleInfo>\n\n\t\t\t<title>Music for voice and instrument</title>\n\t\t</titleInfo>\n\t</relatedItem>\n\n\t<relatedItem type=\"constituent\">\n\t\t<titleInfo type=\"uniform\" authorityURI=\"http://id.loc.gov/authorities/names\"\n\t\t\tvalueURI=\"http://id.loc.gov/authorities/names/no97083914\">\n\t\t\t<title>Tutto in pianto il cor struggete</title>\n\t\t</titleInfo>\n\n\t\t<name type=\"personal\" authorityURI=\"http://id.loc.gov/authorities/names\"\n\t\t\tvalueURI=\"http://id.loc.gov/authorities/names/n79055650\">\n\t\t\t<namePart>Joseph I, Holy Roman Emperor,</namePart>\n\t\t\t<namePart type=\"date\">1678-1711</namePart>\n\t\t</name>\n\t</relatedItem>\n\n\t<relatedItem type=\"constituent\">\n\t\t<titleInfo type=\"uniform\" authorityURI=\"http://id.loc.gov/authorities/names\"\n\t\t\tvalueURI=\"http://id.loc.gov/authorities/names/n85337311\">\n\n\t\t\t<title>Endimione.</title>\n\t\t\t<partName>E sempre inquieto quel core infelice.</partName>\n\t\t</titleInfo>\n\t\t<name type=\"personal\" authorityURI=\"http://id.loc.gov/authorities/names\"\n\t\t\tvalueURI=\"http://id.loc.gov/authorities/names/n81005197\">\n\t\t\t<namePart>Bononcini, Giovanni,</namePart>\n\t\t\t<namePart type=\"date\">1670-1747</namePart>\n\t\t</name>\n\n\t</relatedItem>\n\n\t<relatedItem type=\"constituent\">\n\t\t<titleInfo type=\"uniform\" authorityURI=\"http://id.loc.gov/authorities/names\"\n\t\t\tvalueURI=\"http://id.loc.gov/authorities/names/n85337312\">\n\t\t\t<title>Mutio Scevola.</title>\n\t\t\t<partName>Adorata genitrice.</partName>\n\t\t</titleInfo>\n\t\t<name type=\"personal\" authorityURI=\"http://id.loc.gov/authorities/names\"\n\t\t\tvalueURI=\"http://id.loc.gov/authorities/names/n81005197\">\n\n\t\t\t<namePart>Bononcini, Giovanni,</namePart>\n\t\t\t<namePart type=\"date\">1670-1747</namePart>\n\t\t</name>\n\t</relatedItem>\n\n\t<relatedItem type=\"constituent\">\n\t\t<titleInfo>\n\t\t\t<title>Three Viennese arias.</title>\n\n\t\t</titleInfo>\n\t</relatedItem>\n\n\t<relatedItem type=\"constituent\">\n\t\t<titleInfo>\n\t\t\t<title>Viennese arias.</title>\n\t\t</titleInfo>\n\t</relatedItem>\n\n\t<recordInfo>\n\t\t<descriptionStandard>aacr</descriptionStandard>\n\t\t<recordContentSource>DLC</recordContentSource>\n\t\t<recordCreationDate encoding=\"marc\">850813</recordCreationDate>\n\t\t<recordChangeDate encoding=\"iso8601\">19950601141653.9</recordChangeDate>\n\t\t<recordIdentifier>5594130</recordIdentifier>\n\n\t\t<recordOrigin>Converted from MARCXML to MODS version 3.4 using MARC21slim2MODS3-4.xsl\n\t\t\t(Revision 1.74), valueURIs and authority URIs added by hand 20120124</recordOrigin>\n\t</recordInfo>\n</mods>",
		"items": [
			{
				"itemType": "document",
				"title": "3 Viennese arias : for soprano, obbligato clarinet in B flat, and piano",
				"creators": [
					{
						"firstName": "Colin (Colin James)",
						"lastName": "Lawson",
						"creatorType": "author"
					}
				],
				"date": "1984",
				"callNumber": "M1506 .A14 1984",
				"language": "ita; eng",
				"publisher": "Nova Music",
				"attachments": [],
				"tags": [
					"Operas",
					"Songs (High voice) with instrumental ensemble"
				],
				"notes": [
					{
						"note": "statement of responsibility: G.B. Bononcini and Emperor Joseph I ; edited by Colin\n\t\tLawson."
					},
					{
						"note": "Opera excerpts."
					},
					{
						"note": "Acc. arr. for piano; obbligato for the 2nd-3rd excerpts originally for chalumeau."
					},
					{
						"note": "Italian words."
					},
					{
						"note": "Cover title."
					},
					{
						"note": "The 1st excerpt composed for inclusion in M.A. Ziani's Chilonida."
					},
					{
						"note": "Texts with English translations on cover p. [2]."
					},
					{
						"note": "Table of Contents: Tutto in pianto il cor struggete / Emperor Joseph I -- E sempre inquieto quel\n\t\tcore infelice : from Endimione / G. Bononcini -- L'adorata genitrice : from Muzio [i.e.\n\t\tMutio] Scevola / G. Bononcini."
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<mods xmlns=\"http://www.loc.gov/mods/v3\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-4.xsd\" version=\"3.4\">\n    <titleInfo>\n        <title>Directory of computer assisted research in musicology</title>\n    </titleInfo>\n    <titleInfo type=\"alternative\">\n        <title>Computer assisted research in musicology</title>\n    </titleInfo>\n    <name type=\"corporate\">\n        <namePart>Center for Computer Assisted Research in the Humanities</namePart>\n    </name>\n    <typeOfResource>text</typeOfResource>\n    <genre authority=\"marcgt\">directory</genre>\n    <originInfo>\n        <place>\n            <placeTerm type=\"code\" authority=\"marccountry\">cau</placeTerm>\n        </place>\n        <place>\n            <placeTerm type=\"text\">Menlo Park, CA</placeTerm>\n        </place>\n        <publisher>Center for Computer Assisted Research in the Humanities</publisher>\n        <dateIssued>-1988</dateIssued>\n        <dateIssued point=\"start\" encoding=\"marc\">1985</dateIssued>\n        <dateIssued point=\"end\" encoding=\"marc\">1988</dateIssued>\n        <issuance>serial</issuance>\n        <frequency authority=\"marcfrequency\">Annual</frequency>\n        <frequency>Annual</frequency>\n    </originInfo>\n    <language>\n        <languageTerm type=\"code\" authority=\"iso639-2b\">eng</languageTerm>\n    </language>\n    <physicalDescription>\n        <form authority=\"marcform\">print</form>\n        <extent>4 v. : ill., music ; 26 cm.</extent>\n    </physicalDescription>\n    <note type=\"date/sequential designation\">Began in 1985.</note>\n    <note type=\"date/sequential designation\">-1988.</note>\n    <note>Description based on: 1986.</note>\n    <subject authority=\"lcsh\">\n        <topic>Musicology</topic>\n        <topic>Data processing</topic>\n        <genre>Periodicals</genre>\n    </subject>\n    <subject authority=\"lcsh\">\n        <topic>Music</topic>\n        <genre>Bibliography</genre>\n        <genre>Periodicals</genre>\n    </subject>\n    <subject authority=\"lcsh\">\n        <topic>Musicians</topic>\n        <genre>Directories</genre>\n    </subject>\n    <subject authority=\"lcsh\">\n        <topic>Musicologists</topic>\n        <genre>Directories</genre>\n    </subject>\n    <subject authority=\"lcsh\">\n        <topic>Musicology</topic>\n        <topic>Data processing</topic>\n        <genre>Directories</genre>\n    </subject>\n    <classification authority=\"lcc\">ML73 .D57</classification>\n    <classification authority=\"ddc\" edition=\"19\">780/.01/02584</classification>\n    <relatedItem type=\"succeeding\">\n        <titleInfo>\n            <title>Computing in musicology</title>\n        </titleInfo>\n        <identifier type=\"issn\">1057-9478</identifier>\n        <identifier type=\"local\">(DLC)   91656596</identifier>\n        <identifier type=\"local\">(OCoLC)21202412</identifier>\n    </relatedItem>\n    <identifier type=\"lccn\">86646620</identifier>\n    <identifier invalid=\"yes\" type=\"lccn\">86101572</identifier>\n    <identifier type=\"oclc\">ocm14913926</identifier>\n    <recordInfo>\n        <descriptionStandard>aacr</descriptionStandard>\n        <recordContentSource authority=\"marcorg\">DLC</recordContentSource>\n        <recordCreationDate encoding=\"marc\">861202</recordCreationDate>\n        <recordChangeDate encoding=\"iso8601\">20120109163740.0</recordChangeDate>\n        <recordIdentifier>11315879</recordIdentifier>\n        <recordOrigin>Converted from MARCXML to MODS version 3.4 using MARC21slim2MODS3-4.xsl\n        \t\t(Revision 1.76 2012/02/01)</recordOrigin>\n    </recordInfo>\n</mods>",
		"items": [
			{
				"itemType": "document",
				"title": "Directory of computer assisted research in musicology",
				"creators": [
					{
						"lastName": "Center for Computer Assisted Research in the Humanities",
						"fieldMode": 1,
						"creatorType": "author"
					}
				],
				"date": "1985",
				"callNumber": "ML73 .D57, 780/.01/02584",
				"language": "eng",
				"publisher": "Center for Computer Assisted Research in the Humanities",
				"attachments": [],
				"tags": [
					"Data processing",
					"Data processing",
					"Music",
					"Musicians",
					"Musicologists",
					"Musicology",
					"Musicology"
				],
				"notes": [
					{
						"note": "date/sequential designation: Began in 1985."
					},
					{
						"note": "date/sequential designation: -1988."
					},
					{
						"note": "Description based on: 1986."
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<mods xmlns=\"http://www.loc.gov/mods/v3\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-4.xsd\" version=\"3.4\">\n    <titleInfo>\n        <nonSort>The </nonSort>\n        <title>American ballroom companion</title>\n        <subTitle>dance instruction manuals, ca. 1600-1920</subTitle>\n    </titleInfo>\n    <titleInfo type=\"alternative\">\n        <title>Dance instruction manuals, ca. 1600-1920</title>\n    </titleInfo>\n    <name type=\"corporate\">\n        <namePart>Library of Congress</namePart>\n        <namePart>Music Division.</namePart>\n    </name>\n    <name type=\"corporate\">\n        <namePart>Library of Congress</namePart>\n        <namePart>National Digital Library Program.</namePart>\n    </name>\n    <typeOfResource>software, multimedia</typeOfResource>\n    <originInfo>\n        <place>\n            <placeTerm type=\"code\" authority=\"marccountry\">dcu</placeTerm>\n        </place>\n        <place>\n            <placeTerm type=\"text\">Washington, D.C</placeTerm>\n        </place>\n        <publisher>Library of Congress</publisher>\n        <dateIssued>1998-]</dateIssued>\n        <dateIssued point=\"start\" encoding=\"marc\">1998</dateIssued>\n        <dateIssued point=\"end\" encoding=\"marc\">9999</dateIssued>\n        <issuance>monographic</issuance>\n    </originInfo>\n    <language>\n        <languageTerm type=\"code\" authority=\"iso639-2b\">eng</languageTerm>\n    </language>\n    <physicalDescription>\n        <form authority=\"marcform\">electronic</form>\n        <form authority=\"gmd\">electronic resource</form>\n        <form>Computer data and programs.</form>\n    </physicalDescription>\n    <abstract>Presents over two hundred social dance manuals, pocket-sized books with diagrams used by itinerant dancing masters to teach the American gentry the latest dance steps. Includes anti-dance manuals as well as treatises on etiquette. Offered as part of the American Memory online resource compiled by the National Digital Library Program of the Library of Congress.</abstract>\n    <note>Title from title screen dated Mar. 23, 1998.</note>\n    <note type=\"system details\">System requirements: World Wide Web (WWW) browser software.</note>\n    <note type=\"system details\">Mode of access: Internet.</note>\n    <subject>\n        <geographicCode authority=\"marcgac\">n-us---</geographicCode>\n    </subject>\n    <subject authority=\"lcsh\">\n        <topic>Ballroom dancing</topic>\n        <geographic>United States</geographic>\n    </subject>\n    <classification authority=\"lcc\">GV1623</classification>\n    <classification authority=\"ddc\" edition=\"13\">793.3</classification>\n    <location>\n        <url displayLabel=\"electronic resource\" usage=\"primary display\">http://hdl.loc.gov/loc.music/collmus.mu000010</url>\n    </location>\n    <identifier type=\"lccn\">98801326</identifier>\n    <identifier type=\"hdl\">hdl:loc.music/collmus.mu000010</identifier>\n    <identifier type=\"hdl\">hdl:loc.music/collmus.mu000010</identifier>\n    <recordInfo>\n        <descriptionStandard>aacr</descriptionStandard>\n        <recordContentSource authority=\"marcorg\">DLC</recordContentSource>\n        <recordCreationDate encoding=\"marc\">980323</recordCreationDate>\n        <recordChangeDate encoding=\"iso8601\">20060131154904.0</recordChangeDate>\n        <recordIdentifier>5004836</recordIdentifier>\n        <recordOrigin>Converted from MARCXML to MODS version 3.4 using MARC21slim2MODS3-4.xsl\n        \t\t(Revision 1.76 2012/02/01)</recordOrigin>\n    </recordInfo>\n</mods>",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "The American ballroom companion: dance instruction manuals, ca. 1600-1920",
				"creators": [
					{
						"lastName": "Library of Congress: Music Division.",
						"fieldMode": 1,
						"creatorType": "author"
					},
					{
						"lastName": "Library of Congress: National Digital Library Program.",
						"fieldMode": 1,
						"creatorType": "author"
					}
				],
				"date": "1998",
				"abstractNote": "Presents over two hundred social dance manuals, pocket-sized books with diagrams used by itinerant dancing masters to teach the American gentry the latest dance steps. Includes anti-dance manuals as well as treatises on etiquette. Offered as part of the American Memory online resource compiled by the National Digital Library Program of the Library of Congress.",
				"callNumber": "GV1623, 793.3",
				"company": "Library of Congress",
				"place": "Washington, D.C",
				"url": "http://hdl.loc.gov/loc.music/collmus.mu000010",
				"attachments": [],
				"tags": [
					"Ballroom dancing"
				],
				"notes": [
					{
						"note": "Title from title screen dated Mar. 23, 1998."
					},
					{
						"note": "system details: System requirements: World Wide Web (WWW) browser software."
					},
					{
						"note": "system details: Mode of access: Internet."
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<mods xmlns=\"http://www.loc.gov/mods/v3\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-4.xsd\" version=\"3.4\">\n    <titleInfo>\n        <title>Papers from the First International Workshop on Plasma-Based Ion Implantation</title>\n        <subTitle>4-6 August 1993, University of Wisconsin--Madison, Madison, Wisconsin</subTitle>\n    </titleInfo>\n    <name type=\"conference\">\n        <namePart>International Workshop on Plasma-Based Ion Implantation 1993 : University of Wisconsin--Madison)</namePart>\n    </name>\n    <name type=\"personal\">\n        <namePart>Conrad, John R.</namePart>\n    </name>\n    <name type=\"personal\">\n        <namePart>Sridharan, Kumar.</namePart>\n    </name>\n    <name type=\"corporate\">\n        <namePart>Applied Science and Technology (ASTeX), Inc</namePart>\n    </name>\n    <typeOfResource>text</typeOfResource>\n    <genre authority=\"marcgt\">bibliography</genre>\n    <genre authority=\"marcgt\">conference publication</genre>\n    <originInfo>\n        <place>\n            <placeTerm type=\"code\" authority=\"marccountry\">nyu</placeTerm>\n        </place>\n        <place>\n            <placeTerm type=\"text\">New York</placeTerm>\n        </place>\n        <publisher>Published for the American Vacuum Society by the American Institute of Physics</publisher>\n        <dateIssued>1994</dateIssued>\n        <issuance>monographic</issuance>\n    </originInfo>\n    <language>\n        <languageTerm type=\"code\" authority=\"iso639-2b\">eng</languageTerm>\n    </language>\n    <physicalDescription>\n        <form authority=\"marcform\">print</form>\n        <extent>p. 813-998 : ill. ; 30 cm.</extent>\n    </physicalDescription>\n    <note>\"Published in both 1994 March/April issue of the Journal of vacuum science and technology B, vol. 12, no. 2\"--T.p. verso.</note>\n    <note type=\"bibliography\">Includes bibliographical references and index.</note>\n    <subject authority=\"lcsh\">\n        <topic>Ion implantation</topic>\n        <topic>Congresses</topic>\n    </subject>\n    <classification authority=\"lcc\">TS695.25 .I57 1993</classification>\n    <classification authority=\"ddc\" edition=\"21\">621.3815/2</classification>\n    <relatedItem type=\"host\">\n        <titleInfo>\n            <title>Journal of vacuum science &amp; technology. B, Microelectronics and nanometer structures processing, measurement and phenomena</title>\n        </titleInfo>\n        <identifier type=\"issn\">1071-1023</identifier>\n        <identifier type=\"local\">(OCoLC)23276603</identifier>\n        <identifier type=\"local\">(DLC)sn 92021098</identifier>\n        <part>\n            <text>2nd ser., v. 12, no. 2</text>\n        </part>\n    </relatedItem>\n    <identifier type=\"isbn\">1563963442</identifier>\n    <identifier type=\"lccn\">97129132</identifier>\n    <identifier type=\"oclc\">35547175</identifier>\n    <recordInfo>\n        <descriptionStandard>aacr</descriptionStandard>\n        <recordContentSource authority=\"marcorg\">DLC</recordContentSource>\n        <recordCreationDate encoding=\"marc\">940504</recordCreationDate>\n        <recordChangeDate encoding=\"iso8601\">19970618142736.9</recordChangeDate>\n        <recordIdentifier>4968605</recordIdentifier>\n        <recordOrigin>Converted from MARCXML to MODS version 3.4 using MARC21slim2MODS3-4.xsl\n        \t\t(Revision 1.76 2012/02/01)</recordOrigin>\n    </recordInfo>\n</mods>",
		"items": [
			{
				"itemType": "book",
				"title": "Papers from the First International Workshop on Plasma-Based Ion Implantation: 4-6 August 1993, University of Wisconsin--Madison, Madison, Wisconsin",
				"creators": [
					{
						"lastName": "International Workshop on Plasma-Based Ion Implantation 1993 : University of Wisconsin--Madison)",
						"fieldMode": 1,
						"creatorType": "author"
					},
					{
						"firstName": "John R.",
						"lastName": "Conrad",
						"creatorType": "author"
					},
					{
						"firstName": "Kumar",
						"lastName": "Sridharan",
						"creatorType": "author"
					},
					{
						"lastName": "Applied Science and Technology (ASTeX), Inc",
						"fieldMode": 1,
						"creatorType": "author"
					}
				],
				"date": "1994",
				"ISBN": "1563963442",
				"bookTitle": "Journal of vacuum science & technology. B, Microelectronics and nanometer structures processing, measurement and phenomena",
				"callNumber": "TS695.25 .I57 1993, 621.3815/2",
				"language": "eng",
				"pages": "813-998",
				"place": "New York",
				"publisher": "Published for the American Vacuum Society by the American Institute of Physics",
				"attachments": [],
				"tags": [
					"Congresses",
					"Ion implantation"
				],
				"notes": [
					{
						"note": "\"Published in both 1994 March/April issue of the Journal of vacuum science and technology B, vol. 12, no. 2\"--T.p. verso."
					},
					{
						"note": "bibliography: Includes bibliographical references and index."
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<mods xmlns=\"http://www.loc.gov/mods/v3\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-4.xsd\" version=\"3.4\">\n    <titleInfo>\n        <title>Campbell County, Wyoming</title>\n    </titleInfo>\n    <name type=\"corporate\">\n        <namePart>Campbell County Chamber of Commerce</namePart>\n    </name>\n    <typeOfResource>cartographic</typeOfResource>\n    <genre authority=\"marcgt\">map</genre>\n    <originInfo>\n        <place>\n            <placeTerm type=\"code\" authority=\"marccountry\">wyu</placeTerm>\n        </place>\n        <place>\n            <placeTerm type=\"text\">Gillette, Wyo.]</placeTerm>\n        </place>\n        <publisher>Campbell County Chamber of Commerce</publisher>\n        <dateIssued>[1982?]</dateIssued>\n        <dateIssued encoding=\"marc\">1982</dateIssued>\n        <issuance>monographic</issuance>\n    </originInfo>\n    <language>\n        <languageTerm type=\"code\" authority=\"iso639-2b\">eng</languageTerm>\n    </language>\n    <physicalDescription>\n        <extent>1 map ; 33 x 15 cm.</extent>\n    </physicalDescription>\n    <note>In lower right corner: Kintzels-Casper.</note>\n    <subject>\n        <cartographics>\n            <scale>Scale [ca. 1:510,000].</scale>\n        </cartographics>\n    </subject>\n    <subject authority=\"lcsh\">\n        <geographic>Campbell County (Wyo.)</geographic>\n        <topic>Maps</topic>\n    </subject>\n    <classification authority=\"lcc\">G4263.C3 1982  .C3</classification>\n    <identifier type=\"lccn\">83691515</identifier>\n    <recordInfo>\n        <descriptionStandard>aacr</descriptionStandard>\n        <recordContentSource authority=\"marcorg\">DLC</recordContentSource>\n        <recordCreationDate encoding=\"marc\">830222</recordCreationDate>\n        <recordChangeDate encoding=\"iso8601\">19830426000000.0</recordChangeDate>\n        <recordIdentifier>5466714</recordIdentifier>\n        <recordOrigin>Converted from MARCXML to MODS version 3.4 using MARC21slim2MODS3-4.xsl\n        \t\t(Revision 1.76 2012/02/01)</recordOrigin>\n    </recordInfo>\n</mods>",
		"items": [
			{
				"itemType": "map",
				"title": "Campbell County, Wyoming",
				"creators": [
					{
						"lastName": "Campbell County Chamber of Commerce",
						"fieldMode": 1,
						"creatorType": "author"
					}
				],
				"date": "1982",
				"callNumber": "G4263.C3 1982  .C3",
				"language": "eng",
				"place": "Gillette, Wyo.]",
				"publisher": "Campbell County Chamber of Commerce",
				"scale": "1:510,000",
				"attachments": [],
				"tags": [
					"Maps"
				],
				"notes": [
					{
						"note": "In lower right corner: Kintzels-Casper."
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<mods xmlns=\"http://www.loc.gov/mods/v3\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-4.xsd\" version=\"3.4\">\n    <titleInfo>\n        <title>3 Viennese arias</title>\n        <subTitle>for soprano, obbligato clarinet in B flat, and piano</subTitle>\n    </titleInfo>\n    <titleInfo type=\"alternative\">\n        <title>Three Viennese arias</title>\n    </titleInfo>\n    <titleInfo type=\"alternative\">\n        <title>Viennese arias</title>\n    </titleInfo>\n    <name type=\"personal\">\n        <namePart>Lawson, Colin (Colin James)</namePart>\n    </name>\n    <name type=\"personal\">\n        <namePart>Joseph</namePart>\n        <namePart type=\"termsOfAddress\">I, Holy Roman Emperor</namePart>\n        <namePart type=\"date\">1678-1711</namePart>\n    </name>\n    <name type=\"personal\">\n        <namePart>Bononcini, Giovanni</namePart>\n        <namePart type=\"date\">1670-1747</namePart>\n    </name>\n    <name type=\"personal\">\n        <namePart>Bononcini, Giovanni</namePart>\n        <namePart type=\"date\">1670-1747</namePart>\n    </name>\n    <typeOfResource>notated music</typeOfResource>\n    <originInfo>\n        <place>\n            <placeTerm type=\"code\" authority=\"marccountry\">enk</placeTerm>\n        </place>\n        <place>\n            <placeTerm type=\"text\">London</placeTerm>\n        </place>\n        <publisher>Nova Music</publisher>\n        <dateIssued>c1984</dateIssued>\n        <dateIssued encoding=\"marc\">1984</dateIssued>\n        <issuance>monographic</issuance>\n    </originInfo>\n    <language>\n        <languageTerm type=\"code\" authority=\"iso639-2b\">ita</languageTerm>\n    </language>\n    <language objectPart=\"libretto\">\n        <languageTerm type=\"code\" authority=\"iso639-2b\">eng</languageTerm>\n    </language>\n    <physicalDescription>\n        <form authority=\"marcform\">print</form>\n        <extent>1 score (12 p.) + 2 parts ; 31 cm.</extent>\n    </physicalDescription>\n    <tableOfContents>Tutto in pianto il cor struggete / Emperor Joseph I -- E sempre inquieto quel core infelice : from Endimione / G. Bononcini -- L'adorata genitrice : from Muzio [i.e. Mutio] Scevola / G. Bononcini.</tableOfContents>\n    <note>Opera excerpts.</note>\n    <note>Acc. arr. for piano; obbligato for the 2nd-3rd excerpts originally for chalumeau.</note>\n    <note>Italian words.</note>\n    <note>Cover title.</note>\n    <note>The 1st excerpt composed for inclusion in M.A. Ziani's Chilonida.</note>\n    <note>Texts with English translations on cover p. [2].</note>\n    <subject authority=\"lcsh\">\n        <topic>Operas</topic>\n        <topic>Excerpts, Arranged</topic>\n        <topic>Scores and parts</topic>\n    </subject>\n    <subject authority=\"lcsh\">\n        <topic>Songs (High voice) with instrumental ensemble</topic>\n        <topic>Scores and parts</topic>\n    </subject>\n    <classification authority=\"lcc\">M1506 .A14 1984</classification>\n    <relatedItem type=\"series\">\n        <titleInfo>\n            <title>Music for voice and instrument</title>\n        </titleInfo>\n    </relatedItem>\n    <relatedItem type=\"constituent\">\n        <titleInfo>\n            <title>Tutto in pianto il cor struggete; arr. 1984</title>\n        </titleInfo>\n        <name type=\"personal\">\n            <namePart>Joseph</namePart>\n            <namePart type=\"termsOfAddress\">I, Holy Roman Emperor</namePart>\n            <namePart type=\"date\">1678-1711</namePart>\n        </name>\n    </relatedItem>\n    <relatedItem type=\"constituent\">\n        <titleInfo>\n            <title>Endimione. arr. 1984</title>\n            <partName>E sempre inquieto quel core infelice; arr. 1984</partName>\n        </titleInfo>\n        <name type=\"personal\">\n            <namePart>Bononcini, Giovanni,</namePart>\n            <namePart type=\"date\">1670-1747</namePart>\n        </name>\n    </relatedItem>\n    <relatedItem type=\"constituent\">\n        <titleInfo>\n            <title>Mutio Scevola. arr. 1984</title>\n            <partName>Adorata genitrice; arr. 1984</partName>\n        </titleInfo>\n        <name type=\"personal\">\n            <namePart>Bononcini, Giovanni,</namePart>\n            <namePart type=\"date\">1670-1747</namePart>\n        </name>\n    </relatedItem>\n    <identifier type=\"lccn\">85753651</identifier>\n    <identifier type=\"music publisher\">N.M. 275 Nova Music</identifier>\n    <recordInfo>\n        <descriptionStandard>aacr</descriptionStandard>\n        <recordContentSource authority=\"marcorg\">DLC</recordContentSource>\n        <recordCreationDate encoding=\"marc\">850813</recordCreationDate>\n        <recordChangeDate encoding=\"iso8601\">19950601141653.9</recordChangeDate>\n        <recordIdentifier>5594130</recordIdentifier>\n        <recordOrigin>Converted from MARCXML to MODS version 3.4 using MARC21slim2MODS3-4.xsl\n        \t\t(Revision 1.76 2012/02/01)</recordOrigin>\n    </recordInfo>\n</mods>",
		"items": [
			{
				"itemType": "document",
				"title": "3 Viennese arias: for soprano, obbligato clarinet in B flat, and piano",
				"creators": [
					{
						"firstName": "Colin (Colin James)",
						"lastName": "Lawson",
						"creatorType": "author"
					},
					{
						"lastName": "Joseph",
						"creatorType": "author"
					},
					{
						"firstName": "Giovanni",
						"lastName": "Bononcini",
						"creatorType": "author"
					},
					{
						"firstName": "Giovanni",
						"lastName": "Bononcini",
						"creatorType": "author"
					}
				],
				"date": "1984",
				"callNumber": "M1506 .A14 1984",
				"language": "ita; eng",
				"publisher": "Nova Music",
				"attachments": [],
				"tags": [
					"Excerpts, Arranged",
					"Operas",
					"Scores and parts",
					"Scores and parts",
					"Songs (High voice) with instrumental ensemble"
				],
				"notes": [
					{
						"note": "Opera excerpts."
					},
					{
						"note": "Acc. arr. for piano; obbligato for the 2nd-3rd excerpts originally for chalumeau."
					},
					{
						"note": "Italian words."
					},
					{
						"note": "Cover title."
					},
					{
						"note": "The 1st excerpt composed for inclusion in M.A. Ziani's Chilonida."
					},
					{
						"note": "Texts with English translations on cover p. [2]."
					},
					{
						"note": "Table of Contents: Tutto in pianto il cor struggete / Emperor Joseph I -- E sempre inquieto quel core infelice : from Endimione / G. Bononcini -- L'adorata genitrice : from Muzio [i.e. Mutio] Scevola / G. Bononcini."
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<mods xmlns=\"http://www.loc.gov/mods/v3\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-4.xsd\" version=\"3.4\">\n    <titleInfo>\n        <title>2001 bluegrass odyssey</title>\n    </titleInfo>\n    <name type=\"corporate\">\n        <namePart>Roustabouts (Musical group)</namePart>\n        <role>\n            <roleTerm type=\"code\" authority=\"marcrelator\">prf</roleTerm>\n        </role>\n    </name>\n    <typeOfResource>sound recording-musical</typeOfResource>\n    <originInfo>\n        <place>\n            <placeTerm type=\"code\" authority=\"marccountry\">ncu</placeTerm>\n        </place>\n        <place>\n            <placeTerm type=\"text\">Charlotte, NC</placeTerm>\n        </place>\n        <publisher>Lamon Records</publisher>\n        <dateIssued>p1980</dateIssued>\n        <dateIssued encoding=\"marc\">1980</dateIssued>\n        <issuance>monographic</issuance>\n    </originInfo>\n    <language>\n        <languageTerm type=\"code\" authority=\"iso639-2b\">eng</languageTerm>\n    </language>\n    <physicalDescription>\n        <form authority=\"gmd\">sound recording</form>\n        <form authority=\"marccategory\">sound recording</form>\n        <form authority=\"marcsmd\">sound disc</form>\n        <extent>1 sound disc : analog, 33 1/3 rpm ; 12 in.</extent>\n    </physicalDescription>\n    <tableOfContents>Bluegrass odyssey -- Hills of Tennessee -- Sassafrass -- Muddy river -- Take your shoes off Moses -- Don't let Smokey Mountain smoke get in your eyes -- Farewell party -- Faded love -- Super sonic bluegrass -- Old love letters -- Will the circle be unbroken.</tableOfContents>\n    <note>Brief record.</note>\n    <note type=\"performers\">Performed by the Roustabouts.</note>\n    <subject authority=\"lcsh\">\n        <topic>Country music</topic>\n        <temporal>1971-1980</temporal>\n    </subject>\n    <subject authority=\"lcsh\">\n        <topic>Bluegrass music</topic>\n        <temporal>1971-1980</temporal>\n    </subject>\n    <classification authority=\"lcc\">Lamon Records LR-4280</classification>\n    <identifier type=\"lccn\">94759273</identifier>\n    <identifier type=\"issue number\">LR-4280 Lamon Records</identifier>\n    <identifier type=\"oclc\">31023015</identifier>\n    <recordInfo>\n        <descriptionStandard>aacr</descriptionStandard>\n        <recordContentSource authority=\"marcorg\">DLC</recordContentSource>\n        <recordCreationDate encoding=\"marc\">940829</recordCreationDate>\n        <recordChangeDate encoding=\"iso8601\">19940830080228.8</recordChangeDate>\n        <recordIdentifier>5718053</recordIdentifier>\n        <recordOrigin>Converted from MARCXML to MODS version 3.4 using MARC21slim2MODS3-4.xsl\n        \t\t(Revision 1.76 2012/02/01)</recordOrigin>\n    </recordInfo>\n</mods>",
		"items": [
			{
				"itemType": "audioRecording",
				"title": "2001 bluegrass odyssey",
				"creators": [
					{
						"lastName": "Roustabouts (Musical group)",
						"fieldMode": 1,
						"creatorType": "author"
					}
				],
				"date": "1980",
				"callNumber": "Lamon Records LR-4280",
				"label": "Lamon Records",
				"language": "eng",
				"numberOfVolumes": "1",
				"place": "Charlotte, NC",
				"attachments": [],
				"tags": [
					"Bluegrass music",
					"Country music"
				],
				"notes": [
					{
						"note": "Brief record."
					},
					{
						"note": "performers: Performed by the Roustabouts."
					},
					{
						"note": "Table of Contents: Bluegrass odyssey -- Hills of Tennessee -- Sassafrass -- Muddy river -- Take your shoes off Moses -- Don't let Smokey Mountain smoke get in your eyes -- Farewell party -- Faded love -- Super sonic bluegrass -- Old love letters -- Will the circle be unbroken."
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<mods xmlns=\"http://www.loc.gov/mods/v3\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-4.xsd\" version=\"3.4\">\n    <titleInfo>\n        <title>Massachusetts death and marriage records, 1837-1897</title>\n    </titleInfo>\n    <typeOfResource collection=\"yes\" manuscript=\"yes\">mixed material</typeOfResource>\n    <originInfo>\n        <issuance>monographic</issuance>\n    </originInfo>\n    <language>\n        <languageTerm type=\"code\" authority=\"iso639-2b\">eng</languageTerm>\n    </language>\n    <physicalDescription>\n        <extent>2 volumes.</extent>\n    </physicalDescription>\n    <abstract>Records of deaths and marriages in Millbury and Springfield, Mass.</abstract>\n    <accessCondition type=\"restrictionOnAccess\">Open to research.</accessCondition>\n    <note type=\"acquisition\">Purchase, 1946.</note>\n    <note type=\"language\">Collection material in English.</note>\n    <note>Forms part of: Miscellaneous Manuscripts collection.</note>\n    <subject authority=\"lcsh\">\n        <topic>Registers of births, etc</topic>\n        <geographic>Massachusetts</geographic>\n        <geographic>Millbury</geographic>\n    </subject>\n    <subject authority=\"lcsh\">\n        <topic>Registers of births, etc</topic>\n        <geographic>Massachusetts</geographic>\n        <geographic>Springfield</geographic>\n    </subject>\n    <location>\n        <physicalLocation>Library of Congress Manuscript Division Washington, D.C. 20540 USA</physicalLocation>\n        <physicalLocation xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"http://hdl.loc.gov/loc.mss/mss.home\">http://hdl.loc.gov/loc.mss/mss.home</physicalLocation>\n    </location>\n    <identifier type=\"lccn\">mm 83001404</identifier>\n    <recordInfo>\n        <descriptionStandard>aacr</descriptionStandard>\n        <descriptionStandard>dacs</descriptionStandard>\n        <recordContentSource authority=\"marcorg\">DLC</recordContentSource>\n        <recordCreationDate encoding=\"marc\">830926</recordCreationDate>\n        <recordChangeDate encoding=\"iso8601\">20110707103737.0</recordChangeDate>\n        <recordIdentifier>5810505</recordIdentifier>\n        <recordOrigin>Converted from MARCXML to MODS version 3.4 using MARC21slim2MODS3-4.xsl\n        \t\t(Revision 1.76 2012/02/01)</recordOrigin>\n    </recordInfo>\n</mods>",
		"items": [
			{
				"itemType": "document",
				"title": "Massachusetts death and marriage records, 1837-1897",
				"creators": [],
				"abstractNote": "Records of deaths and marriages in Millbury and Springfield, Mass.",
				"archiveLocation": "Library of Congress Manuscript Division Washington, D.C. 20540 USA; http://hdl.loc.gov/loc.mss/mss.home",
				"language": "eng",
				"rights": "Open to research.",
				"attachments": [],
				"tags": [
					"Registers of births, etc",
					"Registers of births, etc"
				],
				"notes": [
					{
						"note": "acquisition: Purchase, 1946."
					},
					{
						"note": "language: Collection material in English."
					},
					{
						"note": "Forms part of: Miscellaneous Manuscripts collection."
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<mods version=\"3.6\" xmlns=\"http://www.loc.gov/mods/v3\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-6.xsd\">\n   <titleInfo>\n      <title>Ludvig Holbergs udvalgte Skrifter</title>\n      <partNumber>D. 1-6 B. 4</partNumber>\n      <partName>Holbergs Comedier</partName>\n   </titleInfo>\n   <titleInfo type=\"alternative\">\n      <title>Den honette Ambition</title>\n   </titleInfo>\n   <titleInfo type=\"alternative\">\n      <title>Den Stundesløse</title>\n   </titleInfo>\n   <titleInfo type=\"alternative\">\n      <title>De Usynlige</title>\n   </titleInfo>\n   <titleInfo type=\"alternative\">\n      <title>Pernilles korte Frøkenstand</title>\n   </titleInfo>\n   <titleInfo type=\"alternative\">\n      <title>Erasmus Montanus</title>\n   </titleInfo>\n   <titleInfo type=\"alternative\">\n      <title>Det lykkelige Skibbrud</title>\n   </titleInfo>\n   <titleInfo type=\"alternative\">\n      <title>Den pantsatte Bondedreng</title>\n   </titleInfo>\n   <titleInfo type=\"alternative\">\n      <title>Comedier</title>\n   </titleInfo>\n   <titleInfo type=\"alternative\">\n      <title>Udvalgte Skrifter</title>\n   </titleInfo>\n   <name type=\"personal\" usage=\"primary\">\n      <namePart>Holberg, Ludvig</namePart>\n      <namePart type=\"date\">1684-1754</namePart>\n      <nameIdentifier>bibsys.no:authority:90073658</nameIdentifier>\n   </name>\n   <name type=\"personal\">\n      <namePart>Rahbek, K.L.</namePart>\n      <nameIdentifier>bibsys.no:authority:90253663</nameIdentifier>\n   </name>\n   <typeOfResource>text</typeOfResource>\n   <genre type=\"literaryform\">fiction</genre>\n   <genre authority=\"marcgt\">fiction</genre>\n   <originInfo>\n      <place>\n         <placeTerm authority=\"marccountry\" type=\"code\">dk</placeTerm>\n      </place>\n      <place>\n         <placeTerm authority=\"iso3166\" type=\"code\">dk</placeTerm>\n      </place>\n      <place>\n         <placeTerm type=\"text\">Kjøbenhavn</placeTerm>\n      </place>\n      <publisher>Schultz</publisher>\n      <dateIssued>1805</dateIssued>\n      <issuance>monographic</issuance>\n   </originInfo>\n   <language>\n      <languageTerm authority=\"iso639-2b\" type=\"code\">dan</languageTerm>\n   </language>\n   <physicalDescription>\n      <form authority=\"marcform\">print</form>\n      <form authority=\"marccategory\">electronic resource</form>\n      <form authority=\"marcsmd\">remote</form>\n      <form authority=\"marccategory\">text</form>\n      <form authority=\"marcsmd\">regular print</form>\n      <extent>XII, 532 s.</extent>\n   </physicalDescription>\n   <accessCondition type=\"restriction on access\"/>\n   <note type=\"reproduction\">Elektronisk reproduksjon [Norge] Nasjonalbiblioteket Digital 2014-02-07</note>\n   <subject>\n      <name type=\"personal\">\n         <namePart>Holberg, Ludvig</namePart>\n         <namePart type=\"date\">1684-1754</namePart>\n      </name>\n   </subject>\n   <location>\n      <url displayLabel=\"Fulltekst NB digitalisert\" note=\"Elektronisk reproduksjon. Gratis\" usage=\"primary display\">http://urn.nb.no/URN:NBN:no-nb_digibok_2012051624006</url>\n   </location>\n   <location>\n      <url displayLabel=\"Fulltekst NB digitalisert\" note=\"Elektronisk reproduksjon. Gratis\">http://urn.nb.no/URN:NBN:no-nb_digibok_2014012024006</url>\n   </location>\n   <location>\n      <url displayLabel=\"electronic resource\" note=\"Elektronisk reproduksjon. Gratis\" usage=\"primary display\">http://urn.nb.no/URN:NBN:no-nb_digibok_2012051624006</url>\n   </location>\n   <identifier type=\"urn\">URN:NBN:no-nb_digibok_2012051624006</identifier>\n   <location>\n      <url displayLabel=\"electronic resource\" note=\"Elektronisk reproduksjon. Gratis\">http://urn.nb.no/URN:NBN:no-nb_digibok_2014012024006</url>\n   </location>\n   <identifier type=\"urn\">URN:NBN:no-nb_digibok_2014012024006</identifier>\n   <location>\n      <physicalLocation authority=\"isil\">NO-0183300</physicalLocation>\n      <holdingSimple>\n         <copyInformation>\n            <subLocation>0183300</subLocation>\n         </copyInformation>\n      </holdingSimple>\n   </location>\n   <location>\n      <physicalLocation authority=\"isil\">NO-0030100</physicalLocation>\n      <holdingSimple>\n         <copyInformation>\n            <subLocation>0030100</subLocation>\n            <note>(ib.) (Proveniens Johan Schweigaard) (Til bruk på NB Oslos lesesal)</note>\n         </copyInformation>\n      </holdingSimple>\n   </location>\n   <location>\n      <physicalLocation authority=\"isil\">NO-0030100</physicalLocation>\n      <holdingSimple>\n         <copyInformation>\n            <subLocation>0030100</subLocation>\n            <note>(ib.) (Til bruk på Spesiallesesalen)</note>\n         </copyInformation>\n      </holdingSimple>\n   </location>\n   <location>\n      <physicalLocation authority=\"isil\">NO-0030100</physicalLocation>\n      <holdingSimple>\n         <copyInformation>\n            <subLocation>0030100</subLocation>\n            <note>(ib.) (Til bruk på Spesiallesesalen)</note>\n         </copyInformation>\n      </holdingSimple>\n   </location>\n   <relatedItem displayLabel=\"Inkludert i\" type=\"host\">\n      <titleInfo>\n         <title>Ludvig Holbergs udvalgte Skrifter. D. 1-6, Holbergs Comedier</title>\n      </titleInfo>\n      <name>\n         <namePart>Holberg, Ludvig, 1684-1754</namePart>\n      </name>\n      <originInfo>\n         <publisher>Kjøbenhavn : Schultz, 1804-1806</publisher>\n      </originInfo>\n      <identifier type=\"local\">999417135394702201</identifier>\n      <part>\n         <text>B. 4</text>\n      </part>\n   </relatedItem>\n   <identifier type=\"oldoaiid\">oai:bibsys.no:biblio:941621081</identifier>\n   <identifier type=\"oldoaiid\">oai:bibsys.no:biblio:121586413</identifier>\n   <identifier type=\"uri\">http://urn.nb.no/URN:NBN:no-nb_digibok_2012051624006</identifier>\n   <identifier type=\"uri\">http://urn.nb.no/URN:NBN:no-nb_digibok_2014012024006</identifier>\n   <recordInfo>\n      <descriptionStandard>katreg</descriptionStandard>\n      <recordContentSource authority=\"marcorg\">NO-TrBIB</recordContentSource>\n      <recordCreationDate encoding=\"marc\">120621</recordCreationDate>\n      <recordChangeDate encoding=\"iso8601\">20170126171829.0</recordChangeDate>\n      <recordIdentifier source=\"nb.bibsys.no\">999416210814702202</recordIdentifier>\n      <recordOrigin>Converted from MARCXML to MODS version 3.6 using a customized MARC21slim2MODS3-5.xsl\n                (based on 3.5 Revision 1.106 2014/12/19)</recordOrigin>\n      <languageOfCataloging>\n         <languageTerm authority=\"iso639-2b\" type=\"code\">nob</languageTerm>\n      </languageOfCataloging>\n   </recordInfo>\n   <relatedItem displayLabel=\"Del av Bibliografien\" type=\"host\">\n      <titleInfo>\n         <title>Schweigaardsamlingen</title>\n      </titleInfo>\n      <genre authority=\"marcgt\">bibliography</genre>\n   </relatedItem>\n   <identifier type=\"sesamid\">4c8b333d27a2eb37c35f99ce42a679bf</identifier>\n   <identifier type=\"oaiid\">oai:nb.bibsys.no:999416210814702202</identifier>\n</mods>",
		"items": [
			{
				"itemType": "book",
				"title": "Ludvig Holbergs udvalgte Skrifter. D. 1-6 B. 4: Holbergs Comedier",
				"creators": [
					{
						"firstName": "Ludvig",
						"lastName": "Holberg",
						"creatorType": "author"
					},
					{
						"firstName": "K. L.",
						"lastName": "Rahbek",
						"creatorType": "author"
					},
					{
						"lastName": "Holberg, Ludvig, 1684-1754",
						"fieldMode": 1,
						"creatorType": "contributor"
					}
				],
				"date": "1805",
				"archiveLocation": "NO-0183300; NO-0030100; NO-0030100; NO-0030100",
				"language": "dan",
				"place": "Kjøbenhavn",
				"publisher": "Kjøbenhavn : Schultz, 1804-1806",
				"url": "http://urn.nb.no/URN:NBN:no-nb_digibok_2012051624006",
				"attachments": [],
				"tags": [],
				"notes": [
					{
						"note": "reproduction: Elektronisk reproduksjon [Norge] Nasjonalbiblioteket Digital 2014-02-07"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
