"use client"

import * as React from 'react'

export default function ReviewForm() {
  const [pending, setPending] = React.useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setTimeout(() => setPending(false), 800)
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border p-4">
      <h3 className="text-base font-semibold">Оставить отзыв</h3>
      <div className="grid gap-1">
        <label className="text-sm text-gray-600" htmlFor="name">Имя</label>
        <input id="name" name="name" type="text" className="rounded-md border px-2 py-1 text-sm" placeholder="Ваше имя" disabled />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-gray-600" htmlFor="rating">Оценка</label>
        <select id="rating" name="rating" className="rounded-md border px-2 py-1 text-sm" disabled>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-gray-600" htmlFor="comment">Комментарий</label>
        <textarea id="comment" name="comment" className="rounded-md border px-2 py-1 text-sm" rows={3} placeholder="Поделитесь опытом" disabled />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md bg-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
        disabled
        aria-disabled
      >
        {pending ? 'Отправка...' : 'Отправка отзывов скоро'}
      </button>
      <p className="text-xs text-gray-500">Форма временно недоступна. Мы работаем над модерацией отзывов.</p>
    </form>
  )
}
