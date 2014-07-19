{
	"translatorID": "bd2e6136-d8e5-4f76-906b-0fbcd888dd63",
	"label": "RePEc - IDEAS",
	"creator": "Sebastian Karcher",
	"target": "^https?://ideas\\.repec\\.org/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-11-17 16:34:33"
}

/* FW LINE 57:6869c32952b1 */ function flatten(c){var b=new Array();for(var d in c){var e=c[d];if(e instanceof Array){b=b.concat(flatten(e))}else{b.push(e)}}return b}var FW={_scrapers:new Array()};FW._Base=function(){this.callHook=function(b,c,e,a){if(typeof this["hooks"]==="object"){var d=this["hooks"][b];if(typeof d==="function"){d(c,e,a)}}};this.evaluateThing=function(f,e,c){var b=typeof f;if(b==="object"){if(f instanceof Array){var d=this.evaluateThing;var a=f.map(function(g){return d(g,e,c)});return flatten(a)}else{return f.evaluate(e,c)}}else{if(b==="function"){return f(e,c)}else{return f}}}};FW.Scraper=function(a){FW._scrapers.push(new FW._Scraper(a))};FW._Scraper=function(a){for(x in a){this[x]=a[x]}this._singleFieldNames=["abstractNote","applicationNumber","archive","archiveLocation","artworkMedium","artworkSize","assignee","audioFileType","audioRecordingType","billNumber","blogTitle","bookTitle","callNumber","caseName","code","codeNumber","codePages","codeVolume","committee","company","conferenceName","country","court","date","dateDecided","dateEnacted","dictionaryTitle","distributor","docketNumber","documentNumber","DOI","edition","encyclopediaTitle","episodeNumber","extra","filingDate","firstPage","forumTitle","genre","history","institution","interviewMedium","ISBN","ISSN","issue","issueDate","issuingAuthority","journalAbbreviation","label","language","legalStatus","legislativeBody","letterType","libraryCatalog","manuscriptType","mapType","medium","meetingName","nameOfAct","network","number","numberOfVolumes","numPages","pages","patentNumber","place","postType","presentationType","priorityNumbers","proceedingsTitle","programTitle","programmingLanguage","publicLawNumber","publicationTitle","publisher","references","reportNumber","reportType","reporter","reporterVolume","rights","runningTime","scale","section","series","seriesNumber","seriesText","seriesTitle","session","shortTitle","studio","subject","system","thesisType","title","type","university","url","version","videoRecordingType","volume","websiteTitle","websiteType"];this._makeAttachments=function(p,b,g,t){if(g instanceof Array){g.forEach(function(k){this._makeAttachments(p,b,k,t)},this)}else{if(typeof g==="object"){var o=g.urls||g.url;var m=g.types||g.type;var f=g.titles||g.title;var q=g.snapshots||g.snapshot;var j=this.evaluateThing(o,p,b);var n=this.evaluateThing(f,p,b);var s=this.evaluateThing(m,p,b);var d=this.evaluateThing(q,p,b);if(!(j instanceof Array)){j=[j]}for(var l in j){var c=j[l];var h;var e;var r;if(s instanceof Array){h=s[l]}else{h=s}if(n instanceof Array){e=n[l]}else{e=n}if(d instanceof Array){r=d[l]}else{r=d}t.attachments.push({url:c,title:e,type:h,snapshot:r})}}}};if(this.itemTrans!==undefined){this.makeItems=this.itemTrans.makeItems}else{this.makeItems=function(o,b,m,c,l){var q=new Zotero.Item(this.itemType);q.url=b;for(var h in this._singleFieldNames){var n=this._singleFieldNames[h];if(this[n]){var g=this.evaluateThing(this[n],o,b);if(g instanceof Array){q[n]=g[0]}else{q[n]=g}}}var r=["creators","tags"];for(var f in r){var p=r[f];var d=this.evaluateThing(this[p],o,b);if(d){for(var e in d){q[p].push(d[e])}}}this._makeAttachments(o,b,this["attachments"],q);c(q,this,o,b);l([q])}}};FW._Scraper.prototype=new FW._Base;FW.MultiScraper=function(a){FW._scrapers.push(new FW._MultiScraper(a))};FW._MultiScraper=function(a){for(x in a){this[x]=a[x]}this._mkSelectItems=function(e,d){var b=new Object;for(var c in e){b[d[c]]=e[c]}return b};this._selectItems=function(d,c,e){var b=new Array();Zotero.selectItems(this._mkSelectItems(d,c),function(f){for(var g in f){b.push(g)}e(b)})};this._mkAttachments=function(g,d,f){var b=this.evaluateThing(this["attachments"],g,d);var c=new Object();if(b){for(var e in f){c[f[e]]=b[e]}}return c};this._makeChoices=function(f,p,c,d,h){if(f instanceof Array){f.forEach(function(k){this._makeTitlesUrls(k,p,c,d,h)},this)}else{if(typeof f==="object"){var m=f.urls||f.url;var e=f.titles||f.title;var n=this.evaluateThing(m,p,c);var j=this.evaluateThing(e,p,c);var l=(j instanceof Array);if(!(n instanceof Array)){n=[n]}for(var g in n){var b=n[g];var o;if(l){o=j[g]}else{o=j}h.push(b);d.push(o)}}}};this.makeItems=function(j,b,g,c,f){if(this.beforeFilter){var k=this.beforeFilter(j,b);if(k!=b){this.makeItems(j,k,g,c,f);return}}var e=[];var h=[];this._makeChoices(this["choices"],j,b,e,h);var d=this._mkAttachments(j,b,h);this._selectItems(e,h,function(m){if(!m){f([])}else{var l=[];var n=this.itemTrans;Zotero.Utilities.processDocuments(m,function(q){var p=q.documentURI;var o=n;if(o===undefined){o=FW.getScraper(q,p)}if(o===undefined){}else{o.makeItems(q,p,d[p],function(r){l.push(r);c(r,o,q,p)},function(){})}},function(){f(l)})}})}};FW._MultiScraper.prototype=new FW._Base;FW.DelegateTranslator=function(a){return new FW._DelegateTranslator(a)};FW._DelegateTranslator=function(a){for(x in a){this[x]=a[x]}this._translator=Zotero.loadTranslator(this.translatorType);this._translator.setTranslator(this.translatorId);this.makeItems=function(g,d,b,f,c){var e;Zotero.Utilities.HTTP.doGet(d,function(h){this._translator.setHandler("itemDone",function(k,j){e=j;if(b){j.attachments=b}});if(this.preProcess){h=this.preProcess(h)}this._translator.setString(h);this._translator.translate();f(e)},function(){c([e])})}};FW.DelegateTranslator.prototype=new FW._Scraper;FW._StringMagic=function(){this._filters=new Array();this.addFilter=function(a){this._filters.push(a);return this};this.split=function(a){return this.addFilter(function(b){return b.split(a).filter(function(c){return(c!="")})})};this.replace=function(c,b,a){return this.addFilter(function(d){if(d.match(c)){return d.replace(c,b,a)}else{return d}})};this.prepend=function(a){return this.replace(/^/,a)};this.append=function(a){return this.replace(/$/,a)};this.remove=function(b,a){return this.replace(b,"",a)};this.trim=function(){return this.addFilter(function(a){return Zotero.Utilities.trim(a)})};this.trimInternal=function(){return this.addFilter(function(a){return Zotero.Utilities.trimInternal(a)})};this.match=function(a,b){if(!b){b=0}return this.addFilter(function(d){var c=d.match(a);if(c===undefined||c===null){return undefined}else{return c[b]}})};this.cleanAuthor=function(b,a){return this.addFilter(function(c){return Zotero.Utilities.cleanAuthor(c,b,a)})};this.key=function(a){return this.addFilter(function(b){return b[a]})};this.capitalizeTitle=function(){if(arguments.length>0&&arguments[0]==true){return this.addFilter(function(a){return Zotero.Utilities.capitalizeTitle(a,true)})}else{return this.addFilter(function(a){return Zotero.Utilities.capitalizeTitle(a)})}};this.unescapeHTML=function(){return this.addFilter(function(a){return Zotero.Utilities.unescapeHTML(a)})};this.unescape=function(){return this.addFilter(function(a){return unescape(a)})};this._applyFilters=function(c,e){for(i in this._filters){c=flatten(c);c=c.filter(function(a){return((a!==undefined)&&(a!==null))});for(var d=0;d<c.length;d++){try{if((c[d]===undefined)||(c[d]===null)){continue}else{c[d]=this._filters[i](c[d],e)}}catch(b){c[d]=undefined;Zotero.debug("Caught exception "+b+"on filter: "+this._filters[i])}}c=c.filter(function(a){return((a!==undefined)&&(a!==null))})}return flatten(c)}};FW.PageText=function(){return new FW._PageText()};FW._PageText=function(){this._filters=new Array();this.evaluate=function(c){var b=[c.documentElement.innerHTML];b=this._applyFilters(b,c);if(b.length==0){return false}else{return b}}};FW._PageText.prototype=new FW._StringMagic();FW.Url=function(){return new FW._Url()};FW._Url=function(){this._filters=new Array();this.evaluate=function(d,c){var b=[c];b=this._applyFilters(b,d);if(b.length==0){return false}else{return b}}};FW._Url.prototype=new FW._StringMagic();FW.Xpath=function(a){return new FW._Xpath(a)};FW._Xpath=function(a){this._xpath=a;this._filters=new Array();this.text=function(){var b=function(c){if(typeof c==="object"&&c.textContent){return c.textContent}else{return c}};this.addFilter(b);return this};this.sub=function(b){var c=function(f,e){var d=e.evaluate(b,f,null,XPathResult.ANY_TYPE,null);if(d){return d.iterateNext()}else{return undefined}};this.addFilter(c);return this};this.evaluate=function(f){var e=f.evaluate(this._xpath,f,null,XPathResult.ANY_TYPE,null);var d=e.resultType;var c=new Array();if(d==XPathResult.STRING_TYPE){c.push(e.stringValue)}else{if(d==XPathResult.ORDERED_NODE_ITERATOR_TYPE||d==XPathResult.UNORDERED_NODE_ITERATOR_TYPE){var b;while((b=e.iterateNext())){c.push(b)}}}c=this._applyFilters(c,f);if(c.length==0){return false}else{return c}}};FW._Xpath.prototype=new FW._StringMagic();FW.detectWeb=function(e,b){for(var c in FW._scrapers){var d=FW._scrapers[c];var f=d.evaluateThing(d.itemType,e,b);var a=d.evaluateThing(d.detect,e,b);if(a.length>0&&a[0]){return f}}return undefined};FW.getScraper=function(b,a){var c=FW.detectWeb(b,a);return FW._scrapers.filter(function(d){return(d.evaluateThing(d.itemType,b,a)==c)&&(d.evaluateThing(d.detect,b,a))})[0]};FW.doWeb=function(c,a){var b=FW.getScraper(c,a);b.makeItems(c,a,[],function(f,e,g,d){e.callHook("scraperDone",f,g,d);if(!f.title){f.title=""}f.complete()},function(){Zotero.done()});Zotero.wait()};




/*
RePEc Translator
Copyright (C) 2011 Sebastian Karcher

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


function detectWeb(doc, url) { return FW.detectWeb(doc, url); }
function doWeb(doc, url) { return FW.doWeb(doc, url); }

/**Article */
FW.Scraper({
itemType : 'journalArticle',
detect : FW.Xpath('//meta[@name="citation_type" and contains(@content, "article")]|//meta[@name="redif-type" and contains(@content, "article")]'),
title : FW.Xpath('//meta[@name="citation_title"]/@content').text().trim(),
attachments : [{ url: FW.Xpath('//form/input[@type="radio" and contains(@value, ".pdf")]/@value').text().trim(),
  title: "RePEc PDF",
  type: "application/pdf" },
  {url: FW.Url(),
  title: "RePEc Snapshot",
  type: "text/html"},
  ],
creators : FW.Xpath('//meta[@name="citation_authors"]/@content').text().replace(/(;[^A-Za-z0-9]*)$/, "").split(/;/).cleanAuthor("author", true),
date : FW.Xpath('//meta[@name="citation_date"]/@content|//meta[@name="citation_year"]/@content').text(),
issue : FW.Xpath('//meta[@name="citation_issue"]/@content').text(),
volume : FW.Xpath('//meta[@name="citation_volume"]/@content').text(),
pages : FW.Xpath('concat(//meta[@name="citation_firstpage"]/@content, "-", //meta[@name="citation_lastpage"]/@content)').remove(/^-|-$/),
ISSN : FW.Xpath('//meta[@name="citation_issn"]/@content').text(),
abstractNote: FW.Xpath('//meta[@name="citation_abstract"]/@content').text(),
journalAbbreviation : FW.Xpath('//meta[@name="citation_journal_abbrev"]/@content').text(),
DOI : FW.Xpath('//meta[@name="citation_doi"]/@content').text(),
language : FW.Xpath('//meta[@name="DC.Language"]/@content').text(),
tags :  FW.Xpath('//meta[@name="citation_keywords"]/@content').text().split(/;/),
publisher: FW.Xpath('//meta[@name="citation_publisher"]/@content').text(),
publicationTitle : FW.Xpath('//meta[@name="citation_journal_title"]/@content').text(),
place : FW.Xpath('//meta[@name="citation_publication_place"]/@content').text(),

hooks : { "scraperDone": function  (item,doc, url) {
	for (i in item.creators) {
		if (item.creators[i]  && !item.creators[i].firstName) {
	   	item.creators[i]= ZU.cleanAuthor(item.creators[i].lastName, "author")
		}
	}}
}
});


/**Software*/
FW.Scraper({
itemType : 'computerProgram',
detect : FW.Xpath('//meta[contains(@name, "redif-type") and contains(@content, "software")]|//meta[contains(@name, "citation_type") and contains(@content, "software")]'),
title : FW.Xpath('//meta[@name="citation_title"]/@content').text().trim(),
attachments : [{ url: FW.Xpath('//form/input[@type="radio" and contains(@value, ".pdf")]/@value').text().trim(),
  title: "RePEc PDF",
  type: "application/pdf" },
  {url: FW.Url(),
  title: "RePEc Snapshot",
  type: "text/html"},
  ],
//make sure there are no empty authors:
creators : FW.Xpath('//meta[@name="citation_authors"]/@content').text().replace(/(;[^A-Za-z0-9]*)$/, "").split(/;/).cleanAuthor("author", true),
date : FW.Xpath('//meta[@name="citation_publication_date"]/@content|//meta[@name="citation_date"]/@content|//meta[@name="citation_year"]/@content').text(),
pages : FW.Xpath('concat(//meta[@name="citation_firstpage"]/@content, "-", //meta[@name="citation_lastpage"]/@content)').remove(/^-|-$/),
ISBN : FW.Xpath('//meta[@name="citation_issn"]/@content').text(),
abstractNote: FW.Xpath('//meta[@name="citation_abstract"]/@content').text(),
DOI : FW.Xpath('//meta[@name="citation_doi"]/@content').text(),
language : FW.Xpath('//meta[@name="DC.Language"]/@content').text(),
tags :  FW.Xpath('//meta[@name="citation_keywords"]/@content').text().split(/;/),
publisher: FW.Xpath('//meta[@name="citation_publisher"]/@content|//meta[@name="citation_technical_report_institution"]/@content').text(),
place : FW.Xpath('//meta[@name="citation_publication_place"]/@content').text(),
version : FW.Xpath('//meta[@name="citation_software_version"]/@content').text(),
seriesTitle: FW.Xpath('//meta[@name="citation_journal_title"]/@content').text(),

hooks : { "scraperDone": function  (item,doc, url) {
	for (i in item.creators) {
		if (item.creators[i]  && !item.creators[i].firstName) {
	   	item.creators[i]= ZU.cleanAuthor(item.creators[i].lastName, "author")
		}
	}}
}
});

/** Working Papers*/
//they classify everything as citation_journal_title - we don't accept that
//a lot on the site are working papers
FW.Scraper({
itemType : 'report',
detect : FW.Xpath('//meta[@name="citation_type" and contains(@content, "paper")]|//meta[@name="redif-type" and contains(@content, "paper")]|//meta[@name="dc.Type" and contains(@content, "techreport")]|//meta[contains(@name, "technical_report")]|//meta[@name="citation_publisher"]'),
title : FW.Xpath('//meta[@name="citation_title"]/@content').text().trim(),
attachments : [{ url: FW.Xpath('//form/input[@type="radio" and contains(@value, ".pdf")]/@value').text().trim(),
  title: "RePEc PDF",
  type: "application/pdf" },
  {url: FW.Url(),
  title: "RePEc Snapshot",
  type: "text/html"},
  ],
//make sure there are no empty authors:
creators : FW.Xpath('//meta[@name="citation_authors"]/@content').text().replace(/(;[^A-Za-z0-9]*)$/, "").split(/;/).cleanAuthor("author", true),
date : FW.Xpath('//meta[@name="citation_date"]/@content|//meta[@name="citation_year"]/@content').text(),
pages : FW.Xpath('concat(//meta[@name="citation_firstpage"]/@content, "-", //meta[@name="citation_lastpage"]/@content)').remove(/^-|-$/),
ISBN : FW.Xpath('//meta[@name="citation_isbn"]/@content').text(),
abstractNote: FW.Xpath('//meta[@name="citation_abstract"]/@content').text(),
DOI : FW.Xpath('//meta[@name="citation_doi"]/@content').text(),
language : FW.Xpath('//meta[@name="DC.Language"]/@content').text(),
tags :  FW.Xpath('//meta[@name="citation_keywords"]/@content').text().split(/;/),
publisher: FW.Xpath('//meta[@name="citation_publisher"]/@content|//meta[@name="citation_technical_report_institution"]/@content').text(),
numPages : FW.Xpath('//meta[@name="citation_number_of_pages"]/@content').text().remove(/\s\D*/), 
reportNumber: FW.Xpath('//meta[@name="citation_technical_report_number"]/@content').text(),
reportType : FW.Xpath('//meta[@name="citation_journal_title"]/@content|//meta[@name="series"]/@content').text().replace(/apers$/, "aper"),
place : FW.Xpath('//meta[@name="citation_publication_place"]/@content').text(),

hooks : { "scraperDone": function  (item,doc, url) {
	for (i in item.creators) {
		if (item.creators[i]  && !item.creators[i].firstName) {
	   	item.creators[i]= ZU.cleanAuthor(item.creators[i].lastName, "author")
		}
	}}
}
});


//Multi Idea
//searches
FW.MultiScraper({
itemType : 'multiple',
detect : FW.Url().match(/cgi-bin\/htsearch\?/),
choices : {
  titles : FW.Xpath('//dl/dt/a').text().trim(),
  urls : FW.Xpath('//dl/dt/a').key("href")
}
});

//collections
FW.MultiScraper({
itemType : 'multiple',
detect : FW.Xpath('//ul[@class="paperlist"]'),
choices : {
  titles : FW.Xpath('//ul[@class="paperlist"]/li/b/a').text().trim(),
  urls : FW.Xpath('//ul[@class="paperlist"]/li/b/a').key("href")
}
});/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://ideas.repec.org/cgi-bin/htsearch?q=informal+economy",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://ideas.repec.org/c/boc/bocode/s457392.html",
		"items": [
			{
				"itemType": "computerProgram",
				"creators": [
					{
						"firstName": "Sam",
						"lastName": "Schulhofer-Wohl",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"MCMC",
					" Markov Chain Monte Carlo",
					" linear models",
					" posterior distribution",
					" regression",
					" mixed models"
				],
				"seeAlso": [],
				"attachments": [
					{
						"url": false,
						"title": "RePEc PDF",
						"type": "application/pdf"
					},
					{
						"title": "RePEc Snapshot",
						"type": "text/html"
					}
				],
				"url": "http://ideas.repec.org/c/boc/bocode/s457392.html",
				"abstractNote": "This package provides commands for Markov chain Monte Carlo (MCMC) sampling from the posterior distribution of linear models. Two models are provided in this version: a normal linear regression model (the Bayesian equivalent of regress), and a normal linear mixed model (the Bayesian equivalent of xtmixed).",
				"date": "2012/01/05",
				"publisher": "Boston College Department of Economics",
				"seriesTitle": "Statistical Software Components",
				"title": "MCMCLINEAR: Stata module for MCMC sampling of linear models",
				"libraryCatalog": "RePEc - IDEAS",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "MCMCLINEAR"
			}
		]
	},
	{
		"type": "web",
		"url": "http://ideas.repec.org/a/rjr/romjef/vy2003i1p86-97.html#statistics",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Elena",
						"lastName": "Pelinescu",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"informal economy",
					" decent income",
					" taxation"
				],
				"seeAlso": [],
				"attachments": [
					{
						"url": false,
						"title": "RePEc PDF",
						"type": "application/pdf"
					},
					{
						"title": "RePEc Snapshot",
						"type": "text/html"
					}
				],
				"url": "http://ideas.repec.org/a/rjr/romjef/vy2003i1p86-97.html#statistics",
				"abstractNote": "The paper aims to analyze the causes or the motivations of the households’ informal economy activities and to estimate the size of the Romanian informal economy. Using data for Romania, it was found that people perceived high taxes as the main cause of the informal activities. The data suggested that the subsistence motive represented the main reason for the households’ decision to operate in the informal economy. It was found that 36.1% of the interviewed households had incomes from a secondary job in 1996. The size of informal economy appears as different because of the method used for computation.",
				"date": "2003",
				"issue": "1",
				"pages": "86-97",
				"publicationTitle": "Journal for Economic Forecasting",
				"publisher": "Institute for Economic Forecasting",
				"title": "Causes And Size Of Informal Economy In Romania",
				"libraryCatalog": "RePEc - IDEAS",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://ideas.repec.org/p/iza/izadps/dp6212.html",
		"items": [
			{
				"itemType": "report",
				"creators": [
					{
						"firstName": "Asako",
						"lastName": "Ohinata",
						"creatorType": "author"
					},
					{
						"firstName": "Jan C.",
						"lastName": "van Ours",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"immigrant children",
					" peer effects",
					" educational attainment"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "RePEc PDF",
						"type": "application/pdf"
					},
					{
						"title": "RePEc Snapshot",
						"type": "text/html"
					}
				],
				"url": "http://ideas.repec.org/p/iza/izadps/dp6212.html",
				"abstractNote": "In this paper, we analyze how the share of immigrant children in the classroom affects the educational attainment of native Dutch children. Our analysis uses data from various sources, which allow us to characterize educational attainment in terms of reading literacy, mathematical skills and science skills. We do not find strong evidence of negative spill-over effects from immigrant children to native Dutch children. Immigrant children themselves experience negative language spill-over effects from a high share of immigrant children in the classroom but no spill-over effects on maths and science skills.",
				"date": "2011",
				"publisher": "Institute for the Study of Labor (IZA)",
				"reportNumber": "6212",
				"reportType": "IZA Discussion Paper",
				"title": "How Immigrant Children Affect the Academic Achievement of Native Dutch Children",
				"libraryCatalog": "RePEc - IDEAS",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://ideas.repec.org/s/wbk/wbrwps.html",
		"items": "multiple"
	}
]
/** END TEST CASES **/