import { types as t } from "@babel/core";
import traverse from "@babel/traverse";
import transformPipelineExpression from "./transformPipelineExpression";

const updateTopicReferenceVisitor = {
  PipelinePrimaryTopicReference(path) {
    path.replaceWith(this.topicId);
  },
  PipelineTopicExpression(path) {
    path.skip();
  },
};

const smartVisitor = {
  BinaryExpression(path) {
    const { node } = path;
    const { operator } = node;
    if (operator !== "|>") return;

    const makeCall = (right, placeholder) => {
      if (t.isPipelineTopicExpression(right)) {
        traverse(
          right,
          updateTopicReferenceVisitor,
          path.scope,
          { topicId: placeholder },
          path,
        );

        return right.expression;
      } else {
        // t.isPipelineBarefunction(right)
        let { callee } = right;
        if (t.isIdentifier(callee, { name: "eval" })) {
          callee = t.sequenceExpression([t.numericLiteral(0), callee]);
        }

        return t.callExpression(callee, [placeholder]);
      }
    };

    path.replaceWith(transformPipelineExpression(path, makeCall));
  },
};

export default smartVisitor;
