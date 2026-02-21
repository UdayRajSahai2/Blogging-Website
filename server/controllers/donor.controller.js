// ---------------- Models / Associations ----------------
import { User, Donor } from "../models/associations.js";

export const registerDonor = async (req, res) => {
  try {
    const { subscription_type, purpose, customer_id } = req.body;
    const user_id = req.user;

    // Check if user is already a donor
    const existingDonor = await Donor.findOne({ where: { user_id } });
    if (existingDonor) {
      return res
        .status(400)
        .json({ error: "User is already registered as a donor" });
    }

    // Create donor record
    const donor = await Donor.create({
      user_id,
      customer_id: customer_id || null,
      is_subscriber: subscription_type === "repeated",
      subscription_type: subscription_type || "one-time",
      purpose: purpose || null,
    });

    res.status(201).json({
      message: "Successfully registered as donor",
      donor: {
        donor_id: donor.donor_id,
        subscription_type: donor.subscription_type,
        is_subscriber: donor.is_subscriber,
        purpose: donor.purpose,
      },
    });
  } catch (error) {
    console.error("Error registering donor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const donorProfile = async (req, res) => {
  try {
    const user_id = req.user;

    const donor = await Donor.findOne({
      where: { user_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "fullname", "email", "profile_img"],
        },
      ],
    });

    if (!donor) {
      return res.status(404).json({ error: "Donor profile not found" });
    }

    res.json({ donor });
  } catch (error) {
    console.error("Error fetching donor profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
