export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t bg-gray-50/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Contacts */}
          <section aria-labelledby="footer-contacts">
            <h2 id="footer-contacts" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Контакты
            </h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                Email: <a className="underline-offset-4 hover:underline" href="mailto:support@example.ru">support@example.ru</a>
              </li>
              <li>Тел.: 8 800 123-45-67</li>
              <li>Пн—Пт: 9:00–18:00 МСК</li>
              <li>ООО «Финтех», ИНН 1234567890</li>
            </ul>
          </section>

          {/* Social */}
          <section aria-labelledby="footer-social">
            <h2 id="footer-social" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Мы в соцсетях
            </h2>
            <ul className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
              <li>
                <a className="inline-flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-gray-50" href="#" aria-label="VK">
                  <VkIcon /> VK
                </a>
              </li>
              <li>
                <a className="inline-flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-gray-50" href="#" aria-label="Telegram">
                  <TelegramIcon /> Telegram
                </a>
              </li>
              <li>
                <a className="inline-flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-gray-50" href="#" aria-label="YouTube">
                  <YouTubeIcon /> YouTube
                </a>
              </li>
            </ul>
          </section>

          {/* Sitemap */}
          <nav aria-labelledby="footer-sitemap">
            <h2 id="footer-sitemap" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Карта сайта
            </h2>
            <ul className="grid gap-2 text-sm text-gray-700">
              <li><a className="hover:text-black" href="/">Главная</a></li>
              <li><a className="hover:text-black" href="/loans">Займы</a></li>
              <li><a className="hover:text-black" href="#kredits">Кредиты (скоро)</a></li>
              <li><a className="hover:text-black" href="#cards">Карты (скоро)</a></li>
              <li><a className="hover:text-black" href="#mortgage">Ипотека (скоро)</a></li>
              <li><a className="hover:text-black" href="#invest">Инвестиции (скоро)</a></li>
            </ul>
          </nav>

          {/* Legal */}
          <section aria-labelledby="footer-legal">
            <h2 id="footer-legal" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Правовая информация
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>Информация на сайте не является публичной офертой.</p>
              <p>
                Используя сайт, вы принимаете условия
                {" "}
                <a className="underline-offset-4 hover:underline" href="#terms">пользовательского соглашения</a>
                {" "}
                и
                {" "}
                <a className="underline-offset-4 hover:underline" href="#privacy">политики конфиденциальности</a>.
              </p>
              <p>Материалы представлены в информационных целях.</p>
            </div>
          </section>
        </div>

        <div className="border-t py-6 text-center text-sm text-gray-600">© {year} Пример проекта. Все права защищены.</div>
      </div>
    </footer>
  )
}

function VkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M3 5c0-.6.4-1 1-1h16c.6 0 1 .4 1 1v14c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1V5Zm2.9 3c-.2 0-.3.2-.2.3 1.3 3 3.6 5.9 6.6 5.9h.3v-2c0-.3.3-.5.6-.4l1.3.4c.2 0 .4 0 .5-.2l1.6-2.5c.1-.2 0-.5-.2-.5h-1.6c-.2 0-.3-.1-.4-.2l-.6-1.1c-.1-.2-.4-.3-.6-.2l-1.2.5c-.3.1-.7 0-.9-.3L9.6 8.2c-.1-.2-.3-.2-.4-.2H5.9Z" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M21 3 3.6 10.4c-.7.3-.7 1.4.1 1.7L8 14l1.9 4.4c.3.7 1.4.6 1.7-.1L21 3Z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M22 12c0-2.1-.2-3.5-.4-4.2-.2-.6-.7-1.1-1.3-1.3C19.6 6 12 6 12 6s-7.6 0-8.3.5c-.6.2-1.1.7-1.3 1.3C2.2 8.5 2 9.9 2 12s.2 3.5.4 4.2c.2.6.7 1.1 1.3 1.3C4.4 18 12 18 12 18s7.6 0 8.3-.5c.6-.2 1.1-.7 1.3-1.3.2-.7.4-2.1.4-4.2ZM10 15V9l5 3-5 3Z" />
    </svg>
  )
}
