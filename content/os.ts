import { is7 } from './client'

import { $OS } from '../gen/osfile-shim'
export const Shim: any = is7 ? $OS : undefined

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
