"use client"

import { useState } from 'react'

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="border-b bg-white/70 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-4">
            <a href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold hover:opacity-90">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600 text-white">₽</span>
              <span className="truncate">Next14 RU SSR</span>
            </a>

            {/* Trust signals (md+) */}
            <ul className="hidden min-w-0 flex-1 items-center gap-4 truncate md:flex">
              <li className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-600">
                <ShieldIcon />
                <span>Надежно</span>
              </li>
              <li className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-600">
                <StarIcon />
                <span>Рейтинг 4.9/5</span>
              </li>
              <li className="hidden items-center gap-2 whitespace-nowrap text-xs text-gray-600 sm:inline-flex">
                <CheckIcon />
                <span>Выбор экспертов</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-3">
            {/* Search stub */}
            <div className="relative hidden w-64 sm:block">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                <SearchIcon />
              </div>
              <input
                type="search"
                disabled
                placeholder="Поиск (скоро)"
                className="w-full rounded-md border pl-8 pr-3 py-2 text-sm text-gray-600 placeholder:text-gray-400 disabled:bg-gray-50"
              />
            </div>

            {/* Featured CTA */}
            <a
              href="/loans"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <span>Лучшее предложение</span>
            </a>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border p-2 text-gray-700 hover:bg-gray-50 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="sr-only">Открыть меню</span>
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Desktop mega menu */}
        <div className="hidden lg:block">
          <nav aria-label="Мега-меню" className="relative">
            <ul className="flex items-center gap-6 text-sm">
              <MegaItem label="Займы">
                <div className="grid grid-cols-2 gap-6 p-6">
                  <MenuCol title="Популярное">
                    <MenuLink href="/loans">Займы онлайн</MenuLink>
                    <MenuLink href="/loans">Займы на карту</MenuLink>
                    <MenuLink href="/loans">Займы без отказа</MenuLink>
                    <MenuLink href="/loans">До зарплаты</MenuLink>
                  </MenuCol>
                  <MenuCol title="Подборки">
                    <MenuLink href="/loans">Для новых клиентов</MenuLink>
                    <MenuLink href="/loans">С плохой кредитной историей</MenuLink>
                    <MenuLink href="/loans">Под низкий процент</MenuLink>
                  </MenuCol>
                </div>
              </MegaItem>

              <MegaItem label="Кредиты">
                <div className="grid grid-cols-2 gap-6 p-6">
                  <MenuCol title="Виды кредитов">
                    <MenuLink href="#kredits">Потребительские</MenuLink>
                    <MenuLink href="#kredits">Рефинансирование</MenuLink>
                    <MenuLink href="#kredits">На авто</MenuLink>
                  </MenuCol>
                  <MenuCol title="Подборки">
                    <MenuLink href="#kredits">Без справок</MenuLink>
                    <MenuLink href="#kredits">С низкой ставкой</MenuLink>
                  </MenuCol>
                </div>
              </MegaItem>

              <MegaItem label="Карты">
                <div className="grid grid-cols-2 gap-6 p-6">
                  <MenuCol title="Кредитные карты">
                    <MenuLink href="#cards">С кешбэком</MenuLink>
                    <MenuLink href="#cards">С рассрочкой</MenuLink>
                    <MenuLink href="#cards">Для путешествий</MenuLink>
                  </MenuCol>
                  <MenuCol title="Дебетовые карты">
                    <MenuLink href="#cards">С высоким процентом</MenuLink>
                    <MenuLink href="#cards">Для бизнеса</MenuLink>
                  </MenuCol>
                </div>
              </MegaItem>

              <MegaItem label="Ипотека">
                <div className="grid grid-cols-2 gap-6 p-6">
                  <MenuCol title="Программы">
                    <MenuLink href="#mortgage">Господдержка</MenuLink>
                    <MenuLink href="#mortgage">Семейная</MenuLink>
                    <MenuLink href="#mortgage">Вторичное жилье</MenuLink>
                  </MenuCol>
                  <MenuCol title="Инструменты">
                    <MenuLink href="#mortgage">Ипотечный калькулятор</MenuLink>
                    <MenuLink href="#mortgage">Проверка ставки</MenuLink>
                  </MenuCol>
                </div>
              </MegaItem>

              <MegaItem label="Инвестиции">
                <div className="grid grid-cols-2 gap-6 p-6">
                  <MenuCol title="Инструменты">
                    <MenuLink href="#invest">Облигации</MenuLink>
                    <MenuLink href="#invest">Акции</MenuLink>
                    <MenuLink href="#invest">Фонды (ETF)</MenuLink>
                  </MenuCol>
                  <MenuCol title="Сервисы">
                    <MenuLink href="#invest">Брокеры</MenuLink>
                    <MenuLink href="#invest">ИИС</MenuLink>
                  </MenuCol>
                </div>
              </MegaItem>
            </ul>
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div id="mobile-menu" className="lg:hidden">
            <div className="divide-y rounded-b-lg border-t">
              <div className="grid gap-1 p-3 text-sm">
                <a className="rounded-md px-3 py-2 hover:bg-gray-50" href="/">Главная</a>
                <a className="rounded-md px-3 py-2 hover:bg-gray-50" href="/loans">Займы</a>
              </div>
              <div className="grid gap-1 p-3 text-sm">
                <div className="px-3 text-xs font-medium uppercase text-gray-500">Категории</div>
                <a className="rounded-md px-3 py-2 hover:bg-gray-50" href="/loans">Займы</a>
                <a className="rounded-md px-3 py-2 hover:bg-gray-50" href="#kredits">Кредиты (скоро)</a>
                <a className="rounded-md px-3 py-2 hover:bg-gray-50" href="#cards">Карты (скоро)</a>
                <a className="rounded-md px-3 py-2 hover:bg-gray-50" href="#mortgage">Ипотека (скоро)</a>
                <a className="rounded-md px-3 py-2 hover:bg-gray-50" href="#invest">Инвестиции (скоро)</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function MegaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li className="group relative">
      <button
        type="button"
        className="inline-flex items-center gap-2 py-3 text-gray-700 hover:text-black"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span>{label}</span>
        <ChevronDownIcon />
      </button>
      <div className="pointer-events-none absolute left-0 top-full z-30 hidden w-[720px] rounded-b-lg border bg-white shadow-lg group-hover:block group-focus-within:block">
        <div className="pointer-events-auto">
          {children}
        </div>
      </div>
    </li>
  )
}

function MenuCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase text-gray-500">{title}</div>
      <div className="grid gap-1">
        {children}
      </div>
    </div>
  )
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="rounded-md px-2 py-1 text-gray-700 hover:bg-gray-50 hover:text-black">
      {children}
    </a>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path
        fillRule="evenodd"
        d="M8.5 3a5.5 5.5 0 1 0 3.89 9.39l3.61 3.6a1 1 0 0 0 1.42-1.42l-3.6-3.61A5.5 5.5 0 0 0 8.5 3Zm-3.5 5.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.12l3.71-2.89a.75.75 0 1 1 .92 1.18l-4.25 3.31a.75.75 0 0 1-.92 0L5.21 8.41a.75.75 0 0 1 .02-1.2Z" clipRule="evenodd" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-indigo-600" aria-hidden="true">
      <path d="M12 2 4 5v6c0 5.25 3.4 10.05 8 11 4.6-.95 8-5.75 8-11V5l-8-3Z" />
      <path fill="#fff" d="M10.5 13.6 8 11.1l-1.4 1.4 3.9 3.9 6.9-6.9-1.4-1.4-5.5 5.5Z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-yellow-500" aria-hidden="true">
      <path d="M12 2 9.2 8.4 2.2 9.2l5 4.9-1.2 7 6-3.2 6 3.2-1.2-7 5-4.9-7-.8L12 2Z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-emerald-600" aria-hidden="true">
      <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
    </svg>
  )
}
