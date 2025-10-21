import type { Metadata } from 'next'
import Breadcrumbs from '@/components/Breadcrumbs'
import PageHeader from '@/components/PageHeader'
import FilterBar from '@/components/loans/FilterBar'
import OffersList from '@/components/loans/OffersList'
import JsonLd from '@/components/seo/JsonLd'
import { generateOffers, filterSortPaginate, type LoanQuery, type BorrowerRequirement, type PayoutType } from '@/src/lib/loans'
import { buildPageMetadata, breadcrumbsJsonLd, itemListJsonLd, loanFinancialProductJsonLd, reviewJsonLd } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Каталог займов — фильтры, сортировка и пагинация',
  description:
    'Выберите подходящий займ: фильтруйте по сумме, сроку, ставке, способу выплаты и требованиям. Сортировка по рейтингу, ставке и сумме.',
  path: '/loans',
})

function parseArrayParam(value: string | string[] | undefined): string[] | undefined {
  if (!value) return undefined
  return Array.isArray(value) ? value : [value]
}

function parseNumber(value: string | string[] | undefined): number | undefined {
  if (!value) return undefined
  const v = Array.isArray(value) ? value[0] : value
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function parseLoanQuery(searchParams: { [key: string]: string | string[] | undefined }): LoanQuery {
  const requirements = parseArrayParam(searchParams.requirements) as BorrowerRequirement[] | undefined
  const payoutType = (Array.isArray(searchParams.payoutType)
    ? searchParams.payoutType[0]
    : searchParams.payoutType) as PayoutType | undefined

  const sortBy = (Array.isArray(searchParams.sortBy)
    ? searchParams.sortBy[0]
    : searchParams.sortBy) as LoanQuery['sortBy']
  const order = (Array.isArray(searchParams.order)
    ? searchParams.order[0]
    : searchParams.order) as LoanQuery['order']

  const perPage = parseNumber(searchParams.perPage)
  const page = parseNumber(searchParams.page)

  return {
    amount: parseNumber(searchParams.amount),
    term: parseNumber(searchParams.term),
    maxRate: parseNumber(searchParams.maxRate),
    payoutType,
    requirements,
    sortBy: sortBy ?? 'rating',
    order: order ?? (sortBy === 'rate' ? 'asc' : 'desc'),
    page: page ?? 1,
    perPage: perPage ?? 10,
  }
}

function buildHref(base: string, params: URLSearchParams, merge: Record<string, string | null>): string {
  const qp = new URLSearchParams(params)
  Object.entries(merge).forEach(([k, v]) => {
    if (v === null) qp.delete(k)
    else qp.set(k, v)
  })
  const qs = qp.toString()
  return qs ? `${base}?${qs}` : base
}

export default function LoansPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const query = parseLoanQuery(searchParams)
  const offers = generateOffers(120)

  const result = filterSortPaginate(offers, query)

  const params = new URLSearchParams()
  if (query.amount) params.set('amount', String(query.amount))
  if (query.term) params.set('term', String(query.term))
  if (query.maxRate) params.set('maxRate', String(query.maxRate))
  if (query.payoutType) params.set('payoutType', String(query.payoutType))
  if (query.requirements?.length) {
    query.requirements.forEach(r => params.append('requirements', r))
  }
  if (query.sortBy) params.set('sortBy', String(query.sortBy))
  if (query.order) params.set('order', String(query.order))
  if (query.perPage) params.set('perPage', String(query.perPage))

  const prevHref = result.page > 1 ? buildHref('/loans', params, { page: String(result.page - 1) }) : null
  const nextHref = result.page < result.totalPages
    ? buildHref('/loans', params, { page: String(result.page + 1) })
    : null

  // Build JSON-LD
  const crumbs = breadcrumbsJsonLd([
    { name: 'Главная', item: '/' },
    { name: 'Займы' },
  ])
  const list = itemListJsonLd(result.items.map(it => ({ name: it.title, url: '/loans' })))
  const products = result.items.slice(0, 3).map(it =>
    loanFinancialProductJsonLd({
      name: it.title,
      brand: it.organization,
      url: '/loans',
      interestRate: it.rateFrom,
      amountMin: it.amountMin,
      amountMax: it.amountMax,
      aggregateRating: { ratingValue: it.rating, reviewCount: 0 },
    })
  )
  const review = result.items[0]
    ? {
        itemName: result.items[0].title,
        author: 'Пользователь',
        reviewBody: 'Хорошие условия и быстрый процесс оформления.',
        ratingValue: result.items[0].rating,
        url: '/loans',
      }
    : null

  return (
    <section className="space-y-4">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Займы' }]} />
      <PageHeader title="Каталог займов" subtitle="Подберите подходящее предложение по займам" />

      <FilterBar
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

      <JsonLd data={crumbs} id="breadcrumbs-jsonld" />
      <JsonLd data={list} id="itemlist-jsonld" />
      {products.map((p, idx) => (
        <JsonLd key={idx} data={p} id={`loan-jsonld-${idx}`} />
      ))}
      {review ? <JsonLd data={reviewJsonLd(review)} id="review-jsonld" /> : null}

      <section className="prose max-w-none prose-h2:mt-6">
        <h2>О займах: что важно знать</h2>
        <p>
          На этой странице собраны предложения МФО и банков с различными условиями: сумма, срок, ставка,
          способы получения и требования к заемщику. Используйте фильтры сверху, чтобы сузить выбор и
          отсортировать варианты по рейтингу, ставке или максимальной сумме.
        </p>
        <p>
          Рекомендуем внимательно читать условия договора и рассчитывать платежи с учетом срока и
          полной стоимости кредита. Для некоторых предложений могут действовать дополнительные акции
          или скидки для новых клиентов.
        </p>
      </section>
    </section>
  )
}
