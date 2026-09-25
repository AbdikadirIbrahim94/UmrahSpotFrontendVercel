import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDataSource } from "./db/data-source";
import apiRoutes from "./routes/api";
import path from "path";
import { join } from "path";
import { readFileSync } from "fs";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import portalRoutes from "./routes/portal.js";
import { existsSync } from "fs";
import session from "express-session";

dotenv.config();

const rootDir = path.resolve(__dirname, "..");
// const swaggerFilePath = path.join(rootDir, "swagger", "openapi.yaml");
// const swaggerFilePath = path.join(__dirname, "swagger", "openapi.yaml");

const possiblePaths = [
  path.join(__dirname, "swagger", "openapi.yaml"),
  path.join(rootDir, "swagger", "openapi.yaml"),
  path.join(process.cwd(), "swagger", "openapi.yaml"),
  path.join(process.cwd(), "api", "swagger", "openapi.yaml"),
];

let swaggerFilePath: string | null = null;
let swaggerDocument: any;

for (const filePath of possiblePaths) {
  if (existsSync(filePath)) {
    swaggerFilePath = filePath;
    console.log(`✅ Found swagger file at: ${filePath}`);
    break;
  }
}

if (swaggerFilePath) {
  try {
    const specification = readFileSync(swaggerFilePath, "utf8");
    swaggerDocument = YAML.parse(specification);
  } catch (error) {
    console.error("❌ Failed to load Swagger specification:", error);
    swaggerDocument = null;
  }
} else {
  console.error("❌ Swagger file not found in any expected location");
  swaggerDocument = null;
}

// let swaggerDocument: any;
// try {
//   const specification = readFileSync(swaggerFilePath, "utf8");
//   swaggerDocument = YAML.parse(specification);
// } catch (error) {
//   console.error("❌ Failed to load Swagger specification:", error);
//   swaggerDocument = null;
// }

const app = express();
const PORT = process.env.PORT || 8000;

// ✅ Middleware
// app.use(express.json());
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe-webhook-tajpark') {
    return next(); // skip JSON parsing — this route needs the raw body
  }
  express.json()(req, res, next);
});
app.use(cors()); 
// app.use(
//   cors({
//     origin: [
//       "http://99.81.148.100",
//       "http://99.81.148.100:3000",
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );


app.set('trust proxy', true);

// ✅ Initialize database before handling any request
app.use(async (req, res, next) => {
  try {
    await initializeDataSource();
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
  next();
});



app.use(async (req, res, next) => {
  const currentSiteUrl = `${req.protocol}://${req.get('host')}`;
  const fullUrl = `${currentSiteUrl}${req.originalUrl}`;

  app.locals.myGlobalVariable = currentSiteUrl;
  app.locals.current_path = req.path;
  app.locals.full_url = fullUrl;
  next();
});

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set secure: true in production with HTTPS
  })
);

// Use extended:true so nested form fields like rates[0][id] become proper JS objects/arrays
app.use(express.urlencoded({ extended: true }));

app.use('/',express.static(join(process.cwd(),"public")));
app.use('/',express.static(path.join(process.cwd(),"src","public")));
app.use('/portal/assets',express.static(join(process.cwd(),"public","assets")));
app.use('/portal/assets',express.static(path.join(process.cwd(),"src","public","assets")));

app.set('view engine', 'ejs');
app.set("views", path.join(rootDir, "src", "views"));

const ROOT_DIR = process.cwd();
app.use("/uploads", express.static(path.join(ROOT_DIR, "uploads")));
app.use("/uploads", express.static(path.join(ROOT_DIR, "src", "uploads")));

if (swaggerDocument) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
  app.get("/api/docs.json", (_req, res) => {
    res.json(swaggerDocument);
  });
}

// ✅ Basic route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

console.log("finding route ;;;;;")

// ✅ Mount routes
app.use("/api", apiRoutes);
app.use("/portal", portalRoutes);

// ✅ For local development
// if (process.env.NODE_ENV !== "production") {
//   initializeDataSource()
//     .then(() => {
//       app.listen(PORT, () => {
//         console.log(`🚀 Server running on port ${PORT}`);
//       });
//     })
//     .catch((err) => {
//       console.error("❌ Database connection failed:", err);
//       process.exit(1);
//     });
// }

initializeDataSource()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

// ✅ Export for Vercel serverless
export default app;