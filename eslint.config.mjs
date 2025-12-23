import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import noInArrayPlugin from "eslint-plugin-no-in-array";

export default defineConfig(
  {
    ignores: ["dist/**", "node_modules/**", "*.config.*"],
  },
  eslint.configs.recommended,
  {
    files: ["**/*.ts"],
    extends: [
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
    ],
    plugins: {
      "no-in-array": noInArrayPlugin.default,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "no-in-array/no-in-array": "warn",
    },
  }
);
