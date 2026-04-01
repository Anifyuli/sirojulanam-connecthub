import express from "express";
import { RequestContext } from "@mikro-orm/core";
import { PostController } from "../controllers/posts.js";
import { authMiddleware } from "../middleware/auth.js";
import { authorizeOwnership } from "../middleware/authorize.js";

const router = express.Router();
const controller = (_req: express.Request) => new PostController(RequestContext.getEntityManager()!);

router.get("/", (req, res, next) => controller(req).getAllPublic(req, res, next));
router.get("/:id", (req, res, next) => controller(req).getById(req, res, next));

router.post("/", authMiddleware, (req, res, next) => controller(req).create(req, res, next));
router.put("/:id", authMiddleware, authorizeOwnership("post"), (req, res, next) => controller(req).update(req, res, next));
router.delete("/:id", authMiddleware, authorizeOwnership("post"), (req, res, next) => controller(req).delete(req, res, next));

export default router;