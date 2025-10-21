import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import LoanCard from '@/components/loans/LoanCard'
import JsonLd from '@/components/seo/JsonLd'
import { buildPageMetadata, itemListJsonLd } from '@/src/lib/seo'
import { generateOffers } from '@/src/lib/loans'

export const metadata: Metadata = buildPageMetadata({
  title: 'Главная',
  description:
    'Онлайн займы: сравнение предложений, калькулятор платежей и лучшие офферы. Быстрый SSR и оптимизированная загрузка для хороших LCP/CLS.',
  path: '/',
})

const LoanCalculatorClient = dynamic(() => import('@/components/loans/LoanCalculator'), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-[320px] animate-pulse rounded-lg border p-4"
      role="status"
      aria-busy="true"
      aria-label="Загрузка калькулятора"
    >
      <div className="mb-3 h-5 w-44 rounded bg-gray-200" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="h-2 rounded bg-gray-200" />
          <div className="h-9 rounded bg-gray-200" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-2 rounded bg-gray-200" />
          <div className="h-9 rounded bg-gray-200" />
        </div>
        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
          <div className="h-16 rounded bg-gray-200" />
          <div className="h-16 rounded bg-gray-200" />
          <div className="h-16 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  ),
})

export default function HomePage() {
  const offers = generateOffers(80)
  const featured = offers.sort((a, b) => b.rating - a.rating).slice(0, 10)

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border bg-gradient-to-br from-indigo-50 to-white p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold sm:text-4xl">
              Онлайн займы — сравнение и калькулятор
            </h1>
            <p className="mt-3 text-gray-700">
              Подберите займ по сумме, сроку и ставке. Рассчитайте ежемесячный платеж и изучите
              лучшие предложения.
            </p>
            <div className="mt-4">
              <a
                href="/loans"
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Смотреть каталог
              </a>
            </div>
          </div>
          <div aria-label="Калькулятор займа" className="lg:justify-self-end">
            <LoanCalculatorClient offer={featured[0]} />
          </div>
        </div>
      </header>

      <section aria-labelledby="featured-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="featured-title" className="text-xl font-semibold">
            Популярные предложения
          </h2>
          <a href="/loans" className="text-sm text-indigo-700 hover:underline">
            Все предложения
          </a>
        </div>
        <div className="-mx-4 px-4">
          <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {featured.map((o) => (
              <li key={o.id} className="min-w-[280px] snap-start sm:min-w-[320px]">
                <LoanCard offer={o} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="prose max-w-none prose-h2:mt-6">
        <h2>Как это работает</h2>
        <p>
          Укажите желаемую сумму и срок в калькуляторе, затем перейдите в каталог, чтобы подобрать
          предложение с подходящей ставкой и способом выплаты.
        </p>
        <h2>Полезно знать</h2>
        <p>
          Итоговые условия зависят от проверки анкеты и внутренних правил организации. Всегда
          изучайте договор и полную стоимость кредита.
        </p>
      </section>

      <JsonLd
        data={itemListJsonLd(featured.map((it) => ({ name: it.title, url: '/loans' })))}
        id="featured-itemlist"
      />
    </section>
  )
}
