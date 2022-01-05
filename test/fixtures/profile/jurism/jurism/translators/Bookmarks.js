{
	"translatorID": "4e7119e0-02be-4848-86ef-79a64185aad8",
	"label": "Bookmarks",
	"creator": "Avram Lyon",
	"target": "html",
	"minVersion": "2.1b6",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 3,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-12-17 17:43:00"
}

/*
   Browser bookmarks translator
   Copyright (C) 2011 Avram Lyon, ajlyon@gmail.com

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

 /* This translator imports and exports browser bookmark files in the standard
  * "Netscape Bookmark Format".
  * See http://msdn.microsoft.com/en-us/library/aa753582%28VS.85%29.aspx
  * This code draws from the CSL style for bookmark export, by Rintze Zelle
  * http://www.zotero.org/styles/bookmark-export
  * Input looks like:
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
	 It will be read and overwritten.
	 DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks Menu</H1>
<DL>
	<DT><A HREF="http://www.example.com/">Example Site</A></DT>
	<DD>Longer title</DD>
</DL>
  */

var MAX_DETECT_LINES = 150;
var bookmarkRE = /<DT>[\s\r\n]*<A[^>]+HREF[\s\r\n]*=[\s\r\n]*(['"])([^"]+)\1[^>]*>([^<\n]+?)<\/A>/gi;
var collectionRE = /<DT>[\s\r\n]*<H3[^>]*>([^<]+?)<\/H3>/gi;
var collectionEndRE = /<\/DL>/gi;
var descriptionRE = /<DD>([\s\S]*?)(?=<(?:DT|\/DL|HR)>)/gi;
var bookmarkDetailsRE = /[\s\r\n](HREF|TAGS|ADD_DATE|SHORTCUTURL|DESCRIPTION)[s\r\n]*=[s\r\n]*(['"])([\s\S]*?)\2/gi;

function detectImport() {
	var text = "";
	var line, m;
	var lastIndex = 0;
	var i = 0;
	while ((line = Zotero.read()) !== false && (i++ < MAX_DETECT_LINES)) {
		text += line;

		bookmarkRE.lastIndex = lastIndex; //don't restart searches from begining
		m = bookmarkRE.exec(text);
		if (m && lastIndex < bookmarkRE.lastIndex) lastIndex = bookmarkRE.lastIndex;

		if (m && m[2].toUpperCase().indexOf('PLACE:') !== 0) {
			Zotero.debug("Found a match with line: "+m[0]);
			return true;
		}
	}
	return false;	
}

function doImport() {
	var itemID = 0;
	var l, m, re, line = '';
	var allREs = {
		b: bookmarkRE,
		c: collectionRE,
		ce: collectionEndRE,
		d: descriptionRE
	};
	var firstMatch, firstMatchAt, openItem, lastIndex = 0;
	var collectionStack = [], collection;
	
	while ((l = Zotero.read()) !== false) {
		line += '\n' + l;
		bookmarkRE.lastIndex = collectionRE.lastIndex = descriptionRE.lastIndex = 0;
		do {
			firstMatch = false;
			firstMatchType = false;
			
			for (var re in allREs) {
				if (re == 'd' && !openItem) {
					continue;
				}
				
				allREs[re].lastIndex = lastIndex;
				m = allREs[re].exec(line);
				if (m && (!firstMatchType || m.index < firstMatch.index)) {
					firstMatch = m;
					firstMatchType = re;
				}
			}
			
			if (firstMatchType) {
				m = firstMatch;
				lastIndex = allREs[firstMatchType].lastIndex;
			}
			
			switch (firstMatchType) {
				case 'b': //create new webpage item
					if (openItem) openItem.complete();
					
					var title = m[3].trim();
					
					if (!title || m[2].toUpperCase().indexOf('PLACE:') == 0) {
						Z.debug('Skipping item with no title or special "place:" item');
						openItem = false;
						break;
					}
					
					openItem = new Zotero.Item("webpage");
					openItem.title = ZU.unescapeHTML(title);
					openItem.itemID = openItem.id = itemID++;
					if (collection) collection.children.push(openItem);
					
					bookmarkDetailsRE.lastIndex = 0;
					var detailMatch;
					while (detailMatch = bookmarkDetailsRE.exec(m[0])) {
						switch (detailMatch[1].toUpperCase()) {
							case 'HREF':
								openItem.url = detailMatch[3];
							break;
							case 'DESCRIPTION':
								openItem.abstractNote = detailMatch[3];
							break;
							case 'TAGS':
							case 'SHORTCUTURL':
								openItem.tags = openItem.tags.concat(detailMatch[3].split(/[\s\r\n]*,[\s\r\n]*/));
							break;
							case 'ADD_DATE':
								openItem.accessDate = convertDate(detailMatch[3])
							break;
						}
					}
				break;
				case 'c': //start a collection
					if (openItem) {
						openItem.complete();
						openItem = false;
					}
					
					if (collection) collectionStack.push(collection)
					
					collection = new Zotero.Collection();
					collection.type = 'collection';
					collection.name = ZU.unescapeHTML(m[1]);
					Zotero.debug("Starting collection: "+ collection.name);
					collection.children = new Array();
				break;
				case 'ce': //end a collection
					if (openItem) {
						openItem.complete();
						openItem = false;
					}
					
					var parentCollection = collectionStack.pop();
					
					if (parentCollection) {
						if (collection.children.length) {
							parentCollection.children.push(collection);
						}
						collection = parentCollection;
					} else if (collection && collection.children.length) {
						collection.complete();
						collection = false;
					}
				break;
				case 'd': //add description to bookmark and complete item
					openItem.abstractNote = ZU.trimInternal(m[1]);
					openItem.complete();
					openItem = false;
				break;
			}
		} while (firstMatch);
		
		line = line.substr(lastIndex);
		lastIndex = 0;
	}
	
	if (openItem) openItem.complete();
	if (collection) {
		var parentCollection;
		while (parentCollection = collectionStack.pop()) {
			if (collection.children.length) {
				parentCollection.children.push(collection);
			}
			collection = parentCollection;
		}
		if (collection.children.length) {
			collection.complete();
		}
	}
}

function convertDate(timestamp){
	var d = new Date(timestamp*1000);
 	function pad(n) { return ZU.lpad(n, '0', 2) };
 	return ZU.lpad(d.getUTCFullYear(), '0', 4)+'-'
	  + pad(d.getUTCMonth()+1)+'-'
	  + pad(d.getUTCDate())+' '
	  + pad(d.getUTCHours())+':'
	  + pad(d.getUTCMinutes())+':'
	  + pad(d.getUTCSeconds());
 }



function doExport() {
	var item;
	
	var header = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n'+
'<!-- This is an automatically generated file.\n'+
'     It will be read and overwritten.\n'+
'     DO NOT EDIT! -->\n'+
'<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n'+
'<TITLE>Bookmarks</TITLE>\n'+
'<H1>Bookmarks Menu</H1>\n'+
'<DL>\n';
	var footer = '</DL>';
	//var tags = "";

	Zotero.write(header);
	while (item = Zotero.nextItem()) {
		// TODO Be more verbose, making an informative title and including more metadata
		//tags = item.tags.forEach(function (tag) {return tag.tag}).join(",");
		if (item.url) Zotero.write('    <DT><A HREF="'+item.url+'">'+item.title+'</A>\n');
		else Zotero.debug("Skipping item without URL: "+item.title);
	}
	Zotero.write(footer);
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV=\"Content-Type\" CONTENT=\"text/html; charset=UTF-8\" /><!-- This is an automatically generated file. -->\n<TITLE>Bookmarks</TITLE>\n<H1 LAST_MODIFIED=\"1396239625\">Bookmarks for anarcat from SemanticScuttle</H1>\n<DL>\n        <DT><A HREF=\"https://pond.imperialviolet.org\" description=\"For secure, synchronous communication we have OTR and, when run over Tor, this is pretty good. But while we have secure asynchronous messaging in the form of PGP email, it's not forward secure and it gratuitously leaks traffic information. While a desire for forward secure PGP is hardly new, it still hasn't materialised in a widely usable manner.\n\nAdditionally, email is used predominately for insecure communications (mailing lists, etc) and is useful because it allows previously unconnected people to communicate as long as a (public) email address is known to one party. But the flip side to this is that volume and spam are driving people to use centralised email services. These provide such huge benefits to the majority of email communication, so it's unlikely that this trend is going to reverse. But, even with PGP, these services are trusted with hugely valuable traffic information if any party uses them.\n\nSo Pond is not email. Pond is forward secure, asynchronous messaging for the discerning. Pond messages are asynchronous, but are not a record; they expire automatically a week after they are received. Pond seeks to prevent leaking traffic information against everyone except a global passive attacker.\"  hash=\"192dd9819b1e763872f6cf6a9ac1be26\" tags=\"software,security,social_networking,todo\" ADD_DATE=\"1396253182\" >Pond - Pond</a>\n\n",
		"items": [
			{
				"itemType": "webpage",
				"creators": [],
				"notes": [],
				"tags": [
					"software",
					"security",
					"social_networking",
					"todo"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "Pond - Pond",
				"id": 0,
				"itemID": 0,
				"url": "https://pond.imperialviolet.org",
				"abstractNote": "For secure, synchronous communication we have OTR and, when run over Tor, this is pretty good. But while we have secure asynchronous messaging in the form of PGP email, it's not forward secure and it gratuitously leaks traffic information. While a desire for forward secure PGP is hardly new, it still hasn't materialised in a widely usable manner.\n\nAdditionally, email is used predominately for insecure communications (mailing lists, etc) and is useful because it allows previously unconnected people to communicate as long as a (public) email address is known to one party. But the flip side to this is that volume and spam are driving people to use centralised email services. These provide such huge benefits to the majority of email communication, so it's unlikely that this trend is going to reverse. But, even with PGP, these services are trusted with hugely valuable traffic information if any party uses them.\n\nSo Pond is not email. Pond is forward secure, asynchronous messaging for the discerning. Pond messages are asynchronous, but are not a record; they expire automatically a week after they are received. Pond seeks to prevent leaking traffic information against everyone except a global passive attacker.",
				"accessDate": "2014-03-31 08:06:22"
			}
		]
	}
]
/** END TEST CASES **/
