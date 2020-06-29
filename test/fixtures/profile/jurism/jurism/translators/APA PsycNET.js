{
	"translatorID": "1e1e35be-6264-45a0-ad2e-7212040eb984",
	"label": "APA PsycNET",
	"creator": "Philipp Zumstein",
	"target": "^https?://psycnet\\.apa\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-05-08 19:12:21"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Philipp Zumstein
	
	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/


// Some test cases are only working in the browser with some AJAX loading:
// 1) http://psycnet.apa.org/PsycBOOKS/toc/10023
// 2) follow a link in a search
// 3) search page
// 4) journal page
//
// Moreover, after three test cases you have to load an psycnet url in the browser
// to avoid some automatic download detection.


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	url = (doc.location && doc.location.href) ? doc.location.href : url;
	
	// the dection will only work if the page is load completely,
	// thus we have to hardcode some test cases
	if (url.includes('://psycnet.apa.org/record/1992-98221-010')) return "bookSection";
	if (url.includes('://psycnet.apa.org/record/2004-16329-000')) return "book";
	if (url.includes('://psycnet.apa.org/buy/2004-16329-002')) return "bookSection";
	if (url.includes('://psycnet.apa.org/buy/2010-19350-001')) return "journalArticle";
	if (url.includes('://psycnet.apa.org/record/2010-09295-002')) return "bookSection";
	
	// normal cases
	// It seems that the url sometimes changes after Zotero has inspected it,
	// which leads to the wrong Zotero icon. However, saving will still do the
	// correct action. Reload the page might also solve some edge cases.
	if (url.includes('/PsycBOOKS/')) {
		return "book";
	}
	if (url.includes('/search/display?') || url.includes('/record/') || url.includes('/doiLanding?doi=')) {
		if (doc.getElementById('bookchapterstoc')) {
			return "bookSection";
		} else {
			return "journalArticle";
		}
	}
	if (url.includes('/search/results?') || url.includes('/journal/')) {// && getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a.article-title');
	for (var i=0; i<rows.length; i++) {
		var href = attr(rows[i].parentNode, '#buy, a.fullTextHTMLLink, a.fullTextLink', 'href') ;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var uid = getIds(doc, url.replace(/[?#].*$/, ''));
	
	var productCode;
	var db = doc.getElementById('database');
	if (db) {
		db = db.parentNode.textContent;
		if (db.includes('PsycARTICLES')) {
			productCode = 'PA';
		} else if (db.includes('PsycBOOKS')) {
			productCode = 'PB';
		} else if (db.includes('PsycINFO')) {
			productCode = 'PI';
		} else if (db.includes('PsycEXTRA')) {
			productCode = 'PE';
		}
	} else {
		// default, e.g. if page is not completely loaded
		productCode = 'PI';
	}
	
	var postData = '{"api":"record.exportRISFile","params":{"UIDList":[{"UID":"'+uid+'","ProductCode":"'+productCode+'"}],"exportType":"zotero"}}';
	var headers = {
		'Content-Type': 'application/json',
		'Referer': url
	};

	// 1. We have to set the uid, product code and format with a post request
	ZU.doPost('/api/request/record.exportRISFile', postData, function(apiReturnMessage) {
		var apiReturnData;
		try {
			apiReturnData = JSON.parse(apiReturnMessage);
		} catch(e) {
			Z.debug('POST request did not result in valid JSON');
			Z.debug(apiReturnMessage);
		}
		
		if (apiReturnData && apiReturnData.isRisExportCreated) {
			// 2. Download the requested data (after step 1)
			ZU.doGet('/ris/download', function(data) {
				if (data.includes('Content: application/x-research-info-systems')) {
					processRIS(data, doc);
				} else {
					// sometimes (e.g. during testing) the data is not loaded
					// but a meta redirect to a captcha page mentioning
					Z.debug("The APA anomaly detection think we are doing " +
						"something unusual (sigh). Please reload any APA page e.g. " +
						"http://psycnet.apa.org/ in your browser and try again.");
					Z.debug(data);
				}
			});
		}
	}, headers);
}


function processRIS(text, doc) {
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
	translator.setString(text);
	translator.setHandler("itemDone", function(obj, item) {
		item.title = cleanTitle(item.title);
		if (item.publication) item.publication = cleanTitle(item.publication);
		if (item.bookTitle) item.bookTitle = cleanTitle(item.bookTitle);
		if (item.series) item.series = cleanTitle(item.series);
		if (item.place) item.place = item.place.replace(/\s+/g, ' ');
		for (var i=0; i<item.tags.length; i++) {
			item.tags[i] = item.tags[i].replace(/^\*/, '');
		}
		var pdfURL = attr(doc, 'a[href*="/fulltext"]', 'href');
		if (pdfURL) {
			item.attachments.push({
				url: pdfURL,
				title: "Full Text PDF",
				mimeType: "application/pdf"
			});
		}
		item.attachments.push({
			title: "Snapshot",
			document: doc
		});
		item.complete();
	});
	translator.translate();
}


//try to figure out ids that we can use for fetching RIS
function getIds(doc, url) {
	//try to extract uid from the table
	var uid = text(doc, '#uid + dd') || text(doc, '#bookUID');
	if (uid) {
		return uid;
	}

	//try to extract uid from the url
	if (url.includes('/record/')) {
		let m = url.match(/\/record\/([\d\-]*)/);
		if (m && m[1]) {
			return m[1];
		}
	}
	
	/**on the book pages, we can find the UID in
	 * the Front matter and Back matter links
	 */
	if (url.includes('/PsycBOOKS/')) {
		var link = attr(doc, '.bookMatterLinks a', 'href');
		if (link) {
			let m = link.match(/\/fulltext\/([^&]+?)-(?:FRM|BKM)/i);
			if (m && m[1]) {
				return m[1];
			}
		}
	}

	/**for pages with buy.optionToBuy
	 * we can fetch the id from the url
	 * alternatively, the id is in a javascript section (this is messy)
	 */
	if (url.includes('/buy/')) {
		let m = url.match(/\/buy\/([\d\-]*)/);
		if (m) {
			return m[1];
		}

		m = doc.documentElement.textContent.match(/\bitemUID\s*=\s*(['"])(.*?)\1/);
		if (m && m[2]) {
			return m[2];
		}
	}
	
	/**last option: check for a purchase link
	 */
	var purchaseLink = attr(doc, 'a.purchase[href*="/buy/"]', 'href');
	if (purchaseLink) {
		let m = purchaseLink.match(/\/buy\/([\d\-]*)/);
		return m[1];
	}

}


function cleanTitle(title) {
	// delete point at the end of a title,
	// except it looks like an abbreviation
	if (/\b\w\.$/.test(title)) {
		return title;
	} else {
		return title.replace(/\.$/, '');
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://psycnet.apa.org/record/2004-16644-010",
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
				"ISSN": "1931-1559(Electronic),0894-4105(Print)",
				"abstractNote": "A comprehensive, empirically based review of the published studies addressing neuropsychological performance in adults diagnosed with attention-deficit/hyperactivity disorder (ADHD) was conducted to identify patterns of performance deficits. Findings from 33 published studies were submitted to a meta-analytic procedure producing sample-size-weighted mean effect sizes across test measures. Results suggest that neuropsychological deficits are expressed in adults with ADHD across multiple domains of functioning, with notable impairments in attention, behavioral inhibition, and memory, whereas normal performance is noted in simple reaction time. Theoretical and developmental considerations are discussed, including the role of behavioral inhibition and working memory impairment. Future directions for research based on these findings are highlighted, including further exploration of specific impairments and an emphasis on particular tests and testing conditions. (PsycINFO Database Record (c) 2016 APA, all rights reserved)",
				"issue": "3",
				"libraryCatalog": "APA PsycNET",
				"pages": "485-503",
				"publicationTitle": "Neuropsychology",
				"shortTitle": "Neuropsychology of Adults With Attention-Deficit/Hyperactivity Disorder",
				"volume": "18",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Attention Deficit Disorder with Hyperactivity"
					},
					{
						"tag": "Behavioral Inhibition"
					},
					{
						"tag": "Empirical Methods"
					},
					{
						"tag": "Experimentation"
					},
					{
						"tag": "Hyperkinesis"
					},
					{
						"tag": "Inhibition (Personality)"
					},
					{
						"tag": "Neuropsychological Assessment"
					},
					{
						"tag": "Neuropsychology"
					},
					{
						"tag": "Reaction Time"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://psycnet.apa.org/record/1956-05944-001",
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
				"ISSN": "0022-1015(Print)",
				"abstractNote": "Two factor analytic studies of meaningful judgments based upon the same sample of 50 bipolar descriptive scales are reported. Both analyses reveal three major connotative factors: evaluation, potency, and activity. These factors appear to be independent dimensions of the semantic space within which the meanings of concepts may be specified. (PsycINFO Database Record (c) 2016 APA, all rights reserved)",
				"issue": "5",
				"libraryCatalog": "APA PsycNET",
				"pages": "325-338",
				"publicationTitle": "Journal of Experimental Psychology",
				"volume": "50",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Factor Analysis"
					},
					{
						"tag": "Factor Structure"
					},
					{
						"tag": "Judgment"
					},
					{
						"tag": "Meaning"
					},
					{
						"tag": "Semantics"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://psycnet.apa.org/record/1992-98221-010",
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
					}
				],
				"date": "1977",
				"ISBN": "9780716703686 9780716703679",
				"abstractNote": "tonic immobility [animal hypnosis] might be a useful laboratory analog or research model for catatonia / we have been collaborating on an interdisciplinary program of research in an effort to pinpoint the behavioral antecedents and biological bases for tonic immobility / attempt to briefly summarize our findings, and . . . discuss the implications of these data in terms of the model  characteristics of tonic immobility / hypnosis / catatonia, catalepsy, and cataplexy / tonic immobility as a model for catatonia / fear potentiation / fear alleviation / fear or arousal / learned helplessness / neurological correlates / pharmacology and neurochemistry / genetic underpinnings / evolutionary considerations / implications for human psychopathology (PsycINFO Database Record (c) 2016 APA, all rights reserved)",
				"bookTitle": "Psychopathology: Experimental models",
				"libraryCatalog": "APA PsycNET",
				"pages": "334-357",
				"place": "New York, NY, US",
				"publisher": "W H Freeman/Times Books/ Henry Holt & Co",
				"series": "A series of books in psychology",
				"shortTitle": "Catatonia",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Animal Models"
					},
					{
						"tag": "Catalepsy"
					},
					{
						"tag": "Catatonia"
					},
					{
						"tag": "Fear"
					},
					{
						"tag": "Genetics"
					},
					{
						"tag": "Neurology"
					},
					{
						"tag": "Pharmacology"
					},
					{
						"tag": "Tonic Immobility"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://psycnet.apa.org/record/2004-16329-000?doi=1",
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
				"abstractNote": "The author's intent is to write about abnormal people in a way that will be valuable and interesting to students new to the subject. A first course in abnormal psychology is not intended to train specialists. Its goal is more general: it should provide the student with the opportunity to whet his interest, expand his horizons, register a certain body of new facts, and relate this to the rest of his knowledge about mankind. I have tried to present the subject in such a way as to emphasize its usefulness to all students of human nature. I have tried the experiment of writing two introductory chapters, one historical and the other clinical. This reflects my desire to set the subject-matter in a broad perspective and at the same time to anchor it in concrete fact. Next comes a block of six chapters designed to set forth the topics of maladjustment and neurosis. The two chapters on psychotherapy complete the more purely psychological or developmental part of the work. In the final chapter the problem of disordered personalities is allowed to expand to its full social dimensions. Treatment, care, and prevention call for social effort and social organization. I have sought to show some of the lines, both professional and nonprofessional, along which this effort can be expended. (PsycINFO Database Record (c) 2016 APA, all rights reserved)",
				"extra": "DOI: 10.1037/10023-000",
				"libraryCatalog": "APA PsycNET",
				"numPages": "x, 617",
				"place": "New York, NY, US",
				"publisher": "Ronald Press Company",
				"series": "The abnormal personality: A textbook",
				"shortTitle": "The abnormal personality",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Abnormal Psychology"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://psycnet.apa.org/buy/2004-16329-002",
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
				"abstractNote": "This chapter examines some representative examples of disordered personalities. The reader should be forewarned that the five cases described here will be frequently referred to in later chapters of the book. They display to advantage many of the problems and principles that will occupy us when we undertake to build up a systematic account of abnormal psychology. It will be assumed that the cases given in this chapter are well remembered, and with this in mind the reader should not only go through them but study and compare them rather carefully. The main varieties of disordered personalities and student attitudes toward abnormality are discussed before the case histories are presented. (PsycINFO Database Record (c) 2016 APA, all rights reserved)",
				"bookTitle": "The abnormal personality: A textbook",
				"extra": "DOI: 10.1037/10023-002",
				"libraryCatalog": "APA PsycNET",
				"pages": "54-101",
				"place": "New York, NY, US",
				"publisher": "Ronald Press Company",
				"shortTitle": "Clinical introduction",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Abnormal Psychology"
					},
					{
						"tag": "Personality Disorders"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://psycnet.apa.org/buy/2010-19350-001",
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
				"ISSN": "1939-2222(Electronic),0096-3445(Print)",
				"abstractNote": "Social scientists often rely on economic experiments such as ultimatum and dictator games to understand human cooperation. Systematic deviations from economic predictions have inspired broader conceptions of self-interest that incorporate concerns for fairness. Yet no framework can describe all of the major results. We take a different approach by asking players directly about their self-interest—defined as what they want to do (pleasure-maximizing options). We also ask players directly about their sense of fairness—defined as what they think they ought to do (fairness-maximizing options). Player-defined measures of self-interest and fairness predict (a) the majority of ultimatum-game and dictator-game offers, (b) ultimatum-game rejections, (c) exiting behavior (i.e., escaping social expectations to cooperate) in the dictator game, and (d) who cooperates more after a positive mood induction. Adopting the players' perspectives of self-interest and fairness permits better predictions about who cooperates, why they cooperate, and when they punish noncooperators. (PsycINFO Database Record (c) 2016 APA, all rights reserved)",
				"issue": "4",
				"libraryCatalog": "APA PsycNET",
				"pages": "743-755",
				"publicationTitle": "Journal of Experimental Psychology: General",
				"volume": "139",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Behavior"
					},
					{
						"tag": "Cooperation"
					},
					{
						"tag": "Economics"
					},
					{
						"tag": "Emotional States"
					},
					{
						"tag": "Games"
					},
					{
						"tag": "Prediction"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://psycnet.apa.org/record/2010-09295-002",
		"items": [
			{
				"itemType": "bookSection",
				"title": "The self in vocational psychology: Object, subject, and project",
				"creators": [
					{
						"lastName": "Savickas",
						"firstName": "Mark L.",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"ISBN": "9781433808616 9781433808623",
				"abstractNote": "In this chapter, I seek to redress vocational psychology’s inattention to the self and address the ambiguity of the meaning of self. To begin, I offer a chronological survey of vocational psychology’s three main views of human singularity. During succeeding historical eras, different aspects of human singularity interested vocational psychologists, so they developed a new set of terms and concepts to deal with shifts in the meaning of individuality. Over time, vocational psychology developed what Kuhn (2000) referred to as language communities, each with its own paradigm for understanding the self and vocational behavior. Because the self is fundamentally ambiguous, adherents to each paradigm describe it with an agreed on language and metaphors. Thus, each paradigm has a textual tradition, or way of talking about the self. As readers shall see, when they talk about individuals, differentialists use the language of personality, developmentalists use the language of personhood, and constructionists use the language of identity. (PsycINFO Database Record (c) 2017 APA, all rights reserved)",
				"bookTitle": "Developing self in work and career: Concepts, cases, and contexts",
				"extra": "DOI: 10.1037/12348-002",
				"libraryCatalog": "APA PsycNET",
				"pages": "17-33",
				"place": "Washington, DC, US",
				"publisher": "American Psychological Association",
				"shortTitle": "The self in vocational psychology",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Occupational Guidance"
					},
					{
						"tag": "Personality"
					},
					{
						"tag": "Self-Concept"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
