import type { Metadata } from 'next'
import './globals.css'
import AnalyticsScripts from '@/components/analytics/AnalyticsScripts'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Sidebar from '@/components/layout/Sidebar'
import JsonLd from '@/components/seo/JsonLd'
import { siteConfig, organizationJsonLd } from '@/src/lib/seo'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.siteUrl,
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    locale: siteConfig.locale,
  },
  twitter: {
    card: siteConfig.twitter.card,
    site: siteConfig.twitter.site,
    creator: siteConfig.twitter.creator,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <JsonLd data={organizationJsonLd()} id="org-jsonld" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AnalyticsScripts />
        <div className="flex min-h-screen flex-col">
          <Nav />
          <main id="content" className="container mx-auto flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8 xl:col-span-9">{children}</div>
              <aside className="lg:col-span-4 xl:col-span-3">
                <Sidebar />
              </aside>
            </div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
