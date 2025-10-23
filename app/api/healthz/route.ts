import { NextResponse } from 'next/server'

import { prisma } from '@/src/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', database: 'reachable' })
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error')
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'healthcheck_failed',
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      })
    )
    return NextResponse.json(
      { status: 'error', database: 'unreachable' },
      { status: 500 }
    )
  }
}
