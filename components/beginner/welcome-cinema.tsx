"use client"

import { motion } from "framer-motion"
import RisingWords from "@/components/beginner/rising-words"
import { bmEase, bmEaseOut } from "@/lib/beginner/motion"

type Props = {
  reducedMotion: boolean
  isPhone: boolean
  onContinue: () => void
  onSkip: () => void
}

export default function WelcomeCinema({
  reducedMotion,
  isPhone,
  onContinue,
  onSkip,
}: Props) {
  // Phone: taller rise, slower stagger = more cinematic
  const rise = isPhone ? 48 : 36
  const wordStagger = isPhone ? 0.16 : 0.13
  const wordDur = isPhone ? 0.95 : 0.85
  // "Welcome to Beginner Mode" = 4 words → last lands ~ delay + 3*stagger + dur
  const heroDone = reducedMotion ? 0.4 : 0.35 + 3 * wordStagger + wordDur * 0.55
  const leadDelay = heroDone + (isPhone ? 0.2 : 0.15)
  const ctaDelay = leadDelay + (isPhone ? 1.1 : 0.95)

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col">
      {/* Soft horizontal swish accent (ambient layer) */}
      {!reducedMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[42%] h-px w-[min(70vw,420px)] -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scaleX: 0.2 }}
          animate={{ opacity: [0, 0.45, 0], scaleX: [0.2, 1, 1.05] }}
          transition={{ duration: 1.6, ease: bmEase, delay: 0.15 }}
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(168,166,255,0.7), transparent)",
          }}
        />
      )}

      <div
        className={`flex flex-1 flex-col items-center px-6 text-center md:px-12 ${
          isPhone ? "justify-center pb-28" : "justify-center"
        }`}
      >
        <RisingWords
          as="h1"
          text="Welcome to Beginner Mode"
          className="bm-hero-display max-w-[11ch] text-white sm:max-w-[14ch] md:max-w-[16ch]"
          delay={0.28}
          stagger={wordStagger}
          rise={rise}
          duration={wordDur}
          reducedMotion={reducedMotion}
        />

        <motion.div
          className="mt-7 max-w-[22ch] md:mt-9 md:max-w-md"
          initial={false}
        >
          <RisingWords
            as="p"
            text="Learn photography and videography one clear step at a time."
            className="bm-lead text-slate-300/90"
            delay={leadDelay}
            stagger={isPhone ? 0.07 : 0.055}
            rise={isPhone ? 28 : 20}
            duration={0.7}
            reducedMotion={reducedMotion}
          />
        </motion.div>

        {!isPhone && (
          <motion.button
            type="button"
            onClick={onContinue}
            className="btn-primary mt-14 !min-h-[48px] !px-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: bmEaseOut, delay: ctaDelay }}
          >
            Continue
          </motion.button>
        )}
      </div>

      {isPhone ? (
        <div className="bm-dock absolute inset-x-0 bottom-0 px-5">
          <motion.button
            type="button"
            onClick={onContinue}
            className="btn-primary w-full !min-h-[52px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: bmEaseOut, delay: ctaDelay }}
          >
            Continue
          </motion.button>
          <motion.button
            type="button"
            onClick={onSkip}
            className="mt-2 w-full py-3 text-center text-sm text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: ctaDelay + 0.15 }}
          >
            Skip
          </motion.button>
        </div>
      ) : (
        <motion.div
          className="bm-safe-bottom absolute bottom-0 left-0 right-0 flex justify-center pb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: ctaDelay + 0.2 }}
        >
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full px-4 py-2 text-sm text-slate-600 transition hover:text-slate-300"
          >
            Skip
          </button>
        </motion.div>
      )}
    </div>
  )
}
