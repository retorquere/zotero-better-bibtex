{
	"translatorID": "ec491fc2-10b1-11e3-99d7-1bd4dc830245",
	"label": "Safari Books Online",
	"creator": "Jeffrey Jones",
	"target": "^https?://([^/]+\\.)?safaribooksonline\\.[a-zA-Z]+/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 150,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-24 09:40:05"
}

/*
   Safari Books Translator
   Copyright (C) 2014 ProQuest LLC
   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function detectWeb(doc, url) {
	if (ZU.xpathText(doc,"//div[@id='lefttoc']//a[@class='current']")) {
		return "bookSection";
	}
	else if (url.indexOf("/book/") > -1 || /\/[0-9]{10}/.test(url)) {
		return "book";
	}
	else if (getSearchResults(doc,true)) {
		return "multiple";
	}
}

function doWeb(doc, url) {
	var type = detectWeb(doc, url)
	if (type == "book" || type == "bookSection") {
		importBook(doc, url);
	}
	else if (type == "multiple"){
		var results = getSearchResults(doc);
		Zotero.selectItems(results, function (ids) {
			if (!ids) return true;
			
			var toProcess = [];
			for (var id in ids){
				toProcess.push(id);
			}
			ZU.processDocuments(toProcess, importBook);
		});
	}
}

function getSearchResults(doc,quick) {
	var titles = doc.getElementsByClassName('bookTitle'),
		items = {},
		found = false;
		
	if (quick) return titles.length;
	
	for (var i = 0; i < titles.length; i++) {
		var title = ZU.xpathText(titles[i],"./a/@title");
		var link = ZU.xpath(titles[i],"./a")[0].href;
		items[link] = title;
		found = true;
	}
	return found ? items : false;
}

function importBook(doc, url,section) {
	//if we're not on the book page itself but some sub-page (likely a reader page)
	//then we try and process the book root page, it has more data
	//parts 1 and 2 are the full url up to and including the book id
	var parts = url.match(/(.+\/[0-9]{10,13})\/?(.*)/);
	if (parts && parts[2]) {
		//a sub-page would likely be a book section, so let's check and save it as such
		var nav = doc.getElementById("lefttoc");
		var sectionTitle = nav ? ZU.xpathText(nav,".//a[@class='current']") : false;
		var prefixes = /^(?:(?:Part|Chapter|Pt|Ch)\.? )?(?:[0-9]{1,3}\.?[0-9]{0,3}|(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3}))\b[.: ]+/;
		
		if (sectionTitle) sectionTitle = sectionTitle.replace(prefixes,"");
		
		ZU.processDocuments([parts[1]], function(newDoc,newUrl){
			var section = sectionTitle ? 
				{"sectionTitle":sectionTitle,"originalUrl":url}
				: false;
			importBook(newDoc,newUrl,section);
		});
		return;
	}
	var mapping = {
		name: "title",
		inLanguage: "language",
		publisher: "publisher",
		datePublished: "date",
		bookEdition: "edition",
		isbn: "ISBN",
		numberOfPages: "numPages",
		description: "abstractNote"
	};
	var item = new Z.Item(section ? "bookSection" : "book"),
		props = ZU.xpath(doc, '//*[@itemprop]'),
		isbn = {};
		
	for (var i = 0; i < props.length; i++) {
		var name = mapping[props[i].attributes["itemprop"].value];
		
		if (name) item[name] = ZU.trimInternal(props[i].textContent);
		
		if (name == "edition" 
			&& (item.edition.toLowerCase() == "first" || item.edition == "1")) {
			delete item.edition;
		}
		
		if (name == "ISBN") {
			var label = props[i].previousSibling
			if (label) isbn[label.textContent] = item[name];
		}
	}
	//many isbn, prefer web over print, and 13 over 10
	item.ISBN = isbn["Web ISBN-13"]
		|| isbn["Web ISBN-10"]
		|| isbn["Print ISBN-13"]
		|| isbn["Print ISBN-10"]
		|| item.ISBN; // in case there's no ISBN with props[i].previousSibling above
				
	//author is poorly defined, have to search for it by text
	var dataItems = ZU.xpath(doc, '//ul[@class="metadatalist"]//p[contains(@class,"data")]');
	for (var i = 0; i < dataItems.length; i++) {
		var field = dataItems[i].textContent,
			label = ZU.trimInternal(field.substr(0, field.indexOf(":"))).toLowerCase(),
			value = ZU.trimInternal(field.substr(field.indexOf(":") + 1));

		if (label == "by") {
			var authors = value.split(";")
			for (var j = 0; j < authors.length; j++) {
				if (authors[j]) item.creators.push(ZU.cleanAuthor(authors[j], 'author'));
			}
			break;
		}
	}
	var itemUrl = section ? section.originalUrl : url;
	item.url = itemUrl.replace(/[?#].*/, '');
	if (section) {
		item.bookTitle = item.title;
		item.title = section.sectionTitle;
	}
	item.complete();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://proquestcombo.safaribooksonline.com/search?q=the%20good%20parts#X2ludGVybmFsX3NlYXJjaHJlc3VsdHM/c2VhcmNobmV3d29yZD0mc2VhcmNocmVzdWx0c2xpc3Rib3g9JnNyY2ZpbHRlcnM9NyZzb3J0PXJhbmsmb3JkZXI9ZGVzYyZzcmN1c2VycXVlcnk9KHRoZStnb29kK3BhcnRzKQ==",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://proquestcombo.safaribooksonline.com/category/desktop-and-web-applications/entertainment-and-gaming",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://proquest.techbus.safaribooksonline.de/book/programming/java/9780133922745/chapter-1dot-introduction/ch01lev1sec2_html?query=((the+java+virtual+machine))#snippet",
		"items": [
			{
				"itemType": "bookSection",
				"title": "The Java Virtual Machine",
				"creators": [
					{
						"firstName": "Tim",
						"lastName": "Lindholm",
						"creatorType": "author"
					},
					{
						"firstName": "Frank",
						"lastName": "Yellin",
						"creatorType": "author"
					},
					{
						"firstName": "Gilad",
						"lastName": "Bracha",
						"creatorType": "author"
					},
					{
						"firstName": "Alex",
						"lastName": "Buckley",
						"creatorType": "author"
					}
				],
				"date": "May 7, 2014",
				"ISBN": "9780133905908",
				"abstractNote": "Written by the inventors of the technology, The Java® Virtual Machine Specification, Java SE 8 Edition is the definitive technical reference for the Java Virtual Machine.The book provides complete, accurate, and detailed coverage of the Java Virtual Machine. It fully describes the new features added in Java SE 8, including the invocation of default methods and the class file extensions for type annotations and method parameters. The book also clarifies the interpretation of class file attributes and the rules of bytecode verification.",
				"bookTitle": "The Java® Virtual Machine Specification, Java SE 8 Edition",
				"language": "en",
				"libraryCatalog": "Safari Books Online",
				"publisher": "Addison-Wesley Professional",
				"url": "http://proquest.techbus.safaribooksonline.de/book/programming/java/9780133922745/chapter-1dot-introduction/ch01lev1sec2_html",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://proquest.techbus.safaribooksonline.de/book/programming/java/9780133922745",
		"items": [
			{
				"itemType": "book",
				"title": "The Java® Virtual Machine Specification, Java SE 8 Edition",
				"creators": [
					{
						"firstName": "Tim",
						"lastName": "Lindholm",
						"creatorType": "author"
					},
					{
						"firstName": "Frank",
						"lastName": "Yellin",
						"creatorType": "author"
					},
					{
						"firstName": "Gilad",
						"lastName": "Bracha",
						"creatorType": "author"
					},
					{
						"firstName": "Alex",
						"lastName": "Buckley",
						"creatorType": "author"
					}
				],
				"date": "May 7, 2014",
				"ISBN": "9780133905908",
				"abstractNote": "Written by the inventors of the technology, The Java® Virtual Machine Specification, Java SE 8 Edition is the definitive technical reference for the Java Virtual Machine.The book provides complete, accurate, and detailed coverage of the Java Virtual Machine. It fully describes the new features added in Java SE 8, including the invocation of default methods and the class file extensions for type annotations and method parameters. The book also clarifies the interpretation of class file attributes and the rules of bytecode verification.",
				"language": "en",
				"libraryCatalog": "Safari Books Online",
				"numPages": "600",
				"publisher": "Addison-Wesley Professional",
				"url": "http://proquest.techbus.safaribooksonline.de/book/programming/java/9780133922745",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://proquestcombo.safaribooksonline.com/book/software-engineering-and-development/9780596510046/31dot-emacspeak-the-complete-audio-desktop/emacspeak_the_complete_audio_desktop?query=((code+complete))#snippet",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Emacspeak: The Complete Audio Desktop",
				"creators": [
					{
						"firstName": "Andy",
						"lastName": "Oram",
						"creatorType": "author"
					},
					{
						"firstName": "Greg",
						"lastName": "Wilson",
						"creatorType": "author"
					}
				],
				"date": "June 26, 2007",
				"ISBN": "9780596510046",
				"abstractNote": "How do the experts solve difficult problems in software development? In this unique and insightful book, leading computer scientists offer case studies that reveal how they found unusual, carefully designed solutions to high-profile projects. You will be able to look over the shoulder of major coding and design experts to see problems through their eyes. This is not simply another design patterns book, or another software engineering treatise on the right and wrong way to do things. The authors think aloud as they work through their project's architecture, the tradeoffs made in its construction, and when it was important to break rules. This book contains 33 chapters contributed by Brian Kernighan, Karl Fogel, Jon Bentley, Tim Bray, Elliotte Rusty Harold, Michael Feathers, Alberto Savoia, Charles Petzold, Douglas Crockford, Henry S. Warren, Jr., Ashish Gulhati, Lincoln Stein, Jim Kent, Jack Dongarra and Piotr Luszczek, Adam Kolawa, Greg Kroah-Hartman, Diomidis Spinellis, Andrew Kuchling, Travis E. Oliphant, Ronald Mak, Rogerio Atem de Carvalho and Rafael Monnerat, Bryan Cantrill, Jeff Dean and Sanjay Ghemawat, Simon Peyton Jones, Kent Dybvig, William Otte and Douglas C. Schmidt, Andrew Patzer, Andreas Zeller, Yukihiro Matsumoto, Arun Mehta, TV Raman, Laura Wingerd and Christopher Seiwald, and Brian Hayes. Beautiful Code is an opportunity for master coders to tell their story. All author royalties will be donated to Amnesty International.",
				"bookTitle": "Beautiful Code",
				"language": "en",
				"libraryCatalog": "Safari Books Online",
				"publisher": "O'Reilly Media, Inc.",
				"shortTitle": "Emacspeak",
				"url": "http://proquestcombo.safaribooksonline.com/book/software-engineering-and-development/9780596510046/31dot-emacspeak-the-complete-audio-desktop/emacspeak_the_complete_audio_desktop",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://proquestcombo.safaribooksonline.com/book/databases/microsoft-sql-server-2012/9781118282175/part-i-laying-the-foundations/9781118282175p01_xhtml?query=((Part+I.+Laying+the+Foundation))#snippet",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Laying the Foundations",
				"creators": [
					{
						"firstName": "Adam",
						"lastName": "Jorgensen",
						"creatorType": "author"
					},
					{
						"firstName": "Jorge",
						"lastName": "Segarra",
						"creatorType": "author"
					},
					{
						"firstName": "Patrick",
						"lastName": "LeBlanc",
						"creatorType": "author"
					},
					{
						"firstName": "Jose",
						"lastName": "Chinchilla",
						"creatorType": "author"
					},
					{
						"firstName": "Aaron",
						"lastName": "Nelson",
						"creatorType": "author"
					}
				],
				"date": "August 28, 2012",
				"ISBN": "9781118282175",
				"abstractNote": "Harness the powerful new SQL Server 2012 Microsoft SQL Server 2012 is the most significant update to this product since 2005, and it may change how database administrators and developers perform many aspects of their jobs. If you're a database administrator or developer, Microsoft SQL Server 2012 Bible teaches you everything you need to take full advantage of this major release. This detailed guide not only covers all the new features of SQL Server 2012, it also shows you step by step how to develop top-notch SQL Server databases and new data connections and keep your databases performing at peak. The book is crammed with specific examples, sample code, and a host of tips, workarounds, and best practices. In addition, downloadable code is available from the book's companion web site, which you can use to jumpstart your own projects. Serves as an authoritative guide to Microsoft's SQL Server 2012 for database administrators and developersCovers all the software's new features and capabilities, including SQL Azure for cloud computing, enhancements to client connectivity, and new functionality that ensures high-availability of mission-critical applicationsExplains major new changes to the SQL Server Business Intelligence tools, such as Integration, Reporting, and Analysis ServicesDemonstrates tasks both graphically and in SQL code to enhance your learningProvides source code from the companion web site, which you can use as a basis for your own projectsExplores tips, smart workarounds, and best practices to help you on the job Get thoroughly up to speed on SQL Server 2012 with Microsoft SQL Server 2012 Bible.",
				"bookTitle": "Microsoft SQL Server 2012 Bible",
				"language": "en",
				"libraryCatalog": "Safari Books Online",
				"publisher": "John Wiley & Sons",
				"url": "http://proquestcombo.safaribooksonline.com/book/databases/microsoft-sql-server-2012/9781118282175/part-i-laying-the-foundations/9781118282175p01_xhtml",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://proquestcombo.safaribooksonline.com/9781118282175/9781118282175c01_xhtml",
		"items": [
			{
				"itemType": "bookSection",
				"title": "The World of SQL Server",
				"creators": [
					{
						"firstName": "Adam",
						"lastName": "Jorgensen",
						"creatorType": "author"
					},
					{
						"firstName": "Jorge",
						"lastName": "Segarra",
						"creatorType": "author"
					},
					{
						"firstName": "Patrick",
						"lastName": "LeBlanc",
						"creatorType": "author"
					},
					{
						"firstName": "Jose",
						"lastName": "Chinchilla",
						"creatorType": "author"
					},
					{
						"firstName": "Aaron",
						"lastName": "Nelson",
						"creatorType": "author"
					}
				],
				"date": "August 28, 2012",
				"ISBN": "9781118282175",
				"abstractNote": "Harness the powerful new SQL Server 2012 Microsoft SQL Server 2012 is the most significant update to this product since 2005, and it may change how database administrators and developers perform many aspects of their jobs. If you're a database administrator or developer, Microsoft SQL Server 2012 Bible teaches you everything you need to take full advantage of this major release. This detailed guide not only covers all the new features of SQL Server 2012, it also shows you step by step how to develop top-notch SQL Server databases and new data connections and keep your databases performing at peak. The book is crammed with specific examples, sample code, and a host of tips, workarounds, and best practices. In addition, downloadable code is available from the book's companion web site, which you can use to jumpstart your own projects. Serves as an authoritative guide to Microsoft's SQL Server 2012 for database administrators and developersCovers all the software's new features and capabilities, including SQL Azure for cloud computing, enhancements to client connectivity, and new functionality that ensures high-availability of mission-critical applicationsExplains major new changes to the SQL Server Business Intelligence tools, such as Integration, Reporting, and Analysis ServicesDemonstrates tasks both graphically and in SQL code to enhance your learningProvides source code from the companion web site, which you can use as a basis for your own projectsExplores tips, smart workarounds, and best practices to help you on the job Get thoroughly up to speed on SQL Server 2012 with Microsoft SQL Server 2012 Bible.",
				"bookTitle": "Microsoft SQL Server 2012 Bible",
				"language": "en",
				"libraryCatalog": "Safari Books Online",
				"publisher": "John Wiley & Sons",
				"url": "http://proquestcombo.safaribooksonline.com/9781118282175/9781118282175c01_xhtml",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/