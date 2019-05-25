import { types as t } from "@babel/core";
import pipelineVisitor from "./pipelineVisitor";

const fsharpMakeCall = (right, placeholder) => {
  if (t.isAwaitExpression(right)) {
    return t.awaitExpression(placeholder);
  } else {
    return t.callExpression(right, [placeholder]);
  }
};

export default pipelineVisitor(fsharpMakeCall);
