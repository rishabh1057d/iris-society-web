import Image from "next/image"
import Link from "next/link"
import { Instagram, Linkedin, Mail } from "lucide-react"
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
    <section className="relative flex flex-col min-h-[80vh] overflow-hidden">
      {/* background aesthetics */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
      </div>

      <div className="flex-grow flex items-center justify-center px-6">
        <div className="w-full max-w-6xl py-16">
          {/* hero */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-200 to-purple-300">
              Connect with IRIS
            </h1>
            <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
              Collaborations, inquiries, or just hello — our inbox and DMs are open.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
            {/* imagery */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <Image
                src="/images/collage.png"
                alt="A collage of photos taken by IRIS Society members"
                width={1000}
                height={800}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            {/* contact card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.25)] flex flex-col">
              <h2 className="text-2xl font-semibold text-white mb-2">Say hello</h2>
              <p className="text-gray-300 mb-6">We usually respond within a day.</p>

              <div className="grid gap-4">
                <a
                  href="mailto:photography.society@study.iitm.ac.in"
                  className="group w-full max-w-full overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 md:px-4 py-3 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-blue-500/20 text-blue-200 shrink-0">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-white font-medium text-sm sm:text-base">Email</div>
                      <div className="text-gray-300 text-sm break-words break-all">photography.society@study.iitm.ac.in</div>
                    </div>
                  </div>
                  <span className="hidden md:inline text-gray-400 text-sm group-hover:text-gray-300 shrink-0">Write to us →</span>
                </a>

                <Link
                  href="https://www.linkedin.com/company/iris-camera-society/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full max-w-full overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 md:px-4 py-3 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-blue-500/20 text-blue-200 shrink-0">
                      <Linkedin className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-white font-medium text-sm sm:text-base">LinkedIn</div>
                      <div className="text-gray-300 text-sm break-words">IRIS Camera Society</div>
                    </div>
                  </div>
                  <span className="hidden md:inline text-gray-400 text-sm group-hover:text-gray-300 shrink-0">Follow →</span>
                </Link>

                <Link
                  href="https://www.instagram.com/iris_iitm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full max-w-full overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 md:px-4 py-3 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-blue-500/20 text-blue-200 shrink-0">
                      <Instagram className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-white font-medium text-sm sm:text-base">Instagram</div>
                      <div className="text-gray-300 text-sm break-words">@iris_iitm</div>
                    </div>
                  </div>
                  <span className="hidden md:inline text-gray-400 text-sm group-hover:text-gray-300 shrink-0">Connect →</span>
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center">
                  <div className="text-white text-lg font-semibold">Collaborate</div>
                  <div className="text-gray-300 text-sm mt-1">Work with us</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center">
                  <div className="text-white text-lg font-semibold">Volunteer</div>
                  <div className="text-gray-300 text-sm mt-1">Join IRIS events</div>
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
