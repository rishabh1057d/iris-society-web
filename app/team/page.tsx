"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronDown,
  ChevronUp,
  Linkedin,
  Users,
  Sparkles,
  Camera,
  Megaphone,
  Palette,
  PenLine,
  Code2,
  Handshake,
} from "lucide-react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import Footer from "@/components/footer"
import { spring, staggerContainer, staggerItem } from "@/lib/motion"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

type TeamMember = {
  id: number
  name: string
  role?: string
  description?: string
  image: string
  linkedin?: string
  className?: string
}

type CurrentMembers = {
  leadershipTeam: TeamMember[]
  Coordinators?: TeamMember[]
  OutreachAndSponsor?: TeamMember[]
  CreativeProduction?: TeamMember[]
  MultimediaDesign?: TeamMember[]
  ContentStrategyPR?: TeamMember[]
  webDevTeam?: TeamMember[]
  tenure?: string
  recruiting?: boolean
  recruitmentForm?: string
}

type TeamSection = {
  key: keyof CurrentMembers
  title: string
  description: string
  icon: typeof Users
}

const SECTIONS: TeamSection[] = [
  {
    key: "Coordinators",
    title: "Coordinators",
    description: "Keeping operations and events on track",
    icon: Handshake,
  },
  {
    key: "OutreachAndSponsor",
    title: "Outreach & Sponsorship",
    description: "Partnerships, campus reach, and collabs",
    icon: Megaphone,
  },
  {
    key: "CreativeProduction",
    title: "Creative Production",
    description: "Stories, edits, and production craft",
    icon: Camera,
  },
  {
    key: "MultimediaDesign",
    title: "Multimedia & Design",
    description: "Visuals, reels, and brand graphics",
    icon: Palette,
  },
  {
    key: "ContentStrategyPR",
    title: "Content Strategy & PR",
    description: "Voice, copy, and public presence",
    icon: PenLine,
  },
  {
    key: "webDevTeam",
    title: "Web Development",
    description: "Building and maintaining iris.society online",
    icon: Code2,
  },
]

const COMPANY_LINKEDIN = "https://www.linkedin.com/company/iris-camera-society/"

function normalizeImage(src?: string) {
  if (!src || !src.trim()) return "/placeholder.svg"
  const raw = src.trim()
  const withSlash =
    raw.startsWith("/") || raw.startsWith("http") || raw.startsWith("data:")
      ? raw
      : `/${raw}`
  return encodeURI(withSlash)
}

function memberLinkedIn(member: TeamMember) {
  return member.linkedin?.trim() ? member.linkedin.trim() : COMPANY_LINKEDIN
}

function LinkedInButton({
  member,
  size = "md",
}: {
  member: TeamMember
  size?: "sm" | "md"
}) {
  return (
    <Link
      href={memberLinkedIn(member)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${member.name} on LinkedIn`}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex items-center justify-center rounded-full text-sky-300 transition",
        "hover:bg-sky-400/15 hover:text-sky-200 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3230e0]/50",
        size === "sm" ? "h-9 w-9" : "h-10 w-10"
      )}
    >
      <Linkedin className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
    </Link>
  )
}

/** Featured leadership - larger presence, introduces the people at the helm */
function LeadershipCard({
  member,
  onOpen,
  featured,
}: {
  member: TeamMember
  onOpen: (m: TeamMember) => void
  featured?: boolean
}) {
  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -3, transition: spring.snappy }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "team-card glass-card-event group relative flex h-full w-full overflow-hidden rounded-2xl",
        "flex-col sm:flex-row"
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(member)}
        className="flex h-full w-full flex-col text-left sm:flex-row focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3230e0]/50"
      >
        <div
          className={cn(
            "relative shrink-0 overflow-hidden bg-slate-900/70",
            "aspect-[4/5] w-full sm:aspect-auto sm:h-auto sm:w-[42%] sm:min-h-[240px]"
          )}
        >
          <Image
            src={normalizeImage(member.image)}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 100vw, 280px"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/20" />
          {featured && (
            <span className="event-glass-chip absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#c8c7ff]">
              Leadership
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-5 md:p-6">
          <h3 className="text-lg font-semibold tracking-tight text-white md:text-xl">
            {member.name}
          </h3>
          {member.role && (
            <p className="mt-1 text-sm font-medium text-sky-300/90">{member.role}</p>
          )}
          {member.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">
              {member.description}
            </p>
          )}
          <span className="mt-3 text-xs font-medium text-sky-200/60 opacity-0 transition group-hover:opacity-100 sm:mt-4">
            View profile
          </span>
        </div>
      </button>

      <div className="absolute bottom-3 right-3 z-10 sm:bottom-4 sm:right-4">
        <LinkedInButton member={member} />
      </div>
    </motion.article>
  )
}

/** Fixed card width so flex rows can center incomplete last rows */
const MEMBER_CARD_WIDTH =
  "w-[calc((100%-0.625rem)/2)] sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3.75rem)/4)]"

/** Squad member - photo-first; centered text + centered incomplete rows via parent flex */
function MemberCard({
  member,
  onOpen,
}: {
  member: TeamMember
  onOpen: (m: TeamMember) => void
}) {
  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -3, transition: spring.snappy }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "team-card glass-card-event group flex h-full flex-col overflow-hidden rounded-2xl",
        MEMBER_CARD_WIDTH
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(member)}
        className="flex h-full flex-col text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3230e0]/50"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900/70">
          <Image
            src={normalizeImage(member.image)}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-2 py-2.5 sm:px-3 sm:py-3">
            <h3 className="line-clamp-2 text-center text-sm font-semibold leading-snug tracking-tight text-white sm:text-base">
              {member.name}
            </h3>
            {member.role && (
              <p className="mt-0.5 line-clamp-2 text-center text-xs leading-snug text-sky-200/85 sm:text-[13px]">
                {member.role}
              </p>
            )}
          </div>
        </div>

        {member.description && (
          <div className="hidden flex-1 flex-col items-center p-3.5 text-center sm:flex sm:p-4">
            <p className="line-clamp-2 w-full text-center text-sm leading-relaxed text-slate-300">
              {member.description}
            </p>
            <div className="mt-auto flex w-full items-center justify-center pt-3">
              <span
                className="inline-flex"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <LinkedInButton member={member} size="sm" />
              </span>
            </div>
          </div>
        )}
      </button>

      {/* Mobile: LinkedIn under card without opening detail */}
      <div className="flex items-center justify-center border-t border-white/10 py-1.5 sm:hidden">
        <LinkedInButton member={member} size="sm" />
      </div>
    </motion.article>
  )
}

/** Flex wrap + justify-center so partial last rows sit in the middle */
function MemberGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={cn(
        "flex flex-wrap justify-center gap-2.5 sm:gap-4 lg:gap-5",
        className
      )}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {children}
    </motion.div>
  )
}

/** Detail sheet - full bio + LinkedIn; mobile-friendly full height feel */
function MemberDetail({
  member,
  open,
  onOpenChange,
}: {
  member: TeamMember | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,720px)] max-w-lg gap-0 overflow-y-auto overflow-x-hidden border-white/15 bg-[#0F1013]/95 p-0 backdrop-blur-2xl sm:rounded-2xl">
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-900 sm:aspect-[16/10]">
          <Image
            src={normalizeImage(member.image)}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 100vw, 512px"
            className="object-cover"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F1013] via-black/20 to-black/30" />
        </div>

        <div className="space-y-3 px-5 pb-6 pt-4 sm:px-6">
          <DialogHeader className="space-y-1.5 text-left !pr-2">
            <DialogTitle className="text-xl font-semibold tracking-tight text-white">
              {member.name}
            </DialogTitle>
            {member.role && (
              <p className="text-sm font-medium text-sky-300/90">{member.role}</p>
            )}
            {member.description && (
              <DialogDescription className="pt-1 text-sm leading-relaxed text-slate-300">
                {member.description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href={memberLinkedIn(member)}
              target="_blank"
              rel="noopener noreferrer"
              className="event-glass-chip inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 text-sm font-medium text-sky-100 transition hover:bg-white/10 active:scale-95"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SectionHeader({
  title,
  description,
  count,
  icon: Icon,
}: {
  title: string
  description: string
  count?: number
  icon?: typeof Users
}) {
  return (
    <div className="mb-5 flex flex-col items-start gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          {Icon && (
            <span className="event-glass-chip inline-flex h-8 w-8 items-center justify-center rounded-full text-sky-200">
              <Icon className="h-3.5 w-3.5" />
            </span>
          )}
          <h2 className="section-title !mb-0 border-0 pb-0">{title}</h2>
        </div>
        <p className="text-sm text-slate-400 sm:pl-10">{description}</p>
      </div>
      {typeof count === "number" && count > 0 && (
        <span className="event-glass-chip shrink-0 rounded-full px-2.5 py-1 text-xs tabular-nums text-slate-300">
          {count} {count === 1 ? "member" : "members"}
        </span>
      )}
    </div>
  )
}

function SkeletonGrid({ n = 4 }: { n?: number }) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 sm:gap-4 lg:gap-5">
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "aspect-[4/5] animate-pulse rounded-2xl bg-white/[0.05]",
            MEMBER_CARD_WIDTH
          )}
        />
      ))}
    </div>
  )
}

export default function Team() {
  const [showPreviousMembers, setShowPreviousMembers] = useState(false)
  const [currentMembers, setCurrentMembers] = useState<CurrentMembers>({
    leadershipTeam: [],
  })
  const [previousMembers, setPreviousMembers] = useState<
    Record<string, { leadershipTeam?: TeamMember[]; coreTeam?: TeamMember[]; webDevTeam?: TeamMember[] }>
  >({})
  const [selectedTenure, setSelectedTenure] = useState("")
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TeamMember | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [recruitClosedOpen, setRecruitClosedOpen] = useState(false)

  const titleRef = useRef<HTMLHeadingElement>(null)
  const leadershipRef = useRef<HTMLElement>(null)
  const isTitleInView = useInView(titleRef, { once: true })
  const isLeadershipInView = useInView(leadershipRef, { once: true, margin: "-40px" })

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch("/current_members.json").then((r) => r.json()),
      fetch("/previous_members.json").then((r) => r.json()),
    ])
      .then(([current, previous]) => {
        if (cancelled) return
        setCurrentMembers(current)
        setPreviousMembers(previous)
        const tenures = Object.keys(previous).sort().reverse()
        if (tenures.length) setSelectedTenure(tenures[0])
        // When the live roster is empty (recruiting window), surface alumni by default
        const liveCount =
          (current.leadershipTeam?.length ?? 0) +
          ["Coordinators", "OutreachAndSponsor", "CreativeProduction", "MultimediaDesign", "ContentStrategyPR", "webDevTeam"].reduce(
            (n, k) => n + (Array.isArray(current[k]) ? current[k].length : 0),
            0,
          )
        if (liveCount === 0) setShowPreviousMembers(true)
      })
      .catch(() => {
        if (!cancelled) {
          setCurrentMembers({ leadershipTeam: [] })
          setPreviousMembers({})
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const recruiting = Boolean(currentMembers.recruiting)
  const recruitmentForm = currentMembers.recruitmentForm

  const openMember = useCallback((m: TeamMember) => {
    setSelected(m)
    setDetailOpen(true)
  }, [])

  const teamCount = useMemo(() => {
    let n = currentMembers.leadershipTeam?.length ?? 0
    for (const s of SECTIONS) {
      const list = currentMembers[s.key]
      if (Array.isArray(list)) n += list.length
    }
    return n
  }, [currentMembers])

  const activeSections = useMemo(
    () =>
      SECTIONS.filter((s) => {
        const list = currentMembers[s.key]
        return Array.isArray(list) && list.length > 0
      }),
    [currentMembers]
  )

  const tenureKeys = useMemo(
    () => Object.keys(previousMembers).sort().reverse(),
    [previousMembers]
  )

  const handleApply = () => {
    if (recruiting && recruitmentForm) {
      window.open(recruitmentForm, "_blank", "noopener,noreferrer")
    } else {
      setRecruitClosedOpen(true)
    }
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[#3230e0]/12 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[#5b59f0]/10 blur-3xl" />
      </div>

      <div className="page-shell relative z-10 max-w-6xl flex-1">
        {/* Hero - introduce the collective */}
        <motion.header
          ref={titleRef}
          className="page-hero mb-8 md:mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <div className="mb-3 flex justify-center">
            <span className="event-glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-sky-100">
              <Sparkles className="h-3.5 w-3.5 text-[#a8a6ff]" />
              Behind the lens
            </span>
          </div>
          <h1 className="page-hero-title">Meet the Team</h1>
          <p className="page-hero-sub">
            {recruiting && teamCount === 0
              ? "A new tenure is taking shape. Help build the next IRIS core team."
              : "Photographers, designers, writers, and builders who plan shoots, run events, and keep IRIS creative, focused, and welcoming."}
          </p>

          <div className="mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:mt-8 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={handleApply}
              className="btn-primary !min-h-[44px] !px-5 !py-2.5 !text-sm"
            >
              <Users className="mr-2 h-4 w-4" />
              {recruiting ? "Apply to core team" : "Join the core team"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPreviousMembers(true)
                requestAnimationFrame(() => {
                  document
                    .getElementById("previous-members")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                })
              }}
              className="btn-secondary !min-h-[44px] !px-5 !py-2.5 !text-sm"
            >
              Previous members
            </button>
          </div>

          {!loading && teamCount > 0 && (
            <p className="mt-5 text-xs tabular-nums text-slate-500">
              {teamCount} people · {activeSections.length + 1} groups this tenure
            </p>
          )}
          {!loading && recruiting && teamCount === 0 && currentMembers.tenure && (
            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-slate-500">
              Tenure {currentMembers.tenure} · recruiting now
            </p>
          )}
        </motion.header>

        {/* Empty roster while recruiting */}
        {!loading && recruiting && teamCount === 0 && (
          <motion.section
            ref={leadershipRef}
            className="mb-12 md:mb-16"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring.soft}
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:px-10 sm:py-14">
              <div
                className="pointer-events-none absolute inset-0 opacity-80"
                aria-hidden
                style={{
                  background:
                    "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(50,48,224,0.28), transparent 70%)",
                }}
              />
              <div className="relative z-10 mx-auto max-w-lg">
                <span className="event-glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-sky-100">
                  <Sparkles className="h-3.5 w-3.5 text-[#a8a6ff]" />
                  Open roles
                </span>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  We are building the next team
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-300 sm:text-base">
                  The {currentMembers.tenure || "2026-2027"} core team is not
                  announced yet. If you love photography, videography, design,
                  writing, outreach, or web, apply and help shape IRIS this
                  year.
                </p>
                <button
                  type="button"
                  onClick={handleApply}
                  className="btn-primary mt-7 !min-h-[48px] !px-7 !text-sm"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Apply on Google Form
                </button>
                <p className="mt-4 text-xs text-slate-500">
                  Opens in a new tab · Takes a few minutes
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Leadership (only when roster exists) */}
        {(loading || teamCount > 0) && (
          <motion.section
            ref={leadershipRef}
            className="mb-12 md:mb-16"
            initial={{ opacity: 0, y: 12 }}
            animate={
              isLeadershipInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
            }
            transition={spring.default}
          >
            <SectionHeader
              title="Leadership"
              description="Guiding IRIS creative direction and culture"
              count={currentMembers.leadershipTeam?.length}
              icon={Users}
            />

            {loading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-2xl bg-white/[0.05] sm:h-56"
                  />
                ))}
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5"
                variants={staggerContainer}
                initial="hidden"
                animate={isLeadershipInView ? "visible" : "hidden"}
              >
                {currentMembers.leadershipTeam?.map((member) => (
                  <LeadershipCard
                    key={member.id}
                    member={member}
                    onOpen={openMember}
                    featured
                  />
                ))}
              </motion.div>
            )}
          </motion.section>
        )}

        {/* Departments */}
        {loading ? (
          <div className="mb-12 space-y-10">
            <SkeletonGrid />
          </div>
        ) : (
          activeSections.map((section) => {
            const members = currentMembers[section.key] as TeamMember[]
            return (
              <section key={section.key} className="mb-12 md:mb-16">
                <SectionHeader
                  title={section.title}
                  description={section.description}
                  count={members.length}
                  icon={section.icon}
                />
                <MemberGrid>
                  {members.map((member) => (
                    <MemberCard
                      key={`${section.key}-${member.id}-${member.name}`}
                      member={member}
                      onOpen={openMember}
                    />
                  ))}
                </MemberGrid>
              </section>
            )
          })
        )}

        {/* Alumni toggle */}
        <div className="mb-8 flex justify-center md:mb-10">
          <button
            type="button"
            onClick={() => setShowPreviousMembers((v) => !v)}
            className="btn-secondary !w-auto inline-flex gap-2 !min-h-[44px] !px-5 !py-2.5 !text-sm"
            aria-expanded={showPreviousMembers}
          >
            {showPreviousMembers ? "Hide previous members" : "Previous members"}
            {showPreviousMembers ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showPreviousMembers && (
            <motion.div
              id="previous-members"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring.default}
              className="overflow-hidden"
            >
              <div className="border-t border-white/10 pb-4 pt-10">
                <div className="mb-8 text-center">
                  <h2 className="mb-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                    Previous members
                  </h2>
                  <p className="mx-auto mb-5 max-w-md text-sm text-slate-400">
                    Alumni who helped shape IRIS across tenures
                  </p>

                  {/* Tenure chips - better than a bare select on mobile */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {tenureKeys.map((tenure) => (
                      <button
                        key={tenure}
                        type="button"
                        onClick={() => setSelectedTenure(tenure)}
                        className={cn(
                          "event-glass-chip min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-medium transition active:scale-95",
                          selectedTenure === tenure
                            ? "border-[#3230e0]/45 bg-[#3230e0]/25 text-white"
                            : "text-slate-300 hover:bg-white/10"
                        )}
                      >
                        {tenure}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedTenure &&
                  previousMembers[selectedTenure]?.leadershipTeam &&
                  previousMembers[selectedTenure]!.leadershipTeam!.length > 0 && (
                    <section className="mb-12">
                      <SectionHeader
                        title="Leadership"
                        description={`Tenure ${selectedTenure}`}
                        count={
                          previousMembers[selectedTenure]!.leadershipTeam!.length
                        }
                        icon={Users}
                      />
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        {previousMembers[selectedTenure]!.leadershipTeam!.map(
                          (member) => (
                            <LeadershipCard
                              key={`prev-lead-${selectedTenure}-${member.id}`}
                              member={member}
                              onOpen={openMember}
                            />
                          )
                        )}
                      </div>
                    </section>
                  )}

                {selectedTenure &&
                  previousMembers[selectedTenure]?.coreTeam &&
                  previousMembers[selectedTenure]!.coreTeam!.length > 0 && (
                    <section className="mb-12">
                      <SectionHeader
                        title="Core team"
                        description="Squad from that tenure"
                        count={previousMembers[selectedTenure]!.coreTeam!.length}
                        icon={Sparkles}
                      />
                      <MemberGrid>
                        {previousMembers[selectedTenure]!.coreTeam!.map(
                          (member) => (
                            <MemberCard
                              key={`prev-core-${selectedTenure}-${member.id}-${member.name}`}
                              member={member}
                              onOpen={openMember}
                            />
                          )
                        )}
                      </MemberGrid>
                    </section>
                  )}

                {selectedTenure &&
                  previousMembers[selectedTenure]?.webDevTeam &&
                  previousMembers[selectedTenure]!.webDevTeam!.length > 0 && (
                    <section className="mb-8">
                      <SectionHeader
                        title="Web team"
                        description="Digital foundation"
                        count={
                          previousMembers[selectedTenure]!.webDevTeam!.length
                        }
                        icon={Code2}
                      />
                      <MemberGrid>
                        {previousMembers[selectedTenure]!.webDevTeam!.map(
                          (member) => (
                            <MemberCard
                              key={`prev-web-${selectedTenure}-${member.id}-${member.name}`}
                              member={member}
                              onOpen={openMember}
                            />
                          )
                        )}
                      </MemberGrid>
                    </section>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MemberDetail
        member={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <Dialog open={recruitClosedOpen} onOpenChange={setRecruitClosedOpen}>
        <DialogContent className="border-white/15 bg-[#0F1013]/95 backdrop-blur-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Recruitment closed</DialogTitle>
            <DialogDescription className="text-slate-300">
              We aren&apos;t recruiting at the moment. Keep an eye out for
              announcements on Instagram and campus channels.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
