declare namespace Zotero {
  let BetterBibTeX: import('../content/better-bibtex').BetterBibTeX

  let write: (body: string) => void // needed in translators
}

// declare const rootURI: string
declare const FileUtils: any
type DedicatedWorkerGlobalScope = any
declare function importScripts(url: string): void

declare module '*.wasm' {
  const value: any
  export default value
}
