"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const AnswerSheet = db_1.sequelize.define("AnswerSheet", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    questionPaperId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    answers: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false, // [{ qNo: 1, text: "answer text" }, ...]
    },
    totalScore: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 0,
    },
    feedback: {
        type: sequelize_1.DataTypes.TEXT,
    },
});
exports.default = AnswerSheet;
