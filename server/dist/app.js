"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = require("./config/db");
const question_routes_1 = __importDefault(require("./modules/question/question.routes"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config({ path: ".env.development" });
const app = (0, express_1.default)();
(0, db_1.connectDB)();
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use("/api/questions", question_routes_1.default);
exports.default = app;
