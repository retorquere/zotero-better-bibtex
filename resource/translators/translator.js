var Translator = new function() {
  var self = this;

  self.id      =  TranslatorInfo.id;
  self.label   =  TranslatorInfo.label;
  self.unicode_default =  TranslatorInfo.unicode;
  self.release =  TranslatorInfo.release;
  self.citekeys = Dict();

  var preferences = {
    pattern:                'citeKeyFormat',
    skipFields:             'skipfields',
    usePrefix:              'useprefix',
    braceAll:               'brace-all',
    fancyURLs:              'fancyURLs',
    langid:                 'langid',
    attachmentRelativePath: 'attachmentRelativePath',
    autoAbbrev:             'auto-abbrev',
    autoAbbrevStyle:        'auto-abbrev.style',
    unicode:                'unicode',
    pinKeys:                'pin-citekeys'
  };
  var options = {
    useJournalAbbreviation: 'useJournalAbbreviation',
    exportCharset:          'exportCharset',
    exportFileData:         'exportFileData',
    exportNotes:            'exportNotes',
    exportCollections:      'Export Collections'
  };

  self.log = function(msg) {
    if (typeof msg != 'string') { msg = JSON.stringify(msg); }
    Zotero.debug('[' + this.label + '] ' + msg);
  };

  self.config = function() {
    var config = Dict();
    config.id = self.id;
    config.label = self.label;
    config.release = self.release;
    config.preferences = {};
    config.options = {};

    for_each (let attribute:let key of preferences) {
      config.preferences[key] = Translator[attribute];
    }
    for_each (let attribute:let key of options) {
      config.options[key] = Translator[attribute];
    }
    return config;
  };

  var initialized = false;
  this.BibLaTeXDataFieldMap = Dict();

  this.initialize = function() {
    if (initialized) { return; }
    initialized = true;

    for_each (let attr: let f of Translator.fieldMap) {
      if (!f.name) { continue; }
      this.BibLaTeXDataFieldMap[f.name] = f;
    }

    for_each (let attribute:let key of preferences) {
      Translator[attribute] = Zotero.getHiddenPref('better-bibtex.' + key);
    }
    this.skipFields = collect(for (field of this.skipFields.split(',')) field.trim());
    Translator.testmode = Zotero.getHiddenPref('better-bibtex.testmode');

    for_each (let attribute:let key of options) {
      Translator[attribute] = Zotero.getOption(key);
    }
    Translator.exportCollections = (typeof Translator.exportCollections === 'undefined' ? true : Translator.exportCollections);

    switch (this.unicode) {
      case 'always':
        this.unicode = true;
        break;
      case 'never':
        this.unicode = false;
        break;
      default:
        var charset = this.exportCharset;
        this.unicode = this.unicode_default || (charset && charset.toLowerCase() == 'utf-8');
        break;
    }

    Zotero.debug('Translator: ' + JSON.stringify(this.config()));

    if (this.typeMap) {
      var typeMap = this.typeMap;
      this.typeMap = {
        BibTeX2Zotero: Dict(),
        Zotero2BibTeX: Dict()
      };

      for_each (let bibtex: let zotero of typeMap) {
        bibtex = bibtex.trim().split(/\s+/);
        zotero = zotero.trim().split(/\s+/);

        for_each (let type in bibtex) {
          if (this.typeMap.BibTeX2Zotero[type]) { continue; }
          this.typeMap.BibTeX2Zotero[type] = zotero[0];
        }

        for_each (let type in zotero) {
          if (this.typeMap.Zotero2BibTeX[type]) { continue; }
          this.typeMap.Zotero2BibTeX[type] = bibtex[0];
        }

      }
    }
  };

  // The default collection structure passed is beyond screwed up.
  function sanitizeCollection(coll) {
    var sane = {
      name: coll.name,
      collections: [],
      items: []
    };

    for_each (let c in coll.children || coll.descendents) {
      switch (c.type) {
        case 'item':
          sane.items.push(c.id);
          break;

        case 'collection':
          sane.collections.push(sanitizeCollection(c));
          break;

        default:
          throw('Unexpected collection member type "' + c.type + '"');
      }
    }

    return sane;
  }

  this.collections = function() {
    if (!self.exportCollections) { return []; }

    var collections = [];
    for_each (let collection from Zotero.nextCollection()) {
      collections.push(sanitizeCollection(collection));
    }
    return collections;
  };

  var startTime = null;
  var exported = 0;
  this.nextItem = function() {
    var item = null;
    for_each (item from Zotero.nextItem()) {
      if (item.itemType != 'note' && item.itemType != 'attachment') {
        break;
      }
    }
    if (!item) { return; }

    if (startTime) { Zotero.debug('Exported ' + exported + ' items, avg: ' + ((exported * 1000) / (Date.now() - startTime)) + ' items/sec'); }
    if (!startTime) { startTime = Date.now(); }
    exported += 1;

    if (!item) { return; }

    if (!initialized) { self.initialize(); }

    // remove any citekey from extra -- the export doesn't need it
    Zotero.BetterBibTeX.keymanager.extract(item);
    item.__citekey__ = Zotero.BetterBibTeX.keymanager.get(item, 'on-export');
    this.citekeys[item.itemID] = item.__citekey__;
    return item;
  };

  var attachmentCounter = 0;
  this.Reference = function(item) {
    var fields = [];
    var self = this;

    this.itemtype = Translator.typeMap.Zotero2BibTeX[item.itemType] || 'misc';

    this.esc_url = function(f) {
      var href = ('' + f.value).replace(/([#\\%&{}])/g, "\\$1");

      if (!Translator.unicode) {
        href = href.replace(/[^\x21-\x7E]/g, function(chr){ return "\\%" + ('00' + chr.charCodeAt(0).toString(16)).slice(-2); });
      }

      if (f.name === 'url' && Translator.fancyURLs) {
        return "\\href{" + href + "}{" + LaTeX.html2latex(url) + "}";
      }

      return href;
    };

    this.esc_doi = function(f) {
      return this.esc_url(f);
    };

    this.esc_latex = function(f) {
      if (typeof f.value == 'number') { return f.value; }
      if (!f.value) { return null; }

      if (f.value instanceof Array) {
        if (f.value.length === 0) { return null; }

        return (collect (for (word of f.value)) { let o = JSON.parse(JSON.stringify(f)); o.value = word; word = this.esc_latex(o); }).join(f.sep);
      }

      var value = LaTeX.html2latex(f.value);
      if (f.value instanceof String) { value = String('{' + value + '}'); }
      return value;
    };

    this.esc_tags = function(f) {
      if (!f.value || f.value.length === 0) { return null; }
      var tags = collect(for (tag of item.tags) tag.tag);
      // sort tags for stable tests
      if (Translator.testmode) {
        tags.sort();
      }
      f.value = tags;
      f.sep = ',';
      return this.esc_latex(f);
    };

    this.esc_attachments = function(f) {
      if (!f.value || f.value.length === 0) { return null; }

      var attachments = [];
      errors = [];
      for_each (let att in f.value) {
        var a = {title: att.title, path: att.localPath, mimetype: att.mimeType};
        var save = (Translator.exportFileData && att.defaultPath && att.saveFile);

        if (save) { a.path = att.defaultPath; }

        if (!a.path) { continue; } // amazon/googlebooks etc links show up as atachments without a path

        attachmentCounter += 1;
        if (save) {
          att.saveFile(a.path);
        } else {
          if (Translator.attachmentRelativePath) {
            a.path = "files/" + (Translator.testmode ? attachmentCounter : att.itemID) + "/" + att.localPath.replace(/.*[\/\\]/, '');
          }
        }

        if (a.path.match(/[{}]/)) { // latex really doesn't want you to do this.
          errors.push('BibTeX cannot handle file paths with braces: ' + JSON.stringify(a.path));
        } else {
          attachments.push(a);
        }
      }

      if (errors.length !== 0) { f.errors = errors; }
      if (attachments.length === 0) { return null; }

      // sort attachments for stable tests
      if (Translator.testmode) {
        attachments.sort(function(a, b) { return a.path.localeCompare(b.path); });
      }

      return (collect(for (att of attachments)) {
        att = [att.title, att.path, att.mimetype];
        for_each (let part, let i in att) {
          att[i] = part.replace(/([\\{}:;])/g, "\\$1");
        }
        att = att.join(':')
      }).join(';');
    };

    /*
    {
      name:
      value:
      braces:
      protect:
      esc:
    }
    */
    function field(f) {
      if (Translator.skipFields.indexOf(f.name) >= 0) { return null; }

      var value;
      if (typeof f.value == 'number') {
        value = f.value;
      } else {
        if (f.esc) {
          if (typeof self['esc_' + f.esc] !== 'function') { throw('Unsupported escape function ' + f.esc); }
          value = self['esc_' + f.esc](f);
        } else {
          value = self.esc_latex(f);
        }

        if (!value) { return null; }

        if (f.braces) { value = '{' + value + '}'; }
        if (f.protect) { value = '{' + value + '}'; }
      }

      return '  ' + f.name + ' = ' + value;
    }

    this.add = function(field) {
      if (typeof field.value !== 'number' && !field.value) { return; }
      if (typeof field.value === 'string' && field.value.trim() === '') { return; }
      if (Array.isArray(field.value) && field.value.length === 0) { return; }

      field.braces = typeof(field.braces) === 'undefined' || field.braces || field.protect || field.value.match(/\s/);
      field.protect = (typeof field.value !== 'number') && field.protect && Translator.braceAll;
      fields.push(field);
    };
    this.has = function(name) {
      return (collect(for (f of fields) if (f.name === name) 1).length !== 0);
    };

    this.complete = function() {
      if (fields.length === 0) { this.add({name: 'type', value: this.itemtype}); }

      // sort fields for stable tests
      if (Translator.testmode) {
        fields.sort(function(a, b) {
          var _a = a.name;
          var _b = b.name;
          if (a.name == b.name) {
            _a = a.value;
            _b = b.value;
          }
          if (_a < _b) return -1;
          if (_a > _b) return 1;
          return 0;
        });
      }

      var ref = '@' + this.itemtype + '{' + item.__citekey__ + ",\n";
      ref += collect(for(filledfield of collect(for(f of fields) field(f))) if (filledfield) filledfield).join(",\n");
      ref += "\n}\n\n";

      Zotero.write(ref);
    };

    // initialization
    if (item.extra) {
      var m = /biblatexdata\[([^\]]+)\]/.exec(item.extra);
      if (m) {
        item.extra = item.extra.replace(m[0], '').trim();
        for_each (let assignment in m[1].split(';')) {
          var data = assignment.match(/^([^=]+)=\s*(.*)/).slice(1);
          var field = {name: data[0], value: data[1], protect: true};
          if (Translator.BibLaTeXDataFieldMap[field.name]) {
            field = JSON.parse(JSON.stringify(Translator.BibLaTeXDataFieldMap[field.name]));
            field.value = data[1];
          }
          fields.push(field);
        }
      }
    }

    for_each (let attr: let f of Translator.fieldMap) {
      if (!f.name || this.has(f.name)) { continue; }
      var o = JSON.parse(JSON.stringify(f));
      o.value = item[attr];
      this.add(o);
    }
  };

  var JabRef = {
    serialize: function(arr, sep, wrap) {
      return arr.map(function(v) {
        v = ('' + v).replace(/;/g, "\\;");
        if (wrap) { v = v.match(/.{1,70}/g).join("\n"); }
        return v;
      }).join(sep);
    },
    exportGroup: function(collection, level) {
      var group = [level + ' ExplicitGroup:' + collection.name, 0];
      group = group.concat(collection.items.map(function(id) { return Translator.citekeys[id]; }));
      group.push('');
      group = this.serialize(group, ';'); // not a function?!

      var result = [group];
      for_each (let coll in collection.collections) {
        result = result.concat(JabRef.exportGroup(coll, level + 1));
      }

      return result;
    }
  };

  this.exportGroups = function() {
    var collections = this.collections();
    if (collections.length === 0) { return; }

    Zotero.write("@comment{jabref-meta: groupsversion:3;}\n");
    Zotero.write("@comment{jabref-meta: groupstree:\n");
    Zotero.write("0 AllEntriesGroup:;\n");

    var groups = [];

    for_each (let collection in collections) {
      groups = groups.concat(JabRef.exportGroup(collection, 1));
    }
    Zotero.write(JabRef.serialize(groups, ";\n", true) + ";\n}\n");
  };
};


// @include "unicode_mapping.js"

LaTeX.toUnicode["\\url"] = '';
LaTeX.toUnicode["\\href"] = '';

LaTeX.html2latexsupport = {
  html2latex: {
    sup:      {open: "\\ensuremath{^{", close: "}}"},
    sub:      {open: "\\ensuremath{_{", close: "}}"},
    i:        {open: "\\emph{",         close: "}"},
    b:        {open: "\\textbf{",       close: "}"},
    p:        {open: "\n\n",            close: "\n\n"},
    span:     {open: "",                close: ""},
    br:       {open: "\n\n",            close: "", empty: true},
    'break':  {open: "\n\n",            close: "", empty: true}
  },

  htmlstack: [],

  htmltag: function(str) {
    var close;
    var tag = str.replace(/[^a-z]/ig, '').toLowerCase();
    var repl = LaTeX.html2latexsupport.html2latex[tag];

    // not a '/' at position 2 means it's an opening tag
    if (str.charAt(1) != '/') {
      // only add tag to the stack if it is not a self-closing tag. Self-closing tags ought to have the second-to-last
      // character be a '/', but this is not a perfect world (loads of <br>'s out there, so tags that always *ought*
      // to be empty are treated as such, regardless of whether the obligatory closing slash is present or not.
      if (str.slice(-2, 1) != '/' && !repl.empty) { LaTeX.html2latexsupport.htmlstack.unshift(tag); }
      return repl.open;
    }

    // if it's a closing tag, it ought to be the first one on the stack
    close = LaTeX.html2latexsupport.htmlstack.indexOf(tag);
    if (close < 0) {
      Translator.log('Ignoring unexpected close tag "' + tag + '"');
      return '';
    }

    if (close > 0) {
      Translator.log('Unexpected close tag "' + tag + '", closing "' + LaTeX.html2latexsupport.htmlstack.slice(0, close).join(', ') + '"');
    }

    close = LaTeX.html2latexsupport.htmlstack.slice(0, close).map(function(tag) { return html2latex[tag].close; }).join('');
    LaTeX.html2latexsupport.htmlstack = LaTeX.html2latexsupport.htmlstack.slice(close + 1);
    return repl.close;
  },

  unicode: function(str) {
    var regex = LaTeX.regex[Translator.unicode ? 'unicode' : 'ascii'];

    return str.split(regex.math).map(function(text, i) {

      var latex = text.replace(regex.text, function(match) {
        return (LaTeX.toLaTeX[match] || match);
      });

      if ((i % 2) == 1) { // odd element == splitter == block of math
        return '\\ensuremath{' + latex + '}';
      }

      return latex;

    }).join('');
  }

};

LaTeX.html2latex = function(str) {
  var tags = new RegExp('(' + Object.keys(LaTeX.html2latexsupport.html2latex).map(function(tag) { return '<\/?' + tag + '\/?>'; } ).join('|') + ')', 'ig');

  return ('' + str).split(/(<pre>.*?<\/pre>)/ig).map(function(chunk, pre) {
    if ((pre % 2) == 1) { // odd element = splitter == pre block

      return chunk.replace(/^<pre>/i, '').replace(/<\/pre>$/, '');

    } else {

      LaTeX.html2latexsupport.htmlstack = [];

      var res = chunk.split(tags).map(function(chunk, htmltag) {
        if ((htmltag % 2) == 1) { // odd element = splitter == html tag

          return LaTeX.html2latexsupport.htmltag(chunk);

        } else {

          return LaTeX.html2latexsupport.unicode(chunk);

        }
      }).join('').replace(/{}\s+/g, ' ');

      if (LaTeX.html2latexsupport.htmlstack.length !== 0) {
        Translator.log('Unmatched HTML tags: ' + LaTeX.html2latexsupport.htmlstack.join(', '));
        res += htmlstack.map(function(tag) { return LaTeX.html2latexsupport.html2latex[tag].close; }).join('');
      }

      return res;
    }
  }).join('');
};
