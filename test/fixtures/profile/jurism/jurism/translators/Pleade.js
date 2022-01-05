{
	"translatorID": "ce68b0ed-3137-4e38-b691-f3bc49bc1497",
	"label": "Pleade",
	"creator": "DIA Modou",
	"target": "(list-results|results|ead)\\.html\\?.*(base=ead|mode=|id=)",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2015-01-30 15:32:05"
}

/*
Pleade: Publishing Tool for finding, authority records
and a series of digitized images.
Copyright (C) 2003-2011 AJLSM

AJLSM
17, rue Vital Carles
33000 Bordeaux, France
info@ajlsm.com

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the
Free Software Foundation, Inc.
59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
or connect to:
http://www.fsf.org/copyleft/gpl.html
*/

/* Example URLs:
 - http://jubilotheque.upmc.fr/results.html?base=ead&champ1=fulltext&op1=AND&search_type=simple&query1=pau&ssearch-submit-npt.x=0&ssearch-submit-npt.y=0
 - http://jubilotheque.upmc.fr/ead.html?id=BG_000007_002#!{%22content%22:[%22BG_000007_002_e0000002%22,true,%22%22]}
 - http://jubilotheque.upmc.fr/list-results.html?mode=subset&champ1=subsetall&query1=physique&cop1=AND
 */

/**
 * Function provided by zotero. It permit to detect web page which are compatible with this translator
 */
function detectWeb(doc, url) {
	if (url.match("id=") && url.match("ead.html")) {
		return "book";
	}
	else if (url.match("base=ead") && url.match("results.html")) {
		return "multiple";
	}
/** //The original method this used to work with - by getting a qId from the search page - doesn't work anymore. 
 //It's probably possible to fix this otherwise, but I'm not sure if that'd work across pleade implementations
	else if (url.match("list-results.html") && url.match("mode=")) {
		return "multiple";	
	} */
}

/**
 * Function find-replace
 * @param expr : string to check
 * @param a : string to find
 * @param b : string to use for replacing @a
 */
function Remplace(expr,a,b) {
	var i=0;
	while (i!=-1) {
		i=expr.indexOf(a,i);
		if (i>=0) {
			expr=expr.substring(0,i)+b+expr.substring(i+a.length);
			i+=b.length;
		}
	}
	return expr;
}

/**
 * Get an author from Pleade and decide if it can be published in zotero or not.
 * This function permit to resolv lot of bug in zotero beacuse  some "string author"
 * in pleade was not normalized.
 * @param newItem : zotero variable which contain field to publish
 * @param author :  "string author"
 * @param managed : this field is provided by Pleade and permit to now if the @author is normalized
 */
 
 //We're currrently not using this - leaving this here in case problems come up
function getAuthors(newItem, author, managed) {
	if (managed=="true") newItem.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));
}

/**
 * This function take raw data from pleade and it extract field "Tags" for zotero
 * @param newItem : zotero variable which contain field to publish
 * @param book :  raw data; actualy a xml tree
 */
function getTag(newItem, book) {
	var Tags = new Array();
	
	for (var i=0; i<book.subject.length(); i++) {
		Tags.push(Zotero.Utilities.superCleanString(book.subject[i].text().toString()));
	}

	newItem.abstractNote = Tags;
}

/**
* If a web web page that describe book is matched, this function call Pleade for getting metadatas. And then
* it scrape them to zotero.
* @param url : the url to give to pleade for getting metadatas.
*/
function scrape(url) {

	// Debug mode
	Zotero.debug("Getting a term :  "  + url);
	Zotero.Utilities.HTTP.doGet(url, function(text) {

		text = text.replace(/<!DOCTYPE[^>]*>/, "").replace(/<\?xml[^>]*\?>/, "");
		text = text.replace(/(<[^!>][^>]*>)/g, function replacer(str, p1, p2, offset, s) {return str.replace(/-/gm, "");});
		text = text.replace(/(<[^!>][^>]*>)/g, function replacer(str, p1, p2, offset, s) {return str.replace(/:/gm, "");});
		text = Zotero.Utilities.trim(text);
		//Z.debug(text)
		var parser = new DOMParser();
		var doc = parser.parseFromString(text, "text/xml");
		var books = ZU.xpath(doc, '//book');
		
		for (var i in books) {
			var newItem = new Zotero.Item("book");
			var book = books[i];
			var authors = ZU.xpath(book, './author');
			for (j in authors){
				newItem.creators.push(ZU.cleanAuthor(authors[j].textContent, "author"))
			}
			var note = ZU.xpathText(book, './bookNote');
			newItem.url = ZU.xpathText(book, './link');
			newItem.title = ZU.xpathText(book, './title');
			newItem.seriesNumber = ZU.xpathText(book, './num');
			newItem.date = ZU.xpathText(book, './date');
			newItem.publisher = ZU.xpathText(book, './publisher');
			newItem.place = ZU.xpathText(book, './publisherAddr');
			//sometimes the place is in the publisher after a period. We assume it's the last period in the string
			if (!newItem.place && newItem.publisher.indexOf(".")!=-1){
				newItem.place = newItem.publisher.match(/\.\s*([^\.]+)$/)[1];
				newItem.publisher = newItem.publisher.match(/(.+)\./)[1];
			}	
			newItem.language = ZU.xpathText(book, './lang');
			newItem.rights = ZU.xpathText(book, './rights');
			newItem.archiveLocation = ZU.xpathText(book, './archLoc');
			newItem.libraryCatalog = ZU.xpathText(book, './serverName');
			newItem.callNumber = ZU.xpathText(book, './cote');
			
			if (note) newItem.notes.push(note);
			newItem.complete();
		}
	})
}

/**
* If a web page that describe multiple is matched, this function give the number of different field.
* @param text : variable provided by Pleade wich describe the actual page
*/
function getNbrTerms(text)
{
	var temp1 = text.substr(text.indexOf
	("nb")+4,10);
	var nbr = temp1.substring(0,temp1.indexOf("\""));

	return parseInt(nbr);
}

/**
* If a web page that describe multiple is matched, this function call Pleade for getting the terms in that page. And then, it call the 
* zotero.selectItem function and finaly it scrape the selected items in zotero.
* @param doc : the javascript doc var
* @param url : url to give to Pleade for getting informations in that page.
*/
function getMultipleQid(doc,url)
{
	var qId;

	Zotero.Utilities.HTTP.doGet(url, function(text) {

		text = text.replace(/<!DOCTYPE[^>]*>/, "").replace(/<\?xml[^>]*\?>/, "");
		text = Zotero.Utilities.trim(text);
		var temp1;
		
		if (url.match("base=ead") && url.match("results.html")) {
			temp1 = text.substr(text.indexOf("var oid")+11,30);
			qId = temp1.substring(0,temp1.indexOf("\""));
		}
		else if (url.match("list-results.html") && url.match("mode=")) {
			temp1 = text.substr(text.indexOf("id=")+12,30);
			Z.debug(temp1)
			qId = temp1.substring(0,temp1.indexOf("\""));
			//qId = temp1;
		}

		Zotero.debug("qId :  " + qId);
		
		var newURL = url.substring(url.indexOf("http"), url.indexOf("results.html"))+"functions/zotero/results/"+qId;
		Zotero.debug("Getting terms : " + newURL);

		// Getting field.title
		Zotero.Utilities.HTTP.doGet(newURL, function(text2) {
	
			text2 = text2.replace(/(<[^!>][^>]*>)/g, function replacer(str, p1, p2, offset, s) {return str.replace(/-/gm, "");});
			text2 = text2.replace(/(<[^!>][^>]*>)/g, function replacer(str, p1, p2, offset, s) {return str.replace(/:/gm, "");});
			text2 = Zotero.Utilities.trim(text2);

			var temp = text2.substring(text2.indexOf("\<title\>"),text2.lastIndexOf("\<\/pleadeId\>")+11);
			var pids = {};
			
			var max=text2.substring(text2.indexOf("nbrresult\>")+20, text2.lastIndexOf("\<nbrresult"));
			max=parseInt(max.substring(max.indexOf("\>")+1, max.lastIndexOf("\<")));
			
			//this loop get fields from Pleade
			for (var i=0; i< max; i++) 
			{
				var title = temp.substring(temp.indexOf("\<title\>")+7,temp.indexOf("\<\/title\>"));
				var pleadeId = temp.substring(temp.indexOf("\<pleadeId\>")+10,temp.indexOf("\<\/pleadeId\>"));
				temp = temp.substring(temp.indexOf("\<result\>")+8,temp.lastIndexOf("\<\/pleadeId\>")+11);
		
				pids[pleadeId] = title;
			}

			var newURL2 = url.substring(url.indexOf("http"), url.indexOf("results.html"))+"functions/zotero/";
		
			Zotero.selectItems(pids, function (tpids) {
				for (var i in tpids) {
					scrape(newURL2+i+".xml?fragment=null");
				}
			});
		})
	})
}

/**
* Function provided by zotero
*/
function doWeb(doc, url) {
	var pleadeId;
	var fragmentId;
	var text;
	
	if (detectWeb(doc, url) == "multiple") {
		getMultipleQid(doc,url);
	}
	else if (detectWeb(doc, url) == "book") {

		// Building the Pleade id of the actual document
		if (url.indexOf("&") != -1) pleadeId = url.substring(url.indexOf("id=")+3,url.indexOf("&"));
		else if (url.indexOf("#") != -1) pleadeId = url.substring(url.indexOf("id=")+3,url.indexOf("#"));
		else pleadeId = url.substring(url.indexOf("id=")+3,url.length);
		// Building the Pleade fragment id of the actual document
		var temp1 = url.substring(url.indexOf("#"),url.length);
		var temp2 = temp1.substring(temp1.indexOf(pleadeId), temp1.length);
		fragmentId = temp2.substring(0,temp2.indexOf("%"));

		scrape(url.substring(url.indexOf("http"), url.indexOf("ead.html"))+"functions/zotero/"+pleadeId+".xml?fragment="+fragmentId);
	}
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://gael.gironde.fr/ead.html?id=FRAD033_IR_11AV#!{%22content%22:%5B%22FRAD033_IR_11AV_e0000023%22,true,%22%22%5D}",
		"items": [
			{
				"itemType": "book",
				"title": "Archives sonores et audiovisuelles de l'association Gric de Prat",
				"creators": [],
				"date": "2010",
				"callNumber": "11 AV 1-14",
				"language": "français",
				"place": "Bordeaux",
				"publisher": "Archives départementales de la Gironde",
				"url": "http://gael.gironde.fr/ead.html?id=FRAD033_IR_11AV",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://jubilotheque.upmc.fr/ead.html?id=GM_000001_014&c=GM_000001_014_page24&qid=sdx_q13#!{%22content%22:%5B%22GM_000001_014_page24%22,false,%22sdx_q13%22%5D}",
		"items": [
			{
				"itemType": "book",
				"title": "Journal d'un voyage géologique fait à travers toute la chaîne des Carpathes, en Bukowine, en Transylvanie et dans le Marmarosch / par feu M. Lill de Lilienbach. Observations remises en ordre et accompagnées de notes par M.A. Boué",
				"creators": [
					{
						"firstName": "Ami",
						"lastName": "Boué",
						"creatorType": "author"
					}
				],
				"date": "1834",
				"language": "fre",
				"place": "Paris ; Strasbourg",
				"publisher": "F.-G. Levrault",
				"rights": "Utilisation libre dans le cadre d'un usage non commercial, en mentionnant la source et sans dénaturer l'oeuvre Free use for non-commercial purposes with mandatory acknowledgement of the source and without adulterating the work",
				"seriesNumber": "1",
				"url": "http://jubilotheque.upmc.fr/ead.html?id=GM_000001_014",
				"attachments": [],
				"tags": [],
				"notes": [
					"Note : 80 p : 3 pl. en noir et en coul ; 31 cm. (Mémoires de la Société Géologique de France, 1ère série, tome I, mémoire n° 13)."
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://jubilotheque.upmc.fr/results.html?base=ead&champ1=fulltext&op1=AND&search_type=simple&query1=tatar&ssearch-submit-npt.x=0&ssearch-submit-npt.y=0",
		"items": "multiple"
	}
]
/** END TEST CASES **/