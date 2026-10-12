import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { runInNewContext } from "node:vm"
import ts from "typescript"
import * as previewPolicy from "../lib/potw-preview.mjs"

const require = createRequire(import.meta.url)
const trustedPreview = { VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_REF: "feature/potw-platform", VERCEL_GIT_REPO_OWNER: "rishabh1057d", VERCEL_GIT_REPO_SLUG: "iris-society-web", POTW_PREVIEW_ENABLED: "1", POTW_TEST_MODE: "1" }

test("only the explicitly enabled society POTW branch can access preview data", () => {
  assert.equal(previewPolicy.potwPreviewAllowed(trustedPreview), true)
  assert.equal(previewPolicy.potwTestMode(trustedPreview), true)
  for (const override of [{ VERCEL_ENV: "production" }, { VERCEL_GIT_COMMIT_REF: "main" }, { VERCEL_GIT_REPO_OWNER: "fork-owner" }, { VERCEL_GIT_REPO_SLUG: "another-repo" }, { POTW_PREVIEW_ENABLED: "0" }, { POTW_TEST_MODE: "0" }]) {
    assert.equal(previewPolicy.potwPreviewAllowed({ ...trustedPreview, ...override }), false)
    assert.equal(previewPolicy.potwTestMode({ ...trustedPreview, ...override }), false)
  }
  assert.equal(previewPolicy.potwTestMode({ POTW_TEST_MODE: "1" }), true)
})

test("trusted preview permits POTW APIs but cannot access event administration", async () => {
  let calls = 0
  const auth = load("lib/api-auth.ts", {}, { "./supabase-server": { databaseConfigured: true, trustedPotwPreview: true, supabaseServer: { auth: { getUser: async () => { calls++; return { data: { user: { id: "fixture", email: "admin@example.com", email_confirmed_at: "confirmed" } }, error: null } } } } } })
  for (const path of ["/api/events/register", "/api/admin/registrations", "/api/admin/event-config", "/api/admin/upload-poster", "/api/admin/me/extra", "/api/potw-fake"]) {
    assert.equal((await auth.requireUser(new Request(`https://fixture.test${path}`, { headers: { Authorization: "Bearer fixture" } }))).error.status, 503)
  }
  assert.equal(calls, 0)
  for (const path of ["/api/potw", "/api/potw/me", "/api/admin/potw/competitions", "/api/admin/me"]) {
    assert.equal((await auth.requireUser(new Request(`https://fixture.test${path}`, { headers: { Authorization: "Bearer fixture" } }))).error, null)
  }
  assert.equal(calls, 4)
})

test("trusted preview server client uses explicitly scoped configuration", () => {
  let key
  const app = load("lib/supabase-server.ts", { ...trustedPreview, NEXT_PUBLIC_SUPABASE_URL: "https://fixture.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "fixture-secret" }, { "@supabase/supabase-js": { createClient: (_url, value) => { key = value; return {} } } })
  assert.equal(app.databaseConfigured, true)
  assert.equal(key, "fixture-secret")
})
function load(file, env, dependencies) {
  const module = { exports: {} }
  const code = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  runInNewContext(code, { module, exports: module.exports, process: { env }, require: name => name === "./potw-preview.mjs" ? previewPolicy : dependencies[name] ?? require(name), console, URL })
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
