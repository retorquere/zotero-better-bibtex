{
	"translatorID": "57a00950-f0d1-4b41-b6ba-44ff0fc30289",
	"label": "Google Scholar",
	"creator": "Simon Kornblith, Frank Bennett, Aurimas Vinckevicius",
	"target": "^https?://scholar\\.google\\.(?:com|cat|(?:com?\\.)?[a-z]{2})/(?:scholar(?:_case)?\\?|citations\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-03-17 19:59:24"
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
var __old_cookie, __result_counter=0;

var detectWeb = function (doc, url) {
	// Icon shows only for search results and law cases
	if (url.indexOf('/scholar_case?') != -1 &&
		url.indexOf('about=') == -1) {
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

/*********************************
 * Cookie manipulation functions *
 *********************************/

//sets Google Scholar Preference cookie and returns old value
function setGSPCookie(doc, cookie) {
	var m = doc.cookie.match(/\bGSP=[^;]+/);
	var oldCookie = m[0];

	if(!cookie) {
		cookie = oldCookie.replace(/:?\s*\bCF=\d+/,'') +
				':CF=4';
	}

	var domain = doc.location.href
				.match(/https?:\/\/[^\/]*?(scholar\.google\.[^:\/]+)/i)[1];

	cookie += '; domain=.' + domain +
				'; expires=Sun, 17 Jan 2038 19:14:09 UTC';	//this is what google scholar uses
	doc.cookie = cookie;
	Z.debug('Cookie set to: ' + cookie);

	return oldCookie;
}

//set cookie using Googles Scholar preferences page
function setCookieThroughPrefs(doc, callback) {
	url = doc.location.href.replace(/hl\=[^&]*&?/, "")
			.replace("scholar?",
				"scholar_settings?");
	ZU.doGet(url, function(scisigDoc) {
		var scisig = /<input\s+type="?hidden"?\s+name="?scisig"?\s+value="([^"]+)"/
					.exec(scisigDoc);
		if(!scisig) {
			Z.debug('Could not locate scisig');
			var form = scisigDoc.match(/<form.+?<\/form>/ig);
			if(!form) {
				Z.debug('No forms found on page.');
				Z.debug(scisigDoc);
			} else {
				Z.debug(form.join('\n\n'));
			}
		}
		url = url.replace("scholar_settings?", "scholar_setprefs?")
			+ "&scis=yes&scisf=4&submit=&scisig="+scisig[1];
		//set prefernces
		Z.debug('Submitting settings to Google Scholar: ' + url);
		ZU.doGet(url, function(response) { callback(doc); });
	});
}

function prepareCookie(doc, callback) {
	// Google Scholar always sets GSP
	if(doc.cookie.match(/\bGSP=/)) {
		//check if we need to change cookie
		var m = doc.cookie.match(/\bGSP=[^;]*?\bCF=(\d+)/);
		if(!m || m[1] != 4) {
			__old_cookie = setGSPCookie(doc);
		}
		callback(doc);
	} else {
		Z.debug("Attempting to set cookie through GS Settings page");
		//some proxies do not pass cookies through, so we need to set this by
		//going to the preferences page
		setCookieThroughPrefs(doc, callback);
	}
}

function restoreCookie(doc) {
	if(__old_cookie) {
		setGSPCookie(doc, __old_cookie);
	}
}

function decrementCounter(doc) {
	/**Possible race condition!! But there should never be any
	 * lock-ups or detremental effects as long as only one
	 * instance of the translator can be run at a time and
	 * we do not change __old_cookie after setting it initially
	 */
	__result_counter--;
	if(__result_counter<1) restoreCookie(doc);
}

/*****************************
 * Other accessory functions *
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
			return 'article';
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
	if(!subTitle) return 'article';
	
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

	return 'article';
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

/*********************
 * Scraper functions *
 *********************/

function getViableResults(doc) {
	 return ZU.xpath(doc, '//div[@class="gs_r"]\
					[.//div[@class="gs_fl"]/a[contains(@href,"q=info:")\
						or contains(@href,"q=related:")\
						or contains(@onclick, "gs_ocit(event")]]');
}

function scrapeArticleResults(doc, articles) {
	for(var i=0, n=articles.length; i<n; i++) {
		//using closure so we can link a doGet response to a PDF url
		(function(doc, article) {
			ZU.doGet(article.bibtexUrl,
				function(text) {
					var translator = Zotero.loadTranslator('import');
					translator.setTranslator('9cb70025-a888-4a29-a210-93ec52da40d4');
					translator.setString(text);
	
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
						var snapshotUrl = ZU.xpath(article.result,
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
						
						var linkTitle = ZU.xpathText(article.result,
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
						var pdf = ZU.xpath(article.result,
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
				},
				//restore cookie when the last doGet is done
				function() {
					decrementCounter(doc);
				}
			);
		})(doc, articles[i]);
	}
}

function scrapeCaseResults(doc, cases) {
	for(var i=0, n=cases.length; i<n; i++) {
		var titleString = ZU.xpathText(cases[i].result, './/h3[@class="gs_rt"]')
			|| ZU.xpathText(cases[i].result, './/a[@class="gsc_title_link"]');
		var citeletString = ZU.xpathText(cases[i].result, './/div[@class="gs_a"]')
			|| ZU.xpathText(cases[i].result, './/div[@class="gsc_merged_snippet"]/div[./following-sibling::div]');
		
		if(citeletString) citeletString = ZU.trimInternal(citeletString);
	
		var attachmentFrag = ZU.xpathText(cases[i].result,
			'(.//h3[@class="gs_rt"]/a|.//a[@class="gsc_title_link"])[1]/@href');
		if(attachmentFrag.indexOf('/citations?') != -1) {
			attachmentFrag = null;
			//build attachment link when importing from saved citations
			var caseId = ZU.xpathText(cases[i].result, '(.//div[@class="gs_fl"]\
				/a[contains(@href,"cites=") or contains(@href,"about=")]/@href)[1]');
			if(caseId) caseId = caseId.match(/\b(?:cites|about)=(\d+)/);
			if(caseId) caseId = caseId[1];
			if(caseId) {
				attachmentFrag = 'http://scholar.google.com/scholar_case?'
					+ 'case=' + caseId;
			}
		}
		
		if (attachmentFrag) {
			var attachmentLinks = [attachmentFrag];
		} else {
			var attachmentLinks = [];
		}
	
		// Instantiate item factory with available data
		var factory = new ItemFactory(citeletString, attachmentLinks,
										titleString, cases[i].bibtexUrl);
	
		if (!factory.hasUsefulData()) {
			decrementCounter(doc)
			continue;
		}

		factory.getCourt();
		factory.getVolRepPag();
		if (factory.hasReporter()) {
			// If we win here, we get by without fetching the BibTeX object at all.
			factory.saveItem();
			decrementCounter(doc);
			continue;
		} else {
			//use closure since this is asynchronous
			(function(doc, factory) {
				ZU.doGet(factory.bibtexLink, function(text) {
					//check if the BibTeX file has title
					if(!text.match(/title={{}}/i)) {
						var bibtexTranslator = Zotero.loadTranslator("import");
						//BibTeX
						bibtexTranslator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
						bibtexTranslator.setString(text);
		
						bibtexTranslator.setHandler("itemDone", function(obj, item) {
							item.attachments = factory.getAttachments("Page");
							item.complete();
						});
		
						bibtexTranslator.translate();
					} else {
						// If BibTeX is empty, this is some kind of case, if anything.
						// Metadata from the citelet, supplemented by the target
						// document for the docket number, if possible.
						if (!factory.hasReporter() && factory.attachmentLinks[0]) {
							//fetch docket from the case page
							__result_counter++;
							(function(doc, factory) {
								ZU.processDocuments(factory.attachmentLinks[0], 
									function(doc) {
										factory.getDocketNumber(doc);
										factory.saveItem();
									},
									function() {
										decrementCounter(doc);
									});
							})(doc, factory);
						} else {
							factory.saveItem();
						}
					}
				},
				function() {
					//restore cookie when the last doGet is done
					decrementCounter(doc);
				});
			})(doc, factory);
		}
	}
}

function scrapePatentResults(doc, patents) {
	for(var i=0, n=patents.length; i<n; i++) {
		(function(doc, bibtexUrl, result) {
			ZU.doGet(bibtexUrl, function(text) {
				var bibtexTranslator = Zotero.loadTranslator("import");
				//BibTeX
				bibtexTranslator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
				bibtexTranslator.setString(text);

				bibtexTranslator.setHandler("itemDone", function(obj, item) {
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
					if(!attachmentDone && result) {
						patentUrl = ZU.xpathText(result,
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

				bibtexTranslator.translate();
			},
			function() {
				decrementCounter(doc);
			});
		})(doc, patents[i].bibtexUrl, patents[i].result);

/** Until SOP is "fixed" we'll scrape as much information as we can from the
 * result block instead of using Google Patents translator
		var patentUrl = ZU.xpathText(patents[i].result,
									'.//h3[@class="gs_rt"]/a[1]/@href');

		if(patentUrl) {
			(function(doc, url) {
				ZU.processDocuments(url, function(doc) {
						/**This is broken. Google Patents cannot access doc,
						 * due to SOP.
						 * /
						var translator = Zotero.loadTranslator('web');
						//Google Patents
						translator.setTranslator('d71e9b6d-2baa-44ed-acb4-13fe2fe592c0');
						translator.setDocument(doc);
						translator.translate();
					},
					function() {
						decrementCounter(doc);
					});
			})(doc, patentUrl);
		} else {
			/**TODO: handle patents without links (if those even exist)* /
			decrementCounter(doc);
		}
 */
	}
}


function doWeb(doc, url) {
	var type = detectWeb(doc, url);
	if(type != 'multiple' && url.indexOf('/citations?') != -1) {
		//individual saved citation
		var citationKey = ZU.xpathText(doc,
			'(//div[@id="gsc_md_cont"]/form|//form[@id="gsc_eaf"])[1]\
				/input[@name="s"]/@value'
		);
		if(!citationKey) throw new Error("Could not find citation key");
		
		var data = {
			bibtexUrl: '/citations?view_op=export_citations&hl=en&citilm=1&cit_fmt=0'
				+ '&citation_for_view=' + citationKey
				+ '&s=' + citationKey,
			result: doc.getElementById('gsc_ccl')
		};
		
		switch(type) {
			case 'patent':
				scrapePatentResults(doc, [data]);
			break;
			case 'case':
				scrapeCaseResults(doc, [data]);
			break;
			case 'book':
			case 'journalArticle':
				scrapeArticleResults(doc, [data]);
		}
	} else if(type == 'case') {
		// Invoke the case or the listing scraper, as appropriate.
		// In a listings page, this forces use of bibtex data and English page version
		scrapeCase(doc, url);
	} else {
		/**Having RefWorks set in the preferences as the default citation export
		 * producess export links, which don't work very well with our translator.
		 * Having no citation manager, does not generate export links at all.
		 * We should always be able to build bibtex links from the Related articles
		 * link.
		 */
		var results = getViableResults(doc);

		var items = new Object();
		var resultDivs = new Object();
		var bibtexUrl;
		for(var i=0, n=results.length; i<n; i++) {
			bibtexUrl = ZU.xpathText(results[i],
					'.//div[@class="gs_fl"]/a[contains(@href,"q=info:")\
						or contains(@href,"q=related:")][1]/@href');
			if(bibtexUrl) {
				bibtexUrl = bibtexUrl.replace(/\/scholar.*?\?/,'/scholar.bib?')
					.replace(/=related:/,'=info:')
					+ '&ct=citation&cd=1&output=citation';
			} else {
				Z.debug('Could not find a good link to construct BibTeX URL\n'
					+ 'Creating BibTeX URL from scratch');
				bibtexUrl = ZU.xpathText(results[i],
					'.//div[@class="gs_fl"]/a[contains(@onclick, "gs_ocit(event")]\
						[1]/@onclick');
				var id;
				if(!bibtexUrl
					|| !(id = bibtexUrl.match(/gs_ocit\(event,\s*(['"])([^)]+?)\1/)) ) {
					if(!bibtexUrl) Z.debug('onclick not found');
					throw new Error('Could not build a BibTeX URL');
				}
				
				bibtexUrl = '/scholar.bib?q=info:' + id[2]	
					+ ':scholar.google.com/&ct=citation&cd=1&output=citation';
				Z.debug('Constructed BibTeX URL: ' + bibtexUrl);
			}
			items[bibtexUrl] = ZU.xpathText(results[i], './/h3[@class="gs_rt"]');

			//keep the result div for extra information
			resultDivs[bibtexUrl] = results[i];
		}

		Zotero.selectItems(items, function(selectedItems) {
			if(!selectedItems) return true;

			//different types are handled differently
			var selectedArticles = new Array();
			var selectedCases = new Array();
			var selectedPatents = new Array();
			var selectedBooks = new Array()

			for(var i in selectedItems) {
				/**Global counter so we know when we can finally restore original
				 * cookie.
				 */
				__result_counter++;
				switch(determineType(resultDivs[i])) {
					case 'case':
						selectedCases.push({bibtexUrl: i, result: resultDivs[i]});
						break;
					case 'book':
						selectedBooks.push({bibtexUrl: i, result: resultDivs[i]});
						break;
					case 'patent':
						//patents cannot be supported at this time due to SPO
						selectedPatents.push({bibtexUrl: i, result: resultDivs[i]});
						//__result_counter--;
						break;
					case 'article':
					default:
						selectedArticles.push({bibtexUrl: i, result: resultDivs[i]});
				}
			}

			prepareCookie(doc, function(){
				scrapeAll(doc, {
					articles: selectedArticles,
					cases: selectedCases,
					patents: selectedPatents,
					books: selectedBooks
				});
			});
		});
	}
}

function scrapeAll(doc, selected) {
	scrapeArticleResults(doc, selected.articles);
	scrapeCaseResults(doc, selected.cases);
	scrapePatentResults(doc, selected.patents);
	//for now, handle books the same way as articles, since they are on
	//a different domain
	scrapeArticleResults(doc, selected.books);
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
		var factory = new ItemFactory(refFrag.textContent, [url]);
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

var ItemFactory = function (citeletString, attachmentLinks, titleString, bibtexLink) {
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
	// working strings
	this.citelet = citeletString;
	this.bibtexLink = bibtexLink;
	this.bibtexData = undefined;
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
		this.v.title = ZU.capitalizeTitle(this.v.title.toLowerCase())
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
		this.hyphenSplit = this.citelet.split(/\s+-\s+/);
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
	return this.v.date;
};


ItemFactory.prototype.getCourt = function () {
	var s, m;
	// Citelet parsing, step (2)
	s = this.hyphenSplit.pop().replace(/,\s*$/, "").replace(/\u2026\s*$/, "Court");
	m = s.match(/(?:([a-zA-Z]+):\s*)*(.*)/);
	if (m) {
		this.v.court = m[2].replace(/_/g, " ");
		if (m[1]) {
			this.v.extra = "{:jurisdiction: " + m[1] + "}";
		}
	}
	return this.v.court;
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
	attachments = [];
	for (i = 0, ilen = this.attachmentLinks.length; i < ilen; i += 1) {
		attachments.push({title:"Google Scholar Linked " + doctype, type:"text/html",
							  url:this.attachmentLinks[i]});
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
	}
};


ItemFactory.prototype.saveItemCommonVars = function () {
	for (key in this.v) {
		if (this.v[key]) {
			this.item[key] = this.v[key];
		}
	}
};


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
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Google Scholar Linked Judgement",
						"type": "text/html",
						"url": false
					}
				],
				"volume": "5",
				"reporter": "US",
				"pages": "137",
				"title": "Marbury v. Madison",
				"court": "Supreme Court",
				"date": "1803",
				"itemID": "1",
				"libraryCatalog": "Google Scholar"
			}
		]
	}
]
/** END TEST CASES **/