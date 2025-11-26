import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";
import AnswerSheet from "./answer.model";

class AnswerSheetFile extends Model {}

AnswerSheetFile.init(
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

    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    fileType: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    sequelize,
    tableName: "answer_sheet_files",
    timestamps: true,
  }
);


AnswerSheet.hasMany(AnswerSheetFile, {
  foreignKey: "answerSheetId",
  as: "files",
  onDelete: "CASCADE",
});

AnswerSheetFile.belongsTo(AnswerSheet, {
  foreignKey: "answerSheetId",
});

export default AnswerSheetFile;
