import { Transaction as SequelizeTransaction } from "sequelize";
import { sequelize } from "../../config/db";
import UserCredits from "./userCredits.model";
import Transaction from "./transaction.model";

const FREE_CREDITS = 10;

export class CreditsService {
  static async getOrCreate(userId: string, t?: SequelizeTransaction) {
    let credits = await UserCredits.findOne({
      where: { userId },
      transaction: t,
      lock: t ? t.LOCK.UPDATE : undefined,
    });

    if (!credits) {
      credits = await UserCredits.create(
        {
          userId,
          credits: FREE_CREDITS,
          plan: "free",
          lastRefillAt: new Date(),
        },
        { transaction: t }
      );

      await Transaction.create(
        {
          userId,
          type: "free",
          creditsChanged: FREE_CREDITS,
        },
        { transaction: t }
      );
    }

    return credits;
  }


  static async requireAndDeduct(
    userId: string,
    requiredCredits: number
  ): Promise<UserCredits> {
    return sequelize.transaction(async (t) => {
      const credits = await this.getOrCreate(userId, t);

      if (credits.credits < requiredCredits) {
        throw new Error("Insufficient credits");
      }

      credits.credits -= requiredCredits;
      await credits.save({ transaction: t });

      await Transaction.create(
        {
          userId,
          type: "use",
          creditsChanged: -requiredCredits,
        },
        { transaction: t }
      );

      return credits;
    });
  }

  
  static async getBalance(userId: string) {
    const credits = await this.getOrCreate(userId);
    return {
      credits: credits.credits,
      plan: credits.plan,
    };
  }
}
