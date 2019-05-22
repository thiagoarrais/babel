import { types as t } from "@babel/core";

// cases:
// 1: a |> (x) => (x + x)     -->     (_ref = a, _ref + _ref)
// 2: a |> () => b            -->     (a, b)
// 3: a |> eval               -->     (_ref = a, (0, eval)(_ref))
// 4: 0 |> b                  -->     b(0)
// 5: a |> b                  -->     (_ref = a, b(_ref))
const transformPipelineExpression = (path, makeCall) => {
  const { scope, node } = path;
  const { left, right } = node;

  const optimizeArrow =
    t.isArrowFunctionExpression(right) &&
    t.isExpression(right.body) &&
    !right.async &&
    !right.generator;
  let param;

  const placeholder = scope.generateUidIdentifierBasedOnNode(left);
  const assign = t.assignmentExpression("=", t.cloneNode(placeholder), left);

  if (optimizeArrow) {
    const { params } = right;
    if (params.length === 0) {
      // Arrow function with 0 arguments
      return t.sequenceExpression([left, right.body]);
    } else if (params.length === 1 && t.isIdentifier(params[0])) {
      param = params[0];

      scope.push({ id: placeholder });

      path.get("right").scope.rename(param.name, placeholder.name);

      return t.sequenceExpression([assign, right.body]);
    }
  } else if (t.isIdentifier(right, { name: "eval" })) {
    const evalSequence = t.sequenceExpression([t.numericLiteral(0), right]);

    const call = makeCall(evalSequence, t.cloneNode(placeholder));

    scope.push({ id: placeholder });

    return t.sequenceExpression([assign, call]);
  } else if (
    (t.isIdentifier(right) && scope.hasBinding(right.name)) ||
    t.isImmutable(left)
  ) {
    return t.callExpression(right, [left]);
  }

  const call = makeCall(right, t.cloneNode(placeholder));
  scope.push({ id: placeholder });

  return t.sequenceExpression([assign, call]);
};

export default transformPipelineExpression;
