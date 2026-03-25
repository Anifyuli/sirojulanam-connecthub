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

const router = express.Router();

// Root endpoint
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to SirojulAnam ConnectHub ReST API"
  });
});

// API routes
router.use("/auth", authRouter);
router.use("/admins", adminRouter);
router.use("/blogs", blogRouter);
router.use("/daily-prayer-schedules", dailyPrayerScheduleRouter);
router.use("/events", eventRouter);
router.use("/jumat-schedules", jumatScheduleRouter);
router.use("/prayer-times", prayerTimesRouter);
router.use("/videos", videoRouter);
router.use("/taxonomies", taxonomyRouter);

export default router;
