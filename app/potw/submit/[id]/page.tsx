import MemberScreen from "@/components/potw/member"
export const metadata = { title: "Submit a photograph | IRIS POTW", robots: { index: false, follow: false } }
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <MemberScreen mode="submit" competitionId={(await params).id} /> }
