import express from "express";
import { RequestContext } from "@mikro-orm/core";
import { AuthController } from '../controllers/auth';
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get('/me', authMiddleware, (req, res, next) => {
  const em = RequestContext.getEntityManager()!;
  const controller = new AuthController(em);
  controller.me(req, res, next);
});

export default router;
