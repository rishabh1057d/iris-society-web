import test from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import dotenv from "dotenv"
import sharp from "sharp"
import { loadPotw } from "./potw-module.mjs"

dotenv.config({ path: ".env.local", quiet: true })

test("live private R2 signed upload, sanitized delivery, CORS and cleanup", { skip: process.env.POTW_TEST_R2 !== "1", timeout: 90000 }, async () => {
  for (const name of ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_ORIGINALS_BUCKET", "R2_DISPLAY_BUCKET"]) {
    assert.ok(process.env[name]?.trim(), `Missing ${name}`)
  }
  assert.equal(process.env.VERCEL_ENV === "preview", false, "Do not run storage checks in an untrusted preview")
  class PotwError extends Error {}
  const storage = loadPotw("lib/potw/r2.ts", { "./server": { PotwError } }, process.env)
  const { processPhoto } = loadPotw("lib/potw/images.ts")
  const staging = `staging/launch-check-${randomUUID()}`
  const keys = storage.versionKeys(randomUUID(), randomUUID())
  const objects = [[staging, true], [keys.original_key, true], [keys.display_key, false], [keys.thumbnail_key, false]]
  const origin = "https://iris-society.iitmbs.org"
  const request = (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(15000) })
  try {
    const source = await sharp({ create: { width: 96, height: 64, channels: 3, background: "#5149a1" } })
      .jpeg().withExif({ IFD0: { Artist: "Synthetic launch check" } }).toBuffer()
    const upload = await storage.signedUpload(staging, source.length, "image/jpeg", 120)
    for (const allowedOrigin of [origin, "http://localhost:3000", "http://127.0.0.1:3001"]) {
      const preflight = await request(upload, { method: "OPTIONS", headers: { Origin: allowedOrigin, "Access-Control-Request-Method": "PUT", "Access-Control-Request-Headers": "content-type" } })
      assert.ok(preflight.ok, "Upload preflight must succeed")
      assert.equal(preflight.headers.get("access-control-allow-origin"), allowedOrigin)
    }
    const blocked = await request(upload, { method: "OPTIONS", headers: { Origin: "https://untrusted.invalid", "Access-Control-Request-Method": "PUT", "Access-Control-Request-Headers": "content-type" } })
    assert.notEqual(blocked.headers.get("access-control-allow-origin"), "https://untrusted.invalid")
    const wrongType = await request(upload, { method: "PUT", headers: { "Content-Type": "image/png" }, body: source })
    assert.equal(wrongType.status, 403, "The signed MIME type must be enforced")
    const wrongLength = await request(upload, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: Buffer.concat([source, Buffer.from([0])]) })
    assert.equal(wrongLength.status, 403, "The signed byte length must be enforced")
    const uploaded = await request(upload, { method: "PUT", headers: { "Content-Type": "image/jpeg", Origin: origin }, body: source })
    assert.ok(uploaded.ok, "Direct signed PUT must succeed")
    assert.equal(uploaded.headers.get("access-control-allow-origin"), origin)
    assert.deepEqual(await storage.readUpload(staging, source.length, "image/jpeg"), source)
    await assert.rejects(storage.readUpload(staging, source.length + 1, "image/jpeg"))
    const photo = await processPhoto(source, "image/jpeg")
    await storage.writePhoto(keys.original_key, source, "image/jpeg", true)
    await storage.writePhoto(keys.display_key, photo.display, "image/webp")
    await storage.writePhoto(keys.thumbnail_key, photo.thumbnail, "image/webp")
    const { url } = await storage.signedImage(keys.display_key)
    const display = await request(url, { headers: { Origin: origin } })
    assert.ok(display.ok, "Authorized display GET must succeed")
    assert.equal(display.headers.get("access-control-allow-origin"), origin)
    assert.match(display.headers.get("cache-control"), /private/)
    const downloaded = Buffer.from(await display.arrayBuffer())
    assert.deepEqual(downloaded, photo.display)
    assert.equal((await sharp(downloaded).metadata()).exif, undefined)
    const unsigned = new URL(url); unsigned.search = ""
    assert.equal((await request(unsigned)).ok, false, "The existing display object must not be publicly readable")
    const original = await storage.signedImage(keys.original_key, true, 60)
    const fullResolution = await request(original.url)
    assert.ok(fullResolution.ok)
    assert.deepEqual(Buffer.from(await fullResolution.arrayBuffer()), source)
    const unsignedOriginal = new URL(original.url); unsignedOriginal.search = ""
    assert.equal((await request(unsignedOriginal)).ok, false, "The existing original must remain private")
    const expiring = await storage.signedImage(keys.display_key, false, 1)
    await new Promise(resolve => setTimeout(resolve, 2100))
    assert.equal((await request(expiring.url)).ok, false, "An expired bearer link must be rejected")
  } catch (error) {
    // Signed bearer URLs and SDK credentials must never appear in test failure output.
    throw new Error(`Live R2 check failed: ${error.code ?? error.name} (${error.$metadata?.httpStatusCode ?? "check failed"})`)
  } finally {
    const cleaned = await Promise.allSettled(objects.map(([key, original]) => storage.removeObject(key, original)))
    assert.ok(cleaned.every(result => result.status === "fulfilled"), "Synthetic test object cleanup failed")
  }
})
