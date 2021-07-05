{
	"translatorID": "51e5355d-9974-484f-80b9-f84d2b55782e",
	"translatorType": 2,
	"label": "Wikidata QuickStatements",
	"creator": "Philipp Zumstein",
	"target": "txt",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"lastUpdated": "2021-06-07 22:15:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Philipp Zumstein

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


var typeMapping = {
	// Zotero types
	artwork: "Q838948",
	// "attachment" : "Q17709279",
	audioRecording: "Q30070318",
	bill: "Q686822",
	blogPost: "Q17928402",
	book: "Q3331189", // changed from Q571 (work level) to edition level as we want to export maximal amount of properties
	bookSection: "Q1980247",
	case: "Q2334719",
	computerProgram: "Q40056",
	conferencePaper: "Q23927052",
	dictionaryEntry: "Q30070414",
	document: "Q49848",
	email: "Q30070439",
	encyclopediaArticle: "Q17329259",
	film: "Q11424",
	forumPost: "Q7216866",
	hearing: "Q30070550",
	instantMessage: "Q30070565",
	interview: "Q178651",
	journalArticle: "Q13442814",
	letter: "Q133492",
	magazineArticle: "Q30070590",
	manuscript: "Q87167",
	map: "Q4006",
	newspaperArticle: "Q5707594",
	// note
	patent: "Q253623",
	podcast: "Q24634210",
	presentation: "Q604733",
	radioBroadcast: "Q1555508",
	report: "Q10870555",
	statute: "Q820655",
	thesis: "Q1266946",
	tvBroadcast: "Q15416",
	videoRecording: "Q30070675",
	webpage: "Q36774",
	// additional CSL types (can be used in Zotero with a hack)
	dataset: "Q1172284",
	// entry
	figure: "Q30070753",
	musical_score: "Q187947", // eslint-disable-line camelcase
	pamphlet: "Q190399",
	review: "Q265158",
	"review-book": "Q637866",
	treaty: "Q131569"
};

// simple properties with string values can be simply mapped here
var propertyMapping = {
	P356: "DOI",
	P953: "url",
	P478: "volume",
	P433: "issue",
	P304: "pages",
	P1104: "numPages",
	P393: "edition"
};

// properties which needs no quotes around their values (e.g. ones for numbers)
var nonStringProperties = ["P1104"];

// it is important to use here the language codes in the form
// as they are also used in Wikidata for monolingual text
var languageMapping = {
	en: "Q1860",
	zh: "Q7850",
	ru: "Q7737",
	fr: "Q150",
	ja: "Q5287",
	de: "Q188",
	es: "Q1321",
	sr: "Q9299",
	pl: "Q809",
	cs: "Q9056",
	it: "Q652",
	cy: "Q9309",
	pt: "Q5146",
	nl: "Q7411",
	sv: "Q9027",
	ar: "Q13955",
	ko: "Q9176",
	hu: "Q9067",
	da: "Q9035",
	fi: "Q1412",
	eu: "Q8752",
	he: "Q9288",
	la: "Q397",
	nb: "Q25167",
	no: "Q9043",
	el: "Q9129",
	tr: "Q256",
	ca: "Q7026",
	sl: "Q9063",
	ro: "Q7913",
	is: "Q294",
	grc: "Q35497",
	uk: "Q8798",
	fa: "Q9168",
	hy: "Q8785",
	ta: "Q5885"
};

var identifierMapping = {
	PMID: "P698",
	PMCID: "P932",
	"JSTOR ID": "P888",
	arXiv: "P818",
	"Open Library ID": "P648",
	OCLC: "P243",
	"IMDb ID": "P345",
	"Google-Books-ID": "P675"
};


function zoteroItemToQuickStatements(item) {
	// add numPages if only page range is given
	if (item.pages && !item.numPages) {
		let pagesMatch = item.pages.match(/^(\d+)[–-](\d+)$/);
		if (pagesMatch) {
			item.numPages = parseInt(pagesMatch[2]) - parseInt(pagesMatch[1]) + 1;
		}
	}
	// cleanup edition before to export
	if (item.edition) {
		item.edition = parseInt(item.edition);
		if (item.edition == 1) {
			delete item.edition;
		}
	}

	var statements = ['CREATE'];
	var addStatement = function () {
		var args = Array.prototype.slice.call(arguments);
		statements.push('LAST\t' + args.join('\t'));
	};

	var itemType = item.itemType;
	// check whether a special itemType is defined in the extra fields
	if (item.extra) {
		var matchItemType = item.extra.match(/itemType: ([\w-]+)($|\n)/);
		if (matchItemType) {
			itemType = matchItemType[1];
		}
	}
	if (typeMapping[itemType]) {
		addStatement('P31', typeMapping[itemType]);
	}
	addStatement('Len', '"' + item.title + '"');

	var description = itemType.replace(/([A-Z])/, function (match, firstLetter) {
		return ' ' + firstLetter.toLowerCase();
	});
	if (item.publicationTitle && (itemType == "journalArticle" || itemType == "magazineArticle" || itemType == "newspaperArticle")) {
		description = description + ' from \'' + item.publicationTitle + '\'';
	}
	if (item.date) {
		var year = ZU.strToDate(item.date).year;
		if (year) {
			description = description + ' published in ' + year;
		}
	}
	addStatement('Den', '"' + description + '"');

	for (var pnumber in propertyMapping) {
		var zfield = propertyMapping[pnumber];
		if (item[zfield]) {
			if (nonStringProperties.includes(pnumber)) {
				addStatement(pnumber, item[zfield]);
			}
			else {
				addStatement(pnumber, '"' + item[zfield] + '"');
			}
		}
	}

	var index = 1;
	for (var i = 0; i < item.creators.length; i++) {
		var creatorValue = item.creators[i].lastName;
		var creatorType = item.creators[i].creatorType;
		if (item.creators[i].firstName) {
			creatorValue = item.creators[i].firstName + ' ' + creatorValue;
		}
		if (creatorType == "author") {
			addStatement('P2093', '"' + creatorValue + '"', 'P1545', '"' + index + '"');
			index++;
		}
		// other creatorTypes are ignored, because they would need to point an item, rather than just writing the string value
	}

	if (item.date) {
		// e.g. +1967-01-17T00:00:00Z/11
		var formatedDate = ZU.strToISO(item.date);
		switch (formatedDate.length) {
			case 4:
				formatedDate += "-00-00T00:00:00Z/9";
				break;
			case 7:
				formatedDate += "-00T00:00:00Z/10";
				break;
			case 10:
				formatedDate += "T00:00:00Z/11";
				break;
			default:
				formatedDate += "/11";
		}
		addStatement('P577', '+' + formatedDate);
	}

	// determining depending entries where the ISBN is part of the larger work
	var dependingWork = ["bookSection", "conferencePaper", "dictionaryEntry", "encyclopediaArticle", "journalArticle", "magazineArticle", "newspaperArticle"].includes(itemType);
	if (item.ISBN && !dependingWork) {
		var isbnDigits = item.ISBN.replace(/-/g, '');
		if (isbnDigits.length == 13) {
			addStatement('P212', '"' + item.ISBN + '"');
		}
		if (isbnDigits.length == 10) {
			addStatement('P957', '"' + item.ISBN + '"');
		}
	}

	if (item.language && (item.language.toLowerCase() in languageMapping)) {
		let lang = item.language.toLowerCase();
		addStatement('P1476', lang + ':"' + item.title + '"');
		addStatement('P407', languageMapping[lang]);
	}
	else {
		// otherwise use "und" for undetermined language
		addStatement('P1476', 'und:"' + item.title + '"');
	}

	if (item.extra) {
		var extraLines = item.extra.split('\n');
		for (var j = 0; j < extraLines.length; j++) {
			var colon = extraLines[j].indexOf(':');
			if (colon > -1) {
				var label = extraLines[j].substr(0, colon);
				var value = extraLines[j].substr(colon + 1);
				if (identifierMapping[label]) {
					addStatement(identifierMapping[label], '"' + value.trim() + '"');
				}
				if (label.match(/^P\d+$/)) {
					if (value.trim().match(/^Q\d+$/)) {
						addStatement(label, value.trim());
					}
					else {
						addStatement(label, '"' + value.trim() + '"');
					}
				}
			}
		}
	}

	return statements.join('\n') + '\n';
}

function doExport() {
	var item;
	while ((item = Zotero.nextItem())) {
		// skipping items with a QID saved in extra
		if (item.extra && item.extra.match(/^QID: /m)) continue;

		// write the statements
		Zotero.write(zoteroItemToQuickStatements(item));
	}
}
