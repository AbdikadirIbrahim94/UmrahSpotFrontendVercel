
import { Router, Request, Response } from "express";
import { AppDataSource } from "../db/data-source"; // adjust path
import { Room } from "../entities/Room";
import { RoomType } from "../entities/RoomType";
import { RoomOccupancy } from "../entities/RoomOccupancy";
import { RoomOccupancyPhoto } from "../entities/RoomOccupancyPhoto";
import { Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";
import { RoomPhoto } from "../entities/RoomPhoto";
import { RoomExtra } from "../entities/RoomExtra";
import { RoomPrice } from "../entities/RoomPrice";
import { Deal } from "../entities/Deal";
import { RoomPriceV2 } from "../entities/RoomPrice2";

export class TajApiController {
    static search = async (req: Request, res: Response) => {
        try {
            const {
                hotel_id,
                check_in,
                check_out,
                rooms = 1,
                adults = 1,
                children = 0,
                } = req.body;

                if (!check_in || !check_out) {
                return res.status(400).json({ message: "check_in and check_out are required" });
                }

                const checkInDate  = new Date(check_in);
                const checkOutDate = new Date(check_out);

                if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                return res.status(400).json({ message: "Invalid date format" });
                }

                if (checkInDate >= checkOutDate) {
                return res.status(400).json({ message: "check_out must be after check_in" });
                }

                const totalGuests  = Number(adults) + Number(children);
                const targetHotelId = hotel_id ?? 32;

                const nights = Math.ceil(
                (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                // --- Query RoomOccupancies directly ---
                const occupancyRepo = AppDataSource.getRepository(RoomOccupancy);

                // const occupancies = await occupancyRepo
                // const { entities, raw } = await occupancyRepo
                // .createQueryBuilder("occ")
                // .leftJoinAndSelect("occ.room", "room")
                // .leftJoinAndSelect("room.room_type", "room_type")
                // .leftJoinAndSelect("occ.photos", "photos")
                // .leftJoin(
                //     RoomPrice,
                //     "prices",
                //     "prices.room_option_id = occ.room_option_id"
                // )
                // .addSelect([
                //     "prices.id",
                //     "prices.cost_sar",
                //     "prices.selling_price_usd",
                //     "prices.start_date",
                //     "prices.end_date",
                //     "prices.day_type",
                //     "prices.season_code"
                // ])
                // .where("room.hotel_id = :hotelId", { hotelId: targetHotelId })
                // //   .andWhere("occ.max_guests >= :totalGuests", { totalGuests })
                // //   .andWhere("occ.rooms_left > 0")   // only available options
                // // .getMany();
                // .getRawAndEntities();

                const { entities, raw } = await occupancyRepo
                                        .createQueryBuilder("occ")
                                        .leftJoinAndSelect("occ.room", "room")
                                        .leftJoinAndSelect("room.room_type", "room_type")
                                        .leftJoinAndSelect("occ.photos", "occupancyPhotos")
                                        .leftJoinAndSelect("room.photos", "roomPhotos")
                                        .leftJoin(
                                            RoomPrice,
                                            "prices",
                                            "prices.room_option_id = occ.room_option_id"
                                        )
                                        .addSelect([
                                            "prices.id",
                                            "prices.cost_sar",
                                            "prices.selling_price_usd",
                                            "prices.start_date",
                                            "prices.end_date",
                                            "prices.day_type",
                                            "prices.season_code"
                                        ])
                                        .where("room.hotel_id = :hotelId", {
                                            hotelId: targetHotelId
                                        })
                                        .getRawAndEntities();


                // return res.send(entities);

                // --- Group by room (each room card) → occupancy options inside ---
                const groupedByRoom: Record<number, {
                room: {
                    id: number;
                    name: string;
                    room_name_id: string;
                    description: string;
                    size_sqft: number;
                    view_type: string;
                    view_from_room: string[];
                    bed_type: string;
                    image_url: string | null;
                    room_type: { id: number; name: string } | null;
                };
                occupancy_options: any[];
                }> = {};

            const results = entities.map((occ: RoomOccupancy, index: number) => {
                const room = occ.room;

                const pricingRows = raw.filter(
                    (r: any) => r.occ_id === occ.id
                );

                return {
                    occupancy_id:        occ.id,
                    room_option_id:      occ.room_option_id,
                    occupancy:           occ.occupancy,        // "Double" | "Triple" | "Quad"
                    max_guests:          occ.max_guests,
                    rooms_left:          occ.rooms_left,
                    image_url:           occ.image_url,
                    website_description: occ.website_description,
                    base_meal_plan:      occ.base_meal_plan,
                    photos:              occ.photos?.length > 0
    ? occ.photos
    : room.photos ?? [],
                    // pricing: {
                    // price_per_night: Number(room.price_per_night),
                    // total_price:     Number(room.price_per_night) * nights,
                    // nights,
                    // },
                    prices: pricingRows.map(price => ({
                        id: price.prices_id,
                        cost_sar: Number(price.prices_cost_sar),
                        selling_price_usd: Number(price.prices_selling_price_usd),
                        start_date: price.prices_start_date,
                        end_date: price.prices_end_date,
                        day_type: price.prices_day_type,
                        season_code: price.prices_season_code
                    })),
                    room: {
                    id:             room.id,
                    name:           room.name,
                    room_name_id:   room.room_name_id,
                    description:    room.description,
                    size_sqft:      room.size_sqft,
                    view_type:      room.view_type,
                    view_from_room: room.view_from_room,
                    bed_type:       room.bed_type,
                    image_url:      room.image_url,
                    room_type:      room.room_type
                        ? { id: room.room_type.id, name: room.room_type.name }
                        : null,
                    },
                };
            });

            return res.status(200).json({
            success: true,
            search_params: {
                hotel_id:     targetHotelId,
                check_in,
                check_out,
                nights,
                rooms:        Number(rooms),
                adults:       Number(adults),
                children:     Number(children),
                total_guests: totalGuests,
            },
            results,
            total_results: results.length,
            });

        } catch (error: any) {
            console.error("Room search error:", error);
            return res.status(500).json({ message: error.message || "Internal server error" });
        }
    }

    static search_two = async (req: Request, res: Response) => {
        try {
            const {
                hotel_id,
                check_in,
                check_out,
                rooms = 1,
                adults = 1,
                children = 0,
                } = req.body;

                const totalGuests  = Number(adults) + Number(children);
                const targetHotelId = hotel_id ?? 32;

                let nights = 0;

                if (check_in && check_out) {
                    const checkInDate = new Date(check_in);
                    const checkOutDate = new Date(check_out);

                    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                        return res.status(400).json({
                            message: "Invalid date format"
                        });
                    }

                    if (checkInDate >= checkOutDate) {
                        return res.status(400).json({
                            message: "check_out must be after check_in"
                        });
                    }

                    nights = Math.ceil(
                        (checkOutDate.getTime() - checkInDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                }

                // --- Query RoomOccupancies directly ---
                const occupancyRepo = AppDataSource.getRepository(RoomOccupancy);
               

                const { entities, raw } = await occupancyRepo
                                        .createQueryBuilder("occ")
                                        .leftJoinAndSelect("occ.room", "room")
                                        .leftJoinAndSelect("room.room_type", "room_type")
                                        .leftJoinAndSelect("occ.photos", "occupancyPhotos")
                                        .leftJoinAndSelect("room.photos", "roomPhotos")
                                        .leftJoin(
                                            RoomPrice,
                                            "prices",
                                            "prices.room_option_id = occ.room_option_id"
                                        )
                                        .addSelect([
                                            "prices.id",
                                            "prices.cost_sar",
                                            "prices.selling_price_usd",
                                            "prices.start_date",
                                            "prices.end_date",
                                            "prices.day_type",
                                            "prices.season_code"
                                        ])
                                        .where("room.hotel_id = :hotelId", {
                                            hotelId: targetHotelId
                                        })
                                        .getRawAndEntities();


                // return res.send(entities);

                // --- Group by room (each room card) → occupancy options inside ---
                const groupedByRoom: Record<number, {
                room: {
                    id: number;
                    name: string;
                    room_name_id: string;
                    description: string;
                    size_sqft: number;
                    view_type: string;
                    view_from_room: string[];
                    bed_type: string;
                    image_url: string | null;
                    room_type: { id: number; name: string } | null;
                };
                occupancy_options: any[];
                }> = {};

            const results = entities.map((occ: RoomOccupancy, index: number) => {
                const room = occ.room;

                const pricingRows = raw.filter(
                    (r: any) => r.occ_id === occ.id
                );

                return {
                    occupancy_id:        occ.id,
                    room_option_id:      occ.room_option_id,
                    occupancy:           occ.occupancy,        // "Double" | "Triple" | "Quad"
                    max_guests:          occ.max_guests,
                    rooms_left:          occ.rooms_left,
                    image_url:           occ.image_url,
                    room_description: room.description,
                    // base_meal_plan:      occ.base_meal_plan,
                    photos:              occ.photos?.length > 0 ? occ.photos : room.photos ?? [],
                    room_name: `${occ.occupancy} ${room.name}`,
                    room_size_sqft: room.size_sqft,
                    room_bed_description: occ.website_description,
                };
            });

            return res.status(200).json({
            success: true,
            search_params: {
                hotel_id:     targetHotelId,
                check_in,
                check_out,
                nights,
                rooms:        Number(rooms),
                adults:       Number(adults),
                children:     Number(children),
                total_guests: totalGuests,
            },
            results,
            total_results: results.length,
            });

        } catch (error: any) {
            console.error("Room search error:", error);
            return res.status(500).json({ message: error.message || "Internal server error" });
        }
    }

    // static search_rooms_three = async (req: Request, res: Response) => {
    //     try {
    //         const {
    //             hotel_id,
    //             check_in,
    //             check_out,
    //             rooms = 1,
    //             adults = 1,
    //             children = 0,
    //         } = req.body || {};

    //         const totalGuests = Number(adults) + Number(children);
    //         const targetHotelId = hotel_id ?? 32;

    //         let nights = 0;

    //         if (check_in && check_out) {
    //             const checkInDate = new Date(check_in);
    //             const checkOutDate = new Date(check_out);

    //             if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    //                 return res.status(400).json({
    //                     message: "Invalid date format"
    //                 });
    //             }

    //             if (checkInDate >= checkOutDate) {
    //                 return res.status(400).json({
    //                     message: "check_out must be after check_in"
    //                 });
    //             }

    //             nights = Math.ceil(
    //                 (checkOutDate.getTime() - checkInDate.getTime()) /
    //                 (1000 * 60 * 60 * 24)
    //             );
    //         }

    //         // --- Query Rooms directly (no occupancy join) ---
    //         const roomRepo = AppDataSource.getRepository(Room);

    //         const query = roomRepo
    //             .createQueryBuilder("room")
    //             .leftJoinAndSelect("room.room_type", "room_type")
    //             .leftJoinAndSelect("room.photos", "photos")
    //             .leftJoinAndSelect("room.room_extras", "room_extras")
    //             .where("room.hotel_id = :hotelId", { hotelId: targetHotelId })
    //             .andWhere("room.id NOT IN (:...excludedIds)", { excludedIds: [66, 49] })
    //             .orderBy("room.max_guests", "ASC")
    //             .addOrderBy("photos.position", "ASC");

    //         // Only show rooms that can fit the requested guest count
    //         // if (totalGuests > 0) {
    //         //     query.andWhere("room.max_guests >= :totalGuests", { totalGuests });
    //         // }

    //         const roomEntities = await query.getMany();

    //         const results = roomEntities.map((room: Room) => ({
    //             id: room.id,
    //             name: room.name,
    //             room_name_id: room.room_name_id,
    //             description: room.description,
    //             size_sqft: room.size_sqft,
    //             view_type: room.view_type,
    //             view_from_room: room.view_from_room,
    //             bed_type: room.bed_type,
    //             max_guests: room.max_guests,
    //             image_url: room.image_url,
    //             price_per_night: room.price_per_night,
    //             free_cancellation_hours: room.free_cancellation_hours,
    //             refundable: room.refundable,
    //             photos: room.photos ?? [],
    //             room_extras: room.room_extras ?? [],
    //             room_type: room.room_type
    //                 ? { id: room.room_type.id, name: room.room_type.name }
    //                 : null,
    //         }));

    //         return res.status(200).json({
    //             success: true,
    //             search_params: {
    //                 hotel_id: targetHotelId,
    //                 check_in,
    //                 check_out,
    //                 nights,
    //                 rooms: Number(rooms),
    //                 adults: Number(adults),
    //                 children: Number(children),
    //                 total_guests: totalGuests,
    //             },
    //             results,
    //             total_results: results.length,
    //         });

    //     } catch (error: any) {
    //         console.error("Room search error:", error);
    //         return res.status(500).json({ message: error.message || "Internal server error" });
    //     }
    // }

    static search_rooms_three = async (req: Request, res: Response) => {
        try {
            const {
                hotel_id,
                check_in,
                check_out,
                rooms = 1,
                adults = 1,
                children = 0,
            } = req.body || {};

            const totalGuests = Number(adults) + Number(children);
            const targetHotelId = hotel_id ?? 32;

            let nights = 0;
            let checkInDate: Date | null = null;

            if (check_in && check_out) {
                checkInDate = new Date(check_in);
                const checkOutDate = new Date(check_out);

                if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                    return res.status(400).json({
                        message: "Invalid date format"
                    });
                }

                if (checkInDate >= checkOutDate) {
                    return res.status(400).json({
                        message: "check_out must be after check_in"
                    });
                }

                nights = Math.ceil(
                    (checkOutDate.getTime() - checkInDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
            }

            // Date used for price lookup: check_in date if provided, else today
            const pricingDate = checkInDate ?? new Date();
            // Normalize to midnight to avoid time-of-day issues when comparing to date columns
            const pricingDateOnly = new Date(
                pricingDate.getFullYear(),
                pricingDate.getMonth(),
                pricingDate.getDate()
            );

            const dayOfWeek = pricingDateOnly.getDay(); // 0 = Sun, 6 = Sat
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            // --- Query Rooms directly (no occupancy join) ---
            const roomRepo = AppDataSource.getRepository(Room);

            const query = roomRepo
                .createQueryBuilder("room")
                .leftJoinAndSelect("room.room_type", "room_type")
                .leftJoinAndSelect("room.photos", "photos")
                .leftJoinAndSelect("room.room_extras", "room_extras")
                .where("room.hotel_id = :hotelId", { hotelId: targetHotelId })
                .andWhere("room.id NOT IN (:...excludedIds)", { excludedIds: [66, 49] })
                .orderBy("room.max_guests", "ASC")
                .addOrderBy("photos.position", "ASC");

            // Only show rooms that can fit the requested guest count
            // if (totalGuests > 0) {
            //     query.andWhere("room.max_guests >= :totalGuests", { totalGuests });
            // }

            const roomEntities = await query.getMany();

            // --- Fetch matching prices from room_prices_v2 for these rooms ---
            const roomOptionIds = roomEntities
                .map((room) => room.room_name_id)
                .filter((id): id is string => !!id);

            let priceByOptionId = new Map<string, RoomPriceV2>();

            if (roomOptionIds.length > 0) {
                const priceRepo = AppDataSource.getRepository(RoomPriceV2);

                const priceRows = await priceRepo
                    .createQueryBuilder("price")
                    .where("price.room_option_id IN (:...roomOptionIds)", { roomOptionIds })
                    .andWhere("price.start_date <= :pricingDate", { pricingDate: pricingDateOnly })
                    .andWhere("price.end_date >= :pricingDate", { pricingDate: pricingDateOnly })
                    .getMany();

                // If multiple rows could match the same room for the same date
                // (e.g. overlapping season codes), this keeps the last one found.
                // Adjust this if you need explicit season_code priority.
                for (const row of priceRows) {
                    priceByOptionId.set(row.room_option_id, row);
                }
            }

            const results = roomEntities.map((room: Room) => {
                const matchedPrice = room.room_name_id
                    ? priceByOptionId.get(room.room_name_id)
                    : undefined;

                let effectivePrice: number = Number(room.price_per_night);
                let priceSource: "room_prices_v2" | "room_default" = "room_default";

                if (matchedPrice) {
                    effectivePrice = isWeekend
                        ? Number(matchedPrice.weekend_price)
                        : Number(matchedPrice.weekday_price);
                    priceSource = "room_prices_v2";
                }

                return {
                    id: room.id,
                    name: room.name,
                    room_name_id: room.room_name_id,
                    description: room.description,
                    size_sqft: room.size_sqft,
                    view_type: room.view_type,
                    view_from_room: room.view_from_room,
                    bed_type: room.bed_type,
                    max_guests: room.max_guests,
                    image_url: room.image_url,
                    price_per_night: effectivePrice,
                    price_source: priceSource,
                    is_weekend_pricing: isWeekend,
                    free_cancellation_hours: room.free_cancellation_hours,
                    refundable: room.refundable,
                    photos: room.photos ?? [],
                    room_extras: room.room_extras ?? [],
                    room_type: room.room_type
                        ? { id: room.room_type.id, name: room.room_type.name }
                        : null,
                };
            });

            return res.status(200).json({
                success: true,
                search_params: {
                    hotel_id: targetHotelId,
                    check_in,
                    check_out,
                    pricing_date_used: pricingDateOnly.toISOString().split("T")[0],
                    nights,
                    rooms: Number(rooms),
                    adults: Number(adults),
                    children: Number(children),
                    total_guests: totalGuests,
                },
                results,
                total_results: results.length,
            });

        } catch (error: any) {
            console.error("Room search error:", error);
            return res.status(500).json({ message: error.message || "Internal server error" });
        }
    }

    // static search_room = async (req: Request, res: Response) => {
    //     try {
    //         const { room_option_id } = req.params;
    //         const { check_in, check_out } = req.query as { check_in: string; check_out: string };

    //         if (!check_in || !check_out) {
    //         return res.status(400).json({ message: "check_in and check_out are required" });
    //         }

    //         const checkInDate  = new Date(check_in);
    //         const checkOutDate = new Date(check_out);

    //         if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    //         return res.status(400).json({ message: "Invalid date format" });
    //         }

    //         if (checkInDate >= checkOutDate) {
    //         return res.status(400).json({ message: "check_out must be after check_in" });
    //         }

    //         const nights = Math.ceil(
    //         (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    //         );

    //         // --- 1. Fetch the occupancy option ---
    //         const occupancyRepo = AppDataSource.getRepository(RoomOccupancy);

    //         const occupancy = await occupancyRepo
    //         .createQueryBuilder("occ")
    //         .leftJoinAndSelect("occ.room", "room")
    //         .leftJoinAndSelect("room.room_type", "room_type")
    //         .leftJoinAndSelect("occ.photos", "occ_photos")
    //         .where("occ.room_option_id = :room_option_id", { room_option_id })
    //         .getOne();

    //         if (!occupancy) {
    //         return res.status(404).json({ message: "Room occupancy option not found" });
    //         }

    //         // --- 2. Fetch room photos ---
    //         const roomPhotoRepo = AppDataSource.getRepository(RoomPhoto);
    //         const roomPhotos = await roomPhotoRepo.find({
    //         where: { room_id: occupancy.room_id },
    //         order: { position: "ASC" },
    //         });

    //         // --- 3. Fetch room extras (Extra Services section on the right) ---
    //         const roomExtraRepo = AppDataSource.getRepository(RoomExtra);
    //         const extras = await roomExtraRepo.find({
    //         where: { room_id: occupancy.room_id },
    //         });

    //         // --- 4. Fetch price for date range ---
    //         const roomPriceRepo = AppDataSource.getRepository(RoomPrice);

    //         // console.log("room option id ;;;;;;;", room_option_id);

    //         const prices = await roomPriceRepo
    //         .createQueryBuilder("rp")
    //         .where("rp.room_option_id = :room_option_id", { room_option_id })
    //         // .andWhere("rp.start_date <= :checkOut", { checkOut: check_out })
    //         // .andWhere("rp.end_date >= :checkIn",   { checkIn: check_in })
    //         .orderBy("rp.start_date", "ASC")
    //         .getMany();

    //         // console.log("prices coming ;;;;;;", prices);

    //         // Calculate total cost across the date range
    //         // Each RoomPrice row covers a date range; sum up applicable days
    //         let total_cost_usd = 0;
    //         let price_per_night = 0;

    //         if (prices.length > 0) {
    //         // Simple approach: use the first matching price's selling_price_usd
    //         // For more accuracy you can iterate day by day
    //         price_per_night = Number(prices[0].selling_price_usd ?? 0);
    //         total_cost_usd  = price_per_night * nights;
    //         } else {
    //         // Fallback to room's base price_per_night
    //         price_per_night = Number(occupancy.room?.price_per_night ?? 0);
    //         total_cost_usd  = price_per_night * nights;
    //         }

    //         // --- 5. Build response ---
    //         const room = occupancy.room;

    //         return res.status(200).json({
    //         success: true,
    //         data: {
    //             // Occupancy option details
    //             occupancy: {
    //             id:                  occupancy.id,
    //             room_option_id:      occupancy.room_option_id,
    //             occupancy_type:      occupancy.occupancy,        // "Double" | "Triple" | "Quad"
    //             max_guests:          occupancy.max_guests,
    //             rooms_left:          occupancy.rooms_left,
    //             website_description: occupancy.website_description,
    //             base_meal_plan:      occupancy.base_meal_plan,
    //             image_url:           occupancy.image_url,
    //             photos:              occupancy.photos ?? [],
    //             },

    //             // Parent room info
    //             room: {
    //             id:             room.id,
    //             name:           room.name,
    //             room_name_id:   room.room_name_id,
    //             description:    room.description,
    //             size_sqft:      room.size_sqft,
    //             max_guests:     room.max_guests,
    //             bed_type:       room.bed_type,
    //             view_type:      room.view_type,
    //             view_from_room: room.view_from_room,
    //             image_url:      room.image_url,
    //             refundable:              room.refundable,
    //             free_cancellation_hours: room.free_cancellation_hours,
    //             breakfast_included:      room.breakfast_included,
    //             room_type: room.room_type
    //                 ? { id: room.room_type.id, name: room.room_type.name }
    //                 : null,
    //             },

    //             // All photos (room-level)
    //             photos: roomPhotos.map((p) => ({
    //             id:        p.id,
    //             image_url: p.image_url,
    //             position:  p.position,
    //             })),

    //             // Extra services (the checkboxes in your UI)
    //             extras: extras.map((e) => ({
    //             id:    e.id,
    //             name:  e.name,
    //             price: Number(e.price),
    //             })),

    //             // Pricing
    //             pricing: {
    //             check_in,
    //             check_out,
    //             nights,
    //             price_per_night,
    //             total_cost_usd,
    //             price_breakdown: prices.map((p) => ({
    //                 start_date:        p.start_date,
    //                 end_date:          p.end_date,
    //                 day_type:          p.day_type,
    //                 selling_price_usd: Number(p.selling_price_usd),
    //                 cost_sar:          Number(p.cost_sar),
    //                 hb_cost_sar:       Number(p.hb_cost_sar),
    //                 fb_cost_sar:       Number(p.fb_cost_sar),
    //             })),
    //             },
    //         },
    //         });

    //     } catch (error) {
    //         console.error("Occupancy detail error:", error);
    //         return res.status(500).json({ message: "Internal server error" });
    //     }
    // }

    static search_room = async (req: Request, res: Response) => {
        try {
            const { room_option_id } = req.params;
            const { check_in, check_out } = req.query as { check_in?: string; check_out?: string };

            // --- Default dates if not provided ---
            let checkInDate: Date;
            let checkOutDate: Date;

            if (check_in) {
                checkInDate = new Date(check_in);
                if (isNaN(checkInDate.getTime())) {
                    return res.status(400).json({ message: "Invalid check_in date format" });
                }
            } else {
                checkInDate = new Date();
                checkInDate.setHours(0, 0, 0, 0);
            }

            if (check_out) {
                checkOutDate = new Date(check_out);
                if (isNaN(checkOutDate.getTime())) {
                    return res.status(400).json({ message: "Invalid check_out date format" });
                }
            } else {
                checkOutDate = new Date(checkInDate);
                checkOutDate.setDate(checkOutDate.getDate() + 1);
            }

            if (checkInDate >= checkOutDate) {
            return res.status(400).json({ message: "check_out must be after check_in" });
            }

            const nights = Math.ceil(
            (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Normalized strings for query building / response (in case dates were defaulted)
            const checkInStr = checkInDate.toISOString().split("T")[0];
            const checkOutStr = checkOutDate.toISOString().split("T")[0];

            // --- 1. Fetch the occupancy option ---
            const occupancyRepo = AppDataSource.getRepository(RoomOccupancy);

            const occupancy = await occupancyRepo
            .createQueryBuilder("occ")
            .leftJoinAndSelect("occ.room", "room")
            .leftJoinAndSelect("room.room_type", "room_type")
            .leftJoinAndSelect("occ.photos", "occ_photos")
            .where("occ.room_option_id = :room_option_id", { room_option_id })
            .getOne();

            if (!occupancy) {
            return res.status(404).json({ message: "Room occupancy option not found" });
            }

            // --- 2. Fetch room photos ---
            const roomPhotoRepo = AppDataSource.getRepository(RoomPhoto);
            const roomPhotos = await roomPhotoRepo.find({
            where: { room_id: occupancy.room_id },
            order: { position: "ASC" },
            });

            // --- 3. Fetch room extras (Extra Services section on the right) ---
            const roomExtraRepo = AppDataSource.getRepository(RoomExtra);
            const extras = await roomExtraRepo.find({
            where: { room_id: occupancy.room_id },
            });

            // --- 4. Fetch price rows for this room_option_id from room_prices_v2 ---
            const roomPriceRepo = AppDataSource.getRepository(RoomPriceV2);

            const priceRows = await roomPriceRepo
            .createQueryBuilder("rp")
            .where("rp.room_option_id = :room_option_id", { room_option_id })
            .andWhere("rp.start_date <= :checkOut", { checkOut: checkOutStr })
            .andWhere("rp.end_date >= :checkIn",   { checkIn: checkInStr })
            .orderBy("rp.start_date", "ASC")
            .getMany();

            // Helper: find the price row covering a given date
            const findRowForDate = (date: Date): RoomPriceV2 | undefined => {
                return priceRows.find((row) => {
                    const start = new Date(row.start_date);
                    const end = new Date(row.end_date);
                    return date >= start && date <= end;
                });
            };

            // --- Calculate total cost night-by-night ---
            let total_cost_usd = 0;
            let price_per_night = 0; // used as a display value: price of the first night
            const nightly_breakdown: Array<{
                date: string;
                day_type: "weekday" | "weekend";
                price: number;
                matched: boolean;
            }> = [];

            for (let i = 0; i < nights; i++) {
                const nightDate = new Date(checkInDate);
                nightDate.setDate(nightDate.getDate() + i);

                const matchedRow = findRowForDate(nightDate);
                const dayOfWeek = nightDate.getDay(); // 0 = Sun, 6 = Sat
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                let nightPrice: number;
                let matched = true;

                if (matchedRow) {
                    nightPrice = isWeekend
                        ? Number(matchedRow.weekend_price)
                        : Number(matchedRow.weekday_price);
                } else {
                    // Fallback to room's base price_per_night if no v2 row covers this date
                    nightPrice = Number(occupancy.room?.price_per_night ?? 0);
                    matched = false;
                }

                if (i === 0) {
                    price_per_night = nightPrice;
                }

                total_cost_usd += nightPrice;

                nightly_breakdown.push({
                    date: nightDate.toISOString().split("T")[0],
                    day_type: isWeekend ? "weekend" : "weekday",
                    price: nightPrice,
                    matched,
                });
            }

            // --- 5. Build response ---
            const room = occupancy.room;

            return res.status(200).json({
            success: true,
            data: {
                // Occupancy option details
                occupancy: {
                id:                  occupancy.id,
                room_option_id:      occupancy.room_option_id,
                occupancy_type:      occupancy.occupancy,        // "Double" | "Triple" | "Quad"
                max_guests:          occupancy.max_guests,
                rooms_left:          occupancy.rooms_left,
                website_description: occupancy.website_description,
                base_meal_plan:      occupancy.base_meal_plan,
                image_url:           occupancy.image_url,
                photos:              occupancy.photos ?? [],
                },

                // Parent room info
                room: {
                id:             room.id,
                name:           room.name,
                room_name_id:   room.room_name_id,
                description:    room.description,
                size_sqft:      room.size_sqft,
                max_guests:     room.max_guests,
                bed_type:       room.bed_type,
                view_type:      room.view_type,
                view_from_room: room.view_from_room,
                image_url:      room.image_url,
                refundable:              room.refundable,
                free_cancellation_hours: room.free_cancellation_hours,
                breakfast_included:      room.breakfast_included,
                room_type: room.room_type
                    ? { id: room.room_type.id, name: room.room_type.name }
                    : null,
                },

                // All photos (room-level)
                photos: roomPhotos.map((p) => ({
                id:        p.id,
                image_url: p.image_url,
                position:  p.position,
                })),

                // Extra services (the checkboxes in your UI)
                extras: extras.map((e) => ({
                id:    e.id,
                name:  e.name,
                price: Number(e.price),
                })),

                // Pricing
                pricing: {
                check_in: checkInStr,
                check_out: checkOutStr,
                dates_defaulted: !check_in || !check_out,
                nights,
                price_per_night,
                total_cost_usd,
                price_breakdown: nightly_breakdown,
                },
            },
            });

        } catch (error) {
            console.error("Occupancy detail error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // static get_room_by_name_id = async (req: Request, res: Response) => {
    //     try {
    //         const { room_name_id } = req.params;

    //         if (!room_name_id) {
    //             return res.status(400).json({
    //                 message: "room_name_id is required"
    //             });
    //         }

    //         const roomRepo = AppDataSource.getRepository(Room);

    //         const room = await roomRepo
    //             .createQueryBuilder("room")
    //             .leftJoinAndSelect("room.room_type", "room_type")
    //             .leftJoinAndSelect("room.photos", "photos")
    //             .leftJoinAndSelect("room.room_extras", "room_extras")
    //             .leftJoinAndSelect("room.occupancies", "occupancies")
    //             .leftJoinAndSelect("room.hotel", "hotel")
    //             .where("room.room_name_id = :roomNameId", { roomNameId: room_name_id })
    //             .orderBy("photos.position", "ASC")
    //             .getOne();

    //         if (!room) {
    //             return res.status(404).json({
    //                 message: "Room not found"
    //             });
    //         }

    //         const result = {
    //             id: room.id,
    //             room_name_id: room.room_name_id,
    //             name: room.name,
    //             description: room.description,
    //             hotel_id: room.hotel_id,
    //             hotel: room.hotel
    //                 ? { id: room.hotel.id, name: (room.hotel as any).name }
    //                 : null,
    //             max_guests: room.max_guests,
    //             bed_type: room.bed_type,
    //             size_sqft: room.size_sqft,
    //             view_type: room.view_type,
    //             view_from_room: room.view_from_room,
    //             image_url: room.image_url,

    //             // pricing
    //             base_price: room.base_price,
    //             price_per_night: room.price_per_night,

    //             // policy fields
    //             refundable: room.refundable,
    //             free_cancellation_hours: room.free_cancellation_hours,
    //             breakfast_included: room.breakfast_included,

    //             // relations
    //             room_type: room.room_type
    //                 ? { id: room.room_type.id, name: room.room_type.name }
    //                 : null,
    //             photos: room.photos ?? [],
    //             room_extras: room.room_extras ?? [],
    //             occupancies: room.occupancies ?? [],

    //             // timestamps
    //             created_at: room.created_at,
    //             updated_at: room.updated_at,
    //         };

    //         return res.status(200).json({
    //             success: true,
    //             room: result,
    //         });

    //     } catch (error: any) {
    //         console.error("Get room by room_name_id error:", error);
    //         return res.status(500).json({ message: error.message || "Internal server error" });
    //     }
    // }

    // static get_room_by_name_id = async (req: Request, res: Response) => {
    //     try {
    //         const { room_name_id } = req.params;
    //         const { check_in, check_out } = req.query as { check_in?: string; check_out?: string };

    //         if (!room_name_id) {
    //             return res.status(400).json({
    //                 message: "room_name_id is required"
    //             });
    //         }

    //         // --- Default dates if not provided (check_in/check_out optional) ---
    //         let checkInDate: Date;
    //         let checkOutDate: Date;

    //         if (check_in) {
    //             checkInDate = new Date(check_in);
    //             if (isNaN(checkInDate.getTime())) {
    //                 return res.status(400).json({ message: "Invalid check_in date format" });
    //             }
    //         } else {
    //             checkInDate = new Date();
    //             checkInDate.setHours(0, 0, 0, 0);
    //         }

    //         if (check_out) {
    //             checkOutDate = new Date(check_out);
    //             if (isNaN(checkOutDate.getTime())) {
    //                 return res.status(400).json({ message: "Invalid check_out date format" });
    //             }
    //         } else {
    //             checkOutDate = new Date(checkInDate);
    //             checkOutDate.setDate(checkOutDate.getDate() + 1);
    //         }

    //         if (checkInDate >= checkOutDate) {
    //             return res.status(400).json({ message: "check_out must be after check_in" });
    //         }

    //         const nights = Math.ceil(
    //             (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    //         );

    //         const checkInStr = checkInDate.toISOString().split("T")[0];
    //         const checkOutStr = checkOutDate.toISOString().split("T")[0];
    //         const datesDefaulted = !check_in || !check_out;

    //         const roomRepo = AppDataSource.getRepository(Room);

    //         const room = await roomRepo
    //             .createQueryBuilder("room")
    //             .leftJoinAndSelect("room.room_type", "room_type")
    //             .leftJoinAndSelect("room.photos", "photos")
    //             .leftJoinAndSelect("room.room_extras", "room_extras")
    //             .leftJoinAndSelect("room.occupancies", "occupancies")
    //             .leftJoinAndSelect("room.hotel", "hotel")
    //             .where("room.room_name_id = :roomNameId", { roomNameId: room_name_id })
    //             .orderBy("photos.position", "ASC")
    //             .getOne();

    //         if (!room) {
    //             return res.status(404).json({
    //                 message: "Room not found"
    //             });
    //         }

    //         // --- Fetch room_prices_v2 rows relevant to this stay window ---
    //         const priceRepo = AppDataSource.getRepository(RoomPriceV2);

    //         const priceRows = await priceRepo
    //             .createQueryBuilder("rp")
    //             .where("rp.room_option_id = :roomOptionId", { roomOptionId: room.room_name_id })
    //             .andWhere("rp.start_date <= :checkOut", { checkOut: checkOutStr })
    //             .andWhere("rp.end_date >= :checkIn", { checkIn: checkInStr })
    //             .orderBy("rp.start_date", "ASC")
    //             .getMany();

    //         // Helper: find the price row covering a given date
    //         const findRowForDate = (date: Date): RoomPriceV2 | undefined => {
    //             return priceRows.find((row) => {
    //                 const start = new Date(row.start_date);
    //                 const end = new Date(row.end_date);
    //                 return date >= start && date <= end;
    //             });
    //         };

    //         // --- Calculate total cost night-by-night ---
    //         let total_cost_usd = 0;
    //         let price_per_night = 0; // display value: price of the first night
    //         let minimum_stay: number | null = null; 
    //         const nightly_breakdown: Array<{
    //             date: string;
    //             day_type: "weekday" | "weekend";
    //             price: number;
    //             minimum_stay: number | null;
    //             matched: boolean;
    //         }> = [];

    //         for (let i = 0; i < nights; i++) {
    //             const nightDate = new Date(checkInDate);
    //             nightDate.setDate(nightDate.getDate() + i);

    //             const matchedRow = findRowForDate(nightDate);
    //             const dayOfWeek = nightDate.getDay(); // 0 = Sun, 6 = Sat
    //             const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    //             let nightPrice: number;
    //             let nightMinStay: number | null = null;
    //             let matched = true;

    //             if (matchedRow) {
    //                 nightPrice = isWeekend
    //                     ? Number(matchedRow.weekend_price)
    //                     : Number(matchedRow.weekday_price);
    //                 nightMinStay = matchedRow.minimum_stay ?? null;
    //             } else {
    //                 // Fallback to room's base price_per_night if no v2 row covers this date
    //                 nightPrice = Number(room.price_per_night ?? 0);
    //                 matched = false;
    //             }

    //             if (i === 0) {
    //                 price_per_night = nightPrice;
    //                 minimum_stay = nightMinStay;
    //             }

    //             total_cost_usd += nightPrice;

    //             nightly_breakdown.push({
    //                 date: nightDate.toISOString().split("T")[0],
    //                 day_type: isWeekend ? "weekend" : "weekday",
    //                 price: nightPrice,
    //                 minimum_stay: nightMinStay,
    //                 matched,
    //             });
    //         }

    //         const result = {
    //             id: room.id,
    //             room_name_id: room.room_name_id,
    //             name: room.name,
    //             description: room.description,
    //             hotel_id: room.hotel_id,
    //             hotel: room.hotel
    //                 ? { id: room.hotel.id, name: (room.hotel as any).name }
    //                 : null,
    //             max_guests: room.max_guests,
    //             bed_type: room.bed_type,
    //             size_sqft: room.size_sqft,
    //             view_type: room.view_type,
    //             view_from_room: room.view_from_room,
    //             image_url: room.image_url,

    //             // pricing
    //             base_price: room.base_price,
    //             price_per_night,
    //             minimum_stay,
    //             // policy fields
    //             refundable: room.refundable,
    //             free_cancellation_hours: room.free_cancellation_hours,
    //             breakfast_included: room.breakfast_included,

    //             // relations
    //             room_type: room.room_type
    //                 ? { id: room.room_type.id, name: room.room_type.name }
    //                 : null,
    //             photos: room.photos ?? [],
    //             room_extras: room.room_extras ?? [],
    //             occupancies: room.occupancies ?? [],

    //             // stay-based pricing summary
    //             pricing: {
    //                 check_in: checkInStr,
    //                 check_out: checkOutStr,
    //                 dates_defaulted: datesDefaulted,
    //                 nights,
    //                 price_per_night,
    //                 total_cost_usd,
    //                 minimum_stay,
    //                 price_breakdown: nightly_breakdown,
    //             },

    //             // timestamps
    //             created_at: room.created_at,
    //             updated_at: room.updated_at,
    //         };

    //         return res.status(200).json({
    //             success: true,
    //             room: result,
    //         });

    //     } catch (error: any) {
    //         console.error("Get room by room_name_id error:", error);
    //         return res.status(500).json({ message: error.message || "Internal server error" });
    //     }
    // }

    static get_room_by_name_id = async (req: Request, res: Response) => {
        try {
            const { room_name_id } = req.params;
            const { check_in, check_out } = req.query as { check_in?: string; check_out?: string };

            if (!room_name_id) {
                return res.status(400).json({
                    message: "room_name_id is required"
                });
            }

            // --- Default dates if not provided (check_in/check_out optional) ---
            let checkInDate: Date;
            let checkOutDate: Date;

            if (check_in) {
                checkInDate = new Date(check_in);
                if (isNaN(checkInDate.getTime())) {
                    return res.status(400).json({ message: "Invalid check_in date format" });
                }
            } else {
                checkInDate = new Date();
                checkInDate.setHours(0, 0, 0, 0);
            }

            if (check_out) {
                checkOutDate = new Date(check_out);
                if (isNaN(checkOutDate.getTime())) {
                    return res.status(400).json({ message: "Invalid check_out date format" });
                }
            } else {
                checkOutDate = new Date(checkInDate);
                checkOutDate.setDate(checkOutDate.getDate() + 1);
            }

            if (checkInDate >= checkOutDate) {
                return res.status(400).json({ message: "check_out must be after check_in" });
            }

            const nights = Math.ceil(
                (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            const checkInStr = checkInDate.toISOString().split("T")[0];
            const checkOutStr = checkOutDate.toISOString().split("T")[0];
            const datesDefaulted = !check_in || !check_out;

            const roomRepo = AppDataSource.getRepository(Room);

            const room = await roomRepo
                .createQueryBuilder("room")
                .leftJoinAndSelect("room.room_type", "room_type")
                .leftJoinAndSelect("room.photos", "photos")
                .leftJoinAndSelect("room.room_extras", "room_extras")
                .leftJoinAndSelect("room.occupancies", "occupancies")
                .leftJoinAndSelect("room.hotel", "hotel")
                .where("room.room_name_id = :roomNameId", { roomNameId: room_name_id })
                .orderBy("photos.position", "ASC")
                .getOne();

            if (!room) {
                return res.status(404).json({
                    message: "Room not found"
                });
            }

            // --- Fetch room_prices_v2 rows relevant to this stay window ---
            const priceRepo = AppDataSource.getRepository(RoomPriceV2);

            const priceRows = await priceRepo
                .createQueryBuilder("rp")
                .where("rp.room_option_id = :roomOptionId", { roomOptionId: room.room_name_id })
                .andWhere("rp.start_date <= :checkOut", { checkOut: checkOutStr })
                .andWhere("rp.end_date >= :checkIn", { checkIn: checkInStr })
                .orderBy("rp.start_date", "ASC")
                .getMany();

            // Helper: find the price row covering a given date
            const findRowForDate = (date: Date): RoomPriceV2 | undefined => {
                return priceRows.find((row) => {
                    const start = new Date(row.start_date);
                    const end = new Date(row.end_date);
                    return date >= start && date <= end;
                });
            };

            // --- Calculate total cost night-by-night ---
            let total_cost_usd = 0;
            let price_per_night = 0; // display value: applicable price of the first night (weekday/weekend resolved)
            let weekday_price_first_night = 0;
            let weekend_price_first_night = 0;
            let minimum_stay: number | null = null;
            const nightly_breakdown: Array<{
                date: string;
                day_type: "weekday" | "weekend";
                price: number;          // the price that actually applies to this date (server-resolved)
                weekday_price: number;  // raw weekday rate for this date, so FE can toggle/recompute
                weekend_price: number;  // raw weekend rate for this date, so FE can toggle/recompute
                minimum_stay: number | null;
                matched: boolean;
            }> = [];

            for (let i = 0; i < nights; i++) {
                const nightDate = new Date(checkInDate);
                nightDate.setDate(nightDate.getDate() + i);

                const matchedRow = findRowForDate(nightDate);
                 // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
                const dayOfWeek = nightDate.getDay(); // 0 = Sun, 6 = Sat
                const isWeekend = dayOfWeek === 4 || dayOfWeek === 5;

                let weekdayPrice: number;
                let weekendPrice: number;
                let nightMinStay: number | null = null;
                let matched = true;

                if (matchedRow) {
                    weekdayPrice = Number(matchedRow.weekday_price);
                    weekendPrice = Number(matchedRow.weekend_price);
                    nightMinStay = matchedRow.minimum_stay ?? null;
                } else {
                    // Fallback to room's base price_per_night if no v2 row covers this date
                    weekdayPrice = Number(room.price_per_night ?? 0);
                    weekendPrice = Number(room.price_per_night ?? 0);
                    matched = false;
                }

                const nightPrice = isWeekend ? weekendPrice : weekdayPrice;

                if (i === 0) {
                    price_per_night = nightPrice;
                    weekday_price_first_night = weekdayPrice;
                    weekend_price_first_night = weekendPrice;
                    minimum_stay = nightMinStay;
                }

                total_cost_usd += nightPrice;

                nightly_breakdown.push({
                    date: nightDate.toISOString().split("T")[0],
                    day_type: isWeekend ? "weekend" : "weekday",
                    price: nightPrice,
                    weekday_price: weekdayPrice,
                    weekend_price: weekendPrice,
                    minimum_stay: nightMinStay,
                    matched,
                });
            }

            const result = {
                id: room.id,
                room_name_id: room.room_name_id,
                name: room.name,
                description: room.description,
                hotel_id: room.hotel_id,
                hotel: room.hotel
                    ? { id: room.hotel.id, name: (room.hotel as any).name }
                    : null,
                max_guests: room.max_guests,
                bed_type: room.bed_type,
                size_sqft: room.size_sqft,
                view_type: room.view_type,
                view_from_room: room.view_from_room,
                image_url: room.image_url,

                // pricing
                base_price: room.base_price,
                price_per_night,
                weekday_price: weekday_price_first_night,
                weekend_price: weekend_price_first_night,
                minimum_stay,
                // policy fields
                refundable: room.refundable,
                free_cancellation_hours: room.free_cancellation_hours,
                breakfast_included: room.breakfast_included,

                // relations
                room_type: room.room_type
                    ? { id: room.room_type.id, name: room.room_type.name }
                    : null,
                photos: room.photos ?? [],
                room_extras: room.room_extras ?? [],
                occupancies: room.occupancies ?? [],

                // stay-based pricing summary
                pricing: {
                    check_in: checkInStr,
                    check_out: checkOutStr,
                    dates_defaulted: datesDefaulted,
                    nights,
                    price_per_night,
                    weekday_price: weekday_price_first_night,
                    weekend_price: weekend_price_first_night,
                    total_cost_usd,
                    minimum_stay,
                    price_breakdown: nightly_breakdown,
                },

                // timestamps
                created_at: room.created_at,
                updated_at: room.updated_at,
            };

            return res.status(200).json({
                success: true,
                room: result,
            });

        } catch (error: any) {
            console.error("Get room by room_name_id error:", error);
            return res.status(500).json({ message: error.message || "Internal server error" });
        }
    }

    static taj_deals = async (req: Request, res: Response) => {
        try {
            const today = new Date().toISOString().split("T")[0]; // "2026-05-18"

            const dealRepo = AppDataSource.getRepository(Deal);

            const deals = await dealRepo
            .createQueryBuilder("deal")
            .where("deal.status = :status", { status: "active" })
            .andWhere("deal.start_date <= :today", { today })  // deal has started
            .andWhere("deal.end_date >= :today",   { today })  // deal hasn't expired
            .andWhere("(deal.rooms_left IS NULL OR deal.rooms_left > 0)")
            .orderBy("deal.deal_price", "ASC")
            .getMany();

            if (deals.length === 0) {
            return res.status(200).json({ success: true, data: [], total: 0 });
            }

            const roomIds      = [...new Set(deals.map((d) => d.room_id).filter(Boolean))];
            const occupancyIds = [...new Set(deals.map((d) => d.room_occupancy_id).filter(Boolean))];

            const roomRepo = AppDataSource.getRepository(Room);
            const rooms = await roomRepo
            .createQueryBuilder("room")
            .leftJoinAndSelect("room.room_type", "room_type")
            .leftJoinAndSelect("room.photos", "photos")
            .leftJoinAndSelect("room.room_extras", "room_extras")
            .whereInIds(roomIds)
            .getMany();

            const roomMap = new Map(rooms.map((r) => [r.id, r]));

            const occupancyRepo = AppDataSource.getRepository(RoomOccupancy);
            const occupancies = await occupancyRepo
            .createQueryBuilder("occ")
            .leftJoinAndSelect("occ.photos", "photos")
            .whereInIds(occupancyIds)
            .getMany();

            const occupancyMap = new Map(occupancies.map((o) => [o.id, o]));

            const data = deals.map((deal) => {
            const room      = roomMap.get(deal.room_id);
            const occupancy = occupancyMap.get(deal.room_occupancy_id);

            const savings      = Number(deal.actual_price) - Number(deal.deal_price);
            const discount_pct = deal.actual_price > 0
                ? Math.round((savings / Number(deal.actual_price)) * 100)
                : 0;

            return {
                deal: {
                id:            deal.id,
                title:         deal.title,
                description:   deal.description,
                discount_type: deal.discount_type,
                status:        deal.status,
                rooms_left:    deal.rooms_left,
                start_date:    deal.start_date,
                end_date:      deal.end_date,
                },
                pricing: {
                actual_price:  Number(deal.actual_price),
                deal_price:    Number(deal.deal_price),
                savings,
                discount_pct,
                },
                room: room ? {
                id:             room.id,
                name:           room.name,
                room_name_id:   room.room_name_id,
                description:    room.description,
                size_sqft:      room.size_sqft,
                bed_type:       room.bed_type,
                view_type:      room.view_type,
                image_url:      room.image_url,
                room_type:      room.room_type
                    ? { id: room.room_type.id, name: room.room_type.name }
                    : null,
                photos: (room.photos ?? [])
                    .sort((a, b) => a.position - b.position)
                    .map((p) => ({ id: p.id, image_url: p.image_url, position: p.position })),
                extras: (room.room_extras ?? [])
                    .map((e) => ({ id: e.id, name: e.name, price: Number(e.price) })),
                } : null,
                occupancy: occupancy ? {
                id:                  occupancy.id,
                room_option_id:      occupancy.room_option_id,
                occupancy_type:      occupancy.occupancy,
                max_guests:          occupancy.max_guests,
                rooms_left:          occupancy.rooms_left,
                base_meal_plan:      occupancy.base_meal_plan,
                website_description: occupancy.website_description,
                image_url:           occupancy.image_url,
                photos: (occupancy.photos ?? [])
                    .map((p) => ({ id: p.id, image_url: p.image_url })),
                } : null,
            };
            });

            return res.status(200).json({
            success: true,
            total: data.length,
            data,
            });

        } catch (error) {
            console.error("Deals fetch error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

    }

    static taj_deal_detail = async (req: Request, res: Response) => {
        try {
            const dealId = Number(req.params.id);
            const { check_in, check_out } = req.query as { check_in?: string; check_out?: string };

            if (!check_in || !check_out) {
            return res.status(400).json({ message: "check_in and check_out are required" });
            }

            const checkInDate  = new Date(check_in);
            const checkOutDate = new Date(check_out);

            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
            }

            if (checkInDate >= checkOutDate) {
            return res.status(400).json({ message: "check_out must be after check_in" });
            }

            const nights = Math.ceil(
            (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            const dealRepo = AppDataSource.getRepository(Deal);
            const deal = await dealRepo.findOne({ where: { id: dealId } });

            if (!deal) return res.status(404).json({ message: "Deal not found" });

            const roomRepo = AppDataSource.getRepository(Room);
            const room = await roomRepo
            .createQueryBuilder("room")
            .leftJoinAndSelect("room.room_type", "room_type")
            .leftJoinAndSelect("room.photos", "photos")
            .leftJoinAndSelect("room.room_extras", "room_extras")
            .where("room.id = :id", { id: deal.room_id })
            .getOne();

            const occupancyRepo = AppDataSource.getRepository(RoomOccupancy);
            const occupancy = await occupancyRepo
            .createQueryBuilder("occ")
            .leftJoinAndSelect("occ.photos", "photos")
            .where("occ.id = :id", { id: deal.room_occupancy_id })
            .getOne();

            const savings      = Number(deal.actual_price) - Number(deal.deal_price);
            const discount_pct = deal.actual_price > 0
            ? Math.round((savings / Number(deal.actual_price)) * 100)
            : 0;

            return res.status(200).json({
            success: true,
            data: {
                deal: {
                id:            deal.id,
                title:         deal.title,
                description:   deal.description,
                discount_type: deal.discount_type,
                status:        deal.status,
                rooms_left:    deal.rooms_left,
                start_date:    deal.start_date,
                end_date:      deal.end_date,
                },
                pricing: {
                actual_price:       Number(deal.actual_price),
                deal_price:         Number(deal.deal_price),
                savings,
                discount_pct,
                total_deal_price:   Number(deal.deal_price)   * nights,
                total_actual_price: Number(deal.actual_price) * nights,
                nights,
                check_in,
                check_out,
                },
                room:      room      ?? null,
                occupancy: occupancy ?? null,
            },
            });

        } catch (error) {
            console.error("Deal detail error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}