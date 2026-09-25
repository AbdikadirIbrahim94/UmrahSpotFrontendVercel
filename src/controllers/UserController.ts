import { Request, Response } from "express";
import { AppDataSource } from "../db/data-source";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import { Hotel } from "../entities/Hotel";
import { Room } from "../entities/Room";
import { RoomOccupancy } from "../entities/RoomOccupancy";
import { Deal } from "../entities/Deal";
import { Booking2 } from "../entities/Booking2";
import { Not, In } from "typeorm";
import { BookingTajpark } from "../entities/BookingTajpark";

export class UserController {
  static async showLoginPage(req: Request, res: Response) {
    try {
      // You can also pass data to the view if needed
      res.render("login", { title: "User Login" });
    } catch (err) {
      console.error("❌ Error rendering login page:", err);
      res.status(500).send("Server error");
    }
  }

  // ✅ Handle login form submission
  // static async postLogin(req: Request, res: Response) {
  //   console.log("req body ;;;;", req.body);
  //   const { email, password } = req.body;

  //   try {
  //     const userRepo = AppDataSource.getRepository(User);
  //     const user = await userRepo.findOne({ where: { email } });
    
  //   console.log("email ;;;;;", email);
  //   console.log("password ;;;;", password)
  //     if(email != "admin@gmail.com" && password != "Admin1234!"){
  //       return res.render("login", { error: "Invalid email or password" });
  //     }

  //     // ✅ Redirect to dashboard (can later set session or JWT)
  //     return res.redirect("/portal/dashboard");
  //   } catch (error) {
  //     console.error("❌ Login error:", error);
  //     return res.render("login", { error: "Server error. Try again later." });
  //   }
  // }.

  static async postLogin(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      console.log("email ;;", email);
      console.log("password ;;", password);
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { email } });

      console.log("user we have ;;;", user);

      if (!user) {
        return res.render("login", { error: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      console.log("password match ;;;;", isMatch);
      if (!isMatch) {
        return res.render("login", { error: "Invalid email or password" });
      }

      // Save admin session
      req.session.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      return res.redirect("/portal/dashboard");

    } catch (error) {
      console.error("Login error:", error);
      return res.render("login", { error: "Server error. Try again later." });
    }
  }

    // ✅ Render dashboard after login
  static async getDashboard(req: Request, res: Response) {
    try {
      const hotelId = 32;
      const hotelRepo = AppDataSource.getRepository(Hotel);
      const roomRepo = AppDataSource.getRepository(Room);
      const occupancyRepo = AppDataSource.getRepository(RoomOccupancy);
      const dealRepo = AppDataSource.getRepository(Deal);
      const bookingRepo = AppDataSource.getRepository(BookingTajpark);

      const totalHotels = await hotelRepo.count({ where: { id: hotelId }});
      const totalRooms = await roomRepo.count({
          where: {
              hotel_id: hotelId,
              id: Not(In([66, 49]))
          }
      });
      const totalRoomOccupancy = await occupancyRepo
                                    .createQueryBuilder("occupancy")
                                    .leftJoin("occupancy.room", "room")
                                    .where("room.hotel_id = :hotelId", { hotelId: 32 })
                                    .getCount();
      const totaldeals = await dealRepo.count();
      const totalbookings = await bookingRepo.count();

      return res.render("dashboard", {
        user: { name: "Admin" },
        stats: {
          totalHotels,
          totalRooms,
          totalRoomOccupancy,
          totaldeals,
          totalbookings
        }
      });
    } catch (error) {
      console.error("Dashboard Error:", error);
      return res.status(500).send("Server Error");
    }
  }

  static async Logout(req: Request, res: Response) {
  console.log('Logout requested');
  
  // Safely destroy the entire session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Could not log out.");
    }
    
    // // Optional: Clear the session cookie from the browser
    // res.clearCookie('connect.sid'); // Replace 'connect.sid' if you use a custom cookie name

    return res.redirect("/portal/login");
  });
} 
}
