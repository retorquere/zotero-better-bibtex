{
	"translatorID": "6e372642-ed9d-4934-b5d1-c11ac758ebb7",
	"translatorType": 2,
	"label": "Unqualified Dublin Core RDF",
	"creator": "Simon Kornblith",
	"target": "rdf",
	"minVersion": "1.0.0b3.r1",
	"maxVersion": "",
	"priority": 100,
	"configOptions": {
		"dataMode": "rdf/xml"
	},
	"inRepository": true,
	"lastUpdated": "2019-06-11 13:33:25"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2008 Simon Kornblith

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

function doExport() {
	var dc = "http://purl.org/dc/elements/1.1/";
	Zotero.RDF.addNamespace("dc", dc);
	
	var item;
	while (item = Zotero.nextItem()) { // eslint-disable-line no-cond-assign
		if (item.itemType == "note" || item.itemType == "attachment") {
			continue;
		}
		
		var resource;
		if (item.ISBN) {
			resource = "urn:isbn:" + item.ISBN;
		}
		else if (item.url) {
			resource = item.url;
		}
		else {
			// just specify a node ID
			resource = Zotero.RDF.newResource();
		}
		
		/** CORE FIELDS **/
		
		// title
		if (item.title) {
			Zotero.RDF.addStatement(resource, dc + "title", item.title, true);
		}
		
		// type
		Zotero.RDF.addStatement(resource, dc + "type", item.itemType, true);
		
		// creators
		for (var j in item.creators) {
			// put creators in lastName, firstName format (although DC doesn't specify)
			var creator = item.creators[j].lastName;
			if (item.creators[j].firstName) {
				creator += ", " + item.creators[j].firstName;
			}
			
			if (item.creators[j].creatorType == "author") {
				Zotero.RDF.addStatement(resource, dc + "creator", creator, true);
			}
			else {
				Zotero.RDF.addStatement(resource, dc + "contributor", creator, true);
			}
		}
		
		/** FIELDS ON NEARLY EVERYTHING BUT NOT A PART OF THE CORE **/
		
		// source
		if (item.source) {
			Zotero.RDF.addStatement(resource, dc + "source", item.source, true);
		}
		
		// accessionNumber as generic ID
		if (item.accessionNumber) {
			Zotero.RDF.addStatement(resource, dc + "identifier", item.accessionNumber, true);
		}
		
		// rights
		if (item.rights) {
			Zotero.RDF.addStatement(resource, dc + "rights", item.rights, true);
		}
		
		/** SUPPLEMENTAL FIELDS **/
		
		// TODO - create text citation and OpenURL citation to handle volume, number, pages, issue, place
		
		// publisher/distributor
		if (item.publisher) {
			Zotero.RDF.addStatement(resource, dc + "publisher", item.publisher, true);
		}
		else if (item.distributor) {
			Zotero.RDF.addStatement(resource, dc + "publisher", item.distributor, true);
		}
		else if (item.institution) {
			Zotero.RDF.addStatement(resource, dc + "publisher", item.institution, true);
		}
		
		// date/year
		if (item.date) {
			Zotero.RDF.addStatement(resource, dc + "date", item.date, true);
		}
		
		// ISBN/ISSN/DOI
		if (item.ISBN) {
			Zotero.RDF.addStatement(resource, dc + "identifier", "ISBN " + item.ISBN, true);
		}
		if (item.ISSN) {
			Zotero.RDF.addStatement(resource, dc + "identifier", "ISSN " + item.ISSN, true);
		}
		if (item.DOI) {
			Zotero.RDF.addStatement(resource, dc + "identifier", "DOI " + item.DOI, true);
		}
		
		// callNumber
		if (item.callNumber) {
			Zotero.RDF.addStatement(resource, dc + "identifier", item.callNumber, true);
		}
		
		// archiveLocation
		if (item.archiveLocation) {
			Zotero.RDF.addStatement(resource, dc + "coverage", item.archiveLocation, true);
		}
		
		// medium
		if (item.medium) {
			// The "medium" property is only part of the qualified DC terms,
			// therefore we use here the "format" property.
			Zotero.RDF.addStatement(resource, dc + "format", item.medium, true);
		}
	}
}
