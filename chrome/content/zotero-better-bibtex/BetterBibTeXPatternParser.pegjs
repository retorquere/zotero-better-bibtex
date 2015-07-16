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
  = callchain:callchain+ postfix:'[0]'? separator:[\|>]? { return {pattern: callchain, separator: separator, postfix: (postfix === '[0]' ? '0' : 'a')}; }

callchain
  = '[' fcall:fcall ']'   { return fcall; }
  / chars:[^\|>\[\]]+     { return {method: 'literal', arguments: [chars.join('')]}; }

fcall
  = method:method filters:filter* { if (filters.length > 0) { method.filters = filters; } return method; }

method
  = prefix:('auth' / 'authors' / 'edtr' / 'editors' ) name:[\.a-zA-Z]* flag:flag? params:mparams? {
    var editorsOnly = (prefix === 'edtr' || prefix === 'editors');
    if (editorsOnly) { prefix = (prefix === 'edtr') ? 'auth' : 'authors'; }
    name = prefix + name.join('');
    if (!params) { params = []; }
    return {method: name, arguments: [editorsOnly, (flag === 'initials')].concat(params)};
  }
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
