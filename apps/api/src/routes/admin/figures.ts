import express from "express";
import { RequestContext } from "@mikro-orm/core";
import { FigureController } from "../../controllers/figures.js";
import { authMiddleware } from "../../middleware/auth.js";
import { authorizeOwnership } from "../../middleware/authorize.js";

const router = express.Router();
const controller = (_req: express.Request) => new FigureController(RequestContext.getEntityManager()!);

router.get("/", authMiddleware, (req, res, next) => controller(req).getAllAdmin(req, res, next));
router.post("/", authMiddleware, (req, res, next) => controller(req).create(req, res, next));
router.get("/featured", (req, res, next) => controller(req).getFeatured(req, res, next));
router.get("/tags", (req, res, next) => controller(req).getTags(req, res, next));
router.get("/:id", (req, res, next) => controller(req).getById(req, res, next));
router.put("/:id", authMiddleware, authorizeOwnership("figure"), (req, res, next) => controller(req).update(req, res, next));
router.delete("/:id", authMiddleware, authorizeOwnership("figure"), (req, res, next) => controller(req).delete(req, res, next));

export default router;
