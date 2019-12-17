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
	"lastUpdated":"2019-10-11 07:30:00"
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
	var evernoteString = "<?xml version='1.0' encoding='UTF-8'?>\n<!DOCTYPE en-export SYSTEM 'http://xml.evernote.com/pub/evernote-export.dtd'>\n<en-export application='Zotero' version='" + Zotero.Utilities.getVersion() + "'>\n";
	var item;
	// eslint-disable-next-line no-cond-assign
	while (item = Zotero.nextItem()) {
		var itemString = "<note>\n";
		var title = item.title || "[Untitled]";
		// encode brackets <>
		title = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		// title cannot be longer than 255
		if (title.length > 252) {
			title = title.substr(0, 252) + "...";
		}
		itemString += "    <title>" + title + "</title>\n";
		itemString += "    <content>\n";
		itemString += "        <![CDATA[<?xml version='1.0' encoding='UTF-8'?><!DOCTYPE en-note SYSTEM 'http://xml.evernote.com/pub/enml2.dtd'>\n";
		itemString += "        <en-note>\n";

		/** NOTES **/
		if (item.notes && item.notes.length > 0 && Zotero.getOption("exportNotes")) {
			for (let i in item.notes) {
				// delete all class and id attributes, because these will
				// otherwise create an error when importing in Evernote
				let noteContent = item.notes[i].note
					.replace(/(<[^>]*) class="[^"]+"([^>]*>)/g, "$1$2")
					.replace(/(<[^>]*) id="[^"]+"([^>]*>)/g, "$1$2");
				// delete elements like html, body, head which might create
				// another problem when importing in Evernote
				noteContent = noteContent.replace(/<\/?(html|head|body)[^>]*>/g, '');
				itemString += "            <div>" + noteContent + "<br/></div>\n";
			}
		}
		itemString += "        </en-note>]]>\n";
		itemString += "    </content>\n";

		var dateCreated = item.dateAdded.replace(/[-:]/g, "").replace(" ", "T") + "Z";
		itemString += "    <created>" + dateCreated + "</created>\n";
		var dateUpdated = item.dateModified.replace(/[-:]/g, "").replace(" ", "T") + "Z";
		itemString += "    <updated>" + dateUpdated + "</updated>\n";

		/** TAGS **/
		for (var j in item.tags) {
			let tag = item.tags[j].tag;
			// comma is not allowed in tags
			tag = tag.replace(/\s*,\s*/g, ' / ');
			// encode brackets <>
			tag = tag.replace(/</g, '&lt;').replace(/>/g, '&gt;');
			// in Evernote tags must be smaller than 100 characters
			if (tag.length > 95) {
				tag = tag.substr(0, 95) + "...";
			}
			itemString += "    <tag>" + tag + "</tag>\n";
		}

		itemString += "    <note-attributes>\n";
		itemString += "        <source>web.clip</source>\n";
		itemString += "        <source-url>" + item.url + "</source-url>\n";
		itemString += "    </note-attributes>\n";
		itemString += "</note>\n";

		// replace "&" with "&amp;"
		itemString = itemString.replace(/&/g, "&amp;");

		evernoteString += itemString;
	}

	Zotero.write(evernoteString);
	Zotero.write("</en-export>\n");
}
