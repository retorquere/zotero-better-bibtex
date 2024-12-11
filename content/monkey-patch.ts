/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unsafe-return */
export class Monkey {
  constructor(public enabled = false) {
  }

  public patch(obj: any, methodName: string, patcher: Function): void {
    const originalMethod = obj[methodName]
    const newMethod = patcher(obj[methodName])

    obj[methodName] = new Proxy(originalMethod, {
      apply: (target, thisArg, argumentsList) => {
        if (this.enabled) {
          return newMethod.apply(thisArg, argumentsList)
        }
        else {
          return originalMethod.apply(thisArg, argumentsList)
        }
      },
    })
  }

  disable() {
    this.enabled = false
  }

  enable() {
    this.enabled = true
  }
}

export const monkey = new Monkey
