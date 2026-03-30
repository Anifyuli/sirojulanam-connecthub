import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { uploadFile } from "../lib/storage.ts";

export class FigureImageController {
  uploadLocal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = (req as Request & { file: Express.Multer.File }).file;
      
      console.log("[DEBUG] Upload request received");
      console.log("[DEBUG] File:", file);

      if (!file) {
        return res.status(400).json({
          success: false,
          code: "NO_FILE",
          message: "Tidak ada file yang diupload",
        });
      }

      const result = await uploadFile(file.buffer, file.originalname, file.mimetype);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("[ERROR] Upload failed:", error);
      next(error);
    }
  };

  uploadFromUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageUrl, filename } = req.body;

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          code: "MISSING_URL",
          message: "URL gambar diperlukan",
        });
      }

      const validUrl = new URL(imageUrl);
      const response = await axios.get(validUrl.toString(), {
        responseType: "arraybuffer",
        timeout: 30000,
        maxContentLength: 10 * 1024 * 1024,
      });

      const contentType = response.headers["content-type"] || "image/jpeg";
      if (!contentType.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          code: "INVALID_CONTENT_TYPE",
          message: "URL bukan file gambar",
        });
      }

      const extension = contentType.split("/")[1] || "jpg";
      const name = filename || `imported-${Date.now()}.${extension}`;
      const buffer = Buffer.from(response.data);

      const result = await uploadFile(buffer, name, contentType);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Invalid URL")) {
        return res.status(400).json({
          success: false,
          code: "INVALID_URL",
          message: "URL tidak valid",
        });
      }
      if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
        return res.status(400).json({
          success: false,
          code: "TIMEOUT",
          message: "Gagal mengunduh gambar, timeout",
        });
      }
      next(error);
    }
  };
}
