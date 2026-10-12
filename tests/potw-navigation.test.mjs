import test from "node:test"
import assert from "node:assert/strict"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { loadPotw } from "./potw-module.mjs"

const { SessionGate } = loadPotw("components/potw/session.tsx", {
  "@/lib/supabase-browser": {},
  "@/components/ui/button": { Button: ({ children, ...props }) => createElement("button", props, children) },
})
function dashboard(ready, error = "") {
  const { default: Dashboard } = loadPotw("app/admin/dashboard/page.tsx", {
    "@/components/potw/session": { SessionGate, usePotwSession: () => ({ ready, error, signIn: async () => {}, signOut: async () => {} }) },
    "next/link": { __esModule: true, default: ({ children, ...props }) => createElement("a", props, children) },
    "next/image": { __esModule: true, default: props => createElement("img", props) },
  })
  return renderToStaticMarkup(createElement(Dashboard))
}

test("signed-out or denied admins get Google sign-in, not a student-registration redirect", () => {
  for (const error of ["Sign in required", "Admin access required"]) {
    const html = dashboard(false, error)
    assert.match(html, /Admin sign in/)
    assert.match(html, /Continue with Google/)
    assert.match(html, /server-side admin allowlist/)
    assert.ok(html.includes(error))
    assert.ok(!html.includes("Welcome to IRIS Admin Dashboard"))
    assert.ok(!html.includes("/events/register"))
  }
})

test("authorized admins can reach POTW management from the existing dashboard", () => {
  const html = dashboard(true)
  assert.match(html, /Welcome to IRIS Admin Dashboard/)
  assert.ok(html.includes('href="/admin/dashboard/potw"'))
  assert.ok(!html.includes("Continue with Google"))
})

test("auth events defer and coalesce session lookups, with no work after unmount", async () => {
  let listener, cleanup, insideCallback = false, calls = 0, unsubscribed = false
  const updates = []
  const { usePotwSession } = loadPotw("components/potw/session.tsx", {
    react: { useState: initial => [initial, value => updates.push(value)], useEffect: effect => { cleanup = effect() } },
    "@/components/ui/button": {},
    "@/lib/supabase-browser": {
      databaseConfigured: true,
      authenticatedFetch: async () => {
        assert.equal(insideCallback, false, "must not acquire a session within the auth callback")
        ++calls
        return Response.json({ student: { display_name: "Fixture", student_id: "fixture" } })
      },
      supabaseBrowser: { auth: { onAuthStateChange: callback => {
        listener = callback
        return { data: { subscription: { unsubscribe: () => { unsubscribed = true } } } }
      } } },
    },
  })
  usePotwSession()
  insideCallback = true
  listener(); listener()
  assert.equal(calls, 0)
  insideCallback = false
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.equal(calls, 1)
  assert.ok(updates.includes(true))
  listener(); cleanup()
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.equal(calls, 1)
  assert.equal(unsubscribed, true)
})
