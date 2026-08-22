import type { ReactNode } from "react"

/**
 * Immersive Beginner Mode shell.
 * Site Navbar / ScrollProgress hide via pathname gates.
 * No Footer is mounted here.
 */
export default function BeginnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[200] max-w-[100vw] overflow-hidden bg-[#0F1013]">
      {children}
    </div>
  )
}
