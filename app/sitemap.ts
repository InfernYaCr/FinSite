import type { MetadataRoute } from 'next'
import { siteConfig, absoluteUrl } from '@/src/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const routes = ['', '/loans']
  return routes.map(path => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1.0 : 0.8,
  }))
}
