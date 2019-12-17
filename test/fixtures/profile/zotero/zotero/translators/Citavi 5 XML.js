{
	"translatorID": "e7243cef-a709-4a46-ba46-1b1318051bec",
	"label": "Citavi 5 XML",
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
	"browserSupport": "gcsi",
	"lastUpdated": "2018-08-26 10:46:17"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2016 Philipp Zumstein
	
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


/*
TEST DATA can be found here:
 - Single reference (162 KB) text: https://gist.github.com/zuphilip/02d6478ace4636e4e090e348443c551e
 - Larger project (1221 KB): https://gist.github.com/zuphilip/76ce89ebbdac0386507b36cff3fd499a
 - Other project (1,11 MB): https://gist.github.com/anonymous/10fc363b6d79dae897e296a4327aa707
 - Citavi 6 project (935 KB): https://gist.github.com/zuphilip/00a4ec6df58ac24b68366e32531bae4b
*/


function detectImport() {
	var text = Zotero.read(1000);
	return text.indexOf("<CitaviExchangeData") != -1;
}

//This maps the Citavi types to the Zotero types.
//https://www.citavi.com/sub/manual5/en/referencetypeselectiondialog.html
var typeMapping = {
	"ArchiveMaterial" : "manuscript", //Archivgut
	"AudioBook" : "book", //Hörbuch
	"AudioOrVideoDocument" : "document", //Ton- oder Filmdokument
	"Book" : "book", //Buch (Monographie)
	"BookEdited" : "book", //Buch (Sammelwerk)
	"Broadcast" : "tvBroadcast", //Radio- oder Fernsehsendung
	"CollectedWorks" : "book", //Schriften eines Autors
	"ComputerProgram" : "computerProgram", //Software
	"ConferenceProceedings" : "book", //Tagungsband
	"Contribution" : "bookSection", //Beitrag in ...
	"ContributionInLegalCommentary" : "bookSection", //Beitrag in Gesetzeskommentar
	"CourtDecision" : "case", //Gerichtsentscheid
	"File" : "manuscript", //Akte
	"InternetDocument" : "webpage", //Internetdokument
	"InterviewMaterial" : "interview", //Interviewmaterial
	"JournalArticle" : "journalArticle", //Zeitschriftenaufsatz
	"Lecture" : "presentation", //Vortrag
	"LegalCommentary" : "book", //Gesetzeskommentar
	"Manuscript" : "manuscript", //Manuskript
	"Map" : "map", //Geographische Karte
	"Movie" : "videoRecording", //Spielfilm
	"MusicTrack" : "audioRecording", //Musiktitel in ...
	"MusicAlbum" : "audioRecording", //Musikwerk / Musikalbum
	"NewsAgencyReport" : "report", //Agenturmeldung
	"NewspaperArticle" : "newspaperArticle", //Zeitungsartikel
	"Patent" : "patent", //Patentschrift
	"PersonalCommunication" : "email", //Persönliche Mitteilung
	"PressRelease" : "report", //Pressemitteilung
	"RadioPlay" : "podcast", //Hörspiel
	"SpecialIssue" : "book", //Sonderheft, Beiheft
	"Standard" : "report", //Norm
	"StatuteOrRegulation" : "statute", //Gesetz / Verordnung
	"Thesis" : "thesis", //Hochschulschrift
	"Unknown" : "document", //Unklarer Dokumententyp
	"UnpublishedWork" : "report" //Graue Literatur / Bericht / Report
};


function doImport() {
	var doc = Zotero.getXML();
	var citaviVersion = ZU.xpathText(doc, '//CitaviExchangeData/@Version');
	
	//Groups will also be mapped to tags which can be assigned to
	//items or notes.
	var groups = ZU.xpath(doc, '//Groups/Group');
	var rememberTags = {};
	for (var i=0; i<groups.length; i++) {
		var id = ZU.xpathText(groups[i], './@id');
		var name = ZU.xpathText(groups[i], './Name');
		var referenceGroups = ZU.xpath(doc, '//ReferenceGroups/OnetoN[contains(text(), "'+id+'")]|//KnowledgeItemGroups/OnetoN[contains(text(), "'+id+'")]');
		for (var j=0; j<referenceGroups.length; j++) {
			var refid = referenceGroups[j].textContent.split(';')[0];
			if (rememberTags[refid]) {
				rememberTags[refid].push(name);
			} else {
				rememberTags[refid] = [name];
			}
		}
	}
	
	//Main information for each reference.
	var item;
	var references = ZU.xpath(doc, '//References/Reference');
	var unfinishedReferences = [];
	var itemIdList = {};
	for (var i=0, n=references.length; i<n; i++) {
		var type = ZU.xpathText(references[i], 'ReferenceType');
		if (type && typeMapping[type]) {
			item = new Zotero.Item(typeMapping[type]);
		} else {
			Z.debug("Not yet supported type: " + type);
			Z.debug("Therefore use default type 'journalArticle'");
			item = new Zotero.Item("journalArticle");
		}
		item.itemID = ZU.xpathText(references[i], './@id');
		item.type = type;
		//Z.debug(item.itemID);
		
		item.title = ZU.xpathText(references[i], './Title');
		var subtitle = ZU.xpathText(references[i], './Subtitle');
		if (subtitle) {
			item.title += ": " + subtitle;
		}
		item.abstractNote = ZU.xpathText(references[i], './Abstract');
		item.url = ZU.xpathText(references[i], './OnlineAddress');
		item.volume = ZU.xpathText(references[i], './Volume');
		item.issue = ZU.xpathText(references[i], './Number');
		item.DOI = ZU.xpathText(references[i], './DOI');
		item.ISBN = ZU.xpathText(references[i], './ISBN');
		item.edition = ZU.xpathText(references[i], './Edition');
		item.place = ZU.xpathText(references[i], './PlaceOfPublication');
		item.numberOfVolumes = ZU.xpathText(references[i], './NumberOfVolumes');
		
		addExtraLine(item, "PMID", ZU.xpathText(references[i], './PubMedID'));
		
		item.pages = extractPages(ZU.xpathText(references[i], './PageRange'));
		item.numPages = extractPages(ZU.xpathText(references[i], './PageCount'));
		
		item.date = ZU.xpathText(references[i], './DateForSorting') ||
			ZU.xpathText(references[i], './Date') ||
			ZU.xpathText(references[i], './Year');
		item.accessDate = ZU.xpathText(references[i], './AccessDate');
		
		for (var field of ['Notes', 'TableOfContents', 'Evaluation']) {
			var note = ZU.xpathText(references[i], './'+field);
			if (note) {
				item.notes.push({ note : note , tags : ["#" + field] });
			}
		}
		
		var seriesID = ZU.xpathText(references[i], './SeriesTitleID');
		if (seriesID) {
			item.series = ZU.xpathText(doc.getElementById(seriesID), './Name');
		}
		
		var periodicalID = ZU.xpathText(references[i], './PeriodicalID');
		if (periodicalID) {
			var periodical = doc.getElementById(periodicalID);
			item.publicationTitle = ZU.xpathText(periodical, './Name');
			item.ISSN = ZU.xpathText(periodical, './ISSN');
			item.journalAbbreviation = ZU.xpathText(periodical, './StandardAbbreviation') ||
				ZU.xpathText(periodical, './UserAbbreviation1') ||
				ZU.xpathText(periodical, './UserAbbreviation2');
		}
		
		var authors = ZU.xpathText(doc, '//ReferenceAuthors/OnetoN[starts-with(text(), "'+item.itemID+'")]');
		attachPersons(doc, item, authors, "author");
		var editors = ZU.xpathText(doc, '//ReferenceEditors/OnetoN[starts-with(text(), "'+item.itemID+'")]');
		attachPersons(doc, item, editors, "editor");
		var collaborators = ZU.xpathText(doc, '//ReferenceCollaborators/OnetoN[starts-with(text(), "'+item.itemID+'")]');
		attachPersons(doc, item, collaborators, "contributor");
		var organizations = ZU.xpathText(doc, '//ReferenceOrganizations/OnetoN[starts-with(text(), "'+item.itemID+'")]');
		attachPersons(doc, item, organizations, "contributor");
		
		var publishers = ZU.xpathText(doc, '//ReferencePublishers/OnetoN[starts-with(text(), "'+item.itemID+'")]');
		if (publishers && publishers.length>0) {
			item.publisher = attachName(doc, publishers).join('; ');
		}
		
		var keywords = ZU.xpathText(doc, '//ReferenceKeywords/OnetoN[starts-with(text(), "'+item.itemID+'")]');
		if (keywords && keywords.length>0) {
			item.tags = attachName(doc, keywords);
		}
		if (rememberTags[item.itemID]) {
			for (var j=0; j<rememberTags[item.itemID].length; j++) {
				item.tags.push(rememberTags[item.itemID][j]);
			}
		}
		
		//For all corresponding knowledge items attach a note containing
		//the information of it.
		var citations = ZU.xpath(doc, '//KnowledgeItem[ReferenceID="'+item.itemID+'"]');
		for (var j=0; j<citations.length; j++) {
			var noteObject = {};
			noteObject.id = ZU.xpathText(citations[j], '@id');
			var title = ZU.xpathText(citations[j], 'CoreStatement');
			var text = ZU.xpathText(citations[j], 'Text');
			var pages = extractPages(ZU.xpathText(citations[j], 'PageRange'));
			noteObject.note = '';
			if (title) {
				noteObject.note += '<h1>' + title + "</h1>\n";
			}
			if (text) { 
				noteObject.note += "<p>" + ZU.xpathText(citations[j], 'Text') + "</p>\n";
			}
			if (pages) {
				noteObject.note += "<i>" + pages + "</i>";
			}
			if (rememberTags[noteObject.id]) {
				noteObject.tags = rememberTags[noteObject.id];
			}
			if (noteObject.note != "") {
				item.notes.push(noteObject);
			}
		}
		
		//Locations will be saved as URIs in attachments, DOI, extra etc.
		var locations = ZU.xpath(doc, '//Locations/Location[ReferenceID="'+item.itemID+'"]');
		//If we only have partial information about the callnumber or
		//library location, then we save this info in these two arrays
		//which will then processed after the for loop if no other info
		//was found.
		var onlyLibraryInfo = [];
		var onlyCallNumber = [];
		for (var j=0; j<locations.length; j++) {
			var address = ZU.xpathText(locations[j], 'Address');
			if (address && citaviVersion[0] !== "5") {
				var jsonAddress = JSON.parse(address);
				// Z.debug(jsonAddress);
				address = jsonAddress["UriString"];
			}
			var addressType = ZU.xpathText(locations[j], 'MirrorsReferencePropertyId');
			if (address) {
				if (addressType == "Doi" && !item.DOI) {
					item.DOI = address;
				} else if (addressType == "PubMedId" && ((item.extra && !item.extra.includes("PMID"))|| !item.extra)) {
					addExtraLine(item, "PMID", address);
				} else {
					// distinguish between local paths and internet addresses
					// (maybe also encoded in AddressInfo subfield?)
					if (address.indexOf('http://')==0 || address.indexOf('https://')==0) {
						item.attachments.push({
							url: address,
							title: "Online"
						});
					} else {
						item.attachments.push({
							path: address,
							title: "Full Text"
						});
					}
				}
			}
			var callNumber = ZU.xpathText(locations[j], 'CallNumber');
			var libraryId = ZU.xpathText(locations[j], 'LibraryID');
			if (callNumber && libraryId) {
				item.callNumber = callNumber;
				item.libraryCatalog = ZU.xpathText(doc.getElementById(libraryId), "Name");
			} else if (callNumber) {
				onlyCallNumber.push(callNumber);
			} else if (libraryId) {
				onlyLibraryInfo.push(ZU.xpathText(doc.getElementById(libraryId), "Name"));
			}
		}
		if (!item.callNumber) {
			if (onlyCallNumber.length>0) {
				item.callNumber = onlyCallNumber[0];
			} else if (onlyLibraryInfo.length>0) {
				item.libraryCatalog = onlyLibraryInfo[0];
			}
		}
		
		//Only for journalArticle and conferencePaper the DOI field is
		//currently established and therefore we need to add the info for
		//all other itemTypes in the extra field.
		if (item.DOI && item.itemType != "journalArticle" && item.itemType != "conferencePaper") {
			addExtraLine(item, "DOI", item.DOI);
		}
		
		//The items of type contribution need more data from their container
		//element and are therefore not yet finished. The other items can
		//be completed here.
		itemIdList[item.itemID] = item;
		if (type == "Contribution") {
			unfinishedReferences.push(item);
		} else {
			item.complete();
		}
	}
	
	
	//For unfinished references we add additional data from the
	//container item and save the relation between them as well.
	for (var i=0; i< unfinishedReferences.length; i++) {
		var item = unfinishedReferences[i];
		var containerString = ZU.xpathText(doc, '//ReferenceReferences/OnetoN[contains(text(), "'+item.itemID+'")]');
		if (containerString) {
			var containerId = containerString.split(';')[0];
			var containerItem = itemIdList[containerId];
			if (containerItem.type == "ConferenceProceedings") {
				item.itemType = "conferencePaper";
			}
			item.publicationTitle = containerItem.title;
			item.place = containerItem.place;
			item.publisher = containerItem.publisher;
			item.ISBN = containerItem.ISBN;
			item.volume = containerItem.volume;
			item.edition = containerItem.edition;
			item.series = containerItem.series;

			for (var j=0; j<containerItem.creators.length; j++) {
				var creatorObject = containerItem.creators[j];
				var role = creatorObject.creatorType;
				if (role == "author") {
					creatorObject.creatorType = "bookAuthor";
				}
				item.creators.push(creatorObject);
			}
			
			item.seeAlso.push(containerItem.itemID);
			
		}
		item.complete();
	}
	
	//Categories will be mapped to collections where the name contains
	//also the hierarchy number which we first calculate from the
	//CategoryCategories list.
	var categories = ZU.xpath(doc, '//Categories/Category');
	//typo CategoryCatgories was fixed in Citavi 6
	var hierarchy = ZU.xpath(doc, '//CategoryCatgories/OnetoN|//CategoryCategories/OnetoN');
	var numbering = { "00000000-0000-0000-0000-000000000000" : "$" };
	//we will have fixed prefix "$." for all collections (see below),
	//such that only the substring starting form index 2 is relevant.
	for (var i=0, n=hierarchy.length; i<n; i++) {
		var categoryLists = hierarchy[i].textContent.split(";");
		var referencePoint = categoryLists[0];
		if (!numbering[referencePoint]) {
			//in some cases the ordering of these relations is different
			Z.debug("Warning: Reference point for categorization hierarchy not yet found");
			Z.debug(categoryLists);
			continue;
		}
		for (var j=1; j<categoryLists.length; j++) {
			numbering[categoryLists[j]] = numbering[referencePoint] + "." + j;
		}
	}
	var collectionList = [];
	for (var i=0, n=categories.length; i<n; i++) {
		var collection = new Zotero.Collection();
		collection.id = ZU.xpathText(categories[i], './@id');
		collection.name = ZU.xpathText(categories[i], './Name');
		if (numbering[collection.id]) {
			//add the hierarchy number whenever possible
			collection.name = numbering[collection.id].substr(2) + ' ' + collection.name;
		}
		collection.type = 'collection';
		collection.children = [];
		var referenceCategories = ZU.xpath(doc, '//ReferenceCategories/OnetoN[contains(text(), "'+collection.id+'")]');
		for (var j=0; j<referenceCategories.length; j++) {
			var refid = referenceCategories[j].textContent.split(';')[0];
			collection.children.push({ type: 'item', id: refid });
		}
		collectionList.push(collection);
		collection.complete();
	}
	
	
	//Task items will be mapped to new standalone note
	var tasks = ZU.xpath(doc, '//TaskItems/TaskItem');
	for (var i=0, n=tasks.length; i<n; i++) {
		item = new Zotero.Item("note");
		
		var dueDate = ZU.xpathText(tasks[i], './DueDate');
		if (dueDate) {
			item.note = "<h1>" + ZU.xpathText(tasks[i], './Name') + " until " + dueDate + "</h1>";
		} else {
			item.note = "<h1>" + ZU.xpathText(tasks[i], './Name') + "</h1>";
		}
		var noteText = ZU.xpathText(tasks[i], './Notes');
		if (noteText) {
			item.note += "\n" + noteText;
		}
		
		item.seeAlso.push(ZU.xpathText(tasks[i], './ReferenceID'));
		
		item.tags.push("#todo");
		item.complete();
	}
	
	
}

function attachName(doc, ids) {
	if (!ids || !ids.length || ids.length<=0) {
		return ;
	}
	var valueList = [];
	var idList = ids.split(';');
	//skip the first element which is the id of reference
	for (var j=1; j<idList.length; j++) {
		var author = doc.getElementById(idList[j]);
		valueList.push(ZU.xpathText(author, 'Name'));
	}
	return valueList;
}

//For each id in the list of ids, find the 
//corresponding node in the document and 
//attach the data to the creators array.
function attachPersons(doc, item, ids, type) {
	if (!ids || !ids.length || ids.length<=0) {
		return ;
	}
	var authorIds = ids.split(';');
	//skip the first element which is the id of reference
	for (var j=1; j<authorIds.length; j++) {
		var author = doc.getElementById(authorIds[j]);
		var lastName = ZU.xpathText(author, 'LastName');
		var firstName = ZU.xpathText(author, 'FirstName');
		var middleName = ZU.xpathText(author, 'MiddleName');
		if (firstName && lastName) {
			if (middleName) {
				firstName += ' ' + middleName;
			}
			item.creators.push({ lastName : lastName, firstName : firstName, creatorType : type });
		}
		if (!firstName && lastName) {
			item.creators.push({ lastName : lastName, creatorType : type , fieldMode : true});
		}
	}
	
}

function addExtraLine(item, prefix, text) {
	if (text) {
		if (!item.extra) {
			item.extra = '';
		}
		item.extra += prefix + ': ' + text + "\n"; 
	}
}

function extractPages(multilineText) {
	if (multilineText) {
		var parts = multilineText.split("\n");
		return parts[parts.length-1].replace(/[^0-9\-–]/g, '');
	}
}/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/
