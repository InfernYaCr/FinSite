import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Sidebar from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'Пример Next.js 14 (RU)',
  description: 'Минимальный SSR-проект на Next.js 14 с локалью ru',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <Nav />
          <main id="content" className="container mx-auto flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8 xl:col-span-9">{children}</div>
              <aside className="lg:col-span-4 xl:col-span-3">
                <Sidebar />
              </aside>
            </div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
