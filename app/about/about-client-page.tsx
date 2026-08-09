"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import Footer from "@/components/footer"
import { motion, useInView } from "framer-motion"
import { spring, staggerContainer, staggerItem } from "@/lib/motion"

export default function AboutClientPage() {
  const textRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const isTextInView = useInView(textRef, { once: true, margin: "-80px 0px" })
  const isImageInView = useInView(imageRef, { once: true, margin: "-80px 0px" })

  const pillars = [
    { label: "Workshops", icon: "🎓" },
    { label: "Competitions", icon: "🏆" },
    { label: "Photowalks", icon: "🚶" },
    { label: "Collabs", icon: "🤝" },
  ]

  const stats = [
    { value: "1200+", label: "Active Members" },
    { value: "40+", label: "Workshops & Events" },
    { value: "2k+", label: "Photos Shared" },
    { value: "30+", label: "Collaborations" },
  ]

  return (
    <section className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#d4a574]/12 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#5e9e96]/12 blur-3xl" />
      </div>

      <div className="page-shell flex-1">
        <motion.header
          className="page-hero"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring.default}
        >
          <h1 className="page-hero-title">IRIS Society</h1>
          <p className="page-hero-sub">
            The official Photography and Videography Society of the IIT Madras BS Degree
            program. We craft stories in light and motion.
          </p>
        </motion.header>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-stretch mb-12">
          <motion.div
            ref={textRef}
            initial={{ opacity: 0, y: 16 }}
            animate={isTextInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={spring.default}
            className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-3 tracking-tight">
              Who we are
            </h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Founded in November 2023, IRIS Society is a community of visual storytellers
              dedicated to capturing moments, crafting narratives, and expressing creativity
              through photography and videography.
            </p>
            <p className="text-slate-300 leading-relaxed">
              What began as a photography club has grown into a vibrant creative society that
              celebrates the power of still and moving images. Whether you are just starting out
              or already experienced, IRIS offers a welcoming space to learn, explore, and grow
              your craft.
            </p>

            <motion.div
              className="mt-6 grid grid-cols-2 gap-3"
              variants={staggerContainer}
              initial="hidden"
              animate={isTextInView ? "visible" : "hidden"}
            >
              {pillars.map((item) => (
                <motion.div
                  key={item.label}
                  variants={staggerItem}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 min-h-[48px]"
                >
                  <span className="text-lg" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="text-slate-200 text-sm font-medium">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/team" className="btn-primary !min-h-[44px] !px-5 !py-2.5 !text-sm">
                Meet our Team
              </Link>
              <Link href="/gallery" className="btn-secondary !min-h-[44px] !px-5 !py-2.5 !text-sm">
                Explore Gallery
              </Link>
            </div>
          </motion.div>

          <motion.div
            ref={imageRef}
            className="relative grid grid-cols-2 gap-3 md:gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={isImageInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={spring.soft}
          >
            <div className="col-span-2 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] aspect-[16/10]">
              <Image
                src="/images/logo-tilted.png"
                alt="IRIS Society tilted logo"
                width={900}
                height={600}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] aspect-[4/3]">
              <Image
                src="/images/PIC00916.JPG"
                alt="IRIS event"
                width={600}
                height={400}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] aspect-[4/3]">
              <Image
                src="/images/PIC08926.jpg"
                alt="Behind the scenes"
                width={600}
                height={400}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={spring.default}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-5 text-center backdrop-blur-md"
            >
              <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {stat.value}
              </div>
              <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
      <Footer />
    </section>
  )
}
