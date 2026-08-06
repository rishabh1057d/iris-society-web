"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, Linkedin } from "lucide-react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import ResponsiveImage from "@/components/responsive-image"
import Footer from "@/components/footer"
import { spring, staggerContainer, staggerItem } from "@/lib/motion"

type TeamMember = {
  id: number
  name: string
  role: string
  description: string
  image: string
  linkedin?: string
  className?: string
}

export default function TeamClientPage() {
  const [showPreviousMembers, setShowPreviousMembers] = useState(false)
  const [showMoreCore, setShowMoreCore] = useState(false)
  const [currentMembers, setCurrentMembers] = useState<any>({
    leadershipTeam: [],
    coreTeam: [],
    webDevTeam: [],
  })
  const [previousMembers, setPreviousMembers] = useState<any>({})
  const [selectedTenure, setSelectedTenure] = useState<string>("")

  const titleRef = useRef<HTMLHeadingElement>(null)
  const leadershipRef = useRef<HTMLDivElement>(null)
  const coreTeamRef = useRef<HTMLHeadingElement>(null)
  const webDevRef = useRef<HTMLHeadingElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  const isTitleInView = useInView(titleRef, { once: true })
  const isLeadershipInView = useInView(leadershipRef, { once: true, margin: "-60px" })
  const isCoreTeamInView = useInView(coreTeamRef, { once: true, margin: "-60px" })
  const isWebDevInView = useInView(webDevRef, { once: true, margin: "-60px" })
  const isButtonInView = useInView(buttonRef, { once: true })

  useEffect(() => {
    fetch("/current_members.json")
      .then((res) => res.json())
      .then((data) => setCurrentMembers(data))
      .catch(() => setCurrentMembers({ leadershipTeam: [], coreTeam: [], webDevTeam: [] }))
    fetch("/previous_members.json")
      .then((res) => res.json())
      .then((data) => {
        setPreviousMembers(data)
        const tenures = Object.keys(data)
        if (tenures.length > 0) setSelectedTenure(tenures[tenures.length - 1])
      })
      .catch(() => setPreviousMembers({}))
  }, [])

  const TeamMemberCard = ({
    member,
    isCompact = false,
  }: {
    member: TeamMember
    isCompact?: boolean
  }) => {
    const linkedinUrl =
      member.linkedin && member.linkedin.trim() !== ""
        ? member.linkedin
        : "https://www.linkedin.com/company/iris-camera-society/"
    return (
      <motion.div
        className={`team-card glass-card-event bg-white/[0.04] p-4 flex flex-col items-center ${
          isCompact ? "max-w-xs mx-auto" : ""
        } ${member.className || ""}`}
        variants={staggerItem}
        whileHover={{ y: -3, transition: spring.snappy }}
        whileTap={{ scale: 0.99 }}
      >
        <div className={`w-full mb-3 ${isCompact ? "max-w-[200px]" : ""}`}>
          <ResponsiveImage
            src={member.image || "/placeholder.svg"}
            alt={`${member.name} - ${member.role}`}
            width={isCompact ? 200 : 300}
            height={isCompact ? 200 : 300}
            aspectRatio="1/1"
            isTeamMember={true}
            className="rounded-xl"
            sizes={
              isCompact
                ? "(max-width: 768px) 200px, 200px"
                : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
            }
            priority={false}
            quality={90}
          />
        </div>
        <h3
          className={`font-semibold mb-1 text-center text-white tracking-tight ${
            isCompact ? "text-lg" : "text-xl"
          }`}
        >
          {member.name}
        </h3>
        <p className={`text-sky-300/90 mb-2 text-center font-medium ${isCompact ? "text-sm" : ""}`}>
          {member.role}
        </p>
        <p
          className={`text-slate-400 text-center mb-4 flex-grow leading-relaxed ${
            isCompact ? "text-xs" : "text-sm"
          }`}
        >
          {member.description}
        </p>
        <Link
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name}'s LinkedIn`}
          className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-full text-sky-400 hover:text-sky-300 hover:bg-sky-400/10 active:scale-95 transition-colors"
        >
          <Linkedin className={`${isCompact ? "w-4 h-4" : "w-5 h-5"}`} />
        </Link>
      </motion.div>
    )
  }

  const coreVisible = showMoreCore
    ? currentMembers.coreTeam
    : currentMembers.coreTeam?.slice(0, 6) || []

  return (
    <section className="flex flex-col flex-1 min-h-full">
      <div className="page-shell flex-1">
        <motion.header
          ref={titleRef}
          className="page-hero"
          initial={{ opacity: 0, y: 12 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <h1 className="page-hero-title">Our Team</h1>
          <p className="page-hero-sub">
            The people who keep IRIS focused, creative, and welcoming.
          </p>
        </motion.header>

        <div className="mb-16" ref={leadershipRef}>
          <h2 className="section-title text-center border-0 pb-0 mb-8">Leadership Team</h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate={isLeadershipInView ? "visible" : "hidden"}
          >
            {currentMembers.leadershipTeam.map((member: any) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </motion.div>
        </div>

        <div className="mb-16">
          <h2 ref={coreTeamRef} className="section-title text-center border-0 pb-0 mb-8">
            Core Team
          </h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate={isCoreTeamInView ? "visible" : "hidden"}
          >
            {coreVisible.map((member: any) => (
              <TeamMemberCard key={member.id} member={member} isCompact />
            ))}
          </motion.div>
          {currentMembers.coreTeam?.length > 6 && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => setShowMoreCore((v) => !v)}
                className="btn-secondary !min-h-[44px] !px-5 !py-2.5 !text-sm !w-auto inline-flex gap-2"
              >
                {showMoreCore ? (
                  <>
                    Show less <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {currentMembers.webDevTeam?.length > 0 && (
          <div className="mb-16">
            <h2 ref={webDevRef} className="section-title text-center border-0 pb-0 mb-8">
              Web Team
            </h2>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate={isWebDevInView ? "visible" : "hidden"}
            >
              {currentMembers.webDevTeam.map((member: any) => (
                <TeamMemberCard key={member.id} member={member} isCompact />
              ))}
            </motion.div>
          </div>
        )}

        <div ref={buttonRef} className="flex flex-col items-center mb-8">
          <motion.button
            type="button"
            onClick={() => setShowPreviousMembers((v) => !v)}
            className="btn-secondary !w-auto !min-h-[44px] inline-flex gap-2"
            initial={{ opacity: 0 }}
            animate={isButtonInView ? { opacity: 1 } : { opacity: 0 }}
            transition={spring.default}
            whileTap={{ scale: 0.97 }}
          >
            {showPreviousMembers ? "Hide previous members" : "Previous members"}
            {showPreviousMembers ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {showPreviousMembers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring.snappy}
              className="overflow-hidden"
            >
              {Object.keys(previousMembers).length > 0 && (
                <div className="mb-6 flex flex-wrap justify-center gap-2">
                  {Object.keys(previousMembers).map((tenure) => (
                    <button
                      key={tenure}
                      type="button"
                      onClick={() => setSelectedTenure(tenure)}
                      className={`min-h-[40px] px-4 py-2 rounded-full text-sm font-medium transition-colors active:scale-95 ${
                        selectedTenure === tenure
                          ? "bg-blue-500/25 text-white border border-blue-400/40"
                          : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {tenure}
                    </button>
                  ))}
                </div>
              )}
              {selectedTenure && previousMembers[selectedTenure] && (
                <div className="space-y-10">
                  {(["leadershipTeam", "coreTeam", "webDevTeam"] as const).map((group) => {
                    const members = previousMembers[selectedTenure]?.[group]
                    if (!Array.isArray(members) || members.length === 0) return null
                    const labels: Record<string, string> = {
                      leadershipTeam: "Leadership",
                      coreTeam: "Core Team",
                      webDevTeam: "Web Team",
                    }
                    return (
                      <div key={group}>
                        <h3 className="text-lg font-semibold text-slate-200 text-center mb-5 tracking-tight">
                          {labels[group]}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {members.map((member: any) => (
                            <TeamMemberCard
                              key={`${group}-${member.id || member.name}`}
                              member={member}
                              isCompact
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {/* Flat array fallback (legacy shape) */}
                  {Array.isArray(previousMembers[selectedTenure]) &&
                    previousMembers[selectedTenure].map((member: any) => (
                      <TeamMemberCard
                        key={member.id || member.name}
                        member={member}
                        isCompact
                      />
                    ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </section>
  )
}
