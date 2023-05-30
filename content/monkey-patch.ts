/* eslint-disable @typescript-eslint/ban-types, prefer-rest-params, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-return */

export type Trampoline = Function & { disabled?: boolean }
const trampolines: Trampoline[] = []

import { enabled } from './startup'

export function patch(object: any, method: string, patcher: (f: Function) => Function, mem?: Trampoline[]): void {
  if (!enabled) return
  if (typeof object[method] !== 'function') throw new Error(`monkey-patch: ${method} is not a function`)

  const orig = object[method]
  const patched = patcher(orig)
  object[method] = function trampoline() {
    return (trampoline as Trampoline).disabled ? orig.apply(this, arguments) : patched.apply(this, arguments)
  }
  trampolines.push(object[method])
  if (mem) mem.push(object[method])
}

export function unpatch(functions?: Trampoline[]) {
  for (const trampoline of (functions || trampolines)) {
    trampoline.disabled = true
  }
}
