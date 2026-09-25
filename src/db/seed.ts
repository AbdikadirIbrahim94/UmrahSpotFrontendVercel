import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import { City } from "../entities/City";
import { Hotel } from "../entities/Hotel";
import { Room } from "../entities/Room";
import { Review } from "../entities/Review";
import { HotelPhoto } from "../entities/HotelPhoto";
import { HotelExtra } from "../entities/HotelExtra";
import { SeasonCode } from "../entities/SeasonCode";
import { RoomType } from "../entities/RoomType";
import { RoomOccupancy } from "../entities/RoomOccupancy";
import bcrypt from "bcryptjs";
import { User } from "../entities/User";

dotenv.config();

const seedDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected for seeding");

    // 🏙️ Seed Cities
    const cityRepo = AppDataSource.getRepository(City);
    const cities = await cityRepo.save([
      cityRepo.create({ name: "Makkah" }),
      cityRepo.create({ name: "Medina" }),
      cityRepo.create({ name: "Jeddah" }),
    ]);
    console.log("🌆 Inserted cities:", cities.map((c) => c.name));

    // 🏨 Seed Hotels
    const hotelRepo = AppDataSource.getRepository(Hotel);
    const hotels = await hotelRepo.save([
      hotelRepo.create({
        city_id: cities[0].id,
        name: "Hilton Makkah Convention Hotel",
        address: "Jabal Omar, Makkah",
        distance_haram_minutes: 300,
        description: "Luxury hotel overlooking the Grand Mosque.",
        rating: 4.8,
        image_url: "https://example.com/hilton-makkah.jpg",
        amenities: { wifi: true, parking: true, spa: true, gym: true },
      }),
      hotelRepo.create({
        city_id: cities[1].id,
        name: "Pullman Zamzam Madina",
        address: "Amr Bin Al Gmoh Street, Medina",
        distance_haram_minutes: 200,
        description: "5-star hotel near Al-Masjid an-Nabawi.",
        rating: 4.7,
        image_url: "https://example.com/pullman-medina.jpg",
        amenities: { wifi: true, breakfast: true, laundry: true },
      }),
    ]);
    console.log("🏨 Inserted hotels:", hotels.map((h) => h.name));

    // 🛏️ Seed Rooms
    const roomRepo = AppDataSource.getRepository(Room);
    const rooms = await roomRepo.save([
      roomRepo.create({
        hotel_id: hotels[0].id,
        name: "Deluxe King Room",
        description: "Spacious room with city view.",
        max_guests: 2,
        bed_type: "King",
        size_sqft: 350,
        price_per_night: 550.0,
        refundable: true,
        free_cancellation_hours: 48,
        breakfast_included: true,
        view_type: "City View",
        image_url: "https://example.com/deluxe-king.jpg",
      }),
      roomRepo.create({
        hotel_id: hotels[1].id,
        name: "Twin Room with Mosque View",
        description: "Comfortable twin beds with Haram view.",
        max_guests: 2,
        bed_type: "Twin",
        size_sqft: 300,
        price_per_night: 480.0,
        refundable: true,
        free_cancellation_hours: 24,
        breakfast_included: false,
        view_type: "Haram View",
        image_url: "https://example.com/twin-mosque.jpg",
      }),
    ]);
    console.log("🛏️ Inserted rooms:", rooms.map((r) => r.name));

    console.log("✅ Seeding completed successfully!");
    await AppDataSource.destroy();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

const seedReviews = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected for seeding reviews");

    const reviewRepo = AppDataSource.getRepository(Review);

    const reviewsData = [
      // Reviews for Hotel 1
      {
        user_id: 101,
        hotel: { id: 1 },
        rating: 5,
        comment: "Excellent hotel! Very close to Al-Haram and super clean rooms.",
      },
      {
        user_id: 102,
        hotel: { id: 1 },
        rating: 4,
        comment: "Good stay overall. Breakfast was nice but Wi-Fi was slow.",
      },
      {
        user_id: 103,
        hotel: { id: 1 },
        rating: 5,
        comment: "Amazing service and location. Highly recommended!",
      },

      // Reviews for Hotel 2
      {
        user_id: 104,
        hotel: { id: 2 },
        rating: 3,
        comment: "Average stay. Room was fine but noisy area.",
      },
      {
        user_id: 105,
        hotel: { id: 2 },
        rating: 4,
        comment: "Nice view from the room and friendly staff.",
      },
      {
        user_id: 106,
        hotel: { id: 2 },
        rating: 5,
        comment: "Outstanding experience! Shuttle to Haram every 15 mins.",
      },
    ];

    // Insert data
    await reviewRepo.save(reviewsData);

    console.log("✅ Review seed data inserted successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

// seedDatabase();
// seedReviews();

const seedDatabaseTwo = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected for seeding");

    const cityRepo = AppDataSource.getRepository(City);
    const hotelRepo = AppDataSource.getRepository(Hotel);
    const roomRepo = AppDataSource.getRepository(Room);
    const reviewRepo = AppDataSource.getRepository(Review);

    // 🏙️ Ensure cities exist
    // const cities = await cityRepo.save([
    //   cityRepo.create({ name: "Makkah" }),
    //   cityRepo.create({ name: "Medina" }),
    // ]);
    // console.log("🌆 Inserted cities:", cities.map((c) => c.name));

    // const makkah = cities.find((c) => c.name === "Makkah");
    // const medina = cities.find((c) => c.name === "Medina");

    const hotelData = [
      // ---------- Makkah Hotels ----------
      {
        city_id: 1,
        name: "Swissotel Al Maqam Makkah",
        address: "Abraj Al Bait, Makkah",
        distance_to_haram: 150,
        description: "Modern hotel offering direct Haram access.",
        rating: 5,
        image_url: "https://example.com/swissotel-makkah.jpg",
        amenities: { wifi: true, breakfast: true, parking: true },
      },
      {
        city_id: 1,
        name: "Conrad Makkah",
        address: "Ibrahim Al Khalil Street, Makkah",
        distance_to_haram: 250,
        description: "Luxury 5-star hotel steps away from Haram.",
        rating: 5,
        image_url: "https://example.com/conrad-makkah.jpg",
        amenities: { wifi: true, pool: true, gym: true, spa: true },
      },
      {
        city_id: 1,
        name: "Makkah Clock Royal Tower",
        address: "Abraj Al Bait Complex, Makkah",
        distance_to_haram: 100,
        description: "Iconic tower hotel with Haram view.",
        rating: 5,
        image_url: "https://example.com/clocktower.jpg",
        amenities: { wifi: true, gym: true, spa: true },
      },
      {
        city_id: 1,
        name: "Le Méridien Makkah",
        address: "King Abdul Aziz Road, Makkah",
        distance_to_haram: 300,
        description: "Elegant hotel offering modern comfort.",
        rating: 5,
        image_url: "https://example.com/lemeridien-makkah.jpg",
        amenities: { wifi: true, breakfast: true, parking: true },
      },
      {
        city_id: 1,
        name: "Raffles Makkah Palace",
        address: "King Abdul Aziz Gate, Makkah",
        distance_to_haram: 100,
        description: "Exclusive suites with direct Haram view.",
        rating: 5.0,
        image_url: "https://example.com/raffles-makkah.jpg",
        amenities: { wifi: true, butler: true, spa: true },
      },

      // ---------- Medina Hotels ----------
      {
        city_id: 2,
        name: "Shaza Al Madina",
        address: "King Fahd Road, Medina",
        distance_to_haram: 250,
        description: "Boutique luxury near the Prophet’s Mosque.",
        rating: 5,
        image_url: "https://example.com/shaza-medina.jpg",
        amenities: { wifi: true, breakfast: true, spa: true },
      },
      {
        city_id: 2,
        name: "Anwar Al Madinah Mövenpick Hotel",
        address: "Central Zone, Medina",
        distance_to_haram: 200,
        description: "Large upscale hotel near Al-Masjid an-Nabawi.",
        rating: 4.8,
        image_url: "https://example.com/movenpick-medina.jpg",
        amenities: { wifi: true, parking: true, gym: true },
      },
      {
        city_id: 2,
        name: "Dar Al Taqwa Hotel",
        address: "Al Markazeya, Medina",
        distance_to_haram: 180,
        description: "Luxury hotel next to the Prophet’s Mosque.",
        rating: 5.0,
        image_url: "https://example.com/daraltaqwa.jpg",
        amenities: { wifi: true, breakfast: true, laundry: true },
      },
      {
        city_id: 2,
        name: "InterContinental Madinah-Dar Al Iman",
        address: "Haram Central Area, Medina",
        distance_to_haram: 150,
        description: "Upscale stay with mosque views.",
        rating: 5,
        image_url: "https://example.com/intercontinental-medina.jpg",
        amenities: { wifi: true, gym: true, spa: true },
      },
      {
        city_id: 2,
        name: "The Oberoi Madina",
        address: "Central Area, Medina",
        distance_to_haram: 100,
        description: "Top-tier hotel offering ultimate comfort.",
        rating: 5,
        image_url: "https://example.com/oberoi-medina.jpg",
        amenities: { wifi: true, spa: true, butler: true },
      },
    ];

    const hotels = await hotelRepo.save(hotelData);
    console.log(`🏨 Inserted ${hotels.length} hotels`);

    // 🛏️ Rooms for each hotel
    const roomData: Room[] = [];
    hotels.forEach((hotel) => {
      roomData.push(
        roomRepo.create({
          hotel,
          name: "Standard Room",
          description: "Cozy standard room with basic amenities.",
          price_per_night: 350,
          max_guests: 2,
          bed_type: "Queen",
          refundable: true,
          breakfast_included: false,
          image_url: "https://example.com/standard-room.jpg",
        }),
        roomRepo.create({
          hotel,
          name: "Deluxe Room",
          description: "Spacious room with Haram view.",
          price_per_night: 500,
          max_guests: 2,
          bed_type: "King",
          refundable: true,
          breakfast_included: true,
          image_url: "https://example.com/deluxe-room.jpg",
        }),
        roomRepo.create({
          hotel,
          name: "Suite",
          description: "Luxury suite with living area and premium service.",
          price_per_night: 800,
          max_guests: 4,
          bed_type: "King",
          refundable: true,
          breakfast_included: true,
          image_url: "https://example.com/suite-room.jpg",
        })
      );
    });

    await roomRepo.save(roomData);
    console.log(`🛏️ Inserted ${roomData.length} rooms`);

    // ⭐ Reviews (5 stars for all)
    const reviewData: Review[] = [];
    hotels.forEach((hotel) => {
      for (let i = 1; i <= 3; i++) {
        reviewData.push(
          reviewRepo.create({
            hotel,
            user_id: i,
            rating: 5,
            comment: "Amazing experience! Highly recommended.",
          })
        );
      }
    });

    await reviewRepo.save(reviewData);
    console.log(`⭐ Inserted ${reviewData.length} reviews`);

    console.log("✅ Seeding completed successfully!");
    await AppDataSource.destroy();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

const seeHotelPhoto = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected for seeding hotel photos");

    const photoRepo = AppDataSource.getRepository(HotelPhoto);

    // 🏨 We'll seed 3–4 photos per hotel (IDs 1–12)
    const imageSamples = [
      "/uploads/Img_urm.png",
      "/uploads/Img_urm.png",
      "/uploads/Img_urm.png",
      "/uploads/Img_urm.png",
    ];

    const photoData: Partial<HotelPhoto>[] = [];

    for (let hotelId = 1; hotelId <= 12; hotelId++) {
      // Randomly choose 3 or 4 images per hotel
      const numPhotos = Math.floor(Math.random() * 2) + 3; // gives 3 or 4
      for (let i = 0; i < numPhotos; i++) {
        photoData.push({
          hotel_id: hotelId,
          image_url: imageSamples[i % imageSamples.length],
        });
      }
    }

    await photoRepo.save(photoData);

    console.log(`✅ Inserted ${photoData.length} hotel photo records successfully!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

// seedDatabaseTwo();
// seeHotelPhoto();

const seedHotelExtras = async () => {
  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(HotelExtra);

    const extras = [
      // services
      { type: "service", name: "Wi-Fi" },
      { type: "service", name: "Shuttle to Haram" },
      { type: "service", name: "Wheelchair Friendly" },
      { type: "service", name: "Breakfast Included" },
      { type: "service", name: "Family Rooms" },
      { type: "service", name: "Parking" },
      { type: "service", name: "Room Service" },
      { type: "service", name: "Haram View" },
      { type: "service", name: "Kaaba View" },
      { type: "service", name: "Haram Speaker" },

      // 🏨 Amenities
      { type: "amenity", name: "Kitchen" },
      { type: "amenity", name: "Dedicated workspace" },
      { type: "amenity", name: "55 inch HDTV with premium cable" },
      { type: "amenity", name: "Window AC unit" },
      { type: "amenity", name: "Hair dryer" },
      { type: "amenity", name: "Coffee" },
      { type: "amenity", name: "Gym" },

      // 📍 Nearby places
      { type: "nearby_place", name: "Pharmacy" },
      { type: "nearby_place", name: "Restaurant" },
      { type: "nearby_place", name: "Money Exchange" },
      { type: "nearby_place", name: "Supermarket" },
      { type: "nearby_place", name: "Laundry" },
    ];

    await repo.save(extras);
    console.log("✅ Hotel extras seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedHotelExtras();

async function seedSeasonCodes() {
  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(SeasonCode);

    const records = [
      {
        season_code_id: "AJM_REG_OCTDEC",
        name: "Regular Season Oct 23–Dec 19",
        start_date: "2025-10-23",
        end_date: "2025-12-19",
        description: "AJM Oct 23–Dec 19 period",
      },
      {
        season_code_id: "AJM_REG_JANFEB",
        name: "Regular Season Jan 06–Feb 17",
        start_date: "2026-01-06",
        end_date: "2026-02-17",
        description: "AJM Jan 06–Feb 17 period",
      },
      {
        season_code_id: "FRSS_OCT_DEC_2025",
        name: "FRSS Oct 1 - Dec 17, 2025",
        start_date: "2025-10-01",
        end_date: "2025-12-17",
        description: "Fall 2025 FMT-RAF-SWM-SWK",
      },
      {
        season_code_id: "FRSS_DEC_JAN_2026",
        name: "FRSS Dec 18, 2025 - Jan 9, 2026",
        start_date: "2025-12-18",
        end_date: "2026-01-09",
        description: "Peak Season FMT-RAF-SWM-SWK",
      },
      {
        season_code_id: "FRSS_JAN_FEB_2026",
        name: "FRSS Jan 10 - Feb 16, 2026",
        start_date: "2026-01-10",
        end_date: "2026-02-16",
        description: "Winter 2026 FMT-RAF-SWM-SWK",
      },
      {
        season_code_id: "FRSS_MAR_APR_2026",
        name: "FRSS Mar 20 - Apr 17, 2026",
        start_date: "2026-03-20",
        end_date: "2026-04-17",
        description: "Spring 2026 FMT-RAF-SWM-SWK",
      },
      {
        season_code_id: "FRSS_APR_JUN_2026",
        name: "FRSS Apr 18 - Jun 15, 2026",
        start_date: "2026-04-18",
        end_date: "2026-06-15",
        description: "Low Season 2026 FMT-RAF-SWM-SWK",
      },
    ];

    for (const item of records) {
      const exists = await repo.findOne({
        where: { season_code_id: item.season_code_id },
      });

      if (!exists) {
        await repo.save(repo.create(item));
        console.log("✅ Inserted:", item.season_code_id);
      } else {
        console.log("⚠️ Already exists:", item.season_code_id);
      }
    }

    console.log("✅ Season seeding completed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

// seedSeasonCodes();

// async function seedRoomTypes() {
//    await AppDataSource.initialize();
//   const repo = AppDataSource.getRepository(RoomType);

//   const roomTypes = [
//     { name: "Standard" },
//     { name: "Deluxe" },
//     { name: "Suite" },
//     { name: "Family" }
//   ];

//   for (const type of roomTypes) {
//     const exists = await repo.findOne({
//       where: { name: type.name }
//     });

//     if (!exists) {
//       const newType = repo.create(type);
//       await repo.save(newType);
//       console.log("✅ Inserted room type:", type.name);
//     } else {
//       console.log("⚠️ Room type already exists:", type.name);
//     }
//   }
// }

// seedRoomTypes();

// async function seedRoomOccupancies() {
//   await AppDataSource.initialize();
//   const occRepo = AppDataSource.getRepository(RoomOccupancy);
//   const typeRepo = AppDataSource.getRepository(RoomType);

//   const roomTypes = await typeRepo.find();

//   const occupancies = [
//     { occupancy: "Double", max_guests: 2 },
//     { occupancy: "Triple", max_guests: 3 },
//     { occupancy: "Quad", max_guests: 4 }
//   ];

//   for (const type of roomTypes) {
//     for (const occ of occupancies) {
//       const exists = await occRepo.findOne({
//         where: {
//           occupancy: occ.occupancy,
//           room_type_id: type.id
//         }
//       });

//       if (!exists) {
//         const newOcc = occRepo.create({
//           occupancy: occ.occupancy,
//           max_guests: occ.max_guests,
//           room_type_id: type.id
//         });

//         await occRepo.save(newOcc);
//         console.log(
//           `✅ Inserted occupancy: ${occ.occupancy} for room type ${type.name}`
//         );
//       } else {
//         console.log(
//           `⚠️ Occupancy ${occ.occupancy} already exists for ${type.name}`
//         );
//       }
//     }
//   }
// }

// seedRoomOccupancies();

// async function seedRoomTypes() {
//   const repo = AppDataSource.getRepository(RoomType);

//   const roomTypes = [
//     { name: "Standard" },
//     { name: "Deluxe" },
//     { name: "Suite" },
//     { name: "Family" }
//   ];

//   for (const type of roomTypes) {
//     const exists = await repo.findOne({ where: { name: type.name } });

//     if (!exists) {
//       await repo.save(repo.create(type));
//       console.log("✅ Room type inserted:", type.name);
//     }
//   }
// }

/* ------------------------------------
   ✅ ROOMS SEED (ONE PER VIEW)
------------------------------------ */
async function seedRooms() {
  const roomRepo = AppDataSource.getRepository(Room);
  const typeRepo = AppDataSource.getRepository(RoomType);

  const standard = await typeRepo.findOneBy({ name: "Standard" });

  const rooms = [
    {
      hotel_id: 26,
      room_type_id: standard?.id!,
      room_name_id: "ANJUM_CITY_VIEW",
      name: "Standard City View",
      view_type: "City"
    },
    {
      hotel_id: 26,
      room_type_id: standard?.id!,
      room_name_id: "ANJUM_HARAM_VIEW",
      name: "Standard Haram View",
      view_type: "Haram"
    }
  ];

  for (const r of rooms) {
    const exists = await roomRepo.findOne({
      where: { room_name_id: r.room_name_id }
    });

    if (!exists) {
      await roomRepo.save(roomRepo.create(r));
      console.log("✅ Room inserted:", r.name);
    }
  }
}

/* ------------------------------------
   ✅ ROOM OCCUPANCIES SEED (FROM EXCEL)
------------------------------------ */
async function seedRoomOccupancies() {
  const occRepo = AppDataSource.getRepository(RoomOccupancy);
  const roomRepo = AppDataSource.getRepository(Room);

  const room = await roomRepo.findOneBy({
    room_name_id: "ANJUM_CITY_VIEW"
  });

  if (!room) return;

  const occupancies = [
    {
      room_id: room.id,
      occupancy: "Double",
      max_guests: 2,
      website_description: "Standard City View Double (2 single beds or one King)"
    },
    {
      room_id: room.id,
      occupancy: "Triple",
      max_guests: 3,
      website_description: "Standard City View Double + 1 extra bed (smaller)"
    },
    {
      room_id: room.id,
      occupancy: "Quad",
      max_guests: 4,
      website_description: "Standard City View Double + 2 extra beds (smaller)"
    }
  ];

  for (const occ of occupancies) {
    const exists = await occRepo.findOne({
      where: {
        room_id: occ.room_id,
        occupancy: occ.occupancy
      }
    });

    if (!exists) {
      await occRepo.save(occRepo.create(occ));
      console.log("✅ Occupancy inserted:", occ.occupancy);
    }
  }
}

/* ------------------------------------
   ✅ MASTER RUNNER
------------------------------------ */
async function runSeeder() {
  await AppDataSource.initialize();

  // await seedRoomTypes();
  await seedRooms();
  await seedRoomOccupancies();

  console.log("✅ ALL SEEDS COMPLETED");
  process.exit(0);
}

// runSeeder();

async function seedAdminUser() {
  try {
     await AppDataSource.initialize();
    console.log("🌱 Seeding admin user...");

    const userRepo = AppDataSource.getRepository(User);

    // Check if admin already exists
    const existing = await userRepo.findOne({
      where: { email: "admin@gmail.com" }
    });

    if (existing) {
      console.log("✔️ Admin user already exists, skipping seeding.");
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash("Admin1234!", 10);

    const admin = userRepo.create({
      first_name: "Admin",
      last_name: "User",
      email: "admin@gmail.com",
      phone_number: "0000000000",
      role: "admin",
      password: passwordHash,
    });

    await userRepo.save(admin);

    console.log("🎉 Admin user created successfully!");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  }
}

// seedAdminUser();
