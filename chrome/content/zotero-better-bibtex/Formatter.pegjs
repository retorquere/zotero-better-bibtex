{
'use strict';

  var Formatter = {
    unsafechars: function() {
      var safechars = /[-:a-z0-9_!\$\*\+\.\/;\?\[\]]/ig;
      // not  "@',\#{}%
      var unsafechars = '' + safechars;
      unsafechars = unsafechars.substring(unsafechars.indexOf('/') + 1, unsafechars.lastIndexOf('/'));
      unsafechars = unsafechars.substring(0, 1) + '^' + unsafechars.substring(1, unsafechars.length);
      unsafechars = new RegExp(unsafechars, 'ig');
      return unsafechars;
    }(),

    clean: function(str) {
      return Zotero.Utilities.removeDiacritics(str).replace(this.unsafechars, '').trim();
    },

    words: function(str) {
      return this.stripHTML('' + str).split(/[\+\.,-\/#!$%\^&\*;:{}=\-\s`~()]+/).filter(function(word) { return (word !== '');}).map(function (word) { return Formatter.clean(word); });
    },

    /*
     * three-letter month abbreviations. I assume these are the same ones that the
     * docs say are defined in some appendix of the LaTeX book. (i don't have the
     * LaTeX book.)
    */
    months: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],

    skipWords: [
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
      'is',
      'inside',
      'into',
      'l',
      'la',
      'las',
      'le',
      'les',
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
      'yet',
      'zu',
      'zum'
    ],

    titleWords: function(title, options) {
      if (!title) { return null; }

      var words = this.words(title);

      options = options || {};
      if (options.asciiOnly) { words = words.map(function (word) { return word.replace(/[^ -~]/g, ''); }); }
      words = words.filter(function(word) { return (word !== ''); });
      if (options.skipWords) { words = words.filter(function(word) { return (Formatter.skipWords.indexOf(word.toLowerCase()) < 0); }); }
      if (words.length === 0) { return null; }
      return words;
    },

    stripHTML: function(str) {
      return str.replace(/<\/?(sup|sub|i|b|p|span|br|break)\/?>/g, '').replace(/\s+/, ' ').trim();
    },

    caseNotUpperTitle: Zotero.Utilities.XRegExp('[^\\p{Lu}\\p{Lt}]', 'g'),
    caseNotUpper: Zotero.Utilities.XRegExp('[^\\p{Lu}]', 'g'),
    getCreators: function(onlyEditors, withInitials) {
      if(!this.item.creators || !this.item.creators.length) { return []; }

      var kind = (onlyEditors ? 'editors' : 'authors');
      if (withInitials) { kind += '+initials'; }
      if (typeof this.creators[kind] === 'undefined') {
        var creators = {};
        var primaryCreatorType = Zotero.Utilities.getCreatorsForType(this.item.itemType)[0];
        var creator;
        this.item.creators.forEach(function(creator) {
          var name = Formatter.stripHTML('' + creator.lastName);
          if (name !== '') {
            if (withInitials && creator.firstName) {
              var initials = Zotero.Utilities.XRegExp.replace(creator.firstName, Formatter.caseNotUpperTitle, '', 'all');
              initials = Zotero.Utilities.removeDiacritics(initials);
              initials = Zotero.Utilities.XRegExp.replace(initials, Formatter.caseNotUpper, '', 'all');
              name += initials;
            }
          } else {
            name = Formatter.stripHTML('' + creator.firstName);
          }
          if (name !== '') {
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

        if (onlyEditors) {
          this.creators[kind] = creators.editors || [];
        } else {
          this.creators[kind] = creators.authors || creators.editors || creators.collaborators || creators.translators || [];
        }
      }
      return this.creators[kind];
    },

    '=id': function() {
      return this.itemID;
    },

    '=key': function() {
      return this.item.key;
    },

    '=auth': function(onlyEditors, withInitials, n, m) {
      var authors = this.getCreators(onlyEditors, withInitials);
      if (!authors) { return ''; }

      var author = authors[m || 0];
      if (author && n) { author = author.substring(0, n); }
      return (author || '');
    },

    // only works in translator
    '=type': function() {
      return getBibTeXType(this.item);
    },

    '=authorLast': function(onlyEditors, withInitials) {
      var authors = this.getCreators(onlyEditors, withInitials);
      if (!authors) { return ''; }

      return (authors[authors.length - 1] || '');
    },

    '=journal': function() {
      return Zotero.BetterBibTeX.keymanager.journalAbbrev(this.item);
    },

    '=authors': function(onlyEditors, withInitials, n) {
      var authors = this.getCreators(onlyEditors, withInitials);
      if (!authors) { return ''; }

      if (n) {
        var etal = (authors.length > n);
        authors = authors.slice(0, n);
        if (etal) { authors.push('EtAl'); }
      }
      authors = authors.join('');
      return authors;
    },

    '=authorsAlpha': function(onlyEditors, withInitials) {
      var authors = this.getCreators(onlyEditors, withInitials);
      if (!authors) { return ''; }

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

    '=authIni': function(onlyEditors, withInitials, n) {
      var authors = this.getCreators(onlyEditors, withInitials);
      if (!authors) { return ''; }

      return authors.map(function(author) { return author.substring(0, n); }).join('.');
    },

    '=authorIni': function(onlyEditors, withInitials) {
      var authors = this.getCreators(onlyEditors, withInitials);
      if (!authors) { return ''; }

      var firstAuthor = authors.shift();

      return [firstAuthor.substring(0, 5)].concat(authors.map(function(author) {
        return auth.split(/\s+/).map(function(name) { return name.substring(0, 1); }).join('');
      })).join('.');
    },

    '=auth.auth.ea': function(onlyEditors, withInitials) {
      var authors = this.getCreators(onlyEditors, withInitials);
      if (!authors) { return ''; }

      return authors.slice(0,2).concat(authors.length > 2 ? ['ea'] : []).join('.');
    },

    '=auth.etal': function(onlyEditors, withInitials) {
      var authors = this.getCreators(onlyEditors, withInitials);
      if (!authors) { return ''; }

      if (authors.length === 2) { return authors.join('.'); }

      return authors.slice(0,1).concat(authors.length > 1 ? ['etal'] : []).join('.');
    },

    '=authshort': function(onlyEditors, withInitials) {
      var authors = this.getCreators(onlyEditors, withInitials);
      if (!authors) { return ''; }

      switch (authors.length) {
        case 0:   return '';
        case 1:   return authors[0];
        default:  return authors.map(function(author) { return author.substring(0, 1); }).join('.') + (authors.length > 3 ? '+' : '');
      }
    },

    '=firstpage': function() {
      if (!this.item.pages) { return '';}
      var firstpage = '';
      this.item.pages.replace(/^([0-9]+)/g, function(match, fp) { firstpage = fp; });
      return firstpage;
    },

    '=keyword': function(dummy, n) {
      if (!this.item.tags || !this.item.tags[n]) { return ''; }
      return this.item.tags[n].tag;
    },

    '=lastpage': function() {
      if (!this.item.pages) { return '';}
      var lastpage = '';
      this.item.pages.replace(/([0-9]+)[^0-9]*$/g, function(match, lp) { lastpage = lp; });
      return lastpage;
    },

    '=shorttitle': function() {
      var words = this.titleWords(this.item.title, {skipWords: true, asciiOnly: true});
      if (!words) { return ''; }
      return words.slice(0,3).join('');
    },

    '=veryshorttitle': function() {
      var words = this.titleWords(this.item.title, {skipWords: true, asciiOnly: true});
      if (!words) { return ''; }
      return words.slice(0,1).join('');
    },

    '=shortyear': function() {
      if (!this.item.date) { return ''; }
      var date = Zotero.Date.strToDate(this.item.date);
      if (typeof date.year === 'undefined') { return ''; }
      var year = date.year % 100;
      if (year < 10) { return '0' + year; }
      return year + '';
    },

    '=year': function() {
      if (!this.item.date) { return ''; }
      var date = Zotero.Date.strToDate(this.item.date);
      if (typeof date.year === 'undefined') { return this.item.date; }
      return date.year;
    },

    '=month': function() {
      if (!this.item.date) { return ''; }
      var date = Zotero.Date.strToDate(this.item.date);
      if (typeof date.year === 'undefined') { return ''; }
      return (this.months[date.month] || '');
    },

    '=title': function() {
      return this.titleWords(this.item.title).join('');
    },

    '|': function(value, dflt) {
      if (value === '') { return dflt; }
      return value;
    },

    '|condense': function(value, sep) {
      if (typeof sep === 'undefined') { sep = ''; }
      return value.replace(/\s/g, sep);
    },

    '|abbr': function(value) {
      return value.split(/\s+/).map(function(word) { return word.substring(0, 1); }).join('');
    },

    '|lower': function(value) {
      return value.toLowerCase();
    },

    '|upper': function(value) {
      return value.toUpperCase();
    },

    '|skipwords': function(value) {
      return value.split(/\s+/).filter(function(word) { return (Formatter.skipWords.indexOf(word.toLowerCase()) < 0); }).join(' ').trim();
    },

    '|select': function(value, start, n) {
      value = value.split(/\s+/);
      var end = value.length;

      if (typeof start === 'undefined') { start = 1; }
      start = parseInt(start) - 1;

      if (typeof n !== 'undefined') { end = start + parseInt(n); }

      return value.slice(start, end).join(' ');
    },

    '|ascii': function(value) {
      return value.replace(/[^ -~]/g, '').split(/\s+/).join(' ').trim();
    },

    '|fold': function(value) {
      return Zotero.Utilities.removeDiacritics(value).split(/\s+/).join(' ').trim();
    },

    '|capitalize': function(value) {
      return value.replace(/((^|\s)[a-z])/g, function(m) { return m.toUpperCase(); });
    },

    punct: Zotero.Utilities.XRegExp('\\p{Pc}|\\p{Pd}|\\p{Pe}|\\p{Pf}|\\p{Pi}|\\p{Po}|\\p{Ps}', 'g'),
    '|nopunct': function(value) {
      return Zotero.Utilities.XRegExp.replace(value, this.punct, '', 'all');
    }
  };
}

start
  = formatter:formatter {
      var parser = Function('item', formatter);
      parser.prototype = Formatter;
      return parser;
  }

formatter
  = patterns:pattern+ {
      var f = [
        'this.item = item;',
        'this.creators = {};',
        'this.value = null;'
      ];
      patterns.forEach(function(pattern) {
        f.push('if (!this.value) { this.value = ' + pattern + '; }');
      });
      f.push('if (this.value) { this.value = this.clean(this.value); }');
      f.push('if (!this.value) { this.value = "zotero-" + this.item.libraryID + "-" + this.item.itemID; }');
      return f.join("\n");
  }

pattern
  = callchain:callchain+ '|'? { return callchain.join('+'); }

callchain
  = '[' fcall:fcall ']'   { return fcall; }
  / chars:[^\|\[\]]+      { return JSON.stringify(chars.join('')); }

fcall
  = method:method filters:filter* {
      var code = method;
      filters.forEach(function(filter) {
        code = filter.prefix + code + filter.postfix;
      });
      return code;
  }

method
  = prefix:('auth' / 'authors') postfix:[\.a-zA-Z]* flag:flag? params:mparams? {
      params = ['false', flag == 'initials' ? 'true' : 'false'].concat(params || []);
      return 'this["=' + prefix + postfix.join('') + '"](' + params.join(',') + ')';
    }
  / prefix:('edtr' / 'editors') postfix:[\.a-zA-Z]* flag:flag? params:mparams? {
      params = ['true', flag == 'initials' ? 'true' : 'false'].concat(params || []);
      if (prefix === 'edtr') {
        prefix = 'auth';
      } else {
        prefix = 'authors';
      }
      return 'this["=' + prefix + postfix.join('') + '"](' + params.join(',') + ')';
    }
  / name:[\.a-zA-Z]+ flag:flag? params:mparams? {
      name = name.join('');
      if (Formatter['=' + name]) {
        return 'this["=' + name + '"](' + (params || []).join(',') + ')';
      }

      return 'this.stripHTML(this.item["' + name + '"] || this.item["' + name.charAt(0).toLowerCase() + name.slice(1) + '"] || "")';
    }

mparams
  = n:[0-9]+ '_' m:[0-9]+ { return [parseInt(n.join('')), parseInt(m.join(''))]; }
  / n:[0-9]+ { return [parseInt(n.join(''))]; }

flag
  = '+' flag:[^_:\]]+ { return flag.join(''); }

filter
  = ':(' def:[^)]+ ')' {
      return {prefix: 'this["|"](', postfix: ',' + JSON.stringify(def.join('')) + ')'};
  }
  / ':' name:[^:\],]+ params:fparam* {
      params = params.map(function(p) { return JSON.stringify(p); });
      if (params.length > 0) { params.unshift(''); }
      return {prefix: 'this["|' + name.join('') + '"](', postfix: params.join(',') + ')'};
    }

fparam
  = ',' param:[^,\]:]+ { return param.join(''); }
