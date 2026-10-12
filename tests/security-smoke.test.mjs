import test from "node:test"
import assert from "node:assert/strict"

const origin = process.env.TEST_BASE_URL || "http://localhost:3000"

for (const [method, path, body] of [
  ["GET", "/api/admin/registrations"],
  ["GET", "/api/admin/registrations?format=csv"],
  ["GET", "/api/admin/event-config"],
  ["PUT", "/api/admin/event-config", "{}"],
  ["GET", "/api/admin/event-names"],
  ["GET", "/api/admin/me"],
  ["POST", "/api/admin/upload-poster"],
  ["GET", "/api/events/register?email=someone@ds.study.iitm.ac.in"],
  ["POST", "/api/events/register", "{}"],
  ["GET", "/api/potw/me"],
  ["GET", "/api/potw/my-submissions"],
  ["POST", "/api/potw/uploads", "{}"],
  ["POST", "/api/potw/image-access", "{}"],
  ["GET", "/api/admin/potw/competitions"],
  ["GET", "/api/admin/potw/roster"],
  ["POST", "/api/admin/potw/competitions", "{}"],
  ["GET", "/api/potw-maintenance"],
]) {
  test(`${method} ${path} rejects anonymous requests`, async () => {
    const response = await fetch(new URL(path, origin), {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body,
    })
    assert.equal(response.status, 401)
  })
}
