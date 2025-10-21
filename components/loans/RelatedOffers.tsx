import Link from 'next/link'
import type { LoanOffer } from '@/src/lib/loans'
import { makeOfferSlug } from '@/src/lib/loans'

export default function RelatedOffers({ items }: { items: LoanOffer[] }) {
  if (!items.length) return null
  return (
    <section className="rounded-lg border p-4">
      <h2 className="mb-3 text-lg font-semibold">Похожие предложения</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((o) => (
          <li key={o.id} className="rounded-md border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{o.organization}</div>
                <div className="text-xs text-gray-600">
                  до {o.amountMax.toLocaleString('ru-RU')} ₽ • от {o.rateFrom}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-gray-500">Рейтинг</div>
                <div className="text-sm font-semibold">{o.rating.toFixed(1)}</div>
              </div>
            </div>
            <div className="mt-2">
              <Link
                href={`/loans/${makeOfferSlug(o)}`}
                className="inline-flex rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
              >
                Подробнее
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
