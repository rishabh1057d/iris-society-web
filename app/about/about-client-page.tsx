"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import Footer from "@/components/footer"
import { motion, useInView } from "framer-motion"

export default function AboutClientPage() {
  const textRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const activitiesRef = useRef<HTMLUListElement>(null)

  const isTextInView = useInView(textRef, { once: true, margin: "-100px 0px" })
  const isImageInView = useInView(imageRef, { once: true, margin: "-100px 0px" })
  const isActivitiesInView = useInView(activitiesRef, { once: true, margin: "-100px 0px" })

  return (
    <section className="relative flex min-h-screen flex-col items-center overflow-hidden">
      {/* background aesthetics */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
      </div>

      <div className="pt-24 pb-16 px-6 w-full max-w-6xl mx-auto">
        {/* hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-200 to-purple-300">
            IRIS Society
          </h1>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
            The official Photography and Videography Society of the IIT Madras BS Degree program. We craft stories in
            light and motion.
          </p>
        </motion.div>

        {/* main content */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch mb-14">
          {/* narrative card */}
          <motion.div
            ref={textRef}
            initial={{ opacity: 0, x: -40 }}
            animate={isTextInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
          >
            <h2 className="text-xl font-semibold text-white mb-3">Who we are</h2>
            <p className="text-gray-300 mb-4">
              Founded in November 2023, IRIS Society is a community of visual storytellers dedicated to capturing
              moments, crafting narratives, and expressing creativity through photography and videography.
            </p>
            <p className="text-gray-300">
              What began as a photography club has grown into a vibrant creative society that celebrates the power of
              still and moving images. Whether you are just starting out or already experienced, IRIS offers a welcoming
              space to learn, explore, and grow your craft.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                { label: "Workshops", icon: "🎓" },
                { label: "Competitions", icon: "🏆" },
                { label: "Photowalks", icon: "🚶" },
                { label: "Collabs", icon: "🤝" },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isTextInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, delay: 0.15 + idx * 0.08 }}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <span className="text-lg" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="text-gray-200">{item.label}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/team"
                className="inline-flex items-center justify-center rounded-full bg-blue-500/90 hover:bg-blue-400 text-white px-5 py-2 text-sm font-medium transition-colors"
              >
                Meet our Team
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white px-5 py-2 text-sm font-medium transition-colors"
              >
                Explore Gallery
              </Link>
            </div>
          </motion.div>

          {/* image / collage */}
          <motion.div
            ref={imageRef}
            className="relative grid grid-cols-2 gap-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={isImageInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.7 }}
          >
            <div className="col-span-2 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <Image
                src="/images/logo-tilted.png"
                alt="IRIS Society tilted logo"
                width={900}
                height={600}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <Image src="/images/PIC00916.JPG" alt="IRIS event" width={600} height={400} className="h-full w-full object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <Image src="/images/PIC08926.jpg" alt="Behind the scenes" width={600} height={400} className="h-full w-full object-cover" />
            </div>
          </motion.div>
        </div>

        {/* stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: "150+", label: "Active Members" },
            { value: "40+", label: "Workshops & Events" },
            { value: "2k+", label: "Photos Shared" },
            { value: "30+", label: "Collaborations" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-300 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
      <Footer />
    </section>
  )
} 