import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

const tsFiles = ["**/*.{ts,tsx}"];

export default [
  {
    ignores: ["dist", "node_modules"]
  },
  js.configs.recommended,
  {
    files: tsFiles,
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      "react-hooks": reactHooks
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-undef": "off"
    }
  }
];
