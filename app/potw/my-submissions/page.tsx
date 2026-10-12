import MemberScreen from "@/components/potw/member"
export const metadata = { title: "My submissions | IRIS POTW", robots: { index: false, follow: false } }
export default function Page() { return <MemberScreen mode="history" /> }
