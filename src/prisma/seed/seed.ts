/* eslint-disable no-console */
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import prisma from "../../app/libs/prisma";
import {
  PaymentStatus,
  PropertyStatus,
  RentalRequestStatus,
  Unit,
  UserRole,
} from "../generated/prisma/client";

// ==========================================
// ⚙️ GLOBAL SEEDING CONFIGURATION
// ==========================================
const SEED_CONFIG = {
  NUM_LANDLORDS: 75, // Total number of landlords to create
  NUM_TENANTS: 95, // Total number of tenants to create
  MIN_PROPERTIES_PER_LANDLORD: 1, // Minimum properties a landlord can own
  MAX_PROPERTIES_PER_LANDLORD: 5, // Maximum properties a landlord can own
  IMAGES_PER_PROPERTY: 3, // Number of images generated per property
  DEFAULT_PASSWORD: "Password123!", // Plain text password to hash
  SALT_ROUNDS: 10, // Bcrypt work factor
};

async function main() {
  console.log("🌱 Starting database seeding...");

  // Generate the password hash once to keep the seed script fast
  console.log("Hashing default password...");
  const hashedPassword = await bcrypt.hash(
    SEED_CONFIG.DEFAULT_PASSWORD,
    SEED_CONFIG.SALT_ROUNDS,
  );

  console.log("Sweeping old data...");
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rentalRequest.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.property.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding Categories...");
  const categoryNames = ["Apartment", "House", "Studio", "Condo", "Villa"];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.create({
        data: {
          name,
          description: faker.lorem.sentence(),
        },
      }),
    ),
  );

  console.log("Seeding Amenities...");
  const amenityNames = [
    "WiFi",
    "Air Conditioning",
    "Pool",
    "Gym",
    "Parking",
    "Balcony",
    "Heating",
    "Pet Friendly",
  ];
  const amenities = await Promise.all(
    amenityNames.map((name) =>
      prisma.amenity.create({
        data: { name },
      }),
    ),
  );

  console.log(
    `Seeding Users (${SEED_CONFIG.NUM_LANDLORDS} Landlords, ${SEED_CONFIG.NUM_TENANTS} Tenants)...`,
  );
  const landlords = await Promise.all(
    Array.from({ length: SEED_CONFIG.NUM_LANDLORDS }).map(() =>
      prisma.user.create({
        data: {
          fullname: faker.person.fullName(),
          email: faker.internet.email(),
          password: hashedPassword, // Using the pre-hashed password
          phone: faker.phone.number(),
          avatar: faker.image.avatar(),
          role: UserRole.LANDLORD,
        },
      }),
    ),
  );

  const tenants = await Promise.all(
    Array.from({ length: SEED_CONFIG.NUM_TENANTS }).map(() =>
      prisma.user.create({
        data: {
          fullname: faker.person.fullName(),
          email: faker.internet.email(),
          password: hashedPassword, // Using the pre-hashed password
          phone: faker.phone.number(),
          avatar: faker.image.avatar(),
          role: UserRole.TENANT,
        },
      }),
    ),
  );

  await prisma.user.create({
    data: {
      fullname: "System Admin",
      email: "admin@system.com",
      password: hashedPassword, // Using the pre-hashed password
      phone: faker.phone.number(),
      role: UserRole.ADMIN,
    },
  });

  console.log("Seeding Properties...");
  for (const landlord of landlords) {
    const propertyCount = faker.number.int({
      min: SEED_CONFIG.MIN_PROPERTIES_PER_LANDLORD,
      max: SEED_CONFIG.MAX_PROPERTIES_PER_LANDLORD,
    });

    for (let i = 0; i < propertyCount; i++) {
      const category = faker.helpers.arrayElement(categories);
      const randomAmenities = faker.helpers.arrayElements(
        amenities,
        faker.number.int({ min: 2, max: 5 }),
      );

      const property = await prisma.property.create({
        data: {
          landlordId: landlord.id,
          categoryId: category.id,
          title: faker.lorem.words(3),
          description: faker.lorem.paragraphs(2),
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          area: faker.location.state(),

          latitude: faker.number.float({
            min: -90,
            max: 90,
            fractionDigits: 6,
          }),
          longitude: faker.number.float({
            min: -99,
            max: 99,
            fractionDigits: 6,
          }),

          monthlyRent: faker.number.float({
            min: 500,
            max: 5000,
            fractionDigits: 2,
          }),
          securityDeposit: faker.number.float({
            min: 500,
            max: 5000,
            fractionDigits: 2,
          }),
          bedrooms: faker.number.int({ min: 1, max: 5 }),
          bathrooms: faker.number.int({ min: 1, max: 3 }),
          floor: faker.number.int({ min: 1, max: 20 }),
          furnished: faker.datatype.boolean(),
          size: faker.number.int({ min: 300, max: 3000 }),
          sizeUnit: faker.helpers.arrayElement([Unit.SQFT, Unit.SQM]),
          availableFrom: faker.date.future(),
          available: true,
          status: PropertyStatus.AVAILABLE,

          propertyAmenity: {
            create: randomAmenities.map((amenity) => ({
              amenityId: amenity.id,
            })),
          },
          images: {
            create: Array.from({ length: SEED_CONFIG.IMAGES_PER_PROPERTY }).map(
              (_, index) => ({
                imageUrl: faker.image.url(),
                isPrimary: index === 0,
              }),
            ),
          },
        },
      });

      const shouldHaveHistory = faker.datatype.boolean();

      if (shouldHaveHistory) {
        const tenant = faker.helpers.arrayElement(tenants);
        const monthlyRent = property.monthlyRent;
        const moveInDate = faker.date.recent();

        const rentalRequest = await prisma.rentalRequest.create({
          data: {
            propertyId: property.id,
            tenantId: tenant.id,
            landlordId: landlord.id,
            moveInDate: moveInDate,
            rentalDuration: faker.number.int({ min: 6, max: 24 }),
            message: faker.lorem.sentence(),
            monthlyRent: monthlyRent,
            status: RentalRequestStatus.COMPLETED,
            approvedAt: moveInDate,
          },
        });

        await prisma.payment.create({
          data: {
            rentalRequestId: rentalRequest.id,
            tenantId: tenant.id,
            landlordId: landlord.id,
            amount: monthlyRent,
            currency: "usd",
            stripeSessionId: `cs_test_${faker.string.alphanumeric(24)}`,
            stripePaymentIntentId: `pi_${faker.string.alphanumeric(24)}`,
            stripeChargeId: `ch_${faker.string.alphanumeric(24)}`,
            status: PaymentStatus.SUCCEEDED,
            paidAt: moveInDate,
            paymentMethod: "card",
          },
        });

        await prisma.review.create({
          data: {
            propertyId: property.id,
            tenantId: tenant.id,
            rentalRequestId: rentalRequest.id,
            rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
            comment: faker.lorem.paragraph(),
          },
        });
      }
    }
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
