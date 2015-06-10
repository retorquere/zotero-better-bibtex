{
  function method(prefix, name, params, editorsOnly) {
    if (editorsOnly) { prefix = (prefix === 'edtr') ? 'auth' : 'authors'); }
    name = prefix + name.join('');
    if (!params) { params = []; }
    return {method: name, arguments: [editorsOnly, (flag === 'initials')].concat(params)};
  }
}

start
  = patterns:pattern+ { return patterns; }

pattern
  = callchain:callchain+ '|'? { return callchain; }

callchain
  = '[' fcall:fcall ']'   { return fcall; }
  / chars:[^\|\[\]]+      { return {method: 'literal', arguments: chars.join('')}; }

fcall
  = method:method filters:filter* { return [method].concat(filters); }

method
  = prefix:('auth' / 'authors') name:[\.a-zA-Z]* flag:flag? params:mparams? { return method(prefix, name, params, false); }
  / prefix:('edtr' / 'editors') postfix:[\.a-zA-Z]* flag:flag? params:mparams? { return method(prefix, name, params, true); }
  / name:[\.a-zA-Z]+ flag:flag? params:mparams? {
      name = name.join('')
      if (BetterBibTeX.CitekeyFormatter.prototype.methods[method]) {
        return {method: name, arguments: params || []};
      } else {
        return {method: 'property', arguments: [method]};
      }
    }

mparams
  = n:[0-9]+ '_' m:[0-9]+ { return [parseInt(n.join('')), parseInt(m.join(''))] }
  / n:[0-9]+ { return [parseInt(n.join(''))] }

flag
  = '+' flag:[^_:\]]+ { return flag.join('') }

filter
  = ':(' def:[^)]+ ')' { return {filter: 'ifempty', arguments: [def.join('')]}; }
  / ':' name:[^:\],]+ params:fparam* {
      return {filter: name.join(''), arguments: params};
    }

fparam
  = ',' param:[^,\]:]+ { return param.join('') }
