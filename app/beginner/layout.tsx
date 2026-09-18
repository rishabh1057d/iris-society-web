import type { ReactNode } from "react"
import { Cormorant_Garamond, Manrope } from "next/font/google"

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-bm-display",
})

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-bm-body",
})

/**
 * Immersive Beginner Mode shell.
 * Site Navbar / ScrollProgress hide via pathname gates.
 * No Footer is mounted here.
 */
export default function BeginnerLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${display.variable} ${body.variable} fixed inset-0 z-[200] max-w-[100vw] overflow-hidden bg-[#0F1013]`}
    >
      {children}
    </div>
  )
}
