import Image from "next/image"
import Link from "next/link"
import { Instagram, Linkedin } from "lucide-react"
import { Metadata } from "next"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Contact Us | IRIS Society - IIT Madras BS (IITMBS)",
  description: "Get in touch with the IRIS Society at IIT Madras BS. Contact us via email or follow us on social media for inquiries, collaborations, and event information.",
  openGraph: {
    title: "Contact Us | IRIS Society",
    description: "Get in touch with the IRIS Society at IIT Madras BS.",
    images: [{
      url: "/images/collage.png",
      width: 500,
      height: 400,
      alt: "A collage of photos taken by IRIS Society members"
    }]
  },
  twitter: {
    title: "Contact Us | IRIS Society",
    description: "Get in touch with the IRIS Society at IIT Madras BS.",
    images: ["/images/collage.png"]
  }
};

export default function Contact() {
  return (
    <section className="flex flex-col h-full">
      <div className="flex-grow flex items-center justify-center px-6">
        <div className="w-full max-w-6xl py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="/images/collage.png"
                alt="A collage of photos taken by IRIS Society members"
                width={500}
                height={400}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-6 text-blue-300">Connect with Us</h1>
              <p className="text-gray-300 mb-8">
                Reach out to us through any of the following means, and we'll get back to you as soon as possible.
              </p>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                    Email:
                  </h2>
                  <p className="text-gray-300 ml-5">
                    <a href="mailto:photography.society@study.iitm.ac.in" className="underline hover:text-blue-400 transition-colors">
                      photography.society@study.iitm.ac.in
                    </a>
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                    Social Media:
                  </h2>
                  <div className="flex space-x-4 ml-5">
                    <Link href="https://www.linkedin.com/company/iris-camera-society/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                      <Linkedin className="w-6 h-6" />
                    </Link>
                    <Link href="https://www.instagram.com/iris_iitm" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                      <Instagram className="w-6 h-6" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  )
}
