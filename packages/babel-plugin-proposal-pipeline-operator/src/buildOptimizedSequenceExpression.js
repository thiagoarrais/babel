import { types as t } from "@babel/core";

// tries to optimize sequence expressions in the format
//   (a = b, ((c) => d + e)(a))
// to
//   (a = b, a + e)
const buildOptimizedSequenceExpression = ({ assign, call, path }) => {
  const { left: placeholderNode, right: pipelineLeft } = assign;
  const { callee: pipelineRight } = call;

  let optimizeArrow =
    t.isArrowFunctionExpression(pipelineRight) &&
    t.isExpression(pipelineRight.body) &&
    !pipelineRight.async &&
    !pipelineRight.generator;
  let param;

  if (optimizeArrow) {
    const { params } = pipelineRight;
    if (params.length === 1 && t.isIdentifier(params[0])) {
      param = params[0];
    } else if (params.length > 0) {
      optimizeArrow = false;
    }
  } else if (t.isIdentifier(pipelineRight, { name: "eval" })) {
    const evalSequence = t.sequenceExpression([
      t.numericLiteral(0),
      pipelineRight,
    ]);

    call.callee = evalSequence;

    path.scope.push({ id: placeholderNode });

    return t.sequenceExpression([assign, call]);
  } else if (
    (t.isIdentifier(pipelineRight) &&
      path.scope.hasBinding(pipelineRight.name)) ||
    t.isImmutable(pipelineLeft)
  ) {
    return t.callExpression(pipelineRight, [pipelineLeft]);
  }

  if (optimizeArrow && !param) {
    // Arrow function with 0 arguments
    return t.sequenceExpression([pipelineLeft, pipelineRight.body]);
  }

  path.scope.push({ id: placeholderNode });

  if (param) {
    path.get("right").scope.rename(param.name, placeholderNode.name);

    return t.sequenceExpression([assign, pipelineRight.body]);
  }

  return t.sequenceExpression([assign, call]);
};

export default buildOptimizedSequenceExpression;
