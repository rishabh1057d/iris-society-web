import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const baseUrl = 'https://iris-society-web.vercel.app';

  return [
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