{
  var bibtex = {pos: {}, references: [], strings: Dict({}), comments: [], errors: []};

  function join(str) {
    return ((typeof str == 'object') ? str.map(function(c) { return join(c); }).join('') : str);
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

  function error(str) {
    bibtex.errors.push(str);
  }
}

start
  = entries:entry* { return bibtex; }

entry
  = _* "@comment" _* "{" comment:string* "}" { bibtex.comments.push(join(comment).trim()); }
  / _* "@string" _* "{" _* str:key_value _* "}" { bibtex.strings[str.key] = str.value; }
  / _* "@" !("string" / "comment") reference
  / other:[^@]+ { bibtex.comments.push(join(other).trim()); }

reference
  = type:identifier _* "{" _* id:citekey _* "," fields:field* "}" _* {
      if (fields.length == 0) {
        error('@' + type + '{' + id + ',}');
      } else {
        var ref = Dict({'__type__': type.toLowerCase(), '__key__': id});
        fields.forEach(function(field) {
          if (field.value && field.value != '') {
            switch (field.type) {
              case 'file':
                var attachments;
                if (ref['file']) {
                  attachments = ref['file'];
                } else {
                  attachments = [];
                }
                ref['file'] = attachments.concat(field.value);
                break;

              case 'creator':
                if (field.value.length > 0) {
                  ref[field.key] = field.value;
                }
                break;

              default:
                if (ref[field.key]) { // duplicate fields are not supposed to occur I think
                  var note;
                  if (ref['__note__']) {
                    note = ref['__note__'] + "<br/>\n";
                  } else {
                    note = '';
                  }
                  ref['__note__'] = note + field.key + '=' + field.value;
                } else {
                  ref[field.key] = field.value;
                }
                break;
            }
          }
        });
        bibtex.references.push(ref);
      }
    }
  / err:[^@]* { error('@' + join(err)); }

identifier
  = chars:[a-zA-Z]+ { return join(chars); }

citekey
  = str:[^,]+ { return join(str); }

field
  = _* key:attachmenttype _* '=' _* val:attachments _* (',' _*)? { return {key: 'file', type: 'file', value: filterattachments(val || [], key)}; }
  / _* key:creatortype _* '=' _* val:creators _* ("," _*)? {
      var creators = [{string: ''}];
      val.forEach(function(word) {
        if (word.trim() == 'and') {
          creators.push({string: ''});
        } else {
          var index = creators.length - 1;
          if (word.trim() != '') { creators[index].literal = (creators[index].string.trim() == '' && /\s/.test(word.trim())); }
          creators[index].string += word;
        }
      });

      creators = creators.map(function(c) {
        c.string = c.string.trim();
        return c;
      }).filter(function(c) {
        return (c.string != '');
      }).map(function(c) {
        return (c.literal ? {literal: c.string} : c.string);
      });
      return {key: key, type: 'creator', value: creators};
    }
  / key_value

creators
  = bracedvalue
  / quotedvalue

attachmenttype
  = ('sentelink' / 'file' / 'pdf' / 'path')

creatortype
  = ('author' / 'editor' / 'translator')

attachments
  = '{' val:attachmentlist? '}' { return val; }
  / '"' val:attachmentlist? '"' { return val; }

key_value
  = _* key:key _* "=" _* val:value _* ("," _*)? { return {key: key.trim().toLowerCase(), value: val.trim()}; }

key
  = key:[^ \t\n\r=]+ { return join(key); }

value
  = val:[^#"{} \t\n\r,]+ {
      val = join(val);
      return (bibtex.strings[val] || val);
    }
  / val:bracedvalue { return join(val); }
  / val:quotedvalue { return join(val); }
  / _* "#" _* val:value { return val; }

bracedvalue
  = '{' & { delete bibtex.quote; return true; } val:string* '}' & { delete bibtex.quote; return true; } { return val; }

quotedvalue
  = '"' & { bibtex.quote = '"'; return true; }  val:string* '"' & { delete bibtex.quote; return true; } { return val; }

string
  = text:plaintext                { return text; }
  / "\\\\"                        { return "\n"; }
  / "\\" text:quotedchar          { return text; }
  / text:(_ / [~])+               { return ' '; }
  / [#$&]+                        { return ''; } /* macro parameters, math mode, table separator */
  / '_' text:param                { return '<sub>' + text + '</sub>'; }
  / '^' text:param                { return '<sup>' + text + '</sup>'; }
  / "\\emph" text:bracedparam     { return '<i>' + text + '</i>'; }
  / "\\url{" text:url* "}"        { return join(text); }
  / "\\textit" text:bracedparam   { return '<i>' + text + '</i>'; }
  / "\\textbf" text:bracedparam   { return '<b>' + text + '</b>'; }
  / "\\textsc" text:bracedparam   { return '<span style="small-caps">' + text + '</span>'; }
  / '{' text:string* '}'          { return join(text); }
  / '$' text:string* '$'          { return join(text); }
  / "%" [^\n]* "\n"               { return ''; }          /* comment */
  / "\\" cmd:[^a-z] ('[' key_value* ']')?  param:param {  /* single-char command */
                                                          var cmds = ["\\" + cmd + param];
                                                          if (param.length == 1) { cmds.push("\\" + cmd + '{' + param + '}'); }
                                                          if (param.length == 3 && param[0] == '{' && param[2] == '}') { cmds.push("\\" + cmd + param[2] ); }
                                                          var match = null;
                                                          cmds.forEach(function(cmd) {
                                                            match = match || LaTeX.toUnicode[cmd];
                                                          });
                                                          return (match || param);
                                                       }
  / "\\" cmd:[^a-z] ('[' key_value* ']')?  _+          {  /* single-char command without parameter*/
                                                          if (LaTeX.toUnicode["\\" + cmd]) { return LaTeX.toUnicode["\\" + cmd]; }
                                                          return cmd;
                                                       }
  / "\\" cmd:plaintext ('[' key_value* ']')? '{' text:string* '}' { /* command */
                                                                    return ((LaTeX.toUnicode["\\" + cmd] || '') + join(text));
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
  = '{' text:string* '}'  { return join(text); }

quotedchar
  = & { return (bibtex.quote == '"');  } '"' { return '"'; }
  / text:[#$%&_\^\[\]{}]  { return text; }

url
  = text:[^\\{}]+ { return join(text); }
  / "\\" text:. { return text; }

plaintext
  = & { return (bibtex.quote == '"'); } text:[^ "\t\n\r#$%&~_\^{}\[\]\\]+ { return join(text); }
  / & { return (bibtex.quote != '"'); } text:[^ \t\n\r#$%&~_\^{}\[\]\\]+  { return join(text); }

_
  = w:[ \t\n\r]+ 

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
  = text:filechar+ { return join(text); }

filechar
  = text:[^\\{}:;]+ { return join(text); }
  / "\\" text:.   { return text; }
