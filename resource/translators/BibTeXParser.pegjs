{
  var bibtex = {references: [], strings: Dict({}), comments: [], errors: []};
  function join(str) {
    return ((typeof str == 'object') ? str.map(function(c) { return join(c); }).join('') : str);
  }
}

start
  = entries:entry* { return bibtex; }

entry
  = _* "@comment" _* "{" comment:[^}]* "}" { bibtex.comments.push(join(comment).trim()); }
  / _* "@string" _* "{" _* str:key_value _* "}" { bibtex.strings.set(str.key, str.value); }
  / _* "@" !("string" / "comment") reference
  / other:[^@]+ { bibtex.comments.push(join(other).trim()); }

reference
  = type:identifier _* "{" _* id:citekey _* "," values:key_value* "}" _* {
      if (values.length == 0) {
        bibtex.errors.push('@' + type + '{' + id + ',}');
      } else {
        var ref = Dict({'__type__': type.toLowerCase(), '__key__': id});
        values.forEach(function(v) {
          ref.set(v.key, v.value);
        });
        bibtex.references.push(ref);
      }
    }
  / err:[^@]* { bibtex.errors.push('@' + join(err)); }

identifier
  = chars:[a-zA-Z]+ { return join(chars); }

citekey
  = str:[^,]+ { return join(str); }

key_value
  = _* key:key _* "=" _* & { bibtex.inurl = (key == 'file'); return true; } val:value _* ("," _*)? & { delete bibtex.inurl; return true; } { return {key: key.trim().toLowerCase(), value: val.trim()}; }

key
  = key:[^ \t\n\r=]+ { return join(key); }

value
  = val:[^#"{} \t\n\r,]+ {
      val = join(val);
      return (bibtex.strings.has(val) ? bibtex.strings.get(val) : val);
    }
  / ["] & { bibtex.quoted = true; return true; } val:string* ["] & { delete bibtex.quoted; return true; } { return join(val); }
  / '{' & { delete bibtex.quoted; return true; } val:string* '}' & { delete bibtex.quoted; return true; } { return join(val).trim(); }
  / _* "#" _* val:value { return val; }

string
  = text:plaintext                { return text; }
  / & { return bibtex.inurl} "\\" text:[\\:] { return ("\\" + text); }
  / "\\" text:quotedchar          { return text; }
  / text:(_ / [~])+               { return ' '; }
  / [#$&\[\]]+                    { return ''; } /* macro parameters, math mode, table separator, parameter separator */
  / '_' text:param                { return '<sub>' + text + '</sub>'; }
  / '^' text:param                { return '<sup>' + text + '</sup>'; }
  / "\\emph" text:param           { return '<i>' + text + '</i>'; }
  / "\\url" & { bibtex.inurl = true; return true; } text:param & { delete bibtex.inurl; return true; }      { return text; }
  / "\\textit" text:param         { return '<i>' + text + '</i>'; }
  / "\\textbf" text:param         { return '<b>' + text + '</b>'; }
  / "\\textsc" text:param         { return '<span style="small-caps">' + text + '</span>'; }
  / '{' text:string* '}'          { return join(text); }
  / '$' text:string* '$'          { return join(text); }
  / "%" [^\n]* "\n"               { return ''; }          /* comment */
  / "\\" cmd:[^a-z] ('[' key_value* ']')?  param:param {  /* single-char command */
                                                          var cmds = ["\\" + cmd + param];
                                                          if (param.length == 1) { cmds.push("\\" + cmd + '{' + param + '}'); }
                                                          if (param.length == 3 && param[0] == '{' && param[2] == '}') { cmds.push("\\" + cmd + param[2] ); }
                                                          var match = null;
                                                          cmds.forEach(function(cmd) {
                                                            if (LaTeX.toUnicode[cmd]) { match = LaTeX.toUnicode[cmd]; }
                                                          });
                                                          return (match || param);
                                                       }
  / "\\" cmd:[^a-z] ('[' key_value* ']')?  _+          {  /* single-char command without parameter*/
                                                          if (LaTeX.toUnicode["\\" + cmd]) { return LaTeX.toUnicode["\\" + cmd]; }
                                                          return cmd;
                                                       }
  / "\\" cmd:plaintext _+                              {  /* bare command */
                                                          if (LaTeX.toUnicode["\\" + cmd]) { return LaTeX.toUnicode["\\" + cmd]; }
                                                          return cmd;
                                                       }
  / "\\" cmd:plaintext ('[' key_value* ']')? '{' text:string* '}' { /* command */
                                                                    return join(text);
                                                                  }

param
  = text:[^{]             { return text; }
  / '{' text:string* '}'  { return join(text); }

quotedchar
  = & { return bibtex.quoted;  } text:[#$%&_^"\[\]><]  { return text; }
  / & { return !bibtex.quoted; } text:[#$%&_^{}\[\]><] { return text; }

plaintext
  = & { return bibtex.inurl; }   text:[^ \t\n\r{}\[\]><\\]+         { return join(text); }
  / & { return bibtex.quoted;  } text:[^ "\t\n\r#$%&~_^{}\[\]><\\]+ { return join(text); }
  / & { return !bibtex.quoted; } text:[^ \t\n\r#$%&~_^{}\[\]><\\]+  { return join(text); }
_
    = w:[ \t\n\r]+ 
