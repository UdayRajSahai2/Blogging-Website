import express from "express";
import cors from "cors";

// ================= CORS CONFIG =================
// Domains you trust (no protocol needed)
const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  "https://reachfoundationngo.com",
  "https://www.reachfoundationngo.com",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  }),
);

app.use((req, res, next) => {
  if (req.method === "HEAD") {
    return res.status(200).end();
  }
  next();
});
// ================= MIDDLEWARE =================

// Debug incoming requests (VERY useful)
app.use((req, res, next) => {
  next();
});
app.use(express.json({ limit: "10mb" }));

// ================= ROUTES =================

import authRoutes from "./routes/auth.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import professionRoutes from "./routes/profession.routes.js";
import donationRoutes from "./routes/donation.routes.js";
import donorRoutes from "./routes/donor.routes.js";
import expenditureRoutes from "./routes/expenditure.routes.js";
import financeRoutes from "./routes/finance.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import academicRoutes from "./routes/academic.routes.js";
import userDetailsRoutes from "./routes/userdetails.routes.js";
import professionalProfileRoutes from "./routes/professional-profile.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import adminRoutes from "./routes/admin/index.js";
import roleRoutes from "./routes/role.routes.js";
import userInterestsRoutes from "./routes/userInterests.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import locationRoutes from "./routes/location.routes.js";
import pageRoutes from "./routes/page.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import studentEnrollmentRoutes from "./routes/studentEnrollment.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/user", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/professions", professionRoutes);
app.use("/api/donation", donationRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/expenditure", expenditureRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/academics", academicRoutes);
app.use("/api/user-details", userDetailsRoutes);
app.use("/api/professional-profile", professionalProfileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/interests", userInterestsRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/student-enrollment", studentEnrollmentRoutes);
// ================= HEALTH CHECK =================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    timestamp: new Date(),
  });
});

// ================= 404 HANDLER =================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ================= GLOBAL ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error(" Error:", err.message);

  // CORS error special handling
  if (err.message === "CORS not allowed") {
    return res.status(403).json({
      success: false,
      message: "CORS blocked request",
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
