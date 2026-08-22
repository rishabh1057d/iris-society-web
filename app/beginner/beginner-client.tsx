"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import {
  BEGINNER_MODE_LIVE,
  type BeginnerPhase,
  type ChecklistId,
  type SectionId,
} from "@/lib/beginner/content"
import { bmPhase, bmPhaseReduced } from "@/lib/beginner/motion"
import BeginnerField from "@/components/beginner/beginner-field"
import BeginnerWip from "@/components/beginner/beginner-wip"
import WelcomeCinema from "@/components/beginner/welcome-cinema"
import IntentChecklist from "@/components/beginner/intent-checklist"
import TitleRollHub from "@/components/beginner/title-roll-hub"
import SectionStub from "@/components/beginner/section-stub"
import "@/components/beginner/beginner.css"

export default function BeginnerClient() {
  if (!BEGINNER_MODE_LIVE) return <BeginnerWip />
  return <BeginnerExperience />
}

function BeginnerExperience() {
  const [phase, setPhase] = useState<BeginnerPhase>("welcome")
  const [selectedGoals, setSelectedGoals] = useState<ChecklistId[]>([])
  const [sectionId, setSectionId] = useState<SectionId | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isPhone, setIsPhone] = useState(true)

  useEffect(() => {
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    const mqPhone = window.matchMedia("(max-width: 767px)")
    setReducedMotion(mqReduce.matches)
    setIsPhone(mqPhone.matches)
    const onReduce = () => setReducedMotion(mqReduce.matches)
    const onPhone = () => setIsPhone(mqPhone.matches)
    mqReduce.addEventListener("change", onReduce)
    mqPhone.addEventListener("change", onPhone)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      mqReduce.removeEventListener("change", onReduce)
      mqPhone.removeEventListener("change", onPhone)
      document.body.style.overflow = prev
    }
  }, [])

  const toggleGoal = useCallback((id: ChecklistId) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    )
  }, [])

  const goHub = useCallback(() => {
    setSectionId(null)
    setPhase("hub")
  }, [])

  const onRollComplete = useCallback(() => {
    setPhase("hub")
  }, [])

  const openSection = useCallback((id: SectionId) => {
    setSectionId(id)
    setPhase("section")
  }, [])

  const phaseMotion = reducedMotion ? bmPhaseReduced : bmPhase

  return (
    <div className="beginner-root relative flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-[#0F1013]">
      <BeginnerField />

      <div className="bm-safe-top absolute left-0 top-0 z-30 px-4 md:px-6">
        <Link
          href="/"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95"
          aria-label="Exit Beginner Mode"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </Link>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col pt-12 md:pt-14">
        <AnimatePresence mode="wait">
          {phase === "welcome" && (
            <motion.div
              key="welcome"
              className="flex min-h-0 flex-1 flex-col"
              {...phaseMotion}
            >
              <WelcomeCinema
                reducedMotion={reducedMotion}
                isPhone={isPhone}
                onContinue={() => setPhase("checklist")}
                onSkip={goHub}
              />
            </motion.div>
          )}

          {phase === "checklist" && (
            <motion.div
              key="checklist"
              className="flex min-h-0 flex-1 flex-col"
              {...phaseMotion}
            >
              <IntentChecklist
                selected={selectedGoals}
                isPhone={isPhone}
                onToggle={toggleGoal}
                onContinue={() => setPhase("hub-roll")}
                onSkip={goHub}
              />
            </motion.div>
          )}

          {(phase === "hub-roll" || phase === "hub") && (
            <motion.div
              key={phase === "hub-roll" ? "hub-roll" : "hub"}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto"
              {...phaseMotion}
            >
              <TitleRollHub
                mode={phase === "hub-roll" ? "roll" : "hub"}
                reducedMotion={reducedMotion}
                isPhone={isPhone}
                onRollComplete={onRollComplete}
                onSkip={goHub}
                onOpenSection={openSection}
              />
            </motion.div>
          )}

          {phase === "section" && sectionId && (
            <motion.div
              key={`section-${sectionId}`}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto"
              {...phaseMotion}
            >
              <SectionStub sectionId={sectionId} onBack={goHub} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
