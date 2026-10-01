import path from "node:path";

process.loadEnvFile(
  path.resolve(import.meta.dirname, "../../../.env"),
);
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { normalizeSearch, slugify } from "@restaurant-platform/shared";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const IDS = {
  owner: "11111111-1111-4111-8111-111111111111",
  restaurant: "22222222-2222-4222-8222-222222222222",

  table2: "33333333-3333-4333-8333-333333333331",
  table4: "33333333-3333-4333-8333-333333333332",
  table6: "33333333-3333-4333-8333-333333333333",
  vip8: "33333333-3333-4333-8333-333333333334",

  cuisineVietnamese: "44444444-4444-4444-8444-444444444441",
  cuisineJapanese: "44444444-4444-4444-8444-444444444442",

  amenityParking: "55555555-5555-4555-8555-555555555551",
  amenityPrivateRoom: "55555555-5555-4555-8555-555555555552",
  amenityWifi: "55555555-5555-4555-8555-555555555553",

  setting: "66666666-6666-4666-8666-666666666661",

  bookingTable4: "77777777-7777-4777-8777-777777777771",
  bookingVip8: "77777777-7777-4777-8777-777777777772",

  bookingResourceTable4:
    "88888888-8888-4888-8888-888888888881",

  bookingResourceVip8:
    "88888888-8888-4888-8888-888888888882",
} as const;

function dateAt(
  date: string,
  hour: number,
  minute = 0,
  timezoneOffset = "+07:00",
) {
  return new Date(
    `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0",
    )}:00${timezoneOffset}`,
  );
}

async function main() {
  console.log("🌱 Starting database seed...");

  await prisma.$transaction(async (tx) => {
    // ==================================================
    // USER
    // ==================================================

    const owner = await tx.user.upsert({
      where: {
        id: IDS.owner,
      },
      update: {},
      create: {
        id: IDS.owner,
        email: "owner@hanoidining.local",
        phone: "0900000001",
        name: "Hanoi Dining Owner",
        role: "RESTAURANT_OWNER",
        passwordHash: null,
      },
    });

    // ==================================================
    // CUISINES
    // ==================================================

    const vietnameseCuisine = await tx.cuisine.upsert({
      where: {
        id: IDS.cuisineVietnamese,
      },
      update: {},
      create: {
        id: IDS.cuisineVietnamese,
        name: "Vietnamese",
        slug: "vietnamese",
      },
    });

    const japaneseCuisine = await tx.cuisine.upsert({
      where: {
        id: IDS.cuisineJapanese,
      },
      update: {},
      create: {
        id: IDS.cuisineJapanese,
        name: "Japanese",
        slug: "japanese",
      },
    });

    // ==================================================
    // AMENITIES
    // ==================================================

    const parking = await tx.amenity.upsert({
      where: {
        id: IDS.amenityParking,
      },
      update: {},
      create: {
        id: IDS.amenityParking,
        name: "Parking",
        slug: "parking",
      },
    });

    const privateRoom = await tx.amenity.upsert({
      where: {
        id: IDS.amenityPrivateRoom,
      },
      update: {},
      create: {
        id: IDS.amenityPrivateRoom,
        name: "Private Room",
        slug: "private-room",
      },
    });

    const wifi = await tx.amenity.upsert({
      where: {
        id: IDS.amenityWifi,
      },
      update: {},
      create: {
        id: IDS.amenityWifi,
        name: "Wi-Fi",
        slug: "wifi",
      },
    });

    // ==================================================
    // RESTAURANT
    // ==================================================

    const restaurantName = "Hanoi Dining House";

    const location = { city: "Hà Nội", district: "Hoàn Kiếm" };

    const restaurant = await tx.restaurant.upsert({
      where: {
        id: IDS.restaurant,
      },
      update: {
        searchName: normalizeSearch(restaurantName),
        citySlug: slugify(location.city),
        districtSlug: slugify(location.district),
      },
      create: {
        id: IDS.restaurant,
        ownerId: owner.id,

        name: restaurantName,
        searchName: normalizeSearch(restaurantName),
        slug: "hanoi-dining-house",
        description:
          "A sample restaurant used for development and booking engine testing.",

        status: "APPROVED",

        countryCode: "VN",
        city: location.city,
        district: location.district,
        citySlug: slugify(location.city),
        districtSlug: slugify(location.district),
        address: "10 Trang Tien, Hoan Kiem, Hanoi",

        latitude: 21.0258,
        longitude: 105.8525,

        timezone: "Asia/Ho_Chi_Minh",
        currencyCode: "VND",

        priceLevel: 3,
      },
    });

    // ==================================================
    // RESTAURANT -> CUISINE
    // ==================================================

    await tx.restaurantCuisine.createMany({
      data: [
        {
          restaurantId: restaurant.id,
          cuisineId: vietnameseCuisine.id,
        },
        {
          restaurantId: restaurant.id,
          cuisineId: japaneseCuisine.id,
        },
      ],
      skipDuplicates: true,
    });

    // ==================================================
    // RESTAURANT -> AMENITIES
    // ==================================================

    await tx.restaurantAmenity.createMany({
      data: [
        {
          restaurantId: restaurant.id,
          amenityId: parking.id,
        },
        {
          restaurantId: restaurant.id,
          amenityId: privateRoom.id,
        },
        {
          restaurantId: restaurant.id,
          amenityId: wifi.id,
        },
      ],
      skipDuplicates: true,
    });

    // ==================================================
    // BOOKING SETTINGS
    // ==================================================

    await tx.restaurantBookingSetting.upsert({
      where: {
        id: IDS.setting,
      },
      update: {
        bookingDurationMinutes: 120,
        slotIntervalMinutes: 30,
        bufferMinutes: 15,
        cancellationDeadlineMins: 120,
      },
      create: {
        id: IDS.setting,
        restaurantId: restaurant.id,

        bookingDurationMinutes: 120,
        slotIntervalMinutes: 30,
        bufferMinutes: 15,
        cancellationDeadlineMins: 120,
      },
    });

    // ==================================================
    // OPENING HOURS
    // ==================================================

    const openingHours = [
      ["MONDAY", 10, 0, 22, 0],
      ["TUESDAY", 10, 0, 22, 0],
      ["WEDNESDAY", 10, 0, 22, 0],
      ["THURSDAY", 10, 0, 22, 0],
      ["FRIDAY", 10, 0, 23, 0],
      ["SATURDAY", 10, 0, 23, 0],
      ["SUNDAY", 10, 0, 22, 0],
    ] as const;

    for (const [dayOfWeek, openHour, openMinute, closeHour, closeMinute] of openingHours) {
      await tx.openingHour.upsert({
        where: {
          restaurantId_dayOfWeek: {
            restaurantId: restaurant.id,
            dayOfWeek,
          },
        },
        update: {
          openTime: new Date(
            `1970-01-01T${String(openHour).padStart(
              2,
              "0",
            )}:${String(openMinute).padStart(2, "0")}:00Z`,
          ),
          closeTime: new Date(
            `1970-01-01T${String(closeHour).padStart(
              2,
              "0",
            )}:${String(closeMinute).padStart(2, "0")}:00Z`,
          ),
        },
        create: {
          restaurantId: restaurant.id,
          dayOfWeek,
          openTime: new Date(
            `1970-01-01T${String(openHour).padStart(
              2,
              "0",
            )}:${String(openMinute).padStart(2, "0")}:00Z`,
          ),
          closeTime: new Date(
            `1970-01-01T${String(closeHour).padStart(
              2,
              "0",
            )}:${String(closeMinute).padStart(2, "0")}:00Z`,
          ),
        },
      });
    }

    // ==================================================
    // RESOURCES
    // ==================================================

    const resources = [
      {
        id: IDS.table2,
        name: "Table 2",
        type: "TABLE" as const,
        capacity: 2,
        priority: 10,
      },
      {
        id: IDS.table4,
        name: "Table 4",
        type: "TABLE" as const,
        capacity: 4,
        priority: 20,
      },
      {
        id: IDS.table6,
        name: "Table 6",
        type: "TABLE" as const,
        capacity: 6,
        priority: 30,
      },
      {
        id: IDS.vip8,
        name: "VIP Room 8",
        type: "VIP_ROOM" as const,
        capacity: 8,
        priority: 100,
        reservationFeeAmount: 500000,
      },
    ];

    for (const resource of resources) {
      await tx.restaurantResource.upsert({
        where: {
          id: resource.id,
        },
        update: {
          name: resource.name,
          type: resource.type,
          capacity: resource.capacity,
          priority: resource.priority,
          status: "ACTIVE",
          reservationFeeAmount: resource.reservationFeeAmount,
        },
        create: {
          id: resource.id,
          restaurantId: restaurant.id,

          name: resource.name,
          type: resource.type,
          status: "ACTIVE",
          capacity: resource.capacity,
          priority: resource.priority,
          reservationFeeAmount: resource.reservationFeeAmount,
        },
      });
    }

    // ==================================================
    // RESTAURANT IMAGE
    // ==================================================

    const imageId = "99999999-9999-4999-8999-999999999991";

    await tx.restaurantImage.upsert({
      where: {
        id: imageId,
      },
      update: {},
      create: {
        id: imageId,
        restaurantId: restaurant.id,
        url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
        altText: "Hanoi Dining House",
        sortOrder: 0,
      },
    });

    // ==================================================
    // EXISTING BOOKINGS
    // ==================================================
    //
    // Scenario:
    //
    // 19:00 - 21:00
    // Table 4   -> occupied
    // VIP Room  -> occupied
    // Table 2   -> free
    // Table 6   -> free
    //

    const bookingStart = dateAt("2026-10-10", 19, 0);
    const bookingEnd = dateAt("2026-10-10", 21, 0);

    const bookingTable4 = await tx.booking.upsert({
      where: {
        id: IDS.bookingTable4,
      },
      update: {},
      create: {
        id: IDS.bookingTable4,
        bookingNumber: "HN-20261010-0001",

        restaurantId: restaurant.id,
        customerId: null,
        createdById: owner.id,

        status: "CONFIRMED",
        source: "MANUAL",

        partySize: 4,

        startsAt: bookingStart,
        endsAt: bookingEnd,
        expiresAt: null,

        guestName: "Seed Customer 1",
        guestPhone: "0900000011",
        guestEmail: "customer1@example.com",
        specialRequest: "Window seat if possible",

        preferredResourceType: "TABLE",

        confirmedAt: bookingStart,
      },
    });

    const bookingVip8 = await tx.booking.upsert({
      where: {
        id: IDS.bookingVip8,
      },
      update: {},
      create: {
        id: IDS.bookingVip8,
        bookingNumber: "HN-20261010-0002",

        restaurantId: restaurant.id,
        customerId: null,
        createdById: owner.id,

        status: "CONFIRMED",
        source: "MANUAL",

        partySize: 8,

        startsAt: bookingStart,
        endsAt: bookingEnd,
        expiresAt: null,

        guestName: "Seed Customer 2",
        guestPhone: "0900000012",
        guestEmail: "customer2@example.com",
        specialRequest: "Private room",

        preferredResourceType: "VIP_ROOM",

        confirmedAt: bookingStart,
      },
    });

    // ==================================================
    // BOOKING -> RESOURCES
    // ==================================================

    await tx.bookingResource.upsert({
      where: {
        id: IDS.bookingResourceTable4,
      },
      update: {},
      create: {
        id: IDS.bookingResourceTable4,

        bookingId: bookingTable4.id,
        resourceId: IDS.table4,

        allocatedFromAt: bookingStart,
        allocatedUntilAt: dateAt("2026-10-10", 21, 15),

        isActive: true,
      },
    });

    await tx.bookingResource.upsert({
      where: {
        id: IDS.bookingResourceVip8,
      },
      update: {},
      create: {
        id: IDS.bookingResourceVip8,

        bookingId: bookingVip8.id,
        resourceId: IDS.vip8,

        allocatedFromAt: bookingStart,
        allocatedUntilAt: dateAt("2026-10-10", 21, 15),

        isActive: true,
      },
    });

    // ==================================================
    // OUTPUT
    // ==================================================

    console.log("✅ Seeded owner:", owner.email);
    console.log("✅ Seeded restaurant:", restaurant.name);
    console.log("✅ Seeded resources:", resources.length);
    console.log("✅ Seeded existing bookings: 2");
  });

  console.log("🌱 Seed completed.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });