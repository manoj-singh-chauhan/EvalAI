import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";

interface AnswerSheetAttributes {
  id: number;
  questionPaperId: number;
  fileUrl: string | null;
  extractedText: string;
  evaluationResult: any | null;
  marksAwarded: number;
}

interface AnswerSheetCreation
  extends Optional<
    AnswerSheetAttributes,
    "id" | "fileUrl" | "evaluationResult" | "marksAwarded"
  > {}

export class AnswerSheet
  extends Model<AnswerSheetAttributes, AnswerSheetCreation>
  implements AnswerSheetAttributes
{
  public id!: number;
  public questionPaperId!: number;
  public fileUrl!: string | null;
  public extractedText!: string;
  public evaluationResult!: any | null;
  public marksAwarded!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      references: {
        model: "question_papers",
        key: "id",
      },
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    extractedText: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    evaluationResult: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    marksAwarded: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "AnswerSheet",
    tableName: "answer_sheets",
    timestamps: true,
  }
);

// QuestionPaper.hasMany(AnswerSheet, { foreignKey: 'questionPaperId' });
// AnswerSheet.belongsTo(QuestionPaper, { foreignKey: 'questionPaperId' });

export default AnswerSheet;
