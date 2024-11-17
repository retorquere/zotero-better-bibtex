/* eslint-disable @typescript-eslint/no-unsafe-function-type, prefer-rest-params, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-shadow */

export type Trampoline = Function & { disabled?: boolean }
// import { log } from './logger/simple'

type Patch = {
  object: any
  method: string
  patch: (f: Function) => Function
}

const patchers: Patcher[] = []

export class Patcher {
  private patches: Patch[] = []
  private trampolines: Trampoline[] = []

  constructor() {
    patchers.push(this)
  }

  public schedule(object: Patch['object'], method: Patch['method'], patch: Patch['patch']): void {
    // log.debug(`patch:schedule ${method}`)
    this.patches.push({ object, method, patch })
  }

  public execute() {
    for (const patch of this.patches) {
      // log.debug(`patch:execute ${patch.method}`)
      this.patch(patch.object, patch.method, patch.patch)
    }
    this.patches.length = 0
  }

  public patch(object: Patch['object'], method: Patch['method'], patch: Patch['patch']): void {
    if (typeof object[method] !== 'function') throw new Error(`monkey-patch: ${ method } is not a function`)
    // log.debug(`patch:patch ${method}`)

    const orig = object[method]
    const patched = patch(orig)
    object[method] = function trampoline() {
      return (trampoline as Trampoline).disabled ? orig.apply(this, arguments) : patched.apply(this, arguments)
    }
    this.trampolines.push(object[method])
  }

  public unpatch() {
    // log.debug('patch:unpatch')
    for (const trampoline of this.trampolines) {
      trampoline.disabled = true
    }
    this.trampolines = []
  }
}

export function patch(object: Patch['object'], method: Patch['method'], patch: Patch['patch']): void {
  if (!patchers.length) {
    new Patcher
  }
  patchers[0].patch(object, method, patch)
}

export function schedule(object: Patch['object'], method: Patch['method'], patch: Patch['patch']): void {
  if (!patchers.length) {
    new Patcher
  }
  patchers[0].schedule(object, method, patch)
}

export function execute() {
  for (const patcher of patchers) {
    patcher.execute()
  }
}

export function unpatch() {
  for (const patcher of patchers) {
    patcher.unpatch()
  }
  patchers.length = 0
}
