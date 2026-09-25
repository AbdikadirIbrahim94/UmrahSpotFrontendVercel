import { Request, Response } from "express";
import { Hotel } from "../entities/Hotel";
import { AppDataSource, initializeDataSource } from "../db/data-source";
import { RoomOccupancy } from "../entities/RoomOccupancy";
import { SeasonCode } from "../entities/SeasonCode";
import { RoomPrice } from "../entities/RoomPrice";
import { error } from "console";
import { CurrencyExchangeRate } from "../entities/CurrencyExchangeRate";
import { HotelMarkupRate } from "../entities/HotelMarkupRate";
import { Not, In } from "typeorm";
import { Room } from "../entities/Room";
import { RoomPriceV2 } from "../entities/RoomPrice2";
import { BookingTajpark } from "../entities/BookingTajpark";



export class PricingController {
    static addPricing = async (req: Request, res: Response) =>{
        try {
            const hotels =  await AppDataSource.getRepository(Hotel).find({
                                where: { id: 32,},
                                select: ["name_id", "name"],
                            });
            // const rooms_option =  await AppDataSource.getRepository(RoomOccupancy).find({
            // select: ["room_option_id"],
            // });
            const roomRepo = AppDataSource.getRepository(Room);

            //  const rooms_option = await AppDataSource
            //             .getRepository(RoomOccupancy)
            //             .createQueryBuilder("occ")
            //             .leftJoin("occ.room", "room")
            //             .leftJoin("room.hotel", "hotel")
            //             .leftJoin("room.room_type", "room_type")
            //             .select([
            //                 "occ.room_option_id AS room_option_id",
            //                 "occ.occupancy AS occupancy",
            //                 "room_type.name AS room_type_name"
            //             ])
            //             .getRawMany();

        const rooms_option = await roomRepo.find({
          where: {
              hotel_id: 32,
              id: Not(In([66, 49]))
          }
        });

    //   return res.send(rooms_option);

            const season_code =  await AppDataSource.getRepository(SeasonCode).find({
                            select: ["season_code_id"],
                        });


             return res.render("pricing/add", {
                user: { name: "Admin" },
                hotels, // Pass the fetched cities to EJS
                rooms_option,
                season_code
            });
        } catch (error) {
            console.log("error from add pricing ;;;;", error);
        }
    }

    static createRoomPrice = async (req: Request, res: Response) => {
        try {
            const {
            hotel_id,
            room_id,
            season_code_id,
            day_type,
            cost_sar,
            hb_cost_sar,
            fb_cost_sar,
            bb_upgrade_sar,
            hb_upgrade_sar,
            fb_upgrade_sar,
            start_date,
            end_date,
            unique_key,
            } = req.body;

            console.log("req body. data;;;;;;", req.body);
            // Validate required fields
            if (!hotel_id || !room_id || !season_code_id || !day_type || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
            }

            // Validate day_type
            if (!["WEEKDAY", "WEEKEND"].includes(day_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid day type. Must be WEEKDAY or WEEKEND",
            });
            }

            // Validate dates
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);

            if (startDate >= endDate) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date",
            });
            }

            // Get repository
            const roomPriceRepository = AppDataSource.getRepository(RoomPrice);

            // Check for duplicate entry
            const existingPrice = await roomPriceRepository.findOne({
            where: {
                hotel_id,
                room_option_id: room_id,
                season_code: season_code_id,
                start_date: startDate,
                end_date: endDate,
                day_type,
            },
            });

            if (existingPrice) {
            return res.status(409).json({
                success: false,
                message: "A pricing entry with these details already exists",
            });
            }

            // Create new room price
            const roomPrice = roomPriceRepository.create({
            hotel_id,
            room_option_id: room_id,
            season_code: season_code_id,
            day_type,
            cost_sar: parseFloat(cost_sar) || 0,
            hb_cost_sar: hb_cost_sar ? parseFloat(hb_cost_sar) : null,
            fb_cost_sar: fb_cost_sar ? parseFloat(fb_cost_sar) : null,
            bb_upgrade_sar: parseFloat(bb_upgrade_sar) || 0,
            hb_upgrade_sar: parseFloat(hb_upgrade_sar) || 0,
            fb_upgrade_sar: parseFloat(fb_upgrade_sar) || 0,
            start_date: startDate,
            end_date: endDate,
            unique_key
            });

            // Save to database
            await roomPriceRepository.save(roomPrice);

            // Redirect back to pricing list or show success message
            return res.redirect("/portal/pricing?success=Price created successfully");
            
            // OR if using JSON response:
            // return res.status(201).json({
            //   success: true,
            //   message: "Room price created successfully",
            //   data: roomPrice,
            // });

        } catch (error: any) {
            console.error("Error creating room price:", error);
            
            // Handle unique constraint violation
            if (error.code === "23505") { // PostgreSQL unique violation code
            return res.status(409).json({
                success: false,
                message: "A pricing entry with these details already exists",
            });
            }

            return res.status(500).json({
            success: false,
            message: "Internal server error while creating room price",
            error: error.message,
            });
        }
    };

    static createRoomPriceV2 = async (req: Request, res: Response) => {
        try {

            const {
                hotel_id,
                room_id,
                season_code,
                start_date,
                end_date,
                weekday_price,
                weekend_price,
                unique_key,
                minimum_stay
            } = req.body;

            console.log("hotel id ;;;", hotel_id);
            console.log("room option id ;;;;;", room_id);
            console.log("season code ;;;;;", season_code);
            console.log("end date ;;;;;", end_date);
            console.log("start date ;;;;;;", start_date);
            console.log("weekday ;;;;;;;", weekday_price);
            console.log("weekend ;;;;", weekend_price);
            console.log("minimum stay ;;;;", minimum_stay)
            // Validation
            if (
                !hotel_id ||
                !room_id ||
                !start_date ||
                !end_date ||
                weekday_price === undefined ||
                weekend_price === undefined
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please fill all required fields."
                });
            }

            const startDate = new Date(start_date);
            const endDate = new Date(end_date);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date."
                });
            }

            if (startDate >= endDate) {
                return res.status(400).json({
                    success: false,
                    message: "End date must be after start date."
                });
            }

            const repo = AppDataSource.getRepository(RoomPriceV2);

            // Duplicate check
            const existing = await repo.findOne({
                where: {
                    room_option_id:room_id,
                    start_date: startDate,
                    end_date: endDate
                }
            });

            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: "Pricing already exists for this room and season."
                });
            }


            const pricing = repo.create({
                room_option_id:room_id,
                season_code: season_code || null,
                start_date: startDate,
                end_date: endDate,
                weekday_price: Number(weekday_price),
                weekend_price: Number(weekend_price),
                minimum_stay: minimum_stay ? parseInt(minimum_stay, 10) : 1,
                unique_key
            });

            await repo.save(pricing);

            // return res.redirect("/portal/pricing-v2?success=Pricing created successfully");
            return res.redirect("/portal/pricing?success=Price created successfully");

        } catch (error: any) {

            console.error(error);

            if (error.code === "23505") {
                return res.status(409).json({
                    success: false,
                    message: "Pricing already exists."
                });
            }

            return res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    };

    static getPricingList = async (req: Request, res: Response) => {
        try {
            const roomPriceRepository = AppDataSource.getRepository(RoomPrice);

            // Fetch all pricing with relations
            const prices = await roomPriceRepository.find({
                where: {
                    hotel_id: 'TPH',
                },
                order: {
                    created_at: "DESC",
                },
            });

            // console.log("prices value ;;;;;", prices)

            // return res.send(prices);
            // Check for success message from redirect
            const success = req.query.success as string;

            res.render("pricing/list", {
            prices,
            success: success || null,
            });
        } catch (error) {
            console.error("Error fetching pricing list:", error);
            res.status(500).render("pricing/list", {
            rooms: [],
            error: "Failed to load pricing data",
            });
        }
    };

    static getPricingListV2 = async (req: Request, res: Response) => {
        try {

            const prices = await AppDataSource
                .getRepository(RoomPriceV2)
                .createQueryBuilder("pricing")
                .leftJoin(Room, "room", "room.room_name_id = pricing.room_option_id")
                .select([
                    "pricing.*",
                    "room.name AS room_option_name"
                ])
                .orderBy("pricing.created_at", "DESC")
                .getRawMany();

            const success = req.query.success as string;

            // return res.send(prices);

            return res.render("pricing-v2/list", {
                prices,
                success: success || null,
            });

        } catch (error) {
            console.error("Error fetching pricing list:", error);

            return res.status(500).render("pricing-v2/list", {
                prices: [],
                success: null,
                error: "Failed to load pricing data",
            });
        }
    };

    static editPricingList = async (req: Request, res: Response) =>{
        try {
            let pricing_id = req.params.id;

              const hotels =  await AppDataSource.getRepository(Hotel).find({
                                select: ["name_id", "name"],
                            });
            // const rooms_option =  await AppDataSource.getRepository(RoomOccupancy).find({
            // select: ["room_option_id", "occupancy"],
            // });

            // const rooms_option = await AppDataSource
            //                         .getRepository(RoomOccupancy)
            //                         .createQueryBuilder("occ")
            //                         .leftJoin("occ.room", "room")
            //                         .leftJoin("room.room_type", "room_type")
            //                         .select([
            //                             "occ.room_option_id",
            //                             "occ.occupancy",
            //                             "room_type.name"
            //                         ])
            //                         .getRawMany();
         

            const season_code =  await AppDataSource.getRepository(SeasonCode).find({
                            select: ["season_code_id",],
                        });

            const pricing = await AppDataSource.getRepository(RoomPrice).findOne({
                where:{id: parseInt(pricing_id)}
            });

            let pricing_hotel_id = pricing?.hotel_id;
            // console.log("pricing id ;;;;;", pricing?.hotel_id);

            const rooms_option = await AppDataSource
                        .getRepository(RoomOccupancy)
                        .createQueryBuilder("occ")
                        .leftJoin("occ.room", "room")
                        .leftJoin("room.hotel", "hotel")
                        .leftJoin("room.room_type", "room_type")
                        .select([
                            "occ.room_option_id AS room_option_id",
                            "occ.occupancy AS occupancy",
                            "room_type.name AS room_type_name"
                        ])
                        .where("hotel.name_id = :hotel_id", { hotel_id: pricing_hotel_id })
                        .getRawMany();

            // return res.send(rooms_option);

            return res.render("pricing/edit",{
                pricing_id,
                hotels,
                rooms_option,
                season_code,
                pricing,
            })
        } catch (error: any) {
            console.log("error in edit pricing list ;;;", error);
            return res.status(500).json({error:error.message || "Internal Server Error"});
        }
    }

    static editPricingV2 = async (req: Request, res: Response) => {
        try {
            const pricing_id = Number(req.params.id);
            const price = await AppDataSource
                .getRepository(RoomPriceV2)
                .findOne({
                    where: { id: pricing_id }
                });

            if (!price) {
                return res.status(404).send("Pricing not found");
            }

            const rooms_option = await AppDataSource
                .getRepository(Room)
                .find({
                    where: { hotel: { id: 32 }, id: Not(In([66, 49])) },
                    select: {
                        room_name_id: true,
                        name: true
                    },
                    order: {
                        name: "ASC"
                    }
                });

            const season_code = await AppDataSource
                .getRepository(SeasonCode)
                .find({
                    select: {
                        season_code_id: true
                    },
                    order: {
                        season_code_id: "ASC"
                    }
                });

            return res.render("pricing-v2/edit", {
                price,
                rooms_option,
                season_code ,
            });

        } catch (error: any) {

            console.error("Edit Pricing V2:", error);

            return res.status(500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    };

    static updateRoomPrice = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;

            const {
            hotel_id,
            room_id,            // from form: this is actually room_option_id
            season_code_id,     // from form: this is season_code
            day_type,
            cost_sar,
            hb_cost_sar,
            fb_cost_sar,
            bb_upgrade_sar,
            hb_upgrade_sar,
            fb_upgrade_sar,
            start_date,
            end_date,
            unique_key,
            selling_price_usd
            } = req.body;

            const roomPriceRepo = AppDataSource.getRepository(RoomPrice);

            // Check existing record
            const roomPrice = await roomPriceRepo.findOne({ where: { id: Number(id) } });

            if (!roomPrice) {
            return res.status(404).send("Room price not found");
            }

            // Update fields from form
            roomPrice.hotel_id = hotel_id;
            roomPrice.room_option_id = room_id;
            roomPrice.season_code = season_code_id;
            roomPrice.day_type = day_type;

            roomPrice.cost_sar = Number(cost_sar);
            roomPrice.hb_cost_sar = Number(hb_cost_sar);
            roomPrice.fb_cost_sar = Number(fb_cost_sar);

            roomPrice.bb_upgrade_sar = Number(bb_upgrade_sar);
            roomPrice.hb_upgrade_sar = Number(hb_upgrade_sar);
            roomPrice.fb_upgrade_sar = Number(fb_upgrade_sar);
            roomPrice.selling_price_usd = Number(selling_price_usd);

            roomPrice.start_date = start_date;
            roomPrice.end_date = end_date;

            roomPrice.unique_key = unique_key;

            await roomPriceRepo.save(roomPrice);

            return res.redirect(`/portal/pricing/${id}/edit`);
        } catch (err: any) {
            console.error("❌ Error updating room price:", err);
            return res.status(500).json({error:err.message || "Internal Server Error"});
        }
    };

    static updateRoomPriceV2 = async (req: Request, res: Response) => {
        try {

            const id = Number(req.params.id);

            const {
                room_id,
                season_code,
                start_date,
                end_date,
                weekday_price,
                weekend_price,
                minimum_stay,
                unique_key
            } = req.body;

            const repo = AppDataSource.getRepository(RoomPriceV2);

            const price = await repo.findOne({
                where: { id }
            });

            if (!price) {
                return res.status(404).send("Pricing not found");
            }

            

            // Validation
            if (
                !room_id ||
                !start_date ||
                !end_date ||
                weekday_price === undefined ||
                weekend_price === undefined ||
                minimum_stay === undefined
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please fill all required fields."
                });
            }

            const startDate = new Date(start_date);
            const endDate = new Date(end_date);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid dates."
                });
            }

            if (startDate >= endDate) {
                return res.status(400).json({
                    success: false,
                    message: "End date must be after start date."
                });
            }

            // Duplicate check (ignore current record)
            const existing = await repo
                .createQueryBuilder("price")
                .where("price.room_option_id = :room_option_id", { room_option_id: room_id })
                .andWhere("price.start_date = :start_date", { start_date })
                .andWhere("price.end_date = :end_date", { end_date })
                .andWhere(
                    season_code
                        ? "price.season_code = :season_code"
                        : "price.season_code IS NULL",
                    season_code ? { season_code } : {}
                )
                .andWhere("price.id != :id", { id })
                .getOne();

            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: "Pricing already exists for this room and season."
                });
            }

            // Update
            price.room_option_id = room_id;
            price.season_code = season_code || null;
            price.start_date = startDate;
            price.end_date = endDate;
            price.weekday_price = Number(weekday_price);
            price.weekend_price = Number(weekend_price);
            price.minimum_stay = parseInt(minimum_stay, 10) || 1
            price.unique_key = unique_key;

            await repo.save(price);

            return res.redirect(
                `/portal/pricing-v2/${id}/edit?success=Pricing updated successfully`
            );

        } catch (error: any) {

            console.error("Update Pricing V2:", error);

            return res.status(500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    };

    static getRoomOptionsByHotel = async (req: Request, res: Response) => {
        try {
            const { hotel_id } = req.params;

            console.log("hotel id coming ;;;;;;;", hotel_id);
           
            const data = await AppDataSource
                            .getRepository(RoomOccupancy)
                            .createQueryBuilder("occ")
                            .leftJoin("occ.room", "room")
                            .leftJoin("room.hotel", "hotel")
                            .leftJoin("room.room_type", "room_type")
                            .select([
                                "occ.room_option_id AS room_option_id",
                                "occ.occupancy AS occupancy",
                                "room_type.name AS room_type_name"
                            ])
                            .where("hotel.name_id = :hotel_id", { hotel_id })
                            .getRawMany();


            res.json({ success: true, data });
        } catch (err: any) {
            console.log("Error fetching room options:", err);
            res.status(500).json({ success: false, message: err.message || "Server Error" });
        }
    };

    static getSeasonDetails = async (req: Request, res: Response) => {
        try {
            const { season_code_id } = req.body;

            const seasonRepo = AppDataSource.getRepository(SeasonCode);
            const season = await seasonRepo.findOne({
                where: { season_code_id }
            });

            if (!season) {
                return res.json({ success: false, message: "Season not found" });
            }

            return res.json({
                success: true,
                data: {
                    start_date: season.start_date,
                    end_date: season.end_date
                }
            });

        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    };


    static deleteAllPrices = async (req: Request, res: Response) => {
        try {
            await AppDataSource.query(`TRUNCATE TABLE room_prices RESTART IDENTITY CASCADE`);

            return res.json({
            success: true,
            message: "All room prices deleted successfully."
            });

        } catch (err: any) {
            console.error(err);

            return res.status(500).json({
            success: false,
            message: "Error deleting room prices",
            error: err.message
            });
        }
    };

    static getCurrencyRates = async (req: Request, res: Response) => {
        try {
        const currencyRateRepo = AppDataSource.getRepository(CurrencyExchangeRate);
        
        const rates = await currencyRateRepo.find({
            order: {
            id: "ASC"
            }
        });

        return res.render("pricing/currency-rates", {
            rates,
            editMode: false
        });
        } catch (error: any) {
        console.error("Error fetching currency rates:", error);
        return res.status(500).json({error:error.message || "Internal Server Error"});
        }
    };

    static updateCurrencyRates = async (req: Request, res: Response) => {
        try {
            const { rates } = req.body;

            console.log("rates coming ;;;;;;;", req.body);
            
            if (!rates || !Array.isArray(rates)) {
                return res.status(400).send("Invalid data format");
            }

            const currencyRateRepo = AppDataSource.getRepository(CurrencyExchangeRate);

            // Update each rate
            for (const rate of rates) {
                if (rate.id) {
                // Update existing record
                await currencyRateRepo.update(rate.id, {
                    from_currency: rate.from_currency,
                    to_currency: rate.to_currency,
                    market_rate: parseFloat(rate.market_rate),
                    umrahspot_rate: parseFloat(rate.umrahspot_rate)
                });
                } else {
                // Create new record
                const newRate = currencyRateRepo.create({
                    from_currency: rate.from_currency,
                    to_currency: rate.to_currency,
                    market_rate: parseFloat(rate.market_rate),
                    umrahspot_rate: parseFloat(rate.umrahspot_rate)
                });
                await currencyRateRepo.save(newRate);
                }
            }

            return res.redirect("/portal/currency-rates");
        } catch (error: any) {
        console.error("Error updating currency rates:", error);
        return res.status(500).json({error:error.message || "Internal Server Error"});
        }
    };

    static deleteCurrencyRate = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            const currencyRateRepo = AppDataSource.getRepository(CurrencyExchangeRate);
            await currencyRateRepo.delete(id);

            return res.redirect("/portal/currency-rates");
        } catch (error: any) {
            console.error("Error deleting currency rate:", error);
            return res.status(500).json({error: error.message || "Internal Server Error"});
        }
    };

    // static getHotelMarkupRates = async (req: Request, res: Response) => {
    //     try {
    //     const repo = AppDataSource.getRepository(HotelMarkupRate);

    //     const rates = await repo.find({
    //         relations: {
    //         hotel: true,
    //         },
    //         order: {
    //         id: "ASC",
    //         },
    //     });

    //     console.log("getting rates ;;;;;;", rates);

    //     res.render("pricing/hotel-markup-rates", {
    //         rates,
    //     });
    //     } catch (err) {
    //     console.error(err);
    //     res.status(500).send("Something went wrong");
    //     }
    // };

    static getHotelMarkupRates = async (req: Request, res: Response) => {
        try {
            const hotelRepo = AppDataSource.getRepository(Hotel);
            const rateRepo = AppDataSource.getRepository(HotelMarkupRate);

            const hotels = await hotelRepo.find({
            order: { id: "ASC" },
            });

            const rates = await rateRepo.find({
            relations: { hotel: true },
            });

            // Map rates by hotelId for quick lookup
            const rateMap = new Map<number, HotelMarkupRate>();
            rates.forEach(rate => {
            rateMap.set(rate.hotel.id, rate);
            });

            // Merge hotels with rates (default = 0)
            const data = hotels.map(hotel => {
            const rate = rateMap.get(hotel.id);

            return {
                hotel,
                id: rate?.id || null,
                fee_buffer_rate: rate?.fee_buffer_rate ?? 0,
                profit_margin_rate: rate?.profit_margin_rate ?? 0,
                total_markup_rate: rate?.total_markup_rate ?? 0,
            };
            });

            res.render("pricing/hotel-markup-rates", {
            rates: data,
            });

        } catch (err) {
            console.error(err);
            res.status(500).send("Something went wrong");
        }
    };
  
//     static updateHotelMarkupRates = async (req: Request, res: Response) => {
//     try {
//       const { rates } = req.body;

//       if (!rates || !Array.isArray(rates)) {
//         return res.status(400).send("Invalid data format");
//       }

//       const repo = AppDataSource.getRepository(HotelMarkupRate);

//       for (const rate of rates) {
//         await repo.update(rate.id, {
//           fee_buffer_rate: Number(rate.fee_buffer_rate),
//           profit_margin_rate: Number(rate.profit_margin_rate),
//           total_markup_rate: Number(rate.total_markup_rate),
//         });
//       }

//       res.redirect("/portal/currency/hotel-markup-rates");
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Update failed");
//     }
//   };

    static updateHotelMarkupRates = async (req: Request, res: Response) => {
        try {
            const { rates } = req.body;

            if (!rates || !Array.isArray(rates)) {
            return res.status(400).send("Invalid data format");
            }

            const repo = AppDataSource.getRepository(HotelMarkupRate);

            for (const rate of rates) {
            const payload = {
                fee_buffer_rate: Number(rate.fee_buffer_rate) || 0,
                profit_margin_rate: Number(rate.profit_margin_rate) || 0,
                total_markup_rate: Number(rate.total_markup_rate) || 0,
            };

            if (rate.id) {
                // ✅ UPDATE existing record
                await repo.update(rate.id, payload);
            } else {
                // ✅ INSERT new record
                const newRate = repo.create({
                ...payload,
                hotel: { id: Number(rate.hotel_id) }, // IMPORTANT
                });

                await repo.save(newRate);
            }
            }

            res.redirect("/portal/currency/hotel-markup-rates");
        } catch (err: any) {
            console.error(err);
            res.status(500).json({error:err.message || "Update failed"});
        }
    };

    static list_bookings_tajpark = async (req: Request, res: Response) => {
        try {
            const bookingRepo = AppDataSource.getRepository(BookingTajpark);

            const page = parseInt(req.query.page as string) || 1;
            const limit = 20;
            const skip = (page - 1) * limit;

            const [bookings, total] = await bookingRepo.findAndCount({
            order: { created_at: "DESC" },
            skip,
            take: limit,
            });

            // return res.send(bookings);

            return res.render("bookings/list-new", {
                bookings,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                total,
            });
        } catch (error: any) {
            console.log("error in list_bookings_tajpark ;;;;;", error);
            return res.status(500).send("Server Error while fetching bookings");
        }
        };

    static get_booking_detail_tajpark = async (req: Request, res: Response) => {
        try {
            const bookingRepo = AppDataSource.getRepository(BookingTajpark);

        
            const id = parseInt(req.params.id);

            if (!id) {
            return res.status(400).send("Invalid booking ID");
            }

            const booking = await bookingRepo.findOne({ where: { id } });

            

            if (!booking) {
            return res.status(404).send("Booking not found");
            }

            return res.render("bookings/detail", { booking });
        } catch (error: any) {
            console.log("error in get_booking_detail_tajpark ;;;;;", error);
            return res.status(500).send("Server Error while fetching booking detail");
        }
    };

    static delete_booking_tajpark = async (req: Request, res: Response) => {
        try {
            const bookingRepo = AppDataSource.getRepository(BookingTajpark);
            const id = parseInt(req.params.id);

            if (!id) {
            return res.status(400).json({ success: false, message: "Invalid booking ID" });
            }

            const booking = await bookingRepo.findOne({ where: { id } });
            if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
            }

            await bookingRepo.remove(booking);

            return res.json({ success: true, message: "Booking deleted successfully" });
        } catch (error: any) {
            console.log("error in delete_booking_tajpark ;;;;;", error);
            return res.status(500).json({ success: false, message: error.message || "Server Error while deleting booking" });
        }
        };

    static deleteRoomPriceV2 = async(req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const repo = AppDataSource.getRepository(RoomPriceV2);

            // 1. Find the record by ID
            const price = await repo.findOne({
                where: { id }
            });

            console.log("Record to delete:", price);

            // 2. If it doesn't exist, return a 404
            if (!price) {
                return res.status(404).send("Pricing not found");
            }

            // 3. Delete the record from the database
            await repo.remove(price); 
            // Note: You can also use `await repo.delete(id);` to skip the findOne step if you don't need the 404 check.

            // 4. Redirect to the main listing page (Adjust this URL to match your routes)
            return res.status(200).json({
                success: true,
                message: "Record deleted successfully"
            });
        } catch (error: any) {
            console.error("Delete Pricing V2 Error:", error);

            return res.status(500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

}