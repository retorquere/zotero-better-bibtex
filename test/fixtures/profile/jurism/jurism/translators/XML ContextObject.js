{
	"translatorID": "24d9f058-3eb3-4d70-b78f-1ba1aef2128d",
	"label": "XML ContextObject",
	"creator": "Avram Lyon and Simon Kornblith",
	"target": "ctx",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"configOptions": {
		"dataMode": "xml/dom"
	},
	"inRepository": true,
	"translatorType": 1,
	"browserSupport": "gcsv",
	"lastUpdated": "2015-05-20 00:05:55"
}

/*
	***** BEGIN LICENSE BLOCK *****

	ContextObjects in XML Translator
	Copyright © 2010 Avram Lyon, 2013 Sebastian Karcher

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
 
/*This translator imports OpenURL ContextObjects encapsulated in XML
 * documents, as described at:
 *  http://alcme.oclc.org/openurl/servlet/OAIHandler?verb=GetRecord&metadataPrefix=oai_dc&identifier=info:ofi/fmt:xml:xsd:ctx
 * The schema for such XML documents is at:
 *  http://www.openurl.info/registry/docs/xsd/info:ofi/fmt:xml:xsd:ctx
 *
 * This format is used in several places online, including Brown University's FreeCite
 * Citation parser (http://freecite.library.brown.edu/welcome) and Oslo University's
 * X-Port (http://www.ub.uio.no/portal/gs.htm or http://x-port.uio.no/).
 *
 * The approach we will take is to convert this into COinS, so that we can
 * piggy-back off of the perhaps more robust support in the core Zotero code.
 */


function detectImport() {
	// read at most 100 lines and checks for ctx-namespace
	var line, i=0;
	while ((line = Zotero.read()) !== false && i<100) {
		if ( line.includes("info:ofi/fmt:xml:xsd:ctx") ) {
			return true;
		}
		i++;
	}
	return false;
}


function doImport() {

	var spans = contextObjectXMLToCOinS( Z.getXML() );
	
	for (var i = 0 ; i < spans.length ; i++) {
		Zotero.debug("Processing span: "+spans[i]);
		var item = new Zotero.Item;
		var success = Zotero.Utilities.parseContextObject(spans[i], item);
		if (success) {
			Zotero.debug("Found " + item.itemType);
			// Set publicationTitle to the short title if only the latter is specified
			if (item.journalAbbreviation && !item.publicationTitle) {
				item.publicationTitle = item.journalAbbreviation;
			}
			item.complete();
		} else {
			Zotero.debug("parseContextObject was not successful");
		}
	}
}

/* Takes the string of the ContextObject XML format
 * and returns an array of COinS titles of the same, per the COinS
 * specification.
 */
function contextObjectXMLToCOinS (doc) {

	const ns = {
		"xsi" : "http://www.w3.org/2001/XMLSchema-instance",
		"ctx" : "info:ofi/fmt:xml:xsd:ctx",
		"rft" : "info:ofi/fmt:xml:xsd:journal"
	};
	
	var objects = ZU.xpath(doc, '//ctx:context-object', ns);
	/* Bail out if no object */
	if (objects.length === 0) {
		Zotero.debug("No context object");
		return [];
	}

	var titles = [];
	
	for (var i = 0; i < objects.length; i++) {
		Zotero.debug("Processing object: " + objects[i].textContent);
		var pieces = [];
		
		var version = ZU.xpathText(objects[i], './@version', ns);
	
		pieces.push("ctx_ver="+encodeURIComponent(version));
		
		var format = ZU.xpathText(objects[i], './/ctx:format', ns);

		if (mapXMLtoKEV[format]) {
			format = mapXMLtoKEV[format];
		} else {
			// e.g. also format == "info:ofi/fmt:xml:xsd:unknown"
			// use journalArticle as default value
			format = "info:ofi/fmt:kev:mtx:journal";
		}

		pieces.push("rft_val_fmt=" + encodeURIComponent(format));
		
		var fields = ZU.xpath(objects[i], './/ctx:metadata/*/*', ns);
		for (var j in fields) {
			var name = fields[j].nodeName;
			// turn this into html
			name = name.replace(/:/, ".");
			var value = encodeURIComponent(fields[j].textContent);
			pieces.push(name + "=" + value);
		}
		
		var title = pieces.join("&");
		var span = "<span title='" + title + "' class='Z3988'></span>\n";
		Zotero.debug("Made span: " + span);
		titles.push(title);
	}
	return titles;
};

/* These two arrays are needed because COinS uses Key/Escaped-Value, which has a different
 * set of format codes. Codes from "Registry for the OpenURL Framework - ANSI/NISO Z39.88-2004":
 * http://alcme.oclc.org/openurl/servlet/OAIHandler?verb=ListRecords&metadataPrefix=oai_dc&set=Core:Metadata+Formats
 */
var mapKEVtoXML = {
	'info:ofi/fmt:kev:mtx:book'	:	'info:ofi/fmt:xml:xsd:book',	 	// Books
	'info:ofi/fmt:kev:mtx:dc'	:	'info:ofi/fmt:xml:xsd:oai_dc',		// Dublin Core
	'info:ofi/fmt:kev:mtx:dissertation' :	'info:ofi/fmt:xml:xsd:dissertation',	// Dissertations
	'info:ofi/fmt:kev:mtx:journal'	:	'info:ofi/fmt:xml:xsd:journal',		// Journals
	'info:ofi/fmt:kev:mtx:patent'	:	'info:ofi/fmt:xml:xsd:patent',		// Patents
	'info:ofi/fmt:kev:mtx:sch_svc'	:	'info:ofi/fmt:xml:xsd:sch_svc'		// Scholarly ServiceTypes
};

var mapXMLtoKEV = {
	'info:ofi/fmt:xml:xsd:book'	:	'info:ofi/fmt:kev:mtx:book',	 	// Books
	'info:ofi/fmt:xml:xsd:oai_dc'	:	'info:ofi/fmt:kev:mtx:dc',		// Dublin Core
	'info:ofi/fmt:xml:xsd:dissertation' :	'info:ofi/fmt:kev:mtx:dissertation',	// Dissertations
	'info:ofi/fmt:xml:xsd:journal'	:	'info:ofi/fmt:kev:mtx:journal',		// Journals
	'info:ofi/fmt:xml:xsd:patent'	:	'info:ofi/fmt:kev:mtx:patent',		// Patents
	'info:ofi/fmt:xml:xsd:sch_svc'	:	'info:ofi/fmt:kev:mtx:sch_svc'		// Scholarly ServiceTypes
};
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "<ctx:context-objects xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='info:ofi/fmt:xml:xsd:ctx http://www.openurl.info/registry/docs/info:ofi/fmt:xml:xsd:ctx' xmlns:ctx='info:ofi/fmt:xml:xsd:ctx'>\n<ctx:context-object timestamp='2010-01-02T16:55:48-05:00' encoding='info:ofi/enc:UTF-8' version='Z39.88-2004' identifier=''>\n <ctx:referent>\n  <ctx:metadata-by-val>\n   <ctx:format>info:ofi/fmt:xml:xsd:journal</ctx:format>\n   <ctx:metadata>\n    <journal xmlns:rft='info:ofi/fmt:xml:xsd:journal' xsi:schemaLocation='info:ofi/fmt:xml:xsd:journal http://www.openurl.info/registry/docs/info:ofi/fmt:xml:xsd:journal'>\n\t <rft:atitle>Acute Myocardial Infarction in the Medicare population: process of care and clinical outcomes</rft:atitle>\n\t <rft:spage>2530</rft:spage>\n\t <rft:date>1992</rft:date>\n\t <rft:stitle>Journal of the American Medical Association</rft:stitle>\n\t <rft:genre>article</rft:genre>\n\t <rft:volume>18</rft:volume>\n\t <rft:epage>2536</rft:epage>\n\t <rft:au>I S Udvarhelyi</rft:au>\n\t <rft:au>C A Gatsonis</rft:au>\n\t <rft:au>A M Epstein</rft:au>\n\t <rft:au>C L Pashos</rft:au>\n\t <rft:au>J P Newhouse</rft:au>\n\t <rft:au>B J McNeil</rft:au>\n\t</journal>\n   </ctx:metadata>\n  </ctx:metadata-by-val>\n </ctx:referent>\n</ctx:context-object>\n</ctx:context-objects>",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Acute Myocardial Infarction in the Medicare population: process of care and clinical outcomes",
				"creators": [
					{
						"firstName": "I. S.",
						"lastName": "Udvarhelyi",
						"creatorType": "author"
					},
					{
						"firstName": "C. A.",
						"lastName": "Gatsonis",
						"creatorType": "author"
					},
					{
						"firstName": "A. M.",
						"lastName": "Epstein",
						"creatorType": "author"
					},
					{
						"firstName": "C. L.",
						"lastName": "Pashos",
						"creatorType": "author"
					},
					{
						"firstName": "J. P.",
						"lastName": "Newhouse",
						"creatorType": "author"
					},
					{
						"firstName": "B. J.",
						"lastName": "McNeil",
						"creatorType": "author"
					}
				],
				"date": "1992",
				"journalAbbreviation": "Journal of the American Medical Association",
				"pages": "2530-2536",
				"publicationTitle": "Journal of the American Medical Association",
				"volume": "18",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<ctx:context-objects xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='info:ofi/fmt:xml:xsd:ctx http://www.openurl.info/registry/docs/info:ofi/fmt:xml:xsd:ctx' xmlns:ctx='info:ofi/fmt:xml:xsd:ctx'> <ctx:context-object timestamp='2015-03-16T15:37:18-04:00' encoding='info:ofi/enc:UTF-8' version='Z39.88-2004' identifier=''><ctx:referent><ctx:metadata-by-val><ctx:format>info:ofi/fmt:xml:xsd:journal</ctx:format><ctx:metadata><journal xmlns:rft='info:ofi/fmt:xml:xsd:journal' xsi:schemaLocation='info:ofi/fmt:xml:xsd:journal http://www.openurl.info/registry/docs/info:ofi/fmt:xml:xsd:journal'><rft:quarter>4356</rft:quarter><rft:atitle>Molecular structure of nucleic acids; a structure for deoxyribose nucleic acid</rft:atitle><rft:spage>737</rft:spage><rft:date>1953</rft:date><rft:jtitle>Nature</rft:jtitle><rft:genre>article</rft:genre><rft:volume>171</rft:volume><rft:epage>738</rft:epage><rft:au>J D Watson</rft:au><rft:au>F H C Crick</rft:au></journal></ctx:metadata></ctx:metadata-by-val></ctx:referent></ctx:context-object>  <ctx:context-object timestamp='2015-03-16T15:37:18-04:00' encoding='info:ofi/enc:UTF-8' version='Z39.88-2004' identifier=''><ctx:referent><ctx:metadata-by-val><ctx:format>info:ofi/fmt:xml:xsd:journal</ctx:format><ctx:metadata><journal xmlns:rft='info:ofi/fmt:xml:xsd:journal' xsi:schemaLocation='info:ofi/fmt:xml:xsd:journal http://www.openurl.info/registry/docs/info:ofi/fmt:xml:xsd:journal'><rft:quarter>4</rft:quarter><rft:atitle>On the electrodynamics of moving bodies</rft:atitle><rft:spage>1</rft:spage><rft:date>1905</rft:date><rft:stitle>Annalen Der Physik</rft:stitle><rft:genre>article</rft:genre><rft:volume>17</rft:volume><rft:epage>26</rft:epage><rft:au>A Einstein</rft:au></journal></ctx:metadata></ctx:metadata-by-val></ctx:referent></ctx:context-object> </ctx:context-objects>",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Molecular structure of nucleic acids; a structure for deoxyribose nucleic acid",
				"creators": [
					{
						"firstName": "J. D.",
						"lastName": "Watson",
						"creatorType": "author"
					},
					{
						"firstName": "F. H. C.",
						"lastName": "Crick",
						"creatorType": "author"
					}
				],
				"date": "1953",
				"pages": "737-738",
				"publicationTitle": "Nature",
				"volume": "171",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			},
			{
				"itemType": "journalArticle",
				"title": "On the electrodynamics of moving bodies",
				"creators": [
					{
						"firstName": "A.",
						"lastName": "Einstein",
						"creatorType": "author"
					}
				],
				"date": "1905",
				"journalAbbreviation": "Annalen Der Physik",
				"pages": "1-26",
				"publicationTitle": "Annalen Der Physik",
				"volume": "17",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
];
/** END TEST CASES **/
