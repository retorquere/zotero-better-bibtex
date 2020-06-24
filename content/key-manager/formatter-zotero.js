
const ZU = Zotero.Utilities;

//%a = first listed creator surname
//%y = year
//%t = first word of title
var citeKeyFormat = "%a_%t_%y";

// a little substitution function for BibTeX keys, where we don't want LaTeX
// escaping, but we do want to preserve the base characters

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
}

var numberRe = /^[0-9]+/;
// Below is a list of words that should not appear as part of the citation key
// it includes the indefinite articles of English, German, French and Spanish, as well as a small set of English prepositions whose
// force is more grammatical than lexical, i.e. which are likely to strike many as 'insignificant'.
// The assumption is that most who want a title word in their key would prefer the first word of significance.
// Also remove markup
var citeKeyTitleBannedRe = /\b(a|an|the|some|from|on|in|to|of|do|with|der|die|das|ein|eine|einer|eines|einem|einen|un|une|la|le|l\'|el|las|los|al|uno|una|unos|unas|de|des|del|d\')(\s+|\b)|(<\/?(i|b|sup|sub|sc|span style=\"small-caps\"|span)>)/g;
var citeKeyConversionsRe = /%([a-zA-Z])/;

var citeKeyConversions = {
	"a":function (flags, item) {
		if (item.creators && item.creators[0] && item.creators[0].lastName) {
			return item.creators[0].lastName.toLowerCase().replace(/ /g,"_").replace(/,/g,"");
		}
		return "noauthor";
	},
	"t":function (flags, item) {
		if (item["title"]) {
			return item["title"].toLowerCase().replace(citeKeyTitleBannedRe, "").split(/\s+/g)[0];
		}
		return "notitle";
	},
	"y":function (flags, item) {
		if (item.date) {
			var date = Zotero.Date.strToDate(item.date);
			if (date.year && numberRe.test(date.year)) {
				return date.year;
			}
		}
		return "nodate";
	}
};


function buildCiteKey (item, extraFields, citekeys) {
	if (extraFields) {
		const citationKey = extraFields.findIndex(field => field.field && field.value && field.field.toLowerCase() === 'citation key');
		if (citationKey >= 0) return extraFields.splice(citationKey, 1)[0].value;
	}
	
  	if (item.citationKey) return item.citationKey;
	
	var basekey = "";
	var counter = 0;
	var citeKeyFormatRemaining = citeKeyFormat;
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
	// use legacy pattern for all old items to not break existing usages
	var citeKeyCleanRe = /[^a-z0-9\!\$\&\*\+\-\.\/\:\;\<\>\?\[\]\^\_\`\|]+/g;
	// but use the simple pattern for all newly added items
	// or always if the hiddenPref is set
	// extensions.zotero.translators.BibTeX.export.simpleCitekey
	if ((Zotero.Prefs && Zotero.Prefs.get('translators.BibTeX.export.simpleCitekey'))
			|| (item.dateAdded && parseInt(item.dateAdded.substr(0, 4)) >= 2020)) {
		citeKeyCleanRe = /[^a-z0-9_-]/g;
	}
	basekey = basekey.replace(citeKeyCleanRe, "");
	var citekey = basekey;
	var i = 0;
	while (citekeys[citekey]) {
		i++;
		citekey = basekey + "-" + i;
	}
	citekeys[citekey] = true;
	return citekey;
}


module.exports = { buildCiteKey: buildCiteKey }
