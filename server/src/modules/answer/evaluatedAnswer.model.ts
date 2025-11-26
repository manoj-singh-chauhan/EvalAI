import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";
import AnswerSheet from "./answer.model";

class EvaluatedAnswer extends Model {}

EvaluatedAnswer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    answerSheetId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    questionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    questionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    studentAnswer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    maxScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "EvaluatedAnswer",
    tableName: "evaluated_answers",
    timestamps: true,
  }
);


AnswerSheet.hasMany(EvaluatedAnswer, {
  foreignKey: "answerSheetId",
  as: "evaluatedAnswers",
});

EvaluatedAnswer.belongsTo(AnswerSheet, {
  foreignKey: "answerSheetId",
});

export default EvaluatedAnswer;
