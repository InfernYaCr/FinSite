import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/src/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = absoluteUrl('/sitemap.xml')
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/go/'],
      },
    ],
    sitemap: sitemapUrl,
  }
}
