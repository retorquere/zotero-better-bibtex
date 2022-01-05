{
	"translatorID": "72cb2536-3211-41e0-ae8b-974c0385e085",
	"label": "ARTFL Encyclopedie",
	"creator": "Sean Takats, Sebastian Karcher",
	"target": "^https?://artflsrv\\d+\\.uchicago\\.edu/cgi-bin/philologic/(getobject\\.pl\\?[cp]\\.[0-9]+:[0-9]+(:[0-9]+)?\\.encyclopedie|navigate\\.pl\\?encyclopedie|search3t\\?dbname=encyclopedie)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcv",
	"lastUpdated": "2017-01-01 16:50:31"
}

function detectWeb(doc, url) {
	if (url.indexOf("getobject.pl") != -1){
		return "encyclopediaArticle";
	} else if (url.indexOf("navigate.pl")!=-1){//browsing
		return "multiple";
	} else if (url.indexOf("search3t?")!=-1){//search results
		return "multiple"
	}
}

function reconcileAuthor(author){
	var authorMap = {
		"Venel":"Venel, Gabriel-François",
		"d'Aumont":"d'Aumont, Arnulphe",
		"de La Chapelle":"de La Chapelle, Jean-Baptiste",
		"Bourgelat":"Bourgelat, Claude",
		"Dumarsais":"Du Marsais, César Chesneau",
		"Mallet":"Mallet, Edme-François",
		"Toussaint":"Toussaint, François-Vincent",
		"Daubenton":"Daubenton, Louis-Jean-Marie",
		"d'Argenville": "d'Argenville, Antoine-Joseph Desallier",
		"Tarin":"Tarin, Pierre",
		"Vandenesse":"de Vandenesse, Urbain",
		"Blondel": "Blondel, Jacques-François",
		"Le Blond":"Le Blond, Guillaume",
		"Rousseau":"Rousseau, Jean-Jacques",
		"Eidous":"Eidous, Marc-Antoine",
		"d'Alembert":"d'Alembert, Jean le Rond",
		"Louis":"Louis, Antoine",
		"Bellin":"Bellin, Jacques-Nicolas",
		"Diderot":"Diderot, Denis",
		"Diderot1":"Diderot, Denis",
		"Diderot2":"Diderot, Denis",
		"de Jaucourt":"de Jaucourt, Chevalier Louis",
		"Jaucourt":"de Jaucourt, Chevalier Louis",
		"d'Holbach":"d'Holbach, Baron"
		/* not yet mapped
		Yvon
		Forbonnais
		Douchet and Beauzée
		Boucher d'Argis
		Lenglet Du Fresnoy
		Cahusac
		Pestré
		Daubenton, le Subdélégué
		Goussier
		de Villiers
		Barthès
		Morellet
		Malouin
		Ménuret de Chambaud
		Landois
		Le Roy
		*/
	}
	if (authorMap[author]) {
		author = authorMap[author];
	}
	// remove ARTFL's trailing 5 for odd contributors (e.g. Turgot5)
		if (author.substr(author.length-1, 1)=="5"){
		author = author.substr(0, author.length-1);
	}
	return author;
}

function scrape (doc, url){
	var newItem = new Zotero.Item("encyclopediaArticle");
	newItem.title = ZU.xpathText(doc, '(//index[@type="headword"])[1]/@value')
	newItem.encyclopediaTitle = "Encyclopédie, ou Dictionnaire raisonné des sciences, des arts et des métiers";
	newItem.shortTitle = "Encyclopédie";
	newItem.date = "1751-1772";
	newItem.publisher = "Briasson";
	newItem.place = "Paris";
	newItem.numberOfVolumes = "17";
	newItem.creators.push({firstName:"Denis", lastName:"Diderot", creatorType:"editor"});
	newItem.creators.push({firstName:"Jean le Rond", lastName:"d'Alembert", creatorType:"editor"});
	newItem.url = url;
	newItem.attachments.push({title:"ARTFL Snapshot", mimeType:"text/html", document:doc});
	
	var volpage = ZU.xpathText(doc, '(//index/a[contains(@href, "getobject.pl") and contains(text(), ":")])[1]');
	if (!volpage){//pageview
		var volpage = ZU.xpathText(doc, '//div[@id="content"]/center[contains(text(), ":")]/text()')
	}
	if (volpage){
		volpage = volpage.match(/(\d+):([A-Z\d]+)/); //page number can have letters
		newItem.volume = volpage[1];
		newItem.pages = volpage[2];
	}
	var authors = ZU.xpathText(doc, '(//index[@type="author"])[1]/@value');
	if (authors){
		author = authors.split(/\s*\|\s*/);
		for (var i =0; i<author.length; i++){
			newItem.creators.push(ZU.cleanAuthor(reconcileAuthor(author[i]), "author", true))	
		}
	}
	newItem.complete();
}

function doWeb(doc, url) {

	if (url.indexOf("getobject.pl") != -1){
		// single article
		scrape(doc, url);				
	} else {
		//search page
		var items = {};
		var urls = [];
		var xpath = '//a[contains(@href, "getobject.pl")]';
		var elmts = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
		var elmt;		
		while (elmt = elmts.iterateNext()){
			var title = elmt.textContent;
			var link = elmt.href;
			if (title && link){
				items[link] = title;
			}			
		}
		Z.selectItems(items, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, scrape);
		});
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://artflsrv02.uchicago.edu/cgi-bin/philologic/getobject.pl?c.0:683:1.encyclopedie0513",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"creators": [
					{
						"firstName": "Denis",
						"lastName": "Diderot",
						"creatorType": "editor"
					},
					{
						"firstName": "Jean le Rond",
						"lastName": "d'Alembert",
						"creatorType": "editor"
					},
					{
						"lastName": "Yvon",
						"creatorType": "author"
					},
					{
						"firstName": "François-Vincent",
						"lastName": "Toussaint",
						"creatorType": "author"
					},
					{
						"firstName": "Denis",
						"lastName": "Diderot",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ARTFL Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Adultere",
				"encyclopediaTitle": "Encyclopédie, ou Dictionnaire raisonné des sciences, des arts et des métiers",
				"shortTitle": "Encyclopédie",
				"date": "1751-1772",
				"publisher": "Briasson",
				"place": "Paris",
				"numberOfVolumes": "17",
				"url": "http://artflsrv02.uchicago.edu/cgi-bin/philologic/getobject.pl?c.0:683:1.encyclopedie0513",
				"volume": "1",
				"pages": "150",
				"libraryCatalog": "ARTFL Encyclopedie",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://artflsrv02.uchicago.edu/cgi-bin/philologic/getobject.pl?p.0:203.encyclopedie0513",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"creators": [
					{
						"firstName": "Denis",
						"lastName": "Diderot",
						"creatorType": "editor"
					},
					{
						"firstName": "Jean le Rond",
						"lastName": "d'Alembert",
						"creatorType": "editor"
					},
					{
						"firstName": "Pierre",
						"lastName": "Tarin",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ARTFL Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "ADULTE",
				"encyclopediaTitle": "Encyclopédie, ou Dictionnaire raisonné des sciences, des arts et des métiers",
				"shortTitle": "Encyclopédie",
				"date": "1751-1772",
				"publisher": "Briasson",
				"place": "Paris",
				"numberOfVolumes": "17",
				"url": "http://artflsrv02.uchicago.edu/cgi-bin/philologic/getobject.pl?p.0:203.encyclopedie0513",
				"volume": "1",
				"pages": "150",
				"libraryCatalog": "ARTFL Encyclopedie",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://artflsrv02.uchicago.edu/cgi-bin/philologic/search3t?dbname=encyclopedie0513&word=amour&CONJUNCT=PHRASE&dgdivhead=&dgdivocauthor=&ExcludeDiderot3=on&dgdivocsalutation=&OUTPUT=conc&POLESPAN=5",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://artflsrv02.uchicago.edu/cgi-bin/philologic/search3t?dbname=encyclopedie0513&dgdivhead=EAU",
		"items": "multiple"
	}
]
/** END TEST CASES **/