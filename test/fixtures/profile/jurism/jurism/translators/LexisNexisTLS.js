{
	"translatorID":"8e5f8616-05d0-4d33-8554-dad76b20ecb6",
	"translatorType":4,
	"label":"Lexis: US & Canadian Law Reviews, Combined",
	"creator":"Frank Bennett",
	"target":"https?://www\\.lexis\\.com/research/retrieve\\?.*_fmtstr=FULL.*",
	"minVersion":"1.0.0b3.r1",
	"maxVersion":"",
	"priority":100,
	"inRepository":true,
	"lastUpdated":"2011-05-30 16:59:24"
}

function detectWeb(doc, url) {
	return "journalArticle";
	var service_test = doc.evaluate( '//b[contains(text(),"Canadian Law Reviews, Combined")]',  doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (service_test) {
		return "journalArticle";
	}
}

var acronyms = ["ngo","wto","gatt","un","us","u\.s\.","eu","asil"];

function fixAcronyms(text) {
	var romans = new RegExp("(^|.*[^0-9a-z])([xvi]+)([^0-9a-z].*|$)", "i");	
	var vee = new RegExp("(^|.*[^0-9a-z])(v)([^0-9a-z].*|$)", "i");	
	var rex = new Array();
	for ( i in acronyms ) {
		rex.push( RegExp("(.*[^a-z0-9]+|^)("+acronyms[i]+")([^a-z0-9]+.*|$)", "i") )
	}
	var text = text.split(/\s+/);
	for ( t in text ) {
		for ( r in rex ) {
			if ( match = text[t].match( rex[r] ) ) {
				text[t] = match[1]+match[2].toUpperCase()+match[3];
			}
		}
		if ( match = text[t].match(romans)) {
			// upper case for romans, except for v, which most often separates litigant names
			 if ( ! text[t].match(vee) ) {
				text[t] = match[1]+match[2].toUpperCase()+match[3];
			}
		}
		text[t] = stripAsterisks(text[t]);
	}
	var text = text.join(" ");
	return text;
}

function stripAsterisks(text) {
	var text = text.replace(/[*]+$/, "");
	var text = text.replace(/[+]/g, "");
	return text;
}

function parseAuthors(item,authorstring) {
		var authorstring = Zotero.Utilities.unescapeHTML(authorstring);
		var authorstring = authorstring.replace(/[*]/g, "");
		var authors = authorstring.split(/(?:,*  *(?:AND|And|and|&)  *|, *)/);
		for (pos = authors.length-1; pos > -1; pos--) {
			var chunk = Zotero.Utilities.trim(authors[pos]);
			if ( chunk.split(/\s+/m).length < 2 ) {
				if ( authors.length-1 == pos > 0 ) {
					authors[pos-1] = authors.slice(pos-1,pos)[0]+", "+authors.slice(pos,pos+1)[0];
					authors.splice(pos,1);
				}
			}
		}
		for (i in authors ) {
			authors[i] = Zotero.Utilities.capitalizeTitle( stripAsterisks(authors.slice(i,i+1)[0]) );
			item.creators.push(Zotero.Utilities.cleanAuthor(authors[i], "author"));
		}
}

function pageProcessor	(text) {
	var item = new Zotero.Item();
	var m = text.match(/(<a[^>]*name=.?textonlyImage[^>]*>)/m);
	if ( m ) {
		if ( m2 = m[1].match(/href="?([^"]*)"?/) ) {
			item.attachments.push( {url:host+m2[1], title:"Lexis Snapshot", mimeType:"text/html"} );
		}
	}
	var m = text.match(/^.*?(<center.*)$/mi);
	if ( ! m ) {
		item.complete();
	}
	var text = Zotero.Utilities.cleanTags( m[1] ).replace(/\r/, "");
	item.itemType = "journalArticle";
	var Line = "[^\n]*";
	var LineForce = "[^\n]+"
	var gLine = "("+Line+")"
	var gLineForce = "("+LineForce+")"
	var NL = "\n+";
	var LineUnits = "(" +Line+NL+ ")*"
	var Month = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^\n0-9]*"
	var DateLineStrict = "((?:[^\n0-9]*[0-9]+)*(?:[^\n0-9]*[0-9]+))"
	
	// matches "2006", "Mar 2006", 10 March 2006", "Feb 2006 - Jan 2007"
	var DateLineLoose = "((?:[0-9]+  *)*(?:"+Month+"[0-9]+ +)*(?:"+Month+"[0-9]+))"
	// if ( m = "1 March 2008".match( RegExp(DateLine) )) { Zotero.debug(text); }
	
	// matches "ICJ 4 1 (432)"	  Only extractions are of the volume (and number), and pages
	var CiteNoYear = "(?:[a-zA-Z ]+([ 0-9]+)\\(([0-9]+)\\))";

	var rexDateCite = new RegExp( NL+ DateLineStrict +NL+ gLine, "m" );
	var rexCite = new RegExp("^([0-9]*)(.*?)([0-9]*)$", "m");
	var rexTitleFromLength = new RegExp(NL+ "LENGTH:" +Line+NL+gLine+NL, "m");
	var rexTitleFromDateCite = new RegExp(NL+ DateLineStrict +NL+Line+NL+gLine+NL, "m");
	var rexAuthorsFromName = new RegExp("\nNAME:" +gLine+NL, "m");
	var rexAuthorsFromByline = new RegExp(NL+ "(?:.|)By" +gLine+NL, "mi");
	var rexJournalDate = new RegExp( NL+gLineForce+NL+ DateLineLoose +NL);
	// matches top header data for Journal of International Criminal Justice and some
	// other English journals
	var rexJournalYearCite = RegExp( NL+gLine+NL+DateLineLoose+NL+CiteNoYear+NL );

	// an initial parse here, for the Journal of Criminal Law and
	// possibly others that have proper TITLE: and AUTHOR: tags, but are broken
	// in the journal/volume line

	if ( m = text.match( rexJournalYearCite ) ) {
		item.publicationTitle = Zotero.Utilities.capitalizeTitle( Zotero.Utilities.htmlSpecialChars( m[1] ) );
		item.year = m[2];
		// only the volume
		item.volume = m[3].split(/\s+/)[0];
	}

	if ( m = text.match( RegExp( NL+"TITLE:"+gLine+NL+gLine+NL )) ) {
		// if second line begins with a colon-terminated word, drop it.
		// then join the items with a colon delimiter
		var titlelist = [ m[1], m[2] ]
		if ( titlelist[1].match(/[a-z][A-Z]+:/) ) {
			titlelist.splice(1);
		}
		item.title = titlelist.join(": ");
	}
	
	if ( m = text.match( RegExp( NL+"AUTHOR:"+gLine+NL ) ) ) {
		parseAuthors( item, m[1] );
	}
	
	if (! item.publicationTitle ) {
		if ( matchDateCite = text.match(rexDateCite) ) {
			item.date = matchDateCite[1];
			if ( matchCite = matchDateCite[2].match(rexCite) ) {
				item.volume = matchCite[1];
				item.publicationTitle = Zotero.Utilities.unescapeHTML(matchCite[2]);
				item.publicationTitle = Zotero.Utilities.trim(item.publicationTitle);
				item.journalAbbreviation = item.publicationTitle;
				item.pages = matchCite[3];
			}
		}
		// try to recover if the journal name was missing and we snagged the LENGTH tag
		if ( item.publicationTitle.match(/^\s*LENGTH:.*/i) ) {
			if ( matchJournal = text.match( rexJournalDate ) ) {
				delete item.volume;
				delete item.pages;
				item.publicationTitle = matchJournal[1];
				item.journalAbbreviation = item.publicationTitle;
			}
		}
	}
	
	if ( ! item.title ) {
		Zotero.debug('second phase');
		if ( matchTitle = text.match(rexTitleFromLength) ) {
			var title = matchTitle[1];
		} else if ( matchTitle = text.match(rexTitleFromDateCite) ) {
			var title = matchTitle[2];
		}
		if (title) {
			item.title = Zotero.Utilities.unescapeHTML(title);
			// Force to upper case, so the reformatter doesn't think a weird title is in
			// mixed case by intention.
			item.title = item.title.toUpperCase();
			item.title = Zotero.Utilities.capitalizeTitle(item.title);
			item.title = item.title.replace(/(^|.*\s+)article:\s*/i, "");
			item.title = fixAcronyms(item.title);
		}
	}

	if ( matchAuthors = text.match(rexAuthorsFromName) ) {
		parseAuthors(item, matchAuthors[1]);
	} else if ( matchAuthors = text.match(rexAuthorsFromByline) ) {
		// paranoia, we don't want some paragraph that starts with By ...
		var authorstringlist = matchAuthors[1].split(" ");
		if ( authorstringlist.length < 25 ) { 
			parseAuthors(item, matchAuthors[1]);
		}
	}
	item.complete();
}

function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	host = url.replace(/^([a-z]*:\/\/[^\/]*)\/.*/, "$1");
	Zotero.Utilities.doGet( url, pageProcessor, Zotero.done );
	Zotero.wait();
}
