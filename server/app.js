import express from "express";
import cors from "cors";

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
const app = express();

// middleware
app.use(express.json()); // normal json after
app.use(cors());

//Routes

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
export default app;
