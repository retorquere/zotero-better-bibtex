{
	"translatorID": "edd87d07-9194-42f8-b2ad-997c4c7deefd",
	"label": "MARCXML",
	"creator": "Sebastian Karcher",
	"target": "xml",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 1,
	"lastUpdated": "2019-07-11 13:12:18"
}


/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2012 Sebastian Karcher

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

function detectImport() {
	var line;
	var i = 0;
	while ((line = Zotero.read()) !== false) {
		if (line !== "") {
			if (line.match(/xmlns(:marc)?="http:\/\/www\.loc\.gov\/MARC21\/slim"/)) {
				return true;
			}
			else if (i++ > 5) {
				return false;
			}
		}
	}
	return false;
}


function doImport() {
	var text = "";
	var line;
	while ((line = Zotero.read()) !== false) {
		text += line;
	}
	// call MARC translator
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
	translator.getTranslatorObject(function (marc) {
		var parser = new DOMParser();
		var xml = parser.parseFromString(text, 'text/xml');
		// define the marc namespace
		var ns = {
			marc: "http://www.loc.gov/MARC21/slim"
		};
		var records = ZU.xpath(xml, '//marc:record', ns);
		for (let rec of records) {
			// create one new item per record
			var record = new marc.record();
			var newItem = new Zotero.Item();
			record.leader = ZU.xpathText(rec, "./marc:leader", ns);
			var fields = ZU.xpath(rec, "./marc:datafield", ns);
			for (let field of fields) {
				// go through every datafield (corresponds to a MARC field)
				var subfields = ZU.xpath(field, "./marc:subfield", ns);
				var tag = "";
				for (let subfield of subfields) {
					// get the subfields and their codes...
					var code = ZU.xpathText(subfield, "./@code", ns);
					var sf = ZU.xpathText(subfield, "./text()", ns);
					// delete non-sorting symbols
					// e.g. &#152;Das&#156; Adam-Smith-Projekt
					if (sf) {
						sf = sf.replace(/[\x80-\x9F]/g, "");
						// concat all subfields in one datafield, with subfield delimiter and code between them
						tag = tag + marc.subfieldDelimiter + code + sf;
					}
				}
				record.addField(ZU.xpathText(field, "./@tag", ns), ZU.xpathText(field, "./@ind1", ns) + ZU.xpathText(field, "./@ind2"), tag);
			}
			record.translate(newItem);
			newItem.complete();
		}
	}); // get Translator end
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!-- edited with XML Spy v4.3 U (http://www.xmlspy.com) by Morgan Cundiff (Library of Congress) -->\n<marc:collection xmlns:marc=\"http://www.loc.gov/MARC21/slim\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.loc.gov/MARC21/slim\nhttp://www.loc.gov/standards/marcxml/schema/MARC21slim.xsd\">\n    <marc:record>\n\t\t<marc:leader>00925njm  22002777a 4500</marc:leader>\n\t\t<marc:controlfield tag=\"001\">5637241</marc:controlfield>\n\t\t<marc:controlfield tag=\"003\">DLC</marc:controlfield>\n\t\t<marc:controlfield tag=\"005\">19920826084036.0</marc:controlfield>\n\t\t<marc:controlfield tag=\"007\">sdubumennmplu</marc:controlfield>\n\t\t<marc:controlfield tag=\"008\">910926s1957    nyuuun              eng  </marc:controlfield>\n\t\t<marc:datafield tag=\"010\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">   91758335 </marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"028\" ind1=\"0\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">1259</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">Atlantic</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"040\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">DLC</marc:subfield>\n\t\t\t<marc:subfield code=\"c\">DLC</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"050\" ind1=\"0\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">Atlantic 1259</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"245\" ind1=\"0\" ind2=\"4\">\n\t\t\t<marc:subfield code=\"a\">The Great Ray Charles</marc:subfield>\n\t\t\t<marc:subfield code=\"h\">[sound recording].</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"260\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">New York, N.Y. :</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">Atlantic,</marc:subfield>\n\t\t\t<marc:subfield code=\"c\">[1957?]</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"300\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">1 sound disc :</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">analog, 33 1/3 rpm ;</marc:subfield>\n\t\t\t<marc:subfield code=\"c\">12 in.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"511\" ind1=\"0\" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Ray Charles, piano &amp; celeste.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"505\" ind1=\"0\" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">The Ray -- My melancholy baby -- Black coffee -- There's no you -- Doodlin' -- Sweet sixteen bars -- I surrender dear -- Undecided.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"500\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Brief record.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"650\" ind1=\" \" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">Jazz</marc:subfield>\n\t\t\t<marc:subfield code=\"y\">1951-1960.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"650\" ind1=\" \" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">Piano with jazz ensemble.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"700\" ind1=\"1\" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Charles, Ray,</marc:subfield>\n\t\t\t<marc:subfield code=\"d\">1930-</marc:subfield>\n\t\t\t<marc:subfield code=\"4\">prf</marc:subfield>\n\t\t</marc:datafield>\n\t</marc:record>\n\t<marc:record>\n\t\t<marc:leader>01832cmma 2200349 a 4500</marc:leader>\n\t\t<marc:controlfield tag=\"001\">12149120</marc:controlfield>\n\t\t<marc:controlfield tag=\"005\">20001005175443.0</marc:controlfield>\n\t\t<marc:controlfield tag=\"007\">cr |||</marc:controlfield>\n\t\t<marc:controlfield tag=\"008\">000407m19949999dcu    g   m        eng d</marc:controlfield>\n\t\t<marc:datafield tag=\"906\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">0</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">ibc</marc:subfield>\n\t\t\t<marc:subfield code=\"c\">copycat</marc:subfield>\n\t\t\t<marc:subfield code=\"d\">1</marc:subfield>\n\t\t\t<marc:subfield code=\"e\">ncip</marc:subfield>\n\t\t\t<marc:subfield code=\"f\">20</marc:subfield>\n\t\t\t<marc:subfield code=\"g\">y-gencompf</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"925\" ind1=\"0\" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">undetermined</marc:subfield>\n\t\t\t<marc:subfield code=\"x\">web preservation project (wpp)</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"955\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">vb07 (stars done) 08-19-00 to HLCD lk00; AA3s lk29 received for subject Aug 25, 2000; to DEWEY 08-25-00; aa11 08-28-00</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"010\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">   00530046 </marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"035\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">(OCoLC)ocm44279786</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"040\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">IEU</marc:subfield>\n\t\t\t<marc:subfield code=\"c\">IEU</marc:subfield>\n\t\t\t<marc:subfield code=\"d\">N@F</marc:subfield>\n\t\t\t<marc:subfield code=\"d\">DLC</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"042\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">lccopycat</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"043\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">n-us-dc</marc:subfield>\n\t\t\t<marc:subfield code=\"a\">n-us---</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"050\" ind1=\"0\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">F204.W5</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"082\" ind1=\"1\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">975.3</marc:subfield>\n\t\t\t<marc:subfield code=\"2\">13</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"245\" ind1=\"0\" ind2=\"4\">\n\t\t\t<marc:subfield code=\"a\">The White House</marc:subfield>\n\t\t\t<marc:subfield code=\"h\">[computer file].</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"256\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Computer data.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"260\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Washington, D.C. :</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">White House Web Team,</marc:subfield>\n\t\t\t<marc:subfield code=\"c\">1994-</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"538\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Mode of access: Internet.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"500\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Title from home page as viewed on Aug. 19, 2000.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"520\" ind1=\"8\" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Features the White House. Highlights the Executive Office of the President, which includes senior policy advisors and offices responsible for the President's correspondence and communications, the Office of the Vice President, and the Office of the First Lady. Posts contact information via mailing address, telephone and fax numbers, and e-mail. Contains the Interactive Citizens' Handbook with information on health, travel and tourism, education and training, and housing. Provides a tour and the history of the White House. Links to White House for Kids.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"610\" ind1=\"2\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">White House (Washington, D.C.)</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"610\" ind1=\"1\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">United States.</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">Executive Office of the President.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"610\" ind1=\"1\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">United States.</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">Office of the Vice President.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"610\" ind1=\"1\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">United States.</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">Office of the First Lady.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"710\" ind1=\"2\" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">White House Web Team.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"856\" ind1=\"4\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"u\">http://www.whitehouse.gov</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"856\" ind1=\"4\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"u\">http://lcweb.loc.gov/staff/wpp/whitehouse.html</marc:subfield>\n\t\t\t<marc:subfield code=\"z\">Web site archive</marc:subfield>\n\t\t</marc:datafield>\n\t</marc:record>\n</marc:collection>",
		"items": [
			{
				"itemType": "audioRecording",
				"title": "The Great Ray Charles",
				"creators": [
					{
						"firstName": "Ray",
						"lastName": "Charles",
						"creatorType": "performer"
					}
				],
				"date": "1957",
				"audioRecordingFormat": "sound recording",
				"callNumber": "Atlantic 1259",
				"label": "Atlantic",
				"place": "New York, N.Y",
				"attachments": [],
				"tags": [
					{
						"tag": "1951-1960"
					},
					{
						"tag": "Jazz"
					},
					{
						"tag": "Piano with jazz ensemble"
					}
				],
				"notes": [
					{
						"note": "Brief record"
					},
					{
						"note": "The Ray -- My melancholy baby -- Black coffee -- There's no you -- Doodlin' -- Sweet sixteen bars -- I surrender dear -- Undecided"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "book",
				"title": "The White House",
				"creators": [
					{
						"lastName": "White House Web Team",
						"creatorType": "editor",
						"fieldMode": true
					}
				],
				"date": "1994",
				"abstractNote": "Features the White House. Highlights the Executive Office of the President, which includes senior policy advisors and offices responsible for the President's correspondence and communications, the Office of the Vice President, and the Office of the First Lady. Posts contact information via mailing address, telephone and fax numbers, and e-mail. Contains the Interactive Citizens' Handbook with information on health, travel and tourism, education and training, and housing. Provides a tour and the history of the White House. Links to White House for Kids",
				"callNumber": "F204.W5",
				"extra": "OCLC: ocm44279786",
				"place": "Washington, D.C",
				"publisher": "White House Web Team",
				"attachments": [],
				"tags": [
					{
						"tag": "Executive Office of the President"
					},
					{
						"tag": "Office of the First Lady"
					},
					{
						"tag": "Office of the Vice President"
					},
					{
						"tag": "United States"
					},
					{
						"tag": "United States"
					},
					{
						"tag": "United States"
					},
					{
						"tag": "White House (Washington, D.C.)"
					}
				],
				"notes": [
					{
						"note": "Title from home page as viewed on Aug. 19, 2000"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<collection xmlns=\"http://www.loc.gov/MARC21/slim\">\n<record>\n  <controlfield tag=\"001\">441828</controlfield>\n  <datafield tag=\"020\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">9789279215070</subfield>\n  </datafield>\n  <datafield tag=\"035\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">468303</subfield>\n  </datafield>\n  <datafield tag=\"040\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">ILO</subfield>\n    <subfield code=\"c\">ILO</subfield>\n  </datafield>\n  <datafield tag=\"072\" ind1=\" \" ind2=\"7\">\n    <subfield code=\"a\">14.07.1</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"099\" ind1=\" \" ind2=\"9\">\n    <subfield code=\"a\">WWW ACCESS ONLY</subfield>\n  </datafield>\n  <datafield tag=\"245\" ind1=\"1\" ind2=\"0\">\n    <subfield code=\"a\">Active ageing and solidarity between generations</subfield>\n    <subfield code=\"h\">[electronic resource] :</subfield>\n    <subfield code=\"b\">a statistical portrait of the European Union 2012 /</subfield>\n    <subfield code=\"c\">European Commission, Eurostat.</subfield>\n  </datafield>\n  <datafield tag=\"250\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">2012 ed.</subfield>\n  </datafield>\n  <datafield tag=\"260\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">Luxembourg :</subfield>\n    <subfield code=\"b\">Publications Office of the European Union,</subfield>\n    <subfield code=\"c\">2012.</subfield>\n  </datafield>\n  <datafield tag=\"300\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">141 p. :</subfield>\n    <subfield code=\"b\">statistics</subfield>\n  </datafield>\n  <datafield tag=\"490\" ind1=\"0\" ind2=\" \">\n    <subfield code=\"a\">Statistical books</subfield>\n  </datafield>\n  <datafield tag=\"500\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">Theme: Population and social conditions</subfield>\n  </datafield>\n  <datafield tag=\"500\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">Mode of access : World Wide Web (available in electronic format only).</subfield>\n  </datafield>\n  <datafield tag=\"500\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">Description based on the Internet version on the World Wide Web.</subfield>\n  </datafield>\n  <datafield tag=\"504\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">References.</subfield>\n  </datafield>\n  <datafield tag=\"520\" ind1=\"8\" ind2=\" \">\n    <subfield code=\"a\">Provides details in relation to population ageing and setting the scene as regards the dynamics of demographic change, and details the past, present and projected future structure of the EU's population. Presents information in relation to the demand for healthcare services, as well as the budgetary implications facing governments as their populations continue to age. Contains information relating to the active participation of older generations within society, with a particular focus on inter-generational issues and also includes information on the leisure pursuits and social activities undertaken by older persons.</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">older people</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">older worker</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">retired worker</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">ageing population</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">employment opportunity</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">social security</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">quality of life</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">EU countries</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"655\" ind1=\" \" ind2=\"7\">\n    <subfield code=\"a\">statistical table</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"655\" ind1=\" \" ind2=\"7\">\n    <subfield code=\"a\">EU pub</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">personnes âgées</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">travailleur âgé</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">travailleur retraité</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">vieillissement de la population</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">possibilités d'emploi</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">sécurité sociale</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">qualité de la vie</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">pays de l'UE</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"655\" ind1=\" \" ind2=\"7\">\n    <subfield code=\"a\">tableau statistique</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"655\" ind1=\" \" ind2=\"7\">\n    <subfield code=\"a\">pub UE</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">personas de edad avanzada</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">trabajador de edad avanzada</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">jubilado</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">envejecimiento de la población</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">oportunidades de empleo</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">seguridad social</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">calidad de la vida</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">países de la UE</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"655\" ind1=\" \" ind2=\"7\">\n    <subfield code=\"a\">cuadros estadísticos</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"655\" ind1=\" \" ind2=\"7\">\n    <subfield code=\"a\">pub UE</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"710\" ind1=\"2\" ind2=\" \">\n    <subfield code=\"a\">Statistical Office of the European Communities.</subfield>\n  </datafield>\n  <datafield tag=\"856\" ind1=\"4\" ind2=\" \">\n    <subfield code=\"3\">Full text</subfield>\n    <subfield code=\"u\">http://www.ilo.org/public/libdoc/igo/2011/468303.pdf</subfield>\n  </datafield>\n  <datafield tag=\"900\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">statistical table</subfield>\n  </datafield>\n  <datafield tag=\"900\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">EU pub</subfield>\n  </datafield>\n  <datafield tag=\"901\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">tableau statistique</subfield>\n  </datafield>\n  <datafield tag=\"901\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">pub UE</subfield>\n  </datafield>\n  <datafield tag=\"902\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">cuadros estadísticos</subfield>\n  </datafield>\n  <datafield tag=\"902\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">pub UE</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">older people</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">older worker</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">retired worker</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">ageing population</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">employment opportunity</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">social security</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">quality of life</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">EU countries</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">personnes âgées</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">travailleur âgé</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">travailleur retraité</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">vieillissement de la population</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">possibilités d'emploi</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">sécurité sociale</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">qualité de la vie</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">pays de l'UE</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">personas de edad avanzada</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">trabajador de edad avanzada</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">jubilado</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">envejecimiento de la población</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">oportunidades de empleo</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">seguridad social</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">calidad de la vida</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">países de la UE</subfield>\n  </datafield>\n  <datafield tag=\"915\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">EU countries</subfield>\n  </datafield>\n  <datafield tag=\"920\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">biblio</subfield>\n    <subfield code=\"d\">2012-02-20</subfield>\n  </datafield>\n  <datafield tag=\"925\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">cdc</subfield>\n  </datafield>\n  <datafield tag=\"946\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">cs</subfield>\n    <subfield code=\"d\">2012-02-02</subfield>\n  </datafield>\n  <datafield tag=\"964\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">M680057</subfield>\n    <subfield code=\"d\">nocirc</subfield>\n    <subfield code=\"e\">WWW ACCESS ONLY</subfield>\n    <subfield code=\"m\">Electronic documents</subfield>\n    <subfield code=\"p\">HQ Library - Geneva</subfield>\n  </datafield>\n  <datafield tag=\"970\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">LABORDOC-468303</subfield>\n  </datafield>\n  <datafield tag=\"993\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">04089cam a2201045 a 4500</subfield>\n  </datafield>\n  <datafield tag=\"994\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">20120220060113.0</subfield>\n  </datafield>\n  <datafield tag=\"995\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">120119s2012    lu d    sb    000 0 eng d</subfield>\n  </datafield>\n  <datafield tag=\"996\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">am</subfield>\n  </datafield>\n  <datafield tag=\"997\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">2012</subfield>\n  </datafield>\n  <datafield tag=\"998\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">eng</subfield>\n  </datafield>\n</record>\n</collection>",
		"items": [
			{
				"itemType": "book",
				"title": "Active ageing and solidarity between generations: a statistical portrait of the European Union 2012",
				"creators": [
					{
						"lastName": "Statistical Office of the European Communities",
						"creatorType": "editor",
						"fieldMode": true
					}
				],
				"date": "2012",
				"ISBN": "9789279215070",
				"abstractNote": "Provides details in relation to population ageing and setting the scene as regards the dynamics of demographic change, and details the past, present and projected future structure of the EU's population. Presents information in relation to the demand for healthcare services, as well as the budgetary implications facing governments as their populations continue to age. Contains information relating to the active participation of older generations within society, with a particular focus on inter-generational issues and also includes information on the leisure pursuits and social activities undertaken by older persons",
				"callNumber": "WWW ACCESS ONLY",
				"edition": "2012 ed",
				"numPages": "141",
				"place": "Luxembourg",
				"publisher": "Publications Office of the European Union",
				"series": "Statistical books",
				"url": "http://www.ilo.org/public/libdoc/igo/2011/468303.pdf",
				"attachments": [],
				"tags": [
					"EU countries",
					"EU pub",
					"ageing population",
					"calidad de la vida",
					"cuadros estadísticos",
					"employment opportunity",
					"envejecimiento de la población",
					"jubilado",
					"older people",
					"older worker",
					"oportunidades de empleo",
					"países de la UE",
					"pays de l'UE",
					"personas de edad avanzada",
					"personnes âgées",
					"possibilités d'emploi",
					"pub UE",
					"pub UE",
					"qualité de la vie",
					"quality of life",
					"retired worker",
					"seguridad social",
					"sécurité sociale",
					"social security",
					"statistical table",
					"tableau statistique",
					"trabajador de edad avanzada",
					"travailleur âgé",
					"travailleur retraité",
					"vieillissement de la population"
				],
				"notes": [
					{
						"note": "Theme: Population and social conditions Mode of access : World Wide Web (available in electronic format only) Description based on the Internet version on the World Wide Web"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n  <record xmlns=\"http://www.loc.gov/MARC21/slim\" type=\"Bibliographic\">\n    <leader>00000pam a2200000 c 4500</leader>\n    <controlfield tag=\"001\">1112218955</controlfield>\n    <controlfield tag=\"003\">DE-101</controlfield>\n    <controlfield tag=\"005\">20161020223122.0</controlfield>\n    <controlfield tag=\"007\">tu</controlfield>\n    <controlfield tag=\"008\">160824s2016    gw ||||| |||| 10||||ger  </controlfield>\n    <datafield tag=\"015\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">16,A43</subfield>\n      <subfield code=\"z\">16,N35</subfield>\n      <subfield code=\"2\">dnb</subfield>\n    </datafield>\n    <datafield tag=\"016\" ind1=\"7\" ind2=\" \">\n      <subfield code=\"2\">DE-101</subfield>\n      <subfield code=\"a\">1112218955</subfield>\n    </datafield>\n    <datafield tag=\"020\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">9783781521230</subfield>\n      <subfield code=\"c\">Broschur : EUR 27.90 (DE), EUR 28.70 (AT)</subfield>\n      <subfield code=\"9\">978-3-7815-2123-0</subfield>\n    </datafield>\n    <datafield tag=\"020\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">3781521230</subfield>\n      <subfield code=\"9\">3-7815-2123-0</subfield>\n    </datafield>\n    <datafield tag=\"024\" ind1=\"3\" ind2=\" \">\n      <subfield code=\"a\">9783781521230</subfield>\n    </datafield>\n    <datafield tag=\"035\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">(DE-599)DNB1112218955</subfield>\n    </datafield>\n    <datafield tag=\"035\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">(OCoLC)958469418</subfield>\n    </datafield>\n    <datafield tag=\"040\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">1245</subfield>\n      <subfield code=\"b\">ger</subfield>\n      <subfield code=\"c\">DE-101</subfield>\n      <subfield code=\"d\">9999</subfield>\n      <subfield code=\"e\">rda</subfield>\n    </datafield>\n    <datafield tag=\"041\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">ger</subfield>\n    </datafield>\n    <datafield tag=\"044\" ind1=\" \" ind2=\" \">\n      <subfield code=\"c\">XA-DE-BY</subfield>\n    </datafield>\n    <datafield tag=\"082\" ind1=\"0\" ind2=\"4\">\n      <subfield code=\"8\">1\\x</subfield>\n      <subfield code=\"a\">371.9046</subfield>\n      <subfield code=\"q\">DE-101</subfield>\n      <subfield code=\"2\">22/ger</subfield>\n    </datafield>\n    <datafield tag=\"083\" ind1=\"7\" ind2=\" \">\n      <subfield code=\"a\">370</subfield>\n      <subfield code=\"q\">DE-101</subfield>\n      <subfield code=\"2\">23sdnb</subfield>\n    </datafield>\n    <datafield tag=\"084\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">370</subfield>\n      <subfield code=\"q\">DE-101</subfield>\n      <subfield code=\"2\">sdnb</subfield>\n    </datafield>\n    <datafield tag=\"085\" ind1=\" \" ind2=\" \">\n      <subfield code=\"8\">1\\x</subfield>\n      <subfield code=\"b\">371.9046</subfield>\n    </datafield>\n    <datafield tag=\"090\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">b</subfield>\n    </datafield>\n    <datafield tag=\"111\" ind1=\"2\" ind2=\" \">\n      <subfield code=\"0\">(DE-588)1115266640</subfield>\n      <subfield code=\"0\">(uri)http://d-nb.info/gnd/1115266640</subfield>\n      <subfield code=\"0\">(DE-101)1115266640</subfield>\n      <subfield code=\"a\">Deutsche Gesellschaft für Erziehungswissenschaft</subfield>\n      <subfield code=\"e\">Sektion Sonderpädagogik</subfield>\n      <subfield code=\"e\">Jahrestagung</subfield>\n      <subfield code=\"n\">50.</subfield>\n      <subfield code=\"d\">2015</subfield>\n      <subfield code=\"c\">Basel</subfield>\n      <subfield code=\"j\">Verfasser</subfield>\n      <subfield code=\"4\">aut</subfield>\n    </datafield>\n    <datafield tag=\"245\" ind1=\"0\" ind2=\"0\">\n      <subfield code=\"a\">Bildungs- und Erziehungsorganisatonen im Spannungsfeld von Inklusion und Ökonomisierung</subfield>\n      <subfield code=\"c\">Tanja Sturm, Andreas Köpfer, Benjamin Wagener (Hrsg.)</subfield>\n    </datafield>\n    <datafield tag=\"264\" ind1=\" \" ind2=\"1\">\n      <subfield code=\"a\">Bad Heilbrunn</subfield>\n      <subfield code=\"b\">Verlag Julius Klinkhardt</subfield>\n      <subfield code=\"c\">2016</subfield>\n    </datafield>\n    <datafield tag=\"300\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">417 Seiten</subfield>\n      <subfield code=\"b\">Illustrationen</subfield>\n      <subfield code=\"c\">21 cm</subfield>\n    </datafield>\n    <datafield tag=\"336\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">Text</subfield>\n      <subfield code=\"b\">txt</subfield>\n      <subfield code=\"2\">rdacontent</subfield>\n    </datafield>\n    <datafield tag=\"337\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">ohne Hilfsmittel zu benutzen</subfield>\n      <subfield code=\"b\">n</subfield>\n      <subfield code=\"2\">rdamedia</subfield>\n    </datafield>\n    <datafield tag=\"338\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">Band</subfield>\n      <subfield code=\"b\">nc</subfield>\n      <subfield code=\"2\">rdacarrier</subfield>\n    </datafield>\n    <datafield tag=\"490\" ind1=\"0\" ind2=\" \">\n      <subfield code=\"a\">Perspektiven sonderpädagogischer Forschung</subfield>\n    </datafield>\n    <datafield tag=\"500\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">Tagungsband zur 50. Jahrestagung der DGfE-Sektion Sonderpädagogik 2015 in Basel (Vorwort)</subfield>\n    </datafield>\n    <datafield tag=\"650\" ind1=\" \" ind2=\"7\">\n      <subfield code=\"0\">(DE-588)7693876-1</subfield>\n      <subfield code=\"0\">(uri)http://d-nb.info/gnd/7693876-1</subfield>\n      <subfield code=\"0\">(DE-101)100072185X</subfield>\n      <subfield code=\"a\">Inklusive Pädagogik</subfield>\n      <subfield code=\"2\">gnd</subfield>\n    </datafield>\n    <datafield tag=\"650\" ind1=\" \" ind2=\"7\">\n      <subfield code=\"0\">(DE-588)4126892-1</subfield>\n      <subfield code=\"0\">(uri)http://d-nb.info/gnd/4126892-1</subfield>\n      <subfield code=\"0\">(DE-101)04126892X</subfield>\n      <subfield code=\"a\">Schulentwicklung</subfield>\n      <subfield code=\"2\">gnd</subfield>\n    </datafield>\n    <datafield tag=\"650\" ind1=\" \" ind2=\"7\">\n      <subfield code=\"0\">(DE-588)4035093-9</subfield>\n      <subfield code=\"0\">(uri)http://d-nb.info/gnd/4035093-9</subfield>\n      <subfield code=\"0\">(DE-101)040350932</subfield>\n      <subfield code=\"a\">Lehrerbildung</subfield>\n      <subfield code=\"2\">gnd</subfield>\n    </datafield>\n    <datafield tag=\"650\" ind1=\" \" ind2=\"7\">\n      <subfield code=\"0\">(DE-588)4047376-4</subfield>\n      <subfield code=\"0\">(uri)http://d-nb.info/gnd/4047376-4</subfield>\n      <subfield code=\"0\">(DE-101)040473767</subfield>\n      <subfield code=\"a\">Professionalisierung</subfield>\n      <subfield code=\"2\">gnd</subfield>\n    </datafield>\n    <datafield tag=\"653\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">(Produktform)Book</subfield>\n    </datafield>\n    <datafield tag=\"653\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">Inklusion</subfield>\n    </datafield>\n    <datafield tag=\"653\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">Lehrerbildung</subfield>\n    </datafield>\n    <datafield tag=\"653\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">Sonderpädagogik</subfield>\n    </datafield>\n    <datafield tag=\"653\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">UN-Behindertenrechtskonvention</subfield>\n    </datafield>\n    <datafield tag=\"653\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">(VLB-WN)1572: Hardcover, Softcover / Pädagogik/Bildungswesen</subfield>\n    </datafield>\n    <datafield tag=\"655\" ind1=\" \" ind2=\"7\">\n      <subfield code=\"0\">(DE-588)1071861417</subfield>\n      <subfield code=\"0\">(uri)http://d-nb.info/gnd/1071861417</subfield>\n      <subfield code=\"0\">(DE-101)1071861417</subfield>\n      <subfield code=\"a\">Konferenzschrift</subfield>\n      <subfield code=\"y\">2015</subfield>\n      <subfield code=\"z\">Basel</subfield>\n      <subfield code=\"2\">gnd-content</subfield>\n    </datafield>\n    <datafield tag=\"689\" ind1=\"0\" ind2=\"0\">\n      <subfield code=\"0\">(DE-588)7693876-1</subfield>\n      <subfield code=\"0\">(uri)http://d-nb.info/gnd/7693876-1</subfield>\n      <subfield code=\"0\">(DE-101)100072185X</subfield>\n      <subfield code=\"D\">s</subfield>\n      <subfield code=\"a\">Inklusive Pädagogik</subfield>\n    </datafield>\n    <datafield tag=\"689\" ind1=\"0\" ind2=\"1\">\n      <subfield code=\"0\">(DE-588)4126892-1</subfield>\n      <subfield code=\"0\">(uri)http://d-nb.info/gnd/4126892-1</subfield>\n      <subfield code=\"0\">(DE-101)04126892X</subfield>\n      <subfield code=\"D\">s</subfield>\n      <subfield code=\"a\">Schulentwicklung</subfield>\n    </datafield>\n    <datafield tag=\"689\" ind1=\"0\" ind2=\"2\">\n      <subfield code=\"0\">(DE-588)4035093-9</subfield>\n      <subfield code=\"0\">(uri)http://d-nb.info/gnd/4035093-9</subfield>\n      <subfield code=\"0\">(DE-101)040350932</subfield>\n      <subfield code=\"D\">s</subfield>\n      <subfield code=\"a\">Lehrerbildung</subfield>\n    </datafield>\n    <datafield tag=\"689\" ind1=\"0\" ind2=\"3\">\n      <subfield code=\"0\">(DE-588)4047376-4</subfield>\n      <subfield code=\"0\">(uri)http://d-nb.info/gnd/4047376-4</subfield>\n      <subfield code=\"0\">(DE-101)040473767</subfield>\n      <subfield code=\"D\">s</subfield>\n      <subfield code=\"a\">Professionalisierung</subfield>\n    </datafield>\n    <datafield tag=\"689\" ind1=\"0\" ind2=\" \">\n      <subfield code=\"5\">DE-101</subfield>\n      <subfield code=\"5\">DE-101</subfield>\n    </datafield>\n    <datafield tag=\"700\" ind1=\"1\" ind2=\" \">\n      <subfield code=\"0\">(DE-588)1027192416</subfield>\n      <subfield code=\"0\">(uri)http://d-nb.info/gnd/1027192416</subfield>\n      <subfield code=\"0\">(DE-101)1027192416</subfield>\n      <subfield code=\"a\">Sturm, Tanja</subfield>\n      <subfield code=\"d\">1975-</subfield>\n      <subfield code=\"e\">Herausgeber</subfield>\n      <subfield code=\"4\">edt</subfield>\n    </datafield>\n    <datafield tag=\"700\" ind1=\"1\" ind2=\" \">\n      <subfield code=\"a\">Köpfer, Andreas</subfield>\n      <subfield code=\"e\">Herausgeber</subfield>\n      <subfield code=\"4\">edt</subfield>\n    </datafield>\n    <datafield tag=\"700\" ind1=\"1\" ind2=\" \">\n      <subfield code=\"a\">Wagener, Benjamin</subfield>\n      <subfield code=\"e\">Herausgeber</subfield>\n      <subfield code=\"4\">edt</subfield>\n    </datafield>\n    <datafield tag=\"710\" ind1=\"2\" ind2=\" \">\n      <subfield code=\"0\">(DE-588)2016917-6</subfield>\n      <subfield code=\"0\">(uri)http://d-nb.info/gnd/2016917-6</subfield>\n      <subfield code=\"0\">(DE-101)004754522</subfield>\n      <subfield code=\"a\">Verlag Julius Klinkhardt</subfield>\n      <subfield code=\"4\">pbl</subfield>\n    </datafield>\n    <datafield tag=\"850\" ind1=\" \" ind2=\" \">\n      <subfield code=\"a\">DE-101a</subfield>\n      <subfield code=\"a\">DE-101b</subfield>\n    </datafield>\n    <datafield tag=\"856\" ind1=\"4\" ind2=\"2\">\n      <subfield code=\"m\">B:DE-101</subfield>\n      <subfield code=\"q\">application/pdf</subfield>\n      <subfield code=\"u\">http://d-nb.info/1112218955/04</subfield>\n      <subfield code=\"3\">Inhaltsverzeichnis</subfield>\n    </datafield>\n    <datafield tag=\"925\" ind1=\"r\" ind2=\" \">\n      <subfield code=\"a\">ra</subfield>\n    </datafield>\n    <datafield tag=\"926\" ind1=\"1\" ind2=\" \">\n      <subfield code=\"a\">JNS</subfield>\n      <subfield code=\"o\">93</subfield>\n      <subfield code=\"q\">Publisher</subfield>\n      <subfield code=\"v\">1.1</subfield>\n      <subfield code=\"x\">Sonderpädagogik</subfield>\n    </datafield>\n    <datafield tag=\"926\" ind1=\"2\" ind2=\" \">\n      <subfield code=\"a\">JNK</subfield>\n      <subfield code=\"o\">93</subfield>\n      <subfield code=\"q\">Publisher</subfield>\n      <subfield code=\"v\">1.1</subfield>\n      <subfield code=\"x\">Bildungswesen: Organisation und Verwaltung</subfield>\n    </datafield>\n  </record>\n",
		"items": [
			{
				"itemType": "book",
				"title": "Bildungs- und Erziehungsorganisatonen im Spannungsfeld von Inklusion und Ökonomisierung",
				"creators": [
					{
						"firstName": "Tanja",
						"lastName": "Sturm",
						"creatorType": "editor"
					},
					{
						"firstName": "Andreas",
						"lastName": "Köpfer",
						"creatorType": "editor"
					},
					{
						"firstName": "Benjamin",
						"lastName": "Wagener",
						"creatorType": "editor"
					}
				],
				"date": "2016",
				"ISBN": "9783781521230 3781521230",
				"callNumber": "b",
				"language": "ger",
				"numPages": "417",
				"place": "Bad Heilbrunn",
				"publisher": "Verlag Julius Klinkhardt",
				"series": "Perspektiven sonderpädagogischer Forschung",
				"attachments": [],
				"tags": [
					{
						"tag": "(Produktform)Book"
					},
					{
						"tag": "(VLB-WN)1572: Hardcover, Softcover / Pädagogik/Bildungswesen"
					},
					{
						"tag": "2015"
					},
					{
						"tag": "Basel"
					},
					{
						"tag": "Inklusion"
					},
					{
						"tag": "Inklusive Pädagogik"
					},
					{
						"tag": "Konferenzschrift"
					},
					{
						"tag": "Lehrerbildung"
					},
					{
						"tag": "Lehrerbildung"
					},
					{
						"tag": "Professionalisierung"
					},
					{
						"tag": "Schulentwicklung"
					},
					{
						"tag": "Sonderpädagogik"
					},
					{
						"tag": "UN-Behindertenrechtskonvention"
					}
				],
				"notes": [
					{
						"note": "Tagungsband zur 50. Jahrestagung der DGfE-Sektion Sonderpädagogik 2015 in Basel (Vorwort)"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n           <marc:record xmlns:marc=\"http://www.loc.gov/MARC21/slim\">\n         \t<marc:leader>nm 22 uu 4500</marc:leader>\n         \t<marc:controlfield tag=\"008\">s ||||||||||||||||||||||</marc:controlfield>\n                 <marc:datafield tag=\"041\" ind1=\"0\" ind2=\"7\">\n         \t\t<marc:subfield code=\"a\"></marc:subfield>\n         \t        <marc:subfield code=\"2\">rfc3066</marc:subfield>\n         \t</marc:datafield>\n         \t<marc:datafield tag=\"245\" ind1=\"1\" ind2=\"0\">\n                 \t<marc:subfield code=\"a\">Adaptation: the Continuing Evolution of the New York Public Library&#8217;s Digital Design System</marc:subfield>\n         \t</marc:datafield>\n         \t<marc:datafield tag=\"260\" ind1=\"\" ind2=\"\">\n         \t\t<marc:subfield code=\"b\">The Code4Lib Journal</marc:subfield>\n         \t\t<marc:subfield code=\"c\">Fri, 17 Aug 2018 08:14:38 +0000</marc:subfield>\n         \t</marc:datafield>\n         \t<marc:datafield tag=\"520\" ind1=\"\" ind2=\"\">\n                         <marc:subfield code=\"a\">'A design system is crucial for sustaining both the continuity and the advancement of a website's design. But it's hard to create such a system when content, technology, and staff are constantly changing. This is the situation faced by the Digital team at the New York Public Library. When those are the conditions of the problem, the design system needs to be modular, distributed, and standardized, so that it can withstand constant change and provide a reliable foundation. NYPL's design system has gone through three major iterations, each a step towards the best way to manage design principles across an abundance of heterogeneous content and many contributors who brought different skills to the team and department at different times. Starting from an abstracted framework that provided a template for future systems, then a specific component system for a new project, and finally a system of interoperable components and layouts, NYPL's Digital team continues to grow and adapt its digital design resource.'</marc:subfield>\n         \t</marc:datafield>\n         \t<marc:datafield tag=\"650\" ind1=\"1\" ind2=\"\">\n                 <marc:subfield code=\"a\">Issue 41</marc:subfield>\n                 </marc:datafield>\n                 <marc:datafield tag=\"700\" ind1=\"1\" ind2=\"\">\n                 \t<marc:subfield code=\"a\">Jennifer L. Anderson &amp; Edwin Guzman</marc:subfield>\n         \t</marc:datafield>\n         \t<marc:datafield tag=\"856\" ind1=\"\" ind2=\"\">\n         \t\t<marc:subfield code=\"u\">https://journal.code4lib.org/articles/13657</marc:subfield>\n         \t</marc:datafield>\n           </marc:record>",
		"items": [
			{
				"itemType": "book",
				"title": "Adaptation: the Continuing Evolution of the New York Public Library’s Digital Design System",
				"creators": [
					{
						"lastName": "Jennifer L. Anderson & Edwin Guzman",
						"creatorType": "editor"
					}
				],
				"date": "17",
				"abstractNote": "'A design system is crucial for sustaining both the continuity and the advancement of a website's design. But it's hard to create such a system when content, technology, and staff are constantly changing. This is the situation faced by the Digital team at the New York Public Library. When those are the conditions of the problem, the design system needs to be modular, distributed, and standardized, so that it can withstand constant change and provide a reliable foundation. NYPL's design system has gone through three major iterations, each a step towards the best way to manage design principles across an abundance of heterogeneous content and many contributors who brought different skills to the team and department at different times. Starting from an abstracted framework that provided a template for future systems, then a specific component system for a new project, and finally a system of interoperable components and layouts, NYPL's Digital team continues to grow and adapt its digital design resource.'",
				"publisher": "The Code4Lib Journal",
				"attachments": [],
				"tags": [
					{
						"tag": "Issue 41"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
