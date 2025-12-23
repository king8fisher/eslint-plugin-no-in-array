import { bench, describe } from "vitest";
import type { Linter, ESLint } from "eslint";
import { Linter as LinterClass } from "eslint";
import { noInArray } from "./no-in-array";
import parser from "@typescript-eslint/parser";

// Generate test code with N `in` expressions
function generateCode(count: number, type: "array" | "object" | "mixed"): string {
  const lines: string[] = [];

  if (type === "array" || type === "mixed") {
    lines.push("const arr: string[] = ['a', 'b', 'c'];");
    lines.push("const tuple: [number, string] = [1, 'a'];");
    lines.push("const readonlyArr: readonly number[] = [1, 2, 3];");
  }
  if (type === "object" || type === "mixed") {
    lines.push("const obj: Record<string, number> = { a: 1 };");
    lines.push("const plainObj = { x: 1, y: 2 };");
  }

  for (let i = 0; i < count; i++) {
    if (type === "array") {
      lines.push(`const r${i}_1 = "key" in arr;`);
      lines.push(`const r${i}_2 = 0 in tuple;`);
      lines.push(`const r${i}_3 = "x" in readonlyArr;`);
    } else if (type === "object") {
      lines.push(`const r${i}_1 = "key" in obj;`);
      lines.push(`const r${i}_2 = "x" in plainObj;`);
    } else {
      // mixed - alternating
      if (i % 2 === 0) {
        lines.push(`const r${i} = "key" in arr;`);
      } else {
        lines.push(`const r${i} = "key" in obj;`);
      }
    }
  }

  return lines.join("\n");
}

// Create linter with the rule configured
function createLinter() {
  return new LinterClass({ configType: "flat" });
}

function createConfig(): Linter.Config[] {
  return [
    {
      files: ["**/*.ts"],
      languageOptions: {
        parser,
        parserOptions: {
          projectService: {
            allowDefaultProject: ["*.ts"],
          },
        },
      },
      plugins: {
        "no-in-array": { rules: { "no-in-array": noInArray } } as unknown as ESLint.Plugin,
      },
      rules: {
        "no-in-array/no-in-array": "error",
      },
    },
  ];
}

describe("no-in-array performance", () => {
  const linter = createLinter();
  const config = createConfig();

  // Warm up - ensure TypeScript services are initialized
  linter.verify(generateCode(1, "array"), config, { filename: "warmup.ts" });

  describe("array expressions", () => {
    const code10 = generateCode(10, "array");
    const code50 = generateCode(50, "array");
    const code100 = generateCode(100, "array");
    const code500 = generateCode(500, "array");

    bench("10 in-expressions", () => {
      linter.verify(code10, config, { filename: "test.ts" });
    });

    bench("50 in-expressions", () => {
      linter.verify(code50, config, { filename: "test.ts" });
    });

    bench("100 in-expressions", () => {
      linter.verify(code100, config, { filename: "test.ts" });
    });

    bench("500 in-expressions", () => {
      linter.verify(code500, config, { filename: "test.ts" });
    });
  });

  describe("object expressions (no violations)", () => {
    const code100 = generateCode(100, "object");

    bench("100 in-expressions (objects only)", () => {
      linter.verify(code100, config, { filename: "test.ts" });
    });
  });

  describe("mixed expressions", () => {
    const code100 = generateCode(100, "mixed");

    bench("100 in-expressions (mixed)", () => {
      linter.verify(code100, config, { filename: "test.ts" });
    });
  });
});

// Union type stress test
describe("union types performance", () => {
  const linter = createLinter();
  const config = createConfig();

  const unionCode = `
    type MaybeArray = string[] | null | undefined;
    type ComplexUnion = number[] | string[] | Record<string, any> | null;
    type DeepUnion = (number | string)[] | readonly number[] | null | undefined | object;

    declare const a: MaybeArray;
    declare const b: ComplexUnion;
    declare const c: DeepUnion;

    ${Array.from({ length: 50 }, (_, i) => `const u${i}_1 = "x" in (a ?? []);`).join("\n")}
    ${Array.from({ length: 50 }, (_, i) => `const u${i}_2 = "x" in (b ?? {});`).join("\n")}
    ${Array.from({ length: 50 }, (_, i) => `const u${i}_3 = "x" in (c ?? {});`).join("\n")}
  `;

  bench("150 union type in-expressions", () => {
    linter.verify(unionCode, config, { filename: "test.ts" });
  });
});
