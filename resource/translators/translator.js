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

    iterate (attribute:key from preferences) {
      config.preferences[key] = Translator[attribute];
    }
    iterate (attribute:key from options) {
      config.options[key] = Translator[attribute];
    }
    return config;
  };

  var initialized = false;
  this.initialize = function() {
    if (initialized) { return; }
    initialized = true;

    iterate (attribute:key from preferences) {
      Translator[attribute] = Zotero.getHiddenPref('better-bibtex.' + key);
    }
    this.skipFields = this.skipFields.split(',').map(function(field) { return field.trim(); });
    Translator.testmode = Zotero.getHiddenPref('better-bibtex.testmode');

    iterate (attribute:key from options) {
      Translator[attribute] = Zotero.getOption(key);
    }
    Translator.exportCollections = (typeof Translator.exportCollections == 'undefined' ? true : Translator.exportCollections);

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

      iterate (bibtex: zotero from typeMap) {
        bibtex = bibtex.trim().split(/\s+/);
        zotero = zotero.trim().split(/\s+/);

        iterate (type over bibtex) {
          if (this.typeMap.BibTeX2Zotero[type]) { return; }
          this.typeMap.BibTeX2Zotero[type] = zotero[0];
        }

        iterate (type over zotero) {
          if (this.typeMap.Zotero2BibTeX[type]) { return; }
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

    iterate (c over coll.children || coll.descendents) {
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

  self.collections = function() {
    if (!self.exportCollections) { return []; }

    var collections = [];
    each (collection from Zotero.nextCollection()) {
      collections.push(sanitizeCollection(collection));
    }
    return collections;
  };

  var startTime = null;
  var exported = 0;
  self.nextItem = function() {
    var item = null;
    each (i from Zotero.nextItem()) {
      if (i.itemType != 'note' && i.itemType != 'attachment') {
        item = i;
        break;
      }
    }
    if (!item) { return; }

    if (startTime) { Zotero.debug('Exported ' + exported + ' items, avg: ' + ((exported * 1000) / (Date.now() - startTime)) + ' items/sec'); }
    if (!startTime) { startTime = Date.now(); }
    exported += 1;

    if (!item) { return; }

    if (!initialized) { self.initialize(); }
    Translator.fieldsWritten = Dict({});

    // remove any citekey from extra -- the export doesn't need it
    Zotero.BetterBibTeX.keymanager.extract(item);
    item.__citekey__ = Zotero.BetterBibTeX.keymanager.get(item, 'on-export');
    this.citekeys[item.itemID] = item.__citekey__;
    return item;
  };

  this.Reference = function(item) {
    var fields = [];
    var self = this;

    this.itemtype = Translator.typeMap.Zotero2BibTeX[item.itemType] || 'misc';

    if (item.extra) {
      var m = /biblatexdata\[([^\]]+)\]/.exec(item.extra);
      if (m) {
        item.extra = item.extra.replace(m[0], '').trim();
        iterate (assignment over m[1].split(';')) {
          var data = assignment.match(/^([^=]+)=\s*(.*)/).slice(1);
          fields.push({name: data[0], value: data[1]});
        }
      }
    }

    iterate (attr:f from Translator.fieldMap) {
      if (!f.name) { return; }
      var o = JSON.parse(JSON.stringify(f));
      o.value = item[attr];
      this.add(o);
    }

    this.url = function(f) {
      var href = ('' + f.value).replace(/([#\\%&{}])/g, "\\$1");

      if (!Translator.unicode) {
        href = href.replace(/[^\x21-\x7E]/g, function(chr){ return "\\%" + ('00' + chr.charCodeAt(0).toString(16)).slice(-2); });
      }

      if (f.name === 'url' && Translator.fancyURLs) {
        return "\\href{" + href + "}{" + LaTeX.html2latex(url) + "}";
      }

      return href;
    };
    this.doi = function(f) {
      return this.url(f);
    };
    this.escape = function(f) {
      if (typeof f.value == 'number') { return f.value; }
      if (!f.value) { return null; }

      if (f.value instanceof Array) {
        if (f.value.length === 0) { return null; }
        return f.value.map(function(word) {
          var o = JSON.parse(JSON.stringify(f));
          o.value = word;
          return this.escape(o);
        }).join(f.sep);
      }

      var value = LaTeX.html2latex(f.value);
      if (f.value instanceof String) { value = String('{' + value + '}'); }
      return value;
    };
    this.tags = function(f) {
      if (!f.value || f.value.length === 0) { return null; }
      var tags = item.tags.map(function(tag) {return tag.tag;});
      tags.sort();
      f.value = tags;
      f.sep = ',';
      return this.escape(f);
    };

    var attachmentCounter = 0;
    this.attachments = function(f) {
      if (!f.value || f.value.length === 0) { return null; }

      var attachments = [];
      errors = [];
      iterate (att over f.value) {
        var a = {title: att.title, path: att.localPath, mimetype: att.mimeType};
        var save = (Translator.exportFileData && att.defaultPath && att.saveFile);

        if (save) { a.path = att.defaultPath; }

        if (!a.path) { return; } // amazon/googlebooks etc links show up as atachments without a path

        attachmentCounter += 1;
        if (save) {
          att.saveFile(a.path);
        } else {
          if (Translator.attachmentRelativePath) {
            a.path = "files/" + (Translator.testmode ? attachmentCounter : att.itemID) + "/" + att.localPath.replace(/.*[\/\\]/, '');
          }
        }

        if (a.path.match(/[{}]/)) { // latex really doesn't want you to do this.
          erross.push('BibTeX cannot handle file paths with braces: ' + JSON.stringify(a.path));
        } else {
          attachments.push(a);
        }
      }

      if (errors.length !== 0) { f.errors = errors; }
      if (attachments.length === 0) { return null; }

      attachments.sort(function(a, b) { return a.path.localeCompare(b.path); });
      return attachments.map(function(att) {
        return [att.title, att.path, att.mimetype].map(function(part) { return part.replace(/([\\{}:;])/g, "\\$1"); }).join(':');
      }).join(';');
    };

    /*
    {
      name:
      value:
      braces:
      braceAll:
      escape:
    }
    */
    function field(f) {
      if (Translator.skipFields.indexOf(f.name) >= 0) { return null; }

      var value;
      if (typeof f.value == 'number') {
        value = f.value;
      } else {
        if (!f.value || f.value === '') { return; }

        if (f.escape) {
          if (typeof this[f.escape] !== 'function') { throw('Unsupported escape function ' + f.escape); }
          value = this[f.escape](f);
        } else {
          value = this.escape(f);
        }

        if (value === '' || typeof(value) === 'undefined') { return null; }

        if (f.braces) { value = '{' + value + '}'; }
        if (f.braceAll) { value = '{' + value + '}'; }
      }

      return f.name + ' = ' + value;
    }

    this.add = function(field) {
      field.braces = typeof(field.braces) === 'undefined' || field.braces || field.protect || field.value.match(/\s/);
      field.protect = (typeof field.value !== 'number') && field.protect && Translator.braceAll;
      fields.push(field);
    };
    this.has = function(name) {
      return fields.filter(function(f) { return f.name === name; });
    };

    this.complete = function() {
      if (fields.length === 0) { this.add({name: 'type', value: this.itemtype}); }

      /*
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
      */

      var ref = '@' + this.itemtype + '{' + item.__citekey__ + ",\n";
      ref += fields.map(function(f) { return field(f); }).filter(function(f) { return f; }).join(",\n");
      ref += "\n}\n";

      Zotero.write(ref);
    };
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
      group = this.serialize(group, ';');

      var result = [group];
      iterate (coll over collection.collections) {
        result = result.concat(JabRef.exportGroup(coll, level + 1));
      }

      return result;
    }
  };

  this.exportGroups = function() {
    if (this.collections.length === 0) { return; }

    Zotero.write("\n\n@comment{jabref-meta: groupsversion:3;}\n");
    Zotero.write("@comment{jabref-meta: groupstree:\n");
    Zotero.write("0 AllEntriesGroup:;\n");

    var groups = [];

    iterate (collection over this.collections) {
      groups = groups.concat(JabRef.exportGroup(collection, 1));
    }
    Zotero.write(this.serialize(groups, ";\n", true) + ";\n}\n");
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
