import type { LoanQuery, BorrowerRequirement, PayoutType } from './loans'

function parseArrayParam(value: string | string[] | undefined): string[] | undefined {
  if (!value) return undefined
  return Array.isArray(value) ? value : [value]
}

function parseNumber(value: string | string[] | undefined): number | undefined {
  if (!value) return undefined
  const v = Array.isArray(value) ? value[0] : value
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

export function parseLoanQuery(
  searchParams: { [key: string]: string | string[] | undefined },
): LoanQuery {
  const requirements = parseArrayParam(searchParams.requirements) as BorrowerRequirement[] | undefined
  const payoutType = (Array.isArray(searchParams.payoutType)
    ? searchParams.payoutType[0]
    : searchParams.payoutType) as PayoutType | undefined

  const sortBy = (Array.isArray(searchParams.sortBy)
    ? searchParams.sortBy[0]
    : searchParams.sortBy) as LoanQuery['sortBy']
  const order = (Array.isArray(searchParams.order)
    ? searchParams.order[0]
    : searchParams.order) as LoanQuery['order']

  const perPage = parseNumber(searchParams.perPage)
  const page = parseNumber(searchParams.page)

  return {
    amount: parseNumber(searchParams.amount),
    term: parseNumber(searchParams.term),
    maxRate: parseNumber(searchParams.maxRate),
    payoutType,
    requirements,
    sortBy: sortBy ?? 'rating',
    order: order ?? (sortBy === 'rate' ? 'asc' : 'desc'),
    page: page ?? 1,
    perPage: perPage ?? 10,
  }
}

export function buildQueryHref(
  base: string,
  params: URLSearchParams,
  merge: Record<string, string | null>,
): string {
  const qp = new URLSearchParams(params)
  Object.entries(merge).forEach(([key, value]) => {
    if (value === null) qp.delete(key)
    else qp.set(key, value)
  })
  const qs = qp.toString()
  return qs ? `${base}?${qs}` : base
}
