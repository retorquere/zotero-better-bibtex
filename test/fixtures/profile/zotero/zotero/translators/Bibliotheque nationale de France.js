{
	"translatorID": "47533cd7-ccaa-47a7-81bb-71c45e68a74d",
	"label": "Bibliothèque nationale de France",
	"creator": "Florian Ziche, Sylvain Machefert",
	"target": "^https?://[^/]*catalogue\\.bnf\\.fr",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "g",
	"lastUpdated": "2017-07-07 11:47:44"
}

/*
 *  Bibliothèque nationale de France Translator
 *  Copyright (C) 2010 Florian Ziche, ziche@noos.fr
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


/* Bnf namespace. */
var BnfClass = function() {
	//Private members



	/* Map MARC responsibility roles to Zotero creator types.
		See http://archive.ifla.org/VI/3/p1996-1/appx-c.htm.
	*/
	function getCreatorType(aut) {

		var typeAut = aut['4'].trim();
		switch (typeAut) {
			case "005":
			case "250":
			case "275":
			case "590": //performer
			case "755": //vocalist
				return "performer";
			case "040":
			case "130": //book designer
			case "740": //type designer
			case "750": //typographer
			case "350": //engraver
			case "360": //etcher
			case "430": //illuminator
			case "440": //illustrator
			case "510": //lithographer
			case "530": //metal engraver
			case "600": //photographer
			case "705": //sculptor
			case "760": //wood engraver
				return "artist";
			case "070":
			case "305":
			case "330":
			case undefined:
				return "author";
			case "020":
			case "210":
			case "212":
				return "commenter";
			case "180":
				return "cartographer";
			case "220":
			case "340":
				return "editor";
			case "230":
				return "composer";
			case "245":
				return "inventor";
			case "255":
			case "695": //scientific advisor
			case "727": //thesis advisor
				return "counsel";
			case "300":
				return "director";
			case "400": //funder
			case "723": //sponsor
				return "sponsor";
			case "460":
				return "interviewee";
			case "470":
				return "interviewer";
			case "480": //librettist
			case "520": //lyricist
				return "wordsBy";
			case "605":
				return "presenter";
			case "630":
				return "producer";
			case "635":
				return "programmer";
			case "660":
				return "recipient";
			case "090": //author of dialog
			case "690": //scenarist
				return "scriptwriter";
			case "730":
				return "translator";
				//Ignore (no matching Zotero creatorType):
			case "320": //donor
			case "610": //printer
			case "650": //publisher
				return undefined;
				//Default
			case "205":
			default:
				return "contributor";
		}
	};

	/* Fix creators (MARC translator is not perfect). */
	function getCreators(record, item) {
		//Clear creators
		item.creators = new Array();
		// Extract creators (700, 701 & 702)
		for (var i = 700; i < 703; i++) {
			var authorTag = record.getFieldSubfields(i);
			for (var j in authorTag) {
				var aut = authorTag[j];
				var authorText = "";
				if (aut.b) {
					authorText = aut['a'] + ", " + aut['b'];
				} else {
					authorText = aut['a'];
				}
				var type = getCreatorType(aut);
				if (type) {

					item.creators.push(Zotero.Utilities.cleanAuthor(authorText, type, true));
				}
			}
		}
		// Extract corporate creators (710, 711 & 712)
		for (var i = 710; i < 713; i++) {
			var authorTag = record.getFieldSubfields(i);
			for (var j in authorTag) {
				if (authorTag[j]['a']) {
					var type = getCreatorType(authorTag[j]);
					if (type) {
						item.creators.push({
							lastName: authorTag[j]['a'],
							creatorType: type,
							fieldMode: true
						});
					}
				}
			}
		}
	};




	//Add tag, if not present yet
	function addTag(item, tag) {
		for (var t in item.tags) {
			if (item.tags[t] == tag) {
				return;
			}
		}
		item.tags.push(tag);
	};

	//Tagging
	function getTags(record, item) {
		var pTag = record.getFieldSubfields("600");
		if (pTag) {
			for (var j in pTag) {
				var tagText = false;
				var person = pTag[j];
				tagText = person.a;
				if (person.b) {
					tagText += ", " + person.b;
				}
				if (person.c) {
					tagText += ", " + person.c;
				}
				if (person.f) {
					tagText += " (" + person.f + ")";
				}
				addTag(item, tagText);
			}
		}
		pTag = record.getFieldSubfields("601");
		if (pTag) {
			for (var j in pTag) {
				var tagText = false;
				var person = pTag[j];
				tagText = person.a;
				addTag(item, tagText);
			}
		}
		pTag = record.getFieldSubfields("605");
		if (pTag) {
			for (var j in pTag) {
				var tagText = false;
				var person = pTag[j];
				tagText = person.a;
				addTag(item, tagText);
			}
		}
		pTag = record.getFieldSubfields("606");
		if (pTag) {
			for (var j in pTag) {
				var tagText = false;
				var person = pTag[j];
				tagText = person.a;
				addTag(item, tagText);
			}
		}
		pTag = record.getFieldSubfields("607");
		if (pTag) {
			for (var j in pTag) {
				var tagText = false;
				var person = pTag[j];
				tagText = person.a;
				addTag(item, tagText);
			}
		}
		pTag = record.getFieldSubfields("602");
		if (pTag) {
			for (var j in pTag) {
				var tagText = false;
				var person = pTag[j];
				tagText = person.a;
				if (person.f) {
					tagText += " (" + person.f + ")";
				}
				addTag(item, tagText);
			}
		}
		pTag = record.getFieldSubfields("604");
		if (pTag) {
			for (var j in pTag) {
				var tagText = false;
				var person = pTag[j];
				tagText = person.a;
				if (person.b) {
					tagText += ", " + person.b;
				}
				if (person.f) {
					tagText += " (" + person.f + ")";
				}
				if (person.t) {
					tagText += ", " + person.t;
				}
				addTag(item, tagText);
			}
		}
	};

	//Get series (repeatable)
	function getSeries(record, item) {
		var seriesText = false;
		var seriesTag = record.getFieldSubfields("225");
		if (seriesTag && seriesTag.length > 1) {
			for (var j in seriesTag) {
				var series = seriesTag[j];
				if (seriesText) {
					seriesText += "; ";
				} else {
					seriesText = "";
				}
				seriesText += series.a;
				if (series.v) {
					seriesText += ", " + series.v;
				}
			}
			if (seriesText) {
				delete item.seriesNumber;
				item.series = seriesText;
			}
		}
		//Try 461
		if (!item.series) {
			seriesTag = record.getFieldSubfields("461");
			if (seriesTag) {
				for (var j in seriesTag) {
					var series = seriesTag[j];
					if (seriesText) {
						seriesText += "; ";
					} else {
						seriesText = "";
					}
					seriesText += series.t;
				}
			}
			if (seriesText) {
				delete item.seriesNumber;
				item.series = seriesText;
			}
		}
	};

	//Add extra text
	function addExtra(noteText, extra) {
		if (extra) {
			if (noteText) {
				if (!/\.$/.exec(noteText)) {
					noteText += ". ";
				} else {
					noteText += " ";
				}
			} else {
				noteText = "";
			}
			noteText += Zotero.Utilities.trim(extra);
		}
		return noteText;
	}

	//Assemble extra information
	function getExtra(record, item) {
		var noteText = false;
		//Material description
		var noteTag = record.getFieldSubfields("215");
		if (noteTag) {
			for (var j in noteTag) {
				var note = noteTag[j];
				noteText = addExtra(noteText, note.c);
				noteText = addExtra(noteText, note.d);
				noteText = addExtra(noteText, note.e);
			}
		}
		//Note
		noteTag = record.getFieldSubfields("300");
		if (noteTag) {
			for (var j in noteTag) {
				var note = noteTag[j];
				noteText = addExtra(noteText, note.a);
			}
		}
		//Edition history notes
		noteTag = record.getFieldSubfields("305");
		if (noteTag) {
			for (var j in noteTag) {
				var note = noteTag[j];
				noteText = addExtra(noteText, note.a);
			}
		}
		if (noteText) {
			if (!/\.$/.exec(noteText)) {
				noteText += ".";
			}
			item.extra = noteText;
		}
	};


	//Get title from 200
	function getTitle(record, item) {
		var titleTag = record.getFieldSubfields("200");
		if (titleTag) {
			titleTag = titleTag[0];
			var titleText = titleTag.a;
			if (titleTag.e) {
				if (!/^[,\.:;-]/.exec(titleTag.e)) {
					titleText += ": ";
				}
				titleText += titleTag.e;
			}
			if (titleTag.h) {
				titleText += ", " + titleTag.h;
				if (titleTag.i) {
					titleText += ": " + titleTag.i;
				}
			} else if (titleTag.i) {
				titleText += ", " + titleTag.i;
			}
			item.title = titleText;
		}
	};

	function getCote(record, item) {
		item.callNumber = "";
		var coteTag = record.getFieldSubfields("930");

		if (coteTag.length) {

			item.callNumber += coteTag[0]['c'] + "-" + coteTag[0]['a'];

		}
	};

	//Do BnF specific Unimarc postprocessing
	function postprocessMarc(record, newItem) {

		//Title
		getTitle(record, newItem);

		//Fix creators
		getCreators(record, newItem);

		//Fix callNumber
		getCote(record, newItem);

		//Store perennial url from 003 as attachment and accession number

		var url = record.getField("003");
		if (url && url.length > 0 && url[0][1]) {
			newItem.attachments.push({
				title: 'Lien vers la notice du catalogue',
				url: url[0][1],
				mimeType: 'text/html',
				snapshot: false
			});

		}

		//Country (102a)
		record._associateDBField(newItem, "102", "a", "country");

		//Try to retrieve volumes/pages from 215d
		if (!newItem.pages) {
			var dimTag = record.getFieldSubfields("215");
			for (var j in dimTag) {
				var dim = dimTag[j];
				if (dim.a) {
					var pages = /[^\d]*(\d+)\s+p\..*/.exec(dim.a);
					if (pages) {
						newItem.numPages = pages[1];
					}
					var vols = /[^\d]*(\d+)\s+vol\..*/.exec(dim.a);
					if (vols) {
						newItem.numberOfVolumes = vols[1];
					}
				}
			}
		}

		//Series
		getSeries(record, newItem);

		//Extra
		getExtra(record, newItem);

		//Tagging
		getTags(record, newItem);

		//Repository
		newItem.libraryCatalog = "BnF Catalogue général (http://catalogue.bnf.fr)";
	};


	//Public members


	/* Get the UNIMARC URL for a given single result page. */
	this.reformURL = function(url) {
		url = url.replace(/(^.*\/ark:\/12148\/cb[0-9]+[a-z]*)(.*$)/, "$1.unimarc");
		// Zotero.debug("URL1 "+ url);
		return url;
	};


	/* Get the results table from a list page, if any. Looks for //table[@class="ListeNotice"]. */
	this.getResultsTable = function(doc) {
		try {
			var xPath = '//div[@class="liste-notices"]';
			var xPathObject = doc.evaluate(xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
			return xPathObject;
		} catch (x) {
			Zotero.debug(x.lineNumber + " " + x.message);
		}
		return undefined;
	};




	/* Get selectable search items from a list page. 
		Loops through //td[@class="mn_partienoticesynthetique"], extracting the single items URLs from
		their onclick attribute, thier titles by assembling the spans for each cell.
	*/
	this.getSelectedItems = function(doc) {
		var items = new Object();
		var cellPath = '//div[@class="liste-notices"]/div[@class="notice-item"]';
		var cells = doc.evaluate(cellPath, doc, null, XPathResult.ANY_TYPE, null);
		while (cell = cells.iterateNext()) {
			var link = doc.evaluate('./div[@class="notice-contenu"]/div[@class="notice-synthese"]/a', cell, null, XPathResult.ANY_TYPE, null).iterateNext();

			var title = doc.evaluate('./h2', link, null, XPathResult.ANY_TYPE, null).iterateNext();
			if (title) {
				title = ZU.trim(title.textContent);
			} else {
				// 2016-01-26 : Sometimes there is no H2, we then need to get everything, example when searching for : 
				// "Se souvenir de Tonnay-Charente"
				title = ZU.trim(link.textContent);
			}

			var documentYear = doc.evaluate('./div[@class="notice-ordre"]', cell, null, XPathResult.ANY_TYPE, null).iterateNext();
			if (documentYear) {
				title += " / " + documentYear.textContent;
			}
			var url = link.href;
			items[url] = title;
		}

		return items;
	};


	//Check for Gallica URL (digital version available), if found, set item.url
	function checkGallica(record, item) {


		var url = record.getFieldSubfields("856");

		if (url && url.length > 0 && url[0].u) {
			item.url = url[0].u;

		}

	}


	/* Process UNIMARC URL. */
	this.processMarcUrl = function(newDoc, url) {
		/* Init MARC record. */
		// Load MARC
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
		translator.getTranslatorObject(function(obj) {
			var record = new obj.record();
			/* Get table cell containing MARC code. */
			var elmts = newDoc.evaluate('//div[@class="notice-detail"]/div/div[@class="zone"]',
				newDoc, null, XPathResult.ANY_TYPE, null);
			/* Line loop. */
			var elmt, tag, content;
			var ind = "";

			while (elmt = elmts.iterateNext()) {
				var line = Zotero.Utilities.superCleanString(elmt.textContent);
				if (line.length == 0) {
					continue;
				}
				if (line.substring(0, 6) == "       ") {
					content += " " + line.substring(6);
					continue;
				} else {
					if (tag) {
						record.addField(tag, ind, content);
					}
				}
				line = line.replace(/[_\t\xA0]/g, " "); // nbsp
				tag = line.substr(0, 3);
				if (tag[0] != "0" || tag[1] != "0") {
					ind = line.substr(3, 2);
					content = line.substr(5).replace(/\$([a-z]|[0-9])/g, obj.subfieldDelimiter + "$1");
					content = content.replace(/ˆ([^‰]+)‰/g, "$1");

				} else {
					if (tag == "000") {
						tag = undefined;

						record.leader = "0000" + line.substr(8);

					} else {
						content = line.substr(3);
					}
				}
			}
			// case last zone
			if (tag) {
				record.addField(tag, ind, content);
			}
			//Create item
			var newItem = new Zotero.Item();
			record.translate(newItem);



			//Do specific Unimarc postprocessing
			postprocessMarc(record, newItem);

			//Check for Gallica URL
			checkGallica(record, newItem);

			//We have to restore the public view for the next actions
			//by the users, which is achieved by opening the url with
			//public ending again.
			if (url.indexOf('.public')==-1) {
				url = url.replace('.unimarc', '') + '.public';
			}
			ZU.doGet(url, function(text) {;
				newItem.complete();
			});
		});
	};
};

/* Global BnfClass object. */
var Bnf = new BnfClass();


/* Translator API implementation. */


function detectWeb(doc, url) {
	var resultRegexp = /ark:\/12148\/cb[0-9]+/i;
	//Single result ?
	if (resultRegexp.test(url)) {

		return "single";

	}
	//Muliple result ?
	else if (Bnf.getResultsTable(doc)) {
		return "multiple";
	}
	//No items 
	return undefined;
}


function doWeb(doc, url) {
	/* Check type. */
	var type = detectWeb(doc, url);

	Zotero.debug("type " + type);
	if (!type) {
		return;
	}
	/* Build array of MARC URLs. */
	var urls = new Array();
	switch (type) {
		case "multiple":
			var items = Bnf.getSelectedItems(doc);
			if (!items) {
				return true;
			}
			/* Let user select items. */
			Zotero.selectItems(items, function(items) {
				for (var i in items) {
					urls.push(Bnf.reformURL(i));
				}
				if (urls.length > 0) {
					//Z.debug(urls)
					Zotero.Utilities.processDocuments(urls, function(doc) {
						Bnf.processMarcUrl.call(Bnf, doc, urls[0]);
					});
				}
			});
			break;
		case "single":
			urls = [Bnf.reformURL(url)];
			Zotero.Utilities.processDocuments(urls, function(doc) {
				Bnf.processMarcUrl.call(Bnf, doc, url);
			});
			break;
		default:
			// nothing to do 
			break;
	}
}
/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/