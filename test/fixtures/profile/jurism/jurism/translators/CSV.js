{
	"translatorID": "25f4c5e2-d790-4daa-a667-797619c7e2f2",
	"label": "CSV",
	"creator": "Philipp Zumstein and Aurimas Vinckevicius",
	"target": "csv",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"displayOptions": {
		"exportCharset": "UTF-8xBOM",
		"exportNotes": false
	},
	"inRepository": true,
	"translatorType": 2,
	"lastUpdated": "2018-08-10 06:37:30"
}

/*
    ***** BEGIN LICENSE BLOCK *****

    Copyright © 2014 Philipp Zumstein, Aurimas Vinckevicius

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

//The export will be stuck if you try to export to a csv-file
//which is already opend with Excel. Thus, close it before or rename
//the new csv-file.

var recordDelimiter = "\n",
	fieldDelimiter = ",",
	fieldWrapperCharacter = '"',
	replaceNewlinesWith = " ", // Set to `false` for no replacement
	valueSeparator = "; "; // For multi-value fields, like creators, tags, etc.
	normalizeDate = true; // Set to `false` if the date should be written as it is

// Exported columns in order of export
var exportedFields = [
	// "Important" metadata
	"key","itemType","publicationYear","creators/author","title",
	"publicationTitle","ISBN","ISSN","DOI","url","abstractNote","date",
	"dateAdded","dateModified",
	// Other common fields
	"accessDate","pages","numPages","issue","volume","numberOfVolumes",
	"journalAbbreviation","shortTitle","series","seriesNumber","seriesText",
	"seriesTitle","publisher","place","language","rights","type","archive",
	"archiveLocation","libraryCatalog","callNumber","extra","notes",
	"attachments/path","attachments/url","tags/own","tags/automatic",
	// Creators
	"creators/editor","creators/seriesEditor","creators/translator",
	"creators/contributor","creators/attorneyAgent","creators/bookAuthor",
	"creators/castMember","creators/commenter","creators/composer",
	"creators/cosponsor","creators/counsel","creators/interviewer",
	"creators/producer","creators/recipient","creators/reviewedAuthor",
	"creators/scriptwriter","creators/wordsBy","creators/guest",
	// Other fields
	"number","edition","runningTime","scale","medium","artworkSize",
	"filingDate","applicationNumber","assignee","issuingAuthority","country",
	"meetingName","conferenceName","court","references","reporter",
	"legalStatus","priorityNumbers","programmingLanguage","version","system",
	"code","codeNumber","section","session","committee","history",
	"legislativeBody"
];

// Creators that should map to base type
var creatorBaseTypes = {
	interviewee: 'author',
	director: 'author',
	artist: 'author',
	sponsor: 'author',
	contributor: 'author',
	inventor: 'author',
	cartographer: 'author',
	performer: 'author',
	presenter: 'author',
	director: 'author',
	podcaster: 'author',
	programmer: 'author'
};

var exportNotes;
function doExport() {
	exportNotes = Zotero.getOption("exportNotes");
	// Until we fix UTF-8xBOM export, we'll write the BOM manually
	Zotero.write("\uFEFF");
	writeColumnHeaders();
	var item, line;
	while (item = Zotero.nextItem()) {
		if (item.itemType == "note" || item.itemType == "attachment") continue;
		line = '';
		for (var i=0; i<exportedFields.length; i++) {
			line += (i ? fieldDelimiter : recordDelimiter)
				+ getValue(item, exportedFields[i]);
		}
		Zotero.write(line);
	}
}

var escapeRE = new RegExp(fieldWrapperCharacter, 'g');
function escapeValue(str) {
	if (typeof replaceNewlinesWith == 'string') {
		str = str.replace(/[\r\n]+/g, replaceNewlinesWith);
	}
	
	return str.replace(escapeRE, fieldWrapperCharacter + '$&');
}

function writeColumnHeaders() {
	var line = '';
	for (var i=0; i<exportedFields.length; i++) {
		line += (i ? fieldDelimiter : '') + fieldWrapperCharacter;
		var label = exportedFields[i].split('/');
		switch (label[0]) {
			case 'creators':
				label = label[1];
			break;
			case 'tags':
				label = ( label[1] == 'own' ? 'Manual Tags' : 'Automatic Tags');
			break;
			case 'attachments':
				label = (label[1] == 'url' ? 'Link Attachments' : 'File Attachments');
			break;
			default:
				label = label[0];
		}
		// Split individual words in labels and capitalize property
		label = label[0].toUpperCase() + label.substr(1);
		label = label.replace(/([a-z])([A-Z])/g, '$1 $2');
		
		line += escapeValue(label) + fieldWrapperCharacter;
	}
	Zotero.write(line);
}

function getValue(item, field) {
	var split = field.split('/'), value = fieldWrapperCharacter;
	switch (split[0]) {
		case 'publicationYear':
			if (item.date) {
				var date = ZU.strToDate(item.date);
				if (date.year) value += escapeValue(date.year);
			}
		break;
		case 'creators':
			var creators = [];
			for (var i=0; i<item.creators.length; i++) {
				var creator = item.creators[i];
				var baseCreator = creatorBaseTypes[creator.creatorType];
				if (creator.creatorType != split[1] && baseCreator !== split[1]) {
					continue;
				}
				creators.push(creator.lastName
					+ (creator.firstName ? ', ' + creator.firstName : ''));
			}
			value += escapeValue(creators.join(valueSeparator));
		break;
		case 'tags':
			var tags = [], tagType = split[1] == 'automatic';
			for (var i=0; i<item.tags.length; i++) {
				if (item.tags[i].type == tagType) tags.push(item.tags[i].tag);
			}
			value += escapeValue(tags.join(valueSeparator));
		break;
		case 'attachments':
			var paths = [];
			for (var i=0; i<item.attachments.length; i++) {
				if (split[1] == 'path') {
					paths.push(item.attachments[i].localPath);
				} else if (split[1] == 'url' && !item.attachments[i].localPath) {
					paths.push(item.attachments[i].url);
				}
			}
			value += escapeValue(paths.join(valueSeparator));
		break;
		case 'notes':
			if (!exportNotes) break;
			var notes = [];
			for (var i=0; i<item.notes.length; i++) {
				notes.push(item.notes[i].note);
			}
			value += escapeValue(notes.join(valueSeparator));
		break;
		case 'date':
			if (item.date) {
				var dateISO = ZU.strToISO(item.date);
				if (normalizeDate && dateISO)  {
					value += dateISO;
				} else {
					value += item.date;
				}
			}
		break;
		default:
			if (item[field] || (item.uniqueFields && item.uniqueFields[field])) {
				value += escapeValue('' + (item[field] || (item.uniqueFields && item.uniqueFields[field])));
			}
	}
	return value + fieldWrapperCharacter;
}
