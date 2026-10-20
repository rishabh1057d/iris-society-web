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

test("every website image is organized and readable, with unique migrated destinations", async () => {
  const destinations = Object.values(mapping)
  assert.equal(new Set(destinations).size, destinations.length)
  for (const url of imageFiles) {
    assert(images.has(url), `Missing migrated image: ${url}`)
    assert.match(url, /^\/images\/(?:[a-z0-9-]+\/)+[a-z0-9-]+\.(?:png|jpe?g|webp)$/)
    const file = path.join("public", url.slice(1))
    assert(statSync(file).size > 0)
    const metadata = await sharp(file).metadata()
    assert(metadata.width > 0 && metadata.height > 0, `Unreadable image: ${url}`)
    await sharp(file).stats()
  }
})

test("current team groups contain valid public profiles and local portraits", () => {
  const current = JSON.parse(readFileSync("public/current_members.json", "utf8"))
  const allowedFields = new Set(["id", "name", "role", "description", "image", "linkedin", "className"])
  for (const group of ["leadershipTeam", "Coordinators", "OutreachAndSponsor", "CreativeProduction", "MultimediaDesign", "ContentStrategyPR", "webDevTeam"]) {
    assert(Array.isArray(current[group]), `${group}: missing member list`)
    const ids = new Set()
    for (const member of current[group]) {
      assert(Number.isInteger(member.id) && !ids.has(member.id), `${group}: invalid or duplicate id`)
      ids.add(member.id)
      assert(member.name?.trim() && member.role?.trim(), `${group}: missing name or role`)
      for (const key of Object.keys(member)) assert(allowedFields.has(key), `${group}: unexpected public field ${key}`)
      assert(member.image === "/placeholder.svg" || images.has(member.image), `${member.name}: missing local portrait`)
      if (member.linkedin) {
        const url = new URL(member.linkedin)
        assert.equal(url.protocol, "https:")
        assert.equal(url.hostname, "www.linkedin.com")
        assert(url.pathname.startsWith("/in/"), `${member.name}: invalid personal LinkedIn URL`)
      }
    }
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

test("2026-27 coordinators reuse their team portraits and returning members are retained", () => {
  const current = JSON.parse(readFileSync("public/current_members.json", "utf8"))
  assert.deepEqual(current.Coordinators.map(member => member.name), ["Daksh Prajapati", "M. Hema Varshini"])
  for (const coordinator of current.Coordinators) {
    assert.equal(coordinator.role, "Coordinator")
    const departmentMember = [...current.CreativeProduction, ...current.ContentStrategyPR].find(member => member.name === coordinator.name)
    assert.equal(coordinator.image, departmentMember.image)
    assert.equal(coordinator.linkedin, departmentMember.linkedin)
  }
  const layout = readFileSync("app/team/page.tsx", "utf8")
  assert(layout.indexOf('key: "Coordinators"') < layout.indexOf('key: "OutreachAndSponsor"'))
  assert.equal(current.MultimediaDesign.filter(member => member.name === "Tanushree Dey").length, 1)
  assert.equal(current.MultimediaDesign.find(member => member.name === "Keshav Malik").role, "Core Operations & Graphic Designer")
  assert.equal(current.leadershipTeam.find(member => member.role === "Deputy Secretary").image, "/images/team/2026-2027/vishal-deputy-secretary.webp")
  assert.match(current.leadershipTeam.find(member => member.role === "Secretary").description, /Leads IRIS Society/)
})

test("new photowalk and Saavan archive records preserve their source and previous editions", () => {
  const meetups = JSON.parse(readFileSync("public/meetup.json", "utf8"))
  const events = JSON.parse(readFileSync("public/events.json", "utf8"))
  for (const records of [meetups, events]) assert.equal(new Set(records.map(entry => entry.id)).size, records.length)
  const photowalk = meetups.find(entry => entry.instagramUrl === "https://www.instagram.com/p/DeOgSdSywWL/")
  assert.equal(photowalk.status, "previous")
  assert.equal(photowalk.registrationOpen, false)
  assert.match(photowalk.dates, /October 10, 2026/)
  assert.match(photowalk.collab, /Pichavaram House x Nallamala House/)
  assert(images.has(photowalk.image))
  const saavan = events.find(entry => entry.title === "Shutter Safari: Saavan Edition 2.0")
  assert.equal(saavan.status, "previous")
  assert.equal(saavan.registrationOpen, false)
  assert.equal(saavan.resultLink, "https://www.instagram.com/p/DeYwclZkkc6/")
  assert(images.has(saavan.image))
  assert(events.some(entry => entry.title === "Shutter Safari: Saavan Edition" && entry.dates.includes("2025")))
})
