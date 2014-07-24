{
	"translatorID": "b6d0a7a-d076-48ae-b2f0-b6de28b194e",
	"label": "ScienceDirect",
	"creator": "Michael Berkowitz and Aurimas Vinckevicius",
	"target": "^https?://[^/]*science-?direct\\.com[^/]*/science(?:/article/|\\?.*\\b_ob=ArticleListURL|/(?:journal|bookseries|book|handbooks|referenceworks)/\\d)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2014-06-02 02:22:48"
}

function detectWeb(doc, url) {
  	if ((url.indexOf("_ob=DownloadURL") !== -1) 
		|| doc.title == "ScienceDirect Login" 
		|| doc.title == "ScienceDirect - Dummy"
		|| (url.indexOf("/science/advertisement/") !== -1)) { 
		return false;
	}

	if((url.indexOf("pdf") !== -1
			&& url.indexOf("_ob=ArticleURL") === -1
			&& url.indexOf("/article/") === -1)
		|| url.search(/\/(?:journal|bookseries|book|handbooks|referenceworks)\//) !== -1
		|| url.indexOf("_ob=ArticleListURL") !== -1) {
		if (getArticleList(doc).length > 0) {
			return "multiple";
		} else {
			return false;
		}
	} else if(url.indexOf("pdf") === -1) {
		// Book sections have the ISBN in the URL
		if (url.indexOf("/B978") !== -1) {
			return "bookSection";
		} else if(getISBN(doc)) {
			if(getArticleList(doc).length) {
				return "multiple";
			} else {
				return "book";
			}
		} else {
			return "journalArticle";
		}
	} 
}

function getExportLink(doc) {
	var link = ZU.xpath(doc, '//div[@class="icon_exportarticlesci_dir"]/a/@href');
	return link.length ? link[0].textContent : false;
}

function getExportFormAction(doc) {
	var form = ZU.xpath(doc, '//div[@id="export_popup"]/form')[0];
	return form ? form.action : false;
}

function getPDFLink(doc) {
	return ZU.xpathText(doc,
		'//div[@id="articleNav"]//div[contains(@class, "icon_pdf")]\
			/a[not(@title="Purchase PDF")]/@href[1]');
}

function getISBN(doc) {
	var isbn = ZU.xpathText(doc, '//td[@class="tablePubHead-Info"]\
		//span[@class="txtSmall"]');
	if(!isbn) return;

	isbn = isbn.match(/ISBN:\s*([-\d]+)/);
	if(!isbn) return;

	return isbn[1].replace(/[-\s]/g, '');
}

function getFormValues(text, inputs) {
	var re = new RegExp("<input[^>]+name=(['\"]?)("
			+ inputs.join('|')
			+ ")\\1[^>]*>", 'g');

	var input, val, params = {};
	while(input = re.exec(text)) {
		val = input[0].match(/value=(['"]?)(.*?)\1[\s>]/);
		if(!val) continue;

		params[encodeURIComponent(input[2])] = encodeURIComponent(val[2]);
	}

	return params;
}

function getAbstract(doc) {
	var p = ZU.xpath(doc, '//div[contains(@class, "abstract") and not(contains(@class, "abstractHighlights"))]/p');
	var paragraphs = [];
	for(var i=0; i<p.length; i++) {
		paragraphs.push(ZU.trimInternal(p[i].textContent));
	}
	return paragraphs.join('\n');
}

//mimetype map for supplementary attachments
//intentionally excluding potentially large files like videos and zip files
var suppTypeMap = {
	'pdf': 'application/pdf',
//	'zip': 'application/zip',
	'doc': 'application/msword',
	'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'xls': 'application/vnd.ms-excel',
	'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

//attach supplementary information
function attachSupplementary(doc, item) {
	var links = ZU.xpath(doc, './/span[starts-with(@class, "MMCvLABEL_SRC")]');
	var link, title, url, type, snapshot;
	var attachAsLink = Z.getHiddenPref("supplementaryAsLink");
	for(var i=0, n=links.length; i<n; i++) {
		link = links[i].firstElementChild;
		if(!link || link.nodeName.toUpperCase() !== 'A') continue;
		
		url = link.href;
		if(!url) continue;
		
		title = ZU.trimInternal(link.textContent);
		if(!title) title = 'Supplementary Data';
		
		type = suppTypeMap[url.substr(url.lastIndexOf('.')+1).toLowerCase()];
		snapshot = !attachAsLink && type;
		
		var attachment = {
			title: title,
			url: url,
			mimeType: type,
			snapshot: !!snapshot
		};
		
		var replaced = false;
		if(snapshot && title.search(/Article plus Supplemental Information/i) != -1) {
			//replace full text PDF
			for(var j=0, m=item.attachments.length; j<m; j++) {
				if(item.attachments[j].title == "ScienceDirect Full Text PDF") {
					attachment.title = "Article plus Supplemental Information";
					item.attachments[j] = attachment;
					replaced = true;
					break;
				}
			}
		}
		
		if(!replaced) {
			item.attachments.push(attachment);
		}
	}
}

function scrapeByDirectExport(doc) {
	Z.debug("ScienceDirect: Scrapping by RIS directly through export form");
	var url = getExportFormAction(doc);
	var postParams = 'citation-type=RIS&zone=exportDropDown&export=Export&format=cite-abs';
	ZU.doPost(url, postParams, function(text) { processRIS(doc, text) });
}

function scrapeByExport(doc) {
	Z.debug("ScienceDirect: Scraping by RIS export through an intermediate page");
	var url = getExportLink(doc);
	ZU.doGet(url, function(text) {
		//select the correct form
		var form = text.match(/<form[^>]+name=(['"])exportCite\1[\s\S]+?<\/form>/);
		if(form) {
			form = form[0];
		} else {
			form = text.match(/<form[^>]*>/g);
			if(!form) {
				Z.debug('No forms found on page.');
			} else {
				Z.debug(form.join('\n*********\n'));
			}
			throw new Error('exportCite form could not be found.');
		}

		var postParams = getFormValues(form, [
						//'_ArticleListID',	//do we still need this?
						'_acct', '_docType', '_eidkey',
						'_method', '_ob', '_uoikey', '_userid', 'count',
						'Export', 'JAVASCRIPT_ON', 'md5'
						]);
		postParams["format"] = "cite-abs";
		postParams["citation-type"] = "RIS";

		var post = '';
		for(var key in postParams) {
			post += key + '=' + postParams[key] + "&";
		}

		ZU.doPost('/science', post, function(text) { processRIS(doc, text) });
	});
}

function processRIS(doc, text) {
	//T2 doesn't appear to hold the short title anymore.
	//Sometimes has series title, so I'm mapping this to T3,
	// although we currently don't recognize that in RIS
	text = text.replace(/^T2\s/mg, 'T3 ');
	
	//Sometimes PY has some nonsensical value. Y2 contains the correct
	// date in that case.
	if(text.search(/^Y2\s+-\s+\d{4}\b/m) !== -1) {
		text = text.replace(/TY\s+-[\S\s]+?ER/g, function(m) {
			if(m.search(/^PY\s+-\s+\d{4}\b/m) === -1
				&& m.search(/^Y2\s+-\s+\d{4}\b/m) !== -1
			) {
				return m.replace(/^PY\s+-.*\r?\n/mg, '')
					.replace(/^Y2\s+-/mg, 'PY  -');
			}
			return m;
		});
	}

	//Certain authors sometimes have "role" prefixes
	text = text.replace(
		/^((?:A[U\d]|ED)\s+-\s+)Editor-in-Chief:\s+/mg, '$1');

	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
	translator.setString(text);
	translator.setHandler("itemDone", function(obj, item) {
		//issue sometimes is set to 0 for single issue volumes (?)
		if(item.issue == 0) delete item.issue;
		
		//add spaces after initials
		for(var i=0, n=item.creators.length; i<n; i++) {
			if(item.creators[i].firstName) {
				item.creators[i].firstName = item.creators[i].firstName.replace(/\.\s*(?=\S)/g, '. ');
			}
		}
		
		//abstract is not included with the new export form. Scrape from page
		if(!item.abstractNote) {
			item.abstractNote = getAbstract(doc);
		}
		
		item.attachments.push({
			title: "ScienceDirect Snapshot",
			document: doc
		});

		var pdfLink = getPDFLink(doc);
		if(pdfLink) item.attachments.push({
			title: 'ScienceDirect Full Text PDF',
			url: pdfLink,
			mimeType: 'application/pdf'
		});
		
		//attach supplementary data
		if(Z.getHiddenPref && Z.getHiddenPref("attachSupplementary")) {
			try {	//don't fail if we can't attach supplementary data
				attachSupplementary(doc, item);
			} catch(e) {
				Z.debug("Error attaching supplementary information.")
				Z.debug(e);
			}
		}

		if(item.notes[0]) {
			item.abstractNote = item.notes[0].note;
			item.notes = new Array();
		}
		if(item.abstractNote) {
			item.abstractNote = item.abstractNote.replace(/^\s*(?:abstract|publisher\s+summary)\s+/i, '');
		}
		
		item.DOI = item.DOI.replace(/^doi:\s+/i, '');
		item.complete();
	});
	translator.translate();
}

function scrapeByISBN(doc) {
	Z.debug("ScienceDirect: Scraping by ISBN");
	var isbn = getISBN(doc);
	var translator = Zotero.loadTranslator("search");
	translator.setTranslator("c73a4a8c-3ef1-4ec8-8229-7531ee384cc4");
	translator.setSearch({ISBN: isbn});
	translator.translate();
}

function getArticleList(doc) {
	return ZU.xpath(doc,
		'(//table[@class="resultRow"]/tbody/tr/td[2]/a\
			|//table[@class="resultRow"]/tbody/tr/td[2]/h3/a\
			|//td[@class="nonSerialResultsList"]/h3/a\
			|//div[@id="bodyMainResults"]//li[contains(@class,"title")]//a\
		)\[not(contains(text(),"PDF (") or contains(text(), "Related Articles"))]');
}

function doWeb(doc, url) {
	if(detectWeb(doc, url) == "multiple") {
		//search page
		var itemList = getArticleList(doc);
		var items = {};
		for(var i=0, n=itemList.length; i<n; i++) {
			items[itemList[i].href] = itemList[i].textContent;
		}

		Zotero.selectItems(items, function(selectedItems) {
			if(!selectedItems) return true;

			var articles = [];
			for (var i in selectedItems) {
				//articles.push(i);
				ZU.processDocuments(i, scrape);	//move this out of the loop when ZU.processDocuments is fixed
			}
		});
	} else {
		scrape(doc);
	}
}

function scrape(doc) {
	if(getExportFormAction(doc)) {
		scrapeByDirectExport(doc);
	} else if(getExportLink(doc)) {
		//we might no longer be hitting this case
		scrapeByExport(doc);
	} else if(getISBN(doc)) {
		scrapeByISBN(doc);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.sciencedirect.com/science/article/pii/S0896627311004430#bib5",
		"defer": true,
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Schaaf",
						"firstName": "Christian P.",
						"creatorType": "author"
					},
					{
						"lastName": "Zoghbi",
						"firstName": "Huda Y.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					},
					{
						"title": "ScienceDirect Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Solving the Autism Puzzle a Few Pieces at a Time",
				"journalAbbreviation": "Neuron",
				"volume": "70",
				"issue": "5",
				"pages": "806-808",
				"ISSN": "0896-6273",
				"DOI": "10.1016/j.neuron.2011.05.025",
				"url": "http://www.sciencedirect.com/science/article/pii/S0896627311004430",
				"abstractNote": "In this issue, a pair of studies (Levy et al. and Sanders et al.) identify several de novo copy-number variants that together account for 5%–8% of cases of simplex autism spectrum disorders. These studies suggest that several hundreds of loci are likely to contribute to the complex genetic heterogeneity of this group of disorders. An accompanying study in this issue (Gilman et al.), presents network analysis implicating these CNVs in neural processes related to synapse development, axon targeting, and neuron motility.",
				"date": "June 9, 2011",
				"publicationTitle": "Neuron",
				"libraryCatalog": "ScienceDirect",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sciencedirect.com/science/article/pii/S016748890800116X",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Pereira",
						"firstName": "C.",
						"creatorType": "author"
					},
					{
						"lastName": "Silva",
						"firstName": "R. D.",
						"creatorType": "author"
					},
					{
						"lastName": "Saraiva",
						"firstName": "L.",
						"creatorType": "author"
					},
					{
						"lastName": "Johansson",
						"firstName": "B.",
						"creatorType": "author"
					},
					{
						"lastName": "Sousa",
						"firstName": "M. J.",
						"creatorType": "author"
					},
					{
						"lastName": "Côrte-Real",
						"firstName": "M.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Apoptotic regulators",
					"Bcl-2 family",
					"Mitochondrial fragmentation",
					"Mitochondrial outer membrane permeabilization",
					"Permeability transition pore",
					"Yeast apoptosis"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					},
					{
						"title": "ScienceDirect Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"journalAbbreviation": "Biochimica et Biophysica Acta (BBA) - Molecular Cell Research",
				"issue": "7",
				"series": "Apoptosis in yeast",
				"ISSN": "0167-4889",
				"DOI": "10.1016/j.bbamcr.2008.03.010",
				"url": "http://www.sciencedirect.com/science/article/pii/S016748890800116X",
				"abstractNote": "Mitochondrial involvement in yeast apoptosis is probably the most unifying feature in the field. Reports proposing a role for mitochondria in yeast apoptosis present evidence ranging from the simple observation of ROS accumulation in the cell to the identification of mitochondrial proteins mediating cell death. Although yeast is unarguably a simple model it reveals an elaborate regulation of the death process involving distinct proteins and most likely different pathways, depending on the insult, growth conditions and cell metabolism. This complexity may be due to the interplay between the death pathways and the major signalling routes in the cell, contributing to a whole integrated response. The elucidation of these pathways in yeast has been a valuable help in understanding the intricate mechanisms of cell death in higher eukaryotes, and of severe human diseases associated with mitochondria-dependent apoptosis. In addition, the absence of obvious orthologues of mammalian apoptotic regulators, namely of the Bcl-2 family, favours the use of yeast to assess the function of such proteins. In conclusion, yeast with its distinctive ability to survive without respiration-competent mitochondria is a powerful model to study the involvement of mitochondria and mitochondria interacting proteins in cell death.",
				"libraryCatalog": "ScienceDirect",
				"title": "Mitochondria-dependent apoptosis in yeast",
				"volume": "1783",
				"pages": "1286-1302",
				"date": "July 2008",
				"publicationTitle": "Biochimica et Biophysica Acta (BBA) - Molecular Cell Research"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sciencedirect.com/science/book/9780123694683",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.sciencedirect.com/science/article/pii/B9780123694683500083",
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"lastName": "Raabe",
						"firstName": "Dierk",
						"creatorType": "author"
					},
					{
						"lastName": "Janssens",
						"firstName": "Koenraad G. F.",
						"creatorType": "editor"
					},
					{
						"lastName": "Raabe",
						"firstName": "Dierk",
						"creatorType": "editor"
					},
					{
						"lastName": "Kozeschnik",
						"firstName": "Ernst",
						"creatorType": "editor"
					},
					{
						"lastName": "Miodownik",
						"firstName": "Mark A.",
						"creatorType": "editor"
					},
					{
						"lastName": "Nestler",
						"firstName": "Britta",
						"creatorType": "editor"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					},
					{
						"title": "ScienceDirect Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "8 - Introduction to discrete dislocation statics and dynamics",
				"bookTitle": "Computational Materials Engineering",
				"publisher": "Academic Press",
				"place": "Burlington",
				"pages": "267-316",
				"ISBN": "978-0-12-369468-3",
				"url": "http://www.sciencedirect.com/science/article/pii/B9780123694683500083",
				"abstractNote": "This chapter provides an introduction to discrete dislocation statics and dynamics. The chapter deals with the simulation of plasticity of metals at the microscopic and mesoscopic scale using space- and time-discretized dislocation statics and dynamics. The complexity of discrete dislocation models is due to the fact that the mechanical interaction of ensembles of such defects is of an elastic nature and, therefore, involves long-range interactions. Space-discretized dislocation simulations idealize dislocations outside the dislocation cores as linear defects that are embedded within an otherwise homogeneous, isotropic or anisotropic, linear elastic medium. The aim of the chapter is to concentrate on those simulations that are discrete in both space and time. It explicitly incorporates the properties of individual lattice defects in a continuum formulation. The theoretical framework of linear continuum elasticity theory is overviewed as required for the formulation of basic dislocation mechanics. The chapter also discusses the dislocation statics, where the fundamentals of linear isotropic and anisotropic elasticity theory that are required in dislocation theory are reviewed. The chapter describes the dislocation dynamics, where it is concerned with the introduction of continuum dislocation dynamics. The last two sections deal with kinematics of discrete dislocation dynamics and dislocation reactions and annihilation.",
				"date": "2007",
				"libraryCatalog": "ScienceDirect"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sciencedirect.com/science/article/pii/B9780123706263000508",
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"lastName": "Meybeck",
						"firstName": "M.",
						"creatorType": "author"
					},
					{
						"lastName": "Likens",
						"firstName": "Gene E.",
						"creatorType": "editor"
					}
				],
				"notes": [],
				"tags": [
					"Africa",
					"Damming",
					"Endorheism",
					"Human impacts",
					"River quality",
					"River regimes",
					"Sediment fluxes",
					"Tropical rivers"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					},
					{
						"title": "ScienceDirect Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Africa",
				"bookTitle": "Encyclopedia of Inland Waters",
				"publisher": "Academic Press",
				"place": "Oxford",
				"pages": "295-305",
				"ISBN": "978-0-12-370626-3",
				"url": "http://www.sciencedirect.com/science/article/pii/B9780123706263000508",
				"abstractNote": "The African continent (30.1 million km2) extends from 37°17′N to 34°52 S and covers a great variety of climates except the polar climate. Although Africa is often associated to extended arid areas as the Sahara (7 million km2) and Kalahari (0.9 million km2), it is also characterized by a humid belt in its equatorial part and by few very wet regions as in Cameroon and in Sierra Leone. Some of the largest river basins are found in this continent such as the Congo, also termed Zaire, Nile, Zambezi, Orange, and Niger basins. Common features of Africa river basins are (i) warm temperatures, (ii) general smooth relief due to the absence of recent mountain ranges, except in North Africa and in the Rift Valley, (iii) predominance of old shields and metamorphic rocks with very developed soil cover, and (iv) moderate human impacts on river systems except for the recent spread of river damming. African rivers are characterized by very similar hydrochemical and physical features (ionic contents, suspended particulate matter, or SPM) but differ greatly by their hydrological regimes, which are more developed in this article.",
				"date": "2009",
				"libraryCatalog": "ScienceDirect"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sciencedirect.com/science/article/pii/S0006349512000835",
		"defer": true,
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Voltz",
						"firstName": "Karine",
						"creatorType": "author"
					},
					{
						"lastName": "Trylska",
						"firstName": "Joanna",
						"creatorType": "author"
					},
					{
						"lastName": "Calimet",
						"firstName": "Nicolas",
						"creatorType": "author"
					},
					{
						"lastName": "Smith",
						"firstName": "Jeremy C.",
						"creatorType": "author"
					},
					{
						"lastName": "Langowski",
						"firstName": "Jörg",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					},
					{
						"title": "ScienceDirect Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Unwrapping of Nucleosomal DNA Ends: A Multiscale Molecular Dynamics Study",
				"journalAbbreviation": "Biophysical Journal",
				"volume": "102",
				"issue": "4",
				"pages": "849-858",
				"ISSN": "0006-3495",
				"DOI": "10.1016/j.bpj.2011.11.4028",
				"url": "http://www.sciencedirect.com/science/article/pii/S0006349512000835",
				"abstractNote": "To permit access to DNA-binding proteins involved in the control and expression of the genome, the nucleosome undergoes structural remodeling including unwrapping of nucleosomal DNA segments from the nucleosome core. Here we examine the mechanism of DNA dissociation from the nucleosome using microsecond timescale coarse-grained molecular dynamics simulations. The simulations exhibit short-lived, reversible DNA detachments from the nucleosome and long-lived DNA detachments not reversible on the timescale of the simulation. During the short-lived DNA detachments, 9 bp dissociate at one extremity of the nucleosome core and the H3 tail occupies the space freed by the detached DNA. The long-lived DNA detachments are characterized by structural rearrangements of the H3 tail including the formation of a turn-like structure at the base of the tail that sterically impedes the rewrapping of DNA on the nucleosome surface. Removal of the H3 tails causes the long-lived detachments to disappear. The physical consistency of the CG long-lived open state was verified by mapping a CG structure representative of this state back to atomic resolution and performing molecular dynamics as well as by comparing conformation-dependent free energies. Our results suggest that the H3 tail may stabilize the nucleosome in the open state during the initial stages of the nucleosome remodeling process.",
				"date": "February 22, 2012",
				"publicationTitle": "Biophysical Journal",
				"libraryCatalog": "ScienceDirect",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Unwrapping of Nucleosomal DNA Ends"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sciencedirect.com/science/article/pii/S014067361362228X",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Glasziou",
						"firstName": "Paul",
						"creatorType": "author"
					},
					{
						"lastName": "Altman",
						"firstName": "Douglas G",
						"creatorType": "author"
					},
					{
						"lastName": "Bossuyt",
						"firstName": "Patrick",
						"creatorType": "author"
					},
					{
						"lastName": "Boutron",
						"firstName": "Isabelle",
						"creatorType": "author"
					},
					{
						"lastName": "Clarke",
						"firstName": "Mike",
						"creatorType": "author"
					},
					{
						"lastName": "Julious",
						"firstName": "Steven",
						"creatorType": "author"
					},
					{
						"lastName": "Michie",
						"firstName": "Susan",
						"creatorType": "author"
					},
					{
						"lastName": "Moher",
						"firstName": "David",
						"creatorType": "author"
					},
					{
						"lastName": "Wager",
						"firstName": "Elizabeth",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ScienceDirect Snapshot"
					},
					{
						"title": "ScienceDirect Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"journalAbbreviation": "The Lancet",
				"issue": "9913",
				"ISSN": "0140-6736",
				"DOI": "10.1016/S0140-6736(13)62228-X",
				"url": "http://www.sciencedirect.com/science/article/pii/S014067361362228X",
				"abstractNote": "Summary\nResearch publication can both communicate and miscommunicate. Unless research is adequately reported, the time and resources invested in the conduct of research is wasted. Reporting guidelines such as CONSORT, STARD, PRISMA, and ARRIVE aim to improve the quality of research reports, but all are much less adopted and adhered to than they should be. Adequate reports of research should clearly describe which questions were addressed and why, what was done, what was shown, and what the findings mean. However, substantial failures occur in each of these elements. For example, studies of published trial reports showed that the poor description of interventions meant that 40–89% were non-replicable; comparisons of protocols with publications showed that most studies had at least one primary outcome changed, introduced, or omitted; and investigators of new trials rarely set their findings in the context of a systematic review, and cited a very small and biased selection of previous relevant trials. Although best documented in reports of controlled trials, inadequate reporting occurs in all types of studies—animal and other preclinical studies, diagnostic studies, epidemiological studies, clinical prediction research, surveys, and qualitative studies. In this report, and in the Series more generally, we point to a waste at all stages in medical research. Although a more nuanced understanding of the complex systems involved in the conduct, writing, and publication of research is desirable, some immediate action can be taken to improve the reporting of research. Evidence for some recommendations is clear: change the current system of research rewards and regulations to encourage better and more complete reporting, and fund the development and maintenance of infrastructure to support better reporting, linkage, and archiving of all elements of research. However, the high amount of waste also warrants future investment in the monitoring of and research into reporting of research, and active implementation of the findings to ensure that research reports better address the needs of the range of research users.",
				"libraryCatalog": "ScienceDirect",
				"title": "Reducing waste from incomplete or unusable reports of biomedical research",
				"volume": "383",
				"pages": "267-276",
				"date": "January 24, 2014",
				"publicationTitle": "The Lancet"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sciencedirect.com/science?_ob=ArticleListURL&_method=list&_ArticleListID=-590513498&_sort=r&_st=13&view=c&md5=a918945fc4b0c6f407679abcc6f8f493&searchtype=a",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.sciencedirect.com/science/journal/22126716",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.sciencedirect.com/science/handbooks/18745709",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.sciencedirect.com/science/referenceworks/9780080437484",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.sciencedirect.com/science/bookseries/00652458",
		"items": "multiple"
	}
]
/** END TEST CASES **/