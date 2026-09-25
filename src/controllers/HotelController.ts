import { Request, Response } from "express";
import { randomBytes } from "crypto";
import { AppDataSource } from "../db/data-source";
import { Hotel } from "../entities/Hotel";
import { Room } from "../entities/Room";
import { RoomExtra } from "../entities/RoomExtra";
import { Booking } from "../entities/Booking";
import { User } from "../entities/User";
import { In, DeepPartial } from "typeorm";
import { RoomOccupancy } from "../entities/RoomOccupancy";
import { getAllowedAmenities, getAllowedHotelExtras } from "../utils/utils";

export class HotelController {
  // ✅ Hotel listing endpoint with filters, sorting, and pagination
  // static async getHotels(req: Request, res: Response) {
  //   try {
  //     const {
  //       city,
  //       search,
  //       checkIn,
  //       checkOut,
  //       priceMin,
  //       priceMax,
  //       distanceMin,
  //       distanceMax,
  //       starRatings,
  //       amenities,
  //       sortBy,
  //       roomtype,
  //       page = "1",
  //       pageSize = "10",
  //     } = req.query;


  //     console.log("aminities ;;;;;", amenities);

  //     const pageNumber = parsePositiveInt(page as string, 1);
  //     const limitNumber = parsePositiveInt(pageSize as string, 10, 50);

  //     const hotelRepo = AppDataSource.getRepository(Hotel);

  //     const roomOptionRepo = AppDataSource.getRepository(RoomOccupancy);

  //     // const hotelIds = await roomOptionRepo
  //     //                 .createQueryBuilder("ro")                         // room_occupancies
  //     //                 .select("room.hotel_id", "hotel_id")              // get hotel IDs
  //     //                 .innerJoin(Room, "room", "room.id = ro.room_id")  // join rooms
  //     //                 .where("ro.occupancy = :occ", { occ: "Quad" })  // occupancy filter
  //     //                 .groupBy("room.hotel_id")                         // group by hotel
  //     //                 .getRawMany();

  //     // console.log("hotel ids for double ss ;;;;;;;;;",hotelIds);

  //     const qb = hotelRepo
  //       .createQueryBuilder("hotel")
  //       .leftJoinAndSelect("hotel.city", "city")
  //       .leftJoinAndSelect("hotel.photos", "photos")
  //       .leftJoinAndSelect("hotel.rooms", "rooms")
  //       .leftJoinAndSelect("hotel.reviews", "reviews")
  //       .distinct(true);


       

  //     if (city) {
  //       qb.andWhere("city.name ILIKE :cityName", {
  //         cityName: `%${city}%`,
  //       });
  //     }

  //     if (search) {
  //       qb.andWhere(
  //         `(hotel.name ILIKE :search OR hotel.description ILIKE :search)`,
  //         { search: `%${search}%` }
  //       );
  //     }

  //     const priceFloor = parseNumber(priceMin as string | undefined);
  //     const priceCeil = parseNumber(priceMax as string | undefined);
  //     if (priceFloor !== undefined) {
  //       qb.andWhere("rooms.price_per_night >= :priceFloor", { priceFloor });
  //     }
  //     if (priceCeil !== undefined) {
  //       qb.andWhere("rooms.price_per_night <= :priceCeil", { priceCeil });
  //     }

  //     const minDistance = parseNumber(distanceMin as string | undefined);
  //     const maxDistance = parseNumber(distanceMax as string | undefined);
  //     if (minDistance !== undefined) {
  //       qb.andWhere("hotel.distance_haram_minutes >= :minDistance", { minDistance });
  //     }
  //     if (maxDistance !== undefined) {
  //       qb.andWhere("hotel.distance_haram_minutes <= :maxDistance", { maxDistance });
  //     }

  //     const ratingRanges = parseRatingRanges(starRatings);
  //     if (ratingRanges.length) {
  //       qb.andWhere(
  //         ratingRanges
  //           .map(
  //             (_, idx) =>
  //               `(hotel.rating >= :ratingMin${idx} AND hotel.rating <= :ratingMax${idx})`
  //           )
  //           .join(" OR ")
  //       );
  //       ratingRanges.forEach(([min, max], idx) => {
  //         qb.setParameters({
  //           ...qb.getParameters(),
  //           [`ratingMin${idx}`]: min,
  //           [`ratingMax${idx}`]: max,
  //         });
  //       });
  //     }

  //     const hotels = await qb.getMany();

      

  //     // const amenityFilters = parseAmenities(amenities);
  //     // console.log(first)
  //     // const filteredHotels = hotels.filter((hotel) =>
  //     //   matchesAmenityFilters(hotel, amenityFilters)
  //     // );

  //     // AMENITIES FILTERING
  //     let amenityFilters: string[] = [];

  //     if (amenities) {
  //       if (typeof amenities === "string") {
  //         amenityFilters = amenities
  //           .split(",")
  //           .map(a => a.trim())
  //           .filter(a => a.length > 0);
  //       }
  //     }

  //     if (amenityFilters.length > 0) {
  //       amenityFilters.forEach((amenity, idx) => {
  //         qb.andWhere(`:amenity${idx} = ANY(hotel.amenities)`, {
  //           [`amenity${idx}`]: amenity,
  //         });
  //       });
  //     }


  //     const hydratedHotels = filteredHotels.map((hotel) =>
  //       formatHotelForResponse(hotel, checkIn as string | undefined, checkOut as string | undefined)
  //     );


  //     // console.log("data coming from hotel 11111 ;;;;;", hydratedHotels);
      
  //     const sortedHotels = sortHotels(hydratedHotels, sortBy as string | undefined);
  //     // console.log("data coming from hotel ;;;;;", sortedHotels);

  //     const total = sortedHotels.length;
  //     const offset = (pageNumber - 1) * limitNumber;
  //     const paginated = sortedHotels.slice(offset, offset + limitNumber);

  //     res.json({
  //       success: true,
  //       pagination: {
  //         page: pageNumber,
  //         pageSize: limitNumber,
  //         total,
  //         totalPages: Math.ceil(total / limitNumber),
  //       },
  //       data: paginated,
  //       meta: {
  //         appliedFilters: {
  //           city: city ?? null,
  //           search: search ?? null,
  //           priceMin: priceFloor ?? null,
  //           priceMax: priceCeil ?? null,
  //           distanceMin: minDistance ?? null,
  //           distanceMax: maxDistance ?? null,
  //           starRatings: ratingRanges,
  //           amenities: amenityFilters,
  //           sortBy: sortBy ?? "price_asc",
  //         },
  //         checkIn: checkIn ?? null,
  //         checkOut: checkOut ?? null,
  //       },
  //     });
  //   } catch (err) {
  //     console.error("❌ Error fetching hotels:", err);
  //     res.status(500).json({
  //       success: false,
  //       message: "Internal server error",
  //     });
  //   }
  // }

 static async getHotels(req: Request, res: Response) {
  try {
    const {
      city,
      search,
      checkIn,
      checkOut,
      minPrice,
      maxPrice,
      minDistance,
      maxDistance,
      starRatings,
      amenities,
      sortBy,
      page = "1",
      pageSize = "10",
    } = req.query;

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(pageSize as string) || 10;

    const hotelRepo = AppDataSource.getRepository(Hotel);

    const qb = hotelRepo
      .createQueryBuilder("hotel")
      .leftJoinAndSelect("hotel.city", "city")
      .leftJoinAndSelect("hotel.photos", "photos")
      .leftJoinAndSelect("hotel.rooms", "rooms")
      .leftJoinAndSelect("hotel.reviews", "reviews");
      
    qb.addOrderBy("photos.position", "ASC");
      // REMOVED .distinct(true) - this was causing the issue!

    // -------------------------------
    // CITY
    // -------------------------------
    if (city) {
      qb.andWhere("city.name ILIKE :cityName", { cityName: `%${city}%` });
    }

    // -------------------------------
    // SEARCH
    // -------------------------------
    if (search) {
      qb.andWhere(
        "(hotel.name ILIKE :search OR hotel.description ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // -------------------------------
    // DISTANCE FILTERING
    // -------------------------------
    // if (minDistance) {
    //   qb.andWhere("hotel.distance_haram_minutes >= :minDistance", {
    //     minDistance,
    //   });
    // }
    // if (maxDistance) {
    //   qb.andWhere("hotel.distance_haram_minutes <= :maxDistance", {
    //     maxDistance,
    //   });
    // }

    // -------------------------------
    // STAR RATING
    // -------------------------------
    const ratingRanges = parseRatingRanges(starRatings);
    if (ratingRanges.length > 0) {
      qb.andWhere(
        ratingRanges
          .map(
            (_, idx) =>
              `(hotel.rating >= :ratingMin${idx} AND hotel.rating <= :ratingMax${idx})`
          )
          .join(" OR ")
      );

      ratingRanges.forEach(([min, max], idx) => {
        qb.setParameter(`ratingMin${idx}`, min);
        qb.setParameter(`ratingMax${idx}`, max);
      });
    }

    // -------------------------------
    // AMENITIES (JSONB) — WORKING VERSION
    // -------------------------------
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

    console.log("🔍 Amenity list:", amenityList);

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
  qb.andWhere(`(${amenityConditions.join(' OR ')})`, 
    Object.fromEntries(
      amenityList.map((amenity, idx) => [`amenityNorm${idx}`, amenity])
    )
  );
}

    // -------------------------------
    // EXEC QUERY
    // -------------------------------
    const hotels = await qb.getMany();

    console.log(`✅ Found ${hotels.length} hotels after all filters`);

    // If you need unique hotels (because of the joins), deduplicate here
    const uniqueHotels = Array.from(
      new Map(hotels.map(hotel => [hotel.id, hotel])).values()
    );

    console.log(`✅ After deduplication: ${uniqueHotels} unique hotels`);

    const hydratedHotels = uniqueHotels.map((hotel) =>
      formatHotelForResponse(hotel, checkIn as string, checkOut as string)
    );

    const sortedHotels = sortHotels(
      hydratedHotels,
      (sortBy as string) || "price_asc"
    );

    const total = sortedHotels.length;
    const offset = (pageNumber - 1) * limitNumber;
    const paginated = sortedHotels.slice(offset, offset + limitNumber);

    return res.json({
      success: true,
      pagination: {
        page: pageNumber,
        pageSize: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
      data: paginated,
      meta: {
        appliedFilters: {
          amenities: amenityList,
        },
        checkIn: checkIn ?? null,
        checkOut: checkOut ?? null,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching hotels:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}




  // ✅ Single hotel detail endpoint
  static async getHotelById(req: Request, res: Response) {
    try {
      console.log("running get hotel api 1")
      const { id } = req.params;
      const { checkIn, checkOut } = req.query;

      const hotelId = Number(id);
      if (!Number.isFinite(hotelId) || hotelId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid hotel id",
        });
      }

       console.log("running get hotel api 2")
      const hotelRepo = AppDataSource.getRepository(Hotel);
       console.log("running get hotel api 3")
      // const hotel = await hotelRepo
      //   .createQueryBuilder("hotel")
      //   .leftJoinAndSelect("hotel.city", "city")
      //   .leftJoinAndSelect("hotel.photos", "photos")
      //   .leftJoinAndSelect("hotel.rooms", "rooms")
      //   .leftJoinAndSelect("rooms.photos", "roomPhotos")
      //   .leftJoinAndSelect("hotel.reviews", "reviews")
      //   .where("hotel.id = :hotelId", { hotelId })
      //   .getOne();
      const hotel = await hotelRepo.findOne({
                      where: { id: hotelId },
                      relations: {
                        city: true,
                        photos: true,
                        rooms: {
                          photos: true
                        },
                        reviews: true
                      },
                      relationLoadStrategy: "query"
                    });

        //  console.log("running get hotel api 4", hotel);
        // return res.send(hotel);

      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found",
        });
      }

       console.log("running get hotel api 5", hotel)
      const formatted = formatHotelDetail(
        hotel,
        checkIn as string | undefined,
        checkOut as string | undefined
      );

       console.log("running get hotel api 6")
      res.json({
        success: true,
        data: formatted,
      });
    } catch (error: any) {
      console.error("❌ Error fetching hotel detail:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  // ✅ Hotel rooms endpoint for booking flow
  static async getHotelRooms(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { checkIn, checkOut } = req.query;

      const hotelId = Number(id);
      if (!Number.isFinite(hotelId) || hotelId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid hotel id",
        });
      }

      const hotelRepo = AppDataSource.getRepository(Hotel);
      const hotel = await hotelRepo.findOne({
        where: { id: hotelId },
        relations: ["city"],
      });

      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found",
        });
      }

      const roomRepo = AppDataSource.getRepository(Room);
      const rooms = await roomRepo
        .createQueryBuilder("room")
        .leftJoinAndSelect("room.photos", "photos")
        .where("room.hotel_id = :hotelId", { hotelId })
        .orderBy("room.price_per_night", "ASC")
        .addOrderBy("room.id", "ASC")
        .getMany();

      const roomIds = rooms.map((room) => room.id);
      let extrasByRoom: Record<number, RoomExtra[]> = {};

      if (roomIds.length) {
        const extrasRepo = AppDataSource.getRepository(RoomExtra);
        const extras = await extrasRepo.find({
          where: { room_id: In(roomIds) },
          order: { price: "ASC", id: "ASC" },
        });

        extrasByRoom = extras.reduce<Record<number, RoomExtra[]>>(
          (acc, extra) => {
            const key = extra.room_id;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(extra);
            return acc;
          },
          {}
        );
      }

      const nights =
        typeof checkIn === "string" && typeof checkOut === "string"
          ? calculateNights(checkIn, checkOut)
          : null;

      const formattedRooms = rooms.map((room) =>
        formatRoomForResponse(
          room,
          extrasByRoom[room.id] || [],
          nights ?? 1
        )
      );

      res.json({
        success: true,
        data: {
          hotel: {
            id: hotel.id,
            name: hotel.name,
            city: hotel.city?.name ?? null,
          },
          stay: {
            checkIn: (checkIn as string) ?? null,
            checkOut: (checkOut as string) ?? null,
            nights,
          },
          rooms: formattedRooms,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching hotel rooms:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // ✅ Create booking (checkout step)
  static async createBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const hotelId = Number(id);

      if (!Number.isFinite(hotelId) || hotelId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid hotel id",
        });
      }

        // console.log("all data coming ;;;;;;;", req.body);

      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        country,
        roomId,
        checkIn,
        checkOut,
        guests,
        extras,
        arrivalTime,
        whatsappOptIn,
        agreeToTerms,
        notes,
        paymentStatus,
        totalPrice: totalPriceOverride,
      } = req.body ?? {};

    

      // console.log("term value ;;;;;", agreeToTerms);
      if (!agreeToTerms) {
        return res.status(400).json({
          success: false,
          message: "Terms must be accepted to proceed with booking",
        });
      }

      const validationErrors = validateBookingPayload({
        firstName,
        lastName,
        email,
        roomId,
        checkIn,
        checkOut,
      });

      if (validationErrors.length) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      const roomRepo = AppDataSource.getRepository(Room);
      const room = await roomRepo.findOne({
        where: { id: Number(roomId), hotel_id: hotelId },
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found for this hotel",
        });
      }

      const nights = calculateNights(checkIn, checkOut);
      if (!nights || nights <= 0) {
        return res.status(400).json({
          success: false,
          message: "Check-out must be after check-in",
        });
      }

      const selections = parseExtrasSelections(extras);
      const extrasRepo = AppDataSource.getRepository(RoomExtra);
      let extrasTotal = 0;
      let extrasSummary: { id: number; name: string; price: number; quantity: number }[] = [];

      if (selections.length) {
        const extrasRecords = await extrasRepo.find({
          where: { id: In(selections.map((item) => item.id)) },
        });

        extrasSummary = extrasRecords.map((record) => {
          const match = selections.find((item) => item.id === record.id);
          const quantity = match?.quantity ?? 1;
          const price = Number(record.price);
          extrasTotal += price * quantity;
          return {
            id: record.id,
            name: record.name,
            price,
            quantity,
          };
        });
      }

      const baseRoomPrice = Number(room.price_per_night) * nights;
      const calculatedTotal = roundCurrency(baseRoomPrice + extrasTotal);

      if (
        typeof totalPriceOverride === "number" &&
        Math.abs(totalPriceOverride - calculatedTotal) > 0.5
      ) {
        return res.status(400).json({
          success: false,
          message: "Provided total price does not match calculated total",
          meta: {
            providedTotal: totalPriceOverride,
            calculatedTotal,
          },
        });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const userRepo = AppDataSource.getRepository(User);
      let user = await userRepo.findOne({ where: { email: normalizedEmail } });

      if (user) {
        user.first_name = firstName.trim();
        user.last_name = lastName.trim();
        user.phone_number = phoneNumber ? String(phoneNumber).trim() : user.phone_number;
        user.country = country ? String(country).trim() : user.country;
        user = await userRepo.save(user);
      } else {
        const newUser = userRepo.create({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: normalizedEmail,
          phone_number: phoneNumber ? String(phoneNumber).trim() : null,
          country: country ? String(country).trim() : null,
        } as DeepPartial<User>);
        user = await userRepo.save(newUser);
      }

      if (!user) {
        throw new Error("User persistence failed");
      }

      const bookingRepo = AppDataSource.getRepository(Booking);
      const reservationNumber = await generateUniqueBookingCode(
        "reservation_number",
        "RSV"
      );
      const bookingNumber = await generateUniqueBookingCode(
        "booking_number",
        "BN"
      );

      const booking = bookingRepo.create({
        reservation_number: reservationNumber,
        booking_number: bookingNumber,
        user_id: user.id,
        room_id: room.id,
        hotel_id:hotelId,
        check_in: checkIn,
        check_out: checkOut,
        total_guests: Number.isFinite(Number(guests)) ? Number(guests) : null,
        total_price: calculatedTotal,
        status: "booked",
        cancellation_policy: notes ? String(notes) : null,
        payment_status:
          paymentStatus && ["pending", "paid", "failed"].includes(paymentStatus)
            ? paymentStatus
            : "pending",
      } as DeepPartial<Booking>);

      await bookingRepo.save(booking);

      res.status(201).json({
        success: true,
        data: {
          booking: {
            id: booking.id,
            reservationNumber,
            bookingNumber,
            status: booking.status,
            paymentStatus: booking.payment_status,
            checkIn: booking.check_in,
            checkOut: booking.check_out,
            nights,
            totalPrice: booking.total_price,
          },
          user: {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phoneNumber: user.phone_number,
            country: user.country,
          },
          room: {
            id: room.id,
            name: room.name,
            pricePerNight: Number(room.price_per_night),
            currency: DEFAULT_CURRENCY,
          },
          extras: extrasSummary,
          meta: {
            arrivalTime: arrivalTime ? String(arrivalTime) : null,
            whatsappOptIn: Boolean(whatsappOptIn),
            notes: notes ?? null,
          },
        },
      });
    } catch (error) {
      console.error("❌ Error creating booking:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getHotelExtras(req: Request, res: Response) {
    try {
      const type = req.query.type || "service";

      const hotel_amenities = await getAllowedHotelExtras(type as string | string[]);

      res.json({
        success: true,
        data: hotel_amenities,
      });
    } catch (error) {
      console.error("❌ Error fetching hotel extras:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

}

type RatingRange = [number, number];
type AmenityFilter =
  | "breakfast_included"
  | "free_shuttle"
  | "haram_view"
  | "wheelchair_friendly"
  | "wifi"
  | "parking"
  | "family_room"
  | "room_service";

interface HydratedHotel {
  id: number;
  name: string;
  description: string | null;
  city: { id: number; name: string | null } | null;
  distance: {
    meters: number | null;
    minutesEstimate: number | null;
    label: string | null;
  };
  rating: number;
  reviewCount: number;
  price: {
    currency: string;
    current: number | null;
    original: number | null;
    perNight: number | null;
    hasDiscount: boolean;
  };
  badges: {
    distanceToHaram: string | null;
  };
  amenities: Record<string, boolean>;
  photos: string[];
  rooms: {
    id: number;
    name: string;
    pricePerNight: number;
    refundable: boolean;
    breakfastIncluded: boolean;
    viewType: string | null;
    imageUrl: string | null;
    photos: string[];
  }[];
  reviews: {
    average: number;
    count: number;
  };
  ctas: {
    bookNowUrl: string | null;
    whatsappUrl: string | null;
  };
  stay: {
    checkIn: string | null;
    checkOut: string | null;
    nights: number | null;
  };
  google_comments_url: string | null;
  policies:{
    child: string | null;
    cancellation: string | null;
  }
}

interface DisplayItem {
  key: string;
  label: string;
  value: string | number | boolean | null;
}

interface HotelDetail extends HydratedHotel {
  address: string | null;
  // gallery: {
  //   hero: string | null;
  //   photos: string[];
  // };
  offers: DisplayItem[];
  // services: DisplayItem[];
  nearbyPlaces: DisplayItem[];
  descriptionLong: string | null;
  // policies: {
  //   child: string | null;
  //   cancellation: string | null;
  // };
  reviewsList: {
    id: number;
    rating: number;
    comment: string | null;
    createdAt: string | null;
    userId: number | null;
  }[];
}

interface RoomCard {
  id: number;
  name: string;
  description: string | null;
  heroImage: string | null;
  photos: string[];
  capacity: {
    maxGuests: number | null;
    beds: string | null;
    sizeSqft: number | null;
  };
  viewType: string | null;
  breakfastIncluded: boolean;
  price: {
    currency: string;
    perNight: number;
    total: number;
    nights: number | null;
  };
  cancellation: {
    refundable: boolean;
    freeCancellationHours: number | null;
  };
  extras: {
    id: number;
    name: string;
    price: number;
    currency: string;
  }[];
  tags: string[];
}

interface ExtraSelection {
  id: number;
  quantity: number;
}

const DEFAULT_CURRENCY = "SAR";
const DISPLAY_LABEL_OVERRIDES: Record<string, string> = {
  wifi: "Wi-Fi",
  hdtv: "HDTV",
  tv: "TV",
  ac: "AC",
  av: "AV",
  kaaba: "Kaaba",
  haram: "Haram",
};

function parsePositiveInt(value: string, fallback: number, cap?: number): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return cap ? Math.min(fallback, cap) : fallback;
  }
  const bounded = cap ? Math.min(parsed, cap) : parsed;
  return bounded;
}

function parseNumber(value?: string): number | undefined {
  if (!value?.length) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseRatingRanges(starRatings: unknown): RatingRange[] {
  if (!starRatings) {
    return [];
  }

  const raw = Array.isArray(starRatings)
    ? starRatings
    : String(starRatings).split(",");

  return raw
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const [minStr, maxStr] = segment.split("-");
      const min = Number(minStr);
      const max = Number(maxStr ?? minStr);
      if (Number.isFinite(min) && Number.isFinite(max)) {
        return [Math.min(min, max), Math.max(min, max)] as RatingRange;
      }
      return null;
    })
    .filter((range): range is RatingRange => Array.isArray(range));
}

// function parseAmenities(amenities: unknown): AmenityFilter[] {
//   if (!amenities) {
//     return [];
//   }

//   const raw = Array.isArray(amenities)
//     ? amenities
//     : String(amenities).split(",");

//   const valid: AmenityFilter[] = [];
//   raw.forEach((value) => {
//     const key = value.trim().toLowerCase() as AmenityFilter;
//     const allowed: AmenityFilter[] = [
//       "breakfast_included",
//       "free_shuttle",
//       "haram_view",
//       "wheelchair_friendly",
//       "wifi",
//       "parking",
//       "family_room",
//       "room_service",
//     ];
//     if (allowed.includes(key)) {
//       valid.push(key);
//     }
//   });

//   return valid;
// }

export async function parseAmenities(amenities: unknown): Promise<string[]> {
  if (!amenities) return [];

  const rawList = Array.isArray(amenities)
    ? amenities
    : String(amenities).split(",");

  const allowed = await getAllowedAmenities("service");

  const selected: string[] = [];

  rawList.forEach((value) => {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/-/g, "")
      .replace(/[^a-z0-9]/g, "");

    if (allowed.includes(normalized)) {
      selected.push(normalized);
    }
  });

  return selected;
}


function matchesAmenityFilters(
  hotel: Hotel,
  filters: AmenityFilter[]
): boolean {
  if (!filters.length) {
    return true;
  }

  const hotelAmenities = (hotel.amenities || {}) as Record<string, boolean>;
  const services = (hotel.services || {}) as Record<string, boolean>;
  const rooms = hotel.rooms || [];

  return filters.every((filter) => {
    switch (filter) {
      case "breakfast_included":
        return rooms.some((room) => room.breakfast_included);
      case "haram_view":
        return (
          rooms.some(
            (room) =>
              (room.view_type || "").toLowerCase().includes("haram") ||
              (room.view_type || "").toLowerCase().includes("kaaba")
          ) || Boolean(hotelAmenities["haram_view"])
        );
      case "free_shuttle":
        return Boolean(
          hotelAmenities["free_shuttle"] ||
            hotelAmenities["shuttle"] ||
            services["free_shuttle"] ||
            services["shuttle"]
        );
      case "wheelchair_friendly":
        return Boolean(
          hotelAmenities["wheelchair_friendly"] ||
            services["wheelchair_friendly"]
        );
      case "wifi":
        return Boolean(hotelAmenities["wifi"] || services["wifi"]);
      case "parking":
        return Boolean(hotelAmenities["parking"] || services["parking"]);
      case "family_room":
        return rooms.some((room) => room.max_guests && room.max_guests >= 3);
      case "room_service":
        return Boolean(hotelAmenities["room_service"] || services["room_service"]);
      default:
        return true;
    }
  });
}

function formatHotelForResponse(
  hotel: Hotel,
  checkIn?: string,
  checkOut?: string
): HydratedHotel {
  const rooms = hotel.rooms || [];
  const roomPrices = rooms
    .map((room) => Number(room.price_per_night))
    .filter((price) => Number.isFinite(price));
  const minPrice = roomPrices.length ? Math.min(...roomPrices) : null;
  const originalPrice =
    typeof hotel.price === "number" && hotel.price > 0 ? Number(hotel.price) : null;

  const currentPrice = minPrice ?? originalPrice;
  const hasDiscount =
    originalPrice !== null &&
    currentPrice !== null &&
    currentPrice < originalPrice;

  const reviewCount = hotel.reviews?.length || 0;
  const avgRating =
    reviewCount > 0
      ? Number(
          (
            hotel.reviews!.reduce((sum, review) => sum + review.rating, 0) /
            reviewCount
          ).toFixed(1)
        )
      : 0;


      // console.log("haram hotel coming ;;;;;;;;", hotel);
      // console.log("haram hotel time ;;;;;;", hotel.distance_haram_minutes)
  const distanceMinute = hotel.distance_haram_minutes ?? null;
  const minutesEstimate =
    typeof distanceMinute === "number"
      ? Math.round((distanceMinute)) // walking speed ~5km/h
      : null;

  const distanceMeters = hotel.distance_haram_mitres ?? null;
  const distanceLabel =
    typeof distanceMinute === "number"
      ? formatDistanceLabel(distanceMinute, minutesEstimate)
      : null;

  const nights =
    checkIn && checkOut ? calculateNights(checkIn, checkOut) : null;

  return {
    id: hotel.id,
    name: hotel.name,
    description: hotel.description,
    city: hotel.city
      ? { id: hotel.city.id, name: hotel.city.name ?? null }
      : null,
    distance: {
      meters: distanceMeters,
      minutesEstimate,
      label: distanceLabel,
    },
    rating: hotel.rating,
    reviewCount,
    price: {
      currency: DEFAULT_CURRENCY,
      current: currentPrice,
      original: originalPrice,
      perNight: currentPrice,
      hasDiscount,
    },
    badges: {
      distanceToHaram: distanceLabel,
    },
    amenities: normalizeAmenityFlags(hotel),
    photos: hotel.photos?.map((photo) => photo.image_url) || [],
    rooms: rooms.map((room) => ({
      id: room.id,
      name: room.name,
      pricePerNight: Number(room.price_per_night),
      refundable: room.refundable,
      breakfastIncluded: room.breakfast_included,
      viewType: room.view_type,
      imageUrl: room.image_url || null,
      photos: room.photos?.map((photo) => photo.image_url) || [],
    })),
    reviews: {
      average: avgRating,
      count: reviewCount,
    },
    ctas: {
      bookNowUrl: null,
      whatsappUrl: null,
    },
    stay: {
      checkIn: checkIn ?? null,
      checkOut: checkOut ?? null,
      nights,
    },
    google_comments_url: hotel.google_comments_url ?? null,
    policies: {
      child: hotel.child_policy,
      cancellation: hotel.cancellation_policy
    }
  };
}

// function formatHotelDetail(
//   hotel: Hotel,
//   checkIn?: string,
//   checkOut?: string
// ): HotelDetail {
//   const base = formatHotelForResponse(hotel, checkIn, checkOut);

//   const galleryPhotos = Array.from(
//     new Set(
//       [
//         hotel.image_url ?? null,
//         ...(hotel.photos?.map((photo) => photo.image_url) || []),
//       ].filter((url): url is string => Boolean(url))
//     )
//   );

//   const offers = objectToDisplayList(hotel.amenities, { filterFalsy: true });
//   const services = objectToDisplayList(hotel.services, { filterFalsy: true });
//   const nearbyPlaces = objectToDisplayList(hotel.nearby_places, {
//     filterFalsy: false,
//   });

//   const reviewsList =
//     hotel.reviews?.map((review) => ({
//       id: review.id,
//       rating: review.rating,
//       comment: review.comment ?? null,
//       createdAt: review.created_at
//         ? review.created_at.toISOString()
//         : null,
//       userId: review.user_id ?? null,
//     })) || [];

//   return {
//     ...base,
//     address: hotel.address ?? null,
//     gallery: {
//       hero: galleryPhotos[0] ?? null,
//       photos: galleryPhotos,
//     },
//     offers,
//     services,
//     nearbyPlaces,
//     descriptionLong: hotel.description ?? null,
//     policies: {
//       child: null,
//       cancellation: null,
//     },
//     reviewsList,
//   };
// }

function formatHotelDetail(
  hotel: Hotel,
  checkIn?: string,
  checkOut?: string
): HotelDetail {
  const base = formatHotelForResponse(hotel, checkIn, checkOut);

  // ✅ gallery photos (deduplicated)
  const photos = [
    hotel.image_url,
    ...(hotel.photos?.map(p => p.image_url) ?? [])
  ].filter(Boolean) as string[];

  // ✅ parse nearby places ONCE (important fix)
  const nearbyPlaces =
    hotel.nearby_places?.map((item: any) => {
      try {
        return typeof item === "string" ? JSON.parse(item) : item;
      } catch {
        return null;
      }
    }).filter(Boolean) ?? [];

  const offers =
    hotel.amenities?.map((item: any) => {
      try {
        return typeof item === "string" ? JSON.parse(item) : item;
      } catch {
        return null;
      }
    }).filter(Boolean) ?? [];

  return {
    ...base,
    address: hotel.address ?? null,
    // gallery: {
    //   hero: photos[0] ?? null,
    //   photos,
    // },
    offers,
    // services: objectToDisplayList(hotel.services, { filterFalsy: true }),
    // ✅ clean structured array (no JSON string)
    nearbyPlaces,
    descriptionLong: hotel.description ?? null,
    // policies: {
    //   child: null,
    //   cancellation: null,
    // },
    reviewsList:
      hotel.reviews?.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment ?? null,
        createdAt: r.created_at?.toISOString() ?? null,
        userId: r.user_id ?? null,
      })) ?? [],
  };
}


function formatRoomForResponse(
  room: Room,
  extras: RoomExtra[],
  nightsFallback: number | null
): RoomCard {
  const photos = room.photos?.map((photo) => photo.image_url) || [];
  const heroImage = room.image_url || photos[0] || null;

  const perNight = Number(room.price_per_night);
  const nights =
    nightsFallback !== null && nightsFallback > 0 ? nightsFallback : 1;
  const total = perNight * nights;

  return {
    id: room.id,
    name: room.name,
    description: room.description ?? null,
    heroImage,
    photos,
    capacity: {
      maxGuests: room.max_guests ?? null,
      beds: room.bed_type ?? null,
      sizeSqft: room.size_sqft ?? null,
    },
    viewType: room.view_type ?? null,
    breakfastIncluded: room.breakfast_included,
    price: {
      currency: DEFAULT_CURRENCY,
      perNight,
      total,
      nights: nightsFallback,
    },
    cancellation: {
      refundable: room.refundable,
      freeCancellationHours: room.free_cancellation_hours ?? null,
    },
    extras: extras.map((extra) => ({
      id: extra.id,
      name: extra.name,
      price: Number(extra.price),
      currency: DEFAULT_CURRENCY,
    })),
    tags: buildRoomTags(room),
  };
}

function normalizeAmenityFlags(hotel: Hotel): Record<string, boolean> {
  const base = {
    wifi: false,
    shuttle_to_haram: false,
    wheelchair_friendly: false,
    breakfast_included: false,
    family_room: false,
    parking: false,
    room_service: false,
    haram_view: false,
  };

  const amenities = (hotel.amenities || {}) as Record<string, boolean>;
  const rooms = hotel.rooms || [];

  // Convert service array → lookup map
  const serviceArray = hotel.services || [];
  const serviceValues = new Set(
    serviceArray.map((s: any) => (s.value || "").toLowerCase())
  );

  return {
    ...base,

    wifi:
      Boolean(amenities["wifi"]) ||
      serviceValues.has("wi-fi") ||
      serviceValues.has("wifi"),

    shuttle_to_haram:
      Boolean(amenities["free_shuttle"] || amenities["shuttle"]) ||
      serviceValues.has("shuttle to haram"),

    wheelchair_friendly:
      Boolean(amenities["wheelchair_friendly"]) ||
      serviceValues.has("wheelchair friendly"),

    breakfast_included:
      rooms.some((room) => room.breakfast_included) ||
      serviceValues.has("breakfast included"),

    family_room:
      rooms.some((room) => room.max_guests && room.max_guests >= 3) ||
      serviceValues.has("family rooms"),

    parking:
      Boolean(amenities["parking"]) || serviceValues.has("parking"),

    room_service:
      Boolean(amenities["room_service"]) || serviceValues.has("room service"),

    haram_view:
      rooms.some((room) =>
        (room.view_type || "").toLowerCase().includes("haram")
      ) ||
      serviceValues.has("haram view") ||
      serviceValues.has("kaaba view"),
  };
}


function formatDistanceLabel(
  distanceMeters: number,
  minutesEstimate: number | null
): string {
  const distanceKm = distanceMeters / 1000;
  const distanceText =
    distanceKm >= 1 ? `${distanceKm.toFixed(1)} km` : `${distanceMeters} m`;
  if (minutesEstimate === null) {
    return `${distanceText} to Al-Haram`;
  }
  return `${minutesEstimate} min to Al-Haram`;
}

function calculateNights(checkIn: string, checkOut: string): number | null {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) {
    return null;
  }
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function sortHotels(
  hotels: HydratedHotel[],
  sortBy: string | undefined
): HydratedHotel[] {
  const cloned = [...hotels];
  switch (sortBy) {
    case "price_desc":
      return cloned.sort(
        (a, b) => (b.price.current ?? 0) - (a.price.current ?? 0)
      );
    case "rating_desc":
      return cloned.sort((a, b) => b.rating - a.rating);
    case "distance_asc":
      return cloned.sort(
        (a, b) => (a.distance.meters ?? Infinity) - (b.distance.meters ?? Infinity)
      );
    case "price_asc":
    default:
      return cloned.sort(
        (a, b) => (a.price.current ?? Infinity) - (b.price.current ?? Infinity)
      );
  }
}

function objectToDisplayList(
  record: Record<string, any> | null | undefined,
  options: { filterFalsy?: boolean } = {}
): DisplayItem[] {
  if (!record) {
    return [];
  }

  const { filterFalsy = true } = options;

  return Object.entries(record)
    .filter(([_, value]) =>
      filterFalsy ? Boolean(value) : value !== undefined && value !== null
    )
    .map(([key, value]) => {
      let parsedValue: string | number | boolean | null;
      if (
        typeof value === "number" ||
        typeof value === "boolean" ||
        typeof value === "string"
      ) {
        parsedValue = value;
      } else if (value && typeof value === "object") {
        parsedValue = JSON.stringify(value);
      } else {
        parsedValue = value ?? null;
      }

      return {
        key,
        label: toDisplayLabel(key),
        value: parsedValue,
      };
    });
}

function toDisplayLabel(key: string): string {
  const normalized = key.replace(/[_-]+/g, " ").trim().toLowerCase();
  if (!normalized.length) {
    return "";
  }
  if (DISPLAY_LABEL_OVERRIDES[normalized]) {
    return DISPLAY_LABEL_OVERRIDES[normalized];
  }
  const parts = normalized.split(" ");
  return parts
    .map((part) => {
      if (DISPLAY_LABEL_OVERRIDES[part]) {
        return DISPLAY_LABEL_OVERRIDES[part];
      }
      if (part.length <= 2) {
        return part.toUpperCase();
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function buildRoomTags(room: Room): string[] {
  const tags: string[] = [];
  if (room.breakfast_included) {
    tags.push("Breakfast Included");
  }
  if (room.view_type) {
    tags.push(room.view_type);
  }
  if (room.refundable) {
    tags.push("Refundable");
  }
  if (room.max_guests) {
    tags.push(`Up to ${room.max_guests} guests`);
  }
  return tags;
}

function validateBookingPayload(payload: {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  roomId?: unknown;
  checkIn?: unknown;
  checkOut?: unknown;
}): string[] {
  const errors: string[] = [];
  if (!payload.firstName || String(payload.firstName).trim().length === 0) {
    errors.push("firstName is required");
  }
  if (!payload.lastName || String(payload.lastName).trim().length === 0) {
    errors.push("lastName is required");
  }
  if (!payload.email || String(payload.email).trim().length === 0) {
    errors.push("email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(payload.email).trim())) {
    errors.push("email is invalid");
  }
  if (!payload.roomId || !Number.isFinite(Number(payload.roomId))) {
    errors.push("roomId is required and must be numeric");
  }
  if (!payload.checkIn || String(payload.checkIn).trim().length === 0) {
    errors.push("checkIn is required");
  }
  if (!payload.checkOut || String(payload.checkOut).trim().length === 0) {
    errors.push("checkOut is required");
  }
  return errors;
}

function parseExtrasSelections(extras: unknown): ExtraSelection[] {
  if (!extras) {
    return [];
  }
  const arrayValue = Array.isArray(extras) ? extras : [extras];
  return arrayValue
    .map((item) => {
      if (typeof item === "object" && item !== null) {
        const id = Number((item as any).id);
        const quantityRaw = (item as any).quantity;
        const quantity = Number.isFinite(Number(quantityRaw))
          ? Number(quantityRaw)
          : 1;
        if (Number.isFinite(id) && id > 0) {
          return {
            id,
            quantity: quantity > 0 ? quantity : 1,
          };
        }
      } else if (Number.isFinite(Number(item))) {
        return {
          id: Number(item),
          quantity: 1,
        };
      }
      return null;
    })
    .filter((value): value is ExtraSelection => value !== null);
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

async function generateUniqueBookingCode(
  field: "reservation_number" | "booking_number",
  prefix: string
): Promise<string> {
  const bookingRepo = AppDataSource.getRepository(Booking);
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${prefix}-${Date.now()}-${randomBytes(3).toString("hex")}`;
    const existing = await bookingRepo.findOne({
      where: { [field]: candidate } as any,
    });
    if (!existing) {
      return candidate;
    }
  }
  throw new Error(`Unable to generate unique ${field}`);
}
