{
	"translatorID": "d21dcd90-c997-4e14-8fe0-353b8e19a47a",
	"label": "SAGE Knowledge",
	"creator": "ProQuest, Philipp Zumstein",
	"target": "^https?://sk\\.sagepub\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-25 19:38:38"
}

/*
   SAGE Knowledge Translator
   Copyright (C) 2014 ProQuest LLC, Philipp Zumstein
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
	if (url.indexOf('/Search')>-1) {
		//automatic test for multiples are not working (easily), but you
		//can test manually, e..g
		//  http://sk.sagepub.com/Search/Results?IncludeParts=true&IncludeSegments=true&DocumentTypes=&BioId=&Products=&Subjects=&Disciplines=&Sort=relevance&Keywords%5B0%5D.Text=leader&Keywords%5B0%5D.Field=FullText
		//  http://sk.sagepub.com/Search/Results?SearchId=0&IncludeEntireWorks=true&IncludeParts=true&IncludeSegments=true&AvailableToMeOnly=false&SearchWithin=&BioId=&CaseProvider=&Keywords%5B0%5D.Text=zotero&Keywords%5B0%5D.Field=FullText&Contributor=&ContributorTypes=All+People&ContributorTypes=Author%2FEditor&ContributorTypes=Academic&ContributorTypes=Counselor&ContributorTypes=Director&ContributorTypes=Interviewee&ContributorTypes=Interviewer&ContributorTypes=Narrator&ContributorTypes=Practitioner&ContributorTypes=Producer&ContributorTypes=Speaker&Publisher=&PublisherLocation=&OriginalPublicationYear.StartYear=&OriginalPublicationYear.EndYear=&OnlinePublicationYear.StartYear=&OnlinePublicationYear.EndYear=&Products=0&Products=1&Products=5&Products=2&Products=3&Products=4&Products=6&DocumentTypes=Books&VideoTypes=All+Video+Types&VideoTypes=Archival+Content&VideoTypes=Conference&VideoTypes=Counseling+Session&VideoTypes=Definition&VideoTypes=Documentary&VideoTypes=Film&VideoTypes=In+Practice&VideoTypes=Interview&VideoTypes=Key+Note&VideoTypes=Lecture&VideoTypes=Panel+Discussion&VideoTypes=Raw%2FObservational+Footage&VideoTypes=Tutorial&VideoTypes=Video+Case&AcademicLevels=All&AcademicLevels=Basic&AcademicLevels=Intermediate&AcademicLevels=Complex&CaseLengthStart=&CaseLengthEnd=&Disciplines=All&Disciplines=1&Disciplines=2&Disciplines=3&Disciplines=4&Disciplines=5&Disciplines=6&Disciplines=7&Disciplines=8&Disciplines=9&Disciplines=10&PersonsDiscussed=&OrganizationsDiscussed=&EventsDiscussed=&PlacesDiscussed=&CaseOrganizationsDiscussed=&CaseIndustriesDiscussed=
		if (getSearchResults(doc)) {
			return "multiple";
		}
	} else {
		return getItemType(doc, url);
	}
}

function getItemType(doc, url) {
	if (url.split('/').length>5) {
		//This includes now also encyclopadiaArticles and dictionaryEntries.
		return "bookSection";
	} else {
		return "book";
	}
}

function getItem(doc, url) {
	var id = ZU.xpathText(doc, '(//input[@id="contentId"]/@value)[1]');
	var urlParts = url.split('/');
	if (urlParts.length>5) {
		var chapterId = urlParts[urlParts.length-1].replace('.xml', '');
		var citeLink = '//sk.sagepub.com/CitationExport/ExportEntryCitation/'+id+'?type=Endnote&xmlId='+chapterId;
	} else  {
		var citeLink = '//sk.sagepub.com/CitationExport/exportcitation/'+id+'?type=Endnote';
	}
	//Z.debug(citeLink)

	ZU.doGet(citeLink, function(text) {
		var match = text
			.replace(/NV\s+-\s+1\n/, "")
			.replace(/^AU\s+-\s+,\s+$/m, '')
			.replace(/^(AU\s+-\s+.+?),? Ph\.? ?D\.?\b/mg, '$1')
			.replace(/^DA(\s+-)/mg, 'Y2$1')
			.replace(/^C1(\s+-)/mg, 'T2$1')
			.replace(/^C2(\s+-\s+)pages\s+/mg, 'SP$1');
		//Z.debug(text);
		//Z.debug(match);
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");//RIS translator
		translator.setString(match);
		translator.setHandler("itemDone", function (obj, item) {
			var keywords = ZU.xpathText(doc, "//meta[@name='keywords']/@content");
			if (keywords) {
				item.tags = keywords.split(',');
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
			
			//Actually the title and bookTitle have to be switched.
			if (item.itemType=="bookSection" || item.itemType=="encyclopediaArticle" ||item.itemType=="dictionaryEntry") {
				if (item.title && item.bookTitle) {
					var temp = item.title;
					item.title = item.bookTitle;
					item.bookTitle = temp;
				}
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
			if (!item.abstractNote) {
				item.abstractNote = ZU.xpathText(doc, '//div[contains(@class, "abstract-text")]');
			}
			
			if (!item.publisher) {
				item.publisher = ZU.xpathText(doc, '(//ul[contains(@class, "detail-list")])[1]/li[em[contains(., "Publisher:")]]/text()[2]');
			}
			
			if (!item.ISBN) {
				item.ISBN = ZU.xpathText(doc, '(//ul[contains(@class, "detail-list")])[1]/li[contains(@class, "isbn")]');
			}
			
			item.complete();
		});
		
		translator.getTranslatorObject(function(obj) {
			var itemType = getItemType(doc, url);
			if (itemType) {
				obj.options.itemType = itemType;
			}
			obj.doImport();
		});
	});
}

function getSearchResults(doc) {
	var items = {}, found = false;
	var results = ZU.xpath(doc, '//div[@id="resultsList"]/div[contains(@class, "result")]//div[contains(@class, "copy")]');
	for (var i=0; i<results.length; i++) {
		var title = results[i].textContent;
		var url = ZU.xpathText(results[i], './h2/a/@href');

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
			if (items == null) {
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
		"url": "http://sk.sagepub.com/cqpress/students-guide-to-congress/n97.xml",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Minority Leader",
				"creators": [
					{
						"lastName": "Schulman.",
						"firstName": "Bruce J.",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"bookTitle": "Student's Guide to Congress",
				"extra": "DOI: 10.4135/9781452240190",
				"libraryCatalog": "SAGE Knowledge",
				"numberOfVolumes": "4",
				"pages": "214-216",
				"place": "Washington",
				"publisher": "CQ Press",
				"url": "http://sk.sagepub.com/cqpress/students-guide-to-congress/n97.xml",
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
		"url": "http://sk.sagepub.com/reference/schoolchoice",
		"items": [
			{
				"itemType": "book",
				"title": "Alternative Schooling and School Choice",
				"creators": [
					{
						"lastName": "Osborne",
						"firstName": "Allan , Jr.",
						"creatorType": "author"
					},
					{
						"lastName": "Russo",
						"firstName": "Charles",
						"creatorType": "author"
					},
					{
						"lastName": "Cattaro",
						"firstName": "Gerald",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"ISBN": "9781412987950 9781452218328",
				"abstractNote": "This issues-based reference set on education in the United States tackles broad, contentious topics that have prompted debate and discussion within the education community. The volumes focus on pre-school through secondary education and explore prominent and perennially important debates. This set is an essential reference resource for undergraduate students within schools of education and related fields including educational administration, educational psychology, school psychology, human development, and more. Education of America's school children always has been and always will be a hot-button issue. From what should be taught to how to pay for education to how to keep kids safe in schools, impassioned debates emerge and mushroom, both within the scholarly community and among the general public. This volume in the point/counterpoint Debating Issues in American ...",
				"extra": "DOI: 10.4135/9781452218328",
				"libraryCatalog": "SAGE Knowledge",
				"numberOfVolumes": "1",
				"place": "Thousand Oaks, California",
				"publisher": "SAGE Publications, Inc.",
				"url": "http://sk.sagepub.com/reference/schoolchoice",
				"attachments": [
					{
						"title": "SAGE Knowledge Snapshot"
					}
				],
				"tags": [
					"Fordham University",
					"Jewish schools",
					"charter schools",
					"harbors",
					"magnet schools",
					"public schools",
					"single sex schools"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://sk.sagepub.com/books/coaching-educational-leadership/n11.xml",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Leaders Coaching Leaders",
				"creators": [
					{
						"lastName": "Robertson",
						"firstName": "Jan",
						"creatorType": "author"
					}
				],
				"date": "2008",
				"bookTitle": "Coaching Educational Leadership: Building Leadership Capacity Through Partnership",
				"extra": "DOI: 10.4135/9781446221402",
				"libraryCatalog": "SAGE Knowledge",
				"pages": "151-160",
				"place": "London",
				"publisher": "SAGE Publications Ltd",
				"url": "http://sk.sagepub.com/books/coaching-educational-leadership/n11.xml",
				"attachments": [
					{
						"title": "SAGE Knowledge Snapshot"
					}
				],
				"tags": [
					"coaching",
					"educational leadership",
					"facilitation",
					"facilitators",
					"leadership development",
					"partnerships",
					"skills coaching"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://sk.sagepub.com/books/the-quick-reference-handbook-for-school-leaders",
		"items": [
			{
				"itemType": "book",
				"title": "The Quick-Reference Handbook for School Leaders",
				"creators": [],
				"date": "2007",
				"ISBN": "9781412934503 9781446214596",
				"abstractNote": "Distilled from years of NAHT (National Association of Head Teachers) experience of providing advice and guidance for its members in the UK, The Quick-Reference Handbook for School Leaders is a practical guide that provides an answer to the questions \"Where do I start?\" and \"Where do I look for direction?\" Written in an easy-to-read, bulleted format, the handbook is organised around key sections, each part includes brief overviews, checklists and suggestions for further reading. o Organisation and Management - the role of the Headteacher, negligence and liability, media relations, managing conflict and difficult people, effective meetings, inspection, resource management, records and information. o Teaching and Learning - curriculum, learning communities, special education, evaluation, staff development, unions, celebrating success. o Behaviour and Discipline - safe schools, ...",
				"extra": "DOI: 10.4135/9781446214596",
				"libraryCatalog": "SAGE Knowledge",
				"place": "London",
				"publisher": "SAGE Publications Ltd",
				"url": "http://sk.sagepub.com/books/the-quick-reference-handbook-for-school-leaders",
				"attachments": [
					{
						"title": "SAGE Knowledge Snapshot"
					}
				],
				"tags": [
					"curriculum implementation",
					"field trips",
					"governing bodies",
					"headteachers",
					"local authorities",
					"pupils",
					"staff"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://sk.sagepub.com/reference/dictionary-of-marketing-communications/n1820.xml",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Leader",
				"creators": [
					{
						"lastName": "Govoni",
						"firstName": "Norman A.",
						"creatorType": "author"
					}
				],
				"date": "2004",
				"bookTitle": "Dictionary of Marketing Communications",
				"extra": "DOI: 10.4135/9781452229669",
				"libraryCatalog": "SAGE Knowledge",
				"pages": "112-112",
				"place": "Thousand Oaks",
				"publisher": "SAGE Publications, Inc.",
				"url": "http://sk.sagepub.com/reference/dictionary-of-marketing-communications/n1820.xml",
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
		"url": "http://sk.sagepub.com/cqpress/american-political-leaders-1789-2009",
		"items": [
			{
				"itemType": "book",
				"title": "American Political Leaders 1789–2009",
				"creators": [],
				"date": "2010",
				"ISBN": "9781604265378 9781452240060",
				"abstractNote": "This handy single volume features a wealth of fascinating biographical information on approximately 9,000 of the most important U.S. elected and appointed leaders. Newly updated, it includes key facts on political leaders spanning 220 years of American history. Organized for quick, easy reference, the book contains six chapters in which readers will find the following on presidents, vice presidents, cabinet members, Supreme Court justices, members of Congress, and governors: Basic Facts including all significant biographical data, such as birth and death dates, periods of public service, and party affiliations. Special Information including boxed features and analytical commentary on topics such as presidential disability and succession; religious affiliations of the U.S. presidents and Supreme Court justices; White House hostesses; and women, African Americans, and Hispanic Americans ...",
				"extra": "DOI: 10.4135/9781452240060",
				"libraryCatalog": "SAGE Knowledge",
				"place": "Washington, DC",
				"publisher": "CQ Press",
				"url": "http://sk.sagepub.com/cqpress/american-political-leaders-1789-2009",
				"attachments": [
					{
						"title": "SAGE Knowledge Snapshot"
					}
				],
				"tags": [
					"Supreme Court",
					"Supreme Court of Justice",
					"executive departments",
					"governor",
					"senate",
					"term limits",
					"vice president"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://sk.sagepub.com/reference/behavioralsciences",
		"items": [
			{
				"itemType": "book",
				"title": "The SAGE Glossary of the Social and Behavioral Sciences",
				"creators": [
					{
						"lastName": "Sullivan",
						"firstName": "Larry",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"ISBN": "9781412951432 9781412972024",
				"abstractNote": "The SAGE Glossary of the Social and Behavioral Sciences provides college and university students with a highly accessible, curriculum-driven reference work, both in print and on-line, defining the major terms needed to achieve fluency in the social and behavioral sciences. Comprehensive and inclusive, its interdisciplinary scope covers such varied fields as anthropology, communication and media studies, criminal justice, economics, education, geography, human services, management, political science, psychology, and sociology. In addition, while not a discipline, methodology is at the core of these fields and thus receives due and equal consideration. At the same time we strive to be comprehensive and broad in scope, we recognize a need to be compact, accessible, and affordable. Thus the work is organized in A-to-Z fashion and kept to a ...",
				"extra": "DOI: 10.4135/9781412972024",
				"libraryCatalog": "SAGE Knowledge",
				"numberOfVolumes": "3",
				"place": "Thousand Oaks, California",
				"publisher": "SAGE Publications, Inc.",
				"url": "http://sk.sagepub.com/reference/behavioralsciences",
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
		"url": "http://sk.sagepub.com/navigator/accounting-history",
		"items": [
			{
				"itemType": "book",
				"title": "Accounting History",
				"creators": [
					{
						"lastName": "Fleischman",
						"firstName": "Richard",
						"creatorType": "author"
					}
				],
				"date": "2006",
				"ISBN": "9781412918701 9781446260777",
				"abstractNote": "In the last twenty years accounting history literature has been enriched by the widened examination of historical events from different paradigmatic perspectives. These debates have typically pitted “traditional” historians against “critical” historians.The 47 articles in this three-volume set delineate the basic tenets of these rival paradigms. They include the work of prominent scholars from both camps.Volumes I and II reach across key managerial and financial accounting topics. Volume III draws together literature in which paradigmatic issues have been debated heatedly and those that have reflected a tendency towards consensus and joint venturing.",
				"extra": "DOI: 10.4135/9781446260777",
				"libraryCatalog": "SAGE Knowledge",
				"numberOfVolumes": "3",
				"place": "London",
				"publisher": "SAGE Publications Ltd",
				"url": "http://sk.sagepub.com/navigator/accounting-history",
				"attachments": [
					{
						"title": "SAGE Knowledge Snapshot"
					}
				],
				"tags": [
					"France",
					"abstracting",
					"accounting",
					"accounting systems",
					"historiography",
					"normative theory",
					"scientific management"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/