import { Request, Response } from "express";
import { AppDataSource, initializeDataSource } from "../db/data-source";
import { City } from "../entities/City";
type UploadedFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename: string;
  path?: string;
  buffer?: Buffer;
};
import { MulterS3File } from "../types/multer-s3-file";
import { Hotel } from "../entities/Hotel";
import { Room } from "../entities/Room";
import { formatDatetime, handleError } from "../utils/utils";
import { HotelExtra } from "../entities/HotelExtra";
import { HotelPhoto } from "../entities/HotelPhoto";
import { RoomPhoto } from "../entities/RoomPhoto";
import { RoomExtra } from "../entities/RoomExtra";
import path from "path";
import fs from 'fs';
import { asyncHandler } from "../utils/asyncHandler";
import { Booking } from "../entities/Booking";
import { User } from "../entities/User";
import { RoomType } from "../entities/RoomType";
import { SeasonCode } from "../entities/SeasonCode";
import { RoomOccupancy } from "../entities/RoomOccupancy";
import { In } from "typeorm";
import { error } from "console";
import { RoomOccupancyPhoto } from "../entities/RoomOccupancyPhoto";
import { HotelMarkupRate } from "../entities/HotelMarkupRate";
import { Booking2 } from "../entities/Booking2";
import { BookingRoom } from "../entities/BookingRoom";
import { BookingCustomer } from "../entities/BookingCustomer";
import { Payment } from "../entities/Payment";
interface ServiceItem {
  value: string;
  thumbnail: string;
}

interface NearbyPlace {
  place: string;
  distance: string;
  thumbnail: string;
}

export class DashboardController {
  static showCity = async (req: Request, res: Response) => {
    try {
      const cityRepo = AppDataSource.getRepository(City);

      // ✅ Fetch all cities, ordered by name
      const cities = await cityRepo.find({
        order: { name: "ASC" },
      });

      // ✅ Render the city list EJS view
      return res.render("city/list", {
        user: { name: "Admin" },
        cities, // Pass the fetched cities to EJS
      });
    } catch (error) {
      console.error("❌ Error fetching cities:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  static addCity = async (req: Request, res: Response) =>{
    try {
       return res.render("city/add", {
        user: { name: "Admin" },
      });
    } catch (error : any) {
      console.log("error in add city;", error);
       return handleError(res, error);
    }
  }

  static showCityEdit = async (req: Request, res: Response) =>{
    try {
      const { id } = req.params;
      const cityRepo = AppDataSource.getRepository(City);
      const city = await cityRepo.findOne({ where: { id: Number(id) } });

      if (!city) {
        return res.status(404).render("city/edit", {
          error: "City not found",
          user: { name: "Admin" },
        });
      }

      return res.render('city/edit',{
        user: {name: "Admin"},
        city,
      })
    } catch (error) {
      console.log("error in show city;", error);
      return handleError(res, error);
    }
  }

  static updateCity = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const cityRepo = AppDataSource.getRepository(City);
      const city = await cityRepo.findOne({ where: { id: Number(id) } });

      if (!city) {
        return res.status(404).render("city/edit", {
          error: "City not found",
          user: { name: "Admin" },
        });
      }

      if (!name || name.trim() === "") {
        return res.render("city/edit", {
          error: "City name is required",
          user: { name: "Admin" },
          city,
        });
      }

      // Update and save
      city.name = name.trim();
      await cityRepo.save(city);

      // Redirect or show success message
      return res.redirect("/portal/city"); 
      // or: return res.render("city/edit", { success: "City updated successfully", city });
    } catch (error) {
      console.error("error in updateCity:", error);
      return handleError(res, error);
    }
  };

  static saveCity = async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      // Basic validation
      if (!name || name.trim() === "") {
        return res.status(400).render("portal/city-add", {
          error: "City name is required",
        });
      }

      const cityRepo = AppDataSource.getRepository(City);

      // Check for duplicates
      const existingCity = await cityRepo.findOne({ where: { name } });
      if (existingCity) {
        return res.status(400).render("portal/city-add", {
          error: "City already exists",
        });
      }

      // Save new city
      const city = cityRepo.create({ name });
      await cityRepo.save(city);

      // Option 1: redirect to city list
      return res.redirect("/portal/city");

      // Option 2: or show success message (if you want to stay on same page)
      // return res.render("portal/city-add", { success: "City added successfully" });

    } catch (error) {
      return handleError(res, error);
    }
  };

  static deleteCity = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      console.log("id value ;;;", id);
      const cityRepo = AppDataSource.getRepository(City);

      console.log("no error 1")
      // Find city by ID
      const city = await cityRepo.findOne({ where: { id: Number(id) } });
      console.log("no error 2")
      if (!city) {
        return res.status(404).render("city/list", {
          error: "City not found",
          user: { name: "Admin" },
        });
      }

      // Delete city
      await cityRepo.remove(city);

      // Redirect or return success
      return res.status(200).json({
        status: "success",
        message: "City deleted successfully",
      });
      // or return res.render("city/list", { success: "City deleted successfully" });

    } catch (error) {
      console.error("Error deleting city:", error);
      return handleError(res, error);
    }
  };

  static showHotel = async (req: Request, res: Response) => {
   try {
      await initializeDataSource();

      const hotelRepo = AppDataSource.getRepository(Hotel);

      // ✅ Fetch all hotels with city relation, ordered by name
      const hotels = await hotelRepo.find({
        relations: ["city"],
        order: { name: "ASC" },
      });

      // ✅ Render the hotel list EJS view
      return res.render("hotel/list", {
        user: { name: "Admin" },
        hotels, // Pass the fetched hotels to EJS
      });
    } catch (error) {
      console.error("❌ Error fetching hotels:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  static showHotelAdd = async (req: Request, res: Response) => {
    try {
      const cityRepo = AppDataSource.getRepository(City);
      const hotelExtraRepo = AppDataSource.getRepository(HotelExtra);

      // ✅ Fetch lookup tables
      const [cities, hotel_services, hotel_amenities, hotel_nearby_places] =
        await Promise.all([
          cityRepo.find({ order: { name: "ASC" } }),
          hotelExtraRepo.find({ where: { type: "service" }, order: { name: "ASC" } }),
          hotelExtraRepo.find({ where: { type: "amenity" }, order: { name: "ASC" } }),
          hotelExtraRepo.find({ where: { type: "nearby_place" }, order: { name: "ASC" } }),
        ]);

      // ✅ Render view
      return res.render("hotel/add_hotel", {
        user: { name: "Admin" },
        cities,
        hotel_services,
        hotel_amenities,
        hotel_nearby_places,
      });
    } catch (error: any) {
      console.error("❌ Error fetching hotel add view:", error);
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  };

  static createHotel = async (req: Request, res: Response) => {
    try {
      console.log("checking 1")
      const hotelRepo = AppDataSource.getRepository(Hotel);
      console.log("checking 1")
      const photoRepo = AppDataSource.getRepository(HotelPhoto);
      console.log("checking 2")
      
      const {name_id, name,location_map_url, address,description, hotel_cities,youtube_video_url,google_comments_url,check_in_from,check_out_until, distance_haram_minutes,distance_haram_mitres,rating, price,child_policy,cancellation_policy } = req.body;
      console.log("checking 3")

      // ✅ Create new hotel instance
      const hotel = hotelRepo.create({
        name_id:name_id,
        name: name,
        youtube_video_url:youtube_video_url || null,
        google_comments_url:google_comments_url || null,
        check_in_from:check_in_from,
        check_out_until:check_out_until,
        address: address,
        description:description,
        location_map_url:location_map_url||"",
        city_id: Number(hotel_cities),
        distance_haram_minutes: distance_haram_minutes ? Number(distance_haram_minutes) : null,
        distance_haram_mitres:distance_haram_mitres || null,
        rating: rating ? Number(rating) : 5,
        child_policy:child_policy,
        cancellation_policy:cancellation_policy,
        price: price ? Number(price) : null
      });

      // ✅ Handle hotel_services - data comes as array from checkboxes
      if (Array.isArray(req.body.hotel_services) && req.body.hotel_services.length > 0) {
        hotel.services = req.body.hotel_services
          .filter((s: any) => s.value && s.value.trim() !== "")
          .map((s: any) => ({
            value: s.value.trim(),
            thumbnail: s.thumbnail || ""
          }));
        console.log("Parsed services:", hotel.services);
      }

      // ✅ Handle inner_amenities - data comes as array from checkboxes
      if (Array.isArray(req.body.inner_amenities) && req.body.inner_amenities.length > 0) {
        hotel.amenities = req.body.inner_amenities
          .filter((a: any) => a.value && a.value.trim() !== "")
          .map((a: any) => ({
            value: a.value.trim(),
            thumbnail: a.thumbnail || ""
          }));
        console.log("Parsed amenities:", hotel.amenities);
      }

      // ✅ Handle nearby_places - data comes as array
      if (Array.isArray(req.body.nearby_places) && req.body.nearby_places.length > 0) {
        hotel.nearby_places = req.body.nearby_places
          .filter((p: any) => p.place && p.distance && p.map_url)
          .map((p: any) => ({
            place: p.place.trim(),
            distance: p.distance.trim(),
            thumbnail: p.thumbnail || "",
            map_url:p.map_url?.trim() || ""
          }));
        console.log("Parsed nearby places:", hotel.nearby_places);
      }

      // ✅ Handle thumbnail image
      /* old code to save image start 
      const files = req.files as { [field: string]: UploadedFile[] } | undefined;
      console.log("Files received:", files);

      const thumb = files?.image?.[0];
      if (thumb?.filename) {
        hotel.image_url = `/uploads/${thumb.filename}`;
      }
       old code to save image end */
      const files = req.files as {
        image?: MulterS3File[];
        gallery_images?: MulterS3File[];
      };

      // ✅ Thumbnail (S3)
      const thumb = files?.image?.[0];
      if (thumb?.location) {
        hotel.image_url = thumb.location; // ✅ FULL S3 URL
      }


      // ✅ Save hotel first to get the ID
      const savedHotel = await hotelRepo.save(hotel);
      console.log("Hotel created successfully with ID:", savedHotel.id);

      // ✅ Handle gallery images - save them after hotel is created
      const gallery = files?.gallery_images ?? [];
      console.log("Adding gallery images:", gallery.length);

      for (const img of gallery) {
        const newPhoto = photoRepo.create({
          hotel: { id: savedHotel.id },
          // image_url: `/uploads/${img.filename}`,
          image_url: img.location, // ✅ S3 URL
        });
        console.log("Saving gallery photo:", newPhoto);
        await photoRepo.save(newPhoto);
      }

      return res.redirect(`/portal/hotel`);
    } catch (err: any) {
      console.error("Error creating hotel:", err);
      return res.status(500).json({error: err.message || "Server error"});
    }
  };

  static showRoom = async (req: Request, res: Response) => {
    try {
      const roomRepo = AppDataSource.getRepository(Room);

      // ✅ Fetch all rooms with hotel relation, ordered by name
      const rooms = await roomRepo.find({
        relations: ["hotel", "room_type"],
        order: { name: "ASC" },
      });

      // return res.send(rooms);

      // ✅ Render the room list EJS view
      return res.render("room/list", {
        user: { name: "Admin" },
        rooms, // Pass the fetched rooms to EJS
      });
    } catch (error: any) {
      console.error("❌ Error fetching rooms:", error);
      res.status(500).json({message: error.message || "Internal Server Error"});
    }
  }

  static showHotelEdit = async (req: Request, res: Response) => {
    try {
      const hotelId = parseInt(req.params.id, 10);
      const hotelRepo = AppDataSource.getRepository(Hotel);
      const cityRepo = AppDataSource.getRepository(City);
      const hotelExtraRepo = AppDataSource.getRepository(HotelExtra);

      // ✅ Fetch hotel with relations
      const hotel = await hotelRepo.findOne({
        where: { id: hotelId },
        relations: ["city", "reviews", "photos"],
         order: {
    photos: {
      position: "ASC" // ✅ Sort photos by position
    }
  }
      });

      if (!hotel) {
        return res.status(404).send("Hotel not found");
      }

      const normalizeExtras = (
        raw: unknown
      ): Array<{ value: string; thumbnail: string }> => {
        if (!raw) return [];

        let parsed: unknown = raw;

        if (typeof raw === "string") {
          try {
            parsed = JSON.parse(raw);
          } catch (error) {
            console.warn("Failed to parse extras JSON:", error);
            return [];
          }
        }

        if (Array.isArray(parsed)) {
          return parsed
            .map((entry: any) => ({
              value: typeof entry?.value === "string" ? entry.value : "",
              thumbnail:
                typeof entry?.thumbnail === "string" ? entry.thumbnail : "",
            }))
            .filter((entry) => entry.value.trim() !== "");
        }

        if (parsed && typeof parsed === "object") {
          return Object.entries(parsed as Record<string, any>).map(
            ([value, extra]) => ({
              value,
              thumbnail:
                typeof extra === "string"
                  ? extra
                  : typeof extra?.thumbnail === "string"
                  ? extra.thumbnail
                  : "",
            })
          );
        }

        return [];
      };

      hotel.services = normalizeExtras(hotel.services);
      hotel.amenities = normalizeExtras(hotel.amenities);

      // ✅ Normalize nearby_places
      try {
        if (hotel.nearby_places) {
          // If stringified JSON → parse
          const parsed =
            typeof hotel.nearby_places === "string"
              ? JSON.parse(hotel.nearby_places)
              : hotel.nearby_places;

          // If object (old format like { "Pharmacy": "500m" }) → convert to array
          if (!Array.isArray(parsed)) {
            hotel.nearby_places = Object.entries(parsed).map(([place, distance]) => ({
              place,
              distance,
              thumbnail: "",
            }));
          } else {
            hotel.nearby_places = parsed;
          }
        } else {
          hotel.nearby_places = [];
        }
      } catch (err) {
        console.error("Error parsing nearby_places JSON:", err);
        hotel.nearby_places = [];
      }

      // ✅ Fetch lookup tables
      const [cities, hotel_services, hotel_amenities, hotel_nearby_places] =
        await Promise.all([
          cityRepo.find({ order: { name: "ASC" } }),
          hotelExtraRepo.find({ where: { type: "service" }, order: { name: "ASC" } }),
          hotelExtraRepo.find({ where: { type: "amenity" }, order: { name: "ASC" } }),
          hotelExtraRepo.find({ where: { type: "nearby_place" }, order: { name: "ASC" } }),
        ]);

        // console.log("hotel aminity ;;;;;;", hotel_amenities);

         const roomRepo = AppDataSource.getRepository(Room);

         console.log("error comes here ;;;;;;;1")
      // ✅ Fetch all rooms with hotel relation, ordered by name
      const rooms = await roomRepo.find({
        where: { hotel: { id: hotelId } },
        relations: ["hotel", "room_type"],
        order: { name: "ASC" },
      }) as any;

      // ✅ Render view
      return res.render("hotel/edit", {
        user: { name: "Admin" },
        hotel,
        cities,
        hotel_amenities,
        hotel_nearby_places,
        hotel_services,
        formatDatetime,
        rooms
      });
    } catch (error: any) {
      console.error("❌ Error fetching hotel for edit:", error);
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  };
  
  static deleteHotel = async (req: Request, res: Response) =>{
    try {
         const { id } = req.params;
      console.log("id value ;;;", id);
      const hotelRepo = AppDataSource.getRepository(Hotel);

      console.log("no error 1")
      // Find city by ID
      const hotel = await hotelRepo.findOne({ where: { id: Number(id) } });
      console.log("no error 2")
      if (!hotel) {
        return res.status(404).render("city/list", {
          error: "hotel not found",
          user: { name: "Admin" },
        });
      }

      // Delete city
      await hotelRepo.remove(hotel);

      // Redirect or return success
      return res.status(200).json({
        status: "success",
        message: "Hotel deleted successfully",
      });
    } catch (error: any) {
      console.log("error deleting hotel ;;;", error);
      return res.status(500).json({error: error.message});
    }
  }

  // static updateHotel = async (req: Request, res: Response) => {
  //   try {
  //     const hotelRepo = AppDataSource.getRepository(Hotel);
  //     const photoRepo = AppDataSource.getRepository(HotelPhoto);

  //     const hotelId = Number(req.params.id);
  //     const hotel = await hotelRepo.findOne({
  //       where: { id: hotelId },
  //       relations: ["city"],
  //     });

  //     if (!hotel) return res.status(404).send("Hotel not found");

  //     const { name, address, hotel_cities, distance_to_haram } = req.body;
  //     hotel.name = name;
  //     hotel.address = address;
  //     hotel.city_id = Number(hotel_cities);
  //     hotel.distance_to_haram = distance_to_haram ? Number(distance_to_haram) * 60 : null;

  //     // ✅ Handle hotel_services - data comes as JSON array
  //     if (Array.isArray(req.body.hotel_services) && req.body.hotel_services.length > 0) {
  //       hotel.services = req.body.hotel_services
  //         .filter((s: any) => s.value && s.value.trim() !== "")
  //         .map((s: any) => ({
  //           value: s.value.trim(),
  //           thumbnail: s.thumbnail || ""
  //         }));
  //       console.log("Parsed services:", hotel.services);
  //     }

  //     // ✅ Handle inner_amenities - data comes as JSON array
  //      if (Array.isArray(req.body.inner_amenities) && req.body.inner_amenities.length > 0) {
  //         hotel.amenities = req.body.inner_amenities
  //           .filter((a: any) => a.value && a.value.trim() !== "")
  //           .map((a: any) => ({
  //             value: a.value.trim(),
  //             thumbnail: a.thumbnail || ""
  //           }));
  //         console.log("Parsed amenities:", hotel.amenities);
  //       }

  //     // ✅ Handle nearby_places - data comes as JSON array
  //        if (Array.isArray(req.body.nearby_places) && req.body.nearby_places.length > 0) {
  //         hotel.nearby_places = req.body.nearby_places
  //           .filter((p: any) => p.place && p.distance)
  //           .map((p: any) => ({
  //             place: p.place.trim(),
  //             distance: p.distance.trim(),
  //             thumbnail: p.thumbnail || ""
  //           }));
  //         console.log("Parsed nearby places:", hotel.nearby_places);
  //       }

  //     // ✅ Handle thumbnail image
  //     const files = req.files as { [field: string]: UploadedFile[] } | undefined;
  //     console.log("Files received:", files);

  //     const thumb = files?.image?.[0];
  //     if (thumb?.filename) {
  //       hotel.image_url = `/uploads/${thumb.filename}`;
  //     }

  //     // ✅ Handle gallery images
  //     const gallery = files?.gallery_images ?? [];
  //     console.log("Gallery images:", gallery.length);

  //     for (const img of gallery) {
  //       const newPhoto = photoRepo.create({
  //         hotel: { id: hotel.id } as any,
  //         image_url: `/uploads/${img.filename}`,
  //       });
  //       console.log("Saving gallery photo:", newPhoto);
  //       await photoRepo.save(newPhoto);
  //     }

  //     await hotelRepo.save(hotel);
  //     console.log("Hotel updated successfully:", hotel.id);
      
  //     return res.redirect(`/portal/hotel`);
  //   } catch (err) {
  //     console.error("Error updating hotel:", err);
  //     return res.status(500).send("Server error");
  //   }
  // };

  static updateHotel = async (req: Request, res: Response) => {
    try {
      const hotelRepo = AppDataSource.getRepository(Hotel);
      const photoRepo = AppDataSource.getRepository(HotelPhoto);

      const hotelId = Number(req.params.id);
      const hotel = await hotelRepo.findOne({
        where: { id: hotelId },
        relations: ["city"],
      });

      if (!hotel) return res.status(404).send("Hotel not found");
      
      const {name_id, name,location_map_url, address,description, hotel_cities,youtube_video_url,google_comments_url,check_in_from,check_out_until, distance_haram_minutes,distance_haram_mitres,rating, price,child_policy,cancellation_policy} = req.body;
        hotel.name_id=name_id,
        hotel.name= name,
        hotel.youtube_video_url=youtube_video_url || null,
        hotel.google_comments_url=google_comments_url || null,
        hotel.check_in_from=check_in_from,
        hotel.check_out_until=check_out_until,
        hotel.address= address,
        hotel.description=description,
        hotel.location_map_url=location_map_url||"",
        hotel.city_id= Number(hotel_cities),
        hotel.distance_haram_minutes= distance_haram_minutes ? Number(distance_haram_minutes) : null,
        hotel.distance_haram_mitres=distance_haram_mitres || null,
        hotel.rating=Number(rating) || 5,
        hotel.child_policy=child_policy,
        hotel.cancellation_policy=cancellation_policy,
        hotel.price= price ? Number(price) : null
      // ✅ Handle hotel_services - data comes as JSON array
      if (Array.isArray(req.body.hotel_services) && req.body.hotel_services.length > 0) {
        hotel.services = req.body.hotel_services
          .filter((s: any) => s.value && s.value.trim() !== "")
          .map((s: any) => ({
            value: s.value.trim(),
            thumbnail: s.thumbnail || ""
          }));
        console.log("Parsed services:", hotel.services);
      }

      // ✅ Handle inner_amenities - data comes as JSON array
      if (Array.isArray(req.body.inner_amenities) && req.body.inner_amenities.length > 0) {
        hotel.amenities = req.body.inner_amenities
          .filter((a: any) => a.value && a.value.trim() !== "")
          .map((a: any) => ({
            value: a.value.trim(),
            thumbnail: a.thumbnail || ""
          }));
        console.log("Parsed amenities:", hotel.amenities);
      }

      // ✅ Handle nearby_places - data comes as JSON array
      if (Array.isArray(req.body.nearby_places) && req.body.nearby_places.length > 0) {
        hotel.nearby_places = req.body.nearby_places
          .filter((p: any) => p.place && p.distance && p.map_url)
          .map((p: any) => ({
            place: p.place.trim(),
            distance: p.distance.trim(),
            thumbnail: p.thumbnail || "",
            map_url:p.map_url?.trim() || ""
          }));
        console.log("Parsed nearby places:", hotel.nearby_places);
      }

      // ✅ Handle thumbnail image
      // const files = req.files as { [field: string]: UploadedFile[] } | undefined;
      // console.log("Files received:", files);

      // const thumb = files?.image?.[0];
      // if (thumb?.filename) {
      //   hotel.image_url = `/uploads/${thumb.filename}`;
      // }
      const files = req.files as {
        image?: MulterS3File[];
        gallery_images?: MulterS3File[];
      };
      console.log("Files received:", files);

      const thumb = files?.image?.[0];
      if (thumb?.location) {
        // ✅ Optional: Delete old thumbnail from S3 if needed
        // if (hotel.image_url) {
        //   await deleteFromS3(hotel.image_url);
        // }
        hotel.image_url = thumb.location; // ✅ S3 URL
      }      


      // ✅ Handle deleted gallery images
      // const deletedPhotos = req.body.deleted_photos;
      // if (deletedPhotos && deletedPhotos.trim() !== "") {
      //   const photoIdsToDelete = deletedPhotos.split(",").map((id: string) => parseInt(id.trim()));
      //   console.log("Deleting photos with IDs:", photoIdsToDelete);
        
      //   if (photoIdsToDelete.length > 0) {
      //     await photoRepo.delete(photoIdsToDelete);
      //     console.log("Deleted photos successfully");
      //   }
      // }

       // ✅ Handle photo reordering BEFORE handling deletions
    const photoOrder = req.body.photo_order;
    if (photoOrder && photoOrder.trim() !== "") {
      const orderPairs = photoOrder.split(",");
      const updatePromises = orderPairs.map(async (pair: string) => {
        const [photoId, position] = pair.split(":").map(Number);
        if (photoId && !isNaN(position)) {
          await photoRepo.update(photoId, { position });
        }
      });
      await Promise.all(updatePromises);
      console.log("Updated photo positions");
    }

       const deletedPhotos = req.body.deleted_photos;
      if (deletedPhotos && deletedPhotos.trim() !== "") {
        const photoIdsToDelete = deletedPhotos.split(",").map((id: string) => parseInt(id.trim()));
        console.log("Deleting photos with IDs:", photoIdsToDelete);
        
        if (photoIdsToDelete.length > 0) {
          // ✅ Optional: Delete images from S3 before deleting records
          const photosToDelete = await photoRepo.find({
            where: { id: In(photoIdsToDelete) }
          });
          
          // for (const photo of photosToDelete) {
          //   if (photo.image_url) {
          //     await deleteFromS3(photo.image_url);
          //   }
          // }
          
          await photoRepo.delete(photoIdsToDelete);
          console.log("Deleted photos successfully");
        }
      }

      // ✅ Handle NEW gallery images
      // const gallery = files?.gallery_images ?? [];
      // console.log("Adding new gallery images:", gallery.length);

      // for (const img of gallery) {
      //   const newPhoto = photoRepo.create({
      //     hotel: { id: hotel.id } as any,
      //     image_url: `/uploads/${img.filename}`,
      //   });
      //   console.log("Saving gallery photo:", newPhoto);
      //   await photoRepo.save(newPhoto);
      // }
      const gallery = files?.gallery_images ?? [];
      console.log("Adding new gallery images:", gallery.length);

      if (gallery.length > 0) {
        const photoPromises = gallery.map(img => {
          const newPhoto = photoRepo.create({
            hotel_id: hotel.id, // ✅ Use hotel_id directly
            image_url: img.location, // ✅ S3 URL
          });
          return photoRepo.save(newPhoto);
        });
        
        await Promise.all(photoPromises);
        console.log(`Saved ${gallery.length} gallery photos`);
      }

      await hotelRepo.save(hotel);
      console.log("Hotel updated successfully:", hotel.id);
      
      return res.redirect(`/portal/hotel/${hotel.id}/edit`);
    } catch (err: any) {
      console.error("Error updating hotel:", err);
      return res.status(500).json({error: err.message || "Server error"});
    }
  };
  
  static showHotelExtra = async (req: Request, res: Response) => {
    try {
      const hotelExtraRepo = AppDataSource.getRepository(HotelExtra);

      // ✅ Fetch all hotel extras, ordered by type and name
      const hotel_services = await hotelExtraRepo.find({
        where: { type: "service" },
        order: { name: "ASC" },
      });


      console.log("hotel services ;;;;;", hotel_services);

      const hotel_amenities = await hotelExtraRepo.find({
        where: { type: "amenity" },
        order: { name: "ASC" },
      });
      const hotel_nearby_places = await hotelExtraRepo.find({
        where: { type: "nearby_place" },
        order: { name: "ASC" },
      });
      // ✅ Render the hotel extra list EJS view
      return res.render("hotel/extra", {
        user: { name: "Admin" },
        hotel_services, // Pass the fetched services to EJS
        hotel_amenities, // Pass the fetched amenities to EJS
        hotel_nearby_places, // Pass the fetched nearby places to EJS
      });
    } catch (error : any) {
      console.error("❌ Error fetching hotel extras:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }

  static addHotelExtra = async (req: Request, res: Response) => {
    try {
      const hotelExtraRepo = AppDataSource.getRepository(HotelExtra);

       // ✅ Fetch distinct types from hotel_extras table
      const types = await hotelExtraRepo
        .createQueryBuilder("hotel_extra")
        .select("DISTINCT hotel_extra.type", "type")
        .getRawMany();

      const typeList = types.map((t) => t.type);

      console.log("type list ;;;;;", typeList)

      return res.render("hotel/add_extra", {
        user: { name: "Admin" },
        typeList, 
      });
    } catch (error : any) {
      console.error("❌ Error rendering add hotel extra page:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }

  static saveHotelExtra = async (req: Request, res: Response) =>  {
    try {
      const hotelExtraRepo = AppDataSource.getRepository(HotelExtra);
      const { name, type, thumbnail } = req.body;

      console.log("hotel extra vlaues ;;;;;;;", req.body);
      // ✅ Create a new hotel extra
      const hotelExtra = hotelExtraRepo.create({
        name,
        type,
        thumbnail,
      });

      await hotelExtraRepo.save(hotelExtra);
      return res.redirect(`/portal/hotel-extra`);
    } catch (error: any) {
      console.error("❌ Error saving hotel extra:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  };

  static editHotelExtra = async (req: Request, res: Response) => {
    try {
      const hotelExtraRepo = AppDataSource.getRepository(HotelExtra);
      const hotelExtraId = parseInt(req.params.id, 10);

      // ✅ Fetch the hotel extra by ID
      const hotelExtra = await hotelExtraRepo.findOne({ where: { id: hotelExtraId } });

      if (!hotelExtra) {
        return res.status(404).send("Hotel Extra not found");
      }

        const types = await hotelExtraRepo
        .createQueryBuilder("hotel_extra")
        .select("DISTINCT hotel_extra.type", "type")
        .getRawMany();

      const typeList = types.map((t) => t.type);

      return res.render("hotel/edit_extra", {
        user: { name: "Admin" },
        hotelExtra,
        typeList,
      });
    } catch (error: any) {
      console.error("❌ Error rendering edit hotel extra page:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }

  static deleteHotelExtra = async (req: Request, res: Response) => {
    try {
      const hotelExtraRepo = AppDataSource.getRepository(HotelExtra);
      const hotelExtraId = parseInt(req.params.id, 10);

      // ✅ Delete the hotel extra
      await hotelExtraRepo.delete(hotelExtraId);
      return res.redirect("/portal/hotel-extra");
    } catch (error: any) {
      console.error("❌ Error deleting hotel extra:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }

  static updateHotelExtra = async (req: Request, res: Response) => {
    try {
      const hotelExtraRepo = AppDataSource.getRepository(HotelExtra);
      const hotelExtraId = parseInt(req.params.id, 10);
      const { name, type, thumbnail } = req.body;

      // ✅ Update the hotel extra
      await hotelExtraRepo.update(hotelExtraId, {
        name,
        type,
        thumbnail,
      });
      return res.redirect("/portal/hotel-extra");
    } catch (error: any) {
      console.error("❌ Error updating hotel extra:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }

  static showRoomAdd = async (req: Request, res: Response) => {
    try {
      let hotelId = req.query.hotelId as string | undefined;
      const hotels = await AppDataSource.getRepository(Hotel).find({
        order: { name: "ASC" },
      });

       const roomType = await AppDataSource.getRepository(RoomType).find({
        order: { name: "ASC" },
      });
      const viewOptions = ["City View", "Kaaba View", "Haram View"];

      const seasonType = await AppDataSource.getRepository(SeasonCode).find({
        order: {name:"ASC"}
      });

      return res.render("room/add", {
        user: { name: "Admin" },
        hotels,
        viewOptions,
        roomType,
        hotelId,
        seasonType
      });
    } catch (err) {
      console.error("❌ Error loading hotels for room add:", err);
      return res.status(500).send("Error loading page");
    }
  };

  static createRoom = async (req: Request, res: Response) => {
    try {
      const RoomRepo = AppDataSource.getRepository(Room);
      const roomPhotoRepo = AppDataSource.getRepository(RoomPhoto);
      const roomExtraRepo = AppDataSource.getRepository(RoomExtra);

      const {room_name_id, name,room_type, description, hotel_id, maximum_guest,view_from_room, bed_type, area, price, extras } = req.body;

      // ✅ Create new room instance
      const room = RoomRepo.create({
        room_name_id:room_name_id,
        name: name,
        description: description,
        hotel_id: Number(hotel_id),
        max_guests: maximum_guest ? Number(maximum_guest) : 0,
        bed_type,
        size_sqft: area ? Number(area) : 0,
        room_type:room_type,
        price_per_night: price ? Number(price) : 0,
        view_from_room : Array.isArray(view_from_room) ? view_from_room : []
      });

      // ✅ Handle thumbnail image (temporarily)
      // const files = req.files as { [field: string]: UploadedFile[] } | undefined;
      // console.log("Files received:", files);

      // const thumb = files?.image?.[0];
      // let tempThumbPath: string | null = null;

      // if (thumb?.filename) {
      //   console.log("Thumbnail file:", thumb);
      //   tempThumbPath = thumb.path || `/uploads/${thumb.filename}`;
      //   room.image_url = `/uploads/${thumb.filename}`; // Temporary path
      // }

      // // ✅ Save room first to get the ID
      // const savedRoom = await RoomRepo.save(room);
      // console.log("Room created successfully with ID:", savedRoom.id);

      // // ✅ Create room-specific upload directory
      // const roomUploadDir = path.join(process.cwd(), "public", "uploads", "room", savedRoom.id.toString());
      // if (!fs.existsSync(roomUploadDir)) {
      //   fs.mkdirSync(roomUploadDir, { recursive: true });
      //   console.log(`Created directory: ${roomUploadDir}`);
      // }

      // // ✅ Move thumbnail to room-specific folder
      // if (thumb?.filename) {
      //   // Check multiple possible locations
      //   const possiblePaths = [
      //     thumb.path, // Original path from multer (most reliable)
      //     path.join(process.cwd(), "uploads", thumb.filename),
      //     path.join(process.cwd(), "public", "uploads", thumb.filename)
      //   ];

      //   let oldPath: string | null = null;
      //   for (const p of possiblePaths) {
      //     console.log(`Checking thumbnail path: ${p}`);
      //     if (p && fs.existsSync(p)) {
      //       oldPath = p;
      //       console.log(`Found thumbnail at: ${p}`);
      //       break;
      //     }
      //   }

      //   if (oldPath) {
      //     const newPath = path.join(roomUploadDir, thumb.filename);
      //     fs.renameSync(oldPath, newPath);
      //     savedRoom.image_url = `/uploads/room/${savedRoom.id}/${thumb.filename}`;
      //     await RoomRepo.save(savedRoom);
      //     console.log(`Moved thumbnail from ${oldPath} to: ${newPath}`);
      //   } else {
      //     console.error(`Thumbnail file not found. Checked paths:`, possiblePaths);
      //   }
      // }
      const files = req.files as {
        image?: MulterS3File[];
        gallery_images?: MulterS3File[];
      };

      // Thumbnail image
      const thumb = files?.image?.[0];
      if (thumb?.location) {
        room.image_url = thumb.location; // ✅ S3 URL
      }

      // Save room first
      const savedRoom = await RoomRepo.save(room);
      console.log("Room created:", savedRoom.id);

      // ✅ Handle gallery images - move to room-specific folder
      // const gallery = files?.gallery_images ?? [];
      // console.log("Adding gallery images:", gallery.length);

      // for (const img of gallery) {
      //   console.log("Processing gallery image:", img.filename);
        
      //   // Check multiple possible locations
      //   const possiblePaths = [
      //     img.path, // Original path from multer (most reliable)
      //     path.join(process.cwd(), "uploads", img.filename),
      //     path.join(process.cwd(), "public", "uploads", img.filename)
      //   ];

      //   let oldPath: string | null = null;
      //   for (const p of possiblePaths) {
      //     console.log(`Checking gallery path: ${p}`);
      //     if (p && fs.existsSync(p)) {
      //       oldPath = p;
      //       console.log(`Found gallery image at: ${p}`);
      //       break;
      //     }
      //   }

      //   if (oldPath) {
      //     const newPath = path.join(roomUploadDir, img.filename);
      //     fs.renameSync(oldPath, newPath);
      //     console.log(`Moved gallery image from ${oldPath} to: ${newPath}`);

      //     // Only save to database after successful file move
      //     const newPhoto = roomPhotoRepo.create({
      //       room_id: savedRoom.id,
      //       image_url: `/uploads/room/${savedRoom.id}/${img.filename}`,
      //     });
      //     console.log("Saving gallery photo:", newPhoto);
      //     await roomPhotoRepo.save(newPhoto);
      //   } else {
      //     console.error(`Gallery image not found. Checked paths:`, possiblePaths);
      //     console.error(`Skipping database save for missing file: ${img.filename}`);
      //   }
      // }
       const gallery = files?.gallery_images ?? [];

      if (gallery.length > 0) {
        const photoPromises = gallery.map(img => {
          const photo = roomPhotoRepo.create({
            room_id: savedRoom.id,
            image_url: img.location, // ✅ S3 URL
          });
          return roomPhotoRepo.save(photo);
        });

        await Promise.all(photoPromises);
        console.log(`Saved ${gallery.length} gallery images`);
      }

      // ✅ Handle room extras
      if (extras) {
        console.log("Processing extras:", extras);
        
        // extras can be an object with numeric keys or an array
        const extrasArray = Array.isArray(extras) ? extras : Object.values(extras);
        
        for (const extra of extrasArray) {
          // Only save if both name and price exist
          if (extra?.name && extra?.price) {
            const newExtra = roomExtraRepo.create({
              room_id: savedRoom.id,
              name: extra.name,
              price: Number(extra.price),
            });
            console.log("Saving room extra:", newExtra);
            await roomExtraRepo.save(newExtra);
          }
        }
      }

      return res.redirect(`/portal/room`);
    } catch (err: any) {
      console.error("❌ Error creating room:", err);
      return res.status(500).json({error: err.messsage || "Server error"});
    }
  };

  static showRoomEdit = async (req: Request, res: Response) => {
  try {
    const roomId = parseInt(req.params.id, 10);

    const roomRepo = AppDataSource.getRepository(Room);
    const hotelRepo = AppDataSource.getRepository(Hotel);
    const roomExtraRepo = AppDataSource.getRepository(RoomExtra);
    const roomPhotoRepo = AppDataSource.getRepository(RoomPhoto);
    const roomTypeRepo = AppDataSource.getRepository(RoomType);

    const viewOptions = ["City View", "Kaaba View", "Haram View"];

    // 🔥 Fetch Room WITH room_type relation
    const room = await roomRepo.findOne({
      where: { id: roomId },
      relations: ["room_type"], // important
    });

    if (!room) return res.status(404).send("Room not found");

    // 🔥 Add FK property for EJS (roomTypeId)
    // because your DB stores roomTypeId column
    room.room_type_id = room.room_type_id ?? room.room_type?.id ?? null;

    // Ensure view_from_room is always a proper array
    if (!Array.isArray(room.view_from_room)) {
      room.view_from_room = [];
    }

    // 🔥 Fetch all room types
    const room_types = await roomTypeRepo.find({
      order: { name: "ASC" },
    });

    // 🔥 Fetch hotels
    const hotels = await hotelRepo.find({ order: { name: "ASC" } });

    // 🔥 Fetch Room Extras
    const room_extras = await roomExtraRepo.find({
      where: { room_id: roomId },
      order: { name: "ASC" },
    });

    // 🔥 Fetch Room Photos
    const room_photos = await roomPhotoRepo.find({
      where: { room_id: roomId },
      order: { position: "ASC" },
    });

    room.photos = room_photos;

    const occupancies = await AppDataSource.getRepository(RoomOccupancy)
        .createQueryBuilder("occupancy")
        .leftJoinAndSelect("occupancy.room", "room")
        .where("occupancy.room_id = :roomId",{roomId})
        .orderBy("occupancy.id", "DESC")
        .getMany();

        // return res.send(occupancies);

    // 🔥 Render page
    return res.render("room/edit", {
      user: { name: "Admin" },
      room,
      hotels,
      room_extras,
      room_types,
      viewOptions,
      occupancies,
      formatDatetime,
    });

  } catch (error: any) {
    console.error("❌ Error fetching room for edit:", error);
    res
      .status(500)
      .json({ message: error.message || "Internal Server Error" });
  }
  };

  static updateRoom = async (req: Request, res: Response) => {
    try {
      const roomId = parseInt(req.params.id, 10);
      const RoomRepo = AppDataSource.getRepository(Room);
      const roomPhotoRepo = AppDataSource.getRepository(RoomPhoto);
      const roomExtraRepo = AppDataSource.getRepository(RoomExtra);

      // ✅ Find existing room
      const room = await RoomRepo.findOne({ where: { id: roomId } });
      if (!room) {
        return res.status(404).send("Room not found");
      }

      const {
        name,
        room_name_id,
        description,
        hotel_id,
        maximum_guest,
        bed_type,
        roomTypeId,
        view_from_room,
        area,
        price,
        free_cancellation_hours,
        extras,
        deleted_photos,
        deleted_extras,
        remove_thumbnail,
        photo_order,
      } = req.body;

      // ✅ Update room basic info
      room.name = name;
      room.room_name_id=room_name_id;
      room.description = description;
      room.room_type_id=roomTypeId;
      room.view_from_room = Array.isArray(view_from_room) ? view_from_room : []
      room.hotel_id = Number(hotel_id);
      room.max_guests = maximum_guest ? Number(maximum_guest) : 0;
      room.bed_type = bed_type;
      room.size_sqft = area ? Number(area) : 0;
      room.price_per_night = price ? Number(price) : 0;
      room.free_cancellation_hours = free_cancellation_hours
        ? Number(free_cancellation_hours)
        : 48;

        // ==========================
      // Files from multer-s3
      // ==========================
      const files = req.files as {
        image?: MulterS3File[];
        gallery_images?: MulterS3File[];
      };

      // ==========================
      // Remove thumbnail
      // ==========================
      if (remove_thumbnail === "1") {
        room.image_url = null;
      }

      // ==========================
      // Replace thumbnail
      // ==========================
      const thumb = files?.image?.[0];
      if (thumb?.location) {
        room.image_url = thumb.location; // ✅ S3 URL
      }

      // ✅ Save updated room
      await RoomRepo.save(room);
      console.log("Room updated successfully");

      // ✅ Handle deleted gallery photos
      // if (deleted_photos) {
      //   const photoIds = deleted_photos
      //     .split(",")
      //     .map((id: string) => parseInt(id.trim(), 10))
      //     .filter((id: number) => !isNaN(id));

      //   console.log("Photos to delete:", photoIds);

      //   for (const photoId of photoIds) {
      //     const photo = await roomPhotoRepo.findOne({ where: { id: photoId } });
      //     if (photo) {
      //       // Delete physical file
      //       const photoPath = path.join(process.cwd(), "public", photo.image_url);
      //       if (fs.existsSync(photoPath)) {
      //         fs.unlinkSync(photoPath);
      //         console.log(`Deleted photo file: ${photoPath}`);
      //       }
      //       // Delete from database
      //       await roomPhotoRepo.remove(photo);
      //       console.log(`Deleted photo record: ${photoId}`);
      //     }
      //   }
      // }

          // ✅ Handle photo reordering BEFORE handling deletions
      if (photo_order && photo_order.trim() !== "") {
        const orderPairs = photo_order.split(",");
        const updatePromises = orderPairs.map(async (pair: string) => {
          const [photoId, position] = pair.split(":").map(Number);
          if (photoId && !isNaN(position)) {
            await roomPhotoRepo.update(photoId, { position });
          }
        });
        await Promise.all(updatePromises);
        console.log("Updated photo positions");
      }

       // ==========================
      // Delete gallery photos
      // ==========================
      if (deleted_photos) {
        const photoIds = deleted_photos
          .split(",")
          .map((id: string) => parseInt(id.trim(), 10))
          .filter(Boolean);

        if (photoIds.length > 0) {
          // Optional: delete from S3 using photo.image_url
          await roomPhotoRepo.delete({ id: In(photoIds) });
        }
      }
     
       // ==========================
      // Add new gallery images
      // ==========================
      const gallery = files?.gallery_images ?? [];

      if (gallery.length > 0) {
        const photoPromises = gallery.map(img =>
          roomPhotoRepo.save(
            roomPhotoRepo.create({
              room_id: roomId,
              image_url: img.location, // ✅ S3 URL
            })
          )
        );

        await Promise.all(photoPromises);
      }

      // ✅ Handle deleted extras
      if (deleted_extras) {
        const extraIds = deleted_extras
          .split(",")
          .map((id: string) => parseInt(id.trim(), 10))
          .filter((id: number) => !isNaN(id));

        console.log("Extras to delete:", extraIds);

        for (const extraId of extraIds) {
          await roomExtraRepo.delete({ id: extraId });
          console.log(`Deleted extra: ${extraId}`);
        }
      }

      // ✅ Handle room extras (update existing or create new)
      if (extras) {
        console.log("Processing extras:", extras);

        const extrasArray = Array.isArray(extras) ? extras : Object.values(extras);

        for (const extra of extrasArray) {
          if (extra?.name && extra?.price) {
            if (extra.id) {
              // Update existing extra
              await roomExtraRepo.update(
                { id: Number(extra.id) },
                {
                  name: extra.name,
                  price: Number(extra.price),
                }
              );
              console.log(`Updated extra: ${extra.id}`);
            } else {
              // Create new extra
              const newExtra = roomExtraRepo.create({
                room_id: roomId,
                name: extra.name,
                price: Number(extra.price),
              });
              await roomExtraRepo.save(newExtra);
              console.log("Created new extra");
            }
          }
        }
      }

      return res.redirect(`/portal/room/${roomId}/edit`);
    } catch (err : any) {
      console.error("❌ Error updating room:", err);
      return res.status(500).json({ error: err.message || "Server error" });
    }
  };

  static showBooking = async (req: Request, res: Response) => {
    try {
      const bookingRepo = AppDataSource.getRepository(Booking2);
      const userRepo = AppDataSource.getRepository(User);
      const hotelRepo = AppDataSource.getRepository(Hotel);
      const roomRepo = AppDataSource.getRepository(Room);
      const roomOptionRepo = AppDataSource.getRepository(RoomOccupancy);
      const bookingRoomRepo = AppDataSource.getRepository(BookingRoom);
      const bookingCustomerRepo = AppDataSource.getRepository(BookingCustomer);

      // Fetch all bookings
      const bookings = await bookingRepo.find({
        order: { created_at: "DESC" } // Show newest first
      });

      // Enrich each booking with related info
      const bookingData = await Promise.all(
        bookings.map(async (booking) => {
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

          console.log("booking data ;;;;;;", roomsWithDetails);

          return {
            ...booking,
            user,
            customer,
            hotel,
            bookingRooms: roomsWithDetails,
            totalRooms: bookingRooms.length,
            nights
          };
        })
      );

      // Render to EJS view
      return res.render("bookings/list", { bookings: bookingData });
    } catch (error: any) {
      console.log("error in show booking ;;", error);
      return handleError(res, error);
    }
  };

  static showBookingDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const bookingRepo = AppDataSource.getRepository(Booking2);
      const userRepo = AppDataSource.getRepository(User);
      const hotelRepo = AppDataSource.getRepository(Hotel);
      const roomRepo = AppDataSource.getRepository(Room);
      const roomOptionRepo = AppDataSource.getRepository(RoomOccupancy);
      const bookingRoomRepo = AppDataSource.getRepository(BookingRoom);
      const bookingCustomerRepo = AppDataSource.getRepository(BookingCustomer);

      // Fetch the booking
      const booking = await bookingRepo.findOne({ where: { id: parseInt(id) } });
      
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

      return res.render("bookings/view", { booking: bookingData });
    } catch (error: any) {
      console.log("error in show booking details:", error);
      return handleError(res, error);
    }
  };

  static renderRoomTypePage = async (req: Request, res: Response) => {
    try {
      const roomTypeRepo = AppDataSource.getRepository(RoomType);
      const roomTypes = await roomTypeRepo.find({
        order: { created_at: "DESC" },
      });

      res.render("room/roomType", {
        roomTypes,
        success: req.query.success,
        error: req.query.error,
      });
    } catch (error) {
      console.error("Error fetching room types:", error);
      res.status(500).render("room/roomType", {
        roomTypes: [],
        error: "Failed to load room types",
      });
    }
  };

  // Create new room type
  static createRoomType =async (req: Request, res: Response)=> {
    try {
         const roomTypeRepo = AppDataSource.getRepository(RoomType);
      const { name } = req.body;

      if (!name || name.trim() === "") {
        return res.redirect("/portal/room/roomType?error=Room type name is required");
      }

      // Check if room type already exists
      const existingRoomType = await roomTypeRepo.findOne({
        where: { name: name.trim() }
      });

      if (existingRoomType) {
        return res.redirect("/portal/room/roomType?error=Room type already exists");
      }

      const roomType = roomTypeRepo.create({
        name: name.trim()
      });

      await roomTypeRepo.save(roomType);

      res.redirect("/portal/room/roomType");
    } catch (error) {
      console.error("Error creating room type:", error);
      res.redirect("/portal/room/roomType?error=Failed to create room type");
    }
  }

  // Update room type
  static updateRoomType = async(req: Request, res: Response)=> {
    try {
      const roomTypeRepo = AppDataSource.getRepository(RoomType);
      const { id } = req.params;
      const { name } = req.body;

      if (!name || name.trim() === "") {
        return res.redirect("/portal/room/roomType?error=Room type name is required");
      }

      const roomType = await roomTypeRepo.findOne({
        where: { id: parseInt(id) }
      });

      if (!roomType) {
        return res.redirect("/portal/room/roomType?error=Room type not found");
      }

      // Check if new name already exists (excluding current room type)
      const existingRoomType = await roomTypeRepo
        .createQueryBuilder("rt")
        .where("rt.name = :name", { name: name.trim() })
        .andWhere("rt.id != :id", { id: parseInt(id) })
        .getOne();

      if (existingRoomType) {
        return res.redirect("/portal/room/roomType?error=Room type name already exists");
      }

      roomType.name = name.trim();
      await roomTypeRepo.save(roomType);

      res.redirect("/portal/room/roomType?success=Room type updated successfully");
    } catch (error) {
      console.error("Error updating room type:", error);
      res.redirect("/portal/room/roomType?error=Failed to update room type");
    }
  }

  // Delete room type
  static deleteRoomType = async(req: Request, res: Response)=> {
    try {
      const roomTypeRepo = AppDataSource.getRepository(RoomType);
      const { id } = req.params;

      const roomType = await roomTypeRepo.findOne({
        where: { id: parseInt(id) },
        relations: ["rooms"]
      });

      if (!roomType) {
        return res.redirect("/portal/room/roomType?error=Room type not found");
      }

      // Check if room type is being used by any rooms
      if (roomType.rooms && roomType.rooms.length > 0) {
        return res.redirect(
          "/portal/room/roomType?error=Cannot delete room type that is assigned to rooms"
        );
      }

      await roomTypeRepo.remove(roomType);

      res.redirect("/portal/room/roomType?success=Room type deleted successfully");
    } catch (error) {
      console.error("Error deleting room type:", error);
      res.redirect("/portal/room/roomType?error=Failed to delete room type");
    }
  }

  // Get all room types (API endpoint)
  static getAllRoomTypes =  async(req: Request, res: Response)=> {
    try {
      const roomTypeRepo = AppDataSource.getRepository(RoomType);
      const roomTypes = await roomTypeRepo.find({
        order: { name: "ASC" }
      });

      res.json({
        success: true,
        data: roomTypes
      });
    } catch (error) {
      console.error("Error fetching room types:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch room types"
      });
    }
  }

  // season code 
  static getAllSeasonCode = async (req: Request, res: Response) => {
  try {
    const seasonRepo = AppDataSource.getRepository(SeasonCode);
    let seasonCodes = await seasonRepo.find({ order: { created_at: "DESC" } });

    // Format dates for listing page
    seasonCodes = seasonCodes.map(item => ({
      ...item,
      start_date_formatted: item.start_date
        ? new Date(item.start_date).toISOString().split("T")[0]
        : "",
      end_date_formatted: item.end_date
        ? new Date(item.end_date).toISOString().split("T")[0]
        : "",
    }));

    return res.render("season/list", { seasonCodes });

  } catch (error) {
    console.error("Error fetching season codes:", error);
    return res.status(500).send("Failed to fetch season codes");
  }
  };

  // Show create form
  static showCreateSeasonCode = async (req: Request, res: Response) => {
   try {
      return res.render("season/add");
    } catch (err) {
      console.error("❌ Error loading hotel", err);
      return res.status(500).send("Error loading page");
    }
  };

  // Create new season code
  static createSeasonCode = async (req: Request, res: Response) => {
    try {
      const { season_code_id, name, start_date, end_date,description } = req.body;

      const seasonRepo = AppDataSource.getRepository(SeasonCode);

      // Optional: Check if season_code_id already exists
      const existing = await seasonRepo.findOne({ where: { season_code_id } });
      if (existing) {
        return res.redirect("/portal/season/add?error=Season code already exists");
      }

      const newSeason = seasonRepo.create({
        season_code_id,
        name,
        start_date,
        end_date,
        description
      });

      await seasonRepo.save(newSeason);
      return res.redirect("/portal/season/add?success=Season code created successfully");
    } catch (error) {
      console.error("Error creating season code:", error);
      return res.redirect("/portal/season/add?error=Failed to create season code");
    }
  };

  // Show edit form
  static showEditSeasonCode = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const seasonRepo = AppDataSource.getRepository(SeasonCode);
      const season = await seasonRepo.findOne({ where: { id } });

      if (!season) {
        return res.redirect("season/edit?error=Season code not found");
      }

      return res.render("season/edit", { season });
    } catch (error) {
      console.error("Error showing edit form:", error);
      return res.redirect("season/edit?error=Failed to load page");
    }
  };

  // Update season code
  static updateSeasonCode = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { season_code_id, name, start_date, end_date } = req.body;

      const seasonRepo = AppDataSource.getRepository(SeasonCode);
      const season = await seasonRepo.findOne({ where: { id } });

      if (!season) {
        return res.redirect("/portal/season/edit?error=Season code not found");
      }

      season.season_code_id = season_code_id;
      season.name = name;
      season.start_date = start_date;
      season.end_date = end_date;

      await seasonRepo.save(season);
    
      return res.redirect("/portal/season/list");
    } catch (error) {
      console.error("Error updating season code:", error);
      return res.redirect(`/season/edit/${req.params.id}?error=Failed to update`);
    }
  };

  // Delete season code
  static deleteSeasonCode = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const seasonRepo = AppDataSource.getRepository(SeasonCode);
      const season = await seasonRepo.findOne({ where: { id } });

      if (!season) {
        return res.redirect("/season-code?error=Season code not found");
      }

      await seasonRepo.remove(season);
      return res.redirect("/season-code?success=Season code deleted successfully");
    } catch (error) {
      console.error("Error deleting season code:", error);
      return res.redirect("/season-code?error=Failed to delete season code");
    }
  };

  static add_room_option = async (req: Request, res: Response) =>{
    try {
      let hotelId = req.query.hotelId as string | undefined;
      let roomId = req.query.roomId as string | undefined;

       const hotels = await AppDataSource.getRepository(Hotel).find({
        order: { name: "ASC" },
      });

      let rooms = {};
      if(hotelId){
         rooms = await AppDataSource.getRepository(Room).find({
        where: {hotel_id: parseInt(hotelId)},
         relations: ["room_type"],
        order: { name: "ASC" },
        });
      }
     

      console.log("rooms coming ;;;;;;;;", rooms);

      return res.render("room/room-option-add", {
        user: { name: "Admin" },
        hotels,
        rooms,
        hotelId,
        roomId
      });
    } catch (error : any) {
      console.log("error in add room option ;;;", error);
        return res.status(500).json({ error: error.message || "Server error" });
    }
  }

  static createRoomOccupancy = async (req: Request, res: Response) => {
    try {
      // console.log("body data coming ;;;;;;", req.body);
      const {
        hotel_id,
        room_id,
        description,
        maximum_guest,
        room_occupation,
        meal_plan,
        room_option_id
      } = req.body;


      // Create a new occupancy entry
      const roomOccupancyRepo = AppDataSource.getRepository(RoomOccupancy);
      const roomOptionPhotoRepo = AppDataSource.getRepository(RoomOccupancyPhoto);


      const occupancy = roomOccupancyRepo.create({
        room_id: room_id,
        occupancy: room_occupation,
        max_guests: maximum_guest,
        website_description: description,
        base_meal_plan: meal_plan,
        room_option_id:room_option_id
      });

      const files = req.files as {
        image?: MulterS3File[];
        gallery_images?: MulterS3File[];
      };

      // Thumbnail image
      const thumb = files?.image?.[0];

      // console.log("thumbnail coming ;;;;;;;", thumb);

      // return res.send("testing ;;;;;;;;");
      if (thumb?.location) {
        occupancy.image_url = thumb.location; // ✅ S3 URL
      }

      console.log("occupancy value ;;;;;;;;;", occupancy);

      const savedRoomOption = await roomOccupancyRepo.save(occupancy);

      const gallery = files?.gallery_images ?? [];

      console.log("gallary images coming ;;;;;;;;", gallery);

      if (gallery.length > 0) {
        const photoPromises = gallery.map(img => {
          const photo = roomOptionPhotoRepo.create({
            room_occupancy_id: savedRoomOption.id,
            image_url: img.location, // ✅ S3 URL
          });
          return roomOptionPhotoRepo.save(photo);
        });

        await Promise.all(photoPromises);
        console.log(`Saved ${gallery.length} gallery images`);
      }

      return res.redirect(`/portal/room-option/add?hotelId=${hotel_id}&roomId=${room_id}`);
    } catch (err: any) {
      console.error("Error saving room occupancy:", err);
      return res.status(500).json({error:err.message || "Internal Server Error"});
    }
  }

  static editRoomOccupancy = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      const roomOptionPhotoRepo = AppDataSource.getRepository(RoomOccupancyPhoto);
      const occupancy = await AppDataSource.getRepository(RoomOccupancy).findOne({
        where: { id: Number(id) },
        relations: ["room"],
      });

       const hotels = await AppDataSource.getRepository(Hotel).find({
        order: { name: "ASC" },
      });

      let rooms = {};
      if(occupancy && occupancy.room && occupancy.room.hotel_id){
         rooms = await AppDataSource.getRepository(Room).find({
                    where: {hotel_id: occupancy.room.hotel_id},
                    relations: ["room_type"],
                    order: { name: "ASC" },
                  });
      }

      if (!occupancy) {
        return res.status(404).send("Room occupancy not found");
      }

       // 🔥 Fetch Room Photos
      const room_option_photos = await roomOptionPhotoRepo.find({
        where: { room_occupancy_id: parseInt(id) },
        order: { created_at: "ASC" },
      });

      // return res.send(room_option_photos);

      occupancy.photos = room_option_photos;

      return res.render("room/occupancy_edit", { occupancy, hotels, rooms, room_option_photos });
    } catch (error) {
      console.error("Edit page error:", error);
      return res.status(500).send("Internal Server Error");
    }
  };

  // static updateRoomOccupancy = async (req: Request, res: Response) => {
  //   try {
  //     const id = req.params.id;

  //     const {
  //       room_id,
  //       occupancy,
  //       max_guests,
  //       base_meal_plan,
  //       website_description,
  //       room_option_id
  //     } = req.body;

  //     const repo = AppDataSource.getRepository(RoomOccupancy);

  //     const existing = await repo.findOneBy({ id: Number(id) });

  //     if (!existing) {
  //       return res.status(404).send("Record not found");
  //     }

  //     await repo.update(id, {
  //       room_id,
  //       occupancy,
  //       max_guests,
  //       base_meal_plan,
  //       website_description,
  //       room_option_id
  //     });

  //     return res.redirect(`/portal/room/occupancy/${id}`);
  //   } catch (error) {
  //     console.error("Update error:", error);
  //     return res.status(500).send("Internal Server Error");
  //   }
  // };

  static updateRoomOccupancy = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      const {
        room_id,
        occupancy,
        max_guests,
        base_meal_plan,
        website_description,
        room_option_id,
        remove_thumbnail,
        deleted_photos,
        rooms_left
      } = req.body;

      const roomOccupancyRepo = AppDataSource.getRepository(RoomOccupancy);
      const roomOccupancyPhotoRepo = AppDataSource.getRepository(RoomOccupancyPhoto);

      // Find existing record
      const existing = await roomOccupancyRepo.findOneBy({ id: Number(id) });

      if (!existing) {
        return res.status(404).send("Record not found");
      }

      // Prepare update data
      const updateData: any = {
        room_id,
        occupancy,
        max_guests,
        base_meal_plan,
        website_description,
        room_option_id,
        rooms_left
      };

      // Handle file uploads
      const files = req.files as {
        image?: MulterS3File[];
        gallery_images?: MulterS3File[];
      };

      // Handle thumbnail image
      const newThumbnail = files?.image?.[0];
      
      if (remove_thumbnail === "1") {
        // User wants to remove the thumbnail
        updateData.image_url = null;
      } else if (newThumbnail?.location) {
        // User uploaded a new thumbnail
        updateData.image_url = newThumbnail.location;
      }
      // If neither condition is true, keep the existing thumbnail (don't update image_url)

      console.log("updated data ;;;;;;;;", updateData);

      // Update the room occupancy record
      await roomOccupancyRepo.update(id, updateData);

      // Handle deleted gallery images
      if (deleted_photos) {
        const photoIdsToDelete = deleted_photos.split(',').filter(Boolean).map(Number);
        
        if (photoIdsToDelete.length > 0) {
          await roomOccupancyPhotoRepo.delete(photoIdsToDelete);
          console.log(`Deleted ${photoIdsToDelete.length} gallery images`);
        }
      }

      // Handle new gallery images
      const newGalleryImages = files?.gallery_images ?? [];

      console.log("gallary images coming ;;;;;;;;", newGalleryImages);
      
      if (newGalleryImages.length > 0) {
        const photoPromises = newGalleryImages.map(img => {
          const photo = roomOccupancyPhotoRepo.create({
            room_occupancy_id: Number(id),
            image_url: img.location, // S3 URL
          });
          return roomOccupancyPhotoRepo.save(photo);
        });

        await Promise.all(photoPromises);
        console.log(`Saved ${newGalleryImages.length} new gallery images`);
      }

      return res.redirect(`/portal/room/occupancy/${id}`);
    } catch (error: any) {
      console.error("Update error:", error);
      return res.status(500).json({error:error.message || "Internal Server Error"});
    }
  };

  static deleteRoomOccupancy = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

       let room_occupancies = await AppDataSource.getRepository(RoomOccupancy).findOne({
        where: { id: Number(id) },
      });
      await AppDataSource.getRepository(RoomOccupancy).delete(id);
     

      console.log("room occupancies ;;;;;;", room_occupancies);
      let room_id = room_occupancies ? room_occupancies.room_id : 12;
      
      console.log("room occupancies id ;;;;;;", room_id);
      return res.redirect(`/portal/room/${room_id}/edit`);
    } catch (error) {
      console.error("Delete error:", error);
      return res.status(500).send("Internal Server Error");
    }
  };

  static showRoomOccupancy = async (req: Request, res: Response) => {
    try{
       const occupancies = await AppDataSource.getRepository(RoomOccupancy)
        .createQueryBuilder("occupancy")
        .leftJoinAndSelect("occupancy.room", "room")
        .leftJoinAndSelect("room.hotel", "hotel") 
        .orderBy("occupancy.id", "DESC")
        .getMany();

        // console.log("getting occupancies ;;;;;;;;", occupancies);

        // return res.send(occupancies)

       return res.render("room/room_occupancy_list", {
                  user: { name: "Admin" },
                  occupancies,
                  formatDatetime,
                });
    }catch(error: any){
      console.error("Error fetching room occupancy details:", error);
      return res.json({ success: false, message: error.message || "Failed to fetch details" });
    }
  }

  // Add this controller method
  // static showBookingDetails = async (req: Request, res: Response) => {
  //   try {
  //     const { id } = req.params;
  //     const bookingRepo = AppDataSource.getRepository(Booking2);
  //     const userRepo = AppDataSource.getRepository(User);
  //     const hotelRepo = AppDataSource.getRepository(Hotel);
  //     const roomRepo = AppDataSource.getRepository(Room);
  //     const bookingRoomRepo = AppDataSource.getRepository(BookingRoom);
  //     const bookingCustomerRepo = AppDataSource.getRepository(BookingCustomer);
  //     const paymentRepo = AppDataSource.getRepository(Payment);

  //     const booking = await bookingRepo.findOne({ where: { id: parseInt(id) } });

  //     if (!booking) {
  //       return res.status(404).render("error", { message: "Booking not found" });
  //     }

  //     // Get all related data
  //     const user = booking.user_id
  //       ? await userRepo.findOne({ where: { id: booking.user_id } })
  //       : null;

  //     const customer = await bookingCustomerRepo.findOne({
  //       where: { booking_id: booking.id }
  //     });

  //     const hotel = await hotelRepo.findOne({
  //       where: { id: booking.hotel_id }
  //     });

  //     const bookingRooms = await bookingRoomRepo.find({
  //       where: { booking_id: booking.id }
  //     });

  //     const roomsWithDetails = await Promise.all(
  //       bookingRooms.map(async (br) => {
  //         const room = await roomRepo.findOne({ where: { id: br.room_id } });
  //         return { ...br, roomDetails: room };
  //       })
  //     );

  //     const payments = await paymentRepo.find({
  //       where: { booking_id: booking.id }
  //     });

  //     const nights = Math.ceil(
  //       (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) /
  //       (1000 * 60 * 60 * 24)
  //     );

  //     return res.render("bookings/details", {
  //       booking: {
  //         ...booking,
  //         user,
  //         customer,
  //         hotel,
  //         bookingRooms: roomsWithDetails,
  //         payments,
  //         nights
  //       }
  //     });
  //   } catch (error: any) {
  //     console.log("error in show booking details:", error);
  //     return handleError(res, error);
  //   }
  // };

  // Add cancel booking method
  static cancelBooking = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const bookingRepo = AppDataSource.getRepository(Booking2);

      const booking = await bookingRepo.findOne({ where: { id: parseInt(id) } });

      if (!booking) {
        return res.json({ success: false, message: "Booking not found" });
      }

      if (booking.status === "cancelled") {
        return res.json({ success: false, message: "Booking already cancelled" });
      }

      booking.status = "cancelled";
      await bookingRepo.save(booking);

      return res.json({
        success: true,
        message: "Booking cancelled successfully"
      });
    } catch (error: any) {
      console.log("error in cancel booking:", error);
      return res.json({ success: false, message: error.message });
    }
  };

  static update_rooms_left = async (req: Request, res: Response) => {
    try {
      await AppDataSource
                .getRepository(RoomOccupancy)
                .createQueryBuilder()
                .update(RoomOccupancy)
                .set({ rooms_left: 20 })
                .execute();

      return res.json({
        success: true,
        message: "Rooms left updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating rooms left:", error);
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    } 
  }

}