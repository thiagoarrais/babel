import { types as t } from "@babel/core";
import maybeOptimizePipelineSequence from "./maybeOptimizePipelineSequence";

const fsharpVisitor = {
  BinaryExpression(path) {
    const { scope } = path;
    const { node } = path;
    const { operator, left, right } = node;
    if (operator !== "|>") return;

    const placeholder = scope.generateUidIdentifierBasedOnNode(left);
    scope.push({ id: placeholder });

    const call =
      right.type === "AwaitExpression"
        ? t.awaitExpression(t.cloneNode(placeholder))
        : t.callExpression(right, [t.cloneNode(placeholder)]);
    const sequence = t.sequenceExpression([
      t.assignmentExpression("=", t.cloneNode(placeholder), left),
      call,
    ]);
    path.replaceWith(sequence);
    maybeOptimizePipelineSequence(path);
  },
};

export default fsharpVisitor;
