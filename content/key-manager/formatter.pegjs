{
}

start
  = patterns:pattern+ {
      var body = "var loop, citekey, postfix, chunk;\n"

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
  = blocks:block+ [\|]? { return blocks.filter(block => block).map(block => `  ${block}`).concat(['']).join(";\n") }

block
  = [ \t\r\n]+                            { return '' }
  / '[0]'                                 { return `postfix = '0'` }
  / '[=' types:[a-zA-Z/]+ ']'             {
      types = types.join('').toLowerCase().split('/');
      var unknown = types.find(type => !options.itemTypes.has(type));
      if (typeof unknown !== 'undefined') error(`Unknown reference type "${unknown}"`);
      return `if (!${JSON.stringify(types)}.includes(this.item.type.toLowerCase())) break`;
    }
  / '[>' limit:[0-9]+ ']'                 { return `if (citekey.length <= ${limit.join('')}) break` }
  / '[' method:method filters:filter* ']' {
      var call = [method.code].concat(filters);
      if (method.scrub) call.push('chunk = this.clean(chunk)');
      call.push('citekey += chunk')
      return call.join('; ');
    }
  / chars:[^\|>\[\]]+                     { return `citekey += ${JSON.stringify(chars.join(''))}` }

method
  = prefix:('auth' / 'Auth' / 'authors' / 'Authors' / 'edtr' / 'Edtr' / 'editors' / 'Editors') name:[\.a-zA-Z]* params:mparams? flag:flag? {
      var scrub = (prefix[0] == prefix[0].toLowerCase());
      var creators = prefix.toLowerCase();
      var editorsOnly = (creators === 'edtr' || creators === 'editors');
      if (editorsOnly) creators = (creators == 'edtr') ? 'auth' : 'authors';

      flag = flag || '';
      var withInitials = false;
      var joiner = '';
      if (flag == 'initials') {
        withInitials = true;
      } else if (flag.length <= 1) {
        joiner = flag;
      } else {
        error(`Unsupported flag "${flag}" in pattern`)
      }

      var method = creators + name.join('');
      var $method = '$' + method.replace(/\./g, '_');

      if (!options[$method]) error(`Invalid method '${method}' in citekey pattern`)

      var args = [ '' + !!editorsOnly, '' + !!withInitials, JSON.stringify(joiner) ];
      if (params) args = args.concat(params); // mparams already are stringified integers

      var code = `chunk = this.${$method}(${args.join(', ')})`

      return { code: code, scrub: scrub };
    }
  / name:[0\.a-zA-Z]+ params:mparams? {
      name = name.join('');
      var $method = '$' + name.replace(/\./g, '_');
      var code;
      var scrub;

      if (options[$method]) {
        code = `chunk = this.${$method}(${(params || []).join(', ')})`
        if (name == 'zotero') code += `; postfix = '0'`
        scrub = true;
      } else {
        if (!name.match(/^[A-Z][A-Za-z]+$/)) error(`Property access name "${name}" must start with a capital letter and can only contain letters`);
        code = `chunk = this.$property(${JSON.stringify(name)})`
        scrub = false;
      }
      return { code: code, scrub: scrub };
    }

mparams
  = n:[0-9]+ '_' m:[0-9]+             { return [n.join(''), m.join('')] }
  / n:[0-9]+                          { return [n.join('')] }

flag
  = '+' flag:[^_:\]]+                 { return flag.join('') }

filter
  = ':' text:default_filter  { return `chunk = chunk || ${JSON.stringify(text)}`; }
  / ':' f:function_filter   {
      var _filter = '_' + f.name.replace(/-/g, '_');
      if (! options[_filter] ) error(`invalid filter "${f.name}" in pattern`);

      var params = ['chunk'].concat(f.params.map(function(p) { return JSON.stringify(p) }));

      return `chunk = this.${_filter}(${params})`;
    }

default_filter
  = '(' text:[^)]+ ')' { return text.join(''); }

function_filter
  = name:'fold' language:( [, =] ('german' / 'japanese') )? {
      // handle here so the user gets feedback as the pattern is being typed
      return { name: name, params: language ? [ language[1] ] : [] };
    }
  / name:[-a-z]+ params:fparam*  {
      return { name: name.join(''), params: params }
    }

fparam
  = [, =] value:fparamtext+ { return value.join('') }

fparamtext
  = chars:[^= ,\\\]:]+  { return chars.join(''); }
  / "\\" char:.       { return char;  }
