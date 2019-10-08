export class Postfix {
  public noopsort: boolean
  public packages: { [key: string]: boolean }
  public declarePrefChars: string

  private qr: boolean

  constructor(qualityReport: boolean) {
    this.qr = qualityReport
    this.packages = {}
    this.noopsort = false
    this.declarePrefChars = ''
  }

  public add(item) {
    if (!item.metadata) return

    if (item.metadata.DeclarePrefChars) this.declarePrefChars += item.metadata.DeclarePrefChars
    if (item.metadata.noopsort) this.noopsort = true
    if (item.metadata.packages) {
      for (const pkg of item.metadata.packages) {
        this.packages[pkg] = true
      }
    }
  }

  public toString() {
    let postfix = ''

    let preamble = []
    if (this.declarePrefChars) preamble.push("\\ifdefined\\DeclarePrefChars\\DeclarePrefChars{'’-}\\else\\fi")
    if (this.noopsort) preamble.push('\\newcommand{\\noopsort}[1]{}')
    if (preamble.length > 0) {
      preamble = preamble.map(cmd => `"${cmd} "`)
      postfix += `@preamble{ ${preamble.join(' \n # ')} }\n`
    }

    if (this.qr) {
      const packages = Object.keys(this.packages).sort()
      if (packages.length) {
        postfix += '\n% Required packages:\n'
        for (const pkg of packages) {
          postfix += `% * ${pkg}\n`
        }
      }
    }

    return postfix
  }
}
