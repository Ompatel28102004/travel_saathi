const express = require("express");
const { startAnalysis, getAnalysisResults } = require("../controllers/aiController");
const router = express.Router();

// Route to trigger the analysis (fire and forget)
router.post("/start-analysis/:userId", startAnalysis);

// Route to get all completed analysis results
router.get("/results", getAnalysisResults);

module.exports = router;