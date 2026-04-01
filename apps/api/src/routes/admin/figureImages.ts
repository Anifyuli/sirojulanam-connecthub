import express from "express";
import multer from "multer";
import { FigureImageController } from "../../controllers/figureImage.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();
const controller = new FigureImageController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar yang diizinkan"));
    }
  },
});

router.post("/upload", authMiddleware, upload.single("image"), controller.uploadLocal);
router.post("/import-url", authMiddleware, controller.uploadFromUrl);

export default router;
