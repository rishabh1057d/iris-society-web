import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const origin = process.env.TEST_BASE_URL || "http://localhost:3000"
for (const page of ["/", "/about", "/beginner", "/contact", "/events", "/events/register", "/gallery", "/join", "/meetups", "/potw", "/team", "/admin/dashboard", "/admin/dashboard/potw", "/admin/dashboard/event-registration"]) {
  test(`${page} still renders`, async () => {
    const response = await fetch(new URL(page, origin))
    assert.equal(response.status, 200)
    assert.match(response.headers.get("content-type"), /text\/html/)
  })
}

test("POTW links to admin sign-in and admin entry URLs lead to the existing dashboard", async () => {
  const html = await (await fetch(new URL("/potw", origin))).text()
  assert.ok(html.includes('href="/admin/dashboard/potw"'))
  assert.match(html, /Admin sign in/)
  for (const path of ["/admin", "/admin/login"]) {
    const response = await fetch(new URL(path, origin), { redirect: "manual" })
    assert.equal(response.status, 307)
    assert.equal(new URL(response.headers.get("location"), origin).pathname, "/admin/dashboard")
  }
})

test("all migrated images and old incoming URLs still work", async () => {
  const paths = JSON.parse(readFileSync("lib/image-paths.json", "utf8"))
  for (const [oldPath, destination] of Object.entries(paths)) {
    const image = await fetch(new URL(destination, origin), { method: "HEAD" })
    assert.equal(image.status, 200, destination)
    assert.match(image.headers.get("content-type"), /^image\//)
    const redirect = await fetch(new URL(oldPath, origin), { method: "HEAD", redirect: "manual" })
    assert.equal(redirect.status, 308, oldPath)
    assert.equal(new URL(redirect.headers.get("location"), origin).pathname, destination)
  }
})

test("generic popup fonts and the open-font notice are served", async () => {
  for (const name of ["event-display.ttf", "event-accent.ttf", "event-body.woff2", "event-body-OFL.txt"]) {
    const response = await fetch(new URL(`/fonts/${name}`, origin))
    assert.equal(response.status, 200, name)
    assert((await response.arrayBuffer()).byteLength > 0, name)
  }
})

test("shared branding, image fallbacks and the media-rights notice remain available", async () => {
  for (const name of ["/images/brand/iris-logo.png", "/placeholder.svg", "/placeholder.jpg"]) {
    const response = await fetch(new URL(name, origin), { method: "HEAD" })
    assert.equal(response.status, 200, name)
  }
  const response = await fetch(new URL("/", origin))
  const html = await response.text()
  assert(html.includes("Photos and videos"))
  assert(html.includes("No unauthorized reuse"))
  assert(html.includes("ASSET_LICENSE.md"))
  assert(html.includes("/images/brand/iris-logo.png"))
  assert(!html.includes('"/logo.png"'))
})
