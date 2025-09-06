const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db");
const http = require("http");
const userRoutes = require("./routes/userRoutes")
const geoFenceRoutes = require("./routes/geoFenceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const sosRoutes = require("./routes/sosRoutes");
const path = require('path')
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
// --- Serve Static Files (for uploaded photos) ---
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// --- API Routes ---
app.use('/api/users', userRoutes);
app.use("/api/geofence", geoFenceRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/alert",sosRoutes);
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));