{
  function method(prefix, name, flag, params, editorsOnly) {
    if (editorsOnly) { prefix = (prefix === 'edtr') ? 'auth' : 'authors'; }
    name = prefix + name.join('');
    if (!params) { params = []; }
    return {method: name, arguments: [editorsOnly, (flag === 'initials')].concat(params)};
  }
  (Zotero.debug || console.log)('PatternParser loaded')
}

start
  = patterns:pattern+ {
      var i, parsed, pattern;

      parsed = [[]];

      for (i = 0; i <  patterns.length; i++) {
        pattern = patterns[i];
        parsed[parsed.length - 1].push(pattern.pattern);
        if (pattern.separator === '>') { parsed.push([]); }
      }

      return parsed;
    }

pattern
  = callchain:callchain+ separator:[\|>]? { return {pattern: callchain, separator: separator}; }

callchain
  = '[' fcall:fcall ']'   { return fcall; }
  / chars:[^\|>\[\]]+      { return {method: 'literal', arguments: [chars.join('')]}; }

fcall
  = method:method filters:filter* { if (filters.length > 0) { method.filters = filters; } return method; }

method
  = prefix:('auth' / 'authors') name:[\.a-zA-Z]* flag:flag? params:mparams?     { return method(prefix, name, flag, params, false); }
  / prefix:('edtr' / 'editors') postfix:[\.a-zA-Z]* flag:flag? params:mparams?  { return method(prefix, name, flag, params, true); }
  / name:[\.a-zA-Z]+ flag:flag? params:mparams? {
      name = name.join('')
      if (BetterBibTeXPatternFormatter.prototype.methods[name]) {
        return {method: name, arguments: params || []};
      } else {
        return {method: 'property', arguments: [name]};
      }
    }

mparams
  = n:[0-9]+ '_' m:[0-9]+             { return [parseInt(n.join('')), parseInt(m.join(''))] }
  / n:[0-9]+                          { return [parseInt(n.join(''))] }

flag
  = '+' flag:[^_:\]]+                 { return flag.join('') }

filter
  = ':(' def:[^)]+ ')'                { return {filter: 'ifempty', arguments: [def.join('')]}; }
  / ':' name:[^:\],]+ params:fparam*  { return {filter: name.join(''), arguments: params}; }

fparam
  = ',' param:[^,\]:]+                { return param.join('') }
