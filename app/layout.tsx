import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { CustomCursor } from "@/components/custom-cursor"
import { InteractiveBackground } from "@/components/interactive-background"
import ScrollProgress from "@/components/scroll-progress"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IRIS Society",
  description:
    "Join IRIS Society, the premier photography club dedicated to capturing moments and creating memories through the art of photography.",
  keywords: "photography, club, IRIS, society, camera, photos, community",
  authors: [{ name: "IRIS Society" }],
  openGraph: {
    title: "IRIS Society",
    description:
      "Join IRIS Society, the premier photography club dedicated to capturing moments and creating memories through the art of photography.",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <div className="relative min-h-screen flex flex-col">
          <InteractiveBackground />
          <CustomCursor />
          <ScrollProgress />
          <Navbar />
          <main className="relative z-10 flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
