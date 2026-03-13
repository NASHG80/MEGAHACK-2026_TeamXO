require("dotenv").config();
const path    = require("path");
const express = require("express");
const cors    = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static — serve uploaded files (banner, logo, problem statements)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth",              require("./routes/auth"));
app.use("/api/live-event", require("./routes/liveEvent"));
app.use("/api/hackathons",        require("./routes/hackathonRoutes"));
app.use("/api/organizer/events",  require("./routes/eventRoutes"));
app.use("/api/certificates",      require("./routes/certificateRoutes"));

// Health check
app.get("/",           (req, res) => res.json({ status: "HackFlow API running 🚀" }));
app.get("/api/health", (req, res) => res.json({ status: "OK" }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
