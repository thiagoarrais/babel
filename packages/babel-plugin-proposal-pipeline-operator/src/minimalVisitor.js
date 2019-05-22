import { types as t } from "@babel/core";
import transformPipelineExpression from "./transformPipelineExpression";

const minimalVisitor = {
  BinaryExpression(path) {
    const { node } = path;
    const { operator } = node;
    if (operator !== "|>") return;

    path.replaceWith(
      transformPipelineExpression(path, (right, placeholder) =>
        t.callExpression(right, [placeholder]),
      ),
    );
  },
};

export default minimalVisitor;
