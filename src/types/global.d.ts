export {}

type FacebookPixelFunction = {
  (...args: unknown[]): void
  loaded?: boolean
  version?: string
  queue?: unknown[]
  push?: (...args: unknown[]) => void
  callMethod?: (...args: unknown[]) => void
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: FacebookPixelFunction
    _fbq?: FacebookPixelFunction
    ym?: (...args: unknown[]) => void
  }
}
