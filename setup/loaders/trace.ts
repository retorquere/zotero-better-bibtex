import Injector = require('njstrace/lib/injector')
const injector = new Injector({
  emit(kind, err) { throw err },
  log() { }, // tslint:disable-line:no-empty
})

const tracer = `
Zotero.BBTTRacer = Zotero.BBTTRacer || {
  indent: 0,

  enter: function() {
    this.indent += 1
  },

  exit: function() {
    this.indent -= 1
  },

  prefix: function() {
    return '  '.repeat(this.indent)
  },
}

function __njsTraceEntry__(call) {
  const context = call.file + ': ' + call.name + '@' + call.line;
  Zotero.BBTTRacer.enter()
  Zotero.debug(Zotero.BBTTRacer.prefix() + '->' + context + call.args)
  return { context: context, start: Date.now() };
}

function __njsTraceExit__(call) {
  let report = '<-' + call.entryData.context + ' took ' + (Date.now() - call.entryData.start);
  if (call.exception) report += ' and threw an error'; // call.returnValue
  Zotero.debug(Zotero.BBTTRacer.prefix() + report)
  Zotero.BBTTRacer.exit()
}

function __njsOnCatchClause__(call) {
}
`

export = function loader(source) {
  const filename = this.resourcePath.substring(process.cwd().length + 1)

  if (filename.split('.').pop() !== 'ts') throw new Error(`Unexpected extension on ${filename}`)

  if (source.includes('__njsTraceDisable__')) return source

  return tracer + injector.injectTracing(filename, source, true, true)
}
