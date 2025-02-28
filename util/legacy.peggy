{
  const identifier = /^(?![0-9])[_$a-zA-Z][_$a-zA-Z0-9]*$/

  const Alias = require('../content/key-manager/alias.json')
  const Methods = require('../gen/api/key-formatter').methods

  function get_method(method, prefix) {
    method = (prefix || '') + method.toLowerCase().replace(/[-.]/g, '')
    method = Alias[method] || method
    return Methods[method] || {}
  }

  function literal(v, noident) {
    if (v instanceof RegExp) return `/${v.source}/${v.flags}`

    if (Array.isArray(v)) return '[' + v.map(literal).join(', ') + ']'

    switch (typeof v) {
      case 'undefined':
        return 'undefined'
      case 'number':
      case 'boolean':
        return `${v}`
      case 'string':
        return JSON.stringify(v)
    }
    throw new Error(`unexpected argument value ${typeof v} ${JSON.stringify(v)}`)
  }

  function match(fn, args, text, error) {
    if (!fn.match(/^[$_]/)) error(`unknown operator ${fn}`)

    const method = get_method(fn)

    if (!method.name) {
      switch (fn[0]) {
        case '$': error(`unknown function ${JSON.stringify(text)}`)
        case '_': error(`unknown filter ${JSON.stringify(text)}`)
      }
    }
    if (method.rest) error('handle rest parameters inline')

    // kludge for regexes, otherwise length validation fails
    if (method.name === '_replace' && args.length === 3 && args[2] === 'regex') {
      args = [ new RegExp(args[0]), args[1] ]
    }

    if (args.length > method.parameters.length) error(`too many arguments for ${text}`)

    function validate(rule, value, indent='') {
      if (typeof value !== 'string') return value

      if (rule.anyOf) {
        for (const r of rule.anyOf) {
          try {
            return validate(r, value, indent + '  ')
          }
          catch (err) {
          }
        }
        error(`could not validate ${typeof value} ${value} against ${JSON.stringify(rule)}`)
      }

      switch (rule.type) {
        case 'string':
        case 'template':
          return value
        case 'boolean':
          return value.toLowerCase() === 'true'
        case 'number':
          if (!value.trim().match(/^-?[0-9]+$/)) error(`${value} is not a number`)
          return parseInt(value)
        default:
          error(`unexpected argument ${JSON.stringify(rule)} ${typeof value} ${value}`)
      }
    }

    const params = {}
    args.forEach((arg, i) => {
      if (typeof arg === 'undefined') return

      const name = method.parameters[i]
      params[name] = arg
    }, {})

    /*
    const argerror = method.validate(params) // validates and coerces
    if (argerror) {
      error(`${text}: ${argerror}`)
    }
    else {
    */
    const passed = method.parameters.filter(p => p in params)
    const passed_j = ',' + passed.join(',') + ','
    const all_j = ',' + method.parameters.join(',') + ','

    if (!passed.length) {
      args = ''
    }
    else if (method.parameters.length === 1 || (method.parameters.length === 2 && all_j.startsWith(passed_j) && passed_j.match(/,(start|n),/))) {
      args = passed.map(p => literal(params[p]))
    }
    else {
      args = passed.map(p => `${p}=${literal(params[p])}`).join(',')
    }
    if (args) args = `(${args})`
    return `${method.name.substr(1)}${args}`
    // }
  }
}

start
  = patterns:pattern+ {
      return patterns.map(chunk => chunk.join(' + ')).join(';\n') + (patterns.length > 1 ? ';' : '')
    }

pattern
  = chunks:chunk+ [\|]? { return chunks.filter(chunk => chunk) }

chunk
  = [ \t\r\n]+                            { return '' }
  / '[]'                                  { return '' }
  / '[0]'                                 { return 'postfix("-%(n)s")' }
  / '[postfix' start:'+1'? pf:stringparam ']' {
        if (start) {
          return `postfix(${literal(pf)}, 1)`
        }
        else {
          return `postfix(${literal(pf)})`
        }
      }
  / '[=' types:$[a-zA-Z/]+ ']'            {
      types = types.toLowerCase().split('/').map(type => type.trim())
      return `type(${types.map(t => literal(t)).join(', ')})`
    }
  / '[language=' languages:$[a-zA-Z/]+ ']'            { // add language checking in parse phase
      languages = [...(new Set(languages.toLowerCase().split('/').map(language => language.trim())))]
      return `language(${languages.map(l => literal(l)).join(', ')})`
    }
  / '[>' min:$[0-9]+ ']'                 {
      if (parseInt(min) === 0) {
        return 'len'
      }
      else {
        return `len('>',${min})`
      }
    }
  / '[' method:method filters:filter* ']' {
      return [method].concat(filters).join('.')
    }
  / chars:$[^\|>\[\]]+                     {
      return literal(chars, true)
    }

method
  = prefix:('auth' / 'Auth' / 'authors' / 'Authors' / 'edtr' / 'Edtr' / 'editors' / 'Editors') rest:$[\.a-zA-Z]* params:fparams? flags:flag* {
      params = params || []

      let input = prefix + rest
      if (input.match(/^(authors|editors)$/i)) { // match $authorsn rather than creators
        input += 'n'
        rest += 'n'
      }

      const args = {
        creator: input.match(/^a/i) ? '*' : 'editor',
      }
      params.forEach((p, i) => {
        const n = parseInt(p)
        if (!n || !isFinite(n)) error(`Unexpected integer value ${p}`)
        args[i ? 'm' : 'n'] = n
      })

      // legacy methods
      switch (input) {
        case 'authors':
        case 'editors':
          args.etal = 'EtAl'
          args.name = typeof args.m === 'number' ? `%(f).${args.m}s` : '%(f)s'
          delete args.m
          break

        // workaround for duplicate-after-lowercase
        case 'auth.etal':
        case 'edtr.etal':
          input = 'authetal2'
          break

        case 'nopunctordash':
          input = 'nopunct'
          args.dash = ''
          break
      }

      let method = get_method(input, '$')
      if (!method.name) error(`Unknown method ${input}`)

      for (const flag of flags) {
        if (flag == 'initials') {
          if (method.parameters.includes('initials')) {
            args.initials = true
          }
          else if (method.name === '$authors') {
            args.name += '%(I)s'
          }
          else {
            error(`unexpected flag '${flag}' on function '${input}'`)
          }
        } else if (flag.length === 1) {
          if (method.parameters.includes('sep')) {
            args.sep = flag
          }
          else {
            error(`unexpected sep on function '${input}'`)
          }
        } else if (flag.length) {
          error(`unexpected flag '${flag}' on function '${input}'`)
        }
      }

      method = match('$' + input, method.parameters.map((p, i) => {
        const v = typeof args[p] !== 'undefined' ? args[p] : method.defaults[i]
        delete args[p]
        return v
      }), input, error);
      const ignored = Object.keys(args)
      if (ignored.length) error(`Unused arguments ${ignored}`)

      if (prefix.match(/^[a-z]/)) method += '.fold'

      return method
    }
  / operator:$([<>=] / [<>!] '=') n:$[0-9]+ {
    if (parseInt(n) === 0 && operator === '>') return 'len'
    return match('$len', [operator, n], operator, error)
  }
  / prop:$([A-Z][a-zA-Z]+) { // before method matching, as method matching is case-insensitive now!
      return prop
    }
  / name:$([a-z][-.a-zA-Z]+) &{ return get_method(name, '$').name } p:fparams? {
      return match('$' + name, p || [], name, error)
    }
  / prop:$([a-zA-Z]+) { // really just an error catcher now
      return prop
    }

fparams
  = n:$[0-9]+ '_' m:$[0-9]+             { return [n, m] }
  / n:$[0-9]+                           { return [n] }
  / s:stringparam                       { return [s] }

flag
  = '+' flag:$[^_:\]]+                 { return flag }

filter
  = ':(' dflt:$[^)]+ ')'                  { return `default(${literal(dflt)})` }
  / ':' ('>'/'longer=') min:$[0-9]+       {
      return parseInt(min) === 0 ? 'len' : `len('>', ${min})`
    }
  / ':' name:$[-a-z]+ params:stringparam* { return match('_' + name, params, name, error) }

stringparam
  = [, =] value:stringparamtext* { return value.join('') }

stringparamtext
  = text:$[^= ,\\\[\]:]+  { return text }
  / '\\' text:.           { return text }
