import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import pg from "pg"
const url = process.env.POTW_TEST_DATABASE_URL
test("real Postgres authorization, lifecycle, upload, vote and concurrency contracts", { skip: !url }, async () => {
  const location = new URL(url)
  assert.ok(["localhost", "127.0.0.1", "postgres"].includes(location.hostname) && location.pathname.endsWith("_test"), "Use a fresh disposable local database ending in _test, never production")
  const pool = new pg.Pool({ connectionString: url, max: 5 })
  try {
    await pool.query(`create schema auth;
      do $$ begin
        if not exists(select 1 from pg_roles where rolname='anon') then create role anon; end if;
        if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
        if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role bypassrls; end if;
      end $$;
      create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
      create table auth.identities(user_id uuid references auth.users(id),provider_id text,identity_data jsonb,provider text);
      grant usage on schema public to service_role;`)
    for (const filename of readdirSync("supabase/migrations").filter(f => f.endsWith(".sql")).sort()) {
      await pool.query(readFileSync(`supabase/migrations/${filename}`, "utf8").split("create extension if not exists pg_cron;")[0])
    }
    const client = await pool.connect()
    try {
      await client.query("begin")
      await client.query(readFileSync("tests/potw-fixtures.sql", "utf8"))
      await client.query(readFileSync("tests/potw-assertions.sql", "utf8"))
    } finally { await client.query("rollback"); client.release() }
    await pool.query(readFileSync("tests/potw-fixtures.sql", "utf8"))
    const vote = actor => pool.query("select public.potw_cast_vote($1,$2,$3)", [actor, "30000000-0000-4000-8000-000000000001", "40000000-0000-4000-8000-000000000002"])
    const results = await Promise.allSettled([vote("10000000-0000-4000-8000-000000000001"), vote("10000000-0000-4000-8000-000000000003")])
    assert.equal(results.filter(r => r.status === "fulfilled").length, 1)
    assert.equal(results.find(r => r.status === "rejected").reason.code, "PT409")
    // A request arriving before the deadline must still fail after waiting on a lock.
    const lock = await pool.connect()
    await pool.query("update public.potw_competitions set voting_close_at=clock_timestamp()+interval '500 milliseconds' where id='30000000-0000-4000-8000-000000000001'")
    await lock.query("begin; select id from public.potw_competitions where id='30000000-0000-4000-8000-000000000001' for update")
    const queued = pool.query("select public.potw_cast_vote($1,$2,$3)", ["10000000-0000-4000-8000-000000000002", "30000000-0000-4000-8000-000000000001", "40000000-0000-4000-8000-000000000001"])
    const rejected = assert.rejects(queued, e => e.code === "PT409")
    await new Promise(resolve => setTimeout(resolve, 750)); await lock.query("commit"); lock.release(); await rejected
  } finally { await pool.end() }
})
