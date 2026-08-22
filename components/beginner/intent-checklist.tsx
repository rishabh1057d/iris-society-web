"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { CHECKLIST, type ChecklistId } from "@/lib/beginner/content"
import { bmEaseOut } from "@/lib/beginner/motion"
import RisingWords from "@/components/beginner/rising-words"
import { cn } from "@/lib/utils"

type Props = {
  selected: ChecklistId[]
  isPhone: boolean
  onToggle: (id: ChecklistId) => void
  onContinue: () => void
  onSkip: () => void
}

export default function IntentChecklist({
  selected,
  isPhone,
  onToggle,
  onContinue,
  onSkip,
}: Props) {
  const canContinue = selected.length > 0

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col">
      <div
        className={cn(
          "mx-auto flex w-full max-w-lg flex-1 flex-col px-5 md:max-w-md md:px-8",
          isPhone ? "justify-start pt-4 pb-36" : "justify-center",
        )}
      >
        <RisingWords
          as="h2"
          text="What do you want to learn?"
          className="bm-display-md justify-start text-left text-white md:justify-center md:text-center"
          delay={0.12}
          stagger={isPhone ? 0.1 : 0.08}
          rise={isPhone ? 32 : 24}
          duration={0.75}
        />

        <motion.p
          className="bm-body mt-3 text-left text-slate-500 md:text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: bmEaseOut, delay: 0.55 }}
        >
          Pick what matters. Skip anytime.
        </motion.p>

        <ul className="mt-8 space-y-2.5 md:mt-10" role="list">
          {CHECKLIST.map((item, i) => {
            const active = selected.includes(item.id)
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: isPhone ? 28 : 18, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.7,
                  ease: bmEaseOut,
                  delay: 0.45 + i * (isPhone ? 0.09 : 0.07),
                }}
              >
                <button
                  type="button"
                  onClick={() => onToggle(item.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full min-h-[56px] items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition md:min-h-[52px]",
                    active
                      ? "border-[#5b59f0]/45 bg-[#3230e0]/18"
                      : "border-transparent bg-white/[0.03] hover:bg-white/[0.06]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
                      active
                        ? "border-[#8b89ff] bg-[#3230e0] text-white"
                        : "border-white/20 text-transparent",
                    )}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="bm-body-strong text-white">{item.label}</span>
                </button>
              </motion.li>
            )
          })}
        </ul>

        {!isPhone && (
          <motion.div
            className="mt-12 flex flex-col items-stretch gap-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: bmEaseOut, delay: 1.0 }}
          >
            <button
              type="button"
              onClick={onContinue}
              disabled={!canContinue}
              className={cn(
                "btn-primary !min-h-[48px]",
                !canContinue && "pointer-events-none opacity-35",
              )}
            >
              Continue
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="py-2 text-sm text-slate-600 transition hover:text-slate-300"
            >
              Skip
            </button>
          </motion.div>
        )}
      </div>

      {isPhone && (
        <motion.div
          className="bm-dock absolute inset-x-0 bottom-0 border-t border-white/5 bg-[#0F1013]/80 px-5 pt-3 backdrop-blur-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: bmEaseOut, delay: 0.9 }}
        >
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className={cn(
              "btn-primary w-full !min-h-[52px]",
              !canContinue && "pointer-events-none opacity-35",
            )}
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="mt-1 w-full py-3 text-center text-sm text-slate-500"
          >
            Skip
          </button>
        </motion.div>
      )}
    </div>
  )
}
