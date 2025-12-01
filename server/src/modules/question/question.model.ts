import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";

interface QuestionPaperAttributes {
  id: string;
  mode: "typed" | "upload";
  fileUrl?: string | null;
  fileMimeType?: string | null;
  rawText?: string | null;

  totalMarks?: number | null;

  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string | null;
}

interface QuestionPaperCreation
  extends Optional<
    QuestionPaperAttributes,
    "id" | "fileUrl" | "fileMimeType" | "rawText" | "totalMarks" | "status" | "errorMessage"
  > {}

export class QuestionPaper
  extends Model<QuestionPaperAttributes, QuestionPaperCreation>
  implements QuestionPaperAttributes
{
  public id!: string;
  public mode!: "typed" | "upload";
  public fileUrl?: string | null;
  public fileMimeType?: string | null;
  public rawText?: string | null;
  public totalMarks?: number | null;
  public status!: "pending" | "processing" | "completed" | "failed";
  public errorMessage?: string | null;
  questions: any;
  createdAt: any;
}

QuestionPaper.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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

    fileMimeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    rawText: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "question_papers",
    timestamps: true,
  }
);

export default QuestionPaper;
