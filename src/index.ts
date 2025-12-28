import { noInArray } from "./rules/no-in-array";
import type { TSESLint } from "@typescript-eslint/utils";
import { name, version } from "../package.json";

const plugin = {
  meta: {
    name,
    version,
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