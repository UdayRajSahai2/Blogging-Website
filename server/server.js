import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from 'cors';

import User from "./Schema/User.js";
import Profession from "./Schema/Professions.js";

dotenv.config();

const server = express();

// Middleware
server.use(express.json());

server.use(cors());

const formatDatatoSend = (user) => {
  const access_token = jwt.sign({id: user.user_id},process.env.SECRET_ACCESS_KEY);
  return {
    access_token,
    profile_img : user.profile_img,
    username : user.username,
    fullname : user.fullname
  }
}

const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let usernameExists = await User.findOne({ where: { username } });

  if (usernameExists) {
    username += nanoid(3); // Append a 3-character random string
  }

  return username;
};


// Database Connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Database Connected!");
    await Profession.sync({ alter: true });
    await User.sync(); // Sync the model with the database
    console.log("✅ Users table is ready!");
  } catch (error) {
    console.error("❌ Database Connection Error:", error);
    process.exit(1);
  }
};

connectDB();

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;

server.post("/signup", async (req, res) => {
  let { fullname, email, password } = req.body;

  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "❌ Fullname must be at least 3 letters long" });
  }
  if (!email.length) {
    return res.status(403).json({ error: "❌ Enter email" });
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "❌ Email is invalid" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "❌ Password must be at least 12 characters long and include at least one numeric digit, one lowercase letter, one uppercase letter, and one special character.",
    });
  }

  try {
    // Hash the password
    const hashed_password = await bcrypt.hash(password, 10);
    let username = await generateUsername(email);

    // Save user to database
    let user = await User.create({
      fullname,
      email,
      password: hashed_password,
      username,
    });

    return res.status(200).json(formatDatatoSend(user));
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "❌ Email already exists" });
    }
    return res.status(500).json({ error: error.message });
  }
});
server.post("/signin", async (req, res) => {
  let { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(403).json({ error: "❌ Email not found" });
    }

    // Compare the entered password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(403).json({ error: "❌ Incorrect password" });
    }

    return res.json(formatDatatoSend(user));
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "❌ Server error" });
  }
});


// Port Setup
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
