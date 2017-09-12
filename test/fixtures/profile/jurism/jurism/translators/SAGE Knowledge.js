{
	"translatorID": "d21dcd90-c997-4e14-8fe0-353b8e19a47a",
	"label": "SAGE Knowledge",
	"creator": "ProQuest",
	"target": "^https?://knowledge\\.sagepub\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2014-12-04 23:40:48"
}

/*
   SAGE Knowledge Translator
   Copyright (C) 2014 ProQuest LLC
   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function detectWeb(doc, url) {
	if (getSearchResults(doc)) {
		return "multiple";
	}
	
	return getItemType(doc);
}

function getItemType(doc) {
	var itemType = ZU.xpathText(doc, '//div[@id="contentFrame"]//li[contains(@class, "contentType")]/@class')
		|| ZU.xpathText(doc, '//div[@id="mainContent"]//p[contains(@class, "docTypeIcon")]/@class');
	
	if (!itemType) return;
	
	itemType = itemType.replace(/contentType|docTypeIcon/,'').trim();
	
	switch(itemType) {
		case "iconEncyclopedia":
		case "iconEncyclopedia-chapter":
			return "encyclopediaArticle";
		case "iconBook-chapter":
			return "bookSection";
		case "iconDictionary-chapter":
			return "dictionaryEntry";
		case "iconDebate":
		case "iconHandbook":
		case "iconBook":
		case "iconDictionary":
		case "iconMajorWork":
			return "book";
	}
}

function getItem(doc, url) {
	ZU.doGet(doc.getElementById("_citeLink").href, function(text) {
		var re = /<textarea name="records".*?>([\s\S]*?)<\/textarea>/;
		var match = re.exec(text)[1]
			.replace(/NV\s+-\s+1\n/, "")
			.replace(/^(AU\s+-\s+.+?),? Ph\.? ?D\.?\n/mg, '$1\n');	
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");//RIS translator
		translator.setString(match);
		translator.setHandler("itemDone", function (obj, item) {
			var keywords = ZU.xpath(doc, "//div[@class='keywords']/a").map(function (a) {
				return ZU.trimInternal(a.textContent);
			});
			if (keywords.length > 0) {
				item.tags = keywords;
			}
			else if (item.tags.length > 10) {
				// Probably a whole lot of unrelated tags
				item.tags = [];
			}
			
			item.url = url;
			item.attachments.push({
				title: "SAGE Knowledge Snapshot",
				document: doc
			});
			
			for (var i = 0; i < item.creators.length; i++) {
				var creator = item.creators[i];
				if (creator.fieldMode && creator.lastName.indexOf(" of ") == -1) {
					item.creators[i] = ZU.cleanAuthor(creator.lastName, creator.creatorType, creator.lastName.indexOf(",") > -1);
				}
				
				creator = item.creators[i];
				if (/^\s*(?:(?:Jr|Sr)\.?|I{1,3})\s*$/i.test(creator.lastName)) {
					item.creators[i] = ZU.cleanAuthor(creator.firstName, creator.creatorType, creator.firstName.indexOf(",") != -1);
					item.creators[i].firstName += ', ' + creator.lastName.trim();
				}
			}
			
			if (item.series == item.title) {
				delete item.series;
			}
			
			var stripPeriods = ['title', 'bookTitle', 'encyclopediaTitle', 'dictionaryTitle'];
			for (var i=0; i<stripPeriods.length; i++) {
				var title = item[stripPeriods[i]];
				if (!title) continue;
				
				item[stripPeriods[i]] = title.replace(/([^.])\.\s*$/, '$1');
			}
			
			if (item.title.charAt(item.title.length - 1) == ".") {
				item.title = item.title.slice(0, item.title.length - 1);
			}
			
			if (item.bookTitle && item.bookTitle.charAt(item.bookTitle.length - 1) == ".") {
				item.bookTitle = item.bookTitle.slice(0, item.bookTitle.length - 1);
			}
			
			if (item.abstractNote == "There is no abstract available for this title") {
				delete item.abstractNote;
			}
			
			item.complete();
		});
		
		translator.getTranslatorObject(function(obj) {
			var itemType = getItemType(doc);
			if (itemType) {
				obj.options.itemType = itemType;
			}
			obj.doImport();
		});
	});
}

function getSearchResults(doc) {
	var items = {}, found = false;
	var results = ZU.xpath(doc, '//div[@id="pageContent"]//div[@class="result"]/div[@class="metaInf"]//a[contains(@id,"title")]');
	for (var i=0; i<results.length; i++) {
		var title = results[i].text;
		var url = results[i].href;

		if (!title || !url) {
			continue;
		}
		found = true;
		items[url] = ZU.trimInternal(title);
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var hits = getSearchResults(doc);
		var urls = [];
		Z.selectItems(hits, function(items) {
			if(items == null) {
				return true;
			}
			for (var j in items) {
				urls.push(j);
			}
			
			ZU.processDocuments(urls, getItem);
		});
	}
	else {
		getItem(doc, url);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://knowledge.sagepub.com/searchresults?f_0=QSEARCH_MT&q_0=leader",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://knowledge.sagepub.com/view/students-guide-to-congress/n97.xml?rskey=TXWrZX&row=1",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "Student's Guide to Congress",
				"creators": [
					{
						"firstName": "Bruce J.",
						"lastName": "Schulman",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"ISBN": "9780872895546",
				"abstractNote": "Student’s Guide to Congress is the second title in the brand new Student's Guide to the U.S. Government Series, which presents essential information about the U.S. government in a manner accessible to high school students. In a unique three-part format, these titles place at the reader’s fingertips everything they need to know about the evolution of elections, Congress, the presidency, and the Supreme Court, from the struggles to create the U.S. government in the late eighteenth century through the on-going issues of the early twenty-first century.",
				"encyclopediaTitle": "Minority Leader",
				"language": "English",
				"libraryCatalog": "SAGE Knowledge",
				"pages": "214-217",
				"place": "Washington, DC",
				"publisher": "CQ Press",
				"url": "http://knowledge.sagepub.com/view/students-guide-to-congress/n97.xml?rskey=TXWrZX&row=1",
				"attachments": [
					{
						"title": "SAGE Knowledge Snapshot"
					}
				],
				"tags": [
					"Senate minority leader",
					"house minority leader",
					"leader of the minority party",
					"majority party",
					"minority leader",
					"minority leader 's main role",
					"party 's interest",
					"party 's lead candidate",
					"snell",
					"speaker of the house"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://knowledge.sagepub.com/view/debate_schoolchoice/SAGE.xml?rskey=S0HLIJ&row=1",
		"items": [
			{
				"itemType": "book",
				"title": "Alternative Schooling and School Choice",
				"creators": [
					{
						"firstName": "Allan G., Jr",
						"lastName": "Osborne",
						"creatorType": "author"
					},
					{
						"firstName": "Charles J.",
						"lastName": "Russo",
						"creatorType": "author"
					},
					{
						"firstName": "Gerald M.",
						"lastName": "Cattaro",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"ISBN": "9781412987950",
				"abstractNote": "This issues-based reference set on education in the United States tackles broad, contentious topics that have prompted debate and discussion within the education community. The volumes focus on pre-school through secondary education and explore prominent and perennially important debates. This set is an essential reference resource for undergraduate students within schools of education and related fields including educational administration, educational psychology, school psychology, human development, and more. Education of America's school children always has been and always will be a hot-button issue. From what should be taught to how to pay for education to how to keep kids safe in schools, impassioned debates emerge and mushroom, both within the scholarly community and among the general public. This volume in the point/counterpoint Debating Issues in American Education reference series tackles the topic of alternative schooling and school choice. Fifteen to twenty chapters explore such varied issues as charter schools, for-profit schools, faith-based schools, magnet schools, vouchers, and more. Each chapter opens with an introductory essay by the volume editor, followed by point/counterpoint articles written and signed by invited experts, and concludes with Further Readings and Resources, thus providing readers with views on multiple sides of alternative schooling and school choice issues and pointing them toward more in-depth resources for further exploration.",
				"language": "English",
				"libraryCatalog": "SAGE Knowledge",
				"place": "Thousand Oaks, CA",
				"publisher": "SAGE Publications, Inc.",
				"url": "http://knowledge.sagepub.com/view/debate_schoolchoice/SAGE.xml?rskey=S0HLIJ&row=1",
				"attachments": [
					{
						"title": "SAGE Knowledge Snapshot"
					}
				],
				"tags": [
					"Jewish day school",
					"Muslim identity",
					"charter school",
					"day school",
					"for-profit school",
					"head start",
					"native American student",
					"single-sex school",
					"specific charter school",
					"year-round school"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://knowledge.sagepub.com/view/coaching-educational-leadership/n11.xml?rskey=WAuhwi&row=2",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Coaching Educational Leadership: Building Leadership Capacity Through Partnership",
				"creators": [
					{
						"firstName": "Jan",
						"lastName": "Robertson",
						"creatorType": "author"
					}
				],
				"date": "2008",
				"ISBN": "9781847874047",
				"abstractNote": "Coaching Educational Leadership is about building leadership capacity in individuals, and in institutions, through enhancing professional relationships. It is based on the importance of maximizing potential and harnessing the ongoing commitment and energy needed to meet personal and professional goals. Based on over a decade of research and development, nationally and internationally, Coaching Educational Leadership brings you the empirical evidence, the principles, and the skills to be able to develop your own leadership and that of others you work with.",
				"bookTitle": "Leaders Coaching Leaders",
				"language": "English",
				"libraryCatalog": "SAGE Knowledge",
				"pages": "151-161",
				"place": "London",
				"publisher": "SAGE Publications Ltd",
				"shortTitle": "Coaching Educational Leadership",
				"url": "http://knowledge.sagepub.com/view/coaching-educational-leadership/n11.xml?rskey=WAuhwi&row=2",
				"attachments": [
					{
						"title": "SAGE Knowledge Snapshot"
					}
				],
				"tags": [
					"active listen",
					"educational leadership",
					"facilitation",
					"facilitator",
					"hod",
					"leadership role",
					"professional isolation",
					"reflective interview",
					"reflective practice",
					"role of the facilitator"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://knowledge.sagepub.com/view/the-quick-reference-handbook-for-school-leaders/SAGE.xml?rskey=WAuhwi&row=14",
		"items": [
			{
				"itemType": "book",
				"title": "The Quick-Reference Handbook for School Leaders",
				"creators": [
					{
						"lastName": "National Association of Head Teachers",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2007",
				"ISBN": "9781412934503",
				"abstractNote": "Distilled from years of NAHT (National Association of Head Teachers) experience of providing advice and guidance for its members in the UK, The Quick-Reference Handbook for School Leaders is a practical guide that provides an answer to the questions \"Where do I start?\" and \"Where do I look for direction?\" Written in an easy-to-read, bulleted format, the handbook is organised around key sections, each part includes brief overviews, checklists and suggestions for further reading. o Organisation and Management - the role of the Headteacher, negligence and liability, media relations, managing conflict and difficult people, effective meetings, inspection, resource management, records and information. o Teaching and Learning - curriculum, learning communities, special education, evaluation, staff development, unions, celebrating success. o Behaviour and Discipline - safe schools, code of conduct, exclusion, search and seizure, police protocols. o Health and Safety - child protection issues, occupational health & safety, risk assessments, emergency preparation, medical needs, health & safety resources. o Looking After Yourself - continuing professional development, and work-life balance. This handbook is an excellent resource for all current and aspiring senior school leaders.",
				"language": "English",
				"libraryCatalog": "SAGE Knowledge",
				"place": "London",
				"publisher": "SAGE Publications Ltd",
				"url": "http://knowledge.sagepub.com/view/the-quick-reference-handbook-for-school-leaders/SAGE.xml?rskey=WAuhwi&row=14",
				"attachments": [
					{
						"title": "SAGE Knowledge Snapshot"
					}
				],
				"tags": [
					"Sen",
					"disability",
					"exclusion",
					"headteacher",
					"headteachers",
					"hierarchical legislative framework",
					"individual school",
					"new headteachers",
					"self-evaluation",
					"senior school staff"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://knowledge.sagepub.com/view/dictionary-of-marketing-communications/n1820.xml?rskey=WAuhwi&row=5",
		"items": [
			{
				"itemType": "dictionaryEntry",
				"title": "Dictionary of Marketing Communications",
				"creators": [
					{
						"firstName": "Norman A.",
						"lastName": "Govoni",
						"creatorType": "author"
					}
				],
				"date": "2004",
				"ISBN": "9780761927716",
				"abstractNote": "The Dictionary of Marketing Communications contains more than 4,000 entries, including key terms and concepts in the promotion aspect of marketing with coverage of advertising, sales promotion, public relations, direct marketing, personal selling and e-marketing. Growing out of a database of terms compiled over many years by the author for use in his marketing classes at Babson College, this dictionary is a living, growing document reflecting the changing dynamics of the marketing profession. It will be an essential reference to practitioners, managers, academics, students and individuals with an interest in marketing and promotion.",
				"dictionaryTitle": "Leader",
				"language": "English",
				"libraryCatalog": "SAGE Knowledge",
				"pages": "113-113",
				"place": "Thousand Oaks, CA",
				"publisher": "SAGE Publications, Inc.",
				"url": "http://knowledge.sagepub.com/view/dictionary-of-marketing-communications/n1820.xml?rskey=WAuhwi&row=5",
				"attachments": [
					{
						"title": "SAGE Knowledge Snapshot"
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
		"url": "http://knowledge.sagepub.com/view/american-political-leaders-1789-2009/SAGE.xml?rskey=mDCULV&row=21",
		"items": [
			{
				"itemType": "book",
				"title": "American Political Leaders 1789–2009",
				"creators": [],
				"date": "2010",
				"ISBN": "9781604265378",
				"language": "English",
				"libraryCatalog": "SAGE Knowledge",
				"place": "Washington, DC",
				"publisher": "CQ Press",
				"url": "http://knowledge.sagepub.com/view/american-political-leaders-1789-2009/SAGE.xml?rskey=mDCULV&row=21",
				"attachments": [
					{
						"title": "SAGE Knowledge Snapshot"
					}
				],
				"tags": [
					"chair Rep.",
					"postmaster",
					"secretary of agriculture",
					"secretary of commerce",
					"secretary of defense",
					"secretary of health",
					"secretary of labor",
					"secretary of the navy",
					"secretary of the treasury",
					"secretary of war"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://knowledge.sagepub.com/view/behavioralsciences/SAGE.xml?rskey=DA3xPe&row=3",
		"items": [
			{
				"itemType": "book",
				"title": "The SAGE Glossary of the Social and Behavioral Sciences",
				"creators": [
					{
						"firstName": "Larry E.",
						"lastName": "Sullivan",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"ISBN": "9781412951432",
				"abstractNote": "The SAGE Glossary of the Social and Behavioral Sciences provides college and university students with a highly accessible, curriculum-driven reference work, both in print and on-line, defining the major terms needed to achieve fluency in the social and behavioral sciences. Comprehensive and inclusive, its interdisciplinary scope covers such varied fields as anthropology, communication and media studies, criminal justice, economics, education, geography, human services, management, political science, psychology, and sociology. In addition, while not a discipline, methodology is at the core of these fields and thus receives due and equal consideration. At the same time we strive to be comprehensive and broad in scope, we recognize a need to be compact, accessible, and affordable. Thus the work is organized in A-to-Z fashion and kept to a single volume of approximately 600 to 700 pages.",
				"language": "English",
				"libraryCatalog": "SAGE Knowledge",
				"place": "Thousand Oaks, CA",
				"publisher": "SAGE Publications, Inc.",
				"url": "http://knowledge.sagepub.com/view/behavioralsciences/SAGE.xml?rskey=DA3xPe&row=3",
				"attachments": [
					{
						"title": "SAGE Knowledge Snapshot"
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
		"url": "http://knowledge.sagepub.com/view/navigator-accounting-history/SAGE.xml?rskey=JOo7SV&row=1",
		"items": [
			{
				"itemType": "book",
				"title": "Accounting History",
				"creators": [
					{
						"firstName": "Richard",
						"lastName": "Fleischman",
						"creatorType": "author"
					}
				],
				"date": "2006",
				"ISBN": "9781412918701",
				"abstractNote": "In the last twenty years accounting history literature has been enriched by the widened examination of historical events from different paradigmatic perspectives. These debates have typically pitted “traditional” historians against “critical” historians. The 47 articles in this three-volume set delineate the basic tenets of these rival paradigms. They include the work of prominent scholars from both camps. Volumes I and II reach across key managerial and financial accounting topics. Volume III draws together literature in which paradigmatic issues have been debated heatedly and those that have reflected a tendency towards consensus and joint venturing.",
				"language": "English",
				"libraryCatalog": "SAGE Knowledge",
				"place": "London",
				"publisher": "SAGE Publications Ltd",
				"url": "http://knowledge.sagepub.com/view/navigator-accounting-history/SAGE.xml?rskey=JOo7SV&row=1",
				"attachments": [
					{
						"title": "SAGE Knowledge Snapshot"
					}
				],
				"tags": [
					"account historian",
					"account history",
					"critical historian",
					"critical historiography",
					"critical scholar",
					"historiography",
					"paradigm",
					"tinker",
					"traditional historian",
					"traditionalist"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://knowledge.sagepub.com/browse?doctype=sk_book&page=1&pageSize=20&sortorder=TITLE&t:state:client=H4sIAAAAAAAAAD2NsUoDQRCG56ISJZ0IvoD1prKyFAPhDhEu2E%2F2xnNkb3ecHRKvsU2ZF%2FGFrFPbWVm5Nnb%2FBx%2Ff%2F%2FEFJ9tjAKiyQp20dyjon8kZCmXT8dpxNNKIwWXSDXvK7jYwRXsgzZytrAVT6FpLij0tBwlXNY2f35f76eFnN4GjBmY+DZJiUZedwXnzghucB4z9vDXl2N80cPb0F7nHgV7hHaoGTqXU%2FvlNxGBquF6NQgYXj0zbVod0F%2F3oQxLqGItQHpQp%2FwKsYaUx1gAAAA%3D%3D",
		"items": "multiple"
	}
]
/** END TEST CASES **/