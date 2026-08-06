/**
 * Apple-style spring presets for Framer Motion.
 * Default: critically damped (no bounce). Use bounce only for momentum gestures.
 */
export const spring = {
  /** Default UI motion — damping 1.0 / response ~0.4s */
  default: { type: "spring" as const, bounce: 0, duration: 0.4 },
  /** Snappier UI (sheets, menus) — response ~0.3s */
  snappy: { type: "spring" as const, bounce: 0, duration: 0.3 },
  /** Soft settle for large surfaces */
  soft: { type: "spring" as const, bounce: 0, duration: 0.5 },
  /** Momentum / flick only — slight overshoot */
  momentum: { type: "spring" as const, bounce: 0.2, duration: 0.4 },
}

/** Opacity cross-fade for reduced-motion-friendly enters */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: spring.default,
}

/** Subtle rise + fade (critically damped) */
export const riseIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: spring.default,
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring.default,
  },
}
