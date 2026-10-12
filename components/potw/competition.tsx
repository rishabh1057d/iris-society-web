import Link from "next/link"
import type { PublicCompetition } from "@/lib/potw/types"
import { deadlineLabel } from "@/lib/potw/types"

export function CompetitionPanel({ competition: c }: { competition: PublicCompetition | null }) {
  if (!c) return <section className="event-glass mb-8 rounded-2xl p-6"><h2 className="text-xl font-semibold">The next theme is on its way</h2><p className="mt-2 text-white/80">Previous winners are below. Student submissions open when the society publishes a competition.</p></section>
  return <section className="event-glass mb-8 overflow-hidden rounded-2xl">
    {c.is_test && <p role="status" className="border-b border-amber-200/20 bg-amber-950/40 p-4 text-amber-100">Internal testing competition. These entries, votes, and results will not appear in the official competition.</p>}
    {c.banner && <img src={c.banner} alt="" className="max-h-72 w-full object-cover" width={1200} height={400} />}
    <div className="space-y-5 p-5 sm:p-8"><p className="text-sm uppercase tracking-widest text-white/80">{c.status.replaceAll("_", " ")}{c.voting_skipped && !c.result ? " · single finalist" : ""}</p>
      <h2 className="text-3xl font-semibold">{c.theme}</h2><p className="max-w-3xl whitespace-pre-wrap text-white/85">{c.description}</p>
      <dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-white/70">Submissions</dt><dd>{deadlineLabel(c.submissions_open_at)} to {deadlineLabel(c.submissions_close_at)}</dd></div><div><dt className="text-white/70">Voting</dt><dd>{deadlineLabel(c.voting_open_at)} to {deadlineLabel(c.voting_close_at)}</dd></div></dl>
      <details><summary className="cursor-pointer py-3 font-medium">Submission rules</summary><p className="whitespace-pre-wrap text-white/85">{c.rules}</p><p className="mt-3 text-sm text-white/75">One photograph and one immutable vote per verified member. No self-voting. Non-winning image files are retained for one year after completion.</p></details>
      {c.status === "submissions_open" && <Link className="btn-primary" href={`/potw/submit/${c.id}`}>Submit a photograph</Link>}
      {c.status === "voting_open" && <Link className="btn-primary" href={`/potw/competitions/${c.id}/vote`}>View the shortlist and vote</Link>}
      {c.status === "review" && <p className="text-white/80">{c.voting_skipped ? "One finalist is confirmed. Voting is skipped; the winner will be announced at the scheduled voting-close time." : "Submissions are closed. The society is reviewing the photographs."}</p>}
      {c.status === "voting_closed" && !c.result && <p>Voting has ended. An admin decision is pending.</p>}
      {c.result && <div className="border-t border-white/15 pt-5"><h3 className="text-xl font-semibold">{c.winner ? "This week’s winner" : "No award this week"}</h3>{c.winner && <div className="mt-4 grid gap-6 md:grid-cols-2"><img src={c.winner.image} alt={c.winner.title} width={800} height={800} className="max-h-[32rem] w-full rounded-xl object-contain" loading="lazy" /><div><h4 className="text-2xl">{c.winner.title}</h4><p className="mt-2">Photograph by {c.winner.photographer}</p><p className="mt-4 whitespace-pre-wrap text-white/85">{c.winner.caption}</p></div></div>}{c.result.reason && <p className="mt-3 text-sm text-white/75">{c.result.reason}</p>}</div>}
    </div>
  </section>
}
