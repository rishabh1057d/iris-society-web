import test from "node:test"
import assert from "node:assert/strict"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const braces = createRequire(require.resolve("tailwindcss/package.json"))("braces")
const deepInput = "{".repeat(4000) + "a" + "}".repeat(4000)
const guarded = error => error instanceof SyntaxError && /nesting/.test(error.message)

test("patched braces rejects malicious nesting before recursive traversal", () => {
  for (const method of ["parse", "compile", "expand"]) assert.throws(() => braces[method](deepInput), guarded)
})

test("direct AST walkers are guarded too", () => {
  let ast = { type: "text", value: "a" }
  for (let i = 0; i < 4000; i++) ast = { type: "root", nodes: [ast] }
  for (const method of ["compile", "expand", "stringify"]) assert.throws(() => braces[method](ast), guarded)
})

test("normal Tailwind file globs and shallow expansion keep working", () => {
  assert.deepEqual(braces.expand("./{app,components,lib}/**/*.{ts,tsx}"), ["./app/**/*.ts", "./app/**/*.tsx", "./components/**/*.ts", "./components/**/*.tsx", "./lib/**/*.ts", "./lib/**/*.tsx"])
  assert.match(braces.compile("*.{js,ts}"), /js\|ts/)
})
