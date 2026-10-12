import "server-only"
import { NextResponse } from "next/server"
import { requireAdmin, requireUser } from "../api-auth"
import { databaseConfigured, supabaseServer as db } from "../supabase-server"
import { isUnusablePotw, selectFeaturedPotw, type PotwTree } from "../potw"
import archive from "../../public/potw.json"
import type { Competition, PhotoVersion, PublicCompetition, Result, Student, Submission } from "./types"

export const enabled = databaseConfigured && process.env.POTW_ENABLED === "1"
export class PotwError extends Error { constructor(message: string, public status = 400) { super(message) } }
export async function rpc<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await db.rpc(name, args)
  if (error) {
    const status = /^PT\d{3}$/.test(error.code) ? Number(error.code.slice(2)) : error.code === "23505" ? 409 : 500
    if (status === 500) console.error("POTW database operation failed", name, error.code)
    throw new PotwError(status === 500 ? "POTW is temporarily unavailable" : error.message, status)
  }
  return data as T
}
export function respond(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store", "Vary": "Authorization", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" } })
}
export function failure(error: unknown) {
  if (error instanceof PotwError) return respond({ error: error.message }, error.status)
  console.error("POTW request failed", error instanceof Error ? error.name : "Unknown error")
  return respond({ error: "Unable to complete this request. Please try again." }, 500)
}
export async function studentAuth(request: Request) {
  const auth = await requireUser(request)
  if (auth.error) return { error: auth.error, user: null, student: null }
  if (!enabled) return { error: respond({ error: "Student POTW features are not enabled yet" }, 503), user: null, student: null }
  const user = auth.user!
  if (!user.identities?.some(i => i.provider === "google") || !/@(ds|es)\.study\.iitm\.ac\.in$/i.test(user.email!)) {
    return { error: respond({ error: "Sign in with your approved IITM BS Google account" }, 403), user: null, student: null }
  }
  const id = await rpc<string>("potw_identity", { p_actor: user.id })
  const { data, error } = await db.from("potw_students").select("id,student_id,display_name,active").eq("id", id).single()
  if (error || !data?.active) throw new PotwError("Approved IRIS membership required", 403)
  return { user, student: data as Student, error: null }
}
export async function adminAuth(request: Request) { return requireAdmin(request) }
export async function competition(id: string, includeDraft = false): Promise<Competition> {
  await rpc("potw_advance", { p_comp: id })
  let query = db.from("potw_competitions").select("*").eq("id", id)
  if (!includeDraft) query = query.not("published_at", "is", null)
  const { data, error } = await query.single()
  if (error || !data) throw new PotwError("Competition not found", 404)
  return data as Competition
}
export function competitionFields(c: Competition): Competition {
  // TypeScript types do not remove private fields returned by a database select.
  return { id: c.id, theme: c.theme, description: c.description, rules: c.rules, status: c.status, featured: c.featured,
    submissions_open_at: c.submissions_open_at, submissions_close_at: c.submissions_close_at, voting_open_at: c.voting_open_at, voting_close_at: c.voting_close_at,
    published_at: c.published_at, shortlist_confirmed_at: c.shortlist_confirmed_at, locked_at: c.locked_at, banner_version_id: c.banner_version_id,
    voting_skipped: c.voting_skipped, created_at: c.created_at, updated_at: c.updated_at }
}
async function publicCompetitions(rows: Competition[]): Promise<PublicCompetition[]> {
  if (!rows.length) return []
  const { data, error } = await db.from("potw_results").select("competition_id,winner_submission_id,outcome,reason,tally,finalized_at").in("competition_id", rows.map(c => c.id))
  if (error) throw new PotwError("Results are temporarily unavailable", 503)
  const results = new Map((data as Result[]).map(r => [r.competition_id, r]))
  const winnerIds = (data as Result[]).flatMap(r => r.winner_submission_id ? [r.winner_submission_id] : [])
  const { data: entries, error: entryError } = winnerIds.length ? await db.from("potw_submissions").select("id,title,caption,current_version_id,potw_students(display_name)").in("id", winnerIds) : { data: [], error: null }
  if (entryError) throw new PotwError("Winners are temporarily unavailable", 503)
  const winners = new Map((entries ?? []).map(e => [e.id, { title: e.title, caption: e.caption, photographer: (e.potw_students as unknown as { display_name: string })?.display_name ?? "IRIS member", image: `/api/potw/images/${e.current_version_id}` }]))
  return rows.map(c => {
    const result = results.get(c.id) ?? null
    return { ...competitionFields(c), result, winner: result?.winner_submission_id ? winners.get(result.winner_submission_id) ?? null : null, banner: c.banner_version_id ? `/api/potw/images/${c.banner_version_id}` : null }
  })
}
export async function publicCompetition(c: Competition): Promise<PublicCompetition> {
  return (await publicCompetitions([c]))[0]
}
export async function publicLanding() {
  const fallback = { enabled: false, competition: null, competitions: [], archive: archive as PotwTree, featured: selectFeaturedPotw(archive) }
  if (!enabled) return fallback
  try {
    await rpc("potw_advance")
    const { data, error } = await db.from("potw_competitions").select("*").not("published_at", "is", null).order("voting_close_at", { ascending: false }).limit(100)
    if (error) throw new PotwError("Unavailable", 503)
    const competitions = await publicCompetitions(data as Competition[])
    const { data: legacy } = await db.from("potw_legacy_archive").select("entry")
    const tree: PotwTree = structuredClone(archive)
    if (legacy?.length) for (const { entry } of legacy) {
      const year = String(entry.year), month = entry.month
      const entries = tree[year]?.[month]
      if (entries) { const index = entries.findIndex(e => e.id === entry.id); if (index >= 0) entries[index] = entry }
    }
    const latest = competitions.find(c => c.winner)
    const date = latest ? new Date(latest.voting_close_at) : null
    const featured = latest?.winner && date ? { ...latest.winner, theme: latest.theme, description: latest.winner.caption, year: date.toLocaleString("en-US", { timeZone: "Asia/Kolkata", year: "numeric" }), month: date.toLocaleString("en-US", { timeZone: "Asia/Kolkata", month: "long" }), week: Math.ceil(Number(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata", day: "numeric" })) / 7) } : selectFeaturedPotw(tree)
    return { enabled: true, competition: competitions.find(c => c.featured) ?? null, competitions, archive: tree, featured: isUnusablePotw(featured) ? null : featured }
  } catch { return fallback }
}
export async function photoVersion(id: string): Promise<PhotoVersion> {
  const { data, error } = await db.from("potw_photo_versions").select("*").eq("id", id).is("purged_at", null).is("purge_started_at", null).single()
  if (error || !data) throw new PotwError("Photo is unavailable", 404)
  return data as PhotoVersion
}
export async function canReadPhoto(version: PhotoVersion, studentId: string, original = false) {
  if (!version.submission_id) return false
  const { data } = await db.from("potw_submissions").select("*").eq("id", version.submission_id).single()
  const entry = data as Submission | null
  if (!entry) return false
  if (entry.student_id === studentId) return true
  if (original || entry.current_version_id !== version.id || entry.state !== "ready" || entry.review !== "shortlisted") return false
  const c = await competition(entry.competition_id)
  return !!c.shortlist_confirmed_at && ["voting_open", "voting_closed", "completed", "archived"].includes(c.status)
}
