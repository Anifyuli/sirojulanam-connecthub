import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { RequestContext } from "@mikro-orm/core";
import path from "path";

import indexRouter from "./routes/index.js";

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
app.use(logger("dev"));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());

const publicPath = path.join(process.cwd(), "public", "uploads");
app.use("/uploads", express.static(publicPath));

// Lazy-load ORM to ensure it's initialized before use
app.use(async (req, res, next) => {
  try {
    const { getOrm } = await import("./lib/entityManager.js");
    RequestContext.create(getOrm().em, next);
  } catch (error) {
    next(error);
  }
});
app.use("/api", indexRouter);

export default app;
