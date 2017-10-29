// http://astexplorer.net
import * as Lint from 'tslint'
import { isBinaryExpression, isIdentifier, isPropertyAccessExpression } from 'tsutils'
import * as ts from 'typescript'

function walk(ctx: Lint.WalkContext<void>) {
  return ts.forEachChild(ctx.sourceFile, function cb(node): void {
    if (
      isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && // only interested in assignments
      isPropertyAccessExpression(node.left) && node.left.name.text === 'exports' && // where the assignment target is a property named `exports`
      isIdentifier(node.left.expression) && node.left.expression.text === 'module'  // on an object named `module`
    ) {
      // add the failure to the WalkContext
      ctx.addFailureAtNode(node, "module.exports is forbidden, use 'export =' instead")
    }

    return ts.forEachChild(node, cb)
  })
}

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk)
  }
}
