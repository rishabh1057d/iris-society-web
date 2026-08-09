import { Metadata } from "next"
import ContactClientPage from "./contact-client-page"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the IRIS Society at IIT Madras BS. Contact us via email or follow us on social media for inquiries, collaborations, and event information.",
  openGraph: {
    title: "Contact Us | IRIS Society",
    description: "Get in touch with the IRIS Society at IIT Madras BS.",
    images: [
      {
        url: "/images/collage.png",
        width: 500,
        height: 400,
        alt: "A collage of photos taken by IRIS Society members",
      },
    ],
  },
  twitter: {
    title: "Contact Us | IRIS Society",
    description: "Get in touch with the IRIS Society at IIT Madras BS.",
    images: ["/images/collage.png"],
  },
}

export default function Contact() {
  return <ContactClientPage />
}
