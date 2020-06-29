{
	"translatorID": "3f50aaac-7acc-4350-acd0-59cb77faf620",
	"translatorType": 2,
	"label": "Wikipedia Citation Templates",
	"creator": "Simon Kornblith",
	"target": "txt",
	"minVersion": "1.0.0b4.r1",
	"maxVersion": "",
	"priority": 100,
	"displayOptions": {
		"exportCharset": "UTF-8"
	},
	"inRepository": true,
	"lastUpdated": "2017-03-13 11:45:52"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017-2019 Simon Kornblith
	
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

var fieldMap = {
	edition:"edition",
	publisher:"publisher",
	doi:"DOI",
	isbn:"ISBN",
	issn:"ISSN",
	conference:"conferenceName",
	volume:"volume",
	issue:"issue",
	pages:"pages",
	number:"episodeNumber"
};

var typeMap = {
	book:"Cite book",
	bookSection:"Cite book",
	journalArticle:"Cite journal",
	magazineArticle:"Cite news",
	newspaperArticle:"Cite news",
	thesis:"Cite paper",
	letter:"Cite",
	manuscript:"Cite book",
	interview:"Cite interview",
	film:"Cite AV media",
	artwork:"Cite",
	webpage:"Cite web",
	report:"Cite conference",
	bill:"Cite",
	hearing:"Cite",
	patent:"Cite",
	statute:"Cite",
	email:"Cite email",
	map:"Cite",
	blogPost:"Cite web",
	instantMessage:"Cite",
	forumPost:"Cite web",
	audioRecording:"Cite",
	presentation:"Cite paper",
	videoRecording:"Cite AV media",
	tvBroadcast:"Cite episode",
	radioBroadcast:"Cite episode",
	podcast:"Cite podcast",
	computerProgram:"Cite",
	conferencePaper:"Cite conference",
	document:"Cite",
	encyclopediaArticle:"Cite encyclopedia",
	dictionaryEntry:"Cite encyclopedia"
};

function formatAuthors(authors, useTypes) {
	var text = "";
	for (var i=0; i<authors.length; i++) {
		var author = authors[i];
		text += ", "+author.firstName;
		if (author.firstName && author.lastName) text += " ";
		text += author.lastName;
		if (useTypes) text += " ("+Zotero.Utilities.getLocalizedCreatorType(author.creatorType)+")";
	}
	return text.substr(2);
}

function formatFirstAuthor(authors, useTypes) {	
	var firstCreator = authors.shift();
	var field = firstCreator.lastName;
	if (firstCreator.lastName && firstCreator.firstName) field += ", ";
	field += firstCreator.firstName;
	if (useTypes) field += " ("+Zotero.Utilities.getLocalizedCreatorType(firstCreator.creatorType)+")";
	return field;
}

function formatDate(date) {
	var date = date.substr(0, date.indexOf(" "));
	if (date.substr(4, 3) == "-00") {
		date = date.substr(0, 4);
	} else if (date.substr(7, 3) == "-00") {
		date = date.substr(0, 7);
	}
	return date;
}

function doExport() {
	var first = true;
	let item;
	while (item = Zotero.nextItem()) {
		// determine type
		var type = typeMap[item.itemType];
		if (!type) type = "Cite";
		
		var properties = new Object();
		
		for (var wikiField in fieldMap) {
			var zoteroField = fieldMap[wikiField];
			if (item[zoteroField]) properties[wikiField] = item[zoteroField];
		}
		
		if (item.creators && item.creators.length) {
			if (type == "Cite episode") {
				// now add additional creators
				properties.credits = formatAuthors(item.creators, true);
			} else if (type == "Cite AV media") {
				properties.people = "";
				
				// make first creator first, last
				properties.people = formatFirstAuthor(item.creators, true);
				// now add additional creators
				if (item.creators.length) properties.people += ", "+formatAuthors(item.creators, true);
				
				// use type
				if (item.type) {
					properties.medium = item.type;
				}
			} else if (type == "Cite email") {
				// get rid of non-authors
				for (var i=0; i<item.creators.length; i++) {
					if (item.creators[i].creatorType != "author") {
						// drop contributors
						item.creators.splice(i--, 1);
					}
				}
				
				// make first authors first, last
				properties.author = formatFirstAuthor(item.creators);
				// add supplemental authors
				if (item.creators.length) {
					properties.author += ", "+formatAuthors(item.creators);
				}
			} else if (type == "Cite interview") {
				// check for an interviewer or translator
				var interviewers = [];
				var translators = [];
				for (var i=0; i<item.creators.length; i++) {
					if (item.creators[i].creatorType == "translator") {
						translators.push(item.creators.splice(i--,1)[0]);
					} else if (item.creators[i].creatorType == "interviewer") {
						interviewers.push(item.creators.splice(i--,1)[0]);
					} else if (item.creators[i].creatorType == "contributor") {
						// drop contributors
						item.creators.splice(i--,1);
					}
				}
				
				// interviewers
				if (interviewers.length) {
					properties.interviewer = formatAuthors([interviewers.shift()]);
					if (interviewers.length) properties.cointerviewers = formatAuthors(interviewers);
				}
				// translators
				if (translators.length) {
					properties.cointerviewers = (properties.cointerviewers ? properties.cointerviewers+", " : "");
					properties.cointerviewers += formatAuthors(translators);
				}
				// interviewees
				if (item.creators.length) {
					// take up to 4 interviewees
					var i = 1;
					let interviewee;
					while ((interviewee = item.creators.shift()) && i <= 4) {
						var lastKey = "last";
						var firstKey = "first";
						if (i != 1) {
							lastKey += i;
							firstKey += i;
						}
						
						properties[lastKey] = interviewee.lastName;
						properties[firstKey] = interviewee.firstName;
					}
				}
				// medium
				if (item.medium) {
					properties.type = item.medium;
				}
			} else {
				// check for an editor or translator
				var editors = [];
				var translators = [];
				for (var i=0; i < item.creators.length; i++) {
					var creator = item.creators[i];
					if (creator.creatorType == "translator") {
						translators.push(item.creators.splice(i--,1)[0]);
					} else if (creator.creatorType == "editor") {
						editors.push(item.creators.splice(i--,1)[0]);
					} else if (creator.creatorType == "contributor") {
						// drop contributors
						item.creators.splice(i--, 1);
					}
				}
				
				// editors
				var others = "";
				if (editors.length) {
					var editorText = formatAuthors(editors)+(editors.length == 1 ? " (ed.)" : " (eds.)");
					if (item.itemType == "bookSection" || type == "Cite conference" || type == "Cite encyclopedia") {
						// as per docs, use editor only for chapters
						properties.editors = editorText;
					} else {
						others = editorText;
					}
				}
				// translators
				if (translators.length) {
					if (others) others += ", ";
					others += formatAuthors(translators)+" (trans.)";
				}
				
				// We need to be certain that these come out in the right order, so
				// deal with it when actually writing output
				if (item.creators.length) {
					properties.authors = item.creators.map(function(c) {
						return {
							last: c.lastName,
							first: c.firstName
						};
					});
				}
				
				// attach others
				if (others) {
					properties.others = others;
				}
			}
		}
		
		if (item.itemType == "bookSection") {
			properties.title = item.publicationTitle;
			properties.chapter = item.title;;
		} else {
			properties.title = item.title;
			
			if (type == "Cite journal") {
				properties.journal = item.publicationTitle;
			} else if (type == "Cite conference") {
				properties.booktitle = item.publicationTitle;
			} else if (type == "Cite encyclopedia") {
				properties.encyclopedia = item.publicationTitle;
			} else {
				properties.work = item.publicationTitle;
			}
		}
		
		if (type == "Cite web" && item.type) {
			properties.format = item.type;
		}
		
		if (item.place) {
			if (type == "Cite episode") {
				properties.city = item.place;
			} else {
				properties.location = item.place;
			}
		}
		
		if (item.series) {
			properties.series = item.series;
		} else if (item.seriesTitle) {
			properties.series = item.seriesTitle;
		} else if (item.seriesText) {
			properties.series = item.seriesText;
		}
		
		// Don't include access date for journals with no URL
		if (item.accessDate && !(item.itemType == 'journalArticle' && !item.url)) {
			properties.accessdate = formatDate(item.accessDate);
		}
		
		if (item.date) {
			if (type == "Cite email") {
				properties.senddate = formatDate(item.date);
			} else {
				var date = Zotero.Utilities.strToDate(item.date);
				if (date["year"] != undefined) {
					var mm = "00";
					if (date.month !== undefined) {
						mm = date["month"];
						mm = ZU.lpad(mm + 1, '0', 2);
					}
					
					var dd = "00";
					if (date["day"] !== undefined) {
						dd = ZU.lpad(date.day, '0', 2);
					}
					
					var yyyy = ZU.lpad(date.year.toString(), '0', 4);
					var date = formatDate(yyyy + '-' + mm + '-' + dd + ' ');
					
					if (type == "Cite email") {
						properties.senddate = date;
					} else {
						properties.date = date;
					}
				}
			}
		}
		
		if (item.runningTime) {
			if (type == "Cite episode") {
				properties.minutes = item.runningTime;
			} else {
				properties.time = item.runningTime;
			}
		}
		
		if (item.url && item.accessDate) {
			if (item.itemType == "bookSection") {
				properties.chapterurl = item.url;
			} else {
				properties.url = item.url;
			}
		}
		
		if (properties.pages) {
			properties.pages = properties.pages.replace(/[^0-9]+/,"–"); // separate page numbers with en dash
		}
		
		if (item.extra) {
			// automatically fill in PMCID, PMID, and JSTOR fields
			var extraFields={
				pmid: /^PMID\s*\:\s*([0-9]+)/m,
				pmc: /^PMCID\s*\:\s*((?:PMC)?[0-9]+)/m
			};
			
			for (var f in extraFields){
				var match = item.extra.match(extraFields[f]);
				if (match) properties[f] = match[1];
			}
		}
		
		if (item.url) {
			//try to extract missing fields from URL
			var libraryURLs={ 
				pmid:/www\.ncbi\.nlm\.nih\.gov\/pubmed\/([0-9]+)/i,
				pmc:/www\.ncbi\.nlm\.nih\.gov\/pmc\/articles\/((?:PMC)?[0-9]+)/i,
				jstor:/www\.jstor\.org\/stable\/([^?#]+)/i
			};
			
			for (var f in libraryURLs){
				if (properties[f]) continue; //don't overwrite from extra field
				var match = item.url.match(libraryURLs[f]);
				if (match) properties[f] = match[1];
			}
		}
		
		// write out properties
		Zotero.write((first ? "" : "\r\n") + "{{"+type);
		for (var key in properties) {
			if (!properties[key]) continue;
			
			if (key == 'authors') {
				var index = properties.authors.length > 1;
				for (var i=0; i<properties.authors.length; i++) {
					Zotero.write('| last' + (i|| index ? i+1 : '') + ' = ' + properties.authors[i].last);
					if (properties.authors[i].first) {
						Zotero.write('| first' + (i || index ? i+1 : '') + ' = ' + properties.authors[i].first);
					}
				}
			} else {
				Zotero.write("| "+key+" = "+ escapeWiki(properties[key]));
			}
		}
		Zotero.write("}}");
		
		first = false;
	}
}

function escapeWiki(markup) {
	return markup.replace('|', '{{!}}');
}
