import Image from "next/image"
import Link from "next/link"
import { Instagram, Linkedin, Mail } from "lucide-react"
import { Metadata } from "next"
import Footer from "@/components/footer"

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

const channels = [
  {
    href: "mailto:photography.society@study.iitm.ac.in",
    external: false,
    icon: Mail,
    title: "Email",
    detail: "photography.society@study.iitm.ac.in",
    cta: "Write to us",
  },
  {
    href: "https://www.linkedin.com/company/iris-camera-society/",
    external: true,
    icon: Linkedin,
    title: "LinkedIn",
    detail: "IRIS Camera Society",
    cta: "Follow",
  },
  {
    href: "https://www.instagram.com/iris_iitm",
    external: true,
    icon: Instagram,
    title: "Instagram",
    detail: "@iris_iitm",
    cta: "Connect",
  },
]

export default function Contact() {
  return (
    <section className="relative flex flex-1 flex-col min-h-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl" />
      </div>

      <div className="page-shell flex-1">
        <header className="page-hero">
          <h1 className="page-hero-title">Connect with IRIS</h1>
          <p className="page-hero-sub">
            Collaborations, inquiries, or just hello — our inbox and DMs are open.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <Image
              src="/images/collage.png"
              alt="A collage of photos taken by IRIS Society members"
              width={1000}
              height={800}
              className="w-full h-full min-h-[240px] object-cover"
              priority
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col">
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-1">Say hello</h2>
            <p className="text-slate-300 mb-6">We usually respond within a day.</p>

            <div className="grid gap-3">
              {channels.map((ch) => {
                const Icon = ch.icon
                const className =
                  "group w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 md:px-4 py-3.5 min-h-[56px] hover:bg-white/[0.08] hover:border-white/15 active:scale-[0.99] transition-[background,border-color,transform] duration-200"
                const inner = (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-200 shrink-0">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-white font-medium text-sm sm:text-base">
                          {ch.title}
                        </div>
                        <div className="text-slate-400 text-sm break-words break-all">
                          {ch.detail}
                        </div>
                      </div>
                    </div>
                    <span className="hidden md:inline text-slate-500 text-sm group-hover:text-slate-300 shrink-0">
                      {ch.cta} →
                    </span>
                  </>
                )

                if (ch.external) {
                  return (
                    <Link
                      key={ch.title}
                      href={ch.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      {inner}
                    </Link>
                  )
                }

                return (
                  <a key={ch.title} href={ch.href} className={className}>
                    {inner}
                  </a>
                )
              })}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center">
                <div className="text-white text-lg font-semibold tracking-tight">Collaborate</div>
                <div className="text-slate-400 text-sm mt-1">Work with us</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center">
                <div className="text-white text-lg font-semibold tracking-tight">Volunteer</div>
                <div className="text-slate-400 text-sm mt-1">Join IRIS events</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  )
}
