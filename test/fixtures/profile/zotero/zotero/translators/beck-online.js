{
	"translatorID": "e8544423-1515-4daf-bb5d-3202bf422b58",
	"label": "beck-online",
	"creator": "Philipp Zumstein",
	"target": "^https?://beck-online\\.beck\\.de/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2019-06-03 15:12:35"
}

/*
	***** BEGIN LICENSE BLOCK *****

	beck-online Translator, Copyright © 2014 Philipp Zumstein
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


var mappingClassNameToItemType = {
	ZAUFSATZ: 'journalArticle',
	ZRSPR: 'case', // Rechtssprechung
	ZRSPRAKT: 'case',
	BECKRS: 'case',
	ZENTB: 'journalArticle', // Entscheidungsbesprechung
	ZBUCHB: 'journalArticle', // Buchbesprechung
	ZSONST: 'journalArticle', // Sonstiges, z.B. Vorwort,
	LSK: 'journalArticle', // Artikel in Leitsatzkartei
	ZINHALTVERZ: 'multiple', // Inhaltsverzeichnis
	KOMMENTAR: 'encyclopediaArticle',
	ALTEVERSION: 'encyclopediaArticle',
	'ALTEVERSION KOMMENTAR': 'encyclopediaArticle',
	HANDBUCH: 'encyclopediaArticle',
	BUCH: 'book',
	// ? 'FESTSCHRIFT' : 'bookSection'
};

// build a regular expression for author cleanup in authorRemoveTitlesEtc()
var authorTitlesEtc = ['\\/',
	'Dr\\.',
	'\\b[ji]ur\\.',
	'\\bh\\. c\\.',
	'Prof\\.',
	'Professor(?:in)?',
	'\\bwiss\\.',
	'Mitarbeiter(?:in)?',
	'RA,?',
	'PD',
	'FAArbR',
	'Fachanwalt für Insolvenzrecht',
	'Rechtsanw[aä]lt(?:e|in)?',
	'Richter am (?:AG|LG|OLG|BGH)',
	'\\bzur Fussnote',
	'LL\\.\\s?M\\.(?: \\(UCLA\\))?',
	'^Von',
	"\\*"];
var authorRegEx = new RegExp(authorTitlesEtc.join('|'), 'g');


function detectWeb(doc, _url) {
	var dokument = doc.getElementById("dokument");
	if (!dokument) {
		return getSearchResults(doc, true) ? "multiple" : false;
	}
	
	var type = mappingClassNameToItemType[dokument.className.toUpperCase()];
	// Z.debug(dokument.className.toUpperCase());
	if (type == 'multiple') {
		return getSearchResults(doc, true) ? "multiple" : false;
	}
	
	return type;
}

function getSearchResults(doc, checkOnly) {
	var items = {}, found = false,
		rows = ZU.xpath(doc, '//div[@class="inh"]//span[@class="inhdok"]//a | //div[@class="autotoc"]//a | //div[@id="trefferliste"]//a[@class="sndline"]');

	for (var i = 0; i < rows.length; i++) {
		// rows[i] contains an invisible span with some text, which we have to exclude, e.g.
		//   <span class="unsichtbar">BKR Jahr 2014 Seite </span>
		//   Dr. iur. habil. Christian Hofmann: Haftung im Zahlungsverkehr
		var title = ZU.trimInternal(ZU.xpathText(rows[i], './text()[1]'));
		var link = rows[i].href;
		if (!link || !title) continue;
		
		if (checkOnly) return true;
		found = true;
		
		items[link] = title;
	}
	
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc), function (items) {
			if (!items) {
				return;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function authorRemoveTitlesEtc(authorStr) {
	// example 1: Dr. iur. Carsten Peter
	// example 2: Rechtsanwälte Christoph Abbott
	// example 3: Professor Dr. Klaus Messer
	return ZU.trimInternal(ZU.trimInternal(authorStr).replace(authorRegEx, ""));
}

function scrapeKommentar(doc, url) {
	var item = new Zotero.Item("encyclopediaArticle");
	
	item.title = ZU.xpathText(doc, '//div[@class="dk2"]//span[@class="ueber"]');
	
	var authorText = ZU.xpathText(doc, '//div[@class="dk2"]//span[@class="autor"]');
	if (authorText) {
		var authors = authorText.split("/");
		for (let i = 0; i < authors.length; i++) {
			item.creators.push(ZU.cleanAuthor(authors[i], 'author', false));
		}
	}
	
	// e.g. a) Beck'scher Online-Kommentar BGB, Bamberger/Roth
	// e.g. b) Langenbucher/Bliesener/Spindler, Bankrechts-Kommentar
	// e.g. c) Scherer, Münchener Anwaltshandbuch Erbrecht
	var citationFirst = ZU.xpathText(doc, '//div[@class="dk2"]//span[@class="citation"]/text()[following-sibling::br and not(preceding-sibling::br)]', null, ' ');// e.g. Beck'scher Online-Kommentar BGB, Bamberger/Roth
	var pos = citationFirst.lastIndexOf(",");
	if (pos > 0) {
		item.publicationTitle = ZU.trimInternal(citationFirst.substr(0, pos));
		var editorString = citationFirst.substr(pos + 1);
		
		if ((!editorString.includes("/") && item.publicationTitle.includes("/"))
			|| editorString.toLowerCase().includes("handbuch")
			|| editorString.toLowerCase().includes("kommentar")
		) {
			var temp = item.publicationTitle;
			item.publicationTitle = editorString;
			editorString = temp;
		}
		editorString = editorString.replace(/, /g, '');
		
		var editors = editorString.trim().split("/");
		for (let i = 0; i < editors.length; i++) {
			item.creators.push(ZU.cleanAuthor(editors[i], 'editor', false));
		}
	}
	else {
		// e.g. Münchener Kommentar zum BGB
		// from https://beck-online.beck.de/?vpath=bibdata%2fkomm%2fmuekobgb_7_band2%2fbgb%2fcont%2fmuekobgb.bgb.p305.htm
		item.publicationTitle = ZU.trimInternal(citationFirst);
	}
	
	var editionText = ZU.xpathText(doc, '//div[@class="dk2"]//span[@class="citation"]/text()[preceding-sibling::br]');
	if (editionText) {
		if (editionText.search(/\d+/) > -1) {
			item.edition = editionText.match(/\d+/)[0];
		}
		else {
			item.edition = editionText;
		}
	}
	item.date = ZU.xpathText(doc, '//div[@class="dk2"]//span[@class="stand"]');
	if (!item.date && editionText.match(/\d{4}$/)) {
		item.date = editionText.match(/\d{4}$/)[0];
	}

	finalize(doc, url, item);
}


// scrape documents that are only in the beck-online "Leitsatz-Kartei", i.e.
// where only information about the article, not the article itself is in beck-online
function scrapeLSK(doc, url) {
	var item = new Zotero.Item(mappingClassNameToItemType.LSK);
	
	// description example 1: "Marco Ganzhorn: Ist ein E-Book ein Buch?"
	// description example 2: "Michael Fricke/Dr. Martin Gerecke: Informantenschutz und Informantenhaftung"
	// description example 3: "Sara Sun Beale: Die Entwicklung des US-amerikanischen Rechts der strafrechtlichen Verantwortlichkeit von Unternehmen"
	var description = ZU.xpathText(doc, "//*[@id='dokcontent']/h1");
	var descriptionItems = description.split(':');

	// authors
	var authorsString = descriptionItems[0];
	
	var authors = authorsString.split("/");

	for (var index = 0; index < authors.length; ++index) {
		var author = authorRemoveTitlesEtc(ZU.trimInternal(authors[index]));
		item.creators.push(ZU.cleanAuthor(author, 'author', false));
	}
	
	// title
	item.title = ZU.trimInternal(descriptionItems[1]);
	
	// src => journalTitle, date and pages
	// example 1: "Ganzhorn, CR 2014, 492"
	// example 2: "Fricke, Gerecke, AfP 2014, 293"
	// example 3 (no date provided): "Beale, ZStrW Bd. 126, 27"
	var src = ZU.xpathText(doc, "//div[@class='lsk-fundst']/ul/li");
	var m = src.trim().match(/([^,]+?)(\b\d{4})?,\s*(\d+)$/);
	if (m) {
		item.pages = m[3];
		if (m[2]) item.date = m[2];
		item.publicationTitle = ZU.trimInternal(m[1]);
		item.journalAbbreviation = item.publicationTitle;
		
		// if src is like example 3, then extract the volume
		var tmp = item.publicationTitle.match(/(^[A-Za-z]+) Bd\. (\d+)/);
		if (tmp) {
			item.publicationTitle = tmp[1];
			item.journalAbbreviation = item.publicationTitle;
			item.volume = tmp[2];
		}
	}

	finalize(doc, url, item);
}


function scrapeBook(doc, _url) {
	var item = new Zotero.Item("book");
	item.title = text(doc, '#titelseitetext .tptitle');
	item.shortTitle = attr(doc, '.bf_selected span[title]', 'title');
	var creatorType = "author";
	var contributorsAreNext = false;
	var contributors;
	var spaces = doc.querySelectorAll('#titelseitetext .tpspace');
	for (let space of spaces) {
		if (space.textContent.includes("Kommentar")) {
			item.title += ": Kommentar";
		}
		if (space.textContent.includes("Herausgegeben")) {
			creatorType = "editor";
		}
		// e.g. "2. Auflage 2018"
		if (space.textContent.includes("Auflage")) {
			let parts = space.textContent.split("Auflage");
			item.edition = parts[0].replace('.', '');
			item.date = parts[1];
		}
		
		if (contributorsAreNext) {
			contributors = space.textContent.split("; ");
			contributorsAreNext = false;
		}
		if (space.textContent.includes("Bearbeitet")) {
			contributorsAreNext = true;
		}
	}
	var creators = doc.querySelectorAll('#titelseitetext .tpauthor');
	for (let creator of creators) {
		creator = authorRemoveTitlesEtc(creator.textContent);
		item.creators.push(ZU.cleanAuthor(creator, creatorType));
	}
	if (contributors) {
		for (let contributor of contributors) {
			contributor = authorRemoveTitlesEtc(contributor);
			item.creators.push(ZU.cleanAuthor(contributor, "contributor"));
		}
	}
	item.ISBN = text(doc, '#titelseitetext .__beck_titelei_impressum_isbn');
	item.rights = text(doc, '#titelseitetext .__beck_titelei_impressum_p');
	if (item.rights && item.rights.includes("Beck")) {
		item.publisher = "Verlag C. H. Beck";
		item.place = "München";
	}
	item.complete();
}

function addNote(originalNote, newNote) {
	if (originalNote.length == 0) {
		originalNote = "<h2>Additional Metadata</h2>" + newNote;
	}
	else {
		originalNote += newNote;
	}
	return originalNote;
}

function scrapeCase(doc, url) {
	var documentClassName = doc.getElementById("dokument").className.toUpperCase();
	
	var item = new Zotero.Item('case');
	var note = "";
		
	// case name
	// in some cases, the caseName is in a separate <span>
	var caseName = ZU.xpathText(doc, '//div[@class="titel sbin4"]/h1/span');
	// if not, we have to extract it from the title
	if (!caseName) {
		var caseDescription = ZU.xpathText(doc, '//div[contains(@class, "titel")]/h1');
		if (caseDescription) {
			// take everything after the last slash
			var tmp = caseDescription.split(/\s[-–]\s/);
			caseName = tmp[tmp.length - 1];
			// sometimes the caseName is enclosed in („”)
			tmp = caseDescription.match(/\(„([^”)]+)”\)/);
			if (tmp) {
				caseName = ZU.trimInternal(tmp[1]);
			}
			if (caseDescription != caseName) {
				// save the former title (which is mostly a description of the case by the journal it is published in) in the notes
				note = addNote(note, "<h3>Beschreibung</h3><p>" + ZU.trimInternal(caseDescription) + "</p>");
			}
		}
		if (caseName) {
			item.shortTitle = caseName.trim().replace(/^\*|\*$/, '').trim();
		}
	}
	
	var courtLine = ZU.xpath(doc, '//div[contains(@class, "gerzeile")]/p')[0];
	var alternativeLine = "";
	var alternativeData = [];
	if (courtLine) {
		item.court = ZU.xpathText(courtLine, './span[@class="gericht"] | ./span[@class="GERICHT"]');
	}
	else {
		alternativeLine = ZU.xpathText(doc, '//span[@class="entscheidung"]');
		// example: OLG Köln: Beschluss vom 23.03.2012 - 6 U 67/11
		alternativeData = alternativeLine.match(/^([A-Za-zÖöÄäÜüß ]+): \b(.*?Urteil|.*?Urt\.|.*?Beschluss|.*?Beschl\.) vom (\d\d?\.\s*\d\d?\.\s*\d\d\d\d) - ([\w\s/]*)/i);
		item.court = ZU.trimInternal(alternativeData[1]);
	}
	
	// add jurisdiction to item.extra - in accordance with citeproc-js - for compatability with Zotero-MLZ
	item.extra = "";
	if (item.court.indexOf('EuG') == 0) {
		item.extra += "{:jurisdiction: europa.eu}";
	}
	else {
		item.extra += "{:jurisdiction: de}";
	}
	
	var decisionDateStr = ZU.xpathText(doc, '(//span[@class="edat"] | //span[@class="EDAT"] | //span[@class="datum"])[1]');
	if (decisionDateStr === null) {
		decisionDateStr = alternativeData[3];
	}
	// e.g. 24. 9. 2001 or 24-9-1990
	item.dateDecided = decisionDateStr.replace(/(\d\d?)[.-]\s*(\d\d?)[.-]\s*(\d\d\d\d)/, "$3-$2-$1");
	
	item.docketNumber = ZU.xpathText(doc, '(//span[@class="az"])[1]');
	if (item.docketNumber === null) {
		item.docketNumber = alternativeData[4];
	}
	
	item.title = item.court + ", " + decisionDateStr + " - " + item.docketNumber;
	if (item.shortTitle) {
		item.title += " - " + item.shortTitle;
	}
	
	var decisionType;
	if (courtLine) {
		item.history = ZU.xpathText(courtLine, './span[@class="vorinst"]');
	
		// type of decision. Save this in item.extra according to citeproc-js
		decisionType = ZU.xpathText(courtLine, './span[@class="etyp"]');
	}
	
	if (!decisionType) {
		decisionType = alternativeData[2];
	}
	
	if (decisionType) {
		if (/Beschluss|Beschl\./i.test(decisionType)) {
			item.extra += "\n{:genre: Beschl.}";
		}
		else if (/Urteil|(Urt\.)/i.test(decisionType)) {
			item.extra += "\n{:genre: Urt.}";
		}
	}
	
	// code to scrape the BeckRS source, if available
	// example: BeckRS 2013, 06445
	// Since BeckRS is not suitable for citing, let's push it into the notes instead
	var beckRSline = ZU.xpathText(doc, '//span[@class="fundstelle"]');
	if (beckRSline) {
		note = addNote(note, "<h3>Fundstelle</h3><p>" + ZU.trimInternal(beckRSline) + "</p>");
		
		/* commented out, because we cannot use it for the CSL-stylesheet at the moment.
		 * If we find a better solution later, we can reactivate this code and save the
		 * information properly
		 *
		var beckRSsrc = beckRSline.match(/^([^,]+)\s(\d{4})\s*,\s*(\d+)/);
		item.reporter = beckRSsrc[1];
		item.date = beckRSsrc[2];
		item.pages = beckRSsrc[3];*/
	}

	var otherCitationsText = ZU.xpathText(doc, '//div[@id="parallelfundstellenNachDokument"]');
	if (otherCitationsText) {
		note = addNote(note, "<h3>Parallelfundstellen</h3><p>" + otherCitationsText.replace(/\n/g, "").replace(/\s+/g, ' ').trim() + "</p>");
	}
	var basedOnRegulations = ZU.xpathText(doc, '//div[contains(@class,"normenk")]');
	if (basedOnRegulations) {
		note = addNote(note, "<h3>Normen</h3><p>" + ZU.trimInternal(basedOnRegulations) + "</p>");
	}
	
	item.abstractNote = ZU.xpathText(doc, '//div[@class="abstract" or @class="leitsatz"]');
	if (item.abstractNote) {
		item.abstractNote = item.abstractNote.replace(/\n\s*\n/g, "\n");
	}

	// there is additional information if the case is published in a journal
	if (documentClassName == 'ZRSPR') {
		// short title of publication, publication year
		item.reporter = ZU.xpathText(doc, '//div[@id="toccontent"]/ul/li/a[2]');
		item.reporterVolume = ZU.xpathText(doc, '//div[@id="toccontent"]/ul/li/ul/li/a[2]');
		// long title of publication
		var publicationTitle = ZU.xpathText(doc, '//li[@class="breadcurmbelemenfirst"]');
		if (publicationTitle) {
			note = addNote(note, "<h3>Zeitschrift Titel</h3><p>" + ZU.trimInternal(publicationTitle) + "</p>");
		}
		
		// e.g. ArbrAktuell 2014, 150
		var shortCitation = ZU.xpathText(doc, '//div[@class="dk2"]//span[@class="citation"]');
		var pagesStart = ZU.trimInternal(shortCitation.substr(shortCitation.lastIndexOf(",") + 1));
		var pagesEnd = ZU.xpathText(doc, '(//span[@class="pg"])[last()]');
		if (pagesEnd) {
			item.pages = pagesStart + "-" + pagesEnd;
		}
		else {
			item.pages = pagesStart;
		}
	}
	
	if (note.length != 0) {
		item.notes.push({ note: note });
	}
	
	finalize(doc, url, item);
}


function scrape(doc, url) {
	var dokument = doc.getElementById("dokument");
	if (!dokument) {
		throw new Error("Could not find element with ID 'dokument'. "
		+ "Probably attempting to scrape multiples with no access.");
	}
	var documentClassName = dokument.className.toUpperCase();

	// use different scraping function for documents in LSK
	if (documentClassName == 'LSK') {
		scrapeLSK(doc, url);
		return;
	}
	if (documentClassName == 'BUCH') {
		scrapeBook(doc, url);
		return;
	}
	if (mappingClassNameToItemType[documentClassName] == 'case') {
		scrapeCase(doc, url);
		return;
	}
	if (mappingClassNameToItemType[documentClassName] == 'encyclopediaArticle') {
		scrapeKommentar(doc, url);
		return;
	}

	var item;
	if (mappingClassNameToItemType[documentClassName]) {
		item = new Zotero.Item(mappingClassNameToItemType[documentClassName]);
	}
	
	var titleNode = ZU.xpath(doc, '//div[@class="titel"]')[0]
		|| ZU.xpath(doc, '//div[@class="dk2"]//span[@class="titel"]')[0];
	item.title = ZU.trimInternal(titleNode.textContent);
	
	// in some cases (e.g. NJW 2007, 3313) the title contains an asterisk with a footnote that is imported into the title
	// therefore, this part should be removed from the title
	var indexOfAdditionalText = item.title.indexOf("zur Fussnote");
	if (indexOfAdditionalText != -1) {
		item.title = item.title.substr(0, indexOfAdditionalText);
	}
	
	var authorNode = ZU.xpath(doc, '//div[@class="autor"]');
	for (var i = 0; i < authorNode.length; i++) {
		// normally several authors are under the same authorNode
		// and they occur in pairs with first and last names
		
		var authorFirstNames = ZU.xpath(authorNode[i], './/span[@class="vname"]');
		var authorLastNames = ZU.xpath(authorNode[i], './/span[@class="nname"]');
		for (let j = 0; j < authorFirstNames.length; j++) {
			item.creators.push({
				lastName: authorLastNames[j].textContent,
				firstName: authorFirstNames[j].textContent,
				creatorType: "author"
			});
		}
	}
	
	if (item.creators.length == 0) {
		authorNode = ZU.xpath(doc, '//div[@class="autor"]/p | //p[@class="authorline"]/text() | //div[@class="authorline"]/p/text()');
		for (let j = 0; j < authorNode.length; j++) {
			// first we delete some prefixes
			var authorString = authorRemoveTitlesEtc(authorNode[j].textContent);
			// authors can be seperated by "und" and "," if there are 3 or more authors
			// a comma can also mark the beginning of suffixes, which we want to delete
			// therefore we have to distinguish these two cases in the following
			var posUnd = authorString.indexOf("und");
			var posComma = authorString.indexOf(",");
			if (posUnd > posComma) {
				posComma = authorString.indexOf(",", posUnd);
			}
			if (posComma > 0) {
				authorString = authorString.substr(0, posComma);
			}
			
			var authorArray = authorString.split(/und|,/);
			for (var k = 0; k < authorArray.length; k++) {
				authorString = ZU.trimInternal(authorRemoveTitlesEtc(authorArray[k]));
				item.creators.push(ZU.cleanAuthor(authorString, "author"));
			}
		}
	}
	
	item.publicationTitle = ZU.xpathText(doc, '//li[@class="breadcurmbelemenfirst"]');
	item.journalAbbreviation = ZU.xpathText(doc, '//div[@id="toccontent"]/ul/li/a[2]');
	
	item.date = ZU.xpathText(doc, '//div[@id="toccontent"]/ul/li/ul/li/a[2]');
	
	// e.g. Heft 6 (Seite 141-162)
	var issueText = ZU.xpathText(doc, '//div[@id="toccontent"]/ul/li/ul/li/ul/li/a[2]');

	if (issueText) {
		item.issue = issueText.replace(/\([^)]*\)/, "");
		if (item.issue.search(/\d+/) > -1) {
			item.issue = item.issue.match(/\d+/)[0];
		}
	}
	
	// e.g. ArbrAktuell 2014, 150
	var shortCitation = ZU.xpathText(doc, '//div[@class="dk2"]//span[@class="citation"]');
	if (shortCitation) {
		var pagesStart = ZU.trimInternal(shortCitation.substr(shortCitation.lastIndexOf(",") + 1));
	}
	var pagesEnd = ZU.xpathText(doc, '(//span[@class="pg"])[last()]');
	if (pagesEnd) {
		item.pages = pagesStart + "-" + pagesEnd;
	}
	else {
		item.pages = pagesStart;
	}
	
	item.abstractNote = ZU.xpathText(doc, '//div[@class="abstract"]') || ZU.xpathText(doc, '//div[@class="leitsatz"]');
	if (item.abstractNote) {
		item.abstractNote = item.abstractNote.replace(/\n\s*\n/g, "\n");
	}

	if (documentClassName == "ZBUCHB") {
		item.extra = ZU.xpathText(doc, '//div[@class="biblio"]');
	}
	
	finalize(doc, url, item);
}

function finalize(doc, url, item) {
	item.attachments = [{
		title: "Snapshot",
		document: doc
	}];
	item.complete();
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://beck-online.beck.de/default.aspx?vpath=bibdata%2Fzeits%2FDNOTZ-SONDERH%2F2012%2Fcont%2FDNOTZ-SONDERH.2012.88.1.htm",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Best practice – Grundstrukturen des kontinentaleuropäischen Gesellschaftsrechts",
				"creators": [
					{
						"lastName": "Roth",
						"firstName": "Günter H.",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"issue": "1",
				"journalAbbreviation": "DNotZ-Sonderheft",
				"libraryCatalog": "beck-online",
				"pages": "88-95",
				"publicationTitle": "Sonderheft der Deutschen Notar-Zeitschrift",
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
		"url": "https://beck-online.beck.de/?vpath=bibdata%2fzeits%2fbkr%2f2001%2fcont%2fbkr.2001.99.1.htm",
		"items": [
			{
				"itemType": "case",
				"caseName": "LG Augsburg, 24. 9. 2001 - 3 O 4995/00 - Infomatec",
				"creators": [],
				"dateDecided": "2001-9-24",
				"abstractNote": "Leitsätze der Redaktion:\n    1. Ad-hoc-Mitteilungen richten sich nicht nur an ein bilanz- und fachkundiges Publikum, sondern an alle tatsächlichen oder potenziellen Anleger und Aktionäre.\n    2. \n    § BOERSG § 88 Abs. BOERSG § 88 Absatz 1 Nr. 1 BörsG dient neben dem Schutz der Allgemeinheit gerade auch dazu, das Vermögen des einzelnen Kapitalanlegers vor möglichen Schäden durch eine unredliche Beeinflussung der Preisbildung an Börsen und Märkten zu schützen.",
				"court": "LG Augsburg",
				"docketNumber": "3 O 4995/00",
				"extra": "{:jurisdiction: de}\n{:genre: Urt.}",
				"firstPage": "99-101",
				"reporter": "BKR",
				"reporterVolume": "2001",
				"shortTitle": "Infomatec",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<h2>Additional Metadata</h2><h3>Beschreibung</h3><p>Schadensersatz wegen fehlerhafter Ad-hoc-Mitteilungen („Infomatec”)</p><h3>Parallelfundstellen</h3><p>Parallelfundstellen: Entscheidungen:NJW-RR 2001, 1705 ◊NJOZ 2001, 1878 ◊NZG 2002, 429 ◊ZIP 2001, 1881 (m. Anm.) ◊WM 2001 Heft 41, 1944 ◊BeckRS 9998, 3964 ◊NJW-RR 2003, 216 (Ls.) ◊FHZivR 48 Nr. 6053 (Ls.) ◊FHZivR 47 Nr. 2816 (Ls.) ◊FHZivR 47 Nr. 6449 (Ls.) ◊FHZivR 48 Nr. 2514 (Ls.) ◊LSK 2001, 520032 (Ls.) Entscheidungsbesprechungen:WuB I G 7. - 8.01 ◊EWiR 2001, 1049 (Schwark, Eberhard) Weitere Fundstellen:DB 2001, 2334 ◊WuB 2001, 1269 ◊WuB 2001, 1269 (m. Anm. Professor Dr. Frank A. Schäfer)</p><h3>Normen</h3><p>§ WPHG § 15 WpHG; § BOERSG § 88 BörsG; §§ BGB § 823, BGB § 826 BGB</p><h3>Zeitschrift Titel</h3><p>Zeitschrift für Bank- und Kapitalmarktrecht</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://beck-online.beck.de/?vpath=bibdata%2fzeits%2fnjw%2f2014%2fcont%2fnjw.2014.898.1.htm",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Die Entwicklung des Energierechts im Jahr 2013",
				"creators": [
					{
						"firstName": "Boris",
						"lastName": "Scholtka",
						"creatorType": "author"
					},
					{
						"firstName": "Antje",
						"lastName": "Baumbach",
						"creatorType": "author"
					},
					{
						"firstName": "Marike",
						"lastName": "Pietrowicz",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"abstractNote": "Der Bericht knüpft an die bisher in dieser Reihe erschienenen Beiträge zur Entwicklung des Energierechts (zuletzt NJW2013, NJW Jahr 2013 Seite 2724) an und zeigt die Schwerpunkte energierechtlicher Entwicklungen in Gesetzgebung und Rechtsanwendung im Jahr 2013 auf.",
				"issue": "13",
				"journalAbbreviation": "NJW",
				"libraryCatalog": "beck-online",
				"pages": "898-903",
				"publicationTitle": "Neue Juristische Wochenschrift",
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
		"url": "https://beck-online.beck.de/?vpath=bibdata%2fzeits%2fGRUR%2f2003%2fcont%2fGRUR%2e2003%2eH09%2eNAMEINHALTSVERZEICHNIS%2ehtm",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://beck-online.beck.de/?vpath=bibdata%2fzeits%2fnjw%2f2014%2fcont%2fnjw.2014.3329.1.htm",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Zumutbarkeit von Beweiserhebungen und Wohnungsbetroffenheit im Zivilprozess",
				"creators": [
					{
						"firstName": "Christoph",
						"lastName": "Basler",
						"creatorType": "author"
					},
					{
						"firstName": "Klaus",
						"lastName": "Meßerschmidt",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"abstractNote": "Die Durchführung von Beweisverfahren ist mit Duldungs- und Mitwirkungspflichten von Beweisgegnern und Dritten verbunden, die nur über begrenzte Weigerungsrechte verfügen. Einen Sonderfall bildet der bei „Wohnungsbetroffenheit“ eingreifende letzte Halbsatz des § ZPO § 144 ZPO § 144 Absatz I 3 ZPO. Dessen Voraussetzungen und Reichweite bedürfen der Klärung. Ferner gibt die neuere Rechtsprechung Anlass zu untersuchen, inwieweit auch der Eigentumsschutz einer Beweisaufnahme entgegenstehen kann.",
				"issue": "46",
				"journalAbbreviation": "NJW",
				"libraryCatalog": "beck-online",
				"pages": "3329-3334",
				"publicationTitle": "Neue Juristische Wochenschrift",
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
		"url": "https://beck-online.beck.de/Default.aspx?vpath=bibdata%2fzeits%2fGRUR%2f2014%2fcont%2fGRUR.2014.431.1.htm",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Kennzeichen- und lauterkeitsrechtlicher Schutz für Apps",
				"creators": [
					{
						"firstName": "Stephanie",
						"lastName": "Zöllner",
						"creatorType": "author"
					},
					{
						"firstName": "Philipp",
						"lastName": "Lehmann",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"abstractNote": "Auf Grund der rasanten Entwicklung und der zunehmenden wirtschaftlichen Bedeutung von Apps kommen in diesem Zusammenhang immer neue rechtliche Probleme auf. Von den urheberrechtlichen Fragen bei der Entwicklung, über die vertragsrechtlichen Probleme beim Verkauf, bis hin zu Fragen der gewerblichen Schutzrechte haben sich Apps zu einem eigenen rechtlichen Themenfeld entwickelt. Insbesondere im Bereich des Kennzeichen- und Lauterkeitsrechts werden Rechtsprechung und Praxis vor neue Herausforderungen gestellt. Dieser Beitrag erörtert anhand von zwei Beispielsfällen die Frage nach den kennzeichen- und lauterkeitsrechtlichen Schutzmöglichkeiten von Apps, insbesondere der Übertragbarkeit bereits etablierter Grundsätze. Gleichzeitig werden die diesbezüglichen Besonderheiten herausgearbeitet.",
				"issue": "5",
				"journalAbbreviation": "GRUR",
				"libraryCatalog": "beck-online",
				"pages": "431-436",
				"publicationTitle": "Gewerblicher Rechtsschutz und Urheberrecht",
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
		"url": "https://beck-online.beck.de/?vpath=bibdata%2fzeits%2fdstr%2f2014%2fcont%2fdstr.2014.2261.1.htm",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Der Regierungsentwurf eines Gesetzes zur Änderung der Abgaben- ordnung und des Einführungsgesetzes zur Abgabenordnung",
				"creators": [
					{
						"firstName": "Wolfgang",
						"lastName": "Joecks",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"abstractNote": "Nachdem die Selbstanzeige nach § AO § 371 AO bereits im Frühjahr 2011 nur knapp einer Abschaffung entging und (lediglich) verschärft wurde, plant der Gesetzgeber nun eine weitere Einschränkung. Dabei unterscheiden sich der Referentenentwurf vom 27.8.2014 und der Regierungsentwurf vom 26.9.2014 scheinbar kaum; Details legen aber die Vermutung nahe, dass dort noch einmal jemand „gebremst“ hat. zur Fussnote 1",
				"issue": "46",
				"journalAbbreviation": "DStR",
				"libraryCatalog": "beck-online",
				"pages": "2261-2267",
				"publicationTitle": "Deutsches Steuerrecht",
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
		"url": "https://beck-online.beck.de/default.aspx?vpath=bibdata%2Fzeits%2FDNOTZ-SONDERH%2F2012%2Fcont%2FDNOTZ-SONDERH.2012.88.1.htm",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Best practice – Grundstrukturen des kontinentaleuropäischen Gesellschaftsrechts",
				"creators": [
					{
						"lastName": "Roth",
						"firstName": "Günter H.",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"issue": "1",
				"journalAbbreviation": "DNotZ-Sonderheft",
				"libraryCatalog": "beck-online",
				"pages": "88-95",
				"publicationTitle": "Sonderheft der Deutschen Notar-Zeitschrift",
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
		"url": "https://beck-online.beck.de/?vpath=bibdata%2fzeits%2fnjw%2f2014%2fcont%2fnjw.2014.3329.1.htm",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Zumutbarkeit von Beweiserhebungen und Wohnungsbetroffenheit im Zivilprozess",
				"creators": [
					{
						"firstName": "Christoph",
						"lastName": "Basler",
						"creatorType": "author"
					},
					{
						"firstName": "Klaus",
						"lastName": "Meßerschmidt",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"abstractNote": "Die Durchführung von Beweisverfahren ist mit Duldungs- und Mitwirkungspflichten von Beweisgegnern und Dritten verbunden, die nur über begrenzte Weigerungsrechte verfügen. Einen Sonderfall bildet der bei „Wohnungsbetroffenheit“ eingreifende letzte Halbsatz des § ZPO § 144 ZPO § 144 Absatz I 3 ZPO. Dessen Voraussetzungen und Reichweite bedürfen der Klärung. Ferner gibt die neuere Rechtsprechung Anlass zu untersuchen, inwieweit auch der Eigentumsschutz einer Beweisaufnahme entgegenstehen kann.",
				"issue": "46",
				"journalAbbreviation": "NJW",
				"libraryCatalog": "beck-online",
				"pages": "3329-3334",
				"publicationTitle": "Neue Juristische Wochenschrift",
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
		"url": "https://beck-online.beck.de/default.aspx?vpath=bibdata/ents/lsk/2014/3500/lsk.2014.35.0537.htm&pos=1",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Zum Folgenbeseitigungsanspruch bei Buchveröffentlichungen - Der Rückrufanspruch",
				"creators": [
					{
						"firstName": "Daniel",
						"lastName": "Jipp",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"journalAbbreviation": "AfP",
				"libraryCatalog": "beck-online",
				"pages": "300",
				"publicationTitle": "AfP",
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
		"url": "https://beck-online.beck.de/?vpath=bibdata%2fzeits%2fnjw%2f2014%2fcont%2fnjw.2014.898.1.htm",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Die Entwicklung des Energierechts im Jahr 2013",
				"creators": [
					{
						"firstName": "Boris",
						"lastName": "Scholtka",
						"creatorType": "author"
					},
					{
						"firstName": "Antje",
						"lastName": "Baumbach",
						"creatorType": "author"
					},
					{
						"firstName": "Marike",
						"lastName": "Pietrowicz",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"abstractNote": "Der Bericht knüpft an die bisher in dieser Reihe erschienenen Beiträge zur Entwicklung des Energierechts (zuletzt NJW2013, NJW Jahr 2013 Seite 2724) an und zeigt die Schwerpunkte energierechtlicher Entwicklungen in Gesetzgebung und Rechtsanwendung im Jahr 2013 auf.",
				"issue": "13",
				"journalAbbreviation": "NJW",
				"libraryCatalog": "beck-online",
				"pages": "898-903",
				"publicationTitle": "Neue Juristische Wochenschrift",
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
		"url": "https://beck-online.beck.de/Dokument?vpath=bibdata%2Fents%2Fbeckrs%2F2012%2Fcont%2Fbeckrs.2012.09546.htm&anchor=Y-300-Z-BECKRS-B-2012-N-09546",
		"items": [
			{
				"itemType": "case",
				"caseName": "OLG Köln, 23.03.2012 - 6 U 67/11",
				"creators": [],
				"dateDecided": "2012-03-23",
				"abstractNote": "Amtliche Leitsätze:\n\t\t\t\t\t1. Die Eltern eines 13-jährigen Sohnes, dem sie einen PC mit Internetanschluss überlassen haben, können ihrer aus § BGB § 832 BGB § 832 Absatz I BGB resultierenden Aufsichtspflicht zur Verhinderung der Teilnahme des Kindes an illegalen sog. Tauschbörsen durch die Installation einer Firewall und eines Passwortes sowie monatliche stichprobenmäßige Kontrollen genügen. Diese Kontrollen sind aber nicht hinreichend durchgeführt worden, wenn die Eltern über Monate das trotz der installierten Schutzmaßnahmen erfolgte Herunterladen zweier Filesharingprogramme nicht entdecken, für die Ikons auf dem Desktop sichtbar waren.\n\t\t\t\t\t2. Die Höhe des dem Rechteinhaber durch die Teilnahme an einer sog. Tauschbörse entstandenen, im Wege der Lizenzanalogie berechneten Schadens ist mangels besser geeigneter Grundlagen an dem GEMA Tarif zu orientieren, der dem zu beurteilenden Sachverhalt am nächsten kommt. Das ist nicht der Tarif VR W 1, sondern der (frühere) Tarif VR-OD 5. Es sind weiter alle in Betracht kommenden Umstände wie die Länge des Zeitraumes, in dem der Titel in die \"Tauschbörse\" eingestellt war, und die Höhe des Lizenzbetrages zu berücksichtigen, der für vergleichbare Titel nach Lizenzierung gezahlt wird. Sind gängige Titel über Monate durch die Tauschbörse öffentlich zugänglichgemacht worden, so kann ein Betrag von 200 € für jeden Titel geschuldet sein.",
				"court": "OLG Köln",
				"docketNumber": "6 U 67/11",
				"extra": "{:jurisdiction: de}\n{:genre: Urt.}",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<h2>Additional Metadata</h2><h3>Fundstelle</h3><p>BeckRS 2012, 9546</p><h3>Parallelfundstellen</h3><p>Parallelfundstellen: Entscheidungen:MMR 2012, 387 (m. Anm. Hoffmann) ◊NJOZ 2013, 365 ◊ZUM 2012, 697 ◊LSK 2012, 250148 (Ls.) Entscheidungsbesprechung:GRUR-Prax 2012, 238 (Dr. Christian Dietrich) Weitere Fundstellen:CR 2012, 397 ◊K & R 2012, 437 (Ls.) ◊MD 2012, 621 ◊WRP 2012, 1007</p><h3>Normen</h3><p>Normenketten: BGB § BGB § 683 S. 1, § 670, § 832 Abs. 1 UrhG § URHG § 19a, § 97 Abs. 2</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://beck-online.beck.de/default.aspx?vpath=bibdata%2Fzeits%2Fgrur%2F2014%2Fcont%2Fgrur.2014.468.1.htm",
		"items": [
			{
				"itemType": "case",
				"caseName": "EuGH, 27.3.2014 - C-314/12 - UPC Telekabel/Constantin Film ua [kino.to]",
				"creators": [],
				"dateDecided": "2014-3-27",
				"court": "EuGH",
				"docketNumber": "C-314/12",
				"extra": "{:jurisdiction: europa.eu}\n{:genre: Urt.}",
				"firstPage": "468-473",
				"reporter": "GRUR",
				"reporterVolume": "2014",
				"shortTitle": "UPC Telekabel/Constantin Film ua [kino.to]",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<h2>Additional Metadata</h2><h3>Beschreibung</h3><p>EU-konforme unbestimmte Sperrverfügung gegen Internetprovider - UPC Telekabel/Constantin Film ua [kino.to]</p><h3>Parallelfundstellen</h3><p>Parallelfundstellen: Entscheidungen:MMR 2014, 397 (m. Anm. Roth) ◊GRUR Int. 2014, 469 ◊NJW 2014, 1577 ◊EuZW 2014, 388 (m. Anm. Karl) ◊ZUM 2014, 494 ◊BeckRS 2014, 80615 ◊BeckEuRS 2014, 417030 ◊LSK 2014, 160153 (Ls.) Entscheidungsbesprechung:GRUR-Prax 2014, 157 (Dr. Stefan Maaßen) Weitere Fundstellen:CELEX 62012CJ0314 ◊EuGRZ 2014, 301 ◊K & R 2014, 329 (m. Anm. Simon Assion) ◊MittdtPatA 2014, 335 (Ls.) ◊WRP 2014, 540</p><h3>Normen</h3><p>AEUV Art. AEUV Artikel 267; Richtlinie 2001/29/EG Art. EWG_RL_2001_29 Artikel 3 EWG_RL_2001_29 Artikel 3 Absatz II, EWG_RL_2001_29 Artikel 8 EWG_RL_2001_29 Artikel 8 Absatz III</p><h3>Zeitschrift Titel</h3><p>Gewerblicher Rechtsschutz und Urheberrecht</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://beck-online.beck.de/?vpath=bibdata/zeits/njw/1991/cont/njw.1991.1471.1.htm&pos=4&lasthit=true",
		"items": [
			{
				"itemType": "case",
				"caseName": "BVerfG, 27-11-1990 - 1 BvR 402/87 - Indizierung eines pornographischen Romans (\"Josefine Mutzenbacher\")\n zur Fussnote †",
				"creators": [],
				"dateDecided": "1990-11-27",
				"abstractNote": "1. Ein pornographischer Roman kann Kunst i. S. von Art. GG Artikel 5 GG Artikel 5 Absatz III 1 GG sein.\n    2. Die Indizierung einer als Kunstwerk anzusehenden Schrift setzt auch dann eine Abwägung mit der Kunstfreiheit voraus, wenn die Schrift offensichtlich geeignet ist, Kinder oder Jugendliche sittlich schwer zu gefährden (§ 6 Nr. 3 des Gesetzes über die Verbreitung jugendgefährdender Schriften - GjS).\n    3. Die Vorschrift des § 9 II GjS ist verfassungsrechtlich unzulänglich, weil die Auswahl der Beisitzer für die Bundesprüfstelle nicht ausreichend geregelt ist.",
				"court": "BVerfG",
				"docketNumber": "1 BvR 402/87",
				"extra": "{:jurisdiction: de}",
				"firstPage": "1471-1475",
				"reporter": "NJW",
				"reporterVolume": "1991",
				"shortTitle": "Indizierung eines pornographischen Romans (\"Josefine Mutzenbacher\")\n zur Fussnote †",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<h2>Additional Metadata</h2><h3>Parallelfundstellen</h3><p>Parallelfundstellen: Entscheidungen:NStZ 1991, 188 ◊BVerfGE Band 83, 130 ◊BeckRS 9998, 165476 ◊NVwZ 1991, 663 (Ls.) ◊LSK 1991, 230089 (Ls.) ◊FHOeffR 42 Nr. 13711 (Ls.) ◊FHOeffR 42 Nr. 6327 (Ls.) ◊FHOeffR 42 Nr. 7072 (Ls.) ◊FHOeffR 42 Nr. 13713 (Ls.) Weitere Fundstellen:AfP 1991, 379 ◊AfP 1991, 384 ◊Bespr.: , JZ 1991, 470 ◊BVerfGE 83, 130 ◊DVBl 1991, 261 ◊EuGRZ 1991, 33 ◊JZ 1991, 465 ◊ZUM 1991, 310</p><h3>Normen</h3><p>GG Art. GG Artikel 1 GG Artikel 1 Absatz I, GG Artikel 2 GG Artikel 2 Absatz I, GG Artikel 5 GG Artikel 5 Absatz III 1, GG Artikel 6 GG Artikel 6 Absatz II, GG Artikel 19 GG Artikel 19 Absatz I 2, GG Artikel 19 Absatz IV, GG Artikel 20 GG Artikel 20 Absatz III, GG Artikel 103 GG Artikel 103 Absatz I; GjS §§ 1, 6, 9 II</p><h3>Zeitschrift Titel</h3><p>Neue Juristische Wochenschrift</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://beck-online.beck.de/?vpath=bibdata/komm/beckok_38_BandBGB/BGB/cont/beckok.BGB.p489.htm",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "BGB § 489 Ordentliches Kündigungsrecht des Darlehensnehmers",
				"creators": [
					{
						"firstName": "",
						"lastName": "Rohe",
						"creatorType": "author"
					},
					{
						"firstName": "",
						"lastName": "Bamberger",
						"creatorType": "editor"
					},
					{
						"firstName": "",
						"lastName": "Roth",
						"creatorType": "editor"
					}
				],
				"date": "01.02.2016",
				"edition": "38",
				"encyclopediaTitle": "Beck'scher Online-Kommentar BGB",
				"libraryCatalog": "beck-online",
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
		"url": "https://beck-online.beck.de/?vpath=bibdata%2fkomm%2fdaulankobgb_2%2fbgb%2fcont%2fdaulankobgb.bgb.p489.htm",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "BGB § 489 Ordentliches Kündigungsrecht des Darlehensnehmers",
				"creators": [
					{
						"firstName": "Gerd",
						"lastName": "Krämer",
						"creatorType": "author"
					},
					{
						"firstName": "Miriam",
						"lastName": "Müller",
						"creatorType": "author"
					},
					{
						"firstName": "",
						"lastName": "Dauner-Lieb",
						"creatorType": "editor"
					},
					{
						"firstName": "",
						"lastName": "Langen",
						"creatorType": "editor"
					}
				],
				"date": "2012",
				"edition": "2",
				"encyclopediaTitle": "BGB | Schuldrecht",
				"libraryCatalog": "beck-online",
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
		"url": "https://beck-online.beck.de/Dokument?vpath=bibdata%2Fkomm%2Fscheanwhdb_5%2Fcont%2Fscheanwhdb.glsect19.glii.gl2.gla.htm&pos=2&hlwords=on",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "§ 19 Testamentsvollstreckung",
				"creators": [
					{
						"firstName": "",
						"lastName": "Lorz",
						"creatorType": "author"
					},
					{
						"firstName": "",
						"lastName": "Scherer",
						"creatorType": "editor"
					}
				],
				"date": "2018",
				"edition": "5",
				"encyclopediaTitle": "Münchener Anwaltshandbuch Erbrecht",
				"libraryCatalog": "beck-online",
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
		"url": "https://beck-online.beck.de/?vpath=bibdata/komm/KueBuchnerKoDSGVO_2/cont/KueBuchnerKoDSGVO.htm",
		"items": [
			{
				"itemType": "book",
				"title": "Datenschutz-Grundverordnung/BDSG: Kommentar",
				"creators": [
					{
						"firstName": "Jürgen",
						"lastName": "Kühling",
						"creatorType": "editor"
					},
					{
						"firstName": "Benedikt",
						"lastName": "Buchner",
						"creatorType": "editor"
					},
					{
						"firstName": "Matthias",
						"lastName": "Bäcker",
						"creatorType": "contributor"
					},
					{
						"firstName": "Matthias",
						"lastName": "Bergt",
						"creatorType": "contributor"
					},
					{
						"firstName": "Franziska",
						"lastName": "Boehm",
						"creatorType": "contributor"
					},
					{
						"firstName": "Benedikt",
						"lastName": "Buchner",
						"creatorType": "contributor"
					},
					{
						"firstName": "Johannes",
						"lastName": "Caspar",
						"creatorType": "contributor"
					},
					{
						"firstName": "Alexander",
						"lastName": "Dix",
						"creatorType": "contributor"
					},
					{
						"firstName": "Sebastian",
						"lastName": "Golla",
						"creatorType": "contributor"
					},
					{
						"firstName": "Jürgen",
						"lastName": "Hartung",
						"creatorType": "contributor"
					},
					{
						"firstName": "Tobias",
						"lastName": "Herbst",
						"creatorType": "contributor"
					},
					{
						"firstName": "Silke",
						"lastName": "Jandt",
						"creatorType": "contributor"
					},
					{
						"firstName": "Manuel",
						"lastName": "Klar",
						"creatorType": "contributor"
					},
					{
						"firstName": "Jürgen",
						"lastName": "Kühling",
						"creatorType": "contributor"
					},
					{
						"firstName": "Frank",
						"lastName": "Maschmann",
						"creatorType": "contributor"
					},
					{
						"firstName": "Thomas",
						"lastName": "Petri",
						"creatorType": "contributor"
					},
					{
						"firstName": "Johannes",
						"lastName": "Raab",
						"creatorType": "contributor"
					},
					{
						"firstName": "Florian",
						"lastName": "Sackmann",
						"creatorType": "contributor"
					},
					{
						"firstName": "Christian",
						"lastName": "Schröder",
						"creatorType": "contributor"
					},
					{
						"firstName": "Simon",
						"lastName": "Schwichtenberg",
						"creatorType": "contributor"
					},
					{
						"firstName": "Marie-Theres",
						"lastName": "Tinnefeld",
						"creatorType": "contributor"
					},
					{
						"firstName": "Thilo",
						"lastName": "Weichert",
						"creatorType": "contributor"
					},
					{
						"firstName": "Ri Mirko",
						"lastName": "Wieczorek",
						"creatorType": "contributor"
					}
				],
				"date": "2018",
				"ISBN": "9783406719325",
				"edition": "2",
				"libraryCatalog": "beck-online",
				"place": "München",
				"publisher": "Verlag C. H. Beck",
				"rights": "© 2018 Verlag C. H. Beck oHG",
				"shortTitle": "Kühling/Buchner, DS-GVO BDSG",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
