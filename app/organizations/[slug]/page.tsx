import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import FilterBar from '@/components/loans/FilterBar'
import OffersList from '@/components/loans/OffersList'
import Reviews from '@/components/loans/Reviews'
import JsonLd from '@/components/seo/JsonLd'
import { generateOffers, filterSortPaginate, makeOfferSlug, type LoanOffer } from '@/src/lib/loans'
import { parseLoanQuery, buildQueryHref } from '@/src/lib/loan-query'
import { generateReviews } from '@/src/lib/reviews'
import { buildPageMetadata, breadcrumbsJsonLd, itemListJsonLd, reviewJsonLd, loanFinancialProductJsonLd, absoluteUrl } from '@/src/lib/seo'
import { slugify } from '@/src/lib/utils'

interface OrganizationData {
  name: string
  slug: string
  offers: LoanOffer[]
}

interface OrganizationSummary {
  totalOffers: number
  averageRating: number
  minRate: number
  maxRate: number
  minAmount: number
  maxAmount: number
  minTerm: number
  maxTerm: number
  payoutTypes: string[]
  requirements: string[]
}

function findOrganizationBySlug(offers: LoanOffer[], slug: string): OrganizationData | null {
  const match = offers.find(o => slugify(o.organization) === slug)
  if (!match) return null
  const name = match.organization
  const orgOffers = offers.filter(o => o.organization === name)
  return { name, slug: slugify(name), offers: orgOffers }
}

function summarizeOffers(offers: LoanOffer[]): OrganizationSummary {
  if (!offers.length) {
    return {
      totalOffers: 0,
      averageRating: 0,
      minRate: 0,
      maxRate: 0,
      minAmount: 0,
      maxAmount: 0,
      minTerm: 0,
      maxTerm: 0,
      payoutTypes: [],
      requirements: [],
    }
  }

  const totalOffers = offers.length
  const ratingSum = offers.reduce((acc, offer) => acc + offer.rating, 0)
  const averageRating = Math.round((ratingSum / totalOffers) * 10) / 10
  const minRate = Math.min(...offers.map(o => o.rateFrom))
  const maxRate = Math.max(...offers.map(o => o.rateTo))
  const minAmount = Math.min(...offers.map(o => o.amountMin))
  const maxAmount = Math.max(...offers.map(o => o.amountMax))
  const minTerm = Math.min(...offers.map(o => o.termMin))
  const maxTerm = Math.max(...offers.map(o => o.termMax))
  const payoutTypes = Array.from(new Set(offers.flatMap(o => o.payoutTypes))).sort()
  const requirements = Array.from(new Set(offers.flatMap(o => o.requirements))).sort()

  return {
    totalOffers,
    averageRating,
    minRate,
    maxRate,
    minAmount,
    maxAmount,
    minTerm,
    maxTerm,
    payoutTypes,
    requirements,
  }
}

function buildDescription(name: string, summary: OrganizationSummary): string {
  if (!summary.totalOffers) {
    return `${name}: предложения по займам`
  }
  const parts = [
    `${summary.totalOffers} предложений`,
    `ставка от ${summary.minRate.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}%`,
    `сумма до ${summary.maxAmount.toLocaleString('ru-RU')} ₽`,
  ]
  return `${name}: ${parts.join(', ')}`
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const offers = generateOffers(120)
  const organization = findOrganizationBySlug(offers, params.slug)

  if (!organization) {
    return buildPageMetadata({
      title: 'Организация — не найдена',
      path: `/organizations/${params.slug}`,
    })
  }

  const summary = summarizeOffers(organization.offers)
  const description = buildDescription(organization.name, summary)

  return buildPageMetadata({
    title: `${organization.name} — предложения и условия`,
    description,
    path: `/organizations/${organization.slug}`,
  })
}

export default function OrganizationDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const allOffers = generateOffers(120)
  const organization = findOrganizationBySlug(allOffers, params.slug)
  if (!organization) return notFound()

  const summary = summarizeOffers(organization.offers)
  const query = parseLoanQuery(searchParams)
  const result = filterSortPaginate(organization.offers, query)

  const queryParams = new URLSearchParams()
  if (query.amount) queryParams.set('amount', String(query.amount))
  if (query.term) queryParams.set('term', String(query.term))
  if (query.maxRate) queryParams.set('maxRate', String(query.maxRate))
  if (query.payoutType) queryParams.set('payoutType', String(query.payoutType))
  if (query.requirements?.length) {
    query.requirements.forEach(r => queryParams.append('requirements', r))
  }
  if (query.sortBy) queryParams.set('sortBy', String(query.sortBy))
  if (query.order) queryParams.set('order', String(query.order))
  if (query.perPage) queryParams.set('perPage', String(query.perPage))

  const basePath = `/organizations/${organization.slug}`
  const prevHref = result.page > 1 ? buildQueryHref(basePath, queryParams, { page: String(result.page - 1) }) : null
  const nextHref = result.page < result.totalPages
    ? buildQueryHref(basePath, queryParams, { page: String(result.page + 1) })
    : null

  const reviewCount = Math.min(5, Math.max(3, summary.totalOffers))
  const reviews = generateReviews(`org-${organization.slug}`, reviewCount)

  const stats = [
    { label: 'Средний рейтинг', value: `${summary.averageRating.toFixed(1)} / 5` },
    { label: 'Предложений', value: summary.totalOffers.toString() },
    { label: 'Ставка от', value: `${summary.minRate.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}%` },
    { label: 'Макс. сумма', value: `${summary.maxAmount.toLocaleString('ru-RU')} ₽` },
  ]

  const breadcrumbs = breadcrumbsJsonLd([
    { name: 'Главная', item: '/' },
    { name: 'Организации' },
    { name: organization.name },
  ])
  const listJsonLd = itemListJsonLd(
    result.items.map(it => ({ name: it.title, url: `/loans/${makeOfferSlug(it)}` })),
  )
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: organization.name,
    url: absoluteUrl(basePath),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: summary.averageRating,
      reviewCount: reviews.length,
    },
    areaServed: 'RU',
    makesOffer: result.items.slice(0, 3).map(it => ({
      '@type': 'LoanOrCredit',
      name: it.title,
      url: absoluteUrl(`/loans/${makeOfferSlug(it)}`),
      interestRate: it.rateFrom,
      amount: {
        '@type': 'MonetaryAmount',
        minValue: it.amountMin,
        maxValue: it.amountMax,
        currency: 'RUB',
      },
    })),
  }
  const productJsonLd = result.items.slice(0, 2).map(it =>
    loanFinancialProductJsonLd({
      name: it.title,
      brand: organization.name,
      url: `/loans/${makeOfferSlug(it)}`,
      interestRate: it.rateFrom,
      amountMin: it.amountMin,
      amountMax: it.amountMax,
      aggregateRating: { ratingValue: it.rating, reviewCount: 0 },
    }),
  )
  const reviewJson = reviews[0]
    ? reviewJsonLd({
        itemName: organization.name,
        author: reviews[0].author,
        reviewBody: reviews[0].comment,
        ratingValue: reviews[0].rating,
        datePublished: reviews[0].date,
        url: basePath,
      })
    : null

  return (
    <section className="space-y-5">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Организации' }, { label: organization.name }]} />

      <header className="rounded-2xl border bg-gradient-to-br from-indigo-50 to-white p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold sm:text-4xl">{organization.name}</h1>
            <p className="text-gray-700">
              {summary.totalOffers > 0
                ? `Средний рейтинг ${summary.averageRating.toFixed(1)} из 5. ${summary.totalOffers} предложений со ставкой от ${summary.minRate.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}% и суммой до ${summary.maxAmount.toLocaleString('ru-RU')} ₽.`
                : 'Пока нет активных предложений.'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map(stat => (
              <div key={stat.label} className="rounded-lg border bg-white/70 p-3 text-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <FilterBar
        action={basePath}
        initial={{
          amount: query.amount,
          term: query.term,
          maxRate: query.maxRate,
          payoutType: query.payoutType,
          requirements: query.requirements,
          sortBy: query.sortBy,
          order: query.order,
          perPage: query.perPage,
        }}
      />

      <OffersList
        items={result.items}
        total={result.total}
        page={result.page}
        perPage={result.perPage}
        totalPages={result.totalPages}
        prevHref={prevHref}
        nextHref={nextHref}
      />

      <section className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Основные параметры</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>Сумма: {summary.minAmount.toLocaleString('ru-RU')}–{summary.maxAmount.toLocaleString('ru-RU')} ₽</li>
            <li>Срок: {summary.minTerm}–{summary.maxTerm} месяцев</li>
            <li>Ставка: {summary.minRate.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}%–{summary.maxRate.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}% годовых</li>
          </ul>
        </div>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold">Способы выплаты</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {summary.payoutTypes.map(type => (
                <span key={type} className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                  {type}
                </span>
              ))}
              {summary.payoutTypes.length === 0 ? <span className="text-gray-500">—</span> : null}
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Требования к заемщику</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {summary.requirements.map(req => (
                <span key={req} className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                  {req}
                </span>
              ))}
              {summary.requirements.length === 0 ? <span className="text-gray-500">—</span> : null}
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-lg border bg-white p-4 text-sm text-gray-700">
        <div className="font-medium">Отзывы об организации</div>
        <p className="mt-1 text-gray-600">
          Средний рейтинг {summary.averageRating.toFixed(1)} на основе {reviews.length} {reviews.length === 1 ? 'отзыва' : 'отзывов'}.
        </p>
      </div>

      <Reviews items={reviews} />

      <section className="prose max-w-none prose-h2:mt-6">
        <h2>О компании {organization.name}</h2>
        <p>
          {organization.name} предлагает онлайн-займы с гибкими условиями. Используйте фильтры выше, чтобы подобрать
          предложение по сумме, сроку, ставке и требованиям. Перед оформлением внимательно изучайте договор и учитывайте
          индивидуальные условия, которые может предложить организация.
        </p>
        <p>
          Мы обновляем данные регулярно, чтобы вы могли сравнить все доступные варианты и выбрать подходящий. Решение по
          заявке принимает {organization.name} на основе внутренней скоринговой модели.
        </p>
      </section>

      <JsonLd data={breadcrumbs} id="breadcrumbs-jsonld" />
      <JsonLd data={listJsonLd} id="itemlist-jsonld" />
      <JsonLd data={organizationJsonLd} id="organization-jsonld" />
      {productJsonLd.map((data, idx) => (
        <JsonLd key={idx} data={data} id={`organization-offer-jsonld-${idx}`} />
      ))}
      {reviewJson ? <JsonLd data={reviewJson} id="organization-review-jsonld" /> : null}
    </section>
  )
}
