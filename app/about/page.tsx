import { Metadata } from "next"
import AboutClientPage from "./about-client-page"

export const metadata: Metadata = {
  title: "About Us | IRIS Society",
  description:
    "Learn about IRIS Society, the official Photography and Videography Society of IIT Madras BS Degree program. Discover our mission, activities, and what makes our community of visual storytellers unique.",
  openGraph: {
    title: "About Us | IRIS Society",
    description: "Learn about IRIS Society, the official Photography and Videography Society of IIT Madras BS Degree program.",
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
    title: "About Us | IRIS Society",
    description: "Learn about IRIS Society, the official Photography and Videography Society of IIT Madras BS Degree program.",
    images: ["/images/logo-tilted.png"],
  },
}

export default function About() {
  return <AboutClientPage />
}
