import { PrismaClient } from '@prisma/client'

// Prevent instantiating multiple PrismaClient instances in dev/hot-reload
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma: PrismaClient =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Optional: example log listeners for visibility during development/analytics
prisma.$on('error', (e) => {
  console.error(
    JSON.stringify({
      level: 'error',
      event: 'prisma_error',
      target: e.target,
      message: e.message,
      timestamp: new Date().toISOString(),
    })
  )
})
prisma.$on('warn', (e) => {
  console.warn(
    JSON.stringify({
      level: 'warn',
      event: 'prisma_warn',
      target: e.target,
      message: e.message,
      timestamp: new Date().toISOString(),
    })
  )
})
