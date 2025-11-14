"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./config/logger"));
dotenv_1.default.config({ path: ".env.development" });
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const startServer = async () => {
    try {
        app_1.default.listen(PORT, () => {
            logger_1.default.info(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        logger_1.default.error(error);
        process.exit(1);
    }
};
startServer();
