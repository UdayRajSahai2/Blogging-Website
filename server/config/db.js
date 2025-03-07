import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Manually define __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: `${__dirname}/../.env` });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'blog_app',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || 'uday',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
  }
);

export default sequelize;
