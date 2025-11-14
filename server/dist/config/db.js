"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
dotenv_1.default.config({ path: ".env.development" });
logger_1.default.info("Initializing database connection...");
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT) || 3306;
exports.sequelize = new sequelize_1.Sequelize(DB_NAME, DB_USER, DB_PASS, {
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
const connectDB = async () => {
    try {
        await exports.sequelize.authenticate();
        await exports.sequelize.sync({ alter: true });
        logger_1.default.info("Database connected successfully!");
    }
    catch (error) {
        logger_1.default.error("Database connection failed!");
        logger_1.default.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
