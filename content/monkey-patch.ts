/* eslint-disable no-restricted-syntax, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unsafe-return */

import { alert } from './prompt'

export class Monkey {
  #enabled = false
  #terminated = false
  #unpatchers: Array<() => void> = []

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
    if (Cu.isDeadWrapper(obj[methodName])) {
      alert({
        title: 'Better BibTeX startup error',
        text: 'Better BibTeX has experienced a startup error. Please restart Zotero to resolve. If restarting does not resolve it, please report on https://github.com/retorquere/zotero-better-bibtex/issues/3590',
      })
      return
    }
    if (this.#terminated) {
      throw new Error(`${this.name}: Cannot patch after disable() has been called.`)
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
    if (this.#terminated) {
      throw new Error(`${this.name}: Cannot enable a disabled patcher.`)
    }
    this.#enabled = true
  }

  disable() {
    this.#terminated = true
    this.#enabled = false

    while (this.#unpatchers.length > 0) {
      const unpatch = this.#unpatchers.pop()
      unpatch?.()
    }
  }
}
