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
  / other:[^@\*]+ { bibtex.comments.push(join(other)); }

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
  /* / err:([^\n] / "\n" [^}])+ stop:"\n}"? { bibtex.errors.push('@' + join(err) + (stop ? stop : '')); } */

identifier
	= chars:[a-zA-Z]+ { return join(chars); }
	
citekey
  = str:[^,]+ { return join(str); }
	
key_value
	= _* key:key _* "=" _* val:value _* ("," _*)? { return {key: key.trim().toLowerCase(), value: val.trim()}; }

key
  = key:[^ \t\n\r=]+ { return join(key); }

value
  = val:[^#"{} \t\n\r,]+ {
      val = join(val);
      return (bibtex.strings.has(val) ? bibtex.strings.get(val) : val);
    }
  / ["] val:[^"]* ["] { return join(val); }
  / "{" val:string* "}" {
      val = join(val).trim();
      while (val.match(/^{.*}$/)) {
        val = val.replace(/^{|}$/gm, '').trim();
      }
      return val;
    }
  / _* "#" _* val:value { return val; }
	
string
  = str:([^\\{}] / "\\" .)+ { return join(str); }
  / "{" str:string* "}" { return '{' + join(str) + '}'; }

_
    = w:[ \t\n\r]+ 
