{
	"translatorID": "c070e5a2-4bfd-44bb-9b3c-4be20c50d0d9",
	"label": "Library of Congress ISBN",
	"creator": "Sebastian Karcher",
	"target": "",
	"minVersion": "3.0.9",
	"maxVersion": "",
	"priority": 98,
	"inRepository": true,
	"translatorType": 8,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-04-13 13:41:00"
}


function detectSearch(item) {
	//re-enable once 
	/*if (item.ISBN) {
		return !!ZU.cleanISBN(item.ISBN)
	} else return false; */
	return !!item.ISBN;
}


function doSearch(item) {
	//Sends an SRU formatted as CQL to the library of Congress asking for marcXML back
	//http://www.loc.gov/standards/sru/
	
	let url;
	if (item.ISBN) {
		url = "http://lx2.loc.gov:210/LCDB?operation=searchRetrieve&version=1.1&query=bath.ISBN=^" + ZU.cleanISBN(item.ISBN) + "&maximumRecords=1";
	}
	else if (item.query) {
		url = "http://lx2.loc.gov:210/LCDB?operation=searchRetrieve&version=1.1&query=" + encodeURIComponent(item.query) + "&maximumRecords=50";
	}
	
	ZU.doGet(url, function (text) {
		//Z.debug(text);
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("edd87d07-9194-42f8-b2ad-997c4c7deefd");
		translator.setString(text);
		translator.translate();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "search",
		"input": {
			"ISBN": "9780521779241"
		},
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "Haakonssen",
						"firstName": "Knud",
						"creatorType": "editor"
					}
				],
				"notes": [ 
					{ 
						"note": "Imagination : morals, science, arts / Charles L. Griswold, Jr. -- Adam Smith, belletrist / Mark Salber Phillips -- Adam Smith's theory of language / Marcelo Dascal -- Smith and science / Christopher J. Berry -- Smith on ingenuity, pleasure, and the imitative arts / Neil de Marchi -- Sympathy and the impartial spectator / Alexander Broadie -- Virtues, utility, and rules / Robert Shaver -- Adam Smith on justice, rights, and law / David Lieberman -- Self-interest and other interests / Pratap Bhanu Mehta -- Adam Smith and history / J.G.A. Pocock -- Adam Smith's politics / Douglas Long -- Adam Smith's economics / Emma Rothschild and Amartya Sen -- The legacy of Adam Smith / Knud Haakonssen and Donald Winch" 
					}
				],
				"tags": [
					"Smith, Adam"
				],
				"seeAlso": [],
				"attachments": [],
				"libraryCatalog": "Library of Congress ISBN",
				"place": "Cambridge ; New York",
				"ISBN": "9780521770590 9780521779241",
				"title": "The Cambridge companion to Adam Smith",
				"publisher": "Cambridge University Press",
				"date": "2006",
				"numPages": "409",
				"series": "Cambridge companions to philosophy",
				"callNumber": "B1545.Z7 C36 2006",
				"extra": "OCLC: ocm60321422"
			}
		]
	}
]
/** END TEST CASES **/