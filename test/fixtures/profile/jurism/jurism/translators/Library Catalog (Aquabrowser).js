{
	"translatorID": "915c326f-06c5-4833-b7b7-54c63f88b135",
	"label": "Library Catalog (Aquabrowser)",
	"creator": "Sebastian Karcher",
	"target": "/fullrecordinnerframe\\.ashx\\?.+id=|/result\\.ashx\\?",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 270,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2014-08-26 03:51:35"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2011 Sebastian Karcher and the Center for History and New Media
					 George Mason University, Fairfax, Virginia, USA
					 http://zotero.org
	
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

/* other working implementations: 
http://zoeken.oba.nl/
http://aquabrowser.lib.ed.ac.uk
http://boss.library.okstate.edu/

Not working bc export isn't implemented: None of these are academic, so I'm not particularly worried
http://cabrio.bibliotheek.brugge.be/
http://aquabrowser.selco.info/?c_profile=rw
http://kcaqua.kclibrary.org
http://aquabrowser.biboostende.be/
http://abl.courthouselibrary.ca/
http://leocat.saintleo.edu
*/

function detectWeb(doc, url) {
	if (url.match(/\/result\.ashx\?/) && ZU.xpath(doc, '//div[@class="titlenew"]//a[@class="classiclink"]').length>0) return "multiple";
	if (url.match(/\/fullrecordinnerframe\.ashx\?.+id=/)) return "book";
}
	

function doWeb(doc, url){

	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") { 
		var items = {};
		var titles = doc.evaluate('//div[@class="titlenew"]//a[@class="classiclink"]', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		var id;
		while (title = titles.iterateNext()) {
			items[title.href] = ZU.trimInternal(title.textContent);
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				//some implementations don't have direct links, just the id in javascript
				if (i.search(/^javascript/)!=-1){
					//remove the javascript escaping
					i=i.replace(/\\/g, "");
					id = "itemid=" + i.match(/\(\'(.+?)\'/)[1];
				}
				else id = i.match(/[^&\?]+id=[^&]+/)[0]
				articles.push(makeURL(id));
			}
			//Z.debug(articles)
			scrape(articles);
		});
	} else {
		var id = url.match(/[^&\?]+id=[^&]+/)[0];
		var risurl = makeURL(id);
		scrape (risurl);
	}
}

function makeURL(id){
	var idnumber = id.match(/=(.+)/)[1];
	var risurl = "/export.ashx?type=export-ris&app=endnote&file=" +idnumber + "&" + id;
	return risurl;
}


function scrape(risurl){
	Zotero.Utilities.HTTP.doGet(risurl, function (text) {
		//I'll leave this debugging in for the time being
		Z.debug("This should be RIS: " + text)
		//fix years - we don't like letters immediately before dates
		text = text.replace(/(Y  - )[A-Za-z]+(\d{4})/, "$1$2");
		//apparently the RIS doesn't do well with item types
		text = text.replace(/TY  - (Boek|GEN)/, "TY  - BOOK");
		
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			if (item.pages) item.numPages = item.pages;
			//remove space before :
			item.title = item.title.replace(/\s+:/, ":");
			for (i in item.creators){
				//for some reason there's often a period after the first name of authors. Delete this, making sure it's not an initial
				if (item.creators[i].firstName){
					item.creators[i].firstName = item.creators[i].firstName.replace(/([a-z]+)\.\s*$/, "$1");
				}
			}
			item.url = "";
			item.complete();
		});	
		translator.translate();
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://lens.lib.uchicago.edu/result.ashx?inlibrary=false&noext=false&debug=&lastquery=&lvq=&lsi=&uilang=en&searchmode=assoc&hardsort=&skin=hybrid-uc&rctx=&c_over=1&curpage=1&concept=institutions&branch=&ref=&i_fk=&mxdk=-1&q=institutions&si=user&cs=user&cmd=find#",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://lens.lib.uchicago.edu/fullrecordinnerframe.ashx?skin=hybrid-uc&cmd=frec&cs=url&hreciid=|library%2fmarc%2fuc|4857057",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "Turner",
						"firstName": "Jonathan H.",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "<p>Includes bibliographical references (p. 283-300) and indexes.</p>"
					}
				],
				"tags": [
					"Social institutions.",
					"Social evolution."
				],
				"seeAlso": [],
				"attachments": [],
				"title": "Human institutions: a theory of societal evolution",
				"place": "Lanham",
				"publisher": "Rowman & Littlefield",
				"ISBN": "0742525589 (cloth : alk. paper)",
				"numPages": "xiv, 309 p.",
				"abstractNote": "1. Institutional Analysis -- 2. A Theory of Macrodynamic Forces -- 3. The Institutional Core -- 4. Institutional Systems of Hunter-Gatherer Populations -- 5. Institutional Systems of Horticultural Populations -- 6. Institutional Systems of Agrarian Populations -- 7. Institutional Systems of Industrial and Post-industrial Populations -- 8. Fundamental Interchanges Among Institutions.",
				"callNumber": "HM826 .T87 2003 Regenstein, Bookstacks",
				"date": "2003",
				"libraryCatalog": "Library Catalog (Aquabrowser)",
				"shortTitle": "Human institutions"
			}
		]
	},
	{
		"type": "web",
		"url": "http://hollis.harvard.edu/result.ashx?inlibrary=false&noext=false&debug=&lastquery=&lvq=&lsi=&uilang=en&searchmode=assoc&hardsort=&skin=harvard&c_over=1&curpage=1&concept=thelen&branch=&ref=&i_fk=&mxdk=-1&q=thelen&si=user&cs=url&cmd=find",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://hollis.harvard.edu/fullrecordinnerframe.ashx?skin=harvard&cmd=frec&cs=url&hreciid=%7clibrary%2fm%2faleph%7c001633883&curpage=1&uilang=en&c_over=1&rctx=AAMAAAABAAAAAwAAAKRSAAAHaGFydmFyZAAAAAAAAAAEZnJlYwAafGxpYnJhcnkvbS9hbGVwaHwwMDE2MzM4ODMAAAADdXJsBWFzc29jAQAAAAAAAAACZW4AAP%2f%2f%2f%2f8AAAAAAAAAAAIAAAAGY19vdmVyATEEaV9mawAAAAAA",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "Thelen",
						"firstName": "Christian",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "<p>Includes bibliographical references (p. [703]-726) and index.</p>"
					},
					{
						"note": "<p>HOLLIS no. 001633883</p>"
					}
				],
				"tags": [
					"German literature -- Middle High German, 1050-1500 -- History and criticism.",
					"German literature -- Old High German, 750-1050 -- History and criticism.",
					"Prayer in literature.",
					"Prayers, Medieval."
				],
				"seeAlso": [],
				"attachments": [],
				"title": "Das Dichtergebet in der deutschen Literatur des Mittelalters",
				"place": "Berlin ;New York",
				"publisher": "W. De Gruyter",
				"ISBN": "3110116715",
				"numPages": "x, 726 p.",
				"callNumber": "Widener Harvard Depository PT573.R4 T4 1989x [Consult Circ. Desk for HX45IM]",
				"series": "Arbeiten zur Frühmittelalterforschung ; Bd. 18",
				"volume": "Bd. 18",
				"date": "1989",
				"libraryCatalog": "Library Catalog (Aquabrowser)"
			}
		]
	},
	{
		"type": "web",
		"url": "http://aquabrowser.hhs.nl/fullrecordinnerframe.ashx?skin=hhs&q=institutions&cmd=frec&si=user&cs=resultlist&hreciid=|library%2fhhs|20438",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "Erskine",
						"firstName": "Toni",
						"creatorType": "seriesEditor"
					}
				],
				"notes": [],
				"tags": [
					"Internationale organisaties",
					"Ethische aspecten"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "Can institutions have responsibilities?",
				"series": "collective moral agency and international relations",
				"numPages": "XII, 241 p",
				"place": "Basingstoke [etc.]",
				"publisher": "Palgrave Macmillan",
				"ISBN": "0333971299",
				"abstractNote": "Assigning responsibilities to institutional moral agents : the case of states and 'quasi-states' / Toni Erskine -- Moral responsibility and the problem of representing the state / David Runiciman -- Moral agency and international society : reflections on norms, the UN, the Gulf War, and the Kosovo campaign / Chris Brown -- Collective moral agency and the political process / Frances V. Harbour -- Constitutive theory and moral accountability : individuals, institutions, and dispersed practices / Mervyn Frost -- When agents cannot act : international institutions as 'moral patients' / Cornelia Navari -- NATO and the individual soldier as moral agents with reciprocal duties : imbalance in the Kosovo campaign / Paul Cornish, Frances V. Harbour -- The anti-sweatshop movement : constructing corporate moral agency in the global apparel industry / Rebecca DeWinter -- The responsibility of collective external bystanders in cases of genocide : the French in Rwanda / Daniela Kroslak -- The United Nations and the fall of Srebrenica : meaningful responsibility and international society / Anthony Lang, Jr. -- On 'good global governance', institutional design, and the practices of moral agency / Nicholas Rengger -- Global justice: aims, arrangements, and responsibilities / Christian Barry",
				"date": "2003",
				"libraryCatalog": "Library Catalog (Aquabrowser)"
			}
		]
	}
]
/** END TEST CASES **/