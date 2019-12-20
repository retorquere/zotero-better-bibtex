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
	"lastUpdated": "2018-11-16 05:56:18"
}

// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	/* Detection for law cases, but not "How cited" pages,
	 * e.g. url of "how cited" page:
	 *   http://scholar.google.co.jp/scholar_case?about=1101424605047973909&q=kelo&hl=en&as_sdt=2002
	 */
	if (url.indexOf('/scholar_case?') != -1
		&& url.indexOf('about=') == -1
	) {
		return "case";
	} else if (url.indexOf('/citations?') != -1) {
		if (getProfileResults(doc, true)) {
			return "multiple";
		}
		
		//individual saved citation
		var link = ZU.xpathText(doc, '//a[@class="gsc_vcd_title_link"]/@href');
		if (!link) return;
		if (link.indexOf('/scholar_case?') != -1) {
			return 'case';
		} else {
			//Can't distinguish book from journalArticle
			//Both have "Journal" fields
			return 'journalArticle';
		}
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.gs_r[data-cid]');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].dataset.cid;
		var title = text(rows[i], '.gs_rt');
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function getProfileResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a.gsc_a_at');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].dataset.href;
		var title = rows[i].textContent;
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	var type = detectWeb(doc, url);
	if (type == "multiple") {
		if (getSearchResults(doc, true)) {
			Zotero.selectItems(getSearchResults(doc, false), function (items) {
				if (!items) {
					return true;
				}
				var ids = [];
				for (var i in items) {
					ids.push(i);
				}
				//here it is enough to know the ids and we can call scrape directly
				scrape(doc, ids);
			});
		} else if (getProfileResults(doc, true)) {
			Zotero.selectItems(getProfileResults(doc, false), function (items) {
				if (!items) {
					return true;
				}
				var articles  = [];
				for (var i in items) {
					articles.push(i);
				}
				//here we need open these pages before calling scrape
				ZU.processDocuments(articles, scrape);
			});
		}
	} else {
		//e.g. https://scholar.google.de/citations?view_op=view_citation&hl=de&user=INQwsQkAAAAJ&citation_for_view=INQwsQkAAAAJ:u5HHmVD_uO8C
		scrape(doc, url, type);
	}
}


function scrape(doc, idsOrUrl, type) {
	if (Array.isArray(idsOrUrl)) {
		scrapeIds(doc, idsOrUrl);
	} else {
		if (type && type=="case") {
			scrapeCase(doc, idsOrUrl);
		} else {
			var related = ZU.xpathText(doc, '//a[contains(@href, "q=related:")]/@href');
			if (!related) {
				throw new Error("Could not locate related URL");
			}
			var itemID = related.match(/=related:([^:]+):/);
			if (itemID) {
				scrapeIds(doc, [itemID[1]]);
			} else {
				Z.debug("Can't find itemID. related URL is " + related);
				throw new Error("Cannot extract itemID from related link");
			}
		}
	}
	
}


function scrapeIds(doc, ids) {
	for (let i=0; i<ids.length; i++) {
		// We need here 'let' to access ids[i] later in the nested functions
		let context = doc.querySelector('.gs_r[data-cid="' + ids[i] + '"]');
		if (!context && ids.length==1) context = doc;
		var citeUrl = '/scholar?q=info:' + ids[i] + ':scholar.google.com/&output=cite&scirp=1';
		// For 'My Library' we check the search field at the top
		// and then in these cases change the citeUrl accordingly.
		var scilib = attr(doc, '#gs_hdr_frm input[name="scilib"]', 'value')
		if (scilib && scilib==1) {
			var citeUrl = '/scholar?scila=' + ids[i] + '&output=cite&scirp=1';
		}
		ZU.doGet(citeUrl, function(citePage) {
			var m = citePage.match(/href="((https?:\/\/[a-z\.]*)?\/scholar.bib\?[^"]+)/);
			if (!m) {
				//Saved lists and possibly other places have different formats for BibTeX URLs
				//Trying to catch them here (can't add test bc lists are tied to google accounts)
				m = citePage.match(/href="(.+?)">BibTeX<\/a>/);
			}
			if (!m) {
				var msg = "Could not find BibTeX URL";
				var title = citePage.match(/<title>(.*?)<\/title>/i);
				if (title) {
					if (title) msg += ' Got page with title "' + title[1] +'"';
				}
				throw new Error(msg);
			}
			var bibUrl = ZU.unescapeHTML(m[1]);
			ZU.doGet(bibUrl, function(bibtex) {
				
				var translator = Zotero.loadTranslator("import");
				translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
				translator.setString(bibtex);
				translator.setHandler("itemDone", function(obj, item) {
					//these two variables are extracted from the context
					var titleLink = attr(context, 'h3 a, #gsc_vcd_title a', 'href');
					var secondLine = text(context, '.gs_a') || '';
					//case are not recognized and can be characterized by the
					//titleLink, or that the second line starts with a number
					//e.g. 1 Cr. 137 - Supreme Court, 1803
					if ((titleLink && titleLink.indexOf('/scholar_case?')>-1) || 
						secondLine && ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(secondLine[0])>-1) {
						item.itemType = "case";
						item.caseName = item.title;
						item.reporter = item.publicationTitle;
						item.reporterVolume = item.volume;
						item.dateDecided = item.date;
						item.court = item.publisher;
					}
					//patents are not recognized but are easily detected
					//by the titleLink or second line
					if ((titleLink && titleLink.indexOf('google.com/patents/')>-1) || secondLine.indexOf('Google Patents')>-1) {
						item.itemType = "patent";
						//authors are inventors
						for (var i=0, n=item.creators.length; i<n; i++) {
							item.creators[i].creatorType = 'inventor';
						}
						//country and patent number
						if (titleLink) {
							let m = titleLink.match(/\/patents\/([A-Za-z]+)(.*)$/);
							if (m) {
								item.country = m[1];
								item.patentNumber = m[2];
							}
						}
					}
					
					//fix titles in all upper case, e.g. some patents in search results
					if (item.title.toUpperCase() == item.title) {
						item.title = ZU.capitalizeTitle(item.title);
					}
					
					//delete "others" as author
					if (item.creators.length) {
						var lastCreatorIndex = item.creators.length-1,
							lastCreator = item.creators[lastCreatorIndex];
						if (lastCreator.lastName === "others" && (lastCreator.fieldMode === 1 ||lastCreator.firstName === "")) {
							item.creators.splice(lastCreatorIndex, 1);
						}
					}
					
					//clean author names
					for (var j=0, m=item.creators.length; j<m; j++) {
						if (!item.creators[j].firstName) continue;
			
						item.creators[j] = ZU.cleanAuthor(
							item.creators[j].lastName + ', ' +
								item.creators[j].firstName,
							item.creators[j].creatorType,
							true);
					}
					
					//attach linked document as attachment if available
					var documentLinkTarget = attr(context, '.gs_or_ggsm a, #gsc_vcd_title_gg a', 'href');
					var documentLinkTitle = text(context, '.gs_or_ggsm a, #gsc_vcd_title_gg a');
					if (documentLinkTarget) {
						//Z.debug(documentLinkTarget);
						attachment = {
							title: "Full Text",
							url: documentLinkTarget
						};
						var m = documentLinkTitle.match(/^\[(\w+)\]/);
						if (m) {
							var mimeTypes = {
								'PDF': 'application/pdf',
								'DOC': 'application/msword',
								'HTML': 'text/html'
							};
							if (Object.keys(mimeTypes).indexOf(m[1].toUpperCase())>-1) {
								attachment.mimeType = mimeTypes[m[1]];
							}
						}
						item.attachments.push(attachment);
					}
					
					// Attach linked page as snapshot if available
					if (titleLink && titleLink != documentLinkTarget) {
						item.attachments.push({
							url: titleLink,
							title: "Snapshot",
							mimeType: "text/html"
						});
					}

					item.complete();
				});
				translator.translate();
			});
		});
	}
}


/*
 * #########################
 * ### Scraper Functions ###
 * #########################
 */
 
var bogusItemID = 1;

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
	for ( var iNode = 0; iNode < nodesSnapshot.snapshotLength; iNode++ ) {
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
		"url": "https://scholar.google.com/scholar_case?case=608089472037924072",
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
	},
	{
		"type": "web",
		"url": "https://scholar.google.de/citations?view_op=view_citation&hl=de&user=INQwsQkAAAAJ&citation_for_view=INQwsQkAAAAJ:u5HHmVD_uO8C",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Linked data-the story so far",
				"creators": [
					{
						"firstName": "Christian",
						"lastName": "Bizer",
						"creatorType": "author"
					},
					{
						"firstName": "Tom",
						"lastName": "Heath",
						"creatorType": "author"
					},
					{
						"firstName": "Tim",
						"lastName": "Berners-Lee",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"itemID": "bizer2009linked",
				"libraryCatalog": "Google Scholar",
				"pages": "205–227",
				"publicationTitle": "Semantic services, interoperability and web applications: emerging concepts",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Fulltext",
						"mimeType": "application/pdf"
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
		"url": "https://scholar.google.de/citations?user=INQwsQkAAAAJ&hl=de&oi=sra",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://scholar.google.be/scholar?hl=en&as_sdt=1,5&as_vis=1&q=%22transformative+works+and+cultures%22&scisbd=1",
		"items": "multiple"
	}
]
/** END TEST CASES **/
