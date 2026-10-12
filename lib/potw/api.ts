import "server-only"
import { z } from "zod"
import { supabaseServer as db, databaseConfigured } from "../supabase-server"
import { adminAuth, studentAuth, respond, failure, rpc, publicLanding, publicCompetition, competition, competitionFields, photoVersion, canReadPhoto, PotwError, enabled } from "./server"
import { competitionSchema, metadataSchema, parseRosterCsv, uploadSchema, uuid } from "./validation"
import { processPhoto } from "./images"
import { readUpload, removeObject, signedImage, signedUpload, storageConfigured, versionKeys, writePhoto } from "./r2"
import type { Competition } from "./types"

type Upload = { id: string; competition_id: string; actor_id: string; student_id: string | null; purpose: "submission" | "banner"; title: string; caption: string; staging_key: string; declared_bytes: number; content_type: string; status: string; expires_at: string; lease_id: string; version_id: string | null; processing_versions: string[] }
async function body(request: Request, limit = 65536): Promise<unknown> {
  const reader = request.body?.getReader()
  if (!reader) throw new PotwError("Request body is required")
  const chunks: Uint8Array[] = []; let size = 0
  while (true) {
    const next = await reader.read(); if (next.done) break
    size += next.value.length
    if (size > limit) { await reader.cancel(); throw new PotwError("Request is too large", 413) }
    chunks.push(next.value)
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")) } catch { throw new PotwError("Invalid JSON") }
}
function page(request: Request, limit = 24) {
  const value = Number(new URL(request.url).searchParams.get("page") ?? 0)
  if (!Number.isInteger(value) || value < 0 || value > 10000) throw new PotwError("Invalid page")
  return { start: value * limit, end: value * limit + limit - 1 }
}
function checkDatabaseError(error: { code: string } | null) {
  if (error) throw new PotwError("POTW data is temporarily unavailable", 503)
}

export async function memberHandler(request: Request, path: string[]) {
  try {
    const method = request.method
    if (method === "GET" && (!path.length || path[0] === "featured")) {
      const data = await publicLanding()
      return respond(path[0] === "featured" ? { featured: data.featured } : data)
    }
    if (method === "GET" && path[0] === "competitions" && path.length === 2) {
      if (!enabled) throw new PotwError("POTW competitions are not available yet", 503)
      return respond(await publicCompetition(await competition(uuid.parse(path[1]))))
    }
    if (method === "GET" && path[0] === "images" && path.length === 2) {
      if (!enabled) throw new PotwError("Photo is unavailable", 404)
      const version = await photoVersion(uuid.parse(path[1]))
      const { data: c } = await db.from("potw_competitions").select("id,published_at,banner_version_id").eq("id", version.competition_id).single()
      let publicPhoto = !!c?.published_at && c.banner_version_id === version.id && !version.submission_id
      if (!publicPhoto && version.submission_id && c?.published_at) {
        const { data: result } = await db.from("potw_results").select("winner_submission_id").eq("competition_id", c.id).maybeSingle()
        const { data: entry } = await db.from("potw_submissions").select("current_version_id").eq("id", version.submission_id).single()
        publicPhoto = result?.winner_submission_id === version.submission_id && entry?.current_version_id === version.id
      }
      if (!publicPhoto) throw new PotwError("Photo is unavailable", 404)
      const access = await signedImage(version.display_key)
      return new Response(null, { status: 302, headers: { Location: access.url, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex" } })
    }
    if (path[0] === "uploads") return await uploadHandler(request, path)
    if (method === "POST" && path[0] === "image-access") return await imageAccess(request)
    const auth = await studentAuth(request)
    if (auth.error) return auth.error
    const student = auth.student!, actor = auth.user!.id
    await rpc("potw_rate_limit", { p_key: `read:${student.id}`, p_limit: 120, p_seconds: 60 })
    if (method === "GET" && path[0] === "me") return respond({ student: { display_name: student.display_name, student_id: student.student_id } })
    if (method === "GET" && path[0] === "my-submissions") {
      await rpc("potw_advance")
      const { start, end } = page(request, 20)
      const { data, error } = await db.from("potw_submissions").select("id,competition_id,title,caption,state,review,current_version_id,created_at,updated_at,potw_competitions!potw_submissions_competition_id_fkey(*)", { count: "exact" }).eq("student_id", student.id).order("created_at", { ascending: false }).range(start, end)
      checkDatabaseError(error)
      const entries = (data ?? []).map(entry => {
        const c = entry.potw_competitions as unknown as Competition
        return { id: entry.id, competition_id: entry.competition_id, title: entry.title, caption: entry.caption, state: entry.state, review: c.shortlist_confirmed_at ? entry.review : "pending", version_id: entry.current_version_id, created_at: entry.created_at, competition: competitionFields(c) }
      })
      const ids = entries.map(e => e.competition_id)
      const { data: results } = ids.length ? await db.from("potw_results").select("competition_id,winner_submission_id,outcome").in("competition_id", ids) : { data: [] }
      return respond({ entries: entries.map(e => ({ ...e, winner: results?.some(r => r.winner_submission_id === e.id) ?? false })), more: entries.length === 20 })
    }
    if (path[0] === "competitions" && path.length === 3) {
      const id = uuid.parse(path[1]), c = await competition(id)
      if (method === "POST" && path[2] === "vote") {
        const input = z.object({ submission_id: uuid }).strict().parse(await body(request))
        return respond({ vote_id: await rpc("potw_cast_vote", { p_actor: actor, p_comp: id, p_submission: input.submission_id }) }, 201)
      }
      if (method === "GET" && path[2] === "gallery") {
        if (!c.shortlist_confirmed_at || !["voting_open", "voting_closed", "completed", "archived"].includes(c.status)) throw new PotwError("The voting gallery has not been published", 409)
        const { start, end } = page(request)
        const { data, error } = await db.from("potw_submissions").select("id,title,caption,student_id,current_version_id").eq("competition_id", id).eq("state", "ready").eq("review", "shortlisted").order("id").range(start, end)
        checkDatabaseError(error)
        const { data: vote } = await db.from("potw_votes").select("submission_id").eq("competition_id", id).eq("student_id", student.id).maybeSingle()
        const publicData = await publicCompetition(c)
        const photos = await Promise.all((data ?? []).map(async e => {
          let photographer: string | undefined
          if (publicData.result) { const { data: author } = await db.from("potw_students").select("display_name").eq("id", e.student_id).single(); photographer = author?.display_name }
          return { id: e.id, title: e.title, caption: e.caption, version_id: e.current_version_id, self: e.student_id === student.id, ...(photographer ? { photographer } : {}) }
        }))
        return respond({ competition: publicData, photos, voted_for: vote?.submission_id ?? null, more: photos.length === 24 })
      }
    }
    if (path[0] === "submissions" && path.length === 2 && ["PATCH", "DELETE"].includes(method)) {
      const id = uuid.parse(path[1])
      const input = method === "PATCH" ? metadataSchema.parse(await body(request)) : { title: "Withdrawn", caption: "" }
      await rpc("potw_edit_submission", { p_actor: actor, p_id: id, p_title: input.title, p_caption: input.caption, p_withdraw: method === "DELETE" })
      return respond({ success: true })
    }
    throw new PotwError("Endpoint not found", 404)
  } catch (error) { return error instanceof z.ZodError ? respond({ error: error.issues.map(i => i.message).join(". ") }, 400) : failure(error) }
}

async function uploadHandler(request: Request, path: string[]) {
  const initial = await (await import("../api-auth")).requireUser(request)
  if (initial.error) return initial.error
  if (!storageConfigured) throw new PotwError("Private photo storage is not configured yet", 503)
  if (request.method !== "POST") throw new PotwError("Method not allowed", 405)
  if (path.length === 1) {
    // Authenticate before parsing input or doing any storage/database work.
    const baseAuth = await (await import("../api-auth")).requireUser(request)
    if (baseAuth.error) return baseAuth.error
    const input = uploadSchema.parse(await body(request))
    const auth = input.purpose === "banner" ? await adminAuth(request) : await studentAuth(request)
    if (auth.error) return auth.error
    const max = Math.min(Number(process.env.POTW_MAX_UPLOAD_BYTES) || 5242880, 5242880)
    if (input.bytes > max) throw new PotwError(`Photo must be no larger than ${Math.round(max / 1024 / 1024)} MiB`)
    const u = await rpc<Upload>("potw_create_upload", { p_actor: auth.user!.id, p_comp: input.competition_id, p_purpose: input.purpose, p_bytes: input.bytes, p_type: input.content_type, p_title: input.title, p_caption: input.caption, p_budget: Number(process.env.POTW_STORAGE_BUDGET_BYTES) || 8000000000 })
    const expires = Math.floor((Date.parse(u.expires_at) - Date.now()) / 1000)
    if (expires < 1) throw new PotwError("Submission deadline has passed", 409)
    return respond({ upload_id: u.id, upload_url: await signedUpload(u.staging_key, input.bytes, input.content_type, expires), headers: { "Content-Type": input.content_type }, expires_at: u.expires_at }, 201)
  }
  if (path.length !== 3 || path[2] !== "complete") throw new PotwError("Endpoint not found", 404)
  const id = uuid.parse(path[1])
  const baseAuth = await (await import("../api-auth")).requireUser(request)
  if (baseAuth.error) return baseAuth.error
  const { data: session } = await db.from("potw_upload_sessions").select("purpose,actor_id").eq("id", id).single()
  if (!session || session.actor_id !== baseAuth.user!.id) throw new PotwError("Upload not found", 404)
  const auth = session.purpose === "banner" ? await adminAuth(request) : await studentAuth(request)
  if (auth.error) return auth.error
  const u = await rpc<Upload>("potw_claim_upload", { p_actor: auth.user!.id, p_id: id })
  if (u.status === "complete") return respond({ success: true, version_id: u.version_id })
  try {
    const bytes = await readUpload(u.staging_key, u.declared_bytes, u.content_type)
    let photo: Awaited<ReturnType<typeof processPhoto>>
    try { photo = await processPhoto(bytes, u.content_type) } catch { throw new PotwError("The photograph could not be decoded safely. Use a valid, non-animated JPEG, PNG, or WebP under 5 MiB and 48 megapixels.") }
    const keys = versionKeys(u.competition_id, u.lease_id)
    if (bytes.length + photo.display.length + photo.thumbnail.length > u.declared_bytes + 6291456) throw new PotwError("Display image is too large")
    await Promise.all([writePhoto(keys.original_key, bytes, u.content_type, true), writePhoto(keys.display_key, photo.display, "image/webp"), writePhoto(keys.thumbnail_key, photo.thumbnail, "image/webp")])
    const complete = await rpc<Upload>("potw_complete_upload", { p_actor: auth.user!.id, p_id: u.id, p_lease: u.lease_id, p_photo: { ...keys, bytes: bytes.length + photo.display.length + photo.thumbnail.length, width: photo.width, height: photo.height, sha256: photo.sha256, ai_evidence: photo.ai_evidence } })
    return respond({ success: true, version_id: complete.version_id })
  } catch (error) {
    // Persist failed attempts for maintenance; never delete possibly accepted objects here.
    await db.from("potw_upload_sessions").update({ status: "failed" }).eq("id", id).eq("lease_id", u.lease_id).eq("status", "processing")
    throw error
  }
}

async function imageAccess(request: Request) {
  const baseAuth = await (await import("../api-auth")).requireUser(request)
  if (baseAuth.error) return baseAuth.error
  const input = z.object({ ids: z.array(uuid).min(1).max(40), variant: z.enum(["thumbnail", "display", "original"]).default("thumbnail"), admin: z.boolean().default(false) }).strict().parse(await body(request))
  const auth = input.admin ? await adminAuth(request) : await studentAuth(request)
  if (auth.error) return auth.error
  await rpc("potw_rate_limit", { p_key: `images:${auth.user!.id}`, p_limit: 60, p_seconds: 60 })
  const studentId = input.admin ? "" : (await studentAuth(request)).student!.id
  const images: Record<string, unknown> = {}, unavailable: string[] = []
  for (const id of Array.from(new Set(input.ids))) {
    let v
    try { v = await photoVersion(id) } catch (error) {
      if (error instanceof PotwError && error.status === 404) { unavailable.push(id); continue }
      throw error
    }
    if (!input.admin && !await canReadPhoto(v, studentId, input.variant === "original")) throw new PotwError("Photo access denied", 403)
    images[id] = await signedImage(input.variant === "original" ? v.original_key : input.variant === "display" ? v.display_key : v.thumbnail_key, input.variant === "original", input.variant === "original" ? 60 : 300)
  }
  return respond({ images, unavailable })
}

export async function adminHandler(request: Request, path: string[]) {
  try {
    const auth = await adminAuth(request)
    if (auth.error) return auth.error
    if (!databaseConfigured) throw new PotwError("Database unavailable", 503)
    const actor = auth.user!.id
    await rpc("potw_rate_limit", { p_key: `admin:${actor}`, p_limit: 120, p_seconds: 60 })
    if (request.method === "GET") {
      if (path[0] === "roster") {
        const { start, end } = page(request, 40)
        const { data, error } = await db.from("potw_students").select("*,potw_student_emails(email)").order("display_name").range(start, end)
        checkDatabaseError(error); return respond({ students: data, more: data?.length === 40 })
      }
      if (path[0] === "storage") {
        const usage = await rpc<{ bytes: number; reserved: number }>("potw_storage_usage")
        return respond({ configured: storageConfigured, enabled, ...usage, budget: Number(process.env.POTW_STORAGE_BUDGET_BYTES) || 8000000000 })
      }
      await rpc("potw_advance")
      if (!path.length || (path[0] === "competitions" && path.length === 1)) {
        const { data, error } = await db.from("potw_competitions").select("*").order("created_at", { ascending: false }).limit(100)
        checkDatabaseError(error); return respond({ competitions: data })
      }
      if (path[0] === "competitions" && path.length === 2) {
        const id = uuid.parse(path[1]), c = await competition(id, true), { start, end } = page(request, 40)
        let query = db.from("potw_submissions").select("*,potw_students(display_name,student_id),potw_photo_versions!potw_current_photo_fk(ai_evidence)", { count: "exact" }).eq("competition_id", id).order("created_at").range(start, end)
        const filter = new URL(request.url).searchParams.get("review")
        if (filter) query = query.eq("review", z.enum(["pending", "shortlisted", "rejected"]).parse(filter))
        const { data: entries, error, count } = await query; checkDatabaseError(error)
        const { data: result } = await db.from("potw_results").select("*").eq("competition_id", id).maybeSingle()
        const { data: audit } = await db.from("potw_audit_log").select("id,action,details,created_at,actor_id").eq("competition_id", id).order("created_at", { ascending: false }).limit(50)
        return respond({ competition: c, submissions: entries, count, tally: await rpc("potw_tally", { p_comp: id }), result, audit, more: entries?.length === 40 })
      }
      throw new PotwError("Endpoint not found", 404)
    }
    if (request.method !== "POST" && request.method !== "PATCH") throw new PotwError("Method not allowed", 405)
    if (path[0] === "roster") {
      const input = z.object({ csv: z.string().max(1000000) }).strict().parse(await body(request, 1100000))
      return respond({ imported: await rpc("potw_admin_roster", { p_actor: actor, p_rows: parseRosterCsv(input.csv) }) })
    }
    if (path[0] === "students" && path.length === 2) {
      const input = z.object({ active: z.boolean() }).strict().parse(await body(request))
      return respond(await rpc("potw_admin_action", { p_actor: actor, p_comp: null, p_action: input.active ? "approve_student" : "revoke_student", p_data: { student_id: uuid.parse(path[1]) } }))
    }
    if (path[0] !== "competitions") throw new PotwError("Endpoint not found", 404)
    if (path.length === 1 || (path.length === 2 && request.method === "PATCH")) {
      const input = competitionSchema.parse(await body(request))
      return respond(await rpc("potw_admin_action", { p_actor: actor, p_comp: path.length === 2 ? uuid.parse(path[1]) : null, p_action: path.length === 1 ? "create" : "update", p_data: input }))
    }
    if (path.length !== 3) throw new PotwError("Endpoint not found", 404)
    const id = uuid.parse(path[1]), action = path[2]
    let input: unknown
    if (action === "transition") input = z.object({ target: z.enum(["scheduled", "submissions_open", "review", "voting_open", "voting_closed", "archived"]), reason: z.string().trim().max(2000).default("") }).strict().parse(await body(request))
    else if (action === "review") input = z.object({ submission_id: uuid, review: z.enum(["pending", "shortlisted", "rejected"]), reason: z.string().max(2000).default("") }).strict().parse(await body(request))
    else if (action === "confirm_shortlist") input = {}
    else if (action === "finalize") input = z.object({ submission_id: uuid.nullable().default(null), reason: z.string().trim().min(5).max(2000), no_award: z.boolean().default(false) }).strict().parse(await body(request))
    else throw new PotwError("Endpoint not found", 404)
    return respond(await rpc("potw_admin_action", { p_actor: actor, p_comp: id, p_action: action, p_data: input }))
  } catch (error) { return error instanceof z.ZodError ? respond({ error: error.issues.map(i => i.message).join(". ") }, 400) : failure(error) }
}

export async function maintenance() {
  await rpc("potw_advance")
  let cleaned = 0, purged = 0
  const { data: pending } = await db.from("potw_upload_sessions").select("*").is("cleanup_at", null).lt("expires_at", new Date(Date.now() - 120000).toISOString()).limit(30)
  for (const upload of (pending ?? []) as Upload[]) {
    await removeObject(upload.staging_key, true)
    for (const id of upload.processing_versions) {
      const { data: accepted } = await db.from("potw_photo_versions").select("id").eq("id", id).maybeSingle()
      if (!accepted) { const keys = versionKeys(upload.competition_id, id); await Promise.all([removeObject(keys.original_key, true), removeObject(keys.display_key), removeObject(keys.thumbnail_key)]) }
    }
    const { error } = await db.from("potw_upload_sessions").update({ cleanup_at: new Date().toISOString(), ...(upload.status === "complete" ? {} : { status: "expired" }) }).eq("id", upload.id)
    checkDatabaseError(error); cleaned++
  }
  const eligible = await rpc<{ id: string; original_key: string; display_key: string; thumbnail_key: string }[]>("potw_retention_candidates")
  for (const v of eligible) {
    const { error: claim } = await db.from("potw_photo_versions").update({ purge_started_at: new Date().toISOString() }).eq("id", v.id).is("purged_at", null); checkDatabaseError(claim)
    await Promise.all([removeObject(v.original_key, true), removeObject(v.display_key), removeObject(v.thumbnail_key)])
    const { error } = await db.from("potw_photo_versions").update({ purged_at: new Date().toISOString() }).eq("id", v.id); checkDatabaseError(error)
    await db.from("potw_audit_log").insert({ action: "retention_purge", details: { version: v.id } }); purged++
  }
  return { cleaned, purged }
}
