import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";

export class Plan extends Model {
  public id!: string;
  public code!: string;
  public name!: string;
  public price!: number;
  public duration!: number;
}

Plan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: "plans", timestamps: true },
);
