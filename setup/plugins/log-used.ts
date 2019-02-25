import * as path from 'path'
import * as fs from 'fs-extra'

export class LogUsedFilesPlugin {
  private output: string

  constructor(output) {
    this.output = output
  }

  public apply(compiler) {
    compiler.plugin('after-emit', compilation => {
      const used = new Set

      for (let fileDependency of compilation.fileDependencies) {
        fileDependency = path.relative(process.cwd(), fileDependency)
        if (fileDependency.startsWith('node_modules/')) continue
        used.add(fileDependency)
      }

      /*
      for (const asset of Object.values(compilation.assets) as any[]) {
        const fileDependency = path.relative(process.cwd(), asset.existsAt)
        if (fileDependency.startsWith('node_modules/')) continue
        used.add(fileDependency)
      }
      */

      fs.ensureDirSync('gen/log-used')
      fs.writeFileSync(`gen/log-used/${this.output}.json`, JSON.stringify(Array.from(used).sort(), null, 2), 'utf-8')
    })
  }
}
