{
	"translatorID": "bf6b49e3-9198-4fbc-a559-a81fcfcce908",
	"label": "World Shakespeare Bibliography Online",
	"creator": "Matthias Heim",
	"target": "^https?://(www\\.)?worldshakesbib\\.org",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2014-06-11 22:48:03"
}

/*
   World Shakespeare Bibliography Online translator
   Copyright (C) 2011 Matthias Heim

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 
*/

/*
* Translator for the World Shakespeare Bibliography Online http://www.worldshakesbib.org
* Version 0.1: 3 November 2011 detectWeb complete
* Version 0.2: 4 November 2011 doWeb
* Version 0.4: 6 November 2011 initial version, fully working, but somewhat messy code with ugly workarounds
* Currently it works only for individual items, and collections of items saved by the user
* Currently, it does not offer Item Selection Dialogues for browse or search pages
* The World Shakespeare Bibliography Online offers extensive links to related documents,
* these are currently added as attached URLs to the corresponding entry in the bibliography,
* not as related items in Zotero, as translators can only add, but not access items in the 
* Zotero database.
* Written by Matthias Heim Matthias.Heim@unine.ch
*/

var entries=new Array();

function Entry() {
	this.item_type="";
	this.dictionary=new Array();
	this.baseURL="";
	
	// returns one-dimensional array of table, uneven entries being the left side, even entries the right
	this.tableIntoArray = function(tableHTML) {
		currentTDstart=0;
		var TD=new Array();
	
		let currentTDstart;
		// eslint-disable-next-line zotero-translator/prefer-index-of
		while ((currentTDstart=tableHTML.indexOf("<td>",currentTDstart))!=-1) {
			const currentTD=tableHTML.substring(currentTDstart+4, (currentTDstart=tableHTML.indexOf("</td>",currentTDstart)));
		
			// remove enclosing <b> tag, enclosing <i> tag, enclosing brackets, and enclosing quotation marks
			if (currentTD.substr(0,3)+currentTD.substr(-4)=="<b></b>") currentTD=currentTD.slice(3,-4);
			if (currentTD.substr(0,3)+currentTD.substr(-4)=="<i></i>") {
				currentTD=currentTD.slice(3,-4);
				// check whether it really was enclosing, for e.g. 
				// currentTD="<i>Hamlet</i> to <i>The Tempest</i>";
				if (currentTD.indexOf("<i>")>currentTD.indexOf("</i>")) currentTD="<i>"+currentTD+"</i>";
			}
			if (currentTD.substr(0,1)+currentTD.substr(-1)=="[]") currentTD=currentTD.slice(1,-1);
			if (currentTD.substr(0,1)+currentTD.substr(-1)=="\"\"") currentTD=currentTD.slice(1,-1);
			
			// remove enclosing <a> tag, except if preceding element is a "Head Entry", in which case only the href-URL is retained
			if (currentTD.substr(0,2)+currentTD.substr(-4)=="<a</a>") {
				if (TD[TD.length-1]=="Head Entry") currentTD=currentTD.substring(currentTD.indexOf("href=\"")+6,currentTD.indexOf("\">"));
				else currentTD=currentTD.slice(currentTD.indexOf(">")+1,-4);
			}
		
			// remove font-color red tags, as these only highlight search items. Could probably be done with a regexp.
			let redstart;
			// eslint-disable-next-line zotero-translator/prefer-index-of
			while ((redstart=currentTD.indexOf('<font color="red">'))!=-1) {
				currentTD=currentTD.substring(0,redstart)+currentTD.substring(redstart+18);
				// eslint-disable-next-line zotero-translator/prefer-index-of
				if ((redstart=currentTD.indexOf('</font>'))!=-1)
					currentTD=currentTD.substring(0,redstart)+currentTD.substring(redstart+7);
			}
		
		
			// remove final period? Yes, but watch out, it removes it also after initials
			if (currentTD.substr(-1)==".") currentTD=currentTD.slice(0,-1);
			if (currentTD.substr(-1)==",") currentTD=currentTD.slice(0,-1); // the case with many name entries
		
			//Zotero.debug(currentTD+"\n");
			TD.push(currentTD);
		}
	
		return TD;
	};

	this.addTable = function(tableHTML) {
		// turn table into array
		var tableArray=this.tableIntoArray(tableHTML);
		let entryno;
		
		// Some names are followed by an entry for their roles, simply replace name-index entry with role
		if ((entryno=arrayTableIndexOf(tableArray,"Role"))!=-1) {
			tableArray[entryno-3]=tableArray[entryno];
			tableArray.splice(entryno-1,2);
		}
	
		var headEntry="";
		// If a head-entry exists, it needs to be extracted and later followed up!
		if ((entryno=arrayTableIndexOf(tableArray, "Head Entry"))!=-1) {
			headEntry=tableArray[entryno];
			tableArray.splice(entryno-1,2);
		}
		
		entryno=arrayTableIndexOf(tableArray, "Document Type");
		if (this.item_type=="") { // new item
			this.item_type=tableArray[entryno];
			tableArray.splice(entryno-1,2); // remove entry for document type
		} else {
			// check whether item_type has changed
			if (this.item_type!=tableArray[entryno]) {
				if ((this.item_type=="Article") && ((tableArray[entryno]=="Book monograph") || (tableArray[entryno]=="Book collection")) ) {
					this.item_type="bookSection"; // and not "Article"!
					tableArray.splice(entryno-1,2); // remove entry for document type
					
					tableArray[arrayTableIndexOf(tableArray, "Title")-1]="bookTitle";
					
					const redundantname=arrayTableIndexOf(tableArray,"Name");
					if (redundantname!=-1) tableArray.splice(redundantname-1,2);
					
					tableArray.splice(arrayTableIndexOf(tableArray,"Notes/Performers")-1,2); // would refer only to collection, not to essay
					tableArray.splice(arrayTableIndexOf(tableArray,"Language")-1,2);
					tableArray.splice(arrayTableIndexOf(tableArray,"Record Number")-1,2);
					
					const entryno2=arrayTableIndexOf(this.dictionary, "Venue/Publisher");
					this.dictionary[entryno2-1]="Pages";
					this.dictionary[entryno2]=this.dictionary[entryno2].substring(this.dictionary[entryno2].lastIndexOf(" "));
				} else {
					Zotero.debug("Unhandled change of item type exception. Item not saved.");
					// possibly a commit of the item to the database could be possible, but this event should actually never occur!
					return;
				}
			}
			// always retain the Index Location where the user found the document, hence discard it in follow-up entries
			arrayTableExtractItem(tableArray, "Index Location");
			arrayTableExtractItem(tableArray, "Record Number");
		}
		
		// assign all items from tableArray to this.dictionary
		for (let entryno=0; entryno<tableArray.length; entryno+=2) {
			let entryno2;
			if ((entryno2=arrayTableIndexOf(this.dictionary, tableArray[entryno]))!=-1) {
				this.dictionary[entryno2]=tableArray[entryno+1];
			} else {
				this.dictionary.push(tableArray[entryno]);
				this.dictionary.push(tableArray[entryno+1]);
			}
		}
		
		if (headEntry!="") {
			// fetch next entry, follow up on item refered to in the table as Head Entry
			// retrieve item number (this) in global array, for later reference in callback
			for (var entrynum=0; entrynum<entries.length; entrynum++) if (entries[entrynum]===this) break;
			Zotero.Utilities.processDocuments(headEntry, function(newDoc) {entries[entrynum].addPage(newDoc);});
		} else {
			// commit to  ZoteroDatabase
			/*s="";
			for (dummy=0; dummy<this.dictionary.length; dummy+=2) s+=this.dictionary[dummy]+" : "+this.dictionary[dummy+1]+"\n";
			Zotero.debug(s);*/
			this.commitToZotero();
		}
	};
	
	this.commitToZotero = function() {
		switch (this.item_type) {
		case "Article":
			this.item_type = "journalArticle";
			break;
		case "Book monograph":
		case "Book collection": // Zotero does not distinguish the two
			this.item_type = "book";
			break;
		case "Dissertation":
			this.item_type = "thesis";
			break;
		case "Production":
			// this is most likely a theatre production, but videoRecording offers the closest alternative in Zotero
			this.item_type = "videoRecording";
			break;
		case "Audio Recording":
			this.item_type = "audioRecording";
			break;
		case "Film":
			this.item_type = "film";
			break;
		case "bookSection": break;
		default:
			Zotero.debug("This document type, "+this.item_type+", does not seem to exist in Zotero.");
			this.item_type = "";
			// unrecognized item? return empty, as no entry present
		}
		if (this.item_type=="") return; // unrecognized item
		Zotero.debug(this.item_type);
		var newItem = new Zotero.Item(this.item_type);
		newItem.title = arrayTableExtractItem(this.dictionary, "Title");
		
		if (this.item_type=="bookSection") {
			newItem.pages = arrayTableExtractItem(this.dictionary, "Pages");
			newItem.bookTitle = arrayTableExtractItem(this.dictionary, "bookTitle");
		}
		
		// standardize name entries
		for (counter=0; counter<this.dictionary.length; counter+=2) {
			switch (this.dictionary[counter]){
			case "Names":
			case "Name":
				this.dictionary[counter]="author";
				break;
			case "editor":
			case "editors":
				this.dictionary[counter]="editor";
				break;
			case "director":
			case "directors":
			case "conductor":
			case "conductors":
				this.dictionary[counter]="director";
				break;
			case "translators":
				this.dictionary[counter]="translator";
				break;
			case "narrator":
			case "narrators":
			case "lecturer":
			case "lecturers":
				this.dictionary[counter]="performer";
				break;
			case "general editor":
			case "general editors":
				this.dictionary[counter]="seriesEditor";
				break;
			}
		}
		
		// add names in order found on/in pages
		let counter=0;
		while (counter<this.dictionary.length) {
			if ((this.dictionary[counter]=="director") || 
				(this.dictionary[counter]=="performer") || 
				(this.dictionary[counter]=="author") || 
				(this.dictionary[counter]=="editor") || 
				(this.dictionary[counter]=="translator") ||
				(this.dictionary[counter]=="seriesEditor")) 
			{
				const names=this.dictionary[counter+1].split(";");
				for (let counter2=0; counter2<names.length; counter2++)
					newItem.creators.push(Zotero.Utilities.cleanAuthor(names[counter2], this.dictionary[counter], true));
				this.dictionary.splice(counter,2);
			} else counter+=2;
		}
		
		let publisher=arrayTableExtractItem(this.dictionary, "Venue/Publisher");
		if (publisher!=-1) {
			// extract URL (from the rare items when it is present here, mostly obscure web-journals, no snapshot, as these URLs are often invalid)
			// again, this is only almost perfect. If a bookSection contains an URL, the pages will not be extracted correctly, and the 
			// (other) URL from the book's head entry will be taken into account. This is a a very rare case though.
			let url_index;
			// eslint-disable-next-line zotero-translator/prefer-index-of
			if ((url_index=publisher.indexOf("(http"))!=-1) { // common format
				const url_lastindex=publisher.indexOf(")",url_index+4);
				if (url_lastindex==-1) url_lastindex=publisher.length;
				newItem.url=publisher.slice(url_index+1,url_lastindex);
				publisher=publisher.slice(0,url_index)+publisher.slice(url_lastindex+1);
				while (publisher.charAt(publisher.length-1)==" ") publisher=publisher.slice(0,publisher.length-1);
			}
			// eslint-disable-next-line zotero-translator/prefer-index-of
			if ((url_index=publisher.indexOf("<a"))!=-1) { // common format for precise links
				// eslint-disable-next-line zotero-translator/prefer-index-of
				if ((url_index=publisher.indexOf("href=",url_index))!=-1){
					const url_lastindex=publisher.indexOf('"',url_index+6);
					if (url_lastindex==-1) url_lastindex=publisher.length; // an unlikely case
					newItem.url=publisher.slice(url_index+6,url_lastindex);
					publisher=publisher.slice(0,publisher.indexOf("<a"))+publisher.slice(publisher.indexOf("</a>")+4);
					while (publisher.charAt(publisher.length-1)==" ") publisher=publisher.slice(0,publisher.length-1);
				}
			}
			// eslint-disable-next-line zotero-translator/prefer-index-of
			if ((url_index=publisher.indexOf("http"))!=-1) { // final common format, more difficult to parse safely
				const url_lastindex=publisher.indexOf(" ",url_index+4);
				if (url_lastindex==-1) url_lastindex=publisher.length;
				newItem.url=publisher.slice(url_index,url_lastindex);
				publisher=publisher.slice(0,url_index)+publisher.slice(url_lastindex+1);
				while (publisher.charAt(publisher.length-1)==" ") publisher=publisher.slice(0,publisher.length-1);
			}
			
			//e.g. Manchester and New York: Manchester University Press, 2003. x + 227 pp.
			if ((this.item_type=="book") || (this.item_type=="bookSection")) {
				if ((this.item_type=="book") && (publisher.slice(-3)==" pp")) newItem.numPages=publisher.slice(publisher.slice(0,-3).lastIndexOf(" ")+1,-3);
				newItem.place=publisher.slice(0,publisher.indexOf(":"));
				newItem.publisher=publisher.slice(publisher.indexOf(":")+2, publisher.lastIndexOf(","));
			}
		
			// article publication info: e.g.
			// <i>Shakespeare Quarterly</i> 61, no. 2 (2010): 56-77
			if ((this.item_type=="journalArticle") || (this.item_type=="thesis")) {
				publisher+=" ";
				// dissertations are poorly parsed, but this format works for 
				// most dissertations in the database
				let i;
				if (this.item_type!="thesis") // usually unpaginated
					newItem.pages=publisher.slice((i=publisher.indexOf("): ")+3),publisher.indexOf(" ", i));
				else newItem.university=publisher.slice(publisher.lastIndexOf("(")+1, publisher.lastIndexOf(")"));

				newItem.publicationTitle=publisher.slice(publisher.indexOf("<i>")+3,publisher.indexOf("</i>"));
				publisher=publisher.slice(publisher.indexOf("</i>")+5,publisher.indexOf(" ("));
				let issuestart;
				// eslint-disable-next-line zotero-translator/prefer-index-of
				if ((issuestart=publisher.indexOf(", no."))!=-1) {
					newItem.volume=publisher.slice(0,issuestart);
					newItem.issue=publisher.slice(issuestart+6);
				} else newItem.volume=publisher;			
			}
		
			// All the items below lack a standard format
			// The information usually includes date, label, running time, etc.
			// It is copied into the field that matches the usual information most closely
			if ((this.item_type=="audioRecording") || (this.item_type=="videoRecording") || (this.item_type=="film")) {
				if (this.item_type=="audioRecording") newItem.label=publisher;
				if (this.item_type=="videoRecording") newItem.videoRecordingFormat=publisher;
				if (this.item_type=="film") newItem.distributor=publisher;
			}
		}

		
		const series=arrayTableExtractItem(this.dictionary, "Series Statement");
		if ((series!=-1) && ((this.item_type=="book") || (this.item_type=="bookSection") || (this.item_type=="journalArticle"))) newItem.series=series;
		if ((series!=-1) && ((this.item_type=="audioRecording") || (this.item_type="videoRecording"))) newItem.seriesTitle=series;
		
		const language=arrayTableExtractItem(this.dictionary, "Language");
		if (language!=-1) newItem.language=language;
		const archiveLocation=arrayTableExtractItem(this.dictionary, "Index Location");
		if (archiveLocation!=-1) newItem.archiveLocation=archiveLocation;
		const callNumber=arrayTableExtractItem(this.dictionary, "Record Number");
		if (callNumber!=-1) newItem.callNumber=callNumber;
		
		const date=arrayTableExtractItem(this.dictionary, "Date");
		if (date!=-1) newItem.date=date;
		
		arrayTableExtractItem(this.dictionary, "Cross Reference"); // To be discarded
		
		const AdditionalTitleInfo=arrayTableExtractItem(this.dictionary, "Additional Title Info");
		const NotesPerformers=arrayTableExtractItem(this.dictionary,"Notes/Performers");
		newItem.abstractNote=((AdditionalTitleInfo!=-1)?(AdditionalTitleInfo+((NotesPerformers!=-1)?"\n":"")):"")+((NotesPerformers!=-1)?NotesPerformers:"");
		
		const reviews=arrayTableExtractItem(this.dictionary,"Reviews");
		if (reviews!=-1) {
			newItem.notes.push({note:reviews});
		}
		
		// Extract tags
		let tags=arrayTableExtractItem(this.dictionary,"Descriptive Terms");
		if (tags!=-1) {
			newItem.tags=newItem.tags.concat(tags.split("; "));
		}
		tags=arrayTableExtractItem(this.dictionary,"Persons");
		if (tags!=-1) {
			newItem.tags=newItem.tags.concat(tags.split("; "));
		}
		
		
		// see also links are saved as attached URLs
		let seeAlso=arrayTableExtractItem(this.dictionary,"See Also");
		let j;
		if (seeAlso!=-1) {
			seeAlso=seeAlso.split("<a");
			for (let i=0; i<seeAlso.length; i++) {
				// eslint-disable-next-line zotero-translator/prefer-index-of
				if ((j=seeAlso[i].indexOf("href="))!=-1) {
					newItem.attachments.push({url:this.baseURL+seeAlso[i].slice(j+6,seeAlso[i].indexOf('"',j+6)), title:"See also: "+seeAlso[i].slice(seeAlso[i].lastIndexOf("</a>")+5), mimeType: "text/html", snapshot: false});
				}
			}	
		}
		
		while (arrayTableExtractItem(this.dictionary,"Document Type")!=-1); // sometimes survives as a duplicate, discard
		
		let otherInformation="Other Information:";
		for (let i=0; i<this.dictionary.length; i+=2)
			otherInformation+="\n"+this.dictionary[i]+": "+this.dictionary[i+1];
		if (otherInformation!="Other Information:") newItem.notes.push({note:otherInformation});
		
		newItem.complete();
	};

	this.addPage =  function(doc) {
		if (doc.getElementById("records")!= null) {
			var records_content=doc.getElementById("records").innerHTML;
			// the entry is always presented in a table beginning in the same string
			var entry_start=records_content.indexOf("<tbody><tr><td><b>Index Location</b></td>");
			if (entry_start != -1) {
				this.addTable(records_content.substring(entry_start, records_content.indexOf("</tbody>", entry_start)+8));
			} else Zotero.debug("No entry could be found on page");
		} else Zotero.debug("No result could be found");
	};
}



function doWeb(doc, url) {
	
	// doWeb has its own parser, duplicating addPage above somewhat, because it is the 
	// only page where multiple results are possible, taking this into account here 
	// speeds the parsing up.
	
	// records are always contained within a div with the id 'records'
	if (doc.getElementById("records")!= null) {
		var records_content=doc.getElementById("records").innerHTML;
		// each entry is always presented in a table beginning in the same string
		var entry_start=0;
		// eslint-disable-next-line zotero-translator/prefer-index-of
		while ((entry_start=records_content.indexOf("<tbody><tr><td><b>Index Location</b></td>",entry_start))!=-1) { // at least one entry present
			entries.push(new Entry());
			entries[entries.length-1].baseURL=url.substring(0, url.indexOf("/",7));
			entries[entries.length-1].addTable(records_content.substring(entry_start, (entry_start=records_content.indexOf("</tbody>", entry_start)+8)));
		}
	} else Zotero.debug("No results could be found"); // This is where search and browse results could be parsed!
}


function arrayTableIndexOf(narray, nvalue) {
	for (var neach=0; neach<narray.length; neach=neach+2) {
		if (narray[neach]==nvalue) return neach+1;
	}
	return -1;
}

function arrayTableExtractItem(narray, nvalue) {
	const neach=arrayTableIndexOf(narray, nvalue);
	if (neach==-1) {
		return -1;
	} else {
		const ncontent=narray[neach];
		narray.splice(neach-1,2);
		return ncontent;
	}
}

// detectWeb is self-contained and does not use any other functions, all of which relate to doWeb!
function detectWeb(doc, url) {
	// records are always contained within a div with the id 'records'
	if (doc.getElementById("records")!= null) {
		var records_content=doc.getElementById("records").innerHTML;
		// each entry is always presented in a table beginning in the same string
		var first_entry=records_content.indexOf("<tbody><tr><td><b>Index Location</b></td>"); // at least one entry present
		if (first_entry != -1) { // at least one entry is present
			// a note on "multiple"
			// This only works on the "View Saved Entries" (http://www.worldshakesbib.org/export) page, not in the search!
			// Completely different code would be necessary for browse or search pages
			// Since this page always already represents a selection made by the user, the handler will indiscriminately save all items, and not offer an Item Selection Dialogue
			// TODO: either behaviour may of course be changed in subsequent versions

			// eslint-disable-next-line zotero-translator/prefer-index-of
			if (records_content.indexOf("<tbody><tr><td><b>Index Location</b></td>",first_entry+1)!=-1)	return "multiple"; // several entries present
		
			// if only one entry is present, its type can be retrieved from the 'Document type' entry in the table
			// e.g. <tr><td><b>Document Type</b></td><td>Article</td></tr>
			// Note that Article can also mean bookSection, a distinction that only the doWeb function will test, as it involves a GET command
			let startindex;
			const document_type=records_content.substring(startindex=(records_content.indexOf("<tr><td><b>Document Type</b></td><td>")+37),records_content.indexOf("</td>",startindex));
			switch (document_type) {
			case "Article":
				return "journalArticle"; // but could equally be "bookSection", see above
				break;
			case "Book monograph":
			case "Book collection": // Zotero does not distinguish the two
				return "book";
				break;
			case "Dissertation":
				return "thesis";
				break;
			case "Production":
				// this is most likely a theatre production, but videoRecording offers the closest alternative in Zotero
				return "videoRecording";
				break;
			case "Audio Recording":
				return "audioRecording";
				break;
			case "Film":
				return "film";
				break;
			default:
				// unrecognized item? return empty, as no entry present
			}
		} // else no entry present
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.worldshakesbib.org/search?searchtype=browse&index=30.14.05.30&rid=49952&words=&returnlink=%2Fsearch%3Fsearchtype%3Dbrowse%26index%3D30.14.05.30%26return%3D1",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Madhavi",
						"lastName": "Menon",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "Review(s): Guy-Bray, Stephen. <i>Renaissance Quarterly</i> 62, no. 1 (2009): 318-20; Patricia, Anthony Guy. <i>Popular Culture Review</i> 20, no. 2 (2009): 88-93; Rieh, Anna. <i>Sixteenth Century Journal</i> 41, no. 4 (2010): 1243-44; Rosenberger, JeriLynn. <i>Sixteenth Century Journal</i> 41, no. 4 (2010): 1243-44; Paul, Ryan Singh. <i>Shaksper: The Global Shakespeare Discussion List</i> 6 October 2011: SHK 22.0270 (http://shaksper.net)"
					}
				],
				"tags": [
					"queer theory",
					"sexuality",
					"desire",
					"Madden, John"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "See also: Madden, <i>Shakespeare in Love</i>",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"title": "Unhistorical Shakespeare: Queer Theory in Shakespearean Literature and Film",
				"numPages": "195",
				"place": "New York and Basingstoke",
				"publisher": "Palgrave Macmillan",
				"language": "English",
				"archiveLocation": "30.12.05.30  Individual Works — Plays; <i>Cymbeline</i>; Scholarship And Criticism; Criticism",
				"callNumber": "aaw627",
				"date": "2008",
				"abstractNote": "Introducing the term \"homohistory\" as a \"methodological resistance to sexuality as historical difference\" in Shakespeare criticism, pursues the \"eccentricities of desire\" in <i>Venus and Adonis</i>, <i>Cymbeline</i>, and <i>Titus Adronicus</i>, as well as in such contemporary films as John Madden's <i>Shakespeare in Love</i> (q.v.) and Bollywood adaptations of <i>Much Ado about Nothing</i>",
				"libraryCatalog": "World Shakespeare Bibliography Online",
				"shortTitle": "Unhistorical Shakespeare"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.worldshakesbib.org/search?rid=10156&words=",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "A. Luis",
						"lastName": "Pujante",
						"creatorType": "author"
					},
					{
						"firstName": "Miguel Angel",
						"lastName": "Centenero",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"songs",
					"semantics",
					"music",
					"metrics",
					"rhythm",
					"Schlegel, A. W. von"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "Las canciones de Shakespeare en las traducciones alemanas de A. W. Schlegel",
				"pages": "93-106",
				"publicationTitle": "Cuadernos de filología inglesa",
				"volume": "4",
				"language": "Spanish",
				"archiveLocation": "10.35.30  General Shakespeareana; Language, Linguistics, Philology; Translation",
				"callNumber": "bi950",
				"date": "1995",
				"abstractNote": "Finds that A. W. von Schlegel's translations of the songs in Shakespeare (which \"combine a high degree of semantic fidelity to the text with a perfect adjustment to the original tunes\") are an exception to the tendency of translators to ignore their musical dimension. Concludes that although Schlegel did not know the tunes, his synchronization of metrical stress with musical beat results from his reading of the lines rhythmically. English summary, 93",
				"libraryCatalog": "World Shakespeare Bibliography Online"
			}
		]
	}
];
/** END TEST CASES **/
