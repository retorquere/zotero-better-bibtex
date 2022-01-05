{
	"translatorID": "1b9ed730-69c7-40b0-8a06-517a89a3a278",
	"label": "Library Catalog (PICA)",
	"creator": "Sean Takats, Michael Berkowitz, Sylvain Machefert, Sebastian Karcher",
	"target": "^https?://[^/]+(/[^/]+)?//?DB=\\d",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 248,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2018-01-26 09:57:02"
}

function getSearchResults(doc) {
	return doc.evaluate(
		"//table[@summary='short title presentation']/tbody/tr//td[contains(@class, 'rec_title')]|//table[@summary='hitlist']/tbody/tr//td[contains(@class, 'hit') and a/@href]",
		doc, null, XPathResult.ANY_TYPE, null);
}

function detectWeb(doc, url) {
	var multxpath = "//span[@class='tab1']|//td[@class='tab1']";
	if (elt = doc.evaluate(multxpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var content = elt.textContent;
		//Z.debug(content)
		if ((content == "Liste des résultats") || (content == "shortlist") || (content == 'Kurzliste') || content == 'titellijst') {
			if (!getSearchResults(doc).iterateNext()) return;	//no results. Does not seem to be necessary, but just in case.
			return "multiple";
			
		} else if ((content == "Notice détaillée") || (content == "title data") || (content == 'Titeldaten') || (content == 'Vollanzeige') || 
					(content == 'Besitznachweis(e)') || (content == 'full title') || (content == 'Titelanzeige' || (content == 'titelgegevens'))) {
			var xpathimage = "//span[@class='rec_mat_long']/img|//table[contains(@summary, 'presentation')]/tbody/tr/td/img";
			if (elt = doc.evaluate(xpathimage, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
				var type = elt.getAttribute('src');
				//Z.debug(type);
				if (type.includes('article.')) {
					//book section and journal article have the same icon
					//we can check if there is an ISBN
					if (ZU.xpath(doc, '//tr/td[@class="rec_lable" and .//span[starts-with(text(), "ISBN")]]').length) {
						return 'bookSection';
					}
					return "journalArticle";
				} else if (type.includes('audiovisual.')) {
					return "film";
				} else if (type.includes('book.')) {
					return "book";
				} else if (type.includes('handwriting.')) {
					return "manuscript";
				} else if (type.includes('sons.') || type.includes('sound.') || type.includes('score')) {
					return "audioRecording";
				} else if (type.includes('thesis.')) {
					return "thesis";
				} else if (type.includes('map.')) {
					return "map";
				}
			}
			return "book";
		}
	}
}

function scrape(doc, url) {
	var zXpath = '//span[@class="Z3988"]';
	var eltCoins = doc.evaluate(zXpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (eltCoins) {
		var coins = eltCoins.getAttribute('title');

		var newItem = new Zotero.Item();
		//newItem.repository = "SUDOC"; // do not save repository
		//make sure we don't get stuck because of a COinS error
		try {
			Zotero.Utilities.parseContextObject(coins, newItem);
		} catch(e) {
			Z.debug("error parsing COinS");
		}
		/** we need to clean up the results a bit **/
		//pages should not contain any extra characters like p. or brackets (what about supplementary pages?)
		if (newItem.pages) newItem.pages = newItem.pages.replace(/[^\d-]+/g, '');
		
		
	} else var newItem = new Zotero.Item();

	newItem.itemType = detectWeb(doc, url);
	newItem.libraryCatalog = "Library Catalog - " + doc.location.host;
	// 	We need to correct some informations where COinS is wrong
	var rowXpath = '//tr[td[@class="rec_lable"]]';
	if (!ZU.xpathText(doc, rowXpath)){
		rowXpath = '//tr[td[@class="preslabel"]]';
	}
	var tableRows = doc.evaluate(rowXpath, doc, null, XPathResult.ANY_TYPE, null);
	
	var tableRow, role;
	var authorpresent = false;
	while (tableRow = tableRows.iterateNext()) {
		var field = doc.evaluate('./td[@class="rec_lable"]|./td[@class="preslabel"]', tableRow, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		var value = doc.evaluate('./td[@class="rec_title"]|./td[@class="presvalue"]', tableRow, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		
		field = ZU.trimInternal(ZU.superCleanString(field.trim()))
			.toLowerCase().replace(/\(s\)/g, '');	
				
		// With COins, we only get one author - so we start afresh. We do so in two places: Here if there is an author fied
		//further down for other types of author fields. This is so we don't overwrite the author array when we have both an author and 
		//another persons field (cf. the Scheffer/Schachtschabel/Blume/Thiele test)
		if (field == "author" || field == "auteur" || field == "verfasser"){ 
			authorpresent = true;
			newItem.creators = new Array();
		}	
		//Z.debug(field + ": " + value)
		//french, english, german, and dutch interface
		switch (field) {
			case 'auteur':
			case 'author':
			case 'medewerker':
			case 'beteiligt':
			case 'verfasser':
			case 'other persons':
			case 'sonst. personen':
			case 'collaborator':
			case 'beiträger': //turn into contributor
			case 'contributor':
				if (field == 'medewerker' || field == 'beteiligt'||field =='collaborator') role = "editor";
				if (field == 'beiträger' || field == 'contributor') role = "contributor";
				//we may have set this in the title field below
				else if (!role) role = "author";
				
				if (!authorpresent) newItem.creators = new Array();
				if (authorpresent && (field=="sonst. personen" || field=="other persons")) role = "editor";
				//sudoc has authors on separate lines and with different format - use this
				if (url.search(/sudoc\.(abes\.)?fr/) != -1) {

					var authors = ZU.xpath(tableRow, './td[2]/div');
					for (var i in authors) {
						var authorText = authors[i].textContent;
						var authorFields = authorText.match(/^\s*(.+?)\s*(?:\((.+?)\)\s*)?\.\s*([^\.]+)\s*$/);
						var authorFunction = '';
						if (authorFields) {
							authorFunction = authorFields[3];
							authorText = authorFields[1];
							var extra = authorFields[2];
						}
						if (authorFunction) {
							authorFunction = Zotero.Utilities.superCleanString(authorFunction);
						}
						var zoteroFunction = '';
						// TODO : Add other author types
						if (authorFunction == 'Traduction') {
							zoteroFunction = 'translator';
						} else if ((authorFunction.substr(0, 7) == 'Éditeur') || authorFunction=="Directeur de la publication") {
							//once Zotero suppports it, distinguish between editorial director and editor here;
							zoteroFunction = 'editor';
						} else if ((newItem.itemType == "thesis") && (authorFunction != 'Auteur')) {
							zoteroFunction = "contributor";
						} else {
							zoteroFunction = 'author';
						}

						if (authorFunction == "Université de soutenance" || authorFunction == "Organisme de soutenance") {
							// If the author function is "université de soutenance"	it means that this author has to be in "university" field
							newItem.university = authorText;
							newItem.city = extra; //store for later
						} else {
							var author = authorText.replace(/[\*\(].+[\)\*]/, "");
							newItem.creators.push(Zotero.Utilities.cleanAuthor(author, zoteroFunction, true));
						}
					}

				} else {
					var authors = value.split(/\s*;\s*/);
					for (var i in authors) {
						if (role == "author") if (authors[i].search(/[\[\()]Hrsg\.?[\]\)]/)!=-1) role = "editor";
						var author = authors[i].replace(/[\*\(\[].+[\)\*\]]/, "");
						var comma = author.indexOf(",") != -1;
						newItem.creators.push(Zotero.Utilities.cleanAuthor(author, role, comma));
					}
				}
				break;
			
			case 'edition':
			case 'ausgabe':
				var edition;
				if (edition = value.match(/(\d+)[.\s]+(Aufl|ed|éd)/)){
					newItem.edition = edition[1];
				}
				else newItem.edition = value;

			case 'dans':
			case 'in':
				//Looks like we can do better with titles than COinS
				//journal/book titles are always first
				//Several different formats for ending a title
				// end with "/" http://gso.gbv.de/DB=2.1/PPNSET?PPN=732386977
				//              http://gso.gbv.de/DB=2.1/PPNSET?PPN=732443563
				// end with ". -" followed by publisher information http://gso.gbv.de/DB=2.1/PPNSET?PPN=729937798
				// end with ", ISSN" (maybe also ISBN?) http://www.sudoc.abes.fr/DB=2.1/SET=6/TTL=1/SHW?FRST=10
				newItem.publicationTitle = ZU.superCleanString(
					value.substring(0,value.search(/(?:\/|,\s*IS[SB]N\b|\.\s*-)/i)));
				//ISSN/ISBN are easyto find
				//http://gso.gbv.de/DB=2.1/PPNSET?PPN=732386977
				//http://gso.gbv.de/DB=2.1/PPNSET?PPN=732443563
				var issnRE = /\b(is[sb]n)\s+([-\d\sx]+)/i;	//this also matches ISBN
				var m = value.match(issnRE);
				if (m) {
					if (m[1].toUpperCase() == 'ISSN' && !newItem.ISSN) {
						newItem.ISSN = m[2].replace(/\s+/g,'');
					} else if (m[1].toUpperCase() == 'ISBN' && !newItem.ISBN) {
						newItem.ISBN = m[2].replace(/\s+/g,'');
					}
				}
				//publisher information can be preceeded by ISSN/ISBN
				// typically / ed. by ****. - city, country : publisher
				//http://gso.gbv.de/DB=2.1/PPNSET?PPN=732386977
				var n = value;
				if (m) {
					n = value.split(m[0])[0];
					//first editors
					var ed = n.split('/');	//editors only appear after /
					if (ed.length > 1) {
						n = n.substr(ed[0].length+1);	//trim off title
						ed = ed[1].split('-',1)[0];
						n = n.substr(ed.length+1);	//trim off editors
						if (ed.indexOf('ed. by') != -1) {	//not http://gso.gbv.de/DB=2.1/PPNSET?PPN=732443563
							ed = ed.replace(/^\s*ed\.\s*by\s*|[.\s]+$/g,'')
									.split(/\s*(?:,|and)\s*/);	//http://gso.gbv.de/DB=2.1/PPNSET?PPN=731519299
							for (var i=0, m=ed.length; i<m; i++) {
								newItem.creators.push(ZU.cleanAuthor(ed[i], 'editor', false));
							}
						}
					}
					var loc = n.split(':');
					if (loc.length == 2) {
						if (!newItem.publisher) newItem.publisher = loc[1].replace(/^\s+|[\s,]+$/,'');
						if (!newItem.place) newItem.place = loc[0].replace(/\s*\[.+?\]\s*/, '').trim();
					}

					//we can now drop everything up through the last ISSN/ISBN
					n = value.split(issnRE).pop();
				}
				//For the rest, we have trouble with some articles, like
				//http://www.sudoc.abes.fr/DB=2.1/SRCH?IKT=12&TRM=013979922
				//we'll only take the last set of year, volume, issue

				//There are also some other problems, like
				//"How to cook a russian goose / by Robert Cantwell" at http://opc4.kb.nl

				//page ranges are last
				//but they can be indicated by p. or page (or s?)
				//http://www.sudoc.abes.fr/DB=2.1/SET=6/TTL=1/SHW?FRST=10
				//http://opc4.kb.nl/DB=1/SET=2/TTL=1/SHW?FRST=7
				//we'll just assume there are always pages at the end and ignore the indicator
				n = n.split(',');
				var pages = n.pop().match(/\d+(?:\s*-\s*\d+)/);
				if (pages && !newItem.pages) {
					newItem.pages = pages[0];
				}
				n = n.join(',');	//there might be empty values that we're joining here
									//could filter them out, but IE <9 does not support Array.filter, so we won't bother
				//we're left possibly with some sort of formatted volume year issue string
				//it's very unlikely that we will have 4 digit volumes starting with 19 or 20, so we'll just grab the year first
				var dateRE = /\b(?:19|20)\d{2}\b/g;
				var date, lastDate;
				while (date = dateRE.exec(n)) {
					lastDate = date[0];
					n = n.replace(lastDate,'');	//get rid of year
				}
				if (lastDate) {
					if (!newItem.date) newItem.date = lastDate;
				} else {	//if there's no year, panic and stop trying
					break;
				}
				//volume comes before issue
				//but there can sometimes be other numeric stuff that we have
				//not filtered out yet, so we just take the last two numbers
				//e.g. http://gso.gbv.de/DB=2.1/PPNSET?PPN=732443563
				var issvolRE = /[\d\/]+/g;	//in French, issues can be 1/4 (e.g. http://www.sudoc.abes.fr/DB=2.1/SRCH?IKT=12&TRM=013979922)
				var num, vol, issue;
				while (num = issvolRE.exec(n)) {
					if (issue != undefined) {
						vol = issue;
						issue = num[0];
					} else if (vol != undefined) {
						issue = num[0];
					} else {
						vol = num[0];
					}
				}
				if (vol != undefined && !newItem.volume) {
					newItem.volume = vol;
				}
				if (issue != undefined && !newItem.issue) {
					newItem.issue = issue;
				}
				break;
			case 'serie':
			case 'collection':
			case 'series':
			case 'schriftenreihe':
			case 'reeks':
				// The series isn't in COinS
				var series = value;
				var m;
				var volRE = /;[^;]*?(\d+)\s*$/;
				if (m = series.match(volRE)) {
					if (ZU.fieldIsValidForType('seriesNumber', newItem.itemType)) { //e.g. http://gso.gbv.de/DB=2.1/PPNSET?PPN=729937798
						if (!newItem.seriesNumber) newItem.seriesNumber = m[1];
					} else {	//e.g. http://www.sudoc.fr/05625248X
						if (!newItem.volume) newItem.volume = m[1];
					}
					series = series.replace(volRE, '').trim();
				}
				newItem.seriesTitle = newItem.series = series;	//see http://forums.zotero.org/discussion/18322/series-vs-series-title/
				break;

			case 'titre':
			case 'title':
			case 'titel':
			case 'title of article':
			case 'aufsatztitel':
				
					title = value.split(" / ");
					if (title[1]) {
						//Z.debug("Title1: "+title[1])
						//store this to convert authors to editors. 
						//Run separate if in case we'll do this for more languages
						//this assumes title precedes author - need to make sure that's the case
						if (title[1].match(/^\s*(ed. by|edited by|hrsg\. von|édité par)/)) role = "editor";
					}
				if (!newItem.title) {
					newItem.title = title[0];
				}
				newItem.title = newItem.title.replace(/\s+:/, ":").replace(/\s*\[[^\]]+\]/g, "");
				break;

			case 'periodical':
			case 'zeitschrift':
				//for whole journals
				var journaltitle =  value.split(" / ")[0];
				break;

			case 'year':
			case 'jahr':
			case 'jaar':
			case 'date':
				newItem.date = value; //we clean this up below
				break;

			case 'language':
			case 'langue':
			case 'sprache':
				// Language not defined in COinS
				newItem.language = value;
				break;

			case 'editeur':
			case 'published':
			case 'publisher':
			case 'ort/jahr':
			case 'uitgever':
			case 'publication':
				//ignore publisher for thesis, so that it does not overwrite university
				if (newItem.itemType == 'thesis' && newItem.university) break;

				var m = value.split(';')[0];	//hopefully publisher is always first (e.g. http://www.sudoc.fr/128661828)
				var place = m.split(':', 1)[0];
				var pub = m.substring(place.length+1); //publisher and maybe year
				if (!newItem.city) {
					place = place.replace(/[[\]]/g, '').trim();
					if (place.toUpperCase() != 'S.L.') {	//place is not unknown
						newItem.city = place;
					}
				}

				if (!newItem.publisher) {
					if (!pub) break; //not sure what this would be or look like without publisher
					pub = pub.replace(/\[.*?\]/g,'')	//drop bracketted info, which looks to be publisher role
									.split(',');
					if (pub[pub.length-1].search(/\D\d{4}\b/) != -1) {	//this is most likely year, we can drop it
						pub.pop();
					}
					if (pub.length) newItem.publisher = pub.join(',');	//in case publisher contains commas
				}
				if (!newItem.date) {	//date is always (?) last on the line
					m = value.match(/\D(\d{4})\b[^,;]*$/);	//could be something like c1986
					if (m) newItem.date = m[1];
				}
				break;

			case 'pays':
			case 'country':
			case 'land':
				if (!newItem.country) {
					newItem.country = value;
				}
				break;

			case 'description':
			case 'extent':
			case 'umfang':
			case 'omvang':
			case 'kollation':
			case 'collation':
				value = ZU.trimInternal(value); // Since we assume spaces
				
				// We're going to extract the number of pages from this field
				var m = value.match(/(\d+) vol\./);
				// sudoc in particular includes "1 vol" for every book; We don't want that info
				if (m && m[1] != 1) {
					newItem.numberOfVolumes = m[1];
				}
				
				//make sure things like 2 partition don't match, but 2 p at the end of the field do
				// f., p., and S. are "pages" in various languages
				// For multi-volume works, we expect formats like:
				//   x-109 p., 510 p. and X, 106 S.; 123 S.
				var numPagesRE = /\[?((?:[ivxlcdm\d]+[ ,\-]*)+)\]?\s+[fps]\b/ig,
					numPages = [], m;
				while (m = numPagesRE.exec(value)) {
					numPages.push(m[1].replace(/ /g, '')
						.replace(/[\-,]/g,'+')
						.toLowerCase() // for Roman numerals
					);
				}
				if (numPages.length) newItem.numPages = numPages.join('; ');
				
				//running time for movies:
				m = value.match(/\d+\s*min/);
				if (m){
					newItem.runningTime = m[0];
				}
				break;

			case 'résumé':
			case 'abstract':
			case 'inhalt':
			case 'samenvatting':
				newItem.abstractNote = value;
				break;

			case 'notes':
			case 'note':
			case 'anmerkung':
			case 'snnotatie':
			case 'annotatie':
				newItem.notes.push({
					note: doc.evaluate('./td[@class="rec_title"]|./td[@class="presvalue"]', tableRow, null, XPathResult.ANY_TYPE, null).iterateNext().innerHTML
				});
				break;

			case 'sujets':
			case 'subjects':
			case 'subject heading':
			case 'trefwoord':
			case 'schlagwörter':
			case 'gattung/fach':
			case 'category/subject':

				var subjects = doc.evaluate('./td[2]/div', tableRow, null, XPathResult.ANY_TYPE, null);
				//subjects on separate div lines
				if (ZU.xpath(tableRow, './td[2]/div').length > 1) {
					var subject_out = "";
					while (subject = subjects.iterateNext()) {
						var subject_content = subject.textContent;
						subject_content = subject_content.replace(/^\s*/, "");
						subject_content = subject_content.replace(/\s*$/, "");
						subject_content = subject_content.split(/\s*;\s*/)
						for (var i in subject_content) {
							if (subject_content != "") {
								newItem.tags.push(Zotero.Utilities.trimInternal(subject_content[i]));
							}
						}
					}
				} else {
					//subjects separated by newline or ; in same div.
					var subjects = value.trim().split(/\s*[;\n]\s*/)
					for (var i in subjects) {
						subjects[i] = subjects[i].trim().replace(/\*/g, "").replace(/^\s*\/|\/\s*$/, "");
						if (subjects[i].length!=0) newItem.tags.push(Zotero.Utilities.trimInternal(subjects[i]))
					}
				}
				break;

			case 'thèse':
			case 'dissertation':
				newItem.type = value.split(/ ?:/)[0];
				break;

			case "identifiant pérenne de la notice":
			case 'persistent identifier of the record':
			case 'persistent identifier des datensatzes':
				var permalink = value;	//we handle this at the end
				break;
			
			case 'doi':
				newItem.DOI = value.trim();

			case 'isbn':
				var isbns = value.trim().split(/[\n,]/);
				var isbn = [], s;
				for (var i in isbns) {
					var m = isbns[i].match(/[-x\d]{10,}/i);	//this is necessary until 3.0.12
					if (!m) continue;
					if (m[0].replace(/-/g,'').search(/^(?:\d{9}|\d{12})[\dx]$/i) != -1) {
						isbn.push(m[0]);
					}
				}
				//we should eventually check for duplicates, but right now this seems fine;
				newItem.ISBN = isbn.join(", ");
				break;
			
			case 'signatur':
				newItem.callNumber = value;
				break;
			case 'worldcat':
				//SUDOC only
				var worldcatLink = doc.evaluate('./td[2]//a', tableRow, null, XPathResult.ANY_TYPE, null).iterateNext();
				if (worldcatLink) {
					newItem.attachments.push({
						url: worldcatLink.href,
						title: 'Worldcat Link',
						mimeType: 'text/html',
						snapshot: false
					});
				}
				break;
		}
	}

	//merge city & country where they're separate
	var location = [];
	if (newItem.city) location.push(newItem.city.trim());
	newItem.city = undefined;
	if (newItem.country) location.push(newItem.country.trim());
	newItem.country = undefined;
	//join and remove the "u.a." common in German libraries
	if (location.length) newItem.place = location.join(', ').replace(/\[?u\.a\.\]?\s*$/, "");
	
	//remove u.a. and [u.a.] from publisher
	if (newItem.publisher){
		newItem.publisher = newItem.publisher.replace(/\[?u\.a\.\]?\s*$/, "");
	}
	
	//clean up date, which may come from various places; We're conservative here and are just cleaning up c1996 and [1995] and combinations thereof
	if (newItem.date){
		newItem.date = newItem.date.replace(/[\[c]+\s*(\d{4})\]?/, "$1");
	}
	//if we didn't get a permalink, look for it in the entire page
	if (!permalink) {
		var permalink = ZU.xpathText(doc, '//a[./img[contains(@src,"/permalink") or contains(@src,"/zitierlink")]][1]/@href');
	}
	
	//switch institutional authors to single field;
	for (var i=0; i<newItem.creators.length; i++){
		if (!newItem.creators[i].firstName){
			newItem.creators[i].fieldMode = true;
		}
	}
	if (permalink) {
		newItem.attachments.push({
			title: 'Link to Library Catalog Entry',
			url: permalink,
			mimeType: 'text/html',
			snapshot: false
		});
		//also add snapshot using permalink so that right-click -> View Online works
		newItem.attachments.push({
			title: 'Library Catalog Entry Snapshot',
			url: permalink,
			mimeType: 'text/html',
			snapshot: true
		});
	} else {
		//add snapshot
		newItem.attachments.push({
			title: 'Library Catalog Entry Snapshot',
			document: doc
		});
	}

	if (!newItem.title) newItem.title = journaltitle;
	newItem.complete();
}

function doWeb(doc, url) {
	var type = detectWeb(doc, url);
	if (type == "multiple") {
		var newUrl = doc.evaluate('//base/@href', doc, null, XPathResult.ANY_TYPE, null).iterateNext().nodeValue;
		// fix for sudoc, see #1529
		newUrl = newUrl.replace(/sudoc\.abes\.fr\/\/?DB=/, 'sudoc.abes.fr/xslt/DB=');
		var elmts = getSearchResults(doc);
		var elmt = elmts.iterateNext();
		var links = [];
		var availableItems = {};
		do {
			var link = doc.evaluate(".//a/@href", elmt, null, XPathResult.ANY_TYPE, null).iterateNext().nodeValue;
			var searchTitle = doc.evaluate(".//a", elmt, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			availableItems[newUrl + link] = searchTitle;
		} while (elmt = elmts.iterateNext());
		Zotero.selectItems(availableItems, function (items) {
			if (!items) {
				return true;
			}
			var uris = [];
			for (var i in items) {
				uris.push(i);
			}
			ZU.processDocuments(uris, scrape);
		});
	} else {
		scrape(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.sudoc.abes.fr/DB=2.1/CMD?ACT=SRCHA&IKT=1016&SRT=RLV&TRM=labor",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.sudoc.abes.fr/DB=2.1/SRCH?IKT=12&TRM=147745608",
		"items": [
			{
				"itemType": "book",
				"title": "Souffrance au travail dans les grandes entreprises",
				"creators": [
					{
						"firstName": "Jacques",
						"lastName": "Delga",
						"creatorType": "editor"
					},
					{
						"firstName": "Fabrice",
						"lastName": "Bien",
						"creatorType": "author"
					}
				],
				"date": "2010",
				"ISBN": "978-2-7472-1729-3",
				"language": "français",
				"libraryCatalog": "Library Catalog - www.sudoc.abes.fr",
				"numPages": "290",
				"place": "Paris, France",
				"publisher": "Eska",
				"attachments": [
					{
						"title": "Worldcat Link",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Conditions de travail -- France",
					"Harcèlement -- France",
					"Psychologie du travail",
					"Stress lié au travail -- France",
					"Violence en milieu de travail"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sudoc.abes.fr/DB=2.1/SRCH?IKT=12&TRM=156726319",
		"items": [
			{
				"itemType": "book",
				"title": "Zotero: a guide for librarians, researchers and educators",
				"creators": [
					{
						"firstName": "Jason",
						"lastName": "Puckett",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"ISBN": "978-0-83898589-2",
				"language": "anglais",
				"libraryCatalog": "Library Catalog - www.sudoc.abes.fr",
				"numPages": "159",
				"place": "Chicago, Etats-Unis",
				"publisher": "Association of College and Research Libraries",
				"shortTitle": "Zotero",
				"attachments": [
					{
						"title": "Worldcat Link",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Bibliographie -- Méthodologie -- Informatique"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sudoc.abes.fr/DB=2.1/SRCH?IKT=12&TRM=093838956",
		"items": [
			{
				"itemType": "thesis",
				"title": "Facteurs pronostiques des lymphomes diffus lymphocytiques",
				"creators": [
					{
						"firstName": "Brigitte",
						"lastName": "Lambert",
						"creatorType": "author"
					},
					{
						"firstName": "Pierre",
						"lastName": "Morel",
						"creatorType": "contributor"
					}
				],
				"date": "2004",
				"language": "français",
				"libraryCatalog": "Library Catalog - www.sudoc.abes.fr",
				"numPages": "87",
				"numberOfVolumes": "1",
				"place": "Lille, France",
				"type": "Thèse d'exercice",
				"university": "Université du droit et de la santé",
				"attachments": [
					{
						"title": "Worldcat Link",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Leucémie chronique lymphocytaire à cellules B -- Dissertations universitaires",
					"Leucémie lymphoïde chronique -- Thèses et écrits académiques",
					"Lymphocytes B -- Dissertations universitaires",
					"Lymphocytes B -- Thèses et écrits académiques",
					"Lymphome malin non hodgkinien -- Dissertations universitaires"
				],
				"notes": [
					{
						"note": "<div><span>Publication autorisée par le jury</span></div>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sudoc.abes.fr/DB=2.1/SRCH?IKT=12&TRM=127261664",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Mobile technology in the village: ICTs, culture, and social logistics in India",
				"creators": [
					{
						"firstName": "Sirpa",
						"lastName": "Tenhunen",
						"creatorType": "author"
					}
				],
				"date": "2008",
				"ISSN": "1359-0987",
				"issue": "3",
				"language": "anglais",
				"libraryCatalog": "Library Catalog - www.sudoc.abes.fr",
				"pages": "515-534",
				"place": "London, Royaume-Uni",
				"publicationTitle": "Journal of the Royal Anthropological Institute",
				"publisher": "Royal Anthropological Institute",
				"shortTitle": "Mobile technology in the village",
				"volume": "14",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Communes rurales -- Et la technique -- Aspect social -- Inde",
					"Inde -- Conditions sociales -- 20e siècle",
					"Téléphonie mobile -- Aspect social -- Inde"
				],
				"notes": [
					{
						"note": "<div><span>Contient un résumé en anglais et en français. - in Journal of the Royal Anthropological Institute, vol. 14, no. 3 (Septembre 2008)</span></div>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sudoc.abes.fr/DB=2.1/SRCH?IKT=12&TRM=128661828",
		"items": [
			{
				"itemType": "film",
				"title": "Exploring the living cell",
				"creators": [
					{
						"firstName": "Véronique",
						"lastName": "Kleiner",
						"creatorType": "author"
					},
					{
						"firstName": "Christian",
						"lastName": "Sardet",
						"creatorType": "author"
					}
				],
				"date": "2006",
				"ISBN": "0-8153-4223-3",
				"abstractNote": "Ensemble de 20 films permettant de découvrir les protagonistes de la découverte de la théorie cellulaire, l'évolution, la diversité, la structure et le fonctionnement des cellules. Ce DVD aborde aussi en images les recherches en cours dans des laboratoires internationaux et les débats que ces découvertes sur la cellule provoquent. Les films sont regroupés en 5 chapitres complétés de fiches informatives et de liens Internet.",
				"language": "anglais",
				"libraryCatalog": "Library Catalog - www.sudoc.abes.fr",
				"place": "Meudon, France",
				"publisher": "CNRS Images",
				"runningTime": "180 min",
				"attachments": [
					{
						"title": "Worldcat Link",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Biogenèse",
					"Biologie cellulaire",
					"Cell membranes",
					"Cells",
					"Cells -- Evolution",
					"Cells -- Moral and ethical aspects",
					"Cellules",
					"Cellules -- Aspect moral",
					"Cellules -- Évolution",
					"Cytologie -- Recherche",
					"Cytology -- Research",
					"Membrane cellulaire",
					"QH582.4",
					"Ultrastructure (biologie)"
				],
				"notes": [
					{
						"note": "<div><span>Les différents films qui composent ce DVD sont réalisés avec des prises de vue réelles, ou des images microcinématographiques ou des images de synthèse, ou des images fixes tirées de livres. La bande son est essentiellement constituée de commentaires en voix off et d'interviews (les commentaires sont en anglais et les interviews sont en langue originales : anglais, français ou allemand, sous-titrée en anglais). - Discovering the cell : participation de Paul Nurse (Rockefeller university, New York), Claude Debru (ENS : Ecole normale supérieure, Paris) et Werner Franke (DKFZ : Deutsches Krebsforschungszentrum, Heidelberg) ; Membrane : participation de Kai Simons, Soizig Le Lay et Lucas Pelkmans (MPI-CBG : Max Planck institute of molecular cell biology and genetics, Dresden) ; Signals and calcium : participation de Christian Sardet et Alex Mc Dougall (CNRS / UPMC : Centre national de la recherche scientifique / Université Pierre et Marie Curie, Villefrance-sur-Mer) ; Membrane traffic : participation de Thierry Galli et Phillips Alberts (Inserm = Institut national de la santé et de la recherche médicale, Paris) ; Mitochondria : participation de Michael Duchen, Rémi Dumollard et Sean Davidson (UCL : University college of London) ; Microfilaments : participation de Cécile Gauthier Rouvière et Alexandre Philips (CNRS-CRBM : CNRS-Centre de recherche de biochimie macromoléculaire, Montpellier) ; Microtubules : participation de Johanna Höög, Philip Bastiaens et Jonne Helenius (EMBL : European molecular biology laboratory, Heidelberg) ; Centrosome : participation de Michel Bornens et Manuel Théry (CNRS-Institut Curie, Paris) ; Proteins : participation de Dino Moras et Natacha Rochel-Guiberteau (IGBMC : Institut de génétique et biologie moléculaire et cellulaire, Strasbourg) ; Nocleolus and nucleus : participation de Daniele Hernandez-Verdun, Pascal Rousset, Tanguy Lechertier (CNRS-UPMC / IJM : Institut Jacques Monod, Paris) ; The cell cycle : participation de Paul Nurse (Rockefeller university, New York) ; Mitosis and chromosomes : participation de Jan Ellenberg, Felipe Mora-Bermudez et Daniel Gerlich (EMBL, Heidelberg) ; Mitosis and spindle : participation de Eric Karsenti, Maiwen Caudron et François Nedelec (EMBL, Heidelberg) ; Cleavage : participation de Pierre Gönczy, Marie Delattre et Tu Nguyen Ngoc (Isrec : Institut suisse de recherche expérimentale sur le cancer, Lausanne) ; Cellules souches : participation de Göran Hermerén (EGE : European group on ethics in science and new technologies, Brussels) ; Cellules libres : participation de Jean-Jacques Kupiec (ENS, Paris) ; Cellules et évolution : participation de Paule Nurse (Rockefeller university, New York)</span></div><div><span>&nbsp;</span></div>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sudoc.abes.fr/DB=2.1/SRCH?IKT=12&TRM=098846663",
		"items": [
			{
				"itemType": "map",
				"title": "Wind and wave atlas of the Mediterranean sea",
				"creators": [],
				"date": "2004",
				"ISBN": "2-11-095674-7",
				"language": "anglais",
				"libraryCatalog": "Library Catalog - www.sudoc.abes.fr",
				"publisher": "Western European Union, Western European armaments organisation research cell",
				"attachments": [
					{
						"title": "Worldcat Link",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Méditerranée (mer) -- Atlas",
					"Météorologie maritime -- Méditerranée (mer) -- Atlas",
					"Vagues -- Méditerranée (mer) -- Atlas",
					"Vent de mer -- Méditerranée (mer) -- Atlas",
					"Vents -- Méditerranée (mer) -- Atlas"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sudoc.abes.fr/DB=2.1/SRCH?IKT=12&TRM=05625248X",
		"items": [
			{
				"itemType": "audioRecording",
				"title": "English music for mass and offices (II) and music for other ceremonies",
				"creators": [
					{
						"firstName": "Ernest H.",
						"lastName": "Sanders",
						"creatorType": "author"
					},
					{
						"firstName": "Frank Llewellyn",
						"lastName": "Harrison",
						"creatorType": "author"
					},
					{
						"firstName": "Peter",
						"lastName": "Lefferts",
						"creatorType": "author"
					}
				],
				"date": "1986",
				"language": "latin",
				"libraryCatalog": "Library Catalog - www.sudoc.abes.fr",
				"numPages": "243",
				"place": "Monoco, Monaco",
				"publisher": "Éditions de l'oiseau-lyre",
				"attachments": [
					{
						"title": "Worldcat Link",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Messes (musique) -- Partitions",
					"Motets -- Partitions"
				],
				"notes": [
					{
						"note": "<div><span>Modern notation. - \"Critical apparatus\": p. 174-243</span></div><div><span>&nbsp;</span></div>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://gso.gbv.de/DB=2.1/PPNSET?PPN=732443563",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A new method to obtain a consensus ranking of a region's vintages' quality",
				"creators": [
					{
						"firstName": "José",
						"lastName": "Borges",
						"creatorType": "author"
					},
					{
						"firstName": "António C.",
						"lastName": "Real",
						"creatorType": "author"
					},
					{
						"firstName": "J. Sarsfield",
						"lastName": "Cabral",
						"creatorType": "author"
					},
					{
						"firstName": "Gregory V.",
						"lastName": "Jones",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"ISSN": "1931-4361",
				"issue": "1",
				"libraryCatalog": "Library Catalog - gso.gbv.de",
				"pages": "88-107",
				"place": "Walla Walla, Wash.",
				"publicationTitle": "Journal of wine economics",
				"publisher": "AAWE",
				"volume": "7",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
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
		"url": "http://gso.gbv.de/DB=2.1/PPNSET?PPN=731519299",
		"items": [
			{
				"itemType": "bookSection",
				"title": "'The truth against the world': spectrality and the mystic past in late twentieth-century Cornwall",
				"creators": [
					{
						"firstName": "Carl",
						"lastName": "Phillips",
						"creatorType": "author"
					},
					{
						"firstName": "Marion",
						"lastName": "Gibson",
						"creatorType": "editor"
					},
					{
						"firstName": "Shelley",
						"lastName": "Trower",
						"creatorType": "editor"
					},
					{
						"firstName": "Garry",
						"lastName": "Tregidga",
						"creatorType": "editor"
					}
				],
				"date": "2013",
				"ISBN": "978-0-415-62868-6, 978-0-415-62869-3, 978-0-203-08018-4",
				"bookTitle": "Mysticism, myth and Celtic identity",
				"libraryCatalog": "Library Catalog - gso.gbv.de",
				"pages": "70-83",
				"place": "London",
				"publisher": "Routledge ,",
				"shortTitle": "'The truth against the world'",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
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
		"url": "http://gso.gbv.de/DB=2.1/PPNSET?PPN=729937798",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Noise reduction potential of an engine oil pan",
				"creators": [
					{
						"firstName": "Tommy",
						"lastName": "Luft",
						"creatorType": "author"
					},
					{
						"firstName": "Stefan",
						"lastName": "Ringwelski",
						"creatorType": "author"
					},
					{
						"firstName": "Ulrich",
						"lastName": "Gabbert",
						"creatorType": "author"
					},
					{
						"firstName": "Wilfried",
						"lastName": "Henze",
						"creatorType": "author"
					},
					{
						"firstName": "Helmut",
						"lastName": "Tschöke",
						"creatorType": "author"
					}
				],
				"date": "2013",
				"ISBN": "978-3-642-33832-8",
				"journalAbbreviation": "Lecture Notes in Electrical Engineering",
				"libraryCatalog": "Library Catalog - gso.gbv.de",
				"pages": "291-304",
				"place": "Berlin",
				"publicationTitle": "Proceedings of the FISITA 2012 World Automotive Congress; Vol. 13: Noise, vibration and harshness (NVH)",
				"publisher": "Springer Berlin",
				"series": "Lecture notes in electrical engineering",
				"seriesNumber": "201",
				"seriesTitle": "Lecture notes in electrical engineering",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
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
		"url": "http://www.sudoc.abes.fr/DB=2.1/SRCH?IKT=12&TRM=013979922",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Health promotion by the family, the role of the family in enhancing healthy behavior, symposium 23-25 March 1992, Brussels",
				"creators": [
					{
						"lastName": "Organisation mondiale de la santé",
						"creatorType": "author",
						"fieldMode": true
					},
					{
						"lastName": "Congrès",
						"creatorType": "author",
						"fieldMode": true
					}
				],
				"date": "1992-1993",
				"ISSN": "0003-9578",
				"issue": "1/4",
				"language": "français",
				"libraryCatalog": "Library Catalog - www.sudoc.abes.fr",
				"pages": "3-232",
				"place": "Belgique",
				"publicationTitle": "Archives belges de médecine sociale, hygiène, médecine du travail et médecine légale",
				"volume": "51",
				"attachments": [
					{
						"title": "Worldcat Link",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Famille -- Actes de congrès",
					"Santé publique -- Actes de congrès"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://catalogue.rug.nl/DB=1/XMLPRS=Y/PPN?PPN=33112484X",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Naar een nieuwe 'onderwijsvrede': de onderhandelingen tussen kardinaal Van Roey en de Duitse bezetter over de toekomst van het vrij katholiek onderwijs, 1942-1943",
				"creators": [
					{
						"firstName": "Sarah Van",
						"lastName": "Ruyskensvelde",
						"creatorType": "author"
					}
				],
				"date": "2010",
				"ISSN": "0035-0869",
				"issue": "4",
				"libraryCatalog": "Library Catalog - catalogue.rug.nl",
				"pages": "603-643",
				"publicationTitle": "Revue belge d'histoire contemporaine = Belgisch tijdschrift voor nieuwste geschiedenis = Belgian review for contemporary history",
				"shortTitle": "Naar een nieuwe 'onderwijsvrede'",
				"volume": "40",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"(GTR) Belgie",
					"(GTR) Conflicten",
					"(GTR) Katholiek onderwijs",
					"(GTR) Tweede Wereldoorlog",
					"(GTR) Vrijheid van onderwijs"
				],
				"notes": [
					{
						"note": "<div><span>Met lit. opg</span></div><div><span>Met samenvattingen in het Engels en Frans</span></div>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://catalogue.rug.nl/DB=1/XMLPRS=Y/PPN?PPN=339552697",
		"items": [
			{
				"itemType": "film",
				"title": "Medianeras",
				"creators": [
					{
						"firstName": "Gustavo",
						"lastName": "Taretto",
						"creatorType": "author"
					},
					{
						"firstName": "Pilar López de",
						"lastName": "Ayala",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"libraryCatalog": "Library Catalog - catalogue.rug.nl",
				"place": "Amsterdam",
				"publisher": "Homescreen",
				"runningTime": "92 min",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"(GTR) Argentinië"
				],
				"notes": [
					{
						"note": "<div><span>Spaans gesproken, Nederlands en Frans ondertiteld</span></div>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://gso.gbv.de/DB=2.1/PPNSET?PPN=600530787",
		"items": [
			{
				"itemType": "book",
				"title": "Lehrbuch der Bodenkunde",
				"creators": [
					{
						"firstName": "Fritz",
						"lastName": "Scheffer",
						"creatorType": "author"
					},
					{
						"firstName": "Paul",
						"lastName": "Schachtschabel",
						"creatorType": "author"
					},
					{
						"firstName": "Hans-Peter",
						"lastName": "Blume",
						"creatorType": "editor"
					},
					{
						"firstName": "Sören",
						"lastName": "Thiele",
						"creatorType": "editor"
					}
				],
				"date": "2010",
				"ISBN": "978-3-8274-1444-1",
				"edition": "16",
				"libraryCatalog": "Library Catalog - gso.gbv.de",
				"numPages": "xiv+569",
				"place": "Heidelberg",
				"publisher": "Spektrum,  Akad.-Verl.",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Bodenkunde / Lehrbuch"
				],
				"notes": [
					{
						"note": "\n<div><span>Literaturangaben</span></div>\n<div style=\"display:none\" title=\"optional\" id=\"ANNOTATIE\"><span>Hier auch später ersch. unveränd. Nachdr.</span></div>\n"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://opac.tib.uni-hannover.de/DB=1/XMLPRS=N/PPN?PPN=620088028",
		"items": [
			{
				"itemType": "book",
				"title": "Phönix auf Asche: von Wäldern und Wandel in der Dübener Heide und Bitterfeld",
				"creators": [
					{
						"firstName": "Caroline",
						"lastName": "Möhring",
						"creatorType": "editor"
					}
				],
				"date": "2009",
				"ISBN": "978-3-941300-14-9",
				"callNumber": "F 10 B 2134",
				"libraryCatalog": "Library Catalog - opac.tib.uni-hannover.de",
				"numPages": "140",
				"pages": "140",
				"place": "Remagen",
				"publisher": "Kessel",
				"shortTitle": "Phönix auf Asche",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Waldsterben / Schadstoffimmission / Dübener Heide / Bitterfeld <Region>"
				],
				"notes": [
					{
						"note": "<div>Förderkennzeichen BMBF 0330634 K. - Verbund-Nr. 01033571</div>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://opac.sub.uni-goettingen.de/DB=1/XMLPRS=N/PPN?PPN=57161647X",
		"items": [
			{
				"itemType": "book",
				"title": "Das war das Waldsterben!",
				"creators": [
					{
						"firstName": "Elmar",
						"lastName": "Klein",
						"creatorType": "author"
					}
				],
				"date": "2008",
				"ISBN": "978-3-7930-9526-2",
				"callNumber": "48 Kle",
				"edition": "1",
				"libraryCatalog": "Library Catalog - opac.sub.uni-goettingen.de",
				"numPages": "164",
				"pages": "164",
				"place": "Freiburg im Breisgau [u.a.]",
				"publisher": "Rombach",
				"series": "Rombach Wissenschaft Ökologie",
				"seriesNumber": "8",
				"seriesTitle": "Rombach Wissenschaft Ökologie",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"*Baumkrankheit",
					"*Waldsterben",
					"*Waldsterben / Geschichte"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://lhclz.gbv.de/DB=1/XMLPRS=N/PPN?PPN=08727342X",
		"items": [
			{
				"itemType": "book",
				"title": "Geschichten, die die Forschung schreibt: ein Umweltlesebuch des Deutschen Forschungsdienstes",
				"creators": [
					{
						"firstName": "Bettina",
						"lastName": "Reckter",
						"creatorType": "editor"
					},
					{
						"firstName": "Rolf H.",
						"lastName": "Simen",
						"creatorType": "editor"
					},
					{
						"firstName": "Karl-Heinz",
						"lastName": "Preuß",
						"creatorType": "editor"
					}
				],
				"date": "1990",
				"ISBN": "3-923120-26-5",
				"callNumber": "CL 13 : IfW13 40 W 2",
				"libraryCatalog": "Library Catalog - lhclz.gbv.de",
				"numPages": "319",
				"pages": "319",
				"place": "Bonn - Bad Godesberg",
				"publisher": "Verlag Deutscher Forschungsdienst",
				"shortTitle": "Geschichten, die die Forschung schreibt",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Algenpest",
					"Aufsatzsammlung",
					"Aufsatzsammlung / Umweltschutz",
					"Bienen",
					"Gewässerverschmutzung",
					"Gleichgewicht",
					"Lebensräume",
					"Mülldeponie",
					"Perlmuscheln",
					"Saurer Regen",
					"Schmetterlinge",
					"Sonnenenergie",
					"Süßwasserfische",
					"Tiere",
					"Trinkwasser",
					"Umweltgifte",
					"Umweltschaden",
					"Umweltschutz",
					"Umweltsignale",
					"Vogelarten",
					"Waldsterben",
					"Ökomonie"
				],
				"notes": [
					{
						"note": "<div>Institutsbestand, deshalb nähere Informationen im Inst. f. Wirtschaftswissenschaft (IfW13)</div>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://swb.bsz-bw.de/DB=2.1/PPNSET?PPN=012099554&INDEXSET=1",
		"items": [
			{
				"itemType": "book",
				"title": "Borges por el mismo",
				"creators": [
					{
						"firstName": "Emir",
						"lastName": "Rodríguez Monegal",
						"creatorType": "author"
					},
					{
						"firstName": "Jorge Luis",
						"lastName": "Borges",
						"creatorType": "author"
					}
				],
				"date": "1984",
				"ISBN": "84-7222-967-X",
				"libraryCatalog": "Library Catalog - swb.bsz-bw.de",
				"numPages": "255",
				"pages": "255",
				"place": "Barcelona",
				"publisher": "Ed. laia",
				"series": "Laia literatura",
				"seriesTitle": "Laia literatura",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<div>Enth. Werke von und über Borges</div>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://cbsopac.rz.uni-frankfurt.de/DB=2.1/PPNSET?PPN=318490412",
		"items": [
			{
				"itemType": "book",
				"title": "Daten- und Identitätsschutz in Cloud Computing, E-Government und E-Commerce",
				"creators": [
					{
						"firstName": "Georg",
						"lastName": "Borges",
						"creatorType": "editor"
					}
				],
				"ISBN": "978-3-642-30102-5",
				"abstractNote": "Fuer neue und kuenftige Gesch ftsfelder von E-Commerce und E-Government stellen der Datenschutz und der Identit tsschutz wichtige Herausforderungen dar. Renommierte Autoren aus Wissenschaft und Praxis widmen sich in dem Band aktuellen Problemen des Daten- und Identit tsschutzes aus rechtlicher und technischer Perspektive. Sie analysieren aktuelle Problemf lle aus der Praxis und bieten Handlungsempfehlungen an. Das Werk richtet sich an Juristen und technisch Verantwortliche in Beh rden und Unternehmen sowie an Rechtsanw lte und Wissenschaftler.",
				"libraryCatalog": "Library Catalog - cbsopac.rz.uni-frankfurt.de",
				"numPages": "x+187",
				"series": "SpringerLink: Springer e-Books",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Cloud Computing",
					"Datenschutz",
					"Deutschland",
					"Electronic Commerce",
					"Electronic Government",
					"Persönlichkeitsrecht",
					"f Aufsatzsammlung",
					"f Online-Publikation"
				],
				"notes": [
					{
						"note": "<div>Description based upon print version of record </div>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://stabikat.de/DB=1/XMLPRS=N/PPN?PPN=717966224",
		"items": [
			{
				"itemType": "book",
				"title": "Politiques publiques, systèmes complexes",
				"creators": [
					{
						"firstName": "Danièle",
						"lastName": "Bourcier",
						"creatorType": "editor"
					},
					{
						"firstName": "Romain",
						"lastName": "Boulet",
						"creatorType": "editor"
					}
				],
				"date": "2012",
				"ISBN": "2-7056-8274-0, 978-2-7056-8274-3",
				"callNumber": "1 A 845058 Verfügbarkeit anzeigen / bestellen",
				"libraryCatalog": "Library Catalog - stabikat.de",
				"numPages": "290",
				"pages": "290",
				"place": "Paris",
				"publisher": "Hermann Ed.",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Gesetzgebung / Rechtsprechung / Komplexes System / Kongress / Paris <2010>Law -- Philosophy -- Congresses / Law -- Political aspects -- Congresses / Rule of law -- Congresses"
				],
				"notes": [
					{
						"note": "Contient des contributions en anglais<br>Notes bibliogr. Résumés. Index"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://lhiai.gbv.de/DB=1/XMLPRS=N/PPN?PPN=1914428323",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "La temprana devoción de Borges por el norte",
				"creators": [
					{
						"firstName": "Gustavo",
						"lastName": "Rubén Giorgi",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"ISSN": "1515-4017",
				"libraryCatalog": "Library Catalog - lhiai.gbv.de",
				"pages": "61-71",
				"publicationTitle": "Proa : en las letras y en las artes",
				"volume": "83",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
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
		"url": "http://gso.gbv.de/DB=2.1/PPNSET?PPN=768059798",
		"items": [
			{
				"itemType": "book",
				"title": "Ehetagebücher 1840 - 1844",
				"creators": [
					{
						"firstName": "Robert",
						"lastName": "Schumann",
						"creatorType": "author"
					},
					{
						"firstName": "Clara",
						"lastName": "Schumann",
						"creatorType": "author"
					},
					{
						"firstName": "Gerd",
						"lastName": "Nauhaus",
						"creatorType": "editor"
					},
					{
						"firstName": "Ingrid",
						"lastName": "Bodsch",
						"creatorType": "editor"
					}
				],
				"date": "2013",
				"ISBN": "978-3-86600-002-5, 978-3-931878-40-5",
				"abstractNote": "Zum ersten Mal als Einzelausgabe erscheinen die von Robert Schumann und seiner Frau, der Pianistin und Komponistin Clara Schumann, geb. Wieck, in den ersten Jahren ihrer Ehe geführten gemeinsamen Tagebücher. 1987 waren diese in Leipzig und bei Stroemfeld in wissenschaftlich-kritischer Edition von dem Schumannforscher und langjährigen Direktor des Robert-Schumann-Hauses Zwickau, Gerd Nauhaus, vorgelegt worden. Mit der Neupublikation wird die textgetreue, mit Sacherläuterungen sowie Personen-, Werk- und Ortsregistern und ergänzenden Abbildungen versehene Leseausgabe vorgelegt, die einem breiten interessierten Publikum diese einzigartigen Zeugnisse einer bewegenden Künstlerehe nahebringen.",
				"edition": "2",
				"libraryCatalog": "Library Catalog - gso.gbv.de",
				"numPages": "332",
				"place": "Frankfurt/M.",
				"publisher": "Stroemfeld",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Schumann, Robert 1810-1856 / Schumann, Clara 1819-1896 / Tagebuch 1840-1844"
				],
				"notes": [
					{
						"note": "<div><span>Sammlung</span></div>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://gso.gbv.de/DB=2.1/PPNSET?PPN=770481450",
		"items": [
			{
				"itemType": "book",
				"title": "Religiosidade no Brasil",
				"creators": [
					{
						"firstName": "João Baptista Borges",
						"lastName": "Pereira",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"ISBN": "978-85-314-1374-2, 85-314-1374-5",
				"libraryCatalog": "Library Catalog - gso.gbv.de",
				"numPages": "397",
				"pages": "397",
				"place": "São Paulo, SP, Brasil",
				"publisher": "EDUSP",
				"attachments": [
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Brazil -- Religion",
					"Religious pluralism -- Brazil",
					"Spiritualism -- Brazil -- History"
				],
				"notes": [
					{
						"note": "<div><span>Includes bibliographical references</span></div>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sudoc.abes.fr/xslt/DB=2.1//SRCH?IKT=12&TRM=024630527",
		"items": [
			{
				"itemType": "book",
				"title": "Conférences sur l'administration et le droit administratif faites à l'Ecole impériale des ponts et chaussées. Tome premier",
				"creators": [
					{
						"firstName": "Léon",
						"lastName": "Aucoc",
						"creatorType": "author"
					}
				],
				"date": "1869-1876",
				"language": "français",
				"libraryCatalog": "Library Catalog - www.sudoc.abes.fr",
				"numPages": "xii+xxiii+681+540+739",
				"numberOfVolumes": "3",
				"place": "Paris, France",
				"publisher": "Dunod",
				"attachments": [
					{
						"title": "Worldcat Link",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					{
						"tag": "Droit administratif -- France"
					},
					{
						"tag": "Ponts et chaussées (administration) -- France"
					},
					{
						"tag": "Travaux publics -- Droit -- France"
					},
					{
						"tag": "Voirie et réseaux divers -- France"
					}
				],
				"notes": [
					{
						"note": "\n<div><span>Titre des tomes 2 et 3 : Conférences sur l'administration et le droit administratif faites à l'Ecole des ponts et chaussées</span></div>\n<div><span>&nbsp;</span></div>\n"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sudoc.abes.fr/xslt/DB=2.1//SRCH?IKT=12&TRM=001493817",
		"items": [
			{
				"itemType": "book",
				"title": "Traité de la juridiction administrative et des recours contentieux",
				"creators": [
					{
						"firstName": "Édouard",
						"lastName": "Laferrière",
						"creatorType": "author"
					},
					{
						"firstName": "Roland",
						"lastName": "Drago",
						"creatorType": "author"
					}
				],
				"date": "1989",
				"ISBN": "9782275007908",
				"language": "français",
				"libraryCatalog": "Library Catalog - www.sudoc.abes.fr",
				"numPages": "ix+670; 675",
				"numberOfVolumes": "2",
				"place": "Paris, France",
				"publisher": "Librairie générale de droit et de jurisprudence",
				"attachments": [
					{
						"title": "Worldcat Link",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					{
						"tag": "Contentieux administratif -- France -- 19e siècle"
					},
					{
						"tag": "Recours administratifs -- France"
					},
					{
						"tag": "Tribunaux administratifs -- France -- 19e siècle"
					},
					{
						"tag": "Tribunaux administratifs -- Études comparatives"
					}
				],
				"notes": [
					{
						"note": "<div><span>1, Notions générales et législation comparée, histoire, organisation compétence de la juridiction administrative. 2, Compétence (suite), marchés et autres contrats, dommages, responsabilité de l'état, traitements et pensions, contributions directes, élections, recours pour excés de pouvoir, interprétation, contraventions de grandes voirie</span></div>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sudoc.abes.fr/xslt/DB=2.1//SRCH?IKT=12&TRM=200278649",
		"items": [
			{
				"itemType": "book",
				"title": "Il brutto all'opera: l'emancipazione del negativo nel teatro di Giuseppe Verdi",
				"creators": [
					{
						"firstName": "Gabriele",
						"lastName": "Scaramuzza",
						"creatorType": "author"
					}
				],
				"date": "2013",
				"ISBN": "9788857515953",
				"language": "italien",
				"libraryCatalog": "Library Catalog - www.sudoc.abes.fr",
				"numPages": "232",
				"place": "Milano, Italie",
				"publisher": "Mimesis",
				"shortTitle": "Il brutto all'opera",
				"attachments": [
					{
						"title": "Worldcat Link",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Link to Library Catalog Entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Library Catalog Entry Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					{
						"tag": "Laideur -- Dans l'opéra"
					},
					{
						"tag": "ML410.V4. S36 2013"
					},
					{
						"tag": "Opera -- 19th century"
					},
					{
						"tag": "Ugliness in opera"
					},
					{
						"tag": "Verdi, Giuseppe (1813-1901) -- Thèmes, motifs"
					}
				],
				"notes": [
					{
						"note": "<div>\n<span>Table des matières disponible en ligne (</span><span><a class=\"\n\t\t\tlink_gen\n\t\t    \" target=\"\" href=\"http://catdir.loc.gov/catdir/toc/casalini11/13192019.pdf\">http://catdir.loc.gov/catdir/toc/casalini11/13192019.pdf</a></span><span>)</span>\n</div>"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
