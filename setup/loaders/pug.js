const pug = require('pug')

module.exports.pug = {
  name: 'pug',
  setup(build) {
    build.onLoad({ filter: /\.pug$/ }, async (args) => {
      const template_function = pug.compile(await fs.promises.readFile(args.path, 'utf-8'))
        .toString()
        .split('\n')
        .filter(line => !line.match(/^;pug_debug_line = [0-9]+;$/))
        .join('\n')
      
      return {
        contents: `export default ${template_function}`,
        loader: 'js'
      }
    })
  }
}
