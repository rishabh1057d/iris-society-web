import { Metadata } from "next"
import AboutClientPage from "./about-client-page"

export const metadata: Metadata = {
  title: "About IRIS Society | Photography & Videography at IITM BS",
  description:
    "Discover IRIS Society — the official Photography & Videography Society of the IIT Madras BS program. Explore our story, activities, workshops, and creative community.",
  openGraph: {
    title: "About IRIS Society | IITM BS",
    description:
      "Discover IRIS Society — the official Photography & Videography Society of the IIT Madras BS program.",
    images: [
      {
        url: "/images/logo-tilted.png",
        width: 500,
        height: 400,
        alt: "IRIS Society tilted logo",
      },
    ],
  },
  twitter: {
    title: "About IRIS Society",
    description:
      "Discover IRIS Society — the official Photography & Videography Society of the IIT Madras BS program.",
    images: ["/images/logo-tilted.png"],
  },
}

export default function About() {
  return <AboutClientPage />
}
