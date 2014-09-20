{
  var bibtex = {references: [], collections: [], strings: Dict(), comments: [], errors: []};

  function beep(msg) {
    console.log(msg);
    return true;
  }

  function flatten(str) {
    return (Array.isArray(str) ? str.map(function(c) { return flatten(c); }).join('') : ('' + str));
  }

  function filterattachments(attachments, key) {
    attachments = attachments.map(function(attachment) {
      if (attachment && attachment.path && key == 'sentelink') {
        return {title: attachment.title, mimeType: attachment.mimeType, path: attachment.path.replace(/,.*/, '')};
      } else {
        return attachment;
      }
    }).filter(function(attachment) {
      return (attachment && attachment.path  && attachment.path != '');
    });

    attachments.sort(function(a, b) {
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

  var Creators = new function() {
    function compact(fragments) {
      return fragments.reduce(function(result, fragment) {
        if (result.length == 0) {
          return [fragment];
        }

        if ((result[result.length - 1] instanceof String) || (fragment instanceof String)) {
          return result.concat(fragment);
        }

        result[result.length - 1] += fragment;
        return result;
      }, []);
    }

    function split(fragments, sep) {
      fragments = compact(fragments);
      var groups = [];

      function push(fragment, newitem) {
        if (newitem || groups.length == 0) { groups.push([]); }
        groups[groups.length - 1].push(fragment);
      }

      for_each (let fragment in fragments) {
        if (fragment instanceof String) {
          push(fragment);
        } else {
          for_each (let splinter, let i in fragment.split(sep)) {
            // first word is before the separator, so it is appended to the previous chunk
            // all other words start a new entry
            push(splinter, i > 0);
          }
        }
      }

      groups = groups.map(function(group) { return compact(group); });

      for_each (let group in groups) { // 'trim' the groups
        if (group.length == 0) { return; }
        if (! (group[0] instanceof String)) {
          group[0] = group[0].replace(/^\s+/gm, '');
          if (group[0] == '') { group.shift(); }
        }

        if (group.length == 0) { return; }
        var last = group.length - 1;
        if (! (group[last] instanceof String)) {
          group[last] = group[last].replace(/\s+$/gm, '');
          if (group[last] == '') { group.pop(); }
        }
      }

      return groups;
    }

    function join(group) {
      return group.join('').trim();
    }

    this.parse = function(creators) {
      return split(creators, /\s+and\s/).map(function(creator) {

        var name = split(creator, ',');

        switch (name.length) {
          case 0:
            return null;

          case 1: // single string, no commas
            if (name[0].length == 1 && (name[0][0] instanceof String)) { // single literal
              return { lastName: '' + name[0][0], fieldMode: 1 };
            }
            // single string, no commas
            return join(name[0]); // this will be cleaned up by zotero utils laters

          case 2: // last name, first name
            return {lastName: join(name[0]), firstName: join(name[1])};

          default: // assumed middle item is something like Jr.
            var firstName = join(name.pop());
            var lastName = name.map(function(n) { return join(n); }).join(', ');
            return {lastName: lastName, firstName: firstName};
        }
      });
    }
  }
}

start
  = entries:entry* { return bibtex; }

entry
  = _* '@comment'i _* "{" groupstree "}"
  / _* '@comment'i _* "{" comment:string* "}" { bibtex.comments.push(flatten(comment).trim()); }
  / _* '@string'i _* "{" _* str:key_value _* "}" { bibtex.strings[str.key] = str.value; }
  / _* '@preamble'i _* "{" _* simplestring _* "}"
  / _* '@' reference
  / other:[^@]+ { bibtex.comments.push(flatten(other).trim()); }

reference
  = type:identifier _* "{" _* id:citekey _* "," fields:field* "}" _* {
      if (fields.length == 0) {
        bibtex.errors.push('@' + type + '{' + id + ',}');
      } else {
        var ref = Dict({'__type__': type.toLowerCase(), '__key__': id});

        for_each (let field in fields) {
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
                if (ref[field.key]) { // duplicate fields are not supposed to occur I think
                  var note;
                  if (ref.__note__) {
                    note = ref.__note__ + "<br/>\n";
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
        bibtex.references.push(ref);
      }
    }
  / err:[^@]* { bibtex.errors.push('@' + flatten(err)); }

identifier
  = chars:[a-zA-Z]+ { return flatten(chars); }

citekey
  = str:[^,]+ { return flatten(str); }

field
  = _* key:attachmenttype _* '=' _* val:attachments _* (',' _*)? { return {key: 'file', type: 'file', value: filterattachments(val || [], key)}; }
  / _* key:creatortype _* '=' _* val:bracedvalue _* ("," _*)? {
      return {key: key.toLowerCase(), type: 'creator', value: Creators.parse(val)};
    }
  / key_value

attachmenttype
  = ('sentelink'i / 'file'i / 'pdf'i / 'path'i)

creatortype
  = ('author'i / 'editor'i / 'translator'i)

attachments
  = '{' val:attachmentlist? '}' { return val; }
  / '"' val:attachmentlist? '"' { return val; }

key_value
  = _* key:key _* "=" &{ return key.toLowerCase() == 'url'}_* val:url _* ("," _*)? { return {key: key.trim().toLowerCase(), value: val.trim()}; }
  / _* key:key _* "=" _* val:value _* ("," _*)? { return {key: key.trim().toLowerCase(), value: val.trim()}; }

key
  = key:[^ \t\n\r=]+ { return flatten(key); }

value
  = val:[^#"{} \t\n\r,]+ { val = flatten(val); return (bibtex.strings[val] || val); }
  / val:bracedvalue { return flatten(val); }
  / _* "#" _* val:value { return val; }

simplestring
  = [^#"{} \t\n\r,]+
  / '"' [^"]* '"'
  / _* "#" _* simplestring

bracedvalue
  = '{' & { delete bibtex.quote; return true; } val:string* '}' & { delete bibtex.quote; return true; } { return val; }
  / '"' & { bibtex.quote = '"'; return true; }  val:string* '"' & { delete bibtex.quote; return true; } { return val; }

url
  = '{' & { delete bibtex.quote; return true; } val:urlchar* '}' & { delete bibtex.quote; return true; } { return flatten(val); }
  / '"' & { bibtex.quote = '"'; return true; }  val:urlchar* '"' & { delete bibtex.quote; return true; } { return flatten(val); }

string
  = text:plaintext                { return text; }
  / "\\\\"                        { return "\n"; }
  / bracket:[\[\]]                { return bracket; }
  / "\\" text:quotedchar          { return text; }
  / text:(_ / [~])+               { return ' '; }
  / [#$&]+                        { return ''; } /* macro parameters, math mode, table separator */
  / '_' text:param                { return '<sub>' + text + '</sub>'; }
  / '^' text:param                { return '<sup>' + text + '</sup>'; }
  / "\\emph" text:bracedparam     { return '<i>' + text + '</i>'; }
  / "\\url{" text:urlchar* "}"    { return flatten(text); }
  / "\\textit" text:bracedparam   { return '<i>' + text + '</i>'; }
  / "\\textbf" text:bracedparam   { return '<b>' + text + '</b>'; }
  / "\\textsc" text:bracedparam   { return '<span style="small-caps">' + text + '</span>'; }
  / '{' text:string* '}'          { return new String(flatten(text)); } // use 'new String', not 'String', because only 'new String' will match 'instanceof'!
  / '$' text:string* '$'          { return flatten(text); }
  /* / "%" [^\n]* "\n"            { return ''; }          comment */
  / '%'                           { return '%'; } // this doesn't feel rigth
  / "\\" command:[^a-z] ('[' key_value* ']')?  param:param {  /* single-char command */
                                                          var cmds = ["\\" + command + param];
                                                          if (param.length == 1) { cmds.push("\\" + command + '{' + param + '}'); }
                                                          if (param.length == 3 && param[0] == '{' && param[2] == '}') { cmds.push("\\" + command + param[2] ); }
                                                          var match = null;
                                                          for_each (let cmd in cmds) {
                                                            match = match || LaTeX.toUnicode[cmd];
                                                          }
                                                          return (match || param);
                                                       }
  / "\\" cmd:[^a-z] ('[' key_value* ']')?  _+          {  /* single-char command without parameter*/
                                                          if (LaTeX.toUnicode["\\" + cmd]) { return LaTeX.toUnicode["\\" + cmd]; }
                                                          return cmd;
                                                       }
  / "\\" cmd:plaintext ('[' key_value* ']')? '{' text:string* '}' { /* command */
                                                                    return ((LaTeX.toUnicode["\\" + cmd] || '') + flatten(text));
                                                                  }
  / "\\" cmd:plaintext _*                              {  /* bare command */
                                                          if (LaTeX.toUnicode["\\" + cmd]) { return LaTeX.toUnicode["\\" + cmd]; }
                                                          return cmd;
                                                       }

param
  = text:[^\\{]           { return text; }
  / "\\" text:.           { return text; }
  / text:bracedparam      { return text; }

bracedparam
  = '{' text:string* '}'  { return flatten(text); }

quotedchar
  = & { return (bibtex.quote == '"');  } '"' { return '"'; }
  / text:[#$%&_\^\[\]{}]  { return text; }

urlchar
  = text:[^\\{}]+ { return flatten(text); }
  / "\\" text:. { return text; }

plaintext
  = & { return (bibtex.quote == '"'); } text:[^ "\t\n\r#$%&~_\^{}\[\]\\]+ { return flatten(text); }
  / & { return (bibtex.quote != '"'); } text:[^ \t\n\r#$%&~_\^{}\[\]\\]+  { return flatten(text); }

attachmentlist
  = car:attachment cdr:attachmentcdr*  { return [car].concat(cdr || []); }

attachmentcdr
  = ';' att:attachment  { return att; }

attachment
  = parts:fileparts? {
                        parts = parts || [];
                        parts = (parts || []).map(function(v) { return v.trim(); });
                        switch (parts.length) {
                          case 0:
                            return {};
                          case 1:
                            parts = {title: '', path: parts[0], mimeType: ''};
                            break;
                          case 2:
                            parts = {title: parts[0], path: parts[1], mimeType: ''};
                            break;
                          default:
                            parts = {title: parts[0], path: parts[1], mimeType: parts[2]};
                            break;
                        }

                        parts.title = ((parts.title && parts.title != '') ? parts.title : 'Attachment');
                        parts.mimeType = ((parts.mimeType && parts.mimeType.match(/pdf/i)) ? 'application/pdf' : null);

                        parts.path = parts.path.replace(/\\/g, '/');
                        if (parts.path.match(/^[a-z]:\//i)) { parts.path = 'file:///' + parts.path; }
                        if (parts.path.match(/^\/\//)) { parts.path = 'file:' + parts.path; }

                        return parts;
                    }

fileparts
  = car:filepart cdr:filepartcdr* { return [car].concat(cdr || []); }

filepartcdr
  = ':' part:filepart { return part; }

filepart
  = part:filechars?  { return (part || ''); }

filechars
  = text:filechar+ { return flatten(text); }

filechar
  = text:[^\\{}:;]+ { return flatten(text); }
  / "\\" text:.   { return text; }

groupstree
  = _* 'jabref-meta:'i _* id:'groupstree:'i _* groups:group* _* {
      var levels = Dict();
      var collections = [];

      function skipEmptyKeys(key) { return key !== ''; }
      function intersect(v) { return this.indexOf(v) >= 0; }
      function unique(arr) {
        var result = [];
        for_each (let v in arr) {
          if (result.indexOf(v) === -1) {
            result.push(v);
          }
        }
        return result;
      }

      for_each (let group in groups) {
        if (!group) { return; }

        var collection = Dict();
        collection.name = group.data.shift();
        var intersection = group.data.shift();

        collection.items = group.data.filter(skipEmptyKeys);
        collection.collections = [];

        levels[group.level] = collection;

        if (group.level === 1) {
          collections.push(collection);
        } else {
          levels[group.level - 1].collections.push(collection);

          switch (intersection) {
            case '0': // independent
              break;

            case '1': // intersection
              collection.items = collection.items.filter(intersect, levels[group.level - 1].items);
              break;

            case '2': // union
              collection.items = unique(levels[group.level - 1].items.concat(collection.items));
              break;

          }
        };
      }
      bibtex.collections = bibtex.collections.concat(collections);
    }

group
  = [0-9]+ _* 'AllEntriesGroup:;'i _*                             { return null; }
  / level:[0-9]+ _* 'ExplicitGroup:' _* group:grouparray* ';' _*  { return {level: parseInt(level), data:group}; }

grouparray
  = elt:groupelement _* ("\\" [\r\n]* ';')? { return elt; }

groupelement
  = chars:groupchars+ { return chars.join(''); }

groupchars
  = "\\" [\r\n]* "\\" [\r\n] char:. { return char; }
  / [\r\n]+                         { return ''; }
  / chars:[^\\;\r\n]+               { return chars.join(''); }
_
  = w:[ \t\n\r]+

