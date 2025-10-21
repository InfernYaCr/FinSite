import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import OfferHeader from '@/components/loans/OfferHeader'
import LoanCalculator from '@/components/loans/LoanCalculator'
import Reviews from '@/components/loans/Reviews'
import RelatedOffers from '@/components/loans/RelatedOffers'
import JsonLd from '@/components/seo/JsonLd'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { buildPageMetadata, breadcrumbsJsonLd, loanFinancialProductJsonLd, reviewJsonLd } from '@/src/lib/seo'
import { generateOffers, findOfferBySlug, makeOfferSlug, type LoanOffer } from '@/src/lib/loans'

function generateReviews(seed: string, count = 3) {
  // Simple deterministic pseudo-random based on seed
  let s = 0
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0
  function rand() {
    s = (1664525 * s + 1013904223) >>> 0
    return s / 0xffffffff
  }
  const authors = ['Алексей', 'Мария', 'Иван', 'Ольга', 'Дмитрий', 'Елена']
  const comments = [
    'Быстро одобрили, условия прозрачные.',
    'Удобно, но ставку хотелось бы ниже.',
    'Оформление заняло 10 минут, всё ок.',
    'Поддержка отвечает быстро, впечатления положительные.',
    'Хороший сервис, деньги пришли на карту.',
  ]
  const items = [] as { id: string; author: string; rating: number; comment: string; date: string }[]
  const n = Math.max(2, Math.min(count, 5))
  for (let i = 0; i < n; i++) {
    items.push({
      id: `${seed}_${i}`,
      author: authors[Math.floor(rand() * authors.length)],
      rating: 3 + Math.round(rand() * 2),
      comment: comments[Math.floor(rand() * comments.length)],
      date: new Date(Date.now() - Math.floor(rand() * 60) * 24 * 60 * 60 * 1000).toISOString(),
    })
  }
  return items
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const offers = generateOffers(120)
  const offer = findOfferBySlug(offers, params.slug)
  if (!offer) {
    return buildPageMetadata({ title: 'Займ — не найдено', path: `/loans/${params.slug}` })
  }
  return buildPageMetadata({
    title: offer.title,
    description: `${offer.organization}: сумма ${offer.amountMin.toLocaleString('ru-RU')}–${offer.amountMax.toLocaleString('ru-RU')} ₽, ставка от ${offer.rateFrom}%`,
    path: `/loans/${makeOfferSlug(offer)}`,
  })
}

export default function OfferDetailPage({ params }: { params: { slug: string } }) {
  const offers = generateOffers(120)
  const offer = findOfferBySlug(offers, params.slug)
  if (!offer) return notFound()

  const crumbs = breadcrumbsJsonLd([
    { name: 'Главная', item: '/' },
    { name: 'Займы', item: '/loans' },
    { name: offer.title },
  ])
  const productJsonLd = loanFinancialProductJsonLd({
    name: offer.title,
    brand: offer.organization,
    url: `/loans/${makeOfferSlug(offer)}`,
    interestRate: offer.rateFrom,
    amountMin: offer.amountMin,
    amountMax: offer.amountMax,
    aggregateRating: { ratingValue: offer.rating, reviewCount: 0 },
  })

  const reviews = generateReviews(offer.id, 3)
  const related = offers
    .filter((o) => o.id !== offer.id && o.payoutTypes.some((t) => offer.payoutTypes.includes(t)))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)

  return (
    <section className="space-y-4">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Займы', href: '/loans' }, { label: offer.title }]} />

      <OfferHeader offer={offer} />

      <div className="grid gap-4 lg:grid-cols-2">
        <LoanCalculator offer={offer} />

        <Tabs defaultValue="conditions" className="rounded-lg border p-4">
          <TabsList>
            <TabsTrigger value="conditions">Условия</TabsTrigger>
            <TabsTrigger value="requirements">Требования</TabsTrigger>
            <TabsTrigger value="about">О компании</TabsTrigger>
          </TabsList>
          <TabsContent value="conditions" className="mt-3">
            <ul className="list-inside list-disc text-sm text-gray-800">
              <li>Сумма: {offer.amountMin.toLocaleString('ru-RU')}–{offer.amountMax.toLocaleString('ru-RU')} ₽</li>
              <li>Срок: {offer.termMin}–{offer.termMax} месяцев</li>
              <li>Ставка: от {offer.rateFrom}% до {offer.rateTo}% годовых</li>
              <li>Способы выплаты: {offer.payoutTypes.join(', ')}</li>
            </ul>
          </TabsContent>
          <TabsContent value="requirements" className="mt-3">
            <ul className="list-inside list-disc text-sm text-gray-800">
              {offer.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="about" className="mt-3 text-sm text-gray-800">
            <p>
              {offer.organization} — финансовая организация, предлагающая онлайн-займы с быстрым решением.
              Условия подбираются индивидуально на основе анкеты и внутренней скоринговой модели.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <Reviews items={reviews} />

      <RelatedOffers items={related} />

      <JsonLd data={crumbs} id="breadcrumbs-jsonld" />
      <JsonLd data={productJsonLd} id="loan-jsonld" />
      {reviews.length > 0 ? (
        <JsonLd
          data={reviewJsonLd({
            itemName: offer.title,
            author: reviews[0].author,
            reviewBody: reviews[0].comment,
            ratingValue: reviews[0].rating,
            url: `/loans/${makeOfferSlug(offer)}`,
          })}
          id="review-jsonld"
        />
      ) : null}
    </section>
  )
}
