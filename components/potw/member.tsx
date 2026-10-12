"use client"
import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CompetitionPanel } from "./competition"
import { potwFetch, SessionGate, usePotwSession } from "./session"
import { usePrivateImages } from "./private-image"
import type { Competition, GalleryPhoto, PublicCompetition } from "@/lib/potw/types"
import { MAX_UPLOAD_BYTES, UPLOAD_TYPES, deadlineLabel } from "@/lib/potw/types"

type HistoryEntry = { id: string; competition_id: string; title: string; caption: string; state: string; review: string; version_id: string | null; created_at: string; competition: Competition; winner: boolean }
type Gallery = { competition: PublicCompetition; photos: GalleryPhoto[]; voted_for: string | null; more: boolean }
export function PhotoUploadForm({ competitionId, banner = false, onComplete }: { competitionId: string; banner?: boolean; onComplete?: () => void }) {
  const [file, setFile] = useState<File | null>(null), [preview, setPreview] = useState(""), [busy, setBusy] = useState(false), [progress, setProgress] = useState(0), [error, setError] = useState(""), [success, setSuccess] = useState(false)
  const errorRef = useRef<HTMLParagraphElement>(null), xhrRef = useRef<XMLHttpRequest | null>(null)
  useEffect(() => { if (!file) { setPreview(""); return }; const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url) }, [file])
  useEffect(() => () => xhrRef.current?.abort(), [])
  useEffect(() => { if (error) errorRef.current?.focus() }, [error])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSuccess(false)
    if (!file) { setError("Choose a photograph first."); return }
    const form = new FormData(event.currentTarget)
    setBusy(true); setProgress(0)
    try {
      const session = await potwFetch<{ upload_id: string; upload_url: string; headers: Record<string,string> }>("/api/potw/uploads", { method: "POST", body: JSON.stringify({ competition_id: competitionId, purpose: banner ? "banner" : "submission", bytes: file.size, content_type: file.type, title: form.get("title"), caption: form.get("caption") ?? "" }) })
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest(); xhrRef.current = xhr
        xhr.open("PUT", session.upload_url)
        for (const [key, value] of Object.entries(session.headers)) xhr.setRequestHeader(key, value)
        xhr.timeout = 120000
        xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round(e.loaded / e.total * 100)) }
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed. Check the deadline and choose the photo again."))
        xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."))
        xhr.ontimeout = () => reject(new Error("Upload timed out. Please try again."))
        xhr.onabort = () => reject(new Error("Upload cancelled."))
        xhr.send(file)
      })
      await potwFetch(`/api/potw/uploads/${session.upload_id}/complete`, { method: "POST" })
      setSuccess(true); onComplete?.()
    } catch (e) { setError(e instanceof Error ? e.message : "Submission failed") }
    finally { setBusy(false); xhrRef.current = null }
  }
  return <form className="event-glass space-y-5 rounded-2xl p-5 sm:p-8" onSubmit={submit}>
    <h2 className="text-2xl font-semibold">{banner ? "Competition banner" : "Your photograph"}</h2>
    <p className="text-white/80">JPEG, PNG, or WebP. Maximum 5 MiB and 48 megapixels. A successful replacement takes the place of your previous entry. Non-winning files are retained for one year after completion.</p>
    {error && <p role="alert" ref={errorRef} tabIndex={-1} className="rounded-lg bg-red-950/50 p-3 text-red-200">{error}</p>}
    <label className="block">Photograph<Input className="mt-2 min-h-11" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} required onChange={e => {
      const chosen = e.target.files?.[0]; setSuccess(false); setError("")
      if (chosen && (chosen.size > MAX_UPLOAD_BYTES || !UPLOAD_TYPES.includes(chosen.type as typeof UPLOAD_TYPES[number]))) { setError("Use JPEG, PNG, or WebP, no larger than 5 MiB."); e.target.value = ""; setFile(null) }
      else setFile(chosen ?? null)
    }} /></label>
    {preview && <img src={preview} alt="Preview of your selected photograph" width={800} height={600} className="max-h-96 w-full rounded-xl object-contain" />}
    <label className="block">Title<Input name="title" className="mt-2 min-h-11" required maxLength={120} disabled={busy} defaultValue={banner ? "Theme banner" : ""} /></label>
    <label className="block">Caption (optional)<textarea name="caption" className="mt-2 min-h-24 w-full rounded-lg border border-white/20 bg-transparent p-3 focus-visible:outline focus-visible:outline-2" maxLength={2000} disabled={busy} /></label>
    {!banner && <p className="text-sm text-white/75">Please keep names and identifying details out of the title and caption for anonymous voting. Your full-resolution original remains private.</p>}
    {busy && <div role="status"><label htmlFor="upload-progress">{progress < 100 ? `Uploading ${progress}%` : "Checking and processing your photograph"}</label><progress className="mt-2 w-full" id="upload-progress" max={100} value={progress} /></div>}
    {success && <p role="status" className="text-green-200">{banner ? "Banner saved." : "Photograph submitted. You can find it in My submissions."}</p>}
    <Button type="submit" disabled={busy}>{busy ? "Please wait" : banner ? "Upload banner" : "Submit photograph"}</Button>
  </form>
}

export default function MemberScreen({ mode, competitionId }: { mode: "history" | "submit" | "vote"; competitionId?: string }) {
  const auth = usePotwSession(), [error, setError] = useState(""), [loading, setLoading] = useState(false), [entries, setEntries] = useState<HistoryEntry[]>([]), [gallery, setGallery] = useState<Gallery | null>(null), [c, setC] = useState<PublicCompetition | null>(null), [page, setPage] = useState(0), [more, setMore] = useState(false), [revision, setRevision] = useState(0), [choice, setChoice] = useState<GalleryPhoto | null>(null), [busy, setBusy] = useState(false)
  const ids = mode === "history" ? entries.map(e => e.version_id).filter((id): id is string => !!id) : (gallery?.photos ?? []).map(p => p.version_id)
  const { images, unavailable, error: imageError } = usePrivateImages(ids, false, "thumbnail", auth.ready)
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null)
  const { images: previews, error: previewError } = usePrivateImages(previewPhoto ? [previewPhoto.version_id] : [], false, "display", auth.ready)
  useEffect(() => {
    let alive = true
    if (!auth.ready) { setEntries([]); setGallery(null); return }
    setLoading(true); setError("")
    const request = mode === "history" ? potwFetch<{ entries: HistoryEntry[]; more: boolean }>(`/api/potw/my-submissions?page=${page}`) : mode === "vote" ? potwFetch<Gallery>(`/api/potw/competitions/${competitionId}/gallery?page=${page}`) : potwFetch<PublicCompetition>(`/api/potw/competitions/${competitionId}`)
    void request.then(data => {
      if (!alive) return
      if ("entries" in data) { setEntries(data.entries); setMore(data.more) }
      else if ("photos" in data) { setGallery(data); setMore(data.more) }
      else setC(data)
    }).catch(e => { if (alive) setError(e.message) }).finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [auth.ready, mode, competitionId, page, revision])
  async function mutate(url: string, method: string, data?: unknown) {
    setBusy(true); setError("")
    try { await potwFetch(url, { method, ...(data ? { body: JSON.stringify(data) } : {}) }); setRevision(v => v + 1); setChoice(null) }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to save") } finally { setBusy(false) }
  }
  return <div className="page-shell max-w-6xl space-y-6 pb-20"><Link className="btn-secondary" href="/potw">Back to POTW</Link><header className="page-hero"><h1 className="page-hero-title">{mode === "history" ? "My submissions" : mode === "vote" ? "The shortlist" : "Submit a photograph"}</h1><p className="page-hero-sub">{auth.student ? `Signed in as ${auth.student.display_name}` : "Photo of the Week · IRIS"}</p></header>
    {!auth.ready ? <SessionGate error={auth.error} signIn={auth.signIn} /> : <>
      <div className="flex flex-wrap gap-3"><Link className="btn-secondary" href="/potw/my-submissions">My submissions</Link><Button variant="outline" onClick={() => void auth.signOut()}>Sign out</Button></div>
      {(error || imageError) && <p role="alert" className="text-red-200">{error || imageError} <Button variant="outline" onClick={() => setRevision(v => v + 1)}>Retry</Button></p>}
      {loading && <p role="status">Loading your competition data…</p>}
      {mode === "submit" && c && <><CompetitionPanel competition={c} />{c.status === "submissions_open" ? <PhotoUploadForm competitionId={c.id} /> : <p>Submissions are closed for this theme.</p>}</>}
      {mode === "history" && !loading && entries.length === 0 && <p className="event-glass rounded-xl p-6">No photographs submitted yet. Visit POTW to find an open theme.</p>}
      {mode === "history" && <div className="grid gap-6 md:grid-cols-2">{entries.map(e => {
        const editable = e.competition.status === "submissions_open" && !e.competition.locked_at
        return <article className="event-glass space-y-4 rounded-2xl p-5" key={e.id}>{e.version_id && images[e.version_id] ? <img src={images[e.version_id].url} referrerPolicy="no-referrer" alt={e.title} width={640} height={480} loading="lazy" className="h-64 w-full rounded-lg object-contain" /> : <div className="flex h-64 items-center justify-center text-center text-white/70">{e.version_id && unavailable.includes(e.version_id) ? "Photograph no longer available. Your submission details are preserved." : "Photograph unavailable or loading"}</div>}<h2 className="text-xl font-semibold">{e.title}</h2><p>{e.competition.theme}</p><p className="text-sm text-white/75">Submitted {deadlineLabel(e.created_at)} · {e.state} · {e.review}{e.winner ? " · Winner" : ""}</p><p className="whitespace-pre-wrap text-white/85">{e.caption}</p>
          {editable ? <><Link className="btn-secondary" href={`/potw/submit/${e.competition_id}`}>Replace photograph</Link><details><summary className="cursor-pointer py-3">Edit title and caption</summary><form className="space-y-3" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); void mutate(`/api/potw/submissions/${e.id}`, "PATCH", { title: form.get("title"), caption: form.get("caption") }) }}><label className="block">Title<Input name="title" required maxLength={120} defaultValue={e.title} /></label><label className="block">Caption<textarea className="w-full rounded-lg border border-white/20 bg-transparent p-3" name="caption" maxLength={2000} defaultValue={e.caption} /></label><Button disabled={busy}>Save metadata</Button></form></details>{e.state !== "withdrawn" && <Button variant="outline" disabled={busy} onClick={() => { if (window.confirm("Withdraw this photograph? Your submission history will remain.")) void mutate(`/api/potw/submissions/${e.id}`, "DELETE") }}>Withdraw</Button>}</> : <p className="text-sm text-white/75">This entry is locked.</p>}</article>
      })}</div>}
      {mode === "vote" && gallery && <>
        <CompetitionPanel competition={gallery.competition} />
        <p className="text-white/80">One vote per member. Your vote cannot be changed. Photographer names and totals stay hidden until results are published.</p>
        {gallery.voted_for && <p role="status" className="text-green-200">Your vote has been recorded.</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{gallery.photos.map(photo => <article key={photo.id} className="event-glass space-y-3 rounded-xl p-4">
          {images[photo.version_id] ? <img src={images[photo.version_id].url} alt={photo.title} referrerPolicy="no-referrer" width={640} height={640} loading="lazy" className="h-72 w-full object-contain" /> : <div className="flex h-72 items-center justify-center text-white/70">{unavailable.includes(photo.version_id) ? "Photograph unavailable" : "Loading photograph"}</div>}
          <Button variant="outline" className="min-h-11 w-full" onClick={() => setPreviewPhoto(photo)}>View larger photograph</Button>
          <h2 className="text-lg font-semibold">{photo.title}</h2><p className="whitespace-pre-wrap text-white/80">{photo.caption}</p>
          {photo.photographer && <p>By {photo.photographer}</p>}
          {gallery.competition.result && <p>{gallery.competition.result.tally[photo.id] ?? 0} votes</p>}
          <Button className="min-h-11 w-full" disabled={photo.self || !!gallery.voted_for || gallery.competition.status !== "voting_open" || busy} onClick={() => setChoice(photo)}>{photo.self ? "Your photograph, no self-voting" : gallery.voted_for === photo.id ? "Your vote" : "Vote for this photograph"}</Button>
        </article>)}</div>
        <Dialog open={!!previewPhoto && auth.ready} onOpenChange={open => { if (!open) setPreviewPhoto(null) }}><DialogContent className="max-h-[90dvh] max-w-5xl overflow-y-auto"><DialogTitle>{previewPhoto?.title}</DialogTitle><DialogDescription>{previewPhoto?.caption || "Anonymous shortlisted photograph"}</DialogDescription>{previewPhoto && previews[previewPhoto.version_id] ? <img src={previews[previewPhoto.version_id].url} alt={previewPhoto.title} referrerPolicy="no-referrer" width={2048} height={1536} className="max-h-[70dvh] w-full object-contain" /> : <p role={previewError ? "alert" : "status"}>{previewError || "Loading photograph"}</p>}</DialogContent></Dialog>
        <Dialog open={!!choice && auth.ready} onOpenChange={open => { if (!open) setChoice(null) }}><DialogContent><DialogTitle>Vote for {choice?.title}?</DialogTitle><DialogDescription>This is your only vote for this competition. It cannot be changed.</DialogDescription><Button disabled={busy} onClick={() => { if (choice) void mutate(`/api/potw/competitions/${competitionId}/vote`, "POST", { submission_id: choice.id }) }}>Confirm vote</Button></DialogContent></Dialog>
      </>}
      {mode !== "submit" && <nav aria-label="Gallery pages" className="flex gap-3"><Button variant="outline" disabled={page === 0 || loading} onClick={() => setPage(v => v - 1)}>Previous</Button><span className="self-center">Page {page + 1}</span><Button variant="outline" disabled={!more || loading} onClick={() => setPage(v => v + 1)}>Next</Button></nav>}
    </>}
  </div>
}
