{
	"translatorID": "3f73f0aa-f91c-4192-b0d5-907312876cb9",
	"label": "ThesesFR",
	"creator": "TFU",
	"target": "^https?://(www\\.)?theses\\.fr/.",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-10 22:54:53"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	theses.fr

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
	if (url.includes("?q=")) {
		return "multiple";
	}
	else {
		return "thesis";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "encart arrondi-10")]//h2/a');
	for (var i = 0; i < rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
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
			if (!items) return;

			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			// Z.debug(articles)
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48'); // https://github.com/zotero/translators/blob/master/Embedded%20Metadata.js
	translator.setDocument(doc);
	translator.setHandler('itemDone', function (obj, item) {
		// add Tags
		var tags = ZU.xpath(doc, '//span[contains(@property, "dc:subject")]');
		if (tags.length > 0) {
			item.tags = [];
			for (let tag of tags) {
				item.tags.push(tag.textContent.trim());
			}
		}
			
		item.complete();
	});
	translator.getTranslatorObject(function (trans) {
		trans.itemType = "thesis";
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://theses.fr/?q=Mesure+de+masse+de+noyau#",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://theses.fr/2016SACLS590",
		"items": [
			{
				"itemType": "thesis",
				"title": "Measurement of the W boson mass with the ATLAS detector",
				"creators": [
					{
						"firstName": "Oleh",
						"lastName": "Kivernyk",
						"creatorType": "author"
					}
				],
				"date": "2016/09/19",
				"abstractNote": "Cette thèse décrit une mesure de la masse du boson W avec le détecteur ATLAS. La mesure exploite les données enregistrées par ATLAS en 2011, a une énergie dans le centre de masse de 7 TeV et correspondant à une luminosité intégrée de 4.6 inverse femtobarn. Les mesures sont faites par ajustement aux données de distributions en énergie transverse des leptons charges et en masse transverse du boson W obtenues par simulation, dans les canaux électron et muon, et dans plusieurs catégories cinématiques. Les différentes mesures sont en bon accord et leur combinaison donne une valeur de m_W = 80371.1 ± 18.6 MeV. La valeur mesurée est compatible avec la moyenne mondiale des mesures existantes, m_W = 80385 ± 15 MeV, et l'incertitude obtenue est compétitive avec les mesures les plus précises réalisées par les collaborations CDF et D0.",
				"libraryCatalog": "theses.fr",
				"thesisType": "thesis",
				"university": "Paris Saclay",
				"url": "http://www.theses.fr/2016SACLS590",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "ATLAS"
					},
					{
						"tag": "ATLAS"
					},
					{
						"tag": "Bosons W -- Masse"
					},
					{
						"tag": "Grand collisionneur de hadrons"
					},
					{
						"tag": "LHC"
					},
					{
						"tag": "LHC"
					},
					{
						"tag": "Masse du boson W"
					},
					{
						"tag": "Modèle standard"
					},
					{
						"tag": "Modèle standard (physique nucléaire)"
					},
					{
						"tag": "Physique des particules"
					},
					{
						"tag": "Standard Model"
					},
					{
						"tag": "W boson mass"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://theses.fr/s188862",
		"items": [
			{
				"itemType": "thesis",
				"title": "Mesure des paramètres cosmologiques avec le catalogue d'amas de galaxies d'Euclid",
				"creators": [
					{
						"firstName": "Emmanuel",
						"lastName": "Artis",
						"creatorType": "author"
					}
				],
				"abstractNote": "Euclid est un satellite de l'agence spatiale européenne dont le lancement est prévu en 2020. Outre l'observation de l'effet de lentille gravitationnelle (weak lensing WL) et des corrélations spatiales des galaxies (oscillations acoustiques des baryons BAO et redshift-space distortions RSD), Euclid détectera environ 100000 amas de galaxies (Clusters of Galaxies CG) entre redshift z=0 et z=2. Ces amas permettront de mesurer les paramètres cosmologiques indépendamment du WL, des BAO et des RSD.    La collaboration Euclid développe actuellement des outils d'extraction d'amas de galaxies sur simulations et compare leurs performances. L'objectif de cette thèse est de mettre au point l'étage supérieur qui permet de déduire la mesure des paramètres cosmologiques à partir du catalogue d'amas d'Euclid. Cet étage est appelé fonction de vraisemblance (likelihood).    Elle est au cœur de l'analyse cosmologique avec les amas. Elle demande une compréhension fine de la fonction de sélection du catalogue (proportion d'amas détectés sur le ciel par rapport au nombre total d'amas) et du lien entre la quantité observée par Euclid (nombre de galaxies dans chaque amas) et la quantité liée aux modèles théoriques (la masse). L'Irfu/SPP a développé une expertise sur la fonction de vraisemblance du catalogue d'amas du satellite Planck. Le travail proposé consiste à construire la fonction de vraisemblance Euclid en partant des acquis de Planck. Il faudra, dans un premier temps, adapter l'outil aux catalogues optiques puis, dans un second temps, le refondre pour dépasser les limites formelles actuelles. L'outil devra être capable d'ajuster à la fois paramètres cosmologiques et paramètres de nuisance liés à la physique des amas, qui étaient découplés pour l'analyse Planck.",
				"libraryCatalog": "theses.fr",
				"url": "http://www.theses.fr/s188862",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Amas de galaxies"
					},
					{
						"tag": "Astroparticules et cosmologie"
					},
					{
						"tag": "Clusters of galaxies"
					},
					{
						"tag": "Cosmologie"
					},
					{
						"tag": "Cosmology"
					},
					{
						"tag": "Euclid"
					},
					{
						"tag": "Euclid"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
