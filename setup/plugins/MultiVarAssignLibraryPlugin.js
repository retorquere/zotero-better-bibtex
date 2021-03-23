const { ConcatSource } = require('webpack-sources')
const AssignLibraryPlugin = require('webpack/lib/library/AssignLibraryPlugin')
const EnableLibraryPlugin = require('webpack/lib/library/EnableLibraryPlugin')

const type = 'assign-multi-var'

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

class AssignLibraryDammitPlugin extends AssignLibraryPlugin {
  constructor(options) {
    super({ pluginName: 'AssignLibraryDammitPlugin', type: type })
    this.prefix = []
    this.unnamed = 'error'
  }

  apply(compiler) {
    EnableLibraryPlugin.setEnabled(compiler, type)
    super.apply(compiler)
  }

  parseOptions(library) {
    let m
    if (m = library.name.trim().match(/(var)\s+(.*)$/)) {
      this.declare = m[1]
      library.name = m[2]
    }
    else {
      this.declare = false
    }

    return super.parseOptions(library)
  }

  render(source, { chunk }, { options, compilation }) {
    const fullNameResolved = this._getResolvedFullName(options, chunk, compilation)
    const base = fullNameResolved[0].replace(/[{}]/g, '')
    if (this.declare) {
      source = new ConcatSource(`${this.declare} ${base};\n`, source)
    }
    else {
      source = new ConcatSource(`${base} = `, source)
    }
    return source
  }

  renderStartup(source, module, { chunk }, { options, compilation }) {
    let result = super.renderStartup(source, module, { chunk }, { options, compilation })

    const children = result.getChildren()
    if (children.length === 0) return result

    const fullNameResolved = this._getResolvedFullName(options, chunk, compilation)
    if (fullNameResolved.length !== 1) return result

    const old = new RegExp('(^|\\n)' + escapeRegExp(`${fullNameResolved[0]} = __webpack_exports__;`))
    const last = children[children.length - 1].source()
    // console.log(JSON.stringify({fnr: fullNameResolved[0], var: fullNameResolved[0].match(/^\{.+\}$/), last, old: old.source, match: last.match(old)}))
    if (!fullNameResolved[0].match(/^\{.+\}$/) || !last.match(old)) return result

    result = new ConcatSource()
    for (const child of children.slice(0, -1)) {
      result.add(child)
    }
    result.add(last.replace(old, `\n(${fullNameResolved[0]} = __webpack_exports__);\n`))
    return result
  }
}

module.exports = AssignLibraryDammitPlugin
