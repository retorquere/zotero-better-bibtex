{
  const identifier = require('../../gen/ecmascript-6')
  const jsesc = require('jsesc')

  function method_name(method, prefix) {
    return (prefix || '') + method.replace(/[-.]([a-z])/g, (match, c) => c.toUpperCase())
  }

  function literal(v) {
    if (v instanceof RegExp) return `/${v.source}/${v.flags}`

    if (Array.isArray(v)) return '[' + v.map(literal).join(',') + ']'

    switch (typeof v) {
      case 'undefined':
        return 'undefined'
      case 'string':
      case 'boolean':
        return jsesc(v)
      case 'number':
        return identifier.test(v) ? v : jsesc(v)
    }
    throw new Error(`unexpected argument value ${v}`)
  }

  function match(fn, args, text, error) {
    if (!fn.match(/^[$_]/)) error(`unknown operator ${fn}`)

    const method = method_name(fn)

    const meta = options.methods[method]
    if (!meta) {
      switch (method[0]) {
        case '$': error(`unknown function ${JSON.stringify(text)}`)
        case '_': error(`unknown filter ${JSON.stringify(text)}`)
      }
    }
    if (meta.rest) error('handle rest parameters inline')

    // kludge for regexes, otherwise length validation fails
    if (method === '_replace' && args.length === 3 && args[2] === 'regex') {
      args = [ new RegExp(args[0]), args[1] ]
    }

    if (args.length > meta.parameters.length) error(`too many arguments for ${text}`)

    const params = args.reduce((acc, v, i) => {
      const param = meta.parameters[i]
      // horrid kludge for arrays / rest parameters
      acc[param] = v
      return acc
    }, {})

    const argerror = meta.validate(params) // validates and coerces
    if (argerror) {
      error(`${text}: ${argerror}`)
    }
    else {
      let i
      args = meta.parameters.slice(0, args.length).map(arg => params[arg])
      while (args.length && (args[(i = args.length - 1)] === meta.defaults[i] || typeof args[i] === 'undefined')) args.pop()

      if (args.length) {
        args = args.map(arg => literal(arg)).join(',')
        return `${method.substr(1)}(${args})`
      }
      else {
        return method.substr(1)
      }
    }
  }
}

start
  = patterns:pattern+ {
      return patterns.join(' | ')
    }

pattern
  = chunks:chunk+ [\|]? { return chunks.filter(chunk => chunk).join(' +') }

chunk
  = [ \t\r\n]+                            { return '' }
  / '[0]'                                 { return 'postfix("-%(n)s")' }
  / '[postfix' start:'+1'? pf:stringparam ']' { return start ? `postfix(${literal(pf)}, 1)` : `postfix(${literal(pf)})` }
  / '[=' types:$[a-zA-Z/]+ ']'            {
      types = types.toLowerCase().split('/').map(type => type.trim()).map(type => options.items.name.type[type.toLowerCase()] || type);
      var unknown = types.find(type => !options.items.valid.type[type])
      if (typeof unknown !== 'undefined') error(`unknown item type "${unknown}; valid types are ${Object.keys(options.items.name.type)}"`);
      return `type(${types.map(t => literal(t)).join(',')})`
    }
  / '[language=' languages:$[a-zA-Z/]+ ']'            { // add language checking in parse phase
      languages = languages.toLowerCase().split('/').map(language => language.trim()).filter(l => l)
      return `language(${languages.map(l => literal(l)).join(',')})`
    }
  / '[>' min:$[0-9]+ ']'                 { return `len('>',${min})` }
  / '[' method:method filters:filter* ']' {
      return [method].concat(filters).join('.')
    }
  / chars:$[^\|>\[\]]+                     { return jsesc(chars) }

method
  = prefix:('auth' / 'Auth' / 'authors' / 'Authors' / 'edtr' / 'Edtr' / 'editors' / 'Editors') rest:$[\.a-zA-Z]* params:fparams? flags:flag* {
      params = params || []

      const input = prefix + rest

      const fn = method_name(prefix.toLowerCase() + rest, '$')

      const args = {
        creator: prefix.match(/^a/i) ? 'author' : 'editor'
      }

      params.forEach((p, i) => {
        const n = parseInt(p)
        if (!n || !isFinite(n)) error(`Unexpected integer value ${p}`)
        args[i ? 'm' : 'n'] = n
      })

      const paramnames = options.methods[fn].parameters
      if (paramnames.includes('withInitials')) args.withInitials = false
      if (paramnames.includes('joiner')) args.joiner = ''

      for (const flag of flags) {
        if (flag == 'initials') {
          if (typeof args.withInitials === 'undefined') error(`unexpected flag '${flag}' on function '${input}'`)
          args.withInitials = true
        } else if (flag.length === 1) {
          if (typeof args.joiner === 'undefined') error(`unexpected joiner on function '${input}'`)
          args.joiner = flag
        } else if (flag.length) {
          error(`unexpected flag '${flag}' on function '${input}'`)
        }
      }

      let method = match(fn, paramnames.slice(0, Object.keys(args).length).map(p => args[p]), input, error)
      if (prefix.match(/^[ae]/)) method += '.clean'
      return method
    }
  / operator:$([<>=] / [<>!] '=') n:$[0-9]+ {
    const method = {
      '=': 'eq',
      '<': 'lt',
      '>': 'gt',
      '<=': 'le',
      '>=': 'ge',
      '!=': 'ne',
    } || operator
    return match('$len', [operator, n], operator, error)
  }
  / name:$([a-z][-.a-zA-Z]+) &{ return options.methods[method_name(name, '$')] } p:fparams? {
      return match('$' + name, p || [], name, error)
    }
  / prop:$([a-zA-Z]+) {
      const field = options.items.name.field[prop.toLowerCase()]
      if (!field) error(`Unknown field ${JSON.stringify(prop)}`)
      return field
    }

fparams
  = n:$[0-9]+ '_' m:$[0-9]+             { return [n, m] }
  / n:$[0-9]+                           { return [n] }
  / s:stringparam                       { return [s] }

flag
  = '+' flag:$[^_:\]]+                 { return flag }

filter
  = ':(' dflt:$[^)]+ ')'                  { return `_default(${literal(dflt)})` }
  / ':>' min:$[0-9]+                      { return `_len('>',${min})` }
  / ':' name:$[-a-z]+ params:stringparam* { return match('_' + name, params, name, error) }

stringparam
  = [, =] value:stringparamtext* { return value.join('') }

stringparamtext
  = text:$[^= ,\\\[\]:]+  { return text }
  / '\\' text:.           { return text }
