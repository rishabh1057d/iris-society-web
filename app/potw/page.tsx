import type { Metadata } from "next"
import Archive from "@/components/potw/archive"
import { publicLanding } from "@/lib/potw/server"
export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Photo of the Week | IRIS", description: "Weekly photography themes, student submissions, voting, and the IRIS winner archive.", alternates: { canonical: "https://iris-society.iitmbs.org/potw" } }
export default async function PotwPage() {
  const data = await publicLanding()
  return <Archive archive={data.archive} competition={data.competition} competitions={data.competitions} />
}
