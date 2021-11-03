import * as ts from 'typescript'
import * as fs from 'fs'

export type Parameter = {
  name: string
  default: string | number | boolean
}
export type Method = {
  doc: string
  parameters: Parameter[]
  schema: any
}

export class API {
  private ast: ts.SourceFile
  public classes: Record<string, Record<string, Method>> = {}

  constructor(filename: string) {
    this.ast = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest)
    this.ast.forEachChild(stmt => {
      if (ts.isClassDeclaration(stmt)) {
        this.ClassDeclaration(stmt)
      }
    })
  }

  private ClassDeclaration(cls: ts.ClassDeclaration): void {
    const className: string = cls.name.getText(this.ast)
    if (!className) return

    cls.forEachChild(member => {
      if (ts.isMethodDeclaration(member)) this.MethodDeclaration(className, member)
    })
  }

  private MethodDeclaration(className: string, method: ts.MethodDeclaration): void {
    const methodName: string = method.name.getText(this.ast)
    if (!methodName) return

    const comment_ranges = ts.getLeadingCommentRanges(this.ast.getFullText(), method.getFullStart())
    if (!comment_ranges) return
    let comment = this.ast.getFullText().slice(comment_ranges[0].pos, comment_ranges[0].end)
    if (!comment.startsWith('/**')) return
    comment = comment.replace(/^\/\*\*/, '').replace(/\*\/$/, '').trim().split('\n').map(line => line.replace(/^\s*[*]\s*/, '')).join('\n').replace(/\n+/g, newlines => newlines.length > 1 ? '\n\n' : ' ')

    if (!this.classes[className]) this.classes[className] = {}

    this.classes[className][methodName] = {
      doc: comment,
      parameters: [],
      schema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
        required: [],
      },
    }

    method.forEachChild(param => {
      if (ts.isParameter(param)) this.ParameterDeclaration(this.classes[className][methodName], param)
    })
  }

  private ParameterDeclaration(method: Method, param: ts.ParameterDeclaration) {
    const p: Parameter = {
      name: param.name.getText(this.ast),
      default: this.initializer(param.initializer),
    }
    method.parameters.push(p)

    method.schema.properties[p.name] = param.type ? this.schema(param.type) : { type: typeof p.default }
    if (!param.initializer && !param.questionToken) method.schema.required.push(p.name)
  }

  private initializer(init): string | number {
    if (!init) return undefined

    switch (init.kind) {
      case ts.SyntaxKind.StringLiteral:
        return init.text as string

      case ts.SyntaxKind.NumericLiteral:
      case ts.SyntaxKind.FirstLiteralToken: // https://github.com/microsoft/TypeScript/issues/18062
        return parseFloat(init.getText(this.ast))

      default:
        throw new Error(`Unexpected kind ${init.kind} ${ts.SyntaxKind[init.kind]} of initializer ${JSON.stringify(init)}`)
    }
  }

  private schema(type: ts.TypeNode): any {
    switch (type.kind) {
      case ts.SyntaxKind.UnionType:
        return this.UnionType(type as unknown as ts.UnionType)

      case ts.SyntaxKind.LiteralType:
        return this.LiteralType(type as unknown as ts.LiteralTypeNode)

      case ts.SyntaxKind.StringKeyword:
        return { type: 'string' }

      case ts.SyntaxKind.BooleanKeyword:
        return { type: 'boolean' }

        // case ts.SyntaxKind.TypeReference:
        //   return null

      case ts.SyntaxKind.NumberKeyword:
        return { type: 'number' }

      default:
        throw {...type, kindName: ts.SyntaxKind[type.kind] } // eslint-disable-line no-throw-literal
    }
  }

  private LiteralType(type: ts.LiteralTypeNode): any {
    let value: string = type.literal.getText(this.ast)
    if (ts.isStringLiteral(type.literal)) value = JSON.parse(value)

    return { const: value }
  }

  private UnionType(type: ts.UnionType): any {
    const types = type.types.map((t: ts.Type) => this.schema(t as unknown as ts.TypeNode)) // eslint-disable-line @typescript-eslint/no-unsafe-return

    if (types.length === 1) return types[0]

    const consts = []
    const other = types.filter(t => {
      if (typeof t.const === 'undefined') return true
      consts.push(t.const)
      return false
    })

    switch (consts.length) {
      case 0:
      case 1:
        return { oneOf: types }
      default:
        return { oneOf : other.concat({ enum: consts }) }
    }
  }
}
