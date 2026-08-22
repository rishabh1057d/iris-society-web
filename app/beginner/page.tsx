import type { Metadata } from "next"
import BeginnerClient from "./beginner-client"

export const metadata: Metadata = {
  title: "Beginner Mode",
  description:
    "IRIS Beginner Mode is still in progress. Guides and tutorials for learning photography and videography are coming soon.",
}

export default function BeginnerPage() {
  return <BeginnerClient />
}
