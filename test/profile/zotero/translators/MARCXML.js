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
	"browserSupport": "gcsv",
	"lastUpdated": "2014-03-12 21:40:16"
}

function detectImport() {
	var line;
	var i = 0;
	while ((line = Zotero.read()) !== false) {
		if (line != "") {
			if (line.match(/<(marc\:)?collection xmlns(\:marc)?=\"http:\/\/www\.loc\.gov\/MARC21\/slim\"/)) {
				return true;
			} else {
				if (i++ > 5) {
					return false;
				}
			}
		}
	}
}


function doImport() {
	var text = "";
	var line;
	while (line = Zotero.read()) {
		text += line;
	}
	//call MARC translator
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
	translator.getTranslatorObject(function (marc) {

		var parser = new DOMParser();
		var xml = parser.parseFromString(text, 'text/xml');
		//define the marc namespace
		ns = {
			"marc": "http://www.loc.gov/MARC21/slim"
		};
		var records = ZU.xpath(xml, '//marc:record', ns);
		for (var i in records) {

			//create one new item per record
			var record = new marc.record();
			var newItem = new Zotero.Item();
			var fields = ZU.xpath(records[i], "./marc:datafield", ns);
			for (var j in fields) {
				//go through every datafield (corresponds to a MARC field)
				var subfields = ZU.xpath(fields[j], "./marc:subfield", ns);
				for (var k in subfields) {
					//get the subfields and their codes...
					var code = ZU.xpathText(subfields[k], "./@code", ns)
					var sf = ZU.xpathText(subfields[k], "./text()", ns)
					//set tag to an empty string if this is the first subfield
					if (k == 0) var tag = "";
					//concat all subfields in one datafield, with subfield delimiter and code between them
					tag = tag + marc.subfieldDelimiter + code + sf;
				}
				record.addField(ZU.xpathText(fields[j], "./@tag", ns), ZU.xpathText(fields[j], "./@ind1", ns) + ZU.xpathText(fields[j], "./@ind2"), tag);
			}
			record.translate(newItem);
			newItem.complete();
		}
	}) //get Translator end
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!-- edited with XML Spy v4.3 U (http://www.xmlspy.com) by Morgan Cundiff (Library of Congress) -->\n<marc:collection xmlns:marc=\"http://www.loc.gov/MARC21/slim\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.loc.gov/MARC21/slim\nhttp://www.loc.gov/standards/marcxml/schema/MARC21slim.xsd\">\n    <marc:record>\n\t\t<marc:leader>00925njm  22002777a 4500</marc:leader>\n\t\t<marc:controlfield tag=\"001\">5637241</marc:controlfield>\n\t\t<marc:controlfield tag=\"003\">DLC</marc:controlfield>\n\t\t<marc:controlfield tag=\"005\">19920826084036.0</marc:controlfield>\n\t\t<marc:controlfield tag=\"007\">sdubumennmplu</marc:controlfield>\n\t\t<marc:controlfield tag=\"008\">910926s1957    nyuuun              eng  </marc:controlfield>\n\t\t<marc:datafield tag=\"010\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">   91758335 </marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"028\" ind1=\"0\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">1259</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">Atlantic</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"040\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">DLC</marc:subfield>\n\t\t\t<marc:subfield code=\"c\">DLC</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"050\" ind1=\"0\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">Atlantic 1259</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"245\" ind1=\"0\" ind2=\"4\">\n\t\t\t<marc:subfield code=\"a\">The Great Ray Charles</marc:subfield>\n\t\t\t<marc:subfield code=\"h\">[sound recording].</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"260\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">New York, N.Y. :</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">Atlantic,</marc:subfield>\n\t\t\t<marc:subfield code=\"c\">[1957?]</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"300\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">1 sound disc :</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">analog, 33 1/3 rpm ;</marc:subfield>\n\t\t\t<marc:subfield code=\"c\">12 in.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"511\" ind1=\"0\" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Ray Charles, piano &amp; celeste.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"505\" ind1=\"0\" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">The Ray -- My melancholy baby -- Black coffee -- There's no you -- Doodlin' -- Sweet sixteen bars -- I surrender dear -- Undecided.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"500\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Brief record.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"650\" ind1=\" \" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">Jazz</marc:subfield>\n\t\t\t<marc:subfield code=\"y\">1951-1960.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"650\" ind1=\" \" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">Piano with jazz ensemble.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"700\" ind1=\"1\" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Charles, Ray,</marc:subfield>\n\t\t\t<marc:subfield code=\"d\">1930-</marc:subfield>\n\t\t\t<marc:subfield code=\"4\">prf</marc:subfield>\n\t\t</marc:datafield>\n\t</marc:record>\n\t<marc:record>\n\t\t<marc:leader>01832cmma 2200349 a 4500</marc:leader>\n\t\t<marc:controlfield tag=\"001\">12149120</marc:controlfield>\n\t\t<marc:controlfield tag=\"005\">20001005175443.0</marc:controlfield>\n\t\t<marc:controlfield tag=\"007\">cr |||</marc:controlfield>\n\t\t<marc:controlfield tag=\"008\">000407m19949999dcu    g   m        eng d</marc:controlfield>\n\t\t<marc:datafield tag=\"906\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">0</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">ibc</marc:subfield>\n\t\t\t<marc:subfield code=\"c\">copycat</marc:subfield>\n\t\t\t<marc:subfield code=\"d\">1</marc:subfield>\n\t\t\t<marc:subfield code=\"e\">ncip</marc:subfield>\n\t\t\t<marc:subfield code=\"f\">20</marc:subfield>\n\t\t\t<marc:subfield code=\"g\">y-gencompf</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"925\" ind1=\"0\" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">undetermined</marc:subfield>\n\t\t\t<marc:subfield code=\"x\">web preservation project (wpp)</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"955\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">vb07 (stars done) 08-19-00 to HLCD lk00; AA3s lk29 received for subject Aug 25, 2000; to DEWEY 08-25-00; aa11 08-28-00</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"010\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">   00530046 </marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"035\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">(OCoLC)ocm44279786</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"040\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">IEU</marc:subfield>\n\t\t\t<marc:subfield code=\"c\">IEU</marc:subfield>\n\t\t\t<marc:subfield code=\"d\">N@F</marc:subfield>\n\t\t\t<marc:subfield code=\"d\">DLC</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"042\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">lccopycat</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"043\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">n-us-dc</marc:subfield>\n\t\t\t<marc:subfield code=\"a\">n-us---</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"050\" ind1=\"0\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">F204.W5</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"082\" ind1=\"1\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">975.3</marc:subfield>\n\t\t\t<marc:subfield code=\"2\">13</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"245\" ind1=\"0\" ind2=\"4\">\n\t\t\t<marc:subfield code=\"a\">The White House</marc:subfield>\n\t\t\t<marc:subfield code=\"h\">[computer file].</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"256\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Computer data.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"260\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Washington, D.C. :</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">White House Web Team,</marc:subfield>\n\t\t\t<marc:subfield code=\"c\">1994-</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"538\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Mode of access: Internet.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"500\" ind1=\" \" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Title from home page as viewed on Aug. 19, 2000.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"520\" ind1=\"8\" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">Features the White House. Highlights the Executive Office of the President, which includes senior policy advisors and offices responsible for the President's correspondence and communications, the Office of the Vice President, and the Office of the First Lady. Posts contact information via mailing address, telephone and fax numbers, and e-mail. Contains the Interactive Citizens' Handbook with information on health, travel and tourism, education and training, and housing. Provides a tour and the history of the White House. Links to White House for Kids.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"610\" ind1=\"2\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">White House (Washington, D.C.)</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"610\" ind1=\"1\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">United States.</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">Executive Office of the President.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"610\" ind1=\"1\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">United States.</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">Office of the Vice President.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"610\" ind1=\"1\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"a\">United States.</marc:subfield>\n\t\t\t<marc:subfield code=\"b\">Office of the First Lady.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"710\" ind1=\"2\" ind2=\" \">\n\t\t\t<marc:subfield code=\"a\">White House Web Team.</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"856\" ind1=\"4\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"u\">http://www.whitehouse.gov</marc:subfield>\n\t\t</marc:datafield>\n\t\t<marc:datafield tag=\"856\" ind1=\"4\" ind2=\"0\">\n\t\t\t<marc:subfield code=\"u\">http://lcweb.loc.gov/staff/wpp/whitehouse.html</marc:subfield>\n\t\t\t<marc:subfield code=\"z\">Web site archive</marc:subfield>\n\t\t</marc:datafield>\n\t</marc:record>\n</marc:collection>",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Ray",
						"lastName": "Charles",
						"creatorType": "editor"
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
				"tags": [
					"Jazz",
					"1951-1960",
					"Piano with jazz ensemble"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "The Great Ray Charles",
				"place": "New York, N.Y",
				"publisher": "Atlantic",
				"date": "1957",
				"numPages": "1",
				"callNumber": "Atlantic 1259",
				"medium": "sound recording"
			},
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "White House Web Team",
						"fieldMode": true
					}
				],
				"notes": [
					{
						"note": "Title from home page as viewed on Aug. 19, 2000"
					},
					{
						"note": "Features the White House. Highlights the Executive Office of the President, which includes senior policy advisors and offices responsible for the President's correspondence and communications, the Office of the Vice President, and the Office of the First Lady. Posts contact information via mailing address, telephone and fax numbers, and e-mail. Contains the Interactive Citizens' Handbook with information on health, travel and tourism, education and training, and housing. Provides a tour and the history of the White House. Links to White House for Kids"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "The White House",
				"place": "Washington, D.C",
				"publisher": "White House Web Team",
				"date": "1994",
				"callNumber": "F204.W5",
				"medium": "computer file"
			}
		]
	},
	{
		"type": "import",
		"input": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<collection xmlns=\"http://www.loc.gov/MARC21/slim\">\n<record>\n  <controlfield tag=\"001\">441828</controlfield>\n  <datafield tag=\"020\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">9789279215070</subfield>\n  </datafield>\n  <datafield tag=\"035\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">468303</subfield>\n  </datafield>\n  <datafield tag=\"040\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">ILO</subfield>\n    <subfield code=\"c\">ILO</subfield>\n  </datafield>\n  <datafield tag=\"072\" ind1=\" \" ind2=\"7\">\n    <subfield code=\"a\">14.07.1</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"099\" ind1=\" \" ind2=\"9\">\n    <subfield code=\"a\">WWW ACCESS ONLY</subfield>\n  </datafield>\n  <datafield tag=\"245\" ind1=\"1\" ind2=\"0\">\n    <subfield code=\"a\">Active ageing and solidarity between generations</subfield>\n    <subfield code=\"h\">[electronic resource] :</subfield>\n    <subfield code=\"b\">a statistical portrait of the European Union 2012 /</subfield>\n    <subfield code=\"c\">European Commission, Eurostat.</subfield>\n  </datafield>\n  <datafield tag=\"250\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">2012 ed.</subfield>\n  </datafield>\n  <datafield tag=\"260\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">Luxembourg :</subfield>\n    <subfield code=\"b\">Publications Office of the European Union,</subfield>\n    <subfield code=\"c\">2012.</subfield>\n  </datafield>\n  <datafield tag=\"300\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">141 p. :</subfield>\n    <subfield code=\"b\">statistics</subfield>\n  </datafield>\n  <datafield tag=\"490\" ind1=\"0\" ind2=\" \">\n    <subfield code=\"a\">Statistical books</subfield>\n  </datafield>\n  <datafield tag=\"500\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">Theme: Population and social conditions</subfield>\n  </datafield>\n  <datafield tag=\"500\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">Mode of access : World Wide Web (available in electronic format only).</subfield>\n  </datafield>\n  <datafield tag=\"500\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">Description based on the Internet version on the World Wide Web.</subfield>\n  </datafield>\n  <datafield tag=\"504\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">References.</subfield>\n  </datafield>\n  <datafield tag=\"520\" ind1=\"8\" ind2=\" \">\n    <subfield code=\"a\">Provides details in relation to population ageing and setting the scene as regards the dynamics of demographic change, and details the past, present and projected future structure of the EU's population. Presents information in relation to the demand for healthcare services, as well as the budgetary implications facing governments as their populations continue to age. Contains information relating to the active participation of older generations within society, with a particular focus on inter-generational issues and also includes information on the leisure pursuits and social activities undertaken by older persons.</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">older people</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">older worker</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">retired worker</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">ageing population</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">employment opportunity</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">social security</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">quality of life</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">EU countries</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"655\" ind1=\" \" ind2=\"7\">\n    <subfield code=\"a\">statistical table</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"655\" ind1=\" \" ind2=\"7\">\n    <subfield code=\"a\">EU pub</subfield>\n    <subfield code=\"2\">ilot</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">personnes âgées</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">travailleur âgé</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">travailleur retraité</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">vieillissement de la population</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">possibilités d'emploi</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">sécurité sociale</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">qualité de la vie</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">pays de l'UE</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"655\" ind1=\" \" ind2=\"7\">\n    <subfield code=\"a\">tableau statistique</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"655\" ind1=\" \" ind2=\"7\">\n    <subfield code=\"a\">pub UE</subfield>\n    <subfield code=\"2\">tbit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">personas de edad avanzada</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">trabajador de edad avanzada</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">jubilado</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">envejecimiento de la población</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">oportunidades de empleo</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">seguridad social</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">calidad de la vida</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"650\" ind1=\"1\" ind2=\"7\">\n    <subfield code=\"a\">países de la UE</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"655\" ind1=\" \" ind2=\"7\">\n    <subfield code=\"a\">cuadros estadísticos</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"655\" ind1=\" \" ind2=\"7\">\n    <subfield code=\"a\">pub UE</subfield>\n    <subfield code=\"2\">toit</subfield>\n  </datafield>\n  <datafield tag=\"710\" ind1=\"2\" ind2=\" \">\n    <subfield code=\"a\">Statistical Office of the European Communities.</subfield>\n  </datafield>\n  <datafield tag=\"856\" ind1=\"4\" ind2=\" \">\n    <subfield code=\"3\">Full text</subfield>\n    <subfield code=\"u\">http://www.ilo.org/public/libdoc/igo/2011/468303.pdf</subfield>\n  </datafield>\n  <datafield tag=\"900\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">statistical table</subfield>\n  </datafield>\n  <datafield tag=\"900\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">EU pub</subfield>\n  </datafield>\n  <datafield tag=\"901\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">tableau statistique</subfield>\n  </datafield>\n  <datafield tag=\"901\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">pub UE</subfield>\n  </datafield>\n  <datafield tag=\"902\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">cuadros estadísticos</subfield>\n  </datafield>\n  <datafield tag=\"902\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">pub UE</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">older people</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">older worker</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">retired worker</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">ageing population</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">employment opportunity</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">social security</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">quality of life</subfield>\n  </datafield>\n  <datafield tag=\"905\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">EU countries</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">personnes âgées</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">travailleur âgé</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">travailleur retraité</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">vieillissement de la population</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">possibilités d'emploi</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">sécurité sociale</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">qualité de la vie</subfield>\n  </datafield>\n  <datafield tag=\"906\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">pays de l'UE</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">personas de edad avanzada</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">trabajador de edad avanzada</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">jubilado</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">envejecimiento de la población</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">oportunidades de empleo</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">seguridad social</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">calidad de la vida</subfield>\n  </datafield>\n  <datafield tag=\"907\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">países de la UE</subfield>\n  </datafield>\n  <datafield tag=\"915\" ind1=\"1\" ind2=\" \">\n    <subfield code=\"a\">EU countries</subfield>\n  </datafield>\n  <datafield tag=\"920\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">biblio</subfield>\n    <subfield code=\"d\">2012-02-20</subfield>\n  </datafield>\n  <datafield tag=\"925\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">cdc</subfield>\n  </datafield>\n  <datafield tag=\"946\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">cs</subfield>\n    <subfield code=\"d\">2012-02-02</subfield>\n  </datafield>\n  <datafield tag=\"964\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">M680057</subfield>\n    <subfield code=\"d\">nocirc</subfield>\n    <subfield code=\"e\">WWW ACCESS ONLY</subfield>\n    <subfield code=\"m\">Electronic documents</subfield>\n    <subfield code=\"p\">HQ Library - Geneva</subfield>\n  </datafield>\n  <datafield tag=\"970\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">LABORDOC-468303</subfield>\n  </datafield>\n  <datafield tag=\"993\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">04089cam a2201045 a 4500</subfield>\n  </datafield>\n  <datafield tag=\"994\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">20120220060113.0</subfield>\n  </datafield>\n  <datafield tag=\"995\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">120119s2012    lu d    sb    000 0 eng d</subfield>\n  </datafield>\n  <datafield tag=\"996\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">am</subfield>\n  </datafield>\n  <datafield tag=\"997\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">2012</subfield>\n  </datafield>\n  <datafield tag=\"998\" ind1=\" \" ind2=\" \">\n    <subfield code=\"a\">eng</subfield>\n  </datafield>\n</record>\n</collection>",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "Statistical Office of the European Communities",
						"fieldMode": true
					}
				],
				"notes": [
					{
						"note": "Theme: Population and social conditions Mode of access : World Wide Web (available in electronic format only) Description based on the Internet version on the World Wide Web"
					},
					{
						"note": "Provides details in relation to population ageing and setting the scene as regards the dynamics of demographic change, and details the past, present and projected future structure of the EU's population. Presents information in relation to the demand for healthcare services, as well as the budgetary implications facing governments as their populations continue to age. Contains information relating to the active participation of older generations within society, with a particular focus on inter-generational issues and also includes information on the leisure pursuits and social activities undertaken by older persons"
					}
				],
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
				"seeAlso": [],
				"attachments": [],
				"ISBN": "9789279215070",
				"edition": "2012 ed",
				"place": "Luxembourg",
				"numPages": "141",
				"series": "Statistical books",
				"callNumber": "WWW ACCESS ONLY",
				"url": "http://www.ilo.org/public/libdoc/igo/2011/468303.pdf",
				"title": "Active ageing and solidarity between generations a statistical portrait of the European Union 2012",
				"publisher": "Publications Office of the European Union",
				"date": "2012"
			}
		]
	}
]
/** END TEST CASES **/