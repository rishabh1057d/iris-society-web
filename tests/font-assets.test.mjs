import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"

const css = readFileSync("components/shutter-safari-popup.css", "utf8")
const fonts = {
  "/fonts/event-display.ttf": "34a78cbd9d2bda71ee96dfcb49a68ae8ce5b45bf00283e7b47d4980b2e697c07",
  "/fonts/event-accent.ttf": "f41678c38acd10f964c3f45e6cdb9d40517c4de8de632657d269e99cba003d02",
  "/fonts/event-body.woff2": "7344d16b57e34692d5d45ff4df66713177d1c9ec8c9f290bdd73552048309ebd",
}

test("popup font URLs use generic labels and preserve the original font bytes", () => {
  const urls = [...css.matchAll(/url\("(\/fonts\/[^"]+)"\)/g)].map(match => match[1])
  assert.deepEqual(urls.sort(), Object.keys(fonts).sort())
  for (const [url, checksum] of Object.entries(fonts)) {
    const bytes = readFileSync(`public${url}`)
    assert.equal(createHash("sha256").update(bytes).digest("hex"), checksum, url)
  }
  for (const family of ["Event Display", "Event Accent", "Event Body"]) {
    assert(css.includes(`font-family: "${family}"`), family)
  }
})

test("the bundled open-font copyright and full license remain available", () => {
  const license = readFileSync("public/fonts/event-body-OFL.txt", "utf8")
  assert.equal(
    createHash("sha256").update(license.replaceAll("\r\n", "\n")).digest("hex"),
    "793bdd8538a0c03afb5bc10906be27ad1dc76f143cfeac8c55cd9075a5b3a55c",
  )
})
