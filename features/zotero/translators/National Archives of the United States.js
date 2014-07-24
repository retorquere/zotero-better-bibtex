{
	"translatorID": "edfa5803-e331-47db-84d1-db3cf8d6f460",
	"label": "National Archives of the United States",
	"creator": "Adam Powers",
	"target": "^https?://research\\.archives\\.gov",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-01-05 11:42:13"
}

/* FW LINE 57:6869c32952b1 */ function flatten(c){var b=new Array();for(var d in c){var e=c[d];if(e instanceof Array){b=b.concat(flatten(e))}else{b.push(e)}}return b}var FW={_scrapers:new Array()};FW._Base=function(){this.callHook=function(b,c,e,a){if(typeof this["hooks"]==="object"){var d=this["hooks"][b];if(typeof d==="function"){d(c,e,a)}}};this.evaluateThing=function(f,e,c){var b=typeof f;if(b==="object"){if(f instanceof Array){var d=this.evaluateThing;var a=f.map(function(g){return d(g,e,c)});return flatten(a)}else{return f.evaluate(e,c)}}else{if(b==="function"){return f(e,c)}else{return f}}}};FW.Scraper=function(a){FW._scrapers.push(new FW._Scraper(a))};FW._Scraper=function(a){for(x in a){this[x]=a[x]}this._singleFieldNames=["abstractNote","applicationNumber","archive","archiveLocation","artworkMedium","artworkSize","assignee","audioFileType","audioRecordingType","billNumber","blogTitle","bookTitle","callNumber","caseName","code","codeNumber","codePages","codeVolume","committee","company","conferenceName","country","court","date","dateDecided","dateEnacted","dictionaryTitle","distributor","docketNumber","documentNumber","DOI","edition","encyclopediaTitle","episodeNumber","extra","filingDate","firstPage","forumTitle","genre","history","institution","interviewMedium","ISBN","ISSN","issue","issueDate","issuingAuthority","journalAbbreviation","label","language","legalStatus","legislativeBody","letterType","libraryCatalog","manuscriptType","mapType","medium","meetingName","nameOfAct","network","number","numberOfVolumes","numPages","pages","patentNumber","place","postType","presentationType","priorityNumbers","proceedingsTitle","programTitle","programmingLanguage","publicLawNumber","publicationTitle","publisher","references","reportNumber","reportType","reporter","reporterVolume","rights","runningTime","scale","section","series","seriesNumber","seriesText","seriesTitle","session","shortTitle","studio","subject","system","thesisType","title","type","university","url","version","videoRecordingType","volume","websiteTitle","websiteType"];this._makeAttachments=function(p,b,g,t){if(g instanceof Array){g.forEach(function(k){this._makeAttachments(p,b,k,t)},this)}else{if(typeof g==="object"){var o=g.urls||g.url;var m=g.types||g.type;var f=g.titles||g.title;var q=g.snapshots||g.snapshot;var j=this.evaluateThing(o,p,b);var n=this.evaluateThing(f,p,b);var s=this.evaluateThing(m,p,b);var d=this.evaluateThing(q,p,b);if(!(j instanceof Array)){j=[j]}for(var l in j){var c=j[l];var h;var e;var r;if(s instanceof Array){h=s[l]}else{h=s}if(n instanceof Array){e=n[l]}else{e=n}if(d instanceof Array){r=d[l]}else{r=d}t.attachments.push({url:c,title:e,type:h,snapshot:r})}}}};if(this.itemTrans!==undefined){this.makeItems=this.itemTrans.makeItems}else{this.makeItems=function(o,b,m,c,l){var q=new Zotero.Item(this.itemType);q.url=b;for(var h in this._singleFieldNames){var n=this._singleFieldNames[h];if(this[n]){var g=this.evaluateThing(this[n],o,b);if(g instanceof Array){q[n]=g[0]}else{q[n]=g}}}var r=["creators","tags"];for(var f in r){var p=r[f];var d=this.evaluateThing(this[p],o,b);if(d){for(var e in d){q[p].push(d[e])}}}this._makeAttachments(o,b,this["attachments"],q);c(q,this,o,b);l([q])}}};FW._Scraper.prototype=new FW._Base;FW.MultiScraper=function(a){FW._scrapers.push(new FW._MultiScraper(a))};FW._MultiScraper=function(a){for(x in a){this[x]=a[x]}this._mkSelectItems=function(e,d){var b=new Object;for(var c in e){b[d[c]]=e[c]}return b};this._selectItems=function(d,c,e){var b=new Array();Zotero.selectItems(this._mkSelectItems(d,c),function(f){for(var g in f){b.push(g)}e(b)})};this._mkAttachments=function(g,d,f){var b=this.evaluateThing(this["attachments"],g,d);var c=new Object();if(b){for(var e in f){c[f[e]]=b[e]}}return c};this._makeChoices=function(f,p,c,d,h){if(f instanceof Array){f.forEach(function(k){this._makeTitlesUrls(k,p,c,d,h)},this)}else{if(typeof f==="object"){var m=f.urls||f.url;var e=f.titles||f.title;var n=this.evaluateThing(m,p,c);var j=this.evaluateThing(e,p,c);var l=(j instanceof Array);if(!(n instanceof Array)){n=[n]}for(var g in n){var b=n[g];var o;if(l){o=j[g]}else{o=j}h.push(b);d.push(o)}}}};this.makeItems=function(j,b,g,c,f){if(this.beforeFilter){var k=this.beforeFilter(j,b);if(k!=b){this.makeItems(j,k,g,c,f);return}}var e=[];var h=[];this._makeChoices(this["choices"],j,b,e,h);var d=this._mkAttachments(j,b,h);this._selectItems(e,h,function(m){if(!m){f([])}else{var l=[];var n=this.itemTrans;Zotero.Utilities.processDocuments(m,function(q){var p=q.documentURI;var o=n;if(o===undefined){o=FW.getScraper(q,p)}if(o===undefined){}else{o.makeItems(q,p,d[p],function(r){l.push(r);c(r,o,q,p)},function(){})}},function(){f(l)})}})}};FW._MultiScraper.prototype=new FW._Base;FW.DelegateTranslator=function(a){return new FW._DelegateTranslator(a)};FW._DelegateTranslator=function(a){for(x in a){this[x]=a[x]}this._translator=Zotero.loadTranslator(this.translatorType);this._translator.setTranslator(this.translatorId);this.makeItems=function(g,d,b,f,c){var e;Zotero.Utilities.HTTP.doGet(d,function(h){this._translator.setHandler("itemDone",function(k,j){e=j;if(b){j.attachments=b}});if(this.preProcess){h=this.preProcess(h)}this._translator.setString(h);this._translator.translate();f(e)},function(){c([e])})}};FW.DelegateTranslator.prototype=new FW._Scraper;FW._StringMagic=function(){this._filters=new Array();this.addFilter=function(a){this._filters.push(a);return this};this.split=function(a){return this.addFilter(function(b){return b.split(a).filter(function(c){return(c!="")})})};this.replace=function(c,b,a){return this.addFilter(function(d){if(d.match(c)){return d.replace(c,b,a)}else{return d}})};this.prepend=function(a){return this.replace(/^/,a)};this.append=function(a){return this.replace(/$/,a)};this.remove=function(b,a){return this.replace(b,"",a)};this.trim=function(){return this.addFilter(function(a){return Zotero.Utilities.trim(a)})};this.trimInternal=function(){return this.addFilter(function(a){return Zotero.Utilities.trimInternal(a)})};this.match=function(a,b){if(!b){b=0}return this.addFilter(function(d){var c=d.match(a);if(c===undefined||c===null){return undefined}else{return c[b]}})};this.cleanAuthor=function(b,a){return this.addFilter(function(c){return Zotero.Utilities.cleanAuthor(c,b,a)})};this.key=function(a){return this.addFilter(function(b){return b[a]})};this.capitalizeTitle=function(){if(arguments.length>0&&arguments[0]==true){return this.addFilter(function(a){return Zotero.Utilities.capitalizeTitle(a,true)})}else{return this.addFilter(function(a){return Zotero.Utilities.capitalizeTitle(a)})}};this.unescapeHTML=function(){return this.addFilter(function(a){return Zotero.Utilities.unescapeHTML(a)})};this.unescape=function(){return this.addFilter(function(a){return unescape(a)})};this._applyFilters=function(c,e){for(i in this._filters){c=flatten(c);c=c.filter(function(a){return((a!==undefined)&&(a!==null))});for(var d=0;d<c.length;d++){try{if((c[d]===undefined)||(c[d]===null)){continue}else{c[d]=this._filters[i](c[d],e)}}catch(b){c[d]=undefined;Zotero.debug("Caught exception "+b+"on filter: "+this._filters[i])}}c=c.filter(function(a){return((a!==undefined)&&(a!==null))})}return flatten(c)}};FW.PageText=function(){return new FW._PageText()};FW._PageText=function(){this._filters=new Array();this.evaluate=function(c){var b=[c.documentElement.innerHTML];b=this._applyFilters(b,c);if(b.length==0){return false}else{return b}}};FW._PageText.prototype=new FW._StringMagic();FW.Url=function(){return new FW._Url()};FW._Url=function(){this._filters=new Array();this.evaluate=function(d,c){var b=[c];b=this._applyFilters(b,d);if(b.length==0){return false}else{return b}}};FW._Url.prototype=new FW._StringMagic();FW.Xpath=function(a){return new FW._Xpath(a)};FW._Xpath=function(a){this._xpath=a;this._filters=new Array();this.text=function(){var b=function(c){if(typeof c==="object"&&c.textContent){return c.textContent}else{return c}};this.addFilter(b);return this};this.sub=function(b){var c=function(f,e){var d=e.evaluate(b,f,null,XPathResult.ANY_TYPE,null);if(d){return d.iterateNext()}else{return undefined}};this.addFilter(c);return this};this.evaluate=function(f){var e=f.evaluate(this._xpath,f,null,XPathResult.ANY_TYPE,null);var d=e.resultType;var c=new Array();if(d==XPathResult.STRING_TYPE){c.push(e.stringValue)}else{if(d==XPathResult.ORDERED_NODE_ITERATOR_TYPE||d==XPathResult.UNORDERED_NODE_ITERATOR_TYPE){var b;while((b=e.iterateNext())){c.push(b)}}}c=this._applyFilters(c,f);if(c.length==0){return false}else{return c}}};FW._Xpath.prototype=new FW._StringMagic();FW.detectWeb=function(e,b){for(var c in FW._scrapers){var d=FW._scrapers[c];var f=d.evaluateThing(d.itemType,e,b);var a=d.evaluateThing(d.detect,e,b);if(a.length>0&&a[0]){return f}}return undefined};FW.getScraper=function(b,a){var c=FW.detectWeb(b,a);return FW._scrapers.filter(function(d){return(d.evaluateThing(d.itemType,b,a)==c)&&(d.evaluateThing(d.detect,b,a))})[0]};FW.doWeb=function(c,a){var b=FW.getScraper(c,a);b.makeItems(c,a,[],function(f,e,g,d){e.callHook("scraperDone",f,g,d);if(!f.title){f.title=""}f.complete()},function(){Zotero.done()});Zotero.wait()};

function detectWeb(doc, url) { return FW.detectWeb(doc, url); }
function doWeb(doc, url) { return FW.doWeb(doc, url); }

/**
 * development wishlist:
 * multi-scraper for search, series and record groups
 * tests
 * check online availability
 * Assign the Zotero itemType based on the media type of the record (record, letter, manuscript, book, photo (see 296573), video, etc)
 * Presidential Libraries (see 923489)
 * Author instead of Institution (see 923489)
 * Recognize and cite more archives correctly (complete list at: http://www.archives.gov/locations/states.html)
 * 		Currently only DC and College Park are recognized
 * Acronyms for subsequent citings of the same material (per "Citing Records in the National Archives of the United States")
 * 		Maybe that's a job for the citation side of things?
 **/

function build_extra (doc, extra_str, new_str, xpath) {
	var tmp = ZU.xpathText (doc, xpath);
	if (tmp != null) {
		return extra_str + new_str + tmp.trim().replace(/\s+/gm," ") +"\n";
	} else {
		return extra_str;
	}
}

FW.Scraper({
	itemType: "report",
	detect: FW.Url().match("/description/"),
	title: FW.Xpath("//div[@id=\"detailsBar\"]/h1[@class=\"itemTitle\"]/text()").text().trim(),
	// Archive (from NARA contact info)
	archive: FW.Xpath("//div[@class=\"information\"]//dt[contains(text(),\"Copy 1:\")]/following-sibling::dt[contains(text(),\"Contact(s):\")]/following-sibling::dd[1]/ul[@class=\"contacts\"]/li/text()[1]").text().trim(),
	// Archive Location (NARA record group)
	archiveLocation: FW.Xpath("//div[@class=\"information\"]//dt[contains(text(),\"From:\")]/following-sibling::dd[1]//a[contains(text(),\"Record Group\")]/text()|//div[@class=\"information\"]//dt[contains(text(),\"From:\")]/following-sibling::dd[1]//a[contains(text(),\"Collection\")]/text()").text().trim(),
	// Institution (NARA creator; eg - War Department. War Plans Division.)
	institution: FW.Xpath("substring-before(//div[@class=\"information\"]//dt[contains(text(),\"Creator(s):\")]/following-sibling::dd[1]/ul/li[last()]/a/text(),\".\")").text().trimInternal(),
	// Rights (NARA use rights)
	rights: FW.Xpath("//div[@class=\"information\"]//dt[contains(text(),\"Use Restriction(s):\")]/following-sibling::dd[1]/ul/li/text()[1]").text().trim(),
	// Series (NARA series)
	seriesTitle: FW.Xpath("substring-after(//div[@class=\"information\"]//dt[contains(text(),\"From:\")]/following-sibling::dd[1]/ul/li/a/text(),\":\")").text().trim(),
	// Call Number (National Archives ID; eg - "2965734")
	callNumber: FW.Xpath("//div[@class=\"information\"]//dt[contains(text(),\"National Archives Identifier:\")]/../dd[1]/text()").text().trim().prepend("National Archives Identifier "),
	// Date the item was created
	date: FW.Xpath("//div[@class=\"information\"]//dt[contains(text(),\"This item was produced or created:\")]/following-sibling::dd[1]/ul/li/text()").text().trim(),
	// abstract = Scope and Content
	abstractNote: FW.Xpath("//h3[contains(text(),\"Scope & Content\")]/../div/p/text()").text().trim(),
	/**
	 * hook:
	 * 		clean up archive information so that it can be cited correctly
	 * 		create extra field, which contains archive location information and other finding information
	 * 		misc field cleanup
	 **/
	hooks: {scraperDone: function  (item, doc, url) {
		/* cite archive location correctly */
		if (item.archive.match("National Archives at College Park") != null) {
			item.archive = "National Archives at College Park, MD";
		} else if (item.archive.match("National Archives Building") != null) {
			item.archive = "National Archives Building, Washington DC";
		} else if (item.archive.match("(Fort Worth)") != null) {
			item.archive = "National Archives and Records Administration - Southwest Region (Fort Worth)";
		}
		/* TODO: there are plenty more archives that could go into this if-else list */
		/* correct citation style can be found at: 
		 *		http://www.archives.gov/publications/general-info-leaflets/17-citing-records.html */
		
		
		/** add "extra" information for helping find the record at the archive **/
		var extra_str = "";
		/** identifiers **/
		// Former ARC Identifier
		extra_str = build_extra (doc, extra_str, "Former ARC Identifier: ", "//div[@class=\"information\"]//dt[contains(text(),\"Former ARC Identifier:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Local Identifier
		extra_str = build_extra (doc, extra_str, "Local ID: ", "//div[@class=\"information\"]//dt[starts-with(text(),\"Local Identifier:\")]/following-sibling::dd[1]/text()");
		// Former Local Identifier
		extra_str = build_extra (doc, extra_str, "Former Local ID: ", "//div[@class=\"information\"]//dt[contains(text(),\"Former Local Identifier:\")]/following-sibling::dd[1]/text()");
		// MLR / HMS number
		extra_str = build_extra (doc, extra_str, "", "//div[@class=\"information\"]//dt[contains(text(),\"From:\")]/following-sibling::dd[1]/ul/li[contains(text(),\"HMS\")]/text()");
		// HMS/MLR Entry Number
		extra_str = build_extra (doc, extra_str, "HMS/MLR Entry Number: ", "//div[@class=\"information\"]//dt[starts-with(text(),\"HMS/MLR Entry Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Former HMS/MLR Entry Number
		extra_str = build_extra (doc, extra_str, "Former HMS/MLR Entry Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"Former HMS/MLR Entry Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// NAIL Control Number
		extra_str = build_extra (doc, extra_str, "NAIL Control Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"NAIL Control Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Select List Identifier
		extra_str = build_extra (doc, extra_str, "Select List Identifier: ", "//div[@class=\"information\"]//dt[contains(text(),\"Select List Identifier:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// XMIS Number
		extra_str = build_extra (doc, extra_str, "XMIS Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"XMIS Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Other ID
		extra_str = build_extra (doc, extra_str, "Other ID: ", "//div[@class=\"information\"]//dt[contains(text(),\"Other Identifier:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Search ID
		extra_str = build_extra (doc, extra_str, "Search ID: ", "//div[@class=\"information\"]//dt[contains(text(),\"Search Identifier:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Agency-Assigned Identifier
		extra_str = build_extra (doc, extra_str, "Agency-Assigned Identifier(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Agency-Assigned Identifier:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Declassification Project Number
		extra_str = build_extra (doc, extra_str, "Declassification Project Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"Declassification Project Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Government Publication Number
		extra_str = build_extra (doc, extra_str, "Government Publication Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"Government Publication Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Inventory Entry Number
		extra_str = build_extra (doc, extra_str, "Inventory Entry Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"Inventory Entry Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// NUCMC Number
		extra_str = build_extra (doc, extra_str, "NUCMC Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"NUCMC Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Other Finding Aid Identifier
		extra_str = build_extra (doc, extra_str, "Other Finding Aid Identifier: ", "//div[@class=\"information\"]//dt[contains(text(),\"Other Finding Aid Identifier:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Preliminary Checklist Identifier
		extra_str = build_extra (doc, extra_str, "Preliminary Checklist Identifier: ", "//div[@class=\"information\"]//dt[contains(text(),\"Preliminary Checklist Identifier:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// PRESNET Number
		extra_str = build_extra (doc, extra_str, "PRESNET Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"PRESNET Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Ref ID
		extra_str = build_extra (doc, extra_str, "Ref ID: ", "//div[@class=\"information\"]//dt[contains(text(),\"Ref ID:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Agency Disposition Number
		extra_str = build_extra (doc, extra_str, "Agency Disposition Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"Agency Disposition Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// Kennedy Assassination Document ID
		extra_str = build_extra (doc, extra_str, "Kennedy Assassination Document ID: ", "//div[@class=\"information\"]//dt[contains(text(),\"Kennedy Assassination Document ID:\")]/following-sibling::dd[1]/text()[normalize-space()]");
		// FOIA Tracking Number
		extra_str = build_extra (doc, extra_str, "FOIA Tracking Number: ", "//div[@class=\"information\"]//dt[contains(text(),\"FOIA Tracking Number:\")]/following-sibling::dd[1]/text()[normalize-space()]");

		/** Other information **/
		// Microform Publication #'s
		extra_str = build_extra (doc, extra_str, "Microform Publications: ", "//div[@class=\"information\"]//dt[contains(text(),\"Microform Publication(s):\")]/following-sibling::dd[1]/ul/li/text()[normalize-space()]");
		// container #
		extra_str = build_extra (doc, extra_str, "Container ID: ", "//div[@class=\"information\"]//dt[contains(text(),\"Copy 1:\")]/following-sibling::dt[contains(text(),\"Copy 1 Media Information:\")]/following-sibling::dd[1]/ul[@class=\"mediaocc\"]//li/span[contains(text(),\"Container Id:\")]/following-sibling::text()");
		// Size
		extra_str = build_extra (doc, extra_str, "Size: ", "//div[@class=\"information\"]//dt[contains(text(),\"Copy 1:\")]/following-sibling::dt[contains(text(),\"Extent (Size):\")]/following-sibling::dd[1]/text()");
		// level of description (records, series, item, etc)
		extra_str = build_extra (doc, extra_str, "Record Level: ", "//div[@class=\"information\"]//dt[contains(text(),\"Level of Description:\")]/following-sibling::dd[1]/ul/li/text()");
		// types of materials (textual records)
		extra_str = build_extra (doc, extra_str, "Material Type: ", "//div[@class=\"information\"]//dt[contains(text(),\"Type(s) of Archival Materials:\")]/following-sibling::dd[1]/ul/li/text()");
		// Media Type (eg - "paper")
		extra_str = build_extra (doc, extra_str, "Media Type: ", "//div[@class=\"information\"]//dt[contains(text(),\"Copy 1:\")]/following-sibling::dt[contains(text(),\"Copy 1 Media Information:\")]/following-sibling::dd[1]/ul[@class=\"mediaocc\"]/li/span[contains(text(),\"Specific Media Type:\")]/following-sibling::text()");
		// Alternate title(s)
		extra_str = build_extra (doc, extra_str, "Alternate Title(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Other Title(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// General Note
		extra_str = build_extra (doc, extra_str, "General Note: ", "//div[@class=\"information\"]//dt[contains(text(),\"General Note(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// Full institution name (eg - "War Department. War Plans Divsion. (2/9/1918 - 3/23/1942)")
		extra_str = build_extra (doc, extra_str, "Institution: ", "//div[@class=\"information\"]//dt[contains(text(),\"Creator(s):\")]/following-sibling::dd[1]/ul/li/a/text()");
		// Online Resources
		extra_str = build_extra (doc, extra_str, "Online Resources: ", "//div[@class=\"information\"]//dt[contains(text(),\"Online Resource(s):\")]/following-sibling::dd[1]/ul/li/text()[normalize-space()]");
		// Subjects Represented
		extra_str = build_extra (doc, extra_str, "Subjects: ", "//div[@class=\"information\"]//dt[contains(text(),\"Subjects Represented in the Archival Material(s):\")]/following-sibling::dd[1]/ul/li/a/text()");
		// Date the materials were compiled
		extra_str = build_extra (doc, extra_str, "Date Compiled: ", "//div[@class=\"information\"]//dt[contains(text(),\"The creator compiled or maintained the series between:\")]/following-sibling::dd[1]/text()");
		// Date Note
		extra_str = build_extra (doc, extra_str, "Date Note: ", "//div[@class=\"information\"]//dt[contains(text(),\"Date Note:\")]/following-sibling::dd[1]/text()");
		// Files document the period XXXX - YYYY
		extra_str = build_extra (doc, extra_str, "Documented Period: ", "//div[@class=\"information\"]//dt[contains(text(),\"The file documents the time period:\")]/following-sibling::dd[1]/text()");
		// Documented Period
		extra_str = build_extra (doc, extra_str, "Documented Period: ", "//div[@class=\"information\"]//dt[contains(text(),\"This item documents the time period:\")]/following-sibling::dd[1]/text()");
		// Accession Number(s)
		extra_str = build_extra (doc, extra_str, "Accession Number(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Accession Number(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// Disposition Authority Number(s)
		extra_str = build_extra (doc, extra_str, "Disposition Authority Number(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Disposition Authority Number(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// Records Center Transfer Number(s)
		extra_str = build_extra (doc, extra_str, "Records Center Transfer Number(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Records Center Transfer Number(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// Internal Transfer Number(s)
		extra_str = build_extra (doc, extra_str, "Internal Transfer Number(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Internal Transfer Number(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// Language(s)
		extra_str = build_extra (doc, extra_str, "Language(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Language(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// Transfer Information
		extra_str = build_extra (doc, extra_str, "Transfer Information: ", "//div[@class=\"information\"]//dt[contains(text(),\"Transfer Information:\")]/following-sibling::dd[1]//text()");
		// Custodial History
		extra_str = build_extra (doc, extra_str, "Custodial History: ", "//div[@class=\"information\"]//dt[contains(text(),\"Custodial History:\")]/following-sibling::dd[1]//text()");
		// Scale Note
		extra_str = build_extra (doc, extra_str, "Scale Note: ", "//div[@class=\"information\"]//dt[contains(text(),\"Scale Note:\")]/following-sibling::dd[1]//text()");
		// Copyright Date
		extra_str = build_extra (doc, extra_str, "Copyright Date: ", "//div[@class=\"information\"]//dt[contains(text(),\"This item's copyright was established:\")]/following-sibling::dd[1]/ul/li/text()");
		// Contributor(s)
		extra_str = build_extra (doc, extra_str, "Contributor(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Contributors to Authorship and/or Production of the Archival Material(s):\")]/following-sibling::dd[1]/ul/li/a/text()");
		// Former Record Groups
		extra_str = build_extra (doc, extra_str, "Former Record Group(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Former Record Group(s):\")]/following-sibling::dd[1]/ul/li/text()");
		// Former Collections
		extra_str = build_extra (doc, extra_str, "Former Collection(s): ", "//div[@class=\"information\"]//dt[contains(text(),\"Former Collections(s):\")]/following-sibling::dd[1]/ul/li/text()");

		item.notes.push(extra_str);
		
		
		/** other clean-up **/
		// Reverse "Record Group" listing
		var rg = item.archiveLocation.split(":", 2);
		item.archiveLocation = rg[1].trim() + ", " + rg[0].trim();
	}}
});


/** Test URLs **/
//http://research.archives.gov/description/268296
//http://research.archives.gov/description/531201
//http://research.archives.gov/description/651639
//http://research.archives.gov/description/299807
//http://research.archives.gov/description/299874
//http://research.archives.gov/description/595102
//http://research.archives.gov/description/305167
//http://research.archives.gov/description/628966
//http://research.archives.gov/description/305167
//http://research.archives.gov/description/595449
//http://research.archives.gov/description/1923129
//http://research.archives.gov/description/305059
//http://research.archives.gov/description/2050937
//http://research.archives.gov/description/201293
//http://research.archives.gov/description/306687
//http://research.archives.gov/description/4688052
//http://research.archives.gov/description/160264
//http://research.archives.gov/description/5171392
//http://research.archives.gov/description/305171
//http://research.archives.gov/description/594759
//http://research.archives.gov/description/5822974
//http://research.archives.gov/description/638460
//http://research.archives.gov/description/2630932/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://research.archives.gov/description/651639",
		"items": [
			{
				"itemType": "report",
				"creators": [],
				"notes": [
					"XMIS Number: 007381, This is the State Questionnaire (E1) data file., 007382, This is the District Main Questionnaire (E2), Parts 1-6 data file., 007383, This is the District Instructional Area Supplement Questionnaire (E2S) data file., 007384, This is the Principal Main Questionnaire (E3) data file., 007385, This is the Principal Supplement Questionnaire (E3S) data file., 007386, This is the Provider Main Questionnaire (E4) data file., 007387, This is the Provider Supplement Questionnaire (E4S) data file., 007388, This is the Teacher Main Questionnaire Homeroom Sample (E5) data file., 007389, This is the Teacher Supplement Questionnaire Homeroom Sample (E5S) data file., 007390, This is the Classroom Roster Sheet (E5ROSTER) data file., 007391, This is the District Information Booklets 1 and 2 (E6) data file., 007392, This is the School Information Booklet Number 8 (E9) data file., 007393, This is the Parent Advisory Council Interview (E11) data file., 007442, This is the State Questionnaire (E1) codebook file., 007443, This is the District Main Questionnaire (E2), Part 1 codebook file., 007444, This is the District Main Questionnaire (E2), Part 2 codebook file., 007445, This is the District Main Questionnaire (E2), Part 3 codebook file., 007446, This is the District Main Questionnaire (E2), Part 4 codebook file., 007447, This is the District Main Questionnaire (E2), Part 5 codebook file., 007448, This is the District Main Questionnaire (E2), Part 6 codebook file., 007449, This is the District Instructional Area Supplement Questionnaire (E2S) codebook file., 007450, This is the Principal Main Questionnaire (E3) codebook file., 007451, This is the Principal Supplement Questionnaire (E3S) codebook file., 007452, This is the Provider Main Questionnaire (E4) codebook file., 007453, This is the Provider Supplement Questionnaire (E4S) codebook file., 007454, This is the Teacher Main Questionnaire Homeroom Sample (E5) codebook file., 007455, This is the Teacher Supplement Questionnaire Homeroom Sample (E5S) codebook file., 007456, This is the Classroom Roster Sheet (E5ROSTER) codebook file., 007457, This is the District Information Booklets 1 and 2 (E6) codebook file., 007458, This is a codebook file., 007459, This is the School Information Booklet Number 8 (E9) codebook file., 007460, This is the Parent Advisory Council Interview (E11) codebook file., 007461, This is a codebook file.\nSize: 13 data files and 20 electronic documentation files\nRecord Level: File Unit\nMaterial Type: Data Files\nMedia Type: Magnetic Tape Cartridge\nInstitution: Department of Health, Education, and Welfare. Office of Education. National Institute of Education. (06/23/1972 - 05/04/1980)\nDate Compiled: 1975 - 1980\nDate Note: These files have data compiled by the National Opinion Research Center, Policy Research Corporation, and the Stanford Research Institute between 1975 and 1976.\nDocumented Period: 1975 - 1976\nContributor(s): National Opinion Research Center, Compiler, Policy Research Corporation., Compiler, Stanford Research Institute., Compiler\n"
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"url": "http://research.archives.gov/description/651639",
				"abstractNote": "These files contain data identifying Compensatory Education Programs in operation, with data for states, school districts, schools, principals, teachers, and parents.  The data contains information on expenditures, funding sources, extent of services, student selection processes, teacher background, and progress evaluation.",
				"archive": "National Archives at College Park, MD",
				"archiveLocation": "Records of the National Institute of Education, 1960 - 1980, Record Group 419",
				"callNumber": "National Archives Identifier 651639",
				"institution": "Department of Health, Education, and Welfare",
				"rights": "Unrestricted",
				"seriesTitle": "Compensatory Education Study Files, compiled 1975 - 1980, documenting the period 1970 - 1977",
				"title": "National Survey Files,   1975 - 1976",
				"libraryCatalog": "National Archives of the United States",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://research.archives.gov/description/7062935",
		"items": [
			{
				"itemType": "report",
				"creators": [],
				"notes": [
					"HMS/MLR Entry Number: A1 313\nDeclassification Project Number: NND 775051, NND 775119\nContainer ID: Boxes 1-2183\nSize: 954 linear feet, 7 linear inches\nRecord Level: Series\nMaterial Type: Textual Records\nMedia Type: Paper\nInstitution: Department of Defense. European Command. Office of Military Government for Germany (U.S.). Civil Administration Division. Public Safety Branch. (03/15/1947 - 09/21/1949)\nDate Compiled: 1945 - 1948\n"
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"url": "http://research.archives.gov/description/7062935",
				"abstractNote": "This series consists of fragebogen case files.  These files might contain the original fragebogen (usually in German), a fragebogen worksheet, a Special Branch investigation report, a report on the subject and respondent's tribunal decision, and affidavits on behalf of the subject.  The records were maintained by the Public Safety Branch.",
				"archive": "National Archives at College Park, MD",
				"archiveLocation": "Records of U.S. Occupation Headquarters, World War II, 1923 - 1972, Record Group 260",
				"callNumber": "National Archives Identifier 7062935",
				"institution": "Department of Defense",
				"rights": "Unrestricted",
				"title": "Fragebogen Files Relating to Denazification,   1945 - 1948",
				"libraryCatalog": "National Archives of the United States"
			}
		]
	}
]
/** END TEST CASES **/