import Image from "next/image"
import Link from "next/link"

export default function Join() {
  return (
    <section className="relative flex flex-1 flex-col min-h-full">
      <div className="page-shell max-w-2xl">
        <header className="page-hero">
          <Image
            src="/images/logo.png"
            alt="IRIS Society Logo"
            width={96}
            height={96}
            className="mx-auto mb-5 drop-shadow-xl"
            priority
          />
          <h1 className="page-hero-title">Join IRIS Society</h1>
          <p className="page-hero-sub">
            Photography &amp; Videography Society of IITM BS Degree. Become part of our
            creative community.
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <p className="text-slate-300 text-center mb-6 leading-relaxed">
            Membership applications open through our official form. Use your student email so
            we can verify enrollment.
          </p>
          <Link
            href="https://docs.google.com/forms/d/e/1FAIpQLSczSzMGIAd-sE_nxe9wOFSrsYy59lzRBhU9e5uhOjMtmIquLQ/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full"
          >
            Open membership form
          </Link>
          <p className="mt-4 text-center text-xs text-slate-500">
            Opens in a new tab · Google Form
          </p>
        </div>
      </div>
    </section>
  )
}
