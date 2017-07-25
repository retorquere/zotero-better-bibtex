{
}

start
  = patterns:pattern+ {
      var body = "var loop, citekey, postfix;\n"

      for (var pattern = 0; pattern < patterns.length; pattern++) {
			  body += "\nfor (loop = true; loop; loop=false) {\n  citekey = ''; postfix = 'a';\n\n"
        body += patterns[pattern] + "\n"
        body += "  citekey = citekey.replace(/[\\s{},]/g, '');\n"
        body += "  if (citekey) return {citekey: citekey, postfix: postfix};\n}\n"
      }
      body += "return {citekey: ''};"

      return body;
    }

pattern
  = blocks:block+ [\|]? { return blocks.map(function(block) { return '  ' + block}).concat(['']).join(";\n") }

block
  = '[0]'                                 { return 'postfix = "0"' }
  / '[>' limit:[0-9]+ ']'                 { return "if (citekey.length <= " + limit.join('') + ") { break }" }
  / '[' method:method filters:filter* ']' {
        var block = method.js;
        filters.forEach(function(filter) { block = filter.pre + block + filter.post });
        block = 'citekey += ' + block;
        if (method.postfix) block += '; postfix = ' + JSON.stringify(method.postfix);
        return block;
    }
  / chars:[^\|>\[\]]+                     { return "citekey += " + JSON.stringify(chars.join('')) }

method
  = prefix:('auth' / 'Auth' / 'authors' / 'Authors' / 'edtr' / 'Edtr' / 'editors' / 'Editors') name:[\.a-zA-Z]* params:mparams? flag:flag? {
      var scrub = (prefix[0] == prefix[0].toLowerCase());
      var creators = prefix.toLowerCase();
      var editorsOnly = (creators === 'edtr' || creators === 'editors');
      if (editorsOnly) creators = (creators == 'edtr') ? 'auth' : 'authors';

      if (flag && flag != 'initials') throw new Error("Unsupported flag " + flag + " in pattern")
      var withInitials = (flag == 'initials');

      var method = creators + name.join('');
      if (!options.methods[method]) throw new Error("Invalid method '" + method + "' in citekey pattern")

      var args = [ '' + !!editorsOnly];
      if (withInitials || (params && params.length)) args.push('' + withInitials);
      if (params) args = args.concat(params);

      var js = 'this.methods.' + method + '.call(this, ' + args.join(', ') + ')';
      if (scrub) js = 'this.clean(' + js + ')';

      return {js: js};
    }
  / name:[0\.a-zA-Z]+ params:mparams? {
      name = name.join('');

      if (options.methods[name]) {
        params = (params && params.length) ? [''].concat(params) : [];
        return { js: 'this.methods.' + name + '.call(this' + params.join(', ') + ')', postfix: (name == 'zotero') ? '0' : null }
      } else {
        if (name.charCodeAt(0) < 'A'.charCodeAt(0) || name.charCodeAt(0) > 'Z'.charCodeAt(0)) throw new Error('Property access name "' + name + '" must start with a capital letter');
        return { js: 'this.methods.property.call(this, ' + JSON.stringify(name) + ')' }
      }
    }

mparams
  = n:[0-9]+ '_' m:[0-9]+             { return [n.join(''), m.join('')] }
  / n:[0-9]+                          { return [n.join('')] }

flag
  = '+' flag:[^_:\]]+                 { return flag.join('') }

filter
  = ':(' def:[^)]+ ')'                { return { pre: 'this.filters.ifempty.call(this, ', post: ', ' + JSON.stringify(def.join('')) + ')' } }
  / ':' name:[^:\],]+ params:fparam*  {
      name = name.join('')
      if (! options.filters[name]) throw new Error('invalid filter "' + name + '" in pattern');

      params = (params && params.length) ? [''].concat(params.map(function(p) { return JSON.stringify(p) })) : [];

      return {
        pre: 'this.filters.' + name + '.call(this, ',
        post: params.join(', ') + ')'
      }
    }

fparam
  = ',' value:fparamtext+ { return value.join('') }

fparamtext
  = chars:[^,\\\]:]+  { return chars; }
  / "\\" char:.       { return char;  }
