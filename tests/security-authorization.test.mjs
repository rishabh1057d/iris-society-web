import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { runInNewContext } from "node:vm"
import ts from "typescript"

const require = createRequire(import.meta.url)
const studentEmail = "fixture@ds.study.iitm.ac.in"
const adminEmail = "admin@example.com"

// Exercise the real TS handlers with fake Auth/database responses, never production data.
function loadModule(path, dependencies, env = {}) {
  const module = { exports: {} }
  const code = ts.transpileModule(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  runInNewContext(code, {
    module, exports: module.exports,
    require: (name) => dependencies[name] ?? require(name),
    process: { env }, console, URL, Request, Response, Headers, File, Buffer, crypto,
  }, { filename: path })
  return module.exports
}

function fixture(email = studentEmail, { admins = adminEmail, confirmed = true, open = true, deadline = null, duplicate = false } = {}) {
  const queries = []
  const supabaseServer = {
    auth: {
      getUser: async (token) => token === "fixture-token"
        ? { data: { user: { email, email_confirmed_at: confirmed ? "2026-01-01" : null } }, error: null }
        : { data: { user: null }, error: { message: "Invalid token" } },
    },
    from(table) {
      const call = { table, filters: {}, inserted: null }
      queries.push(call)
      const query = {
        select() { return query },
        eq(key, value) { call.filters[key] = value; return query },
        insert(value) { call.inserted = value; return query },
        async limit() { return { data: call.filters.event_name ? [] : [{ full_name: "Fixture Student" }], error: null } },
        async single() {
          if (table === "event_config") return { data: { event_name: "Fixture Event", registration_open: open, registration_deadline: deadline }, error: null }
          return duplicate ? { data: null, error: { code: "23505" } } : { data: { id: "fixture-id", ...call.inserted }, error: null }
        },
      }
      return query
    },
  }
  const auth = loadModule("lib/api-auth.ts", { "./supabase-server": { supabaseServer, databaseConfigured: true } }, { ADMIN_EMAILS: admins })
  const dependencies = { "../../../../lib/api-auth": auth, "../../../../lib/supabase-server": { supabaseServer } }
  return { queries, auth, route: (path) => loadModule(path, dependencies) }
}

function request(path = "/api/events/register", body, authorization = "Bearer fixture-token") {
  return new Request(`http://localhost${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { ...(authorization ? { Authorization: authorization } : {}), "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

test("missing, malformed, invalid, and unconfirmed sessions are denied", async () => {
  for (const authorization of [null, "fixture-token", "Bearer invalid-token"]) {
    const result = await fixture().auth.requireUser(request(undefined, undefined, authorization))
    assert.equal(result.error.status, 401)
  }
  const result = await fixture(studentEmail, { confirmed: false }).auth.requireUser(request())
  assert.equal(result.error.status, 401)
})

test("admin authorization uses the server allowlist, normalizes case, and fails closed", async () => {
  assert.equal((await fixture(adminEmail, { admins: " ADMIN@EXAMPLE.COM " }).auth.requireAdmin(request())).error, null)
  assert.equal((await fixture().auth.requireAdmin(request())).error.status, 403)
  assert.equal((await fixture(adminEmail, { admins: "" }).auth.requireAdmin(request())).error.status, 403)
})

test("every admin handler denies a signed-in non-admin before database access", async () => {
  for (const [name, method] of [["event-config", "GET"], ["event-config", "PUT"], ["event-names", "GET"], ["registrations", "GET"], ["upload-poster", "POST"], ["me", "GET"]]) {
    const app = fixture()
    const response = await app.route(`app/api/admin/${name}/route.ts`)[method](request())
    assert.equal(response.status, 403)
    assert.equal(app.queries.length, 0)
  }
})

test("a student cannot look up or submit another student's email", async () => {
  const app = fixture()
  const route = app.route("app/api/events/register/route.ts")
  assert.equal((await route.GET(request("/api/events/register?email=other@ds.study.iitm.ac.in"))).status, 403)
  assert.equal((await route.POST(request(undefined, { student_email: "other@ds.study.iitm.ac.in", full_name: "Fixture" }))).status, 403)
  assert.equal(app.queries.length, 0)
})

test("non-student accounts cannot read or create student registrations", async () => {
  const app = fixture(adminEmail)
  const route = app.route("app/api/events/register/route.ts")
  assert.equal((await route.GET(request())).status, 403)
  assert.equal((await route.POST(request(undefined, {}))).status, 403)
  assert.equal(app.queries.length, 0)
})

test("a student's registration lookup is limited to their verified email", async () => {
  const app = fixture()
  const response = await app.route("app/api/events/register/route.ts").GET(request())
  assert.equal(response.status, 200)
  assert.equal(app.queries[0].filters.student_email, studentEmail)
  assert.equal((await response.json()).registered, true)
  assert.equal(response.headers.get("Cache-Control"), "no-store")
})

test("closed and expired events refuse new registrations without inserting", async () => {
  for (const options of [{ open: false }, { deadline: "2000-01-01T00:00:00Z" }]) {
    const app = fixture(studentEmail, options)
    const response = await app.route("app/api/events/register/route.ts").POST(request(undefined, { full_name: "Fixture", event_name: "Fixture Event" }))
    assert.equal(response.status, 403)
    assert.equal(app.queries.length, 1)
    assert.equal(app.queries[0].table, "event_config")
  }
})

test("registration inserts use the verified email and active event", async () => {
  const app = fixture()
  const response = await app.route("app/api/events/register/route.ts").POST(request(undefined, { full_name: "Fixture", event_name: "Fixture Event" }))
  assert.equal(response.status, 200)
  const inserted = app.queries.find((query) => query.inserted).inserted
  assert.equal(inserted.student_email, studentEmail)
  assert.equal(inserted.event_name, "Fixture Event")
})

test("a duplicate insert race returns 409 rather than success or a server error", async () => {
  const app = fixture(studentEmail, { duplicate: true })
  const response = await app.route("app/api/events/register/route.ts").POST(request(undefined, { full_name: "Fixture", event_name: "Fixture Event" }))
  assert.equal(response.status, 409)
})
