import express from "express";
import { RequestContext } from "@mikro-orm/core";
import { AdminController } from '../controllers/admins.ts';
import { authMiddleware } from "../middleware/auth.ts";

const router = express.Router();

const controller = (_req: express.Request) => new AdminController(RequestContext.getEntityManager()!);

router.post('/login', (req, res, next) => controller(req).login(req, res, next));
router.post('/register', (req, res, next) => controller(req).register(req, res, next));
router.post('/refresh', (req, res, next) => controller(req).refresh(req, res, next));

router.get('/', authMiddleware, (req, res, next) => controller(req).getAll(req, res, next));
router.get('/profile', authMiddleware, (req, res, next) => controller(req).getById(req, res, next));
router.put('/profile', authMiddleware, (req, res, next) => controller(req).updateProfile(req, res, next));
router.get('/:id', authMiddleware, (req, res, next) => controller(req).getById(req, res, next));
router.post('/', authMiddleware, (req, res, next) => controller(req).create(req, res, next));
router.put('/:id', authMiddleware, (req, res, next) => controller(req).update(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => controller(req).delete(req, res, next));

router.post('/logout', authMiddleware, (req, res, next) => controller(req).logout(req, res, next));
router.post('/logout-all', authMiddleware, (req, res, next) => controller(req).logoutAll(req, res, next));

export default router;
