import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";

interface QuestionPaperAttributes {
  id: number;
  mode: "typed" | "upload";
  fileUrl?: string | null;
  rawText?: string | null;

  questions: any | null;
  totalMarks?: number | null;

  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string | null;
}

interface QuestionPaperCreation
  extends Optional<
    QuestionPaperAttributes,
    | "id"
    | "fileUrl"
    | "rawText"
    | "questions"
    | "totalMarks"
    | "status"
    | "errorMessage"
  > {}

export class QuestionPaper
  extends Model<QuestionPaperAttributes, QuestionPaperCreation>
  implements QuestionPaperAttributes
{
  public id!: number;
  public mode!: "typed" | "upload";
  public fileUrl?: string | null;
  public rawText?: string | null;

  public questions!: any | null;
  public totalMarks?: number | null;

  public status!: "pending" | "processing" | "completed" | "failed";
  public errorMessage?: string | null;
}

QuestionPaper.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    mode: {
      type: DataTypes.ENUM("typed", "upload"),
      allowNull: false,
    },

    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    rawText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    questions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    totalMarks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    modelName: "QuestionPaper",
    tableName: "question_papers",
    timestamps: true,
  }
);

export default QuestionPaper;