import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import crypto from "crypto";
import { s3 } from "../utils/aws";

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME!,
    // With S3 Object Ownership = Bucket owner enforced, ACLs are not supported.
    // Manage access via bucket policies instead of per-object ACLs.
    // acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,

    key: (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, key?: string) => void
    ) => {
      const ext = path.extname(file.originalname);
      const fileName = crypto.randomBytes(16).toString("hex");
      cb(null, `hotels/${Date.now()}-${fileName}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});
