import status from "http-status";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { AppError } from "../helpers/AppError";

const uploadDir = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadDir);
  },

  filename(_req, file, cb) {
    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExt = path.extname(file.originalname);
    const finalFileName = `${file.fieldname}-${uniquePrefix}${fileExt}`;

    cb(null, finalFileName);
  },
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const allowMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowMimeTypes.includes(file.mimetype)) {
    cb(
      new AppError(
        "Only JPG, JPEG, PNG and WEBP images are allowed.",
        status.BAD_REQUEST,
      ),
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default upload;
