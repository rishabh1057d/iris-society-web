/** @type {import('next').NextConfig} */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const imagePaths = JSON.parse(readFileSync(new URL('./lib/image-paths.json', import.meta.url), 'utf8'))

const nextConfig = {
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  env: {
    NEXT_PUBLIC_DATABASE_DISABLED: process.env.VERCEL_ENV === 'preview' ? '1' : '0',
  },
  async redirects() {
    return Object.entries(imagePaths).flatMap(([oldPath, destination]) => {
      const encoded = encodeURI(oldPath)
      const fullyEncoded = oldPath.split('/').map(encodeURIComponent).join('/').replace(/\(/g, '%28').replace(/\)/g, '%29')
      return [...new Set([encoded, fullyEncoded])].map((source) => ({
        source: source.replace(/[()*+?:]/g, '\\$&'),
        destination,
        permanent: true,
      }))
    })
  },
  images: {
    // Skip Vercel/Next Image Optimization (/_next/image). Quota was exhausted and
    // optimized URLs were breaking on previews. next/image still lazy-loads.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blob.v0.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
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
