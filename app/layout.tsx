import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { CustomCursor } from "@/components/custom-cursor"
import { InteractiveBackground } from "@/components/interactive-background"
import ScrollProgress from "@/components/scroll-progress"
import { ContextMenuBlocker } from "@/components/context-menu-blocker"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://iris-society.iitmbs.org"),
  title: {
    default: "IRIS Society",
    template: "%s | IRIS Society",
  },
  description:
    "Join IRIS Society, the premier photography and videography club dedicated to capturing moments and creating memories through the art of photography and videography.",
  keywords: "photography, club, IRIS, society, camera, photos, community, IIT Madras BS",
  authors: [{ name: "IRIS Society" }],
  icons: {
    icon: [
      { url: "/images/favicon (2).png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon (2).png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/images/favicon (2).png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "IRIS Society",
    description:
      "Join IRIS Society, the premier photography and videography society dedicated to capturing moments and creating memories through the art of your camera.",
    type: "website",
    url: "https://iris-society.iitmbs.org",
    siteName: "IRIS Society",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "IRIS Society Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IRIS Society",
    description:
      "Join IRIS Society, the premier photography and videography society dedicated to capturing moments and creating memories through the art of photography.",
    images: ["/logo.png"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F1013",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-dvh overflow-x-clip`}>
        <div className="relative min-h-dvh flex flex-col overflow-x-clip max-w-[100vw]">
          <ContextMenuBlocker />
          <InteractiveBackground />
          <CustomCursor />
          <ScrollProgress />
          <Navbar />
          <main id="main-content" className="relative z-10 flex-1 flex flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
