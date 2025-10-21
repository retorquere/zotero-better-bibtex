/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unsafe-return */

const monkeys: Monkey[] = []

import { log } from './logger.js'

export class Monkey {
  constructor(public enabled = false) {
    monkeys.push(this)
  }

  public patch(obj: any, methodName: string, patcher: Function): void {
    const originalMethod = obj[methodName]
    const newMethod = patcher(obj[methodName])

    obj[methodName] = new Proxy(originalMethod, {
      apply: (target, thisArg, argumentsList) => {
        try {
          if (this.enabled) {
            return newMethod.apply(thisArg, argumentsList)
          }
          else {
            return originalMethod.apply(thisArg, argumentsList)
          }
        }
        catch (err) {
          log.error('monkey-patch:', err)
          throw err
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

  disableAll() {
    for (const m of monkeys) {
      m.enabled = false
    }
  }
}

export const monkey = new Monkey
