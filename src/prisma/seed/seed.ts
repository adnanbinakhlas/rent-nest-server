/* eslint-disable no-console */
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { Prisma, PrismaClient, UserRole } from "../generated/prisma/client";
import prisma from "../../app/libs/prisma";

/* ────────────────────────────────────────────────────────────────
 * CONFIG — tune these to control how "massive" the dataset is.
 * ──────────────────────────────────────────────────────────────── */

const CONFIG = {
  ADMIN_COUNT: 5,
  LANDLORD_COUNT: 150,
  TENANT_COUNT: 600,

  CATEGORY_COUNT: 8, // capped by CATEGORY_NAMES.length below
  AMENITY_COUNT: 25, // capped by AMENITY_NAMES.length below

  PROPERTIES_COUNT: 1500,

  // Insert this many rows per createMany() call. Keeps us under
  // Postgres' bound parameter limit and memory footprint sane.
  BATCH_SIZE: 1000,

  // Every seeded user gets this password (hashed once, reused everywhere).
  DEFAULT_PASSWORD: "Password123!",
} as const;

const CITIES = [
  {
    city: "Dhaka",
    areas: [
      "Gulshan",
      "Banani",
      "Dhanmondi",
      "Uttara",
      "Mirpur",
      "Mohammadpur",
      "Bashundhara R/A",
      "Baridhara",
      "Motijheel",
      "Badda",
    ],
    lat: [23.7, 23.88],
    lng: [90.34, 90.44],
  },
  {
    city: "Chattogram",
    areas: [
      "Agrabad",
      "Khulshi",
      "Nasirabad",
      "Panchlaish",
      "Halishahar",
      "GEC Circle",
    ],
    lat: [22.3, 22.42],
    lng: [91.78, 91.86],
  },
  {
    city: "Sylhet",
    areas: ["Zindabazar", "Amberkhana", "Shahjalal Upashahar", "Subid Bazar"],
    lat: [24.88, 24.92],
    lng: [91.85, 91.89],
  },
  {
    city: "Khulna",
    areas: ["Sonadanga", "Khalishpur", "Boyra", "Daulatpur"],
    lat: [22.79, 22.85],
    lng: [89.53, 89.58],
  },
  {
    city: "Rajshahi",
    areas: ["Shaheb Bazar", "Uposhohor", "Rajpara", "Boalia"],
    lat: [24.36, 24.4],
    lng: [88.58, 88.63],
  },
  {
    city: "Barishal",
    areas: ["Band Road", "Sadar Road", "Rupatali"],
    lat: [22.68, 22.72],
    lng: [90.35, 90.39],
  },
  {
    city: "Rangpur",
    areas: ["Jahaj Company More", "Dhap", "Shapla Chattar"],
    lat: [25.73, 25.77],
    lng: [89.23, 89.28],
  },
  {
    city: "Mymensingh",
    areas: ["Ganginarpar", "Chorpara", "Kalibari"],
    lat: [24.73, 24.77],
    lng: [90.39, 90.43],
  },
] as const;

const CATEGORY_NAMES = [
  {
    name: "Apartment",
    description: "Self-contained residential unit within a larger building",
  },
  { name: "Flat", description: "Residential unit typically on a single floor" },
  { name: "House", description: "Standalone residential building" },
  {
    name: "Studio",
    description: "Single-room unit combining living and sleeping space",
  },
  { name: "Duplex", description: "Two-level residential unit" },
  {
    name: "Penthouse",
    description: "Top-floor unit, usually with premium finishes",
  },
  {
    name: "Sublet / Room",
    description: "Single furnished room within a shared unit",
  },
  {
    name: "Commercial Space",
    description: "Space suited for office or retail use",
  },
] as const;

const AMENITY_NAMES = [
  "WiFi",
  "Air Conditioning",
  "Parking",
  "Elevator",
  "Generator Backup",
  "Gas Line",
  "Security Guard",
  "CCTV Surveillance",
  "24/7 Water Supply",
  "Balcony",
  "Rooftop Access",
  "Gym",
  "Swimming Pool",
  "Furnished",
  "Intercom",
  "Fire Extinguisher",
  "Servant Room",
  "Dining Space",
  "Study Room",
  "Kids Play Area",
  "Community Hall",
  "Mosque Nearby",
  "School Nearby",
  "Hospital Nearby",
  "Shopping Mall Nearby",
] as const;

const PROPERTY_ADJECTIVES = [
  "Spacious",
  "Cozy",
  "Modern",
  "Elegant",
  "Sunlit",
  "Newly Renovated",
  "Family-Friendly",
  "Fully Furnished",
  "Quiet",
  "Well-Ventilated",
];

/* ────────────────────────────────────────────────────────────────
 * UTILS
 * ──────────────────────────────────────────────────────────────── */

function randomInt(min: number, max: number): number {
  return faker.number.int({ min, max });
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return faker.number.float({ min, max, fractionDigits: decimals });
}

function pick<T>(arr: readonly T[]): T {
  return faker.helpers.arrayElement(arr);
}

function bdPhoneNumber(): string {
  const prefixes = ["13", "14", "15", "16", "17", "18", "19"];
  return `+880${pick(prefixes)}${faker.string.numeric(8)}`;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size)
    chunks.push(arr.slice(i, i + size));
  return chunks;
}

async function batchInsert<T>(
  items: T[],
  batchSize: number,
  insertFn: (batch: T[]) => Promise<{ count: number }>,
  label: string,
): Promise<number> {
  if (items.length === 0) {
    console.log(`  [${label}] nothing to insert`);
    return 0;
  }

  const chunks = chunkArray(items, batchSize);
  let total = 0;

  for (let i = 0; i < chunks.length; i++) {
    const result = await insertFn(chunks[i] as T[]);
    total += result.count;
    console.log(
      `  [${label}] batch ${i + 1}/${chunks.length} inserted (${total}/${items.length})`,
    );
  }

  return total;
}

/* ────────────────────────────────────────────────────────────────
 * USERS (admins, landlords, tenants)
 * ──────────────────────────────────────────────────────────────── */

type SeedUser = Prisma.UserCreateManyInput & { id: string; role: UserRole };

function buildUser(role: UserRole, passwordHash: string): SeedUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id: faker.string.uuid(),
    fullname: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    password: passwordHash,
    phone: bdPhoneNumber(),
    avatar: faker.datatype.boolean({ probability: 0.7 })
      ? faker.image.avatar()
      : null,
    role,
    status: faker.datatype.boolean({ probability: 0.95 }) ? "ACTIVE" : "BANNED",
    isVerified: faker.datatype.boolean({ probability: 0.9 }),
    isDeleted: false,
  };
}

async function seedUsers(prisma: PrismaClient) {
  console.log("Seeding users...");

  const passwordHash = bcrypt.hashSync(CONFIG.DEFAULT_PASSWORD, 10);

  const admins = Array.from({ length: CONFIG.ADMIN_COUNT }, () =>
    buildUser("ADMIN", passwordHash),
  );
  const landlords = Array.from({ length: CONFIG.LANDLORD_COUNT }, () =>
    buildUser("LANDLORD", passwordHash),
  );
  const tenants = Array.from({ length: CONFIG.TENANT_COUNT }, () =>
    buildUser("TENANT", passwordHash),
  );

  const all = [...admins, ...landlords, ...tenants];

  await batchInsert(
    all,
    CONFIG.BATCH_SIZE,
    (batch) => prisma.user.createMany({ data: batch, skipDuplicates: true }),
    "Users",
  );

  console.log(
    `  -> ${admins.length} admins, ${landlords.length} landlords, ${tenants.length} tenants`,
  );

  return { admins, landlords, tenants, all };
}

/* ────────────────────────────────────────────────────────────────
 * CATEGORIES
 * ──────────────────────────────────────────────────────────────── */

type SeedCategory = Prisma.CategoryCreateManyInput & { id: string };

async function seedCategories(prisma: PrismaClient) {
  console.log("Seeding categories...");

  const categories: SeedCategory[] = CATEGORY_NAMES.slice(
    0,
    CONFIG.CATEGORY_COUNT,
  ).map((c) => ({
    id: faker.string.uuid(),
    name: c.name,
    description: c.description,
  }));

  await prisma.category.createMany({ data: categories, skipDuplicates: true });

  console.log(`  -> ${categories.length} categories`);

  return categories;
}

/* ────────────────────────────────────────────────────────────────
 * AMENITIES
 * ──────────────────────────────────────────────────────────────── */

type SeedAmenity = Prisma.AmenityCreateManyInput & { id: string };

async function seedAmenities(prisma: PrismaClient) {
  console.log("Seeding amenities...");

  const amenities: SeedAmenity[] = AMENITY_NAMES.slice(
    0,
    CONFIG.AMENITY_COUNT,
  ).map((name) => ({
    id: faker.string.uuid(),
    name,
  }));

  await prisma.amenity.createMany({ data: amenities, skipDuplicates: true });

  console.log(`  -> ${amenities.length} amenities`);

  return amenities;
}

/* ────────────────────────────────────────────────────────────────
 * PROPERTIES
 * ──────────────────────────────────────────────────────────────── */

type SeedProperty = Prisma.PropertyCreateManyInput & { id: string };

function buildProperty(
  landlords: SeedUser[],
  categories: SeedCategory[],
): SeedProperty {
  const location = pick(CITIES);
  const area = pick(location.areas);
  const category = pick(categories);
  const bedrooms = randomInt(1, 5);
  const furnished = faker.datatype.boolean({ probability: 0.4 });
  const availableFrom = faker.date.soon({ days: 90 });

  return {
    id: faker.string.uuid(),
    landlordId: pick(landlords).id,
    categoryId: category.id,
    title: `${pick(PROPERTY_ADJECTIVES)} ${bedrooms}-Bed ${category.name} in ${area}`,
    description: faker.lorem.paragraphs({ min: 2, max: 4 }, "\n\n"),
    address: `${faker.location.buildingNumber()}, Road ${randomInt(1, 30)}, ${area}`,
    city: location.city,
    area,
    latitude: randomFloat(location.lat[0], location.lat[1], 6),
    longitude: randomFloat(location.lng[0], location.lng[1], 6),
    monthlyRent: randomInt(8, 150) * 1000,
    securityDeposit: randomInt(16, 300) * 1000,
    bedrooms,
    bathrooms: randomInt(1, Math.max(2, bedrooms - 1)),
    floor: randomInt(0, 12),
    furnished,
    size: randomInt(450, 3200),
    sizeUnit: "SQFT",
    availableFrom,
    available: faker.datatype.boolean({ probability: 0.8 }),
    status: faker.datatype.boolean({ probability: 0.75 })
      ? "AVAILABLE"
      : "RENTED",
  };
}

async function seedProperties(
  prisma: PrismaClient,
  landlords: SeedUser[],
  categories: SeedCategory[],
) {
  console.log("Seeding properties...");

  const properties: SeedProperty[] = Array.from(
    { length: CONFIG.PROPERTIES_COUNT },
    () => buildProperty(landlords, categories),
  );

  await batchInsert(
    properties,
    CONFIG.BATCH_SIZE,
    (batch) =>
      prisma.property.createMany({ data: batch, skipDuplicates: true }),
    "Properties",
  );

  console.log(`  -> ${properties.length} properties`);

  return properties;
}

/* ────────────────────────────────────────────────────────────────
 * MAIN
 * ──────────────────────────────────────────────────────────────── */

async function main() {
  const start = Date.now();
  console.log("Starting streamlined database seed...\n");

  // Independent tables
  const { admins, landlords, tenants, all: users } = await seedUsers(prisma);
  const categories = await seedCategories(prisma);
  const amenities = await seedAmenities(prisma);

  // Core dependent table
  const properties = await seedProperties(prisma, landlords, categories);

  const seconds = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nSeed complete in ${seconds}s.`);
  console.log(
    `  Users: ${users.length} (${admins.length} admins, ${landlords.length} landlords, ${tenants.length} tenants)`,
  );
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Amenities: ${amenities.length}`);
  console.log(`  Properties: ${properties.length}`);
  console.log(
    `\nAll seeded users share the password: "${CONFIG.DEFAULT_PASSWORD}"`,
  );
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
