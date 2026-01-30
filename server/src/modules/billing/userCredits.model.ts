import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";

export type UserPlan = "free" | "pro";

interface UserCreditsAttributes {
  id: string;
  userId: string;         
  credits: number;
  plan: UserPlan;
  lastRefillAt: Date | null;
  planExpiresAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreditsCreationAttributes
  extends Optional<UserCreditsAttributes, "id" | "credits" | "plan" | "lastRefillAt"> {}

class UserCredits
  extends Model<UserCreditsAttributes, UserCreditsCreationAttributes>
  implements UserCreditsAttributes
{
  public id!: string;
  public userId!: string;
  public credits!: number;
  public plan!: UserPlan;
  public lastRefillAt!: Date | null;
  public planExpiresAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserCredits.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    plan: {
      type: DataTypes.ENUM("free", "pro"),
      allowNull: false,
      defaultValue: "free",
    },

    lastRefillAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    planExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true, // Null means full time Free
    },
  },
  {
    sequelize,
    tableName: "user_credits",
    timestamps: true,
  }
);

export default UserCredits;
