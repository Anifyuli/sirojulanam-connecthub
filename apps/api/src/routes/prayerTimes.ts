import express from "express";
import { RequestContext } from "@mikro-orm/core";
import { PrayerTimesController } from "../controllers/prayerTimes.ts";
import { authMiddleware } from "../middleware/auth.ts";

const router = express.Router();
const controller = (req: express.Request) => new PrayerTimesController(RequestContext.getEntityManager()!);

router.get("/", (req, res, next) => controller(req).getAll(req, res, next));
router.post("/fetch", authMiddleware, (req, res, next) => controller(req).fetchFromEquranId(req, res, next));
router.post("/", authMiddleware, (req, res, next) => controller(req).upsert(req, res, next));
router.get("/date/:date/city/:city", (req, res, next) => controller(req).getByDateAndCity(req, res, next));
router.get("/:id", (req, res, next) => controller(req).getById(req, res, next));
router.delete("/:id", authMiddleware, (req, res, next) => controller(req).delete(req, res, next));
router.delete("/date/:date/city/:city", authMiddleware, (req, res, next) => controller(req).deleteByDateAndCity(req, res, next));

export default router;
