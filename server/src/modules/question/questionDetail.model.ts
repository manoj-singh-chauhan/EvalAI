import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";
import QuestionPaper from "./question.model";

export class Question extends Model {
  public id!: string;
  public questionPaperId!: string;
  public number!: number;
  public text!: string;
  public marks!: number | null;
  public flagged!: boolean;
}

Question.init(
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

    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    marks: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    flagged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "questions",
    timestamps: true,
  }
);

QuestionPaper.hasMany(Question, {
  foreignKey: "questionPaperId",
  as: "questions", 
  onDelete: "CASCADE",
});


Question.belongsTo(QuestionPaper, {
  foreignKey: "questionPaperId",
});

export default Question;
