{
	"translatorID": "20e87da1-e1c9-410d-b400-a1c27272ae19",
	"label": "Intellixir",
	"creator": "Maxime Escourbiac",
	"target": "/intellixir/(afficheliste\\.aspx|liste_articles\\.aspx)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2017-01-01 16:54:26"
}

/**
 * Licensed to Intellixir under one
 * or more contributor license agreements. Intellixir licenses this
 * file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var debug = 0;

/**
 * Determine the type of documents imported
 */
function detectWeb(doc,url) {
	return "document";
}

/**
 * Collect the data from Intellixir web pages
 *
 */
function doWeb(doc, url) {
  if (detectWeb(doc,url) == "document"){
  	/* Collect columns name */ 
  	var columnNames = collectColumnTitle(doc);
  	/* Collect all the documents */
  	var lines = collectDocuments(doc,"tdoff").concat(collectDocuments(doc,"tdoff2"));
  	/* Treatment of the lines */
  	var documents = documentsTreatment(columnNames,lines,doc);
  	/* Save the document */
  	saveDocuments(documents);
  }
}

/**
 * Collect the name of the column for an automatic treatment
 * 
 */
function collectColumnTitle(doc){
	var columnNames = new Array();
	var titles = doc.evaluate('//table[@id="TAB_PAGE"]//tbody//tr[1]//th', doc, null, XPathResult.ANY_TYPE, null);
	var title;
	while (title = titles.iterateNext()) {
		columnNames.push(title.textContent.trim());
	}
	if (debug == 1){
		Zotero.debug("------collectColumnTitle------")
		for (var i = 0; i < columnNames.length;++i){
			Zotero.debug("Column[" + i + "] : " + columnNames[i]);
		}
	}
	return columnNames;
}

/**
 * Collect documents
 * 
 */
function collectDocuments(doc,className){
	var linesCollected = new Array();
	var lines = doc.evaluate('//table[@id="TAB_PAGE"]//tbody//tr[@class="' + className + '"]', doc, null, XPathResult.ANY_TYPE, null);
	var line;
	while (line = lines.iterateNext()) {
		linesCollected.push(line);
	}
	if (debug == 1){
		Zotero.debug("------collectDocuments class='" + className + "' ------")
		for (var i = 0; i < linesCollected.length;++i){
			Zotero.debug("Line[" + i + "] : " + linesCollected[i]);
		}
	}
	return linesCollected;
}

/**
 * Parse all the document
 * 
 */
function documentsTreatment(titles,lines,doc){
	var documents = new Array();
	var typeColumn = titles.indexOf("Type");
	if (typeColumn != -1){
		for (var i = 0; i < lines.length ; ++i){
			documents.push(documentTreatment(lines[i],titles,typeColumn,doc));
		}
	}
	if (debug == 1){
		Zotero.debug("------ Documents Treatment ------")
		for (var i = 0; i < documents.length;++i){
			Zotero.debug("documents [" + i + "] : " + documents[i].title);
		}
	}
	return documents;
}

/**
 * Parse a document
 * 
 */
function documentTreatment(line,titles,typeColumn,doc){
	var document;
 	var elements = doc.evaluate('.//td', line, null, XPathResult.ANY_TYPE, null);
 	
 	/* Convert XPathResult into an array */
 	var values = new Array()
 	var element;
 	while (element = elements.iterateNext()) {
		values.push(element);
	}
	
	/* Parsing values*/
 	if (values[typeColumn].textContent == "Article"){
 		document = new Zotero.Item("journalArticle");
 		for (var i=0; i<titles.length; ++i ){
 			switch (titles[i]){
 				case "Titre":
 				case "Title":
 					/*Collecting the authors*/
 					var authors = doc.evaluate('.//i', values[i], null, XPathResult.ANY_TYPE, null).iterateNext();
 					if (authors){
 						var authorslist = authors.textContent.split(",");
 						for (var elt in authorslist) {
							document.creators.push(Zotero.Utilities.cleanAuthor(authorslist[elt], "author"));
						}
 					}
 					/*Collecting the title*/
 					var title = doc.evaluate('.//b', values[i], null, XPathResult.ANY_TYPE, null).iterateNext();
 					if (title){ /* If the title is contained in a <b> balise ==> Abstract is include in the web-page */
 						document.title = title.textContent;
 						/*Collecting the abstract*/
 						document.abstractNote = values[i].textContent.replace(title.textContent,"");
 						if (authors){
 							document.abstractNote = document.abstractNote.replace(authors.textContent,"");
 						}
 					} else {
 						document.title = values[i].textContent;
 						if (authors){
 							document.title = document.title.replace(authors.textContent,"");
 						}
 					}
 				break;
 				case "Date":
 					document.date = values[i].textContent;
 				break;
 				case "Source":
 					document.publicationTitle = values[i].textContent;
 				break;
 				case "ISSN":
 					document.ISSN = values[i].textContent;
 				break;
 				case "DOI":
 					document.DOI = values[i].textContent;
 				break;
 			}
 		}
 		if (debug == 1){
			Zotero.debug("------ Display Article ------");
			Zotero.debug("Titre : " + document.title);
			Zotero.debug("Auteurs : " + document.creators);
			Zotero.debug("Date : " + document.date);
			Zotero.debug("Source : " + document.publicationTitle);
			Zotero.debug("ISSN : " + document.ISSN);
			Zotero.debug("DOI : " + document.DOI);
			Zotero.debug("Abstract : " + document.abstractNote);
			
		}
 	} else {
 		document = new Zotero.Item("patent");
 		var i;
 		for (i=0; i<titles.length; ++i ){
 			switch (titles[i]){
 				case "Titre":
 				case "Title":
 					/*Collecting the authors*/
 					var authors = doc.evaluate('.//i', values[i], null, XPathResult.ANY_TYPE, null).iterateNext();
 					if (authors){
 						var authorslist = authors.textContent.split(",");
 						for (var elt in authorslist) {
							document.creators.push(Zotero.Utilities.cleanAuthor(authorslist[elt], "author"));
						}
 					}
 					/*Collecting the title*/
 					var title = doc.evaluate('.//b', values[i], null, XPathResult.ANY_TYPE, null).iterateNext();
 					if (title){ /* If the title is contained in a <b> balise ==> Abstract is include in the web-page */
 						document.title = title.textContent;
 						/*Collecting the abstract*/
 						document.abstractNote = values[i].textContent.replace(title.textContent,"");
 						if (authors){
 							document.abstractNote = document.abstractNote.replace(authors.textContent,"");
 						}
 					} else {
 						document.title = values[i].textContent;
 						if (authors){
 							document.title = document.title.replace(authors.textContent,"");
 						}
 					}
 					/*Split the patent number from the title*/
 					if (document.title[document.title.length - 1] == ')'){
 						var titleElmnts = document.title.split("(");
 						var patentNumber = titleElmnts[titleElmnts.length - 1]
 						/* Deleting patent Number information from the title. */
 						document.title = document.title.replace("(" + patentNumber,"");
 						/* Insert Patent number */
 						document.patentNumber = patentNumber.replace(")","").split(",")[0];
 					}
 				break;
 				case "Date":
 					document.date = values[i].textContent;
 				break;
 				case "Affiliations Courtes":
 				case "Short Affiliations":
 					document.assignee = values[i].textContent;
 				break;
 				case "Numéro de priorité":
 				case "Priority number":
 					document.priorityNumbers = values[i].textContent;
 				break;
 			}
 		}
 		if (debug == 1){
			Zotero.debug("------ Display Patent ------");
			Zotero.debug("Titre : " + document.title);
			Zotero.debug("Numéro de brevet : " + document.patentNumber);
			Zotero.debug("Auteurs : " + document.creators);
			Zotero.debug("Date : " + document.date);
			Zotero.debug("Affiliations Courtes : " + document.assignee);
			Zotero.debug("Numéro de priorité : " + document.priorityNumbers);
		}
 	}
 	return document;
 }
 
 /**
  * Save the documents
  * 
  */
 function saveDocuments(documents){
 	for (var i = 0; i < documents.length; ++i) {	
		documents[i].complete();
	}
 }