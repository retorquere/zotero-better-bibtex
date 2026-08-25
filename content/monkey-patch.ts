/* eslint-disable no-restricted-syntax, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unsafe-return */

export class Monkey {
  #enabled = false

  constructor(private name: string) {
  }

  public patch(obj: any, methodName: string, patcher: Function): void {
    const originalMethod = obj[methodName]
    const newMethod = patcher(obj[methodName])

    obj[methodName] = new Proxy(originalMethod, {
      apply: (target, thisArg, argumentsList) => {
        try {
          if (this.#enabled) {
            return newMethod.apply(thisArg, argumentsList)
          }
          else {
            return originalMethod.apply(thisArg, argumentsList)
          }
        }
        catch (err) {
          Zotero.debug(`${this.name} monkey-patch ${methodName} error: ${(err as any).message}`)
          Zotero.logError(err as Error)
          throw err
        }
      },
    })
  }

  disable() {
    this.#enabled = false
  }

  enable() {
    this.#enabled = true
  }
}
