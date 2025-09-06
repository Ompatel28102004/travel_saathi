const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db.js");
// const { Server } = require("socket.io");
const http = require("http");
// const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js")
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

connectDB();


// const io = new Server(server, { cors: { origin: "*" } });
// --- ES Modules setup for __dirname ---
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Routes
// app.use("/api/auth", authRoutes);
// --- Serve Static Files (for uploaded photos) ---
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// --- API Routes ---
app.use('/api/users', userRoutes);
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));