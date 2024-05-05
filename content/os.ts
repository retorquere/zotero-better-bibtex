import { is7, platform } from './client'

import { print } from './logger'
import { OS as $OS } from '../gen/osfile'
export const Shim: any = is7 ? $OS : undefined

if (Shim) {
  // no idea why it was decided the shim should not accept relative paths
  const Path = platform.windows ? { start: /.*\\/, end: /\\$/ } : { start: /.*\//, end: /\/$/ }
  Shim.Path.basename = (path: string) => path && (Shim.Path.normalize(path) as string).replace(Path.end, '').replace(Path.start, '')
}

/*
if (is7 && !Shim.Path.split) {
  Shim.Path.split = (path: string) => {
    path = Shim.Path.normalize(path)

    if (Services.appinfo.OS === 'WINNT') {
      const absolute = !!path.match(/^[A-Z]:\\/i)
      const components = path.replace(/^[A-Z]:\\/i, '').replace(/\\$/, '').split('\\')
      const winDrive = absolute ? path[0] : undefined
      return { absolute, components, winDrive }
    }
    else {
      const absolute = path[0] === '/'
      const components = path.replace(/^\//, '').replace(/\/$/, '').split('/')
      return { absolute, components }
    }
  }
}
*/
