type AnalyticsIntegrationStatus = 'disabled' | 'misconfigured' | 'ready'

type Booleanish = string | undefined | null

const truthyValues = new Set(['1', 'true', 'yes', 'on'])

const toBoolean = (value: Booleanish): boolean => {
  if (!value) {
    return false
  }
  return truthyValues.has(value.trim().toLowerCase())
}

const computeStatus = (flag: boolean, isConfigured: boolean): AnalyticsIntegrationStatus => {
  if (!flag) {
    return 'disabled'
  }
  if (!isConfigured) {
    return 'misconfigured'
  }
  return 'ready'
}

const ga4MeasurementId = process.env.NEXT_PUBLIC_ANALYTICS_GA4_MEASUREMENT_ID ?? ''
const metaPixelId = process.env.NEXT_PUBLIC_ANALYTICS_META_PIXEL_ID ?? ''
const yandexCounterId = process.env.NEXT_PUBLIC_ANALYTICS_YANDEX_METRICA_ID ?? ''

const ga4Status = computeStatus(
  toBoolean(process.env.NEXT_PUBLIC_ANALYTICS_GA4_ENABLED),
  ga4MeasurementId.length > 0
)
const metaPixelStatus = computeStatus(
  toBoolean(process.env.NEXT_PUBLIC_ANALYTICS_META_PIXEL_ENABLED),
  metaPixelId.length > 0
)
const yandexStatus = computeStatus(
  toBoolean(process.env.NEXT_PUBLIC_ANALYTICS_YANDEX_METRICA_ENABLED),
  yandexCounterId.length > 0
)

export const analyticsConfig = {
  consent: {
    storageKey: 'finsite.analytics.consent',
    eventName: 'analytics:consent-changed',
  },
  ga4: {
    measurementId: ga4MeasurementId,
    status: ga4Status as const,
    enabled: ga4Status === 'ready',
  },
  metaPixel: {
    pixelId: metaPixelId,
    status: metaPixelStatus as const,
    enabled: metaPixelStatus === 'ready',
  },
  yandexMetrica: {
    counterId: yandexCounterId,
    status: yandexStatus as const,
    enabled: yandexStatus === 'ready',
  },
}

export type AnalyticsConfig = typeof analyticsConfig
