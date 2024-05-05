import { is7 } from './client'

import { OS as $OS } from '../gen/osfile'
export const Shim: any = is7 ? $OS : undefined

Shim.Path = {
  ...Shim.Path,
  basename: (path: string) => {
    if (!path) return path
    return path.replace(/[\\/]$/, '').replace(/.*[\\/]/, '')
  },
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
