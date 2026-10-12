import { MetadataRoute } from 'next'
import { publicLanding } from '@/lib/potw/server'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const baseUrl = 'https://iris-society.iitmbs.org';
  const potw = await publicLanding();

  return [
    ...potw.competitions.map(c => ({ url: `${baseUrl}/potw/competitions/${c.id}`, lastModified: new Date(c.updated_at), changeFrequency: 'weekly' as const, priority: 0.6 })),
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/beginner`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
        url: `${baseUrl}/events`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.7,
    },
    {
        url: `${baseUrl}/gallery`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.7,
    },
    {
        url: `${baseUrl}/join`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.5,
    },
    {
        url: `${baseUrl}/potw`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.7,
    },
    {
        url: `${baseUrl}/team`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.8,
    },
  ]
}
