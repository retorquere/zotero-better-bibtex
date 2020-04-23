{
  function _method(section, name, args, skip) {
    name = name.replace(/[.-]/g, '_')
    var margs = options.methods[section][name]
    if (!margs) return false
    if (skip) margs = margs.slice(skip)
    if (typeof args === 'undefined') return margs
    if (typeof args === 'number') return (margs.length === args) ? margs : false
    if (typeof args === 'string') return (margs.join(' ') === args) ? margs : false
    if (args instanceof RegExp) return (margs.join(' ').match(args)) ? margs : false
    return margs
  }
  function _function(name, args) {
    return _method('functions', name, args)
  }
  function _filter(name, args) {
    return _method('filters', name, args, 1)
  }
}

start
  = patterns:pattern+ {
      var body = "\nvar loop, citekey, postfix, chunk;\nvar itemType = this.item.type.toLowerCase();"

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
  / '[=' types:$[a-zA-Z/]+ ']'             {
      types = types.toLowerCase().split('/');
      var unknown = types.find(type => !options.itemTypes.has(type));
      if (typeof unknown !== 'undefined') error(`unknown reference type "${unknown}"`);
      return `if (!${JSON.stringify(types)}.includes(itemType)) break`;
    }
  / '[>' limit:$[0-9]+ ']'                 { return `if (citekey.length <= ${limit}) break` }
  / '[' method:method filters:filter* ']' {
      return [].concat(method, filters, 'citekey += chunk').join('; ');
    }
  / chars:$[^\|>\[\]]+                     { return `citekey += ${JSON.stringify(chars)}` }

method
  = prefix:('auth' / 'Auth' / 'authors' / 'Authors' / 'edtr' / 'Edtr' / 'editors' / 'Editors') name:$[\.a-zA-Z]* params:n_mparams? flag:flag? {
      params = params || []
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
        error(`unexpected flag '${flag}' on '${prefix}${name}${params.join('_')}' in citekey pattern`)
      }

      var method = (creators + name).replace(/\./g, '_');
      const expected = options.methods.functions[method]
      if (!expected) error(`invalid function '${prefix}${name}'`)
      if (params.length > 1 && !expected.includes('m')) error(`invalid function '${prefix}${name}${params.join('_')}'`)
      if (params.length > 0 && !expected.includes('n')) error(`invalid function '${prefix}${name}${params.join('_')}'`)
      if (withInitials && !expected.includes('withInitials')) error(`unexpected flag on '${prefix}${name}${params.join('_')}'`)
      if (joiner && !expected.includes('joiner')) error(`unexpected joiner on '${prefix}${name}${params.join('_')}'`)

      var args = [ '' + !!editorsOnly, '' + !!withInitials, JSON.stringify(joiner) ];
      args = args.concat(params); // n_mparams already are stringified integers

      var code = `this.$${method}(${args.join(', ')})`;
      if (scrub) code = 'this.clean(' + code + ', true)';
      code = 'chunk = ' + code;

      return code;
    }
  / name:$([a-z][.a-zA-Z]+) &{ return _function(name, 'n') } params:nparam? {
      params = params || []
      return `chunk = this.$${name.replace(/\./g, '_')}(${params.join(', ')})`
    }
  / name:$([a-z][.a-zA-Z]+) &{ return _function(name, 'n m') } params:n_mparams? {
      params = params || []
      return `chunk = this.$${name.replace(/\./g, '_')}(${params.join(', ')})`
    }
  / name:$([a-z][.a-zA-Z]+) &{ return _function(name, 1) } param:stringparam { // single string param
      return `chunk = this.$${name.replace(/\./g, '_')}(${JSON.stringify(param)})`
    }
  / name:$([a-z][.a-zA-Z]+) &{ return _function(name, 0) } {
      var args = _function(name)
      if (!args) error (`Unexpected function '${name}'`)
      if (args.length !== 0) error(`function '${name}' expects at least one parameter (${args.join(', ')})`)

      var code = `chunk = this.$${name.replace(/\./g, '_')}()`
      if (name == 'zotero') code += `; postfix = '0'`
      return code
    }
  / prop:$([a-zA-Z]+) &{ return options.fieldNames[prop.toLowerCase()] } {
      return `chunk = this.$property(${JSON.stringify(options.fieldNames[prop.toLowerCase()])})`
    }

nparam
  = n:$[0-9]+                          { return [n] }

n_mparams
  = n:$[0-9]+ '_' m:$[0-9]+             { return [n, m] }
  / nparam

flag
  = '+' flag:$[^_:\]]+                 { return flag }

filter
  = ':' text:default_filter  { return `chunk = chunk || ${JSON.stringify(text)}`; }
  / ':' filter:function_filter {
      var args = _filter(filter.name)
      if (!args) error(`unexpected filter name '${filter.name}'`)
      if (filter.params.length > args.length) error(`filter '${filter.name}' expects at most ${args.length} parameters (${args.join(', ')})`)

      const method = '_' + filter.name.replace(/-/g, '_');
      const params = ['chunk'].concat(filter.params.map(function(p) { return JSON.stringify(p) }));

      return `chunk = this.${method}(${params.join(', ')})`;
    }

default_filter
  = '(' text:$[^)]+ ')' { return text }

function_filter
  = name:'fold' language:( [, =] ('german' / 'japanese') )? {
      // handle here so the user gets feedback as the pattern is being typed
      return { name: name, params: language ? [ language[1] ] : [] };
    }
  / name:$[-a-z]+ params:stringparam*  {
      return { name: name, params: params }
    }

stringparam
  = [, =] value:stringparamtext+ { return value.join('') }

stringparamtext
  = text:$[^= ,\\\[\]:]+  { return text }
  / '\\' text:.           { return text }
