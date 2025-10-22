const links: { href: string; label: string }[] = [
  { href: '/', label: 'Главная' },
  { href: '/loans', label: 'Займы' },
  { href: '/compare', label: 'Сравнение займов' },
  { href: '#kredits', label: 'Кредиты (скоро)' },
  { href: '#cards', label: 'Кредитные карты (скоро)' },
  { href: '#mortgage', label: 'Ипотека (скоро)' },
]

export default function QuickLinksWidget() {
  return (
    <nav aria-labelledby="quick-links-title" className="rounded-lg border p-4">
      <h3 id="quick-links-title" className="mb-3 text-base font-semibold">
        Быстрые ссылки
      </h3>
      <ul className="grid gap-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <a className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-50" href={l.href}>
              <span aria-hidden>→</span>
              <span>{l.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
