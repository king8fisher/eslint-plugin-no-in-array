# eslint-plugin-no-in-array

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

## Installation

```bash
npm install -D eslint-plugin-no-in-array
# or
pnpm add -D eslint-plugin-no-in-array
```

## Usage

This rule requires **type-checked linting**. You need to configure your ESLint to use TypeScript's type information.

### ESLint Flat Config (eslint.config.mjs)

```javascript
import noInArrayPlugin from "eslint-plugin-no-in-array";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "no-in-array": noInArrayPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "no-in-array/no-in-array": "warn",
    },
  },
];
```

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

## License

MIT