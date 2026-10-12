import { notFound } from "next/navigation"
import Link from "next/link"
import { CompetitionPanel } from "@/components/potw/competition"
import { competition, publicCompetition, enabled, PotwError } from "@/lib/potw/server"
import { uuid } from "@/lib/potw/validation"
export const dynamic = "force-dynamic"
export const metadata = { title: "Competition | IRIS POTW" }
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = uuid.safeParse((await params).id)
  if (!id.success || !enabled) notFound()
  try {
    const c = await publicCompetition(await competition(id.data))
    return <div className="page-shell max-w-6xl"><Link href="/potw" className="btn-secondary mb-6">Back to POTW</Link><h1 className="page-hero-title mb-6">{c.theme}</h1><CompetitionPanel competition={c} /></div>
  } catch (e) {
    if (e instanceof PotwError && e.status === 404) notFound()
    if (e instanceof PotwError) return <div className="page-shell max-w-6xl space-y-5"><h1 className="page-hero-title">Photo of the Week</h1><p role="alert">This competition is temporarily unavailable. Please try again shortly.</p><Link href="/potw" className="btn-secondary">Back to POTW</Link></div>
    throw e
  }
}
