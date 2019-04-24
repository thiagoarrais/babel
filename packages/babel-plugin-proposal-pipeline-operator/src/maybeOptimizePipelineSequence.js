import { types as t } from "@babel/core";

// tries to optimize sequence expressions in the format
//   (a = b, ((c) => d + e)(a))
// to
//   (a = b, a + e)
const maybeOptimizePipelineSequence = path => {
  const [assignNode, callNode] = path.node.expressions;
  const { left: placeholderNode, right: pipelineLeft } = assignNode;
  const { callee: calledExpression } = callNode;

  let optimizeArrow =
    t.isArrowFunctionExpression(calledExpression) &&
    t.isExpression(calledExpression.body) &&
    !calledExpression.async &&
    !calledExpression.generator;
  let param;

  if (optimizeArrow) {
    const { params } = calledExpression;
    if (params.length === 1 && t.isIdentifier(params[0])) {
      param = params[0];
    } else if (params.length > 0) {
      optimizeArrow = false;
    }
  } else if (t.isIdentifier(calledExpression, { name: "eval" })) {
    const evalSequence = t.sequenceExpression([
      t.numericLiteral(0),
      calledExpression,
    ]);

    path.get("expressions.1.callee").replaceWith(evalSequence);
  }

  if (optimizeArrow && !param) {
    // Arrow function with 0 arguments
    path.replaceWith(
      t.sequenceExpression([pipelineLeft, calledExpression.body]),
    );
    return;
  }

  if (param) {
    path
      .get("expressions.1.callee.body")
      .scope.rename(param.name, placeholderNode.name);
    path.get("expressions.1").replaceWith(calledExpression.body);
  }
};

export default maybeOptimizePipelineSequence;
