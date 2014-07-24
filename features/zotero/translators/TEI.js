{
	"translatorID": "032ae9b7-ab90-9205-a479-baf81f49184a",
	"translatorType": 2,
	"label": "TEI",
	"creator": "Stefan Majewski",
	"target": "xml",
	"minVersion": "2.1b3",
	"maxVersion": null,
	"priority": 25,
	"inRepository": true,
	"configOptions": {
		"dataMode": "xml/dom",
		"getCollections": "true"
	},
	"displayOptions": {
		"exportNotes": false,
		"Export Tags": false,
		"Generate XML IDs": true,
		"Full TEI Document": false,
		"Export Collections": false
	},
	"lastUpdated": "2014-05-23 16:00:00"
}

// ********************************************************************
//
// tei-zotero-translator. Zotero 2 to TEI P5 exporter.
//
// Copyright (C) 2010 Stefan Majewski <xml@stefanmajewski.eu>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.


// *********************************************************************
//
// This script does fairly well with papers, theses, websites and
// books.  Some item properties, important for the more exotic
// publication types, are still missing. That means, the first 30 are
// implemented, the rest may be added when I need them. If you like to
// see some particular item property and you also have a basic idea
// how to represent them in TEI (without breaking the, to me, more
// important ones), please contact me or send a patch.
//
// <analytic> vs <monogr> Both elements are used. The script tries to
// figure out where which information might be appropriately placed. I
// hope this works.
//
// INSTALLATION
//
// For installation in Zotero 2 or above, you just have to drop this
// file into the folder
//
// <mozProfileDir>/zotero/translators
//
// using Linux, this should be typically something like:
// /home/username/.mozilla/firefox/ca9dfjvs.default/zotero/translators
//
// For Windows 6-7, people told me that you find this folder somewhere like
// C:\Users\UserName\AppData\Roaming\Mozilla\Firefox\ca9dfjvs.default\zotero\translators
//
// For Windows -5 probably (not tested) C:\Documents and Settings\UserName\Application Data\Mozilla\Firefox\ca9dfjvs.default\zotero\translators
//
// The important thing is that you locate your Firefox profile dir. If
// you can't find it
// http://kb.mozillazine.org/Profile_folder_-_Firefox#Finding_the_profile_folder
// could be helpful.
//
// Zotero 1.x is not supported, mainly due to installation
// issues. Zotero 1.x stores translators in the sqlite database and
// not in file-space. If you feel brave enough you may use the
// scaffold add-on for firefox, to manually add the translator to the
// database.
//
// TROUBLESHOOTING
//
// As far as I have tested it so far, it should be rather robust. So, chances
// are good that you will not run into trouble.
//
// But, if it doesn't work, it doesn't work. Unfortunately the error
// messages are not very specific. Usually, when there is something
// wrong with the translator it does not work at all. Sometimes,
// nevertheless, there are messages in the JavaScript error console.
//
// If you encounter a non-responsive Firefox after having installed
// this script, just delete the script and everything should be
// alright again.
// ******************************************************************

// Zotero.addOption("exportNotes", false);
// Zotero.addOption("generateXMLIds", true);

var ns = {"tei": "http://www.tei-c.org/ns/1.0",
          "xml": "http://www.w3.org/XML/1998/namespace"};



var exportedXMLIds = [];
var generatedItems = [];
var allItems = [];


function genXMLId (item){
    var xmlid = '';
    if(item.creators && item.creators[0] && item.creators[0].lastName){
        xmlid = item.creators[0].lastName;
        if(item.date) {
            var date = Zotero.Utilities.strToDate(item.date);
            if(date.year) {
                xmlid += date.year;
            }
        }
        // Replace space and colon by "_"
        xmlid = xmlid.replace(/([ \t\[\]:])+/g,"_");

        // Remove any non xml NCName characters

        // Namestart = ":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] |
        // [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF]
        // | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] |
        // [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] |
        // [#x10000-#xEFFFF]
        
        // Name =  NameStartChar | "-" | "." | [0-9] | #xB7 |
        // [#x0300-#x036F] | [#x203F-#x2040]

        xmlid = xmlid.replace(/^[^A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u10000-\uEFFFF]/, "");
        xmlid = xmlid.replace(/[^-A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u10000-\uEFFFF.0-9\u00B7\u0300-\u036F\u203F-\u2040]/g, "");
    }
    else{
        xmlid += 'zoteroItem_' + item.itemID;
    }
    // this is really inefficient
    var curXmlId = xmlid;
    if(exportedXMLIds[curXmlId]){
        // append characters to make xml:id unique
        // a-z aa-az ba-bz
        var charA = 97;
        var charZ = 122;
        var firstId = xmlid + "a";
        // reset id of previous date-only item to <date> + "a";
        if(exportedXMLIds[curXmlId] && 
           !exportedXMLIds[firstId]){
            exportedXMLIds[curXmlId].setAttributeNS(ns.xml, "xml:id", firstId);
            exportedXMLIds[firstId] = exportedXMLIds[curXmlId];
        }
        // then start from b
        for (var i = charA + 1; exportedXMLIds[curXmlId]; i++){
            curXmlId = xmlid + String.fromCharCode(i);
            if(i == charZ){
                i = charA;
                xmlid += String.fromCharCode(charA);
            }
        }
        xmlid = curXmlId;
    }
    // set in main loop
    // exportedXMLIds[xmlid] = true;
    return xmlid;
}

function generateItem(item, teiDoc) {
    // fixme not all conferencepapers are analytic!
    var analyticItemTypes = {"journalArticle":true,
                             "bookSection":true,
                             "magazineArticle":true,
                             "newspaperArticle":true,
                             "conferencePaper":true};

    var isAnalytic = analyticItemTypes[item.itemType] ? true : false;
    var bibl = teiDoc.createElementNS(ns.tei, "biblStruct");
    bibl.setAttribute("type", item.itemType);

    if(Zotero.getOption("Generate XML IDs")){
        if(!generatedItems[item.itemID]){ 
            var xmlid =  genXMLId(item);
            bibl.setAttributeNS(ns.xml, "xml:id", xmlid);
            exportedXMLIds[xmlid] = bibl;
        }
        else{
            var xmlid = "#" + generatedItems[item.itemID].getAttributeNS(ns.xml, "id");
            var myXmlid = "zoteroItem_" + item.itemID;

            bibl.setAttribute("sameAs", xmlid);

            bibl.setAttributeNS(ns.xml, "xml:id", myXmlid);
            exportedXMLIds[myXmlid] = bibl;
        }
    }

    generatedItems[item.itemID] = bibl;

    /** CORE FIELDS **/
    
    var monogr = teiDoc.createElementNS(ns.tei, "monogr");
    var analytic = null;
    var series = null;
    // create title or monogr
    if(isAnalytic){
        analytic = teiDoc.createElementNS(ns.tei, "analytic")
        bibl.appendChild(analytic);
        bibl.appendChild(monogr);
        var analyticTitle = teiDoc.createElementNS(ns.tei, "title");
        analyticTitle.setAttribute("level", "a");
        analytic.appendChild(analyticTitle);
        if(item.title){
            analyticTitle.appendChild(teiDoc.createTextNode(item.title));
        }

        // there should be a publication title!
        if(item.publicationTitle){
            var pubTitle = teiDoc.createElementNS(ns.tei, "title");
            if(item.itemType == "journalArticle"){
                pubTitle.setAttribute("level", "j");
            }
            else{
                pubTitle.setAttribute("level", "m");
            }
            pubTitle.appendChild(teiDoc.createTextNode(item.publicationTitle));
            monogr.appendChild(pubTitle);
        }
        // nonetheless if the user pleases this has to be possible
        else if(!item.conferenceName){
            var pubTitle = teiDoc.createElementNS(ns.tei, "title");
            pubTitle.setAttribute("level", "m");
            monogr.appendChild(pubTitle);
        }
    }
    else {
        bibl.appendChild(monogr);
        if(item.title){
            var title = teiDoc.createElementNS(ns.tei, "title");
            title.setAttribute("level", "m");
            title.appendChild(teiDoc.createTextNode(item.title));
            monogr.appendChild(title);
        }
        else if(!item.conferenceName){
            var title = teiDoc.createElementNS(ns.tei, "title");
            monogr.appendChild(title);
        }
    }

    // add name of conference
    if(item.conferenceName){
        var conferenceName = teiDoc.createElementNS(ns.tei, "title");
        conferenceName.setAttribute("type", "conferenceName");
        conferenceName.appendChild(teiDoc.createTextNode(item.conferenceName));
        monogr.appendChild(conferenceName);
    }

    // itemTypes in Database do unfortunately not match fields
    // of item
    if(item.series || item.seriesTitle){
        series = teiDoc.createElementNS(ns.tei, "series");
        bibl.appendChild(series);

        if(item.series){
            var title = teiDoc.createElementNS(ns.tei, "title");
            title.setAttribute("level", "s");
            title.appendChild(teiDoc.createTextNode(item.series));
            series.appendChild(title);
        }
        if(item.seriesTitle){
            var seriesTitle = teiDoc.createElementNS(ns.tei, "title");
            seriesTitle.setAttribute("level", "s");
            seriesTitle.setAttribute("type", "alternative");
            seriesTitle.appendChild(teiDoc.createTextNode(item.seriesTitle));
            series.appendChild(seriesTitle);
        }
        if(item.seriesText){
            var seriesText = teiDoc.createElementNS(ns.tei, "note");
            seriesText.setAttribute("type", "description");
            seriesText.appendChild(teiDoc.createTextNode(item.seriesText));
            series.appendChild(seriesText);
        }
        if(item.seriesNumber){
            var seriesNumber = teiDoc.createElementNS(ns.tei, "biblScope");
            seriesNumber.setAttribute("type", "vol");
            seriesNumber.appendChild(teiDoc.createTextNode(item.seriesNumber));
            series.appendChild(seriesNumber);
        }
    }

    // creators are all people only remotely involved into the creation of
    // a resource
    for(var i in item.creators){
        var role = '';
        var curCreator = '';
        var curRespStmt = null;
        var type = item.creators[i].creatorType;
        if(type == "author"){
            curCreator = teiDoc.createElementNS(ns.tei, "author");
        }
        else if (type == "editor"){
            curCreator = teiDoc.createElementNS(ns.tei, "editor");
        }
        else if (type == "seriesEditor"){
            curCreator = teiDoc.createElementNS(ns.tei, "editor");
        }
        else if (type == "bookAuthor"){
            curCreator = teiDoc.createElementNS(ns.tei, "author");
        }
        else {
            curRespStmt = teiDoc.createElementNS(ns.tei, "respStmt");
            var resp = teiDoc.createElementNS(ns.tei, "resp");
            resp.appendChild(teiDoc.createTextNode(type));
            curRespStmt.appendChild(resp);
            curCreator = teiDoc.createElementNS(ns.tei, "persName");
            curRespStmt.appendChild(curCreator);
        }
        // add the names of a particular creator
        if(item.creators[i].firstName){
            var forename = teiDoc.createElementNS(ns.tei, "forename");
            forename.appendChild(teiDoc.createTextNode(item.creators[i].firstName));
            curCreator.appendChild(forename);
        }
        if(item.creators[i].lastName){
            var surname = null;
            if(item.creators[i].firstName){
                surname = teiDoc.createElementNS(ns.tei, "surname");
            }
            else{
                surname = teiDoc.createElementNS(ns.tei, "name");
            }
            surname.appendChild(teiDoc.createTextNode(item.creators[i].lastName));
            curCreator.appendChild(surname);
        }

        // make sure the right thing gets added
        if(curRespStmt){
            curCreator = curRespStmt;
        }

        //decide where the creator shall appear
        if(type == "seriesEditor" && series){
            series.appendChild(curCreator);
        }
        else if(isAnalytic && (type != 'editor' && type != 'bookAuthor')){
            // assuming that only authors go here
            analytic.appendChild(curCreator);
        }
        else{
            monogr.appendChild(curCreator);
        }
    }

    if(item.edition){
        var edition = teiDoc.createElementNS(ns.tei, "edition");
        edition.appendChild(teiDoc.createTextNode(item.edition));
        monogr.appendChild(edition);
    }
    // software
    else if (item.version){
        var edition = teiDoc.createElementNS(ns.tei, "edition");
        edition.appendChild(teiDoc.createTextNode(item.version));
        monogr.appendChild(edition);
    }


    //create the imprint
    var imprint = teiDoc.createElementNS(ns.tei, "imprint");
    monogr.appendChild(imprint);

    if(item.place){
        var pubPlace = teiDoc.createElementNS(ns.tei, "pubPlace");
        pubPlace.appendChild(teiDoc.createTextNode(item.place));
        imprint.appendChild(pubPlace);
    }
    if(item.volume){
        var volume = teiDoc.createElementNS(ns.tei, "biblScope");
        volume.setAttribute("type","vol");
        volume.appendChild(teiDoc.createTextNode(item.volume));
        imprint.appendChild(volume);
    }
    if(item.issue){
        var issue = teiDoc.createElementNS(ns.tei, "biblScope");
        issue.setAttribute("type","issue");
        issue.appendChild(teiDoc.createTextNode(item.issue));
        imprint.appendChild(issue);
    }
    if(item.section){
        var section = teiDoc.createElementNS(ns.tei, "biblScope");
        section.setAttribute("type","chap");
        section.appendChild(teiDoc.createTextNode(item.section));
        imprint.appendChild(section);
    }
    if(item.pages){
        var pages = teiDoc.createElementNS(ns.tei, "biblScope");
        pages.setAttribute("type","pp");
        pages.appendChild(teiDoc.createTextNode(item.pages));
        imprint.appendChild(pages);
    }
    if(item.publisher){
        var publisher = teiDoc.createElementNS(ns.tei, "publisher");
        publisher.appendChild(teiDoc.createTextNode(item.publisher));
        imprint.appendChild(publisher);
    }
    if(item.date){
        var date = Zotero.Utilities.strToDate(item.date);
        var imprintDate = teiDoc.createElementNS(ns.tei, "date");
        if(date.year) {
            imprintDate.appendChild(teiDoc.createTextNode(date.year));
        }
        else{
            imprintDate.appendChild(teiDoc.createTextNode(item.date));
        }
        imprint.appendChild(imprintDate);
    }

    // flag unpublished if there is no date | publisher | place
    if(!(item.date || item.publisher || item.place)){
        publisher = teiDoc.createComment("  no publisher, publication date or place given  ");
        imprint.appendChild(publisher);
    }
    if(item.accessDate){
        var note = teiDoc.createElementNS(ns.tei, "note");
        note.setAttribute("type", "accessed");
        note.appendChild(teiDoc.createTextNode(item.accessDate));
        imprint.appendChild(note);
    }
    if(item.url){
        var note = teiDoc.createElementNS(ns.tei, "note");
        note.setAttribute("type", "url");
        note.appendChild(teiDoc.createTextNode(item.url));
        imprint.appendChild(note);
    }
    if(item.thesisType){
        var note = teiDoc.createElementNS(ns.tei, "note");
        note.setAttribute("type", "thesisType");
        note.appendChild(teiDoc.createTextNode(item.thesisType));
        imprint.appendChild(note);
    }

    //export notes
    if(Zotero.getOption("exportNotes")) {
        for(var n in item.notes) {
            // do only some basic cleaning of the html
            // strip HTML tags
            var noteText = Zotero.Utilities.cleanTags(item.notes[n].note);
            // unescape remaining entities -> no double escapes
            noteText = Zotero.Utilities.unescapeHTML(noteText);
            var note = teiDoc.createElementNS(ns.tei, "note");
            note.appendChild(teiDoc.createTextNode(noteText));
            bibl.appendChild(note);
        }
    }

    //export tags, if available
    if(Zotero.getOption("Export Tags") && item.tags && item.tags.length > 0) {
        var tags = teiDoc.createElementNS(ns.tei, "note");
        tags.setAttribute("type","tags");
        for(var n in item.tags) {
            var tag = teiDoc.createElementNS(ns.tei, "note");
            tag.setAttribute("type", "tag");
            tag.appendChild(teiDoc.createTextNode(item.tags[n].tag));
            tags.appendChild(tag);
        }
        bibl.appendChild(tags);
    }

    // the canonical reference numbers
    if(item.ISBN){
        var idno = teiDoc.createElementNS(ns.tei, "idno");
        idno.setAttribute("type", "ISBN");
        idno.appendChild(teiDoc.createTextNode(item.ISBN));
        bibl.appendChild(idno);
    }
    if(item.ISSN){
        var idno = teiDoc.createElementNS(ns.tei, "idno");
        idno.setAttribute("type", "ISSN");
        idno.appendChild(teiDoc.createTextNode(item.ISSN));
        bibl.appendChild(idno);
    }
    if(item.DOI){
        var idno = teiDoc.createElementNS(ns.tei, "idno");
        idno.setAttribute("type", "DOI");
        idno.appendChild(teiDoc.createTextNode(item.DOI));
        bibl.appendChild(idno);
    }
    if(item.callNumber){
        var idno = teiDoc.createElementNS(ns.tei, "idno");
        idno.setAttribute("type", "callNumber");
        idno.appendChild(teiDoc.createTextNode(item.callNumber));
        bibl.appendChild(idno);
    }
    return bibl;
}

function generateCollection(collection, teiDoc){
    var listBibl;
    var children = collection.children ? collection.children : collection.descendents;


    if(children.length > 0){
        listBibl = teiDoc.createElementNS(ns.tei, "listBibl");
        var colHead = teiDoc.createElementNS(ns.tei, "head");
        colHead.appendChild(teiDoc.createTextNode(collection.name));
        listBibl.appendChild(colHead);
        for each(var child in children){
            if(child.type == "collection"){
                listBibl.appendChild(generateCollection(child, teiDoc));
            }
            else if(allItems[child.id]){
                listBibl.appendChild(generateItem(allItems[child.id], teiDoc));
            }
        }
    }
    return listBibl;
}

function generateTEIDocument(listBibls, teiDoc){
    var text = teiDoc.createElementNS(ns.tei, "text");
    var body = teiDoc.createElementNS(ns.tei, "body");
    teiDoc.documentElement.appendChild(text);
    text.appendChild(body);
    for each(var lb in listBibls){
        body.appendChild(lb);
    }
    return teiDoc;
}

function doExport() {
    Zotero.debug("starting TEI-XML export");
    Zotero.setCharacterSet("utf-8");
    Zotero.debug("TEI-XML Exporting items");


    // Initialize XML Doc
    var parser = new DOMParser();
    var teiDoc = // <TEI/>
    parser.parseFromString('<TEI xmlns="http://www.tei-c.org/ns/1.0"><teiHeader><fileDesc><titleStmt><title>Exported from Zotero</title></titleStmt><publicationStmt><p>unpublished</p></publicationStmt><sourceDesc><p>Generated from Zotero database</p></sourceDesc></fileDesc></teiHeader></TEI>', 'application/xml');    

    var item = null;
    while(item = Zotero.nextItem()){
        allItems[item.itemID] = item;
    }


    var collection = Zotero.nextCollection();
    var listBibls = new Array();
    if(Zotero.getOption("Export Collections") && collection){
        var curListBibl = generateCollection(collection, teiDoc);
        if(curListBibl){
            listBibls.push(curListBibl);
        }
        while(collection = Zotero.nextCollection()){
            curListBibl = generateCollection(collection, teiDoc);
            if(curListBibl){
                listBibls.push(curListBibl);
            }
        }
    }
    else {
        var listBibl = teiDoc.createElementNS(ns.tei, "listBibl");
        for each(var item in allItems){
            //skip attachments
            if(item.itemType == "attachment"){
                continue;
            }
            listBibl.appendChild(generateItem(item, teiDoc));
        }
        listBibls.push(listBibl);
    }



    var outputElement;

    if(Zotero.getOption("Full TEI Document")){
        outputElement = generateTEIDocument(listBibls, teiDoc);
    }
    else{
        if(listBibls.length > 1){
            outputElement = teiDoc.createElementNS(ns.tei, "listBibl");
            for each(var lb in listBibls){
                outputElement.appendChild(lb);
            }
        }
        else if(listBibls.length == 1){
            outputElement = listBibls[0];
        }
        else{
            outputElement = teiDoc.createElement("empty");
        }
    }

    // write to file.
    Zotero.write('<?xml version="1.0"?>'+"\n");
    var serializer = new XMLSerializer();
    Zotero.write(serializer.serializeToString(outputElement));
}
