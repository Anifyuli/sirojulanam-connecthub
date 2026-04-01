import { Request, Response, NextFunction } from "express";
import { UploadedFile } from "../types/multer.js";
import { uploadFile } from "../lib/storage.js";

export class UploadController {
  upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = (req as Request & { file: UploadedFile }).file;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          code: "NO_FILE",
          message: "Tidak ada file yang diupload",
        });
      }

      const result = await uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
