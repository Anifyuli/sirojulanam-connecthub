import express from "express";
import adminRouter from "./admins.js";
import authRouter from "./auth.js";
import blogRouter from "./blogs.js";
import dailyPrayerScheduleRouter from "./dailyPrayerSchedules.js";
import eventRouter from "./events.js";
import jumatScheduleRouter from "./jumatSchedules.js";
import prayerTimesRouter from "./prayerTimes.js";
import videoRouter from "./videos.js";
import taxonomyRouter from "./taxonomies.js";
import quoteRouter from "./quotes.js";
import figureRouter from "./figures.js";
import postRouter from "./posts.js";
import pasaranRouter from "./pasaran.js";

import adminBlogRouter from "./admin/blogs.js";
import adminVideoRouter from "./admin/videos.js";
import adminEventRouter from "./admin/events.js";
import adminPostRouter from "./admin/posts.js";
import adminFigureRouter from "./admin/figures.js";
import adminQuoteRouter from "./admin/quotes.js";
import adminUploadRouter from "./admin/uploads.js";
import adminFigureImageRouter from "./admin/figureImages.js";
import storageRouter from "./storage.js";

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
