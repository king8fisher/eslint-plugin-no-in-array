# eslint-plugin-no-in-array

[![npm version](https://img.shields.io/npm/v/eslint-plugin-no-in-array.svg)](https://www.npmjs.com/package/eslint-plugin-no-in-array)

Type-aware ESLint rule that catches `in` operator misuse with arrays.

> [!NOTE]
> Experiment in building type-aware ESLint rules. Dogfoods itself.

## The problem

In Python/Kotlin, `in` checks if a value exists. In JS/TS, it checks property keys.

```ts
const arr = ["a", "b", "c"];

"a" in arr;        // false - "a" is not an index
arr.includes("a"); // true
```

Easy to forget, especially when switching languages.

## Install

```bash
pnpm add -D eslint-plugin-no-in-array
```

## Config

Requires type-checked linting.

```ts
// eslint.config.mjs
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import noInArray from "eslint-plugin-no-in-array";

export default defineConfig(
  { ignores: ["dist/**", "node_modules/**"] },
  eslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      noInArray.configs.recommended,
    ],
    languageOptions: {
      parserOptions: { projectService: true },
    },
  }
);
```

Manual setup:

```ts
plugins: {
  "no-in-array": noInArray,
},
rules: {
  "no-in-array/check": "warn",
},
```

## Catches

```ts
"a" in arr;                   // warns
"0" in tuple;                 // warns
"x" in readonlyArr;           // warns
"foo" in ["inline", "array"]; // warns

"a" in obj;                   // ok - objects are fine
```

## Benchmarks

| Test         | v1.0.0 | v1.1.0 | Change |
| ------------ | ------ | ------ | ------ |
| 100 objects  | 493 hz | 589 hz | +19%   |
| 100 mixed    | 925 hz | 989 hz | +7%    |
| 150 union    | 446 hz | 474 hz | +6%    |
| 100 array in | 388 hz | 403 hz | +4%    |

v1.1.0 optimizations: memoization, early primitive exit, union depth limit.

## License

MIT