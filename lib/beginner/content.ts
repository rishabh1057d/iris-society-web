/** Flip to true when Beginner Mode is ready to ship publicly. */
export const BEGINNER_MODE_LIVE = true

export const CHECKLIST = [
  { id: "exposure", label: "Exposure and light" },
  { id: "composition", label: "Composition" },
  { id: "camera", label: "Camera basics" },
  { id: "editing", label: "Editing starters" },
  { id: "video", label: "Videography basics" },
] as const

export type ChecklistId = (typeof CHECKLIST)[number]["id"]

export const SECTIONS = [
  {
    id: "tutorials",
    label: "Tutorials",
    image: "/images/golden_hour.png",
    blurb: "Step by step lessons you can follow along",
  },
  {
    id: "guides",
    label: "Guides",
    image: "/images/macro_magiv.png",
    blurb: "Quick answers for the questions you meet on a shoot",
  },
  {
    id: "best",
    label: "Learn from the best",
    image: "/images/shutter_safari_winner.jpg",
    blurb: "Trusted photographers, filmmakers, essays, and channels",
  },
] as const

export type SectionId = (typeof SECTIONS)[number]["id"]

export type BeginnerPhase =
  | "welcome"
  | "checklist"
  | "hub-roll"
  | "hub"
  | "section"
