import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "../src/db/data-source";
import apiRoutes from "../src/routes/api";
import path from "path";
import portalRoutes from "../src/routes/portal";
import { join } from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ✅ Middleware
app.use(express.json());
app.use(cors());

app.set("trust proxy", true);

app.use(async (req, res, next) => {
  const currentSiteUrl = `${req.protocol}://${req.get("host")}`;
  const fullUrl = `${currentSiteUrl}${req.originalUrl}`;

  // Assign it to app.locals.myGlobalVariable
  app.locals.myGlobalVariable = currentSiteUrl;
  app.locals.current_path = req.path;
  app.locals.full_url = fullUrl;
  next();
});

app.use(express.urlencoded({ extended: false }));

// Static file serving - adjusted for Vercel serverless environment
const rootDir = path.resolve(__dirname, "..");

// Serve static files from public directory
app.use(
  "/",
  express.static(join(rootDir, "src", "public"))
);

app.use(
  "/portal/assets",
  express.static(join(rootDir, "src", "public", "assets"))
);

// Configure EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(rootDir, "src", "views"));

// Serve uploads directory
const ROOT_DIR = process.cwd();
app.use("/uploads", express.static(path.join(ROOT_DIR, "src", "uploads")));

// ✅ Basic route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ✅ Mount routes
app.use("/api", apiRoutes);
app.use("/portal", portalRoutes);

// Initialize database connection (for serverless, we'll handle this per request)
let dbInitialized = false;

const initializeDatabase = async () => {
  if (!dbInitialized) {
    try {
      // Check if already initialized (TypeORM method)
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log("✅ Database connected successfully");
      }
      dbInitialized = true;
    } catch (err) {
      console.error("❌ Database connection failed:", err);
      // Don't exit process in serverless - just log the error
      // In production, you might want to retry or handle this differently
    }
  }
};

// Initialize DB on first request (lazy initialization)
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
  } catch (err) {
    console.error("Database initialization error:", err);
  }
  next();
});

// Export the app for Vercel serverless function
export default app;

// For local development, also start the server
if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ Database connection failed:", err);
      process.exit(1);
    });
}

