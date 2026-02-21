import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";

// Manually define __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: `${__dirname}/../.env` });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false,
  },
);

export default sequelize;
