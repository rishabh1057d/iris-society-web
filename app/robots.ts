import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === 'preview') return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/potw/my-submissions', '/potw/submit/', '/potw/competitions/*/vote'],
    },
    sitemap: 'https://iris-society.iitmbs.org/sitemap.xml',
  }
}
