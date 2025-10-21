export default function PageHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <header className="mb-4 space-y-1">
      <h1 className="text-3xl font-bold">{title}</h1>
      {subtitle && <p className="text-gray-700">{subtitle}</p>}
    </header>
  )
}
