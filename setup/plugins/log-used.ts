import * as path from 'path'
import * as fs from 'fs-extra'

export class LogUsedFilesPlugin {
  private name: string
  private type: string

  constructor(name, type = '') {
    this.name = name
    this.type = type
  }

  public apply(compiler) {
    compiler.plugin('after-emit', compilation => {
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
      fs.ensureDirSync(path.dirname(output))
      fs.writeFileSync(output, JSON.stringify(Array.from(used).sort(), null, 2), 'utf-8')
    })
  }
}
