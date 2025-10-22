const AUTHORS = ['Алексей', 'Мария', 'Иван', 'Ольга', 'Дмитрий', 'Елена', 'Сергей', 'Анна']
const COMMENTS = [
  'Быстро одобрили, условия прозрачные.',
  'Удобно, но ставку хотелось бы ниже.',
  'Оформление заняло 10 минут, всё ок.',
  'Поддержка отвечает быстро, впечатления положительные.',
  'Хороший сервис, деньги пришли на карту.',
  'Нужные документы подготовили заранее, процесс прошёл гладко.',
  'Рекомендую друзьям, хорошая альтернатива банкам.',
]

export type Review = {
  id: string
  author: string
  rating: number
  comment: string
  date: string
}

function createSeed(seed: string): number {
  let value = 0
  for (let i = 0; i < seed.length; i++) {
    value = (value * 31 + seed.charCodeAt(i)) >>> 0
  }
  return value || 1
}

function makeRng(initialSeed: number) {
  let state = initialSeed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0xffffffff
  }
}

export function generateReviews(seed: string, count = 3): Review[] {
  const rng = makeRng(createSeed(seed))
  const total = Math.max(2, Math.min(count, 5))
  const reviews: Review[] = []

  for (let i = 0; i < total; i++) {
    reviews.push({
      id: `${seed}_${i}`,
      author: AUTHORS[Math.floor(rng() * AUTHORS.length)],
      rating: Math.max(1, Math.min(5, 3 + Math.round(rng() * 2))),
      comment: COMMENTS[Math.floor(rng() * COMMENTS.length)],
      date: new Date(Date.now() - Math.floor(rng() * 90) * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  return reviews
}
