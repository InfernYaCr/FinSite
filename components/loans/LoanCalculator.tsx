"use client"

import * as React from 'react'
import type { LoanOffer } from '@/src/lib/loans'

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

function monthlyPayment(amount: number, annualRatePercent: number, months: number) {
  const r = annualRatePercent / 100 / 12
  if (r <= 0) return amount / months
  const denom = 1 - Math.pow(1 + r, -months)
  return (amount * r) / denom
}

export default function LoanCalculator({ offer }: { offer: LoanOffer }) {
  const defaultAmount = Math.round((offer.amountMin + offer.amountMax) / 2)
  const defaultTerm = Math.round((offer.termMin + offer.termMax) / 2)
  const [amount, setAmount] = React.useState<number>(defaultAmount)
  const [term, setTerm] = React.useState<number>(defaultTerm)
  const [rate, setRate] = React.useState<number>(offer.rateFrom)

  const a = clamp(amount, offer.amountMin, offer.amountMax)
  const t = clamp(term, offer.termMin, offer.termMax)
  const r = clamp(rate, offer.rateFrom, offer.rateTo)

  const payment = monthlyPayment(a, r, t)
  const total = payment * t
  const overpay = total - a

  return (
    <section className="rounded-lg border p-4">
      <h2 className="mb-3 text-lg font-semibold">Калькулятор платежей</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-3">
          <label className="text-sm text-gray-600">Сумма: {a.toLocaleString('ru-RU')} ₽</label>
          <input
            type="range"
            min={offer.amountMin}
            max={offer.amountMax}
            step={1000}
            value={a}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <input
            type="number"
            className="w-full rounded-md border px-2 py-1 text-sm"
            value={a}
            min={offer.amountMin}
            max={offer.amountMax}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm text-gray-600">Срок: {t} мес.</label>
          <input
            type="range"
            min={offer.termMin}
            max={offer.termMax}
            step={1}
            value={t}
            onChange={(e) => setTerm(Number(e.target.value))}
          />
          <input
            type="number"
            className="w-full rounded-md border px-2 py-1 text-sm"
            value={t}
            min={offer.termMin}
            max={offer.termMax}
            onChange={(e) => setTerm(Number(e.target.value))}
          />
        </div>

        <div className="grid gap-3 sm:col-span-2">
          <label className="text-sm text-gray-600">
            Ставка: {r.toFixed(1)}% годовых (диапазон {offer.rateFrom}%–{offer.rateTo}%)
          </label>
          <input
            type="range"
            min={offer.rateFrom}
            max={offer.rateTo}
            step={0.1}
            value={r}
            onChange={(e) => setRate(Number(e.target.value))}
          />
          <input
            type="number"
            className="w-full rounded-md border px-2 py-1 text-sm"
            value={r}
            min={offer.rateFrom}
            max={offer.rateTo}
            step={0.1}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border p-3 text-center">
          <div className="text-xs uppercase text-gray-500">Ежемесячный платеж</div>
          <div className="text-xl font-semibold">{Math.round(payment).toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="rounded-md border p-3 text-center">
          <div className="text-xs uppercase text-gray-500">Переплата</div>
          <div className="text-xl font-semibold">{Math.round(overpay).toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="rounded-md border p-3 text-center">
          <div className="text-xs uppercase text-gray-500">Итого</div>
          <div className="text-xl font-semibold">{Math.round(total).toLocaleString('ru-RU')} ₽</div>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Расчёт ориентировочный и не является публичной офертой. Итоговые условия зависят от
        проверки заявки и внутренних правил организации.
      </p>
    </section>
  )
}
