{
	"translatorID": "881f60f2-0802-411a-9228-ce5f47b64c7d",
	"label": "Refer/BibIX",
	"creator": "Simon Kornblith",
	"target": "txt",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"displayOptions": {
		"exportCharset": "UTF-8"
	},
	"inRepository": true,
	"translatorType": 3,
	"lastUpdated": "2019-08-07 11:11:24"
}


function detectImport() {
	var lineRe = /%[A-Z0-9*$] .+/;
	var line;
	var matched = 0;
	while ((line = Zotero.read()) !== false) {
		line = line.replace(/^\s+/, "");
		if (line != "") {
			if (lineRe.test(line)) {
				matched++;
				if (matched == 2) {
					// threshold is two lines
					return true;
				}
			}
			else {
				return false;
			}
		}
	}
	return false;
}

var fieldMap = {
	T: "title",
	S: "series",
	V: "volume",
	N: "issue",
	C: "place",
	I: "publisher",
	R: "type",
	P: "pages",
	W: "archiveLocation",
	"*": "rights",
	"@": "ISBN",
	L: "callNumber",
	M: "accessionNumber",
	U: "url",
	7: "edition",
	X: "abstractNote",
	G: "language"
};

var inputFieldMap = {
	J: "publicationTitle",
	B: "publicationTitle",
	9: "type"
};

// TODO: figure out if these are the best types for personal communication
var typeMap = {
	book: "Book",
	bookSection: "Book Section",
	journalArticle: "Journal Article",
	magazineArticle: "Magazine Article",
	newspaperArticle: "Newspaper Article",
	thesis: "Thesis",
	letter: "Personal Communication",
	manuscript: "Unpublished Work",
	interview: "Personal Communication",
	film: "Film or Broadcast",
	artwork: "Artwork",
	webpage: "Web Page",
	report: "Report",
	bill: "Bill",
	case: "Case",
	hearing: "Hearing",
	patent: "Patent",
	statute: "Statute",
	email: "Personal Communication",
	map: "Map",
	blogPost: "Web Page",
	instantMessage: "Personal Communication",
	forumPost: "Web Page",
	audioRecording: "Audiovisual Material",
	presentation: "Report",
	videoRecording: "Audiovisual Material",
	tvBroadcast: "Film or Broadcast",
	radioBroadcast: "Film or Broadcast",
	podcast: "Audiovisual Material",
	computerProgram: "Computer Program",
	conferencePaper: "Conference Paper",
	document: "Generic",
	encyclopediaArticle: "Encyclopedia",
	dictionaryEntry: "Dictionary"
};

// supplements outputTypeMap for importing
// TODO: BILL, CASE, COMP, CONF, DATA, HEAR, MUSIC, PAT, SOUND, STAT
var inputTypeMap = {
	"Ancient Text": "book",
	"Audiovisual Material": "videoRecording",
	Generic: "book",
	"Chart or Table": "artwork",
	"Classical Work": "book",
	"Conference Proceedings": "conferencePaper",
	"Conference Paper": "conferencePaper",
	"Edited Book": "book",
	"Electronic Article": "journalArticle",
	"Electronic Book": "book",
	Equation: "artwork",
	Figure: "artwork",
	"Government Document": "document",
	Grant: "document",
	"Legal Rule or Regulation": "statute",
	"Online Database": "webpage",
	"Online Multimedia": "webpage",
	"Electronic Source": "webpage"
};

function processTag(item, tag, value) {
	value = Zotero.Utilities.trim(value);
	if (fieldMap[tag]) {
		if (item[fieldMap[tag]]) {
			item[fieldMap[tag]] += ", " + value;
		}
		else {
			item[fieldMap[tag]] = value;
		}
	}
	else if (inputFieldMap[tag]) {
		item[inputFieldMap[tag]] = value;
	}
	else if (tag == "0") {
		if (inputTypeMap[value]) {	// first check inputTypeMap
			item.itemType = inputTypeMap[value];
		}
		else {					// then check typeMap
			for (var i in typeMap) {
				if (value == typeMap[i]) {
					item.itemType = i;
					break;
				}
			}
			// fall back to generic
			if (!item.itemType) item.itemType = inputTypeMap.Generic;
		}
	}
	else if (tag == "A" || tag == "E" || tag == "Y") {
		var type;
		if (tag == "A") {
			type = "author";
		}
		else if (tag == "E") {
			type = "editor";
		}
		else if (tag == "Y") {
			type = "translator";
		}
		
		item.creators.push(Zotero.Utilities.cleanAuthor(value, type, value.includes(",")));
	}
	else if (tag == "Q") {
		item.creators.push({ creatorType: "author", lastName: value, fieldMode: true });
	}
	else if (tag == "H" || tag == "O") {
		if (!item.extra) item.extra = '';
		else item.extra += "\n";
		item.extra += value;
	}
	else if (tag == "Z") {
		item.notes.push({ note: value });
	}
	else if (tag == "D") {
		if (item.date) {
			if (!item.date.includes(value)) {
				item.date += " " + value;
			}
		}
		else {
			item.date = value;
		}
	}
	else if (tag == "8") {
		if (item.date) {
			if (!value.includes(item.date)) {
				item.date += " " + value;
			}
		}
		else {
			item.date = value;
		}
	}
	else if (tag == "K") {
		if (!item.tags || item.tags.length == 0) {
			item.tags = [];
		}
		item.tags.push(...value.split("\n"));
	}
}

function doImport() {
	var line = true;
	var tag = data = false;
	do {	// first valid line is type
		Zotero.debug("ignoring " + line);
		line = Zotero.read();
		line = line.replace(/^\s+/, "");
	} while (line !== false && line[0] != "%");
	
	var item = new Zotero.Item();
	
	tag = line[1];
	var data = line.substr(3);
	while ((line = Zotero.read()) !== false) {	// until EOF
		line = line.replace(/^\s+/, "");
		if (!line) {
			if (tag) {
				processTag(item, tag, data);
				// unset info
				tag = data = false;
				// new item
				item.complete();
				item = new Zotero.Item();
			}
		}
		else if (line[0] == "%" && line[2] == " ") {
			// if this line is a tag, take a look at the previous line to map
			// its tag
			if (tag) {
				processTag(item, tag, data);
			}
			
			// then fetch the tag and data from this line
			tag = line[1];
			data = line.substr(3);
		}
		else if (tag) {
			// otherwise, assume this is data from the previous line continued
			data += "\n" + line;
		}
	}
	
	if (tag) {	// save any unprocessed tags
		processTag(item, tag, data);
		item.complete();
	}
}

function addTag(tag, value) {
	if (value) {
		Zotero.write("%" + tag + " " + value + "\r\n");
	}
}

function doExport() {
	var item;
	while (item = Zotero.nextItem()) { // eslint-disable-line no-cond-assign
		// can't store independent notes in RIS
		if (item.itemType == "note" || item.itemType == "attachment") {
			continue;
		}
		
		// type
		addTag("0", typeMap[item.itemType] ? typeMap[item.itemType] : "Generic");
		
		// use field map
		for (let j in fieldMap) {
			if (item[fieldMap[j]]) addTag(j, item[fieldMap[j]]);
		}
		
		// handle J & B tags correctly
		if (item.publicationTitle) {
			if (item.itemType == "journalArticle") {
				addTag("J", item.publicationTitle);
			}
			else {
				addTag("B", item.publicationTitle);
			}
		}
		
		// creators
		for (let j in item.creators) {
			var referTag = "A";
			if (item.creators[j].creatorType == "editor") {
				referTag = "E";
			}
			else if (item.creators[j].creatorType == "translator") {
				referTag = "?";
			}
			
			addTag(referTag, item.creators[j].lastName + (item.creators[j].firstName ? ", " + item.creators[j].firstName : ""));
		}
		
		// date
		addTag("D", item.date);
		
		// tags
		if (item.tags) {
			var keywordTag = "";
			for (var i = 0; i < item.tags.length; i++) {
				keywordTag += "\r\n" + item.tags[i].tag;
			}
			addTag("K", keywordTag.substr(2));
		}
		Zotero.write("\r\n");
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "%0 Journal Article\n%A 余敏\n%A 朱江\n%A 丁照蕾\n%H Yu Min\n%H Zhu Jiang\n%H Ding Zhaolei\n%+ 中科院国家科学图书馆成都分馆,四川,成都,610041;中国科学院研究生院,北京,100049\n%+ 中科院国家科学图书馆成都分馆,四川,成都,610041\n%+ 四川大学公共管理学院,四川,成都,610064\n%T 参考文献管理工具研究\n%J 现代情报\n%J JOURNAL OF MODERN INFORMATION\n%@ 1008-0821\n%G chi\n%D 2009\n%N 2\n%V 29\n%P 94-98,93\n%K 参考文献管理 文献管理软件 学术书签网站 Zotero\n%X 介绍了参考文献管理的基本方法,对参考文献管理工具的主要功能进行了对比,最后分析了参考文献管理的趋势.\n%U http://d.wanfangdata.com.cn/Periodical_xdqb200902027.aspx\n%R 10.3969/j.issn.1008-0821.2009.02.027\n%W 北京万方数据股份有限公司",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "参考文献管理工具研究",
				"creators": [
					{
						"firstName": "",
						"lastName": "余敏",
						"creatorType": "author"
					},
					{
						"firstName": "",
						"lastName": "朱江",
						"creatorType": "author"
					},
					{
						"firstName": "",
						"lastName": "丁照蕾",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"abstractNote": "介绍了参考文献管理的基本方法,对参考文献管理工具的主要功能进行了对比,最后分析了参考文献管理的趋势.",
				"archiveLocation": "北京万方数据股份有限公司",
				"extra": "Yu Min\nZhu Jiang\nDing Zhaolei",
				"issue": "2",
				"language": "chi",
				"pages": "94-98,93",
				"publicationTitle": "JOURNAL OF MODERN INFORMATION",
				"url": "http://d.wanfangdata.com.cn/Periodical_xdqb200902027.aspx",
				"volume": "29",
				"attachments": [],
				"tags": [
					"参考文献管理 文献管理软件 学术书签网站 Zotero"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "%0 Book\n%R oai:nb.bibsys.no:998320569524702202\n%R URN:NBN:no-nb_digibok_2016062048105\n%U https://urn.nb.no/URN:NBN:no-nb_digibok_2016062048105\n%T Usynlige byer\n%A Calvino, Italo\n%Y Aardal, Jorunn\n%E Stender Clausen, Jørgen\n%D 1982\n%G Flerspråklig\n%G Norsk (Bokmål)\n%G Italiensk\n%G Dansk\n%Z Elektronisk reproduksjon [Norge] Nasjonalbiblioteket Digital 2016-11-03\n%I Aschehoug\n%C Oslo\n%@ 8203107354\n%K Italiensk litteratur\n%K Idealbyer\n%K kjernelitteratur\n%P 173 s.",
		"items": [
			{
				"itemType": "book",
				"title": "Usynlige byer",
				"creators": [
					{
						"firstName": "Italo",
						"lastName": "Calvino",
						"creatorType": "author"
					},
					{
						"firstName": "Jorunn",
						"lastName": "Aardal",
						"creatorType": "translator"
					},
					{
						"firstName": "Jørgen",
						"lastName": "Stender Clausen",
						"creatorType": "editor"
					}
				],
				"date": "1982",
				"ISBN": "8203107354",
				"language": "Flerspråklig, Norsk (Bokmål), Italiensk, Dansk",
				"place": "Oslo",
				"publisher": "Aschehoug",
				"url": "https://urn.nb.no/URN:NBN:no-nb_digibok_2016062048105",
				"attachments": [],
				"tags": [
					{
						"tag": "Idealbyer"
					},
					{
						"tag": "Italiensk litteratur"
					},
					{
						"tag": "kjernelitteratur"
					}
				],
				"notes": [
					{
						"note": "Elektronisk reproduksjon [Norge] Nasjonalbiblioteket Digital 2016-11-03"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
