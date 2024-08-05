export class Postfix {
  public noopsort: boolean
  public packages: Record<string, boolean>
  public declarePrefChars: string

  private qr: boolean

  constructor(qualityReport: boolean) {
    this.qr = qualityReport
    this.packages = {}
    this.noopsort = false
    this.declarePrefChars = ''
  }

  public add(metadata: { DeclarePrefChars: string; noopsort: any; packages: any }): void {
    if (!metadata) return

    if (metadata.DeclarePrefChars) this.declarePrefChars += metadata.DeclarePrefChars
    if (metadata.noopsort) this.noopsort = true
    if (metadata.packages) {
      for (const pkg of metadata.packages) {
        this.packages[pkg] = true
      }
    }
  }

  public toString(): string {
    let postfix = ''

    let preamble = []
    if (this.declarePrefChars) preamble.push('\\ifdefined\\DeclarePrefChars\\DeclarePrefChars{\'’-}\\else\\fi')
    if (this.noopsort) preamble.push('\\providecommand{\\noopsort}[1]{}')
    if (preamble.length > 0) {
      preamble = preamble.map(cmd => `"${ cmd } "`)
      postfix += `@preamble{ ${ preamble.join(' \n # ') } }\n`
    }

    if (this.qr) {
      const packages = Object.keys(this.packages).sort()
      if (packages.length) {
        postfix += '\n% The following packages could be loaded to get more precise latex output:\n'
        for (const pkg of packages) {
          postfix += `% * ${ pkg }\n`
        }
      }
    }

    return postfix
  }
}
