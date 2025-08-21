"use client"

import { useEffect, useState, useRef } from "react"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { ChevronDown, ChevronUp, Linkedin } from "lucide-react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import ResponsiveImage from "@/components/responsive-image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Team member type
type TeamMember = {
  id: number
  name: string
  role?: string
  description?: string
  image: string
  linkedin?: string
  className?: string
}
import TeamClientPage from "./team-client-page"

export default function Team() {
  const [showPreviousMembers, setShowPreviousMembers] = useState(false)
  const [currentMembers, setCurrentMembers] = useState<any>({
    leadershipTeam: [],
    OutreachAndSponsor: [],
    CreativeProduction: [],
    MultimediaDesign: [],
    ContentStrategyPR: [],
  })
  const [previousMembers, setPreviousMembers] = useState<any>({})
  const [selectedTenure, setSelectedTenure] = useState<string>("")
  const [open, setOpen] = useState(false)

  const titleRef = useRef<HTMLHeadingElement>(null)
  const leadershipRef = useRef<HTMLDivElement>(null)
  const coreTeamRef = useRef<HTMLHeadingElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  const isTitleInView = useInView(titleRef, { once: true })
  const isLeadershipInView = useInView(leadershipRef, { once: true })
  const isCoreTeamInView = useInView(coreTeamRef, { once: true })
  const isButtonInView = useInView(buttonRef, { once: true })

  useEffect(() => {
    fetch("/current_members.json")
      .then((res) => res.json())
      .then((data) => setCurrentMembers(data))
      .catch(() => setCurrentMembers({
        leadershipTeam: [],
        OutreachAndSponsor: [],
        CreativeProduction: [],
        MultimediaDesign: [],
        ContentStrategyPR: [],
        recruiting: false,
        recruitmentForm: "",
      }))
            fetch("/previous_members.json")
          .then((res) => res.json())
          .then((data) => {
            setPreviousMembers(data)
            // Set default selectedTenure to the current team (last key)
            const tenures = Object.keys(data).sort()
            if (tenures.length > 0) {
              // Show the current team (last in sorted order)
              setSelectedTenure(tenures[tenures.length - 1])
            }
          })
      .catch(() => setPreviousMembers({}))
  }, [])

  // Extract recruiting and recruitmentForm from currentMembers
  const recruiting = Boolean(currentMembers.recruiting)
  const recruitmentForm = currentMembers.recruitmentForm

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

  // No grouping helpers needed; sections come from JSON arrays

  // Render team member card
  const TeamMemberCard = ({ member, isCompact = false }: { member: TeamMember; isCompact?: boolean }) => {
    const linkedinUrl = member.linkedin && member.linkedin.trim() !== "" ? member.linkedin : "https://www.linkedin.com/company/iris-camera-society/"
    const hasRole = Boolean(member.role && member.role.trim() !== "")
    const hasDescription = Boolean(member.description && member.description.trim() !== "")
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
            alt={`${member.name}${hasRole ? ` - ${member.role}` : ""}`}
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
        {hasRole && (
          <p className={`text-blue-300 mb-2 text-center ${isCompact ? "text-sm" : ""}`}>{member.role}</p>
        )}
        {hasDescription && (
          <p className={`text-gray-400 text-center mb-3 flex-grow ${isCompact ? "text-xs" : "text-sm"}`}>
            {member.description}
          </p>
        )}
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
        <div className="flex justify-center items-end mb-12 gap-2">
          <motion.h1
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-center text-blue-300 flex items-center mb-2 mt-0 pb-0 pt-0"
            initial={{ opacity: 0, y: -20 }}
            animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: 10, marginTop: 0, marginLeft: 0, marginRight: 0, paddingBottom: 0, paddingTop: 0 }}
          >
            Our Team
          </motion.h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-blue-500/60 text-white shadow-lg backdrop-blur-md border border-blue-300/40 hover:bg-blue-500/80 transition-all px-4 py-1 rounded-md ml-2 mb-[0px] md:mb-[12px]"
                style={{
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  boxShadow: '0 2px 8px 0 rgba(30, 64, 175, 0.10)',
                  margin: '0px 0px 12px 8px', // mobile margin, md+ handled by Tailwind
                }}
                onClick={e => {
                  if (recruiting) {
                    e.preventDefault(); // Prevent Dialog from opening
                    window.open(recruitmentForm, '_blank', 'noopener,noreferrer')
                  } else {
                    e.preventDefault()
                    setOpen(true)
                  }
                }}
              >
                Apply Now
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-blue-950/95 via-blue-900/90 to-gray-900/95 border border-blue-400/30 shadow-2xl rounded-2xl p-8">
              <DialogHeader>
                <DialogTitle className="text-blue-300 text-xl font-bold flex items-center gap-2">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#2563eb" fillOpacity="0.15"/><path d="M12 8v4" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#60a5fa"/></svg>
                  Recruitment Closed
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 px-2 text-center text-blue-100 text-base font-medium">
                We aren't recruiting at the moment, but keep an eye out for announcements.
              </div>
            </DialogContent>
          </Dialog>
        </div>

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
            className="flex flex-wrap justify-center gap-8"
            variants={containerVariants}
            initial="hidden"
            animate={isLeadershipInView ? "visible" : "hidden"}
          >
            {currentMembers.leadershipTeam.map((member: any) => (
              <div key={member.id} className="max-w-sm">
                <TeamMemberCard member={member} isCompact={false} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Current Team Sections */}
        {[
          { key: "OutreachAndSponsor", title: "Outreach and Sponsership Team" },
          { key: "ContentStrategyPR", title: "Content Strategy And PR" },
          { key: "CreativeProduction", title: "Creative Production Crew" },
          { key: "MultimediaDesign", title: "Mutimedia and Design" },
        ].map(section => (
          (currentMembers[section.key] && currentMembers[section.key].length > 0) ? (
            <div key={section.key} className="mb-16">
              <motion.h2
                className="text-2xl font-bold mb-8 text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
              >
                {section.title}
              </motion.h2>
              <motion.div
                className="flex flex-wrap justify-center gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {currentMembers[section.key].map((member: any) => (
                  <div key={member.id} className="max-w-xs">
                    <TeamMemberCard member={member} isCompact={true} />
                  </div>
                ))}
              </motion.div>
            </div>
          ) : null
        ))}

        {/* Current Web Dev Team - Compact and centered */}
        {(currentMembers.webDevTeam && currentMembers.webDevTeam.length > 0) && (
          <div className="mb-16">
            <motion.h2
              className="text-2xl font-bold mb-8 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              Web Dev Team
            </motion.h2>
            <motion.div
              className="flex flex-wrap justify-center gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {currentMembers.webDevTeam.map((member: any) => (
                <div key={member.id} className="max-w-xs">
                  <TeamMemberCard member={member} isCompact={true} />
                </div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Web Dev Team removed as per new structure */}

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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
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
                      className="flex flex-wrap justify-center gap-8"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delayChildren: 0.4 }}
                    >
                      {previousMembers[selectedTenure].leadershipTeam.map((member: any) => (
                        <div key={member.id} className="max-w-sm">
                          <TeamMemberCard member={member} />
                        </div>
                      ))}
                    </motion.div>
                  </div>

                  {/* Previous Core Team - Single Section */}
                  <motion.h3
                    className="text-2xl font-bold mb-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    Core Team Members
                  </motion.h3>
                  <motion.div
                    className="flex flex-wrap justify-center gap-6 mb-16"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delayChildren: 0.6 }}
                  >
                    {previousMembers[selectedTenure].coreTeam.map((member: any) => (
                      <div key={member.id} className="max-w-xs">
                        <TeamMemberCard member={member} isCompact={true} />
                      </div>
                    ))}
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
  return <TeamClientPage />
}
