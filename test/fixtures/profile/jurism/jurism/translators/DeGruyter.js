{
	"translatorID": "2a5dc3ed-ee5e-4bfb-baad-36ae007e40ce",
	"label": "DeGruyter",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.degruyter\\.com",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2017-08-28 07:31:18"
}

/*
   DeGruyter (Replacing BE Press - based on BioMed Central Translator)
   Copyright (C) 2012 Sebastian Karcher and Avram Lyon, ajlyon@gmail.com

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


function detectWeb(doc,url) {

	if ( doc.body.classList.contains('journalArticle') || doc.body.classList.contains('page-viewdatabaseentry') ) {
		return "journalArticle";
	}
	if ( doc.body.classList.contains('page-viewbook') || doc.body.classList.contains('page-viewbooktoc')) {
		return "book";
	}
	if (doc.body.classList.contains('page-viewbookchapter')) {
		return "bookSection";
	}
	if ( (doc.body.classList.contains('page-search') || doc.body.classList.contains('page-searchwithinbase') || doc.body.classList.contains('page-databasecontent') || doc.body.classList.contains('page-viewjournalissue')) &&  getSearchResults(doc, url)) {
		return "multiple";
	}
	//page-viewjournal --> full/whole journal (type in Zotero is planned)

	return false;
}


function getSearchResults(doc, url) {
	var items = {}, found = false, title;
	var results = doc.getElementsByClassName('contentItem');
	var searchEnvironment = doc.body.classList.contains('page-search') || doc.body.classList.contains('page-searchwithinbase') || doc.body.classList.contains('page-databasecontent');
	for (var i=0; i<results.length; i++) {
		if ( searchEnvironment ) {
			//if we're searching titles, we can for example not handle databases or ebook packages
			if (results[i].classList.contains('book') || 
				results[i].classList.contains('textbook') ||
				results[i].classList.contains('nlm-article') ||
				results[i].classList.contains('chapter') ||
				results[i].classList.contains('wdg-biblio-record')) {
					title = ZU.xpath(results[i], './/h2[contains(@class,"itemTitle")]/a')[0];
			}
		} else {//view issue
			title = ZU.xpath(results[i],'.//h3/a')[0];
		}

		if (!title || !title.href) continue;
		found = true;
		items[title.href] = ZU.trimInternal(title.textContent);
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var hits = getSearchResults(doc, url);
		var urls = [];
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, scrapeRIS);
		});
	} else {
		scrapeRIS(doc, url);
	}
}

function scrapeRIS(doc, url) {
	var urlCite = ZU.xpathText(doc,'(//li[@class="cite"])[1]/a/@href');
	var productId = urlCite.replace('/dg/cite/', '').replace(/[?#].*$/, '');

	var abstract = doc.getElementById('overviewContent') || 
					ZU.xpath(doc,'//div[@class="articleBody_abstract"]/p')[0] || 
					ZU.xpath(doc,'//div[@class="articleBody_transAbstract"]/p')[0];
	var pdfUrl = ZU.xpathText(doc,'//div[contains(@class, "fullContentLink")]/a[@class="pdf-link"]/@href');
	var tags = ZU.xpath(doc, '//meta[@name="citation_keywords"]/@content');
	
	var biblRemark = doc.getElementById('biblRemark');
	//at the moment the page (end)numbers are not part of the RIS
	//but the information is in the meta tags
	var firstPage = ZU.xpathText(doc, '//meta[@name="citation_firstpage"]/@content');
	var lastPage = ZU.xpathText(doc, '//meta[@name="citation_lastpage"]/@content');
	
	ZU.doGet("/dg/cite:exportcitation/ris?t:ac="+productId+"/$N", function(risData) {
		if (risData.indexOf("<") == 0) {
			Z.debug("No RIS");
			scrapeMetadata(doc);
		} else {
			if (detectWeb(doc, url) == "bookSection") {
				risData = risData.replace("TY  - GENERIC", "TY  - CHAP");
			}
			var trans = Zotero.loadTranslator('import');
			trans.setTranslator('32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7');//https://github.com/zotero/translators/blob/master/RIS.js
			trans.setString(risData);

			trans.setHandler('itemDone', function (obj, item) {
				//for debugging
				//item.notes.push({note:risData});
				
				//add endpage if missing
				if (item.pages && item.pages.indexOf("-") == -1 && lastPage) {
					if (firstPage == item.pages) {
						item.pages += "–" + lastPage;
					}
				}

				//correct authors from RIS data
				//they are of the form lastname firstname withouth a comma
				//e.g., AU  - Meggitt Justin J.
				for (var i=0; i<item.creators.length; i++) {
					if (item.creators[i].fieldMode == 1) {
						var splitPos = item.creators[i].lastName.indexOf(" ");
							item.creators[i].firstName = item.creators[i].lastName.substr( splitPos+1 );
							item.creators[i].lastName = item.creators[i].lastName.substr( 0, splitPos);
							delete item.creators[i].fieldMode;
					}
				}
				//add hyphen in ISSN if missing
				if (item.ISSN) {
					item.ISSN = ZU.cleanISSN(item.ISSN);
				}
				//add abstract
				if (abstract) {
					abstract = abstract.textContent
						.replace(/\u0092/g,"’")
						.replace(/\u0093/g,"“")
						.replace(/\u0094/g,"”");
					item.abstractNote = ZU.trimInternal(abstract);
				}

				//biblRemark e.g. edition maybe more
				if (biblRemark) {
					if ((item.itemType == "book" || item.itemType == "bookSection") && !item.edition) {
						item.edition = biblRemark.textContent;
					} else {
						item.notes.push({ note : biblRemark.textContent});
					}
				}

				//url is saved in RIS withouth the http(s) protocoll
				item.url = url;

				//journalAbbreviations are more like internal codes
				//they don't make sense for citations
				delete item.journalAbbreviation;
				
				if (item.tags.length == 0 && tags && tags.length > 0) {
					for (var i=0; i<tags.length; i++) {
						item.tags.push(tags[i].textContent.replace(/[,.]$/, ''));
					}
				}

				if (pdfUrl) {
					//Z.debug(pdfUrl);
					item.attachments.push({
						url: pdfUrl,
						title: "Full Text PDF",
						mimeType: "application/pdf"
					});
				}

				item.complete();
			});
			trans.translate();
		}
	});

}


function scrapeMetadata(doc, url) {
	//the highwire meta tags are now part of the body and not head
	//which we have to correct here before calling EM translator
	var head = doc.getElementsByTagName('head');
	var metasInBody = ZU.xpath(doc, '//body/div/meta');
	for (var i=0; i<metasInBody.length; i++) {
		head[0].append(metasInBody[i]);
	}
	// We call the Embedded Metadata translator
	var translator = Zotero.loadTranslator("web");
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setHandler("itemDone", function(obj, item) {
		item.abstractNote = ZU.xpathText(doc, '//div[@class="articleBody_abstract"]');
		var doi = ZU.xpathText(doc, '(//a[@itemprop="citation_doi"])[1]/@href');
		if (doi) {
			var start = doi.indexOf('10.');
			item.DOI = doi.substr(start);
		}
		item.complete();
	});
	translator.setDocument(doc);
	translator.translate();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.degruyter.com/view/j/for.2011.9.issue-4/issue-files/for.2011.9.issue-4.xml",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.degruyter.com/view/j/for.2011.8.4_20120105083457/for.2011.8.4/for.2011.8.4.1405/for.2011.8.4.1405.xml?format=INT",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Midterm Landslide of 2010: A Triple Wave Election",
				"creators": [
					{
						"lastName": "Campbell",
						"creatorType": "author",
						"firstName": "James E."
					}
				],
				"date": "2011",
				"DOI": "10.2202/1540-8884.1405",
				"ISSN": "1540-8884",
				"abstractNote": "Democrats were trounced in the 2010 midterm elections. They lost six seats in the U.S. Senate, six governorships, and about 700 seats in state legislatures. Compared to 2008, Democrats lost 64 seats in the House and Republicans regained their House majority. The Republican majority elected in 2010 was the largest number of Republicans elected since 1946. The analysis finds that Republican seat gains resulted from the receding of the pro-Democratic waves of 2006 and 2008 as well as the incoming pro-Republican wave of 2010. Voters rejected Democrats in 2010 for their failure to revive the economy, but also for their advancement of the national healthcare reform and other liberal policies. The analysis speculates that Democrats are likely to gain House seats and lose Senate seats in 2012. Finally, President Obama’s prospects of re-election have probably been improved because of the Republican gains in the 2010 midterm.",
				"issue": "4",
				"libraryCatalog": "DeGruyter",
				"publicationTitle": "The Forum",
				"shortTitle": "The Midterm Landslide of 2010",
				"url": "https://www.degruyter.com/view/j/for.2011.8.4_20120105083457/for.2011.8.4/for.2011.8.4.1405/for.2011.8.4.1405.xml?format=INT",
				"volume": "8",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"congress",
					"economy",
					"elections",
					"midterm elections",
					"polarization",
					"political parties",
					"presidency",
					"presidential approval",
					"retrospective voting",
					"voting"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.degruyter.com/view/j/ev.2010.7.4/ev.2010.7.4.1796/ev.2010.7.4.1796.xml?format=INT",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Comment on Nordhaus: Carbon Tax Calculations",
				"creators": [
					{
						"lastName": "Bauman",
						"creatorType": "author",
						"firstName": "Yoram"
					}
				],
				"date": "2010",
				"DOI": "10.2202/1553-3832.1796",
				"ISSN": "1553-3832",
				"abstractNote": "William Nordhaus confuses the impact of a tax on carbon and a tax on carbon dioxide, according to Yoram Bauman.",
				"issue": "4",
				"libraryCatalog": "DeGruyter",
				"publicationTitle": "The Economists' Voice",
				"shortTitle": "Comment on Nordhaus",
				"url": "https://www.degruyter.com/view/j/ev.2010.7.4/ev.2010.7.4.1796/ev.2010.7.4.1796.xml?format=INT",
				"volume": "7",
				"attachments": [
					{
						"title": "Full Text PDF",
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
		"url": "http://www.degruyter.com/searchwithinbase?source=%2Fj%2Fev.2010.7.4%2Fev.2010.7.4.1796%2Fev.2010.7.4.1796.xml&entryType=journal&q=senate&seriesSource=%2Fj%2Fev&issueSource=%2Fj%2Fev.2010.7.4%2Fissue-files%2Fev.2010.7.issue-4.xml&bookSource=&searchScope=bookseries",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.degruyter.com/view/product/462324?rskey=UXcy67&result=1",
		"items": [
			{
				"itemType": "book",
				"title": "Datenbanksysteme, Eine Einführung",
				"creators": [
					{
						"lastName": "Kemper",
						"creatorType": "author",
						"firstName": "Alfons"
					},
					{
						"lastName": "Eickler",
						"creatorType": "author",
						"firstName": "André"
					}
				],
				"date": "2015",
				"ISBN": "9783110443752",
				"abstractNote": "This textbook provides a systematic and thorough introduction to modern database systems. It presents today's leading relational technology in special detail. The 10th edition updates and expands the presentation of recent developments (i.e. main memory database systems and Big Data applications). Extensive examples illustrate the concepts, making the book especially suitable for self study.",
				"edition": "10th expanded and updated edition",
				"language": "DT",
				"libraryCatalog": "DeGruyter",
				"place": "Berlin, Boston",
				"publisher": "De Gruyter",
				"url": "https://www.degruyter.com/view/product/462324?rskey=UXcy67&result=1",
				"attachments": [],
				"tags": [
					"Big Data",
					"Database systems",
					"SQL"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.degruyter.com/view/j/jah-2013-1-issue-2/jah-2013-0010/jah-2013-0010.xml",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Did Magic Matter? The Saliency of Magic in the Early Roman Empire",
				"creators": [
					{
						"lastName": "Meggitt",
						"creatorType": "author",
						"firstName": "Justin J."
					}
				],
				"date": "2013",
				"DOI": "10.1515/jah-2013-0010",
				"ISSN": "2324-8114",
				"abstractNote": "Magic is usually assumed to have been ubiquitous and culturally significant in the early Roman Empire, something exemplified by Pliny the Elder’s claim that “there is no one who does not fear to be spell-bound by curse tablets”.1 A variety of written and material evidence is commonly taken to be indicative of both the regular use of magic and widespread anxiety about its deployment. However, this paper argues that if we attempt, having determined a contextually appropriate definition of magic, to gauge the prevalence and significance of magic in this period, it can be seen to have had little cultural salience. Not only is evidence for its presence more equivocal than usually presumed, but magic is found to be strikingly absent from major popular cultural sources that shed light on the presuppositions and preoccupations of most of the empire’s inhabitants, and to have had little explanatory or symbolic utility. The paper then proceeds to suggest possible reasons for magic’s lack of salience in the early Empire, including the role of various sceptical discourses concerned with the supernatural in general and magic in particular, and the consequence of the largely agonistic context of its use on the limited occasions that it was employed.",
				"issue": "2",
				"libraryCatalog": "DeGruyter",
				"pages": "170–229",
				"publicationTitle": "Journal of Ancient History",
				"shortTitle": "Did Magic Matter?",
				"url": "https://www.degruyter.com/view/j/jah-2013-1-issue-2/jah-2013-0010/jah-2013-0010.xml",
				"volume": "1",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Belief",
					"Early Roman Empire",
					"Magic",
					"Popular Culture",
					"Scepticism"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.degruyter.com/browse?authorCount=5&pageSize=10&searchTitles=true&sort=datedescending&t1=EC&type_0=books&type_1=journals",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.degruyter.com/view/IBZ/55568460-8061-41c8-8479-783eefecc02f",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Principle of the Eternal-Feminine in Rossini’s L’Italiana in Algeri: Isabella as the Italian Super-Woman",
				"creators": [
					{
						"lastName": "Zamir",
						"creatorType": "author",
						"firstName": "Sara"
					}
				],
				"date": "2011",
				"ISSN": "0211-3538",
				"abstractNote": "La expresión Eterno Femenino (Eternal-Feminine, o Das Ewig-Weibliche), apareció por primera vez en los últimos versos de la segunda parte del Fausto de Goethe (acabado en 1832). Posteriormente, se convirtió en tema de especulación, y en un enigma que los estudiosos han estado intentando resolver desde entonces. La expresión vino a identificar, con el paso del tiempo, un principio cultural relacionado con la imagen de la feminidad y alcanzó su extremo romántico, en el siglo XIX, cuando diversos arquetipos femeninos se fundieron en una sola heroína. El presente artículo pretende explorar el personaje de Isabella en La italianaen Argel de Rossini, a la luz del principio del Eterno Femenino. Aunque Goethe se encontraba todavía escribiendo la segunda parte de su Fausto cuando se estrenó La italiana (1813) en Italia, el principio cultural del Eterno Femenino puede utilizarse retrospectivamente en el análisis de Isabella como protagonista femenino central de la ópera. La lectura minuciosa de su personaje sugiere una aproximación estética que hace uso de ciertos aspectos románticos del principio del Eterno Femenino. El presente artículo se centra específicamente en la escena del Cruda sorte! Amor tiranno! y se refiere brevemente, también, a otras escenas",
				"archive": "IBZ Online",
				"issue": "66",
				"libraryCatalog": "DeGruyter",
				"pages": "165-180",
				"publicationTitle": "Anuario Musical",
				"shortTitle": "The Principle of the Eternal-Feminine in Rossini’s L’Italiana in Algeri",
				"url": "https://www.degruyter.com/view/IBZ/55568460-8061-41c8-8479-783eefecc02f",
				"attachments": [],
				"tags": [
					"Italian music",
					"Italienische Musik",
					"Musiktheater",
					"Oper",
					"Orientalismus",
					"Rossini, Gioacchino Antonio (Komponist 1792-1868)",
					"Theater",
					"female (feminine)",
					"feminin",
					"feminine",
					"musical theatre",
					"opera",
					"orientalism",
					"theatre"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.degruyter.com/databasecontent?authorCount=5&dbf_0=ibr-fulltext&dbid=ibr&dbq_0=goethe&dbsource=%2Fdb%2Fibr&dbt_0=fulltext&o_0=AND&page=11&pageSize=10&searchTitles=false&sort=date-sort",
		"items": "multiple"
	}
]
/** END TEST CASES **/