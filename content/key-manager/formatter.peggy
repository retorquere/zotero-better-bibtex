{
  function method_name(method, prefix) {
    return (prefix || '') + method.replace(/[.]/g, '__').replace(/-/g, '_')
  }

  function literal(v) {
    if (v instanceof RegExp) return `/${v.source}/${v.flags}`

    if (Array.isArray(v)) return '[' + v.map(literal).join(', ') + ']'

    switch (typeof v) {
      case 'undefined':
        return 'undefined'
      case 'string':
      case 'number':
      case 'boolean':
        return JSON.stringify(v)
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

    // kludge for regexes, otherwise length validation fails
    if (method === '_replace' && args.length === 3 && args[2] === 'regex') {
      args = [ new RegExp(args[0]), args[1] ]
    }

    if (args.length > meta.parameters.length) error(`too many arguments for ${text}`)

    const params = args.reduce((acc, v, i) => {
      const param = meta.parameters[i]
      // horrid kludge for arrays
      if (method === '$language' && param === 'name') v = v.split('/')
      acc[param] = v
      return acc
    }, {})

    const argerror = meta.validate(params) // validates and coerces
    if (argerror) {
      error(`${text}: ${argerror}`)
    }
    else {
      args = meta.parameters.slice(0, args.length).map(arg => params[arg]).map(arg => literal(arg)).join(', ')
      return `${method}(${args})`
    }
  }

  const postfix = {
    postfix: null,
    alpha: { start: 0, format: '%(a)s' },
    numeric: { start: 0, format: '-%(n)s' },

    set: function(pf) {
      if (this.postfix && (this.postfix.start !== pf.start || this.postfix.format !== pf.format)) error(`postfix changed from ${this.postfix.format}+${this.postfix.start} to ${pf.format}+${pf.start}`)
      const expected = `${Date.now()}`
      const found = options.sprintf(pf.format, { a: expected, A: expected, n: expected })
      if (!found.includes(expected)) error(`postfix ${pf.format} does not contain %(a)s, %(A)s or %(n)s`)
      if (found.split(expected).length > 2) error(`postfix ${pf.format} contains multiple instances of %(a)s/%(A)s/%(n)s`)
      this.postfix = { format: pf.format, start: pf.start ? 1 : 0 }
    },
  }
}

start
  = patterns:pattern+ {
      var body = ''

      for (const pattern of patterns) {
        body += `\ntry {\n  let citekey = '';\n`
        for (const block of pattern) {
          body += `  ${block};\n`
        }
        body += '  if (citekey) return citekey;\n}\ncatch (err) {\n  if (!err.next) throw err\n}\n'
      }
      body += `\nreturn '';`

      return { formatter: body, postfix: postfix.postfix || postfix.alpha }
    }

pattern
  = blocks:block+ [\|]? { return blocks.filter(block => block) }

block
  = [ \t\r\n]+                            { return '' }
  / '[0]'                                 { postfix.set(postfix.numeric); return '' }
  / '[postfix' start:'+1'? pf:stringparam ']' { postfix.set({ start: start, format: pf}); return '' }
  / '[=' types:$[a-zA-Z/]+ ']'            {
      types = types.toLowerCase().split('/').map(type => type.trim()).map(type => options.items.name.type[type.toLowerCase()] || type);
      var unknown = types.find(type => !options.items.valid.type[type])
      if (typeof unknown !== 'undefined') error(`unknown item type "${unknown}; valid types are ${Object.keys(options.items.name.type)}"`);
      return `if (!${JSON.stringify(types)}.includes(this.item.itemType)) throw { next: true }`;
    }
  / '[>' min:$[0-9]+ ']'                 { return `if (citekey.length <= ${min}) throw { next: true }` }
  / '[' method:method filters:filter* ']' {
      return `citekey += this.${[method].concat(filters).join('.')}.chunk`
    }
  / chars:$[^\|>\[\]]+                     { return `citekey += ${JSON.stringify(chars)}` }

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

      let method = match(fn, paramnames.slice(0, Object.keys(args).length).map(p => args[p]), input, error);
      if (prefix.match(/^[ae]/)) method = method + '._clean(true)'
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
      if (name === 'zotero') postfix.set(postfix.numeric)
      return match('$' + name, p || [], name, error)
    }
  / prop:$([a-zA-Z]+) {
      const field = options.items.name.field[prop.toLowerCase()]
      if (!field) error(`Unknown field ${JSON.stringify(prop)}`)
      return `getField(${JSON.stringify(field)})`
    }

fparams
  = n:$[0-9]+ '_' m:$[0-9]+             { return [n, m] }
  / n:$[0-9]+                           { return [n] }
  / s:stringparam                       { return [s] }

flag
  = '+' flag:$[^_:\]]+                 { return flag }

filter
  = ':(' dflt:$[^)]+ ')'                  { return `_default(${JSON.stringify(dflt)})` }
  / ':>' min:$[0-9]+                      { return `_len('>', ${min})` }
  / ':' name:$[-a-z]+ params:stringparam* { return match('_' + name, params, name, error) }

stringparam
  = [, =] value:stringparamtext* { return value.join('') }

stringparamtext
  = text:$[^= ,\\\[\]:]+  { return text }
  / '\\' text:.           { return text }
