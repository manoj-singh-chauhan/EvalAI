import { Transaction as SequelizeTransaction } from "sequelize";
import { sequelize } from "../../config/db";
import UserCredits from "./userCredits.model";
import Transaction from "./transaction.model";
import { ActivityService } from "../activity/activity.service";

const SIGNUP_BONUS = 50;
const FREE_DAILY_LIMIT = 25;
const PRO_DAILY_LIMIT = 500;

export class CreditsService {
  static async getOrCreate(userId: string, t?: SequelizeTransaction) {
    let credits = await UserCredits.findOne({
      where: { userId },
      transaction: t,
      lock: t ? SequelizeTransaction.LOCK.UPDATE : undefined,
    });

    if (!credits) {
      credits = await UserCredits.create(
        {
          userId,
          credits: SIGNUP_BONUS,
          plan: "free",
          lastRefillAt: new Date(),
          planExpiresAt: null,
        },
        { transaction: t },
      );

      await Transaction.create(
        {
          userId,
          type: "free",
          creditsChanged: SIGNUP_BONUS,
          description: "Welcome Bonus",
        },
        { transaction: t },
      );
      await ActivityService.log(userId, {
        type: "SYSTEM",
        status: "success",
        title: "Welcome Bonus!",
        description: `You've received ${SIGNUP_BONUS} credits to start evaluating papers. Welcome to AI Eval!`,
      });
    }
    return credits;
  }

  static async refillDailyCredits(userId: string, t?: SequelizeTransaction) {
    const credits = await this.getOrCreate(userId, t);
    if (credits.plan === "pro" && credits.planExpiresAt) {
      const now = new Date();
      const expiryDate = new Date(credits.planExpiresAt);
      if (now > expiryDate) {
        credits.plan = "free";
        credits.planExpiresAt = null;
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (credits.lastRefillAt) {
      const last = new Date(credits.lastRefillAt);
      last.setHours(0, 0, 0, 0);
      if (last.getTime() === today.getTime()) {
        return credits;
      }
    }

    let dailyLimit = FREE_DAILY_LIMIT;
    if (credits.plan === "pro") {
      dailyLimit = PRO_DAILY_LIMIT;
    }

    let creditsAdded = 0;

    if (credits.credits < dailyLimit) {
      creditsAdded = dailyLimit - credits.credits;
      credits.credits = dailyLimit;
    }

    credits.lastRefillAt = new Date();
    await credits.save({ transaction: t });

    if (creditsAdded > 0) {
      await Transaction.create(
        {
          userId,
          type: "free",
          creditsChanged: creditsAdded,
          description: "Daily Refill (Reset)",
        },
        { transaction: t },
      );
      await ActivityService.log(userId, {
        type: "SYSTEM",
        status: "info",
        title: "Daily Credits Refilled",
        description: `Your daily credits have been reset to ${dailyLimit}. Happy evaluating!`,
      });
    }

    return credits;
  }

  static async getBalance(userId: string) {
    await this.refillDailyCredits(userId);

    const credits = await UserCredits.findOne({ where: { userId } });

    if (!credits) {
      return { credits: 0, plan: "free" };
    }

    if (
      credits.plan === "pro" &&
      credits.planExpiresAt &&
      new Date(credits.planExpiresAt) < new Date()
    ) {
      credits.plan = "free";
      credits.planExpiresAt = null;
      await credits.save();
    }

    return {
      credits: credits.credits,
      plan: credits.plan,
      planExpiresAt: credits.planExpiresAt,
    };
  }

  static async deductExact(
    userId: string,
    amountToDeduct: number,
    note: string = "AI Usage",
  ) {
    return sequelize.transaction(async (t) => {
      const credits = await UserCredits.findOne({
        where: { userId },
        transaction: t,
        lock: SequelizeTransaction.LOCK.UPDATE,
      });

      if (!credits) return;

      credits.credits -= amountToDeduct;
      await credits.save({ transaction: t });

      await Transaction.create(
        {
          userId,
          type: "use",
          creditsChanged: -amountToDeduct,
          description: note,
        },
        { transaction: t },
      );
    });
  }
}
