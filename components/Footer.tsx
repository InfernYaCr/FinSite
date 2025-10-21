export default function Footer() {
  return (
    <footer className="border-t bg-gray-50/60">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Пример проекта. Все права защищены.
      </div>
    </footer>
  )
}
