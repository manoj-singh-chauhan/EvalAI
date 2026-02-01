import { Request, Response } from "express";
import { BillingService } from "./billing.service";
import { CreditsService } from "./credits.service";
import crypto from "crypto";
import logger from "../../config/logger";


export class BillingController {
  static async getMe(req: Request, res: Response) {
    try {
      const userId = req.auth?.sub;
      if (!userId) {
        return res.status(401).json({ success: false });
      }

      const data = await CreditsService.getBalance(userId);

      return res.json({
        success: true,
        plan: data.plan,
        credits: data.credits,
        expiresAt: data.planExpiresAt,
      });
    } catch (err: any) {
      logger.error({ err }, "Billing getMe error");
      return res.status(500).json({
        success: false,
        message: "Failed to load billing info",
      });
    }
  }

  static async createOrder(req: Request, res: Response) {
    try {
      const userId = req.auth?.sub;

      const { planCode } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false });
      }
      if (!planCode) {
        return res.status(400).json({
          success: false,
          message: "Plan selection is required.",
        });
      }

      const order = await BillingService.createOrder(userId, planCode);

      return res.json({ success: true, order });
    } catch (err: any) {
      logger.error({ err }, "Create order error");
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to create order",
      });
    }
  }
  static async verifyPayment(req: Request, res: Response) {
    const userId = req.auth?.sub;
    if (!userId) return res.status(401).json({ success: false });

    try {
      const credits = await BillingService.verifyAndAddCredits(
        req.body,
        userId,
      );
      res.json({ success: true, credits });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    console.log("hook");
    try {
      const signature = req.headers["x-razorpay-signature"];
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

      if (!signature || !secret) {
        return res.status(400).json({ message: "Signature or Secret missing" });
      }

  
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.body)
        .digest("hex");

      if (signature !== expectedSignature) {
        return res.status(400).send("Invalid signature");
      }

      const event = JSON.parse(req.body.toString());

      if (event.event === "payment.captured") {
        const razorpayOrderId = event.payload.payment.entity.order_id;
        await BillingService.processSuccessfulOrder(razorpayOrderId);
      }

      return res.status(200).json({ status: "ok" });
    } catch (err: any) {
      logger.error({ err }, "Billing webhook error");
      return res.status(500).send("Error");
    }
  }
}
