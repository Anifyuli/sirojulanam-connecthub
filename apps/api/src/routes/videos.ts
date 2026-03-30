import express from "express";
import { RequestContext } from "@mikro-orm/core";
import { VideoController } from "../controllers/videos.ts";
import { authMiddleware } from "../middleware/auth.ts";
import { authorizeOwnership } from "../middleware/authorize.ts";

const router = express.Router();
const controller = (_req: express.Request) => new VideoController(RequestContext.getEntityManager()!);

router.get("/", (req, res, next) => controller(req).getAllPublic(req, res, next));
router.get("/slug/:slug", (req, res, next) => controller(req).getBySlug(req, res, next));
router.get("/category/:categoryId", (req, res, next) => controller(req).getByCategory(req, res, next));
router.get("/:id", (req, res, next) => controller(req).getById(req, res, next));

router.post("/", authMiddleware, (req, res, next) => controller(req).create(req, res, next));
router.put("/:id", authMiddleware, authorizeOwnership("video"), (req, res, next) => controller(req).update(req, res, next));
router.delete("/:id", authMiddleware, authorizeOwnership("video"), (req, res, next) => controller(req).delete(req, res, next));
router.get("/:id/tags", (req, res, next) => controller(req).getTags(req, res, next));
router.post("/:id/tags", authMiddleware, authorizeOwnership("video"), (req, res, next) => controller(req).addTags(req, res, next));
router.put("/:id/tags", authMiddleware, authorizeOwnership("video"), (req, res, next) => controller(req).setTags(req, res, next));
router.delete("/:id/tags", authMiddleware, authorizeOwnership("video"), (req, res, next) => controller(req).removeTags(req, res, next));
router.delete("/:id/tags/clear", authMiddleware, authorizeOwnership("video"), (req, res, next) => controller(req).clearTags(req, res, next));

export default router;
