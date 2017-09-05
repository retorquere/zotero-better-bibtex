{
	"translatorID": "bbf1617b-d836-4665-9aae-45f223264460",
	"label": "A Contra Corriente",
	"creator": "Sebastian Karcher",
	"target": "^https?://acontracorriente\\.chass\\.ncsu\\.edu/index\\.php/acontracorriente/",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-08-18 20:51:04"
}

/*
   A Contra Corriente Translator
   Copyright (C) 2012 Sebastian Karcher and Avram Lyon
   
   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affer General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affer General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc, url) {
	if (url.indexOf('/article/view/')>-1) {
		return "journalArticle";
	} else if (getSearchResults(doc, url, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, url, checkOnly) {
	var items = {};
	var found = false;
	if (url.indexOf('/issue/view/')>-1) {
		var rows = ZU.xpath(doc, '//*[@class="tocTitle"]/a');
	} else {
		var rows = ZU.xpath(doc, '//div[@id="results"]//tr');
	}
	for (var i=0; i<rows.length; i++) {
		if (url.indexOf('/issue/view/')>-1) {
			var href = rows[i].href;
			var title = ZU.trimInternal(rows[i].textContent);
		} else {
			var href = ZU.xpathText(rows[i], './/td/a[contains(@class, "file")][1]/@href');
			var title = ZU.xpathText(rows[i], './td[2]');
		}
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, url, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	urlBibtex = url.replace('/article/view/', '/rt/captureCite/');
	if (!/\/article\/view\/.+\/.+/.test(url)) {
		urlBibtex += '/0';
	}
	urlBibtex += '/BibtexCitationPlugin';
	//Z.debug(urlBibtex);
	ZU.doGet(urlBibtex, function(text) {
		var parser = new DOMParser();
		var xml = parser.parseFromString(text, "text/html");
		var bibtex = ZU.xpathText(xml, '//pre');
		if (bibtex) {
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
			translator.setString(text);
			translator.setHandler("itemDone", function(obj, item) {
				item.attachments.push({
					title: "Snapshot",
					document: doc
				});
				item.complete();
			});
			translator.translate(); 
		} 
		
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://acontracorriente.chass.ncsu.edu/index.php/acontracorriente/article/view/102",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Carlos Iván Degregori: antropólogo del alma",
				"creators": [
					{
						"firstName": "José",
						"lastName": "Rénique",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"ISSN": "1548-7083",
				"abstractNote": "Remembranza de la reciente muerte (18 de Mayo de 2011) en Lima de Carlos Iván Degregori, uno de los intelectuales peruanos más importantes de las últimas décadas y uno de los estudiosos internacionales más destacados de la violencia política. A Contracorriente se suma a los innumerables homenajes que se tributan a su memoria. Su colega y amigo a lo largo de muchos años, el historiador José Luis Rénique, traza en esta nota el perfil humano, intelectual y político de Degregori. Al final incluimos también una lista de sus principales publicaciones.",
				"issue": "3",
				"itemID": "AC102",
				"libraryCatalog": "A Contra Corriente",
				"publicationTitle": "A Contracorriente",
				"shortTitle": "Carlos Iván Degregori",
				"url": "http://acontracorriente.chass.ncsu.edu/index.php/acontracorriente/article/view/102",
				"volume": "8",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Carlos Iván degregori",
					"Perú",
					"historia"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://tools.chass.ncsu.edu/open_journal/index.php/acontracorriente/issue/view/16/showToc",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://acontracorriente.chass.ncsu.edu/index.php/acontracorriente/search/search?query=argentina&authors=&title=&abstract=&galleyFullText=&suppFiles=&dateFromMonth=&dateFromDay=&dateFromYear=&dateToMonth=&dateToDay=&dateToYear=&dateToHour=23&dateToMinute=59&dateToSecond=59&discipline=&subject=&type=&coverage=&indexTerms=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://acontracorriente.chass.ncsu.edu/index.php/acontracorriente/article/view/174",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "\"La Huelga de los Conventillos\", Buenos Aires, Nueva Pompeya, 1936. Un aporte a los estudios sobre género y clase",
				"creators": [
					{
						"firstName": "Verónica",
						"lastName": "Norando",
						"creatorType": "author"
					},
					{
						"firstName": "Ludmila",
						"lastName": "Scheinkman",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"ISSN": "1548-7083",
				"abstractNote": "Este trabajo se propone realizar un análisis de las relaciones de género y clase a través de un estudio de caso: la “Huelga de los Conventillos” de la fábrica textil Gratry en 1936, que se extendió por más de tres meses, pasando casi inadvertida, sin embargo, para la investigación histórica. Siendo la textil una rama de industria con una mayoría de mano de obra femenina, el caso de la casa Gratry, donde el 60% de los 800 obreros eran mujeres, aparece como ejemplar para la observación de la actividad de las mujeres en conflicto. En el trabajo se analiza el rol de las trabajadoras en la huelga, su participación política, sus formas de organización y resistencia, haciendo eje en las determinaciones de género y de clase que son abordadas de manera complementaria e interrelacionada, así como el complejo entramado de tensiones y solidaridades que éstas generan. De éste modo, se pretende ahondar en la compleja conformación de una identidad obrera femenina, a la vez que se discute con aquella mirada historiográfica tradicional que ha restado importancia a la participación de la mujer en el conflicto social. Esto se realizará a través de la exploración de una serie de variables: las relaciones inter-género e inter-clase (fundamentalmente el vínculo entre las trabajadoras y la patronal masculina), inter-género e intra-clase (la relación entre trabajadoras y trabajadores), intra-género e inter-clase (los lazos entre las trabajadoras y las vecinas comerciantes del barrio), intra-género e intra-clase (relaciones de solidaridad entre trabajadoras en huelga, y de antagonismo entre huelguistas y “carneras”). Para ello se trabajó un corpus documental que incluye información de tipo cuantitativa (las estadísticas del Boletín Informativo del Departamento Nacional del Trabajo), y cualitativa: periódicos obreros –fundamentalmente El Obrero Textil, órgano gremial de la Unión Obrera Textil, Semanario de la CGT-Independencia (órgano de la Confederación General del Trabajo (CGT)-Independencia) y La Vanguardia (periódico del Partido Socialista), entre otros, y entrevistas orales a vecinas de Nueva Pompeya y familiares de trabajadoras de la fábrica Gratry. Se desarrollará una metodología cuali-cuantitativa para el cruce de estas fuentes.",
				"issue": "1",
				"itemID": "AC174",
				"libraryCatalog": "A Contra Corriente",
				"pages": "1–37",
				"publicationTitle": "A Contracorriente",
				"url": "http://acontracorriente.chass.ncsu.edu/index.php/acontracorriente/article/view/174",
				"volume": "9",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"huelga",
					"relaciones de género",
					"trabajadores",
					"trabajadroras"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/