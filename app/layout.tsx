import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { CustomCursor } from "@/components/custom-cursor"
import { InteractiveBackground } from "@/components/interactive-background"
import ScrollProgress from "@/components/scroll-progress"
import { ContextMenuBlocker } from "@/components/context-menu-blocker"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://iris-society-web.vercel.app"),
  title: "IRIS Society",
  description:
    "Join IRIS Society, the premier photography club dedicated to capturing moments and creating memories through the art of photography.",
  keywords: "photography, club, IRIS, society, camera, photos, community",
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
      "Join IRIS Society, the premier photography club dedicated to capturing moments and creating memories through the art of photography.",
    type: "website",
    url: "https://iris-society-web.vercel.app",
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
      "Join IRIS Society, the premier photography and Videography society dedicated to capturing moments and creating memories through the art..",
    images: ["/logo.png"],
  },
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
          <ContextMenuBlocker />
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
