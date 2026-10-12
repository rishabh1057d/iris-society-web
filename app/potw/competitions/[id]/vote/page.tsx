import MemberScreen from "@/components/potw/member"
export const metadata = { title: "Vote | IRIS POTW", robots: { index: false, follow: false } }
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <MemberScreen mode="vote" competitionId={(await params).id} /> }
