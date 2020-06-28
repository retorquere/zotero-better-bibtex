{
  function _method_name(name) {
    return name.replace(/[.-]/g, '_')
  }
  function _method(section, name, argtypes) {
    const expected = options.methods[section][_method_name(name)]
    return expected && argtypes.join(',') === expected.map(p => p.type).join(',')
  }
  function _trim_args(name, expected, args) {
    if (args.length > expected.length) error(`argument list too long for ${name}`)
    args.forEach((a, i) => {
      if (a === 'undefined' && !expected[i].optional) error(`missing argument ${i + 1} on ${name}`)
    })
    while (args.length && args[args.length - 1] === 'undefined') {
      args.pop()
    }
    return args
  }

  const postfix = {
    postfixes: [],

    numeric: function() {
      return this.set('-%(n)s')
    },
    alpha: function() {
      return this.set('%(a)s')
    },
    set: function(pf) {
      this.postfixes.push(pf)
      return pf
    },
  }
}

start
  = patterns:pattern+ {
      var body = "\nvar loop, citekey, postfix, chunk;"

      for (var pattern = 0; pattern < patterns.length; pattern++) {
        body += `\nfor (loop = true; loop; loop=false) {\n  citekey = ''; postfix = ${JSON.stringify(postfix.alpha())};\n\n`
        body += patterns[pattern] + "\n"
        body += "  citekey = citekey.replace(/[\\s{},]/g, '');\n"
        body += "  if (citekey) return {citekey: citekey, postfix: postfix};\n}\n"
      }
      body += "return {citekey: ''};"

      return { formatter: body, postfixes: postfix.postfixes }
    }

pattern
  = blocks:block+ [\|]? { return blocks.filter(block => block).map(block => `  ${block}`).concat(['']).join(";\n") }

block
  = [ \t\r\n]+                            { return '' }
  / '[0]'                                 { return `postfix = ${JSON.stringify(postfix.numeric())}` }
  / '[=' types:$[a-zA-Z/]+ ']'             {
      types = types.toLowerCase().split('/').map(type => type.trim()).map(type => options.items.name.type[type.toLowerCase()] || type);
      var unknown = types.find(type => !options.items.valid.type[type])
      if (typeof unknown !== 'undefined') error(`unknown item type "${unknown}; valid types are ${Object.keys(options.items.name.type)}"`);
      return `if (!${JSON.stringify(types)}.includes(this.item.type)) break`;
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
      var onlyEditors = (creators === 'edtr' || creators === 'editors');
      if (onlyEditors) creators = (creators == 'edtr') ? 'auth' : 'authors';

      let method = _method_name(creators + name)
      const expected = options.methods.function[method]
      if (!expected) error(`invalid function '${text()}'`)

      const pnames = expected.map(p => p.name)

      let args = {
        withInitials: 'false',
        joiner: "''",
        onlyEditors: (onlyEditors ? 'true' : 'false'),
        n: params[0] || 'undefined',
        m: params[1] || 'undefined',
      }

      flag = flag || '';
      if (flag == 'initials') {
        if (!pnames.includes('withInitials')) error(`unexpected flag '${flag}' on function '${text()}'`)
        args.withInitials = 'true'
      } else if (flag.length === 1) {
        if (!pnames.includes('joiner')) error(`unexpected joiner on function '${text()}'`)
        args.joiner = JSON.stringify(flag)
      } else if (flag.length) {
        error(`unexpected flag '${flag}' on function '${text()}'`)
      }

      switch (params.length) {
        case 0:
          break
        case 1:
          if (!pnames.includes('n')) error(`unexpected parameter on function ${text()}`)
          break
        case 2:
          if (!(pnames.includes('n') && pnames.includes('m'))) error(`unexpected parameters on function ${text()})`)
          break
        default:
          error(`too many parameters for function '${text()}'`)
      }

      args = _trim_args(`function ${text()}`, expected, pnames.map(p => args[p])).join(', ')
      let code = `this.$${method}(${args})`;
      if (scrub) code = `this.clean(${code}, true)`
      code = `chunk = ${code}`

      return code;
    }
  / 'postfix' pf:stringparam { return `postfix = ${JSON.stringify(postfix.set(pf))}` }
  / name:$([a-z][.a-zA-Z]+) &{ return _method('function', name, ['number']) } params:nparam? {
      params = params || []
      return `chunk = this.$${_method_name(name)}(${params.join(', ')})`
    }
  / name:$([a-z][.a-zA-Z]+) &{ return _method('function', name, ['number', 'number']) } params:n_mparams? {
      params = params || []
      return `chunk = this.$${_method_name(name)}(${params.join(', ')})`
    }
  / name:$([a-z][.a-zA-Z]+) &{ return _method('function', name, ['string']) } param:stringparam { // single string param
      return `chunk = this.$${_method_name(name)}(${JSON.stringify(param)})`
    }
  / name:$([a-z][.a-zA-Z]+) &{ return options.methods.function[_method_name(name)] } {
      const params = options.methods.function[_method_name(name)]
      if (params.length !== 0) error(`function '${name}' expects at least one parameter (${params.map(p => p.type + (p.optional ? '?' : '')).join(', ')})`)

      var code = `chunk = this.$${_method_name(name)}()`
      if (name == 'zotero') code += `; postfix = ${JSON.stringify(postfix.numeric())}`
      return code
    }
  / prop:$([a-zA-Z]+) {
      const field = options.items.name.field[prop.toLowerCase()]
      if (!field) error(`Unknown field ${JSON.stringify(prop)}`)
      return `chunk = this.$property(${JSON.stringify(field)})`
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
      const method = _method_name(filter.name)
      const expected = options.methods.filter[method]
      if (!expected) error(`unknown filter ${filter.name}`)

      if (filter.params.length > expected.length) error(`filter '${filter.name}' expects at most ${expected.length} parameters`)

      const params = ['chunk'].concat(_trim_args(`filter ${text()}`, expected, expected.map((p, i) => {
        if (typeof filter.params[i] === 'undefined') return 'undefined'

        switch (p.type) {
          case 'string':
            return JSON.stringify(filter.params[i])
          case 'number':
            if (!filter.params[i].match(/^[0-9]+$/)) error(`expected number parameter ${i + 1} (${p.name}) on filter ${filter.name}, got ${filter.params[i]}`)
            return filter.params[i]
          default:
            error(`expected parameter ${i + 1} (${p.name}) of type ${p.type} on filter ${filter.name}`)
        }
      })))

      return `chunk = this._${method}(${params.join(', ')})`;
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
