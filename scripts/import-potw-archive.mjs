import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
export function archiveRows(tree) {
  return Object.entries(tree).flatMap(([year, months]) => Object.entries(months).flatMap(([month, entries]) => entries.map(entry => {
    const publicEntry = { id: entry.id, week: entry.week, year, month, theme: entry.theme, photographer: entry.photographer, description: entry.description, image: entry.image }
    return { source_id: `${year}/${month}/${entry.id}`, entry: publicEntry, source_hash: createHash("sha256").update(JSON.stringify(publicEntry)).digest("hex") }
  })))
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  dotenv.config({ path: ".env.local", quiet: true })
  const rows = archiveRows(JSON.parse(readFileSync("public/potw.json", "utf8")))
  if (!process.argv.includes("--apply")) { console.log(`${rows.length} archive entries validated. Add --apply to import without deleting existing records.`) }
  else {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VERCEL_ENV === "preview") throw new Error("A trusted server Supabase configuration is required")
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    const { error } = await db.from("potw_legacy_archive").upsert(rows, { onConflict: "source_id" })
    if (error) { console.error("Archive import failed", error.code); process.exitCode = 1 }
    else console.log(`Imported ${rows.length} archive entries. Existing photographs and JSON were preserved.`)
  }
}
