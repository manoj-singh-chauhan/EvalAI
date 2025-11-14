"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionPaper = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class QuestionPaper extends sequelize_1.Model {
}
exports.QuestionPaper = QuestionPaper;
QuestionPaper.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    mode: {
        type: sequelize_1.DataTypes.ENUM("typed", "upload"),
        allowNull: false
    },
    fileUrl: {
        type: sequelize_1.DataTypes.STRING
    },
    questions: {
        type: sequelize_1.DataTypes.JSON
    },
    totalMarks: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0
    },
}, {
    sequelize: db_1.sequelize,
    modelName: "QuestionPaper",
    tableName: "question_papers",
    timestamps: true,
});
exports.default = QuestionPaper;
