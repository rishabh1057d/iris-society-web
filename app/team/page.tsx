import { Metadata } from "next"
import TeamClientPage from "./team-client-page"

export const metadata: Metadata = {
  title: "Our Team | IRIS Society - IIT Madras BS (IITMBS)",
  description: "Meet the talented team behind IRIS, the Photography and Videography Society of IIT Madras BS. See our leadership, core members, and web developers.",
  openGraph: {
    title: "Our Team | IRIS Society",
    description: "Meet the talented team behind IRIS, the Photography and Videography Society of IIT Madras BS."
  }
};

export default function Team() {
  return <TeamClientPage />
}
