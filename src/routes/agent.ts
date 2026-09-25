import express from "express"
import { AgentController } from "../controllers/AgentController";
import { authenticateAgent, checkAuth, logoutAgent } from "../middleware/agent.middleware";


const router = express.Router()

router.post("/signup",AgentController.signup);

router.post("/login",AgentController.login);

router.get("/hotel-list",authenticateAgent,AgentController.getHotelList);

router.post("/GroupBooking",authenticateAgent,AgentController.createGroupBooking);

router.get("/GroupBooking", authenticateAgent, AgentController.bookingDetails);

router.get("/GroupBooking/:bookingId", authenticateAgent, AgentController.bookingDetailsById);

router.post('/:id/edit', AgentController.updateBookingStatus);

router.get("/occupancy/:roomId",AgentController.getRoomOccupancy);

router.get("/checkAuth",checkAuth)

router.get("/logoutAgent",logoutAgent)
export default router ;