import express from "express";
import adminRouter from "./admins.ts";
import authRouter from "./auth.ts";
import blogRouter from "./blogs.ts";
import dailyPrayerScheduleRouter from "./dailyPrayerSchedules.ts";
import eventRouter from "./events.ts";
import jumatScheduleRouter from "./jumatSchedules.ts";
import prayerTimesRouter from "./prayerTimes.ts";
import videoRouter from "./videos.ts";
import taxonomyRouter from "./taxonomies.ts";
import quoteRouter from "./quotes.ts";
import figureRouter from "./figures.ts";
import postRouter from "./posts.ts";
import pasaranRouter from "./pasaran.ts";

import adminBlogRouter from "./admin/blogs.ts";
import adminVideoRouter from "./admin/videos.ts";
import adminEventRouter from "./admin/events.ts";
import adminPostRouter from "./admin/posts.ts";
import adminFigureRouter from "./admin/figures.ts";
import adminQuoteRouter from "./admin/quotes.ts";
import adminUploadRouter from "./admin/uploads.ts";
import adminFigureImageRouter from "./admin/figureImages.ts";
import storageRouter from "./storage.ts";

const router = express.Router();

// Root endpoint
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to SirojulAnam ConnectHub ReST API"
  });
});

// Public API routes
router.use("/auth", authRouter);
router.use("/admins", adminRouter);
router.use("/blogs", blogRouter);
router.use("/daily-prayer-schedules", dailyPrayerScheduleRouter);
router.use("/events", eventRouter);
router.use("/jumat-schedules", jumatScheduleRouter);
router.use("/pasaran", pasaranRouter);
router.use("/prayer-times", prayerTimesRouter);
router.use("/videos", videoRouter);
router.use("/taxonomies", taxonomyRouter);
router.use("/quotes", quoteRouter);
router.use("/figures", figureRouter);
router.use("/posts", postRouter);

// Admin API routes
router.use("/admin/blogs", adminBlogRouter);
router.use("/admin/videos", adminVideoRouter);
router.use("/admin/events", adminEventRouter);
router.use("/admin/posts", adminPostRouter);
router.use("/admin/figures", adminFigureRouter);
router.use("/admin/quotes", adminQuoteRouter);
router.use("/admin/uploads", adminUploadRouter);
router.use("/admin/figure-images", adminFigureImageRouter);
router.use("/storage", storageRouter);

export default router;
