import { types as t } from "@babel/core";
import traverse from "@babel/traverse";
import pipelineVisitor from "./pipelineVisitor";

const updateTopicReferenceVisitor = {
  PipelinePrimaryTopicReference(path) {
    path.replaceWith(this.topicId);
  },
  PipelineTopicExpression(path) {
    path.skip();
  },
};

const smartMakeCall = (right, placeholder, path) => {
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

const smartVisitor = pipelineVisitor(smartMakeCall);

export default smartVisitor;
