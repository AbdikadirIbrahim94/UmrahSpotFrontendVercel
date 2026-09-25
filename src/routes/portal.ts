import express, { Request, Response } from 'express';
import multer from 'multer';
import { HotelController } from "../controllers/HotelController";
import { UserController } from '../controllers/UserController';
import { DashboardController } from '../controllers/DashboradController';
import { PricingController } from '../controllers/PricingController';
import PostgresExportController from '../controllers/PostgresExportController';
import { isAdmin } from '../middleware/auth';
import { DealController } from '../controllers/DealController';
import multerS3 from "multer-s3";
import path from "path";
import crypto from "crypto";
import { s3 } from "../utils/aws";
import { ContactUsController } from '../controllers/ContactUsController';


console.log("this file is running ;;;;;;;;;;s")
const router = express.Router();

type MulterS3Callback = (error: any, key?: string) => void;
// Multer for file upload
// const upload = multer({
//   dest: "uploads/",
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// });
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME!,
    // acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,

    key: (_req: Request, file: Express.Multer.File, cb: MulterS3Callback) => {
      const ext = path.extname(file.originalname);
      const fileName = crypto.randomBytes(16).toString("hex");
      cb(null, `hotels/taj_park_hotel/${Date.now()}-${fileName}${ext}`);
    },
  }),
});

// Configure multer for file upload
const upload2 = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});


// GET /api and /api/get-hotels
// router.get('/', HotelController.getHotels);
router.get("/login", UserController.showLoginPage);
router.post("/login", UserController.postLogin);
router.get("/logout",UserController.Logout)
router.get("/dashboard",isAdmin, UserController.getDashboard);
router.get("/city", isAdmin, DashboardController.showCity);
router.get("/city/add", isAdmin, DashboardController.addCity);
router.post("/city/add", isAdmin, DashboardController.saveCity);
router.get("/hotel", isAdmin, DashboardController.showHotel);
// router.get("/booking", isAdmin, DashboardController.showBooking);
router.get("/booking",  PricingController.list_bookings_tajpark);
router.get("/booking/:id", PricingController.get_booking_detail_tajpark);
router.delete("/booking/:id", PricingController.delete_booking_tajpark);
router.get("/hotel-extra", isAdmin, DashboardController.showHotelExtra);
router.get("/hotel-extra/add", isAdmin, DashboardController.addHotelExtra);
router.get("/hotel-extra/edit/:id", isAdmin, DashboardController.editHotelExtra);
router.post("/hotel-extra/update/:id", isAdmin, DashboardController.updateHotelExtra);
router.post("/hotel-extra/:id/delete", isAdmin, DashboardController.deleteHotelExtra);
router.post("/hotel-extra/add", isAdmin, DashboardController.saveHotelExtra);
router.get("/room", isAdmin, DashboardController.showRoom); 
router.get("/hotel/:id/edit", isAdmin, DashboardController.showHotelEdit);
router.post("/hotel/:id/delete", isAdmin, DashboardController.deleteHotel);
router.get("/room/:id/edit", isAdmin, DashboardController.showRoomEdit);
router.get("/city/:id/edit", isAdmin, DashboardController.showCityEdit);
router.get("/hotel/add", isAdmin, DashboardController.showHotelAdd);
router.get("/room/add", isAdmin, DashboardController.showRoomAdd);
router.post("/city/:id/update", isAdmin, DashboardController.updateCity);
router.post("/city/:id/delete", isAdmin, DashboardController.deleteCity);
router.post(
  "/hotel/create",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery_images", maxCount: 30 },
  ]),
  DashboardController.createHotel
);
router.post(
  "/room/create",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery_images", maxCount: 10 },
  ]),
  DashboardController.createRoom
);
router.post(
  "/hotel/:id/update",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery_images", maxCount: 30 },
  ]),
  DashboardController.updateHotel
);
router.post('/room/update/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery_images', maxCount: 30 }
]), DashboardController.updateRoom);

// Admin Routes - Render page
router.get("/room/roomType", (req, res) => 
  DashboardController.renderRoomTypePage(req, res)
);

// Create room type
router.post("/room/roomType/create", (req, res) => 
  DashboardController.createRoomType(req, res)
);

// Update room type
router.post("/room/roomType/update/:id", (req, res) => 
  DashboardController.updateRoomType(req, res)
);

// Delete room type
router.post("/room/roomType/delete/:id", (req, res) => 
  DashboardController.deleteRoomType(req, res)
);

// API Routes - Get all room types (for dropdowns in room forms)
router.get("/room/roomType", (req, res) => 
  DashboardController.getAllRoomTypes(req, res)
);

router.get("/room-option/add", DashboardController.add_room_option);
router.post("/room-option/add",upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery_images", maxCount: 30 },
  ]), DashboardController.createRoomOccupancy);
router.get("/room/occupancy/:id", DashboardController.editRoomOccupancy);
router.post("/room/occupancy/update/:id",upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery_images", maxCount: 30 },
  ]),DashboardController.updateRoomOccupancy);
router.post("/room/occupancy/delete/:id",DashboardController.deleteRoomOccupancy);
router.get("/room/room-options",DashboardController.showRoomOccupancy);
router.get("/update-rooms-left",DashboardController.update_rooms_left);

router.get("/pricing/add", isAdmin, PricingController.addPricing);
router.post("/pricing/create", isAdmin, PricingController.createRoomPriceV2);
// router.get("/pricing",  PricingController.getPricingList);
router.get("/pricing", isAdmin, PricingController.getPricingListV2);
router.get("/pricing/:id/edit",isAdmin,  PricingController.editPricingList);
router.get("/pricing-v2/:id/edit",isAdmin,  PricingController.editPricingV2);
// router.post("/pricing/update/:id",  PricingController.updateRoomPrice);
router.post("/pricing-v2/:id/update", isAdmin, PricingController.updateRoomPriceV2);
router.post("/pricing-v2/:id/delete",isAdmin,PricingController.deleteRoomPriceV2)
router.get("/rooms/options/:hotel_id",isAdmin,  PricingController.getRoomOptionsByHotel);

router.post("/get-season-details", isAdmin, PricingController.getSeasonDetails);
router.get("/get-season-details", isAdmin, PricingController.getSeasonDetails);

router.get("/contacts",  ContactUsController.getAll);
router.post("/contact/:id/delete", isAdmin, ContactUsController.delete);




// router.post(
//   "/room/create",
//   upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "gallery_images", maxCount: 10 },
//   ]),
//   DashboardController.createRoom
// );

// router.get("/room", (req, res) => 
//   DashboardController.renderRoomTypePage(req, res)
// );
router.get("/season/add", DashboardController.showCreateSeasonCode);
router.get("/deal/add", DealController.addDeal);
// Create room type

router.post("/season/create", (req, res) => 
  DashboardController.createSeasonCode(req, res)
);

// Update room type
router.post("/season/update/:id", (req, res) => 
  DashboardController.updateSeasonCode(req, res)
);

// Delete room type
router.post("/season/delete/:id", (req, res) => 
  DashboardController.deleteSeasonCode(req, res)
);

// API Routes - Get all room types (for dropdowns in room forms)
router.get("/season/list", (req, res) => 
  DashboardController.getAllSeasonCode(req, res)
);

router.get("/season/:id/edit", DashboardController.showEditSeasonCode);
router.post("/pricing/import",upload2.single("csvFile"), PostgresExportController.importCSV);

router.get("/rooms-data/:id", DealController.getroomdataByHotelId);
router.get("/hotel-data/:id", DealController.gethoteldataByCityId);
router.get("/room-option-data/:id", DealController.getroomoptiondataByRoomId);
router.post("/deal/add", DealController.createDeal);
router.get("/room-option-price/:id", DealController.getroomprice);
router.get("/deal/list", DealController.getdealList);
router.get("/deal/:id/edit", DealController.dealEditpage);
router.post("/deal/update/:id", DealController.updateDeal);
router.post("/deal/:id/delete", DealController.deleteDeal);

router.get("/currency-rates", PricingController.getCurrencyRates);
router.post("/currency-rates/update", PricingController.updateCurrencyRates);
router.get("/currency-rates/delete/:id", PricingController.deleteCurrencyRate);

router.get("/currency/hotel-markup-rates", PricingController.getHotelMarkupRates);
router.post("/currency/hotel-markup-rates/update", PricingController.updateHotelMarkupRates);


export default router;
