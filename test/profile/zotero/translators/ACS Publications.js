{
	"translatorID": "938ebe32-2b2e-4349-a5b3-b3a05d3de627",
	"label": "ACS Publications",
	"creator": "Sean Takats, Michael Berkowitz, Santawort, and Aurimas Vinckevicius",
	"target": "^https?://[^/]*pubs3?\\.acs\\.org[^/]*/(?:wls/journals/query/(?:subscriberResults|query)\\.html|acs/journals/toc\\.page|cgi-bin/(?:article|abstract|sample|asap)\\.cgi)?",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-06-01 17:29:05"
}

function getSearchResults(doc) {
	return ZU.xpath(doc, '//div[@class="articleBox" or @class="articleBox "]');
}

function getDoi(url) {
	var m = url.match(/https?:\/\/[^\/]*\/doi\/(?:abs|full)\/([^\?#]+)/);
	if(m) {
		var doi = m[1];
		if(doi.indexOf("prevSearch") != -1) {
			doi = doi.substring(0,doi.indexOf("?"));
		}
		return decodeURIComponent(doi);
	}
}

/*****************************
 * BEGIN: Supplementary data *
 *****************************/
 //Get supplementary file names either from the Supporting Info page or the tooltip
function getSuppFiles(div) {
	var fileNames = ZU.xpath(div, './/li//li');
	var attach = [];
	for(var i=0, n=fileNames.length; i<n; i++) {
		attach.push(fileNames[i].textContent.trim().replace(/\s[\s\S]+/, ''));
	}
	return attach;
}

var suppTypeMap = {
	'pdf': 'application/pdf',
	'doc': 'application/msword',
	'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'xls': 'application/vnd.ms-excel',
	'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};
function getSuppMimeType(fileName) {
	var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
	var mimeType = suppTypeMap[ext];
	return mimeType ? mimeType : undefined;
}

function attachSupp(item, doi, opts) {
	if(!opts.attach) return;
	if(!item.attachments) item.attachments = [];
	var attachment;
	for(var i=0, n=opts.attach.length; i<n; i++) {
		attachment = {
			title: opts.attach[i]
		};
		attachment.url = opts.host + 'doi/suppl/'
			+ doi + '/suppl_file/' + attachment.title;	
		attachment.mimeType = getSuppMimeType(attachment.title);
		if(opts.attachAsLink || !attachment.mimeType) { //don't download unknown file types
			attachment.snapshot = false;
		}
		
		item.attachments.push(attachment);
	}
}

/***************************
 * END: Supplementary data *
 ***************************/

function detectWeb(doc, url) {
	if(doc.getElementById('articleListHeader_selectAllToc')
		&& getSearchResults(doc).length) {
		return "multiple";
	} else if(getDoi(url)) {
		var h2 = ZU.xpathText(doc, '//div[@id="articleHead"]/h2');
		if(h2 && h2.indexOf("Chapter") !=-1) {
			return "bookSection";
		} else {
			return "journalArticle";
		}
	}
}

function doWeb(doc, url){
	var opts = {
		host: 'http://' + doc.location.host + "/"
	};
	//reduce some overhead by fetching these only once
	if(Z.getHiddenPref) {
		opts.attachSupp = Z.getHiddenPref("attachSupplementary");
		opts.attachAsLink = Z.getHiddenPref("supplementaryAsLink");
		var highResPDF = Z.getHiddenPref("ACS.highResPDF"); //attach high res PDF?
		if(highResPDF) {
			opts.highResPDF = true;
			opts.removePdfPlus = highResPDF === 1; //it can also be 2, which would mean attach both versions
		}
	}
	
	if(detectWeb(doc, url) == "multiple") { //search
		var a, doi, title, items = {}, supp, hasSupp = {};
		var elmts = getSearchResults(doc);
		for(var i=0, n=elmts.length; i<n; i++){
			a = ZU.xpath(elmts[i], '(.//div[@class="titleAndAuthor"]/h2/a)[1]')[0];
			title = a.textContent;
			doi = getDoi(a.href);
			items[doi] = title;
			
			//check if article contains supporting info,
			//so we don't have to waste an HTTP request later if it doesn't
			supp = doc.evaluate('.//a[text()="Supporting Info"]', elmts[i],
				null, XPathResult.ANY_TYPE, null).iterateNext();
			if(supp) {
				hasSupp[doi] = true;
			}
		}
		
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			
			var dois = [];
			for (var i in items) {
				dois.push({doi: i, hasSupp: !!hasSupp[i]});
			}
			
			scrape(dois, opts);
		});
	} else { //single article
		var doi = getDoi(url);
		Zotero.debug("DOI= "+doi);
		//we can determine file names from the tooltip, which saves us an HTTP request
		var suppTip = doc.getElementById('suppTipDiv');
		if(opts.attachSupp && suppTip) {
			try {
				opts.attach = getSuppFiles(suppTip, opts);
			} catch(e) {
				Z.debug("Error getting supplementary files.");
				Z.debug(e);
			}
		}
		
		//if we couldn't find this on the individual item page,
		//then it doesn't have supp info anyway. This way we know not to check later
		if(!opts.attach) opts.attach = [];
		
		scrape([{doi: doi}], opts);
	}
}

function scrape(items, opts){
	//get citation export page's source code;
	for(var i=0, n=items.length; i<n; i++) {
		(function(item) {
			var url = opts.host + 'action/showCitFormats?doi=' + encodeURIComponent(item.doi);
			//Z.debug(url);
			ZU.doGet(url, function(text){
				//Z.debug(text)
				//get the exported RIS file name;
				var downloadFileName = text.match(
					/name=\"downloadFileName\" value=\"([A-Za-z0-9_\-\.]+)\"/)[1];
				Zotero.debug("downloadfilename= "+downloadFileName);
				processCallback(item, opts, downloadFileName);
			});
		})(items[i]);
	}
}

function processCallback(fetchItem, opts, downloadFileName) {
		var baseurl = "http://pubs.acs.org/action/downloadCitation";
		var doi = fetchItem.doi;
		var post = "doi=" + encodeURIComponent(doi) + "&downloadFileName=" + encodeURIComponent(downloadFileName)
			+ "&include=abs&format=refman&direct=on"
			+ "&submit=Download+article+citation+data";
		ZU.doPost(baseurl, post, function(text){
			// Fix the RIS doi mapping
			text = text.replace("\nN1  - doi:", "\nDO  - ");
			// Fix the wrong mapping for journal abbreviations
			text = text.replace("\nJO  -", "\nJ2  -");
			// Use publication date when available
			if(text.indexOf("\nDA  -") !== -1) {
				text = text.replace(/\nY1  - [^\n]*/, "")
					.replace("\nDA  -", "\nY1  -");
			}
			//Zotero.debug("ris= "+ text);
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
			translator.setString(text);
			translator.setHandler("itemDone", function(obj, item) {
				item.attachments = [];
				
				if(!opts.removePdfPlus) {
					item.attachments.push({
						title: "ACS Full Text PDF w/ Links",
						url: opts.host + 'doi/pdfplus/' + doi,
						mimeType:"application/pdf"
					});
				}
				
				if(opts.highResPDF) {
					item.attachments.push({
						title: "ACS Full Text PDF",
						url: opts.host + 'doi/pdf/' + doi,
						mimeType:"application/pdf"
					});
				}
				
				item.attachments.push({
					title: "ACS Full Text Snapshot",
					url: opts.host + 'doi/full/' + doi,
					mimeType:"text/html"
				});
				
				//supplementary data
				try {
					if(opts.attachSupp && opts.attach) {
						//came from individual item page
						attachSupp(item, doi, opts);
					} else if(opts.attachSupp && fetchItem.hasSupp) {
						//was a search result and has supp info
						var suppUrl = opts.host + 'doi/suppl/' + doi;
						
						if(opts.attachAsLink) {
							//if we're only attaching links, it's not worth linking to each doc
							item.attachments.push({
								title: "Supporting Information",
								url: suppUrl,
								mimeType: 'text/html',
								snapshot: false
							});
						} else {
							ZU.processDocuments(suppUrl, function(suppDoc) {
								try {
									var div = suppDoc.getElementById('supInfoBox');
									if(div) {
										var files = getSuppFiles(div);
										attachSupp(item, doi, {
											host: opts.host,
											attach: files,
											attachAsLink: opts.attachAsLink
										});
									} else {
										Z.debug("Div not found");
										item.attachments.push({
											title: "Supporting Information",
											url: suppUrl,
											mimeType: 'text/html',
											snapshot: false
										});
									}
								} catch(e) {
									Z.debug("Error attaching supplementary files.");
									Z.debug(e);
								}
								item.complete();
							}, null, function() { item.complete() });
							return; //don't call item.complete() yet
						}
					}
				} catch(e) {
					Z.debug("Error attaching supplementary files.");
					Z.debug(e);
				}
				
				item.complete();
			});
			translator.translate();
		});
	}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://pubs.acs.org/doi/full/10.1021/es103607c",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Majeau-Bettez",
						"firstName": "Guillaume",
						"creatorType": "author"
					},
					{
						"lastName": "Hawkins",
						"firstName": "Troy R.",
						"creatorType": "author"
					},
					{
						"lastName": "Strømman",
						"firstName": "Anders Hammer",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ACS Full Text PDF w/ Links",
						"mimeType": "application/pdf"
					},
					{
						"title": "ACS Full Text Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Life Cycle Environmental Assessment of Lithium-Ion and Nickel Metal Hydride Batteries for Plug-In Hybrid and Battery Electric Vehicles",
				"date": "May 15, 2011",
				"DOI": "10.1021/es103607c",
				"publicationTitle": "Environmental Science & Technology",
				"journalAbbreviation": "Environ. Sci. Technol.",
				"pages": "4548-4554",
				"volume": "45",
				"issue": "10",
				"publisher": "American Chemical Society",
				"abstractNote": "This study presents the life cycle assessment (LCA) of three batteries for plug-in hybrid and full performance battery electric vehicles. A transparent life cycle inventory (LCI) was compiled in a component-wise manner for nickel metal hydride (NiMH), nickel cobalt manganese lithium-ion (NCM), and iron phosphate lithium-ion (LFP) batteries. The battery systems were investigated with a functional unit based on energy storage, and environmental impacts were analyzed using midpoint indicators. On a per-storage basis, the NiMH technology was found to have the highest environmental impact, followed by NCM and then LFP, for all categories considered except ozone depletion potential. We found higher life cycle global warming emissions than have been previously reported. Detailed contribution and structural path analyses allowed for the identification of the different processes and value-chains most directly responsible for these emissions. This article contributes a public and detailed inventory, which can be easily be adapted to any powertrain, along with readily usable environmental performance assessments.",
				"ISSN": "0013-936X",
				"url": "http://dx.doi.org/10.1021/es103607c",
				"libraryCatalog": "ACS Publications",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://pubs.acs.org/toc/nalefd/12/6",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://pubs.acs.org/doi/abs/10.1021/bk-2011-1071.ch005",
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"lastName": "Donald L. Macalady",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "Katherine Walton-Day",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ACS Full Text PDF w/ Links",
						"mimeType": "application/pdf"
					},
					{
						"title": "ACS Full Text Snapshot",
						"mimeType": "text/html"
					}
				],
				"date": "January 1, 2011",
				"volume": "1071",
				"numberOfVolumes": "0",
				"seriesNumber": "1071",
				"url": "http://dx.doi.org/10.1021/bk-2011-1071.ch005",
				"abstractNote": "Natural organic matter (NOM) is an inherently complex mixture of polyfunctional organic molecules. Because of their universality and chemical reversibility, oxidation/reductions (redox) reactions of NOM have an especially interesting and important role in geochemistry. Variabilities in NOM composition and chemistry make studies of its redox chemistry particularly challenging, and details of NOM-mediated redox reactions are only partially understood. This is in large part due to the analytical difficulties associated with NOM characterization and the wide range of reagents and experimental systems used to study NOM redox reactions. This chapter provides a summary of the ongoing efforts to provide a coherent comprehension of aqueous redox chemistry involving NOM and of techniques for chemical characterization of NOM. It also describes some attempts to confirm the roles of different structural moieties in redox reactions. In addition, we discuss some of the operational parameters used to describe NOM redox capacities and redox states, and describe nomenclature of NOM redox chemistry. Several relatively facile experimental methods applicable to predictions of the NOM redox activity and redox states of NOM samples are discussed, with special attention to the proposed use of fluorescence spectroscopy to predict relevant redox characteristics of NOM samples.",
				"pages": "85-111",
				"title": "Redox Chemistry and Natural Organic Matter (NOM): Geochemists? Dream, Analytical Chemists? Nightmare",
				"bookTitle": "Aquatic Redox Chemistry",
				"series": "ACS Symposium Series",
				"ISBN": "0-8412-2652-0",
				"publisher": "American Chemical Society",
				"libraryCatalog": "ACS Publications",
				"shortTitle": "Redox Chemistry and Natural Organic Matter (NOM)"
			}
		]
	},
	{
		"type": "web",
		"url": "http://pubs.acs.org/doi/abs/10.1021/jp000606%2B",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Schlag",
						"firstName": "E. W.",
						"creatorType": "author"
					},
					{
						"lastName": "Sheu",
						"firstName": "Sheh-Yi",
						"creatorType": "author"
					},
					{
						"lastName": "Yang",
						"firstName": "Dah-Yen",
						"creatorType": "author"
					},
					{
						"lastName": "Selzle",
						"firstName": "H. L.",
						"creatorType": "author"
					},
					{
						"lastName": "Lin",
						"firstName": "S. H.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ACS Full Text PDF w/ Links",
						"mimeType": "application/pdf"
					},
					{
						"title": "ACS Full Text Snapshot",
						"mimeType": "text/html"
					}
				],
				"DOI": "10.1021/jp000606+",
				"journalAbbreviation": "J. Phys. Chem. B",
				"issue": "32",
				"abstractNote": "We have derived phase space and diffusion theories for a new hopping model of charge transport in polypeptides and thence for distal chemical kinetics. The charge is transferred between two carbamide groups on each side of the Cα atom hinging two amino acid groups. When the torsional angles on the hinge approach a certain region of the Ramachandran plot, the charge transfer has zero barrier height and makes charge transfer the result of strong electronic correlation. The mean first passage time calculated from this analytic model of some 164 fs is in reasonable agreement with prior molecular dynamics calculation of some 140 fs and supports this new bifunctional model for charge transport and chemical reactions in polypeptides.",
				"ISSN": "1520-6106",
				"url": "http://dx.doi.org/10.1021/jp000606+",
				"libraryCatalog": "ACS Publications",
				"title": "Theory of Charge Transport in Polypeptides",
				"date": "August 1, 2000",
				"publicationTitle": "The Journal of Physical Chemistry B",
				"pages": "7790-7794",
				"volume": "104"
			}
		]
	}
]
/** END TEST CASES **/