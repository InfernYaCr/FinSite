import { slugify } from './utils'

export type PayoutType = 'card' | 'bank' | 'cash' | 'ewallet'
export type BorrowerRequirement =
  | 'passport'
  | 'incomeProof'
  | 'noBadCredit'
  | 'citizenship'
  | 'age18Plus'

export type LoanOffer = {
  id: string
  title: string
  organization: string
  rating: number // 0..5
  rateFrom: number // percent per year
  rateTo: number // percent per year
  amountMin: number
  amountMax: number
  termMin: number // months
  termMax: number // months
  payoutTypes: PayoutType[]
  requirements: BorrowerRequirement[]
}

export type LoanQuery = {
  amount?: number
  term?: number
  maxRate?: number
  payoutType?: PayoutType
  requirements?: BorrowerRequirement[]
  sortBy?: 'rating' | 'rate' | 'amount'
  order?: 'asc' | 'desc'
  page?: number
  perPage?: number
}

// Deterministic LCG
function makeRng(seed = 42) {
  let s = seed >>> 0
  return function rand() {
    // LCG parameters (Numerical Recipes)
    s = (1664525 * s + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

function pickOne<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function pickSome<T>(rng: () => number, arr: T[], min = 1, max = arr.length): T[] {
  const count = Math.max(min, Math.min(max, Math.floor(rng() * (max - min + 1)) + min))
  const copy = [...arr]
  const out: T[] = []
  for (let i = 0; i < count && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length)
    out.push(copy.splice(idx, 1)[0])
  }
  return out
}

export function generateOffers(count = 80, seed = 20241021): LoanOffer[] {
  const rng = makeRng(seed)
  const orgs = [
    'БыстроДеньги',
    'Займер',
    'Манимен',
    'Екапуста',
    'ВиваДеньги',
    'ДругиеДеньги',
    'ЗаймГарант',
    'ФинТраст',
    'МигКредит',
    'ДомашниеДеньги',
  ]
  const payoutTypes: PayoutType[] = ['card', 'bank', 'cash', 'ewallet']
  const reqs: BorrowerRequirement[] = [
    'passport',
    'incomeProof',
    'noBadCredit',
    'citizenship',
    'age18Plus',
  ]

  const offers: LoanOffer[] = []
  for (let i = 0; i < count; i++) {
    const organization = pickOne(rng, orgs)
    const base = 5_000 + Math.floor(rng() * 95_000) // 5k..100k
    const max = base + Math.floor(rng() * 400_000) // up to ~500k
    const termMin = 1 + Math.floor(rng() * 5) // 1..6 months
    const termMax = termMin + 6 + Math.floor(rng() * 24) // +6..+30
    const rateFrom = +(5 + rng() * 25).toFixed(1) // 5..30% APR
    const rateTo = +(Math.max(rateFrom + rng() * 15, rateFrom + 1)).toFixed(1)
    const rating = +(3 + rng() * 2).toFixed(1) // 3.0..5.0
    const payout = pickSome(rng, payoutTypes, 1, 3)
    const requirements = pickSome(rng, reqs, 1, 3)

    offers.push({
      id: `offer_${i + 1}`,
      title: `${organization}: займ до ${max.toLocaleString('ru-RU')} ₽`,
      organization,
      rating,
      rateFrom,
      rateTo,
      amountMin: base,
      amountMax: max,
      termMin,
      termMax,
      payoutTypes: payout,
      requirements,
    })
  }
  return offers
}

export function filterSortPaginate(
  offers: LoanOffer[],
  query: LoanQuery,
): { items: LoanOffer[]; total: number; page: number; perPage: number; totalPages: number } {
  const {
    amount,
    term,
    maxRate,
    payoutType,
    requirements = [],
    sortBy = 'rating',
    order = sortBy === 'rate' ? 'asc' : 'desc',
    page = 1,
    perPage = 10,
  } = query

  let items = offers.slice()
  if (typeof amount === 'number' && !Number.isNaN(amount)) {
    items = items.filter(o => o.amountMin <= amount && amount <= o.amountMax)
  }
  if (typeof term === 'number' && !Number.isNaN(term)) {
    items = items.filter(o => o.termMin <= term && term <= o.termMax)
  }
  if (typeof maxRate === 'number' && !Number.isNaN(maxRate)) {
    items = items.filter(o => o.rateFrom <= maxRate)
  }
  if (payoutType) {
    items = items.filter(o => o.payoutTypes.includes(payoutType))
  }
  if (requirements && requirements.length > 0) {
    items = items.filter(o => requirements.every(r => o.requirements.includes(r)))
  }

  items.sort((a, b) => {
    const dir = order === 'asc' ? 1 : -1
    switch (sortBy) {
      case 'rate':
        return dir * (a.rateFrom - b.rateFrom)
      case 'amount':
        return dir * (a.amountMax - b.amountMax)
      case 'rating':
      default:
        return dir * (a.rating - b.rating)
    }
  })

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * perPage
  const paged = items.slice(start, start + perPage)

  return { items: paged, total, page: safePage, perPage, totalPages }
}

export function makeOfferSlug(offer: LoanOffer): string {
  // Include id to guarantee uniqueness while keeping it human-readable
  return slugify(`${offer.title} ${offer.organization} ${offer.id}`)
}

export function findOfferBySlug(offers: LoanOffer[], slug: string): LoanOffer | undefined {
  return offers.find(o => makeOfferSlug(o) === slug)
}
