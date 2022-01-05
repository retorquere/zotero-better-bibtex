{
	"translatorID": "3d0231ce-fd4b-478c-b1d3-840389e5b68c",
	"label": "PubMed",
	"creator": "Philipp Zumstein",
	"target": "^https?://([^/]+\\.)?(www|preview)\\.ncbi\\.nlm\\.nih\\.gov[^/]*/(m/)?(books|pubmed|labs/pubmed|myncbi|sites/pubmed|sites/entrez|entrez/query\\.fcgi\\?.*db=PubMed|myncbi/browse/collection/?|myncbi/collections/)|^https?://pubmed\\.ncbi\\.nlm\\.nih\\.gov/(\\d|\\?|searches/)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 12,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-12-16 03:19:29"
}

/*
 	***** BEGIN LICENSE BLOCK *****
 	
 	Copyright © 2015 Philipp Zumstein
 	
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
 
  
/** ***************************
  * General utility functions *
  *****************************/

function lookupPMIDs(ids) {
	var newUri = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?"
		+ "db=PubMed&tool=Zotero&retmode=xml&rettype=citation&id=" + ids.join(",");
	// Zotero.debug(newUri);
	Zotero.Utilities.HTTP.doGet(newUri, function (text) {
		if (!text.includes('PubmedArticle') && !text.includes('PubmedBookArticle')) { // e.g. http://www.ncbi.nlm.nih.gov/pubmed/1477919937
			throw new Error("No Pubmed Data found - Most likely eutils is temporarily down");
		}
		
		// call the import translator
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("fcf41bed-0cbc-3704-85c7-8062a0068a7a");
		translator.setString(text);
		translator.translate();
	});
}


/** **************************
 * Web translator functions *
 ****************************/
// retrieves the UID from an item page. Returns false if there is more than one.
function getUID(doc) {
	var uid = ZU.xpath(doc, 'html/head/meta[@name="ncbi_uidlist" or @name="ncbi_article_id" or @name="uid"]/@content');
	if (!uid.length) {
		uid = ZU.xpath(doc, '//input[@id="absid"]/@value');
	}

	if (uid.length == 1 && uid[0].textContent.search(/^\d+$/) != -1) {
		return uid[0].textContent;
	}
	
	uid = ZU.xpath(doc, 'html/head/link[@media="handheld"]/@href');
	if (!uid.length) uid = ZU.xpath(doc, 'html/head/link[@rel="canonical"]/@href'); // mobile site
	if (uid.length == 1) {
		uid = uid[0].textContent.match(/\/(\d+)(?:\/|$)/);
		if (uid) return uid[1];
	}
	
	// PMID from a bookshelf entry
	var maincontent = doc.getElementById('maincontent');
	if (maincontent) {
		uid = ZU.xpath(maincontent,
			'.//a[@title="PubMed record of this title" or @title="PubMed record of this page"]');
		if (uid.length == 1 && uid[0].textContent.search(/^\d+$/) != -1) return uid[0].textContent;
	}

	return false;
}

// retrieve itemprop elements for scraping books directly from page where UID is not available
function getBookProps(doc) {
	var main = doc.getElementById('maincontent');
	if (!main) return false;
	var itemprops = ZU.xpath(main, './/div[@itemtype="http://schema.org/Book"]//*[@itemprop]');
	return itemprops.length ? itemprops : null;
}

// itemprop to Zotero field map
var bookRDFaMap = {
	name: 'title',
	bookEdition: 'edition',
	author: 'creator/author',
	publisher: 'publisher',
	datePublished: 'date',
	isbn: 'ISBN',
	description: 'abstractNote'
};

function scrapeItemProps(itemprops) {
	var item = new Zotero.Item('book');
	for (var i = 0; i < itemprops.length; i++) {
		var value = ZU.trimInternal(itemprops[i].textContent);
		var field = bookRDFaMap[itemprops[i].getAttribute('itemprop')];
		if (!field) continue;
		
		if (field.indexOf('creator/') == 0) {
			field = field.substr(8);
			item.creators.push(ZU.cleanAuthor(value, field, false));
		}
		else if (field == 'ISBN') {
			if (!item.ISBN) item.ISBN = '';
			else item.ISBN += '; ';
			
			item.ISBN += value;
		}
		else {
			item[field] = value;
		}
	}
	item.complete();
}

/**
 * Handles:
 * search results: http://www.ncbi.nlm.nih.gov/pubmed/?term=cell
 * NCBI collections; http://www.ncbi.nlm.nih.gov/myncbi/browse/collection/40383442/?sort=&direction=
 * My Bibliography
 */
function getSearchResults(doc, checkOnly) {
	var results = doc.querySelectorAll('.rslt, .docsum-wrap, .citation-wrap, citationListItem');
	var items = {}, found = false;

	if (!results.length) return false;
	for (var i = 0; i < results.length; i++) {
		var title = ZU.xpathText(results[i], '(.//p[@class="title"]|.//h1)[1]')
			|| ZU.xpathText(results[i], './/a[@class="docsum-title"]')
			|| ZU.xpathText(results[i], './/div[@class="ncbi-docsum"]/a'); // My Bibliography

		var uid = ZU.xpathText(results[i], './/input[starts-with(@id,"UidCheckBox")]/@value')
			|| ZU.xpathText(results[i], './/div[contains(@class, "docsum-citation")]//span[@class="docsum-pmid"]')
			|| ZU.xpathText(results[i], './div[@class="citation"]//input/@pmid') // My Bibliography
			||			ZU.xpathText(results[i], './/dl[@class="rprtid"]/dd[preceding-sibling::*[1][text()="PMID:"]]');

		if (!uid) {
			uid = ZU.xpathText(results[i], './/p[@class="title"]/a/@href');
			if (uid) uid = uid.match(/\/(\d+)/);
			if (uid) uid = uid[1];
		}

		if (!uid || !title) continue;

		if (checkOnly) return true;
		found = true;

		// Checkbox is a descendant of the containing .rprt div
		var checkbox = ZU.xpath(results[i].parentNode, './/input[@type="checkbox"]')[0];

		// Keys must be strings. Otherwise, Chrome sorts numerically instead of by insertion order.
		items["u" + uid] = {
			title: ZU.trimInternal(title),
			checked: checkbox && checkbox.checked
		};
	}
	return found ? items : false;
}

function detectWeb(doc, url) {
	if (getSearchResults(doc, true) && !url.includes("/books/")) {
		return "multiple";
	}
	
	if (!getUID(doc)) {
		if (getBookProps(doc)) return 'book';
		// if we can't get the UID or the book itemprops, we can't import
		else return false;
	}
	
	// try to determine if this is a book
	// "Sections" heading only seems to show up for books
	var maincontent = doc.getElementById('maincontent');
	if (maincontent && ZU.xpath(maincontent, './/div[@class="sections"]').length) {
		var inBook = ZU.xpath(maincontent, './/div[contains(@class, "aff_inline_book")]').length;
		return inBook ? "bookSection" : "book";
	}

	// determine if book or bookSection for PubMed Labs
	var bookCitation = doc.getElementsByClassName('book-citation');
	if (bookCitation.length > 0 && ZU.xpath(doc, './/div[@class="affiliations"]')) {
		// For a bookSection there is the affiliations section of the authors of this
		// section as well as another affiliation sections for the book authors.
		var isChapter = doc.querySelectorAll('#full-view-heading div.affiliations').length > 1;
		return isChapter ? "bookSection" : "book";
	}
	
	// from bookshelf page
	var pdid = ZU.xpathText(doc, 'html/head/meta[@name="ncbi_pdid"]/@content');
	if (pdid == "book-part") return 'bookSection';
	if (pdid == "book-toc") return 'book';
	
	return "journalArticle";
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc), function (selectedItems) {
			if (!selectedItems) return;

			var uids = [];
			for (var i in selectedItems) {
				uids.push(i.substr(1));
			}
			lookupPMIDs(uids);
		});
	}
	else {
		var uid = getUID(doc);
		if (uid) {
			lookupPMIDs([uid]);
		}
		else {
			var itemprops = getBookProps(doc);
			if (itemprops) {
				scrapeItemProps(itemprops);
			}
		}
	}
}


/** *****************************
 * Search translator functions *
 *******************************/
// extract PMID from a context object
function getPMID(co) {
	var coParts = co.split("&");
	for (var i = 0; i < coParts.length; i++) {
		var part = coParts[i];
		if (part.substr(0, 7) == "rft_id=") {
			var value = decodeURIComponent(part.substr(7));
			if (value.substr(0, 10) == "info:pmid/") {
				return value.substr(10);
			}
		}
	}
	return false;
}

function detectSearch(item) {
	if (item.contextObject) {
		if (getPMID(item.contextObject)) {
			return true;
		}
	}
	
	// supply PMID as a string or array
	if (item.PMID
		&& (typeof item.PMID == 'string' || item.PMID.length > 0)) {
		return true;
	}
	
	return false;
}

function doSearch(item) {
	var pmid;
	if (item.contextObject) {
		pmid = getPMID(item.contextObject);
	}
	if (!pmid) pmid = item.PMID;
	
	if (typeof pmid == "string") pmid = [pmid];
	
	lookupPMIDs(pmid);
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.ncbi.nlm.nih.gov/pubmed/20729678",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Zotero: harnessing the power of a personal bibliographic manager",
				"creators": [
					{
						"firstName": "Jaekea T.",
						"lastName": "Coar",
						"creatorType": "author"
					},
					{
						"firstName": "Jeanne P.",
						"lastName": "Sewell",
						"creatorType": "author"
					}
				],
				"date": "2010 Sep-Oct",
				"DOI": "10.1097/NNE.0b013e3181ed81e4",
				"ISSN": "1538-9855",
				"abstractNote": "Zotero is a powerful free personal bibliographic manager (PBM) for writers. Use of a PBM allows the writer to focus on content, rather than the tedious details of formatting citations and references. Zotero 2.0 (http://www.zotero.org) has new features including the ability to synchronize citations with the off-site Zotero server and the ability to collaborate and share with others. An overview on how to use the software and discussion about the strengths and limitations are included.",
				"extra": "PMID: 20729678",
				"issue": "5",
				"journalAbbreviation": "Nurse Educ",
				"language": "eng",
				"libraryCatalog": "PubMed",
				"pages": "205-207",
				"publicationTitle": "Nurse Educator",
				"shortTitle": "Zotero",
				"volume": "35",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Bibliographies as Topic"
					},
					{
						"tag": "Database Management Systems"
					},
					{
						"tag": "Humans"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.ncbi.nlm.nih.gov/pubmed?term=zotero",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.ncbi.nlm.nih.gov/pubmed/20821847",
		"items": [
			{
				"itemType": "book",
				"title": "Endocrinology: An Integrated Approach",
				"creators": [
					{
						"firstName": "Stephen",
						"lastName": "Nussey",
						"creatorType": "author"
					},
					{
						"firstName": "Saffron",
						"lastName": "Whitehead",
						"creatorType": "author"
					}
				],
				"date": "2001",
				"ISBN": "9781859962527",
				"abstractNote": "Endocrinology has been written to meet the requirements of today's trainee doctors and the demands of an increasing number of degree courses in health and biomedical sciences, and allied subjects. It is a truly integrated text using large numbers of real clinical cases to introduce the basic biochemistry, physiology and pathophysiology underlying endocrine disorders and also the principles of clinical diagnosis and treatment. The increasing importance of the molecular and genetic aspects of endocrinology in relation to clinical medicine is explained.",
				"callNumber": "NBK22",
				"extra": "PMID: 20821847",
				"language": "eng",
				"libraryCatalog": "PubMed",
				"place": "Oxford",
				"publisher": "BIOS Scientific Publishers",
				"rights": "Copyright © 2001, BIOS Scientific Publishers Limited.",
				"shortTitle": "Endocrinology",
				"url": "http://www.ncbi.nlm.nih.gov/books/NBK22/",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
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
		"url": "https://www.ncbi.nlm.nih.gov/pubmed?term=21249754",
		"items": [
			{
				"itemType": "book",
				"title": "Cancer Syndromes",
				"creators": [
					{
						"firstName": "Douglas L.",
						"lastName": "Riegert-Johnson",
						"creatorType": "editor"
					},
					{
						"firstName": "Lisa A.",
						"lastName": "Boardman",
						"creatorType": "editor"
					},
					{
						"firstName": "Timothy",
						"lastName": "Hefferon",
						"creatorType": "editor"
					},
					{
						"firstName": "Maegan",
						"lastName": "Roberts",
						"creatorType": "editor"
					}
				],
				"date": "2009",
				"abstractNote": "Cancer Syndromes is a comprehensive multimedia resource for selected single gene cancer syndromes. Syndromes currently included are Peutz-Jeghers syndrome, juvenile polyposis, Birt-Hogg-Dubé syndrome, multiple endocrine neoplasia type 1 and familial atypical multiple mole melanoma syndrome. For each syndrome the history, epidemiology, natural history and management are reviewed. If possible the initial report in the literature of each syndrome is included as an appendix. Chapters are extensively annotated with figures and movie clips. Mission Statement: Improving the care of cancer syndrome patients.",
				"callNumber": "NBK1825",
				"extra": "PMID: 21249754",
				"language": "eng",
				"libraryCatalog": "PubMed",
				"place": "Bethesda (MD)",
				"publisher": "National Center for Biotechnology Information (US)",
				"rights": "Copyright © 2009-, Douglas L Riegert-Johnson.",
				"url": "http://www.ncbi.nlm.nih.gov/books/NBK1825/",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
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
		"url": "https://www.ncbi.nlm.nih.gov/pubmed/?term=11109029",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Screening for hypercholesterolaemia versus case finding for familial hypercholesterolaemia: a systematic review and cost-effectiveness analysis",
				"creators": [
					{
						"firstName": "D.",
						"lastName": "Marks",
						"creatorType": "author"
					},
					{
						"firstName": "D.",
						"lastName": "Wonderling",
						"creatorType": "author"
					},
					{
						"firstName": "M.",
						"lastName": "Thorogood",
						"creatorType": "author"
					},
					{
						"firstName": "H.",
						"lastName": "Lambert",
						"creatorType": "author"
					},
					{
						"firstName": "S. E.",
						"lastName": "Humphries",
						"creatorType": "author"
					},
					{
						"firstName": "H. A.",
						"lastName": "Neil",
						"creatorType": "author"
					}
				],
				"date": "2000",
				"ISSN": "1366-5278",
				"abstractNote": "BACKGROUND: In the majority of people with familial hypercholesterolaemia (FH) the disorder is caused by a mutation of the low-density lipoprotein receptor gene that impairs its proper function, resulting in very high levels of plasma cholesterol. Such levels result in early and severe atherosclerosis, and hence substantial excess mortality from coronary heart disease. Most people with FH are undiagnosed or only diagnosed after their first coronary event, but early detection and treatment with hydroxymethylglutaryl-coenzyme (HMG CoA) reductase inhibitors (statins) can reduce morbidity and mortality. The prevalence of FH in the UK population is estimated to be 1 in 500, which means that approximately 110,000 people are affected.\nOBJECTIVES: To evaluate whether screening for FH is appropriate. To determine which system of screening is most acceptable and cost-effective. To assess the deleterious psychosocial effects of genetic and clinical screening for an asymptomatic treatable inherited condition. To assess whether the risks of screening outweigh potential benefits.\nMETHODS: DATA SOURCES: Relevant papers were identified through a search of the electronic databases. Additional papers referenced in the search material were identified and collected. Known researchers in the field were contacted and asked to supply information on unpublished or ongoing studies. INCLUSION/EXCLUSION CRITERIA: SCREENING AND TREATMENT: The review included studies of the mortality and morbidity associated with FH, the effectiveness and cost of treatment (ignoring pre-statin therapies in adults), and of the effectiveness or cost of possible screening strategies for FH. PSYCHOSOCIAL EFFECTS OF SCREENING: The search for papers on the psychological and social effects of screening for a treatable inherited condition was limited to the last 5 years because recent developments in genetic testing have changed the nature and implications of such screening tests. Papers focusing on genetic testing for FH and breast cancer were included. Papers relating to the risk of coronary heart disease with similarly modifiable outcome (non-FH) were also included. DATA EXTRACTION AND ASSESSMENT OF VALIDITY: A data assessment tool was designed to assess the quality and validity of the papers which reported primary data for the social and psychological effects of screening. Available guidelines for systematically reviewing papers concentrated on quantitative methods, and were of limited relevance. An algorithm was developed which could be used for both the qualitative and quantitative literature. MODELLING METHODS: A model was constructed to investigate the relative cost and effectiveness of various forms of population screening (universal or opportunistic) and case-finding screening (screening relatives of known FH cases). All strategies involved a two-stage process: first, identifying those people with cholesterol levels sufficiently elevated to be compatible with a diagnosis of FH, and then either making the diagnosis based on clinical signs and a family history of coronary disease or carrying out genetic tests. Cost-effectiveness has been measured in terms of incremental cost per year of life gained.\nRESULTS: MODELLING COST-EFFECTIVENESS: FH is a life-threatening condition with a long presymptomatic state. Diagnostic tests are reasonably reliable and acceptable, and treatment with statins substantially improves prognosis. Therefore, it is appropriate to consider systematic screening for this condition. Case finding amongst relatives of FH cases was the most cost-effective strategy, and universal systematic screening the least cost-effective. However, when targeted at young people (16 year olds) universal screening was also cost-effective. Screening patients admitted to hospital with premature myocardial infarction was also relatively cost-effective. Screening is least cost-effective in men aged over 35 years, because the gains in life expectancy are small. (ABSTRACT TRUNCA",
				"extra": "PMID: 11109029",
				"issue": "29",
				"journalAbbreviation": "Health Technol Assess",
				"language": "eng",
				"libraryCatalog": "PubMed",
				"pages": "1-123",
				"publicationTitle": "Health Technology Assessment (Winchester, England)",
				"shortTitle": "Screening for hypercholesterolaemia versus case finding for familial hypercholesterolaemia",
				"volume": "4",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"Adult",
					"Aged",
					"Algorithms",
					"Attitude to Health",
					"Child",
					"Cost-Benefit Analysis",
					"Decision Trees",
					"Female",
					"Humans",
					"Hyperlipoproteinemia Type II",
					"Male",
					"Mass Screening",
					"Middle Aged",
					"Models, Econometric",
					"Morbidity",
					"Needs Assessment",
					"Practice Guidelines as Topic",
					"Research Design",
					"Technology Assessment, Biomedical",
					"United Kingdom"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.ncbi.nlm.nih.gov/pubmed/21249758",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Implications of Peutz-Jeghers Syndrome in Children and Adolescents",
				"creators": [
					{
						"firstName": "Warren",
						"lastName": "Hyer",
						"creatorType": "author"
					},
					{
						"firstName": "Douglas L.",
						"lastName": "Riegert-Johnson",
						"creatorType": "editor"
					},
					{
						"firstName": "Lisa A.",
						"lastName": "Boardman",
						"creatorType": "editor"
					},
					{
						"firstName": "Timothy",
						"lastName": "Hefferon",
						"creatorType": "editor"
					},
					{
						"firstName": "Maegan",
						"lastName": "Roberts",
						"creatorType": "editor"
					}
				],
				"date": "2009",
				"abstractNote": "Pigmentation tends to arise in infancy, occurring around the mouth, nostrils, perianal area, fingers and toes, and the dorsal and volar aspects of hands and feet (Figure 1). They may fade after puberty but tend to persist in the buccal mucosa. The primary concern to the paediatrician is the risk of small bowel intussusception causing intestinal obstruction, vomiting, and pain. In addition, intestinal bleeding leading to anaemia can occur. The management of a young child with mid-gut PJS polyps is controversial. In a retrospective review, 68% of children had undergone a laparotomy for bowel obstruction by the age of 18 years, and many of these proceeded to a second laparotomy within 5 years (1). There is a high re-operation rate after initial laparotomy for small bowel obstruction.",
				"bookTitle": "Cancer Syndromes",
				"callNumber": "NBK26374",
				"extra": "PMID: 21249758",
				"language": "eng",
				"libraryCatalog": "PubMed",
				"place": "Bethesda (MD)",
				"publisher": "National Center for Biotechnology Information (US)",
				"rights": "Copyright © 2009-, Douglas L Riegert-Johnson.",
				"url": "http://www.ncbi.nlm.nih.gov/books/NBK26374/",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Printable HTML",
						"mimeType": "text/html",
						"snapshot": true
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
		"url": "https://www.ncbi.nlm.nih.gov/books/NBK26374/",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Implications of Peutz-Jeghers Syndrome in Children and Adolescents",
				"creators": [
					{
						"firstName": "Warren",
						"lastName": "Hyer",
						"creatorType": "author"
					},
					{
						"firstName": "Douglas L.",
						"lastName": "Riegert-Johnson",
						"creatorType": "editor"
					},
					{
						"firstName": "Lisa A.",
						"lastName": "Boardman",
						"creatorType": "editor"
					},
					{
						"firstName": "Timothy",
						"lastName": "Hefferon",
						"creatorType": "editor"
					},
					{
						"firstName": "Maegan",
						"lastName": "Roberts",
						"creatorType": "editor"
					}
				],
				"date": "2009",
				"abstractNote": "Pigmentation tends to arise in infancy, occurring around the mouth, nostrils, perianal area, fingers and toes, and the dorsal and volar aspects of hands and feet (Figure 1). They may fade after puberty but tend to persist in the buccal mucosa. The primary concern to the paediatrician is the risk of small bowel intussusception causing intestinal obstruction, vomiting, and pain. In addition, intestinal bleeding leading to anaemia can occur. The management of a young child with mid-gut PJS polyps is controversial. In a retrospective review, 68% of children had undergone a laparotomy for bowel obstruction by the age of 18 years, and many of these proceeded to a second laparotomy within 5 years (1). There is a high re-operation rate after initial laparotomy for small bowel obstruction.",
				"bookTitle": "Cancer Syndromes",
				"callNumber": "NBK26374",
				"extra": "PMID: 21249758",
				"language": "eng",
				"libraryCatalog": "PubMed",
				"place": "Bethesda (MD)",
				"publisher": "National Center for Biotechnology Information (US)",
				"rights": "Copyright © 2009-, Douglas L Riegert-Johnson.",
				"url": "http://www.ncbi.nlm.nih.gov/books/NBK26374/",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Printable HTML",
						"mimeType": "text/html",
						"snapshot": true
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
		"url": "https://www.ncbi.nlm.nih.gov/books/NBK1825/",
		"items": [
			{
				"itemType": "book",
				"title": "Cancer Syndromes",
				"creators": [
					{
						"firstName": "Douglas L.",
						"lastName": "Riegert-Johnson",
						"creatorType": "editor"
					},
					{
						"firstName": "Lisa A.",
						"lastName": "Boardman",
						"creatorType": "editor"
					},
					{
						"firstName": "Timothy",
						"lastName": "Hefferon",
						"creatorType": "editor"
					},
					{
						"firstName": "Maegan",
						"lastName": "Roberts",
						"creatorType": "editor"
					}
				],
				"date": "2009",
				"abstractNote": "Cancer Syndromes is a comprehensive multimedia resource for selected single gene cancer syndromes. Syndromes currently included are Peutz-Jeghers syndrome, juvenile polyposis, Birt-Hogg-Dubé syndrome, multiple endocrine neoplasia type 1 and familial atypical multiple mole melanoma syndrome. For each syndrome the history, epidemiology, natural history and management are reviewed. If possible the initial report in the literature of each syndrome is included as an appendix. Chapters are extensively annotated with figures and movie clips. Mission Statement: Improving the care of cancer syndrome patients.",
				"callNumber": "NBK1825",
				"extra": "PMID: 21249754",
				"language": "eng",
				"libraryCatalog": "PubMed",
				"place": "Bethesda (MD)",
				"publisher": "National Center for Biotechnology Information (US)",
				"rights": "Copyright © 2009-, Douglas L Riegert-Johnson.",
				"url": "http://www.ncbi.nlm.nih.gov/books/NBK1825/",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
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
		"url": "https://www.ncbi.nlm.nih.gov/pubmed/21249755",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Peutz-Jeghers Syndrome",
				"creators": [
					{
						"firstName": "Douglas",
						"lastName": "Riegert-Johnson",
						"creatorType": "author"
					},
					{
						"firstName": "Ferga C.",
						"lastName": "Gleeson",
						"creatorType": "author"
					},
					{
						"firstName": "Wytske",
						"lastName": "Westra",
						"creatorType": "author"
					},
					{
						"firstName": "Timothy",
						"lastName": "Hefferon",
						"creatorType": "author"
					},
					{
						"firstName": "Louis M.",
						"lastName": "Wong Kee Song",
						"creatorType": "author"
					},
					{
						"firstName": "Lauren",
						"lastName": "Spurck",
						"creatorType": "author"
					},
					{
						"firstName": "Lisa A.",
						"lastName": "Boardman",
						"creatorType": "author"
					},
					{
						"firstName": "Douglas L.",
						"lastName": "Riegert-Johnson",
						"creatorType": "editor"
					},
					{
						"firstName": "Lisa A.",
						"lastName": "Boardman",
						"creatorType": "editor"
					},
					{
						"firstName": "Timothy",
						"lastName": "Hefferon",
						"creatorType": "editor"
					},
					{
						"firstName": "Maegan",
						"lastName": "Roberts",
						"creatorType": "editor"
					}
				],
				"date": "2009",
				"bookTitle": "Cancer Syndromes",
				"callNumber": "NBK1826",
				"extra": "PMID: 21249755",
				"language": "eng",
				"libraryCatalog": "PubMed",
				"place": "Bethesda (MD)",
				"publisher": "National Center for Biotechnology Information (US)",
				"url": "http://www.ncbi.nlm.nih.gov/books/NBK1826/",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Printable HTML",
						"mimeType": "text/html",
						"snapshot": true
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
		"url": "https://pubmed.ncbi.nlm.nih.gov/20981092/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A map of human genome variation from population-scale sequencing",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "1000 Genomes Project Consortium",
						"fieldMode": 1
					},
					{
						"firstName": "Gonçalo R.",
						"lastName": "Abecasis",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Altshuler",
						"creatorType": "author"
					},
					{
						"firstName": "Adam",
						"lastName": "Auton",
						"creatorType": "author"
					},
					{
						"firstName": "Lisa D.",
						"lastName": "Brooks",
						"creatorType": "author"
					},
					{
						"firstName": "Richard M.",
						"lastName": "Durbin",
						"creatorType": "author"
					},
					{
						"firstName": "Richard A.",
						"lastName": "Gibbs",
						"creatorType": "author"
					},
					{
						"firstName": "Matt E.",
						"lastName": "Hurles",
						"creatorType": "author"
					},
					{
						"firstName": "Gil A.",
						"lastName": "McVean",
						"creatorType": "author"
					}
				],
				"date": "2010-10-28",
				"DOI": "10.1038/nature09534",
				"ISSN": "1476-4687",
				"abstractNote": "The 1000 Genomes Project aims to provide a deep characterization of human genome sequence variation as a foundation for investigating the relationship between genotype and phenotype. Here we present results of the pilot phase of the project, designed to develop and compare different strategies for genome-wide sequencing with high-throughput platforms. We undertook three projects: low-coverage whole-genome sequencing of 179 individuals from four populations; high-coverage sequencing of two mother-father-child trios; and exon-targeted sequencing of 697 individuals from seven populations. We describe the location, allele frequency and local haplotype structure of approximately 15 million single nucleotide polymorphisms, 1 million short insertions and deletions, and 20,000 structural variants, most of which were previously undescribed. We show that, because we have catalogued the vast majority of common variation, over 95% of the currently accessible variants found in any individual are present in this data set. On average, each person is found to carry approximately 250 to 300 loss-of-function variants in annotated genes and 50 to 100 variants previously implicated in inherited disorders. We demonstrate how these results can be used to inform association and functional studies. From the two trios, we directly estimate the rate of de novo germline base substitution mutations to be approximately 10(-8) per base pair per generation. We explore the data with regard to signatures of natural selection, and identify a marked reduction of genetic variation in the neighbourhood of genes, due to selection at linked sites. These methods and public data will support the next phase of human genetic research.",
				"extra": "PMID: 20981092\nPMCID: PMC3042601",
				"issue": "7319",
				"journalAbbreviation": "Nature",
				"language": "eng",
				"libraryCatalog": "PubMed",
				"pages": "1061-1073",
				"publicationTitle": "Nature",
				"volume": "467",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Calibration"
					},
					{
						"tag": "Chromosomes, Human, Y"
					},
					{
						"tag": "Computational Biology"
					},
					{
						"tag": "DNA Mutational Analysis"
					},
					{
						"tag": "DNA, Mitochondrial"
					},
					{
						"tag": "Evolution, Molecular"
					},
					{
						"tag": "Female"
					},
					{
						"tag": "Genetic Association Studies"
					},
					{
						"tag": "Genetic Variation"
					},
					{
						"tag": "Genetics, Population"
					},
					{
						"tag": "Genome, Human"
					},
					{
						"tag": "Genome-Wide Association Study"
					},
					{
						"tag": "Genomics"
					},
					{
						"tag": "Genotype"
					},
					{
						"tag": "Haplotypes"
					},
					{
						"tag": "Humans"
					},
					{
						"tag": "Male"
					},
					{
						"tag": "Mutation"
					},
					{
						"tag": "Pilot Projects"
					},
					{
						"tag": "Polymorphism, Single Nucleotide"
					},
					{
						"tag": "Recombination, Genetic"
					},
					{
						"tag": "Sample Size"
					},
					{
						"tag": "Selection, Genetic"
					},
					{
						"tag": "Sequence Alignment"
					},
					{
						"tag": "Sequence Analysis, DNA"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.ncbi.nlm.nih.gov/books/NBK21054/",
		"items": [
			{
				"itemType": "book",
				"title": "Molecular Biology of the Cell",
				"creators": [
					{
						"firstName": "Bruce",
						"lastName": "Alberts",
						"creatorType": "author"
					},
					{
						"firstName": "Alexander",
						"lastName": "Johnson",
						"creatorType": "author"
					},
					{
						"firstName": "Julian",
						"lastName": "Lewis",
						"creatorType": "author"
					},
					{
						"firstName": "Martin",
						"lastName": "Raff",
						"creatorType": "author"
					},
					{
						"firstName": "Keith",
						"lastName": "Roberts",
						"creatorType": "author"
					},
					{
						"firstName": "Peter",
						"lastName": "Walter",
						"creatorType": "author"
					}
				],
				"date": "2002",
				"ISBN": "9780815332183 9780815340720",
				"abstractNote": "ExcerptMolecular Biology of the Cell is the classic in-depth text reference in cell biology. By extracting fundamental concepts and meaning from this enormous and ever-growing field, the authors tell the story of cell biology, and create a coherent framework through which non-expert readers may approach the subject. Written in clear and concise language, and illustrated with original drawings, the book is enjoyable to read, and provides a sense of the excitement of modern biology. Molecular Biology of the Cell not only sets forth the current understanding of cell biology (updated as of Fall 2001), but also explores the intriguing implications and possibilities of that which remains unknown.",
				"edition": "4th",
				"libraryCatalog": "PubMed",
				"publisher": "Garland Science",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://pubmed.ncbi.nlm.nih.gov/14779137/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Surgical management of pancreatitis",
				"creators": [
					{
						"firstName": "C. C.",
						"lastName": "Blackwell",
						"creatorType": "author"
					}
				],
				"date": "1950-10",
				"ISSN": "0025-7044",
				"extra": "PMID: 14779137",
				"issue": "4",
				"journalAbbreviation": "J Med Assoc State Ala",
				"language": "eng",
				"libraryCatalog": "PubMed",
				"pages": "118-128",
				"publicationTitle": "Journal of the Medical Association of the State of Alabama",
				"volume": "20",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Humans"
					},
					{
						"tag": "PANCREATITIS"
					},
					{
						"tag": "Pancreatitis"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.ncbi.nlm.nih.gov/labs/pubmed?term=zotero",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.ncbi.nlm.nih.gov/pubmed?term=21249754",
		"items": [
			{
				"itemType": "book",
				"title": "Cancer Syndromes",
				"creators": [
					{
						"firstName": "Douglas L.",
						"lastName": "Riegert-Johnson",
						"creatorType": "editor"
					},
					{
						"firstName": "Lisa A.",
						"lastName": "Boardman",
						"creatorType": "editor"
					},
					{
						"firstName": "Timothy",
						"lastName": "Hefferon",
						"creatorType": "editor"
					},
					{
						"firstName": "Maegan",
						"lastName": "Roberts",
						"creatorType": "editor"
					}
				],
				"date": "2009",
				"abstractNote": "Cancer Syndromes is a comprehensive multimedia resource for selected single gene cancer syndromes.\nSyndromes currently included are Peutz-Jeghers syndrome, juvenile polyposis, Birt-Hogg-Dubé syndrome, multiple endocrine neoplasia type 1\nand familial atypical multiple mole melanoma syndrome. For each syndrome the history, epidemiology, natural history and management are reviewed.\nIf possible the initial report in the literature of each syndrome is included as an appendix. Chapters are extensively annotated with figures and\nmovie clips. \nMission Statement: Improving the care of cancer syndrome patients.",
				"callNumber": "NBK1825",
				"extra": "PMID: 21249754",
				"language": "eng",
				"libraryCatalog": "PubMed",
				"place": "Bethesda (MD)",
				"publisher": "National Center for Biotechnology Information (US)",
				"rights": "Copyright © 2009-, Douglas L Riegert-Johnson.",
				"url": "http://www.ncbi.nlm.nih.gov/books/NBK1825/",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
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
		"url": "https://pubmed.ncbi.nlm.nih.gov/?term=testing",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.ncbi.nlm.nih.gov/sites/myncbi/1-kV-e_Xzodkb/collections/59603323/public/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.ncbi.nlm.nih.gov/myncbi/1-kV-e_Xzodkb/bibliography/public/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://pubmed.ncbi.nlm.nih.gov/31221671/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Recognising bias in studies of diagnostic tests part 2: interpreting and verifying the index test",
				"creators": [
					{
						"firstName": "Bory",
						"lastName": "Kea",
						"creatorType": "author"
					},
					{
						"firstName": "M. Kennedy",
						"lastName": "Hall",
						"creatorType": "author"
					},
					{
						"firstName": "Ralph",
						"lastName": "Wang",
						"creatorType": "author"
					}
				],
				"date": "2019-08",
				"DOI": "10.1136/emermed-2019-208447",
				"ISSN": "1472-0213",
				"abstractNote": "Multiple pitfalls can occur with the conduct and analysis of a study of diagnostic tests, resulting in biased accuracy. Our conceptual model includes three stages: patient selection, interpretation of the index test and disease verification. In part 2, we focus on (1) Interpretation bias (or workup bias): where the classification of an indeterminate index test result can bias the accuracy of a test or how lack of blinding can bias a subjective test result, and (2) Disease verification bias: where the index test result is incorporated into the gold standard or when the gold standard is applied only to a select population as the gold standard is an invasive test. In an example with age-adjusted D-dimer for pulmonary embolism, differential verification bias was a limitation due to the use of two gold standards-CT for a high-risk population and follow-up for symptoms in a low-risk population. However, there are circumstances when certain choices in study design are unavoidable, and result in biased test characteristics. In this case, the informed reader will better judge the quality of a study by recognising the potential biases and limitations by being methodical in their approach to understanding the methods, and in turn, better apply studies of diagnostic tests into their clinical practice.",
				"extra": "PMID: 31221671\nPMCID: PMC6693499",
				"issue": "8",
				"journalAbbreviation": "Emerg Med J",
				"language": "eng",
				"libraryCatalog": "PubMed",
				"pages": "501-505",
				"publicationTitle": "Emergency medicine journal: EMJ",
				"shortTitle": "Recognising bias in studies of diagnostic tests part 2",
				"volume": "36",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Diagnostic Tests, Routine"
					},
					{
						"tag": "Humans"
					},
					{
						"tag": "Observer Variation"
					},
					{
						"tag": "Research Design"
					},
					{
						"tag": "Sensitivity and Specificity"
					},
					{
						"tag": "imaging"
					},
					{
						"tag": "research, methods"
					},
					{
						"tag": "statistics"
					},
					{
						"tag": "ultrasound"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://pubmed.ncbi.nlm.nih.gov/32633716/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Muscle-derived Myoglianin regulates Drosophila imaginal disc growth",
				"creators": [
					{
						"firstName": "Ambuj",
						"lastName": "Upadhyay",
						"creatorType": "author"
					},
					{
						"firstName": "Aidan J.",
						"lastName": "Peterson",
						"creatorType": "author"
					},
					{
						"firstName": "Myung-Jun",
						"lastName": "Kim",
						"creatorType": "author"
					},
					{
						"firstName": "Michael B.",
						"lastName": "O'Connor",
						"creatorType": "author"
					}
				],
				"date": "2020-07-07",
				"DOI": "10.7554/eLife.51710",
				"ISSN": "2050-084X",
				"abstractNote": "Organ growth and size are finely tuned by intrinsic and extrinsic signaling molecules. In Drosophila, the BMP family member Dpp is produced in a limited set of imaginal disc cells and functions as a classic morphogen to regulate pattern and growth by diffusing throughout imaginal discs. However, the role of TGFβ/Activin-like ligands in disc growth control remains ill-defined. Here, we demonstrate that Myoglianin (Myo), an Activin family member, and a close homolog of mammalian Myostatin (Mstn), is a muscle-derived extrinsic factor that uses canonical dSmad2-mediated signaling to regulate wing size. We propose that Myo is a myokine that helps mediate an allometric relationship between muscles and their associated appendages.",
				"extra": "PMID: 32633716\nPMCID: PMC7371420",
				"journalAbbreviation": "Elife",
				"language": "eng",
				"libraryCatalog": "PubMed",
				"publicationTitle": "eLife",
				"volume": "9",
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "D. melanogaster"
					},
					{
						"tag": "Myoglianin"
					},
					{
						"tag": "Myostatin"
					},
					{
						"tag": "developmental biology"
					},
					{
						"tag": "growth factors"
					},
					{
						"tag": "imaginal disc"
					},
					{
						"tag": "muscle fiber"
					},
					{
						"tag": "tgf beta"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://pubmed.ncbi.nlm.nih.gov/searches/3851259/?startDate=2020-11-07+06%3A06%3A14&endDate=2020-12-05+06%3A04%3A39&token=1J3VmSOOIDc&sort=date",
		"items": "multiple"
	}
]
/** END TEST CASES **/
