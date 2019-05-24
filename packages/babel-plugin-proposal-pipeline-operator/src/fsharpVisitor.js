import { types as t } from "@babel/core";
import transformPipelineExpression from "./transformPipelineExpression";

const fsharpVisitor = {
  BinaryExpression(path) {
    const { node } = path;
    const { operator } = node;
    if (operator !== "|>") return;

    const makeCall = (right, placeholder) => {
      if (t.isAwaitExpression(right)) {
        return t.awaitExpression(placeholder);
      } else {
        return t.callExpression(right, [placeholder]);
      }
    };
    const sequence = transformPipelineExpression(path, makeCall);
    path.replaceWith(sequence);
  },
};

export default fsharpVisitor;
