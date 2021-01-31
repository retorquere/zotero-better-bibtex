import * as ts from 'typescript'

export = function loader(source: string): string {
  if (this.cacheable) this.cacheable()

  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.None } })

  /*
  for (const diag of (js.diagnostics || [])) {
    this.emitError(new Error(diag.text()))
  }
  */

  return `module.exports = ${JSON.stringify(js.outputText).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')}`
}
