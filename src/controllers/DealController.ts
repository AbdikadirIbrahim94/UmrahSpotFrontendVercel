import { Request, Response } from "express";
import { Hotel } from "../entities/Hotel";
import { AppDataSource } from "../db/data-source";
import { Room } from "../entities/Room";
import { RoomOccupancy } from "../entities/RoomOccupancy";
import { Deal } from "../entities/Deal";
import { City } from "../entities/City";
import { RoomPrice } from "../entities/RoomPrice";

export class DealController {
    static addDeal = async (req: Request, res: Response) => {
        try {
            const hotels = await AppDataSource.getRepository(Hotel).find({
                order: { name: "ASC" },
                });
             const cities = await AppDataSource.getRepository(City).find({ order: { name: "ASC" } });
            res.render("deal/add_deal", { hotels, cities });
        } catch (error: any) {
            console.log("error in add deal ;;", error);
            return res.status(500).json({error: error.message || "Server Error"});
        }
    }

    static dealEditpage = async (req: Request, res: Response) =>{
        try {
            const deal_id = req.params.id;

            if(!deal_id){
                return res.status(500).json({error:  "Deal Id is missing"});
            }
             const hotels = await AppDataSource.getRepository(Hotel).find({
                where:{id: 32},
                order: { name: "ASC" },
                });

                  const dealRepo = AppDataSource.getRepository(Deal);
             // Fetch deal with all required details
                const deal = await dealRepo
                    .createQueryBuilder("deal")
                    .leftJoinAndSelect(Hotel, "hotel", "hotel.id = deal.hotel_id")
                    .leftJoinAndSelect(Room, "room", "room.id = deal.room_id")
                    // .leftJoinAndSelect(City, "city", "city.id = hotel.city_id")
                    .leftJoinAndSelect(
                        RoomOccupancy,
                        "occ",
                        "occ.id = deal.room_occupancy_id"
                    )
                    .where("deal.id = :id", { id: deal_id })
                    .getRawOne();

                    // console.log("checking deal infor ;;;;;", deal);
                       // Rooms based on hotel_id
                const rooms = await AppDataSource.getRepository(Room).find({
                    where: { hotel_id: deal.deal_hotel_id },
                    order: { name: "ASC" },
                });

                // Occupancies based on room_id
                const roomOptions = await AppDataSource.getRepository(RoomOccupancy).find({
                    where: { room_id: deal.deal_room_id },
                    order: { occupancy: "ASC" },
                });

                 const cities = await AppDataSource.getRepository(City).find({ order: { name: "ASC" } });

                // Format dates for input type="date"
                const formattedDeal = {
                    ...deal,
                    deal_start_date: deal.deal_start_date?.toISOString().split("T")[0],
                    deal_end_date: deal.deal_end_date?.toISOString().split("T")[0],
                };

                // return res.send(formattedDeal);

            res.render("deal/edit_deal", { hotels,   deal: formattedDeal, rooms, roomOptions, cities });
        } catch (error: any) {
            console.log("error in deal edit page ;;", error);
            return res.status(500).json({error: error.message || "Server Error"});
        }
    }

    static getroomdataByHotelId = async (req: Request, res: Response) => {
        try {
            const hotelId = req.params.id;
            const rooms = await AppDataSource.getRepository(Hotel)
                .createQueryBuilder("hotel")
                .leftJoinAndSelect("hotel.rooms", "room")
                .where("hotel.id = :hotelId", { hotelId })
                .getOne();

            return res.status(200).json({success: true, rooms: rooms?.rooms || []});
        } catch (error: any) {
            console.log("error in get room data by hotel ;;", error);
            return res.status(500).json({error: error.message || "Server Error"});
        }
    }

    static gethoteldataByCityId = async (req: Request, res: Response) => {
        try {
            const cityId = req.params.id;
            const hotels = await AppDataSource.getRepository(Hotel)
                .createQueryBuilder("hotels")
                .where("hotels.city_id = :cityId", { cityId })
                .getMany();

                console.log("hotels coming ;;;;;;;;;", hotels);
            
            return res.status(200).json({success: true, hotels: hotels || []});
        } catch (error: any) {
            console.log("error in get room data by hotel ;;", error);
            return res.status(500).json({error: error.message || "Server Error"});
        }
    }

    static getroomoptiondataByRoomId = async (req: Request, res: Response) => {
        try {
            const roomId = req.params.id;

            const roomOptions = await AppDataSource.getRepository(RoomOccupancy)
            .createQueryBuilder("room_option")
            .where("room_option.room_id = :roomId", { roomId })
            .orderBy("room_option.id", "ASC")
            .getMany();   // ✅ return all matched rows

            return res.status(200).json({
            success: true,
            roomOptions
            });
        } catch (error: any) {
            console.log("error in get room option data by room ;;", error);
            return res.status(500).json({ error: error.message || "Server Error" });
        }
    };

    static createDeal = async (req: Request, res: Response) => {
        try {
            const {
            title,
            hotel_id,
            room_id,
            room_option_id,  // this is room_occupancy_id
            description,
            actual_price,
            deal_price,
            status,
            start_date,
            end_date,
            rooms_left
            } = req.body;

            // Validate required fields
            if (!title || !hotel_id || !room_id || !room_option_id) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields.",
            });
            }

            const dealRepo = AppDataSource.getRepository(Deal);

            const newDeal = dealRepo.create({
                title,
                hotel_id: Number(hotel_id),
                room_id: Number(room_id),
                room_occupancy_id: Number(room_option_id),
                description,
                actual_price: Number(actual_price) || 0,
                deal_price: Number(deal_price) || 0,
                status,
                start_date,
                end_date,
                rooms_left
            });

            await dealRepo.save(newDeal);

            // return res.status(201).json({
            //     success: true,
            //     message: "Deal created successfully",
            //     deal: newDeal
            // });
            return res.redirect("/portal/deal/list")

        } catch (error) {
            console.log("Error creating deal:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error",
                error: error instanceof Error ? error.message : error,
            });
        }
    };

    static showDealsPage = async (req: Request, res: Response) => {
        try {
            const deals = await AppDataSource.getRepository(Deal).find({
                order: { created_at: "DESC" },
            });
            res.render("deal/deals_list", { deals });
        } catch (error: any) {
            console.log("error in show deals page ;;", error);
            return res.status(500).json({error: error.message || "Server Error"});
        }
    }

    static getroomprice = async (req: Request, res: Response) => {
        try {
            const occupancy_id = req.params.id;

            if (!occupancy_id) {
            return res.status(400).json({
                success: false,
                message: "occupancy id is required"
            });
            }

            const occupancyRepo = AppDataSource.getRepository(RoomOccupancy);
            const priceRepo = AppDataSource.getRepository(RoomPrice);

            // 1️⃣ Find occupancy by ID
            const occupancy = await occupancyRepo.findOne({
            where: { id: Number(occupancy_id) }
            });

            if (!occupancy) {
            return res.status(404).json({
                success: false,
                message: "Room occupancy not found"
            });
            }

            // 2️⃣ Get room_option_id from occupancy
            const optionId = occupancy.room_option_id;

            if (!optionId) {
            return res.status(404).json({
                success: false,
                message: "room_option_id is missing in occupancy record"
            });
            }

            // 3️⃣ Find the MINIMUM selling price for this room_option_id
            const minPrice = await priceRepo
            .createQueryBuilder("rp")
            .where("rp.room_option_id = :opt", { opt: optionId })
            .orderBy("rp.selling_price_usd", "ASC")
            .limit(1)
            .getOne();

            if (!minPrice) {
            return res.status(404).json({
                success: false,
                message: "No pricing found for this occupancy"
            });
            }

            return res.status(200).json({
            success: true,
            room_price: minPrice.selling_price_usd,
            occupancy: occupancy,
            pricing_record: minPrice
            });

        } catch (error: any) {
            console.log("error in get room price ;;", error);
            return res.status(500).json({ 
            error: error.message || "Server Error" 
            });
        }
    };


    static getdealList = async (req: Request, res: Response) => {
        try {
            const dealRepo = AppDataSource.getRepository(Deal);

            const selectedCity = req.query.city ? Number(req.query.city) : null;

            let query = dealRepo
                .createQueryBuilder("deal")
                .leftJoin("hotels", "hotel", "hotel.id = deal.hotel_id")
                .leftJoin("rooms", "room", "room.id = deal.room_id")
                .leftJoin("room_occupancies", "occ", "occ.id = deal.room_occupancy_id")
                .select([
                    "deal.id",
                    "deal.title",
                    "deal.deal_price",
                    "deal.actual_price",
                    "deal.start_date",
                    "deal.end_date",
                    "deal.status",
                    "deal.rooms_left",

                    "hotel.id AS hotel_id",
                    "hotel.name AS hotel_name",

                    "room.id AS room_id",
                    "room.name AS room_name",

                    "occ.id AS occupancy_id",
                    "occ.occupancy AS occupancy_name",
                ])
                .orderBy("deal.id", "DESC")
                // .getRawMany();

              // ⭐ Apply filter if city selected
            if (selectedCity) {
                query = query.where("hotel.city_id = :cityId", { cityId: selectedCity });
            }

              const deals = await query.getRawMany();

            const formattedDeals = deals.map(d => ({
                                            ...d,
                                            deal_start_date: new Date(d.deal_start_date).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }),
                                            deal_end_date: new Date(d.deal_end_date).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }),
                                        }));

            const cityRepo = AppDataSource.getRepository(City);

             // ⭐ Fetch all cities ordered by name
            const cities = await cityRepo.find({
                                order: { name: "ASC" }
                            });

            return res.render("deal/deals_list", { deals: formattedDeals, cities, selectedCity, });

        } catch (error: any) {
            console.log("error in get deal list ;;", error);
            return res.status(500).json({ error: error.message || "Server Error" });
        }
    };

    static updateDeal = async (req: Request, res: Response) => {
        try {
            let lead_id = req.params.id;
            let id = parseInt(lead_id);
            const {
                title,
                hotel_id,
                room_id,
                room_option_id,
                description,
                actual_price,
                deal_price,
                start_date,
                end_date,
                status,
                rooms_left
            } = req.body;

            console.log("req data ;;;;;", req.body);

            const dealRepo = AppDataSource.getRepository(Deal);

            const deal = await dealRepo.findOne({ where: { id } });

            if (!deal) {
                return res.status(404).json({ error: "Deal not found" });
            }

            deal.title = title;
            deal.hotel_id = hotel_id;
            deal.room_id = room_id;
            deal.room_occupancy_id = room_option_id;
            deal.description = description;
            deal.actual_price = actual_price;
            deal.deal_price = deal_price;
            deal.start_date = start_date;
            deal.end_date = end_date;
            deal.status = status;
            deal.rooms_left = rooms_left;

            await dealRepo.save(deal);

            return res.redirect(`/portal/deal/${id}/edit`);

        } catch (err: any) {
            console.log("update deal error:", err);
            return res.status(500).json({ error: err.message });
        }
    };

    static deleteDeal = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;

            if (!id) {
                return res.status(400).json({
                    status: "error",
                    message: "Deal ID is missing"
                });
            }

            const dealRepo = AppDataSource.getRepository(Deal);

            const exist = await dealRepo.findOne({ where: { id: Number(id) } });

            if (!exist) {
                return res.status(404).json({
                    status: "error",
                    message: "Deal not found"
                });
            }

            // Safe delete
            await dealRepo.remove(exist);

            return res.status(200).json({
                status: "success",
                message: "Deal deleted successfully"
            });

        } catch (error: any) {
            console.log("Delete deal error:", error);
            return res.status(500).json({
                status: "error",
                message: error.message || "Server error"
            });
        }
    }



}