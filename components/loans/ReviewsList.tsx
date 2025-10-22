import type { Review } from '@/src/lib/reviews'

export type ReviewItem = Review

function Stars({ value }: { value: number }) {
  const full = Math.round(value)
  return (
    <span aria-label={`Рейтинг ${value} из 5`} className="text-yellow-500">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  )
}

export default function ReviewsList({ items }: { items: Review[] }) {
  if (!items.length)
    return (
      <div className="rounded-lg border p-4 text-sm text-gray-600">Пока нет отзывов. Станьте первым!</div>
    )
  return (
    <ul className="space-y-3">
      {items.map(r => (
        <li key={r.id} className="rounded-lg border p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium">{r.author}</div>
              <div className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString('ru-RU')}</div>
            </div>
            <div>
              <Stars value={r.rating} />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-800">{r.comment}</p>
        </li>
      ))}
    </ul>
  )
}
