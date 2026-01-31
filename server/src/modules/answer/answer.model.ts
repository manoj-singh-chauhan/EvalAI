import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";

interface AnswerSheetAttributes {
  id: string;
  questionPaperId: string;
  strictnessLevel?: "lenient" | "moderate" | "strict";

  totalScore?: number | null;
  feedback?: string | null;

  status: "pending" | "processing" | "completed" | "failed";
   createdBy: string;
  errorMessage?: string | null;
}

interface AnswerSheetCreation
  extends Optional<
    AnswerSheetAttributes,
    "id" | "totalScore" | "feedback" | "status" | "errorMessage"
  > {}

export class AnswerSheet
  extends Model<AnswerSheetAttributes, AnswerSheetCreation>
  implements AnswerSheetAttributes
{
  public id!: string;
  public questionPaperId!: string;
  public strictnessLevel!: "lenient" | "moderate" | "strict";

  public totalScore!: number | null;
  public feedback!: string | null;

  public status!: "pending" | "processing" | "completed" | "failed";
   public createdBy!: string;
  public errorMessage!: string | null;
  files: any;
  evaluatedAnswers: any;
}

AnswerSheet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    questionPaperId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    strictnessLevel: {
    type: DataTypes.ENUM("lenient", "moderate", "strict"),
    allowNull: false,
    defaultValue: "moderate",
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

    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "answer_sheets",
    timestamps: true,
  }
);

export default AnswerSheet;
