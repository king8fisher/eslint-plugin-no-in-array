import { RuleTester } from "@typescript-eslint/rule-tester";
import * as vitest from "vitest";
import { noInArray } from "./no-in-array";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: ["*.ts"],
      },
      tsconfigRootDir: __dirname,
    },
  },
});

ruleTester.run("no-in-array", noInArray, {
  valid: [
    // 'in' with objects is fine
    {
      code: `const obj = { a: 1 }; "a" in obj;`,
    },
    {
      code: `const obj: Record<string, number> = {}; "key" in obj;`,
    },
    {
      code: `function check(obj: object) { "prop" in obj; }`,
    },
    // Map and Set are fine
    {
      code: `const map = new Map(); "key" in map;`,
    },
  ],
  invalid: [
    // Regular arrays
    {
      code: `const arr = [1, 2, 3]; "1" in arr;`,
      errors: [{ messageId: "noInArray" }],
    },
    {
      code: `const arr: number[] = []; 0 in arr;`,
      errors: [{ messageId: "noInArray" }],
    },
    // Tuple types
    {
      code: `const tuple: [string, number] = ["a", 1]; "0" in tuple;`,
      errors: [{ messageId: "noInArray" }],
    },
    // Inline arrays
    {
      code: `"foo" in ["a", "b", "c"];`,
      errors: [{ messageId: "noInArray" }],
    },
    // Readonly arrays
    {
      code: `const arr: readonly string[] = ["a"]; "0" in arr;`,
      errors: [{ messageId: "noInArray" }],
    },
    {
      code: `const arr: ReadonlyArray<string> = ["a"]; "0" in arr;`,
      errors: [{ messageId: "noInArray" }],
    },
    // Array generic
    {
      code: `const arr: Array<number> = [1]; "0" in arr;`,
      errors: [{ messageId: "noInArray" }],
    },
    // Union types containing arrays
    {
      code: `function check(val: string[] | null) { if (val) { "0" in val; } }`,
      errors: [{ messageId: "noInArray" }],
    },
  ],
});