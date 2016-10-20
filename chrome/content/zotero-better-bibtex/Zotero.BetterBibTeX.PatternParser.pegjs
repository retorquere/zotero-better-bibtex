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
  / chars:[^\|>\[\]]+     { return {method: Zotero.BetterBibTeX.PatternFormatter.prototype.methods.literal, scrub: false, arguments: [chars.join('')], filters: []}; }

fcall
  = method:method filters:filter* { method.filters = filters; return method; }

method
  = prefix:('auth' / 'Auth' / 'authors' / 'Authors' / 'edtr' / 'Edtr' / 'editors' / 'Editors') name:[\.a-zA-Z]* params:mparams? flag:flag? {
      var scrub = (prefix[0] !== 'A' && prefix[0] !== 'E')
      prefix = prefix.toLowerCase();
      var editorsOnly = (prefix === 'edtr' || prefix === 'editors');
      if (editorsOnly) { prefix = (prefix === 'edtr') ? 'auth' : 'authors'; }
      name = prefix + name.join('');
      if (!params) { params = []; }

      var method = Zotero.BetterBibTeX.PatternFormatter.prototype.methods[name];
      if (typeof method === 'function') {
        return {name: name, method: method, scrub: scrub, arguments: [editorsOnly, (flag === 'initials')].concat(params)};
      } else {
        Zotero.BetterBibTeX.debug('invalid pattern:', name, 'method:', typeof method);
        throw new Error('invalid pattern "' + name + '"');
      }
    }
  / '>' chars:[0-9]+ {
      var method = Zotero.BetterBibTeX.PatternFormatter.prototype.methods['>'];
      return {name: '>', method: method, scrub: false, arguments: [parseInt(chars)]};
    }
  / name:[0\.a-zA-Z]+ flag:flag? params:mparams? {
      name = name.join('')
      var method = Zotero.BetterBibTeX.PatternFormatter.prototype.methods[name];
      if (method) {
        return {name: name, method: method, scrub: (name != 'journal' && name != 'zotero'), arguments: params || []};
      } else {
        return {name: name, method: Zotero.BetterBibTeX.PatternFormatter.prototype.methods.property, scrub: false, arguments: [name]};
      }
    }

mparams
  = n:[0-9]+ '_' m:[0-9]+             { return [parseInt(n.join('')), parseInt(m.join(''))] }
  / n:[0-9]+                          { return [parseInt(n.join(''))] }

flag
  = '+' flag:[^_:\]]+                 { return flag.join('') }

filter
  = ':(' def:[^)]+ ')'                { return {filter: 'ifempty', arguments: [def.join('')]}; }
  / ':' name:[^:\],]+ params:fparam*  {
      name = name.join('')
      if (! Zotero.BetterBibTeX.PatternFormatter.prototype.filters[name]) {
        throw new Error('invalid filter "' + name + '"');
      }
      return {filter: name, arguments: params};
    }

fparam
  = ',' value:fparamtext+ { return value.join('') }

fparamtext
  = chars:[^,\\\]:]+  { return chars; }
  / "\\" char:.       { return char;  }
