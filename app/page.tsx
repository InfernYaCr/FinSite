import type { Metadata } from 'next'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Главная',
  description: 'Главная страница демо-проекта на Next.js 14 (RU)',
  path: '/',
})

export default function HomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Добро пожаловать</h1>
      <p className="text-gray-700">
        Это минимальный SSR-шаблон Next.js 14 c App Router, TypeScript и TailwindCSS.
      </p>
    </section>
  )
}
