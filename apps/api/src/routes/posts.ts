import express from "express";
import { RequestContext } from "@mikro-orm/core";
import { PostController } from "../controllers/posts.ts";
import { authMiddleware } from "../middleware/auth.ts";
import { authorizeOwnership } from "../middleware/authorize.ts";

const router = express.Router();
const controller = (_req: express.Request) => new PostController(RequestContext.getEntityManager()!);

router.get("/", (req, res, next) => controller(req).getAllPublic(req, res, next));
router.get("/:id", (req, res, next) => controller(req).getById(req, res, next));

router.post("/", authMiddleware, (req, res, next) => controller(req).create(req, res, next));
router.put("/:id", authMiddleware, authorizeOwnership("post"), (req, res, next) => controller(req).update(req, res, next));
router.delete("/:id", authMiddleware, authorizeOwnership("post"), (req, res, next) => controller(req).delete(req, res, next));
router.post("/:id/reactions", authMiddleware, (req, res, next) => controller(req).addReaction(req, res, next));
router.delete("/:id/reactions", authMiddleware, (req, res, next) => controller(req).removeReaction(req, res, next));

export default router;