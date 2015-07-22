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
  / chars:[^\|>\[\]]+     { return {method: 'literal', scrub: false, arguments: [chars.join('')]}; }

fcall
  = method:method filters:filter* { if (filters.length > 0) { method.filters = filters; } return method; }

method
  = prefix:('auth' / 'Auth' / 'authors' / 'Authors' / 'edtr' / 'Edtr' / 'editors' / 'Editors') name:[\.a-zA-Z]* flag:flag? params:mparams? {
    var scrub = (prefix[0] !== 'A' && prefix[0] !== 'E')
    prefix = prefix.toLowerCase();
    var editorsOnly = (prefix === 'edtr' || prefix === 'editors');
    if (editorsOnly) { prefix = (prefix === 'edtr') ? 'auth' : 'authors'; }
    name = prefix + name.join('');
    if (!params) { params = []; }
    return {method: name, scrub: scrub, arguments: [editorsOnly, (flag === 'initials')].concat(params)};
  }
  / name:[0\.a-zA-Z]+ flag:flag? params:mparams? {
      name = name.join('')
      if (BetterBibTeXPatternFormatter.prototype.methods[name]) {
        return {method: name, scrub: true, arguments: params || []};
      } else {
        return {method: 'property', scrub: false, arguments: [name]};
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
