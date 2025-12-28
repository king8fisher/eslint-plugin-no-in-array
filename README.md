# eslint-plugin-no-in-array

[![npm version](https://img.shields.io/npm/v/eslint-plugin-no-in-array.svg)](https://www.npmjs.com/package/eslint-plugin-no-in-array)
[![GitHub](https://img.shields.io/github/license/king8fisher/eslint-plugin-no-in-array)](https://github.com/king8fisher/eslint-plugin-no-in-array)

ESLint rule to disallow using the `in` operator with arrays. This is a **type-aware** rule that uses TypeScript's type checker to detect arrays, including those stored in variables.

## Why?

The `in` operator checks for **property keys**, not values. This is a common source of bugs:

```typescript
const arr = ["a", "b", "c"];

// WRONG - checks if "a" is a property key (index), not a value
"a" in arr; // false (indices are "0", "1", "2")

// CORRECT
arr.includes("a"); // true
```

## Installation & Setup

This rule requires **type-checked linting**. Choose the setup that matches your project:

* [Pure TypeScript Projects](#pure-typescript-projects)
* [Next.js 16+](#nextjs-16)

> [!NOTE]
> Both setups require type-aware linting via `projectService` (recommended) or `parserOptions.project`. Without this, ESLint cannot access TypeScript's type checker and the rule will fail to load.

### Pure TypeScript Projects

```bash
npm install -D eslint-plugin-no-in-array typescript-eslint
# or
pnpm add -D eslint-plugin-no-in-array typescript-eslint
```

**Using the recommended config (simplest):**

```javascript
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import noInArray from "eslint-plugin-no-in-array";

export default defineConfig(
  eslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      noInArray.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
```

**Manual configuration:**

```javascript
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import noInArray from "eslint-plugin-no-in-array";

export default defineConfig(
  eslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
    ],
    plugins: {
      "no-in-array": noInArray,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "no-in-array/check": "warn",
    },
  },
);
```

### Next.js 16+

`eslint-config-next` already includes `typescript-eslint`, so you don't need to install it separately.

```bash
npm install -D eslint-plugin-no-in-array
# or
pnpm add -D eslint-plugin-no-in-array
```

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import noInArray from "eslint-plugin-no-in-array";

// Node 20.11+: use import.meta.dirname instead
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [noInArray.configs.recommended],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
  },
  globalIgnores([".next/**", "node_modules/**"]),
]);
```

Or configure manually as outlined in [Pure TypeScript Projects](#pure-typescript-projects).

## What it catches

```typescript
const arr = ["a", "b", "c"];
const tuple: [string, number] = ["hello", 42];
const readonlyArr: readonly string[] = ["x", "y"];

// All of these will warn:
"a" in arr;
"hello" in tuple;
"x" in readonlyArr;
"foo" in ["inline", "array"];

// This will NOT warn (object, not array):
const obj = { a: 1, b: 2 };
"a" in obj; // OK - this is valid usage
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