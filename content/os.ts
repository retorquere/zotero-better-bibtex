import { is7 } from './client'

import { $OS } from '../gen/osfile-shim'
export const Shim: any = is7 ? $OS : null
