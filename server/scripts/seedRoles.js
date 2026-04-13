import sequelize from "../config/db.config.js";
import Role from "../models/roles/Role.js";

const seedRoles = async () => {
  try {
    await sequelize.sync(); // ensure tables exist

    await Role.bulkCreate(
      [
        { role_name: "student" },
        { role_name: "teacher" },
        { role_name: "doctor" },
        { role_name: "service_provider" },

        // 🔥 NEW ROLES
        { role_name: "researcher" },
        { role_name: "activist" },
        { role_name: "entrepreneur" },
        { role_name: "blogger" },
        { role_name: "event_manager" },
      ],
      { ignoreDuplicates: true },
    );

    console.log("✅ Roles seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedRoles();
