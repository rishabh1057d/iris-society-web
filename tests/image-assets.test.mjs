import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import config from "../next.config.mjs"

const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve("next/package.json"))("sharp")
const mapping = JSON.parse(readFileSync("lib/image-paths.json", "utf8"))
const imageFiles = readdirSync("public/images", { recursive: true })
  .filter(file => statSync(path.join("public/images", file)).isFile())
  .map(file => `/images/${file.replaceAll("\\", "/")}`)
const images = new Set(imageFiles)
const sources = ["app", "components", "lib", "public"]
  .flatMap(dir => readdirSync(dir, { recursive: true }).map(file => path.join(dir, file)))
  .filter(file => statSync(file).isFile())
  .filter(file => /\.(?:tsx?|jsx?|json|css|html)$/.test(file) && !file.endsWith("image-paths.json"))

test("all local image references exist with exact case and use migrated paths", () => {
  let checked = 0
  for (const file of sources) {
    const source = readFileSync(file, "utf8")
    for (const match of source.matchAll(/(["'`])(\/images\/[^"'`\r\n]+?\.(?:png|jpe?g|webp|gif|svg|avif))\1/gi)) {
      assert(images.has(decodeURI(match[2])), `${file}: missing ${match[2]}`)
      checked++
    }
    for (const oldPath of Object.keys(mapping)) assert(!source.includes(oldPath), `${file}: stale ${oldPath}`)
    if (file.endsWith(".json")) JSON.parse(source)
  }
  assert(checked > 200, "Image reference scan unexpectedly found too few references")
})

test("every migrated image has a unique, organized, readable destination", async () => {
  const destinations = Object.values(mapping)
  assert.equal(new Set(destinations).size, destinations.length)
  for (const url of destinations) {
    assert(images.has(url), `Missing migrated image: ${url}`)
    assert.match(url, /^\/images\/(?:[a-z0-9-]+\/)+[a-z0-9-]+\.(?:png|jpe?g|webp)$/)
    const file = path.join("public", url.slice(1))
    assert(statSync(file).size > 0)
    const metadata = await sharp(file).metadata()
    assert(metadata.width > 0 && metadata.height > 0, `Unreadable image: ${url}`)
    await sharp(file).stats()
  }
})

test("legacy redirects cover every old URL without chains or loops", async () => {
  const redirects = await config.redirects()
  for (const [oldPath, destination] of Object.entries(mapping)) {
    assert(!Object.hasOwn(mapping, destination), `Redirect chain: ${destination}`)
    const source = encodeURI(oldPath).replace(/[()*+?:]/g, "\\$&")
    assert(redirects.some(rule => rule.source === source && rule.destination === destination && rule.permanent === true), `Missing redirect: ${oldPath}`)
  }
})
