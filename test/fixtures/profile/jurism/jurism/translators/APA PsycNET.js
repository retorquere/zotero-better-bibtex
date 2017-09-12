{
	"translatorID": "1e1e35be-6264-45a0-ad2e-7212040eb984",
	"label": "APA PsycNET",
	"creator": "Michael Berkowitz and Aurimas Vinckevicius",
	"target": "^https?://psycnet\\.apa\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-08-12 13:07:14"
}

function detectWeb(doc, url) {
	var type;
	url = url.toLowerCase();
	if (url.indexOf('search.searchresults') != -1) {
	//permission error (still relevant?)
	//return false;
		return "multiple";
	}

	if(url.indexOf('search.displayrecord') != -1) {
		type = doc.getElementById('rdcPubType');
		if(!type) return false;
		type = type.textContent.replace(/[\s\[\]]/g,'').split(';');
		switch(type[0].toLowerCase()) {
			case 'book':
				return 'book';
			case 'chapter':
				return 'bookSection';
			case 'journalarticle':
			case 'editorial':
				return 'journalArticle';
			default:
				return false;
		}
	}

	if(url.search(/journals\/\S+\/\d+\/\d+\/\d+\//) != -1) {
		return "journalArticle";
	}

	if(url.search(/\/books\/\d+/) != -1) {
		var pubType = doc.getElementById('rdcPubType');
		if (pubType && pubType.textContent.indexOf('Chapter') != -1) {
			return "bookSection";
		}
		
		fields.title = '(//h3[@id="bwcBookTitle"])[1]';
		fields.authors = '(//div[@id="bwcBookAuthors"])[1]';
		fields.voliss = '(//div[@id="bwcBookSource"])[1]';
		fields.abstract = '(//div[@id="bwcAbstract"])[1]';

		return "book";
	}

	if(url.indexOf('buy.optiontobuy') != -1
		&& url.indexOf('id=') != -1
		&& (type = doc.getElementById('obArticleHeaderText')) ) {
		fields.title = '(//div[@id="obArticleTitleHighlighted"])[1]';
		fields.authors = '(//div[@id="obAuthor"])[1]';
		fields.voliss = '(//div[@id="obSource"])[1]';
		fields.abstract = '(//div[@id="obAbstract"])[1]';

		if(type.textContent.toLowerCase().indexOf('article') != -1) {
			return 'journalArticle';
		}

		if(type.textContent.toLowerCase().indexOf('chapter') != -1) {
			return 'bookSection';
		}
	}

	/**for the book database - item IDs ending in 000 are books
	 * everything else chapters
	 */
	if (url.search(/psycinfo\/[0-9]{4}-[0-9]+-000/) != -1){
		return "book";
	}

	if (url.search(/psycinfo\/[0-9]{4}-[0-9]+-[0-9]{3}/) != -1){
		return "bookSection";
	}
}

//default field xpath
var fields = {
	title: '(//div[@id="rdcTitle"])[1]',
	authors: '(//div[@id="rdcAuthors"])[1]',
	voliss: '(//div[@id="rdcSource"])[1]',
	abstract: '//div[@id="rdRecord"]/div[@class="rdRecordSection"][2]'
}

function getField(field, doc) {
	var val = ZU.xpathText(doc, field);
	if(val) val = ZU.trimInternal(val);
	return val;
}

//for scraping publication information directly from pages
var volissRe = {
	journalArticle: 
		/^(.+?)(?:,\sVol\s(\d+)\((\d+)\))?,\s(\w+\s(?:\d+\s*,\s)?\d{4}),\s(?:(\d+-\d+)|No Pagination Specified).(?:\sdoi:\s(.+))?$/i,
	bookSection:
		/^(.+?),\s\((\d{4})\)\.\s(.+?),\s\(pp\.\s(\d+-\d+)\)\.\s(.+?):\s(.+?),\s(?:(\w+))?,\s(\d+)\spp\.(?:\sdoi:\s(.+))?/i,
	book:
		/^(.+?):\s(.+?)(?:\.\s\((\d{4})\)\.\s(\w+)\s(\d+)\spp\.\sdoi:\s(.+))?$/i
};

var creatorMap = {
	Ed: 'editor'
};

function doWeb(doc, url) {
	var type = detectWeb(doc, url);
	if (type == "multiple") {
		var items = new Object();
		var titles = ZU.xpath(doc, '//div[@class="srhcTitle"]/a');
		for(var i=0, n=titles.length; i<n; i++) {
			items[titles[i].href] = titles[i].textContent;
		}
		Zotero.selectItems(items, function(selectedItems) {
			if(!selectedItems) return true;
	
			var arts = new Array();
			for(var i in selectedItems) {
				arts.push(i);
			}
			ZU.processDocuments(arts, scrape);
		});
	} else {
		scrape(doc, url, type);
	}
}

//try to figure out ids that we can use for fetching RIS
function getIds(doc, url) {
	var ret = {}
	ret.id = ZU.xpathText(doc, '(//input[@name="id"])[1]/@value') || '';
	ret.lstUID = ZU.xpathText(doc,
			'(//input[@name="lstUIDs"][@id="srhLstUIDs"])[1]/@value');
	if(ret.id || ret.lstUID) return ret;

	url = url.toLowerCase();
	/**on the /book/\d+ pages, we can find the UID in
	 * the Front matter and Back matter links
	 */
	if(url.search(/\/books\/\d+/) != -1) {
		var links = ZU.xpath(doc,
			'//a[@target="_blank" and contains(@href,"&id=")]');
		var m;
		for(var i=0, n=links.length; i<n; i++) {
			m = links[i].href.match(/\bid=([^&]+?)-(?:FRM|BKM)/i);
			if(m && m[1]) {
				ret.lstUID = m[1];
				return ret;
			}
		}
	}

	/**for pages with buy.optionToBuy
	 * we can fetch the id from the url
	 * alternatively, the id is in a javascript section (this is messy)
	 */
	if(url.indexOf('buy.optiontobuy') != -1) {
		var m = url.match(/\bid=([^&]+)/);
		if(m) {
			ret.lstUID = m[1];
			return ret;
		}

		m = doc.documentElement.textContent.match(/\bitemUID\s*=\s*(['"])(.*?)\1/);
		if(m && m[2]) {
			ret.lstUID = m[2];
			return ret;
		}
	}
}

//retrieve RIS data
//retry n times
function fetchRIS(url, post, itemType, doc, retry) {
	//language only available on the page;
	var language = ZU.xpathText(doc, '//meta[@name="citation_language"]/@content');
	ZU.doPost(url, post, function(text) {
		//There's some cookie/session magic going on
		//our first request for RIS might not succeed
		var foundRIS = (text.indexOf('TY  - ') != -1);
		if(!foundRIS && retry) {
			//retry
			Z.debug('No RIS data. Retrying (' + retry + ').');
			fetchRIS(url, post, itemType, doc, --retry);
			return;
		} else if(!foundRIS) {
			Z.debug('No RIS data. Falling back to scraping the page directly.');
			scrapePage(doc, itemType);
			return;
		}
		
		//clean up (double) spacing in RIS
		text = text.replace(/  +/g, ' ');
		//Z.debug(text)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");

		//Some authors are not entered according to spec
		//We try to fix places where multiple authors are entered in one entry
		text = text.replace(/^((?:A[U123]|ED) - )(.+?)$/mg,
			function(match, tag, authors) {
				var authorRE = /((?:[A-Z](?:\.?\s|\.))+)([-A-Za-z]+)/g;
				var author, newStr='';
				while(author = authorRE.exec(authors)) {
					if(newStr) {	//not the first author
						newStr += '\r\n';
					}

					newStr += tag + author[2] + ', ' + author[1].trim();
				}

				if(newStr) {
					return newStr;
				} else {	//we didn't find any authors
					return match;
				}
			}
		);
			
		text = text.replace(/^DESCRIPTORS -.+/gm, "");
		
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			//item.url = newurl;
			
			item.title = item.title.replace(/\.$/,'');
			if (item.ISSN) {
				var ISSN = item.ISSN.split(/\s*;\s*/);
				var ISSNArray = [];
				for (var i=0; i<ISSN.length; i++) {
					ISSNArray.push(ZU.cleanISSN(ISSN[i]));
				}
				item.ISSN = ISSNArray.join(" ");
				item.language = language;
			}
			finalizeItem(item, doc);		
		});
		translator.translate();
	});
}

//scrape directly from page
function scrapePage(doc, type) {
	Z.debug('Attempting to scrape directly from page');
	var item = new Zotero.Item(type);
	item.title = getField(fields.title, doc);
	if(!item.title) item.title = getField('obArticleTitleHighlighted', doc);
	if(!item.title) item.title = getField('bwcBookTitle', doc);

	var authors = getField(fields.authors, doc);
	if(authors) {
		authors = authors.replace(/^by\s+/i, '').split(/\s*;\s+/);
		var m, creatorType, name;
		for(var i=0, n=authors.length; i<n; i++) {
			m = authors[i].match(/^(.+?)\s?\((\w+)\)$/);
			if(m) {
				creatorType = creatorMap[m[2]];
				name = m[1];
			} else {
				creatorType = 'author';
				name = authors[i];
			}
			item.creators.push(ZU.cleanAuthor(name, creatorType, true));
		}
	}

	var voliss = getField(fields.voliss, doc);
	if(voliss
		&& (voliss = voliss.match(volissRe[type]))) {
		switch(type) {
			case 'journalArticle':
				item.publicationTitle = voliss[1];
				item.volume = voliss[2];
				item.issue = voliss[3];
				item.date = voliss[4];
				item.pages = voliss[5];
				item.DOI = voliss[6];
			break;
			case 'bookSection':
				var eds = voliss[1].split(/\s*;\s*/);
				var m, name, creatorType;
				for(var i=0, n=eds.length; i<n; i++) {
					m = eds[i].match(/^(.+?)(?:\s\((\w+)\))?$/);
					if(m) {
						creatorType = creatorMap[m[2]] || 'editor';
						item.creators.push(
							ZU.cleanAuthor(m[1], creatorType, true)
						);
					}
				}
				item.date = voliss[2];
				item.bookTitle = voliss[3];
				item.pages = voliss[4];
				item.place = voliss[5];
				item.publisher = voliss[6];
				item.volume = voliss[7];
				item.numPages = voliss[8];
				item.DOI = voliss[9];
			break;
			case 'book':
				item.place = voliss[1];
				item.publisher = voliss[2];
				item.date = voliss[3];
				item.volume = voliss[4];
				item.numPages = voliss[5];
				item.DOI = voliss[6];
			break;
		}
	}

	item.abstractNote = getField(fields.abstract, doc);

	finalizeItem(item, doc);
}

function finalizeItem(item, doc) {

	var pdfurl = ZU.xpathText(doc, '//meta[@name="citation_pdf_url"]/@content');
	if (!pdfurl) pdfurl = ZU.xpathText(doc, '//li[contains(@class, "PDF") and contains(@href, ".pdf")]/@href');
	//clean up abstract and get copyright info
	if(item.abstractNote) {
		var m = item.abstractNote.match(/^(.+)\([^)]+(\(c\)[^)]+)\)$/i);
		if(m) {
			item.abstractNote = m[1];
			item.rights = m[2];
		}
	}

	//for books, volume is in the same field as numPages
	if(item.itemType == 'book' && item.numPages) {
		var m = item.numPages.match(/^(\w+)\s*,\s*(\d+)$/);
		if(m) {
			item.volume = m[1];
			item.numPages = m[2];
		}
	}
	if (pdfurl) item.attachments =[{url: pdfurl, title: "APA Psycnet Fulltext PDF", mimeType: "application/pdf"}]
	else item.attachments = [{title:"APA PsycNET Snapshot",	document:doc}] 
	
	item.complete();
}

function scrape (doc, newurl, type) {
	if(!type) type = detectWeb(doc, newurl);
	var ids = getIds(doc, newurl);
	var id = ids.id;
	var lstUID = ids.lstUID;
	if (id || lstUID) {
		var url = '/index.cfm?fa=search.export'
		var post = 'id=' + id + '&lstUIDs=' + lstUID
			+ '&records=records&exportFormat=referenceSoftware';
		Zotero.debug("Url: " + url);
		Zotero.debug("Post: " + post);
		fetchRIS(url, post, type, doc, 1);
	} else {
		scrapePage(doc, type);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://psycnet.apa.org/index.cfm?fa=search.displayRecord&uid=2004-16644-010",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Neuropsychology of Adults With Attention-Deficit/Hyperactivity Disorder: A Meta-Analytic Review",
				"creators": [
					{
						"lastName": "Hervey",
						"firstName": "Aaron S.",
						"creatorType": "author"
					},
					{
						"lastName": "Epstein",
						"firstName": "Jeffery N.",
						"creatorType": "author"
					},
					{
						"lastName": "Curry",
						"firstName": "John F.",
						"creatorType": "author"
					}
				],
				"date": "2004",
				"DOI": "10.1037/0894-4105.18.3.485",
				"ISSN": "1931-1559 0894-4105",
				"abstractNote": "A comprehensive, empirically based review of the published studies addressing neuropsychological performance in adults diagnosed with attention-deficit/hyperactivity disorder (ADHD) was conducted to identify patterns of performance deficits. Findings from 33 published studies were submitted to a meta-analytic procedure producing sample-size-weighted mean effect sizes across test measures. Results suggest that neuropsychological deficits are expressed in adults with ADHD across multiple domains of functioning, with notable impairments in attention, behavioral inhibition, and memory, whereas normal performance is noted in simple reaction time. Theoretical and developmental considerations are discussed, including the role of behavioral inhibition and working memory impairment. Future directions for research based on these findings are highlighted, including further exploration of specific impairments and an emphasis on particular tests and testing conditions.",
				"issue": "3",
				"language": "English",
				"libraryCatalog": "APA PsycNET",
				"pages": "485-503",
				"publicationTitle": "Neuropsychology",
				"rights": "(c) 2016 APA, all rights reserved",
				"shortTitle": "Neuropsychology of Adults With Attention-Deficit/Hyperactivity Disorder",
				"volume": "18",
				"attachments": [
					{
						"title": "APA Psycnet Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"*Attention Deficit Disorder with Hyperactivity",
					"*Experimentation",
					"*Neuropsychological Assessment",
					"*Neuropsychology",
					"Behavioral Inhibition",
					"Empirical Methods",
					"Hyperkinesis",
					"Inhibition (Personality)",
					"Reaction Time"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://psycnet.apa.org/journals/xge/50/5/325/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Factor analysis of meaning",
				"creators": [
					{
						"lastName": "Osgood",
						"firstName": "Charles E.",
						"creatorType": "author"
					},
					{
						"lastName": "Suci",
						"firstName": "George J.",
						"creatorType": "author"
					}
				],
				"date": "1955",
				"DOI": "10.1037/h0043965",
				"ISSN": "0022-1015",
				"abstractNote": "Two factor analytic studies of meaningful judgments based upon the same sample of 50 bipolar descriptive scales are reported. Both analyses reveal three major connotative factors: evaluation, potency, and activity. These factors appear to be independent dimensions of the semantic space within which the meanings of concepts may be specified.",
				"issue": "5",
				"language": "English",
				"libraryCatalog": "APA PsycNET",
				"pages": "325-338",
				"publicationTitle": "Journal of Experimental Psychology",
				"rights": "(c) 2016 APA, all rights reserved",
				"volume": "50",
				"attachments": [
					{
						"title": "APA Psycnet Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"*Factor Analysis",
					"*Judgment",
					"*Semantics",
					"Factor Structure",
					"Meaning"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://psycnet.apa.org/psycinfo/1992-98221-010",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Catatonia: Tonic immobility: Evolutionary underpinnings of human catalepsy and catatonia",
				"creators": [
					{
						"lastName": "Gallup Jr.",
						"firstName": "Gordon G.",
						"creatorType": "author"
					},
					{
						"lastName": "Maser",
						"firstName": "Jack D.",
						"creatorType": "author"
					},
					{
						"lastName": "Maser",
						"firstName": "J. D.",
						"creatorType": "editor"
					},
					{
						"lastName": "Seligman",
						"firstName": "M. E. P.",
						"creatorType": "editor"
					}
				],
				"date": "1977",
				"ISBN": "9780716703686 9780716703679",
				"abstractNote": "tonic immobility [animal hypnosis] might be a useful laboratory analog or research model for catatonia / we have been collaborating on an interdisciplinary program of research in an effort to pinpoint the behavioral antecedents and biological bases for tonic immobility / attempt to briefly summarize our findings, and . . . discuss the implications of these data in terms of the model characteristics of tonic immobility / hypnosis / catatonia, catalepsy, and cataplexy / tonic immobility as a model for catatonia / fear potentiation / fear alleviation / fear or arousal / learned helplessness / neurological correlates / pharmacology and neurochemistry / genetic underpinnings / evolutionary considerations / implications for human psychopathology",
				"bookTitle": "Psychopathology: Experimental models",
				"libraryCatalog": "APA PsycNET",
				"pages": "334-357",
				"place": "New York, NY, US",
				"publisher": "W H Freeman/Times Books/ Henry Holt & Co",
				"rights": "(c) 2016 APA, all rights reserved",
				"series": "A series of books in psychology.",
				"shortTitle": "Catatonia",
				"attachments": [
					{
						"title": "APA PsycNET Snapshot"
					}
				],
				"tags": [
					"*Catalepsy",
					"*Catatonia",
					"*Tonic Immobility",
					"Animal Models",
					"Fear",
					"Genetics",
					"Neurology",
					"Pharmacology"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://psycnet.apa.org/psycinfo/2004-16329-000/",
		"items": [
			{
				"itemType": "book",
				"title": "The abnormal personality: A textbook",
				"creators": [
					{
						"lastName": "White",
						"firstName": "Robert W.",
						"creatorType": "author"
					}
				],
				"date": "1948",
				"abstractNote": "The author's intent is to write about abnormal people in a way that will be valuable and interesting to students new to the subject. A first course in abnormal psychology is not intended to train specialists. Its goal is more general: it should provide the student with the opportunity to whet his interest, expand his horizons, register a certain body of new facts, and relate this to the rest of his knowledge about mankind. I have tried to present the subject in such a way as to emphasize its usefulness to all students of human nature. I have tried the experiment of writing two introductory chapters, one historical and the other clinical. This reflects my desire to set the subject-matter in a broad perspective and at the same time to anchor it in concrete fact. Next comes a block of six chapters designed to set forth the topics of maladjustment and neurosis. The two chapters on psychotherapy complete the more purely psychological or developmental part of the work. In the final chapter the problem of disordered personalities is allowed to expand to its full social dimensions. Treatment, care, and prevention call for social effort and social organization. I have sought to show some of the lines, both professional and nonprofessional, along which this effort can be expended.",
				"libraryCatalog": "APA PsycNET",
				"numPages": "617",
				"place": "New York, NY, US",
				"publisher": "Ronald Press Company",
				"rights": "(c) 2016 APA, all rights reserved",
				"shortTitle": "The abnormal personality",
				"volume": "x",
				"attachments": [
					{
						"title": "APA Psycnet Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Abnormal Psychology"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://psycnet.apa.org/books/10023",
		"items": [
			{
				"itemType": "book",
				"title": "The abnormal personality: A textbook",
				"creators": [
					{
						"lastName": "White",
						"firstName": "Robert W.",
						"creatorType": "author"
					}
				],
				"date": "1948",
				"abstractNote": "The author's intent is to write about abnormal people in a way that will be valuable and interesting to students new to the subject. A first course in abnormal psychology is not intended to train specialists. Its goal is more general: it should provide the student with the opportunity to whet his interest, expand his horizons, register a certain body of new facts, and relate this to the rest of his knowledge about mankind. I have tried to present the subject in such a way as to emphasize its usefulness to all students of human nature. I have tried the experiment of writing two introductory chapters, one historical and the other clinical. This reflects my desire to set the subject-matter in a broad perspective and at the same time to anchor it in concrete fact. Next comes a block of six chapters designed to set forth the topics of maladjustment and neurosis. The two chapters on psychotherapy complete the more purely psychological or developmental part of the work. In the final chapter the problem of disordered personalities is allowed to expand to its full social dimensions. Treatment, care, and prevention call for social effort and social organization. I have sought to show some of the lines, both professional and nonprofessional, along which this effort can be expended.",
				"libraryCatalog": "APA PsycNET",
				"numPages": "617",
				"place": "New York, NY, US",
				"publisher": "Ronald Press Company",
				"rights": "(c) 2016 APA, all rights reserved",
				"shortTitle": "The abnormal personality",
				"volume": "x",
				"attachments": [
					{
						"title": "APA PsycNET Snapshot"
					}
				],
				"tags": [
					"Abnormal Psychology"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://psycnet.apa.org/index.cfm?fa=buy.optionToBuy&id=2004-16329-002",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Clinical introduction: Examples of disordered personalities",
				"creators": [
					{
						"lastName": "White",
						"firstName": "Robert W.",
						"creatorType": "author"
					}
				],
				"date": "1948",
				"abstractNote": "This chapter examines some representative examples of disordered personalities. The reader should be forewarned that the five cases described here will be frequently referred to in later chapters of the book. They display to advantage many of the problems and principles that will occupy us when we undertake to build up a systematic account of abnormal psychology. It will be assumed that the cases given in this chapter are well remembered, and with this in mind the reader should not only go through them but study and compare them rather carefully. The main varieties of disordered personalities and student attitudes toward abnormality are discussed before the case histories are presented.",
				"bookTitle": "The abnormal personality: A textbook",
				"libraryCatalog": "APA PsycNET",
				"pages": "54-101",
				"place": "New York, NY, US",
				"publisher": "Ronald Press Company",
				"rights": "(c) 2016 APA, all rights reserved",
				"shortTitle": "Clinical introduction",
				"attachments": [
					{
						"title": "APA PsycNET Snapshot"
					}
				],
				"tags": [
					"*Abnormal Psychology",
					"Personality Disorders"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://psycnet.apa.org/index.cfm?fa=buy.optionToBuy&id=2010-19350-001",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Predicting behavior in economic games by looking through the eyes of the players",
				"creators": [
					{
						"lastName": "Mellers",
						"firstName": "Barbara A.",
						"creatorType": "author"
					},
					{
						"lastName": "Haselhuhn",
						"firstName": "Michael P.",
						"creatorType": "author"
					},
					{
						"lastName": "Tetlock",
						"firstName": "Philip E.",
						"creatorType": "author"
					},
					{
						"lastName": "Silva",
						"firstName": "José C.",
						"creatorType": "author"
					},
					{
						"lastName": "Isen",
						"firstName": "Alice M.",
						"creatorType": "author"
					}
				],
				"date": "2010",
				"DOI": "10.1037/a0020280",
				"ISSN": "1939-2222 0096-3445",
				"abstractNote": "Social scientists often rely on economic experiments such as ultimatum and dictator games to understand human cooperation. Systematic deviations from economic predictions have inspired broader conceptions of self-interest that incorporate concerns for fairness. Yet no framework can describe all of the major results. We take a different approach by asking players directly about their self-interest—defined as what they want to do (pleasure-maximizing options). We also ask players directly about their sense of fairness—defined as what they think they ought to do (fairness-maximizing options). Player-defined measures of self-interest and fairness predict (a) the majority of ultimatum-game and dictator-game offers, (b) ultimatum-game rejections, (c) exiting behavior (i.e., escaping social expectations to cooperate) in the dictator game, and (d) who cooperates more after a positive mood induction. Adopting the players' perspectives of self-interest and fairness permits better predictions about who cooperates, why they cooperate, and when they punish noncooperators.",
				"issue": "4",
				"libraryCatalog": "APA PsycNET",
				"pages": "743-755",
				"publicationTitle": "Journal of Experimental Psychology: General",
				"rights": "(c) 2016 APA, all rights reserved",
				"volume": "139",
				"attachments": [
					{
						"title": "APA PsycNET Snapshot"
					}
				],
				"tags": [
					"*Economics",
					"*Games",
					"*Prediction",
					"Behavior",
					"Cooperation",
					"Emotional States"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://psycnet.apa.org/books/12348/002",
		"items": [
			{
				"itemType": "bookSection",
				"title": "The self in vocational psychology: Object, subject, and project",
				"creators": [
					{
						"lastName": "Savickas",
						"firstName": "Mark L.",
						"creatorType": "author"
					},
					{
						"lastName": "Hartung",
						"firstName": "P. J.",
						"creatorType": "editor"
					},
					{
						"lastName": "Subich",
						"firstName": "L. M.",
						"creatorType": "editor"
					}
				],
				"date": "2011",
				"ISBN": "9781433808616 9781433808623",
				"abstractNote": "In this chapter, I seek to redress vocational psychology’s inattention to the self and address the ambiguity of the meaning of self. To begin, I offer a chronological survey of vocational psychology’s three main views of human singularity. During succeeding historical eras, different aspects of human singularity interested vocational psychologists, so they developed a new set of terms and concepts to deal with shifts in the meaning of individuality. Over time, vocational psychology developed what Kuhn (2000) referred to as language communities, each with its own paradigm for understanding the self and vocational behavior. Because the self is fundamentally ambiguous, adherents to each paradigm describe it with an agreed on language and metaphors. Thus, each paradigm has a textual tradition, or way of talking about the self. As readers shall see, when they talk about individuals, differentialists use the language of personality, developmentalists use the language of personhood, and constructionists use the language of identity.",
				"bookTitle": "Developing self in work and career: Concepts, cases, and contexts",
				"libraryCatalog": "APA PsycNET",
				"pages": "17-33",
				"place": "Washington, DC, US",
				"publisher": "American Psychological Association",
				"rights": "(c) 2016 APA, all rights reserved",
				"shortTitle": "The self in vocational psychology",
				"attachments": [
					{
						"title": "APA Psycnet Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"*Occupational Guidance",
					"*Personality",
					"Self-Concept"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/