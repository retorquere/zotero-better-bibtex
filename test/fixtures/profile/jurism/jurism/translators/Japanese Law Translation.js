{
    "target": "http://www\\.japaneselawtranslation\\.go\\.jp/law/detail_main", 
    "creator": "Frank Bennett", 
    "maxVersion": "", 
    "lastUpdated": "2012-11-13 03:46:30", 
    "label": "Japanese Law Translation", 
    "priority": 100, 
    "inRepository": true, 
    "translatorType": 4, 
    "minVersion": "1.0.0b3.r1", 
    "translatorID": "8e5f8616-05d0-4d33-8554-cfc76c20ecb6"
}

// ###################
// ### Description ###
// ###################

/*
 * This translator refactors the content of bilingual statutes
 * offered by http://www.japaneselawtranslation.go.jp/, breaking
 * the headings and provisions of a statute into individual
 * Zotero HTML snapshot attachments, enriching the content of
 * the pages with navigation elements that are more accessible
 * than the original.  Generated pages are printer-friendly.
 *
 * A sample URL for testing:
 *
 *   http://www.japaneselawtranslation.go.jp/law/detail/?printID=&ft=2&re=02&dn=1&yo=&x=10&y=18&al[]=G&ky=&page=2&vm=02
 *
 * Note the following:
 *
 *   - It may take a lot of time to refactor a large statute,
 *     so be patient.
 *
 *   - This translator requires a patch to Zotero, to support
 *     the saving of multiple documents extracted from a single
 *     content page.
 *
 *   - This is implemented for individual statutes only.  No
 *     multiple-grab extension is planned or contemplated.
 *
 *   - It is not necessary to set the site interface to
 *     bilingual mode: the translator will call the correct version
 *     of the page internally.  It should just work.)
 *
 *   - Relative links to other laws in the JLT service are
 *     correctly adjusted.
 *
 *   - Printed output includes the most recent revision date
 *     of the target statute.
 */

// #################
// ### Constants ###
// #################

var nodeNamesToSave = [
	"PartTitle",
	"ChapterTitle",
	"SectionTitle",
	"SubsectionTitle",
	"DivisionTitle",
	"Article"
];

var nodeNamesToMerge = [
	"PartTitle",
	"ChapterTitle",
	"SectionTitle",
	"SubsectionTitle",
	"DivisionTitle"
];

var headerNames = [
	"Part",
	"Chapter",
	"Section",
	"Subsection",
	"Division"
];

// For snagging article number or section header strings
// for inclusion in the title node of head.  This discriminates
// filenames in some print-to-PDF applications, preventing
// overwrites.
var subunitNames = [
	"PartTitle",
	"ChapterTitle",
	"SectionTitle",
	"SubsectionTitle",
	"DivisionTitle",
	"ArticleTitle"
];

var months = [
	"jan", "feb",  "mar",  "apr",  "may",  "jun",
	"jul",  "aug",  "sep",  "oct",  "nov",  "dec"
];

var NumDate1 = "([ a-z]*)\\s+no\\s+([0-9]+)\\s+.*((?:" + months.join("|") + ")[a-z]*\\s+[0-9]{1,2}\\s+[0-9]{4})";
var reNumDate1 = new RegExp(NumDate1);

var NumDate2 = "([ a-z]*)\\s+no\\s+([0-9]+)\\s+.*([0-9]{1,2}\\s+(?:" + months.join("|") + ")[a-z]*\\s+[0-9]{4})";
var reNumDate2 = new RegExp(NumDate2);

// ##############################################
// ### CDATA for document header declarations ###
// ##############################################

var css = "@media print {\n  div.Control { display: none; }\n  div.InnerBody { margin-right: 1cm; margin-left: 1cm; }\n  div.entry { display: none; }\n  div.ArticleCaption { font-style: italic; }\n}\n@media screen {\n  div.header { display: none; }\n  div.Control { position: fixed; bottom: 1em; right: 0.5em; width: 14.5em; }\n  a.selected { background: none repeat scroll 0% 0% rgb(221, 221, 221); }\n  a.unselected { background: none repeat scroll 0% 0% rgb(255, 255, 255); border-bottom: 1px dotted rgb(68, 68, 68); }\n  div.InnerBody { margin-right: 15em; }\n  div.entry { display: none; }\n  div.def { margin-left: 1em; }\n  div.term { font-weight: bold; }\n  div.reveal { display: block; position: fixed; top: 0.5em; right: 0.5em; padding: 0.5em; width: 13.5em; background: none repeat scroll 0% 0% rgb(255, 255, 82); border: 1px solid black; text-indent: 0px; z-index: 200; }\n  div.ArticleCaption { color: blue; font-weight: bold; }\n}\n@media print, screen {\n  div.header { border-top: 2px solid black; border-bottom: 2px solid black; margin-bottom: 1em; }\n  div.title { font-size: 140%; margin-top: 0.5em; }\n  div.cite { margin-bottom: 0.5em; }\n  div.Attribution { display: none; }\n  div.AboutContainer { position: relative; margin-top: -3px; }\n  input.About { font-size: 70%; font-weight: bold; color: rgb(85, 85, 85); display: block; position: absolute; right: 3px; z-index: 100; }\n  input.hide { bottom: 0px; }\n  input.reveal { top: 0px; }\n  input.blink { text-decoration: blink; }\n  dl { margin: -0.5em 0px 0px; }\n  dt { font-weight: bold; padding-top: 0.8em; }\n  dd { margin-left: 1em; }\n  span.ArticleTitle { font-size: 150%; }\n  div { line-height: 1.25em; }\n  div.LanguageSelector { border: 3px solid rgb(204, 204, 204); background: none repeat scroll 0% 0% rgb(238, 238, 238); padding: 1em; }\n  div.Attribution { font-size: 75%; padding: 1em 1em 0 0; }\n  div.Paragraph { text-indent: -1.5em; margin: 0.8em 0 0 1.5em; }\n  div.ItemSentence { margin: 0 0 0.8em 1.5em; }\n  div.Subitem1Sentence { margin: 0 0 0.8em 3em; }\n  div.Subitem2Sentence { margin: 0 0 0.8em 4.5em; }\n  div.Subitem3Sentence { margin: 0 0 0.8em 6em; }\n  div.breadcrumbs { font-size: 85%; margin-bottom: 1em; }\n  div.breadcrumb { margin: 0.5em; }\n  div.ParagraphSentence { margin: 0 0 0.8em 0; }\n}\n";

var js = "/* <CDATA[ */\n\nvar freeze;\n\nfunction fix (elem) {\n var temp;\n if (freeze === elem) {\n freeze = false;\n } else {\n temp = freeze;\n freeze = false;\n if (temp) {\n white(temp);\n }\n green(elem);\n freeze = elem;\n }\n};\n\nfunction green (elem) {\n var theterm;\n if (!freeze) {\n theterm = elem.getElementsByClassName(\"entry\");\n theterm.item(0).setAttribute(\"class\", \"entry reveal\");\n }\n elem.setAttribute(\"class\", \"selected\");\n};\n\nfunction white (elem) {\n var theterm;\n if (!freeze) {\n theterm = elem.getElementsByClassName(\"entry\");\n theterm.item(0).setAttribute(\"class\", \"entry\");\n }\n if (freeze !== elem) {\n elem.setAttribute(\"class\", \"unselected\");\n }\n};\n\nfunction showattrib (elem) {\n var n = document.getElementsByClassName(\"Attribution\").item(0);\n if (elem.value == \"About\") {\n elem.setAttribute(\"class\", \"About reveal blink\");\n elem.setAttribute(\"value\", \"Hide\");\n n.setAttribute(\"style\", \"display: block;\");\n window.setTimeout(\n function (elem) {\n if (elem.value == \"Hide\") {\n elem.setAttribute(\"class\", \"About reveal\");\n }\n },\n 5000,\n elem\n );\n } else {\n elem.setAttribute(\"class\", \"About hide\");\n elem.setAttribute(\"value\", \"About\");\n n.setAttribute(\"style\", \"display: none;\");\n }\n};\n\nfunction setlang (lang) {\n var node, setter, pos, setting, s, l, settings, setters, len, nodes, classes;\n settings = {};\n setters = document.getElementsByClassName(\"set\");\n for (pos=0;pos < setters.length;pos+=1) {\n setter = setters.item(pos);\n if (setter.checked) {\n s = setter.getAttribute(\"class\");\n s = s.split(/\\s+/);\n for each (l in [\"en\", \"ja\"]) {\n if (s.indexOf(l) > -1) {\n   settings[l] = true;\n } else {\n settings[l] = false;\n }\n }\n break;\n }\n }\n nodes = document.getElementsByClassName(\"lang\");\n len = nodes.length;\n for (pos = 0; pos < len; pos += 1) {\n node = nodes.item(pos);\n classes = node.getAttribute(\"class\");\n classes = classes.split(/\\s+/);\n if (classes.indexOf(\"en\") > -1) {\n if (settings[\"en\"]) {\n node.removeAttribute(\"style\");\n } else {\n   node.setAttribute(\"style\", \"display: none;\");\n }\n } else {\n if (settings[\"ja\"]) {\n node.removeAttribute(\"style\");\n } else {\n   node.setAttribute(\"style\", \"display: none;\");\n }\n }\n  }\n};\n\n/* ]]> */\n\n";


// #########################
// ### Factory functions ###
// #########################

var getResolver = function (doc) {
	var namespace, resolver;
	namespace = doc.documentElement.namespaceURI;
	if (namespace) {
		resolver = function(prefix) {
			if (prefix == 'x') {
				return namespace;
			} else {
				return null;
			}
		};
	} else {
		resolver = null;
	}
	return resolver;
};

// Wide spaces and wide parens are honorary ASCII in Japanese
// bytewise typography.
var fixAscii = function (str) {
	str = str.replace(/\u3000\u000d\u000a/g, " ");
	str = str.replace(/\uff08/g, " (");
	str = str.replace(/\uff09/g, ") ");
	return str;
};

// Fixing ASCII can result in stray spaces, which need to
// be fixed separately, after the final string is composed
// from text nodes.
var stripString = function (str) {
	str = str.replace(/^\s+/, "").replace(/\s+$/, "");
	return str;
}


// Instance object that makes url refs to other site docs absolute.
var UrlFixer = function (docurl) {
	var rex, m, root, path;
	rex = new RegExp("^([a-z]+://[-\.a-z%]+)(/[-/\.a-z%]+/|/)*");
	m = rex.exec(docurl);
	if (m) {
		root = m[1];
		path = m[2].split("/");
		if (path.length === 0) {
			path = ["", ""];
		}
	} else {
		root = "";
	}
	this.fix = function(block) {
		var pos, len, href, newhref;
		var nodes = block.getElementsByTagName("a");
		len = nodes.length;
		for (pos = 0; pos < len; pos += 1) {
			href = nodes.item(pos).getAttribute("href");
			if (href && !rex.exec(href)) {
				if (href.slice(0,1) === "/") {
					newhref = root + href;
				} else {
					newhref = root + path.join("/") + href;
				}
				nodes.item(pos).setAttribute("href", newhref);
			}
		}
	};
}

var textContentExcludingDictionaryStuff = function (doc, topnode) {
	var walker, mycls, myownret, nextnode;
	walker = doc.createTreeWalker (
		topnode,
		// NodeFilter.SHOW_TEXT + NodeFilter.SHOW_ELEMENT
		0x00000005,
		{
			acceptNode: function (node) {
				if (node.parentNode.getAttribute("onmouseover") && node.nodeName.toLowerCase() == "spann") {
					// non-balloon comment text.
					return 2;
				}
				mycls = [];
				if (node.getAttribute) {
					mycls = node.getAttribute("class");
					if ("string" === typeof mycls) {
						mycls = mycls.split(/\s+/);
					}
				}
				if (mycls && (mycls.indexOf("term") > -1 || mycls.indexOf("def") > -1 || mycls.indexOf("balloon") > -1)) {
					// return NodeFilter.FILTER_REJECT
					return 2;
				} else if (node.nodeType == node.TEXT_NODE) {
					// return NodeFilter.FILTER_ACCEPT;
					return 1;
				} else {
					return 3;
				}
			}
		},
		false
	);
	myownret = "";
	nextnode = walker.nextNode();
	while (nextnode) {
		myownret = myownret + nextnode.textContent.replace("\u3000");
		nextnode = walker.nextNode();
	}
	return myownret;
};

var textNodeContentByLanguage = function (doc, mynode) {
	var walker, txt, ret, nextnode;
	walker = doc.createTreeWalker (
		mynode,
		// NodeFilter.SHOW_TEXT,
		0x00000004,
		{
			acceptNode: function (node) {
				if (node.nodeType === node.TEXT_NODE) {
					// return NodeFilter.FILTER_ACCEPT;
					return 1;
				} else {
					// return NodeFilter.FILTER_SKIP;
					return 3;
				}
			}
		},
		false
	);
	ret = {ja: "", en: ""};
	nextnode = walker.nextNode();
	while (nextnode) {
		txt = fixAscii(nextnode.textContent);
		if (txt.match(/[^\u0001-\u017f\u0400-\u052f]/)) {
			ret.ja += txt;
		} else {
			ret.en += txt;
		}
		nextnode = walker.nextNode();
	}
	ret.ja = stripString(ret.ja);
	ret.en = stripString(ret.en);
	return ret;
};

var getBlocks = function (doc) {
	var walker, txt, ret, nextnode, parent, cls;
	walker = doc.createTreeWalker (
		doc,
		// NodeFilter.SHOW_ELEMENT,
		0x00000001,
		{
			acceptNode: function (node) {
				if (parent == node.parentNode) {
					// return NodeFilter.FILTER_REJECT;
					return 2;
				} else if (nodeNamesToSave.indexOf(node.getAttribute("class")) > -1) {
					// return NodeFilter.FILTER_ACCEPT;
					parent = node;
					return 1;
				} else {
					// return NodeFilter.FILTER_SKIP;
					return 3;
				}
			}
		},
		false
	);
	return walker;
};

var refactorPage = function (ns, doc) {
	var pos, len, node, m, ppos, llen, nodes;

	// Force dict class on all embedded comments.
	nodes = doc.getElementsByClassName("balloon");
	len = nodes.length;
	for (pos = 0; pos < len; pos += 1) {
		node = nodes.item(pos);
		if (node.parentNode.hasAttribute("onmouseover")) {
			node.parentNode.setAttribute("class", "dict");
		}
	}

	var main = doc.getElementsByClassName("InnerBody");
	if (main.length > 0) {
       main = main.item(0);
    }
	var walker = doc.createTreeWalker(
		main,
		// NodeFilter.SHOW_ELEMENT,
		0x00000001,
		{
			acceptNode: function (node) {
				if (node.localName === "div") {
					if (!node.getElementsByTagName("div").length) {
						// return NodeFilter.FILTER_ACCEPT
						return 1;
					} else {
						// return NodeFilter.FILTER_SKIP
						return 3;
					}
				} else {
					// return NodeFilter.FILTER_REJECT
					return 2;
				}
			}
		},
		false
	);
    while (walker.nextNode()) {
		var language;
		// Special walker, to identify text nodes that are not
		// children of a node of a particular class (dict).
		var txt = textContentExcludingDictionaryStuff(doc, walker.currentNode);
		txt = fixAscii(txt);
		if (txt.match(/[^\u0001-\u017f\u0400-\u052f]/)) {
			language = "ja";
		} else {
			language = "en";
		}
		var myclasses = walker.currentNode.getAttribute("class");
		walker.currentNode.setAttribute("class", language + " lang " + myclasses);
	}

	nodes = doc.getElementsByClassName("dict");
    len = nodes.length;
    for (pos = 0; pos < len; pos += 1) {
		node = nodes.item(pos);
		var raw = node.getAttribute("title");
		if (raw) {
			node.removeAttribute("title");
		} else {
			// try for a span tag with a balloon attribute.
			var balloon = node.getElementsByClassName("balloon");
			if (balloon.length > 0) {
				raw = balloon.item(0).textContent;
				node.removeChild(balloon.item(0));
				node.removeAttribute("onmouseover");
				node.removeAttribute("onmouseout");
			}
		}

		m = raw.match(/^([^\(]*)\(([^\)]*)\)(.*)/);
		if (m) {
			if (m[2].match(/^[ a-zA-Z]*$/)) {
				raw = m[1] + m[3];
			}
		}
		raw = raw.replace("(", " (", "g").replace("[", " [", "g");
		m = raw.match(/^([^:]*):(.*)$/);
		if (m) {
			var term = m[1].replace(/\s+$/, "");
			var def = m[2].replace(/^\s+/, "");
		} else {
			var term = "Note:";
			var def = raw;
		}
		llen = node.childNodes.length;
		var children = [];
		for (ppos = 0; ppos < llen; ppos += 1) {
			children.push(node.removeChild(node.childNodes.item(ppos)));
		}
		var anchor = doc.createElementNS(ns, "a");
		anchor.setAttribute("class", "unselected");
		node.appendChild(anchor);

		var entry = doc.createElementNS(ns, "div");
		entry.setAttribute("class", "entry");

		var termnode = doc.createElementNS(ns, "div");
		termnode.setAttribute("class", "term");
		var termtext = doc.createTextNode(term);
		termnode.appendChild(termtext);

		var defnode = doc.createElementNS(ns, "div");
		defnode.setAttribute("class", "def");
		var deftext = doc.createTextNode(def);
		defnode.appendChild(deftext);

		entry.appendChild(termnode);
		entry.appendChild(defnode);

		anchor.appendChild(entry);

		for each (c in children) {
			anchor.appendChild(c);
		}
		anchor.setAttribute("onmouseover", "green(this);");
		anchor.setAttribute("onmouseout", "white(this);");
		anchor.setAttribute("onclick", "fix(this);");
	}

	// Ha!  Another variation!  Drop everything, let's add some
	// more ad hoc code to the translator!  Seriously, though,
	// some documentation on this markup would be welcome.
	//
	// <img class="memo_icon"
	//      alt="The term &quot;principal&quot; in this section refers to any principal fund which can bear fruit, such as interest."
	//      src="memo.gif"
	//      align="absbottom">

	// Replace the ghastly thing above with an img tag wrapped in our
	// usual reveal decorations:
	//
	// <span class="dict">
	//     <a onclick="fix(this);" onmouseout="white(this);" onmouseover="green(this);" class="unselected">
	//         <div class="entry">
	//             <div class="term">[term]</div>
	//             <div class="def">[def]</div>
	//         </div>
    //         [word]
	//     </a>
	// </span>
	//
	// (with the entry div formatted as "Note" plus the comment text,
	// unescaped, and with the image in place of the text word)

	nodes = doc.getElementsByClassName("memo_icon");
	len	= nodes.length;
	for (pos = 0; pos < len; pos += 1) {
		node = nodes.item(pos);
		var memo = node.getAttribute("alt");
		if (!memo) {
			memo = node.getAttribute("title");
		}
		if (memo && node.nodeName.toLowerCase() == "img") {
			memo = Zotero.Utilities.unescapeHTML(memo);
			var newnode = node.cloneNode(false);
			newnode.removeAttribute("alt");
			newnode.removeAttribute("title");
			var dict = doc.createElementNS(ns, 'span');
			dict.setAttribute("class", "dict");
			var anchor = doc.createElementNS(ns, 'a');
			anchor.setAttribute("onclick", "fix(this);");
			anchor.setAttribute("onmouseout", "white(this);");
			anchor.setAttribute("onmouseover", "green(this);");
			anchor.setAttribute("class", "unselected");
			var entry = doc.createElementNS(ns, 'div');
			entry.setAttribute("class", "entry");

			var term = doc.createElementNS(ns, 'div');
			term.setAttribute("class", "term");
			var termtxt = doc.createTextNode("Note:");
			term.appendChild(termtxt);

			entry.appendChild(term);

			var def = doc.createElementNS(ns, 'div');
			def.setAttribute("class", "def");
			var deftxt = doc.createTextNode(memo);
			def.appendChild(deftxt);

			entry.appendChild(def);

			anchor.appendChild(entry);
			anchor.appendChild(newnode);

			dict.appendChild(anchor);

			node.parentNode.replaceChild(dict, node);
		}
	}

    doc.normalize();
};

// #####################
// ### API functions ###
// #####################

function detectWeb(doc, url) {
 	if (url.match(/http:\/\/www\.japaneselawtranslation\.go\.jp\/law\/detail_main/)) {
		return "statute";
	}
};

function doWeb(doc, url) {
	var item, mystr, mylst, mydoc, myurl, nsResolver, m, nodes, pos, len;

	// No need for this with retrieveDocument.
	//Zotero.wait();

	item = new Zotero.Item("statute");

	// Assure that we are looking at the bilingual view.
	if (!url.match(/vm=04/)) {
		myurl = url.replace(/\&vm=[0-9]{2}/, "").replace(/vm=[0-9]{2}\&/);
		myurl = myurl + "&vm=04";
		mydoc = Zotero.Utilities.retrieveDocument(myurl);
	} else {
		mydoc = doc;
	}

	// Extract title
	var titlenodes = mydoc.getElementsByClassName("LawTitle");
	if (titlenodes.length > 0) {
		var titlenode = titlenodes.item(0);
		var titles = textNodeContentByLanguage(mydoc, titlenode);
		item.title = titles.ja + " :en: " + titles.en;
	}

	// Extract date, instrument type and instrument number
	var datenodes = mydoc.getElementsByClassName("LawNum");
	if (datenodes.length > 0) {
		var datenode = datenodes.item(0);
		var dates = textNodeContentByLanguage(mydoc, datenode);
		if (dates.en) {
			var mydate = dates.en.toLowerCase();
			mydate = mydate.replace(/[^ a-z0-9]/g, " ");
			m = reNumDate1.exec(mydate);
			if (!m) {
				m = reNumDate2(mydate);
			}
			if (m) {
				item.codeNumber = m[2];
				item.code = m[1].slice(0,1).toUpperCase() + m[1].slice(1);
				item.date = m[3];
			}
		}
	}

	//
	// Get revising act reference from sibling frame
	// (thanks a lot, guys-who-built-the-website, that was a fun evening spent studying the DOM)
	//
	var headerFrame = doc.defaultView.parent.frames[1].document;
	var myhref = headerFrame.location.href;
	if (myhref && myhref.match(/vm=/)) {
		headerFrame = Zotero.Utilities.retrieveDocument(myhref.replace(/\&*vm=[0-9]{1,2}/, ""));
	}
	var hfResolver = getResolver(headerFrame);
	var jpath = '//span[@class="num" and contains(text(), "\u6539\u6b63")]/following-sibling::span[1]';
	var epath = '//span[@class="num" and contains(text(), "Amendment")]/following-sibling::span[1]';
	var jnodes = headerFrame.evaluate(jpath, headerFrame, hfResolver, XPathResult.ANY_TYPE, null);
	var enodes = headerFrame.evaluate(epath, headerFrame, hfResolver, XPathResult.ANY_TYPE, null);
	var jnode = jnodes.iterateNext();
	var enode = enodes.iterateNext();
	var jrev = "";
	var erev = "";
	if (jnode && enode) {
		jrev = jnode.textContent.replace(/^(?:\s+|\n)/, "").replace(/(?:\s+|\n)$/, "");
		erev = enode.textContent.replace(/^(?:\s+|\n)/, "").replace(/(?:\s+|\n)$/, "");
		if (jrev && erev) {
			item.note = "As revised by " + erev + ".";
			jrev = "\u3001\u6539\u6b63\uff1a" + jrev;
			erev = " (as revised by " + erev + ")";
		} else {
			// Both false if one side of the data is an empty string.
			jrev = "";
			erev = "";
		}
	}

	// Get statute page resolver
	nsResolver = getResolver(mydoc);

	// Get namespace
	var myns = mydoc.documentElement.namespaceURI;

	// Construct URL fixer
	var urlFixer = new UrlFixer(mydoc.location.href);

	//
	// Inventory nodes
	//

	// Title header
	var header = mydoc.createElementNS(myns, 'div');
	header.setAttribute("class", "header");

	var headerjtitle = mydoc.createElementNS(myns, 'div');
	headerjtitle.setAttribute("class", "title");
	var headerjtitletxt = mydoc.createTextNode(titles.ja);
	headerjtitle.appendChild(headerjtitletxt);

	var headerjcite = mydoc.createElementNS(myns, 'div');
	headerjcite.setAttribute("class", "cite");
	var headerjcitetxt = mydoc.createTextNode(dates.ja + jrev);
	headerjcite.appendChild(headerjcitetxt);

	header.appendChild(headerjtitle);
	header.appendChild(headerjcite);

	var headeretitle = mydoc.createElementNS(myns, 'div');
	headeretitle.setAttribute("class", "title");
	var headeretitletxt = mydoc.createTextNode(titles.en);
	headeretitle.appendChild(headeretitletxt);

	var headerecite = mydoc.createElementNS(myns, 'div');
	headerecite.setAttribute("class", "cite");
	var headerecitetxt = mydoc.createTextNode(dates.en + erev);
	headerecite.appendChild(headerecitetxt);

	header.appendChild(headeretitle);
	header.appendChild(headerecite);

	// CSS node
	var cssnode = mydoc.createElementNS(myns, 'style');
	cssnode.setAttribute("type", "text/css");
	var csstxt = mydoc.createTextNode(css);
	cssnode.appendChild(csstxt);

	// Javascript node
	var jsnode = mydoc.createElementNS(myns, 'script');
	jsnode.setAttribute("type", "text/javascript");
	var jstxt = mydoc.createTextNode(js);
	jsnode.appendChild(jstxt);

	// Control block (language selector and attribution)
	var control = mydoc.createElementNS(myns, 'div');
	control.setAttribute("class", "Control");

	var langselect = mydoc.createElementNS(myns, 'div');
	langselect.setAttribute("class", "LanguageSelector");

	var lang = mydoc.createElementNS(myns, 'div');
	lang.setAttribute("class", "Language");

	var langinput = mydoc.createElementNS(myns, 'input');
	langinput.setAttribute("type", "radio");
	langinput.setAttribute("name", "lang");

	var langlabel = mydoc.createElementNS(myns, 'label');

	lang.appendChild(langinput);
	lang.appendChild(langlabel);

	// Japanese
	langinput.setAttribute("id", "ja_tickbox");
	langinput.setAttribute("class", "set ja");
	langinput.setAttribute("onclick", "javascript:setlang('ja');");

	langlabel.setAttribute("id", "ja_label");
	langlabel.setAttribute("for", "ja_tickbox");
	var langtxt_ja = mydoc.createTextNode("Japanese");
	langlabel.appendChild(langtxt_ja);

	var lang_ja = mydoc.importNode(lang, true);
	langselect.appendChild(lang_ja);
	// clean up
	langlabel.removeChild(langtxt_ja);

	// English
	langinput.setAttribute("id", "en_tickbox");
	langinput.setAttribute("class", "set en");
	langinput.setAttribute("onclick", "javascript:setlang('en');");

	langlabel.setAttribute("id", "en_label");
	langlabel.setAttribute("for", "en_tickbox");
	var langtxt_en = mydoc.createTextNode("English");
	langlabel.appendChild(langtxt_en);

	var lang_en = mydoc.importNode(lang, true);
	langselect.appendChild(lang_en);
	// clean up again
	langlabel.removeChild(langtxt_en);

	// Both
	langinput.setAttribute("id", "jaen_tickbox");
	langinput.setAttribute("class", "set ja en");
	langinput.setAttribute("onclick", "javascript:setlang('jaen');");
	// Set Both as default
	langinput.setAttribute("checked", "1");

	langlabel.setAttribute("id", "jaen_label");
	langlabel.setAttribute("for", "jaen_tickbox");
	var langtxt_jaen = mydoc.createTextNode("Both");
	langlabel.appendChild(langtxt_jaen);

	var lang_jaen = mydoc.importNode(lang, true);
	langselect.appendChild(lang_jaen);
	// clean up for old times' sake
	langlabel.removeChild(langtxt_jaen);

	control.appendChild(langselect);

	var aboutcontainer = mydoc.createElementNS(myns, 'div');
	aboutcontainer.setAttribute("class", "AboutContainer");

	var aboutbutton = mydoc.createElementNS(myns, 'input');
	aboutbutton.setAttribute("class", "About hide");
	aboutbutton.setAttribute("type", "button");
	aboutbutton.setAttribute("onclick", "showattrib(this);");
	aboutbutton.setAttribute("value", "About");
	aboutcontainer.appendChild(aboutbutton);

	control.appendChild(aboutcontainer);

	var attribution = mydoc.createElementNS(myns, 'div');
	attribution.setAttribute("class", "Attribution");

	var dl = mydoc.createElementNS(myns, 'dl');
	var dt1 = mydoc.createElementNS(myns, 'dt');
	var dt1txt = mydoc.createTextNode("Source");
	dt1.appendChild(dt1txt);
	dl.appendChild(dt1);
	var dd1 = mydoc.createElementNS(myns, 'dd');
	var a1 = mydoc.createElementNS(myns, 'a');
	a1.setAttribute("href", "http://www.japaneselawtranslations.go.jp/");
	var a1txt = mydoc.createTextNode("Japanese Law Translations");
	a1.appendChild(a1txt);
	dd1.appendChild(a1);
	dl.appendChild(dd1);

	var dt2 = mydoc.createElementNS(myns, 'dt');
	var dt2txt = mydoc.createTextNode("Zotero page remix");
	dt2.appendChild(dt2txt);
	dl.appendChild(dt2);
	var dd2 = mydoc.createElementNS(myns, 'dd');
	var a2 = mydoc.createElementNS(myns, 'a');
	a2.setAttribute("href", "http://gsl-nagoya-u.net/faculty/member/gsliF_Bennett.html");
	var a2txt = mydoc.createTextNode("Frank Bennett");
	a2.appendChild(a2txt);
	dd2.appendChild(a2);
	var br1 = mydoc.createElementNS(myns, 'br');
	dd2.appendChild(br1);
	var dd2txt1 = mydoc.createTextNode("Faculty of Law");
	dd2.appendChild(dd2txt1);
	var br2 = mydoc.createElementNS(myns, 'br');
	dd2.appendChild(br2);
	var dd2txt2 = mydoc.createTextNode("Nagoya University");
	dd2.appendChild(dd2txt2);
	dl.appendChild(dd2);

	attribution.appendChild(dl);

	control.appendChild(attribution);

	// Grab pointers to component blocks and normalize
	var xblocks = getBlocks(mydoc);
	var rawblocks = [];
	var blocks = [];
	var isSecondNode = false;
	var firstnode;
	var container;
	var containerClass;
	var headerClass;
	var cls;
	var xblock = xblocks.nextNode();

	//for testing
	//var mycount = 0;

	while (xblock) {
		rawblocks.push(xblock);

		// for testing
		//if (mycount > 25) {
		//	break;
		//}
		//mycount += 1;

		xblock = xblocks.nextNode();
	}

	for each (rawblock in rawblocks) {
		if (nodeNamesToMerge.indexOf(rawblock.getAttribute("class")) > -1) {
			if (isSecondNode) {
				// compose and return
				cls = rawblock.getAttribute("class");
				if (cls) {
					m = cls.match(/^([A-Z][a-z]*)[A-Z]*[a-z]*/);
				} else {
					m = false;
				}
				if (m) {
					containerClass = m[1];
					headerClass = m[0];
				} else {
					containerClass = "Bogus";
					headerClass = "BogusTitle";
				}
				container = mydoc.createElementNS(myns, 'div');
				container.setAttribute("class", containerClass);
				n = mydoc.importNode(firstnode, true);
				container.appendChild(n);
				n = mydoc.importNode(rawblock, true);
				container.appendChild(n);
				blocks.push(container);
				isSecondNode = false;
			} else {
				// hold over
				firstnode = rawblock;
				isSecondNode = true;
			}
		} else {
			n = mydoc.importNode(rawblock, true);
			blocks.push(n);
		}
	}

	// Normalized nodes now available, compose attachments
	var lastlevel = -1;
	var level = false;
	var jheaders = [];
	var eheaders = [];
	var headers;
	var seq = 1;
	var seqstr = "bogus";
	var currentheader = "bogus";
	var seqlen = ("" + blocks.length).length;
	var n;
	var title = "bogus";
	var level_offset = -1;
	for each (block in blocks) {
		seqstr = ("" + seq);
		while (seqstr.length < seqlen) {
			seqstr = "0" + seqstr;
		}
		seq += 1;
		cls = block.getAttribute("class");
		level = headerNames.indexOf(cls);
		if (level_offset < 0 || level < level_offset) {
			level_offset = level;
		}
		// Set up headers
		if (level > -1) {
			headers = textNodeContentByLanguage(mydoc, block);
			if (level == lastlevel) {
				jheaders[jheaders.length - 1] = headers.ja;
				eheaders[eheaders.length - 1] = headers.en;
			} else if (level > lastlevel) {
				jheaders.push(headers.ja);
				eheaders.push(headers.en);
			} else {
				jheaders = jheaders.slice(0, (level - level_offset + 1));
				eheaders = eheaders.slice(0, (level -level_offset + 1));
			}
			title = headers.en;
			lastlevel = level;
		} else {
			// Article blocks
			n = block.getElementsByClassName("ArticleTitle");
			if (n.length > 1) {
				title = n.item(1).textContent;
			} else {
				title = "[missing article number]";
			}
		}

		// Make relative URLs absolute
		urlFixer.fix(block);

		// Create document attachments for headings and provisions.
		var subdoctype = doc.implementation.createDocumentType("html:html", "-//W3C//DTD HTML 4.01 Transitional//EN", "http://www.w3.org/TR/html4/loose.dtd");
		var subdoc = doc.implementation.createDocument(myns, 'html', subdoctype);
		var head = subdoc.createElementNS(myns, 'head');
		var titlenode = subdoc.createElementNS(myns, 'title');
		var titletext = subdoc.createTextNode(titles.en + ", " + title);
		titlenode.appendChild(titletext);
		head.appendChild(titlenode);

		var cssclone = subdoc.importNode(cssnode, true);
		head.appendChild(cssclone);

		var jsclone = subdoc.importNode(jsnode, true);
		head.appendChild(jsclone);

		var base = subdoc.createElementNS(myns, 'base');
		base.setAttribute("target", "_blank");
		base.setAttribute("href", mydoc.location.href + "#zfs" + seqstr);
		head.appendChild(base);

		subdoc.documentElement.appendChild(head);

		var body = subdoc.createElementNS(myns, 'body');

		var controlclone = subdoc.importNode(control, true);
		body.appendChild(controlclone);

		body.setAttribute("onload", "setlang('jaen');");
		var innerbody = subdoc.createElementNS(myns, 'div');
		innerbody.setAttribute("class", "InnerBody");

		var headerclone = subdoc.importNode(header, true);
		innerbody.appendChild(headerclone);

		var breadcrumbs = subdoc.createElementNS(myns, 'div');
		breadcrumbs.setAttribute("class", "Breadcrumbs");

		var jbreadcrumb = subdoc.createElementNS(myns, 'div');
		jbreadcrumb.setAttribute("class", "Breadcrumb");
		var jcrumb = subdoc.createTextNode(jheaders.join(" - "));
		jbreadcrumb.appendChild(jcrumb);

		var ebreadcrumb = subdoc.createElementNS(myns, 'div');
		ebreadcrumb.setAttribute("class", "Breadcrumb");
		var ecrumb = subdoc.createTextNode(eheaders.join(" - "));
		ebreadcrumb.appendChild(ecrumb);

		breadcrumbs.appendChild(jbreadcrumb);
		breadcrumbs.appendChild(ebreadcrumb);
		innerbody.appendChild(breadcrumbs);
		innerbody.appendChild(block);
		body.appendChild(innerbody);
		subdoc.documentElement.appendChild(body);

		// Add language tags to blocks using charset heuristic
		// (odd that there is no language class markup in the pages
		// in the first place ...)
		refactorPage(myns, subdoc);

		item.attachments.push(
			{
				document:subdoc,
				title: seqstr + " " + title,
				snapshot: true
			}
		);
	}

	item.complete();

	//Zotero.done();
};