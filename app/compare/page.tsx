import type { Metadata } from 'next'
import Breadcrumbs from '@/components/Breadcrumbs'
import PageHeader from '@/components/PageHeader'
import LoanCompareView from '@/components/loans/LoanCompareView'
import { generateOffers } from '@/src/lib/loans'
import { clampOfferIds, parseOfferIdsParam } from '@/src/lib/compare'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Сравнение займов — найдите лучшее предложение',
  description:
    'Сравните ставки, суммы, сроки и требования по займам. Добавляйте и удаляйте офферы, делитесь ссылкой и выбирайте лучшее.',
  path: '/compare',
})

export default function ComparePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const allOffers = generateOffers(120)
  const allowedIds = new Set(allOffers.map((offer) => offer.id))
  const initialSelectedIds = clampOfferIds(parseOfferIdsParam(searchParams.offers), allowedIds)

  return (
    <section className="space-y-6">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Сравнение займов' }]} />
      <PageHeader
        title="Сравнение займов"
        subtitle="Добавьте несколько предложений, чтобы увидеть лучшие ставки и условия в одной таблице"
      />

      <LoanCompareView allOffers={allOffers} initialSelectedIds={initialSelectedIds} />

      <section className="prose max-w-none prose-h2:mt-6">
        <h2>Зачем нужна таблица сравнения</h2>
        <p>
          Чтобы выбрать выгодный займ, важно учитывать не только ставку, но и доступную сумму, срок, способы получения
          и требования к заемщику. В сравнительной таблице все ключевые параметры собраны на одной странице, а лучшие
          значения подсвечены.
        </p>
        <p>
          Поделитесь ссылкой с коллегами или сохраните ее, чтобы вернуться к подборке позже. Сервис поддерживает до четырёх
          предложений в сравнении одновременно.
        </p>
      </section>
    </section>
  )
}
