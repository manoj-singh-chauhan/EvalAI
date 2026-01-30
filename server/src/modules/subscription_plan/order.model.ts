import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";

export class Order extends Model {
  public id!: string;
  public userId!: string;
  public planId!: string;
  public razorpayOrderId!: string;
  public amount!: number;
  public status!: string;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.STRING, allowNull: false },
    planId: { type: DataTypes.STRING, allowNull: false },

    razorpayOrderId: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "pending" },
  },
  { sequelize, tableName: "orders", timestamps: true },
);
