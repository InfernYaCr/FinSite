const { faker } = require('@faker-js/faker')

// Ensure deterministic, locale-friendly content
const SEED = 424242
faker.setDefaultLocale('en')
faker.seed(SEED)

const OFFER_TYPES = ['DEAL', 'COUPON', 'DISCOUNT', 'EVENT', 'JOB']
const OFFER_STATUSES = ['PUBLISHED', 'DRAFT', 'ARCHIVED']
const REVIEW_RATINGS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE']

const BASE_DATE = new Date('2024-01-15T12:00:00Z')

function slugify(input) {
  return input
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function pickNUnique(arr, n) {
  const copy = [...arr]
  // Using faker's shuffle for deterministic randomness
  faker.helpers.shuffle(copy)
  return copy.slice(0, n)
}

function randomInt(min, max) {
  return faker.number.int({ min, max })
}

function randomBool(trueProbability = 0.5) {
  return faker.number.float({ min: 0, max: 1, fractionDigits: 3 }) < trueProbability
}

// City seed data (locale-friendly; mostly EN regions plus a few international)
const CITY_CATALOG = [
  { name: 'New York', state: 'NY', countryCode: 'US' },
  { name: 'Los Angeles', state: 'CA', countryCode: 'US' },
  { name: 'Chicago', state: 'IL', countryCode: 'US' },
  { name: 'Miami', state: 'FL', countryCode: 'US' },
  { name: 'Seattle', state: 'WA', countryCode: 'US' },
  { name: 'Austin', state: 'TX', countryCode: 'US' },
  { name: 'San Francisco', state: 'CA', countryCode: 'US' },
  { name: 'Boston', state: 'MA', countryCode: 'US' },
  { name: 'Denver', state: 'CO', countryCode: 'US' },
  { name: 'Atlanta', state: 'GA', countryCode: 'US' },
  { name: 'London', state: null, countryCode: 'GB' },
  { name: 'Berlin', state: null, countryCode: 'DE' },
  { name: 'Paris', state: null, countryCode: 'FR' },
  { name: 'Toronto', state: 'ON', countryCode: 'CA' },
  { name: 'Sydney', state: 'NSW', countryCode: 'AU' },
]

// Common tags for offers
const TAG_CATALOG = [
  'Technology',
  'Food & Drink',
  'Health & Wellness',
  'Beauty',
  'Travel',
  'Fitness',
  'Education',
  'Entertainment',
  'Home & Garden',
  'Automotive',
  'Pets',
  'Kids & Family',
  'Finance',
  'Real Estate',
  'Sports',
  'Music',
  'Art',
  'Fashion',
  'Outdoors',
  'Events',
]

function makeCitySeedData() {
  return CITY_CATALOG.map((c) => ({
    name: c.name,
    state: c.state || null,
    countryCode: c.countryCode,
    slug: slugify([c.name, c.state, c.countryCode].filter(Boolean).join(' ')),
  }))
}

function makeTagSeedData() {
  return TAG_CATALOG.map((name) => ({
    name,
    slug: slugify(name),
    description: `${name} related offers`,
  }))
}

function makeOrganizationData(index, cities) {
  const name = faker.company.name()
  const domain = slugify(name)
  const city = faker.helpers.arrayElement(cities)
  return {
    name: `${name} ${index + 1}`,
    description: faker.company.catchPhrase(),
    website: `https://www.${domain}.com`,
    cityId: city.id,
  }
}

function makeOfferData(org, cities, tags) {
  const chosenType = faker.helpers.arrayElement(OFFER_TYPES)
  const chosenStatus = faker.helpers.arrayElement(
    // Heavier weight for published offers
    randomBool(0.7) ? ['PUBLISHED', 'PUBLISHED', 'PUBLISHED', 'DRAFT'] : ['ARCHIVED', 'DRAFT']
  )

  // City: often the same as the org city, sometimes elsewhere
  const city = randomBool(0.7)
    ? cities.find((c) => c.id === org.cityId) || faker.helpers.arrayElement(cities)
    : faker.helpers.arrayElement(cities)

  let title
  switch (chosenType) {
    case 'EVENT':
      title = `${faker.date.month()} ${faker.word.adjective()} ${faker.word.noun()} Event`
      break
    case 'JOB':
      title = `${faker.person.jobTitle()} at ${org.name}`
      break
    case 'COUPON':
      title = `${faker.word.adjective()} coupon on ${faker.commerce.productName()}`
      break
    case 'DISCOUNT':
      title = `${faker.number.int({ min: 10, max: 60 })}% off ${faker.commerce.productAdjective()} ${faker.commerce.product()}`
      break
    default:
      title = `${faker.commerce.productAdjective()} ${faker.commerce.product()} deal`
  }

  const desc = faker.lorem.paragraphs(randomInt(1, 2))

  const daysOffsetStart = randomInt(-45, 15)
  const startsAt = new Date(BASE_DATE.getTime() + daysOffsetStart * 24 * 60 * 60 * 1000)
  const durationDays = randomInt(3, 45)
  const endsAt = new Date(startsAt.getTime() + durationDays * 24 * 60 * 60 * 1000)

  // Ensure status aligns with dates a bit more naturally
  let status = chosenStatus
  if (status === 'PUBLISHED' && endsAt < BASE_DATE) status = 'ARCHIVED'
  if (status === 'ARCHIVED' && endsAt > BASE_DATE) status = 'PUBLISHED'

  const selectedTags = pickNUnique(tags, randomInt(1, 4))

  // Optional URL for some offers
  const url = randomBool(0.7) ? faker.internet.url() : null

  return {
    title,
    description: desc,
    status,
    type: chosenType,
    url,
    startsAt,
    endsAt,
    organizationId: org.id,
    cityId: city.id,
    tags: selectedTags.map((t) => ({ id: t.id, slug: t.slug })),
  }
}

function makeReviewsData(offer, count) {
  const items = []
  for (let i = 0; i < count; i++) {
    const ratingNum = randomInt(1, 5)
    const rating = REVIEW_RATINGS[ratingNum - 1]
    const title = faker.helpers.arrayElement([
      'Great value',
      'Highly recommended',
      'Decent overall',
      'Could be better',
      'Not worth it',
    ])
    const comment = faker.lorem.sentences(randomInt(1, 3))
    const createdAt = new Date(BASE_DATE.getTime() + randomInt(-60, 0) * 24 * 60 * 60 * 1000)

    items.push({
      rating,
      title,
      comment,
      offerId: offer.id,
      createdAt,
    })
  }
  return items
}

module.exports = {
  SEED,
  faker,
  slugify,
  makeCitySeedData,
  makeTagSeedData,
  makeOrganizationData,
  makeOfferData,
  makeReviewsData,
  OFFER_TYPES,
  OFFER_STATUSES,
  REVIEW_RATINGS,
  BASE_DATE,
  pickNUnique,
  randomInt,
  randomBool,
}
