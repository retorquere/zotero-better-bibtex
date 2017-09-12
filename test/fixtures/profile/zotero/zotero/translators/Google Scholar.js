{
	"translatorID": "57a00950-f0d1-4b41-b6ba-44ff0fc30289",
	"label": "Google Scholar",
	"creator": "Simon Kornblith, Frank Bennett, Aurimas Vinckevicius",
	"target": "^https?://scholar[-.]google[-.](com|cat|(com?[-.])?[a-z]{2})(\\.[^/]+)?/(scholar(_case)?\\?|citations\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-08-22 07:17:20"
}

/*
 * Test pages
 *
 * Searches of Google Scholar with the following terms should yield a folder
 * icon that works.  Check that unlinked ([CITATION]) items that provide
 * no BibTeX data (there is currently one under "Marbury v. Madison",
 * and "clifford" seems to be a good source of garbage) are
 * dropped from the listings:
 *
 *   marbury v madison
 *   kelo
 *   smith
 *   view of the cathedral
 *   clifford
 *
 * "How cited" pages should NOT yield a page or folder icon.  The
 * Urls to these currently look like this:
 *
 *   http://scholar.google.co.jp/scholar_case?about=1101424605047973909&q=kelo&hl=en&as_sdt=2002
 *
 * Case pages should present a document icon that works:
 *
 *   http://scholar.google.co.jp/scholar_case?case=18273389148555376997&hl=en&as_sdt=2002&kqfp=13204897074208725174&kql=186&kqpfp=16170611681001262513#kq
 */

var bogusItemID = 1;

var detectWeb = function (doc, url) {
	// Icon shows only for search results and law cases
	if (url.indexOf('/scholar_case?') != -1
		&& url.indexOf('about=') == -1
	) {
			return "case";
	} else if(url.indexOf('/citations?') != -1) {
		//individual saved citation
		var link = ZU.xpathText(doc, '//a[@class="gsc_title_link"]/@href');
		if(!link) return;
		
		if(link.indexOf('/patents?') != -1) {
			return 'patent';
		} else if(link.indexOf('/scholar_case?') != -1) {
			return 'case';
		} else {
			//Can't distinguish book from journalArticle
			//Both have "Journal" fields
			return 'journalArticle';
		}
	} else if( getViableResults(doc).length ) {
		return "multiple";
	}
}

/*****************************
 * Accessory functions *
 *****************************/

//determine item type from a result node
function determineType(result) {
	var titleHref =  ZU.xpathText(result, './/h3[@class="gs_rt"]/a[1]/@href');

	if(titleHref) {
		if(titleHref.indexOf('/scholar_case?') != -1) {
			return 'case';
		} else if(titleHref.indexOf('/patents?') != -1) {
			return 'patent';
		} else if(titleHref.indexOf('/books?') != -1) {
			return 'book';
		} else if(titleHref.indexOf('/citations?') == -1){
			//not a saved citation
			return 'journalArticle';
		}
	}

	/**if there is no link (i.e. [CITATION]), or we're looking at saved citations
	 * we can determine this by the second line.
	 * Patents have the word Patent here
	 * Cases seem to always start with a number
	 * Books just have year after last dash
	 * Articles are assumed to be everything else
	 * 
	 * This is probably not going to work with google scholar in other languages
	 */
	var subTitle = ZU.xpathText(result, './/div[@class="gs_a"]');
	if(!subTitle) return 'journalArticle';
	
	subTitle = subTitle.trim();

	if(subTitle.search(/\bpatent\s+\d/i) != -1) {
		return 'patent';
	}

	if(subTitle.search(/^\d/) != -1) {
		return 'case';
	}
	
	if(subTitle.search(/-\s*\d+$/) != -1) {
		return 'book';
	}

	return 'journalArticle';
}

function getAttachment(url, title) {
	//try to determine mimeType from title
	var m = title.match(/^\s*\[([^\]]+)\]/);
	if(!m) return;

	m = m[1].toUpperCase();
	var mimeType = getAttachment.mimeTypes[m];
	if(!mimeType) return;

	return {title: title, url: url, mimeType: mimeType};
}

getAttachment.mimeTypes = {
	'PDF': 'application/pdf',
	'DOC': 'application/msword',
	'HTML': 'text/html'
};

function getHTMLTitle(text) {
	var title = text.match(/<title>(.*?)<\/title>/i);
	if (title) return title[1];
	return false;
}

/*********************
 * Scraper functions *
 *********************/

function getViableResults(doc) {
	 return ZU.xpath(doc, '//div[@class="gs_r"]\
		[.//div[contains(@class, "gs_fl")]/a[@aria-controls="gs_cit" and contains(@onclick, "gs_ocit(")] \
			and .//h3[@class="gs_rt"]]');
}

// Imports BibTeX for journalArticle and book
function importArticleResult(doc, article, bibtex) {
	var translator = Zotero.loadTranslator('import');
	translator.setTranslator('9cb70025-a888-4a29-a210-93ec52da40d4');
	translator.setString(bibtex);

	translator.setHandler('itemDone', function(obj, item) {
		if(item.creators.length) {
			var lastCreatorIndex = item.creators.length-1,
				lastCreator = item.creators[lastCreatorIndex];
			if(lastCreator.lastName === "others" && lastCreator.firstName === "") {
				item.creators.splice(lastCreatorIndex, 1);
			}
		}
		
		//clean author names
		for(var j=0, m=item.creators.length; j<m; j++) {
			if(!item.creators[j].firstName) continue;

			item.creators[j] = ZU.cleanAuthor(
				item.creators[j].lastName + ', ' +
					item.creators[j].firstName,
				item.creators[j].creatorType,
				true);
		}

		//attach linked page as snapshot if available
		var snapshotUrl = ZU.xpath(article,
			'(.//h3[@class="gs_rt"]/a\
			|.//a[@class="gsc_title_link"])[1]');
		if(snapshotUrl.length) {
			snapshotUrl = snapshotUrl[0].href;
		} else {
			snapshotUrl = undefined;
		}
		
		//don't attach snapshots of the citation view in google scholar
		if(snapshotUrl && snapshotUrl.indexOf('/citations?') != -1) {
			snapshotUrl = undefined;
		}
		
		var linkTitle = ZU.xpathText(article,
			'(.//h3[@class="gs_rt"]|.//a[@class="gsc_title_link"])[1]');

		var attachment;
		if(linkTitle && snapshotUrl) {
			//try to get an attachment
			//based on google supplied tag
			attachment = getAttachment(snapshotUrl, linkTitle);
			if(attachment) {
				attachment.title = "Full Text";
			}
		}

		//take a snapshot if we didn't attach as file
		if(snapshotUrl && !attachment) {
			attachment = {
				title: 'Snapshot',
				url: snapshotUrl,
				mimeType: 'text/html'
			};
		}

		//attach files linked on the right
		var pdf = ZU.xpath(article,
			'(./div[contains(@class,"gs_fl")]\
				//a[.//span[@class="gs_ctg2"]]\
			|.//div[contains(@class,"gsc_title_ggi")]\
				//a[.//span[@class="gsc_title_ggt"]])');
		for(var i=0, n=pdf.length; i<n; i++) {
			var title = pdf[i].childNodes[0];
			if(title.classList.contains('gs_ctg2')
				|| title.classList.contains('gsc_title_ggt')) {
				//we actually want parent here on saved citation pages
				title = title.parentNode;
			}
			var attach = getAttachment(pdf[i].href, title.textContent);
			
			if(!attach) continue;

			//drop attachment linked by the main link
			// if it's the same url
			if(attachment && attach.url==attachment.url) {
				attachment = undefined;
			}

			item.attachments.push(attach);
		}

		if(attachment) {
			item.attachments.push(attachment);
		}

		//add linked url to the URL field
		if(snapshotUrl) {
			item.url = snapshotUrl;
		}

		item.complete();
	});

	translator.translate();
}

// Imports BibTeX for cases
function importCaseResult(doc, result, bibtex, factory, callback) {
	//check if the BibTeX file has title
	if(!text.match(/title={{}}/i)) {
		var translator = Zotero.loadTranslator("import");
		//BibTeX
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(text);

		translator.setHandler("itemDone", function(obj, item) {
			item.attachments = factory.getAttachments("Page");
			item.complete();
		});

		translator.translate();
		
		callback();
		return;
	}
	
	// If BibTeX is empty, this is some kind of case, if anything.
	// Metadata from the citelet, supplemented by the target
	// document for the docket number, if possible.
	if (!factory.hasReporter() && factory.attachmentLinks[0]) {
		//fetch docket from the case page
		ZU.processDocuments(factory.attachmentLinks[0], 
			function(doc) {
				factory.getDocketNumber(doc);
			},
			function(doc) {
				factory.saveItem();
				callback();
			}
		);
	} else {
		factory.saveItem();
		callback();
	}
}

// Imports BibTeX for patents
function importPatentResult(doc, patent, bibtex) {
	var translator = Zotero.loadTranslator("import");
	//BibTeX
	translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
	translator.setString(bibtex);

	translator.setHandler("itemDone", function(obj, item) {
		item.itemType = 'patent';

		//fix case for patent titles in all upper case
		if(item.title.toUpperCase() == item.title) {
			item.title = ZU.capitalizeTitle(item.title);
		}

		//authors are inventors
		for(var i=0, n=item.creators.length; i<n; i++) {
			item.creators[i].creatorType = 'inventor';
		}

		//country and patent number end up in extras
		if(item.extra) {
			var m = item.extra.split(/\s*Patent\s*/i);
			if(m.length == 2) {
				item.country = m[0];
				item.patentNumber = m[1];
				delete item.extra;
			}
		}

		//attach google patents page
		var attachmentDone = false;
		if(item.patentNumber && item.country) {
			attachmentDone = true;
			item.attachments.push({
				title: 'Google Patents PDF',
				url: 'http://patentimages.storage.googleapis.com/pdfs/'
					+ item.country.toUpperCase()
					+ item.patentNumber.replace(/\D+/g, '')
					+ '.pdf',
				mimeType: 'application/pdf'
			});
		}
		
		var patentUrl;
		if(!attachmentDone && patent) {
			patentUrl = ZU.xpathText(patent,
				'(.//h3[@class="gs_rt"]/a[1]|//a[@class="gsc_title_link"])[1]/@href');
		}
		
		if(patentUrl) {
			item.attachments.push({
				title: 'Google Patents page',
				url: patentUrl,
				mimeType: 'text/html'
			});
		}

		item.complete();
	});

	translator.translate();
}

function unescapeJSString(str) {
	return str.replace(/\\x([\da-f]{2})/gi, function(m, hex) {
		return String.fromCharCode(parseInt(hex, 16));
	});
}

// Builds Cite URL from the link "onclick" attribute
var gs_ocit_url; // Fetch directly from page. Seems like this may vary
function makeCiteUrl(onclick, doc) {
	var m = onclick.match(/\bgs_ocit\(event,\s*'([^']+)'\s*,\s*'(\d+)'\s*\)/);
	if (!m) return;
	
	if (!gs_ocit_url) {
		var root = doc.getElementById('gs_cit');
		if (!root) {
			Zotero.debug('Could not find gs_cit div');
			root = doc.body;
		}
		
		var script = ZU.xpathText(root, './/script[starts-with(text(),"function gs_ocit(")][1]');
		if (!script) throw new Error('Could not locate gs_ocit script');
		
		gs_ocit_url = script.match(/\bgs_ajax\('([^']+)/);
		if (!gs_ocit_url) {
			Zotero.debug(script);
			throw new Error('Could not extract gs_ocit_url from gs_ocit script');
		}
		
		gs_ocit_url = unescapeJSString(gs_ocit_url[1]);
		Zotero.debug('Using ' + gs_ocit_url + ' as gs_ocit_url');
	}
	
	return gs_ocit_url
		.replace('{id}', m[1])
		.replace('{p}', m[2]);
}

function doWeb(doc, url) {
	var type = detectWeb(doc, url);
	if(type != 'multiple' && url.indexOf('/citations?') != -1) {
		// Individual saved citation
		
		// Extract URL from script
		var script = ZU.xpathText(doc.head, './script[contains(text(), "function gsc_export(")][1]');
		if (!script) {
			Zotero.debug(doc.head.innerHTML);
			throw new Error('Could not find gsc_export script');
		}
		var exportUrl = script.match(/function gsc_export\([^}]+\bgsc_go\(['"]([^'"]+)/);
		if (!exportUrl) {
			Zotero.debug(script);
			throw new Error('Could not extract export url from script');
		}
		
		exportUrl = unescapeJSString(exportUrl[1]);
		
		var data = {
			bibtexUrl: exportUrl + '0', // BibTeX format
			result: doc.getElementById('gsc_ccl'),
			type: type
		};
		
		scrapeAll(doc, [data]);
	} else if(type == 'case') {
		// Invoke the case or the listing scraper, as appropriate.
		// In a listings page, this forces use of bibtex data and English page version
		scrapeCase(doc, url);
	} else {
		var results = getViableResults(doc);
		var items = new Object();
		var resultDivs = new Object();
		var citeUrl;
		for(var i=0, n=results.length; i<n; i++) {
			var onclick = ZU.xpathText(results[i], './/div[contains(@class, "gs_fl")]/a[@aria-controls="gs_cit"]/@onclick');
			if (!onclick) {
				// Should never hit this, since we check it in getViableResults
				Zotero.debug(results[i].innerHTML);
				throw new Error("Could not locate Cite onclick attribute");
			}
			
			citeUrl = makeCiteUrl(onclick, doc);
			if (!citeUrl) {
				// This could happen if GS changes their code around
				Zotero.debug(onclick);
				throw new Error("Could not determine Cite link parameters");
			}
			
			var title = ZU.xpathText(results[i], './/h3[@class="gs_rt"]');
			if (!title) {
				// Should never hit this, since we check it in getViableResults
				Zotero.debug(results[i].innerHTML);
				throw new Error("Could not determine title");
			}
			
			items[citeUrl] = title;

			//keep the result div for extra information
			resultDivs[citeUrl] = results[i];
		}

		Zotero.selectItems(items, function(selectedItems) {
			if(!selectedItems) return true;
			
			var itemObjs = new Array();

			for(var i in selectedItems) {
				itemObjs.push({
					citeUrl: i,
					result: resultDivs[i],
					type: determineType(resultDivs[i])
				})
			}
			
			scrapeAll(doc, itemObjs);
		});
	}
}

// Fetch BibTeX URL as needed
function scrapeAll(doc, itemObjs) {
	if (!itemObjs.length) return;
	var item = itemObjs.shift();
	
	var callback = scrapeAll.bind(null, doc, itemObjs);
	
	// Under some conditions, we don't need the BibTeX for cases
	if (item.type == 'case') {
		var titleString = ZU.xpathText(item.result, './/h3[@class="gs_rt"]')
			|| ZU.xpathText(item.result, './/a[@class="gsc_title_link"]');
		var citeletString = ZU.xpathText(item.result, './/div[@class="gs_a"]')
			|| ZU.xpathText(item.result, './/div[@class="gsc_merged_snippet"]/div[./following-sibling::div]');
		
		if(citeletString) citeletString = ZU.trimInternal(citeletString);
	
		var attachmentFrag = ZU.xpathText(item.result,
			'(.//h3[@class="gs_rt"]/a|.//a[@class="gsc_title_link"])[1]/@href');
		if(attachmentFrag.indexOf('/citations?') != -1) {
			attachmentFrag = null;
			//build attachment link when importing from saved citations
			var caseId = ZU.xpathText(item.result, '(.//div[contains(@class, "gs_fl")]\
				/a[contains(@href,"cites=") or contains(@href,"about=")]/@href)[1]');
			if(caseId) caseId = caseId.match(/\b(?:cites|about)=(\d+)/);
			if(caseId) caseId = caseId[1];
			if(caseId) {
				attachmentFrag = '/scholar_case?case=' + caseId;
			}
		}
		
		if (attachmentFrag) {
			var attachmentLinks = [attachmentFrag];
		} else {
			var attachmentLinks = [];
		}
	
		// Instantiate item factory with available data
		var factory = new ItemFactory(
			doc,
			citeletString,
			attachmentLinks,
			titleString
		);
	
		if (factory.hasUsefulData()) {
			factory.getCourt();
			factory.getVolRepPag();
			if (factory.hasReporter()) {
				// If we win here, we get by without fetching the BibTeX object at all.
				factory.saveItem();
				callback();
				return;
			}
		}
		
		item.factory = factory;
	}
	
	if (item.citeUrl) {
		ZU.doGet(item.citeUrl, function(text) {
			var m = text.match(/href="((https?:\/\/[a-z\.]*)?\/scholar.bib\?[^"]+)/);
			if (!m) {
				//Saved lists and possibly other places have different formats for BibTeX URLs
				//Trying to catch them here (can't add test bc lists are tied to google accounts)
				Zotero.debug(text);
				m = text.match(/href="(.+?)">BibTeX<\/a>/);
			}
			if (!m) {
				var msg = "Could not find BibTeX URL"
				var title = getHTMLTitle(text);
				if (title) msg += ' Got page with title "' + title +'"';
				throw new Error(msg);
			}
			
			fetchBibTeX(doc, item, ZU.unescapeHTML(m[1]), callback);
		})
	} else if (item.bibtexUrl) {
		fetchBibTeX(doc, item, item.bibtexUrl, callback);
	} else {
		Zotero.debug(item);
		throw new Error("Item missing citeUrl and bibtexUrl");
	}
}

// Retrieve BibTeX and call appropriate handler
function fetchBibTeX(doc, item, bibtexUrl, doneCallback) {
	ZU.doGet(bibtexUrl,
		function(text) {
			if (!/^\s*@\w+{/.test(text)) {
				var msg = 'BibTeX not found.';
				var title = getHTMLTitle(text);
				if (title) msg += ' Got page with title "' + title +'"';
				
				throw new Error(msg);
			}
			
			switch (item.type) {
				case 'case':
					importCaseResult(doc, item.result, text, item.factory, doneCallback);
				break;
				case 'patent':
					importPatentResult(doc, item.result, text);
				break;
				case 'journalArticle':
				case 'book':
					importArticleResult(doc, item.result, text);
				break;
				default:
					throw new Error("Unexpected item type " + item.type);
			}
		},
		function() {
			if (item.type !== 'case') doneCallback(); // Called from importCaseResult
		}
	);
}

/*
 * #########################
 * ### Scraper Functions ###
 * #########################
 */
var scrapeCase = function (doc, url) {
	// Citelet is identified by
	// id="gsl_reference"
	var refFrag = doc.evaluate('//div[@id="gsl_reference"] | //div[@id="gs_reference"]',
					doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (refFrag) {
		// citelet looks kind of like this
		// Powell v. McCormack, 395 US 486 - Supreme Court 1969
		var item = new Zotero.Item("case");
		var attachmentPointer = url;
		if (Zotero.isMLZ) {
			var block = doc.getElementById("gs_opinion_wrapper");
			if (block) {
				attachmentPointer = block;
			}
		}
		var factory = new ItemFactory(doc, refFrag.textContent, [attachmentPointer]);
		factory.repairCitelet();
		factory.getDate();
		factory.getCourt();
		factory.getVolRepPag();
		if (!factory.hasReporter()) {
			// Look for docket number in the current document
			factory.getDocketNumber(doc);
		}
		factory.getTitle();
		factory.saveItem();
	}
};


/*
 * ####################
 * ### Item Factory ###
 * ####################
 */

var ItemFactory = function (doc, citeletString, attachmentLinks, titleString /*, bibtexLink*/) {
	// var strings
	this.v = {};
	this.v.title = titleString;
	this.v.number = false;
	this.v.court = false;
	this.v.extra = false;
	this.v.date = undefined;
	this.v.jurisdiction = false;
	this.v.docketNumber = false;
	this.vv = {};
	this.vv.volRepPag = [];
	// portable array
	this.attachmentLinks = attachmentLinks;
	this.doc = doc;
	// working strings
	this.citelet = citeletString;
/** handled outside of item factory
	this.bibtexLink = bibtexLink;
	this.bibtexData = undefined;
*/
	this.trailingInfo = false;
	// simple arrays of strings
	this.hyphenSplit = false;
	this.commaSplit = false;
};


ItemFactory.prototype.repairCitelet = function () {
	if (!this.citelet.match(/\s+-\s+/)) {
		this.citelet = this.citelet.replace(/,\s+([A-Z][a-z]+:)/, " - $1");
	}
};


ItemFactory.prototype.repairTitle = function () {
	// All-caps words of four or more characters probably need fixing.
	if (this.v.title.match(/(?:[^a-z]|^)[A-Z]{4,}(?:[^a-z]|$)/)) {
		this.v.title = ZU.capitalizeTitle(this.v.title.toLowerCase(), true)
								.replace(/([^0-9a-z])V([^0-9a-z])/, "$1v$2");	
	}
};


ItemFactory.prototype.hasUsefulData = function () {
	if (this.getDate()) {
		return true;
	}
	if (this.hasInitials()) {
		return true;
	}
	return false;
};


ItemFactory.prototype.hasInitials = function () {
	if (this.hyphenSplit.length && this.hyphenSplit[0].match(/[A-Z] /)) {
		return true;
	}
	return false;
};


ItemFactory.prototype.hasReporter = function () {
	if (this.vv.volRepPag.length > 0) {
		return true;
	}
	return false;
};


ItemFactory.prototype.getDate = function () {
	var i, m;
	// Citelet parsing, step (1)
	if (!this.hyphenSplit) {
		if (this.citelet.match(/\s+-\s+/)) {
			this.hyphenSplit = this.citelet.split(/\s+-\s+/);
		} else {
			m = this.citelet.match(/^(.*),\s+([^,]+Court,\s+[^,]+)$/);
			if (m) {
				this.hyphenSplit = [m[1], m[2]];
			} else {
				this.hyphenSplit = [this.citelet];
			}
		}
		this.trailingInfo = this.hyphenSplit.slice(-1);
	}
	if (!this.v.date && this.v.date !== false) {
		this.v.date = false;
		for (i = this.hyphenSplit.length - 1; i > -1; i += -1) {
			m = this.hyphenSplit[i].match(/(?:(.*)\s+)*([0-9]{4})$/);
			if (m) {
				this.v.date = m[2];
				if (m[1]) {
					this.hyphenSplit[i] = m[1];
				} else {
					this.hyphenSplit[i] = "";
				}
				this.hyphenSplit = this.hyphenSplit.slice(0, i + 1);
				break;
			}
		}
	}
	// If we can find a more specific date in the case's centered text then use it
	var nodesSnapshot = this.doc.evaluate('//div[@id="gs_opinion"]/center', this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
	for( var iNode = 0; iNode < nodesSnapshot.snapshotLength; iNode++ ) {
		var specificDate = nodesSnapshot.snapshotItem(iNode).textContent.trim();
		// Remove the first word through the first space 
		//  if it starts with "Deci" or it doesn't start with the first three letters of a month
		//  and if it doesn't start with Submitted or Argued
		// (So, words like "Decided", "Dated", and "Released" will be removed)
		specificDate = specificDate.replace(/^(?:Deci|(?!Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Submitted|Argued))[a-z]+[.:]?\s*/i,"")
		// Remove the trailing period, if it is there
			.replace(/\.$/,"");
		// If the remaining text is a valid date...
		if (!isNaN(Date.parse(specificDate))) {
			// ...then use it
			this.v.date = specificDate;
			break;
		}
	}
	return this.v.date;
};


ItemFactory.prototype.getCourt = function () {
	var s, m;
	// Citelet parsing, step (2)
	s = this.hyphenSplit.pop().replace(/,\s*$/, "").replace(/\u2026\s*$/, "Court");
	var court = null;
	var jurisdiction = null;
	m = s.match(/(.* Court),\s+(.*)/);
	if (m) {
		court = m[1];
		jurisdiction = m[2];
	}
	if (!court) {
		m = s.match(/(?:([a-zA-Z]+):\s*)*(.*)/);
		if (m) {
			court = m[2].replace(/_/g, " ");
			jurisdiction = m[1];
		}
	}
	if (court) {
		this.v.court = court;
	}
	if (jurisdiction) {
		this.v.extra = "{:jurisdiction: " + jurisdiction + "}";
	}
};


ItemFactory.prototype.getVolRepPag = function () {
	var i, m;
	// Citelet parsing, step (3)
	if (this.hyphenSplit.length) {
		this.commaSplit = this.hyphenSplit.slice(-1)[0].split(/\s*,\s+/);
		var gotOne = false;
		for (i = this.commaSplit.length - 1; i > -1; i += -1) {
			m = this.commaSplit[i].match(/^([0-9]+)\s+(.*)\s+(.*)/);
			if (m) {
				var volRepPag = {};
				volRepPag.volume = m[1];
				volRepPag.reporter = m[2];
				volRepPag.pages = m[3].replace(/\s*$/, "");
				this.commaSplit.pop();
				if (!volRepPag.pages.match(/[0-9]$/) && (i > 0 || gotOne)) {
					continue;
				}
				gotOne = true;
				this.vv.volRepPag.push(volRepPag);
			} else {
				break;
			}
		}
	}
};


ItemFactory.prototype.getTitle = function () {
	// Citelet parsing, step (4) [optional]
	if (this.commaSplit) {
		this.v.title = this.commaSplit.join(", ");
	}
};


ItemFactory.prototype.getDocketNumber = function (doc) {
	var docNumFrag = doc.evaluate(
		'//center[preceding-sibling::center//h3[@id="gsl_case_name"]]\
		| //div[@class="gsc_value" and preceding-sibling::div[text()="Docket id"]]',
		doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (docNumFrag) {
		this.v.docketNumber = docNumFrag.textContent
								.replace(/^\s*[Nn][Oo](?:.|\s+)\s*/, "")
								.replace(/\.\s*$/, "");
	}
};

ItemFactory.prototype.getAttachments = function (doctype) {
	var i, ilen, attachments;
	var attachmentTitle = "Google Scholar " + doctype;
	attachments = [];
	for (i = 0, ilen = this.attachmentLinks.length; i < ilen; i += 1) {
		if (!this.attachmentLinks[i]) continue;
		if ("string" === typeof this.attachmentLinks[i]) {
			attachments.push({
				title: attachmentTitle,
				url:this.attachmentLinks[i],
				type:"text/html"
			});
		} else {
			// DOM fragment and parent doc
			var block = this.attachmentLinks[i];
			var doc = block.ownerDocument;

			// String content (title, url, css)
			var title = doc.getElementsByTagName("title")[0].textContent;
			var url = doc.documentURI;
			var css = "*{margin:0;padding:0;}div.mlz-outer{width: 60em;margin:0 auto;text-align:left;}body{text-align:center;}p{margin-top:0.75em;margin-bottom:0.75em;}div.mlz-link-button a{text-decoration:none;background:#cccccc;color:white;border-radius:1em;font-family:sans;padding:0.2em 0.8em 0.2em 0.8em;}div.mlz-link-button a:hover{background:#bbbbbb;}div.mlz-link-button{margin: 0.7em 0 0.8em 0;}";

			// head element
			var head = doc.createElement("head");
			head.innerHTML = '<title>' + title + '</title>';
			head.innerHTML += '<style type="text/css">' + css + '</style>'; 

			var attachmentdoc = Zotero.Utilities.composeDoc(doc, head, block);
			attachments.push({
				title: attachmentTitle,
				document:attachmentdoc
			});

			// URL for this item
			this.item.url = url;
		}
	}
	return attachments;
};


ItemFactory.prototype.pushAttachments = function (doctype) {
	this.item.attachments = this.getAttachments(doctype);
};

/*
ItemFactory.prototype.getBibtexData = function (callback) {
	if (!this.bibtexData) {
		if (this.bibtexData !== false) {
			Zotero.Utilities.doGet(this.bibtexLink, function(bibtexData) {
				if (!bibtexData.match(/title={{}}/)) {
					this.bibtexData = bibtexData;
				} else {
					this.bibtexData = false;
				}
				callback(this.bibtexData);
			});
			return;
		}
	}
	callback(this.bibtexData);
};
*/

ItemFactory.prototype.saveItem = function () {
	var i, ilen, key;
	if (this.v.title) {
		this.repairTitle();
		if (this.vv.volRepPag.length) {
			var completed_items = [];
			for (i = 0, ilen = this.vv.volRepPag.length; i < ilen; i += 1) {
				this.item = new Zotero.Item("case");
				for (key in this.vv.volRepPag[i]) {
					if (this.vv.volRepPag[i][key]) {
						this.item[key] = this.vv.volRepPag[i][key];
					}
				}
				this.saveItemCommonVars();
				if (i === (this.vv.volRepPag.length - 1)) {
					this.pushAttachments("Judgement");
				}
				this.item.itemID = "" + bogusItemID;
				bogusItemID += 1;
				completed_items.push(this.item);
			}
			if (completed_items.length === 0) {
				throw new Error("Failed to parse \"" + this.citelet + "\"");
			}
			for (i = 0, ilen = completed_items.length; i < ilen; i += 1) {
				for (j = 0, jlen = completed_items.length; j < jlen; j += 1) {
					if (i === j) {
						continue;
					}
					completed_items[i].seeAlso.push(completed_items[j].itemID);
				}
				completed_items[i].complete();
			}
		} else {
			this.item = new Zotero.Item("case");
			this.saveItemCommonVars();
			this.pushAttachments("Judgement");
			this.item.complete();
		}
	} else {
		throw new Error("Failed to find title in \"" + this.citelet + "\"");
	}
};


ItemFactory.prototype.saveItemCommonVars = function () {
	for (key in this.v) {
		if (this.v[key]) {
			this.item[key] = this.v[key];
		}
	}
};

/*
  Test Case Descriptions:  (these have not been included in the test case JSON below as per 
							aurimasv's comment on https://github.com/zotero/translators/pull/833)

		"description": "Legacy test case",
	"url": "http://scholar.google.com/scholar?q=marbury&hl=en&btnG=Search&as_sdt=1%2C22&as_sdtp=on",
	
		"description": "Legacy test case",
		"url": "http://scholar.google.com/scholar?hl=en&q=kelo&btnG=Search&as_sdt=0%2C22&as_ylo=&as_vis=0",
	
		"description": "Legacy test case",
		"url": "http://scholar.google.com/scholar?hl=en&q=smith&btnG=Search&as_sdt=0%2C22&as_ylo=&as_vis=0",
	
		"description": "Legacy test case",
		"url": "http://scholar.google.com/scholar?hl=en&q=view+of+the+cathedral&btnG=Search&as_sdt=0%2C22&as_ylo=&as_vis=0",

		"description": "Legacy test case",
		"url": "http://scholar.google.com/scholar?hl=en&q=clifford&btnG=Search&as_sdt=0%2C22&as_ylo=&as_vis=0",

		"description": "Legacy test case",
		"url": "http://scholar.google.com/scholar_case?case=9834052745083343188&q=marbury+v+madison&hl=en&as_sdt=2,5",

		"description": "Decided date not preceded by any word or any other date line",
		"url": "http://scholar.google.com/scholar_case?case=11350538941232186766",

		"description": "Decided date preceded by 'Dated'",
		"url": "http://scholar.google.com/scholar_case?case=4250138655935640563",

		"description": "Decided date preceded by 'Released'",
		"url": "http://scholar.google.com/scholar_case?case=8121501341214166807",

		"description": "Decided date preceded by 'Decided' and also by a 'Submitted' date line",
		"url": "http://scholar.google.com/scholar_case?case=834584264358299037",

		"description": "Decided date preceded by 'Decided' and also by an 'Argued' date line",
		"url": "http://scholar.google.com/scholar_case?case=15235797139493194004",

		"description": "Decided date preceded by 'Decided' and also by an 'Argued' date line and followed by an 'As Modified' line; most citers of this case appear to use the Decided date, not the As Modified date",
		"url": "http://scholar.google.com/scholar_case?case=163483131267446711",
	
*/

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://scholar.google.com/scholar?q=marbury&hl=en&btnG=Search&as_sdt=1%2C22&as_sdtp=on",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://scholar.google.com/scholar?hl=en&q=kelo&btnG=Search&as_sdt=0%2C22&as_ylo=&as_vis=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://scholar.google.com/scholar?hl=en&q=smith&btnG=Search&as_sdt=0%2C22&as_ylo=&as_vis=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://scholar.google.com/scholar?hl=en&q=view+of+the+cathedral&btnG=Search&as_sdt=0%2C22&as_ylo=&as_vis=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://scholar.google.com/scholar?hl=en&q=clifford&btnG=Search&as_sdt=0%2C22&as_ylo=&as_vis=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://scholar.google.com/scholar_case?case=9834052745083343188&q=marbury+v+madison&hl=en&as_sdt=2,5",
		"items": [
			{
				"itemType": "case",
				"caseName": "Marbury v. Madison",
				"creators": [],
				"dateDecided": "1803",
				"court": "Supreme Court",
				"firstPage": "137",
				"itemID": "1",
				"reporter": "US",
				"reporterVolume": "5",
				"attachments": [
					{
						"title": "Google Scholar Judgement",
						"type": "text/html"
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
		"url": "http://scholar.google.com/scholar_case?case=11350538941232186766",
		"items": [
			{
				"itemType": "case",
				"caseName": "Meier ex rel. Meier v. Sun Intern. Hotels, Ltd.",
				"creators": [],
				"dateDecided": "April 19, 2002",
				"court": "Court of Appeals, 11th Circuit",
				"firstPage": "1264",
				"itemID": "1",
				"reporter": "F. 3d",
				"reporterVolume": "288",
				"attachments": [
					{
						"title": "Google Scholar Judgement",
						"type": "text/html"
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
		"url": "http://scholar.google.com/scholar_case?case=4250138655935640563",
		"items": [
			{
				"itemType": "case",
				"caseName": "Patio Enclosures, Inc. v. Four Seasons Marketing Corp.",
				"creators": [],
				"dateDecided": "September 21, 2005",
				"court": "Court of Appeals, 9th Appellate Dist.",
				"extra": "{:jurisdiction: Ohio}",
				"firstPage": "4933",
				"itemID": "1",
				"reporter": "Ohio",
				"reporterVolume": "2005",
				"attachments": [
					{
						"title": "Google Scholar Judgement",
						"type": "text/html"
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
		"url": "http://scholar.google.com/scholar_case?case=8121501341214166807",
		"items": [
			{
				"itemType": "case",
				"caseName": "Click v. Estate of Click",
				"creators": [],
				"dateDecided": "June 13, 2007",
				"court": "Court of Appeals, 4th Appellate Dist.",
				"extra": "{:jurisdiction: Ohio}",
				"firstPage": "3029",
				"itemID": "1",
				"reporter": "Ohio",
				"reporterVolume": "2007",
				"attachments": [
					{
						"title": "Google Scholar Judgement",
						"type": "text/html"
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
		"url": "http://scholar.google.com/scholar_case?case=834584264358299037",
		"items": [
			{
				"itemType": "case",
				"caseName": "Kenty v. Transamerica Premium Ins. Co.",
				"creators": [],
				"dateDecided": "July 5, 1995",
				"court": "Supreme Court",
				"extra": "{:jurisdiction: Ohio}",
				"firstPage": "415",
				"itemID": "1",
				"reporter": "Ohio St. 3d",
				"reporterVolume": "72",
				"attachments": [
					{
						"title": "Google Scholar Judgement",
						"type": "text/html"
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
		"url": "http://scholar.google.com/scholar_case?case=15235797139493194004",
		"items": [
			{
				"itemType": "case",
				"caseName": "Tinker v. Des Moines Independent Community School Dist.",
				"creators": [],
				"dateDecided": "February 24, 1969",
				"court": "Supreme Court",
				"firstPage": "503",
				"itemID": "1",
				"reporter": "US",
				"reporterVolume": "393",
				"attachments": [
					{
						"title": "Google Scholar Judgement",
						"type": "text/html"
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
		"url": "http://scholar.google.com/scholar_case?case=163483131267446711",
		"items": [
			{
				"itemType": "case",
				"caseName": "Kaimowitz v. Board of Trustees of U. of Illinois",
				"creators": [],
				"dateDecided": "December 23, 1991",
				"court": "Court of Appeals, 7th Circuit",
				"firstPage": "765",
				"itemID": "1",
				"reporter": "F. 2d",
				"reporterVolume": "951",
				"attachments": [
					{
						"title": "Google Scholar Judgement",
						"type": "text/html"
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
		"url": "http://scholar.google.com/scholar_case?case=10394955686617635825",
		"items": [
			{
				"itemType": "case",
				"caseName": "Kline v. Mortgage Electronic Security Systems",
				"creators": [],
				"dateDecided": "February 27, 2013",
				"court": "Dist. Court",
				"docketNumber": "Case No. 3:08cv408",
				"extra": "{:jurisdiction: SD Ohio}",
				"attachments": [
					{
						"title": "Google Scholar Judgement",
						"type": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
