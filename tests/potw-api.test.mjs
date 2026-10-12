import test from "node:test"
import assert from "node:assert/strict"
import { loadPotw } from "./potw-module.mjs"

const actor = "10000000-0000-4000-8000-000000000001"
const photo = "50000000-0000-4000-8000-000000000001"
const expired = "50000000-0000-4000-8000-000000000002"
function harness({ authenticated = true, verified = true, admin = false, readable = false } = {}) {
  let queries = 0
  class PotwError extends Error { constructor(message, status = 400) { super(message); this.status = status } }
  const respond = (data, status = 200) => Response.json(data, { status })
  const identity = { user: { id: actor }, student: { id: "approved-student", display_name: "Fixture", student_id: "canonical" }, error: null }
  const requireUser = async () => authenticated ? identity : { error: respond({ error: "Sign in" }, 401) }
  const studentAuth = async () => !authenticated ? requireUser() : verified ? identity : { error: respond({ error: "Membership required" }, 403) }
  const adminAuth = async () => !authenticated ? requireUser() : admin ? identity : { error: respond({ error: "Admin required" }, 403) }
  const server = { respond, PotwError, enabled: true, studentAuth, adminAuth, rpc: async () => { queries++; return {} },
    failure: e => respond({ error: e.message }, e.status ?? 500),
    photoVersion: async id => { if (id === expired) throw new PotwError("Unavailable", 404); return { display_key: "display", original_key: "original", thumbnail_key: "thumbnail" } },
    canReadPhoto: async (_photo, _student, original) => readable && !original }
  const api = loadPotw("lib/potw/api.ts", {
    "./server": server, "../api-auth": { requireUser },
    "../supabase-server": { databaseConfigured: true, supabaseServer: { from() { queries++; throw new Error("Unexpected query") } } },
    "./r2": { storageConfigured: true, signedImage: async key => ({ url: `https://fixture.invalid/${key}`, expires_at: "fixture" }) },
    "./images": {},
  })
  return { api, queries: () => queries }
}
function request(path, method = "GET", body) { return new Request(`http://localhost/api/potw/${path.join("/")}`, { method, ...(body && method !== "GET" ? { body: JSON.stringify(body) } : {}) }) }

test("member endpoints deny anonymous and unverified accounts before database access", async () => {
  for (const options of [{ authenticated: false }, { verified: false }]) {
    for (const path of [["me"], ["my-submissions"], ["competitions", actor, "gallery"], ["submissions", actor]]) {
      const app = harness(options)
      const response = await app.api.memberHandler(request(path), path)
      assert.equal(response.status, options.authenticated === false ? 401 : 403)
      assert.equal(app.queries(), 0)
    }
  }
})
test("admin routes deny students before queries or mutation parsing", async () => {
  for (const [path, method] of [[["roster"], "GET"], [["storage"], "GET"], [["competitions"], "POST"], [["competitions", actor, "review"], "POST"]]) {
    const app = harness()
    assert.equal((await app.api.adminHandler(request(path, method, {}), path)).status, 403)
    assert.equal(app.queries(), 0)
  }
})
test("private image access denies unpublished photographs and voter access to originals", async () => {
  for (const [readable, variant] of [[false, "thumbnail"], [true, "original"]]) {
    const app = harness({ readable })
    const response = await app.api.memberHandler(request(["image-access"], "POST", { ids: [photo], variant }), ["image-access"])
    assert.equal(response.status, 403)
  }
})
test("expired photographs do not break authorized image batches, and admin flags need admin authorization", async () => {
  const app = harness({ readable: true })
  const response = await app.api.memberHandler(request(["image-access"], "POST", { ids: [photo, expired] }), ["image-access"])
  assert.equal(response.status, 200)
  const result = await response.json()
  assert.ok(result.images[photo]); assert.deepEqual(result.unavailable, [expired])
  const denied = await app.api.memberHandler(request(["image-access"], "POST", { ids: [photo], admin: true }), ["image-access"])
  assert.equal(denied.status, 403)
})
