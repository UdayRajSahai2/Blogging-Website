//server\seeders\seedRoles.js
import sequelize from "../config/db.config.js";
import Role from "../models/roles/Role.js";

const seedRoles = async () => {
  try {
    await sequelize.authenticate();

    const roles = [
      "student",
      "teacher",
      "blogger",
      "volunteer",
      "event_manager",
    ];

    for (const name of roles) {
      await Role.bulkCreate(
        roles.map((name) => ({
          name,
          is_active: true,
        })),
        {
          ignoreDuplicates: true,
        },
      );
    }

    console.log("Roles seeded successfully ");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedRoles();
