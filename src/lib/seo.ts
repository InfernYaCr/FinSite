import type { Metadata } from 'next'

// Central site SEO configuration
export const siteConfig = {
  name: 'Пример Next.js 14 (RU)',
  description:
    'Минимальный SSR-проект на Next.js 14 с локалью ru, демонстрирующий фильтры и каталог займов.',
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000',
  locale: 'ru_RU',
  twitter: {
    card: 'summary_large_image' as const,
    site: '@example',
    creator: '@example',
  },
  organization: {
    name: 'Demo Fintech LLC',
    legalName: 'Demo Fintech LLC',
    url:
      process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000',
    logo: '/logo.png',
    sameAs: [
      'https://twitter.com/example',
      'https://www.facebook.com/example',
      'https://www.linkedin.com/company/example',
    ],
  },
}

export function absoluteUrl(path = '/') {
  const base = siteConfig.siteUrl.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export function buildCanonical(path: string) {
  return new URL(absoluteUrl(path))
}

// Helper: build Metadata for a page
export function buildPageMetadata({
  title,
  description,
  path,
  images,
}: {
  title: string
  description?: string
  path: string
  images?: string | string[]
}): Metadata {
  const url = absoluteUrl(path)
  const ogImages = images
    ? Array.isArray(images)
      ? images.map(src => ({ url: src }))
      : [{ url: images }]
    : undefined

  return {
    title,
    description: description ?? siteConfig.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title,
      description: description ?? siteConfig.description,
      url,
      locale: siteConfig.locale,
      images: ogImages,
    },
    twitter: {
      card: siteConfig.twitter.card,
      site: siteConfig.twitter.site,
      creator: siteConfig.twitter.creator,
      title,
      description: description ?? siteConfig.description,
      images: ogImages?.map(i => (typeof i === 'string' ? i : i.url)),
    },
  }
}

// JSON-LD builders
export type JsonLd = Record<string, unknown>

export function jsonLdScript(data: JsonLd) {
  return JSON.stringify(data)
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.organization.name,
    legalName: siteConfig.organization.legalName,
    url: siteConfig.organization.url,
    logo: absoluteUrl(siteConfig.organization.logo),
    sameAs: siteConfig.organization.sameAs,
  }
}

export function breadcrumbsJsonLd(items: { name: string; item?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: it.item ? absoluteUrl(it.item) : undefined,
    })),
  }
}

// Financial product (loan) JSON-LD (more accurate than generic Product)
export function loanFinancialProductJsonLd(input: {
  name: string
  brand: string
  description?: string
  url: string
  interestRate?: number
  amountMin?: number
  amountMax?: number
  aggregateRating?: { ratingValue: number; reviewCount: number }
}) {
  const data: any = {
    '@context': 'https://schema.org',
    '@type': 'LoanOrCredit',
    name: input.name,
    brand: {
      '@type': 'Brand',
      name: input.brand,
    },
    url: input.url,
  }
  if (input.description) data.description = input.description
  if (typeof input.interestRate === 'number') data.interestRate = input.interestRate
  if (typeof input.amountMin === 'number' || typeof input.amountMax === 'number') {
    data.amount = {
      '@type': 'MonetaryAmount',
      minValue: input.amountMin,
      maxValue: input.amountMax,
      currency: 'RUB',
    }
  }
  if (input.aggregateRating) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.aggregateRating.ratingValue,
      reviewCount: input.aggregateRating.reviewCount,
    }
  }
  return data
}

export function reviewJsonLd(input: {
  itemName: string
  author: string
  reviewBody: string
  ratingValue: number
  datePublished?: string
  url?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Thing',
      name: input.itemName,
      url: input.url ? absoluteUrl(input.url) : undefined,
    },
    author: {
      '@type': 'Person',
      name: input.author,
    },
    reviewBody: input.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: input.ratingValue,
      bestRating: 5,
      worstRating: 1,
    },
    datePublished: input.datePublished,
  }
}

export function itemListJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: absoluteUrl(it.url),
      name: it.name,
    })),
  }
}
