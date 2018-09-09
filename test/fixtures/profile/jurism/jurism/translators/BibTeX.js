{
	"translatorID": "9cb70025-a888-4a29-a210-93ec52da40d4",
	"label": "BibTeX",
	"creator": "Simon Kornblith, Richard Karnesky and Emiliano heyns",
	"target": "bib",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 200,
	"configOptions": {
		"async": true,
		"getCollections": true
	},
	"displayOptions": {
		"exportCharset": "UTF-8",
		"exportNotes": true,
		"exportFileData": false,
		"useJournalAbbreviation": false
	},
	"inRepository": true,
	"translatorType": 3,
	"browserSupport": "gcsv",
	"lastUpdated": "2018-03-03 13:10:16"
}

function detectImport() {
	var maxChars = 1048576; // 1MB
	
	var inComment = false;
	var block = "";
	var buffer = "";
	var chr = "";
	var charsRead = 0;
	
	var re = /^\s*@[a-zA-Z]+[\(\{]/;
	while((buffer = Zotero.read(4096)) && charsRead < maxChars) {
		Zotero.debug("Scanning " + buffer.length + " characters for BibTeX");
		charsRead += buffer.length;
		for (var i=0; i<buffer.length; i++) {
			chr = buffer[i];
			
			if (inComment && chr != "\r" && chr != "\n") {
				continue;
			}
			inComment = false;
			
			if(chr == "%") {
				// read until next newline
				block = "";
				inComment = true;
			} else if((chr == "\n" || chr == "\r"
				// allow one-line entries
						|| i == (buffer.length - 1))
						&& block) {
				// check if this is a BibTeX entry
				if(re.test(block)) {
					return true;
				}
				
				block = "";
			} else if(" \n\r\t".indexOf(chr) == -1) {
				block += chr;
			}
		}
	}
}

//%a = first listed creator surname
//%y = year
//%t = first word of title
var citeKeyFormat = "%a_%t_%y";

var fieldMap = {
	address:"place",
	chapter:"section",
	edition:"edition",
	type:"type",
	series:"series",
	title:"title",
	volume:"volume",
	copyright:"rights",
	isbn:"ISBN",
	issn:"ISSN",
	shorttitle:"shortTitle",
	url:"url",
	doi:"DOI",
	abstract:"abstractNote",
  	nationality: "country",
  	language:"language",
  	assignee:"assignee"
};

// Fields for which upper case letters will be protected on export
var caseProtectedFields = [
	"title",
	"type",
	"shorttitle",
	"booktitle",
	"series"
];

// Import/export in BibTeX
var extraIdentifiers = {
	lccn: 'LCCN',
	mrnumber: 'MR',
	zmnumber: 'Zbl',
	pmid: 'PMID',
	pmcid: 'PMCID'
	
	//Mostly from Wikipedia citation templates
	//asin - Amazon ID
	//bibcode/refcode - used in astronomy, but haven't seen any Bib(La)TeX examples
	//jfm - Jahrbuch ID, but it seems to be part of Zentralblatt MATH, so Zbl
	//oclc
	//ol - openlibrary.org ID
	//osti
	//rfc
	//ssrn? http://cyber.law.harvard.edu/cybersecurity/Guidelines_for_adding_Bibliography_entries
};

// Make a reverse map for convenience with additional DOI handling
var revExtraIds = {'DOI': 'doi'};
for(var field in extraIdentifiers) {
	revExtraIds[extraIdentifiers[field]] = field;
}

// Import only. Exported by BibLaTeX
var eprintIds = {
	// eprinttype: Zotero label
	
	// From BibLaTeX manual
	'arxiv': 'arXiv', // Sorry, but no support for eprintclass yet
	'jstor': 'JSTOR',
	'pubmed': 'PMID',
	'hdl': 'HDL',
	'googlebooks': 'GoogleBooksID'
};

function parseExtraFields(extra) {
	var lines = extra.split(/[\r\n]+/);
	var fields = [];
	for(var i=0; i<lines.length; i++) {
		var rec = { raw: lines[i] };
		var line = lines[i].trim();
		var splitAt = line.indexOf(':');
		if(splitAt > 1) {
			rec.field = line.substr(0,splitAt).trim();
			rec.value = line.substr(splitAt + 1).trim();
		}
		fields.push(rec);
	}
	return fields;
}

function extraFieldsToString(extra) {
	var str = '';
	for(var i=0; i<extra.length; i++) {
		if(!extra[i].raw) {
			str += '\n' + extra[i].field + ': ' + extra[i].value;
		} else {
			str += '\n' + extra[i].raw;
		}
	}
	
	return str.substr(1);
}

var inputFieldMap = {
	booktitle :"publicationTitle",
	school:"publisher",
	institution:"publisher",
	publisher:"publisher",
	issue:"issue",
	location:"place",
	// import also BibLaTeX fields:
	journaltitle:"publicationTitle",
	shortjournal:"journalAbbreviation",
	eventtitle:"conferenceName",
	pagetotal:"numPages",
	version:"version"
};

var zotero2bibtexTypeMap = {
	"book":"book",
	"bookSection":"incollection",
	"journalArticle":"article",
	"magazineArticle":"article",
	"newspaperArticle":"article",
	"thesis":"phdthesis",
	"letter":"misc",
	"manuscript":"unpublished",
	"patent" :"patent",
	"interview":"misc",
	"film":"misc",
	"artwork":"misc",
	"webpage":"misc",
	"conferencePaper":"inproceedings",
	"report":"techreport"
};

var bibtex2zoteroTypeMap = {
	"book":"book", // or booklet, proceedings
	"inbook":"bookSection",
	"incollection":"bookSection",
	"article":"journalArticle", // or magazineArticle or newspaperArticle
	"patent" :"patent",
	"phdthesis":"thesis",
	"unpublished":"manuscript",
	"inproceedings":"conferencePaper", // check for conference also
	"conference":"conferencePaper",
	"techreport":"report",
	"booklet":"book",
	"manual":"book",
	"mastersthesis":"thesis",
	"misc":"book",
	"proceedings":"book",
	"online":"webpage",
	// from BibLaTeX translator:
	"thesis":"thesis",
	"letter":"letter",
	"movie":"film",
	"artwork":"artwork",
	"report":"report",
	"legislation":"bill",
	"jurisdiction":"case",
	"audio":"audioRecording",
	"video":"videoRecording",
	"software":"computerProgram",
	"inreference":"encyclopediaArticle",
	"collection":"book",
	"mvbook":"book"
};

/*
 * three-letter month abbreviations. i assume these are the same ones that the
 * docs say are defined in some appendix of the LaTeX book. (i don't have the
 * LaTeX book.)
 */
var months = ["jan", "feb", "mar", "apr", "may", "jun",
			  "jul", "aug", "sep", "oct", "nov", "dec"];

var jabref = {
	format: null,
	root: {}
};

var alwaysMap = {
	"|":"{\\textbar}",
	"<":"{\\textless}",
	">":"{\\textgreater}",
	"~":"{\\textasciitilde}",
	"^":"{\\textasciicircum}",
	"\\":"{\\textbackslash}",
	// See http://tex.stackexchange.com/questions/230750/open-brace-in-bibtex-fields/230754
	"{" : "\\{\\vphantom{\\}}",
	"}" : "\\vphantom{\\{}\\}"
};


var strings = {};
var keyRe = /[a-zA-Z0-9\-]/;

// Split keywords on space by default when called from another translator
// This is purely for historical reasons. Otherwise we risk breaking tag import
// from some websites
var keywordSplitOnSpace = !!Zotero.parentTranslator;
var keywordDelimRe = /\s*[,;]\s*/;

function setKeywordSplitOnSpace( val ) {
	keywordSplitOnSpace = val;
}

function setKeywordDelimRe( val, flags ) {
	//expect string, but it could be RegExp
	if(typeof(val) != 'string') {
		val = val.toString();
		flags = val.slice(val.lastIndexOf('/')+1);
		val = val.slice(1, val.lastIndexOf('/'));
	}
	
	keywordDelimRe = new RegExp(val, flags);
}

function processField(item, field, value, rawValue) {
	if(Zotero.Utilities.trim(value) == '') return null;
	if(fieldMap[field]) {
		//map DOIs + Label to Extra for unsupported item types
		if (field == "doi" &&!ZU.fieldIsValidForType("DOI", item.itemType) && ZU.cleanDOI(value)) {
			item._extraFields.push({field: "DOI", value: ZU.cleanDOI(value)});
		}
		else {
			item[fieldMap[field]] = value;
		}
	} else if(inputFieldMap[field]) {
		item[inputFieldMap[field]] = value;
	} else if(field == "subtitle") {
		if (!item.title) item.title = '';
		item.title = item.title.trim();
		value = value.trim();
		
		if (!/[-–—:!?.;]$/.test(item.title)
			&& !/^[-–—:.;¡¿]/.test(value)
		) {
			item.title += ': ';
		} else if (item.title.length) {
			item.title += ' ';
		}
		
		item.title += value;
	} else if(field == "journal") {
		if(item.publicationTitle) {
			item.journalAbbreviation = value;
		} else {
			item.publicationTitle = value;
		}
	} else if(field == "fjournal") {
		if(item.publicationTitle) {
			// move publicationTitle to abbreviation, since it probably came from 'journal'
			item.journalAbbreviation = item.publicationTitle;
		}
		item.publicationTitle = value;
	} else if(field == "author" || field == "editor" || field == "translator") {
		// parse authors/editors/translators
		var names = splitUnprotected(rawValue.trim(), /\s+and\s+/gi);
		for(var i in names) {
			var name = names[i];
			// skip empty names
			if (!name) continue;
			
			// Names in BibTeX can have three commas
			pieces = splitUnprotected(name, /\s*,\s*/g);
			var creator = {};
			if (pieces.length > 1) {
				creator.firstName = pieces.pop();
				creator.lastName = unescapeBibTeX(pieces.shift());
				if(pieces.length) {
					// If anything is left, it should only be the 'Jr' part
					creator.firstName += ', ' + pieces.join(', ');
				}
				creator.firstName = unescapeBibTeX(creator.firstName);
				creator.creatorType = field;
			} else if(splitUnprotected(name, / +/g).length > 1){
				creator = Zotero.Utilities.cleanAuthor(unescapeBibTeX(name), field, false);
			} else {
				creator = {
					lastName: unescapeBibTeX(name),
					creatorType: field,
					fieldMode: 1
				}
			}
			item.creators.push(creator);
		}
	} else if(field == "institution" || field == "organization") {
		item.backupPublisher = value;
	} else if(field == "number"){ // fix for techreport
		if (item.itemType == "report") {
			item.reportNumber = value;
		} else if (item.itemType == "book" || item.itemType == "bookSection") {
			item.seriesNumber = value;
		} else if (item.itemType == "patent"){
			item.patentNumber = value;
		} else {
			item.issue = value;
		}
	} else if(field == "month") {
		var monthIndex = months.indexOf(value.toLowerCase());
		if(monthIndex != -1) {
			value = Zotero.Utilities.formatDate({month:monthIndex});
		} else {
			value += " ";
		}
		
		if(item.date) {
			if(value.indexOf(item.date) != -1) {
				// value contains year and more
				item.date = value;
			} else {
				item.date = value+item.date;
			}
		} else {
			item.date = value;
		}
	} else if(field == "year") {
		if(item.date) {
			if(item.date.indexOf(value) == -1) {
				// date does not already contain year
				item.date += value;
			}
		} else {
			item.date = value;
		}
	} else if(field == "date") {
	//We're going to assume that "date" and the date parts don't occur together. If they do, we pick date, which should hold all.
		item.date = value;
	} else if(field == "pages") {
		if (item.itemType == "book" || item.itemType == "thesis" || item.itemType == "manuscript") {
			item.numPages = value;
		}
		else {
			item.pages = value.replace(/--/g, "-");
		}
	} else if(field == "note") {
		var isExtraId = false;
		for (var element in extraIdentifiers) {
			if (value.trim().startsWith(extraIdentifiers[element])) {
				isExtraId = true;
			}
		}
		if (isExtraId) {
			item._extraFields.push({raw: value.trim()});
		} else {
			item.notes.push({note:Zotero.Utilities.text2html(value)});
		}
	} else if(field == "howpublished") {
		if(value.length >= 7) {
			var str = value.substr(0, 7);
			if(str == "http://" || str == "https:/" || str == "mailto:") {
				item.url = value;
			} else {
				item._extraFields.push({field: 'Published', value: value});
			}
		}
	
	} 
	//accept lastchecked or urldate for access date. These should never both occur. 
	//If they do we don't know which is better so we might as well just take the second one
	else if (field == "lastchecked"|| field == "urldate"){
		item.accessDate = value;
	} else if(field == "keywords" || field == "keyword") {
		item.tags = value.split(keywordDelimRe);
		if(item.tags.length == 1 && keywordSplitOnSpace) {
			item.tags = value.split(/\s+/);
		}
	} else if (field == "comment" || field == "annote" || field == "review" || field == "notes") {
		item.notes.push({note:Zotero.Utilities.text2html(value)});
	} else if (field == "pdf" || field == "path" /*Papers2 compatibility*/) {
		item.attachments.push({path:value, mimeType:"application/pdf"});
	} else if (field == "sentelink") { // the reference manager 'Sente' has a unique file scheme in exported BibTeX; it can occur multiple times
		item.attachments.push({path:value.split(",")[0], mimeType:"application/pdf"});
	} else if (field == "file") {
		var start = 0, attachment;
		rawValue = rawValue.replace(/\$\\backslash\$/g, '\\') // Mendeley invention?
			.replace(/([^\\](?:\\\\)*)\\(.){}/g, '$1$2'); // part of Mendeley's escaping (e.g. \~{} = ~)
		for(var i=0; i<rawValue.length; i++) {
			if(rawValue[i] == '\\') {
				i++; //skip next char
				continue;
			}
			if(rawValue[i] == ';') {
				attachment = parseFilePathRecord(rawValue.slice(start, i));
				if(attachment) item.attachments.push(attachment);
				start = i+1;
			}
		}
		
		attachment = parseFilePathRecord(rawValue.slice(start));
		if(attachment) item.attachments.push(attachment);
	} else if (field == "eprint" || field == "eprinttype") {
		// Support for IDs exported by BibLaTeX
		if(field == 'eprint') item._eprint = value;
		else item._eprinttype = value;
		
		var eprint = item._eprint;
		var eprinttype = item._eprinttype;
		// If we don't have both yet, continue
		if(!eprint || !eprinttype) return;
		
		var label = eprintIds[eprinttype.trim().toLowerCase()];
		if(!label) return;
		
		item._extraFields.push({field: label, value: eprint.trim()});
		
		delete item._eprinttype;
		delete item._eprint;
	} else if (extraIdentifiers[field]) {
		var label = extraIdentifiers[field];
		item._extraFields.push({field: label, value: value.trim()});
	}
}

/**
 * Split a string on a provided delimiter, but not if delimiter appears inside { }
 * @param {String} str String to split
 * @param {RegExp} delim RegExp object for the split delimiter. Use g flag to split on each
 * @return {String[]} Array of strings without delimiters
 */
function splitUnprotected(str, delim) {
	delim.lastIndex = 0; // In case we're reusing a regexp
	var nextPossibleSplit = delim.exec(str);
	if(!nextPossibleSplit) return [str];
	
	var parts = [], open = 0, nextPartStart = 0;
	for(var i=0; i<str.length; i++) {
		if(i>nextPossibleSplit.index) {
			// Must have been inside braces
			nextPossibleSplit = delim.exec(str);
			if(!nextPossibleSplit) {
				parts.push(str.substr(nextPartStart));
				return parts;
			}
		}
		
		if(str[i] == '\\') {
			// Skip next character
			i++;
			continue;
		}
		
		if(str[i] == '{') {
			open++;
			continue;
		}
		
		if(str[i] == '}') {
			open--;
			if(open < 0) open = 0; // Shouldn't happen, but...
			continue;
		}
		
		if(open) continue;
		
		if(i == nextPossibleSplit.index) {
			parts.push(str.substring(nextPartStart, i));
			i += nextPossibleSplit[0].length - 1; // We can jump past the split delim
			nextPartStart = i + 1;
			nextPossibleSplit = delim.exec(str);
			if(!nextPossibleSplit) {
				parts.push(str.substr(nextPartStart));
				return parts;
			}
		}
	}
	
	// I don't think we should ever get here*, but just to be safe
	// *we should always be returning from the for loop
	var last = str.substr(nextPartStart).trim();
	if(last) parts.push(last);
	
	return parts;
}

function parseFilePathRecord(record) {
	var start = 0, fields = [];
	for(var i=0; i<record.length; i++) {
		if(record[i] == '\\') {
			i++;
			continue;
		}
		if(record[i] == ':') {
			fields.push(decodeFilePathComponent(record.slice(start, i)));
			start = i+1;
		}
	}
	
	fields.push(decodeFilePathComponent(record.slice(start)));
	
	if(fields.length != 3 && fields.length != 1) {
		Zotero.debug("Unknown file path record format: " + record);
		return;
	}
	
	var attachment = {};
	if(fields.length == 3) {
		attachment.title = fields[0].trim() || 'Attachment';
		attachment.path = fields[1];
		attachment.mimeType = fields[2];
		if(attachment.mimeType.search(/pdf/i) != -1) {
			attachment.mimeType = 'application/pdf';
		}
	} else {
		attachment.title = 'Attachment';
		attachment.path = fields[0];
	}
	
	attachment.path = attachment.path.trim();
	if(!attachment.path) return;
	
	return attachment;
}

function getFieldValue(read) {
	var value = "";
	// now, we have the first character of the field
	if(read == "{") {
		// character is a brace
		var openBraces = 1, nextAsLiteral = false;
		while(read = Zotero.read(1)) {
			if(nextAsLiteral) { // Previous character was a backslash
				value += read;
				nextAsLiteral = false;
				continue;
			}
			
			if(read == "\\") {
				value += read;
				nextAsLiteral = true;
				continue;
			}
			
			if(read == "{") {
				openBraces++;
				value += "{";
			} else if(read == "}") {
				openBraces--;
				if(openBraces == 0) {
					break;
				} else {
					value += "}";
				}
			} else {
				value += read;
			}
		}
		
	} else if(read == '"') {
		var openBraces = 0;
		while(read = Zotero.read(1)) {
			if(read == "{" && value[value.length-1] != "\\") {
				openBraces++;
				value += "{";
			} else if(read == "}" && value[value.length-1] != "\\") {
				openBraces--;
				value += "}";
			} else if(read == '"' && openBraces == 0) {
				break;
			} else {
				value += read;
			}
		}
	}

	return value;
}

function unescapeBibTeX(value) {
	if(value.length < 2) return value;
	
	// replace accented characters (yucky slow)
	value = value.replace(/{?(\\[`"'^~=]){?\\?([A-Za-z])}/g, "{$1$2}");
	//for special characters rendered by \[a-z] we need a space
	value = value.replace(/{?(\\[a-z]){?\\?([A-Za-z])}/g, "{$1 $2}");
	//convert tex markup into permitted HTML
	value = mapTeXmarkup(value);
	for (var mapped in reversemappingTable) { // really really slow!
		var unicode = reversemappingTable[mapped];
		while(value.indexOf(mapped) !== -1) {
			Zotero.debug("Replace " + mapped + " in " + value + " with " + unicode);
			value = value.replace(mapped, unicode);
		}
		mapped = mapped.replace(/[{}]/g, "");
		while(value.indexOf(mapped) !== -1) {
			//Z.debug(value)
			Zotero.debug("Replace(2) " + mapped + " in " + value + " with " + unicode);
			value = value.replace(mapped, unicode);
		}
	}
	
	// kill braces
	value = value.replace(/([^\\])[{}]+/g, "$1");
	if(value[0] == "{") {
		value = value.substr(1);
	}
	
	// chop off backslashes
	value = value.replace(/([^\\])\\([#$%&~_^\\{}])/g, "$1$2");
	value = value.replace(/([^\\])\\([#$%&~_^\\{}])/g, "$1$2");
	if(value[0] == "\\" && "#$%&~_^\\{}".indexOf(value[1]) != -1) {
		value = value.substr(1);
	}
	if(value[value.length-1] == "\\" && "#$%&~_^\\{}".indexOf(value[value.length-2]) != -1) {
		value = value.substr(0, value.length-1);
	}
	value = value.replace(/\\\\/g, "\\");
	value = value.replace(/\s+/g, " ");
	
	// Unescape HTML entities coming from web translators
	if (Zotero.parentTranslator && value.indexOf('&') != -1) {
		value = value.replace(/&#?\w+;/g, function(entity) {
			var char = ZU.unescapeHTML(entity);
			if (char == entity) char = ZU.unescapeHTML(entity.toLowerCase()); // Sometimes case can be incorrect and entities are case-sensitive
			
			return char;
		});
	}
	
	return value;
}

function jabrefSplit(str, sep) {
	var quoted = false;
	var result = [];

	str = str.split('');
	while (str.length > 0) {
		if (result.length == 0) { result = ['']; }

		if (str[0] == sep) {
			str.shift();
			result.push('');
		} else {
			if (str[0] == '\\') { str.shift(); }
			result[result.length - 1] += str.shift();
		}
	}
	return result;
}

function jabrefCollect(arr, func) {
	if (arr == null) { return []; }

	var result = [];

	for (var i = 0; i < arr.length; i++) {
		if (func(arr[i])) {
			result.push(arr[i]);
		}
	}
	return result;
}

function processComment() {
	var comment = "";
	var read;
	var collectionPath = [];
	var parentCollection, collection;

	while(read = Zotero.read(1)) {
		if (read == "}") { break; } // JabRef ought to escape '}' but doesn't; embedded '}' chars will break the import just as it will on JabRef itself
		comment += read;
	}

	if (comment == 'jabref-meta: groupsversion:3;') {
		jabref.format = 3;
		return;
	}

	if (comment.indexOf('jabref-meta: groupstree:') == 0) {
		if (jabref.format != 3) {
			Zotero.debug("jabref: fatal: unsupported group format: " + jabref.format);
			return;
		}
		comment = comment.replace(/^jabref-meta: groupstree:/, '').replace(/[\r\n]/gm, '')

		var records = jabrefSplit(comment, ';');
		while (records.length > 0) {
			var record = records.shift();
			var keys = jabrefSplit(record, ';');
			if (keys.length < 2) { continue; }

			var record = {id: keys.shift()};
			record.data = record.id.match(/^([0-9]) ([^:]*):(.*)/);
			if (record.data == null) {
				Zotero.debug("jabref: fatal: unexpected non-match for group " + record.id);
				return;
			}
			record.level = parseInt(record.data[1]);
			record.type = record.data[2]
			record.name = record.data[3]
			record.intersection = keys.shift(); // 0 = independent, 1 = intersection, 2 = union

			if (isNaN(record.level)) {
				Zotero.debug("jabref: fatal: unexpected record level in " + record.id);
				return;
			}

			if (record.level == 0) { continue; }
			if (record.type != 'ExplicitGroup') {
				Zotero.debug("jabref: fatal: group type " + record.type + " is not supported");
				return;
			}

			collectionPath = collectionPath.slice(0, record.level - 1).concat([record.name]);
			Zotero.debug("jabref: locating level " + record.level + ": " + collectionPath.join('/'));

			if (jabref.root.hasOwnProperty(collectionPath[0])) {
				collection = jabref.root[collectionPath[0]];
				Zotero.debug("jabref: root " + collection.name + " found");
			} else {
				collection = new Zotero.Collection();
				collection.name = collectionPath[0];
				collection.type = 'collection';
				collection.children = [];
				jabref.root[collectionPath[0]] = collection;
				Zotero.debug("jabref: root " + collection.name + " created");
			}
			parentCollection = null;

			for (var i = 1; i < collectionPath.length; i++) {
				var path = collectionPath[i];
				Zotero.debug("jabref: looking for child " + path + " under " + collection.name);

				var child = jabrefCollect(collection.children, function(n) { return (n.name == path)})
				if (child.length != 0) {
					child = child[0]
					Zotero.debug("jabref: child " + child.name + " found under " + collection.name);
				} else {
					child = new Zotero.Collection();
					child.name = path;
					child.type = 'collection';
					child.children = [];

					collection.children.push(child);
					Zotero.debug("jabref: child " + child.name + " created under " + collection.name);
				}

				parentCollection = collection;
				collection = child;
			}

			if (parentCollection) {
				parentCollection = jabrefCollect(parentCollection.children, function(n) { return (n.type == 'item') });
			}

			if (record.intersection == '2' && parentCollection) { // union with parent
				collection.children = parentCollection;
			}

			while(keys.length > 0) {
				key = keys.shift();
				if (key != '') {
					Zotero.debug('jabref: adding ' + key + ' to ' + collection.name);
					collection.children.push({type: 'item', id: key});
				}
			}

			if (parentCollection && record.intersection == '1') { // intersection with parent
				collection.children = jabrefMap(collection.children, function(n) { parentCollection.indexOf(n) !== -1; });
			}
		}
	}
}

function beginRecord(type, closeChar) {
	type = Zotero.Utilities.trimInternal(type.toLowerCase());
	if(type != "string") {
		var zoteroType = bibtex2zoteroTypeMap[type];
		if (!zoteroType) {
			Zotero.debug("discarded item from BibTeX; type was "+type);
			return;
		}
		var item = new Zotero.Item(zoteroType);
		item._extraFields = [];
	}
	
	// For theses write the thesisType determined by the BibTeX type.
	if (type == "mastersthesis" && item) item.type = "Master's Thesis";
	if (type == "phdthesis" && item) item.type = "PhD Thesis";

	var field = "";
	
	// by setting dontRead to true, we can skip a read on the next iteration
	// of this loop. this is useful after we read past the end of a string.
	var dontRead = false;
	
	var value, rawValue;
	while(dontRead || (read = Zotero.read(1))) {
		dontRead = false;
		
		if(read == "=") {								// equals begin a field
		// read whitespace
			var read = Zotero.read(1);
			while(" \n\r\t".indexOf(read) != -1) {
				read = Zotero.read(1);
			}
			
			if(keyRe.test(read)) {
				// read numeric data here, since we might get an end bracket
				// that we should care about
				value = "";
				value += read;
				
				// character is a number
				while((read = Zotero.read(1)) && keyRe.test(read)) {
					value += read;
				}
				
				// don't read the next char; instead, process the character
				// we already read past the end of the string
				dontRead = true;
				
				// see if there's a defined string
				if(strings[value]) value = strings[value];
			} else {
				rawValue = getFieldValue(read);
				value = unescapeBibTeX(rawValue);
			}
			
			if(item) {
				processField(item, field.toLowerCase(), value, rawValue);
			} else if(type == "string") {
				strings[field] = value;
			}
			field = "";
		} else if(read == ",") {						// commas reset
			if (item.itemID == null) {
				item.itemID = field; // itemID = citekey
			}
			field = "";
		} else if(read == closeChar) {
			if(item) {
				item.extra = extraFieldsToString(item._extraFields);
				delete item._extraFields;
				
				if (!item.publisher && item.backupPublisher){
					item.publisher=item.backupPublisher;
					delete item.backupPublisher;
				}
				return item.complete();
			}
			return;
		} else if(" \n\r\t".indexOf(read) == -1) {		// skip whitespace
			field += read;
		}
	}
}

function doImport() {
	if (typeof Promise == 'undefined') {
		readString(
			function () {},
			function (e) {
				throw e;
			}
		);
	}
	else {
		return new Promise(function (resolve, reject) {
			readString(resolve, reject);
		});
	}
}

function readString(resolve, reject) {
	var read = "";
	var type = false;
	
	var next = function () {
		readString(resolve, reject);
	};
	
	try {
		while (read = Zotero.read(1)) {
			if(read == "@") {
				type = "";
			} else if(type !== false) {
				if(type == "comment") {
					processComment();
					type = false;
				} else if(read == "{") {		// possible open character
					// This might return a promise if an item was saved
					// TODO: When 5.0-only, make sure this always returns a promise
					var maybePromise = beginRecord(type, "}");
					if (maybePromise) {
						maybePromise.then(next);
						return;
					}
				} else if(read == "(") {		// possible open character
					var maybePromise = beginRecord(type, ")");
					if (maybePromise) {
						maybePromise.then(next);
						return;
					}
				} else if(/[a-zA-Z0-9-_]/.test(read)) {
					type += read;
				}
			}
		}
		for (var key in jabref.root) {
			// TODO: Handle promise?
			if (jabref.root.hasOwnProperty(key)) { jabref.root[key].complete(); }
		}
	}
	catch (e) {
		reject(e);
		return;
	}
	
	resolve();
}

// some fields are, in fact, macros.  If that is the case then we should not put the
// data in the braces as it will cause the macros to not expand properly
function writeField(field, value, isMacro) {
	if (!value && typeof value != "number") return;
	value = value + ""; // convert integers to strings
	Zotero.write(",\n\t" + field + " = ");
	if (!isMacro) Zotero.write("{");
	// url field is preserved, for use with \href and \url
	// Other fields (DOI?) may need similar treatment
	if (!isMacro && !(field == "url" || field == "doi" || field == "file" || field == "lccn" )) {
		// I hope these are all the escape characters!
		value = escapeSpecialCharacters(value);
		
		if (caseProtectedFields.indexOf(field) != -1) {
			value = ZU.XRegExp.replace(value, protectCapsRE, "$1{$2$3}"); // only $2 or $3 will have a value, not both
		}
	}
	if (Zotero.getOption("exportCharset") != "UTF-8") {
		value = value.replace(/[\u0080-\uFFFF]/g, mapAccent);
	}
	//convert the HTML markup allowed in Zotero for rich text to TeX; excluding doi/url/file shouldn't be necessary, but better to be safe;
	if (!((field == "url") || (field == "doi") || (field == "file"))) value = mapHTMLmarkup(value);
	Zotero.write(value);
	if (!isMacro) Zotero.write("}");
}

function mapHTMLmarkup(characters){
	//converts the HTML markup allowed in Zotero for rich text to TeX
	//since  < and > have already been escaped, we need this rather hideous code - I couldn't see a way around it though.
	//italics and bold
	characters = characters.replace(/\{\\textless\}i\{\\textgreater\}(.+?)\{\\textless\}\/i{\\textgreater\}/g, "\\textit{$1}")
		.replace(/\{\\textless\}b\{\\textgreater\}(.+?)\{\\textless\}\/b{\\textgreater\}/g, "\\textbf{$1}");
	//sub and superscript
	characters = characters.replace(/\{\\textless\}sup\{\\textgreater\}(.+?)\{\\textless\}\/sup{\\textgreater\}/g, "\$^{\\textrm{$1}}\$")
		.replace(/\{\\textless\}sub\{\\textgreater\}(.+?)\{\\textless\}\/sub\{\\textgreater\}/g, "\$_{\\textrm{$1}}\$");
	//two variants of small caps
	characters = characters.replace(/\{\\textless\}span\sstyle=\"small\-caps\"\{\\textgreater\}(.+?)\{\\textless\}\/span{\\textgreater\}/g, "\\textsc{$1}")
		.replace(/\{\\textless\}sc\{\\textgreater\}(.+?)\{\\textless\}\/sc\{\\textgreater\}/g, "\\textsc{$1}");
	return characters;
}


function mapTeXmarkup(tex){
	//reverse of the above - converts tex mark-up into html mark-up permitted by Zotero
	//italics and bold
	tex = tex.replace(/\\textit\{([^\}]+\})/g, "<i>$1</i>").replace(/\\textbf\{([^\}]+\})/g, "<b>$1</b>");
	//two versions of subscript the .* after $ is necessary because people m
	tex = tex.replace(/\$[^\{\$]*_\{([^\}]+\})\$/g, "<sub>$1</sub>").replace(/\$[^\{]*_\{\\textrm\{([^\}]+\}\})/g, "<sub>$1</sub>");	
	//two version of superscript
	tex = tex.replace(/\$[^\{]*\^\{([^\}]+\}\$)/g, "<sup>$1</sup>").replace(/\$[^\{]*\^\{\\textrm\{([^\}]+\}\})/g, "<sup>$1</sup>");	
	//small caps
	tex = tex.replace(/\\textsc\{([^\}]+)/g, "<span style=\"small-caps\">$1</span>");
	return tex;
}
//Disable the isTitleCase function until we decide what to do with it.
/* const skipWords = ["but", "or", "yet", "so", "for", "and", "nor",
	"a", "an", "the", "at", "by", "from", "in", "into", "of", "on",
	"to", "with", "up", "down", "as", "while", "aboard", "about",
	"above", "across", "after", "against", "along", "amid", "among",
	"anti", "around", "as", "before", "behind", "below", "beneath",
	"beside", "besides", "between", "beyond", "but", "despite",
	"down", "during", "except", "for", "inside", "like", "near",
	"off", "onto", "over", "past", "per", "plus", "round", "save",
	"since", "than", "through", "toward", "towards", "under",
	"underneath", "unlike", "until", "upon", "versus", "via",
	"within", "without"];

function isTitleCase(string) {
	const wordRE = /[\s[(]([^\s,\.:?!\])]+)/g;

	var word;
	while (word = wordRE.exec(string)) {
		word = word[1];
		if(word.search(/\d/) != -1	//ignore words with numbers (including just numbers)
			|| skipWords.indexOf(word.toLowerCase()) != -1) {
			continue;
		}

		if(word.toLowerCase() == word) return false;
	}
	return true;
}
*/

// See http://tex.stackexchange.com/questions/230750/open-brace-in-bibtex-fields/230754
var vphantomRe = /\\vphantom{\\}}((?:.(?!\\vphantom{\\}}))*)\\vphantom{\\{}/g;
function escapeSpecialCharacters(str) {
	var newStr = str.replace(/[|\<\>\~\^\\\{\}]/g, function(c) { return alwaysMap[c] })
		.replace(/([\#\$\%\&\_])/g, "\\$1");
	
	// We escape each brace in the text by making sure that it has a counterpart,
	// but sometimes this is overkill if the brace already has a counterpart in
	// the text.
	if (newStr.indexOf('\\vphantom') != -1) {
		var m;
		while (m = vphantomRe.exec(newStr)) {
			// Can't use a simple replace, because we want to match up inner with inner
			// and outer with outer
			newStr = newStr.substr(0,m.index) + m[1] + newStr.substr(m.index + m[0].length);
			vphantomRe.lastIndex = 0; // Start over, because the previous replacement could have created a new pair
		}
	}
	
	return newStr;
}

function mapAccent(character) {
	return (mappingTable[character] ? mappingTable[character] : "?");
}

var filePathSpecialChars = '\\\\:;$'; // $ for Mendeley (see cleanFilePath for {})
var encodeFilePathRE = new RegExp('[' + filePathSpecialChars + ']', 'g');

// We strip out {} in general, because \{ and \} still break BibTeX (0.99d)
function cleanFilePath(str) {
	if (!str) return '';
	return str.replace(/(?:\s*[{}]+)+\s*/g, ' ');
}

function encodeFilePathComponent(value) {
	if (!value) return '';
	return value.replace(encodeFilePathRE, "\\$&");
}

function decodeFilePathComponent(value) {
	if (!value) return '';
	return value.replace(/\\([^A-Za-z0-9.])/g, "$1");
}

// a little substitution function for BibTeX keys, where we don't want LaTeX 
// escaping, but we do want to preserve the base characters

function tidyAccents(s) {
	var r=s.toLowerCase();

	// XXX Remove conditional when we drop Zotero 2.1.x support
	// This is supported in Zotero 3.0 and higher
	if (ZU.removeDiacritics !== undefined)
		r = ZU.removeDiacritics(r, true);
	else {
	// We fall back on the replacement list we used previously
		r = r.replace(new RegExp("[ä]", 'g'),"ae");
		r = r.replace(new RegExp("[ö]", 'g'),"oe");
		r = r.replace(new RegExp("[ü]", 'g'),"ue");
		r = r.replace(new RegExp("[àáâãå]", 'g'),"a");
		r = r.replace(new RegExp("æ", 'g'),"ae");
		r = r.replace(new RegExp("ç", 'g'),"c");
		r = r.replace(new RegExp("[èéêë]", 'g'),"e");
		r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
		r = r.replace(new RegExp("ñ", 'g'),"n");                            
		r = r.replace(new RegExp("[òóôõ]", 'g'),"o");
		r = r.replace(new RegExp("œ", 'g'),"oe");
		r = r.replace(new RegExp("[ùúû]", 'g'),"u");
		r = r.replace(new RegExp("[ýÿ]", 'g'),"y");
	}

	return r;
};

var numberRe = /^[0-9]+/;
// Below is a list of words that should not appear as part of the citation key
// it includes the indefinite articles of English, German, French and Spanish, as well as a small set of English prepositions whose 
// force is more grammatical than lexical, i.e. which are likely to strike many as 'insignificant'.
// The assumption is that most who want a title word in their key would prefer the first word of significance.
// Also remove markup
var citeKeyTitleBannedRe = /\b(a|an|the|some|from|on|in|to|of|do|with|der|die|das|ein|eine|einer|eines|einem|einen|un|une|la|le|l\'|el|las|los|al|uno|una|unos|unas|de|des|del|d\')(\s+|\b)|(<\/?(i|b|sup|sub|sc|span style=\"small-caps\"|span)>)/g;
var citeKeyConversionsRe = /%([a-zA-Z])/;
var citeKeyCleanRe = /[^a-z0-9\!\$\&\*\+\-\.\/\:\;\<\>\?\[\]\^\_\`\|]+/g;

var citeKeyConversions = {
	"a":function (flags, item) {
		if(item.creators && item.creators[0] && item.creators[0].lastName) {
			return item.creators[0].lastName.toLowerCase().replace(/ /g,"_").replace(/,/g,"");
		}
		return "noauthor";
	},
	"t":function (flags, item) {
		if (item["title"]) {
			return item["title"].toLowerCase().replace(citeKeyTitleBannedRe, "").split(/\s+/g)[0];
		}
		return "notitle";
	},
	"y":function (flags, item) {
		if(item.date) {
			var date = Zotero.Utilities.strToDate(item.date);
			if(date.year && numberRe.test(date.year)) {
				return date.year;
			}
		}
		return "nodate";
	}
}


function buildCiteKey (item,citekeys) {
	var basekey = "";
	var counter = 0;
	citeKeyFormatRemaining = citeKeyFormat;
	while (citeKeyConversionsRe.test(citeKeyFormatRemaining)) {
		if (counter > 100) {
			Zotero.debug("Pathological BibTeX format: " + citeKeyFormat);
			break;
		}
		var m = citeKeyFormatRemaining.match(citeKeyConversionsRe);
		if (m.index > 0) {
			//add data before the conversion match to basekey
			basekey = basekey + citeKeyFormatRemaining.substr(0, m.index);
		}
		var flags = ""; // for now
		var f = citeKeyConversions[m[1]];
		if (typeof(f) == "function") {
			var value = f(flags, item);
			Zotero.debug("Got value " + value + " for %" + m[1]);
			//add conversion to basekey
			basekey = basekey + value;
		}
		citeKeyFormatRemaining = citeKeyFormatRemaining.substr(m.index + m.length);
		counter++;
	}
	if (citeKeyFormatRemaining.length > 0) {
		basekey = basekey + citeKeyFormatRemaining;
	}

	// for now, remove any characters not explicitly known to be allowed;
	// we might want to allow UTF-8 citation keys in the future, depending
	// on implementation support.
	//
	// no matter what, we want to make sure we exclude
	// " # % ' ( ) , = { } ~ and backslash
	// however, we want to keep the base characters 

	basekey = tidyAccents(basekey);
	basekey = basekey.replace(citeKeyCleanRe, "");
	var citekey = basekey;
	var i = 0;
	while(citekeys[citekey]) {
		i++;
		citekey = basekey + "-" + i;
	}
	citekeys[citekey] = true;
	return citekey;
}

var protectCapsRE;
function doExport() {
	if (Zotero.getHiddenPref && Zotero.getHiddenPref('BibTeX.export.dontProtectInitialCase')) {
		// Case of words with uppercase characters in non-initial positions is
		// preserved with braces.
		// Two extra captures because of the other regexp below
		protectCapsRE = new ZU.XRegExp("()()\\b(\\p{Letter}+\\p{Uppercase_Letter}\\p{Letter}*)", 'g');
	} else {
		// Protect all upper case letters, even if the uppercase letter is only in
		// initial position of the word.
		// Don't protect first word if only first letter is capitalized
		protectCapsRE = new ZU.XRegExp(
			"(.)\\b(\\p{Letter}*\\p{Uppercase_Letter}\\p{Letter}*)" // Non-initial words with capital letter anywhere
				+ "|^(\\p{Letter}+\\p{Uppercase_Letter}\\p{Letter}*)" // Initial word with capital in non-initial position
			, 'g');
	}
	
	//Zotero.write("% BibTeX export generated by Zotero "+Zotero.Utilities.getVersion());
	// to make sure the BOM gets ignored
	Zotero.write("\n");
	
	var first = true;
	var citekeys = new Object();
	var item;
	while(item = Zotero.nextItem()) {
		//don't export standalone notes and attachments
		if(item.itemType == "note" || item.itemType == "attachment") continue;

		// determine type
		var type = zotero2bibtexTypeMap[item.itemType];
		if (typeof(type) == "function") { type = type(item); }

		// For theses BibTeX distinguish between @mastersthesis and @phdthesis
		// and the default mapping will map all Zotero thesis items to a
		// BibTeX phdthesis item. Here we try to fix this by examining the
		// Zotero thesisType field.
		if (type == "phdthesis") {
			// In practice, we just want to separate out masters theses,
			// and will assume everything else maps to @phdthesis. Better to
			// err on the side of caution.
			var thesisType = item.type && item.type.toLowerCase().replace(/[\s.]+|thesis|unpublished/g, '');
			if (thesisType &&  (thesisType == 'master' || thesisType == 'masters'  || thesisType == "master's" || thesisType == 'ms' || thesisType == 'msc' || thesisType == 'ma')) {
				type = "mastersthesis";
				item["type"] = "";
			}
		}

		if(!type) type = "misc";
		
		// create a unique citation key
		var citekey = buildCiteKey(item, citekeys);
		
		// write citation key
		Zotero.write((first ? "" : "\n\n") + "@"+type+"{"+citekey);
		first = false;
		
		for(var field in fieldMap) {
			if(item[fieldMap[field]]) {
				writeField(field, item[fieldMap[field]]);
			}
		}

		if(item.reportNumber || item.issue || item.seriesNumber || item.patentNumber) {
			writeField("number", item.reportNumber || item.issue || item.seriesNumber|| item.patentNumber);
		}
		
		if (item.accessDate){
			var accessYMD = item.accessDate.replace(/\s*\d+:\d+:\d+/, "");
			writeField("urldate", accessYMD);
		}
		
		if(item.publicationTitle) {
			if(item.itemType == "bookSection" || item.itemType == "conferencePaper") {
				writeField("booktitle", item.publicationTitle);
			} else if(Zotero.getOption("useJournalAbbreviation") && item.journalAbbreviation){
				writeField("journal", item.journalAbbreviation);
			} else {
				writeField("journal", item.publicationTitle);
			}
		}
		
		if(item.publisher) {
			if(item.itemType == "thesis") {
				writeField("school", item.publisher);
			} else if(item.itemType =="report") {
				writeField("institution", item.publisher);
			} else {
				writeField("publisher", item.publisher);
			}
		}
		
		if(item.creators && item.creators.length) {
			// split creators into subcategories
			var author = "";
			var editor = "";
			var translator = "";
			var collaborator = "";
			var primaryCreatorType = Zotero.Utilities.getCreatorsForType(item.itemType)[0];
			for(var i in item.creators) {
				var creator = item.creators[i];
				var creatorString;

				if (creator.firstName) {
					var fname = creator.firstName.split(/\s*,!?\s*/);
					fname.push(fname.shift()); // If we have a Jr. part(s), it should precede first name
					creatorString = creator.lastName + ", " + fname.join(', ');
				} else {
					creatorString = creator.lastName;
				}
				
				creatorString = escapeSpecialCharacters(creatorString);
				
				if (creator.fieldMode == true) { // fieldMode true, assume corporate author
					creatorString = "{" + creatorString + "}";
				} else {
					creatorString = creatorString.replace(/ (and) /gi, ' {$1} ');
				}

				if (creator.creatorType == "editor" || creator.creatorType == "seriesEditor") {
					editor += " and "+creatorString;
				} else if (creator.creatorType == "translator") {
					translator += " and "+creatorString;
				} else if (creator.creatorType == primaryCreatorType) {
					author += " and "+creatorString;
				} else {
					collaborator += " and "+creatorString;
				}
			}
			
			if(author) {
				writeField("author", "{" + author.substr(5) + "}", true);
			}
			if(editor) {
				writeField("editor", "{" + editor.substr(5) + "}", true);
			}
			if(translator) {
				writeField("translator",  "{" + translator.substr(5) + "}", true);
			}
			if(collaborator) {
				writeField("collaborator",  "{" + collaborator.substr(5) + "}", true);
			}
		}
		
		if(item.date) {
			var date = Zotero.Utilities.strToDate(item.date);
			// need to use non-localized abbreviation
			if(typeof date.month == "number") {
				writeField("month", months[date.month], true);
			}
			if(date.year) {
				writeField("year", date.year);
			}
		}
		
		if(item.extra) {
			// Export identifiers
			var extraFields = parseExtraFields(item.extra);
			for(var i=0; i<extraFields.length; i++) {
				var rec = extraFields[i];
				if(!rec.field || !revExtraIds[rec.field]) continue;
				var value = rec.value.trim();
				if(value) {
					writeField(revExtraIds[rec.field], '{'+value+'}', true);
					extraFields.splice(i, 1);
					i--;
				}
			}
			var extra = extraFieldsToString(extraFields); // Make sure we join exactly with what we split
			if(extra) writeField("note", extra);
		}
		
		if(item.tags && item.tags.length) {
			var tagString = "";
			for(var i in item.tags) {
				var tag = item.tags[i];
				tagString += ", "+tag.tag;
			}
			writeField("keywords", tagString.substr(2));
		}
		
		if(item.pages) {
			writeField("pages", item.pages.replace(/[-\u2012-\u2015\u2053]+/g,"--"));
		}
		
		// Commented out, because we don't want a books number of pages in the BibTeX "pages" field for books.
		//if(item.numPages) {
		//	writeField("pages", item.numPages);
		//}
		
		/* We'll prefer url over howpublished see 
		https://forums.zotero.org/discussion/24554/bibtex-doubled-url/#Comment_157802
		
		if(item.itemType == "webpage") {
			writeField("howpublished", item.url);
		}*/
		if (item.notes && Zotero.getOption("exportNotes")) {
			for(var i in item.notes) {
				var note = item.notes[i];
				writeField("annote", Zotero.Utilities.unescapeHTML(note["note"]));
			}
		}		
		
		if(item.attachments) {
			var attachmentString = "";
			
			for(var i in item.attachments) {
				var attachment = item.attachments[i];
				// Unfortunately, it looks like \{ in file field breaks BibTeX (0.99d)
				// even if properly backslash escaped, so we have to make sure that
				// it doesn't make it into this field at all
				var title = cleanFilePath(attachment.title),
					path = null;
				
				if(Zotero.getOption("exportFileData") && attachment.saveFile) {
					path = cleanFilePath(attachment.defaultPath);
					attachment.saveFile(path, true);
				} else if(attachment.localPath) {
					path = cleanFilePath(attachment.localPath);
				}
				
				if (path) {
					attachmentString += ";" + encodeFilePathComponent(title)
						+ ":" + encodeFilePathComponent(path)
						+ ":" + encodeFilePathComponent(attachment.mimeType);
				}
			}
			
			if(attachmentString) {
				writeField("file", attachmentString.substr(1));
			}
		}
		
		Zotero.write("\n}");
	}
}

var exports = {
	"doExport": doExport,
	"doImport": doImport,
	"setKeywordDelimRe": setKeywordDelimRe,
	"setKeywordSplitOnSpace": setKeywordSplitOnSpace
}

/*
 * new mapping table based on that from Matthias Steffens,
 * then enhanced with some fields generated from the unicode table.
 */

var mappingTable = {
	"\u00A0":"~", // NO-BREAK SPACE
	"\u00A1":"{\\textexclamdown}", // INVERTED EXCLAMATION MARK
	"\u00A2":"{\\textcent}", // CENT SIGN
	"\u00A3":"{\\textsterling}", // POUND SIGN
	"\u00A5":"{\\textyen}", // YEN SIGN
	"\u00A6":"{\\textbrokenbar}", // BROKEN BAR
	"\u00A7":"{\\textsection}", // SECTION SIGN
	"\u00A8":"{\\textasciidieresis}", // DIAERESIS
	"\u00A9":"{\\textcopyright}", // COPYRIGHT SIGN
	"\u00AA":"{\\textordfeminine}", // FEMININE ORDINAL INDICATOR
	"\u00AB":"{\\guillemotleft}", // LEFT-POINTING DOUBLE ANGLE QUOTATION MARK
	"\u00AC":"{\\textlnot}", // NOT SIGN
	"\u00AD":"-", // SOFT HYPHEN
	"\u00AE":"{\\textregistered}", // REGISTERED SIGN
	"\u00AF":"{\\textasciimacron}", // MACRON
	"\u00B0":"{\\textdegree}", // DEGREE SIGN
	"\u00B1":"{\\textpm}", // PLUS-MINUS SIGN
	"\u00B2":"{\\texttwosuperior}", // SUPERSCRIPT TWO
	"\u00B3":"{\\textthreesuperior}", // SUPERSCRIPT THREE
	"\u00B4":"{\\textasciiacute}", // ACUTE ACCENT
	"\u00B5":"{\\textmu}", // MICRO SIGN
	"\u00B6":"{\\textparagraph}", // PILCROW SIGN
	"\u00B7":"{\\textperiodcentered}", // MIDDLE DOT
	"\u00B8":"{\\c\\ }", // CEDILLA
	"\u00B9":"{\\textonesuperior}", // SUPERSCRIPT ONE
	"\u00BA":"{\\textordmasculine}", // MASCULINE ORDINAL INDICATOR
	"\u00BB":"{\\guillemotright}", // RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK
	"\u00BC":"{\\textonequarter}", // VULGAR FRACTION ONE QUARTER
	"\u00BD":"{\\textonehalf}", // VULGAR FRACTION ONE HALF
	"\u00BE":"{\\textthreequarters}", // VULGAR FRACTION THREE QUARTERS
	"\u00BF":"{\\textquestiondown}", // INVERTED QUESTION MARK
	"\u00C6":"{\\AE}", // LATIN CAPITAL LETTER AE
	"\u00D0":"{\\DH}", // LATIN CAPITAL LETTER ETH
	"\u00D7":"{\\texttimes}", // MULTIPLICATION SIGN
	"\u00D8":"{\\O}", // LATIN CAPITAL LETTER O WITH STROKE
	"\u00DE":"{\\TH}", // LATIN CAPITAL LETTER THORN
	"\u00DF":"{\\ss}", // LATIN SMALL LETTER SHARP S
	"\u00E6":"{\\ae}", // LATIN SMALL LETTER AE
	"\u00F0":"{\\dh}", // LATIN SMALL LETTER ETH
	"\u00F7":"{\\textdiv}", // DIVISION SIGN
	"\u00F8":"{\\o}", // LATIN SMALL LETTER O WITH STROKE
	"\u00FE":"{\\th}", // LATIN SMALL LETTER THORN
	"\u0131":"{\\i}", // LATIN SMALL LETTER DOTLESS I
	"\u0132":"IJ", // LATIN CAPITAL LIGATURE IJ
	"\u0133":"ij", // LATIN SMALL LIGATURE IJ
	"\u0138":"k", // LATIN SMALL LETTER KRA
	"\u0149":"'n", // LATIN SMALL LETTER N PRECEDED BY APOSTROPHE
	"\u014A":"{\\NG}", // LATIN CAPITAL LETTER ENG
	"\u014B":"{\\ng}", // LATIN SMALL LETTER ENG
	"\u0152":"{\\OE}", // LATIN CAPITAL LIGATURE OE
	"\u0153":"{\\oe}", // LATIN SMALL LIGATURE OE
	"\u017F":"s", // LATIN SMALL LETTER LONG S
	"\u02B9":"'", // MODIFIER LETTER PRIME
	"\u02BB":"'", // MODIFIER LETTER TURNED COMMA
	"\u02BC":"'", // MODIFIER LETTER APOSTROPHE
	"\u02BD":"'", // MODIFIER LETTER REVERSED COMMA
	"\u02C6":"{\\textasciicircum}", // MODIFIER LETTER CIRCUMFLEX ACCENT
	"\u02C8":"'", // MODIFIER LETTER VERTICAL LINE
	"\u02C9":"-", // MODIFIER LETTER MACRON
	"\u02CC":",", // MODIFIER LETTER LOW VERTICAL LINE
	"\u02D0":":", // MODIFIER LETTER TRIANGULAR COLON
	"\u02DA":"o", // RING ABOVE
	"\u02DC":"\\~{}", // SMALL TILDE
	"\u02DD":"{\\textacutedbl}", // DOUBLE ACUTE ACCENT
	"\u0374":"'", // GREEK NUMERAL SIGN
	"\u0375":",", // GREEK LOWER NUMERAL SIGN
	"\u037E":";", // GREEK QUESTION MARK
	//Greek letters courtesy of spartanroc
	"\u0393":"$\\Gamma$", // GREEK Gamma
	"\u0394":"$\\Delta$", // GREEK Delta
	"\u0398":"$\\Theta$", // GREEK Theta
	"\u039B":"$\\Lambda$", // GREEK Lambda
	"\u039E":"$\\Xi$", // GREEK Xi
	"\u03A0":"$\\Pi$", // GREEK Pi
	"\u03A3":"$\\Sigma$", // GREEK Sigma
	"\u03A6":"$\\Phi$", // GREEK Phi
	"\u03A8":"$\\Psi$", // GREEK Psi
	"\u03A9":"$\\Omega$", // GREEK Omega
	"\u03B1":"$\\alpha$", // GREEK alpha
	"\u03B2":"$\\beta$", // GREEK beta
	"\u03B3":"$\\gamma$", // GREEK gamma
	"\u03B4":"$\\delta$", // GREEK delta
	"\u03B5":"$\\varepsilon$", // GREEK var-epsilon
	"\u03B6":"$\\zeta$", // GREEK zeta
	"\u03B7":"$\\eta$", // GREEK eta
	"\u03B8":"$\\theta$", // GREEK theta
	"\u03B9":"$\\iota$", // GREEK iota
	"\u03BA":"$\\kappa$", // GREEK kappa
	"\u03BB":"$\\lambda$", // GREEK lambda
	"\u03BC":"$\\mu$", // GREEK mu
	"\u03BD":"$\\nu$", // GREEK nu
	"\u03BE":"$\\xi$", // GREEK xi
	"\u03C0":"$\\pi$", // GREEK pi
	"\u03C1":"$\\rho$", // GREEK rho
	"\u03C2":"$\\varsigma$", // GREEK var-sigma
	"\u03C3":"$\\sigma$", // GREEK sigma
	"\u03C4":"$\\tau$", // GREEK tau
	"\u03C5":"$\\upsilon$", // GREEK upsilon
	"\u03C6":"$\\varphi$", // GREEK var-phi
	"\u03C7":"$\\chi$", // GREEK chi
	"\u03C8":"$\\psi$", // GREEK psi
	"\u03C9":"$\\omega$", // GREEK omega
	"\u03D1":"$\\vartheta$", // GREEK var-theta
	"\u03D2":"$\\Upsilon$", // GREEK Upsilon
	"\u03D5":"$\\phi$", // GREEK phi
	"\u03D6":"$\\varpi$", // GREEK var-pi
	"\u03F1":"$\\varrho$", // GREEK var-rho
	"\u03F5":"$\\epsilon$", // GREEK epsilon
	//Greek letters end
	"\u2000":" ", // EN QUAD
	"\u2001":"  ", // EM QUAD
	"\u2002":" ", // EN SPACE
	"\u2003":"  ", // EM SPACE
	"\u2004":" ", // THREE-PER-EM SPACE
	"\u2005":" ", // FOUR-PER-EM SPACE
	"\u2006":" ", // SIX-PER-EM SPACE
	"\u2007":" ", // FIGURE SPACE
	"\u2008":" ", // PUNCTUATION SPACE
	"\u2009":" ", // THIN SPACE
	"\u2010":"-", // HYPHEN
	"\u2011":"-", // NON-BREAKING HYPHEN
	"\u2012":"-", // FIGURE DASH
	"\u2013":"{\\textendash}", // EN DASH
	"\u2014":"{\\textemdash}", // EM DASH
	"\u2015":"{\\textemdash}", // HORIZONTAL BAR or QUOTATION DASH (not in LaTeX -- use EM DASH)
	"\u2016":"{\\textbardbl}", // DOUBLE VERTICAL LINE
	"\u2017":"{\\textunderscore}", // DOUBLE LOW LINE
	"\u2018":"{\\textquoteleft}", // LEFT SINGLE QUOTATION MARK
	"\u2019":"{\\textquoteright}", // RIGHT SINGLE QUOTATION MARK
	"`" : "\u2018", // LEFT SINGLE QUOTATION MARK
	"'" : "\u2019", // RIGHT SINGLE QUOTATION MARK
	"\u201A":"{\\quotesinglbase}", // SINGLE LOW-9 QUOTATION MARK
	"\u201B":"'", // SINGLE HIGH-REVERSED-9 QUOTATION MARK
	"\u201C":"{\\textquotedblleft}", // LEFT DOUBLE QUOTATION MARK
	"\u201D":"{\\textquotedblright}", // RIGHT DOUBLE QUOTATION MARK
	"\u201E":"{\\quotedblbase}", // DOUBLE LOW-9 QUOTATION MARK
	"\u201F":"{\\quotedblbase}", // DOUBLE HIGH-REVERSED-9 QUOTATION MARK
	"\u2020":"{\\textdagger}", // DAGGER
	"\u2021":"{\\textdaggerdbl}", // DOUBLE DAGGER
	"\u2022":"{\\textbullet}", // BULLET
	"\u2023":">", // TRIANGULAR BULLET
	"\u2024":".", // ONE DOT LEADER
	"\u2025":"..", // TWO DOT LEADER
	"\u2026":"{\\textellipsis}", // HORIZONTAL ELLIPSIS
	"\u2027":"-", // HYPHENATION POINT
	"\u202F":" ", // NARROW NO-BREAK SPACE
	"\u2030":"{\\textperthousand}", // PER MILLE SIGN
	"\u2032":"'", // PRIME
	"\u2033":"'", // DOUBLE PRIME
	"\u2034":"'''", // TRIPLE PRIME
	"\u2035":"`", // REVERSED PRIME
	"\u2036":"``", // REVERSED DOUBLE PRIME
	"\u2037":"```", // REVERSED TRIPLE PRIME
	"\u2039":"{\\guilsinglleft}", // SINGLE LEFT-POINTING ANGLE QUOTATION MARK
	"\u203A":"{\\guilsinglright}", // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK
	"\u203C":"!!", // DOUBLE EXCLAMATION MARK
	"\u203E":"-", // OVERLINE
	"\u2043":"-", // HYPHEN BULLET
	"\u2044":"{\\textfractionsolidus}", // FRACTION SLASH
	"\u2048":"?!", // QUESTION EXCLAMATION MARK
	"\u2049":"!?", // EXCLAMATION QUESTION MARK
	"\u204A":"7", // TIRONIAN SIGN ET
	"\u2070":"$^{0}$", // SUPERSCRIPT ZERO
	"\u2074":"$^{4}$", // SUPERSCRIPT FOUR
	"\u2075":"$^{5}$", // SUPERSCRIPT FIVE
	"\u2076":"$^{6}$", // SUPERSCRIPT SIX
	"\u2077":"$^{7}$", // SUPERSCRIPT SEVEN
	"\u2078":"$^{8}$", // SUPERSCRIPT EIGHT
	"\u2079":"$^{9}$", // SUPERSCRIPT NINE
	"\u207A":"$^{+}$", // SUPERSCRIPT PLUS SIGN
	"\u207B":"$^{-}$", // SUPERSCRIPT MINUS
	"\u207C":"$^{=}$", // SUPERSCRIPT EQUALS SIGN
	"\u207D":"$^{(}$", // SUPERSCRIPT LEFT PARENTHESIS
	"\u207E":"$^{)}$", // SUPERSCRIPT RIGHT PARENTHESIS
	"\u207F":"$^{n}$", // SUPERSCRIPT LATIN SMALL LETTER N
	"\u2080":"$_{0}$", // SUBSCRIPT ZERO
	"\u2081":"$_{1}$", // SUBSCRIPT ONE
	"\u2082":"$_{2}$", // SUBSCRIPT TWO
	"\u2083":"$_{3}$", // SUBSCRIPT THREE
	"\u2084":"$_{4}$", // SUBSCRIPT FOUR
	"\u2085":"$_{5}$", // SUBSCRIPT FIVE
	"\u2086":"$_{6}$", // SUBSCRIPT SIX
	"\u2087":"$_{7}$", // SUBSCRIPT SEVEN
	"\u2088":"$_{8}$", // SUBSCRIPT EIGHT
	"\u2089":"$_{9}$", // SUBSCRIPT NINE
	"\u208A":"$_{+}$", // SUBSCRIPT PLUS SIGN
	"\u208B":"$_{-}$", // SUBSCRIPT MINUS
	"\u208C":"$_{=}$", // SUBSCRIPT EQUALS SIGN
	"\u208D":"$_{(}$", // SUBSCRIPT LEFT PARENTHESIS
	"\u208E":"$_{)}$", // SUBSCRIPT RIGHT PARENTHESIS
	"\u20AC":"{\\texteuro}", // EURO SIGN
	"\u2100":"a/c", // ACCOUNT OF
	"\u2101":"a/s", // ADDRESSED TO THE SUBJECT
	"\u2103":"{\\textcelsius}", // DEGREE CELSIUS
	"\u2105":"c/o", // CARE OF
	"\u2106":"c/u", // CADA UNA
	"\u2109":"F", // DEGREE FAHRENHEIT
	"\u2113":"l", // SCRIPT SMALL L
	"\u2116":"{\\textnumero}", // NUMERO SIGN
	"\u2117":"{\\textcircledP}", // SOUND RECORDING COPYRIGHT
	"\u2120":"{\\textservicemark}", // SERVICE MARK
	"\u2121":"TEL", // TELEPHONE SIGN
	"\u2122":"{\\texttrademark}", // TRADE MARK SIGN
	"\u2126":"{\\textohm}", // OHM SIGN
	"\u212A":"K", // KELVIN SIGN
	"\u212B":"A", // ANGSTROM SIGN
	"\u212E":"{\\textestimated}", // ESTIMATED SYMBOL
	"\u2153":" 1/3", // VULGAR FRACTION ONE THIRD
	"\u2154":" 2/3", // VULGAR FRACTION TWO THIRDS
	"\u2155":" 1/5", // VULGAR FRACTION ONE FIFTH
	"\u2156":" 2/5", // VULGAR FRACTION TWO FIFTHS
	"\u2157":" 3/5", // VULGAR FRACTION THREE FIFTHS
	"\u2158":" 4/5", // VULGAR FRACTION FOUR FIFTHS
	"\u2159":" 1/6", // VULGAR FRACTION ONE SIXTH
	"\u215A":" 5/6", // VULGAR FRACTION FIVE SIXTHS
	"\u215B":" 1/8", // VULGAR FRACTION ONE EIGHTH
	"\u215C":" 3/8", // VULGAR FRACTION THREE EIGHTHS
	"\u215D":" 5/8", // VULGAR FRACTION FIVE EIGHTHS
	"\u215E":" 7/8", // VULGAR FRACTION SEVEN EIGHTHS
	"\u215F":" 1/", // FRACTION NUMERATOR ONE
	"\u2160":"I", // ROMAN NUMERAL ONE
	"\u2161":"II", // ROMAN NUMERAL TWO
	"\u2162":"III", // ROMAN NUMERAL THREE
	"\u2163":"IV", // ROMAN NUMERAL FOUR
	"\u2164":"V", // ROMAN NUMERAL FIVE
	"\u2165":"VI", // ROMAN NUMERAL SIX
	"\u2166":"VII", // ROMAN NUMERAL SEVEN
	"\u2167":"VIII", // ROMAN NUMERAL EIGHT
	"\u2168":"IX", // ROMAN NUMERAL NINE
	"\u2169":"X", // ROMAN NUMERAL TEN
	"\u216A":"XI", // ROMAN NUMERAL ELEVEN
	"\u216B":"XII", // ROMAN NUMERAL TWELVE
	"\u216C":"L", // ROMAN NUMERAL FIFTY
	"\u216D":"C", // ROMAN NUMERAL ONE HUNDRED
	"\u216E":"D", // ROMAN NUMERAL FIVE HUNDRED
	"\u216F":"M", // ROMAN NUMERAL ONE THOUSAND
	"\u2170":"i", // SMALL ROMAN NUMERAL ONE
	"\u2171":"ii", // SMALL ROMAN NUMERAL TWO
	"\u2172":"iii", // SMALL ROMAN NUMERAL THREE
	"\u2173":"iv", // SMALL ROMAN NUMERAL FOUR
	"\u2174":"v", // SMALL ROMAN NUMERAL FIVE
	"\u2175":"vi", // SMALL ROMAN NUMERAL SIX
	"\u2176":"vii", // SMALL ROMAN NUMERAL SEVEN
	"\u2177":"viii", // SMALL ROMAN NUMERAL EIGHT
	"\u2178":"ix", // SMALL ROMAN NUMERAL NINE
	"\u2179":"x", // SMALL ROMAN NUMERAL TEN
	"\u217A":"xi", // SMALL ROMAN NUMERAL ELEVEN
	"\u217B":"xii", // SMALL ROMAN NUMERAL TWELVE
	"\u217C":"l", // SMALL ROMAN NUMERAL FIFTY
	"\u217D":"c", // SMALL ROMAN NUMERAL ONE HUNDRED
	"\u217E":"d", // SMALL ROMAN NUMERAL FIVE HUNDRED
	"\u217F":"m", // SMALL ROMAN NUMERAL ONE THOUSAND
	"\u2190":"{\\textleftarrow}", // LEFTWARDS ARROW
	"\u2191":"{\\textuparrow}", // UPWARDS ARROW
	"\u2192":"{\\textrightarrow}", // RIGHTWARDS ARROW
	"\u2193":"{\\textdownarrow}", // DOWNWARDS ARROW
	"\u2194":"<->", // LEFT RIGHT ARROW
	"\u21D0":"<=", // LEFTWARDS DOUBLE ARROW
	"\u21D2":"=>", // RIGHTWARDS DOUBLE ARROW
	"\u21D4":"<=>", // LEFT RIGHT DOUBLE ARROW
	"\u2212":"-", // MINUS SIGN
	"\u2215":"/", // DIVISION SLASH
	"\u2216":"\\", // SET MINUS
	"\u2217":"*", // ASTERISK OPERATOR
	"\u2218":"o", // RING OPERATOR
	"\u2219":".", // BULLET OPERATOR
	"\u221E":"$\\infty$", // INFINITY
	"\u2223":"|", // DIVIDES
	"\u2225":"||", // PARALLEL TO
	"\u2236":":", // RATIO
	"\u223C":"\\~{}", // TILDE OPERATOR
	"\u2260":"/=", // NOT EQUAL TO
	"\u2261":"=", // IDENTICAL TO
	"\u2264":"<=", // LESS-THAN OR EQUAL TO
	"\u2265":">=", // GREATER-THAN OR EQUAL TO
	"\u226A":"<<", // MUCH LESS-THAN
	"\u226B":">>", // MUCH GREATER-THAN
	"\u2295":"(+)", // CIRCLED PLUS
	"\u2296":"(-)", // CIRCLED MINUS
	"\u2297":"(x)", // CIRCLED TIMES
	"\u2298":"(/)", // CIRCLED DIVISION SLASH
	"\u22A2":"|-", // RIGHT TACK
	"\u22A3":"-|", // LEFT TACK
	"\u22A6":"|-", // ASSERTION
	"\u22A7":"|=", // MODELS
	"\u22A8":"|=", // TRUE
	"\u22A9":"||-", // FORCES
	"\u22C5":".", // DOT OPERATOR
	"\u22C6":"*", // STAR OPERATOR
	"\u22D5":"$\\#$", // EQUAL AND PARALLEL TO
	"\u22D8":"<<<", // VERY MUCH LESS-THAN
	"\u22D9":">>>", // VERY MUCH GREATER-THAN
	"\u2329":"{\\textlangle}", // LEFT-POINTING ANGLE BRACKET
	"\u232A":"{\\textrangle}", // RIGHT-POINTING ANGLE BRACKET
	"\u2400":"NUL", // SYMBOL FOR NULL
	"\u2401":"SOH", // SYMBOL FOR START OF HEADING
	"\u2402":"STX", // SYMBOL FOR START OF TEXT
	"\u2403":"ETX", // SYMBOL FOR END OF TEXT
	"\u2404":"EOT", // SYMBOL FOR END OF TRANSMISSION
	"\u2405":"ENQ", // SYMBOL FOR ENQUIRY
	"\u2406":"ACK", // SYMBOL FOR ACKNOWLEDGE
	"\u2407":"BEL", // SYMBOL FOR BELL
	"\u2408":"BS", // SYMBOL FOR BACKSPACE
	"\u2409":"HT", // SYMBOL FOR HORIZONTAL TABULATION
	"\u240A":"LF", // SYMBOL FOR LINE FEED
	"\u240B":"VT", // SYMBOL FOR VERTICAL TABULATION
	"\u240C":"FF", // SYMBOL FOR FORM FEED
	"\u240D":"CR", // SYMBOL FOR CARRIAGE RETURN
	"\u240E":"SO", // SYMBOL FOR SHIFT OUT
	"\u240F":"SI", // SYMBOL FOR SHIFT IN
	"\u2410":"DLE", // SYMBOL FOR DATA LINK ESCAPE
	"\u2411":"DC1", // SYMBOL FOR DEVICE CONTROL ONE
	"\u2412":"DC2", // SYMBOL FOR DEVICE CONTROL TWO
	"\u2413":"DC3", // SYMBOL FOR DEVICE CONTROL THREE
	"\u2414":"DC4", // SYMBOL FOR DEVICE CONTROL FOUR
	"\u2415":"NAK", // SYMBOL FOR NEGATIVE ACKNOWLEDGE
	"\u2416":"SYN", // SYMBOL FOR SYNCHRONOUS IDLE
	"\u2417":"ETB", // SYMBOL FOR END OF TRANSMISSION BLOCK
	"\u2418":"CAN", // SYMBOL FOR CANCEL
	"\u2419":"EM", // SYMBOL FOR END OF MEDIUM
	"\u241A":"SUB", // SYMBOL FOR SUBSTITUTE
	"\u241B":"ESC", // SYMBOL FOR ESCAPE
	"\u241C":"FS", // SYMBOL FOR FILE SEPARATOR
	"\u241D":"GS", // SYMBOL FOR GROUP SEPARATOR
	"\u241E":"RS", // SYMBOL FOR RECORD SEPARATOR
	"\u241F":"US", // SYMBOL FOR UNIT SEPARATOR
	"\u2420":"SP", // SYMBOL FOR SPACE
	"\u2421":"DEL", // SYMBOL FOR DELETE
	"\u2423":"{\\textvisiblespace}", // OPEN BOX
	"\u2424":"NL", // SYMBOL FOR NEWLINE
	"\u2425":"///", // SYMBOL FOR DELETE FORM TWO
	"\u2426":"?", // SYMBOL FOR SUBSTITUTE FORM TWO
	"\u2460":"(1)", // CIRCLED DIGIT ONE
	"\u2461":"(2)", // CIRCLED DIGIT TWO
	"\u2462":"(3)", // CIRCLED DIGIT THREE
	"\u2463":"(4)", // CIRCLED DIGIT FOUR
	"\u2464":"(5)", // CIRCLED DIGIT FIVE
	"\u2465":"(6)", // CIRCLED DIGIT SIX
	"\u2466":"(7)", // CIRCLED DIGIT SEVEN
	"\u2467":"(8)", // CIRCLED DIGIT EIGHT
	"\u2468":"(9)", // CIRCLED DIGIT NINE
	"\u2469":"(10)", // CIRCLED NUMBER TEN
	"\u246A":"(11)", // CIRCLED NUMBER ELEVEN
	"\u246B":"(12)", // CIRCLED NUMBER TWELVE
	"\u246C":"(13)", // CIRCLED NUMBER THIRTEEN
	"\u246D":"(14)", // CIRCLED NUMBER FOURTEEN
	"\u246E":"(15)", // CIRCLED NUMBER FIFTEEN
	"\u246F":"(16)", // CIRCLED NUMBER SIXTEEN
	"\u2470":"(17)", // CIRCLED NUMBER SEVENTEEN
	"\u2471":"(18)", // CIRCLED NUMBER EIGHTEEN
	"\u2472":"(19)", // CIRCLED NUMBER NINETEEN
	"\u2473":"(20)", // CIRCLED NUMBER TWENTY
	"\u2474":"(1)", // PARENTHESIZED DIGIT ONE
	"\u2475":"(2)", // PARENTHESIZED DIGIT TWO
	"\u2476":"(3)", // PARENTHESIZED DIGIT THREE
	"\u2477":"(4)", // PARENTHESIZED DIGIT FOUR
	"\u2478":"(5)", // PARENTHESIZED DIGIT FIVE
	"\u2479":"(6)", // PARENTHESIZED DIGIT SIX
	"\u247A":"(7)", // PARENTHESIZED DIGIT SEVEN
	"\u247B":"(8)", // PARENTHESIZED DIGIT EIGHT
	"\u247C":"(9)", // PARENTHESIZED DIGIT NINE
	"\u247D":"(10)", // PARENTHESIZED NUMBER TEN
	"\u247E":"(11)", // PARENTHESIZED NUMBER ELEVEN
	"\u247F":"(12)", // PARENTHESIZED NUMBER TWELVE
	"\u2480":"(13)", // PARENTHESIZED NUMBER THIRTEEN
	"\u2481":"(14)", // PARENTHESIZED NUMBER FOURTEEN
	"\u2482":"(15)", // PARENTHESIZED NUMBER FIFTEEN
	"\u2483":"(16)", // PARENTHESIZED NUMBER SIXTEEN
	"\u2484":"(17)", // PARENTHESIZED NUMBER SEVENTEEN
	"\u2485":"(18)", // PARENTHESIZED NUMBER EIGHTEEN
	"\u2486":"(19)", // PARENTHESIZED NUMBER NINETEEN
	"\u2487":"(20)", // PARENTHESIZED NUMBER TWENTY
	"\u2488":"1.", // DIGIT ONE FULL STOP
	"\u2489":"2.", // DIGIT TWO FULL STOP
	"\u248A":"3.", // DIGIT THREE FULL STOP
	"\u248B":"4.", // DIGIT FOUR FULL STOP
	"\u248C":"5.", // DIGIT FIVE FULL STOP
	"\u248D":"6.", // DIGIT SIX FULL STOP
	"\u248E":"7.", // DIGIT SEVEN FULL STOP
	"\u248F":"8.", // DIGIT EIGHT FULL STOP
	"\u2490":"9.", // DIGIT NINE FULL STOP
	"\u2491":"10.", // NUMBER TEN FULL STOP
	"\u2492":"11.", // NUMBER ELEVEN FULL STOP
	"\u2493":"12.", // NUMBER TWELVE FULL STOP
	"\u2494":"13.", // NUMBER THIRTEEN FULL STOP
	"\u2495":"14.", // NUMBER FOURTEEN FULL STOP
	"\u2496":"15.", // NUMBER FIFTEEN FULL STOP
	"\u2497":"16.", // NUMBER SIXTEEN FULL STOP
	"\u2498":"17.", // NUMBER SEVENTEEN FULL STOP
	"\u2499":"18.", // NUMBER EIGHTEEN FULL STOP
	"\u249A":"19.", // NUMBER NINETEEN FULL STOP
	"\u249B":"20.", // NUMBER TWENTY FULL STOP
	"\u249C":"(a)", // PARENTHESIZED LATIN SMALL LETTER A
	"\u249D":"(b)", // PARENTHESIZED LATIN SMALL LETTER B
	"\u249E":"(c)", // PARENTHESIZED LATIN SMALL LETTER C
	"\u249F":"(d)", // PARENTHESIZED LATIN SMALL LETTER D
	"\u24A0":"(e)", // PARENTHESIZED LATIN SMALL LETTER E
	"\u24A1":"(f)", // PARENTHESIZED LATIN SMALL LETTER F
	"\u24A2":"(g)", // PARENTHESIZED LATIN SMALL LETTER G
	"\u24A3":"(h)", // PARENTHESIZED LATIN SMALL LETTER H
	"\u24A4":"(i)", // PARENTHESIZED LATIN SMALL LETTER I
	"\u24A5":"(j)", // PARENTHESIZED LATIN SMALL LETTER J
	"\u24A6":"(k)", // PARENTHESIZED LATIN SMALL LETTER K
	"\u24A7":"(l)", // PARENTHESIZED LATIN SMALL LETTER L
	"\u24A8":"(m)", // PARENTHESIZED LATIN SMALL LETTER M
	"\u24A9":"(n)", // PARENTHESIZED LATIN SMALL LETTER N
	"\u24AA":"(o)", // PARENTHESIZED LATIN SMALL LETTER O
	"\u24AB":"(p)", // PARENTHESIZED LATIN SMALL LETTER P
	"\u24AC":"(q)", // PARENTHESIZED LATIN SMALL LETTER Q
	"\u24AD":"(r)", // PARENTHESIZED LATIN SMALL LETTER R
	"\u24AE":"(s)", // PARENTHESIZED LATIN SMALL LETTER S
	"\u24AF":"(t)", // PARENTHESIZED LATIN SMALL LETTER T
	"\u24B0":"(u)", // PARENTHESIZED LATIN SMALL LETTER U
	"\u24B1":"(v)", // PARENTHESIZED LATIN SMALL LETTER V
	"\u24B2":"(w)", // PARENTHESIZED LATIN SMALL LETTER W
	"\u24B3":"(x)", // PARENTHESIZED LATIN SMALL LETTER X
	"\u24B4":"(y)", // PARENTHESIZED LATIN SMALL LETTER Y
	"\u24B5":"(z)", // PARENTHESIZED LATIN SMALL LETTER Z
	"\u24B6":"(A)", // CIRCLED LATIN CAPITAL LETTER A
	"\u24B7":"(B)", // CIRCLED LATIN CAPITAL LETTER B
	"\u24B8":"(C)", // CIRCLED LATIN CAPITAL LETTER C
	"\u24B9":"(D)", // CIRCLED LATIN CAPITAL LETTER D
	"\u24BA":"(E)", // CIRCLED LATIN CAPITAL LETTER E
	"\u24BB":"(F)", // CIRCLED LATIN CAPITAL LETTER F
	"\u24BC":"(G)", // CIRCLED LATIN CAPITAL LETTER G
	"\u24BD":"(H)", // CIRCLED LATIN CAPITAL LETTER H
	"\u24BE":"(I)", // CIRCLED LATIN CAPITAL LETTER I
	"\u24BF":"(J)", // CIRCLED LATIN CAPITAL LETTER J
	"\u24C0":"(K)", // CIRCLED LATIN CAPITAL LETTER K
	"\u24C1":"(L)", // CIRCLED LATIN CAPITAL LETTER L
	"\u24C2":"(M)", // CIRCLED LATIN CAPITAL LETTER M
	"\u24C3":"(N)", // CIRCLED LATIN CAPITAL LETTER N
	"\u24C4":"(O)", // CIRCLED LATIN CAPITAL LETTER O
	"\u24C5":"(P)", // CIRCLED LATIN CAPITAL LETTER P
	"\u24C6":"(Q)", // CIRCLED LATIN CAPITAL LETTER Q
	"\u24C7":"(R)", // CIRCLED LATIN CAPITAL LETTER R
	"\u24C8":"(S)", // CIRCLED LATIN CAPITAL LETTER S
	"\u24C9":"(T)", // CIRCLED LATIN CAPITAL LETTER T
	"\u24CA":"(U)", // CIRCLED LATIN CAPITAL LETTER U
	"\u24CB":"(V)", // CIRCLED LATIN CAPITAL LETTER V
	"\u24CC":"(W)", // CIRCLED LATIN CAPITAL LETTER W
	"\u24CD":"(X)", // CIRCLED LATIN CAPITAL LETTER X
	"\u24CE":"(Y)", // CIRCLED LATIN CAPITAL LETTER Y
	"\u24CF":"(Z)", // CIRCLED LATIN CAPITAL LETTER Z
	"\u24D0":"(a)", // CIRCLED LATIN SMALL LETTER A
	"\u24D1":"(b)", // CIRCLED LATIN SMALL LETTER B
	"\u24D2":"(c)", // CIRCLED LATIN SMALL LETTER C
	"\u24D3":"(d)", // CIRCLED LATIN SMALL LETTER D
	"\u24D4":"(e)", // CIRCLED LATIN SMALL LETTER E
	"\u24D5":"(f)", // CIRCLED LATIN SMALL LETTER F
	"\u24D6":"(g)", // CIRCLED LATIN SMALL LETTER G
	"\u24D7":"(h)", // CIRCLED LATIN SMALL LETTER H
	"\u24D8":"(i)", // CIRCLED LATIN SMALL LETTER I
	"\u24D9":"(j)", // CIRCLED LATIN SMALL LETTER J
	"\u24DA":"(k)", // CIRCLED LATIN SMALL LETTER K
	"\u24DB":"(l)", // CIRCLED LATIN SMALL LETTER L
	"\u24DC":"(m)", // CIRCLED LATIN SMALL LETTER M
	"\u24DD":"(n)", // CIRCLED LATIN SMALL LETTER N
	"\u24DE":"(o)", // CIRCLED LATIN SMALL LETTER O
	"\u24DF":"(p)", // CIRCLED LATIN SMALL LETTER P
	"\u24E0":"(q)", // CIRCLED LATIN SMALL LETTER Q
	"\u24E1":"(r)", // CIRCLED LATIN SMALL LETTER R
	"\u24E2":"(s)", // CIRCLED LATIN SMALL LETTER S
	"\u24E3":"(t)", // CIRCLED LATIN SMALL LETTER T
	"\u24E4":"(u)", // CIRCLED LATIN SMALL LETTER U
	"\u24E5":"(v)", // CIRCLED LATIN SMALL LETTER V
	"\u24E6":"(w)", // CIRCLED LATIN SMALL LETTER W
	"\u24E7":"(x)", // CIRCLED LATIN SMALL LETTER X
	"\u24E8":"(y)", // CIRCLED LATIN SMALL LETTER Y
	"\u24E9":"(z)", // CIRCLED LATIN SMALL LETTER Z
	"\u24EA":"(0)", // CIRCLED DIGIT ZERO
	"\u2500":"-", // BOX DRAWINGS LIGHT HORIZONTAL
	"\u2501":"=", // BOX DRAWINGS HEAVY HORIZONTAL
	"\u2502":"|", // BOX DRAWINGS LIGHT VERTICAL
	"\u2503":"|", // BOX DRAWINGS HEAVY VERTICAL
	"\u2504":"-", // BOX DRAWINGS LIGHT TRIPLE DASH HORIZONTAL
	"\u2505":"=", // BOX DRAWINGS HEAVY TRIPLE DASH HORIZONTAL
	"\u2506":"|", // BOX DRAWINGS LIGHT TRIPLE DASH VERTICAL
	"\u2507":"|", // BOX DRAWINGS HEAVY TRIPLE DASH VERTICAL
	"\u2508":"-", // BOX DRAWINGS LIGHT QUADRUPLE DASH HORIZONTAL
	"\u2509":"=", // BOX DRAWINGS HEAVY QUADRUPLE DASH HORIZONTAL
	"\u250A":"|", // BOX DRAWINGS LIGHT QUADRUPLE DASH VERTICAL
	"\u250B":"|", // BOX DRAWINGS HEAVY QUADRUPLE DASH VERTICAL
	"\u250C":"+", // BOX DRAWINGS LIGHT DOWN AND RIGHT
	"\u250D":"+", // BOX DRAWINGS DOWN LIGHT AND RIGHT HEAVY
	"\u250E":"+", // BOX DRAWINGS DOWN HEAVY AND RIGHT LIGHT
	"\u250F":"+", // BOX DRAWINGS HEAVY DOWN AND RIGHT
	"\u2510":"+", // BOX DRAWINGS LIGHT DOWN AND LEFT
	"\u2511":"+", // BOX DRAWINGS DOWN LIGHT AND LEFT HEAVY
	"\u2512":"+", // BOX DRAWINGS DOWN HEAVY AND LEFT LIGHT
	"\u2513":"+", // BOX DRAWINGS HEAVY DOWN AND LEFT
	"\u2514":"+", // BOX DRAWINGS LIGHT UP AND RIGHT
	"\u2515":"+", // BOX DRAWINGS UP LIGHT AND RIGHT HEAVY
	"\u2516":"+", // BOX DRAWINGS UP HEAVY AND RIGHT LIGHT
	"\u2517":"+", // BOX DRAWINGS HEAVY UP AND RIGHT
	"\u2518":"+", // BOX DRAWINGS LIGHT UP AND LEFT
	"\u2519":"+", // BOX DRAWINGS UP LIGHT AND LEFT HEAVY
	"\u251A":"+", // BOX DRAWINGS UP HEAVY AND LEFT LIGHT
	"\u251B":"+", // BOX DRAWINGS HEAVY UP AND LEFT
	"\u251C":"+", // BOX DRAWINGS LIGHT VERTICAL AND RIGHT
	"\u251D":"+", // BOX DRAWINGS VERTICAL LIGHT AND RIGHT HEAVY
	"\u251E":"+", // BOX DRAWINGS UP HEAVY AND RIGHT DOWN LIGHT
	"\u251F":"+", // BOX DRAWINGS DOWN HEAVY AND RIGHT UP LIGHT
	"\u2520":"+", // BOX DRAWINGS VERTICAL HEAVY AND RIGHT LIGHT
	"\u2521":"+", // BOX DRAWINGS DOWN LIGHT AND RIGHT UP HEAVY
	"\u2522":"+", // BOX DRAWINGS UP LIGHT AND RIGHT DOWN HEAVY
	"\u2523":"+", // BOX DRAWINGS HEAVY VERTICAL AND RIGHT
	"\u2524":"+", // BOX DRAWINGS LIGHT VERTICAL AND LEFT
	"\u2525":"+", // BOX DRAWINGS VERTICAL LIGHT AND LEFT HEAVY
	"\u2526":"+", // BOX DRAWINGS UP HEAVY AND LEFT DOWN LIGHT
	"\u2527":"+", // BOX DRAWINGS DOWN HEAVY AND LEFT UP LIGHT
	"\u2528":"+", // BOX DRAWINGS VERTICAL HEAVY AND LEFT LIGHT
	"\u2529":"+", // BOX DRAWINGS DOWN LIGHT AND LEFT UP HEAVY
	"\u252A":"+", // BOX DRAWINGS UP LIGHT AND LEFT DOWN HEAVY
	"\u252B":"+", // BOX DRAWINGS HEAVY VERTICAL AND LEFT
	"\u252C":"+", // BOX DRAWINGS LIGHT DOWN AND HORIZONTAL
	"\u252D":"+", // BOX DRAWINGS LEFT HEAVY AND RIGHT DOWN LIGHT
	"\u252E":"+", // BOX DRAWINGS RIGHT HEAVY AND LEFT DOWN LIGHT
	"\u252F":"+", // BOX DRAWINGS DOWN LIGHT AND HORIZONTAL HEAVY
	"\u2530":"+", // BOX DRAWINGS DOWN HEAVY AND HORIZONTAL LIGHT
	"\u2531":"+", // BOX DRAWINGS RIGHT LIGHT AND LEFT DOWN HEAVY
	"\u2532":"+", // BOX DRAWINGS LEFT LIGHT AND RIGHT DOWN HEAVY
	"\u2533":"+", // BOX DRAWINGS HEAVY DOWN AND HORIZONTAL
	"\u2534":"+", // BOX DRAWINGS LIGHT UP AND HORIZONTAL
	"\u2535":"+", // BOX DRAWINGS LEFT HEAVY AND RIGHT UP LIGHT
	"\u2536":"+", // BOX DRAWINGS RIGHT HEAVY AND LEFT UP LIGHT
	"\u2537":"+", // BOX DRAWINGS UP LIGHT AND HORIZONTAL HEAVY
	"\u2538":"+", // BOX DRAWINGS UP HEAVY AND HORIZONTAL LIGHT
	"\u2539":"+", // BOX DRAWINGS RIGHT LIGHT AND LEFT UP HEAVY
	"\u253A":"+", // BOX DRAWINGS LEFT LIGHT AND RIGHT UP HEAVY
	"\u253B":"+", // BOX DRAWINGS HEAVY UP AND HORIZONTAL
	"\u253C":"+", // BOX DRAWINGS LIGHT VERTICAL AND HORIZONTAL
	"\u253D":"+", // BOX DRAWINGS LEFT HEAVY AND RIGHT VERTICAL LIGHT
	"\u253E":"+", // BOX DRAWINGS RIGHT HEAVY AND LEFT VERTICAL LIGHT
	"\u253F":"+", // BOX DRAWINGS VERTICAL LIGHT AND HORIZONTAL HEAVY
	"\u2540":"+", // BOX DRAWINGS UP HEAVY AND DOWN HORIZONTAL LIGHT
	"\u2541":"+", // BOX DRAWINGS DOWN HEAVY AND UP HORIZONTAL LIGHT
	"\u2542":"+", // BOX DRAWINGS VERTICAL HEAVY AND HORIZONTAL LIGHT
	"\u2543":"+", // BOX DRAWINGS LEFT UP HEAVY AND RIGHT DOWN LIGHT
	"\u2544":"+", // BOX DRAWINGS RIGHT UP HEAVY AND LEFT DOWN LIGHT
	"\u2545":"+", // BOX DRAWINGS LEFT DOWN HEAVY AND RIGHT UP LIGHT
	"\u2546":"+", // BOX DRAWINGS RIGHT DOWN HEAVY AND LEFT UP LIGHT
	"\u2547":"+", // BOX DRAWINGS DOWN LIGHT AND UP HORIZONTAL HEAVY
	"\u2548":"+", // BOX DRAWINGS UP LIGHT AND DOWN HORIZONTAL HEAVY
	"\u2549":"+", // BOX DRAWINGS RIGHT LIGHT AND LEFT VERTICAL HEAVY
	"\u254A":"+", // BOX DRAWINGS LEFT LIGHT AND RIGHT VERTICAL HEAVY
	"\u254B":"+", // BOX DRAWINGS HEAVY VERTICAL AND HORIZONTAL
	"\u254C":"-", // BOX DRAWINGS LIGHT DOUBLE DASH HORIZONTAL
	"\u254D":"=", // BOX DRAWINGS HEAVY DOUBLE DASH HORIZONTAL
	"\u254E":"|", // BOX DRAWINGS LIGHT DOUBLE DASH VERTICAL
	"\u254F":"|", // BOX DRAWINGS HEAVY DOUBLE DASH VERTICAL
	"\u2550":"=", // BOX DRAWINGS DOUBLE HORIZONTAL
	"\u2551":"|", // BOX DRAWINGS DOUBLE VERTICAL
	"\u2552":"+", // BOX DRAWINGS DOWN SINGLE AND RIGHT DOUBLE
	"\u2553":"+", // BOX DRAWINGS DOWN DOUBLE AND RIGHT SINGLE
	"\u2554":"+", // BOX DRAWINGS DOUBLE DOWN AND RIGHT
	"\u2555":"+", // BOX DRAWINGS DOWN SINGLE AND LEFT DOUBLE
	"\u2556":"+", // BOX DRAWINGS DOWN DOUBLE AND LEFT SINGLE
	"\u2557":"+", // BOX DRAWINGS DOUBLE DOWN AND LEFT
	"\u2558":"+", // BOX DRAWINGS UP SINGLE AND RIGHT DOUBLE
	"\u2559":"+", // BOX DRAWINGS UP DOUBLE AND RIGHT SINGLE
	"\u255A":"+", // BOX DRAWINGS DOUBLE UP AND RIGHT
	"\u255B":"+", // BOX DRAWINGS UP SINGLE AND LEFT DOUBLE
	"\u255C":"+", // BOX DRAWINGS UP DOUBLE AND LEFT SINGLE
	"\u255D":"+", // BOX DRAWINGS DOUBLE UP AND LEFT
	"\u255E":"+", // BOX DRAWINGS VERTICAL SINGLE AND RIGHT DOUBLE
	"\u255F":"+", // BOX DRAWINGS VERTICAL DOUBLE AND RIGHT SINGLE
	"\u2560":"+", // BOX DRAWINGS DOUBLE VERTICAL AND RIGHT
	"\u2561":"+", // BOX DRAWINGS VERTICAL SINGLE AND LEFT DOUBLE
	"\u2562":"+", // BOX DRAWINGS VERTICAL DOUBLE AND LEFT SINGLE
	"\u2563":"+", // BOX DRAWINGS DOUBLE VERTICAL AND LEFT
	"\u2564":"+", // BOX DRAWINGS DOWN SINGLE AND HORIZONTAL DOUBLE
	"\u2565":"+", // BOX DRAWINGS DOWN DOUBLE AND HORIZONTAL SINGLE
	"\u2566":"+", // BOX DRAWINGS DOUBLE DOWN AND HORIZONTAL
	"\u2567":"+", // BOX DRAWINGS UP SINGLE AND HORIZONTAL DOUBLE
	"\u2568":"+", // BOX DRAWINGS UP DOUBLE AND HORIZONTAL SINGLE
	"\u2569":"+", // BOX DRAWINGS DOUBLE UP AND HORIZONTAL
	"\u256A":"+", // BOX DRAWINGS VERTICAL SINGLE AND HORIZONTAL DOUBLE
	"\u256B":"+", // BOX DRAWINGS VERTICAL DOUBLE AND HORIZONTAL SINGLE
	"\u256C":"+", // BOX DRAWINGS DOUBLE VERTICAL AND HORIZONTAL
	"\u256D":"+", // BOX DRAWINGS LIGHT ARC DOWN AND RIGHT
	"\u256E":"+", // BOX DRAWINGS LIGHT ARC DOWN AND LEFT
	"\u256F":"+", // BOX DRAWINGS LIGHT ARC UP AND LEFT
	"\u2570":"+", // BOX DRAWINGS LIGHT ARC UP AND RIGHT
	"\u2571":"/", // BOX DRAWINGS LIGHT DIAGONAL UPPER RIGHT TO LOWER LEFT
	"\u2572":"\\", // BOX DRAWINGS LIGHT DIAGONAL UPPER LEFT TO LOWER RIGHT
	"\u2573":"X", // BOX DRAWINGS LIGHT DIAGONAL CROSS
	"\u257C":"-", // BOX DRAWINGS LIGHT LEFT AND HEAVY RIGHT
	"\u257D":"|", // BOX DRAWINGS LIGHT UP AND HEAVY DOWN
	"\u257E":"-", // BOX DRAWINGS HEAVY LEFT AND LIGHT RIGHT
	"\u257F":"|", // BOX DRAWINGS HEAVY UP AND LIGHT DOWN
	"\u25CB":"o", // WHITE CIRCLE
	"\u25E6":"{\\textopenbullet}", // WHITE BULLET
	"\u2605":"*", // BLACK STAR
	"\u2606":"*", // WHITE STAR
	"\u2612":"X", // BALLOT BOX WITH X
	"\u2613":"X", // SALTIRE
	"\u2639":":-(", // WHITE FROWNING FACE
	"\u263A":":-)", // WHITE SMILING FACE
	"\u263B":"(-:", // BLACK SMILING FACE
	"\u266D":"b", // MUSIC FLAT SIGN
	"\u266F":"$\\#$", // MUSIC SHARP SIGN
	"\u2701":"$\\%<$", // UPPER BLADE SCISSORS
	"\u2702":"$\\%<$", // BLACK SCISSORS
	"\u2703":"$\\%<$", // LOWER BLADE SCISSORS
	"\u2704":"$\\%<$", // WHITE SCISSORS
	"\u270C":"V", // VICTORY HAND
	"\u2713":"v", // CHECK MARK
	"\u2714":"V", // HEAVY CHECK MARK
	"\u2715":"x", // MULTIPLICATION X
	"\u2716":"x", // HEAVY MULTIPLICATION X
	"\u2717":"X", // BALLOT X
	"\u2718":"X", // HEAVY BALLOT X
	"\u2719":"+", // OUTLINED GREEK CROSS
	"\u271A":"+", // HEAVY GREEK CROSS
	"\u271B":"+", // OPEN CENTRE CROSS
	"\u271C":"+", // HEAVY OPEN CENTRE CROSS
	"\u271D":"+", // LATIN CROSS
	"\u271E":"+", // SHADOWED WHITE LATIN CROSS
	"\u271F":"+", // OUTLINED LATIN CROSS
	"\u2720":"+", // MALTESE CROSS
	"\u2721":"*", // STAR OF DAVID
	"\u2722":"+", // FOUR TEARDROP-SPOKED ASTERISK
	"\u2723":"+", // FOUR BALLOON-SPOKED ASTERISK
	"\u2724":"+", // HEAVY FOUR BALLOON-SPOKED ASTERISK
	"\u2725":"+", // FOUR CLUB-SPOKED ASTERISK
	"\u2726":"+", // BLACK FOUR POINTED STAR
	"\u2727":"+", // WHITE FOUR POINTED STAR
	"\u2729":"*", // STRESS OUTLINED WHITE STAR
	"\u272A":"*", // CIRCLED WHITE STAR
	"\u272B":"*", // OPEN CENTRE BLACK STAR
	"\u272C":"*", // BLACK CENTRE WHITE STAR
	"\u272D":"*", // OUTLINED BLACK STAR
	"\u272E":"*", // HEAVY OUTLINED BLACK STAR
	"\u272F":"*", // PINWHEEL STAR
	"\u2730":"*", // SHADOWED WHITE STAR
	"\u2731":"*", // HEAVY ASTERISK
	"\u2732":"*", // OPEN CENTRE ASTERISK
	"\u2733":"*", // EIGHT SPOKED ASTERISK
	"\u2734":"*", // EIGHT POINTED BLACK STAR
	"\u2735":"*", // EIGHT POINTED PINWHEEL STAR
	"\u2736":"*", // SIX POINTED BLACK STAR
	"\u2737":"*", // EIGHT POINTED RECTILINEAR BLACK STAR
	"\u2738":"*", // HEAVY EIGHT POINTED RECTILINEAR BLACK STAR
	"\u2739":"*", // TWELVE POINTED BLACK STAR
	"\u273A":"*", // SIXTEEN POINTED ASTERISK
	"\u273B":"*", // TEARDROP-SPOKED ASTERISK
	"\u273C":"*", // OPEN CENTRE TEARDROP-SPOKED ASTERISK
	"\u273D":"*", // HEAVY TEARDROP-SPOKED ASTERISK
	"\u273E":"*", // SIX PETALLED BLACK AND WHITE FLORETTE
	"\u273F":"*", // BLACK FLORETTE
	"\u2740":"*", // WHITE FLORETTE
	"\u2741":"*", // EIGHT PETALLED OUTLINED BLACK FLORETTE
	"\u2742":"*", // CIRCLED OPEN CENTRE EIGHT POINTED STAR
	"\u2743":"*", // HEAVY TEARDROP-SPOKED PINWHEEL ASTERISK
	"\u2744":"*", // SNOWFLAKE
	"\u2745":"*", // TIGHT TRIFOLIATE SNOWFLAKE
	"\u2746":"*", // HEAVY CHEVRON SNOWFLAKE
	"\u2747":"*", // SPARKLE
	"\u2748":"*", // HEAVY SPARKLE
	"\u2749":"*", // BALLOON-SPOKED ASTERISK
	"\u274A":"*", // EIGHT TEARDROP-SPOKED PROPELLER ASTERISK
	"\u274B":"*", // HEAVY EIGHT TEARDROP-SPOKED PROPELLER ASTERISK
	"\uFB00":"ff", // LATIN SMALL LIGATURE FF
	"\uFB01":"fi", // LATIN SMALL LIGATURE FI
	"\uFB02":"fl", // LATIN SMALL LIGATURE FL
	"\uFB03":"ffi", // LATIN SMALL LIGATURE FFI
	"\uFB04":"ffl", // LATIN SMALL LIGATURE FFL
	"\uFB05":"st", // LATIN SMALL LIGATURE LONG S T
	"\uFB06":"st", // LATIN SMALL LIGATURE ST
/* Derived accented characters */

/* These two require the "semtrans" package to work; uncomment to enable */
/*	"\u02BF":"\{\\Ayn}", // MGR Ayn
	"\u02BE":"\{\\Alif}", // MGR Alif/Hamza 
*/
	"\u00C0":"{\\`A}", // LATIN CAPITAL LETTER A WITH GRAVE
	"\u00C1":"{\\'A}", // LATIN CAPITAL LETTER A WITH ACUTE
	"\u00C2":"{\\^A}", // LATIN CAPITAL LETTER A WITH CIRCUMFLEX
	"\u00C3":"{\\~A}", // LATIN CAPITAL LETTER A WITH TILDE
	"\u00C4":"{\\\"A}", // LATIN CAPITAL LETTER A WITH DIAERESIS
	"\u00C5":"{\\r A}", // LATIN CAPITAL LETTER A WITH RING ABOVE
	"\u00C7":"{\\c C}", // LATIN CAPITAL LETTER C WITH CEDILLA
	"\u00C8":"{\\`E}", // LATIN CAPITAL LETTER E WITH GRAVE
	"\u00C9":"{\\'E}", // LATIN CAPITAL LETTER E WITH ACUTE
	"\u00CA":"{\\^E}", // LATIN CAPITAL LETTER E WITH CIRCUMFLEX
	"\u00CB":"{\\\"E}", // LATIN CAPITAL LETTER E WITH DIAERESIS
	"\u00CC":"{\\`I}", // LATIN CAPITAL LETTER I WITH GRAVE
	"\u00CD":"{\\'I}", // LATIN CAPITAL LETTER I WITH ACUTE
	"\u00CE":"{\\^I}", // LATIN CAPITAL LETTER I WITH CIRCUMFLEX
	"\u00CF":"{\\\"I}", // LATIN CAPITAL LETTER I WITH DIAERESIS
	"\u00D1":"{\\~N}", // LATIN CAPITAL LETTER N WITH TILDE
	"\u00D2":"{\\`O}", // LATIN CAPITAL LETTER O WITH GRAVE
	"\u00D3":"{\\'O}", // LATIN CAPITAL LETTER O WITH ACUTE
	"\u00D4":"{\\^O}", // LATIN CAPITAL LETTER O WITH CIRCUMFLEX
	"\u00D5":"{\\~O}", // LATIN CAPITAL LETTER O WITH TILDE
	"\u00D6":"{\\\"O}", // LATIN CAPITAL LETTER O WITH DIAERESIS
	"\u00D9":"{\\`U}", // LATIN CAPITAL LETTER U WITH GRAVE
	"\u00DA":"{\\'U}", // LATIN CAPITAL LETTER U WITH ACUTE
	"\u00DB":"{\\^U}", // LATIN CAPITAL LETTER U WITH CIRCUMFLEX
	"\u00DC":"{\\\"U}", // LATIN CAPITAL LETTER U WITH DIAERESIS
	"\u00DD":"{\\'Y}", // LATIN CAPITAL LETTER Y WITH ACUTE
	"\u00E0":"{\\`a}", // LATIN SMALL LETTER A WITH GRAVE
	"\u00E1":"{\\'a}", // LATIN SMALL LETTER A WITH ACUTE
	"\u00E2":"{\\^a}", // LATIN SMALL LETTER A WITH CIRCUMFLEX
	"\u00E3":"{\\~a}", // LATIN SMALL LETTER A WITH TILDE
	"\u00E4":"{\\\"a}", // LATIN SMALL LETTER A WITH DIAERESIS
	"\u00E5":"{\\r a}", // LATIN SMALL LETTER A WITH RING ABOVE
	"\u00E7":"{\\c c}", // LATIN SMALL LETTER C WITH CEDILLA
	"\u00E8":"{\\`e}", // LATIN SMALL LETTER E WITH GRAVE
	"\u00E9":"{\\'e}", // LATIN SMALL LETTER E WITH ACUTE
	"\u00EA":"{\\^e}", // LATIN SMALL LETTER E WITH CIRCUMFLEX
	"\u00EB":"{\\\"e}", // LATIN SMALL LETTER E WITH DIAERESIS
	"\u00EC":"{\\`i}", // LATIN SMALL LETTER I WITH GRAVE
	"\u00ED":"{\\'i}", // LATIN SMALL LETTER I WITH ACUTE
	"\u00EE":"{\\^i}", // LATIN SMALL LETTER I WITH CIRCUMFLEX
	"\u00EF":"{\\\"i}", // LATIN SMALL LETTER I WITH DIAERESIS
	"\u00F1":"{\\~n}", // LATIN SMALL LETTER N WITH TILDE
	"\u00F2":"{\\`o}", // LATIN SMALL LETTER O WITH GRAVE
	"\u00F3":"{\\'o}", // LATIN SMALL LETTER O WITH ACUTE
	"\u00F4":"{\\^o}", // LATIN SMALL LETTER O WITH CIRCUMFLEX
	"\u00F5":"{\\~o}", // LATIN SMALL LETTER O WITH TILDE
	"\u00F6":"{\\\"o}", // LATIN SMALL LETTER O WITH DIAERESIS
	"\u00F9":"{\\`u}", // LATIN SMALL LETTER U WITH GRAVE
	"\u00FA":"{\\'u}", // LATIN SMALL LETTER U WITH ACUTE
	"\u00FB":"{\\^u}", // LATIN SMALL LETTER U WITH CIRCUMFLEX
	"\u00FC":"{\\\"u}", // LATIN SMALL LETTER U WITH DIAERESIS
	"\u00FD":"{\\'y}", // LATIN SMALL LETTER Y WITH ACUTE
	"\u00FF":"{\\\"y}", // LATIN SMALL LETTER Y WITH DIAERESIS
	"\u0100":"{\\=A}", // LATIN CAPITAL LETTER A WITH MACRON
	"\u0101":"{\\=a}", // LATIN SMALL LETTER A WITH MACRON
	"\u0102":"{\\u A}", // LATIN CAPITAL LETTER A WITH BREVE
	"\u0103":"{\\u a}", // LATIN SMALL LETTER A WITH BREVE
	"\u0104":"{\\k A}", // LATIN CAPITAL LETTER A WITH OGONEK
	"\u0105":"{\\k a}", // LATIN SMALL LETTER A WITH OGONEK
	"\u0106":"{\\'C}", // LATIN CAPITAL LETTER C WITH ACUTE
	"\u0107":"{\\'c}", // LATIN SMALL LETTER C WITH ACUTE
	"\u0108":"{\\^C}", // LATIN CAPITAL LETTER C WITH CIRCUMFLEX
	"\u0109":"{\\^c}", // LATIN SMALL LETTER C WITH CIRCUMFLEX
	"\u010A":"{\\.C}", // LATIN CAPITAL LETTER C WITH DOT ABOVE
	"\u010B":"{\\.c}", // LATIN SMALL LETTER C WITH DOT ABOVE
	"\u010C":"{\\v C}", // LATIN CAPITAL LETTER C WITH CARON
	"\u010D":"{\\v c}", // LATIN SMALL LETTER C WITH CARON
	"\u010E":"{\\v D}", // LATIN CAPITAL LETTER D WITH CARON
	"\u010F":"{\\v d}", // LATIN SMALL LETTER D WITH CARON
	"\u0112":"{\\=E}", // LATIN CAPITAL LETTER E WITH MACRON
	"\u0113":"{\\=e}", // LATIN SMALL LETTER E WITH MACRON
	"\u0114":"{\\u E}", // LATIN CAPITAL LETTER E WITH BREVE
	"\u0115":"{\\u e}", // LATIN SMALL LETTER E WITH BREVE
	"\u0116":"{\\.E}", // LATIN CAPITAL LETTER E WITH DOT ABOVE
	"\u0117":"{\\.e}", // LATIN SMALL LETTER E WITH DOT ABOVE
	"\u0118":"{\\k E}", // LATIN CAPITAL LETTER E WITH OGONEK
	"\u0119":"{\\k e}", // LATIN SMALL LETTER E WITH OGONEK
	"\u011A":"{\\v E}", // LATIN CAPITAL LETTER E WITH CARON
	"\u011B":"{\\v e}", // LATIN SMALL LETTER E WITH CARON
	"\u011C":"{\\^G}", // LATIN CAPITAL LETTER G WITH CIRCUMFLEX
	"\u011D":"{\\^g}", // LATIN SMALL LETTER G WITH CIRCUMFLEX
	"\u011E":"{\\u G}", // LATIN CAPITAL LETTER G WITH BREVE
	"\u011F":"{\\u g}", // LATIN SMALL LETTER G WITH BREVE
	"\u0120":"{\\.G}", // LATIN CAPITAL LETTER G WITH DOT ABOVE
	"\u0121":"{\\.g}", // LATIN SMALL LETTER G WITH DOT ABOVE
	"\u0122":"{\\c G}", // LATIN CAPITAL LETTER G WITH CEDILLA
	"\u0123":"{\\c g}", // LATIN SMALL LETTER G WITH CEDILLA
	"\u0124":"{\\^H}", // LATIN CAPITAL LETTER H WITH CIRCUMFLEX
	"\u0125":"{\\^h}", // LATIN SMALL LETTER H WITH CIRCUMFLEX
	"\u0128":"{\\~I}", // LATIN CAPITAL LETTER I WITH TILDE
	"\u0129":"{\\~i}", // LATIN SMALL LETTER I WITH TILDE
	"\u012A":"{\\=I}", // LATIN CAPITAL LETTER I WITH MACRON
	"\u012B":"{\\=\\i}", // LATIN SMALL LETTER I WITH MACRON
	"\u012C":"{\\u I}", // LATIN CAPITAL LETTER I WITH BREVE
	"\u012D":"{\\u i}", // LATIN SMALL LETTER I WITH BREVE
	"\u012E":"{\\k I}", // LATIN CAPITAL LETTER I WITH OGONEK
	"\u012F":"{\\k i}", // LATIN SMALL LETTER I WITH OGONEK
	"\u0130":"{\\.I}", // LATIN CAPITAL LETTER I WITH DOT ABOVE
	"\u0134":"{\\^J}", // LATIN CAPITAL LETTER J WITH CIRCUMFLEX
	"\u0135":"{\\^j}", // LATIN SMALL LETTER J WITH CIRCUMFLEX
	"\u0136":"{\\c K}", // LATIN CAPITAL LETTER K WITH CEDILLA
	"\u0137":"{\\c k}", // LATIN SMALL LETTER K WITH CEDILLA
	"\u0139":"{\\'L}", // LATIN CAPITAL LETTER L WITH ACUTE
	"\u013A":"{\\'l}", // LATIN SMALL LETTER L WITH ACUTE
	"\u013B":"{\\c L}", // LATIN CAPITAL LETTER L WITH CEDILLA
	"\u013C":"{\\c l}", // LATIN SMALL LETTER L WITH CEDILLA
	"\u013D":"{\\v L}", // LATIN CAPITAL LETTER L WITH CARON
	"\u013E":"{\\v l}", // LATIN SMALL LETTER L WITH CARON
	"\u0141":"{\\L }", //LATIN CAPITAL LETTER L WITH STROKE
	"\u0142":"{\\l }", //LATIN SMALL LETTER L WITH STROKE
	"\u0143":"{\\'N}", // LATIN CAPITAL LETTER N WITH ACUTE
	"\u0144":"{\\'n}", // LATIN SMALL LETTER N WITH ACUTE
	"\u0145":"{\\c N}", // LATIN CAPITAL LETTER N WITH CEDILLA
	"\u0146":"{\\c n}", // LATIN SMALL LETTER N WITH CEDILLA
	"\u0147":"{\\v N}", // LATIN CAPITAL LETTER N WITH CARON
	"\u0148":"{\\v n}", // LATIN SMALL LETTER N WITH CARON
	"\u014C":"{\\=O}", // LATIN CAPITAL LETTER O WITH MACRON
	"\u014D":"{\\=o}", // LATIN SMALL LETTER O WITH MACRON
	"\u014E":"{\\u O}", // LATIN CAPITAL LETTER O WITH BREVE
	"\u014F":"{\\u o}", // LATIN SMALL LETTER O WITH BREVE
	"\u0150":"{\\H O}", // LATIN CAPITAL LETTER O WITH DOUBLE ACUTE
	"\u0151":"{\\H o}", // LATIN SMALL LETTER O WITH DOUBLE ACUTE
	"\u0154":"{\\'R}", // LATIN CAPITAL LETTER R WITH ACUTE
	"\u0155":"{\\'r}", // LATIN SMALL LETTER R WITH ACUTE
	"\u0156":"{\\c R}", // LATIN CAPITAL LETTER R WITH CEDILLA
	"\u0157":"{\\c r}", // LATIN SMALL LETTER R WITH CEDILLA
	"\u0158":"{\\v R}", // LATIN CAPITAL LETTER R WITH CARON
	"\u0159":"{\\v r}", // LATIN SMALL LETTER R WITH CARON
	"\u015A":"{\\'S}", // LATIN CAPITAL LETTER S WITH ACUTE
	"\u015B":"{\\'s}", // LATIN SMALL LETTER S WITH ACUTE
	"\u015C":"{\\^S}", // LATIN CAPITAL LETTER S WITH CIRCUMFLEX
	"\u015D":"{\\^s}", // LATIN SMALL LETTER S WITH CIRCUMFLEX
	"\u015E":"{\\c S}", // LATIN CAPITAL LETTER S WITH CEDILLA
	"\u015F":"{\\c s}", // LATIN SMALL LETTER S WITH CEDILLA
	"\u0160":"{\\v S}", // LATIN CAPITAL LETTER S WITH CARON
	"\u0161":"{\\v s}", // LATIN SMALL LETTER S WITH CARON
	"\u0162":"{\\c T}", // LATIN CAPITAL LETTER T WITH CEDILLA
	"\u0163":"{\\c t}", // LATIN SMALL LETTER T WITH CEDILLA
	"\u0164":"{\\v T}", // LATIN CAPITAL LETTER T WITH CARON
	"\u0165":"{\\v t}", // LATIN SMALL LETTER T WITH CARON
	"\u0168":"{\\~U}", // LATIN CAPITAL LETTER U WITH TILDE
	"\u0169":"{\\~u}", // LATIN SMALL LETTER U WITH TILDE
	"\u016A":"{\\=U}", // LATIN CAPITAL LETTER U WITH MACRON
	"\u016B":"{\\=u}", // LATIN SMALL LETTER U WITH MACRON
	"\u016C":"{\\u U}", // LATIN CAPITAL LETTER U WITH BREVE
	"\u016D":"{\\u u}", // LATIN SMALL LETTER U WITH BREVE
	"\u016E":"{\\r U}", // LATIN CAPITAL U WITH A RING ABOVE
	"\u016F":"{\\r u}", // LATIN SMALL U WITH A RING ABOVE
	"\u0170":"{\\H U}", // LATIN CAPITAL LETTER U WITH DOUBLE ACUTE
	"\u0171":"{\\H u}", // LATIN SMALL LETTER U WITH DOUBLE ACUTE
	"\u0172":"{\\k U}", // LATIN CAPITAL LETTER U WITH OGONEK
	"\u0173":"{\\k u}", // LATIN SMALL LETTER U WITH OGONEK
	"\u0174":"{\\^W}", // LATIN CAPITAL LETTER W WITH CIRCUMFLEX
	"\u0175":"{\\^w}", // LATIN SMALL LETTER W WITH CIRCUMFLEX
	"\u0176":"{\\^Y}", // LATIN CAPITAL LETTER Y WITH CIRCUMFLEX
	"\u0177":"{\\^y}", // LATIN SMALL LETTER Y WITH CIRCUMFLEX
	"\u0178":"{\\\"Y}", // LATIN CAPITAL LETTER Y WITH DIAERESIS
	"\u0179":"{\\'Z}", // LATIN CAPITAL LETTER Z WITH ACUTE
	"\u017A":"{\\'z}", // LATIN SMALL LETTER Z WITH ACUTE
	"\u017B":"{\\.Z}", // LATIN CAPITAL LETTER Z WITH DOT ABOVE
	"\u017C":"{\\.z}", // LATIN SMALL LETTER Z WITH DOT ABOVE
	"\u017D":"{\\v Z}", // LATIN CAPITAL LETTER Z WITH CARON
	"\u017E":"{\\v z}", // LATIN SMALL LETTER Z WITH CARON
	"\u01CD":"{\\v A}", // LATIN CAPITAL LETTER A WITH CARON
	"\u01CE":"{\\v a}", // LATIN SMALL LETTER A WITH CARON
	"\u01CF":"{\\v I}", // LATIN CAPITAL LETTER I WITH CARON
	"\u01D0":"{\\v i}", // LATIN SMALL LETTER I WITH CARON
	"\u01D1":"{\\v O}", // LATIN CAPITAL LETTER O WITH CARON
	"\u01D2":"{\\v o}", // LATIN SMALL LETTER O WITH CARON
	"\u01D3":"{\\v U}", // LATIN CAPITAL LETTER U WITH CARON
	"\u01D4":"{\\v u}", // LATIN SMALL LETTER U WITH CARON
	"\u01E6":"{\\v G}", // LATIN CAPITAL LETTER G WITH CARON
	"\u01E7":"{\\v g}", // LATIN SMALL LETTER G WITH CARON
	"\u01E8":"{\\v K}", // LATIN CAPITAL LETTER K WITH CARON
	"\u01E9":"{\\v k}", // LATIN SMALL LETTER K WITH CARON
	"\u01EA":"{\\k O}", // LATIN CAPITAL LETTER O WITH OGONEK
	"\u01EB":"{\\k o}", // LATIN SMALL LETTER O WITH OGONEK
	"\u01F0":"{\\v j}", // LATIN SMALL LETTER J WITH CARON
	"\u01F4":"{\\'G}", // LATIN CAPITAL LETTER G WITH ACUTE
	"\u01F5":"{\\'g}", // LATIN SMALL LETTER G WITH ACUTE
	"\u1E02":"{\\.B}", // LATIN CAPITAL LETTER B WITH DOT ABOVE
	"\u1E03":"{\\.b}", // LATIN SMALL LETTER B WITH DOT ABOVE
	"\u1E04":"{\\d B}", // LATIN CAPITAL LETTER B WITH DOT BELOW
	"\u1E05":"{\\d b}", // LATIN SMALL LETTER B WITH DOT BELOW
	"\u1E06":"{\\b B}", // LATIN CAPITAL LETTER B WITH LINE BELOW
	"\u1E07":"{\\b b}", // LATIN SMALL LETTER B WITH LINE BELOW
	"\u1E0A":"{\\.D}", // LATIN CAPITAL LETTER D WITH DOT ABOVE
	"\u1E0B":"{\\.d}", // LATIN SMALL LETTER D WITH DOT ABOVE
	"\u1E0C":"{\\d D}", // LATIN CAPITAL LETTER D WITH DOT BELOW
	"\u1E0D":"{\\d d}", // LATIN SMALL LETTER D WITH DOT BELOW
	"\u1E0E":"{\\b D}", // LATIN CAPITAL LETTER D WITH LINE BELOW
	"\u1E0F":"{\\b d}", // LATIN SMALL LETTER D WITH LINE BELOW
	"\u1E10":"{\\c D}", // LATIN CAPITAL LETTER D WITH CEDILLA
	"\u1E11":"{\\c d}", // LATIN SMALL LETTER D WITH CEDILLA
	"\u1E1E":"{\\.F}", // LATIN CAPITAL LETTER F WITH DOT ABOVE
	"\u1E1F":"{\\.f}", // LATIN SMALL LETTER F WITH DOT ABOVE
	"\u1E20":"{\\=G}", // LATIN CAPITAL LETTER G WITH MACRON
	"\u1E21":"{\\=g}", // LATIN SMALL LETTER G WITH MACRON
	"\u1E22":"{\\.H}", // LATIN CAPITAL LETTER H WITH DOT ABOVE
	"\u1E23":"{\\.h}", // LATIN SMALL LETTER H WITH DOT ABOVE
	"\u1E24":"{\\d H}", // LATIN CAPITAL LETTER H WITH DOT BELOW
	"\u1E25":"{\\d h}", // LATIN SMALL LETTER H WITH DOT BELOW
	"\u1E26":"{\\\"H}", // LATIN CAPITAL LETTER H WITH DIAERESIS
	"\u1E27":"{\\\"h}", // LATIN SMALL LETTER H WITH DIAERESIS
	"\u1E28":"{\\c H}", // LATIN CAPITAL LETTER H WITH CEDILLA
	"\u1E29":"{\\c h}", // LATIN SMALL LETTER H WITH CEDILLA
	"\u1E30":"{\\'K}", // LATIN CAPITAL LETTER K WITH ACUTE
	"\u1E31":"{\\'k}", // LATIN SMALL LETTER K WITH ACUTE
	"\u1E32":"{\\d K}", // LATIN CAPITAL LETTER K WITH DOT BELOW
	"\u1E33":"{\\d k}", // LATIN SMALL LETTER K WITH DOT BELOW
	"\u1E34":"{\\b K}", // LATIN CAPITAL LETTER K WITH LINE BELOW
	"\u1E35":"{\\b k}", // LATIN SMALL LETTER K WITH LINE BELOW
	"\u1E36":"{\\d L}", // LATIN CAPITAL LETTER L WITH DOT BELOW
	"\u1E37":"{\\d l}", // LATIN SMALL LETTER L WITH DOT BELOW
	"\u1E3A":"{\\b L}", // LATIN CAPITAL LETTER L WITH LINE BELOW
	"\u1E3B":"{\\b l}", // LATIN SMALL LETTER L WITH LINE BELOW
	"\u1E3E":"{\\'M}", // LATIN CAPITAL LETTER M WITH ACUTE
	"\u1E3F":"{\\'m}", // LATIN SMALL LETTER M WITH ACUTE
	"\u1E40":"{\\.M}", // LATIN CAPITAL LETTER M WITH DOT ABOVE
	"\u1E41":"{\\.m}", // LATIN SMALL LETTER M WITH DOT ABOVE
	"\u1E42":"{\\d M}", // LATIN CAPITAL LETTER M WITH DOT BELOW
	"\u1E43":"{\\d m}", // LATIN SMALL LETTER M WITH DOT BELOW
	"\u1E44":"{\\.N}", // LATIN CAPITAL LETTER N WITH DOT ABOVE
	"\u1E45":"{\\.n}", // LATIN SMALL LETTER N WITH DOT ABOVE
	"\u1E46":"{\\d N}", // LATIN CAPITAL LETTER N WITH DOT BELOW
	"\u1E47":"{\\d n}", // LATIN SMALL LETTER N WITH DOT BELOW
	"\u1E48":"{\\b N}", // LATIN CAPITAL LETTER N WITH LINE BELOW
	"\u1E49":"{\\b n}", // LATIN SMALL LETTER N WITH LINE BELOW
	"\u1E54":"{\\'P}", // LATIN CAPITAL LETTER P WITH ACUTE
	"\u1E55":"{\\'p}", // LATIN SMALL LETTER P WITH ACUTE
	"\u1E56":"{\\.P}", // LATIN CAPITAL LETTER P WITH DOT ABOVE
	"\u1E57":"{\\.p}", // LATIN SMALL LETTER P WITH DOT ABOVE
	"\u1E58":"{\\.R}", // LATIN CAPITAL LETTER R WITH DOT ABOVE
	"\u1E59":"{\\.r}", // LATIN SMALL LETTER R WITH DOT ABOVE
	"\u1E5A":"{\\d R}", // LATIN CAPITAL LETTER R WITH DOT BELOW
	"\u1E5B":"{\\d r}", // LATIN SMALL LETTER R WITH DOT BELOW
	"\u1E5E":"{\\b R}", // LATIN CAPITAL LETTER R WITH LINE BELOW
	"\u1E5F":"{\\b r}", // LATIN SMALL LETTER R WITH LINE BELOW
	"\u1E60":"{\\.S}", // LATIN CAPITAL LETTER S WITH DOT ABOVE
	"\u1E61":"{\\.s}", // LATIN SMALL LETTER S WITH DOT ABOVE
	"\u1E62":"{\\d S}", // LATIN CAPITAL LETTER S WITH DOT BELOW
	"\u1E63":"{\\d s}", // LATIN SMALL LETTER S WITH DOT BELOW
	"\u1E6A":"{\\.T}", // LATIN CAPITAL LETTER T WITH DOT ABOVE
	"\u1E6B":"{\\.t}", // LATIN SMALL LETTER T WITH DOT ABOVE
	"\u1E6C":"{\\d T}", // LATIN CAPITAL LETTER T WITH DOT BELOW
	"\u1E6D":"{\\d t}", // LATIN SMALL LETTER T WITH DOT BELOW
	"\u1E6E":"{\\b T}", // LATIN CAPITAL LETTER T WITH LINE BELOW
	"\u1E6F":"{\\b t}", // LATIN SMALL LETTER T WITH LINE BELOW
	"\u1E7C":"{\\~V}", // LATIN CAPITAL LETTER V WITH TILDE
	"\u1E7D":"{\\~v}", // LATIN SMALL LETTER V WITH TILDE
	"\u1E7E":"{\\d V}", // LATIN CAPITAL LETTER V WITH DOT BELOW
	"\u1E7F":"{\\d v}", // LATIN SMALL LETTER V WITH DOT BELOW
	"\u1E80":"{\\`W}", // LATIN CAPITAL LETTER W WITH GRAVE
	"\u1E81":"{\\`w}", // LATIN SMALL LETTER W WITH GRAVE
	"\u1E82":"{\\'W}", // LATIN CAPITAL LETTER W WITH ACUTE
	"\u1E83":"{\\'w}", // LATIN SMALL LETTER W WITH ACUTE
	"\u1E84":"{\\\"W}", // LATIN CAPITAL LETTER W WITH DIAERESIS
	"\u1E85":"{\\\"w}", // LATIN SMALL LETTER W WITH DIAERESIS
	"\u1E86":"{\\.W}", // LATIN CAPITAL LETTER W WITH DOT ABOVE
	"\u1E87":"{\\.w}", // LATIN SMALL LETTER W WITH DOT ABOVE
	"\u1E88":"{\\d W}", // LATIN CAPITAL LETTER W WITH DOT BELOW
	"\u1E89":"{\\d w}", // LATIN SMALL LETTER W WITH DOT BELOW
	"\u1E8A":"{\\.X}", // LATIN CAPITAL LETTER X WITH DOT ABOVE
	"\u1E8B":"{\\.x}", // LATIN SMALL LETTER X WITH DOT ABOVE
	"\u1E8C":"{\\\"X}", // LATIN CAPITAL LETTER X WITH DIAERESIS
	"\u1E8D":"{\\\"x}", // LATIN SMALL LETTER X WITH DIAERESIS
	"\u1E8E":"{\\.Y}", // LATIN CAPITAL LETTER Y WITH DOT ABOVE
	"\u1E8F":"{\\.y}", // LATIN SMALL LETTER Y WITH DOT ABOVE
	"\u1E90":"{\\^Z}", // LATIN CAPITAL LETTER Z WITH CIRCUMFLEX
	"\u1E91":"{\\^z}", // LATIN SMALL LETTER Z WITH CIRCUMFLEX
	"\u1E92":"{\\d Z}", // LATIN CAPITAL LETTER Z WITH DOT BELOW
	"\u1E93":"{\\d z}", // LATIN SMALL LETTER Z WITH DOT BELOW
	"\u1E94":"{\\b Z}", // LATIN CAPITAL LETTER Z WITH LINE BELOW
	"\u1E95":"{\\b z}", // LATIN SMALL LETTER Z WITH LINE BELOW
	"\u1E96":"{\\b h}", // LATIN SMALL LETTER H WITH LINE BELOW
	"\u1E97":"{\\\"t}", // LATIN SMALL LETTER T WITH DIAERESIS
	"\u1E98":"{\\r w}", // LATIN SMALL W WITH A RING ABOVE
	"\u1E99":"{\\r y}", // LATIN SMALL Y WITH A RING ABOVE
	"\u1EA0":"{\\d A}", // LATIN CAPITAL LETTER A WITH DOT BELOW
	"\u1EA1":"{\\d a}", // LATIN SMALL LETTER A WITH DOT BELOW
	"\u1EB8":"{\\d E}", // LATIN CAPITAL LETTER E WITH DOT BELOW
	"\u1EB9":"{\\d e}", // LATIN SMALL LETTER E WITH DOT BELOW
	"\u1EBC":"{\\~E}", // LATIN CAPITAL LETTER E WITH TILDE
	"\u1EBD":"{\\~e}", // LATIN SMALL LETTER E WITH TILDE
	"\u1ECA":"{\\d I}", // LATIN CAPITAL LETTER I WITH DOT BELOW
	"\u1ECB":"{\\d i}", // LATIN SMALL LETTER I WITH DOT BELOW
	"\u1ECC":"{\\d O}", // LATIN CAPITAL LETTER O WITH DOT BELOW
	"\u1ECD":"{\\d o}", // LATIN SMALL LETTER O WITH DOT BELOW
	"\u1EE4":"{\\d U}", // LATIN CAPITAL LETTER U WITH DOT BELOW
	"\u1EE5":"{\\d u}", // LATIN SMALL LETTER U WITH DOT BELOW
	"\u1EF2":"{\\`Y}", // LATIN CAPITAL LETTER Y WITH GRAVE
	"\u1EF3":"{\\`y}", // LATIN SMALL LETTER Y WITH GRAVE
	"\u1EF4":"{\\d Y}", // LATIN CAPITAL LETTER Y WITH DOT BELOW
	"\u1EF5":"{\\d y}", // LATIN SMALL LETTER Y WITH DOT BELOW
	"\u1EF8":"{\\~Y}", // LATIN CAPITAL LETTER Y WITH TILDE
	"\u1EF9":"{\\~y}" // LATIN SMALL LETTER Y WITH TILDE
};

/* unfortunately the mapping isn't reversible - hence this second table - sigh! */
var reversemappingTable = {
	"\\url"                           : "",       // strip 'url'
	"\\href"                          : "",       // strip 'href'
	"{\\textexclamdown}"              : "\u00A1", // INVERTED EXCLAMATION MARK
	"{\\textcent}"                    : "\u00A2", // CENT SIGN
	"{\\textsterling}"                : "\u00A3", // POUND SIGN
	"{\\textyen}"                     : "\u00A5", // YEN SIGN
	"{\\textbrokenbar}"               : "\u00A6", // BROKEN BAR
	"{\\textsection}"                 : "\u00A7", // SECTION SIGN
	"{\\textasciidieresis}"           : "\u00A8", // DIAERESIS
	"{\\textcopyright}"               : "\u00A9", // COPYRIGHT SIGN
	"{\\textordfeminine}"             : "\u00AA", // FEMININE ORDINAL INDICATOR
	"{\\guillemotleft}"               : "\u00AB", // LEFT-POINTING DOUBLE ANGLE QUOTATION MARK
	"{\\textlnot}"                    : "\u00AC", // NOT SIGN
	"{\\textregistered}"              : "\u00AE", // REGISTERED SIGN
	"{\\textasciimacron}"             : "\u00AF", // MACRON
	"{\\textdegree}"                  : "\u00B0", // DEGREE SIGN
	"{\\textpm}"                      : "\u00B1", // PLUS-MINUS SIGN
	"{\\texttwosuperior}"             : "\u00B2", // SUPERSCRIPT TWO
	"{\\textthreesuperior}"           : "\u00B3", // SUPERSCRIPT THREE
	"{\\textasciiacute}"              : "\u00B4", // ACUTE ACCENT
	"{\\textmu}"                      : "\u00B5", // MICRO SIGN
	"{\\textparagraph}"               : "\u00B6", // PILCROW SIGN
	"{\\textperiodcentered}"          : "\u00B7", // MIDDLE DOT
	"{\\c\\ }"                        : "\u00B8", // CEDILLA
	"{\\textonesuperior}"             : "\u00B9", // SUPERSCRIPT ONE
	"{\\textordmasculine}"            : "\u00BA", // MASCULINE ORDINAL INDICATOR
	"{\\guillemotright}"              : "\u00BB", // RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK
	"{\\textonequarter}"              : "\u00BC", // VULGAR FRACTION ONE QUARTER
	"{\\textonehalf}"                 : "\u00BD", // VULGAR FRACTION ONE HALF
	"{\\textthreequarters}"           : "\u00BE", // VULGAR FRACTION THREE QUARTERS
	"{\\textquestiondown}"            : "\u00BF", // INVERTED QUESTION MARK
	"{\\AE}"                          : "\u00C6", // LATIN CAPITAL LETTER AE
	"{\\DH}"                          : "\u00D0", // LATIN CAPITAL LETTER ETH
	"{\\texttimes}"                   : "\u00D7", // MULTIPLICATION SIGN
	"{\\O}"                          : 	"\u00D8", // LATIN SMALL LETTER O WITH STROKE
	"{\\TH}"                          : "\u00DE", // LATIN CAPITAL LETTER THORN
	"{\\ss}"                          : "\u00DF", // LATIN SMALL LETTER SHARP S
	"{\\ae}"                          : "\u00E6", // LATIN SMALL LETTER AE
	"{\\dh}"                          : "\u00F0", // LATIN SMALL LETTER ETH
	"{\\textdiv}"                     : "\u00F7", // DIVISION SIGN
	"{\\o}"                          : "\u00F8", // LATIN SMALL LETTER O WITH STROKE
	"{\\th}"                          : "\u00FE", // LATIN SMALL LETTER THORN
	"{\\i}"                           : "\u0131", // LATIN SMALL LETTER DOTLESS I
	//"'n"                              : "\u0149", // LATIN SMALL LETTER N PRECEDED BY APOSTROPHE
	"{\\NG}"                          : "\u014A", // LATIN CAPITAL LETTER ENG
	"{\\ng}"                          : "\u014B", // LATIN SMALL LETTER ENG
	"{\\OE}"                          : "\u0152", // LATIN CAPITAL LIGATURE OE
	"{\\oe}"                          : "\u0153", // LATIN SMALL LIGATURE OE
	"{\\textasciicircum}"             : "\u02C6", // MODIFIER LETTER CIRCUMFLEX ACCENT
//    "\\~{}"                           : "\u02DC", // SMALL TILDE
	"{\\textacutedbl}"                : "\u02DD", // DOUBLE ACUTE ACCENT
	
	//Greek Letters Courtesy of Spartanroc
	"$\\Gamma$" : "\u0393", // GREEK Gamma
	"$\\Delta$" : "\u0394", // GREEK Delta
	"$\\Theta$" : "\u0398", // GREEK Theta
	"$\\Lambda$" : "\u039B", // GREEK Lambda
	"$\\Xi$" : "\u039E", // GREEK Xi
	"$\\Pi$" : "\u03A0", // GREEK Pi
	"$\\Sigma$" : "\u03A3", // GREEK Sigma
	"$\\Phi$" : "\u03A6", // GREEK Phi
	"$\\Psi$" : "\u03A8", // GREEK Psi
	"$\\Omega$" : "\u03A9", // GREEK Omega
	"$\\alpha$" : "\u03B1", // GREEK alpha
	"$\\beta$" : "\u03B2", // GREEK beta
	"$\\gamma$" : "\u03B3", // GREEK gamma
	"$\\delta$" : "\u03B4", // GREEK delta
	"$\\varepsilon$": "\u03B5", // GREEK var-epsilon
	"$\\zeta$" : "\u03B6", // GREEK zeta
	"$\\eta$" : "\u03B7", // GREEK eta
	"$\\theta$" : "\u03B8", // GREEK theta
	"$\\iota$" : "\u03B9", // GREEK iota
	"$\\kappa$" : "\u03BA", // GREEK kappa
	"$\\lambda$" : "\u03BB", // GREEK lambda
	"$\\mu$" : "\u03BC", // GREEK mu
	"$\\nu$" : "\u03BD", // GREEK nu
	"$\\xi$" : "\u03BE", // GREEK xi
	"$\\pi$" : "\u03C0", // GREEK pi
	"$\\rho$" : "\u03C1", // GREEK rho
	"$\\varsigma$" : "\u03C2", // GREEK var-sigma
	"$\\sigma$" : "\u03C3", // GREEK sigma
	"$\\tau$" : "\u03C4", // GREEK tau
	"$\\upsilon$" : "\u03C5", // GREEK upsilon
	"$\\varphi$" : "\u03C6", // GREEK var-phi
	"$\\chi$" : "\u03C7", // GREEK chi
	"$\\psi$" : "\u03C8", // GREEK psi
	"$\\omega$" : "\u03C9", // GREEK omega
	"$\\vartheta$" : "\u03D1", // GREEK var-theta
	"$\\Upsilon$" : "\u03D2", // GREEK Upsilon
	"$\\phi$" : "\u03D5", // GREEK phi
	"$\\varpi$" : "\u03D6", // GREEK var-pi
	"$\\varrho$" : "\u03F1", // GREEK var-rho
	"$\\epsilon$" : "\u03F5", // GREEK epsilon
	//Greek letters end
	"{\\textendash}"                  : "\u2013", // EN DASH
	"{\\textemdash}"                  : "\u2014", // EM DASH
	"---"                             : "\u2014", // EM DASH
	"--"                              : "\u2013", // EN DASH
	"{\\textbardbl}"                  : "\u2016", // DOUBLE VERTICAL LINE
	"{\\textunderscore}"              : "\u2017", // DOUBLE LOW LINE
	"{\\textquoteleft}"               : "\u2018", // LEFT SINGLE QUOTATION MARK
	"{\\textquoteright}"              : "\u2019", // RIGHT SINGLE QUOTATION MARK
	"{\\quotesinglbase}"              : "\u201A", // SINGLE LOW-9 QUOTATION MARK
	"{\\textquotedblleft}"            : "\u201C", // LEFT DOUBLE QUOTATION MARK
	"{\\textquotedblright}"           : "\u201D", // RIGHT DOUBLE QUOTATION MARK
	"{\\quotedblbase}"                : "\u201E", // DOUBLE LOW-9 QUOTATION MARK
//    "{\\quotedblbase}"                : "\u201F", // DOUBLE HIGH-REVERSED-9 QUOTATION MARK
	"{\\textdagger}"                  : "\u2020", // DAGGER
	"{\\textdaggerdbl}"               : "\u2021", // DOUBLE DAGGER
	"{\\textbullet}"                  : "\u2022", // BULLET
	"{\\textellipsis}"                : "\u2026", // HORIZONTAL ELLIPSIS
	"{\\textperthousand}"             : "\u2030", // PER MILLE SIGN
	"'''"                             : "\u2034", // TRIPLE PRIME
	"''"                              : "\u201D", // RIGHT DOUBLE QUOTATION MARK (could be a double prime)
	"``"                              : "\u201C", // LEFT DOUBLE QUOTATION MARK (could be a reversed double prime)
	"```"                             : "\u2037", // REVERSED TRIPLE PRIME
	"{\\guilsinglleft}"               : "\u2039", // SINGLE LEFT-POINTING ANGLE QUOTATION MARK
	"{\\guilsinglright}"              : "\u203A", // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK
	"!!"                              : "\u203C", // DOUBLE EXCLAMATION MARK
	"{\\textfractionsolidus}"         : "\u2044", // FRACTION SLASH
	"?!"                              : "\u2048", // QUESTION EXCLAMATION MARK
	"!?"                              : "\u2049", // EXCLAMATION QUESTION MARK
	"$^{0}$"                          : "\u2070", // SUPERSCRIPT ZERO
	"$^{4}$"                          : "\u2074", // SUPERSCRIPT FOUR
	"$^{5}$"                          : "\u2075", // SUPERSCRIPT FIVE
	"$^{6}$"                          : "\u2076", // SUPERSCRIPT SIX
	"$^{7}$"                          : "\u2077", // SUPERSCRIPT SEVEN
	"$^{8}$"                          : "\u2078", // SUPERSCRIPT EIGHT
	"$^{9}$"                          : "\u2079", // SUPERSCRIPT NINE
	"$^{+}$"                          : "\u207A", // SUPERSCRIPT PLUS SIGN
	"$^{-}$"                          : "\u207B", // SUPERSCRIPT MINUS
	"$^{=}$"                          : "\u207C", // SUPERSCRIPT EQUALS SIGN
	"$^{(}$"                          : "\u207D", // SUPERSCRIPT LEFT PARENTHESIS
	"$^{)}$"                          : "\u207E", // SUPERSCRIPT RIGHT PARENTHESIS
	"$^{n}$"                          : "\u207F", // SUPERSCRIPT LATIN SMALL LETTER N
	"$_{0}$"                          : "\u2080", // SUBSCRIPT ZERO
	"$_{1}$"                          : "\u2081", // SUBSCRIPT ONE
	"$_{2}$"                          : "\u2082", // SUBSCRIPT TWO
	"$_{3}$"                          : "\u2083", // SUBSCRIPT THREE
	"$_{4}$"                          : "\u2084", // SUBSCRIPT FOUR
	"$_{5}$"                          : "\u2085", // SUBSCRIPT FIVE
	"$_{6}$"                          : "\u2086", // SUBSCRIPT SIX
	"$_{7}$"                          : "\u2087", // SUBSCRIPT SEVEN
	"$_{8}$"                          : "\u2088", // SUBSCRIPT EIGHT
	"$_{9}$"                          : "\u2089", // SUBSCRIPT NINE
	"$_{+}$"                          : "\u208A", // SUBSCRIPT PLUS SIGN
	"$_{-}$"                          : "\u208B", // SUBSCRIPT MINUS
	"$_{=}$"                          : "\u208C", // SUBSCRIPT EQUALS SIGN
	"$_{(}$"                          : "\u208D", // SUBSCRIPT LEFT PARENTHESIS
	"$_{)}$"                          : "\u208E", // SUBSCRIPT RIGHT PARENTHESIS
	"{\\texteuro}"                    : "\u20AC", // EURO SIGN
	//"a/c"                             : "\u2100", // ACCOUNT OF
	//"a/s"                             : "\u2101", // ADDRESSED TO THE SUBJECT
	"{\\textcelsius}"                 : "\u2103", // DEGREE CELSIUS
	//"c/o"                             : "\u2105", // CARE OF
	//"c/u"                             : "\u2106", // CADA UNA
	"{\\textnumero}"                  : "\u2116", // NUMERO SIGN
	"{\\textcircledP}"                : "\u2117", // SOUND RECORDING COPYRIGHT
	"{\\textservicemark}"             : "\u2120", // SERVICE MARK
	"{TEL}"                           : "\u2121", // TELEPHONE SIGN
	"{\\texttrademark}"               : "\u2122", // TRADE MARK SIGN
	"{\\textohm}"                     : "\u2126", // OHM SIGN
	"{\\textestimated}"               : "\u212E", // ESTIMATED SYMBOL
	
	/*" 1/3"                            : "\u2153", // VULGAR FRACTION ONE THIRD
	" 2/3"                            : "\u2154", // VULGAR FRACTION TWO THIRDS
	" 1/5"                            : "\u2155", // VULGAR FRACTION ONE FIFTH
	" 2/5"                            : "\u2156", // VULGAR FRACTION TWO FIFTHS
	" 3/5"                            : "\u2157", // VULGAR FRACTION THREE FIFTHS
	" 4/5"                            : "\u2158", // VULGAR FRACTION FOUR FIFTHS
	" 1/6"                            : "\u2159", // VULGAR FRACTION ONE SIXTH
	" 5/6"                            : "\u215A", // VULGAR FRACTION FIVE SIXTHS
	" 1/8"                            : "\u215B", // VULGAR FRACTION ONE EIGHTH
	" 3/8"                            : "\u215C", // VULGAR FRACTION THREE EIGHTHS
	" 5/8"                            : "\u215D", // VULGAR FRACTION FIVE EIGHTHS
	" 7/8"                            : "\u215E", // VULGAR FRACTION SEVEN EIGHTHS
	" 1/"                             : "\u215F", // FRACTION NUMERATOR ONE */
	
	"{\\textleftarrow}"               : "\u2190", // LEFTWARDS ARROW
	"{\\textuparrow}"                 : "\u2191", // UPWARDS ARROW
	"{\\textrightarrow}"              : "\u2192", // RIGHTWARDS ARROW
	"{\\textdownarrow}"               : "\u2193", // DOWNWARDS ARROW
	/*"<->"                             : "\u2194", // LEFT RIGHT ARROW
	"<="                              : "\u21D0", // LEFTWARDS DOUBLE ARROW
	"=>"                              : "\u21D2", // RIGHTWARDS DOUBLE ARROW
	"<=>"                             : "\u21D4", // LEFT RIGHT DOUBLE ARROW */
	"$\\infty$"                       : "\u221E", // INFINITY
	
	/*"||"                              : "\u2225", // PARALLEL TO
	"/="                              : "\u2260", // NOT EQUAL TO
	"<="                              : "\u2264", // LESS-THAN OR EQUAL TO
	">="                              : "\u2265", // GREATER-THAN OR EQUAL TO
	"<<"                              : "\u226A", // MUCH LESS-THAN
	">>"                              : "\u226B", // MUCH GREATER-THAN
	"(+)"                             : "\u2295", // CIRCLED PLUS
	"(-)"                             : "\u2296", // CIRCLED MINUS
	"(x)"                             : "\u2297", // CIRCLED TIMES
	"(/)"                             : "\u2298", // CIRCLED DIVISION SLASH
	"|-"                              : "\u22A2", // RIGHT TACK
	"-|"                              : "\u22A3", // LEFT TACK
	"|-"                              : "\u22A6", // ASSERTION
	"|="                              : "\u22A7", // MODELS
	"|="                              : "\u22A8", // TRUE
	"||-"                             : "\u22A9", // FORCES */
	
	"$\\#$"                           : "\u22D5", // EQUAL AND PARALLEL TO
	//"<<<"                             : "\u22D8", // VERY MUCH LESS-THAN
	//">>>"                             : "\u22D9", // VERY MUCH GREATER-THAN
	"{\\textlangle}"                  : "\u2329", // LEFT-POINTING ANGLE BRACKET
	"{\\textrangle}"                  : "\u232A", // RIGHT-POINTING ANGLE BRACKET
	"{\\textvisiblespace}"            : "\u2423", // OPEN BOX
	//"///"                             : "\u2425", // SYMBOL FOR DELETE FORM TWO
	"{\\textopenbullet}"              : "\u25E6", // WHITE BULLET
	//":-("                             : "\u2639", // WHITE FROWNING FACE
	//":-)"                             : "\u263A", // WHITE SMILING FACE
	//"(-: "                            : "\u263B", // BLACK SMILING FACE
	//    "$\\#$"                           : "\u266F", // MUSIC SHARP SIGN
	"$\\%<$"                          : "\u2701", // UPPER BLADE SCISSORS
	/*    "$\\%<$"                          : "\u2702", // BLACK SCISSORS
	"$\\%<$"                          : "\u2703", // LOWER BLADE SCISSORS
	"$\\%<$"                          : "\u2704", // WHITE SCISSORS */
	/* Derived accented characters */
	"{\\`A}"                          : "\u00C0", // LATIN CAPITAL LETTER A WITH GRAVE
	"{\\'A}"                          : "\u00C1", // LATIN CAPITAL LETTER A WITH ACUTE
	"{\\^A}"                          : "\u00C2", // LATIN CAPITAL LETTER A WITH CIRCUMFLEX
	"{\\~A}"                          : "\u00C3", // LATIN CAPITAL LETTER A WITH TILDE
	"{\\\"A}"                         : "\u00C4", // LATIN CAPITAL LETTER A WITH DIAERESIS
	"{\\r A}"                          : "\u00C5", // LATIN CAPITAL LETTER A WITH RING ABOVE
	"{\\c C}"                          : "\u00C7", // LATIN CAPITAL LETTER C WITH CEDILLA
	"{\\`E}"                          : "\u00C8", // LATIN CAPITAL LETTER E WITH GRAVE
	"{\\'E}"                          : "\u00C9", // LATIN CAPITAL LETTER E WITH ACUTE
	"{\\^E}"                          : "\u00CA", // LATIN CAPITAL LETTER E WITH CIRCUMFLEX
	"{\\\"E}"                         : "\u00CB", // LATIN CAPITAL LETTER E WITH DIAERESIS
	"{\\`I}"                          : "\u00CC", // LATIN CAPITAL LETTER I WITH GRAVE
	"{\\'I}"                          : "\u00CD", // LATIN CAPITAL LETTER I WITH ACUTE
	"{\\^I}"                          : "\u00CE", // LATIN CAPITAL LETTER I WITH CIRCUMFLEX
	"{\\\"I}"                         : "\u00CF", // LATIN CAPITAL LETTER I WITH DIAERESIS
	"{\\~N}"                          : "\u00D1", // LATIN CAPITAL LETTER N WITH TILDE
	"{\\`O}"                          : "\u00D2", // LATIN CAPITAL LETTER O WITH GRAVE
	"{\\'O}"                          : "\u00D3", // LATIN CAPITAL LETTER O WITH ACUTE
	"{\\^O}"                          : "\u00D4", // LATIN CAPITAL LETTER O WITH CIRCUMFLEX
	"{\\~O}"                          : "\u00D5", // LATIN CAPITAL LETTER O WITH TILDE
	"{\\\"O}"                         : "\u00D6", // LATIN CAPITAL LETTER O WITH DIAERESIS
	"{\\`U}"                          : "\u00D9", // LATIN CAPITAL LETTER U WITH GRAVE
	"{\\'U}"                          : "\u00DA", // LATIN CAPITAL LETTER U WITH ACUTE
	"{\\^U}"                          : "\u00DB", // LATIN CAPITAL LETTER U WITH CIRCUMFLEX
	"{\\\"U}"                         : "\u00DC", // LATIN CAPITAL LETTER U WITH DIAERESIS
	"{\\'Y}"                          : "\u00DD", // LATIN CAPITAL LETTER Y WITH ACUTE
	"{\\`a}"                          : "\u00E0", // LATIN SMALL LETTER A WITH GRAVE
	"{\\'a}"                          : "\u00E1", // LATIN SMALL LETTER A WITH ACUTE
	"{\\^a}"                          : "\u00E2", // LATIN SMALL LETTER A WITH CIRCUMFLEX
	"{\\~a}"                          : "\u00E3", // LATIN SMALL LETTER A WITH TILDE
	"{\\\"a}"                         : "\u00E4", // LATIN SMALL LETTER A WITH DIAERESIS
	"{\\r a}"                          : "\u00E5", // LATIN SMALL LETTER A WITH RING ABOVE
	"{\\c c}"                          : "\u00E7", // LATIN SMALL LETTER C WITH CEDILLA
	"{\\`e}"                          : "\u00E8", // LATIN SMALL LETTER E WITH GRAVE
	"{\\'e}"                          : "\u00E9", // LATIN SMALL LETTER E WITH ACUTE
	"{\\^e}"                          : "\u00EA", // LATIN SMALL LETTER E WITH CIRCUMFLEX
	"{\\\"e}"                         : "\u00EB", // LATIN SMALL LETTER E WITH DIAERESIS
	"{\\`i}"                          : "\u00EC", // LATIN SMALL LETTER I WITH GRAVE
	"{\\'i}"                          : "\u00ED", // LATIN SMALL LETTER I WITH ACUTE
	"{\\^i}"                          : "\u00EE", // LATIN SMALL LETTER I WITH CIRCUMFLEX
	"{\\\"i}"                         : "\u00EF", // LATIN SMALL LETTER I WITH DIAERESIS
	"{\\~n}"                          : "\u00F1", // LATIN SMALL LETTER N WITH TILDE
	"{\\`o}"                          : "\u00F2", // LATIN SMALL LETTER O WITH GRAVE
	"{\\'o}"                          : "\u00F3", // LATIN SMALL LETTER O WITH ACUTE
	"{\\^o}"                          : "\u00F4", // LATIN SMALL LETTER O WITH CIRCUMFLEX
	"{\\~o}"                          : "\u00F5", // LATIN SMALL LETTER O WITH TILDE
	"{\\\"o}"                         : "\u00F6", // LATIN SMALL LETTER O WITH DIAERESIS
	"{\\`u}"                          : "\u00F9", // LATIN SMALL LETTER U WITH GRAVE
	"{\\'u}"                          : "\u00FA", // LATIN SMALL LETTER U WITH ACUTE
	"{\\^u}"                          : "\u00FB", // LATIN SMALL LETTER U WITH CIRCUMFLEX
	"{\\\"u}"                         : "\u00FC", // LATIN SMALL LETTER U WITH DIAERESIS
	"{\\'y}"                          : "\u00FD", // LATIN SMALL LETTER Y WITH ACUTE
	"{\\\"y}"                         : "\u00FF", // LATIN SMALL LETTER Y WITH DIAERESIS
	"{\\=A}"                          : "\u0100", // LATIN CAPITAL LETTER A WITH MACRON
	"{\\=a}"                          : "\u0101", // LATIN SMALL LETTER A WITH MACRON
	"{\\u A}"                          : "\u0102", // LATIN CAPITAL LETTER A WITH BREVE
	"{\\u a}"                          : "\u0103", // LATIN SMALL LETTER A WITH BREVE
	"{\\k A}"                          : "\u0104", // LATIN CAPITAL LETTER A WITH OGONEK
	"{\\k a}"                          : "\u0105", // LATIN SMALL LETTER A WITH OGONEK
	"{\\'C}"                          : "\u0106", // LATIN CAPITAL LETTER C WITH ACUTE
	"{\\'c}"                          : "\u0107", // LATIN SMALL LETTER C WITH ACUTE
	"{\\^C}"                          : "\u0108", // LATIN CAPITAL LETTER C WITH CIRCUMFLEX
	"{\\^c}"                          : "\u0109", // LATIN SMALL LETTER C WITH CIRCUMFLEX
	"{\\.C}"                          : "\u010A", // LATIN CAPITAL LETTER C WITH DOT ABOVE
	"{\\.c}"                          : "\u010B", // LATIN SMALL LETTER C WITH DOT ABOVE
	"{\\v C}"                          : "\u010C", // LATIN CAPITAL LETTER C WITH CARON
	"{\\v c}"                          : "\u010D", // LATIN SMALL LETTER C WITH CARON
	"{\\v D}"                          : "\u010E", // LATIN CAPITAL LETTER D WITH CARON
	"{\\v d}"                          : "\u010F", // LATIN SMALL LETTER D WITH CARON
	"{\\=E}"                          : "\u0112", // LATIN CAPITAL LETTER E WITH MACRON
	"{\\=e}"                          : "\u0113", // LATIN SMALL LETTER E WITH MACRON
	"{\\u E}"                          : "\u0114", // LATIN CAPITAL LETTER E WITH BREVE
	"{\\u e}"                          : "\u0115", // LATIN SMALL LETTER E WITH BREVE
	"{\\.E}"                          : "\u0116", // LATIN CAPITAL LETTER E WITH DOT ABOVE
	"{\\.e}"                          : "\u0117", // LATIN SMALL LETTER E WITH DOT ABOVE
	"{\\k E}"                          : "\u0118", // LATIN CAPITAL LETTER E WITH OGONEK
	"{\\k e}"                          : "\u0119", // LATIN SMALL LETTER E WITH OGONEK
	"{\\v E}"                          : "\u011A", // LATIN CAPITAL LETTER E WITH CARON
	"{\\v e}"                          : "\u011B", // LATIN SMALL LETTER E WITH CARON
	"{\\^G}"                          : "\u011C", // LATIN CAPITAL LETTER G WITH CIRCUMFLEX
	"{\\^g}"                          : "\u011D", // LATIN SMALL LETTER G WITH CIRCUMFLEX
	"{\\u G}"                          : "\u011E", // LATIN CAPITAL LETTER G WITH BREVE
	"{\\u g}"                          : "\u011F", // LATIN SMALL LETTER G WITH BREVE
	"{\\.G}"                          : "\u0120", // LATIN CAPITAL LETTER G WITH DOT ABOVE
	"{\\.g}"                          : "\u0121", // LATIN SMALL LETTER G WITH DOT ABOVE
	"{\\c G}"                          : "\u0122", // LATIN CAPITAL LETTER G WITH CEDILLA
	"{\\c g}"                          : "\u0123", // LATIN SMALL LETTER G WITH CEDILLA
	"{\\^H}"                          : "\u0124", // LATIN CAPITAL LETTER H WITH CIRCUMFLEX
	"{\\^h}"                          : "\u0125", // LATIN SMALL LETTER H WITH CIRCUMFLEX
	"{\\~I}"                          : "\u0128", // LATIN CAPITAL LETTER I WITH TILDE
	"{\\~i}"                          : "\u0129", // LATIN SMALL LETTER I WITH TILDE
	"{\\=I}"                          : "\u012A", // LATIN CAPITAL LETTER I WITH MACRON
	"{\\=i}"                          : "\u012B", // LATIN SMALL LETTER I WITH MACRON
	"{\\=\\i}"                        : "\u012B", // LATIN SMALL LETTER I WITH MACRON
	"{\\u I}"                          : "\u012C", // LATIN CAPITAL LETTER I WITH BREVE
	"{\\u i}"                          : "\u012D", // LATIN SMALL LETTER I WITH BREVE
	"{\\k I}"                          : "\u012E", // LATIN CAPITAL LETTER I WITH OGONEK
	"{\\k i}"                          : "\u012F", // LATIN SMALL LETTER I WITH OGONEK
	"{\\.I}"                          : "\u0130", // LATIN CAPITAL LETTER I WITH DOT ABOVE
	"{\\^J}"                          : "\u0134", // LATIN CAPITAL LETTER J WITH CIRCUMFLEX
	"{\\^j}"                          : "\u0135", // LATIN SMALL LETTER J WITH CIRCUMFLEX
	"{\\c K}"                          : "\u0136", // LATIN CAPITAL LETTER K WITH CEDILLA
	"{\\c k}"                          : "\u0137", // LATIN SMALL LETTER K WITH CEDILLA
	"{\\'L}"                          : "\u0139", // LATIN CAPITAL LETTER L WITH ACUTE
	"{\\'l}"                          : "\u013A", // LATIN SMALL LETTER L WITH ACUTE
	"{\\c L}"                          : "\u013B", // LATIN CAPITAL LETTER L WITH CEDILLA
	"{\\c l}"                          : "\u013C", // LATIN SMALL LETTER L WITH CEDILLA
	"{\\v L}"                          : "\u013D", // LATIN CAPITAL LETTER L WITH CARON
	"{\\v l}"                          : "\u013E", // LATIN SMALL LETTER L WITH CARON
	"{\\L }"                           : "\u0141", //LATIN CAPITAL LETTER L WITH STROKE
	"{\\l }"                           : "\u0142", //LATIN SMALL LETTER L WITH STROKE
	"{\\'N}"                          : "\u0143", // LATIN CAPITAL LETTER N WITH ACUTE
	"{\\'n}"                          : "\u0144", // LATIN SMALL LETTER N WITH ACUTE
	"{\\c N}"                          : "\u0145", // LATIN CAPITAL LETTER N WITH CEDILLA
	"{\\c n}"                          : "\u0146", // LATIN SMALL LETTER N WITH CEDILLA
	"{\\v N}"                          : "\u0147", // LATIN CAPITAL LETTER N WITH CARON
	"{\\v n}"                          : "\u0148", // LATIN SMALL LETTER N WITH CARON
	"{\\=O}"                          : "\u014C", // LATIN CAPITAL LETTER O WITH MACRON
	"{\\=o}"                          : "\u014D", // LATIN SMALL LETTER O WITH MACRON
	"{\\u O}"                          : "\u014E", // LATIN CAPITAL LETTER O WITH BREVE
	"{\\u o}"                          : "\u014F", // LATIN SMALL LETTER O WITH BREVE
	"{\\H O}"                          : "\u0150", // LATIN CAPITAL LETTER O WITH DOUBLE ACUTE
	"{\\H o}"                          : "\u0151", // LATIN SMALL LETTER O WITH DOUBLE ACUTE
	"{\\'R}"                          : "\u0154", // LATIN CAPITAL LETTER R WITH ACUTE
	"{\\'r}"                          : "\u0155", // LATIN SMALL LETTER R WITH ACUTE
	"{\\c R}"                          : "\u0156", // LATIN CAPITAL LETTER R WITH CEDILLA
	"{\\c r}"                          : "\u0157", // LATIN SMALL LETTER R WITH CEDILLA
	"{\\v R}"                          : "\u0158", // LATIN CAPITAL LETTER R WITH CARON
	"{\\v r}"                          : "\u0159", // LATIN SMALL LETTER R WITH CARON
	"{\\'S}"                          : "\u015A", // LATIN CAPITAL LETTER S WITH ACUTE
	"{\\'s}"                          : "\u015B", // LATIN SMALL LETTER S WITH ACUTE
	"{\\^S}"                          : "\u015C", // LATIN CAPITAL LETTER S WITH CIRCUMFLEX
	"{\\^s}"                          : "\u015D", // LATIN SMALL LETTER S WITH CIRCUMFLEX
	"{\\c S}"                          : "\u015E", // LATIN CAPITAL LETTER S WITH CEDILLA
	"{\\c s}"                          : "\u015F", // LATIN SMALL LETTER S WITH CEDILLA
	"{\\v S}"                          : "\u0160", // LATIN CAPITAL LETTER S WITH CARON
	"{\\v s}"                          : "\u0161", // LATIN SMALL LETTER S WITH CARON
	"{\\c T}"                          : "\u0162", // LATIN CAPITAL LETTER T WITH CEDILLA
	"{\\c t}"                          : "\u0163", // LATIN SMALL LETTER T WITH CEDILLA
	"{\\v T}"                          : "\u0164", // LATIN CAPITAL LETTER T WITH CARON
	"{\\v t}"                          : "\u0165", // LATIN SMALL LETTER T WITH CARON
	"{\\~U}"                          : "\u0168", // LATIN CAPITAL LETTER U WITH TILDE
	"{\\~u}"                          : "\u0169", // LATIN SMALL LETTER U WITH TILDE
	"{\\=U}"                          : "\u016A", // LATIN CAPITAL LETTER U WITH MACRON
	"{\\=u}"                          : "\u016B", // LATIN SMALL LETTER U WITH MACRON
	"{\\u U}"                          : "\u016C", // LATIN CAPITAL LETTER U WITH BREVE
	"{\\u u}"                          : "\u016D", // LATIN SMALL LETTER U WITH BREVE
	"{\\r U}"                          : "\u016E", // LATIN CAPITAL LETTER U WITH RING ABOVE
	"{\\r u}"                          : "\u016F", // LATIN SMALL LETTER U WITH RING ABOVE
	"{\\H U}"                          : "\u0170", // LATIN CAPITAL LETTER U WITH DOUBLE ACUTE
	"{\\H u}"                          : "\u0171", // LATIN SMALL LETTER U WITH DOUBLE ACUTE
	"{\\k U}"                          : "\u0172", // LATIN CAPITAL LETTER U WITH OGONEK
	"{\\k u}"                          : "\u0173", // LATIN SMALL LETTER U WITH OGONEK
	"{\\^W}"                          : "\u0174", // LATIN CAPITAL LETTER W WITH CIRCUMFLEX
	"{\\^w}"                          : "\u0175", // LATIN SMALL LETTER W WITH CIRCUMFLEX
	"{\\^Y}"                          : "\u0176", // LATIN CAPITAL LETTER Y WITH CIRCUMFLEX
	"{\\^y}"                          : "\u0177", // LATIN SMALL LETTER Y WITH CIRCUMFLEX
	"{\\\"Y}"                         : "\u0178", // LATIN CAPITAL LETTER Y WITH DIAERESIS
	"{\\'Z}"                          : "\u0179", // LATIN CAPITAL LETTER Z WITH ACUTE
	"{\\'z}"                          : "\u017A", // LATIN SMALL LETTER Z WITH ACUTE
	"{\\.Z}"                          : "\u017B", // LATIN CAPITAL LETTER Z WITH DOT ABOVE
	"{\\.z}"                          : "\u017C", // LATIN SMALL LETTER Z WITH DOT ABOVE
	"{\\v Z}"                          : "\u017D", // LATIN CAPITAL LETTER Z WITH CARON
	"{\\v z}"                          : "\u017E", // LATIN SMALL LETTER Z WITH CARON
	"{\\v A}"                          : "\u01CD", // LATIN CAPITAL LETTER A WITH CARON
	"{\\v a}"                          : "\u01CE", // LATIN SMALL LETTER A WITH CARON
	"{\\v I}"                          : "\u01CF", // LATIN CAPITAL LETTER I WITH CARON
	"{\\v i}"                          : "\u01D0", // LATIN SMALL LETTER I WITH CARON
	"{\\v O}"                          : "\u01D1", // LATIN CAPITAL LETTER O WITH CARON
	"{\\v o}"                          : "\u01D2", // LATIN SMALL LETTER O WITH CARON
	"{\\v U}"                          : "\u01D3", // LATIN CAPITAL LETTER U WITH CARON
	"{\\v u}"                          : "\u01D4", // LATIN SMALL LETTER U WITH CARON
	"{\\v G}"                          : "\u01E6", // LATIN CAPITAL LETTER G WITH CARON
	"{\\v g}"                          : "\u01E7", // LATIN SMALL LETTER G WITH CARON
	"{\\v K}"                          : "\u01E8", // LATIN CAPITAL LETTER K WITH CARON
	"{\\v k}"                          : "\u01E9", // LATIN SMALL LETTER K WITH CARON
	"{\\k O}"                          : "\u01EA", // LATIN CAPITAL LETTER O WITH OGONEK
	"{\\k o}"                          : "\u01EB", // LATIN SMALL LETTER O WITH OGONEK
	"{\\v j}"                          : "\u01F0", // LATIN SMALL LETTER J WITH CARON
	"{\\'G}"                          : "\u01F4", // LATIN CAPITAL LETTER G WITH ACUTE
	"{\\'g}"                          : "\u01F5", // LATIN SMALL LETTER G WITH ACUTE
	"{\\.B}"                          : "\u1E02", // LATIN CAPITAL LETTER B WITH DOT ABOVE
	"{\\.b}"                          : "\u1E03", // LATIN SMALL LETTER B WITH DOT ABOVE
	"{\\d B}"                          : "\u1E04", // LATIN CAPITAL LETTER B WITH DOT BELOW
	"{\\d b}"                          : "\u1E05", // LATIN SMALL LETTER B WITH DOT BELOW
	"{\\b B}"                          : "\u1E06", // LATIN CAPITAL LETTER B WITH LINE BELOW
	"{\\b b}"                          : "\u1E07", // LATIN SMALL LETTER B WITH LINE BELOW
	"{\\.D}"                          : "\u1E0A", // LATIN CAPITAL LETTER D WITH DOT ABOVE
	"{\\.d}"                          : "\u1E0B", // LATIN SMALL LETTER D WITH DOT ABOVE
	"{\\d D}"                          : "\u1E0C", // LATIN CAPITAL LETTER D WITH DOT BELOW
	"{\\d d}"                          : "\u1E0D", // LATIN SMALL LETTER D WITH DOT BELOW
	"{\\b D}"                          : "\u1E0E", // LATIN CAPITAL LETTER D WITH LINE BELOW
	"{\\b d}"                          : "\u1E0F", // LATIN SMALL LETTER D WITH LINE BELOW
	"{\\c D}"                          : "\u1E10", // LATIN CAPITAL LETTER D WITH CEDILLA
	"{\\c d}"                          : "\u1E11", // LATIN SMALL LETTER D WITH CEDILLA
	"{\\.F}"                          : "\u1E1E", // LATIN CAPITAL LETTER F WITH DOT ABOVE
	"{\\.f}"                          : "\u1E1F", // LATIN SMALL LETTER F WITH DOT ABOVE
	"{\\=G}"                          : "\u1E20", // LATIN CAPITAL LETTER G WITH MACRON
	"{\\=g}"                          : "\u1E21", // LATIN SMALL LETTER G WITH MACRON
	"{\\.H}"                          : "\u1E22", // LATIN CAPITAL LETTER H WITH DOT ABOVE
	"{\\.h}"                          : "\u1E23", // LATIN SMALL LETTER H WITH DOT ABOVE
	"{\\d H}"                          : "\u1E24", // LATIN CAPITAL LETTER H WITH DOT BELOW
	"{\\d h}"                          : "\u1E25", // LATIN SMALL LETTER H WITH DOT BELOW
	"{\\\"H}"                         : "\u1E26", // LATIN CAPITAL LETTER H WITH DIAERESIS
	"{\\\"h}"                         : "\u1E27", // LATIN SMALL LETTER H WITH DIAERESIS
	"{\\c H}"                          : "\u1E28", // LATIN CAPITAL LETTER H WITH CEDILLA
	"{\\c h}"                          : "\u1E29", // LATIN SMALL LETTER H WITH CEDILLA
	"{\\'K}"                          : "\u1E30", // LATIN CAPITAL LETTER K WITH ACUTE
	"{\\'k}"                          : "\u1E31", // LATIN SMALL LETTER K WITH ACUTE
	"{\\d K}"                          : "\u1E32", // LATIN CAPITAL LETTER K WITH DOT BELOW
	"{\\d k}"                          : "\u1E33", // LATIN SMALL LETTER K WITH DOT BELOW
	"{\\b K}"                          : "\u1E34", // LATIN CAPITAL LETTER K WITH LINE BELOW
	"{\\b k}"                          : "\u1E35", // LATIN SMALL LETTER K WITH LINE BELOW
	"{\\d L}"                          : "\u1E36", // LATIN CAPITAL LETTER L WITH DOT BELOW
	"{\\d l}"                          : "\u1E37", // LATIN SMALL LETTER L WITH DOT BELOW
	"{\\b L}"                          : "\u1E3A", // LATIN CAPITAL LETTER L WITH LINE BELOW
	"{\\b l}"                          : "\u1E3B", // LATIN SMALL LETTER L WITH LINE BELOW
	"{\\'M}"                          : "\u1E3E", // LATIN CAPITAL LETTER M WITH ACUTE
	"{\\'m}"                          : "\u1E3F", // LATIN SMALL LETTER M WITH ACUTE
	"{\\.M}"                          : "\u1E40", // LATIN CAPITAL LETTER M WITH DOT ABOVE
	"{\\.m}"                          : "\u1E41", // LATIN SMALL LETTER M WITH DOT ABOVE
	"{\\d M}"                          : "\u1E42", // LATIN CAPITAL LETTER M WITH DOT BELOW
	"{\\d m}"                          : "\u1E43", // LATIN SMALL LETTER M WITH DOT BELOW
	"{\\.N}"                          : "\u1E44", // LATIN CAPITAL LETTER N WITH DOT ABOVE
	"{\\.n}"                          : "\u1E45", // LATIN SMALL LETTER N WITH DOT ABOVE
	"{\\d N}"                          : "\u1E46", // LATIN CAPITAL LETTER N WITH DOT BELOW
	"{\\d n}"                          : "\u1E47", // LATIN SMALL LETTER N WITH DOT BELOW
	"{\\b N}"                          : "\u1E48", // LATIN CAPITAL LETTER N WITH LINE BELOW
	"{\\b n}"                          : "\u1E49", // LATIN SMALL LETTER N WITH LINE BELOW
	"{\\'P}"                          : "\u1E54", // LATIN CAPITAL LETTER P WITH ACUTE
	"{\\'p}"                          : "\u1E55", // LATIN SMALL LETTER P WITH ACUTE
	"{\\.P}"                          : "\u1E56", // LATIN CAPITAL LETTER P WITH DOT ABOVE
	"{\\.p}"                          : "\u1E57", // LATIN SMALL LETTER P WITH DOT ABOVE
	"{\\.R}"                          : "\u1E58", // LATIN CAPITAL LETTER R WITH DOT ABOVE
	"{\\.r}"                          : "\u1E59", // LATIN SMALL LETTER R WITH DOT ABOVE
	"{\\d R}"                          : "\u1E5A", // LATIN CAPITAL LETTER R WITH DOT BELOW
	"{\\d r}"                          : "\u1E5B", // LATIN SMALL LETTER R WITH DOT BELOW
	"{\\b R}"                          : "\u1E5E", // LATIN CAPITAL LETTER R WITH LINE BELOW
	"{\\b r}"                          : "\u1E5F", // LATIN SMALL LETTER R WITH LINE BELOW
	"{\\.S}"                          : "\u1E60", // LATIN CAPITAL LETTER S WITH DOT ABOVE
	"{\\.s}"                          : "\u1E61", // LATIN SMALL LETTER S WITH DOT ABOVE
	"{\\d S}"                          : "\u1E62", // LATIN CAPITAL LETTER S WITH DOT BELOW
	"{\\d s}"                          : "\u1E63", // LATIN SMALL LETTER S WITH DOT BELOW
	"{\\.T}"                          : "\u1E6A", // LATIN CAPITAL LETTER T WITH DOT ABOVE
	"{\\.t}"                          : "\u1E6B", // LATIN SMALL LETTER T WITH DOT ABOVE
	"{\\d T}"                          : "\u1E6C", // LATIN CAPITAL LETTER T WITH DOT BELOW
	"{\\d t}"                          : "\u1E6D", // LATIN SMALL LETTER T WITH DOT BELOW
	"{\\b T}"                          : "\u1E6E", // LATIN CAPITAL LETTER T WITH LINE BELOW
	"{\\b t}"                          : "\u1E6F", // LATIN SMALL LETTER T WITH LINE BELOW
	"{\\~V}"                          : "\u1E7C", // LATIN CAPITAL LETTER V WITH TILDE
	"{\\~v}"                          : "\u1E7D", // LATIN SMALL LETTER V WITH TILDE
	"{\\d V}"                          : "\u1E7E", // LATIN CAPITAL LETTER V WITH DOT BELOW
	"{\\d v}"                          : "\u1E7F", // LATIN SMALL LETTER V WITH DOT BELOW
	"{\\`W}"                          : "\u1E80", // LATIN CAPITAL LETTER W WITH GRAVE
	"{\\`w}"                          : "\u1E81", // LATIN SMALL LETTER W WITH GRAVE
	"{\\'W}"                          : "\u1E82", // LATIN CAPITAL LETTER W WITH ACUTE
	"{\\'w}"                          : "\u1E83", // LATIN SMALL LETTER W WITH ACUTE
	"{\\\"W}"                         : "\u1E84", // LATIN CAPITAL LETTER W WITH DIAERESIS
	"{\\\"w}"                         : "\u1E85", // LATIN SMALL LETTER W WITH DIAERESIS
	"{\\.W}"                          : "\u1E86", // LATIN CAPITAL LETTER W WITH DOT ABOVE
	"{\\.w}"                          : "\u1E87", // LATIN SMALL LETTER W WITH DOT ABOVE
	"{\\d W}"                          : "\u1E88", // LATIN CAPITAL LETTER W WITH DOT BELOW
	"{\\d w}"                          : "\u1E89", // LATIN SMALL LETTER W WITH DOT BELOW
	"{\\.X}"                          : "\u1E8A", // LATIN CAPITAL LETTER X WITH DOT ABOVE
	"{\\.x}"                          : "\u1E8B", // LATIN SMALL LETTER X WITH DOT ABOVE
	"{\\\"X}"                         : "\u1E8C", // LATIN CAPITAL LETTER X WITH DIAERESIS
	"{\\\"x}"                         : "\u1E8D", // LATIN SMALL LETTER X WITH DIAERESIS
	"{\\.Y}"                          : "\u1E8E", // LATIN CAPITAL LETTER Y WITH DOT ABOVE
	"{\\.y}"                          : "\u1E8F", // LATIN SMALL LETTER Y WITH DOT ABOVE
	"{\\^Z}"                          : "\u1E90", // LATIN CAPITAL LETTER Z WITH CIRCUMFLEX
	"{\\^z}"                          : "\u1E91", // LATIN SMALL LETTER Z WITH CIRCUMFLEX
	"{\\d Z}"                          : "\u1E92", // LATIN CAPITAL LETTER Z WITH DOT BELOW
	"{\\d z}"                          : "\u1E93", // LATIN SMALL LETTER Z WITH DOT BELOW
	"{\\b Z}"                          : "\u1E94", // LATIN CAPITAL LETTER Z WITH LINE BELOW
	"{\\b z}"                          : "\u1E95", // LATIN SMALL LETTER Z WITH LINE BELOW
	"{\\b h}"                          : "\u1E96", // LATIN SMALL LETTER H WITH LINE BELOW
	"{\\\"t}"                         : "\u1E97", // LATIN SMALL LETTER T WITH DIAERESIS
	"{\\r w}"                          : "\u1E98", // LATIN SMALL LETTER W WITH RING ABOVE
	"{\\r y}"                          : "\u1e99", // LATIN SMALL LETTER Y WITH RING ABOVE
	"{\\d A}"                          : "\u1EA0", // LATIN CAPITAL LETTER A WITH DOT BELOW
	"{\\d a}"                          : "\u1EA1", // LATIN SMALL LETTER A WITH DOT BELOW
	"{\\d E}"                          : "\u1EB8", // LATIN CAPITAL LETTER E WITH DOT BELOW
	"{\\d e}"                          : "\u1EB9", // LATIN SMALL LETTER E WITH DOT BELOW
	"{\\~E}"                          : "\u1EBC", // LATIN CAPITAL LETTER E WITH TILDE
	"{\\~e}"                          : "\u1EBD", // LATIN SMALL LETTER E WITH TILDE
	"{\\d I}"                          : "\u1ECA", // LATIN CAPITAL LETTER I WITH DOT BELOW
	"{\\d i}"                          : "\u1ECB", // LATIN SMALL LETTER I WITH DOT BELOW
	"{\\d O}"                          : "\u1ECC", // LATIN CAPITAL LETTER O WITH DOT BELOW
	"{\\d o}"                          : "\u1ECD", // LATIN SMALL LETTER O WITH DOT BELOW
	"{\\d U}"                          : "\u1EE4", // LATIN CAPITAL LETTER U WITH DOT BELOW
	"{\\d u}"                          : "\u1EE5", // LATIN SMALL LETTER U WITH DOT BELOW
	"{\\`Y}"                          : "\u1EF2", // LATIN CAPITAL LETTER Y WITH GRAVE
	"{\\`y}"                          : "\u1EF3", // LATIN SMALL LETTER Y WITH GRAVE
	"{\\d Y}"                          : "\u1EF4", // LATIN CAPITAL LETTER Y WITH DOT BELOW
	"{\\d y}"                          : "\u1EF5", // LATIN SMALL LETTER Y WITH DOT BELOW
	"{\\~Y}"                          : "\u1EF8", // LATIN CAPITAL LETTER Y WITH TILDE
	"{\\~y}"                          : "\u1EF9", // LATIN SMALL LETTER Y WITH TILDE
	"{\\~}"                           : "\u223C", // TILDE OPERATOR
	"~"                               : "\u00A0" // NO-BREAK SPACE
};/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "@article{Adams2001,\nauthor = {Adams, Nancy K and DeSilva, Shanaka L and Self, Steven and Salas, Guido and Schubring, Steven and Permenter, Jason L and Arbesman, Kendra},\nfile = {:Users/heatherwright/Documents/Scientific Papers/Adams\\_Huaynaputina.pdf:pdf;::},\njournal = {Bulletin of Volcanology},\nkeywords = {Vulcanian eruptions,breadcrust,plinian},\npages = {493--518},\ntitle = {{The physical volcanology of the 1600 eruption of Huaynaputina, southern Peru}},\nvolume = {62},\nyear = {2001}\n}",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The physical volcanology of the 1600 eruption of Huaynaputina, southern Peru",
				"creators": [
					{
						"firstName": "Nancy K",
						"lastName": "Adams",
						"creatorType": "author"
					},
					{
						"firstName": "Shanaka L",
						"lastName": "DeSilva",
						"creatorType": "author"
					},
					{
						"firstName": "Steven",
						"lastName": "Self",
						"creatorType": "author"
					},
					{
						"firstName": "Guido",
						"lastName": "Salas",
						"creatorType": "author"
					},
					{
						"firstName": "Steven",
						"lastName": "Schubring",
						"creatorType": "author"
					},
					{
						"firstName": "Jason L",
						"lastName": "Permenter",
						"creatorType": "author"
					},
					{
						"firstName": "Kendra",
						"lastName": "Arbesman",
						"creatorType": "author"
					}
				],
				"date": "2001",
				"itemID": "Adams2001",
				"pages": "493–518",
				"publicationTitle": "Bulletin of Volcanology",
				"volume": "62",
				"attachments": [
					{
						"path": "Users/heatherwright/Documents/Scientific Papers/Adams_Huaynaputina.pdf",
						"mimeType": "application/pdf",
						"title": "Attachment"
					}
				],
				"tags": [
					"Vulcanian eruptions",
					"breadcrust",
					"plinian"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "@Book{abramowitz+stegun,\n author    = \"Milton {Abramowitz} and Irene A. {Stegun}\",\n title     = \"Handbook of Mathematical Functions with\n              Formulas, Graphs, and Mathematical Tables\",\n publisher = \"Dover\",\n year      =  1964,\n address   = \"New York\",\n edition   = \"ninth Dover printing, tenth GPO printing\"\n}\n\n@Book{Torre2008,\n author    = \"Joe Torre and Tom Verducci\",\n publisher = \"Doubleday\",\n title     = \"The Yankee Years\",\n year      =  2008,\n isbn      = \"0385527403\"\n}\n",
		"items": [
			{
				"itemType": "book",
				"title": "Handbook of Mathematical Functions with Formulas, Graphs, and Mathematical Tables",
				"creators": [
					{
						"firstName": "Milton",
						"lastName": "Abramowitz",
						"creatorType": "author"
					},
					{
						"firstName": "Irene A.",
						"lastName": "Stegun",
						"creatorType": "author"
					}
				],
				"date": "1964",
				"edition": "ninth Dover printing, tenth GPO printing",
				"itemID": "abramowitz+stegun",
				"place": "New York",
				"publisher": "Dover",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			},
			{
				"itemType": "book",
				"title": "The Yankee Years",
				"creators": [
					{
						"firstName": "Joe",
						"lastName": "Torre",
						"creatorType": "author"
					},
					{
						"firstName": "Tom",
						"lastName": "Verducci",
						"creatorType": "author"
					}
				],
				"date": "2008",
				"ISBN": "0385527403",
				"itemID": "Torre2008",
				"publisher": "Doubleday",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "@INPROCEEDINGS {author:06,\n title    = {Some publication title},\n author   = {First Author and Second Author},\n crossref = {conference:06},\n pages    = {330—331},\n}\n@PROCEEDINGS {conference:06,\n editor    = {First Editor and Second Editor},\n title     = {Proceedings of the Xth Conference on XYZ},\n booktitle = {Proceedings of the Xth Conference on XYZ},\n year      = {2006},\n month     = oct,\n}",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Some publication title",
				"creators": [
					{
						"firstName": "First",
						"lastName": "Author",
						"creatorType": "author"
					},
					{
						"firstName": "Second",
						"lastName": "Author",
						"creatorType": "author"
					}
				],
				"itemID": "author:06",
				"pages": "330—331",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			},
			{
				"itemType": "book",
				"title": "Proceedings of the Xth Conference on XYZ",
				"creators": [
					{
						"firstName": "First",
						"lastName": "Editor",
						"creatorType": "editor"
					},
					{
						"firstName": "Second",
						"lastName": "Editor",
						"creatorType": "editor"
					}
				],
				"date": "October 2006",
				"itemID": "conference:06",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "@Book{hicks2001,\n author    = \"von Hicks, III, Michael\",\n title     = \"Design of a Carbon Fiber Composite Grid Structure for the GLAST\n              Spacecraft Using a Novel Manufacturing Technique\",\n publisher = \"Stanford Press\",\n year      =  2001,\n address   = \"Palo Alto\",\n edition   = \"1st,\",\n isbn      = \"0-69-697269-4\"\n}",
		"items": [
			{
				"itemType": "book",
				"title": "Design of a Carbon Fiber Composite Grid Structure for the GLAST Spacecraft Using a Novel Manufacturing Technique",
				"creators": [
					{
						"firstName": "Michael, III",
						"lastName": "von Hicks",
						"creatorType": "author"
					}
				],
				"date": "2001",
				"ISBN": "0-69-697269-4",
				"edition": "1st,",
				"itemID": "hicks2001",
				"place": "Palo Alto",
				"publisher": "Stanford Press",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "@article{Oliveira_2009, title={USGS monitoring ecological impacts}, volume={107}, number={29}, journal={Oil & Gas Journal}, author={Oliveira, A}, year={2009}, pages={29}}",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "USGS monitoring ecological impacts",
				"creators": [
					{
						"firstName": "A",
						"lastName": "Oliveira",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"issue": "29",
				"itemID": "Oliveira_2009",
				"pages": "29",
				"publicationTitle": "Oil & Gas Journal",
				"volume": "107",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "@article{test-ticket1661,\ntitle={non-braking space: ~; accented characters: {\\~n} and \\~{n}; tilde operator: \\~},\n} ",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "non-braking space: ; accented characters: ñ and ñ; tilde operator: ∼",
				"creators": [],
				"itemID": "test-ticket1661",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "@ARTICLE{Frit2,\n  author = {Fritz, U. and Corti, C. and P\\\"{a}ckert, M.},\n  title = {Test of markupconversion: Italics, bold, superscript, subscript, and small caps: Mitochondrial DNA$_{\\textrm{2}}$ sequences suggest unexpected phylogenetic position\n        of Corso-Sardinian grass snakes (\\textit{Natrix cetti}) and \\textbf{do not}\n        support their \\textsc{species status}, with notes on phylogeography and subspecies\n        delineation of grass snakes.},\n  journal = {Actes du $4^{\\textrm{ème}}$ Congrès Français d'Acoustique},\n  year = {2012},\n  volume = {12},\n  pages = {71-80},\n  doi = {10.1007/s13127-011-0069-8}\n}\n",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Test of markupconversion: Italics, bold, superscript, subscript, and small caps: Mitochondrial DNA<sub>2</sub>$ sequences suggest unexpected phylogenetic position of Corso-Sardinian grass snakes (<i>Natrix cetti</i>) and <b>do not</b> support their <span style=\"small-caps\">species status</span>, with notes on phylogeography and subspecies delineation of grass snakes.",
				"creators": [
					{
						"firstName": "U.",
						"lastName": "Fritz",
						"creatorType": "author"
					},
					{
						"firstName": "C.",
						"lastName": "Corti",
						"creatorType": "author"
					},
					{
						"firstName": "M.",
						"lastName": "Päckert",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"DOI": "10.1007/s13127-011-0069-8",
				"itemID": "Frit2",
				"pages": "71-80",
				"publicationTitle": "Actes du <sup>ème</sup>$ Congrès Français d'Acoustique",
				"volume": "12",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "@misc{american_rights_at_work_public_2012,\n    title = {Public Service Research Foundation},\n\turl = {http://www.americanrightsatwork.org/blogcategory-275/},\n\turldate = {2012-07-27},\n\tauthor = {American Rights at Work},\n\tyear = {2012},\n\thowpublished = {http://www.americanrightsatwork.org/blogcategory-275/},\n}",
		"items": [
			{
				"itemType": "book",
				"title": "Public Service Research Foundation",
				"creators": [
					{
						"firstName": "American Rights at",
						"lastName": "Work",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"itemID": "american_rights_at_work_public_2012",
				"url": "http://www.americanrightsatwork.org/blogcategory-275/",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "@article{zoteroFilePath1,\n    title = {Zotero: single attachment},\n    file = {Test:files/47/test2.pdf:application/pdf}\n}\n\n@article{zoteroFilePaths2,\n    title = {Zotero: multiple attachments},\n    file = {Test1:files/47/test2.pdf:application/pdf;Test2:files/46/test2-min.pdf:application/pdf}\n}\n\n@article{zoteroFilePaths3,\n    title = {Zotero: linked attachments (old)},\n    file = {Test:E:\\some\\random\\folder\\test2.pdf:application/pdf}\n}\n\n@article{zoteroFilePaths4,\n    title = {Zotero: linked attachments},\n    file = {Test:E\\:\\\\some\\\\random\\\\folder\\\\test2.pdf:application/pdf}\n}\n\n@article{mendeleyFilePaths1,\n    title = {Mendeley: single attachment},\n    url = {https://forums.zotero.org/discussion/28347/unable-to-get-pdfs-stored-on-computer-into-zotero-standalone/},\n    file = {:C$\\backslash$:/Users/somewhere/AppData/Local/Mendeley Ltd./Mendeley Desktop/Downloaded/test.pdf:pdf}\n}\n\n@article{mendeleyFilePaths2,\ntitle = {Mendeley: escaped characters}\nfile = {:C$\\backslash$:/some/path/,.$\\backslash$;'[]\\{\\}`-=\\~{}!@\\#\\$\\%\\^{}\\&()\\_+.pdf:pdf},\n}\n\n@article{citaviFilePaths1,\n    title = {Citavi: single attachment},\n    url = {https://forums.zotero.org/discussion/35909/bibtex-import-from-citavi-including-pdf-attachments/},\n    file = {Test:Q\\:\\\\some\\\\random\\\\folder\\\\test.pdf:pdf}\n}",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Zotero: single attachment",
				"creators": [],
				"itemID": "zoteroFilePath1",
				"attachments": [
					{
						"title": "Test",
						"path": "files/47/test2.pdf",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Zotero: multiple attachments",
				"creators": [],
				"itemID": "zoteroFilePaths2",
				"attachments": [
					{
						"title": "Test1",
						"path": "files/47/test2.pdf",
						"mimeType": "application/pdf"
					},
					{
						"title": "Test2",
						"path": "files/46/test2-min.pdf",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Zotero: linked attachments (old)",
				"creators": [],
				"itemID": "zoteroFilePaths3",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Zotero: linked attachments",
				"creators": [],
				"itemID": "zoteroFilePaths4",
				"attachments": [
					{
						"title": "Test",
						"path": "E:\\some\\random\\folder\\test2.pdf",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Mendeley: single attachment",
				"creators": [],
				"itemID": "mendeleyFilePaths1",
				"url": "https://forums.zotero.org/discussion/28347/unable-to-get-pdfs-stored-on-computer-into-zotero-standalone/",
				"attachments": [
					{
						"title": "Attachment",
						"path": "C:/Users/somewhere/AppData/Local/Mendeley Ltd./Mendeley Desktop/Downloaded/test.pdf",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Mendeley: escaped characters",
				"creators": [],
				"itemID": "mendeleyFilePaths2",
				"attachments": [
					{
						"title": "Attachment",
						"path": "C:/some/path/,.;'[]{}`-=~!@#$%^&()_+.pdf",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Citavi: single attachment",
				"creators": [],
				"itemID": "citaviFilePaths1",
				"url": "https://forums.zotero.org/discussion/35909/bibtex-import-from-citavi-including-pdf-attachments/",
				"attachments": [
					{
						"title": "Test",
						"path": "Q:\\some\\random\\folder\\test.pdf",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "@article{BibTeXEscapeTest1,\n    title = {\textbackslash\textbackslash\\{\\}: \\\\{}}\n}",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "extbackslash extbackslash{}: {",
				"creators": [],
				"itemID": "BibTeXEscapeTest1",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "@article{sasson_increasing_2013,\n    title = {Increasing cardiopulmonary resuscitation provision in communities with low bystander cardiopulmonary resuscitation rates: a science advisory from the American Heart Association for healthcare providers, policymakers, public health departments, and community leaders},\n\tvolume = {127},\n\tissn = {1524-4539},\n\tshorttitle = {Increasing cardiopulmonary resuscitation provision in communities with low bystander cardiopulmonary resuscitation rates},\n\tdoi = {10.1161/CIR.0b013e318288b4dd},\n\tlanguage = {eng},\n\tnumber = {12},\n\tjournal = {Circulation},\n\tauthor = {Sasson, Comilla and Meischke, Hendrika and Abella, Benjamin S and Berg, Robert A and Bobrow, Bentley J and Chan, Paul S and Root, Elisabeth Dowling and Heisler, Michele and Levy, Jerrold H and Link, Mark and Masoudi, Frederick and Ong, Marcus and Sayre, Michael R and Rumsfeld, John S and Rea, Thomas D and {American Heart Association Council on Quality of Care and Outcomes Research} and {Emergency Cardiovascular Care Committee} and {Council on Cardiopulmonary, Critical Care, Perioperative and Resuscitation} and {Council on Clinical Cardiology} and {Council on Cardiovascular Surgery and Anesthesia}},\n\tmonth = mar,\n\tyear = {2013},\n\tnote = {{PMID:} 23439512},\n\tkeywords = {Administrative Personnel, American Heart Association, Cardiopulmonary Resuscitation, Community Health Services, Health Personnel, Heart Arrest, Humans, Leadership, Public Health, United States},\n\tpages = {1342--1350}\n}",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Increasing cardiopulmonary resuscitation provision in communities with low bystander cardiopulmonary resuscitation rates: a science advisory from the American Heart Association for healthcare providers, policymakers, public health departments, and community leaders",
				"creators": [
					{
						"firstName": "Comilla",
						"lastName": "Sasson",
						"creatorType": "author"
					},
					{
						"firstName": "Hendrika",
						"lastName": "Meischke",
						"creatorType": "author"
					},
					{
						"firstName": "Benjamin S",
						"lastName": "Abella",
						"creatorType": "author"
					},
					{
						"firstName": "Robert A",
						"lastName": "Berg",
						"creatorType": "author"
					},
					{
						"firstName": "Bentley J",
						"lastName": "Bobrow",
						"creatorType": "author"
					},
					{
						"firstName": "Paul S",
						"lastName": "Chan",
						"creatorType": "author"
					},
					{
						"firstName": "Elisabeth Dowling",
						"lastName": "Root",
						"creatorType": "author"
					},
					{
						"firstName": "Michele",
						"lastName": "Heisler",
						"creatorType": "author"
					},
					{
						"firstName": "Jerrold H",
						"lastName": "Levy",
						"creatorType": "author"
					},
					{
						"firstName": "Mark",
						"lastName": "Link",
						"creatorType": "author"
					},
					{
						"firstName": "Frederick",
						"lastName": "Masoudi",
						"creatorType": "author"
					},
					{
						"firstName": "Marcus",
						"lastName": "Ong",
						"creatorType": "author"
					},
					{
						"firstName": "Michael R",
						"lastName": "Sayre",
						"creatorType": "author"
					},
					{
						"firstName": "John S",
						"lastName": "Rumsfeld",
						"creatorType": "author"
					},
					{
						"firstName": "Thomas D",
						"lastName": "Rea",
						"creatorType": "author"
					},
					{
						"lastName": "American Heart Association Council on Quality of Care and Outcomes Research",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "Emergency Cardiovascular Care Committee",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "Council on Cardiopulmonary, Critical Care, Perioperative and Resuscitation",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "Council on Clinical Cardiology",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "Council on Cardiovascular Surgery and Anesthesia",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "March 2013",
				"DOI": "10.1161/CIR.0b013e318288b4dd",
				"ISSN": "1524-4539",
				"extra": "PMID: 23439512",
				"issue": "12",
				"itemID": "sasson_increasing_2013",
				"language": "eng",
				"pages": "1342–1350",
				"publicationTitle": "Circulation",
				"shortTitle": "Increasing cardiopulmonary resuscitation provision in communities with low bystander cardiopulmonary resuscitation rates",
				"volume": "127",
				"attachments": [],
				"tags": [
					"Administrative Personnel",
					"American Heart Association",
					"Cardiopulmonary Resuscitation",
					"Community Health Services",
					"Health Personnel",
					"Heart Arrest",
					"Humans",
					"Leadership",
					"Public Health",
					"United States"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "@article{smith_testing_????,\n    title = {Testing identifier import},\n\tauthor = {Smith, John},\n\tdoi = {10.12345/123456},\n\tlccn = {L123456},\n\tmrnumber = {MR123456},\n\tzmnumber = {ZM123456},\n\tpmid = {P123456},\n\tpmcid = {PMC123456},\n\teprinttype = {arxiv},\n\teprint = {AX123456}\n}",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Testing identifier import",
				"creators": [
					{
						"firstName": "John",
						"lastName": "Smith",
						"creatorType": "author"
					}
				],
				"DOI": "10.12345/123456",
				"extra": "LCCN: L123456\nMR: MR123456\nZbl: ZM123456\nPMID: P123456\nPMCID: PMC123456\narXiv: AX123456",
				"itemID": "smith_testing_????",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "@inbook{smith_testing_????,\n    title = {Testing identifier import chapter},\n\tauthor = {Smith, John},\n\tdoi = {10.12345/123456},\n\tlccn = {L123456},\n\tmrnumber = {MR123456},\n\tzmnumber = {ZM123456},\n\tpmid = {P123456},\n\tpmcid = {PMC123456},\n\teprinttype = {arxiv},\n\teprint = {AX123456}\n}",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Testing identifier import chapter",
				"creators": [
					{
						"firstName": "John",
						"lastName": "Smith",
						"creatorType": "author"
					}
				],
				"extra": "DOI: 10.12345/123456\nLCCN: L123456\nMR: MR123456\nZbl: ZM123456\nPMID: P123456\nPMCID: PMC123456\narXiv: AX123456",
				"itemID": "smith_testing_????",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "@mastersthesis{DBLP:ms/Hoffmann2008,\n  author    = {Oliver Hoffmann},\n  title     = {Regelbasierte Extraktion und asymmetrische Fusion bibliographischer\n               Informationen},\n  school    = {Diplomarbeit, Universit{\\\"{a}}t Trier, {FB} IV, {DBIS/DBLP}},\n  year      = {2009},\n  url       = {http://dblp.uni-trier.de/papers/DiplomarbeitOliverHoffmann.pdf},\n  timestamp = {Wed, 03 Aug 2011 15:40:21 +0200},\n  biburl    = {http://dblp.org/rec/bib/ms/Hoffmann2008},\n  bibsource = {dblp computer science bibliography, http://dblp.org}\n}\n\n@phdthesis{DBLP:phd/Ackermann2009,\n  author    = {Marcel R. Ackermann},\n  title     = {Algorithms for the Bregman k-Median problem},\n  school    = {University of Paderborn},\n  year      = {2009},\n  url       = {http://digital.ub.uni-paderborn.de/hs/content/titleinfo/1561},\n  urn       = {urn:nbn:de:hbz:466-20100407029},\n  timestamp = {Thu, 01 Dec 2016 16:33:49 +0100},\n  biburl    = {http://dblp.org/rec/bib/phd/Ackermann2009},\n  bibsource = {dblp computer science bibliography, http://dblp.org}\n}",
		"items": [
			{
				"itemType": "thesis",
				"title": "Regelbasierte Extraktion und asymmetrische Fusion bibliographischer Informationen",
				"creators": [
					{
						"firstName": "Oliver",
						"lastName": "Hoffmann",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"itemID": "DBLP:ms/Hoffmann2008",
				"thesisType": "Master's Thesis",
				"university": "Diplomarbeit, Universität Trier, FB IV, DBIS/DBLP",
				"url": "http://dblp.uni-trier.de/papers/DiplomarbeitOliverHoffmann.pdf",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			},
			{
				"itemType": "thesis",
				"title": "Algorithms for the Bregman k-Median problem",
				"creators": [
					{
						"firstName": "Marcel R.",
						"lastName": "Ackermann",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"itemID": "DBLP:phd/Ackermann2009",
				"thesisType": "PhD Thesis",
				"university": "University of Paderborn",
				"url": "http://digital.ub.uni-paderborn.de/hs/content/titleinfo/1561",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
