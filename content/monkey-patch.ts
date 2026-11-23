/* eslint-disable no-restricted-syntax, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unsafe-return */

import { confirm } from './prompt'

export class Monkey {
  #enabled = false
  #dead = false
  #unpatchers: undefined | Array<() => void> = []

  constructor(private name: string) {}

  private needsProxy(fn: any): boolean {
    if (typeof fn !== 'function') return false

    // Check if the function has custom attached properties or static methods
    if (Object.getOwnPropertyNames(fn).find(key => !['length', 'name', 'prototype', 'arguments', 'caller'].includes(key))) return true

    // Check if it's a constructable class or constructor function
    // (Arrow functions and bound functions lack a .prototype property)
    if (fn.prototype && fn.prototype.constructor === fn) return true

    return false
  }

  public patch(obj: any, methodName: string, patcher: Function): void {
    if (!this.#unpatchers) {
      throw new Error(`${this.name}: Cannot patch after disable() has been called.`)
    }
    if (Cu.isDeadWrapper(obj[methodName])) {
      if (this.#dead) return
      this.#dead = true
      if (confirm({
        title: 'Better BibTeX startup error',
        text: `Better BibTeX has experienced a startup error. Please restart Zotero to resolve it.
              If restarting does not resolve it, please report on
              https://github.com/retorquere/zotero-better-bibtex/issues/3590 .
              Do you want to restart now?`.replace(/  */g, ' '),
      })) {
        Zotero.Utilities.Internal.quit(true)
      }
      else {
        return
      }
    }

    const originalMethod = obj[methodName]
    const newMethod = patcher(originalMethod)

    let wrapper: any

    const invoke = (thisArg: any, args: any[]) => {
      try {
        if (this.#enabled) {
          return newMethod.apply(thisArg, args)
        }
        else {
          return originalMethod.apply(thisArg, args)
        }
      }
      catch (err) {
        Zotero.debug(`${this.name} monkey-patch ${methodName} error: ${(err as any).message}`)
        Zotero.logError(err as Error)
        throw err
      }
    }

    if (this.needsProxy(originalMethod)) {
      // Use Proxy for complex functions, constructors, or functions with metadata/properties
      wrapper = new Proxy(originalMethod, {
        apply: (_target, thisArg, argumentsList) => invoke(thisArg, argumentsList),
        construct: (_target, argumentsList, newTarget) => {
          if (this.#enabled) {
            return Reflect.construct(newMethod, argumentsList, newTarget)
          }
          return Reflect.construct(originalMethod, argumentsList, newTarget)
        },
      })
    }
    else {
      // Fallback to fast standard closure for plain methods
      wrapper = (...args: any[]) => invoke(obj, args)
    }

    this.#unpatchers.push(() => {
      if (obj[methodName] === wrapper) {
        obj[methodName] = originalMethod
      }
    })

    obj[methodName] = wrapper
  }

  enable() {
    if (!this.#unpatchers) {
      throw new Error(`${this.name}: Cannot enable a disabled patcher.`)
    }
    this.#enabled = true
  }

  disable() {
    if (!this.#unpatchers) return
    this.#enabled = false

    for (const unpatch of this.#unpatchers) {
      unpatch?.()
    }
    this.#unpatchers = undefined
  }
}
