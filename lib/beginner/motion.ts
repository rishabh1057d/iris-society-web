/** Premium Beginner Mode motion - Apple-like decelerate, no bounce. */

export const bmEase = [0.22, 1, 0.36, 1] as const // smooth settle
export const bmEaseOut = [0.16, 1, 0.3, 1] as const // soft arrival
export const bmEaseIn = [0.4, 0, 1, 1] as const // quiet exit

export const bmPhase = {
  initial: { opacity: 0, y: 28, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -18, filter: "blur(6px)" },
  transition: { duration: 0.7, ease: bmEase },
}

export const bmPhaseReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25 },
}
