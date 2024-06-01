import * as ts from 'typescript'
import * as fs from 'fs'
import BabelTag from '../gen/babel/tag.json'
import zoteroSchema from '../schema/zotero.json'
import jurismSchema from '../schema/jurism.json'

// type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type SimpleLiteral = boolean | number | string | { [key: string]: SimpleLiteral } | SimpleLiteral[]

const creatorTypes: Set<string> = new Set
for (const schema of [zoteroSchema, jurismSchema]) {
  for (const itemType of schema.itemTypes) {
    for (const creatorType of itemType.creatorTypes) {
      creatorTypes.add(creatorType.creatorType)
    }
  }
}
const CreatorType = {
  type: 'string',
  enum: [...creatorTypes].sort(),
}
const CreatorTypeArray = {
  type: 'array',
  items: CreatorType,
}
const CreatorTypeCollection = {
  type: 'array',
  items: {
    type: 'array',
    items: {
      type: 'string',
      enum: [...creatorTypes, '*'].sort(),
    },
  },
}

function assert(cond, msg) {
  if (cond) return
  if (typeof msg !== 'string') msg = JSON.stringify(msg, null, 2)
  throw new Error(`assertion failed: ${msg}`)
}

export type Parameter = {
  name: string
  default: SimpleLiteral
  rest?: boolean
  doc?: string
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

  private DocComment(comment: string): Record<string, string> {
    comment = comment
      .replace(/^\/\*\*/, '') // remove leader
      .replace(/\*\/$/, '') // remove trailer
    const params: Record<string, string> = {}
    let m
    params[''] = comment.trim().split('\n')
      .map(line => {
        if (m = line.match(/^\s*[*]\s+@param\s+([^\s]+)\s+(.*)/)) {
          params[m[1]] = m[2]
          return ''
        }
        else {
          return `${line.replace(/^\s*[*]\s*/, '')}\n`
        }
      })
      .join('')
      .replace(/\n+/g, newlines => newlines.length > 1 ? '\n\n' : ' ')

    return params
  }
  private MethodDeclaration(className: string, method: ts.MethodDeclaration): void {
    const methodName: string = method.name.getText(this.ast)
    if (!methodName) return

    const comment_ranges = ts.getLeadingCommentRanges(this.ast.getFullText(), method.getFullStart())
    if (!comment_ranges) return
    const comment = this.ast.getFullText().slice(comment_ranges[0].pos, comment_ranges[0].end)
    if (!comment.startsWith('/**')) return
    const params = this.DocComment(comment)

    if (!this.classes[className]) this.classes[className] = {}

    this.classes[className][methodName] = {
      doc: params[''],
      parameters: [],
      schema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
        required: [],
      },
    }
    delete params['']

    method.forEachChild(param => {
      if (ts.isParameter(param)) this.ParameterDeclaration(this.classes[className][methodName], param, params)
    })
    const orphans = Object.keys(params).join('/')
    if (orphans) {
      throw new Error(`orphaned param docs for ${orphans}`)
    }
  }

  private ParameterDeclaration(method: Method, param: ts.ParameterDeclaration, doc: Record<string, string>) {
    const name = param.name.getText(this.ast)
    const p: Parameter = {
      name,
      doc: doc[name],
      default: this.Literal(param.initializer),
      rest: !!param.dotDotDotToken,
    }
    delete doc[name]
    method.parameters.push(p)

    if (param.type) {
      method.schema.properties[p.name] = this.schema(param.type)
    }
    else {
      assert(typeof p.default !== 'undefined', JSON.stringify(p))
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

      case ts.SyntaxKind.TrueKeyword:
        return true

      case ts.SyntaxKind.FalseKeyword:
        return false

      case ts.SyntaxKind.ArrayLiteralExpression:
        return init.elements.map(elt => this.Literal(elt)) as SimpleLiteral[]

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

      case ts.SyntaxKind.ParenthesizedType:
        return this.schema((type as any).type)

      case ts.SyntaxKind.ArrayType:
        return this.ArrayType(type as ts.ArrayTypeNode)

      case ts.SyntaxKind.TupleType:
        return this.TupleType(type as ts.TupleTypeNode)

      default:
        throw {...type, kindName: ts.SyntaxKind[type.kind] } // eslint-disable-line no-throw-literal
    }
  }

  private TupleType(tuple: ts.TupleTypeNode) {
    return {
      type: 'array',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      prefixItems: tuple.elements.map((elt: ts.TypeNode) => this.schema(elt)),
      items: false,
      minItems: tuple.elements.length,
      maxItems: tuple.elements.length,
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
    const typeName = typeref.typeName.getText(this.ast)
    let key: any
    let kind: string
    let variables: Record<string, string>

    switch (typeName) {
      case 'BabelLanguage':
        return {
          type: 'string',
          enum: Object.keys(BabelTag).sort(),
        }

      case 'BabelLanguageTag':
        return {
          type: 'string',
          enum: Object.values(BabelTag).sort(),
        }

      case 'ZoteroItemType':
        return {
          type: 'string',
          enum: Array.from([zoteroSchema, jurismSchema].reduce((itemTypes, schema) => {
            for (const itemType of schema.itemTypes) {
              if (itemType.creatorTypes?.length) itemTypes.add(itemType.itemType)
            }
            return itemTypes
          }, new Set)),
        }

      case 'RegExp':
        return { instanceof: typeName }

      case 'AuthorType':
        return {
          type: 'string',
          enum: [ 'author', 'editor', 'translator', 'collaborator', '*' ],
        }

      case 'CreatorType':
        return CreatorType
      case 'CreatorTypeArray':
        return CreatorTypeArray
      case 'CreatorTypeCollection':
        return CreatorTypeCollection

      case 'Record':
        assert(typeref.typeArguments.length === 2, `expected 2 types, found ${typeref.typeArguments.length}`)

        key = this.schema(typeref.typeArguments[0])
        assert(key.type === 'string', key)

        return {
          type: 'object',
          additionalProperties: this.schema(typeref.typeArguments[1]),
        }

      case 'DateTemplate':
        return {
          type: 'template',
          kind: 'date',
          variables: {
            Y: 'year',
            y: 'short year',
            m: 'month',
            d: 'day',
            oY: 'original year if present, year otherwise',
            oy: 'original short year if present, short year otherwise',
            om: 'original month if present, month otherwise',
            od: 'original day if present, day otherwise',
            H: 'hour',
            M: 'minutes',
            S: 'seconds',
          },
        }

      case 'Template':
        assert(typeref.typeArguments.length === 1, `expected 1 type argument, got ${typeref.typeArguments.length}`)
        kind = (typeref.typeArguments[0] as any).literal.text
        switch (kind) {
          case 'datetime':
            variables = {
              Y: 'year',
              y: 'short year',
              m: 'month',
              d: 'day',
              oY: 'original year if present, year otherwise',
              oy: 'original short year if present, short year otherwise',
              om: 'original month if present, month otherwise',
              od: 'original day if present, day otherwise',
              H: 'hour',
              M: 'minutes',
              S: 'seconds',
            }
            break
          case 'postfix':
            variables = {
              a: 'alpha postfix',
              A: 'alpha postfix uppercase',
              n: 'numeric postfix',
            }
            break
          case 'creator':
            variables = {
              f: 'family name',
              g: 'given name',
              i: 'first initial',
              I: 'all initials',
            }
            break
          default:
            assert(false, `expected template kind "datetime", "postfix" or "creator", got ${kind}`)
        }

        return { type: 'template', kind, variables }

      default:
        assert(false, `unexpected TypeReference ${typeName}`)
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

    const consts: Set<string> = new Set
    const enums: Set<string> = new Set
    const other = types.filter(t => {
      if (typeof t.const === 'string') {
        consts.add(t.const)
        return false
      }
      else if (t.type === 'string' && t.enum) {
        for (const e of t.enum) {
          enums.add(e)
        }
        return false
      }
      else {
        return true
      }
    })


    let combined
    if ((consts.size + enums.size) > 1 || consts.size > 1 || enums.size > 0) {
      combined = { type: 'string', enum: [...(new Set([...consts, ...enums]))].sort() }
    }
    else if (consts.size === 1) {
      combined = { const: [...consts][0] }
    }
    else {
      return { anyOf: types }
    }

    if (other.length === 0) return combined

    return { anyOf : other.concat(combined) }
  }
}
