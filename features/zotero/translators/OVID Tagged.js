{
	"translatorID": "59e7e93e-4ef0-4777-8388-d6eddb3261bf",
	"label": "OVID Tagged",
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
	"browserSupport": "gcs",
	"lastUpdated": "2014-02-10 19:08:44"
}

/*
OVID Tagged import translator
Based on hhttp://ospguides.ovid.com/OSPguides/medline.htm#PT and lots of testing
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
			//All Ovid databases have this at the top:
			if (line.match(/^VN\s{1,2}- Ovid Technologies/)) {
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
	PB: "publisher",
	BT: "bookTitle",
	JT: "publicationTitle",
	TA: "journalAbbreviation",
	PG: "pages",
	PN: "patentNumber",
	RO: "rights",
	DG: "issueDate",
	IB: "ISBN",
	IS: "ISSN",
	LG: "language",
	EN: "edition",
	DB: "libraryCatalog",
	AB: "abstractNote"
};


// Only the most basic types. Mostly guessing from existing Ovid records here
var inputTypeMap = {
	"Book": "book",
	"Book Chapter": "bookSection",
	"Book chapter": "bookSection",
	"Journal Article": "journalArticle",
	"Newspaper Article": "newspaperArticle",
	"Video-Audio Media": "videoRecording",
	"Technical Report": "report",
	"Legal Case": "case",
	"Legislation": "statute",
	"Patent": "patent"
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
	//I don't think FED or ED exist, but let's keep them to be safe
	} else if (tag == "FA" || tag == "FED") {
		if (tag == "FAU") {
			var type = "author";
		} else if (tag == "FED") {
			var type = "editor";
		}
		item.creators.push(Zotero.Utilities.cleanAuthor(value, type, value.indexOf(",") != -1));
	} else if (tag == "AU" || tag == "ED") {
		if (tag == "AU") {
			var type = "author";
		} else if (tag == "ED") {
			var type = "editor";
		}
		value = value.replace(/[0-9\,+\*\s]+$/, "").replace(/ Ph\.?D\.?.*/, "").replace(/\[.+/, "").replace(
			/ (?:MD|[BM]Sc|[BM]A|MPH|MB)(\,\s*)?$/gi, "");
		//Z.debug(value)
		item.creatorsBackup.push(Zotero.Utilities.cleanAuthor(value, type, value.indexOf(",") != -1));
	} else if (tag == "UI") {
		item.PMID = "PMID: " + value;
	} else if (tag == "DI" || tag == "DO") {
		if (value.indexOf("10.") != -1) item.DOI = value
	} else if (tag == "YR") {
		item.date = value;
	} else if (tag == "SO") {
		item.citation = value;
	} else if (tag == "KW") {
		tags = value.split(/;\s*/);
		for (var i in tags) {
			item.tags.push(tags[i]);
		}
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
				//there are empty lines in the SY tag
				if (tag == "SY" || tag == "DE") {
					data += " " + line;
				} else {
					processTag(item, tag, data);
					// unset info
					tag = data = false;
					// new item
					finalizeItem(item)
					item = new Zotero.Item();
					item.creatorsBackup = [];
				}
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
	if (item.creators.length == 0 && item.creatorsBackup.length > 0) {
		item.creators = item.creatorsBackup;
	}
	delete item.creatorsBackup;
	if (!item.itemType) item.itemType = inputTypeMap["Journal Article"];
	item.title = item.title.replace(/(\.\s*)?(\[(Article|Report|Miscellaneous)\])?$/, "")
	var monthRegex = new ZU.XRegExp('([-/]?(Jan(uary)?|Feb(ruary)?|Mar(ch)?|Apr(il)?|May|Jun(e)?|Jul(y)?|Aug(ust)?|Sep(tember)?|Oct(ober)?|Nov(ember)?|Dec(ember)?))+', 'n');
	var value = item.citation
	if (!value && item.itemType == "bookSection") value = item.bookTitle
	if (item.itemType == "journalArticle" && value) {
		if (value.match(/\d{4}/)) {
			if (!item.date) item.date = value.match(/\d{4}/)[0];
		}
		var month = ZU.XRegExp.exec(value, monthRegex); 
		if (month) item.date = item.date += " " + (month)[0];
		if (value.match(/(\d+)\((\d+(?:\-\d+)?)\)/)) {
			var voliss = value.match(/(\d+)\((\d+(?:\-\d+)?)\)/);

			item.volume = voliss[1];
			item.issue = voliss[2];
		}
		if (value.match(/vol\.\s*(\d+)/)) {
			item.volume = value.match(/vol\.\s*(\d+)/)[1];
		}
		if (!item.volume && value.match(/\d{4};(\d+):/)) item.volume = value.match(/\d{4};(\d+):/)[1];
		if (value.match(/vol\.\s*\d+\s*,\s*no\.\s*(\d+)/)) {
			item.issue = value.match(/vol\.\s*\d+\s*,\s*no\.\s*(\d+)/)[1];
		}
		if (value.match(/:\s*\d+\-\d+/)) item.pages = value.match(/:\s*(\d+\-\d+)/)[1];
		if (value.match(/pp\.\s*(\d+\-\d+)/)) item.pages = value.match(/pp\.\s*(\d+\-\d+)/)[1];
		if (value.match(/[J|j]ournal[-\s\w]+/)) {
			item.publicationTitle = value.match(/[J|j]ournal[-\s\w]+/)[0];
		} else {
			item.publicationTitle = Zotero.Utilities.trimInternal(value.split(/(\.|;|(,\s*vol\.))/)[0]);
		}
		item.publicationTitle = item.publicationTitle.split(monthRegex)[0];
	}
	if (item.itemType == "bookSection" && value) {
		if (value.match(/:\s*\d+\-\d+/)) item.pages = value.match(/:\s*(\d+\-\d+)/)[1];
		if (value.match(/pp\.\s*(\d+\-\d+)/)) item.pages = value.match(/pp\.\s*(\d+\-\d+)/)[1];
		//editors are only listed as part of the citation...
		if (value.match(/(.+?)\[Ed(itor|\.)/)) {
			var editors = value.match(/.+?\[Ed(itor|\.)/g);
			for (var i in editors) {
				editor = editors[i].replace(/\[Ed(itor|\.).*$/, "").replace(/.*?\][,\s]*/, "");
				item.creators.push(ZU.cleanAuthor(editor, "editor", true))
			}
		}
		if (value.match(/.+\[Ed(?:\.|itor)\][\.\s]*([^\.]+)/)) {
			item.bookTitle = value.match(/.+\[Ed(?:\.|itor)\][\.\s]*([^\.]+)/)[1]
		};
	}
	//fix all caps authors
	for (var i in item.creators) {
		if (item.creators[i].lastName && item.creators[i].lastName == item.creators[i].lastName.toUpperCase()) {
			item.creators[i].lastName = ZU.capitalizeTitle(item.creators[i].lastName.toLowerCase(), true);
		}
	}
	if (item.pages) {
		//Z.debug(item.pages)
		//where page ranges are given in an abbreviated format, convert to full
		//taken verbatim from NCBI Pubmed translator
		var pageRangeRE = /(\d+)-(\d+)/g;
		pageRangeRE.lastIndex = 0;
		var range = pageRangeRE.exec(item.pages);
		var pageRangeStart = range[1];
		var pageRangeEnd = range[2];
		var diff = pageRangeStart.length - pageRangeEnd.length;
		if (diff > 0) {
			pageRangeEnd = pageRangeStart.substring(0, diff) + pageRangeEnd;
			var newRange = pageRangeStart + "-" + pageRangeEnd;
			var fullPageRange = item.pages.substring(0, range.index) //everything before current range
			+ newRange //insert the new range
			+ item.pages.substring(range.index + range[0].length); //everything after the old range
			//adjust RE index
			pageRangeRE.lastIndex += newRange.length - range[0].length;
			item.pages = fullPageRange;
		}
	}
	if (item.publisher && !item.pace) {
		if (item.publisher.search(/,./) != -1) {
			item.place = item.publisher.match(/,(.+?)$/)[1];
			item.publisher = item.publisher.replace(/,.+?$/, "")
		}
	}
	if (item.ISBN) item.ISBN = ZU.cleanISBN(item.ISBN);
	if (item.ISSN) item.ISSN = ZU.cleanISSN(item.ISSN);
	if (item.libraryCatalog && item.libraryCatalog.indexOf("MEDLINE") != -1 && item.PMID) {
		item.extra = item.PMID;
		delete item.PMID;
	}
	delete item.citation;
	item.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "<1. >\r\nVN  - Ovid Technologies\r\nDB  - BIOSIS Previews\r\nAN  - PREV200400474164\r\nRO  - Copyright Thomson 2004.\r\nAU  - Walsdorf, Neill B. [Inventor, Reprint Author]\r\nAU  - Wabner, Cindy L. [Inventor]\r\nAU  - Alexandrides, George [Inventor]\r\nIN  - Canyon Lake, TX, USA.\r\nCY  - USA\r\nTI  - Dietary supplements containing ultradense calcium citrate and carbonyl iron\r\nSO  - Official Gazette of the United States Patent & Trademark Office Patents. 1288(3), Nov. 16, 2004.\r\nJL  - http://www.uspto.gov/web/menu/patdata.html\r\nPT  - Patent\r\nIS  - 0098-1133 (ISSN print)\r\nPN  - US 6818228\r\nDG  - November 16, 2004\r\nCL  - 424-464\r\nPC  - USA\r\nPA  - Mission Pharmacal Company\r\nCC  - [10069] Biochemistry studies - Minerals\r\nCC  - [12512] Pathology - Therapy\r\nCC  - [13202] Nutrition - General studies, nutritional status and methods\r\nCC  - [22002] Pharmacology - General\r\nCC  - [22501] Toxicology - General and methods\r\nCC  - [22504] Toxicology - Pharmacology\r\nLG  - English\r\nAB  - A vitamin and mineral supplement containing ULTRADENSE.TM. calcium citrate and carbonyl iron for use in humans. Calcium in the form of citrate enhances absorption of iron, zinc, and magnesium. ULTRADENSE.TM. calcium citrate provides more bioavailable calcium than usual preparations of calcium citrate. Carbonyl iron provides iron in a form that significantly reduces the risk to children of accidental iron poisoning from formulations that provide iron in salt form. The supplement may further contain a number of vitamins and minerals in a tablet that is elegantly small, weighing about 1.5-1.6 g. The small size allows ease of swallowing and encourages patient acceptability. Methods of making such a supplement and methods of treating maladies in need of vitamin and mineral supplementation are provided.\r\nMC  - Methods and Techniques\r\nMC  - Nutrition\r\nMC  - Pharmacology\r\nDS  - accidental iron poisoning: toxicity\r\nCB  - calcium citrate: 7693-13-2, food supplement, ultradense\r\nCB  - carbonyl iron: 7439-89-6, food supplement\r\nCB  - dietary supplements: vitamin-drug, food supplement, size\r\nCB  - iron: 7439-89-6, nutrient\r\nCB  - magnesium: 7439-95-4, nutrient\r\nCB  - zinc: 7440-66-6, nutrient\r\nYR  - 2004\r\nUP  - 200400. BIOSIS Update: 20041209.\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=biop30&AN=PREV200400474164\r\nXL  - http://hopper.library.northwestern.edu/sfx/?sid=OVID:biopdb&id=pmid:&id=doi:&issn=0098-1133&isbn=&volume=1288&issue=3&spage=&pages=&date=2004&title=Official+Gazette+of+the+United+States+Patent+%26+Trademark+Office+Patents&atitle=Dietary+supplements+containing+ultradense+calcium+citrate+and+carbonyl+iron&aulast=Walsdorf&pid=%3Cauthor%3EWalsdorf%2C+Neill+B.%3BWabner%2C+Cindy+L.%3BAlexandrides%2C+George%3C%2Fauthor%3E&%3CAN%3EPREV200400474164%3C%2FAN%3E&%3CDT%3EPatent%3C%2FDT%3E\r\n\r\n<241. >\r\nVN  - Ovid Technologies\r\nDB  - BIOSIS Previews\r\nAN  - PREV200400473722\r\nRO  - Copyright Thomson 2004.\r\nAU  - Werner, S. M. [Author, Reprint Author; E-mail: shahlawerner@yahoo.com]\r\nAU  - Nordheim, E. V. [Author]\r\nAU  - Raffa, K. F. [Author]\r\nIN  - Forest Pest Management, DCNR, 208 Airport Dr,2nd Floor, Middletown, PA, 17057, USA.\r\nCY  - USA\r\nTI  - Comparison of methods for sampling Thysanoptera on basswood (Tilia americana L.) trees in mixed northern hardwood deciduous forests\r\nSO  - Forest Ecology & Management. 201(2-3):327-334, November 15, 2004.\r\nPT  - Article\r\nIS  - 0378-1127 (ISSN print)\r\nCC  - [05500] Social biology and human ecology\r\nCC  - [07506] Ecology: environmental biology - Plant\r\nCC  - [07508] Ecology: environmental biology - Animal\r\nCC  - [25502] Development and Embryology - General and descriptive\r\nCC  - [37001] Public health - General and miscellaneous\r\nCC  - [53500] Forestry and forest products\r\nCC  - [60502] Parasitology - General\r\nCC  - [60504] Parasitology - Medical\r\nCC  - [64076] Invertebrata: comparative, experimental morphology, physiology and pathology - Insecta: physiology\r\nLG  - English\r\nAB  - Canopy arthropods play integral roles in the functioning, biodiversity, and productivity of forest ecosystems. Yet quantitative sampling of arboreal arthropods poses formidable challenges. We evaluated three methods of sampling the introduced basswood thrips, Thrips calcaratus Uzel (Thysanoptera: Thripidae), from the foliage of basswood canopies with respect to statistical variability and practical considerations (legal, economic and logistical accessibility). All three methods involved removal of foliage, which was performed using a pole-pruner, shotgun, and certified tree-climber. We also tested a fourth method, in which the tree-climber enclosed samples in a plastic bag to estimate losses that occur when branches fall to the ground, even though this is often not practical. The climber plus bag and pole-pruning methods obtained the highest numbers of thrips. Mean number of larval thrips did not vary significantly among the three main sampling methods. Site had a stronger effect on the number of larval thrips obtained than on the number of adults. A significant method by site interaction was observed with adults but not larvae. Significant collection date (which corresponds to thrips life stage) by site interaction was also observed. We regressed sampling methods to determine if the number of thrips obtained using one method can be used to predict the number obtained with another. Tree-climber and pole-pruner data were highly predictive of each other, but shotgun data cannot be used to estimate other methods. Pole-pruning is the most cost-effective and legally permissible technique, but is limited to trees with accessible lower branches. The shotgun method is cost-effective and useful in sampling trees at least up to 27 m, but is prohibited close to human activity. The tree-climber is effective and broadly applicable, but incurs the highest costs. This study shows the need to evaluate a variety of techniques when sampling arboreal insects with respect to predictability, pragmatics and life stages. Copyright 2004, Elsevier B.V. All rights reserved.\r\nMC  - Forestry\r\nMC  - Methods and Techniques\r\nMC  - Parasitology\r\nMC  - Population Studies\r\nBC  - [86215] Hominidae\r\nBC  - [75350] Thysanoptera\r\nBC  - [26865] Tiliaceae\r\nST  - [86215] Hominidae, Primates, Mammalia, Vertebrata, Chordata, Animalia\r\nST  - [75350] Thysanoptera, Insecta, Arthropoda, Invertebrata, Animalia\r\nST  - [26865] Tiliaceae, Dicotyledones, Angiospermae, Spermatophyta, Plantae\r\nTN  - Hominidae: Animals, Chordates, Humans, Mammals, Primates, Vertebrates\r\nTN  - Thysanoptera: Animals, Arthropods, Insects, Invertebrates\r\nTN  - Tiliaceae: Angiosperms, Dicots, Plants, Spermatophytes, Vascular Plants\r\nOR  - human: common, certified tree-climber [Hominidae]\r\nOR  - Thrips calcaratus: species, basswood thrips, common, larva, mature, alien species, parasite, canopy arthropod [Thysanoptera]\r\nOR  - Thysanoptera: higher taxa [Thysanoptera]\r\nOR  - Tilia americana: species, host, basswood, commercial species [Tiliaceae]\r\nMQ  - pole-pruner: field equipment\r\nMQ  - shotgun: field equipment\r\nMI  - forest ecosystem\r\nMI  - northern hardwood deciduous forest\r\nYR  - 2004\r\nUP  - 200400. BIOSIS Update: 20041209.\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=biop30&AN=PREV200400473722\r\nXL  - http://hopper.library.northwestern.edu/sfx/?sid=OVID:biopdb&id=pmid:&id=doi:&issn=0378-1127&isbn=&volume=201&issue=2&spage=327&pages=327-334&date=2004&title=Forest+Ecology+%26+Management&atitle=Comparison+of+methods+for+sampling+Thysanoptera+on+basswood+%28Tilia+americana+L.%29+trees+in+mixed+northern+hardwood+deciduous+forests&aulast=Werner&pid=%3Cauthor%3EWerner%2C+S.+M.%3BNordheim%2C+E.+V.%3BRaffa%2C+K.+F.%3C%2Fauthor%3E&%3CAN%3EPREV200400473722%3C%2FAN%3E&%3CDT%3EArticle%3C%2FDT%3E\r\n\r\n<7807. >\r\nVN  - Ovid Technologies\r\nDB  - BIOSIS Previews\r\nAN  - PREV200400435038\r\nRO  - Copyright Thomson 2004.\r\nAU  - Gaertner, Alfred L. [Author, Reprint Author; E-mail: agaertner@genecor.com]\r\nAU  - Chow, Nicole L. [Author]\r\nAU  - Fryksdale, Beth G. [Author]\r\nAU  - Jedrzejewski, Paul [Author]\r\nAU  - Miller, Brian S. [Author]\r\nAU  - Paech, Sigrid [Author]\r\nAU  - Wong, David L. [Author]\r\nIN  - Genencor International Inc., 925 Page Mill Road, Palo Alto, CA, 94304, USA.\r\nCY  - USA\r\nTI  - Increasing throughput and data quality for proteomics.\r\nSO  - Kamp, Roza Maria [Editor, Reprint Author], Calvete, Juan J. [Editor], Choli-Papadopoulou, Theodora [Editor]. Methods in proteome and protein analysis.:371-397, 2004.\r\nSeries Information:  Principles and Practice.\r\nPT  - Book Chapter\r\nIB  - 3-540-20222-6 (cloth)\r\nPI  - Springer-Verlag GmbH & Co. KG, Heidelberger Platz 3, D-14197, Berlin, Germany\r\nCC  - [03502] Genetics - General\r\nCC  - [10064] Biochemistry studies - Proteins, peptides and amino acids\r\nLG  - English\r\nMC  - Methods and Techniques\r\nMC  - Molecular Genetics: Biochemistry and Molecular Biophysics\r\nCB  - proteins\r\nMQ  - SDS-polyacrylamide gel electrophoresis: electrophoretic techniques, laboratory techniques\r\nMQ  - high-throughput analysis: genetic techniques, laboratory techniques\r\nMQ  - matrix-assisted laser/desorption ionization time-of-flight mass spectrometry: laboratory techniques, spectrum analysis techniques\r\nMQ  - proteomic analysis: genetic techniques, laboratory techniques\r\nYR  - 2004\r\nUP  - 200400. BIOSIS Update: 20041110.\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=biop30&AN=PREV200400435038\r\nXL  - http://hopper.library.northwestern.edu/sfx/?sid=OVID:biopdb&id=pmid:&id=doi:&issn=&isbn=3540202226&volume=&issue=&spage=371&pages=371-397&date=2004&title=Methods+in+proteome+and+protein+analysis&atitle=Increasing+throughput+and+data+quality+for+proteomics.&aulast=Gaertner&pid=%3Cauthor%3EGaertner%2C+Alfred+L.%3BChow%2C+Nicole+L.%3BFryksdale%2C+Beth+G.%3BJedrzejewski%2C+Paul%3BMiller%2C+Brian+S.%3BPaech%2C+Sigrid%3BWong%2C+David+L.%3C%2Fauthor%3E&%3CAN%3EPREV200400435038%3C%2FAN%3E&%3CDT%3EBook+Chapter%3C%2FDT%3E\r\n\r\n<7808. >\r\nVN  - Ovid Technologies\r\nDB  - BIOSIS Previews\r\nAN  - PREV200400435037\r\nRO  - Copyright Thomson 2004.\r\nAU  - Hjerno, Karin [Author, Reprint Author]\r\nAU  - Hojrup, Peter [Author; E-mail: php@bmb.sdu.dk]\r\nIN  - Department of Biochemistry and Molecular Biology, University of Southern Denmark, Campusvej 55, 5230, Odense M, Denmark.\r\nCY  - Denmark\r\nTI  - Peak Erazor: A Windows-based program for improving peptide mass searches.\r\nSO  - Kamp, Roza Maria [Editor, Reprint Author], Calvete, Juan J. [Editor], Choli-Papadopoulou, Theodora [Editor]. Methods in proteome and protein analysis.:359-370, 2004.\r\nSeries Information:  Principles and Practice.\r\nPT  - Book Chapter\r\nIB  - 3-540-20222-6 (cloth)\r\nPI  - Springer-Verlag GmbH & Co. KG, Heidelberger Platz 3, D-14197, Berlin, Germany\r\nCC  - [00530] General biology - Information, documentation, retrieval and computer applications\r\nCC  - [10060] Biochemistry studies - General\r\nCC  - [10064] Biochemistry studies - Proteins, peptides and amino acids\r\nLG  - English\r\nMC  - Biochemistry and Molecular Biophysics\r\nMC  - Computer Applications: Computational Biology\r\nMC  - Methods and Techniques\r\nCB  - peptides\r\nMQ  - Peak Erazor: computer software\r\nMQ  - matrix-assisted laser/desorption ionization mass spectrometry: laboratory techniques, spectrum analysis techniques\r\nYR  - 2004\r\nUP  - 200400. BIOSIS Update: 20041110.\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=biop30&AN=PREV200400435037\r\nXL  - http://hopper.library.northwestern.edu/sfx/?sid=OVID:biopdb&id=pmid:&id=doi:&issn=&isbn=3540202226&volume=&issue=&spage=359&pages=359-370&date=2004&title=Methods+in+proteome+and+protein+analysis&atitle=Peak+Erazor%3A+A+Windows-based+program+for+improving+peptide+mass+searches.&aulast=Hjerno&pid=%3Cauthor%3EHjerno%2C+Karin%3BHojrup%2C+Peter%3C%2Fauthor%3E&%3CAN%3EPREV200400435037%3C%2FAN%3E&%3CDT%3EBook+Chapter%3C%2FDT%3E\r\n\r\n\r\n",
		"items": [
			{
				"itemType": "patent",
				"creators": [
					{
						"firstName": "Neill B.",
						"lastName": "Walsdorf",
						"creatorType": "author"
					},
					{
						"firstName": "Cindy L.",
						"lastName": "Wabner",
						"creatorType": "author"
					},
					{
						"firstName": "George",
						"lastName": "Alexandrides",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "BIOSIS Previews",
				"rights": "Copyright Thomson 2004.",
				"title": "Dietary supplements containing ultradense calcium citrate and carbonyl iron",
				"ISSN": "0098-1133",
				"patentNumber": "US 6818228",
				"issueDate": "November 16, 2004",
				"language": "English",
				"abstractNote": "A vitamin and mineral supplement containing ULTRADENSE.TM. calcium citrate and carbonyl iron for use in humans. Calcium in the form of citrate enhances absorption of iron, zinc, and magnesium. ULTRADENSE.TM. calcium citrate provides more bioavailable calcium than usual preparations of calcium citrate. Carbonyl iron provides iron in a form that significantly reduces the risk to children of accidental iron poisoning from formulations that provide iron in salt form. The supplement may further contain a number of vitamins and minerals in a tablet that is elegantly small, weighing about 1.5-1.6 g. The small size allows ease of swallowing and encourages patient acceptability. Methods of making such a supplement and methods of treating maladies in need of vitamin and mineral supplementation are provided.",
				"date": "2004"
			},
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "S. M.",
						"lastName": "Werner",
						"creatorType": "author"
					},
					{
						"firstName": "E. V.",
						"lastName": "Nordheim",
						"creatorType": "author"
					},
					{
						"firstName": "K. F.",
						"lastName": "Raffa",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "BIOSIS Previews",
				"rights": "Copyright Thomson 2004.",
				"title": "Comparison of methods for sampling Thysanoptera on basswood (Tilia americana L.) trees in mixed northern hardwood deciduous forests",
				"ISSN": "0378-1127",
				"language": "English",
				"abstractNote": "Canopy arthropods play integral roles in the functioning, biodiversity, and productivity of forest ecosystems. Yet quantitative sampling of arboreal arthropods poses formidable challenges. We evaluated three methods of sampling the introduced basswood thrips, Thrips calcaratus Uzel (Thysanoptera: Thripidae), from the foliage of basswood canopies with respect to statistical variability and practical considerations (legal, economic and logistical accessibility). All three methods involved removal of foliage, which was performed using a pole-pruner, shotgun, and certified tree-climber. We also tested a fourth method, in which the tree-climber enclosed samples in a plastic bag to estimate losses that occur when branches fall to the ground, even though this is often not practical. The climber plus bag and pole-pruning methods obtained the highest numbers of thrips. Mean number of larval thrips did not vary significantly among the three main sampling methods. Site had a stronger effect on the number of larval thrips obtained than on the number of adults. A significant method by site interaction was observed with adults but not larvae. Significant collection date (which corresponds to thrips life stage) by site interaction was also observed. We regressed sampling methods to determine if the number of thrips obtained using one method can be used to predict the number obtained with another. Tree-climber and pole-pruner data were highly predictive of each other, but shotgun data cannot be used to estimate other methods. Pole-pruning is the most cost-effective and legally permissible technique, but is limited to trees with accessible lower branches. The shotgun method is cost-effective and useful in sampling trees at least up to 27 m, but is prohibited close to human activity. The tree-climber is effective and broadly applicable, but incurs the highest costs. This study shows the need to evaluate a variety of techniques when sampling arboreal insects with respect to predictability, pragmatics and life stages. Copyright 2004, Elsevier B.V. All rights reserved.",
				"date": "2004 November",
				"volume": "201",
				"issue": "2-3",
				"pages": "327-334",
				"publicationTitle": "Forest Ecology & Management"
			},
			{
				"itemType": "bookSection",
				"creators": [
					{
						"firstName": "Alfred L.",
						"lastName": "Gaertner",
						"creatorType": "author"
					},
					{
						"firstName": "Nicole L.",
						"lastName": "Chow",
						"creatorType": "author"
					},
					{
						"firstName": "Beth G.",
						"lastName": "Fryksdale",
						"creatorType": "author"
					},
					{
						"firstName": "Paul",
						"lastName": "Jedrzejewski",
						"creatorType": "author"
					},
					{
						"firstName": "Brian S.",
						"lastName": "Miller",
						"creatorType": "author"
					},
					{
						"firstName": "Sigrid",
						"lastName": "Paech",
						"creatorType": "author"
					},
					{
						"firstName": "David L.",
						"lastName": "Wong",
						"creatorType": "author"
					},
					{
						"firstName": "Roza Maria",
						"lastName": "Kamp",
						"creatorType": "editor"
					},
					{
						"firstName": "Juan J.",
						"lastName": "Calvete",
						"creatorType": "editor"
					},
					{
						"firstName": "Theodora",
						"lastName": "Choli-Papadopoulou",
						"creatorType": "editor"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "BIOSIS Previews",
				"rights": "Copyright Thomson 2004.",
				"title": "Increasing throughput and data quality for proteomics",
				"ISBN": "3540202226",
				"language": "English",
				"date": "2004",
				"pages": "371-397",
				"bookTitle": "Methods in proteome and protein analysis"
			},
			{
				"itemType": "bookSection",
				"creators": [
					{
						"firstName": "Karin",
						"lastName": "Hjerno",
						"creatorType": "author"
					},
					{
						"firstName": "Peter",
						"lastName": "Hojrup",
						"creatorType": "author"
					},
					{
						"firstName": "Roza Maria",
						"lastName": "Kamp",
						"creatorType": "editor"
					},
					{
						"firstName": "Juan J.",
						"lastName": "Calvete",
						"creatorType": "editor"
					},
					{
						"firstName": "Theodora",
						"lastName": "Choli-Papadopoulou",
						"creatorType": "editor"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "BIOSIS Previews",
				"rights": "Copyright Thomson 2004.",
				"title": "Peak Erazor: A Windows-based program for improving peptide mass searches",
				"ISBN": "3540202226",
				"language": "English",
				"date": "2004",
				"pages": "359-370",
				"bookTitle": "Methods in proteome and protein analysis"
			}
		]
	},
	{
		"type": "import",
		"input": "<1. >\r\nVN  - Ovid Technologies\r\nDB  - International Political Science Abstract\r\nAN  - 63-7578\r\nAU  - AHMED, Mughees.\r\nTI  - Legitimacy crises in Pakistan.\r\nTT  - A comparative study of political behavior.\r\nSO  - Journal of Political Studies 12, Winter 2007: 7-14.\r\nDE  - Legitimacy crisis, Pakistan\r\nAB  - This paper presents a thorough review of legality of governments in Pakistan. It suggests that how non-political rulers have legalized their authority within the political system of Pakistan. This paper analyzes the behavior of dictators and their supporters and even opponents which legitimize unconstitutional actions taken by dictators. Analytical and political interaction approach is adopted in this paper. Another object of this discussion is to analyze the behavior of politicians and the judiciary about the legitimacy of dictators' rule. [R]\r\nLG  - English\r\nIS  - 1991-1080\r\nYR  - 2007\r\nUP  - 201312\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=ipsa&AN=63-7578\r\nXL  - http://hopper.library.northwestern.edu/sfx/?sid=OVID:ipsadb&id=pmid:&id=&issn=1991-1080&isbn=&volume=12&issue=&spage=7&pages=7-14&date=2007&title=Journal+of+Political+Studies&atitle=Legitimacy+crises+in+Pakistan.&aulast=AHMED&pid=%3Cauthor%3EAHMED%2C+Mughees%3C%2Fauthor%3E&%3CAN%3E63-7578%3C%2FAN%3E&%3CDT%3E%3C%2FDT%3E\r\n\r\n<2. >\r\nVN  - Ovid Technologies\r\nDB  - International Political Science Abstract\r\nAN  - 63-7566\r\nAU  - WIJERS, Gea D M.\r\nTI  - Contributions to transformative change in Cambodia: a study on returnees as institutional entrepreneurs.\r\nSO  - Journal of Current Southeast Asian Affairs, 2013(1): 3-28.\r\nDE  - Democratization , French returnees , Cambodia\r\nAB  - This paper explores the experiences of Cambodian French returnees who are contributing to transformative change in Cambodia as institutional entrepreneurs. In order to delve into how returnees and their work are perceived in both host and home country, this multi-sited research project was designed as a comparative case study. Data were primarily collected through conversations with individual informants from the Lyonnese and Parisian Cambodian community as well as selected key informants in Phnom Penh. Excerpts of case studies are presented and discussed to illustrate the history, context and situation of their return as these influence their institutional entrepreneurial activities and the ways in which they use their transnational social networks as resources. [R, abr.]\r\nLG  - English\r\nIS  - 1868-1034\r\nYR  - 2013\r\nUP  - 201312\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=ipsa&AN=63-7566\r\nXL  - http://hopper.library.northwestern.edu/sfx/?sid=OVID:ipsadb&id=pmid:&id=&issn=1868-1034&isbn=&volume=2013&issue=1&spage=3&pages=3-28&date=2013&title=Journal+of+Current+Southeast+Asian+Affairs&atitle=Contributions+to+transformative+change+in+Cambodia%3A+a+study+on+returnees+as+institutional+entrepreneurs.&aulast=WIJERS&pid=%3Cauthor%3EWIJERS%2C+Gea+D+M%3C%2Fauthor%3E&%3CAN%3E63-7566%3C%2FAN%3E&%3CDT%3E%3C%2FDT%3E\r\n\r\n\r\n",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Mughees",
						"lastName": "Ahmed",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "International Political Science Abstract",
				"title": "Legitimacy crises in Pakistan",
				"abstractNote": "This paper presents a thorough review of legality of governments in Pakistan. It suggests that how non-political rulers have legalized their authority within the political system of Pakistan. This paper analyzes the behavior of dictators and their supporters and even opponents which legitimize unconstitutional actions taken by dictators. Analytical and political interaction approach is adopted in this paper. Another object of this discussion is to analyze the behavior of politicians and the judiciary about the legitimacy of dictators' rule. [R]",
				"language": "English",
				"date": "2007",
				"pages": "7-14",
				"publicationTitle": "Journal of Political Studies 12"
			},
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Gea D. M.",
						"lastName": "Wijers",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "International Political Science Abstract",
				"title": "Contributions to transformative change in Cambodia: a study on returnees as institutional entrepreneurs",
				"abstractNote": "This paper explores the experiences of Cambodian French returnees who are contributing to transformative change in Cambodia as institutional entrepreneurs. In order to delve into how returnees and their work are perceived in both host and home country, this multi-sited research project was designed as a comparative case study. Data were primarily collected through conversations with individual informants from the Lyonnese and Parisian Cambodian community as well as selected key informants in Phnom Penh. Excerpts of case studies are presented and discussed to illustrate the history, context and situation of their return as these influence their institutional entrepreneurial activities and the ways in which they use their transnational social networks as resources. [R, abr.]",
				"language": "English",
				"ISSN": "1868-1034",
				"date": "2013",
				"volume": "2013",
				"issue": "1",
				"pages": "3-28",
				"publicationTitle": "Journal of Current Southeast Asian Affairs"
			}
		]
	},
	{
		"type": "import",
		"input": "<3. >\r\nVN  - Ovid Technologies\r\nDB  - Journals@Ovid\r\nAN  - 00135124-201001000-00018.\r\nAU  - Peterson, James A. Ph.D., FACSM\r\nIN  - James A. Peterson, Ph.D., FACSM, is a freelance writer and consultant in sports medicine. From 1990 until 1995, Dr. Peterson was director of sports medicine with StairMaster. Until that time, he was professor of physical education at the United States Military Academy.\r\nTI  - Take Ten: Need-to-Know Facts About Breast Cancer.  [Miscellaneous]\r\nSO  - ACSM'S Health & Fitness Journal January/February 2010;14(1):56\r\nJC  - 9705338\r\nLG  - English.\r\nDT  - DEPARTMENTS.\r\nSB  - Clinical Medicine, Health Professions.\r\nIS  - 1091-5397\r\nDI  - 10.1249/FIT.0b013e3181c6723d\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=ovftk&AN=00135124-201001000-00018\r\n\r\n<5. >\r\nVN  - Ovid Technologies\r\nDB  - Journals@Ovid\r\nAN  - 01189059-201108000-00009.\r\nAU  - Zhang, Weijia 1,2,+\r\nAU  - Ding, Wei 2,+\r\nAU  - Chen, Ye 2\r\nAU  - Feng, Meilin 2\r\nAU  - Ouyang, Yongmei 2\r\nAU  - Yu, Yanhui 2\r\nAU  - He, Zhimin 1,2,*\r\nIN  - (1)Cancer Research Institute and Cancer Hospital, Guangzhou Medical University, Guangzhou 510182, China, (2)Cancer Research Institute, Xiangya School of Medicine, Central South University, Changsha 410078, China\r\nTI  - Up-regulation of breast cancer resistance protein plays a role in HER2-mediated chemoresistance through PI3K/Akt and nuclear factor-kappa B signaling pathways in MCF7 breast cancer cells.  [Article]\r\nSO  - Acta Biochimica et Biophysica Sinica August 2011;43(8):647-653\r\nJC  - 101206716\r\nAB  - Human epidermal growth factor receptor 2 (HER2/neu, also known as ErbB2) overexpression is correlated with the poor prognosis and chemoresistance in cancer. Breast cancer resistance protein (BCRP and ABCG2) is a drug efflux pump responsible for multidrug resistance (MDR) in a variety of cancer cells. HER2 and BCRP are associated with poor treatment response in breast cancer patients, although the relationship between HER2 and BCRP expression is not clear. Here, we showed that transfection of HER2 into MCF7 breast cancer cells (MCF7/HER2) resulted in an up-regulation of BCRP via the phosphatidylinositol 3-kinase (PI3K)/Akt and nuclear factor-kappa B (NF-[kappa]B) signaling. Treatment of MCF/HER2 cells with the PI3K inhibitor LY294002, the I[kappa]B phosphorylation inhibitor Bay11-7082, and the dominant negative mutant of I[kappa]B[alpha] inhibited HER2-induced BCRP promoter activity. Furthermore, we found that HER2 overexpression led to an increased resistance of MCF7 cells to multiple antitumor drugs such as paclitaxel (Taxol), cisplatin (DDP), etoposide (VP-16), adriamycin (ADM), mitoxantrone (MX), and 5-fluorouracil (5-FU). Moreover, silencing the expression of BCRP or selectively inhibiting the activity of Akt or NF-[kappa]B sensitized the MCF7/HER2 cells to these chemotherapy agents at least in part. Taken together, up-regulation of BCRP through PI3K/AKT/NF-[kappa]B signaling pathway played an important role in HER2-mediated chemoresistance of MCF7 cells, and AKT, NF-[kappa]B, and BCRP pathways might serve as potential targets for therapeutic intervention., Copyright (C) 2011 Blackwell Publishing Ltd.\r\nKW  - BCRP;  PI3K/AKT/NF-[kappa]B;  chemoresistance\r\nLG  - English.\r\nDT  - Original Articles.\r\nSB  - Life & Biomedical Sciences.\r\nIS  - 1672-9145\r\nDI  - 10.1093/abbs/gmr050\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=ovftm&AN=01189059-201108000-00009\r\n\r\n<8. >\r\nVN  - Ovid Technologies\r\nDB  - Journals@Ovid\r\nAN  - 00000042-201011000-00010.\r\nAU  - Simon, Ph. 1\r\nAU  - Dept, S. 1\r\nAU  - Lefranc, F. 2\r\nAU  - Noel, J. C. 3\r\nIN  - Department of Gynaecology(1), Neurosurgery(2) and Gynaeco Pathology(3), ULB Hopital Erasme, Bruxelles, Belgium.\r\nTI  - Brain Metastasis after Breast Cancer and Hysterectomy for a Benign Leiomyoma.  [Article]\r\nSO  - Acta Chirurgica Belgica November/December 2010;6:611-613\r\nJC  - 0370571\r\nLG  - English.\r\nDT  - article.\r\nSB  - Clinical Medicine, Alternative & Complementary Medicine, Traditional Chinese Medicine.\r\nIS  - 0001-5458\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=ovftl&AN=00000042-201011000-00010\r\n\r\n<94. >\r\nVN  - Ovid Technologies\r\nDB  - Your Journals@Ovid\r\nAN  - 00000372-201112000-00014.\r\nAU  - Gazic, Barbara MD, PhD *\r\nAU  - Pizem, Joze MD, PhD +\r\nIN  - From the *Department of Pathology, Institute of Oncology, Ljubljana, Slovenia; and +Institute of Pathology, Medical Faculty, University of Ljubliana, Ljubljana, Slovenia.\r\nTI  - Lobular Breast Carcinoma Metastasis to a Superficial Plexiform Schwannoma as the First Evidence of an Occult Breast Cancer.  [Report]\r\nSO  - American Journal of Dermatopathology December 2011;33(8):845-849\r\nJC  - 35v, 7911005\r\nAB  - Tumor to tumor metastasis is a rare phenomenon, in which one, benign or malignant, tumor is involved by metastatic deposits from another. Most documented tumor to tumor metastases have been located intracranially, in which, in the majority of cases, either a breast or a lung carcinoma metastasized to a meningioma. Only 7 cases of metastases to schwannoma have so far been reported in the English literature, in 6 cases to an intracranial acoustic schwannoma and in a single case to a subcutaneous schwannoma. We present a case of dermal/subcutaneous plexiform schwannoma containing metastatic deposits of an occult lobular breast carcinoma, creating a unique schwannoma with epithelioid cells. Differential diagnosis of schwannoma with epithelioid cells includes malignant transformation of schwannoma and metastasis of a carcinoma or melanoma to schwannoma, epithelioid schwannoma, and schwannoma with glandular or pseudo glandular elements., (C) 2011 Lippincott Williams & Wilkins, Inc.\r\nKW  - plexiform schwannoma;  lobular breast carcinoma;  tumor to tumor metastasis\r\nLG  - English.\r\nDT  - Extraordinary Case Report.\r\nSB  - Clinical Medicine, Health Professions.\r\nIS  - 0193-1091\r\nDI  - 10.1097/DAD.0b013e31820d9c0e\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=yrovftm&AN=00000372-201112000-00014\r\n\r\n\r\n",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "James A.",
						"lastName": "Peterson",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "Journals@Ovid",
				"title": "Take Ten: Need-to-Know Facts About Breast Cancer",
				"language": "English.",
				"ISSN": "1091-5397",
				"DOI": "10.1249/FIT.0b013e3181c6723d",
				"date": "2010 January/February",
				"volume": "14",
				"issue": "1",
				"publicationTitle": "Journal"
			},
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Weijia",
						"lastName": "Zhang",
						"creatorType": "author"
					},
					{
						"firstName": "Wei",
						"lastName": "Ding",
						"creatorType": "author"
					},
					{
						"firstName": "Ye",
						"lastName": "Chen",
						"creatorType": "author"
					},
					{
						"firstName": "Meilin",
						"lastName": "Feng",
						"creatorType": "author"
					},
					{
						"firstName": "Yongmei",
						"lastName": "Ouyang",
						"creatorType": "author"
					},
					{
						"firstName": "Yanhui",
						"lastName": "Yu",
						"creatorType": "author"
					},
					{
						"firstName": "Zhimin",
						"lastName": "He",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"BCRP",
					"PI3K/AKT/NF-[kappa]B",
					"chemoresistance"
				],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "Journals@Ovid",
				"title": "Up-regulation of breast cancer resistance protein plays a role in HER2-mediated chemoresistance through PI3K/Akt and nuclear factor-kappa B signaling pathways in MCF7 breast cancer cells",
				"abstractNote": "Human epidermal growth factor receptor 2 (HER2/neu, also known as ErbB2) overexpression is correlated with the poor prognosis and chemoresistance in cancer. Breast cancer resistance protein (BCRP and ABCG2) is a drug efflux pump responsible for multidrug resistance (MDR) in a variety of cancer cells. HER2 and BCRP are associated with poor treatment response in breast cancer patients, although the relationship between HER2 and BCRP expression is not clear. Here, we showed that transfection of HER2 into MCF7 breast cancer cells (MCF7/HER2) resulted in an up-regulation of BCRP via the phosphatidylinositol 3-kinase (PI3K)/Akt and nuclear factor-kappa B (NF-[kappa]B) signaling. Treatment of MCF/HER2 cells with the PI3K inhibitor LY294002, the I[kappa]B phosphorylation inhibitor Bay11-7082, and the dominant negative mutant of I[kappa]B[alpha] inhibited HER2-induced BCRP promoter activity. Furthermore, we found that HER2 overexpression led to an increased resistance of MCF7 cells to multiple antitumor drugs such as paclitaxel (Taxol), cisplatin (DDP), etoposide (VP-16), adriamycin (ADM), mitoxantrone (MX), and 5-fluorouracil (5-FU). Moreover, silencing the expression of BCRP or selectively inhibiting the activity of Akt or NF-[kappa]B sensitized the MCF7/HER2 cells to these chemotherapy agents at least in part. Taken together, up-regulation of BCRP through PI3K/AKT/NF-[kappa]B signaling pathway played an important role in HER2-mediated chemoresistance of MCF7 cells, and AKT, NF-[kappa]B, and BCRP pathways might serve as potential targets for therapeutic intervention., Copyright (C) 2011 Blackwell Publishing Ltd.",
				"language": "English.",
				"ISSN": "1672-9145",
				"DOI": "10.1093/abbs/gmr050",
				"date": "2011 August",
				"volume": "43",
				"issue": "8",
				"pages": "647-653",
				"publicationTitle": "Acta Biochimica et Biophysica Sinica"
			},
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Ph",
						"lastName": "Simon",
						"creatorType": "author"
					},
					{
						"firstName": "S.",
						"lastName": "Dept",
						"creatorType": "author"
					},
					{
						"firstName": "F.",
						"lastName": "Lefranc",
						"creatorType": "author"
					},
					{
						"firstName": "J. C.",
						"lastName": "Noel",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "Journals@Ovid",
				"title": "Brain Metastasis after Breast Cancer and Hysterectomy for a Benign Leiomyoma",
				"language": "English.",
				"ISSN": "0001-5458",
				"date": "2010 November/December",
				"volume": "6",
				"pages": "611-613",
				"publicationTitle": "Acta Chirurgica Belgica"
			},
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Barbara",
						"lastName": "Gazic",
						"creatorType": "author"
					},
					{
						"firstName": "Joze",
						"lastName": "Pizem",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"plexiform schwannoma",
					"lobular breast carcinoma",
					"tumor to tumor metastasis"
				],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "Your Journals@Ovid",
				"title": "Lobular Breast Carcinoma Metastasis to a Superficial Plexiform Schwannoma as the First Evidence of an Occult Breast Cancer",
				"abstractNote": "Tumor to tumor metastasis is a rare phenomenon, in which one, benign or malignant, tumor is involved by metastatic deposits from another. Most documented tumor to tumor metastases have been located intracranially, in which, in the majority of cases, either a breast or a lung carcinoma metastasized to a meningioma. Only 7 cases of metastases to schwannoma have so far been reported in the English literature, in 6 cases to an intracranial acoustic schwannoma and in a single case to a subcutaneous schwannoma. We present a case of dermal/subcutaneous plexiform schwannoma containing metastatic deposits of an occult lobular breast carcinoma, creating a unique schwannoma with epithelioid cells. Differential diagnosis of schwannoma with epithelioid cells includes malignant transformation of schwannoma and metastasis of a carcinoma or melanoma to schwannoma, epithelioid schwannoma, and schwannoma with glandular or pseudo glandular elements., (C) 2011 Lippincott Williams & Wilkins, Inc.",
				"language": "English.",
				"ISSN": "0193-1091",
				"DOI": "10.1097/DAD.0b013e31820d9c0e",
				"date": "2011 December",
				"volume": "33",
				"issue": "8",
				"pages": "845-849",
				"publicationTitle": "Journal of Dermatopathology"
			}
		]
	},
	{
		"type": "import",
		"input": "<697. >\r\nVN  - Ovid Technologies\r\nDB  - Zoological Record\r\nAN  - ZOOR14305031738\r\nRO  - Copyright 2010 Thomson Reuters\r\nTI  - Spiders (Arachnida, Aranei) from Sakhalin and the Kuril Islands.\r\nAU  - Marusik, YuM\r\nAU  - Eskov, KYu\r\nAU  - Logunov, DV\r\nAU  - Basarukin, AM\r\nIN  - Institute for Biological Problems of the North, Russian Academy of Sciences, Karl Marx Prospekt 24, Magadan, 685010, Russia.\r\nIU  - http://artedi.fish.washington.edu/okhotskia/isip/Info/spiders.htm [13/03/2007]\r\nPB  - International Sakhalin Island Project, place of publication not given\r\nBT  - Spiders (Arachnida, Aranei) from Sakhalin and the Kuril Islands. International Sakhalin Island Project, place of publication not given. [undated]: Unpaginated. http://artedi.fish.washington.edu/okhotskia/isip/Info/spiders.htm [viewed 13 March, 2007]\r\nLG  - English\r\nPT  - Book\r\nAB  - A check-list of spiders based on personal and literature data from Sakhalin and Kuril Islands is presented. Four hundred and three species have been found there. Distribution records within Sakhalin (districts) and the Kuril Islands are given. Dubious species recorded by Japanese authors (1924-1937) are listed separately with some comments. Twelve new synonyms, new combinations, and new nominations are proposed. Several previous misidentifications in the Far Eastern linyphiids are corrected.\r\nBR  - Systematics\r\nBR  - Nomenclature\r\nBR  - Combination\r\nBR  - Synonymy\r\nBR  - Available name\r\nBR  - Taxonomy\r\nBR  - Taxonomic position\r\nBR  - Documentation\r\nBR  - Publications\r\nBR  - Land zones\r\nBR  - Palaearctic region\r\nBR  - Eurasia\r\nTN  - Arachnids\r\nTN  - Arthropods\r\nTN  - Chelicerates\r\nTN  - Invertebrates\r\nST  - Animalia\r\nST  - Arthropoda\r\nST  - Arachnida\r\nST  - Araneae\r\nDE  - Aranei: Checklists, Distributional checklist, Corrected & updated, Russia, Kuril Islands & Sakhalin, Corrected & updated distributional checklist & systematics.\r\nSY  - Aranei, http://www.organismnames.com/namedetails.htm?lsid=574767, (Araneae)\r\n\r\n      Bathyphantes gracilis (Blackwall 1841), http://www.organismnames.com/namedetails.htm?lsid=1822086, (Araneae): Syn nov, Bathyphantes orientis Oi 1960: Syn nov, Bathyphantes pusio Kulczynski 1885\r\n\r\n      Bathyphantes pogonias Kulczynski 1885, http://www.organismnames.com/namedetails.htm?lsid=1895287, (Araneae): Syn nov, Bathyphantes castor Chamberlin 1925: Syn nov, Bathyphantes insulanus Holm 1960\r\n\r\n      Ceratinopsis okhotensis Eskov, http://www.organismnames.com/namedetails.htm?lsid=1895288, (Araneae): Nom nov, For Ceratinopsis orientalis Eskov 1986\r\n\r\n      Ceratinopsis orientalis Eskov 1986, http://www.organismnames.com/namedetails.htm?lsid=1895289, (Araneae): Preoccupied name replaced by, Ceratinopsis okhotensis Eskov\r\n\r\n      Connithorax Eskov, http://www.organismnames.com/namedetails.htm?lsid=1895290, (Araneae): Nom nov, For Conothorax Eskov & Marusik 1992\r\n\r\n      Conothorax Eskov & Marusik 1992, http://www.organismnames.com/namedetails.htm?lsid=1042692, (Araneae): Preoccupied name replaced by, Connithorax Eskov\r\n\r\n      Erigone prolata Pickard-Cambridge 1873, http://www.organismnames.com/namedetails.htm?lsid=1895291, (Araneae): Referred to, Holminaria\r\n\r\n      Holminaria prolata (Pickard-Cambridge 1873), http://www.organismnames.com/namedetails.htm?lsid=1895292, (Araneae): Comb nov, Transferred from Erigone: Syn nov, Holminaria obscura Eskov 1991\r\n\r\n      Hybauchenidium mongolensis Heimer 1987, http://www.organismnames.com/namedetails.htm?lsid=666509, (Araneae): Referred to, Oedothorax\r\n\r\n      Kaestneria anceps (Kulczynski 1885), http://www.organismnames.com/namedetails.htm?lsid=1895293, (Araneae): Junior synonym, Of Kaestneria pullata (Pickard-Cambridge 1863)\r\n\r\n      Kaestneria pullata (Pickard-Cambridge 1863), http://www.organismnames.com/namedetails.htm?lsid=1895294, (Araneae): Senior synonym, Of Kaestneria anceps (Kulczynski 1885)\r\n\r\n      Labula insularis (Saito 1935), http://www.organismnames.com/namedetails.htm?lsid=1895295, (Araneae): Syn nov, Labula chikunii Oi 1980\r\n\r\n      Oedothorax mongolensis (Heimer 1987), http://www.organismnames.com/namedetails.htm?lsid=1895296, (Araneae): Comb nov, Transferred from Hybauchenidium\r\n\r\n      Walckenaeria karpinskii (Pickard-Cambridge 1873), http://www.organismnames.com/namedetails.htm?lsid=1895297, (Araneae): Syn nov, Walckenaeria holmi (Millidge 1984)\r\n\r\n      Walckenaeria vigilax (Blackwell 1853), http://www.organismnames.com/namedetails.htm?lsid=1895298, (Araneae): Syn nov, Erigone sollers Pickard-Cambridge 1873\r\nDD  - 20100727\r\nUP  - 201203. Zoological Records Update: 200705.\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=zoor12&AN=ZOOR14305031738\r\nXL  - http://libraries.colorado.edu:4550/resserv?sid=OVID:zoordb&id=pmid:&id=doi:&issn=&isbn=&volume=&issue=&spage=&pages=Unpaginated&date=&title=&atitle=Spiders+%28Arachnida%2C+Aranei%29+from+Sakhalin+and+the+Kuril+Islands.&aulast=Marusik&pid=%3Cauthor%3EMarusik%2C+YuM%3BEskov%2C+KYu%3BLogunov%2C+DV%3BBasarukin%2C+AM%3C%2Fauthor%3E%3CAN%3EZOOR14305031738%3C%2FAN%3E%3CDT%3E%3C%2FDT%3E\r\n\r\n<718. >\r\nVN  - Ovid Technologies\r\nDB  - Zoological Record\r\nAN  - ZOOR14303018462\r\nRO  - Copyright 2010 Thomson Reuters\r\nTI  - Parasites of fishes: list of and dichotomous key to the identification of major metazoan groups.\r\nAU  - Benz, George W [E-mail: gbenz@mtsu.edu]\r\nAU  - Bullard, Stephen A\r\nIN  - Department of Biology, P.O. Box 60, Middle Tennessee State University, Murfreesboro, TN 37132, USA.\r\nSO  - Association of Zoos and Aquariums Regional Meetings Proceedings. 2005; 9pp..\r\nJL  - http://www.aza.org/ConfWork/\r\nIU  - http://www.aza.org/AZAPublications/2005ProceedingsReg/Documents/2005RegConfKnoxville3.pdf [23/01/2007]\r\nLG  - English\r\nPT  - Article\r\nPT  - Meeting paper\r\nBR  - Systematics\r\nBR  - Taxonomy\r\nBR  - Techniques\r\nBR  - Pathological techniques\r\nBR  - Parasites diseases and disorders\r\nBR  - Hosts\r\nTN  - Chordates\r\nTN  - Fish\r\nTN  - Vertebrates\r\nST  - Animalia\r\nST  - Chordata\r\nST  - Vertebrata\r\nDE  - Metazoa: Identification techniques, Parasites of Pisces in captivity, keys for parasite identification & risk assessment relationships, Diagnostic techniques, Piscean hosts, Parasitism in captivity.\r\n\r\n      Pisces: Care in captivity, Metazoan parasitism in captivity, keys for parasite identification & risk assessment relationships, Diagnostic techniques, Diagnosis of parasites, Parasites, Metazoa, Parasitism in captivity.\r\nSY  - Metazoa, http://www.organismnames.com/namedetails.htm?lsid=17934, (Animalia): Key, To major groups, Parasites of Pisces, in captivity, p. 3, Parasite\r\n\r\n      Pisces, http://www.organismnames.com/namedetails.htm?lsid=249, (Vertebrata): Host\r\nYR  - 2005\r\nDD  - 20100727\r\nUP  - 201203. Zoological Records Update: 200703.\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=zoor12&AN=ZOOR14303018462\r\nXL  - http://libraries.colorado.edu:4550/resserv?sid=OVID:zoordb&id=pmid:&id=doi:&issn=&isbn=&volume=2005&issue=&spage=&pages=9pp.&date=2005&title=Association+of+Zoos+and+Aquariums+Regional+Meetings+Proceedings&atitle=Parasites+of+fishes%3A+list+of+and+dichotomous+key+to+the+identification+of+major+metazoan+groups.&aulast=Benz&pid=%3Cauthor%3EBenz%2C+George+W%3BBullard%2C+Stephen+A%3C%2Fauthor%3E%3CAN%3EZOOR14303018462%3C%2FAN%3E%3CDT%3E%3C%2FDT%3E\r\n\r\n<723. >\r\nVN  - Ovid Technologies\r\nDB  - Zoological Record\r\nAN  - ZOOR14302012772\r\nRO  - Copyright 2010 Thomson Reuters\r\nTI  - Key to the herpetofauna of Fiji.\r\nAU  - Morrison, Clare\r\nIU  - http://www.lucidcentral.org/keys/phoenix/fiji/herpetofauna/ [05/01/2007]\r\nPB  - University of the South Pacific, Institute of Applied Sciences, Suva\r\nBT  - Key to the herpetofauna of Fiji. University of the South Pacific, Institute of Applied Sciences, Suva. 2006: Unpaginated. http://www.lucidcentral.org/keys/phoenix/fiji/herpetofauna/ [viewed 05 January, 2007]\r\nLG  - English\r\nPT  - Book\r\nNT  - Interactive online key using Lucid3 software.\r\nBR  - Systematics\r\nBR  - Taxonomy\r\nBR  - Key\r\nBR  - Land zones\r\nBR  - Oceanic islands\r\nBR  - Pacific Ocean islands\r\nTN  - Amphibians\r\nTN  - Chordates\r\nTN  - Reptiles\r\nTN  - Vertebrates\r\nST  - Animalia\r\nST  - Chordata\r\nST  - Vertebrata\r\nDE  - Amphibia, Reptilia: Fiji, Key to species.\r\nSY  - Amphibia, http://www.organismnames.com/namedetails.htm?lsid=13, (Vertebrata): Key to species, Fiji\r\n\r\n      Reptilia, http://www.organismnames.com/namedetails.htm?lsid=14, (Vertebrata)\r\nYR  - 2006\r\nDD  - 20100727\r\nUP  - 201203. Zoological Records Update: 200702.\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=zoor12&AN=ZOOR14302012772\r\nXL  - http://libraries.colorado.edu:4550/resserv?sid=OVID:zoordb&id=pmid:&id=doi:&issn=&isbn=&volume=&issue=&spage=&pages=Unpaginated&date=2006&title=&atitle=Key+to+the+herpetofauna+of+Fiji.&aulast=Morrison&pid=%3Cauthor%3EMorrison%2C+Clare%3C%2Fauthor%3E%3CAN%3EZOOR14302012772%3C%2FAN%3E%3CDT%3E%3C%2FDT%3E\r\n\r\n<1317. >\r\nVN  - Ovid Technologies\r\nDB  - Zoological Record\r\nAN  - ZOOR14312075663\r\nRO  - Copyright 2009 Thomson Reuters\r\nTI  - The role of temperature in the population dynamics of smelt Osmerus eperlanus eperlanus m. spirinchus Pallas in Lake Peipsi (Estonia/Russia).\r\nAU  - Kangur, Andu [E-mail: akangur@zbi.ee]\r\nAU  - Kangur, Peeter\r\nAU  - Kangur, Kulli\r\nAU  - Mols, Tonu\r\nIN  - Centre for Limnology, Institute of Agricultural and Environmental Sciences, Estonian University of Life Sciences, 61101 Rannu, Estonia.\r\nSO  - Hydrobiologia. 2007 15 June; 433-441.\r\nIS  - 0018-8158\r\nLG  - English\r\nPT  - Article\r\nPT  - Meeting paper\r\nAB  - We analysed lake smelt (Osmerus eperlanus eperlanus m. spirinchus Pallas.) population dynamics in relation to water level and temperature in Lake Peipsi, Estonia/Russia, using commercial fishery statistics from 1931 to 2004 (excluding 1940-1945). Over this period, smelt provided the greatest catch of commercial fish although its stock and catches have gradually decreased. At times, catches of smelt were quite variable with a cyclic character. Disappearance of smelt from catches in years 1973-1975 was the result of summer fish kill. Regression analysis revealed a significant negative effect of high temperature on the abundance of smelt stock, while the effect of water level was not significant. Our results suggest that critical factors for the smelt population are the absolute value of water temperature in the hottest period (=20[degree]C) of summer and the duration of this period. These weather parameters have increased in synchrony with smelt decline during the last 7 decades. There appeared to be a significant negative effect of hot summers on the abundance of smelt operating with a lag of one and 2 years, which can be explained by the short life cycle (mainly 1-2 years) of this species.\r\nBR  - Ecology\r\nBR  - Habitat\r\nBR  - Freshwater habitat\r\nBR  - Lentic water\r\nBR  - Abiotic factors\r\nBR  - Physical factors\r\nBR  - Land zones\r\nBR  - Palaearctic region\r\nBR  - Eurasia\r\nBR  - Europe\r\nTN  - Chordates\r\nTN  - Fish\r\nTN  - Vertebrates\r\nST  - Animalia\r\nST  - Chordata\r\nST  - Vertebrata\r\nST  - Pisces\r\nST  - Osteichthyes\r\nST  - Actinopterygii\r\nST  - Salmoniformes\r\nST  - Osmeridae\r\nDE  - Osmerus eperlanus eperlanus morph. spirinchus: Population dynamics, Temperature effects, Lake, Shallow lake, Temperature, Effect on population dynamics, Estonia, Lake Peipsi.\r\nSY  - Osmerus eperlanus eperlanus morph. spirinchus, http://www.organismnames.com/namedetails.htm?lsid=160256, (Osmeridae)\r\nYR  - 2007\r\nDD  - 20090629\r\nUP  - 200700. Zoological Records Update: 200712.\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=zoor12&AN=ZOOR14312075663\r\nXL  - http://libraries.colorado.edu:4550/resserv?sid=OVID:zoordb&id=pmid:&id=doi:&issn=0018-8158&isbn=&volume=584&issue=&spage=433&pages=433-441&date=2007&title=Hydrobiologia&atitle=The+role+of+temperature+in+the+population+dynamics+of+smelt+Osmerus+eperlanus+eperlanus+m.+spirinchus+Pallas+in+Lake+Peipsi+%28Estonia%2FRussia%29.&aulast=Kangur&pid=%3Cauthor%3EKangur%2C+Andu%3BKangur%2C+Peeter%3BKangur%2C+Kulli%3BMols%2C+Tonu%3C%2Fauthor%3E%3CAN%3EZOOR14312075663%3C%2FAN%3E%3CDT%3E%3C%2FDT%3E\r\n\r\n\r\n",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "YuM",
						"lastName": "Marusik",
						"creatorType": "author"
					},
					{
						"firstName": "KYu",
						"lastName": "Eskov",
						"creatorType": "author"
					},
					{
						"firstName": "D. V.",
						"lastName": "Logunov",
						"creatorType": "author"
					},
					{
						"firstName": "A. M.",
						"lastName": "Basarukin",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "Zoological Record",
				"rights": "Copyright 2010 Thomson Reuters",
				"title": "Spiders (Arachnida, Aranei) from Sakhalin and the Kuril Islands",
				"publisher": "International Sakhalin Island Project",
				"bookTitle": "Spiders (Arachnida, Aranei) from Sakhalin and the Kuril Islands. International Sakhalin Island Project, place of publication not given. [undated]: Unpaginated. http://artedi.fish.washington.edu/okhotskia/isip/Info/spiders.htm [viewed 13 March, 2007]",
				"language": "English",
				"abstractNote": "A check-list of spiders based on personal and literature data from Sakhalin and Kuril Islands is presented. Four hundred and three species have been found there. Distribution records within Sakhalin (districts) and the Kuril Islands are given. Dubious species recorded by Japanese authors (1924-1937) are listed separately with some comments. Twelve new synonyms, new combinations, and new nominations are proposed. Several previous misidentifications in the Far Eastern linyphiids are corrected.",
				"place": "place of publication not given"
			},
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "George W.",
						"lastName": "Benz",
						"creatorType": "author"
					},
					{
						"firstName": "Stephen A.",
						"lastName": "Bullard",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "Zoological Record",
				"rights": "Copyright 2010 Thomson Reuters",
				"title": "Parasites of fishes: list of and dichotomous key to the identification of major metazoan groups",
				"citation": "Association of Zoos and Aquariums Regional Meetings Proceedings. 2005; 9pp..",
				"language": "English",
				"date": "2005",
				"publicationTitle": "Association of Zoos and Aquariums Regional Meetings Proceedings"
			},
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Clare",
						"lastName": "Morrison",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "Zoological Record",
				"rights": "Copyright 2010 Thomson Reuters",
				"title": "Key to the herpetofauna of Fiji",
				"publisher": "University of the South Pacific",
				"bookTitle": "Key to the herpetofauna of Fiji. University of the South Pacific, Institute of Applied Sciences, Suva. 2006: Unpaginated. http://www.lucidcentral.org/keys/phoenix/fiji/herpetofauna/ [viewed 05 January, 2007]",
				"language": "English",
				"date": "2006",
				"place": "Institute of Applied Sciences, Suva"
			},
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Andu",
						"lastName": "Kangur",
						"creatorType": "author"
					},
					{
						"firstName": "Peeter",
						"lastName": "Kangur",
						"creatorType": "author"
					},
					{
						"firstName": "Kulli",
						"lastName": "Kangur",
						"creatorType": "author"
					},
					{
						"firstName": "Tonu",
						"lastName": "Mols",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "Zoological Record",
				"rights": "Copyright 2009 Thomson Reuters",
				"title": "The role of temperature in the population dynamics of smelt Osmerus eperlanus eperlanus m. spirinchus Pallas in Lake Peipsi (Estonia/Russia)",
				"citation": "Hydrobiologia. 2007 15 June; 433-441.",
				"ISSN": "0018-8158",
				"language": "English",
				"abstractNote": "We analysed lake smelt (Osmerus eperlanus eperlanus m. spirinchus Pallas.) population dynamics in relation to water level and temperature in Lake Peipsi, Estonia/Russia, using commercial fishery statistics from 1931 to 2004 (excluding 1940-1945). Over this period, smelt provided the greatest catch of commercial fish although its stock and catches have gradually decreased. At times, catches of smelt were quite variable with a cyclic character. Disappearance of smelt from catches in years 1973-1975 was the result of summer fish kill. Regression analysis revealed a significant negative effect of high temperature on the abundance of smelt stock, while the effect of water level was not significant. Our results suggest that critical factors for the smelt population are the absolute value of water temperature in the hottest period (=20[degree]C) of summer and the duration of this period. These weather parameters have increased in synchrony with smelt decline during the last 7 decades. There appeared to be a significant negative effect of hot summers on the abundance of smelt operating with a lag of one and 2 years, which can be explained by the short life cycle (mainly 1-2 years) of this species.",
				"date": "2007 June",
				"publicationTitle": "Hydrobiologia"
			}
		]
	},
	{
		"type": "import",
		"input": "<11741. >\r\nVN  - Ovid Technologies\r\nDB  - Zoological Record\r\nAN  - ZOOR14310064653\r\nRO  - Copyright 2009 Thomson Reuters\r\nTI  - [Parasitic copepods of the genera Salmincola and Tracheliastes (Lernaeopodidae) from freshwater fish of the Sakhalin Island.]\r\nAU  - Shedko, MB\r\nAU  - Vinogradov, SA\r\nAU  - Shedko, SV\r\nIN  - Biologo-pochvennyi institut DVO RAN, Vladivostok, Russia.\r\nPB  - ISiEZH SO RAN, Novosibirsk\r\nBT  - Guliaev, V.D. [Ed.]. [Parasitological research in Siberia and the Far East: materials of the first interregional scientific conference in memory of Professor A.A. Mozgovoi.] [Parazitologicheskie issledovaniya v Sibiri i na Dalnem Vostoke. Materialy pervogo mezhergionalnoi nauchnoi konferentsii, posvyashchennoi pamyati professora A.A. Mozgovogo.] ISiEZH SO RAN, Novosibirsk. 2002: 1-234. Chapter pagination: 214-218.\r\nLG  - Russian\r\nPT  - Book chapter\r\nPT  - Meeting paper\r\nBR  - Systematics\r\nBR  - General morphology\r\nBR  - Parasites diseases and disorders\r\nBR  - Parasites\r\nBR  - Hosts\r\nBR  - Land zones\r\nBR  - Palaearctic region\r\nBR  - Eurasia\r\nTN  - Arthropods\r\nTN  - Chordates\r\nTN  - Crustaceans\r\nTN  - Fish\r\nTN  - Invertebrates\r\nTN  - Vertebrates\r\nST  - Animalia\r\nST  - Arthropoda\r\nST  - Crustacea\r\nST  - Copepoda\r\nST  - Siphonostomatoida\r\nST  - Chordata\r\nST  - Vertebrata\r\nDE  - Pisces: Crustacean parasites, Salmincola & Tracheliastes, Parasite prevalence & distribution on host, Russia, Sakhalin Island, Crustacean parasite prevalence & distribution on host.\r\n\r\n      Salmincola californiensis, Salmincola edwardsii, Salmincola markewitschi, Salmincola stellatus, Tracheliastes sachalinensis: General morphology, Taxonomic significance, Piscean hosts, Parasite prevalence & distribution on host, Russia, Sakhalin Island, parasite prevalence & distribution.\r\nSY  - Salmincola californiensis, http://www.organismnames.com/namedetails.htm?lsid=62073, (Siphonostomatoida): Parasite\r\n\r\n      Salmincola edwardsii, http://www.organismnames.com/namedetails.htm?lsid=45149, (Siphonostomatoida): Parasite\r\n\r\n      Salmincola markewitschi, http://www.organismnames.com/namedetails.htm?lsid=1595526, (Siphonostomatoida): Parasite\r\n\r\n      Salmincola stellatus, http://www.organismnames.com/namedetails.htm?lsid=898989, (Siphonostomatoida): Parasite\r\n\r\n      Tracheliastes sachalinensis, http://www.organismnames.com/namedetails.htm?lsid=1920998, (Siphonostomatoida): Parasite\r\n\r\n      Pisces, http://www.organismnames.com/namedetails.htm?lsid=249, (Vertebrata): Host\r\nYR  - 2002\r\nDD  - 20090629\r\nUP  - 200700. Zoological Records Update: 200710.\r\nXL  - http://ovidsp.ovid.com/ovidweb.cgi?T=JS&CSC=Y&NEWS=N&PAGE=fulltext&D=zoor12&AN=ZOOR14310064653\r\nXL  - http://libraries.colorado.edu:4550/resserv?sid=OVID:zoordb&id=pmid:&id=doi:&issn=&isbn=&volume=&issue=&spage=214&pages=214-218&date=2002&title=&atitle=%5BParasitic+copepods+of+the+genera+Salmincola+and+Tracheliastes+%28Lernaeopodidae%29+from+freshwater+fish+of+the+Sakhalin+Island.%5D&aulast=Shedko&pid=%3Cauthor%3EShedko%2C+MB%3BVinogradov%2C+SA%3BShedko%2C+SV%3C%2Fauthor%3E%3CAN%3EZOOR14310064653%3C%2FAN%3E%3CDT%3E%3C%2FDT%3E\r\n\r\n\r\n",
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"lastName": "Shedko",
						"creatorType": "author"
					},
					{
						"firstName": "S. A.",
						"lastName": "Vinogradov",
						"creatorType": "author"
					},
					{
						"firstName": "S. V.",
						"lastName": "Shedko",
						"creatorType": "author"
					},
					{
						"firstName": "V. D.",
						"lastName": "Guliaev",
						"creatorType": "editor"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "Zoological Record",
				"rights": "Copyright 2009 Thomson Reuters",
				"title": "[Parasitic copepods of the genera Salmincola and Tracheliastes (Lernaeopodidae) from freshwater fish of the Sakhalin Island.]",
				"publisher": "ISiEZH SO RAN",
				"bookTitle": "[Parasitological research in Siberia and the Far East: materials of the first interregional scientific conference in memory of Professor A",
				"language": "Russian",
				"date": "2002",
				"pages": "1-234",
				"place": "Novosibirsk"
			}
		]
	}
]
/** END TEST CASES **/