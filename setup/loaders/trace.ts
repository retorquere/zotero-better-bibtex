import Injector = require('njstrace/lib/injector')
const injector = new Injector({
  emit(kind, err) { throw err },
  log() { }, // tslint:disable-line:no-empty
})

const tracer = `
function __njsTraceEntry__(call) {
  const context = call.file + ': ' + call.name + '@' + call.line;
  Zotero.debug('->' + context)
  return { context: context, start: Date.now() };
}

function __njsTraceExit__(call) {
  let report = '<-' + call.entryData.context + ' took ' + (Date.now() - call.entryData.start);
  if (call.exception) report += ' and threw an error'; // call.returnValue
  Zotero.debug(report)
}

function __njsOnCatchClause__(call) {
}
`

export = function loader(source) {
  const filename = this.resourcePath.substring(process.cwd().length + 1)

  if (filename.split('.').pop() !== 'ts') throw new Error(`Unexpected extension on ${filename}`)

  return tracer + injector.injectTracing(filename, source)
}
