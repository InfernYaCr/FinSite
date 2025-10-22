import type { LoanOffer } from './loans'

export const MAX_COMPARE_ITEMS = 4

type RawParam = string | string[] | undefined

type SearchParamsLike = {
  get(name: string): string | null
  getAll(name: string): string[]
}

function toNormalizedList(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const parts = value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)

    for (const part of parts) {
      if (seen.has(part)) continue
      seen.add(part)
      result.push(part)
      if (result.length >= MAX_COMPARE_ITEMS) {
        return result
      }
    }
  }

  return result
}

export function parseOfferIdsParam(param: RawParam): string[] {
  if (typeof param === 'undefined') {
    return []
  }
  if (Array.isArray(param)) {
    return toNormalizedList(param)
  }
  return toNormalizedList([param])
}

export function parseOfferIdsFromSearchParams(params: SearchParamsLike): string[] {
  const all = params.getAll('offers')
  if (all.length > 0) {
    return toNormalizedList(all)
  }
  const single = params.get('offers')
  if (!single) {
    return []
  }
  return toNormalizedList([single])
}

export function clampOfferIds(ids: string[], allowed: Set<string>): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const id of ids) {
    if (seen.has(id)) continue
    if (!allowed.has(id)) continue
    seen.add(id)
    result.push(id)
    if (result.length >= MAX_COMPARE_ITEMS) {
      break
    }
  }

  return result
}

export function resolveOffersByIds(ids: string[], offers: LoanOffer[]): LoanOffer[] {
  const map = new Map<string, LoanOffer>()
  for (const offer of offers) {
    map.set(offer.id, offer)
  }
  return ids
    .map((id) => map.get(id))
    .filter((offer): offer is LoanOffer => Boolean(offer))
}
