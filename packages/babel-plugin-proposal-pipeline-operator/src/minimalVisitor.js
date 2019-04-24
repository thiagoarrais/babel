import { types as t } from "@babel/core";
import maybeOptimizePipelineSequence from "./maybeOptimizePipelineSequence";

const minimalVisitor = {
  BinaryExpression(path) {
    const { scope } = path;
    const { node } = path;
    const { operator, left, right } = node;
    if (operator !== "|>") return;

    const placeholder = scope.generateUidIdentifierBasedOnNode(left);
    scope.push({ id: placeholder });

    const call = t.callExpression(right, [t.cloneNode(placeholder)]);
    path.replaceWith(
      t.sequenceExpression([
        t.assignmentExpression("=", t.cloneNode(placeholder), left),
        call,
      ]),
    );
    maybeOptimizePipelineSequence(path);
  },
};

export default minimalVisitor;
