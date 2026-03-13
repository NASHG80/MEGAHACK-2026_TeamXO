require("dotenv").config();
const path    = require("path");
const express = require("express");
const cors    = require("cors");
const connectDB = require("./config/db");

// Prevent any unhandled crash from killing the server
process.on('uncaughtException', err => {
  console.error('❌ uncaughtException:', err.message, err.stack);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ unhandledRejection:', reason);
});

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
app.use("/api/live-event",        require("./routes/liveEvent"));
app.use("/api/event",             require("./routes/eventAssignRoutes"));
app.use("/api/hackathons",        require("./routes/hackathonRoutes"));
app.use("/api/organizer/hackathons", require("./routes/organizerHackathonRoutes"));
app.use("/api/organizer/events",  require("./routes/eventRoutes"));
app.use("/api/organizer/cocom",   require("./routes/cocomRoutes"));
app.use("/api/certificates",      require("./routes/certificateRoutes"));
app.use("/api/registrations",     require("./routes/registrationRoutes"));
app.use("/api/teams",             require("./routes/teamRoutes"));
app.use("/api/posts",             require("./routes/postRoutes"));
app.use("/api",                   require("./routes/verification"));   // mounts /api/organizer/verification + /api/admin/*
app.use("/api/registrations",     require("./routes/registrationRoutes"));


// Health check
app.get("/",           (req, res) => res.json({ status: "HackFlow API running 🚀" }));
app.get("/api/health", (req, res) => res.json({ status: "OK" }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler — catches multer errors too
app.use((err, req, res, next) => {
  console.error('🔥 Express error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Max 10MB.' });
  }
  if (err.message && err.message.includes('Only PDF')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
