{
  function _method_name(name) {
    return name.replace(/[.-]/g, '_')
  }
  function _method(section, name, argtypes) {
    const expected = options.methods[section][_method_name(name)]
    return expected && argtypes.join(',') === expected.map(p => p.type[0] === "'" ? 'string' : p.type).join(',')
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
      return this.set('-%(n)s', 0)
    },
    alpha: function() {
      return this.set('%(a)s', 0)
    },
    set: function(pf, start) {
      this.postfixes.push(pf)
      return `{ start: ${start ? 1 : 0}, format: ${JSON.stringify(pf)} }`
    },
  }
}

start
  = patterns:pattern+ {
      var body = "\nvar loop, citekey, postfix, chunk;"

      for (var pattern = 0; pattern < patterns.length; pattern++) {
        body += `\nfor (loop = true; loop; loop=false) {\n  citekey = ''; postfix = ${postfix.alpha()};\n\n`
        body += patterns[pattern] + "\n"
        body += "  citekey = citekey.replace(/[\\s{},]/g, '');\n"
        body += "  if (citekey) return {citekey: citekey, postfix: postfix};\n}\n"
      }
      body += `return {citekey: '', postfix: ${postfix.alpha()}};`

      return { formatter: body, postfixes: postfix.postfixes }
    }

pattern
  = blocks:block+ [\|]? { return blocks.filter(block => block).map(block => `  ${block}`).concat(['']).join(";\n") }

block
  = [ \t\r\n]+                            { return '' }
  / '[0]'                                 { return `postfix = ${postfix.numeric()}` }
  / '[postfix' start:'+1'? pf:stringparam ']' { return `postfix = ${postfix.set(pf, start)}` }
  / '[=' types:$[a-zA-Z/]+ ']'            {
      types = types.toLowerCase().split('/').map(type => type.trim()).map(type => options.items.name.type[type.toLowerCase()] || type);
      var unknown = types.find(type => !options.items.valid.type[type])
      if (typeof unknown !== 'undefined') error(`unknown item type "${unknown}; valid types are ${Object.keys(options.items.name.type)}"`);
      return `if (!${JSON.stringify(types)}.includes(this.item.itemType)) break`;
    }
  / '[>' min:$[0-9]+ ']'                 { return `if (citekey.length <= ${min}) break` }
  / '[' method:method filters:filter* ']' {
      return [].concat(method, filters, 'citekey += chunk').join('; ');
    }
  / chars:$[^\|>\[\]]+                     { return `citekey += ${JSON.stringify(chars)}` }

method
  = prefix:('auth' / 'Auth' / 'authors' / 'Authors' / 'edtr' / 'Edtr' / 'editors' / 'Editors') name:$[\.a-zA-Z]* params:n_mparams? flags:flag* {
      params = params || []

      if (prefix.match(/^edtr$/i)) name = name.replace(/^\.edtr\./i, '.auth.')

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

      for (const flag of flags) {
        if (flag == 'initials') {
          if (!pnames.includes('withInitials')) error(`unexpected flag '${flag}' on function '${text()}'`)
          args.withInitials = 'true'
        } else if (flag.length === 1) {
          if (!pnames.includes('joiner')) error(`unexpected joiner on function '${text()}'`)
          args.joiner = JSON.stringify(flag)
        } else if (flag.length) {
          error(`unexpected flag '${flag}' on function '${text()}'`)
        }
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
      if (name == 'zotero') code += `; postfix = ${postfix.numeric()}`
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
  = ':(' text:$[^)]+ ')'  { return `chunk = chunk || ${JSON.stringify(text)}`; }
  / ':>' min:$[0-9]+      { return `if (chunk.length <= ${min}) break` }
  / ':' name:$[-a-z]+ params:stringparam* {
      const method = _method_name(name)
      const expected = options.methods.filter[method]
      if (!expected) error(`unknown filter ${name}`)

      if (params.length > expected.length) error(`filter '${name}' expects at most ${expected.length} parameters`)

      const escaped_params = ['chunk'].concat(_trim_args(`filter ${text()}`, expected, expected.map((p, i) => {
        if (typeof params[i] === 'undefined') return 'undefined'

        switch (p.type) {
          case 'string':
            return JSON.stringify(params[i])
          case 'number':
            if (!params[i].match(/^[0-9]+$/)) error(`expected number parameter ${i + 1} (${p.name}) on filter ${name}, got ${params[i]}`)
            return params[i]
          default:
            if (p.type[0] == "'") {
              if (params[i].match(new RegExp('^(' + p.type.split(' | ').map(c => c.match(/^'([^']+)'$/)[1]).join('|') + ')$'))) {
                return JSON.stringify(params[i])
              } else {
                error(`expected ${p.type} parameter ${i + 1} (${p.name}) on filter ${name}, got ${params[i]}`)
              }
            }
            error(`expected parameter ${i + 1} (${p.name}) of type ${p.type} on filter ${name}`)
        }
      })))

      return `chunk = this._${method}(${escaped_params.join(', ')})`;
    }

stringparam
  = [, =] value:stringparamtext* { return value.join('') }

stringparamtext
  = text:$[^= ,\\\[\]:]+  { return text }
  / '\\' text:.           { return text }
