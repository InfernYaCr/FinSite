# Analytics integrations

FinSite supports Google Analytics 4 (GA4), Meta Pixel, and Yandex Metrica. Each integration is gated by an environment flag **and** requires the visitor to grant tracking consent before any third-party script is loaded. This keeps the bundle lean by default and aligns with privacy expectations for EU/RU markets.

## Environment-driven configuration

Set provider IDs alongside explicit enable flags in `.env` (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_ANALYTICS_GA4_ENABLED` | Toggles the GA4 loader on the client. Must be `true` in addition to providing the measurement ID. |
| `NEXT_PUBLIC_ANALYTICS_GA4_MEASUREMENT_ID` | GA4 measurement ID (e.g., `G-XXXXXXXXXX`). |
| `NEXT_PUBLIC_ANALYTICS_META_PIXEL_ENABLED` | Enables the Meta Pixel snippet when consent is granted. |
| `NEXT_PUBLIC_ANALYTICS_META_PIXEL_ID` | Meta Pixel ID (numeric). |
| `NEXT_PUBLIC_ANALYTICS_YANDEX_METRICA_ENABLED` | Enables the Yandex Metrica loader once consent is granted. |
| `NEXT_PUBLIC_ANALYTICS_YANDEX_METRICA_ID` | Yandex counter ID (numeric). |

> **Note:** Missing IDs mark an integration as `misconfigured`, so the corresponding script is not injected even when the enable flag is `true`.

## Consent-aware loading

Tracking code is only rendered when the stored consent state is `granted`:

- Consent is stored in `localStorage` under the key `finsite.analytics.consent` with values `granted` or `denied`.
- Updates broadcast a `CustomEvent` named `analytics:consent-changed` so cookie banners or settings panels can react without prop drilling.
- Helper utilities live in `src/lib/analytics/consent.ts`:
  - `getAnalyticsConsentStatus()` – read the current status (`'granted' | 'denied' | 'unknown'`).
  - `setAnalyticsConsentStatus(status)` – persist consent and emit the change event.
  - `onAnalyticsConsentChange(callback)` – subscribe to consent updates (includes cross-tab `storage` sync).

Embed these helpers inside your consent UI to ensure analytics is only enabled after explicit opt-in.

## Fallback behaviour when tracking is disabled

- Third-party network requests are skipped entirely—`<Script>` elements are not rendered, so nothing is downloaded from Google, Meta, or Yandex when toggles are off or consent is denied.
- For integrations disabled or misconfigured at build time, lightweight stubs (`window.gtag`, `window.fbq`, `window.ym`) are registered as no-ops to prevent runtime errors in application code that may still attempt to emit events.
- Configuration issues are surfaced via `console.info` in development, making misconfigured environments easy to spot without impacting production users.

The fallback guarantees that disabling tracking (either via env vars or user choice) leaves the app fully functional without loading the third-party bundles.

## Where the scripts live

All client-side wiring is contained in `components/analytics/AnalyticsScripts.tsx`. The component is inserted at the root layout (`app/layout.tsx`) so that scripts are mounted once per page, respecting Next.js streaming and avoiding double injection on nested routes.
