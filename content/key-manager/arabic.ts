/* eslint-disable @typescript-eslint/no-unsafe-return */

import ara from 'jslingua/src/ara/ara.trans.mjs'
ara.s('buckwalter')

export function transliterate(str: string): string {
  return ara.t(str)
}
