import { types as t } from "@babel/core";
import pipelineVisitor from "./pipelineVisitor";

const minimalMakeCall = (right, placeholder) =>
  t.callExpression(right, [placeholder]);

const minimalVisitor = pipelineVisitor(minimalMakeCall);

export default minimalVisitor;
