{
	"translatorID": "1a3506da-a303-4b0a-a1cd-f216e6138d86",
	"label": "RefWorks Tagged",
	"creator": "Simon Kornblith, Aurimas Vinckevicius, and Sebastian Karcher",
	"target": "txt",
	"minVersion": "3.0.4",
	"maxVersion": "",
	"priority": 100,
	"displayOptions": {
		"exportCharset": "UTF-8",
		"exportNotes": true,
		"exportFileData": true
	},
	"inRepository": true,
	"translatorType": 3,
	"browserSupport": "gcsv",
	"lastUpdated": "2016-06-21 08:45:20"
}

/*This Translator mirrors closely Aurimas Vinckevicius' RIS translator
It may have several relics from that translator that aren't necessary for Refworks,
but since the formats are similar and having them in the translator won't hurt, I maintained them. 
Most commenting also refers to RIS
The specifications are here:
http://www.refworks.com/refworks2/help/RefWorks_Tagged_Format.htm
*/

function detectImport() {
	var line;
	var i = 0;
	while ((line = Zotero.read()) !== false) {
		line = line.replace(/^\s+/, "");
		if (line != "") {
			if (line.search(/^RT\s+./) != -1) {
				return true;
			} else {
				if (i++ > 150) { //skip preamble
					return false;
				}
			}
		}
	}
}

/********************
 * Exported options *
 ********************/
 var exportedOptions = {
	itemType: false //allows translators to supply item type
};


/************************
 * RT <-> itemType maps *
 ************************/

var DEFAULT_EXPORT_TYPE = 'Generic';
var DEFAULT_IMPORT_TYPE = 'journalArticle';

var exportTypeMap = {
	artwork:"Artwork",
	audioRecording:"Sound Recording", //consider MUSIC
	bill:"Bills",
	blogPost:"Web Page",
	book:"Book, Whole",
	bookSection:"Book, Section",
	"case":"Case",
	computerProgram:"Computer Program",
	conferencePaper:"Conference Proceedings",
	email:"Personal Communication",
	film:"Motion Picture",
	forumPost:"Online Discussion Forum",
	hearing:"Hearing",
	journalArticle:"Journal Article",
	letter:"Personal Communication",
	magazineArticle:"Magazine Article",
	manuscript:"Unpublished Material",
	map:"Map",
	newspaperArticle:"Newspaper Article",
	patent:"Patent",
	report:"Report",
	statute:"Statutes",
	thesis:"Dissertation",
	videoRecording:"Video",
	webpage:"Web Page"
};

//These export type maps are degenerate
//They will cause loss of information when exported and reimported
//These should either be duplicates of some of the RW types above
//  or be different from the importTypeMap mappings
var degenerateExportTypeMap = {
	interview:"Personal Communication",
	instantMessage:"Personal Communication",
	tvBroadcast:"Motion Picture",
	radioBroadcast:"Sound Recording",
	presentation:"Report",
	podcast:"Sound Recording",
	dictionaryEntry:"Book, Section",
	encyclopediaArticle:"Book, Section",
	document:"Generic" //imported as journalArticle
};

//These are degenerate types that are not exported as the same TY value
//These should not include any types from exportTypeMap
//We add the rest from exportTypeMap
var importTypeMap = {
	Abstract:"journalArticle",
	"Book, Edited":"book",
	"Court Decisions":"case",
	DVD:"videoRecording",
	Grant:"report", 
	"Journal, Electronic":"journalArticle",
	Laws:"statute",
	Monograph:"book",
	"Music Score":"audioRecording",
	Resolutions:"bill",
	"Thesis, Unpublished":"thesis",
	Thesis:"thesis"
};


//supplement input map with export
var ty;
for (ty in exportTypeMap) {
	importTypeMap[exportTypeMap[ty]] = ty;
}

//merge degenerate export type map into main list
for (ty in degenerateExportTypeMap) {
	exportTypeMap[ty] = degenerateExportTypeMap[ty];
}

/*****************************
 * Tag <-> zotero field maps *
 *****************************/

//used for exporting and importing
//this ensures that we can mostly reimport everything the same way
//(except for item types that do not have unique RW types, see above)
var fieldMap = {
	//same for all itemTypes
	AB:"abstractNote",
	CN:"callNumber",
	DO:"DOI",
	SL:"archive",
	LL:"archiveLocation",
	IS:"issue",
	JO:"journalAbbreviation",
	K1:"tags",
	LK:"attachments/other",
	NO:"notes",
	ST:"shortTitle",
	RD:"accessDate",
	UL:"url",


	//type specific
	//tag => field:itemTypes
	//if itemType not explicitly given, __default field is used
	//  unless itemType is excluded in __exclude
	T1: {
		"__default":"title",
		subject:["email"],
		caseName:["case"],
		nameOfAct:["statute"]
	},
	T2: {
		code:["bill", "statute"],
		bookTitle:["bookSection"],
		blogTitle:["blogPost"],
		conferenceName:["conferencePaper"],
		dictionaryTitle:["dictionaryEntry"],
		encyclopediaTitle:["encyclopediaArticle"],
		committee:["hearing"],
		forumTitle:["forumPost"],
		websiteTitle:["webpage"],
		programTitle:["radioBroadcast", "tvBroadcast"],
		meetingName:["presentation"],
		seriesTitle:["computerProgram", "map", "report"],
		series: ["book"],
		publicationTitle:["journalArticle", "magazineArticle", "newspaperArticle"]
	},
	T3: {
		legislativeBody:["hearing", "bill"],
		series:["bookSection", "conferencePaper"],
		seriesTitle:["audioRecording"]
	},
	//NOT HANDLED: reviewedAuthor, scriptwriter, contributor, guest
	A1: {
		"__default":"creators/author",
		"creators/artist":["artwork"],
		"creators/cartographer":["map"],
		"creators/composer":["audioRecording"],
		"creators/director":["film", "radioBroadcast", "tvBroadcast", "videoRecording"], //this clashes with audioRecording
		"creators/interviewee":["interview"],
		"creators/inventor":["patent"],
		"creators/podcaster":["podcast"],
		"creators/programmer":["computerProgram"]
	},
	A2: {
		"creators/sponsor":["bill"],
		"creators/performer":["audioRecording"],
		"creators/presenter":["presentation"],
		"creators/interviewer":["interview"],
		"creators/editor":["journalArticle", "bookSection", "conferencePaper", "dictionaryEntry", "document", "encyclopediaArticle"],
		"creators/seriesEditor":["book"],
		"creators/recipient":["email", "instantMessage", "letter"],
		reporter:["case"],
		issuingAuthority:["patent"]
	},
	A3: {
		"creators/cosponsor":["bill"],
		"creators/producer":["film", "tvBroadcast", "videoRecording", "radioBroadcast"],
		"creators/editor":["book"],
		"creators/seriesEditor":["bookSection", "conferencePaper", "dictionaryEntry", "encyclopediaArticle", "map", "report"]
	},
	A4: {
		"__default":"creators/translator",
		"creators/counsel":["case"],
		"creators/contributor":["conferencePaper", "film"]	//translator does not fit these
	},
	U1: {
		filingDate:["patent"], //not in spec
		"creators/castMember":["radioBroadcast", "tvBroadcast", "videoRecording"],
		scale:["map"],
		place:["conferencePaper"]
	},
	U2: {
		issueDate:["patent"], //not in spec
		"creators/bookAuthor":["bookSection"],
		"creators/commenter":["blogPost"]
	},
	U3: {
		artworkSize:["artwork"],
		proceedingsTitle:["conferencePaper"],
		country:["patent"]
	},
	U4: {
		"creators/wordsBy":["audioRecording"], //not in spec
		"creators/attorneyAgent":["patent"],
		genre:["film"]
	},
	U5: {
		references:["patent"],
		audioRecordingFormat:["audioRecording", "radioBroadcast"],
		videoRecordingFormat:["film", "tvBroadcast", "videoRecording"]
	},	
	U6: {
		legalStatus:["patent"],
	},
	PP: {
		"__default":"place",
		"__exclude":["conferencePaper"] //should be exported as C1
	},
	FD: {
		"__default":"date",
		dateEnacted:["statute"],
		dateDecided:["case"],
		issueDate:["patent"]
	},
	ED: {
		"__default":"edition",
		session:["bill", "hearing", "statute"],
		version:["computerProgram"]
	},
	LA: {
		"__default":"language",
		programmingLanguage: ["computerProgram"]
	},
	CL: {
		billNumber:["bill"],
		system:["computerProgram"],
		documentNumber:["hearing"],
		applicationNumber:["patent"],
		publicLawNumber:["statute"],
		episodeNumber:["podcast", "radioBroadcast", "tvBroadcast"],
		manuscriptType:["manuscript"],
		mapType:["map"],
		reportType:["report"],
		thesisType:["thesis"],
		websiteType:["blogPost", "webpage"],
		postType:["forumPost"],
		letterType:["letter"],
		interviewMedium:["interview"],
		presentationType:["presentation"],
		artworkMedium:["artwork"],
		audioFileType:["podcast"]
	},
	PB: {
		"__default":"publisher",
		label:["audioRecording"],
		court:["case"],
		distributor:["film"],
		assignee:["patent"],
		institution:["report"],
		university:["thesis"],
		company:["computerProgram"],
		studio:["videoRecording"],
		network:["radioBroadcast", "tvBroadcast"]
	},
	YR: { //duplicate of DA, but this will only output year
		"__default":"date",
		dateEnacted:["statute"],
		dateDecided:["case"],
		issueDate:["patent"]
	},
	SN: {
		"__default":"ISBN",
		ISSN:["journalArticle", "magazineArticle", "newspaperArticle"],
		patentNumber:["patent"],
		reportNumber:["report"],
	},
	SP: {
		"__default":"pages", //needs extra processing
		codePages:["bill"], //bill
		numPages:["book", "thesis", "manuscript"], //manuscript not really in spec
		firstPage:["case"],
		runningTime:["film"]
	},
	VO: {
		"__default":"volume",
		codeNumber:["statute"],
		codeVolume:["bill"],
		reporterVolume:["case"],
		"__exclude":["patent"]
	}
};

//non-standard or degenerate field maps
//used ONLY for importing and only if these fields are not specified above (e.g. M3)
//these are not exported the same way
var degenerateImportFieldMap = {
	OP: "pages",
	JF: "publicationTitle",
	JO: {
		"__default": "journalAbbreviation",
		conferenceName: ["conferencePaper"]
	},
	T2: "backupPublicationTitle", //most item types should be covered above
	T3: {
		series: ["book"]
	}
};

//generic tag mapping object with caching
//not intended to be used directly
var TagMapper = function(mapList) {
	this.cache = {};
	this.mapList = mapList;
};

TagMapper.prototype.getFields = function(itemType, tag) {
	if (!this.cache[itemType]) this.cache[itemType] = {};

	//retrieve from cache if available
	if (this.cache[itemType][tag]) {
		return this.cache[itemType][tag];
	}

	var fields = [];
	for (var i=0, n=this.mapList.length; i<n; i++) {
		var map = this.mapList[i];
		var field;
		if (typeof(map[tag]) == 'object') {
			var def, exclude = false;
			for (var f in map[tag]) {
				if (f == "__default") {
					def = map[tag][f];
					continue;
				}

				if (f == "__exclude") {
					if (map[tag][f].indexOf(itemType) != -1) {
						exclude = true;
					}
					continue;
				}

				if (map[tag][f].indexOf(itemType) != -1) {
					field = f;
				}
			}

			if (!field && def && !exclude) field = def;
		} else if (typeof(map[tag]) == 'string') {
			field = map[tag];
		}

		if (field) fields.push(field);
	}

	this.cache[itemType][tag] = fields;

	return fields;
};

/********************
 * Import Functions *
 ********************/

//set up import field mapping
var importFields = new TagMapper([fieldMap, degenerateImportFieldMap]);

function processTag(item, entry) {
	var tag = entry[1];
	var value = entry[2].trim();
	var rawLine = entry[0];

	var zField = importFields.getFields(item.itemType, tag)[0];
	if (!zField) {
		Z.debug("Unknown field " + tag + " in entry :\n" + rawLine);
		zField = 'unknown'; //this will result in the value being added as note
	}

	//drop empty fields
	if (value === "" || !zField) return;

	zField = zField.split('/');

	if (tag != "NO" && tag != "AB") {
		value = Zotero.Utilities.unescapeHTML(value);
	}

	//tag based manipulations
	var processFields = true; //whether we should continue processing by zField
	switch (tag) {
		case "NO":
			//EndNote duplicates title in the note field sometimes maybe so does RW
			if (item.title == value) {
				value = undefined;
			//do some HTML formatting in non-HTML notes
			} else if (!value.match(/<[^>]+>/)) { //from cleanTags
				value = '<p>'
					+ value.replace(/\n\n/g, '</p><p>')
					 .replace(/\n/g, '<br/>')
					 .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
					 .replace(/  /g, '&nbsp;&nbsp;')
					+ '</p>';
			}
		break;
		case "OP":
			if (item.pages) {
				if (item.pages.indexOf('-') == -1) {
					item.pages = item.pages + '-' + value;
				} else {
					item.backupNumPages = value;
				}
				value = undefined;
			} else {
				item.backupEndPage = value;	//store this for an odd case where SP comes after OP
				value = undefined;
			}
		break;
		//See how YR works compared to other date formats
		case "YR":
			item.backupDate = {
				field: zField,
				value: dateRWtoZotero(value)
			};
			value = undefined;
			processFields = false;
		break;
	}

	//zField based manipulations
	if (processFields){
		switch (zField[0]) {
			case "backupPublicationTitle":
				item.backupPublicationTitle = value;
				value = undefined;
			break;
			case "creators":
				var creator = value.split(/\s*,\s*/);
				value = {lastName: creator[0], firstName:creator[1], creatorType:zField[1]};
			break;
			case "date":
			case "accessDate":
			case "filingDate":
			case "issueDate":
			case "dateEnacted":
			case "dateDecided":
				value = dateRWtoZotero(value);
			break;
			case "tags":
				//allow new lines or semicolons. Commas, might be more problematic
				value = value.split(/\s*(?:[\r\n]+\s*)+|\s*(?:;\s*)+/);

				//the regex will take care of double semicolons and newlines
				//but it will still allow a blank tag if there is a newline or
				//semicolon at the begining or the end
				if (!value[0]) value.shift();
				if (value.length && !value[value.length-1]) value.pop();

				if (!value.length) {
					value = undefined;
				}
			break;
			case "notes":
				value = {note:value};
				//we can specify note title in the field mapping table. See VL for patent
				if (zField[1]) {
					value.note = zField[1] + ': ' + value.note;
				}
			break;
			case "attachments":
				var domain = value.match(/^https?:\/\/([^\/]+)/i);
				domain = domain ? domain[1] + ' ' : '';
				value = {
					path:value,
					title: domain + 'Link',
					mimeType: 'text/html'
				};
			break;
			case "unsupported":	//unsupported fields
				//we can convert a RIS tag to something more useful though
				if (zField[1]) {
					value = zField[1] + ': ' + value;
				}
			break;
		}
	}

	applyValue(item, zField[0], value, rawLine);
}

function applyValue(item, zField, value, rawLine) {
	if (!value) return;

	if (!zField || zField == 'unknown') {
		if (!Zotero.parentTranslator) {
			Z.debug("Entry stored as note: " + rawLine);
			item.unknownFields.push(rawLine);
		}
		return;
	}

	if (zField == 'unsupported') {
		if (!Zotero.parentTranslator) {
			Z.debug("Unsupported field will be stored in note: " + value);
			item.unsupportedFields.push(value);
		}
		return;
	}

	//check if field is valid for item type
	if (zField != 'creators' && zField != 'tags' && zField != 'notes'
		&& zField != 'attachments'
		&& !ZU.fieldIsValidForType(zField, item.itemType)) {
		Z.debug("Invalid field '" + zField + "' for item type '" + item.itemType + "'.");
		if (!Zotero.parentTranslator) {
			Z.debug("Entry stored in note: " + rawLine);
			item.unknownFields.push(rawLine);
			return;
		}
		//otherwise, we can still store them and they will get dropped automatically
	}

	//special processing for certain fields
	switch (zField) {
		case 'notes':
		case 'attachments':
		case 'creators':
		case 'tags':
			if (!(value instanceof Array)) {
				value = [value];
			}
			item[zField] = item[zField].concat(value);
		break;
		case 'extra':
			if (item.extra) {
				item.extra += '; ' + value;
			} else {
				item.extra = value;
			}
		break;
		default:
			//check if value already exists
			if (item[zField]) {
				//if it's not the new value is not the same as existing value, store it as note
				if (!Zotero.parentTranslator && item[zField] != value) {
					item.notes.push({note:rawLine});
				}
			} else {
				item[zField] = value;
			}
	}
}

function dateRWtoZotero(risDate) {
	var value = risDate.split(/\s*\/\s*(?:0*(?=\d))?/);	//and also drop leading 0s
	if (value.length == 1) {
		return risDate;
	}

	//sometimes unknown parts of date are given as 0. Drop these and anything that follows
	var i;
	for (i=0; i<3; i++) {
		if (!value[i] || !parseInt(value[i], 10)) {
			break;
		}
	}
	for (; i<3; i++) {
		value[i] = undefined;
	}

	//adjust month (it's 0 based)
	if (value[1]) {
		value[1] = parseInt(value[1], 10);
		if (value[1]) value[1]--;
	}
	return ZU.formatDate({
			'year': value[0],
			'month': value[1],
			'day': value[2],
			'part': value[3]
		});
}

function completeItem(item) {
	// if backup publication title exists but not proper, use backup
	// (hack to get newspaper titles from EndNote)
	if (item.backupPublicationTitle) {
		if (!item.publicationTitle) {
			item.publicationTitle = item.backupPublicationTitle;
		}
		item.backupPublicationTitle = undefined;
	}

	if (item.backupNumPages) {
		if (!item.numPages) {
			item.numPages = item.backupNumPages;
		}
		item.backupNumPages = undefined;
	}

	if (item.backupEndPage) {
		if (!item.pages) {
			item.pages = item.backupEndPage;
		} else if (item.pages.indexOf('-') == -1) {
			item.pages += '-' + item.backupEndPage;
		} else if (!item.numPages) {	//should we do this?
			item.numPages = item.backupEndPage;
		}
		item.backupEndPage = undefined;
	}

	//see if we have a backup date
	if (item.backupDate) {
		if (!item[item.backupDate.field]) {
			item[item.backupDate.field] = item.backupDate.value;
		}
		//in RW the freeform date field seems to often lack the year - take that from the year field.
		else if (item[item.backupDate.field].search(/\d{4}/) == -1){
			item[item.backupDate.field] = item[item.backupDate.field] + " " + item.backupDate.value;
		}
		item.backupDate = undefined;
	}

	// Clean up DOI
	if (item.DOI) {
		item.DOI = ZU.cleanDOI(item.DOI);
	}

	// hack for sites like Nature, which only use JA, journal abbreviation
	if (item.journalAbbreviation && !item.publicationTitle){
		item.publicationTitle = item.journalAbbreviation;
	}

	// Hack for Endnote exports missing full title
	if (item.shortTitle && !item.title){
		item.title = item.shortTitle;
	}

	//if we only have one tag, try splitting it by comma
	//odds of this this backfiring are pretty low
	if (item.tags.length == 1) {
		item.tags = item.tags[0].split(/\s*(?:,\s*)+/);
		if (!item.tags[0]) item.tags.shift();
		if (item.tags.length && !item.tags[item.tags.length-1]) item.tags.pop();
	}

	//don't pass access date if this is called from (most likely) a web translator
	if (Zotero.parentTranslator) {
		item.accessDate = undefined;
	}

//store unsupported and unknown fields in a single note
	if (!Zotero.parentTranslator) {
		var note = '';
		for (var i=0, n=item.unsupportedFields.length; i<n; i++) {
			note += item.unsupportedFields[i] + '<br/>';
		}
		for (var i=0, n=item.unknownFields.length; i<n; i++) {
			note += item.unknownFields[i] + '<br/>';
		}
	
		if (note) {
			note = "The following values have no corresponding Zotero field:<br/>" + note;
			item.notes.push({note: note.trim(), tags: ['_RW import']});
		}
	}
	item.unsupportedFields = undefined;
	item.unknownFields = undefined;
	
	item.complete();
}

//get the next RW entry that matches the RW format
//returns an array in the format [raw "line", tag, value]
//lines may be combined into one entry
var RW_format = /^([A-Z][A-Z0-9]) (?:(.*))?$/; //allow empty entries
function getLine() {
	var entry, lastLineLength;
	if (getLine.buffer) {
		entry = getLine.buffer.match(RW_format); //this should always match
		if (entry[2] === undefined) entry[2] = '';
		lastLineLength = entry[2].length;
		getLine.buffer = undefined;
	}

	var nextLine, temp;
	while ((nextLine = Zotero.read()) !== false) {
		temp = nextLine.match(RW_format);
		if (temp && temp[2] === undefined) temp[2] = '';
		//if we are already processing an entry, then this is the next entry
		//store this line for later and return
		if (temp && entry) {
			getLine.buffer = temp[0];
			return entry;

		//otherwise this is a new entry
		} else if (temp) {
			entry = temp;
			lastLineLength = entry[2].length;

		//if this line didn't match, then we just attach it to the current value
		//Try to figure out if this is supposed to be on a new line or not
		} else if (entry) {
			//new lines would probably only be meaningful in notes and abstracts
			if (entry[1] == 'AB' || entry[1] == 'NO') {
				//if previous line was short, this would probably be on a new line
				//Might consider looking for periods and capital letters
				if (lastLineLength < 60) {
					nextLine = "\r\n" + nextLine;
				}
			}

			//don't remove new lines from keywords
			if (entry[1] == 'K1') {
				nextLine = "\r\n" + nextLine;
			}

			//check if we need to add a space
			if (entry[2].substr(entry[2].length-1) != ' ') {
				nextLine = ' ' + nextLine;
			}

			entry[0] += nextLine;
			entry[2] += nextLine;
		}
	}

	return entry;
}

//creates a new item of specified type
function getNewItem(type) {
	var item = new Zotero.Item(type);
			item.unknownFields = [];
			item.unsupportedFields = [];
	return item;
}

function doImport(attachments){
	var entry;
	//skip to the first RT entry
	do {
		entry = getLine();
	} while (entry && entry[1] != 'RT');

	var item;
	var i = -1; //item counter for attachments
	while (entry) {
		switch (entry[1]) {
			//new item
			case 'RT':
				if (item) completeItem(item);
				var type = exportedOptions.itemType || importTypeMap[entry[2].trim()];
				if (!type) {
					type = DEFAULT_IMPORT_TYPE;
					Z.debug("Unknown RW item type: " + entry[2] + ". Defaulting to " + type);
				}
				var item = getNewItem(type);
				//add attachments
				i++;
				if (attachments && attachments[i]) {
					item.attachments = attachments[i];
				}
			break;
			default:
				processTag(item, entry);
		}
		entry = getLine();
	}
	if (item) completeItem(item);
}

/********************
 * Export Functions *
 ********************/

//[Not sure if this is true for RW but doesn't hurt] RW files have a certain structure, which is often meaningful
//Records always start with RT. This is hardcoded below
var exportOrder = {
	"__default": ["T1", "A1", "T2", "A2", "T3", "A3", "A4", "AB", "U1", "U2", "U3",
	"U4", "U5", "U6", "CN", "PP", "FD", "YR", "DO", "SL", "LL", "ED", "VO", "IS", "SP", "OP,",
	"JO", "LA", "CL",  "PB",  "SN", "ST", "UL", "RD", "LK", "NO", "K1"],
	//in bill sponsor (A2) and cosponsor (A3) should be together and not split by legislativeBody (T3)
	"bill": ["T1", "A1", "T2", "A2", "A3", "T3", "A4", "AB", "U1", "U2", "U3",
	"U4", "U5", "U6", "CN", "PP", "FD", "YR", "DO", "SL", "LL", "ED", "VO", "IS", "SP", "OP",
	"JO", "LA", "CL",  "PB", "SN", "ST", "UL", "RD", "LK", "NO", "K1"]
};

var newLineChar = "\r\n"; //from spec

//set up export field mapping
var exportFields = new TagMapper([fieldMap]);

function addTag(tag, value) {
	if (!(value instanceof Array)) value = [value];

	for (var i=0, n=value.length; i<n; i++) {
		if (value[i] === undefined) return;
		//don't export empty strings
		var v = (value[i] + '').trim();
		if (!v) continue;

		Zotero.write(tag + " " + v + newLineChar);
	}
}

function doExport() {
	var item, order, tag, fields, field, value;

	while (item = Zotero.nextItem()) {
		// can't store independent notes in RW
		if (item.itemType == "note" || item.itemType == "attachment") {
			continue;
		}

		// type
		var type = exportTypeMap[item.itemType];
		if (!type) {
			type = DEFAULT_EXPORT_TYPE;
			Z.debug("Unknown item type: " + item.itemType + ". Defaulting to " + type);
		}
		addTag("RT", type);

		//before we begin, pre-sort attachments based on type
		var attachments = {
			PDF: [],
			HTML: [],
			other: []
		};

		for (var i=0, n=item.attachments.length; i<n; i++) {
			switch (item.attachments[i].mimeType) {
				case 'application/pdf':
					attachments.PDF.push(item.attachments[i]);
				break;
				case 'text/html':
					attachments.HTML.push(item.attachments[i]);
				break;
				default:
					attachments.other.push(item.attachments[i]);
			}
		}

		order = exportOrder[item.itemType] || exportOrder["__default"];
		for (var i=0, n=order.length; i<n; i++) {
			tag = order[i];
			//find the appropriate field to export for this item type
			field = exportFields.getFields(item.itemType, tag)[0];

			//if we didn't get anything, we don't need to export this tag for this item type
			if (!field) continue;

			value = undefined;
			//we can define fields that are nested (i.e. creators) using slashes
			field = field.split('/');

			//handle special cases based on item field
			switch (field[0]) {
				case "creators":
					//according to spec, one author per line in the "Lastname, Firstname, Suffix" format
					//Zotero does not store suffixes in a separate field
					value = [];
					var name;
					for (var j=0, m=item.creators.length; j<m; j++) {
						name = [];
						if (item.creators[j].creatorType == field[1]) {
							name.push(item.creators[j].lastName);
							if (item.creators[j].firstName) name.push(item.creators[j].firstName);
							value.push(name.join(', '));
						}
					}
					if (!value.length) value = undefined;
				break;
				case "notes":
					value = item.notes.map(function(n) { return n.note.replace(/(?:\r\n?|\n)/g, "\r\n"); });
				break;
				case "tags":
					value = item.tags.map(function(t) { return t.tag; });
				break;
				case "attachments":
					value = [];
					var att = attachments[field[1]];
					for (var j=0, m=att.length; j<m; j++) {
						if (att[j].saveFile) {	//local file
							value.push(att[j].defaultPath);
							att[j].saveFile(att[j].defaultPath);
						} else {	//link to remote file
							value.push(att[j].url);
						}
					}
				break;
				case "pages":
					if (tag == "SP" && item.pages) {
						var m = item.pages.trim().match(/(.+?)[\u002D\u00AD\u2010-\u2015\u2212\u2E3A\u2E3B\s]+(.+)/);
						if (m) {
							addTag(tag, m[1]);
							tag = "OP";
							value = m[2];
						}
					}
				break;
				default:
					value = item[field];
			}

			//handle special cases based on RW tag
			switch (tag) {
				case "YR":
					var date = ZU.strToDate(item[field]);
					if (date.year) {
						value = ('000' + date.year).substr(-4); //since this is in export, this should not be a problem with MS JavaScript implementation of substr
					} else {
						value = item[field];
					} 
				break;
				case "RD":
					var date = ZU.strToDate(item[field]);
					if (date.year) {
						date.year = ('000' + date.year).substr(-4);
						date.month = (date.month || date.month===0 || date.month==="0")?('0' + (date.month+1)).substr(-2):'';
						date.day = date.day?('0' + date.day).substr(-2):'';
						if (!date.part) date.part = '';
	
						value = date.year + '/' + date.month + '/' + date.day + '/' + date.part;
					} else {
						value = item[field];
					}
				break;
			}

			addTag(tag, value);
		}

		Zotero.write(newLineChar + newLineChar);
	}
}

var exports = {
	"doExport": doExport,
	"doImport": doImport,
	"options": exportedOptions
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "RT Book, Section\nSR Electronic(1)\nID 206\nA1 Stansfeld,Stephen\nA1 Fuhrer,Rebecca\nT1 Depression and coronary heart disease\nYR 2002\nVO 1\nIS 3\nSP 101\nOP 123\nK1 Etiology\nK1 Heart Disorders\nK1 Major Depression\nK1 Psychosocial Factors\nK1 Risk Factors\nK1 Anxiety\nK1 Prediction\nK1 coronary heart disease\nK1 psychosocial risk factors\nK1 Plants Red Blue\nAB (From the chapter) This chapter discusses the evidence for the proposition that depression is an aetiological factor in coronary heart disease, and 2 of the possible pathways by which this might occur: 1 in which social factors predict coronary heart disease, and depression and its associated psychophysiological changes are an intervening step; and the 2nd in which social factors predict coronary heart disease and depression, but depression is not on the pathway. This is followed by a discussion of anxiety as an aetiological factor in coronary heart disease. ( PsycINFO Database Record ( c) 2002 APA, all rights reserved)\nNO Williston, VT, US: BMJ Books. xi, 304 pp.; PO: Human; FE: References; TA: Psychology: Professional & Research; UD: 20020306; A1: 20020306\nA2 Gulford, C.T.\nT2 Stress and the heart: Psychosocial pathways to coronary heart disease\nPB BMJ Books\nPP Williston, VT, US\nSN 0727912771 (paperback)\nAD U London, Queen Mary's School of Medicine & Dentistry, London, England\nAN 2002-00714-006\nLA English\nCL 3200 Psychological & Physical Disorders\nOL English (30)",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Depression and coronary heart disease",
				"creators": [
					{
						"lastName": "Stansfeld",
						"firstName": "Stephen",
						"creatorType": "author"
					},
					{
						"lastName": "Fuhrer",
						"firstName": "Rebecca",
						"creatorType": "author"
					},
					{
						"lastName": "Gulford",
						"firstName": "C.T.",
						"creatorType": "editor"
					}
				],
				"date": "2002",
				"ISBN": "0727912771 (paperback)",
				"abstractNote": "(From the chapter) This chapter discusses the evidence for the proposition that depression is an aetiological factor in coronary heart disease, and 2 of the possible pathways by which this might occur: 1 in which social factors predict coronary heart disease, and depression and its associated psychophysiological changes are an intervening step; and the 2nd in which social factors predict coronary heart disease and depression, but depression is not on the pathway. This is followed by a discussion of anxiety as an aetiological factor in coronary heart disease. ( PsycINFO Database Record ( c) 2002 APA, all rights reserved)",
				"bookTitle": "Stress and the heart: Psychosocial pathways to coronary heart disease",
				"language": "English",
				"pages": "101-123",
				"place": "Williston, VT, US",
				"publisher": "BMJ Books",
				"volume": "1",
				"attachments": [],
				"tags": [
					"Anxiety",
					"Etiology",
					"Heart Disorders",
					"Major Depression",
					"Plants Red Blue",
					"Prediction",
					"Psychosocial Factors",
					"Risk Factors",
					"coronary heart disease",
					"psychosocial risk factors"
				],
				"notes": [
					{
						"note": "<p>Williston, VT, US: BMJ Books. xi, 304 pp.; PO: Human; FE: References; TA: Psychology: Professional & Research; UD: 20020306; A1: 20020306</p>"
					},
					{
						"note": "The following values have no corresponding Zotero field:<br/>SR Electronic(1)<br/>ID 206<br/>IS 3<br/>AD U London, Queen Mary's School of Medicine & Dentistry, London, England<br/>AN 2002-00714-006<br/>CL 3200 Psychological & Physical Disorders<br/>OL English (30)<br/>",
						"tags": [
							"_RW import"
						]
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "RT Dissertation\nSR Electronic(1)\nID 2118\nA1 Catrambone, C.D.\nT1 Effect of a case management intervention on symptoms of asthma in high risk children\nYR 2000\nSP 141\nK1 Case Management Asthma -- Therapy -- In Infancy and Childhood Treatment Outcomes -- In Infancy and Childhood (Minor): Prospective Studies Comparative Studies Infant Child Adolescence Outpatients Asthma -- Symptoms\nAB Statement of the problem. One approach to addressing the health care needs of patients with chronic medical problems is case management. Little is known about the effectiveness of case management in the treatment of children with asthma. Few randomized controlled studies of asthma case management have been conducted. In these studies, follow-up was limited to a one-year period. The purpose of this study was to determine the effectiveness of a one-year primary-care based asthma case management (ACM) strategy on symptoms of asthma in high risk children at 15 and 18 months post-intervention. Methods. Twenty-eight parent caregivers of children with asthma aged 1 to 15 years, who participated in the ACM intervention the year prior to the start of this study, agreed to participate. The ACM group ( n = 15) received one year of asthma case management and the usual care ( UC) group ( n = 13) received one year of routine outpatient care. Results. Child asthma symptoms, affects on parent lifestyle, and health system utilization were assessed. Based on caregiver four-week recall, the ACM group experienced fewer annual wheezing days compared to the UC group. 25.17 (36.55) versus 71.61 (80.01) that was statistically significant (p = 0.03). There were no statistically significant differences between the ACM and UC groups in the cumulative 18-month estimate of child night-time coughing and awakening, parent night-time awakening due to the child's asthma symptoms and worrying, parent change in plans and missed work, and asthma-related physician office visits, emergency department visits, and hospitalizations. Conclusion. A primary-care based asthma case management intervention was effective in reducing annual wheezing days in high-risk children with asthma when followed up to 18 months.\nNO Update Code: 20011116\nPB Rush University, College of Nursing\nPP Oceanside, CA, USA\nSN 0-599-73664-X\nAN 2001107680\nLA English\nSF CINAHL; doctoral dissertation; research\nOL English (30)",
		"items": [
			{
				"itemType": "thesis",
				"title": "Effect of a case management intervention on symptoms of asthma in high risk children",
				"creators": [
					{
						"lastName": "Catrambone",
						"firstName": "C.D.",
						"creatorType": "author"
					}
				],
				"date": "2000",
				"abstractNote": "Statement of the problem. One approach to addressing the health care needs of patients with chronic medical problems is case management. Little is known about the effectiveness of case management in the treatment of children with asthma. Few randomized controlled studies of asthma case management have been conducted. In these studies, follow-up was limited to a one-year period. The purpose of this study was to determine the effectiveness of a one-year primary-care based asthma case management (ACM) strategy on symptoms of asthma in high risk children at 15 and 18 months post-intervention. Methods. Twenty-eight parent caregivers of children with asthma aged 1 to 15 years, who participated in the ACM intervention the year prior to the start of this study, agreed to participate. The ACM group ( n = 15) received one year of asthma case management and the usual care ( UC) group ( n = 13) received one year of routine outpatient care. Results. Child asthma symptoms, affects on parent lifestyle, and health system utilization were assessed. Based on caregiver four-week recall, the ACM group experienced fewer annual wheezing days compared to the UC group. 25.17 (36.55) versus 71.61 (80.01) that was statistically significant (p = 0.03). There were no statistically significant differences between the ACM and UC groups in the cumulative 18-month estimate of child night-time coughing and awakening, parent night-time awakening due to the child's asthma symptoms and worrying, parent change in plans and missed work, and asthma-related physician office visits, emergency department visits, and hospitalizations. Conclusion. A primary-care based asthma case management intervention was effective in reducing annual wheezing days in high-risk children with asthma when followed up to 18 months.",
				"language": "English",
				"numPages": "141",
				"place": "Oceanside, CA, USA",
				"university": "Rush University, College of Nursing",
				"attachments": [],
				"tags": [
					"Case Management Asthma -- Therapy -- In Infancy and Childhood Treatment Outcomes -- In Infancy and Childhood (Minor): Prospective Studies Comparative Studies Infant Child Adolescence Outpatients Asthma -- Symptoms"
				],
				"notes": [
					{
						"note": "<p>Update Code: 20011116</p>"
					},
					{
						"note": "The following values have no corresponding Zotero field:<br/>SR Electronic(1)<br/>ID 2118<br/>SN 0-599-73664-X<br/>AN 2001107680<br/>SF CINAHL; doctoral dissertation; research<br/>OL English (30)<br/>",
						"tags": [
							"_RW import"
						]
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "RT Journal Article\nSR Electronic(1)\nID 271\nA1 Allan,Steven\nA1 Gilbert,Paul\nT1 Anger and anger expression in relation to perceptions of social rank, entrapment and depressive symptoms\nJF Personality & Individual Differences\nYR 2002\nFD Feb\nVO 32\nIS 3\nSP 551\nOP 565\nK1 Anger\nK1 Self Report\nK1 Status\nK1 Depression (Emotion)\nK1 Symptoms\nK1 self-report measures\nK1 anger expression\nK1 social rank\nK1 entrapment\nK1 depressive symptoms\nAB Explored the relationship between self-report measures of anger and anger expression with those of social rank (unfavorable social comparison and submissive behavior) and feelings of entrapment in a student population (197 Ss, mean age 23.4 yrs). The authors further investigated if the social rank/status of the target of one's anger affects anger experience and expression. Students were given C. D. Spielberger's (1988) State-Trait Anger Expression Inventory measure of anger and asked to complete it in 3 ways. First, in the normal way, and then 2 further times after reading 2 scenarios that involved lending an important and needed book which the lender fails to return, where the lender was either an up rank/authority figure (one's tutor) or a down rank, fellow student. It was found that self-perceptions of unfavorable rank (inferior self-perceptions and submissive behavior) and feeling trapped significantly affect anger suppression. It was also found that the rank of the target significantly affects anger expression and that people who respond angrily to criticism tend to show more down rank-anger when they are frustrated by a lower rank target and modulate their anger according to the rank of the person they are angry with. ( PsycINFO Database Record ( c) 2002 APA, all rights reserved)\nNO PO: Human; Male; Female; Adulthood (18 yrs & older); FE: References; Peer Reviewed; UD: 20020227; F1: 0191-8869,32,3,551-565,2002; A1: 20020227\nPB Elsevier Science, England, [URL:http:// www.elsevier.nl]\nSN 0191-8869\nAD Kingsway Hosp, Dept of Clinical Psychology, Derby, United Kingdom; [mailto: stev.allan@hotmail.com]\nAN 2002-00282-017\nLA English\nCL 3120 Personality Traits & Processes\nSF Print (Paper); Journal Article; Empirical Study\nLK http://bmj.com/content/vol325/issue7371/twib.shtml#325/7371/0\nOL English (30)",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Anger and anger expression in relation to perceptions of social rank, entrapment and depressive symptoms",
				"creators": [
					{
						"lastName": "Allan",
						"firstName": "Steven",
						"creatorType": "author"
					},
					{
						"lastName": "Gilbert",
						"firstName": "Paul",
						"creatorType": "author"
					}
				],
				"date": "Feb 2002",
				"ISSN": "0191-8869",
				"abstractNote": "Explored the relationship between self-report measures of anger and anger expression with those of social rank (unfavorable social comparison and submissive behavior) and feelings of entrapment in a student population (197 Ss, mean age 23.4 yrs). The authors further investigated if the social rank/status of the target of one's anger affects anger experience and expression. Students were given C. D. Spielberger's (1988) State-Trait Anger Expression Inventory measure of anger and asked to complete it in 3 ways. First, in the normal way, and then 2 further times after reading 2 scenarios that involved lending an important and needed book which the lender fails to return, where the lender was either an up rank/authority figure (one's tutor) or a down rank, fellow student. It was found that self-perceptions of unfavorable rank (inferior self-perceptions and submissive behavior) and feeling trapped significantly affect anger suppression. It was also found that the rank of the target significantly affects anger expression and that people who respond angrily to criticism tend to show more down rank-anger when they are frustrated by a lower rank target and modulate their anger according to the rank of the person they are angry with. ( PsycINFO Database Record ( c) 2002 APA, all rights reserved)",
				"issue": "3",
				"language": "English",
				"pages": "551-565",
				"publicationTitle": "Personality & Individual Differences",
				"volume": "32",
				"attachments": [
					{
						"path": "http://bmj.com/content/vol325/issue7371/twib.shtml#325/7371/0",
						"title": "bmj.com Link",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Anger",
					"Depression (Emotion)",
					"Self Report",
					"Status",
					"Symptoms",
					"anger expression",
					"depressive symptoms",
					"entrapment",
					"self-report measures",
					"social rank"
				],
				"notes": [
					{
						"note": "<p>PO: Human; Male; Female; Adulthood (18 yrs & older); FE: References; Peer Reviewed; UD: 20020227; F1: 0191-8869,32,3,551-565,2002; A1: 20020227</p>"
					},
					{
						"note": "The following values have no corresponding Zotero field:<br/>SR Electronic(1)<br/>ID 271<br/>PB Elsevier Science, England, [URL:http:// www.elsevier.nl]<br/>AD Kingsway Hosp, Dept of Clinical Psychology, Derby, United Kingdom; [mailto: stev.allan@hotmail.com]<br/>AN 2002-00282-017<br/>CL 3120 Personality Traits & Processes<br/>SF Print (Paper); Journal Article; Empirical Study<br/>OL English (30)<br/>",
						"tags": [
							"_RW import"
						]
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "Refworks Export Tagged Format\n\nCharacter Set=utf-8\n\nTag legend\n*****\nRT=Reference Type\nSR=Source Type\nID=Reference Identifier\nA1=Primary Authors\nT1=Primary Title\nJF=Periodical Full\nJO=Periodical Abbrev\nYR=Publication Year\nFD=Publication Data,Free Form\nVO=Volume\nIS=Issue\nSP=Start Page\nOP=Other Pages\nK1=Keyword\nAB=Abstract\nNO=Notes\nA2=Secondary Authors\nT2=Secondary Title\nED=Edition\nPB=Publisher\nPP=Place of Publication\nA3=Tertiary Authors\nA4=Quaternary Authors\nA5=Quinary Authors\nT3=Tertiary Title\nSN=ISSN/ISBN\nAV=Availability\nAD=Author Address\nAN=Accession Number\nLA=Language\nCL=Classification\nSF=Subfile/Database\nOT=Original Foreign Title\nLK=Links\nDO=Document Object Index\nCN=Call Number\nDB=Database\nDS=Data Source\nIP=Identifying Phrase\nRD=Retrieved Date\nST=Shortened Title\nU1=User 1\nU2=User 2\nU3=User 3\nU4=User 4\nU5=User 5\nU6=User 6\nU7=User 7\nU8=User 8\nU9=User 9\nU10=User 10\nU11=User 11\nU12=User 12\nU13=User 13\nU14=User 14\nU15=User 15\nUL=URL\nSL=Sponsoring Library\nLL=Sponsoring Library Location\nCR=Cited References\nWT=Website Title\nA6=Website Editor\nWV=Website Version\nWP=Date of Electronic Publication\nOL=Output Language\nPMID=PMID\nPMCID=PMCID\n\n*****\nFont Attribute Legend\nStart Bold = \nEnd Bold = \nStart Underline = \nEnd Underline = \nStart Italic = \nEnd Italic = \nStart SuperScript = \nEnd SuperScript = \nStart SubScript = \nEnd SubScript = \n\n*****\nBEGIN EXPORTED REFERENCES\n\n\n\n\nRT Journal Article\nSR Electronic(1)\nID 1220\nA1 Brennan,Timothy\nT1 The Empire's New Clothes\nJF Critical Inquiry\nYR 2003\nFD 01/01\nVO 29\nIS 2\nSP 337\nOP 367\nNO doi: 10.1086/374030\nLK http://www.journals.uchicago.edu/doi/abs/10.1086/374030\nOL Unknown(0)",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Empire's New Clothes",
				"creators": [
					{
						"lastName": "Brennan",
						"firstName": "Timothy",
						"creatorType": "author"
					}
				],
				"date": "January 01 2003",
				"issue": "2",
				"pages": "337-367",
				"publicationTitle": "Critical Inquiry",
				"volume": "29",
				"attachments": [
					{
						"path": "http://www.journals.uchicago.edu/doi/abs/10.1086/374030",
						"title": "www.journals.uchicago.edu Link",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<p>doi: 10.1086/374030</p>"
					},
					{
						"note": "The following values have no corresponding Zotero field:<br/>SR Electronic(1)<br/>ID 1220<br/>OL Unknown(0)<br/>",
						"tags": [
							"_RW import"
						]
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
