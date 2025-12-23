import { noInArray } from "./rules/no-in-array";
import type { TSESLint } from "@typescript-eslint/utils";

const plugin = {
  meta: {
    name: "eslint-plugin-no-in-array",
    version: "1.1.0",
  },
  rules: {
    check: noInArray,
  },
} satisfies TSESLint.Linter.Plugin;

const configs = {
  recommended: {
    plugins: {
      "no-in-array": plugin,
    },
    rules: {
      "no-in-array/check": "warn",
    },
  } satisfies TSESLint.FlatConfig.Config,
};

export default { ...plugin, configs };
export { noInArray, configs };