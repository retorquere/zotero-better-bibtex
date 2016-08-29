{
  var bibtex = new BetterBibTeXParserSupport(options);
  // Zotero.debug('parser options:' + JSON.stringify(options));
  var csquotes = bibtex.options.csquotes || '\u201C\u201D';

  function say(str) {
    bibtex.log(str);
    return true;
  }
  function rule(name) {
    return say(name + ':' + input.substr(peg$currPos, 10))
  }
  function lookup(text, rule) {
    var match = LaTeX.toUnicode[bibtex.flatten(text)];
    if (options.verbose && rule && match) { bibtex.log('rule ' + rule + ' matched ' + JSON.stringify(text) + ' to ' + JSON.stringify(match)); }
    // if (rule && match) { bibtex.log('rule ' + rule + ' matched ' + JSON.stringify(text) + ' to ' + match.charCodeAt(0).toString(16)); }
    return match;
  }
}

start
  = entries:entry* { return bibtex }

entry
  = _* '@comment'i _* "{" groupstree "}"
  / _* '@comment'i _* "{" comment:string* "}" { bibtex.comment(comment); }
  / _* '@string'i _* "{" _* str:key_value _* "}" { bibtex.string(str); }
  / _* '@preamble'i _* "{" _* simplestring _* "}"
  / _* '@' reference
  / other:[^@]+ { bibtex.comment(other); }

reference
  = type:identifier _* "{" _* id:citekey _* "," fields:field* "}" _* { bibtex.reference(type, id, fields); }
  / err:[^@]* { bibtex.error(err); }

identifier
  = chars:[a-zA-Z]+ { return bibtex.flatten(chars) }

citekey
  = chars:[^,]+ { return bibtex.flatten(chars) }

field
  = _* key:attachmenttype _* '=' _* val:attachments _* (',' _*)? { return {key: 'file', type: 'file', value: bibtex.filterattachments(val || [], key)}; }
  / _* key:creatortype _* '=' _* val:bracedvalue _* ("," _*)? { return {key: key.toLowerCase(), type: 'creator', value: bibtex.Creators.parse(val)}; }
  / key_value

attachmenttype
  = ('sentelink'i / 'file'i / 'pdf'i / 'path'i)

creatortype
  = ('author'i / 'editor'i / 'translator'i)

attachments
  = '{' val:attachmentlist? '}' { return val }
  / '"' val:attachmentlist? '"' { return val }

key_value
  = _* 'url'i _* "=" _* val:url _* ("," _*)? { return {key: 'url', value: val.trim()} }
  / _* key:key _* "=" _* val:value _* ("," _*)? { return {key: key.trim().toLowerCase(), value: val.trim(), verbatimKey: key.trim()} }

key
  = key:[^ \t\n\r=]+ { return bibtex.flatten(key) }

value
  = val:[^#"{} \t\n\r,]+ { val = bibtex.flatten(val); return bibtex.strings[val] || val; }
  / val:bracedvalue { return bibtex.flatten(val) }
  / _* "#" _* val:value { return val }

simplestring
  = [^#"{} \t\n\r,]+
  / '"' [^"]* '"'
  / _* "#" _* simplestring

bracedvalue
  = '{' &{ return bibtex.quoteWith('{}') } val:strings '}' &{ return bibtex.quoteWith() } { return val }
  / '"' &{ return bibtex.quoteWith('"')  } val:strings '"' &{ return bibtex.quoteWith() } { return val }

url
  = '{' &{ return bibtex.quoteWith('{}') } val:urlchar* '}' &{ return bibtex.quoteWith() } { return bibtex.flatten(val) }
  / '"' &{ return bibtex.quoteWith('"')  } val:urlchar* '"' &{ return bibtex.quoteWith() } { return bibtex.flatten(val) }

strings
  = &{ return !bibtex.options.raw } strings:string*    { return strings }
  / &{ return bibtex.options.raw  } strings:raw*       { return strings }

raw
  = &{ return bibtex.braced } text:[^\\{}]+    { return text.join('') }
  / &{ return bibtex.quoted } text:[^\\"]+     { return text.join('') }
  / '\\' text:.                   { return "\\" + text }
  / '{' text:raw* '}'             { return new String('{' + text.join('') + '}') }

string
  = text:plaintext                { return text }
  / lookup
  / "\\mbox{}"                    { return "\u200B"; }
  / "\\\\"                        { return "\n" }
  / bracket:[\[\]]                { return bracket }
  / "\\" text:quotedchar          { return text }
  / text:_+                       { return ' ' }
  / [#$&]+                        { return '' } /* macro parameters, math mode, table separator */
  / '_' text:param                { return '<sub>' + text + '</sub>' }
  / '^' text:param                { return '<sup>' + text + '</sup>' }
  / "\\vphantom" text:bracedparam { return '' }
  / "\\" "mkbib"? "emph" text:bracedparam  { return '<i>' + text + '</i>' }
  / "\\" ("enquote" / "mkbibquote") text:bracedparam  { return csquotes[0] + text + csquotes[1]; }
  / "\\mbox" text:bracedparam     { return text }
  / "\\url{" text:urlchar* "}"    { return bibtex.flatten(text) }
  / "\\textit" text:bracedparam   { return '<i>' + text + '</i>' }
  / "\\textbf" text:bracedparam   { return '<b>' + text + '</b>' }
  / "\\textsc" text:bracedparam   { return '<span style="font-variant: small-caps;">' + text + '</span>' }
  / '{' text:string* '}'          { return new String(bibtex.flatten(text)) } // use 'new String', not 'String', because only 'new String' will match 'instanceof'!
  / '$' text:string* '$'          { return bibtex.flatten(text) }
  /* / "%" [^\n]* "\n"            { return '' }          comment */
  / '%'                           { return '%' } // this doesn't feel right
  / "\\" command:[^a-z] ('[' key_value* ']')?  param:param { return bibtex.command(command, param); /* single-char command */ }
  / "\\" cmd:[^a-z] ('[' key_value* ']')?  _+ { return lookup("\\" + cmd) || cmd; /* single-char command without parameter */ }
  / "\\" cmd:plaintext ('[' key_value* ']')? '{' text:string* '}' { return (lookup("\\" + cmd) || '') + bibtex.flatten(text); /* command */ }
  / "\\" cmd:plaintext _* { return lookup("\\" + cmd) || cmd; /* bare command */ }

terminator = _+ / ![a-z0-9]

param
  = text:[^\\{]           { return text }
  / "\\" text:.           { return text }
  / text:bracedparam      { return text }

bracedparam
  = '{' text:string* '}'  { return bibtex.flatten(text) }

quotedchar
  = &{ return bibtex.quoted } '"' { return '"' }
  / text:[#$%&_\^\[\]{}]  { return text }

urlchar
  = text:[^\\{}]+ { return bibtex.flatten(text) }
  / "\\" text:. { return text }

plaintext
  = &{ return bibtex.quoted  } text:[^ "\t\n\r#$%&~_\^{}\[\]\\]+ { return bibtex.flatten(text) }
  / &{ return !bibtex.quoted } text:[^ \t\n\r#$%&~_\^{}\[\]\\]+  { return bibtex.flatten(text) }

attachmentlist
  = car:attachment cdr:attachmentcdr*  { return [car].concat(cdr || []) }

attachmentcdr
  = ';' att:attachment  { return att }

attachment
  = fileparts:fileparts? { return bibtex.attachment(fileparts); }

fileparts
  = car:filepart cdr:filepartcdr* { return [car].concat(cdr || []) }

filepartcdr
  = ':' part:filepart { return part }

filepart
  = part:filechars?  { return (part || '') }

filechars
  = text:filechar+ { return bibtex.flatten(text) }

filechar
  = text:[^\\{}:;]+ { return bibtex.flatten(text) }
  / "\\" text:.   { return text }

groupstree
  = _* 'jabref-meta:'i _* id:'groupstree:'i _* groups:group* _* { bibtex.groupsTree(id, groups); }

group
  = [0-9]+ _* 'AllEntriesGroup:;'i _*                             { return null }
  / level:[0-9]+ _* 'ExplicitGroup:' _* group:grouparray* ';' _*  { return {level: parseInt(level), data:group} }

grouparray
  = elt:groupelement _* ("\\" [\r\n]* ';')? { return elt }

groupelement
  = chars:groupchars+ { return chars.join('') }

groupchars
  = "\\" [\r\n]* "\\" [\r\n] char:. { return char }
  / [\r\n]+                         { return '' }
  / chars:[^\\;\r\n]+               { return chars.join('') }
_
  = w:[ \t\n\r]+

lookup
  = text:("\\fontencoding{" [^}]+ "}\\selectfont\\char" [0-9]+)        terminator     &{ return lookup(text, 0); }{ return lookup(text); }
  / text:("\\acute{\\ddot{\\" [a-z]+ "}}")                                            &{ return lookup(text, 1); }{ return lookup(text); }
  / text:("\\cyrchar{\\'\\" [a-zA-Z]+ "}")                                            &{ return lookup(text, 2); }{ return lookup(text); }
  / text:("\\u \\i")                                                   terminator     &{ return lookup(text, 3); }{ return lookup(text); }
  / text:("\\" [~\^'`"] "\\" [ij])                                     terminator     &{ return lookup(text, 4); }{ return lookup(text); }
  / text:("\\={\\i}")                                                                 &{ return lookup(text, 5); }{ return lookup(text); }
  / text:("\\" [Huvc] " " [a-zA-Z])                                    terminator     &{ return lookup(text, 6); }{ return lookup(text); }
  / text:("\\mathrm{" [^}]+ "}")                                                      &{ return lookup(text, 7); }{ return lookup(text); }
  / text:("\\" [a-zA-Z]+ "{" "\\"? [0-9a-zA-Z]+ "}" ( "{" "\\"? [0-9a-zA-Z]+ "}" )?)  &{ return lookup(text, 8); }{ return lookup(text); }
  / text:("\\" [a-z]+ "\\" [a-zA-Z]+)                                  terminator     &{ return lookup(text, 9); }{ return lookup(text); }
  / text:("\\" [a-z]+ "{" [,\.a-z0-9]+ "}")                                           &{ return lookup(text, 10); }{ return lookup(text); }
  / text:("\\" [0-9a-zA-Z]+)                                           terminator     &{ return lookup(text, 11); }{ return lookup(text); }
  / text:("\^" [123] " "?)                                                            &{ return lookup(text, 12); }{ return lookup(text); }
  / text:("\^{" [123] "}")                                                            &{ return lookup(text, 13); }{ return lookup(text); }
  / text:("\\" [\.~\^'`"] "{" [a-zA-Z] "}")                                           &{ return lookup(text, 14); }{ return lookup(text); }
  / text:("\\" [=kr] "{" [a-zA-Z] "}")                                                &{ return lookup(text, 15); }{ return lookup(text); }
  / text:("\\" [\.=][a-zA-Z])                                          terminator     &{ return lookup(text, 16); }{ return lookup(text); }
  / text:("\^\\circ")                                                  terminator     &{ return lookup(text, 17); }{ return lookup(text); }
  / text:("''" +)                                                                     &{ return lookup(text, 18); }{ return lookup(text); }
  / text:("\\" [~\^'`"][a-zA-Z] " "?)                                                 &{ return lookup(text, 19); }{ return lookup(text); }
  / text:("\\" [^a-zA-Z0-9])                                                          &{ return lookup(text, 20); }{ return lookup(text); }
  / text:("\\ddot{\\" [a-z]+ "}")                                                     &{ return lookup(text, 21); }{ return lookup(text); }
  / text:("~")                                                                        &{ return lookup(text, 22); }{ return lookup(text); }
  / text:("\\sqrt\[" [234] "\]")                                                      &{ return lookup(text, 23); }{ return lookup(text); }
