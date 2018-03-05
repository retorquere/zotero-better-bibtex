{
	"translatorID": "18dd188a-9afc-4cd6-8775-1980c3ce0fbf",
	"label": "Simple Evernote Export",
	"creator": "Volodymir Skipa",
	"target": "enex",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 50,
	"displayOptions": {
		"exportNotes": true
	},
	"inRepository": false,
	"translatorType": 2,
	"lastUpdated":"2015-07-20 06:39:12"
}

/*
Evernote Export Translator
Copyright (C) 2012 Volodymir Skipa

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

function doExport() {
	Zotero.setCharacterSet("utf-8");

	var evernoteString = "<?xml version='1.0' encoding='UTF-8'?><!DOCTYPE en-export SYSTEM 'http://xml.evernote.com/pub/evernote-export.dtd'><en-export application='Zotero' version='"+Zotero.Utilities.getVersion()+"'>";

	var item;

	while(item = Zotero.nextItem()) {

		var itemString = "<note>";

		itemString += "<title>"+item.title+"</title>";

		itemString += "<content><![CDATA[<?xml version='1.0' encoding='UTF-8'?><!DOCTYPE en-note SYSTEM 'http://xml.evernote.com/pub/enml2.dtd'>";

		/** NOTES **/
		if(item.notes && Zotero.getOption("exportNotes")) {
			itemString += "<en-note>";
			for(var i in item.notes) {
				itemString += "<div>"+item.notes[i].note+"<br/></div>";
			}
			itemString += "</en-note>]]>";
		}		

		var dateToFormat = new String(item.date);
		var evernoteDate = dateToFormat.replace(/-/g, "");

		itemString += "</content><created>"+evernoteDate+"T000000Z</created>";	

		/** TAGS **/
		for(var j in item.tags) {
			itemString += "<tag>"+item.tags[j].tag+"</tag>";
		}

		itemString += "<note-attributes><source>web.clip</source><source-url>"+item.url+"</source-url></note-attributes></note>";

		// replace "&" with "&amp;"
		itemString = itemString.replace(/\&/g, "&amp;");

		evernoteString += itemString;

	}

	Zotero.write(evernoteString);
	Zotero.write("</en-export>");
}
