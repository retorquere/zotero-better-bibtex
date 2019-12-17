{
	"translatorID": "938ebe32-2b2e-4349-a5b3-b3a05d3de627",
	"label": "ACS Publications",
	"creator": "Sean Takats, Michael Berkowitz, Santawort, and Aurimas Vinckevicius",
	"target": "^https?://pubs\\.acs\\.org/(toc/|journal/|topic/|isbn/\\d|doi/(full/|abs/)?10\\.|action/doSearch\\?)",
	"minVersion": "4.0.5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-10-07 09:04:25"
}


function getSearchResults(doc, checkOnly, itemOpts) {
	var items = {}, found = false;
	var rows = doc.querySelectorAll('.issue-item_title a, .teaser_title a');
	for (let i = 0; i < rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		var doi = getDoi(href);
		if (!href || !title || !doi) continue;
		if (checkOnly) return true;
		found = true;
		items[doi] = title;
		
		// Not sure if this is still working on the new websites...
		itemOpts[doi] = {};

		/*
		//check if article contains supporting info,
		//so we don't have to waste an HTTP request later if it doesn't
		var articleBox = titles[i].parentNode.parentNode;
		if (!articleBox.classList.contains('articleBox')) {
			// e.g. Most Recently Published under Subject Search
			continue;
		}
		
		if (ZU.xpath(articleBox, './/a[text()="Supporting Info"]').length) {
			itemOpts[doi].hasSupp = true;
		}
		*/
	}
	
	return found ? items : false;
}

function getDoi(url) {
	var m = url.match(/https?:\/\/[^/]*\/doi\/(?:abs\/|full\/)?(10\.[^?#]+)/);
	if (m) {
		var doi = m[1];
		if (doi.includes("prevSearch")) {
			doi = doi.substring(0, doi.indexOf("?"));
		}
		return decodeURIComponent(doi);
	}
	return false;
}

/** ***************************
 * BEGIN: Supplementary data *
 *****************************/
// Get supplementary file names either from the Supporting Info page or the tooltip
function getSuppFiles(div) {
	var fileNames = ZU.xpath(div, './/li//li');
	var attach = [];
	for (var i = 0, n = fileNames.length; i < n; i++) {
		attach.push(fileNames[i].textContent.trim().replace(/\s[\s\S]+/, ''));
	}
	return attach;
}

var suppTypeMap = {
	pdf: 'application/pdf',
	doc: 'application/msword',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	xls: 'application/vnd.ms-excel',
	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

function getSuppMimeType(fileName) {
	var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
	var mimeType = suppTypeMap[ext];
	return mimeType ? mimeType : undefined;
}

function attachSupp(item, doi, opts) {
	if (!opts.attach) return;
	if (!item.attachments) item.attachments = [];
	var attachment;
	for (var i = 0, n = opts.attach.length; i < n; i++) {
		attachment = {
			title: opts.attach[i]
		};
		attachment.url = '/doi/suppl/' + doi + '/suppl_file/' + attachment.title;
		attachment.mimeType = getSuppMimeType(attachment.title);
		if (opts.attachAsLink || !attachment.mimeType) { // don't download unknown file types
			attachment.snapshot = false;
		}
		
		item.attachments.push(attachment);
	}
}

/** *************************
 * END: Supplementary data *
 ***************************/

function detectWeb(doc, url) {
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
	else if (getDoi(url)) {
		var type = doc.getElementsByClassName("content-navigation__contentType");
		if (type.length && type[0].textContent.includes("Chapter")) {
			return "bookSection";
		}
		else {
			return "journalArticle";
		}
	}
	return false;
}

function doWeb(doc, url) {
	var opts = {};
	// reduce some overhead by fetching these only once
	if (Z.getHiddenPref) {
		opts.attachSupp = Z.getHiddenPref("attachSupplementary");
		opts.attachAsLink = Z.getHiddenPref("supplementaryAsLink");
	}
	
	var itemOpts = {};
	if (detectWeb(doc, url) == "multiple") { // search
		Zotero.selectItems(getSearchResults(doc, false, itemOpts), function (items) {
			if (!items) {
				return;
			}
			
			var dois = [];
			for (let i in items) {
				itemOpts[i].pdf = '/doi/pdf/' + i;
				dois.push({ doi: i, opts: itemOpts[i] });
			}
			
			scrape(dois, opts);
		});
	}
	else { // single article
		var doi = getDoi(url);
		Zotero.debug("DOI= " + doi);
		// we can determine file names from the tooltip, which saves us an HTTP request
		var suppTip = doc.getElementById('suppTipDiv');
		if (opts.attachSupp && suppTip) {
			try {
				opts.attach = getSuppFiles(suppTip, opts);
			}
			catch (e) {
				Z.debug("Error getting supplementary files.");
				Z.debug(e);
			}
		}
		
		// if we couldn't find this on the individual item page,
		// then it doesn't have supp info anyway. This way we know not to check later
		if (!opts.attach) opts.attach = [];
		
		itemOpts.pdf = ZU.xpathText(doc, '(//a[i[contains(@class, "icon-file-pdf-o")]]/@href)[1]') || '/doi/pdf/' + doi;
		
		scrape([{ doi: doi, opts: itemOpts }], opts);
	}
}

function scrape(items, opts) {
	for (var i = 0, n = items.length; i < n; i++) {
		processCallback(items[i], opts);
	}
}

function processCallback(fetchItem, opts) {
	var baseurl = "/action/downloadCitation";
	var doi = fetchItem.doi;
	var post = "https//pubs.acs.org/action/downloadCitation?direct=true&doi=" + encodeURIComponent(fetchItem.doi) + "&format=ris&include=abs&submit=Download+Citation";
	ZU.doPost(baseurl, post, function (text) {
		// Fix the RIS doi mapping
		text = text.replace("\nN1  - doi:", "\nDO  - ");
		// Fix the wrong mapping for journal abbreviations
		text = text.replace("\nJO  -", "\nJ2  -");
		// Use publication date when available
		if (text.includes("\nDA  -")) {
			text = text.replace(/\nY1 {2}- [^\n]*/, "")
					.replace("\nDA  -", "\nY1  -");
		}
		// Zotero.debug("ris= "+ text);
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			if (item.date) {
				item.date = ZU.strToISO(item.date);
			}
			item.attachments = [];

			// standard pdf and snapshot
			if (fetchItem.opts.pdf) {
				item.attachments.push({
					title: "Full Text PDF",
					url: fetchItem.opts.pdf,
					mimeType: "application/pdf"
				});
			}
			item.attachments.push({
				title: "ACS Full Text Snapshot",
				url: '/doi/full/' + doi,
				mimeType: "text/html"
			});
				
			// supplementary data
			try {
				if (opts.attachSupp && opts.attach) {
					// came from individual item page
					attachSupp(item, doi, opts);
				}
				else if (opts.attachSupp && fetchItem.opts.hasSupp) {
					// was a search result and has supp info
					var suppUrl = '/doi/suppl/' + doi;
						
					if (opts.attachAsLink) {
						// if we're only attaching links, it's not worth linking to each doc
						item.attachments.push({
							title: "Supporting Information",
							url: suppUrl,
							mimeType: 'text/html',
							snapshot: false
						});
					}
					else {
						ZU.processDocuments(suppUrl, function (suppDoc) {
							try {
								var div = suppDoc.getElementById('supInfoBox');
								if (div) {
									var files = getSuppFiles(div);
									attachSupp(item, doi, {
										attach: files,
										attachAsLink: opts.attachAsLink
									});
								}
								else {
									Z.debug("Div not found");
									item.attachments.push({
										title: "Supporting Information",
										url: suppUrl,
										mimeType: 'text/html',
										snapshot: false
									});
								}
							}
							catch (e) {
								Z.debug("Error attaching supplementary files.");
								Z.debug(e);
							}
							item.complete();
						}, null, function () {
							item.complete();
						});
						return; // don't call item.complete() yet
					}
				}
			}
			catch (e) {
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
		"url": "https://pubs.acs.org/doi/10.1021/es103607c",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Life Cycle Environmental Assessment of Lithium-Ion and Nickel Metal Hydride Batteries for Plug-In Hybrid and Battery Electric Vehicles",
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
				"date": "2011-05-15",
				"DOI": "10.1021/es103607c",
				"ISSN": "0013-936X",
				"abstractNote": "This study presents the life cycle assessment (LCA) of three batteries for plug-in hybrid and full performance battery electric vehicles. A transparent life cycle inventory (LCI) was compiled in a component-wise manner for nickel metal hydride (NiMH), nickel cobalt manganese lithium-ion (NCM), and iron phosphate lithium-ion (LFP) batteries. The battery systems were investigated with a functional unit based on energy storage, and environmental impacts were analyzed using midpoint indicators. On a per-storage basis, the NiMH technology was found to have the highest environmental impact, followed by NCM and then LFP, for all categories considered except ozone depletion potential. We found higher life cycle global warming emissions than have been previously reported. Detailed contribution and structural path analyses allowed for the identification of the different processes and value-chains most directly responsible for these emissions. This article contributes a public and detailed inventory, which can be easily be adapted to any powertrain, along with readily usable environmental performance assessments.",
				"issue": "10",
				"journalAbbreviation": "Environ. Sci. Technol.",
				"libraryCatalog": "ACS Publications",
				"pages": "4548-4554",
				"publicationTitle": "Environmental Science & Technology",
				"url": "https://doi.org/10.1021/es103607c",
				"volume": "45",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "ACS Full Text Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://pubs.acs.org/toc/nalefd/12/6",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://pubs.acs.org/doi/abs/10.1021/bk-2011-1071.ch005",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Redox Chemistry and Natural Organic Matter (NOM): Geochemists’ Dream, Analytical Chemists’ Nightmare",
				"creators": [
					{
						"lastName": "Macalady",
						"firstName": "Donald L.",
						"creatorType": "author"
					},
					{
						"lastName": "Walton-Day",
						"firstName": "Katherine",
						"creatorType": "author"
					}
				],
				"date": "2011-01-01",
				"ISBN": "9780841226524",
				"abstractNote": "Natural organic matter (NOM) is an inherently complex mixture of polyfunctional organic molecules. Because of their universality and chemical reversibility, oxidation/reductions (redox) reactions of NOM have an especially interesting and important role in geochemistry. Variabilities in NOM composition and chemistry make studies of its redox chemistry particularly challenging, and details of NOM-mediated redox reactions are only partially understood. This is in large part due to the analytical difficulties associated with NOM characterization and the wide range of reagents and experimental systems used to study NOM redox reactions. This chapter provides a summary of the ongoing efforts to provide a coherent comprehension of aqueous redox chemistry involving NOM and of techniques for chemical characterization of NOM. It also describes some attempts to confirm the roles of different structural moieties in redox reactions. In addition, we discuss some of the operational parameters used to describe NOM redox capacities and redox states, and describe nomenclature of NOM redox chemistry. Several relatively facile experimental methods applicable to predictions of the NOM redox activity and redox states of NOM samples are discussed, with special attention to the proposed use of fluorescence spectroscopy to predict relevant redox characteristics of NOM samples.",
				"bookTitle": "Aquatic Redox Chemistry",
				"extra": "DOI: 10.1021/bk-2011-1071.ch005",
				"libraryCatalog": "ACS Publications",
				"numberOfVolumes": "0",
				"pages": "85-111",
				"publisher": "American Chemical Society",
				"series": "ACS Symposium Series",
				"seriesNumber": "1071",
				"shortTitle": "Redox Chemistry and Natural Organic Matter (NOM)",
				"url": "https://doi.org/10.1021/bk-2011-1071.ch005",
				"volume": "1071",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "ACS Full Text Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://pubs.acs.org/doi/abs/10.1021/jp000606%2B",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Theory of Charge Transport in Polypeptides",
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
				"date": "2000-08-01",
				"DOI": "10.1021/jp000606+",
				"ISSN": "1520-6106",
				"abstractNote": "We have derived phase space and diffusion theories for a new hopping model of charge transport in polypeptides and thence for distal chemical kinetics. The charge is transferred between two carbamide groups on each side of the Cα atom hinging two amino acid groups. When the torsional angles on the hinge approach a certain region of the Ramachandran plot, the charge transfer has zero barrier height and makes charge transfer the result of strong electronic correlation. The mean first passage time calculated from this analytic model of some 164 fs is in reasonable agreement with prior molecular dynamics calculation of some 140 fs and supports this new bifunctional model for charge transport and chemical reactions in polypeptides.",
				"issue": "32",
				"journalAbbreviation": "J. Phys. Chem. B",
				"libraryCatalog": "ACS Publications",
				"pages": "7790-7794",
				"publicationTitle": "The Journal of Physical Chemistry B",
				"url": "https://doi.org/10.1021/jp000606+",
				"volume": "104",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "ACS Full Text Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://pubs.acs.org/isbn/9780841239999",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://pubs.acs.org/journal/acbcct",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://pubs.acs.org/action/doSearch?text1=zotero&field1=AllField",
		"items": "multiple"
	}
]
/** END TEST CASES **/
