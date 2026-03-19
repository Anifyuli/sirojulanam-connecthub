import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { RequestContext } from "@mikro-orm/core";

import indexRouter from "./routes/index.ts";
import { getOrm } from "./lib/entityManager.ts";

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((req, res, next) => {
  RequestContext.create(getOrm().em, next)
})
app.use("/api", indexRouter);

export default app;
