"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, Linkedin } from "lucide-react"
import { motion, useInView } from "framer-motion"
import ResponsiveImage from "@/components/responsive-image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Footer from "@/components/footer"
import { spring } from "@/lib/motion"

type TeamMember = {
  id: number
  name: string
  role?: string
  description?: string
  image: string
  linkedin?: string
  className?: string
}

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
      .catch(() =>
        setCurrentMembers({
          leadershipTeam: [],
          OutreachAndSponsor: [],
          CreativeProduction: [],
          MultimediaDesign: [],
          ContentStrategyPR: [],
          recruiting: false,
          recruitmentForm: "",
        })
      )
    fetch("/previous_members.json")
      .then((res) => res.json())
      .then((data) => {
        setPreviousMembers(data)
        const tenures = Object.keys(data).sort()
        if (tenures.length > 0) {
          setSelectedTenure(tenures[tenures.length - 1])
        }
      })
      .catch(() => setPreviousMembers({}))
  }, [])

  const recruiting = Boolean(currentMembers.recruiting)
  const recruitmentForm = currentMembers.recruitmentForm

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
    const hasRole = Boolean(member.role && member.role.trim() !== "")
    const hasDescription = Boolean(member.description && member.description.trim() !== "")

    return (
      <div
        className={`team-card group glass-card-event bg-white/[0.04] p-4 md:p-5 ${
          isCompact ? "max-w-xs mx-auto" : ""
        } ${member.className || ""}`}
      >
        <div className={`w-full mb-3 ${isCompact ? "max-w-[200px] mx-auto" : ""}`}>
          <ResponsiveImage
            src={member.image || "/placeholder.svg"}
            alt={`${member.name}${hasRole ? ` - ${member.role}` : ""}`}
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

        <div className="text-center space-y-2 flex-1 flex flex-col">
          <h3
            className={`font-semibold text-white tracking-tight ${
              isCompact ? "text-lg" : "text-xl"
            }`}
          >
            {member.name}
          </h3>

          {hasRole && (
            <p className={`text-sky-300/90 font-medium ${isCompact ? "text-sm" : "text-base"}`}>
              {member.role}
            </p>
          )}

          {hasDescription && (
            <p
              className={`text-slate-400 leading-relaxed flex-grow ${
                isCompact ? "text-xs" : "text-sm"
              }`}
            >
              {member.description}
            </p>
          )}

          <div className="pt-2">
            <Link
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name}'s LinkedIn`}
              className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-full text-sky-400 hover:text-sky-300 hover:bg-sky-400/10 active:scale-95 transition-colors"
            >
              <Linkedin className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const sections = [
    { key: "Coordinators", title: "Coordinators", description: "Supporting team operations" },
    {
      key: "OutreachAndSponsor",
      title: "Outreach and Sponsorship",
      description: "Building connections and partnerships",
    },
    {
      key: "CreativeProduction",
      title: "Creative Production",
      description: "Bringing ideas to life through media",
    },
    {
      key: "MultimediaDesign",
      title: "Multimedia and Design",
      description: "Creating visual experiences",
    },
    {
      key: "ContentStrategyPR",
      title: "Content Strategy & PR",
      description: "Story and public relations",
    },
  ]

  return (
    <div className="flex min-h-full flex-1 flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute w-96 h-96 rounded-full bg-blue-500/10 blur-3xl top-1/4 left-1/4" />
        <div className="absolute w-80 h-80 rounded-full bg-purple-500/8 blur-3xl top-3/4 right-1/4" />
      </div>

      <div className="page-shell max-w-7xl flex-1 relative z-10">
        <motion.header
          className="page-hero"
          initial={{ opacity: 0, y: 12 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <h1 ref={titleRef} className="page-hero-title">
            Our Team
          </h1>
          <p className="page-hero-sub">
            The people who keep IRIS focused, creative, and welcoming.
          </p>

          <div className="mt-8 flex justify-center">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="min-h-[48px]"
                  onClick={(e) => {
                    if (recruiting) {
                      e.preventDefault()
                      window.open(recruitmentForm, "_blank", "noopener,noreferrer")
                    } else {
                      e.preventDefault()
                      setOpen(true)
                    }
                  }}
                >
                  Apply to core team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recruitment closed</DialogTitle>
                </DialogHeader>
                <p className="text-slate-300 text-center text-sm leading-relaxed py-2">
                  We aren&apos;t recruiting at the moment — keep an eye out for announcements.
                </p>
              </DialogContent>
            </Dialog>
          </div>
        </motion.header>

        <section className="mb-16 md:mb-20">
          <h2 className="section-title text-center border-0 pb-0 mb-3">Leadership</h2>
          <p className="text-center text-slate-400 text-sm mb-8 max-w-lg mx-auto">
            Guiding IRIS Society&apos;s creative direction
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {currentMembers.leadershipTeam?.map((member: any) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>

        {sections.map((section) =>
          currentMembers[section.key]?.length > 0 ? (
            <section key={section.key} className="mb-16 md:mb-20">
              <h2 className="section-title text-center border-0 pb-0 mb-2">{section.title}</h2>
              <p className="text-center text-slate-400 text-sm mb-8">{section.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {currentMembers[section.key].map((member: any) => (
                  <TeamMemberCard key={member.id} member={member} isCompact />
                ))}
              </div>
            </section>
          ) : null
        )}

        {currentMembers.webDevTeam?.length > 0 && (
          <section className="mb-16 md:mb-20">
            <h2 className="section-title text-center border-0 pb-0 mb-2">Web Development</h2>
            <p className="text-center text-slate-400 text-sm mb-8">
              Building the digital foundation of IRIS
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {currentMembers.webDevTeam.map((member: any) => (
                <TeamMemberCard key={member.id} member={member} isCompact />
              ))}
            </div>
          </section>
        )}

        <motion.div
          ref={buttonRef}
          className="flex justify-center mb-10"
          initial={{ opacity: 0 }}
          animate={isButtonInView ? { opacity: 1 } : { opacity: 0 }}
          transition={spring.default}
        >
          <button
            type="button"
            onClick={() => setShowPreviousMembers((v) => !v)}
            className="btn-secondary !w-auto inline-flex gap-2"
          >
            {showPreviousMembers ? "Hide previous members" : "Previous members"}
            {showPreviousMembers ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </motion.div>

        {showPreviousMembers && (
          <div className="border-t border-white/10 pt-12 mt-4">
            <div className="text-center mb-10">
              <h2 className="page-hero-title !text-3xl mb-3">Previous Members</h2>
              <p className="page-hero-sub mb-6">Alumni who helped shape IRIS</p>
              <div className="relative inline-block">
                <select
                  className="appearance-none min-h-[44px] bg-white/[0.06] backdrop-blur-md text-white border border-white/15 rounded-full pl-5 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  value={selectedTenure}
                  onChange={(e) => setSelectedTenure(e.target.value)}
                >
                  {Object.keys(previousMembers).map((tenure) => (
                    <option key={tenure} value={tenure} className="bg-slate-900">
                      {tenure}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {selectedTenure && previousMembers[selectedTenure]?.leadershipTeam?.length > 0 && (
              <section className="mb-14">
                <h3 className="text-xl font-semibold text-center text-white tracking-tight mb-6">
                  Leadership
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {previousMembers[selectedTenure].leadershipTeam.map((member: any) => (
                    <TeamMemberCard key={member.id} member={member} />
                  ))}
                </div>
              </section>
            )}

            {selectedTenure && previousMembers[selectedTenure]?.coreTeam?.length > 0 && (
              <section className="mb-14">
                <h3 className="text-xl font-semibold text-center text-white tracking-tight mb-6">
                  Core Team
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {previousMembers[selectedTenure].coreTeam.map((member: any) => (
                    <TeamMemberCard key={member.id} member={member} isCompact />
                  ))}
                </div>
              </section>
            )}

            {selectedTenure && previousMembers[selectedTenure]?.webDevTeam?.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xl font-semibold text-center text-white tracking-tight mb-6">
                  Web Team
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
                  {previousMembers[selectedTenure].webDevTeam.map((member: any) => (
                    <TeamMemberCard key={member.id} member={member} isCompact />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
