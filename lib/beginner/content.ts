/** Flip to true when Beginner Mode is ready to ship publicly. */
export const BEGINNER_MODE_LIVE = false

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
    blurb: "Step by step lessons you can follow along",
  },
  {
    id: "guides",
    label: "Guides",
    blurb: "Practical how-tos for real shoots",
  },
  {
    id: "basics",
    label: "Basics",
    blurb: "Foundations that stick",
  },
  {
    id: "best",
    label: "Learn from the best",
    blurb: "Inspiration and craft from strong work",
  },
] as const

export type SectionId = (typeof SECTIONS)[number]["id"]

export type BeginnerPhase =
  | "welcome"
  | "checklist"
  | "hub-roll"
  | "hub"
  | "section"
