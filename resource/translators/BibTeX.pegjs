{
  bibtex = {references: [], strings: Dict({}), comments: [], errors: []}
}

start
	= entries:entry* { return bibtex; }
	
entry
  = _* "@comment" _* "{" comment:[^}]* "}" { bibtex.comments.push(comment.join('').trim()); }
  / _* "@string" _* "{" _* str:key_value _* "}" { bibtex.strings.set(str.key, str.value); }
	/ _* "@" !("string" / "comment") reference
  / other:[^@\*]+ { bibtex.comments.push(other.join('')); }

reference
	= type:identifier _* "{" _* id:citekey _* "," values:key_value* "}" _* {
      var ref = Dict({'__type__': type.toLowerCase(), '__key__': id});
      values.forEach(function(v) {
        ref.set(v.key, v.value);
      });
      bibtex.references.push(ref);
    }
  / err:([^\n] / "\n" [^}])* "\n}"? { bibtex.errors.push(err.join('')); }

identifier
	= letters:[a-zA-Z]+ { return letters.join(""); }
	
citekey
  = str:[^,]+ { return str.join(""); }
	
key_value
	= _* key:identifier _* "=" _* val:value _* { return {key: key.trim().toLowerCase(), value: val.trim()}; }
	
value
  = val:[^"{} \t\n\r,]+ ","? {
      val = val.join('');
      return (bibtex.strings.has(val) ? bibtex.strings.get(val) : val);
    }
  / ["] val:[^"]* ["] { return val.join(''); }
  / "{" val:string* "}" ","? {
      val = val.join('').trim();
      while (val.match(/^{.*}$/)) {
        val = val.replace(/^{|}$/gm, '').trim();
      }
      return val;
    }
  / _* "#" _* val:value { return val; }
	
string
  = str:([^\\{}] / "\\" .)+ { return str.join(''); }
  / "{" str:string* "}" { return '{' + str.join('') + '}'; }

_
    = w:[ \t\n\r]+ 
