{
	"translatorID": "d8873d23-d874-4b62-b081-1db12ff5a5de",
	"label": "ILO Labordoc",
	"creator": "Sebastian Karcher, Vesa Sivunen",
	"target": "^https?://labordoc\\.ilo\\.org",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-03-19 17:53:17"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

/*
	Translator for ILO Labordoc library catalogue (http://labordoc.ilo.org), running 
	Invenio (http://invenio-software.org/). Modified from Sebastian Karcher's original 
	version, parts of code from Simon Kornblith's and Sylvain Machefert's MARC translator.
*/


// detect items
function detectWeb(doc, url) {
   if (url.match(/\/search\?/)) return "multiple";
   else if (url.match(/\/record\//)) return "book";
}

function doWeb(doc, url) {
   if (detectWeb(doc, url) == "multiple") {
	  var articles = [];
	  var items = {};
	  var titles = doc.evaluate('//tr[contains(@class, "tablesearchresults")]/td/a[@class="detailsTitle"]', doc, null, XPathResult.ANY_TYPE, null);
	  var title;
	  while (title = titles.iterateNext()) {
		 items[title.href] = title.textContent;
	  }
	  Zotero.selectItems(items, function (items) {
		 if (!items) {
			return true;
		 }
		 for (var i in items) {
			articles.push(i.replace(/\?/, "/export/xm?"));
		 }
		 Zotero.Utilities.HTTP.doGet(articles, scrape);
		 });
	  } 
	  else {
		 Zotero.Utilities.HTTP.doGet(url.replace(/\?/, "/export/xm?"), scrape);
	  }
}

// get item content
function scrape(text) {
   var item = new Zotero.Item("book");
   var docxml = (new DOMParser()).parseFromString(text, "text/xml");
   ns = {"marc": "http://www.loc.gov/MARC21/slim"};
	
   // item type	 
   var marcType = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="996"]/marc:subfield[@code="a"]', ns));
   var ic1 = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="111"]/marc:subfield[@code="a"]', ns));
   var ic2 = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="655"]/marc:subfield[@code="a"]', ns));
   var gb1 = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="110"]/marc:subfield[@code="b"]', ns));
   var gb2 = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="710"]/marc:subfield[@code="a"]', ns));
   var gb3 = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="710"]/marc:subfield[@code="b"]', ns));
   var gb4 = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="711"]/marc:subfield[@code="a"]', ns));
   var wp1 = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="440"]/marc:subfield[@code="a"]', ns));
   var wp2 = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="490"]/marc:subfield[@code="a"]', ns));
   var t1 = 'conference';
   var t2 = 'Governing body';
   var t3 = 'International Labour Conference';
   var t4 = 'working paper';
   var t5 = 'document de travail';
   var t6 = 'documento de trabajo';
   var test_ic_gb = ic1 + ' ' + ic2 + ' ' + gb1 + ' ' + gb2 + ' ' + gb3 + ' ' + gb4; 
   var test_wp = wp1 + ' ' + wp2;

   if (marcType == "am") {   
	  if ((test_ic_gb.indexOf(t1) != -1) || (test_ic_gb.indexOf(t2) != -1) || (test_ic_gb.indexOf(t3) != -1)) { 
		 item.itemType = "conferencePaper"; 
	  } 
	  else if ((test_wp.indexOf(t4) != -1) || (test_wp.indexOf(t5) != -1) || (test_wp.indexOf(t6) != -1)) { 
		 item.itemType = "report"; 
	  } 
	  else { 
		 item.itemType = "book"; 
	  } 
   }  

   if ((marcType == "as") || (marcType == "aa")) {   
	  if ((test_ic_gb.indexOf(t1) != -1) || (test_ic_gb.indexOf(t2) != -1) || (test_ic_gb.indexOf(t3) != -1)) { 
		 item.itemType = "conferencePaper"; 
	  } 
	  else { 
		 item.itemType = "journalArticle"; 
	  } 
   }  

   if ((marcType == "gm") || (marcType == "mm")) {   
	  item.itemType = "computerProgram"; 
   } 

   if (marcType == "cm") {   
	  item.itemType = "artwork"; 
   } 	
	 
   // title	
   var title245a = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="245"]/marc:subfield[@code="a"]', ns));
   var title245b = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="245"]/marc:subfield[@code="b"]', ns));
   item.title = title245a + " " + title245b;
   item.title = cleanTitle(item.title);

   // creators & contributors	
   var author100a = ZU.xpath(docxml, '//marc:datafield[@tag="100"]/marc:subfield[@code="a"]', ns); 
   var author700a = ZU.xpath(docxml, '//marc:datafield[@tag="700"]/marc:subfield[@code="a"]', ns); 
   var creators = author100a.concat(author700a);
   var cauthor110a = ZU.xpath(docxml, '//marc:datafield[@tag="110"]/marc:subfield[@code="a"]', ns);
   var cauthor710a = ZU.xpath(docxml, '//marc:datafield[@tag="710"]/marc:subfield[@code="a"]', ns);
   var cauthor711a = ZU.xpath(docxml, '//marc:datafield[@tag="711"]/marc:subfield[@code="a"]', ns);	
   var contributors = cauthor110a.concat(cauthor710a,cauthor711a);
   
   // if no creators, use contributors as authors
   if (creators == '' && contributors) { 
	  creators = contributors;
	  contributors = null;
   }
   
   for (i in creators) {
	  if (creators[i]) {
		 var creator  = creators[i].textContent.split(/\s*;\s*/);
		 for (j in creator) {
			creator[j] = creator[j].replace(/\d{4}-(\d{4})?/g, '');
			item.creators.push(Zotero.Utilities.cleanAuthor(creator[j], "author", true));
		 }			
	  }
   }
				
   for (i in contributors) {
	  if (contributors[i]) {
		 var contributor = contributors[i].textContent.split(/\s*;\s*/);
		 for (j in contributor){
			contributor[j] = contributor[j].replace(/\d{4}-(\d{4})?/g, '');
			item.creators.push(Zotero.Utilities.cleanAuthor(contributor[j], "corpAuthor", true));
		 }			
	  }
   }
   
   // fix the corporate authors
   for (i in item.creators) {
	  if (!item.creators[i].firstName){
		 item.creators[i].fieldMode=1;
	  }
   }
	
   // remove dublicates	
   if ((item.creators[0]) && (item.creators[1])) {
	  if (item.creators[0].lastName == item.creators[1].lastName) {
		 if ((item.creators[0].lastName == "International Labour Organization") || (item.creators[0].lastName == "International Labour Office")) {
			item.creators.splice(1)
		 }
	  }
   } 

   // subjects   	
   var subject650a = ZU.xpath(docxml, '//marc:datafield[@tag="650"]/marc:subfield[@code="a"]', ns); 
   var subject655a = ZU.xpath(docxml, '//marc:datafield[@tag="655"]/marc:subfield[@code="a"]', ns); 
   var subjects = subject650a.concat(subject650a,subject655a);
   var i=0;
   
   while (subjects[i]) {
	  item.tags.push(subjects[i].textContent)
	  i++;
   }

  // isbn  
   var ISBN = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="020"]/marc:subfield[@code="a"]', ns));
   if (ISBN != '') {
	  item.ISBN = ISBN.replace(/ \(.*$/, '');
	  }
 
   // issn, check 440 also in labordoc  
   var ISSN = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="022"]/marc:subfield[@code="a"]', ns));
   if (ISSN != '') {
	  item.ISSN = ISSN.replace(/ \(.*$/, '');
   } 
   
   // pages 
   var pages = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="300"]/marc:subfield[@code="a"]', ns));
   if ((pages != '') && (pages.indexOf('p') != -1)) {
	  pages = pages.replace(/1 v/, "");
	  pages = pages.replace(/[A-Za-z,.: ]/g, "");
   }	
   if ((pages != '') && (item.itemType != "book")) {
   item.pages = pages;
   }
   if ((pages != '') && (item.itemType == "book")) {
   item.numPages = pages;
   }
   
   // place    
   var place = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="260"]/marc:subfield[@code="a"]', ns));
   if (place != '') {
	  place = place.replace(/ :$/, "");
	  place = place.replace(/ ;$/, "");
   }
   item.place = place;

   // series 
   var series = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="440"]/marc:subfield[@code="a"]', ns));
   if (series == '') {
	  series = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="490"]/marc:subfield[@code="a"]', ns));
   }
   if (series != '') {
	  series = series.replace(/ ;$/, "");
	  series = series.replace(/ ,$/, "");
	  series = series.replace(/;$/, "");
	  series = series.replace(/,$/, "");
   }
   item.series = series;
   
   // series no. 
   var seriesno = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="440"]/marc:subfield[@code="v"]', ns));
   if (seriesno == '') {
	  seriesno = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="490"]/marc:subfield[@code="v"]', ns));
   }
   item.seriesNumber = seriesno;
   
   // publication title
   var ptitle = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="773"]/marc:subfield[@code="t"]', ns));
   if (ptitle != '') {
	  ptitle = ptitle.replace(/.$/, "");
   }
   item.publicationTitle = ptitle;
   
   // edition
   var edition = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="250"]/marc:subfield[@code="a"]', ns));
   item.edition = edition;
   
   // call number
   var callno = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="099"]/marc:subfield[@code="a"]', ns));
   item.callNumber = callno;
   
   // year
   var year = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="997"]/marc:subfield[@code="a"]', ns));
   item.date = year;
   
   // language
   var language = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="998"]/marc:subfield[@code="a"]', ns));
   item.language = language;
   
   // abstract
   var abstract = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="520"]/marc:subfield[@code="a"]', ns));
   item.abstractNote = abstract;
   
   // volume number	
   var volumeno = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="773"]/marc:subfield[@code="g"]', ns));
   item.volume = volumeno;

   // some cleaning for ILO reports and conference papers  
   if ((item.series == 'Report') || (item.series == 'Rapport') || (item.series == 'Informe')) {
	  if (item.seriesNumber != '') {
		 item.series = item.series + ' ' + item.seriesNumber;
	  } 
   }
	
   if (item.itemType == "conferencePaper") { 
	  var cname111n = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="111"]/marc:subfield[@code="n"]', ns));
	  var cname111a = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="111"]/marc:subfield[@code="a"]', ns));
	  var cname111c = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="111"]/marc:subfield[@code="c"]', ns));
	  var cname111d = xpathFound(ZU.xpath(docxml, '//marc:datafield[@tag="111"]/marc:subfield[@code="d"]', ns));
	  item.conferenceName = cname111n + " " + cname111a + " " + cname111c + " " + cname111d;
	  if (item.conferenceName != '') {
		 item.conferenceName = item.conferenceName.replace(/\. /g, "\, ");
		 item.conferenceName = item.conferenceName.replace(/ : /g, " ");
		 item.conferenceName = item.conferenceName.replace(/ :$/, "");
		 item.conferenceName = item.conferenceName.replace(/\(|\)/g, "");
		 item.conferenceName = item.conferenceName.replace(/ Conference /, " Conference, ");
	  }
	}
	  
   // get PDF's
   var pdflink = ZU.xpath(docxml, '//marc:datafield[@tag="856"]/marc:subfield[contains(text(),".pdf")]/text()', ns);
   for (i in pdflink) {
	  item.attachments[i] = ({
	  url: pdflink[i].textContent,
	  title: "ILO Labordoc Full Text PDF",
	  mimeType: "application/pdf"
	  });
   }
				
   item.complete();

} 

// helper functions
function xpathFound(node) {
   if (node != '') {
	  node = node[0].textContent;
   }
   else {
	  node = '';
   } 
   return node;
}

function cleanTitle(value) {
   value = value.replace(/^[\s\.\,\/\:;]+/, '');
   value = value.replace(/[\s\.\,\/\:;]+$/, '');
   value = value.replace(/ +/g, ' ');
   value = value.replace(/ :/g, ':');
   value = value.replace(/\&\#x2019\;/g, "\'");
	 return value;
}



/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://labordoc.ilo.org/record/455088?ln=en",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "International Labour Office",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"notes": [],
				"tags": [
					"wages",
					"minimum wage",
					"employment",
					"unemployment",
					"household income",
					"labour productivity",
					"economic recession",
					"developed countries",
					"developing countries",
					"salaire",
					"salaire minimum",
					"emploi",
					"chômage",
					"revenu des ménages",
					"productivité du travail",
					"récession économique",
					"pays développés",
					"pays en développement",
					"salario",
					"salario mínimo",
					"empleo",
					"desempleo",
					"ingreso de los hogares",
					"productividad del trabajo",
					"recesión económica",
					"países desarrollados",
					"países en desarrollo",
					"wages",
					"minimum wage",
					"employment",
					"unemployment",
					"household income",
					"labour productivity",
					"economic recession",
					"developed countries",
					"developing countries",
					"salaire",
					"salaire minimum",
					"emploi",
					"chômage",
					"revenu des ménages",
					"productivité du travail",
					"récession économique",
					"pays développés",
					"pays en développement",
					"salario",
					"salario mínimo",
					"empleo",
					"desempleo",
					"ingreso de los hogares",
					"productividad del trabajo",
					"recesión económica",
					"países desarrollados",
					"países en desarrollo",
					"ILO pub",
					"pub OIT",
					"pub OIT"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ILO Labordoc Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Global wage report: 2012/13: wages and equitable growth",
				"ISBN": "9789221262367",
				"numPages": "110",
				"place": "Geneva",
				"callNumber": "09258(2012-13)",
				"date": "2012",
				"language": "eng",
				"libraryCatalog": "ILO Labordoc",
				"shortTitle": "Global wage report"
			}
		]
	}
]
/** END TEST CASES **/
