import * as Lint from 'tslint'
import * as ts from 'typescript'

// The walker takes care of all the work.
class NoModuleExportsWalker extends Lint.RuleWalker {
  public visitPropertyAssignment(node: ts.PropertyAssignment) {
    // create a failure at the current position
    // this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING))

    // console.log(node) // tslint:disable-line:no-console

    // call the base version of this visitor to actually parse this node
    super.visitPropertyAssignment(node)
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = 'module.exports forbidden'

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new NoModuleExportsWalker(sourceFile, this.getOptions()))
  }
}
