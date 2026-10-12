import { z } from "zod"
import { UPLOAD_TYPES, MAX_UPLOAD_BYTES, STUDENT_EMAIL_PATTERN } from "./types"

export const uuid = z.string().uuid()
export const metadataSchema = z.object({ title: z.string().trim().min(1).max(120), caption: z.string().trim().max(2000).default("") }).strict()
export const competitionSchema = z.object({
  theme: z.string().trim().min(1).max(160), description: z.string().trim().min(1).max(5000), rules: z.string().trim().min(1).max(5000),
  submissions_open_at: z.string().datetime(), submissions_close_at: z.string().datetime(),
  voting_open_at: z.string().datetime(), voting_close_at: z.string().datetime(),
  featured: z.boolean().default(false), banner_version_id: uuid.nullable().default(null),
}).strict().refine(v => Date.parse(v.submissions_open_at) < Date.parse(v.submissions_close_at) && Date.parse(v.submissions_close_at) <= Date.parse(v.voting_open_at) && Date.parse(v.voting_open_at) < Date.parse(v.voting_close_at), "Dates must be chronological")
export const uploadSchema = z.object({
  competition_id: uuid, purpose: z.enum(["submission", "banner"]).default("submission"),
  bytes: z.number().int().positive().max(MAX_UPLOAD_BYTES), content_type: z.enum(UPLOAD_TYPES),
  title: metadataSchema.shape.title, caption: metadataSchema.shape.caption,
}).strict()
export const rosterSchema = z.array(z.object({
  student_id: z.string().trim().min(1).max(80).transform(v => v.toLowerCase()),
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()).refine(v => STUDENT_EMAIL_PATTERN.test(v), "Institutional email required"),
  display_name: z.string().trim().min(1).max(120),
}).strict()).min(1).max(2000).superRefine((rows, ctx) => {
  const emails = new Set<string>()
  for (const row of rows) {
    if (emails.has(row.email)) ctx.addIssue({ code: "custom", message: "Duplicate roster email" })
    emails.add(row.email)
  }
})

// IDs in this CSV are approved by the society, not verified by their format.
export function parseRosterCsv(text: string) {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++ }
      else quoted = !quoted
    } else if (!quoted && (char === "," || char === "\n")) {
      row.push(cell.replace(/\r$/, "")); cell = ""
      if (char === "\n") { if (row.some(v => v.trim())) rows.push(row); row = [] }
    } else cell += char
  }
  if (quoted) throw new Error("Unclosed quoted CSV field")
  row.push(cell.replace(/\r$/, "")); if (row.some(v => v.trim())) rows.push(row)
  const header = rows.shift()?.map(v => v.replace(/^\uFEFF/, "").trim())
  if (header?.join(",") !== "student_id,email,display_name") throw new Error("CSV header must be student_id,email,display_name")
  if (rows.some(v => v.length !== 3)) throw new Error("Each CSV row needs exactly three fields")
  return rosterSchema.parse(rows.map(v => ({ student_id: v[0], email: v[1], display_name: v[2] })))
}
