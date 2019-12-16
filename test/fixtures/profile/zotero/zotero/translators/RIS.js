{
	"translatorID": "32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7",
	"label": "RIS",
	"creator": "Simon Kornblith and Aurimas Vinckevicius",
	"target": "ris",
	"minVersion": "3.0.4",
	"maxVersion": "",
	"priority": 100,
	"configOptions": {
		"async": true,
		"getCollections": "true"
	},
	"displayOptions": {
		"exportCharset": "UTF-8",
		"exportNotes": true,
		"exportFileData": false
	},
	"inRepository": true,
	"translatorType": 3,
	"lastUpdated": "2019-10-19 17:04:49"
}

function detectImport() {
	var line;
	var i = 0;
	while ((line = Zotero.read()) !== false) {
		line = line.replace(/^\s+/, "");
		if (line != "") {
			if (line.substr(0, 6).match(/^TY {1,2}- /)) {
				return true;
			} else {
				if (i++ > 3) {
					return false;
				}
			}
		}
	}
}

/********************
 * Exported options *
 ********************/
 //exported as translatorObject.options
 var exportedOptions = {
	itemType: false, //allows translators to override item type
	defaultItemType: false, //item type to default to
	typeMap: false,
	fieldMap: false
};


/************************
 * TY <-> itemType maps *
 ************************/

var DEFAULT_EXPORT_TYPE = 'GEN';
var DEFAULT_IMPORT_TYPE = 'journalArticle';

var exportTypeMap = {
	artwork:"ART",
	audioRecording:"SOUND", //consider MUSIC
	bill:"BILL",
	blogPost:"BLOG",
	book:"BOOK",
	bookSection:"CHAP",
	"case":"CASE",
	computerProgram:"COMP",
	conferencePaper:"CONF",
	dictionaryEntry:"DICT",
	encyclopediaArticle:"ENCYC",
	email:"ICOMM",
	film:"MPCT",
	hearing:"HEAR",
	journalArticle:"JOUR",
	letter:"PCOMM",
	magazineArticle:"MGZN",
	manuscript:"MANSCPT",
	map:"MAP",
	newspaperArticle:"NEWS",
	patent:"PAT",
	presentation:"SLIDE",
	report:"RPRT",
	statute:"STAT",
	thesis:"THES",
	videoRecording:"VIDEO",
	webpage:"ELEC"
};

//These export type maps are degenerate
//They will cause loss of information when exported and reimported
//These should either be duplicates of some of the RIS types above
//  or be different from the importTypeMap mappings
var degenerateExportTypeMap = {
	interview:"PCOMM",
	instantMessage:"ICOMM",
	forumPost:"ICOMM",
	tvBroadcast:"MPCT",
	radioBroadcast:"SOUND",
	podcast:"SOUND",
	document:"GEN" //imported as journalArticle
};

//These are degenerate types that are not exported as the same TY value
//These should not include any types from exportTypeMap
//We add the rest from exportTypeMap
var importTypeMap = {
	ABST:"journalArticle",
	ADVS:"film",
	AGGR:"document", //how can we handle "database" citations?
	ANCIENT:"document",
	CHART:"artwork",
	CLSWK:"book",
	CPAPER:"conferencePaper",
	CTLG:"magazineArticle",
	DATA:"document", //dataset
	DBASE:"document", //database
	EBOOK:"book",
	ECHAP:"bookSection",
	EDBOOK:"book",
	EJOUR:"journalArticle",
	EQUA:"document", //what's a good way to handle this?
	FIGURE:"artwork",
	GEN:"journalArticle",
	GOVDOC:"report",
	GRNT:"document",
	INPR:"manuscript",
	JFULL:"journalArticle",
	LEGAL:"case", //is this what they mean?
	MULTI:"videoRecording", //maybe?
	MUSIC:"audioRecording",
	PAMP:"manuscript",
	SER:"book",
	STAND:"report",
	UNBILL:"manuscript",
	UNPD:"manuscript",
	WEB:"webpage"	//not in spec, but used by EndNote
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
/** Syntax
 * {
 *   RIS-TAG:
 *     String, Zotero field used for any item type
 *     List, item-type dependent mapping
 *     {
 *       Zotero field: Zotero item type array. Map RIS tag to the specified Zotero field for indicated item types
 *       "__ignore": Zotero item type array. Ignore this RIS tag for indicated item types. Do not place it in a note
 *       "__default": Zotero field. If not matched by above, map RIS tag to this field, unless...
 *       "__exclude": Zotero item type array. Do not use the __default mapping for these item types
 *     }
 * }
 *
 * Special "Zotero fields"
 *   "attachments/[PDF|HTML|other]": import as attachment with a provided path/url
 *   "creators/...": map to a specified creator type
 *   "unsupported/...": there is no corresponding Zotero field, but we can provide a human-readable label for the data and attach it as note
 */

//used for exporting and importing
//this ensures that we can mostly reimport everything the same way
//(except for item types that do not have unique RIS types, see above)
var fieldMap = {
	//same for all itemTypes
	AB:"abstractNote",
	AN:"archiveLocation",
	CN:"callNumber",
	DB:"archive",
	DO:"DOI",
	DP:"libraryCatalog",
	J2:"journalAbbreviation",
	KW:"tags",
	L1:"attachments/PDF",
	L2:"attachments/HTML",
	L4:"attachments/other",
	N1:"notes",
	ST:"shortTitle",
	UR:"url",
	Y2:"accessDate",

	//type specific
	//tag => field:itemTypes
	//if itemType not explicitly given, __default field is used
	//  unless itemType is excluded in __exclude
	TI: {
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
		series:["bookSection", "conferencePaper", "journalArticle"],
		seriesTitle:["audioRecording"]
	},
	//NOT HANDLED: reviewedAuthor, scriptwriter, contributor, guest
	AU: {
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
		"creators/seriesEditor":["book", "report"],
		"creators/recipient":["email", "instantMessage", "letter"],
		reporter:["case"],
		issuingAuthority:["patent"]
	},
	A3: {
		"creators/cosponsor":["bill"],
		"creators/producer":["film", "tvBroadcast", "videoRecording", "radioBroadcast"],
		"creators/editor":["book"],
		"creators/seriesEditor":["bookSection", "conferencePaper", "dictionaryEntry", "encyclopediaArticle", "map"]
	},
	A4: {
		"__default":"creators/translator",
		"creators/counsel":["case"],
		"creators/contributor":["conferencePaper", "film"]	//translator does not fit these
	},
	C1: {
		filingDate:["patent"], //not in spec
		"creators/castMember":["radioBroadcast", "tvBroadcast", "videoRecording"],
		scale:["map"],
		place:["conferencePaper"]
	},
	C2: {
		issueDate:["patent"], //not in spec
		"creators/bookAuthor":["bookSection"],
		"creators/commenter":["blogPost"]
	},
	C3: {
		artworkSize:["artwork"],
		proceedingsTitle:["conferencePaper"],
		country:["patent"]
	},
	C4: {
		"creators/wordsBy":["audioRecording"], //not in spec
		"creators/attorneyAgent":["patent"],
		genre:["film"]
	},
	C5: {
		references:["patent"],
		audioRecordingFormat:["audioRecording", "radioBroadcast"],
		videoRecordingFormat:["film", "tvBroadcast", "videoRecording"]
	},
	C6: {
		legalStatus:["patent"],
	},
	CY: {
		"__default":"place",
		"__exclude":["conferencePaper"] //should be exported as C1
	},
	DA: { //also see PY when editing
		"__default":"date",
		dateEnacted:["statute"],
		dateDecided:["case"],
		issueDate:["patent"]
	},
	ET: {
		"__default":"edition",
//		"__ignore":["journalArticle"], //EPubDate
		session:["bill", "hearing", "statute"],
		version:["computerProgram"]
	},
	IS: {
		"__default":"issue",
		numberOfVolumes: ["bookSection"]
	},
	LA: {
		"__default":"language",
		programmingLanguage: ["computerProgram"]
	},
	M1: {
		seriesNumber:["book"],
		billNumber:["bill"],
		system:["computerProgram"],
		documentNumber:["hearing"],
		applicationNumber:["patent"],
		publicLawNumber:["statute"],
		episodeNumber:["podcast", "radioBroadcast", "tvBroadcast"]
	},
	M3: {
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
	NV: {
		"__default": "numberOfVolumes",
		"__exclude": ["bookSection"] //IS
	},
	OP: {
		history:["hearing", "statute", "bill", "case"],
		priorityNumbers:["patent"]
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
	PY: { //duplicate of DA, but this will only output year
		"__default":"date",
		dateEnacted:["statute"],
		dateDecided:["case"],
		issueDate:["patent"]
	},
	SE: {
		"__default": "section",	//though this can refer to pages, start page, etc. for some types. Zotero does not support any of those combinations, however.
		"__exclude": ["case"]
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
	SV: {
		seriesNumber: ["bookSection"],
		docketNumber: ["case"]	//not in spec. EndNote exports this way
	},
	VL: {
		"__default":"volume",
		codeNumber:["statute"],
		codeVolume:["bill"],
		reporterVolume:["case"],
		"__exclude":["patent", "webpage"]
	}
};

//non-standard or degenerate field maps
//used ONLY for importing and only if these fields are not specified above (e.g. M3)
//these are not exported the same way
var degenerateImportFieldMap = {
	A1: fieldMap["AU"],
	AD: {
		"__default": "unsupported/Author Address",
		"unsupported/Inventor Address": ["patent"]
	},
	AV: "archiveLocation", //REFMAN
	BT: {
		title: ["book", "manuscript"],
		bookTitle: ["bookSection"],
		"__default": "backupPublicationTitle" //we do more filtering on this later
	},
	CA: "unsupported/Caption",
	CR: "rights",
	CT: "title",
	CY: "place", // ProCite and Springer are using CY instead of C1 also for conferencePapers
	ED: "creators/editor",
	EP: "pages",
	H1: "unsupported/Library Catalog", //Citavi specific (possibly multiple occurences)
	H2: "unsupported/Call Number", //Citavi specific (possibly multiple occurences)
	ID: "__ignore",
	JA: "journalAbbreviation",
	JF: "publicationTitle",
	JO: {
		"__default": "journalAbbreviation",
		conferenceName: ["conferencePaper"]
	},
	LB: "unsupported/Label",
	M1: {
		"__default":"extra",
		issue: ["journalArticle"], //EndNote hack
		numberOfVolumes: ["bookSection"],	//EndNote exports here instead of IS
		accessDate: ["webpage"]		//this is access date when coming from EndNote
	},
	M2: "extra", //not in spec
	M3: "DOI",
	N2: "abstractNote",
	NV: "numberOfVolumes",
	OP: {
		"__default": "unsupported/Original Publication",
		"unsupported/Content": ["blogPost", "computerProgram", "film", "presentation", "report", "videoRecording", "webpage"]
	},
	RI: {
		"__default":"unsupported/Reviewed Item",
		"unsupported/Article Number": ["statute"]
	},
	RN: "notes",
	SE: {
		"unsupported/File Date": ["case"]
	},
	T1: fieldMap["TI"],
	T2: "backupPublicationTitle", //most item types should be covered above
	T3: {
		series: ["book"]
	},
	TA: "unsupported/Translated Author",
	TT: "unsupported/Translated Title",
	VL: {
		"unsupported/Patent Version Number":['patent'],
		accessDate: ["webpage"]	//technically access year according to EndNote
	},
	Y1: fieldMap["DA"] // Old RIS spec
};

/**
 * @class Generic tag mapping with caching
 * 
 * @param {Tag <-> zotero field map []} mapList An array of field map lists as
 *   described above. Lists are matched in order they are supplied. If a tag is
 *   not present in the list, the next list is checked. If the RIS tag is
 *   present, but an item type does not match (no __default) or is explicit
 *   excluded from matching (__exclude), the next list is checked.
 */
var TagMapper = function(mapList) {
	this.cache = {};
	this.reverseCache = {};
	this.mapList = mapList;
};

/**
 * Given an item type and a RIS tag, return Zotero field data should be mapped to.
 * Mappings are cached.
 *
 * @param {String} itemType Zotero item type
 * @param {String} tag RIS tag
 * @return {String} Zotero field
 */
TagMapper.prototype.getField = function(itemType, tag) {
	if (!this.cache[itemType]) this.cache[itemType] = {};

	//retrieve from cache if available
	//it can be false if previous search did not find a mapping
	if (this.cache[itemType][tag] !== undefined) {
		return this.cache[itemType][tag];
	}

	var field = false;
	for (var i=0, n=this.mapList.length; i<n; i++) {
		var map = this.mapList[i];
		if (typeof(map[tag]) == 'object') {
			var def, exclude = false;
			for (var f in map[tag]) {
				//__ignore is not handled here. It's returned as a Zotero field so it
				//can be explicitly excluded from the note attachment
				if (f == "__default") {
					//store default mapping in case we can't find anything explicit
					def = map[tag][f];
					continue;
				}

				if (f == "__exclude") {
					if (map[tag][f].indexOf(itemType) != -1) {
						exclude = true; //don't break. Let explicit mapping override this
					}
					continue;
				}

				if (map[tag][f].indexOf(itemType) != -1) {
					field = f;
					break;
				}
			}

			//assign default value if not excluded
			if (!field && def && !exclude) field = def;
		} else if (typeof(map[tag]) == 'string') {
			field = map[tag];
		}

		if (field) break; //no need to go on
	}

	this.cache[itemType][tag] = field;

	return field;
};

/**
 * Given a Zotero item type and field, return a RIS tag.
 * Mappings are cached.
 * Not used for export, but for ProCite tag re-mapping
 *
 * @param {String} itemType Zotero item type
 * @param {String} zField Zotero field
 * @return {String} RIS tag
 */
TagMapper.prototype.reverseLookup = function(itemType, zField) {
	if (!this.reverseCache[itemType]) this.reverseCache[itemType] = {};
	
	if (this.reverseCache[itemType][zField] !== undefined) {
		return this.reverseCache[itemType][zField];
	}
	
	for (var i=0, n=this.mapList.length; i<n; i++) {
		var risTag;
		for (risTag in this.mapList[i]) {
			var typeMap = this.mapList[i][risTag];
			if (typeMap == zField) {
				// item type indepndent
				this.reverseCache[itemType][zField] = risTag;
				return risTag;
			} else if (typeof(typeMap) == 'object') {
				if (typeMap[zField] && typeMap[zField].indexOf(itemType) !== -1) {
					//explicitly mapped
					this.reverseCache[itemType][zField] = risTag;
					return risTag;
				}
				if (!(typeMap.__exclude && typeMap.__exclude.indexOf(itemType) !== -1)
					&& typeMap.__default == zField
				) {
					// may be mapped via default, but make sure this item type is not
					// explicitly mapped somewhere else
					var preventDefault = false;
					for (var field in typeMap) {
						if (typeMap[field].indexOf(itemType) != -1) {
							// mapped to something else
							preventDefault = true;
							break;
						}
					}
					
					if (!preventDefault) {
						this.reverseCache[itemType][zField] = risTag;
						return risTag;
					}
				}
			}
		}
	}
	this.reverseCache[itemType][zField] = false;
	return false;
};

/********************
 * Import Functions *
 ********************/

//import field mapping
var importFields;

//do not store unknwon fields in notes
//configurable via RIS.import.ignoreUnknown hidden preference
var ignoreUnknown = true;

/**
 * @singleton Provides facilities to read one RIS entry at a time
 */
var RISReader = new function() {
	//if we read a tag-value pair from the next entry, we need to keep it for later
	var _tagValueBuffer = [];
	/**
	 * public
	 * Returns the next RIS entry
	 * Note: we do allow entries to be missing a TY tag
	 *
	 * @return  Array of tag-value pairs in order of appearance.
	 *   Includes an additional property "tags", which is a list of RIS tags.
	 *   The values of the list are arrays, which contain references to the
	 *   tag-value pairs stored in the returned array.
	 */
	this.nextEntry = function() {
		var tagValue,
			entry = []; //maintain tag order
		entry.tags = {}; //tag list for convenience
		
		while (tagValue = (_tagValueBuffer.length && _tagValueBuffer.pop()) || _getTagValue()) {
			if (tagValue.tag == 'TY' && entry.length) {
				//we hit a new entry. ER was omitted, but we'll forgive
				_tagValueBuffer.push(tagValue);
				return entry;
			}
			
			if (tagValue.tag == 'ER') {
				if (!entry.length) continue; //weird, but keep going and ignore ER outside of entry
				return entry;
			}
			
			entry.push(tagValue);
			//also add to the "tags" list for convenient access
			if (!entry.tags[tagValue.tag]) entry.tags[tagValue.tag] = [];
			entry.tags[tagValue.tag].push(tagValue);
		}
		
		if (entry.length) return entry;
	};
	
	var RIS_format = /^([A-Z][A-Z0-9]) {1,2}-(?: (.*))?$/, //allow empty entries
	//list of tags for which we preserve newlines
		preserveNewLines = ['KW', 'L1', 'L2', 'L3'], //these could use newline as separator
	//keep track of maximum line length so we can make a better call on whether
	//something should be on a new line or not
		_maxLineLength = 0;
	
	/**
	 * private
	 * Get the next RIS tag-value pair
	 *
	 * @return {
	 *   raw: the line (or multiple lines) that were read in for this tag value pair,
	 *   tag: RIS tag,
	 *   value: value, which may have newlines stripped
	 * }
	 */
	function _getTagValue() {
		var line, tagValue, temp, lastLineLength = 0;
		while ((line = _nextLine()) !== false) { //could be reading empty lines
			temp = line.match(RIS_format);
			
			if (!temp && !tagValue) {
				//doesn't match RIS format and we're not processing a tag-value pair,
				//so this is not a multi-line tag-value pair
				if (line.trim()) {
					Z.debug("RIS: Dropping line outside of RIS record: " + line);
				}
				continue;
			}
			
			if (line.length > _maxLineLength) _maxLineLength = line.length;
			
			if (temp && tagValue) {
				//if we are already processing a tag-value pair, then this is the next pair
				//store this line for later and return
				_lineBuffer.push(line);
				return tagValue;
			}
			
			if (temp) {
				//new tag-value pair
				tagValue = {
					tag: temp[1],
					value: temp[2],
					raw: line
				};
				
				if (tagValue.value === undefined) tagValue.value = '';
			} else {
				//tagValue && !temp
				//multi-line RIS tag-value pair
				var newLineAdded = false;
				var cleanLine = line.trim();
				//new lines would probably only be meaningful in notes and abstracts
				if ((['AB', 'N1', 'N2', 'RN']).indexOf(tagValue.tag) !== -1
					//if all lines are not trimmed to ~80 characters or previous line was
					// short, this would probably be on a new line. Might want to consider
					// looking for periods and capital letters to make a better call.
					// Empty lines imply a new line
					&& (_maxLineLength > 85
						|| (lastLineLength !== undefined && lastLineLength < 65)
						|| cleanLine.length == 0)
					) {
					
					cleanLine = "\n" + cleanLine;
					newLineAdded = true;
				}
				
				//don't remove new lines from keywords or attachments
				if (!newLineAdded && preserveNewLines.indexOf(tagValue.tag) != -1) {
					cleanLine = "\n" + cleanLine;
					newLineAdded = true;
				}
				
				//check if we need to add a space before concatenating
				if (!newLineAdded && tagValue.value.charAt(tagValue.value.length-1) != ' ') {
					cleanLine = ' ' + cleanLine;
				}
	
				tagValue.raw += "\n" + line;
				tagValue.value += cleanLine;
			}
			
			lastLineLength = line.length;
		}
		
		if (tagValue) return tagValue;
	}
	
	var _lineBuffer = [];
	/**
	 * private
	 * Gets the next line in the buffer or file
	 *
	 * @return (String)
	 */
	function _nextLine() {
		// Don't use shortcuts like _lineBuffer.pop() || Zotero.read(),
		//  because we may have an empty line, which could be meaningful
		if (_lineBuffer.length) return _lineBuffer.pop();
		var line = Zotero.read();
		if (line && (line.indexOf('\u2028') != -1 || line.indexOf('\u2029') != -1)) {
			// Apparently some services think that it's cool to break up single
			// lines in RIS into shorter lines using Unicode "LINE SEPARATOR"
			// character. Well, that sucks for us, because . (dot) in regexp does
			// not match this character. We also probably don't want it in the
			// metadata, so clean it up here.
			// e.g. http://informahealthcare.com/doi/full/10.3109/07434618.2014.906498
			// (an Atypon system)
			// Also include paragraph separator, though no live example available.
			line = line.replace(/\s?[\u2028\u2029]|[\u2028\u2029]\s?/g, ' ');
		}
		return line;
	}
};

/**
 * Generic methods for cleaning RIS tags
 */
var TagCleaner = {
	/**
	 * public
	 * Changes the RIS tag for an indicated tag-value pair. If more than one tag
	 *   is specified, additional pairs are added.
	 *
	 * @param (RISReader entry) entry
	 * @param (Integer) at Index in entry of the tag-value pair to alter
	 * @param (String[]) toTags Array of tags to change to
	 */
	changeTag: function(entry, at, toTags) {
		var source = entry[at], byTag = entry.tags[source.tag];
		
		//clean up "tags" list
		byTag.splice(byTag.indexOf(source),1);
		if (!byTag.length) delete entry.tags[source.tag];
		
		if (!toTags || !toTags.length) {
			//then we just remove
			entry.splice(at,1);
		} else {
			source.tag = toTags[0]; //re-use the same pair for first tag
			if (!entry.tags[toTags[0]]) entry.tags[toTags[0]] = [];
			entry.tags[toTags[0]].push(source);
			//if we're changing to more than one tag, we need to add extras
			for (var i=1, n=toTags.length; i<n; i++) {
				var newSource = ZU.deepCopy(source);
				newSource.tag = toTags[i];
				entry.splice(at+i, 0, newSource);
				if (!entry.tags[toTags[i]]) entry.tags[toTags[i]] = [];
				entry.tags[toTags[i]].push(newSource);
			}
		}
	}
};

/**
 * @singleton Provides facilities to remap ProCite note-based data tagging to
 *   proper RIS format
 * Note that after processing, the order of tag-value pairs in the "tags" list
 *   may be out of order
 */
var ProCiteCleaner = new function() {
	this.proCiteMode = false; //are we sure we're processing a ProCite file?
	//ProCite -> Zotero field map
	this.proCiteMap = {
		'Author Role': { //special case
			'actor': 'cast-member',
			'author': 'author',
			'cartographer': 'cartographer',
			'composer': 'composer',
			'composed': 'composer',
			'director': 'director',
			'directed': 'director',
			'performer': 'performer',
			'performed': 'performer',
			'producer': 'producer',
			'produced': 'producer',
			'editor': 'editor',
			'ed': 'editor',
			'edited': 'editor',
			'editor-in-chief': 'editor',
			'compiler': 'editor',
			'compiled': 'editor',
			'collected': 'editor',
			'assembled': 'editor',
			'presenter': 'presenter',
			'presented': 'presenter',
			'translator': 'translator',
			'translated':'translator',
			'introduction': 'contributor'
			//conductor
			//illustrator
			//librettist
		},
		'Call Number': 'callNumber',
		'Edition': 'edition',
		'ISBN': 'ISBN',
		'Language': 'language',
		'Publisher Name': 'publisher',
		'Series Title': 'series',
		'Proceedings Title': 'proceedingsTitle',
		'Page(s)': 'pages',
		'Volume ID': 'volume',
		'Issue ID': 'issue',
		'Issue Identification': 'issue',
		'Series Volume ID': 'seriesNumber',
		'Scale': 'scale',
		'Place of Publication': 'place',
		'Histroy': 'history', // yes, it's misspelled in their export filter
		'Size': 'artworkSize'
	};
	
	var tagValueSplit = /([A-Za-z,\s]+)\s*:\s*([\s\S]*)/; //ProCite version
	/**
	 * public
	 * Converts ProCite "tags" to RIS tags
	 *
	 * @param (RISReader entry) entry Entry to be cleaned up in-place
	 * @param (Zotero.Item) item Indicates item type for proper mapping
	 */
	this.cleanTags = function(entry, item) {
		// We _must_ change some tags before mapping from notes, otherwise
		// there will be ambiguity
		var ty;
		if (this.proCiteMode) {
			ty = entry.tags.TY && entry.tags.TY[0].value;
			if ((ty == 'CHAP' || ty == 'BOOK') && entry.tags.VL) {
				// Edition in ET, not VL
				_changeAllTags(entry, 'VL', 'ET');
			}
		}
		
		
		var notes = entry.tags.N1, extentOfWork, packagingMethod;
		//go through all the notes
		for (var i=0; notes && notes.length && i<entry.length; i++) {
			var m;
			if (entry[i].tag !== 'N1'
				|| !(m = entry[i].value.trim().match(tagValueSplit)) ) {
				continue;
			}
			
			switch (m[1]) {
				case 'Author, Subsidiary':
				case 'Author, Monographic':
					//seems to always come before "Author Role"
					//we guess what RIS tag to assign,
					//but this gets fixed on next iteration anyway
					var risTag = entry.tags.A1 ? (entry.tags.A2 ? 'A3' : 'A2') : 'A1';
					var authors = m[2].split(/;\s*/); //multiple authors on the same line
					this._changeTag(entry, i, [risTag]);
					//use current tag-value pair for first author
					//authors are in firstName lastName format, we need to fix it
					entry[i].value = _fixAuthor(authors[0]);
					//subsequent authors need to have their own tag-value pairs
					for (var j=1; j<authors.length; j++) {
						var newEntry = ZU.deepCopy(entry[i]);
						newEntry.value = authors[j];
						entry.splice(i+1,0,newEntry); //insert into tag-value array
						entry.tags[risTag].push(newEntry); //and add to tags
					}
					i += authors.length - 1; //skip past the new entries we just added
				break;
				case 'Artist Role':
				case 'Series Editor Role':
				case 'Editor/Compiler Role':
				case 'Cartographer Role':
				case 'Composer Role':
				case 'Producer Role':
				case 'Director Role':
				case 'Performer Role':
				case 'Author Role':
					var authorRoles = _normalizeAuthorRole(m[2]);
					var risTags = [], fail = false;
					//find a RIS tag for each author role
					for (var j=0, k=authorRoles.length; j<k; j++) {
						var role = this.proCiteMap['Author Role'][authorRoles[j]];
						if (!role) {
							Z.debug('RIS: Unknown ProCite author role: ' + authorRoles[j]);
							continue;
						}
						role = 'creators/' + role;
						var risTag = importFields.reverseLookup(item.itemType, role);
						if (!risTag) {
							Z.debug('RIS: Cannot map ProCite author role to RIS tag: ' + role + ' for ' + item.itemType);
							Z.debug('RIS: Will not attempt a partial match: ' + m[0]);
							fail = true;
							break;
						}
						if (risTags.indexOf(risTag) === -1) risTags.push(risTag); //don't add same role
					}
					
					if (fail || !risTags.length) continue;
					
					Z.debug('RIS: ' + m[0]);
					Z.debug('RIS: Mapping preceeding authors to ' + risTags.join(', '));
					var added;
					if (added = this._remapPreceedingTags(entry, i, ['A1','A2','A3'], risTags)) {
						this._changeTag(entry, i); //remove ProCite note
						i--;
						if (added !== true) {
							i += added;
						}
					}
				break;
				case 'Record ID':
				case 'Record Number':
					this._changeTag(entry, i, ['ID']);
					entry[i].value = m[2];
				break;
				case 'Notes':
					entry[i].value = m[2];
				break;
				case 'Connective Phrase':
					if (m[2].trim().toLowerCase() == 'in') {
						//this is somewhat meaningless, remove it
						this._changeTag(entry, i);
						i--;
					}
				break;
				case 'Extent of Work':
					extentOfWork = entry[i]; //processed later
				break;
				case 'Packaging Method':
					packagingMethod = entry[i]; //processed later
				break;
				default:
					if (this.proCiteMap[m[1]]) {
						var risTag = importFields.reverseLookup(item.itemType, this.proCiteMap[m[1]]);
						if (!risTag) {
							Z.debug('RIS: Cannot map ProCite note to RIS tag: ' + this.proCiteMap[m[1]] + ' for ' + item.itemType);
							continue;
						}
						this._changeTag(entry, i, [risTag]);
						entry[i].value = m[2];
					}
			}
		}
		
		if (extentOfWork) {
			var extent = extentOfWork.value.match(tagValueSplit)[2],
				m = extent.match(/^(\d+)\s*(pages?|p(?:p|gs?)?|vols?|volumes?)\.?$/i), //e.g. 2 vols.
				units, deletePackagingMethod = false;
			if (m) {
				//we have both extent and units in the same field
				//packagingMethod will be useless
				units = m[2].charAt(0).toLowerCase() == 'p' ? 'numPages' : 'numberOfVolumes';
				extent = m[1];
			} else if (packagingMethod && /^\s*\d+\s*$/.test(extent) //numeric extent
				&& (m = packagingMethod.value.match(/:\s*(pages?|p(?:p|gs?)?|vols?|volumes?)\.?\s*$/i))
			) {
				units = m[1].charAt(0).toLowerCase() == 'p' ? 'numPages' : 'numberOfVolumes';
				extent = extent.trim();
				deletePackagingMethod = true; //we can delete it since we used it
			}
			
			if (units) {
				risTag = importFields.reverseLookup(item.itemType, units);
				if (risTag) {
					extentOfWork.value = extent;
					this._changeTag(entry, entry.indexOf(extentOfWork), [risTag]);
					if (deletePackagingMethod) {
						this._changeTag(entry, entry.indexOf(packagingMethod));
					}
				}
			}
		}
		
		//the rest we only fix if we're sure this is ProCite
		if (!this.proCiteMode) return;
		
		ty = entry.tags.TY && entry.tags.TY[0].value;
		
		//fix titles in book sections.
		//essentially, make sure there are no duplicate T tags and put them in order
		if (ty == 'CHAP') {
			var titleTags = ['T3', 'T2', 'TI'];
			for (var i=0; i<entry.length && titleTags.length; i++) {
				if ((['TI', 'T1', 'T2', 'T3']).indexOf(entry[i].tag) !== -1) {
					var newTag = titleTags.pop();
					if (entry[i].tag == newTag) continue; //already correct
					this._changeTag(entry, i, [newTag]);
				}
			}
		}
		
		if (ty == 'BOOK' && entry.tags.IS && entry.tags.IS.length) {
			_changeAllTags(entry, 'IS', 'VL');
		}
		
		if ((ty == 'CHAP' || ty == 'BOOK') && entry.tags.VL && entry.tags.VL.length > 1) {
			// We try to fix this ahead of time, but we can't always
			// 2 of these entries would indicate Edition and then Volume (maybe)
			this._changeTag(entry, entry.indexOf(entry.tags.VL[0]), ['ET']);
		}
		
		if (ty == 'COMP'&& entry.tags.IS) {
			_changeAllTags(entry, 'IS', 'ET');
		}
		
		if (ty == 'BILL') {
			if (entry.tags.CY) _changeAllTags(entry, 'CY', 'T2');
			if (entry.tags.VL) _changeAllTags(entry, 'VL', 'M1');
			if (entry.tags.SP) _changeAllTags(entry, 'SP', 'SE');
		}
		
		if (ty == 'ART') {
			if (entry.tags.M1) _changeAllTags(entry, 'M1', 'M3');
		}
	};
	
	/**
	 * private
	 * Normalize author role strings
	 *
	 * @param (String) role
	 * @return (String[]) normalized author role(s)
	 */
	function _normalizeAuthorRole(role) {
		return role.toLowerCase()
			.replace(/s\b|\.|\s+by\b|with an\s*/g,'')
			//split multiple types
			.split(/\s*(?:,|and)\s*/);
	}
	
	/**
	 * private
	 * Formats author name as lastName, firstName
	 *
	 * @param (String) author
	 * @return (String)
	 */
	function _fixAuthor(author) {
		if (author.indexOf(',') !== -1 || author.trim().indexOf(' ') === -1) return author;
		author = author.trim();
		return author.substr(author.lastIndexOf(' ')+1) + ', ' + author.substring(0,author.lastIndexOf(' '));
	}
		
	/**
	 * private
	 * Change all appearances of tag to another tag
	 * 
	 * @param (RISReader entry) entry
	 * @param (String) from
	 * @param (String) to
	 */
	function _changeAllTags(entry, from, to) {
		if (!from || !to) return;
		
		for (var i=0; i<entry.tags[from].length; i++) {
			entry.tags[from][i].tag = to;
		}
		
		entry.tags[to] = entry.tags[from];
		delete entry.tags[from];
	}
	
	/**
	 * public
	 * Wrapper for TagCleaner.changeTag
	 */
	this._changeTag = function(entry, at, toTags) {
		TagCleaner.changeTag(entry, at, toTags);
		
		//if we're changing tags, then we're sure this is ProCite format
		//it's not the most intuitive place for this,
		//but it makes sure that we don't miss setting this somewhere
		this.proCiteMode = true;
	};
	
	/**
	 * public
	 * Changes RIS tags for preceeding tag-value pairs until we hit something that
	 *   is not allowed to be modified
	 *
	 * @param (RISReader entry) entry
	 * @param (Integer) start Index in entry before which to change tags
	 * @param (String[]) allowedTags Array of tags that are allowed to be modified
	 * @param (String[]) risTags Array of tags to change to
	 * @return (Boolean | Integer) If only one tag is specified in risTags,
	 *   this will be a Boolean indicating whether anything was changed.
	 *   If risTags contains more than one tag, then this will be Integer
	 *   indicating how many new tag-value pairs were inserted.
	 */
	this._remapPreceedingTags = function(entry, start, allowedTags, risTags) {
		var tag, added = 0;
		for (var i=start-1; i>=0; i--) {
			
			if (tag && entry[i].tag !== tag) {
				//different from the tags we changed previously. Don't continue
				return added ? added : true;
			}
			
			tag = entry[i].tag;
			if (allowedTags.indexOf(tag) === -1) {
				//not allowed to remap this tag
				Z.debug('RIS: nothing to remap');
				return;
			}
			
			this._changeTag(entry, i, risTags); //don't need to adjust i, since we're traversing backwards
			added += risTags.length - 1;
		}
		
		//we should not end up at the begining of entry,
		//since we will probably never be replacing TY, but just in case
		if (tag) return added ? added : true;
	};
}
/**
 * @singleton Fixes some EndNote bugs, makes it more conveninent to import
 */
var EndNoteCleaner = new function() {
	/**
	 * public
	 * 
	 * @param (RISReader entry) entry Entry to be cleaned up in-place
	 * @param (Zotero.Item) item Indicates item type for proper mapping
	 */
	this.cleanTags = function(entry, item) {
		// for edited books, treat authors as editors
		if (entry.tags.TY && entry.tags.TY[0].value == 'EDBOOK' && entry.tags.AU) {
			for (var i = entry.tags.AU.length-1; i>=0; i--) {
				TagCleaner.changeTag(entry, entry.indexOf(entry.tags.AU[i]), ['A3']);
			}
		}
	}
};

/**
 * @singleton Deals with some Citavi specific nuances
 */
var CitaviCleaner = new function() {
	this.cleanTags = function(entry, item) {
		// Citavi uses multiple H1 and H2 tags to list mutliple libraries and call
		// numbers for items. We can only store one, so we will transform the first
		// set of H1+H2 tags to DP+CN tags
		if (entry.tags.CN || entry.tags.DP) return; // DP or CN already in use, so do nothing
		
		if (!entry.tags.H1 && !entry.tags.H2) return;
		
		if (!entry.tags.H1) {
			// Only have a call number (maybe multiple, so take the first)
			var at = entry.tags.indexOf(entry.tags.H2[0]);
			TagCleaner.changeTag(entry, at, 'CN');
			return;
		}
		
		if (!entry.tags.H1) {
			// Only have a library
			var at = entry.tags.indexOf(entry.tags.H1[0]);
			TagCleaner.changeTag(entry, at, 'DP');
		}
		
		// We have pairs, so find the first set and change it
		for (var i=0; i<entry.length - 1; i++) {
			if (entry[i].tag == 'H1' && entry[i+1].tag == 'H2') {
				TagCleaner.changeTag(entry, i, ['DP']);
				TagCleaner.changeTag(entry, i+1, ['CN']);
				return;
			}
		}
	}
}

function processTag(item, tagValue, risEntry) {
	var tag = tagValue.tag;
	var value = tagValue.value.trim();
	var rawLine = tagValue.raw;
	
	//drop empty fields
	if (value === "") return;
	
	var zField = importFields.getField(item.itemType, tag);
	if (!zField) {
		Z.debug("Unknown field " + tag + " in entry :\n" + rawLine);
		zField = 'unknown'; //this will result in the value being added as note
	}

	zField = zField.split('/');

	if (tag != "N1" && tag != "RN" && tag != "AB") {
		value = Zotero.Utilities.unescapeHTML(value);
	}

	//tag based manipulations
	var processFields = true; //whether we should continue processing by zField
	switch (tag) {
		case "N1":
		case "RN":
			//seems that EndNote duplicates title in the note field sometimes
			if (item.title == value) {
				value = undefined;
				processFields = false;
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
		case "EP":
			if (item.pages) {
				if (item.pages.indexOf('-') == -1) {
					item.pages = item.pages + '-' + value;
				} else {
					item.backupNumPages = value;
				}
				value = undefined;
			} else {
				item.backupEndPage = value;	//store this for an odd case where SP comes after EP
				value = undefined;
			}
		break;
		case "M1":
			//Endnote exports access date for webpages to M1
			//It makes much more sense to export to Y2
			//We should make sure that M1 does not overwrite whatever may be in Y2
			if (zField[0] == "accessDate") {
				item.backupAccessDate = {
					field: zField[0],
					value: dateRIStoZotero(value, zField[0])
				}
				value = undefined;
				processFields = false;
			}
		break;
		case "M3":
			// This is DOI when coming from EndNote, but it can be used for
			// publication type as well
			if (zField[0] == 'DOI') {
				var cleanDOI = ZU.cleanDOI(value);
				if (cleanDOI) {
					value = cleanDOI;
				} else {
					zField[0] = 'unknown'
				}
			}
		break;
		case "VL":
			if (zField[0] == "accessDate") {
				//EndNote screws up webpage entries. VL is access year, but access date is available
				if (!item.backupAccessDate) {	//make sure we don't replace the M1 data
					item.backupAccessDate = {
						field: zField[0],
						value: dateRIStoZotero(value, zField[0])
					};
				}
				value = undefined;
				processFields = false;
			}
		break;
		//PY is typically less complete than other dates. We'll store it as backup
		case "PY":
			item.backupDate = {
				field: zField[0],
				value: dateRIStoZotero(value, zField[0])
			};
			value = undefined;
			processFields = false;
		break;
		case "UR":
			//REFMAN places PMIDS in UR sometimes
			if (value.indexOf('PM:') != -1) {
				value = 'PMID: ' + value.substr(3);
				zField = ['extra'];
			}
		break;
	}

	//zField based manipulations
	if (processFields){
		switch (zField[0]) {
			case "__ignore":
				value = undefined;
			break;
			case "backupPublicationTitle":
				item.backupPublicationTitle = value;
				value = undefined;
			break;
			case "creators":
				var lName = value.split(/\s*,\s*/)[0];
				var fName = value.substr(lName.length).replace(/^\s*,\s*/, '');
				value = {lastName: lName, firstName:fName, creatorType:zField[1]};
				if (!value.firstName) {	//corporate
					delete value.firstName;
					value.fieldMode = 1;
				}
			break;
			case "date":
			case "accessDate":
			case "filingDate":
			case "issueDate":
			case "dateEnacted":
			case "dateDecided":
				value = dateRIStoZotero(value, zField[0]);
			break;
			case "tags":
				//allow new lines or semicolons. Commas, might be more problematic
				//%K part is a hack for REFMAN exports
				value = value.split(/\s*(?:[\r\n]+\s*)+(?:%K\s+)?|\s*(?:;\s*)+/);

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
				//we can specify note title in the field mapping table
				if (zField[1]) {
					value.note = zField[1] + ': ' + value.note;
				}
			break;
			case "attachments":
				var values = value.split('\n');
				var title, mimeType, url;
				for (var i=0, n=values.length; i<n; i++) {
					//support for EndNote's relative paths
					url = values[i].replace(/^internal-pdf:\/\//i,'PDF/').trim();
					if (!url) continue;
					
					//get title from file name
					title = url.match(/([^\/\\]+)(?:\.\w{1,8})$/);
					if (title) title = decodeURIComponent(title[1]);
					else title = "Attachment";
					
					if (zField[1] == 'HTML') {
						title = "Full Text (HTML)";
						mimeType = "text/html";
					}
					
					item.attachments.push({
						title: title,
						path: url,
						mimeType: mimeType || undefined
					});
				}
				value = false;
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
		if (!ignoreUnknown && !Zotero.parentTranslator) {
			Z.debug("Entry stored in note: " + rawLine);
			item.unknownFields.push(rawLine);
		}
		return;
	}

	if (zField == 'unsupported') {
		if (!ignoreUnknown && !Zotero.parentTranslator) {
			Z.debug("Unsupported field will be stored in note: " + value);
			item.unsupportedFields.push(value);
		}
		return;
	}

	//check if field is valid for item type
	if (!Zotero.parentTranslator //cannot use this in connectors, plus we drop notes in most cases anyway
		&& zField != 'creators' && zField != 'tags'
		&& zField != 'notes' && zField != 'attachments'
		&& zField != 'DOI'
		&& !ZU.fieldIsValidForType(zField, item.itemType)) {
		Z.debug("Invalid field '" + zField + "' for item type '" + item.itemType + "'.");
		if (!ignoreUnknown && !Zotero.parentTranslator) {
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
				item.extra += '\n' + value;
			} else {
				item.extra = value;
			}
		break;
		case 'DOI':
			value = ZU.cleanDOI(value);
			//add DOI to extra field, 
			if (!ZU.fieldIsValidForType("DOI", item.itemType) && value) {
				if (item.extra) {
					if (item.extra.search(/^DOI:/) == -1) {
						item.extra += '\nDOI: ' + value;
					}
				} else {
					item.extra = 'DOI: ' + value;
				}
				break;
			}
		default:
			//check if value already exists. Don't overwrite existing values
			if (item[zField]) {
				//if the new value is not the same as existing value, store it as note
				if (!ignoreUnknown && !Zotero.parentTranslator && item[zField] != value) {
					item.unsupportedFields.push(zField + ': ' + value);
				}
			} else {
				item[zField] = value;
			}
	}
}

function dateRIStoZotero(risDate, zField) {
	var date = [];
	//we'll be very lenient about formatting
	//First, YYYY/MM/DD/other with everything but year optional
	var m = risDate.match(/^(\d+)(?:\/(\d{0,2})(?:\/(\d{0,2})(?:(?:\/|\s)([^\/]*))?)?)?$/);
	var timeCheck, part;
	if (m) {
		date[0] = m[1];	//year
		date[1] = m[2];	//month
		date[2] = m[3]; //day
		timeCheck = m[4];
		part = m[4];
	} else {
		//EndNote suggests entering only Month and Day in the date field
		//We'll return this, but also add 0000 as a placeholder for year
		//This will come from PY at some point and we'll let Zotero figure out the date
		//This will NOT work with access date, but there's only so much we can do
		var y = risDate.match(/\b\d{4}\b/);
		var d = risDate.match(/\b(?:[1-3]\d|[1-9])\b/);
		m = risDate.match(/[A-Za-z]+/);
		if (!y && m) {
			return '0000 ' + m[0] + (d ? ' ' + d[0] : '');
		}
		
		// Only try harder with access dates, since those get dropped otherwise
		// For everything else, Zotero will go through the same algorithm later
		// but at least we won't be discarding anything
		if (zField != 'accessDate') return risDate;
		
		// Let Zotero try and figure this out
		var parsedDate = ZU.strToDate(risDate);
		if (!parsedDate || !parsedDate.year) {
			return risDate;
		}
		
		date[0] = parsedDate.year;
		date[1] = '' + (parsedDate.month + 1);
		date[2] = '' + parsedDate.day;
		part = parsedDate.part;
	}

	//sometimes unknown parts of date are given as 0. Drop these and anything that follows
	for (var i=0; i<3; i++) {
		if (date[i] !== undefined) date[i] = date[i].replace(/^0+/,'');	//drop leading 0s

		if (!date[i]) {
			date.splice(i);
			break;
		}
	}

	if (zField == "accessDate") {	//format this as SQL date
		if (!date[0]) return risDate;	//this should never happed

		//adjust month to be 0 based
		if (date[1]) {
			date[1] = parseInt(date[1], 10);
			if (date[1]) date[1] = '' + (date[1] - 1);	//make it a string again to keep things simpler
			else date[1] = '0';	//the regex above should ensure this never happens. We don't even test the day
		}

		//make sure we have a month and day
		if (!date[1]) date[1] = '0';	//0 based months
		if (!date[2]) date[2] = '1';

		var time;
		if (timeCheck) {
			time = timeCheck.match(/\b([0-2]?[1-9]):(\d{2})(?::(\d{2}))\s*(am|pm)?/i);
			if (time) {
				if (!time[3]) time[3] = '0';

				if (time[4]) {
					var hour = parseInt(time[1],10);	//this should not fail
					if (time[4].toLowerCase() == 'pm' && hour < 12) {
						time[1] = '' + (hour + 12);
					} else if (time[4].toLowerCase() == 'am' && hour == 12) {
						time[1] = '0';
					}
				}
			}
		}

		/** 
		 * we export as UTC, so assume UTC on import as well,
		 * but only if we have a time part. Otherwise this might be coming from
		 * other software, which is probably local time.
		 * (maybe also look for time zone in the future)
		 */
		var d = new Date();
		/** We intentionally avoid passing parameters in the constructor,
		 * because it interprets dates with 2 digits or less as 1900+ dates.
		 * This is clearly not a problem with accessDate, but maybe this will
		 * end up being used for something else later.
		 */
		if (time) {
			d.setUTCFullYear(date[0], date[1], date[2]);
			d.setUTCHours(time[1], time[2], time[3]);
		} else {
			d.setFullYear(date[0], date[1], date[2]);
		}

		var pad = function(n, width) {
			n = '000' + n;	//that should be sufficient for our purposes here
			return n.substr(n.length-width);
		}

		var sqlDate

		return pad(d.getUTCFullYear(), 4) + '-' + pad(d.getUTCMonth() + 1, 2)
			+ '-' + pad(d.getUTCDate(), 2)
			+ (time ? ' '	+ pad(d.getUTCHours(), 2) + ':'
							+ pad(d.getUTCMinutes(), 2) + ':'
							+ pad(d.getUTCSeconds(), 2)
					: '');
	} else {
		//adjust month (it's 0 based)
		if (date[1]) {
			date[1] = parseInt(date[1], 10);
			if (date[1]) date[1]--;
		}

		return ZU.formatDate({
				'year': date[0],
				'month': date[1],
				'day': date[2]
			});
	}
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
		} else {
			item[item.backupDate.field] = item[item.backupDate.field]
				.replace(/\b0000\b/, item.backupDate.value);
		}
		item.backupDate = undefined;
	}

	//same for access date
	if (item.backupAccessDate) {
		if (!item[item.backupAccessDate.field]) {
			item[item.backupAccessDate.field] = item.backupAccessDate.value;
		}
		item.backupAccessDate = undefined;
	}
	
	if (item.DOI) {
		// Only clean DOI if we get something back. Otherwise just leave it be
		var cleanDOI = ZU.cleanDOI(item.DOI);
		if (cleanDOI) item.DOI = cleanDOI;
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
			item.notes.push({note: note.trim(), tags: ['_RIS import']});
		}
	}
	item.unsupportedFields = undefined;
	item.unknownFields = undefined;

	return item.complete();
}

//creates a new item of specified type
function getNewItem(type) {
	var item = new Zotero.Item(type);
	item.unknownFields = [];
	item.unsupportedFields = [];
	return item;
}

function doImport() {
	if (typeof Promise == 'undefined') {
		startImport(
			function () {},
			function (e) {
				throw e;
			}
		);
	}
	else {
		return new Promise(function (resolve, reject) {
			startImport(resolve, reject);
		});
	}
}

function startImport(resolve, reject) {
	try {
		//set up import field mapper
		var maps = [fieldMap, degenerateImportFieldMap];
		if (exportedOptions.fieldMap) maps.unshift(exportedOptions.fieldMap);
		importFields = new TagMapper(maps);
		
		//prepare some configurable options
		if (Zotero.getHiddenPref) {
			var pref = Zotero.getHiddenPref("RIS.import.ignoreUnknown");
			if (pref != undefined) {
				ignoreUnknown = pref;
			}
			var pref = Zotero.getHiddenPref("RIS.import.keepID");
			if (pref === true) {
				degenerateImportFieldMap.ID = pref;
			}
		}
		
		importNext(resolve, reject);
	}
	catch (e) {
		reject(e);
	}
}

function importNext(resolve, reject) {
	try {
		var entry;
		while (entry = RISReader.nextEntry()) {
			//determine item type
			var itemType = exportedOptions.itemType;
			if (!itemType && entry.tags.TY) {
				var risType = entry.tags.TY[0].value.trim().toUpperCase();
				if (exportedOptions.typeMap) {
					itemType = exportedOptions.typeMap[risType];
				}
				if (!itemType) {
					itemType = importTypeMap[risType];
				}
			}
			
			//we allow entries without TY and just use default type
			if (!itemType) {
				var defaultType = exportedOptions.defaultItemType || DEFAULT_IMPORT_TYPE;
				if (entry.tags.TY) {
					Z.debug("RIS: Unknown item type: " + entry.tags.TY[0].value
						+ ". Defaulting to " + defaultType);
				} else {
					Z.debug("RIS: TY tag not specified. Defaulting to " + defaultType);
				}
				
				itemType = defaultType;
			}
			
			var item = getNewItem(itemType);
			ProCiteCleaner.cleanTags(entry, item); //clean up ProCite "tags"
			EndNoteCleaner.cleanTags(entry, item); //some tweaks to EndNote export
			CitaviCleaner.cleanTags(entry, item);
			
			for (var i=0, n=entry.length; i<n; i++) {
				if ((['TY', 'ER']).indexOf(entry[i].tag) == -1) { //ignore TY and ER tags
					processTag(item, entry[i], entry);
				}
			}
			
			var maybePromise = completeItem(item);
			if (maybePromise) {
				maybePromise.then(function () {
					importNext(resolve, reject);
				});
				return;
			}
		}
	}
	catch (e) {
		reject(e);
	}
	
	resolve();
}

/********************
 * Export Functions *
 ********************/

//RIS files have a certain structure, which is often meaningful
//Records always start with TY and end with ER. This is hardcoded below
var exportOrder = {
	"__default": ["TI", "AU", "T2", "A2", "T3", "A3", "A4", "AB", "C1", "C2", "C3",
	"C4", "C5", "C6", "CN", "CY", "DA", "PY", "DO", "DP", "ET", "VL", "IS", "SP",
	"J2", "LA", "M1", "M3", "NV", "OP", "PB", "SE", "SN", "ST", "SV", "UR", "AN",
	"DB", "Y2", "L1", "L2", "L4", "N1", "KW"],
	//in bill sponsor (A2) and cosponsor (A3) should be together and not split by legislativeBody (T3)
	"bill": ["TI", "AU", "T2", "A2", "A3", "T3", "A4", "AB", "C1", "C2", "C3",
	"C4", "C5", "C6", "CN", "CY", "DA", "PY", "DO", "DP", "ET", "VL", "IS", "SP",
	"J2", "LA", "M1", "M3", "NV", "OP", "PB", "SE", "SN", "ST", "SV", "UR", "AN",
	"DB", "Y2", "L1", "L2", "L4", "N1", "KW"]
};

var newLineChar = "\r\n"; //from spec

//set up export field mapping
var exportFields;

function addTag(tag, value) {
	if (!(value instanceof Array)) value = [value];

	for (var i=0, n=value.length; i<n; i++) {
		if (value[i] === undefined) return;
		//don't export empty strings
		var v = (value[i] + '').trim();
		if (!v) continue;

		Zotero.write(tag + "  - " + v + newLineChar);
	}
}

function doExport() {
	var item, order, tag, fields, field, value;
	
	//set up field mapper
	var map = [fieldMap];
	if (exportedOptions.fieldMap) map.unshift(exportedOptions.fieldMap);
	exportFields = new TagMapper(map);

	while (item = Zotero.nextItem()) {
		// can't store independent notes in RIS
		if (item.itemType == "note" || item.itemType == "attachment") {
			continue;
		}

		// type
		var type = exportTypeMap[item.itemType];
		if (!type) {
			type = DEFAULT_EXPORT_TYPE;
			Z.debug("Unknown item type: " + item.itemType + ". Defaulting to " + type);
		}
		addTag("TY", type);

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
			field = exportFields.getField(item.itemType, tag);

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
					if (item.notes && Zotero.getOption("exportNotes")) {
						value = item.notes.map(function(n) { return n.note.replace(/(?:\r\n?|\n)/g, "\r\n"); });
					}
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
							tag = "EP";
							value = m[2];
						} else {
							value = item.pages;
						}
					}
				break;
				default:
					value = item[field];
			}

			//handle special cases based on RIS tag
			switch (tag) {
				case "PY":
					var date = ZU.strToDate(item[field]);
					if (date.year) {
						value = ('000' + date.year).substr(-4); //since this is in export, this should not be a problem with MS JavaScript implementation of substr
					} else {
						value = item[field];
					} 
				break;
				case "Y2":
				case "DA":
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

		Zotero.write("ER  - " + newLineChar + newLineChar);
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
		"input": "TY  - JOUR\nA1  - Baldwin,S.A.\nA1  - Fugaccia,I.\nA1  - Brown,D.R.\nA1  - Brown,L.V.\nA1  - Scheff,S.W.\nT1  - Blood-brain barrier breach following\ncortical contusion in the rat\nJO  - J.Neurosurg.\nY1  - 1996\nVL  - 85\nSP  - 476\nEP  - 481\nRP  - Not In File\nKW  - cortical contusion\nKW  - blood-brain barrier\nKW  - horseradish peroxidase\nKW  - head trauma\nKW  - hippocampus\nKW  - rat\nN2  - Adult Fisher 344 rats were subjected to a unilateral impact to the dorsal cortex above the hippocampus at 3.5 m/sec with a 2 mm cortical depression. This caused severe cortical damage and neuronal loss in hippocampus subfields CA1, CA3 and hilus. Breakdown of the blood-brain barrier (BBB) was assessed by injecting the protein horseradish peroxidase (HRP) 5 minutes prior to or at various times following injury (5 minutes, 1, 2, 6, 12 hours, 1, 2, 5, and 10 days). Animals were killed 1 hour after HRP injection and brain sections were reacted with diaminobenzidine to visualize extravascular accumulation of the protein. Maximum staining occurred in animals injected with HRP 5 minutes prior to or 5 minutes after cortical contusion. Staining at these time points was observed in the ipsilateral hippocampus. Some modest staining occurred in the dorsal contralateral cortex near the superior sagittal sinus. Cortical HRP stain gradually decreased at increasing time intervals postinjury. By 10 days, no HRP stain was observed in any area of the brain. In the ipsilateral hippocampus, HRP stain was absent by 3 hours postinjury and remained so at the 6- and 12- hour time points. Surprisingly, HRP stain was again observed in the ipsilateral hippocampus 1 and 2 days following cortical contusion, indicating a biphasic opening of the BBB following head trauma and a possible second wave of secondary brain damage days after the contusion injury. These data indicate regions not initially destroyed by cortical impact, but evidencing BBB breach, may be accessible to neurotrophic factors administered intravenously both immediately and days after brain trauma.\nER  - ",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Blood-brain barrier breach following cortical contusion in the rat",
				"creators": [
					{
						"lastName": "Baldwin",
						"firstName": "S.A.",
						"creatorType": "author"
					},
					{
						"lastName": "Fugaccia",
						"firstName": "I.",
						"creatorType": "author"
					},
					{
						"lastName": "Brown",
						"firstName": "D.R.",
						"creatorType": "author"
					},
					{
						"lastName": "Brown",
						"firstName": "L.V.",
						"creatorType": "author"
					},
					{
						"lastName": "Scheff",
						"firstName": "S.W.",
						"creatorType": "author"
					}
				],
				"date": "1996",
				"abstractNote": "Adult Fisher 344 rats were subjected to a unilateral impact to the dorsal cortex above the hippocampus at 3.5 m/sec with a 2 mm cortical depression. This caused severe cortical damage and neuronal loss in hippocampus subfields CA1, CA3 and hilus. Breakdown of the blood-brain barrier (BBB) was assessed by injecting the protein horseradish peroxidase (HRP) 5 minutes prior to or at various times following injury (5 minutes, 1, 2, 6, 12 hours, 1, 2, 5, and 10 days). Animals were killed 1 hour after HRP injection and brain sections were reacted with diaminobenzidine to visualize extravascular accumulation of the protein. Maximum staining occurred in animals injected with HRP 5 minutes prior to or 5 minutes after cortical contusion. Staining at these time points was observed in the ipsilateral hippocampus. Some modest staining occurred in the dorsal contralateral cortex near the superior sagittal sinus. Cortical HRP stain gradually decreased at increasing time intervals postinjury. By 10 days, no HRP stain was observed in any area of the brain. In the ipsilateral hippocampus, HRP stain was absent by 3 hours postinjury and remained so at the 6- and 12- hour time points. Surprisingly, HRP stain was again observed in the ipsilateral hippocampus 1 and 2 days following cortical contusion, indicating a biphasic opening of the BBB following head trauma and a possible second wave of secondary brain damage days after the contusion injury. These data indicate regions not initially destroyed by cortical impact, but evidencing BBB breach, may be accessible to neurotrophic factors administered intravenously both immediately and days after brain trauma.",
				"journalAbbreviation": "J.Neurosurg.",
				"pages": "476-481",
				"publicationTitle": "J.Neurosurg.",
				"volume": "85",
				"attachments": [],
				"tags": [
					"blood-brain barrier",
					"cortical contusion",
					"head trauma",
					"hippocampus",
					"horseradish peroxidase",
					"rat"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "TY  - PAT\nA1  - Burger,D.R.\nA1  - Goldstein,A.S.\nT1  - Method of detecting AIDS virus infection\nY1  - 1990/2/27\nVL  - 877609\nIS  - 4,904,581\nRP  - Not In File\nA2  - Epitope,I.\nCY  - OR\nPB  - 4,629,783\nKW  - AIDS\nKW  - virus\nKW  - infection\nKW  - antigens\nY2  - 1986/6/23\nM1  - G01N 33/569 G01N 33/577\nM2  - 435/5 424/3 424/7.1 435/7 435/29 435/32 435/70.21 435/240.27 435/172.2 530/387 530/808 530/809 935/110\nN2  - A method is disclosed for detecting the presence of HTLV III infected cells in a medium. The method comprises contacting the medium with monoclonal antibodies against an antigen produced as a result of the infection and detecting the binding of the antibodies to the antigen. The antigen may be a gene product of the HTLV III virus or may be bound to such gene product. On the other hand the antigen may not be a viral gene product but may be produced as a result of the infection and may further be bound to a lymphocyte. The medium may be a human body fluid or a culture medium. A particular embodiment of the present method involves a method for determining the presence of a AIDS virus in a person. The method comprises combining a sample of a body fluid from the person with a monoclonal antibody that binds to an antigen produced as a result of the infection and detecting the binding of the monoclonal antibody to the antigen. The presence of the binding indicates the presence of a AIDS virus infection. Also disclosed are novel monoclonal antibodies, noval compositions of matter, and novel diagnostic kits\nER  - ",
		"items": [
			{
				"itemType": "patent",
				"title": "Method of detecting AIDS virus infection",
				"creators": [
					{
						"lastName": "Burger",
						"firstName": "D.R.",
						"creatorType": "inventor"
					},
					{
						"lastName": "Goldstein",
						"firstName": "A.S.",
						"creatorType": "inventor"
					}
				],
				"issueDate": "February 27, 1990",
				"abstractNote": "A method is disclosed for detecting the presence of HTLV III infected cells in a medium. The method comprises contacting the medium with monoclonal antibodies against an antigen produced as a result of the infection and detecting the binding of the antibodies to the antigen. The antigen may be a gene product of the HTLV III virus or may be bound to such gene product. On the other hand the antigen may not be a viral gene product but may be produced as a result of the infection and may further be bound to a lymphocyte. The medium may be a human body fluid or a culture medium. A particular embodiment of the present method involves a method for determining the presence of a AIDS virus in a person. The method comprises combining a sample of a body fluid from the person with a monoclonal antibody that binds to an antigen produced as a result of the infection and detecting the binding of the monoclonal antibody to the antigen. The presence of the binding indicates the presence of a AIDS virus infection. Also disclosed are novel monoclonal antibodies, noval compositions of matter, and novel diagnostic kits",
				"applicationNumber": "G01N 33/569 G01N 33/577",
				"assignee": "4,629,783",
				"extra": "435/5 424/3 424/7.1 435/7 435/29 435/32 435/70.21 435/240.27 435/172.2 530/387 530/808 530/809 935/110",
				"issuingAuthority": "Epitope,I.",
				"place": "OR",
				"attachments": [],
				"tags": [
					"AIDS",
					"antigens",
					"infection",
					"virus"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "TY  - AGGR\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nCA  - Caption\nCY  - Place Published\nDA  - Date Accessed\nDB  - Name of Database\nDO  - 10.1234/123456\nDP  - Database Provider\nET  - Date Published\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Publication Number\nM3  - Type of Work\nN1  - Notes\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRN  - ResearchNotes\nSE  - Screens\nSN  - ISSN/ISBN\nSP  - Pages\nST  - Short Title\nT2  - Periodical\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nID  - 2\nER  - \n\n\nTY  - ANCIENT\nA2  - Editor\nA4  - Translator\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nCN  - Call Number\nCA  - Caption\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Abbreviated Publication\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Text Number\nM3  - Type of Work\nN1  - Notes\nNV  - Number of Volumes\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRI  - Reviewed Item\nRN  - ResearchNotes\nRP  - Reprint Edition\nSN  - ISBN\nSP  - Pages\nST  - Short Title\nT2  - Publication Title\nT3  - Volume Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 3\nER  - \n\n\nTY  - ART\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Artist\nC3  - Size/Length\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDP  - Database Provider\nDO  - DOI\nET  - Edition\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Size\nM3  - Type of Work\nN1  - Notes\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSP  - Description\nST  - Short Title\nTI  - Title\nTT  - Translated Title\nTA  - Author, Translated\nUR  - URL\nY2  - Access Date\nID  - 4\nER  - \n\n\nTY  - ADVS\nA2  - Performers\nA3  - Editor, Series\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Cast\nC2  - Credits\nC3  - Size/Length\nC5  - Format\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Number\nM3  - Type\nN1  - Notes\nNV  - Extent of Work\nOP  - Contents\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSN  - ISBN\nST  - Short Title\nT3  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 5\nER  - \n\n\nTY  - BILL\nA2  - Sponsor\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nCA  - Caption\nCN  - Call Number\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Session\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nN1  - Notes\nM1  - Bill Number\nOP  - History\nPY  - Year\nRN  - Research Notes\nSE  - Code Section\nSP  - Code Pages\nST  - Short Title\nT2  - Code\nT3  - Legislative Body\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Code Volume\nY2  - Access Date\nID  - 6\nER  - \n\n\nTY  - BLOG\nA2  - Editor\nA3  - Illustrator\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Author Affiliation\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Last Update Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM3  - Type of Medium\nN1  - Notes\nOP  - Contents\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSE  - Message Number\nSN  - ISBN\nSP  - Description\nST  - Short Title\nT2  - Title of WebLog\nT3  - Institution\nTA  - Author, Translated\nTI  - Title of Entry\nTT  - Translated Title\nUR  - URL\nVL  - Access Year\nY2  - Number\nID  - 7\nER  - \n\n\nTY  - BOOK\nA2  - Editor, Series\nA3  - Editor\nA4  - Translator\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC3  - Title Prefix\nC4  - Reviewer\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Abbreviation\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Series Volume\nM3  - Type of Work\nN1  - Notes\nNV  - Number of Volumes\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nRP  - Reprint Edition\nSE  - Pages\nSN  - ISBN\nSP  - Number of Pages\nST  - Short Title\nT2  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 8\nER  - \n\n\nTY  - CHAP\nA2  - Editor\nA3  - Editor, Series\nA4  - Translator\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Section\nC3  - Title Prefix\nC4  - Reviewer\nC5  - Packaging Method\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Abbreviation\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Number of Volumes\nOP  - Original Publication\nN1  - Notes\nPB  - Publisher\nPY  - Year\nRI  - Reviewed Item\nRN  - Research Notes\nRP  - Reprint Edition\nSE  - Chapter\nSN  - ISBN\nSP  - Pages\nST  - Short Title\nSV  - Series Volume\nT2  - Book Title\nT3  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 9\nER  - \n\n\nTY  - CASE\nA2  - Reporter\nA3  - Court, Higher\nA4  - Counsel\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nCA  - Caption\nCN  - Call Number\nDA  - Date Accessed\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Action of Higher Court\nJ2  - Parallel Citation\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM3  - Citation of Reversal\nN1  - Notes\nNV  - Reporter Abbreviation\nOP  - History\nPB  - Court\nPY  - Year Decided\nRN  - ResearchNotes\nSE  - Filed Date\nSP  - First Page\nST  - Abbreviated Case Name\nSV  - Docket Number\nT3  - Decision\nTA  - Author, Translated\nTI  - Case Name\nTT  - Translated Title\nUR  - URL\nVL  - Reporter Volume\nID  - 10\nER  - \n\n\nTY  - CTLG\nA2  - Institution\nA4  - Translator\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC5  - Packaging Method\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Abbreviation\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Series Volume\nM3  - Type of Work\nN1  - Notes\nNV  - Catalog Number\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nRP  - Reprint Edition\nSE  - Number of Pages\nSN  - ISBN\nSP  - Pages\nST  - Short Title\nT2  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 11\nER  - \n\n\nTY  - CHART\nA2  - File, Name of\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - By, Created\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Version\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Number\nM3  - Type of Image\nN1  - Notes\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSP  - Description\nT2  - Image Source Program\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Image Size\nY2  - Access Date\nID  - 12\nER  - \n\n\nTY  - CLSWK\nA2  - Editor, Series\nA4  - Translator\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Attribution\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Series Volume\nM3  - Type\nN1  - Notes\nNV  - Number of Volumes\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nRP  - Reprint Edition\nSN  - ISSN/ISBN\nSP  - Number of Pages\nST  - Short Title\nT2  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 23\nER  - \n\n\nTY  - COMP\nA2  - Editor, Series\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Programmer\nC1  - Computer\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Version\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM3  - Type\nN1  - Notes\nOP  - Contents\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSN  - ISBN\nSP  - Description\nST  - Short Title\nT2  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Edition\nY2  - Access Date\nID  - 14\nER  - \n\n\nTY  - CPAPER\nA2  - Editor\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Place Published\nCA  - Caption\nCY  - Conference Location\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Issue\nM3  - Type\nN1  - Notes\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSP  - Pages\nT2  - Conference Name\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 15\nER  - \n\n\nTY  - CONF\nA2  - Editor\nA3  - Editor, Series\nA4  - Sponsor\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Place Published\nC2  - Year Published\nC3  - Proceedings Title\nC5  - Packaging Method\nCA  - Caption\nCN  - Call Number\nCY  - Conference Location\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Issue\nN1  - Notes\nNV  - Number of Volumes\nOP  - Source\nPB  - Publisher\nPY  - Year of Conference\nRN  - Research Notes\nSN  - ISBN\nSP  - Pages\nST  - Short Title\nT2  - Conference Name\nT3  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 16\nER  - \n\n\nTY  - DATA\nA2  - Producer\nA4  - Agency, Funding\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Investigators\nC1  - Time Period\nC2  - Unit of Observation\nC3  - Data Type\nC4  - Dataset(s)\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date of Collection\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Version\nJ2  - Abbreviation\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nN1  - Notes\nNV  - Study Number\nOP  - Version History\nPB  - Distributor\nPY  - Year\nRI  - Geographic Coverage\nRN  - Research Notes\nSE  - Original Release Date\nSN  - ISSN\nST  - Short Title\nT3  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nY2  - Access Date\nID  - 17\nER  - \n\n\nTY  - DICT\nA2  - Editor\nA4  - Translator\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Term\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Abbreviation\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Number\nM3  - Type of Work\nN1  - Notes\nNV  - Number of Volumes\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRI  - Reviewed Item\nRN  - Research Notes\nRP  - Reprint Edition\nSE  - Version\nSN  - ISBN\nSP  - Pages\nST  - Short Title\nT2  - Dictionary Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 13\nER  - \n\n\nTY  - EDBOOK\nA2  - Editor, Series\nA4  - Translator\nAB  - Abstract\nAD  - Editor Address\nAN  - Accession Number\nAU  - Editor\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Series Volume\nM3  - Type of Work\nN1  - Notes\nNV  - Number of Volumes\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nRP  - Reprint Edition\nSN  - ISBN\nSP  - Number of Pages\nST  - Short Title\nT2  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 19\nER  - \n\n\nTY  - EJOUR\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Year Cited\nC2  - Date Cited\nC3  - PMCID\nC4  - Reviewer\nC5  - Issue Title\nC6  - NIHMSID\nC7  - Article Number\nCA  - Caption\nCY  - Place Published\nDA  - Date Accessed\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Issue\nM3  - Type of Work\nN1  - Notes\nNV  - Document Number\nPB  - Publisher\nPY  - Year\nRI  - Reviewed Item\nRN  - Research Notes\nRP  - Reprint Edition\nSE  - E-Pub Date\nSN  - ISSN\nSP  - Pages\nST  - Short Title\nT2  - Periodical Title\nT3  - Website Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nID  - 20\nER  - \n\n\nTY  - EBOOK\nA2  - Editor\nA3  - Editor, Series\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Year Cited\nC2  - Date Cited\nC3  - Title Prefix\nC4  - Reviewer\nC5  - Last Update Date\nC6  - NIHMSID\nC7  - PMCID\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date Accessed\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM3  - Type of Medium\nN1  - Notes\nNV  - Version\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRI  - Reviewed Item\nRN  - Research Notes\nRP  - Reprint Edition\nSN  - ISBN\nSP  - Number of Pages\nT2  - Secondary Title\nT3  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nID  - 21\nER  - \n\n\nTY  - ECHAP\nA2  - Editor\nA3  - Editor, Series\nA4  - Translator\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Section\nC3  - Title Prefix\nC4  - Reviewer\nC5  - Packaging Method\nC6  - NIHMSID\nC7  - PMCID\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Series Volume\nM3  - Type of Work\nN1  - Notes\nNV  - Number of Volumes\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRI  - Reviewed Item\nRN  - Research Notes\nRP  - Reprint Edition\nSN  - ISSN/ISBN\nSP  - Number of Pages\nST  - Short Title\nT2  - Book Title\nT3  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 22\nER  - \n\n\nTY  - ENCYC\nA2  - Editor\nA4  - Translator\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Term\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Abbreviation\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nN1  - Notes\nNV  - Number of Volumes\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRI  - Reviewed Item\nRN  - Research Notes\nRP  - Reprint Edition\nSN  - ISBN\nSP  - Pages\nST  - Short Title\nT2  - Encyclopedia Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 18\nER  - \n\n\nTY  - EQUA\nA2  - File, Name of\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - By, Created\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Version\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Number\nM3  - Type of Image\nN1  - Notes\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSP  - Description\nT2  - Image Source Program\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Image Size\nY2  - Access Date\nID  - 24\nER  - \n\n\nTY  - FIGURE\nA2  - File, Name of\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - By, Created\nCN  - Call Number\nCA  - Caption\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Version\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Number\nM3  - Type of Image\nN1  - Notes\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSP  - Description\nT2  - Image Source Program\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Image Size\nY2  - Access Date\nID  - 25\nER  - \n\n\nTY  - MPCT\nA2  - Director, Series\nA3  - Producer\nA4  - Performers\nAB  - Synopsis\nAD  - Author Address\nAN  - Accession Number\nAU  - Director\nC1  - Cast\nC2  - Credits\nC4  - Genre\nC5  - Format\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date Released\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM3  - Medium\nN1  - Notes\nPB  - Distributor\nPY  - Year Released\nRN  - Research Notes\nRP  - Reprint Edition\nSP  - Running Time\nST  - Short Title\nT2  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nY2  - Access Date\nID  - 26\nER  - \n\n\nTY  - GEN\nA2  - Author, Secondary\nA3  - Author, Tertiary\nA4  - Author, Subsidiary\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Custom 1\nC2  - Custom 2\nC3  - Custom 3\nC4  - Custom 4\nC5  - Custom 5\nC6  - Custom 6\nC7  - Custom 7\nC8  - Custom 8\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Number\nM3  - Type of Work\nN1  - Notes\nNV  - Number of Volumes\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRI  - Reviewed Item\nRN  - Research Notes\nRP  - Reprint Edition\nSE  - Section\nSN  - ISSN/ISBN\nSP  - Pages\nST  - Short Title\nT2  - Secondary Title\nT3  - Tertiary Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 27\nER  - \n\n\nTY  - GOVDOC\nA2  - Department\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Government Body\nC2  - Congress Number\nC3  - Congress Session\nCA  - Caption\nCY  - Place Published\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Number\nN1  - Notes\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSE  - Section\nSN  - ISSN/ISBN\nSP  - Pages\nT3  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 28\nER  - \n\n\nTY  - GRANT\nA4  - Translator\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Investigators\nC1  - Contact Name\nC2  - Contact Address\nC3  - Contact Phone\nC4  - Contact Fax\nC5  - Funding Number\nC6  - CFDA Number\nCA  - Caption\nCN  - Call Number\nCY  - Activity Location\nDA  - Deadline\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Requirements\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Status\nM3  - Funding Type\nN1  - Notes\nNV  - Amount Received\nOP  - Original Grant Number\nPB  - Sponsoring Agency\nPY  - Year\nRI  - Reviewed Item\nRN  - Research Notes\nRP  - Review Date\nSE  - Duration of Grant\nSP  - Pages\nST  - Short Title\nTA  - Author, Translated\nTI  - Title of Grant\nTT  - Translated Title\nUR  - URL\nVL  - Amount Requested\nY2  - Access Date\nID  - 29\nER  - \n\n\nTY  - HEAR\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nC2  - Congress Number\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Session\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Document Number\nN1  - Notes\nNV  - Number of Volumes\nOP  - History\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSN  - ISBN\nSP  - Pages\nST  - Short Title\nT2  - Committee\nT3  - Legislative Body\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nY2  - Access Date\nID  - 30\nER  - \n\n\nTY  - JOUR\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Legal Note\nC2  - PMCID\nC6  - NIHMSID\nC7  - Article Number\nCA  - Caption\nCN  - Call Number\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Epub Date\nJ2  - Periodical Title\nLA  - Language\nLB  - Label\nIS  - Issue\nM3  - Type of Article\nOP  - Original Publication\nPY  - Year\nRI  - Reviewed Item\nRN  - Research Notes\nRP  - Reprint Edition\nSE  - Start Page\nSN  - ISSN\nSP  - Pages\nST  - Short Title\nT2  - Journal\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 31\nER  - \n\n\nTY  - LEGAL\nA2  - Organization, Issuing\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date of Code Edition\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Start Page\nM3  - Type of Work\nN1  - Notes\nNV  - Session Number\nOP  - History\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSE  - Section Number\nSN  - ISSN/ISBN\nSP  - Pages\nT2  - Title Number\nT3  - Supplement No.\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Rule Number\nY2  - Access Date\nID  - 32\nER  - \n\n\nTY  - MGZN\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Issue Number\nM3  - Type of Article\nN1  - Notes\nNV  - Frequency\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRI  - Reviewed Item\nRN  - Research Notes\nRP  - Reprint Edition\nSE  - Start Page\nSN  - ISSN\nSP  - Pages\nST  - Short Title\nT2  - Magazine\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 33\nER  - \n\n\nTY  - MANSCPT\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Description of Material\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Folio Number\nM3  - Type of Work\nN1  - Notes\nNV  - Manuscript Number\nPB  - Library/Archive\nPY  - Year\nRN  - Research Notes\nRP  - Reprint Edition\nSE  - Start Page\nSP  - Pages\nST  - Short Title\nT2  - Collection Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume/Storage Container\nY2  - Access Date\nID  - 34\nER  - \n\n\nTY  - MAP\nA2  - Editor, Series\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Cartographer\nC1  - Scale\nC2  - Area\nC3  - Size\nC5  - Packaging Method\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM3  - Type\nN1  - Notes\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nRP  - Reprint Edition\nSN  - ISSN/ISBN\nSP  - Description\nST  - Short Title\nT2  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nY2  - Access Date\nID  - 35\nER  - \n\n\nTY  - MUSIC\nA2  - Editor\nA3  - Editor, Series\nA4  - Producer\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Composer\nC1  - Format of Music\nC2  - Form of Composition\nC3  - Music Parts\nC4  - Target Audience\nC5  - Accompanying Matter\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM3  - Form of Item\nN1  - Notes\nNV  - Number of Volumes\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nRP  - Reprint Edition\nSE  - Section\nSN  - ISBN\nSP  - Pages\nST  - Short Title\nT2  - Album Title\nT3  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 36\nER  - \n\n\nTY  - NEWS\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Reporter\nC1  - Column\nC2  - Issue\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Issue Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  -  Edition\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Start Page\nM3  - Type of Article\nN1  - Notes\nNV  - Frequency\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRI  - Reviewed Item\nRN  - Research Notes\nRP  - Reprint Edition\nSE  - Section\nSN  - ISSN\nSP  - Pages\nST  - Short Title\nT2  - Newspaper\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 37\nER  - \n\n\nTY  - DBASE\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nCA  - Caption\nCY  - Place Published\nDA  - Date Accessed\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Date Published\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM3  - Type of Work\nN1  - Notes\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSN  - Report Number\nSP  - Pages\nT2  - Periodical\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nID  - 38\nER  - \n\n\nTY  - MULTI\nA2  - Editor, Series\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - By, Created\nC1  - Year Cited\nC2  - Date Cited\nC5  - Format/Length\nCA  - Caption\nDA  - Date Accessed\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Number of Screens\nM3  - Type of Work\nN1  - Notes\nPB  - Distributor\nPY  - Year\nRN  - Research Notes\nT2  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nID  - 39\nER  - \n\n\nTY  - PAMP\nA2  - Institution\nA4  - Translator\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC5  - Packaging Method\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Abbreviation\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Series Volume\nM3  - Type of Work\nN1  - Notes\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nRP  - Reprint Edition\nM2  - Number of Pages\nSN  - ISBN\nSP  - Pages\nST  - Short Title\nT2  - Published Source\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Number\nY2  - Access Date\nID  - 40\nER  - \n\n\nTY  - PAT\nA2  - Organization, Issuing\nA3  - International Author\nAB  - Abstract\nAD  - Inventor Address\nAN  - Accession Number\nAU  - Inventor\nC2  - Issue Date\nC3  - Designated States\nC4  - Attorney/Agent\nC5  - References\nC6  - Legal Status\nCA  - Caption\nCN  - Call Number\nCY  - Country\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - International Patent Classification\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Application Number\nM3  - Patent Type\nN1  - Notes\nNV  - US Patent Classification\nOP  - Priority Numbers\nPB  - Assignee\nPY  - Year\nRN  - Research Notes\nSE  - International Patent Number\nSN  - Patent Number\nSP  - Pages\nST  - Short Title\nT2  - Published Source\nT3  - Title, International\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Patent Version Number\nY2  - Access Date\nID  - 41\nER  - \n\n\nTY  - PCOMM\nA2  - Recipient\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Senders E-Mail\nC2  - Recipients E-Mail\nCN  - Call Number\nCA  - Caption\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Description\nJ2  - Abbreviation\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Folio Number\nM3  - Type\nN1  - Notes\nNV  - Communication Number\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSP  - Pages\nST  - Short Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nY2  - Access Date\nID  - 42\nER  - \n\n\nTY  - RPRT\nA2  - Editor, Series\nA3  - Publisher\nA4  - Department/Division\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC6  - Issue\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Document Number\nM3  - Type\nN1  - Notes\nNV  - Series Volume\nOP  - Contents\nPB  - Institution\nPY  - Year\nRN  - Research Notes\nRP  - Notes\nSN  - Report Number\nSP  - Pages\nST  - Short Title\nTA  - Author, Translated\nT2  - Series Title\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 43\nER  - \n\n\nTY  - SER\nA2  - Editor\nA3  - Editor, Series\nA4  - Editor, Volume\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Section\nC2  - Report Number\nC5  - Packaging Method\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Abbreviation\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Series Volume\nM3  - Type of Work\nN1  - Notes\nNV  - Number of Volumes\nOP  - Original Publication\nPB  - Publisher\nPY  - Year\nRI  - Reviewed Item\nRN  - Research Notes\nRP  - Reprint Edition\nSE  - Chapter\nSN  - ISBN\nSP  - Pages\nST  - Short Title\nT2  - Secondary Title\nT3  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Volume\nY2  - Access Date\nID  - 44\nER  - \n\n\nTY  - STAND\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Institution\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nJ2  - Abbreviation\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Start Page\nM3  - Type of Work\nN1  - Notes\nNV  - Session Number\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSE  - Section Number\nSN  - Document Number\nSP  - Pages\nT2  - Section Title\nT3  - Paper Number\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Rule Number\nY2  - Access Date\nID  - 45\nER  - \n\n\nTY  - STAT\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nC5  - Publisher\nC6  - Volume\nCA  - Caption\nCN  - Call Number\nCY  - Country\nDA  - Date Enacted\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Session\nJ2  - Abbreviation\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Public Law Number\nN1  - Notes\nNV  - Statute Number\nOP  - History\nPB  - Source\nPY  - Year\nRI  - Article Number\nRN  - Research Notes\nSE  - Sections\nSP  - Pages\nST  - Short Title\nT2  - Code\nT3  - International Source\nTA  - Author, Translated\nTI  - Name of Act\nTT  - Translated Title\nUR  - URL\nVL  - Code Number\nY2  - Access Date\nID  - 46\nER  - \n\n\nTY  - THES\nA3  - Advisor\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Document Number\nM3  - Thesis Type\nN1  - Notes\nPB  - University\nPY  - Year\nRN  - Research Notes\nSP  - Number of Pages\nST  - Short Title\nT2  - Academic Department\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Degree\nY2  - Access Date\nID  - 47\nER  - \n\n\nTY  - UNPB\nA2  - Editor, Series\nAB  - Abstract\nAD  - Author Address\nAU  - Name1, Author\nAU  - Name2, Author\nCA  - Caption\nCY  - Place Published\nDA  - Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nJ2  - Abbreviation\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Number\nM3  - Type of Work\nN1  - Notes\nPB  - Institution\nPY  - Year\nRN  - Research Notes\nSP  - Pages\nST  - Short Title\nT2  - Series Title\nT3  - Department\nTA  - Author, Translated\nTI  - Title of Work\nTT  - Translated Title\nUR  - URL\nY2  - Access Date\nID  - 48\nER  - \n\n\nTY  - WEB\nA2  - Editor, Series\nAB  - Abstract\nAD  - Author Address\nAN  - Accession Number\nAU  - Name1, Author\nAU  - Name2, Author\nC1  - Year Cited\nC2  - Date Cited\nCA  - Caption\nCN  - Call Number\nCY  - Place Published\nDA  - Last Update Date\nDB  - Name of Database\nDO  - DOI\nDP  - Database Provider\nET  - Edition\nJ2  - Periodical Title\nKW  - Keyword1, Keyword2, Keyword3\nKeyword4; Keyword5\nLA  - Language\nLB  - Label\nM1  - Access Date\nM3  - Type of Medium\nN1  - Notes\nOP  - Contents\nPB  - Publisher\nPY  - Year\nRN  - Research Notes\nSN  - ISBN\nSP  - Description\nST  - Short Title\nT2  - Series Title\nTA  - Author, Translated\nTI  - Title\nTT  - Translated Title\nUR  - URL\nVL  - Access Year\nID  - 49\nER  - \n\n\n",
		"items": [
			{
				"itemType": "document",
				"title": "Title",
				"creators": [
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"extra": "DOI: 10.1234/123456\nPublication Number",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"publisher": "Publisher",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>ResearchNotes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "document",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"creatorType": "editor",
						"fieldMode": 1
					},
					{
						"lastName": "Translator",
						"creatorType": "translator",
						"fieldMode": 1
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"extra": "Text Number",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"publisher": "Publisher",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>ResearchNotes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "artwork",
				"title": "Title",
				"creators": [
					{
						"lastName": "Artist",
						"creatorType": "artist",
						"fieldMode": 1
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"artworkMedium": "Type of Work",
				"artworkSize": "Size/Length",
				"callNumber": "Call Number",
				"extra": "Size",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "film",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"firstName": "Series",
						"creatorType": "producer"
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "director"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "director"
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"distributor": "Publisher",
				"extra": "Number",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"shortTitle": "Short Title",
				"url": "URL",
				"videoRecordingFormat": "Format",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "bill",
				"title": "Title",
				"creators": [
					{
						"lastName": "Sponsor",
						"creatorType": "sponsor",
						"fieldMode": 1
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"billNumber": "Bill Number",
				"code": "Code",
				"codePages": "Code Pages",
				"codeVolume": "Code Volume",
				"history": "History",
				"language": "Language",
				"legislativeBody": "Legislative Body",
				"section": "Code Section",
				"session": "Session",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "blogPost",
				"title": "Title of Entry",
				"creators": [
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Last",
				"abstractNote": "Abstract",
				"blogTitle": "Periodical Title",
				"language": "Language",
				"shortTitle": "Short Title",
				"url": "URL",
				"websiteType": "Type of Medium",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "book",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"firstName": "Series",
						"creatorType": "seriesEditor"
					},
					{
						"lastName": "Editor",
						"creatorType": "editor",
						"fieldMode": 1
					},
					{
						"lastName": "Translator",
						"creatorType": "translator",
						"fieldMode": 1
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"edition": "Edition",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"numPages": "Number of Pages",
				"numberOfVolumes": "Number of Volumes",
				"place": "Place Published",
				"publisher": "Publisher",
				"series": "Series Title",
				"seriesNumber": "Series Volume",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "bookSection",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"creatorType": "editor",
						"fieldMode": 1
					},
					{
						"lastName": "Editor",
						"firstName": "Series",
						"creatorType": "seriesEditor"
					},
					{
						"lastName": "Translator",
						"creatorType": "translator",
						"fieldMode": 1
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"bookTitle": "Abbreviation",
				"callNumber": "Call Number",
				"edition": "Edition",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"numberOfVolumes": "Number of Volumes",
				"pages": "Pages",
				"place": "Place Published",
				"publisher": "Publisher",
				"series": "Series Title",
				"seriesNumber": "Series Volume",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "case",
				"caseName": "Abbreviated Case Name",
				"creators": [
					{
						"lastName": "Counsel",
						"creatorType": "counsel",
						"fieldMode": 1
					}
				],
				"dateDecided": "0000 Year Date",
				"abstractNote": "Abstract",
				"court": "Court",
				"docketNumber": "Docket Number",
				"firstPage": "First Page",
				"history": "History",
				"language": "Language",
				"reporter": "Reporter",
				"reporterVolume": "Reporter Volume",
				"shortTitle": "Abbreviated Case Name",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>ResearchNotes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "magazineArticle",
				"title": "Title",
				"creators": [
					{
						"lastName": "Translator",
						"creatorType": "translator",
						"fieldMode": 1
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"ISSN": "ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"extra": "Series Volume",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"pages": "Pages",
				"publicationTitle": "Series Title",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "artwork",
				"title": "Title",
				"creators": [
					{
						"lastName": "By",
						"firstName": "Created",
						"creatorType": "artist"
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"artworkMedium": "Type of Image",
				"callNumber": "Call Number",
				"extra": "Number",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "book",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"firstName": "Series",
						"creatorType": "seriesEditor"
					},
					{
						"lastName": "Translator",
						"creatorType": "translator",
						"fieldMode": 1
					},
					{
						"lastName": "Attribution",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "0000 Year",
				"ISBN": "ISSN/ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"edition": "Edition",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"numPages": "Number of Pages",
				"numberOfVolumes": "Number of Volumes",
				"place": "Place Published",
				"publisher": "Publisher",
				"series": "Series Title",
				"seriesNumber": "Series Volume",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "computerProgram",
				"title": "Title",
				"creators": [
					{
						"lastName": "Programmer",
						"creatorType": "programmer",
						"fieldMode": 1
					}
				],
				"date": "0000 Year",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"company": "Publisher",
				"libraryCatalog": "Database Provider",
				"place": "Place Published",
				"programmingLanguage": "Language",
				"seriesTitle": "Series Title",
				"shortTitle": "Short Title",
				"url": "URL",
				"version": "Version",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "conferencePaper",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"creatorType": "editor",
						"fieldMode": 1
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"conferenceName": "Conference Name",
				"extra": "Issue",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"pages": "Pages",
				"place": "Place Published",
				"publisher": "Publisher",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "conferencePaper",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"creatorType": "editor",
						"fieldMode": 1
					},
					{
						"lastName": "Editor",
						"firstName": "Series",
						"creatorType": "seriesEditor"
					},
					{
						"lastName": "Sponsor",
						"creatorType": "contributor",
						"fieldMode": 1
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"conferenceName": "Conference Name",
				"extra": "Issue",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"pages": "Pages",
				"place": "Place Published",
				"proceedingsTitle": "Proceedings Title",
				"publisher": "Publisher",
				"series": "Series Title",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "document",
				"title": "Title",
				"creators": [
					{
						"lastName": "Producer",
						"creatorType": "editor",
						"fieldMode": 1
					},
					{
						"lastName": "Agency",
						"firstName": "Funding",
						"creatorType": "translator"
					},
					{
						"lastName": "Investigators",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"publisher": "Distributor",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "dictionaryEntry",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"creatorType": "editor",
						"fieldMode": 1
					},
					{
						"lastName": "Translator",
						"creatorType": "translator",
						"fieldMode": 1
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"dictionaryTitle": "Abbreviation",
				"edition": "Edition",
				"extra": "Number",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"numberOfVolumes": "Number of Volumes",
				"pages": "Pages",
				"place": "Place Published",
				"publisher": "Publisher",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "book",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"firstName": "Series",
						"creatorType": "seriesEditor"
					},
					{
						"lastName": "Translator",
						"creatorType": "translator",
						"fieldMode": 1
					},
					{
						"lastName": "Editor",
						"creatorType": "editor",
						"fieldMode": 1
					}
				],
				"date": "0000 Year Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"edition": "Edition",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"numPages": "Number of Pages",
				"numberOfVolumes": "Number of Volumes",
				"place": "Place Published",
				"publisher": "Publisher",
				"series": "Series Title",
				"seriesNumber": "Series Volume",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Title",
				"creators": [
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"ISSN": "ISSN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"issue": "Issue",
				"journalAbbreviation": "Periodical Title",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"pages": "Pages",
				"publicationTitle": "Periodical Title",
				"series": "Website Title",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "book",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"creatorType": "seriesEditor",
						"fieldMode": 1
					},
					{
						"lastName": "Editor",
						"firstName": "Series",
						"creatorType": "editor"
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"edition": "Edition",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"numPages": "Number of Pages",
				"numberOfVolumes": "Version",
				"place": "Place Published",
				"publisher": "Publisher",
				"series": "Secondary Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "bookSection",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"creatorType": "editor",
						"fieldMode": 1
					},
					{
						"lastName": "Editor",
						"firstName": "Series",
						"creatorType": "seriesEditor"
					},
					{
						"lastName": "Translator",
						"creatorType": "translator",
						"fieldMode": 1
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"ISBN": "ISSN/ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"bookTitle": "Book Title",
				"callNumber": "Call Number",
				"edition": "Edition",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"numberOfVolumes": "Series Volume",
				"pages": "Number of Pages",
				"place": "Place Published",
				"publisher": "Publisher",
				"series": "Series Title",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "encyclopediaArticle",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"creatorType": "editor",
						"fieldMode": 1
					},
					{
						"lastName": "Translator",
						"creatorType": "translator",
						"fieldMode": 1
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"edition": "Edition",
				"encyclopediaTitle": "Abbreviation",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"numberOfVolumes": "Number of Volumes",
				"pages": "Pages",
				"place": "Place Published",
				"publisher": "Publisher",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "document",
				"title": "Title",
				"creators": [
					{
						"lastName": "File",
						"firstName": "Name of",
						"creatorType": "editor"
					},
					{
						"lastName": "By",
						"firstName": "Created",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"extra": "Number",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"publisher": "Publisher",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "artwork",
				"title": "Title",
				"creators": [
					{
						"lastName": "By",
						"firstName": "Created",
						"creatorType": "artist"
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"artworkMedium": "Type of Image",
				"callNumber": "Call Number",
				"extra": "Number",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "film",
				"title": "Title",
				"creators": [
					{
						"lastName": "Producer",
						"creatorType": "producer",
						"fieldMode": 1
					},
					{
						"lastName": "Performers",
						"creatorType": "contributor",
						"fieldMode": 1
					},
					{
						"lastName": "Director",
						"creatorType": "director",
						"fieldMode": 1
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Synopsis",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"distributor": "Distributor",
				"genre": "Genre",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"runningTime": "Running Time",
				"shortTitle": "Short Title",
				"url": "URL",
				"videoRecordingFormat": "Format",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Title",
				"creators": [
					{
						"lastName": "Author",
						"firstName": "Secondary",
						"creatorType": "editor"
					},
					{
						"lastName": "Author",
						"firstName": "Subsidiary",
						"creatorType": "translator"
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"ISSN": "ISSN/ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"issue": "Number",
				"journalAbbreviation": "Periodical Title",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"pages": "Pages",
				"publicationTitle": "Secondary Title",
				"series": "Tertiary Title",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "report",
				"title": "Title",
				"creators": [
					{
						"lastName": "Department",
						"creatorType": "seriesEditor",
						"fieldMode": 1
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"extra": "Number",
				"institution": "Publisher",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"pages": "Pages",
				"place": "Place Published",
				"reportNumber": "ISSN/ISBN",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Title of Grant",
				"creators": [
					{
						"lastName": "Translator",
						"creatorType": "translator",
						"fieldMode": 1
					},
					{
						"lastName": "Investigators",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "0000 Year Deadline",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"issue": "Status",
				"journalAbbreviation": "Periodical Title",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"pages": "Pages",
				"publicationTitle": "Periodical Title",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Amount Requested",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "hearing",
				"title": "Title",
				"creators": [],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"committee": "Committee",
				"documentNumber": "Document Number",
				"history": "History",
				"language": "Language",
				"legislativeBody": "Legislative Body",
				"numberOfVolumes": "Number of Volumes",
				"pages": "Pages",
				"place": "Place Published",
				"publisher": "Publisher",
				"session": "Session",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Title",
				"creators": [
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"ISSN": "ISSN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"issue": "Issue",
				"journalAbbreviation": "Periodical Title",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"pages": "Pages",
				"publicationTitle": "Journal",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [],
				"notes": [
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "case",
				"caseName": "Title",
				"creators": [
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"dateDecided": "0000 Year Date",
				"abstractNote": "Abstract",
				"court": "Publisher",
				"extra": "Start Page",
				"firstPage": "Pages",
				"history": "History",
				"language": "Language",
				"reporter": "Organization, Issuing",
				"reporterVolume": "Rule Number",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "magazineArticle",
				"title": "Title",
				"creators": [
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"ISSN": "ISSN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"extra": "Issue Number",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"pages": "Pages",
				"publicationTitle": "Magazine",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "manuscript",
				"title": "Title",
				"creators": [
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"extra": "Folio Number",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"manuscriptType": "Type of Work",
				"numPages": "Pages",
				"place": "Place Published",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "map",
				"title": "Title",
				"creators": [
					{
						"lastName": "Cartographer",
						"creatorType": "cartographer",
						"fieldMode": 1
					}
				],
				"date": "0000 Year Date",
				"ISBN": "ISSN/ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"edition": "Edition",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"mapType": "Type",
				"place": "Place Published",
				"publisher": "Publisher",
				"scale": "Scale",
				"seriesTitle": "Series Title",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "audioRecording",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"creatorType": "performer",
						"fieldMode": 1
					},
					{
						"lastName": "Producer",
						"creatorType": "translator",
						"fieldMode": 1
					},
					{
						"lastName": "Composer",
						"creatorType": "composer",
						"fieldMode": 1
					},
					{
						"lastName": "Target Audience",
						"creatorType": "wordsBy",
						"fieldMode": 1
					}
				],
				"date": "0000 Year Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"audioRecordingFormat": "Accompanying Matter",
				"callNumber": "Call Number",
				"label": "Publisher",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"numberOfVolumes": "Number of Volumes",
				"place": "Place Published",
				"seriesTitle": "Series Title",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "newspaperArticle",
				"title": "Title",
				"creators": [
					{
						"lastName": "Reporter",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "0000 Year Issue",
				"ISSN": "ISSN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"edition": "Edition",
				"extra": "Start Page",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"pages": "Pages",
				"place": "Place Published",
				"publicationTitle": "Newspaper",
				"section": "Section",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "document",
				"title": "Title",
				"creators": [
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"publisher": "Publisher",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "videoRecording",
				"title": "Title",
				"creators": [
					{
						"lastName": "By",
						"firstName": "Created",
						"creatorType": "director"
					},
					{
						"lastName": "Year Cited",
						"creatorType": "castMember",
						"fieldMode": 1
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"extra": "Number of Screens",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"studio": "Distributor",
				"url": "URL",
				"videoRecordingFormat": "Format/Length",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "manuscript",
				"title": "Title",
				"creators": [
					{
						"lastName": "Translator",
						"creatorType": "translator",
						"fieldMode": 1
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"extra": "Series Volume\nNumber of Pages",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"manuscriptType": "Type of Work",
				"numPages": "Pages",
				"place": "Place Published",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "patent",
				"title": "Title",
				"creators": [
					{
						"lastName": "Inventor",
						"creatorType": "inventor",
						"fieldMode": 1
					},
					{
						"lastName": "Attorney/Agent",
						"creatorType": "attorneyAgent",
						"fieldMode": 1
					}
				],
				"issueDate": "0000 Year Issue",
				"abstractNote": "Abstract",
				"applicationNumber": "Application Number",
				"assignee": "Assignee",
				"country": "Designated States",
				"issuingAuthority": "Organization, Issuing",
				"language": "Language",
				"legalStatus": "Legal Status",
				"pages": "Pages",
				"patentNumber": "Patent Number",
				"place": "Country",
				"priorityNumbers": "Priority Numbers",
				"references": "References",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "letter",
				"title": "Title",
				"creators": [
					{
						"lastName": "Recipient",
						"creatorType": "recipient",
						"fieldMode": 1
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"extra": "Folio Number",
				"language": "Language",
				"letterType": "Type",
				"libraryCatalog": "Database Provider",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "report",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"firstName": "Series",
						"creatorType": "seriesEditor"
					},
					{
						"lastName": "Department/Division",
						"creatorType": "translator",
						"fieldMode": 1
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"extra": "Document Number",
				"institution": "Institution",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"pages": "Pages",
				"place": "Place Published",
				"reportNumber": "Report Number",
				"reportType": "Type",
				"seriesTitle": "Series Title",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "book",
				"title": "Title",
				"creators": [
					{
						"lastName": "Editor",
						"creatorType": "seriesEditor",
						"fieldMode": 1
					},
					{
						"lastName": "Editor",
						"firstName": "Series",
						"creatorType": "editor"
					},
					{
						"lastName": "Editor",
						"firstName": "Volume",
						"creatorType": "translator"
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"edition": "Edition",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"numPages": "Pages",
				"numberOfVolumes": "Number of Volumes",
				"place": "Place Published",
				"publisher": "Publisher",
				"series": "Secondary Title",
				"seriesNumber": "Series Volume",
				"shortTitle": "Short Title",
				"url": "URL",
				"volume": "Volume",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "report",
				"title": "Title",
				"creators": [
					{
						"lastName": "Institution",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"extra": "Start Page",
				"institution": "Publisher",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"pages": "Pages",
				"place": "Place Published",
				"reportNumber": "Document Number",
				"reportType": "Type of Work",
				"seriesTitle": "Section Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "statute",
				"nameOfAct": "Short Title",
				"creators": [],
				"dateEnacted": "0000 Year Date",
				"abstractNote": "Abstract",
				"code": "Code",
				"codeNumber": "Code Number",
				"history": "History",
				"language": "Language",
				"pages": "Pages",
				"publicLawNumber": "Public Law Number",
				"section": "Sections",
				"session": "Session",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "thesis",
				"title": "Title",
				"creators": [
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"archiveLocation": "Accession Number",
				"callNumber": "Call Number",
				"extra": "Document Number",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"numPages": "Number of Pages",
				"place": "Place Published",
				"shortTitle": "Short Title",
				"thesisType": "Thesis Type",
				"university": "University",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Title of Work",
				"creators": [
					{
						"lastName": "Editor",
						"firstName": "Series",
						"creatorType": "editor"
					},
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Date",
				"abstractNote": "Abstract",
				"archive": "Name of Database",
				"issue": "Number",
				"journalAbbreviation": "Abbreviation",
				"language": "Language",
				"libraryCatalog": "Database Provider",
				"pages": "Pages",
				"publicationTitle": "Series Title",
				"series": "Department",
				"shortTitle": "Short Title",
				"url": "URL",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "webpage",
				"title": "Title",
				"creators": [
					{
						"lastName": "Name1",
						"firstName": "Author",
						"creatorType": "author"
					},
					{
						"lastName": "Name2",
						"firstName": "Author",
						"creatorType": "author"
					}
				],
				"date": "0000 Year Last",
				"abstractNote": "Abstract",
				"language": "Language",
				"shortTitle": "Short Title",
				"url": "URL",
				"websiteTitle": "Periodical Title",
				"websiteType": "Type of Medium",
				"attachments": [],
				"tags": [
					"Keyword1, Keyword2, Keyword3",
					"Keyword4",
					"Keyword5"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Research Notes</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "TY - JOUR\nAB - Optimal integration of next-generation sequencing into mainstream research requires re-evaluation of how problems can be reasonably overcome and what questions can be asked. .... The random sequencing-based approach to identify microsatellites was rapid, cost-effective and identified thousands of useful microsatellite loci in a previously unstudied species.\nAD - Consortium for Comparative Genomics, Department of Biochemistry and Molecular Genetics, University of Colorado School of Medicine, Aurora, CO 80045, USA; Department of Biology, University of Central Florida, 4000 Central Florida Blvd., Orlando, FL 32816, USA; Department of Biology & Amphibian and Reptile Diversity Research Center, The University of Texas at Arlington, Arlington, TX 76019, USA\nAU - CASTOE, TODD A.\nAU - POOLE, ALEXANDER W.\nAU - GU, WANJUN\nAU - KONING, A. P. JASON de\nAU - DAZA, JUAN M.\nAU - SMITH, ERIC N.\nAU - POLLOCK, DAVID D.\nL1 - internal-pdf://2009 Castoe Mol Eco Resources-1114744832/2009 Castoe Mol Eco Resources.pdf\ninternal-pdf://sm001-1634838528/sm001.pdf\ninternal-pdf://sm002-2305927424/sm002.txt\ninternal-pdf://sm003-2624695040/sm003.xls\nM1 - 9999\nN1 - 10.1111/j.1755-0998.2009.02750.x\nPY - 2009\nSN - 1755-0998\nST - Rapid identification of thousands of copperhead snake (Agkistrodon contortrix) microsatellite loci from modest amounts of 454 shotgun genome sequence\nT2 - Molecular Ecology Resources\nTI - Rapid identification of thousands of copperhead snake (Agkistrodon contortrix) microsatellite loci from modest amounts of 454 shotgun genome sequence\nUR - http://dx.doi.org/10.1111/j.1755-0998.2009.02750.x\nVL - 9999\nID - 3\nER -",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Rapid identification of thousands of copperhead snake (Agkistrodon contortrix) microsatellite loci from modest amounts of 454 shotgun genome sequence",
				"creators": [
					{
						"lastName": "CASTOE",
						"firstName": "TODD A.",
						"creatorType": "author"
					},
					{
						"lastName": "POOLE",
						"firstName": "ALEXANDER W.",
						"creatorType": "author"
					},
					{
						"lastName": "GU",
						"firstName": "WANJUN",
						"creatorType": "author"
					},
					{
						"lastName": "KONING",
						"firstName": "A. P. JASON de",
						"creatorType": "author"
					},
					{
						"lastName": "DAZA",
						"firstName": "JUAN M.",
						"creatorType": "author"
					},
					{
						"lastName": "SMITH",
						"firstName": "ERIC N.",
						"creatorType": "author"
					},
					{
						"lastName": "POLLOCK",
						"firstName": "DAVID D.",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"ISSN": "1755-0998",
				"abstractNote": "Optimal integration of next-generation sequencing into mainstream research requires re-evaluation of how problems can be reasonably overcome and what questions can be asked. .... The random sequencing-based approach to identify microsatellites was rapid, cost-effective and identified thousands of useful microsatellite loci in a previously unstudied species.",
				"issue": "9999",
				"publicationTitle": "Molecular Ecology Resources",
				"shortTitle": "Rapid identification of thousands of copperhead snake (Agkistrodon contortrix) microsatellite loci from modest amounts of 454 shotgun genome sequence",
				"url": "http://dx.doi.org/10.1111/j.1755-0998.2009.02750.x",
				"volume": "9999",
				"attachments": [
					{
						"title": "2009 Castoe Mol Eco Resources",
						"path": "PDF/2009 Castoe Mol Eco Resources-1114744832/2009 Castoe Mol Eco Resources.pdf"
					},
					{
						"title": "sm001",
						"path": "PDF/sm001-1634838528/sm001.pdf"
					},
					{
						"title": "sm002",
						"path": "PDF/sm002-2305927424/sm002.txt"
					},
					{
						"title": "sm003",
						"path": "PDF/sm003-2624695040/sm003.xls"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<p>10.1111/j.1755-0998.2009.02750.x</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "TY  - BILL\nN1  - Record ID: 10\nA1  - Author Name, Author2 Name2\nTI  - Act Name\nRP  - Reprint Status, Date\nCY  - Code\nPY  - Date of Code\nY2  - Date\nVL  - Bill/Res Number\nSP  - Section(s)\nN1  - Histroy: History\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - ART\nN1  - Record ID: 20\nA1  - Author Name, Author2 Name2\nN1  - Artist Role: Artist Role\nT1  - Title/Subject\nM1  - Medium\nN1  - Connective Phrase: Connective Phrase\nN1  - Author, Monographic: Monographic Author\nN1  - Author Role: Author Role\nN1  - Title Monographic: Monographic Title\nRP  - Reprint Status, Date\nVL  - Edition\nCY  - Place of Publication\nPB  - Publisher Name\nY1  - Date of Publication\nN1  - Location in Work: Location in Work\nN1  - Size: Size\nN1  - Series Title: Series Title\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\n\nTY  - ADVS\nN1  - Record ID: 30\nA1  - Author Name, Author2 Name2\nN1  - Author Role: Author Role\nT1  - Analytic Title\nM3  - Medium Designator\nN1  - Connective Phrase: Connective Phrase\nN1  - Author, Monographic: Monographic Author\nN1  - Author Role: Monographic Author Role\nN1  - Title Monographic: Monographic Title\nRP  - Reprint Status, Date\nVL  - Edition\nN1  - Author, Subsidiary: Subsidiary Author\nN1  - Author Role: Author Role\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nIS  - Volume ID\nN1  - Location in Work: Location in Work\nN1  - Extent of Work: Extent of Work\nN1  - Packaging Method: Packaging Method\nN1  - Size: Size\nN1  - Series Editor: Series Editor\nN1  - Series Editor Role: Series Editor Role\nN1  - Series Title: Series Title\nN1  - Series Volume ID: Series Volume ID\nN1  - Series Issue ID: Series Issue ID\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nSN  - ISBN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - CHAP\nN1  - Record ID: 40\nA1  - Author Name, Author2 Name2\nT1  - Analytic Title\nN1  - Medium Designator: Medium Designator\nN1  - Connective Phrase: Connective Phrase\nA2  - Monographic Author\nN1  - Author Role: Author Role\nT2  - Monographic Title\nRP  - Reprint Status, Date\nVL  - Edition\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nN1  - Volume ID: Volume ID\nN1  - Issue ID: Issue ID\nSP  - Page(s)\nA3  - Series Editor\nN1  - Series Editor Role: Series Editor Role\nN1  - Series Title: Series Title\nN1  - Series Volume ID: Series Volume Identification\nN1  - Series Issue ID: Series Issue Identification\nN1  - Connective PhraseConnective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - CHAP\nN1  - Record ID: 50\nA1  - Author Name, Author2 Name2\nN1  - Author Role: Author Role\nT1  - Analytic Title\nN1  - Medium Designator: Medium Designator\nN1  - Connective Phrase: Connective Phrase\nA2  - Monographic Author\nN1  - Author Role: Author Role\nT2  - Monographic Title\nRP  - Reprint Status, Date\nVL  - Edition\nN1  - Author, Subsidiary: Subsidiary Author\nN1  - Author Role: Author Role\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nN1  - Date of Copyright: Date of Copyright\nN1  - Volume ID: Volume ID\nN1  - Issue ID: Issue ID\nSP  - Page(s)\nN1  - Extent of Work: Extent of Work\nN1  - Packaging Method: Packaging Method\nA3  - Series Editor\nN1  - Series Editor Role: Series Editor Role\nT3  - Series Title\nN1  - Series Volume ID: Series Volume ID\nAV  - Address/Availability\nUR  - Location/URL\nSN  - ISBN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - ABST\nN1  - Record ID: 180\nA1  - Author Name, Author2 Name2\nT1  - Title\nJF  - Journal Title\nRP  - Reprint Status, Date\nY1  - Date of Publication\nVL  - Volume ID\nIS  - Issue ID\nSP  - Page(s)\nAD  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - BOOK\nN1  - Record ID: 190\nA1  - Monographic Author\nT1  - Monographic Title\nRP  - Reprint Status, Date\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nAV  - Address/Availability\nUR  - Location/URL\nSN  - ISBN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - BOOK\nN1  - Record ID: 200\nA1  - Monographic Author\nN1  - Author Role: Author Role\nT1  - Monographic Title\nN1  - Translated Title: Translated Title\nRP  - Reprint Status, Date\nVL  - Edition\nN1  - Author, Subsidiary: Subsidiary Author\nN1  - Author Role: Author Role\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nN1  - Original Pub Date: Original Pub Date\nIS  - Volume ID\nN1  - Extent of Work: Extent of Work\nN1  - Packaging Method: Packaging Method\nA3  - Series Editor\nN1  - Series Editor Role: Series Editor Role\nT3  - Series Title\nN1  - Series Volume ID: Series Volume ID\nAV  - Address/Availability\nUR  - Location/URL\nSN  - ISBN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - CASE\nN1  - Record Number: 210\nA1  - Counsel\nT1  - Case Name\nT2  - Case Name (Abbrev)\nRP  - Reprint Status, Date\nCY  - Reporter\nPB  - Court\nPY  - Date Field\nY2  - Date Decided\nN1  - First Page: First Page\nVL  - Reporter Number\nSP  - Page(s)\nT3  - History\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - COMP\nN1  - Record Number: 220\nT1  - Program Title\nN1  - Computer Program: Computer Program\nN1  - Connective Phrase: Connective Phrase\nA1  - Author/Programmer\nN1  - Author Role: Author Role\nN1  - Title: Title\nRP  - Reprint Status, Date\nIS  - Version\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nN1  - Date of Copyright: Date of Copyright\nN1  - Report Identification: Report ID\nN1  - Extent of Work: Extent of Work\nN1  - Packaging Method: Packaging Method\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nSN  - ISBN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - CONF\nN1  - Record Number: 230\nA1  - Author Name, Author2 Name2\nN1  - Author Role: Author Role\nN1  - Author Affiliation, Ana.: Author Affiliation\nT1  - Paper/Section Title\nN1  - Medium Designator: Medium Designator\nN1  - Connective Phrase: Connective Phrase\nA2  - Editor/Compiler\nN1  - Editor/Compiler Role: Editor/Compiler Role\nN1  - Proceedings Title: Proceedings Title\nY2  - Date of Meeting\nN1  - Place of Meeting: Place of Meeting\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nN1  - Date of Copyright: Date of Copyright\nVL  - Volume ID\nSP  - Location in Work\nN1  - Extent of Work: Extent of Work\nN1  - Packaging Method: Packaging Method\nA3  - Series Editor\nN1  - Series Editor Role: Series Editor Role\nT3  - Series Title\nN1  - Series Volume ID: Series Volume ID\nAV  - Address/Availability\nUR  - Location/URL\nN1  - ISBN: ISBN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - DATA\nN1  - Record Number: 240\nT1  - Analytic Title\nN1  - Medium (Data File): Medium (Data File)\nN1  - Connective Phrase: Connective Phrase\nA2  - Editor/Compiler\nN1  - Editor/Compiler Role: Editor/Compiler Role\nN1  - Title, Monographic: Monographic Title\nRP  - Reprint Status, Date\nIS  - Version\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nSP  - Location in Work\nN1  - Extent of Work: Extent of Work\nN1  - Packaging Method: Packaging Method\nT3  - Series Title\nN1  - Series Volume ID: Series Volume ID\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - THES\nN1  - Record Number: 250\nA1  - Author Name, Author2 Name2\nT1  - Analytic Title\nN1  - Medium Designator: Medium Designator\nRP  - Reprint Status, Date\nN1  - Place of Publication: Place of Publication\nPB  - University\nPY  - Date of Publication\nN1  - Date of Copyright: Date of Copyright\nSP  - Extent of Work\nN1  - Packaging Method: Packaging Method\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - ELEC\nN1  - Record Number: 260\nA1  - Author Name, Author2 Name2\nT1  - Title\nM1  - Medium\nJO  - Source\nRP  - Reprint Status, Date\nIS  - Edition\nPB  - Publisher Name\nPY  - Last Update\nY2  - Access Date\nN1  - Volume ID: Volume ID\nSP  - Page(s)\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - ICOMM\nN1  - Record Number: 270\nA1  - Author Name, Author2 Name2\nN1  - Author E-mail: Author E-mail\nN1  - Author Affiliation: Author Affiliation\nT1  - Subject\nA2  - Recipient\nN1  - Recipient E-mail: Recipient E-mail\nRP  - Reprint Status, Date\nPY  - Date of Message\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - GEN\nN1  - Record Number: 280\nA1  - Author Name, Author2 Name2\nT1  - Analytic Title\nA2  - Monographic Author\nT2  - Monographic Title\nJO  - Journal Title\nRP  - Reprint Status, Date\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nY2  - Date of Copyright\nVL  - Volume ID\nIS  - Issue ID\nSP  - Location in Work\nA3  - Series Editor\nT3  - Series Title\nAV  - Address/Availability\nUR  - Location/URL\nSN  - ISSN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - HEAR\nN1  - Record Number: 290\nA1  - Author Name, Author2 Name2\nN1  - Author Role: Author Role\nN1  - Author Affiliation: Author Affiliation\nT1  - Title\nN1  - Medium Designator: Medium Designator\nRP  - Reprint Status, Date\nCY  - Committee\nPB  - Subcommittee\nPY  - Hearing Date\nY2  - Date\nVL  - Bill Number\nN1  - Issue ID: Issue ID\nN1  - Location in Work: Location/URL\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - MGZN\nN1  - Record Number: 300\nA1  - Author Name, Author2 Name2\nT1  - Article Title\nJO  - Magazine Title\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nN1  - Copyright Date: Date of Copyright\nVL  - Volume ID\nIS  - Issue ID\nSP  - Page(s)\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - INPR\nN1  - Record Number: 310\nA1  - Author Name, Author2 Name2\nT1  - Title\nJO  - Journal Title\nRP  - Reprint Status, Date\nPY  - Date of Publication\nN1  - Volume ID: Volume ID\nN1  - Page(s): Page(s)\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - JOUR\nN1  - Record Number: 320\nA1  - Author Name, Author2 Name2\nT1  - Article Title\nN1  - Medium Designator: Medium Designator\nN1  - Connective Phrase: Connective Phrase\nJF  - Journal Title\nN1  - Translated Title: Translated Title\nRP  - Reprint Status, Date\nPY  - Date of Publication\nVL  - Volume ID\nIS  - Issue ID\nSP  - Page(s)\nN1  - Language: Language\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nSN  - ISSN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - JOUR\nN1  - Record Number: 330\nA1  - Author Name, Author2 Name2\nN1  - Author Role: Author Role\nN1  - Author Affiliation: Author Affiliation\nT1  - Article Title\nN1  - Medium Designator: Medium Designator\nN1  - Connective Phrase: Connective Phrase\nN1  - Author, Monographic: Monographic Author\nN1  - Author Role: Author Role\nJF  - Journal Title\nRP  - Reprint Status, Date\nPY  - Date of Publication\nVL  - Volume ID\nIS  - Issue ID\nSP  - Page(s)\nAV  - Address/Availability\nUR  - Location/URL\nN1  - CODEN: CODEN\nSN  - ISSN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - JOUR\nN1  - Record Number: 340\nA1  - Author Name, Author2 Name2\nT1  - Analytic Title\nJF  - Journal Title\nRP  - Reprint Status, Date\nPY  - Date of Publication\nVL  - Volume ID\nIS  - Issue ID\nSP  - Page(s)\nAV  - Address/Availability\nUR  - Location/URL\nSN  - ISSN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - JFULL\nN1  - Record Number: 350\nN1  - Editor: Editor\nJF  - Journal Title\nRP  - Reprint Status, Date\nN1  - Medium Designator: Medium Designator\nN1  - Edition: Edition\nN1  - Place of Publication: Place of Publication\nN1  - Publisher Name: Publisher Name\nPY  - Date of Publication\nVL  - Volume ID\nIS  - Issue ID\nSP  - Extent of Work\nN1  - Packaging Method: Packaging Method\nN1  - Frequency of Publication: Frequency of Publication\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nN1  - CODEN: CODEN\nSN  - ISSN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - PCOMM\nN1  - Record Number: 360\nA1  - Author Name, Author2 Name2\nN1  - Author Affiliation: Author Affiliation\nN1  - Medium Designator: Medium Designator\nA2  - Recipient\nRP  - Reprint Status, Date\nN1  - Place of Publication: Place of Publication\nPY  - Date of Letter\nN1  - Extent of Letter: Extent of Letter\nN1  - Packaging Method: Packaging Method\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - SER\nN1  - Record Number: 370\nA1  - Author Name, Author2 Name2\nN1  - Author Role: Author Role\nT1  - Analytic Title\nN1  - Medium Designator: Medium Designator\nN1  - Connective Phrase: Connective Phrase\nT3  - Collection Title\nRP  - Reprint Status, Date\nPY  - Date of Publication\nSP  - Location of Work\nN1  - Extent of Work: Extent of Work\nN1  - Packaging Method: Packaging Method\nN1  - Document Type: Document Type\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - MAP\nN1  - Record Number: 380\nT1  - Map Title\nM2  - Map Type\nA1  - Cartographer\nN1  - Cartographer Role: Cartographer Role\nRP  - Reprint Status, Date\nM1  - Area\nN1  - Medium Designator: Medium Designator\nVL  - Edition\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nY2  - Date of Copyright\nN1  - Extent of Work: Extent of Work\nN1  - Packaging Method: Packaging Method\nN1  - Size: Size\nN1  - Scale: Scale\nT3  - Series Title\nN1  - Series Volume ID: Series Volume ID\nN1  - Series Issue ID: Series Issue ID\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - SER\nN1  - Record Number: 390\nA1  - Monographic Author\nN1  - Author Role: Author Role\nT1  - Monographic Title\nRP  - Reprint Status, Date\nVL  - Edition\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nAV  - Address/Availability\nUR  - Location/URL\nSN  - ISBN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - MUSIC\nN1  - Record Number: 400\nA1  - Composer\nN1  - Composer Role: Composer Role\nT1  - Analytic Title\nN1  - Medium Designator: Medium Designator\nN1  - Connective Phrase: Connective Phrase\nA2  - Editor/Compiler\nN1  - Editor/Compiler Role: Editor/Compiler Role\nN1  - Title, Monographic: Monographic Title\nRP  - Reprint Status, Date\nN1  - Medium Designator: Medium Designator\nVL  - Edition\nN1  - Author, Subsidiary: Subsidiary Author\nN1  - Author Role: Author Role\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nN1  - Copyright Date: Copyright Date\nIS  - Volume ID\nN1  - Report Identification: Report ID\nN1  - Plate Number: Plate Number\nN1  - Location in Work: Location in Work\nN1  - Extent of Work: Extent of Work\nN1  - Packaging Method: Packaging Method\nA3  - Series Editor\nN1  - Series Editor Role: Series Editor Role\nT3  - Series Title\nN1  - Series Volume ID: Series Volume ID\nN1  - Series Issue ID: Series Issue ID\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nSN  - ISBN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - MPCT\nT1  - Analytic Title\nN1  - Medium Designator: Medium Designator\nN1  - Producer: Producer\nN1  - Producer Role: Producer Role\nRP  - Reprint Status, Date\nA1  - Director\nN1  - Director Role: Director Role\nCY  - Place of Publication\nU5  - Distributor\nPY  - Date of Publication\nM2  - Timing\nN1  - Packaging Method: Packaging Method\nN1  - Size: Size\nT3  - Series Title\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nSN  - ISBN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - NEWS\nN1  - Record Number: 420\nA1  - Author Name, Author2 Name2\nN1  - Author Role: Author Role\nT1  - Analytic Title\nN1  - Medium Designator: Medium Designator\nN1  - Connective Phrase: Connective Phrase\nJO  - Newspaper Name\nRP  - Reprint Status, Date\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nM2  - Section\nN1  - Column Number: Column Number\nSP  - Page(s)\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\n\nTY  - PAT\nN1  - Record Number: 430\nA1  - Inventor Name\nN1  - Address: Address\nT1  - Patent Title\nA2  - Assignee\nN1  - Title, Short Form: Title, Short Form\nN1  - Title, Long Form: Title, Long Form\nN1  - Abstract Journal Date: Abstract Journal Date\nCY  - Country\nM3  - Document Type\nIS  - Patent Number\nN1  - Abstract Journal Title: Abstract Journal Title\nPY  - Date of Patent Issue\nVL  - Application No./Date\nN1  - Abstract Journal Volume: Abstract Journal Volume\nN1  - Abstract Journal Issue: Abstract Journal Issue\nSP  - Abstract Journal Page(s)\nN1  - Extent of Work: Extent of Work\nN1  - Packaging Method: Packaging Method\nN1  - Language: Language\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nM2  - Class Code, National\nM1  - Class Code, International\nN1  - Related Document No.: Related Document Number\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Registry Number: Registry Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\n\nTY  - RPRT\nN1  - Record Number: 440\nA1  - Author Name, Author2 Name2\nN1  - Author Role, Analytic: Author Role\nN1  - Author Affiliation: Author Affiliation\nN1  - Section Title: Section Title\nN1  - Medium Designator: Medium Designator\nN1  - Connective Phrase: Connective Phrase\nA2  - Monographic Author\nN1  - Author Role: Author Role\nT1  - Report Title\nRP  - Reprint Status, Date\nN1  - Edition: Edition\nN1  - Author, Subsidiary: Subsidiary Author\nN1  - Author Role: Author Role\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nVL  - Report ID\nSP  - Extent of Work\nN1  - Packaging Method: Packaging Method\nT3  - Series Title\nN1  - Series Volume ID: Series Volume ID\nN1  - Series Issue ID: Series Issue ID\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nN1  - CODEN: CODEN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\n\nTY  - SOUND\nN1  - Record Number: 450\nA1  - Composer\nN1  - Composer Role: Composer Role\nT1  - Analytic Title\nN1  - Medium Designator: Medium Designator\nN1  - Connective Phrase: Connective Phrase\nN1  - Editor/Compiler: Editor/Compiler\nN1  - Editor/Compiler Role: Editor/Compiler Role\nN1  - Recording Title: Recording Title\nRP  - Reprint Status, Date\nN1  - Edition: Edition\nA2  - Performer\nN1  - Performer Role: Performer Role\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nN1  - Copyright Date: Date of Copyright\nN1  - Acquisition Number: Acquisition Number\nN1  - Matrix Number: Matrix Number\nN1  - Extent of Work: Extent of Work\nN1  - Packaging Method: Packaging Method\nN1  - Size: Size\nN1  - Reproduction Ratio: Reproduction Ratio\nT3  - Series Title\nAV  - Address/Availability\nUR  - Location/URL\nSN  - ISBN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\n\nTY  - STAT\nN1  - Record Number: 460\nA1  - Author Name, Author2 Name2\nT1  - Statute Title\nRP  - Reprint Status, Date\nCY  - Code\nPY  - Date of Publication\nY2  - Date\nVL  - Title/Code Number\nSP  - Section(s)\nT3  - History\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - CTLG\nN1  - Record Number: 470\nA1  - Author Name, Author2 Name2\nT1  - Catalog Title\nN1  - Medium Designator: Medium Designator\nRP  - Reprint Status, Date\nVL  - Edition\nCY  - Place of Publication\nPB  - Publisher Name\nPY  - Date of Publication\nIS  - Catalog Number\nN1  - Issue Identification: Issue ID\nN1  - Extent of Work: Extent of Work\nN1  - Packaging Method: Packaging Method\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\n\nTY  - UNBILL\nN1  - Record Number: 480\nA1  - Author Name, Author2 Name2\nT1  - Act Title\nRP  - Reprint Status, Date\nCY  - Code\nPY  - Date of Code\nY2  - Date\nVL  - Bill/Res Number\nT3  - History\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - UNPB\nN1  - Record Number: 490\nA1  - Author Name, Author2 Name2\nT1  - Title\nA2  - Editor(s)\nRP  - Reprint Status, Date\nPY  - Date of Publication\nN1  - Date of Copyright: Date of Copyright\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\nTY  - VIDEO\nN1  - Record Number: 500\nA1  - Author Name, Author2 Name2\nT1  - Analytic Title\nN1  - Medium Designator: Medium Designator\nN1  - Producer: Producer\nN1  - Producer Role: Producer Role\nRP  - Reprint Status, Date\nN1  - Director: Director\nN1  - Director Role: Director Role\nCY  - Place of Publication\nPB  - Distributor\nPY  - Date of Publication\nM2  - Extent of Work\nN1  - Packaging Method: Packaging Method\nN1  - Size: Size\nT3  - Series Title\nN1  - Connective Phrase: Connective Phrase\nAV  - Address/Availability\nUR  - Location/URL\nSN  - ISBN\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\n\nTY  - ELEC\nN1  - Record Number: 510\nA1  - Author Name, Author2 Name2\nN1  - Author Role: Author Role\nN1  - Author Affiliation: Author Affiliation\nT1  - Title\nRP  - Reprint Status, Date\nPY  - Date of Publication\nY2  - Date of Access\nAV  - Address/Availability\nUR  - Location/URL\nN1  - Notes: Notes\nN2  - Abstract\nN1  - Call Number: Call Number\nKW  - Keywords1, Keywords2, Keywords3\nKW  - Keywords4\nER  - \n\n",
		"items": [
			{
				"itemType": "bill",
				"title": "Act Name",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"billNumber": "Bill/Res Number",
				"code": "Code",
				"history": "History",
				"section": "Section(s)",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "artwork",
				"title": "Title/Subject",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "artist"
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"artworkMedium": "Medium",
				"artworkSize": "Size",
				"callNumber": "Call Number",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Artist Role: Artist Role</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Title Monographic: Monographic Title</p>"
					},
					{
						"note": "<p>Location in Work: Location in Work</p>"
					},
					{
						"note": "<p>Series Title: Series Title</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "film",
				"title": "Analytic Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "director"
					},
					{
						"lastName": "Author",
						"firstName": "Subsidiary",
						"creatorType": "producer"
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"distributor": "Publisher Name",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Author Role: Monographic Author Role</p>"
					},
					{
						"note": "<p>Title Monographic: Monographic Title</p>"
					},
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Location in Work: Location in Work</p>"
					},
					{
						"note": "<p>Extent of Work: Extent of Work</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Size: Size</p>"
					},
					{
						"note": "<p>Series Editor: Series Editor</p>"
					},
					{
						"note": "<p>Series Editor Role: Series Editor Role</p>"
					},
					{
						"note": "<p>Series Title: Series Title</p>"
					},
					{
						"note": "<p>Series Volume ID: Series Volume ID</p>"
					},
					{
						"note": "<p>Series Issue ID: Series Issue ID</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "bookSection",
				"title": "Analytic Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					},
					{
						"lastName": "Monographic Author",
						"creatorType": "editor",
						"fieldMode": 1
					},
					{
						"lastName": "Series Editor",
						"creatorType": "seriesEditor",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"bookTitle": "Monographic Title",
				"callNumber": "Call Number",
				"edition": "Edition",
				"pages": "Page(s)",
				"place": "Place of Publication",
				"publisher": "Publisher Name",
				"series": "Series Title",
				"seriesNumber": "Series Volume Identification",
				"url": "Location/URL",
				"volume": "Volume ID",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Issue ID: Issue ID</p>"
					},
					{
						"note": "<p>Series Editor Role: Series Editor Role</p>"
					},
					{
						"note": "<p>Series Issue ID: Series Issue Identification</p>"
					},
					{
						"note": "<p>Connective PhraseConnective Phrase</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "bookSection",
				"title": "Analytic Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					},
					{
						"lastName": "Monographic Author",
						"creatorType": "editor",
						"fieldMode": 1
					},
					{
						"lastName": "Author",
						"firstName": "Subsidiary",
						"creatorType": "seriesEditor"
					},
					{
						"lastName": "Series Editor",
						"creatorType": "seriesEditor",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"bookTitle": "Monographic Title",
				"callNumber": "Call Number",
				"edition": "Edition",
				"pages": "Page(s)",
				"place": "Place of Publication",
				"publisher": "Publisher Name",
				"series": "Series Title",
				"seriesNumber": "Series Volume ID",
				"url": "Location/URL",
				"volume": "Volume ID",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Date of Copyright: Date of Copyright</p>"
					},
					{
						"note": "<p>Issue ID: Issue ID</p>"
					},
					{
						"note": "<p>Extent of Work: Extent of Work</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Series Editor Role: Series Editor Role</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"callNumber": "Call Number",
				"issue": "Issue ID",
				"pages": "Page(s)",
				"publicationTitle": "Journal Title",
				"url": "Location/URL",
				"volume": "Volume ID",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "book",
				"title": "Monographic Title",
				"creators": [
					{
						"lastName": "Monographic Author",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"place": "Place of Publication",
				"publisher": "Publisher Name",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "book",
				"title": "Monographic Title",
				"creators": [
					{
						"lastName": "Monographic Author",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "Author",
						"firstName": "Subsidiary",
						"creatorType": "seriesEditor"
					},
					{
						"lastName": "Series Editor",
						"creatorType": "editor",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"edition": "Edition",
				"place": "Place of Publication",
				"publisher": "Publisher Name",
				"series": "Series Title",
				"seriesNumber": "Series Volume ID",
				"url": "Location/URL",
				"volume": "Volume ID",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Translated Title: Translated Title</p>"
					},
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Original Pub Date: Original Pub Date</p>"
					},
					{
						"note": "<p>Extent of Work: Extent of Work</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Series Editor Role: Series Editor Role</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "case",
				"caseName": "Case Name",
				"creators": [
					{
						"lastName": "Counsel",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"dateDecided": "0000 Date",
				"abstractNote": "Abstract",
				"court": "Court",
				"firstPage": "Page(s)",
				"reporterVolume": "Reporter Number",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>First Page: First Page</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "computerProgram",
				"title": "Program Title",
				"creators": [
					{
						"lastName": "Author/Programmer",
						"creatorType": "programmer",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"company": "Publisher Name",
				"place": "Place of Publication",
				"url": "Location/URL",
				"version": "Version",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Computer Program: Computer Program</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Title: Title</p>"
					},
					{
						"note": "<p>Date of Copyright: Date of Copyright</p>"
					},
					{
						"note": "<p>Report Identification: Report ID</p>"
					},
					{
						"note": "<p>Extent of Work: Extent of Work</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "conferencePaper",
				"title": "Paper/Section Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					},
					{
						"lastName": "Editor/Compiler",
						"creatorType": "editor",
						"fieldMode": 1
					},
					{
						"lastName": "Series Editor",
						"creatorType": "seriesEditor",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"pages": "Location in Work",
				"place": "Place of Publication",
				"proceedingsTitle": "Proceedings Title",
				"publisher": "Publisher Name",
				"series": "Series Title",
				"url": "Location/URL",
				"volume": "Volume ID",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Author Affiliation, Ana.: Author Affiliation</p>"
					},
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Editor/Compiler Role: Editor/Compiler Role</p>"
					},
					{
						"note": "<p>Place of Meeting: Place of Meeting</p>"
					},
					{
						"note": "<p>Date of Copyright: Date of Copyright</p>"
					},
					{
						"note": "<p>Extent of Work: Extent of Work</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Series Editor Role: Series Editor Role</p>"
					},
					{
						"note": "<p>Series Volume ID: Series Volume ID</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "document",
				"title": "Analytic Title",
				"creators": [
					{
						"lastName": "Editor/Compiler",
						"creatorType": "editor",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"publisher": "Publisher Name",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Medium (Data File): Medium (Data File)</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Editor/Compiler Role: Editor/Compiler Role</p>"
					},
					{
						"note": "<p>Title, Monographic: Monographic Title</p>"
					},
					{
						"note": "<p>Extent of Work: Extent of Work</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Series Volume ID: Series Volume ID</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "thesis",
				"title": "Analytic Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"numPages": "Extent of Work",
				"place": "Place of Publication",
				"university": "University",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Date of Copyright: Date of Copyright</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "webpage",
				"title": "Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"date": "0000 Last",
				"abstractNote": "Abstract",
				"url": "Location/URL",
				"websiteTitle": "Source",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Volume ID: Volume ID</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "email",
				"subject": "Subject",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					},
					{
						"lastName": "Recipient",
						"creatorType": "recipient",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Author E-mail: Author E-mail</p>"
					},
					{
						"note": "<p>Author Affiliation: Author Affiliation</p>"
					},
					{
						"note": "<p>Recipient E-mail: Recipient E-mail</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Analytic Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					},
					{
						"lastName": "Monographic Author",
						"creatorType": "editor",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"ISSN": "ISSN",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"issue": "Issue ID",
				"journalAbbreviation": "Journal Title",
				"pages": "Location in Work",
				"publicationTitle": "Monographic Title",
				"series": "Series Title",
				"url": "Location/URL",
				"volume": "Volume ID",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "hearing",
				"title": "Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"date": "0000 Hearing",
				"abstractNote": "Abstract",
				"place": "Committee",
				"publisher": "Subcommittee",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Author Affiliation: Author Affiliation</p>"
					},
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Location in Work: Location/URL</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "magazineArticle",
				"title": "Article Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"issue": "Issue ID",
				"pages": "Page(s)",
				"publicationTitle": "Magazine Title",
				"url": "Location/URL",
				"volume": "Volume ID",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Copyright Date: Date of Copyright</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "manuscript",
				"title": "Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Page(s): Page(s)</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Article Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"date": "0000 Date",
				"ISSN": "ISSN",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"issue": "Issue ID",
				"language": "Language",
				"pages": "Page(s)",
				"publicationTitle": "Journal Title",
				"url": "Location/URL",
				"volume": "Volume ID",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Translated Title: Translated Title</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Article Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					},
					{
						"lastName": "Author",
						"firstName": "Monographic",
						"creatorType": "editor"
					}
				],
				"date": "0000 Date",
				"ISSN": "ISSN",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"issue": "Issue ID",
				"pages": "Page(s)",
				"publicationTitle": "Journal Title",
				"url": "Location/URL",
				"volume": "Volume ID",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Author Affiliation: Author Affiliation</p>"
					},
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>CODEN: CODEN</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Analytic Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"date": "0000 Date",
				"ISSN": "ISSN",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"issue": "Issue ID",
				"pages": "Page(s)",
				"publicationTitle": "Journal Title",
				"url": "Location/URL",
				"volume": "Volume ID",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"creators": [],
				"date": "0000 Date",
				"ISSN": "ISSN",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"issue": "Issue ID",
				"pages": "Extent of Work",
				"publicationTitle": "Journal Title",
				"url": "Location/URL",
				"volume": "Volume ID",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Editor: Editor</p>"
					},
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Frequency of Publication: Frequency of Publication</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>CODEN: CODEN</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "letter",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					},
					{
						"lastName": "Recipient",
						"creatorType": "recipient",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Author Affiliation: Author Affiliation</p>"
					},
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Extent of Letter: Extent of Letter</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "book",
				"title": "Analytic Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"numPages": "Location of Work",
				"series": "Collection Title",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Extent of Work: Extent of Work</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Document Type: Document Type</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "map",
				"title": "Map Title",
				"creators": [
					{
						"lastName": "Cartographer",
						"creatorType": "cartographer",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"extra": "Map Type\nArea",
				"place": "Place of Publication",
				"publisher": "Publisher Name",
				"scale": "Scale",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Cartographer Role: Cartographer Role</p>"
					},
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Extent of Work: Extent of Work</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Size: Size</p>"
					},
					{
						"note": "<p>Series Volume ID: Series Volume ID</p>"
					},
					{
						"note": "<p>Series Issue ID: Series Issue ID</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "book",
				"title": "Monographic Title",
				"creators": [
					{
						"lastName": "Monographic Author",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"place": "Place of Publication",
				"publisher": "Publisher Name",
				"url": "Location/URL",
				"volume": "Edition",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "audioRecording",
				"title": "Analytic Title",
				"creators": [
					{
						"lastName": "Composer",
						"creatorType": "composer",
						"fieldMode": 1
					},
					{
						"lastName": "Editor/Compiler",
						"creatorType": "performer",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"label": "Publisher Name",
				"place": "Place of Publication",
				"seriesTitle": "Series Title",
				"url": "Location/URL",
				"volume": "Edition",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Composer Role: Composer Role</p>"
					},
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Editor/Compiler Role: Editor/Compiler Role</p>"
					},
					{
						"note": "<p>Title, Monographic: Monographic Title</p>"
					},
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Copyright Date: Copyright Date</p>"
					},
					{
						"note": "<p>Report Identification: Report ID</p>"
					},
					{
						"note": "<p>Plate Number: Plate Number</p>"
					},
					{
						"note": "<p>Location in Work: Location in Work</p>"
					},
					{
						"note": "<p>Extent of Work: Extent of Work</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Series Editor Role: Series Editor Role</p>"
					},
					{
						"note": "<p>Series Volume ID: Series Volume ID</p>"
					},
					{
						"note": "<p>Series Issue ID: Series Issue ID</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "film",
				"title": "Analytic Title",
				"creators": [
					{
						"lastName": "Director",
						"creatorType": "director",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"extra": "Timing",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Producer: Producer</p>"
					},
					{
						"note": "<p>Producer Role: Producer Role</p>"
					},
					{
						"note": "<p>Director Role: Director Role</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Size: Size</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "newspaperArticle",
				"title": "Analytic Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"extra": "Section",
				"pages": "Page(s)",
				"place": "Place of Publication",
				"publicationTitle": "Newspaper Name",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Column Number: Column Number</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "patent",
				"title": "Patent Title",
				"creators": [
					{
						"lastName": "Inventor Name",
						"creatorType": "inventor",
						"fieldMode": 1
					}
				],
				"issueDate": "0000 Date",
				"abstractNote": "Abstract",
				"applicationNumber": "Class Code, International",
				"extra": "Class Code, National",
				"issuingAuthority": "Assignee",
				"language": "Language",
				"pages": "Abstract Journal Page(s)",
				"place": "Country",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Address: Address</p>"
					},
					{
						"note": "<p>Title, Short Form: Title, Short Form</p>"
					},
					{
						"note": "<p>Title, Long Form: Title, Long Form</p>"
					},
					{
						"note": "<p>Abstract Journal Date: Abstract Journal Date</p>"
					},
					{
						"note": "<p>Abstract Journal Title: Abstract Journal Title</p>"
					},
					{
						"note": "<p>Abstract Journal Volume: Abstract Journal Volume</p>"
					},
					{
						"note": "<p>Abstract Journal Issue: Abstract Journal Issue</p>"
					},
					{
						"note": "<p>Extent of Work: Extent of Work</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Related Document No.: Related Document Number</p>"
					},
					{
						"note": "<p>Notes</p>"
					},
					{
						"note": "<p>Registry Number: Registry Number</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "report",
				"title": "Report Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					},
					{
						"lastName": "Monographic Author",
						"creatorType": "seriesEditor",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"institution": "Publisher Name",
				"pages": "Extent of Work",
				"place": "Place of Publication",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Author Role, Analytic: Author Role</p>"
					},
					{
						"note": "<p>Author Affiliation: Author Affiliation</p>"
					},
					{
						"note": "<p>Section Title: Section Title</p>"
					},
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Series Volume ID: Series Volume ID</p>"
					},
					{
						"note": "<p>Series Issue ID: Series Issue ID</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>CODEN: CODEN</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "audioRecording",
				"title": "Analytic Title",
				"creators": [
					{
						"lastName": "Composer",
						"creatorType": "composer",
						"fieldMode": 1
					},
					{
						"lastName": "Performer",
						"creatorType": "performer",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"label": "Publisher Name",
				"place": "Place of Publication",
				"seriesTitle": "Series Title",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Composer Role: Composer Role</p>"
					},
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Editor/Compiler: Editor/Compiler</p>"
					},
					{
						"note": "<p>Editor/Compiler Role: Editor/Compiler Role</p>"
					},
					{
						"note": "<p>Recording Title: Recording Title</p>"
					},
					{
						"note": "<p>Performer Role: Performer Role</p>"
					},
					{
						"note": "<p>Copyright Date: Date of Copyright</p>"
					},
					{
						"note": "<p>Acquisition Number: Acquisition Number</p>"
					},
					{
						"note": "<p>Matrix Number: Matrix Number</p>"
					},
					{
						"note": "<p>Extent of Work: Extent of Work</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Size: Size</p>"
					},
					{
						"note": "<p>Reproduction Ratio: Reproduction Ratio</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "statute",
				"nameOfAct": "Statute Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"dateEnacted": "0000 Date",
				"abstractNote": "Abstract",
				"codeNumber": "Title/Code Number",
				"pages": "Section(s)",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "magazineArticle",
				"title": "Catalog Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"issue": "Catalog Number",
				"url": "Location/URL",
				"volume": "Edition",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Extent of Work: Extent of Work</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "manuscript",
				"title": "Act Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"place": "Code",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					},
					{
						"lastName": "Editor(s)",
						"creatorType": "editor",
						"fieldMode": 1
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Date of Copyright: Date of Copyright</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "videoRecording",
				"title": "Analytic Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "director"
					}
				],
				"date": "0000 Date",
				"ISBN": "ISBN",
				"abstractNote": "Abstract",
				"archiveLocation": "Address/Availability",
				"callNumber": "Call Number",
				"extra": "Extent of Work",
				"place": "Place of Publication",
				"studio": "Distributor",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Medium Designator: Medium Designator</p>"
					},
					{
						"note": "<p>Producer: Producer</p>"
					},
					{
						"note": "<p>Producer Role: Producer Role</p>"
					},
					{
						"note": "<p>Director: Director</p>"
					},
					{
						"note": "<p>Director Role: Director Role</p>"
					},
					{
						"note": "<p>Packaging Method: Packaging Method</p>"
					},
					{
						"note": "<p>Size: Size</p>"
					},
					{
						"note": "<p>Connective Phrase: Connective Phrase</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "webpage",
				"title": "Title",
				"creators": [
					{
						"lastName": "Author Name",
						"firstName": "Author2 Name2",
						"creatorType": "author"
					}
				],
				"date": "0000 Date",
				"abstractNote": "Abstract",
				"url": "Location/URL",
				"attachments": [],
				"tags": [
					"Keywords1, Keywords2, Keywords3",
					"Keywords4"
				],
				"notes": [
					{
						"note": "<p>Author Role: Author Role</p>"
					},
					{
						"note": "<p>Author Affiliation: Author Affiliation</p>"
					},
					{
						"note": "<p>Notes</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "TY  - JOUR\nT1  - From Basic to Applied Research to Improve Outcomes for Individuals Who Require Augmentative and Alternative Communication: \u2028Potential Contributions of Eye Tracking Research Methods\nAU  - Light, Janice\nAU  - McNaughton, David\nY1  - 2014/06/01\nPY  - 2014\nDA  - 2014/06/01\nN1  - doi: 10.3109/07434618.2014.906498\nDO  - 10.3109/07434618.2014.906498\nT2  - Augmentative and Alternative Communication\nJF  - Augmentative and Alternative Communication\nJO  - Augment Altern Commun\nSP  - 99\nEP  - 105\nVL  - 30\nIS  - 2\nPB  - Informa Allied Health\nSN  - 0743-4618\nM3  - doi: 10.3109/07434618.2014.906498\nUR  - http://dx.doi.org/10.3109/07434618.2014.906498\nY2  - 2014/12/17\nER  -",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "From Basic to Applied Research to Improve Outcomes for Individuals Who Require Augmentative and Alternative Communication: Potential Contributions of Eye Tracking Research Methods",
				"creators": [
					{
						"lastName": "Light",
						"firstName": "Janice",
						"creatorType": "author"
					},
					{
						"lastName": "McNaughton",
						"firstName": "David",
						"creatorType": "author"
					}
				],
				"date": "June 1, 2014",
				"DOI": "10.3109/07434618.2014.906498",
				"ISSN": "0743-4618",
				"issue": "2",
				"journalAbbreviation": "Augment Altern Commun",
				"pages": "99-105",
				"publicationTitle": "Augmentative and Alternative Communication",
				"url": "http://dx.doi.org/10.3109/07434618.2014.906498",
				"volume": "30",
				"attachments": [],
				"tags": [],
				"notes": [
					{
						"note": "<p>doi: 10.3109/07434618.2014.906498</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "TY  - BOOK\nSN  - 9783642002304\nAU  - Depenheuer, Otto\nT1  - Eigentumsverfassung und Finanzkrise\nT2  - Bibliothek des Eigentums\nPY  - 2009\nCY  - Berlin, Heidelberg\nPB  - Springer Berlin Heidelberg\nKW  - Finanzkrise / Eigentum / Haftung / Ordnungspolitik / Aufsatzsammlung / Online-Publikation\nKW  - Constitutional law\nKW  - Law\nUR  - http://dx.doi.org/10.1007/978-3-642-00230-4\nL1  - doi:10.1007/978-3-642-00230-4\nVL  - 7\nAB  - In dem Buch befinden sich einzelne Beiträge zu ...\nLA  - ger\nH1  - UB Mannheim\nH2  - 300 QN 100 D419\nH1  - UB Leipzig\nH2  - PL 415 D419\nTS  - BibTeX\nDO  - 10.1007/978-3-642-00230-4\nER  -\n\n",
		"items": [
			{
				"itemType": "book",
				"title": "Eigentumsverfassung und Finanzkrise",
				"creators": [
					{
						"lastName": "Depenheuer",
						"firstName": "Otto",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"ISBN": "9783642002304",
				"abstractNote": "In dem Buch befinden sich einzelne Beiträge zu ...",
				"callNumber": "300 QN 100 D419",
				"extra": "DOI: 10.1007/978-3-642-00230-4",
				"language": "ger",
				"libraryCatalog": "UB Mannheim",
				"place": "Berlin, Heidelberg",
				"publisher": "Springer Berlin Heidelberg",
				"series": "Bibliothek des Eigentums",
				"url": "http://dx.doi.org/10.1007/978-3-642-00230-4",
				"volume": "7",
				"attachments": [
					{
						"title": "Attachment",
						"path": "doi:10.1007/978-3-642-00230-4"
					}
				],
				"tags": [
					"Constitutional law",
					"Finanzkrise / Eigentum / Haftung / Ordnungspolitik / Aufsatzsammlung / Online-Publikation",
					"Law"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
