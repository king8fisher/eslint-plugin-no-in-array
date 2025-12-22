import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import type { Type, TypeChecker } from "typescript";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/king8fisher/eslint-plugin-no-in-array#${name}`
);

function isArrayType(type: Type, checker: TypeChecker): boolean {
  // Check if it's an array type directly
  if (checker.isArrayType(type)) {
    return true;
  }

  // Check if it's a tuple type (which is also array-like)
  if (checker.isTupleType(type)) {
    return true;
  }

  // Check for readonly arrays
  const symbol = type.getSymbol();
  if (symbol) {
    const name = symbol.getName();
    if (name === "Array" || name === "ReadonlyArray") {
      return true;
    }
  }

  // Check type string representation as fallback
  const typeString = checker.typeToString(type);
  if (
    typeString.endsWith("[]") ||
    typeString.startsWith("Array<") ||
    typeString.startsWith("readonly ") ||
    typeString.startsWith("ReadonlyArray<")
  ) {
    return true;
  }

  // Handle union types - warn if any constituent is an array
  if (type.isUnion()) {
    return type.types.some((t) => isArrayType(t, checker));
  }

  return false;
}

export const noInArray = createRule({
  name: "no-in-array",
  meta: {
    type: "problem",
    docs: {
      description: "Disallow using the 'in' operator to check array membership",
    },
    messages: {
      noInArray:
        "Do not use 'in' operator with arrays. The 'in' operator checks for property keys (indices), not values. Use Array.prototype.includes() or Array.prototype.indexOf() instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      'BinaryExpression[operator="in"]'(node: TSESTree.BinaryExpression) {
        const rightNode = services.esTreeNodeToTSNodeMap.get(node.right);
        const type = checker.getTypeAtLocation(rightNode);

        if (isArrayType(type, checker)) {
          context.report({
            node,
            messageId: "noInArray",
          });
        }
      },
    };
  },
});

export default noInArray;