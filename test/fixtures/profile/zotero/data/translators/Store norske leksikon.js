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
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-24 20:57:00"
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
		"url": "https://snl.no/Giovanni_Trapattoni",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "Giovanni Trapattoni",
				"creators": [
					{
						"firstName": "Geir",
						"lastName": "Lima",
						"creatorType": "author"
					}
				],
				"date": "2014-08-27T09:47:59.567+02:00",
				"abstractNote": "Giovanni Trapattoni, italiensk fotballtrener og tidligere spiller.Trapattoni spilte for AC Milan fra 1959 til 1971 før han avsluttet karrieren som spiller i Varese i sesongen 1971-72. Han ble seriemester med AC Milan to ganger (1961-62 og 1967-68) og vant Serievinnercupen (Mesterligaen) to ganger (1962-63 og 1968-69). Trenerkarrieren begynte i AC Milan i 1974, men det var særlig som trener for Juventus han oppnådde stor suksess, da klubben vant Serie A hele seks ganger under hans ledelse i periodene 1976-86 og 1991-94.",
				"encyclopediaTitle": "Store norske leksikon",
				"language": "no",
				"libraryCatalog": "Store norske leksikon",
				"rights": "begrenset",
				"url": "http://snl.no/Giovanni_Trapattoni",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Italiensk fotball"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://sml.snl.no/angiokardiografi",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "angiokardiografi",
				"creators": [
					{
						"firstName": "Harald",
						"lastName": "Arnesen",
						"creatorType": "author"
					}
				],
				"date": "2016-02-23T13:23:40.665+01:00",
				"abstractNote": "Angiokardiografi, røntgenfotografering av hjertets kamre og de store årene ved injeksjon av kontraststoff. Se også røntgenundersøkelser..",
				"encyclopediaTitle": "Store medisinske leksikon",
				"language": "no",
				"libraryCatalog": "Store norske leksikon",
				"rights": "begrenset",
				"url": "http://sml.snl.no/angiokardiografi",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Hjerte- og karundersøkelser"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://nbl.snl.no/P_A_Munch",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "P A Munch",
				"creators": [
					{
						"firstName": "Ottar",
						"lastName": "Dahl",
						"creatorType": "author"
					}
				],
				"date": "2014-09-28T14:36:15.097+02:00",
				"abstractNote": "Historiker. Foreldre: Stiftsprost Edvard Storm Munch (1780–1847) og Johanne Sophie Hofgaard (1791–1860). Gift 20.4.1835 med Nathalie Charlotte Linaae (5.2.1812–18.01.1900), datter av forvalter Hans Henrik Linaae (1783–1842) og Karen (“Kaja”) Fredrikke Baggesen (f. 1788). Brorsønn av Johan Storm Munch (1778–1832); fetter av Andreas Munch (1811–84); farbror til Edvard Munch (1863–1944); morfar til Johan E.",
				"encyclopediaTitle": "Norsk biografisk leksikon",
				"language": "no",
				"libraryCatalog": "Store norske leksikon",
				"rights": "begrenset",
				"url": "http://nbl.snl.no/P_A_Munch",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Historikere"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://nkl.snl.no/Ludvig_Karsten",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "Ludvig Karsten",
				"creators": [
					{
						"firstName": "Nils",
						"lastName": "Messel",
						"creatorType": "author"
					}
				],
				"date": "2017-02-20T14:12:53.744+01:00",
				"abstractNote": "Han var yngste sønn av en tyskfødt byggmester som i 1864 hadde slått seg ned i Christiania. K.s velhavende barndomshjem var liberalt og kunstinteressert. Søsteren Marie utdannet seg til møbel- og interiørarkitekt, søsteren Fredrikke studerte musikk i Dresden, mens yngstesøsteren Kristine ble tekstilkunstner. K.s bror Heinrich utdannet seg til arkitekt.",
				"encyclopediaTitle": "Norsk kunstnerleksikon",
				"language": "no",
				"libraryCatalog": "Store norske leksikon",
				"rights": "begrenset",
				"url": "http://nkl.snl.no/Ludvig_Karsten",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Norsk kunstnerleksikon"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://sml.snl.no/belastningspr%C3%B8ver",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "belastningsprøver",
				"creators": [],
				"date": "2014-09-28T16:09:18.163+02:00",
				"abstractNote": "Belastningsprøver, registrering av hvordan et organ funksjonerer når det utsettes for normal belastning. Prøvene anvendes som diagnostisk hjelpemiddel. Se elektrokardiografi og sukkerbelastning..",
				"encyclopediaTitle": "Store medisinske leksikon",
				"language": "no",
				"libraryCatalog": "Store norske leksikon",
				"rights": "fri",
				"url": "http://sml.snl.no/belastningspr%C3%B8ver",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Medisinsk språk"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://snl.no/F%C3%A6r%C3%B8yene",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "Færøyene",
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
				"date": "2017-02-28T12:16:33.244+01:00",
				"abstractNote": "Færøyene, øygruppe i det nordlige Atlanterhav, mellom Skottland og Island, cirka 600 kilometer vest for Bergen. Færøyene består av 18 øyer, hvorav 17 er bebodde og tallrike, for det meste utilgjengelige småøyer. De største øyene er Streymoy, Eysturoy, Vágar, Suðuroy og Sandoy.En fast norsk bosetning begynte etter midten av 800-tallet. Øyene har siden 1948 vært en selvstyrt del av Danmark.",
				"encyclopediaTitle": "Store norske leksikon",
				"language": "no",
				"libraryCatalog": "Store norske leksikon",
				"rights": "begrenset",
				"url": "http://snl.no/F%C3%A6r%C3%B8yene",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Færøyenes geografi"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/