"use client"

import { useEffect, useState, useRef } from "react"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { ChevronDown, ChevronUp, Linkedin } from "lucide-react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import ResponsiveImage from "@/components/responsive-image"

// Team member type
type TeamMember = {
  id: number
  name: string
  role: string
  description: string
  image: string
  linkedin?: string
  className?: string
}

export default function Team() {
  const [showPreviousMembers, setShowPreviousMembers] = useState(false)
  const [showMoreCore, setShowMoreCore] = useState(false)
  const [currentMembers, setCurrentMembers] = useState<any>({ leadershipTeam: [], coreTeam: [], webDevTeam: [] })
  const [previousMembers, setPreviousMembers] = useState<any>({})
  const [selectedTenure, setSelectedTenure] = useState<string>("")

  const titleRef = useRef<HTMLHeadingElement>(null)
  const leadershipRef = useRef<HTMLDivElement>(null)
  const coreTeamRef = useRef<HTMLHeadingElement>(null)
  const webDevRef = useRef<HTMLHeadingElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  const isTitleInView = useInView(titleRef, { once: true })
  const isLeadershipInView = useInView(leadershipRef, { once: true })
  const isCoreTeamInView = useInView(coreTeamRef, { once: true })
  const isWebDevInView = useInView(webDevRef, { once: true })
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
        // Set default selectedTenure to the latest (last) key
        const tenures = Object.keys(data)
        if (tenures.length > 0) setSelectedTenure(tenures[tenures.length - 1])
      })
      .catch(() => setPreviousMembers({}))
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  // Render team member card
  const TeamMemberCard = ({ member, isCompact = false }: { member: TeamMember; isCompact?: boolean }) => {
    const linkedinUrl = member.linkedin && member.linkedin.trim() !== "" ? member.linkedin : "https://www.linkedin.com/company/iris-camera-society/"
    return (
      <motion.div
        className={`team-card bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden p-4 flex flex-col items-center ${
          isCompact ? "max-w-xs mx-auto" : ""
        } ${member.className || ""}`}
        variants={itemVariants}
        whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      >
        <div className={`w-full mb-3 ${isCompact ? "max-w-[200px]" : ""}`}>
          <ResponsiveImage
            src={member.image || "/placeholder.svg"}
            alt={`${member.name} - ${member.role}`}
            width={isCompact ? 200 : 300}
            height={isCompact ? 200 : 300}
            aspectRatio="1/1"
            isTeamMember={true}
            className="rounded-lg"
            sizes={
              isCompact ? "(max-width: 768px) 200px, 200px" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
            }
            priority={false}
            quality={90}
          />
        </div>
        <h3 className={`font-bold mb-1 text-center ${isCompact ? "text-lg" : "text-xl"}`}>{member.name}</h3>
        <p className={`text-blue-300 mb-2 text-center ${isCompact ? "text-sm" : ""}`}>{member.role}</p>
        <p className={`text-gray-400 text-center mb-3 flex-grow ${isCompact ? "text-xs" : "text-sm"}`}>
          {member.description}
        </p>
        <Link
          href={linkedinUrl}
          target={linkedinUrl ? "_blank" : "_self"}
          aria-label={`${member.name}'s LinkedIn`}
          className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
        >
          <Linkedin className={`${isCompact ? "w-4 h-4" : "w-5 h-5"}`} />
        </Link>
      </motion.div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center relative">
      <Navbar />
      <div className="pt-24 pb-12 px-6 w-full max-w-6xl mx-auto">
        <motion.h1
          ref={titleRef}
          className="text-3xl md:text-4xl font-bold mb-12 text-center text-blue-300"
          initial={{ opacity: 0, y: -20 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          Our Team
        </motion.h1>

        {/* Current Leadership Team */}
        <div className="mb-16">
          <motion.h2
            ref={leadershipRef}
            className="text-2xl font-bold mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={isLeadershipInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            Leadership Team
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate={isLeadershipInView ? "visible" : "hidden"}
          >
            {currentMembers.leadershipTeam.map((member: any) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </motion.div>
        </div>

        {/* Current Core Team */}
        <motion.h2
          ref={coreTeamRef}
          className="text-2xl font-bold mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={isCoreTeamInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          Core Team Members
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isCoreTeamInView ? "visible" : "hidden"}
        >
          {/* First row: 5 members */}
          {currentMembers.coreTeam.slice(0, 5).map((member: any) => (
            <TeamMemberCard key={member.id} member={member} isCompact={false} />
          ))}
          {/* View More: show additional members if toggled */}
          {showMoreCore && currentMembers.coreTeam.slice(5).map((member: any) => (
            <TeamMemberCard key={member.id} member={member} isCompact={false} />
          ))}
        </motion.div>
        {/* View More Button */}
        {currentMembers.coreTeam.length > 5 && (
          <div className="flex justify-center mb-8">
            <motion.button
              onClick={() => setShowMoreCore((prev) => !prev)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-md transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showMoreCore ? "View Less" : "View More"}
              {showMoreCore ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </motion.button>
          </div>
        )}

        {/* Web Dev Team - Compact Version */}
        <motion.h2
          ref={webDevRef}
          className="text-2xl font-bold mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={isWebDevInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          Web Dev Team
        </motion.h2>
        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isWebDevInView ? "visible" : "hidden"}
        >
          {currentMembers.webDevTeam.map((member: any) => (
            <TeamMemberCard key={member.id} member={member} isCompact={true} />
          ))}
        </motion.div>

        {/* Previous Members Toggle Button */}
        <motion.div
          ref={buttonRef}
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isButtonInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.button
            onClick={() => setShowPreviousMembers(!showPreviousMembers)}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-md transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showPreviousMembers ? "Hide Previous Members" : "Show Previous Members"}
            {showPreviousMembers ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </motion.button>
        </motion.div>

        {/* Previous Members Section */}
        <AnimatePresence>
          {showPreviousMembers && (
            <motion.div
              className="border-t border-gray-700 pt-8 mt-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <motion.h2
                  className="text-3xl font-bold text-center text-blue-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Previous Members
                </motion.h2>
                {/* Tenure Dropdown */}
                <select
                  className="bg-gray-800 text-white border border-gray-600 rounded pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                  value={selectedTenure}
                  onChange={e => setSelectedTenure(e.target.value)}
                >
                  {Object.keys(previousMembers).map((tenure) => (
                    <option key={tenure} value={tenure}>{tenure}</option>
                  ))}
                </select>
              </div>

              {selectedTenure && previousMembers[selectedTenure] && (
                <>
                  {/* Previous Leadership Team */}
                  <div className="mb-16">
                    <motion.h3
                      className="text-2xl font-bold mb-8 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      Leadership Team
                    </motion.h3>
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 gap-8"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delayChildren: 0.4 }}
                    >
                      {previousMembers[selectedTenure].leadershipTeam.map((member: any) => (
                        <TeamMemberCard key={member.id} member={member} />
                      ))}
                    </motion.div>
                  </div>

                  {/* Previous Core Team */}
                  <motion.h3
                    className="text-2xl font-bold mb-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    Core Team Members
                  </motion.h3>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delayChildren: 0.6 }}
                  >
                    {previousMembers[selectedTenure].coreTeam.map((member: any) => (
                      <TeamMemberCard key={member.id} member={member} />
                    ))}
                  </motion.div>

                  {/* Previous Web Dev Team (conditionally render if exists and is non-empty) */}
                  {Array.isArray(previousMembers[selectedTenure].webDevTeam) && previousMembers[selectedTenure].webDevTeam.length > 0 && (
                    <>
                      <motion.h3
                        className="text-2xl font-bold mb-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                      >
                        Web Dev Team
                      </motion.h3>
                      <motion.div
                        className="flex justify-around mb-16 flex-wrap gap-0"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delayChildren: 0.8 }}
                      >
                        {previousMembers[selectedTenure].webDevTeam.map((member: any) => (
                          <TeamMemberCard key={member.id} member={member} isCompact={true} />
                        ))}
                      </motion.div>
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
