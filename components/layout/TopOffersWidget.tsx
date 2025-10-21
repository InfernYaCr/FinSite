import { generateOffers } from '@/src/lib/loans'

export default function TopOffersWidget() {
  const items = generateOffers(15).sort((a, b) => b.rating - a.rating).slice(0, 3)
  return (
    <section aria-labelledby="top-offers-title" className="rounded-lg border p-4">
      <h3 id="top-offers-title" className="mb-3 text-base font-semibold">
        Топ предложения
      </h3>
      <ul className="space-y-3">
        {items.map((o) => (
          <li key={o.id} className="group">
            <a href="/loans" className="block rounded-md border p-3 hover:bg-gray-50">
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
              <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                <span>
                  Срок {o.termMin}–{o.termMax} мес.
                </span>
                <span>Выплата: {o.payoutTypes[0]}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
