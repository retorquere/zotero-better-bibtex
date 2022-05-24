// copied from emscripten
export const environment: { node: boolean, zotero: boolean, name: string } = {
  // require is a function in firefox after importScripts("resource://gre/modules/workers/require.js")
  node: typeof process === 'object' && typeof require === 'function' && typeof importScripts !== 'function',
  // web: typeof window === 'object',
  zotero: typeof Components !== 'undefined',
  name: '',
}
environment.name = Object.entries(environment).map(([name, on]) => on ? name : '').filter(name => name).join('/')
