// backend/routes/dashboardRoutes.js
import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get("/stats", protectAdmin, getDashboardStats);

export default router;
