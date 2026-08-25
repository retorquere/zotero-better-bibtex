/* eslint-disable no-restricted-syntax, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unsafe-return */

export class Monkey {
  #enabled = false
  #terminated = false
  #unpatchers: Array<() => void> = []

  constructor(private name: string) {}

  public patch(obj: any, methodName: string, patcher: Function): void {
    if (this.#terminated) throw new Error(`monkey-patch ${this.name}: Cannot patch after disable() has been called.`)

    const originalMethod = obj[methodName]
    const newMethod = patcher(originalMethod)

    const wrapper = (...args: any[]) => {
      try {
        if (this.#enabled) {
          return newMethod.apply(obj, args)
        }
        else {
          return originalMethod.apply(obj, args)
        }
      }
      catch (err) {
        Zotero.debug(`${this.name} monkey-patch ${methodName} error: ${(err as any).message}`)
        Zotero.logError(err as Error)
        throw err
      }
    }

    // restore callback for this patch
    this.#unpatchers.push(() => {
      if (obj[methodName] === wrapper) obj[methodName] = originalMethod
    })

    obj[methodName] = wrapper
  }

  enable() {
    if (this.#terminated) throw new Error(`${this.name}: Cannot enable a disabled patcher.`)
    this.#enabled = true
  }

  disable() {
    this.#enabled = false
    this.#terminated = true

    // Restore patched methods (in reverse order to cleanly unwind dependencies)
    while (this.#unpatchers.length > 0) {
      const unpatch = this.#unpatchers.pop()
      unpatch?.()
    }
  }
}
