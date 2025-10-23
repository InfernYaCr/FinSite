import { analyticsConfig } from './config'

export type AnalyticsConsentStatus = 'granted' | 'denied' | 'unknown'

export type AnalyticsConsentEventDetail = {
  status: AnalyticsConsentStatus
}

export const ANALYTICS_CONSENT_STORAGE_KEY = analyticsConfig.consent.storageKey
export const ANALYTICS_CONSENT_EVENT = analyticsConfig.consent.eventName

const parseStatus = (value: string | null): AnalyticsConsentStatus => {
  if (value === 'granted' || value === 'denied') {
    return value
  }
  return 'unknown'
}

const readFromStorage = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Unable to access analytics consent localStorage key', error)
    }
    return null
  }
}

const writeToStorage = (value: string | null) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (value === null) {
      window.localStorage.removeItem(ANALYTICS_CONSENT_STORAGE_KEY)
    } else {
      window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, value)
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Unable to persist analytics consent state', error)
    }
  }
}

const dispatchConsentChange = (status: AnalyticsConsentStatus) => {
  if (typeof window === 'undefined') {
    return
  }

  const event = new CustomEvent<AnalyticsConsentEventDetail>(ANALYTICS_CONSENT_EVENT, {
    detail: { status },
  })
  window.dispatchEvent(event)
}

export const getAnalyticsConsentStatus = (): AnalyticsConsentStatus => {
  return parseStatus(readFromStorage())
}

export const setAnalyticsConsentStatus = (status: AnalyticsConsentStatus) => {
  if (status === 'unknown') {
    writeToStorage(null)
  } else {
    writeToStorage(status)
  }
  dispatchConsentChange(status)
}

export const isAnalyticsConsentGranted = (): boolean => {
  return getAnalyticsConsentStatus() === 'granted'
}

type ConsentChangeCallback = (status: AnalyticsConsentStatus) => void

export const onAnalyticsConsentChange = (callback: ConsentChangeCallback): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handler: EventListener = (event) => {
    const detail = (event as CustomEvent<AnalyticsConsentEventDetail>).detail
    callback(detail?.status ?? getAnalyticsConsentStatus())
  }

  const storageHandler = (event: StorageEvent) => {
    if (event.key === ANALYTICS_CONSENT_STORAGE_KEY) {
      callback(parseStatus(event.newValue))
    }
  }

  window.addEventListener(ANALYTICS_CONSENT_EVENT, handler)
  window.addEventListener('storage', storageHandler)

  return () => {
    window.removeEventListener(ANALYTICS_CONSENT_EVENT, handler)
    window.removeEventListener('storage', storageHandler)
  }
}
