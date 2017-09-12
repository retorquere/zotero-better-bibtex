{
	"translatorID": "17b1a93f-b342-4b54-ad50-08ecc26e0ac3",
	"label": "INSPIRE",
	"creator": "Sebastian Karcher",
	"target": "^https?://inspirehep\\.net/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2014-08-26 03:46:51"
}

/*
	***** BEGIN LICENSE BLOCK *****

	INSPIRE Translator
	Copyright © 2014 Sebastian Karcher

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
function detectWeb(doc, url) {
	if (url.indexOf("/record/") != -1) {
		return "journalArticle"
	} else if (url.indexOf("search?") != -1) {
		return "multiple";
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		items = {};
		articles = [];
		var titles = ZU.xpath(doc, '//div[@class="record_body"]/a[@class="titlelink"]');
		for (var i = 0; i < titles.length; i++) {
			items[titles[i].href] = titles[i].textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				Zotero.done();
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		})
	} else {
		scrape(doc, url)
	}
}

function scrape(doc, url) {
	var pdfurl = ZU.xpathText(doc, '//a[text()="PDF"]/@href');
	var xmlurl = url.replace(/(\d+)\/.+/, "$1") + "/export/xe";
	var keywords = ZU.xpath(doc, '//div/small/a[contains(@href, "p=keyword:")]');
	var notes = ZU.xpathText(doc, '//div/small[strong[contains(text(), "Note")]]/text()');
	ZU.doGet(xmlurl, function (text) {
		//add namespace to modsCollection
		//Z.debug(text)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("eb7059a4-35ec-4961-a915-3cf58eb9784b"); // Endnote XML -translator
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			item.attachments = [];
			item.tags = [];
			item.notes = [];
			for (i = 0; i < keywords.length; i++) {
				item.tags.push(keywords[i].textContent);
			}
			if (notes) item.notes.push(notes);
			item.attachments.push({
				document: doc,
				title: "INSPIRE Snapshot",
				mimeType: "text/html"
			});
			if (pdfurl) item.attachments.push({
				url: pdfurl,
				title: "INSPIRE PDF Full Text",
				mimeType: "application/pdf`"
			});
			item.complete();
		})
		translator.translate();
	})

}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://inspirehep.net/search?ln=en&p=find+plasma+light&of=hb&action_search=Search",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://inspirehep.net/record/1284987",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Electromagnetic Radiation in Hot QCD Matter: Rates, Electric Conductivity, Flavor Susceptibility and Diffusion",
				"creators": [
					{
						"firstName": "Chang-Hwan",
						"lastName": "Lee",
						"creatorType": "author"
					},
					{
						"firstName": "Ismail",
						"lastName": "Zahed",
						"creatorType": "author"
					}
				],
				"date": "2014-08-12",
				"DOI": "10.1103/PhysRevC.90.025204",
				"abstractNote": "We discuss the general features of the electromagnetic radiation from a thermal hadronic gas as constrained by chiral symmetry. The medium effects on the electromagnetic spectral functions and the partial restoration of chiral symmetry are quantified in terms of the pion densities. The results are compared with the electromagnetic radiation from a strongly interacting quark-gluon plasma in terms of the leading gluon condensate operators. We use the spectral functions as constrained by the emission rates to estimate the electric conductivity, the light flavor susceptibility and diffusion constant across the transition from the correlated hadronic gas to a strongly interacting quark-gluon plasma.",
				"libraryCatalog": "INSPIRE",
				"pages": "025204",
				"publicationTitle": "Phys.Rev.",
				"shortTitle": "Electromagnetic Radiation in Hot QCD Matter",
				"volume": "C90",
				"attachments": [
					{
						"title": "INSPIRE Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "INSPIRE PDF Full Text",
						"mimeType": "application/pdf`"
					}
				],
				"tags": [
					"conductivity: electric",
					"diffusion",
					"flavor",
					"flux",
					"gluon: condensation",
					"hadron: gas",
					"matter: effect",
					"pi: density",
					"quantum chromodynamics: matter",
					"quark gluon: interaction",
					"quark gluon: plasma",
					"radiation: electromagnetic",
					"spectral representation",
					"susceptibility",
					"symmetry: chiral",
					"thermal"
				],
				"notes": [
					"27 pages, 11 figures "
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://inspirehep.net/record/1282171",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Relativistically induced transparency acceleration of light ions by an ultrashort laser pulse interacting with a heavy-ion-plasma density gradient",
				"creators": [
					{
						"firstName": "Aakash A.",
						"lastName": "Sahai",
						"creatorType": "author"
					},
					{
						"firstName": "F. S.",
						"lastName": "Tsung",
						"creatorType": "author"
					},
					{
						"firstName": "A. R.",
						"lastName": "Tableman",
						"creatorType": "author"
					},
					{
						"firstName": "W. B.",
						"lastName": "Mori",
						"creatorType": "author"
					},
					{
						"firstName": "T. C.",
						"lastName": "Katsouleas",
						"creatorType": "author"
					}
				],
				"date": "2013-10-28",
				"DOI": "10.1103/PhysRevE.88.043105",
				"abstractNote": "The relativistically induced transparency acceleration (RITA) scheme of proton and ion acceleration using laser-plasma interactions is introduced, modeled, and compared to the existing schemes. Protons are accelerated with femtosecond relativistic pulses to produce quasimonoenergetic bunches with controllable peak energy. The RITA scheme works by a relativistic laser inducing transparency to densities higher than the cold-electron critical density, while the background heavy ions are stationary. The rising laser pulse creates a traveling acceleration structure at the relativistic critical density by ponderomotively driving a local electron density inflation, creating an electron snowplow and a co-propagating electrostatic potential. The snowplow advances with a velocity determined by the rate of the rise of the laser's intensity envelope and the heavy-ion-plasma density gradient scale length. The rising laser is incrementally rendered transparent to higher densities such that the relativistic-electron plasma frequency is resonant with the laser frequency. In the snowplow frame, trace density protons reflect off the electrostatic potential and get snowplowed, while the heavier background ions are relatively unperturbed. Quasimonoenergetic bunches of velocity equal to twice the snowplow velocity can be obtained and tuned by controlling the snowplow velocity using laser-plasma parameters. An analytical model for the proton energy as a function of laser intensity, rise time, and plasma density gradient is developed and compared to 1D and 2D PIC OSIRIS simulations. We model the acceleration of protons to GeV energies with tens-of-femtoseconds laser pulses of a few petawatts. The scaling of proton energy with laser power compares favorably to other mechanisms for ultrashort pulses.",
				"libraryCatalog": "INSPIRE",
				"pages": "043105",
				"publicationTitle": "Phys.Rev.",
				"volume": "E88",
				"attachments": [
					{
						"title": "INSPIRE Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "INSPIRE PDF Full Text",
						"mimeType": "application/pdf`"
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