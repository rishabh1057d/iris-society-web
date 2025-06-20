/** @type {import('next').NextConfig} */
import { motion, AnimatePresence, useInView, easeOut } from "framer-motion"

const nextConfig = {
  images: {
    domains: ['placeholder.svg', 'blob.v0.dev'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig
