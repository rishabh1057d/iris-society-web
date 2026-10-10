import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const origin = process.env.TEST_BASE_URL || "http://localhost:3000"
for (const page of ["/", "/about", "/beginner", "/contact", "/events", "/events/register", "/gallery", "/join", "/meetups", "/potw", "/team", "/admin/dashboard/event-registration"]) {
  test(`${page} still renders`, async () => {
    const response = await fetch(new URL(page, origin))
    assert.equal(response.status, 200)
    assert.match(response.headers.get("content-type"), /text\/html/)
  })
}

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
