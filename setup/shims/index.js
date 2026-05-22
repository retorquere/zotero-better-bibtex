import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const shims = {
  name: 'shims',
  setup(build) {
    build.onResolve({ filter: /^(node:)?(path|fs|os)$/ }, args => {
      return { path: path.resolve(path.join(__dirname, args.path.replace(/^node:/, '') + '.js')) }
    })
  }
}
