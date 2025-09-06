const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db.js");
// const { Server } = require("socket.io");
const http = require("http");
// const authRoutes = require("./routes/authRoutes.js");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });


// Routes
// app.use("/api/auth", authRoutes);


server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));