import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { runInNewContext } from "node:vm"
import ts from "typescript"

const require = createRequire(import.meta.url)
function load(file, env, dependencies) {
  const module = { exports: {} }
  const code = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  runInNewContext(code, { module, exports: module.exports, process: { env }, require: name => dependencies[name] ?? require(name), console })
  return module.exports
}

test("server client never receives production credentials in a preview", () => {
  for (const env of [{}, { VERCEL_ENV: "preview", NEXT_PUBLIC_SUPABASE_URL: "https://fixture.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "fixture-secret" }]) {
    let argumentsReceived
    const app = load("lib/supabase-server.ts", env, { "@supabase/supabase-js": { createClient: (...args) => { argumentsReceived = args; return {} } } })
    assert.equal(app.databaseConfigured, false)
    assert.equal(argumentsReceived[0], "https://unconfigured.invalid")
    assert.equal(argumentsReceived[1], "unconfigured")
  }
})

test("production client keeps its configured credentials", () => {
  let argumentsReceived
  const app = load("lib/supabase-server.ts", { VERCEL_ENV: "production", NEXT_PUBLIC_SUPABASE_URL: "https://fixture.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "fixture-secret" }, { "@supabase/supabase-js": { createClient: (...args) => { argumentsReceived = args; return {} } } })
  assert.equal(app.databaseConfigured, true)
  assert.equal(argumentsReceived[1], "fixture-secret")
})

test("disabled database returns 503 without contacting Auth or the database", async () => {
  const auth = load("lib/api-auth.ts", {}, { "./supabase-server": { databaseConfigured: false, supabaseServer: {} } })
  assert.equal((await auth.requireUser(new Request("http://localhost", { headers: { Authorization: "Bearer fixture-token" } }))).error.status, 503)
  assert.equal((await auth.requireUser(new Request("http://localhost"))).error.status, 401)
  const route = load("app/api/event-config/route.ts", { VERCEL_ENV: "preview", NEXT_PUBLIC_SUPABASE_URL: "https://fixture.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-anon" }, { "@supabase/supabase-js": { createClient() { throw new Error("Must not create a network client") } } })
  assert.equal((await route.GET()).status, 503)
})

test("browser module stays inert for previews and absent or partial configuration", () => {
  for (const env of [{}, { NEXT_PUBLIC_SUPABASE_URL: "https://fixture.supabase.co" }, { NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-anon" }, { NEXT_PUBLIC_DATABASE_DISABLED: "1", NEXT_PUBLIC_SUPABASE_URL: "https://fixture.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-anon" }]) {
    let args
    const app = load("lib/supabase-browser.ts", env, { "@supabase/supabase-js": { createClient: (...received) => { args = received; return {} } } })
    assert.equal(app.databaseConfigured, false)
    assert.equal(args[0], "https://unconfigured.invalid")
    assert.equal(args[1], "unconfigured")
  }
})

test("browser sign-in remains enabled for configured production", () => {
  const app = load("lib/supabase-browser.ts", { NEXT_PUBLIC_DATABASE_DISABLED: "0", NEXT_PUBLIC_SUPABASE_URL: "https://fixture.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-anon" }, { "@supabase/supabase-js": { createClient: () => ({}) } })
  assert.equal(app.databaseConfigured, true)
})
