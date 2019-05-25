import { types as t } from "@babel/core";

// Transpiles pipeline expressions
//  path: path for pipeline BinaryExpression
//  makeCall [(callee, argument, parentPath) => node]:
//    proposal-dependent function that applies the result from evaluating
//    the left side to the expression on the right side
const transformPipelineExpression = (path, makeCall) => {
  const { scope, node } = path;
  const { left, right } = node;

  const placeholder = scope.generateUidIdentifierBasedOnNode(left);
  const assign = t.assignmentExpression("=", t.cloneNode(placeholder), left);

  if (isOptimizableArrow(right) && right.params.length === 0) {
    // Arrow function with 0 arguments
    // a |> () => b            -->     (a, b)
    return t.sequenceExpression([left, right.body]);
  } else if (
    isOptimizableArrow(right) &&
    right.params.length === 1 &&
    t.isIdentifier(right.params[0])
  ) {
    // a |> (x) => (x + x)     -->     (_ref = a, _ref + _ref)
    const param = right.params[0];

    scope.push({ id: placeholder });

    path.get("right").scope.rename(param.name, placeholder.name);

    return t.sequenceExpression([assign, right.body]);
  } else if (t.isIdentifier(right, { name: "eval" })) {
    // a |> eval               -->     (_ref = a, (0, eval)(_ref))
    const evalSequence = t.sequenceExpression([t.numericLiteral(0), right]);

    const call = makeCall(evalSequence, t.cloneNode(placeholder), path);

    scope.push({ id: placeholder });

    return t.sequenceExpression([assign, call]);
  } else if (
    (t.isIdentifier(right) && scope.hasBinding(right.name)) ||
    t.isImmutable(left)
  ) {
    // 0 |> b                  -->     b(0)
    return makeCall(right, left, path);
  } else {
    // a |> b                  -->     (_ref = a, b(_ref))
    const call = makeCall(right, t.cloneNode(placeholder), path);
    scope.push({ id: placeholder });

    return t.sequenceExpression([assign, call]);
  }
};

const isOptimizableArrow = expr =>
  t.isArrowFunctionExpression(expr) &&
  t.isExpression(expr.body) &&
  !expr.async &&
  !expr.generator;

const pipelineVisitor = makeCall => ({
  BinaryExpression(path) {
    const { node } = path;
    const { operator } = node;
    if (operator !== "|>") return;

    path.replaceWith(transformPipelineExpression(path, makeCall));
  },
});

export default pipelineVisitor;
