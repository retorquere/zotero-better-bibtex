import * as path from 'path'
import * as fs from 'fs'

export class LogUsedFilesPlugin {
  private name: string
  private type: string

  constructor(name: string, type = '') {
    this.name = name
    this.type = type
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public apply(compiler: { hooks: { afterEmit: { tap: (arg0: string, arg1: (compilation: any) => void) => void } } }) {
    compiler.hooks.afterEmit.tap('LogUsedFilesPlugin', compilation => {
      const used = new Set

      if (this.type === 'translator') used.add(`translators/${this.name}.json`)

      for (let fileDependency of compilation.fileDependencies) {
        fileDependency = path.relative(process.cwd(), fileDependency)
        if (fileDependency.startsWith('node_modules/')) continue
        used.add(fileDependency)
      }

      /* output assets
      for (const asset of Object.values(compilation.assets) as any[]) {
        const fileDependency = path.relative(process.cwd(), asset.existsAt)
        if (fileDependency.startsWith('node_modules/')) continue
        used.add(fileDependency)
      }
      */

      const output = `gen/log-used/${this.type}${this.type ? '.' : ''}${this.name.replace(/ /g, '')}.json`
      fs.mkdirSync(path.dirname(output), { recursive: true })
      fs.writeFileSync(output, JSON.stringify(Array.from(used).sort(), null, 2), 'utf-8')
    })
  }
}
