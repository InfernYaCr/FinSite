import ReviewsList, { type ReviewItem } from './ReviewsList'
import ReviewForm from './ReviewForm'

export default function Reviews({ items }: { items: ReviewItem[] }) {
  return (
    <section className="grid gap-4">
      <div>
        <h2 className="mb-3 text-lg font-semibold">Отзывы</h2>
        <ReviewsList items={items} />
      </div>
      <ReviewForm />
    </section>
  )
}
