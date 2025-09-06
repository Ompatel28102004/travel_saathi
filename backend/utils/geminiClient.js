const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini client from .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // OLD, causes 404 error
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // ✅ CORRECTED: Use a current model

module.exports = model;