{
  const identifier = require('../../gen/ecmascript-6')
  const jsesc = require('jsesc')

  function get_method(method, prefix) {
    method = (prefix || '') + method.toLowerCase().replace(/[-.]/g, '')
    return options.methods[method] || {}
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
      if (typeof v !== 'undefined' && v !== method.defaults[i]) acc[method.parameters[i]] = v
      return acc
    }, {})

    const argerror = method.validate(params) // validates and coerces
    if (argerror) {
      error(`${text}: ${argerror}`)
    }
    else {
      if (options.migrate) {
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
      }

      args = method.parameters.map((p, i) => typeof params[p] === 'undefined' ? method.defaults[i] : params[p])
      let i
      while (args.length && (args[(i = args.length - 1)] === method.defaults[i] || typeof args[i] === 'undefined')) args.pop()

      args = args.map(arg => literal(arg)).join(', ')
      return `${method.name[0] === '$' ? 'this.' : ''}${method.name}(${args})`
    }
  }
}

start
  = patterns:pattern+ {
      if (options.migrate) return patterns.map(chunk => chunk.join('+')).join(' | ')

      var body = ''

      for (const pattern of patterns) {
        body += `\ntry {\n  this.citekey = '';\n`
        for (const chunk of pattern) {
          body += `  ${chunk};\n`
        }
        body += '  if (this.citekey) return this.citekey;\n}\ncatch (err) {\n  if (!err.next) throw err\n}\n'
      }
      body += `\nreturn '';`

      return body
    }

pattern
  = chunks:chunk+ [\|]? { return chunks.filter(chunk => chunk) }

chunk
  = [ \t\r\n]+                            { return '' }
  / '[]'                                  { return options.migrate ? "''" : '' }
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
  / '[>' min:$[0-9]+ ']'                 {
      if (options.migrate && parseInt(min) === 0) {
        return 'len'
      }
      else {
        return `${options.migrate ? '' : 'this.$'}len('>',${min})`
      }
    }
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

      let input = prefix + rest

      const args = {
        creator: input.match(/^a/i) ? 'author' : 'editor',
        clean: !input.match(/^[AE]/),
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
      return method
    }
  / operator:$([<>=] / [<>!] '=') n:$[0-9]+ {
    if (options.migrate && parseInt(n) === 0 && operator === '>') return 'len'
    return match('$len', [operator, n], operator, error)
  }
  / prop:$([A-Z][a-zA-Z]+) { // before method matching, as method matching is case-insensitive now!
      const field = options.items.name.field[prop.toLowerCase()]
      if (!field) error(`Unknown field ${JSON.stringify(prop)}`)
      return options.migrate ? prop : `this.$getField(${literal(field)})`
    }
  / name:$([a-z][-.a-zA-Z]+) &{ return get_method(name, '$').name } p:fparams? {
      return match('$' + name, p || [], name, error)
    }
  / prop:$([a-zA-Z]+) { // really just an error catcher now
      if (prop.match(/^[a-z]/)) error(`Direct field access ${prop} must start with a leading capital`)
      const field = options.items.name.field[prop.toLowerCase()]
      if (!field) error(`Unknown field ${JSON.stringify(prop)}`)
      return options.migrate ? prop : `this.$getField(${literal(field)})`
    }

fparams
  = n:$[0-9]+ '_' m:$[0-9]+             { return [n, m] }
  / n:$[0-9]+                           { return [n] }
  / s:stringparam                       { return [s] }

flag
  = '+' flag:$[^_:\]]+                 { return flag }

filter
  = ':(' dflt:$[^)]+ ')'                  { return `${options.migrate ? '' : '_'}default(${literal(dflt)})` }
  / ':' ('>'/'longer=') min:$[0-9]+       {
      if (options.migrate && parseInt(min) === 0) return 'len'
      return `${options.migrate ? '' : '_'}len('>', ${min})`
    }
  / ':' name:$[-a-z]+ params:stringparam* { return match('_' + name, params, name, error) }

stringparam
  = [, =] value:stringparamtext* { return value.join('') }

stringparamtext
  = text:$[^= ,\\\[\]:]+  { return text }
  / '\\' text:.           { return text }
