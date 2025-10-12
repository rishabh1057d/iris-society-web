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
  const buttonRef = useRef<HTMLDivElement>(null)

  const isTitleInView = useInView(titleRef, { once: true })
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

  // Enhanced team member card
  const TeamMemberCard = ({ member, isCompact = false }: { member: TeamMember; isCompact?: boolean }) => {
    const linkedinUrl = member.linkedin && member.linkedin.trim() !== "" ? member.linkedin : "https://www.linkedin.com/company/iris-camera-society/"
    const hasRole = Boolean(member.role && member.role.trim() !== "")
    const hasDescription = Boolean(member.description && member.description.trim() !== "")
    
    return (
      <div
        className={`relative group ${isCompact ? "max-w-xs mx-auto" : ""} ${member.className || ""}`}
      >
        {/* Enhanced glass card with better styling */}
        <div className="relative glass-card p-4 md:p-6 overflow-hidden">
          {/* Decorative border gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-xl blur-sm" />
          <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 md:p-6">
            {/* Profile image section */}
            <div className={`relative mb-4 ${isCompact ? "max-w-[200px] mx-auto" : ""}`}>
              <div className="relative overflow-hidden rounded-xl">
                <ResponsiveImage
                  src={member.image || "/placeholder.svg"}
                  alt={`${member.name}${hasRole ? ` - ${member.role}` : ""}`}
                  width={isCompact ? 200 : 300}
                  height={isCompact ? 200 : 300}
                  aspectRatio="1/1"
                  isTeamMember={true}
                  className="rounded-xl transition-transform duration-500 group-hover:scale-110"
                  sizes={
                    isCompact ? "(max-width: 768px) 200px, 200px" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                  }
                  priority={false}
                  quality={90}
                />
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Content section */}
            <div className="text-center space-y-3">
              {/* Name */}
              <h3 className={`font-extrabold relative ${isCompact ? "text-lg" : "text-xl"}`}>
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  {member.name}
                </span>
                {/* Decorative underline */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
              </h3>

              {/* Role */}
              {hasRole && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-400">
                    <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 0 0-.75.75v18a.75.75 0 0 0 1.5 0V3a.75.75 0 0 0-.75-.75ZM15.75 2.25a.75.75 0 0 0-.75.75v18a.75.75 0 0 0 1.5 0V3a.75.75 0 0 0-.75-.75ZM8.25 5.25a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 1.5 0V6a.75.75 0 0 0-.75-.75ZM19.5 5.25a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 1.5 0V6a.75.75 0 0 0-.75-.75Z" clipRule="evenodd" />
                  </svg>
                  <span className={`text-blue-300 font-medium ${isCompact ? "text-sm" : "text-base"}`}>
                    {member.role}
                  </span>
                </div>
              )}

              {/* Description */}
              {hasDescription && (
                <p className={`text-gray-300 leading-relaxed ${isCompact ? "text-xs" : "text-sm"}`}>
                  {member.description}
                </p>
              )}

              {/* LinkedIn link */}
              <div className="pt-2">
                <Link
                  href={linkedinUrl}
                  target={linkedinUrl ? "_blank" : "_self"}
                  aria-label={`${member.name}'s LinkedIn`}
                  className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-400/30 hover:border-blue-400/50 rounded-full transition-all duration-300 group/link"
                >
                  <Linkedin className={`text-blue-400 group-hover/link:text-blue-300 transition-colors duration-300 ${isCompact ? "w-4 h-4" : "w-5 h-5"}`} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center relative overflow-hidden">
      <Navbar />
      
      {/* Enhanced background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl top-1/4 left-1/4 animate-pulse" />
        <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/8 to-pink-500/8 blur-3xl top-3/4 right-1/4 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-indigo-500/6 to-blue-500/6 blur-3xl bottom-1/4 left-1/4 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="pt-24 pb-12 px-6 w-full max-w-7xl mx-auto relative z-10">
        {/* Enhanced hero section */}
        <div className="text-center mb-16">
          <motion.div
            ref={titleRef}
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 relative">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Our Team
              </span>
              {/* Decorative underline */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
            </h1>
            
            <motion.p
              className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={isTitleInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Meet the passionate individuals behind IRIS Society's creative vision
            </motion.p>
          </motion.div>

          {/* Enhanced Apply Now button */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <motion.div
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300 scale-110" />
                  <Button
                    size="lg"
                    className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-lg shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-300 border border-white/20"
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
                    <span className="relative z-10 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                      </svg>
                      Apply Now
                    </span>
                  </Button>
                </motion.div>
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
          </motion.div>
        </div>

        {/* Enhanced Leadership Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 relative">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Leadership Team
              </span>
              {/* Decorative underline */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              Our visionary leaders who guide IRIS Society's creative direction
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
            {currentMembers.leadershipTeam.map((member: any) => (
              <div key={member.id} className="w-full md:w-auto md:max-w-sm">
                <TeamMemberCard member={member} isCompact={false} />
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Team Sections */}
        {[
          { key: "OutreachAndSponsor", title: "Outreach and Sponsorship Team", description: "Building connections and partnerships" },
          { key: "ContentStrategyPR", title: "Content Strategy & PR", description: "Crafting our story and public relations" },
          { key: "CreativeProduction", title: "Creative Production Crew", description: "Bringing ideas to life through media" },
          { key: "MultimediaDesign", title: "Multimedia and Design", description: "Creating stunning visual experiences" },
        ].map(section => (
          (currentMembers[section.key] && currentMembers[section.key].length > 0) ? (
            <div key={section.key} className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-extrabold mb-4 relative">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    {section.title}
                  </span>
                  {/* Decorative underline */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                </h2>
                <p className="text-gray-300 text-base max-w-xl mx-auto leading-relaxed">
                  {section.description}
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                {currentMembers[section.key].map((member: any) => (
                  <div key={member.id} className="w-full sm:w-auto sm:max-w-xs">
                    <TeamMemberCard member={member} isCompact={true} />
                  </div>
                ))}
              </div>
            </div>
          ) : null
        ))}

        {/* Enhanced Web Dev Team Section */}
        {(currentMembers.webDevTeam && currentMembers.webDevTeam.length > 0) && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-4 relative">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Web Development Team
                </span>
                {/* Decorative underline */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
              </h2>
              <p className="text-gray-300 text-base max-w-xl mx-auto leading-relaxed">
                Building the digital foundation of IRIS Society
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
              {currentMembers.webDevTeam.map((member: any) => (
                <div key={member.id} className="w-full sm:w-auto sm:max-w-xs">
                  <TeamMemberCard member={member} isCompact={true} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Web Dev Team removed as per new structure */}

        {/* Enhanced Previous Members Toggle Button */}
        <motion.div
          ref={buttonRef}
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isButtonInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300 scale-110" />
            <button
              onClick={() => setShowPreviousMembers(!showPreviousMembers)}
              className="relative flex items-center gap-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-white px-8 py-4 rounded-lg transition-all duration-300 border border-blue-400/30 hover:border-blue-400/50 backdrop-blur-sm"
            >
              <span className="relative z-10 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
                {showPreviousMembers ? "Hide Previous Members" : "Show Previous Members"}
                {showPreviousMembers ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Previous Members Section */}
        {showPreviousMembers && (
          <div className="border-t border-gray-700/50 pt-12 mt-12">
            {/* Enhanced header section */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 relative">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Previous Members
                </span>
                {/* Decorative underline */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
              </h2>
              
              <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                Honoring the alumni who helped shape IRIS Society's legacy
              </p>

              {/* Enhanced Tenure Dropdown */}
              <div className="flex justify-center">
                <div className="relative">
                  <select
                    className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm text-white border border-blue-400/30 rounded-lg pl-6 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none hover:border-blue-400/50 transition-all duration-300"
                    value={selectedTenure}
                    onChange={e => setSelectedTenure(e.target.value)}
                  >
                    {Object.keys(previousMembers).map((tenure) => (
                      <option key={tenure} value={tenure} className="bg-gray-800">{tenure}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Previous Leadership Team */}
            {selectedTenure && previousMembers[selectedTenure] && previousMembers[selectedTenure].leadershipTeam && previousMembers[selectedTenure].leadershipTeam.length > 0 && (
              <div className="mb-20">
                <div className="text-center mb-12">
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-4 relative">
                    <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                      Leadership Team
                    </span>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                  </h3>
                </div>
                
                <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
                  {previousMembers[selectedTenure].leadershipTeam.map((member: any) => (
                    <div key={member.id} className="w-full md:w-auto md:max-w-sm">
                      <TeamMemberCard member={member} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Core Team */}
            {selectedTenure && previousMembers[selectedTenure] && previousMembers[selectedTenure].coreTeam && previousMembers[selectedTenure].coreTeam.length > 0 && (
              <div className="mb-20">
                <div className="text-center mb-12">
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-4 relative">
                    <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                      Core Team Members
                    </span>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                  </h3>
                </div>
                
                <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                  {previousMembers[selectedTenure].coreTeam.map((member: any) => (
                    <div key={member.id} className="w-full sm:w-auto sm:max-w-xs">
                      <TeamMemberCard member={member} isCompact={true} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
