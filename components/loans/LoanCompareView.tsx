"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Badge, Button, Input, Select, Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui'
import type { BorrowerRequirement, LoanOffer, PayoutType } from '@/src/lib/loans'
import { makeOfferSlug } from '@/src/lib/loans'
import { clampOfferIds, MAX_COMPARE_ITEMS, parseOfferIdsFromSearchParams } from '@/src/lib/compare'
import { cn } from '@/src/lib/utils'

type LoanCompareViewProps = {
  allOffers: LoanOffer[]
  initialSelectedIds: string[]
}

type NumericField = 'rating' | 'rateFrom' | 'rateTo' | 'amountMin' | 'amountMax' | 'termMin' | 'termMax'

type MetricConfig = {
  key: NumericField
  label: string
  direction: 'max' | 'min'
  format: (value: number) => string
}

const METRICS: MetricConfig[] = [
  {
    key: 'rating',
    label: 'Рейтинг',
    direction: 'max',
    format: (value) => value.toFixed(1),
  },
  {
    key: 'rateFrom',
    label: 'Ставка от',
    direction: 'min',
    format: (value) => `${value.toFixed(1)}%`,
  },
  {
    key: 'rateTo',
    label: 'Ставка до',
    direction: 'min',
    format: (value) => `${value.toFixed(1)}%`,
  },
  {
    key: 'amountMin',
    label: 'Минимальная сумма',
    direction: 'min',
    format: (value) => `${value.toLocaleString('ru-RU')} ₽`,
  },
  {
    key: 'amountMax',
    label: 'Максимальная сумма',
    direction: 'max',
    format: (value) => `${value.toLocaleString('ru-RU')} ₽`,
  },
  {
    key: 'termMin',
    label: 'Минимальный срок',
    direction: 'min',
    format: (value) => `${value} мес.`,
  },
  {
    key: 'termMax',
    label: 'Максимальный срок',
    direction: 'max',
    format: (value) => `${value} мес.`,
  },
]

const payoutTypeLabels: Record<PayoutType, string> = {
  card: 'На карту',
  bank: 'На счет',
  cash: 'Наличными',
  ewallet: 'Электронный кошелек',
}

const requirementLabels: Record<BorrowerRequirement, string> = {
  passport: 'Паспорт',
  incomeProof: 'Подтверждение дохода',
  noBadCredit: 'Без просрочек',
  citizenship: 'Гражданство РФ',
  age18Plus: 'Возраст 18+',
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export default function LoanCompareView({ allOffers, initialSelectedIds }: LoanCompareViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const offersById = useMemo(() => new Map(allOffers.map((offer) => [offer.id, offer])), [allOffers])
  const allowedIdsSet = useMemo(() => new Set(allOffers.map((offer) => offer.id)), [allOffers])
  const sortedOffers = useMemo(
    () =>
      [...allOffers].sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating
        return a.rateFrom - b.rateFrom
      }),
    [allOffers],
  )

  const initialNormalized = useMemo(
    () => clampOfferIds(initialSelectedIds, allowedIdsSet),
    [initialSelectedIds, allowedIdsSet],
  )

  const [selectedIds, setSelectedIds] = useState<string[]>(initialNormalized)
  const [pendingAdd, setPendingAdd] = useState<string>('')
  const [shareUrl, setShareUrl] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const copyTimeoutRef = useRef<number | undefined>(undefined)
  const shareInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSelectedIds((prev) => (arraysEqual(prev, initialNormalized) ? prev : initialNormalized))
  }, [initialNormalized])

  useEffect(() => {
    const parsed = clampOfferIds(parseOfferIdsFromSearchParams(searchParams), allowedIdsSet)
    setSelectedIds((prev) => (arraysEqual(prev, parsed) ? prev : parsed))
  }, [searchParams, allowedIdsSet])

  const selectedOffers = useMemo(
    () => selectedIds.map((id) => offersById.get(id)).filter((offer): offer is LoanOffer => Boolean(offer)),
    [selectedIds, offersById],
  )

  const bestValues = useMemo(() => {
    const acc: Partial<Record<NumericField, number>> = {}
    if (selectedOffers.length === 0) return acc
    for (const metric of METRICS) {
      const values = selectedOffers.map((offer) => offer[metric.key])
      if (!values.length) continue
      const best = metric.direction === 'max' ? Math.max(...values) : Math.min(...values)
      acc[metric.key] = best
    }
    return acc
  }, [selectedOffers])

  const availableOptions = useMemo(
    () => sortedOffers.filter((offer) => !selectedIds.includes(offer.id)),
    [sortedOffers, selectedIds],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const origin = window.location.origin
    const params = new URLSearchParams()
    selectedIds.forEach((id) => params.append('offers', id))
    const qs = params.toString()
    setShareUrl(qs ? `${origin}${pathname}?${qs}` : `${origin}${pathname}`)
  }, [selectedIds, pathname])

  useEffect(() => {
    if (copyState === 'idle') return
    if (typeof window === 'undefined') return
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current)
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyState('idle')
      copyTimeoutRef.current = undefined
    }, 2000)
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current)
        copyTimeoutRef.current = undefined
      }
    }
  }, [copyState])

  const syncUrl = (ids: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('offers')
    ids.forEach((id) => params.append('offers', id))
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const updateSelection = (ids: string[]) => {
    const next = clampOfferIds(ids, allowedIdsSet)
    setSelectedIds(next)
    syncUrl(next)
  }

  const handleAdd = (id: string) => {
    if (!id || selectedIds.includes(id)) return
    if (selectedIds.length >= MAX_COMPARE_ITEMS) return
    updateSelection([...selectedIds, id])
    setPendingAdd('')
  }

  const handleRemove = (id: string) => {
    updateSelection(selectedIds.filter((currentId) => currentId !== id))
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setCopyState('copied')
        return
      }
      throw new Error('Clipboard API unavailable')
    } catch (_error) {
      if (shareInputRef.current) {
        shareInputRef.current.focus()
        shareInputRef.current.select()
        try {
          const successful =
            typeof document !== 'undefined' && typeof document.execCommand === 'function'
              ? document.execCommand('copy')
              : false
          setCopyState(successful ? 'copied' : 'error')
          return
        } catch (_err) {
          setCopyState('error')
          return
        }
      }
      setCopyState('error')
    }
  }

  const recommended = useMemo(
    () => availableOptions.slice(0, 3),
    [availableOptions],
  )

  const hasCapacity = selectedIds.length < MAX_COMPARE_ITEMS
  const hasOptions = availableOptions.length > 0
  const selectPlaceholder = !hasOptions
    ? 'Нет доступных предложений'
    : !hasCapacity
      ? 'Достигнут лимит'
      : 'Выберите предложение'

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div>
              <h3 className="text-lg font-semibold">Добавить предложение</h3>
              <p className="text-sm text-gray-600">Выберите оффер для сравнения. Максимум {MAX_COMPARE_ITEMS}.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-[220px] sm:w-64">
                <Select
                  value={pendingAdd}
                  onChange={(event) => setPendingAdd(event.target.value)}
                  disabled={!hasOptions || !hasCapacity}
                  aria-label="Выберите предложение для сравнения"
                >
                  <option value="" disabled>
                    {selectPlaceholder}
                  </option>
                  {availableOptions.map((offer) => (
                    <option key={offer.id} value={offer.id}>
                      {offer.organization} · {offer.rateFrom}% · до {offer.amountMax.toLocaleString('ru-RU')} ₽
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                onClick={() => handleAdd(pendingAdd)}
                disabled={!pendingAdd || !hasCapacity || !hasOptions}
                className="sm:w-auto"
              >
                Добавить в сравнение
              </Button>
              {selectedIds.length > 0 ? (
                <Button variant="ghost" onClick={() => updateSelection([])} className="sm:w-auto">
                  Сбросить
                </Button>
              ) : null}
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <label className="block text-sm font-medium text-gray-700" htmlFor="compare-share">
              Ссылка для сравнения
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input id="compare-share" ref={shareInputRef} value={shareUrl} readOnly className="flex-1" />
              <Button variant="secondary" onClick={handleCopy} disabled={!shareUrl} className="sm:w-auto">
                {copyState === 'copied' ? 'Скопировано' : 'Скопировать'}
              </Button>
            </div>
            <p className={cn('text-xs text-gray-500', copyState === 'error' && 'text-red-600')}>
              {copyState === 'error'
                ? 'Не удалось скопировать ссылку. Скопируйте вручную.'
                : 'Поделитесь ссылкой с коллегами или сохраните в закладки.'}
            </p>
          </div>
        </div>
      </div>

      {selectedOffers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-semibold">Добавьте предложения, чтобы сравнить условия</h3>
          <p className="mt-2 text-sm text-gray-600">
            Выберите до {MAX_COMPARE_ITEMS} займов и сравните ставки, суммы, сроки и требования.
          </p>
          {recommended.length > 0 ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {recommended.map((offer) => (
                <Button key={offer.id} variant="outline" onClick={() => handleAdd(offer.id)}>
                  Добавить {offer.organization}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48 text-gray-500">Параметр</TableHead>
                  {selectedOffers.map((offer) => (
                    <TableHead key={offer.id} className="align-bottom">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold leading-tight text-gray-800">{offer.organization}</div>
                          <div className="text-xs text-gray-500">{offer.title}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(offer.id)}
                          aria-label={`Убрать ${offer.organization} из сравнения`}
                        >
                          <span aria-hidden className="text-lg text-gray-400">
                            ×
                          </span>
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {METRICS.map((metric) => (
                  <TableRow key={metric.key}>
                    <TableCell className="font-medium text-gray-600">{metric.label}</TableCell>
                    {selectedOffers.map((offer) => {
                      const value = offer[metric.key]
                      const highlight = bestValues[metric.key] !== undefined && value === bestValues[metric.key]
                      return (
                        <TableCell
                          key={`${metric.key}-${offer.id}`}
                          className={cn('font-medium', highlight && 'rounded-md bg-emerald-50 text-emerald-700')}
                        >
                          <div className="flex items-center gap-2">
                            <span>{metric.format(value)}</span>
                            {highlight ? <Badge variant="secondary">Лучшее</Badge> : null}
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-medium text-gray-600">Способы получения</TableCell>
                  {selectedOffers.map((offer) => (
                    <TableCell key={`payout-${offer.id}`}>
                      <div className="flex flex-wrap gap-1 text-sm text-gray-700">
                        {offer.payoutTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-gray-600">
                            {payoutTypeLabels[type] ?? type}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-gray-600">Требования</TableCell>
                  {selectedOffers.map((offer) => (
                    <TableCell key={`requirements-${offer.id}`}>
                      <div className="flex flex-wrap gap-1 text-sm text-gray-700">
                        {offer.requirements.map((req) => (
                          <Badge key={req} variant="outline" className="text-gray-600">
                            {requirementLabels[req] ?? req}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-gray-600">Подробнее</TableCell>
                  {selectedOffers.map((offer) => (
                    <TableCell key={`cta-${offer.id}`}>
                      <a
                        href={`/loans/${makeOfferSlug(offer)}`}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        Перейти к предложению
                      </a>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
              <TableCaption>
                Можно сравнить до {MAX_COMPARE_ITEMS} займов одновременно. Лучшие значения подсвечены.
              </TableCaption>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
