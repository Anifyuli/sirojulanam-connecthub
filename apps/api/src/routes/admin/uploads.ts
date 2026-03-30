import express from "express";
import multer from "multer";
import { UploadController } from "../../controllers/uploads.ts";
import { authMiddleware } from "../../middleware/auth.ts";

const router = express.Router();
const controller = new UploadController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post("/", authMiddleware, upload.single("file"), controller.upload);

export default router;
