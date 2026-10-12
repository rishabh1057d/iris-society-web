export const PHASES = ["draft", "scheduled", "submissions_open", "review", "voting_open", "voting_closed", "completed", "archived"] as const
export type Phase = typeof PHASES[number]
export type Competition = {
  id: string; theme: string; description: string; rules: string; status: Phase; featured: boolean
  submissions_open_at: string; submissions_close_at: string; voting_open_at: string; voting_close_at: string
  published_at: string | null; shortlist_confirmed_at: string | null; locked_at: string | null
  banner_version_id: string | null; voting_skipped: boolean; created_at: string; updated_at: string
}
export type Student = { id: string; student_id: string; display_name: string; active: boolean }
export type PhotoVersion = {
  id: string; competition_id: string; submission_id: string | null; original_key: string; display_key: string; thumbnail_key: string
  bytes: number; width: number; height: number; sha256: string; ai_evidence: string[]
  created_at: string; purged_at: string | null
}
export type Submission = {
  id: string; competition_id: string; student_id: string; title: string; caption: string
  state: "ready" | "withdrawn"; review: "pending" | "shortlisted" | "rejected"
  current_version_id: string | null; created_at: string; updated_at: string
}
export type Result = {
  competition_id: string; winner_submission_id: string | null
  outcome: "winner" | "tie_break" | "no_votes" | "no_award" | "sole_finalist"
  reason: string | null; tally: Record<string, number>; finalized_at: string
}
export type PublicCompetition = Competition & { result: Result | null; banner: string | null; winner: { title: string; caption: string; photographer: string; image: string } | null }
export type GalleryPhoto = { id: string; title: string; caption: string; version_id: string; self: boolean; photographer?: string }
export type ImageAccess = { url: string; expires_at: string }
export const UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export function deadlineLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) + " IST"
}
