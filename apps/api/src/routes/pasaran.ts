import express from "express";
import axios from "axios";

const router = express.Router();

/**
 * Proxy endpoint to get Javanese calendar info
 * This avoids CORS issues when calling external API from frontend
 */
router.get("/calendar", async (req, res) => {
  try {
    const { year, month, day } = req.query;

    if (!year || !month || !day) {
      res.status(400).json({
        success: false,
        error: "Missing required query params: year, month, day",
      });
      return;
    }

    const url = `https://tanggalanjawa.com/api/calendar?year=${year}&month=${month}&day=${day}`;
    
    const response = await axios.get(url, {
      headers: {
        "Accept": "application/json",
      },
    });

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    console.error("Error fetching pasaran:", error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.message || "Internal server error",
    });
  }
});

export default router;
