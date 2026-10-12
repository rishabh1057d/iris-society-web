import { readFileSync, existsSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import { runInNewContext } from "node:vm"
import ts from "typescript"
const nativeRequire = createRequire(import.meta.url)
export function loadPotw(path, stubs = {}, env = {}, cache = new Map()) {
  const absolute = resolve(path)
  if (cache.has(absolute)) return cache.get(absolute)
  const module = { exports: {} }; cache.set(absolute, module.exports)
  const code = ts.transpileModule(readFileSync(absolute, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText
  runInNewContext(code, {
    module, exports: module.exports, process: { env }, console, URL, Request, Response, Headers, Buffer, crypto, structuredClone, AbortSignal, setTimeout, clearTimeout,
    require(name) {
      if (name === "server-only") return {}
      if (name in stubs) return stubs[name]
      if (name.startsWith(".")) {
        const file = resolve(dirname(absolute), name)
        if (existsSync(file + ".ts")) return loadPotw(file + ".ts", stubs, env, cache)
        if (file.endsWith(".json")) return JSON.parse(readFileSync(file, "utf8"))
        if (file.endsWith(".mjs")) return nativeRequire(file)
      }
      return nativeRequire(name)
    },
  }, { filename: absolute })
  cache.set(absolute, module.exports); return module.exports
}
