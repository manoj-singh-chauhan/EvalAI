import Razorpay from "razorpay";
import crypto from "crypto";
import { CreditsService } from "./credits.service";
import Transaction from "./transaction.model";
import { Order } from "../subscription_plan/order.model";
import { ActivityService } from "../activity/activity.service";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const PLANS: any = {
  pro_monthly: {
    name: "Pro Monthly",
    price: 1,
    duration: 30,
    // durationMinutesTest: 5
  },
  pro_yearly: {
    name: "Pro Yearly",
    price: 3999,
    duration: 365,
    // durationMinutesTest: 5
  },
};

export class BillingService {
  static async createOrder(userId: string, planCode: string) {
    const plan = PLANS[planCode];

    if (!plan) {
      throw new Error(`Invalid plan selected: ${planCode}`);
    }

    const rpOrder = await razorpay.orders.create({
      amount: plan.price * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });
    
    await Order.create({
      userId,
      planId: planCode,
      razorpayOrderId: rpOrder.id,
      amount: plan.price,
      status: "pending",
    });

    return { ...rpOrder, key: process.env.RAZORPAY_KEY_ID };
  }

  static async verifyAndAddCredits(payload: any, userId: string) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      payload;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Payment verification failed");
    }

    await this.processSuccessfulOrder(razorpay_order_id);

    return { success: true };
  }

  static async processSuccessfulOrder(orderId: string) {
    const order = await Order.findOne({ where: { razorpayOrderId: orderId } });

    if (!order || order.status === "paid") return;

    const plan = PLANS[order.planId];
    const userId = order.userId;

    const credits = await CreditsService.getOrCreate(userId);
    credits.plan = "pro";

    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(now.getDate() + plan.duration);
    credits.planExpiresAt = expiryDate;


    await credits.save();

    await order.update({ status: "paid" });

    await ActivityService.log(userId, {
      type: "PAYMENT",
      status: "success",
      title: "Plan Upgraded",
      description: `Success! You have been upgraded to the ${plan.name} plan.`,
      linkId: orderId,
    });

    await Transaction.create({
      userId,
      type: "purchase",
      creditsChanged: 0,
      description: `Purchased ${plan.name} (Verified via Webhook)`,
    });
  }
}
