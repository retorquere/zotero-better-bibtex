{
	"translatorID": "e4660e05-a935-43ec-8eec-df0347362e4c",
	"label": "ERIC",
	"creator": "Sebastian Karcher",
	"target": "^https?://(?:www\\.)?eric\\.ed\\.gov/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-03 17:36:43"
}

/*
	Translator
   Copyright (C) 2013 Sebastian Karcher

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc,url) {
	
	var xpath='//meta[@name="citation_journal_title"]';
	var type = ZU.xpathText(doc, '//meta[@name="source"]/@content');	
	if (ZU.xpath(doc, xpath).length > 0) {
		if (type && type.indexOf("Non-Journal")!=-1) return "book"
		else return "journalArticle";
	}
			
	else if (getMultiples(doc).length>0) return "multiple";
	return false;
}

function getMultiples(doc) {
	return ZU.xpath(doc, '//div[@class="r_t"]/a[contains(@href, "id=")]');
}

 
function doWeb(doc,url)
{
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		var results = getMultiples(doc)
		var link;
		for (var i in results) {
			
			hits[results[i].href] = results[i].textContent.trim();
		}
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
		ZU.processDocuments(urls, doWeb);
		});
	} else {
		var abstract = ZU.xpathText(doc, '//div[@class="abstract"]').replace(/^\|/, "");
		//Z.debug(abstract)
		var type = ZU.xpathText(doc, '//meta[@name="source"]/@content');
		// We call the Embedded Metadata translator to do the actual work
		var translator = Zotero.loadTranslator('web');
		//use Embedded Metadata
		translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
		translator.setDocument(doc);
		translator.setHandler('itemDone', function(obj, item) {
			item.abstractNote = abstract;
			//the metadata isn't good enough to properly distinguish item types. Anything that's non journal we treat as a book
			if (type && type.indexOf("Non-Journal")!=-1) item.itemType = "book";
			item.title = item.title.replace(/.\s*$/, "");
			if (item.ISSN){ 
				var ISSN = item.ISSN.match(/[0-9Xx]{4}\-[0-9Xx]{4}/);
				if (ISSN) item.ISSN = ISSN[0]
			}
			if (item.ISBN) item.ISBN = ZU.cleanISBN(item.ISBN);
			if (item.publisher) item.publisher = item.publisher.replace(/\..+/, "");
			item.url = "";
			item.libraryCatalog = "ERIC";
			item.complete();
		});
		translator.translate();
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://eric.ed.gov/?id=EJ956651",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Phyllis B.",
						"lastName": "Post",
						"creatorType": "author"
					},
					{
						"firstName": "Peggy L.",
						"lastName": "Ceballos",
						"creatorType": "author"
					},
					{
						"firstName": "Saundra L.",
						"lastName": "Penn",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Cultural Influences",
					"Therapy",
					"Play Therapy",
					"Parent Participation",
					"Cooperative Planning",
					"Counseling Techniques",
					"Guidelines",
					"Cultural Relevance",
					"Counselor Role",
					"Interpersonal Relationship"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "Collaborating with Parents to Establish Behavioral Goals in Child-Centered Play Therapy",
				"date": "2012/01/00",
				"publicationTitle": "Family Journal: Counseling and Therapy for Couples and Families",
				"volume": "20",
				"issue": "1",
				"publisher": "SAGE Publications",
				"language": "en",
				"pages": "51-57",
				"ISSN": "1066-4807",
				"abstractNote": "The purpose of this article is to provide specific guidelines for child-centered play therapists to set behavioral outcome goals to effectively work with families and to meet the demands for accountability in the managed care environment. The child-centered play therapy orientation is the most widely practiced approach among play therapists who identify a specific theoretical orientation. While information about setting broad objectives is addressed using this approach to therapy, explicit guidelines for setting behavioral goals, while maintaining the integrity of the child-centered theoretical orientation, are needed. The guidelines are presented in three phases of parent consultation: (a) the initial engagement with parents, (b) the ongoing parent consultations, and (c) the termination phase. In keeping with the child-centered approach, the authors propose to work with parents from a person-centered orientation and seek to appreciate how cultural influences relate to parents' concerns and goals for their children. A case example is provided to demonstrate how child-centered play therapists can accomplish the aforementioned goals.",
				"libraryCatalog": "ERIC",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://eric.ed.gov/?q=(prekindergarten+OR+kindergarten)+AND+literacy",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://eric.ed.gov/?q=(prekindergarten+OR+kindergarten)+AND+literacy&ff1=pubBooks&id=ED509979",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Katherine A.",
						"lastName": "Beauchat",
						"creatorType": "author"
					},
					{
						"firstName": "Katrin L.",
						"lastName": "Blamey",
						"creatorType": "author"
					},
					{
						"firstName": "Sharon",
						"lastName": "Walpole",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Play",
					"Group Activities",
					"Oral Language",
					"Disadvantaged Youth",
					"Phonological Awareness",
					"Second Language Learning",
					"Preschool Teachers",
					"Emergent Literacy",
					"Vocabulary Development",
					"Suburban Schools",
					"Best Practices",
					"English (Second Language)",
					"Preschool Children",
					"Reprography",
					"Instructional Materials",
					"Language Skills",
					"Educational Assessment",
					"Classroom Environment",
					"Alphabets",
					"Reading Instruction",
					"Writing Instruction"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "The Building Blocks of Preschool Success",
				"date": "2010/06/00",
				"publicationTitle": "Guilford Publications",
				"publisher": "Guilford Press",
				"ISBN": "9781606236949",
				"language": "en",
				"abstractNote": "Written expressly for preschool teachers, this engaging book explains the \"whats,\" \"whys,\" and \"how-tos\" of implementing best practices for instruction in the preschool classroom. The authors show how to target key areas of language and literacy development across the entire school day, including whole-group and small-group activities, center time, transitions, and outdoor play. Detailed examples in every chapter illustrate what effective instruction and assessment look like in three distinct settings: a school-based pre-kindergarten, a Head Start center with many English language learners, and a private suburban preschool. Helpful book lists, charts, and planning tools are featured, including reproducible materials. Contents include: (1) The Realities of Preschool; (2) A Focus on Oral Language and Vocabulary Development; (3) Comprehension; (4) Phonological Awareness; (5) Print and Alphabet Awareness; (6) Emergent Writing; (7) Tracking Children's Progress: The Role of Assessment in Preschool Classrooms; and (8) Making It Work for Adults and Children.",
				"libraryCatalog": "ERIC",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/