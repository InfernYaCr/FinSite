/* eslint-disable no-console */
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const {
  faker,
  SEED,
  makeCitySeedData,
  makeTagSeedData,
  makeOrganizationData,
  makeOfferData,
  makeReviewsData,
  randomInt,
} = require('./factories.cjs')

const prisma = new PrismaClient()

async function clearDatabase() {
  await prisma.clickTracking.deleteMany()
  await prisma.review.deleteMany()
  // Implicit many-to-many will be cleared with Offer deletion
  await prisma.offer.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.city.deleteMany()
}

async function seed() {
  console.log(`Seeding database with deterministic demo data (seed=${SEED})...`)

  // Reset RNG in case factories were imported elsewhere first
  faker.seed(SEED)

  // 1) Clear existing data
  await clearDatabase()

  // 2) Cities
  const citySeed = makeCitySeedData()
  const cities = []
  for (const c of citySeed) {
    const created = await prisma.city.create({ data: c })
    cities.push(created)
  }
  console.log(`Created ${cities.length} cities`)

  // 3) Tags
  const tagSeed = makeTagSeedData()
  const tags = []
  for (const t of tagSeed) {
    const created = await prisma.tag.create({ data: t })
    tags.push(created)
  }
  console.log(`Created ${tags.length} tags`)

  // 4) Organizations (8–10)
  const orgCount = 9
  const orgs = []
  for (let i = 0; i < orgCount; i++) {
    const data = makeOrganizationData(i, cities)
    const created = await prisma.organization.create({ data })
    orgs.push(created)
  }
  console.log(`Created ${orgs.length} organizations`)

  // 5) Offers (50+)
  const offerCount = 60
  const offers = []
  for (let i = 0; i < offerCount; i++) {
    const org = faker.helpers.arrayElement(orgs)
    const offerData = makeOfferData(org, cities, tags)

    // Create offer without tags first
    const { tags: selectedTags, ...plainOffer } = offerData
    const createdOffer = await prisma.offer.create({ data: plainOffer })

    // Connect tags after creation
    if (selectedTags && selectedTags.length > 0) {
      await prisma.offer.update({
        where: { id: createdOffer.id },
        data: {
          tags: {
            connect: selectedTags.map((t) => ({ id: t.id })),
          },
        },
      })
    }

    // Reviews (0–5 for published offers, fewer for drafts/archived)
    const reviewCount =
      createdOffer.status === 'PUBLISHED' ? randomInt(0, 5) : randomInt(0, 2)
    const reviewsData = makeReviewsData(createdOffer, reviewCount)
    for (const r of reviewsData) {
      await prisma.review.create({ data: r })
    }

    offers.push(createdOffer)
  }
  console.log(`Created ${offers.length} offers with sample reviews`)
}

seed()
  .then(async () => {
    console.log('Seed complete.')
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
