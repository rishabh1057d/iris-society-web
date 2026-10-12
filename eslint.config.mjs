import tseslint from "typescript-eslint"
import nextPlugin from "@next/eslint-plugin-next"
export default [{ ignores: [".next/**", "node_modules/**"] }, {
  plugins: { "@next/next": nextPlugin },
  rules: { "@next/next/no-async-client-component": "error" },
  linterOptions: { reportUnusedDisableDirectives: "off" },
}, {
  files: ["**/*.ts", "**/*.tsx"], languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
  plugins: { "@typescript-eslint": tseslint.plugin },
}, {
  files: ["lib/potw/**/*.ts", "components/potw/**/*.tsx", "app/api/potw/**/*.ts", "app/api/admin/potw/**/*.ts", "app/api/potw-maintenance/**/*.ts", "app/potw/**/*.tsx", "app/admin/dashboard/potw/**/*.tsx"],
  rules: { "no-debugger": "error", "no-constant-condition": "error", "@typescript-eslint/no-explicit-any": "error", "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }] },
}]
