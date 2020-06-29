{
	"translatorID": "e5e34825-1314-43bd-a9fe-f38f6ab48403",
	"label": "Jahrbuch",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://www\\.emis\\.de/cgi-bin/jfmen/MATH/JFM/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2017-11-04 10:50:28"
}

function detectWeb(doc, url) {
	if (getID(url)) return 'journalArticle';	//could be book, but it's hard to tell

	if (url.indexOf('/cgi-bin/') != -1 &&
		(url.indexOf('/quick.html') != -1 ||
			url.indexOf('/full.html') != -1 ||
			url.indexOf('/command.html') != -1) &&
		getSearchResults(doc).length) {
		return 'multiple';
	}
}

function getSearchResults(doc) {
	return ZU.xpath(doc, '//input[@type="CHECKBOX" and @name="an" and following-sibling::*[1][name()="A"]]');
}

function getID(url) {
	var id = url.match(/[?&]an=(JFM[^&]+)/i);
	return id ? id[1] : false;
}

function doWeb(doc, url) {
	var id = getID(url);
	if (!id) {
		var res = getSearchResults(doc);
		var items = {};
		for (var i=0, n=res.length; i<n; i++) {
			var title = doc.evaluate('./following-sibling::b[not(./a)]', res[i], null, XPathResult.ANY_TYPE, null).iterateNext();
			items[encodeURIComponent(res[i].value)] = title.textContent;

		}

		Z.selectItems(items, function(selectedItems) {
			if (!selectedItems) return true;

			var ids = [];
			for (var i in selectedItems) {
				ids.push(i);
			}
			scrape(ids);
		})
	} else {
		scrape([id]);
	}
}

function scrape(ids) {
	var url = '/cgi-bin/jfmen/JFM/en/quick.html?type=bibtex&format=complete' +
				'&an_op=or&an=' + ids.join('&an=');
	ZU.doGet(url, function(text) {
		var bibtex = text.match(/<pre>([\s\S]+?)<\/pre>/i);
		if (!bibtex) throw new Error("Could not find BibTeX");

		//load BibTeX translator
		var translator = Zotero.loadTranslator('import');
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(bibtex[1]);
		translator.setHandler('itemDone', function(obj, item) {
			//volume, issue, and pages end up in the publicationTitle
			if (item.publicationTitle) {
				var vip = item.publicationTitle.match(/,?\s*(?:\((\d+)\)\s*)?(\d+)\s*,\s*(\d+(?:-\d+))/);
				if (vip) {
					item.publicationTitle = item.publicationTitle.substring(0,
												item.publicationTitle.indexOf(vip[0]));
					var ptLoc = item.publicationTitle.split(/\s*,\s*/);
					item.publicationTitle = ptLoc[0];
					if (ptLoc.length > 1) item.place = ptLoc[1];

					item.journalAbbreviation = item.publicationTitle;

					item.volume = vip[1];
					item.issue = vip[2];
					item.pages = vip[3];
				}
			}

			var callNumber = ids.shift();	//hopefully the records come back in the order they are requested
			item.attachments.push({
				title: 'Link to Jahrbuch Record',
				url: 'http://jfm.sub.uni-goettingen.de/cgi-bin/jfmen/JFM/en/' +
						'quick.html?type=html&format=complete&an=' + callNumber,
				mimeType: 'text/html',
				snapshot: false
			});
			item.callNumber = decodeURIComponent(callNumber);

			item.complete();
		});
		translator.translate();
	}, null, 'windows-1252');
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.emis.de/cgi-bin/jfmen/MATH/JFM/en/quick.html?first=1&maxdocs=20&type=html&an=JFM%2068.0003.01&format=complete",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "R. S.",
						"lastName": "Williamson",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Link to Jahrbuch Record",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"itemID": "JFM68.0003.01",
				"title": "The Saqqara graph: its geometrical and architectural significance.",
				"language": "English",
				"publicationTitle": "Nature",
				"date": "1942",
				"abstractNote": "Im Jahre 1925 wurde an der Stufenpyramide des Zoser in Sakkara bei Kairo eine Kalksteinscherbe gefunden von der Grösse 15 zu 17,5 zu 5 cm. Auf ihr war auf einer Seite eine Figur aufgezeichnet, welche man sich als Hälfte eines durch eine Sehne abgeschnittenen Kreisbogens $&lt; 180^\\circ$ denken kann. Die Sehne ist aber nicht vorhanden, wohl die Pfeilhöhe des Bogens; ferner sind parallel zur Pfeilhöhe von dem Bogen aus noch vier Geraden gezeichnet, welche die Sehne, wenn sie vorhanden wäre, in fünf gleiche Teile zerlegen würden. Die Geraden sind auch nicht vollständig durchgezeichnet. Zwischen ihnen stehen Zahlen, welche als die Längen ausgelegt werden, welche die Geraden einschliesslich Pfeilhöhe bis zur Sehne haben würden. ıt Gunn\\/ (An architect's diagram of the third dynasty, Ann. Service Antiquités Égypte, Cairo, 25 (1925), 197 ff.) legt das Ganze aus als Entwurf eines ägyptischen Architekten zur Konstruktion eines Grabgewölbes, und diese Auslegung dürfte richtig sein, da die Scherbe ganz nahe bei einem derartigen Gewölbe gefunden wurde. Verf. knüpft an die Auslegung von Gunn an, möchte aber daraus und aus den vorgefundenen Massen eine allgemeine Methode zur Konstruktion und Berechnung derartiger Bogen entwickeln, und – das ist für uns das Wichtige –, glaubt, feststellen zu können, dass die ägyptischen Architekten dabei das pythagoreische Dreieck 3, 4, 5 (bzw. 147, 196, 245) verwandten. Dieses wäre also im 5. Jahrtausend vor Chr. schon in Ägypten bekannt gewesen. Die Entwicklung enthält manche “wenn”, aber sie hat auch deshalb etwas sehr Verlockendes, weil bei einem so hohen Alter dieses pythagoreischen Dreiecks in Ägypten, wo es ja nach Plutarch in mystischer Beziehung zum männlichen bzw. weiblichen Prinzip und zur Geburt gestanden haben soll, vielleicht auch erklärt werden könnte, wie die Kenntnis des mystischen Zahlentripels 3, 4, 5 eine so weite Verbreitung in Afrika finden konnte, worauf ich wiederholt in der Scientia, Bologna, 49 (1931), 423-436 (F. d. M. 57, 4 (JFM57.0004.*)), im Archaion, Roma, 14 (1932), 207-220 (F. d. M. 58, 7 (JFM58.0007.*)) sowie in der Münchener med. Wochenschr. 1937, 5 ff. und in der Dermatolog. Z., Basel, 1938, 260 ff., hinwies. Entweder verbreitete sich die Kenntnis des Zahlentripels ohne das Dreieck von Ägypten aus allmählich bis in den Westsudan und nach Uganda, oder aber, umgekehrt, aus einer all diesen Völkern mit den Ägyptern gemeinsamen Unterschicht entstand das mystische Zahlentripel 3, 4, 5, welches sich dann in Ägypten weiter zu dem Dreieck entwickelte, und es wäre damit eine Wurzel des “Pythagoras” gefunden.",
				"journalAbbreviation": "Nature",
				"issue": "150",
				"pages": "460-461",
				"callNumber": "JFM 68.0003.01",
				"libraryCatalog": "Jahrbuch",
				"shortTitle": "The Saqqara graph"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.emis.de/cgi-bin/jfmen/MATH/JFM/en/quick.html?first=1&maxdocs=20&type=html&an=JFM%2068.0052.03&format=complete",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "N.",
						"lastName": "Svartholm",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Link to Jahrbuch Record",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"itemID": "JFM68.0052.03",
				"title": "On the algebras of relativistic quantum theories.",
				"language": "English",
				"publicationTitle": "Fysiograf. Sällsk. Lund Förhdl. 12, Nr. 9, 15 S",
				"date": "1942",
				"callNumber": "JFM 68.0052.03",
				"libraryCatalog": "Jahrbuch"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.emis.de/cgi-bin/jfmen/MATH/JFM/en/quick.html?first=1&maxdocs=20&type=html&an=JFM%2068.0078.01&format=complete",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "P.",
						"lastName": "Erdös",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Link to Jahrbuch Record",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"itemID": "JFM68.0078.01",
				"title": "On the asymptotic density of the sum of two sequences.",
				"language": "English",
				"publicationTitle": "Ann. Math., Princeton,",
				"date": "1942",
				"abstractNote": "Es mögen $\\frak A$, $\\frak B$ Mengen nichtnegativer ganzer Zahlen bedeuten, $\\frak C=\\frak A+\\frak B$ ihre Summe, $A(n)$, $B(n)$, $C(n)$ die Anzahlen ihrer positiven Elemente $\\leqq n$, ferner α, β, γ die Dichten von $\\frak A$, $\\frak B$ und $\\frak C$, $\\alpha^*$, $\\beta^*$, $\\gamma^*$ ihre asymptotischen Dichten und $\\beta_B$ die Besicovitch-Dichte: $\\beta_B=\\underline\\textf\\/in\\, \\dfracB(n)n+1$, $n = 1, 2, \\ldots$. Dann gilt nach Besicovitch $\\gamma\\geqq\\alpha+\\beta_B$, wenn $0ın\\frak B$ und $1ın\\frak A$ ist. Verf. modifiziert $\\beta_B$ zu $\\beta_1=\\underline\\textf\\/in\\, \\dfracB(n)n+1$, $n = k + 1, k + 2,\\ldots$, wobei ${1, 2,\\ldots, k}\\subseteqq\\frak B$ ist, und zeigt unter wörtlicher Übertragung des Besicovitchschen Beweises: $\\gamma\\geqq\\alpha+\\beta_1$ unter denselben Voraussetzungen. Dieses Resultat wird zum Beweis des folgenden Satzes mitverwendet: ıt Wenn\\/ ${0,1}\\subseteqq\\frak B$, $\\alpha^*+\\beta^*\\leqq 1$, $\\beta^*\\leqq\\alpha^*$ (nach Ansicht des Ref. wird von Verf. nur $\\dfrac\\beta^*2&lt;\\alpha^*$ benutzt) ıt ist, so gilt stets\\/ $\\gamma^* \\geqq\\alpha^*+\\dfrac12\\beta^*$, was von Verf. in einer früheren Arbeit nur für den Spezialfall $\\frak A=\\frak B$ bewiesen worden war. Zum Beweis wird gezeigt, dass schon eine der beiden Mengen ${\\ldots, a_i, a_i+1,\\ldots}$, oder ${\\ldots, a_i+b_k,\\ldots}$, $a_i\\ne 0$, $b_k\\ne 0$ eine asymptotische Dichte $\\geqq\\alpha^*+\\frac12\\beta^*$ besitzt. Vgl. hierzu eine demnächst im J. reine angew. Math. von Ref. erscheinende Arbeit “Zur Theorie der Dichten”.",
				"callNumber": "JFM 68.0078.01",
				"libraryCatalog": "Jahrbuch"
			}
		]
	}
]
/** END TEST CASES **/
