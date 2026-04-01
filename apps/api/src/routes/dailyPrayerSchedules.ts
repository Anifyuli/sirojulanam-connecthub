import express from "express";
import { RequestContext } from "@mikro-orm/core";
import { DailyPrayerScheduleController } from "../controllers/dailyPrayerSchedules.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const controller = (_req: express.Request) => new DailyPrayerScheduleController(RequestContext.getEntityManager()!);

router.get("/", (req, res, next) => controller(req).getAll(req, res, next));
router.post("/", authMiddleware, (req, res, next) => controller(req).create(req, res, next));
router.get("/:prayTime", (req, res, next) => controller(req).getByPrayTime(req, res, next));
router.put("/:prayTime", authMiddleware, (req, res, next) => controller(req).update(req, res, next));
router.delete("/:prayTime", authMiddleware, (req, res, next) => controller(req).delete(req, res, next));

export default router;
