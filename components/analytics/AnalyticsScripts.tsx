'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

import { analyticsConfig } from '@/src/lib/analytics/config'
import {
  AnalyticsConsentStatus,
  getAnalyticsConsentStatus,
  onAnalyticsConsentChange,
} from '@/src/lib/analytics/consent'
import { logAnalyticsConfiguration } from '@/src/lib/analytics/runtime'

const { ga4, metaPixel, yandexMetrica } = analyticsConfig

const DISABLED_STUB_FLAG = '__finsiteAnalyticsDisabled__'

type DisabledStubFunction = ((...args: unknown[]) => void) & { [DISABLED_STUB_FLAG]?: boolean }

const createDisabledStub = (): DisabledStubFunction => {
  const fn = ((..._args: unknown[]) => undefined) as DisabledStubFunction
  fn[DISABLED_STUB_FLAG] = true
  return fn
}

const installDisabledIntegrationStubs = () => {
  if (typeof window === 'undefined') {
    return
  }

  if (!ga4.enabled) {
    if (!Array.isArray(window.dataLayer)) {
      window.dataLayer = []
    }
    if (typeof window.gtag !== 'function' || !(window.gtag as DisabledStubFunction)[DISABLED_STUB_FLAG]) {
      window.gtag = createDisabledStub()
    }
  }

  if (!metaPixel.enabled && typeof window.fbq !== 'function') {
    const stub = createDisabledStub() as DisabledStubFunction & {
      push?: (...args: unknown[]) => void
      callMethod?: (...args: unknown[]) => void
      queue?: unknown[]
    }
    stub.push = (...args: unknown[]) => {
      stub(...args)
    }
    stub.callMethod = (...args: unknown[]) => {
      stub(...args)
    }
    stub.queue = []
    window.fbq = stub as typeof window.fbq
    const fbWindow = window as typeof window & { _fbq?: typeof window.fbq }
    if (!fbWindow._fbq) {
      fbWindow._fbq = window.fbq
    }
  }

  if (!yandexMetrica.enabled && typeof window.ym !== 'function') {
    window.ym = createDisabledStub() as typeof window.ym
  }
}

export default function AnalyticsScripts() {
  const [consentStatus, setConsentStatus] = useState<AnalyticsConsentStatus>('unknown')

  useEffect(() => {
    installDisabledIntegrationStubs()
    logAnalyticsConfiguration()

    setConsentStatus(getAnalyticsConsentStatus())
    return onAnalyticsConsentChange(setConsentStatus)
  }, [])

  const consentGranted = consentStatus === 'granted'

  const shouldLoadGa4 = consentGranted && ga4.enabled
  const shouldLoadMetaPixel = consentGranted && metaPixel.enabled
  const shouldLoadYandexMetrica = consentGranted && yandexMetrica.enabled

  if (!shouldLoadGa4 && !shouldLoadMetaPixel && !shouldLoadYandexMetrica) {
    return null
  }

  return (
    <>
      {shouldLoadGa4 && (
        <>
          <Script
            id="ga4-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4.measurementId)}`}
          />
          <Script id="ga4-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(ga4.measurementId)}, {
                anonymize_ip: true,
                allow_google_signals: false
              });
            `}
          </Script>
        </>
      )}

      {shouldLoadMetaPixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !(function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)})(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', ${JSON.stringify(metaPixel.pixelId)});
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {shouldLoadYandexMetrica && (
        <Script id="yandex-metrica" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              k=e.createElement(t),a=e.getElementsByTagName(t)[0];
              k.async=1;k.src=r;a.parentNode.insertBefore(k,a);
            })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
            ym(${JSON.stringify(yandexMetrica.counterId)}, 'init', {
              defer: true,
              clickmap: true,
              trackLinks: true,
              accurateTrackBounce: true
            });
          `}
        </Script>
      )}
    </>
  )
}
