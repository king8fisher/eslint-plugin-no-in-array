import { AST_NODE_TYPES, ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { Type, TypeChecker, TypeFlags } from "typescript";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/king8fisher/eslint-plugin-no-in-array#${name}`
);

// Memoization cache for type checking results
const typeCache = new WeakMap<Type, boolean>();

// Max recursion depth for union types
const MAX_UNION_DEPTH = 5;

// Primitive type flags to skip early
const PRIMITIVE_FLAGS =
  TypeFlags.String |
  TypeFlags.Number |
  TypeFlags.Boolean |
  TypeFlags.Null |
  TypeFlags.Undefined |
  TypeFlags.Void |
  TypeFlags.BigInt |
  TypeFlags.ESSymbol;

function isArrayType(
  type: Type,
  checker: TypeChecker,
  depth = 0
): boolean {
  // Check cache first
  const cached = typeCache.get(type);
  if (cached !== undefined) return cached;

  const result = computeIsArrayType(type, checker, depth);
  typeCache.set(type, result);
  return result;
}

function computeIsArrayType(
  type: Type,
  checker: TypeChecker,
  depth: number
): boolean {
  // Early exit for primitives
  if ((type.flags as number) & PRIMITIVE_FLAGS) {
    return false;
  }

  // Fast native checks first
  if (checker.isArrayType(type) || checker.isTupleType(type)) {
    return true;
  }

  // Quick symbol name check
  const symbol = type.getSymbol();
  if (symbol) {
    const name = symbol.getName();
    if (name === "Array" || name === "ReadonlyArray") {
      return true;
    }
  }

  // Handle union types before expensive string operations
  // Limit recursion depth to prevent pathological cases
  if (type.isUnion() && depth < MAX_UNION_DEPTH) {
    return type.types.some((t) => isArrayType(t, checker, depth + 1));
  }

  // Expensive string check last (fallback only)
  const typeString = checker.typeToString(type);
  return (
    typeString.endsWith("[]") ||
    typeString.startsWith("Array<") ||
    typeString.startsWith("readonly ") ||
    typeString.startsWith("ReadonlyArray<")
  );
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
        // AST fast path: inline array literals don't need type checking
        if (node.right.type === AST_NODE_TYPES.ArrayExpression) {
          context.report({
            node,
            messageId: "noInArray",
          });
          return;
        }

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