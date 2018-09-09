{
	"translatorID": "80bc4fd3-747c-4dc2-86e9-da7b251e1407",
	"label": "Journal of Machine Learning Research",
	"creator": "Fei Qi, Philipp Zumstein",
	"target": "^https?://jmlr\\.csail\\.mit\\.edu/papers",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-01-31 20:33:31"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Philipp Zumstein
	
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.includes('.html')) {
		return "journalArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('#content dl');
	for (let i=0; i<rows.length; i++) {
		let links = rows[i].querySelectorAll('dd a');
		let href;
		for (let j=0; j<links.length; j++) {
			if (links[j].href && links[j].textContent == "abs") {
				href = links[j].href;
				break;
			}
		}
		let title = text(rows[i], 'dt');
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
	// attachments: bib, pdf
	var attachments = {};
	var atts = doc.querySelectorAll('#content a');
	for (let j=0; j<atts.length; j++) {
		let label = atts[j].textContent;
		let value = atts[j].href;
		attachments[label] = value;
	}
	// abstract
	var content = text(doc, '#content');
	var full = content.split('Abstract');
	var absatt = full[1].split('[abs]');
	var abs = absatt[0].replace(/^\s+/, '');

	if (attachments["bib"]) {
		ZU.doGet(attachments["bib"], function(text){
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
			translator.setString(text);
			translator.setHandler("itemDone", function(obj, item) {
				if (attachments["pdf"]) {
					item.attachments.push({
						title: "Fulltext PDF",
						url: attachments["pdf"]
					});
				}
				if (abs) item.abstractNote = abs;
				item.complete();
			});
			translator.translate();
		});
	} else {
		var item = new Zotero.Item("journalArticle");
		item.url = url;
		item.publicationTitle = "Journal of Machine Learning Research";
		item.ISSN = "1533-7928";
	
		item.title = text(doc, '#content h2').trim();
	
		var refline = text(doc, '#content>p');
		if (refline && refline.includes(';')) {
			var info = refline.split(';');
			var authors = info[0].split(',');
			for (let j = 0; j < authors.length; j++) {
				item.creators.push(Zotero.Utilities.cleanAuthor(authors[j], "author"));
			}
			// Zotero.debug( 'retrieving publication info' );
			var volissRe = /\s*(\d+)\(\s*(\w+)\s*\):\s*(\d+\s*(--|−)\s*\d+),\s*(\d+)./;
			var voliss = info[1].match(volissRe);
			item.volume = voliss[1];
			item.date = ZU.strToISO(voliss[2] + ', ' + voliss[5]);
			item.pages = voliss[3];
		}
	
		if (abs) {
			item.abstractNote = abs.replace(/\s+$/, '');
		}
		
		if (attachments["pdf"]) {
			item.attachments = [{
				url: attachments["pdf"],
				title: "Fulltext PDF",
				mimeType: "application/pdf"
			}];
		}
		item.complete();
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://jmlr.csail.mit.edu/papers/v10/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://jmlr.org/papers/v10/kang09a.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Markov Properties for Linear Causal Models with Correlated Errors",
				"creators": [
					{
						"firstName": "Changsung",
						"lastName": "Kang",
						"creatorType": "author"
					},
					{
						"firstName": "Jin",
						"lastName": "Tian",
						"creatorType": "author"
					}
				],
				"date": "2009-01",
				"ISSN": "1533-7928",
				"abstractNote": "A linear causal model with correlated errors, represented by a DAG\nwith bi-directed edges, can be tested by the set of conditional\nindependence relations implied by the model. A global Markov property\nspecifies, by the d-separation criterion, the set of all conditional\nindependence relations holding in any model associated with a graph. A\nlocal Markov property specifies a much smaller set of conditional\nindependence relations which will imply all other conditional\nindependence relations which hold under the global Markov\nproperty. For DAGs with bi-directed edges associated with arbitrary\nprobability distributions, a local Markov property is given in\nRichardson (2003) which may invoke an exponential number of\nconditional independencies. In this paper, we show that for a class of\nlinear structural equation models with correlated errors, there is a\nlocal Markov property which will invoke only a linear number of\nconditional independence relations. For general linear models, we\nprovide a local Markov property that often invokes far fewer\nconditional independencies than that in Richardson (2003). The\nresults have applications in testing linear structural equation models\nwith correlated errors.",
				"libraryCatalog": "Journal of Machine Learning Research",
				"pages": "41--70",
				"publicationTitle": "Journal of Machine Learning Research",
				"url": "http://jmlr.org/papers/v10/kang09a.html",
				"volume": "10",
				"attachments": [
					{
						"title": "Fulltext PDF",
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
		"url": "http://jmlr.org/papers/v12/goldwater11a.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Producing Power-Law Distributions and Damping Word Frequencies with Two-Stage Language Models",
				"creators": [
					{
						"firstName": "Sharon",
						"lastName": "Goldwater",
						"creatorType": "author"
					},
					{
						"firstName": "Thomas L.",
						"lastName": "Griffiths",
						"creatorType": "author"
					},
					{
						"firstName": "Mark",
						"lastName": "Johnson",
						"creatorType": "author"
					}
				],
				"date": "2011-07",
				"ISSN": "1533-7928",
				"abstractNote": "Standard statistical models of language fail to capture one of the most striking properties of natural languages: the power-law distribution in the frequencies of word tokens. We present a framework for developing statistical models that can generically produce power laws, breaking generative models into two stages. The first stage, the generator, can be any standard probabilistic model, while the second stage, the adaptor, transforms the word frequencies of this model to provide a closer match to natural language. We show that two commonly used Bayesian models, the Dirichlet-multinomial model and the Dirichlet process, can be viewed as special cases of our framework.  We discuss two stochastic processes---the Chinese restaurant process and its two-parameter generalization based on the Pitman-Yor process---that can be used as adaptors in our framework to produce power-law distributions over word frequencies.  We show that these adaptors justify common estimation procedures based on logarithmic or inverse-power transformations of empirical frequencies.  In addition, taking the Pitman-Yor Chinese restaurant process as an adaptor justifies the appearance of type frequencies in formal analyses of natural language and improves the performance of a model for unsupervised learning of morphology.",
				"libraryCatalog": "Journal of Machine Learning Research",
				"pages": "2335−2382",
				"publicationTitle": "Journal of Machine Learning Research",
				"url": "http://jmlr.org/papers/v12/goldwater11a.html",
				"volume": "12",
				"attachments": [
					{
						"title": "Fulltext PDF",
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
		"url": "http://jmlr.org/papers/v17/maggioni16a.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Multiscale Dictionary Learning: Non-Asymptotic Bounds and Robustness",
				"creators": [
					{
						"firstName": "Mauro",
						"lastName": "Maggioni",
						"creatorType": "author"
					},
					{
						"firstName": "Stanislav",
						"lastName": "Minsker",
						"creatorType": "author"
					},
					{
						"firstName": "Nate",
						"lastName": "Strawn",
						"creatorType": "author"
					}
				],
				"date": "2016",
				"abstractNote": "High-dimensional datasets are well-approximated by low-\ndimensional structures. Over the past decade, this empirical\nobservation motivated the investigation of detection,\nmeasurement, and modeling techniques to exploit these low-\ndimensional intrinsic structures, yielding numerous implications\nfor high-dimensional statistics, machine learning, and signal\nprocessing. Manifold learning (where the low-dimensional\nstructure is a manifold) and dictionary learning (where the low-\ndimensional structure is the set of sparse linear combinations\nof vectors from a finite dictionary) are two prominent\ntheoretical and computational frameworks in this area. Despite\ntheir ostensible distinction, the recently-introduced Geometric\nMulti-Resolution Analysis (GMRA) provides a robust,\ncomputationally efficient, multiscale procedure for\nsimultaneously learning manifolds and dictionaries. In\nthis work, we prove non-asymptotic probabilistic bounds on the\napproximation error of GMRA for a rich class of data-generating\nstatistical models that includes “noisy” manifolds, thereby\nestablishing the theoretical robustness of the procedure and\nconfirming empirical observations. In particular, if a dataset\naggregates near a low- dimensional manifold, our results show\nthat the approximation error of the GMRA is completely\nindependent of the ambient dimension. Our work therefore\nestablishes GMRA as a provably fast algorithm for dictionary\nlearning with approximation and sparsity guarantees. We include\nseveral numerical experiments confirming these theoretical\nresults, and our theoretical framework provides new tools for\nassessing the behavior of manifold learning and dictionary\nlearning procedures on a large class of interesting models.",
				"issue": "2",
				"itemID": "JMLR:v17:maggioni16a",
				"libraryCatalog": "Journal of Machine Learning Research",
				"pages": "1-51",
				"publicationTitle": "Journal of Machine Learning Research",
				"shortTitle": "Multiscale Dictionary Learning",
				"url": "http://jmlr.org/papers/v17/maggioni16a.html",
				"volume": "17",
				"attachments": [
					{
						"title": "Fulltext PDF"
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
