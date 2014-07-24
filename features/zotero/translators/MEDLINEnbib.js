{
	"translatorID": "9ec64cfd-bea7-472a-9557-493c0c26b0fb",
	"label": "MEDLINE/nbib",
	"creator": "Sebastian Karcher",
	"target": "txt",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"configOptions": {
		"dataMode": "line"
	},
	"inRepository": true,
	"translatorType": 1,
	"browserSupport": "gcsv",
	"lastUpdated": "2014-03-12 04:43:57"
}

/*
MEDLINE/nbib import translator
Based on http://www.nlm.nih.gov/bsd/mms/medlineelements.html
Created as part of the 2014 Zotero Trainer Workshop in Syracus and with contributions from participants.
Copyright (C) 2014 Sebastian Karcher 

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

function detectImport() {
	var line;
	var i = 0;
	while ((line = Zotero.read()) !== false) {
		line = line.replace(/^\s+/, "");
		if (line != "") {
			//Actual MEDLINE format starts with PMID
			if (line.substr(0, 6).match(/^PMID( {1, 2})?- /)) {
				return true;
			} else {
				if (i++ > 3) {
					return false;
				}
			}
		}
	}
}

var fieldMap = {
	TI: "title",
	VI: "volume",
	IP: "issue",
	PL: "place",
	PB: "publisher", //not in the specs, but is used 
	BTI: "bookTitle",
	JT: "publicationTitle",
	TA: "journalAbbreviation",
	PG: "pages",
	CI: "rights",
	ISBN: "ISBN",
	ISSN: "ISSN",
	LA: "language",
	EN: "edition",
	AB: "abstractNote"
};


// Only the most basic types. Most official MEDLINE types make little sense as item types 
var inputTypeMap = {
	"Book": "book",
	"Book Chapter": "bookSection", //can't find in specs, but is used.
	"Journal Article": "journalArticle",
	"Newspaper Article": "newspaperArticle",
	"Video-Audio Media": "videoRecording",
	"Technical Report": "report",
	"Legal Case": "case",
	"Legislation": "statute"
};

var isEndNote = false;

function processTag(item, tag, value) {
	value = Zotero.Utilities.trim(value);
	if (fieldMap[tag]) {
		item[fieldMap[tag]] = value;
	} else if (tag == "PT") {
		if (inputTypeMap[value]) { // first check inputTypeMap
			item.itemType = inputTypeMap[value]
		}
	} else if (tag == "FAU" || tag == "FED") {
		if (tag == "FAU") {
			var type = "author";
		} else if (tag == "FED") {
			var type = "editor";
		}
		item.creators.push(Zotero.Utilities.cleanAuthor(value, type, value.indexOf(",") != -1));
	} else if (tag == "AU" || tag == "ED") { //save normal author tags as fallback
		if (tag == "AU") {
			var type = "author";
		} else if (tag == "ED") {
			var type = "editor";
		}
		value = value.replace(/\s([A-Z]+)$/, ", $1")
		item.creatorsBackup.push(Zotero.Utilities.cleanAuthor(value, type, value.indexOf(",") != -1));
	} else if (tag == "PMID") {
		item.extra = "PMID: " + value;
	} else if (tag == "PMC") {
		item.extra += " \nPMCID: " + value;
	} else if (tag == "AID") {
		if (value.indexOf("[doi]") != -1) item.DOI = value.replace(/\s*\[doi\]/, "")
	} else if (tag == "DP") {
		item.date = value;
	} else if (tag == "MH") {
		item.tags.push(value);
	}
}

function doImport() {
	var line = true;
	var tag = data = false;
	do { // first valid line is type
		Zotero.debug("ignoring " + line);
		line = Zotero.read();
		line = line.replace(/^\s+/, "");
	} while (line !== false && line.search(/^[A-Z0-9]+\s*-/) == -1);

	var item = new Zotero.Item();
	item.creatorsBackup = [];
	var tag = line.match(/^[A-Z0-9]+/)[0];
	var data = line.substr(line.indexOf("-") + 1);
	while ((line = Zotero.read()) !== false) { // until EOF
		line = line.replace(/^\s+/, "");
		if (!line) {
			if (tag) {
				processTag(item, tag, data);
				// unset info
				tag = data = false;
				// new item
				finalizeItem(item)
				item = new Zotero.Item();
				item.creatorsBackup = [];
			}
		} else if (line.search(/^[A-Z0-9]+\s*-/) != -1) {
			// if this line is a tag, take a look at the previous line to map
			// its tag
			if (tag) {
				processTag(item, tag, data);
			}

			// then fetch the tag and data from this line
			tag = line.match(/^[A-Z0-9]+/)[0];
			data = line.substr(line.indexOf("-") + 1);
		} else {
			// otherwise, assume this is data from the previous line continued
			if (tag) {
				data += " " + line;
			}
		}
	}

	if (tag) { // save any unprocessed tags
		processTag(item, tag, data);
		// and finalize with some post-processing
		finalizeItem(item)
	}
}

function finalizeItem(item) {
	//if we didn't get full authors (included post 2002, sub in the basic authors)
	if (item.creators.length == 0 && item.creatorsBackup.length > 0) {
		item.creators = item.creatorsBackup;
	}
	delete item.creatorsBackup;
	if(item.pages) {
		//where page ranges are given in an abbreviated format, convert to full
		//taken verbatim from NCBI Pubmed translator
		var pageRangeRE = /(\d+)-(\d+)/g;
		pageRangeRE.lastIndex = 0;
		var range;
		while(range = pageRangeRE.exec(item.pages)) {
			var pageRangeStart = range[1];
			var pageRangeEnd = range[2];
			var diff = pageRangeStart.length - pageRangeEnd.length;
			if(diff > 0) {
				pageRangeEnd = pageRangeStart.substring(0,diff) + pageRangeEnd;
				var newRange = pageRangeStart + "-" + pageRangeEnd;
				var fullPageRange = item.pages.substring(0, range.index) //everything before current range
					+ newRange	//insert the new range
					+ item.pages.substring(range.index + range[0].length);	//everything after the old range
				//adjust RE index
				pageRangeRE.lastIndex += newRange.length - range[0].length;
			}
		}
		item.pages = fullPageRange;
	}
	//journal article is the fallback item type
	if (!item.itemType) item.itemType = inputTypeMap["Journal Article"];
	//titles for books are mapped to bookTitle
	if (item.itemType == "book") item.title = item.bookTitle;
	item.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "PMID- 8692918\nOWN - NLM\nSTAT- MEDLINE\nDA  - 19960829\nDCOM- 19960829\nLR  - 20131121\nIS  - 0027-8424 (Print)\nIS  - 0027-8424 (Linking)\nVI  - 93\nIP  - 14\nDP  - 1996 Jul 9\nTI  - The structure of bovine F1-ATPase complexed with the antibiotic inhibitor\n      aurovertin B.\nPG  - 6913-7\nAB  - In the structure of bovine mitochondrial F1-ATPase that was previously determined\n      with crystals grown in the presence of adenylyl-imidodiphosphate (AMP-PNP) and\n      ADP, the three catalytic beta-subunits have different conformations and\n      nucleotide occupancies. Adenylyl-imidodiphosphate is bound to one beta-subunit\n      (betaTP), ADP is bound to the second (betaDP), and no nucleotide is bound to the \n      third (betaE). Here we show that the uncompetitive inhibitor aurovertin B binds\n      to bovine F1 at two equivalent sites in betaTP and betaE, in a cleft between the \n      nucleotide binding and C-terminal domains. In betaDP, the aurovertin B pocket is \n      incomplete and is inaccessible to the inhibitor. The aurovertin B bound to betaTP\n      interacts with alpha-Glu399 in the adjacent alphaTP subunit, whereas the\n      aurovertin B bound to betaE is too distant from alphaE to make an equivalent\n      interaction. Both sites encompass betaArg-412, which was shown by mutational\n      studies to be involved in binding aurovertin. Except for minor changes around the\n      aurovertin pockets, the structure of bovine F1-ATPase is the same as determined\n      previously. Aurovertin B appears to act by preventing closure of the catalytic\n      interfaces, which is essential for a catalytic mechanism involving cyclic\n      interconversion of catalytic sites.\nFAU - van Raaij, M J\nAU  - van Raaij MJ\nAD  - Medical Research Council Laboratory of Molecular Biology, Cambridge, United\n      Kingdom.\nFAU - Abrahams, J P\nAU  - Abrahams JP\nFAU - Leslie, A G\nAU  - Leslie AG\nFAU - Walker, J E\nAU  - Walker JE\nLA  - eng\nPT  - Journal Article\nPT  - Research Support, Non-U.S. Gov't\nPL  - UNITED STATES\nTA  - Proc Natl Acad Sci U S A\nJT  - Proceedings of the National Academy of Sciences of the United States of America\nJID - 7505876\nRN  - 0 (Aurovertins)\nRN  - 0 (Enzyme Inhibitors)\nRN  - 0 (Macromolecular Substances)\nRN  - 25612-73-1 (Adenylyl Imidodiphosphate)\nRN  - 3KX376GY7L (Glutamic Acid)\nRN  - 55350-03-3 (aurovertin B)\nRN  - 94ZLA3W45F (Arginine)\nRN  - EC 3.6.3.14 (Proton-Translocating ATPases)\nSB  - IM\nMH  - Adenylyl Imidodiphosphate/pharmacology\nMH  - Animals\nMH  - Arginine\nMH  - Aurovertins/*chemistry/*metabolism\nMH  - Binding Sites\nMH  - Cattle\nMH  - Crystallography, X-Ray\nMH  - Enzyme Inhibitors/chemistry/metabolism\nMH  - Glutamic Acid\nMH  - Macromolecular Substances\nMH  - Models, Molecular\nMH  - Molecular Structure\nMH  - Myocardium/enzymology\nMH  - *Protein Structure, Secondary\nMH  - Proton-Translocating ATPases/*chemistry/*metabolism\nPMC - PMC38908\nOID - NLM: PMC38908\nEDAT- 1996/07/09\nMHDA- 1996/07/09 00:01\nCRDT- 1996/07/09 00:00\nPST - ppublish\nSO  - Proc Natl Acad Sci U S A. 1996 Jul 9;93(14):6913-7.\n\nPMID- 21249755\nSTAT- Publisher\nDA  - 20110121\nDRDT- 20080809\nCTDT- 20080718\nPB  - National Center for Biotechnology Information (US)\nDP  - 2009\nTI  - Peutz-Jeghers Syndrome\nBTI - Cancer Syndromes\nAB  - PJS is a rare disease. (\"Peutz-Jeghers syndrome is no frequent nosological unit\".\n      (1)) There are no high-quality estimates of the prevalence or incidence of PJS.\n      Estimates have included 1 in 8,500 to 23,000 live births (2), 1 in 50,000 to 1 in\n      100,000 in Finland (3), and 1 in 200,000 (4). A report on the incidence of PJS is\n      available at www.peutz-jeghers.com. At Mayo Clinic from 1945 to 1996 the\n      incidence of PJS was 0.9 PJS patients per 100,000 patients. PJS has been reported\n      in Western Europeans (5), African Americans (5), Nigerians (6), Japanese (7),\n      Chinese (8, 9), Indians (10, 11), and other populations (12-15). PJS occurs\n      equally in males and females (7).\nCI  - Copyright (c) 2009-, Douglas L Riegert-Johnson\nFED - Riegert-Johnson, Douglas L\nED  - Riegert-Johnson DL\nFED - Boardman, Lisa A\nED  - Boardman LA\nFED - Hefferon, Timothy\nED  - Hefferon T\nFED - Roberts, Maegan\nED  - Roberts M\nFAU - Riegert-Johnson, Douglas\nAU  - Riegert-Johnson D\nFAU - Gleeson, Ferga C.\nAU  - Gleeson FC\nFAU - Westra, Wytske\nAU  - Westra W\nFAU - Hefferon, Timothy\nAU  - Hefferon T\nFAU - Wong Kee Song, Louis M.\nAU  - Wong Kee Song LM\nFAU - Spurck, Lauren\nAU  - Spurck L\nFAU - Boardman, Lisa A.\nAU  - Boardman LA\nLA  - eng\nPT  - Book Chapter\nPL  - Bethesda (MD)\nEDAT- 2011/01/21 06:00\nMHDA- 2011/01/21 06:00\nCDAT- 2011/01/21 06:00\nAID - NBK1826 [bookaccession]\n\n",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "M. J.",
						"lastName": "van Raaij",
						"creatorType": "author"
					},
					{
						"firstName": "J. P.",
						"lastName": "Abrahams",
						"creatorType": "author"
					},
					{
						"firstName": "A. G.",
						"lastName": "Leslie",
						"creatorType": "author"
					},
					{
						"firstName": "J. E.",
						"lastName": "Walker",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Adenylyl Imidodiphosphate/pharmacology",
					"Animals",
					"Arginine",
					"Aurovertins/*chemistry/*metabolism",
					"Binding Sites",
					"Cattle",
					"Crystallography, X-Ray",
					"Enzyme Inhibitors/chemistry/metabolism",
					"Glutamic Acid",
					"Macromolecular Substances",
					"Models, Molecular",
					"Molecular Structure",
					"Myocardium/enzymology",
					"*Protein Structure, Secondary",
					"Proton-Translocating ATPases/*chemistry/*metabolism"
				],
				"seeAlso": [],
				"attachments": [],
				"extra": "PMID: 8692918 \nPMCID: PMC38908",
				"volume": "93",
				"issue": "14",
				"date": "1996 Jul 9",
				"title": "The structure of bovine F1-ATPase complexed with the antibiotic inhibitor aurovertin B.",
				"pages": "6913-6917",
				"abstractNote": "In the structure of bovine mitochondrial F1-ATPase that was previously determined with crystals grown in the presence of adenylyl-imidodiphosphate (AMP-PNP) and ADP, the three catalytic beta-subunits have different conformations and nucleotide occupancies. Adenylyl-imidodiphosphate is bound to one beta-subunit (betaTP), ADP is bound to the second (betaDP), and no nucleotide is bound to the  third (betaE). Here we show that the uncompetitive inhibitor aurovertin B binds to bovine F1 at two equivalent sites in betaTP and betaE, in a cleft between the  nucleotide binding and C-terminal domains. In betaDP, the aurovertin B pocket is  incomplete and is inaccessible to the inhibitor. The aurovertin B bound to betaTP interacts with alpha-Glu399 in the adjacent alphaTP subunit, whereas the aurovertin B bound to betaE is too distant from alphaE to make an equivalent interaction. Both sites encompass betaArg-412, which was shown by mutational studies to be involved in binding aurovertin. Except for minor changes around the aurovertin pockets, the structure of bovine F1-ATPase is the same as determined previously. Aurovertin B appears to act by preventing closure of the catalytic interfaces, which is essential for a catalytic mechanism involving cyclic interconversion of catalytic sites.",
				"language": "eng",
				"place": "UNITED STATES",
				"journalAbbreviation": "Proc Natl Acad Sci U S A",
				"publicationTitle": "Proceedings of the National Academy of Sciences of the United States of America"
			},
			{
				"itemType": "bookSection",
				"creators": [
					{
						"firstName": "Douglas L.",
						"lastName": "Riegert-Johnson",
						"creatorType": "editor"
					},
					{
						"firstName": "Lisa A.",
						"lastName": "Boardman",
						"creatorType": "editor"
					},
					{
						"firstName": "Timothy",
						"lastName": "Hefferon",
						"creatorType": "editor"
					},
					{
						"firstName": "Maegan",
						"lastName": "Roberts",
						"creatorType": "editor"
					},
					{
						"firstName": "Douglas",
						"lastName": "Riegert-Johnson",
						"creatorType": "author"
					},
					{
						"firstName": "Ferga C.",
						"lastName": "Gleeson",
						"creatorType": "author"
					},
					{
						"firstName": "Wytske",
						"lastName": "Westra",
						"creatorType": "author"
					},
					{
						"firstName": "Timothy",
						"lastName": "Hefferon",
						"creatorType": "author"
					},
					{
						"firstName": "Louis M.",
						"lastName": "Wong Kee Song",
						"creatorType": "author"
					},
					{
						"firstName": "Lauren",
						"lastName": "Spurck",
						"creatorType": "author"
					},
					{
						"firstName": "Lisa A.",
						"lastName": "Boardman",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"extra": "PMID: 21249755",
				"publisher": "National Center for Biotechnology Information (US)",
				"date": "2009",
				"title": "Peutz-Jeghers Syndrome",
				"bookTitle": "Cancer Syndromes",
				"abstractNote": "PJS is a rare disease. (\"Peutz-Jeghers syndrome is no frequent nosological unit\". (1)) There are no high-quality estimates of the prevalence or incidence of PJS. Estimates have included 1 in 8,500 to 23,000 live births (2), 1 in 50,000 to 1 in 100,000 in Finland (3), and 1 in 200,000 (4). A report on the incidence of PJS is available at www.peutz-jeghers.com. At Mayo Clinic from 1945 to 1996 the incidence of PJS was 0.9 PJS patients per 100,000 patients. PJS has been reported in Western Europeans (5), African Americans (5), Nigerians (6), Japanese (7), Chinese (8, 9), Indians (10, 11), and other populations (12-15). PJS occurs equally in males and females (7).",
				"rights": "Copyright (c) 2009-, Douglas L Riegert-Johnson",
				"language": "eng",
				"place": "Bethesda (MD)"
			}
		]
	}
]
/** END TEST CASES **/