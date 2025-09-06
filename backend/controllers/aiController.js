const User = require("../models/User");
const AnalysisResult = require("../models/AnalysisResult"); // Import the new model
const geminiModel = require("../utils/geminiClient");

// This helper function now runs in the background
const processAnalysisInBackground = async (analysisId, user) => {
    try {
        const createBehaviorProfile = (locationHistory) => {
            if (!locationHistory || locationHistory.length < 5) return "Not enough historical data.";
            const zones = [...new Set(locationHistory.flatMap(h => h.zoneInfo.map(z => z.zoneName)))];
            return `Previously visited zones: ${zones.join(", ") || "None"}.`;
        };

        const normalProfile = createBehaviorProfile(user.locationHistory);
        const currentSituation = `Last known location: ${user.lastLocation.address || `${user.lastLocation.lat}, ${user.lastLocation.lng}`}. Inside zone: ${user.lastLocation.insideZone}.`;

        const prompt = `
            You are a security analyst. Analyze the following. Respond ONLY with a valid JSON object with keys "reasoning" (string) and "severity" (number 1-10).
            **Profile:** ${normalProfile}
            **Situation:** ${currentSituation}
        `;

        const result = await geminiModel.generateContent(prompt);
        const responseText = result.response.text();
        const analysis = JSON.parse(responseText.match(/{.*}/s)[0]); // Robust JSON parsing

        // Update the AnalysisResult with the outcome
        await AnalysisResult.findByIdAndUpdate(analysisId, {
            status: "completed",
            severity: analysis.severity,
            reasoning: analysis.reasoning,
        });

    } catch (error) {
        console.error(`AI Analysis failed for job ${analysisId}:`, error);
        // Mark the job as failed in the database
        await AnalysisResult.findByIdAndUpdate(analysisId, {
            status: "failed",
            reasoning: "An error occurred during AI processing.",
        });
    }
};


// 1. Starts the analysis and responds immediately
const startAnalysis = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Create a new job record in the database
    const newAnalysis = await AnalysisResult.create({
      userId: user._id,
      userName: user.name,
      status: "pending",
    });

    // --- Fire and Forget ---
    // Start the long-running process but DO NOT wait for it to finish
    processAnalysisInBackground(newAnalysis._id, user);

    // Respond to the client immediately
    res.status(202).json({ message: "Analysis started.", analysisId: newAnalysis._id });

  } catch (error) {
    res.status(500).json({ message: "Failed to start analysis." });
  }
};

// 2. Gets all completed analysis results for the dashboard
const getAnalysisResults = async (req, res) => {
    try {
        const results = await AnalysisResult.find({ status: "completed" })
            .sort({ createdAt: -1 })
            .limit(10); // Get the 10 most recent results
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch analysis results." });
    }
};

module.exports = { startAnalysis, getAnalysisResults };