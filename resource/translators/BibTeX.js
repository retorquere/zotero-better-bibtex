var config = {
  id: '/*= id =*/',
  label:  '/*= label =*/',
  unicode:  /*= unicode =*/
}

function unicode() {
  trLog('unicode: ' + Zotero.getHiddenPref('better-bibtex.unicode'));
  switch (Zotero.getHiddenPref('better-bibtex.unicode')) {
    case 'always':
      return true;
    case 'never':
      return false;
    default:
      var _charset = Zotero.getOption('exportCharset');
      return config.unicode || (_charset && _charset.toLowerCase() == 'utf-8');
  }
}

function saveAttachments(item) {
  if(! item.attachments) {
    return null;
  }

  var attachments = [];
  item.attachments.forEach(function(att) {
    trLog('attachment: ' + JSON.stringify(att, false, 2));
    if (Zotero.getOption("exportFileData") && att.defaultPath && att.saveFile) {
      var format = Zotero.getHiddenPref('better-bibtex.attachmentFormat');
      var customPath = (new Formatter(att, format, item)).format();
      customPath = ZU.removeDiacritics(customPath).replace(/[\\:\*\?"<>\|;]/, '');
      trLog('saving formatted attachment to ' + customPath + ' (' + format + ')');

      att.saveFile(att.defaultPath);
      attachments.push({title: att.title, path: att.defaultPath, mimetype: att.mimeType});
      return;
    }

    if (att.localPath) {
      attachments.push({title: att.title, path: att.localPath, mimetype: att.mimeType});
      return;
    }

    Zotero.debug('WARNING: attachment without path: ' + att.title);
  });

  if (attachments.length == 0) {
    return null;
  }
  return attachments.map(function(att) { return [att.title, att.path.replace(/([\\{}:;])/g, "\\$1"), att.mimetype].join(':'); }).join(';');
}

function trLog(msg) { Zotero.debug('[' + config.label + '] ' + msg); }

function detectImport() {
  var maxChars = 1048576; // 1MB

  var inComment = false;
  var block = "";
  var buffer = "";
  var chr = "";
  var charsRead = 0;

  var re = /^\s*@[a-zA-Z]+[\(\{]/;
  while((buffer = Zotero.read(4096)) && charsRead < maxChars) {
    trLog("Scanning " + buffer.length + " characters for BibTeX");
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

var inputFieldMap = {
  booktitle :"publicationTitle",
  school:"publisher",
  institution:"publisher",
  publisher:"publisher",
  issue:"issue",
  location:"place"
};

if (!zotero2tex) { var zotero2tex = {}; }
var tex2zotero = {};
for (zotero in zotero2tex) {
  if (!(zotero2tex[zotero] instanceof Array)) { zotero2tex[zotero] = [zotero2tex[zotero]]; }

  zotero2tex[zotero] = zotero2tex[zotero].map(function(tex){
    if (!tex2zotero[tex] || tex.match(/^:/)) {
      tex2zotero[tex.replace(/^:/, '')] = zotero;
    }
    return tex.replace(/^:/, '');
  });

  zotero2tex[zotero] = zotero2tex[zotero][0];
}

function getBibTexType(item)
{
  var type = zotero2tex[item.itemType];
  if (typeof (type) == "function") { type = type(item); }
  if (!type) type = "misc";
  return type;
}


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

/*= unicode_mapping =*/

convert.latex2unicode["\\url"] = '';
convert.latex2unicode["\\href"] = '';

convert.to_latex = function(str) {
  var _unicode = unicode();

  chunk_to_latex = function(arr) {
    var chr;
    var res = ''
    var textMode=true;

    arr.forEach(function(chr) {
      if (chr.match(/^[\\{]/)) {
        textMode = chr.match(/[^a-z]$/i);
      } else {
        if (!textMode) {
          res += '{}';
          textMode = true;
        }
      }

      res += chr;
    });

    return res;
  }

  chunk_text = function(str) {
    var strlen = str.length;
    var c, ca;
    var l;

    var res = [];

    for (var i=0; i < strlen; i++) {
      c = str.charAt(i);
      if (!convert.unicode2latex[c]) {
        convert.unicode2latex[c] = {latex: c, math:false};
      }
      convert.unicode2latex[c].math = !!convert.unicode2latex[c].math;

      if (_unicode && !convert.unicode2latex[c].force) {
        convert.unicode2latex[c].latex = c;
        convert.unicode2latex[c].math = false;
      }

      ca = convert.unicode2latex[c];

      var last = res.length - 1;
      if (res.length == 0 || ca.math != res[last].math) {
        res.push({chars: [ca.latex], math: ca.math});
      } else {
        res[last].chars.push(ca.latex);
      }
    }

    res = res.map(function(chunk) {
      if (chunk.math) {
        return '\\ensuremath{' + chunk_to_latex(chunk.chars) + '}';
      } else {
        return chunk_to_latex(chunk.chars);
      }
    });

    return chunk_to_latex(res).replace(/{}\s+/g, ' ');
  }

  var html2latex = {
    sup:  {open: "\\ensuremath{^{", close: "}}"},
    sub:  {open: "\\ensuremath{_{", close: "}}"},
    i:    {open: "\\emph{",         close: "}"},
    b:    {open: "\\textbf{",       close: "}"}
  }

  var res = ('' + str).split(/(<\/?[a-z]+>)/ig).map(function(chunk, index) {
    trLog(index + ': ' + chunk);
    if ((index % 2) == 1) { // odd elements = splitter == potential html tag
      var sub = html2latex[chunk.replace(/[^a-z]/ig, '').toLowerCase()];
      trLog(chunk + ' is html? ' + !!sub);
      if (!sub) { return chunk_text(chunk); }
      return sub[(chunk.charAt(1) == '/') ? 'close' : 'open'];
    } else {
      return chunk_text(chunk);
    }
  }).join('');

  trLog('to_latex("' + str + '", ' + _unicode + ') = "' + res + '"');
  return res;
}

convert.from_latex = function(str) {
  var chunks = str.split('\\');
  var res = chunks.shift();
  var m, i, c, l;

  chunks.forEach(function(chunk) {
    chunk = '\\' + chunk;
    l = chunk.length;
    m = null;
    for (i=2; i<=l; i++) {
      if (convert.latex2unicode[chunk.substring(0, i)]) {
        m = i;
      } else {
        break;
      }
    }

    if (m) {
      res += convert.latex2unicode[chunk.substring(0, m)] + chunk.substring(m, chunk.length);
    } else {
      res += chunk;
    }
  });
  return res;
}

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
    value.split(/ and /i).forEach(function(name) {
      trLog('name = ' + name);
      if (name.trim() != '') {
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
    });
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
  } else if (field == "date") {
    //We're going to assume that "date" and the date parts don't occur together. If they do, we pick date, which should hold all.
    item.date = value;
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
    attachments.forEach(function(attachment) {
      var parts = attachment.split(":");
      var filetitle = parts[0];
      var filepath = parts[1];
      if (filepath.trim() === '') return; // skip empty entries
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
    });
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
    value = convert.from_latex(value);

    //convert tex markup into permitted HTML
    value = mapTeXmarkup(value);

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
      trLog("jabref: fatal: unsupported group format: " + jabref.format);
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
        trLog("jabref: fatal: unexpected non-match for group " + record.id);
        return;
      }
      record.level = parseInt(record.data[1]);
      record.type = record.data[2]
      record.name = record.data[3]
      record.intersection = keys.shift(); // 0 = independent, 1 = intersection, 2 = union

      if (isNaN(record.level)) {
        trLog("jabref: fatal: unexpected record level in " + record.id);
        return;
      }

      if (record.level == 0) { continue; }
      if (record.type != 'ExplicitGroup') {
        trLog("jabref: fatal: group type " + record.type + " is not supported");
        return;
      }

      collectionPath = collectionPath.slice(0, record.level - 1).concat([record.name]);
      trLog("jabref: locating level " + record.level + ": " + collectionPath.join('/'));

      if (jabref.root.hasOwnProperty(collectionPath[0])) {
        collection = jabref.root[collectionPath[0]];
        trLog("jabref: root " + collection.name + " found");
      } else {
        collection = new Zotero.Collection();
        collection.name = collectionPath[0];
        collection.type = 'collection';
        collection.children = [];
        jabref.root[collectionPath[0]] = collection;
        trLog("jabref: root " + collection.name + " created");
      }
      parentCollection = null;

      for (var i = 1; i < collectionPath.length; i++) {
        var path = collectionPath[i];
        trLog("jabref: looking for child " + path + " under " + collection.name);

        var child = jabrefCollect(collection.children, function(n) { return (n.name == path)})
        if (child.length != 0) {
          child = child[0]
          trLog("jabref: child " + child.name + " found under " + collection.name);
        } else {
          child = new Zotero.Collection();
          child.name = path;
          child.type = 'collection';
          child.children = [];

          collection.children.push(child);
          trLog("jabref: child " + child.name + " created under " + collection.name);
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
          trLog('jabref: adding ' + key + ' to ' + collection.name);
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
    var zoteroType = tex2zotero[type];
    if (!zoteroType) {
      trLog("discarded item from BibTeX; type was "+type);
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

    if(read == "=") {                // equals begin a field
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
    } else if(read == ",") {            // commas reset
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

        if (!item.publisher && item.backupPublisher) {
          item.publisher=item.backupPublisher;
          delete item.backupPublisher;
        }

        item.complete();
      }
      return;
    } else if(" \n\r\t".indexOf(read) == -1) {    // skip whitespace
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
      } else if(read == "{") {    // possible open character
        beginRecord(type, "}");
        type = false;
      } else if(read == "(") {    // possible open character
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

function escape_url(url) {
  var href = url.replace(/([#\\_%&{}])/g, "\\$1");

  if (!unicode()) {
    href = href.replace(/[^\x21-\x7E]/g, function(chr){return "\\\%" + ('00' + chr.charCodeAt(0).toString(16)).slice(-2)});
  }

  if (Zotero.getHiddenPref('better-bibtex.fancyURLs')) {
    return "\\href{" + href + "}{" + convert.to_latex(url) + "}";
  }

  return href;
}

function escape(value, options) {
  if ((typeof options) == 'string') { options = {sep: options}; }
  if ((typeof options) == 'boolean') { options = {brace: true}; }
  options = (options || {})

  if (typeof value == 'number') { return value; }
  if (!value) { return; }

  if (value instanceof Array) {
    if (value.length == 0) { return; }
    return value.map(function(word) { return escape(word, options); }).join(options.sep);
  }

  if (options.brace && !value.literal && Zotero.getHiddenPref('better-bibtex.brace-all')) {
    value = {literal: value};
  }

  var doublequote = value.literal;
  value = value.literal || value;
  value = convert.to_latex(value);
  if (doublequote) { value = '{' + value + '}'; }
  return value;
}

function writeField(field, value, bare) {
  if (typeof value == 'number') {
  } else {
    if (!value || value == '') { return; }
  }

  if (!bare) { value = '{' + value + '}'; }

  Zotero.write(",\n\t" + field + " = " + value);
}

function mapHTMLmarkup(characters){
  //converts the HTML markup allowed in Zotero for rich text to TeX
  //since  < and > have already been escaped, we need this rather hideous code - I couldn't see a way around it though.
  //italics and bold
  characters = characters.replace(/\{\\textless\}i\{\\textgreater\}(.+?)\{\\textless\}\/i{\\textgreater\}/g, "\\textit{$1}")
    .replace(/\{\\textless\}b\{\\textgreater\}(.+?)\{\\textless\}\/b{\\textgreater\}/g, "\\textbf{$1}");
  //sub and superscript
  characters = characters.replace(/\{\\textless\}sup\{\\textgreater\}(.+?)\{\\textless\}\/sup{\\textgreater\}/g, "\$^{\\textrm{$1}}\$")
    .replace(/\{\\textless\}sub\{\\textgreater\}(.+?)\{\\textless\}\/sub\{\\textgreater\}/g, "\$_{\\textrm{$1}}\$");
  //two variants of small caps
  characters = characters.replace(/\{\\textless\}span\sstyle=\"small\-caps\"\{\\textgreater\}(.+?)\{\\textless\}\/span{\\textgreater\}/g, "\\textsc{$1}")
    .replace(/\{\\textless\}sc\{\\textgreater\}(.+?)\{\\textless\}\/sc\{\\textgreater\}/g, "\\textsc{$1}");
  return characters;
}


function mapTeXmarkup(tex){
  //reverse of the above - converts tex mark-up into html mark-up permitted by Zotero
  //italics and bold
  tex = tex.replace(/\\textit\{([^\}]+\})/g, "<i>$1</i>").replace(/\\textbf\{([^\}]+\})/g, "<b>$1</b>");
  //two versions of subscript the .* after $ is necessary because people m
  tex = tex.replace(/\$[^\{\$]*_\{([^\}]+\})\$/g, "<sub>$1</sub>").replace(/\$[^\{]*_\{\\textrm\{([^\}]+\}\})/g, "<sub>$1</sub>");
  //two version of superscript
  tex = tex.replace(/\$[^\{]*\^\{([^\}]+\}\$)/g, "<sup>$1</sup>").replace(/\$[^\{]*\^\{\\textrm\{([^\}]+\}\})/g, "<sup>$1</sup>");
  //small caps
  tex = tex.replace(/\\textsc\{([^\}]+)/g, "<span style=\"small-caps\">$1</span>");
  return tex;
}
//Disable the isTitleCase function until we decide what to do with it.
/* const skipWords = ["but", "or", "yet", "so", "for", "and", "nor",
  "a", "an", "the", "at", "by", "from", "in", "into", "of", "on",
  "to", "with", "up", "down", "as", "while", "aboard", "about",
  "above", "across", "after", "against", "along", "amid", "among",
  "anti", "around", "as", "before", "behind", "below", "beneath",
  "beside", "besides", "between", "beyond", "but", "despite",
  "down", "during", "except", "for", "inside", "like", "near",
  "off", "onto", "over", "past", "per", "plus", "round", "save",
  "since", "than", "through", "toward", "towards", "under",
  "underneath", "unlike", "until", "upon", "versus", "via",
  "within", "without"];

function isTitleCase(string) {
  const wordRE = /[\s[(]([^\s,\.:?!\])]+)/g;

  var word;
  while (word = wordRE.exec(string)) {
    word = word[1];
    if(word.search(/\d/) != -1  //ignore words with numbers (including just numbers)
      || skipWords.indexOf(word.toLowerCase()) != -1) {
      continue;
    }

    if(word.toLowerCase() == word) return false;
  }
  return true;
}
*/

var biblatexdataRE = /biblatexdata\[([^\]]+)\]/;
function writeBiblatexData(item) {
  var m = biblatexdataRE.exec(item.extra);
  if (!m) { return; }

  item.extra = item.extra.replace(m[0], '').trim();
  m[1].split(';').forEach(function(assignment) {
    var data = assignment.split('=', 2);
    writeField(data[0], escape(data[1]));
  });
}

function Formatter(item, pattern, parent)
{
  var _item = item;
  var _pattern = pattern;
  var _parent = (parent ? new Formatter(parent) : null);
  var _this = this;

  function getCreators(onlyEditors) {
    if(!_item.creators || !_item.creators.length) { return []; }
    var creators = {};
    var primaryCreatorType = Zotero.Utilities.getCreatorsForType(_item.itemType)[0];
    var creator;
    _item.creators.forEach(function(creator) {
      var name = ('' + creator.lastName).trim();
      if (name != '') {
        switch (creator.creatorType) {
          case 'editor':
          case 'seriesEditor':
            if (!creators.editors) { creators.editors = []; }
            creators.editors.push(name);
            break;
          case 'translator':
            if (!creators.translators) { creators.translators = []; }
            creators.translators.push(name);
            break;
          case primaryCreatorType:
            if (!creators.authors) { creators.authors = []; }
            creators.authors.push(name);
            break;
          default:
            if (!creators.collaborators) { creators.collaborators = []; }
            creators.collaborators.push(name);
        }
      }
    });

    if (onlyEditors) { return creators.editors; }
    return creators.authors || creators.editors || creators.collaborators || creators.translators || null;
  }

  function words(str) {
    return str.split(/\s+/).filter(function(word) { return (word != '');}).map(function (word) { return CiteKeys.clean(word) });
  }

  _skipWords = [
    'a',
    'aboard',
    'about',
    'above',
    'across',
    'after',
    'against',
    'al',
    'along',
    'amid',
    'among',
    'an',
    'and',
    'anti',
    'around',
    'as',
    'at',
    'before',
    'behind',
    'below',
    'beneath',
    'beside',
    'besides',
    'between',
    'beyond',
    'but',
    'by',
    'd',
    'das',
    'de',
    'del',
    'der',
    'des',
    'despite',
    'die',
    'do',
    'down',
    'during',
    'ein',
    'eine',
    'einem',
    'einen',
    'einer',
    'eines',
    'el',
    'except',
    'for',
    'from',
    'in',
    'inside',
    'into',
    'l',
    'la',
    'las',
    'le',
    'like',
    'los',
    'near',
    'nor',,
    'of',
    'off',
    'on',
    'onto',
    'or',
    'over',
    'past',
    'per',
    'plus',
    'round',
    'save',
    'since',
    'so',
    'some',
    'than',
    'the',
    'through',
    'to',
    'toward',
    'towards',
    'un',
    'una',
    'unas',
    'under',
    'underneath',
    'une',
    'unlike',
    'uno',
    'unos',
    'until',
    'up',
    'upon',
    'versus',
    'via',
    'while',
    'with',
    'within',
    'without',
    'yet'
  ];

  function titleWords(title, options) {
    if (!title) { return null; }

    var _words = words(title);

    options = options || {};
    if (options.asciiOnly) { _words = _words.map(function (word) { return word.replace(/[^a-zA-Z]/, ''); }); }
    _words = _words.filter(function(word) { return (word != ''); });
    if (options.skipWords) { _words = _words.filter(function(word) { return (_skipWords.indexOf(word.toLowerCase()) == -1); }); }
    if (_words.length == 0) { return null; }
    return _words;
  }

  this.function = {
    id: function() {
      return _item.itemID;
    },

    key: function() {
      return _item.key;
    },

    auth: function(onlyEditors, n, m) {
      var authors = getCreators(onlyEditors);
      if (!authors) { return null; }

      var author = authors[m || 0];
      if (author && n) { author = author.substring(0, n); }
      return author;
    },

    type: function() {
      return getBibTexType(_item);
    },

    authorLast: function(onlyEditors) {
      var authors = getCreators(onlyEditors);
      if (!authors) { return null; }

      return authors[authors.length - 1];
    },

    authors: function(onlyEditors, n) {
      var authors = getCreators(onlyEditors);
      if (!authors) { return null; }

      if (n) {
        var etal = (authors.length > n);
        authors = authors.slice(0, n);
        if (etal) { authors.push('EtAl'); }
      }
      authors = authors.join('.');
      return authors;
    },

    authorsAlpha: function(onlyEditors) {
      var authors = getCreators(onlyEditors);
      if (!authors) { return null; }

      switch (authors.length) {
        case 1:
          return authors[0].substring(0, 3);
        case 2:
        case 3:
        case 4:
          return authors.map(function(author) { return author.substring(0, 1); }).join('');
        default:
          return authors.slice(0, 3).map(function(author) { return author.substring(0, 1); }).join('') + '+';
      }
    },

    authIni: function(onlyEditors, n) {
      var authors = getCreators(onlyEditors);
      if (!authors) { return null; }

      return authors.map(function(author) { return author.substring(0, n); }).join('.');
    },

    authorIni: function(onlyEditors) {
      var authors = getCreators(onlyEditors);
      if (!authors) { return null; }

      var firstAuthor = authors.shift();

      return [firstAuthor.substring(0, 5)].concat(authors.map(function(author) {
        return auth.split(/\s+/).map(function(name) { return name.substring(0, 1); }).join('');
      })).join('.');
    },

    'auth.auth.ea': function(onlyEditors) {
      var authors = getCreators(onlyEditors);
      if (!authors) { return null; }

      return authors.slice(0,2).concat(authors.length > 2 ? ['ea'] : []).join('.')
    },

    'auth.etal': function(onlyEditors) {
      var authors = getCreators(onlyEditors);
      if (!authors) { return null; }

      return authors.slice(0,2).concat(authors.length > 2 ? ['ea'] : []).join('.')
    },

    authshort: function(onlyEditors) {
      var authors = getCreators(onlyEditors);
      if (!authors) { return null; }

      switch (authors.length) {
        case 0:   return null;
        case 1:   return authors[0];
        default:  return authors.map(function(author) { return author.substring(0, 1); }).join('.') + (authors.length > 3 ? '+' : '');
      }
    },

    firstpage: function() {
      if (!_item.pages) { return null;}
      var firstpage = null;
      _item.pages.replace(/^([0-9]+)/, function(match, fp) { firstpage = fp; });
      return firstpage;
    },

    keyword: function(dummy, n) {
      if (!_item.tags || !_item.tags[n]) { return null; }
      return _item.tags[n].tag;
    },

    lastpage: function() {
      if (!_item.pages) { return null;}
      var lastpage = null;
      _item.pages.replace(/([0-9]+)[^0-9]*$/, function(match, lp) { lastpage = lp; });
      return lastpage;
    },

    shorttitle: function() {
      var words = titleWords(_item.title, {skipWords: true, asciiOnly: true});
      if (!words) { return null; }
      return words.slice(0,3).join('');
    },

    veryshorttitle: function() {
      var words = titleWords(_item.title, {skipWords: true, asciiOnly: true});
      if (!words) { return null; }
      return words.slice(0,1).join('');
    },

    shortyear: function() {
      if (!_item.date) { return null; }
      var date = Zotero.Utilities.strToDate(_item.date);
      if (typeof date.year === 'undefined') { return null; }
      var year = date.year % 100;
      if (year < 10) { return '0' + year; }
      return year + '';
    },

    year: function() {
      if (!_item.date) { return null; }
      var date = Zotero.Utilities.strToDate(_item.date);
      if (typeof date.year === 'undefined') { return _item.date; }
      return date.year;
    },

    title: function() {
      return titleWords(_item.title).join('');
    },

    filename: function() {
      if (_item.itemType == 'attachment') { return _item.title; }
      return null;
    }
  };

  this.filter = {
    condense: function(value) {
      return value.replace(/\s/, '');
    },

    abbr: function(value) {
      return value.split(/\s+/).map(function(word) { return word.substring(0, 1); }).join('');
    },

    lower: function(value) {
      return value.toLowerCase();
    },

    upper: function(value) {
      return value.toUpperCase();
    },

    'id-': function(value) {
      return _item.itemID + '-' + value;
    },

    '-id': function(value) {
      var parts = value.split('.');
      if (parts.length < 2) { return value + '-' + _item.itemID; }
      parts[parts.length - 2] += '-' + _item.itemID;
      return parts.join('.');
    }
  };

  function call(type, name) {
    var table = _this[type];
    if (!table) { throw('!!No type "' + type + '"'); }
    if (name.indexOf('!') == 0) {
      if (!_parent) { throw('Parent ' + type + ' requested but no parent available'); }
      table = _parent[type];
      name = name.substring(1, name.length);
    }
    if (!table) { throw('No type "' + type + '"'); }

    var _f = table[name];
    if (typeof _f === 'function') { return _f; }
    throw('No format ' + type + ' "' + name + '"');
  }

  this.format = function() {
    return _pattern.replace(/\[([^\]]+)\]/g, function(match, command) {
      var _filters = command.split(':');
      var _function = _filters.shift();
      var value = null;

      var N = null;
      var M = null;
      _function.replace(/([0-9]+)_([0-9]+)$/, function(match, n, m) { N = n; M = m; return ''; });
      _function.replace(/([0-9]+)$/, function(match, n) { N = n; return ''; });

      var onlyEditors = (_function.match(/^edtr/) || _function.match(/^editors/));
      _function = _function.replace(/^edtr/, 'auth').replace(/^editors/, 'authors');

      var value = call('function', _function)(onlyEditors, N, M);

      _filters.forEach(function(filter) {
        if (filter.match(/^[(].*[)]$/)) { // text between braces is default value in case a filter fails
          if (!value) { value = filter.substring(1, filter.length - 2); }
        } else {
          if (value) { value = call('filter', filter)(value); }
        }
      });

      return value ? value : '';
    });
  }
}

var CiteKeys = {
  keys: [],
  embeddedKeyRE: /bibtex:\s*([^\s\r\n]+)/,
  andersJohanssonKeyRE: /biblatexcitekey\[([^\]]+)\]/,
  unsafechars: /[^-_a-z0-9!\$\*\+\.\/:;\?\[\]]/ig,

  initialize: function(items) {
    CiteKeys.items = {};

    if (!items) {
      trLog('Export running, fetching items...');
      items = {};
      var item;
      while (item = Zotero.nextItem()) {
        trLog('Adding ' + item.itemID);
        items[item.itemID] = item; // duplicates?!
      }
      items = Object.keys(items).map(function (key) { return items[key]; });
      trLog('Fetching ' + items.length + ' items...');
    }

    var generate = [];

    trLog('Pinned items...');
    items.forEach(function(item) {
      if (item.itemType == "note" || item.itemType == "attachment") return;

      // all pinned items first. Do *not* call generate yet, as this would register it!
      if (CiteKeys.embeddedKeyRE.exec(item.extra)) {
        CiteKeys.items[item.itemID] = {key: CiteKeys.build(item)};
        trLog(item.itemID + ' pinned: ' + CiteKeys.items[item.itemID].key);
      } else {
        generate.push(item);
      }
    });

    trLog('Generating keys for ' + items.length + ' items...');
    generate.forEach(function(item) {
      CiteKeys.items[item.itemID] = {key: CiteKeys.build(item)};
      trLog(item.itemID + ' generated: ' + CiteKeys.items[item.itemID].key);
    });

    for (var key of Object.keys(CiteKeys.keys)) {
      var duplicates = CiteKeys.keys[key].duplicates;
      duplicates.forEach(function(source) {
        if (source.pinned) {
          CiteKeys.items[source.item].pinned = true;
        } else {
          if (CiteKeys.items[source.item].key != CiteKeys.keys[key].original) {
            CiteKeys.items[source.item].default = CiteKeys.keys[key].original;
          }
        }

        duplicates.forEach(function(target) {
          if (source.item != target.item) {
            CiteKeys.items[source.item].duplicates = CiteKeys.items[source.item].duplicates || [];
            CiteKeys.items[source.item].duplicates.push(target.item);
          }
        });
      });
    }

    return items;
  },

  extract: function(item) {
    if (!item.extra) { return null; }

    var m = CiteKeys.embeddedKeyRE.exec(item.extra) || CiteKeys.andersJohanssonKeyRE.exec(item.extra);
    if (!m) { return null; }

    item.extra = item.extra.replace(m[0], '').trim();
    var key = m[1];
    if (CiteKeys.keys[key]) { trLog('BibTex export: duplicate key ' + key); }
    return key;
  },

  register: function(item, key, pinned) {
    var postfix;
    if (CiteKeys.keys[key]) {
      CiteKeys.keys[key].duplicates.push({item: item.itemID, pinned: pinned});
      if (pinned) { return key; }
      postfix = {n: 0, c:'a'};
      while (CiteKeys.keys[key + postfix.c]) {
        postfix.n++;
        postfix.c = String.fromCharCode('a'.charCodeAt() + postfix.n)
      }
      postfix = postfix.c;
    } else {
      postfix = '';
    }
    CiteKeys.keys[key + postfix] = {original: key, duplicates: [{item: item.itemID, pinned: pinned}]};
    return key + postfix;
  },

  clean: function(str) {
    str = ZU.removeDiacritics(str).replace(CiteKeys.unsafechars, '').trim();
    return str;
  },

  build: function(item) {
    var citekey = CiteKeys.extract(item);
    if (citekey) { return CiteKeys.register(item, citekey, true); }

    citekey = CiteKeys.clean((new Formatter(item, Zotero.getHiddenPref('better-bibtex.citeKeyFormat'))).format());
    return CiteKeys.register(item, citekey);
  }
};
