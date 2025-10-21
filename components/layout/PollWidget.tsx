"use client"

import { useMemo, useState } from 'react'

const OPTIONS = [
  { id: 'loans', label: 'Займы' },
  { id: 'cards', label: 'Кредитные карты' },
  { id: 'mortgage', label: 'Ипотека' },
  { id: 'deposits', label: 'Вклады' },
]

export default function PollWidget() {
  const [choice, setChoice] = useState<string>('')
  const [submitted, setSubmitted] = useState<boolean>(false)

  const results = useMemo(() => {
    // Случайные результаты-заглушки, чтобы показать визуализацию
    const base = OPTIONS.map((o) => ({ id: o.id, votes: 10 + Math.floor(Math.random() * 90) }))
    const total = base.reduce((s, x) => s + x.votes, 0)
    return base.map((x) => ({ ...x, percent: Math.round((x.votes / total) * 100) }))
  }, [submitted])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!choice) return
    setSubmitted(true)
  }

  return (
    <section aria-labelledby="poll-title" className="rounded-lg border p-4">
      <h3 id="poll-title" className="mb-3 text-base font-semibold">Опрос</h3>
      {!submitted ? (
        <form onSubmit={onSubmit} className="space-y-3 text-sm">
          <p className="text-gray-700">Какой раздел вам интересен?</p>
          <div className="grid gap-2">
            {OPTIONS.map((o) => (
              <label key={o.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="poll"
                  value={o.id}
                  checked={choice === o.id}
                  onChange={(e) => setChoice(e.target.value)}
                  className="h-4 w-4"
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Проголосовать
          </button>
        </form>
      ) : (
        <div className="space-y-3 text-sm">
          <p className="text-gray-700">Спасибо за участие! Результаты опроса:</p>
          <ul className="space-y-2">
            {results.map((r) => {
              const label = OPTIONS.find((o) => o.id === r.id)?.label ?? r.id
              return (
                <li key={r.id}>
                  <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                    <span>{label}</span>
                    <span>{r.percent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
                    <div className="h-full bg-indigo-600" style={{ width: `${r.percent}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
