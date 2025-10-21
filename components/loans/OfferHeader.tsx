import type { LoanOffer } from '@/src/lib/loans'

export default function OfferHeader({ offer }: { offer: LoanOffer }) {
  return (
    <header className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{offer.title}</h1>
          <p className="text-sm text-gray-600">{offer.organization}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase text-gray-500">Рейтинг</div>
          <div className="text-2xl font-semibold">{offer.rating.toFixed(1)}</div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-md border p-3">
          <dt className="text-gray-500">Ставка</dt>
          <dd className="font-medium">от {offer.rateFrom}% до {offer.rateTo}% годовых</dd>
        </div>
        <div className="rounded-md border p-3">
          <dt className="text-gray-500">Сумма</dt>
          <dd className="font-medium">
            {offer.amountMin.toLocaleString('ru-RU')}–{offer.amountMax.toLocaleString('ru-RU')} ₽
          </dd>
        </div>
        <div className="rounded-md border p-3">
          <dt className="text-gray-500">Срок</dt>
          <dd className="font-medium">
            {offer.termMin}–{offer.termMax} мес.
          </dd>
        </div>
        <div className="rounded-md border p-3">
          <dt className="text-gray-500">Выплата</dt>
          <dd className="font-medium">{offer.payoutTypes.join(', ')}</dd>
        </div>
      </dl>
    </header>
  )
}
