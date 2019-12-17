{
	"translatorID": "b5b5808b-1c61-473d-9a02-e1f5ba7b8eef",
	"label": "Datacite JSON",
	"creator": "Philipp Zumstein",
	"target": "json",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 1,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-01-27 16:34:49"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2019 Philipp Zumstein
	
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


// copied from CSL JSON
function parseInput() {
	var str, json = "";
	
	// Read in the whole file at once, since we can't easily parse a JSON stream. The 
	// chunk size here is pretty arbitrary, although larger chunk sizes may be marginally
	// faster. We set it to 1MB.
	while ((str = Z.read(1048576)) !== false) json += str;
	
	try {
		return JSON.parse(json);
	} catch(e) {
		Zotero.debug(e);
	}
}

function detectImport() {
	var parsedData = parseInput();
	if (parsedData && parsedData.schemaVersion && parsedData.schemaVersion.startsWith("http://datacite.org/schema/")) {
		return true;
	}
	return false;
}


var mappingTypes = {
	"book": "book",
	"chapter": "bookSection",
	"article-journal": "journalArticle",
	"article-magazine": "magazineArticle",
	"article-newspaper": "newspaperArticle",
	"thesis": "thesis",
	"entry-encyclopedia": "encyclopediaArticle",
	"entry-dictionary": "dictionaryEntry",
	"paper-conference": "conferencePaper",
	"personal_communication": "letter",
	"manuscript": "manuscript",
	"interview": "interview",
	"motion_picture": "film",
	"graphic": "artwork",
	"webpage": "webpage",
	"report": "report",
	"bill": "bill",
	"legal_case": "case",
	"patent": "patent",
	"legislation": "statute",
	"map": "map",
	"post-weblog": "blogPost",
	"post": "forumPost",
	"song": "audioRecording",
	"speech": "presentation",
	"broadcast": "radioBroadcast",
	"dataset": "document"
};



function doImport() {
	var data = parseInput();

	var type = "journalArticle";
	if (data.types.citeproc && mappingTypes[data.types.citeproc]) {
		type = mappingTypes[data.types.citeproc];
	}
	if (["softwaresourcecode", "softwareapplication", "mobileapplication", "videogame", "webapplication"].includes(data.types.schemaOrg.toLowerCase())) {
		type = "computerProgram";
	}

	var item = new Zotero.Item(type);
	if (data.types.citeproc == "dataset") {
		item.extra = "type: dataset";
	}
	var title = "";
	for (let titleElement of data.titles) {
		if (!titleElement.title) {
			continue;
		}
		if (!titleElement.titleType) {
			title = titleElement.title + title;
		} else if (titleElement.titleType.toLowerCase() == "subtitle") {
			title = title + ": " + titleElement["title"];
		}
		
	}
	item.title = title;
	
	for (let creator of data.creators) {
		if (creator.nameType == "Personal") {
			if (creator.familyName && creator.givenName) {
				item.creators.push({
					"lastName": creator.familyName,
					"firstName": creator.givenName,
					"creatorType": "author"
				});
			} else {
				item.creators.push(ZU.cleanAuthor(creator.name, "author"));
			}
		} else {
			item.creators.push({"lastName": creator.name, "creatorType": "author", "fieldMode": true});
		}
	}
	for (let contributor of data.contributors) {
		let role = "contributor";
		if (contributor.contributorRole) {
			switch(contributor.contributorRole.toLowerCase()) {
				case "editor":
					role = "editor";
					break;
				case "producer":
					role = "producer";
					break;
				default:
					// use the already assigned value
			}
		}
		if (contributor.nameType == "Personal") {
			if (contributor.familyName && contributor.givenName) {
				item.creators.push({
					"lastName": contributor.familyName,
					"firstName": contributor.givenName,
					"creatorType": role
				});
			} else {
				item.creators.push(ZU.cleanAuthor(contributor.name, role));
			}
		} else {
			item.creators.push({"lastName": contributor.name, "creatorType": role, "fieldMode": true});
		}
	}
	
	item.publisher = data.publisher;
	
	let dates = {};
	for (let date of data.dates) {
		dates[date.dateType] = date.date;
	}
	item.date = dates["Issued"] || dates["Updated"] || dates["Available"]  || dates["Accepted"] || dates["Submitted"] || dates["Created"] || data.publicationYear;
	
	item.DOI = data.doi;
	//add DOI to extra for unsupported items
	if (item.DOI && !ZU.fieldIsValidForType("DOI", item.itemType)) {
		if (item.extra){
			item.extra += "\nDOI: " + item.DOI;
		} else {
			item.extra = "DOI: " + item.DOI;
		}
	}
	item.url = data.url;
	item.language = data.language;
	for (let subject of data.subjects) {
		item.tags.push(subject.subject);
	}
	item.medium = data.formats.join();
	item.pages = item.artworkSize = data.sizes.join(", ");
	item.versionNumber = data.version;
	item.rights = data.rightsList.map(x => x.rights).join(", ");
	
	var descriptionNote = "";
	for (let description of data.descriptions) {
		if (description.descriptionType == "Abstract") {
			item.abstractNote = description.description;
		} else {
			descriptionNote += "<h2>" + description.descriptionType + "</h2>\n" + description.description;
		}
	}
	if (descriptionNote !== "") {
		item.notes.push({"note": descriptionNote});
	}
	if (data.container) {
		if (data.container.type == "Series") {
			item.publicationTitle = data.container.title;
			item.volume = data.container.volume;
			var pages = (data.container.firstPage || "") + (data.container.lastPage || "");
			if (!item.pages && pages !== "") {
				item.pages = pages;
			}
		}
		if (data.container.identifier && data.container.identifierType) {
			if (data.container.identifierType == "ISSN") {
				item.ISSN = data.container.identifier;
			}
			if (data.container.identifierType == "ISBN") {
				item.ISBN = data.container.identifier;
			}
		}
	}
	
	for (let relates of data.relatedIdentifiers) {
		if (!item.ISSN && relates.relatedIdentifierType == "ISSN") {
			item.ISSN = relates.relatedIdentifier;
		}
		if (!item.ISBN && relates.relatedIdentifierType == "ISBN") {
			item.ISBN = relates.relatedIdentifier;
		}
	}
	
	

	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "{\n  \"id\": \"https://doi.org/10.5281/zenodo.2548653\",\n  \"doi\": \"10.5281/zenodo.2548653\",\n  \"url\": \"https://zenodo.org/record/2548653\",\n  \"types\": {\n    \"resourceTypeGeneral\": \"Text\",\n    \"resourceType\": \"Journal article\",\n    \"schemaOrg\": \"ScholarlyArticle\",\n    \"citeproc\": \"article-journal\",\n    \"bibtex\": \"article\",\n    \"ris\": \"RPRT\"\n  },\n  \"creators\": [\n    {\n      \"nameType\": \"Personal\",\n      \"name\": \"Dube, Zenzo Lusaba\",\n      \"givenName\": \"Zenzo Lusaba\",\n      \"familyName\": \"Dube\",\n      \"affiliation\": \"National University of Science and Technology, Zimbabwe\"\n    },\n    {\n      \"nameType\": \"Personal\",\n      \"name\": \"Murahwe, Gloria Rosi\",\n      \"givenName\": \"Gloria Rosi\",\n      \"familyName\": \"Murahwe\",\n      \"affiliation\": \"Reserve Bank of Zimbabwe\"\n    }\n  ],\n  \"titles\": [\n    {\n      \"title\": \"An analysis of corporate governance practices in government controlled versus private banking institutions in Zimbabwe\"\n    }\n  ],\n  \"publisher\": \"Zenodo\",\n  \"container\": {\n    \"type\": \"Series\",\n    \"identifier\": \"https://zenodo.org/communities/nustlibrary44\",\n    \"identifierType\": \"URL\"\n  },\n  \"subjects\": [\n    {\n      \"subject\": \"corporate governance\"\n    },\n    {\n      \"subject\": \"private banking\"\n    }\n  ],\n  \"contributors\": [\n\n  ],\n  \"dates\": [\n    {\n      \"date\": \"2015-01-01\",\n      \"dateType\": \"Issued\"\n    }\n  ],\n  \"publicationYear\": \"2015\",\n  \"language\": \"en\",\n  \"identifiers\": [\n    {\n      \"identifierType\": \"DOI\",\n      \"identifier\": \"https://doi.org/10.5281/zenodo.2548653\"\n    },\n    {\n      \"identifierType\": \"URL\",\n      \"identifier\": \"https://zenodo.org/record/2548653\"\n    }\n  ],\n  \"sizes\": [\n\n  ],\n  \"formats\": [\n\n  ],\n  \"rightsList\": [\n    {\n      \"rights\": \"Creative Commons Attribution 4.0 International\",\n      \"rightsUri\": \"http://creativecommons.org/licenses/by/4.0/legalcode\"\n    },\n    {\n      \"rights\": \"Open Access\",\n      \"rightsUri\": \"info:eu-repo/semantics/openAccess\"\n    }\n  ],\n  \"descriptions\": [\n    {\n      \"description\": \"The significance of good corporate governance practices is of paramount importance. It can be posited that the Zimbabwean banking sector crisis of the period 2003 to 2004 was largely due to poor corporate governance practices. Most of the banking institutions that faced closure in that era were of domestic origin. This crisis however did not affect the Government owned banks. This was a paradox as private banks are seen as profitable compared to Government owned banks. The paper sought to ascertain who between the government and private banks better adhered to corporate governance principles. Twenty one banks were involved in this study. A total of 39 questionnaires were sent, three per bank. Ten face to face interviews were conducted with the banks' directors and managers. The paper unearthed that corporate governance practices are observed by both private banks and government controlled banks; however private banks appear to have a slighter edge. Government owned banks do have good corporate practices in place\",\n      \"descriptionType\": \"Abstract\"\n    },\n    {\n      \"description\": \"This is an open access article distributed under the Creative Commons Attribution License, which permits unrestricted use, distribution, and reproduction in any medium, provided the original work is properly cited.\",\n      \"descriptionType\": \"Other\"\n    }\n  ],\n  \"geoLocations\": [\n\n  ],\n  \"fundingReferences\": [\n\n  ],\n  \"relatedIdentifiers\": [\n    {\n      \"relatedIdentifier\": \"10.5281/zenodo.2548652\",\n      \"relatedIdentifierType\": \"DOI\",\n      \"relationType\": \"IsVersionOf\"\n    },\n    {\n      \"relatedIdentifier\": \"https://zenodo.org/communities/nustlibrary44\",\n      \"relatedIdentifierType\": \"URL\",\n      \"relationType\": \"IsPartOf\"\n    }\n  ],\n  \"schemaVersion\": \"http://datacite.org/schema/kernel-4\",\n  \"providerId\": \"cern\",\n  \"clientId\": \"cern.zenodo\",\n  \"agency\": \"DataCite\",\n  \"state\": \"findable\"\n}",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "An analysis of corporate governance practices in government controlled versus private banking institutions in Zimbabwe",
				"creators": [
					{
						"lastName": "Dube",
						"firstName": "Zenzo Lusaba",
						"creatorType": "author"
					},
					{
						"lastName": "Murahwe",
						"firstName": "Gloria Rosi",
						"creatorType": "author"
					}
				],
				"date": "2015-01-01",
				"DOI": "10.5281/zenodo.2548653",
				"abstractNote": "The significance of good corporate governance practices is of paramount importance. It can be posited that the Zimbabwean banking sector crisis of the period 2003 to 2004 was largely due to poor corporate governance practices. Most of the banking institutions that faced closure in that era were of domestic origin. This crisis however did not affect the Government owned banks. This was a paradox as private banks are seen as profitable compared to Government owned banks. The paper sought to ascertain who between the government and private banks better adhered to corporate governance principles. Twenty one banks were involved in this study. A total of 39 questionnaires were sent, three per bank. Ten face to face interviews were conducted with the banks' directors and managers. The paper unearthed that corporate governance practices are observed by both private banks and government controlled banks; however private banks appear to have a slighter edge. Government owned banks do have good corporate practices in place",
				"language": "en",
				"rights": "Creative Commons Attribution 4.0 International, Open Access",
				"url": "https://zenodo.org/record/2548653",
				"attachments": [],
				"tags": [
					{
						"tag": "corporate governance"
					},
					{
						"tag": "private banking"
					}
				],
				"notes": [
					{
						"note": "<h2>Other</h2>\nThis is an open access article distributed under the Creative Commons Attribution License, which permits unrestricted use, distribution, and reproduction in any medium, provided the original work is properly cited."
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "{\n  \"id\": \"https://doi.org/10.5438/n138-z3mk\",\n  \"doi\": \"10.5438/n138-z3mk\",\n  \"url\": \"https://github.com/datacite/bolognese\",\n  \"types\": {\n    \"resourceTypeGeneral\": \"Software\",\n    \"resourceType\": \"SoftwareSourceCode\",\n    \"schemaOrg\": \"SoftwareSourceCode\",\n    \"citeproc\": \"article\",\n    \"bibtex\": \"misc\",\n    \"ris\": \"COMP\"\n  },\n  \"creators\": [\n    {\n      \"nameType\": \"Personal\",\n      \"name\": \"Fenner, Martin\",\n      \"givenName\": \"Martin\",\n      \"familyName\": \"Fenner\",\n      \"nameIdentifiers\": [\n        {\n          \"nameIdentifier\": \"https://orcid.org/0000-0003-0077-4738\",\n          \"nameIdentifierScheme\": \"ORCID\"\n        }\n      ]\n    }\n  ],\n  \"titles\": [\n    {\n      \"title\": \"Bolognese: a Ruby library for conversion of DOI Metadata\"\n    }\n  ],\n  \"publisher\": \"DataCite\",\n  \"container\": {\n  },\n  \"subjects\": [\n    {\n      \"subject\": \"doi\"\n    },\n    {\n      \"subject\": \"metadata\"\n    },\n    {\n      \"subject\": \"crossref\"\n    },\n    {\n      \"subject\": \"datacite\"\n    },\n    {\n      \"subject\": \"schema.org\"\n    },\n    {\n      \"subject\": \"bibtex\"\n    },\n    {\n      \"subject\": \"codemeta\"\n    }\n  ],\n  \"contributors\": [\n\n  ],\n  \"dates\": [\n    {\n      \"date\": \"2017-02-13\",\n      \"dateType\": \"Created\"\n    },\n    {\n      \"date\": \"2017-02-25\",\n      \"dateType\": \"Issued\"\n    },\n    {\n      \"date\": \"2017-02-25\",\n      \"dateType\": \"Updated\"\n    }\n  ],\n  \"publicationYear\": \"2017\",\n  \"identifiers\": [\n    {\n      \"identifierType\": \"DOI\",\n      \"identifier\": \"https://doi.org/10.5438/n138-z3mk\"\n    }\n  ],\n  \"sizes\": [\n\n  ],\n  \"formats\": [\n\n  ],\n  \"rightsList\": [\n\n  ],\n  \"descriptions\": [\n    {\n      \"description\": \"Ruby gem and command-line utility for conversion of DOI metadata from and to different metadata formats, including schema.org.\",\n      \"descriptionType\": \"Abstract\"\n    }\n  ],\n  \"geoLocations\": [\n\n  ],\n  \"fundingReferences\": [\n\n  ],\n  \"relatedIdentifiers\": [\n\n  ],\n  \"schemaVersion\": \"http://datacite.org/schema/kernel-4\",\n  \"providerId\": \"datacite\",\n  \"clientId\": \"datacite.datacite\",\n  \"agency\": \"DataCite\",\n  \"state\": \"findable\"\n}",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "Bolognese: a Ruby library for conversion of DOI Metadata",
				"creators": [
					{
						"lastName": "Fenner",
						"firstName": "Martin",
						"creatorType": "author"
					}
				],
				"date": "2017-02-25",
				"abstractNote": "Ruby gem and command-line utility for conversion of DOI metadata from and to different metadata formats, including schema.org.",
				"company": "DataCite",
				"extra": "DOI: 10.5438/n138-z3mk",
				"url": "https://github.com/datacite/bolognese",
				"attachments": [],
				"tags": [
					{
						"tag": "bibtex"
					},
					{
						"tag": "codemeta"
					},
					{
						"tag": "crossref"
					},
					{
						"tag": "datacite"
					},
					{
						"tag": "doi"
					},
					{
						"tag": "metadata"
					},
					{
						"tag": "schema.org"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "{\n  \"id\": \"https://doi.org/10.3205/mbi000337\",\n  \"doi\": \"10.3205/mbi000337\",\n  \"url\": \"http://www.egms.de/en/journals/mbi/2015-15/mbi000337.shtml\",\n  \"types\": {\n    \"resourceTypeGeneral\": \"Text\",\n    \"resourceType\": \"Journal Article\",\n    \"schemaOrg\": \"ScholarlyArticle\",\n    \"citeproc\": \"article-journal\",\n    \"bibtex\": \"article\",\n    \"ris\": \"RPRT\"\n  },\n  \"creators\": [\n    {\n      \"nameType\": \"Personal\",\n      \"name\": \"Miljković, Natascha\",\n      \"givenName\": \"Natascha\",\n      \"familyName\": \"Miljković\",\n      \"affiliation\": \"Zitier-Weise, Agentur für Plagiatprävention e.U., Wien, Österreich\"\n    }\n  ],\n  \"titles\": [\n    {\n      \"title\": \"Mehr Schaden als Nutzen? Problematischer Einsatz von Textvergleichsprogrammen zur vermeintlichen Plagiatsvermeidung\",\n      \"lang\": \"de\"\n    },\n    {\n      \"title\": \"Doing more harm than good? Disputable use of text matching software as assumed plagiarism prevention method\",\n      \"titleType\": \"TranslatedTitle\",\n      \"lang\": \"en\"\n    }\n  ],\n  \"publisher\": \"German Medical Science GMS Publishing House\",\n  \"container\": {\n    \"type\": \"Series\",\n    \"identifier\": \"1865-066X\",\n    \"identifierType\": \"ISSN\",\n    \"title\": \"GMS Medizin - Bibliothek - Information; 15(1-2):Doc10\"\n  },\n  \"subjects\": [\n    {\n      \"subject\": \"plagiarism detection\",\n      \"lang\": \"en\"\n    },\n    {\n      \"subject\": \"plagiarism detection software\",\n      \"lang\": \"en\"\n    },\n    {\n      \"subject\": \"text matching analysis\",\n      \"lang\": \"en\"\n    },\n    {\n      \"subject\": \"scientific writing\",\n      \"lang\": \"en\"\n    },\n    {\n      \"subject\": \"forms of plagiarism\",\n      \"lang\": \"en\"\n    },\n    {\n      \"subject\": \"misconceptions\",\n      \"lang\": \"en\"\n    },\n    {\n      \"subject\": \"Plagiatsprüfung\",\n      \"lang\": \"de\"\n    },\n    {\n      \"subject\": \"Plagiatsprüfprogramme\",\n      \"lang\": \"de\"\n    },\n    {\n      \"subject\": \"Textvergleichsanalysen\",\n      \"lang\": \"de\"\n    },\n    {\n      \"subject\": \"wissenschaftlich Schreiben\",\n      \"lang\": \"de\"\n    },\n    {\n      \"subject\": \"Plagiatsformen\",\n      \"lang\": \"de\"\n    },\n    {\n      \"subject\": \"Falschannahmen\",\n      \"lang\": \"de\"\n    },\n    {\n      \"subject\": \"610 Medical sciences; Medicine\",\n      \"subjectScheme\": \"DDC\"\n    }\n  ],\n  \"contributors\": [\n\n  ],\n  \"dates\": [\n    {\n      \"date\": \"2015-08-12\",\n      \"dateType\": \"Issued\"\n    }\n  ],\n  \"publicationYear\": \"2015\",\n  \"language\": \"de\",\n  \"identifiers\": [\n    {\n      \"identifierType\": \"DOI\",\n      \"identifier\": \"https://doi.org/10.3205/mbi000337\"\n    },\n    {\n      \"identifierType\": \"URN\",\n      \"identifier\": \"urn:nbn:de:0183-mbi0003372\"\n    },\n    {\n      \"identifierType\": \"Doc\",\n      \"identifier\": \"mbi000337\"\n    }\n  ],\n  \"sizes\": [\n\n  ],\n  \"formats\": [\n    \"text/html\"\n  ],\n  \"rightsList\": [\n    {\n      \"rights\": \"Dieser Artikel ist ein Open-Access-Artikel und steht unter den Lizenzbedingungen der Creative Commons Attribution 4.0 License (Namensnennung).\",\n      \"rightsUri\": \"http://creativecommons.org/licenses/by/4.0\"\n    }\n  ],\n  \"descriptions\": [\n    {\n      \"description\": \"The number of so called plagiarism detection software is ever-growing, though hardly any of those products are really useful as marketed. Especially since their producers force-fed the term plagiarism detection – in stark contrast to the only function they have, which is text matching – to their customers, several misconceptions have established, which keep circulating within higher education institutions rather persistently, thus even hindering the establishment of efficient prevention strategies within. By all means are those products not sufficient enough as sole preventing method against plagiarism and will never be technically mature enough to find all forms of scientifically unethical writing methods.\",\n      \"descriptionType\": \"Abstract\",\n      \"lang\": \"en\"\n    },\n    {\n      \"description\": \"Die Liste an selbst ernannten Plagiatsprüfprogrammen ist lang und wächst ständig, brauchbar wie propagiert sind jedoch nur wenige davon. Besonders durch die gezielte Werbung der ProgrammherstellerInnen mit dem Begriff Plagiatsdetektion – im Gegensatz zu ihrer einzigen tatsächlichen Funktionsweise, dem bloßen Textvergleich –, haben sich einige falsche Annahmen zu diesen Produkten ergeben, die sich im universitären Bereich leider sehr hartnäckig halten und bei der Konzeptionierung effizienter Präventionsmaßnahmen sogar hinderlich sein können. Als einzige eingesetzte präventive Maßnahme (im weitesten Sinne) sind diese Programme völlig unzureichend und können technisch zudem ohnedies nicht alle Formen von unwissenschaftlichen Schreibverhalten finden.\",\n      \"descriptionType\": \"Abstract\",\n      \"lang\": \"de\"\n    },\n    {\n      \"description\": \"GMS Medizin - Bibliothek - Information; 15(1-2):Doc10\",\n      \"descriptionType\": \"SeriesInformation\"\n    }\n  ],\n  \"geoLocations\": [\n\n  ],\n  \"fundingReferences\": [\n\n  ],\n  \"relatedIdentifiers\": [\n    {\n      \"relatedIdentifier\": \"1865-066X\",\n      \"relatedIdentifierType\": \"ISSN\",\n      \"relationType\": \"IsPartOf\"\n    }\n  ],\n  \"schemaVersion\": \"http://datacite.org/schema/kernel-3\",\n  \"providerId\": \"zbmed\",\n  \"clientId\": \"zbmed.gms\",\n  \"agency\": \"DataCite\",\n  \"state\": \"findable\"\n}",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Mehr Schaden als Nutzen? Problematischer Einsatz von Textvergleichsprogrammen zur vermeintlichen Plagiatsvermeidung",
				"creators": [
					{
						"lastName": "Miljković",
						"firstName": "Natascha",
						"creatorType": "author"
					}
				],
				"date": "2015-08-12",
				"DOI": "10.3205/mbi000337",
				"ISSN": "1865-066X",
				"abstractNote": "Die Liste an selbst ernannten Plagiatsprüfprogrammen ist lang und wächst ständig, brauchbar wie propagiert sind jedoch nur wenige davon. Besonders durch die gezielte Werbung der ProgrammherstellerInnen mit dem Begriff Plagiatsdetektion – im Gegensatz zu ihrer einzigen tatsächlichen Funktionsweise, dem bloßen Textvergleich –, haben sich einige falsche Annahmen zu diesen Produkten ergeben, die sich im universitären Bereich leider sehr hartnäckig halten und bei der Konzeptionierung effizienter Präventionsmaßnahmen sogar hinderlich sein können. Als einzige eingesetzte präventive Maßnahme (im weitesten Sinne) sind diese Programme völlig unzureichend und können technisch zudem ohnedies nicht alle Formen von unwissenschaftlichen Schreibverhalten finden.",
				"language": "de",
				"publicationTitle": "GMS Medizin - Bibliothek - Information; 15(1-2):Doc10",
				"rights": "Dieser Artikel ist ein Open-Access-Artikel und steht unter den Lizenzbedingungen der Creative Commons Attribution 4.0 License (Namensnennung).",
				"url": "http://www.egms.de/en/journals/mbi/2015-15/mbi000337.shtml",
				"attachments": [],
				"tags": [
					{
						"tag": "610 Medical sciences; Medicine"
					},
					{
						"tag": "Falschannahmen"
					},
					{
						"tag": "Plagiatsformen"
					},
					{
						"tag": "Plagiatsprüfprogramme"
					},
					{
						"tag": "Plagiatsprüfung"
					},
					{
						"tag": "Textvergleichsanalysen"
					},
					{
						"tag": "forms of plagiarism"
					},
					{
						"tag": "misconceptions"
					},
					{
						"tag": "plagiarism detection"
					},
					{
						"tag": "plagiarism detection software"
					},
					{
						"tag": "scientific writing"
					},
					{
						"tag": "text matching analysis"
					},
					{
						"tag": "wissenschaftlich Schreiben"
					}
				],
				"notes": [
					{
						"note": "<h2>SeriesInformation</h2>\nGMS Medizin - Bibliothek - Information; 15(1-2):Doc10"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "{\n  \"id\": \"https://doi.org/10.17171/2-3-12-1\",\n  \"doi\": \"10.17171/2-3-12-1\",\n  \"url\": \"http://repository.edition-topoi.org/collection/MAGN/single/0012/0\",\n  \"types\": {\n    \"resourceTypeGeneral\": \"Dataset\",\n    \"resourceType\": \"3D Data\",\n    \"schemaOrg\": \"Dataset\",\n    \"citeproc\": \"dataset\",\n    \"bibtex\": \"misc\",\n    \"ris\": \"DATA\"\n  },\n  \"creators\": [\n    {\n      \"nameType\": \"Personal\",\n      \"name\": \"Fritsch, Bernhard\",\n      \"givenName\": \"Bernhard\",\n      \"familyName\": \"Fritsch\"\n    }\n  ],\n  \"titles\": [\n    {\n      \"title\": \"3D model of object V 1.2-71\"\n    },\n    {\n      \"title\": \"Structured-light Scan, Staatliche Museen zu Berlin -  Antikensammlung\",\n      \"titleType\": \"Subtitle\"\n    }\n  ],\n  \"publisher\": \"Edition Topoi\",\n  \"container\": {\n    \"type\": \"DataRepository\",\n    \"identifier\": \"10.17171/2-3-1\",\n    \"identifierType\": \"DOI\",\n    \"title\": \"Architectural Fragments from Magnesia on the Maeander\"\n  },\n  \"subjects\": [\n    {\n      \"subject\": \"101 Ancient Cultures\"\n    },\n    {\n      \"subject\": \"410-01 Building and Construction History\"\n    }\n  ],\n  \"contributors\": [\n\n  ],\n  \"dates\": [\n    {\n      \"date\": \"2016\",\n      \"dateType\": \"Updated\"\n    },\n    {\n      \"date\": \"2016\",\n      \"dateType\": \"Issued\"\n    }\n  ],\n  \"publicationYear\": \"2016\",\n  \"identifiers\": [\n    {\n      \"identifierType\": \"DOI\",\n      \"identifier\": \"https://doi.org/10.17171/2-3-12-1\"\n    }\n  ],\n  \"sizes\": [\n\n  ],\n  \"formats\": [\n    \"nxs\"\n  ],\n  \"rightsList\": [\n\n  ],\n  \"descriptions\": [\n    {\n      \"description\": \"Architectural Fragments from Magnesia on the Maeander\",\n      \"descriptionType\": \"SeriesInformation\"\n    }\n  ],\n  \"geoLocations\": [\n\n  ],\n  \"fundingReferences\": [\n\n  ],\n  \"relatedIdentifiers\": [\n    {\n      \"relatedIdentifier\": \"10.17171/2-3-1\",\n      \"relatedIdentifierType\": \"DOI\",\n      \"relationType\": \"IsPartOf\"\n    },\n    {\n      \"relatedIdentifier\": \"10.17171/2-3\",\n      \"relatedIdentifierType\": \"DOI\",\n      \"relationType\": \"IsPartOf\"\n    }\n  ],\n  \"schemaVersion\": \"http://datacite.org/schema/kernel-3\",\n  \"providerId\": \"tib\",\n  \"clientId\": \"tib.topoi\",\n  \"agency\": \"DataCite\",\n  \"state\": \"findable\"\n}",
		"items": [
			{
				"itemType": "document",
				"title": "3D model of object V 1.2-71: Structured-light Scan, Staatliche Museen zu Berlin -  Antikensammlung",
				"creators": [
					{
						"lastName": "Fritsch",
						"firstName": "Bernhard",
						"creatorType": "author"
					}
				],
				"date": "2016",
				"extra": "type: dataset\nDOI: 10.17171/2-3-12-1",
				"publisher": "Edition Topoi",
				"url": "http://repository.edition-topoi.org/collection/MAGN/single/0012/0",
				"attachments": [],
				"tags": [
					{
						"tag": "101 Ancient Cultures"
					},
					{
						"tag": "410-01 Building and Construction History"
					}
				],
				"notes": [
					{
						"note": "<h2>SeriesInformation</h2>\nArchitectural Fragments from Magnesia on the Maeander"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "{\n  \"id\": \"https://doi.org/10.21248/jfml.2018.6\",\n  \"doi\": \"10.21248/jfml.2018.6\",\n  \"url\": \"https://jfml.org/article/view/6\",\n  \"types\": {\n    \"resourceTypeGeneral\": \"Text\",\n    \"resourceType\": \"Article\",\n    \"schemaOrg\": \"ScholarlyArticle\",\n    \"citeproc\": \"article-journal\",\n    \"bibtex\": \"article\",\n    \"ris\": \"RPRT\"\n  },\n  \"creators\": [\n    {\n      \"nameType\": \"Personal\",\n      \"name\": \"Mostovaia, Irina\",\n      \"givenName\": \"Irina\",\n      \"familyName\": \"Mostovaia\"\n    }\n  ],\n  \"titles\": [\n    {\n      \"title\": \"Nonverbale graphische Ressourcen bei Reparaturen in der interaktionalen informellen Schriftlichkeit am Beispiel der deutschen Chat-Kommunikation via IRC-Chat und WhatsApp\"\n    }\n  ],\n  \"publisher\": \"Journal für Medienlinguistik\",\n  \"container\": {\n    \"type\": \"Series\",\n    \"title\": \"Journal für Medienlinguistik\",\n    \"firstPage\": \"Bd. 1 Nr. 1 (2018)\"\n  },\n  \"subjects\": [\n\n  ],\n  \"contributors\": [\n\n  ],\n  \"dates\": [\n    {\n      \"date\": \"2018-06-18\",\n      \"dateType\": \"Submitted\"\n    },\n    {\n      \"date\": \"2018-11-22\",\n      \"dateType\": \"Accepted\"\n    },\n    {\n      \"date\": \"2018-12-04\",\n      \"dateType\": \"Updated\"\n    },\n    {\n      \"date\": \"2018-12-04\",\n      \"dateType\": \"Issued\"\n    }\n  ],\n  \"publicationYear\": \"2018\",\n  \"language\": \"de\",\n  \"identifiers\": [\n    {\n      \"identifierType\": \"DOI\",\n      \"identifier\": \"https://doi.org/10.21248/jfml.2018.6\"\n    },\n    {\n      \"identifierType\": \"publisherId\",\n      \"identifier\": \"1-3-6\"\n    }\n  ],\n  \"sizes\": [\n    \"42-79 Seiten\"\n  ],\n  \"formats\": [\n\n  ],\n  \"rightsList\": [\n    {\n      \"rights\": \"Dieses Werk steht unter der Lizenz Creative Commons Namensnennung - Weitergabe unter gleichen Bedingungen 4.0 International.\",\n      \"rightsUri\": \"http://creativecommons.org/licenses/by-sa/4.0\"\n    }\n  ],\n  \"descriptions\": [\n    {\n      \"description\": \"The aim of this paper is to present the results of an empirical analysis of the use of non-alphabetic graphic signs (e.g. asterisks, slashes, plus signs etc.) in the context of repairs in Russian and German informal electronic communication. The data for the analysis were taken from the “Mobile Communication Database MoCoDa” (https://www.uni-due.de/~hg0263/SMSDB), which contains Russian and German private electronic communication via SMS, WhatsApp and other short message services, and the “Dortmunder Chat-Korpus” (http://www.chatkorpus.tu-dortmund.de/korpora.html). This paper describes the functions of various graphic resources in the context of repairs in both data collections and compares the occurrences of these functions in current Russian and German computer-mediated communication. It concludes that particular signs in both data sets share the same subset of functions, but they differ in terms of how frequently these resources occur in each form of communication.\",\n      \"descriptionType\": \"Abstract\"\n    },\n    {\n      \"description\": \"Journal für Medienlinguistik, Bd. 1 Nr. 1 (2018)\",\n      \"descriptionType\": \"SeriesInformation\"\n    }\n  ],\n  \"geoLocations\": [\n\n  ],\n  \"fundingReferences\": [\n\n  ],\n  \"relatedIdentifiers\": [\n\n  ],\n  \"schemaVersion\": \"http://datacite.org/schema/kernel-4\",\n  \"providerId\": \"gesis\",\n  \"clientId\": \"gesis.ubjcs\",\n  \"agency\": \"DataCite\",\n  \"state\": \"findable\"\n}",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Nonverbale graphische Ressourcen bei Reparaturen in der interaktionalen informellen Schriftlichkeit am Beispiel der deutschen Chat-Kommunikation via IRC-Chat und WhatsApp",
				"creators": [
					{
						"lastName": "Mostovaia",
						"firstName": "Irina",
						"creatorType": "author"
					}
				],
				"date": "2018-12-04",
				"DOI": "10.21248/jfml.2018.6",
				"abstractNote": "The aim of this paper is to present the results of an empirical analysis of the use of non-alphabetic graphic signs (e.g. asterisks, slashes, plus signs etc.) in the context of repairs in Russian and German informal electronic communication. The data for the analysis were taken from the “Mobile Communication Database MoCoDa” (https://www.uni-due.de/~hg0263/SMSDB), which contains Russian and German private electronic communication via SMS, WhatsApp and other short message services, and the “Dortmunder Chat-Korpus” (http://www.chatkorpus.tu-dortmund.de/korpora.html). This paper describes the functions of various graphic resources in the context of repairs in both data collections and compares the occurrences of these functions in current Russian and German computer-mediated communication. It concludes that particular signs in both data sets share the same subset of functions, but they differ in terms of how frequently these resources occur in each form of communication.",
				"language": "de",
				"pages": "42-79 Seiten",
				"publicationTitle": "Journal für Medienlinguistik",
				"rights": "Dieses Werk steht unter der Lizenz Creative Commons Namensnennung - Weitergabe unter gleichen Bedingungen 4.0 International.",
				"url": "https://jfml.org/article/view/6",
				"attachments": [],
				"tags": [],
				"notes": [
					{
						"note": "<h2>SeriesInformation</h2>\nJournal für Medienlinguistik, Bd. 1 Nr. 1 (2018)"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "{\n  \"id\": \"https://doi.org/10.17885/heiup.jts.2018.1-2.23812\",\n  \"doi\": \"10.17885/heiup.jts.2018.1-2.23812\",\n  \"url\": \"https://heiup.uni-heidelberg.de/journals/index.php/transcultural/article/view/23812\",\n  \"types\": {\n    \"resourceTypeGeneral\": \"Text\",\n    \"resourceType\": \"Article\",\n    \"schemaOrg\": \"ScholarlyArticle\",\n    \"citeproc\": \"article-journal\",\n    \"bibtex\": \"article\",\n    \"ris\": \"RPRT\"\n  },\n  \"creators\": [\n    {\n      \"nameType\": \"Personal\",\n      \"name\": \"Gadkar-Wilcox, Wynn\",\n      \"givenName\": \"Wynn\",\n      \"familyName\": \"Gadkar-Wilcox\"\n    }\n  ],\n  \"titles\": [\n    {\n      \"title\": \"Universality, Modernity and Cultural Borrowing Among Vietnamese Intellectuals, 1877–1919\"\n    }\n  ],\n  \"publisher\": \"The Journal of Transcultural Studies\",\n  \"container\": {\n    \"type\": \"Series\",\n    \"title\": \"The Journal of Transcultural Studies\",\n    \"firstPage\": \"No 1\",\n    \"lastPage\": \"2 (2018)\"\n  },\n  \"subjects\": [\n\n  ],\n  \"contributors\": [\n\n  ],\n  \"dates\": [\n    {\n      \"date\": \"2018-07-16\",\n      \"dateType\": \"Submitted\"\n    },\n    {\n      \"date\": \"2018-09-27\",\n      \"dateType\": \"Accepted\"\n    },\n    {\n      \"date\": \"2019-01-16\",\n      \"dateType\": \"Updated\"\n    },\n    {\n      \"date\": \"2018-12-20\",\n      \"dateType\": \"Issued\"\n    }\n  ],\n  \"publicationYear\": \"2018\",\n  \"language\": \"en\",\n  \"identifiers\": [\n    {\n      \"identifierType\": \"DOI\",\n      \"identifier\": \"https://doi.org/10.17885/heiup.jts.2018.1-2.23812\"\n    },\n    {\n      \"identifierType\": \"publisherId\",\n      \"identifier\": \"22-2384-23812\"\n    }\n  ],\n  \"sizes\": [\n    \"33–52 Pages\"\n  ],\n  \"formats\": [\n\n  ],\n  \"rightsList\": [\n    {\n      \"rights\": \"This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License.\",\n      \"rightsUri\": \"http://creativecommons.org/licenses/by-nc/4.0\"\n    }\n  ],\n  \"descriptions\": [\n    {\n      \"description\": \"After 1897, as the power of the Nguyen Monarchy was increasingly restricted by a centralizing administration in French Indochina, it sought to retain its relevance by grappling with reformist ideas, especially those associated with Xu Jiyu, Tan Sitong, and Liang Qichao. This paper examines the influence of those thinkers on the policy questions of 1877, 1904, and 1919 and proposes that even when the monarchy was defending more traditional ideas against reform, these new conceptions were fundamentally transforming the thinking of even more conservative elites.\",\n      \"descriptionType\": \"Abstract\"\n    },\n    {\n      \"description\": \"The Journal of Transcultural Studies, No 1-2 (2018)\",\n      \"descriptionType\": \"SeriesInformation\"\n    }\n  ],\n  \"geoLocations\": [\n\n  ],\n  \"fundingReferences\": [\n\n  ],\n  \"relatedIdentifiers\": [\n\n  ],\n  \"schemaVersion\": \"http://datacite.org/schema/kernel-4\",\n  \"providerId\": \"gesis\",\n  \"clientId\": \"gesis.ubhd\",\n  \"agency\": \"DataCite\",\n  \"state\": \"findable\"\n}",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Universality, Modernity and Cultural Borrowing Among Vietnamese Intellectuals, 1877–1919",
				"creators": [
					{
						"lastName": "Gadkar-Wilcox",
						"firstName": "Wynn",
						"creatorType": "author"
					}
				],
				"date": "2018-12-20",
				"DOI": "10.17885/heiup.jts.2018.1-2.23812",
				"abstractNote": "After 1897, as the power of the Nguyen Monarchy was increasingly restricted by a centralizing administration in French Indochina, it sought to retain its relevance by grappling with reformist ideas, especially those associated with Xu Jiyu, Tan Sitong, and Liang Qichao. This paper examines the influence of those thinkers on the policy questions of 1877, 1904, and 1919 and proposes that even when the monarchy was defending more traditional ideas against reform, these new conceptions were fundamentally transforming the thinking of even more conservative elites.",
				"language": "en",
				"pages": "33–52 Pages",
				"publicationTitle": "The Journal of Transcultural Studies",
				"rights": "This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License.",
				"url": "https://heiup.uni-heidelberg.de/journals/index.php/transcultural/article/view/23812",
				"attachments": [],
				"tags": [],
				"notes": [
					{
						"note": "<h2>SeriesInformation</h2>\nThe Journal of Transcultural Studies, No 1-2 (2018)"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
