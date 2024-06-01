import { is7, platform } from './client'

import { OS as $OS } from '../gen/osfile'
export const Shim: any = is7 ? $OS : undefined

if (Shim) {
  // no idea why it was decided the shim should not accept relative paths
  const Path = platform.windows ? { start: /.*\\/, end: /\\$/ } : { start: /.*\//, end: /\/$/ }
  Shim.Path.basename = (path: string) => path && (Shim.Path.normalize(path) as string).replace(Path.end, '').replace(Path.start, '')
}
