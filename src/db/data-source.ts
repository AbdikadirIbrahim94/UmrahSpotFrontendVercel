import path from "path";
import dotenv from "dotenv";
import { DataSource, EntitySchema } from "typeorm";
import "reflect-metadata";
import { Booking } from "../entities/Booking";
import { City } from "../entities/City";
import { Hotel } from "../entities/Hotel";
import { HotelExtra } from "../entities/HotelExtra";
import { HotelPhoto } from "../entities/HotelPhoto";
import { Location } from "../entities/Location";
import { Payment } from "../entities/Payment";
import { Review } from "../entities/Review";
import { Room } from "../entities/Room";
import { RoomAvailability } from "../entities/RoomAvailability";
import { RoomExtra } from "../entities/RoomExtra";
import { RoomPhoto } from "../entities/RoomPhoto";
import { User } from "../entities/User";
import { RoomType } from "../entities/RoomType";
import { SeasonCode } from "../entities/SeasonCode";
import { RoomOccupancy } from "../entities/RoomOccupancy";
import { RoomPrice } from "../entities/RoomPrice";
import { Deal } from "../entities/Deal";
import { RoomOccupancyPhoto } from "../entities/RoomOccupancyPhoto";
import { CurrencyExchangeRate } from "../entities/CurrencyExchangeRate";
import { HotelMarkupRate } from "../entities/HotelMarkupRate";
import { Booking2 } from "../entities/Booking2";
import { BookingRoom } from "../entities/BookingRoom";
import { BookingCustomer } from "../entities/BookingCustomer";
import { ContactUs } from "../entities/ContactUs";
import { RoomPriceV2 } from "../entities/RoomPrice2";
import { BookingTajpark } from "../entities/BookingTajpark";

dotenv.config();

const isTsRuntime = __filename.endsWith(".ts");
const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: (process.env.DATABASE_TYPE as any) || "postgres",
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT
    ? parseInt(process.env.DATABASE_PORT, 10)
    : 5432,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.DATABASE_SYNCHRONIZE === "true",
  // logging: process.env.DATABASE_LOG === "true",
  logging: false,
  
  // Always use explicit imports for Vercel
  entities: [
    Booking,
    City,
    Hotel,
    HotelExtra,
    HotelPhoto,
    Location,
    Payment,
    Review,
    Room,
    RoomAvailability,
    RoomExtra,
    RoomPhoto,
    User,
    SeasonCode,
    RoomOccupancy,
    RoomPrice,
    RoomType,
    Deal,
    RoomOccupancyPhoto,
    CurrencyExchangeRate,
    HotelMarkupRate,
    Booking2,
    BookingRoom,
    BookingCustomer,
    ContactUs,
    RoomPriceV2,
    BookingTajpark,
  ],
  
  migrations: [
    path.join(
      __dirname,
      isTsRuntime ? "../migrations/**/*.ts" : "../migrations/**/*.js"
    ),
  ],
  
  extra: {
    max: process.env.DATABASE_MAX_CONNECTIONS
      ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
      : 10,
    ssl:
      process.env.DATABASE_SSL_ENABLED === "true" &&
      process.env.DATABASE_HOST !== "localhost"
        ? {
            rejectUnauthorized:
              process.env.DATABASE_REJECT_UNAUTHORIZED === "true",
          }
        : false,
  },
});

// Helper function to ensure DataSource is initialized
export const initializeDataSource = async () => {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log("✅ Database connected successfully");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      throw error;
    }
  }
  return AppDataSource;
};

const describeEntity = (entity: string | Function | EntitySchema<any>) => {
  if (typeof entity === "string") return entity;
  if (typeof entity === "function") return entity.name;
  if (entity?.constructor?.name) return entity.constructor.name;
  return "[unknown]";
};

// console.log(
//   "[TypeORM] Registered entities:",
//   ((AppDataSource.options.entities || []) as Array
//     string | Function | EntitySchema<any>
//   >).map(describeEntity)
// );