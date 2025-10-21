export default function Nav() {
  return (
    <header className="border-b bg-gray-50/60">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="/" className="text-lg font-semibold hover:opacity-80">
          Next14 RU SSR
        </a>
        <nav aria-label="Основная навигация">
          <ul className="flex items-center gap-4 text-sm text-gray-700">
            <li>
              <a className="hover:text-black" href="/">
                Главная
              </a>
            </li>
            <li>
              <a className="hover:text-black" href="/loans">
                Займы
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
