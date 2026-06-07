import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "vite.*",
      "eslint.*",
      "tsconfig.*",
      "postcss.*",
      "tailwind.*",
      "vercel.json",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: ["error", 2],
      "no-multi-spaces": "error",
      "no-trailing-spaces": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      "no-unused-private-class-members": "error",
      "arrow-body-style": ["error", "as-needed"],
      "space-before-blocks": "error",
      "keyword-spacing": ["error", { before: true, after: true }],
      "object-curly-spacing": ["error", "always"],
      "space-infix-ops": "error",
      "eol-last": ["error", "always"],
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
    },
  }
);
