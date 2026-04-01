import express from "express";
import { RequestContext } from "@mikro-orm/core";
import { EventController } from "../../controllers/events.js";
import { authMiddleware } from "../../middleware/auth.js";
import { authorizeOwnership } from "../../middleware/authorize.js";

const router = express.Router();
const controller = (_req: express.Request) => new EventController(RequestContext.getEntityManager()!);

router.get("/", authMiddleware, (req, res, next) => controller(req).getAllAdmin(req, res, next));
router.post("/", authMiddleware, (req, res, next) => controller(req).create(req, res, next));
router.get("/slug/:slug", (req, res, next) => controller(req).getBySlug(req, res, next));
router.get("/category/:categoryId", (req, res, next) => controller(req).getByCategory(req, res, next));
router.get("/:id", (req, res, next) => controller(req).getById(req, res, next));
router.put("/:id", authMiddleware, authorizeOwnership("event"), (req, res, next) => controller(req).update(req, res, next));
router.delete("/:id", authMiddleware, authorizeOwnership("event"), (req, res, next) => controller(req).delete(req, res, next));
router.get("/:id/tags", (req, res, next) => controller(req).getTags(req, res, next));
router.post("/:id/tags", authMiddleware, authorizeOwnership("event"), (req, res, next) => controller(req).addTags(req, res, next));
router.put("/:id/tags", authMiddleware, authorizeOwnership("event"), (req, res, next) => controller(req).setTags(req, res, next));
router.delete("/:id/tags", authMiddleware, authorizeOwnership("event"), (req, res, next) => controller(req).removeTags(req, res, next));
router.delete("/:id/tags/clear", authMiddleware, authorizeOwnership("event"), (req, res, next) => controller(req).clearTags(req, res, next));

export default router;
