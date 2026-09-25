import { Request, Response } from 'express';
import { join } from 'path';
import { parse } from "fast-csv";
import { once } from 'events';
import fs from 'fs';
import { AppDataSource, initializeDataSource } from "../db/data-source";
import { Hotel } from '../entities/Hotel';
import { City } from '../entities/City';
import { RoomType } from '../entities/RoomType';
import { Room } from '../entities/Room';
import { RoomOccupancy } from '../entities/RoomOccupancy';
import { SeasonCode } from '../entities/SeasonCode';
import { csv_path } from '../utils/utils';
import { RoomPrice } from '../entities/RoomPrice';
import multer from 'multer';
import { Column } from 'typeorm';
import { CurrencyExchangeRate } from '../entities/CurrencyExchangeRate';
import { HotelMarkupRate } from '../entities/HotelMarkupRate';



class PostgresExportController {
    static hotel_csv_post = async (req: Request, res: Response) => {
        try {
        const csvFilePath = join(
            process.cwd(),
            "public",
            "csv",
            "hotel_sheet.csv"
        );

        const hotelRepo = AppDataSource.getRepository(Hotel);
        const cityRepo = AppDataSource.getRepository(City);

        const parser = parse({ headers: true, ignoreEmpty: true });

        parser.on("data", async (row) => {
            console.log("Row:", row.hotel_name);

            // -----------------------------------------
            // 1️⃣ Create amenities array
            // -----------------------------------------
            const amenities = Object.entries(row)
            .filter(([key, value]) => key.startsWith("amenity_") && value === "Yes")
            .map(([key]) => ({
                value: key.replace("amenity_", "").replace(/_/g, " "),
                thumbnail: ""
            }));

            // -----------------------------------------
            // 2️⃣ Create services array (you may update this)
            // Example logic: treat wifi, parking, breakfast, etc as services
            // -----------------------------------------
            const serviceKeys = [
            "wifi",
            "shuttle_to_haram",
            "wheelchair_friendly",
            "breakfast_included",
            "parking",
            "family_room",
            "haram_view_available",
            "kaaba_view_available",
            "haram_speakers"
            ];

            const services = serviceKeys
            .filter((key) => row[key] === "Yes")
            .map((key) => ({
                value: key.replace(/_/g, " "),
                thumbnail: ""
            }));

            // -----------------------------------------
            // 3️⃣ Nearby places
            // -----------------------------------------
            const nearby_places = [
            {
                place: "Money Exchange",
                map_url: row.money_exchange_maps_url,
                distance: row.money_exchange_distance || "N/A",
                thumbnail: ""
            },
            {
                place: "Pharmacy",
                map_url: row.pharmacy_maps_url,
                distance: row.pharmacy_distance || "N/A",
                thumbnail: ""
            },
            {
                place: "Restaurant",
                map_url: row.restaurants_maps_url,
                distance: row.restaurants_distance || "N/A",
                thumbnail: ""
            },
            {
                place: "Supermarket",
                map_url: row.supermarket_maps_url,
                distance: row.supermarket_distance || "N/A",
                thumbnail: ""
            }
            ];

            // -----------------------------------------
            // 4️⃣ Resolve city
            // -----------------------------------------
            let city = await cityRepo.findOne({ where: { name: row.city } });
            if (!city) {
            city = cityRepo.create({ name: row.city });
            await cityRepo.save(city);
            }

            // -----------------------------------------
            // 5️⃣ Create hotel entity
            // -----------------------------------------
            const hotel = hotelRepo.create({
            name_id: row.hotel_id,
            name: row.hotel_name,
            address: row.Address,
            city_id: city.id,
            distance_haram_mitres: parseInt(row.distance_haram_meters || "0", 10),
            distance_haram_minutes: parseInt(row.distance_haram_minutes || "0", 10),
            description: row.description_text,
            location_map_url: row.google_maps_url,
            child_policy: row.child_policy,
            cancellation_policy: row.cancellation_policy,
            youtube_video_url: row.youtube_video_url,
            check_in_from: row.checkin_from,
            check_out_until: row.checkout_until,
            google_comments_url: row.google_comments_url,

            // JSON fields
            amenities,
            services,
            nearby_places
            });

            await hotelRepo.save(hotel);
        });

        const endPromise = once(parser, "end");

        fs.createReadStream(csvFilePath).pipe(parser);

        await endPromise;

        res.send("Hotels imported successfully.");
        } catch (error: any) {
        console.error("CSV import error:", error);
        return res.status(500).json({ error: error.message });
        }
    };

    static room_type_csv_post = async (req: Request, res: Response) => {
        try {
            const csvFilePath = join(process.cwd(), "public", "csv", "room_sheet.csv");

            const parser = parse({ headers: true, ignoreEmpty: true });

            const baseTypes: Set<string> = new Set(); // store unique names

            parser.on("data", (row) => {
                const baseType = row.base_room_type?.trim().replace(/\s+/g, " ");

                if (baseType) {
                    baseTypes.add(baseType); // Set auto-removes duplicates
                }
            });

            const endPromise = once(parser, "end");
            fs.createReadStream(csvFilePath).pipe(parser);
            await endPromise;

            // Now insert safely one by one
            const roomTypeRepo = AppDataSource.getRepository(RoomType);

            for (const name of baseTypes) {
                const exists = await roomTypeRepo.findOne({ where: { name } });

                if (!exists) {
                    await roomTypeRepo.save({ name });
                    console.log("Inserted:", name);
                } else {
                    console.log("Skipped existing:", name);
                }
            }

            res.send("Room types imported successfully.");
        } catch (error: any) {
            console.log("Error:", error);
            return res.status(500).json({ error: error.message || "Internal server Error" });
        }
    };


    static room_csv_post = async (req: Request, res: Response) => {
        try {
            const csvFilePath = join(process.cwd(), "public", "csv", "room_sheet.csv");

            const parser = parse({ headers: true, ignoreEmpty: true });

            const hotelRepo = AppDataSource.getRepository(Hotel);
            const roomRepo = AppDataSource.getRepository(Room);
            const roomTypeRepo = AppDataSource.getRepository(RoomType);

            parser.on("data", async (row) => {
                try {
                    console.log("Room row:", row);

                    // =============== 1️⃣ Fetch Hotel ID =================
                    const hotelCode = row.hotel_id?.trim();     // e.g. "RAF"

                    const hotel = await hotelRepo.findOne({
                        where: { name_id: hotelCode }
                    });

                    if (!hotel) {
                        console.log("⚠ Hotel not found:", hotelCode);
                        return;
                    }

                    // =============== 2️⃣ Fetch RoomType ID ==============
                    const baseType = row.base_room_type?.trim();
                    const roomType = await roomTypeRepo.findOne({
                        where: { name: baseType }
                    });

                    if (!roomType) {
                        console.log("⚠ RoomType not found:", baseType);
                        return;
                    }

                    // =============== 3️⃣ Prevent Duplicate Room ==========
                    const existingRoom = await roomRepo.findOne({
                        where: { room_name_id: row.room_type_id }
                    });

                    if (existingRoom) {
                        console.log("⏭ Skipping existing room:", row.room_type_id);
                        return;
                    }

                    // =============== 4️⃣ Build View Array ================
                    const views: string[] = [];

                    if (row.has_haram_view?.toUpperCase() === "YES") {
                        views.push("Haram View");
                    }

                    if (row.has_kaaba_view?.toUpperCase() === "YES") {
                        views.push("Kaaba View");
                    }

                    // Always add main view field if exists
                    if (row.view) views.push(row.view);


                    // =============== 5️⃣ Create Room Record ==============
                    // const newRoom = roomRepo.create({
                    //     room_name_id: String(row.room_type_id),
                    //     hotel: hotel,  // Pass the hotel object, not hotel_id
                    //     name: row.room_display_name,
                    //     view_type: row.view,
                    //     view_from_room: views,
                    //     room_type: roomType,  // Pass the roomType object, not room_type_id
                    //     size_sqft: row.floor_area_sqm ? Number(row.floor_area_sqm) : null,

                    //     // defaults
                    //     base_price: 0,
                    //     price_per_night: 0,
                    //     refundable: true,
                    //     free_cancellation_hours: 48,
                    //     breakfast_included: false,
                    //     image_url: null,
                    //     description: null,
                    //     max_guests: null,
                    //     bed_type: null
                    // });



                    // await roomRepo.save(newRoom);

                    // console.log("✅ Room inserted:", newRoom.room_name_id);

                } catch (err) {
                    console.log("❌ Error inserting room:", err);
                }
            });

            const endPromise = once(parser, "end");
            fs.createReadStream(csvFilePath).pipe(parser);
            await endPromise;

            res.send("All Rooms Imported Successfully");

        } catch (error: any) {
            console.error("CSV import error:", error);
            return res.status(500).json({ error: error.message });
        }
    };

    static room_option_csv_post = async (req: Request, res: Response) => {
        try {
            const csvFilePath = join(
                process.cwd(),
                "public",
                "csv",
                "room_option_sheet.csv"
            );

            const parser = parse({ headers: true, ignoreEmpty: true });

            const roomRepo = AppDataSource.getRepository(Room);
            const occupancyRepo = AppDataSource.getRepository(RoomOccupancy);

            parser.on("data", async (row) => {
                try {
                    // console.log("Row:", row);

                    const roomOptionId = row.room_option_id?.trim();
                    const roomTypeId = row.room_type_id?.trim(); // to match Room.room_name_id

                    if (!roomOptionId || !roomTypeId) {
                        console.log("⚠ Missing room_option_id or room_type_id, skipping row.");
                        return;
                    }

                    // 1️⃣ Find the actual Room by room_name_id
                    const room = await roomRepo.findOne({
                        where: { room_name_id: roomTypeId }
                    });

                    if (!room) {
                        console.log(`❌ No matching Room found for room_type_id: ${roomTypeId}`);
                        return;
                    }

                    // 2️⃣ Prevent duplicate occupancy entry
                    const exists = await occupancyRepo.findOne({
                        where: { room_option_id: roomOptionId, room_id: room.id }
                    });

                    if (exists) {
                        console.log(`⏭ Skipping duplicate occupancy: ${roomOptionId}`);
                        return;
                    }

                    // 3️⃣ Create the occupancy entry
                    const newOcc = occupancyRepo.create({
                        room_id: room.id,
                        room_option_id: roomOptionId,
                        occupancy: row.display_occupancy_label?.trim(), // e.g., "Triple"
                        max_guests: Number(row.display_guest_count) || 0,
                        website_description: row.website_description?.trim() || null,
                        base_meal_plan: row.base_meal_plan_included?.trim() || null
                    });

                    await occupancyRepo.save(newOcc);
                    console.log(`✅ Inserted RoomOccupancy → ${roomOptionId}`);

                } catch (err) {
                    console.error("❌ Error saving occupancy row:", err);
                }
            });

            const endPromise = once(parser, "end");
            fs.createReadStream(csvFilePath).pipe(parser);
            await endPromise;

            res.send("Room Option Imported Successfully.");

        } catch (error: any) {
            console.error("CSV room option import error:", error);
            return res.status(500).json({ error: error.message });
        }
    };

    static season_option_csv_post = async (req: Request, res: Response) => {
        try {
            const csvFilePath = join(
                process.cwd(),
                "public",
                "csv",
                "season_sheet.csv"
            );

            const parser = parse({ headers: true, ignoreEmpty: true });

            const seasonRepo = AppDataSource.getRepository(SeasonCode);

            parser.on("data", async (row) => {
                try {
                    console.log("row season ;;", row);

                    const season_code_id = row.season_code?.trim();
                    const name = row.season_name?.trim();
                    const description = row.description?.trim();
                    const start_date = row.start_date;
                    const end_date = row.end_date;

                    if (!season_code_id) return; // skip invalid rows

                    // --- Check if the season already exists ---
                    let existingSeason = await seasonRepo.findOne({
                        where: { season_code_id },
                    });

                    if (existingSeason) {
                        // Update existing
                        existingSeason.name = name;
                        existingSeason.description = description;
                        existingSeason.start_date = start_date;
                        existingSeason.end_date = end_date;

                        await seasonRepo.save(existingSeason);
                    } else {
                        // Insert new
                        const newSeason = seasonRepo.create({
                            season_code_id,
                            name,
                            description,
                            start_date,
                            end_date,
                        });

                        await seasonRepo.save(newSeason);
                    }
                } catch (innerErr) {
                    console.error("Error processing row:", innerErr);
                }
            });

            const endPromise = once(parser, "end");
            fs.createReadStream(csvFilePath).pipe(parser);
            await endPromise;

            res.send("Season code imported successfully!");
        } catch (error: any) {
            console.log("error in season option ;;;", error);
            return res.status(500).json({ error: error.message });
        }
    };

    static pricing_csv_option_one = async (req: Request, res: Response) => {
        try {
            const csvFilePath = csv_path("pricing_sheet.csv");

            const parser = parse({ headers: true, ignoreEmpty: true });

            const priceRepo = AppDataSource.getRepository(RoomPrice);

            parser.on("data", async (row) => {
                console.log("row coming ;;;;", row);
                try {
                    const hotel_id = row.hotel_id?.trim();
                    const room_option_id = row.room_option_id?.trim();
                    const season_code = row.season_code?.trim();
                    const start_date = row.start_date;
                    const end_date = row.end_date;
                    const day_type = row.day_type?.trim();

                    const cost_sar = row.cost_sar ? Number(row.cost_sar) : 0;
                    const hb_cost_sar = row.hb_cost_sar ? Number(row.hb_cost_sar) : null;
                    const fb_cost_sar = row.fb_cost_sar ? Number(row.fb_cost_sar) : null;

                    const bb_upgrade_sar = row.bb_upgrade_sar ? Number(row.bb_upgrade_sar) : 0;
                    const hb_upgrade_sar = row.hb_upgrade_sar ? Number(row.hb_upgrade_sar) : 0;
                    const fb_upgrade_sar = row.fb_upgrade_sar ? Number(row.fb_upgrade_sar) : 0;

                    const unique_key = row.unique_key?.trim();

                    if (!hotel_id || !room_option_id || !season_code) return;

                    let existingRow = await priceRepo.findOne({
                        where: {
                            hotel_id,
                            room_option_id,
                            season_code,
                            start_date,
                            end_date,
                            day_type
                        }
                    });

                    if (existingRow) {
                        // Update existing
                        existingRow.cost_sar = cost_sar;
                        existingRow.hb_cost_sar = hb_cost_sar;
                        existingRow.fb_cost_sar = fb_cost_sar;
                        existingRow.bb_upgrade_sar = bb_upgrade_sar;
                        existingRow.hb_upgrade_sar = hb_upgrade_sar;
                        existingRow.fb_upgrade_sar = fb_upgrade_sar;
                        existingRow.unique_key = unique_key;

                        await priceRepo.save(existingRow);
                    } else {
                        // Insert new
                        const newPrice = priceRepo.create({
                            hotel_id,
                            room_option_id,
                            season_code,
                            start_date,
                            end_date,
                            day_type,
                            cost_sar,
                            hb_cost_sar,
                            fb_cost_sar,
                            bb_upgrade_sar,
                            hb_upgrade_sar,
                            fb_upgrade_sar,
                            unique_key,
                        });

                        await priceRepo.save(newPrice);
                    }
                } catch (innerError: any) {
                    console.log("error in processing row ;;;", innerError);
                }
            });

            const endPromise = once(parser, "end");
            fs.createReadStream(csvFilePath).pipe(parser);
            await endPromise;

            res.send("Pricing imported successfully");
        } catch (error: any) {
            console.log("error in pricing csv option ;;", error);
            return res.status(500).json({ error: error.message });
        }
    };

     // Import CSV
    // static importCSV = async (req: Request, res: Response) => {
    // const errors: string[] = [];
    // let successCount = 0;
    // let updateCount = 0;

    // try {
    //     if (!req.file) {
    //         return res.status(400).json({
    //             success: false,
    //             message: "No file uploaded",
    //         });
    //     }

    //     const csvFilePath = req.file.path;
    //     const parser = parse({
    //         columns: true,
    //         skip_empty_lines: true,
    //         trim: true,
    //     } as any);

    //     const priceRepo = AppDataSource.getRepository(RoomPrice);

    //     // Helper function to convert DD-MM-YYYY to YYYY-MM-DD
    //     const convertDateFormat = (dateStr: string): string => {
    //         if (!dateStr) return '';
            
    //         // Check if already in YYYY-MM-DD format
    //         if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    //             return dateStr;
    //         }
            
    //         // Convert DD-MM-YYYY to YYYY-MM-DD
    //         const parts = dateStr.split('-');
    //         if (parts.length === 3) {
    //             const [day, month, year] = parts;
    //             return `${year}-${month}-${day}`;
    //         }
            
    //         return dateStr;
    //     };

    //     // Collect all rows first, then process them
    //     const rows: any[] = [];
        
    //     parser.on("data", (row) => {
    //         rows.push(row);
    //     });

    //     const endPromise = once(parser, "end");
    //     fs.createReadStream(csvFilePath).pipe(parser);
    //     await endPromise;

    //     // Now process all rows sequentially
    //     for (const row of rows) {
    //         try {
    //             console.log("Processing pricing row:", row);

    //             const hotel_id = row[1]?.trim();
    //             const room_option_id = row[2]?.trim();
    //             const season_code = row[3]?.trim();
    //             const day_type = row[4]?.trim()?.toUpperCase();
    //             const start_date = convertDateFormat(row[5]?.trim());
    //             const end_date = convertDateFormat(row[6]?.trim());

    //             const cost_sar = row[7] ? Number(row[7]) : 0;
    //             const hb_cost_sar = row[8] ? Number(row[8]) : null;
    //             const fb_cost_sar = row[9] ? Number(row[9]) : null;

    //             const bb_upgrade_sar = row[10] ? Number(row[10]) : 0;
    //             const hb_upgrade_sar = row[11] ? Number(row[11]) : 0;
    //             const fb_upgrade_sar = row[12] ? Number(row[12]) : 0;
    //             const unique_key = row[13]?.trim() || `${hotel_id}${room_option_id}${season_code}${day_type}`;

    //             console.log("hotel id ;;;;", hotel_id);
    //             console.log("room option id ;;;", room_option_id);
    //             console.log("season code ;;;;", season_code);
    //             console.log("day type ;;;;;;", day_type);

    //             // Validate required fields
    //             if (!hotel_id || !room_option_id || !season_code || !day_type) {
    //                 errors.push(`Skipping invalid row - missing required fields`);
    //                 console.log("❌ Skipping invalid row:", row);
    //                 continue;
    //             }

    //             // Validate day_type
    //             if (day_type !== 'WEEKDAY' && day_type !== 'WEEKEND') {
    //                 errors.push(`Invalid day_type: ${day_type}. Must be WEEKDAY or WEEKEND`);
    //                 continue;
    //             }

    //             // Find existing
    //             let existingRow = await priceRepo.findOne({
    //                 where: {
    //                     hotel_id,
    //                     room_option_id,
    //                     season_code,
    //                     day_type
    //                 },
    //             });

    //             if (existingRow) {
    //                 Object.assign(existingRow, {
    //                     start_date: new Date(start_date),
    //                     end_date: new Date(end_date),
    //                     cost_sar,
    //                     hb_cost_sar,
    //                     fb_cost_sar,
    //                     bb_upgrade_sar,
    //                     hb_upgrade_sar,
    //                     fb_upgrade_sar,
    //                     unique_key
    //                 });

    //                 await priceRepo.save(existingRow); // UNCOMMENTED
    //                 updateCount++; // INCREMENT COUNTER
    //                 console.log("✅ Updated existing price");
    //             } else {
    //                 const newPrice = priceRepo.create({
    //                     hotel_id,
    //                     room_option_id,
    //                     season_code,
    //                     day_type: day_type as "WEEKDAY" | "WEEKEND",
    //                     start_date: new Date(start_date),
    //                     end_date: new Date(end_date),
    //                     cost_sar,
    //                     hb_cost_sar,
    //                     fb_cost_sar,
    //                     bb_upgrade_sar,
    //                     hb_upgrade_sar,
    //                     fb_upgrade_sar,
    //                     unique_key
    //                 });

    //                 await priceRepo.save(newPrice); // UNCOMMENTED
    //                 successCount++; // INCREMENT COUNTER
    //                 console.log("✅ Inserted new price");
    //             }
    //         } catch (err: any) {
    //             console.error("❌ Error processing row:", err);
    //             errors.push(`Error processing row: ${err.message}`);
    //         }
    //     }

    //     // Delete uploaded file
    //     if (fs.existsSync(csvFilePath)) {
    //         fs.unlinkSync(csvFilePath);
    //     }

    //     const totalProcessed = successCount + updateCount;

    //     if (errors.length > 0) {
    //         return res.json({
    //             success: true,
    //             message: `Import completed: ${successCount} new records, ${updateCount} updated. ${errors.length} errors occurred.`,
    //             errors: errors.slice(0, 20),
    //             stats: {
    //                 created: successCount,
    //                 updated: updateCount,
    //                 total: totalProcessed,
    //                 errors: errors.length
    //             }
    //         });
    //     }

    //     return res.json({
    //         success: true,
    //         message: `Successfully imported ${successCount} new records and updated ${updateCount} existing records`,
    //         stats: {
    //             created: successCount,
    //             updated: updateCount,
    //             total: totalProcessed,
    //             errors: 0
    //         }
    //     });
    // } catch (error: any) {
    //     console.error("CSV import error:", error);

    //     // Clean up file if it exists
    //     if (req.file && fs.existsSync(req.file.path)) {
    //         fs.unlinkSync(req.file.path);
    //     }

    //     return res.status(500).json({
    //         success: false,
    //         message: "Import failed",
    //         error: error.message,
    //     });
    // }
    // };.

    static pricing_csv_option = async (req: Request, res: Response) => {
        try {
            const csvFilePath = csv_path("room_pricing_list_11_12.csv");
            const parser = parse({ headers: true, ignoreEmpty: true });

            const priceRepo = AppDataSource.getRepository(RoomPrice);

            let updatedCount = 0;
let insertedCount = 0;
let skippedCount = 0;

            parser.on("data", async (row) => {
                try {
                    const hotel_id = row.hotel_id?.trim();
                    const room_option_id = row.room_option_id?.trim();
                    const season_code = row.season_code?.trim();
                    const start_date = row.start_date;
                    const end_date = row.end_date;
                    const day_type = row.day_type?.trim();

                    const cost_sar = row.cost_sar ? Number(row.cost_sar) : 0;
                    const hb_cost_sar = row.hb_cost_sar ? Number(row.hb_cost_sar) : null;
                    const fb_cost_sar = row.fb_cost_sar ? Number(row.fb_cost_sar) : null;

                    const bb_upgrade_sar = row.Add_Breakfast ? Number(row.Add_Breakfast) : 0;
                    const hb_upgrade_sar = row.Add_lunch ? Number(row.Add_lunch) : 0;
                    const fb_upgrade_sar = row.Add_Diner ? Number(row.Add_Diner) : 0;

                    // ⭐ NEW FIELD: selling price in USD
                    const selling_price_usd = row.sellprice_usd
                        ? Number(row.sellprice_usd)
                        : null;

                    const unique_key = row.unique_key?.trim();

                    // Skip invalid rows
                    if (!hotel_id || !room_option_id || !season_code) return;

                    let existingRow = await priceRepo.findOne({
                        where: {
                            hotel_id,
                            room_option_id,
                            season_code,
                            start_date,
                            end_date,
                            day_type
                        }
                    });

                    // console.log("existing row ;;;;;;;", existingRow);

                    if (existingRow) {
                        updatedCount++;
                        // ⭐ Update existing row
                        // existingRow.cost_sar = cost_sar;
                        // existingRow.hb_cost_sar = hb_cost_sar;
                        // existingRow.fb_cost_sar = fb_cost_sar;

                        existingRow.bb_upgrade_sar = bb_upgrade_sar;
                        existingRow.hb_upgrade_sar = hb_upgrade_sar;
                        existingRow.fb_upgrade_sar = fb_upgrade_sar;
                        // console.log("existing row ;;;", existingRow.room_option_id);
                        console.log("selling pricing ;;;;", selling_price_usd);
                        console.log("lunch price ;;;;", existingRow.hb_upgrade_sar);
                        console.log("updated count ;;;", updatedCount);

                        existingRow.selling_price_usd = selling_price_usd;   // ⭐ NEW

                        // console.log("existing price ;;;;", existingRow);

                        existingRow.unique_key = unique_key;

                        await priceRepo.save(existingRow);
                    } else {
                        skippedCount++; 
                        // ⭐ Insert new row
                        // const newPrice = priceRepo.create({
                        //     hotel_id,
                        //     room_option_id,
                        //     season_code,
                        //     start_date,
                        //     end_date,
                        //     day_type,

                        //     cost_sar,
                        //     hb_cost_sar,
                        //     fb_cost_sar,

                        //     bb_upgrade_sar,
                        //     hb_upgrade_sar,
                        //     fb_upgrade_sar,

                        //     selling_price_usd,              // ⭐ NEW FIELD INSERT

                        //     unique_key,
                        // });

                        // await priceRepo.save(newPrice);
                    }
                } catch (innerError: any) {
                    console.log("error in processing row ;;;", innerError);
                }
            });

            const endPromise = once(parser, "end");
            fs.createReadStream(csvFilePath).pipe(parser);
            await endPromise;

            res.send("Pricing imported successfully");
        } catch (error: any) {
            console.log("error in pricing csv option ;;", error);
            return res.status(500).json({ error: error.message });
        }
    };

    
    static importCSV = async (req: Request, res: Response) => {
        const errors: string[] = [];
        let successCount = 0;

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded",
                });
            }

            const csvFilePath = req.file.path;
            const parser = parse({
                columns: true,
                // columns: [
                //     "hotel_id",
                //     "room_type_id",
                //     "room_option_id",
                //     "day_type",
                //     "start_date",
                //     "end_date",
                //     "cost_sar",
                //     "hb_cost_sar",
                //     "fb_cost_sar",
                //     "bb_upgrade_sar",
                //     "hb_upgrade_sar",
                //     "fb_upgrade_sar",
                //     "unique_key"
                // ],
                skip_empty_lines: true,
                trim: true,
                // from_line: 2
            } as any);


            const priceRepo = AppDataSource.getRepository(RoomPrice);

            // Helper function to convert DD-MM-YYYY to YYYY-MM-DD
            const convertDateFormat = (dateStr: string): string => {
                if (!dateStr) return '';
                
                // Check if already in YYYY-MM-DD format
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                    return dateStr;
                }
                
                // Convert DD-MM-YYYY to YYYY-MM-DD
                const parts = dateStr.split('-');
                if (parts.length === 3) {
                    const [day, month, year] = parts;
                    return `${year}-${month}-${day}`;
                }
                
                return dateStr;
            };

            // Collect all rows first
            const rows: any[] = [];
            
            let isHeaderSkipped = false;
            parser.on("data", (row) => {
                if (!isHeaderSkipped) {
                    isHeaderSkipped = true;
                    return; // skip header row
                }
                rows.push(row);
            });

            const endPromise = once(parser, "end");
            fs.createReadStream(csvFilePath).pipe(parser);
            await endPromise;

            console.log(`📊 Parsed ${rows.length} rows from CSV`);

            // TRUNCATE TABLE - Delete all records and reset ID sequence
            console.log("🗑️  Truncating room_prices table...");
            await AppDataSource.query(`TRUNCATE TABLE room_prices RESTART IDENTITY CASCADE`);
            console.log("✅ Table truncated, IDs will start from 1");

            // Prepare all records for bulk insert
            const pricesToInsert: any[] = [];

            
            for (const row of rows) {
                try {
                    
                    const hotel_id = row[1]?.trim();
                    const room_option_id = row[2]?.trim();
                    const season_code = row[3]?.trim();
                    const day_type = row[4]?.trim()?.toUpperCase();
                    const start_date = convertDateFormat(row[5]?.trim());
                    const end_date = convertDateFormat(row[6]?.trim());

                    // const cost_sar = row[7] ? Number(row[7]) : 0;
                    // const hb_cost_sar = row[8] ? Number(row[8]) : null;
                    // const fb_cost_sar = row[9] ? Number(row[9]) : null;

                    const bb_upgrade_sar = row[7] ? Number(row[7]) : 0;
                    const hb_upgrade_sar = row[8] ? Number(row[8]) : 0;
                    const fb_upgrade_sar = row[9] ? Number(row[9]) : 0;
                    const selling_price_usd = row[10] ? Number(row[10]) : 0;
                    const unique_key = row[13]?.trim() || `${hotel_id}${room_option_id}${season_code}${day_type}`;

                    // Validate required fields
                    if (!hotel_id || !room_option_id || !season_code || !day_type || !start_date || !end_date) {
                        errors.push(`Skipping invalid row - missing required fields`);
                        continue;
                    }

                    // Validate day_type
                    if (day_type !== 'WEEKDAY' && day_type !== 'WEEKEND') {
                        console.log("day type ;;;;;;", day_type, room_option_id);
                        errors.push(`Invalid day_type: ${day_type}. Must be WEEKDAY or WEEKEND room id: ${row[2]}, season: ${season_code}`);
                        continue;
                    }

                    pricesToInsert.push({
                        hotel_id,
                        room_option_id,
                        season_code,
                        day_type,
                        start_date: new Date(start_date),
                        end_date: new Date(end_date),
                        cost_sar: 0,
                        hb_cost_sar: 0, 
                        fb_cost_sar: 0,
                        bb_upgrade_sar,
                        hb_upgrade_sar,
                        fb_upgrade_sar,
                        selling_price_usd,
                        unique_key
                    });

                } catch (err: any) {
                    console.error("❌ Error processing row:", err);
                    errors.push(`Error processing row: ${err.message}`);
                }
            }

            // BULK INSERT in chunks
            if (pricesToInsert.length > 0) {
                console.log(`💾 Inserting ${pricesToInsert.length} records...`);
                
                const chunkSize = 1000;
                for (let i = 0; i < pricesToInsert.length; i += chunkSize) {
                    const chunk = pricesToInsert.slice(i, i + chunkSize);
                    await priceRepo.insert(chunk);
                    console.log(`✅ Inserted chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(pricesToInsert.length / chunkSize)}`);
                }
                
                successCount = pricesToInsert.length;
                console.log(`✅ Successfully inserted ${successCount} records with IDs starting from 1`);
            }

            // Delete uploaded file
            if (fs.existsSync(csvFilePath)) {
                fs.unlinkSync(csvFilePath);
            }

            return res.json({
                success: true,
                message: `Successfully imported ${successCount} records. IDs reset to start from 1.`,
                stats: {
                    created: successCount,
                    updated: 0,
                    total: successCount,
                    errors: errors.length
                },
                errors: errors.length > 0 ? errors.slice(0, 20) : []
            });

        } catch (error: any) {
            console.error("CSV import error:", error);

            // Clean up file if it exists
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(500).json({
                success: false,
                message: "Import failed",
                error: error.message,
            });
        }
    };

    static currency_csv_post = async (req: Request, res: Response) => {
        try {
            const csvFilePath = join(
                process.cwd(),
                "public",
                "csv",
                "currency_rate.csv"
            );

            const currencyRepo = AppDataSource.getRepository(CurrencyExchangeRate);

            const parser = parse({ headers: true, ignoreEmpty: true });

            parser.on("data", async (row) => {
                console.log("Row:", row);

                // -----------------------------------------
                // 5️⃣ Create hotel entity
                // -----------------------------------------
                const currency = currencyRepo.create({
                from_currency: row.from_currency,
                to_currency: row.to_currency,
                market_rate: row.market_rate,
                umrahspot_rate: row.UmrahSpot_rate,
            
                });

                await currencyRepo.save(currency);
            });

            const endPromise = once(parser, "end");

            fs.createReadStream(csvFilePath).pipe(parser);

            await endPromise;

            res.send("currency imported successfully.");
        } catch (error: any) {
            console.error("CSV import error:", error);
            return res.status(500).json({ error: error.message });
        }
    };

    static hotel_markup_csv_post = async (req: Request, res: Response) => {
        try {
            const csvFilePath = join(
            process.cwd(),
            "public",
            "csv",
            "margin_rate.csv"
            );

            const hotelRepo = AppDataSource.getRepository(Hotel);
            const markupRepo = AppDataSource.getRepository(HotelMarkupRate);

            const parser = parse({ headers: true, ignoreEmpty: true });

            parser.on("data", async (row) => {
            try {
                console.log("Row:", row);

                // 1️⃣ Find hotel using name_id (AJM, FMT, etc.)
                const hotel = await hotelRepo.findOne({
                where: { name_id: row.hotel_id },
                });

                if (!hotel) {
                console.warn(`Hotel not found for code: ${row.hotel_id}`);
                return;
                }

                // 2️⃣ Check if markup already exists
                let markup = await markupRepo.findOne({
                where: { hotel_id: hotel.id },
                });

                if (!markup) {
                markup = markupRepo.create({
                    hotel_id: hotel.id,
                });
                }

                // 3️⃣ Assign rates
                markup.fee_buffer_rate = Number(row.fee_buffer_rate);
                markup.profit_margin_rate = Number(row.profit_margin_rate);
                markup.total_markup_rate = Number(row.total_markup_rate);

                await markupRepo.save(markup);
            } catch (rowError) {
                console.error("Row error:", rowError);
            }
            });

            const endPromise = once(parser, "end");

            fs.createReadStream(csvFilePath).pipe(parser);
            await endPromise;

            res.send("Hotel markup rates imported successfully.");
        } catch (error: any) {
            console.error("CSV import error:", error);
            res.status(500).json({ error: error.message });
        }
        };

}

export default PostgresExportController;
