import { analyticsConfig } from './config'

export const logAnalyticsConfiguration = () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') {
    return
  }

  const { ga4, metaPixel, yandexMetrica } = analyticsConfig

  const entries: Array<[string, string]> = [
    ['GA4', ga4.status],
    ['Meta Pixel', metaPixel.status],
    ['Yandex Metrica', yandexMetrica.status],
  ]

  entries.forEach(([name, status]) => {
    if (status !== 'ready') {
      console.info(`Analytics → ${name} is ${status}`)
    }
  })
}
