{
  const identifier = require('../../gen/ecmascript-6')
  const jsesc = require('jsesc')

  function get_method(method, prefix) {
    switch (method) {
      // workaround for duplicate-after-lowercase
      case 'auth.etal':
      case '$auth.etal':
      case 'Auth.etal':
      case '$Auth.etal':
        return options.methods.$authetal2
      case 'edtr.etal':
      case '$edtr.etal':
      case 'Edtr.etal':
      case '$Edtr.etal':
        return options.methods.$edtretal2
      default:
        method = (prefix || '') + method.replace(/[-.]/g, '').toLowerCase()
        return options.methods[method] || {}
    }
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
        return options.migrate && !noident && identifier.test(v) ? v : jsesc(v, { quotes: 'single', wrap: true })
    }
    throw new Error(`unexpected argument value ${v}`)
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

    const params = args.reduce((acc, v, i) => {
      const param = method.parameters[i]
      // horrid kludge for arrays / rest parameters
      acc[param] = v
      return acc
    }, {})

    const argerror = method.validate(params) // validates and coerces
    if (argerror) {
      error(`${text}: ${argerror}`)
    }
    else {
      args = method.parameters.slice(0, args.length).map(arg => params[arg])
      let i
      while (args.length && (args[(i = args.length - 1)] === method.defaults[i] || typeof args[i] === 'undefined')) args.pop()
      args = args.map(arg => literal(arg)).join(', ')

      if (options.migrate) {
        return args.length ? `${method.name.substr(1)}(${args})` : method.name.substr(1)
      }
      else {
        return `${method.name[0] === '$' ? 'this.' : ''}${method.name}(${args})`
      }
    }
  }
}

start
  = patterns:pattern+ {
      if (options.migrate) return pattern.join(' | ')

      var body = ''

      for (const pattern of patterns) {
        body += `\ntry {\n  this.citekey = '';\n`
        for (const block of pattern) {
          body += `  ${block};\n`
        }
        body += '  if (this.citekey) return this.citekey;\n}\ncatch (err) {\n  if (!err.next) throw err\n}\n'
      }
      body += `\nreturn '';`

      return body
    }

pattern
  = blocks:block+ [\|]? { return blocks.filter(block => block) }

block
  = [ \t\r\n]+                            { return '' }
  / '[0]'                                 { return `${options.migrate ? '' : 'this.$'}postfix("-%(n)s")` }
  / '[postfix' start:'+1'? pf:stringparam ']' {
        if (options.migrate && start) {
          return `postfix(${literal(pf)}, 1)`
        }
        else if (options.migrate) {
          return `postfix(${literal(pf)})`
        }
        else {
          return `this.$postfix(${literal(pf)}, ${start ? 1 : 0})`
        }
      }
  / '[=' types:$[a-zA-Z/]+ ']'            {
      types = types.toLowerCase().split('/').map(type => type.trim()).map(type => options.items.name.type[type.toLowerCase()] || type);
      var unknown = types.find(type => !options.items.valid.type[type])
      if (typeof unknown !== 'undefined') error(`unknown item type "${unknown}; valid types are ${Object.keys(options.items.name.type)}"`);
      return `${options.migrate ? '' : 'this.$'}type(${types.map(t => literal(t)).join(', ')})`
    }
  / '[language=' languages:$[a-zA-Z/]+ ']'            { // add language checking in parse phase
      languages = languages.toLowerCase().split('/').map(language => language.trim())
      return `${options.migrate ? '' : 'this.$'}language(${languages.map(l => literal(l)).join(', ')})`
    }
  / '[>' min:$[0-9]+ ']'                 { return `${options.migrate ? '' : 'this.$'}len('>',${min})` }
  / '[' method:method filters:filter* ']' {
      if (options.migrate) {
        return [method].concat(filters).join('.')
      }
      else {
        return `this.citekey += ${[method].concat(filters).join('.')}.chunk`
      }
    }
  / chars:$[^\|>\[\]]+                     {
      if (options.migrate) {
        return literal(chars, true)
      }
      else {
        return `this.citekey += ${literal(chars)}`
      }
    }

method
  = prefix:('auth' / 'Auth' / 'authors' / 'Authors' / 'edtr' / 'Edtr' / 'editors' / 'Editors') rest:$[\.a-zA-Z]* params:fparams? flags:flag* {
      params = params || []

      const input = prefix + rest

      let method = get_method(input, '$')
      if (!method.name) error(`Unknown method ${input}`)

      const args = {
        creator: prefix.match(/^a/i) ? 'author' : 'editor'
      }

      params.forEach((p, i) => {
        const n = parseInt(p)
        if (!n || !isFinite(n)) error(`Unexpected integer value ${p}`)
        args[i ? 'm' : 'n'] = n
      })

      for (const flag of flags) {
        if (flag == 'initials') {
          if (method.parameters.includes('withInitials')) {
            args.withInitials = true
          }
          else {
            error(`unexpected flag '${flag}' on function '${input}'`)
          }
        } else if (flag.length === 1) {
          if (method.parameters.includes('joiner')) {
            args.joiner = flag
          }
          else {
            error(`unexpected joiner on function '${input}'`)
          }
        } else if (flag.length) {
          error(`unexpected flag '${flag}' on function '${input}'`)
        }
      }

      method = match('$' + input, method.parameters.slice(0, args.length).map(arg => args[arg]), input, error);
      if (prefix.match(/^[ae]/)) method += (options.migrate ? '.clean' : '._clean()')
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
  / name:$([a-z][-.a-zA-Z]+) &{ return get_method(name, '$').name } p:fparams? {
      return match('$' + name, p || [], name, error)
    }
  / prop:$([a-zA-Z]+) {
      const field = options.items.name.field[prop.toLowerCase()]
      if (!field) error(`Unknown field ${JSON.stringify(prop)}`)
      if (options.migrate && field.match(/^[a-z]/)) error(`Unexpected cooked field ${field}`)
      return options.migrate ? field : `this.$getField(${literal(field)})`
    }

fparams
  = n:$[0-9]+ '_' m:$[0-9]+             { return [n, m] }
  / n:$[0-9]+                           { return [n] }
  / s:stringparam                       { return [s] }

flag
  = '+' flag:$[^_:\]]+                 { return flag }

filter
  = ':(' dflt:$[^)]+ ')'                  { return `${options.migrate ? '' : '_'}default(${literal(dflt)})` }
  / ':>' min:$[0-9]+                      { return `${options.migrate ? '' : '_'}len('>', ${min})` }
  / ':' name:$[-a-z]+ params:stringparam* { return match('_' + name, params, name, error) }

stringparam
  = [, =] value:stringparamtext* { return value.join('') }

stringparamtext
  = text:$[^= ,\\\[\]:]+  { return text }
  / '\\' text:.           { return text }
