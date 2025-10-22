import { type BorrowerRequirement, type PayoutType } from '@/src/lib/loans'

export type FilterValues = {
  amount?: number
  term?: number
  maxRate?: number
  payoutType?: PayoutType
  requirements?: BorrowerRequirement[]
  sortBy?: 'rating' | 'rate' | 'amount'
  order?: 'asc' | 'desc'
  perPage?: number
}

const payoutOptions: PayoutType[] = ['card', 'bank', 'cash', 'ewallet']
const requirementOptions: BorrowerRequirement[] = [
  'passport',
  'incomeProof',
  'noBadCredit',
  'citizenship',
  'age18Plus',
]

export default function FilterBar({ initial, action = '/loans' }: { initial: FilterValues; action?: string }) {
  const reqSet = new Set(initial.requirements ?? [])

  return (
    <form method="get" action={action} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="amount" className="text-sm text-gray-600">
          Сумма (₽)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min={0}
          defaultValue={initial.amount ?? ''}
          className="rounded-md border px-2 py-1"
          placeholder="например, 50000"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="term" className="text-sm text-gray-600">
          Срок (мес.)
        </label>
        <input
          id="term"
          name="term"
          type="number"
          min={1}
          defaultValue={initial.term ?? ''}
          className="rounded-md border px-2 py-1"
          placeholder="например, 6"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="maxRate" className="text-sm text-gray-600">
          Макс. ставка (%)
        </label>
        <input
          id="maxRate"
          name="maxRate"
          type="number"
          min={0}
          max={100}
          step={0.1}
          defaultValue={initial.maxRate ?? ''}
          className="rounded-md border px-2 py-1"
          placeholder="например, 18"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="payoutType" className="text-sm text-gray-600">
          Способ выплаты
        </label>
        <select
          id="payoutType"
          name="payoutType"
          defaultValue={initial.payoutType ?? ''}
          className="rounded-md border px-2 py-1"
        >
          <option value="">Любой</option>
          {payoutOptions.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="sm:col-span-2">
        <legend className="mb-1 text-sm text-gray-600">Требования к заемщику</legend>
        <div className="flex flex-wrap gap-3">
          {requirementOptions.map(r => (
            <label key={r} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="requirements"
                value={r}
                defaultChecked={reqSet.has(r)}
                className="h-4 w-4"
              />
              <span>{r}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1">
        <label htmlFor="sortBy" className="text-sm text-gray-600">
          Сортировка
        </label>
        <div className="grid grid-cols-2 gap-2">
          <select id="sortBy" name="sortBy" defaultValue={initial.sortBy ?? 'rating'} className="rounded-md border px-2 py-1">
            <option value="rating">Рейтинг</option>
            <option value="rate">Ставка</option>
            <option value="amount">Сумма</option>
          </select>
          <select id="order" name="order" defaultValue={initial.order ?? (initial.sortBy === 'rate' ? 'asc' : 'desc')} className="rounded-md border px-2 py-1">
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="perPage" className="text-sm text-gray-600">
          На странице
        </label>
        <select id="perPage" name="perPage" defaultValue={initial.perPage ?? 10} className="rounded-md border px-2 py-1">
          {[10, 20, 30, 50].map(n => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Применить
        </button>
      </div>
    </form>
  )
}
