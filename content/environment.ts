export const environment: { node: boolean, zotero: boolean, name: string } = {
  node: typeof process === 'object' && !process.version, // process.version is empty in the browser shim
  zotero: typeof Components !== 'undefined',
  name: '',
}
environment.name = Object.entries(environment).map(([name, on]) => on ? name : '').filter(name => name).join('/')
