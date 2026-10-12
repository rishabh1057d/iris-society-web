import test from "node:test"
import assert from "node:assert/strict"
import { loadPotw } from "./potw-module.mjs"
const email = "fixture@ds.study.iitm.ac.in"
function fixture({ approved = true, provider = "google", confirmed = true, authenticated = true, enabled = "1", preview = false, userEmail = email } = {}) {
  let queries = 0
  const user = { id: "10000000-0000-4000-8000-000000000001", email: userEmail, email_confirmed_at: confirmed ? "2026-01-01" : null, identities: [{ provider }], user_metadata: { student_verified: true, student_id: "forged" } }
  const db = { auth: { getUser: async () => ({ data: { user: authenticated ? user : null }, error: null }) }, rpc: async name => { queries++; return name === "potw_identity" && !approved ? { data: null, error: { code: "PT403", message: "Approved IRIS membership required" } } : { data: "student-id", error: null } }, from() { queries++; const query = { select() { return query }, eq() { return query }, async single() { return { data: { id: "student-id", active: true, display_name: "Fixture", student_id: "approved-fixture" }, error: null } } }; return query } }
  const server = loadPotw("lib/potw/server.ts", { "../supabase-server": { databaseConfigured: !preview, supabaseServer: db }, "./supabase-server": { databaseConfigured: !preview, supabaseServer: db } }, { POTW_ENABLED: enabled, ADMIN_EMAILS: "admin@example.com" })
  return { server, queries: () => queries }
}
const request = (auth = true) => new Request("http://localhost/api/potw/me", { headers: auth ? { Authorization: "Bearer fixture-token" } : {} })
test("missing and invalid sessions are denied before roster queries", async () => {
  for (const [app, signedIn] of [[fixture(), false], [fixture({ authenticated: false }), true], [fixture({ confirmed: false }), true]]) {
    const response = await app.server.studentAuth(request(signedIn))
    assert.equal(response.error.status, 401); assert.equal(app.queries(), 0)
  }
})
test("verified institutional Google member passes; forged metadata and unapproved IDs do not", async () => {
  assert.equal((await fixture().server.studentAuth(request())).student.student_id, "approved-fixture")
  await assert.rejects(fixture({ approved: false }).server.studentAuth(request()), /Approved IRIS/)
  assert.equal((await fixture({ provider: "email" }).server.studentAuth(request())).error.status, 403)
})
test("disabled and preview environments fail closed", async () => {
  assert.equal((await fixture({ enabled: "0" }).server.studentAuth(request())).error.status, 503)
  assert.equal((await fixture({ enabled: "" }).server.studentAuth(request())).error.status, 503)
  assert.equal((await fixture({ preview: true }).server.studentAuth(request())).error.status, 503)
})
test("POTW admin checks reuse ADMIN_EMAILS and deny ordinary students", async () => {
  assert.equal((await fixture().server.adminAuth(request())).error.status, 403)
  assert.equal((await fixture({ userEmail: "admin@example.com", enabled: "0", approved: false }).server.adminAuth(request())).error, null)
  assert.equal((await fixture({ userEmail: "admin@example.com" }).server.studentAuth(request())).error.status, 403)
})
test("competition responses use a public field allowlist, not database row spreads", () => {
  const { server } = fixture()
  const publicRow = server.competitionFields({ id: "fixture", theme: "Theme", created_by: "private-user", student_id: "private-id", extra_secret: "private" })
  assert.equal(publicRow.id, "fixture")
  assert.ok(!("created_by" in publicRow) && !("student_id" in publicRow) && !("extra_secret" in publicRow))
})
