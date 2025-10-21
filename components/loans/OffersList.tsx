import type { LoanOffer } from '@/src/lib/loans'
import LoanCard from './LoanCard'

export default function OffersList({
  items,
  total,
  page,
  perPage,
  totalPages,
  prevHref,
  nextHref,
}: {
  items: LoanOffer[]
  total: number
  page: number
  perPage: number
  totalPages: number
  prevHref: string | null
  nextHref: string | null
}) {
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(total, page * perPage)

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Показаны {start}–{end} из {total}
        </div>
        <div className="text-sm text-gray-600">Страница {page} из {totalPages}</div>
      </div>

      <div className="grid gap-3">
        {items.length === 0 ? (
          <div className="rounded-lg border p-6 text-center text-gray-600">Ничего не найдено</div>
        ) : (
          items.map(o => <LoanCard key={o.id} offer={o} />)
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <a
          className={`inline-flex items-center rounded-md border px-3 py-2 text-sm ${prevHref ? 'hover:bg-gray-50' : 'pointer-events-none opacity-50'}`}
          href={prevHref ?? '#'}
          aria-disabled={!prevHref}
        >
          ← Назад
        </a>
        <a
          className={`inline-flex items-center rounded-md border px-3 py-2 text-sm ${nextHref ? 'hover:bg-gray-50' : 'pointer-events-none opacity-50'}`}
          href={nextHref ?? '#'}
          aria-disabled={!nextHref}
        >
          Далее →
        </a>
      </div>
    </section>
  )
}
