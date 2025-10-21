"use client"

import { useEffect, useState } from 'react'

const CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Челябинск',
  'Самара',
]

export default function CitySelectorWidget() {
  const [city, setCity] = useState<string>('Москва')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('selectedCity')
      if (saved) setCity(saved)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('selectedCity', city)
    } catch {}
  }, [city])

  return (
    <section aria-labelledby="city-selector-title" className="rounded-lg border p-4">
      <h3 id="city-selector-title" className="mb-3 text-base font-semibold">
        Выбор города
      </h3>
      <div className="space-y-2 text-sm">
        <div className="text-gray-600">Ваш город: <span className="font-medium text-gray-900">{city}</span></div>
        <label className="block">
          <span className="sr-only">Выберите город</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-md border px-2 py-2"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
