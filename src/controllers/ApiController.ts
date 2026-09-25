import { Request, Response } from "express";
import { AppDataSource, initializeDataSource } from "../db/data-source";
import { Deal } from "../entities/Deal";
import { Room } from "../entities/Room";
import { RoomOccupancy } from "../entities/RoomOccupancy";
import { Hotel } from "../entities/Hotel";
import { CurrencyExchangeRate } from "../entities/CurrencyExchangeRate";
import { RoomType } from "../entities/RoomType";
import { Booking2 } from "../entities/Booking2";
import { v4 as uuidv4 } from "uuid";
import { BookingCustomer } from "../entities/BookingCustomer";
import { BookingRoom } from "../entities/BookingRoom";
import { Payment } from "../entities/Payment";
import { RoomPrice } from "../entities/RoomPrice";
import { User } from "../entities/User";
import nodemailer from 'nodemailer';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

interface BookingConfirmationData {
  email: string;
  firstName: string;
  lastName: string;
  bookingNumber: string;
  reservationNumber: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  totalGuests: number;
  hotel_name: string;
}

export class ApiController {
  // static getDeals = async (req: Request, res: Response) => {
  //   try {
  //     const { city } = req.query;

  //     const dealRepo = AppDataSource.getRepository(Deal);
  //      const currency = req.query.currency || "USD";
  //     const currency_data = await AppDataSource.getRepository(CurrencyExchangeRate).createQueryBuilder("currency").getMany();

  //     console.log("currency data ;;;;;;", currency_data)

  //     const qb = dealRepo
  //       .createQueryBuilder("deal")
  //       .leftJoin("hotels", "hotel", "hotel.id = deal.hotel_id")
  //       .leftJoin("cities", "city", "city.id = hotel.city_id")
  //       .leftJoin(
  //         "hotel_photos",
  //         "photo",
  //         "photo.hotel_id = hotel.id"
  //       )
  //       .where("deal.status = :status", { status: "active" })
  //       .andWhere("deal.start_date <= CURRENT_DATE")
  //       .andWhere("deal.end_date >= CURRENT_DATE");

  //     if (city) {
  //       qb.andWhere("city.name = :city", { city });
  //     }

  //     qb.select([
  //       "deal.id AS deal_id",
  //       "deal.title AS deal_title",
  //       "deal.description AS deal_description",
  //       "deal.deal_price AS deal_price",
  //       "deal.actual_price AS actual_price",
  //       "deal.discount_type AS discount_type",
  //       "deal.rooms_left AS rooms_left",

  //       "hotel.id AS hotel_id",
  //       "hotel.name AS hotel_name",
  //       "hotel.rating AS rating",
  //       "hotel.distance_haram_minutes AS distance_minutes",
  //       "hotel.services AS amenities",
  //       "hotel.image_url AS thumbnail",
  //       "hotel.google_comments_url AS google_comments_url",
  //       "hotel.description AS description",
  //       "hotel.distance_haram_minutes AS distance_haram_minutes",
  //       "hotel.distance_haram_mitres AS meters",

  //       "city.name AS city_name",

  //       // take first image only
  //       "array_agg(photo.image_url) AS image_urls",
  //     ]);

  //     qb.groupBy(`
  //       deal.id,
  //       hotel.id,
  //       city.id
  //     `);

  //     const deals = await qb.getRawMany();

  //     return res.json({
  //       success: true,
  //       count: deals.length,
  //       data: deals,
  //     });
  //   } catch (err: any) {
  //     console.error(err);
  //     return res.status(500).json({
  //       success: false,
  //       message: err.message || "Failed to fetch deals",
  //     });
  //   }
  // };

  static getDeals = async (req: Request, res: Response) => {
    try {
      const { city } = req.query;
      const requestedCurrency = String(req.query.currency || "USD").toUpperCase();

      const dealRepo = AppDataSource.getRepository(Deal);
      const currencyRepo = AppDataSource.getRepository(CurrencyExchangeRate);

      // 1️⃣ Fetch currency rates
      const currencyData = await currencyRepo.find();

      // 2️⃣ Get SAR → USD rate (BASE)
      const sarToUsd = currencyData.find(
        c => c.from_currency === "SAR" && c.to_currency === "USD"
      );

      // 3️⃣ Get SAR → Requested currency rate
      const sarToTarget = requestedCurrency === "USD"
        ? sarToUsd
        : currencyData.find(
            c =>
              c.from_currency === "SAR" &&
              c.to_currency === requestedCurrency
          );

      if (!sarToUsd || !sarToTarget) {
        return res.status(400).json({
          success: false,
          message: "Unsupported currency"
        });
      }

      const usdPerSar = Number(sarToUsd.umrahspot_rate);
      const targetPerSar = Number(sarToTarget.umrahspot_rate);

      // 4️⃣ Build deals query
      const qb = dealRepo
        .createQueryBuilder("deal")
        .leftJoin("hotels", "hotel", "hotel.id = deal.hotel_id")
        .leftJoin("cities", "city", "city.id = hotel.city_id")
        .leftJoin("hotel_photos", "photo", "photo.hotel_id = hotel.id")
        .where("deal.status = :status", { status: "active" })
        .andWhere("deal.start_date <= CURRENT_DATE")
        .andWhere("deal.end_date >= CURRENT_DATE");

      if (city) {
        qb.andWhere("city.name = :city", { city });
      }

      qb.select([
        "deal.id AS deal_id",
        "deal.title AS deal_title",
        "deal.description AS deal_description",
        "deal.deal_price AS deal_price",
        "deal.actual_price AS actual_price",
        "deal.discount_type AS discount_type",
        "deal.rooms_left AS rooms_left",
        "deal.start_date AS start_date",
        "deal.end_date AS end_date",

        "hotel.id AS hotel_id",
        "hotel.name AS hotel_name",
        "hotel.rating AS rating",
        "hotel.distance_haram_minutes AS distance_minutes",
        "hotel.services AS amenities",
        "hotel.image_url AS thumbnail",
        "hotel.google_comments_url AS google_comments_url",
        "hotel.description AS description",
        "hotel.distance_haram_mitres AS meters",

        "city.name AS city_name",

        // aggregate hotel images
        // "array_agg(photo.image_url) AS image_urls"
        "array_agg(photo.image_url ORDER BY photo.position ASC) AS image_urls"
      ]);

      qb.groupBy(`
        deal.id,
        hotel.id,
        city.id
      `);

      const deals = await qb.getRawMany();

      // 5️⃣ Convert prices
      const convertedDeals = deals.map(deal => {
        const dealPriceUsd = Number(deal.deal_price);
        const actualPriceUsd = Number(deal.actual_price);

        let convertedDealPrice = dealPriceUsd;
        let convertedActualPrice = actualPriceUsd;

        // Convert only if currency is not USD
        if (requestedCurrency !== "USD") {
          convertedDealPrice =
            (dealPriceUsd / usdPerSar) * targetPerSar;

          convertedActualPrice =
            (actualPriceUsd / usdPerSar) * targetPerSar;
        }

        return {
          ...deal,
          currency: requestedCurrency,
          deal_price: convertedDealPrice.toFixed(2),
          actual_price: convertedActualPrice.toFixed(2)
        };
      });

      // 6️⃣ Response
      return res.json({
        success: true,
        count: convertedDeals.length,
        data: convertedDeals
      });

    } catch (err: any) {
      console.error("Error in getDeals:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch deals"
      });
    }
  };

  static get_deals_rooms = async (req: Request, res: Response) => {
    try {
      const hotelId = Number(req.params.id);
      const today = new Date().toISOString().split("T")[0];

      const deals = await AppDataSource
        .getRepository(Deal)
        .createQueryBuilder("deal")
        .leftJoinAndMapOne(
          "deal.room_option",
          RoomOccupancy,
          "occ",
          "occ.id = deal.room_occupancy_id"
        )
        .leftJoinAndMapOne(
          "deal.room",
          Room,
          "room",
          "room.id = deal.room_id AND room.hotel_id = deal.hotel_id"
        )
        .leftJoinAndMapOne(
          "deal.hotel",
          Hotel,
          "hotel",
          "hotel.id = deal.hotel_id"
        )
        // .leftJoinAndSelect("room.hotel", "hotel")
        .leftJoinAndSelect("room.photos", "roomPhotos")
        .leftJoinAndSelect("room.room_extras", "roomExtras")
        .leftJoinAndSelect("occ.photos", "occPhotos")
        .leftJoinAndSelect("room.room_type", "roomType")
        .select([
          "deal.id",
          "deal.created_at",
          "deal.deal_price",
          "deal.start_date",
          "deal.end_date",
          "deal.rooms_left",
          "occ.occupancy",
          "occ.max_guests",
          "hotel.id",
          "hotel.name",
          "hotel.amenities",
          "hotel.cancellation_policy",
          "hotel.distance_haram_minutes",
          "room.id",
          "room.name",
          "room.image_url",
          "room.size_sqft",
          "roomType.id",
          "roomType.name",
          "roomExtras",
          "roomPhotos"

        ])
        .where("deal.hotel_id = :hotelId", { hotelId })
        .andWhere("deal.status = :status", { status: "active" })
        .andWhere("deal.start_date <= :today", { today }) // ✅ started
        .andWhere("deal.end_date >= :today", { today })  
        .orderBy("deal.created_at", "DESC")
        .addOrderBy("roomPhotos.position", "ASC")
        .take(5)
        .getMany();

        // ✅ ALWAYS CHECK ARRAY
        if (!deals || deals.length === 0) {
          return res.status(200).json({
            status: true,
            data: []
          });
        }

          // ✅ NO MAP REQUIRED — already clean
          return res.status(200).json({
            status: true,
            data: deals
          });

    } catch (error: any) {
      console.error("error in get deals room ;;", error);
      return res.status(500).json({
        status: false,
        message: error.message || "Internal server Error"
      });
    }
  };

  static get_hotel_rooms = async (req: Request, res: Response) => {
    try {
        const { city, rooms, page = "1", limit = "10", checkin, checkout } = req.query;
        const hotelId = Number(req.params.id);

        console.log("query params ;;", req.query);

        if (!rooms || typeof rooms !== "string") {
          return res.status(400).json({ message: "Rooms required" });
        }

        if (!city || typeof city !== "string") {
          return res.status(400).json({ message: "City required" });
        }

        if (!checkin || !checkout) {
          return res.status(400).json({
            status: false,
            message: "Check-in and check-out dates are required",
          });
        }

        const checkInDate = new Date(checkin as string);
        const checkOutDate = new Date(checkout as string);

        if (checkInDate >= checkOutDate) {
          return res.status(400).json({
            status: false,
            message: "Invalid date range",
          });
        }

        const parsedRooms = JSON.parse(rooms);
        const roomOptions = Array.from(
          new Set(
            parsedRooms
              .map((r: any) => r.roomType)
              .filter(Boolean)
              .map((r: string) => r.toLowerCase())
          )
        );

        const hotelRepo = AppDataSource.getRepository(Hotel);
        console.log("room option ;;;;;;", roomOptions)
        console.log("room option ;;;;;;", parsedRooms)
        const roomOccupancyRepo = AppDataSource.getRepository(RoomOccupancy);

        const occupancies = await AppDataSource
                          .getRepository(RoomOccupancy)
                          .createQueryBuilder("occupancy")
                          .innerJoinAndSelect("occupancy.room", "room")
                          .innerJoinAndSelect("room.hotel", "hotel")
                          .innerJoin("hotel.city", "city")
                          .leftJoinAndSelect("room.photos", "photos")
                          .leftJoinAndSelect("room.room_extras", "room_extras")
                          .leftJoinAndSelect("room.room_type", "room_type")
                          .leftJoinAndMapMany(
                            "occupancy.prices",
                            RoomPrice,
                            "room_prices",
                            `
                              room_prices.room_option_id = occupancy.room_option_id
                              AND room_prices.start_date <= :checkOut
                              AND room_prices.end_date >= :checkIn
                            `,
                            { checkIn: checkInDate, checkOut: checkOutDate }
                          )
                          .where("LOWER(occupancy.occupancy) IN (:...roomOptions)", {
                            roomOptions, // ['double', 'triple']
                          })
                          .andWhere("LOWER(city.name) = LOWER(:city)", {
                            city, // "makkah"
                          })
                          .andWhere("room.hotel_id = :hotelId", {
                            hotelId,
                          })
                          .addOrderBy("photos.position", "ASC") // ✅ ORDER ROOM PHOTOS
                          .getMany();

        const data = occupancies.map((occ) => ({
              deal_price: occ.prices && occ.prices.length > 0 ? occ.prices[0].selling_price_usd : null,
              rooms_left: occ.rooms_left,
              id: occ.id,
              room_option: {
                occupancy: occ.occupancy,
                room_option_id: occ.room_option_id,
                room_pricing: occ.prices,
                max_guests: occ.max_guests,
              },
              room: occ.room
                ? {
                    id: occ.room.id,
                    name: occ.room.name,
                    image_url: occ.room.image_url,
                    room_name_id: occ.room.room_name_id,
                    size_sqft: occ.room.size_sqft,
                    photos: occ.room.photos?.map((photo) => ({
                      id: photo.id,
                      room_id: photo.room_id,
                      image_url: photo.image_url,
                      created_at: photo.created_at,
                    })) || [],

                    room_extras: occ.room.room_extras?.map((extra) => ({
                      id: extra.id,
                      room_id: extra.room_id,
                      name: extra.name,
                      price: extra.price,
                      created_at: extra.created_at,
                    })) || [],

                    room_type: occ.room.room_type
                      ? {
                          id: occ.room.room_type.id,
                          name: occ.room.room_type.name,
                        }
                      : null,
                  }
                : {},

              hotel: occ.room?.hotel
                ? {
                    id: occ.room.hotel.id,
                    name: occ.room.hotel.name,
                    cancellation_policy: occ.room.hotel.cancellation_policy,
                    amenities: occ.room.hotel.amenities,
                    distance_haram_minutes: occ.room.hotel.distance_haram_minutes,
                  }
                : {},
            }));


         
        // ✅ NO MAP REQUIRED — already clean
        return res.status(200).json({
          status: true,
          data: data
        });
    } catch (error: any) {
      console.error("error in get deals room ;;", error);
      return res.status(500).json({
        status: false,
        message: error.message || "Internal server Error"
      });
    }
  };

  static getDealsDetails = async (req: Request, res: Response) => {
     try {
        const dealIdsParam = req.query.deal_ids as string;
        if (!dealIdsParam) {
          return res.status(400).json({ message: "deal_ids required" });
        }

        const dealIds = dealIdsParam.split(",").map(Number);

        const deals = await AppDataSource.getRepository(Deal)
          .createQueryBuilder("deal")

          // 🔥 WHERE FIRST (important for performance)
          .where("deal.id IN (:...dealIds)", { dealIds })
          .andWhere("deal.status = :status", { status: "active" })

          // 🔗 JOINS
          .leftJoin(Hotel, "hotel", "hotel.id = deal.hotel_id")
          .leftJoin(Room, "room", "room.id = deal.room_id")
          .leftJoin(RoomType, "roomType", "roomType.id = room.room_type_id")
          .leftJoin(
            RoomOccupancy,
            "occupancy",
            "occupancy.id = deal.room_occupancy_id"
          )

          // 🎯 SELECT ONLY REQUIRED FIELDS
          .select([
            // Deal
            "deal.id",
            "deal.title",
            "deal.discount_type",
            "deal.deal_price",
            "deal.actual_price",
            "deal.start_date",
            "deal.end_date",
            "deal.rooms_left",

            // Hotel
            "hotel.id",
            "hotel.name",
            "hotel.rating",
            "hotel.address",
            "hotel.image_url",
            "hotel.cancellation_policy",
            "hotel.check_in_from",
            "hotel.check_out_until",

            // Room
            "room.id",
            "room.name",
            "room.max_guests",
            "room.price_per_night",
            "room.image_url",
            "room.size_sqft",

            // Occupancy
            "occupancy.id",
            "occupancy.occupancy",
            "occupancy.max_guests",
            "occupancy.base_meal_plan",
            "occupancy.image_url",

             // Room Type
            "roomType.id AS room_type_id",
            "roomType.name AS room_type_name",
          ])

          // 🧠 MAP RESULTS INTO OBJECT
          .addSelect([
            "hotel.id",
            "room.id",
            "occupancy.id"
          ])

          .getRawMany();

          // console.log("cancellation policy we get ;;;;;;", deals[0]);

        // 🧩 OPTIONAL: Transform flat raw result into nested JSON
        const formatted = deals.map((d) => ({
          id: d.deal_id,
          title: d.deal_title,
          deal_price: d.deal_deal_price,
          actual_price: d.deal_actual_price,
          start_date: d.deal_start_date,
          end_date: d.deal_end_date,
          rooms_left: d.deal_rooms_left,
          hotel: {
            id: d.hotel_id,
            name: d.hotel_name,
            rating: d.hotel_rating,
            address: d.hotel_address,
            image_url: d.hotel_image_url,
            cancellation_policy: d.hotel_cancellation_policy,
            check_in_from: d.hotel_check_in_from,
            check_out_until: d.hotel_check_out_until
          },
          room: {
            id: d.room_id,
            name: d.room_name,
            max_guests: d.room_max_guests,
            price_per_night: d.room_price_per_night,
            image_url: d.room_image_url,
            size_sqft: d.room_size_sqft,
            room_type: {
              id: d.room_type_id,
              name: d.room_type_name,
            },
          },
          occupancy: {
            id: d.occupancy_id,
            type: d.occupancy_occupancy,
            max_guests: d.occupancy_max_guests,
            base_meal_plan: d.occupancy_base_meal_plan,
            image_url: d.occupancy_image_url,
          },
        }));

        return res.json({
          success: true,
          count: formatted.length,
          data: formatted,
        });

      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }
  };

  static getRoomsDetails = async (req: Request, res: Response) => {
    try {
      const dealIdsParam = req.query.deal_ids as string;
      if (!dealIdsParam) {
        return res.status(400).json({ message: "deal_ids required" });
      }

      const roomoptionIds = dealIdsParam.split(",").map(Number);

      const deals = await AppDataSource.getRepository(RoomOccupancy)
        .createQueryBuilder("room_occupancies")
        
        // 🔥 WHERE FIRST
        .where("room_occupancies.id IN (:...roomoptionIds)", { roomoptionIds })
        
        // 🔗 JOINS with proper aliases
        .leftJoin("room_occupancies.room", "room")
        .leftJoin("room.hotel", "hotel")
        .leftJoin("room.room_type", "roomType")
        
        // 🎯 SELECT ONLY REQUIRED FIELDS (use correct aliases)
        .select([
          // Hotel
          "hotel.id",
          "hotel.name",
          "hotel.rating",
          "hotel.address",
          "hotel.image_url",
          "hotel.cancellation_policy",
          "hotel.check_in_from",
          "hotel.check_out_until",
          
          // Room
          "room.id",
          "room.name",
          "room.max_guests",
          "room.price_per_night",
          "room.image_url",
          "room.size_sqft",
          
          // Room Occupancy (not "occupancy")
          "room_occupancies.id",
          "room_occupancies.occupancy",
          "room_occupancies.max_guests",
          "room_occupancies.base_meal_plan",
          "room_occupancies.image_url",
          
          // Room Type
          "roomType.id",
          "roomType.name",
        ])
        .getRawMany();

      // 🧩 Transform flat raw result into nested JSON
      const formatted = deals.map((d) => ({
         id: d.room_occupancies_id,
        occupancy: {
          id: d.room_occupancies_id,
          type: d.room_occupancies_occupancy,
          max_guests: d.room_occupancies_max_guests,
          base_meal_plan: d.room_occupancies_base_meal_plan,
          image_url: d.room_occupancies_image_url,
        },
        hotel: {
          id: d.hotel_id,
          name: d.hotel_name,
          rating: d.hotel_rating,
          address: d.hotel_address,
          image_url: d.hotel_image_url,
          cancellation_policy: d.hotel_cancellation_policy,
          check_in_from: d.hotel_check_in_from,
          check_out_until: d.hotel_check_out_until,
        },
        room: {
          id: d.room_id,
          name: d.room_name,
          max_guests: d.room_max_guests,
          price_per_night: d.room_price_per_night,
          image_url: d.room_image_url,
          size_sqft: d.room_size_sqft,
          room_type: {
            id: d.roomType_id,
            name: d.roomType_name,
          },
        },
      }));

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });

    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ message: err.message || "Server error" });
    }
  };

  static createBooking = async(req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        customer,
        rooms,
        check_in,
        check_out,
        total_guests,
        total_price,
        currency,
        cancellation_policy,
      } = req.body;

      /* ---------------- CREATE BOOKING ---------------- */
      const bookingRepo = queryRunner.manager.getRepository(Booking2);

      const booking = bookingRepo.create({
        reservation_number: `RSV-${Date.now()}`,
        booking_number: `BK-${uuidv4().slice(0, 8).toUpperCase()}`,
        hotel_id: rooms[0].hotel_id,
        check_in,
        check_out,
        total_guests,
        total_price,
        currency,
        cancellation_policy,
        status: "booked",
        payment_status: "pending",
      });

      const savedBooking = await bookingRepo.save(booking);

      /* ---------------- CREATE CUSTOMER ---------------- */
      const customerRepo =
        queryRunner.manager.getRepository(BookingCustomer);

      const bookingCustomer = customerRepo.create({
        booking_id: savedBooking.id,
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone_number: customer.phoneNumber,
        address: customer.address,
        city: customer.city,
        country: customer.country,
        postal_code: customer.postalCode,
        special_requests: customer.specialRequests || null,
      });

      await customerRepo.save(bookingCustomer);

      /* ---------------- CREATE ROOMS ---------------- */
      const roomRepo =
        queryRunner.manager.getRepository(BookingRoom);

        function calculateNights(
          checkIn: string,
          checkOut: string
        ): number {
          const start = new Date(checkIn);
          const end = new Date(checkOut);

          const MS_PER_DAY = 1000 * 60 * 60 * 24;

          return Math.ceil(
            (end.getTime() - start.getTime()) / MS_PER_DAY
          );
        }

      let bookingTotal = 0;

        // console.log("rooms data ;;;;;;;;", rooms)
      for (const room of rooms) {

        console.log("room coming ;;;;;;", room);
        let total_nights = calculateNights(room.check_in, room.check_out);
        console.log("total nights ;;;;;", total_nights)

         const roomPriceTotal = room.base_price * total_nights * room.quantity;

          const extrasTotal = room.extras.reduce(
            (sum: number, e: { price: number }) =>
              sum + e.price * total_nights * room.quantity,
            0
          );

   
          const grandTotal = roomPriceTotal + extrasTotal;
          console.log("room price total ;;;;", roomPriceTotal);
          console.log("extra total ;;;;;;", extrasTotal);
          console.log("grand total ;;;;", grandTotal)

        bookingTotal += grandTotal;

        const bookingRoom = roomRepo.create({
          booking_id: savedBooking.id,
          deal_id: room.deal_id,
          hotel_id: room.hotel_id,
          room_id: room.room_id,
          room_option_id: room.room_option_id,
          quantity: room.quantity,
          base_price: room.base_price,
          extras: room.extras,
          room_total: grandTotal,
          check_in: room.check_in,
          check_out: room.check_out,
        });

        await roomRepo.save(bookingRoom);
      }

      savedBooking.total_price = bookingTotal;
      await bookingRepo.save(savedBooking);


      await queryRunner.commitTransaction();

      return res.status(201).json({
        success: true,
        booking_id: savedBooking.id,
        booking_number: savedBooking.booking_number,
        reservation_number: savedBooking.reservation_number,
        booking_total_price: savedBooking.total_price,
      });
    } catch (error: any) {
        await queryRunner.rollbackTransaction();
        console.error("Booking creation failed:", error);

        return res.status(500).json({
          success: false,
          message: error.message || "Booking creation failed",
        });
    } finally {
      await queryRunner.release();
    }
  }

  static getBookingById = async (req: Request, res: Response) => {
    const bookingRepo = AppDataSource.getRepository(Booking2);
    const bookingCustomerRepo = AppDataSource.getRepository(BookingCustomer);
    const bookingRoomRepo = AppDataSource.getRepository(BookingRoom);

    try {
      const { booking_id } = req.params;

      if (!booking_id) {
        return res.status(400).json({
          success: false,
          message: "Booking ID is required",
        });
      }

      // Get main booking
      const booking = await bookingRepo.findOne({
        where: { id: parseInt(booking_id) },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Get customer details
      const customer = await bookingCustomerRepo.findOne({
        where: { booking_id: booking.id },
      });

      // Get room details
      const rooms = await bookingRoomRepo.find({
        where: { booking_id: booking.id },
      });

      // Combine all data
      const bookingDetails = {
        ...booking,
        customer_first_name: customer?.first_name,
        customer_last_name: customer?.last_name,
        customer_email: customer?.email,
        customer_phone: customer?.phone_number,
        customer_address: customer?.address,
        customer_city: customer?.city,
        customer_country: customer?.country,
        customer_postal_code: customer?.postal_code,
        special_requests: customer?.special_requests,
        rooms,
      };

      return res.status(200).json({
        success: true,
        booking: bookingDetails,
      });
    } catch (error: any) {
      console.error("Error fetching booking:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  static getBookingByNumber = async (req: Request, res: Response) => {
    const bookingRepo = AppDataSource.getRepository(Booking2);
    const bookingCustomerRepo = AppDataSource.getRepository(BookingCustomer);
    const bookingRoomRepo = AppDataSource.getRepository(BookingRoom);
    const hotelRepo = AppDataSource.getRepository(Hotel);
    const roomRepo = AppDataSource.getRepository(Room);
    const roomOptionRepo = AppDataSource.getRepository(RoomOccupancy);

    try {
      const { bookingNumber } = req.params;

      // console.log("booking number coming ;;;;;;;;", bookingNumber)

      const bookingRepository = AppDataSource.getRepository(Booking2);
      const booking = await bookingRepository.findOne({
        where: { booking_number: bookingNumber },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      const hotel = booking.hotel_id
            ? await hotelRepo.findOne({ where: { id: booking.hotel_id },  select: {
                id: true,
                name_id: true,
                name: true,
              }, })
            : null;

      const bookingRooms = await bookingRoomRepo.find({
        where: { booking_id: booking.id }
      });

      const roomsWithDetails = await Promise.all(
        bookingRooms.map(async (br) => {
          const room = await roomRepo.findOne({ 
            where: { id: br.room_id },
            relations: {
              room_type: true,
            },
            select: {
              id: true,
              room_name_id: true,
              name: true,
              room_type: {
                id: true,
                name: true,
              },
            },
          });
          const roomOption = await roomOptionRepo.findOne({ 
            where: { id: br.room_option_id },
            select: {
              id: true,
              occupancy: true
            }
          });
          return {
            ...br,
            roomDetails: room,
            roomOption: roomOption
          };
        })
      );

      // console.log("booking data coming ;;;;;;;", booking);
      res.json({
        success: true,
        booking: {
          id: booking.id,
          reservation_number: booking.reservation_number,
          booking_number: booking.booking_number,
          user_id: booking.user_id,
          hotel_id: booking.hotel_id,
          // room_id: booking.room_id,
          check_in: booking.check_in,
          check_out: booking.check_out,
          total_guests: booking.total_guests,
          total_price: booking.total_price,
          status: booking.status,
          payment_status: booking.payment_status,
          created_at: booking.created_at,
        },
        bookingRooms: roomsWithDetails,
        hotel
      });
    } catch (error: any) {
      console.error("Error fetching booking:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  static create_payment_intent = async (req: Request, res: Response) =>{
    try {
     const { booking_id, booking_number, amount } = req.body;

      // Validate input
      if (!booking_id || !booking_number || !amount) {
        return res.status(400).json({
          success: false,
          message: "Missing required parameters",
        });
      }

      // Verify booking exists
      const bookingRepository = AppDataSource.getRepository(Booking2);
      const booking = await bookingRepository.findOne({
        where: { id: booking_id, booking_number },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Check if booking is already paid
      if (booking.payment_status === "paid") {
        return res.status(400).json({
          success: false,
          message: "This booking has already been paid",
        });
      }

      const paymentRepository = AppDataSource.getRepository(Payment);

      // ✅ CHECK IF PAYMENT INTENT ALREADY EXISTS FOR THIS BOOKING
      let existingPayment = await paymentRepository.findOne({
        where: { 
          booking_id,
          status: "pending" // Only check for pending payments
        },
        order: { created_at: "DESC" } // Get the most recent one
      });

      // If a pending payment exists, return its payment intent
      if (existingPayment && existingPayment.transaction_id) {
        try {
          // Verify the payment intent still exists in Stripe
          const existingIntent = await stripe.paymentIntents.retrieve(
            existingPayment.transaction_id
          );

          // If it's still valid, return it
          if (existingIntent.status === "requires_payment_method" || 
              existingIntent.status === "requires_confirmation") {
            return res.json({
              success: true,
              clientSecret: existingIntent.client_secret,
              paymentIntentId: existingIntent.id,
            });
          }
        } catch (error) {
          // Payment intent doesn't exist or expired, create a new one
          console.log("Previous payment intent expired, creating new one");
        }
      }

      // Create new payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          booking_id: booking_id.toString(),
          booking_number,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create or update payment record
      if (existingPayment) {
        // Update existing payment with new transaction_id
        existingPayment.transaction_id = paymentIntent.id;
        existingPayment.amount = parseFloat(amount);
        await paymentRepository.save(existingPayment);
      } else {
        // Create new payment record
        const payment = paymentRepository.create({
          booking_id,
          method: "stripe",
          amount: parseFloat(amount),
          currency: "USD",
          transaction_id: paymentIntent.id,
          status: "pending",
        });
        await paymentRepository.save(payment);
      }

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error: any) {
      console.error("error in create payment intent:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Payment Error",
      });
    }
  }

  static sendBookingConfirmationEmail = async (data: BookingConfirmationData) => {
    const {
      email,
      firstName,
      lastName, 
      bookingNumber,
      reservationNumber,
      checkIn,
      checkOut,
      totalPrice,
      totalGuests,
      hotel_name
    } = data;

    // console.log("hotel name ;;;;;;;", data);
    // return;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
          user: 'varun60degreedigital@gmail.com',
          pass: 'wdux jztw nwlw ywjl',
      }
    });

    const mailOptions = {
      from: `"${hotel_name} <admin@gmail.com>"`,
      to: email,
      subject: `Booking Confirmation - ${bookingNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Booking Confirmed!</h1>
            </div>
            
            <div class="content">
              <h2>Dear ${firstName} ${lastName},</h2>
              <p>Thank you for your booking! Your payment has been successfully processed.</p>
              
              <div class="booking-details">
                <h3>Booking Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Booking Number:</span>
                  <span>${bookingNumber}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Reservation Number:</span>
                  <span>${reservationNumber}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Check-in:</span>
                  <span>${checkIn}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Check-out:</span>
                  <span>${checkOut}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Hotel:</span>
                  <span>${hotel_name}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Guests:</span>
                  <span>${totalGuests}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Total Amount:</span>
                  <span><strong>$${parseFloat(totalPrice.toString()).toFixed(2)}</strong></span>
                </div>
              </div>
              
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/booking/${bookingNumber}" class="button">
                  View Booking Details
                </a>
              </p>
              
              <p>If you have any questions, please don't hesitate to contact us.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} ${hotel_name}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
  };

  static update_payment_status = async (req: Request, res: Response) => {
    try {
      const { booking_id, payment_intent_id, status, page } = req.body;

      // Validate input
      if (!booking_id || !payment_intent_id || !status) {
        return res.status(400).json({
          success: false,
          message: "Missing required parameters",
        });
      }

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          success: false,
          message: "Payment not completed",
        });
      }

      // Update booking payment status
      const bookingRepository = AppDataSource.getRepository(Booking2);
      const booking = await bookingRepository.findOne({
        where: { id: booking_id },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      booking.payment_status = "paid";
      await bookingRepository.save(booking);

      // Update payment record
      const paymentRepository = AppDataSource.getRepository(Payment);
      const payment = await paymentRepository.findOne({
        where: { 
          booking_id, 
          transaction_id: payment_intent_id 
        },
      });

      if (payment) {
        payment.status = "success";
        await paymentRepository.save(payment);
      }

      if (page === "deals") {
        const bookingRoomRepository = AppDataSource.getRepository(BookingRoom);
        const dealRepository = AppDataSource.getRepository(Deal);

        // Get all booked rooms for this booking
        const bookedRooms = await bookingRoomRepository.find({
          where: { booking_id },
        });

        // Update each deal's rooms_left
        for (const bookedRoom of bookedRooms) {
          const deal = await dealRepository.findOne({
            where: { id: bookedRoom.deal_id },
          });

          if (deal) {
            // Decrease rooms_left by the quantity booked
            const newRoomsLeft = (deal.rooms_left || 0) - bookedRoom.quantity;
            
            deal.rooms_left = Math.max(0, newRoomsLeft); // Ensure it doesn't go below 0
            
            // If rooms_left reaches 0, mark deal as soldout
            if (deal.rooms_left === 0) {
              deal.status = "soldout";
            }
            
            await dealRepository.save(deal);
            
            console.log(
              `Deal ID ${deal.id}: Updated rooms_left from ${deal.rooms_left + bookedRoom.quantity} to ${deal.rooms_left}`
            );
          } else {
            console.warn(`Deal not found for deal_id: ${bookedRoom.deal_id}`);
          }
        }
      }


      // ✅ Get customer email and send confirmation email
      const customerRepository = AppDataSource.getRepository(BookingCustomer);
      const customer = await customerRepository.findOne({
        where: { booking_id },
      });

      if (customer && customer.email) {
        try {
           const hotelRepo = AppDataSource.getRepository(Hotel);
            const hotel_detail = await hotelRepo.findOne({
              where: {id: booking.hotel_id}
            })

            if (!hotel_detail) {
              console.warn(`Hotel not found for hotel_id: ${booking.hotel_id}`);
              throw new Error("Hotel details not found");
            }

            // Send booking confirmation email
            await this.sendBookingConfirmationEmail({
              email: customer.email,
              firstName: customer.first_name,
              lastName: customer.last_name,
              bookingNumber: booking.booking_number,
              reservationNumber: booking.reservation_number,
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              totalPrice: booking.total_price,
              totalGuests: booking.total_guests,
              hotel_name: hotel_detail.name
            });
            
            console.log(`Confirmation email sent to ${customer.email}`);
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't fail the whole request if email fails
        }
      } else {
        console.warn(`No customer email found for booking_id: ${booking_id}`);
      }

      res.json({
        success: true,
        message: "Payment status updated successfully",
        booking: {
          id: booking.id,
          booking_number: booking.booking_number,
          payment_status: booking.payment_status,
        },
      });
    } catch (error: any) {
      console.error("Error updating payment status:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update payment status",
      });
    }
  }

  // static getHotelsTwo = async (req: Request, res: Response) => {
  //   try {
  //     const { city, rooms, page = "1", limit = "10", starRatings, minPrice, maxPrice } = req.query;

  //     if (!rooms || typeof rooms !== "string") {
  //       return res.status(400).json({ message: "Rooms required" });
  //     }

  //     if (!city || typeof city !== "string") {
  //       return res.status(400).json({ message: "City required" });
  //     }

  //     const parsedRooms = JSON.parse(rooms);

  //     const roomOptions = Array.from(
  //       new Set(
  //         parsedRooms
  //           .map((r: any) => r.roomType)
  //           .filter(Boolean)
  //           .map((r: string) => r.toLowerCase())
  //       )
  //     );

  //     const pageNumber = Math.max(Number(page), 1);
  //     const pageSize = Math.min(Number(limit), 50);
  //     const skip = (pageNumber - 1) * pageSize;

  //     // 🔹 PARSE STAR RATINGS
  //     let minRating: number | null = null;
  //     let maxRating: number | null = null;

  //     if (starRatings && typeof starRatings === "string") {
  //       const parts = starRatings.split("-");
  //       if (parts.length === 2) {
  //         minRating = Number(parts[0]);
  //         maxRating = Number(parts[1]);
          
  //         // Validate ratings are between 1-5
  //         if (minRating < 1 || minRating > 5 || maxRating < 1 || maxRating > 5) {
  //           return res.status(400).json({ 
  //             message: "Star ratings must be between 1 and 5" 
  //           });
  //         }
          
  //         // Ensure min <= max
  //         if (minRating > maxRating) {
  //           [minRating, maxRating] = [maxRating, minRating];
  //         }
  //       }
  //     }

  //     const hotelRepo = AppDataSource.getRepository(Hotel);
  //     const priceRepo = AppDataSource.getRepository(RoomPrice);

  //     // 🔹 MAIN HOTEL QUERY
  //     const queryBuilder = hotelRepo
  //       .createQueryBuilder("hotel")
  //       .select([
  //         "hotel.id",
  //         "hotel.name_id",
  //         "hotel.name",
  //         "hotel.distance_haram_mitres",
  //         "hotel.distance_haram_minutes",
  //         "hotel.description",
  //         "hotel.rating",
  //         "hotel.services",
  //         "hotel.google_comments_url",
  //       ])
  //       .innerJoin("hotel.city", "city")
  //       .innerJoin("hotel.rooms", "room")
  //       .innerJoin("room.occupancies", "occ")
  //       .leftJoinAndSelect("hotel.photos", "photos")
  //       .where("LOWER(city.name) = :city", {
  //         city: city.toLowerCase(),
  //       })
  //       .andWhere("LOWER(occ.occupancy) IN (:...options)", {
  //         options: roomOptions,
  //       });

  //     // 🔹 ADD STAR RATING FILTER
  //     if (minRating !== null && maxRating !== null) {
  //       queryBuilder.andWhere("hotel.rating >= :minRating", { minRating });
  //       queryBuilder.andWhere("hotel.rating <= :maxRating", { maxRating });
  //     }

  //     const [hotels, total] = await queryBuilder
  //       .distinct(true)
  //       .skip(skip)
  //       .take(pageSize)
  //       .getManyAndCount();

  //     // 🔹 LOOP & FETCH MIN PRICE PER HOTEL
  //     const hotelsWithPrice = [];

  //     for (const hotel of hotels) {
  //       const minPriceResult = await priceRepo
  //         .createQueryBuilder("rp")
  //         .select("MIN(rp.selling_price_usd)", "min_price")
  //         .where("rp.hotel_id = :hotelId", {
  //           hotelId: hotel.name_id,
  //         })
  //         .getRawOne();

  //       hotelsWithPrice.push({
  //         ...hotel,
  //         min_price: minPriceResult?.min_price
  //           ? Number(minPriceResult.min_price)
  //           : null,
  //       });
  //     }

  //     return res.status(200).json({
  //       success: true,
  //       data: hotelsWithPrice,
  //       pagination: {
  //         total,
  //         page: pageNumber,
  //         limit: pageSize,
  //         totalPages: Math.ceil(total / pageSize),
  //       },
  //       filters: {
  //         starRatings: starRatings ? `${minRating}-${maxRating}` : null,
  //       },
  //     });
  //   } catch (error: any) {
  //     console.error("Error in getHotelsTwo:", error);
  //     return res.status(500).json({
  //       success: false,
  //       message: error.message || "Failed to fetch hotels",
  //     });
  //   }
  // };

  static getHotelsTwo = async (req: Request, res: Response) => {
    try {
      const { city, rooms, page = "1", limit = "10", starRatings, minPrice, maxPrice, amenities, language,  currency = "USD" } = req.query;

      console.log("aminities coming here ;;;;;;;;;", amenities);
      let amenityList: string[] = [];

      if (amenities) {
        amenityList = String(amenities)
          .split(",")
          .map((a) =>
            a
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")
          )
          .filter(Boolean);
      }

      console.log("amenity list ;;;;;;;;", amenityList);

      if (!rooms || typeof rooms !== "string") {
        return res.status(400).json({ message: "Rooms required" });
      }

      if (!city || typeof city !== "string") {
        return res.status(400).json({ message: "City required" });
      }

      const parsedRooms = JSON.parse(rooms);

      const roomOptions = Array.from(
        new Set(
          parsedRooms
            .map((r: any) => r.roomType)
            .filter(Boolean)
            .map((r: string) => r.toLowerCase())
        )
      );

      const pageNumber = Math.max(Number(page), 1);
      const pageSize = Math.min(Number(limit), 50);
      const skip = (pageNumber - 1) * pageSize;

      // 🔹 GET EXCHANGE RATE
      let exchangeRate = 1; // Default for USD
      const requestedCurrency = String(currency).toUpperCase();

      if (requestedCurrency !== "USD") {
        const currencyRepo = AppDataSource.getRepository(CurrencyExchangeRate);
        
        // Step 1: Get USD -> SAR rate
        const usdToSarRate = await currencyRepo.findOne({
          where: {
            from_currency: "SAR",
            to_currency: "USD"
          }
        });

        if (!usdToSarRate) {
          return res.status(400).json({ 
            message: `USD to SAR exchange rate not found in database`
          });
        }

        // Step 2: Get SAR -> Target Currency rate
        const sarToTargetRate = await currencyRepo.findOne({
          where: {
            from_currency: "SAR",
            to_currency: requestedCurrency
          }
        });

        if (!sarToTargetRate) {
          const availableCurrencies = await currencyRepo
            .createQueryBuilder("rate")
            .select("DISTINCT rate.to_currency", "currency")
            .where("rate.from_currency = 'SAR'")
            .getRawMany();
          
          return res.status(400).json({ 
            message: `Currency ${requestedCurrency} not supported`,
            availableCurrencies: ['USD', ...availableCurrencies.map(r => r.currency)]
          });
        }

        // Step 3: Calculate USD -> Target Currency
        // USD -> SAR: divide by usdToSarRate (since SAR->USD rate is 0.27, USD->SAR is 1/0.27 = 3.7)
        // SAR -> Target: multiply by sarToTargetRate
        const usdToSar = 1 / Number(usdToSarRate.umrahspot_rate);
        const sarToTarget = Number(sarToTargetRate.umrahspot_rate);
        
        exchangeRate = usdToSar * sarToTarget;
        
        console.log(`Exchange rate calculation:
          USD -> SAR: ${usdToSar.toFixed(6)} (inverse of ${usdToSarRate.umrahspot_rate})
          SAR -> ${requestedCurrency}: ${sarToTarget}
          Final USD -> ${requestedCurrency}: ${exchangeRate.toFixed(6)}
        `);
      }

      // 🔹 CONVERT PRICE FILTERS TO USD FOR DATABASE QUERY
      const minPriceUSD = minPrice ? Number(minPrice) / exchangeRate : null;
      const maxPriceUSD = maxPrice ? Number(maxPrice) / exchangeRate : null;

      console.log(`Price filter conversion:
        Input: ${minPrice}-${maxPrice} ${requestedCurrency}
        Converted to USD: ${minPriceUSD?.toFixed(2)}-${maxPriceUSD?.toFixed(2)} USD
      `);

      // 🔹 PARSE STAR RATINGS
      let minRating: number | null = null;
      let maxRating: number | null = null;

      if (starRatings && typeof starRatings === "string") {
        const parts = starRatings.split("-");
        if (parts.length === 2) {
          minRating = Number(parts[0]);
          maxRating = Number(parts[1]);
          
          if (minRating < 0 || minRating > 5 || maxRating < 0 || maxRating > 5) {
            return res.status(400).json({ 
              message: "Star ratings must be between 1 and 5" 
            });
          }
          
          if (minRating > maxRating) {
            [minRating, maxRating] = [maxRating, minRating];
          }
        }
      }

      const hotelRepo = AppDataSource.getRepository(Hotel);
      const priceRepo = AppDataSource.getRepository(RoomPrice);

      // 🔹 MAIN HOTEL QUERY
      const queryBuilder = hotelRepo
        .createQueryBuilder("hotel")
        .select([
          "hotel.id",
          "hotel.name_id",
          "hotel.name",
          "hotel.distance_haram_mitres",
          "hotel.distance_haram_minutes",
          "hotel.description",
          "hotel.rating",
          "hotel.services",
          "hotel.google_comments_url",
        ])
        .innerJoin("hotel.city", "city")
        .innerJoin("hotel.rooms", "room")
        .innerJoin("room.occupancies", "occ")
        .leftJoinAndSelect("hotel.photos", "photos")
        .addOrderBy("photos.position", "ASC")
        .where("LOWER(city.name) = :city", {
          city: city.toLowerCase(),
        })
        .andWhere("LOWER(occ.occupancy) IN (:...options)", {
          options: roomOptions,
        });

      
    if (amenityList.length > 0) {
      const amenityConditions = amenityList.map((amenity, idx) => {
        const paramName = `amenityNorm${idx}`;
        console.log(`🔎 Adding filter for: ${paramName} = "${amenity}"`);
        
        return `EXISTS (
          SELECT 1
          FROM jsonb_array_elements(hotel.services) AS elem
          WHERE REGEXP_REPLACE(LOWER(elem->>'value'), '[^a-z0-9]', '', 'g') = :${paramName}
        )`;
      });

      // Join with OR instead of AND
      queryBuilder.andWhere(`(${amenityConditions.join(' OR ')})`, 
        Object.fromEntries(
          amenityList.map((amenity, idx) => [`amenityNorm${idx}`, amenity])
        )
      );
    }

      // 🔹 ADD STAR RATING FILTER
      if (minRating !== null && maxRating !== null) {
        queryBuilder.andWhere("hotel.rating >= :minRating", { minRating });
        queryBuilder.andWhere("hotel.rating <= :maxRating", { maxRating });
      }

      // 🔹 ADD PRICE FILTER AT DATABASE LEVEL (OPTIMIZED)
      // if (minPrice || maxPrice) {
      //   queryBuilder.andWhere((qb) => {
      //     const subQuery = qb
      //       .subQuery()
      //       .select("rp.hotel_id")
      //       .from(RoomPrice, "rp")
      //       .groupBy("rp.hotel_id")
      //       .having("MIN(rp.selling_price_usd) >= :minPrice", {
      //         minPrice: minPrice ? Number(minPrice) : 0,
      //       });

      //     if (maxPrice) {
      //       subQuery.andHaving("MIN(rp.selling_price_usd) <= :maxPrice", {
      //         maxPrice: Number(maxPrice),
      //       });
      //     }

      //     return "hotel.name_id IN " + subQuery.getQuery();
      //   });

      //   // Set parameters for subquery
      //   if (minPrice) {
      //     queryBuilder.setParameter("minPrice", Number(minPrice));
      //   }
      //   if (maxPrice) {
      //     queryBuilder.setParameter("maxPrice", Number(maxPrice));
      //   }
      // }

       if (minPriceUSD || maxPriceUSD) {
        queryBuilder.andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select("rp.hotel_id")
            .from(RoomPrice, "rp")
            .groupBy("rp.hotel_id")
            .having("MIN(rp.selling_price_usd) >= :minPriceUSD", {
              minPriceUSD: minPriceUSD || 0,
            });

          if (maxPriceUSD) {
            subQuery.andHaving("MIN(rp.selling_price_usd) <= :maxPriceUSD", {
              maxPriceUSD: maxPriceUSD,
            });
          }

          return "hotel.name_id IN " + subQuery.getQuery();
        });

        if (minPriceUSD) {
          queryBuilder.setParameter("minPriceUSD", minPriceUSD);
        }
        if (maxPriceUSD) {
          queryBuilder.setParameter("maxPriceUSD", maxPriceUSD);
        }
      }

      const [hotels, total] = await queryBuilder
        .distinct(true)
        .skip(skip)
        .take(pageSize)
        .getManyAndCount();

      // 🔹 FETCH MIN PRICE PER HOTEL
      const hotelsWithPrice = [];

      // for (const hotel of hotels) {
      //   const minPriceResult = await priceRepo
      //     .createQueryBuilder("rp")
      //     .select("MIN(rp.selling_price_usd)", "min_price")
      //     .where("rp.hotel_id = :hotelId", {
      //       hotelId: hotel.name_id,
      //     })
      //     .getRawOne();

      //   hotelsWithPrice.push({
      //     ...hotel,
      //     min_price: minPriceResult?.min_price
      //       ? Number(minPriceResult.min_price)
      //       : null,
      //   });
      // }

      for (const hotel of hotels) {
        const minPriceResult = await priceRepo
          .createQueryBuilder("rp")
          .select("MIN(rp.selling_price_usd)", "min_price")
          .where("rp.hotel_id = :hotelId", {
            hotelId: hotel.name_id,
          })
          .getRawOne();

        const minPriceUSD = minPriceResult?.min_price ? Number(minPriceResult.min_price) : null;
        
        hotelsWithPrice.push({
          ...hotel,
          min_price: minPriceUSD ? parseFloat((minPriceUSD * exchangeRate).toFixed(2)) : null,
        });
      }

      return res.status(200).json({
        success: true,
        data: hotelsWithPrice,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
        filters: {
          starRatings: starRatings ? `${minRating}-${maxRating}` : null,
          priceRange: minPrice || maxPrice ? { 
            min: minPrice ? Number(minPrice) : null, 
            max: maxPrice ? Number(maxPrice) : null 
          } : null,
        },
        currency: requestedCurrency,
        exchangeRate: exchangeRate
      });
    } catch (error: any) {
      console.error("Error in getHotelsTwo:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch hotels",
      });
    }
  };

  static booking_search = async (req: Request, res: Response) =>{
    try {
      const bookingRepo = AppDataSource.getRepository(Booking2);

       const { reservationNumber } = req.body;

      if (!reservationNumber) {
        return res.status(400).json({
          status: false,
          message: "Reservation number is required",
        });
      }

      const booking = await bookingRepo.findOne({
        where: {
          reservation_number: reservationNumber,
        },
        select: {
          id: true,
          booking_number: true,
          status: true,
        },
      });

      if (!booking) {
        return res.status(404).json({
          status: false,
          message: "Booking not found",
        });
      }

      return res.status(200).json({
        status: true,
        bookingNumber: booking.booking_number,
      });
    } catch (error: any) {
      console.log("error in booking search ;;;;;", error);
      return res.status(500).json({status: false, message: error.message || "Server Error in booking search"});
    }
  }

  static booking_detail = async (req: Request, res: Response) =>{
    try {
       const { booking_number } = req.body;
            const bookingRepo = AppDataSource.getRepository(Booking2);
            const userRepo = AppDataSource.getRepository(User);
            const hotelRepo = AppDataSource.getRepository(Hotel);
            const roomRepo = AppDataSource.getRepository(Room);
            const roomOptionRepo = AppDataSource.getRepository(RoomOccupancy);
            const bookingRoomRepo = AppDataSource.getRepository(BookingRoom);
            const bookingCustomerRepo = AppDataSource.getRepository(BookingCustomer);
      
            // Fetch the booking
            const booking = await bookingRepo.findOne({ where: { booking_number: booking_number } });
            
            if (!booking) {
              return res.status(404).render("error", { message: "Booking not found" });
            }
      
            // Get user info
            const user = booking.user_id
              ? await userRepo.findOne({ where: { id: booking.user_id } })
              : null;
      
            // Get customer info
            const customer = await bookingCustomerRepo.findOne({
              where: { booking_id: booking.id }
            });
      
            // Get hotel info
            const hotel = booking.hotel_id
              ? await hotelRepo.findOne({ where: { id: booking.hotel_id } })
              : null;
      
            // Get booking rooms with room details
            const bookingRooms = await bookingRoomRepo.find({
              where: { booking_id: booking.id }
            });
      
            // Get room details for each booking room
            const roomsWithDetails = await Promise.all(
              bookingRooms.map(async (br) => {
                const room = await roomRepo.findOne({ 
                  where: { id: br.room_id },
                  relations: {
                    room_type: true,
                  },
                });
                const roomOption = await roomOptionRepo.findOne({ 
                  where: { id: br.room_option_id },
                  select: {
                    id: true,
                    occupancy: true
                  }
                });
                return {
                  ...br,
                  roomDetails: room,
                  roomOption: roomOption
                };
              })
            );
      
            // Calculate total nights
            const checkIn = new Date(booking.check_in);
            const checkOut = new Date(booking.check_out);
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
            // Calculate totals
            const subtotal = roomsWithDetails.reduce((sum, room) => sum + parseFloat(room.room_total.toString()), 0);
            const extrasTotal = roomsWithDetails.reduce((sum, room) => {
              if (room.extras && Array.isArray(room.extras)) {
                return sum + room.extras.reduce((extraSum, extra) => extraSum + extra.price, 0);
              }
              return sum;
            }, 0);
      
            const bookingData = {
              ...booking,
              user,
              customer,
              hotel,
              bookingRooms: roomsWithDetails,
              totalRooms: bookingRooms.length,
              nights,
              subtotal,
              extrasTotal
            };

      return res.status(200).json({booking: bookingData});
    } catch (error: any) {
       console.log("error in booking detail ;;;;;", error);
      return res.status(500).json({status: false, message: error.message || "Server Error in booking search"});
    }
  }
}

