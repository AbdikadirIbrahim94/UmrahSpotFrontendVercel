"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("../src/db/data-source");
const api_1 = __importDefault(require("../src/routes/api"));
const path_1 = __importDefault(require("path"));
const portal_1 = __importDefault(require("../src/routes/portal"));
const path_2 = require("path");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
// ✅ Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
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
app.use(express_1.default.urlencoded({ extended: false }));
// Static file serving - adjusted for Vercel serverless environment
const rootDir = path_1.default.resolve(__dirname, "..");
// Serve static files from public directory
app.use("/", express_1.default.static((0, path_2.join)(rootDir, "src", "public")));
app.use("/portal/assets", express_1.default.static((0, path_2.join)(rootDir, "src", "public", "assets")));
// Configure EJS view engine
app.set("view engine", "ejs");
app.set("views", path_1.default.join(rootDir, "src", "views"));
// Serve uploads directory
const ROOT_DIR = process.cwd();
app.use("/uploads", express_1.default.static(path_1.default.join(ROOT_DIR, "src", "uploads")));
// ✅ Basic route
app.get("/", (req, res) => {
    res.send("Hello World!");
});
// ✅ Mount routes
app.use("/api", api_1.default);
app.use("/portal", portal_1.default);
// Initialize database connection (for serverless, we'll handle this per request)
let dbInitialized = false;
const initializeDatabase = async () => {
    if (!dbInitialized) {
        try {
            // Check if already initialized (TypeORM method)
            if (!data_source_1.AppDataSource.isInitialized) {
                await data_source_1.AppDataSource.initialize();
                console.log("✅ Database connected successfully");
            }
            dbInitialized = true;
        }
        catch (err) {
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
    }
    catch (err) {
        console.error("Database initialization error:", err);
    }
    next();
});
// Export the app for Vercel serverless function
exports.default = app;
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
//# sourceMappingURL=index.js.map