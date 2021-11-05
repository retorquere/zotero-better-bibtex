import * as ts from 'typescript'
import * as fs from 'fs'

// type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type SimpleLiteral = boolean | number | string | { [key: string]: SimpleLiteral }

function assert(cond, msg) {
  if (cond) return
  if (typeof msg !== 'string') msg = JSON.stringify(msg, null, 2)
  throw new Error(`assertion failed: ${msg}`)
}

export type Parameter = {
  name: string
  default: SimpleLiteral
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
      default: this.Literal(param.initializer),
    }
    method.parameters.push(p)

    if (param.type) {
      method.schema.properties[p.name] = this.schema(param.type)
    }
    else {
      assert(typeof p.default !== 'undefined', p.name)
      method.schema.properties[p.name] = { type: typeof p.default }
    }

    if (!param.initializer && !param.questionToken) method.schema.required.push(p.name)
  }

  private Literal(init): SimpleLiteral {
    if (!init) return undefined

    switch (init.kind) {
      case ts.SyntaxKind.StringLiteral:
        return init.text as string

      case ts.SyntaxKind.NumericLiteral:
      case ts.SyntaxKind.FirstLiteralToken: // https://github.com/microsoft/TypeScript/issues/18062
        return parseFloat(init.getText(this.ast))

      case ts.SyntaxKind.ObjectLiteralExpression:
        return this.ObjectLiteralExpression(init)

      case ts.SyntaxKind.FalseKeyword:
        return false

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

      case ts.SyntaxKind.NumberKeyword:
        return { type: 'number' }

      case ts.SyntaxKind.TypeReference:
        return this.TypeReference(type as ts.TypeReferenceNode)

      case ts.SyntaxKind.TypeLiteral:
        return this.TypeLiteral(type as ts.TypeLiteralNode)

      case ts.SyntaxKind.ArrayType:
        return this.ArrayType(type as ts.ArrayTypeNode)

      default:
        throw {...type, kindName: ts.SyntaxKind[type.kind] } // eslint-disable-line no-throw-literal
    }
  }

  private ArrayType(array: ts.ArrayTypeNode) {
    return {
      type: 'array',
      items: this.schema(array.elementType),
    }
  }

  private TypeLiteral(literal: ts.TypeLiteralNode) {
    const schema = {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    }

    literal.forEachChild(prop => {
      if (ts.isPropertySignature(prop)) {
        const name = prop.name.getText(this.ast)
        schema.properties[name] = this.schema(prop.type)
        if (!prop.questionToken) schema.required.push(name)
      }
    })

    return schema
  }

  private TypeReference(typeref: ts.TypeReferenceNode) {
    assert(typeref.typeName.getText(this.ast) === 'Record', `unexpected TypeReference ${typeref.typeName.getText(this.ast)}`)
    assert(typeref.typeArguments.length === 2, `expected 2 types, found ${typeref.typeArguments.length}`)

    const key = this.schema(typeref.typeArguments[0])
    assert(key.type === 'string', key)

    return {
      type: 'object',
      additionalProperties: this.schema(typeref.typeArguments[1]),
    }
  }

  private ObjectLiteralExpression(literal: ts.ObjectLiteralExpression): SimpleLiteral {
    const object: Record<string, any> = {}

    literal.forEachChild(prop => {
      if (ts.isPropertyAssignment(prop)) {
        assert(ts.isIdentifier(prop.name), ts.SyntaxKind[prop.name.kind])
        const key = prop.name.getText(this.ast)

        const value = this.Literal(prop.initializer)
        object[key] = value
      }
    })

    return object
  }

  private LiteralType(type: ts.LiteralTypeNode): any {
    return { const: ts.isStringLiteral(type.literal) ? type.literal.text : type.literal.getText(this.ast) }
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
