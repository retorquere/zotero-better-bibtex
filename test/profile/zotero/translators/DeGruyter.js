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
	"lastUpdated": "2014-04-21 10:39:45"
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

	if( doc.body.classList.contains('journalArticle') || doc.body.classList.contains('page-viewdatabaseentry') ) {
		return "journalArticle";
	}
	if( doc.body.classList.contains('page-viewbook') || doc.body.classList.contains('page-viewbooktoc')) {
		return "book";
	}
	if(doc.body.classList.contains('page-viewbookchapter')) {
		return "bookSection";
	}
	if( (doc.body.classList.contains('page-search') || doc.body.classList.contains('page-searchwithinbase') || doc.body.classList.contains('page-databasecontent') || doc.body.classList.contains('page-viewjournalissue')) &&  getSearchResults(doc, url)) {
		return "multiple";
	}
	//page-viewjournal --> full/whole journal (type in Zotero is planned)

	return false;
}


function getSearchResults(doc, url) {
	var items = {}, found = false, title;
	var results = doc.getElementsByClassName('contentItem');
	var searchEnvironment = doc.body.classList.contains('page-search') || doc.body.classList.contains('page-searchwithinbase') || doc.body.classList.contains('page-databasecontent');
	for(var i=0; i<results.length; i++) {
		if( searchEnvironment ) {
			//if we're searching titles, we can for example not handle databases or ebook packages
			if (results[i].classList.contains('book') || 
				results[i].classList.contains('textbook') ||
				results[i].classList.contains('nlm-article') ||
				results[i].classList.contains('chapter') ||
				results[i].classList.contains('wdg-biblio-record')) {
					title = ZU.xpath(results[i], './h2[contains(@class,"itemTitle")]/a')[0];
			}
		} else {//view issue
			title = ZU.xpath(results[i],'./h3/a')[0];
		}

		if(!title || !title.href) continue;
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
	urlRIS = ZU.xpathText(doc,'//li[@class="cite"]/a/@href');
	var abstract = doc.getElementById('overviewContent') || 
					ZU.xpath(doc,'//div[@class="articleBody_abstract"]/p')[0] || 
					ZU.xpath(doc,'//div[@class="articleBody_transAbstract"]/p')[0];
	ZU.doGet(urlRIS, function(text) {
		//Z.debug(text);
		var ac = /<input value="([^"]+)" name="t:ac" type="hidden"\/>/.exec(text)[1];
		var formdata = /<input value="([^"]+)" name="t:formdata" type="hidden"\/>/.exec(text)[1];
		var poststring = "t:ac="+encodeURIComponent(ac)+"&t:formdata="+encodeURIComponent(formdata)+"&submit=Export";
		
		//at the moment the page (end)numbers are only in MLA correct
		//e.g. Journal of Ancient History, 1.2 (2013): 170-229. Retrieved 18 Apr. 2014
		var pageRange = /\):\s+(\d+)-(\d+)\.\s+Retrieved /.exec(text);
		
		ZU.doPost("/dg/cite.form", poststring, function(risData) {
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
					if (item.pages && item.pages.indexOf("-") == -1 && pageRange) {
						if (pageRange[1] == item.pages) {
							item.pages += "–"+pageRange[2];
						}
					}
					//correct authors from RIS data
					//they are of the form lastname firstname withouth a comma
					//e.g., AU  - Meggitt Justin J.
					for(var i=0; i<item.creators.length; i++) {
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
						item.abstractNote = ZU.trimInternal(abstract.textContent);
					}
					item.complete();
				});
				trans.translate();
			}
		});
	});
	
}


function scrapeMetadata(doc, url) {
	// We call the Embedded Metadata translator
	var translator = Zotero.loadTranslator("web");
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setHandler("itemDone", function(obj, item) {
		item.abstractNote = ZU.xpathText(doc, '//div[@class="articleBody_abstract"]');
		item.complete();
	});
	translator.setDocument(doc);
	translator.translate();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.degruyter.com/view/j/for.2011.9.issue-4/issue-files/for.2011.9.issue-4.xml",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.degruyter.com/view/j/for.2011.8.4_20120105083457/for.2011.8.4/for.2011.8.4.1405/for.2011.8.4.1405.xml?format=INT",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "James E.",
						"lastName": "Campbell",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"title": "The Midterm Landslide of 2010: A Triple Wave Election",
				"publicationTitle": "The Forum",
				"volume": "8",
				"issue": "4",
				"url": "http://www.degruyter.com/view/j/for.2011.8.4_20120105083457/for.2011.8.4/for.2011.8.4.1405/for.2011.8.4.1405.xml?format=INT",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "www.degruyter.com",
				"abstractNote": "Democrats were trounced in the 2010 midterm elections. They lost six seats in the U.S. Senate, six governorships, and about 700 seats in state legislatures. Compared to 2008, Democrats lost 64 seats in the House and Republicans regained their House majority. The Republican majority elected in 2010 was the largest number of Republicans elected since 1946. The analysis finds that Republican seat gains resulted from the receding of the pro-Democratic waves of 2006 and 2008 as well as the incoming  pro-Republican wave of 2010. Voters rejected Democrats in 2010 for their failure to revive the economy, but also for their advancement of the national healthcare reform and other liberal policies. The analysis speculates that Democrats are likely to gain House seats and lose Senate seats in 2012. Finally, President Obama’s prospects of re-election have probably been improved because of the Republican gains in the 2010 midterm.",
				"date": "2011/01/10",
				"shortTitle": "The Midterm Landslide of 2010"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.degruyter.com/view/j/ev.2010.7.4/ev.2010.7.4.1796/ev.2010.7.4.1796.xml?format=INT",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Yoram",
						"lastName": "Bauman",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"title": "Comment on Nordhaus: Carbon Tax Calculations",
				"publicationTitle": "The Economists' Voice",
				"volume": "7",
				"issue": "4",
				"url": "http://www.degruyter.com/view/j/ev.2010.7.4/ev.2010.7.4.1796/ev.2010.7.4.1796.xml?format=INT",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "www.degruyter.com",
				"abstractNote": "William Nordhaus confuses the impact of a tax on carbon and a tax on carbon dioxide, according to Yoram Bauman.",
				"date": "2010/10/08",
				"shortTitle": "Comment on Nordhaus"
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
		"url": "http://www.degruyter.com/view/product/218879",
		"items": [
			{
				"itemType": "book",
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
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Datenbanksysteme, Eine Einführung",
				"publisher": "De Gruyter",
				"place": "Berlin, Boston",
				"ISBN": "978-3-486-59834-6",
				"url": "http://www.degruyter.com/view/product/218879",
				"language": "DT",
				"date": "2011",
				"abstractNote": "Dieses Buch vermittelt eine systematische und umfassende Einführung in moderne Datenbanksysteme. Der Schwerpunkt der Darstellung liegt auf der derzeit marktbeherrschenden relationalen Datenbanktechnologie, aber auch Entwicklungen wie XML und Web-Services werden ausführlich behandelt. Das Besondere an diesem Buch: - Das Buch behandelt auch Implementierungsaspekte und betont die praktischen Aspekte des Datenbankbereichs -- ohne jedoch die theoretischen Grundlagen zu vernachlässigen. - Der Einsatz von Datenbanken als Data Warehouse für Decision Support-Anfragen sowie für das Data Mining wird beschrieben. - Ein umfangreiches Kapitel behandelt die Realisierung von Internet-Datenbanken mit Hilfe der Java-Anbindungen. - Inhaltliche Abhängigkeiten zwischen den Kapiteln sind gering gehalten, so dass im Grundstudium vermittelte Gebiete problemlos im Hauptstudium mit den übrigen Kapiteln zu vervollständigen sind. - Alle Konzepte werden an gut verständlichen Beispielen veranschaulicht, so dass sich das Buch hervorragend zum Selbststudium eignet. Eine ideale Ergänzung bietet darüber hinaus das Übungsbuch Datenbanksysteme von Kemper und Wimmer, das Lösungsvorschlage für die Übungsaufgaben und weitergehende (teilweise multimediale) Lernhilfen enthält. Für die 8. Auflage wurden die Ausführungen aktualisiert und neuere Entwicklungen aufgegriffen. Techniken für die Beherrschbarkeit der Informationsflut des Webs, wie NoSQL Key-Value-Speicher, RDF/SPARQL als Grundlage des Semantic Web, Information Retrieval und Suchmaschinen-Grundlagen (u.a. PageRank), hochgradig verteilte Datenverarbeitung (MapReduce), Datenströme, Hauptspeicher-Datenbanken und Cloud/Multi-Tenancy Datenbanken sind einige der neuen Themen.",
				"libraryCatalog": "DeGruyter"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.degruyter.com/view/j/jah-2013-1-issue-2/jah-2013-0010/jah-2013-0010.xml",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Meggitt",
						"creatorType": "author",
						"firstName": "Justin J."
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Did Magic Matter? The Saliency of Magic in the Early Roman Empire",
				"publicationTitle": "Journal of Ancient History",
				"journalAbbreviation": "jah",
				"volume": "1",
				"issue": "2",
				"pages": "170–229",
				"ISSN": "2324-8114",
				"DOI": "10.1515/jah-2013-0010",
				"url": "http://www.degruyter.com/view/j/jah-2013-1-issue-2/jah-2013-0010/jah-2013-0010.xml",
				"date": "2013",
				"abstractNote": "Magic is usually assumed to have been ubiquitous and culturally significant in the early Roman Empire, something exemplified by Pliny the Elder’s claim that “there is no one who does not fear to be spell-bound by curse tablets”.1 A variety of written and material evidence is commonly taken to be indicative of both the regular use of magic and widespread anxiety about its deployment. However, this paper argues that if we attempt, having determined a contextually appropriate definition of magic, to gauge the prevalence and significance of magic in this period, it can be seen to have had little cultural salience. Not only is evidence for its presence more equivocal than usually presumed, but magic is found to be strikingly absent from major popular cultural sources that shed light on the presuppositions and preoccupations of most of the empire’s inhabitants, and to have had little explanatory or symbolic utility. The paper then proceeds to suggest possible reasons for magic’s lack of salience in the early Empire, including the role of various sceptical discourses concerned with the supernatural in general and magic in particular, and the consequence of the largely agonistic context of its use on the limited occasions that it was employed.",
				"libraryCatalog": "DeGruyter",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Did Magic Matter?"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.degruyter.com/browse?authorCount=5&pageSize=10&searchTitles=true&sort=datedescending&t1=WS&type_0=books&type_1=journals",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.degruyter.com/view/IBZ/55568460-8061-41c8-8479-783eefecc02f",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Zamir",
						"creatorType": "author",
						"firstName": "Sara"
					}
				],
				"notes": [],
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
				"seeAlso": [],
				"attachments": [],
				"title": "The Principle of the Eternal-Feminine in Rossini’s L’Italiana in Algeri: Isabella as the Italian Super-Woman",
				"archive": "IBZ Online",
				"ISSN": "0211-3538",
				"publicationTitle": "Anuario Musical",
				"issue": "66",
				"pages": "165-180",
				"abstractNote": "La expresión Eterno Femenino (Eternal-Feminine, o Das Ewig-Weibliche), apareció por primera vez en los últimos versos de la segunda parte del Fausto de Goethe (acabado en 1832). Posteriormente, se convirtió en tema de especulación, y en un enigma que los estudiosos han estado intentando resolver desde entonces. La expresión vino a identificar, con el paso del tiempo, un principio cultural relacionado con la imagen de la feminidad y alcanzó su extremo romántico, en el siglo XIX, cuando diversos arquetipos femeninos se fundieron en una sola heroína. El presente artículo pretende explorar el personaje de Isabella en La italianaen Argel de Rossini, a la luz del principio del Eterno Femenino. Aunque Goethe se encontraba todavía escribiendo la segunda parte de su Fausto cuando se estrenó La italiana (1813) en Italia, el principio cultural del Eterno Femenino puede utilizarse retrospectivamente en el análisis de Isabella como protagonista femenino central de la ópera. La lectura minuciosa de su personaje sugiere una aproximación estética que hace uso de ciertos aspectos románticos del principio del Eterno Femenino. El presente artículo se centra específicamente en la escena del Cruda sorte! Amor tiranno! y se refiere brevemente, también, a otras escenas",
				"url": "http://www.degruyter.com/view/IBZ/55568460-8061-41c8-8479-783eefecc02f",
				"date": "2011",
				"libraryCatalog": "DeGruyter",
				"shortTitle": "The Principle of the Eternal-Feminine in Rossini’s L’Italiana in Algeri"
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