import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import logger from "./logger";

dotenv.config({ path: ".env.development" });


const DB_NAME = process.env.DB_NAME as string;
const DB_USER = process.env.DB_USER as string;
const DB_PASS = process.env.DB_PASS as string;
const DB_HOST = process.env.DB_HOST as string;
const DB_PORT = Number(process.env.DB_PORT);

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    freezeTableName: true,
  },
});

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    logger.info("Database connected successfully!");
  } catch (error: any) {
    logger.error("Database connection failed!");
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
