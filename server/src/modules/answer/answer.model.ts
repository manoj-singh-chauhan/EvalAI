import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";

interface AnswerSheetAttributes {
  id: number;
  questionPaperId: number;
  answerSheetFiles: any | null;
  answers: any | null;
  /*
    [
      {
        questionNumber: 1,
        questionText: "...",
        studentAnswer: "... long text ...",
        score: 4,
        maxScore: 5,
        feedback: "Good explanation, missing diagram."
      }
    ]
  */

  totalScore?: number | null;
  feedback?: string | null;

  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string | null;
}

interface AnswerSheetCreation
  extends Optional<
    AnswerSheetAttributes,
    | "id"
    | "answers"
    | "answerSheetFiles"
    | "totalScore"
    | "feedback"
    | "status"
    | "errorMessage"
  > {}

export class AnswerSheet
  extends Model<AnswerSheetAttributes, AnswerSheetCreation>
  implements AnswerSheetAttributes
{
  public id!: number;
  public questionPaperId!: number;

  public answerSheetFiles!: any | null;
  public answers!: any | null;

  public totalScore!: number | null;
  public feedback!: string | null;

  public status!: "pending" | "processing" | "completed" | "failed";
  public errorMessage!: string | null;
}

AnswerSheet.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    questionPaperId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    answerSheetFiles: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    answers: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    totalScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
      defaultValue: "pending",
    },

    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "AnswerSheet",
    tableName: "answer_sheets",
    timestamps: true,
    indexes: [
      { fields: ["questionPaperId"] },
      { fields: ["status"] },
    ],
  }
);

export default AnswerSheet;