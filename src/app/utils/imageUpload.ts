import { UploadApiResponse } from "cloudinary";
import cloudinary from "../libs/cloudinary";
import env from "../configs/env";
import fs from "node:fs";

const imageUpload = async (
  filePath: string,
  folder: string,
): Promise<UploadApiResponse | void> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      format: "webp",
      use_filename: true,
      upload_preset: env.CLOUDINARY_UPLOAD_PRESET,
    });

    await fs.promises.unlink(filePath);

    return result;
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Cloudinary", error);
  }
};

export default imageUpload;
