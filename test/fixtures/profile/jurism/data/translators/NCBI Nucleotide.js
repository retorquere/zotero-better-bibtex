{
	"translatorID": "5e385e77-2f51-41b4-a29b-908e23d5d3e8",
	"label": "NCBI Nucleotide",
	"creator": "Martin Fenner",
	"target": "^https?://(www\\.)?ncbi\\.nlm\\.nih\\.gov/nuccore/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2014-11-15 11:25:19"
}

/**
	Copyright (c) 2014 Martin Fenner

	This program is free software: you can redistribute it and/or
	modify it under the terms of the GNU Affero General Public License
	as published by the Free Software Foundation, either version 3 of
	the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
	Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public
	License along with this program. If not, see
	<http://www.gnu.org/licenses/>.
*/

function detectWeb(doc, url) {
	// use item type journalArticle until item type dataset is supported in Zotero
	if (getIds(doc)) return "journalArticle";

	// search results
	if (url.indexOf("/?term=") != -1 && getSearchResults(doc, true)) return "multiple";
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		getSelectedJSON(doc);
	} else {
		var ids = getIds(doc);
		getJSON(ids);
	}
}

function getSearchResults(doc, checkOnly) {
	var results = doc.getElementsByClassName('rslt');
	if (!results.length) return false;

	var items = {};
	var found = false;
	for (var i = 0; i < results.length; i++) {
		var title = results[i].firstChild.textContent;

		// parse the id (a number) from the second link
		var links = results[i].getElementsByTagName("a");
		var id = links[1].href.match(/[\d]+/);
		if (id && title) {
			if (checkOnly) return true;
			
			found = true;
			items["_" + id[0]] = ZU.trimInternal(title);
		}
	}
	return found ? items : false;
}

function getSelectedJSON(doc) {
	var items = getSearchResults(doc);
	var ids = [];

	Zotero.selectItems(items, function(selectedItems) {
		if (!selectedItems) return true;

		for (var i in selectedItems) {
			ids.push(i.substr(1));
		}
		getJSON(ids);
	});
}

function getIds(doc) {
	var ids = ZU.xpathText(doc, '/html/head/meta[@name="ncbi_uidlist"]/@content')

	if (!ids) return false;

	return ids.split(",");
}

function getJSON(ids) {
	var baseURL = "//eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=nucleotide&retmode=json&id=";
	var jsonURL = baseURL + encodeURIComponent(ids.join(","));
	Z.debug(jsonURL);
	ZU.doGet(jsonURL, parseJSON);
}

function parseJSON(text) {
	try {
		var obj = JSON.parse(text).result;
		var uids = obj.uids;
	} catch (e) {
		Z.debug(text.substr(0, 100));
		throw e;
	}

	for (var i = 0; i < uids.length; i++) {
		var uid = uids[i];
		var data = obj[uid];
		var item = new Z.Item("journalArticle");

		item.title = data.title;
		item.callNumber = data.accessionversion;

		item.archive = "NCBI Nucleotide Database";
		item.archiveLocation = uid;

		// indicate that this is in fact a dataset
		item.extra = "{:itemType: dataset}";

		var version = data.accessionversion.match(/\.(\d{1,2})$/);
		if (version && version[1] != '1') {
			item.extra += "\n{:version: " + version[1] + "}";
		}

		item.url = "http://www.ncbi.nlm.nih.gov/nuccore/" + encodeURIComponent(data.accessionversion);
		item.date = data.updatedate;
		
		if (data.organism) item.tags.push(data.organism);
		if (data.moltype) item.tags.push(data.moltype);
		if (data.sourcedb) item.tags.push(data.sourcedb);
		
		item.attachments.push({
			url: "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nucleotide&retmode=gb&rettype=text&id=" + encodeURIComponent(uid),
			title: "Nucleotide sequence (gb)",
			mimeType: "chemical/x-genbank",
			snapshot: false
		});

		// http://www.ncbi.nlm.nih.gov/About/disclaimer.html
		item.rights = "Public domain";

		item.language = "en-US";
		
		item.complete();
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.ncbi.nlm.nih.gov/nuccore/?term=brca1",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.ncbi.nlm.nih.gov/nuccore/I01425.1",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Sequence 1 from Patent US 4849348",
				"creators": [],
				"date": "1993/03/05",
				"archive": "NCBI Nucleotide Database",
				"archiveLocation": "270186",
				"callNumber": "I01425.1",
				"extra": "{:itemType: dataset}",
				"language": "en-US",
				"libraryCatalog": "NCBI Nucleotide",
				"rights": "Public domain",
				"url": "http://www.ncbi.nlm.nih.gov/nuccore/I01425.1",
				"attachments": [
					{
						"title": "Nucleotide sequence (gb)",
						"mimeType": "chemical/x-genbank",
						"snapshot": false
					}
				],
				"tags": [
					"dna",
					"insd"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.ncbi.nlm.nih.gov/nuccore/NM_078524.4",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Drosophila melanogaster smad on X, transcript variant A (Smox), mRNA",
				"creators": [],
				"date": "2016/12/13",
				"archive": "NCBI Nucleotide Database",
				"archiveLocation": "665390239",
				"callNumber": "NM_078524.4",
				"extra": "{:itemType: dataset}\n{:version: 4}",
				"language": "en-US",
				"libraryCatalog": "NCBI Nucleotide",
				"rights": "Public domain",
				"url": "http://www.ncbi.nlm.nih.gov/nuccore/NM_078524.4",
				"attachments": [
					{
						"title": "Nucleotide sequence (gb)",
						"mimeType": "chemical/x-genbank",
						"snapshot": false
					}
				],
				"tags": [
					"fruit fly",
					"refseq",
					"rna"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/