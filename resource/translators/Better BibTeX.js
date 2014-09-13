{
  "translatorID": "ca65189f-8815-4afe-8c8b-8c7c15f0edca",
  "label": "Better BibTeX",
  "creator": "Simon Kornblith, Richard Karnesky and Emiliano heyns",
  "target": "bib",
  "minVersion": "2.1.9",
  "maxVersion": "",
  "priority": 199,
  "configOptions": {
    "getCollections": "true"
  },
  "displayOptions": {
    "exportNotes": true,
    "exportFileData": false,
    "useJournalAbbreviation": false,
    "Export Collections": true
  },
  "inRepository": true,
  "translatorType": 3,
  "browserSupport": "gcsv",
  "lastUpdated": "2014-09-13 11:17:27"
}

var Translator = new function () {
        var self = this;
        self.id = 'ca65189f-8815-4afe-8c8b-8c7c15f0edca';
        self.label = 'Better BibTeX';
        self.unicode_default = false;
        self.release = '0.6.44';
        self.citekeys = Object.create(null);
        var preferences = {
                pattern: 'citeKeyFormat',
                skipFields: 'skipfields',
                usePrefix: 'useprefix',
                braceAll: 'brace-all',
                fancyURLs: 'fancyURLs',
                langid: 'langid',
                attachmentRelativePath: 'attachmentRelativePath',
                autoAbbrev: 'auto-abbrev',
                autoAbbrevStyle: 'auto-abbrev.style',
                unicode: 'unicode',
                pinKeys: 'pin-citekeys'
            };
        var options = {
                useJournalAbbreviation: 'useJournalAbbreviation',
                exportCharset: 'exportCharset',
                exportFileData: 'exportFileData',
                exportNotes: 'exportNotes',
                exportCollections: 'Export Collections'
            };
        self.log = function (msg) {
            if (typeof msg != 'string') {
                msg = JSON.stringify(msg);
            }
            Zotero.debug('[' + this.label + '] ' + msg);
        };
        self.config = function () {
            var config = Object.create(null);
            config.id = self.id;
            config.label = self.label;
            config.release = self.release;
            config.preferences = {};
            config.options = {};
            let dict = preferences;
            let keys = Object.keys(dict);
            let length = keys.length;
            let index;
            for (index = 0; index < length; index++) {
                let attribute = keys[index];
                if (!dict.hasOwnProperty(attribute)) {
                    continue;
                }
                let key = dict[attribute];
                config.preferences[key] = Translator[attribute];
            }
            dict = undefined;
            keys = undefined;
            let dict$2 = options;
            let keys$2 = Object.keys(dict$2);
            let length$2 = keys$2.length;
            let index$2;
            for (index$2 = 0; index$2 < length$2; index$2++) {
                let attribute = keys$2[index$2];
                if (!dict$2.hasOwnProperty(attribute)) {
                    continue;
                }
                let key = dict$2[attribute];
                config.options[key] = Translator[attribute];
            }
            dict$2 = undefined;
            keys$2 = undefined;
            return config;
        };
        var initialized = false;
        this.initialize = function () {
            if (initialized) {
                return;
            }
            initialized = true;
            let dict = preferences;
            let keys = Object.keys(dict);
            let length = keys.length;
            let index;
            for (index = 0; index < length; index++) {
                let attribute = keys[index];
                if (!dict.hasOwnProperty(attribute)) {
                    continue;
                }
                let key = dict[attribute];
                Translator[attribute] = Zotero.getHiddenPref('better-bibtex.' + key);
            }
            dict = undefined;
            keys = undefined;
            this.skipFields = this.skipFields.split(',').map(function (field) {
                return field.trim();
            });
            Translator.testmode = Zotero.getHiddenPref('better-bibtex.testmode');
            let dict$2 = options;
            let keys$2 = Object.keys(dict$2);
            let length$2 = keys$2.length;
            let index$2;
            for (index$2 = 0; index$2 < length$2; index$2++) {
                let attribute = keys$2[index$2];
                if (!dict$2.hasOwnProperty(attribute)) {
                    continue;
                }
                let key = dict$2[attribute];
                Translator[attribute] = Zotero.getOption(key);
            }
            dict$2 = undefined;
            keys$2 = undefined;
            Translator.exportCollections = typeof Translator.exportCollections == 'undefined' ? true : Translator.exportCollections;
            switch (this.unicode) {
            case 'always':
                this.unicode = true;
                break;
            case 'never':
                this.unicode = false;
                break;
            default:
                var charset = this.exportCharset;
                this.unicode = this.unicode_default || charset && charset.toLowerCase() == 'utf-8';
                break;
            }
            Zotero.debug('Translator: ' + JSON.stringify(this.config()));
            if (this.typeMap) {
                var typeMap = this.typeMap;
                this.typeMap = {
                    BibTeX2Zotero: Object.create(null),
                    Zotero2BibTeX: Object.create(null)
                };
                let dict$3 = typeMap;
                let keys$3 = Object.keys(dict$3);
                let length$3 = keys$3.length;
                let index$3;
                for (index$3 = 0; index$3 < length$3; index$3++) {
                    let bibtex = keys$3[index$3];
                    if (!dict$3.hasOwnProperty(bibtex)) {
                        continue;
                    }
                    let zotero = dict$3[bibtex];
                    bibtex = bibtex.trim().split(/\s+/);
                    zotero = zotero.trim().split(/\s+/);
                    let type;
                    let items = bibtex;
                    let length$4 = items.length;
                    let i;
                    for (i = 0; i < length$4; i++) {
                        type = items[i];
                        if (this.typeMap.BibTeX2Zotero[type]) {
                            return;
                        }
                        this.typeMap.BibTeX2Zotero[type] = zotero[0];
                    }
                    items = undefined;
                    let type;
                    let items$2 = zotero;
                    let length$5 = items$2.length;
                    let i$2;
                    for (i$2 = 0; i$2 < length$5; i$2++) {
                        type = items$2[i$2];
                        if (this.typeMap.Zotero2BibTeX[type]) {
                            return;
                        }
                        this.typeMap.Zotero2BibTeX[type] = bibtex[0];
                    }
                    items$2 = undefined;
                }
                dict$3 = undefined;
                keys$3 = undefined;
            }
        };
        // The default collection structure passed is beyond screwed up.
        function sanitizeCollection(coll) {
            var sane = {
                    name: coll.name,
                    collections: [],
                    items: []
                };
            let c;
            let items = coll.children || coll.descendents;
            let length = items.length;
            let i;
            for (i = 0; i < length; i++) {
                c = items[i];
                switch (c.type) {
                case 'item':
                    sane.items.push(c.id);
                    break;
                case 'collection':
                    sane.collections.push(sanitizeCollection(c));
                    break;
                default:
                    throw 'Unexpected collection member type "' + c.type + '"';
                }
            }
            items = undefined;
            return sane;
        }
        self.collections = function () {
            if (!self.exportCollections) {
                return [];
            }
            var collections = [];
            let collection = Zotero.nextCollection();
            while (collection) {
                collections.push(sanitizeCollection(collection));
                collection = Zotero.nextCollection();
            }
            return collections;
        };
        var startTime = null;
        var exported = 0;
        self.nextItem = function () {
            var item = null;
            let i = Zotero.nextItem();
            while (i) {
                if (i.itemType != 'note' && i.itemType != 'attachment') {
                    item = i;
                    break;
                }
                i = Zotero.nextItem();
            }
            if (!item) {
                return;
            }
            if (startTime) {
                Zotero.debug('Exported ' + exported + ' items, avg: ' + exported * 1000 / (Date.now() - startTime) + ' items/sec');
            }
            if (!startTime) {
                startTime = Date.now();
            }
            exported += 1;
            if (!item) {
                return;
            }
            if (!initialized) {
                self.initialize();
            }
            Translator.fieldsWritten = function () {
                var init = {};
                var dict = Object.create(null);
                let dict$2 = init;
                let keys = Object.keys(dict$2);
                let length = keys.length;
                let index;
                for (index = 0; index < length; index++) {
                    let key = keys[index];
                    if (!dict$2.hasOwnProperty(key)) {
                        continue;
                    }
                    let value = dict$2[key];
                    dict[key] = value;
                }
                dict$2 = undefined;
                keys = undefined;
                return dict;
            }();
            // remove any citekey from extra -- the export doesn't need it
            Zotero.BetterBibTeX.keymanager.extract(item);
            item.__citekey__ = Zotero.BetterBibTeX.keymanager.get(item, 'on-export');
            this.citekeys[item.itemID] = item.__citekey__;
            return item;
        };
        this.Reference = function (item) {
            var fields = [];
            var self$2 = this;
            this.itemtype = Translator.typeMap.Zotero2BibTeX[item.itemType] || 'misc';
            if (item.extra) {
                var m = /biblatexdata\[([^\]]+)\]/.exec(item.extra);
                if (m) {
                    item.extra = item.extra.replace(m[0], '').trim();
                    let assignment;
                    let items = m[1].split(';');
                    let length = items.length;
                    let i;
                    for (i = 0; i < length; i++) {
                        assignment = items[i];
                        var data = assignment.match(/^([^=]+)=\s*(.*)/).slice(1);
                        fields.push({
                            name: data[0],
                            value: data[1]
                        });
                    }
                    items = undefined;
                }
            }
            let dict = Translator.fieldMap;
            let keys = Object.keys(dict);
            let length$2 = keys.length;
            let index;
            for (index = 0; index < length$2; index++) {
                let attr = keys[index];
                if (!dict.hasOwnProperty(attr)) {
                    continue;
                }
                let f = dict[attr];
                if (!f.name) {
                    return;
                }
                var o = JSON.parse(JSON.stringify(f));
                o.value = item[attr];
                this.add(o);
            }
            dict = undefined;
            keys = undefined;
            this.url = function (f$2) {
                var href = ('' + f$2.value).replace(/([#\\%&{}])/g, '\\$1');
                if (!Translator.unicode) {
                    href = href.replace(/[^\x21-\x7E]/g, function (chr) {
                        return '\\%' + ('00' + chr.charCodeAt(0).toString(16)).slice(-2);
                    });
                }
                if (f$2.name === 'url' && Translator.fancyURLs) {
                    return '\\href{' + href + '}{' + LaTeX.html2latex(url) + '}';
                }
                return href;
            };
            this.doi = function (f$2) {
                return this.url(f$2);
            };
            this.escape = function (f$2) {
                if (typeof f$2.value == 'number') {
                    return f$2.value;
                }
                if (!f$2.value) {
                    return null;
                }
                if (f$2.value instanceof Array) {
                    if (f$2.value.length === 0) {
                        return null;
                    }
                    return f$2.value.map(function (word) {
                        var o$2 = JSON.parse(JSON.stringify(f$2));
                        o$2.value = word;
                        return this.escape(o$2);
                    }).join(f$2.sep);
                }
                var value = LaTeX.html2latex(f$2.value);
                if (f$2.value instanceof String) {
                    value = String('{' + value + '}');
                }
                return value;
            };
            this.tags = function (f$2) {
                if (!f$2.value || f$2.value.length === 0) {
                    return null;
                }
                var tags = item.tags.map(function (tag) {
                        return tag.tag;
                    });
                tags.sort();
                f$2.value = tags;
                f$2.sep = ',';
                return this.escape(f$2);
            };
            var attachmentCounter = 0;
            this.attachments = function (f$2) {
                if (!f$2.value || f$2.value.length === 0) {
                    return null;
                }
                var attachments = [];
                errors = [];
                let att;
                let items$2 = f$2.value;
                let length$3 = items$2.length;
                let i$2;
                for (i$2 = 0; i$2 < length$3; i$2++) {
                    att = items$2[i$2];
                    var a = {
                            title: att.title,
                            path: att.localPath,
                            mimetype: att.mimeType
                        };
                    var save = Translator.exportFileData && att.defaultPath && att.saveFile;
                    if (save) {
                        a.path = att.defaultPath;
                    }
                    if (!a.path) {
                        return;
                    }
                    // amazon/googlebooks etc links show up as atachments without a path
                    attachmentCounter += 1;
                    if (save) {
                        att.saveFile(a.path);
                    } else {
                        if (Translator.attachmentRelativePath) {
                            a.path = 'files/' + (Translator.testmode ? attachmentCounter : att.itemID) + '/' + att.localPath.replace(/.*[\/\\]/, '');
                        }
                    }
                    if (a.path.match(/[{}]/)) {
                        // latex really doesn't want you to do this.
                        erross.push('BibTeX cannot handle file paths with braces: ' + JSON.stringify(a.path));
                    } else {
                        attachments.push(a);
                    }
                }
                items$2 = undefined;
                if (errors.length !== 0) {
                    f$2.errors = errors;
                }
                if (attachments.length === 0) {
                    return null;
                }
                attachments.sort(function (a$2, b) {
                    return a$2.path.localeCompare(b.path);
                });
                return attachments.map(function (att$2) {
                    return [
                        att$2.title,
                        att$2.path,
                        att$2.mimetype
                    ].map(function (part) {
                        return part.replace(/([\\{}:;])/g, '\\$1');
                    }).join(':');
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
            function field(f$2) {
                if (Translator.skipFields.indexOf(f$2.name) >= 0) {
                    return null;
                }
                var value;
                if (typeof f$2.value == 'number') {
                    value = f$2.value;
                } else {
                    if (!f$2.value || f$2.value === '') {
                        return;
                    }
                    if (f$2.escape) {
                        if (typeof this[f$2.escape] !== 'function') {
                            throw 'Unsupported escape function ' + f$2.escape;
                        }
                        value = this[f$2.escape](f$2);
                    } else {
                        value = this.escape(f$2);
                    }
                    if (value === '' || typeof value === 'undefined') {
                        return null;
                    }
                    if (f$2.braces) {
                        value = '{' + value + '}';
                    }
                    if (f$2.braceAll) {
                        value = '{' + value + '}';
                    }
                }
                return f$2.name + ' = ' + value;
            }
            this.add = function (field$2) {
                field$2.braces = typeof field$2.braces === 'undefined' || field$2.braces || field$2.protect || field$2.value.match(/\s/);
                field$2.protect = typeof field$2.value !== 'number' && field$2.protect && Translator.braceAll;
                fields.push(field$2);
            };
            this.has = function (name$2) {
                return fields.filter(function (f$2) {
                    return f$2.name === name$2;
                });
            };
            this.complete = function () {
                if (fields.length === 0) {
                    this.add({
                        name: 'type',
                        value: this.itemtype
                    });
                }
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
                var ref = '@' + this.itemtype + '{' + item.__citekey__ + ',\n';
                ref += fields.map(function (f$2) {
                    return field(f$2);
                }).filter(function (f$2) {
                    return f$2;
                }).join(',\n');
                ref += '\n}\n';
                Zotero.write(ref);
            };
        };
        var JabRef$2 = {
                serialize: function (arr, sep, wrap) {
                    return arr.map(function (v) {
                        v = ('' + v).replace(/;/g, '\\;');
                        if (wrap) {
                            v = v.match(/.{1,70}/g).join('\n');
                        }
                        return v;
                    }).join(sep);
                },
                exportGroup: function (collection, level) {
                    var group = [
                            level + ' ExplicitGroup:' + collection.name,
                            0
                        ];
                    group = group.concat(collection.items.map(function (id) {
                        return Translator.citekeys[id];
                    }));
                    group.push('');
                    group = this.serialize(group, ';');
                    var result = [group];
                    let coll;
                    let items = collection.collections;
                    let length = items.length;
                    let i;
                    for (i = 0; i < length; i++) {
                        coll = items[i];
                        result = result.concat(JabRef$2.exportGroup(coll, level + 1));
                    }
                    items = undefined;
                    return result;
                }
            };
        this.exportGroups = function () {
            if (this.collections.length === 0) {
                return;
            }
            Zotero.write('\n\n@comment{jabref-meta: groupsversion:3;}\n');
            Zotero.write('@comment{jabref-meta: groupstree:\n');
            Zotero.write('0 AllEntriesGroup:;\n');
            var groups = [];
            let collection;
            let items = this.collections;
            let length = items.length;
            let i;
            for (i = 0; i < length; i++) {
                collection = items[i];
                groups = groups.concat(JabRef$2.exportGroup(collection, 1));
            }
            items = undefined;
            Zotero.write(this.serialize(groups, ';\n', true) + ';\n}\n');
        };
    }();
var LaTeX = {
        regex: {
            unicode: {
                math: /(<|>)/g,
                text: /#|\$|%|&|<|>|\[|\\|\]|\^|_|\{|\}|~/g
            },
            ascii: {
                math: /(<|>|¬|­|±|²|³|µ|·|¹|÷|ħ|ƒ|ƪ|ɐ|ɒ|ɔ|ɖ|ə|ɛ|ɣ|ɤ|ɥ|ɬ|ɭ|ɯ|ɰ|ɱ|ɳ|ɷ|ɹ|ɺ|ɻ|ɼ|ɽ|ɾ|ʂ|ʃ|ʇ|ʈ|ʊ|ʋ|ʌ|ʍ|ʎ|ʐ|ʒ|ʔ|ʕ|ʖ|ʤ|ʧ|ˈ|ˌ|ː|ˑ|˒|˓|˔|˕|̡|̪|Ύ|Ώ|ΐ|Α|Β|Γ|Δ|Ε|Ζ|Η|Θ|Ι|Κ|Λ|Μ|Ν|Ξ|Ο|Π|Ρ|Σ|Τ|Υ|Φ|Χ|Ψ|Ω|Ϊ|Ϋ|έ|ή|ί|ΰ|α|β|γ|δ|ε|ζ|η|ι|κ|λ|μ|ν|ξ|ο|π|ρ|ς|σ|τ|υ|φ|χ|ψ|ω|ϊ|ϋ|ύ|ώ|ϒ|ϕ|ϖ|Ϛ|Ϝ|ϝ|Ϟ|Ϡ|ϰ|ϱ|϶| |‖|‛|′|″|‴|‵|⁗|⃛|⃜|ℂ|ℋ|ℌ|ℍ|ℏ|ℐ|ℑ|ℒ|ℓ|ℕ|℘|ℙ|ℚ|ℛ|ℜ|ℝ|℞|ℤ|Ω|℧|ℨ|℩|ℬ|ℭ|ℯ|ℰ|ℱ|ℳ|ℴ|ℵ|ℶ|ℷ|ℸ|⅓|⅔|⅕|⅖|⅗|⅘|⅙|⅚|⅛|⅜|⅝|⅞|←|↑|→|↓|↔|↕|↖|↗|↘|↙|↚|↛|↜|↝|↞|↠|↢|↣|↦|↩|↪|↫|↬|↭|↮|↰|↱|↳|↶|↷|↺|↻|↼|↽|↾|↿|⇀|⇁|⇂|⇃|⇄|⇅|⇆|⇇|⇈|⇉|⇊|⇋|⇌|⇍|⇎|⇏|⇐|⇑|⇒|⇓|⇔|⇕|⇚|⇛|⇝|⇵|∀|∁|∂|∃|∄|∅|∇|∈|∉|∋|∌|∏|∐|∑|∓|∔|∖|∗|∘|∙|√|∝|∞|∟|∠|∡|∢|∣|∤|∥|∦|∧|∨|∩|∪|∫|∬|∭|∮|∯|∰|∱|∲|∳|∴|∵|∷|∸|∺|∻|∼|∽|∾|≀|≁|≂|≂̸|≃|≄|≅|≆|≇|≈|≉|≊|≋|≋̸|≌|≍|≎|≎̸|≏|≏̸|≐|≐̸|≑|≒|≓|≕|≖|≗|≙|≚|≛|≜|≟|≠|≡|≢|≤|≥|≦|≧|≨|≨︀|≩|≩︀|≪|≪̸|≫|≫̸|≬|≭|≮|≯|≰|≱|≲|≳|≴|≵|≶|≷|≸|≹|≺|≻|≼|≽|≾|≾̸|≿|≿̸|⊀|⊁|⊂|⊃|⊄|⊅|⊆|⊇|⊈|⊉|⊊|⊊︀|⊋|⊋︀|⊎|⊏|⊏̸|⊐|⊐̸|⊑|⊒|⊓|⊔|⊕|⊖|⊗|⊘|⊙|⊚|⊛|⊝|⊞|⊟|⊠|⊡|⊢|⊣|⊤|⊥|⊧|⊨|⊩|⊪|⊫|⊬|⊭|⊮|⊯|⊲|⊳|⊴|⊵|⊶|⊷|⊸|⊹|⊺|⊻|⊾|⋀|⋁|⋂|⋃|⋄|⋅|⋆|⋇|⋈|⋉|⋊|⋋|⋌|⋍|⋎|⋏|⋐|⋑|⋒|⋓|⋔|⋖|⋗|⋘|⋙|⋚|⋛|⋞|⋟|⋢|⋣|⋥|⋦|⋧|⋨|⋩|⋪|⋫|⋬|⋭|⋮|⋯|⋰|⋱|⌆|⌈|⌉|⌊|⌋|⌕|⌖|⌜|⌝|⌞|⌟|⌢|⌣|⌽|⎣|⎰|⎱|Ⓢ|┆|┙|╱|□|▪|▭|▯|▱|△|▴|▵|▸|▹|▽|▾|▿|◂|◃|◊|○|◐|◑|◒|◘|◧|◨|◪|◯|♢|♭|♮|♯|⟵|⟶|⟷|⟸|⟹|⟺|⟼|⟿|⤅|⤒|⤓|⤣|⤤|⤥|⤦|⤧|⤨|⤩|⤪|⤳|⤳̸|⤶|⤷|⥀|⥁|⥂|⥄|⥇|⥎|⥏|⥐|⥑|⥒|⥓|⥔|⥕|⥖|⥗|⥘|⥙|⥚|⥛|⥜|⥝|⥞|⥟|⥠|⥡|⥮|⥯|⥰|⥼|⥽|⦀|⦅|⦆|⦓|⦔|⦙|⦜|⦠|⦵|⦶|⧊|⧋|⧏|⧏̸|⧐|⧐̸|⧜|⧫|⧴|⨄|⨅|⨆|⨇|⨈|⨍|⨏|⨐|⨖|⨥|⨪|⨭|⨮|⨯|⨴|⨵|⨼|⨿|⩓|⩔|⩕|⩖|⩞|⩟|⩣|⩮|⩵|⩽|⩽̸|⩾|⩾̸|⪅|⪆|⪇|⪈|⪉|⪊|⪋|⪌|⪕|⪖|⪝|⪞|⪡|⪡̸|⪢|⪢̸|⪯|⪯̸|⪰|⪰̸|⪵|⪶|⪷|⪸|⪹|⪺|⫅|⫅̸|⫆|⫆̸|⫋|⫌|⫫|⫶|⫽|⫽⃥|《|》|〘|〙|〚|〛|𝐀|𝐁|𝐂|𝐃|𝐄|𝐅|𝐆|𝐇|𝐈|𝐉|𝐊|𝐋|𝐌|𝐍|𝐎|𝐏|𝐐|𝐑|𝐒|𝐓|𝐔|𝐕|𝐖|𝐗|𝐘|𝐙|𝐚|𝐛|𝐜|𝐝|𝐞|𝐟|𝐠|𝐡|𝐢|𝐣|𝐤|𝐥|𝐦|𝐧|𝐨|𝐩|𝐪|𝐫|𝐬|𝐭|𝐮|𝐯|𝐰|𝐱|𝐲|𝐳|𝐴|𝐵|𝐶|𝐷|𝐸|𝐹|𝐺|𝐻|𝐼|𝐽|𝐾|𝐿|𝑀|𝑁|𝑂|𝑃|𝑄|𝑅|𝑆|𝑇|𝑈|𝑉|𝑊|𝑋|𝑌|𝑍|𝑎|𝑏|𝑐|𝑑|𝑒|𝑓|𝑔|𝑖|𝑗|𝑘|𝑙|𝑚|𝑛|𝑜|𝑝|𝑞|𝑟|𝑠|𝑡|𝑢|𝑣|𝑤|𝑥|𝑦|𝑧|𝑨|𝑩|𝑪|𝑫|𝑬|𝑭|𝑮|𝑯|𝑰|𝑱|𝑲|𝑳|𝑴|𝑵|𝑶|𝑷|𝑸|𝑹|𝑺|𝑻|𝑼|𝑽|𝑾|𝑿|𝒀|𝒁|𝒂|𝒃|𝒄|𝒅|𝒆|𝒇|𝒈|𝒉|𝒊|𝒋|𝒌|𝒍|𝒎|𝒏|𝒐|𝒑|𝒒|𝒓|𝒔|𝒕|𝒖|𝒗|𝒘|𝒙|𝒚|𝒛|𝒜|𝒞|𝒟|𝒢|𝒥|𝒦|𝒩|𝒪|𝒫|𝒬|𝒮|𝒯|𝒰|𝒱|𝒲|𝒳|𝒴|𝒵|𝒶|𝒷|𝒸|𝒹|𝒻|𝒽|𝒾|𝒿|𝓀|𝓁|𝓂|𝓃|𝓅|𝓆|𝓇|𝓈|𝓉|𝓊|𝓋|𝓌|𝓍|𝓎|𝓏|𝓐|𝓑|𝓒|𝓓|𝓔|𝓕|𝓖|𝓗|𝓘|𝓙|𝓚|𝓛|𝓜|𝓝|𝓞|𝓟|𝓠|𝓡|𝓢|𝓣|𝓤|𝓥|𝓦|𝓧|𝓨|𝓩|𝓪|𝓫|𝓬|𝓭|𝓮|𝓯|𝓰|𝓱|𝓲|𝓳|𝓴|𝓵|𝓶|𝓷|𝓸|𝓹|𝓺|𝓻|𝓼|𝓽|𝓾|𝓿|𝔀|𝔁|𝔂|𝔃|𝔄|𝔅|𝔇|𝔈|𝔉|𝔊|𝔍|𝔎|𝔏|𝔐|𝔑|𝔒|𝔓|𝔔|𝔖|𝔗|𝔘|𝔙|𝔚|𝔛|𝔜|𝔞|𝔟|𝔠|𝔡|𝔢|𝔣|𝔤|𝔥|𝔦|𝔧|𝔨|𝔩|𝔪|𝔫|𝔬|𝔭|𝔮|𝔯|𝔰|𝔱|𝔲|𝔳|𝔴|𝔵|𝔶|𝔷|𝔸|𝔹|𝔻|𝔼|𝔽|𝔾|𝕀|𝕁|𝕂|𝕃|𝕄|𝕆|𝕊|𝕋|𝕌|𝕍|𝕎|𝕏|𝕐|𝕒|𝕓|𝕔|𝕕|𝕖|𝕗|𝕘|𝕙|𝕚|𝕛|𝕜|𝕝|𝕞|𝕟|𝕠|𝕡|𝕢|𝕣|𝕤|𝕥|𝕦|𝕧|𝕨|𝕩|𝕪|𝕫|𝕬|𝕭|𝕮|𝕯|𝕰|𝕱|𝕲|𝕳|𝕴|𝕵|𝕶|𝕷|𝕸|𝕹|𝕺|𝕻|𝕼|𝕽|𝕾|𝕿|𝖀|𝖁|𝖂|𝖃|𝖄|𝖅|𝖆|𝖇|𝖈|𝖉|𝖊|𝖋|𝖌|𝖍|𝖎|𝖏|𝖐|𝖑|𝖒|𝖓|𝖔|𝖕|𝖖|𝖗|𝖘|𝖙|𝖚|𝖛|𝖜|𝖝|𝖞|𝖟|𝖠|𝖡|𝖢|𝖣|𝖤|𝖥|𝖦|𝖧|𝖨|𝖩|𝖪|𝖫|𝖬|𝖭|𝖮|𝖯|𝖰|𝖱|𝖲|𝖳|𝖴|𝖵|𝖶|𝖷|𝖸|𝖹|𝖺|𝖻|𝖼|𝖽|𝖾|𝖿|𝗀|𝗁|𝗂|𝗃|𝗄|𝗅|𝗆|𝗇|𝗈|𝗉|𝗊|𝗋|𝗌|𝗍|𝗎|𝗏|𝗐|𝗑|𝗒|𝗓|𝗔|𝗕|𝗖|𝗗|𝗘|𝗙|𝗚|𝗛|𝗜|𝗝|𝗞|𝗟|𝗠|𝗡|𝗢|𝗣|𝗤|𝗥|𝗦|𝗧|𝗨|𝗩|𝗪|𝗫|𝗬|𝗭|𝗮|𝗯|𝗰|𝗱|𝗲|𝗳|𝗴|𝗵|𝗶|𝗷|𝗸|𝗹|𝗺|𝗻|𝗼|𝗽|𝗾|𝗿|𝘀|𝘁|𝘂|𝘃|𝘄|𝘅|𝘆|𝘇|𝘈|𝘉|𝘊|𝘋|𝘌|𝘍|𝘎|𝘏|𝘐|𝘑|𝘒|𝘓|𝘔|𝘕|𝘖|𝘗|𝘘|𝘙|𝘚|𝘛|𝘜|𝘝|𝘞|𝘟|𝘠|𝘡|𝘢|𝘣|𝘤|𝘥|𝘦|𝘧|𝘨|𝘩|𝘪|𝘫|𝘬|𝘭|𝘮|𝘯|𝘰|𝘱|𝘲|𝘳|𝘴|𝘵|𝘶|𝘷|𝘸|𝘹|𝘺|𝘻|𝘼|𝘽|𝘾|𝘿|𝙀|𝙁|𝙂|𝙃|𝙄|𝙅|𝙆|𝙇|𝙈|𝙉|𝙊|𝙋|𝙌|𝙍|𝙎|𝙏|𝙐|𝙑|𝙒|𝙓|𝙔|𝙕|𝙖|𝙗|𝙘|𝙙|𝙚|𝙛|𝙜|𝙝|𝙞|𝙟|𝙠|𝙡|𝙢|𝙣|𝙤|𝙥|𝙦|𝙧|𝙨|𝙩|𝙪|𝙫|𝙬|𝙭|𝙮|𝙯|𝙰|𝙱|𝙲|𝙳|𝙴|𝙵|𝙶|𝙷|𝙸|𝙹|𝙺|𝙻|𝙼|𝙽|𝙾|𝙿|𝚀|𝚁|𝚂|𝚃|𝚄|𝚅|𝚆|𝚇|𝚈|𝚉|𝚊|𝚋|𝚌|𝚍|𝚎|𝚏|𝚐|𝚑|𝚒|𝚓|𝚔|𝚕|𝚖|𝚗|𝚘|𝚙|𝚚|𝚛|𝚜|𝚝|𝚞|𝚟|𝚠|𝚡|𝚢|𝚣|𝚨|𝚩|𝚪|𝚫|𝚬|𝚭|𝚮|𝚯|𝚰|𝚱|𝚲|𝚳|𝚴|𝚵|𝚶|𝚷|𝚸|𝚺|𝚻|𝚼|𝚽|𝚾|𝚿|𝛀|𝛁|𝛂|𝛃|𝛄|𝛅|𝛆|𝛇|𝛈|𝛉|𝛊|𝛋|𝛌|𝛍|𝛎|𝛏|𝛐|𝛑|𝛒|𝛓|𝛔|𝛕|𝛖|𝛗|𝛘|𝛙|𝛚|𝛛|𝛜|𝛢|𝛣|𝛤|𝛥|𝛦|𝛧|𝛨|𝛩|𝛪|𝛫|𝛬|𝛭|𝛮|𝛯|𝛰|𝛱|𝛲|𝛴|𝛵|𝛶|𝛷|𝛸|𝛹|𝛺|𝛻|𝛼|𝛽|𝛾|𝛿|𝜀|𝜁|𝜂|𝜃|𝜄|𝜅|𝜆|𝜇|𝜈|𝜉|𝜊|𝜋|𝜌|𝜍|𝜎|𝜏|𝜐|𝜑|𝜒|𝜓|𝜔|𝜕|𝜖|𝜜|𝜝|𝜞|𝜟|𝜠|𝜡|𝜢|𝜣|𝜤|𝜥|𝜦|𝜧|𝜨|𝜩|𝜪|𝜫|𝜬|𝜮|𝜯|𝜰|𝜱|𝜲|𝜳|𝜴|𝜵|𝜶|𝜷|𝜸|𝜹|𝜺|𝜻|𝜼|𝜽|𝜾|𝜿|𝝀|𝝁|𝝂|𝝃|𝝄|𝝅|𝝆|𝝇|𝝈|𝝉|𝝊|𝝋|𝝌|𝝍|𝝎|𝝏|𝝐|𝝖|𝝗|𝝘|𝝙|𝝚|𝝛|𝝜|𝝝|𝝞|𝝟|𝝠|𝝡|𝝢|𝝣|𝝤|𝝥|𝝦|𝝨|𝝩|𝝪|𝝫|𝝬|𝝭|𝝮|𝝯|𝝰|𝝱|𝝲|𝝳|𝝴|𝝵|𝝶|𝝷|𝝸|𝝹|𝝺|𝝻|𝝼|𝝽|𝝾|𝝿|𝞀|𝞁|𝞂|𝞃|𝞄|𝞅|𝞆|𝞇|𝞈|𝞉|𝞊|𝞐|𝞑|𝞒|𝞓|𝞔|𝞕|𝞖|𝞗|𝞘|𝞙|𝞚|𝞛|𝞜|𝞝|𝞞|𝞟|𝞠|𝞢|𝞣|𝞤|𝞥|𝞦|𝞧|𝞨|𝞩|𝞪|𝞫|𝞬|𝞭|𝞮|𝞯|𝞰|𝞱|𝞲|𝞳|𝞴|𝞵|𝞶|𝞷|𝞸|𝞹|𝞺|𝞻|𝞼|𝞽|𝞾|𝞿|𝟀|𝟁|𝟂|𝟃|𝟄|𝟎|𝟏|𝟐|𝟑|𝟒|𝟓|𝟔|𝟕|𝟖|𝟗|𝟘|𝟙|𝟚|𝟛|𝟜|𝟝|𝟞|𝟟|𝟠|𝟡|𝟢|𝟣|𝟤|𝟥|𝟦|𝟧|𝟨|𝟩|𝟪|𝟫|𝟬|𝟭|𝟮|𝟯|𝟰|𝟱|𝟲|𝟳|𝟴|𝟵|𝟶|𝟷|𝟸|𝟹|𝟺|𝟻|𝟼|𝟽|𝟾|𝟿)/g,
                text: /#|\$|%|&|<|>|\[|\\|\]|\^|_|\{|\}|~| |¡|¢|£|¤|¥|¦|§|¨|©|ª|«|¬|­|®|¯|°|±|²|³|´|µ|¶|·|¸|¹|º|»|¼|½|¾|¿|À|Á|Â|Ã|Ä|Å|Æ|Ç|È|É|Ê|Ë|Ì|Í|Î|Ï|Ð|Ñ|Ò|Ó|Ô|Õ|Ö|×|Ø|Ù|Ú|Û|Ü|Ý|Þ|ß|à|á|â|ã|ä|å|æ|ç|è|é|ê|ë|ì|í|î|ï|ð|ñ|ò|ó|ô|õ|ö|÷|ø|ù|ú|û|ü|ý|þ|ÿ|Ā|ā|Ă|ă|Ą|ą|Ć|ć|Ĉ|ĉ|Ċ|ċ|Č|č|Ď|ď|Đ|đ|Ē|ē|Ĕ|ĕ|Ė|ė|Ę|ę|Ě|ě|Ĝ|ĝ|Ğ|ğ|Ġ|ġ|Ģ|ģ|Ĥ|ĥ|Ħ|ħ|Ĩ|ĩ|Ī|ī|Ĭ|ĭ|Į|į|İ|ı|Ĳ|ĳ|Ĵ|ĵ|Ķ|ķ|ĸ|Ĺ|ĺ|Ļ|ļ|Ľ|ľ|Ŀ|ŀ|Ł|ł|Ń|ń|Ņ|ņ|Ň|ň|ŉ|Ŋ|ŋ|Ō|ō|Ŏ|ŏ|Ő|ő|Œ|œ|Ŕ|ŕ|Ŗ|ŗ|Ř|ř|Ś|ś|Ŝ|ŝ|Ş|ş|Š|š|Ţ|ţ|Ť|ť|Ŧ|ŧ|Ũ|ũ|Ū|ū|Ŭ|ŭ|Ů|ů|Ű|ű|Ų|ų|Ŵ|ŵ|Ŷ|ŷ|Ÿ|Ź|ź|Ż|ż|Ž|ž|ƒ|ƕ|ƞ|ƪ|ƺ|ǂ|ǵ|ɐ|ɒ|ɔ|ɖ|ɘ|ə|ɛ|ɡ|ɣ|ɤ|ɥ|ɬ|ɭ|ɯ|ɰ|ɱ|ɲ|ɳ|ɷ|ɸ|ɹ|ɺ|ɻ|ɼ|ɽ|ɾ|ɿ|ʂ|ʃ|ʇ|ʈ|ʊ|ʋ|ʌ|ʍ|ʎ|ʐ|ʒ|ʔ|ʕ|ʖ|ʞ|ʤ|ʧ|ʼ|ˇ|ˈ|ˌ|ː|ˑ|˒|˓|˔|˕|˘|˙|˚|˛|˜|˝|˥|˦|˧|˨|˩|̀|́|̂|̃|̄|̆|̇|̈|̊|̋|̌|̏|̑|̘|̙|̡|̢|̧|̨|̪|̫|̯|̵|̶|̷|̸|̺|̻|̼|̽|͡|Ά|Έ|Ή|Ί|Ό|Ύ|Ώ|ΐ|Α|Β|Γ|Δ|Ε|Ζ|Η|Θ|Ι|Κ|Λ|Μ|Ν|Ξ|Ο|Π|Ρ|Σ|Τ|Υ|Φ|Χ|Ψ|Ω|Ϊ|Ϋ|ά|έ|ή|ί|ΰ|α|β|γ|δ|ε|ζ|η|θ|ι|κ|λ|μ|ν|ξ|ο|π|ρ|ς|σ|τ|υ|φ|χ|ψ|ω|ϊ|ϋ|ό|ύ|ώ|ϐ|ϑ|ϒ|ϕ|ϖ|Ϛ|Ϝ|ϝ|Ϟ|Ϡ|ϰ|ϱ|ϴ|϶|Ё|Ђ|Ѓ|Є|Ѕ|І|Ї|Ј|Љ|Њ|Ћ|Ќ|Ў|Џ|А|Б|В|Г|Д|Е|Ж|З|И|Й|К|Л|М|Н|О|П|Р|С|Т|У|Ф|Х|Ц|Ч|Ш|Щ|Ъ|Ы|Ь|Э|Ю|Я|а|б|в|г|д|е|ж|з|и|й|к|л|м|н|о|п|р|с|т|у|ф|х|ц|ч|ш|щ|ъ|ы|ь|э|ю|я|ё|ђ|ѓ|є|ѕ|і|ї|ј|љ|њ|ћ|ќ|ў|џ|Ѡ|ѡ|Ѣ|Ѥ|ѥ|Ѧ|ѧ|Ѩ|ѩ|Ѫ|Ѭ|ѭ|Ѯ|ѯ|Ѱ|ѱ|Ѳ|Ѵ|Ѹ|ѹ|Ѻ|ѻ|Ѽ|ѽ|Ѿ|ѿ|Ҁ|ҁ|҂|҈|҉|Ҍ|ҍ|Ҏ|ҏ|Ґ|ґ|Ғ|ғ|Ҕ|ҕ|Җ|җ|Ҙ|ҙ|Қ|қ|Ҝ|ҝ|Ҟ|ҟ|Ҡ|ҡ|Ң|ң|Ҥ|ҥ|Ҧ|ҧ|Ҩ|ҩ|Ҫ|ҫ|Ҭ|ҭ|Ү|ү|Ұ|ұ|Ҳ|ҳ|Ҵ|ҵ|Ҷ|ҷ|Ҹ|ҹ|Һ|һ|Ҽ|ҽ|Ҿ|ҿ|Ӏ|Ӄ|ӄ|Ӈ|ӈ|Ӌ|ӌ|Ӕ|ӕ|Ә|ә|Ӡ|ӡ|Ө|ө| | | | | | | | | |‐|–|—|―|‖|‘|’|‚|‛|“|”|„|†|‡|•|․|‥|…|‰|‱|′|″|‴|‵|‹|›|⁗| |⁠|₧|€|⃛|⃜|ℂ|ℊ|ℋ|ℌ|ℍ|ℏ|ℐ|ℑ|ℒ|ℓ|ℕ|№|℘|ℙ|ℚ|ℛ|ℜ|ℝ|℞|™|ℤ|Ω|℧|ℨ|℩|Å|ℬ|ℭ|ℯ|ℰ|ℱ|ℳ|ℴ|ℵ|ℶ|ℷ|ℸ|⅓|⅔|⅕|⅖|⅗|⅘|⅙|⅚|⅛|⅜|⅝|⅞|←|↑|→|↓|↔|↕|↖|↗|↘|↙|↚|↛|↜|↝|↞|↠|↢|↣|↦|↩|↪|↫|↬|↭|↮|↰|↱|↳|↶|↷|↺|↻|↼|↽|↾|↿|⇀|⇁|⇂|⇃|⇄|⇅|⇆|⇇|⇈|⇉|⇊|⇋|⇌|⇍|⇎|⇏|⇐|⇑|⇒|⇓|⇔|⇕|⇚|⇛|⇝|⇵|∀|∁|∂|∃|∄|∅|∇|∈|∉|∋|∌|∏|∐|∑|−|∓|∔|∖|∗|∘|∙|√|∝|∞|∟|∠|∡|∢|∣|∤|∥|∦|∧|∨|∩|∪|∫|∬|∭|∮|∯|∰|∱|∲|∳|∴|∵|∷|∸|∺|∻|∼|∽|∾|≀|≁|≂|≂̸|≃|≄|≅|≆|≇|≈|≉|≊|≋|≋̸|≌|≍|≎|≎̸|≏|≏̸|≐|≐̸|≑|≒|≓|≔|≕|≖|≗|≙|≚|≛|≜|≟|≠|≡|≢|≤|≥|≦|≧|≨|≨︀|≩|≩︀|≪|≪̸|≫|≫̸|≬|≭|≮|≯|≰|≱|≲|≳|≴|≵|≶|≷|≸|≹|≺|≻|≼|≽|≾|≾̸|≿|≿̸|⊀|⊁|⊂|⊃|⊄|⊅|⊆|⊇|⊈|⊉|⊊|⊊︀|⊋|⊋︀|⊎|⊏|⊏̸|⊐|⊐̸|⊑|⊒|⊓|⊔|⊕|⊖|⊗|⊘|⊙|⊚|⊛|⊝|⊞|⊟|⊠|⊡|⊢|⊣|⊤|⊥|⊧|⊨|⊩|⊪|⊫|⊬|⊭|⊮|⊯|⊲|⊳|⊴|⊵|⊶|⊷|⊸|⊹|⊺|⊻|⊾|⋀|⋁|⋂|⋃|⋄|⋅|⋆|⋇|⋈|⋉|⋊|⋋|⋌|⋍|⋎|⋏|⋐|⋑|⋒|⋓|⋔|⋖|⋗|⋘|⋙|⋚|⋛|⋞|⋟|⋢|⋣|⋥|⋦|⋧|⋨|⋩|⋪|⋫|⋬|⋭|⋮|⋯|⋰|⋱|⌅|⌆|⌈|⌉|⌊|⌋|⌕|⌖|⌜|⌝|⌞|⌟|⌢|⌣|⌽|⎣|⎰|⎱|␣|①|②|③|④|⑤|⑥|⑦|⑧|⑨|⑩|Ⓢ|┆|┙|╱|■|□|▪|▭|▯|▱|▲|△|▴|▵|▸|▹|▼|▽|▾|▿|◂|◃|◆|◊|○|●|◐|◑|◒|◗|◘|◧|◨|◪|◯|★|☆|☎|☛|☞|☾|☿|♀|♂|♃|♄|♅|♆|♇|♈|♉|♊|♋|♌|♍|♎|♏|♐|♑|♒|♓|♠|♢|♣|♥|♦|♩|♪|♭|♮|♯|✁|✂|✃|✄|✆|✇|✈|✉|✌|✍|✎|✏|✐|✑|✒|✓|✔|✕|✖|✗|✘|✙|✚|✛|✜|✝|✞|✟|✠|✡|✢|✣|✤|✥|✦|✧|✩|✪|✫|✬|✭|✮|✯|✰|✱|✲|✳|✴|✵|✶|✷|✸|✹|✺|✻|✼|✽|✾|✿|❀|❁|❂|❃|❄|❅|❆|❇|❈|❉|❊|❋|❍|❏|❐|❑|❒|❖|❘|❙|❚|❛|❜|❝|❞|❡|❢|❣|❤|❥|❦|❧|❶|❷|❸|❹|❺|❻|❼|❽|❾|❿|➀|➁|➂|➃|➄|➅|➆|➇|➈|➉|➊|➋|➌|➍|➎|➏|➐|➑|➒|➓|➔|➘|➙|➚|➛|➜|➝|➞|➟|➠|➡|➢|➣|➤|➥|➦|➧|➨|➩|➪|➫|➬|➭|➮|➯|➱|➲|➳|➴|➵|➶|➷|➸|➹|➺|➻|➼|➽|➾|⟨|⟩|⟵|⟶|⟷|⟸|⟹|⟺|⟼|⟿|⤅|⤒|⤓|⤣|⤤|⤥|⤦|⤧|⤨|⤩|⤪|⤳|⤳̸|⤶|⤷|⥀|⥁|⥂|⥄|⥇|⥎|⥏|⥐|⥑|⥒|⥓|⥔|⥕|⥖|⥗|⥘|⥙|⥚|⥛|⥜|⥝|⥞|⥟|⥠|⥡|⥮|⥯|⥰|⥼|⥽|⦀|⦅|⦆|⦓|⦔|⦙|⦜|⦠|⦵|⦶|⧊|⧋|⧏|⧏̸|⧐|⧐̸|⧜|⧫|⧴|⨄|⨅|⨆|⨇|⨈|⨍|⨏|⨐|⨖|⨥|⨪|⨭|⨮|⨯|⨴|⨵|⨼|⨿|⩓|⩔|⩕|⩖|⩞|⩟|⩣|⩮|⩵|⩽|⩽̸|⩾|⩾̸|⪅|⪆|⪇|⪈|⪉|⪊|⪋|⪌|⪕|⪖|⪝|⪞|⪡|⪡̸|⪢|⪢̸|⪯|⪯̸|⪰|⪰̸|⪵|⪶|⪷|⪸|⪹|⪺|⫅|⫅̸|⫆|⫆̸|⫋|⫌|⫫|⫶|⫽|⫽⃥|《|》|〘|〙|〚|〛|ﬀ|ﬁ|ﬂ|ﬃ|ﬄ|𝐀|𝐁|𝐂|𝐃|𝐄|𝐅|𝐆|𝐇|𝐈|𝐉|𝐊|𝐋|𝐌|𝐍|𝐎|𝐏|𝐐|𝐑|𝐒|𝐓|𝐔|𝐕|𝐖|𝐗|𝐘|𝐙|𝐚|𝐛|𝐜|𝐝|𝐞|𝐟|𝐠|𝐡|𝐢|𝐣|𝐤|𝐥|𝐦|𝐧|𝐨|𝐩|𝐪|𝐫|𝐬|𝐭|𝐮|𝐯|𝐰|𝐱|𝐲|𝐳|𝐴|𝐵|𝐶|𝐷|𝐸|𝐹|𝐺|𝐻|𝐼|𝐽|𝐾|𝐿|𝑀|𝑁|𝑂|𝑃|𝑄|𝑅|𝑆|𝑇|𝑈|𝑉|𝑊|𝑋|𝑌|𝑍|𝑎|𝑏|𝑐|𝑑|𝑒|𝑓|𝑔|𝑖|𝑗|𝑘|𝑙|𝑚|𝑛|𝑜|𝑝|𝑞|𝑟|𝑠|𝑡|𝑢|𝑣|𝑤|𝑥|𝑦|𝑧|𝑨|𝑩|𝑪|𝑫|𝑬|𝑭|𝑮|𝑯|𝑰|𝑱|𝑲|𝑳|𝑴|𝑵|𝑶|𝑷|𝑸|𝑹|𝑺|𝑻|𝑼|𝑽|𝑾|𝑿|𝒀|𝒁|𝒂|𝒃|𝒄|𝒅|𝒆|𝒇|𝒈|𝒉|𝒊|𝒋|𝒌|𝒍|𝒎|𝒏|𝒐|𝒑|𝒒|𝒓|𝒔|𝒕|𝒖|𝒗|𝒘|𝒙|𝒚|𝒛|𝒜|𝒞|𝒟|𝒢|𝒥|𝒦|𝒩|𝒪|𝒫|𝒬|𝒮|𝒯|𝒰|𝒱|𝒲|𝒳|𝒴|𝒵|𝒶|𝒷|𝒸|𝒹|𝒻|𝒽|𝒾|𝒿|𝓀|𝓁|𝓂|𝓃|𝓅|𝓆|𝓇|𝓈|𝓉|𝓊|𝓋|𝓌|𝓍|𝓎|𝓏|𝓐|𝓑|𝓒|𝓓|𝓔|𝓕|𝓖|𝓗|𝓘|𝓙|𝓚|𝓛|𝓜|𝓝|𝓞|𝓟|𝓠|𝓡|𝓢|𝓣|𝓤|𝓥|𝓦|𝓧|𝓨|𝓩|𝓪|𝓫|𝓬|𝓭|𝓮|𝓯|𝓰|𝓱|𝓲|𝓳|𝓴|𝓵|𝓶|𝓷|𝓸|𝓹|𝓺|𝓻|𝓼|𝓽|𝓾|𝓿|𝔀|𝔁|𝔂|𝔃|𝔄|𝔅|𝔇|𝔈|𝔉|𝔊|𝔍|𝔎|𝔏|𝔐|𝔑|𝔒|𝔓|𝔔|𝔖|𝔗|𝔘|𝔙|𝔚|𝔛|𝔜|𝔞|𝔟|𝔠|𝔡|𝔢|𝔣|𝔤|𝔥|𝔦|𝔧|𝔨|𝔩|𝔪|𝔫|𝔬|𝔭|𝔮|𝔯|𝔰|𝔱|𝔲|𝔳|𝔴|𝔵|𝔶|𝔷|𝔸|𝔹|𝔻|𝔼|𝔽|𝔾|𝕀|𝕁|𝕂|𝕃|𝕄|𝕆|𝕊|𝕋|𝕌|𝕍|𝕎|𝕏|𝕐|𝕒|𝕓|𝕔|𝕕|𝕖|𝕗|𝕘|𝕙|𝕚|𝕛|𝕜|𝕝|𝕞|𝕟|𝕠|𝕡|𝕢|𝕣|𝕤|𝕥|𝕦|𝕧|𝕨|𝕩|𝕪|𝕫|𝕬|𝕭|𝕮|𝕯|𝕰|𝕱|𝕲|𝕳|𝕴|𝕵|𝕶|𝕷|𝕸|𝕹|𝕺|𝕻|𝕼|𝕽|𝕾|𝕿|𝖀|𝖁|𝖂|𝖃|𝖄|𝖅|𝖆|𝖇|𝖈|𝖉|𝖊|𝖋|𝖌|𝖍|𝖎|𝖏|𝖐|𝖑|𝖒|𝖓|𝖔|𝖕|𝖖|𝖗|𝖘|𝖙|𝖚|𝖛|𝖜|𝖝|𝖞|𝖟|𝖠|𝖡|𝖢|𝖣|𝖤|𝖥|𝖦|𝖧|𝖨|𝖩|𝖪|𝖫|𝖬|𝖭|𝖮|𝖯|𝖰|𝖱|𝖲|𝖳|𝖴|𝖵|𝖶|𝖷|𝖸|𝖹|𝖺|𝖻|𝖼|𝖽|𝖾|𝖿|𝗀|𝗁|𝗂|𝗃|𝗄|𝗅|𝗆|𝗇|𝗈|𝗉|𝗊|𝗋|𝗌|𝗍|𝗎|𝗏|𝗐|𝗑|𝗒|𝗓|𝗔|𝗕|𝗖|𝗗|𝗘|𝗙|𝗚|𝗛|𝗜|𝗝|𝗞|𝗟|𝗠|𝗡|𝗢|𝗣|𝗤|𝗥|𝗦|𝗧|𝗨|𝗩|𝗪|𝗫|𝗬|𝗭|𝗮|𝗯|𝗰|𝗱|𝗲|𝗳|𝗴|𝗵|𝗶|𝗷|𝗸|𝗹|𝗺|𝗻|𝗼|𝗽|𝗾|𝗿|𝘀|𝘁|𝘂|𝘃|𝘄|𝘅|𝘆|𝘇|𝘈|𝘉|𝘊|𝘋|𝘌|𝘍|𝘎|𝘏|𝘐|𝘑|𝘒|𝘓|𝘔|𝘕|𝘖|𝘗|𝘘|𝘙|𝘚|𝘛|𝘜|𝘝|𝘞|𝘟|𝘠|𝘡|𝘢|𝘣|𝘤|𝘥|𝘦|𝘧|𝘨|𝘩|𝘪|𝘫|𝘬|𝘭|𝘮|𝘯|𝘰|𝘱|𝘲|𝘳|𝘴|𝘵|𝘶|𝘷|𝘸|𝘹|𝘺|𝘻|𝘼|𝘽|𝘾|𝘿|𝙀|𝙁|𝙂|𝙃|𝙄|𝙅|𝙆|𝙇|𝙈|𝙉|𝙊|𝙋|𝙌|𝙍|𝙎|𝙏|𝙐|𝙑|𝙒|𝙓|𝙔|𝙕|𝙖|𝙗|𝙘|𝙙|𝙚|𝙛|𝙜|𝙝|𝙞|𝙟|𝙠|𝙡|𝙢|𝙣|𝙤|𝙥|𝙦|𝙧|𝙨|𝙩|𝙪|𝙫|𝙬|𝙭|𝙮|𝙯|𝙰|𝙱|𝙲|𝙳|𝙴|𝙵|𝙶|𝙷|𝙸|𝙹|𝙺|𝙻|𝙼|𝙽|𝙾|𝙿|𝚀|𝚁|𝚂|𝚃|𝚄|𝚅|𝚆|𝚇|𝚈|𝚉|𝚊|𝚋|𝚌|𝚍|𝚎|𝚏|𝚐|𝚑|𝚒|𝚓|𝚔|𝚕|𝚖|𝚗|𝚘|𝚙|𝚚|𝚛|𝚜|𝚝|𝚞|𝚟|𝚠|𝚡|𝚢|𝚣|𝚨|𝚩|𝚪|𝚫|𝚬|𝚭|𝚮|𝚯|𝚰|𝚱|𝚲|𝚳|𝚴|𝚵|𝚶|𝚷|𝚸|𝚹|𝚺|𝚻|𝚼|𝚽|𝚾|𝚿|𝛀|𝛁|𝛂|𝛃|𝛄|𝛅|𝛆|𝛇|𝛈|𝛉|𝛊|𝛋|𝛌|𝛍|𝛎|𝛏|𝛐|𝛑|𝛒|𝛓|𝛔|𝛕|𝛖|𝛗|𝛘|𝛙|𝛚|𝛛|𝛜|𝛝|𝛞|𝛟|𝛠|𝛡|𝛢|𝛣|𝛤|𝛥|𝛦|𝛧|𝛨|𝛩|𝛪|𝛫|𝛬|𝛭|𝛮|𝛯|𝛰|𝛱|𝛲|𝛳|𝛴|𝛵|𝛶|𝛷|𝛸|𝛹|𝛺|𝛻|𝛼|𝛽|𝛾|𝛿|𝜀|𝜁|𝜂|𝜃|𝜄|𝜅|𝜆|𝜇|𝜈|𝜉|𝜊|𝜋|𝜌|𝜍|𝜎|𝜏|𝜐|𝜑|𝜒|𝜓|𝜔|𝜕|𝜖|𝜗|𝜘|𝜙|𝜚|𝜛|𝜜|𝜝|𝜞|𝜟|𝜠|𝜡|𝜢|𝜣|𝜤|𝜥|𝜦|𝜧|𝜨|𝜩|𝜪|𝜫|𝜬|𝜭|𝜮|𝜯|𝜰|𝜱|𝜲|𝜳|𝜴|𝜵|𝜶|𝜷|𝜸|𝜹|𝜺|𝜻|𝜼|𝜽|𝜾|𝜿|𝝀|𝝁|𝝂|𝝃|𝝄|𝝅|𝝆|𝝇|𝝈|𝝉|𝝊|𝝋|𝝌|𝝍|𝝎|𝝏|𝝐|𝝑|𝝒|𝝓|𝝔|𝝕|𝝖|𝝗|𝝘|𝝙|𝝚|𝝛|𝝜|𝝝|𝝞|𝝟|𝝠|𝝡|𝝢|𝝣|𝝤|𝝥|𝝦|𝝧|𝝨|𝝩|𝝪|𝝫|𝝬|𝝭|𝝮|𝝯|𝝰|𝝱|𝝲|𝝳|𝝴|𝝵|𝝶|𝝷|𝝸|𝝹|𝝺|𝝻|𝝼|𝝽|𝝾|𝝿|𝞀|𝞁|𝞂|𝞃|𝞄|𝞅|𝞆|𝞇|𝞈|𝞉|𝞊|𝞋|𝞌|𝞍|𝞎|𝞏|𝞐|𝞑|𝞒|𝞓|𝞔|𝞕|𝞖|𝞗|𝞘|𝞙|𝞚|𝞛|𝞜|𝞝|𝞞|𝞟|𝞠|𝞡|𝞢|𝞣|𝞤|𝞥|𝞦|𝞧|𝞨|𝞩|𝞪|𝞫|𝞬|𝞭|𝞮|𝞯|𝞰|𝞱|𝞲|𝞳|𝞴|𝞵|𝞶|𝞷|𝞸|𝞹|𝞺|𝞻|𝞼|𝞽|𝞾|𝞿|𝟀|𝟁|𝟂|𝟃|𝟄|𝟅|𝟆|𝟇|𝟈|𝟉|𝟎|𝟏|𝟐|𝟑|𝟒|𝟓|𝟔|𝟕|𝟖|𝟗|𝟘|𝟙|𝟚|𝟛|𝟜|𝟝|𝟞|𝟟|𝟠|𝟡|𝟢|𝟣|𝟤|𝟥|𝟦|𝟧|𝟨|𝟩|𝟪|𝟫|𝟬|𝟭|𝟮|𝟯|𝟰|𝟱|𝟲|𝟳|𝟴|𝟵|𝟶|𝟷|𝟸|𝟹|𝟺|𝟻|𝟼|𝟽|𝟾|𝟿|ï¿½/g
            }
        },
        toLaTeX: {
            '#': '\\#',
            '$': '\\$',
            '%': '\\%',
            '&': '\\&',
            '<': '<',
            '>': '>',
            '[': '{[}',
            '\\': '{\\textbackslash}',
            ']': '{]}',
            '^': '\\^{}',
            '_': '\\_',
            '{': '\\{',
            '}': '\\}',
            '~': '{\\textasciitilde}',
            '\xA0': ' ',
            '\xA1': '{\\textexclamdown}',
            '\xA2': '{\\textcent}',
            '\xA3': '{\\textsterling}',
            '\xA4': '{\\textcurrency}',
            '\xA5': '{\\textyen}',
            '\xA6': '{\\textbrokenbar}',
            '\xA7': '{\\textsection}',
            '\xA8': '{\\textasciidieresis}',
            '\xA9': '{\\textcopyright}',
            '\xAA': '{\\textordfeminine}',
            '\xAB': '{\\guillemotleft}',
            '\xAC': '{\\lnot}',
            '\xAD': '\\-',
            '\xAE': '{\\textregistered}',
            '\xAF': '{\\textasciimacron}',
            '\xB0': '{\\textdegree}',
            '\xB1': '{\\pm}',
            '\xB2': '{^2}',
            '\xB3': '{^3}',
            '\xB4': '{\\textasciiacute}',
            '\xB5': '\\mathrm{\\mu}',
            '\xB6': '{\\textparagraph}',
            '\xB7': '{\\cdot}',
            '\xB8': '\\c{}',
            '\xB9': '{^1}',
            '\xBA': '{\\textordmasculine}',
            '\xBB': '{\\guillemotright}',
            '\xBC': '{\\textonequarter}',
            '\xBD': '{\\textonehalf}',
            '\xBE': '{\\textthreequarters}',
            '\xBF': '{\\textquestiondown}',
            '\xC0': '\\`{A}',
            '\xC1': '\\\'{A}',
            '\xC2': '\\^{A}',
            '\xC3': '\\~{A}',
            '\xC4': '\\"{A}',
            '\xC5': '{\\AA}',
            '\xC6': '{\\AE}',
            '\xC7': '\\c{C}',
            '\xC8': '\\`{E}',
            '\xC9': '\\\'{E}',
            '\xCA': '\\^{E}',
            '\xCB': '\\"{E}',
            '\xCC': '\\`{I}',
            '\xCD': '\\\'{I}',
            '\xCE': '\\^{I}',
            '\xCF': '\\"{I}',
            '\xD0': '{\\DH}',
            '\xD1': '\\~{N}',
            '\xD2': '\\`{O}',
            '\xD3': '\\\'{O}',
            '\xD4': '\\^{O}',
            '\xD5': '\\~{O}',
            '\xD6': '\\"{O}',
            '\xD7': '{\\texttimes}',
            '\xD8': '{\\O}',
            '\xD9': '\\`{U}',
            '\xDA': '\\\'{U}',
            '\xDB': '\\^{U}',
            '\xDC': '\\"{U}',
            '\xDD': '\\\'{Y}',
            '\xDE': '{\\TH}',
            '\xDF': '{\\ss}',
            '\xE0': '\\`{a}',
            '\xE1': '\\\'{a}',
            '\xE2': '\\^{a}',
            '\xE3': '\\~{a}',
            '\xE4': '\\"{a}',
            '\xE5': '{\\aa}',
            '\xE6': '{\\ae}',
            '\xE7': '\\c{c}',
            '\xE8': '\\`{e}',
            '\xE9': '\\\'{e}',
            '\xEA': '\\^{e}',
            '\xEB': '\\"{e}',
            '\xEC': '\\`{\\i}',
            '\xED': '\\\'{\\i}',
            '\xEE': '\\^{\\i}',
            '\xEF': '\\"{\\i}',
            '\xF0': '{\\dh}',
            '\xF1': '\\~{n}',
            '\xF2': '\\`{o}',
            '\xF3': '\\\'{o}',
            '\xF4': '\\^{o}',
            '\xF5': '\\~{o}',
            '\xF6': '\\"{o}',
            '\xF7': '{\\div}',
            '\xF8': '{\\o}',
            '\xF9': '\\`{u}',
            '\xFA': '\\\'{u}',
            '\xFB': '\\^{u}',
            '\xFC': '\\"{u}',
            '\xFD': '\\\'{y}',
            '\xFE': '{\\th}',
            '\xFF': '\\"{y}',
            '\u0100': '\\={A}',
            '\u0101': '\\={a}',
            '\u0102': '\\u{A}',
            '\u0103': '\\u{a}',
            '\u0104': '\\k{A}',
            '\u0105': '\\k{a}',
            '\u0106': '\\\'{C}',
            '\u0107': '\\\'{c}',
            '\u0108': '\\^{C}',
            '\u0109': '\\^{c}',
            '\u010A': '\\.{C}',
            '\u010B': '\\.{c}',
            '\u010C': '\\v{C}',
            '\u010D': '\\v{c}',
            '\u010E': '\\v{D}',
            '\u010F': '\\v{d}',
            '\u0110': '{\\DJ}',
            '\u0111': '{\\dj}',
            '\u0112': '\\={E}',
            '\u0113': '\\={e}',
            '\u0114': '\\u{E}',
            '\u0115': '\\u{e}',
            '\u0116': '\\.{E}',
            '\u0117': '\\.{e}',
            '\u0118': '\\k{E}',
            '\u0119': '\\k{e}',
            '\u011A': '\\v{E}',
            '\u011B': '\\v{e}',
            '\u011C': '\\^{G}',
            '\u011D': '\\^{g}',
            '\u011E': '\\u{G}',
            '\u011F': '\\u{g}',
            '\u0120': '\\.{G}',
            '\u0121': '\\.{g}',
            '\u0122': '\\c{G}',
            '\u0123': '\\c{g}',
            '\u0124': '\\^{H}',
            '\u0125': '\\^{h}',
            '\u0126': '{\\fontencoding{LELA}\\selectfont\\char40}',
            '\u0127': '{\\Elzxh}',
            '\u0128': '\\~{I}',
            '\u0129': '\\~{\\i}',
            '\u012A': '\\={I}',
            '\u012B': '\\={\\i}',
            '\u012C': '\\u{I}',
            '\u012D': '\\u{\\i}',
            '\u012E': '\\k{I}',
            '\u012F': '\\k{i}',
            '\u0130': '\\.{I}',
            '\u0131': '{\\i}',
            '\u0132': 'IJ',
            '\u0133': 'ij',
            '\u0134': '\\^{J}',
            '\u0135': '\\^{\\j}',
            '\u0136': '\\c{K}',
            '\u0137': '\\c{k}',
            '\u0138': '{\\fontencoding{LELA}\\selectfont\\char91}',
            '\u0139': '\\\'{L}',
            '\u013A': '\\\'{l}',
            '\u013B': '\\c{L}',
            '\u013C': '\\c{l}',
            '\u013D': '\\v{L}',
            '\u013E': '\\v{l}',
            '\u013F': '{\\fontencoding{LELA}\\selectfont\\char201}',
            '\u0140': '{\\fontencoding{LELA}\\selectfont\\char202}',
            '\u0141': '{\\L}',
            '\u0142': '{\\l}',
            '\u0143': '\\\'{N}',
            '\u0144': '\\\'{n}',
            '\u0145': '\\c{N}',
            '\u0146': '\\c{n}',
            '\u0147': '\\v{N}',
            '\u0148': '\\v{n}',
            '\u0149': '\'n',
            '\u014A': '{\\NG}',
            '\u014B': '{\\ng}',
            '\u014C': '\\={O}',
            '\u014D': '\\={o}',
            '\u014E': '\\u{O}',
            '\u014F': '\\u{o}',
            '\u0150': '\\H{O}',
            '\u0151': '\\H{o}',
            '\u0152': '{\\OE}',
            '\u0153': '{\\oe}',
            '\u0154': '\\\'{R}',
            '\u0155': '\\\'{r}',
            '\u0156': '\\c{R}',
            '\u0157': '\\c{r}',
            '\u0158': '\\v{R}',
            '\u0159': '\\v{r}',
            '\u015A': '\\\'{S}',
            '\u015B': '\\\'{s}',
            '\u015C': '\\^{S}',
            '\u015D': '\\^{s}',
            '\u015E': '\\c{S}',
            '\u015F': '\\c{s}',
            '\u0160': '\\v{S}',
            '\u0161': '\\v{s}',
            '\u0162': '\\c{T}',
            '\u0163': '\\c{t}',
            '\u0164': '\\v{T}',
            '\u0165': '\\v{t}',
            '\u0166': '{\\fontencoding{LELA}\\selectfont\\char47}',
            '\u0167': '{\\fontencoding{LELA}\\selectfont\\char63}',
            '\u0168': '\\~{U}',
            '\u0169': '\\~{u}',
            '\u016A': '\\={U}',
            '\u016B': '\\={u}',
            '\u016C': '\\u{U}',
            '\u016D': '\\u{u}',
            '\u016E': '\\r{U}',
            '\u016F': '\\r{u}',
            '\u0170': '\\H{U}',
            '\u0171': '\\H{u}',
            '\u0172': '\\k{U}',
            '\u0173': '\\k{u}',
            '\u0174': '\\^{W}',
            '\u0175': '\\^{w}',
            '\u0176': '\\^{Y}',
            '\u0177': '\\^{y}',
            '\u0178': '\\"{Y}',
            '\u0179': '\\\'{Z}',
            '\u017A': '\\\'{z}',
            '\u017B': '\\.{Z}',
            '\u017C': '\\.{z}',
            '\u017D': '\\v{Z}',
            '\u017E': '\\v{z}',
            '\u0192': 'f',
            '\u0195': '{\\texthvlig}',
            '\u019E': '{\\textnrleg}',
            '\u01AA': '{\\eth}',
            '\u01BA': '{\\fontencoding{LELA}\\selectfont\\char195}',
            '\u01C2': '{\\textdoublepipe}',
            '\u01F5': '\\\'{g}',
            '\u0250': '{\\Elztrna}',
            '\u0252': '{\\Elztrnsa}',
            '\u0254': '{\\Elzopeno}',
            '\u0256': '{\\Elzrtld}',
            '\u0258': '{\\fontencoding{LEIP}\\selectfont\\char61}',
            '\u0259': '{\\Elzschwa}',
            '\u025B': '{\\varepsilon}',
            '\u0261': 'g',
            '\u0263': '{\\Elzpgamma}',
            '\u0264': '{\\Elzpbgam}',
            '\u0265': '{\\Elztrnh}',
            '\u026C': '{\\Elzbtdl}',
            '\u026D': '{\\Elzrtll}',
            '\u026F': '{\\Elztrnm}',
            '\u0270': '{\\Elztrnmlr}',
            '\u0271': '{\\Elzltlmr}',
            '\u0272': '{\\Elzltln}',
            '\u0273': '{\\Elzrtln}',
            '\u0277': '{\\Elzclomeg}',
            '\u0278': '{\\textphi}',
            '\u0279': '{\\Elztrnr}',
            '\u027A': '{\\Elztrnrl}',
            '\u027B': '{\\Elzrttrnr}',
            '\u027C': '{\\Elzrl}',
            '\u027D': '{\\Elzrtlr}',
            '\u027E': '{\\Elzfhr}',
            '\u027F': '{\\fontencoding{LEIP}\\selectfont\\char202}',
            '\u0282': '{\\Elzrtls}',
            '\u0283': '{\\Elzesh}',
            '\u0287': '{\\Elztrnt}',
            '\u0288': '{\\Elzrtlt}',
            '\u028A': '{\\Elzpupsil}',
            '\u028B': '{\\Elzpscrv}',
            '\u028C': '{\\Elzinvv}',
            '\u028D': '{\\Elzinvw}',
            '\u028E': '{\\Elztrny}',
            '\u0290': '{\\Elzrtlz}',
            '\u0292': '{\\Elzyogh}',
            '\u0294': '{\\Elzglst}',
            '\u0295': '{\\Elzreglst}',
            '\u0296': '{\\Elzinglst}',
            '\u029E': '{\\textturnk}',
            '\u02A4': '{\\Elzdyogh}',
            '\u02A7': '{\\Elztesh}',
            '\u02BC': '\'',
            '\u02C7': '{\\textasciicaron}',
            '\u02C8': '{\\Elzverts}',
            '\u02CC': '{\\Elzverti}',
            '\u02D0': '{\\Elzlmrk}',
            '\u02D1': '{\\Elzhlmrk}',
            '\u02D2': '{\\Elzsbrhr}',
            '\u02D3': '{\\Elzsblhr}',
            '\u02D4': '{\\Elzrais}',
            '\u02D5': '{\\Elzlow}',
            '\u02D8': '{\\textasciibreve}',
            '\u02D9': '{\\textperiodcentered}',
            '\u02DA': '\\r{}',
            '\u02DB': '\\k{}',
            '\u02DC': '{\\texttildelow}',
            '\u02DD': '\\H{}',
            '\u02E5': '\\tone{55}',
            '\u02E6': '\\tone{44}',
            '\u02E7': '\\tone{33}',
            '\u02E8': '\\tone{22}',
            '\u02E9': '\\tone{11}',
            '\u0300': '\\`',
            '\u0301': '\\\'',
            '\u0302': '\\^',
            '\u0303': '\\~',
            '\u0304': '\\=',
            '\u0306': '\\u',
            '\u0307': '\\.',
            '\u0308': '\\"',
            '\u030A': '\\r',
            '\u030B': '\\H',
            '\u030C': '\\v',
            '\u030F': '\\cyrchar\\C',
            '\u0311': '{\\fontencoding{LECO}\\selectfont\\char177}',
            '\u0318': '{\\fontencoding{LECO}\\selectfont\\char184}',
            '\u0319': '{\\fontencoding{LECO}\\selectfont\\char185}',
            '\u0321': '{\\Elzpalh}',
            '\u0322': '{\\Elzrh}',
            '\u0327': '\\c',
            '\u0328': '\\k',
            '\u032A': '{\\Elzsbbrg}',
            '\u032B': '{\\fontencoding{LECO}\\selectfont\\char203}',
            '\u032F': '{\\fontencoding{LECO}\\selectfont\\char207}',
            '\u0335': '{\\Elzxl}',
            '\u0336': '{\\Elzbar}',
            '\u0337': '{\\fontencoding{LECO}\\selectfont\\char215}',
            '\u0338': '{\\fontencoding{LECO}\\selectfont\\char216}',
            '\u033A': '{\\fontencoding{LECO}\\selectfont\\char218}',
            '\u033B': '{\\fontencoding{LECO}\\selectfont\\char219}',
            '\u033C': '{\\fontencoding{LECO}\\selectfont\\char220}',
            '\u033D': '{\\fontencoding{LECO}\\selectfont\\char221}',
            '\u0361': '{\\fontencoding{LECO}\\selectfont\\char225}',
            '\u0386': '\\\'{A}',
            '\u0388': '\\\'{E}',
            '\u0389': '\\\'{H}',
            '\u038A': '\\\'{}{I}',
            '\u038C': '\\\'{}O',
            '\u038E': '\\mathrm{\'Y}',
            '\u038F': '\\mathrm{\'\\Omega}',
            '\u0390': '\\acute{\\ddot{\\iota}}',
            '\u0391': '{\\Alpha}',
            '\u0392': '{\\Beta}',
            '\u0393': '{\\Gamma}',
            '\u0394': '{\\Delta}',
            '\u0395': '{\\Epsilon}',
            '\u0396': '{\\Zeta}',
            '\u0397': '{\\Eta}',
            '\u0398': '{\\Theta}',
            '\u0399': '{\\Iota}',
            '\u039A': '{\\Kappa}',
            '\u039B': '{\\Lambda}',
            '\u039C': 'M',
            '\u039D': 'N',
            '\u039E': '{\\Xi}',
            '\u039F': 'O',
            '\u03A0': '{\\Pi}',
            '\u03A1': '{\\Rho}',
            '\u03A3': '{\\Sigma}',
            '\u03A4': '{\\Tau}',
            '\u03A5': '{\\Upsilon}',
            '\u03A6': '{\\Phi}',
            '\u03A7': '{\\Chi}',
            '\u03A8': '{\\Psi}',
            '\u03A9': '{\\Omega}',
            '\u03AA': '\\mathrm{\\ddot{I}}',
            '\u03AB': '\\mathrm{\\ddot{Y}}',
            '\u03AC': '\\\'{$\\alpha$}',
            '\u03AD': '\\acute{\\epsilon}',
            '\u03AE': '\\acute{\\eta}',
            '\u03AF': '\\acute{\\iota}',
            '\u03B0': '\\acute{\\ddot{\\upsilon}}',
            '\u03B1': '{\\alpha}',
            '\u03B2': '{\\beta}',
            '\u03B3': '{\\gamma}',
            '\u03B4': '{\\delta}',
            '\u03B5': '{\\epsilon}',
            '\u03B6': '{\\zeta}',
            '\u03B7': '{\\eta}',
            '\u03B8': '{\\texttheta}',
            '\u03B9': '{\\iota}',
            '\u03BA': '{\\kappa}',
            '\u03BB': '{\\lambda}',
            '\u03BC': '{\\mu}',
            '\u03BD': '{\\nu}',
            '\u03BE': '{\\xi}',
            '\u03BF': 'o',
            '\u03C0': '{\\pi}',
            '\u03C1': '{\\rho}',
            '\u03C2': '{\\varsigma}',
            '\u03C3': '{\\sigma}',
            '\u03C4': '{\\tau}',
            '\u03C5': '{\\upsilon}',
            '\u03C6': '{\\varphi}',
            '\u03C7': '{\\chi}',
            '\u03C8': '{\\psi}',
            '\u03C9': '{\\omega}',
            '\u03CA': '\\ddot{\\iota}',
            '\u03CB': '\\ddot{\\upsilon}',
            '\u03CC': '\\\'{o}',
            '\u03CD': '\\acute{\\upsilon}',
            '\u03CE': '\\acute{\\omega}',
            '\u03D0': '\\Pisymbol{ppi022}{87}',
            '\u03D1': '{\\textvartheta}',
            '\u03D2': '{\\Upsilon}',
            '\u03D5': '{\\phi}',
            '\u03D6': '{\\varpi}',
            '\u03DA': '{\\Stigma}',
            '\u03DC': '{\\Digamma}',
            '\u03DD': '{\\digamma}',
            '\u03DE': '{\\Koppa}',
            '\u03E0': '{\\Sampi}',
            '\u03F0': '{\\varkappa}',
            '\u03F1': '{\\varrho}',
            '\u03F4': '{\\textTheta}',
            '\u03F6': '{\\backepsilon}',
            '\u0401': '{\\cyrchar\\CYRYO}',
            '\u0402': '{\\cyrchar\\CYRDJE}',
            '\u0403': '\\cyrchar{\\\'\\CYRG}',
            '\u0404': '{\\cyrchar\\CYRIE}',
            '\u0405': '{\\cyrchar\\CYRDZE}',
            '\u0406': '{\\cyrchar\\CYRII}',
            '\u0407': '{\\cyrchar\\CYRYI}',
            '\u0408': '{\\cyrchar\\CYRJE}',
            '\u0409': '{\\cyrchar\\CYRLJE}',
            '\u040A': '{\\cyrchar\\CYRNJE}',
            '\u040B': '{\\cyrchar\\CYRTSHE}',
            '\u040C': '\\cyrchar{\\\'\\CYRK}',
            '\u040E': '{\\cyrchar\\CYRUSHRT}',
            '\u040F': '{\\cyrchar\\CYRDZHE}',
            '\u0410': '{\\cyrchar\\CYRA}',
            '\u0411': '{\\cyrchar\\CYRB}',
            '\u0412': '{\\cyrchar\\CYRV}',
            '\u0413': '{\\cyrchar\\CYRG}',
            '\u0414': '{\\cyrchar\\CYRD}',
            '\u0415': '{\\cyrchar\\CYRE}',
            '\u0416': '{\\cyrchar\\CYRZH}',
            '\u0417': '{\\cyrchar\\CYRZ}',
            '\u0418': '{\\cyrchar\\CYRI}',
            '\u0419': '{\\cyrchar\\CYRISHRT}',
            '\u041A': '{\\cyrchar\\CYRK}',
            '\u041B': '{\\cyrchar\\CYRL}',
            '\u041C': '{\\cyrchar\\CYRM}',
            '\u041D': '{\\cyrchar\\CYRN}',
            '\u041E': '{\\cyrchar\\CYRO}',
            '\u041F': '{\\cyrchar\\CYRP}',
            '\u0420': '{\\cyrchar\\CYRR}',
            '\u0421': '{\\cyrchar\\CYRS}',
            '\u0422': '{\\cyrchar\\CYRT}',
            '\u0423': '{\\cyrchar\\CYRU}',
            '\u0424': '{\\cyrchar\\CYRF}',
            '\u0425': '{\\cyrchar\\CYRH}',
            '\u0426': '{\\cyrchar\\CYRC}',
            '\u0427': '{\\cyrchar\\CYRCH}',
            '\u0428': '{\\cyrchar\\CYRSH}',
            '\u0429': '{\\cyrchar\\CYRSHCH}',
            '\u042A': '{\\cyrchar\\CYRHRDSN}',
            '\u042B': '{\\cyrchar\\CYRERY}',
            '\u042C': '{\\cyrchar\\CYRSFTSN}',
            '\u042D': '{\\cyrchar\\CYREREV}',
            '\u042E': '{\\cyrchar\\CYRYU}',
            '\u042F': '{\\cyrchar\\CYRYA}',
            '\u0430': '{\\cyrchar\\cyra}',
            '\u0431': '{\\cyrchar\\cyrb}',
            '\u0432': '{\\cyrchar\\cyrv}',
            '\u0433': '{\\cyrchar\\cyrg}',
            '\u0434': '{\\cyrchar\\cyrd}',
            '\u0435': '{\\cyrchar\\cyre}',
            '\u0436': '{\\cyrchar\\cyrzh}',
            '\u0437': '{\\cyrchar\\cyrz}',
            '\u0438': '{\\cyrchar\\cyri}',
            '\u0439': '{\\cyrchar\\cyrishrt}',
            '\u043A': '{\\cyrchar\\cyrk}',
            '\u043B': '{\\cyrchar\\cyrl}',
            '\u043C': '{\\cyrchar\\cyrm}',
            '\u043D': '{\\cyrchar\\cyrn}',
            '\u043E': '{\\cyrchar\\cyro}',
            '\u043F': '{\\cyrchar\\cyrp}',
            '\u0440': '{\\cyrchar\\cyrr}',
            '\u0441': '{\\cyrchar\\cyrs}',
            '\u0442': '{\\cyrchar\\cyrt}',
            '\u0443': '{\\cyrchar\\cyru}',
            '\u0444': '{\\cyrchar\\cyrf}',
            '\u0445': '{\\cyrchar\\cyrh}',
            '\u0446': '{\\cyrchar\\cyrc}',
            '\u0447': '{\\cyrchar\\cyrch}',
            '\u0448': '{\\cyrchar\\cyrsh}',
            '\u0449': '{\\cyrchar\\cyrshch}',
            '\u044A': '{\\cyrchar\\cyrhrdsn}',
            '\u044B': '{\\cyrchar\\cyrery}',
            '\u044C': '{\\cyrchar\\cyrsftsn}',
            '\u044D': '{\\cyrchar\\cyrerev}',
            '\u044E': '{\\cyrchar\\cyryu}',
            '\u044F': '{\\cyrchar\\cyrya}',
            '\u0451': '{\\cyrchar\\cyryo}',
            '\u0452': '{\\cyrchar\\cyrdje}',
            '\u0453': '\\cyrchar{\\\'\\cyrg}',
            '\u0454': '{\\cyrchar\\cyrie}',
            '\u0455': '{\\cyrchar\\cyrdze}',
            '\u0456': '{\\cyrchar\\cyrii}',
            '\u0457': '{\\cyrchar\\cyryi}',
            '\u0458': '{\\cyrchar\\cyrje}',
            '\u0459': '{\\cyrchar\\cyrlje}',
            '\u045A': '{\\cyrchar\\cyrnje}',
            '\u045B': '{\\cyrchar\\cyrtshe}',
            '\u045C': '\\cyrchar{\\\'\\cyrk}',
            '\u045E': '{\\cyrchar\\cyrushrt}',
            '\u045F': '{\\cyrchar\\cyrdzhe}',
            '\u0460': '{\\cyrchar\\CYROMEGA}',
            '\u0461': '{\\cyrchar\\cyromega}',
            '\u0462': '{\\cyrchar\\CYRYAT}',
            '\u0464': '{\\cyrchar\\CYRIOTE}',
            '\u0465': '{\\cyrchar\\cyriote}',
            '\u0466': '{\\cyrchar\\CYRLYUS}',
            '\u0467': '{\\cyrchar\\cyrlyus}',
            '\u0468': '{\\cyrchar\\CYRIOTLYUS}',
            '\u0469': '{\\cyrchar\\cyriotlyus}',
            '\u046A': '{\\cyrchar\\CYRBYUS}',
            '\u046C': '{\\cyrchar\\CYRIOTBYUS}',
            '\u046D': '{\\cyrchar\\cyriotbyus}',
            '\u046E': '{\\cyrchar\\CYRKSI}',
            '\u046F': '{\\cyrchar\\cyrksi}',
            '\u0470': '{\\cyrchar\\CYRPSI}',
            '\u0471': '{\\cyrchar\\cyrpsi}',
            '\u0472': '{\\cyrchar\\CYRFITA}',
            '\u0474': '{\\cyrchar\\CYRIZH}',
            '\u0478': '{\\cyrchar\\CYRUK}',
            '\u0479': '{\\cyrchar\\cyruk}',
            '\u047A': '{\\cyrchar\\CYROMEGARND}',
            '\u047B': '{\\cyrchar\\cyromegarnd}',
            '\u047C': '{\\cyrchar\\CYROMEGATITLO}',
            '\u047D': '{\\cyrchar\\cyromegatitlo}',
            '\u047E': '{\\cyrchar\\CYROT}',
            '\u047F': '{\\cyrchar\\cyrot}',
            '\u0480': '{\\cyrchar\\CYRKOPPA}',
            '\u0481': '{\\cyrchar\\cyrkoppa}',
            '\u0482': '{\\cyrchar\\cyrthousands}',
            '\u0488': '{\\cyrchar\\cyrhundredthousands}',
            '\u0489': '{\\cyrchar\\cyrmillions}',
            '\u048C': '{\\cyrchar\\CYRSEMISFTSN}',
            '\u048D': '{\\cyrchar\\cyrsemisftsn}',
            '\u048E': '{\\cyrchar\\CYRRTICK}',
            '\u048F': '{\\cyrchar\\cyrrtick}',
            '\u0490': '{\\cyrchar\\CYRGUP}',
            '\u0491': '{\\cyrchar\\cyrgup}',
            '\u0492': '{\\cyrchar\\CYRGHCRS}',
            '\u0493': '{\\cyrchar\\cyrghcrs}',
            '\u0494': '{\\cyrchar\\CYRGHK}',
            '\u0495': '{\\cyrchar\\cyrghk}',
            '\u0496': '{\\cyrchar\\CYRZHDSC}',
            '\u0497': '{\\cyrchar\\cyrzhdsc}',
            '\u0498': '{\\cyrchar\\CYRZDSC}',
            '\u0499': '{\\cyrchar\\cyrzdsc}',
            '\u049A': '{\\cyrchar\\CYRKDSC}',
            '\u049B': '{\\cyrchar\\cyrkdsc}',
            '\u049C': '{\\cyrchar\\CYRKVCRS}',
            '\u049D': '{\\cyrchar\\cyrkvcrs}',
            '\u049E': '{\\cyrchar\\CYRKHCRS}',
            '\u049F': '{\\cyrchar\\cyrkhcrs}',
            '\u04A0': '{\\cyrchar\\CYRKBEAK}',
            '\u04A1': '{\\cyrchar\\cyrkbeak}',
            '\u04A2': '{\\cyrchar\\CYRNDSC}',
            '\u04A3': '{\\cyrchar\\cyrndsc}',
            '\u04A4': '{\\cyrchar\\CYRNG}',
            '\u04A5': '{\\cyrchar\\cyrng}',
            '\u04A6': '{\\cyrchar\\CYRPHK}',
            '\u04A7': '{\\cyrchar\\cyrphk}',
            '\u04A8': '{\\cyrchar\\CYRABHHA}',
            '\u04A9': '{\\cyrchar\\cyrabhha}',
            '\u04AA': '{\\cyrchar\\CYRSDSC}',
            '\u04AB': '{\\cyrchar\\cyrsdsc}',
            '\u04AC': '{\\cyrchar\\CYRTDSC}',
            '\u04AD': '{\\cyrchar\\cyrtdsc}',
            '\u04AE': '{\\cyrchar\\CYRY}',
            '\u04AF': '{\\cyrchar\\cyry}',
            '\u04B0': '{\\cyrchar\\CYRYHCRS}',
            '\u04B1': '{\\cyrchar\\cyryhcrs}',
            '\u04B2': '{\\cyrchar\\CYRHDSC}',
            '\u04B3': '{\\cyrchar\\cyrhdsc}',
            '\u04B4': '{\\cyrchar\\CYRTETSE}',
            '\u04B5': '{\\cyrchar\\cyrtetse}',
            '\u04B6': '{\\cyrchar\\CYRCHRDSC}',
            '\u04B7': '{\\cyrchar\\cyrchrdsc}',
            '\u04B8': '{\\cyrchar\\CYRCHVCRS}',
            '\u04B9': '{\\cyrchar\\cyrchvcrs}',
            '\u04BA': '{\\cyrchar\\CYRSHHA}',
            '\u04BB': '{\\cyrchar\\cyrshha}',
            '\u04BC': '{\\cyrchar\\CYRABHCH}',
            '\u04BD': '{\\cyrchar\\cyrabhch}',
            '\u04BE': '{\\cyrchar\\CYRABHCHDSC}',
            '\u04BF': '{\\cyrchar\\cyrabhchdsc}',
            '\u04C0': '{\\cyrchar\\CYRpalochka}',
            '\u04C3': '{\\cyrchar\\CYRKHK}',
            '\u04C4': '{\\cyrchar\\cyrkhk}',
            '\u04C7': '{\\cyrchar\\CYRNHK}',
            '\u04C8': '{\\cyrchar\\cyrnhk}',
            '\u04CB': '{\\cyrchar\\CYRCHLDSC}',
            '\u04CC': '{\\cyrchar\\cyrchldsc}',
            '\u04D4': '{\\cyrchar\\CYRAE}',
            '\u04D5': '{\\cyrchar\\cyrae}',
            '\u04D8': '{\\cyrchar\\CYRSCHWA}',
            '\u04D9': '{\\cyrchar\\cyrschwa}',
            '\u04E0': '{\\cyrchar\\CYRABHDZE}',
            '\u04E1': '{\\cyrchar\\cyrabhdze}',
            '\u04E8': '{\\cyrchar\\CYROTLD}',
            '\u04E9': '{\\cyrchar\\cyrotld}',
            '\u2002': '\\hspace{0.6em}',
            '\u2003': '\\hspace{1em}',
            '\u2004': '\\hspace{0.33em}',
            '\u2005': '\\hspace{0.25em}',
            '\u2006': '\\hspace{0.166em}',
            '\u2007': '\\hphantom{0}',
            '\u2008': '\\hphantom{,}',
            '\u2009': '\\hspace{0.167em}',
            '\u200A': '{\\mkern1mu}',
            '\u2010': '-',
            '\u2013': '{\\textendash}',
            '\u2014': '{\\textemdash}',
            '\u2015': '\\rule{1em}{1pt}',
            '\u2016': '{\\Vert}',
            '\u2018': '`',
            '\u2019': '\'',
            '\u201A': ',',
            '\u201B': '{\\Elzreapos}',
            '\u201C': '``',
            '\u201D': '\'\'',
            '\u201E': ',,',
            '\u2020': '{\\textdagger}',
            '\u2021': '{\\textdaggerdbl}',
            '\u2022': '{\\textbullet}',
            '\u2024': '.',
            '\u2025': '..',
            '\u2026': '{\\ldots}',
            '\u2030': '{\\textperthousand}',
            '\u2031': '{\\textpertenthousand}',
            '\u2032': '{\'}',
            '\u2033': '{\'\'}',
            '\u2034': '{\'\'\'}',
            '\u2035': '{\\backprime}',
            '\u2039': '{\\guilsinglleft}',
            '\u203A': '{\\guilsinglright}',
            '\u2057': '\'\'\'\'',
            '\u205F': '{\\mkern4mu}',
            '\u2060': '{\\nolinebreak}',
            '\u20A7': '\\ensuremath{\\Elzpes}',
            '\u20AC': '{\\mbox{\\texteuro}}',
            '\u20DB': '{\\dddot}',
            '\u20DC': '{\\ddddot}',
            '\u2102': '\\mathbb{C}',
            '\u210A': '\\mathscr{g}',
            '\u210B': '\\mathscr{H}',
            '\u210C': '\\mathfrak{H}',
            '\u210D': '\\mathbb{H}',
            '\u210F': '{\\hslash}',
            '\u2110': '\\mathscr{I}',
            '\u2111': '\\mathfrak{I}',
            '\u2112': '\\mathscr{L}',
            '\u2113': '\\mathscr{l}',
            '\u2115': '\\mathbb{N}',
            '\u2116': '{\\cyrchar\\textnumero}',
            '\u2118': '{\\wp}',
            '\u2119': '\\mathbb{P}',
            '\u211A': '\\mathbb{Q}',
            '\u211B': '\\mathscr{R}',
            '\u211C': '\\mathfrak{R}',
            '\u211D': '\\mathbb{R}',
            '\u211E': '{\\Elzxrat}',
            '\u2122': '{\\texttrademark}',
            '\u2124': '\\mathbb{Z}',
            '\u2126': '{\\Omega}',
            '\u2127': '{\\mho}',
            '\u2128': '\\mathfrak{Z}',
            '\u2129': '\\ElsevierGlyph{2129}',
            '\u212B': '{\\AA}',
            '\u212C': '\\mathscr{B}',
            '\u212D': '\\mathfrak{C}',
            '\u212F': '\\mathscr{e}',
            '\u2130': '\\mathscr{E}',
            '\u2131': '\\mathscr{F}',
            '\u2133': '\\mathscr{M}',
            '\u2134': '\\mathscr{o}',
            '\u2135': '{\\aleph}',
            '\u2136': '{\\beth}',
            '\u2137': '{\\gimel}',
            '\u2138': '{\\daleth}',
            '\u2153': '\\textfrac{1}{3}',
            '\u2154': '\\textfrac{2}{3}',
            '\u2155': '\\textfrac{1}{5}',
            '\u2156': '\\textfrac{2}{5}',
            '\u2157': '\\textfrac{3}{5}',
            '\u2158': '\\textfrac{4}{5}',
            '\u2159': '\\textfrac{1}{6}',
            '\u215A': '\\textfrac{5}{6}',
            '\u215B': '\\textfrac{1}{8}',
            '\u215C': '\\textfrac{3}{8}',
            '\u215D': '\\textfrac{5}{8}',
            '\u215E': '\\textfrac{7}{8}',
            '\u2190': '{\\leftarrow}',
            '\u2191': '{\\uparrow}',
            '\u2192': '{\\rightarrow}',
            '\u2193': '{\\downarrow}',
            '\u2194': '{\\leftrightarrow}',
            '\u2195': '{\\updownarrow}',
            '\u2196': '{\\nwarrow}',
            '\u2197': '{\\nearrow}',
            '\u2198': '{\\searrow}',
            '\u2199': '{\\swarrow}',
            '\u219A': '{\\nleftarrow}',
            '\u219B': '{\\nrightarrow}',
            '\u219C': '{\\arrowwaveright}',
            '\u219D': '{\\arrowwaveright}',
            '\u219E': '{\\twoheadleftarrow}',
            '\u21A0': '{\\twoheadrightarrow}',
            '\u21A2': '{\\leftarrowtail}',
            '\u21A3': '{\\rightarrowtail}',
            '\u21A6': '{\\mapsto}',
            '\u21A9': '{\\hookleftarrow}',
            '\u21AA': '{\\hookrightarrow}',
            '\u21AB': '{\\looparrowleft}',
            '\u21AC': '{\\looparrowright}',
            '\u21AD': '{\\leftrightsquigarrow}',
            '\u21AE': '{\\nleftrightarrow}',
            '\u21B0': '{\\Lsh}',
            '\u21B1': '{\\Rsh}',
            '\u21B3': '\\ElsevierGlyph{21B3}',
            '\u21B6': '{\\curvearrowleft}',
            '\u21B7': '{\\curvearrowright}',
            '\u21BA': '{\\circlearrowleft}',
            '\u21BB': '{\\circlearrowright}',
            '\u21BC': '{\\leftharpoonup}',
            '\u21BD': '{\\leftharpoondown}',
            '\u21BE': '{\\upharpoonright}',
            '\u21BF': '{\\upharpoonleft}',
            '\u21C0': '{\\rightharpoonup}',
            '\u21C1': '{\\rightharpoondown}',
            '\u21C2': '{\\downharpoonright}',
            '\u21C3': '{\\downharpoonleft}',
            '\u21C4': '{\\rightleftarrows}',
            '\u21C5': '{\\dblarrowupdown}',
            '\u21C6': '{\\leftrightarrows}',
            '\u21C7': '{\\leftleftarrows}',
            '\u21C8': '{\\upuparrows}',
            '\u21C9': '{\\rightrightarrows}',
            '\u21CA': '{\\downdownarrows}',
            '\u21CB': '{\\leftrightharpoons}',
            '\u21CC': '{\\rightleftharpoons}',
            '\u21CD': '{\\nLeftarrow}',
            '\u21CE': '{\\nLeftrightarrow}',
            '\u21CF': '{\\nRightarrow}',
            '\u21D0': '{\\Leftarrow}',
            '\u21D1': '{\\Uparrow}',
            '\u21D2': '{\\Rightarrow}',
            '\u21D3': '{\\Downarrow}',
            '\u21D4': '{\\Leftrightarrow}',
            '\u21D5': '{\\Updownarrow}',
            '\u21DA': '{\\Lleftarrow}',
            '\u21DB': '{\\Rrightarrow}',
            '\u21DD': '{\\rightsquigarrow}',
            '\u21F5': '{\\DownArrowUpArrow}',
            '\u2200': '{\\forall}',
            '\u2201': '{\\complement}',
            '\u2202': '{\\partial}',
            '\u2203': '{\\exists}',
            '\u2204': '{\\nexists}',
            '\u2205': '{\\varnothing}',
            '\u2207': '{\\nabla}',
            '\u2208': '{\\in}',
            '\u2209': '{\\not\\in}',
            '\u220B': '{\\ni}',
            '\u220C': '{\\not\\ni}',
            '\u220F': '{\\prod}',
            '\u2210': '{\\coprod}',
            '\u2211': '{\\sum}',
            '\u2212': '-',
            '\u2213': '{\\mp}',
            '\u2214': '{\\dotplus}',
            '\u2216': '{\\setminus}',
            '\u2217': '{_\\ast}',
            '\u2218': '{\\circ}',
            '\u2219': '{\\bullet}',
            '\u221A': '{\\surd}',
            '\u221D': '{\\propto}',
            '\u221E': '{\\infty}',
            '\u221F': '{\\rightangle}',
            '\u2220': '{\\angle}',
            '\u2221': '{\\measuredangle}',
            '\u2222': '{\\sphericalangle}',
            '\u2223': '{\\mid}',
            '\u2224': '{\\nmid}',
            '\u2225': '{\\parallel}',
            '\u2226': '{\\nparallel}',
            '\u2227': '{\\wedge}',
            '\u2228': '{\\vee}',
            '\u2229': '{\\cap}',
            '\u222A': '{\\cup}',
            '\u222B': '{\\int}',
            '\u222C': '{\\int\\!\\int}',
            '\u222D': '{\\int\\!\\int\\!\\int}',
            '\u222E': '{\\oint}',
            '\u222F': '{\\surfintegral}',
            '\u2230': '{\\volintegral}',
            '\u2231': '{\\clwintegral}',
            '\u2232': '\\ElsevierGlyph{2232}',
            '\u2233': '\\ElsevierGlyph{2233}',
            '\u2234': '{\\therefore}',
            '\u2235': '{\\because}',
            '\u2237': '{\\Colon}',
            '\u2238': '\\ElsevierGlyph{2238}',
            '\u223A': '\\mathbin{{:}\\!\\!{-}\\!\\!{:}}',
            '\u223B': '{\\homothetic}',
            '\u223C': '{\\sim}',
            '\u223D': '{\\backsim}',
            '\u223E': '{\\lazysinv}',
            '\u2240': '{\\wr}',
            '\u2241': '{\\not\\sim}',
            '\u2242': '\\ElsevierGlyph{2242}',
            '\u2242\u0338': '{\\NotEqualTilde}',
            '\u2243': '{\\simeq}',
            '\u2244': '{\\not\\simeq}',
            '\u2245': '{\\cong}',
            '\u2246': '{\\approxnotequal}',
            '\u2247': '{\\not\\cong}',
            '\u2248': '{\\approx}',
            '\u2249': '{\\not\\approx}',
            '\u224A': '{\\approxeq}',
            '\u224B': '{\\tildetrpl}',
            '\u224B\u0338': '{\\not\\apid}',
            '\u224C': '{\\allequal}',
            '\u224D': '{\\asymp}',
            '\u224E': '{\\Bumpeq}',
            '\u224E\u0338': '{\\NotHumpDownHump}',
            '\u224F': '{\\bumpeq}',
            '\u224F\u0338': '{\\NotHumpEqual}',
            '\u2250': '{\\doteq}',
            '\u2250\u0338': '\\not\\doteq',
            '\u2251': '{\\doteqdot}',
            '\u2252': '{\\fallingdotseq}',
            '\u2253': '{\\risingdotseq}',
            '\u2254': ':=',
            '\u2255': '=:',
            '\u2256': '{\\eqcirc}',
            '\u2257': '{\\circeq}',
            '\u2259': '{\\estimates}',
            '\u225A': '\\ElsevierGlyph{225A}',
            '\u225B': '{\\starequal}',
            '\u225C': '{\\triangleq}',
            '\u225F': '\\ElsevierGlyph{225F}',
            '\u2260': '\\not =',
            '\u2261': '{\\equiv}',
            '\u2262': '{\\not\\equiv}',
            '\u2264': '{\\leq}',
            '\u2265': '{\\geq}',
            '\u2266': '{\\leqq}',
            '\u2267': '{\\geqq}',
            '\u2268': '{\\lneqq}',
            '\u2268\uFE00': '{\\lvertneqq}',
            '\u2269': '{\\gneqq}',
            '\u2269\uFE00': '{\\gvertneqq}',
            '\u226A': '{\\ll}',
            '\u226A\u0338': '{\\NotLessLess}',
            '\u226B': '{\\gg}',
            '\u226B\u0338': '{\\NotGreaterGreater}',
            '\u226C': '{\\between}',
            '\u226D': '{\\not\\kern-0.3em\\times}',
            '\u226E': '\\not<',
            '\u226F': '\\not>',
            '\u2270': '{\\not\\leq}',
            '\u2271': '{\\not\\geq}',
            '\u2272': '{\\lessequivlnt}',
            '\u2273': '{\\greaterequivlnt}',
            '\u2274': '\\ElsevierGlyph{2274}',
            '\u2275': '\\ElsevierGlyph{2275}',
            '\u2276': '{\\lessgtr}',
            '\u2277': '{\\gtrless}',
            '\u2278': '{\\notlessgreater}',
            '\u2279': '{\\notgreaterless}',
            '\u227A': '{\\prec}',
            '\u227B': '{\\succ}',
            '\u227C': '{\\preccurlyeq}',
            '\u227D': '{\\succcurlyeq}',
            '\u227E': '{\\precapprox}',
            '\u227E\u0338': '{\\NotPrecedesTilde}',
            '\u227F': '{\\succapprox}',
            '\u227F\u0338': '{\\NotSucceedsTilde}',
            '\u2280': '{\\not\\prec}',
            '\u2281': '{\\not\\succ}',
            '\u2282': '{\\subset}',
            '\u2283': '{\\supset}',
            '\u2284': '{\\not\\subset}',
            '\u2285': '{\\not\\supset}',
            '\u2286': '{\\subseteq}',
            '\u2287': '{\\supseteq}',
            '\u2288': '{\\not\\subseteq}',
            '\u2289': '{\\not\\supseteq}',
            '\u228A': '{\\subsetneq}',
            '\u228A\uFE00': '{\\varsubsetneqq}',
            '\u228B': '{\\supsetneq}',
            '\u228B\uFE00': '{\\varsupsetneq}',
            '\u228E': '{\\uplus}',
            '\u228F': '{\\sqsubset}',
            '\u228F\u0338': '{\\NotSquareSubset}',
            '\u2290': '{\\sqsupset}',
            '\u2290\u0338': '{\\NotSquareSuperset}',
            '\u2291': '{\\sqsubseteq}',
            '\u2292': '{\\sqsupseteq}',
            '\u2293': '{\\sqcap}',
            '\u2294': '{\\sqcup}',
            '\u2295': '{\\oplus}',
            '\u2296': '{\\ominus}',
            '\u2297': '{\\otimes}',
            '\u2298': '{\\oslash}',
            '\u2299': '{\\odot}',
            '\u229A': '{\\circledcirc}',
            '\u229B': '{\\circledast}',
            '\u229D': '{\\circleddash}',
            '\u229E': '{\\boxplus}',
            '\u229F': '{\\boxminus}',
            '\u22A0': '{\\boxtimes}',
            '\u22A1': '{\\boxdot}',
            '\u22A2': '{\\vdash}',
            '\u22A3': '{\\dashv}',
            '\u22A4': '{\\top}',
            '\u22A5': '{\\perp}',
            '\u22A7': '{\\truestate}',
            '\u22A8': '{\\forcesextra}',
            '\u22A9': '{\\Vdash}',
            '\u22AA': '{\\Vvdash}',
            '\u22AB': '{\\VDash}',
            '\u22AC': '{\\nvdash}',
            '\u22AD': '{\\nvDash}',
            '\u22AE': '{\\nVdash}',
            '\u22AF': '{\\nVDash}',
            '\u22B2': '{\\vartriangleleft}',
            '\u22B3': '{\\vartriangleright}',
            '\u22B4': '{\\trianglelefteq}',
            '\u22B5': '{\\trianglerighteq}',
            '\u22B6': '{\\original}',
            '\u22B7': '{\\image}',
            '\u22B8': '{\\multimap}',
            '\u22B9': '{\\hermitconjmatrix}',
            '\u22BA': '{\\intercal}',
            '\u22BB': '{\\veebar}',
            '\u22BE': '{\\rightanglearc}',
            '\u22C0': '\\ElsevierGlyph{22C0}',
            '\u22C1': '\\ElsevierGlyph{22C1}',
            '\u22C2': '{\\bigcap}',
            '\u22C3': '{\\bigcup}',
            '\u22C4': '{\\diamond}',
            '\u22C5': '{\\cdot}',
            '\u22C6': '{\\star}',
            '\u22C7': '{\\divideontimes}',
            '\u22C8': '{\\bowtie}',
            '\u22C9': '{\\ltimes}',
            '\u22CA': '{\\rtimes}',
            '\u22CB': '{\\leftthreetimes}',
            '\u22CC': '{\\rightthreetimes}',
            '\u22CD': '{\\backsimeq}',
            '\u22CE': '{\\curlyvee}',
            '\u22CF': '{\\curlywedge}',
            '\u22D0': '{\\Subset}',
            '\u22D1': '{\\Supset}',
            '\u22D2': '{\\Cap}',
            '\u22D3': '{\\Cup}',
            '\u22D4': '{\\pitchfork}',
            '\u22D6': '{\\lessdot}',
            '\u22D7': '{\\gtrdot}',
            '\u22D8': '{\\verymuchless}',
            '\u22D9': '{\\verymuchgreater}',
            '\u22DA': '{\\lesseqgtr}',
            '\u22DB': '{\\gtreqless}',
            '\u22DE': '{\\curlyeqprec}',
            '\u22DF': '{\\curlyeqsucc}',
            '\u22E2': '{\\not\\sqsubseteq}',
            '\u22E3': '{\\not\\sqsupseteq}',
            '\u22E5': '{\\Elzsqspne}',
            '\u22E6': '{\\lnsim}',
            '\u22E7': '{\\gnsim}',
            '\u22E8': '{\\precedesnotsimilar}',
            '\u22E9': '{\\succnsim}',
            '\u22EA': '{\\ntriangleleft}',
            '\u22EB': '{\\ntriangleright}',
            '\u22EC': '{\\ntrianglelefteq}',
            '\u22ED': '{\\ntrianglerighteq}',
            '\u22EE': '{\\vdots}',
            '\u22EF': '{\\cdots}',
            '\u22F0': '{\\upslopeellipsis}',
            '\u22F1': '{\\downslopeellipsis}',
            '\u2305': '{\\barwedge}',
            '\u2306': '{\\perspcorrespond}',
            '\u2308': '{\\lceil}',
            '\u2309': '{\\rceil}',
            '\u230A': '{\\lfloor}',
            '\u230B': '{\\rfloor}',
            '\u2315': '{\\recorder}',
            '\u2316': '\\mathchar"2208',
            '\u231C': '{\\ulcorner}',
            '\u231D': '{\\urcorner}',
            '\u231E': '{\\llcorner}',
            '\u231F': '{\\lrcorner}',
            '\u2322': '{\\frown}',
            '\u2323': '{\\smile}',
            '\u233D': '\\ElsevierGlyph{E838}',
            '\u23A3': '{\\Elzdlcorn}',
            '\u23B0': '{\\lmoustache}',
            '\u23B1': '{\\rmoustache}',
            '\u2423': '{\\textvisiblespace}',
            '\u2460': '\\ding{172}',
            '\u2461': '\\ding{173}',
            '\u2462': '\\ding{174}',
            '\u2463': '\\ding{175}',
            '\u2464': '\\ding{176}',
            '\u2465': '\\ding{177}',
            '\u2466': '\\ding{178}',
            '\u2467': '\\ding{179}',
            '\u2468': '\\ding{180}',
            '\u2469': '\\ding{181}',
            '\u24C8': '{\\circledS}',
            '\u2506': '{\\Elzdshfnc}',
            '\u2519': '{\\Elzsqfnw}',
            '\u2571': '{\\diagup}',
            '\u25A0': '\\ding{110}',
            '\u25A1': '{\\square}',
            '\u25AA': '{\\blacksquare}',
            '\u25AD': '\\fbox{~~}',
            '\u25AF': '{\\Elzvrecto}',
            '\u25B1': '\\ElsevierGlyph{E381}',
            '\u25B2': '\\ding{115}',
            '\u25B3': '{\\bigtriangleup}',
            '\u25B4': '{\\blacktriangle}',
            '\u25B5': '{\\vartriangle}',
            '\u25B8': '{\\blacktriangleright}',
            '\u25B9': '{\\triangleright}',
            '\u25BC': '\\ding{116}',
            '\u25BD': '{\\bigtriangledown}',
            '\u25BE': '{\\blacktriangledown}',
            '\u25BF': '{\\triangledown}',
            '\u25C2': '{\\blacktriangleleft}',
            '\u25C3': '{\\triangleleft}',
            '\u25C6': '\\ding{117}',
            '\u25CA': '{\\lozenge}',
            '\u25CB': '{\\bigcirc}',
            '\u25CF': '\\ding{108}',
            '\u25D0': '{\\Elzcirfl}',
            '\u25D1': '{\\Elzcirfr}',
            '\u25D2': '{\\Elzcirfb}',
            '\u25D7': '\\ding{119}',
            '\u25D8': '{\\Elzrvbull}',
            '\u25E7': '{\\Elzsqfl}',
            '\u25E8': '{\\Elzsqfr}',
            '\u25EA': '{\\Elzsqfse}',
            '\u25EF': '{\\bigcirc}',
            '\u2605': '\\ding{72}',
            '\u2606': '\\ding{73}',
            '\u260E': '\\ding{37}',
            '\u261B': '\\ding{42}',
            '\u261E': '\\ding{43}',
            '\u263E': '{\\rightmoon}',
            '\u263F': '{\\mercury}',
            '\u2640': '{\\venus}',
            '\u2642': '{\\male}',
            '\u2643': '{\\jupiter}',
            '\u2644': '{\\saturn}',
            '\u2645': '{\\uranus}',
            '\u2646': '{\\neptune}',
            '\u2647': '{\\pluto}',
            '\u2648': '{\\aries}',
            '\u2649': '{\\taurus}',
            '\u264A': '{\\gemini}',
            '\u264B': '{\\cancer}',
            '\u264C': '{\\leo}',
            '\u264D': '{\\virgo}',
            '\u264E': '{\\libra}',
            '\u264F': '{\\scorpio}',
            '\u2650': '{\\sagittarius}',
            '\u2651': '{\\capricornus}',
            '\u2652': '{\\aquarius}',
            '\u2653': '{\\pisces}',
            '\u2660': '\\ding{171}',
            '\u2662': '{\\diamond}',
            '\u2663': '\\ding{168}',
            '\u2665': '\\ding{170}',
            '\u2666': '\\ding{169}',
            '\u2669': '{\\quarternote}',
            '\u266A': '{\\eighthnote}',
            '\u266D': '{\\flat}',
            '\u266E': '{\\natural}',
            '\u266F': '{\\sharp}',
            '\u2701': '\\ding{33}',
            '\u2702': '\\ding{34}',
            '\u2703': '\\ding{35}',
            '\u2704': '\\ding{36}',
            '\u2706': '\\ding{38}',
            '\u2707': '\\ding{39}',
            '\u2708': '\\ding{40}',
            '\u2709': '\\ding{41}',
            '\u270C': '\\ding{44}',
            '\u270D': '\\ding{45}',
            '\u270E': '\\ding{46}',
            '\u270F': '\\ding{47}',
            '\u2710': '\\ding{48}',
            '\u2711': '\\ding{49}',
            '\u2712': '\\ding{50}',
            '\u2713': '\\ding{51}',
            '\u2714': '\\ding{52}',
            '\u2715': '\\ding{53}',
            '\u2716': '\\ding{54}',
            '\u2717': '\\ding{55}',
            '\u2718': '\\ding{56}',
            '\u2719': '\\ding{57}',
            '\u271A': '\\ding{58}',
            '\u271B': '\\ding{59}',
            '\u271C': '\\ding{60}',
            '\u271D': '\\ding{61}',
            '\u271E': '\\ding{62}',
            '\u271F': '\\ding{63}',
            '\u2720': '\\ding{64}',
            '\u2721': '\\ding{65}',
            '\u2722': '\\ding{66}',
            '\u2723': '\\ding{67}',
            '\u2724': '\\ding{68}',
            '\u2725': '\\ding{69}',
            '\u2726': '\\ding{70}',
            '\u2727': '\\ding{71}',
            '\u2729': '\\ding{73}',
            '\u272A': '\\ding{74}',
            '\u272B': '\\ding{75}',
            '\u272C': '\\ding{76}',
            '\u272D': '\\ding{77}',
            '\u272E': '\\ding{78}',
            '\u272F': '\\ding{79}',
            '\u2730': '\\ding{80}',
            '\u2731': '\\ding{81}',
            '\u2732': '\\ding{82}',
            '\u2733': '\\ding{83}',
            '\u2734': '\\ding{84}',
            '\u2735': '\\ding{85}',
            '\u2736': '\\ding{86}',
            '\u2737': '\\ding{87}',
            '\u2738': '\\ding{88}',
            '\u2739': '\\ding{89}',
            '\u273A': '\\ding{90}',
            '\u273B': '\\ding{91}',
            '\u273C': '\\ding{92}',
            '\u273D': '\\ding{93}',
            '\u273E': '\\ding{94}',
            '\u273F': '\\ding{95}',
            '\u2740': '\\ding{96}',
            '\u2741': '\\ding{97}',
            '\u2742': '\\ding{98}',
            '\u2743': '\\ding{99}',
            '\u2744': '\\ding{100}',
            '\u2745': '\\ding{101}',
            '\u2746': '\\ding{102}',
            '\u2747': '\\ding{103}',
            '\u2748': '\\ding{104}',
            '\u2749': '\\ding{105}',
            '\u274A': '\\ding{106}',
            '\u274B': '\\ding{107}',
            '\u274D': '\\ding{109}',
            '\u274F': '\\ding{111}',
            '\u2750': '\\ding{112}',
            '\u2751': '\\ding{113}',
            '\u2752': '\\ding{114}',
            '\u2756': '\\ding{118}',
            '\u2758': '\\ding{120}',
            '\u2759': '\\ding{121}',
            '\u275A': '\\ding{122}',
            '\u275B': '\\ding{123}',
            '\u275C': '\\ding{124}',
            '\u275D': '\\ding{125}',
            '\u275E': '\\ding{126}',
            '\u2761': '\\ding{161}',
            '\u2762': '\\ding{162}',
            '\u2763': '\\ding{163}',
            '\u2764': '\\ding{164}',
            '\u2765': '\\ding{165}',
            '\u2766': '\\ding{166}',
            '\u2767': '\\ding{167}',
            '\u2776': '\\ding{182}',
            '\u2777': '\\ding{183}',
            '\u2778': '\\ding{184}',
            '\u2779': '\\ding{185}',
            '\u277A': '\\ding{186}',
            '\u277B': '\\ding{187}',
            '\u277C': '\\ding{188}',
            '\u277D': '\\ding{189}',
            '\u277E': '\\ding{190}',
            '\u277F': '\\ding{191}',
            '\u2780': '\\ding{192}',
            '\u2781': '\\ding{193}',
            '\u2782': '\\ding{194}',
            '\u2783': '\\ding{195}',
            '\u2784': '\\ding{196}',
            '\u2785': '\\ding{197}',
            '\u2786': '\\ding{198}',
            '\u2787': '\\ding{199}',
            '\u2788': '\\ding{200}',
            '\u2789': '\\ding{201}',
            '\u278A': '\\ding{202}',
            '\u278B': '\\ding{203}',
            '\u278C': '\\ding{204}',
            '\u278D': '\\ding{205}',
            '\u278E': '\\ding{206}',
            '\u278F': '\\ding{207}',
            '\u2790': '\\ding{208}',
            '\u2791': '\\ding{209}',
            '\u2792': '\\ding{210}',
            '\u2793': '\\ding{211}',
            '\u2794': '\\ding{212}',
            '\u2798': '\\ding{216}',
            '\u2799': '\\ding{217}',
            '\u279A': '\\ding{218}',
            '\u279B': '\\ding{219}',
            '\u279C': '\\ding{220}',
            '\u279D': '\\ding{221}',
            '\u279E': '\\ding{222}',
            '\u279F': '\\ding{223}',
            '\u27A0': '\\ding{224}',
            '\u27A1': '\\ding{225}',
            '\u27A2': '\\ding{226}',
            '\u27A3': '\\ding{227}',
            '\u27A4': '\\ding{228}',
            '\u27A5': '\\ding{229}',
            '\u27A6': '\\ding{230}',
            '\u27A7': '\\ding{231}',
            '\u27A8': '\\ding{232}',
            '\u27A9': '\\ding{233}',
            '\u27AA': '\\ding{234}',
            '\u27AB': '\\ding{235}',
            '\u27AC': '\\ding{236}',
            '\u27AD': '\\ding{237}',
            '\u27AE': '\\ding{238}',
            '\u27AF': '\\ding{239}',
            '\u27B1': '\\ding{241}',
            '\u27B2': '\\ding{242}',
            '\u27B3': '\\ding{243}',
            '\u27B4': '\\ding{244}',
            '\u27B5': '\\ding{245}',
            '\u27B6': '\\ding{246}',
            '\u27B7': '\\ding{247}',
            '\u27B8': '\\ding{248}',
            '\u27B9': '\\ding{249}',
            '\u27BA': '\\ding{250}',
            '\u27BB': '\\ding{251}',
            '\u27BC': '\\ding{252}',
            '\u27BD': '\\ding{253}',
            '\u27BE': '\\ding{254}',
            '\u27E8': '{\\langle}',
            '\u27E9': '{\\rangle}',
            '\u27F5': '{\\longleftarrow}',
            '\u27F6': '{\\longrightarrow}',
            '\u27F7': '{\\longleftrightarrow}',
            '\u27F8': '{\\Longleftarrow}',
            '\u27F9': '{\\Longrightarrow}',
            '\u27FA': '{\\Longleftrightarrow}',
            '\u27FC': '{\\longmapsto}',
            '\u27FF': '\\sim\\joinrel\\leadsto',
            '\u2905': '\\ElsevierGlyph{E212}',
            '\u2912': '{\\UpArrowBar}',
            '\u2913': '{\\DownArrowBar}',
            '\u2923': '\\ElsevierGlyph{E20C}',
            '\u2924': '\\ElsevierGlyph{E20D}',
            '\u2925': '\\ElsevierGlyph{E20B}',
            '\u2926': '\\ElsevierGlyph{E20A}',
            '\u2927': '\\ElsevierGlyph{E211}',
            '\u2928': '\\ElsevierGlyph{E20E}',
            '\u2929': '\\ElsevierGlyph{E20F}',
            '\u292A': '\\ElsevierGlyph{E210}',
            '\u2933': '\\ElsevierGlyph{E21C}',
            '\u2933\u0338': '\\ElsevierGlyph{E21D}',
            '\u2936': '\\ElsevierGlyph{E21A}',
            '\u2937': '\\ElsevierGlyph{E219}',
            '\u2940': '{\\Elolarr}',
            '\u2941': '{\\Elorarr}',
            '\u2942': '{\\ElzRlarr}',
            '\u2944': '{\\ElzrLarr}',
            '\u2947': '{\\Elzrarrx}',
            '\u294E': '{\\LeftRightVector}',
            '\u294F': '{\\RightUpDownVector}',
            '\u2950': '{\\DownLeftRightVector}',
            '\u2951': '{\\LeftUpDownVector}',
            '\u2952': '{\\LeftVectorBar}',
            '\u2953': '{\\RightVectorBar}',
            '\u2954': '{\\RightUpVectorBar}',
            '\u2955': '{\\RightDownVectorBar}',
            '\u2956': '{\\DownLeftVectorBar}',
            '\u2957': '{\\DownRightVectorBar}',
            '\u2958': '{\\LeftUpVectorBar}',
            '\u2959': '{\\LeftDownVectorBar}',
            '\u295A': '{\\LeftTeeVector}',
            '\u295B': '{\\RightTeeVector}',
            '\u295C': '{\\RightUpTeeVector}',
            '\u295D': '{\\RightDownTeeVector}',
            '\u295E': '{\\DownLeftTeeVector}',
            '\u295F': '{\\DownRightTeeVector}',
            '\u2960': '{\\LeftUpTeeVector}',
            '\u2961': '{\\LeftDownTeeVector}',
            '\u296E': '{\\UpEquilibrium}',
            '\u296F': '{\\ReverseUpEquilibrium}',
            '\u2970': '{\\RoundImplies}',
            '\u297C': '\\ElsevierGlyph{E214}',
            '\u297D': '\\ElsevierGlyph{E215}',
            '\u2980': '{\\Elztfnc}',
            '\u2985': '\\ElsevierGlyph{3018}',
            '\u2986': '{\\Elroang}',
            '\u2993': '<\\kern-0.58em(',
            '\u2994': '\\ElsevierGlyph{E291}',
            '\u2999': '{\\Elzddfnc}',
            '\u299C': '{\\Angle}',
            '\u29A0': '{\\Elzlpargt}',
            '\u29B5': '\\ElsevierGlyph{E260}',
            '\u29B6': '\\ElsevierGlyph{E61B}',
            '\u29CA': '{\\ElzLap}',
            '\u29CB': '{\\Elzdefas}',
            '\u29CF': '{\\LeftTriangleBar}',
            '\u29CF\u0338': '{\\NotLeftTriangleBar}',
            '\u29D0': '{\\RightTriangleBar}',
            '\u29D0\u0338': '{\\NotRightTriangleBar}',
            '\u29DC': '\\ElsevierGlyph{E372}',
            '\u29EB': '{\\blacklozenge}',
            '\u29F4': '{\\RuleDelayed}',
            '\u2A04': '{\\Elxuplus}',
            '\u2A05': '{\\ElzThr}',
            '\u2A06': '{\\Elxsqcup}',
            '\u2A07': '{\\ElzInf}',
            '\u2A08': '{\\ElzSup}',
            '\u2A0D': '{\\ElzCint}',
            '\u2A0F': '{\\clockoint}',
            '\u2A10': '\\ElsevierGlyph{E395}',
            '\u2A16': '{\\sqrint}',
            '\u2A25': '\\ElsevierGlyph{E25A}',
            '\u2A2A': '\\ElsevierGlyph{E25B}',
            '\u2A2D': '\\ElsevierGlyph{E25C}',
            '\u2A2E': '\\ElsevierGlyph{E25D}',
            '\u2A2F': '{\\ElzTimes}',
            '\u2A34': '\\ElsevierGlyph{E25E}',
            '\u2A35': '\\ElsevierGlyph{E25E}',
            '\u2A3C': '\\ElsevierGlyph{E259}',
            '\u2A3F': '{\\amalg}',
            '\u2A53': '{\\ElzAnd}',
            '\u2A54': '{\\ElzOr}',
            '\u2A55': '\\ElsevierGlyph{E36E}',
            '\u2A56': '{\\ElOr}',
            '\u2A5E': '{\\perspcorrespond}',
            '\u2A5F': '{\\Elzminhat}',
            '\u2A63': '\\ElsevierGlyph{225A}',
            '\u2A6E': '\\stackrel{*}{=}',
            '\u2A75': '{\\Equal}',
            '\u2A7D': '{\\leqslant}',
            '\u2A7D\u0338': '{\\nleqslant}',
            '\u2A7E': '{\\geqslant}',
            '\u2A7E\u0338': '{\\ngeqslant}',
            '\u2A85': '{\\lessapprox}',
            '\u2A86': '{\\gtrapprox}',
            '\u2A87': '{\\lneq}',
            '\u2A88': '{\\gneq}',
            '\u2A89': '{\\lnapprox}',
            '\u2A8A': '{\\gnapprox}',
            '\u2A8B': '{\\lesseqqgtr}',
            '\u2A8C': '{\\gtreqqless}',
            '\u2A95': '{\\eqslantless}',
            '\u2A96': '{\\eqslantgtr}',
            '\u2A9D': '\\Pisymbol{ppi020}{117}',
            '\u2A9E': '\\Pisymbol{ppi020}{105}',
            '\u2AA1': '{\\NestedLessLess}',
            '\u2AA1\u0338': '{\\NotNestedLessLess}',
            '\u2AA2': '{\\NestedGreaterGreater}',
            '\u2AA2\u0338': '{\\NotNestedGreaterGreater}',
            '\u2AAF': '{\\preceq}',
            '\u2AAF\u0338': '{\\not\\preceq}',
            '\u2AB0': '{\\succeq}',
            '\u2AB0\u0338': '{\\not\\succeq}',
            '\u2AB5': '{\\precneqq}',
            '\u2AB6': '{\\succneqq}',
            '\u2AB7': '{\\precapprox}',
            '\u2AB8': '{\\succapprox}',
            '\u2AB9': '{\\precnapprox}',
            '\u2ABA': '{\\succnapprox}',
            '\u2AC5': '{\\subseteqq}',
            '\u2AC5\u0338': '{\\nsubseteqq}',
            '\u2AC6': '{\\supseteqq}',
            '\u2AC6\u0338': '\\nsupseteqq',
            '\u2ACB': '{\\subsetneqq}',
            '\u2ACC': '{\\supsetneqq}',
            '\u2AEB': '\\ElsevierGlyph{E30D}',
            '\u2AF6': '{\\Elztdcol}',
            '\u2AFD': '{{/}\\!\\!{/}}',
            '\u2AFD\u20E5': '{\\rlap{\\textbackslash}{{/}\\!\\!{/}}}',
            '\u300A': '\\ElsevierGlyph{300A}',
            '\u300B': '\\ElsevierGlyph{300B}',
            '\u3018': '\\ElsevierGlyph{3018}',
            '\u3019': '\\ElsevierGlyph{3019}',
            '\u301A': '{\\openbracketleft}',
            '\u301B': '{\\openbracketright}',
            '\uFB00': 'ff',
            '\uFB01': 'fi',
            '\uFB02': 'fl',
            '\uFB03': 'ffi',
            '\uFB04': 'ffl',
            '\uD835\uDC00': '\\mathbf{A}',
            '\uD835\uDC01': '\\mathbf{B}',
            '\uD835\uDC02': '\\mathbf{C}',
            '\uD835\uDC03': '\\mathbf{D}',
            '\uD835\uDC04': '\\mathbf{E}',
            '\uD835\uDC05': '\\mathbf{F}',
            '\uD835\uDC06': '\\mathbf{G}',
            '\uD835\uDC07': '\\mathbf{H}',
            '\uD835\uDC08': '\\mathbf{I}',
            '\uD835\uDC09': '\\mathbf{J}',
            '\uD835\uDC0A': '\\mathbf{K}',
            '\uD835\uDC0B': '\\mathbf{L}',
            '\uD835\uDC0C': '\\mathbf{M}',
            '\uD835\uDC0D': '\\mathbf{N}',
            '\uD835\uDC0E': '\\mathbf{O}',
            '\uD835\uDC0F': '\\mathbf{P}',
            '\uD835\uDC10': '\\mathbf{Q}',
            '\uD835\uDC11': '\\mathbf{R}',
            '\uD835\uDC12': '\\mathbf{S}',
            '\uD835\uDC13': '\\mathbf{T}',
            '\uD835\uDC14': '\\mathbf{U}',
            '\uD835\uDC15': '\\mathbf{V}',
            '\uD835\uDC16': '\\mathbf{W}',
            '\uD835\uDC17': '\\mathbf{X}',
            '\uD835\uDC18': '\\mathbf{Y}',
            '\uD835\uDC19': '\\mathbf{Z}',
            '\uD835\uDC1A': '\\mathbf{a}',
            '\uD835\uDC1B': '\\mathbf{b}',
            '\uD835\uDC1C': '\\mathbf{c}',
            '\uD835\uDC1D': '\\mathbf{d}',
            '\uD835\uDC1E': '\\mathbf{e}',
            '\uD835\uDC1F': '\\mathbf{f}',
            '\uD835\uDC20': '\\mathbf{g}',
            '\uD835\uDC21': '\\mathbf{h}',
            '\uD835\uDC22': '\\mathbf{i}',
            '\uD835\uDC23': '\\mathbf{j}',
            '\uD835\uDC24': '\\mathbf{k}',
            '\uD835\uDC25': '\\mathbf{l}',
            '\uD835\uDC26': '\\mathbf{m}',
            '\uD835\uDC27': '\\mathbf{n}',
            '\uD835\uDC28': '\\mathbf{o}',
            '\uD835\uDC29': '\\mathbf{p}',
            '\uD835\uDC2A': '\\mathbf{q}',
            '\uD835\uDC2B': '\\mathbf{r}',
            '\uD835\uDC2C': '\\mathbf{s}',
            '\uD835\uDC2D': '\\mathbf{t}',
            '\uD835\uDC2E': '\\mathbf{u}',
            '\uD835\uDC2F': '\\mathbf{v}',
            '\uD835\uDC30': '\\mathbf{w}',
            '\uD835\uDC31': '\\mathbf{x}',
            '\uD835\uDC32': '\\mathbf{y}',
            '\uD835\uDC33': '\\mathbf{z}',
            '\uD835\uDC34': '\\mathmit{A}',
            '\uD835\uDC35': '\\mathmit{B}',
            '\uD835\uDC36': '\\mathmit{C}',
            '\uD835\uDC37': '\\mathmit{D}',
            '\uD835\uDC38': '\\mathmit{E}',
            '\uD835\uDC39': '\\mathmit{F}',
            '\uD835\uDC3A': '\\mathmit{G}',
            '\uD835\uDC3B': '\\mathmit{H}',
            '\uD835\uDC3C': '\\mathmit{I}',
            '\uD835\uDC3D': '\\mathmit{J}',
            '\uD835\uDC3E': '\\mathmit{K}',
            '\uD835\uDC3F': '\\mathmit{L}',
            '\uD835\uDC40': '\\mathmit{M}',
            '\uD835\uDC41': '\\mathmit{N}',
            '\uD835\uDC42': '\\mathmit{O}',
            '\uD835\uDC43': '\\mathmit{P}',
            '\uD835\uDC44': '\\mathmit{Q}',
            '\uD835\uDC45': '\\mathmit{R}',
            '\uD835\uDC46': '\\mathmit{S}',
            '\uD835\uDC47': '\\mathmit{T}',
            '\uD835\uDC48': '\\mathmit{U}',
            '\uD835\uDC49': '\\mathmit{V}',
            '\uD835\uDC4A': '\\mathmit{W}',
            '\uD835\uDC4B': '\\mathmit{X}',
            '\uD835\uDC4C': '\\mathmit{Y}',
            '\uD835\uDC4D': '\\mathmit{Z}',
            '\uD835\uDC4E': '\\mathmit{a}',
            '\uD835\uDC4F': '\\mathmit{b}',
            '\uD835\uDC50': '\\mathmit{c}',
            '\uD835\uDC51': '\\mathmit{d}',
            '\uD835\uDC52': '\\mathmit{e}',
            '\uD835\uDC53': '\\mathmit{f}',
            '\uD835\uDC54': '\\mathmit{g}',
            '\uD835\uDC56': '\\mathmit{i}',
            '\uD835\uDC57': '\\mathmit{j}',
            '\uD835\uDC58': '\\mathmit{k}',
            '\uD835\uDC59': '\\mathmit{l}',
            '\uD835\uDC5A': '\\mathmit{m}',
            '\uD835\uDC5B': '\\mathmit{n}',
            '\uD835\uDC5C': '\\mathmit{o}',
            '\uD835\uDC5D': '\\mathmit{p}',
            '\uD835\uDC5E': '\\mathmit{q}',
            '\uD835\uDC5F': '\\mathmit{r}',
            '\uD835\uDC60': '\\mathmit{s}',
            '\uD835\uDC61': '\\mathmit{t}',
            '\uD835\uDC62': '\\mathmit{u}',
            '\uD835\uDC63': '\\mathmit{v}',
            '\uD835\uDC64': '\\mathmit{w}',
            '\uD835\uDC65': '\\mathmit{x}',
            '\uD835\uDC66': '\\mathmit{y}',
            '\uD835\uDC67': '\\mathmit{z}',
            '\uD835\uDC68': '\\mathbit{A}',
            '\uD835\uDC69': '\\mathbit{B}',
            '\uD835\uDC6A': '\\mathbit{C}',
            '\uD835\uDC6B': '\\mathbit{D}',
            '\uD835\uDC6C': '\\mathbit{E}',
            '\uD835\uDC6D': '\\mathbit{F}',
            '\uD835\uDC6E': '\\mathbit{G}',
            '\uD835\uDC6F': '\\mathbit{H}',
            '\uD835\uDC70': '\\mathbit{I}',
            '\uD835\uDC71': '\\mathbit{J}',
            '\uD835\uDC72': '\\mathbit{K}',
            '\uD835\uDC73': '\\mathbit{L}',
            '\uD835\uDC74': '\\mathbit{M}',
            '\uD835\uDC75': '\\mathbit{N}',
            '\uD835\uDC76': '\\mathbit{O}',
            '\uD835\uDC77': '\\mathbit{P}',
            '\uD835\uDC78': '\\mathbit{Q}',
            '\uD835\uDC79': '\\mathbit{R}',
            '\uD835\uDC7A': '\\mathbit{S}',
            '\uD835\uDC7B': '\\mathbit{T}',
            '\uD835\uDC7C': '\\mathbit{U}',
            '\uD835\uDC7D': '\\mathbit{V}',
            '\uD835\uDC7E': '\\mathbit{W}',
            '\uD835\uDC7F': '\\mathbit{X}',
            '\uD835\uDC80': '\\mathbit{Y}',
            '\uD835\uDC81': '\\mathbit{Z}',
            '\uD835\uDC82': '\\mathbit{a}',
            '\uD835\uDC83': '\\mathbit{b}',
            '\uD835\uDC84': '\\mathbit{c}',
            '\uD835\uDC85': '\\mathbit{d}',
            '\uD835\uDC86': '\\mathbit{e}',
            '\uD835\uDC87': '\\mathbit{f}',
            '\uD835\uDC88': '\\mathbit{g}',
            '\uD835\uDC89': '\\mathbit{h}',
            '\uD835\uDC8A': '\\mathbit{i}',
            '\uD835\uDC8B': '\\mathbit{j}',
            '\uD835\uDC8C': '\\mathbit{k}',
            '\uD835\uDC8D': '\\mathbit{l}',
            '\uD835\uDC8E': '\\mathbit{m}',
            '\uD835\uDC8F': '\\mathbit{n}',
            '\uD835\uDC90': '\\mathbit{o}',
            '\uD835\uDC91': '\\mathbit{p}',
            '\uD835\uDC92': '\\mathbit{q}',
            '\uD835\uDC93': '\\mathbit{r}',
            '\uD835\uDC94': '\\mathbit{s}',
            '\uD835\uDC95': '\\mathbit{t}',
            '\uD835\uDC96': '\\mathbit{u}',
            '\uD835\uDC97': '\\mathbit{v}',
            '\uD835\uDC98': '\\mathbit{w}',
            '\uD835\uDC99': '\\mathbit{x}',
            '\uD835\uDC9A': '\\mathbit{y}',
            '\uD835\uDC9B': '\\mathbit{z}',
            '\uD835\uDC9C': '\\mathscr{A}',
            '\uD835\uDC9E': '\\mathscr{C}',
            '\uD835\uDC9F': '\\mathscr{D}',
            '\uD835\uDCA2': '\\mathscr{G}',
            '\uD835\uDCA5': '\\mathscr{J}',
            '\uD835\uDCA6': '\\mathscr{K}',
            '\uD835\uDCA9': '\\mathscr{N}',
            '\uD835\uDCAA': '\\mathscr{O}',
            '\uD835\uDCAB': '\\mathscr{P}',
            '\uD835\uDCAC': '\\mathscr{Q}',
            '\uD835\uDCAE': '\\mathscr{S}',
            '\uD835\uDCAF': '\\mathscr{T}',
            '\uD835\uDCB0': '\\mathscr{U}',
            '\uD835\uDCB1': '\\mathscr{V}',
            '\uD835\uDCB2': '\\mathscr{W}',
            '\uD835\uDCB3': '\\mathscr{X}',
            '\uD835\uDCB4': '\\mathscr{Y}',
            '\uD835\uDCB5': '\\mathscr{Z}',
            '\uD835\uDCB6': '\\mathscr{a}',
            '\uD835\uDCB7': '\\mathscr{b}',
            '\uD835\uDCB8': '\\mathscr{c}',
            '\uD835\uDCB9': '\\mathscr{d}',
            '\uD835\uDCBB': '\\mathscr{f}',
            '\uD835\uDCBD': '\\mathscr{h}',
            '\uD835\uDCBE': '\\mathscr{i}',
            '\uD835\uDCBF': '\\mathscr{j}',
            '\uD835\uDCC0': '\\mathscr{k}',
            '\uD835\uDCC1': '\\mathscr{l}',
            '\uD835\uDCC2': '\\mathscr{m}',
            '\uD835\uDCC3': '\\mathscr{n}',
            '\uD835\uDCC5': '\\mathscr{p}',
            '\uD835\uDCC6': '\\mathscr{q}',
            '\uD835\uDCC7': '\\mathscr{r}',
            '\uD835\uDCC8': '\\mathscr{s}',
            '\uD835\uDCC9': '\\mathscr{t}',
            '\uD835\uDCCA': '\\mathscr{u}',
            '\uD835\uDCCB': '\\mathscr{v}',
            '\uD835\uDCCC': '\\mathscr{w}',
            '\uD835\uDCCD': '\\mathscr{x}',
            '\uD835\uDCCE': '\\mathscr{y}',
            '\uD835\uDCCF': '\\mathscr{z}',
            '\uD835\uDCD0': '\\mathbcal{A}',
            '\uD835\uDCD1': '\\mathbcal{B}',
            '\uD835\uDCD2': '\\mathbcal{C}',
            '\uD835\uDCD3': '\\mathbcal{D}',
            '\uD835\uDCD4': '\\mathbcal{E}',
            '\uD835\uDCD5': '\\mathbcal{F}',
            '\uD835\uDCD6': '\\mathbcal{G}',
            '\uD835\uDCD7': '\\mathbcal{H}',
            '\uD835\uDCD8': '\\mathbcal{I}',
            '\uD835\uDCD9': '\\mathbcal{J}',
            '\uD835\uDCDA': '\\mathbcal{K}',
            '\uD835\uDCDB': '\\mathbcal{L}',
            '\uD835\uDCDC': '\\mathbcal{M}',
            '\uD835\uDCDD': '\\mathbcal{N}',
            '\uD835\uDCDE': '\\mathbcal{O}',
            '\uD835\uDCDF': '\\mathbcal{P}',
            '\uD835\uDCE0': '\\mathbcal{Q}',
            '\uD835\uDCE1': '\\mathbcal{R}',
            '\uD835\uDCE2': '\\mathbcal{S}',
            '\uD835\uDCE3': '\\mathbcal{T}',
            '\uD835\uDCE4': '\\mathbcal{U}',
            '\uD835\uDCE5': '\\mathbcal{V}',
            '\uD835\uDCE6': '\\mathbcal{W}',
            '\uD835\uDCE7': '\\mathbcal{X}',
            '\uD835\uDCE8': '\\mathbcal{Y}',
            '\uD835\uDCE9': '\\mathbcal{Z}',
            '\uD835\uDCEA': '\\mathbcal{a}',
            '\uD835\uDCEB': '\\mathbcal{b}',
            '\uD835\uDCEC': '\\mathbcal{c}',
            '\uD835\uDCED': '\\mathbcal{d}',
            '\uD835\uDCEE': '\\mathbcal{e}',
            '\uD835\uDCEF': '\\mathbcal{f}',
            '\uD835\uDCF0': '\\mathbcal{g}',
            '\uD835\uDCF1': '\\mathbcal{h}',
            '\uD835\uDCF2': '\\mathbcal{i}',
            '\uD835\uDCF3': '\\mathbcal{j}',
            '\uD835\uDCF4': '\\mathbcal{k}',
            '\uD835\uDCF5': '\\mathbcal{l}',
            '\uD835\uDCF6': '\\mathbcal{m}',
            '\uD835\uDCF7': '\\mathbcal{n}',
            '\uD835\uDCF8': '\\mathbcal{o}',
            '\uD835\uDCF9': '\\mathbcal{p}',
            '\uD835\uDCFA': '\\mathbcal{q}',
            '\uD835\uDCFB': '\\mathbcal{r}',
            '\uD835\uDCFC': '\\mathbcal{s}',
            '\uD835\uDCFD': '\\mathbcal{t}',
            '\uD835\uDCFE': '\\mathbcal{u}',
            '\uD835\uDCFF': '\\mathbcal{v}',
            '\uD835\uDD00': '\\mathbcal{w}',
            '\uD835\uDD01': '\\mathbcal{x}',
            '\uD835\uDD02': '\\mathbcal{y}',
            '\uD835\uDD03': '\\mathbcal{z}',
            '\uD835\uDD04': '\\mathfrak{A}',
            '\uD835\uDD05': '\\mathfrak{B}',
            '\uD835\uDD07': '\\mathfrak{D}',
            '\uD835\uDD08': '\\mathfrak{E}',
            '\uD835\uDD09': '\\mathfrak{F}',
            '\uD835\uDD0A': '\\mathfrak{G}',
            '\uD835\uDD0D': '\\mathfrak{J}',
            '\uD835\uDD0E': '\\mathfrak{K}',
            '\uD835\uDD0F': '\\mathfrak{L}',
            '\uD835\uDD10': '\\mathfrak{M}',
            '\uD835\uDD11': '\\mathfrak{N}',
            '\uD835\uDD12': '\\mathfrak{O}',
            '\uD835\uDD13': '\\mathfrak{P}',
            '\uD835\uDD14': '\\mathfrak{Q}',
            '\uD835\uDD16': '\\mathfrak{S}',
            '\uD835\uDD17': '\\mathfrak{T}',
            '\uD835\uDD18': '\\mathfrak{U}',
            '\uD835\uDD19': '\\mathfrak{V}',
            '\uD835\uDD1A': '\\mathfrak{W}',
            '\uD835\uDD1B': '\\mathfrak{X}',
            '\uD835\uDD1C': '\\mathfrak{Y}',
            '\uD835\uDD1E': '\\mathfrak{a}',
            '\uD835\uDD1F': '\\mathfrak{b}',
            '\uD835\uDD20': '\\mathfrak{c}',
            '\uD835\uDD21': '\\mathfrak{d}',
            '\uD835\uDD22': '\\mathfrak{e}',
            '\uD835\uDD23': '\\mathfrak{f}',
            '\uD835\uDD24': '\\mathfrak{g}',
            '\uD835\uDD25': '\\mathfrak{h}',
            '\uD835\uDD26': '\\mathfrak{i}',
            '\uD835\uDD27': '\\mathfrak{j}',
            '\uD835\uDD28': '\\mathfrak{k}',
            '\uD835\uDD29': '\\mathfrak{l}',
            '\uD835\uDD2A': '\\mathfrak{m}',
            '\uD835\uDD2B': '\\mathfrak{n}',
            '\uD835\uDD2C': '\\mathfrak{o}',
            '\uD835\uDD2D': '\\mathfrak{p}',
            '\uD835\uDD2E': '\\mathfrak{q}',
            '\uD835\uDD2F': '\\mathfrak{r}',
            '\uD835\uDD30': '\\mathfrak{s}',
            '\uD835\uDD31': '\\mathfrak{t}',
            '\uD835\uDD32': '\\mathfrak{u}',
            '\uD835\uDD33': '\\mathfrak{v}',
            '\uD835\uDD34': '\\mathfrak{w}',
            '\uD835\uDD35': '\\mathfrak{x}',
            '\uD835\uDD36': '\\mathfrak{y}',
            '\uD835\uDD37': '\\mathfrak{z}',
            '\uD835\uDD38': '\\mathbb{A}',
            '\uD835\uDD39': '\\mathbb{B}',
            '\uD835\uDD3B': '\\mathbb{D}',
            '\uD835\uDD3C': '\\mathbb{E}',
            '\uD835\uDD3D': '\\mathbb{F}',
            '\uD835\uDD3E': '\\mathbb{G}',
            '\uD835\uDD40': '\\mathbb{I}',
            '\uD835\uDD41': '\\mathbb{J}',
            '\uD835\uDD42': '\\mathbb{K}',
            '\uD835\uDD43': '\\mathbb{L}',
            '\uD835\uDD44': '\\mathbb{M}',
            '\uD835\uDD46': '\\mathbb{O}',
            '\uD835\uDD4A': '\\mathbb{S}',
            '\uD835\uDD4B': '\\mathbb{T}',
            '\uD835\uDD4C': '\\mathbb{U}',
            '\uD835\uDD4D': '\\mathbb{V}',
            '\uD835\uDD4E': '\\mathbb{W}',
            '\uD835\uDD4F': '\\mathbb{X}',
            '\uD835\uDD50': '\\mathbb{Y}',
            '\uD835\uDD52': '\\mathbb{a}',
            '\uD835\uDD53': '\\mathbb{b}',
            '\uD835\uDD54': '\\mathbb{c}',
            '\uD835\uDD55': '\\mathbb{d}',
            '\uD835\uDD56': '\\mathbb{e}',
            '\uD835\uDD57': '\\mathbb{f}',
            '\uD835\uDD58': '\\mathbb{g}',
            '\uD835\uDD59': '\\mathbb{h}',
            '\uD835\uDD5A': '\\mathbb{i}',
            '\uD835\uDD5B': '\\mathbb{j}',
            '\uD835\uDD5C': '\\mathbb{k}',
            '\uD835\uDD5D': '\\mathbb{l}',
            '\uD835\uDD5E': '\\mathbb{m}',
            '\uD835\uDD5F': '\\mathbb{n}',
            '\uD835\uDD60': '\\mathbb{o}',
            '\uD835\uDD61': '\\mathbb{p}',
            '\uD835\uDD62': '\\mathbb{q}',
            '\uD835\uDD63': '\\mathbb{r}',
            '\uD835\uDD64': '\\mathbb{s}',
            '\uD835\uDD65': '\\mathbb{t}',
            '\uD835\uDD66': '\\mathbb{u}',
            '\uD835\uDD67': '\\mathbb{v}',
            '\uD835\uDD68': '\\mathbb{w}',
            '\uD835\uDD69': '\\mathbb{x}',
            '\uD835\uDD6A': '\\mathbb{y}',
            '\uD835\uDD6B': '\\mathbb{z}',
            '\uD835\uDD6C': '\\mathbfrak{A}',
            '\uD835\uDD6D': '\\mathbfrak{B}',
            '\uD835\uDD6E': '\\mathbfrak{C}',
            '\uD835\uDD6F': '\\mathbfrak{D}',
            '\uD835\uDD70': '\\mathbfrak{E}',
            '\uD835\uDD71': '\\mathbfrak{F}',
            '\uD835\uDD72': '\\mathbfrak{G}',
            '\uD835\uDD73': '\\mathbfrak{H}',
            '\uD835\uDD74': '\\mathbfrak{I}',
            '\uD835\uDD75': '\\mathbfrak{J}',
            '\uD835\uDD76': '\\mathbfrak{K}',
            '\uD835\uDD77': '\\mathbfrak{L}',
            '\uD835\uDD78': '\\mathbfrak{M}',
            '\uD835\uDD79': '\\mathbfrak{N}',
            '\uD835\uDD7A': '\\mathbfrak{O}',
            '\uD835\uDD7B': '\\mathbfrak{P}',
            '\uD835\uDD7C': '\\mathbfrak{Q}',
            '\uD835\uDD7D': '\\mathbfrak{R}',
            '\uD835\uDD7E': '\\mathbfrak{S}',
            '\uD835\uDD7F': '\\mathbfrak{T}',
            '\uD835\uDD80': '\\mathbfrak{U}',
            '\uD835\uDD81': '\\mathbfrak{V}',
            '\uD835\uDD82': '\\mathbfrak{W}',
            '\uD835\uDD83': '\\mathbfrak{X}',
            '\uD835\uDD84': '\\mathbfrak{Y}',
            '\uD835\uDD85': '\\mathbfrak{Z}',
            '\uD835\uDD86': '\\mathbfrak{a}',
            '\uD835\uDD87': '\\mathbfrak{b}',
            '\uD835\uDD88': '\\mathbfrak{c}',
            '\uD835\uDD89': '\\mathbfrak{d}',
            '\uD835\uDD8A': '\\mathbfrak{e}',
            '\uD835\uDD8B': '\\mathbfrak{f}',
            '\uD835\uDD8C': '\\mathbfrak{g}',
            '\uD835\uDD8D': '\\mathbfrak{h}',
            '\uD835\uDD8E': '\\mathbfrak{i}',
            '\uD835\uDD8F': '\\mathbfrak{j}',
            '\uD835\uDD90': '\\mathbfrak{k}',
            '\uD835\uDD91': '\\mathbfrak{l}',
            '\uD835\uDD92': '\\mathbfrak{m}',
            '\uD835\uDD93': '\\mathbfrak{n}',
            '\uD835\uDD94': '\\mathbfrak{o}',
            '\uD835\uDD95': '\\mathbfrak{p}',
            '\uD835\uDD96': '\\mathbfrak{q}',
            '\uD835\uDD97': '\\mathbfrak{r}',
            '\uD835\uDD98': '\\mathbfrak{s}',
            '\uD835\uDD99': '\\mathbfrak{t}',
            '\uD835\uDD9A': '\\mathbfrak{u}',
            '\uD835\uDD9B': '\\mathbfrak{v}',
            '\uD835\uDD9C': '\\mathbfrak{w}',
            '\uD835\uDD9D': '\\mathbfrak{x}',
            '\uD835\uDD9E': '\\mathbfrak{y}',
            '\uD835\uDD9F': '\\mathbfrak{z}',
            '\uD835\uDDA0': '\\mathsf{A}',
            '\uD835\uDDA1': '\\mathsf{B}',
            '\uD835\uDDA2': '\\mathsf{C}',
            '\uD835\uDDA3': '\\mathsf{D}',
            '\uD835\uDDA4': '\\mathsf{E}',
            '\uD835\uDDA5': '\\mathsf{F}',
            '\uD835\uDDA6': '\\mathsf{G}',
            '\uD835\uDDA7': '\\mathsf{H}',
            '\uD835\uDDA8': '\\mathsf{I}',
            '\uD835\uDDA9': '\\mathsf{J}',
            '\uD835\uDDAA': '\\mathsf{K}',
            '\uD835\uDDAB': '\\mathsf{L}',
            '\uD835\uDDAC': '\\mathsf{M}',
            '\uD835\uDDAD': '\\mathsf{N}',
            '\uD835\uDDAE': '\\mathsf{O}',
            '\uD835\uDDAF': '\\mathsf{P}',
            '\uD835\uDDB0': '\\mathsf{Q}',
            '\uD835\uDDB1': '\\mathsf{R}',
            '\uD835\uDDB2': '\\mathsf{S}',
            '\uD835\uDDB3': '\\mathsf{T}',
            '\uD835\uDDB4': '\\mathsf{U}',
            '\uD835\uDDB5': '\\mathsf{V}',
            '\uD835\uDDB6': '\\mathsf{W}',
            '\uD835\uDDB7': '\\mathsf{X}',
            '\uD835\uDDB8': '\\mathsf{Y}',
            '\uD835\uDDB9': '\\mathsf{Z}',
            '\uD835\uDDBA': '\\mathsf{a}',
            '\uD835\uDDBB': '\\mathsf{b}',
            '\uD835\uDDBC': '\\mathsf{c}',
            '\uD835\uDDBD': '\\mathsf{d}',
            '\uD835\uDDBE': '\\mathsf{e}',
            '\uD835\uDDBF': '\\mathsf{f}',
            '\uD835\uDDC0': '\\mathsf{g}',
            '\uD835\uDDC1': '\\mathsf{h}',
            '\uD835\uDDC2': '\\mathsf{i}',
            '\uD835\uDDC3': '\\mathsf{j}',
            '\uD835\uDDC4': '\\mathsf{k}',
            '\uD835\uDDC5': '\\mathsf{l}',
            '\uD835\uDDC6': '\\mathsf{m}',
            '\uD835\uDDC7': '\\mathsf{n}',
            '\uD835\uDDC8': '\\mathsf{o}',
            '\uD835\uDDC9': '\\mathsf{p}',
            '\uD835\uDDCA': '\\mathsf{q}',
            '\uD835\uDDCB': '\\mathsf{r}',
            '\uD835\uDDCC': '\\mathsf{s}',
            '\uD835\uDDCD': '\\mathsf{t}',
            '\uD835\uDDCE': '\\mathsf{u}',
            '\uD835\uDDCF': '\\mathsf{v}',
            '\uD835\uDDD0': '\\mathsf{w}',
            '\uD835\uDDD1': '\\mathsf{x}',
            '\uD835\uDDD2': '\\mathsf{y}',
            '\uD835\uDDD3': '\\mathsf{z}',
            '\uD835\uDDD4': '\\mathsfbf{A}',
            '\uD835\uDDD5': '\\mathsfbf{B}',
            '\uD835\uDDD6': '\\mathsfbf{C}',
            '\uD835\uDDD7': '\\mathsfbf{D}',
            '\uD835\uDDD8': '\\mathsfbf{E}',
            '\uD835\uDDD9': '\\mathsfbf{F}',
            '\uD835\uDDDA': '\\mathsfbf{G}',
            '\uD835\uDDDB': '\\mathsfbf{H}',
            '\uD835\uDDDC': '\\mathsfbf{I}',
            '\uD835\uDDDD': '\\mathsfbf{J}',
            '\uD835\uDDDE': '\\mathsfbf{K}',
            '\uD835\uDDDF': '\\mathsfbf{L}',
            '\uD835\uDDE0': '\\mathsfbf{M}',
            '\uD835\uDDE1': '\\mathsfbf{N}',
            '\uD835\uDDE2': '\\mathsfbf{O}',
            '\uD835\uDDE3': '\\mathsfbf{P}',
            '\uD835\uDDE4': '\\mathsfbf{Q}',
            '\uD835\uDDE5': '\\mathsfbf{R}',
            '\uD835\uDDE6': '\\mathsfbf{S}',
            '\uD835\uDDE7': '\\mathsfbf{T}',
            '\uD835\uDDE8': '\\mathsfbf{U}',
            '\uD835\uDDE9': '\\mathsfbf{V}',
            '\uD835\uDDEA': '\\mathsfbf{W}',
            '\uD835\uDDEB': '\\mathsfbf{X}',
            '\uD835\uDDEC': '\\mathsfbf{Y}',
            '\uD835\uDDED': '\\mathsfbf{Z}',
            '\uD835\uDDEE': '\\mathsfbf{a}',
            '\uD835\uDDEF': '\\mathsfbf{b}',
            '\uD835\uDDF0': '\\mathsfbf{c}',
            '\uD835\uDDF1': '\\mathsfbf{d}',
            '\uD835\uDDF2': '\\mathsfbf{e}',
            '\uD835\uDDF3': '\\mathsfbf{f}',
            '\uD835\uDDF4': '\\mathsfbf{g}',
            '\uD835\uDDF5': '\\mathsfbf{h}',
            '\uD835\uDDF6': '\\mathsfbf{i}',
            '\uD835\uDDF7': '\\mathsfbf{j}',
            '\uD835\uDDF8': '\\mathsfbf{k}',
            '\uD835\uDDF9': '\\mathsfbf{l}',
            '\uD835\uDDFA': '\\mathsfbf{m}',
            '\uD835\uDDFB': '\\mathsfbf{n}',
            '\uD835\uDDFC': '\\mathsfbf{o}',
            '\uD835\uDDFD': '\\mathsfbf{p}',
            '\uD835\uDDFE': '\\mathsfbf{q}',
            '\uD835\uDDFF': '\\mathsfbf{r}',
            '\uD835\uDE00': '\\mathsfbf{s}',
            '\uD835\uDE01': '\\mathsfbf{t}',
            '\uD835\uDE02': '\\mathsfbf{u}',
            '\uD835\uDE03': '\\mathsfbf{v}',
            '\uD835\uDE04': '\\mathsfbf{w}',
            '\uD835\uDE05': '\\mathsfbf{x}',
            '\uD835\uDE06': '\\mathsfbf{y}',
            '\uD835\uDE07': '\\mathsfbf{z}',
            '\uD835\uDE08': '\\mathsfsl{A}',
            '\uD835\uDE09': '\\mathsfsl{B}',
            '\uD835\uDE0A': '\\mathsfsl{C}',
            '\uD835\uDE0B': '\\mathsfsl{D}',
            '\uD835\uDE0C': '\\mathsfsl{E}',
            '\uD835\uDE0D': '\\mathsfsl{F}',
            '\uD835\uDE0E': '\\mathsfsl{G}',
            '\uD835\uDE0F': '\\mathsfsl{H}',
            '\uD835\uDE10': '\\mathsfsl{I}',
            '\uD835\uDE11': '\\mathsfsl{J}',
            '\uD835\uDE12': '\\mathsfsl{K}',
            '\uD835\uDE13': '\\mathsfsl{L}',
            '\uD835\uDE14': '\\mathsfsl{M}',
            '\uD835\uDE15': '\\mathsfsl{N}',
            '\uD835\uDE16': '\\mathsfsl{O}',
            '\uD835\uDE17': '\\mathsfsl{P}',
            '\uD835\uDE18': '\\mathsfsl{Q}',
            '\uD835\uDE19': '\\mathsfsl{R}',
            '\uD835\uDE1A': '\\mathsfsl{S}',
            '\uD835\uDE1B': '\\mathsfsl{T}',
            '\uD835\uDE1C': '\\mathsfsl{U}',
            '\uD835\uDE1D': '\\mathsfsl{V}',
            '\uD835\uDE1E': '\\mathsfsl{W}',
            '\uD835\uDE1F': '\\mathsfsl{X}',
            '\uD835\uDE20': '\\mathsfsl{Y}',
            '\uD835\uDE21': '\\mathsfsl{Z}',
            '\uD835\uDE22': '\\mathsfsl{a}',
            '\uD835\uDE23': '\\mathsfsl{b}',
            '\uD835\uDE24': '\\mathsfsl{c}',
            '\uD835\uDE25': '\\mathsfsl{d}',
            '\uD835\uDE26': '\\mathsfsl{e}',
            '\uD835\uDE27': '\\mathsfsl{f}',
            '\uD835\uDE28': '\\mathsfsl{g}',
            '\uD835\uDE29': '\\mathsfsl{h}',
            '\uD835\uDE2A': '\\mathsfsl{i}',
            '\uD835\uDE2B': '\\mathsfsl{j}',
            '\uD835\uDE2C': '\\mathsfsl{k}',
            '\uD835\uDE2D': '\\mathsfsl{l}',
            '\uD835\uDE2E': '\\mathsfsl{m}',
            '\uD835\uDE2F': '\\mathsfsl{n}',
            '\uD835\uDE30': '\\mathsfsl{o}',
            '\uD835\uDE31': '\\mathsfsl{p}',
            '\uD835\uDE32': '\\mathsfsl{q}',
            '\uD835\uDE33': '\\mathsfsl{r}',
            '\uD835\uDE34': '\\mathsfsl{s}',
            '\uD835\uDE35': '\\mathsfsl{t}',
            '\uD835\uDE36': '\\mathsfsl{u}',
            '\uD835\uDE37': '\\mathsfsl{v}',
            '\uD835\uDE38': '\\mathsfsl{w}',
            '\uD835\uDE39': '\\mathsfsl{x}',
            '\uD835\uDE3A': '\\mathsfsl{y}',
            '\uD835\uDE3B': '\\mathsfsl{z}',
            '\uD835\uDE3C': '\\mathsfbfsl{A}',
            '\uD835\uDE3D': '\\mathsfbfsl{B}',
            '\uD835\uDE3E': '\\mathsfbfsl{C}',
            '\uD835\uDE3F': '\\mathsfbfsl{D}',
            '\uD835\uDE40': '\\mathsfbfsl{E}',
            '\uD835\uDE41': '\\mathsfbfsl{F}',
            '\uD835\uDE42': '\\mathsfbfsl{G}',
            '\uD835\uDE43': '\\mathsfbfsl{H}',
            '\uD835\uDE44': '\\mathsfbfsl{I}',
            '\uD835\uDE45': '\\mathsfbfsl{J}',
            '\uD835\uDE46': '\\mathsfbfsl{K}',
            '\uD835\uDE47': '\\mathsfbfsl{L}',
            '\uD835\uDE48': '\\mathsfbfsl{M}',
            '\uD835\uDE49': '\\mathsfbfsl{N}',
            '\uD835\uDE4A': '\\mathsfbfsl{O}',
            '\uD835\uDE4B': '\\mathsfbfsl{P}',
            '\uD835\uDE4C': '\\mathsfbfsl{Q}',
            '\uD835\uDE4D': '\\mathsfbfsl{R}',
            '\uD835\uDE4E': '\\mathsfbfsl{S}',
            '\uD835\uDE4F': '\\mathsfbfsl{T}',
            '\uD835\uDE50': '\\mathsfbfsl{U}',
            '\uD835\uDE51': '\\mathsfbfsl{V}',
            '\uD835\uDE52': '\\mathsfbfsl{W}',
            '\uD835\uDE53': '\\mathsfbfsl{X}',
            '\uD835\uDE54': '\\mathsfbfsl{Y}',
            '\uD835\uDE55': '\\mathsfbfsl{Z}',
            '\uD835\uDE56': '\\mathsfbfsl{a}',
            '\uD835\uDE57': '\\mathsfbfsl{b}',
            '\uD835\uDE58': '\\mathsfbfsl{c}',
            '\uD835\uDE59': '\\mathsfbfsl{d}',
            '\uD835\uDE5A': '\\mathsfbfsl{e}',
            '\uD835\uDE5B': '\\mathsfbfsl{f}',
            '\uD835\uDE5C': '\\mathsfbfsl{g}',
            '\uD835\uDE5D': '\\mathsfbfsl{h}',
            '\uD835\uDE5E': '\\mathsfbfsl{i}',
            '\uD835\uDE5F': '\\mathsfbfsl{j}',
            '\uD835\uDE60': '\\mathsfbfsl{k}',
            '\uD835\uDE61': '\\mathsfbfsl{l}',
            '\uD835\uDE62': '\\mathsfbfsl{m}',
            '\uD835\uDE63': '\\mathsfbfsl{n}',
            '\uD835\uDE64': '\\mathsfbfsl{o}',
            '\uD835\uDE65': '\\mathsfbfsl{p}',
            '\uD835\uDE66': '\\mathsfbfsl{q}',
            '\uD835\uDE67': '\\mathsfbfsl{r}',
            '\uD835\uDE68': '\\mathsfbfsl{s}',
            '\uD835\uDE69': '\\mathsfbfsl{t}',
            '\uD835\uDE6A': '\\mathsfbfsl{u}',
            '\uD835\uDE6B': '\\mathsfbfsl{v}',
            '\uD835\uDE6C': '\\mathsfbfsl{w}',
            '\uD835\uDE6D': '\\mathsfbfsl{x}',
            '\uD835\uDE6E': '\\mathsfbfsl{y}',
            '\uD835\uDE6F': '\\mathsfbfsl{z}',
            '\uD835\uDE70': '\\mathtt{A}',
            '\uD835\uDE71': '\\mathtt{B}',
            '\uD835\uDE72': '\\mathtt{C}',
            '\uD835\uDE73': '\\mathtt{D}',
            '\uD835\uDE74': '\\mathtt{E}',
            '\uD835\uDE75': '\\mathtt{F}',
            '\uD835\uDE76': '\\mathtt{G}',
            '\uD835\uDE77': '\\mathtt{H}',
            '\uD835\uDE78': '\\mathtt{I}',
            '\uD835\uDE79': '\\mathtt{J}',
            '\uD835\uDE7A': '\\mathtt{K}',
            '\uD835\uDE7B': '\\mathtt{L}',
            '\uD835\uDE7C': '\\mathtt{M}',
            '\uD835\uDE7D': '\\mathtt{N}',
            '\uD835\uDE7E': '\\mathtt{O}',
            '\uD835\uDE7F': '\\mathtt{P}',
            '\uD835\uDE80': '\\mathtt{Q}',
            '\uD835\uDE81': '\\mathtt{R}',
            '\uD835\uDE82': '\\mathtt{S}',
            '\uD835\uDE83': '\\mathtt{T}',
            '\uD835\uDE84': '\\mathtt{U}',
            '\uD835\uDE85': '\\mathtt{V}',
            '\uD835\uDE86': '\\mathtt{W}',
            '\uD835\uDE87': '\\mathtt{X}',
            '\uD835\uDE88': '\\mathtt{Y}',
            '\uD835\uDE89': '\\mathtt{Z}',
            '\uD835\uDE8A': '\\mathtt{a}',
            '\uD835\uDE8B': '\\mathtt{b}',
            '\uD835\uDE8C': '\\mathtt{c}',
            '\uD835\uDE8D': '\\mathtt{d}',
            '\uD835\uDE8E': '\\mathtt{e}',
            '\uD835\uDE8F': '\\mathtt{f}',
            '\uD835\uDE90': '\\mathtt{g}',
            '\uD835\uDE91': '\\mathtt{h}',
            '\uD835\uDE92': '\\mathtt{i}',
            '\uD835\uDE93': '\\mathtt{j}',
            '\uD835\uDE94': '\\mathtt{k}',
            '\uD835\uDE95': '\\mathtt{l}',
            '\uD835\uDE96': '\\mathtt{m}',
            '\uD835\uDE97': '\\mathtt{n}',
            '\uD835\uDE98': '\\mathtt{o}',
            '\uD835\uDE99': '\\mathtt{p}',
            '\uD835\uDE9A': '\\mathtt{q}',
            '\uD835\uDE9B': '\\mathtt{r}',
            '\uD835\uDE9C': '\\mathtt{s}',
            '\uD835\uDE9D': '\\mathtt{t}',
            '\uD835\uDE9E': '\\mathtt{u}',
            '\uD835\uDE9F': '\\mathtt{v}',
            '\uD835\uDEA0': '\\mathtt{w}',
            '\uD835\uDEA1': '\\mathtt{x}',
            '\uD835\uDEA2': '\\mathtt{y}',
            '\uD835\uDEA3': '\\mathtt{z}',
            '\uD835\uDEA8': '\\mathbf{\\Alpha}',
            '\uD835\uDEA9': '\\mathbf{\\Beta}',
            '\uD835\uDEAA': '\\mathbf{\\Gamma}',
            '\uD835\uDEAB': '\\mathbf{\\Delta}',
            '\uD835\uDEAC': '\\mathbf{\\Epsilon}',
            '\uD835\uDEAD': '\\mathbf{\\Zeta}',
            '\uD835\uDEAE': '\\mathbf{\\Eta}',
            '\uD835\uDEAF': '\\mathbf{\\Theta}',
            '\uD835\uDEB0': '\\mathbf{\\Iota}',
            '\uD835\uDEB1': '\\mathbf{\\Kappa}',
            '\uD835\uDEB2': '\\mathbf{\\Lambda}',
            '\uD835\uDEB3': 'M',
            '\uD835\uDEB4': 'N',
            '\uD835\uDEB5': '\\mathbf{\\Xi}',
            '\uD835\uDEB6': 'O',
            '\uD835\uDEB7': '\\mathbf{\\Pi}',
            '\uD835\uDEB8': '\\mathbf{\\Rho}',
            '\uD835\uDEB9': '\\mathbf{\\vartheta}',
            '\uD835\uDEBA': '\\mathbf{\\Sigma}',
            '\uD835\uDEBB': '\\mathbf{\\Tau}',
            '\uD835\uDEBC': '\\mathbf{\\Upsilon}',
            '\uD835\uDEBD': '\\mathbf{\\Phi}',
            '\uD835\uDEBE': '\\mathbf{\\Chi}',
            '\uD835\uDEBF': '\\mathbf{\\Psi}',
            '\uD835\uDEC0': '\\mathbf{\\Omega}',
            '\uD835\uDEC1': '\\mathbf{\\nabla}',
            '\uD835\uDEC2': '\\mathbf{\\Alpha}',
            '\uD835\uDEC3': '\\mathbf{\\Beta}',
            '\uD835\uDEC4': '\\mathbf{\\Gamma}',
            '\uD835\uDEC5': '\\mathbf{\\Delta}',
            '\uD835\uDEC6': '\\mathbf{\\Epsilon}',
            '\uD835\uDEC7': '\\mathbf{\\Zeta}',
            '\uD835\uDEC8': '\\mathbf{\\Eta}',
            '\uD835\uDEC9': '\\mathbf{\\theta}',
            '\uD835\uDECA': '\\mathbf{\\Iota}',
            '\uD835\uDECB': '\\mathbf{\\Kappa}',
            '\uD835\uDECC': '\\mathbf{\\Lambda}',
            '\uD835\uDECD': 'M',
            '\uD835\uDECE': 'N',
            '\uD835\uDECF': '\\mathbf{\\Xi}',
            '\uD835\uDED0': 'O',
            '\uD835\uDED1': '\\mathbf{\\Pi}',
            '\uD835\uDED2': '\\mathbf{\\Rho}',
            '\uD835\uDED3': '\\mathbf{\\varsigma}',
            '\uD835\uDED4': '\\mathbf{\\Sigma}',
            '\uD835\uDED5': '\\mathbf{\\Tau}',
            '\uD835\uDED6': '\\mathbf{\\Upsilon}',
            '\uD835\uDED7': '\\mathbf{\\Phi}',
            '\uD835\uDED8': '\\mathbf{\\Chi}',
            '\uD835\uDED9': '\\mathbf{\\Psi}',
            '\uD835\uDEDA': '\\mathbf{\\Omega}',
            '\uD835\uDEDB': '{\\partial}',
            '\uD835\uDEDC': '\\in',
            '\uD835\uDEDD': '\\mathbf{\\vartheta}',
            '\uD835\uDEDE': '\\mathbf{\\varkappa}',
            '\uD835\uDEDF': '\\mathbf{\\phi}',
            '\uD835\uDEE0': '\\mathbf{\\varrho}',
            '\uD835\uDEE1': '\\mathbf{\\varpi}',
            '\uD835\uDEE2': '\\mathmit{\\Alpha}',
            '\uD835\uDEE3': '\\mathmit{\\Beta}',
            '\uD835\uDEE4': '\\mathmit{\\Gamma}',
            '\uD835\uDEE5': '\\mathmit{\\Delta}',
            '\uD835\uDEE6': '\\mathmit{\\Epsilon}',
            '\uD835\uDEE7': '\\mathmit{\\Zeta}',
            '\uD835\uDEE8': '\\mathmit{\\Eta}',
            '\uD835\uDEE9': '\\mathmit{\\Theta}',
            '\uD835\uDEEA': '\\mathmit{\\Iota}',
            '\uD835\uDEEB': '\\mathmit{\\Kappa}',
            '\uD835\uDEEC': '\\mathmit{\\Lambda}',
            '\uD835\uDEED': 'M',
            '\uD835\uDEEE': 'N',
            '\uD835\uDEEF': '\\mathmit{\\Xi}',
            '\uD835\uDEF0': 'O',
            '\uD835\uDEF1': '\\mathmit{\\Pi}',
            '\uD835\uDEF2': '\\mathmit{\\Rho}',
            '\uD835\uDEF3': '\\mathmit{\\vartheta}',
            '\uD835\uDEF4': '\\mathmit{\\Sigma}',
            '\uD835\uDEF5': '\\mathmit{\\Tau}',
            '\uD835\uDEF6': '\\mathmit{\\Upsilon}',
            '\uD835\uDEF7': '\\mathmit{\\Phi}',
            '\uD835\uDEF8': '\\mathmit{\\Chi}',
            '\uD835\uDEF9': '\\mathmit{\\Psi}',
            '\uD835\uDEFA': '\\mathmit{\\Omega}',
            '\uD835\uDEFB': '\\mathmit{\\nabla}',
            '\uD835\uDEFC': '\\mathmit{\\Alpha}',
            '\uD835\uDEFD': '\\mathmit{\\Beta}',
            '\uD835\uDEFE': '\\mathmit{\\Gamma}',
            '\uD835\uDEFF': '\\mathmit{\\Delta}',
            '\uD835\uDF00': '\\mathmit{\\Epsilon}',
            '\uD835\uDF01': '\\mathmit{\\Zeta}',
            '\uD835\uDF02': '\\mathmit{\\Eta}',
            '\uD835\uDF03': '\\mathmit{\\Theta}',
            '\uD835\uDF04': '\\mathmit{\\Iota}',
            '\uD835\uDF05': '\\mathmit{\\Kappa}',
            '\uD835\uDF06': '\\mathmit{\\Lambda}',
            '\uD835\uDF07': 'M',
            '\uD835\uDF08': 'N',
            '\uD835\uDF09': '\\mathmit{\\Xi}',
            '\uD835\uDF0A': 'O',
            '\uD835\uDF0B': '\\mathmit{\\Pi}',
            '\uD835\uDF0C': '\\mathmit{\\Rho}',
            '\uD835\uDF0D': '\\mathmit{\\varsigma}',
            '\uD835\uDF0E': '\\mathmit{\\Sigma}',
            '\uD835\uDF0F': '\\mathmit{\\Tau}',
            '\uD835\uDF10': '\\mathmit{\\Upsilon}',
            '\uD835\uDF11': '\\mathmit{\\Phi}',
            '\uD835\uDF12': '\\mathmit{\\Chi}',
            '\uD835\uDF13': '\\mathmit{\\Psi}',
            '\uD835\uDF14': '\\mathmit{\\Omega}',
            '\uD835\uDF15': '{\\partial}',
            '\uD835\uDF16': '\\in',
            '\uD835\uDF17': '\\mathmit{\\vartheta}',
            '\uD835\uDF18': '\\mathmit{\\varkappa}',
            '\uD835\uDF19': '\\mathmit{\\phi}',
            '\uD835\uDF1A': '\\mathmit{\\varrho}',
            '\uD835\uDF1B': '\\mathmit{\\varpi}',
            '\uD835\uDF1C': '\\mathbit{\\Alpha}',
            '\uD835\uDF1D': '\\mathbit{\\Beta}',
            '\uD835\uDF1E': '\\mathbit{\\Gamma}',
            '\uD835\uDF1F': '\\mathbit{\\Delta}',
            '\uD835\uDF20': '\\mathbit{\\Epsilon}',
            '\uD835\uDF21': '\\mathbit{\\Zeta}',
            '\uD835\uDF22': '\\mathbit{\\Eta}',
            '\uD835\uDF23': '\\mathbit{\\Theta}',
            '\uD835\uDF24': '\\mathbit{\\Iota}',
            '\uD835\uDF25': '\\mathbit{\\Kappa}',
            '\uD835\uDF26': '\\mathbit{\\Lambda}',
            '\uD835\uDF27': 'M',
            '\uD835\uDF28': 'N',
            '\uD835\uDF29': '\\mathbit{\\Xi}',
            '\uD835\uDF2A': 'O',
            '\uD835\uDF2B': '\\mathbit{\\Pi}',
            '\uD835\uDF2C': '\\mathbit{\\Rho}',
            '\uD835\uDF2D': '\\mathbit{O}',
            '\uD835\uDF2E': '\\mathbit{\\Sigma}',
            '\uD835\uDF2F': '\\mathbit{\\Tau}',
            '\uD835\uDF30': '\\mathbit{\\Upsilon}',
            '\uD835\uDF31': '\\mathbit{\\Phi}',
            '\uD835\uDF32': '\\mathbit{\\Chi}',
            '\uD835\uDF33': '\\mathbit{\\Psi}',
            '\uD835\uDF34': '\\mathbit{\\Omega}',
            '\uD835\uDF35': '\\mathbit{\\nabla}',
            '\uD835\uDF36': '\\mathbit{\\Alpha}',
            '\uD835\uDF37': '\\mathbit{\\Beta}',
            '\uD835\uDF38': '\\mathbit{\\Gamma}',
            '\uD835\uDF39': '\\mathbit{\\Delta}',
            '\uD835\uDF3A': '\\mathbit{\\Epsilon}',
            '\uD835\uDF3B': '\\mathbit{\\Zeta}',
            '\uD835\uDF3C': '\\mathbit{\\Eta}',
            '\uD835\uDF3D': '\\mathbit{\\Theta}',
            '\uD835\uDF3E': '\\mathbit{\\Iota}',
            '\uD835\uDF3F': '\\mathbit{\\Kappa}',
            '\uD835\uDF40': '\\mathbit{\\Lambda}',
            '\uD835\uDF41': 'M',
            '\uD835\uDF42': 'N',
            '\uD835\uDF43': '\\mathbit{\\Xi}',
            '\uD835\uDF44': 'O',
            '\uD835\uDF45': '\\mathbit{\\Pi}',
            '\uD835\uDF46': '\\mathbit{\\Rho}',
            '\uD835\uDF47': '\\mathbit{\\varsigma}',
            '\uD835\uDF48': '\\mathbit{\\Sigma}',
            '\uD835\uDF49': '\\mathbit{\\Tau}',
            '\uD835\uDF4A': '\\mathbit{\\Upsilon}',
            '\uD835\uDF4B': '\\mathbit{\\Phi}',
            '\uD835\uDF4C': '\\mathbit{\\Chi}',
            '\uD835\uDF4D': '\\mathbit{\\Psi}',
            '\uD835\uDF4E': '\\mathbit{\\Omega}',
            '\uD835\uDF4F': '{\\partial}',
            '\uD835\uDF50': '\\in',
            '\uD835\uDF51': '\\mathbit{\\vartheta}',
            '\uD835\uDF52': '\\mathbit{\\varkappa}',
            '\uD835\uDF53': '\\mathbit{\\phi}',
            '\uD835\uDF54': '\\mathbit{\\varrho}',
            '\uD835\uDF55': '\\mathbit{\\varpi}',
            '\uD835\uDF56': '\\mathsfbf{\\Alpha}',
            '\uD835\uDF57': '\\mathsfbf{\\Beta}',
            '\uD835\uDF58': '\\mathsfbf{\\Gamma}',
            '\uD835\uDF59': '\\mathsfbf{\\Delta}',
            '\uD835\uDF5A': '\\mathsfbf{\\Epsilon}',
            '\uD835\uDF5B': '\\mathsfbf{\\Zeta}',
            '\uD835\uDF5C': '\\mathsfbf{\\Eta}',
            '\uD835\uDF5D': '\\mathsfbf{\\Theta}',
            '\uD835\uDF5E': '\\mathsfbf{\\Iota}',
            '\uD835\uDF5F': '\\mathsfbf{\\Kappa}',
            '\uD835\uDF60': '\\mathsfbf{\\Lambda}',
            '\uD835\uDF61': 'M',
            '\uD835\uDF62': 'N',
            '\uD835\uDF63': '\\mathsfbf{\\Xi}',
            '\uD835\uDF64': 'O',
            '\uD835\uDF65': '\\mathsfbf{\\Pi}',
            '\uD835\uDF66': '\\mathsfbf{\\Rho}',
            '\uD835\uDF67': '\\mathsfbf{\\vartheta}',
            '\uD835\uDF68': '\\mathsfbf{\\Sigma}',
            '\uD835\uDF69': '\\mathsfbf{\\Tau}',
            '\uD835\uDF6A': '\\mathsfbf{\\Upsilon}',
            '\uD835\uDF6B': '\\mathsfbf{\\Phi}',
            '\uD835\uDF6C': '\\mathsfbf{\\Chi}',
            '\uD835\uDF6D': '\\mathsfbf{\\Psi}',
            '\uD835\uDF6E': '\\mathsfbf{\\Omega}',
            '\uD835\uDF6F': '\\mathsfbf{\\nabla}',
            '\uD835\uDF70': '\\mathsfbf{\\Alpha}',
            '\uD835\uDF71': '\\mathsfbf{\\Beta}',
            '\uD835\uDF72': '\\mathsfbf{\\Gamma}',
            '\uD835\uDF73': '\\mathsfbf{\\Delta}',
            '\uD835\uDF74': '\\mathsfbf{\\Epsilon}',
            '\uD835\uDF75': '\\mathsfbf{\\Zeta}',
            '\uD835\uDF76': '\\mathsfbf{\\Eta}',
            '\uD835\uDF77': '\\mathsfbf{\\Theta}',
            '\uD835\uDF78': '\\mathsfbf{\\Iota}',
            '\uD835\uDF79': '\\mathsfbf{\\Kappa}',
            '\uD835\uDF7A': '\\mathsfbf{\\Lambda}',
            '\uD835\uDF7B': 'M',
            '\uD835\uDF7C': 'N',
            '\uD835\uDF7D': '\\mathsfbf{\\Xi}',
            '\uD835\uDF7E': 'O',
            '\uD835\uDF7F': '\\mathsfbf{\\Pi}',
            '\uD835\uDF80': '\\mathsfbf{\\Rho}',
            '\uD835\uDF81': '\\mathsfbf{\\varsigma}',
            '\uD835\uDF82': '\\mathsfbf{\\Sigma}',
            '\uD835\uDF83': '\\mathsfbf{\\Tau}',
            '\uD835\uDF84': '\\mathsfbf{\\Upsilon}',
            '\uD835\uDF85': '\\mathsfbf{\\Phi}',
            '\uD835\uDF86': '\\mathsfbf{\\Chi}',
            '\uD835\uDF87': '\\mathsfbf{\\Psi}',
            '\uD835\uDF88': '\\mathsfbf{\\Omega}',
            '\uD835\uDF89': '{\\partial}',
            '\uD835\uDF8A': '\\in',
            '\uD835\uDF8B': '\\mathsfbf{\\vartheta}',
            '\uD835\uDF8C': '\\mathsfbf{\\varkappa}',
            '\uD835\uDF8D': '\\mathsfbf{\\phi}',
            '\uD835\uDF8E': '\\mathsfbf{\\varrho}',
            '\uD835\uDF8F': '\\mathsfbf{\\varpi}',
            '\uD835\uDF90': '\\mathsfbfsl{\\Alpha}',
            '\uD835\uDF91': '\\mathsfbfsl{\\Beta}',
            '\uD835\uDF92': '\\mathsfbfsl{\\Gamma}',
            '\uD835\uDF93': '\\mathsfbfsl{\\Delta}',
            '\uD835\uDF94': '\\mathsfbfsl{\\Epsilon}',
            '\uD835\uDF95': '\\mathsfbfsl{\\Zeta}',
            '\uD835\uDF96': '\\mathsfbfsl{\\Eta}',
            '\uD835\uDF97': '\\mathsfbfsl{\\vartheta}',
            '\uD835\uDF98': '\\mathsfbfsl{\\Iota}',
            '\uD835\uDF99': '\\mathsfbfsl{\\Kappa}',
            '\uD835\uDF9A': '\\mathsfbfsl{\\Lambda}',
            '\uD835\uDF9B': 'M',
            '\uD835\uDF9C': 'N',
            '\uD835\uDF9D': '\\mathsfbfsl{\\Xi}',
            '\uD835\uDF9E': 'O',
            '\uD835\uDF9F': '\\mathsfbfsl{\\Pi}',
            '\uD835\uDFA0': '\\mathsfbfsl{\\Rho}',
            '\uD835\uDFA1': '\\mathsfbfsl{\\vartheta}',
            '\uD835\uDFA2': '\\mathsfbfsl{\\Sigma}',
            '\uD835\uDFA3': '\\mathsfbfsl{\\Tau}',
            '\uD835\uDFA4': '\\mathsfbfsl{\\Upsilon}',
            '\uD835\uDFA5': '\\mathsfbfsl{\\Phi}',
            '\uD835\uDFA6': '\\mathsfbfsl{\\Chi}',
            '\uD835\uDFA7': '\\mathsfbfsl{\\Psi}',
            '\uD835\uDFA8': '\\mathsfbfsl{\\Omega}',
            '\uD835\uDFA9': '\\mathsfbfsl{\\nabla}',
            '\uD835\uDFAA': '\\mathsfbfsl{\\Alpha}',
            '\uD835\uDFAB': '\\mathsfbfsl{\\Beta}',
            '\uD835\uDFAC': '\\mathsfbfsl{\\Gamma}',
            '\uD835\uDFAD': '\\mathsfbfsl{\\Delta}',
            '\uD835\uDFAE': '\\mathsfbfsl{\\Epsilon}',
            '\uD835\uDFAF': '\\mathsfbfsl{\\Zeta}',
            '\uD835\uDFB0': '\\mathsfbfsl{\\Eta}',
            '\uD835\uDFB1': '\\mathsfbfsl{\\vartheta}',
            '\uD835\uDFB2': '\\mathsfbfsl{\\Iota}',
            '\uD835\uDFB3': '\\mathsfbfsl{\\Kappa}',
            '\uD835\uDFB4': '\\mathsfbfsl{\\Lambda}',
            '\uD835\uDFB5': 'M',
            '\uD835\uDFB6': 'N',
            '\uD835\uDFB7': '\\mathsfbfsl{\\Xi}',
            '\uD835\uDFB8': 'O',
            '\uD835\uDFB9': '\\mathsfbfsl{\\Pi}',
            '\uD835\uDFBA': '\\mathsfbfsl{\\Rho}',
            '\uD835\uDFBB': '\\mathsfbfsl{\\varsigma}',
            '\uD835\uDFBC': '\\mathsfbfsl{\\Sigma}',
            '\uD835\uDFBD': '\\mathsfbfsl{\\Tau}',
            '\uD835\uDFBE': '\\mathsfbfsl{\\Upsilon}',
            '\uD835\uDFBF': '\\mathsfbfsl{\\Phi}',
            '\uD835\uDFC0': '\\mathsfbfsl{\\Chi}',
            '\uD835\uDFC1': '\\mathsfbfsl{\\Psi}',
            '\uD835\uDFC2': '\\mathsfbfsl{\\Omega}',
            '\uD835\uDFC3': '{\\partial}',
            '\uD835\uDFC4': '\\in',
            '\uD835\uDFC5': '\\mathsfbfsl{\\vartheta}',
            '\uD835\uDFC6': '\\mathsfbfsl{\\varkappa}',
            '\uD835\uDFC7': '\\mathsfbfsl{\\phi}',
            '\uD835\uDFC8': '\\mathsfbfsl{\\varrho}',
            '\uD835\uDFC9': '\\mathsfbfsl{\\varpi}',
            '\uD835\uDFCE': '\\mathbf{0}',
            '\uD835\uDFCF': '\\mathbf{1}',
            '\uD835\uDFD0': '\\mathbf{2}',
            '\uD835\uDFD1': '\\mathbf{3}',
            '\uD835\uDFD2': '\\mathbf{4}',
            '\uD835\uDFD3': '\\mathbf{5}',
            '\uD835\uDFD4': '\\mathbf{6}',
            '\uD835\uDFD5': '\\mathbf{7}',
            '\uD835\uDFD6': '\\mathbf{8}',
            '\uD835\uDFD7': '\\mathbf{9}',
            '\uD835\uDFD8': '\\mathbb{0}',
            '\uD835\uDFD9': '\\mathbb{1}',
            '\uD835\uDFDA': '\\mathbb{2}',
            '\uD835\uDFDB': '\\mathbb{3}',
            '\uD835\uDFDC': '\\mathbb{4}',
            '\uD835\uDFDD': '\\mathbb{5}',
            '\uD835\uDFDE': '\\mathbb{6}',
            '\uD835\uDFDF': '\\mathbb{7}',
            '\uD835\uDFE0': '\\mathbb{8}',
            '\uD835\uDFE1': '\\mathbb{9}',
            '\uD835\uDFE2': '\\mathsf{0}',
            '\uD835\uDFE3': '\\mathsf{1}',
            '\uD835\uDFE4': '\\mathsf{2}',
            '\uD835\uDFE5': '\\mathsf{3}',
            '\uD835\uDFE6': '\\mathsf{4}',
            '\uD835\uDFE7': '\\mathsf{5}',
            '\uD835\uDFE8': '\\mathsf{6}',
            '\uD835\uDFE9': '\\mathsf{7}',
            '\uD835\uDFEA': '\\mathsf{8}',
            '\uD835\uDFEB': '\\mathsf{9}',
            '\uD835\uDFEC': '\\mathsfbf{0}',
            '\uD835\uDFED': '\\mathsfbf{1}',
            '\uD835\uDFEE': '\\mathsfbf{2}',
            '\uD835\uDFEF': '\\mathsfbf{3}',
            '\uD835\uDFF0': '\\mathsfbf{4}',
            '\uD835\uDFF1': '\\mathsfbf{5}',
            '\uD835\uDFF2': '\\mathsfbf{6}',
            '\uD835\uDFF3': '\\mathsfbf{7}',
            '\uD835\uDFF4': '\\mathsfbf{8}',
            '\uD835\uDFF5': '\\mathsfbf{9}',
            '\uD835\uDFF6': '\\mathtt{0}',
            '\uD835\uDFF7': '\\mathtt{1}',
            '\uD835\uDFF8': '\\mathtt{2}',
            '\uD835\uDFF9': '\\mathtt{3}',
            '\uD835\uDFFA': '\\mathtt{4}',
            '\uD835\uDFFB': '\\mathtt{5}',
            '\uD835\uDFFC': '\\mathtt{6}',
            '\uD835\uDFFD': '\\mathtt{7}',
            '\uD835\uDFFE': '\\mathtt{8}',
            '\uD835\uDFFF': '\\mathtt{9}',
            '\xEF\xBF\xBD': '\\dbend'
        },
        toUnicode: {
            '\\#': '#',
            '\\$': '$',
            '\\%': '%',
            '\\&': '&',
            '{\\textbackslash}': '\\',
            '\\textbackslash ': '\\',
            '\\^{}': '^',
            '\\_': '_',
            '\\{': '{',
            '\\}': '}',
            '{\\textasciitilde}': '~',
            '\\textasciitilde ': '~',
            '{\\textexclamdown}': '\xA1',
            '\\textexclamdown ': '\xA1',
            '{\\textcent}': '\xA2',
            '\\textcent ': '\xA2',
            '{\\textsterling}': '\xA3',
            '\\textsterling ': '\xA3',
            '{\\textcurrency}': '\xA4',
            '\\textcurrency ': '\xA4',
            '{\\textyen}': '\xA5',
            '\\textyen ': '\xA5',
            '{\\textbrokenbar}': '\xA6',
            '\\textbrokenbar ': '\xA6',
            '{\\textsection}': '\xA7',
            '\\textsection ': '\xA7',
            '{\\textasciidieresis}': '\xA8',
            '\\textasciidieresis ': '\xA8',
            '{\\textcopyright}': '\xA9',
            '\\textcopyright ': '\xA9',
            '{\\textordfeminine}': '\xAA',
            '\\textordfeminine ': '\xAA',
            '{\\guillemotleft}': '\xAB',
            '\\guillemotleft ': '\xAB',
            '{\\lnot}': '\xAC',
            '\\lnot ': '\xAC',
            '\\-': '\xAD',
            '{\\textregistered}': '\xAE',
            '\\textregistered ': '\xAE',
            '{\\textasciimacron}': '\xAF',
            '\\textasciimacron ': '\xAF',
            '{\\textdegree}': '\xB0',
            '\\textdegree ': '\xB0',
            '{\\pm}': '\xB1',
            '\\pm ': '\xB1',
            '{\\textasciiacute}': '\xB4',
            '\\textasciiacute ': '\xB4',
            '\\mathrm{\\mu}': '\xB5',
            '{\\textparagraph}': '\xB6',
            '\\textparagraph ': '\xB6',
            '{\\cdot}': '\u22C5',
            '\\cdot ': '\u22C5',
            '\\c{}': '\xB8',
            '{\\textordmasculine}': '\xBA',
            '\\textordmasculine ': '\xBA',
            '{\\guillemotright}': '\xBB',
            '\\guillemotright ': '\xBB',
            '{\\textonequarter}': '\xBC',
            '\\textonequarter ': '\xBC',
            '{\\textonehalf}': '\xBD',
            '\\textonehalf ': '\xBD',
            '{\\textthreequarters}': '\xBE',
            '\\textthreequarters ': '\xBE',
            '{\\textquestiondown}': '\xBF',
            '\\textquestiondown ': '\xBF',
            '\\`{A}': '\xC0',
            '\\`A': '\xC0',
            '\\\'{A}': '\u0386',
            '\\\'A': '\u0386',
            '\\^{A}': '\xC2',
            '\\^A': '\xC2',
            '\\~{A}': '\xC3',
            '\\~A': '\xC3',
            '\\"{A}': '\xC4',
            '\\"A': '\xC4',
            '{\\AA}': '\u212B',
            '\\AA ': '\u212B',
            '{\\AE}': '\xC6',
            '\\AE ': '\xC6',
            '\\c{C}': '\xC7',
            '\\`{E}': '\xC8',
            '\\`E': '\xC8',
            '\\\'{E}': '\u0388',
            '\\\'E': '\u0388',
            '\\^{E}': '\xCA',
            '\\^E': '\xCA',
            '\\"{E}': '\xCB',
            '\\"E': '\xCB',
            '\\`{I}': '\xCC',
            '\\`I': '\xCC',
            '\\\'{I}': '\xCD',
            '\\\'I': '\xCD',
            '\\^{I}': '\xCE',
            '\\^I': '\xCE',
            '\\"{I}': '\xCF',
            '\\"I': '\xCF',
            '{\\DH}': '\xD0',
            '\\DH ': '\xD0',
            '\\~{N}': '\xD1',
            '\\~N': '\xD1',
            '\\`{O}': '\xD2',
            '\\`O': '\xD2',
            '\\\'{O}': '\xD3',
            '\\\'O': '\xD3',
            '\\^{O}': '\xD4',
            '\\^O': '\xD4',
            '\\~{O}': '\xD5',
            '\\~O': '\xD5',
            '\\"{O}': '\xD6',
            '\\"O': '\xD6',
            '{\\texttimes}': '\xD7',
            '\\texttimes ': '\xD7',
            '{\\O}': '\xD8',
            '\\O ': '\xD8',
            '\\`{U}': '\xD9',
            '\\`U': '\xD9',
            '\\\'{U}': '\xDA',
            '\\\'U': '\xDA',
            '\\^{U}': '\xDB',
            '\\^U': '\xDB',
            '\\"{U}': '\xDC',
            '\\"U': '\xDC',
            '\\\'{Y}': '\xDD',
            '\\\'Y': '\xDD',
            '{\\TH}': '\xDE',
            '\\TH ': '\xDE',
            '{\\ss}': '\xDF',
            '\\ss ': '\xDF',
            '\\`{a}': '\xE0',
            '\\`a': '\xE0',
            '\\\'{a}': '\xE1',
            '\\\'a': '\xE1',
            '\\^{a}': '\xE2',
            '\\^a': '\xE2',
            '\\~{a}': '\xE3',
            '\\~a': '\xE3',
            '\\"{a}': '\xE4',
            '\\"a': '\xE4',
            '{\\aa}': '\xE5',
            '\\aa ': '\xE5',
            '{\\ae}': '\xE6',
            '\\ae ': '\xE6',
            '\\c{c}': '\xE7',
            '\\`{e}': '\xE8',
            '\\`e': '\xE8',
            '\\\'{e}': '\xE9',
            '\\\'e': '\xE9',
            '\\^{e}': '\xEA',
            '\\^e': '\xEA',
            '\\"{e}': '\xEB',
            '\\"e': '\xEB',
            '\\`{\\i}': '\xEC',
            '\\\'{\\i}': '\xED',
            '\\^{\\i}': '\xEE',
            '\\"{\\i}': '\xEF',
            '{\\dh}': '\xF0',
            '\\dh ': '\xF0',
            '\\~{n}': '\xF1',
            '\\~n': '\xF1',
            '\\`{o}': '\xF2',
            '\\`o': '\xF2',
            '\\\'{o}': '\u03CC',
            '\\\'o': '\u03CC',
            '\\^{o}': '\xF4',
            '\\^o': '\xF4',
            '\\~{o}': '\xF5',
            '\\~o': '\xF5',
            '\\"{o}': '\xF6',
            '\\"o': '\xF6',
            '{\\div}': '\xF7',
            '\\div ': '\xF7',
            '{\\o}': '\xF8',
            '\\o ': '\xF8',
            '\\`{u}': '\xF9',
            '\\`u': '\xF9',
            '\\\'{u}': '\xFA',
            '\\\'u': '\xFA',
            '\\^{u}': '\xFB',
            '\\^u': '\xFB',
            '\\"{u}': '\xFC',
            '\\"u': '\xFC',
            '\\\'{y}': '\xFD',
            '\\\'y': '\xFD',
            '{\\th}': '\xFE',
            '\\th ': '\xFE',
            '\\"{y}': '\xFF',
            '\\"y': '\xFF',
            '\\={A}': '\u0100',
            '\\=A': '\u0100',
            '\\={a}': '\u0101',
            '\\=a': '\u0101',
            '\\u{A}': '\u0102',
            '\\u{a}': '\u0103',
            '\\k{A}': '\u0104',
            '\\k{a}': '\u0105',
            '\\\'{C}': '\u0106',
            '\\\'C': '\u0106',
            '\\\'{c}': '\u0107',
            '\\\'c': '\u0107',
            '\\^{C}': '\u0108',
            '\\^C': '\u0108',
            '\\^{c}': '\u0109',
            '\\^c': '\u0109',
            '\\.{C}': '\u010A',
            '\\.C': '\u010A',
            '\\.{c}': '\u010B',
            '\\.c': '\u010B',
            '\\v{C}': '\u010C',
            '\\v{c}': '\u010D',
            '\\v{D}': '\u010E',
            '\\v{d}': '\u010F',
            '{\\DJ}': '\u0110',
            '\\DJ ': '\u0110',
            '{\\dj}': '\u0111',
            '\\dj ': '\u0111',
            '\\={E}': '\u0112',
            '\\=E': '\u0112',
            '\\={e}': '\u0113',
            '\\=e': '\u0113',
            '\\u{E}': '\u0114',
            '\\u{e}': '\u0115',
            '\\.{E}': '\u0116',
            '\\.E': '\u0116',
            '\\.{e}': '\u0117',
            '\\.e': '\u0117',
            '\\k{E}': '\u0118',
            '\\k{e}': '\u0119',
            '\\v{E}': '\u011A',
            '\\v{e}': '\u011B',
            '\\^{G}': '\u011C',
            '\\^G': '\u011C',
            '\\^{g}': '\u011D',
            '\\^g': '\u011D',
            '\\u{G}': '\u011E',
            '\\u{g}': '\u011F',
            '\\.{G}': '\u0120',
            '\\.G': '\u0120',
            '\\.{g}': '\u0121',
            '\\.g': '\u0121',
            '\\c{G}': '\u0122',
            '\\c{g}': '\u0123',
            '\\^{H}': '\u0124',
            '\\^H': '\u0124',
            '\\^{h}': '\u0125',
            '\\^h': '\u0125',
            '{\\fontencoding{LELA}\\selectfont\\char40}': '\u0126',
            '{\\Elzxh}': '\u0127',
            '\\Elzxh ': '\u0127',
            '\\~{I}': '\u0128',
            '\\~I': '\u0128',
            '\\~{\\i}': '\u0129',
            '\\={I}': '\u012A',
            '\\=I': '\u012A',
            '\\={\\i}': '\u012B',
            '\\u{I}': '\u012C',
            '\\u{\\i}': '\u012D',
            '\\k{I}': '\u012E',
            '\\k{i}': '\u012F',
            '\\.{I}': '\u0130',
            '\\.I': '\u0130',
            '{\\i}': '\u0131',
            '\\i ': '\u0131',
            '\\^{J}': '\u0134',
            '\\^J': '\u0134',
            '\\^{\\j}': '\u0135',
            '\\c{K}': '\u0136',
            '\\c{k}': '\u0137',
            '{\\fontencoding{LELA}\\selectfont\\char91}': '\u0138',
            '\\\'{L}': '\u0139',
            '\\\'L': '\u0139',
            '\\\'{l}': '\u013A',
            '\\\'l': '\u013A',
            '\\c{L}': '\u013B',
            '\\c{l}': '\u013C',
            '\\v{L}': '\u013D',
            '\\v{l}': '\u013E',
            '{\\fontencoding{LELA}\\selectfont\\char201}': '\u013F',
            '{\\fontencoding{LELA}\\selectfont\\char202}': '\u0140',
            '{\\L}': '\u0141',
            '\\L ': '\u0141',
            '{\\l}': '\u0142',
            '\\l ': '\u0142',
            '\\\'{N}': '\u0143',
            '\\\'N': '\u0143',
            '\\\'{n}': '\u0144',
            '\\\'n': '\u0144',
            '\\c{N}': '\u0145',
            '\\c{n}': '\u0146',
            '\\v{N}': '\u0147',
            '\\v{n}': '\u0148',
            '{\\NG}': '\u014A',
            '\\NG ': '\u014A',
            '{\\ng}': '\u014B',
            '\\ng ': '\u014B',
            '\\={O}': '\u014C',
            '\\=O': '\u014C',
            '\\={o}': '\u014D',
            '\\=o': '\u014D',
            '\\u{O}': '\u014E',
            '\\u{o}': '\u014F',
            '\\H{O}': '\u0150',
            '\\HO': '\u0150',
            '\\H{o}': '\u0151',
            '\\Ho': '\u0151',
            '{\\OE}': '\u0152',
            '\\OE ': '\u0152',
            '{\\oe}': '\u0153',
            '\\oe ': '\u0153',
            '\\\'{R}': '\u0154',
            '\\\'R': '\u0154',
            '\\\'{r}': '\u0155',
            '\\\'r': '\u0155',
            '\\c{R}': '\u0156',
            '\\c{r}': '\u0157',
            '\\v{R}': '\u0158',
            '\\v{r}': '\u0159',
            '\\\'{S}': '\u015A',
            '\\\'S': '\u015A',
            '\\\'{s}': '\u015B',
            '\\\'s': '\u015B',
            '\\^{S}': '\u015C',
            '\\^S': '\u015C',
            '\\^{s}': '\u015D',
            '\\^s': '\u015D',
            '\\c{S}': '\u015E',
            '\\c{s}': '\u015F',
            '\\v{S}': '\u0160',
            '\\v{s}': '\u0161',
            '\\c{T}': '\u0162',
            '\\c{t}': '\u0163',
            '\\v{T}': '\u0164',
            '\\v{t}': '\u0165',
            '{\\fontencoding{LELA}\\selectfont\\char47}': '\u0166',
            '{\\fontencoding{LELA}\\selectfont\\char63}': '\u0167',
            '\\~{U}': '\u0168',
            '\\~U': '\u0168',
            '\\~{u}': '\u0169',
            '\\~u': '\u0169',
            '\\={U}': '\u016A',
            '\\=U': '\u016A',
            '\\={u}': '\u016B',
            '\\=u': '\u016B',
            '\\u{U}': '\u016C',
            '\\u{u}': '\u016D',
            '\\r{U}': '\u016E',
            '\\r{u}': '\u016F',
            '\\H{U}': '\u0170',
            '\\HU': '\u0170',
            '\\H{u}': '\u0171',
            '\\Hu': '\u0171',
            '\\k{U}': '\u0172',
            '\\k{u}': '\u0173',
            '\\^{W}': '\u0174',
            '\\^W': '\u0174',
            '\\^{w}': '\u0175',
            '\\^w': '\u0175',
            '\\^{Y}': '\u0176',
            '\\^Y': '\u0176',
            '\\^{y}': '\u0177',
            '\\^y': '\u0177',
            '\\"{Y}': '\u0178',
            '\\"Y': '\u0178',
            '\\\'{Z}': '\u0179',
            '\\\'Z': '\u0179',
            '\\\'{z}': '\u017A',
            '\\\'z': '\u017A',
            '\\.{Z}': '\u017B',
            '\\.Z': '\u017B',
            '\\.{z}': '\u017C',
            '\\.z': '\u017C',
            '\\v{Z}': '\u017D',
            '\\v{z}': '\u017E',
            '{\\texthvlig}': '\u0195',
            '\\texthvlig ': '\u0195',
            '{\\textnrleg}': '\u019E',
            '\\textnrleg ': '\u019E',
            '{\\eth}': '\u01AA',
            '\\eth ': '\u01AA',
            '{\\fontencoding{LELA}\\selectfont\\char195}': '\u01BA',
            '{\\textdoublepipe}': '\u01C2',
            '\\textdoublepipe ': '\u01C2',
            '\\\'{g}': '\u01F5',
            '\\\'g': '\u01F5',
            '{\\Elztrna}': '\u0250',
            '\\Elztrna ': '\u0250',
            '{\\Elztrnsa}': '\u0252',
            '\\Elztrnsa ': '\u0252',
            '{\\Elzopeno}': '\u0254',
            '\\Elzopeno ': '\u0254',
            '{\\Elzrtld}': '\u0256',
            '\\Elzrtld ': '\u0256',
            '{\\fontencoding{LEIP}\\selectfont\\char61}': '\u0258',
            '{\\Elzschwa}': '\u0259',
            '\\Elzschwa ': '\u0259',
            '{\\varepsilon}': '\u025B',
            '\\varepsilon ': '\u025B',
            '{\\Elzpgamma}': '\u0263',
            '\\Elzpgamma ': '\u0263',
            '{\\Elzpbgam}': '\u0264',
            '\\Elzpbgam ': '\u0264',
            '{\\Elztrnh}': '\u0265',
            '\\Elztrnh ': '\u0265',
            '{\\Elzbtdl}': '\u026C',
            '\\Elzbtdl ': '\u026C',
            '{\\Elzrtll}': '\u026D',
            '\\Elzrtll ': '\u026D',
            '{\\Elztrnm}': '\u026F',
            '\\Elztrnm ': '\u026F',
            '{\\Elztrnmlr}': '\u0270',
            '\\Elztrnmlr ': '\u0270',
            '{\\Elzltlmr}': '\u0271',
            '\\Elzltlmr ': '\u0271',
            '{\\Elzltln}': '\u0272',
            '\\Elzltln ': '\u0272',
            '{\\Elzrtln}': '\u0273',
            '\\Elzrtln ': '\u0273',
            '{\\Elzclomeg}': '\u0277',
            '\\Elzclomeg ': '\u0277',
            '{\\textphi}': '\u0278',
            '\\textphi ': '\u0278',
            '{\\Elztrnr}': '\u0279',
            '\\Elztrnr ': '\u0279',
            '{\\Elztrnrl}': '\u027A',
            '\\Elztrnrl ': '\u027A',
            '{\\Elzrttrnr}': '\u027B',
            '\\Elzrttrnr ': '\u027B',
            '{\\Elzrl}': '\u027C',
            '\\Elzrl ': '\u027C',
            '{\\Elzrtlr}': '\u027D',
            '\\Elzrtlr ': '\u027D',
            '{\\Elzfhr}': '\u027E',
            '\\Elzfhr ': '\u027E',
            '{\\fontencoding{LEIP}\\selectfont\\char202}': '\u027F',
            '{\\Elzrtls}': '\u0282',
            '\\Elzrtls ': '\u0282',
            '{\\Elzesh}': '\u0283',
            '\\Elzesh ': '\u0283',
            '{\\Elztrnt}': '\u0287',
            '\\Elztrnt ': '\u0287',
            '{\\Elzrtlt}': '\u0288',
            '\\Elzrtlt ': '\u0288',
            '{\\Elzpupsil}': '\u028A',
            '\\Elzpupsil ': '\u028A',
            '{\\Elzpscrv}': '\u028B',
            '\\Elzpscrv ': '\u028B',
            '{\\Elzinvv}': '\u028C',
            '\\Elzinvv ': '\u028C',
            '{\\Elzinvw}': '\u028D',
            '\\Elzinvw ': '\u028D',
            '{\\Elztrny}': '\u028E',
            '\\Elztrny ': '\u028E',
            '{\\Elzrtlz}': '\u0290',
            '\\Elzrtlz ': '\u0290',
            '{\\Elzyogh}': '\u0292',
            '\\Elzyogh ': '\u0292',
            '{\\Elzglst}': '\u0294',
            '\\Elzglst ': '\u0294',
            '{\\Elzreglst}': '\u0295',
            '\\Elzreglst ': '\u0295',
            '{\\Elzinglst}': '\u0296',
            '\\Elzinglst ': '\u0296',
            '{\\textturnk}': '\u029E',
            '\\textturnk ': '\u029E',
            '{\\Elzdyogh}': '\u02A4',
            '\\Elzdyogh ': '\u02A4',
            '{\\Elztesh}': '\u02A7',
            '\\Elztesh ': '\u02A7',
            '{\\textasciicaron}': '\u02C7',
            '\\textasciicaron ': '\u02C7',
            '{\\Elzverts}': '\u02C8',
            '\\Elzverts ': '\u02C8',
            '{\\Elzverti}': '\u02CC',
            '\\Elzverti ': '\u02CC',
            '{\\Elzlmrk}': '\u02D0',
            '\\Elzlmrk ': '\u02D0',
            '{\\Elzhlmrk}': '\u02D1',
            '\\Elzhlmrk ': '\u02D1',
            '{\\Elzsbrhr}': '\u02D2',
            '\\Elzsbrhr ': '\u02D2',
            '{\\Elzsblhr}': '\u02D3',
            '\\Elzsblhr ': '\u02D3',
            '{\\Elzrais}': '\u02D4',
            '\\Elzrais ': '\u02D4',
            '{\\Elzlow}': '\u02D5',
            '\\Elzlow ': '\u02D5',
            '{\\textasciibreve}': '\u02D8',
            '\\textasciibreve ': '\u02D8',
            '{\\textperiodcentered}': '\u02D9',
            '\\textperiodcentered ': '\u02D9',
            '\\r{}': '\u02DA',
            '\\k{}': '\u02DB',
            '{\\texttildelow}': '\u02DC',
            '\\texttildelow ': '\u02DC',
            '\\H{}': '\u02DD',
            '\\tone{55}': '\u02E5',
            '\\tone{44}': '\u02E6',
            '\\tone{33}': '\u02E7',
            '\\tone{22}': '\u02E8',
            '\\tone{11}': '\u02E9',
            '\\`': '\u0300',
            '\\\'': '\u0301',
            '\\^': '\u0302',
            '\\~': '\u0303',
            '\\=': '\u0304',
            '\\u': '\u0306',
            '\\.': '\u0307',
            '\\"': '\u0308',
            '\\r': '\u030A',
            '\\H': '\u030B',
            '\\v': '\u030C',
            '\\cyrchar\\C': '\u030F',
            '{\\fontencoding{LECO}\\selectfont\\char177}': '\u0311',
            '{\\fontencoding{LECO}\\selectfont\\char184}': '\u0318',
            '{\\fontencoding{LECO}\\selectfont\\char185}': '\u0319',
            '{\\Elzpalh}': '\u0321',
            '\\Elzpalh ': '\u0321',
            '{\\Elzrh}': '\u0322',
            '\\Elzrh ': '\u0322',
            '\\c': '\u0327',
            '\\k': '\u0328',
            '{\\Elzsbbrg}': '\u032A',
            '\\Elzsbbrg ': '\u032A',
            '{\\fontencoding{LECO}\\selectfont\\char203}': '\u032B',
            '{\\fontencoding{LECO}\\selectfont\\char207}': '\u032F',
            '{\\Elzxl}': '\u0335',
            '\\Elzxl ': '\u0335',
            '{\\Elzbar}': '\u0336',
            '\\Elzbar ': '\u0336',
            '{\\fontencoding{LECO}\\selectfont\\char215}': '\u0337',
            '{\\fontencoding{LECO}\\selectfont\\char216}': '\u0338',
            '{\\fontencoding{LECO}\\selectfont\\char218}': '\u033A',
            '{\\fontencoding{LECO}\\selectfont\\char219}': '\u033B',
            '{\\fontencoding{LECO}\\selectfont\\char220}': '\u033C',
            '{\\fontencoding{LECO}\\selectfont\\char221}': '\u033D',
            '{\\fontencoding{LECO}\\selectfont\\char225}': '\u0361',
            '\\\'{H}': '\u0389',
            '\\\'H': '\u0389',
            '\\\'{}{I}': '\u038A',
            '\\\'{}O': '\u038C',
            '\\mathrm{\'Y}': '\u038E',
            '\\mathrm{\'\\Omega}': '\u038F',
            '\\acute{\\ddot{\\iota}}': '\u0390',
            '{\\Alpha}': '\u0391',
            '\\Alpha ': '\u0391',
            '{\\Beta}': '\u0392',
            '\\Beta ': '\u0392',
            '{\\Gamma}': '\u0393',
            '\\Gamma ': '\u0393',
            '{\\Delta}': '\u0394',
            '\\Delta ': '\u0394',
            '{\\Epsilon}': '\u0395',
            '\\Epsilon ': '\u0395',
            '{\\Zeta}': '\u0396',
            '\\Zeta ': '\u0396',
            '{\\Eta}': '\u0397',
            '\\Eta ': '\u0397',
            '{\\Theta}': '\u0398',
            '\\Theta ': '\u0398',
            '{\\Iota}': '\u0399',
            '\\Iota ': '\u0399',
            '{\\Kappa}': '\u039A',
            '\\Kappa ': '\u039A',
            '{\\Lambda}': '\u039B',
            '\\Lambda ': '\u039B',
            '{\\Xi}': '\u039E',
            '\\Xi ': '\u039E',
            '{\\Pi}': '\u03A0',
            '\\Pi ': '\u03A0',
            '{\\Rho}': '\u03A1',
            '\\Rho ': '\u03A1',
            '{\\Sigma}': '\u03A3',
            '\\Sigma ': '\u03A3',
            '{\\Tau}': '\u03A4',
            '\\Tau ': '\u03A4',
            '{\\Upsilon}': '\u03D2',
            '\\Upsilon ': '\u03D2',
            '{\\Phi}': '\u03A6',
            '\\Phi ': '\u03A6',
            '{\\Chi}': '\u03A7',
            '\\Chi ': '\u03A7',
            '{\\Psi}': '\u03A8',
            '\\Psi ': '\u03A8',
            '{\\Omega}': '\u2126',
            '\\Omega ': '\u2126',
            '\\mathrm{\\ddot{I}}': '\u03AA',
            '\\mathrm{\\ddot{Y}}': '\u03AB',
            '\\\'{$\\alpha$}': '\u03AC',
            '\\acute{\\epsilon}': '\u03AD',
            '\\acute{\\eta}': '\u03AE',
            '\\acute{\\iota}': '\u03AF',
            '\\acute{\\ddot{\\upsilon}}': '\u03B0',
            '{\\alpha}': '\u03B1',
            '\\alpha ': '\u03B1',
            '{\\beta}': '\u03B2',
            '\\beta ': '\u03B2',
            '{\\gamma}': '\u03B3',
            '\\gamma ': '\u03B3',
            '{\\delta}': '\u03B4',
            '\\delta ': '\u03B4',
            '{\\epsilon}': '\u03B5',
            '\\epsilon ': '\u03B5',
            '{\\zeta}': '\u03B6',
            '\\zeta ': '\u03B6',
            '{\\eta}': '\u03B7',
            '\\eta ': '\u03B7',
            '{\\texttheta}': '\u03B8',
            '\\texttheta ': '\u03B8',
            '{\\iota}': '\u03B9',
            '\\iota ': '\u03B9',
            '{\\kappa}': '\u03BA',
            '\\kappa ': '\u03BA',
            '{\\lambda}': '\u03BB',
            '\\lambda ': '\u03BB',
            '{\\mu}': '\u03BC',
            '\\mu ': '\u03BC',
            '{\\nu}': '\u03BD',
            '\\nu ': '\u03BD',
            '{\\xi}': '\u03BE',
            '\\xi ': '\u03BE',
            '{\\pi}': '\u03C0',
            '\\pi ': '\u03C0',
            '{\\rho}': '\u03C1',
            '\\rho ': '\u03C1',
            '{\\varsigma}': '\u03C2',
            '\\varsigma ': '\u03C2',
            '{\\sigma}': '\u03C3',
            '\\sigma ': '\u03C3',
            '{\\tau}': '\u03C4',
            '\\tau ': '\u03C4',
            '{\\upsilon}': '\u03C5',
            '\\upsilon ': '\u03C5',
            '{\\varphi}': '\u03C6',
            '\\varphi ': '\u03C6',
            '{\\chi}': '\u03C7',
            '\\chi ': '\u03C7',
            '{\\psi}': '\u03C8',
            '\\psi ': '\u03C8',
            '{\\omega}': '\u03C9',
            '\\omega ': '\u03C9',
            '\\ddot{\\iota}': '\u03CA',
            '\\ddot{\\upsilon}': '\u03CB',
            '\\acute{\\upsilon}': '\u03CD',
            '\\acute{\\omega}': '\u03CE',
            '\\Pisymbol{ppi022}{87}': '\u03D0',
            '{\\textvartheta}': '\u03D1',
            '\\textvartheta ': '\u03D1',
            '{\\phi}': '\u03D5',
            '\\phi ': '\u03D5',
            '{\\varpi}': '\u03D6',
            '\\varpi ': '\u03D6',
            '{\\Stigma}': '\u03DA',
            '\\Stigma ': '\u03DA',
            '{\\Digamma}': '\u03DC',
            '\\Digamma ': '\u03DC',
            '{\\digamma}': '\u03DD',
            '\\digamma ': '\u03DD',
            '{\\Koppa}': '\u03DE',
            '\\Koppa ': '\u03DE',
            '{\\Sampi}': '\u03E0',
            '\\Sampi ': '\u03E0',
            '{\\varkappa}': '\u03F0',
            '\\varkappa ': '\u03F0',
            '{\\varrho}': '\u03F1',
            '\\varrho ': '\u03F1',
            '{\\textTheta}': '\u03F4',
            '\\textTheta ': '\u03F4',
            '{\\backepsilon}': '\u03F6',
            '\\backepsilon ': '\u03F6',
            '{\\cyrchar\\CYRYO}': '\u0401',
            '\\cyrchar\\CYRYO ': '\u0401',
            '{\\cyrchar\\CYRDJE}': '\u0402',
            '\\cyrchar\\CYRDJE ': '\u0402',
            '\\cyrchar{\\\'\\CYRG}': '\u0403',
            '{\\cyrchar\\CYRIE}': '\u0404',
            '\\cyrchar\\CYRIE ': '\u0404',
            '{\\cyrchar\\CYRDZE}': '\u0405',
            '\\cyrchar\\CYRDZE ': '\u0405',
            '{\\cyrchar\\CYRII}': '\u0406',
            '\\cyrchar\\CYRII ': '\u0406',
            '{\\cyrchar\\CYRYI}': '\u0407',
            '\\cyrchar\\CYRYI ': '\u0407',
            '{\\cyrchar\\CYRJE}': '\u0408',
            '\\cyrchar\\CYRJE ': '\u0408',
            '{\\cyrchar\\CYRLJE}': '\u0409',
            '\\cyrchar\\CYRLJE ': '\u0409',
            '{\\cyrchar\\CYRNJE}': '\u040A',
            '\\cyrchar\\CYRNJE ': '\u040A',
            '{\\cyrchar\\CYRTSHE}': '\u040B',
            '\\cyrchar\\CYRTSHE ': '\u040B',
            '\\cyrchar{\\\'\\CYRK}': '\u040C',
            '{\\cyrchar\\CYRUSHRT}': '\u040E',
            '\\cyrchar\\CYRUSHRT ': '\u040E',
            '{\\cyrchar\\CYRDZHE}': '\u040F',
            '\\cyrchar\\CYRDZHE ': '\u040F',
            '{\\cyrchar\\CYRA}': '\u0410',
            '\\cyrchar\\CYRA ': '\u0410',
            '{\\cyrchar\\CYRB}': '\u0411',
            '\\cyrchar\\CYRB ': '\u0411',
            '{\\cyrchar\\CYRV}': '\u0412',
            '\\cyrchar\\CYRV ': '\u0412',
            '{\\cyrchar\\CYRG}': '\u0413',
            '\\cyrchar\\CYRG ': '\u0413',
            '{\\cyrchar\\CYRD}': '\u0414',
            '\\cyrchar\\CYRD ': '\u0414',
            '{\\cyrchar\\CYRE}': '\u0415',
            '\\cyrchar\\CYRE ': '\u0415',
            '{\\cyrchar\\CYRZH}': '\u0416',
            '\\cyrchar\\CYRZH ': '\u0416',
            '{\\cyrchar\\CYRZ}': '\u0417',
            '\\cyrchar\\CYRZ ': '\u0417',
            '{\\cyrchar\\CYRI}': '\u0418',
            '\\cyrchar\\CYRI ': '\u0418',
            '{\\cyrchar\\CYRISHRT}': '\u0419',
            '\\cyrchar\\CYRISHRT ': '\u0419',
            '{\\cyrchar\\CYRK}': '\u041A',
            '\\cyrchar\\CYRK ': '\u041A',
            '{\\cyrchar\\CYRL}': '\u041B',
            '\\cyrchar\\CYRL ': '\u041B',
            '{\\cyrchar\\CYRM}': '\u041C',
            '\\cyrchar\\CYRM ': '\u041C',
            '{\\cyrchar\\CYRN}': '\u041D',
            '\\cyrchar\\CYRN ': '\u041D',
            '{\\cyrchar\\CYRO}': '\u041E',
            '\\cyrchar\\CYRO ': '\u041E',
            '{\\cyrchar\\CYRP}': '\u041F',
            '\\cyrchar\\CYRP ': '\u041F',
            '{\\cyrchar\\CYRR}': '\u0420',
            '\\cyrchar\\CYRR ': '\u0420',
            '{\\cyrchar\\CYRS}': '\u0421',
            '\\cyrchar\\CYRS ': '\u0421',
            '{\\cyrchar\\CYRT}': '\u0422',
            '\\cyrchar\\CYRT ': '\u0422',
            '{\\cyrchar\\CYRU}': '\u0423',
            '\\cyrchar\\CYRU ': '\u0423',
            '{\\cyrchar\\CYRF}': '\u0424',
            '\\cyrchar\\CYRF ': '\u0424',
            '{\\cyrchar\\CYRH}': '\u0425',
            '\\cyrchar\\CYRH ': '\u0425',
            '{\\cyrchar\\CYRC}': '\u0426',
            '\\cyrchar\\CYRC ': '\u0426',
            '{\\cyrchar\\CYRCH}': '\u0427',
            '\\cyrchar\\CYRCH ': '\u0427',
            '{\\cyrchar\\CYRSH}': '\u0428',
            '\\cyrchar\\CYRSH ': '\u0428',
            '{\\cyrchar\\CYRSHCH}': '\u0429',
            '\\cyrchar\\CYRSHCH ': '\u0429',
            '{\\cyrchar\\CYRHRDSN}': '\u042A',
            '\\cyrchar\\CYRHRDSN ': '\u042A',
            '{\\cyrchar\\CYRERY}': '\u042B',
            '\\cyrchar\\CYRERY ': '\u042B',
            '{\\cyrchar\\CYRSFTSN}': '\u042C',
            '\\cyrchar\\CYRSFTSN ': '\u042C',
            '{\\cyrchar\\CYREREV}': '\u042D',
            '\\cyrchar\\CYREREV ': '\u042D',
            '{\\cyrchar\\CYRYU}': '\u042E',
            '\\cyrchar\\CYRYU ': '\u042E',
            '{\\cyrchar\\CYRYA}': '\u042F',
            '\\cyrchar\\CYRYA ': '\u042F',
            '{\\cyrchar\\cyra}': '\u0430',
            '\\cyrchar\\cyra ': '\u0430',
            '{\\cyrchar\\cyrb}': '\u0431',
            '\\cyrchar\\cyrb ': '\u0431',
            '{\\cyrchar\\cyrv}': '\u0432',
            '\\cyrchar\\cyrv ': '\u0432',
            '{\\cyrchar\\cyrg}': '\u0433',
            '\\cyrchar\\cyrg ': '\u0433',
            '{\\cyrchar\\cyrd}': '\u0434',
            '\\cyrchar\\cyrd ': '\u0434',
            '{\\cyrchar\\cyre}': '\u0435',
            '\\cyrchar\\cyre ': '\u0435',
            '{\\cyrchar\\cyrzh}': '\u0436',
            '\\cyrchar\\cyrzh ': '\u0436',
            '{\\cyrchar\\cyrz}': '\u0437',
            '\\cyrchar\\cyrz ': '\u0437',
            '{\\cyrchar\\cyri}': '\u0438',
            '\\cyrchar\\cyri ': '\u0438',
            '{\\cyrchar\\cyrishrt}': '\u0439',
            '\\cyrchar\\cyrishrt ': '\u0439',
            '{\\cyrchar\\cyrk}': '\u043A',
            '\\cyrchar\\cyrk ': '\u043A',
            '{\\cyrchar\\cyrl}': '\u043B',
            '\\cyrchar\\cyrl ': '\u043B',
            '{\\cyrchar\\cyrm}': '\u043C',
            '\\cyrchar\\cyrm ': '\u043C',
            '{\\cyrchar\\cyrn}': '\u043D',
            '\\cyrchar\\cyrn ': '\u043D',
            '{\\cyrchar\\cyro}': '\u043E',
            '\\cyrchar\\cyro ': '\u043E',
            '{\\cyrchar\\cyrp}': '\u043F',
            '\\cyrchar\\cyrp ': '\u043F',
            '{\\cyrchar\\cyrr}': '\u0440',
            '\\cyrchar\\cyrr ': '\u0440',
            '{\\cyrchar\\cyrs}': '\u0441',
            '\\cyrchar\\cyrs ': '\u0441',
            '{\\cyrchar\\cyrt}': '\u0442',
            '\\cyrchar\\cyrt ': '\u0442',
            '{\\cyrchar\\cyru}': '\u0443',
            '\\cyrchar\\cyru ': '\u0443',
            '{\\cyrchar\\cyrf}': '\u0444',
            '\\cyrchar\\cyrf ': '\u0444',
            '{\\cyrchar\\cyrh}': '\u0445',
            '\\cyrchar\\cyrh ': '\u0445',
            '{\\cyrchar\\cyrc}': '\u0446',
            '\\cyrchar\\cyrc ': '\u0446',
            '{\\cyrchar\\cyrch}': '\u0447',
            '\\cyrchar\\cyrch ': '\u0447',
            '{\\cyrchar\\cyrsh}': '\u0448',
            '\\cyrchar\\cyrsh ': '\u0448',
            '{\\cyrchar\\cyrshch}': '\u0449',
            '\\cyrchar\\cyrshch ': '\u0449',
            '{\\cyrchar\\cyrhrdsn}': '\u044A',
            '\\cyrchar\\cyrhrdsn ': '\u044A',
            '{\\cyrchar\\cyrery}': '\u044B',
            '\\cyrchar\\cyrery ': '\u044B',
            '{\\cyrchar\\cyrsftsn}': '\u044C',
            '\\cyrchar\\cyrsftsn ': '\u044C',
            '{\\cyrchar\\cyrerev}': '\u044D',
            '\\cyrchar\\cyrerev ': '\u044D',
            '{\\cyrchar\\cyryu}': '\u044E',
            '\\cyrchar\\cyryu ': '\u044E',
            '{\\cyrchar\\cyrya}': '\u044F',
            '\\cyrchar\\cyrya ': '\u044F',
            '{\\cyrchar\\cyryo}': '\u0451',
            '\\cyrchar\\cyryo ': '\u0451',
            '{\\cyrchar\\cyrdje}': '\u0452',
            '\\cyrchar\\cyrdje ': '\u0452',
            '\\cyrchar{\\\'\\cyrg}': '\u0453',
            '{\\cyrchar\\cyrie}': '\u0454',
            '\\cyrchar\\cyrie ': '\u0454',
            '{\\cyrchar\\cyrdze}': '\u0455',
            '\\cyrchar\\cyrdze ': '\u0455',
            '{\\cyrchar\\cyrii}': '\u0456',
            '\\cyrchar\\cyrii ': '\u0456',
            '{\\cyrchar\\cyryi}': '\u0457',
            '\\cyrchar\\cyryi ': '\u0457',
            '{\\cyrchar\\cyrje}': '\u0458',
            '\\cyrchar\\cyrje ': '\u0458',
            '{\\cyrchar\\cyrlje}': '\u0459',
            '\\cyrchar\\cyrlje ': '\u0459',
            '{\\cyrchar\\cyrnje}': '\u045A',
            '\\cyrchar\\cyrnje ': '\u045A',
            '{\\cyrchar\\cyrtshe}': '\u045B',
            '\\cyrchar\\cyrtshe ': '\u045B',
            '\\cyrchar{\\\'\\cyrk}': '\u045C',
            '{\\cyrchar\\cyrushrt}': '\u045E',
            '\\cyrchar\\cyrushrt ': '\u045E',
            '{\\cyrchar\\cyrdzhe}': '\u045F',
            '\\cyrchar\\cyrdzhe ': '\u045F',
            '{\\cyrchar\\CYROMEGA}': '\u0460',
            '\\cyrchar\\CYROMEGA ': '\u0460',
            '{\\cyrchar\\cyromega}': '\u0461',
            '\\cyrchar\\cyromega ': '\u0461',
            '{\\cyrchar\\CYRYAT}': '\u0462',
            '\\cyrchar\\CYRYAT ': '\u0462',
            '{\\cyrchar\\CYRIOTE}': '\u0464',
            '\\cyrchar\\CYRIOTE ': '\u0464',
            '{\\cyrchar\\cyriote}': '\u0465',
            '\\cyrchar\\cyriote ': '\u0465',
            '{\\cyrchar\\CYRLYUS}': '\u0466',
            '\\cyrchar\\CYRLYUS ': '\u0466',
            '{\\cyrchar\\cyrlyus}': '\u0467',
            '\\cyrchar\\cyrlyus ': '\u0467',
            '{\\cyrchar\\CYRIOTLYUS}': '\u0468',
            '\\cyrchar\\CYRIOTLYUS ': '\u0468',
            '{\\cyrchar\\cyriotlyus}': '\u0469',
            '\\cyrchar\\cyriotlyus ': '\u0469',
            '{\\cyrchar\\CYRBYUS}': '\u046A',
            '\\cyrchar\\CYRBYUS ': '\u046A',
            '{\\cyrchar\\CYRIOTBYUS}': '\u046C',
            '\\cyrchar\\CYRIOTBYUS ': '\u046C',
            '{\\cyrchar\\cyriotbyus}': '\u046D',
            '\\cyrchar\\cyriotbyus ': '\u046D',
            '{\\cyrchar\\CYRKSI}': '\u046E',
            '\\cyrchar\\CYRKSI ': '\u046E',
            '{\\cyrchar\\cyrksi}': '\u046F',
            '\\cyrchar\\cyrksi ': '\u046F',
            '{\\cyrchar\\CYRPSI}': '\u0470',
            '\\cyrchar\\CYRPSI ': '\u0470',
            '{\\cyrchar\\cyrpsi}': '\u0471',
            '\\cyrchar\\cyrpsi ': '\u0471',
            '{\\cyrchar\\CYRFITA}': '\u0472',
            '\\cyrchar\\CYRFITA ': '\u0472',
            '{\\cyrchar\\CYRIZH}': '\u0474',
            '\\cyrchar\\CYRIZH ': '\u0474',
            '{\\cyrchar\\CYRUK}': '\u0478',
            '\\cyrchar\\CYRUK ': '\u0478',
            '{\\cyrchar\\cyruk}': '\u0479',
            '\\cyrchar\\cyruk ': '\u0479',
            '{\\cyrchar\\CYROMEGARND}': '\u047A',
            '\\cyrchar\\CYROMEGARND ': '\u047A',
            '{\\cyrchar\\cyromegarnd}': '\u047B',
            '\\cyrchar\\cyromegarnd ': '\u047B',
            '{\\cyrchar\\CYROMEGATITLO}': '\u047C',
            '\\cyrchar\\CYROMEGATITLO ': '\u047C',
            '{\\cyrchar\\cyromegatitlo}': '\u047D',
            '\\cyrchar\\cyromegatitlo ': '\u047D',
            '{\\cyrchar\\CYROT}': '\u047E',
            '\\cyrchar\\CYROT ': '\u047E',
            '{\\cyrchar\\cyrot}': '\u047F',
            '\\cyrchar\\cyrot ': '\u047F',
            '{\\cyrchar\\CYRKOPPA}': '\u0480',
            '\\cyrchar\\CYRKOPPA ': '\u0480',
            '{\\cyrchar\\cyrkoppa}': '\u0481',
            '\\cyrchar\\cyrkoppa ': '\u0481',
            '{\\cyrchar\\cyrthousands}': '\u0482',
            '\\cyrchar\\cyrthousands ': '\u0482',
            '{\\cyrchar\\cyrhundredthousands}': '\u0488',
            '\\cyrchar\\cyrhundredthousands ': '\u0488',
            '{\\cyrchar\\cyrmillions}': '\u0489',
            '\\cyrchar\\cyrmillions ': '\u0489',
            '{\\cyrchar\\CYRSEMISFTSN}': '\u048C',
            '\\cyrchar\\CYRSEMISFTSN ': '\u048C',
            '{\\cyrchar\\cyrsemisftsn}': '\u048D',
            '\\cyrchar\\cyrsemisftsn ': '\u048D',
            '{\\cyrchar\\CYRRTICK}': '\u048E',
            '\\cyrchar\\CYRRTICK ': '\u048E',
            '{\\cyrchar\\cyrrtick}': '\u048F',
            '\\cyrchar\\cyrrtick ': '\u048F',
            '{\\cyrchar\\CYRGUP}': '\u0490',
            '\\cyrchar\\CYRGUP ': '\u0490',
            '{\\cyrchar\\cyrgup}': '\u0491',
            '\\cyrchar\\cyrgup ': '\u0491',
            '{\\cyrchar\\CYRGHCRS}': '\u0492',
            '\\cyrchar\\CYRGHCRS ': '\u0492',
            '{\\cyrchar\\cyrghcrs}': '\u0493',
            '\\cyrchar\\cyrghcrs ': '\u0493',
            '{\\cyrchar\\CYRGHK}': '\u0494',
            '\\cyrchar\\CYRGHK ': '\u0494',
            '{\\cyrchar\\cyrghk}': '\u0495',
            '\\cyrchar\\cyrghk ': '\u0495',
            '{\\cyrchar\\CYRZHDSC}': '\u0496',
            '\\cyrchar\\CYRZHDSC ': '\u0496',
            '{\\cyrchar\\cyrzhdsc}': '\u0497',
            '\\cyrchar\\cyrzhdsc ': '\u0497',
            '{\\cyrchar\\CYRZDSC}': '\u0498',
            '\\cyrchar\\CYRZDSC ': '\u0498',
            '{\\cyrchar\\cyrzdsc}': '\u0499',
            '\\cyrchar\\cyrzdsc ': '\u0499',
            '{\\cyrchar\\CYRKDSC}': '\u049A',
            '\\cyrchar\\CYRKDSC ': '\u049A',
            '{\\cyrchar\\cyrkdsc}': '\u049B',
            '\\cyrchar\\cyrkdsc ': '\u049B',
            '{\\cyrchar\\CYRKVCRS}': '\u049C',
            '\\cyrchar\\CYRKVCRS ': '\u049C',
            '{\\cyrchar\\cyrkvcrs}': '\u049D',
            '\\cyrchar\\cyrkvcrs ': '\u049D',
            '{\\cyrchar\\CYRKHCRS}': '\u049E',
            '\\cyrchar\\CYRKHCRS ': '\u049E',
            '{\\cyrchar\\cyrkhcrs}': '\u049F',
            '\\cyrchar\\cyrkhcrs ': '\u049F',
            '{\\cyrchar\\CYRKBEAK}': '\u04A0',
            '\\cyrchar\\CYRKBEAK ': '\u04A0',
            '{\\cyrchar\\cyrkbeak}': '\u04A1',
            '\\cyrchar\\cyrkbeak ': '\u04A1',
            '{\\cyrchar\\CYRNDSC}': '\u04A2',
            '\\cyrchar\\CYRNDSC ': '\u04A2',
            '{\\cyrchar\\cyrndsc}': '\u04A3',
            '\\cyrchar\\cyrndsc ': '\u04A3',
            '{\\cyrchar\\CYRNG}': '\u04A4',
            '\\cyrchar\\CYRNG ': '\u04A4',
            '{\\cyrchar\\cyrng}': '\u04A5',
            '\\cyrchar\\cyrng ': '\u04A5',
            '{\\cyrchar\\CYRPHK}': '\u04A6',
            '\\cyrchar\\CYRPHK ': '\u04A6',
            '{\\cyrchar\\cyrphk}': '\u04A7',
            '\\cyrchar\\cyrphk ': '\u04A7',
            '{\\cyrchar\\CYRABHHA}': '\u04A8',
            '\\cyrchar\\CYRABHHA ': '\u04A8',
            '{\\cyrchar\\cyrabhha}': '\u04A9',
            '\\cyrchar\\cyrabhha ': '\u04A9',
            '{\\cyrchar\\CYRSDSC}': '\u04AA',
            '\\cyrchar\\CYRSDSC ': '\u04AA',
            '{\\cyrchar\\cyrsdsc}': '\u04AB',
            '\\cyrchar\\cyrsdsc ': '\u04AB',
            '{\\cyrchar\\CYRTDSC}': '\u04AC',
            '\\cyrchar\\CYRTDSC ': '\u04AC',
            '{\\cyrchar\\cyrtdsc}': '\u04AD',
            '\\cyrchar\\cyrtdsc ': '\u04AD',
            '{\\cyrchar\\CYRY}': '\u04AE',
            '\\cyrchar\\CYRY ': '\u04AE',
            '{\\cyrchar\\cyry}': '\u04AF',
            '\\cyrchar\\cyry ': '\u04AF',
            '{\\cyrchar\\CYRYHCRS}': '\u04B0',
            '\\cyrchar\\CYRYHCRS ': '\u04B0',
            '{\\cyrchar\\cyryhcrs}': '\u04B1',
            '\\cyrchar\\cyryhcrs ': '\u04B1',
            '{\\cyrchar\\CYRHDSC}': '\u04B2',
            '\\cyrchar\\CYRHDSC ': '\u04B2',
            '{\\cyrchar\\cyrhdsc}': '\u04B3',
            '\\cyrchar\\cyrhdsc ': '\u04B3',
            '{\\cyrchar\\CYRTETSE}': '\u04B4',
            '\\cyrchar\\CYRTETSE ': '\u04B4',
            '{\\cyrchar\\cyrtetse}': '\u04B5',
            '\\cyrchar\\cyrtetse ': '\u04B5',
            '{\\cyrchar\\CYRCHRDSC}': '\u04B6',
            '\\cyrchar\\CYRCHRDSC ': '\u04B6',
            '{\\cyrchar\\cyrchrdsc}': '\u04B7',
            '\\cyrchar\\cyrchrdsc ': '\u04B7',
            '{\\cyrchar\\CYRCHVCRS}': '\u04B8',
            '\\cyrchar\\CYRCHVCRS ': '\u04B8',
            '{\\cyrchar\\cyrchvcrs}': '\u04B9',
            '\\cyrchar\\cyrchvcrs ': '\u04B9',
            '{\\cyrchar\\CYRSHHA}': '\u04BA',
            '\\cyrchar\\CYRSHHA ': '\u04BA',
            '{\\cyrchar\\cyrshha}': '\u04BB',
            '\\cyrchar\\cyrshha ': '\u04BB',
            '{\\cyrchar\\CYRABHCH}': '\u04BC',
            '\\cyrchar\\CYRABHCH ': '\u04BC',
            '{\\cyrchar\\cyrabhch}': '\u04BD',
            '\\cyrchar\\cyrabhch ': '\u04BD',
            '{\\cyrchar\\CYRABHCHDSC}': '\u04BE',
            '\\cyrchar\\CYRABHCHDSC ': '\u04BE',
            '{\\cyrchar\\cyrabhchdsc}': '\u04BF',
            '\\cyrchar\\cyrabhchdsc ': '\u04BF',
            '{\\cyrchar\\CYRpalochka}': '\u04C0',
            '\\cyrchar\\CYRpalochka ': '\u04C0',
            '{\\cyrchar\\CYRKHK}': '\u04C3',
            '\\cyrchar\\CYRKHK ': '\u04C3',
            '{\\cyrchar\\cyrkhk}': '\u04C4',
            '\\cyrchar\\cyrkhk ': '\u04C4',
            '{\\cyrchar\\CYRNHK}': '\u04C7',
            '\\cyrchar\\CYRNHK ': '\u04C7',
            '{\\cyrchar\\cyrnhk}': '\u04C8',
            '\\cyrchar\\cyrnhk ': '\u04C8',
            '{\\cyrchar\\CYRCHLDSC}': '\u04CB',
            '\\cyrchar\\CYRCHLDSC ': '\u04CB',
            '{\\cyrchar\\cyrchldsc}': '\u04CC',
            '\\cyrchar\\cyrchldsc ': '\u04CC',
            '{\\cyrchar\\CYRAE}': '\u04D4',
            '\\cyrchar\\CYRAE ': '\u04D4',
            '{\\cyrchar\\cyrae}': '\u04D5',
            '\\cyrchar\\cyrae ': '\u04D5',
            '{\\cyrchar\\CYRSCHWA}': '\u04D8',
            '\\cyrchar\\CYRSCHWA ': '\u04D8',
            '{\\cyrchar\\cyrschwa}': '\u04D9',
            '\\cyrchar\\cyrschwa ': '\u04D9',
            '{\\cyrchar\\CYRABHDZE}': '\u04E0',
            '\\cyrchar\\CYRABHDZE ': '\u04E0',
            '{\\cyrchar\\cyrabhdze}': '\u04E1',
            '\\cyrchar\\cyrabhdze ': '\u04E1',
            '{\\cyrchar\\CYROTLD}': '\u04E8',
            '\\cyrchar\\CYROTLD ': '\u04E8',
            '{\\cyrchar\\cyrotld}': '\u04E9',
            '\\cyrchar\\cyrotld ': '\u04E9',
            '\\hspace{0.6em}': '\u2002',
            '\\hspace{1em}': '\u2003',
            '\\hspace{0.33em}': '\u2004',
            '\\hspace{0.25em}': '\u2005',
            '\\hspace{0.166em}': '\u2006',
            '\\hphantom{0}': '\u2007',
            '\\hphantom{,}': '\u2008',
            '\\hspace{0.167em}': '\u2009',
            '{\\mkern1mu}': '\u200A',
            '\\mkern1mu ': '\u200A',
            '{\\textendash}': '\u2013',
            '\\textendash ': '\u2013',
            '{\\textemdash}': '\u2014',
            '\\textemdash ': '\u2014',
            '\\rule{1em}{1pt}': '\u2015',
            '{\\Vert}': '\u2016',
            '\\Vert ': '\u2016',
            '{\\Elzreapos}': '\u201B',
            '\\Elzreapos ': '\u201B',
            '{\\textdagger}': '\u2020',
            '\\textdagger ': '\u2020',
            '{\\textdaggerdbl}': '\u2021',
            '\\textdaggerdbl ': '\u2021',
            '{\\textbullet}': '\u2022',
            '\\textbullet ': '\u2022',
            '{\\ldots}': '\u2026',
            '\\ldots ': '\u2026',
            '{\\textperthousand}': '\u2030',
            '\\textperthousand ': '\u2030',
            '{\\textpertenthousand}': '\u2031',
            '\\textpertenthousand ': '\u2031',
            '{\\backprime}': '\u2035',
            '\\backprime ': '\u2035',
            '{\\guilsinglleft}': '\u2039',
            '\\guilsinglleft ': '\u2039',
            '{\\guilsinglright}': '\u203A',
            '\\guilsinglright ': '\u203A',
            '{\\mkern4mu}': '\u205F',
            '\\mkern4mu ': '\u205F',
            '{\\nolinebreak}': '\u2060',
            '\\nolinebreak ': '\u2060',
            '\\ensuremath{\\Elzpes}': '\u20A7',
            '{\\mbox{\\texteuro}}': '\u20AC',
            '\\mbox{\\texteuro} ': '\u20AC',
            '{\\dddot}': '\u20DB',
            '\\dddot ': '\u20DB',
            '{\\ddddot}': '\u20DC',
            '\\ddddot ': '\u20DC',
            '\\mathbb{C}': '\u2102',
            '\\mathscr{g}': '\u210A',
            '\\mathscr{H}': '\u210B',
            '\\mathfrak{H}': '\u210C',
            '\\mathbb{H}': '\u210D',
            '{\\hslash}': '\u210F',
            '\\hslash ': '\u210F',
            '\\mathscr{I}': '\u2110',
            '\\mathfrak{I}': '\u2111',
            '\\mathscr{L}': '\u2112',
            '\\mathscr{l}': '\uD835\uDCC1',
            '\\mathbb{N}': '\u2115',
            '{\\cyrchar\\textnumero}': '\u2116',
            '\\cyrchar\\textnumero ': '\u2116',
            '{\\wp}': '\u2118',
            '\\wp ': '\u2118',
            '\\mathbb{P}': '\u2119',
            '\\mathbb{Q}': '\u211A',
            '\\mathscr{R}': '\u211B',
            '\\mathfrak{R}': '\u211C',
            '\\mathbb{R}': '\u211D',
            '{\\Elzxrat}': '\u211E',
            '\\Elzxrat ': '\u211E',
            '{\\texttrademark}': '\u2122',
            '\\texttrademark ': '\u2122',
            '\\mathbb{Z}': '\u2124',
            '{\\mho}': '\u2127',
            '\\mho ': '\u2127',
            '\\mathfrak{Z}': '\u2128',
            '\\ElsevierGlyph{2129}': '\u2129',
            '\\mathscr{B}': '\u212C',
            '\\mathfrak{C}': '\u212D',
            '\\mathscr{e}': '\u212F',
            '\\mathscr{E}': '\u2130',
            '\\mathscr{F}': '\u2131',
            '\\mathscr{M}': '\u2133',
            '\\mathscr{o}': '\u2134',
            '{\\aleph}': '\u2135',
            '\\aleph ': '\u2135',
            '{\\beth}': '\u2136',
            '\\beth ': '\u2136',
            '{\\gimel}': '\u2137',
            '\\gimel ': '\u2137',
            '{\\daleth}': '\u2138',
            '\\daleth ': '\u2138',
            '\\textfrac{1}{3}': '\u2153',
            '\\textfrac{2}{3}': '\u2154',
            '\\textfrac{1}{5}': '\u2155',
            '\\textfrac{2}{5}': '\u2156',
            '\\textfrac{3}{5}': '\u2157',
            '\\textfrac{4}{5}': '\u2158',
            '\\textfrac{1}{6}': '\u2159',
            '\\textfrac{5}{6}': '\u215A',
            '\\textfrac{1}{8}': '\u215B',
            '\\textfrac{3}{8}': '\u215C',
            '\\textfrac{5}{8}': '\u215D',
            '\\textfrac{7}{8}': '\u215E',
            '{\\leftarrow}': '\u2190',
            '\\leftarrow ': '\u2190',
            '{\\uparrow}': '\u2191',
            '\\uparrow ': '\u2191',
            '{\\rightarrow}': '\u2192',
            '\\rightarrow ': '\u2192',
            '{\\downarrow}': '\u2193',
            '\\downarrow ': '\u2193',
            '{\\leftrightarrow}': '\u2194',
            '\\leftrightarrow ': '\u2194',
            '{\\updownarrow}': '\u2195',
            '\\updownarrow ': '\u2195',
            '{\\nwarrow}': '\u2196',
            '\\nwarrow ': '\u2196',
            '{\\nearrow}': '\u2197',
            '\\nearrow ': '\u2197',
            '{\\searrow}': '\u2198',
            '\\searrow ': '\u2198',
            '{\\swarrow}': '\u2199',
            '\\swarrow ': '\u2199',
            '{\\nleftarrow}': '\u219A',
            '\\nleftarrow ': '\u219A',
            '{\\nrightarrow}': '\u219B',
            '\\nrightarrow ': '\u219B',
            '{\\arrowwaveright}': '\u219D',
            '\\arrowwaveright ': '\u219D',
            '{\\twoheadleftarrow}': '\u219E',
            '\\twoheadleftarrow ': '\u219E',
            '{\\twoheadrightarrow}': '\u21A0',
            '\\twoheadrightarrow ': '\u21A0',
            '{\\leftarrowtail}': '\u21A2',
            '\\leftarrowtail ': '\u21A2',
            '{\\rightarrowtail}': '\u21A3',
            '\\rightarrowtail ': '\u21A3',
            '{\\mapsto}': '\u21A6',
            '\\mapsto ': '\u21A6',
            '{\\hookleftarrow}': '\u21A9',
            '\\hookleftarrow ': '\u21A9',
            '{\\hookrightarrow}': '\u21AA',
            '\\hookrightarrow ': '\u21AA',
            '{\\looparrowleft}': '\u21AB',
            '\\looparrowleft ': '\u21AB',
            '{\\looparrowright}': '\u21AC',
            '\\looparrowright ': '\u21AC',
            '{\\leftrightsquigarrow}': '\u21AD',
            '\\leftrightsquigarrow ': '\u21AD',
            '{\\nleftrightarrow}': '\u21AE',
            '\\nleftrightarrow ': '\u21AE',
            '{\\Lsh}': '\u21B0',
            '\\Lsh ': '\u21B0',
            '{\\Rsh}': '\u21B1',
            '\\Rsh ': '\u21B1',
            '\\ElsevierGlyph{21B3}': '\u21B3',
            '{\\curvearrowleft}': '\u21B6',
            '\\curvearrowleft ': '\u21B6',
            '{\\curvearrowright}': '\u21B7',
            '\\curvearrowright ': '\u21B7',
            '{\\circlearrowleft}': '\u21BA',
            '\\circlearrowleft ': '\u21BA',
            '{\\circlearrowright}': '\u21BB',
            '\\circlearrowright ': '\u21BB',
            '{\\leftharpoonup}': '\u21BC',
            '\\leftharpoonup ': '\u21BC',
            '{\\leftharpoondown}': '\u21BD',
            '\\leftharpoondown ': '\u21BD',
            '{\\upharpoonright}': '\u21BE',
            '\\upharpoonright ': '\u21BE',
            '{\\upharpoonleft}': '\u21BF',
            '\\upharpoonleft ': '\u21BF',
            '{\\rightharpoonup}': '\u21C0',
            '\\rightharpoonup ': '\u21C0',
            '{\\rightharpoondown}': '\u21C1',
            '\\rightharpoondown ': '\u21C1',
            '{\\downharpoonright}': '\u21C2',
            '\\downharpoonright ': '\u21C2',
            '{\\downharpoonleft}': '\u21C3',
            '\\downharpoonleft ': '\u21C3',
            '{\\rightleftarrows}': '\u21C4',
            '\\rightleftarrows ': '\u21C4',
            '{\\dblarrowupdown}': '\u21C5',
            '\\dblarrowupdown ': '\u21C5',
            '{\\leftrightarrows}': '\u21C6',
            '\\leftrightarrows ': '\u21C6',
            '{\\leftleftarrows}': '\u21C7',
            '\\leftleftarrows ': '\u21C7',
            '{\\upuparrows}': '\u21C8',
            '\\upuparrows ': '\u21C8',
            '{\\rightrightarrows}': '\u21C9',
            '\\rightrightarrows ': '\u21C9',
            '{\\downdownarrows}': '\u21CA',
            '\\downdownarrows ': '\u21CA',
            '{\\leftrightharpoons}': '\u21CB',
            '\\leftrightharpoons ': '\u21CB',
            '{\\rightleftharpoons}': '\u21CC',
            '\\rightleftharpoons ': '\u21CC',
            '{\\nLeftarrow}': '\u21CD',
            '\\nLeftarrow ': '\u21CD',
            '{\\nLeftrightarrow}': '\u21CE',
            '\\nLeftrightarrow ': '\u21CE',
            '{\\nRightarrow}': '\u21CF',
            '\\nRightarrow ': '\u21CF',
            '{\\Leftarrow}': '\u21D0',
            '\\Leftarrow ': '\u21D0',
            '{\\Uparrow}': '\u21D1',
            '\\Uparrow ': '\u21D1',
            '{\\Rightarrow}': '\u21D2',
            '\\Rightarrow ': '\u21D2',
            '{\\Downarrow}': '\u21D3',
            '\\Downarrow ': '\u21D3',
            '{\\Leftrightarrow}': '\u21D4',
            '\\Leftrightarrow ': '\u21D4',
            '{\\Updownarrow}': '\u21D5',
            '\\Updownarrow ': '\u21D5',
            '{\\Lleftarrow}': '\u21DA',
            '\\Lleftarrow ': '\u21DA',
            '{\\Rrightarrow}': '\u21DB',
            '\\Rrightarrow ': '\u21DB',
            '{\\rightsquigarrow}': '\u21DD',
            '\\rightsquigarrow ': '\u21DD',
            '{\\DownArrowUpArrow}': '\u21F5',
            '\\DownArrowUpArrow ': '\u21F5',
            '{\\forall}': '\u2200',
            '\\forall ': '\u2200',
            '{\\complement}': '\u2201',
            '\\complement ': '\u2201',
            '{\\partial}': '\uD835\uDFC3',
            '\\partial ': '\uD835\uDFC3',
            '{\\exists}': '\u2203',
            '\\exists ': '\u2203',
            '{\\nexists}': '\u2204',
            '\\nexists ': '\u2204',
            '{\\varnothing}': '\u2205',
            '\\varnothing ': '\u2205',
            '{\\nabla}': '\u2207',
            '\\nabla ': '\u2207',
            '{\\in}': '\u2208',
            '\\in ': '\u2208',
            '{\\not\\in}': '\u2209',
            '\\not\\in ': '\u2209',
            '{\\ni}': '\u220B',
            '\\ni ': '\u220B',
            '{\\not\\ni}': '\u220C',
            '\\not\\ni ': '\u220C',
            '{\\prod}': '\u220F',
            '\\prod ': '\u220F',
            '{\\coprod}': '\u2210',
            '\\coprod ': '\u2210',
            '{\\sum}': '\u2211',
            '\\sum ': '\u2211',
            '{\\mp}': '\u2213',
            '\\mp ': '\u2213',
            '{\\dotplus}': '\u2214',
            '\\dotplus ': '\u2214',
            '{\\setminus}': '\u2216',
            '\\setminus ': '\u2216',
            '{_\\ast}': '\u2217',
            '{\\circ}': '\u2218',
            '\\circ ': '\u2218',
            '{\\bullet}': '\u2219',
            '\\bullet ': '\u2219',
            '{\\surd}': '\u221A',
            '\\surd ': '\u221A',
            '{\\propto}': '\u221D',
            '\\propto ': '\u221D',
            '{\\infty}': '\u221E',
            '\\infty ': '\u221E',
            '{\\rightangle}': '\u221F',
            '\\rightangle ': '\u221F',
            '{\\angle}': '\u2220',
            '\\angle ': '\u2220',
            '{\\measuredangle}': '\u2221',
            '\\measuredangle ': '\u2221',
            '{\\sphericalangle}': '\u2222',
            '\\sphericalangle ': '\u2222',
            '{\\mid}': '\u2223',
            '\\mid ': '\u2223',
            '{\\nmid}': '\u2224',
            '\\nmid ': '\u2224',
            '{\\parallel}': '\u2225',
            '\\parallel ': '\u2225',
            '{\\nparallel}': '\u2226',
            '\\nparallel ': '\u2226',
            '{\\wedge}': '\u2227',
            '\\wedge ': '\u2227',
            '{\\vee}': '\u2228',
            '\\vee ': '\u2228',
            '{\\cap}': '\u2229',
            '\\cap ': '\u2229',
            '{\\cup}': '\u222A',
            '\\cup ': '\u222A',
            '{\\int}': '\u222B',
            '\\int ': '\u222B',
            '{\\int\\!\\int}': '\u222C',
            '\\int\\!\\int ': '\u222C',
            '{\\int\\!\\int\\!\\int}': '\u222D',
            '\\int\\!\\int\\!\\int ': '\u222D',
            '{\\oint}': '\u222E',
            '\\oint ': '\u222E',
            '{\\surfintegral}': '\u222F',
            '\\surfintegral ': '\u222F',
            '{\\volintegral}': '\u2230',
            '\\volintegral ': '\u2230',
            '{\\clwintegral}': '\u2231',
            '\\clwintegral ': '\u2231',
            '\\ElsevierGlyph{2232}': '\u2232',
            '\\ElsevierGlyph{2233}': '\u2233',
            '{\\therefore}': '\u2234',
            '\\therefore ': '\u2234',
            '{\\because}': '\u2235',
            '\\because ': '\u2235',
            '{\\Colon}': '\u2237',
            '\\Colon ': '\u2237',
            '\\ElsevierGlyph{2238}': '\u2238',
            '\\mathbin{{:}\\!\\!{-}\\!\\!{:}}': '\u223A',
            '{\\homothetic}': '\u223B',
            '\\homothetic ': '\u223B',
            '{\\sim}': '\u223C',
            '\\sim ': '\u223C',
            '{\\backsim}': '\u223D',
            '\\backsim ': '\u223D',
            '{\\lazysinv}': '\u223E',
            '\\lazysinv ': '\u223E',
            '{\\wr}': '\u2240',
            '\\wr ': '\u2240',
            '{\\not\\sim}': '\u2241',
            '\\not\\sim ': '\u2241',
            '\\ElsevierGlyph{2242}': '\u2242',
            '{\\NotEqualTilde}': '\u2242\u0338',
            '\\NotEqualTilde ': '\u2242\u0338',
            '{\\simeq}': '\u2243',
            '\\simeq ': '\u2243',
            '{\\not\\simeq}': '\u2244',
            '\\not\\simeq ': '\u2244',
            '{\\cong}': '\u2245',
            '\\cong ': '\u2245',
            '{\\approxnotequal}': '\u2246',
            '\\approxnotequal ': '\u2246',
            '{\\not\\cong}': '\u2247',
            '\\not\\cong ': '\u2247',
            '{\\approx}': '\u2248',
            '\\approx ': '\u2248',
            '{\\not\\approx}': '\u2249',
            '\\not\\approx ': '\u2249',
            '{\\approxeq}': '\u224A',
            '\\approxeq ': '\u224A',
            '{\\tildetrpl}': '\u224B',
            '\\tildetrpl ': '\u224B',
            '{\\not\\apid}': '\u224B\u0338',
            '\\not\\apid ': '\u224B\u0338',
            '{\\allequal}': '\u224C',
            '\\allequal ': '\u224C',
            '{\\asymp}': '\u224D',
            '\\asymp ': '\u224D',
            '{\\Bumpeq}': '\u224E',
            '\\Bumpeq ': '\u224E',
            '{\\NotHumpDownHump}': '\u224E\u0338',
            '\\NotHumpDownHump ': '\u224E\u0338',
            '{\\bumpeq}': '\u224F',
            '\\bumpeq ': '\u224F',
            '{\\NotHumpEqual}': '\u224F\u0338',
            '\\NotHumpEqual ': '\u224F\u0338',
            '{\\doteq}': '\u2250',
            '\\doteq ': '\u2250',
            '\\not\\doteq': '\u2250\u0338',
            '{\\doteqdot}': '\u2251',
            '\\doteqdot ': '\u2251',
            '{\\fallingdotseq}': '\u2252',
            '\\fallingdotseq ': '\u2252',
            '{\\risingdotseq}': '\u2253',
            '\\risingdotseq ': '\u2253',
            '{\\eqcirc}': '\u2256',
            '\\eqcirc ': '\u2256',
            '{\\circeq}': '\u2257',
            '\\circeq ': '\u2257',
            '{\\estimates}': '\u2259',
            '\\estimates ': '\u2259',
            '\\ElsevierGlyph{225A}': '\u2A63',
            '{\\starequal}': '\u225B',
            '\\starequal ': '\u225B',
            '{\\triangleq}': '\u225C',
            '\\triangleq ': '\u225C',
            '\\ElsevierGlyph{225F}': '\u225F',
            '\\not =': '\u2260',
            '{\\equiv}': '\u2261',
            '\\equiv ': '\u2261',
            '{\\not\\equiv}': '\u2262',
            '\\not\\equiv ': '\u2262',
            '{\\leq}': '\u2264',
            '\\leq ': '\u2264',
            '{\\geq}': '\u2265',
            '\\geq ': '\u2265',
            '{\\leqq}': '\u2266',
            '\\leqq ': '\u2266',
            '{\\geqq}': '\u2267',
            '\\geqq ': '\u2267',
            '{\\lneqq}': '\u2268',
            '\\lneqq ': '\u2268',
            '{\\lvertneqq}': '\u2268\uFE00',
            '\\lvertneqq ': '\u2268\uFE00',
            '{\\gneqq}': '\u2269',
            '\\gneqq ': '\u2269',
            '{\\gvertneqq}': '\u2269\uFE00',
            '\\gvertneqq ': '\u2269\uFE00',
            '{\\ll}': '\u226A',
            '\\ll ': '\u226A',
            '{\\NotLessLess}': '\u226A\u0338',
            '\\NotLessLess ': '\u226A\u0338',
            '{\\gg}': '\u226B',
            '\\gg ': '\u226B',
            '{\\NotGreaterGreater}': '\u226B\u0338',
            '\\NotGreaterGreater ': '\u226B\u0338',
            '{\\between}': '\u226C',
            '\\between ': '\u226C',
            '{\\not\\kern-0.3em\\times}': '\u226D',
            '\\not\\kern-0.3em\\times ': '\u226D',
            '\\not<': '\u226E',
            '\\not>': '\u226F',
            '{\\not\\leq}': '\u2270',
            '\\not\\leq ': '\u2270',
            '{\\not\\geq}': '\u2271',
            '\\not\\geq ': '\u2271',
            '{\\lessequivlnt}': '\u2272',
            '\\lessequivlnt ': '\u2272',
            '{\\greaterequivlnt}': '\u2273',
            '\\greaterequivlnt ': '\u2273',
            '\\ElsevierGlyph{2274}': '\u2274',
            '\\ElsevierGlyph{2275}': '\u2275',
            '{\\lessgtr}': '\u2276',
            '\\lessgtr ': '\u2276',
            '{\\gtrless}': '\u2277',
            '\\gtrless ': '\u2277',
            '{\\notlessgreater}': '\u2278',
            '\\notlessgreater ': '\u2278',
            '{\\notgreaterless}': '\u2279',
            '\\notgreaterless ': '\u2279',
            '{\\prec}': '\u227A',
            '\\prec ': '\u227A',
            '{\\succ}': '\u227B',
            '\\succ ': '\u227B',
            '{\\preccurlyeq}': '\u227C',
            '\\preccurlyeq ': '\u227C',
            '{\\succcurlyeq}': '\u227D',
            '\\succcurlyeq ': '\u227D',
            '{\\precapprox}': '\u2AB7',
            '\\precapprox ': '\u2AB7',
            '{\\NotPrecedesTilde}': '\u227E\u0338',
            '\\NotPrecedesTilde ': '\u227E\u0338',
            '{\\succapprox}': '\u2AB8',
            '\\succapprox ': '\u2AB8',
            '{\\NotSucceedsTilde}': '\u227F\u0338',
            '\\NotSucceedsTilde ': '\u227F\u0338',
            '{\\not\\prec}': '\u2280',
            '\\not\\prec ': '\u2280',
            '{\\not\\succ}': '\u2281',
            '\\not\\succ ': '\u2281',
            '{\\subset}': '\u2282',
            '\\subset ': '\u2282',
            '{\\supset}': '\u2283',
            '\\supset ': '\u2283',
            '{\\not\\subset}': '\u2284',
            '\\not\\subset ': '\u2284',
            '{\\not\\supset}': '\u2285',
            '\\not\\supset ': '\u2285',
            '{\\subseteq}': '\u2286',
            '\\subseteq ': '\u2286',
            '{\\supseteq}': '\u2287',
            '\\supseteq ': '\u2287',
            '{\\not\\subseteq}': '\u2288',
            '\\not\\subseteq ': '\u2288',
            '{\\not\\supseteq}': '\u2289',
            '\\not\\supseteq ': '\u2289',
            '{\\subsetneq}': '\u228A',
            '\\subsetneq ': '\u228A',
            '{\\varsubsetneqq}': '\u228A\uFE00',
            '\\varsubsetneqq ': '\u228A\uFE00',
            '{\\supsetneq}': '\u228B',
            '\\supsetneq ': '\u228B',
            '{\\varsupsetneq}': '\u228B\uFE00',
            '\\varsupsetneq ': '\u228B\uFE00',
            '{\\uplus}': '\u228E',
            '\\uplus ': '\u228E',
            '{\\sqsubset}': '\u228F',
            '\\sqsubset ': '\u228F',
            '{\\NotSquareSubset}': '\u228F\u0338',
            '\\NotSquareSubset ': '\u228F\u0338',
            '{\\sqsupset}': '\u2290',
            '\\sqsupset ': '\u2290',
            '{\\NotSquareSuperset}': '\u2290\u0338',
            '\\NotSquareSuperset ': '\u2290\u0338',
            '{\\sqsubseteq}': '\u2291',
            '\\sqsubseteq ': '\u2291',
            '{\\sqsupseteq}': '\u2292',
            '\\sqsupseteq ': '\u2292',
            '{\\sqcap}': '\u2293',
            '\\sqcap ': '\u2293',
            '{\\sqcup}': '\u2294',
            '\\sqcup ': '\u2294',
            '{\\oplus}': '\u2295',
            '\\oplus ': '\u2295',
            '{\\ominus}': '\u2296',
            '\\ominus ': '\u2296',
            '{\\otimes}': '\u2297',
            '\\otimes ': '\u2297',
            '{\\oslash}': '\u2298',
            '\\oslash ': '\u2298',
            '{\\odot}': '\u2299',
            '\\odot ': '\u2299',
            '{\\circledcirc}': '\u229A',
            '\\circledcirc ': '\u229A',
            '{\\circledast}': '\u229B',
            '\\circledast ': '\u229B',
            '{\\circleddash}': '\u229D',
            '\\circleddash ': '\u229D',
            '{\\boxplus}': '\u229E',
            '\\boxplus ': '\u229E',
            '{\\boxminus}': '\u229F',
            '\\boxminus ': '\u229F',
            '{\\boxtimes}': '\u22A0',
            '\\boxtimes ': '\u22A0',
            '{\\boxdot}': '\u22A1',
            '\\boxdot ': '\u22A1',
            '{\\vdash}': '\u22A2',
            '\\vdash ': '\u22A2',
            '{\\dashv}': '\u22A3',
            '\\dashv ': '\u22A3',
            '{\\top}': '\u22A4',
            '\\top ': '\u22A4',
            '{\\perp}': '\u22A5',
            '\\perp ': '\u22A5',
            '{\\truestate}': '\u22A7',
            '\\truestate ': '\u22A7',
            '{\\forcesextra}': '\u22A8',
            '\\forcesextra ': '\u22A8',
            '{\\Vdash}': '\u22A9',
            '\\Vdash ': '\u22A9',
            '{\\Vvdash}': '\u22AA',
            '\\Vvdash ': '\u22AA',
            '{\\VDash}': '\u22AB',
            '\\VDash ': '\u22AB',
            '{\\nvdash}': '\u22AC',
            '\\nvdash ': '\u22AC',
            '{\\nvDash}': '\u22AD',
            '\\nvDash ': '\u22AD',
            '{\\nVdash}': '\u22AE',
            '\\nVdash ': '\u22AE',
            '{\\nVDash}': '\u22AF',
            '\\nVDash ': '\u22AF',
            '{\\vartriangleleft}': '\u22B2',
            '\\vartriangleleft ': '\u22B2',
            '{\\vartriangleright}': '\u22B3',
            '\\vartriangleright ': '\u22B3',
            '{\\trianglelefteq}': '\u22B4',
            '\\trianglelefteq ': '\u22B4',
            '{\\trianglerighteq}': '\u22B5',
            '\\trianglerighteq ': '\u22B5',
            '{\\original}': '\u22B6',
            '\\original ': '\u22B6',
            '{\\image}': '\u22B7',
            '\\image ': '\u22B7',
            '{\\multimap}': '\u22B8',
            '\\multimap ': '\u22B8',
            '{\\hermitconjmatrix}': '\u22B9',
            '\\hermitconjmatrix ': '\u22B9',
            '{\\intercal}': '\u22BA',
            '\\intercal ': '\u22BA',
            '{\\veebar}': '\u22BB',
            '\\veebar ': '\u22BB',
            '{\\rightanglearc}': '\u22BE',
            '\\rightanglearc ': '\u22BE',
            '\\ElsevierGlyph{22C0}': '\u22C0',
            '\\ElsevierGlyph{22C1}': '\u22C1',
            '{\\bigcap}': '\u22C2',
            '\\bigcap ': '\u22C2',
            '{\\bigcup}': '\u22C3',
            '\\bigcup ': '\u22C3',
            '{\\diamond}': '\u2662',
            '\\diamond ': '\u2662',
            '{\\star}': '\u22C6',
            '\\star ': '\u22C6',
            '{\\divideontimes}': '\u22C7',
            '\\divideontimes ': '\u22C7',
            '{\\bowtie}': '\u22C8',
            '\\bowtie ': '\u22C8',
            '{\\ltimes}': '\u22C9',
            '\\ltimes ': '\u22C9',
            '{\\rtimes}': '\u22CA',
            '\\rtimes ': '\u22CA',
            '{\\leftthreetimes}': '\u22CB',
            '\\leftthreetimes ': '\u22CB',
            '{\\rightthreetimes}': '\u22CC',
            '\\rightthreetimes ': '\u22CC',
            '{\\backsimeq}': '\u22CD',
            '\\backsimeq ': '\u22CD',
            '{\\curlyvee}': '\u22CE',
            '\\curlyvee ': '\u22CE',
            '{\\curlywedge}': '\u22CF',
            '\\curlywedge ': '\u22CF',
            '{\\Subset}': '\u22D0',
            '\\Subset ': '\u22D0',
            '{\\Supset}': '\u22D1',
            '\\Supset ': '\u22D1',
            '{\\Cap}': '\u22D2',
            '\\Cap ': '\u22D2',
            '{\\Cup}': '\u22D3',
            '\\Cup ': '\u22D3',
            '{\\pitchfork}': '\u22D4',
            '\\pitchfork ': '\u22D4',
            '{\\lessdot}': '\u22D6',
            '\\lessdot ': '\u22D6',
            '{\\gtrdot}': '\u22D7',
            '\\gtrdot ': '\u22D7',
            '{\\verymuchless}': '\u22D8',
            '\\verymuchless ': '\u22D8',
            '{\\verymuchgreater}': '\u22D9',
            '\\verymuchgreater ': '\u22D9',
            '{\\lesseqgtr}': '\u22DA',
            '\\lesseqgtr ': '\u22DA',
            '{\\gtreqless}': '\u22DB',
            '\\gtreqless ': '\u22DB',
            '{\\curlyeqprec}': '\u22DE',
            '\\curlyeqprec ': '\u22DE',
            '{\\curlyeqsucc}': '\u22DF',
            '\\curlyeqsucc ': '\u22DF',
            '{\\not\\sqsubseteq}': '\u22E2',
            '\\not\\sqsubseteq ': '\u22E2',
            '{\\not\\sqsupseteq}': '\u22E3',
            '\\not\\sqsupseteq ': '\u22E3',
            '{\\Elzsqspne}': '\u22E5',
            '\\Elzsqspne ': '\u22E5',
            '{\\lnsim}': '\u22E6',
            '\\lnsim ': '\u22E6',
            '{\\gnsim}': '\u22E7',
            '\\gnsim ': '\u22E7',
            '{\\precedesnotsimilar}': '\u22E8',
            '\\precedesnotsimilar ': '\u22E8',
            '{\\succnsim}': '\u22E9',
            '\\succnsim ': '\u22E9',
            '{\\ntriangleleft}': '\u22EA',
            '\\ntriangleleft ': '\u22EA',
            '{\\ntriangleright}': '\u22EB',
            '\\ntriangleright ': '\u22EB',
            '{\\ntrianglelefteq}': '\u22EC',
            '\\ntrianglelefteq ': '\u22EC',
            '{\\ntrianglerighteq}': '\u22ED',
            '\\ntrianglerighteq ': '\u22ED',
            '{\\vdots}': '\u22EE',
            '\\vdots ': '\u22EE',
            '{\\cdots}': '\u22EF',
            '\\cdots ': '\u22EF',
            '{\\upslopeellipsis}': '\u22F0',
            '\\upslopeellipsis ': '\u22F0',
            '{\\downslopeellipsis}': '\u22F1',
            '\\downslopeellipsis ': '\u22F1',
            '{\\barwedge}': '\u2305',
            '\\barwedge ': '\u2305',
            '{\\perspcorrespond}': '\u2A5E',
            '\\perspcorrespond ': '\u2A5E',
            '{\\lceil}': '\u2308',
            '\\lceil ': '\u2308',
            '{\\rceil}': '\u2309',
            '\\rceil ': '\u2309',
            '{\\lfloor}': '\u230A',
            '\\lfloor ': '\u230A',
            '{\\rfloor}': '\u230B',
            '\\rfloor ': '\u230B',
            '{\\recorder}': '\u2315',
            '\\recorder ': '\u2315',
            '\\mathchar"2208': '\u2316',
            '{\\ulcorner}': '\u231C',
            '\\ulcorner ': '\u231C',
            '{\\urcorner}': '\u231D',
            '\\urcorner ': '\u231D',
            '{\\llcorner}': '\u231E',
            '\\llcorner ': '\u231E',
            '{\\lrcorner}': '\u231F',
            '\\lrcorner ': '\u231F',
            '{\\frown}': '\u2322',
            '\\frown ': '\u2322',
            '{\\smile}': '\u2323',
            '\\smile ': '\u2323',
            '\\ElsevierGlyph{E838}': '\u233D',
            '{\\Elzdlcorn}': '\u23A3',
            '\\Elzdlcorn ': '\u23A3',
            '{\\lmoustache}': '\u23B0',
            '\\lmoustache ': '\u23B0',
            '{\\rmoustache}': '\u23B1',
            '\\rmoustache ': '\u23B1',
            '{\\textvisiblespace}': '\u2423',
            '\\textvisiblespace ': '\u2423',
            '\\ding{172}': '\u2460',
            '\\ding{173}': '\u2461',
            '\\ding{174}': '\u2462',
            '\\ding{175}': '\u2463',
            '\\ding{176}': '\u2464',
            '\\ding{177}': '\u2465',
            '\\ding{178}': '\u2466',
            '\\ding{179}': '\u2467',
            '\\ding{180}': '\u2468',
            '\\ding{181}': '\u2469',
            '{\\circledS}': '\u24C8',
            '\\circledS ': '\u24C8',
            '{\\Elzdshfnc}': '\u2506',
            '\\Elzdshfnc ': '\u2506',
            '{\\Elzsqfnw}': '\u2519',
            '\\Elzsqfnw ': '\u2519',
            '{\\diagup}': '\u2571',
            '\\diagup ': '\u2571',
            '\\ding{110}': '\u25A0',
            '{\\square}': '\u25A1',
            '\\square ': '\u25A1',
            '{\\blacksquare}': '\u25AA',
            '\\blacksquare ': '\u25AA',
            '\\fbox{~~}': '\u25AD',
            '{\\Elzvrecto}': '\u25AF',
            '\\Elzvrecto ': '\u25AF',
            '\\ElsevierGlyph{E381}': '\u25B1',
            '\\ding{115}': '\u25B2',
            '{\\bigtriangleup}': '\u25B3',
            '\\bigtriangleup ': '\u25B3',
            '{\\blacktriangle}': '\u25B4',
            '\\blacktriangle ': '\u25B4',
            '{\\vartriangle}': '\u25B5',
            '\\vartriangle ': '\u25B5',
            '{\\blacktriangleright}': '\u25B8',
            '\\blacktriangleright ': '\u25B8',
            '{\\triangleright}': '\u25B9',
            '\\triangleright ': '\u25B9',
            '\\ding{116}': '\u25BC',
            '{\\bigtriangledown}': '\u25BD',
            '\\bigtriangledown ': '\u25BD',
            '{\\blacktriangledown}': '\u25BE',
            '\\blacktriangledown ': '\u25BE',
            '{\\triangledown}': '\u25BF',
            '\\triangledown ': '\u25BF',
            '{\\blacktriangleleft}': '\u25C2',
            '\\blacktriangleleft ': '\u25C2',
            '{\\triangleleft}': '\u25C3',
            '\\triangleleft ': '\u25C3',
            '\\ding{117}': '\u25C6',
            '{\\lozenge}': '\u25CA',
            '\\lozenge ': '\u25CA',
            '{\\bigcirc}': '\u25EF',
            '\\bigcirc ': '\u25EF',
            '\\ding{108}': '\u25CF',
            '{\\Elzcirfl}': '\u25D0',
            '\\Elzcirfl ': '\u25D0',
            '{\\Elzcirfr}': '\u25D1',
            '\\Elzcirfr ': '\u25D1',
            '{\\Elzcirfb}': '\u25D2',
            '\\Elzcirfb ': '\u25D2',
            '\\ding{119}': '\u25D7',
            '{\\Elzrvbull}': '\u25D8',
            '\\Elzrvbull ': '\u25D8',
            '{\\Elzsqfl}': '\u25E7',
            '\\Elzsqfl ': '\u25E7',
            '{\\Elzsqfr}': '\u25E8',
            '\\Elzsqfr ': '\u25E8',
            '{\\Elzsqfse}': '\u25EA',
            '\\Elzsqfse ': '\u25EA',
            '\\ding{72}': '\u2605',
            '\\ding{73}': '\u2729',
            '\\ding{37}': '\u260E',
            '\\ding{42}': '\u261B',
            '\\ding{43}': '\u261E',
            '{\\rightmoon}': '\u263E',
            '\\rightmoon ': '\u263E',
            '{\\mercury}': '\u263F',
            '\\mercury ': '\u263F',
            '{\\venus}': '\u2640',
            '\\venus ': '\u2640',
            '{\\male}': '\u2642',
            '\\male ': '\u2642',
            '{\\jupiter}': '\u2643',
            '\\jupiter ': '\u2643',
            '{\\saturn}': '\u2644',
            '\\saturn ': '\u2644',
            '{\\uranus}': '\u2645',
            '\\uranus ': '\u2645',
            '{\\neptune}': '\u2646',
            '\\neptune ': '\u2646',
            '{\\pluto}': '\u2647',
            '\\pluto ': '\u2647',
            '{\\aries}': '\u2648',
            '\\aries ': '\u2648',
            '{\\taurus}': '\u2649',
            '\\taurus ': '\u2649',
            '{\\gemini}': '\u264A',
            '\\gemini ': '\u264A',
            '{\\cancer}': '\u264B',
            '\\cancer ': '\u264B',
            '{\\leo}': '\u264C',
            '\\leo ': '\u264C',
            '{\\virgo}': '\u264D',
            '\\virgo ': '\u264D',
            '{\\libra}': '\u264E',
            '\\libra ': '\u264E',
            '{\\scorpio}': '\u264F',
            '\\scorpio ': '\u264F',
            '{\\sagittarius}': '\u2650',
            '\\sagittarius ': '\u2650',
            '{\\capricornus}': '\u2651',
            '\\capricornus ': '\u2651',
            '{\\aquarius}': '\u2652',
            '\\aquarius ': '\u2652',
            '{\\pisces}': '\u2653',
            '\\pisces ': '\u2653',
            '\\ding{171}': '\u2660',
            '\\ding{168}': '\u2663',
            '\\ding{170}': '\u2665',
            '\\ding{169}': '\u2666',
            '{\\quarternote}': '\u2669',
            '\\quarternote ': '\u2669',
            '{\\eighthnote}': '\u266A',
            '\\eighthnote ': '\u266A',
            '{\\flat}': '\u266D',
            '\\flat ': '\u266D',
            '{\\natural}': '\u266E',
            '\\natural ': '\u266E',
            '{\\sharp}': '\u266F',
            '\\sharp ': '\u266F',
            '\\ding{33}': '\u2701',
            '\\ding{34}': '\u2702',
            '\\ding{35}': '\u2703',
            '\\ding{36}': '\u2704',
            '\\ding{38}': '\u2706',
            '\\ding{39}': '\u2707',
            '\\ding{40}': '\u2708',
            '\\ding{41}': '\u2709',
            '\\ding{44}': '\u270C',
            '\\ding{45}': '\u270D',
            '\\ding{46}': '\u270E',
            '\\ding{47}': '\u270F',
            '\\ding{48}': '\u2710',
            '\\ding{49}': '\u2711',
            '\\ding{50}': '\u2712',
            '\\ding{51}': '\u2713',
            '\\ding{52}': '\u2714',
            '\\ding{53}': '\u2715',
            '\\ding{54}': '\u2716',
            '\\ding{55}': '\u2717',
            '\\ding{56}': '\u2718',
            '\\ding{57}': '\u2719',
            '\\ding{58}': '\u271A',
            '\\ding{59}': '\u271B',
            '\\ding{60}': '\u271C',
            '\\ding{61}': '\u271D',
            '\\ding{62}': '\u271E',
            '\\ding{63}': '\u271F',
            '\\ding{64}': '\u2720',
            '\\ding{65}': '\u2721',
            '\\ding{66}': '\u2722',
            '\\ding{67}': '\u2723',
            '\\ding{68}': '\u2724',
            '\\ding{69}': '\u2725',
            '\\ding{70}': '\u2726',
            '\\ding{71}': '\u2727',
            '\\ding{74}': '\u272A',
            '\\ding{75}': '\u272B',
            '\\ding{76}': '\u272C',
            '\\ding{77}': '\u272D',
            '\\ding{78}': '\u272E',
            '\\ding{79}': '\u272F',
            '\\ding{80}': '\u2730',
            '\\ding{81}': '\u2731',
            '\\ding{82}': '\u2732',
            '\\ding{83}': '\u2733',
            '\\ding{84}': '\u2734',
            '\\ding{85}': '\u2735',
            '\\ding{86}': '\u2736',
            '\\ding{87}': '\u2737',
            '\\ding{88}': '\u2738',
            '\\ding{89}': '\u2739',
            '\\ding{90}': '\u273A',
            '\\ding{91}': '\u273B',
            '\\ding{92}': '\u273C',
            '\\ding{93}': '\u273D',
            '\\ding{94}': '\u273E',
            '\\ding{95}': '\u273F',
            '\\ding{96}': '\u2740',
            '\\ding{97}': '\u2741',
            '\\ding{98}': '\u2742',
            '\\ding{99}': '\u2743',
            '\\ding{100}': '\u2744',
            '\\ding{101}': '\u2745',
            '\\ding{102}': '\u2746',
            '\\ding{103}': '\u2747',
            '\\ding{104}': '\u2748',
            '\\ding{105}': '\u2749',
            '\\ding{106}': '\u274A',
            '\\ding{107}': '\u274B',
            '\\ding{109}': '\u274D',
            '\\ding{111}': '\u274F',
            '\\ding{112}': '\u2750',
            '\\ding{113}': '\u2751',
            '\\ding{114}': '\u2752',
            '\\ding{118}': '\u2756',
            '\\ding{120}': '\u2758',
            '\\ding{121}': '\u2759',
            '\\ding{122}': '\u275A',
            '\\ding{123}': '\u275B',
            '\\ding{124}': '\u275C',
            '\\ding{125}': '\u275D',
            '\\ding{126}': '\u275E',
            '\\ding{161}': '\u2761',
            '\\ding{162}': '\u2762',
            '\\ding{163}': '\u2763',
            '\\ding{164}': '\u2764',
            '\\ding{165}': '\u2765',
            '\\ding{166}': '\u2766',
            '\\ding{167}': '\u2767',
            '\\ding{182}': '\u2776',
            '\\ding{183}': '\u2777',
            '\\ding{184}': '\u2778',
            '\\ding{185}': '\u2779',
            '\\ding{186}': '\u277A',
            '\\ding{187}': '\u277B',
            '\\ding{188}': '\u277C',
            '\\ding{189}': '\u277D',
            '\\ding{190}': '\u277E',
            '\\ding{191}': '\u277F',
            '\\ding{192}': '\u2780',
            '\\ding{193}': '\u2781',
            '\\ding{194}': '\u2782',
            '\\ding{195}': '\u2783',
            '\\ding{196}': '\u2784',
            '\\ding{197}': '\u2785',
            '\\ding{198}': '\u2786',
            '\\ding{199}': '\u2787',
            '\\ding{200}': '\u2788',
            '\\ding{201}': '\u2789',
            '\\ding{202}': '\u278A',
            '\\ding{203}': '\u278B',
            '\\ding{204}': '\u278C',
            '\\ding{205}': '\u278D',
            '\\ding{206}': '\u278E',
            '\\ding{207}': '\u278F',
            '\\ding{208}': '\u2790',
            '\\ding{209}': '\u2791',
            '\\ding{210}': '\u2792',
            '\\ding{211}': '\u2793',
            '\\ding{212}': '\u2794',
            '\\ding{216}': '\u2798',
            '\\ding{217}': '\u2799',
            '\\ding{218}': '\u279A',
            '\\ding{219}': '\u279B',
            '\\ding{220}': '\u279C',
            '\\ding{221}': '\u279D',
            '\\ding{222}': '\u279E',
            '\\ding{223}': '\u279F',
            '\\ding{224}': '\u27A0',
            '\\ding{225}': '\u27A1',
            '\\ding{226}': '\u27A2',
            '\\ding{227}': '\u27A3',
            '\\ding{228}': '\u27A4',
            '\\ding{229}': '\u27A5',
            '\\ding{230}': '\u27A6',
            '\\ding{231}': '\u27A7',
            '\\ding{232}': '\u27A8',
            '\\ding{233}': '\u27A9',
            '\\ding{234}': '\u27AA',
            '\\ding{235}': '\u27AB',
            '\\ding{236}': '\u27AC',
            '\\ding{237}': '\u27AD',
            '\\ding{238}': '\u27AE',
            '\\ding{239}': '\u27AF',
            '\\ding{241}': '\u27B1',
            '\\ding{242}': '\u27B2',
            '\\ding{243}': '\u27B3',
            '\\ding{244}': '\u27B4',
            '\\ding{245}': '\u27B5',
            '\\ding{246}': '\u27B6',
            '\\ding{247}': '\u27B7',
            '\\ding{248}': '\u27B8',
            '\\ding{249}': '\u27B9',
            '\\ding{250}': '\u27BA',
            '\\ding{251}': '\u27BB',
            '\\ding{252}': '\u27BC',
            '\\ding{253}': '\u27BD',
            '\\ding{254}': '\u27BE',
            '{\\langle}': '\u27E8',
            '\\langle ': '\u27E8',
            '{\\rangle}': '\u27E9',
            '\\rangle ': '\u27E9',
            '{\\longleftarrow}': '\u27F5',
            '\\longleftarrow ': '\u27F5',
            '{\\longrightarrow}': '\u27F6',
            '\\longrightarrow ': '\u27F6',
            '{\\longleftrightarrow}': '\u27F7',
            '\\longleftrightarrow ': '\u27F7',
            '{\\Longleftarrow}': '\u27F8',
            '\\Longleftarrow ': '\u27F8',
            '{\\Longrightarrow}': '\u27F9',
            '\\Longrightarrow ': '\u27F9',
            '{\\Longleftrightarrow}': '\u27FA',
            '\\Longleftrightarrow ': '\u27FA',
            '{\\longmapsto}': '\u27FC',
            '\\longmapsto ': '\u27FC',
            '\\sim\\joinrel\\leadsto': '\u27FF',
            '\\ElsevierGlyph{E212}': '\u2905',
            '{\\UpArrowBar}': '\u2912',
            '\\UpArrowBar ': '\u2912',
            '{\\DownArrowBar}': '\u2913',
            '\\DownArrowBar ': '\u2913',
            '\\ElsevierGlyph{E20C}': '\u2923',
            '\\ElsevierGlyph{E20D}': '\u2924',
            '\\ElsevierGlyph{E20B}': '\u2925',
            '\\ElsevierGlyph{E20A}': '\u2926',
            '\\ElsevierGlyph{E211}': '\u2927',
            '\\ElsevierGlyph{E20E}': '\u2928',
            '\\ElsevierGlyph{E20F}': '\u2929',
            '\\ElsevierGlyph{E210}': '\u292A',
            '\\ElsevierGlyph{E21C}': '\u2933',
            '\\ElsevierGlyph{E21D}': '\u2933\u0338',
            '\\ElsevierGlyph{E21A}': '\u2936',
            '\\ElsevierGlyph{E219}': '\u2937',
            '{\\Elolarr}': '\u2940',
            '\\Elolarr ': '\u2940',
            '{\\Elorarr}': '\u2941',
            '\\Elorarr ': '\u2941',
            '{\\ElzRlarr}': '\u2942',
            '\\ElzRlarr ': '\u2942',
            '{\\ElzrLarr}': '\u2944',
            '\\ElzrLarr ': '\u2944',
            '{\\Elzrarrx}': '\u2947',
            '\\Elzrarrx ': '\u2947',
            '{\\LeftRightVector}': '\u294E',
            '\\LeftRightVector ': '\u294E',
            '{\\RightUpDownVector}': '\u294F',
            '\\RightUpDownVector ': '\u294F',
            '{\\DownLeftRightVector}': '\u2950',
            '\\DownLeftRightVector ': '\u2950',
            '{\\LeftUpDownVector}': '\u2951',
            '\\LeftUpDownVector ': '\u2951',
            '{\\LeftVectorBar}': '\u2952',
            '\\LeftVectorBar ': '\u2952',
            '{\\RightVectorBar}': '\u2953',
            '\\RightVectorBar ': '\u2953',
            '{\\RightUpVectorBar}': '\u2954',
            '\\RightUpVectorBar ': '\u2954',
            '{\\RightDownVectorBar}': '\u2955',
            '\\RightDownVectorBar ': '\u2955',
            '{\\DownLeftVectorBar}': '\u2956',
            '\\DownLeftVectorBar ': '\u2956',
            '{\\DownRightVectorBar}': '\u2957',
            '\\DownRightVectorBar ': '\u2957',
            '{\\LeftUpVectorBar}': '\u2958',
            '\\LeftUpVectorBar ': '\u2958',
            '{\\LeftDownVectorBar}': '\u2959',
            '\\LeftDownVectorBar ': '\u2959',
            '{\\LeftTeeVector}': '\u295A',
            '\\LeftTeeVector ': '\u295A',
            '{\\RightTeeVector}': '\u295B',
            '\\RightTeeVector ': '\u295B',
            '{\\RightUpTeeVector}': '\u295C',
            '\\RightUpTeeVector ': '\u295C',
            '{\\RightDownTeeVector}': '\u295D',
            '\\RightDownTeeVector ': '\u295D',
            '{\\DownLeftTeeVector}': '\u295E',
            '\\DownLeftTeeVector ': '\u295E',
            '{\\DownRightTeeVector}': '\u295F',
            '\\DownRightTeeVector ': '\u295F',
            '{\\LeftUpTeeVector}': '\u2960',
            '\\LeftUpTeeVector ': '\u2960',
            '{\\LeftDownTeeVector}': '\u2961',
            '\\LeftDownTeeVector ': '\u2961',
            '{\\UpEquilibrium}': '\u296E',
            '\\UpEquilibrium ': '\u296E',
            '{\\ReverseUpEquilibrium}': '\u296F',
            '\\ReverseUpEquilibrium ': '\u296F',
            '{\\RoundImplies}': '\u2970',
            '\\RoundImplies ': '\u2970',
            '\\ElsevierGlyph{E214}': '\u297C',
            '\\ElsevierGlyph{E215}': '\u297D',
            '{\\Elztfnc}': '\u2980',
            '\\Elztfnc ': '\u2980',
            '\\ElsevierGlyph{3018}': '\u3018',
            '{\\Elroang}': '\u2986',
            '\\Elroang ': '\u2986',
            '<\\kern-0.58em(': '\u2993',
            '\\ElsevierGlyph{E291}': '\u2994',
            '{\\Elzddfnc}': '\u2999',
            '\\Elzddfnc ': '\u2999',
            '{\\Angle}': '\u299C',
            '\\Angle ': '\u299C',
            '{\\Elzlpargt}': '\u29A0',
            '\\Elzlpargt ': '\u29A0',
            '\\ElsevierGlyph{E260}': '\u29B5',
            '\\ElsevierGlyph{E61B}': '\u29B6',
            '{\\ElzLap}': '\u29CA',
            '\\ElzLap ': '\u29CA',
            '{\\Elzdefas}': '\u29CB',
            '\\Elzdefas ': '\u29CB',
            '{\\LeftTriangleBar}': '\u29CF',
            '\\LeftTriangleBar ': '\u29CF',
            '{\\NotLeftTriangleBar}': '\u29CF\u0338',
            '\\NotLeftTriangleBar ': '\u29CF\u0338',
            '{\\RightTriangleBar}': '\u29D0',
            '\\RightTriangleBar ': '\u29D0',
            '{\\NotRightTriangleBar}': '\u29D0\u0338',
            '\\NotRightTriangleBar ': '\u29D0\u0338',
            '\\ElsevierGlyph{E372}': '\u29DC',
            '{\\blacklozenge}': '\u29EB',
            '\\blacklozenge ': '\u29EB',
            '{\\RuleDelayed}': '\u29F4',
            '\\RuleDelayed ': '\u29F4',
            '{\\Elxuplus}': '\u2A04',
            '\\Elxuplus ': '\u2A04',
            '{\\ElzThr}': '\u2A05',
            '\\ElzThr ': '\u2A05',
            '{\\Elxsqcup}': '\u2A06',
            '\\Elxsqcup ': '\u2A06',
            '{\\ElzInf}': '\u2A07',
            '\\ElzInf ': '\u2A07',
            '{\\ElzSup}': '\u2A08',
            '\\ElzSup ': '\u2A08',
            '{\\ElzCint}': '\u2A0D',
            '\\ElzCint ': '\u2A0D',
            '{\\clockoint}': '\u2A0F',
            '\\clockoint ': '\u2A0F',
            '\\ElsevierGlyph{E395}': '\u2A10',
            '{\\sqrint}': '\u2A16',
            '\\sqrint ': '\u2A16',
            '\\ElsevierGlyph{E25A}': '\u2A25',
            '\\ElsevierGlyph{E25B}': '\u2A2A',
            '\\ElsevierGlyph{E25C}': '\u2A2D',
            '\\ElsevierGlyph{E25D}': '\u2A2E',
            '{\\ElzTimes}': '\u2A2F',
            '\\ElzTimes ': '\u2A2F',
            '\\ElsevierGlyph{E25E}': '\u2A35',
            '\\ElsevierGlyph{E259}': '\u2A3C',
            '{\\amalg}': '\u2A3F',
            '\\amalg ': '\u2A3F',
            '{\\ElzAnd}': '\u2A53',
            '\\ElzAnd ': '\u2A53',
            '{\\ElzOr}': '\u2A54',
            '\\ElzOr ': '\u2A54',
            '\\ElsevierGlyph{E36E}': '\u2A55',
            '{\\ElOr}': '\u2A56',
            '\\ElOr ': '\u2A56',
            '{\\Elzminhat}': '\u2A5F',
            '\\Elzminhat ': '\u2A5F',
            '\\stackrel{*}{=}': '\u2A6E',
            '{\\Equal}': '\u2A75',
            '\\Equal ': '\u2A75',
            '{\\leqslant}': '\u2A7D',
            '\\leqslant ': '\u2A7D',
            '{\\nleqslant}': '\u2A7D\u0338',
            '\\nleqslant ': '\u2A7D\u0338',
            '{\\geqslant}': '\u2A7E',
            '\\geqslant ': '\u2A7E',
            '{\\ngeqslant}': '\u2A7E\u0338',
            '\\ngeqslant ': '\u2A7E\u0338',
            '{\\lessapprox}': '\u2A85',
            '\\lessapprox ': '\u2A85',
            '{\\gtrapprox}': '\u2A86',
            '\\gtrapprox ': '\u2A86',
            '{\\lneq}': '\u2A87',
            '\\lneq ': '\u2A87',
            '{\\gneq}': '\u2A88',
            '\\gneq ': '\u2A88',
            '{\\lnapprox}': '\u2A89',
            '\\lnapprox ': '\u2A89',
            '{\\gnapprox}': '\u2A8A',
            '\\gnapprox ': '\u2A8A',
            '{\\lesseqqgtr}': '\u2A8B',
            '\\lesseqqgtr ': '\u2A8B',
            '{\\gtreqqless}': '\u2A8C',
            '\\gtreqqless ': '\u2A8C',
            '{\\eqslantless}': '\u2A95',
            '\\eqslantless ': '\u2A95',
            '{\\eqslantgtr}': '\u2A96',
            '\\eqslantgtr ': '\u2A96',
            '\\Pisymbol{ppi020}{117}': '\u2A9D',
            '\\Pisymbol{ppi020}{105}': '\u2A9E',
            '{\\NestedLessLess}': '\u2AA1',
            '\\NestedLessLess ': '\u2AA1',
            '{\\NotNestedLessLess}': '\u2AA1\u0338',
            '\\NotNestedLessLess ': '\u2AA1\u0338',
            '{\\NestedGreaterGreater}': '\u2AA2',
            '\\NestedGreaterGreater ': '\u2AA2',
            '{\\NotNestedGreaterGreater}': '\u2AA2\u0338',
            '\\NotNestedGreaterGreater ': '\u2AA2\u0338',
            '{\\preceq}': '\u2AAF',
            '\\preceq ': '\u2AAF',
            '{\\not\\preceq}': '\u2AAF\u0338',
            '\\not\\preceq ': '\u2AAF\u0338',
            '{\\succeq}': '\u2AB0',
            '\\succeq ': '\u2AB0',
            '{\\not\\succeq}': '\u2AB0\u0338',
            '\\not\\succeq ': '\u2AB0\u0338',
            '{\\precneqq}': '\u2AB5',
            '\\precneqq ': '\u2AB5',
            '{\\succneqq}': '\u2AB6',
            '\\succneqq ': '\u2AB6',
            '{\\precnapprox}': '\u2AB9',
            '\\precnapprox ': '\u2AB9',
            '{\\succnapprox}': '\u2ABA',
            '\\succnapprox ': '\u2ABA',
            '{\\subseteqq}': '\u2AC5',
            '\\subseteqq ': '\u2AC5',
            '{\\nsubseteqq}': '\u2AC5\u0338',
            '\\nsubseteqq ': '\u2AC5\u0338',
            '{\\supseteqq}': '\u2AC6',
            '\\supseteqq ': '\u2AC6',
            '\\nsupseteqq': '\u2AC6\u0338',
            '{\\subsetneqq}': '\u2ACB',
            '\\subsetneqq ': '\u2ACB',
            '{\\supsetneqq}': '\u2ACC',
            '\\supsetneqq ': '\u2ACC',
            '\\ElsevierGlyph{E30D}': '\u2AEB',
            '{\\Elztdcol}': '\u2AF6',
            '\\Elztdcol ': '\u2AF6',
            '{{/}\\!\\!{/}}': '\u2AFD',
            '{\\rlap{\\textbackslash}{{/}\\!\\!{/}}}': '\u2AFD\u20E5',
            '\\ElsevierGlyph{300A}': '\u300A',
            '\\ElsevierGlyph{300B}': '\u300B',
            '\\ElsevierGlyph{3019}': '\u3019',
            '{\\openbracketleft}': '\u301A',
            '\\openbracketleft ': '\u301A',
            '{\\openbracketright}': '\u301B',
            '\\openbracketright ': '\u301B',
            '\\mathbf{A}': '\uD835\uDC00',
            '\\mathbf{B}': '\uD835\uDC01',
            '\\mathbf{C}': '\uD835\uDC02',
            '\\mathbf{D}': '\uD835\uDC03',
            '\\mathbf{E}': '\uD835\uDC04',
            '\\mathbf{F}': '\uD835\uDC05',
            '\\mathbf{G}': '\uD835\uDC06',
            '\\mathbf{H}': '\uD835\uDC07',
            '\\mathbf{I}': '\uD835\uDC08',
            '\\mathbf{J}': '\uD835\uDC09',
            '\\mathbf{K}': '\uD835\uDC0A',
            '\\mathbf{L}': '\uD835\uDC0B',
            '\\mathbf{M}': '\uD835\uDC0C',
            '\\mathbf{N}': '\uD835\uDC0D',
            '\\mathbf{O}': '\uD835\uDC0E',
            '\\mathbf{P}': '\uD835\uDC0F',
            '\\mathbf{Q}': '\uD835\uDC10',
            '\\mathbf{R}': '\uD835\uDC11',
            '\\mathbf{S}': '\uD835\uDC12',
            '\\mathbf{T}': '\uD835\uDC13',
            '\\mathbf{U}': '\uD835\uDC14',
            '\\mathbf{V}': '\uD835\uDC15',
            '\\mathbf{W}': '\uD835\uDC16',
            '\\mathbf{X}': '\uD835\uDC17',
            '\\mathbf{Y}': '\uD835\uDC18',
            '\\mathbf{Z}': '\uD835\uDC19',
            '\\mathbf{a}': '\uD835\uDC1A',
            '\\mathbf{b}': '\uD835\uDC1B',
            '\\mathbf{c}': '\uD835\uDC1C',
            '\\mathbf{d}': '\uD835\uDC1D',
            '\\mathbf{e}': '\uD835\uDC1E',
            '\\mathbf{f}': '\uD835\uDC1F',
            '\\mathbf{g}': '\uD835\uDC20',
            '\\mathbf{h}': '\uD835\uDC21',
            '\\mathbf{i}': '\uD835\uDC22',
            '\\mathbf{j}': '\uD835\uDC23',
            '\\mathbf{k}': '\uD835\uDC24',
            '\\mathbf{l}': '\uD835\uDC25',
            '\\mathbf{m}': '\uD835\uDC26',
            '\\mathbf{n}': '\uD835\uDC27',
            '\\mathbf{o}': '\uD835\uDC28',
            '\\mathbf{p}': '\uD835\uDC29',
            '\\mathbf{q}': '\uD835\uDC2A',
            '\\mathbf{r}': '\uD835\uDC2B',
            '\\mathbf{s}': '\uD835\uDC2C',
            '\\mathbf{t}': '\uD835\uDC2D',
            '\\mathbf{u}': '\uD835\uDC2E',
            '\\mathbf{v}': '\uD835\uDC2F',
            '\\mathbf{w}': '\uD835\uDC30',
            '\\mathbf{x}': '\uD835\uDC31',
            '\\mathbf{y}': '\uD835\uDC32',
            '\\mathbf{z}': '\uD835\uDC33',
            '\\mathmit{A}': '\uD835\uDC34',
            '\\mathmit{B}': '\uD835\uDC35',
            '\\mathmit{C}': '\uD835\uDC36',
            '\\mathmit{D}': '\uD835\uDC37',
            '\\mathmit{E}': '\uD835\uDC38',
            '\\mathmit{F}': '\uD835\uDC39',
            '\\mathmit{G}': '\uD835\uDC3A',
            '\\mathmit{H}': '\uD835\uDC3B',
            '\\mathmit{I}': '\uD835\uDC3C',
            '\\mathmit{J}': '\uD835\uDC3D',
            '\\mathmit{K}': '\uD835\uDC3E',
            '\\mathmit{L}': '\uD835\uDC3F',
            '\\mathmit{M}': '\uD835\uDC40',
            '\\mathmit{N}': '\uD835\uDC41',
            '\\mathmit{O}': '\uD835\uDC42',
            '\\mathmit{P}': '\uD835\uDC43',
            '\\mathmit{Q}': '\uD835\uDC44',
            '\\mathmit{R}': '\uD835\uDC45',
            '\\mathmit{S}': '\uD835\uDC46',
            '\\mathmit{T}': '\uD835\uDC47',
            '\\mathmit{U}': '\uD835\uDC48',
            '\\mathmit{V}': '\uD835\uDC49',
            '\\mathmit{W}': '\uD835\uDC4A',
            '\\mathmit{X}': '\uD835\uDC4B',
            '\\mathmit{Y}': '\uD835\uDC4C',
            '\\mathmit{Z}': '\uD835\uDC4D',
            '\\mathmit{a}': '\uD835\uDC4E',
            '\\mathmit{b}': '\uD835\uDC4F',
            '\\mathmit{c}': '\uD835\uDC50',
            '\\mathmit{d}': '\uD835\uDC51',
            '\\mathmit{e}': '\uD835\uDC52',
            '\\mathmit{f}': '\uD835\uDC53',
            '\\mathmit{g}': '\uD835\uDC54',
            '\\mathmit{i}': '\uD835\uDC56',
            '\\mathmit{j}': '\uD835\uDC57',
            '\\mathmit{k}': '\uD835\uDC58',
            '\\mathmit{l}': '\uD835\uDC59',
            '\\mathmit{m}': '\uD835\uDC5A',
            '\\mathmit{n}': '\uD835\uDC5B',
            '\\mathmit{o}': '\uD835\uDC5C',
            '\\mathmit{p}': '\uD835\uDC5D',
            '\\mathmit{q}': '\uD835\uDC5E',
            '\\mathmit{r}': '\uD835\uDC5F',
            '\\mathmit{s}': '\uD835\uDC60',
            '\\mathmit{t}': '\uD835\uDC61',
            '\\mathmit{u}': '\uD835\uDC62',
            '\\mathmit{v}': '\uD835\uDC63',
            '\\mathmit{w}': '\uD835\uDC64',
            '\\mathmit{x}': '\uD835\uDC65',
            '\\mathmit{y}': '\uD835\uDC66',
            '\\mathmit{z}': '\uD835\uDC67',
            '\\mathbit{A}': '\uD835\uDC68',
            '\\mathbit{B}': '\uD835\uDC69',
            '\\mathbit{C}': '\uD835\uDC6A',
            '\\mathbit{D}': '\uD835\uDC6B',
            '\\mathbit{E}': '\uD835\uDC6C',
            '\\mathbit{F}': '\uD835\uDC6D',
            '\\mathbit{G}': '\uD835\uDC6E',
            '\\mathbit{H}': '\uD835\uDC6F',
            '\\mathbit{I}': '\uD835\uDC70',
            '\\mathbit{J}': '\uD835\uDC71',
            '\\mathbit{K}': '\uD835\uDC72',
            '\\mathbit{L}': '\uD835\uDC73',
            '\\mathbit{M}': '\uD835\uDC74',
            '\\mathbit{N}': '\uD835\uDC75',
            '\\mathbit{O}': '\uD835\uDF2D',
            '\\mathbit{P}': '\uD835\uDC77',
            '\\mathbit{Q}': '\uD835\uDC78',
            '\\mathbit{R}': '\uD835\uDC79',
            '\\mathbit{S}': '\uD835\uDC7A',
            '\\mathbit{T}': '\uD835\uDC7B',
            '\\mathbit{U}': '\uD835\uDC7C',
            '\\mathbit{V}': '\uD835\uDC7D',
            '\\mathbit{W}': '\uD835\uDC7E',
            '\\mathbit{X}': '\uD835\uDC7F',
            '\\mathbit{Y}': '\uD835\uDC80',
            '\\mathbit{Z}': '\uD835\uDC81',
            '\\mathbit{a}': '\uD835\uDC82',
            '\\mathbit{b}': '\uD835\uDC83',
            '\\mathbit{c}': '\uD835\uDC84',
            '\\mathbit{d}': '\uD835\uDC85',
            '\\mathbit{e}': '\uD835\uDC86',
            '\\mathbit{f}': '\uD835\uDC87',
            '\\mathbit{g}': '\uD835\uDC88',
            '\\mathbit{h}': '\uD835\uDC89',
            '\\mathbit{i}': '\uD835\uDC8A',
            '\\mathbit{j}': '\uD835\uDC8B',
            '\\mathbit{k}': '\uD835\uDC8C',
            '\\mathbit{l}': '\uD835\uDC8D',
            '\\mathbit{m}': '\uD835\uDC8E',
            '\\mathbit{n}': '\uD835\uDC8F',
            '\\mathbit{o}': '\uD835\uDC90',
            '\\mathbit{p}': '\uD835\uDC91',
            '\\mathbit{q}': '\uD835\uDC92',
            '\\mathbit{r}': '\uD835\uDC93',
            '\\mathbit{s}': '\uD835\uDC94',
            '\\mathbit{t}': '\uD835\uDC95',
            '\\mathbit{u}': '\uD835\uDC96',
            '\\mathbit{v}': '\uD835\uDC97',
            '\\mathbit{w}': '\uD835\uDC98',
            '\\mathbit{x}': '\uD835\uDC99',
            '\\mathbit{y}': '\uD835\uDC9A',
            '\\mathbit{z}': '\uD835\uDC9B',
            '\\mathscr{A}': '\uD835\uDC9C',
            '\\mathscr{C}': '\uD835\uDC9E',
            '\\mathscr{D}': '\uD835\uDC9F',
            '\\mathscr{G}': '\uD835\uDCA2',
            '\\mathscr{J}': '\uD835\uDCA5',
            '\\mathscr{K}': '\uD835\uDCA6',
            '\\mathscr{N}': '\uD835\uDCA9',
            '\\mathscr{O}': '\uD835\uDCAA',
            '\\mathscr{P}': '\uD835\uDCAB',
            '\\mathscr{Q}': '\uD835\uDCAC',
            '\\mathscr{S}': '\uD835\uDCAE',
            '\\mathscr{T}': '\uD835\uDCAF',
            '\\mathscr{U}': '\uD835\uDCB0',
            '\\mathscr{V}': '\uD835\uDCB1',
            '\\mathscr{W}': '\uD835\uDCB2',
            '\\mathscr{X}': '\uD835\uDCB3',
            '\\mathscr{Y}': '\uD835\uDCB4',
            '\\mathscr{Z}': '\uD835\uDCB5',
            '\\mathscr{a}': '\uD835\uDCB6',
            '\\mathscr{b}': '\uD835\uDCB7',
            '\\mathscr{c}': '\uD835\uDCB8',
            '\\mathscr{d}': '\uD835\uDCB9',
            '\\mathscr{f}': '\uD835\uDCBB',
            '\\mathscr{h}': '\uD835\uDCBD',
            '\\mathscr{i}': '\uD835\uDCBE',
            '\\mathscr{j}': '\uD835\uDCBF',
            '\\mathscr{k}': '\uD835\uDCC0',
            '\\mathscr{m}': '\uD835\uDCC2',
            '\\mathscr{n}': '\uD835\uDCC3',
            '\\mathscr{p}': '\uD835\uDCC5',
            '\\mathscr{q}': '\uD835\uDCC6',
            '\\mathscr{r}': '\uD835\uDCC7',
            '\\mathscr{s}': '\uD835\uDCC8',
            '\\mathscr{t}': '\uD835\uDCC9',
            '\\mathscr{u}': '\uD835\uDCCA',
            '\\mathscr{v}': '\uD835\uDCCB',
            '\\mathscr{w}': '\uD835\uDCCC',
            '\\mathscr{x}': '\uD835\uDCCD',
            '\\mathscr{y}': '\uD835\uDCCE',
            '\\mathscr{z}': '\uD835\uDCCF',
            '\\mathbcal{A}': '\uD835\uDCD0',
            '\\mathbcal{B}': '\uD835\uDCD1',
            '\\mathbcal{C}': '\uD835\uDCD2',
            '\\mathbcal{D}': '\uD835\uDCD3',
            '\\mathbcal{E}': '\uD835\uDCD4',
            '\\mathbcal{F}': '\uD835\uDCD5',
            '\\mathbcal{G}': '\uD835\uDCD6',
            '\\mathbcal{H}': '\uD835\uDCD7',
            '\\mathbcal{I}': '\uD835\uDCD8',
            '\\mathbcal{J}': '\uD835\uDCD9',
            '\\mathbcal{K}': '\uD835\uDCDA',
            '\\mathbcal{L}': '\uD835\uDCDB',
            '\\mathbcal{M}': '\uD835\uDCDC',
            '\\mathbcal{N}': '\uD835\uDCDD',
            '\\mathbcal{O}': '\uD835\uDCDE',
            '\\mathbcal{P}': '\uD835\uDCDF',
            '\\mathbcal{Q}': '\uD835\uDCE0',
            '\\mathbcal{R}': '\uD835\uDCE1',
            '\\mathbcal{S}': '\uD835\uDCE2',
            '\\mathbcal{T}': '\uD835\uDCE3',
            '\\mathbcal{U}': '\uD835\uDCE4',
            '\\mathbcal{V}': '\uD835\uDCE5',
            '\\mathbcal{W}': '\uD835\uDCE6',
            '\\mathbcal{X}': '\uD835\uDCE7',
            '\\mathbcal{Y}': '\uD835\uDCE8',
            '\\mathbcal{Z}': '\uD835\uDCE9',
            '\\mathbcal{a}': '\uD835\uDCEA',
            '\\mathbcal{b}': '\uD835\uDCEB',
            '\\mathbcal{c}': '\uD835\uDCEC',
            '\\mathbcal{d}': '\uD835\uDCED',
            '\\mathbcal{e}': '\uD835\uDCEE',
            '\\mathbcal{f}': '\uD835\uDCEF',
            '\\mathbcal{g}': '\uD835\uDCF0',
            '\\mathbcal{h}': '\uD835\uDCF1',
            '\\mathbcal{i}': '\uD835\uDCF2',
            '\\mathbcal{j}': '\uD835\uDCF3',
            '\\mathbcal{k}': '\uD835\uDCF4',
            '\\mathbcal{l}': '\uD835\uDCF5',
            '\\mathbcal{m}': '\uD835\uDCF6',
            '\\mathbcal{n}': '\uD835\uDCF7',
            '\\mathbcal{o}': '\uD835\uDCF8',
            '\\mathbcal{p}': '\uD835\uDCF9',
            '\\mathbcal{q}': '\uD835\uDCFA',
            '\\mathbcal{r}': '\uD835\uDCFB',
            '\\mathbcal{s}': '\uD835\uDCFC',
            '\\mathbcal{t}': '\uD835\uDCFD',
            '\\mathbcal{u}': '\uD835\uDCFE',
            '\\mathbcal{v}': '\uD835\uDCFF',
            '\\mathbcal{w}': '\uD835\uDD00',
            '\\mathbcal{x}': '\uD835\uDD01',
            '\\mathbcal{y}': '\uD835\uDD02',
            '\\mathbcal{z}': '\uD835\uDD03',
            '\\mathfrak{A}': '\uD835\uDD04',
            '\\mathfrak{B}': '\uD835\uDD05',
            '\\mathfrak{D}': '\uD835\uDD07',
            '\\mathfrak{E}': '\uD835\uDD08',
            '\\mathfrak{F}': '\uD835\uDD09',
            '\\mathfrak{G}': '\uD835\uDD0A',
            '\\mathfrak{J}': '\uD835\uDD0D',
            '\\mathfrak{K}': '\uD835\uDD0E',
            '\\mathfrak{L}': '\uD835\uDD0F',
            '\\mathfrak{M}': '\uD835\uDD10',
            '\\mathfrak{N}': '\uD835\uDD11',
            '\\mathfrak{O}': '\uD835\uDD12',
            '\\mathfrak{P}': '\uD835\uDD13',
            '\\mathfrak{Q}': '\uD835\uDD14',
            '\\mathfrak{S}': '\uD835\uDD16',
            '\\mathfrak{T}': '\uD835\uDD17',
            '\\mathfrak{U}': '\uD835\uDD18',
            '\\mathfrak{V}': '\uD835\uDD19',
            '\\mathfrak{W}': '\uD835\uDD1A',
            '\\mathfrak{X}': '\uD835\uDD1B',
            '\\mathfrak{Y}': '\uD835\uDD1C',
            '\\mathfrak{a}': '\uD835\uDD1E',
            '\\mathfrak{b}': '\uD835\uDD1F',
            '\\mathfrak{c}': '\uD835\uDD20',
            '\\mathfrak{d}': '\uD835\uDD21',
            '\\mathfrak{e}': '\uD835\uDD22',
            '\\mathfrak{f}': '\uD835\uDD23',
            '\\mathfrak{g}': '\uD835\uDD24',
            '\\mathfrak{h}': '\uD835\uDD25',
            '\\mathfrak{i}': '\uD835\uDD26',
            '\\mathfrak{j}': '\uD835\uDD27',
            '\\mathfrak{k}': '\uD835\uDD28',
            '\\mathfrak{l}': '\uD835\uDD29',
            '\\mathfrak{m}': '\uD835\uDD2A',
            '\\mathfrak{n}': '\uD835\uDD2B',
            '\\mathfrak{o}': '\uD835\uDD2C',
            '\\mathfrak{p}': '\uD835\uDD2D',
            '\\mathfrak{q}': '\uD835\uDD2E',
            '\\mathfrak{r}': '\uD835\uDD2F',
            '\\mathfrak{s}': '\uD835\uDD30',
            '\\mathfrak{t}': '\uD835\uDD31',
            '\\mathfrak{u}': '\uD835\uDD32',
            '\\mathfrak{v}': '\uD835\uDD33',
            '\\mathfrak{w}': '\uD835\uDD34',
            '\\mathfrak{x}': '\uD835\uDD35',
            '\\mathfrak{y}': '\uD835\uDD36',
            '\\mathfrak{z}': '\uD835\uDD37',
            '\\mathbb{A}': '\uD835\uDD38',
            '\\mathbb{B}': '\uD835\uDD39',
            '\\mathbb{D}': '\uD835\uDD3B',
            '\\mathbb{E}': '\uD835\uDD3C',
            '\\mathbb{F}': '\uD835\uDD3D',
            '\\mathbb{G}': '\uD835\uDD3E',
            '\\mathbb{I}': '\uD835\uDD40',
            '\\mathbb{J}': '\uD835\uDD41',
            '\\mathbb{K}': '\uD835\uDD42',
            '\\mathbb{L}': '\uD835\uDD43',
            '\\mathbb{M}': '\uD835\uDD44',
            '\\mathbb{O}': '\uD835\uDD46',
            '\\mathbb{S}': '\uD835\uDD4A',
            '\\mathbb{T}': '\uD835\uDD4B',
            '\\mathbb{U}': '\uD835\uDD4C',
            '\\mathbb{V}': '\uD835\uDD4D',
            '\\mathbb{W}': '\uD835\uDD4E',
            '\\mathbb{X}': '\uD835\uDD4F',
            '\\mathbb{Y}': '\uD835\uDD50',
            '\\mathbb{a}': '\uD835\uDD52',
            '\\mathbb{b}': '\uD835\uDD53',
            '\\mathbb{c}': '\uD835\uDD54',
            '\\mathbb{d}': '\uD835\uDD55',
            '\\mathbb{e}': '\uD835\uDD56',
            '\\mathbb{f}': '\uD835\uDD57',
            '\\mathbb{g}': '\uD835\uDD58',
            '\\mathbb{h}': '\uD835\uDD59',
            '\\mathbb{i}': '\uD835\uDD5A',
            '\\mathbb{j}': '\uD835\uDD5B',
            '\\mathbb{k}': '\uD835\uDD5C',
            '\\mathbb{l}': '\uD835\uDD5D',
            '\\mathbb{m}': '\uD835\uDD5E',
            '\\mathbb{n}': '\uD835\uDD5F',
            '\\mathbb{o}': '\uD835\uDD60',
            '\\mathbb{p}': '\uD835\uDD61',
            '\\mathbb{q}': '\uD835\uDD62',
            '\\mathbb{r}': '\uD835\uDD63',
            '\\mathbb{s}': '\uD835\uDD64',
            '\\mathbb{t}': '\uD835\uDD65',
            '\\mathbb{u}': '\uD835\uDD66',
            '\\mathbb{v}': '\uD835\uDD67',
            '\\mathbb{w}': '\uD835\uDD68',
            '\\mathbb{x}': '\uD835\uDD69',
            '\\mathbb{y}': '\uD835\uDD6A',
            '\\mathbb{z}': '\uD835\uDD6B',
            '\\mathbfrak{A}': '\uD835\uDD6C',
            '\\mathbfrak{B}': '\uD835\uDD6D',
            '\\mathbfrak{C}': '\uD835\uDD6E',
            '\\mathbfrak{D}': '\uD835\uDD6F',
            '\\mathbfrak{E}': '\uD835\uDD70',
            '\\mathbfrak{F}': '\uD835\uDD71',
            '\\mathbfrak{G}': '\uD835\uDD72',
            '\\mathbfrak{H}': '\uD835\uDD73',
            '\\mathbfrak{I}': '\uD835\uDD74',
            '\\mathbfrak{J}': '\uD835\uDD75',
            '\\mathbfrak{K}': '\uD835\uDD76',
            '\\mathbfrak{L}': '\uD835\uDD77',
            '\\mathbfrak{M}': '\uD835\uDD78',
            '\\mathbfrak{N}': '\uD835\uDD79',
            '\\mathbfrak{O}': '\uD835\uDD7A',
            '\\mathbfrak{P}': '\uD835\uDD7B',
            '\\mathbfrak{Q}': '\uD835\uDD7C',
            '\\mathbfrak{R}': '\uD835\uDD7D',
            '\\mathbfrak{S}': '\uD835\uDD7E',
            '\\mathbfrak{T}': '\uD835\uDD7F',
            '\\mathbfrak{U}': '\uD835\uDD80',
            '\\mathbfrak{V}': '\uD835\uDD81',
            '\\mathbfrak{W}': '\uD835\uDD82',
            '\\mathbfrak{X}': '\uD835\uDD83',
            '\\mathbfrak{Y}': '\uD835\uDD84',
            '\\mathbfrak{Z}': '\uD835\uDD85',
            '\\mathbfrak{a}': '\uD835\uDD86',
            '\\mathbfrak{b}': '\uD835\uDD87',
            '\\mathbfrak{c}': '\uD835\uDD88',
            '\\mathbfrak{d}': '\uD835\uDD89',
            '\\mathbfrak{e}': '\uD835\uDD8A',
            '\\mathbfrak{f}': '\uD835\uDD8B',
            '\\mathbfrak{g}': '\uD835\uDD8C',
            '\\mathbfrak{h}': '\uD835\uDD8D',
            '\\mathbfrak{i}': '\uD835\uDD8E',
            '\\mathbfrak{j}': '\uD835\uDD8F',
            '\\mathbfrak{k}': '\uD835\uDD90',
            '\\mathbfrak{l}': '\uD835\uDD91',
            '\\mathbfrak{m}': '\uD835\uDD92',
            '\\mathbfrak{n}': '\uD835\uDD93',
            '\\mathbfrak{o}': '\uD835\uDD94',
            '\\mathbfrak{p}': '\uD835\uDD95',
            '\\mathbfrak{q}': '\uD835\uDD96',
            '\\mathbfrak{r}': '\uD835\uDD97',
            '\\mathbfrak{s}': '\uD835\uDD98',
            '\\mathbfrak{t}': '\uD835\uDD99',
            '\\mathbfrak{u}': '\uD835\uDD9A',
            '\\mathbfrak{v}': '\uD835\uDD9B',
            '\\mathbfrak{w}': '\uD835\uDD9C',
            '\\mathbfrak{x}': '\uD835\uDD9D',
            '\\mathbfrak{y}': '\uD835\uDD9E',
            '\\mathbfrak{z}': '\uD835\uDD9F',
            '\\mathsf{A}': '\uD835\uDDA0',
            '\\mathsf{B}': '\uD835\uDDA1',
            '\\mathsf{C}': '\uD835\uDDA2',
            '\\mathsf{D}': '\uD835\uDDA3',
            '\\mathsf{E}': '\uD835\uDDA4',
            '\\mathsf{F}': '\uD835\uDDA5',
            '\\mathsf{G}': '\uD835\uDDA6',
            '\\mathsf{H}': '\uD835\uDDA7',
            '\\mathsf{I}': '\uD835\uDDA8',
            '\\mathsf{J}': '\uD835\uDDA9',
            '\\mathsf{K}': '\uD835\uDDAA',
            '\\mathsf{L}': '\uD835\uDDAB',
            '\\mathsf{M}': '\uD835\uDDAC',
            '\\mathsf{N}': '\uD835\uDDAD',
            '\\mathsf{O}': '\uD835\uDDAE',
            '\\mathsf{P}': '\uD835\uDDAF',
            '\\mathsf{Q}': '\uD835\uDDB0',
            '\\mathsf{R}': '\uD835\uDDB1',
            '\\mathsf{S}': '\uD835\uDDB2',
            '\\mathsf{T}': '\uD835\uDDB3',
            '\\mathsf{U}': '\uD835\uDDB4',
            '\\mathsf{V}': '\uD835\uDDB5',
            '\\mathsf{W}': '\uD835\uDDB6',
            '\\mathsf{X}': '\uD835\uDDB7',
            '\\mathsf{Y}': '\uD835\uDDB8',
            '\\mathsf{Z}': '\uD835\uDDB9',
            '\\mathsf{a}': '\uD835\uDDBA',
            '\\mathsf{b}': '\uD835\uDDBB',
            '\\mathsf{c}': '\uD835\uDDBC',
            '\\mathsf{d}': '\uD835\uDDBD',
            '\\mathsf{e}': '\uD835\uDDBE',
            '\\mathsf{f}': '\uD835\uDDBF',
            '\\mathsf{g}': '\uD835\uDDC0',
            '\\mathsf{h}': '\uD835\uDDC1',
            '\\mathsf{i}': '\uD835\uDDC2',
            '\\mathsf{j}': '\uD835\uDDC3',
            '\\mathsf{k}': '\uD835\uDDC4',
            '\\mathsf{l}': '\uD835\uDDC5',
            '\\mathsf{m}': '\uD835\uDDC6',
            '\\mathsf{n}': '\uD835\uDDC7',
            '\\mathsf{o}': '\uD835\uDDC8',
            '\\mathsf{p}': '\uD835\uDDC9',
            '\\mathsf{q}': '\uD835\uDDCA',
            '\\mathsf{r}': '\uD835\uDDCB',
            '\\mathsf{s}': '\uD835\uDDCC',
            '\\mathsf{t}': '\uD835\uDDCD',
            '\\mathsf{u}': '\uD835\uDDCE',
            '\\mathsf{v}': '\uD835\uDDCF',
            '\\mathsf{w}': '\uD835\uDDD0',
            '\\mathsf{x}': '\uD835\uDDD1',
            '\\mathsf{y}': '\uD835\uDDD2',
            '\\mathsf{z}': '\uD835\uDDD3',
            '\\mathsfbf{A}': '\uD835\uDDD4',
            '\\mathsfbf{B}': '\uD835\uDDD5',
            '\\mathsfbf{C}': '\uD835\uDDD6',
            '\\mathsfbf{D}': '\uD835\uDDD7',
            '\\mathsfbf{E}': '\uD835\uDDD8',
            '\\mathsfbf{F}': '\uD835\uDDD9',
            '\\mathsfbf{G}': '\uD835\uDDDA',
            '\\mathsfbf{H}': '\uD835\uDDDB',
            '\\mathsfbf{I}': '\uD835\uDDDC',
            '\\mathsfbf{J}': '\uD835\uDDDD',
            '\\mathsfbf{K}': '\uD835\uDDDE',
            '\\mathsfbf{L}': '\uD835\uDDDF',
            '\\mathsfbf{M}': '\uD835\uDDE0',
            '\\mathsfbf{N}': '\uD835\uDDE1',
            '\\mathsfbf{O}': '\uD835\uDDE2',
            '\\mathsfbf{P}': '\uD835\uDDE3',
            '\\mathsfbf{Q}': '\uD835\uDDE4',
            '\\mathsfbf{R}': '\uD835\uDDE5',
            '\\mathsfbf{S}': '\uD835\uDDE6',
            '\\mathsfbf{T}': '\uD835\uDDE7',
            '\\mathsfbf{U}': '\uD835\uDDE8',
            '\\mathsfbf{V}': '\uD835\uDDE9',
            '\\mathsfbf{W}': '\uD835\uDDEA',
            '\\mathsfbf{X}': '\uD835\uDDEB',
            '\\mathsfbf{Y}': '\uD835\uDDEC',
            '\\mathsfbf{Z}': '\uD835\uDDED',
            '\\mathsfbf{a}': '\uD835\uDDEE',
            '\\mathsfbf{b}': '\uD835\uDDEF',
            '\\mathsfbf{c}': '\uD835\uDDF0',
            '\\mathsfbf{d}': '\uD835\uDDF1',
            '\\mathsfbf{e}': '\uD835\uDDF2',
            '\\mathsfbf{f}': '\uD835\uDDF3',
            '\\mathsfbf{g}': '\uD835\uDDF4',
            '\\mathsfbf{h}': '\uD835\uDDF5',
            '\\mathsfbf{i}': '\uD835\uDDF6',
            '\\mathsfbf{j}': '\uD835\uDDF7',
            '\\mathsfbf{k}': '\uD835\uDDF8',
            '\\mathsfbf{l}': '\uD835\uDDF9',
            '\\mathsfbf{m}': '\uD835\uDDFA',
            '\\mathsfbf{n}': '\uD835\uDDFB',
            '\\mathsfbf{o}': '\uD835\uDDFC',
            '\\mathsfbf{p}': '\uD835\uDDFD',
            '\\mathsfbf{q}': '\uD835\uDDFE',
            '\\mathsfbf{r}': '\uD835\uDDFF',
            '\\mathsfbf{s}': '\uD835\uDE00',
            '\\mathsfbf{t}': '\uD835\uDE01',
            '\\mathsfbf{u}': '\uD835\uDE02',
            '\\mathsfbf{v}': '\uD835\uDE03',
            '\\mathsfbf{w}': '\uD835\uDE04',
            '\\mathsfbf{x}': '\uD835\uDE05',
            '\\mathsfbf{y}': '\uD835\uDE06',
            '\\mathsfbf{z}': '\uD835\uDE07',
            '\\mathsfsl{A}': '\uD835\uDE08',
            '\\mathsfsl{B}': '\uD835\uDE09',
            '\\mathsfsl{C}': '\uD835\uDE0A',
            '\\mathsfsl{D}': '\uD835\uDE0B',
            '\\mathsfsl{E}': '\uD835\uDE0C',
            '\\mathsfsl{F}': '\uD835\uDE0D',
            '\\mathsfsl{G}': '\uD835\uDE0E',
            '\\mathsfsl{H}': '\uD835\uDE0F',
            '\\mathsfsl{I}': '\uD835\uDE10',
            '\\mathsfsl{J}': '\uD835\uDE11',
            '\\mathsfsl{K}': '\uD835\uDE12',
            '\\mathsfsl{L}': '\uD835\uDE13',
            '\\mathsfsl{M}': '\uD835\uDE14',
            '\\mathsfsl{N}': '\uD835\uDE15',
            '\\mathsfsl{O}': '\uD835\uDE16',
            '\\mathsfsl{P}': '\uD835\uDE17',
            '\\mathsfsl{Q}': '\uD835\uDE18',
            '\\mathsfsl{R}': '\uD835\uDE19',
            '\\mathsfsl{S}': '\uD835\uDE1A',
            '\\mathsfsl{T}': '\uD835\uDE1B',
            '\\mathsfsl{U}': '\uD835\uDE1C',
            '\\mathsfsl{V}': '\uD835\uDE1D',
            '\\mathsfsl{W}': '\uD835\uDE1E',
            '\\mathsfsl{X}': '\uD835\uDE1F',
            '\\mathsfsl{Y}': '\uD835\uDE20',
            '\\mathsfsl{Z}': '\uD835\uDE21',
            '\\mathsfsl{a}': '\uD835\uDE22',
            '\\mathsfsl{b}': '\uD835\uDE23',
            '\\mathsfsl{c}': '\uD835\uDE24',
            '\\mathsfsl{d}': '\uD835\uDE25',
            '\\mathsfsl{e}': '\uD835\uDE26',
            '\\mathsfsl{f}': '\uD835\uDE27',
            '\\mathsfsl{g}': '\uD835\uDE28',
            '\\mathsfsl{h}': '\uD835\uDE29',
            '\\mathsfsl{i}': '\uD835\uDE2A',
            '\\mathsfsl{j}': '\uD835\uDE2B',
            '\\mathsfsl{k}': '\uD835\uDE2C',
            '\\mathsfsl{l}': '\uD835\uDE2D',
            '\\mathsfsl{m}': '\uD835\uDE2E',
            '\\mathsfsl{n}': '\uD835\uDE2F',
            '\\mathsfsl{o}': '\uD835\uDE30',
            '\\mathsfsl{p}': '\uD835\uDE31',
            '\\mathsfsl{q}': '\uD835\uDE32',
            '\\mathsfsl{r}': '\uD835\uDE33',
            '\\mathsfsl{s}': '\uD835\uDE34',
            '\\mathsfsl{t}': '\uD835\uDE35',
            '\\mathsfsl{u}': '\uD835\uDE36',
            '\\mathsfsl{v}': '\uD835\uDE37',
            '\\mathsfsl{w}': '\uD835\uDE38',
            '\\mathsfsl{x}': '\uD835\uDE39',
            '\\mathsfsl{y}': '\uD835\uDE3A',
            '\\mathsfsl{z}': '\uD835\uDE3B',
            '\\mathsfbfsl{A}': '\uD835\uDE3C',
            '\\mathsfbfsl{B}': '\uD835\uDE3D',
            '\\mathsfbfsl{C}': '\uD835\uDE3E',
            '\\mathsfbfsl{D}': '\uD835\uDE3F',
            '\\mathsfbfsl{E}': '\uD835\uDE40',
            '\\mathsfbfsl{F}': '\uD835\uDE41',
            '\\mathsfbfsl{G}': '\uD835\uDE42',
            '\\mathsfbfsl{H}': '\uD835\uDE43',
            '\\mathsfbfsl{I}': '\uD835\uDE44',
            '\\mathsfbfsl{J}': '\uD835\uDE45',
            '\\mathsfbfsl{K}': '\uD835\uDE46',
            '\\mathsfbfsl{L}': '\uD835\uDE47',
            '\\mathsfbfsl{M}': '\uD835\uDE48',
            '\\mathsfbfsl{N}': '\uD835\uDE49',
            '\\mathsfbfsl{O}': '\uD835\uDE4A',
            '\\mathsfbfsl{P}': '\uD835\uDE4B',
            '\\mathsfbfsl{Q}': '\uD835\uDE4C',
            '\\mathsfbfsl{R}': '\uD835\uDE4D',
            '\\mathsfbfsl{S}': '\uD835\uDE4E',
            '\\mathsfbfsl{T}': '\uD835\uDE4F',
            '\\mathsfbfsl{U}': '\uD835\uDE50',
            '\\mathsfbfsl{V}': '\uD835\uDE51',
            '\\mathsfbfsl{W}': '\uD835\uDE52',
            '\\mathsfbfsl{X}': '\uD835\uDE53',
            '\\mathsfbfsl{Y}': '\uD835\uDE54',
            '\\mathsfbfsl{Z}': '\uD835\uDE55',
            '\\mathsfbfsl{a}': '\uD835\uDE56',
            '\\mathsfbfsl{b}': '\uD835\uDE57',
            '\\mathsfbfsl{c}': '\uD835\uDE58',
            '\\mathsfbfsl{d}': '\uD835\uDE59',
            '\\mathsfbfsl{e}': '\uD835\uDE5A',
            '\\mathsfbfsl{f}': '\uD835\uDE5B',
            '\\mathsfbfsl{g}': '\uD835\uDE5C',
            '\\mathsfbfsl{h}': '\uD835\uDE5D',
            '\\mathsfbfsl{i}': '\uD835\uDE5E',
            '\\mathsfbfsl{j}': '\uD835\uDE5F',
            '\\mathsfbfsl{k}': '\uD835\uDE60',
            '\\mathsfbfsl{l}': '\uD835\uDE61',
            '\\mathsfbfsl{m}': '\uD835\uDE62',
            '\\mathsfbfsl{n}': '\uD835\uDE63',
            '\\mathsfbfsl{o}': '\uD835\uDE64',
            '\\mathsfbfsl{p}': '\uD835\uDE65',
            '\\mathsfbfsl{q}': '\uD835\uDE66',
            '\\mathsfbfsl{r}': '\uD835\uDE67',
            '\\mathsfbfsl{s}': '\uD835\uDE68',
            '\\mathsfbfsl{t}': '\uD835\uDE69',
            '\\mathsfbfsl{u}': '\uD835\uDE6A',
            '\\mathsfbfsl{v}': '\uD835\uDE6B',
            '\\mathsfbfsl{w}': '\uD835\uDE6C',
            '\\mathsfbfsl{x}': '\uD835\uDE6D',
            '\\mathsfbfsl{y}': '\uD835\uDE6E',
            '\\mathsfbfsl{z}': '\uD835\uDE6F',
            '\\mathtt{A}': '\uD835\uDE70',
            '\\mathtt{B}': '\uD835\uDE71',
            '\\mathtt{C}': '\uD835\uDE72',
            '\\mathtt{D}': '\uD835\uDE73',
            '\\mathtt{E}': '\uD835\uDE74',
            '\\mathtt{F}': '\uD835\uDE75',
            '\\mathtt{G}': '\uD835\uDE76',
            '\\mathtt{H}': '\uD835\uDE77',
            '\\mathtt{I}': '\uD835\uDE78',
            '\\mathtt{J}': '\uD835\uDE79',
            '\\mathtt{K}': '\uD835\uDE7A',
            '\\mathtt{L}': '\uD835\uDE7B',
            '\\mathtt{M}': '\uD835\uDE7C',
            '\\mathtt{N}': '\uD835\uDE7D',
            '\\mathtt{O}': '\uD835\uDE7E',
            '\\mathtt{P}': '\uD835\uDE7F',
            '\\mathtt{Q}': '\uD835\uDE80',
            '\\mathtt{R}': '\uD835\uDE81',
            '\\mathtt{S}': '\uD835\uDE82',
            '\\mathtt{T}': '\uD835\uDE83',
            '\\mathtt{U}': '\uD835\uDE84',
            '\\mathtt{V}': '\uD835\uDE85',
            '\\mathtt{W}': '\uD835\uDE86',
            '\\mathtt{X}': '\uD835\uDE87',
            '\\mathtt{Y}': '\uD835\uDE88',
            '\\mathtt{Z}': '\uD835\uDE89',
            '\\mathtt{a}': '\uD835\uDE8A',
            '\\mathtt{b}': '\uD835\uDE8B',
            '\\mathtt{c}': '\uD835\uDE8C',
            '\\mathtt{d}': '\uD835\uDE8D',
            '\\mathtt{e}': '\uD835\uDE8E',
            '\\mathtt{f}': '\uD835\uDE8F',
            '\\mathtt{g}': '\uD835\uDE90',
            '\\mathtt{h}': '\uD835\uDE91',
            '\\mathtt{i}': '\uD835\uDE92',
            '\\mathtt{j}': '\uD835\uDE93',
            '\\mathtt{k}': '\uD835\uDE94',
            '\\mathtt{l}': '\uD835\uDE95',
            '\\mathtt{m}': '\uD835\uDE96',
            '\\mathtt{n}': '\uD835\uDE97',
            '\\mathtt{o}': '\uD835\uDE98',
            '\\mathtt{p}': '\uD835\uDE99',
            '\\mathtt{q}': '\uD835\uDE9A',
            '\\mathtt{r}': '\uD835\uDE9B',
            '\\mathtt{s}': '\uD835\uDE9C',
            '\\mathtt{t}': '\uD835\uDE9D',
            '\\mathtt{u}': '\uD835\uDE9E',
            '\\mathtt{v}': '\uD835\uDE9F',
            '\\mathtt{w}': '\uD835\uDEA0',
            '\\mathtt{x}': '\uD835\uDEA1',
            '\\mathtt{y}': '\uD835\uDEA2',
            '\\mathtt{z}': '\uD835\uDEA3',
            '\\mathbf{\\Alpha}': '\uD835\uDEC2',
            '\\mathbf{\\Beta}': '\uD835\uDEC3',
            '\\mathbf{\\Gamma}': '\uD835\uDEC4',
            '\\mathbf{\\Delta}': '\uD835\uDEC5',
            '\\mathbf{\\Epsilon}': '\uD835\uDEC6',
            '\\mathbf{\\Zeta}': '\uD835\uDEC7',
            '\\mathbf{\\Eta}': '\uD835\uDEC8',
            '\\mathbf{\\Theta}': '\uD835\uDEAF',
            '\\mathbf{\\Iota}': '\uD835\uDECA',
            '\\mathbf{\\Kappa}': '\uD835\uDECB',
            '\\mathbf{\\Lambda}': '\uD835\uDECC',
            '\\mathbf{\\Xi}': '\uD835\uDECF',
            '\\mathbf{\\Pi}': '\uD835\uDED1',
            '\\mathbf{\\Rho}': '\uD835\uDED2',
            '\\mathbf{\\vartheta}': '\uD835\uDEDD',
            '\\mathbf{\\Sigma}': '\uD835\uDED4',
            '\\mathbf{\\Tau}': '\uD835\uDED5',
            '\\mathbf{\\Upsilon}': '\uD835\uDED6',
            '\\mathbf{\\Phi}': '\uD835\uDED7',
            '\\mathbf{\\Chi}': '\uD835\uDED8',
            '\\mathbf{\\Psi}': '\uD835\uDED9',
            '\\mathbf{\\Omega}': '\uD835\uDEDA',
            '\\mathbf{\\nabla}': '\uD835\uDEC1',
            '\\mathbf{\\theta}': '\uD835\uDEC9',
            '\\mathbf{\\varsigma}': '\uD835\uDED3',
            '\\in': '\uD835\uDFC4',
            '\\mathbf{\\varkappa}': '\uD835\uDEDE',
            '\\mathbf{\\phi}': '\uD835\uDEDF',
            '\\mathbf{\\varrho}': '\uD835\uDEE0',
            '\\mathbf{\\varpi}': '\uD835\uDEE1',
            '\\mathmit{\\Alpha}': '\uD835\uDEFC',
            '\\mathmit{\\Beta}': '\uD835\uDEFD',
            '\\mathmit{\\Gamma}': '\uD835\uDEFE',
            '\\mathmit{\\Delta}': '\uD835\uDEFF',
            '\\mathmit{\\Epsilon}': '\uD835\uDF00',
            '\\mathmit{\\Zeta}': '\uD835\uDF01',
            '\\mathmit{\\Eta}': '\uD835\uDF02',
            '\\mathmit{\\Theta}': '\uD835\uDF03',
            '\\mathmit{\\Iota}': '\uD835\uDF04',
            '\\mathmit{\\Kappa}': '\uD835\uDF05',
            '\\mathmit{\\Lambda}': '\uD835\uDF06',
            '\\mathmit{\\Xi}': '\uD835\uDF09',
            '\\mathmit{\\Pi}': '\uD835\uDF0B',
            '\\mathmit{\\Rho}': '\uD835\uDF0C',
            '\\mathmit{\\vartheta}': '\uD835\uDF17',
            '\\mathmit{\\Sigma}': '\uD835\uDF0E',
            '\\mathmit{\\Tau}': '\uD835\uDF0F',
            '\\mathmit{\\Upsilon}': '\uD835\uDF10',
            '\\mathmit{\\Phi}': '\uD835\uDF11',
            '\\mathmit{\\Chi}': '\uD835\uDF12',
            '\\mathmit{\\Psi}': '\uD835\uDF13',
            '\\mathmit{\\Omega}': '\uD835\uDF14',
            '\\mathmit{\\nabla}': '\uD835\uDEFB',
            '\\mathmit{\\varsigma}': '\uD835\uDF0D',
            '\\mathmit{\\varkappa}': '\uD835\uDF18',
            '\\mathmit{\\phi}': '\uD835\uDF19',
            '\\mathmit{\\varrho}': '\uD835\uDF1A',
            '\\mathmit{\\varpi}': '\uD835\uDF1B',
            '\\mathbit{\\Alpha}': '\uD835\uDF36',
            '\\mathbit{\\Beta}': '\uD835\uDF37',
            '\\mathbit{\\Gamma}': '\uD835\uDF38',
            '\\mathbit{\\Delta}': '\uD835\uDF39',
            '\\mathbit{\\Epsilon}': '\uD835\uDF3A',
            '\\mathbit{\\Zeta}': '\uD835\uDF3B',
            '\\mathbit{\\Eta}': '\uD835\uDF3C',
            '\\mathbit{\\Theta}': '\uD835\uDF3D',
            '\\mathbit{\\Iota}': '\uD835\uDF3E',
            '\\mathbit{\\Kappa}': '\uD835\uDF3F',
            '\\mathbit{\\Lambda}': '\uD835\uDF40',
            '\\mathbit{\\Xi}': '\uD835\uDF43',
            '\\mathbit{\\Pi}': '\uD835\uDF45',
            '\\mathbit{\\Rho}': '\uD835\uDF46',
            '\\mathbit{\\Sigma}': '\uD835\uDF48',
            '\\mathbit{\\Tau}': '\uD835\uDF49',
            '\\mathbit{\\Upsilon}': '\uD835\uDF4A',
            '\\mathbit{\\Phi}': '\uD835\uDF4B',
            '\\mathbit{\\Chi}': '\uD835\uDF4C',
            '\\mathbit{\\Psi}': '\uD835\uDF4D',
            '\\mathbit{\\Omega}': '\uD835\uDF4E',
            '\\mathbit{\\nabla}': '\uD835\uDF35',
            '\\mathbit{\\varsigma}': '\uD835\uDF47',
            '\\mathbit{\\vartheta}': '\uD835\uDF51',
            '\\mathbit{\\varkappa}': '\uD835\uDF52',
            '\\mathbit{\\phi}': '\uD835\uDF53',
            '\\mathbit{\\varrho}': '\uD835\uDF54',
            '\\mathbit{\\varpi}': '\uD835\uDF55',
            '\\mathsfbf{\\Alpha}': '\uD835\uDF70',
            '\\mathsfbf{\\Beta}': '\uD835\uDF71',
            '\\mathsfbf{\\Gamma}': '\uD835\uDF72',
            '\\mathsfbf{\\Delta}': '\uD835\uDF73',
            '\\mathsfbf{\\Epsilon}': '\uD835\uDF74',
            '\\mathsfbf{\\Zeta}': '\uD835\uDF75',
            '\\mathsfbf{\\Eta}': '\uD835\uDF76',
            '\\mathsfbf{\\Theta}': '\uD835\uDF77',
            '\\mathsfbf{\\Iota}': '\uD835\uDF78',
            '\\mathsfbf{\\Kappa}': '\uD835\uDF79',
            '\\mathsfbf{\\Lambda}': '\uD835\uDF7A',
            '\\mathsfbf{\\Xi}': '\uD835\uDF7D',
            '\\mathsfbf{\\Pi}': '\uD835\uDF7F',
            '\\mathsfbf{\\Rho}': '\uD835\uDF80',
            '\\mathsfbf{\\vartheta}': '\uD835\uDF8B',
            '\\mathsfbf{\\Sigma}': '\uD835\uDF82',
            '\\mathsfbf{\\Tau}': '\uD835\uDF83',
            '\\mathsfbf{\\Upsilon}': '\uD835\uDF84',
            '\\mathsfbf{\\Phi}': '\uD835\uDF85',
            '\\mathsfbf{\\Chi}': '\uD835\uDF86',
            '\\mathsfbf{\\Psi}': '\uD835\uDF87',
            '\\mathsfbf{\\Omega}': '\uD835\uDF88',
            '\\mathsfbf{\\nabla}': '\uD835\uDF6F',
            '\\mathsfbf{\\varsigma}': '\uD835\uDF81',
            '\\mathsfbf{\\varkappa}': '\uD835\uDF8C',
            '\\mathsfbf{\\phi}': '\uD835\uDF8D',
            '\\mathsfbf{\\varrho}': '\uD835\uDF8E',
            '\\mathsfbf{\\varpi}': '\uD835\uDF8F',
            '\\mathsfbfsl{\\Alpha}': '\uD835\uDFAA',
            '\\mathsfbfsl{\\Beta}': '\uD835\uDFAB',
            '\\mathsfbfsl{\\Gamma}': '\uD835\uDFAC',
            '\\mathsfbfsl{\\Delta}': '\uD835\uDFAD',
            '\\mathsfbfsl{\\Epsilon}': '\uD835\uDFAE',
            '\\mathsfbfsl{\\Zeta}': '\uD835\uDFAF',
            '\\mathsfbfsl{\\Eta}': '\uD835\uDFB0',
            '\\mathsfbfsl{\\vartheta}': '\uD835\uDFC5',
            '\\mathsfbfsl{\\Iota}': '\uD835\uDFB2',
            '\\mathsfbfsl{\\Kappa}': '\uD835\uDFB3',
            '\\mathsfbfsl{\\Lambda}': '\uD835\uDFB4',
            '\\mathsfbfsl{\\Xi}': '\uD835\uDFB7',
            '\\mathsfbfsl{\\Pi}': '\uD835\uDFB9',
            '\\mathsfbfsl{\\Rho}': '\uD835\uDFBA',
            '\\mathsfbfsl{\\Sigma}': '\uD835\uDFBC',
            '\\mathsfbfsl{\\Tau}': '\uD835\uDFBD',
            '\\mathsfbfsl{\\Upsilon}': '\uD835\uDFBE',
            '\\mathsfbfsl{\\Phi}': '\uD835\uDFBF',
            '\\mathsfbfsl{\\Chi}': '\uD835\uDFC0',
            '\\mathsfbfsl{\\Psi}': '\uD835\uDFC1',
            '\\mathsfbfsl{\\Omega}': '\uD835\uDFC2',
            '\\mathsfbfsl{\\nabla}': '\uD835\uDFA9',
            '\\mathsfbfsl{\\varsigma}': '\uD835\uDFBB',
            '\\mathsfbfsl{\\varkappa}': '\uD835\uDFC6',
            '\\mathsfbfsl{\\phi}': '\uD835\uDFC7',
            '\\mathsfbfsl{\\varrho}': '\uD835\uDFC8',
            '\\mathsfbfsl{\\varpi}': '\uD835\uDFC9',
            '\\mathbf{0}': '\uD835\uDFCE',
            '\\mathbf{1}': '\uD835\uDFCF',
            '\\mathbf{2}': '\uD835\uDFD0',
            '\\mathbf{3}': '\uD835\uDFD1',
            '\\mathbf{4}': '\uD835\uDFD2',
            '\\mathbf{5}': '\uD835\uDFD3',
            '\\mathbf{6}': '\uD835\uDFD4',
            '\\mathbf{7}': '\uD835\uDFD5',
            '\\mathbf{8}': '\uD835\uDFD6',
            '\\mathbf{9}': '\uD835\uDFD7',
            '\\mathbb{0}': '\uD835\uDFD8',
            '\\mathbb{1}': '\uD835\uDFD9',
            '\\mathbb{2}': '\uD835\uDFDA',
            '\\mathbb{3}': '\uD835\uDFDB',
            '\\mathbb{4}': '\uD835\uDFDC',
            '\\mathbb{5}': '\uD835\uDFDD',
            '\\mathbb{6}': '\uD835\uDFDE',
            '\\mathbb{7}': '\uD835\uDFDF',
            '\\mathbb{8}': '\uD835\uDFE0',
            '\\mathbb{9}': '\uD835\uDFE1',
            '\\mathsf{0}': '\uD835\uDFE2',
            '\\mathsf{1}': '\uD835\uDFE3',
            '\\mathsf{2}': '\uD835\uDFE4',
            '\\mathsf{3}': '\uD835\uDFE5',
            '\\mathsf{4}': '\uD835\uDFE6',
            '\\mathsf{5}': '\uD835\uDFE7',
            '\\mathsf{6}': '\uD835\uDFE8',
            '\\mathsf{7}': '\uD835\uDFE9',
            '\\mathsf{8}': '\uD835\uDFEA',
            '\\mathsf{9}': '\uD835\uDFEB',
            '\\mathsfbf{0}': '\uD835\uDFEC',
            '\\mathsfbf{1}': '\uD835\uDFED',
            '\\mathsfbf{2}': '\uD835\uDFEE',
            '\\mathsfbf{3}': '\uD835\uDFEF',
            '\\mathsfbf{4}': '\uD835\uDFF0',
            '\\mathsfbf{5}': '\uD835\uDFF1',
            '\\mathsfbf{6}': '\uD835\uDFF2',
            '\\mathsfbf{7}': '\uD835\uDFF3',
            '\\mathsfbf{8}': '\uD835\uDFF4',
            '\\mathsfbf{9}': '\uD835\uDFF5',
            '\\mathtt{0}': '\uD835\uDFF6',
            '\\mathtt{1}': '\uD835\uDFF7',
            '\\mathtt{2}': '\uD835\uDFF8',
            '\\mathtt{3}': '\uD835\uDFF9',
            '\\mathtt{4}': '\uD835\uDFFA',
            '\\mathtt{5}': '\uD835\uDFFB',
            '\\mathtt{6}': '\uD835\uDFFC',
            '\\mathtt{7}': '\uD835\uDFFD',
            '\\mathtt{8}': '\uD835\uDFFE',
            '\\mathtt{9}': '\uD835\uDFFF',
            '\\dbend': '\xEF\xBF\xBD'
        }
    };
LaTeX.toUnicode['\\url'] = '';
LaTeX.toUnicode['\\href'] = '';
LaTeX.html2latexsupport = {
    html2latex: {
        sup: {
            open: '\\ensuremath{^{',
            close: '}}'
        },
        sub: {
            open: '\\ensuremath{_{',
            close: '}}'
        },
        i: {
            open: '\\emph{',
            close: '}'
        },
        b: {
            open: '\\textbf{',
            close: '}'
        },
        p: {
            open: '\n\n',
            close: '\n\n'
        },
        span: {
            open: '',
            close: ''
        },
        br: {
            open: '\n\n',
            close: '',
            empty: true
        },
        'break': {
            open: '\n\n',
            close: '',
            empty: true
        }
    },
    htmlstack: [],
    htmltag: function (str) {
        var close;
        var tag = str.replace(/[^a-z]/gi, '').toLowerCase();
        var repl = LaTeX.html2latexsupport.html2latex[tag];
        // not a '/' at position 2 means it's an opening tag
        if (str.charAt(1) != '/') {
            // only add tag to the stack if it is not a self-closing tag. Self-closing tags ought to have the second-to-last
            // character be a '/', but this is not a perfect world (loads of <br>'s out there, so tags that always *ought*
            // to be empty are treated as such, regardless of whether the obligatory closing slash is present or not.
            if (str.slice(-2, 1) != '/' && !repl.empty) {
                LaTeX.html2latexsupport.htmlstack.unshift(tag);
            }
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
        close = LaTeX.html2latexsupport.htmlstack.slice(0, close).map(function (tag$2) {
            return html2latex[tag$2].close;
        }).join('');
        LaTeX.html2latexsupport.htmlstack = LaTeX.html2latexsupport.htmlstack.slice(close + 1);
        return repl.close;
    },
    unicode: function (str) {
        var regex = LaTeX.regex[Translator.unicode ? 'unicode' : 'ascii'];
        return str.split(regex.math).map(function (text, i) {
            var latex = text.replace(regex.text, function (match) {
                    return LaTeX.toLaTeX[match] || match;
                });
            if (i % 2 == 1) {
                // odd element == splitter == block of math
                return '\\ensuremath{' + latex + '}';
            }
            return latex;
        }).join('');
    }
};
LaTeX.html2latex = function (str) {
    var tags = new RegExp('(' + Object.keys(LaTeX.html2latexsupport.html2latex).map(function (tag) {
            return '</?' + tag + '/?>';
        }).join('|') + ')', 'ig');
    return ('' + str).split(/(<pre>.*?<\/pre>)/gi).map(function (chunk, pre) {
        if (pre % 2 == 1) {
            // odd element = splitter == pre block
            return chunk.replace(/^<pre>/i, '').replace(/<\/pre>$/, '');
        } else {
            LaTeX.html2latexsupport.htmlstack = [];
            var res = chunk.split(tags).map(function (chunk$2, htmltag) {
                    if (htmltag % 2 == 1) {
                        // odd element = splitter == html tag
                        return LaTeX.html2latexsupport.htmltag(chunk$2);
                    } else {
                        return LaTeX.html2latexsupport.unicode(chunk$2);
                    }
                }).join('').replace(/{}\s+/g, ' ');
            if (LaTeX.html2latexsupport.htmlstack.length !== 0) {
                Translator.log('Unmatched HTML tags: ' + LaTeX.html2latexsupport.htmlstack.join(', '));
                res += htmlstack.map(function (tag) {
                    return LaTeX.html2latexsupport.html2latex[tag].close;
                }).join('');
            }
            return res;
        }
    }).join('');
};
Translator.fieldMap = function () {
    var init = {
            place: {
                name: 'address',
                protect: true,
                import: 'location'
            },
            section: {
                name: 'chapter',
                protect: true
            },
            edition: {
                name: 'edition',
                protect: true
            },
            type: { name: 'type' },
            series: {
                name: 'series',
                protect: true
            },
            title: {
                name: 'title',
                protect: true
            },
            volume: {
                name: 'volume',
                protect: true
            },
            rights: {
                name: 'copyright',
                protect: true
            },
            ISBN: { name: 'isbn' },
            ISSN: { name: 'issn' },
            callNumber: { name: 'lccn' },
            shortTitle: {
                name: 'shorttitle',
                protect: true
            },
            url: {
                name: 'url',
                escape: 'url'
            },
            DOI: {
                name: 'doi',
                escape: 'doi'
            },
            abstractNote: { name: 'abstract' },
            country: { name: 'nationality' },
            language: { name: 'language' },
            assignee: { name: 'assignee' },
            issue: { name: 'issue' },
            publicationTitle: { import: 'booktitle' },
            publisher: {
                import: [
                    'school',
                    'institution',
                    'publisher'
                ]
            }
        };
    var dict = Object.create(null);
    let dict$2 = init;
    let keys = Object.keys(dict$2);
    let length = keys.length;
    let index;
    for (index = 0; index < length; index++) {
        let key = keys[index];
        if (!dict$2.hasOwnProperty(key)) {
            continue;
        }
        let value = dict$2[key];
        dict[key] = value;
    }
    dict$2 = undefined;
    keys = undefined;
    return dict;
}();
Translator.typeMap = function () {
    var init = {
            'book booklet manual proceedings': 'book',
            'incollection inbook': 'bookSection',
            'article misc': 'journalArticle magazineArticle newspaperArticle',
            'phdthesis mastersthesis': 'thesis',
            'unpublished': 'manuscript',
            'patent': 'patent',
            'inproceedings conference': 'conferencePaper',
            'techreport': 'report',
            'misc': 'letter interview film artwork webpage'
        };
    var dict = Object.create(null);
    let dict$2 = init;
    let keys = Object.keys(dict$2);
    let length = keys.length;
    let index;
    for (index = 0; index < length; index++) {
        let key = keys[index];
        if (!dict$2.hasOwnProperty(key)) {
            continue;
        }
        let value = dict$2[key];
        dict[key] = value;
    }
    dict$2 = undefined;
    keys = undefined;
    return dict;
}();
/*
 * three-letter month abbreviations. I assume these are the same ones that the
 * docs say are defined in some appendix of the LaTeX book. (i don't have the
 * LaTeX book.)
*/
var months = [
        'jan',
        'feb',
        'mar',
        'apr',
        'may',
        'jun',
        'jul',
        'aug',
        'sep',
        'oct',
        'nov',
        'dec'
    ];
function doExport() {
    //Zotero.write('% BibTeX export generated by Zotero '+Zotero.Utilities.getVersion());
    // to make sure the BOM gets ignored
    Zotero.write('\n');
    let item = Translator.nextItem();
    while (item) {
        var ref = new Translator.Reference(item);
        ref.add({
            name: 'number',
            value: item.reportNumber || item.issue || item.seriesNumber || item.patentNumber
        });
        ref.add({
            name: 'urldate',
            value: item.accessDate && item.accessDate.replace(/\s*\d+:\d+:\d+/, '')
        });
        switch (item.itemType) {
        case 'bookSection':
        case 'conferencePaper':
            ref.add({
                name: 'booktitle',
                value: item.publicationTitle,
                protect: true
            });
            break;
        default:
            ref.add({
                name: 'journal',
                value: Translator.useJournalAbbreviation && Zotero.BetterBibTeX.keymanager.journalAbbrev(item) || item.publicationTitle,
                protect: true
            });
            break;
        }
        switch (item.itemType) {
        case 'thesis':
            ref.add({
                name: 'school',
                value: item.publisher,
                protect: true
            });
            break;
        case 'report':
            ref.add({
                name: 'institution',
                value: item.publisher,
                protect: true
            });
            break;
        default:
            ref.add({
                name: 'publisher',
                value: item.publisher,
                protect: true
            });
            break;
        }
        if (item.creators && item.creators.length) {
            // split creators into subcategories
            var authors = [];
            var editors = [];
            var translators = [];
            var collaborators = [];
            var primaryCreatorType = Zotero.Utilities.getCreatorsForType(item.itemType)[0];
            let creator;
            let items = item.creators;
            let length = items.length;
            let i;
            for (i = 0; i < length; i++) {
                creator = items[i];
                if (('' + creator.firstName).trim() !== '' && ('' + creator.lastName).trim() !== '') {
                    creatorString = creator.lastName + ', ' + creator.firstName;
                } else {
                    creatorString = String(creator.lastName);
                }
                switch (creator.creatorType) {
                case 'editor':
                case 'seriesEditor':
                    editors.push(creatorString);
                    break;
                case 'translator':
                    translators.push(creatorString);
                    break;
                case primaryCreatorType:
                    authors.push(creatorString);
                    break;
                default:
                    collaborators.push(creatorString);
                }
            }
            items = undefined;
            ref.add({
                name: 'author',
                value: authors,
                sep: ' and '
            });
            ref.add({
                name: 'editor',
                value: editors,
                sep: ' and '
            });
            ref.add({
                name: 'translator',
                value: translators,
                sep: ' and '
            });
            ref.add({
                name: 'collaborator',
                value: collaborators,
                sep: ' and '
            });
        }
        if (item.date) {
            var date = Zotero.Utilities.strToDate(item.date);
            if (typeof date.year === 'undefined') {
                ref.add({
                    name: 'year',
                    value: item.date,
                    protect: true
                });
            } else {
                // need to use non-localized abbreviation
                if (typeof date.month == 'number') {
                    ref.add({
                        name: 'month',
                        value: months[date.month],
                        braces: false
                    });
                }
                ref.add({
                    name: 'year',
                    value: date.year
                });
            }
        }
        ref.add({
            name: 'note',
            value: item.extra
        });
        ref.add({
            name: 'keywords',
            value: item.tags,
            escape: 'tags'
        });
        ref.add({
            name: 'pages',
            value: item.pages && item.pages.replace(/[-\u2012-\u2015\u2053]+/g, '--')
        });
        // Commented out, because we don't want a books number of pages in the BibTeX "pages" field for books.
        //if (item.numPages) {
        //  writeField('pages', latex_escape(item.numPages));
        //}
        /* We'll prefer url over howpublished see
    https://forums.zotero.org/discussion/24554/bibtex-doubled-url/#Comment_157802

    if (item.itemType == 'webpage') {
      writeField('howpublished', item.url);
    }*/
        if (item.notes && Translator.exportNotes) {
            let note;
            let items$2 = item.notes;
            let length$2 = items$2.length;
            let i$2;
            for (i$2 = 0; i$2 < length$2; i$2++) {
                note = items$2[i$2];
                ref.add({
                    name: 'annote',
                    value: Zotero.Utilities.unescapeHTML(note.note)
                });
            }
            items$2 = undefined;
        }
        ref.add({
            name: 'file',
            value: item.attachments,
            escape: 'attachments'
        });
        ref.complete();
        item = Translator.nextItem();
    }
    Translator.exportGroups();
    Zotero.write('\n');
}
function addToExtra(item, str) {
    if (item.extra && item.extra !== '') {
        item.extra += ' \n' + str;
    } else {
        item.extra = str;
    }
}
function addToExtraData(data, key, value) {
    data.push(key.replace(/[=;]/g, '#') + '=' + value.replace(/[\r\n]+/g, ' ').replace(/[=;]g/, '#'));
}
var fieldMap = null;
function createZoteroReference(bibtexitem) {
    if (!fieldMap) {
        let dict = Translator.fieldMap;
        let keys = Object.keys(dict);
        let length = keys.length;
        let index;
        for (index = 0; index < length; index++) {
            let attr = keys[index];
            if (!dict.hasOwnProperty(attr)) {
                continue;
            }
            let field = dict[attr];
            var fields = [];
            if (field.name) {
                fields.push(name);
            }
            if (field.import) {
                fields = fields.concat(field.import);
            }
            let f;
            let items = fields;
            let length$2 = items.length;
            let i;
            for (i = 0; i < length$2; i++) {
                f = items[i];
                if (!fieldMap[f]) {
                    fieldMap[f] = attr;
                }
            }
            items = undefined;
        }
        dict = undefined;
        keys = undefined;
    }
    var type = Zotero.Utilities.trimInternal(bibtexitem.__type__.toLowerCase());
    if (bibtexitem.type) {
        type = Zotero.Utilities.trimInternal(bibtexitem.type.toLowerCase());
    }
    type = Translator.typeMap.BibTeX2Zotero[type] || 'journalArticle';
    var item = new Zotero.Item(type);
    item.itemID = bibtexitem.__key__;
    if (bibtexitem.__note__) {
        item.notes.push({
            note: ('The following fields were not imported:<br/>' + bibtexitem.__note__).trim(),
            tags: ['#BBT Import']
        });
    }
    function keywordClean(k) {
        return k.replace(/^[\s{]+|[}\s]+$/gm, '').trim();
    }
    var biblatexdata = [];
    let dict$2 = bibtexitem;
    let keys$2 = Object.keys(dict$2);
    let length$3 = keys$2.length;
    let index$2;
    for (index$2 = 0; index$2 < length$3; index$2++) {
        let field = keys$2[index$2];
        if (!dict$2.hasOwnProperty(field)) {
            continue;
        }
        let value = dict$2[field];
        if ([
                '__note__',
                '__key__',
                '__type__',
                'type',
                'added-at',
                'timestamp'
            ].indexOf(field) >= 0) {
            continue;
        }
        if (!value) {
            continue;
        }
        if (typeof value == 'string') {
            value = Zotero.Utilities.trim(value);
        }
        if (value === '') {
            continue;
        }
        if (fieldMap[field]) {
            item[fieldMap[field]] = value;
        } else if (field == 'journal') {
            if (item.publicationTitle) {
                item.journalAbbreviation = value;
            } else {
                item.publicationTitle = value;
            }
        } else if (field == 'fjournal') {
            if (item.publicationTitle) {
                // move publicationTitle to abbreviation
                item.journalAbbreviation = item.publicationTitle;
            }
            item.publicationTitle = value;
        } else if (field == 'author' || field == 'editor' || field == 'translator') {
            let creator;
            let items$2 = value;
            let length$4 = items$2.length;
            let i$2;
            for (i$2 = 0; i$2 < length$4; i$2++) {
                creator = items$2[i$2];
                if (!creator) {
                    continue;
                }
                if (typeof creator == 'string') {
                    creator = Zotero.Utilities.cleanAuthor(creator, field, false);
                } else {
                    creator.creatorType = field;
                }
                item.creators.push(creator);
            }
            items$2 = undefined;
            ;
        } else if (field == 'institution' || field == 'organization') {
            item.backupPublisher = value;
        } else if (field == 'number') {
            // fix for techreport
            if (item.itemType == 'report') {
                item.reportNumber = value;
            } else if (item.itemType == 'book' || item.itemType == 'bookSection') {
                item.seriesNumber = value;
            } else if (item.itemType == 'patent') {
                item.patentNumber = value;
            } else {
                item.issue = value;
            }
        } else if (field == 'month') {
            var monthIndex = months.indexOf(value.toLowerCase());
            if (monthIndex >= 0) {
                value = Zotero.Utilities.formatDate({ month: monthIndex });
            } else {
                value += ' ';
            }
            if (item.date) {
                if (value.indexOf(item.date) >= 0) {
                    // value contains year and more
                    item.date = value;
                } else {
                    item.date = value + item.date;
                }
            } else {
                item.date = value;
            }
        } else if (field == 'year') {
            if (item.date) {
                if (item.date.indexOf(value) < 0) {
                    // date does not already contain year
                    item.date += value;
                }
            } else {
                item.date = value;
            }
        } else if (field == 'date') {
            //We're going to assume that 'date' and the date parts don't occur together. If they do, we pick date, which should hold all.
            item.date = value;
        } else if (field == 'pages') {
            if (item.itemType == 'book' || item.itemType == 'thesis' || item.itemType == 'manuscript') {
                item.numPages = value;
            } else {
                item.pages = value.replace(/--/g, '-');
            }
        } else if (field == 'note') {
            addToExtra(item, value);
        } else if (field == 'howpublished') {
            if (/^(https?:\/\/|mailto:)/i.test(value)) {
                item.url = value;
            } else {
                addToExtraData(biblatexdata, field, value);
            }
        }    //accept lastchecked or urldate for access date. These should never both occur. 
             //If they do we don't know which is better so we might as well just take the second one
        else if (field == 'lastchecked' || field == 'urldate') {
            item.accessDate = value;
        } else if (field == 'keywords' || field == 'keyword') {
            var kw = value.split(/[,;]/);
            if (kw.length == 1) {
                kw = value.split(/\s+/);
            }
            item.tags = kw.map(keywordClean);
        } else if (field == 'comment' || field == 'annote' || field == 'review' || field == 'notes') {
            item.notes.push({ note: Zotero.Utilities.text2html(value) });
        } else if (field == 'file') {
            let att;
            let items$3 = value;
            let length$5 = items$3.length;
            let i$3;
            for (i$3 = 0; i$3 < length$5; i$3++) {
                att = items$3[i$3];
                item.attachments.push(att);
            }
            items$3 = undefined;
        } else {
            addToExtraData(biblatexdata, field, value);
        }
    }
    dict$2 = undefined;
    keys$2 = undefined;
    if (item.itemType == 'conferencePaper' && item.publicationTitle && !item.proceedingsTitle) {
        item.proceedingsTitle = item.publicationTitle;
        delete item.publicationTitle;
    }
    addToExtra(item, 'bibtex: ' + item.itemID);
    if (biblatexdata.length > 0) {
        biblatexdata.sort();
        addToExtra(item, 'biblatexdata[' + biblatexdata.join(';') + ']');
    }
    if (!item.publisher && item.backupPublisher) {
        item.publisher = item.backupPublisher;
        delete item.backupPublisher;
    }
    item.complete();
    return item;
}
BetterBibTeXParser = function () {
    /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */
    function peg$subclass(child, parent) {
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
    }
    function SyntaxError(message, expected, found, offset, line, column) {
        this.message = message;
        this.expected = expected;
        this.found = found;
        this.offset = offset;
        this.line = line;
        this.column = column;
        this.name = 'SyntaxError';
    }
    peg$subclass(SyntaxError, Error);
    function parse(input) {
        var options = arguments.length > 1 ? arguments[1] : {}, peg$FAILED = {}, peg$startRuleFunctions = { start: peg$parsestart }, peg$startRuleFunction = peg$parsestart, peg$c0 = [], peg$c1 = function (entries) {
                return bibtex;
            }, peg$c2 = peg$FAILED, peg$c3 = '@comment', peg$c4 = {
                type: 'literal',
                value: '@comment',
                description: '"@comment"'
            }, peg$c5 = '{', peg$c6 = {
                type: 'literal',
                value: '{',
                description: '"{"'
            }, peg$c7 = '}', peg$c8 = {
                type: 'literal',
                value: '}',
                description: '"}"'
            }, peg$c9 = function (comment) {
                bibtex.comments.push(flatten(comment).trim());
            }, peg$c10 = '@string', peg$c11 = {
                type: 'literal',
                value: '@string',
                description: '"@string"'
            }, peg$c12 = function (str) {
                bibtex.strings[str.key] = str.value;
            }, peg$c13 = '@preamble', peg$c14 = {
                type: 'literal',
                value: '@preamble',
                description: '"@preamble"'
            }, peg$c15 = '@', peg$c16 = {
                type: 'literal',
                value: '@',
                description: '"@"'
            }, peg$c17 = /^[^@]/, peg$c18 = {
                type: 'class',
                value: '[^@]',
                description: '[^@]'
            }, peg$c19 = function (other) {
                bibtex.comments.push(flatten(other).trim());
            }, peg$c20 = ',', peg$c21 = {
                type: 'literal',
                value: ',',
                description: '","'
            }, peg$c22 = function (type, id, fields) {
                if (fields.length == 0) {
                    error('@' + type + '{' + id + ',}');
                } else {
                    var ref = function () {
                            var init = {
                                    '__type__': type.toLowerCase(),
                                    '__key__': id
                                };
                            var dict = Object.create(null);
                            let dict$2 = init;
                            let keys = Object.keys(dict$2);
                            let length$2 = keys.length;
                            let index;
                            for (index = 0; index < length$2; index++) {
                                let key = keys[index];
                                if (!dict$2.hasOwnProperty(key)) {
                                    continue;
                                }
                                let value = dict$2[key];
                                dict[key] = value;
                            }
                            dict$2 = undefined;
                            keys = undefined;
                            return dict;
                        }();
                    let field;
                    let items = fields;
                    let length = items.length;
                    let i;
                    for (i = 0; i < length; i++) {
                        field = items[i];
                        if (field.value && field.value != '') {
                            switch (field.type) {
                            case 'file':
                                var attachments;
                                if (ref.file) {
                                    attachments = ref.file;
                                } else {
                                    attachments = [];
                                }
                                ref.file = attachments.concat(field.value);
                                break;
                            case 'creator':
                                if (field.value.length > 0) {
                                    ref[field.key] = field.value;
                                }
                                break;
                            default:
                                if (ref[field.key]) {
                                    // duplicate fields are not supposed to occur I think
                                    var note;
                                    if (ref.__note__) {
                                        note = ref.__note__ + '<br/>\n';
                                    } else {
                                        note = '';
                                    }
                                    ref.__note__ = note + field.key + '=' + field.value;
                                } else {
                                    ref[field.key] = field.value;
                                }
                                break;
                            }
                        }
                    }
                    items = undefined;
                    bibtex.references.push(ref);
                }
            }, peg$c23 = function (err) {
                error('@' + flatten(err));
            }, peg$c24 = /^[a-zA-Z]/, peg$c25 = {
                type: 'class',
                value: '[a-zA-Z]',
                description: '[a-zA-Z]'
            }, peg$c26 = function (chars) {
                return flatten(chars);
            }, peg$c27 = /^[^,]/, peg$c28 = {
                type: 'class',
                value: '[^,]',
                description: '[^,]'
            }, peg$c29 = function (str) {
                return flatten(str);
            }, peg$c30 = '=', peg$c31 = {
                type: 'literal',
                value: '=',
                description: '"="'
            }, peg$c32 = null, peg$c33 = function (key, val) {
                return {
                    key: 'file',
                    type: 'file',
                    value: filterattachments(val || [], key)
                };
            }, peg$c34 = function (key, val) {
                return {
                    key: key.toLowerCase(),
                    type: 'creator',
                    value: Creators.parse(val)
                };
            }, peg$c35 = 'sentelink', peg$c36 = {
                type: 'literal',
                value: 'sentelink',
                description: '"sentelink"'
            }, peg$c37 = 'file', peg$c38 = {
                type: 'literal',
                value: 'file',
                description: '"file"'
            }, peg$c39 = 'pdf', peg$c40 = {
                type: 'literal',
                value: 'pdf',
                description: '"pdf"'
            }, peg$c41 = 'path', peg$c42 = {
                type: 'literal',
                value: 'path',
                description: '"path"'
            }, peg$c43 = 'author', peg$c44 = {
                type: 'literal',
                value: 'author',
                description: '"author"'
            }, peg$c45 = 'editor', peg$c46 = {
                type: 'literal',
                value: 'editor',
                description: '"editor"'
            }, peg$c47 = 'translator', peg$c48 = {
                type: 'literal',
                value: 'translator',
                description: '"translator"'
            }, peg$c49 = function (val) {
                return val;
            }, peg$c50 = '"', peg$c51 = {
                type: 'literal',
                value: '"',
                description: '"\\""'
            }, peg$c52 = function (key) {
                return key.toLowerCase() == 'url';
            }, peg$c53 = void 0, peg$c54 = function (key, val) {
                return {
                    key: key.trim().toLowerCase(),
                    value: val.trim()
                };
            }, peg$c55 = /^[^ \t\n\r=]/, peg$c56 = {
                type: 'class',
                value: '[^ \\t\\n\\r=]',
                description: '[^ \\t\\n\\r=]'
            }, peg$c57 = function (key) {
                return flatten(key);
            }, peg$c58 = /^[^#"{} \t\n\r,]/, peg$c59 = {
                type: 'class',
                value: '[^#"{} \\t\\n\\r,]',
                description: '[^#"{} \\t\\n\\r,]'
            }, peg$c60 = function (val) {
                val = flatten(val);
                return bibtex.strings[val] || val;
            }, peg$c61 = function (val) {
                return flatten(val);
            }, peg$c62 = '#', peg$c63 = {
                type: 'literal',
                value: '#',
                description: '"#"'
            }, peg$c64 = /^[^"]/, peg$c65 = {
                type: 'class',
                value: '[^"]',
                description: '[^"]'
            }, peg$c66 = function () {
                delete bibtex.quote;
                return true;
            }, peg$c67 = function (val) {
                delete bibtex.quote;
                return true;
            }, peg$c68 = function () {
                bibtex.quote = '"';
                return true;
            }, peg$c69 = function (text$2) {
                return text$2;
            }, peg$c70 = '\\\\', peg$c71 = {
                type: 'literal',
                value: '\\\\',
                description: '"\\\\\\\\"'
            }, peg$c72 = function () {
                return '\n';
            }, peg$c73 = /^[[\]]/, peg$c74 = {
                type: 'class',
                value: '[[\\]]',
                description: '[[\\]]'
            }, peg$c75 = function (bracket) {
                return bracket;
            }, peg$c76 = '\\', peg$c77 = {
                type: 'literal',
                value: '\\',
                description: '"\\\\"'
            }, peg$c78 = /^[~]/, peg$c79 = {
                type: 'class',
                value: '[~]',
                description: '[~]'
            }, peg$c80 = function (text$2) {
                return ' ';
            }, peg$c81 = /^[#$&]/, peg$c82 = {
                type: 'class',
                value: '[#$&]',
                description: '[#$&]'
            }, peg$c83 = function () {
                return '';
            }, peg$c84 = '_', peg$c85 = {
                type: 'literal',
                value: '_',
                description: '"_"'
            }, peg$c86 = function (text$2) {
                return '<sub>' + text$2 + '</sub>';
            }, peg$c87 = '^', peg$c88 = {
                type: 'literal',
                value: '^',
                description: '"^"'
            }, peg$c89 = function (text$2) {
                return '<sup>' + text$2 + '</sup>';
            }, peg$c90 = '\\emph', peg$c91 = {
                type: 'literal',
                value: '\\emph',
                description: '"\\\\emph"'
            }, peg$c92 = function (text$2) {
                return '<i>' + text$2 + '</i>';
            }, peg$c93 = '\\url{', peg$c94 = {
                type: 'literal',
                value: '\\url{',
                description: '"\\\\url{"'
            }, peg$c95 = function (text$2) {
                return flatten(text$2);
            }, peg$c96 = '\\textit', peg$c97 = {
                type: 'literal',
                value: '\\textit',
                description: '"\\\\textit"'
            }, peg$c98 = '\\textbf', peg$c99 = {
                type: 'literal',
                value: '\\textbf',
                description: '"\\\\textbf"'
            }, peg$c100 = function (text$2) {
                return '<b>' + text$2 + '</b>';
            }, peg$c101 = '\\textsc', peg$c102 = {
                type: 'literal',
                value: '\\textsc',
                description: '"\\\\textsc"'
            }, peg$c103 = function (text$2) {
                return '<span style="small-caps">' + text$2 + '</span>';
            }, peg$c104 = function (text$2) {
                return new String(flatten(text$2));
            }, peg$c105 = '$', peg$c106 = {
                type: 'literal',
                value: '$',
                description: '"$"'
            }, peg$c107 = '%', peg$c108 = {
                type: 'literal',
                value: '%',
                description: '"%"'
            }, peg$c109 = function () {
                return '%';
            }, peg$c110 = /^[^a-z]/, peg$c111 = {
                type: 'class',
                value: '[^a-z]',
                description: '[^a-z]'
            }, peg$c112 = '[', peg$c113 = {
                type: 'literal',
                value: '[',
                description: '"["'
            }, peg$c114 = ']', peg$c115 = {
                type: 'literal',
                value: ']',
                description: '"]"'
            }, peg$c116 = function (cmd, param) {
                /* single-char command */
                var cmds = ['\\' + cmd + param];
                if (param.length == 1) {
                    cmds.push('\\' + cmd + '{' + param + '}');
                }
                if (param.length == 3 && param[0] == '{' && param[2] == '}') {
                    cmds.push('\\' + cmd + param[2]);
                }
                var match = null;
                let cmd;
                let items = cmds;
                let length = items.length;
                let i;
                for (i = 0; i < length; i++) {
                    cmd = items[i];
                    match = match || LaTeX.toUnicode[cmd];
                }
                items = undefined;
                return match || param;
            }, peg$c117 = function (cmd) {
                /* single-char command without parameter*/
                if (LaTeX.toUnicode['\\' + cmd]) {
                    return LaTeX.toUnicode['\\' + cmd];
                }
                return cmd;
            }, peg$c118 = function (cmd, text$2) {
                /* command */
                return (LaTeX.toUnicode['\\' + cmd] || '') + flatten(text$2);
            }, peg$c119 = function (cmd) {
                /* bare command */
                if (LaTeX.toUnicode['\\' + cmd]) {
                    return LaTeX.toUnicode['\\' + cmd];
                }
                return cmd;
            }, peg$c120 = /^[^\\{]/, peg$c121 = {
                type: 'class',
                value: '[^\\\\{]',
                description: '[^\\\\{]'
            }, peg$c122 = {
                type: 'any',
                description: 'any character'
            }, peg$c123 = function () {
                return bibtex.quote == '"';
            }, peg$c124 = function () {
                return '"';
            }, peg$c125 = /^[#$%&_\^[\]{}]/, peg$c126 = {
                type: 'class',
                value: '[#$%&_\\^[\\]{}]',
                description: '[#$%&_\\^[\\]{}]'
            }, peg$c127 = /^[^\\{}]/, peg$c128 = {
                type: 'class',
                value: '[^\\\\{}]',
                description: '[^\\\\{}]'
            }, peg$c129 = function () {
                return bibtex.quote == '"';
            }, peg$c130 = /^[^ "\t\n\r#$%&~_\^{}[\]\\]/, peg$c131 = {
                type: 'class',
                value: '[^ "\\t\\n\\r#$%&~_\\^{}[\\]\\\\]',
                description: '[^ "\\t\\n\\r#$%&~_\\^{}[\\]\\\\]'
            }, peg$c132 = function () {
                return bibtex.quote != '"';
            }, peg$c133 = /^[^ \t\n\r#$%&~_\^{}[\]\\]/, peg$c134 = {
                type: 'class',
                value: '[^ \\t\\n\\r#$%&~_\\^{}[\\]\\\\]',
                description: '[^ \\t\\n\\r#$%&~_\\^{}[\\]\\\\]'
            }, peg$c135 = function (car, cdr) {
                return [car].concat(cdr || []);
            }, peg$c136 = ';', peg$c137 = {
                type: 'literal',
                value: ';',
                description: '";"'
            }, peg$c138 = function (att) {
                return att;
            }, peg$c139 = function (parts) {
                parts = parts || [];
                parts = (parts || []).map(function (v) {
                    return v.trim();
                });
                switch (parts.length) {
                case 0:
                    return {};
                case 1:
                    parts = {
                        title: '',
                        path: parts[0],
                        mimeType: ''
                    };
                    break;
                case 2:
                    parts = {
                        title: parts[0],
                        path: parts[1],
                        mimeType: ''
                    };
                    break;
                default:
                    parts = {
                        title: parts[0],
                        path: parts[1],
                        mimeType: parts[2]
                    };
                    break;
                }
                parts.title = parts.title && parts.title != '' ? parts.title : 'Attachment';
                parts.mimeType = parts.mimeType && parts.mimeType.match(/pdf/i) ? 'application/pdf' : null;
                parts.path = parts.path.replace(/\\/g, '/');
                if (parts.path.match(/^[a-z]:\//i)) {
                    parts.path = 'file:///' + parts.path;
                }
                if (parts.path.match(/^\/\//)) {
                    parts.path = 'file:' + parts.path;
                }
                return parts;
            }, peg$c140 = ':', peg$c141 = {
                type: 'literal',
                value: ':',
                description: '":"'
            }, peg$c142 = function (part) {
                return part;
            }, peg$c143 = function (part) {
                return part || '';
            }, peg$c144 = /^[^\\{}:;]/, peg$c145 = {
                type: 'class',
                value: '[^\\\\{}:;]',
                description: '[^\\\\{}:;]'
            }, peg$c146 = 'jabref-meta:', peg$c147 = {
                type: 'literal',
                value: 'jabref-meta:',
                description: '"jabref-meta:"'
            }, peg$c148 = 'groupstree:', peg$c149 = {
                type: 'literal',
                value: 'groupstree:',
                description: '"groupstree:"'
            }, peg$c150 = function (id, groups) {
                var levels = Object.create(null);
                var collections = [];
                let group;
                let items = groups;
                let length = items.length;
                let i;
                for (i = 0; i < length; i++) {
                    group = items[i];
                    if (!group) {
                        return;
                    }
                    var collection = Object.create(null);
                    collection.name = group.data.shift();
                    var intersection = group.data.shift();
                    collection.items = group.data.filter(function (key) {
                        return key !== '';
                    });
                    collection.collections = [];
                    levels[group.level] = collection;
                    if (group.level === 1) {
                        collections.push(collection);
                    } else {
                        levels[group.level - 1].collections.push(collection);
                        switch (intersection) {
                        case '0':
                            // independent
                            break;
                        case '1':
                            // intersection
                            collection.items = collection.items.filter(function (key) {
                                levels[group.level - 1].items.indexOf(key) >= 0;
                            });
                            break;
                        case '2':
                            // union
                            collection.items = levels[group.level - 1].items.concat(collection.items).filter(function (value, index, self) {
                                return self.indexOf(value) === index;
                            });
                            break;
                        }
                    }
                    ;
                }
                items = undefined;
                bibtex.collections = bibtex.collections.concat(collections);
            }, peg$c151 = /^[0-9]/, peg$c152 = {
                type: 'class',
                value: '[0-9]',
                description: '[0-9]'
            }, peg$c153 = 'allentriesgroup:;', peg$c154 = {
                type: 'literal',
                value: 'AllEntriesGroup:;',
                description: '"AllEntriesGroup:;"'
            }, peg$c155 = function () {
                return null;
            }, peg$c156 = 'ExplicitGroup:', peg$c157 = {
                type: 'literal',
                value: 'ExplicitGroup:',
                description: '"ExplicitGroup:"'
            }, peg$c158 = function (level, group) {
                return {
                    level: parseInt(level),
                    data: group
                };
            }, peg$c159 = /^[\r\n]/, peg$c160 = {
                type: 'class',
                value: '[\\r\\n]',
                description: '[\\r\\n]'
            }, peg$c161 = function (elt) {
                return elt;
            }, peg$c162 = function (chars) {
                return chars.join('');
            }, peg$c163 = function (char) {
                return char;
            }, peg$c164 = /^[^\\;\r\n]/, peg$c165 = {
                type: 'class',
                value: '[^\\\\;\\r\\n]',
                description: '[^\\\\;\\r\\n]'
            }, peg$c166 = /^[ \t\n\r]/, peg$c167 = {
                type: 'class',
                value: '[ \\t\\n\\r]',
                description: '[ \\t\\n\\r]'
            }, peg$currPos = 0, peg$reportedPos = 0, peg$cachedPos = 0, peg$cachedPosDetails = {
                line: 1,
                column: 1,
                seenCR: false
            }, peg$maxFailPos = 0, peg$maxFailExpected = [], peg$silentFails = 0, peg$result;
        if ('startRule' in options) {
            if (!(options.startRule in peg$startRuleFunctions)) {
                throw new Error('Can\'t start parsing from rule "' + options.startRule + '".');
            }
            peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
        }
        function text() {
            return input.substring(peg$reportedPos, peg$currPos);
        }
        function offset() {
            return peg$reportedPos;
        }
        function line() {
            return peg$computePosDetails(peg$reportedPos).line;
        }
        function column() {
            return peg$computePosDetails(peg$reportedPos).column;
        }
        function expected(description) {
            throw peg$buildException(null, [{
                    type: 'other',
                    description: description
                }], peg$reportedPos);
        }
        function error(message) {
            throw peg$buildException(message, null, peg$reportedPos);
        }
        function peg$computePosDetails(pos) {
            function advance(details, startPos, endPos) {
                var p, ch;
                for (p = startPos; p < endPos; p++) {
                    ch = input.charAt(p);
                    if (ch === '\n') {
                        if (!details.seenCR) {
                            details.line++;
                        }
                        details.column = 1;
                        details.seenCR = false;
                    } else if (ch === '\r' || ch === '\u2028' || ch === '\u2029') {
                        details.line++;
                        details.column = 1;
                        details.seenCR = true;
                    } else {
                        details.column++;
                        details.seenCR = false;
                    }
                }
            }
            if (peg$cachedPos !== pos) {
                if (peg$cachedPos > pos) {
                    peg$cachedPos = 0;
                    peg$cachedPosDetails = {
                        line: 1,
                        column: 1,
                        seenCR: false
                    };
                }
                advance(peg$cachedPosDetails, peg$cachedPos, pos);
                peg$cachedPos = pos;
            }
            return peg$cachedPosDetails;
        }
        function peg$fail(expected$2) {
            if (peg$currPos < peg$maxFailPos) {
                return;
            }
            if (peg$currPos > peg$maxFailPos) {
                peg$maxFailPos = peg$currPos;
                peg$maxFailExpected = [];
            }
            peg$maxFailExpected.push(expected$2);
        }
        function peg$buildException(message, expected$2, pos) {
            function cleanupExpected(expected$3) {
                var i = 1;
                expected$3.sort(function (a, b) {
                    if (a.description < b.description) {
                        return -1;
                    } else if (a.description > b.description) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                while (i < expected$3.length) {
                    if (expected$3[i - 1] === expected$3[i]) {
                        expected$3.splice(i, 1);
                    } else {
                        i++;
                    }
                }
            }
            function buildMessage(expected$3, found$2) {
                function stringEscape(s) {
                    function hex(ch) {
                        return ch.charCodeAt(0).toString(16).toUpperCase();
                    }
                    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\x08/g, '\\b').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\f/g, '\\f').replace(/\r/g, '\\r').replace(/[\x00-\x07\x0B\x0E\x0F]/g, function (ch) {
                        return '\\x0' + hex(ch);
                    }).replace(/[\x10-\x1F\x80-\xFF]/g, function (ch) {
                        return '\\x' + hex(ch);
                    }).replace(/[\u0180-\u0FFF]/g, function (ch) {
                        return '\\u0' + hex(ch);
                    }).replace(/[\u1080-\uFFFF]/g, function (ch) {
                        return '\\u' + hex(ch);
                    });
                }
                var expectedDescs = new Array(expected$3.length), expectedDesc, foundDesc, i;
                for (i = 0; i < expected$3.length; i++) {
                    expectedDescs[i] = expected$3[i].description;
                }
                expectedDesc = expected$3.length > 1 ? expectedDescs.slice(0, -1).join(', ') + ' or ' + expectedDescs[expected$3.length - 1] : expectedDescs[0];
                foundDesc = found$2 ? '"' + stringEscape(found$2) + '"' : 'end of input';
                return 'Expected ' + expectedDesc + ' but ' + foundDesc + ' found.';
            }
            var posDetails = peg$computePosDetails(pos), found = pos < input.length ? input.charAt(pos) : null;
            if (expected$2 !== null) {
                cleanupExpected(expected$2);
            }
            return new SyntaxError(message !== null ? message : buildMessage(expected$2, found), expected$2, found, pos, posDetails.line, posDetails.column);
        }
        function peg$parsestart() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parseentry();
            while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$parseentry();
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c1(s1);
            }
            s0 = s1;
            return s0;
        }
        function peg$parseentry() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parse_();
            while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$parse_();
            }
            if (s1 !== peg$FAILED) {
                if (input.substr(peg$currPos, 8).toLowerCase() === peg$c3) {
                    s2 = input.substr(peg$currPos, 8);
                    peg$currPos += 8;
                } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c4);
                    }
                }
                if (s2 !== peg$FAILED) {
                    s3 = [];
                    s4 = peg$parse_();
                    while (s4 !== peg$FAILED) {
                        s3.push(s4);
                        s4 = peg$parse_();
                    }
                    if (s3 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 123) {
                            s4 = peg$c5;
                            peg$currPos++;
                        } else {
                            s4 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c6);
                            }
                        }
                        if (s4 !== peg$FAILED) {
                            s5 = peg$parsegroupstree();
                            if (s5 !== peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 125) {
                                    s6 = peg$c7;
                                    peg$currPos++;
                                } else {
                                    s6 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$c8);
                                    }
                                }
                                if (s6 !== peg$FAILED) {
                                    s1 = [
                                        s1,
                                        s2,
                                        s3,
                                        s4,
                                        s5,
                                        s6
                                    ];
                                    s0 = s1;
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = [];
                s2 = peg$parse_();
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    s2 = peg$parse_();
                }
                if (s1 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c3) {
                        s2 = input.substr(peg$currPos, 8);
                        peg$currPos += 8;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c4);
                        }
                    }
                    if (s2 !== peg$FAILED) {
                        s3 = [];
                        s4 = peg$parse_();
                        while (s4 !== peg$FAILED) {
                            s3.push(s4);
                            s4 = peg$parse_();
                        }
                        if (s3 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 123) {
                                s4 = peg$c5;
                                peg$currPos++;
                            } else {
                                s4 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c6);
                                }
                            }
                            if (s4 !== peg$FAILED) {
                                s5 = [];
                                s6 = peg$parsestring();
                                while (s6 !== peg$FAILED) {
                                    s5.push(s6);
                                    s6 = peg$parsestring();
                                }
                                if (s5 !== peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 125) {
                                        s6 = peg$c7;
                                        peg$currPos++;
                                    } else {
                                        s6 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$c8);
                                        }
                                    }
                                    if (s6 !== peg$FAILED) {
                                        peg$reportedPos = s0;
                                        s1 = peg$c9(s5);
                                        s0 = s1;
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$c2;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = [];
                    s2 = peg$parse_();
                    while (s2 !== peg$FAILED) {
                        s1.push(s2);
                        s2 = peg$parse_();
                    }
                    if (s1 !== peg$FAILED) {
                        if (input.substr(peg$currPos, 7).toLowerCase() === peg$c10) {
                            s2 = input.substr(peg$currPos, 7);
                            peg$currPos += 7;
                        } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c11);
                            }
                        }
                        if (s2 !== peg$FAILED) {
                            s3 = [];
                            s4 = peg$parse_();
                            while (s4 !== peg$FAILED) {
                                s3.push(s4);
                                s4 = peg$parse_();
                            }
                            if (s3 !== peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 123) {
                                    s4 = peg$c5;
                                    peg$currPos++;
                                } else {
                                    s4 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$c6);
                                    }
                                }
                                if (s4 !== peg$FAILED) {
                                    s5 = [];
                                    s6 = peg$parse_();
                                    while (s6 !== peg$FAILED) {
                                        s5.push(s6);
                                        s6 = peg$parse_();
                                    }
                                    if (s5 !== peg$FAILED) {
                                        s6 = peg$parsekey_value();
                                        if (s6 !== peg$FAILED) {
                                            s7 = [];
                                            s8 = peg$parse_();
                                            while (s8 !== peg$FAILED) {
                                                s7.push(s8);
                                                s8 = peg$parse_();
                                            }
                                            if (s7 !== peg$FAILED) {
                                                if (input.charCodeAt(peg$currPos) === 125) {
                                                    s8 = peg$c7;
                                                    peg$currPos++;
                                                } else {
                                                    s8 = peg$FAILED;
                                                    if (peg$silentFails === 0) {
                                                        peg$fail(peg$c8);
                                                    }
                                                }
                                                if (s8 !== peg$FAILED) {
                                                    peg$reportedPos = s0;
                                                    s1 = peg$c12(s6);
                                                    s0 = s1;
                                                } else {
                                                    peg$currPos = s0;
                                                    s0 = peg$c2;
                                                }
                                            } else {
                                                peg$currPos = s0;
                                                s0 = peg$c2;
                                            }
                                        } else {
                                            peg$currPos = s0;
                                            s0 = peg$c2;
                                        }
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$c2;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = [];
                        s2 = peg$parse_();
                        while (s2 !== peg$FAILED) {
                            s1.push(s2);
                            s2 = peg$parse_();
                        }
                        if (s1 !== peg$FAILED) {
                            if (input.substr(peg$currPos, 9).toLowerCase() === peg$c13) {
                                s2 = input.substr(peg$currPos, 9);
                                peg$currPos += 9;
                            } else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c14);
                                }
                            }
                            if (s2 !== peg$FAILED) {
                                s3 = [];
                                s4 = peg$parse_();
                                while (s4 !== peg$FAILED) {
                                    s3.push(s4);
                                    s4 = peg$parse_();
                                }
                                if (s3 !== peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 123) {
                                        s4 = peg$c5;
                                        peg$currPos++;
                                    } else {
                                        s4 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$c6);
                                        }
                                    }
                                    if (s4 !== peg$FAILED) {
                                        s5 = [];
                                        s6 = peg$parse_();
                                        while (s6 !== peg$FAILED) {
                                            s5.push(s6);
                                            s6 = peg$parse_();
                                        }
                                        if (s5 !== peg$FAILED) {
                                            s6 = peg$parsesimplestring();
                                            if (s6 !== peg$FAILED) {
                                                s7 = [];
                                                s8 = peg$parse_();
                                                while (s8 !== peg$FAILED) {
                                                    s7.push(s8);
                                                    s8 = peg$parse_();
                                                }
                                                if (s7 !== peg$FAILED) {
                                                    if (input.charCodeAt(peg$currPos) === 125) {
                                                        s8 = peg$c7;
                                                        peg$currPos++;
                                                    } else {
                                                        s8 = peg$FAILED;
                                                        if (peg$silentFails === 0) {
                                                            peg$fail(peg$c8);
                                                        }
                                                    }
                                                    if (s8 !== peg$FAILED) {
                                                        s1 = [
                                                            s1,
                                                            s2,
                                                            s3,
                                                            s4,
                                                            s5,
                                                            s6,
                                                            s7,
                                                            s8
                                                        ];
                                                        s0 = s1;
                                                    } else {
                                                        peg$currPos = s0;
                                                        s0 = peg$c2;
                                                    }
                                                } else {
                                                    peg$currPos = s0;
                                                    s0 = peg$c2;
                                                }
                                            } else {
                                                peg$currPos = s0;
                                                s0 = peg$c2;
                                            }
                                        } else {
                                            peg$currPos = s0;
                                            s0 = peg$c2;
                                        }
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$c2;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = [];
                            s2 = peg$parse_();
                            while (s2 !== peg$FAILED) {
                                s1.push(s2);
                                s2 = peg$parse_();
                            }
                            if (s1 !== peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 64) {
                                    s2 = peg$c15;
                                    peg$currPos++;
                                } else {
                                    s2 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$c16);
                                    }
                                }
                                if (s2 !== peg$FAILED) {
                                    s3 = peg$parsereference();
                                    if (s3 !== peg$FAILED) {
                                        s1 = [
                                            s1,
                                            s2,
                                            s3
                                        ];
                                        s0 = s1;
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$c2;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                            if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                s1 = [];
                                if (peg$c17.test(input.charAt(peg$currPos))) {
                                    s2 = input.charAt(peg$currPos);
                                    peg$currPos++;
                                } else {
                                    s2 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$c18);
                                    }
                                }
                                if (s2 !== peg$FAILED) {
                                    while (s2 !== peg$FAILED) {
                                        s1.push(s2);
                                        if (peg$c17.test(input.charAt(peg$currPos))) {
                                            s2 = input.charAt(peg$currPos);
                                            peg$currPos++;
                                        } else {
                                            s2 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$c18);
                                            }
                                        }
                                    }
                                } else {
                                    s1 = peg$c2;
                                }
                                if (s1 !== peg$FAILED) {
                                    peg$reportedPos = s0;
                                    s1 = peg$c19(s1);
                                }
                                s0 = s1;
                            }
                        }
                    }
                }
            }
            return s0;
        }
        function peg$parsereference() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;
            s0 = peg$currPos;
            s1 = peg$parseidentifier();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parse_();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parse_();
                }
                if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 123) {
                        s3 = peg$c5;
                        peg$currPos++;
                    } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c6);
                        }
                    }
                    if (s3 !== peg$FAILED) {
                        s4 = [];
                        s5 = peg$parse_();
                        while (s5 !== peg$FAILED) {
                            s4.push(s5);
                            s5 = peg$parse_();
                        }
                        if (s4 !== peg$FAILED) {
                            s5 = peg$parsecitekey();
                            if (s5 !== peg$FAILED) {
                                s6 = [];
                                s7 = peg$parse_();
                                while (s7 !== peg$FAILED) {
                                    s6.push(s7);
                                    s7 = peg$parse_();
                                }
                                if (s6 !== peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 44) {
                                        s7 = peg$c20;
                                        peg$currPos++;
                                    } else {
                                        s7 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$c21);
                                        }
                                    }
                                    if (s7 !== peg$FAILED) {
                                        s8 = [];
                                        s9 = peg$parsefield();
                                        while (s9 !== peg$FAILED) {
                                            s8.push(s9);
                                            s9 = peg$parsefield();
                                        }
                                        if (s8 !== peg$FAILED) {
                                            if (input.charCodeAt(peg$currPos) === 125) {
                                                s9 = peg$c7;
                                                peg$currPos++;
                                            } else {
                                                s9 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$c8);
                                                }
                                            }
                                            if (s9 !== peg$FAILED) {
                                                s10 = [];
                                                s11 = peg$parse_();
                                                while (s11 !== peg$FAILED) {
                                                    s10.push(s11);
                                                    s11 = peg$parse_();
                                                }
                                                if (s10 !== peg$FAILED) {
                                                    peg$reportedPos = s0;
                                                    s1 = peg$c22(s1, s5, s8);
                                                    s0 = s1;
                                                } else {
                                                    peg$currPos = s0;
                                                    s0 = peg$c2;
                                                }
                                            } else {
                                                peg$currPos = s0;
                                                s0 = peg$c2;
                                            }
                                        } else {
                                            peg$currPos = s0;
                                            s0 = peg$c2;
                                        }
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$c2;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = [];
                if (peg$c17.test(input.charAt(peg$currPos))) {
                    s2 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c18);
                    }
                }
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    if (peg$c17.test(input.charAt(peg$currPos))) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c18);
                        }
                    }
                }
                if (s1 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c23(s1);
                }
                s0 = s1;
            }
            return s0;
        }
        function peg$parseidentifier() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = [];
            if (peg$c24.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c25);
                }
            }
            if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    if (peg$c24.test(input.charAt(peg$currPos))) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c25);
                        }
                    }
                }
            } else {
                s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c26(s1);
            }
            s0 = s1;
            return s0;
        }
        function peg$parsecitekey() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = [];
            if (peg$c27.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c28);
                }
            }
            if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    if (peg$c27.test(input.charAt(peg$currPos))) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c28);
                        }
                    }
                }
            } else {
                s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c29(s1);
            }
            s0 = s1;
            return s0;
        }
        function peg$parsefield() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parse_();
            while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$parse_();
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseattachmenttype();
                if (s2 !== peg$FAILED) {
                    s3 = [];
                    s4 = peg$parse_();
                    while (s4 !== peg$FAILED) {
                        s3.push(s4);
                        s4 = peg$parse_();
                    }
                    if (s3 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 61) {
                            s4 = peg$c30;
                            peg$currPos++;
                        } else {
                            s4 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c31);
                            }
                        }
                        if (s4 !== peg$FAILED) {
                            s5 = [];
                            s6 = peg$parse_();
                            while (s6 !== peg$FAILED) {
                                s5.push(s6);
                                s6 = peg$parse_();
                            }
                            if (s5 !== peg$FAILED) {
                                s6 = peg$parseattachments();
                                if (s6 !== peg$FAILED) {
                                    s7 = [];
                                    s8 = peg$parse_();
                                    while (s8 !== peg$FAILED) {
                                        s7.push(s8);
                                        s8 = peg$parse_();
                                    }
                                    if (s7 !== peg$FAILED) {
                                        s8 = peg$currPos;
                                        if (input.charCodeAt(peg$currPos) === 44) {
                                            s9 = peg$c20;
                                            peg$currPos++;
                                        } else {
                                            s9 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$c21);
                                            }
                                        }
                                        if (s9 !== peg$FAILED) {
                                            s10 = [];
                                            s11 = peg$parse_();
                                            while (s11 !== peg$FAILED) {
                                                s10.push(s11);
                                                s11 = peg$parse_();
                                            }
                                            if (s10 !== peg$FAILED) {
                                                s9 = [
                                                    s9,
                                                    s10
                                                ];
                                                s8 = s9;
                                            } else {
                                                peg$currPos = s8;
                                                s8 = peg$c2;
                                            }
                                        } else {
                                            peg$currPos = s8;
                                            s8 = peg$c2;
                                        }
                                        if (s8 === peg$FAILED) {
                                            s8 = peg$c32;
                                        }
                                        if (s8 !== peg$FAILED) {
                                            peg$reportedPos = s0;
                                            s1 = peg$c33(s2, s6);
                                            s0 = s1;
                                        } else {
                                            peg$currPos = s0;
                                            s0 = peg$c2;
                                        }
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$c2;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = [];
                s2 = peg$parse_();
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    s2 = peg$parse_();
                }
                if (s1 !== peg$FAILED) {
                    s2 = peg$parsecreatortype();
                    if (s2 !== peg$FAILED) {
                        s3 = [];
                        s4 = peg$parse_();
                        while (s4 !== peg$FAILED) {
                            s3.push(s4);
                            s4 = peg$parse_();
                        }
                        if (s3 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 61) {
                                s4 = peg$c30;
                                peg$currPos++;
                            } else {
                                s4 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c31);
                                }
                            }
                            if (s4 !== peg$FAILED) {
                                s5 = [];
                                s6 = peg$parse_();
                                while (s6 !== peg$FAILED) {
                                    s5.push(s6);
                                    s6 = peg$parse_();
                                }
                                if (s5 !== peg$FAILED) {
                                    s6 = peg$parsebracedvalue();
                                    if (s6 !== peg$FAILED) {
                                        s7 = [];
                                        s8 = peg$parse_();
                                        while (s8 !== peg$FAILED) {
                                            s7.push(s8);
                                            s8 = peg$parse_();
                                        }
                                        if (s7 !== peg$FAILED) {
                                            s8 = peg$currPos;
                                            if (input.charCodeAt(peg$currPos) === 44) {
                                                s9 = peg$c20;
                                                peg$currPos++;
                                            } else {
                                                s9 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$c21);
                                                }
                                            }
                                            if (s9 !== peg$FAILED) {
                                                s10 = [];
                                                s11 = peg$parse_();
                                                while (s11 !== peg$FAILED) {
                                                    s10.push(s11);
                                                    s11 = peg$parse_();
                                                }
                                                if (s10 !== peg$FAILED) {
                                                    s9 = [
                                                        s9,
                                                        s10
                                                    ];
                                                    s8 = s9;
                                                } else {
                                                    peg$currPos = s8;
                                                    s8 = peg$c2;
                                                }
                                            } else {
                                                peg$currPos = s8;
                                                s8 = peg$c2;
                                            }
                                            if (s8 === peg$FAILED) {
                                                s8 = peg$c32;
                                            }
                                            if (s8 !== peg$FAILED) {
                                                peg$reportedPos = s0;
                                                s1 = peg$c34(s2, s6);
                                                s0 = s1;
                                            } else {
                                                peg$currPos = s0;
                                                s0 = peg$c2;
                                            }
                                        } else {
                                            peg$currPos = s0;
                                            s0 = peg$c2;
                                        }
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$c2;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$parsekey_value();
                }
            }
            return s0;
        }
        function peg$parseattachmenttype() {
            var s0;
            if (input.substr(peg$currPos, 9).toLowerCase() === peg$c35) {
                s0 = input.substr(peg$currPos, 9);
                peg$currPos += 9;
            } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c36);
                }
            }
            if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 4).toLowerCase() === peg$c37) {
                    s0 = input.substr(peg$currPos, 4);
                    peg$currPos += 4;
                } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c38);
                    }
                }
                if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c39) {
                        s0 = input.substr(peg$currPos, 3);
                        peg$currPos += 3;
                    } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c40);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 4).toLowerCase() === peg$c41) {
                            s0 = input.substr(peg$currPos, 4);
                            peg$currPos += 4;
                        } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c42);
                            }
                        }
                    }
                }
            }
            return s0;
        }
        function peg$parsecreatortype() {
            var s0;
            if (input.substr(peg$currPos, 6).toLowerCase() === peg$c43) {
                s0 = input.substr(peg$currPos, 6);
                peg$currPos += 6;
            } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c44);
                }
            }
            if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 6).toLowerCase() === peg$c45) {
                    s0 = input.substr(peg$currPos, 6);
                    peg$currPos += 6;
                } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c46);
                    }
                }
                if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 10).toLowerCase() === peg$c47) {
                        s0 = input.substr(peg$currPos, 10);
                        peg$currPos += 10;
                    } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c48);
                        }
                    }
                }
            }
            return s0;
        }
        function peg$parseattachments() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 123) {
                s1 = peg$c5;
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c6);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseattachmentlist();
                if (s2 === peg$FAILED) {
                    s2 = peg$c32;
                }
                if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                        s3 = peg$c7;
                        peg$currPos++;
                    } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c8);
                        }
                    }
                    if (s3 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c49(s2);
                        s0 = s1;
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 34) {
                    s1 = peg$c50;
                    peg$currPos++;
                } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c51);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = peg$parseattachmentlist();
                    if (s2 === peg$FAILED) {
                        s2 = peg$c32;
                    }
                    if (s2 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 34) {
                            s3 = peg$c50;
                            peg$currPos++;
                        } else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c51);
                            }
                        }
                        if (s3 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c49(s2);
                            s0 = s1;
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            }
            return s0;
        }
        function peg$parsekey_value() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parse_();
            while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$parse_();
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parsekey();
                if (s2 !== peg$FAILED) {
                    s3 = [];
                    s4 = peg$parse_();
                    while (s4 !== peg$FAILED) {
                        s3.push(s4);
                        s4 = peg$parse_();
                    }
                    if (s3 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 61) {
                            s4 = peg$c30;
                            peg$currPos++;
                        } else {
                            s4 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c31);
                            }
                        }
                        if (s4 !== peg$FAILED) {
                            peg$reportedPos = peg$currPos;
                            s5 = peg$c52(s2);
                            if (s5) {
                                s5 = peg$c53;
                            } else {
                                s5 = peg$c2;
                            }
                            if (s5 !== peg$FAILED) {
                                s6 = [];
                                s7 = peg$parse_();
                                while (s7 !== peg$FAILED) {
                                    s6.push(s7);
                                    s7 = peg$parse_();
                                }
                                if (s6 !== peg$FAILED) {
                                    s7 = peg$parseurl();
                                    if (s7 !== peg$FAILED) {
                                        s8 = [];
                                        s9 = peg$parse_();
                                        while (s9 !== peg$FAILED) {
                                            s8.push(s9);
                                            s9 = peg$parse_();
                                        }
                                        if (s8 !== peg$FAILED) {
                                            s9 = peg$currPos;
                                            if (input.charCodeAt(peg$currPos) === 44) {
                                                s10 = peg$c20;
                                                peg$currPos++;
                                            } else {
                                                s10 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$c21);
                                                }
                                            }
                                            if (s10 !== peg$FAILED) {
                                                s11 = [];
                                                s12 = peg$parse_();
                                                while (s12 !== peg$FAILED) {
                                                    s11.push(s12);
                                                    s12 = peg$parse_();
                                                }
                                                if (s11 !== peg$FAILED) {
                                                    s10 = [
                                                        s10,
                                                        s11
                                                    ];
                                                    s9 = s10;
                                                } else {
                                                    peg$currPos = s9;
                                                    s9 = peg$c2;
                                                }
                                            } else {
                                                peg$currPos = s9;
                                                s9 = peg$c2;
                                            }
                                            if (s9 === peg$FAILED) {
                                                s9 = peg$c32;
                                            }
                                            if (s9 !== peg$FAILED) {
                                                peg$reportedPos = s0;
                                                s1 = peg$c54(s2, s7);
                                                s0 = s1;
                                            } else {
                                                peg$currPos = s0;
                                                s0 = peg$c2;
                                            }
                                        } else {
                                            peg$currPos = s0;
                                            s0 = peg$c2;
                                        }
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$c2;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = [];
                s2 = peg$parse_();
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    s2 = peg$parse_();
                }
                if (s1 !== peg$FAILED) {
                    s2 = peg$parsekey();
                    if (s2 !== peg$FAILED) {
                        s3 = [];
                        s4 = peg$parse_();
                        while (s4 !== peg$FAILED) {
                            s3.push(s4);
                            s4 = peg$parse_();
                        }
                        if (s3 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 61) {
                                s4 = peg$c30;
                                peg$currPos++;
                            } else {
                                s4 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c31);
                                }
                            }
                            if (s4 !== peg$FAILED) {
                                s5 = [];
                                s6 = peg$parse_();
                                while (s6 !== peg$FAILED) {
                                    s5.push(s6);
                                    s6 = peg$parse_();
                                }
                                if (s5 !== peg$FAILED) {
                                    s6 = peg$parsevalue();
                                    if (s6 !== peg$FAILED) {
                                        s7 = [];
                                        s8 = peg$parse_();
                                        while (s8 !== peg$FAILED) {
                                            s7.push(s8);
                                            s8 = peg$parse_();
                                        }
                                        if (s7 !== peg$FAILED) {
                                            s8 = peg$currPos;
                                            if (input.charCodeAt(peg$currPos) === 44) {
                                                s9 = peg$c20;
                                                peg$currPos++;
                                            } else {
                                                s9 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$c21);
                                                }
                                            }
                                            if (s9 !== peg$FAILED) {
                                                s10 = [];
                                                s11 = peg$parse_();
                                                while (s11 !== peg$FAILED) {
                                                    s10.push(s11);
                                                    s11 = peg$parse_();
                                                }
                                                if (s10 !== peg$FAILED) {
                                                    s9 = [
                                                        s9,
                                                        s10
                                                    ];
                                                    s8 = s9;
                                                } else {
                                                    peg$currPos = s8;
                                                    s8 = peg$c2;
                                                }
                                            } else {
                                                peg$currPos = s8;
                                                s8 = peg$c2;
                                            }
                                            if (s8 === peg$FAILED) {
                                                s8 = peg$c32;
                                            }
                                            if (s8 !== peg$FAILED) {
                                                peg$reportedPos = s0;
                                                s1 = peg$c54(s2, s6);
                                                s0 = s1;
                                            } else {
                                                peg$currPos = s0;
                                                s0 = peg$c2;
                                            }
                                        } else {
                                            peg$currPos = s0;
                                            s0 = peg$c2;
                                        }
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$c2;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            }
            return s0;
        }
        function peg$parsekey() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = [];
            if (peg$c55.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c56);
                }
            }
            if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    if (peg$c55.test(input.charAt(peg$currPos))) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c56);
                        }
                    }
                }
            } else {
                s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c57(s1);
            }
            s0 = s1;
            return s0;
        }
        function peg$parsevalue() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = [];
            if (peg$c58.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c59);
                }
            }
            if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    if (peg$c58.test(input.charAt(peg$currPos))) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c59);
                        }
                    }
                }
            } else {
                s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c60(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parsebracedvalue();
                if (s1 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c61(s1);
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = [];
                    s2 = peg$parse_();
                    while (s2 !== peg$FAILED) {
                        s1.push(s2);
                        s2 = peg$parse_();
                    }
                    if (s1 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 35) {
                            s2 = peg$c62;
                            peg$currPos++;
                        } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c63);
                            }
                        }
                        if (s2 !== peg$FAILED) {
                            s3 = [];
                            s4 = peg$parse_();
                            while (s4 !== peg$FAILED) {
                                s3.push(s4);
                                s4 = peg$parse_();
                            }
                            if (s3 !== peg$FAILED) {
                                s4 = peg$parsevalue();
                                if (s4 !== peg$FAILED) {
                                    peg$reportedPos = s0;
                                    s1 = peg$c49(s4);
                                    s0 = s1;
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                }
            }
            return s0;
        }
        function peg$parsesimplestring() {
            var s0, s1, s2, s3, s4;
            s0 = [];
            if (peg$c58.test(input.charAt(peg$currPos))) {
                s1 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c59);
                }
            }
            if (s1 !== peg$FAILED) {
                while (s1 !== peg$FAILED) {
                    s0.push(s1);
                    if (peg$c58.test(input.charAt(peg$currPos))) {
                        s1 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c59);
                        }
                    }
                }
            } else {
                s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 34) {
                    s1 = peg$c50;
                    peg$currPos++;
                } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c51);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = [];
                    if (peg$c64.test(input.charAt(peg$currPos))) {
                        s3 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c65);
                        }
                    }
                    while (s3 !== peg$FAILED) {
                        s2.push(s3);
                        if (peg$c64.test(input.charAt(peg$currPos))) {
                            s3 = input.charAt(peg$currPos);
                            peg$currPos++;
                        } else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c65);
                            }
                        }
                    }
                    if (s2 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 34) {
                            s3 = peg$c50;
                            peg$currPos++;
                        } else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c51);
                            }
                        }
                        if (s3 !== peg$FAILED) {
                            s1 = [
                                s1,
                                s2,
                                s3
                            ];
                            s0 = s1;
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = [];
                    s2 = peg$parse_();
                    while (s2 !== peg$FAILED) {
                        s1.push(s2);
                        s2 = peg$parse_();
                    }
                    if (s1 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 35) {
                            s2 = peg$c62;
                            peg$currPos++;
                        } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c63);
                            }
                        }
                        if (s2 !== peg$FAILED) {
                            s3 = [];
                            s4 = peg$parse_();
                            while (s4 !== peg$FAILED) {
                                s3.push(s4);
                                s4 = peg$parse_();
                            }
                            if (s3 !== peg$FAILED) {
                                s4 = peg$parsesimplestring();
                                if (s4 !== peg$FAILED) {
                                    s1 = [
                                        s1,
                                        s2,
                                        s3,
                                        s4
                                    ];
                                    s0 = s1;
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                }
            }
            return s0;
        }
        function peg$parsebracedvalue() {
            var s0, s1, s2, s3, s4, s5;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 123) {
                s1 = peg$c5;
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c6);
                }
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = peg$currPos;
                s2 = peg$c66();
                if (s2) {
                    s2 = peg$c53;
                } else {
                    s2 = peg$c2;
                }
                if (s2 !== peg$FAILED) {
                    s3 = [];
                    s4 = peg$parsestring();
                    while (s4 !== peg$FAILED) {
                        s3.push(s4);
                        s4 = peg$parsestring();
                    }
                    if (s3 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 125) {
                            s4 = peg$c7;
                            peg$currPos++;
                        } else {
                            s4 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c8);
                            }
                        }
                        if (s4 !== peg$FAILED) {
                            peg$reportedPos = peg$currPos;
                            s5 = peg$c67(s3);
                            if (s5) {
                                s5 = peg$c53;
                            } else {
                                s5 = peg$c2;
                            }
                            if (s5 !== peg$FAILED) {
                                peg$reportedPos = s0;
                                s1 = peg$c49(s3);
                                s0 = s1;
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 34) {
                    s1 = peg$c50;
                    peg$currPos++;
                } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c51);
                    }
                }
                if (s1 !== peg$FAILED) {
                    peg$reportedPos = peg$currPos;
                    s2 = peg$c68();
                    if (s2) {
                        s2 = peg$c53;
                    } else {
                        s2 = peg$c2;
                    }
                    if (s2 !== peg$FAILED) {
                        s3 = [];
                        s4 = peg$parsestring();
                        while (s4 !== peg$FAILED) {
                            s3.push(s4);
                            s4 = peg$parsestring();
                        }
                        if (s3 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 34) {
                                s4 = peg$c50;
                                peg$currPos++;
                            } else {
                                s4 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c51);
                                }
                            }
                            if (s4 !== peg$FAILED) {
                                peg$reportedPos = peg$currPos;
                                s5 = peg$c67(s3);
                                if (s5) {
                                    s5 = peg$c53;
                                } else {
                                    s5 = peg$c2;
                                }
                                if (s5 !== peg$FAILED) {
                                    peg$reportedPos = s0;
                                    s1 = peg$c49(s3);
                                    s0 = s1;
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            }
            return s0;
        }
        function peg$parseurl() {
            var s0, s1, s2, s3, s4, s5;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 123) {
                s1 = peg$c5;
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c6);
                }
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = peg$currPos;
                s2 = peg$c66();
                if (s2) {
                    s2 = peg$c53;
                } else {
                    s2 = peg$c2;
                }
                if (s2 !== peg$FAILED) {
                    s3 = [];
                    s4 = peg$parseurlchar();
                    while (s4 !== peg$FAILED) {
                        s3.push(s4);
                        s4 = peg$parseurlchar();
                    }
                    if (s3 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 125) {
                            s4 = peg$c7;
                            peg$currPos++;
                        } else {
                            s4 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c8);
                            }
                        }
                        if (s4 !== peg$FAILED) {
                            peg$reportedPos = peg$currPos;
                            s5 = peg$c67(s3);
                            if (s5) {
                                s5 = peg$c53;
                            } else {
                                s5 = peg$c2;
                            }
                            if (s5 !== peg$FAILED) {
                                peg$reportedPos = s0;
                                s1 = peg$c61(s3);
                                s0 = s1;
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 34) {
                    s1 = peg$c50;
                    peg$currPos++;
                } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c51);
                    }
                }
                if (s1 !== peg$FAILED) {
                    peg$reportedPos = peg$currPos;
                    s2 = peg$c68();
                    if (s2) {
                        s2 = peg$c53;
                    } else {
                        s2 = peg$c2;
                    }
                    if (s2 !== peg$FAILED) {
                        s3 = [];
                        s4 = peg$parseurlchar();
                        while (s4 !== peg$FAILED) {
                            s3.push(s4);
                            s4 = peg$parseurlchar();
                        }
                        if (s3 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 34) {
                                s4 = peg$c50;
                                peg$currPos++;
                            } else {
                                s4 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c51);
                                }
                            }
                            if (s4 !== peg$FAILED) {
                                peg$reportedPos = peg$currPos;
                                s5 = peg$c67(s3);
                                if (s5) {
                                    s5 = peg$c53;
                                } else {
                                    s5 = peg$c2;
                                }
                                if (s5 !== peg$FAILED) {
                                    peg$reportedPos = s0;
                                    s1 = peg$c61(s3);
                                    s0 = s1;
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            }
            return s0;
        }
        function peg$parsestring() {
            var s0, s1, s2, s3, s4, s5, s6;
            s0 = peg$currPos;
            s1 = peg$parseplaintext();
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c69(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c70) {
                    s1 = peg$c70;
                    peg$currPos += 2;
                } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c71);
                    }
                }
                if (s1 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c72();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (peg$c73.test(input.charAt(peg$currPos))) {
                        s1 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c74);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c75(s1);
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 92) {
                            s1 = peg$c76;
                            peg$currPos++;
                        } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c77);
                            }
                        }
                        if (s1 !== peg$FAILED) {
                            s2 = peg$parsequotedchar();
                            if (s2 !== peg$FAILED) {
                                peg$reportedPos = s0;
                                s1 = peg$c69(s2);
                                s0 = s1;
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = [];
                            s2 = peg$parse_();
                            if (s2 === peg$FAILED) {
                                if (peg$c78.test(input.charAt(peg$currPos))) {
                                    s2 = input.charAt(peg$currPos);
                                    peg$currPos++;
                                } else {
                                    s2 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$c79);
                                    }
                                }
                            }
                            if (s2 !== peg$FAILED) {
                                while (s2 !== peg$FAILED) {
                                    s1.push(s2);
                                    s2 = peg$parse_();
                                    if (s2 === peg$FAILED) {
                                        if (peg$c78.test(input.charAt(peg$currPos))) {
                                            s2 = input.charAt(peg$currPos);
                                            peg$currPos++;
                                        } else {
                                            s2 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$c79);
                                            }
                                        }
                                    }
                                }
                            } else {
                                s1 = peg$c2;
                            }
                            if (s1 !== peg$FAILED) {
                                peg$reportedPos = s0;
                                s1 = peg$c80(s1);
                            }
                            s0 = s1;
                            if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                s1 = [];
                                if (peg$c81.test(input.charAt(peg$currPos))) {
                                    s2 = input.charAt(peg$currPos);
                                    peg$currPos++;
                                } else {
                                    s2 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$c82);
                                    }
                                }
                                if (s2 !== peg$FAILED) {
                                    while (s2 !== peg$FAILED) {
                                        s1.push(s2);
                                        if (peg$c81.test(input.charAt(peg$currPos))) {
                                            s2 = input.charAt(peg$currPos);
                                            peg$currPos++;
                                        } else {
                                            s2 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$c82);
                                            }
                                        }
                                    }
                                } else {
                                    s1 = peg$c2;
                                }
                                if (s1 !== peg$FAILED) {
                                    peg$reportedPos = s0;
                                    s1 = peg$c83();
                                }
                                s0 = s1;
                                if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    if (input.charCodeAt(peg$currPos) === 95) {
                                        s1 = peg$c84;
                                        peg$currPos++;
                                    } else {
                                        s1 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$c85);
                                        }
                                    }
                                    if (s1 !== peg$FAILED) {
                                        s2 = peg$parseparam();
                                        if (s2 !== peg$FAILED) {
                                            peg$reportedPos = s0;
                                            s1 = peg$c86(s2);
                                            s0 = s1;
                                        } else {
                                            peg$currPos = s0;
                                            s0 = peg$c2;
                                        }
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$c2;
                                    }
                                    if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        if (input.charCodeAt(peg$currPos) === 94) {
                                            s1 = peg$c87;
                                            peg$currPos++;
                                        } else {
                                            s1 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$c88);
                                            }
                                        }
                                        if (s1 !== peg$FAILED) {
                                            s2 = peg$parseparam();
                                            if (s2 !== peg$FAILED) {
                                                peg$reportedPos = s0;
                                                s1 = peg$c89(s2);
                                                s0 = s1;
                                            } else {
                                                peg$currPos = s0;
                                                s0 = peg$c2;
                                            }
                                        } else {
                                            peg$currPos = s0;
                                            s0 = peg$c2;
                                        }
                                        if (s0 === peg$FAILED) {
                                            s0 = peg$currPos;
                                            if (input.substr(peg$currPos, 5) === peg$c90) {
                                                s1 = peg$c90;
                                                peg$currPos += 5;
                                            } else {
                                                s1 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$c91);
                                                }
                                            }
                                            if (s1 !== peg$FAILED) {
                                                s2 = peg$parsebracedparam();
                                                if (s2 !== peg$FAILED) {
                                                    peg$reportedPos = s0;
                                                    s1 = peg$c92(s2);
                                                    s0 = s1;
                                                } else {
                                                    peg$currPos = s0;
                                                    s0 = peg$c2;
                                                }
                                            } else {
                                                peg$currPos = s0;
                                                s0 = peg$c2;
                                            }
                                            if (s0 === peg$FAILED) {
                                                s0 = peg$currPos;
                                                if (input.substr(peg$currPos, 5) === peg$c93) {
                                                    s1 = peg$c93;
                                                    peg$currPos += 5;
                                                } else {
                                                    s1 = peg$FAILED;
                                                    if (peg$silentFails === 0) {
                                                        peg$fail(peg$c94);
                                                    }
                                                }
                                                if (s1 !== peg$FAILED) {
                                                    s2 = [];
                                                    s3 = peg$parseurlchar();
                                                    while (s3 !== peg$FAILED) {
                                                        s2.push(s3);
                                                        s3 = peg$parseurlchar();
                                                    }
                                                    if (s2 !== peg$FAILED) {
                                                        if (input.charCodeAt(peg$currPos) === 125) {
                                                            s3 = peg$c7;
                                                            peg$currPos++;
                                                        } else {
                                                            s3 = peg$FAILED;
                                                            if (peg$silentFails === 0) {
                                                                peg$fail(peg$c8);
                                                            }
                                                        }
                                                        if (s3 !== peg$FAILED) {
                                                            peg$reportedPos = s0;
                                                            s1 = peg$c95(s2);
                                                            s0 = s1;
                                                        } else {
                                                            peg$currPos = s0;
                                                            s0 = peg$c2;
                                                        }
                                                    } else {
                                                        peg$currPos = s0;
                                                        s0 = peg$c2;
                                                    }
                                                } else {
                                                    peg$currPos = s0;
                                                    s0 = peg$c2;
                                                }
                                                if (s0 === peg$FAILED) {
                                                    s0 = peg$currPos;
                                                    if (input.substr(peg$currPos, 7) === peg$c96) {
                                                        s1 = peg$c96;
                                                        peg$currPos += 7;
                                                    } else {
                                                        s1 = peg$FAILED;
                                                        if (peg$silentFails === 0) {
                                                            peg$fail(peg$c97);
                                                        }
                                                    }
                                                    if (s1 !== peg$FAILED) {
                                                        s2 = peg$parsebracedparam();
                                                        if (s2 !== peg$FAILED) {
                                                            peg$reportedPos = s0;
                                                            s1 = peg$c92(s2);
                                                            s0 = s1;
                                                        } else {
                                                            peg$currPos = s0;
                                                            s0 = peg$c2;
                                                        }
                                                    } else {
                                                        peg$currPos = s0;
                                                        s0 = peg$c2;
                                                    }
                                                    if (s0 === peg$FAILED) {
                                                        s0 = peg$currPos;
                                                        if (input.substr(peg$currPos, 7) === peg$c98) {
                                                            s1 = peg$c98;
                                                            peg$currPos += 7;
                                                        } else {
                                                            s1 = peg$FAILED;
                                                            if (peg$silentFails === 0) {
                                                                peg$fail(peg$c99);
                                                            }
                                                        }
                                                        if (s1 !== peg$FAILED) {
                                                            s2 = peg$parsebracedparam();
                                                            if (s2 !== peg$FAILED) {
                                                                peg$reportedPos = s0;
                                                                s1 = peg$c100(s2);
                                                                s0 = s1;
                                                            } else {
                                                                peg$currPos = s0;
                                                                s0 = peg$c2;
                                                            }
                                                        } else {
                                                            peg$currPos = s0;
                                                            s0 = peg$c2;
                                                        }
                                                        if (s0 === peg$FAILED) {
                                                            s0 = peg$currPos;
                                                            if (input.substr(peg$currPos, 7) === peg$c101) {
                                                                s1 = peg$c101;
                                                                peg$currPos += 7;
                                                            } else {
                                                                s1 = peg$FAILED;
                                                                if (peg$silentFails === 0) {
                                                                    peg$fail(peg$c102);
                                                                }
                                                            }
                                                            if (s1 !== peg$FAILED) {
                                                                s2 = peg$parsebracedparam();
                                                                if (s2 !== peg$FAILED) {
                                                                    peg$reportedPos = s0;
                                                                    s1 = peg$c103(s2);
                                                                    s0 = s1;
                                                                } else {
                                                                    peg$currPos = s0;
                                                                    s0 = peg$c2;
                                                                }
                                                            } else {
                                                                peg$currPos = s0;
                                                                s0 = peg$c2;
                                                            }
                                                            if (s0 === peg$FAILED) {
                                                                s0 = peg$currPos;
                                                                if (input.charCodeAt(peg$currPos) === 123) {
                                                                    s1 = peg$c5;
                                                                    peg$currPos++;
                                                                } else {
                                                                    s1 = peg$FAILED;
                                                                    if (peg$silentFails === 0) {
                                                                        peg$fail(peg$c6);
                                                                    }
                                                                }
                                                                if (s1 !== peg$FAILED) {
                                                                    s2 = [];
                                                                    s3 = peg$parsestring();
                                                                    while (s3 !== peg$FAILED) {
                                                                        s2.push(s3);
                                                                        s3 = peg$parsestring();
                                                                    }
                                                                    if (s2 !== peg$FAILED) {
                                                                        if (input.charCodeAt(peg$currPos) === 125) {
                                                                            s3 = peg$c7;
                                                                            peg$currPos++;
                                                                        } else {
                                                                            s3 = peg$FAILED;
                                                                            if (peg$silentFails === 0) {
                                                                                peg$fail(peg$c8);
                                                                            }
                                                                        }
                                                                        if (s3 !== peg$FAILED) {
                                                                            peg$reportedPos = s0;
                                                                            s1 = peg$c104(s2);
                                                                            s0 = s1;
                                                                        } else {
                                                                            peg$currPos = s0;
                                                                            s0 = peg$c2;
                                                                        }
                                                                    } else {
                                                                        peg$currPos = s0;
                                                                        s0 = peg$c2;
                                                                    }
                                                                } else {
                                                                    peg$currPos = s0;
                                                                    s0 = peg$c2;
                                                                }
                                                                if (s0 === peg$FAILED) {
                                                                    s0 = peg$currPos;
                                                                    if (input.charCodeAt(peg$currPos) === 36) {
                                                                        s1 = peg$c105;
                                                                        peg$currPos++;
                                                                    } else {
                                                                        s1 = peg$FAILED;
                                                                        if (peg$silentFails === 0) {
                                                                            peg$fail(peg$c106);
                                                                        }
                                                                    }
                                                                    if (s1 !== peg$FAILED) {
                                                                        s2 = [];
                                                                        s3 = peg$parsestring();
                                                                        while (s3 !== peg$FAILED) {
                                                                            s2.push(s3);
                                                                            s3 = peg$parsestring();
                                                                        }
                                                                        if (s2 !== peg$FAILED) {
                                                                            if (input.charCodeAt(peg$currPos) === 36) {
                                                                                s3 = peg$c105;
                                                                                peg$currPos++;
                                                                            } else {
                                                                                s3 = peg$FAILED;
                                                                                if (peg$silentFails === 0) {
                                                                                    peg$fail(peg$c106);
                                                                                }
                                                                            }
                                                                            if (s3 !== peg$FAILED) {
                                                                                peg$reportedPos = s0;
                                                                                s1 = peg$c95(s2);
                                                                                s0 = s1;
                                                                            } else {
                                                                                peg$currPos = s0;
                                                                                s0 = peg$c2;
                                                                            }
                                                                        } else {
                                                                            peg$currPos = s0;
                                                                            s0 = peg$c2;
                                                                        }
                                                                    } else {
                                                                        peg$currPos = s0;
                                                                        s0 = peg$c2;
                                                                    }
                                                                    if (s0 === peg$FAILED) {
                                                                        s0 = peg$currPos;
                                                                        if (input.charCodeAt(peg$currPos) === 37) {
                                                                            s1 = peg$c107;
                                                                            peg$currPos++;
                                                                        } else {
                                                                            s1 = peg$FAILED;
                                                                            if (peg$silentFails === 0) {
                                                                                peg$fail(peg$c108);
                                                                            }
                                                                        }
                                                                        if (s1 !== peg$FAILED) {
                                                                            peg$reportedPos = s0;
                                                                            s1 = peg$c109();
                                                                        }
                                                                        s0 = s1;
                                                                        if (s0 === peg$FAILED) {
                                                                            s0 = peg$currPos;
                                                                            if (input.charCodeAt(peg$currPos) === 92) {
                                                                                s1 = peg$c76;
                                                                                peg$currPos++;
                                                                            } else {
                                                                                s1 = peg$FAILED;
                                                                                if (peg$silentFails === 0) {
                                                                                    peg$fail(peg$c77);
                                                                                }
                                                                            }
                                                                            if (s1 !== peg$FAILED) {
                                                                                if (peg$c110.test(input.charAt(peg$currPos))) {
                                                                                    s2 = input.charAt(peg$currPos);
                                                                                    peg$currPos++;
                                                                                } else {
                                                                                    s2 = peg$FAILED;
                                                                                    if (peg$silentFails === 0) {
                                                                                        peg$fail(peg$c111);
                                                                                    }
                                                                                }
                                                                                if (s2 !== peg$FAILED) {
                                                                                    s3 = peg$currPos;
                                                                                    if (input.charCodeAt(peg$currPos) === 91) {
                                                                                        s4 = peg$c112;
                                                                                        peg$currPos++;
                                                                                    } else {
                                                                                        s4 = peg$FAILED;
                                                                                        if (peg$silentFails === 0) {
                                                                                            peg$fail(peg$c113);
                                                                                        }
                                                                                    }
                                                                                    if (s4 !== peg$FAILED) {
                                                                                        s5 = [];
                                                                                        s6 = peg$parsekey_value();
                                                                                        while (s6 !== peg$FAILED) {
                                                                                            s5.push(s6);
                                                                                            s6 = peg$parsekey_value();
                                                                                        }
                                                                                        if (s5 !== peg$FAILED) {
                                                                                            if (input.charCodeAt(peg$currPos) === 93) {
                                                                                                s6 = peg$c114;
                                                                                                peg$currPos++;
                                                                                            } else {
                                                                                                s6 = peg$FAILED;
                                                                                                if (peg$silentFails === 0) {
                                                                                                    peg$fail(peg$c115);
                                                                                                }
                                                                                            }
                                                                                            if (s6 !== peg$FAILED) {
                                                                                                s4 = [
                                                                                                    s4,
                                                                                                    s5,
                                                                                                    s6
                                                                                                ];
                                                                                                s3 = s4;
                                                                                            } else {
                                                                                                peg$currPos = s3;
                                                                                                s3 = peg$c2;
                                                                                            }
                                                                                        } else {
                                                                                            peg$currPos = s3;
                                                                                            s3 = peg$c2;
                                                                                        }
                                                                                    } else {
                                                                                        peg$currPos = s3;
                                                                                        s3 = peg$c2;
                                                                                    }
                                                                                    if (s3 === peg$FAILED) {
                                                                                        s3 = peg$c32;
                                                                                    }
                                                                                    if (s3 !== peg$FAILED) {
                                                                                        s4 = peg$parseparam();
                                                                                        if (s4 !== peg$FAILED) {
                                                                                            peg$reportedPos = s0;
                                                                                            s1 = peg$c116(s2, s4);
                                                                                            s0 = s1;
                                                                                        } else {
                                                                                            peg$currPos = s0;
                                                                                            s0 = peg$c2;
                                                                                        }
                                                                                    } else {
                                                                                        peg$currPos = s0;
                                                                                        s0 = peg$c2;
                                                                                    }
                                                                                } else {
                                                                                    peg$currPos = s0;
                                                                                    s0 = peg$c2;
                                                                                }
                                                                            } else {
                                                                                peg$currPos = s0;
                                                                                s0 = peg$c2;
                                                                            }
                                                                            if (s0 === peg$FAILED) {
                                                                                s0 = peg$currPos;
                                                                                if (input.charCodeAt(peg$currPos) === 92) {
                                                                                    s1 = peg$c76;
                                                                                    peg$currPos++;
                                                                                } else {
                                                                                    s1 = peg$FAILED;
                                                                                    if (peg$silentFails === 0) {
                                                                                        peg$fail(peg$c77);
                                                                                    }
                                                                                }
                                                                                if (s1 !== peg$FAILED) {
                                                                                    if (peg$c110.test(input.charAt(peg$currPos))) {
                                                                                        s2 = input.charAt(peg$currPos);
                                                                                        peg$currPos++;
                                                                                    } else {
                                                                                        s2 = peg$FAILED;
                                                                                        if (peg$silentFails === 0) {
                                                                                            peg$fail(peg$c111);
                                                                                        }
                                                                                    }
                                                                                    if (s2 !== peg$FAILED) {
                                                                                        s3 = peg$currPos;
                                                                                        if (input.charCodeAt(peg$currPos) === 91) {
                                                                                            s4 = peg$c112;
                                                                                            peg$currPos++;
                                                                                        } else {
                                                                                            s4 = peg$FAILED;
                                                                                            if (peg$silentFails === 0) {
                                                                                                peg$fail(peg$c113);
                                                                                            }
                                                                                        }
                                                                                        if (s4 !== peg$FAILED) {
                                                                                            s5 = [];
                                                                                            s6 = peg$parsekey_value();
                                                                                            while (s6 !== peg$FAILED) {
                                                                                                s5.push(s6);
                                                                                                s6 = peg$parsekey_value();
                                                                                            }
                                                                                            if (s5 !== peg$FAILED) {
                                                                                                if (input.charCodeAt(peg$currPos) === 93) {
                                                                                                    s6 = peg$c114;
                                                                                                    peg$currPos++;
                                                                                                } else {
                                                                                                    s6 = peg$FAILED;
                                                                                                    if (peg$silentFails === 0) {
                                                                                                        peg$fail(peg$c115);
                                                                                                    }
                                                                                                }
                                                                                                if (s6 !== peg$FAILED) {
                                                                                                    s4 = [
                                                                                                        s4,
                                                                                                        s5,
                                                                                                        s6
                                                                                                    ];
                                                                                                    s3 = s4;
                                                                                                } else {
                                                                                                    peg$currPos = s3;
                                                                                                    s3 = peg$c2;
                                                                                                }
                                                                                            } else {
                                                                                                peg$currPos = s3;
                                                                                                s3 = peg$c2;
                                                                                            }
                                                                                        } else {
                                                                                            peg$currPos = s3;
                                                                                            s3 = peg$c2;
                                                                                        }
                                                                                        if (s3 === peg$FAILED) {
                                                                                            s3 = peg$c32;
                                                                                        }
                                                                                        if (s3 !== peg$FAILED) {
                                                                                            s4 = [];
                                                                                            s5 = peg$parse_();
                                                                                            if (s5 !== peg$FAILED) {
                                                                                                while (s5 !== peg$FAILED) {
                                                                                                    s4.push(s5);
                                                                                                    s5 = peg$parse_();
                                                                                                }
                                                                                            } else {
                                                                                                s4 = peg$c2;
                                                                                            }
                                                                                            if (s4 !== peg$FAILED) {
                                                                                                peg$reportedPos = s0;
                                                                                                s1 = peg$c117(s2);
                                                                                                s0 = s1;
                                                                                            } else {
                                                                                                peg$currPos = s0;
                                                                                                s0 = peg$c2;
                                                                                            }
                                                                                        } else {
                                                                                            peg$currPos = s0;
                                                                                            s0 = peg$c2;
                                                                                        }
                                                                                    } else {
                                                                                        peg$currPos = s0;
                                                                                        s0 = peg$c2;
                                                                                    }
                                                                                } else {
                                                                                    peg$currPos = s0;
                                                                                    s0 = peg$c2;
                                                                                }
                                                                                if (s0 === peg$FAILED) {
                                                                                    s0 = peg$currPos;
                                                                                    if (input.charCodeAt(peg$currPos) === 92) {
                                                                                        s1 = peg$c76;
                                                                                        peg$currPos++;
                                                                                    } else {
                                                                                        s1 = peg$FAILED;
                                                                                        if (peg$silentFails === 0) {
                                                                                            peg$fail(peg$c77);
                                                                                        }
                                                                                    }
                                                                                    if (s1 !== peg$FAILED) {
                                                                                        s2 = peg$parseplaintext();
                                                                                        if (s2 !== peg$FAILED) {
                                                                                            s3 = peg$currPos;
                                                                                            if (input.charCodeAt(peg$currPos) === 91) {
                                                                                                s4 = peg$c112;
                                                                                                peg$currPos++;
                                                                                            } else {
                                                                                                s4 = peg$FAILED;
                                                                                                if (peg$silentFails === 0) {
                                                                                                    peg$fail(peg$c113);
                                                                                                }
                                                                                            }
                                                                                            if (s4 !== peg$FAILED) {
                                                                                                s5 = [];
                                                                                                s6 = peg$parsekey_value();
                                                                                                while (s6 !== peg$FAILED) {
                                                                                                    s5.push(s6);
                                                                                                    s6 = peg$parsekey_value();
                                                                                                }
                                                                                                if (s5 !== peg$FAILED) {
                                                                                                    if (input.charCodeAt(peg$currPos) === 93) {
                                                                                                        s6 = peg$c114;
                                                                                                        peg$currPos++;
                                                                                                    } else {
                                                                                                        s6 = peg$FAILED;
                                                                                                        if (peg$silentFails === 0) {
                                                                                                            peg$fail(peg$c115);
                                                                                                        }
                                                                                                    }
                                                                                                    if (s6 !== peg$FAILED) {
                                                                                                        s4 = [
                                                                                                            s4,
                                                                                                            s5,
                                                                                                            s6
                                                                                                        ];
                                                                                                        s3 = s4;
                                                                                                    } else {
                                                                                                        peg$currPos = s3;
                                                                                                        s3 = peg$c2;
                                                                                                    }
                                                                                                } else {
                                                                                                    peg$currPos = s3;
                                                                                                    s3 = peg$c2;
                                                                                                }
                                                                                            } else {
                                                                                                peg$currPos = s3;
                                                                                                s3 = peg$c2;
                                                                                            }
                                                                                            if (s3 === peg$FAILED) {
                                                                                                s3 = peg$c32;
                                                                                            }
                                                                                            if (s3 !== peg$FAILED) {
                                                                                                if (input.charCodeAt(peg$currPos) === 123) {
                                                                                                    s4 = peg$c5;
                                                                                                    peg$currPos++;
                                                                                                } else {
                                                                                                    s4 = peg$FAILED;
                                                                                                    if (peg$silentFails === 0) {
                                                                                                        peg$fail(peg$c6);
                                                                                                    }
                                                                                                }
                                                                                                if (s4 !== peg$FAILED) {
                                                                                                    s5 = [];
                                                                                                    s6 = peg$parsestring();
                                                                                                    while (s6 !== peg$FAILED) {
                                                                                                        s5.push(s6);
                                                                                                        s6 = peg$parsestring();
                                                                                                    }
                                                                                                    if (s5 !== peg$FAILED) {
                                                                                                        if (input.charCodeAt(peg$currPos) === 125) {
                                                                                                            s6 = peg$c7;
                                                                                                            peg$currPos++;
                                                                                                        } else {
                                                                                                            s6 = peg$FAILED;
                                                                                                            if (peg$silentFails === 0) {
                                                                                                                peg$fail(peg$c8);
                                                                                                            }
                                                                                                        }
                                                                                                        if (s6 !== peg$FAILED) {
                                                                                                            peg$reportedPos = s0;
                                                                                                            s1 = peg$c118(s2, s5);
                                                                                                            s0 = s1;
                                                                                                        } else {
                                                                                                            peg$currPos = s0;
                                                                                                            s0 = peg$c2;
                                                                                                        }
                                                                                                    } else {
                                                                                                        peg$currPos = s0;
                                                                                                        s0 = peg$c2;
                                                                                                    }
                                                                                                } else {
                                                                                                    peg$currPos = s0;
                                                                                                    s0 = peg$c2;
                                                                                                }
                                                                                            } else {
                                                                                                peg$currPos = s0;
                                                                                                s0 = peg$c2;
                                                                                            }
                                                                                        } else {
                                                                                            peg$currPos = s0;
                                                                                            s0 = peg$c2;
                                                                                        }
                                                                                    } else {
                                                                                        peg$currPos = s0;
                                                                                        s0 = peg$c2;
                                                                                    }
                                                                                    if (s0 === peg$FAILED) {
                                                                                        s0 = peg$currPos;
                                                                                        if (input.charCodeAt(peg$currPos) === 92) {
                                                                                            s1 = peg$c76;
                                                                                            peg$currPos++;
                                                                                        } else {
                                                                                            s1 = peg$FAILED;
                                                                                            if (peg$silentFails === 0) {
                                                                                                peg$fail(peg$c77);
                                                                                            }
                                                                                        }
                                                                                        if (s1 !== peg$FAILED) {
                                                                                            s2 = peg$parseplaintext();
                                                                                            if (s2 !== peg$FAILED) {
                                                                                                s3 = [];
                                                                                                s4 = peg$parse_();
                                                                                                while (s4 !== peg$FAILED) {
                                                                                                    s3.push(s4);
                                                                                                    s4 = peg$parse_();
                                                                                                }
                                                                                                if (s3 !== peg$FAILED) {
                                                                                                    peg$reportedPos = s0;
                                                                                                    s1 = peg$c119(s2);
                                                                                                    s0 = s1;
                                                                                                } else {
                                                                                                    peg$currPos = s0;
                                                                                                    s0 = peg$c2;
                                                                                                }
                                                                                            } else {
                                                                                                peg$currPos = s0;
                                                                                                s0 = peg$c2;
                                                                                            }
                                                                                        } else {
                                                                                            peg$currPos = s0;
                                                                                            s0 = peg$c2;
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return s0;
        }
        function peg$parseparam() {
            var s0, s1, s2;
            s0 = peg$currPos;
            if (peg$c120.test(input.charAt(peg$currPos))) {
                s1 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c121);
                }
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c69(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 92) {
                    s1 = peg$c76;
                    peg$currPos++;
                } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c77);
                    }
                }
                if (s1 !== peg$FAILED) {
                    if (input.length > peg$currPos) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c122);
                        }
                    }
                    if (s2 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c69(s2);
                        s0 = s1;
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parsebracedparam();
                    if (s1 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c69(s1);
                    }
                    s0 = s1;
                }
            }
            return s0;
        }
        function peg$parsebracedparam() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 123) {
                s1 = peg$c5;
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c6);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parsestring();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parsestring();
                }
                if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                        s3 = peg$c7;
                        peg$currPos++;
                    } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c8);
                        }
                    }
                    if (s3 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c95(s2);
                        s0 = s1;
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            return s0;
        }
        function peg$parsequotedchar() {
            var s0, s1, s2;
            s0 = peg$currPos;
            peg$reportedPos = peg$currPos;
            s1 = peg$c123();
            if (s1) {
                s1 = peg$c53;
            } else {
                s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 34) {
                    s2 = peg$c50;
                    peg$currPos++;
                } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c51);
                    }
                }
                if (s2 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c124();
                    s0 = s1;
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (peg$c125.test(input.charAt(peg$currPos))) {
                    s1 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c126);
                    }
                }
                if (s1 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c69(s1);
                }
                s0 = s1;
            }
            return s0;
        }
        function peg$parseurlchar() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = [];
            if (peg$c127.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c128);
                }
            }
            if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    if (peg$c127.test(input.charAt(peg$currPos))) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c128);
                        }
                    }
                }
            } else {
                s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c95(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 92) {
                    s1 = peg$c76;
                    peg$currPos++;
                } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c77);
                    }
                }
                if (s1 !== peg$FAILED) {
                    if (input.length > peg$currPos) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c122);
                        }
                    }
                    if (s2 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c69(s2);
                        s0 = s1;
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            }
            return s0;
        }
        function peg$parseplaintext() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            peg$reportedPos = peg$currPos;
            s1 = peg$c129();
            if (s1) {
                s1 = peg$c53;
            } else {
                s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                if (peg$c130.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c131);
                    }
                }
                if (s3 !== peg$FAILED) {
                    while (s3 !== peg$FAILED) {
                        s2.push(s3);
                        if (peg$c130.test(input.charAt(peg$currPos))) {
                            s3 = input.charAt(peg$currPos);
                            peg$currPos++;
                        } else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c131);
                            }
                        }
                    }
                } else {
                    s2 = peg$c2;
                }
                if (s2 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c95(s2);
                    s0 = s1;
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                peg$reportedPos = peg$currPos;
                s1 = peg$c132();
                if (s1) {
                    s1 = peg$c53;
                } else {
                    s1 = peg$c2;
                }
                if (s1 !== peg$FAILED) {
                    s2 = [];
                    if (peg$c133.test(input.charAt(peg$currPos))) {
                        s3 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c134);
                        }
                    }
                    if (s3 !== peg$FAILED) {
                        while (s3 !== peg$FAILED) {
                            s2.push(s3);
                            if (peg$c133.test(input.charAt(peg$currPos))) {
                                s3 = input.charAt(peg$currPos);
                                peg$currPos++;
                            } else {
                                s3 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c134);
                                }
                            }
                        }
                    } else {
                        s2 = peg$c2;
                    }
                    if (s2 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c95(s2);
                        s0 = s1;
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            }
            return s0;
        }
        function peg$parseattachmentlist() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            s1 = peg$parseattachment();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseattachmentcdr();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseattachmentcdr();
                }
                if (s2 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c135(s1, s2);
                    s0 = s1;
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            return s0;
        }
        function peg$parseattachmentcdr() {
            var s0, s1, s2;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 59) {
                s1 = peg$c136;
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c137);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseattachment();
                if (s2 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c138(s2);
                    s0 = s1;
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            return s0;
        }
        function peg$parseattachment() {
            var s0, s1;
            s0 = peg$currPos;
            s1 = peg$parsefileparts();
            if (s1 === peg$FAILED) {
                s1 = peg$c32;
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c139(s1);
            }
            s0 = s1;
            return s0;
        }
        function peg$parsefileparts() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            s1 = peg$parsefilepart();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parsefilepartcdr();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parsefilepartcdr();
                }
                if (s2 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c135(s1, s2);
                    s0 = s1;
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            return s0;
        }
        function peg$parsefilepartcdr() {
            var s0, s1, s2;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 58) {
                s1 = peg$c140;
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c141);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parsefilepart();
                if (s2 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c142(s2);
                    s0 = s1;
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            return s0;
        }
        function peg$parsefilepart() {
            var s0, s1;
            s0 = peg$currPos;
            s1 = peg$parsefilechars();
            if (s1 === peg$FAILED) {
                s1 = peg$c32;
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c143(s1);
            }
            s0 = s1;
            return s0;
        }
        function peg$parsefilechars() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parsefilechar();
            if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    s2 = peg$parsefilechar();
                }
            } else {
                s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c95(s1);
            }
            s0 = s1;
            return s0;
        }
        function peg$parsefilechar() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = [];
            if (peg$c144.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c145);
                }
            }
            if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    if (peg$c144.test(input.charAt(peg$currPos))) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c145);
                        }
                    }
                }
            } else {
                s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c95(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 92) {
                    s1 = peg$c76;
                    peg$currPos++;
                } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c77);
                    }
                }
                if (s1 !== peg$FAILED) {
                    if (input.length > peg$currPos) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c122);
                        }
                    }
                    if (s2 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c69(s2);
                        s0 = s1;
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            }
            return s0;
        }
        function peg$parsegroupstree() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parse_();
            while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$parse_();
            }
            if (s1 !== peg$FAILED) {
                if (input.substr(peg$currPos, 12).toLowerCase() === peg$c146) {
                    s2 = input.substr(peg$currPos, 12);
                    peg$currPos += 12;
                } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c147);
                    }
                }
                if (s2 !== peg$FAILED) {
                    s3 = [];
                    s4 = peg$parse_();
                    while (s4 !== peg$FAILED) {
                        s3.push(s4);
                        s4 = peg$parse_();
                    }
                    if (s3 !== peg$FAILED) {
                        if (input.substr(peg$currPos, 11).toLowerCase() === peg$c148) {
                            s4 = input.substr(peg$currPos, 11);
                            peg$currPos += 11;
                        } else {
                            s4 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c149);
                            }
                        }
                        if (s4 !== peg$FAILED) {
                            s5 = [];
                            s6 = peg$parse_();
                            while (s6 !== peg$FAILED) {
                                s5.push(s6);
                                s6 = peg$parse_();
                            }
                            if (s5 !== peg$FAILED) {
                                s6 = [];
                                s7 = peg$parsegroup();
                                while (s7 !== peg$FAILED) {
                                    s6.push(s7);
                                    s7 = peg$parsegroup();
                                }
                                if (s6 !== peg$FAILED) {
                                    s7 = [];
                                    s8 = peg$parse_();
                                    while (s8 !== peg$FAILED) {
                                        s7.push(s8);
                                        s8 = peg$parse_();
                                    }
                                    if (s7 !== peg$FAILED) {
                                        peg$reportedPos = s0;
                                        s1 = peg$c150(s4, s6);
                                        s0 = s1;
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$c2;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            return s0;
        }
        function peg$parsegroup() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
            s0 = peg$currPos;
            s1 = [];
            if (peg$c151.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c152);
                }
            }
            if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    if (peg$c151.test(input.charAt(peg$currPos))) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c152);
                        }
                    }
                }
            } else {
                s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parse_();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parse_();
                }
                if (s2 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 17).toLowerCase() === peg$c153) {
                        s3 = input.substr(peg$currPos, 17);
                        peg$currPos += 17;
                    } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c154);
                        }
                    }
                    if (s3 !== peg$FAILED) {
                        s4 = [];
                        s5 = peg$parse_();
                        while (s5 !== peg$FAILED) {
                            s4.push(s5);
                            s5 = peg$parse_();
                        }
                        if (s4 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c155();
                            s0 = s1;
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = [];
                if (peg$c151.test(input.charAt(peg$currPos))) {
                    s2 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c152);
                    }
                }
                if (s2 !== peg$FAILED) {
                    while (s2 !== peg$FAILED) {
                        s1.push(s2);
                        if (peg$c151.test(input.charAt(peg$currPos))) {
                            s2 = input.charAt(peg$currPos);
                            peg$currPos++;
                        } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c152);
                            }
                        }
                    }
                } else {
                    s1 = peg$c2;
                }
                if (s1 !== peg$FAILED) {
                    s2 = [];
                    s3 = peg$parse_();
                    while (s3 !== peg$FAILED) {
                        s2.push(s3);
                        s3 = peg$parse_();
                    }
                    if (s2 !== peg$FAILED) {
                        if (input.substr(peg$currPos, 14) === peg$c156) {
                            s3 = peg$c156;
                            peg$currPos += 14;
                        } else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c157);
                            }
                        }
                        if (s3 !== peg$FAILED) {
                            s4 = [];
                            s5 = peg$parse_();
                            while (s5 !== peg$FAILED) {
                                s4.push(s5);
                                s5 = peg$parse_();
                            }
                            if (s4 !== peg$FAILED) {
                                s5 = [];
                                s6 = peg$parsegrouparray();
                                while (s6 !== peg$FAILED) {
                                    s5.push(s6);
                                    s6 = peg$parsegrouparray();
                                }
                                if (s5 !== peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 59) {
                                        s6 = peg$c136;
                                        peg$currPos++;
                                    } else {
                                        s6 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$c137);
                                        }
                                    }
                                    if (s6 !== peg$FAILED) {
                                        s7 = [];
                                        s8 = peg$parse_();
                                        while (s8 !== peg$FAILED) {
                                            s7.push(s8);
                                            s8 = peg$parse_();
                                        }
                                        if (s7 !== peg$FAILED) {
                                            peg$reportedPos = s0;
                                            s1 = peg$c158(s1, s5);
                                            s0 = s1;
                                        } else {
                                            peg$currPos = s0;
                                            s0 = peg$c2;
                                        }
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$c2;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            }
            return s0;
        }
        function peg$parsegrouparray() {
            var s0, s1, s2, s3, s4, s5, s6;
            s0 = peg$currPos;
            s1 = peg$parsegroupelement();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parse_();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parse_();
                }
                if (s2 !== peg$FAILED) {
                    s3 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 92) {
                        s4 = peg$c76;
                        peg$currPos++;
                    } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c77);
                        }
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = [];
                        if (peg$c159.test(input.charAt(peg$currPos))) {
                            s6 = input.charAt(peg$currPos);
                            peg$currPos++;
                        } else {
                            s6 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c160);
                            }
                        }
                        while (s6 !== peg$FAILED) {
                            s5.push(s6);
                            if (peg$c159.test(input.charAt(peg$currPos))) {
                                s6 = input.charAt(peg$currPos);
                                peg$currPos++;
                            } else {
                                s6 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c160);
                                }
                            }
                        }
                        if (s5 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 59) {
                                s6 = peg$c136;
                                peg$currPos++;
                            } else {
                                s6 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c137);
                                }
                            }
                            if (s6 !== peg$FAILED) {
                                s4 = [
                                    s4,
                                    s5,
                                    s6
                                ];
                                s3 = s4;
                            } else {
                                peg$currPos = s3;
                                s3 = peg$c2;
                            }
                        } else {
                            peg$currPos = s3;
                            s3 = peg$c2;
                        }
                    } else {
                        peg$currPos = s3;
                        s3 = peg$c2;
                    }
                    if (s3 === peg$FAILED) {
                        s3 = peg$c32;
                    }
                    if (s3 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c161(s1);
                        s0 = s1;
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            return s0;
        }
        function peg$parsegroupelement() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parsegroupchars();
            if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    s2 = peg$parsegroupchars();
                }
            } else {
                s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c162(s1);
            }
            s0 = s1;
            return s0;
        }
        function peg$parsegroupchars() {
            var s0, s1, s2, s3, s4, s5;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 92) {
                s1 = peg$c76;
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c77);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                if (peg$c159.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c160);
                    }
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    if (peg$c159.test(input.charAt(peg$currPos))) {
                        s3 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c160);
                        }
                    }
                }
                if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 92) {
                        s3 = peg$c76;
                        peg$currPos++;
                    } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c77);
                        }
                    }
                    if (s3 !== peg$FAILED) {
                        if (peg$c159.test(input.charAt(peg$currPos))) {
                            s4 = input.charAt(peg$currPos);
                            peg$currPos++;
                        } else {
                            s4 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c160);
                            }
                        }
                        if (s4 !== peg$FAILED) {
                            if (input.length > peg$currPos) {
                                s5 = input.charAt(peg$currPos);
                                peg$currPos++;
                            } else {
                                s5 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c122);
                                }
                            }
                            if (s5 !== peg$FAILED) {
                                peg$reportedPos = s0;
                                s1 = peg$c163(s5);
                                s0 = s1;
                            } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = [];
                if (peg$c159.test(input.charAt(peg$currPos))) {
                    s2 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c160);
                    }
                }
                if (s2 !== peg$FAILED) {
                    while (s2 !== peg$FAILED) {
                        s1.push(s2);
                        if (peg$c159.test(input.charAt(peg$currPos))) {
                            s2 = input.charAt(peg$currPos);
                            peg$currPos++;
                        } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c160);
                            }
                        }
                    }
                } else {
                    s1 = peg$c2;
                }
                if (s1 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c83();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = [];
                    if (peg$c164.test(input.charAt(peg$currPos))) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c165);
                        }
                    }
                    if (s2 !== peg$FAILED) {
                        while (s2 !== peg$FAILED) {
                            s1.push(s2);
                            if (peg$c164.test(input.charAt(peg$currPos))) {
                                s2 = input.charAt(peg$currPos);
                                peg$currPos++;
                            } else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c165);
                                }
                            }
                        }
                    } else {
                        s1 = peg$c2;
                    }
                    if (s1 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c162(s1);
                    }
                    s0 = s1;
                }
            }
            return s0;
        }
        function peg$parse_() {
            var s0, s1;
            s0 = [];
            if (peg$c166.test(input.charAt(peg$currPos))) {
                s1 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c167);
                }
            }
            if (s1 !== peg$FAILED) {
                while (s1 !== peg$FAILED) {
                    s0.push(s1);
                    if (peg$c166.test(input.charAt(peg$currPos))) {
                        s1 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c167);
                        }
                    }
                }
            } else {
                s0 = peg$c2;
            }
            return s0;
        }
        'use strict';
        var bibtex = {
                references: [],
                collections: [],
                strings: function () {
                    var init = {};
                    var dict = Object.create(null);
                    let dict$2 = init;
                    let keys = Object.keys(dict$2);
                    let length = keys.length;
                    let index;
                    for (index = 0; index < length; index++) {
                        let key = keys[index];
                        if (!dict$2.hasOwnProperty(key)) {
                            continue;
                        }
                        let value = dict$2[key];
                        dict[key] = value;
                    }
                    dict$2 = undefined;
                    keys = undefined;
                    return dict;
                }(),
                comments: [],
                errors: []
            };
        function beep(msg) {
            console.log(msg);
            return true;
        }
        function flatten(str) {
            return Array.isArray(str) ? str.map(function (c) {
                return flatten(c);
            }).join('') : '' + str;
        }
        function filterattachments(attachments, key) {
            attachments = attachments.map(function (attachment) {
                if (attachment && attachment.path && key == 'sentelink') {
                    return {
                        title: attachment.title,
                        mimeType: attachment.mimeType,
                        path: attachment.path.replace(/,.*/, '')
                    };
                } else {
                    return attachment;
                }
            }).filter(function (attachment) {
                return attachment && attachment.path && attachment.path != '';
            });
            attachments.sort(function (a, b) {
                if (a.path < b.path) {
                    return -1;
                } else if (a.path > b.path) {
                    return 1;
                } else {
                    return 0;
                }
            });
            return attachments;
        }
        function error(str) {
            bibtex.errors.push(str);
        }
        var Creators = new function () {
                function compact(fragments) {
                    return fragments.reduce(function (result, fragment) {
                        if (result.length == 0) {
                            return [fragment];
                        }
                        if (result[result.length - 1] instanceof String || fragment instanceof String) {
                            return result.concat(fragment);
                        }
                        result[result.length - 1] += fragment;
                        return result;
                    }, []);
                }
                function split(fragments, sep) {
                    fragments = compact(fragments);
                    var groups = [];
                    function push(fragment$2, newitem) {
                        if (newitem || groups.length == 0) {
                            groups.push([]);
                        }
                        groups[groups.length - 1].push(fragment$2);
                    }
                    let fragment;
                    let items = fragments;
                    let length = items.length;
                    let i;
                    for (i = 0; i < length; i++) {
                        fragment = items[i];
                        if (fragment instanceof String) {
                            push(fragment);
                        } else {
                            let splinter;
                            let items$2 = fragment.split(sep);
                            let length$2 = items$2.length;
                            let i$2;
                            for (i$2 = 0; i$2 < length$2; i$2++) {
                                splinter = items$2[i$2];
                                // first word is before the separator, so it is appended to the previous chunk
                                // all other words start a new entry
                                push(splinter, i$2 > 0);
                            }
                            items$2 = undefined;
                        }
                    }
                    items = undefined;
                    groups = groups.map(function (group$2) {
                        return compact(group$2);
                    });
                    let group;
                    let items$3 = groups;
                    let length$3 = items$3.length;
                    let i$3;
                    for (i$3 = 0; i$3 < length$3; i$3++) {
                        group = items$3[i$3];
                        // 'trim' the groups
                        if (group.length == 0) {
                            return;
                        }
                        if (!(group[0] instanceof String)) {
                            group[0] = group[0].replace(/^\s+/gm, '');
                            if (group[0] == '') {
                                group.shift();
                            }
                        }
                        if (group.length == 0) {
                            return;
                        }
                        var last = group.length - 1;
                        if (!(group[last] instanceof String)) {
                            group[last] = group[last].replace(/\s+$/gm, '');
                            if (group[last] == '') {
                                group.pop();
                            }
                        }
                    }
                    items$3 = undefined;
                    return groups;
                }
                function join(group) {
                    return group.join('').trim();
                }
                this.parse = function (creators) {
                    return split(creators, /\s+and\s/).map(function (creator) {
                        var name$2 = split(creator, ',');
                        switch (name$2.length) {
                        case 0:
                            return null;
                        case 1:
                            // single string, no commas
                            if (name$2[0].length == 1 && name$2[0][0] instanceof String) {
                                // single literal
                                return {
                                    lastName: '' + name$2[0][0],
                                    fieldMode: 1
                                };
                            }
                            // single string, no commas
                            return join(name$2[0]);
                        // this will be cleaned up by zotero utils laters
                        case 2:
                            // last name, first name
                            return {
                                lastName: join(name$2[0]),
                                firstName: join(name$2[1])
                            };
                        default:
                            // assumed middle item is something like Jr.
                            var firstName = join(name$2.pop());
                            var lastName = name$2.map(function (n) {
                                    return join(n);
                                }).join(', ');
                            return {
                                lastName: lastName,
                                firstName: firstName
                            };
                        }
                    });
                };
            }();
        peg$result = peg$startRuleFunction();
        if (peg$result !== peg$FAILED && peg$currPos === input.length) {
            return peg$result;
        } else {
            if (peg$result !== peg$FAILED && peg$currPos < input.length) {
                peg$fail({
                    type: 'end',
                    description: 'end of input'
                });
            }
            throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
        }
    }
    return {
        SyntaxError: SyntaxError,
        parse: parse
    };
}();
function detectImport() {
    try {
        var input = Zotero.read(102400);
        Zotero.debug('BBT detect against ' + input);
        var bib = BetterBibTeXParser.parse(input);
        if (bib.references.length > 0) {
            trLog('Yes, BibTeX');
            return true;
        }
        trLog('Not BibTeX, passing on');
        return false;
    } catch (e) {
        Zotero.debug('better-bibtex: detect failed: ' + e + '\n' + e.stack);
        return false;
    }
}
function doImport() {
    try {
        _doImport();
    } catch (e) {
        Zotero.debug('better-bibtex: import failed: ' + e + '\n' + e.stack);
        throw e;
    }
}
if (!JabRef) {
    var JabRef = {};
}
JabRef.importGroup = function (group) {
    Zotero.debug(JSON.stringify(group));
    var collection = new Zotero.Collection();
    collection.type = 'collection';
    collection.name = group.name;
    collection.children = group.items.map(function (key) {
        return {
            type: 'item',
            id: key
        };
    });
    let child;
    let items = group.collections;
    let length = items.length;
    let i;
    for (i = 0; i < length; i++) {
        child = items[i];
        collection.children.push(JabRef.importGroup(child));
    }
    items = undefined;
    collection.complete();
    return collection;
};
function _doImport() {
    Translator.initialize();
    var data = '';
    var read;
    while (read = Zotero.read(1024)) {
        data += read;
    }
    var bib = BetterBibTeXParser.parse(data);
    let ref;
    let items = bib.references;
    let length = items.length;
    let i;
    for (i = 0; i < length; i++) {
        ref = items[i];
        createZoteroReference(ref);
    }
    items = undefined;
    let coll;
    let items$2 = bib.collections;
    let length$2 = items$2.length;
    let i$2;
    for (i$2 = 0; i$2 < length$2; i$2++) {
        coll = items$2[i$2];
        JabRef.importGroup(coll);
    }
    items$2 = undefined;
}