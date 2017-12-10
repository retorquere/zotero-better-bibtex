export default function BailPlugin() {
  this.plugin('done', stats => {
    while (stats.compilation.warnings.length) {
      stats.compilation.errors.push(stats.compilation.warnings.pop())
    }
  })
}
