import express from 'express';
import { HotelController } from "../controllers/HotelController";
import PostgresExportController from '../controllers/PostgresExportController';
import { PricingController } from '../controllers/PricingController';
import { ApiController } from '../controllers/ApiController';
import { ContactUsController } from '../controllers/ContactUsController';
import { TajApiController } from '../controllers/TajApiController';

console.log("this file is running ;;;;;;;;;;s")
const router = express.Router();



// GET /api and /api/get-hotels
router.get("/get-hotels", HotelController.getHotels);
router.get("/get-hotels-two", ApiController.getHotelsTwo);
router.get("/get-hotels/:id", HotelController.getHotelById);
router.get("/get-hotels/:id/rooms", HotelController.getHotelRooms);
router.post("/get-hotels/:id/bookings", HotelController.createBooking);
router.get("/hotel-extras", HotelController.getHotelExtras);
router.get("/get-deals-rooms/:id", ApiController.get_deals_rooms)
router.get("/get-hotels-rooms/:id", ApiController.get_hotel_rooms)

router.post("/room-search", TajApiController.search);
router.post("/room-search-two", TajApiController.search_two);
router.get("/occupancy/:room_option_id", TajApiController.search_room);
router.post("/search-room", TajApiController.search_rooms_three);
router.get("/taj-deals", TajApiController.taj_deals);
router.get("/taj-deals/:id", TajApiController.taj_deal_detail);
router.get("/room/:room_name_id", TajApiController.get_room_by_name_id);


// Export code 
router.get("/hotel-data", PostgresExportController.hotel_csv_post);
router.get("/room-type-data", PostgresExportController.room_type_csv_post);
router.get("/room-data", PostgresExportController.room_csv_post);
router.get("/room-option-data", PostgresExportController.room_option_csv_post);
router.get("/season-data", PostgresExportController.season_option_csv_post);
router.get("/pricing-data", PostgresExportController.pricing_csv_option);
router.get("/pricing-data-one", PostgresExportController.pricing_csv_option_one);
router.get("/currency-csv-post", PostgresExportController.currency_csv_post);
router.get("/hotel-markup-csv-post", PostgresExportController.hotel_markup_csv_post);

router.get("/delete-prices", PricingController.deleteAllPrices);

router.get("/deals", ApiController.getDeals);
router.get("/get-deals-details", ApiController.getDealsDetails);
router.get("/get-rooms-details", ApiController.getRoomsDetails);
router.post("/bookings/create", ApiController.createBooking);
router.get("/booking/:booking_id",ApiController.getBookingById);
router.get("/booking/number/:bookingNumber",ApiController.getBookingByNumber);
router.post("/create-payment-intent",ApiController.create_payment_intent);
router.post("/bookings/update-payment-status",ApiController.update_payment_status);
router.post("/booking/search",ApiController.booking_search);
router.post("/booking/details",ApiController.booking_detail);
// router.get("/customer-email",ApiController.customer_email);

router.post('/contact-us', ContactUsController.create);

router.post('/create-payment-intent-tajpark', ApiController.create_payment_intent_tajpark);
router.post(
  '/stripe-webhook-tajpark',
  express.raw({ type: 'application/json' }),
  ApiController.stripe_webhook_tajpark
);

export default router;
