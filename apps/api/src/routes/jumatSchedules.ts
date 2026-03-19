import express from "express";
import { RequestContext } from "@mikro-orm/core";
import { JumatScheduleController } from "../controllers/jumatSchedules.ts";
import { authMiddleware } from "../middleware/auth.ts";

const router = express.Router();
const controller = (req: express.Request) => new JumatScheduleController(RequestContext.getEntityManager()!);

router.get("/", (req, res, next) => controller(req).getAll(req, res, next));
router.post("/", authMiddleware, (req, res, next) => controller(req).create(req, res, next));
router.get("/:pasaran", (req, res, next) => controller(req).getByPasaran(req, res, next));
router.put("/:pasaran", authMiddleware, (req, res, next) => controller(req).update(req, res, next));
router.delete("/:pasaran", authMiddleware, (req, res, next) => controller(req).delete(req, res, next));

export default router;
