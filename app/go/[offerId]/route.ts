import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

function parseClientIp(req: NextRequest): string | undefined {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim()
  const rip = req.headers.get('x-real-ip')
  if (rip) return rip
  return undefined
}

function isValidId(id: string | undefined): id is string {
  return !!id && id.length >= 10
}

export async function GET(
  req: NextRequest,
  { params }: { params: { offerId: string } }
): Promise<Response> {
  const { offerId } = params
  const requestUrl = new URL(req.url)
  const search = requestUrl.searchParams

  // Basic param validation
  if (!isValidId(offerId)) {
    const msg = { error: 'Invalid offer id' }
    console.warn(
      JSON.stringify({
        level: 'warn',
        event: 'offer_click_invalid_id',
        offerId,
        requestUrl: requestUrl.toString(),
        ts: new Date().toISOString(),
      })
    )
    return NextResponse.json(msg, { status: 400 })
  }

  try {
    const offer = await prisma.offer.findUnique({ where: { id: offerId } })

    if (!offer || !offer.url) {
      console.warn(
        JSON.stringify({
          level: 'warn',
          event: 'offer_click_not_found',
          offerId,
          requestUrl: requestUrl.toString(),
          ts: new Date().toISOString(),
        })
      )
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    const utmSource = search.get('utm_source') || undefined
    const utmMedium = search.get('utm_medium') || undefined
    const utmCampaign = search.get('utm_campaign') || undefined

    // Common affiliate/subid variations we want to log forward for analytics
    const subid =
      search.get('subid') || search.get('sub_id') || search.get('aff_sub') || undefined

    const userAgent = req.headers.get('user-agent') || undefined
    const referrerHeader = req.headers.get('referer') || req.headers.get('referrer') || undefined
    const ipAddress = parseClientIp(req)

    // Persist click tracking (store known UTM fields; retain original request URL (with query)
    // in referrer field if no HTTP referrer was sent, so we keep subid-like params for analysis)
    await prisma.clickTracking.create({
      data: {
        offerId: offer.id,
        type: 'CLICK',
        userAgent,
        referrer: referrerHeader ?? requestUrl.toString(),
        ipAddress,
        utmSource,
        utmMedium,
        utmCampaign: utmCampaign ?? subid,
      },
    })

    // Structured analytics-friendly log
    console.info(
      JSON.stringify({
        level: 'info',
        event: 'offer_click',
        offerId: offer.id,
        partnerUrl: offer.url,
        utm: { source: utmSource, medium: utmMedium, campaign: utmCampaign },
        subid,
        ip: ipAddress,
        referrer: referrerHeader,
        requestUrl: requestUrl.toString(),
        ts: new Date().toISOString(),
      })
    )

    // Build redirect to partner URL. Preserve inbound params if not already present.
    let target: URL
    try {
      target = new URL(offer.url)
    } catch {
      // If the URL in DB is invalid, don't crash; return 500
      console.error(
        JSON.stringify({
          level: 'error',
          event: 'offer_click_invalid_partner_url',
          offerId: offer.id,
          partnerUrl: offer.url,
          ts: new Date().toISOString(),
        })
      )
      return NextResponse.json({ error: 'Invalid partner URL' }, { status: 500 })
    }

    // Forward query params for tracking unless already set on partner URL
    for (const [key, value] of search.entries()) {
      if (!target.searchParams.has(key)) {
        target.searchParams.set(key, value)
      }
    }

    return NextResponse.redirect(target, 302)
  } catch (err: unknown) {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'offer_click_error',
        offerId,
        message: err instanceof Error ? err.message : String(err),
        ts: new Date().toISOString(),
      })
    )
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
