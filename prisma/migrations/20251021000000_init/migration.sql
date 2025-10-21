-- Create Enums
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "OfferType" AS ENUM ('DEAL', 'COUPON', 'DISCOUNT', 'EVENT', 'JOB');
CREATE TYPE "ReviewRating" AS ENUM ('ONE', 'TWO', 'THREE', 'FOUR', 'FIVE');
CREATE TYPE "ClickType" AS ENUM ('VIEW', 'CLICK', 'APPLY', 'CALL', 'WEBSITE');

-- CreateTable City
CREATE TABLE "City" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "state" TEXT,
  "countryCode" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable Organization
CREATE TABLE "Organization" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "website" TEXT,
  "cityId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable Offer
CREATE TABLE "Offer" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "OfferStatus" NOT NULL DEFAULT 'PUBLISHED',
  "type" "OfferType" NOT NULL DEFAULT 'DEAL',
  "url" TEXT,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "organizationId" TEXT NOT NULL,
  "cityId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable Tag
CREATE TABLE "Tag" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable Review
CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "rating" "ReviewRating" NOT NULL,
  "title" TEXT,
  "comment" TEXT,
  "offerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable ClickTracking
CREATE TABLE "ClickTracking" (
  "id" TEXT NOT NULL,
  "offerId" TEXT NOT NULL,
  "type" "ClickType" NOT NULL DEFAULT 'CLICK',
  "userAgent" TEXT,
  "referrer" TEXT,
  "ipAddress" TEXT,
  "utmSource" TEXT,
  "utmMedium" TEXT,
  "utmCampaign" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClickTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable for implicit many-to-many Offer <-> Tag
CREATE TABLE "_OfferToTag" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

-- Indexes
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");
CREATE INDEX "Offer_organizationId_idx" ON "Offer"("organizationId");
CREATE INDEX "Offer_cityId_idx" ON "Offer"("cityId");
CREATE INDEX "Offer_status_endsAt_idx" ON "Offer"("status", "endsAt");
CREATE INDEX "Review_offerId_idx" ON "Review"("offerId");
CREATE INDEX "ClickTracking_offerId_createdAt_idx" ON "ClickTracking"("offerId", "createdAt");
CREATE UNIQUE INDEX "_OfferToTag_AB_unique" ON "_OfferToTag"("A", "B");
CREATE INDEX "_OfferToTag_B_index" ON "_OfferToTag"("B");

-- Foreign Keys
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClickTracking" ADD CONSTRAINT "ClickTracking_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_OfferToTag" ADD CONSTRAINT "_OfferToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_OfferToTag" ADD CONSTRAINT "_OfferToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
