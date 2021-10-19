{
  function method_name(method, prefix) {
    return (prefix || '') + method.replace(/[.]/g, '__').replace(/-/g, '_')
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

    if (args.length > meta.arguments.length) error(`too many arguments for ${text}`)

    const params = args.reduce((acc, v, i) => {
      acc[meta.arguments[i]] = v
      return acc
    }, {})

    const argerror = meta.validate(params) // validates and coerces
    if (argerror) {
      error(`${text}: ${argerror}`)
    }
    else {
      args = JSON.stringify(meta.arguments.slice(0, args.length).map(k => params[k])).slice(1, -1)
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
      return `citekey += this.${[method].concat(filters).join('.')}.value`
    }
  / chars:$[^\|>\[\]]+                     { return `citekey += ${JSON.stringify(chars)}` }

method
  = prefix:('auth' / 'Auth' / 'authors' / 'Authors' / 'edtr' / 'Edtr' / 'editors' / 'Editors') rest:$[\.a-zA-Z]* params:fparams? flags:flag* {
      params = params || []

      const input = prefix + rest

      const scrub = (prefix[0] == prefix[0].toLowerCase());
      prefix = prefix.toLowerCase();
      let onlyEditors = false
      if (prefix[0] === 'e') {
        onlyEditors = true
        if (prefix.startsWith('edtr')) rest = rest.replace(/^\.edtr\./i, '.auth.')
        prefix = { edtr: 'auth', editors: 'authors' }[prefix]
      }
      const fn = method_name(prefix + rest, '$')

      const args = {
        onlyEditors: onlyEditors,
      }
      if (params[0]) args.n = params[0]
      if (params[1]) args.m = params[1]

      const argnames = options.methods[fn].arguments
      if (argnames.includes('withInitials')) args.withInitials = false
      if (argnames.includes('joiner')) args.joiner = ''

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

      let method = match(fn, argnames.slice(0, Object.keys(args).length).map(n => args[n]), input, error);
      if (scrub) method += '.scrub()';

      return method;
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
  / ':>' min:$[0-9]+                      { return `_longer(${min})` }
  / ':' name:$[-a-z]+ params:stringparam* { return match('_' + name, params, name, error) }

stringparam
  = [, =] value:stringparamtext* { return value.join('') }

stringparamtext
  = text:$[^= ,\\\[\]:]+  { return text }
  / '\\' text:.           { return text }
