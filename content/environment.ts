// copied from emscripten
export const environment: { node: boolean, web: boolean, worker: boolean, zotero: boolean, shell: boolean, name: string } = {
  node: typeof process === 'object' && typeof require === 'function',
  web: typeof window === 'object',
  worker: typeof importScripts === 'function',
  zotero: typeof Components !== 'undefined',
  shell: false,
  name: '',
}
environment.shell = !environment.web && !environment.node && !environment.worker
environment.name = Object.entries(environment).map(([name, on]) => on ? name : '').filter(name => name).join('/')
