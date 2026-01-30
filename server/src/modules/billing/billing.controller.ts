import { Request, Response } from "express";
import { BillingService } from "./billing.service";
import { CreditsService } from "./credits.service";
import crypto from "crypto";

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
      console.error("Billing getMe error:", err);
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
      console.error("Create order error:", err.message);
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
    try {
      const signature = req.headers["x-razorpay-signature"];
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET; // .env mein ye hona chahiye

      if (!signature || !secret) {
        return res.status(400).json({ message: "Signature or Secret missing" });
      }

      // 1. Verify karein ki ye call Razorpay ne hi bheji hai
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.body) // Ye Raw Body buffer hai (app.ts ki wajah se)
        .digest("hex");

      if (signature !== expectedSignature) {
        return res.status(400).send("Invalid signature");
      }

      // 2. Data ko parse karein
      const event = JSON.parse(req.body.toString());

      // 3. Agar payment success hai, toh subscription active karein
      if (event.event === "payment.captured") {
        const razorpayOrderId = event.payload.payment.entity.order_id;

        // Hum direct Service ka function call karenge
        await BillingService.processSuccessfulOrder(razorpayOrderId);
      }

      // 4. Razorpay ko batayein ki humein mil gaya data
      return res.status(200).json({ status: "ok" });
    } catch (err: any) {
      console.error("Webhook Error:", err.message);
      return res.status(500).send("Error");
    }
  }
}
