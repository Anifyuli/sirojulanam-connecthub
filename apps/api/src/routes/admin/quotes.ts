import express from "express";
import { RequestContext } from "@mikro-orm/core";
import { QuoteController } from "../../controllers/quotes.js";
import { authMiddleware } from "../../middleware/auth.js";
import { authorizeOwnership } from "../../middleware/authorize.js";

const router = express.Router();
const controller = (_req: express.Request) => new QuoteController(RequestContext.getEntityManager()!);

router.get("/", authMiddleware, (req, res, next) => controller(req).getAllAdmin(req, res, next));
router.post("/", authMiddleware, (req, res, next) => controller(req).create(req, res, next));
router.get("/random", (req, res, next) => controller(req).getRandom(req, res, next));
router.get("/:id", (req, res, next) => controller(req).getById(req, res, next));
router.put("/:id", authMiddleware, authorizeOwnership("quote"), (req, res, next) => controller(req).update(req, res, next));
router.delete("/:id", authMiddleware, authorizeOwnership("quote"), (req, res, next) => controller(req).delete(req, res, next));

router.get("/categories/all", (req, res, next) => controller(req).getCategories(req, res, next));
router.post("/categories", authMiddleware, (req, res, next) => controller(req).createCategory(req, res, next));
router.delete("/categories/:id", authMiddleware, (req, res, next) => controller(req).deleteCategory(req, res, next));
router.get("/tags", (req, res, next) => controller(req).getTags(req, res, next));

export default router;
