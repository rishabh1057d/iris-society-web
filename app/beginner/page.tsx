import type { Metadata } from "next"
import BeginnerClient from "./beginner-client"

export const metadata: Metadata = {
  title: "Beginner Mode",
  description:
    "Learn photography and videography from first principles with guided courses, practical field guides, and trusted resources from IRIS Society.",
}

export default function BeginnerPage() {
  return <BeginnerClient />
}
