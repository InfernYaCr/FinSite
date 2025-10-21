import type { LoanOffer } from '@/src/lib/loans'
import { makeOfferSlug } from '@/src/lib/loans'

export default function LoanCard({ offer }: { offer: LoanOffer }) {
  return (
    <article className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{offer.title}</h3>
          <p className="text-sm text-gray-600">{offer.organization}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Рейтинг</div>
          <div className="text-xl font-bold">{offer.rating.toFixed(1)}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <div className="text-gray-500">Ставка от</div>
          <div className="font-medium">{offer.rateFrom}%</div>
        </div>
        <div>
          <div className="text-gray-500">Сумма</div>
          <div className="font-medium">
            {offer.amountMin.toLocaleString('ru-RU')}–{offer.amountMax.toLocaleString('ru-RU')} ₽
          </div>
        </div>
        <div>
          <div className="text-gray-500">Срок</div>
          <div className="font-medium">
            {offer.termMin}–{offer.termMax} мес.
          </div>
        </div>
        <div>
          <div className="text-gray-500">Выплата</div>
          <div className="font-medium">{offer.payoutTypes.join(', ')}</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Требования: {offer.requirements.join(', ')}
      </div>

      <div className="mt-4">
        <a
          href={`/loans/${makeOfferSlug(offer)}`}
          className="inline-flex rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Подробнее
        </a>
      </div>
    </article>
  )
}
