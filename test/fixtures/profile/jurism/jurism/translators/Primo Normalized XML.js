{
	"translatorID": "efd737c9-a227-4113-866e-d57fbc0684ca",
	"label": "Primo Normalized XML",
	"creator": "Philipp Zumstein",
	"target": "xml",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"configOptions": {
		"dataMode": "xml/dom"
	},
	"inRepository": true,
	"translatorType": 1,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-02-05 07:13:43"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Philipp Zumstein
	
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


function detectImport() {
	var text = Zotero.read(1000);
	return text.includes("http://www.exlibrisgroup.com/xsd/primo/primo_nm_bib");
}


function doImport() {
	var doc = Zotero.getXML();
	var ns = {
		'p': 'http://www.exlibrisgroup.com/xsd/primo/primo_nm_bib',
		'sear': 'http://www.exlibrisgroup.com/xsd/jaguar/search'
	};
	
	var item = new Zotero.Item();
	var itemType = ZU.xpathText(doc, '//p:display/p:type', ns)  || ZU.xpathText(doc, '//p:facets/p:rsrctype', ns) || ZU.xpathText(doc, '//p:search/p:rsrctype', ns);
	if(!itemType) {
		throw new Error('Could not locate item type');
	}
	
	switch(itemType.toLowerCase()) {
		case 'book':
		case 'ebook':
		case 'pbook' :
		case 'books':
		case 'score':
		case 'journal':		//as long as we don't have a periodical item type;
 			item.itemType = "book";
			break;
		case 'audio':
		case 'sound_recording':
			item.itemType = "audioRecording";
			break;
		case 'video':
		case 'dvd':
			item.itemType = "videoRecording";
			break;
		case 'computer_file':
			item.itemType = "computerProgram";
			break;
		case 'report':
			item.itemType = "report";
			break;
		case 'webpage':
			item.itemType = "webpage";
			break;
		case 'article':
		case 'review':
			item.itemType = "journalArticle";
			break;
		case 'thesis':
		case 'dissertation':
			item.itemType = "thesis";
			break;
		case 'archive_manuscript':
		case 'object':
			item.itemType = "manuscript";
			break;
		case 'map':
			item.itemType = "map";
			break;
		case 'reference_entry':
			item.itemType = "encyclopediaArticle";
			break;
		case 'image':
			item.itemType = "artwork";
			break;
		case 'newspaper_article':
			item.itemType = "newspaperArticle";
			break;
		case 'conference_proceeding':
			item.itemType = "conferencePaper";
			break;
		default:
			item.itemType = "document";
			var risType = ZU.xpathText(doc, '//p:addata/p:ristype', ns);
			if (risType) {
				switch(risType.toUpperCase()) {
					case 'THES':
						item.itemType = "thesis";
						break;
				}
			}
	}
	
	item.title = ZU.xpathText(doc, '//p:display/p:title', ns);
	if(item.title) {
		item.title = ZU.unescapeHTML(item.title);
		item.title = item.title.replace(/\s*:/, ":");
	}
	var creators = ZU.xpath(doc, '//p:display/p:creator', ns);
	var contributors = ZU.xpath(doc, '//p:display/p:contributor', ns);
	if(!creators.length && contributors.length) {
		// <creator> not available using <contributor> as author instead
		creators = contributors;
		contributors = [];
	}
	
	// //addata/au is great because it lists authors in last, first format,
	// but it can also have a bunch of junk. We'll use it to help split authors
	var splitGuidance = {};
	var addau = ZU.xpath(doc, '//p:addata/p:addau|//p:addata/p:au', ns);
	for (var i=0; i<addau.length; i++) {
		var author = stripAuthor(addau[i].textContent);
		if (author.indexOf(',') != -1) {
			var splitAu = author.split(',');
			if (splitAu.length > 2) continue;
			var name = splitAu[1].trim().toLowerCase() + ' '
				+ splitAu[0].trim().toLowerCase();
			splitGuidance[name] = author;
		}
	}

	fetchCreators(item, creators, 'author', splitGuidance);
	fetchCreators(item, contributors, 'contributor', splitGuidance);

	item.place = ZU.xpathText(doc, '//p:addata/p:cop', ns);
	var publisher = ZU.xpathText(doc, '//p:addata/p:pub',ns);
	if(!publisher) publisher = ZU.xpathText(doc, '//p:display/p:publisher', ns);
	if(publisher) {
		publisher = publisher.replace(/,\s*c?\d+|[\(\)\[\]]|(\.\s*)?/g, "");
		item.publisher = publisher.replace(/^\s*"|,?"\s*$/g, '');
		var pubplace = ZU.unescapeHTML(publisher).split(" : ");

		if(pubplace && pubplace[1]) {
			var possibleplace = pubplace[0];
			if(!item.place ) {
				item.publisher = pubplace[1].replace(/^\s*"|,?"\s*$/g, '');
				item.place = possibleplace;
			}
			if(item.place && item.place == possibleplace) {
				item.publisher = pubplace[1].replace(/^\s*"|,?"\s*$/g, '');
			}
		}
	}
	var date = ZU.xpathText(doc, '//p:addata/p:date', ns) ||
		ZU.xpathText(doc, '//p:addata/p:risdate', ns);
	if (date && /\d\d\d\d\d\d\d\d/.test(date)) {
		item.date = date.substring(0,4)+'-'+date.substring(4,6)+'-'+date.substring(6,8);
	} else {
		date = ZU.xpathText(doc, '//p:display/p:creationdate|//p:search/p:creationdate', ns);
		var m;
		if(date && (m = date.match(/\d+/))) {
			item.date = m[0];
		}
	}
	
	// the three letter ISO codes that should be in the language field work well:
	item.language = ZU.xpathText(doc, '(//p:display/p:language|//p:facets/p:language)[1]', ns);
	
	var pages = ZU.xpathText(doc, '//p:display/p:format', ns);
	if(item.itemType == 'book' && pages && pages.search(/\d/) != -1) {
		item.numPages = extractNumPages(pages);
	}
	
	item.series = ZU.xpathText(doc, '(//p:addata/p:seriestitle)[1]', ns);

	var isbn = ZU.xpathText(doc, '//p:addata/p:isbn', ns);
	var issn = ZU.xpathText(doc, '//p:addata/p:issn', ns);
	if (isbn){
		item.ISBN = ZU.cleanISBN(isbn);
	}
	
	if (issn){
		item.ISSN = ZU.cleanISSN(issn);
	}
	
	// Try this if we can't find an isbn/issn in addata
	// The identifier field is supposed to have standardized format, but
	// the super-tolerant idCheck should be better than a regex.
	// (although note that it will reject invalid ISBNs)
	var locators = ZU.xpathText(doc, '//p:display/p:identifier', ns);
	if(!(item.ISBN || item.ISSN) && locators) {
		item.ISBN = ZU.cleanISBN(locators);
		item.ISSN = ZU.cleanISSN(locators);
	}

	item.edition = ZU.xpathText(doc, '//p:display/p:edition', ns);
	
	var subjects = ZU.xpath(doc, '//p:search/p:subject', ns);
	if(!subjects.length) {
		subjects = ZU.xpath(doc, '//p:display/p:subject', ns);
	}

	for(var i=0, n=subjects.length; i<n; i++) {
		item.tags.push(ZU.trimInternal(subjects[i].textContent));
	}
	
	item.abstractNote = ZU.xpathText(doc, '//p:display/p:description', ns)
		|| ZU.xpathText(doc, '//p:addata/p:abstract', ns);
	if (item.abstractNote) item.abstractNote = ZU.unescapeHTML(item.abstractNote);
	
	item.DOI = ZU.xpathText(doc, '//p:addata/p:doi', ns);
	item.issue = ZU.xpathText(doc, '//p:addata/p:issue', ns);
	item.volume = ZU.xpathText(doc, '//p:addata/p:volume', ns);
	item.publicationTitle = ZU.xpathText(doc, '//p:addata/p:jtitle', ns);
	
	var startPage = ZU.xpathText(doc, '//p:addata/p:spage', ns);
	var endPage = ZU.xpathText(doc, '//p:addata/p:epage', ns);
	var overallPages = ZU.xpathText(doc, '//p:addata/p:pages', ns);
	if (startPage && endPage){
		item.pages = startPage + '–' + endPage;
	} else if (overallPages) {
		item.pages = overallPages;
	} else if (startPage) {
		item.pages = startPage;
	} else if (endPage) {
		item.pages = endPage;
	}
	
	// these are actual local full text links (e.g. to google-scanned books)
	// e.g http://solo.bodleian.ox.ac.uk/OXVU1:LSCOP_OX:oxfaleph013370702
	var URL = ZU.xpathText(doc, '//p:links/p:linktorsrc', ns);
	if (URL && URL.search(/\$\$U.+\$\$/) != -1) {
		item.url = URL.match(/\$\$U(.+?)\$\$/)[1];
	}

	// add finding aids as links
	var findingAid = ZU.xpathText(doc, '//p:links/p:linktofa', ns);
	if (findingAid && findingAid.search(/\$\$U.+\$\$/) != -1) {
		item.attachments.push({url: findingAid.match(/\$\$U(.+?)\$\$/)[1], title: "Finding Aid", snapshot: false});
	}
	// get the best call Number; sequence recommended by Harvard University Library
	var callNumber = ZU.xpath(doc, '//p:browse/p:callnumber', ns);
	var callArray = [];
	for (var i = 0; i<callNumber.length; i++) {
		if (callNumber[i].textContent.search(/\$\$D.+\$/) != -1) {
			callArray.push(callNumber[i].textContent.match(/\$\$D(.+?)\$/)[1]);
		}
	}
	if (!callArray.length) {
		callNumber = ZU.xpath(doc, '//p:display/p:availlibrary', ns);
		for (var i = 0; i<callNumber.length; i++) {
			if (callNumber[i].textContent.search(/\$\$2.+\$/) != -1) {
				callArray.push(callNumber[i].textContent.match(/\$\$2\(?(.+?)(?:\s*\))?\$/)[1]);
			}
		}
	}
	if (callArray.length) {
		// remove duplicate call numbers
		callArray = dedupeArray(callArray);
		item.callNumber = callArray.join(", ");
	}
	else {
		ZU.xpathText(doc, '//p:enrichment/p:classificationlcc', ns);
	}

	// Harvard specific code, requested by Harvard Library:
	// Getting the library abbreviation properly,
	// so it's easy to implement custom code for other libraries, either locally or globally should we want to.
	var library;
	var source = ZU.xpathText(doc, '//p:control/p:sourceid', ns);
	if (source) {
		library = source.match(/^(.+?)_/);
		if (library) library = library[1];
	}
	// Z.debug(library)
	if (library && library == "HVD") {
		if (ZU.xpathText(doc, '//p:display/p:lds01', ns)) {
			item.extra = "HOLLIS number: " + ZU.xpathText(doc, '//p:display/p:lds01', ns);
		}
		if (ZU.xpathText(doc, '//p:display/p:lds03', ns)) {
			item.attachments.push({url: ZU.xpathText(doc, '//p:display/p:lds03', ns), title: "HOLLIS Permalink", snapshot: false});		
		}
	}
	// End Harvard-specific code
	item.complete();
}


function stripAuthor(str) {
	// e.g. Wheaton, Barbara Ketcham [former owner]$$QWheaton, Barbara Ketcham
	str = str.replace(/^(.*)\$\$Q(.*)$/, "$2");
	return str
		// Remove year
		.replace(/\s*,?\s*\(?\d{4}-?(\d{4})?\)?/g, '')
		// Remove things like (illustrator). TODO: use this to assign creator type?
		.replace(/\s*,?\s*[\[\(][^()]*[\]\)]$/, '')
		// The full "continuous" name uses no separators, which need be removed
		// cf. "Luc, Jean André : de (1727-1817)"
		.replace(/\s*:\s+/, " ");
}

function fetchCreators(item, creators, type, splitGuidance) {
	for(var i=0; i<creators.length; i++) {
		var creator = ZU.unescapeHTML(creators[i].textContent).split(/\s*;\s*/);
		for(var j=0; j<creator.length; j++) {
			var c = stripAuthor(creator[j]);
			c = ZU.cleanAuthor(
				splitGuidance[c.toLowerCase()] || c,
				type,
				true
			);
			
			if (!c.firstName) {
				delete c.firstName;
				c.fieldMode = 1;
			}
			
			item.creators.push(c);
		}
	}
}

function extractNumPages(str) {
	// Borrowed from Library Catalog (PICA). See #756
	// make sure things like 2 partition don't match, but 2 p at the end of the field do
	// f., p., and S. are "pages" in various languages
	// For multi-volume works, we expect formats like:
	//   x-109 p., 510 p. and X, 106 S.; 123 S.
	var numPagesRE = /\[?\b((?:[ivxlcdm\d]+[ ,\-]*)+)\]?\s+[fps]\b/ig;
	var numPages = [];
	if ((m = numPagesRE.exec(str))) {
		numPages.push(m[1].trim()
			.replace(/[ ,\-]+/g,'+')
			.toLowerCase() // for Roman numerals
		);
	}
	return numPages.join('; ');
}

function dedupeArray(names) {
	// via http://stackoverflow.com/a/15868720/1483360
	return names.reduce(function(a,b){
		if(a.indexOf(b)<0) {
			a.push(b);
		}
		return a;
	},[]);
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n         <record xmlns=\"http://www.exlibrisgroup.com/xsd/primo/primo_nm_bib\" xmlns:sear=\"http://www.exlibrisgroup.com/xsd/jaguar/search\">\n           <control>\n             <sourcerecordid>22248448</sourcerecordid>\n             <sourceid>medline</sourceid>\n             <recordid>TN_medline22248448</recordid>\n             <sourceformat>XML</sourceformat>\n             <sourcesystem>Other</sourcesystem>\n           </control>\n           <display>\n             <type>article</type>\n             <title>Water</title>\n             <creator>Bryant, Robert G ; Johnson, Mark A ; Rossky, Peter J</creator>\n             <ispartof>Accounts of chemical research, 17  January  2012, Vol.45(1), pp.1-2</ispartof>\n             <identifier><![CDATA[<b>E-ISSN:</b> 1520-4898 ; <b>PMID:</b> 22248448 Version:1 ; <b>DOI:</b> 10.1021/ar2003286]]></identifier>\n             <subject>Water -- Chemistry</subject>\n             <language>eng</language>\n             <source/>\n             <version>2</version>\n             <lds50>peer_reviewed</lds50>\n           </display>\n           <links>\n             <openurl>$$Topenurl_article</openurl>\n             <backlink>$$Uhttp://pubmed.gov/22248448$$EView_this_record_in_MEDLINE/PubMed</backlink>\n             <openurlfulltext>$$Topenurlfull_article</openurlfulltext>\n             <addlink>$$Uhttp://exlibris-pub.s3.amazonaws.com/aboutMedline.html$$EView_the_MEDLINE/PubMed_Copyright_Statement</addlink>\n           </links>\n           <search>\n             <creatorcontrib>Bryant, Robert G</creatorcontrib>\n             <creatorcontrib>Johnson, Mark A</creatorcontrib>\n             <creatorcontrib>Rossky, Peter J</creatorcontrib>\n             <title>Water.</title>\n             <subject>Water -- chemistry</subject>\n             <general>22248448</general>\n             <general>English</general>\n             <general>MEDLINE/PubMed (U.S. National Library of Medicine)</general>\n             <general>10.1021/ar2003286</general>\n             <general>MEDLINE/PubMed (NLM)</general>\n             <sourceid>medline</sourceid>\n             <recordid>medline22248448</recordid>\n             <issn>15204898</issn>\n             <issn>1520-4898</issn>\n             <rsrctype>text_resource</rsrctype>\n             <creationdate>2012</creationdate>\n             <addtitle>Accounts of chemical research</addtitle>\n             <searchscope>medline</searchscope>\n             <searchscope>nlm_medline</searchscope>\n             <searchscope>MEDLINE</searchscope>\n             <scope>medline</scope>\n             <scope>nlm_medline</scope>\n             <scope>MEDLINE</scope>\n             <lsr41>20120117</lsr41>\n             <citation>pf 1 vol 45 issue 1</citation>\n             <startdate>20120117</startdate>\n             <enddate>20120117</enddate>\n           </search>\n           <sort>\n             <title>Water</title>\n             <author>Bryant, Robert G ; Johnson, Mark A ; Rossky, Peter J</author>\n             <creationdate>20120117</creationdate>\n             <lso01>20120117</lso01>\n           </sort>\n           <facets>\n             <frbrgroupid>-1388435396316500619</frbrgroupid>\n             <frbrtype>5</frbrtype>\n             <newrecords>20180102</newrecords>\n             <language>eng</language>\n             <creationdate>2012</creationdate>\n             <topic>Water–Chemistry</topic>\n             <collection>MEDLINE/PubMed (NLM)</collection>\n             <rsrctype>text_resources</rsrctype>\n             <creatorcontrib>Bryant, Robert G</creatorcontrib>\n             <creatorcontrib>Johnson, Mark A</creatorcontrib>\n             <creatorcontrib>Rossky, Peter J</creatorcontrib>\n             <jtitle>Accounts Of Chemical Research</jtitle>\n             <toplevel>peer_reviewed</toplevel>\n           </facets>\n           <delivery>\n             <delcategory>Remote Search Resource</delcategory>\n             <fulltext>fulltext</fulltext>\n           </delivery>\n           <addata>\n             <aulast>Bryant</aulast>\n             <aulast>Johnson</aulast>\n             <aulast>Rossky</aulast>\n             <aufirst>Robert G</aufirst>\n             <aufirst>Mark A</aufirst>\n             <aufirst>Peter J</aufirst>\n             <au>Bryant, Robert G</au>\n             <au>Johnson, Mark A</au>\n             <au>Rossky, Peter J</au>\n             <btitle>Water</btitle>\n             <atitle>Water.</atitle>\n             <jtitle>Accounts of chemical research</jtitle>\n             <date>20120117</date>\n             <risdate>20120117</risdate>\n             <volume>45</volume>\n             <issue>1</issue>\n             <spage>1</spage>\n             <pages>1-2</pages>\n             <eissn>1520-4898</eissn>\n             <format>book</format>\n             <genre>document</genre>\n             <ristype>GEN</ristype>\n             <doi>10.1021/ar2003286</doi>\n             <pmid>22248448</pmid>\n           </addata>\n         </record>",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Water",
				"creators": [
					{
						"firstName": "Robert G.",
						"lastName": "Bryant",
						"creatorType": "author"
					},
					{
						"firstName": "Mark A.",
						"lastName": "Johnson",
						"creatorType": "author"
					},
					{
						"firstName": "Peter J.",
						"lastName": "Rossky",
						"creatorType": "author"
					}
				],
				"date": "2012-01-17",
				"DOI": "10.1021/ar2003286",
				"ISSN": "1520-4898",
				"issue": "1",
				"language": "eng",
				"pages": "1-2",
				"publicationTitle": "Accounts of chemical research",
				"volume": "45",
				"attachments": [],
				"tags": [
					{
						"tag": "Water -- chemistry"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><record xmlns=\"http://www.exlibrisgroup.com/xsd/primo/primo_nm_bib\" xmlns:sear=\"http://www.exlibrisgroup.com/xsd/jaguar/search\">\n           <control>\n             <sourcerecordid>002208563</sourcerecordid>\n             <sourceid>HVD_ALEPH</sourceid>\n             <recordid>HVD_ALEPH002208563</recordid>\n             <originalsourceid>HVD01</originalsourceid>\n             <ilsapiid>HVD01002208563</ilsapiid>\n             <sourceformat>MARC21</sourceformat>\n             <sourcesystem>Aleph</sourcesystem>\n           </control>\n           <display>\n             <type>book</type>\n             <title>Mastering the art of French cooking</title>\n             <creator>Beck, Simone, 1904-1991. $$QBeck, Simone, 1904-1991.</creator>\n             <contributor>Bertholle, Louisette.$$QBertholle, Louisette.</contributor>\n             <contributor>Child, Julia.$$QChild, Julia.</contributor>\n             <contributor>Wheaton, Barbara Ketcham [former owner]$$QWheaton, Barbara Ketcham</contributor>\n             <contributor>DeVoto, Avis [former owner]$$QDeVoto, Avis</contributor>\n             <edition>[1st ed.]</edition>\n             <publisher>New York : Knopf, 1961-70.</publisher>\n             <creationdate>1961-70</creationdate>\n             <format>2 v. : ill. ; 26 cm.</format>\n             <subject>Cooking, French.</subject>\n             <description>Illustrates the ways in which classic French dishes may be created with American foodstuffs and appliances.</description>\n             <language>eng</language>\n             <source>HVD_ALEPH</source>\n             <availlibrary>$$IHVD$$LHVD_SCH$$1Offsite Storage -- In-library use only$$2641.64 C53m, c.1$$Savailable$$32$$40$$5Y$$60$$XHVD50$$YSCH$$ZHD$$P78$$HHVD60003115849</availlibrary>\n             <availlibrary>$$IHVD$$LHVD_SCH$$1Offsite Storage -- In-library use only$$2641.64 C53m, c. 3$$Savailable$$32$$40$$5Y$$61$$XHVD50$$YSCH$$ZHD$$P78$$HHVD60018187101</availlibrary>\n             <availlibrary>$$IHVD$$LHVD_SCH$$1Offsite Storage -- In-library use only$$2641.64 C53m, c.5$$Savailable$$32$$40$$5Y$$60$$XHVD50$$YSCH$$ZHD$$P78$$HHVD60018770891</availlibrary>\n             <availlibrary>$$IHVD$$LHVD_SCH$$1Offsite Storage -- In-library use only$$2641.64 C53m, c.6$$Savailable$$31$$40$$5Y$$60$$XHVD50$$YSCH$$ZHD$$P78$$HHVD60019421606</availlibrary>\n             <availlibrary>$$IHVD$$LHVD_SCH$$1Offsite Storage -- In-library use only$$2641.64 C53m, c. 7$$Savailable$$32$$40$$5N$$60$$XHVD50$$YSCH$$ZHD$$P78$$HHVD60019730367</availlibrary>\n             <availlibrary>$$IHVD$$LHVD_SCH$$1Offsite Storage -- In-library use only$$2641.64 C53m, c. 8$$Savailable$$31$$40$$5Y$$60$$XHVD50$$YSCH$$ZHD$$P78$$HHVD60019730395</availlibrary>\n             <availlibrary>$$IHVD$$LHVD_SCH$$1Offsite Storage -- In-library use only$$2641.64 C53m, c.2$$Savailable$$31$$40$$5Y$$60$$XHVD50$$YSCH$$ZHD$$P78$$HHVD60016438903</availlibrary>\n             <availlibrary>$$IHVD$$LHVD_SCH$$1Vault$$2641.64 C53m, c.4$$Savailable$$31$$40$$5N$$60$$XHVD50$$YSCH$$ZVAULT$$P78$$HHVD60018653989</availlibrary>\n             <lds01>002208563</lds01>\n             <lds02>567511</lds02>\n             <lds03>&lt;a href=\"http://id.lib.harvard.edu/aleph/002208563/catalog\">http://id.lib.harvard.edu/aleph/002208563/catalog&lt;/a></lds03>\n             <lds05>Knopf</lds05>\n             <lds06>Vol. 1. Kitchen equipment -- Definitions -- Ingredients -- Measures -- Temperatures -- Cutting : chopping, slicing, dicing, and mincing -- Wines -- Soups -- Sauces -- Eggs -- Entrees and luncheon dishes -- Fish -- Poultry -- Meat -- Vegetables -- Cold buffet -- Desserts and cakes -- Vol. 2. Soups from the garden -- bisques and chowders from the sea -- Baking : breads, brioches, croissants, and pastries -- Meats : from country kitchen to haute cuisine -- Chickens, poached and sauced -- and a coq en pâte -- Charcuterie : sausages, salted pork and goose, pâtés and terrines -- A choice of vegetables -- Desserts :extending the repertoire -- Appendices : Stuffings -- Kitchen equipment -- Cuculative index for volumes one and two.</lds06>\n             <lds13>Vol. 2 by Julia Child and Simone Beck.</lds13>\n             <lds14>by Simone Beck, Louisette Bertholle [and] Julia Child.</lds14>\n             <lds30>c. 3, 4, 5, 7, 8: -- Authors' inscriptions (Provenance)$$Qc. 3, 4, 5, 7, 8: Authors' inscriptions (Provenance)</lds30>\n             <lds30>Cookbooks.$$QCookbooks.</lds30>\n             <availinstitution>$$IHVD$$Savailable</availinstitution>\n             <availpnx>available</availpnx>\n           </display>\n           <links>\n             <openurl>$$Topenurl_journal</openurl>\n             <backlink>$$Taleph_backlink$$Ebacklink</backlink>\n             <thumbnail>$$Tgoogle_thumb</thumbnail>\n             <openurlfulltext>$$Topenurlfull_journal</openurlfulltext>\n             <linktoholdings>$$Taleph_holdings</linktoholdings>\n             <linktouc>$$Tworldcat_oclc$$Eworldcat</linktouc>\n           </links>\n           <search>\n             <creatorcontrib>Simone,  Beck  1904-1991.</creatorcontrib>\n             <creatorcontrib>Simca,  1904-1991</creatorcontrib>\n             <creatorcontrib>Beck, Simone, 1904-1991.</creatorcontrib>\n             <creatorcontrib>Simca, 1904-1991</creatorcontrib>\n             <creatorcontrib>Beck, S</creatorcontrib>\n             <creatorcontrib>Simca</creatorcontrib>\n             <creatorcontrib>by Simone Beck, Louisette Bertholle [and] Julia Child.</creatorcontrib>\n             <creatorcontrib>Louisette.  Bertholle</creatorcontrib>\n             <creatorcontrib>Julia.  Child</creatorcontrib>\n             <creatorcontrib>Barbara Ketcham,  Wheaton  former owner.</creatorcontrib>\n             <creatorcontrib>Avis,  DeVoto  former owner.</creatorcontrib>\n             <creatorcontrib>Julia Carolyn  McWilliams</creatorcontrib>\n             <creatorcontrib>Avis  De Voto</creatorcontrib>\n             <creatorcontrib>Avis de  Voto</creatorcontrib>\n             <creatorcontrib>Avis MacVicar  DeVoto</creatorcontrib>\n             <creatorcontrib>Bertholle, Louisette.</creatorcontrib>\n             <creatorcontrib>Child, Julia.</creatorcontrib>\n             <creatorcontrib>Wheaton, Barbara Ketcham, former owner.</creatorcontrib>\n             <creatorcontrib>DeVoto, Avis, former owner.</creatorcontrib>\n             <creatorcontrib>McWilliams, Julia Carolyn</creatorcontrib>\n             <creatorcontrib>De Voto, Avis</creatorcontrib>\n             <creatorcontrib>Voto, Avis de</creatorcontrib>\n             <creatorcontrib>DeVoto, Avis MacVicar</creatorcontrib>\n             <creatorcontrib>Bertholle, L</creatorcontrib>\n             <creatorcontrib>Child, J</creatorcontrib>\n             <creatorcontrib>Wheaton, B</creatorcontrib>\n             <creatorcontrib>DeVoto, A</creatorcontrib>\n             <creatorcontrib>McWilliams, J</creatorcontrib>\n             <creatorcontrib>De Voto, A</creatorcontrib>\n             <creatorcontrib>Voto, A</creatorcontrib>\n             <title>Mastering the art of French cooking /</title>\n             <description>Illustrates the ways in which classic French dishes may be created with American foodstuffs and appliances.</description>\n             <subject>Cooking, French.</subject>\n             <subject>Cookery, French</subject>\n             <subject>French cooking</subject>\n             <subject>Authors' inscriptions (Provenance)</subject>\n             <subject>Cookbooks.</subject>\n             <general>61012313</general>\n             <general>Vol. 2 by Julia Child and Simone Beck.</general>\n             <general>Bookplate of Denise K. Schorr.</general>\n             <general>From the collection of Barbara Ketcham Wheaton; with armorial Wheaton bookplate.</general>\n             <general>Authors' inscriptions on half title: Pour Barbara Wheaton avec amité et très grands compliments pour le resultat, L. Bertholle-Rémiôn; Si heureuse d'avoir pu instruire la charmante Barbara; Avec tous mes souvenirs et mon affection, Simone Beck; Twenty five years!-with love to our own Cul. Historian Supreme-Barbara Wheaton. Julia Child.</general>\n             <general>From the collection of Ruth Lockwood.</general>\n             <general>Author's inscription on half title: For Ruth Lockwood, We have always had such fun together, and our meeting of minds is not only gastronomical. With love, Julia Child, Cambridge, November 16, 1962.</general>\n             <general>Author's inscription on front free endpaper: To Ruth J. Lockwood, P.F.C. Mirror, mirror on the wall/Who's most Ruthless of them all?/'Tis we are Ruthless, we who miss/The wisdom, heart--and even bliss--/Of having Ruthie (Chrysalis/From out of which the butterfly/Of genius grows) beside us. Aye!/'Tis we who miss belovéd Ruth/ Who Ruthless are, and so, forsooth,/We send this token of ourselves/To sit on tables, chairs, or shelves,/Reminder in the weeks ahead/To think of us, not just of bread,/Not just of fish, or meat, or spice,/Nor watercress, or lemon ice,/Not just chicken fricasee--/But think of J. and think of P. Cambridge, April 5, 1971. Paul Julia [Child].</general>\n             <general>Authors' inscription on half title: To Avis [DeVoto], Pen Pal and Co-Author--Julia. First inscribed copy, Cambridge, Massachusetts, September 26, 1961; To my so dearest chérie Avis, avec toute ma profonde affection. Simone Beck.</general>\n             <general>Authors' inscription on half title: Comme c'est merveilleux de retrouver ma soeur femelle Avis, pour le baptême de notre second enfant--si bienvenu au monde et avec l'espoir qu'il grandira dans les années à venir. Avec infiniment d'affection. Simone Beck. The second child! happily with the same Auntie Avis, still sheltering, advising, hand holding, scolding...thank god...this is our inscription of thanks from her niece and nephew, Julia and Paul.</general>\n             <general>Printed label pasted onto front free endpaper: The French Chef, WGBH-TV, Channel 2, Boston; inscription on label: Best wishes and Bon Appétit! Julia Child.</general>\n             <general>Author's inscription on half title: To Avis--with love. Final version with every known fixable thing fixed--Julia.</general>\n             <general>Eighth printing, December 1964.</general>\n             <general>Third printing, December 1970.</general>\n             <general>1st printing.</general>\n             <general>Author's inscription: A ma soeur en cuisine-vive l'art culinaire francaises aux USA! Julia Child, Cambridge, 31/7-62.</general>\n             <general>Author's inscription: À notre très chère colleague et amie, Denise Schorr. Julia Child.</general>\n             <general>2nd printing, Nov. 1962.</general>\n             <general>Occasionl manuscript corrections in Julia Child's hand throughout.</general>\n             <general>Corrections in DeVoto's hand throughout, partial index to corrections on back free endpaper; clippings laid in at pages 190/191 and 240/241 and manuscript recipes for herbed butters laid in at pages 102/103, removed and housed with volume.</general>\n             <general>Occasional marks and corrections in DeVoto's throughout.</general>\n             <general>Auctioneer's bookmark removed to Inserted material collection, call number MC 782.</general>\n             <general>Twelfth printing, August 1966.</general>\n             <general>24th printing, November 1973 ; new plates first used October, 1971 ; Child and Beck's positions have been reversed in these printings.</general>\n             <general>Bound in original white cloth; in dust jacket as issued.</general>\n             <general>Dust jacket preserved.</general>\n             <general>Publisher's decorative oil cloth.</general>\n             <general>Bound in original decorated boards; text block upside down.</general>\n             <general>Bound in original decorated cloth; v.2 in dust jacket, as issued.</general>\n             <general>Bound in original decorated cloth.</general>\n             <general>Illustrates the ways in which classic French dishes may be created with American foodstuffs and appliances.</general>\n             <sourceid>HVD_ALEPH</sourceid>\n             <recordid>HVD_ALEPH002208563</recordid>\n             <toc>Vol. 1. Kitchen equipment -- Definitions -- Ingredients -- Measures -- Temperatures -- Cutting : chopping, slicing, dicing, and mincing -- Wines -- Soups -- Sauces -- Eggs -- Entrees and luncheon dishes -- Fish -- Poultry -- Meat -- Vegetables -- Cold buffet -- Desserts and cakes -- Vol. 2. Soups from the garden -- bisques and chowders from the sea -- Baking : breads, brioches, croissants, and pastries -- Meats : from country kitchen to haute cuisine -- Chickens, poached and sauced -- and a coq en pâte -- Charcuterie : sausages, salted pork and goose, pâtés and terrines -- A choice of vegetables -- Desserts :extending the repertoire -- Appendices : Stuffings -- Kitchen equipment -- Cuculative index for volumes one and two.</toc>\n             <rsrctype>book</rsrctype>\n             <creationdate>1961</creationdate>\n             <creationdate>1970</creationdate>\n             <startdate>19610101</startdate>\n             <enddate>19701231</enddate>\n             <addtitle>Mastering the art of French cooking.</addtitle>\n             <addtitle>Vol. 1. Kitchen equipment -- Definitions -- Ingredients -- Measures -- Temperatures -- Cutting : chopping, slicing, dicing, and mincing -- Wines -- Soups -- Sauces -- Eggs -- Entrees and luncheon dishes -- Fish -- Poultry -- Meat -- Vegetables -- Cold buffet -- Desserts and cakes -- Vol. 2. Soups from the garden -- bisques and chowders from the sea -- Baking : breads, brioches, croissants, and pastries -- Meats : from country kitchen to haute cuisine -- Chickens, poached and sauced -- and a coq en pâte -- Charcuterie : sausages, salted pork and goose, pâtés and terrines -- A choice of vegetables -- Desserts :extending the repertoire -- Appendices : Stuffings -- Kitchen equipment -- Cuculative index for volumes one and two.</addtitle>\n             <searchscope>HVD_ALEPH</searchscope>\n             <searchscope>HVD_SCH</searchscope>\n             <searchscope>HVD</searchscope>\n             <scope>HVD_ALEPH</scope>\n             <scope>HVD_SCH</scope>\n             <scope>HVD</scope>\n             <lsr01>002208563</lsr01>\n             <lsr01>2208563</lsr01>\n             <lsr02>567511</lsr02>\n             <lsr04>Knopf,</lsr04>\n             <lsr05>New York :</lsr05>\n             <lsr30>Authors' inscriptions (Provenance)</lsr30>\n             <lsr30>Cookbooks.</lsr30>\n             <lsr40>eng</lsr40>\n             <lsr41>SCHHD</lsr41>\n             <lsr41>SCHVAULT</lsr41>\n             <lsr42>nyu</lsr42>\n           </search>\n           <sort>\n             <title>Mastering the art of French cooking /</title>\n             <creationdate>1961</creationdate>\n             <author>Beck, Simone, 1904-1991.</author>\n             <lso01>1961</lso01>\n           </sort>\n           <facets>\n             <language>eng</language>\n             <creationdate>1961</creationdate>\n             <topic>Cooking, French</topic>\n             <collection>Harvard ILS</collection>\n             <toplevel>available</toplevel>\n             <toplevel>available_onsite</toplevel>\n             <prefilter>books</prefilter>\n             <rsrctype>books</rsrctype>\n             <creatorcontrib>Beck, Simone, 1904-1991</creatorcontrib>\n             <creatorcontrib>Bertholle, Louisette</creatorcontrib>\n             <creatorcontrib>Child, Julia</creatorcontrib>\n             <creatorcontrib>Wheaton, Barbara Ketcham</creatorcontrib>\n             <creatorcontrib>DeVoto, Avis</creatorcontrib>\n             <genre>Authors' inscriptions (Provenance)</genre>\n             <genre>Cookbooks</genre>\n             <library>HVD_SCH</library>\n             <classificationlcc>T - Technology .–Home economics–Cookery</classificationlcc>\n             <newrecords>20140704_558</newrecords>\n             <frbrgroupid>154092483</frbrgroupid>\n             <frbrtype>6</frbrtype>\n           </facets>\n           <dedup>\n             <t>1</t>\n             <c5>002208563</c5>\n             <f20>002208563</f20>\n           </dedup>\n           <frbr>\n             <t>1</t>\n             <k1>$$Kbeck simone 1904 1991$$AA</k1>\n             <k3>$$Kmastering the art of french cooking$$AT</k3>\n           </frbr>\n           <delivery>\n             <institution>HVD</institution>\n             <delcategory>Physical Item</delcategory>\n           </delivery>\n           <enrichment>\n             <classificationlcc>TX719</classificationlcc>\n           </enrichment>\n           <ranking>\n             <booster1>1</booster1>\n             <booster2>1</booster2>\n           </ranking>\n           <addata>\n             <aulast>Beck</aulast>\n             <aufirst>Simone,</aufirst>\n             <au>Beck, Simone</au>\n             <addau>Bertholle, Louisette</addau>\n             <addau>Child, Julia</addau>\n             <addau>Wheaton, Barbara Ketcham</addau>\n             <addau>DeVoto, Avis</addau>\n             <btitle>Mastering the art of French cooking</btitle>\n             <date>1961</date>\n             <risdate>1961</risdate>\n             <format>book</format>\n             <genre>book</genre>\n             <ristype>BOOK</ristype>\n             <abstract>Illustrates the ways in which classic French dishes may be created with American foodstuffs and appliances.</abstract>\n             <cop>New York</cop>\n             <pub>Knopf</pub>\n             <oclcid>567511</oclcid>\n           </addata>\n           <browse>\n             <author>$$DBeck, Simone, 1904-1991$$EBeck, Simone, 1904-1991$$IHVD10000331329$$PY</author>\n             <author>$$DSimca, 1904-1991$$ESimca, 1904-1991$$IHVD10000331329$$PN</author>\n             <author>$$DBertholle, Louisette$$EBertholle, Louisette$$IHVD10002219894$$PY</author>\n             <author>$$DChild, Julia$$EChild, Julia$$IHVD10000337040$$PY</author>\n             <author>$$DWheaton, Barbara Ketcham$$EWheaton, Barbara Ketcham$$IHVD10002222513$$PY</author>\n             <author>$$DDeVoto, Avis$$EDeVoto, Avis$$IHVD10002387803$$PY</author>\n             <author>$$DMcWilliams, Julia Carolyn$$EMcWilliams, Julia Carolyn$$IHVD10000337040$$PN</author>\n             <author>$$DDe Voto, Avis$$EDe Voto, Avis$$IHVD10002387803$$PN</author>\n             <author>$$DVoto, Avis de$$EVoto, Avis de$$IHVD10002387803$$PN</author>\n             <author>$$DDeVoto, Avis MacVicar$$EDeVoto, Avis MacVicar$$IHVD10002387803$$PN</author>\n             <title>$$DMastering the art of French cooking$$EMastering the art of French cooking</title>\n             <subject>$$DCooking, French$$ECooking, French$$IHVD10000082473$$PY</subject>\n             <subject>$$DCookery, French$$ECookery, French$$IHVD10000082473$$PN</subject>\n             <subject>$$DFrench cooking$$EFrench cooking$$IHVD10000082473$$PN</subject>\n             <callnumber>$$IHVD$$D641.64 C53m, c.1$$E000000000641.064000000000 c000000000053m, c.000000000001$$T1</callnumber>\n             <callnumber>$$IHVD$$D641.64 C53m, c. 3$$E000000000641.064000000000 c000000000053m, c. 000000000003$$T1</callnumber>\n             <callnumber>$$IHVD$$D641.64 C53m, c.4$$E000000000641.064000000000 c000000000053m, c.000000000004$$T1</callnumber>\n             <callnumber>$$IHVD$$D641.64 C53m, c.5$$E000000000641.064000000000 c000000000053m, c.000000000005$$T1</callnumber>\n             <callnumber>$$IHVD$$D641.64 C53m, c.6$$E000000000641.064000000000 c000000000053m, c.000000000006$$T1</callnumber>\n             <callnumber>$$IHVD$$D641.64 C53m, c. 7$$E000000000641.064000000000 c000000000053m, c. 000000000007$$T1</callnumber>\n             <callnumber>$$IHVD$$D641.64 C53m, c. 8$$E000000000641.064000000000 c000000000053m, c. 000000000008$$T1</callnumber>\n             <callnumber>$$IHVD$$D641.64 C53m, c.2$$E000000000641.064000000000 c000000000053m, c.000000000002$$T1</callnumber>\n             <institution>HVD</institution>\n           </browse>\n         </record>",
		"items": [
			{
				"itemType": "book",
				"title": "Mastering the art of French cooking",
				"creators": [
					{
						"firstName": "Simone",
						"lastName": "Beck",
						"creatorType": "author"
					},
					{
						"firstName": "Louisette",
						"lastName": "Bertholle",
						"creatorType": "contributor"
					},
					{
						"firstName": "Julia",
						"lastName": "Child",
						"creatorType": "contributor"
					},
					{
						"firstName": "Barbara Ketcham",
						"lastName": "Wheaton",
						"creatorType": "contributor"
					},
					{
						"firstName": "Avis",
						"lastName": "DeVoto",
						"creatorType": "contributor"
					}
				],
				"date": "1961",
				"abstractNote": "Illustrates the ways in which classic French dishes may be created with American foodstuffs and appliances.",
				"callNumber": "641.64 C53m, c.1, 641.64 C53m, c. 3, 641.64 C53m, c.4, 641.64 C53m, c.5, 641.64 C53m, c.6, 641.64 C53m, c. 7, 641.64 C53m, c. 8, 641.64 C53m, c.2",
				"edition": "[1st ed.]",
				"extra": "HOLLIS number: 002208563",
				"language": "eng",
				"place": "New York",
				"publisher": "Knopf",
				"attachments": [
					{
						"title": "HOLLIS Permalink",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Authors' inscriptions (Provenance)"
					},
					{
						"tag": "Cookbooks."
					},
					{
						"tag": "Cookery, French"
					},
					{
						"tag": "Cooking, French."
					},
					{
						"tag": "French cooking"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
