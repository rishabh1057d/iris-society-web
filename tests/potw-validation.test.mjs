import test from "node:test"
import assert from "node:assert/strict"
import sharp from "sharp"
import { readFileSync } from "node:fs"
import { loadPotw } from "./potw-module.mjs"
const validation = loadPotw("lib/potw/validation.ts")
const { processPhoto } = loadPotw("lib/potw/images.ts")

test("roster CSV supports quoted names and approved aliases without trusting ID format", () => {
  const rows = validation.parseRosterCsv('student_id,email,display_name\r\n2026-fixture,student@ds.study.iitm.ac.in,"Name, With Comma"\r\n2026-fixture,alias@es.study.iitm.ac.in,"Name, With Comma"')
  assert.equal(rows.length, 2); assert.equal(rows[0].display_name, "Name, With Comma")
  assert.throws(() => validation.parseRosterCsv('student_id,email,display_name\na,personal@gmail.com,Name'))
  assert.throws(() => validation.parseRosterCsv('student_id,email,display_name\na,x@ds.study.iitm.ac.in,Name\nb,x@ds.study.iitm.ac.in,Other'))
  assert.throws(() => validation.parseRosterCsv('student_id,email,display_name\na,x@ds.study.iitm.ac.in,"Unclosed'))
})
test("upload and competition inputs reject forged identity, excessive bytes and invalid dates", () => {
  const upload = { competition_id: "30000000-0000-4000-8000-000000000001", bytes: 1024, content_type: "image/jpeg", title: "Photo" }
  assert.equal(validation.uploadSchema.parse(upload).purpose, "submission")
  assert.throws(() => validation.uploadSchema.parse({ ...upload, voter_id: "forged" }))
  assert.throws(() => validation.uploadSchema.parse({ ...upload, bytes: 5242881 }))
  assert.throws(() => validation.uploadSchema.parse({ ...upload, content_type: "image/svg+xml" }))
  assert.throws(() => validation.competitionSchema.parse({ theme: "Theme", description: "Description", rules: "Rules", submissions_open_at: "2026-01-02T00:00:00Z", submissions_close_at: "2026-01-01T00:00:00Z", voting_open_at: "2026-01-03T00:00:00Z", voting_close_at: "2026-01-04T00:00:00Z" }))
})
test("accepted display photos retain aspect ratio and strip sensitive metadata", async () => {
  const original = await sharp({ create: { width: 80, height: 40, channels: 3, background: "#445588" } }).jpeg().withExif({ IFD0: { Artist: "Private person" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "12/1 34/1 0/1", GPSLongitudeRef: "E", GPSLongitude: "56/1 7/1 0/1" } }).toBuffer()
  const result = await processPhoto(original, "image/jpeg")
  const info = await sharp(result.display).metadata()
  assert.equal(info.width, 80); assert.equal(info.height, 40); assert.equal(info.format, "webp")
  assert.equal(info.exif, undefined); assert.equal(info.xmp, undefined); assert.equal(result.sha256.length, 64)
})
test("invalid, corrupted, MIME-mismatched, oversized and animated uploads fail", async () => {
  await assert.rejects(processPhoto(Buffer.from('<svg onload="alert(1)"/>'), "image/jpeg"))
  await assert.rejects(processPhoto(Buffer.from([255,216,0,0]), "image/jpeg"))
  const png = await sharp({ create: { width: 16, height: 16, channels: 3, background: "red" } }).png().toBuffer()
  await assert.rejects(processPhoto(png, "image/jpeg"))
  await assert.rejects(processPhoto(Buffer.alloc(5242881), "image/png"))
  const pixels = Buffer.alloc(16 * 32 * 3, 128); pixels.fill(255, 16 * 16 * 3)
  const animated = await sharp(pixels, { raw: { width: 16, height: 32, channels: 3, pageHeight: 16 } }).webp({ loop: 0, delay: [100, 100] }).toBuffer()
  assert.equal((await sharp(animated).metadata()).pages, 2)
  await assert.rejects(processPhoto(animated, "image/webp"))
})
test("AI metadata indicators remain review evidence, not an automatic rejection", async () => {
  const original = await sharp({ create: { width: 20, height: 20, channels: 3, background: "blue" } }).jpeg().withExif({ IFD0: { Software: "Stable Diffusion" } }).toBuffer()
  const result = await processPhoto(original, "image/jpeg")
  assert.ok(result.ai_evidence.length > 0)
  assert.equal((await sharp(result.display).metadata()).exif, undefined)
})
test("legacy archive is preserved and contains 53 source entries", () => {
  const archive = JSON.parse(readFileSync("public/potw.json", "utf8"))
  const entries = Object.values(archive).flatMap(months => Object.values(months).flat())
  assert.equal(entries.length, 53)
  assert.ok(entries.every(e => typeof e.theme === "string" && typeof e.photographer === "string"))
  const { selectFeaturedPotw } = loadPotw("lib/potw.ts")
  const selected = selectFeaturedPotw(archive, new Date("2030-01-01T00:00:00Z"))
  assert.ok(selected?.image && archive[selected.year]?.[selected.month]?.length > 0)
})
test("R2 CORS manifests use exact production/development origins and no display uploads", () => {
  for (const name of ["originals", "display"]) {
    const { CORSRules } = JSON.parse(readFileSync(`infra/r2/potw-${name}-cors.json`, "utf8"))
    assert.ok(CORSRules[0].AllowedOrigins.includes("https://iris-society.iitmbs.org"))
    assert.ok(CORSRules[0].AllowedOrigins.every(origin => !origin.includes("*")))
    assert.equal(CORSRules[0].AllowedMethods.includes("PUT"), name === "originals")
  }
})
test("upload signatures bind generated key, content type, byte length and expiry", async () => {
  class PotwError extends Error {}
  const storage = loadPotw("lib/potw/r2.ts", { "./server": { PotwError } }, { R2_ACCOUNT_ID: "fixture-account", R2_ACCESS_KEY_ID: "fixture-access", R2_SECRET_ACCESS_KEY: "fixture-secret", R2_ORIGINALS_BUCKET: "fixture-originals", R2_DISPLAY_BUCKET: "fixture-display" })
  const url = new URL(await storage.signedUpload("staging/fixture-id", 1024, "image/jpeg", 120))
  assert.ok(url.pathname.endsWith("/staging/fixture-id"))
  assert.equal(url.searchParams.get("X-Amz-Expires"), "120")
  assert.ok(url.searchParams.get("X-Amz-SignedHeaders").includes("content-length"))
  assert.ok(url.searchParams.get("X-Amz-SignedHeaders").includes("content-type"))
})

test("R2 automatic expiration covers abandoned staging objects only", () => {
  const { rules } = JSON.parse(readFileSync("infra/r2/potw-originals-lifecycle.json", "utf8"))
  assert.equal(rules.length, 1)
  assert.equal(rules[0].enabled, true)
  assert.equal(rules[0].conditions.prefix, "staging/")
  assert.deepEqual(rules[0].deleteObjectsTransition.condition, { type: "Age", maxAge: 86400 })
  assert.equal(rules[0].storageClassTransitions, undefined)
})
