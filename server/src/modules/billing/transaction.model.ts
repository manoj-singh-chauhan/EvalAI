import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";

class Transaction extends Model {
  public id!: string;
  public userId!: string;
  public type!: "free" | "use" | "purchase";
  public creditsChanged!: number;
  public readonly createdAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("free", "use", "purchase"),
      allowNull: false,
    },

    creditsChanged: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "credit_transactions",
    timestamps: true,
    updatedAt: false,
  }
);

export default Transaction;
