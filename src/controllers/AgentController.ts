import { Request, Response } from "express";
import { AppDataSource } from "../db/data-source";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Agent } from "../entities/Agent";
import { Hotel } from "../entities/Hotel";
import { GroupBooking } from "../entities/GroupBooking";
import { RoomOccupancy } from "../entities/RoomOccupancy";
import { Room } from "../entities/Room";
import { RoomExtra } from "../entities/RoomExtra";
import { RoomPhoto } from "../entities/RoomPhoto";
import { RoomType } from "../entities/RoomType";

// ----------------------------------------------------------------------
// CONSTANTS & TYPES (Adjust these to match your actual types)
// ----------------------------------------------------------------------
const DEFAULT_CURRENCY = "USD";
type RatingRange = [number, number];

export interface HydratedHotel {
  id: number | string;
  name: string;
  description: string;
  city: { id: number | string; name: string | null } | null;
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
  amenities: any;
  photos: string[];
  rooms: any[];
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
  policies: {
    child: string | null;
    cancellation: string | null;
  };
}

// ----------------------------------------------------------------------
// HELPER STUBS (Import these if they live in another file)
// ----------------------------------------------------------------------
function formatDistanceLabel(minutes: number, estimate: number | null): string {
  return `${minutes} mins walking`; // Replace with your actual implementation
}

function calculateNights(checkIn: string, checkOut: string): number {
  return 1; // Replace with your actual implementation
}

function normalizeAmenityFlags(hotel: Hotel): any {
  return []; // Replace with your actual implementation
}

// ----------------------------------------------------------------------
// UTILITY FUNCTIONS
// ----------------------------------------------------------------------
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

function formatHotelForResponse(
  hotel: Hotel,
  checkIn?: string,
  checkOut?: string
): HydratedHotel {
  const rooms = hotel.rooms || [];
  const roomPrices = rooms
    .map((room: any) => Number(room.price_per_night))
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
          hotel.reviews!.reduce((sum: number, review: any) => sum + review.rating, 0) /
          reviewCount
        ).toFixed(1)
      )
      : 0;

  const distanceMinute = hotel.distance_haram_minutes ?? null;
  const minutesEstimate =
    typeof distanceMinute === "number"
      ? Math.round(distanceMinute) // walking speed ~5km/h
      : null;

  const distanceMeters = hotel.distance_haram_mitres ?? null;
  const distanceLabel =
    typeof distanceMinute === "number"
      ? formatDistanceLabel(distanceMinute, minutesEstimate)
      : null;

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : null;

  return {
    id: hotel.id,
    name: hotel.name,
    description: hotel.description,
    city: hotel.city
      ? { id: hotel.city.id as number, name: hotel.city.name ?? null }
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
    photos: hotel.photos?.map((photo: any) => photo.image_url) || [],
    rooms: rooms.map((room: any) => ({
      id: room.id,
      name: room.name,
      pricePerNight: Number(room.price_per_night),
      refundable: room.refundable,
      breakfastIncluded: room.breakfast_included,
      viewType: room.view_type,
      imageUrl: room.image_url || null,
      photos: room.photos?.map((photo: any) => photo.image_url) || [],
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
      child: hotel.child_policy ?? null,
      cancellation: hotel.cancellation_policy ?? null
    }
  };
}

function parseRatingRanges(starRatings: unknown): RatingRange[] {
  if (!starRatings) {
    return [];
  }

  const raw = Array.isArray(starRatings)
    ? starRatings
    : String(starRatings).split(",");

  return raw
    .map((segment) => String(segment).trim())
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

const generateTokenAndSetCookie = (res: Response, agentId: number, email: string) => {
  const secretKey = process.env.JWT_SECRET || "super_secret_key";

  const token = jwt.sign({ id: agentId, email: email }, secretKey, {
    expiresIn: "7d"
  });

  res.cookie("agent_auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ----------------------------------------------------------------------
// CONTROLLER
// ----------------------------------------------------------------------

interface AuthenticatedRequest extends Request {
  agentId?: number | string;
}

export class AgentController {

  static signup = async (req: Request, res: Response) => {
    console.log("Received request in the signup function");

    try {
      // Assuming validation happened in a middleware, req.body is safe
      const { password, ...agentData } = req.body;

      const agentRepository = AppDataSource.getRepository(Agent);

      // 1. Check if agent already exists
      const existingAgent = await agentRepository.findOne({
        where: [
          { email: agentData.email },
          { phone_number: agentData.phone_number }
        ]
      });
      console.log('existingAgent is :', existingAgent)
      if (existingAgent) {
        return res.status(409).json({
          status: false,
          message: 'An agent with this email or phone number already exists.'
        });
      }

      // 2. Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 3. Create and save new agent
      const newAgent = agentRepository.create({
        ...agentData,
        password: hashedPassword
      });

      await agentRepository.save(newAgent);

      // 4. Generate Token & Cookie 
      // (Ensure this function handles the 'res' object properly)
      //@ts-ignore
      generateTokenAndSetCookie(res, newAgent.id, newAgent.email);

      // 5. Remove password cleanly without @ts-ignore
      const agentDataWithoutPassword = { ...newAgent };
      delete (agentDataWithoutPassword as any).password;

      // 6. Return success response
      return res.status(201).json({
        status: true,
        message: 'Account created successfully. You are now logged in.',
        agent: agentDataWithoutPassword
      });

    } catch (error) {
      console.error('[Agent Signup Error]:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal server error. Please try again later.'
      });
    }
  };

  static login = async (req: Request, res: Response) => {
    console.log("Received request in the login function");
    try {
      const { email, password } = req.body;

      // 1. Validate input
      if (!email || !password) {
        return res.status(400).json({
          status: false,
          message: "Email and password are required."
        });
      }

      const agentRepository = AppDataSource.getRepository(Agent);

      // 2. Find the agent by email
      const agent = await agentRepository.findOne({ where: { email } });

      if (!agent || !agent.is_active) {
        return res.status(401).json({
          status: false,
          message: "Invalid credentials or inactive account."
        });
      }

      // 3. Verify password
      const isPasswordValid = await bcrypt.compare(password, agent.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          status: false,
          message: "Invalid credentials."
        });
      }

      // 4. Generate token and set HttpOnly cookie
      generateTokenAndSetCookie(res, agent.id, agent.email);

      // 5. Remove password cleanly to avoid TS/TypeORM entity errors
      const agentDataWithoutPassword = { ...agent };
      delete (agentDataWithoutPassword as any).password;

      // 6. Return success response
      return res.status(200).json({
        status: true,
        message: "Login successful.",
        agent: agentDataWithoutPassword
      });

    } catch (error) {
      console.error('[Agent Login Error]:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal server error. Please try again later.'
      });
    }
  };

  static getHotelList = async (req: Request, res: Response) => {
    console.log("req to get list of hotels ");
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
      } = req.query;

      const hotelRepo = AppDataSource.getRepository(Hotel);

      const qb = hotelRepo
        .createQueryBuilder("hotel")
        .leftJoinAndSelect("hotel.city", "city")
        .leftJoinAndSelect("hotel.photos", "photos")
        .leftJoinAndSelect("hotel.rooms", "rooms")
        .leftJoinAndSelect("hotel.reviews", "reviews");

      qb.addOrderBy("photos.position", "ASC");

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
      // STAR RATING
      // -------------------------------
      if (starRatings) {
        const ratingRanges = parseRatingRanges(starRatings as string);
        if (ratingRanges.length > 0) {
          qb.andWhere(
            ratingRanges
              .map((_, idx) => `(hotel.rating >= :ratingMin${idx} AND hotel.rating <= :ratingMax${idx})`)
              .join(" OR ")
          );

          ratingRanges.forEach(([min, max], idx) => {
            qb.setParameter(`ratingMin${idx}`, min);
            qb.setParameter(`ratingMax${idx}`, max);
          });
        }
      }

      // -------------------------------
      // AMENITIES (JSONB)
      // -------------------------------
      let amenityList: string[] = [];

      if (amenities) {
        amenityList = String(amenities)
          .split(",")
          .map((a) => a.trim().toLowerCase().replace(/[^a-z0-9]/g, ""))
          .filter(Boolean);
      }

      if (amenityList.length > 0) {
        const amenityConditions = amenityList.map((amenity, idx) => {
          const paramName = `amenityNorm${idx}`;
          return `EXISTS (
            SELECT 1
            FROM jsonb_array_elements(hotel.services) AS elem
            WHERE REGEXP_REPLACE(LOWER(elem->>'value'), '[^a-z0-9]', '', 'g') = :${paramName}
          )`;
        });

        qb.andWhere(`(${amenityConditions.join(" OR ")})`,
          Object.fromEntries(
            amenityList.map((amenity, idx) => [`amenityNorm${idx}`, amenity])
          )
        );
      }

      // -------------------------------
      // EXEC QUERY
      // -------------------------------
      const hotels = await qb.getMany();

      const uniqueHotels = Array.from(
        new Map(hotels.map((hotel) => [hotel.id, hotel])).values()
      );

      console.log(`✅ Found ${hotels.length} rows, reduced to ${uniqueHotels.length} unique hotels`);

      const hydratedHotels = uniqueHotels.map((hotel) =>
        formatHotelForResponse(hotel, checkIn as string, checkOut as string)
      );

      // We sort the hotels based on the requested sort order
      const sortedHotels = sortHotels(
        hydratedHotels,
        (sortBy as string) || "price_asc"
      );

      // -------------------------------
      // GROUP BY CITY LOGIC
      // -------------------------------
      // We now map over ALL sortedHotels instead of a paginated slice
      const groupedByCityMap = sortedHotels.reduce((acc, hotel) => {
        const cityName = hotel.city?.name || "Other";
        const cityId = hotel.city?.id || null;

        if (!acc[cityName]) {
          acc[cityName] = {
            cityId,
            cityName,
            hotels: [],
          };
        }
        acc[cityName].hotels.push(hotel);
        return acc;
      }, {} as Record<string, { cityId: number | string | null; cityName: string; hotels: HydratedHotel[] }>);

      const groupedData = Object.values(groupedByCityMap);

      // -------------------------------
      // SEND JSON RESPONSE
      // -------------------------------
      return res.json({
        success: true,
        data: groupedData,
        meta: {
          appliedFilters: {
            amenities: amenityList,
          },
          checkIn: checkIn ?? null,
          checkOut: checkOut ?? null,
          totalHotelsFound: sortedHotels.length, // Moved total count to meta for frontend reference
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
  };

  static createGroupBooking = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const agentId = req.agentId || (req as any).agentId;

      if (!agentId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized: Agent ID missing from request",
        });
      }

      const groupBookingRepository = AppDataSource.getRepository(GroupBooking);

      const {
        groupName,
        makkahHotelId,
        makkahHotelName,
        madinahHotelId,
        madinahHotelName,
        rooms,
        dates,
        services,
        notes,
        totals,
      } = req.body;

      // Basic validation — fail fast with a clean 400 instead of a raw DB error
      if (!groupName || !makkahHotelId || !madinahHotelId || !dates || !totals) {
        return res.status(400).json({
          status: false,
          message:
            "Missing required fields: groupName, makkahHotelId, madinahHotelId, dates and totals are required",
        });
      }

      const newBooking = groupBookingRepository.create({
        agentId,
        groupName,
        makkahHotelId: String(makkahHotelId),
        makkahHotelName: makkahHotelName || "To be suggested",
        madinahHotelId: String(madinahHotelId),
        madinahHotelName: madinahHotelName || "To be suggested",
        rooms,
        dates,
        services,
        notes,
        totals,
      });

      const savedBooking = await groupBookingRepository.save(newBooking);

      return res.status(201).json({
        status: true,
        message: "Group booking created successfully",
        data: savedBooking,
      });
    } catch (error) {
      console.error("Error creating group booking:", error);
      return res.status(500).json({
        status: false,
        message: "Failed to create group booking",
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };


  // Get all bookings for the authenticated agent
  static bookingDetails = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const agentId = req.agentId || (req as any).agentId;
      if (!agentId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized: Agent ID missing from request",
        });
      }

      const groupBookingRepository = AppDataSource.getRepository(GroupBooking);

      const bookings = await groupBookingRepository.find({
        where: { agentId },
        order: { created_at: "DESC" } as any,
      });
      return res.status(200).json({
        status: true,
        message: "Group bookings fetched successfully",
        data: bookings,
      });
    } catch (error) {
      console.error("Error fetching group bookings:", error);
      return res.status(500).json({
        status: false,
        message: "Failed to fetch group bookings",
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };

  // Get single booking by ID
  static bookingDetailsById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const agentId = req.agentId || (req as any).agentId;
      const { bookingId } = req.params;

      if (!agentId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized: Agent ID missing from request",
        });
      }

      const numericBookingId = Number(bookingId);
      if (!bookingId || Number.isNaN(numericBookingId)) {
        return res.status(400).json({
          status: false,
          message: "A valid numeric Booking ID parameter is required",
        });
      }

      const groupBookingRepository = AppDataSource.getRepository(GroupBooking);

      const booking = await groupBookingRepository.findOne({
        where: {
          id: numericBookingId, // PK is numeric — comparing against a string here silently matches nothing
          agentId,
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
        message: "Booking details fetched successfully",
        data: booking,
      });
    } catch (error) {
      console.error("Error fetching booking details:", error);
      return res.status(500).json({
        status: false,
        message: "Failed to fetch booking details",
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };

  static getRoomOccupancy = async (req: Request, res: Response) => {
    try {
      const roomId = parseInt(req.params.roomId, 10);

      // 1. Validate parameter
      if (isNaN(roomId)) {
        return res.status(400).json({ message: "Invalid Room ID" });
      }

      const occupancyRepo = AppDataSource.getRepository(RoomOccupancy);

      // 2. Fetch ONLY the occupancies for this room
      const occupancies = await occupancyRepo
        .createQueryBuilder("occupancy")
        .leftJoinAndSelect("occupancy.room", "room") // Keep this if you need the room data nested inside the occupancy object
        .where("occupancy.room_id = :roomId", { roomId })
        .orderBy("occupancy.id", "DESC")
        .getMany();

      // 3. Group occupancies by the 'occupancy' key
      const groupedOccupancies = occupancies.reduce((acc: any, curr: any) => {
        const key = curr.occupancy || "Uncategorized";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(curr);
        return acc;
      }, {});

      // 4. Send the grouped occupancies as the payload
      return res.json({
        success: true,
        data: groupedOccupancies,
      });

    } catch (error: any) {
      console.error("❌ Error fetching room occupancies:", error);
      return res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  };

  static viewGetBookingDetails = async (req: Request, res: Response) => {
    try {


      const groupBookingRepository = AppDataSource.getRepository(GroupBooking);

      const bookings = await groupBookingRepository.find({
        order: { created_at: "DESC" } as any,
      });

      // Render the correct EJS view and pass the bookings data
      return res.render("agent/list", {
        bookings: bookings,
        error: null, // No errors
      });

    } catch (error) {
      console.error("Error fetching group bookings:", error);

      // Render the page with an empty array and the error message
      return res.status(500).render("agent/list", {
        bookings: [],
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };

  static viewGetBookingDetailsByID = async (req: Request, res: Response) => {
    try {
      
      // Assuming your route is '/agent/:id/view', the parameter is 'id'
      const { id } = req.params; 

     

      const numericBookingId = Number(id);
      if (!id || Number.isNaN(numericBookingId)) {
        return res.status(400).send("A valid numeric Booking ID parameter is required");
      }

      const groupBookingRepository = AppDataSource.getRepository(GroupBooking);

      const booking = await groupBookingRepository.findOne({
        where: {
          id: numericBookingId,
        },
      });

      if (!booking) {
        // You could also render a specific 404 EJS template here
        return res.status(404).send("Booking not found");
      }


      return res.render("agent/view", { 
        booking,
        title: "Booking Details" // Optional: pass any extra data your template needs
      });

    } catch (error) {
      console.error("Error fetching booking details for view:", error);
      // You could render a generic 500 error page here instead of plain text
      return res.status(500).send("Internal server error while fetching booking details");
    }
  };

  static updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Parsed from the <select name="status"> form input

    const numericBookingId = Number(id);
    if (!id || Number.isNaN(numericBookingId)) {
      return res.status(400).send("A valid numeric Booking ID parameter is required");
    }

    // Validate incoming status against allowed options
    const allowedStatuses = ['pending', 'accepted', 'rejected', 'on_hold'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).send("Invalid status value provided");
    }

    const groupBookingRepository = AppDataSource.getRepository(GroupBooking);

    const booking = await groupBookingRepository.findOne({
      where: {
        id: numericBookingId,
      },
    });

    if (!booking) {
      return res.status(404).send("Booking not found");
    }

    // Update the status and commit to database
    booking.status = status;
    await groupBookingRepository.save(booking);

    // Redirect back to the booking details page after updating
    return res.redirect(`/portal/agent/${numericBookingId}/view`);

  } catch (error) {
    console.error("Error updating booking status:", error);
    return res.status(500).send("Internal server error while updating status");
  }
};
}