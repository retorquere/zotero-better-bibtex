{
	"translatorID": "e16095ae-986c-4117-9cb6-20f3b7a52f64",
	"label": "Protein Data Bank",
	"creator": "Michael Berkowitz, Sebastian Karcher",
	"target": "^https?://www\\.(pdb|rcsb)\\.org/pdb/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-11-24 00:25:43"
}

function detectWeb(doc, url) {
	if (doc.title.indexOf("Query Results") != -1) {
		return "multiple";
	} else if (url.indexOf("structureId") != -1) {
		return "journalArticle";
	}
}

function doWeb(doc, url) {
	var proteins = new Array();
	if (detectWeb(doc, url) == "multiple") {
		//search results
		var items = new Object();
		var xpath = '//a[@class="qrb_title"]';
		var titles = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
		var next_title;
		while (next_title = titles.iterateNext()) {
			items[next_title.href.match(/structureId=(.*)/)[1]] = next_title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				proteins.push(i);
			}
			scrape(proteins)
		})
	} else {
		scrape([url.match(/structureId=(.*)/)[1]]);
	}
}	
	
function scrape (proteins){
	for (var p in proteins) {
		var xmlstr = 'http://www.pdb.org/pdb/download/downloadFile.do?fileFormat=xml&headerOnly=YES&structureId=' + proteins[p];
		Zotero.debug(xmlstr);
		Zotero.Utilities.HTTP.doGet(xmlstr, function(text) {
			var item = new Zotero.Item("journalArticle");
			text = text.replace(/<!DOCTYPE[^>]*>/, "").replace(/<\?xml[^>]*\?>/, "").replace(/PDBx\:/g, "");
			var article = text.split('<citation id="primary">');
			var art = article[1].split(/<\/citation>\n/);
			art = "<citation>" + art[0] + "</citation>";
			var parser = new DOMParser();
			var xml = parser.parseFromString(art, "text/xml");
			var info = text.split('<database_PDB_revCategory>')[1].split('</database_PDB_revCategory>')[0].split('<database_PDB_rev num="2">')[0];
			var xml2 = parser.parseFromString(info, "text/xml");
			var aus = text.split('<citation_authorCategory>')[1].split('</citation_authorCategory>')[0];
			aus = "<authors>" + aus + "</authors>";
			var xml3 = parser.parseFromString(aus, "text/xml");
	
			item.title = ZU.xpathText(xml, '//title')
			item.publicationTitle = item.journalAbbreviation = ZU.xpathText(xml, '//journal_abbrev');
			item.volume = ZU.xpathText(xml, '//journal_volume'); 
			item.pages = ZU.xpathText(xml, '//page_first') + "-" + ZU.xpathText(xml, '//page_last');
			item.ISSN = ZU.xpathText(xml, '//journal_id_ISSN');
			item.extra = "PMID: " + ZU.xpathText(xml, '//pdbx_database_id_PubMed');
			item.DOI = ZU.xpathText(xml, '//pdbx_database_id_DOI');
			item.date = ZU.xpathText(xml2, '//date_original');
			item.url = 'http://www.pdb.org/pdb/explore/explore.do?structureId=' + proteins[p];
			var authors = ZU.xpath(xml3, '//citation_author[@citation_id="primary"]/@name');
			for (var i in authors) {
			item.creators.push(ZU.cleanAuthor(authors[i].textContent, "author", true));
			}
			item.attachments = [
				{url: item.url, title:"PDB Snapshot", mimeType:"text/html"},
				{url:'http://www.pdb.org/pdb/download/downloadFile.do?fileFormat=pdb&compression=NO&structureId=' + proteins[p], title:"Protein Data Bank .pdb File", mimeType:"chemical/x-pdb"}
			]
			item.complete(); 
		});
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.pdb.org/pdb/explore/explore.do?structureId=1COW",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "M. J.",
						"lastName": "van Raaij",
						"creatorType": "author"
					},
					{
						"firstName": "J. P.",
						"lastName": "Abrahams",
						"creatorType": "author"
					},
					{
						"firstName": "A. G.",
						"lastName": "Leslie",
						"creatorType": "author"
					},
					{
						"firstName": "J. E.",
						"lastName": "Walker",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "PDB Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Protein Data Bank .pdb File",
						"mimeType": "chemical/x-pdb"
					}
				],
				"title": "The structure of bovine F1-ATPase complexed with the antibiotic inhibitor aurovertin B.",
				"journalAbbreviation": "Proc.Natl.Acad.Sci.USA",
				"publicationTitle": "Proc.Natl.Acad.Sci.USA",
				"volume": "93",
				"pages": "6913-6917",
				"ISSN": "0027-8424",
				"extra": "PMID: 8692918",
				"DOI": "10.1073/pnas.93.14.6913",
				"date": "1996-05-08",
				"url": "http://www.pdb.org/pdb/explore/explore.do?structureId=1COW",
				"libraryCatalog": "Protein Data Bank",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.rcsb.org/pdb/explore/explore.do?structureId=1VHZ",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "J.",
						"lastName": "Badger",
						"creatorType": "author"
					},
					{
						"firstName": "J. M.",
						"lastName": "Sauder",
						"creatorType": "author"
					},
					{
						"firstName": "J. M.",
						"lastName": "Adams",
						"creatorType": "author"
					},
					{
						"firstName": "S.",
						"lastName": "Antonysamy",
						"creatorType": "author"
					},
					{
						"firstName": "K.",
						"lastName": "Bain",
						"creatorType": "author"
					},
					{
						"firstName": "M. G.",
						"lastName": "Bergseid",
						"creatorType": "author"
					},
					{
						"firstName": "S. G.",
						"lastName": "Buchanan",
						"creatorType": "author"
					},
					{
						"firstName": "M. D.",
						"lastName": "Buchanan",
						"creatorType": "author"
					},
					{
						"firstName": "Y.",
						"lastName": "Batiyenko",
						"creatorType": "author"
					},
					{
						"firstName": "J. A.",
						"lastName": "Christopher",
						"creatorType": "author"
					},
					{
						"firstName": "S.",
						"lastName": "Emtage",
						"creatorType": "author"
					},
					{
						"firstName": "A.",
						"lastName": "Eroshkina",
						"creatorType": "author"
					},
					{
						"firstName": "I.",
						"lastName": "Feil",
						"creatorType": "author"
					},
					{
						"firstName": "E. B.",
						"lastName": "Furlong",
						"creatorType": "author"
					},
					{
						"firstName": "K. S.",
						"lastName": "Gajiwala",
						"creatorType": "author"
					},
					{
						"firstName": "X.",
						"lastName": "Gao",
						"creatorType": "author"
					},
					{
						"firstName": "D.",
						"lastName": "He",
						"creatorType": "author"
					},
					{
						"firstName": "J.",
						"lastName": "Hendle",
						"creatorType": "author"
					},
					{
						"firstName": "A.",
						"lastName": "Huber",
						"creatorType": "author"
					},
					{
						"firstName": "K.",
						"lastName": "Hoda",
						"creatorType": "author"
					},
					{
						"firstName": "P.",
						"lastName": "Kearins",
						"creatorType": "author"
					},
					{
						"firstName": "C.",
						"lastName": "Kissinger",
						"creatorType": "author"
					},
					{
						"firstName": "B.",
						"lastName": "Laubert",
						"creatorType": "author"
					},
					{
						"firstName": "H. A.",
						"lastName": "Lewis",
						"creatorType": "author"
					},
					{
						"firstName": "J.",
						"lastName": "Lin",
						"creatorType": "author"
					},
					{
						"firstName": "K.",
						"lastName": "Loomis",
						"creatorType": "author"
					},
					{
						"firstName": "D.",
						"lastName": "Lorimer",
						"creatorType": "author"
					},
					{
						"firstName": "G.",
						"lastName": "Louie",
						"creatorType": "author"
					},
					{
						"firstName": "M.",
						"lastName": "Maletic",
						"creatorType": "author"
					},
					{
						"firstName": "C. D.",
						"lastName": "Marsh",
						"creatorType": "author"
					},
					{
						"firstName": "I.",
						"lastName": "Miller",
						"creatorType": "author"
					},
					{
						"firstName": "J.",
						"lastName": "Molinari",
						"creatorType": "author"
					},
					{
						"firstName": "H. J.",
						"lastName": "Muller-Dieckmann",
						"creatorType": "author"
					},
					{
						"firstName": "J. M.",
						"lastName": "Newman",
						"creatorType": "author"
					},
					{
						"firstName": "B. W.",
						"lastName": "Noland",
						"creatorType": "author"
					},
					{
						"firstName": "B.",
						"lastName": "Pagarigan",
						"creatorType": "author"
					},
					{
						"firstName": "F.",
						"lastName": "Park",
						"creatorType": "author"
					},
					{
						"firstName": "T. S.",
						"lastName": "Peat",
						"creatorType": "author"
					},
					{
						"firstName": "K. W.",
						"lastName": "Post",
						"creatorType": "author"
					},
					{
						"firstName": "S.",
						"lastName": "Radojicic",
						"creatorType": "author"
					},
					{
						"firstName": "A.",
						"lastName": "Ramos",
						"creatorType": "author"
					},
					{
						"firstName": "R.",
						"lastName": "Romero",
						"creatorType": "author"
					},
					{
						"firstName": "M. E.",
						"lastName": "Rutter",
						"creatorType": "author"
					},
					{
						"firstName": "W. E.",
						"lastName": "Sanderson",
						"creatorType": "author"
					},
					{
						"firstName": "K. D.",
						"lastName": "Schwinn",
						"creatorType": "author"
					},
					{
						"firstName": "J.",
						"lastName": "Tresser",
						"creatorType": "author"
					},
					{
						"firstName": "J.",
						"lastName": "Winhoven",
						"creatorType": "author"
					},
					{
						"firstName": "T. A.",
						"lastName": "Wright",
						"creatorType": "author"
					},
					{
						"firstName": "L.",
						"lastName": "Wu",
						"creatorType": "author"
					},
					{
						"firstName": "J.",
						"lastName": "Xu",
						"creatorType": "author"
					},
					{
						"firstName": "T. J.",
						"lastName": "Harris",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "PDB Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Protein Data Bank .pdb File",
						"mimeType": "chemical/x-pdb"
					}
				],
				"title": "Structural analysis of a set of proteins resulting from a bacterial genomics project",
				"journalAbbreviation": "Proteins",
				"publicationTitle": "Proteins",
				"volume": "60",
				"pages": "787-796",
				"ISSN": "0887-3585",
				"extra": "PMID: 16021622",
				"DOI": "10.1002/prot.20541",
				"date": "2003-12-01",
				"url": "http://www.pdb.org/pdb/explore/explore.do?structureId=1VHZ",
				"libraryCatalog": "Protein Data Bank",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/