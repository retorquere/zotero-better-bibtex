{
	"translatorID": "b047a13c-fe5c-6604-c997-bef15e502b09",
	"label": "LexisNexis",
	"creator": "Philipp Zumstein",
	"target": "^https?://[^/]*lexis-?nexis\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2014-03-20 20:48:18"
}

/*
	***** BEGIN LICENSE BLOCK *****

	LexisNexis Translator, Copyright © 2014 Philipp Zumstein
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

//Select Test Frame in Scaffold:
//	single: (2nd) = Results Navigation Frame = Ergebnisnavigation
//	multiple: (5th) = Ergebnisanzeige

function detectWeb(doc, url) {
	//besides deciding whether it is a single item or multiple items
	//it is also important here to select the correct frame! Zotero
	//will only focus on one frame and it is possible to work with that
	//frame further.

	//let's go for the navigation bar (2nd frame from top) to call new urls with hidden variables
	//(this is maybe not the natural choice, but it seems to work)
	if (url.indexOf("parent=docview") != -1 && url.indexOf("target=results_listview_resultsNav") != -1 ) {
		return "newspaperArticle";
	}
	
	if ((url.indexOf("contentRenderer.do?") != -1 || url.indexOf("target=results_ResultsList") != -1) && ZU.xpath(doc, '//tr[./td/input[@name="frm_tagged_documents"]]/td/a').length > 0) {
		return "multiple";
	}
}

function selectFrame(doc, url) {
	var frames = doc.getElementsByTagName("frame");
	var gotoUrl;
	for (var i=0; i<frames.length; i++) {
		Z.debug("selectFrame: " + frames[i].src);
		if (frames[i].src.indexOf("target=results_listview_resultsNav") != -1) gotoUrl=frames[i].src;
	}
	ZU.processDocuments(gotoUrl, scrape);
}

function scrape(doc, url) {
	//base is url containing the host and the first two (or one) subdirectories
	//e.g. http://www.lexisnexis.com/uk/nexis/
	//or   http://www.lexisnexis.com/us/lnacademic/
	//or   http://www.lexisnexis.com/lnacui2api/
	var urlParts = url.split('/');
	var base = urlParts.slice(0,Math.min(5, urlParts.length-1)).join('/') + '/';

	var permaLink = ZU.xpathText(doc,'//input[@name="bookmarkUrl"]/@value');
	
	var risb = ZU.xpathText(doc,'//input[@name="risb"]/@value');
	
	var cisb = ZU.xpathText(doc,'//input[@name="cisb"]/@value');
	if (!cisb) {
		cisb = "";
	}

	var urlIntermediateSite = base+"results/listview/delPrep.do?cisb="+encodeURIComponent(cisb)+"&risb="+encodeURIComponent(risb)+"&mode=delivery_refworks";

	var hiddenInputs = ZU.xpath(doc, '//form[@name="results_docview_DocumentForm"]//input[@type="hidden" and not(@name="tagData")]');
	//if (hiddenInputs.length==0) {
	//	hiddenInputs = ZU.xpath(doc, '//input[@type="hidden" and not(@name="tagData")]');
	//}
	var poststring="";
	for (var i=0; i<hiddenInputs.length; i++) {
		poststring = poststring+"&"+encodeURIComponent(hiddenInputs[i].name)+"="+encodeURIComponent(hiddenInputs[i].value);
	};
	
	poststring += "&focusTerms=&nextSteps=0";
	
	ZU.doPost(urlIntermediateSite, poststring, function(text) {
		
		var urlRis = base+"delivery/rwBibiographicDelegate.do";
		var disb = /<input type="hidden" name="disb" value="([^"]+)">/.exec(text);
		var initializationPage = /<input type="hidden" name="initializationPage" value="([^"]+)">/.exec(text);
		
		var poststring2 = "screenReaderSupported=false&delRange=cur&selDocs=&exportType=dnldBiblio&disb="+encodeURIComponent(disb[1])+"&initializationPage="+encodeURIComponent(initializationPage[1]);
		//Z.debug(poststring2);

		ZU.doPost(urlRis, poststring2, function(text) {
			var risData = text;
			//type is GEN, but better NEWS (or CASE, JOUR)
			text = text.replace(/^TY\s+-\s+GEN\s*$/mg, 'TY  - NEWS');
			//the title information is sometimes somewhere else
			if ( text.search(/^TI\s+-/m) == -1) {
				if ( text.search(/^N2\s+-/m) != -1 ) {//see e.g. Test Case 5
					text = text.replace(/^N2\s+-/m,"TI  -");
					text = text.replace(/^TY\s+-\s+NEWS\s*$/mg, 'TY  - JOUR');
				} else if ( text.search(/^U3\s+-/m) != -1 ) {//see e.g. Test Case 4
					text = text.replace(/^U3\s+-/m,"TI  -");
					text = text.replace(/^TY\s+-\s+NEWS\s*$/mg, 'TY  - CASE');
				}
			} 
			//most authors are saved in N1 tag, correct that:
			text = text.replace(/^N1\s+-[ \f\r\t\v\u00A0\u2028\u2029]+(\w.*)$/mg, cleanAuthorFields );//the range in the regexp is actually just \s without the line break
			//correct date format in RIS e.g. PY - 2013/05/09/
			text = text.replace(/^PY\s+-\//mg, "DA  -");
			//correct page information, e.g. SP - WORLD; Pg. 8
			text = text.replace(/^SP\s+-\s+(\w.*)$/mg, function(totalMatch, pageString){
				var pageAbbreviations = ["Pg.", "S.", "Pag.", "Blz.", "Pág."];
				var pageArray = pageString.split(";");
				var pageArray2 = ZU.trimInternal(pageArray[pageArray.length-1]).split(" ");
				if (pageArray2.length == 2 && pageAbbreviations.indexOf(pageArray2[0]) > -1) {//see e.g. Test Cases 1,2,3
					return 'SP  - ' + pageArray2.slice(1).join(" ") + "\nSE  - " + pageArray.slice(0,-1).join(";");
				} else {//see e.g. Test Case 6
					return 'SE  - ' + pageString;
				}
			});
			Z.debug(text);
			
			var trans = Zotero.loadTranslator('import');
			trans.setTranslator('32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7');//https://github.com/zotero/translators/blob/master/RIS.js
			trans.setString(text);

			trans.setHandler('itemDone', function (obj, item) {
				
				item.url = permaLink;
				
				//for debugging TODO: delete later
				item.notes.push({note:risData});
				
				item.attachments.push( {
					url: url.replace("target=results_listview_resultsNav","target=results_DocumentContent"),
					title: "LexisNexis Entry",
					mimeType: "text/html",
				} );
				item.complete();
			});
		
			trans.translate();
			
		});
	});
}

function cleanAuthorFields(m, authorStr) {//see e.g. Test Cases 2,3
	//m = matched string (everything)
	//authorStr = second parenthesized submatch
	var authors = authorStr.split(';');
	if(authors.length == 1)  {
		//no semicolon
		authors = authorStr.split(',');
		if(authors.length < 3) {
			//at most single comma, don't mess with it
			return 'AU  - ' + authorStr;
		} else if (authors.length == 3) {
			//we have to distinguish the correct cases where the third part is
			//just a suffix as "Jr." and wrong cases where this is a list of
			//three authors ==> easiest is maybe to check for a space
			if (ZU.trimInternal(authors[2]).indexOf(' ') == -1) {
				return 'AU  - ' + authorStr;
			}
		}
	}
	
	//here: One of the following two cases holds:
	//(i) authorStr contains semicolon(s), authors is the array of its different parts, fixName = false
	//(ii) authorStr contains no semicolon but more than one comma, authors is the array of its different parts, fixName = true	
	var str = '';
	for(var i=0; i<authors.length; i++) {
		var author = ZU.trimInternal(authors[i]);
		if(author.indexOf(',') == -1 && author.indexOf(' ') != -1) {
			//best guess: split at the last space
			var splitAt = author.lastIndexOf(' ');
			author = author.substring(splitAt+1) + ', ' + author.substring(0, splitAt);
		}
		if(author) str += '\nAU  - ' + author;
	}
	return str.substr(1);
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		
		var items = new Object();
		var articles = new Array();
		
		//if the detectWeb is not clear on the iframe, we might need
		//tempDoc instead of doc:
		//var tempDoc = doc.defaultView.parent.document;
		
		var rows = ZU.xpath(doc, '//tr[./td/input[@name="frm_tagged_documents"]]/td/a');//exclude weblinks
		Z.debug("rows.length = " + rows.length);
		for(var i=0; i<rows.length; i++) {
			var title = ZU.trimInternal(rows[i].textContent);
			var link = rows[i].href;
			items[link] = title;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, selectFrame);
		});
	} else {
		scrape(doc, url);
	}
	
}


/*
	Test cases are generetad with Scaffold.
	But (I think) they cannot updated with Scaffold again.
	To manually add a test case, do the following steps:
		1. Open a permanent URL of an item
		2. Open Scaffold and select the right frame (Results Navigation Frame)
		3. Testing -> New Web -> Save
*//** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.lexisnexis.com/uk/nexis/frame.do?tokenKey=rsh-23.293114.58735663886&target=results_listview_resultsNav&returnToKey=20_T19483687921&parent=docview&rand=1395341618309&reloadEntirePage=true",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"lastName": "Steven Geyer",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"notes": [
					{
						"note": "TY  - GEN\r\nT1  - Zweifel an Hoeneß&apos; Angaben zur Quelle der Schweizer Millionen;  Opposition: Offene Fragen. Koalition erschwert Straffreiheit\r\nJO  -  Berliner Zeitung\r\nPY  - 2014/03/17/\r\nSP  - POL; S. 5\r\nM3  - 479 Wörter\r\nN1  - Steven Geyer\r\nER  -\r\n"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "LexisNexis Entry",
						"mimeType": "text/html"
					}
				],
				"title": "Zweifel an Hoeneß' Angaben zur Quelle der Schweizer Millionen; Opposition: Offene Fragen. Koalition erschwert Straffreiheit",
				"journalAbbreviation": "Berliner Zeitung",
				"date": "2014-03-17",
				"pages": "5",
				"section": "POL",
				"publicationTitle": "Berliner Zeitung",
				"url": "http://www.lexisnexis.com/uk/nexis/docview/getDocForCuiReq?lni=5BS1-R651-DYJR-P1N8&csi=5949&oc=00240&perma=true",
				"libraryCatalog": "LexisNexis",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Zweifel an Hoeneß' Angaben zur Quelle der Schweizer Millionen; Opposition"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.lexisnexis.com/lnacui2api/frame.do?tokenKey=rsh-23.860765.9038064798&target=results_listview_resultsNav&returnToKey=20_T19483698615&parent=docview&rand=1395341680728&reloadEntirePage=true",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"lastName": "Bibby",
						"firstName": "Paul",
						"creatorType": "author"
					},
					{
						"lastName": "Murdoch",
						"firstName": "Lindsay",
						"creatorType": "author"
					},
					{
						"lastName": "Koutsoukis",
						"firstName": "Jason",
						"creatorType": "author"
					},
					{
						"lastName": "Allard",
						"firstName": "Tom",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "TY  - GEN\r\nT1  - Hijack fear as al-Qaeda plot revealed Plane systems turned off by someone aboard;  FLIGHT MH370\r\nJO  -  The Age (Melbourne, Australia)\r\nPY  - 2014/03/17/\r\nSP  - NEWS; Pg. 6\r\nM3  - 1219 words\r\nN1  - Paul Bibby, Lindsay Murdoch, Jason Koutsoukis, Tom Allard\r\nER  -\r\n"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "LexisNexis Entry",
						"mimeType": "text/html"
					}
				],
				"title": "Hijack fear as al-Qaeda plot revealed Plane systems turned off by someone aboard;  FLIGHT MH370",
				"journalAbbreviation": "The Age (Melbourne, Australia)",
				"date": "2014-03-17",
				"pages": "6",
				"section": "NEWS",
				"publicationTitle": "The Age (Melbourne, Australia)",
				"url": "http://www.lexisnexis.com/lnacui2api/api/version1/getDocCui?lni=5BRW-BGR1-JD34-V3FB&csi=314239&hl=t&hv=t&hnsd=f&hns=t&hgn=t&oc=00240&perma=true",
				"libraryCatalog": "LexisNexis",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.lexisnexis.com/lnacui2api/frame.do?tokenKey=rsh-23.753812.5831118143&target=results_listview_resultsNav&returnToKey=20_T19483747044&parent=docview&rand=1395342122958&reloadEntirePage=true",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"lastName": "Hussain",
						"firstName": "Haris",
						"creatorType": "author"
					},
					{
						"lastName": "Karim",
						"firstName": "Farrah Naz",
						"creatorType": "author"
					},
					{
						"lastName": "Mustafa",
						"firstName": "Zulita",
						"creatorType": "author"
					},
					{
						"lastName": "Ariff",
						"firstName": "Syed Umar",
						"creatorType": "author"
					},
					{
						"lastName": "Ahmad",
						"firstName": "Arman",
						"creatorType": "author"
					},
					{
						"lastName": "Latiff",
						"firstName": "Rozanna",
						"creatorType": "author"
					},
					{
						"lastName": "Bendahara",
						"firstName": "Alang",
						"creatorType": "author"
					},
					{
						"lastName": "Yunus",
						"firstName": "Akil",
						"creatorType": "author"
					},
					{
						"lastName": "Mohd",
						"firstName": "Hariz",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "TY  - GEN\r\nT1  - Australia extends search\r\nJO  -  New Straits Times (Malaysia)\r\nPY  - 2014/03/18/\r\nSP  - LOCAL; Pg. 7\r\nM3  - 358 words\r\nN1  - Haris Hussain; Farrah Naz Karim; Zulita Mustafa; Syed Umar Ariff; Arman Ahmad; Rozanna Latiff; Alang Bendahara; Akil Yunus; Hariz Mohd;\r\nER  -\r\n"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "LexisNexis Entry",
						"mimeType": "text/html"
					}
				],
				"title": "Australia extends search",
				"journalAbbreviation": "New Straits Times (Malaysia)",
				"date": "2014-03-18",
				"pages": "7",
				"section": "LOCAL",
				"publicationTitle": "New Straits Times (Malaysia)",
				"url": "http://www.lexisnexis.com/lnacui2api/api/version1/getDocCui?lni=5BS7-5CJ1-DYR7-33T8&csi=151977&hl=t&hv=t&hnsd=f&hns=t&hgn=t&oc=00240&perma=true",
				"libraryCatalog": "LexisNexis",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.lexisnexis.com/lnacui2api/frame.do?tokenKey=rsh-23.279322.38229466643&target=results_listview_resultsNav&returnToKey=20_T19483752794&parent=docview&rand=1395342198531&reloadEntirePage=true",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [
					{
						"note": "TY  - GEN\r\nU3  - Ricci v. DeStefano, \r\nM2  - (No. 07-1428), (No. 08-328)\r\nPB  - SUPREME COURT OF THE UNITED STATES\r\nM2  - 557 U.S. 557; 129 S. Ct. 2658; 174 L. Ed. 2d 490; 2009 U.S. LEXIS 4945; 77 U.S.L.W. 4639; 106 Fair Empl. Prac. Cas. (BNA) 929; 92 Empl. Prac. Dec. (CCH) P43,602; 21 Fla. L. Weekly Fed. S 1049\r\nU2  -  The LEXIS pagination of this document is subject to change pending release of the final published version.\r\nU1  - Related proceeding at Luschenat v. City of New Haven, 2013 U.S. Dist. LEXIS 15929 (D. Conn., Feb. 6, 2013)\r\nER  -\r\n"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "LexisNexis Entry",
						"mimeType": "text/html"
					}
				],
				"caseName": "Ricci v. DeStefano,",
				"extra": "(No. 07-1428), (No. 08-328); 557 U.S. 557; 129 S. Ct. 2658; 174 L. Ed. 2d 490; 2009 U.S. LEXIS 4945; 77 U.S.L.W. 4639; 106 Fair Empl. Prac. Cas. (BNA) 929; 92 Empl. Prac. Dec. (CCH) P43,602; 21 Fla. L. Weekly Fed. S 1049",
				"court": "SUPREME COURT OF THE UNITED STATES",
				"url": "http://www.lexisnexis.com/lnacui2api/api/version1/getDocCui?lni=4WMW-WG80-TXFX-11XY&csi=6443&hl=t&hv=t&hnsd=f&hns=t&hgn=t&oc=00240&perma=true",
				"libraryCatalog": "LexisNexis",
				"accessDate": "CURRENT_TIMESTAMP",
				"title": "Ricci v. DeStefano,"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.lexisnexis.com/lnacui2api/frame.do?tokenKey=rsh-23.863287.9160760157&target=results_listview_resultsNav&returnToKey=20_T19483766793&parent=docview&rand=1395342308370&reloadEntirePage=true",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [],
				"notes": [
					{
						"note": "TY  - GEN\r\nPB  - Copyright (c) 2013 The American Society of International Law American Journal of International Law\r\nPY  - 2013/07/01/\r\nM2  - 107 A.J.I.L. 684\r\nM3  - 1167 words\r\nN2  - CONTEMPORARY PRACTICE OF THE UNITED STATES RELATING TO INTERNATIONAL LAW: SETTLEMENT OF DISPUTES: Guatemala and United States CAFTA-DR Labor Standards Arbitration Suspended\r\nU3  - EDITED BY JOHN R. CROOK\r\nER  -\r\n"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "LexisNexis Entry",
						"mimeType": "text/html"
					}
				],
				"publisher": "Copyright (c) 2013 The American Society of International Law American Journal of International Law",
				"date": "2013-07-01",
				"extra": "107 A.J.I.L. 684",
				"title": "CONTEMPORARY PRACTICE OF THE UNITED STATES RELATING TO INTERNATIONAL LAW: SETTLEMENT OF DISPUTES: Guatemala and United States CAFTA-DR Labor Standards Arbitration Suspended",
				"url": "http://www.lexisnexis.com/lnacui2api/api/version1/getDocCui?lni=59H1-X9C0-00CV-70R0&csi=7416&hl=t&hv=t&hnsd=f&hns=t&hgn=t&oc=00240&perma=true",
				"libraryCatalog": "LexisNexis",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "CONTEMPORARY PRACTICE OF THE UNITED STATES RELATING TO INTERNATIONAL LAW"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.lexisnexis.com/lnacui2api/frame.do?tokenKey=rsh-23.281280.037032678&target=results_listview_resultsNav&returnToKey=20_T19483769576&parent=docview&rand=1395342384676&reloadEntirePage=true",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [
					{
						"note": "TY  - GEN\r\nT1  - Smartphones steuern fast alles;  MESSE Auf dem Mobile World Congress bestimmt Vernetzungstrend das Geschehen\r\nJO  -  Bürstädter Zeitung (Germany)\r\nPY  - 2014/03/11/\r\nSP  - MULTIMEDIA\r\nM3  - 587 Wörter\r\nER  -\r\n"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "LexisNexis Entry",
						"mimeType": "text/html"
					}
				],
				"title": "Smartphones steuern fast alles;  MESSE Auf dem Mobile World Congress bestimmt Vernetzungstrend das Geschehen",
				"journalAbbreviation": "Bürstädter Zeitung (Germany)",
				"date": "2014-03-11",
				"section": "MULTIMEDIA",
				"publicationTitle": "Bürstädter Zeitung (Germany)",
				"url": "http://www.lexisnexis.com/lnacui2api/api/version1/getDocCui?lni=5BPR-K321-JDMN-J0G3&csi=339134&hl=t&hv=t&hnsd=f&hns=t&hgn=t&oc=00240&perma=true",
				"libraryCatalog": "LexisNexis",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/