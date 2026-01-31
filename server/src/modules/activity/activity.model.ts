import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";

export class Activity extends Model {
  public id!: string;
  public userId!: string;
  public type!: "SUBMISSION" | "EVALUATION" | "PAYMENT" | "SYSTEM";
  public status!: "success" | "failed" | "processing" | "info";
  public title!: string;
  public description!: string;
  public linkId?: string;
}

Activity.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    type: {
      type: DataTypes.ENUM("SUBMISSION", "EVALUATION", "PAYMENT", "SYSTEM"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("success", "failed", "processing", "info"),
      defaultValue: "info",
    },
    title: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    description: { 
        type: DataTypes.TEXT 
    },
    linkId: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
  },
  { sequelize, modelName: "activity", tableName: "activities" },
);
