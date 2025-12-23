import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import noInArray from "eslint-plugin-no-in-array";

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
      noInArray.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  }
);
