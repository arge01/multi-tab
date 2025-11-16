module.exports = {
  semi: true,
  singleQuote: true,
  semi: true,
  trailingComma: "es5",
  singleQuote: false,
  printWidth: 80,
  tabWidth: 2,
  endOfLine: "auto",
  bracketSameLine: false,
  jsxSingleQuote: false,
  jsxBracketSameLine: true,
  arrowParens: "always",
  proseWrap: "preserve",
  embeddedLanguageFormatting: "auto",
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  tailwindPreserveWhitespace: false,
  tailwindAttributes: ["className"],
  importOrder: [
    '^react',
    '^@/(.*)$',
    '^[./]',
  ],
  overrides: [
    {
      files: "*.json",
      options: {
        printWidth: 200,
      },
    },
  ],
};
