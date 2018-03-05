{
	"translatorID": "1300cd65-d23a-4bbf-93e5-a3c9e00d1066",
	"label": "Primo",
	"creator": "Matt Burton, Avram Lyon, Etienne Cavalié, Rintze Zelle, Philipp Zumstein, Sebastian Karcher, Aurimas Vinckevicius",
	"target": "/primo_library/|/nebis/|^https?://www\\.recherche-portal\\.ch/zbz/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 101,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2018-01-21 17:43:32"
}

/*
Supports Primo 2:
Université de Nice, France (http://catalogue.unice.fr/)  (looks like this is Primo3 now, too)
Supports Primo 3
Boston College (http://www.bc.edu/libraries/),
Oxford Libraries (http://solo.ouls.ox.ac.uk/)

Primos with showPNX.jsp installed:
(1) http://purdue-primo-prod.hosted.exlibrisgroup.com/primo_library/libweb/action/search.do?vid=PURDUE
(2) http://primo.bib.uni-mannheim.de/primo_library/libweb/action/search.do?vid=MAN_UB
(3) http://limo.libis.be/primo_library/libweb/action/search.do?vid=LIBISnet&fromLogin=true
(4.a) http://virtuose.uqam.ca/primo_library/libweb/action/search.do?vid=UQAM
(5) http://searchit.princeton.edu/primo_library/libweb/action/dlDisplay.do?docId=PRN_VOYAGER2778598&vid=PRINCETON&institution=PRN
*/

function getSearchResults(doc) {
	var linkXPaths = [ //order dictates preference
		'.//li[starts-with(@id,"exlidResult") and substring(@id,string-length(@id)-10)="-DetailsTab"]/a[@href]', //details link
		'.//h2[@class="EXLResultTitle"]/a[@href]' //title link
	];
	var resultsXPath = '//*[self::tr or self::div][starts-with(@id, "exlidResult") and '
		+ 'number(substring(@id,12))=substring(@id,12)][' + linkXPaths.join(' or ') + ']';
	//Z.debug(resultsXPath);
	var results = ZU.xpath(doc, resultsXPath);
	results.titleXPath = './/h2[@class="EXLResultTitle"]';
	results.linkXPaths = linkXPaths;
	return results;
}

function detectWeb(doc, url) {
	if(getSearchResults(doc).length) {
		return 'multiple';
	}
	
	var contentDiv = doc.getElementsByClassName('EXLFullResultsHeader');
	if(!contentDiv.length) contentDiv = doc.getElementsByClassName('EXLFullDisplay');
	if(!contentDiv.length) contentDiv = doc.getElementsByClassName('EXLFullView');
	if(contentDiv.length) return 'book';
}

function doWeb(doc, url) {
	var searchResults = getSearchResults(doc);
	if(searchResults.length) {
		var items = {}, itemIDs = {}, title, link,
			linkXPaths = searchResults.linkXPaths;
		for(var i=0, n=searchResults.length; i<n; i++) {
			title = ZU.xpathText(searchResults[i], searchResults.titleXPath);
			for(var j=0, m=linkXPaths.length; j<m; j++) {
				link = ZU.xpath(searchResults[i], linkXPaths[j])[0];
				if(link) {
					break;
				}
			}
			
			if(!link || !title || !(title = ZU.trimInternal(title))) continue;
			
			items[link.href] = title;
			itemIDs[link.href] = {id: i, docID: getDocID(link.href)};
		}
		
		Z.selectItems(items, function(selectedItems) {
			if(!selectedItems) return true;
			
			var urls = [];
			for(var i in selectedItems) {
				urls.push({url: i, id: itemIDs[i].id, docID: itemIDs[i].docID});
			}
			fetchPNX(urls);
		});
	} else {
		fetchPNX([{url: url, id: 0, docID: getDocID(url)}]);
	}
}

function getDocID(url) {
	var id = url.match(/\bdoc(?:Id)?=([^&]+)/i);
	if(id) return id[1];
}

//keeps track of which URL format works for retrieving PNX record
//and applies the correct transformation function
var PNXUrlGenerator = new function() {
	var functions = [
		//showPNX.js
		//using docIDs instead of IDs tied to a session
		//e.g. http://searchit.princeton.edu/primo_library/libweb/showPNX.jsp?id=PRN_VOYAGER7343340
		function(urlObj) {
			return getUrlWithId(urlObj.url, urlObj.docID);
		},
		//fall back to IDs
		//from: http://primo.bib.uni-mannheim.de/primo_library/libweb/action/search.do?...
		//to:   http://primo.bib.uni-mannheim.de/primo_library/libweb/showPNX.jsp?id=
		function(urlObj) {
			return getUrlWithId(urlObj.url, urlObj.id);
		},
		//simply add &showPnx=true
		function(urlObj) {
			var url = urlObj.url.split('#');
			if(url[0].indexOf('?') == -1) {
				url[0] += '?';
			} else {
				url[0] += '&';
			}
			return url[0] + 'showPnx=true';
		}
	];
	
	function getUrlWithId(url, id) {
		var url = url.match(/(https?:\/\/[^?#]+\/)[^?#]+\/[^\/]*(?:[?#]|$)/);
		if(!url) return;
		return url[1] + 'showPNX.jsp?id=' + id;
	}
	
	this.currentFunction = 0;
	this.confirmed = false;
	
	this.getUrl = function(data) {
		var fun = functions[this.currentFunction];
		if(!fun) return;
		
		return fun(data);
	};
	
	this.nextFunction = function() {
		if(!this.confirmed && this.currentFunction < functions.length) {
			Z.debug("Function " + this.currentFunction + " did not work.");
			this.currentFunction++;
			return true;
		}
	};
};

//retrieve PNX records for given items sequentially
function fetchPNX(itemData) {
	if(!itemData.length) return; //do this until we run out of URLs
	
	var data = itemData.shift();
	var url = PNXUrlGenerator.getUrl(data); //format URL if still possible
	if(!url) {
		if(PNXUrlGenerator.nextFunction()) {
			itemData.unshift(data);
		} else if(!PNXUrlGenerator.confirmed){
			//in case we can't find PNX for a particular item,
			//go to the next and start looking from begining
			Z.debug("Could not determine PNX url from " + data.url);
			PNXUrlGenerator.currentFunction = 0;
		}
		
		fetchPNX(itemData);
		return;
	}
	
	var gotPNX = false;
	Z.debug("Trying " + url);
	ZU.doGet(url,
		function(text) {
			text = text.trim();
			if(text.substr(0,5) != '<?xml' || text.search(/<error\b/i) !== -1) {
				//try a different PNX url
				gotPNX = false;
				return;
			} else {
				gotPNX = true;
				PNXUrlGenerator.confirmed = true;
			}
			
			importPNX(text, url);
		},
		function() {
			if(!gotPNX && PNXUrlGenerator.nextFunction()) {
				//if url function not confirmed, try another one on the same URL
				//otherwise, we move on
				itemData.unshift(data);
			}
			
			fetchPNX(itemData);
		}
	);
}

function importPNX(text, url) {
	// Z.debug(text);
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("efd737c9-a227-4113-866e-d57fbc0684ca");
	translator.setString(text);
	translator.setHandler("itemDone", function(obj, item) {
		if (url) {
			item.libraryCatalog = url.match(/^https?:\/\/(.+?)\//)[1].replace(/\.hosted\.exlibrisgroup/, "");
		}
		item.complete();
	});
	translator.translate();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://princeton-primo.hosted.exlibrisgroup.com/primo_library/libweb/action/dlDisplay.do?vid=PRINCETON&search_scope=All%20Princeton%20Libraries&docId=PRN_VOYAGER2778598&fn=permalink",
		"items": [
			{
				"itemType": "book",
				"title": "China and foreign missionaries.",
				"creators": [
					{
						"lastName": "Great Britain. Foreign Office",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "1860",
				"callNumber": "5552.406",
				"language": "eng",
				"libraryCatalog": "princeton-primo.com",
				"place": "London",
				"publisher": "London 1860-1912",
				"attachments": [],
				"tags": [
					"China Foreign relations Great Britain.",
					"China Religion.",
					"Great Britain Foreign relations China.",
					"Missions China."
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://purdue-primo-prod.hosted.exlibrisgroup.com/default:default_scope:PURDUE_ALMA21505315560001081",
		"items": [
			{
				"itemType": "book",
				"title": "War",
				"creators": [
					{
						"firstName": "Lawrence",
						"lastName": "Freedman",
						"creatorType": "author"
					}
				],
				"date": "1994",
				"ISBN": "9780192892546",
				"abstractNote": "Experience of war -- Causes of war -- War and the military establishment -- Ethics of war -- Strategy -- Total war and the great powers -- Limited war and developing countries., \"War makes headlines and history books. It has shaped the international system, prompted social change, and inspired literature, art, and music. It engenders some of the most intense as well as the most brutal human experiences, and it raises fundamental questions of human ethics.\" \"The ubiquitous, contradictory, and many-sided character of war is fully reflected in this reader. It addresses a wide range of questions: What are the causes of war? Which strategic as well as moral principles guide its conduct, and how have these changed? Has total war become unthinkable? What is the nature of contemporary conflict? How is war experienced by those on the front line?\" \"These and other key issues are examined through a variety of writings. Drawing on sources from numerous countries and disciplines, this reader includes accounts by generals, soldiers, historians, strategists, and poets, who consider conflicts from the Napoleonic Wars to Vietnam and Bosnia. The writing not only of great strategic thinkers but also of ordinary soldiers illustrates both the theory and the experience of war in its many guises.\"--BOOK JACKET.",
				"callNumber": "355.02 W1945 1994",
				"language": "eng",
				"libraryCatalog": "Primo",
				"numPages": "xi+385",
				"place": "Oxford ; New York",
				"publisher": "Oxford University Press",
				"series": "Oxford readers",
				"attachments": [],
				"tags": [
					"War."
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://limo.libis.be/LIBISnet:default_scope:32LIBIS_ALMA_DS71166851730001471",
		"items": [
			{
				"itemType": "book",
				"title": "War",
				"creators": [
					{
						"firstName": "Albert R.",
						"lastName": "Leventhal",
						"creatorType": "author"
					},
					{
						"firstName": "Del",
						"lastName": "Byrne",
						"creatorType": "contributor"
					}
				],
				"date": "1973",
				"ISBN": "9780600393047",
				"callNumber": "9B6655",
				"language": "eng",
				"libraryCatalog": "Primo",
				"numPages": "252",
				"publisher": "Hamlyn",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://virtuose.uqam.ca/primo_library/libweb/action/dlDisplay.do?vid=UQAM&docId=UQAM_BIB000969205&fn=permalink",
		"items": [
			{
				"itemType": "book",
				"title": "War",
				"creators": [
					{
						"firstName": "Ken",
						"lastName": "Baynes",
						"creatorType": "author"
					},
					{
						"lastName": "Welsh Arts Council",
						"creatorType": "contributor",
						"fieldMode": 1
					},
					{
						"lastName": "Glynn Vivian Art Gallery",
						"creatorType": "contributor",
						"fieldMode": 1
					}
				],
				"date": "1970",
				"callNumber": "NX650G8B38",
				"language": "eng",
				"libraryCatalog": "virtuose.uqam.ca",
				"place": "Boston",
				"publisher": "Boston Book and Art Chop",
				"series": "Art and society 1",
				"attachments": [],
				"tags": [
					"ART",
					"GUERRE",
					"WAR"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://primo-prod.u-paris10.fr/primo_library/libweb/action/dlDisplay.do?vid=UPON&search_scope=default_scope&docId=SCD_ALEPH000546633&fn=permalink",
		"items": [
			{
				"itemType": "thesis",
				"title": "Les espaces publics au prisme de l'art à Johannesburg (Afrique du Sud) : quand la ville fait œuvre d'art et l'art œuvre de ville",
				"creators": [
					{
						"firstName": "Pauline",
						"lastName": "Guinard",
						"creatorType": "author"
					},
					{
						"firstName": "Philippe )",
						"lastName": "Gervais-Lambony",
						"creatorType": "contributor"
					},
					{
						"lastName": "Université Paris Ouest Nanterre La Défense",
						"creatorType": "contributor",
						"fieldMode": 1
					},
					{
						"firstName": "cultures et sociétés du passé et du présent Nanterre",
						"lastName": "Ecole doctorale Milieux",
						"creatorType": "contributor"
					}
				],
				"date": "2012",
				"abstractNote": "Thèse de doctorat, Cette thèse porte sur les espaces publics à Johannesburg, capitale économique de l’Afrique du Sud. Dans le contexte contemporain, l’utilisation de la notion occidentale d’espaces publics pose problème : d’une part, du fait des ségrégations passées qui ont eu tendance à faire de ces espaces des lieux de séparation et de mise à distance des différents publics ; et d’autre part, du fait des forts taux de violence et du fort sentiment d’insécurité, qui tendent à encourager la sécurisation et la privatisation de ces mêmes espaces. L’enjeu est alors de comprendre les éventuels processus de construction de la publicité (au sens de caractère public) de ces espaces, à la fois sur le plan juridique, social et politique. Pour ce faire, l’art qui se déploie dans les espaces juridiquement publics de la métropole depuis la fin de l’apartheid, est utilisé comme une clef de lecture privilégiée de ces phénomènes, en tant qu’il permettrait, ainsi que nous entendons le montrer, de créer des espaces de rencontre et de débats ou, à l’inverse, de mieux réguler et contrôler ces espaces. Selon une approche qualitative, notre étude se base à la fois sur des observations de terrain et sur des entretiens conduits auprès des producteurs mais aussi des récepteurs de cet art qui a lieu dans les espaces publics. A la croisée de la géographie urbaine et de la géographie culturelle, nous envisageons donc de réexaminer la notion d’espaces publics au prisme de l’art à Johannesburg en vue de saisir – entre tentative de normalisation et résistance à cette normalisation – quelle ville est aujourd’hui à l’œuvre non seulement à Johannesburg, mais aussi, à travers elle, dans d’autres villes du monde., This Ph.D. thesis deals with public spaces in Johannesburg, the economic capital of South Africa. In the current context, the issues raised by the use of the western notion of public spaces are explored. On one hand, the previous segregations tended to mark off spaces into different publics completely separated from each other. On the other hand, the high rates of violence and sense of insecurity enhance securitization and privatization of these same spaces. What is at stake is to understand how the publicness of these spaces can be legally, socially, and politically built. In that framework, art spread in legally public spaces of Johannesburg since the end of apartheid is used as a tool to understand and reveal these phenomena since it is presented, as we aim at demonstrating, as a mean to create spaces of encounter and debate or, conversely, to regulate and control better these spaces. In a qualitative approach, our study is based on field observations and interviews with both producers and receivers of this art which takes place in public spaces. At the crossroads of urban geography and cultural geography, we are therefore re-examining the concept of public spaces through the prism of art in Johannesburg to figure out – between normalization and resistance to this normalization – which city is today at work not only in Johannesburg, but also, through her, in other cities of the world.",
				"language": "fre",
				"libraryCatalog": "Primo",
				"place": "Sl",
				"shortTitle": "Les espaces publics au prisme de l'art à Johannesburg (Afrique du Sud)",
				"university": "sn",
				"attachments": [],
				"tags": [
					"Art",
					"Art urbain -- Thèses et écrits académiques -- Afrique du Sud -- Johannesburg (Afrique du Sud)",
					"Espaces publics -- Normalisation -- Thèses et écrits académiques",
					"Espaces publics -- Thèses et écrits académiques -- Afrique du Sud -- Johannesburg (Afrique du Sud)",
					"Géographie culturelle -- Thèses et écrits académiques",
					"Géographie urbaine -- Thèses et écrits académiques",
					"Johannesburg",
					"Johannesburg (Afrique du Sud) -- Thèses et écrits académiques -- Afrique du Sud",
					"Normalisation",
					"Prisme",
					"Publicisation"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://hollis.harvard.edu/primo_library/libweb/action/dlDisplay.do?vid=HVD&search_scope=default_scope&docId=HVD_ALEPH002208563&fn=permalink",
		"items": [
			{
				"itemType": "book",
				"title": "Mastering the art of French cooking",
				"creators": [
					{
						"firstName": "Simone",
						"lastName": "Beck",
						"creatorType": "author"
					},
					{
						"firstName": "Louisette",
						"lastName": "Bertholle",
						"creatorType": "contributor"
					},
					{
						"firstName": "Julia",
						"lastName": "Child",
						"creatorType": "contributor"
					},
					{
						"firstName": "Barbara Ketcham",
						"lastName": "Wheaton",
						"creatorType": "contributor"
					},
					{
						"firstName": "Avis",
						"lastName": "DeVoto",
						"creatorType": "contributor"
					}
				],
				"date": "1961",
				"abstractNote": "Illustrates the ways in which classic French dishes may be created with American foodstuffs and appliances.",
				"callNumber": "641.64 C53m, c.1, 641.64 C53m, c. 3, 641.64 C53m, c.4, 641.64 C53m, c.5, 641.64 C53m, c.6, 641.64 C53m, c. 7, 641.64 C53m, c. 8, 641.64 C53m, c.2",
				"edition": "[1st ed.]",
				"extra": "HOLLIS number: 002208563",
				"language": "eng",
				"libraryCatalog": "hollis.harvard.edu",
				"place": "New York",
				"publisher": "Knopf",
				"attachments": [
					{
						"title": "HOLLIS Permalink",
						"snapshot": false
					}
				],
				"tags": [
					"Authors' inscriptions (Provenance)",
					"Cookery, French",
					"Cooking, French.",
					"French cooking"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://digitale.beic.it/primo_library/libweb/action/display.do?doc=39bei_digitool2018516",
		"items": [
			{
				"itemType": "book",
				"title": "Grida per i Milanesi che avevano seguito Ludovico il Moro",
				"creators": [
					{
						"lastName": "Milano",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "1500",
				"language": "ita",
				"libraryCatalog": "digitale.beic.it",
				"place": "Milano",
				"publisher": "Ambrogio : da Caponago",
				"attachments": [],
				"tags": [
					"LEGGI;ITALIA - STORIA MEDIOEVALE"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
