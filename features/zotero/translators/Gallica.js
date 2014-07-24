{
	"translatorID": "58ab2618-4a25-4b9b-83a7-80cd0259f896",
	"label": "Gallica",
	"creator": "Sylvain Machefert",
	"target": "^https?://gallica\\.bnf\\.fr",
	"minVersion": "1.0.0b3.r1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2014-04-04 10:09:18"
}

function detectWeb(doc, url) {
	var indexSearch = url.toString().indexOf('http://gallica.bnf.fr/Search');
	var indexArk = url.toString().indexOf('http://gallica.bnf.fr/ark:');
	var indexSNE = url.toString().indexOf('http://gallica.bnf.fr/VisuSNE');
	
	if (indexSearch == 0)
	{
		var errorXpath = '//div[@class="errorMessage"]';
		if  (elt = doc.evaluate(errorXpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			// We are on a search page result but it can be an empty result page.
			// Nothing to return;
		}
		else
		{
			return "multiple";
		}
	}
	else if (indexArk == 0)
	{
		var iconxpath = '//div[@class="contenu1"]/img';
		if (elt = doc.evaluate(iconxpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext())
		{
			var icon = elt.getAttribute('src');
			return getDoctypeGallica(icon);
		}
		
		// For some biblio, the icon picture is located in another div ...
		var iconxpath = '//div[@class="titrePeriodiqueGauche"]/img';
		if  (elt = doc.evaluate(iconxpath, doc, null,
		XPathResult.ANY_TYPE, null).iterateNext())
		{
			var icon = elt.getAttribute('src');
			return getDoctypeGallica(icon);
		}
	}
	else if (indexSNE == 0)
	{
		return "book";
	}
}

// This function takes the name of the icon, and returns the Zotero item name
function getDoctypeGallica(img)
{
	var iconname = img.substring(img.lastIndexOf('/') + 1);
	
	if (iconname =='livre_a.png') 
	{
		return "book";
	}
	else if (iconname == 'carte.png')
	{
		return "map";
	}
	else if (iconname == 'images.png')
	{
		return "artwork";
	}
	else if (iconname == 'docsonore.png')
	{
		return "audioRecording";
	}
	else if (iconname == 'musiquenotee.png')
	{
		// This icon is for Sheet music type. But no Zotero type matches
		// as of today (2010-02)
		return "book";
	}
	else if ( (iconname == 'picto_type_document1.png') || (iconname == 'perio_vol_ocr.png') )
	{
		return "book";
	}
	else
	{
		Zotero.debug("Undefined icon : " + iconname);
		return "book";
	}
	
}

function doWeb(doc, url) {
		if (detectWeb(doc, url) == "multiple") 
		{
			var availableItems = {};
			var xpath = '//div[@class="resultats_line"]';
			
			var elmts = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
			var elmt = elmts.iterateNext();
			
			var itemsId = new Array();
			
			var i = 1;
			do {
				var id = doc.evaluate('.//div[@class="resultat_id"]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
				var this_result = doc.evaluate('div[@class="resultat_desc"]/div[@class="titre"]/a', elmt, null, XPathResult.ANY_TYPE, null).iterateNext();
				availableItems[i] = Zotero.Utilities.cleanTags(this_result.getAttribute('title'));
				
				i++;
			} while (elmt = elmts.iterateNext());

			Z.selectItems(availableItems, function(items) {
				for (var i in items) {
					// All informations are available on search result page. We don't need to query 
					// every subpage with scrape. We'are going to call the special Gallica scrape function
					// This function (scrapeGallica) is reused in scrape.
					var fullpath = '//div[@class="resultats_line"][' + i + ']';
					
					var item_element = doc.evaluate(fullpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
					if (item_element != undefined)
					{
						var detail = doc.evaluate('.//div[@class="notice"]', item_element, null, XPathResult.ANY_TYPE, null).iterateNext();
		
						var iconType = doc.evaluate('.//span[@class="picto"]/img', item_element, null, XPathResult.ANY_TYPE, null).iterateNext();
						var docType = getDoctypeGallica(iconType.getAttribute('src'));
						
						var docUrl = doc.evaluate('.//div[@class="liens"]/a', item_element, null, XPathResult.ANY_TYPE, null).iterateNext();
						docUrl = docUrl.getAttribute("href");
						
						scrapeGallica(doc,  detail, docType, docUrl);
					}
				}
			})	
		}
		else
		{
			var docType = detectWeb(doc, url);
			var xpath = '//div[@class="notice"]';
			var detail = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
			scrapeGallica(doc,  detail, docType, "");
		}
}

function scrapeGallica(doc, div, type, direct_url)
{
	var item = new Zotero.Item;
	item.itemType = type;
	
	var elmts = doc.evaluate('p', div, null, XPathResult.ANY_TYPE, null);
	
	var elmt = elmts.iterateNext();

	do {
		var text = Zotero.Utilities.trimInternal(elmt.textContent);
		var contenu = '';
		if (contenu = text.split(/^(Titre|Title|Título) : /)[2])
		{
			item.title = Zotero.Utilities.trimInternal(contenu);
		}
		else if ( contenu = text.split(/^(Auteur|Author|Autor) : /)[2])
		{
			contenu = contenu.replace(/(See only the results matching this author|Ne voir que les résultats de cet auteur)/, '').replace(/\(.+?\)/, "");
			if (type == 'artwork')
			{
				 item.creators.push(Zotero.Utilities.cleanAuthor(contenu, "artist", true));	
			}
			else
			{
				item.creators.push(Zotero.Utilities.cleanAuthor(contenu, "author", true));	
			}
		}
		else if ( contenu = text.split(/^(Publisher|Éditeur|Editor) : /)[2])
		{
			item.publisher = Zotero.Utilities.trimInternal(contenu);
		}
		else if ( contenu = text.split(/^(Date of publication|Date d'édition|Data de publicação|Fecha de publicación) : /)[2])
		{
			item.date = Zotero.Utilities.trimInternal(contenu);
		}
		else if ( contenu = text.split(/^(Contributeur|Contributor|Contribuidor) : /)[2])
		{
			item.creators.push(Zotero.Utilities.cleanAuthor(contenu, "contributor", true));
		}
		else if ( contenu = text.split(/^(Language|Langue|Língua|Idioma) : /)[2])
		{
			item.language = Zotero.Utilities.trimInternal(contenu);
		}
		else if ( contenu = text.split(/^(Format|Formato) : /)[2])
		{
			// This field contains : application/pdf for example.
		}
		else if ( contenu = text.split(/^(Copyright|Droits|Direitos) : /)[2])
		{
			item.rights = Zotero.Utilities.trimInternal(contenu);
		}
		else if (contenu = text.split(/^(Identifier|Identifiant|Senha) : /)[2])
		{
			var temp = '';
			if (temp = contenu.split(/^ISSN /)[1])
			{
				item.ISSN = temp;	
			}
			else if (contenu.match(/^https?:\/\//))
			{
				// If identifier starts with http it is the url of the document
				item.url = contenu;
			}
			else if (contenu.match(/^ark:/))
			{
				item.url = "http://gallica.bnf.fr/" + contenu;
			}
		}
		else if (contenu = text.split(/^(Description|Descrição) : /)[2])
		{
			var temp = '';
			if (temp = contenu.split(/^Variante\(s\) de titre : /)[1])
			{
		// Alternative title : no field in zotero ? 
		//		Zotero.debug("Titre : " + temp);
			}
			else if (temp = contenu.split(/^Collection : /)[1])
			{
				item.collection = temp;
			}
			else
			{
//				Zotero.debug(contenu);
			}
		}
		else if (contenu = text.split(/^(Sujet|Assunto|Tema|Subject) : /)[2])
		{
			
			var tagList = contenu.split(/; ?/);
			for (var tag in tagList) 
			{
				item.tags.push(Zotero.Utilities.trimInternal(tagList[tag]));
			}
		}

	} while (elmt = elmts.iterateNext());
	
	if ( (item.url == "") || (item.url == undefined) )
	{
		if (direct_url != "")
		{
			item.url = "http://gallica.bnf.fr" + direct_url;
		}
		else
		{
			item.url = doc.location.href; 
		}
	}
	item.complete();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://gallica.bnf.fr/ark:/12148/bpt6k58121413.r=cervantes.langEN",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Édouard",
						"lastName": "Cat",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Cervantes Saavedra, Miguel de (1547-1616)"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "Miguel Cervantès / par É. Cat,...",
				"publisher": "Gedalge (Paris)",
				"date": "1892",
				"language": "Français",
				"rights": "domaine public",
				"url": "http://gallica.bnf.fr/ark:/12148/bpt6k58121413",
				"libraryCatalog": "Gallica",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://gallica.bnf.fr/Search?ArianeWireIndex=index&p=1&lang=EN&q=cervantes",
		"items": "multiple"
	}
]
/** END TEST CASES **/