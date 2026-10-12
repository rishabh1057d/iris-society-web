import test from "node:test"
import assert from "node:assert/strict"
import { loadPotw } from "./potw-module.mjs"

function scopedServer(isTest, env) {
  let calls = 0
  const db = { rpc: async () => { calls++; return { data: "allowed", error: null } }, from(table) {
    const filters = {}
    const query = { select() { return query }, eq(key, value) { filters[key] = value; return query }, is() { return query }, async single() {
      const data = table === "potw_competitions" ? (filters.is_test === isTest ? { id: "competition" } : null) : { id: "photo", competition_id: "competition" }
      return { data, error: null }
    } }
    return query
  } }
  return { server: loadPotw("lib/potw/server.ts", { "../supabase-server": { databaseConfigured: true, supabaseServer: db } }, env), calls: () => calls }
}

test("preview RPC and image access cannot reach official competitions", async () => {
  const app = scopedServer(false, { POTW_TEST_MODE: "1" })
  for (const [name, args] of [["potw_cast_vote", { p_comp: "competition" }], ["potw_admin_action", { p_comp: "competition", p_action: "review" }], ["potw_edit_submission", { p_id: "submission" }], ["potw_claim_upload", { p_id: "upload" }], ["potw_complete_upload", { p_id: "upload" }]]) {
    await assert.rejects(app.server.rpc(name, args), e => e.status === 404)
  }
  await assert.rejects(app.server.photoVersion("photo"), e => e.status === 404)
  assert.equal(app.calls(), 0)
})

test("test roster mutations are denied, but authorized test competition operations work", async () => {
  const app = scopedServer(true, { POTW_TEST_MODE: "1" })
  await assert.rejects(app.server.rpc("potw_admin_roster", {}), e => e.status === 403)
  for (const p_action of ["approve_student", "revoke_student"]) await assert.rejects(app.server.rpc("potw_admin_action", { p_action }), e => e.status === 403)
  assert.equal(await app.server.rpc("potw_cast_vote", { p_comp: "competition" }), "allowed")
  assert.equal((await app.server.photoVersion("photo")).id, "photo")
  assert.equal(app.calls(), 1)
})

test("production cannot read test photos or operate on test competitions", async () => {
  const app = scopedServer(true, { VERCEL_ENV: "production", POTW_TEST_MODE: "1" })
  await assert.rejects(app.server.rpc("potw_cast_vote", { p_comp: "competition" }), e => e.status === 404)
  await assert.rejects(app.server.photoVersion("photo"), e => e.status === 404)
  assert.equal(app.calls(), 0)
})
