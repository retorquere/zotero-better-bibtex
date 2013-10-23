{
	"translatorID": "9cb70025-a888-4a29-a210-93ec52da40d4",
	"label": "BibTeX",
	"creator": "Simon Kornblith, Richard Karnesky and Emiliano heyns",
	"target": "bib",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"displayOptions": {
		"exportNotes": true,
		"exportFileData": false,
		"useJournalAbbreviation": false
	},
  "configOptions": {
    "getCollections": true
  },
	"inRepository": true,
	"translatorType": 3,
	"browserSupport": "gcsv",
	"lastUpdated": "2013-10-01 10:05:00"
}

// TOASCII //

function detectImport() {
	var maxChars = 1048576; // 1MB
	
	var inComment = false;
	var block = "";
	var buffer = "";
	var chr = "";
	var charsRead = 0;
	
	var re = /^\s*@[a-zA-Z]+[\(\{]/;
	while((buffer = Zotero.read(4096)) && charsRead < maxChars) {
		Zotero.debug("Scanning " + buffer.length + " characters for BibTeX");
		charsRead += buffer.length;
		for (var i=0; i<buffer.length; i++) {
			chr = buffer[i];
			
			if (inComment && chr != "\r" && chr != "\n") {
				continue;
			}
			inComment = false;
			
			if(chr == "%") {
				// read until next newline
				block = "";
				inComment = true;
			} else if((chr == "\n" || chr == "\r"
				// allow one-line entries
						|| i == (buffer.length - 1))
						&& block) {
				// check if this is a BibTeX entry
				if(re.test(block)) {
					return true;
				}
				
				block = "";
			} else if(" \n\r\t".indexOf(chr) == -1) {
				block += chr;
			}
		}
	}
}

//%a = first author surname
//%y = year
//%t = first word of title
var citeKeyFormat = "%a_%t_%y";

var fieldMap = {
	address:"place",
	chapter:"section",
	edition:"edition",
	type:"type",
	series:"series",
	title:"title",
	volume:"volume",
	copyright:"rights",
	isbn:"ISBN",
	issn:"ISSN",
	lccn:"callNumber",
	shorttitle:"shortTitle",
	url:"url",
	doi:"DOI",
	abstract:"abstractNote",
  	nationality: "country",
  	language:"language",
  	assignee:"assignee"
};

var inputFieldMap = {
	booktitle :"publicationTitle",
	school:"publisher",
	institution:"publisher",
	publisher:"publisher",
	issue:"issue",
	location:"place"
};

var zotero2bibtexTypeMap = {
	"book":"book",
	"bookSection":"incollection",
	"journalArticle":"article",
	"magazineArticle":"article",
	"newspaperArticle":"article",
	"thesis":"phdthesis",
	"letter":"misc",
	"manuscript":"unpublished",
	"patent" :"patent",
	"interview":"misc",
	"film":"misc",
	"artwork":"misc",
	"webpage":"misc",
	"conferencePaper":"inproceedings",
	"report":"techreport"
};

var bibtex2zoteroTypeMap = {
	"book":"book", // or booklet, proceedings
	"inbook":"bookSection",
	"incollection":"bookSection",
	"article":"journalArticle", // or magazineArticle or newspaperArticle
	"patent" :"patent",
	"phdthesis":"thesis",
	"unpublished":"manuscript",
	"inproceedings":"conferencePaper", // check for conference also
	"conference":"conferencePaper",
	"techreport":"report",
	"booklet":"book",
	"manual":"book",
	"mastersthesis":"thesis",
	"misc":"book",
	"proceedings":"book"
};

/*
 * three-letter month abbreviations. i assume these are the same ones that the
 * docs say are defined in some appendix of the LaTeX book. (i don't have the
 * LaTeX book.)
 */
var months = ["jan", "feb", "mar", "apr", "may", "jun",
			  "jul", "aug", "sep", "oct", "nov", "dec"];

var jabref = {
	format: null,
	root: {}
};

/*
 * new mapping table based on that from Matthias Steffens,
 * then enhanced with some fields generated from the unicode table.
 */

/* unfortunately the mapping isn't reversible - hence this second table - sigh! */
var reversemappingTable = {
	"\\url"                           : "",       // strip 'url'
	"\\href"                          : "",       // strip 'href'
	"{\\textexclamdown}"              : "\u00A1", // INVERTED EXCLAMATION MARK
	"{\\textcent}"                    : "\u00A2", // CENT SIGN
	"{\\textsterling}"                : "\u00A3", // POUND SIGN
	"{\\textyen}"                     : "\u00A5", // YEN SIGN
	"{\\textbrokenbar}"               : "\u00A6", // BROKEN BAR
	"{\\textsection}"                 : "\u00A7", // SECTION SIGN
	"{\\textasciidieresis}"           : "\u00A8", // DIAERESIS
	"{\\textcopyright}"               : "\u00A9", // COPYRIGHT SIGN
	"{\\textordfeminine}"             : "\u00AA", // FEMININE ORDINAL INDICATOR
	"{\\guillemotleft}"               : "\u00AB", // LEFT-POINTING DOUBLE ANGLE QUOTATION MARK
	"{\\textlnot}"                    : "\u00AC", // NOT SIGN
	"{\\textregistered}"              : "\u00AE", // REGISTERED SIGN
	"{\\textasciimacron}"             : "\u00AF", // MACRON
	"{\\textdegree}"                  : "\u00B0", // DEGREE SIGN
	"{\\textpm}"                      : "\u00B1", // PLUS-MINUS SIGN
	"{\\texttwosuperior}"             : "\u00B2", // SUPERSCRIPT TWO
	"{\\textthreesuperior}"           : "\u00B3", // SUPERSCRIPT THREE
	"{\\textasciiacute}"              : "\u00B4", // ACUTE ACCENT
	"{\\textmu}"                      : "\u00B5", // MICRO SIGN
	"{\\textparagraph}"               : "\u00B6", // PILCROW SIGN
	"{\\textperiodcentered}"          : "\u00B7", // MIDDLE DOT
	"{\\c\\ }"                        : "\u00B8", // CEDILLA
	"{\\textonesuperior}"             : "\u00B9", // SUPERSCRIPT ONE
	"{\\textordmasculine}"            : "\u00BA", // MASCULINE ORDINAL INDICATOR
	"{\\guillemotright}"              : "\u00BB", // RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK
	"{\\textonequarter}"              : "\u00BC", // VULGAR FRACTION ONE QUARTER
	"{\\textonehalf}"                 : "\u00BD", // VULGAR FRACTION ONE HALF
	"{\\textthreequarters}"           : "\u00BE", // VULGAR FRACTION THREE QUARTERS
	"{\\textquestiondown}"            : "\u00BF", // INVERTED QUESTION MARK
	"{\\AE}"                          : "\u00C6", // LATIN CAPITAL LETTER AE
	"{\\DH}"                          : "\u00D0", // LATIN CAPITAL LETTER ETH
	"{\\texttimes}"                   : "\u00D7", // MULTIPLICATION SIGN
	"{\\O}"                          : 	"\u00D8", // LATIN SMALL LETTER O WITH STROKE
	"{\\TH}"                          : "\u00DE", // LATIN CAPITAL LETTER THORN
	"{\\ss}"                          : "\u00DF", // LATIN SMALL LETTER SHARP S
	"{\\ae}"                          : "\u00E6", // LATIN SMALL LETTER AE
	"{\\dh}"                          : "\u00F0", // LATIN SMALL LETTER ETH
	"{\\textdiv}"                     : "\u00F7", // DIVISION SIGN
	"{\\o}"                          : "\u00F8", // LATIN SMALL LETTER O WITH STROKE
	"{\\th}"                          : "\u00FE", // LATIN SMALL LETTER THORN
	"{\\i}"                           : "\u0131", // LATIN SMALL LETTER DOTLESS I
	//"'n"                              : "\u0149", // LATIN SMALL LETTER N PRECEDED BY APOSTROPHE
	"{\\NG}"                          : "\u014A", // LATIN CAPITAL LETTER ENG
	"{\\ng}"                          : "\u014B", // LATIN SMALL LETTER ENG
	"{\\OE}"                          : "\u0152", // LATIN CAPITAL LIGATURE OE
	"{\\oe}"                          : "\u0153", // LATIN SMALL LIGATURE OE
	"{\\textasciicircum}"             : "\u02C6", // MODIFIER LETTER CIRCUMFLEX ACCENT
//    "\\~{}"                           : "\u02DC", // SMALL TILDE
	"{\\textacutedbl}"                : "\u02DD", // DOUBLE ACUTE ACCENT
	
	//Greek Letters Courtesy of Spartanroc
	"$\\Gamma$" : "\u0393", // GREEK Gamma
	"$\\Delta$" : "\u0394", // GREEK Delta
	"$\\Theta$" : "\u0398", // GREEK Theta
	"$\\Lambda$" : "\u039B", // GREEK Lambda
	"$\\Xi$" : "\u039E", // GREEK Xi
	"$\\Pi$" : "\u03A0", // GREEK Pi
	"$\\Sigma$" : "\u03A3", // GREEK Sigma
	"$\\Phi$" : "\u03A6", // GREEK Phi
	"$\\Psi$" : "\u03A8", // GREEK Psi
	"$\\Omega$" : "\u03A9", // GREEK Omega
	"$\\alpha$" : "\u03B1", // GREEK alpha
	"$\\beta$" : "\u03B2", // GREEK beta
	"$\\gamma$" : "\u03B3", // GREEK gamma
	"$\\delta$" : "\u03B4", // GREEK delta
	"$\\varepsilon$": "\u03B5", // GREEK var-epsilon
	"$\\zeta$" : "\u03B6", // GREEK zeta
	"$\\eta$" : "\u03B7", // GREEK eta
	"$\\theta$" : "\u03B8", // GREEK theta
	"$\\iota$" : "\u03B9", // GREEK iota
	"$\\kappa$" : "\u03BA", // GREEK kappa
	"$\\lambda$" : "\u03BB", // GREEK lambda
	"$\\mu$" : "\u03BC", // GREEK mu
	"$\\nu$" : "\u03BD", // GREEK nu
	"$\\xi$" : "\u03BE", // GREEK xi
	"$\\pi$" : "\u03C0", // GREEK pi
	"$\\rho$" : "\u03C1", // GREEK rho
	"$\\varsigma$" : "\u03C2", // GREEK var-sigma
	"$\\sigma$" : "\u03C3", // GREEK sigma
	"$\\tau$" : "\u03C4", // GREEK tau
	"$\\upsilon$" : "\u03C5", // GREEK upsilon
	"$\\varphi$" : "\u03C6", // GREEK var-phi
	"$\\chi$" : "\u03C7", // GREEK chi
	"$\\psi$" : "\u03C8", // GREEK psi
	"$\\omega$" : "\u03C9", // GREEK omega
	"$\\vartheta$" : "\u03D1", // GREEK var-theta
	"$\\Upsilon$" : "\u03D2", // GREEK Upsilon
	"$\\phi$" : "\u03D5", // GREEK phi
	"$\\varpi$" : "\u03D6", // GREEK var-pi
	"$\\varrho$" : "\u03F1", // GREEK var-rho
	"$\\epsilon$" : "\u03F5", // GREEK epsilon
	//Greek letters end
	"{\\textendash}"                  : "\u2013", // EN DASH
	"{\\textemdash}"                  : "\u2014", // EM DASH
	"---"                             : "\u2014", // EM DASH
	"--"                              : "\u2013", // EN DASH
	"{\\textbardbl}"                  : "\u2016", // DOUBLE VERTICAL LINE
	"{\\textunderscore}"              : "\u2017", // DOUBLE LOW LINE
	"{\\textquoteleft}"               : "\u2018", // LEFT SINGLE QUOTATION MARK
	"{\\textquoteright}"              : "\u2019", // RIGHT SINGLE QUOTATION MARK
	"{\\quotesinglbase}"              : "\u201A", // SINGLE LOW-9 QUOTATION MARK
	"{\\textquotedblleft}"            : "\u201C", // LEFT DOUBLE QUOTATION MARK
	"{\\textquotedblright}"           : "\u201D", // RIGHT DOUBLE QUOTATION MARK
	"{\\quotedblbase}"                : "\u201E", // DOUBLE LOW-9 QUOTATION MARK
//    "{\\quotedblbase}"                : "\u201F", // DOUBLE HIGH-REVERSED-9 QUOTATION MARK
	"{\\textdagger}"                  : "\u2020", // DAGGER
	"{\\textdaggerdbl}"               : "\u2021", // DOUBLE DAGGER
	"{\\textbullet}"                  : "\u2022", // BULLET
	"{\\textellipsis}"                : "\u2026", // HORIZONTAL ELLIPSIS
	"{\\textperthousand}"             : "\u2030", // PER MILLE SIGN
	"'''"                             : "\u2034", // TRIPLE PRIME
	"''"                              : "\u201D", // RIGHT DOUBLE QUOTATION MARK (could be a double prime)
	"``"                              : "\u201C", // LEFT DOUBLE QUOTATION MARK (could be a reversed double prime)
	"```"                             : "\u2037", // REVERSED TRIPLE PRIME
	"{\\guilsinglleft}"               : "\u2039", // SINGLE LEFT-POINTING ANGLE QUOTATION MARK
	"{\\guilsinglright}"              : "\u203A", // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK
	"!!"                              : "\u203C", // DOUBLE EXCLAMATION MARK
	"{\\textfractionsolidus}"         : "\u2044", // FRACTION SLASH
	"?!"                              : "\u2048", // QUESTION EXCLAMATION MARK
	"!?"                              : "\u2049", // EXCLAMATION QUESTION MARK
	"$^{0}$"                          : "\u2070", // SUPERSCRIPT ZERO
	"$^{4}$"                          : "\u2074", // SUPERSCRIPT FOUR
	"$^{5}$"                          : "\u2075", // SUPERSCRIPT FIVE
	"$^{6}$"                          : "\u2076", // SUPERSCRIPT SIX
	"$^{7}$"                          : "\u2077", // SUPERSCRIPT SEVEN
	"$^{8}$"                          : "\u2078", // SUPERSCRIPT EIGHT
	"$^{9}$"                          : "\u2079", // SUPERSCRIPT NINE
	"$^{+}$"                          : "\u207A", // SUPERSCRIPT PLUS SIGN
	"$^{-}$"                          : "\u207B", // SUPERSCRIPT MINUS
	"$^{=}$"                          : "\u207C", // SUPERSCRIPT EQUALS SIGN
	"$^{(}$"                          : "\u207D", // SUPERSCRIPT LEFT PARENTHESIS
	"$^{)}$"                          : "\u207E", // SUPERSCRIPT RIGHT PARENTHESIS
	"$^{n}$"                          : "\u207F", // SUPERSCRIPT LATIN SMALL LETTER N
	"$_{0}$"                          : "\u2080", // SUBSCRIPT ZERO
	"$_{1}$"                          : "\u2081", // SUBSCRIPT ONE
	"$_{2}$"                          : "\u2082", // SUBSCRIPT TWO
	"$_{3}$"                          : "\u2083", // SUBSCRIPT THREE
	"$_{4}$"                          : "\u2084", // SUBSCRIPT FOUR
	"$_{5}$"                          : "\u2085", // SUBSCRIPT FIVE
	"$_{6}$"                          : "\u2086", // SUBSCRIPT SIX
	"$_{7}$"                          : "\u2087", // SUBSCRIPT SEVEN
	"$_{8}$"                          : "\u2088", // SUBSCRIPT EIGHT
	"$_{9}$"                          : "\u2089", // SUBSCRIPT NINE
	"$_{+}$"                          : "\u208A", // SUBSCRIPT PLUS SIGN
	"$_{-}$"                          : "\u208B", // SUBSCRIPT MINUS
	"$_{=}$"                          : "\u208C", // SUBSCRIPT EQUALS SIGN
	"$_{(}$"                          : "\u208D", // SUBSCRIPT LEFT PARENTHESIS
	"$_{)}$"                          : "\u208E", // SUBSCRIPT RIGHT PARENTHESIS
	"{\\texteuro}"                    : "\u20AC", // EURO SIGN
	//"a/c"                             : "\u2100", // ACCOUNT OF
	//"a/s"                             : "\u2101", // ADDRESSED TO THE SUBJECT
	"{\\textcelsius}"                 : "\u2103", // DEGREE CELSIUS
	//"c/o"                             : "\u2105", // CARE OF
	//"c/u"                             : "\u2106", // CADA UNA
	"{\\textnumero}"                  : "\u2116", // NUMERO SIGN
	"{\\textcircledP}"                : "\u2117", // SOUND RECORDING COPYRIGHT
	"{\\textservicemark}"             : "\u2120", // SERVICE MARK
	"{TEL}"                           : "\u2121", // TELEPHONE SIGN
	"{\\texttrademark}"               : "\u2122", // TRADE MARK SIGN
	"{\\textohm}"                     : "\u2126", // OHM SIGN
	"{\\textestimated}"               : "\u212E", // ESTIMATED SYMBOL
	
	/*" 1/3"                            : "\u2153", // VULGAR FRACTION ONE THIRD
	" 2/3"                            : "\u2154", // VULGAR FRACTION TWO THIRDS
	" 1/5"                            : "\u2155", // VULGAR FRACTION ONE FIFTH
	" 2/5"                            : "\u2156", // VULGAR FRACTION TWO FIFTHS
	" 3/5"                            : "\u2157", // VULGAR FRACTION THREE FIFTHS
	" 4/5"                            : "\u2158", // VULGAR FRACTION FOUR FIFTHS
	" 1/6"                            : "\u2159", // VULGAR FRACTION ONE SIXTH
	" 5/6"                            : "\u215A", // VULGAR FRACTION FIVE SIXTHS
	" 1/8"                            : "\u215B", // VULGAR FRACTION ONE EIGHTH
	" 3/8"                            : "\u215C", // VULGAR FRACTION THREE EIGHTHS
	" 5/8"                            : "\u215D", // VULGAR FRACTION FIVE EIGHTHS
	" 7/8"                            : "\u215E", // VULGAR FRACTION SEVEN EIGHTHS
	" 1/"                             : "\u215F", // FRACTION NUMERATOR ONE */
	
	"{\\textleftarrow}"               : "\u2190", // LEFTWARDS ARROW
	"{\\textuparrow}"                 : "\u2191", // UPWARDS ARROW
	"{\\textrightarrow}"              : "\u2192", // RIGHTWARDS ARROW
	"{\\textdownarrow}"               : "\u2193", // DOWNWARDS ARROW
	/*"<->"                             : "\u2194", // LEFT RIGHT ARROW
	"<="                              : "\u21D0", // LEFTWARDS DOUBLE ARROW
	"=>"                              : "\u21D2", // RIGHTWARDS DOUBLE ARROW
	"<=>"                             : "\u21D4", // LEFT RIGHT DOUBLE ARROW */
	"$\\infty$"                       : "\u221E", // INFINITY
	
	/*"||"                              : "\u2225", // PARALLEL TO
	"/="                              : "\u2260", // NOT EQUAL TO
	"<="                              : "\u2264", // LESS-THAN OR EQUAL TO
	">="                              : "\u2265", // GREATER-THAN OR EQUAL TO
	"<<"                              : "\u226A", // MUCH LESS-THAN
	">>"                              : "\u226B", // MUCH GREATER-THAN
	"(+)"                             : "\u2295", // CIRCLED PLUS
	"(-)"                             : "\u2296", // CIRCLED MINUS
	"(x)"                             : "\u2297", // CIRCLED TIMES
	"(/)"                             : "\u2298", // CIRCLED DIVISION SLASH
	"|-"                              : "\u22A2", // RIGHT TACK
	"-|"                              : "\u22A3", // LEFT TACK
	"|-"                              : "\u22A6", // ASSERTION
	"|="                              : "\u22A7", // MODELS
	"|="                              : "\u22A8", // TRUE
	"||-"                             : "\u22A9", // FORCES */
	
	"$\\#$"                           : "\u22D5", // EQUAL AND PARALLEL TO
	//"<<<"                             : "\u22D8", // VERY MUCH LESS-THAN
	//">>>"                             : "\u22D9", // VERY MUCH GREATER-THAN
	"{\\textlangle}"                  : "\u2329", // LEFT-POINTING ANGLE BRACKET
	"{\\textrangle}"                  : "\u232A", // RIGHT-POINTING ANGLE BRACKET
	"{\\textvisiblespace}"            : "\u2423", // OPEN BOX
	//"///"                             : "\u2425", // SYMBOL FOR DELETE FORM TWO
	"{\\textopenbullet}"              : "\u25E6", // WHITE BULLET
	//":-("                             : "\u2639", // WHITE FROWNING FACE
	//":-)"                             : "\u263A", // WHITE SMILING FACE
	//"(-: "                            : "\u263B", // BLACK SMILING FACE
	//    "$\\#$"                           : "\u266F", // MUSIC SHARP SIGN
	"$\\%<$"                          : "\u2701", // UPPER BLADE SCISSORS
	/*    "$\\%<$"                          : "\u2702", // BLACK SCISSORS
	"$\\%<$"                          : "\u2703", // LOWER BLADE SCISSORS
	"$\\%<$"                          : "\u2704", // WHITE SCISSORS */
	/* Derived accented characters */
	"{\\`A}"                          : "\u00C0", // LATIN CAPITAL LETTER A WITH GRAVE
	"{\\'A}"                          : "\u00C1", // LATIN CAPITAL LETTER A WITH ACUTE
	"{\\^A}"                          : "\u00C2", // LATIN CAPITAL LETTER A WITH CIRCUMFLEX
	"{\\~A}"                          : "\u00C3", // LATIN CAPITAL LETTER A WITH TILDE
	"{\\\"A}"                         : "\u00C4", // LATIN CAPITAL LETTER A WITH DIAERESIS
	"{\\r A}"                          : "\u00C5", // LATIN CAPITAL LETTER A WITH RING ABOVE
	"{\\c C}"                          : "\u00C7", // LATIN CAPITAL LETTER C WITH CEDILLA
	"{\\`E}"                          : "\u00C8", // LATIN CAPITAL LETTER E WITH GRAVE
	"{\\'E}"                          : "\u00C9", // LATIN CAPITAL LETTER E WITH ACUTE
	"{\\^E}"                          : "\u00CA", // LATIN CAPITAL LETTER E WITH CIRCUMFLEX
	"{\\\"E}"                         : "\u00CB", // LATIN CAPITAL LETTER E WITH DIAERESIS
	"{\\`I}"                          : "\u00CC", // LATIN CAPITAL LETTER I WITH GRAVE
	"{\\'I}"                          : "\u00CD", // LATIN CAPITAL LETTER I WITH ACUTE
	"{\\^I}"                          : "\u00CE", // LATIN CAPITAL LETTER I WITH CIRCUMFLEX
	"{\\\"I}"                         : "\u00CF", // LATIN CAPITAL LETTER I WITH DIAERESIS
	"{\\~N}"                          : "\u00D1", // LATIN CAPITAL LETTER N WITH TILDE
	"{\\`O}"                          : "\u00D2", // LATIN CAPITAL LETTER O WITH GRAVE
	"{\\'O}"                          : "\u00D3", // LATIN CAPITAL LETTER O WITH ACUTE
	"{\\^O}"                          : "\u00D4", // LATIN CAPITAL LETTER O WITH CIRCUMFLEX
	"{\\~O}"                          : "\u00D5", // LATIN CAPITAL LETTER O WITH TILDE
	"{\\\"O}"                         : "\u00D6", // LATIN CAPITAL LETTER O WITH DIAERESIS
	"{\\`U}"                          : "\u00D9", // LATIN CAPITAL LETTER U WITH GRAVE
	"{\\'U}"                          : "\u00DA", // LATIN CAPITAL LETTER U WITH ACUTE
	"{\\^U}"                          : "\u00DB", // LATIN CAPITAL LETTER U WITH CIRCUMFLEX
	"{\\\"U}"                         : "\u00DC", // LATIN CAPITAL LETTER U WITH DIAERESIS
	"{\\'Y}"                          : "\u00DD", // LATIN CAPITAL LETTER Y WITH ACUTE
	"{\\`a}"                          : "\u00E0", // LATIN SMALL LETTER A WITH GRAVE
	"{\\'a}"                          : "\u00E1", // LATIN SMALL LETTER A WITH ACUTE
	"{\\^a}"                          : "\u00E2", // LATIN SMALL LETTER A WITH CIRCUMFLEX
	"{\\~a}"                          : "\u00E3", // LATIN SMALL LETTER A WITH TILDE
	"{\\\"a}"                         : "\u00E4", // LATIN SMALL LETTER A WITH DIAERESIS
	"{\\r a}"                          : "\u00E5", // LATIN SMALL LETTER A WITH RING ABOVE
	"{\\c c}"                          : "\u00E7", // LATIN SMALL LETTER C WITH CEDILLA
	"{\\`e}"                          : "\u00E8", // LATIN SMALL LETTER E WITH GRAVE
	"{\\'e}"                          : "\u00E9", // LATIN SMALL LETTER E WITH ACUTE
	"{\\^e}"                          : "\u00EA", // LATIN SMALL LETTER E WITH CIRCUMFLEX
	"{\\\"e}"                         : "\u00EB", // LATIN SMALL LETTER E WITH DIAERESIS
	"{\\`i}"                          : "\u00EC", // LATIN SMALL LETTER I WITH GRAVE
	"{\\'i}"                          : "\u00ED", // LATIN SMALL LETTER I WITH ACUTE
	"{\\^i}"                          : "\u00EE", // LATIN SMALL LETTER I WITH CIRCUMFLEX
	"{\\\"i}"                         : "\u00EF", // LATIN SMALL LETTER I WITH DIAERESIS
	"{\\~n}"                          : "\u00F1", // LATIN SMALL LETTER N WITH TILDE
	"{\\`o}"                          : "\u00F2", // LATIN SMALL LETTER O WITH GRAVE
	"{\\'o}"                          : "\u00F3", // LATIN SMALL LETTER O WITH ACUTE
	"{\\^o}"                          : "\u00F4", // LATIN SMALL LETTER O WITH CIRCUMFLEX
	"{\\~o}"                          : "\u00F5", // LATIN SMALL LETTER O WITH TILDE
	"{\\\"o}"                         : "\u00F6", // LATIN SMALL LETTER O WITH DIAERESIS
	"{\\`u}"                          : "\u00F9", // LATIN SMALL LETTER U WITH GRAVE
	"{\\'u}"                          : "\u00FA", // LATIN SMALL LETTER U WITH ACUTE
	"{\\^u}"                          : "\u00FB", // LATIN SMALL LETTER U WITH CIRCUMFLEX
	"{\\\"u}"                         : "\u00FC", // LATIN SMALL LETTER U WITH DIAERESIS
	"{\\'y}"                          : "\u00FD", // LATIN SMALL LETTER Y WITH ACUTE
	"{\\\"y}"                         : "\u00FF", // LATIN SMALL LETTER Y WITH DIAERESIS
	"{\\=A}"                          : "\u0100", // LATIN CAPITAL LETTER A WITH MACRON
	"{\\=a}"                          : "\u0101", // LATIN SMALL LETTER A WITH MACRON
	"{\\u A}"                          : "\u0102", // LATIN CAPITAL LETTER A WITH BREVE
	"{\\u a}"                          : "\u0103", // LATIN SMALL LETTER A WITH BREVE
	"{\\k A}"                          : "\u0104", // LATIN CAPITAL LETTER A WITH OGONEK
	"{\\k a}"                          : "\u0105", // LATIN SMALL LETTER A WITH OGONEK
	"{\\'C}"                          : "\u0106", // LATIN CAPITAL LETTER C WITH ACUTE
	"{\\'c}"                          : "\u0107", // LATIN SMALL LETTER C WITH ACUTE
	"{\\^C}"                          : "\u0108", // LATIN CAPITAL LETTER C WITH CIRCUMFLEX
	"{\\^c}"                          : "\u0109", // LATIN SMALL LETTER C WITH CIRCUMFLEX
	"{\\.C}"                          : "\u010A", // LATIN CAPITAL LETTER C WITH DOT ABOVE
	"{\\.c}"                          : "\u010B", // LATIN SMALL LETTER C WITH DOT ABOVE
	"{\\v C}"                          : "\u010C", // LATIN CAPITAL LETTER C WITH CARON
	"{\\v c}"                          : "\u010D", // LATIN SMALL LETTER C WITH CARON
	"{\\v D}"                          : "\u010E", // LATIN CAPITAL LETTER D WITH CARON
	"{\\v d}"                          : "\u010F", // LATIN SMALL LETTER D WITH CARON
	"{\\=E}"                          : "\u0112", // LATIN CAPITAL LETTER E WITH MACRON
	"{\\=e}"                          : "\u0113", // LATIN SMALL LETTER E WITH MACRON
	"{\\u E}"                          : "\u0114", // LATIN CAPITAL LETTER E WITH BREVE
	"{\\u e}"                          : "\u0115", // LATIN SMALL LETTER E WITH BREVE
	"{\\.E}"                          : "\u0116", // LATIN CAPITAL LETTER E WITH DOT ABOVE
	"{\\.e}"                          : "\u0117", // LATIN SMALL LETTER E WITH DOT ABOVE
	"{\\k E}"                          : "\u0118", // LATIN CAPITAL LETTER E WITH OGONEK
	"{\\k e}"                          : "\u0119", // LATIN SMALL LETTER E WITH OGONEK
	"{\\v E}"                          : "\u011A", // LATIN CAPITAL LETTER E WITH CARON
	"{\\v e}"                          : "\u011B", // LATIN SMALL LETTER E WITH CARON
	"{\\^G}"                          : "\u011C", // LATIN CAPITAL LETTER G WITH CIRCUMFLEX
	"{\\^g}"                          : "\u011D", // LATIN SMALL LETTER G WITH CIRCUMFLEX
	"{\\u G}"                          : "\u011E", // LATIN CAPITAL LETTER G WITH BREVE
	"{\\u g}"                          : "\u011F", // LATIN SMALL LETTER G WITH BREVE
	"{\\.G}"                          : "\u0120", // LATIN CAPITAL LETTER G WITH DOT ABOVE
	"{\\.g}"                          : "\u0121", // LATIN SMALL LETTER G WITH DOT ABOVE
	"{\\c G}"                          : "\u0122", // LATIN CAPITAL LETTER G WITH CEDILLA
	"{\\c g}"                          : "\u0123", // LATIN SMALL LETTER G WITH CEDILLA
	"{\\^H}"                          : "\u0124", // LATIN CAPITAL LETTER H WITH CIRCUMFLEX
	"{\\^h}"                          : "\u0125", // LATIN SMALL LETTER H WITH CIRCUMFLEX
	"{\\~I}"                          : "\u0128", // LATIN CAPITAL LETTER I WITH TILDE
	"{\\~i}"                          : "\u0129", // LATIN SMALL LETTER I WITH TILDE
	"{\\=I}"                          : "\u012A", // LATIN CAPITAL LETTER I WITH MACRON
	"{\\=i}"                          : "\u012B", // LATIN SMALL LETTER I WITH MACRON
	"{\\=\\i}"                        : "\u012B", // LATIN SMALL LETTER I WITH MACRON
	"{\\u I}"                          : "\u012C", // LATIN CAPITAL LETTER I WITH BREVE
	"{\\u i}"                          : "\u012D", // LATIN SMALL LETTER I WITH BREVE
	"{\\k I}"                          : "\u012E", // LATIN CAPITAL LETTER I WITH OGONEK
	"{\\k i}"                          : "\u012F", // LATIN SMALL LETTER I WITH OGONEK
	"{\\.I}"                          : "\u0130", // LATIN CAPITAL LETTER I WITH DOT ABOVE
	"{\\^J}"                          : "\u0134", // LATIN CAPITAL LETTER J WITH CIRCUMFLEX
	"{\\^j}"                          : "\u0135", // LATIN SMALL LETTER J WITH CIRCUMFLEX
	"{\\c K}"                          : "\u0136", // LATIN CAPITAL LETTER K WITH CEDILLA
	"{\\c k}"                          : "\u0137", // LATIN SMALL LETTER K WITH CEDILLA
	"{\\'L}"                          : "\u0139", // LATIN CAPITAL LETTER L WITH ACUTE
	"{\\'l}"                          : "\u013A", // LATIN SMALL LETTER L WITH ACUTE
	"{\\c L}"                          : "\u013B", // LATIN CAPITAL LETTER L WITH CEDILLA
	"{\\c l}"                          : "\u013C", // LATIN SMALL LETTER L WITH CEDILLA
	"{\\v L}"                          : "\u013D", // LATIN CAPITAL LETTER L WITH CARON
	"{\\v l}"                          : "\u013E", // LATIN SMALL LETTER L WITH CARON
	"{\\L }"                           : "\u0141", //LATIN CAPITAL LETTER L WITH STROKE
	"{\\l }"                           : "\u0142", //LATIN SMALL LETTER L WITH STROKE
	"{\\'N}"                          : "\u0143", // LATIN CAPITAL LETTER N WITH ACUTE
	"{\\'n}"                          : "\u0144", // LATIN SMALL LETTER N WITH ACUTE
	"{\\c N}"                          : "\u0145", // LATIN CAPITAL LETTER N WITH CEDILLA
	"{\\c n}"                          : "\u0146", // LATIN SMALL LETTER N WITH CEDILLA
	"{\\v N}"                          : "\u0147", // LATIN CAPITAL LETTER N WITH CARON
	"{\\v n}"                          : "\u0148", // LATIN SMALL LETTER N WITH CARON
	"{\\=O}"                          : "\u014C", // LATIN CAPITAL LETTER O WITH MACRON
	"{\\=o}"                          : "\u014D", // LATIN SMALL LETTER O WITH MACRON
	"{\\u O}"                          : "\u014E", // LATIN CAPITAL LETTER O WITH BREVE
	"{\\u o}"                          : "\u014F", // LATIN SMALL LETTER O WITH BREVE
	"{\\H O}"                          : "\u0150", // LATIN CAPITAL LETTER O WITH DOUBLE ACUTE
	"{\\H o}"                          : "\u0151", // LATIN SMALL LETTER O WITH DOUBLE ACUTE
	"{\\'R}"                          : "\u0154", // LATIN CAPITAL LETTER R WITH ACUTE
	"{\\'r}"                          : "\u0155", // LATIN SMALL LETTER R WITH ACUTE
	"{\\c R}"                          : "\u0156", // LATIN CAPITAL LETTER R WITH CEDILLA
	"{\\c r}"                          : "\u0157", // LATIN SMALL LETTER R WITH CEDILLA
	"{\\v R}"                          : "\u0158", // LATIN CAPITAL LETTER R WITH CARON
	"{\\v r}"                          : "\u0159", // LATIN SMALL LETTER R WITH CARON
	"{\\'S}"                          : "\u015A", // LATIN CAPITAL LETTER S WITH ACUTE
	"{\\'s}"                          : "\u015B", // LATIN SMALL LETTER S WITH ACUTE
	"{\\^S}"                          : "\u015C", // LATIN CAPITAL LETTER S WITH CIRCUMFLEX
	"{\\^s}"                          : "\u015D", // LATIN SMALL LETTER S WITH CIRCUMFLEX
	"{\\c S}"                          : "\u015E", // LATIN CAPITAL LETTER S WITH CEDILLA
	"{\\c s}"                          : "\u015F", // LATIN SMALL LETTER S WITH CEDILLA
	"{\\v S}"                          : "\u0160", // LATIN CAPITAL LETTER S WITH CARON
	"{\\v s}"                          : "\u0161", // LATIN SMALL LETTER S WITH CARON
	"{\\c T}"                          : "\u0162", // LATIN CAPITAL LETTER T WITH CEDILLA
	"{\\c t}"                          : "\u0163", // LATIN SMALL LETTER T WITH CEDILLA
	"{\\v T}"                          : "\u0164", // LATIN CAPITAL LETTER T WITH CARON
	"{\\v t}"                          : "\u0165", // LATIN SMALL LETTER T WITH CARON
	"{\\~U}"                          : "\u0168", // LATIN CAPITAL LETTER U WITH TILDE
	"{\\~u}"                          : "\u0169", // LATIN SMALL LETTER U WITH TILDE
	"{\\=U}"                          : "\u016A", // LATIN CAPITAL LETTER U WITH MACRON
	"{\\=u}"                          : "\u016B", // LATIN SMALL LETTER U WITH MACRON
	"{\\u U}"                          : "\u016C", // LATIN CAPITAL LETTER U WITH BREVE
	"{\\u u}"                          : "\u016D", // LATIN SMALL LETTER U WITH BREVE
	"{\\H U}"                          : "\u0170", // LATIN CAPITAL LETTER U WITH DOUBLE ACUTE
	"{\\H u}"                          : "\u0171", // LATIN SMALL LETTER U WITH DOUBLE ACUTE
	"{\\k U}"                          : "\u0172", // LATIN CAPITAL LETTER U WITH OGONEK
	"{\\k u}"                          : "\u0173", // LATIN SMALL LETTER U WITH OGONEK
	"{\\^W}"                          : "\u0174", // LATIN CAPITAL LETTER W WITH CIRCUMFLEX
	"{\\^w}"                          : "\u0175", // LATIN SMALL LETTER W WITH CIRCUMFLEX
	"{\\^Y}"                          : "\u0176", // LATIN CAPITAL LETTER Y WITH CIRCUMFLEX
	"{\\^y}"                          : "\u0177", // LATIN SMALL LETTER Y WITH CIRCUMFLEX
	"{\\\"Y}"                         : "\u0178", // LATIN CAPITAL LETTER Y WITH DIAERESIS
	"{\\'Z}"                          : "\u0179", // LATIN CAPITAL LETTER Z WITH ACUTE
	"{\\'z}"                          : "\u017A", // LATIN SMALL LETTER Z WITH ACUTE
	"{\\.Z}"                          : "\u017B", // LATIN CAPITAL LETTER Z WITH DOT ABOVE
	"{\\.z}"                          : "\u017C", // LATIN SMALL LETTER Z WITH DOT ABOVE
	"{\\v Z}"                          : "\u017D", // LATIN CAPITAL LETTER Z WITH CARON
	"{\\v z}"                          : "\u017E", // LATIN SMALL LETTER Z WITH CARON
	"{\\v A}"                          : "\u01CD", // LATIN CAPITAL LETTER A WITH CARON
	"{\\v a}"                          : "\u01CE", // LATIN SMALL LETTER A WITH CARON
	"{\\v I}"                          : "\u01CF", // LATIN CAPITAL LETTER I WITH CARON
	"{\\v i}"                          : "\u01D0", // LATIN SMALL LETTER I WITH CARON
	"{\\v O}"                          : "\u01D1", // LATIN CAPITAL LETTER O WITH CARON
	"{\\v o}"                          : "\u01D2", // LATIN SMALL LETTER O WITH CARON
	"{\\v U}"                          : "\u01D3", // LATIN CAPITAL LETTER U WITH CARON
	"{\\v u}"                          : "\u01D4", // LATIN SMALL LETTER U WITH CARON
	"{\\v G}"                          : "\u01E6", // LATIN CAPITAL LETTER G WITH CARON
	"{\\v g}"                          : "\u01E7", // LATIN SMALL LETTER G WITH CARON
	"{\\v K}"                          : "\u01E8", // LATIN CAPITAL LETTER K WITH CARON
	"{\\v k}"                          : "\u01E9", // LATIN SMALL LETTER K WITH CARON
	"{\\k O}"                          : "\u01EA", // LATIN CAPITAL LETTER O WITH OGONEK
	"{\\k o}"                          : "\u01EB", // LATIN SMALL LETTER O WITH OGONEK
	"{\\v j}"                          : "\u01F0", // LATIN SMALL LETTER J WITH CARON
	"{\\'G}"                          : "\u01F4", // LATIN CAPITAL LETTER G WITH ACUTE
	"{\\'g}"                          : "\u01F5", // LATIN SMALL LETTER G WITH ACUTE
	"{\\.B}"                          : "\u1E02", // LATIN CAPITAL LETTER B WITH DOT ABOVE
	"{\\.b}"                          : "\u1E03", // LATIN SMALL LETTER B WITH DOT ABOVE
	"{\\d B}"                          : "\u1E04", // LATIN CAPITAL LETTER B WITH DOT BELOW
	"{\\d b}"                          : "\u1E05", // LATIN SMALL LETTER B WITH DOT BELOW
	"{\\b B}"                          : "\u1E06", // LATIN CAPITAL LETTER B WITH LINE BELOW
	"{\\b b}"                          : "\u1E07", // LATIN SMALL LETTER B WITH LINE BELOW
	"{\\.D}"                          : "\u1E0A", // LATIN CAPITAL LETTER D WITH DOT ABOVE
	"{\\.d}"                          : "\u1E0B", // LATIN SMALL LETTER D WITH DOT ABOVE
	"{\\d D}"                          : "\u1E0C", // LATIN CAPITAL LETTER D WITH DOT BELOW
	"{\\d d}"                          : "\u1E0D", // LATIN SMALL LETTER D WITH DOT BELOW
	"{\\b D}"                          : "\u1E0E", // LATIN CAPITAL LETTER D WITH LINE BELOW
	"{\\b d}"                          : "\u1E0F", // LATIN SMALL LETTER D WITH LINE BELOW
	"{\\c D}"                          : "\u1E10", // LATIN CAPITAL LETTER D WITH CEDILLA
	"{\\c d}"                          : "\u1E11", // LATIN SMALL LETTER D WITH CEDILLA
	"{\\.F}"                          : "\u1E1E", // LATIN CAPITAL LETTER F WITH DOT ABOVE
	"{\\.f}"                          : "\u1E1F", // LATIN SMALL LETTER F WITH DOT ABOVE
	"{\\=G}"                          : "\u1E20", // LATIN CAPITAL LETTER G WITH MACRON
	"{\\=g}"                          : "\u1E21", // LATIN SMALL LETTER G WITH MACRON
	"{\\.H}"                          : "\u1E22", // LATIN CAPITAL LETTER H WITH DOT ABOVE
	"{\\.h}"                          : "\u1E23", // LATIN SMALL LETTER H WITH DOT ABOVE
	"{\\d H}"                          : "\u1E24", // LATIN CAPITAL LETTER H WITH DOT BELOW
	"{\\d h}"                          : "\u1E25", // LATIN SMALL LETTER H WITH DOT BELOW
	"{\\\"H}"                         : "\u1E26", // LATIN CAPITAL LETTER H WITH DIAERESIS
	"{\\\"h}"                         : "\u1E27", // LATIN SMALL LETTER H WITH DIAERESIS
	"{\\c H}"                          : "\u1E28", // LATIN CAPITAL LETTER H WITH CEDILLA
	"{\\c h}"                          : "\u1E29", // LATIN SMALL LETTER H WITH CEDILLA
	"{\\'K}"                          : "\u1E30", // LATIN CAPITAL LETTER K WITH ACUTE
	"{\\'k}"                          : "\u1E31", // LATIN SMALL LETTER K WITH ACUTE
	"{\\d K}"                          : "\u1E32", // LATIN CAPITAL LETTER K WITH DOT BELOW
	"{\\d k}"                          : "\u1E33", // LATIN SMALL LETTER K WITH DOT BELOW
	"{\\b K}"                          : "\u1E34", // LATIN CAPITAL LETTER K WITH LINE BELOW
	"{\\b k}"                          : "\u1E35", // LATIN SMALL LETTER K WITH LINE BELOW
	"{\\d L}"                          : "\u1E36", // LATIN CAPITAL LETTER L WITH DOT BELOW
	"{\\d l}"                          : "\u1E37", // LATIN SMALL LETTER L WITH DOT BELOW
	"{\\b L}"                          : "\u1E3A", // LATIN CAPITAL LETTER L WITH LINE BELOW
	"{\\b l}"                          : "\u1E3B", // LATIN SMALL LETTER L WITH LINE BELOW
	"{\\'M}"                          : "\u1E3E", // LATIN CAPITAL LETTER M WITH ACUTE
	"{\\'m}"                          : "\u1E3F", // LATIN SMALL LETTER M WITH ACUTE
	"{\\.M}"                          : "\u1E40", // LATIN CAPITAL LETTER M WITH DOT ABOVE
	"{\\.m}"                          : "\u1E41", // LATIN SMALL LETTER M WITH DOT ABOVE
	"{\\d M}"                          : "\u1E42", // LATIN CAPITAL LETTER M WITH DOT BELOW
	"{\\d m}"                          : "\u1E43", // LATIN SMALL LETTER M WITH DOT BELOW
	"{\\.N}"                          : "\u1E44", // LATIN CAPITAL LETTER N WITH DOT ABOVE
	"{\\.n}"                          : "\u1E45", // LATIN SMALL LETTER N WITH DOT ABOVE
	"{\\d N}"                          : "\u1E46", // LATIN CAPITAL LETTER N WITH DOT BELOW
	"{\\d n}"                          : "\u1E47", // LATIN SMALL LETTER N WITH DOT BELOW
	"{\\b N}"                          : "\u1E48", // LATIN CAPITAL LETTER N WITH LINE BELOW
	"{\\b n}"                          : "\u1E49", // LATIN SMALL LETTER N WITH LINE BELOW
	"{\\'P}"                          : "\u1E54", // LATIN CAPITAL LETTER P WITH ACUTE
	"{\\'p}"                          : "\u1E55", // LATIN SMALL LETTER P WITH ACUTE
	"{\\.P}"                          : "\u1E56", // LATIN CAPITAL LETTER P WITH DOT ABOVE
	"{\\.p}"                          : "\u1E57", // LATIN SMALL LETTER P WITH DOT ABOVE
	"{\\.R}"                          : "\u1E58", // LATIN CAPITAL LETTER R WITH DOT ABOVE
	"{\\.r}"                          : "\u1E59", // LATIN SMALL LETTER R WITH DOT ABOVE
	"{\\d R}"                          : "\u1E5A", // LATIN CAPITAL LETTER R WITH DOT BELOW
	"{\\d r}"                          : "\u1E5B", // LATIN SMALL LETTER R WITH DOT BELOW
	"{\\b R}"                          : "\u1E5E", // LATIN CAPITAL LETTER R WITH LINE BELOW
	"{\\b r}"                          : "\u1E5F", // LATIN SMALL LETTER R WITH LINE BELOW
	"{\\.S}"                          : "\u1E60", // LATIN CAPITAL LETTER S WITH DOT ABOVE
	"{\\.s}"                          : "\u1E61", // LATIN SMALL LETTER S WITH DOT ABOVE
	"{\\d S}"                          : "\u1E62", // LATIN CAPITAL LETTER S WITH DOT BELOW
	"{\\d s}"                          : "\u1E63", // LATIN SMALL LETTER S WITH DOT BELOW
	"{\\.T}"                          : "\u1E6A", // LATIN CAPITAL LETTER T WITH DOT ABOVE
	"{\\.t}"                          : "\u1E6B", // LATIN SMALL LETTER T WITH DOT ABOVE
	"{\\d T}"                          : "\u1E6C", // LATIN CAPITAL LETTER T WITH DOT BELOW
	"{\\d t}"                          : "\u1E6D", // LATIN SMALL LETTER T WITH DOT BELOW
	"{\\b T}"                          : "\u1E6E", // LATIN CAPITAL LETTER T WITH LINE BELOW
	"{\\b t}"                          : "\u1E6F", // LATIN SMALL LETTER T WITH LINE BELOW
	"{\\~V}"                          : "\u1E7C", // LATIN CAPITAL LETTER V WITH TILDE
	"{\\~v}"                          : "\u1E7D", // LATIN SMALL LETTER V WITH TILDE
	"{\\d V}"                          : "\u1E7E", // LATIN CAPITAL LETTER V WITH DOT BELOW
	"{\\d v}"                          : "\u1E7F", // LATIN SMALL LETTER V WITH DOT BELOW
	"{\\`W}"                          : "\u1E80", // LATIN CAPITAL LETTER W WITH GRAVE
	"{\\`w}"                          : "\u1E81", // LATIN SMALL LETTER W WITH GRAVE
	"{\\'W}"                          : "\u1E82", // LATIN CAPITAL LETTER W WITH ACUTE
	"{\\'w}"                          : "\u1E83", // LATIN SMALL LETTER W WITH ACUTE
	"{\\\"W}"                         : "\u1E84", // LATIN CAPITAL LETTER W WITH DIAERESIS
	"{\\\"w}"                         : "\u1E85", // LATIN SMALL LETTER W WITH DIAERESIS
	"{\\.W}"                          : "\u1E86", // LATIN CAPITAL LETTER W WITH DOT ABOVE
	"{\\.w}"                          : "\u1E87", // LATIN SMALL LETTER W WITH DOT ABOVE
	"{\\d W}"                          : "\u1E88", // LATIN CAPITAL LETTER W WITH DOT BELOW
	"{\\d w}"                          : "\u1E89", // LATIN SMALL LETTER W WITH DOT BELOW
	"{\\.X}"                          : "\u1E8A", // LATIN CAPITAL LETTER X WITH DOT ABOVE
	"{\\.x}"                          : "\u1E8B", // LATIN SMALL LETTER X WITH DOT ABOVE
	"{\\\"X}"                         : "\u1E8C", // LATIN CAPITAL LETTER X WITH DIAERESIS
	"{\\\"x}"                         : "\u1E8D", // LATIN SMALL LETTER X WITH DIAERESIS
	"{\\.Y}"                          : "\u1E8E", // LATIN CAPITAL LETTER Y WITH DOT ABOVE
	"{\\.y}"                          : "\u1E8F", // LATIN SMALL LETTER Y WITH DOT ABOVE
	"{\\^Z}"                          : "\u1E90", // LATIN CAPITAL LETTER Z WITH CIRCUMFLEX
	"{\\^z}"                          : "\u1E91", // LATIN SMALL LETTER Z WITH CIRCUMFLEX
	"{\\d Z}"                          : "\u1E92", // LATIN CAPITAL LETTER Z WITH DOT BELOW
	"{\\d z}"                          : "\u1E93", // LATIN SMALL LETTER Z WITH DOT BELOW
	"{\\b Z}"                          : "\u1E94", // LATIN CAPITAL LETTER Z WITH LINE BELOW
	"{\\b z}"                          : "\u1E95", // LATIN SMALL LETTER Z WITH LINE BELOW
	"{\\b h}"                          : "\u1E96", // LATIN SMALL LETTER H WITH LINE BELOW
	"{\\\"t}"                         : "\u1E97", // LATIN SMALL LETTER T WITH DIAERESIS
	"{\\d A}"                          : "\u1EA0", // LATIN CAPITAL LETTER A WITH DOT BELOW
	"{\\d a}"                          : "\u1EA1", // LATIN SMALL LETTER A WITH DOT BELOW
	"{\\d E}"                          : "\u1EB8", // LATIN CAPITAL LETTER E WITH DOT BELOW
	"{\\d e}"                          : "\u1EB9", // LATIN SMALL LETTER E WITH DOT BELOW
	"{\\~E}"                          : "\u1EBC", // LATIN CAPITAL LETTER E WITH TILDE
	"{\\~e}"                          : "\u1EBD", // LATIN SMALL LETTER E WITH TILDE
	"{\\d I}"                          : "\u1ECA", // LATIN CAPITAL LETTER I WITH DOT BELOW
	"{\\d i}"                          : "\u1ECB", // LATIN SMALL LETTER I WITH DOT BELOW
	"{\\d O}"                          : "\u1ECC", // LATIN CAPITAL LETTER O WITH DOT BELOW
	"{\\d o}"                          : "\u1ECD", // LATIN SMALL LETTER O WITH DOT BELOW
	"{\\d U}"                          : "\u1EE4", // LATIN CAPITAL LETTER U WITH DOT BELOW
	"{\\d u}"                          : "\u1EE5", // LATIN SMALL LETTER U WITH DOT BELOW
	"{\\`Y}"                          : "\u1EF2", // LATIN CAPITAL LETTER Y WITH GRAVE
	"{\\`y}"                          : "\u1EF3", // LATIN SMALL LETTER Y WITH GRAVE
	"{\\d Y}"                          : "\u1EF4", // LATIN CAPITAL LETTER Y WITH DOT BELOW
	"{\\d y}"                          : "\u1EF5", // LATIN SMALL LETTER Y WITH DOT BELOW
	"{\\~Y}"                          : "\u1EF8", // LATIN CAPITAL LETTER Y WITH TILDE
	"{\\~y}"                          : "\u1EF9", // LATIN SMALL LETTER Y WITH TILDE
	"{\\~}"                           : "\u223C", // TILDE OPERATOR
	"~"                               : "\u00A0" // NO-BREAK SPACE
};

var alwaysMap = {
	"|":"{\\textbar}",
	"<":"{\\textless}",
	">":"{\\textgreater}",
	"~":"{\\textasciitilde}",
	"^":"{\\textasciicircum}",
	"\\":"{\\textbackslash}",
	"{" : "\\{",
	"}" : "\\}"
};


var strings = {};
var keyRe = /[a-zA-Z0-9\-]/;
var keywordSplitOnSpace = true;
var keywordDelimRe = '\\s*[,;]\\s*';
var keywordDelimReFlags = '';

function setKeywordSplitOnSpace( val ) {
	keywordSplitOnSpace = val;
}

function setKeywordDelimRe( val, flags ) {
	//expect string, but it could be RegExp
	if(typeof(val) != 'string') {
		keywordDelimRe = val.toString().slice(1, val.toString().lastIndexOf('/'));
		keywordDelimReFlags = val.toString().slice(val.toString().lastIndexOf('/')+1);
	} else {
		keywordDelimRe = val;
		keywordDelimReFlags = flags;
	}
}

function processField(item, field, value) {
	if(Zotero.Utilities.trim(value) == '') return null;
	if(fieldMap[field]) {
		item[fieldMap[field]] = value;
	} else if(inputFieldMap[field]) {
		item[inputFieldMap[field]] = value;
	} else if(field == "journal") {
		if(item.publicationTitle) {
			item.journalAbbreviation = value;
		} else {
			item.publicationTitle = value;
		}
	} else if(field == "fjournal") {
		if(item.publicationTitle) {
			// move publicationTitle to abbreviation
			item.journalAbbreviation = value;
		}
		item.publicationTitle = value;
	} else if(field == "author" || field == "editor" || field == "translator") {
		// parse authors/editors/translators
		var names = value.split(/ and /i); // now case insensitive
		for(var i in names) {
			var name = names[i];
			// skip empty names
			if (name.trim() == '') {
				continue;
			}
			// Names in BibTeX can have three commas
			pieces = name.split(',');
			var creator = {};
			if (pieces.length > 1) {
				creator.firstName = pieces.pop().trim();
				creator.lastName = pieces.join(',').trim();
				creator.creatorType = field;
			} else {
				creator = Zotero.Utilities.cleanAuthor(name, field, false);
			}
			item.creators.push(creator);
		}
	} else if(field == "institution" || field == "organization") {
		item.backupPublisher = value;
	} else if(field == "number"){ // fix for techreport
		if (item.itemType == "report") {
			item.reportNumber = value;
		} else if (item.itemType == "book" || item.itemType == "bookSection") {
			item.seriesNumber = value;
		} else if (item.itemType == "patent"){
			item.patentNumber = value;
		} else {
			item.issue = value;
		}
	} else if(field == "month") {
		var monthIndex = months.indexOf(value.toLowerCase());
		if(monthIndex != -1) {
			value = Zotero.Utilities.formatDate({month:monthIndex});
		} else {
			value += " ";
		}
		
		if(item.date) {
			if(value.indexOf(item.date) != -1) {
				// value contains year and more
				item.date = value;
			} else {
				item.date = value+item.date;
			}
		} else {
			item.date = value;
		}
	} else if(field == "year") {
		if(item.date) {
			if(item.date.indexOf(value) == -1) {
				// date does not already contain year
				item.date += value;
			}
		} else {
			item.date = value;
		}
	} else if(field == "pages") {
		if (item.itemType == "book" || item.itemType == "thesis" || item.itemType == "manuscript") {
			item.numPages = value;
		}
		else {
			item.pages = value.replace(/--/g, "-");
		}
	} else if(field == "note") {
		item.extra += "\n"+value;
	} else if(field == "howpublished") {
		if(value.length >= 7) {
			var str = value.substr(0, 7);
			if(str == "http://" || str == "https:/" || str == "mailto:") {
				item.url = value;
			} else {
				item.extra += "\nPublished: "+value;
			}
		}
	
	} 
	//accept lastchecked or urldate for access date. These should never both occur. 
	//If they do we don't know which is better so we might as well just take the second one
	else if (field == "lastchecked"|| field == "urldate"){
		item.accessDate = value;
	}
	else if(field == "keywords" || field == "keyword") {
		var re = new RegExp(keywordDelimRe, keywordDelimReFlags);
		if(!value.match(re) && keywordSplitOnSpace) {
			// keywords/tags
			item.tags = value.split(/\s+/);
		} else {
			item.tags = value.split(re);
		}
	} else if (field == "comment" || field == "annote" || field == "review") {
		item.notes.push({note:Zotero.Utilities.text2html(value)});
	} else if (field == "pdf" || field == "path" /*Papers2 compatibility*/) {
		item.attachments = [{path:value, mimeType:"application/pdf"}];
	} else if (field == "sentelink") { // the reference manager 'Sente' has a unique file scheme in exported BibTeX
		item.attachments = [{path:value.split(",")[0], mimeType:"application/pdf"}];
	} else if (field == "file") {
		var attachments = value.split(";");
		for(var i in attachments){
			var attachment = attachments[i];
			var parts = attachment.split(":");
			var filetitle = parts[0];
			var filepath = parts[1];
			if (filepath.trim() === '') continue; // skip empty entries
			var filetype = parts[2];

      if (!filetype) { throw value; }

			if (filetitle.length == 0) {
				filetitle = "Attachment";
			}
			if (filetype.match(/pdf/i)) {
				item.attachments.push({path:filepath, mimeType:"application/pdf", title:filetitle});
			} else {
				item.attachments.push({path:filepath, title:filetitle});
			}
		}
	}
}

function getFieldValue(read) {
	var value = "";
	// now, we have the first character of the field
	if(read == "{") {
		// character is a brace
		var openBraces = 1;
		while(read = Zotero.read(1)) {
			if(read == "{" && value[value.length-1] != "\\") {
				openBraces++;
				value += "{";
			} else if(read == "}" && value[value.length-1] != "\\") {
				openBraces--;
				if(openBraces == 0) {
					break;
				} else {
					value += "}";
				}
			} else {
				value += read;
			}
		}
		
	} else if(read == '"') {
		var openBraces = 0;
		while(read = Zotero.read(1)) {
			if(read == "{" && value[value.length-1] != "\\") {
				openBraces++;
				value += "{";
			} else if(read == "}" && value[value.length-1] != "\\") {
				openBraces--;
				value += "}";
			} else if(read == '"' && openBraces == 0) {
				break;
			} else {
				value += read;
			}
		}
	}
	
	if(value.length > 1) {
		// replace accented characters (yucky slow)
		value = value.replace(/{?(\\[`"'^~=a-z]){?\\?([A-Za-z])}/g, "{$1$2}");
		//convert tex markup into permitted HTML
		value = mapTeXmarkup(value);
		for (var mapped in reversemappingTable) { // really really slow!
			var unicode = reversemappingTable[mapped];
			while(value.indexOf(mapped) !== -1) {
				Zotero.debug("Replace " + mapped + " in " + value + " with " + unicode);
				value = value.replace(mapped, unicode);
			}
			mapped = mapped.replace(/[{}]/g, "");
			while(value.indexOf(mapped) !== -1) {
				//Z.debug(value)
				Zotero.debug("Replace(2) " + mapped + " in " + value + " with " + unicode);
				value = value.replace(mapped, unicode);
			}
		}

		// kill braces
		value = value.replace(/([^\\])[{}]+/g, "$1");
		if(value[0] == "{") {
			value = value.substr(1);
		}
		
		// chop off backslashes
		value = value.replace(/([^\\])\\([#$%&~_^\\{}])/g, "$1$2");
		value = value.replace(/([^\\])\\([#$%&~_^\\{}])/g, "$1$2");
		if(value[0] == "\\" && "#$%&~_^\\{}".indexOf(value[1]) != -1) {
			value = value.substr(1);
		}
		if(value[value.length-1] == "\\" && "#$%&~_^\\{}".indexOf(value[value.length-2]) != -1) {
			value = value.substr(0, value.length-1);
		}
		value = value.replace(/\\\\/g, "\\");
		value = value.replace(/\s+/g, " ");
	}

	return value;
}

function jabrefSplit(str, sep) {
	var quoted = false;
	var result = [];

	str = str.split('');
	while (str.length > 0) {
		if (result.length == 0) { result = ['']; }

		if (str[0] == sep) {
			str.shift();
			result.push('');
		} else {
			if (str[0] == '\\') { str.shift(); }
			result[result.length - 1] += str.shift();
		}
	}
	return result;
}

function jabrefCollect(arr, func) {
	if (arr == null) { return []; }

	var result = [];

	for (var i = 0; i < arr.length; i++) {
		if (func(arr[i])) {
			result.push(arr[i]);
		}
	}
	return result;
}

function processComment() {
	var comment = "";
	var read;
	var collectionPath = [];
	var parentCollection, collection;

	while(read = Zotero.read(1)) {
		if (read == "}") { break; } // JabRef ought to escape '}' but doesn't; embedded '}' chars will break the import just as it will on JabRef itself
		comment += read;
	}

	if (comment == 'jabref-meta: groupsversion:3;') {
		jabref.format = 3;
		return;
	}

	if (comment.indexOf('jabref-meta: groupstree:') == 0) {
		if (jabref.format != 3) {
			Zotero.debug("jabref: fatal: unsupported group format: " + jabref.format);
			return;
		}
		comment = comment.replace(/^jabref-meta: groupstree:/, '').replace(/[\r\n]/gm, '')

		var records = jabrefSplit(comment, ';');
		while (records.length > 0) {
			var record = records.shift();
			var keys = jabrefSplit(record, ';');
			if (keys.length < 2) { continue; }

			var record = {id: keys.shift()};
			record.data = record.id.match(/^([0-9]) ([^:]*):(.*)/);
			if (record.data == null) {
				Zotero.debug("jabref: fatal: unexpected non-match for group " + record.id);
				return;
			}
			record.level = parseInt(record.data[1]);
			record.type = record.data[2]
			record.name = record.data[3]
			record.intersection = keys.shift(); // 0 = independent, 1 = intersection, 2 = union

			if (isNaN(record.level)) {
				Zotero.debug("jabref: fatal: unexpected record level in " + record.id);
				return;
			}

			if (record.level == 0) { continue; }
			if (record.type != 'ExplicitGroup') {
				Zotero.debug("jabref: fatal: group type " + record.type + " is not supported");
				return;
			}

			collectionPath = collectionPath.slice(0, record.level - 1).concat([record.name]);
			Zotero.debug("jabref: locating level " + record.level + ": " + collectionPath.join('/'));

			if (jabref.root.hasOwnProperty(collectionPath[0])) {
				collection = jabref.root[collectionPath[0]];
				Zotero.debug("jabref: root " + collection.name + " found");
			} else {
				collection = new Zotero.Collection();
				collection.name = collectionPath[0];
				collection.type = 'collection';
				collection.children = [];
				jabref.root[collectionPath[0]] = collection;
				Zotero.debug("jabref: root " + collection.name + " created");
			}
			parentCollection = null;

			for (var i = 1; i < collectionPath.length; i++) {
				var path = collectionPath[i];
				Zotero.debug("jabref: looking for child " + path + " under " + collection.name);

				var child = jabrefCollect(collection.children, function(n) { return (n.name == path)})
				if (child.length != 0) {
					child = child[0]
					Zotero.debug("jabref: child " + child.name + " found under " + collection.name);
				} else {
					child = new Zotero.Collection();
					child.name = path;
					child.type = 'collection';
					child.children = [];

					collection.children.push(child);
					Zotero.debug("jabref: child " + child.name + " created under " + collection.name);
				}

				parentCollection = collection;
				collection = child;
			}

			if (parentCollection) {
				parentCollection = jabrefCollect(parentCollection.children, function(n) { return (n.type == 'item') });
			}

			if (record.intersection == '2' && parentCollection) { // union with parent
				collection.children = parentCollection;
			}

			while(keys.length > 0) {
				key = keys.shift();
				if (key != '') {
					Zotero.debug('jabref: adding ' + key + ' to ' + collection.name);
					collection.children.push({type: 'item', id: key});
				}
			}

			if (parentCollection && record.intersection == '1') { // intersection with parent
				collection.children = jabrefMap(collection.children, function(n) { parentCollection.indexOf(n) !== -1; });
			}
		}
	}
}

function beginRecord(type, closeChar) {
	type = Zotero.Utilities.trimInternal(type.toLowerCase());
	if(type != "string") {
		var zoteroType = bibtex2zoteroTypeMap[type];
		if (!zoteroType) {
			Zotero.debug("discarded item from BibTeX; type was "+type);
			return;
		}
		var item = new Zotero.Item(zoteroType);
		
		item.extra = "";
	}
	
	var field = "";
	
	// by setting dontRead to true, we can skip a read on the next iteration
	// of this loop. this is useful after we read past the end of a string.
	var dontRead = false;
	
	while(dontRead || (read = Zotero.read(1))) {
		dontRead = false;
		
		if(read == "=") {								// equals begin a field
		// read whitespace
			var read = Zotero.read(1);
			while(" \n\r\t".indexOf(read) != -1) {
				read = Zotero.read(1);
			}
			
			if(keyRe.test(read)) {
				// read numeric data here, since we might get an end bracket
				// that we should care about
				value = "";
				value += read;
				
				// character is a number
				while((read = Zotero.read(1)) && keyRe.test(read)) {
					value += read;
				}
				
				// don't read the next char; instead, process the character
				// we already read past the end of the string
				dontRead = true;
				
				// see if there's a defined string
				if(strings[value]) value = strings[value];
			} else {
				var value = getFieldValue(read);
			}
			
			if(item) {
				processField(item, field.toLowerCase(), value);
			} else if(type == "string") {
				strings[field] = value;
			}
			field = "";
		} else if(read == ",") {						// commas reset
			if (item.itemID == null) {
				item.itemID = field; // itemID = citekey
			}
			field = "";
		} else if(read == closeChar) {
			if(item) {
				if(item.extra) {
          item.extra += "\n";
        } else {
          item.extra = '';
        }
        item.extra += 'bibtex: ' + item.itemID;

				item.complete();
			}
			return;
		} else if(" \n\r\t".indexOf(read) == -1) {		// skip whitespace
			field += read;
		}
	}
}

function doImport() {
	var read = "", text = "", recordCloseElement = false;
	var type = false;
	
	while(read = Zotero.read(1)) {
		if(read == "@") {
			type = "";
		} else if(type !== false) {
			if(type == "comment") {
				processComment();
				type = false;
			} else if(read == "{") {		// possible open character
				beginRecord(type, "}");
				type = false;
			} else if(read == "(") {		// possible open character
				beginRecord(type, ")");
				type = false;
			} else if(/[a-zA-Z0-9-_]/.test(read)) {
				type += read;
			}
		}
	}

	for (var key in jabref.root) {
		if (jabref.root.hasOwnProperty(key)) { jabref.root[key].complete(); }
	}
}

// some fields are, in fact, macros.  If that is the case then we should not put the
// data in the braces as it will cause the macros to not expand properly
function escape(value) {
	if (!value && typeof value != "number") { return; }

  if (value instanceof Array) {
    if (value.length == 0) { return; }
    if (value.length == 1) { return escape(value[0]); }
    return '{' + [escape(v) for (v of value)].join(' and ') + '}';
  }
  if (typeof value == 'number') { return '' + value; }
  return '{' + _unicode.to_latex('' + value) + '}';
}
function writeField(field, value) {
	if (!value && typeof value != "number") return;
	Zotero.write(",\n\t" + field + " = " + value);
}

function tidyAccents(s) {
	var r=s.toLowerCase();

	// XXX Remove conditional when we drop Zotero 2.1.x support
	// This is supported in Zotero 3.0 and higher
	if (ZU.removeDiacritics !== undefined)
		r = ZU.removeDiacritics(r, true);
	else {
	// We fall back on the replacement list we used previously
		r = r.replace(new RegExp("[ä]", 'g'),"ae");
		r = r.replace(new RegExp("[ö]", 'g'),"oe");
		r = r.replace(new RegExp("[ü]", 'g'),"ue");
		r = r.replace(new RegExp("[àáâãå]", 'g'),"a");
		r = r.replace(new RegExp("æ", 'g'),"ae");
		r = r.replace(new RegExp("ç", 'g'),"c");
		r = r.replace(new RegExp("[èéêë]", 'g'),"e");
		r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
		r = r.replace(new RegExp("ñ", 'g'),"n");                            
		r = r.replace(new RegExp("[òóôõ]", 'g'),"o");
		r = r.replace(new RegExp("œ", 'g'),"oe");
		r = r.replace(new RegExp("[ùúû]", 'g'),"u");
		r = r.replace(new RegExp("[ýÿ]", 'g'),"y");
	}

	return r;
};

var numberRe = /^[0-9]+/;
// Below is a list of words that should not appear as part of the citation key
// in includes the indefinite articles of English, German, French and Spanish, as well as a small set of English prepositions whose 
// force is more grammatical than lexical, i.e. which are likely to strike many as 'insignificant'.
// The assumption is that most who want a title word in their key would prefer the first word of significance.
var citeKeyTitleBannedRe = /\b(a|an|the|some|from|on|in|to|of|do|with|der|die|das|ein|eine|einer|eines|einem|einen|un|une|la|le|l\'|el|las|los|al|uno|una|unos|unas|de|des|del|d\')(\s+|\b)/g;
var citeKeyConversionsRe = /%([a-zA-Z])/;
var citeKeyCleanRe = /[^a-z0-9\!\$\&\*\+\-\.\/\:\;\<\>\?\[\]\^\_\`\|]+/g;

var citeKeyConversions = {
	"a":function (flags, item) {
		if(item.creators && item.creators[0] && item.creators[0].lastName) {
			return item.creators[0].lastName.toLowerCase().replace(/ /g,"_").replace(/,/g,"");
		}
		return "";
	},
	"t":function (flags, item) {
		if (item["title"]) {
			return item["title"].toLowerCase().replace(citeKeyTitleBannedRe, "").split(/\s+/g)[0];
		}
		return "";
	},
	"y":function (flags, item) {
		if(item.date) {
			var date = Zotero.Utilities.strToDate(item.date);
			if(date.year && numberRe.test(date.year)) {
				return date.year;
			}
		}
		return "????";
	}
}


var bibtexKey = /bibtex:\s*([^\s\r\n]+)/;
function embeddedCiteKey(item, citekeys) {
  if (!item.extra) { return null; }

  var m = bibtexKey.exec(item.extra);
  if (!m) { return null; }

  item.extra = item.extra.replace(m[0], '');
  return m[1];
}

function buildCiteKey (item,citekeys) {
	var basekey = embeddedCiteKey(item, citekeys);

  if (!basekey) {
    basekey = "";
	var counter = 0;
	citeKeyFormatRemaining = citeKeyFormat;
	while (citeKeyConversionsRe.test(citeKeyFormatRemaining)) {
		if (counter > 100) {
			Zotero.debug("Pathological BibTeX format: " + citeKeyFormat);
			break;
		}
		var m = citeKeyFormatRemaining.match(citeKeyConversionsRe);
		if (m.index > 0) {
			//add data before the conversion match to basekey
			basekey = basekey + citeKeyFormatRemaining.substr(0, m.index);
		}
		var flags = ""; // for now
		var f = citeKeyConversions[m[1]];
		if (typeof(f) == "function") {
			var value = f(flags, item);
			Zotero.debug("Got value " + value + " for %" + m[1]);
			//add conversion to basekey
			basekey = basekey + value;
		}
		citeKeyFormatRemaining = citeKeyFormatRemaining.substr(m.index + m.length);
		counter++;
	}
	if (citeKeyFormatRemaining.length > 0) {
		basekey = basekey + citeKeyFormatRemaining;
	}

	// for now, remove any characters not explicitly known to be allowed;
	// we might want to allow UTF-8 citation keys in the future, depending
	// on implementation support.
	//
	// no matter what, we want to make sure we exclude
	// " # % ' ( ) , = { } ~ and backslash
	// however, we want to keep the base characters 

	basekey = tidyAccents(basekey);
	basekey = basekey.replace(citeKeyCleanRe, "");
  }

	var citekey = basekey;
	var i = 0;
	while(citekeys[citekey]) {
		i++;
		citekey = basekey + "-" + i;
	}
	citekeys[citekey] = true;
	return citekey;
}

function doExport() {
	//Zotero.write("% BibTeX export generated by Zotero "+Zotero.Utilities.getVersion());
	// to make sure the BOM gets ignored
	Zotero.write("\n");
	
	var first = true;
	var citekeys = new Object();
	var item;
	while(item = Zotero.nextItem()) {
		//don't export standalone notes and attachments
		if(item.itemType == "note" || item.itemType == "attachment") continue;

		// determine type
		var type = zotero2bibtexTypeMap[item.itemType];
		if (typeof(type) == "function") { type = type(item); }
		if(!type) type = "misc";
		
		// create a unique citation key
		var citekey = buildCiteKey(item, citekeys);
		
		// write citation key
		Zotero.write((first ? "" : ",\n\n") + "@"+type+"{"+citekey);
		first = false;
		
		for(var field in fieldMap) {
			if(item[fieldMap[field]]) {
				writeField(field, escape(item[fieldMap[field]]));
			}
		}

		if(item.reportNumber || item.issue || item.seriesNumber || item.patentNumber) {
			writeField("number", escape(item.reportNumber || item.issue || item.seriesNumber|| item.patentNumber));
		}
		
		if (item.accessDate){
			var accessYMD = item.accessDate.replace(/\s*\d+:\d+:\d+/, "");
			writeField("urldate", escape(accessYMD));
		}
		
		if(item.publicationTitle) {
			if(item.itemType == "bookSection" || item.itemType == "conferencePaper") {
				writeField("booktitle", escape(item.publicationTitle));
			} else if(Zotero.getOption("useJournalAbbreviation")){
				writeField("journal", escape(item.journalAbbreviation));
			} else {
				writeField("journal", escape(item.publicationTitle));
			}
		}
		
		if(item.publisher) {
			if(item.itemType == "thesis") {
				writeField("school", escape(item.publisher));
			} else if(item.itemType =="report") {
				writeField("institution", escape(item.publisher));
			} else {
				writeField("publisher", escape(item.publisher));
			}
		}
		
		if(item.creators && item.creators.length) {
			// split creators into subcategories
      var authors = [];
			var editor = [];
			var translators = [];
			var collaborators = [];
			var primaryCreatorType = Zotero.Utilities.getCreatorsForType(item.itemType)[0];
			for(var i in item.creators) {
				var creator = item.creators[i];
				var creatorString = [namepart for (namepart of [creator.lastName, creator.lastName]) if namepart].join(', ');

				if (creator.creatorType == "editor" || creator.creatorType == "seriesEditor") {
          editors.push(creatorString);
				} else if (creator.creatorType == "translator") {
					translators.push(creatorString);
				} else if (creator.creatorType == primaryCreatorType) {
					authors.push(creatorString);
				} else {
					collaborators.push(creatorString);
				}
			}

      writeField("author", escape(authors));
      writeField("editor", escape(editors));
      writeField("translator", escape(translators));
      writeField("collaborator", escape(collaborators));
		}
		
		if(item.date) {
			var date = Zotero.Utilities.strToDate(item.date);
			// need to use non-localized abbreviation
			if(typeof date.month == "number") {
				writeField("month", escape(months[date.month]));
			}
			if(date.year) {
				writeField("year", escape(date.year));
			}
		}
		
		if(item.extra) {
			writeField("note", escape(item.extra));
		}
		
		if(item.tags && item.tags.length) {
			writeField("keywords", escape(item.tags.join(', ')));
		}
		
		if(item.pages) {
			writeField("pages", escape(item.pages));
		}
		
		// Commented out, because we don't want a books number of pages in the BibTeX "pages" field for books.
		//if(item.numPages) {
		//	writeField("pages", item.numPages);
		//}
		
		/* We'll prefer url over howpublished see 
		https://forums.zotero.org/discussion/24554/bibtex-doubled-url/#Comment_157802
		
		if(item.itemType == "webpage") {
			writeField("howpublished", item.url);
		}*/
		if (item.notes && Zotero.getOption("exportNotes")) {
			for(var i in item.notes) {
				var note = item.notes[i];
				writeField("annote", escape(Zotero.Utilities.unescapeHTML(note["note"])));
			}
		}		
		
		if(item.attachments) {
			var attachments = [att.
			
			for(var i in item.attachments) {
				var attachment = item.attachments[i];
				if(Zotero.getOption("exportFileData") && attachment.saveFile) {
					attachment.saveFile(attachment.defaultPath, true);
					attachmentString += ";" + attachment.title + ":" + attachment.defaultPath + ":" + attachment.mimeType;
				} else if(attachment.localPath) {
					attachmentString += ";" + attachment.title + ":" + attachment.localPath + ":" + attachment.mimeType;
				}
			}
			
			if(attachmentString) {
				writeField("file", attachmentString.substr(1));
			}
		}
		
		Zotero.write("\n}");
	}
}

var exports = {
	"doExport": doExport,
	"doImport": doImport,
	"setKeywordDelimRe": setKeywordDelimRe,
	"setKeywordSplitOnSpace": setKeywordSplitOnSpace
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "@article{Adams2001,\nauthor = {Adams, Nancy K and DeSilva, Shanaka L and Self, Steven and Salas, Guido and Schubring, Steven and Permenter, Jason L and Arbesman, Kendra},\nfile = {:Users/heatherwright/Documents/Scientific Papers/Adams\\_Huaynaputina.pdf:pdf;::},\njournal = {Bulletin of Volcanology},\nkeywords = {Vulcanian eruptions,breadcrust,plinian},\npages = {493--518},\ntitle = {{The physical volcanology of the 1600 eruption of Huaynaputina, southern Peru}},\nvolume = {62},\nyear = {2001}\n}",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Nancy K",
						"lastName": "Adams",
						"creatorType": "author"
					},
					{
						"firstName": "Shanaka L",
						"lastName": "DeSilva",
						"creatorType": "author"
					},
					{
						"firstName": "Steven",
						"lastName": "Self",
						"creatorType": "author"
					},
					{
						"firstName": "Guido",
						"lastName": "Salas",
						"creatorType": "author"
					},
					{
						"firstName": "Steven",
						"lastName": "Schubring",
						"creatorType": "author"
					},
					{
						"firstName": "Jason L",
						"lastName": "Permenter",
						"creatorType": "author"
					},
					{
						"firstName": "Kendra",
						"lastName": "Arbesman",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Vulcanian eruptions",
					"breadcrust",
					"plinian"
				],
				"seeAlso": [],
				"attachments": [
					{
						"path": "Users/heatherwright/Documents/Scientific Papers/Adams_Huaynaputina.pdf",
						"mimeType": "application/pdf",
						"title": "Attachment"
					}
				],
				"publicationTitle": "Bulletin of Volcanology",
				"pages": "493–518",
				"title": "The physical volcanology of the 1600 eruption of Huaynaputina, southern Peru",
				"volume": "62",
				"date": "2001"
			}
		]
	},
	{
		"type": "import",
		"input": "@Book{abramowitz+stegun,\n author    = \"Milton {Abramowitz} and Irene A. {Stegun}\",\n title     = \"Handbook of Mathematical Functions with\n              Formulas, Graphs, and Mathematical Tables\",\n publisher = \"Dover\",\n year      =  1964,\n address   = \"New York\",\n edition   = \"ninth Dover printing, tenth GPO printing\"\n}\n\n@Book{Torre2008,\n author    = \"Joe Torre and Tom Verducci\",\n publisher = \"Doubleday\",\n title     = \"The Yankee Years\",\n year      =  2008,\n isbn      = \"0385527403\"\n}\n",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Milton",
						"lastName": "Abramowitz",
						"creatorType": "author"
					},
					{
						"firstName": "Irene A.",
						"lastName": "Stegun",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Handbook of Mathematical Functions with Formulas, Graphs, and Mathematical Tables",
				"publisher": "Dover",
				"date": "1964",
				"place": "New York",
				"edition": "ninth Dover printing, tenth GPO printing"
			},
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Joe",
						"lastName": "Torre",
						"creatorType": "author"
					},
					{
						"firstName": "Tom",
						"lastName": "Verducci",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"publisher": "Doubleday",
				"title": "The Yankee Years",
				"date": "2008",
				"ISBN": "0385527403"
			}
		]
	},
	{
		"type": "import",
		"input": "@INPROCEEDINGS {author:06,\n title    = {Some publication title},\n author   = {First Author and Second Author},\n crossref = {conference:06},\n pages    = {330—331},\n}\n@PROCEEDINGS {conference:06,\n editor    = {First Editor and Second Editor},\n title     = {Proceedings of the Xth Conference on XYZ},\n booktitle = {Proceedings of the Xth Conference on XYZ},\n year      = {2006},\n month     = oct,\n}",
		"items": [
			{
				"itemType": "conferencePaper",
				"creators": [
					{
						"firstName": "First",
						"lastName": "Author",
						"creatorType": "author"
					},
					{
						"firstName": "Second",
						"lastName": "Author",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Some publication title",
				"pages": "330—331"
			},
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "First",
						"lastName": "Editor",
						"creatorType": "editor"
					},
					{
						"firstName": "Second",
						"lastName": "Editor",
						"creatorType": "editor"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Proceedings of the Xth Conference on XYZ",
				"publicationTitle": "Proceedings of the Xth Conference on XYZ",
				"date": "October 2006"
			}
		]
	},
	{
		"type": "import",
		"input": "@Book{hicks2001,\n author    = \"von Hicks, III, Michael\",\n title     = \"Design of a Carbon Fiber Composite Grid Structure for the GLAST\n              Spacecraft Using a Novel Manufacturing Technique\",\n publisher = \"Stanford Press\",\n year      =  2001,\n address   = \"Palo Alto\",\n edition   = \"1st,\",\n isbn      = \"0-69-697269-4\"\n}",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Michael",
						"lastName": "von Hicks, III",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Design of a Carbon Fiber Composite Grid Structure for the GLAST Spacecraft Using a Novel Manufacturing Technique",
				"publisher": "Stanford Press",
				"date": "2001",
				"place": "Palo Alto",
				"edition": "1st,",
				"ISBN": "0-69-697269-4"
			}
		]
	},
	{
		"type": "import",
		"input": "@article{Oliveira_2009, title={USGS monitoring ecological impacts}, volume={107}, number={29}, journal={Oil & Gas Journal}, author={Oliveira, A}, year={2009}, pages={29}}",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "A",
						"lastName": "Oliveira",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "USGS monitoring ecological impacts",
				"volume": "107",
				"issue": "29",
				"publicationTitle": "Oil & Gas Journal",
				"date": "2009",
				"pages": "29"
			}
		]
	},
	{
		"type": "import",
		"input": "@article{test-ticket1661,\ntitle={non-braking space: ~; accented characters: {\\~n} and \\~{n}; tilde operator: \\~},\n} ",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "non-braking space: ; accented characters: ñ and ñ; tilde operator: ∼"
			}
		]
	},
	{
		"type": "import",
		"input": "@ARTICLE{Frit2,\n  author = {Fritz, U. and Corti, C. and P\\\"{a}ckert, M.},\n  title = {Test of markupconversion: Italics, bold, superscript, subscript, and small caps: Mitochondrial DNA$_{\\textrm{2}}$ sequences suggest unexpected phylogenetic position\n        of Corso-Sardinian grass snakes (\\textit{Natrix cetti}) and \\textbf{do not}\n        support their \\textsc{species status}, with notes on phylogeography and subspecies\n        delineation of grass snakes.},\n  journal = {Actes du $4^{\\textrm{ème}}$ Congrès Français d'Acoustique},\n  year = {2012},\n  volume = {12},\n  pages = {71-80},\n  doi = {10.1007/s13127-011-0069-8}\n}\n",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "U.",
						"lastName": "Fritz",
						"creatorType": "author"
					},
					{
						"firstName": "C.",
						"lastName": "Corti",
						"creatorType": "author"
					},
					{
						"firstName": "M.",
						"lastName": "Päckert",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Test of markupconversion: Italics, bold, superscript, subscript, and small caps: Mitochondrial DNA<sub>2</sub>$ sequences suggest unexpected phylogenetic position of Corso-Sardinian grass snakes (<i>Natrix cetti</i>) and <b>do not</b> support their <span style=\"small-caps\">species status</span>, with notes on phylogeography and subspecies delineation of grass snakes.",
				"publicationTitle": "Actes du <sup>ème</sup>$ Congrès Français d'Acoustique",
				"date": "2012",
				"volume": "12",
				"pages": "71-80",
				"DOI": "10.1007/s13127-011-0069-8"
			}
		]
	},
	{
		"type": "import",
		"input": "@misc{american_rights_at_work_public_2012,\n    title = {Public Service Research Foundation},\n\turl = {http://www.americanrightsatwork.org/blogcategory-275/},\n\turldate = {2012-07-27},\n\tauthor = {American Rights at Work},\n\tyear = {2012},\n\thowpublished = {http://www.americanrightsatwork.org/blogcategory-275/},\n}",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "American Rights at",
						"lastName": "Work",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Public Service Research Foundation",
				"url": "http://www.americanrightsatwork.org/blogcategory-275/",
				"accessDate": "2012-07-27",
				"date": "2012"
			}
		]
	}
]
/** END TEST CASES **/
