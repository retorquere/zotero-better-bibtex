{
	"translatorID": "439c869c-c605-47b4-b330-157a23a4b4f3",
	"label": "Store norske leksikon",
	"creator": "Håkon Malmedal",
	"target": "^https?://((sml|nbl|nkl)\\.)?snl\\.no/[^.]",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2014-07-26 01:22:54"
}

/* Translator for Store norske leksikon
   Copyright (C) 2014 Håkon Malmedal

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

function detectWeb(doc, url) {
	return "encyclopediaArticle";
}

function doWeb(doc, url) {
	var item = new Zotero.Item("encyclopediaArticle");

	item.attachments.push({
		title: "Snapshot",
		document: doc
	});

	item.language = doc.documentElement.lang;

	var abs = ZU.xpathText(doc,
		'/html/head/meta[@name="description"]/@content',
		null, '');
	if (abs) item.abstractNote = ZU.trimInternal(abs);

	url = url.replace(/[#?].*/, '');
	Zotero.Utilities.doGet(url + ".json", function(json) {

		try {
			obj = JSON.parse(json);
		}
		catch (e) {
			throw("Failed parsing JSON from " + url + ".json");
		}

		item.title = obj.title;
		item.url = obj.url;
		if (item.url.indexOf("sml.snl.no") != -1) {
			item.encyclopediaTitle = "Store medisinske leksikon";
		} else if (item.url.indexOf("nbl.snl.no") != -1) {
			item.encyclopediaTitle = "Norsk biografisk leksikon";
		} else if (item.url.indexOf("nkl.snl.no") != -1) {
			item.encyclopediaTitle = "Norsk kunstnerleksikon";
		} else {
			item.encyclopediaTitle = "Store norske leksikon";
		}
		item.date = obj.changed_at;
		item.rights = obj.license_name;
		obj.authors.forEach(function(element) {
			// Don't include Store norske leksikon as author
			if (element.full_name.indexOf("leksikon") === -1) {
				item.creators.push(ZU.cleanAuthor(element.full_name,
					"author", false));
			}
		});
		item.tags.push(obj.subject_title);
		item.complete();
	})
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://snl.no/Giovanni_Trapattoni",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"creators": [
					{
						"firstName": "Geir",
						"lastName": "Lima",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Italiensk fotball"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"language": "nb",
				"abstractNote": "Giovanni Trapattoni, italiensk fotballtrener og tidligere spiller.Trapattoni spilte for AC Milan fra 1959 til 1971 før han avsluttet karrieren som spiller i Varese i sesongen 1971-72. Han ble seriemester med AC Milan to ganger (1961-62 og 1967-68) og vant Serievinnercupen (Mesterligaen) to ganger (1962-63 og 1968-69). Trenerkarrieren begynte i AC Milan i 1974, men det var særlig som trener for Juventus han oppnådde stor suksess, da klubben vant Serie A hele seks ganger under hans ledelse i periodene 1976-86 og 1991-94.",
				"title": "Giovanni Trapattoni",
				"url": "http://snl.no/Giovanni_Trapattoni",
				"encyclopediaTitle": "Store norske leksikon",
				"date": "2014-07-25T13:04:34Z",
				"rights": "begrenset",
				"libraryCatalog": "Store norske leksikon",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://sml.snl.no/angiokardiografi",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"creators": [
					{
						"firstName": "Harald",
						"lastName": "Arnesen",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Hjerte- og karsykdommer"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"language": "nb",
				"abstractNote": "Angiokardiografi, røntgenfotografering av hjertets kamre og de store årene ved injeksjon av kontraststoff. Se også røntgenundersøkelser..",
				"title": "angiokardiografi",
				"url": "http://sml.snl.no/angiokardiografi",
				"encyclopediaTitle": "Store medisinske leksikon",
				"date": "2013-12-28T16:59:29Z",
				"rights": "begrenset",
				"libraryCatalog": "Store norske leksikon",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://nbl.snl.no/P_A_Munch",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"creators": [
					{
						"firstName": "Ottar",
						"lastName": "Dahl",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Historikere"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"language": "nb",
				"abstractNote": "Historiker. Foreldre: Stiftsprost Edvard Storm Munch (1780–1847) og Johanne Sophie Hofgaard (1791–1860). Gift 20.4.1835 med Nathalie Charlotte Linaae (5.2.1812–18.01.1900), datter av forvalter Hans Henrik Linaae (1783–1842) og Karen (“Kaja”) Fredrikke Baggesen (f. 1788). Brorsønn av Johan Storm Munch (1778–1832); fetter av Andreas Munch (1811–84); farbror til Edvard Munch (1863–1944); morfar til Johan E.",
				"title": "P A Munch",
				"url": "http://nbl.snl.no/P_A_Munch",
				"encyclopediaTitle": "Norsk biografisk leksikon",
				"date": "2013-12-29T13:16:14Z",
				"rights": "begrenset",
				"libraryCatalog": "Store norske leksikon",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://nkl.snl.no/Ludvig_Karsten",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"creators": [
					{
						"firstName": "Nils",
						"lastName": "Messel",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Norsk kunstnerleksikon"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"language": "nb",
				"abstractNote": "Han var yngste sønn av en tyskfødt byggmester som i 1864 hadde slått seg ned i Christiania. K.s velhavende barndomshjem var liberalt og kunstinteressert. Søsteren Marie utdannet seg til møbel- og interiørarkitekt, søsteren Fredrikke studerte musikk i Dresden, mens yngstesøsteren Kristine ble tekstilkunstner. K.s bror Heinrich utdannet seg til arkitekt.",
				"title": "Ludvig Karsten",
				"url": "http://nkl.snl.no/Ludvig_Karsten",
				"encyclopediaTitle": "Norsk kunstnerleksikon",
				"date": "2013-07-03T20:49:58Z",
				"rights": "begrenset",
				"libraryCatalog": "Store norske leksikon",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://snl.no/belastningspr%C3%B8ver",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"creators": [],
				"notes": [],
				"tags": [
					"Medisinsk språk"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"language": "nb",
				"abstractNote": "Belastningsprøver, registrering av hvordan et organ funksjonerer når det utsettes for normal belastning. Prøvene anvendes som diagnostisk hjelpemiddel. Se elektrokardiografi og sukkerbelastning..",
				"title": "belastningsprøver",
				"url": "http://snl.no/belastningspr%C3%B8ver",
				"encyclopediaTitle": "Store norske leksikon",
				"date": "2014-06-30T15:12:59Z",
				"rights": "fri",
				"libraryCatalog": "Store norske leksikon",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://snl.no/F%C3%A6r%C3%B8yene",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"creators": [
					{
						"firstName": "Nils Petter",
						"lastName": "Thuesen",
						"creatorType": "author"
					},
					{
						"firstName": "Roger",
						"lastName": "Pihl",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Færøyenes geografi"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"language": "nb",
				"abstractNote": "Færøyene, øygruppe i det nordlige Atlanterhav, mellom Skottland og Island, cirka 600 kilometer vest for Bergen. Færøyene består av 17 bebodde øyer og tallrike, til størstedelen utilgjengelige, småøyer. De største øyene er Streymoy, Eysturoy, Vágar, Suðuroy og Sandoy.En fast norsk bosetning begynte etter midten av 800-tallet. Øyene er siden 1948 en selvstyrende del av Danmark. Hovedstad er Tòrshavn.Færøyene er knyttet til Europeiske union (EU) ved en handelsavtale, men er i motsetning til Danmark ikke medlem av unionen.",
				"title": "Færøyene",
				"url": "http://snl.no/F%C3%A6r%C3%B8yene",
				"encyclopediaTitle": "Store norske leksikon",
				"date": "2014-06-30T15:29:23Z",
				"rights": "begrenset",
				"libraryCatalog": "Store norske leksikon",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/